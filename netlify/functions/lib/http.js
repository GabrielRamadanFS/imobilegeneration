export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export function clientIp(req) {
  return (
    req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export function methodGuard(req) {
  if (req.method !== "POST") return json(405, { error: "Método não permitido." });
  return null;
}
