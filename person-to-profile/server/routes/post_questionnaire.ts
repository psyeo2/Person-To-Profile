import { json, getBody } from "../utils/utils";
import { getDb } from "../utils/db";

export const savePostSurvey = async (request: Request, env: any) => {
  const body = await getBody(request);
  const participantId = Number(body?.participantId);

  if (!participantId) {
    return json({ error: "participantId is required" }, 400);
  }

  const requiredFields = [
    "relevance",
    "favouriteAd",
    "consideration",
    "recall",
    "takeaway",
  ] as const;

  for (const field of requiredFields) {
    if (
      body[field] === undefined ||
      body[field] === null ||
      String(body[field]).trim() === ""
    ) {
      return json({ error: `Field '${field}' is required` }, 400);
    }
  }

  const db = await getDb(env);

  const participant = await db
    .prepare(`SELECT participant_id FROM participants WHERE participant_id = ?`)
    .bind(participantId)
    .first();

  if (!participant) {
    return json({ error: "Unknown participant" }, 404);
  }

  await db
    .prepare(
      `INSERT INTO post_questionnaire (
        participant_id,
        relevance,
        favourite_ad,
        consideration,
        recall,
        takeaway
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(participant_id) DO UPDATE SET
        relevance=excluded.relevance,
        favourite_ad=excluded.favourite_ad,
        consideration=excluded.consideration,
        recall=excluded.recall,
        takeaway=excluded.takeaway`
    )
    .bind(
      participantId,
      Number(body.relevance),
      String(body.favouriteAd),
      Number(body.consideration),
      Number(body.recall),
      String(body.takeaway)
    )
    .run();

  return json({ ok: true, participantId: participantId.toString() });
};
