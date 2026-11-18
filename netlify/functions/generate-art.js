import { checkAuth, generationAllowed, registerGeneration } from "./lib/auth.js";
import { composePhotos, toStoryJpeg } from "./lib/compose.js";
import { LIMITS, PROVIDERS } from "./lib/config.js";
import { loadTemplate } from "./lib/templates.js";
import { clientIp, json, methodGuard, readJson } from "./lib/http.js";
import { generateArt } from "./lib/providers/art.js";

const enc = new TextEncoder();

function validPhotos(photos) {
  if (!Array.isArray(photos)) return [];
  return photos
    .slice(0, LIMITS.maxPhotos)
    .filter((p) => p && typeof p.data === "string" && p.data.length > 0 && p.data.length <= LIMITS.maxPhotoBase64Chars)
    .map((p) => Buffer.from(p.data, "base64"));
}

export default async (req) => {
  const bad = methodGuard(req);
  if (bad) return bad;

  const body = await readJson(req);
  const ip = clientIp(req);
  const denied = checkAuth(ip, body?.pin);
  if (denied) return json(denied.status, { error: denied.error });

  const mode = Number(body?.mode);
  if (![1, 2, 3].includes(mode)) return json(400, { error: "Modo inválido." });
  if (!body.fields || typeof body.fields !== "object") return json(400, { error: "Campos de texto ausentes." });
  if (!generationAllowed(ip)) return json(429, { error: "Limite de gerações por hora atingido. Tente mais tarde." });

  registerGeneration(ip);
  const photos = validPhotos(body.photos);

  // Resposta em streaming (NDJSON): mantém a conexão viva durante os ~15 s de geração.
  const stream = new ReadableStream({
    async start(controller) {
      const send = (o) => controller.enqueue(enc.encode(JSON.stringify(o) + "\n"));
      let heartbeat;
      try {
        send({ type: "status", message: `Carregando modelo oficial (Modo ${mode})...` });
        // O gerador local desenha a arte do zero; só o Gemini precisa do template como referência.
        const template = PROVIDERS.art === "local" ? null : await loadTemplate(mode, req.url);

        send({ type: "status", message: "Gerando arte em alta definição (9:16)..." });
        heartbeat = setInterval(
          () => send({ type: "status", message: "Aplicando acabamento dourado 3D, ícones e nitidez nos textos..." }),
          2500,
        );

        const art = await generateArt({ mode, template, fields: body.fields, photos, hasPhotos: photos.length > 0 });

        let finalBuf;
        if (art.keyed && photos.length) {
          send({ type: "status", message: "Encaixando as suas fotos reais na arte..." });
          const composed = await composePhotos(art.buffer, photos);
          if (composed.slots === 0) {
            send({ type: "status", message: "Nenhuma área de foto detectada; mantendo a arte gerada." });
          }
          finalBuf = await toStoryJpeg(composed.image);
        } else {
          finalBuf = await toStoryJpeg(art.buffer);
        }

        send({
          type: "done",
          modelUsed: art.model,
          imageDataUrl: `data:image/jpeg;base64,${finalBuf.toString("base64")}`,
        });
      } catch (err) {
        console.error("generate-art error:", err?.message);
        send({ type: "error", error: "Não foi possível gerar a arte agora. Tente novamente em instantes." });
      } finally {
        if (heartbeat) clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
};

export const config = { path: "/api/generate-art" };
