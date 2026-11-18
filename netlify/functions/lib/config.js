// Configuração central. Tudo que pode mudar no futuro fica aqui ou em variáveis de ambiente.

const list = (v) => (v || "").split(",").map((s) => s.trim()).filter(Boolean);

export const BROKER = {
  name: process.env.BROKER_NAME || "SAMIA MOHAMED",
  phone: process.env.BROKER_PHONE || "(13) 98210-8455",
  creci: process.env.BROKER_CRECI || "76026",
};

export const PROVIDERS = {
  text: process.env.TEXT_PROVIDER || "gemini",
  art: process.env.ART_PROVIDER || "gemini",
};

export const MODELS = {
  text: [process.env.GEMINI_TEXT_MODEL || "gemini-3-flash-preview", ...list(process.env.GEMINI_TEXT_FALLBACKS || "gemini-2.5-flash")],
  image: [process.env.GEMINI_IMAGE_MODEL || "gemini-3-pro-image-preview", ...list(process.env.GEMINI_IMAGE_FALLBACKS || "gemini-2.5-flash-image")],
};

export const LIMITS = {
  maxPinFails: Number(process.env.MAX_PIN_FAILS || 8),
  maxGenerationsPerHour: Number(process.env.MAX_GENERATIONS_PER_HOUR || 30),
  maxPhotos: 6,
  maxPhotoBase64Chars: 1_500_000,
};

export const MODE_INFO = {
  1: { name: "Casa & Condições", use: "venda de imóvel com condições de pagamento (entrada, financiamento, aceita permuta)" },
  2: { name: "Curva & Ficha", use: "locação/aluguel, com ficha técnica de destaques e valor mensal" },
  3: { name: "Grade 6 Fotos", use: "destaque de preço e características, ideal quando há várias fotos (apartamento, mobiliado, oportunidade)" },
};
