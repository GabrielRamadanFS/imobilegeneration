import { vicon, Doc, goldText, plain, polyD, rrectD, asset, imgSize, prepPhoto, bbox, photoPoly, background, sparkles, star4, logo, iconFill, tpath, wrap, width, fitSize, up, Tm, BROKER, GOLD_STOPS, r2 } from "./lib.js";

const TW = 682, TH = 1024, W = 768, H = 1376, K = W / TW, EXTRA = H - TH * K;
const ex = (y) => EXTRA * Math.min(1, Math.max(0, (y - 260) / (800 - 260)));
const P = ([x, y]) => [x * K, y * K + ex(y)], Y = (y) => y * K + ex(y), X = (x) => x * K, PP = (p) => p.map(P);
const ICONS = ["bed", "sofa", "bbq", "car", "party"];
export async function init() {}

function smooth(pts, n = 8) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let t = 0; t < n; t++) { const u = t / n, u2 = u * u, u3 = u2 * u; out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3))); }
  }
  out.push(pts[pts.length - 1]); return out;
}
function rounded(pts, r) {
  const out = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const rad = Array.isArray(r) ? r[i] : r; const p = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    if (!rad) { out.push(p); continue; }
    const va = [a[0] - p[0], a[1] - p[1]], vb = [b[0] - p[0], b[1] - p[1]], la = Math.hypot(...va), lb = Math.hypot(...vb);
    const ra = Math.min(rad, la / 2), rb = Math.min(rad, lb / 2);
    const s = [p[0] + va[0] / la * ra, p[1] + va[1] / la * ra], e = [p[0] + vb[0] / lb * rb, p[1] + vb[1] / lb * rb];
    for (let t = 0; t <= 6; t++) { const u = t / 6; out.push([(1 - u) ** 2 * s[0] + 2 * (1 - u) * u * p[0] + u * u * e[0], (1 - u) ** 2 * s[1] + 2 * (1 - u) * u * p[1] + u * u * e[1]]); }
  }
  return out;
}
const CURVE = [[278, 0], [290, 30], [310, 60], [328, 90], [333, 110], [330, 150], [322, 200], [308, 225], [292, 245], [272, 280], [255, 310], [245, 350], [237, 390], [233, 412]];

export async function buildMode2(f, photos, OUTW = 1440) {
  const SC = OUTW / 768, d = new Doc(W, H);
  const mono = asset("monogram.png"); const [mw, mh] = await imgSize("monogram.png");
  const pick = (i) => photos[i % photos.length];
  const heroPts = [...smooth(PP(CURVE)), P([682, 412]), P([682, 0])];
  const L = rounded(PP([[236, 411], [456, 411], [456, 586], [262, 586]]), [18, 0, 0, 14]);
  const R = rounded(PP([[458, 411], [682, 411], [682, 586], [458, 586]]), [18, 0, 0, 0]);
  const B = rounded(PP([[262, 587], [682, 587], [682, 800], [270, 800], [258, 768], [215, 762]]), [20, 0, 0, 0, 0, 6]);
  const sets = [heroPts, L, R, B];
  const uris = []; for (let i = 0; i < 4; i++) { const b = bbox(sets[i]); uris.push(await prepPhoto(pick(i), b[2], b[3], SC)); }

  background(d, W, H, [[W * 0.85, H * 0.12, 420, 0.15], [W * 0.1, H * 0.7, 380, 0.15], [100, 300, 300, 0.1]], 80);
  // ordem: hero, L, R, B
  photoPoly(d, heroPts, uris[0], { lw: 4, inner: false });
  swoosh(d);
  photoPoly(d, L, uris[1], { lw: 3.5 }); photoPoly(d, R, uris[2], { lw: 3.5 }); photoPoly(d, B, uris[3], { lw: 3.5 });
  header(d, f);
  features(d, f);
  priceAndGuarantee(d, f);
  footer(d, f, mono, mh / mw);
  return d.svg();
}

