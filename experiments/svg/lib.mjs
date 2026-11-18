import opentype from "opentype.js";
import fs from "node:fs";
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";

const FD = new URL("./fonts/", import.meta.url).pathname;
const AD = new URL("../../assets/", import.meta.url).pathname;
const files = { anton: "anton-latin-400-normal", script: "great-vibes-latin-400-normal", m6: "montserrat-latin-600-normal", m7: "montserrat-latin-700-normal", m8: "montserrat-latin-800-normal", play: "playfair-display-latin-700-normal", c4: "roboto-condensed-latin-400-normal", c5: "roboto-condensed-latin-500-normal", c7: "roboto-condensed-latin-700-normal", kaushan: "kaushan-script-latin-400-normal" };
const fonts = {};
for (const [k, f] of Object.entries(files)) {
  const b = fs.readFileSync(`${FD}${f}.ttf`);
  fonts[k] = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
}
export const BROKER = { phone: "(13) 98210-8455" };
export const up = (t) => String(t ?? "").toUpperCase();
export const Tm = (v) => String(v ?? "").trim();
const r2 = (n) => Math.round(n * 100) / 100;
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const nf = (n) => (Math.round(n * 100) / 100).toString();
function pd(path) {
  let d = "";
  for (const c of path.commands) {
    if (c.type === "M" || c.type === "L") d += `${c.type}${nf(c.x)} ${nf(c.y)}`;
    else if (c.type === "Q") d += `Q${nf(c.x1)} ${nf(c.y1)} ${nf(c.x)} ${nf(c.y)}`;
    else if (c.type === "C") d += `C${nf(c.x1)} ${nf(c.y1)} ${nf(c.x2)} ${nf(c.y2)} ${nf(c.x)} ${nf(c.y)}`;
    else if (c.type === "Z") d += "Z";
  }
  return d;
}
function layout(k, t, size, sp = 0) {
  const f = fonts[k], sc = size / f.unitsPerEm; const out = []; let x = 0, prev = null;
  for (const ch of [...t]) {
    const g = f.charToGlyph(ch);
    if (prev) { try { x += f.getKerningValue(prev, g) * sc; } catch {} }
    out.push([g, x]); x += g.advanceWidth * sc + sp; prev = g;
  }
  return { out, w: Math.max(0, x - sp) };
}
export const width = (k, t, size, sp = 0) => layout(k, t, size, sp).w;
export function fitSize(k, t, maxW, size, min = 8, sp = 0) { let s = size; while (s > min && width(k, t, s, sp * (s / size)) > maxW) s -= 0.5; return s; }
export function wrap(k, text, size, maxW, sp = 0) {
  const words = String(text).split(/\s+/).filter(Boolean); const lines = []; let cur = "";
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (width(k, t, size, sp) <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; } }
  if (cur) lines.push(cur); return lines;
}
export function tpath(k, t, x, y, size, { anchor = "middle", sp = 0 } = {}) {
  const { out, w } = layout(k, t, size, sp);
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  let d = ""; for (const [g, gx] of out) d += pd(g.getPath(x0 + gx, y, size));
  return { d, w, x0 };
}

export class Doc {
  constructor(W, H) { this.W = W; this.H = H; this.defs = []; this.body = []; this.n = 0; }
  id(p = "i") { return `${p}${++this.n}`; }
  add(s) { this.body.push(s); return this; }
  grad(stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1, units = "objectBoundingBox" } = {}) {
    const id = this.id("g");
    this.defs.push(`<linearGradient id="${id}" gradientUnits="${units}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("")}</linearGradient>`);
    return `url(#${id})`;
  }
  rgrad(stops, cx, cy, r, units = "userSpaceOnUse") {
    const id = this.id("r");
    this.defs.push(`<radialGradient id="${id}" gradientUnits="${units}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`).join("")}</radialGradient>`);
    return `url(#${id})`;
  }
  clip(d) { const id = this.id("c"); this.defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return `url(#${id})`; }
  svg() {
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${this.W} ${this.H}" width="${this.W}" height="${this.H}"><defs>${COMMON_DEFS}${this.defs.join("")}</defs>${this.body.join("")}</svg>`;
  }
}

