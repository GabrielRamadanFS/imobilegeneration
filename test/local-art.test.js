import assert from "node:assert/strict";
import { describe, it } from "node:test";
import sharp from "sharp";

process.env.APP_PIN = "pin-ficticio-de-teste";
process.env.GEMINI_API_KEY = "test-key";
delete process.env.ART_PROVIDER; // padrão = local

const { default: generateArt } = await import("../netlify/functions/generate-art.js");
const { renderMode1 } = await import("../netlify/functions/lib/render/mode1.js");
const { renderMode2 } = await import("../netlify/functions/lib/render/mode2.js");
const { renderMode3 } = await import("../netlify/functions/lib/render/mode3.js");
const { renderSvgMode } = await import("../netlify/functions/lib/render-svg/index.js");
const { FIELDS_BY_MODE } = await import("../netlify/functions/lib/fields.js");

const solid = (w, h, [r, g, b]) => sharp({ create: { width: w, height: h, channels: 3, background: { r, g, b } } });
const pixel = async (buf, x, y) => {
  const { data, info } = await sharp(buf).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * 3;
  return [data[i], data[i + 1], data[i + 2]];
};
const near = (a, b, tol = 40) => a.every((v, i) => Math.abs(v - b[i]) <= tol);
const fieldsFor = (mode) => Object.fromEntries(FIELDS_BY_MODE[mode].map(([k]) => [k, "Texto de teste açãõé"]));
const post = (body) =>
  new Request("https://site.test/api/generate-art", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-nf-client-connection-ip": "2.2.2.2" },
    body: JSON.stringify(body),
  });

describe("gerador local de artes", () => {
  for (const [mode, render] of [[1, renderMode1], [2, renderMode2], [3, renderMode3]]) {
    it(`Modo ${mode}: desenha 1440 px de largura, com fotos e com campos vazios`, async () => {
      const photo = await solid(800, 600, [220, 30, 30]).jpeg().toBuffer();
      const withPhotos = await render({ fields: fieldsFor(mode), photos: [photo, photo] });
      const meta = await sharp(withPhotos).metadata();
      assert.equal(meta.format, "jpeg");
      assert.equal(meta.width, 1440);
      assert.ok(meta.height > 1500);
      const empty = await render({ fields: {}, photos: [] });
      assert.ok(empty.length > 10_000);
    });
  }

  for (const mode of [1, 2, 3]) {
    it(`Modo ${mode} (SVG): JPEG 1080 px com fotos e com campos vazios`, async () => {
      const photo = await solid(800, 600, [220, 30, 30]).jpeg().toBuffer();
      const img = await renderSvgMode(mode, { fields: fieldsFor(mode), photos: [{ data: photo.toString("base64") }] });
      const meta = await sharp(img).metadata();
      assert.equal(meta.format, "jpeg");
      assert.equal(meta.width, 1080);
      assert.ok(meta.height > 1800);
      const empty = await renderSvgMode(mode, { fields: {}, photos: [] });
      assert.ok(empty.length > 10_000);
    });
  }

  it("generate-art usa o gerador local sem chamar nenhuma rede e cola as fotos reais", async () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = () => {
      throw new Error("o gerador local não pode usar a rede");
    };
    try {
      const photo = (await solid(800, 600, [220, 30, 30]).jpeg().toBuffer()).toString("base64");
      const res = await generateArt(post({ pin: "pin-ficticio-de-teste", mode: 1, fields: fieldsFor(1), photos: [{ mimeType: "image/jpeg", data: photo }] }));
      const lines = (await res.text()).trim().split("\n").map((l) => JSON.parse(l));
      const done = lines.at(-1);
      assert.equal(done.type, "done", JSON.stringify(done));
      assert.equal(done.modelUsed, "local-render");
      const img = Buffer.from(done.imageDataUrl.split(",")[1], "base64");
      assert.equal((await sharp(img).metadata()).width, 1080);
      assert.ok(near(await pixel(img, 540, 586), [220, 30, 30]), "a foto enviada deve aparecer no primeiro quadro");
    } finally {
      globalThis.fetch = realFetch;
    }
  });
});
