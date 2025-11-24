import { json } from "../utils/utils";

export const ping = async () => json({ ok: true, status: "pong" });
