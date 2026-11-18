// Servidor Node simples (Render, Fly, VPS, PC local...): serve public/ e expõe as mesmas funções /api/* do Netlify.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Readable } from "node:stream";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, "public");
const PORT = Number(process.env.PORT) || 8888;
const MAX_BODY = 40 * 1024 * 1024; // fotos em base64

const ROUTES = {
  "/api/verify-pin": () => import("./netlify/functions/verify-pin.js"),
  "/api/analyze": () => import("./netlify/functions/analyze.js"),
  "/api/generate-art": () => import("./netlify/functions/generate-art.js"),
};
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".json": "application/json" };

// A arte usa muita memória (filtros SVG): uma por vez evita estourar planos pequenos.
let busy = Promise.resolve();
const serial = (fn) => { const run = busy.then(fn, fn); busy = run.catch(() => {}); return run; };

async function readBody(req) {
  const chunks = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > MAX_BODY) throw new Error("body grande demais"); chunks.push(c); }
  return Buffer.concat(chunks);
}

async function handleApi(req, res, url) {
  const load = ROUTES[url.pathname];
  const mod = await load();
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (v != null) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
  const request = new Request(url, { method: req.method, headers, body });
  const run = () => mod.default(request, {});
  const response = url.pathname === "/api/generate-art" ? await serial(run) : await run();
  res.writeHead(response.status, Object.fromEntries(response.headers));
  if (!response.body) return res.end();
  Readable.fromWeb(response.body).pipe(res);
}

function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Não encontrado");
  }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    if (url.pathname === "/healthz") { res.writeHead(200); return res.end("ok"); }
    if (ROUTES[url.pathname]) return await handleApi(req, res, url);
    return serveStatic(req, res, url);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Erro interno." }));
  }
}).listen(PORT, () => console.log(`Imobile SM em http://localhost:${PORT}`));
