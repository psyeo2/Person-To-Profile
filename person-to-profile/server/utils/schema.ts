const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS participants (
    participant_id INTEGER PRIMARY KEY AUTOINCREMENT
  );`,

  `CREATE TABLE IF NOT EXISTS pre_questionnaire (
    participant_id INTEGER PRIMARY KEY,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    ethnicity TEXT NOT NULL,
    occupation TEXT NOT NULL,
    postcode TEXT NOT NULL,
    income TEXT NOT NULL,
    education TEXT NOT NULL,
    ad_frequency INTEGER NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES participants(participant_id)
  );`,

  `CREATE TABLE IF NOT EXISTS post_questionnaire (
    participant_id INTEGER PRIMARY KEY,
    relevance INTEGER NOT NULL,
    favourite_ad TEXT NOT NULL,
    consideration INTEGER NOT NULL,
    recall INTEGER NOT NULL,
    takeaway TEXT NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES participants(participant_id)
  );`,

  `CREATE TABLE IF NOT EXISTS ads_shown (
    participant_id INTEGER PRIMARY KEY,
    ad_ids TEXT NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES participants(participant_id)
  );`,
];

export const ensureSchema = async (db: any) => {
  for (const sql of schemaStatements) {
    await db.prepare(sql).run();
  }
};
