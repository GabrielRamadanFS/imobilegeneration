import { svgIcon, iconFill, t, tw, up, svgDefs, sparkles, glows, polyPhoto, goldPoly, logo, smooth, rounded, measure, polyStr, GOLDTXT } from "./lib.mjs";
const TW = 682, TH = 1024, W = 768, H = 1376, K = W / TW, EXTRA = H - TH * K;
const ex = (y) => EXTRA * Math.min(1, Math.max(0, (y - 260) / (800 - 260)));
const P = ([x, y]) => [x * K, y * K + ex(y)], Y = (y) => y * K + ex(y), X = (x) => x * K, PP = (p) => p.map(P);
const CURVE = [[278, 0], [290, 30], [310, 60], [328, 90], [333, 110], [330, 150], [322, 200], [308, 225], [292, 245], [272, 280], [255, 310], [245, 350], [237, 390], [233, 412]];
const ROWS = [358, 430, 504, 588, 658], ICONS = ["bed", "sofa", "bbq", "car", "party"];
export function mode2(f, ph, PHONE = "(13) 98210-8455") {
  const g = (i) => ph[i % ph.length];
  let o = glows([[W * .85, H * .12, 420, .15], [W * .1, H * .7, 380, .15]]) + sparkles();
  const heroPts = [...smooth(PP(CURVE)), P([682, 412]), P([682, 0])];
  const L = rounded(PP([[236, 411], [456, 411], [456, 586], [262, 586]]), [18, 0, 0, 14]);
  const R = rounded(PP([[458, 411], [682, 411], [682, 586], [458, 586]]), [18, 0, 0, 0]);
  const B = rounded(PP([[262, 587], [682, 587], [682, 800], [270, 800], [258, 768], [215, 762]]), [20, 0, 0, 0, 0, 6]);
  o += polyPhoto(g(0), heroPts, "40% 50%") + polyPhoto(g(1), L) + polyPhoto(g(2), R) + polyPhoto(g(3), B);
  let v = svgDefs + goldPoly(heroPts, 4) + goldPoly(L, 3.5) + goldPoly(R, 3.5) + goldPoly(B, 3.5);
  const q = smooth(PP(CURVE));
  v += `<polyline points="${polyStr(q)}" fill="none" stroke="url(#gv)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#gl)"/>`;
  // creme/garantia
  const cream = PP([[268, 800], [540, 800], [525, 832], [505, 872], [470, 902], [268, 902]]);
  v += `<polygon points="${polyStr(cream)}" fill="url(#cream)"/><line x1="0" x2="${X(470)}" y1="${Y(901)}" y2="${Y(901)}" stroke="url(#gh)" stroke-width="3.5"/>`;
  const bx = X(20), by = Y(763), bw = X(246), bh = Y(901) - Y(763);
  v += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="22" fill="#0a1a44" stroke="url(#gd)" stroke-width="3.5"/>`;
  const tx = X(26), ty = by + 14 * K, tww = X(118), th = 30 * K;
  v += `<rect x="${tx}" y="${ty}" width="${tww}" height="${th}" rx="6" fill="url(#gd)"/>`;
  // header pill
  const nl = (() => { const n = up(f.m2_neighborhood); return measure(n, "Mont8", 58 * K) > X(262) ? 2 : 1; })();
  const lh = 52 * K, yCity = Y(137) + (nl - 1) * lh + 46 * K, py = yCity + 20 * K, ph_ = 40 * K;
  v += `<rect x="${X(20)}" y="${py}" width="${X(245)}" height="${ph_}" rx="${ph_ / 2}" fill="#f2deaa"/>`;
  v += `<path d="M${X(20) + ph_ / 2} ${py}H${X(265) - ph_ / 2}" stroke="none"/>`;
  o += `<svg class="v">${v}</svg>`;
  // header texts
  o += t(up(f.m2_mod), { x: X(22), by: Y(78), size: 31 * K, font: "m7", color: "#f0d889", ax: "l", maxW: X(250) });
  o += tw(up(f.m2_neighborhood), { x: X(22), bw: X(262), size: 58 * K, font: "m8", ax: "l", max: 2, lh: 52 * K / (58 * K), by: Y(137), gold: 1, minSize: 24 });
  o += t(up(f.m2_city), { x: X(22), by: yCity, size: 37 * K, font: "m8", ax: "l", maxW: X(262), extra: GOLDTXT });
  o += iconFill("pin", X(46), py + ph_ / 2, 22 * K, "#0a1a3d");
  o += t(up(f.m2_dist), { x: X(64), by: py + ph_ / 2 + 7 * K, size: 19 * K, font: "m7", color: "#0a1a3d", ax: "l", maxW: X(192) });
  // features
  [f.m2_f1, f.m2_f2, f.m2_f3, f.m2_f4, f.m2_f5].map((s) => String(s ?? "").trim()).filter(Boolean).forEach((s, i) => {
    const cy = Y(ROWS[i]);
    o += svgIcon(ICONS[i], X(46), cy, 44 * K, "#e9bf5c", 1.5);
    o += tw(up(s), { x: X(80), bw: X(138), size: 21 * K, font: "m6", ax: "l", max: 4, lh: 1.18, cy, minSize: 12 });
  });
  // preço
  o += t(up(f.m2_badge), { x: tx + tww / 2, by: ty + th - 7 * K, size: 23 * K, maxW: tww - 16, color: "#3a2204" });
  {
    const raw = String(f.m2_price ?? "").trim(), m = raw.match(/^\s*(R\$)?\s*([\d.,]+)\s*(.*)$/i), base = by + 85 * K;
    if (!m) o += t(raw, { x: bx + bw / 2, by: base, size: 46 * K, font: "m8", maxW: bw - 20 });
    else {
      const parts = [[m[1] || "", 36 * K], [m[2], 54 * K], [m[3] || "", 26 * K]].filter(([s]) => s), maxW = bw - 24;
      let sc = 1; const wAt = (k) => parts.reduce((a, [s, z], i) => a + measure(s, "Mont8", z * k) + (i ? 5 * K : 0), 0);
      while (wAt(sc) > maxW && sc > .4) sc -= .02;
      let cx = bx + (bw - wAt(sc)) / 2;
      parts.forEach(([s, z], i) => { o += t(s, { x: cx, by: base, size: z * sc, font: "m8", ax: "l", color: "#fff", extra: i === 1 ? GOLDTXT : "" }); cx += measure(s, "Mont8", z * sc) + 5 * K; });
    }
  }
  o += t(up(f.m2_condo), { x: bx + bw / 2, by: by + 116 * K, size: 19 * K, font: "m7", color: "#e9bf5c", maxW: bw - 22 });
  const sx = X(327), sy = (Y(800) + Y(902)) / 2;
  o += iconFill("shield", sx, sy, 54 * K, "#0d2250");
  o += `<svg class="v"><path d="M${sx - 9 * K} ${sy + K} L${sx - 2 * K} ${sy + 8 * K} L${sx + 11 * K} ${sy - 8 * K}" fill="none" stroke="#f0d37c" stroke-width="${4 * K}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  o += tw(up(f.m2_guarantee), { x: X(361), bw: X(168), size: 17 * K, font: "m8", color: "#0d2250", ax: "l", max: 4, lh: 1.2, cy: sy, minSize: 11 });
  // rodapé
  o += svgIcon("whatsapp", X(60), Y(957), 68 * K, "#e9bf5c", 1.5);
  o += t("AGENDE SUA VISITA:", { x: X(110), by: Y(948), size: 17.5 * K, font: "m6", color: "#e9d28f", ax: "l", maxW: X(260) });
  o += t(PHONE, { x: X(108), by: Y(988), size: 42 * K, font: "m8", ax: "l", maxW: X(300), extra: GOLDTXT });
  o += logo(X(498), Y(826), X(172));
  return o;
}
