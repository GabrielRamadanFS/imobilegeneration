import { vicon, Doc, goldText, plain, polyD, rrectD, asset, imgSize, prepPhoto, bbox, photoPoly, background, sparkles, star4, logo, iconFill, iconLine, tpath, wrap, width, fitSize, up, Tm, BROKER, GOLD_STOPS, esc, r2 } from "./lib.js";

const W = 768, H = 1376, S = 1440 / 768;
const POLYS = [[[48, 284], [752, 337], [741, 514], [-16, 577]], [[106, 568], [757, 517], [743, 767], [112, 739]], [[112, 739], [743, 767], [714, 923], [86, 907]]];
const SLOT4 = { x: 378, y: 1066, w: 372, h: 219 };

export async function buildMode1(f, photos, W_OUT = 1440) {
  const SC = W_OUT / 768;
  const d = new Doc(W, H);
  const mono = asset("monogram.png"); const [mw, mh] = await imgSize("monogram.png");
  const pick = (i) => photos[i % photos.length];
  const uris = [];
  for (let i = 0; i < 3; i++) { const b = bbox(POLYS[i]); uris.push(await prepPhoto(pick(i), b[2], b[3], SC)); }
  uris.push(await prepPhoto(pick(3), SLOT4.w, SLOT4.h, SC));

  background(d, W, H, [[640, 160, 420, 0.2], [120, 900, 380, 0.14], [400, 1150, 360, 0.1], [160, 60, 260, 0.12]], 90);
  // feixes de luz diagonais atrás do cabeçalho
  d.add(`<g opacity=".5">${[[-40, 150, 420, -20, 0.5], [60, 250, 700, 130, 0.25]].map(([x1, y1, x2, y2, o]) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${d.grad([[0, "#ffd36a", 0], [0.5, "#ffe9a3", o], [1, "#ffd36a", 0]], { x1, y1, x2, y2, units: "userSpaceOnUse" })}" stroke-width="1.5"/>`).join("")}</g>`);
  // canto dourado
  d.add(`<image href="${asset("corner.png")}" x="0" y="0" width="160" height="125"/>`);
  d.add(`<circle cx="22" cy="14" r="60" fill="${d.rgrad([[0, "#ffe9a3", 0.5], [1, "#ffd36a", 0]], 22, 14, 60)}"/>`);
  logo(d, 38, 24, 236, mono, mh / mw);
  // halo atrás do monograma
  // ---- cabeçalho
  d.add(`<ellipse cx="525" cy="150" rx="250" ry="90" fill="${d.rgrad([[0, "#3c6ad0", 0.28], [1, "#3c6ad0", 0]], 525, 150, 250)}"/>`);
  d.add(plain(up(f.m1_pre), 525, 94, { font: "anton", size: 66, maxW: 440, fill: "#fff", shadow: true }).svg);
  d.add(goldText(d, up(f.m1_main), 525, 196, { size: 132, maxW: 450, font: "m8", depth: 2.5, glow: true }).svg);
  // barra do bairro
  const barG = d.grad([[0, "#a9701a"], [0.25, "#ecc766"], [0.5, "#fff1b8"], [0.75, "#e2ad43"], [1, "#a9701a"]], { x1: 314, y1: 218, x2: 738, y2: 264, units: "userSpaceOnUse" });
  d.add(`<g filter="url(#fShadowS)"><path d="${rrectD(314, 218, 424, 46, 5)}" fill="${barG}" filter="url(#fBevelS)"/></g><path d="${rrectD(317.5, 221.5, 417, 39, 3)}" fill="none" stroke="#fff6cf" stroke-opacity=".55" stroke-width="1"/>`);
  const loc = up(f.m1_loc); const ls = fitSize("m8", loc, 356, 22, 12); const tw = width("m8", loc, ls);
  const total = 24 + 8 + tw, sx = 526 - total / 2;
  d.add(iconFill("pin", sx + 12, 241, 26, "#0a1a3d"));
  d.add(plain(loc, sx + 32, 249, { font: "m8", size: ls, anchor: "start", fill: "#0a1a3d" }).svg);
  d.add(plain(Tm(f.m1_cursive), 526, 294, { font: "script", size: 34, maxW: 430, fill: "#f3d98a", shadow: true }).svg);

  // ---- fotos
  POLYS.forEach((p, i) => photoPoly(d, p, uris[i], { lw: 4.5 }));
  // quarta foto
  const s4 = SLOT4; const r4 = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  photoPoly(d, r4(s4.x, s4.y, s4.w, s4.h), uris[3], { lw: 4.5, shadow: "fShadowL" });

  // selo
  seal(d);
  pillars(d, f);
  priceBox(d, f);
  conditions(d, f);
  note(d, f);
  footer(d);
  return d.svg();
}

