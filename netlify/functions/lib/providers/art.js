// Provedor de ARTE (imagem 9:16 a partir do template + textos).
// Interface: generateArt({ mode, template:{base64,mimeType}, fields, hasPhotos, signal })
//            -> { buffer, model, keyed }   (keyed = áreas de foto vieram em magenta para a colagem)
// Trocar de motor: ART_PROVIDER=<nome>. Plano B sem IA de imagem: "local" (template + textos
// desenhados por código + fotos reais) — ainda não implementado; ver README.

import { MODELS, MODE_INFO, PROVIDERS } from "../config.js";
import { FIELDS_BY_MODE } from "../fields.js";
import { blockReason, callGemini, imageOf } from "../gemini.js";

export function buildArtPrompt({ mode, fields, hasPhotos }) {
  const list = (FIELDS_BY_MODE[mode] || [])
    .map(([key, label]) => `- ${label} [${key}]: "${String(fields?.[key] ?? "").trim()}"`)
    .join("\n");

  const photoRule = hasPhotos
    ? `ÁREAS DE FOTO: o template tem áreas reservadas para fotos do imóvel. Pinte CADA área de foto com cor sólida chapada magenta puro (#FF00FF), preenchendo exatamente o mesmo formato e posição que ela tem no template (inclusive curvas/recortes). Sem gradiente, sem sombra, sem texto, sem ícone e sem moldura por cima do magenta. Não desenhe nenhuma foto nessas áreas.`
    : `ÁREAS DE FOTO: preencha as áreas de foto com fotografias ilustrativas realistas e elegantes de um imóvel compatível com os textos.`;

  return `Recrie o template oficial anexado (Modo ${mode} — ${MODE_INFO[mode]?.name}) como uma arte vertical 9:16 pronta para Instagram Stories.

REGRAS DE FIDELIDADE:
- Mantenha EXATAMENTE o layout, a paleta azul-marinho e dourado, as fontes, o acabamento dourado 3D, os ícones e os elementos decorativos do template.
- Troque APENAS os textos pelos valores abaixo, cada um na posição do campo correspondente. Escreva exatamente o texto informado, sem alterar ortografia, acentos ou números, e sem acrescentar textos extras.
- Textos nítidos, legíveis e sem cortes. Não invente logotipos nem contatos.

TEXTOS DOS CAMPOS:
${list}

${photoRule}`;
}

async function gemini({ mode, template, fields, hasPhotos, signal }) {
  const { data, model } = await callGemini(
    MODELS.image,
    {
      contents: [
        {
          role: "user",
          parts: [
            { text: buildArtPrompt({ mode, fields, hasPhotos }) },
            { inlineData: { mimeType: template.mimeType, data: template.base64 } },
          ],
        },
      ],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: "9:16" } },
    },
    { signal, timeoutMs: Number(process.env.ART_TIMEOUT_MS || 28000) },
  );
  const img = imageOf(data);
  if (!img) {
    const why = blockReason(data);
    throw new Error(`O modelo de imagem não retornou uma imagem${why ? ` (motivo: ${why})` : ""}.`);
  }
  return { buffer: Buffer.from(img.base64, "base64"), model, keyed: Boolean(hasPhotos) };
}

const PROVIDERS_ART = { gemini };

export async function generateArt(args) {
  const impl = PROVIDERS_ART[PROVIDERS.art];
  if (!impl) {
    throw new Error(`ART_PROVIDER "${PROVIDERS.art}" não disponível. Disponíveis: ${Object.keys(PROVIDERS_ART).join(", ")}.`);
  }
  return impl(args);
}
