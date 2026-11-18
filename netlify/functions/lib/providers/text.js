// Provedor de TEXTO (escolha do layout, campos e legendas).
// Interface: generateStructured({ prompt, schema }) -> { json, model }
// Trocar de motor: TEXT_PROVIDER=<nome>. Para adicionar outro (ex.: Claude), crie uma função
// com a mesma assinatura e registre em PROVIDERS_TEXT.

import { MODELS, PROVIDERS } from "../config.js";
import { callGemini, textOf } from "../gemini.js";

async function gemini({ prompt, schema }) {
  const { data, model } = await callGemini(MODELS.text, {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.7 },
  });
  const raw = textOf(data).trim();
  if (!raw) throw new Error("O modelo de texto não retornou conteúdo.");
  try {
    return { json: JSON.parse(raw), model };
  } catch {
    throw new Error("O modelo de texto retornou um JSON inválido.");
  }
}

const PROVIDERS_TEXT = { gemini };

export async function generateStructured(args) {
  const impl = PROVIDERS_TEXT[PROVIDERS.text];
  if (!impl) throw new Error(`TEXT_PROVIDER desconhecido: "${PROVIDERS.text}". Disponíveis: ${Object.keys(PROVIDERS_TEXT).join(", ")}.`);
  return impl(args);
}
