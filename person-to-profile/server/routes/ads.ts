import { json, getBody } from "../utils/utils";
import { getDb } from "../utils/db";

export const saveAdsShown = async (request: Request, env: any) => {
  const body = await getBody(request);
  const participantId = Number(body?.participantId);
  const adIds = Array.isArray(body?.adIds) ? body.adIds : [];

  if (!participantId) {
    return json({ error: "participantId is required" }, 400);
  }

  if (!adIds.length) {
    return json({ error: "adIds must be a non-empty array" }, 400);
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
      `INSERT INTO ads_shown (participant_id, ad_ids)
       VALUES (?, ?)
       ON CONFLICT(participant_id) DO UPDATE SET
         ad_ids=excluded.ad_ids`
    )
    .bind(participantId, adIds.join(","))
    .run();

  return json({ ok: true, participantId: participantId.toString(), adIds });
};
