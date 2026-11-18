// Biblioteca de geração de HTML (posicionamento absoluto, espaço de design 768x1376).
import fs from "node:fs";
const ROOT = "/home/claude/imobilegeneration/";
export const A = (n) => `file://${ROOT}assets/${n}`;
const fontFace = (fam, file, w = 400) => `@font-face{font-family:"${fam}";src:url("file://${ROOT}assets/fonts/${file}") format("woff");font-weight:${w}}`;
export const CSS = `
${fontFace("Anton", "anton-latin-400-normal.woff")}${fontFace("Script", "great-vibes-latin-400-normal.woff")}
${fontFace("Mont6", "montserrat-latin-600-normal.woff")}${fontFace("Mont7", "montserrat-latin-700-normal.woff")}${fontFace("Mont8", "montserrat-latin-800-normal.woff")}
${fontFace("Play7", "playfair-display-latin-700-normal.woff")}${fontFace("Cond4", "roboto-condensed-latin-400-normal.woff")}${fontFace("Cond5", "roboto-condensed-latin-500-normal.woff")}${fontFace("Cond7", "roboto-condensed-latin-700-normal.woff")}
${fontFace("Kaushan", "kaushan-script-latin-400-normal.woff")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:768px;height:1376px;overflow:hidden;background:#050e26}
#c{position:absolute;left:0;top:0;width:768px;height:1376px;overflow:hidden;
 background:linear-gradient(180deg,#0b1d46 0%,#08173a 50%,#050e26 100%)}
.abs{position:absolute}
.glow{position:absolute;inset:0}
.t{position:absolute;white-space:nowrap;line-height:1;transform-origin:0 0;font-kerning:normal}
.tw{position:absolute;line-height:1.15}
.bm{display:inline-block;width:0;height:0}
.gold{isolation:isolate}
.gold::before{content:attr(data-t);position:absolute;left:0;top:0;z-index:0;color:#5a3606;-webkit-text-stroke:var(--sw,5px) #5a3606;text-shadow:0 4px 10px rgba(0,0,0,.6);letter-spacing:inherit}
.gold>span{position:relative;z-index:1;display:inline-block;background:linear-gradient(180deg,#fff3c2 0%,#f4d27a 22%,#e9bf5c 45%,#d99f33 70%,#9a6212 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:1px rgba(255,244,190,.65)}
.gold2>span{background:linear-gradient(180deg,#f9e6a0 0%,#e9bf5c 40%,#e2ad43 62%,#a8701a 100%);-webkit-text-stroke:0}
.ph{position:absolute;overflow:visible;filter:drop-shadow(0 4px 7px rgba(0,0,0,.6))}
.ph>div{position:absolute;inset:0;background:#050c20;overflow:hidden}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
svg.v{position:absolute;left:0;top:0;width:768px;height:1376px;overflow:visible}
.ico{position:absolute}
`;
export const svgDefs = `<defs>
<linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a6212"/><stop offset=".25" stop-color="#e9bf5c"/><stop offset=".45" stop-color="#fff3c2"/><stop offset=".62" stop-color="#e2ad43"/><stop offset="1" stop-color="#8a540d"/></linearGradient>
<linearGradient id="gh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a6212"/><stop offset=".25" stop-color="#e9bf5c"/><stop offset=".45" stop-color="#fff3c2"/><stop offset=".62" stop-color="#e2ad43"/><stop offset="1" stop-color="#8a540d"/></linearGradient>
<linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6212"/><stop offset=".25" stop-color="#e9bf5c"/><stop offset=".45" stop-color="#fff3c2"/><stop offset=".62" stop-color="#e2ad43"/><stop offset="1" stop-color="#8a540d"/></linearGradient>
<linearGradient id="cream" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e6bd"/><stop offset="1" stop-color="#e4c98f"/></linearGradient>
<filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".5"/></filter>
<filter id="gl" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#ffc850" flood-opacity=".6"/></filter>
</defs>`;
export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const up = (s) => String(s ?? "").trim().toUpperCase();
const FONT = { anton: "Anton", script: "Script", m6: "Mont6", m7: "Mont7", m8: "Mont8", play: "Play7", c4: "Cond4", c5: "Cond5", c7: "Cond7", kaushan: "Kaushan" };

