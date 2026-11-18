import { fields, testPhotos } from "/home/claude/imobilegeneration/experiments/common.mjs";
import { toJpg } from "./lib.mjs"; import { buildMode1 } from "./mode1.mjs"; import { buildMode2 } from "./mode2.mjs"; import { buildMode3 } from "./mode3.mjs";
import fs from "node:fs";
const ph = await testPhotos(); const B = { 1: buildMode1, 2: buildMode2, 3: buildMode3 }; const res = {};
const only = process.argv[2] ? [Number(process.argv[2])] : [1, 2, 3];
for (const m of only) { const f = fields(m); const ts = [];
  for (let i = 0; i < 4; i++) { const t = performance.now(); const { png, svg } = await B[m](f, ph, 1080); ts.push(Math.round(performance.now() - t));
    if (i == 0) { await toJpg([png], 1080, Math.round(1376 * 1080 / 768), `/tmp/exp/satori/mode${m}.jpg`); fs.writeFileSync(`/tmp/exp/satori/mode${m}.svg`, svg); } }
  res[m] = ts; console.log("mode", m, "cold", ts[0], "warm", ts.slice(1).join(","), "ms"); }
