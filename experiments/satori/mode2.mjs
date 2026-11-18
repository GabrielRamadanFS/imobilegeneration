import { h, box, text, goldText, goldBox, img, svgLayer, goldGradDef, ptsD, smooth, rounded, polyPhoto2, bbox, iconSvg, fillIcon, logo, sparkles, bgStyle, wrap, measure, fit, GOLD_T, GOLD_D, GOLD_H, renderLayer } from "./lib.mjs";
const TW = 682, TH = 1024, W = 768, H = 1376, K = W / TW, EXTRA = H - TH * K;
const up = (t) => String(t ?? "").toUpperCase(), T = (v) => String(v ?? "").trim();
const ex = (y) => EXTRA * Math.min(1, Math.max(0, (y - 260) / (800 - 260)));
const P = ([x, y]) => [x * K, y * K + ex(y)], Y = (y) => y * K + ex(y), X = (x) => x * K, PP = (pts) => pts.map(P);
const CURVE = [[278, 0], [290, 30], [310, 60], [328, 90], [333, 110], [330, 150], [322, 200], [308, 225], [292, 245], [272, 280], [255, 310], [245, 350], [237, 390], [233, 412]];
const ICONS = ["bed", "sofa", "bbq", "car", "party"], ROWS = [358, 430, 504, 588, 658];