// Texto de 1 linha: baseline em `by`, ancorado em x (ax l|c|r), reduzido até caber em maxW.
export function t(text, { x, by, size, font = "anton", color = "#fff", ax = "c", maxW, ls = 0, gold = 0, sw, shadow, rot = 0, extra = "" }) {
  const s = String(text ?? "").trim();
  if (!s) return "";
  const style = `left:${x}px;top:${by}px;font:${size}px/1 '${FONT[font]}';letter-spacing:${ls}em;${gold ? "" : `color:${color};`}${shadow ? `text-shadow:${shadow};` : ""}${sw ? `--sw:${sw}px;` : ""}${extra}`;
  const attrs = `data-by="${by}" data-ax="${ax}" data-size="${size}" ${maxW ? `data-maxw="${maxW}"` : ""} ${rot ? `data-rot="${rot}"` : ""}`;
  if (gold) return `<div class="t gold ${gold === 2 ? "gold2" : ""}" ${attrs} data-t="${esc(s)}" style="${style}"><span><i class="bm"></i>${esc(s)}</span></div>`;
  return `<div class="t" ${attrs} style="${style}"><i class="bm"></i>${esc(s)}</div>`;
}
// Texto com quebra: caixa de largura bw, até `max` linhas; cy (centro vertical) ou by (baseline da 1ª linha).
export function tw(text, { x, bw, size, font = "m6", color = "#fff", ax = "l", max = 3, lh = 1.15, cy, by, minSize = 10, gold = 0, rot = 0, firstColor, extra = "" }) {
  const s = String(text ?? "").trim();
  if (!s) return "";
  const words = s.split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
  const bg = gold ? `background:linear-gradient(180deg,#fff3c2,#e9bf5c 50%,#a8701a);-webkit-background-clip:text;background-clip:text;color:transparent;` : `color:${color};`;
  return `<div class="tw" data-ax="${ax}" data-bw="${bw}" data-size="${size}" data-max="${max}" data-lh="${lh}" data-min="${minSize}" ${cy != null ? `data-cy="${cy}"` : `data-by="${by}"`} ${rot ? `data-rot="${rot}"` : ""} ${firstColor ? `data-first="${firstColor}"` : ""} style="left:${x}px;width:${bw}px;font:${size}px/${lh} '${FONT[font]}';text-align:${ax === "l" ? "left" : ax === "r" ? "right" : "center"};${bg}${extra}"><i class="bm"></i>${words}</div>`;
}
export const SCRIPT = `
(async()=>{
await Promise.all([...document.images].map(i=>i.complete&&i.naturalWidth?1:new Promise(r=>{i.onload=r;i.onerror=r;})));
await document.fonts.ready;
for(const f of ["Anton","Script","Mont6","Mont7","Mont8","Play7","Cond4","Cond5","Cond7","Kaushan"]) await document.fonts.load("20px "+f);
const place=(el,rot,ax)=>{
  const by=+el.dataset.by, bm=el.querySelector('.bm');
  const off=bm.getBoundingClientRect().bottom-el.getBoundingClientRect().top;
  el.style.top=(by-off)+'px';
  const tx=ax==='c'?'-50%':ax==='r'?'-100%':'0';
  el.style.transformOrigin=(ax==='c'?'50%':ax==='r'?'100%':'0')+' '+off+'px';
  el.style.transform='translateX('+tx+')'+(rot?' rotate('+rot+'deg)':'');
};
for(const el of document.querySelectorAll('.t')){
  let s=+el.dataset.size, mw=+el.dataset.maxw||0;
  const ls=el.style.letterSpacing;
  el.style.fontSize=s+'px';
  if(mw) while(s>8 && el.getBoundingClientRect().width>mw){ s-=0.5; el.style.fontSize=s+'px'; }
  place(el, +el.dataset.rot||0, el.dataset.ax);
}
for(const el of document.querySelectorAll('.tw')){
  let s=+el.dataset.size, mx=+el.dataset.max, lh=+el.dataset.lh, mn=+el.dataset.min, bw=+el.dataset.bw;
  const lines=()=>Math.round((el.getBoundingClientRect().height)/(s*lh));
  const overflow=()=>[...el.querySelectorAll('.w')].some(w=>w.getBoundingClientRect().width>bw+0.5);
  el.style.fontSize=s+'px';
  while(s>mn && (lines()>mx||overflow())){ s-=0.5; el.style.fontSize=s+'px'; }
  const n=Math.max(1,lines());
  let by;
  if(el.dataset.cy!==undefined) by=+el.dataset.cy-((n-1)*lh*s)/2+s*0.34; else by=+el.dataset.by;
  el.dataset.by=by;
  if(el.dataset.first){ let top0=null; for(const w of el.querySelectorAll('.w')){ const t=Math.round(w.offsetTop); if(top0===null) top0=t; if(t===top0) w.style.color=el.dataset.first; } }
  const ax=el.dataset.ax;
  const bm=el.querySelector('.bm');
  const off=bm.getBoundingClientRect().bottom-el.getBoundingClientRect().top;
  el.style.top=(by-off)+'px';
  const rot=+el.dataset.rot||0;
  const left=parseFloat(el.style.left);
  if(ax==='c') el.style.left=(left-bw/2)+'px'; else if(ax==='r') el.style.left=(left-bw)+'px';
  if(rot){ el.style.transformOrigin=(bw/2)+'px '+off+'px'; el.style.transform='rotate('+rot+'deg)'; }
}
window.__ready=true;
})();`;

