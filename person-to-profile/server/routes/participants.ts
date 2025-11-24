import { json } from "../utils/utils";
import { getDb } from "../utils/db";

const getInsertedId = (result: any) =>
  result?.meta?.last_row_id ??
  result?.meta?.lastInsertRowid ??
  result?.meta?.last_insert_rowid;

export const createParticipant = async (_req: Request, env: any) => {
  const db = await getDb(env);
  const result = await db.prepare(`INSERT INTO participants DEFAULT VALUES`).run();
  const participantId = getInsertedId(result);

  if (!participantId) {
    return json({ error: "Could not create participant" }, 500);
  }

  return json({ participantId: String(participantId) });
};
