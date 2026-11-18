import { vicon, Doc, goldText, plain, polyD, rrectD, asset, imgSize, prepPhoto, photoPoly, background, sparkles, star4, logo, iconFill, tpath, wrap, width, fitSize, up, Tm, BROKER, GOLD_STOPS, r2 } from "./lib.mjs";
const TW = 682, TH = 1024, W = 768, H = 1376, K = W / TW, EXTRA = H - TH * K;
const ex = (y) => EXTRA * Math.min(1, Math.max(0, (y - 418) / (911 - 418)));
const X = (x) => x * K, Y = (y) => y * K + ex(y), P = ([x, y]) => [X(x), Y(y)];
export async function init() {}
const spaced = (t, x, y, o) => plain(t, x, y, o).svg;

export async function buildMode3(f, photos, OUTW = 1440) {
  const SC = OUTW / 768, d = new Doc(W, H);
  const mono = asset("monogram.png"); const [mw, mh] = await imgSize("monogram.png");
  const x0 = X(22), x1 = X(313.5), x2 = X(662), ys = [Y(418), Y(583), Y(758), Y(911)];
  const cells = []; for (let r = 0; r < 3; r++) for (const [a, b] of [[x0, x1], [x1, x2]]) cells.push([a, ys[r], b, ys[r + 1]]);
  const uris = []; for (let i = 0; i < 6; i++) { const c = cells[i]; uris.push(await prepPhoto(photos[i % photos.length], c[2] - c[0], c[3] - c[1], SC)); }

  background(d, W, H, [[W * 0.85, H * 0.12, 420, 0.16], [W * 0.1, H * 0.7, 380, 0.15], [200, 150, 300, 0.12]], 80);
  decor(d);
  logo(d, X(466), Y(24), X(206), mono, mh / mw);
  title(d, f);
  priceBox(d, f);
  highlights(d, f);
  grid(d, uris, cells, [x0, x1, x2], ys);
  footer(d, f);
  return d.svg();
}

function decor(d) {
  const g = d.grad(GOLD_STOPS, { x1: X(372), y1: 0, x2: X(440), y2: Y(258), units: "userSpaceOnUse" });
  for (const [dx, lw] of [[0, 9], [-14, 1.6]]) {
    const dd = `M${X(372 + dx)} 0L${X(443 + dx)} ${Y(150)}L${X(402 + dx)} ${Y(256)}`;
    if (lw > 5) { d.add(`<path d="${dd}" fill="none" stroke="#ffd36a" stroke-opacity=".6" stroke-width="16" stroke-linejoin="miter" filter="url(#fBlur5)"/>`); d.add(`<path d="${dd}" fill="none" stroke="#3b2204" stroke-width="${lw * K + 2}" stroke-linejoin="miter"/>`); }
    d.add(`<path d="${dd}" fill="none" stroke="${g}" stroke-width="${lw * K}" stroke-linejoin="miter" ${lw > 5 ? 'filter="url(#fBevel)"' : ""}/>`);
  }
  // faixa-pincel dourada abaixo do logo
  const pg = d.grad([[0, "#d9a63f", 0], [0.15, "#e9bf5c"], [0.5, "#fff3c2"], [1, "#c8902c"]], { x1: X(318), y1: 0, x2: X(682), y2: 0, units: "userSpaceOnUse" });
  d.add(`<path d="${polyD([P([318, 262]), P([682, 248]), P([682, 268]), P([330, 267])])}" fill="${pg}" filter="url(#fBevelS)"/>`);
}