function seal(d) {
  const cx = 103, cy = 766, r = 88;
  d.add(`<g filter="url(#fShadowL)"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${d.rgrad([[0, "#173270"], [1, "#08122e"]], cx, cy - 20, r)}"/></g>`);
  d.add(`<circle cx="${cx}" cy="${cy}" r="${r - 2}" fill="none" stroke="#ffd36a" stroke-opacity=".6" stroke-width="12" filter="url(#fBlur5)"/>`);
  const g = d.grad(GOLD_STOPS, { x1: cx - r, y1: cy - r, x2: cx + r, y2: cy + r, units: "userSpaceOnUse" });
  d.add(`<circle cx="${cx}" cy="${cy}" r="${r - 2}" fill="none" stroke="#3b2204" stroke-width="10"/>`);
  d.add(`<circle cx="${cx}" cy="${cy}" r="${r - 2}" fill="none" stroke="${g}" stroke-width="8" filter="url(#fBevelS)"/>`);
  d.add(`<circle cx="${cx}" cy="${cy}" r="${r - 13}" fill="none" stroke="#fff0b4" stroke-opacity=".7" stroke-width="1.5"/>`);
  d.add(`<circle cx="${cx}" cy="${cy}" r="${r - 17}" fill="none" stroke="#e9bf5c" stroke-opacity=".35" stroke-width=".8"/>`);
  // reflexo
  d.add(`<path d="M${cx - 70} ${cy - 30}A76 76 0 0 1 ${cx + 40} ${cy - 66}A90 60 0 0 0 ${cx - 70} ${cy - 30}Z" fill="#fff" opacity=".08"/>`);
  d.add(iconLine("house", cx, 712, 24, "#e9bf5c", 2.6));
  d.add(goldText(d, "ÓTIMA", cx, 752, { size: 34, maxW: 120, depth: 1.5 }).svg);
  const gg = d.grad([[0, "#fff1b0"], [0.5, "#e2ad43"], [1, "#9a6212"]], { x1: 0, y1: 765, x2: 0, y2: 777, units: "userSpaceOnUse" });
  d.add(plain("OPORTUNIDADE", cx, 775, { font: "anton", size: 21, maxW: 128, fill: gg }).svg);
  d.add(plain("PARA MORAR OU", cx, 796, { font: "m8", size: 12, maxW: 122 }).svg);
  d.add(plain("INVESTIR!", cx, 812, { font: "m8", size: 12, maxW: 122 }).svg);
  for (const dx of [-16, 0, 16]) d.add(star4s(cx + dx, 832, 5.5));
}
const star4s = (x, y, r) => { let p = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; p += `${i ? "L" : "M"}${r2(x + Math.cos(a) * rr)} ${r2(y + Math.sin(a) * rr)}`; } return `<path d="${p}Z" fill="#e9bf5c"/>`; };

function pillars(d, f) {
  const cols = [{ icon: "house", cx: 68, w: 112, top: f.m1_p1_top, bot: f.m1_p1_bot }, { icon: "pool", cx: 203, w: 126, top: f.m1_p2_top, bot: f.m1_p2_bot }, { icon: "bed", cx: 349, w: 146, top: f.m1_p3_top, bot: f.m1_p3_bot }];
  for (const x of [136, 270]) d.add(`<rect x="${x - 0.75}" y="922" width="1.5" height="118" fill="${d.grad([[0, "#e9bf5c", 0], [0.5, "#f6dc8a", 0.8], [1, "#e9bf5c", 0]])}"/>`);
  cols.forEach((c) => {
    const ig = d.grad([[0, "#fff1b0"], [0.5, "#e2ad43"], [1, "#a8691a"]], { x1: 0, y1: 925, x2: 0, y2: 977, units: "userSpaceOnUse" });
    d.add(`<g filter="url(#fShadowS)">${vicon(c.icon, c.cx, 951, 54, "#f6dc8a", 1.5)}</g>`);
    d.add(plain(up(c.top), c.cx, 1000, { font: "c5", size: 19, maxW: c.w }).svg);
    const g = d.grad([[0, "#fff1b0"], [0.5, "#e2ad43"], [1, "#a8691a"]], { x1: 0, y1: 1006, x2: 0, y2: 1032, units: "userSpaceOnUse" });
    d.add(plain(up(c.bot), c.cx, 1029, { font: "anton", size: 28, maxW: c.w, fill: g, shadow: true }).svg);
  });
}
const ICONAR = { house: 278 / 253, pool: 1, bed: 1 }; // corrigido em runtime abaixo
export async function initIcons() {}