export function sparkles(count = 70, seed = 7) {
  let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let o = "";
  for (let i = 0; i < count; i++) { const x = rnd() * 768, y = rnd() * 1376, r = 0.6 + rnd() * 1.6, a = 0.15 + rnd() * 0.45; o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#f6dc8a" opacity="${a.toFixed(2)}"/>`; }
  return `<svg class="v">${o}</svg>`;
}
export const glows = (list) => list.map(([x, y, r, a]) => `<div class="glow" style="background:radial-gradient(circle ${r}px at ${x}px ${y}px,rgba(40,80,170,${a}),rgba(40,80,170,0))"></div>`).join("");

// Foto recortada com clip-path polygon (pts absolutos) — a moldura vai no SVG.
export function polyPhoto(src, pts, focus = "50% 50%") {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys), w = Math.max(...xs) - x, h = Math.max(...ys) - y;
  const cp = pts.map(([px, py]) => `${(px - x).toFixed(1)}px ${(py - y).toFixed(1)}px`).join(",");
  return `<div class="ph" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div style="clip-path:polygon(${cp})">${src ? `<img src="${src}" style="object-position:${focus}">` : ""}</div></div>`;
}
export const polyStr = (pts) => pts.map((p) => p.map((v) => +v.toFixed(1)).join(",")).join(" ");
export function goldPoly(pts, lw = 4.5, grad = "gd") { return `<polygon points="${polyStr(pts)}" fill="none" stroke="url(#${grad})" stroke-width="${lw}" stroke-linejoin="round"/>`; }