function title(d, f) {
  d.add(spaced(up(f.m3_cat), X(204), Y(52), { font: "m6", size: 21 * K, sp: 9 * K, fill: "#e9e3d0", maxW: X(250) }));
  d.add(`<ellipse cx="${X(212)}" cy="${Y(110)}" rx="${X(200)}" ry="${Y(70) - 0}" fill="${d.rgrad([[0, "#ffd36a", 0.2], [1, "#ffd36a", 0]], X(212), Y(110), X(200))}"/>`);
  d.add(goldText(d, up(f.m3_highlight), X(212), Y(155), { size: 134 * K, maxW: X(368), font: "anton", depth: 3, glow: true }).svg);
  const lg = d.grad(GOLD_STOPS, { x1: X(30), y1: 0, x2: X(392), y2: 0, units: "userSpaceOnUse" });
  for (const [a, b] of [[30, 92], [336, 392]]) d.add(`<rect x="${X(a)}" y="${Y(188) - 0.7}" width="${X(b - a)}" height="1.4" fill="${lg}"/>`);
  d.add(plain(Tm(f.m3_mod), X(214), Y(205), { font: "script", size: 66 * K, maxW: X(236), shadow: true }).svg);
  const pts = [P([28, 252]), P([52, 222]), P([386, 222]), P([362, 252])];
  const g = d.grad([[0, "#a9701a"], [0.25, "#ecc766"], [0.5, "#fff1b8"], [0.75, "#e2ad43"], [1, "#a9701a"]], { x1: X(28), y1: 0, x2: X(386), y2: 0, units: "userSpaceOnUse" });
  d.add(`<g filter="url(#fShadow)"><path d="${polyD(pts)}" fill="${g}" filter="url(#fBevel)"/></g>`);
  d.add(`<path d="${polyD(pts.map(([x, y], i) => [x + [3, 1.5, -1.5, -3][i] , y + [-2, 2.2, 2.2, -2][i]]))}" fill="none" stroke="#fff6cf" stroke-opacity=".5" stroke-width=".8"/>`);
  d.add(plain(up(f.m3_ribbon), X(207), Y(241), { font: "m7", size: 16 * K, maxW: X(300), fill: "#0a1a3d" }).svg);
}

function priceBox(d, f) {
  const x = X(25), y = Y(270), w = X(343), h = Y(412) - Y(270);
  const g = d.grad(GOLD_STOPS, { x1: x, y1: y, x2: x + w, y2: y + h, units: "userSpaceOnUse" });
  d.add(`<g filter="url(#fShadowL)"><path d="${rrectD(x, y, w, h, 8)}" fill="${d.grad([[0, "#071738", 0.8], [1, "#030a1f", 0.8]])}"/></g>`);
  d.add(`<path d="${rrectD(x, y, w, h, 8)}" fill="none" stroke="#ffd36a" stroke-opacity=".45" stroke-width="7" filter="url(#fBlur5)"/>`);
  d.add(`<path d="${rrectD(x, y, w, h, 8)}" fill="none" stroke="${g}" stroke-width="2.4" filter="url(#fBevelS)"/>`);
  d.add(`<path d="${rrectD(x + 4.5, y + 4.5, w - 9, h - 9, 5)}" fill="none" stroke="#fbe6a0" stroke-opacity=".45" stroke-width=".8"/>`);
  d.add(spaced(up(f.m3_price_lbl), X(46), Y(296), { font: "m6", size: 19 * K, sp: 5 * K, fill: "#fff", anchor: "start", maxW: X(160) }));
  const raw = Tm(f.m3_price), m = raw.match(/^\s*(R\$)?\s*([\d.,]+)\s*(.*)$/i), base = Y(398);
  if (!m) { d.add(goldText(d, raw, x + w / 2, base, { size: 110 * K, maxW: w - X(26), glow: true }).svg); return; }
  const [, cur = "", num, unit = ""] = m;
  const parts = [[cur, 58 * K], [num, 112 * K], [up(unit), 50 * K]].filter(([t]) => t); const gap = 8 * K, maxW = w - X(28); let sc = 1;
  const wAt = (k) => parts.reduce((a, [t, s], i) => a + width("anton", t, s * k) + (i ? gap : 0), 0);
  while (wAt(sc) > maxW && sc > 0.3) sc -= 0.02;
  let cx = x + (w - wAt(sc)) / 2;
  for (const [t, s] of parts) { const r = goldText(d, t, cx, base, { size: s * sc, font: "anton", depth: 3, anchor: "start", glow: s > 100 * K }); d.add(r.svg); cx += r.w + gap; }
  d.add(star4(X(366), Y(312), 15, 0.95));
}