function swoosh(d) {
  const q = smooth(PP(CURVE)); const dd = polyD(q).replace(/Z$/, "");
  const g = d.grad(GOLD_STOPS, { x1: 0, y1: 0, x2: 0, y2: H * 0.5, units: "userSpaceOnUse" });
  d.add(`<path d="${dd}" fill="none" stroke="#ffd36a" stroke-opacity=".65" stroke-width="14" stroke-linecap="round" filter="url(#fBlur5)"/>`);
  d.add(`<path d="${dd}" fill="none" stroke="#3b2204" stroke-opacity=".6" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/>`);
  d.add(`<path d="${dd}" fill="none" stroke="${g}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" filter="url(#fBevelS)"/>`);
  d.add(`<path d="${dd}" transform="translate(-6 0)" fill="none" stroke="#f3d27a" stroke-opacity=".75" stroke-width="1.2" stroke-linecap="round"/>`);
  const [sx, sy] = P([333, 110]); d.add(star4(sx - 1, sy, 14, 0.85));
}

function header(d, f) {
  d.add(plain(up(f.m2_mod), X(22), Y(78), { font: "m7", size: 31 * K, maxW: X(250), anchor: "start", fill: "#f0d889" }).svg);
  const name = up(f.m2_neighborhood); const maxW = X(262); let size = 58 * K, lines = [];
  for (; size >= 24; size--) { lines = wrap("m8", name, size, maxW); if (lines.length <= 2 && lines.every((l) => width("m8", l, size) <= maxW)) break; }
  const lh = 52 * K;
  lines.slice(0, 2).forEach((l, i) => { const b = Y(137) + i * lh; d.add(goldText(d, l, X(22), b, { size, font: "m8", depth: 0.8, anchor: "start" }).svg); });
  const nl = Math.min(lines.length, 2), yCity = Y(137) + (nl - 1) * lh + 46 * K;
  d.add(goldText(d, up(f.m2_city), X(22), yCity, { size: 37 * K, maxW, font: "m8", depth: 0.8, anchor: "start" }).svg);
  const py = yCity + 20 * K, ph = 40 * K;
  const g = d.grad([[0, "#fbefc9"], [1, "#e4c485"]]);
  d.add(`<g filter="url(#fShadowS)"><path d="${rrectD(X(20), py, X(245), ph, ph / 2)}" fill="${g}"/></g><path d="${rrectD(X(20) + 2.5, py + 2.5, X(245) - 5, ph - 5, ph / 2 - 2)}" fill="none" stroke="#b8862b" stroke-opacity=".5" stroke-width=".9"/>`);
  d.add(iconFill("pin", X(46), py + ph / 2, 22 * K, "#0a1a3d"));
  d.add(plain(up(f.m2_dist), X(64), py + ph / 2 + 7 * K, { font: "m7", size: 19 * K, maxW: X(192), anchor: "start", fill: "#0a1a3d" }).svg);
}

const ROWS = [358, 430, 504, 588, 658];
function features(d, f) {
  const items = [f.m2_f1, f.m2_f2, f.m2_f3, f.m2_f4, f.m2_f5].map(Tm).filter(Boolean);
  const ig = d.grad([[0, "#fff1b0"], [0.5, "#e2ad43"], [1, "#a8691a"]]);
  items.forEach((text, i) => {
    const cy = Y(ROWS[i]);
    d.add(`<g filter="url(#fShadowS)">${vicon(ICONS[i], X(46), cy, 44 * K, "#e9bf5c", 1.5)}</g>`);
    const mw = X(150); let size = 21 * K, lines = [];
    for (; size >= 12; size -= 0.5) { lines = wrap("m6", up(text), size, mw); if (lines.length <= 4 && lines.every((l) => width("m6", l, size) <= mw)) break; }
    const lh = size * 1.18, top = cy - ((lines.length - 1) * lh) / 2 + size * 0.34;
    lines.forEach((l, k) => d.add(plain(l, X(80), top + k * lh, { font: "m6", size, anchor: "start", min: 6 }).svg));
  });
}

