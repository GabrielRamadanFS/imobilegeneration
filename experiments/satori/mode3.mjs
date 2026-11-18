import { h, box, text, goldText, goldBox, img, svgLayer, goldGradDef, ptsD, polyPhoto2, bbox, iconSvg, fillIcon, logo, sparkles, bgStyle, wrap, measure, fit, GOLD_T, GOLD_D, GOLD_H, renderLayer, b64 } from "./lib.mjs";
import sharp from "sharp";
const TW = 682, TH = 1024, W = 768, H = 1376, K = W / TW, EXTRA = H - TH * K;
const up = (t) => String(t ?? "").toUpperCase(), T = (v) => String(v ?? "").trim();
const ex = (y) => EXTRA * Math.min(1, Math.max(0, (y - 418) / (911 - 418)));
const X = (x) => x * K, Y = (y) => y * K + ex(y), P = ([x, y]) => [X(x), Y(y)];
const polyFill = (pts, style, children) => { const [x, y, w, hh] = bbox(pts); return box(x, y, w, hh, { ...style, clipPath: `polygon(${pts.map(([a, b]) => `${a - x}px ${b - y}px`).join(",")})` }, children); };
function spaced(fk, t, cx, y, { size, ls, color = "#fff", maxW, align = "center", grad }) { // texto com espaçamento entre letras
  t = T(t); if (!t) return null; return text(fk, t, cx, y, { size, ls, maxW, color, align, grad }); }

