import { json } from "../utils/utils";

export const ping = async () => json({ status: "pong" });
