// Carrega o template (modelo oficial) de cada layout.
// 1º tenta o arquivo empacotado junto com a função (netlify.toml: included_files).
// 2º, como reserva, baixa do próprio site. Esse caminho pode falhar (ex.: 401 em proteção de deploy),
// por isso não é o principal.

import { readFile } from "node:fs/promises";
import path from "node:path";

function candidates(mode) {
  const rel = path.join("public", "refs", `modo${mode}.jpg`);
  const roots = [process.env.LAMBDA_TASK_ROOT, process.cwd(), "/var/task"].filter(Boolean);
  return [...new Set(roots.map((r) => path.join(r, rel)))];
}

export async function loadTemplate(mode, reqUrl) {
  for (const file of candidates(mode)) {
    try {
      const buf = await readFile(file);
      if (buf.length > 1000) return { base64: buf.toString("base64"), mimeType: "image/jpeg" };
    } catch {
      // tenta o próximo
    }
  }
  const res = await fetch(new URL(`/refs/modo${mode}.jpg`, reqUrl));
  if (!res.ok) throw new Error(`Template do Modo ${mode} não encontrado (HTTP ${res.status}).`);
  return { base64: Buffer.from(await res.arrayBuffer()).toString("base64"), mimeType: "image/jpeg" };
}