// gradientes/filtros comuns
export const GOLD_STOPS = [[0, "#9a6212"], [0.25, "#e9bf5c"], [0.45, "#fff3c2"], [0.62, "#e2ad43"], [1, "#8a540d"]];
const gs = GOLD_STOPS.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("");
const COMMON_DEFS = `
<linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1">${gs}</linearGradient>
<linearGradient id="gGoldH" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="768" y2="0">${gs}</linearGradient>
<linearGradient id="gGoldV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0b0"/><stop offset=".3" stop-color="#f0c458"/><stop offset=".55" stop-color="#b9791c"/><stop offset=".75" stop-color="#e9bf5c"/><stop offset="1" stop-color="#8a540d"/></linearGradient>
<linearGradient id="gCream" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8ead0"/><stop offset="1" stop-color="#e2c694"/></linearGradient>
<filter id="fShadow" x="-15%" y="-25%" width="130%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity=".6"/></filter>
<filter id="fShadowS" x="-15%" y="-25%" width="130%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000" flood-opacity=".55"/></filter>
<filter id="fShadowL" x="-20%" y="-20%" width="140%" height="145%"><feDropShadow dx="0" dy="6" stdDeviation="9" flood-color="#000" flood-opacity=".7"/></filter>
<filter id="fBlur2" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="fBlur5" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="fBlur10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="fBlur1" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation=".8"/></filter>
<filter id="fBevel" x="-6%" y="-10%" width="112%" height="125%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b"/>
  <feSpecularLighting in="b" surfaceScale="5" specularConstant="1.1" specularExponent="26" lighting-color="#fff7d6" result="s"><feDistantLight azimuth="235" elevation="52"/></feSpecularLighting>
  <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
  <feDiffuseLighting in="b" surfaceScale="3" diffuseConstant="1" lighting-color="#fff" result="d"><feDistantLight azimuth="235" elevation="60"/></feDiffuseLighting>
  <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="0.75" k2="0.35" k3="0" k4="0" result="lit"/>
  <feComposite in="lit" in2="SourceAlpha" operator="in" result="lit2"/>
  <feComposite in="lit2" in2="si" operator="arithmetic" k1="0" k2="1" k3="0.85" k4="0"/>
</filter>
<filter id="fBevelS" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="b"/>
  <feSpecularLighting in="b" surfaceScale="3" specularConstant="1" specularExponent="20" lighting-color="#fff4c8" result="s"><feDistantLight azimuth="235" elevation="55"/></feSpecularLighting>
  <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
  <feComposite in="SourceGraphic" in2="si" operator="arithmetic" k1="0" k2="1" k3="0.8" k4="0"/>
</filter>
<filter id="fGlowGold" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
`;

