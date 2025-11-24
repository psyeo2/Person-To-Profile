import { json, getBody } from "../utils/utils";
import { getDb } from "../utils/db";

export const savePreSurvey = async (request: Request, env: any) => {
  const body = await getBody(request);
  const participantId = Number(body?.participantId);

  if (!participantId) {
    return json({ error: "participantId is required" }, 400);
  }

  const requiredFields = [
    "age",
    "gender",
    "ethnicity",
    "occupation",
    "postcode",
    "income",
    "education",
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
      `INSERT INTO pre_questionnaire (
        participant_id,
        age,
        gender,
        ethnicity,
        occupation,
        postcode,
        income,
        education,
        ad_frequency
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(participant_id) DO UPDATE SET
        age=excluded.age,
        gender=excluded.gender,
        ethnicity=excluded.ethnicity,
        occupation=excluded.occupation,
        postcode=excluded.postcode,
        income=excluded.income,
        education=excluded.education,
        ad_frequency=excluded.ad_frequency`
    )
    .bind(
      participantId,
      Number(body.age),
      String(body.gender),
      String(body.ethnicity),
      String(body.occupation),
      String(body.postcode),
      String(body.income),
      String(body.education),
      Number(body.adFrequency ?? 0)
    )
    .run();

  return json({ ok: true, participantId: participantId.toString() });
};
