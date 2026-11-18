import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import opentype from "opentype.js";
import fs from "node:fs";
const ROOT = "/home/claude/imobilegeneration/";
export const ASSETS = ROOT + "assets/";
const FD = new URL("./fonts/", import.meta.url).pathname;

// chave -> [família, peso, arquivo]
const FONTDEFS = {
  anton: ["Anton", 400, "anton-400.ttf"], script: ["GreatVibes", 400, "great-vibes-400.ttf"],
  m6: ["Montserrat", 600, "montserrat-600.ttf"], m7: ["Montserrat", 700, "montserrat-700.ttf"], m8: ["Montserrat", 800, "montserrat-800.ttf"],
  play: ["Playfair", 700, "playfair-display-700.ttf"], c4: ["RobotoCond", 400, "roboto-condensed-400.ttf"],
  c5: ["RobotoCond", 500, "roboto-condensed-500.ttf"], c7: ["RobotoCond", 700, "roboto-condensed-700.ttf"],
  kaushan: ["Kaushan", 400, "kaushan-script-400.ttf"],
};
export const satoriFonts = Object.values(FONTDEFS).map(([name, weight, f]) => ({ name, weight, style: "normal", data: fs.readFileSync(FD + f) }));
const OT = {}; for (const [k, [, , f]] of Object.entries(FONTDEFS)) { const b = fs.readFileSync(FD + f); OT[k] = opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); }

export const h = (type, style, children, extra = {}) => ({ type, props: { style: { display: "flex", ...style }, children, ...extra } });
export const GOLD_T = "linear-gradient(180deg,#fff3c2 0%,#f3d37a 28%,#e2ad43 62%,#9a6212 100%)";
export const GOLD_D = "linear-gradient(135deg,#9a6212 0%,#e9bf5c 25%,#fff3c2 45%,#e2ad43 62%,#8a540d 100%)";
export const GOLD_H = "linear-gradient(90deg,#9a6212 0%,#e9bf5c 25%,#fff3c2 45%,#e2ad43 62%,#8a540d 100%)";

export function measure(fk, text, size, ls = 0) { const f = OT[fk]; let w = 0; for (const ch of text) w += f.charToGlyph(ch).advanceWidth; return w * size / f.unitsPerEm + ls * [...text].length; }
export function fit(fk, text, size, maxW, ls = 0, min = 8) { let s = size; while (s > min && measure(fk, text, s, ls * s / size) > maxW) s -= 0.5; return s; }
export function wrap(fk, text, size, maxW) {
  const words = String(text).split(/\s+/).filter(Boolean), lines = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w; if (measure(fk, t, size) <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; } }
  if (cur) lines.push(cur); return lines;
}
const asc = (fk) => { const f = OT[fk]; return [f.tables.hhea.ascender / f.unitsPerEm, -f.tables.hhea.descender / f.unitsPerEm]; };

