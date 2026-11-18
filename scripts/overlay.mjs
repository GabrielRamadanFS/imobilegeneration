// Compara a arte desenhada com o modelo: node scripts/overlay.mjs <modo>  -> /tmp/ov<modo>.jpg (lado a lado + sobreposição)
import fs from "node:fs";
import sharp from "sharp";
const mode = Number(process.argv[2] || 1);
process.env.ART_WIDTH = process.env.ART_WIDTH || "768";
const mod = await import(`../netlify/functions/lib/render/mode${mode}.js`);
const FIELDS = JSON.parse(fs.readFileSync(`scripts/sample-fields-${mode}.json`, "utf8"));
const buf = await mod[`renderMode${mode}`]({ fields: FIELDS, photos: [] });
const tpl = await sharp(`public/refs/modo${mode}.jpg`).toBuffer();
const tm = await sharp(tpl).metadata();
const mine = await sharp(buf).resize({ width: tm.width, height: tm.height, fit: "fill" }).toBuffer();
const blend = await sharp(tpl).composite([{ input: await sharp(mine).ensureAlpha(0.5).toBuffer(), blend: "over" }]).toBuffer();
const out = await sharp({ create: { width: tm.width * 3, height: tm.height, channels: 3, background: "#000" } })
  .composite([{ input: tpl, left: 0, top: 0 }, { input: mine, left: tm.width, top: 0 }, { input: blend, left: tm.width * 2, top: 0 }]).jpeg({ quality: 88 }).toBuffer();
fs.writeFileSync(`/tmp/ov${mode}.jpg`, out);
console.log(tm.width, tm.height);
