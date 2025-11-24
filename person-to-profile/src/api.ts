const BASE = (import.meta.env?.VITE_API_BASE ?? "/api").replace(/\/$/, "");
export const API_BASE = BASE.length ? BASE : "/api";

type FetchOptions = RequestInit & { parseJson?: boolean };

async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { parseJson = true, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...rest,
  });

  const isJson =
    parseJson && res.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export interface DemographicAnswers {
  gender: string;
  age: number;
  ethnicity: string;
  occupation: string;
  postcode: string;
  income: string;
  education: string;
  adFrequency: number;
}

export interface SurveyAnswers {
  relevance: number;
  favouriteAd: string;
  consideration: number;
  recall: number;
  takeaway: string;
}

export interface AdsShown {
  adIds: string[];
}

export const health = {
  ping: () =>
    apiFetch<{ ok: boolean } | { status: string }>("/ping", {
      method: "GET",
    }),
};

// could this just be a GET method that returns participant ID given no params are required to create a participant?
export const createNewParticipant = () =>
  apiFetch<{ participantId: string }>("/participants", {
    method: "POST",
  });

export const setDemographicAnswers = (
  participantId: string | number,
  answers: DemographicAnswers
) =>
  apiFetch("/survey/pre", {
    method: "POST",
    body: JSON.stringify({ participantId, ...answers }),
  });

export const setSurveyAnswers = (
  participantId: string | number,
  answers: SurveyAnswers
) =>
  apiFetch("/survey/post", {
    method: "POST",
    body: JSON.stringify({ participantId, ...answers }),
  });

export const setAdsShown = (
  participantId: string | number,
  ads: AdsShown
) =>
  apiFetch("/survey/ads", {
    method: "POST",
    body: JSON.stringify({ participantId, ...ads }),
  });

export const api = {
  health,
  setDemographicAnswers,
  setSurveyAnswers,
  setAdsShown,
};
