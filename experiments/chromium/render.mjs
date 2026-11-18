import { createRequire } from "node:module";
import fs from "node:fs";
import { fields, testPhotos } from "/home/claude/imobilegeneration/experiments/common.mjs";
import { page, dataUrl } from "./lib.mjs";
import { mode1 } from "./mode1.mjs";
import { mode2 } from "./mode2.mjs";
import { mode3 } from "./mode3.mjs";
const require = createRequire("/opt/npm-tools/node_modules/");
const { chromium } = require("playwright");
const DIR = "/home/claude/imobilegeneration/experiments/chromium/", OUT = "/tmp/exp/chromium/";
const SCALE = 1440 / 768;
const only = process.argv[2];
const photos = (await testPhotos()).map(dataUrl);
const gens = { 1: mode1, 2: mode2, 3: mode3 };
const tStart = performance.now();
const browser = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox", "--disable-gpu"] });
const tLaunch = performance.now() - tStart;
const times = {};
for (const m of [1, 2, 3]) {
  if (only && +only !== m) continue;
  const html = page(gens[m](fields(m), photos));
  fs.writeFileSync(`${DIR}mode${m}.html`, html);
  const runs = [];
  for (let k = 0; k < 3; k++) {
    const t0 = performance.now();
    const ctx = await browser.newContext({ viewport: { width: 768, height: 1376 }, deviceScaleFactor: SCALE });
    const p = await ctx.newPage();
    p.on("pageerror", (e) => console.log("pageerror", e.message));
    await p.goto(`file://${DIR}mode${m}.html`);
    await p.waitForFunction("window.__ready===true");
    const buf = await p.screenshot({ type: "jpeg", quality: 93 });
    if (k === 0) fs.writeFileSync(`${OUT}mode${m}.jpg`, buf);
    await ctx.close();
    runs.push(Math.round(performance.now() - t0));
  }
  times[m] = runs; console.log("mode", m, runs);
}
console.log("launch ms", Math.round(tLaunch));
fs.writeFileSync(`${OUT}timings-${only || "all"}.json`, JSON.stringify({ launch: tLaunch, times }));
await browser.close();