// Ícones
export const PATH = {
  pin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  phone: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  shield: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
};
export const iconFill = (name, cx, cy, size, fill) => `<svg class="ico" style="left:${cx - size / 2}px;top:${cy - size / 2}px" width="${size}" height="${size}" viewBox="0 0 24 24"><path d="${PATH[name]}" fill="${fill}"/></svg>`;
const LINE = {
  house: "M4 24L24 6L44 24M9 20V42H39V20M20 42V29H28V42",
  calendar: "M8 12H40Q44 12 44 16V40Q44 44 40 44H8Q4 44 4 40V16Q4 12 8 12M4 22H44M14 6V16M34 6V16M11 29H15M22 29H26M33 29H37M11 37H15M22 37H26",
};
export const iconLine = (name, cx, cy, size, stroke, lw = 2.6) => `<svg class="ico" style="left:${cx - size / 2}px;top:${cy - size / 2}px;overflow:visible" width="${size}" height="${size}" viewBox="0 0 48 48"><path d="${LINE[name]}" fill="none" stroke="${stroke}" stroke-width="${lw * 48 / size}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const img = (name, cx, cy, h) => `<img class="abs" src="${A(name)}" style="height:${h}px;left:0;top:${cy - h / 2}px;transform:translateX(${cx}px) translateX(-50%)">`;

// Logo SM (monograma + nome)
export function logo(x, y, w) {
  const u = w / 100, cx = x + w / 2, mw = 58 * u;
  let o = `<img class="abs" src="${A("monogram.png")}" style="left:${cx - mw / 2}px;top:${y}px;width:${mw}px">`;
  o += t("SAMIA MOHAMED", { x: cx, by: y + 71 * u, size: 11 * u, font: "play", ls: 0.13, maxW: w, extra: "background:linear-gradient(180deg,#fff3c2,#e9bf5c 45%,#b07a1e);-webkit-background-clip:text;background-clip:text;color:transparent;" });
  o += t("CORRETORA DE IMÓVEIS", { x: cx, by: y + 82 * u, size: 4.6 * u, font: "m6", ls: 0.24, color: "#e9bf5c", maxW: 76 * u });
  o += t("CRECI 76026", { x: cx, by: y + 101.5 * u, size: 4.6 * u, font: "m6", ls: 0.28, color: "#e9bf5c", maxW: 50 * u });
  const ln = (a, b, yy) => `<line x1="${a}" x2="${b}" y1="${yy}" y2="${yy}" stroke="#e9bf5c" stroke-width="${Math.max(1, 0.5 * u)}"/>`;
  o += `<svg class="v">${ln(x - u, x + 8 * u, y + 80.4 * u)}${ln(x + 92 * u, x + 101 * u, y + 80.4 * u)}${ln(x + 12 * u, x + 38 * u, y + 91 * u)}${ln(x + 62 * u, x + 88 * u, y + 91 * u)}</svg>`;
  o += iconLine("house", cx, y + 91 * u, 11 * u, "#e9bf5c", Math.max(1.2, 0.7 * u));
  return o;
}
export const dataUrl = (b) => `data:image/jpeg;base64,${b.toString("base64")}`;
export const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div id="c">${body}</div><script>${SCRIPT}</script></body></html>`;
export function svgIcon(name, cx, cy, size, stroke = "#e9bf5c", sw = 1.8) {
  const raw = fs.readFileSync(`${ROOT}assets/icons/${name}.svg`, "utf8");
  const inner = raw.replace(/^[\s\S]*?<svg[\s\S]*?>/, "").replace(/<\/svg>\s*$/, "").replace(/<path stroke="none"[^>]*>/, "");
  return `<svg class="ico" style="left:${cx - size / 2}px;top:${cy - size / 2}px;overflow:visible" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
import { createRequire } from "node:module";
const _req = createRequire(ROOT + "package.json");
let _cv, _ctx;
export function measure(text, font, size) {
  if (!_ctx) {
    const { GlobalFonts, createCanvas } = _req("@napi-rs/canvas");
    const d = ROOT + "assets/fonts/";
    GlobalFonts.registerFromPath(d + "anton-latin-400-normal.woff", "Anton"); GlobalFonts.registerFromPath(d + "montserrat-latin-800-normal.woff", "Mont8");
    _cv = createCanvas(10, 10); _ctx = _cv.getContext("2d");
  }
  _ctx.font = `${size}px "${font}"`; return _ctx.measureText(text).width;
}
// Catmull-Rom + cantos arredondados (geometria dos modos 2/3)
export function smooth(pts, n = 8) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let t = 0; t < n; t++) { const u = t / n, u2 = u * u, u3 = u2 * u; out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3))); }
  }
  out.push(pts[pts.length - 1]); return out;
}
export function rounded(pts, r) {
  const out = [], n = pts.length;
  for (let i = 0; i < n; i++) {
    const rad = Array.isArray(r) ? r[i] : r, p = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    if (!rad) { out.push(p); continue; }
    const va = [a[0] - p[0], a[1] - p[1]], vb = [b[0] - p[0], b[1] - p[1]], la = Math.hypot(...va), lb = Math.hypot(...vb);
    const ra = Math.min(rad, la / 2), rb = Math.min(rad, lb / 2);
    const s = [p[0] + va[0] / la * ra, p[1] + va[1] / la * ra], e = [p[0] + vb[0] / lb * rb, p[1] + vb[1] / lb * rb];
    for (let t = 0; t <= 6; t++) { const u = t / 6; out.push([(1 - u) * (1 - u) * s[0] + 2 * (1 - u) * u * p[0] + u * u * e[0], (1 - u) * (1 - u) * s[1] + 2 * (1 - u) * u * p[1] + u * u * e[1]]); }
  }
  return out;
}
export const GOLDTXT = "background:linear-gradient(180deg,#fff3c2,#e9bf5c 50%,#b07a1e);-webkit-background-clip:text;background-clip:text;color:transparent;";