// Texto posicionado pela linha de base (y) como no canvas. align: center|left|right
export function text(fk, t, x, y, { size, color = "#fff", align = "center", maxW, ls = 0, minSize = 8, shadow, stroke, extra = {}, grad } = {}) {
  t = String(t ?? "").trim(); if (!t) return null;
  const s = maxW ? fit(fk, t, size, maxW, ls, minSize) : size;
  const [A, D] = asc(fk); const half = (s - (A + D) * s) / 2; const top = y - (half + A * s);
  const W = 1400; const left = align === "center" ? x - W / 2 : align === "left" ? x : x - W;
  const [fam, wt] = FONTDEFS[fk];
  const st = { position: "absolute", left, top, width: W, height: s, justifyContent: align === "center" ? "center" : align === "left" ? "flex-start" : "flex-end",
    fontFamily: fam, fontWeight: wt, fontSize: s, lineHeight: `${s}px`, whiteSpace: "nowrap", letterSpacing: ls * s / size, color, ...extra };
  if (shadow) st.textShadow = shadow;
  if (stroke) { st.WebkitTextStroke = stroke; st.paintOrder = "stroke fill"; }
  if (grad) { st.backgroundImage = grad; st.backgroundClip = "text"; st.color = "transparent"; }
  return h("div", st, t);
}
// Texto dourado: camada inferior com contorno escuro + sombra, camada superior com gradiente (background-clip:text)
export function goldText(fk, t, x, y, o) {
  const a = text(fk, t, x, y, { ...o, color: "#5a3606", stroke: `${(o.depth ?? 2.5) * 2}px #5a3606`, shadow: "0 4px 10px rgba(0,0,0,.6)", grad: undefined });
  if (!a) return null;
  const b = text(fk, t, x, y, { ...o, color: "#e9bf5c", grad: o.grad || GOLD_T });
  return [a, b];
}
export const box = (x, y, w, hh, style = {}, children) => h("div", { position: "absolute", left: x, top: y, width: w, height: hh, ...style }, children);
// Caixa com borda dourada em gradiente (anel externo dourado + miolo)
export function goldBox(x, y, w, hh, bw, r, fill, children, grad = GOLD_D) {
  return box(x, y, w, hh, { background: grad, borderRadius: r }, box(bw, bw, w - 2 * bw, hh - 2 * bw, { background: fill, borderRadius: Math.max(0, r - bw), overflow: "hidden" }, children));
}
export const b64 = (buf, mime) => `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
export const asset = (n) => b64(fs.readFileSync(ASSETS + n), "image/png");
export async function assetSize(n) { const m = await sharp(ASSETS + n).metadata(); return [m.width, m.height]; }
export const img = (src, x, y, w, hh, style = {}) => ({ type: "img", props: { src, width: w, height: hh, style: { position: "absolute", left: x, top: y, width: w, height: hh, ...style } } });
export const svgIcon = (x, y, size, vb, inner, { fill = "none", stroke, sw = 2.6, grad } = {}) => {
  const id = "g" + Math.random().toString(36).slice(2, 7);
  const kids = [];
  if (grad) kids.push({ type: "defs", props: { children: { type: "linearGradient", props: { id, x1: 0, y1: 0, x2: 1, y2: 1, children: [["0", "#9a6212"], ["0.25", "#e9bf5c"], ["0.45", "#fff3c2"], ["0.62", "#e2ad43"], ["1", "#8a540d"]].map(([o, c]) => ({ type: "stop", props: { offset: o, stopColor: c } })) } } } });
  const pc = grad ? `url(#${id})` : stroke;
  kids.push(...inner.map((d) => ({ type: "path", props: { d, fill: fill === "grad" ? pc : fill, stroke: fill === "grad" ? "none" : pc, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round" } })));
  return { type: "svg", props: { width: size, height: size, viewBox: vb, style: { position: "absolute", left: x, top: y }, xmlns: "http://www.w3.org/2000/svg", children: kids } };
};
export const ICON = {
  pin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  phone: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  star: "M12 2L14.9 8.6L22 9.3L16.6 14L18.2 21L12 17.3L5.8 21L7.4 14L2 9.3L9.1 8.6Z",
  shield: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
};
export const LINE = { // ícones 48x48 de traço (equivalente a iconLine)
  house: ["M4 24L24 6L44 24", "M9 20L9 42L39 42L39 20", "M20 42L20 29L28 29L28 42"],
  calendar: ["M8 12L40 12Q44 12 44 16L44 40Q44 44 40 44L8 44Q4 44 4 40L4 16Q4 12 8 12", "M4 22L44 22", "M14 6L14 16", "M34 6L34 16", "M11 29L15 29", "M22 29L26 29", "M33 29L37 29", "M11 37L15 37", "M22 37L26 37"],
};
export const lineIcon = (name, cx, cy, size, o) => svgIcon(cx - size / 2, cy - size / 2, size, "0 0 48 48", LINE[name], o);
export const fillIcon = (name, cx, cy, size, color) => svgIcon(cx - size / 2, cy - size / 2, size, "0 0 24 24", [ICON[name]], { fill: color, stroke: "none", sw: 0 });

// Logo (monograma + nome em código) — equivalente a drawLogo
export async function logo(x, y, w) {
  const u = w / 100, cx = x + w / 2, mw = 58 * u; const [iw, ih] = await assetSize("monogram.png"); const mh = ih / iw * mw;
  const out = [img(asset("monogram.png"), cx - mw / 2, y, mw, mh)];
  out.push(goldText("play", "SAMIA MOHAMED", cx, y + 71 * u, { size: 11 * u, maxW: w, ls: 1.4 * u, depth: 0 }).slice(1));
  out.push(text("m6", "CORRETORA DE IMÓVEIS", cx, y + 82 * u, { size: 4.6 * u, color: "#e9bf5c", ls: 1.1 * u, maxW: 76 * u }));
  const ln = (a, b, yy) => box(a, yy, b - a, Math.max(1, 0.5 * u), { background: "#e9bf5c" });
  out.push(ln(x - u, x + 8 * u, y + 80.2 * u), ln(x + 92 * u, x + 101 * u, y + 80.2 * u), ln(x + 12 * u, x + 38 * u, y + 90.8 * u), ln(x + 62 * u, x + 88 * u, y + 90.8 * u));
  out.push(lineIcon("house", cx, y + 91 * u, 11 * u, { stroke: "#e9bf5c", sw: 3 }));
  out.push(text("m6", "CRECI 76026", cx, y + 101.5 * u, { size: 4.6 * u, color: "#e9bf5c", ls: 1.3 * u, maxW: 50 * u }));
  return out;
}

export function sparkles(W, H, count = 70, seed = 7) {
  let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647); const out = [];
  for (let i = 0; i < count; i++) { const x = rnd() * W, y = rnd() * H, r = 0.6 + rnd() * 1.6; out.push(box(x, y, r * 2, r * 2, { background: "#f6dc8a", borderRadius: r, opacity: 0.15 + rnd() * 0.45 })); }
  return out;
}
export const bgStyle = (W, H, glows) => ({
  position: "absolute", left: 0, top: 0, width: W, height: H,
  backgroundImage: [...glows.map(([x, y, r, a]) => `radial-gradient(circle ${r}px at ${x}px ${y}px, rgba(40,80,170,${a}), rgba(40,80,170,0))`), "linear-gradient(180deg,#0b1d46 0%,#08173a 50%,#050e26 100%)"].join(","),
});

// Polígono: inset (offset para dentro) por d
export function inset(pts, d) {
  const n = pts.length; let area = 0; pts.forEach((p, i) => { const q = pts[(i + 1) % n]; area += p[0] * q[1] - q[0] * p[1]; }); const sgn = area > 0 ? 1 : -1;
  const lines = pts.map((p, i) => { const q = pts[(i + 1) % n]; const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy); const nx = -dy / L * sgn, ny = dx / L * sgn; return [p[0] + nx * d, p[1] + ny * d, dx, dy]; });
  return pts.map((_, i) => { const a = lines[(i + n - 1) % n], b = lines[i]; const den = a[2] * b[3] - a[3] * b[2]; if (Math.abs(den) < 1e-9) return [b[0], b[1]]; const t = ((b[0] - a[0]) * b[3] - (b[1] - a[1]) * b[2]) / den; return [a[0] + a[2] * t, a[1] + a[3] * t]; });
}
export const bbox = (pts) => { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); const x = Math.min(...xs), y = Math.min(...ys); return [x, y, Math.max(...xs) - x, Math.max(...ys) - y]; };
// Foto recortada em polígono com moldura dourada (tudo Satori: clip-path polygon). pts em coords do quadro; SC = px por unidade
export async function polyPhoto(photoBuf, pts, lw, SC, { r = 0 } = {}) {
  const [bx, by, bw, bh] = bbox(pts);
  const rel = (P) => P.map(([x, y]) => `${((x - bx) * 1).toFixed(2)}px ${((y - by) * 1).toFixed(2)}px`).join(",");
  const outer = box(bx, by, bw, bh, { background: GOLD_D, clipPath: `polygon(${rel(pts)})` });
  const inn = inset(pts, lw);
  const px = Math.round(bw * SC), py = Math.round(bh * SC);
  const data = photoBuf ? await sharp(photoBuf).rotate().resize(px, py, { fit: "cover" }).jpeg({ quality: 90 }).toBuffer() : null;
  const photo = data ? box(bx, by, bw, bh, { clipPath: `polygon(${rel(inn)})` }, img(b64(data, "image/jpeg"), 0, 0, bw, bh)) : box(bx, by, bw, bh, { background: "#12255a", clipPath: `polygon(${rel(inn)})` });
  return [outer, photo];
}

export async function renderLayer(root, W, H, outW) {
  const svg = await satori(h("div", { width: W, height: H, position: "relative", background: "transparent" }, root), { width: W, height: H, fonts: satoriFonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: outW }, font: { loadSystemFonts: false } }).render().asPng();
  return { svg, png };
}
export async function toJpg(layers, outW, outH, path, q = 93) {
  const base = sharp({ create: { width: outW, height: outH, channels: 3, background: "#06122c" } });
  await base.composite(layers.map((input) => ({ input }))).jpeg({ quality: q, chromaSubsampling: "4:4:4" }).toFile(path);
}

// Ícones SVG do projeto (assets/icons/*.svg, 24x24, traço currentColor) -> <img> data-URI colorido
export function iconSvg(name, cx, cy, size, { color = "#fff", grad = false, sw = 2 } = {}) {
  let s = fs.readFileSync(ASSETS + "icons/" + name + ".svg", "utf8").replace(/<!--[\s\S]*?-->/g, "");
  const stroke = grad ? "url(#gg)" : color;
  s = s.replace(/stroke="currentColor"/g, `stroke="${stroke}"`).replace(/stroke-width="2"/, `stroke-width="${sw}"`).replace(/width="24"\s+height="24"/, 'width="96" height="96"');
  if (grad) s = s.replace(/>/, `><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9a6212"/><stop offset=".25" stop-color="#e9bf5c"/><stop offset=".45" stop-color="#fff3c2"/><stop offset=".62" stop-color="#e2ad43"/><stop offset="1" stop-color="#8a540d"/></linearGradient></defs>`);
  return img(b64(s, "image/svg+xml"), cx - size / 2, cy - size / 2, size, size);
}

// Camada SVG crua (traços arbitrários: curvas, polígonos com stroke dourado) embutida como <img> data-URI
export const GOLD_STOPS = `<stop offset="0" stop-color="#9a6212"/><stop offset=".25" stop-color="#e9bf5c"/><stop offset=".45" stop-color="#fff3c2"/><stop offset=".62" stop-color="#e2ad43"/><stop offset="1" stop-color="#8a540d"/>`;
export function svgLayer(W, H, inner, defs = "") {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * 3}" height="${H * 3}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${inner}</svg>`;
  return img(b64(s, "image/svg+xml"), 0, 0, W, H);
}
export const goldGradDef = (id, x1, y1, x2, y2) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${GOLD_STOPS}</linearGradient>`;
export const ptsD = (pts, close = true) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("") + (close ? "Z" : "");
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
    const rad = Array.isArray(r) ? r[i] : r; const p = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    if (!rad) { out.push(p); continue; }
    const va = [a[0] - p[0], a[1] - p[1]], vb = [b[0] - p[0], b[1] - p[1]]; const la = Math.hypot(...va), lb = Math.hypot(...vb);
    const ra = Math.min(rad, la / 2), rb = Math.min(rad, lb / 2);
    const s = [p[0] + va[0] / la * ra, p[1] + va[1] / la * ra], e = [p[0] + vb[0] / lb * rb, p[1] + vb[1] / lb * rb];
    for (let t = 0; t <= 6; t++) { const u = t / 6; out.push([(1 - u) * (1 - u) * s[0] + 2 * (1 - u) * u * p[0] + u * u * e[0], (1 - u) * (1 - u) * s[1] + 2 * (1 - u) * u * p[1] + u * u * e[1]]); }
  }
  return out;
}
// Foto em polígono arbitrário (clip-path) + contorno dourado desenhado por camada SVG (aceita curvas)
export async function polyPhoto2(photoBuf, pts, lw, SC, W, H, id) {
  const [bx, by, bw, bh] = bbox(pts);
  const rel = pts.map(([x, y]) => `${(x - bx).toFixed(2)}px ${(y - by).toFixed(2)}px`).join(",");
  const px = Math.max(2, Math.round(bw * SC)), py = Math.max(2, Math.round(bh * SC));
  const data = photoBuf ? await sharp(photoBuf).rotate().resize(px, py, { fit: "cover" }).jpeg({ quality: 90 }).toBuffer() : null;
  const photo = data ? box(bx, by, bw, bh, { clipPath: `polygon(${rel})` }, img(b64(data, "image/jpeg"), 0, 0, bw, bh)) : box(bx, by, bw, bh, { background: "#12255a", clipPath: `polygon(${rel})` });
  const stroke = svgLayer(W, H, `<path d="${ptsD(pts)}" fill="none" stroke="url(#${id})" stroke-width="${lw}" stroke-linejoin="round"/>`, goldGradDef(id, bx, by, bx + bw, by + bh));
  return [photo, stroke];
}
