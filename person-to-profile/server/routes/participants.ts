import { getBody, json } from "../utils/utils";
import { getDb } from "../utils/db";
import { validateTurnstile } from "../utils/turnstile";

const getInsertedId = (result: any) =>
  result?.meta?.last_row_id ??
  result?.meta?.lastInsertRowid ??
  result?.meta?.last_insert_rowid;

export const createParticipant = async (req: Request, env: any) => {
  const body = await getBody(req);
  const token =
    (typeof body?.turnstileToken === "string" && body.turnstileToken) ||
    (typeof body?.token === "string" && body.token) ||
    (typeof body?.["cf-turnstile-response"] === "string" &&
      body["cf-turnstile-response"]);

  if (!token) {
    return json({ error: "Missing Turnstile verification token" }, 400);
  }

  const ipHeader =
    req.headers.get("CF-Connecting-IP") || req.headers.get("X-Forwarded-For");
  const remoteIp = ipHeader?.split(",")[0]?.trim() || null;
  const validation = await validateTurnstile(token, remoteIp);

  if (!validation?.success) {
    return json(
      {
        error: "Turnstile verification failed",
        details: validation?.["error-codes"] ?? [],
      },
      400
    );
  }

  const db = await getDb(env);
  const result = await db
    .prepare(`INSERT INTO participants DEFAULT VALUES`)
    .run();
  const participantId = getInsertedId(result);

  if (!participantId) {
    return json({ error: "Could not create participant" }, 500);
  }

  return json({ participantId: String(participantId) });
};
