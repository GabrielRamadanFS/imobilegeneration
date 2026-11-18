import { checkAuth } from "./lib/auth.js";
import { BROKER, MODE_INFO } from "./lib/config.js";
import { ALL_KEYS } from "./lib/fields.js";
import { clientIp, json, methodGuard, readJson } from "./lib/http.js";
import { generateStructured } from "./lib/providers/text.js";

const MAX_TEXT = 4000;

export function buildSchema() {
  const fieldProps = Object.fromEntries(ALL_KEYS.map((k) => [k, { type: "STRING" }]));
  return {
    type: "OBJECT",
    properties: {
      chosenMode: { type: "INTEGER" },
      reason: { type: "STRING" },
      captionComplete: { type: "STRING" },
      captionShort: { type: "STRING" },
      fields: { type: "OBJECT", properties: fieldProps, required: ALL_KEYS },
    },
    required: ["chosenMode", "reason", "captionComplete", "captionShort", "fields"],
  };
}

export function buildPrompt({ rawText, photoCount, preferredMode }) {
  const modes = Object.entries(MODE_INFO)
    .map(([n, m]) => `- Modo ${n} (${m.name}): ${m.use}`)
    .join("\n");
  const forced = [1, 2, 3].includes(Number(preferredMode))
    ? `O usuário escolheu o Modo ${Number(preferredMode)}: use exatamente esse modo em chosenMode.`
    : `Escolha o melhor modo em chosenMode. Com 4 ou mais fotos, o Modo 3 costuma ser a melhor opção.`;

  return `Você é o redator de marketing imobiliário de ${BROKER.name} (CRECI ${BROKER.creci}).

TAREFA: ler a descrição bruta de um imóvel e (1) escolher o layout da arte, (2) preencher TODOS os campos de texto dos 3 layouts, (3) escrever duas legendas.

LAYOUTS:
${modes}
${forced}

REGRAS:
- Use SOMENTE informações presentes na descrição. Nunca invente preço, metragem, bairro, cidade ou diferenciais.
- Se um dado não existir, use um texto genérico, curto e positivo. Nunca use colchetes nem placeholders como "BAIRRO – CIDADE".
- Corrija erros de digitação da descrição (ex.: "pscina" vira "piscina"; "3000,.00" vira R$ 3.000,00).
- Textos de campo: curtos, em CAIXA ALTA (exceto frases cursivas e subtítulos cursivos), português do Brasil.
- Valores no formato R$ 0.000,00. Locação: indique "mensal" quando for aluguel.
- Preencha também os campos dos layouts não escolhidos, de forma coerente.
- captionComplete: legenda para feed (Instagram/Facebook) com emojis, lista de destaques, valor, chamada para ação e 6 a 8 hashtags. Termine com o bloco:
📲 WhatsApp: ${BROKER.phone}
👤 ${BROKER.name}
🪪 CRECI ${BROKER.creci}
- captionShort: até 280 caracteres, com valor e contato (${BROKER.phone}).
- reason: uma frase explicando a escolha do modo.

FOTOS ENVIADAS: ${Number(photoCount) || 0}

DESCRIÇÃO BRUTA:
"""
${rawText}
"""`;
}

function ensureContact(caption) {
  if (caption.includes(BROKER.phone)) return caption;
  return `${caption.trim()}\n\n📲 WhatsApp: ${BROKER.phone}\n👤 ${BROKER.name}\n🪪 CRECI ${BROKER.creci}`;
}

export default async (req) => {
  const bad = methodGuard(req);
  if (bad) return bad;

  const body = await readJson(req);
  const denied = checkAuth(clientIp(req), body?.pin);
  if (denied) return json(denied.status, { error: denied.error });

  const rawText = typeof body?.rawText === "string" ? body.rawText.trim() : "";
  if (!rawText) return json(400, { error: "Informe a descrição do imóvel." });
  if (rawText.length > MAX_TEXT) return json(400, { error: `Descrição muito longa (máximo ${MAX_TEXT} caracteres).` });

  try {
    const { json: out, model } = await generateStructured({
      prompt: buildPrompt({ rawText, photoCount: body.photoCount, preferredMode: body.preferredMode }),
      schema: buildSchema(),
    });

    const preferred = Number(body.preferredMode);
    const chosen = [1, 2, 3].includes(preferred) ? preferred : [1, 2, 3].includes(Number(out.chosenMode)) ? Number(out.chosenMode) : 1;
    const fields = Object.fromEntries(ALL_KEYS.map((k) => [k, String(out.fields?.[k] ?? "").trim()]));

    return json(200, {
      ok: true,
      model,
      chosenMode: chosen,
      reason: String(out.reason || ""),
      captionComplete: ensureContact(String(out.captionComplete || "")),
      captionShort: ensureContact(String(out.captionShort || "")),
      fields,
    });
  } catch (err) {
    console.error("analyze error:", err?.message);
    return json(502, { error: "Não foi possível analisar o imóvel agora. Tente novamente em instantes." });
  }
};

export const config = { path: "/api/analyze" };