export async function buildMode2(f, photos, OUTW = 1080) {
  const SC = OUTW / W, ph = (i) => photos[i % photos.length], N = [];
  N.push(box(0, 0, W, H, bgStyle(W, H, [[W * .85, H * .12, 420, .15], [W * .1, H * .7, 380, .15]])), ...sparkles(W, H, 70));
  const heroPts = [...smooth(PP(CURVE)), P([682, 412]), P([682, 0])];
  N.push(...(await polyPhoto2(ph(0), heroPts, 4, SC, W, H, "g0")));
  const L = rounded(PP([[236, 411], [456, 411], [456, 586], [262, 586]]), [18, 0, 0, 14]);
  const R = rounded(PP([[458, 411], [682, 411], [682, 586], [458, 586]]), [18, 0, 0, 0]);
  const B = rounded(PP([[262, 587], [682, 587], [682, 800], [270, 800], [258, 768], [215, 762]]), [20, 0, 0, 0, 0, 6]);
  N.push(...(await polyPhoto2(ph(1), L, 3.5, SC, W, H, "g1")), ...(await polyPhoto2(ph(2), R, 3.5, SC, W, H, "g2")), ...(await polyPhoto2(ph(3), B, 3.5, SC, W, H, "g3")));
  // curva dourada com brilho
  { const q = smooth(PP(CURVE)); const d = ptsD(q, false);
    N.push(svgLayer(W, H, `<path d="${d}" fill="none" stroke="#ffc850" stroke-opacity=".55" stroke-width="10" stroke-linecap="round" filter="url(#bl)"/><path d="${d}" fill="none" stroke="url(#sw)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`, goldGradDef("sw", 0, 0, 0, H * .5) + `<filter id="bl" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="5"/></filter>`)); }
  // cabeçalho
  N.push(text("m7", up(f.m2_mod), X(22), Y(78), { size: 31 * K, maxW: X(250), color: "#f0d889", align: "left" }));
  { const name = up(f.m2_neighborhood); let size = 58 * K, lines = []; const maxW = X(262);
    for (; size >= 24; size--) { lines = wrap("m8", name, size, maxW); if (lines.length <= 2 && lines.every((l) => measure("m8", l, size) <= maxW)) break; }
    const lh = 52 * K; lines.slice(0, 2).forEach((l, i) => N.push(text("m8", l, X(22), Y(137) + i * lh, { size, align: "left", grad: GOLD_T })));
    const nl = Math.min(lines.length, 2), yCity = Y(137) + (nl - 1) * lh + 46 * K;
    N.push(text("m8", up(f.m2_city), X(22), yCity, { size: 37 * K, maxW, align: "left", grad: GOLD_T }));
    const py = yCity + 20 * K, ph2 = 40 * K;
    N.push(box(X(20), py, X(245), ph2, { borderRadius: ph2 / 2, backgroundImage: "linear-gradient(180deg,#f8e8bd,#e8cc8a)" }));
    N.push(fillIcon("pin", X(46), py + ph2 / 2, 22 * K, "#0a1a3d"));
    N.push(text("m7", up(f.m2_dist), X(64), py + ph2 / 2 + 7 * K, { size: 19 * K, maxW: X(192), color: "#0a1a3d", align: "left" })); }
  // destaques
  [f.m2_f1, f.m2_f2, f.m2_f3, f.m2_f4, f.m2_f5].map(T).filter(Boolean).forEach((t, i) => {
    const cy = Y(ROWS[i]); N.push(iconSvg(ICONS[i], X(46), cy, 44 * K * 1.1, { grad: true, sw: 1.7 }));
    const mw = X(150); let size = 21 * K, lines = [];
    for (; size >= 12; size -= 0.5) { lines = wrap("m6", up(t), size, mw); if (lines.length <= 4 && lines.every((l) => measure("m6", l, size) <= mw)) break; }
    const lh = size * 1.18, top = cy - (lines.length - 1) * lh / 2 + size * 0.34;
    lines.forEach((l, k) => N.push(text("m6", l, X(80), top + k * lh, { size, align: "left" }))); });
  // barra creme + preço + garantia
  { const cream = PP([[268, 800], [540, 800], [525, 832], [505, 872], [470, 902], [268, 902]]); const [cx, cy, cw, ch] = bbox(cream);
    N.push(box(cx, cy, cw, ch, { background: "linear-gradient(135deg,#f6e6bd,#e4c98f)", clipPath: `polygon(${cream.map(([a, b]) => `${a - cx}px ${b - cy}px`).join(",")})` }));
    N.push(box(0, Y(901) - 1.75, X(470), 3.5, { background: GOLD_H }));
    const bx = X(20), by = Y(763), bw = X(246), bh = Y(901) - Y(763);
    N.push(goldBox(bx, by, bw, bh, 3.5, 22, "#0a1a44", null));
    const tx = X(26), ty = by + 14 * K, tw = X(118), th = 30 * K;
    N.push(box(tx, ty, tw, th, { background: GOLD_D, borderRadius: 6 }));
    N.push(text("anton", up(f.m2_badge), tx + tw / 2, ty + th - 7 * K, { size: 23 * K, maxW: tw - 16, color: "#3a2204" }));
    const m = T(f.m2_price).match(/^\s*(R\$)?\s*([\d.,]+)\s*(.*)$/i), base = by + 85 * K;
    if (!m) N.push(text("m8", T(f.m2_price), bx + bw / 2, base, { size: 46 * K, maxW: bw - 20 }));
    else { const parts = [[m[1] || "", 36 * K], [m[2], 54 * K], [m[3] || "", 26 * K]].filter(([t]) => t); const maxW = bw - 24; let sc = 1;
      const wAt = (k) => parts.reduce((a, [t, s2], i) => a + measure("m8", t, s2 * k) + (i ? 5 * K : 0), 0); while (wAt(sc) > maxW && sc > 0.4) sc -= 0.02;
      let cx2 = bx + (bw - wAt(sc)) / 2;
      parts.forEach(([t, s2], i) => { N.push(text("m8", t, cx2, base, { size: s2 * sc, align: "left", ...(i === 1 ? { grad: GOLD_T } : {}) })); cx2 += measure("m8", t, s2 * sc) + 5 * K; }); }
    N.push(text("m7", up(f.m2_condo), bx + bw / 2, by + 116 * K, { size: 19 * K, maxW: bw - 22, color: "#e9bf5c" }));
    const sx = X(327), sy = (Y(800) + Y(902)) / 2;
    N.push(iconSvg("shield", sx, sy, 56 * K, { color: "#0d2250", sw: 2.4 }));
    const gtxt = up(f.m2_guarantee), gw = X(168), ghh = Y(902) - Y(800) - 20; let size = 17 * K, lines = [];
    for (; size >= 11; size -= 0.5) { lines = wrap("m8", gtxt, size, gw); if (lines.length <= 4 && lines.length * size * 1.2 <= ghh && lines.every((l) => measure("m8", l, size) <= gw)) break; }
    const lh = size * 1.2, top = sy - (lines.length - 1) * lh / 2 + size * 0.34;
    lines.forEach((l, i) => N.push(text("m8", l, X(361), top + i * lh, { size, color: "#0d2250", align: "left" }))); }
  // rodapé
  N.push(iconSvg("whatsapp", X(60), Y(957), 62 * K, { grad: true, sw: 1.6 }));
  N.push(text("m6", "AGENDE SUA VISITA:", X(110), Y(948), { size: 17.5 * K, maxW: X(260), color: "#e9d28f", align: "left" }));
  N.push(text("m8", "(13) 98210-8455", X(108), Y(988), { size: 42 * K, maxW: X(300), align: "left", grad: GOLD_T }));
  N.push(...(await logo(X(498), Y(826), X(172))));
  return renderLayer(N.filter(Boolean), W, H, OUTW);
}
