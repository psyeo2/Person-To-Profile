const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS participants (
    participant_id INTEGER PRIMARY KEY AUTOINCREMENT
  );`,

  `CREATE TABLE IF NOT EXISTS q_aire1 (
    participant_id INTEGER PRIMARY KEY,
    q1 INTEGER NOT NULL,
    q2 INTEGER NOT NULL,
    q3 INTEGER NOT NULL,
    q4 INTEGER NOT NULL,
    q5 INTEGER NOT NULL,
    q6 INTEGER NOT NULL,
    q7 INTEGER NOT NULL,
    q8 INTEGER NOT NULL,
    q9 INTEGER NOT NULL,
    q10 INTEGER NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES participants(participant_id)
  );`,

  `CREATE TABLE IF NOT EXISTS q_aire2 (
    participant_id INTEGER PRIMARY KEY,
    q1 INTEGER NOT NULL,
    q2 INTEGER NOT NULL,
    q3 INTEGER NOT NULL,
    q4 INTEGER NOT NULL,
    q5 INTEGER NOT NULL,
    q6 INTEGER NOT NULL,
    q7 INTEGER NOT NULL,
    q8 INTEGER NOT NULL,
    q9 INTEGER NOT NULL,
    q10 INTEGER NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES participants(participant_id)
  );`,
];

export const ensureSchema = async (db: any) => {
  for (const sql of schemaStatements) {
    await db.prepare(sql).run();
  }
};