function highlights(d, f) {
  const rows = [["sofa", f.m3_h1_t1, f.m3_h1_t2, 294, 292, 307], ["shield", f.m3_h2_t1, f.m3_h2_t2, 339, 339, 354], ["pin", f.m3_h3_t1, f.m3_h3_t2, 384, 385, 400]];
  for (const [icon, t1, t2, iy, ty, sy] of rows) {
    d.add(`<g filter="url(#fShadowS)">${vicon(icon, X(416), Y(iy), 32 * K, "#e9bf5c", 1.6)}</g>`);
    d.add(plain(up(t1), X(444), Y(ty), { font: "m7", size: 16 * K, maxW: X(220), anchor: "start" }).svg);
    d.add(plain(up(t2), X(444), Y(sy), { font: "m6", size: 11.5 * K, maxW: X(220), anchor: "start", fill: "#cdd3e0" }).svg);
  }
}

function grid(d, uris, cells, [x0, x1, x2], ys) {
  const frame = [[x0, ys[0]], [x2, ys[0]], [x2, ys[3]], [x0, ys[3]]];
  d.add(`<g filter="url(#fShadowL)"><path d="${polyD(frame)}" fill="#050c20"/></g>`);
  cells.forEach(([a, b, c, e], i) => {
    const cl = d.clip(`M${a} ${b}H${c}V${e}H${a}Z`);
    const gg = d.grad([[0, "#fff", 0.16], [0.4, "#fff", 0.03], [1, "#fff", 0]], { x1: a, y1: b, x2: a + (c - a) * 0.5, y2: e, units: "userSpaceOnUse" });
    d.add(`<g clip-path="${cl}"><image href="${uris[i]}" x="${r2(a)}" y="${r2(b)}" width="${r2(c - a)}" height="${r2(e - b)}" preserveAspectRatio="none"/><rect x="${a}" y="${b}" width="${c - a}" height="${e - b}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="14" filter="url(#fBlur5)"/><rect x="${a}" y="${b}" width="${c - a}" height="${e - b}" fill="${gg}"/></g>`);
  });
  const g = d.grad(GOLD_STOPS, { x1: x0, y1: ys[0], x2: x2, y2: ys[3], units: "userSpaceOnUse" });
  const lines = `M${x1} ${ys[0]}V${ys[3]}M${x0} ${ys[1]}H${x2}M${x0} ${ys[2]}H${x2}`;
  d.add(`<path d="${polyD(frame)}${lines}" fill="none" stroke="#ffd36a" stroke-opacity=".4" stroke-width="7" filter="url(#fBlur5)"/>`);
  d.add(`<path d="${polyD(frame)}${lines}" fill="none" stroke="#3b2204" stroke-opacity=".6" stroke-width="4.4"/>`);
  d.add(`<path d="${polyD(frame)}${lines}" fill="none" stroke="${g}" stroke-width="2.8" filter="url(#fBevelS)"/>`);
  d.add(`<path d="${polyD([[x0 + 5, ys[0] + 5], [x2 - 5, ys[0] + 5], [x2 - 5, ys[3] - 5], [x0 + 5, ys[3] - 5]])}" fill="none" stroke="#fbe6a0" stroke-opacity=".55" stroke-width=".8"/>`);
}

