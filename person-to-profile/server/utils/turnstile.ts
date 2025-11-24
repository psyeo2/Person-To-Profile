import { TURNSTILE_SECRET_KEY } from "./.env";

// --- Turnstile Verification ---
interface TurnstileResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
  metadata?: {
    ephemeral_id?: string;
  };
}

export const validateTurnstile = async (token: string, ip: string | null): Promise<TurnstileResponse> => {
  const formData = new FormData();
  formData.append("secret", TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  // if (ip) formData.append("remoteip", ip);

  // console.log("[turnstile.ts] Validating Turnstile token:", token);
  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      },
    );

    const result = await response.json();

    return result as TurnstileResponse;
  } catch (err) {
    console.error("Turnstile validation error:", err);
    return { success: false, "error-codes": ["internal-error"] };
  }
}

