import { svgIcon, iconFill, t, tw, up, svgDefs, sparkles, glows, logo, measure, GOLDTXT } from "./lib.mjs";
const TW = 682, TH = 1024, W = 768, H = 1376, K = W / TW, EXTRA = H - TH * K;
const ex = (y) => EXTRA * Math.min(1, Math.max(0, (y - 418) / (911 - 418)));
const X = (x) => x * K, Y = (y) => y * K + ex(y), P = ([x, y]) => [X(x), Y(y)];
const pl = (pts) => pts.map((p) => p.map((v) => +v.toFixed(1)).join(",")).join(" ");
export function mode3(f, ph, PHONE = "(13) 98210-8455") {
  const g = (i) => ph[i % ph.length];
  let o = glows([[W * .85, H * .12, 420, .15], [W * .1, H * .7, 380, .15]]) + sparkles();
  let v = svgDefs;
  // chevron
  for (const [dx, lw] of [[0, 9], [-14, 1.6]]) v += `<path d="M${X(372 + dx)} 0 L${X(443 + dx)} ${Y(150)} L${X(402 + dx)} ${Y(256)}" fill="none" stroke="url(#gv)" stroke-width="${lw * K}" stroke-linecap="round" filter="url(#gl)"/>`;
  v += `<polygon points="${pl([P([318, 262]), P([682, 250]), P([682, 266]), P([330, 266])])}" fill="url(#gh)"/>`;
  v += `<g stroke="url(#gh)" stroke-width="1.4"><line x1="${X(30)}" x2="${X(92)}" y1="${Y(188)}" y2="${Y(188)}"/><line x1="${X(336)}" x2="${X(392)}" y1="${Y(188)}" y2="${Y(188)}"/></g>`;
  v += `<polygon points="${pl([P([28, 252]), P([52, 222]), P([386, 222]), P([362, 252])])}" fill="url(#gd)" filter="url(#sh)"/>`;
  const bx = X(25), by = Y(270), bw = X(343), bh = Y(412) - Y(270);
  v += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="8" fill="rgba(4,12,34,.55)" stroke="url(#gd)" stroke-width="2"/>`;
  // grade (fotos como <img>, cover)
  const x0 = X(22), x1 = X(313.5), x2 = X(662), ys = [Y(418), Y(583), Y(758), Y(911)];
  let i = 0;
  for (let r = 0; r < 3; r++) for (const [a, b] of [[x0, x1], [x1, x2]]) { o += `<div class="abs" style="left:${a}px;top:${ys[r]}px;width:${b - a}px;height:${ys[r + 1] - ys[r]}px;overflow:hidden;background:#12255a"><img src="${g(i)}" style="width:100%;height:100%;object-fit:cover;display:block"></div>`; i++; }
  v += `<g stroke="url(#gd)" stroke-width="2.5" fill="none"><rect x="${x0}" y="${ys[0]}" width="${x2 - x0}" height="${ys[3] - ys[0]}"/><path d="M${x1} ${ys[0]}V${ys[3]}M${x0} ${ys[1]}H${x2}M${x0} ${ys[2]}H${x2}"/></g>`;
  // rodapé
  v += `<path d="M0 ${Y(958)} Q${X(120)} ${Y(1020)} ${X(335)} ${Y(1022)}" fill="none" stroke="url(#gh)" stroke-width="3"/>`;
  const ix = X(30), iy = Y(928), is = 54 * K;
  v += `<rect x="${ix}" y="${iy}" width="${is}" height="${is}" rx="${12 * K}" fill="url(#gd)"/>`;
  const px = X(320), py = Y(915), pw = X(330), ph_ = 95 * K, c = 14 * K, ins = 5 * K;
  const oct = (a, b, w, h, cc) => [[a + cc, b], [a + w - cc, b], [a + w, b + cc], [a + w, b + h - cc], [a + w - cc, b + h], [a + cc, b + h], [a, b + h - cc], [a, b + cc]];
  v += `<polygon points="${pl(oct(px, py, pw, ph_, c))}" fill="url(#gd)" filter="url(#sh)"/>`;
  v += `<polygon points="${pl(oct(px + ins, py + ins, pw - 2 * ins, ph_ - 2 * ins, c))}" fill="#f2e6c6" stroke="#b8862b" stroke-width="1.5"/>`;
  o += `<svg class="v">${v}</svg>`;
  o += logo(X(466), Y(24), X(206));
  const spaced = (s, o2) => t(s, { ...o2, ls: o2.ls });
  o += t(up(f.m3_cat), { x: X(204), by: Y(52), size: 21 * K, font: "m6", ls: 0.43, color: "#e9e3d0", maxW: X(250) });
  o += t(up(f.m3_highlight), { x: X(212), by: Y(155), size: 134 * K, maxW: X(368), gold: 1, sw: 6 });
  o += t(f.m3_mod, { x: X(214), by: Y(205), size: 66 * K, font: "script", maxW: X(236), shadow: "0 3px 8px rgba(0,0,0,.55)" });
  o += t(up(f.m3_ribbon), { x: X(207), by: Y(241), size: 16 * K, font: "m7", color: "#0a1a3d", maxW: X(300) });
  o += t(up(f.m3_price_lbl), { x: X(46), by: Y(296), size: 19 * K, font: "m6", ls: 0.26, ax: "l", maxW: X(160) });
  {
    const raw = String(f.m3_price ?? "").trim(), m = raw.match(/^\s*(R\$)?\s*([\d.,]+)\s*(.*)$/i), base = Y(398);
    if (!m) o += t(raw, { x: bx + bw / 2, by: base, size: 110 * K, maxW: bw - X(26), gold: 1 });
    else {
      const parts = [[m[1] || "", 58 * K], [m[2], 112 * K], [up(m[3] || ""), 50 * K]].filter(([s]) => s), gap = 8 * K, maxW = bw - X(28);
      let sc = 1; const wAt = (k) => parts.reduce((a, [s, z], j) => a + measure(s, "Anton", z * k) + (j ? gap : 0), 0);
      while (wAt(sc) > maxW && sc > .3) sc -= .02;
      let cx = bx + (bw - wAt(sc)) / 2;
      for (const [s, z] of parts) { o += t(s, { x: cx, by: base, size: z * sc, ax: "l", gold: 1, sw: 5 }); cx += measure(s, "Anton", z * sc) + gap; }
    }
  }
  [["sofa", f.m3_h1_t1, f.m3_h1_t2, 294, 292, 307], ["shield", f.m3_h2_t1, f.m3_h2_t2, 339, 339, 354], ["pin", f.m3_h3_t1, f.m3_h3_t2, 384, 385, 400]].forEach(([ic, t1, t2, iy2, ty, sy]) => {
    o += svgIcon(ic, X(416), Y(iy2), 30 * K, "#e9bf5c", 1.6);
    o += t(up(t1), { x: X(444), by: Y(ty), size: 16 * K, font: "m7", ax: "l", maxW: X(220) });
    o += t(up(t2), { x: X(444), by: Y(sy), size: 11.5 * K, font: "m6", color: "#cdd3e0", ax: "l", maxW: X(220) });
  });
  o += iconFill("phone", ix + is / 2, iy + is / 2, 34 * K, "#0a1a3d");
  o += t("MAIS INFORMAÇÕES E", { x: X(94), by: Y(944), size: 13.5 * K, font: "m6", color: "#dccb97", ax: "l", maxW: X(220) });
  o += t("AGENDAR UMA VISITA", { x: X(94), by: Y(961), size: 13.5 * K, font: "m6", color: "#dccb97", ax: "l", maxW: X(220) });
  o += t(PHONE.replace(/[()]/g, ""), { x: X(92), by: Y(990), size: 27 * K, font: "m8", ax: "l", maxW: X(220) });
  o += tw(up(f.m3_plaque1), { x: px + pw / 2, bw: pw - 36 * K, size: 23 * K, font: "m8", color: "#0d1f48", ax: "c", max: 2, lh: 1.12, cy: py + 38 * K, minSize: 12 });
  o += t(up(f.m3_plaque2), { x: px + pw / 2, by: py + ph_ - 17 * K, size: 13.5 * K, font: "m7", ls: 0.15, color: "#9a6a12", maxW: pw - 36 * K });
  return o;
}
