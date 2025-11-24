import { register, login } from "./routes/auth";
import { ping } from "./routes/health";
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

    // // HEALTH
    // if (apiPath === "/ping" && method === "GET") return ping();

    // // AUTH
    // if (apiPath === "/register" && method === "POST")
    //   return register(request, env);
    // if (apiPath === "/login" && method === "POST") return login(request, env);

    return json({ error: "Not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
