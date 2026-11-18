import { checkAuth } from "./lib/auth.js";
import { clientIp, json, methodGuard, readJson } from "./lib/http.js";

export default async (req) => {
  const bad = methodGuard(req);
  if (bad) return bad;

  const body = await readJson(req);
  const denied = checkAuth(clientIp(req), body?.pin);
  if (denied) return json(denied.status, { valid: false, error: denied.error });
  return json(200, { valid: true });
};

export const config = { path: "/api/verify-pin" };