function priceBox(d, f) {
  const bg = d.grad([[0, "#0a1a44", 0.95], [1, "#030a1f", 0.95]]);
  const g = d.grad(GOLD_STOPS, { x1: 435, y1: 936, x2: 750, y2: 1040, units: "userSpaceOnUse" });
  d.add(`<g filter="url(#fShadowL)"><path d="${rrectD(435, 936, 315, 104, 12)}" fill="${bg}"/></g>`);
  d.add(`<path d="${rrectD(435, 936, 315, 104, 12)}" fill="none" stroke="#ffd36a" stroke-opacity=".5" stroke-width="8" filter="url(#fBlur5)"/>`);
  d.add(`<path d="${rrectD(435, 936, 315, 104, 12)}" fill="none" stroke="${g}" stroke-width="3.2" filter="url(#fBevelS)"/>`);
  d.add(`<path d="${rrectD(441, 942, 303, 92, 8)}" fill="none" stroke="#fbe6a0" stroke-opacity=".5" stroke-width=".9"/>`);
  d.add(plain("VALOR:", 458, 960, { font: "m8", size: 13, anchor: "start", fill: "#e9bf5c" }).svg);
  const raw = Tm(f.m1_price); const m = raw.match(/^\s*(R\$)?\s*([\d.,]+)\s*(.*)$/i);
  if (!m) d.add(goldText(d, raw, 592, 1010, { size: 54, maxW: 288, depth: 1.5 }).svg);
  else {
    const parts = [[m[1] || "", 30], [m[2], 54], [m[3] || "", 24]].filter(([t]) => t);
    const gap = 3, maxW = 288; let sc = 1;
    const wAt = (k) => parts.reduce((a, [t, s], i) => a + width("m8", t, s * k) + (i ? gap : 0), 0);
    while (wAt(sc) > maxW && sc > 0.4) sc -= 0.02;
    let cx = 592 - wAt(sc) / 2;
    for (const [t, s] of parts) { const r = goldText(d, t, cx, 1010, { size: s * sc, font: "m8", depth: 1.5, anchor: "start" }); d.add(r.svg); cx += r.w + gap; }
  }
  d.add(plain(Tm(f.m1_price_sub), 592, 1031, { font: "c4", size: 18, maxW: 292 }).svg);
}

function conditions(d, f) {
  const g = d.grad([[0, "#fff1b0"], [0.5, "#e2ad43"], [1, "#a8691a"]], { x1: 0, y1: 1070, x2: 0, y2: 1094, units: "userSpaceOnUse" });
  d.add(plain("CONDIÇÕES FACILITADAS:", 25, 1092, { font: "m8", size: 23, maxW: 330, anchor: "start", fill: g, shadow: true }).svg);
  [f.m1_c1, f.m1_c2, f.m1_c3, f.m1_c4].forEach((t, i) => {
    const cy = 1137 + i * 44;
    const cg = d.grad(GOLD_STOPS, { x1: 25, y1: cy - 14, x2: 53, y2: cy + 14, units: "userSpaceOnUse" });
    d.add(`<g filter="url(#fShadowS)"><circle cx="39" cy="${cy}" r="14" fill="${cg}" filter="url(#fBevelS)"/></g><circle cx="39" cy="${cy}" r="12.3" fill="none" stroke="#fff3c2" stroke-opacity=".6" stroke-width=".8"/>`);
    d.add(`<path d="M32 ${cy + .5}L37.5 ${cy + 6}L47 ${cy - 6}" fill="none" stroke="#0a1a3d" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`);
    d.add(plain(up(t), 63, cy + 7, { font: "c4", size: 21, maxW: 305, anchor: "start" }).svg);
  });
}

