import { fields, testPhotos } from "../common.mjs";
import { render, save } from "./lib.mjs";
import fs from "node:fs";
import { buildMode1, initIcons } from "./m1.mjs";
const mode = process.argv[2] || "1";
const photos = await testPhotos();
const OUTW = Number(process.env.OUTW) || 1440;
let build;
if (mode === "1") { await initIcons(); build = (f) => buildMode1(f, photos, OUTW); }
else if (mode === "2") { const m = await import("./m2.mjs"); await m.init(); build = (f) => m.buildMode2(f, photos, OUTW); }
else { const m = await import("./m3.mjs"); await m.init(); build = (f) => m.buildMode3(f, photos, OUTW); }
fs.mkdirSync("/tmp/exp/svg", { recursive: true });
const t0 = performance.now();
const svg = await build(fields(mode));
const t1 = performance.now();
fs.writeFileSync(`/tmp/exp/svg/mode${mode}.svg`, svg);
const r = render(svg, OUTW, `/tmp/exp/svg/mode${mode}.jpg`, 93);
const tj = await save(r);
console.log(JSON.stringify({ mode, buildMs: Math.round(t1 - t0), rasterMs: Math.round(r.tRaster), jpegMs: Math.round(tj), totalMs: Math.round(performance.now() - t0), svgKB: Math.round(svg.length / 1024) }));