// ---------- primitivas
export function goldText(doc, text, x, y, { size, maxW, font = "anton", depth = 3, anchor = "middle", sp = 0, glow = false } = {}) {
  const t = Tm(text); if (!t) return { size: 0, w: 0, svg: "" };
  const s = fitSize(font, t, maxW ?? 1e9, size, 8, sp);
  const { d, w, x0 } = tpath(font, t, x, y, s, { anchor, sp });
  const g = doc.grad([[0, "#fff6c9"], [0.2, "#f8d878"], [0.44, "#e2a835"], [0.5, "#9b6212"], [0.56, "#e9b84a"], [0.82, "#f6dc8c"], [1, "#a8691a"]], { x1: 0, y1: y - s * 0.76, x2: 0, y2: y + s * 0.03, units: "userSpaceOnUse" });
  const svg = `${glow ? `<path d="${d}" fill="#ffd76a" opacity=".55" filter="url(#fBlur10)"/>` : ""}<g filter="url(#fShadow)"><path d="${d}" fill="#3d2203" stroke="#4a2a05" stroke-width="${depth * 2}" stroke-linejoin="round"/></g><path d="${d}" fill="${g}" filter="url(#fBevel)"/><path d="${d}" fill="none" stroke="#fff3bd" stroke-opacity=".5" stroke-width=".7" stroke-linejoin="round"/>`;
  return { size: s, w, x0, svg };
}
export function plain(text, x, y, { font, size, maxW, fill = "#fff", anchor = "middle", sp = 0, min = 9, extra = "", shadow = false } = {}) {
  const t = Tm(text); if (!t) return { size: 0, w: 0, svg: "" };
  const s = fitSize(font, t, maxW ?? 1e9, size, min, sp);
  const { d, w } = tpath(font, t, x, y, s, { anchor, sp });
  return { size: s, w, svg: `<path d="${d}" fill="${fill}" ${shadow ? 'filter="url(#fShadowS)"' : ""} ${extra}/>` };
}
export const polyD = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${r2(x)} ${r2(y)}`).join("") + "Z";
export const rrectD = (x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); return `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`; };
export function insetPoly(pts, d) {
  const n = pts.length; let area = 0;
  pts.forEach((p, i) => { const q = pts[(i + 1) % n]; area += p[0] * q[1] - q[0] * p[1]; });
  const sg = area > 0 ? 1 : -1;
  const lines = pts.map((p, i) => { const q = pts[(i + 1) % n]; const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; const nx = -dy / l * sg * -1, ny = dx / l * sg * -1; return [p[0] + nx * d, p[1] + ny * d, dx, dy]; });
  return pts.map((_, i) => {
    const a = lines[(i + n - 1) % n], b = lines[i]; const den = a[2] * b[3] - a[3] * b[2];
    if (Math.abs(den) < 1e-6) return [b[0], b[1]];
    const t = ((b[0] - a[0]) * b[3] - (b[1] - a[1]) * b[2]) / den;
    return [a[0] + a[2] * t, a[1] + a[3] * t];
  });
}
export const asset = (n) => `data:image/png;base64,${fs.readFileSync(AD + n).toString("base64")}`;
export const imgSize = async (n) => { const m = await sharp(AD + n).metadata(); return [m.width, m.height]; };
export async function prepPhoto(buf, w, h, scale, focusY = 0.5) {
  const b = await sharp(buf).rotate().resize({ width: Math.ceil(w * scale), height: Math.ceil(h * scale), fit: "cover", position: sharp.strategy ? "centre" : "centre" }).jpeg({ quality: 88 }).toBuffer();
  return `data:image/jpeg;base64,${b.toString("base64")}`;
}
export const bbox = (pts) => { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); const x = Math.min(...xs), y = Math.min(...ys); return [x, y, Math.max(...xs) - x, Math.max(...ys) - y]; };

// foto em polígono com moldura dupla dourada, brilho, reflexo e sombra
export function photoPoly(doc, pts, uri, { lw = 4.5, inner = true, gloss = true, glow = true, box = bbox(pts), shadow = "fShadowL" } = {}) {
  const d = polyD(pts); const c = doc.clip(d); const [x, y, w, h] = box;
  const fg = doc.grad(GOLD_STOPS, { x1: x, y1: y, x2: x + w, y2: y + h, units: "userSpaceOnUse" });
  let s = `<g filter="url(#${shadow})"><path d="${d}" fill="#050c20"/></g>`;
  s += `<g clip-path="${c}">${uri ? `<image href="${uri}" x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" preserveAspectRatio="none"/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#12255a"/>`}`;
  // vinheta interna suave + reflexo
  s += `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".38" stroke-width="22" filter="url(#fBlur10)"/>`;
  if (gloss) { const gg = doc.grad([[0, "#fff", 0.20], [0.35, "#fff", 0.05], [0.5, "#fff", 0], [1, "#fff", 0]], { x1: x, y1: y, x2: x + w * 0.45, y2: y + h * 1.2, units: "userSpaceOnUse" }); s += `<path d="${d}" fill="${gg}"/>`; }
  s += `</g>`;
  if (glow) s += `<path d="${d}" fill="none" stroke="#ffd36a" stroke-opacity=".55" stroke-width="${lw + 5}" stroke-linejoin="round" filter="url(#fBlur5)"/>`;
  s += `<path d="${d}" fill="none" stroke="#3b2204" stroke-opacity=".7" stroke-width="${lw + 2}" stroke-linejoin="round"/>`;
  s += `<path d="${d}" fill="none" stroke="${fg}" stroke-width="${lw}" stroke-linejoin="round" filter="url(#fBevelS)"/>`;
  if (inner) { const ip = insetPoly(pts, lw / 2 + 3.2); s += `<path d="${polyD(ip)}" fill="none" stroke="#fbe6a0" stroke-opacity=".8" stroke-width="1" stroke-linejoin="round"/>`; }
  doc.add(s);
}

// estrelas/partículas: brilhos de 4 pontas + bokeh
export function sparkles(doc, W, H, { count = 70, seed = 7, rect = [0, 0, W, H] } = {}) {
  let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  let dots = "", glows = "", stars = "";
  for (let i = 0; i < count; i++) {
    const x = rect[0] + rnd() * rect[2], y = rect[1] + rnd() * rect[3], r = 0.5 + rnd() * 1.7, a = 0.15 + rnd() * 0.5;
    dots += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="#f6dc8a" opacity="${r2(a)}"/>`;
    if (r > 1.9) glows += `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r * 3.5)}" fill="#f6dc8a" opacity=".25"/>`;
  }
  for (let i = 0; i < Math.round(count / 9); i++) {
    const x = rect[0] + rnd() * rect[2], y = rect[1] + rnd() * rect[3], r = 5 + rnd() * 9;
    stars += star4(x, y, r, 0.5 + rnd() * 0.4);
  }
  doc.add(`<g filter="url(#fBlur2)">${glows}</g>${dots}${stars}`);
}
export function star4(x, y, r, a = 0.9) {
  const k = r * 0.13;
  return `<g opacity="${a}"><circle cx="${x}" cy="${y}" r="${r * 0.7}" fill="#ffe9a3" opacity=".25" filter="url(#fBlur2)"/><path d="M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}Z" fill="#fff6d0"/></g>`;
}
export function background(doc, W, H, glow, nSpark = 70) {
  const bg = doc.grad([[0, "#0b1d46"], [0.5, "#08173a"], [1, "#050e26"]]);
  doc.add(`<rect width="${W}" height="${H}" fill="${bg}"/>`);
  for (const [x, y, r, a] of glow) doc.add(`<rect width="${W}" height="${H}" fill="${doc.rgrad([[0, "#2850aa", a], [1, "#2850aa", 0]], x, y, r)}"/>`);
  sparkles(doc, W, H, { count: nSpark });
}

