import { json, getBody } from "../utils/utils";
import { getDb } from "../utils/db";
import { validateTurnstile } from "../utils/turnstile";

type LeaderRow = {
  username: string;
  score: number;
  rank: number;
};

const sanitizeUsername = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 64);
};

const sanitizeMetric = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  const normalized = trimmed.replace(/[^a-z0-9_-]/g, "");
  if (!normalized) return null;
  return normalized.slice(0, 64);
};

const sanitizeAmount = (value: unknown): number => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1;
  const whole = Math.trunc(numeric);
  return Math.min(25, Math.max(1, whole));
};

const getRequestedUsername = (payloadOrUrl: URL | Record<string, unknown>) => {
  if (payloadOrUrl instanceof URL) {
    return sanitizeUsername(payloadOrUrl.searchParams.get("username"));
  }
  return sanitizeUsername(
    payloadOrUrl.username ??
      (payloadOrUrl as Record<string, unknown>).user ??
      (payloadOrUrl as Record<string, unknown>).identity
  );
};

export const incrementScore = async (
  metric: string,
  amount: number,
  username: string,
  env: any
) => {
  try {
    amount = 1;
    const db = await getDb(env);
    const user = await db
      .prepare(`SELECT id, username FROM users WHERE username = ?`)
      .bind(username)
      .first();

    if (!user) {
      return json(
        { error: "User not found. Please register or log in first." },
        404
      );
    }

    const userId = Number(user.id);

    await db
      .prepare(
        `INSERT INTO scoreboard (user_id, metric, score)
         VALUES (?, ?, 0)
         ON CONFLICT(user_id, metric) DO NOTHING`
      )
      .bind(userId, metric)
      .run();

    //
    // 2️⃣ Always increment afterwards — guaranteed correct
    //
    await db
      .prepare(
        `UPDATE scoreboard
         SET score = score + ?
         WHERE user_id = ? AND metric = ?`
      )
      .bind(amount, userId, metric)
      .run();

    //
    // 3️⃣ Return the updated row
    //
    const row = await db
      .prepare(
        `SELECT s.metric,
                s.score,
                s.user_id as userId,
                u.username
         FROM scoreboard s
         JOIN users u ON u.id = s.user_id
         WHERE s.user_id = ? AND s.metric = ?`
      )
      .bind(userId, metric)
      .first();

    return json(
      {
        userId: row?.userId ?? userId,
        username: row?.username ?? username,
        metric: row?.metric ?? metric,
        score: row?.score ?? amount,
      },
      200
    );
  } catch (error) {
    console.error("Scoreboard increment failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    return json(
      {
        error: "Unable to update the scoreboard right now.",
        details: message,
      },
      500
    );
  }
};

export const secureIncrementScore = async (request: Request, env: any) => {
  console.log("[scoreboard.ts] secureIncrementScore called");
  // 1. Session cookie (safe, HttpOnly, SameSite=Lax)
  // const { sessionId, newCookie } = getOrSetSession(request);

  // 2. Parse body
  const payload = await getBody(request);
  const metric = sanitizeMetric(payload.metric);
  const amount = sanitizeAmount(payload.amount ?? 1);
  const username = getRequestedUsername(payload);
  const token = payload.token;

  if (!metric) {
    return json({ error: "A metric name is required." }, 400);
  }
  if (!username) {
    return json({ error: "A username is required to record the score." }, 400);
  }

  if (!token) {
    return new Response("Missing Turnstile token", { status: 400 });
  }

  // 3. Get client IP from Cloudflare headers
  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For") ||
    null;

  // 4. Validate Turnstile
  const ts = await validateTurnstile(token, ip);

  if (!ts) {
    console.error("Turnstile validation returned no result");
    return new Response("Verification error", { status: 500 });
  }

  if (!ts.success) {
    console.warn("Turnstile failed:", ts["error-codes"]);
    return new Response("Verification failed", { status: 403 });
  }

  // 5. Optional hostname validation
  // if (ts.hostname && ts.hostname !== "impact-christmas.eoinoneill.co.uk") {
  //   console.warn("Turnstile hostname mismatch:", ts.hostname);
  //   return new Response("Hostname mismatch", { status: 403 });
  // }

  // 6. Optional: Token freshness check
  const challengeAge =
    (Date.now() -
      new Date(ts.challenge_ts || new Date().toISOString()).getTime()) /
    1000;
  if (challengeAge > 240) {
    console.warn(`Turnstile token is old (${challengeAge}s)`);
  }

  // 7. Optional per-session rate limit
  // await rateLimit(sessionId, env);

  // 8. Run the real scoreboard handler
  const result = await incrementScore(metric, amount, username, env);

  // 9. Preserve the Set-Cookie header from session
  return result;
  // return new Response(result.body, {
  //   status: result.status,
  //   headers: {
  //     "Content-Type": "application/json",
  //     ...(newCookie ? { "Set-Cookie": newCookie } : {}),
  //   },
  // });
};

export const listScoreboard = async (request: Request, env: any) => {
  try {
    const url = new URL(request.url);
    const requestedUsername = getRequestedUsername(url);
    const db = await getDb(env);
    const results = await db
      .prepare(
        `SELECT s.metric,
                u.username,
                s.score,
                ROW_NUMBER() OVER (
                  PARTITION BY s.metric
                  ORDER BY s.score DESC, u.username ASC
                ) as rank
         FROM scoreboard s
         JOIN users u ON u.id = s.user_id
         ORDER BY s.metric, rank`
      )
      .all();

    const metrics = new Map<
      string,
      { leaders: LeaderRow[]; currentUser?: LeaderRow; total: number }
    >();

    for (const row of results.results || []) {
      const metric = String(row.metric);
      const username = String(row.username);
      const score = Number(row.score ?? 0);
      const rank = Number(row.rank ?? 0);
      const entry: LeaderRow = { username, score, rank };
      let metricBucket = metrics.get(metric);
      if (!metricBucket) {
        metricBucket = { leaders: [], currentUser: undefined, total: 0 };
        metrics.set(metric, metricBucket);
      }
      metricBucket.total += 1;
      if (rank <= 10) metricBucket.leaders.push(entry);

      if (
        requestedUsername &&
        username.toLowerCase() === requestedUsername.toLowerCase()
      ) {
        metricBucket.currentUser = entry;
      }
    }

    const payload = Array.from(metrics.entries()).map(([metric, bucket]) => {
      const leaders = bucket.leaders.map((leader) => ({
        ...leader,
        isCurrentUser:
          requestedUsername &&
          leader.username.toLowerCase() === requestedUsername.toLowerCase(),
      }));
      const currentUser =
        bucket.currentUser &&
        !leaders.some(
          (l) =>
            l.username.toLowerCase() ===
            bucket.currentUser!.username.toLowerCase()
        )
          ? bucket.currentUser
          : undefined;

      return {
        metric,
        totalPlayers: bucket.total,
        leaders,
        currentUser,
      };
    });

    return json({ metrics: payload });
  } catch (error) {
    console.error("Scoreboard listing failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    return json(
      {
        error: "Unable to retrieve leaderboards right now.",
        details: message,
      },
      500
    );
  }
};
