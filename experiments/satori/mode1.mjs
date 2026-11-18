import { iconSvg, h, box, text, goldText, goldBox, img, asset, assetSize, logo, sparkles, bgStyle, polyPhoto, bbox, lineIcon, fillIcon, wrap, fit, GOLD_T, GOLD_D, GOLD_H, renderLayer, toJpg, measure } from "./lib.mjs";
const W = 768, H = 1376;
const POLYS = [[[48, 284], [752, 337], [741, 514], [-16, 577]], [[106, 568], [757, 517], [743, 767], [112, 739]], [[112, 739], [743, 767], [714, 923], [86, 907]]];
const up = (t) => String(t ?? "").toUpperCase(); const T = (v) => String(v ?? "").trim();
const polyFill = (pts, style, children) => { const [x, y, w, hh] = bbox(pts); return box(x, y, w, hh, { ...style, clipPath: `polygon(${pts.map(([a, b]) => `${a - x}px ${b - y}px`).join(",")})` }, children); };

export async function buildMode1(f, photos, OUTW = 1080) {
  const SC = OUTW / W; const K = [];
  K.push(box(0, 0, W, H, bgStyle(W, H, [[640, 160, 420, 0.16], [120, 900, 380, 0.12], [400, 1150, 360, 0.08]])));
  K.push(...sparkles(W, H, 70));
  K.push(img(asset("corner.png"), 0, 0, 160, 125));
  K.push(...(await logo(38, 24, 236)));
  // cabeçalho
  K.push(text("anton", up(f.m1_pre), 525, 94, { size: 66, maxW: 440, shadow: "0 3px 8px rgba(0,0,0,.6)" }));
  K.push(goldText("m8", up(f.m1_main), 525, 196, { size: 132, maxW: 450, depth: 2.5 }));
  K.push(box(314, 218, 424, 46, { background: GOLD_D, borderRadius: 5 }));
  { const loc = up(f.m1_loc); const ls = fit("m8", loc, 22, 356, 0, 12); const tw = measure("m8", loc, ls); const sx = 526 - (24 + 8 + tw) / 2;
    K.push(fillIcon("pin", sx + 12, 241, 26, "#0a1a3d")); K.push(text("m8", loc, sx + 32, 249, { size: ls, color: "#0a1a3d", align: "left" })); }
  K.push(text("script", T(f.m1_cursive), 526, 294, { size: 34, maxW: 430, color: "#f3d98a", shadow: "0 2px 6px rgba(0,0,0,.55)" }));
  // fotos inclinadas
  for (let i = 0; i < 3; i++) K.push(...(await polyPhoto(photos[i % photos.length], POLYS[i], 4.5, SC)));
  { const s = { x: 378, y: 1066, w: 372, h: 219 };
    K.push(box(s.x, s.y, s.w, s.h, { background: "#050c20", borderRadius: 4, boxShadow: "0 4px 14px rgba(0,0,0,.6)" }));
    K.push(goldBox(s.x, s.y, s.w, s.h, 4, 4, "#050c20", null));
    K.push(...(await polyPhoto(photos[3 % photos.length], [[s.x + 4, s.y + 4], [s.x + s.w - 4, s.y + 4], [s.x + s.w - 4, s.y + s.h - 4], [s.x + 4, s.y + s.h - 4]], 0, SC))); }
  // selo
  { const cx = 103, cy = 766, r = 88;
    K.push(box(cx - r, cy - r, 2 * r, 2 * r, { borderRadius: r, backgroundImage: "radial-gradient(circle at 50% 38%,#142a5f,#08122e)", boxShadow: "0 4px 16px rgba(0,0,0,.6)" }));
    K.push(box(cx - r, cy - r, 2 * r, 2 * r, { borderRadius: r, background: GOLD_D }, box(8, 8, 2 * r - 16, 2 * r - 16, { borderRadius: r, backgroundImage: "radial-gradient(circle at 50% 38%,#142a5f,#08122e)" })));
    K.push(box(cx - r + 14, cy - r + 14, 2 * r - 28, 2 * r - 28, { borderRadius: r, border: "1.5px solid rgba(255,240,180,.6)" }));
    K.push(lineIcon("house", cx, 708, 22, { stroke: "#e9bf5c", sw: 3 }));
    K.push(goldText("anton", "ÓTIMA", cx, 752, { size: 34, maxW: 120, depth: 1.5 }));
    K.push(text("anton", "OPORTUNIDADE", cx, 775, { size: 21, maxW: 128, grad: GOLD_T }));
    K.push(text("m8", "PARA MORAR OU", cx, 796, { size: 12, maxW: 122 }), text("m8", "INVESTIR!", cx, 812, { size: 12, maxW: 122 }));
    for (const dx of [-16, 0, 16]) K.push(fillIcon("star", cx + dx, 832, 11, "#e9bf5c")); }
  // pilares
  for (const x of [136, 270]) K.push(box(x, 922, 1.5, 118, { background: "rgba(233,191,92,.55)" }));
  for (const c of [{ icon: "house", cx: 68, w: 112, t: f.m1_p1_top, b: f.m1_p1_bot }, { icon: "pool", cx: 203, w: 126, t: f.m1_p2_top, b: f.m1_p2_bot }, { icon: "bed", cx: 349, w: 146, t: f.m1_p3_top, b: f.m1_p3_bot }]) {
    K.push(iconSvg(c.icon, c.cx, 951, 54, { color: "#f4f1e8", sw: 1.5 }));
    K.push(text("c5", up(c.t), c.cx, 1000, { size: 19, maxW: c.w })); K.push(text("anton", up(c.b), c.cx, 1029, { size: 28, maxW: c.w, grad: GOLD_T }));
  }
  // preço
  K.push(goldBox(435, 936, 315, 104, 3, 12, "rgba(4,12,34,.92)", null));
  K.push(text("m8", "VALOR:", 458, 960, { size: 13, color: "#e9bf5c", align: "left" }));
  K.push(goldText("anton", T(f.m1_price), 592, 1010, { size: 54, maxW: 288, depth: 1.5 }));
  K.push(text("c4", T(f.m1_price_sub), 592, 1031, { size: 18, maxW: 292 }));
  // condições
  K.push(text("m8", "CONDIÇÕES FACILITADAS:", 25, 1092, { size: 23, maxW: 330, align: "left", grad: GOLD_T }));
  [f.m1_c1, f.m1_c2, f.m1_c3, f.m1_c4].forEach((t, i) => { const cy = 1137 + i * 44;
    K.push(box(25, cy - 14, 28, 28, { borderRadius: 14, background: GOLD_D }));
    K.push(svgCheck(25, cy - 14));
    K.push(text("c4", up(t), 63, cy + 7, { size: 21, maxW: 305, align: "left" })); });
  // nota pincelada (sobre a foto 4)
  { const navy = [[547, 1203], [575, 1196], [610, 1190], [655, 1181], [703, 1170], [740, 1168], [768, 1174], [768, 1212], [700, 1214], [630, 1222], [565, 1228], [552, 1216]];
    const cream = [[566, 1224], [630, 1217], [700, 1209], [768, 1203], [768, 1282], [742, 1290], [690, 1296], [640, 1294], [600, 1298], [586, 1280], [576, 1262], [568, 1244]];
    K.push(polyFill(navy, { background: "#0e1c42" }), polyFill(cream, { background: "linear-gradient(135deg,#f2dfba,#e3c999)" }));
    const note = T(f.m1_note); let size = 30, lines = [];
    for (; size >= 16; size--) { lines = wrap("kaushan", note, size, 196); if (lines.length <= 3 && lines.every((l) => measure("kaushan", l, size) <= 196)) break; }
    const base = [[657, 1202], [661, 1243], [668, 1276]];
    lines.slice(0, 3).forEach((l, i) => K.push(box(base[i][0], base[i][1], 0, 0, { transform: "rotate(-6.5deg)", transformOrigin: "0px 0px" }, text("kaushan", l, 0, 0, { size, color: i === 0 ? "#fff" : "#14234a" })))); }
  // rodapé
  K.push(box(0, 1301, W, 75, { background: "#040b1f" }), box(0, 1298, W, 4, { background: GOLD_H }));
  K.push(iconSvg("calendar", 62, 1338, 54, { grad: true, sw: 1.7 }));
  K.push(text("anton", "AGENDE SUA VISITA:", 100, 1352, { size: 30, maxW: 232, align: "left" }));
  K.push(box(338, 1309, 414, 60, { borderRadius: 30, background: GOLD_D }));
  K.push(box(345, 1313, 52, 52, { borderRadius: 26, background: "#0a1a3d" }), fillIcon("phone", 371, 1339, 28, "#e9bf5c"));
  K.push(text("anton", "(13) 98210-8455", 565, 1354, { size: 44, maxW: 300, color: "#0a1a3d" }));
  return renderLayer(K.filter(Boolean), W, H, OUTW);
}
function svgCheck(x, y) { return { type: "svg", props: { width: 28, height: 28, viewBox: "0 0 28 28", style: { position: "absolute", left: x, top: y }, xmlns: "http://www.w3.org/2000/svg", children: { type: "path", props: { d: "M7 14.5L12.5 20L22 8", fill: "none", stroke: "#0a1a3d", strokeWidth: 3.2, strokeLinecap: "round", strokeLinejoin: "round" } } } }; }
