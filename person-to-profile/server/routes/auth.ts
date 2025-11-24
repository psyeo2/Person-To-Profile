import { json, getBody } from "../utils/utils";
import { getDb } from "../utils/db";

const generateToken = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
};

export const register = async (request: Request, env: any) => {
  const payload = await getBody(request);
  const username =
    typeof payload.username === "string" ? payload.username.trim() : "";
  const password =
    typeof payload.password === "string" ? payload.password : "";

  const db = await getDb(env);

  if (!username || !password) {
    return json(
      { error: "Please provide both a username and a password." },
      400,
    );
  }

  const existing = await db.prepare(
    "SELECT id FROM users WHERE username = ?",
  )
    .bind(username)
    .first();

  if (existing) {
    return json({ error: "Username already exists" }, 409);
  }

  try {
    await db.prepare(
      `INSERT INTO users (username, password)
       VALUES (?, ?)`,
    )
      .bind(username, password)
      .run();

    const user = await db.prepare(
      `SELECT id, username, created_at
       FROM users
       WHERE username = ?`,
    )
      .bind(username)
      .first();

    return json(
      {
        user,
        token: generateToken(),
        message: "Registration complete! Use your shiny new credentials.",
      },
      201,
    );
  } catch (error) {
    console.error("Registration failed", error);
    return json({ error: "Unable to register right now." }, 500);
  }
};

export const login = async (request: Request, env: any) => {
  const payload = await getBody(request);
  const username =
    typeof payload.username === "string" ? payload.username.trim() : "";
  const password =
    typeof payload.password === "string" ? payload.password : "";

  const db = await getDb(env);

  if (!username || !password) {
    return json(
      { error: "Please provide both a username and a password." },
      400,
    );
  }

  const user = await db.prepare(
    `SELECT id, username, created_at
     FROM users
     WHERE username = ? AND password = ?`,
  )
    .bind(username, password)
    .first();

  if (!user) return json({ error: "Invalid credentials" }, 401);

  return json({
    user,
    token: generateToken(),
    message: `Welcome back, ${user.username}!`,
  });
};
