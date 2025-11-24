import { ping } from "./routes/health";
import { createParticipant } from "./routes/participants";
import { savePreSurvey } from "./routes/pre_questionnaire";
import { savePostSurvey } from "./routes/post_questionnaire";
import { saveAdsShown } from "./routes/ads";
import { json, noContent } from "./utils/utils";

export default {
  fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // only API calls
    // TODO: serve index for non-API calls (SPA)
    if (!path.startsWith("/api/"))
      return new Response("Not found", { status: 404 });

    if (method === "OPTIONS") return noContent();

    const apiPath = path.replace("/api", "");

    // HEALTH
    if (apiPath === "/ping" && method === "GET") return ping();

    // PARTICIPANT SESSION
    if (apiPath === "/participants" && method === "POST")
      return createParticipant(request, env);

    // SURVEYS
    if (apiPath === "/survey/pre" && method === "POST")
      return savePreSurvey(request, env);
    if (apiPath === "/survey/post" && method === "POST")
      return savePostSurvey(request, env);
    if (apiPath === "/survey/ads" && method === "POST")
      return saveAdsShown(request, env);

    return json({ error: "Not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
