import { svgIcon, t, tw, up, svgDefs, sparkles, glows, polyPhoto, goldPoly, iconFill, iconLine, img, logo, A, esc } from "./lib.mjs";
const POLYS = [
  [[48, 284], [752, 337], [741, 514], [-16, 577]],
  [[106, 568], [757, 517], [743, 767], [112, 739]],
  [[112, 739], [743, 767], [714, 923], [86, 907]],
];
const poly = (p) => p.map((q) => q.join(",")).join(" ");
export function mode1(f, ph, BROKER = "(13) 98210-8455") {
  const g = (i) => ph[i % ph.length];
  let o = glows([[640, 160, 420, 0.16], [120, 900, 380, 0.12], [400, 1150, 360, 0.08]]) + sparkles();
  o += `<img class="abs" src="${A("corner.png")}" style="left:0;top:0;width:160px;height:125px">`;
  // fotos
  POLYS.forEach((p, i) => (o += polyPhoto(g(i), p)));
  o += `<div class="ph" style="left:378px;top:1066px;width:372px;height:219px"><div style="border-radius:4px"><img src="${g(3)}"></div></div>`;
  // vetores
  let v = svgDefs;
  POLYS.forEach((p) => (v += goldPoly(p, 4.5)));
  v += `<rect x="378" y="1066" width="372" height="219" rx="4" fill="none" stroke="url(#gd)" stroke-width="4.5"/>`;
  // barra do bairro
  v += `<rect x="314" y="218" width="424" height="46" rx="5" fill="url(#gd)" filter="url(#sh)"/>`;
  // seal
  v += `<g filter="url(#sh)"><circle cx="103" cy="766" r="88" fill="url(#seal)"/></g>
   <radialGradient id="seal" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#142a5f"/><stop offset="1" stop-color="#08122e"/></radialGradient>
   <circle cx="103" cy="766" r="86" fill="none" stroke="url(#gd)" stroke-width="8"/><circle cx="103" cy="766" r="75" fill="none" stroke="rgba(255,240,180,.6)" stroke-width="1.5"/>`;
  for (const dx of [-16, 0, 16]) { const cx = 103 + dx, cy = 832; let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 5.5 * .45 : 5.5; d += (i ? "L" : "M") + (cx + Math.cos(a) * r).toFixed(1) + "," + (cy + Math.sin(a) * r).toFixed(1); } v += `<path d="${d}Z" fill="#e9bf5c"/>`; }
  // pilares divisores
  for (const x of [136, 270]) v += `<line x1="${x}" x2="${x}" y1="922" y2="1040" stroke="rgba(233,191,92,.55)" stroke-width="1.5"/>`;
  // price box
  v += `<rect x="435" y="936" width="315" height="104" rx="12" fill="rgba(4,12,34,.85)" stroke="url(#gd)" stroke-width="3"/>`;
  // check circles
  for (let i = 0; i < 4; i++) { const cy = 1137 + i * 44; v += `<circle cx="39" cy="${cy}" r="14" fill="url(#gd)"/><path d="M32,${cy + .5} L37.5,${cy + 6} L47,${cy - 6}" fill="none" stroke="#0a1a3d" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`; }
  // note brush
  const navy = [[547, 1203], [575, 1196], [610, 1190], [655, 1181], [703, 1170], [740, 1168], [768, 1174], [768, 1212], [700, 1214], [630, 1222], [565, 1228], [552, 1216]];
  const cream = [[566, 1224], [630, 1217], [700, 1209], [768, 1203], [768, 1282], [742, 1290], [690, 1296], [640, 1294], [600, 1298], [586, 1280], [576, 1262], [568, 1244]];
  v += `<g filter="url(#sh)"><polygon points="${poly(navy)}" fill="#0e1c42"/><polygon points="${poly(cream)}" fill="url(#cream)"/></g>`;
  // footer
  v += `<rect x="0" y="1301" width="768" height="75" fill="#040b1f"/><rect x="0" y="1298" width="768" height="4" fill="url(#gh)"/>`;
  v += `<rect x="338" y="1309" width="414" height="60" rx="30" fill="url(#gd)"/><circle cx="371" cy="1339" r="26" fill="#0a1a3d"/>`;
  o += `<svg class="v">${v}</svg>`;
  o += logo(38, 24, 236);
  o += t(up(f.m1_pre), { x: 525, by: 94, size: 66, maxW: 440, shadow: "0 3px 8px rgba(0,0,0,.55)" });
  o += t(up(f.m1_main), { x: 525, by: 196, size: 132, font: "m8", maxW: 450, gold: 1, sw: 5 });
  // bairro: pin + texto
  o += t(up(f.m1_loc), { x: 546, by: 249, size: 22, font: "m8", color: "#0a1a3d", maxW: 330, ax: "c" });
  { const L = up(f.m1_loc), tw_ = Math.min(356, L.length * 22 * 0.78), total = 32 + tw_; const sx = 526 - total / 2; o = o.replace(/(<div class="t" data-by="249"[^>]*left:)546px/, `$1${sx + 32 + tw_ / 2}px`); o += iconFill("pin", sx + 12, 241, 26, "#0a1a3d"); }
  o += t(f.m1_cursive, { x: 526, by: 294, size: 34, font: "script", color: "#f3d98a", maxW: 430, shadow: "0 2px 6px rgba(0,0,0,.55)" });
  // seal text
  o += iconLine("house", 103, 712, 24, "#e9bf5c", 2.6);
  o += t("ÓTIMA", { x: 103, by: 752, size: 34, maxW: 120, gold: 1, sw: 3 });
  o += t("OPORTUNIDADE", { x: 103, by: 775, size: 21, maxW: 128, extra: "background:linear-gradient(180deg,#fff3c2,#e9bf5c 55%,#b07a1e);-webkit-background-clip:text;background-clip:text;color:transparent;" });
  o += t("PARA MORAR OU", { x: 103, by: 796, size: 12, font: "m8", maxW: 122 });
  o += t("INVESTIR!", { x: 103, by: 812, size: 12, font: "m8", maxW: 122 });
  // pilares
  const cols = [["house", 68, 112, f.m1_p1_top, f.m1_p1_bot], ["pool", 203, 126, f.m1_p2_top, f.m1_p2_bot], ["bed", 349, 146, f.m1_p3_top, f.m1_p3_bot]];
  for (const [ic, cx, w, top, bot] of cols) {
    o += svgIcon(ic, cx, 951, 54, "#f2d27a", 1.5);
    o += t(up(top), { x: cx, by: 1000, size: 19, font: "c5", maxW: w });
    o += t(up(bot), { x: cx, by: 1029, size: 28, maxW: w, extra: "background:linear-gradient(180deg,#fff3c2,#e9bf5c 50%,#c58a28);-webkit-background-clip:text;background-clip:text;color:transparent;" });
  }
  // preço
  o += t("VALOR:", { x: 458, by: 960, size: 13, font: "m8", color: "#e9bf5c", ax: "l" });
  o += t(f.m1_price, { x: 592, by: 1010, size: 54, maxW: 288, gold: 1, sw: 3 });
  o += t(f.m1_price_sub, { x: 592, by: 1031, size: 18, font: "c4", maxW: 292 });
  // condições
  o += t("CONDIÇÕES FACILITADAS:", { x: 25, by: 1092, size: 23, font: "m8", ax: "l", maxW: 330, extra: "background:linear-gradient(180deg,#fff3c2,#e9bf5c 55%,#c58a28);-webkit-background-clip:text;background-clip:text;color:transparent;" });
  [f.m1_c1, f.m1_c2, f.m1_c3, f.m1_c4].forEach((x, i) => (o += t(up(x), { x: 63, by: 1137 + i * 44 + 7, size: 21, font: "c4", ax: "l", maxW: 305 })));
  // nota
  o += tw(f.m1_note, { x: 662, bw: 196, size: 27, font: "kaushan", ax: "c", max: 3, lh: 1.25, by: 1202, color: "#14234a", firstColor: "#fff", rot: -6.5, minSize: 16 });
  // rodapé
  o += iconLine("calendar", 62, 1338, 52, "#e9bf5c", 2.6);
  o += t("AGENDE SUA VISITA:", { x: 100, by: 1352, size: 30, maxW: 232, ax: "l" });
  o += iconFill("phone", 371, 1339, 28, "#e9bf5c");
  o += t(BROKER, { x: 565, by: 1354, size: 44, maxW: 300, color: "#0a1a3d" });
  // pin da barra
  o = o.replace('<div id="pin"></div>', "");
  o += `<svg class="v">${""}</svg>`;
  return o;
}