function priceAndGuarantee(d, f) {
  const cream = PP([[268, 800], [540, 800], [525, 832], [505, 872], [470, 902], [268, 902]]);
  const cg = d.grad([[0, "#f8ead0"], [0.5, "#f0dcb0"], [1, "#e0c48c"]], { x1: X(268), y1: Y(800), x2: X(540), y2: Y(902), units: "userSpaceOnUse" });
  d.add(`<g filter="url(#fShadowL)"><path d="${polyD(cream)}" fill="${cg}" stroke="${cg}" stroke-width="3" stroke-linejoin="round"/></g>`);
  d.add(`<path d="${polyD(insetPoly2(cream, 4))}" fill="none" stroke="#b8862b" stroke-opacity=".45" stroke-width=".9"/>`);
  const gh = d.grad(GOLD_STOPS, { x1: 0, y1: 0, x2: W, y2: 0, units: "userSpaceOnUse" });
  d.add(`<rect x="0" y="${Y(901) - 1.7}" width="${X(470)}" height="3.4" fill="${gh}" filter="url(#fBevelS)"/>`);
  d.add(`<path d="M0 ${Y(901)}H${X(470)}" stroke="#ffd36a" stroke-opacity=".6" stroke-width="6" filter="url(#fBlur5)"/>`);
  const bx = X(20), by = Y(763), bw = X(246), bh = Y(901) - Y(763);
  const bg = d.grad([[0, "#0e2152"], [1, "#07143a"]]); const bgg = d.grad(GOLD_STOPS, { x1: bx, y1: by, x2: bx + bw, y2: by + bh, units: "userSpaceOnUse" });
  d.add(`<g filter="url(#fShadowL)"><path d="${rrectD(bx, by, bw, bh, 22)}" fill="${bg}"/></g>`);
  d.add(`<path d="${rrectD(bx, by, bw, bh, 22)}" fill="none" stroke="#ffd36a" stroke-opacity=".5" stroke-width="9" filter="url(#fBlur5)"/>`);
  d.add(`<path d="${rrectD(bx, by, bw, bh, 22)}" fill="none" stroke="${bgg}" stroke-width="3.5" filter="url(#fBevelS)"/>`);
  d.add(`<path d="${rrectD(bx + 6, by + 6, bw - 12, bh - 12, 17)}" fill="none" stroke="#fbe6a0" stroke-opacity=".5" stroke-width=".9"/>`);
  const tx = X(26), ty = by + 14 * K, tw = X(118), th = 30 * K;
  const tg = d.grad(GOLD_STOPS, { x1: tx, y1: ty, x2: tx + tw, y2: ty + th, units: "userSpaceOnUse" });
  d.add(`<g filter="url(#fShadowS)"><path d="${rrectD(tx, ty, tw, th, 6)}" fill="${tg}" filter="url(#fBevelS)"/></g>`);
  d.add(plain(up(f.m2_badge), tx + tw / 2, ty + th - 7 * K, { font: "anton", size: 23 * K, maxW: tw - 16, fill: "#3a2204" }).svg);
  const m = Tm(f.m2_price).match(/^\s*(R\$)?\s*([\d.,]+)\s*(.*)$/i); const base = by + 85 * K;
  if (!m) d.add(plain(Tm(f.m2_price), bx + bw / 2, base, { font: "m8", size: 46 * K, maxW: bw - 20 }).svg);
  else {
    const parts = [[m[1] || "", 36 * K], [m[2], 54 * K], [m[3] || "", 26 * K]].filter(([t]) => t); const maxW = bw - 24; let sc = 1;
    const wAt = (k) => parts.reduce((a, [t, s2], i) => a + width("m8", t, s2 * k) + (i ? 5 * K : 0), 0);
    while (wAt(sc) > maxW && sc > 0.4) sc -= 0.02;
    let cx = bx + (bw - wAt(sc)) / 2;
    parts.forEach(([t, s2], i) => {
      if (i === 1) { const r = goldText(d, t, cx, base, { size: s2 * sc, font: "m8", depth: 0.6, anchor: "start" }); d.add(r.svg); cx += r.w + 5 * K; }
      else { d.add(plain(t, cx, base, { font: "m8", size: s2 * sc, anchor: "start" }).svg); cx += width("m8", t, s2 * sc) + 5 * K; }
    });
  }
  d.add(plain(up(f.m2_condo), bx + bw / 2, by + 116 * K, { font: "m7", size: 19 * K, maxW: bw - 22, fill: "#e9bf5c" }).svg);
  const sx = X(327), sy = (Y(800) + Y(902)) / 2;
  const sg = d.grad([[0, "#1a3a80"], [1, "#0a1a44"]]);
  d.add(`<g filter="url(#fShadowS)">${iconFill("shield", sx, sy, 54 * K, sg)}</g>`);
  d.add(`<path d="M${sx - 9 * K} ${sy + 1 * K}L${sx - 2 * K} ${sy + 8 * K}L${sx + 11 * K} ${sy - 8 * K}" fill="none" stroke="#f0d37c" stroke-width="${4 * K}" stroke-linecap="round" stroke-linejoin="round"/>`);
  const text = up(f.m2_guarantee), gw = X(168), ghh = Y(902) - Y(800) - 20; let size = 17 * K, lines = [];
  for (; size >= 11; size -= 0.5) { lines = wrap("m8", text, size, gw); if (lines.length <= 4 && lines.length * size * 1.2 <= ghh && lines.every((l) => width("m8", l, size) <= gw)) break; }
  const lh = size * 1.2, top = sy - ((lines.length - 1) * lh) / 2 + size * 0.34;
  lines.forEach((l, i) => d.add(plain(l, X(361), top + i * lh, { font: "m8", size, anchor: "start", fill: "#0d2250" }).svg));
}
import { insetPoly } from "./lib.js";
const insetPoly2 = (p, k) => insetPoly(p, k);