export async function buildMode3(f, photos, OUTW = 1080) {
  const SC = OUTW / W, N = [];
  N.push(box(0, 0, W, H, bgStyle(W, H, [[W * .85, H * .12, 420, .15], [W * .1, H * .7, 380, .15]])), ...sparkles(W, H, 70));
  // chevron + faixa pincel
  { const chev = (dx, lw) => `<path d="M${X(372 + dx)} 0L${X(443 + dx)} ${Y(150)}L${X(402 + dx)} ${Y(256)}" fill="none" stroke="url(#cv)" stroke-width="${lw * K}" stroke-linecap="round"/>`;
    const glow = `<path d="M${X(372)} 0L${X(443)} ${Y(150)}L${X(402)} ${Y(256)}" fill="none" stroke="#ffc850" stroke-opacity=".5" stroke-width="${9 * K}" filter="url(#bl)"/>`;
    N.push(svgLayer(W, H, glow + chev(0, 9) + chev(-14, 1.6), goldGradDef("cv", X(372), 0, X(440), Y(258)) + `<filter id="bl" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>`));
    N.push(polyFill([P([318, 262]), P([682, 250]), P([682, 266]), P([330, 266])], { background: GOLD_H })); }
  // logo + título
  N.push(...(await logo(X(466), Y(24), X(206))));
  N.push(spaced("m6", up(f.m3_cat), X(204), Y(52), { size: 21 * K, ls: 9 * K, color: "#e9e3d0", maxW: X(250) }));
  N.push(goldText("anton", up(f.m3_highlight), X(212), Y(155), { size: 134 * K, maxW: X(368), depth: 1.5 }));
  for (const [a, b] of [[30, 92], [336, 392]]) N.push(box(X(a), Y(188), X(b - a), 1.4, { background: GOLD_H }));
  N.push(text("script", T(f.m3_mod), X(214), Y(205), { size: 66 * K, maxW: X(236), shadow: "0 3px 8px rgba(0,0,0,.55)" }));
  N.push(polyFill([P([28, 252]), P([52, 222]), P([386, 222]), P([362, 252])], { background: GOLD_D }));
  N.push(text("m7", up(f.m3_ribbon), X(207), Y(241), { size: 16 * K, maxW: X(300), color: "#0a1a3d" }));
  // caixa de preço
  { const x = X(25), y = Y(270), w = X(343), hh = Y(412) - Y(270);
    N.push(goldBox(x, y, w, hh, 2, 8, "#071433", null));
    N.push(text("m6", up(f.m3_price_lbl), X(46), Y(296), { size: 19 * K, ls: 5 * K, maxW: X(160), align: "left" }));
    const m = T(f.m3_price).match(/^\s*(R\$)?\s*([\d.,]+)\s*(.*)$/i), base = Y(398);
    if (!m) N.push(goldText("anton", T(f.m3_price), x + w / 2, base, { size: 110 * K, maxW: w - X(26) }));
    else { const parts = [[m[1] || "", 58 * K], [m[2], 112 * K], [up(m[3] || ""), 50 * K]].filter(([t]) => t); const gap = 8 * K, maxW = w - X(28); let sc = 1;
      const wAt = (k) => parts.reduce((a, [t, s], i) => a + measure("anton", t, s * k) + (i ? gap : 0), 0); while (wAt(sc) > maxW && sc > 0.3) sc -= 0.02;
      let cx = x + (w - wAt(sc)) / 2; for (const [t, s] of parts) { N.push(goldText("anton", t, cx, base, { size: s * sc, align: "left", depth: 1.5 })); cx += measure("anton", t, s * sc) + gap; } } }
  // destaques
  [["sofa", f.m3_h1_t1, f.m3_h1_t2, 294, 292, 307], ["shield", f.m3_h2_t1, f.m3_h2_t2, 339, 339, 354], ["pin", f.m3_h3_t1, f.m3_h3_t2, 384, 385, 400]].forEach(([ic, t1, t2, iy, ty, sy]) => {
    N.push(iconSvg(ic, X(416), Y(iy), 34 * K * 1.1, { grad: true, sw: 1.8 }));
    N.push(text("m7", up(t1), X(444), Y(ty), { size: 16 * K, maxW: X(220), align: "left" }), text("m6", up(t2), X(444), Y(sy), { size: 11.5 * K, maxW: X(220), color: "#cdd3e0", align: "left" })); });
  // grade 3x2
  { const x0 = X(22), x1 = X(313.5), x2 = X(662), ys = [Y(418), Y(583), Y(758), Y(911)]; let i = 0;
    for (let r = 0; r < 3; r++) for (const [a, b] of [[x0, x1], [x1, x2]]) {
      const buf = photos[i % photos.length]; const w = b - a, hh = ys[r + 1] - ys[r];
      const data = await sharp(buf).rotate().resize(Math.round(w * SC), Math.round(hh * SC), { fit: "cover" }).jpeg({ quality: 90 }).toBuffer();
      N.push(img(b64(data, "image/jpeg"), a, ys[r], w, hh)); i++; }
    const lines = `<rect x="${x0}" y="${ys[0]}" width="${x2 - x0}" height="${ys[3] - ys[0]}" fill="none" stroke="url(#gr)" stroke-width="2.5"/><path d="M${x1} ${ys[0]}V${ys[3]}M${x0} ${ys[1]}H${x2}M${x0} ${ys[2]}H${x2}" stroke="url(#gr)" stroke-width="2.5" fill="none"/>`;
    N.push(svgLayer(W, H, lines, goldGradDef("gr", x0, ys[0], x2, ys[3]))); }
  // rodapé
  N.push(svgLayer(W, H, `<path d="M0 ${Y(958)}Q${X(120)} ${Y(1020)} ${X(335)} ${Y(1022)}" fill="none" stroke="url(#fc)" stroke-width="3"/>`, goldGradDef("fc", 0, 0, X(340), 0)));
  { const ix = X(30), iy = Y(928), is = 54 * K; N.push(box(ix, iy, is, is, { background: GOLD_D, borderRadius: 12 * K })); N.push(fillIcon("phone", ix + is / 2, iy + is / 2, 34 * K, "#0a1a3d")); }
  N.push(text("m6", "MAIS INFORMAÇÕES E", X(94), Y(944), { size: 13.5 * K, maxW: X(220), color: "#dccb97", align: "left" }), text("m6", "AGENDAR UMA VISITA", X(94), Y(961), { size: 13.5 * K, maxW: X(220), color: "#dccb97", align: "left" }));
  N.push(text("m8", "13 98210-8455", X(92), Y(990), { size: 27 * K, maxW: X(220), align: "left" }));
  { const x = X(320), y = Y(915), w = X(330), hh = 95 * K, c = 14 * K, ins = 5 * K;
    const oct = (x, y, w, hh, c) => [[x + c, y], [x + w - c, y], [x + w, y + c], [x + w, y + hh - c], [x + w - c, y + hh], [x + c, y + hh], [x, y + hh - c], [x, y + c]];
    N.push(box(x, y, w, hh, { boxShadow: "0 4px 10px rgba(0,0,0,.5)", background: "transparent", clipPath: "none" }));
    N.push(polyFill(oct(x, y, w, hh, c), { background: GOLD_D }));
    N.push(polyFill(oct(x + ins, y + ins, w - 2 * ins, hh - 2 * ins, c), { backgroundImage: "linear-gradient(180deg,#f6ecd3,#e6d6ae)" }));
    N.push(svgLayer(W, H, `<path d="${ptsD(oct(x + ins, y + ins, w - 2 * ins, hh - 2 * ins, c))}" fill="none" stroke="#b8862b" stroke-width="1.5"/>`));
    const t1 = up(f.m3_plaque1), maxW = w - 36 * K; let size = 23 * K, lines = [];
    for (; size >= 12; size--) { lines = wrap("m8", t1, size, maxW); if (lines.length <= 2 && lines.every((l) => measure("m8", l, size) <= maxW)) break; }
    const lh = size * 1.12, first = y + 31 * K + (lines.length === 1 ? lh * .5 : 0);
    lines.slice(0, 2).forEach((l, i) => N.push(text("m8", l, x + w / 2, first + i * lh, { size, color: "#0d1f48" })));
    N.push(spaced("m7", up(f.m3_plaque2), x + w / 2, y + hh - 17 * K, { size: 13.5 * K, ls: 2 * K, color: "#9a6a12", maxW })); }
  return renderLayer(N.filter(Boolean), W, H, OUTW);
}