function footer(d, f) {
  const cg = d.grad(GOLD_STOPS, { x1: 0, y1: 0, x2: X(340), y2: 0, units: "userSpaceOnUse" });
  const cd = `M0 ${Y(958)}Q${X(120)} ${Y(1020)} ${X(335)} ${Y(1022)}`;
  d.add(`<path d="${cd}" fill="none" stroke="#ffd36a" stroke-opacity=".5" stroke-width="9" filter="url(#fBlur5)"/><path d="${cd}" fill="none" stroke="${cg}" stroke-width="3.2" filter="url(#fBevelS)"/>`);
  const ix = X(30), iy = Y(928), is = 54 * K;
  const ig = d.grad(GOLD_STOPS, { x1: ix, y1: iy, x2: ix + is, y2: iy + is, units: "userSpaceOnUse" });
  d.add(`<g filter="url(#fShadowS)"><path d="${rrectD(ix, iy, is, is, 12 * K)}" fill="${ig}" filter="url(#fBevel)"/></g>`);
  d.add(iconFill("phone", ix + is / 2, iy + is / 2, 34 * K, "#0a1a3d"));
  d.add(plain("MAIS INFORMAÇÕES E", X(94), Y(944), { font: "m6", size: 13.5 * K, maxW: X(220), anchor: "start", fill: "#dccb97" }).svg);
  d.add(plain("AGENDAR UMA VISITA", X(94), Y(961), { font: "m6", size: 13.5 * K, maxW: X(220), anchor: "start", fill: "#dccb97" }).svg);
  d.add(plain(BROKER.phone.replace(/[()]/g, ""), X(92), Y(990), { font: "m8", size: 27 * K, maxW: X(220), anchor: "start" }).svg);
  const x = X(320), y = Y(915), w = X(330), h = 95 * K, c = 14 * K;
  const plate = [[x + c, y], [x + w - c, y], [x + w, y + c], [x + w, y + h - c], [x + w - c, y + h], [x + c, y + h], [x, y + h - c], [x, y + c]];
  const pg = d.grad([[0, "#a9701a"], [0.25, "#ecc766"], [0.5, "#fff1b8"], [0.75, "#e2ad43"], [1, "#a9701a"]], { x1: x, y1: y, x2: x + w, y2: y + h, units: "userSpaceOnUse" });
  d.add(`<g filter="url(#fShadowL)"><path d="${polyD(plate)}" fill="${pg}" filter="url(#fBevel)"/></g>`);
  const ins = 5 * K;
  const inner = [[x + c + ins, y + ins], [x + w - c - ins, y + ins], [x + w - ins, y + c + ins], [x + w - ins, y + h - c - ins], [x + w - c - ins, y + h - ins], [x + c + ins, y + h - ins], [x + ins, y + h - c - ins], [x + ins, y + c + ins]];
  const cr = d.grad([[0, "#f8efd8"], [1, "#e4d0a2"]]);
  d.add(`<path d="${polyD(inner)}" fill="${cr}" stroke="#b8862b" stroke-width="1.5"/>`);
  d.add(`<path d="${polyD(inner.map(([px, py], i) => [px + (px < x + w / 2 ? 3 : -3), py + (py < y + h / 2 ? 3 : -3)]))}" fill="none" stroke="#b8862b" stroke-opacity=".4" stroke-width=".7"/>`);
  const t1 = up(f.m3_plaque1), maxW = w - 36 * K; let size = 23 * K, lines = [];
  for (; size >= 12; size -= 0.5) { lines = wrap("m8", t1, size, maxW); if (lines.length <= 2 && lines.every((l) => width("m8", l, size) <= maxW)) break; }
  const lh = size * 1.12, first = y + 31 * K + (lines.length === 1 ? lh * 0.5 : 0);
  lines.slice(0, 2).forEach((l, i) => d.add(plain(l, x + w / 2, first + i * lh, { font: "m8", size, fill: "#0d1f48" }).svg));
  d.add(plain(up(f.m3_plaque2), x + w / 2, y + h - 17 * K, { font: "m7", size: 13.5 * K, sp: 2 * K, maxW, fill: "#9a6212" }).svg);
}