// ícones de traço (48x48) como path d
export const ICON_D = {
  house: "M4 24L24 6L44 24M9 20V42H39V20M20 42V29H28V42",
  calendar: "M8 12H40Q44 12 44 16V40Q44 44 40 44H8Q4 44 4 40V16Q4 12 8 12M4 22H44M14 6V16M34 6V16M11 29H15M22 29H26M33 29H37M11 37H15M22 37H26",
};
export const MAT = {
  pin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  phone: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  shield: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
};
export const iconFill = (name, cx, cy, size, fill, extra = "") => `<path d="${MAT[name]}" fill="${fill}" ${extra} transform="translate(${r2(cx - size / 2)} ${r2(cy - size / 2)}) scale(${size / 24})"/>`;
export const iconLine = (name, cx, cy, size, stroke, lw = 2.6, extra = "") => `<path d="${ICON_D[name]}" fill="none" stroke="${stroke}" stroke-width="${lw * 48 / size}" stroke-linecap="round" stroke-linejoin="round" ${extra} transform="translate(${r2(cx - size / 2)} ${r2(cy - size / 2)}) scale(${size / 48})"/>`;

// logo SM (monograma + texto vetorial)
export function logo(doc, x, y, w, monoUri, monoAR) {
  const u = w / 100, cx = x + w / 2, mw = 58 * u, mh = monoAR * mw;
  let s = `<image href="${monoUri}" x="${r2(cx - mw / 2)}" y="${r2(y)}" width="${r2(mw)}" height="${r2(mh)}"/>`;
  const gold = doc.grad(GOLD_STOPS, { x1: x, y1: y + 60 * u, x2: x + w, y2: y + 100 * u, units: "userSpaceOnUse" });
  s += plain("SAMIA MOHAMED", cx, y + 71 * u, { font: "play", size: 11 * u, sp: 1.4 * u, maxW: w, fill: gold, min: 4 }).svg;
  s += plain("CORRETORA DE IMÓVEIS", cx, y + 82 * u, { font: "m6", size: 4.6 * u, sp: 1.1 * u, maxW: 76 * u, fill: "#e9bf5c", min: 3 }).svg;
  const lw = Math.max(0.6, 0.5 * u);
  for (const [a, b] of [[x - 1 * u, x + 8 * u], [x + 92 * u, x + 101 * u]]) s += `<path d="M${a} ${y + 80.4 * u}H${b}" stroke="#e9bf5c" stroke-width="${lw}"/>`;
  for (const [a, b] of [[x + 12 * u, x + 38 * u], [x + 62 * u, x + 88 * u]]) s += `<path d="M${a} ${y + 91 * u}H${b}" stroke="#e9bf5c" stroke-width="${lw}"/>`;
  s += iconLine("house", cx, y + 91 * u, 11 * u, "#e9bf5c", Math.max(1.2, 0.7 * u) * 0.7);
  s += plain("CRECI 76026", cx, y + 101.5 * u, { font: "m6", size: 4.6 * u, sp: 1.3 * u, maxW: 50 * u, fill: "#e9bf5c", min: 3 }).svg;
  doc.add(s);
}

export function render(svg, outW, outFile, quality = 93) {
  const t0 = performance.now();
  const png = new Resvg(svg, { fitTo: { mode: "width", value: outW }, font: { loadSystemFonts: false }, shapeRendering: 2, textRendering: 2, imageRendering: 0 }).render();
  const t1 = performance.now();
  return { png: png.asPng(), tRaster: t1 - t0, outFile, quality };
}
export async function save({ png, outFile, quality }) {
  const t = performance.now();
  await sharp(png).jpeg({ quality, mozjpeg: false, chromaSubsampling: "4:4:4" }).toFile(outFile);
  return performance.now() - t;
}
export { sharp, r2 };

// ícones vetoriais (assets/icons/*.svg, 24x24, traço currentColor) -> <g> colorido
const iconCache = {};
export function vicon(name, cx, cy, size, stroke, sw = 1.8, extra = "") {
  if (!iconCache[name]) {
    const raw = fs.readFileSync(`${AD}icons/${name}.svg`, "utf8");
    iconCache[name] = raw.replace(/<!--[\s\S]*?-->/g, "").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  }
  return `<g fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra} transform="translate(${r2(cx - size / 2)} ${r2(cy - size / 2)}) scale(${size / 24})">${iconCache[name].replace(/currentColor/g, stroke)}</g>`;
}
