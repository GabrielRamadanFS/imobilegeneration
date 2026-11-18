import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import sharp from "sharp";

process.env.APP_PIN = "pin-ficticio-de-teste";
process.env.GEMINI_API_KEY = "test-key";
process.env.MAX_PIN_FAILS = "3";

const { default: verifyPin } = await import("../netlify/functions/verify-pin.js");
const { default: analyze, buildSchema, buildPrompt } = await import("../netlify/functions/analyze.js");
const { default: generateArt } = await import("../netlify/functions/generate-art.js");
const { composePhotos, findKeyRegions } = await import("../netlify/functions/lib/compose.js");
const { _resetForTests } = await import("../netlify/functions/lib/auth.js");
const { ALL_KEYS } = await import("../netlify/functions/lib/fields.js");

const realFetch = globalThis.fetch;
const post = (path, body, ip = "1.1.1.1") =>
  new Request(`https://site.test${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-nf-client-connection-ip": ip },
    body: JSON.stringify(body),
  });

const solid = (w, h, [r, g, b]) => sharp({ create: { width: w, height: h, channels: 3, background: { r, g, b } } });
const pixel = async (buf, x, y) => {
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * 3;
  return [data[i], data[i + 1], data[i + 2]];
};
const near = (a, b, tol = 40) => a.every((v, i) => Math.abs(v - b[i]) <= tol);

// Template sintético 540x960: fundo azul-marinho, 1 retângulo magenta em cima e 1 elipse embaixo
async function keyedTemplate() {
  const ellipse = Buffer.from(`<svg width="540" height="960"><rect width="540" height="960" fill="#0b1c36"/>
    <rect x="40" y="60" width="460" height="300" fill="#FF00FF"/>
    <ellipse cx="270" cy="700" rx="200" ry="120" fill="#FF00FF"/></svg>`);
  return sharp(ellipse).jpeg({ quality: 95 }).toBuffer();
}

beforeEach(() => {
  _resetForTests();
  globalThis.fetch = realFetch;
});

describe("verify-pin", () => {
  it("aceita o PIN correto", async () => {
    const res = await verifyPin(post("/api/verify-pin", { pin: "pin-ficticio-de-teste" }));
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { valid: true });
  });

  it("recusa PIN errado com 401 e a mensagem do contrato", async () => {
    const res = await verifyPin(post("/api/verify-pin", { pin: "000000" }));
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { valid: false, error: "Código PIN incorreto." });
  });

  it("bloqueia após muitas tentativas erradas (429), mesmo com o PIN certo", async () => {
    for (let i = 0; i < 3; i++) await verifyPin(post("/api/verify-pin", { pin: "x" }, "9.9.9.9"));
    const res = await verifyPin(post("/api/verify-pin", { pin: "pin-ficticio-de-teste" }, "9.9.9.9"));
    assert.equal(res.status, 429);
  });

  it("recusa GET com 405 e corpo vazio com 401", async () => {
    assert.equal((await verifyPin(new Request("https://site.test/api/verify-pin"))).status, 405);
    assert.equal((await verifyPin(post("/api/verify-pin", {}))).status, 401);
  });
});

describe("analyze", () => {
  const geminiReply = (over = {}) => {
    const fields = Object.fromEntries(ALL_KEYS.map((k) => [k, `TEXTO ${k}`]));
    return { candidates: [{ content: { parts: [{ text: JSON.stringify({ chosenMode: 2, reason: "locação", captionComplete: "Legenda", captionShort: "Curta", fields, ...over }) }] } }] };
  };

  it("schema e prompt cobrem todos os campos dos 3 modos", () => {
    const schema = buildSchema();
    assert.equal(Object.keys(schema.properties.fields.properties).length, ALL_KEYS.length);
    assert.match(buildPrompt({ rawText: "casa", photoCount: 3, preferredMode: "auto" }), /Escolha o melhor modo/);
    assert.match(buildPrompt({ rawText: "casa", photoCount: 3, preferredMode: 3 }), /exatamente esse modo/);
  });

  it("devolve o contrato completo e garante o contato nas legendas", async () => {
    globalThis.fetch = async () => new Response(JSON.stringify(geminiReply()), { status: 200 });
    const res = await analyze(post("/api/analyze", { pin: "pin-ficticio-de-teste", rawText: "Casa 3 quartos pscina 3000,.00 anual", photoCount: 3, preferredMode: "auto" }));
    assert.equal(res.status, 200);
    const out = await res.json();
    assert.equal(out.ok, true);
    assert.equal(out.chosenMode, 2);
    assert.equal(Object.keys(out.fields).length, ALL_KEYS.length);
    assert.match(out.captionComplete, /CRECI 76026/);
    assert.match(out.captionShort, /\(13\) 98210-8455/);
  });

  it("respeita o modo escolhido pelo usuário", async () => {
    globalThis.fetch = async () => new Response(JSON.stringify(geminiReply({ chosenMode: 1 })), { status: 200 });
    const out = await (await analyze(post("/api/analyze", { pin: "pin-ficticio-de-teste", rawText: "apto", preferredMode: 3 }))).json();
    assert.equal(out.chosenMode, 3);
  });

  it("usa o modelo de reserva quando o principal falha com 404", async () => {
    const calls = [];
    globalThis.fetch = async (url) => {
      calls.push(String(url));
      return calls.length === 1
        ? new Response(JSON.stringify({ error: { message: "model not found" } }), { status: 404 })
        : new Response(JSON.stringify(geminiReply()), { status: 200 });
    };
    const out = await (await analyze(post("/api/analyze", { pin: "pin-ficticio-de-teste", rawText: "casa" }))).json();
    assert.equal(calls.length, 2);
    assert.match(calls[0], /gemini-3\.8-flash/);
    assert.match(calls[1], /gemini-3\.5-flash-lite/);
    assert.equal(out.model, "gemini-3.5-flash-lite");
  });

  it("rejeita sem PIN, sem texto e erro do Gemini vira 502 sem vazar detalhes", async () => {
    assert.equal((await analyze(post("/api/analyze", { rawText: "x" }))).status, 401);
    assert.equal((await analyze(post("/api/analyze", { pin: "pin-ficticio-de-teste", rawText: "  " }))).status, 400);
    globalThis.fetch = async () => new Response(JSON.stringify({ error: { message: "SEGREDO interno" } }), { status: 400 });
    const res = await analyze(post("/api/analyze", { pin: "pin-ficticio-de-teste", rawText: "casa" }));
    assert.equal(res.status, 502);
    assert.doesNotMatch(await res.text(), /SEGREDO/);
  });
});

describe("compose (fotos reais coladas nas áreas magenta)", () => {
  it("detecta as 2 áreas em ordem de leitura", async () => {
    const { regions } = await findKeyRegions(await keyedTemplate());
    assert.equal(regions.length, 2);
    assert.ok(regions[0].y < regions[1].y);
  });

  it("cola foto 1 no retângulo e foto 2 na elipse, sem sobrar magenta", async () => {
    const photos = [await solid(300, 200, [220, 30, 30]).jpeg().toBuffer(), await solid(300, 200, [30, 200, 40]).jpeg().toBuffer()];
    const out = await composePhotos(await keyedTemplate(), photos);
    assert.equal(out.slots, 2);
    assert.equal(out.used, 2);
    assert.ok(near(await pixel(out.image, 270, 210), [220, 30, 30]), "retângulo deve ter a foto vermelha");
    assert.ok(near(await pixel(out.image, 270, 700), [30, 200, 40]), "elipse deve ter a foto verde");
    assert.ok(near(await pixel(out.image, 10, 10), [11, 28, 54], 25), "fundo preservado");
    // cantos da elipse (dentro do bbox, fora da curva) continuam azul-marinho
    assert.ok(near(await pixel(out.image, 90, 600), [11, 28, 54], 25), "fora da curva não recebe foto");
    const { data } = await sharp(out.image).raw().toBuffer({ resolveWithObject: true });
    let magenta = 0;
    for (let i = 0; i < data.length; i += 3) if (data[i] > 200 && data[i + 1] < 90 && data[i + 2] > 200) magenta++;
    assert.ok(magenta < 40, `sobrou magenta: ${magenta} px`);
  });

  it("reaproveita fotos quando há mais áreas do que fotos", async () => {
    const out = await composePhotos(await keyedTemplate(), [await solid(200, 200, [10, 10, 220]).jpeg().toBuffer()]);
    assert.equal(out.used, 1);
    assert.ok(near(await pixel(out.image, 270, 700), [10, 10, 220]));
  });

  it("sem áreas magenta devolve a própria imagem", async () => {
    const out = await composePhotos(await solid(200, 300, [0, 0, 0]).jpeg().toBuffer(), [await solid(50, 50, [255, 0, 0]).jpeg().toBuffer()]);
    assert.equal(out.slots, 0);
    assert.equal(out.used, 0);
  });
});

describe("generate-art (ponta a ponta, Gemini simulado)", () => {
  const readLines = async (res) =>
    (await res.text()).split("\n").filter(Boolean).map((l) => JSON.parse(l));

  it("gera, encaixa a foto real e responde em NDJSON no contrato do front-end", async () => {
    const tpl = await keyedTemplate();
    const geminiPng = await sharp(tpl).png().toBuffer();
    globalThis.fetch = async (url) => {
      const u = String(url);
      if (u.includes("/refs/modo2.jpg")) return new Response(tpl, { status: 200 });
      if (u.includes("generativelanguage")) {
        return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ inlineData: { mimeType: "image/png", data: geminiPng.toString("base64") } }] } }] }), { status: 200 });
      }
      throw new Error("fetch inesperado: " + u);
    };
    const photo = (await solid(300, 200, [220, 30, 30]).jpeg().toBuffer()).toString("base64");
    const res = await generateArt(post("/api/generate-art", { pin: "pin-ficticio-de-teste", mode: 2, fields: { m2_price: "R$ 3.000,00" }, rawText: "casa", photos: [{ mimeType: "image/jpeg", data: photo }] }));
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type"), /x-ndjson/);
    const events = await readLines(res);
    assert.equal(events[0].type, "status");
    const done = events.at(-1);
    assert.equal(done.type, "done");
    assert.equal(done.modelUsed, "gemini-3-pro-image");
    assert.match(done.imageDataUrl, /^data:image\/jpeg;base64,/);
    const img = Buffer.from(done.imageDataUrl.split(",")[1], "base64");
    const meta = await sharp(img).metadata();
    assert.equal(meta.width, 540); // não amplia além do original (withoutEnlargement)
    assert.ok(near(await pixel(img, 270, 210), [220, 30, 30]), "a foto enviada deve aparecer na arte");
  });

  it("falha do Gemini vira evento de erro genérico, sem vazar detalhes", async () => {
    globalThis.fetch = async (url) =>
      String(url).includes("/refs/") ? new Response(await keyedTemplate(), { status: 200 }) : new Response(JSON.stringify({ error: { message: "CHAVE inválida xyz" } }), { status: 400 });
    const res = await generateArt(post("/api/generate-art", { pin: "pin-ficticio-de-teste", mode: 1, fields: {}, photos: [] }));
    const events = await readLines(res);
    assert.equal(events.at(-1).type, "error");
    assert.doesNotMatch(JSON.stringify(events), /xyz/);
  });

  it("valida PIN, modo e campos antes de gastar crédito", async () => {
    assert.equal((await generateArt(post("/api/generate-art", { pin: "errado", mode: 1, fields: {} }))).status, 401);
    assert.equal((await generateArt(post("/api/generate-art", { pin: "pin-ficticio-de-teste", mode: 9, fields: {} }))).status, 400);
    assert.equal((await generateArt(post("/api/generate-art", { pin: "pin-ficticio-de-teste", mode: 1 }))).status, 400);
  });
});
