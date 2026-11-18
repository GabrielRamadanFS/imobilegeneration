// Cliente mínimo da API REST do Gemini, com modelos de reserva.
// Se um modelo for descontinuado/indisponível, passa para o próximo da lista automaticamente.

const BASE = "https://generativelanguage.googleapis.com/v1beta";

function shouldTryNext(status, message = "") {
  if (status === 404 || status === 429 || status >= 500) return true;
  return /not found|deprecated|not supported|no longer available|unavailable/i.test(message);
}

export async function callGemini(models, body, { signal } = {}) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY não configurada no servidor.");

  let lastError;
  for (const model of models) {
    try {
      const res = await fetch(`${BASE}/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(body),
        signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error?.message || `Gemini HTTP ${res.status}`;
        const err = new Error(message);
        err.status = res.status;
        if (shouldTryNext(res.status, message)) {
          lastError = err;
          continue;
        }
        throw err;
      }
      return { data, model };
    } catch (err) {
      if (err.name === "AbortError") throw err;
      if (err.status && !shouldTryNext(err.status, err.message)) throw err;
      lastError = err;
    }
  }
  throw lastError || new Error("Nenhum modelo Gemini disponível.");
}

export function textOf(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || "").join("");
}

export function imageOf(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  for (const p of parts) {
    const inline = p.inlineData || p.inline_data;
    if (inline?.data) return { mimeType: inline.mimeType || inline.mime_type || "image/png", base64: inline.data };
  }
  return null;
}

export function blockReason(data) {
  return data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason || "";
}
