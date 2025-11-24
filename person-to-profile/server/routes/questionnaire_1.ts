import { json, getBody } from "../utils/utils";
import { getDb } from "../utils/db";

export const listIdeas = async (_req: Request, env: any) => {
  const db = await getDb(env);
  const ideas = await db.prepare(
    `SELECT * FROM ideas ORDER BY created_at DESC`
  ).all();

  return json(ideas.results);
};

export const submitIdea = async (request: Request, env: any) => {
  const { username, idea } = await getBody(request);
  const db = await getDb(env);

  await db.prepare(
    `INSERT INTO ideas (username, idea, created_at)
     VALUES (?, ?, datetime('now'))`
  ).bind(username, idea).run();

  return json({ ok: true });
};