function footer(d, f, mono, ar) {
  const cy = Y(957);
  d.add(`<g filter="url(#fShadowS)">${vicon("whatsapp", X(60), cy, 66 * K, "#e9bf5c", 1.5)}</g>`);
  d.add(plain("AGENDE SUA VISITA:", X(110), Y(948), { font: "m6", size: 17.5 * K, maxW: X(260), anchor: "start", fill: "#e9d28f" }).svg);
  d.add(goldText(d, BROKER.phone, X(108), Y(988), { size: 42 * K, maxW: X(300), font: "m8", depth: 0.7, anchor: "start" }).svg);
  // painel azul escuro com curva atrás do logo (como no modelo)
  const lx = X(498), ly = Y(826), lw = X(172);
  const cp = `M${X(436)} ${Y(1024)}Q${X(438)} ${Y(925)} ${X(478)} ${Y(896)}Q${X(522)} ${Y(862)} ${X(532)} ${Y(822)}Q${X(540)} ${Y(800)} ${X(600)} ${Y(800)}H${X(682)}`;
  d.add(`<path d="${cp}V${Y(1024)}Z" fill="#040d28" opacity=".92"/>`);
  d.add(`<path d="${cp}" fill="none" stroke="#ffd36a" stroke-opacity=".5" stroke-width="8" filter="url(#fBlur5)"/>`);
  d.add(`<path d="${cp}" fill="none" stroke="${d.grad(GOLD_STOPS, { x1: X(436), y1: Y(1024), x2: X(682), y2: Y(800), units: "userSpaceOnUse" })}" stroke-width="3.5" filter="url(#fBevelS)"/>`);
  logo(d, lx, ly, lw, mono, ar);
}
