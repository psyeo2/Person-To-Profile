import { ensureSchema } from "./schema";

let schemaReady = false;

export const getDb = async (env: Record<string, any>) => {
  const db =
    env.d1_databases ??
    env.DB ??
    env.ptp_db ??
    env.PTP_DB ??
    env.PTPDB ??
    env.PtpDb;

  if (!db) {
    throw new Error("D1 binding is missing. Check your wrangler d1_databases config.");
  }
  if (!schemaReady) {
    await ensureSchema(db);
    schemaReady = true;
  }
  return db;
};