function note(d, f) {
  const text = Tm(f.m1_note); if (!text) return;
  const navy = [[547, 1203], [575, 1196], [610, 1190], [655, 1181], [703, 1170], [740, 1168], [768, 1174], [768, 1212], [700, 1214], [630, 1222], [565, 1228], [552, 1216]];
  const cream = [[566, 1224], [630, 1217], [700, 1209], [768, 1203], [768, 1282], [742, 1290], [690, 1296], [640, 1294], [600, 1298], [586, 1280], [576, 1262], [568, 1244]];
  const cg = d.grad([[0, "#f6e6c4"], [0.6, "#ecd5a8"], [1, "#dcc08c"]], { x1: 566, y1: 1203, x2: 768, y2: 1296, units: "userSpaceOnUse" });
  const soft = (p) => `<path d="${polyD(p)}" stroke-linejoin="round"`;
  d.add(`<g filter="url(#fShadowS)">${soft(navy)} fill="#0e1c42" stroke="#0e1c42" stroke-width="5"/>${soft(cream)} fill="${cg}" stroke="${"#ecd5a8"}" stroke-width="5"/></g>`);
  let size = 30, lines = [];
  for (; size >= 14; size--) { const w0 = wrap("kaushan", text, size, 150); lines = [w0[0], ...wrap("kaushan", w0.slice(1).join(" "), size, 196)]; if (lines.length <= 3 && lines.every((l, i) => width("kaushan", l, size) <= (i ? 196 : 150))) break; }
  const base = [[657, 1202], [661, 1243], [668, 1276]];
  lines.slice(0, 3).forEach((l, i) => {
    const { d: pd } = tpath("kaushan", l, 0, 0, size);
    d.add(`<g transform="translate(${base[i][0]} ${base[i][1]}) rotate(-6.5)"><path d="${pd}" fill="${i === 0 ? "#fff" : "#14234a"}"/></g>`);
  });
}

function footer(d) {
  d.add(`<rect x="0" y="1301" width="768" height="75" fill="#040b1f"/>`);
  d.add(`<rect x="0" y="1298" width="768" height="4" fill="${d.grad(GOLD_STOPS, { x1: 0, y1: 0, x2: 768, y2: 0, units: "userSpaceOnUse" })}" filter="url(#fBevelS)"/>`);
  d.add(`<rect x="0" y="1290" width="768" height="12" fill="${d.grad([[0, "#ffd36a", 0], [1, "#ffd36a", 0.35]])}"/>`);
  d.add(iconLine("calendar", 62, 1338, 52, d.grad(GOLD_STOPS, { x1: 36, y1: 1312, x2: 88, y2: 1364, units: "userSpaceOnUse" }), 2.6));
  d.add(plain("AGENDE SUA VISITA:", 100, 1352, { font: "anton", size: 30, maxW: 232, anchor: "start" }).svg);
  const pg = d.grad([[0, "#a9701a"], [0.3, "#ecc766"], [0.5, "#fff1b8"], [0.75, "#e2ad43"], [1, "#a9701a"]], { x1: 338, y1: 1309, x2: 752, y2: 1369, units: "userSpaceOnUse" });
  d.add(`<g filter="url(#fShadowS)"><path d="${rrectD(338, 1309, 414, 60, 30)}" fill="${pg}" filter="url(#fBevel)"/></g>`);
  d.add(`<path d="${rrectD(342, 1313, 406, 52, 26)}" fill="none" stroke="#fff6cf" stroke-opacity=".5" stroke-width=".9"/>`);
  d.add(`<circle cx="371" cy="1339" r="26" fill="#0a1a3d"/><circle cx="371" cy="1339" r="26" fill="none" stroke="#6b4408" stroke-width="1.5"/>`);
  d.add(iconFill("phone", 371, 1339, 28, "#e9bf5c"));
  d.add(plain(BROKER.phone, 565, 1354, { font: "anton", size: 44, maxW: 300, fill: "#0a1a3d" }).svg);
}
