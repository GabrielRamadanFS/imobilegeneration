// Utilitários de desenho do gerador local de artes (sem IA de imagem): fontes, texto ajustado, ícones,
// molduras douradas e fotos recortadas. Usa @napi-rs/canvas (binário nativo, funciona no Netlify).

import { GlobalFonts, Path2D, createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));

// Procura a pasta "assets" junto da função empacotada (Netlify) ou na raiz do projeto (local/testes).
function assetsRoot() {
  const roots = [process.env.LAMBDA_TASK_ROOT, process.cwd(), path.resolve(here, "../../../.."), "/var/task"].filter(Boolean);
  for (const r of roots) if (fs.existsSync(path.join(r, "assets", "fonts"))) return path.join(r, "assets");
  throw new Error("Pasta assets/ não encontrada.");
}

let fontsReady = false;
export function setupFonts() {
  if (fontsReady) return;
  const dir = path.join(assetsRoot(), "fonts");
  const list = [
    ["anton-latin-400-normal.woff", "SM Anton"],
    ["great-vibes-latin-400-normal.woff", "SM Script"],
    ["montserrat-latin-600-normal.woff", "SM Mont6"],
    ["montserrat-latin-700-normal.woff", "SM Mont7"],
    ["montserrat-latin-800-normal.woff", "SM Mont8"],
    ["playfair-display-latin-700-normal.woff", "SM Play7"],
  ];
  for (const [file, alias] of list) GlobalFonts.registerFromPath(path.join(dir, file), alias);
  fontsReady = true;
}

let logoImg;
export async function getLogo() {
  if (!logoImg) logoImg = await loadImage(fs.readFileSync(path.join(assetsRoot(), "logo.png")));
  return logoImg;
}

let monoImg;
export async function getMonogram() {
  if (!monoImg) monoImg = await loadImage(fs.readFileSync(path.join(assetsRoot(), "monogram.png")));
  return monoImg;
}

// Logo SM: monograma (imagem) + nome, profissão e CRECI desenhados por código (ficam nítidos em qualquer tamanho).
// Ocupa w de largura e ~102% de w de altura, a partir de (x, y).
export function drawLogo(ctx, mono, x, y, w) {
  const u = w / 100;
  const cx = x + w / 2;
  const mw = 58 * u;
  const mh = (mono.height / mono.width) * mw;
  ctx.drawImage(mono, cx - mw / 2, y, mw, mh);
  const gold = goldGradient(ctx, x, y + 60 * u, x + w, y + 100 * u);
  drawSpaced(ctx, "SAMIA MOHAMED", cx, y + 71 * u, { font: F.play, size: 11 * u, spacing: 1.4 * u, fill: gold, maxW: w });
  drawSpaced(ctx, "CORRETORA DE IMÓVEIS", cx, y + 82 * u, { font: F.m6, size: 4.6 * u, spacing: 1.1 * u, fill: "#e9bf5c", maxW: 76 * u });
  ctx.save();
  ctx.lineWidth = Math.max(1, 0.5 * u);
  ctx.strokeStyle = "#e9bf5c";
  for (const [a, b] of [[x - 1 * u, x + 8 * u], [x + 92 * u, x + 101 * u]]) {
    ctx.beginPath(); ctx.moveTo(a, y + 80.4 * u); ctx.lineTo(b, y + 80.4 * u); ctx.stroke();
  }
  for (const [a, b] of [[x + 12 * u, x + 38 * u], [x + 62 * u, x + 88 * u]]) {
    ctx.beginPath(); ctx.moveTo(a, y + 91 * u); ctx.lineTo(b, y + 91 * u); ctx.stroke();
  }
  ctx.restore();
  iconLine(ctx, "house", cx, y + 91 * u, 11 * u, "#e9bf5c", Math.max(1.2, 0.7 * u));
  drawSpaced(ctx, "CRECI 76026", cx, y + 101.5 * u, { font: F.m6, size: 4.6 * u, spacing: 1.3 * u, fill: "#e9bf5c", maxW: 50 * u });
}

export const F = {
  anton: (s) => `${s}px "SM Anton"`,
  script: (s) => `${s}px "SM Script"`,
  m6: (s) => `${s}px "SM Mont6"`,
  m7: (s) => `${s}px "SM Mont7"`,
  m8: (s) => `${s}px "SM Mont8"`,
  play: (s) => `${s}px "SM Play7"`,
};

// Largura final da arte (px). 1440 mantém a nitidez em telas de celular; ajustável por ART_WIDTH.
export const OUT_WIDTH = Number(process.env.ART_WIDTH) || 1440;

export function newCanvas(w, h) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx };
}

export function goldGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "#9a6212");
  g.addColorStop(0.25, "#e9bf5c");
  g.addColorStop(0.45, "#fff3c2");
  g.addColorStop(0.62, "#e2ad43");
  g.addColorStop(1, "#8a540d");
  return g;
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// Menor tamanho de fonte (a partir de startSize) em que o texto cabe em maxW.
export function fitSize(ctx, text, fontFn, maxW, startSize, minSize = 8) {
  let s = startSize;
  while (s > minSize) {
    ctx.font = fontFn(s);
    if (ctx.measureText(text).width <= maxW) break;
    s -= 0.5;
  }
  return s;
}

export function wrapLines(ctx, text, maxW) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width <= maxW || !cur) cur = t;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// Texto de uma linha ajustado à largura. opts: fill, align, shadow, stroke{color,width}
export function drawFit(ctx, text, x, y, { font, size, maxW, fill = "#fff", align = "center", stroke, shadow, minSize = 9 }) {
  const t = String(text ?? "").trim();
  if (!t) return 0;
  const s = fitSize(ctx, t, font, maxW, size, minSize);
  ctx.save();
  ctx.font = font(s);
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  if (shadow) {
    ctx.shadowColor = shadow.color || "rgba(0,0,0,.55)";
    ctx.shadowBlur = shadow.blur ?? 6;
    ctx.shadowOffsetX = shadow.x ?? 0;
    ctx.shadowOffsetY = shadow.y ?? 2;
  }
  if (stroke) {
    ctx.lineJoin = "round";
    ctx.lineWidth = stroke.width;
    ctx.strokeStyle = stroke.color;
    ctx.strokeText(t, x, y);
  }
  ctx.shadowColor = "transparent";
  ctx.fillStyle = typeof fill === "function" ? fill(s) : fill;
  ctx.fillText(t, x, y);
  ctx.restore();
  return s;
}

export function star(ctx, cx, cy, r, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

// Ícones (24x24) desenhados com Path2D, centrados em (cx, cy) com tamanho `size`.
const ICONS = {
  pin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  phone:
    "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
};
ICONS.shield = "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z";
export function iconFill(ctx, name, cx, cy, size, fill) {
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = fill;
  ctx.fill(new Path2D(ICONS[name]));
  ctx.restore();
}

// Ícones de traço (linha dourada): house, pool, bed, calendar
export function iconLine(ctx, name, cx, cy, size, stroke, lw = 2.6) {
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 48, size / 48);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw * (48 / size) * (size / 48) * 1.0;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (name === "house") {
    ctx.moveTo(4, 24); ctx.lineTo(24, 6); ctx.lineTo(44, 24);
    ctx.moveTo(9, 20); ctx.lineTo(9, 42); ctx.lineTo(39, 42); ctx.lineTo(39, 20);
    ctx.moveTo(20, 42); ctx.lineTo(20, 29); ctx.lineTo(28, 29); ctx.lineTo(28, 42);
  } else if (name === "pool") {
    ctx.moveTo(14, 6); ctx.lineTo(14, 30); ctx.moveTo(30, 6); ctx.lineTo(30, 30);
    ctx.moveTo(14, 12); ctx.lineTo(30, 12); ctx.moveTo(14, 20); ctx.lineTo(30, 20);
    ctx.moveTo(2, 36); ctx.quadraticCurveTo(8, 30, 14, 36); ctx.quadraticCurveTo(20, 42, 26, 36);
    ctx.quadraticCurveTo(32, 30, 38, 36); ctx.quadraticCurveTo(42, 40, 46, 36);
    ctx.moveTo(2, 44); ctx.quadraticCurveTo(8, 38, 14, 44); ctx.quadraticCurveTo(20, 50, 26, 44);
    ctx.quadraticCurveTo(32, 38, 38, 44); ctx.quadraticCurveTo(42, 48, 46, 44);
  } else if (name === "bed") {
    ctx.moveTo(4, 36); ctx.lineTo(4, 14); ctx.moveTo(4, 30); ctx.lineTo(44, 30); ctx.lineTo(44, 36);
    ctx.moveTo(44, 30); ctx.lineTo(44, 22); ctx.quadraticCurveTo(44, 18, 40, 18); ctx.lineTo(18, 18); ctx.lineTo(18, 30);
    ctx.moveTo(6, 25); ctx.lineTo(14, 25);
  } else if (name === "sofa") {
    ctx.moveTo(10, 24); ctx.lineTo(10, 16); ctx.quadraticCurveTo(10, 12, 14, 12); ctx.lineTo(34, 12);
    ctx.quadraticCurveTo(38, 12, 38, 16); ctx.lineTo(38, 24);
    ctx.moveTo(10, 22); ctx.quadraticCurveTo(4, 22, 4, 28); ctx.lineTo(4, 36); ctx.lineTo(44, 36); ctx.lineTo(44, 28);
    ctx.quadraticCurveTo(44, 22, 38, 22);
    ctx.moveTo(10, 32); ctx.lineTo(38, 32); ctx.moveTo(10, 36); ctx.lineTo(10, 41); ctx.moveTo(38, 36); ctx.lineTo(38, 41);
  } else if (name === "bbq") {
    ctx.moveTo(8, 20); ctx.lineTo(40, 20); ctx.quadraticCurveTo(40, 35, 24, 35); ctx.quadraticCurveTo(8, 35, 8, 20);
    ctx.moveTo(18, 34); ctx.lineTo(13, 45); ctx.moveTo(30, 34); ctx.lineTo(35, 45);
    ctx.moveTo(16, 14); ctx.quadraticCurveTo(12, 10, 16, 5); ctx.moveTo(24, 14); ctx.quadraticCurveTo(20, 10, 24, 5);
    ctx.moveTo(32, 14); ctx.quadraticCurveTo(28, 10, 32, 5);
  } else if (name === "car") {
    ctx.moveTo(5, 32); ctx.lineTo(5, 25); ctx.lineTo(11, 25); ctx.lineTo(15, 14); ctx.lineTo(33, 14); ctx.lineTo(37, 25);
    ctx.lineTo(43, 25); ctx.lineTo(43, 32); ctx.lineTo(39, 32); ctx.moveTo(9, 32); ctx.lineTo(5, 32);
    ctx.moveTo(13, 32); ctx.lineTo(35, 32); ctx.moveTo(18, 36); ctx.arc(14, 36, 4.5, 0, Math.PI * 2);
    ctx.moveTo(38.5, 36); ctx.arc(34, 36, 4.5, 0, Math.PI * 2); ctx.moveTo(10, 25); ctx.lineTo(38, 25);
  } else if (name === "party") {
    ctx.moveTo(5, 43); ctx.lineTo(14, 18); ctx.lineTo(30, 34); ctx.closePath();
    ctx.moveTo(26, 10); ctx.lineTo(26, 17); ctx.moveTo(36, 14); ctx.lineTo(32, 19); ctx.moveTo(41, 24); ctx.lineTo(34, 25);
    ctx.moveTo(18, 8); ctx.lineTo(20, 12); ctx.moveTo(42, 34); ctx.lineTo(38, 32);
  } else if (name === "calendar") {
    ctx.moveTo(8, 12); ctx.lineTo(40, 12); ctx.quadraticCurveTo(44, 12, 44, 16); ctx.lineTo(44, 40);
    ctx.quadraticCurveTo(44, 44, 40, 44); ctx.lineTo(8, 44); ctx.quadraticCurveTo(4, 44, 4, 40); ctx.lineTo(4, 16);
    ctx.quadraticCurveTo(4, 12, 8, 12);
    ctx.moveTo(4, 22); ctx.lineTo(44, 22); ctx.moveTo(14, 6); ctx.lineTo(14, 16); ctx.moveTo(34, 6); ctx.lineTo(34, 16);
    for (const [px, py] of [[13, 29], [24, 29], [35, 29], [13, 37], [24, 37]]) { ctx.moveTo(px - 2, py); ctx.lineTo(px + 2, py); }
  }
  ctx.stroke();
  ctx.restore();
}

// Prepara uma foto (base64) para o canvas: corrige rotação EXIF e reduz o tamanho.
export async function loadPhoto(photo) {
  const buf = Buffer.isBuffer(photo) ? photo : Buffer.from(photo.data, "base64");
  const prepared = await sharp(buf)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();
  return loadImage(prepared);
}

// Desenha a imagem preenchendo (x,y,w,h) com recorte central ("cover"), dentro de um retângulo arredondado.
export function drawCover(ctx, img, x, y, w, h, r = 6, focusY = 0.5) {
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s;
  const sh = h / s;
  const sx = (img.width - sw) / 2;
  const sy = Math.max(0, Math.min(img.height - sh, (img.height - sh) * focusY));
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

// Moldura dourada (com sombra) ao redor de uma área.
export function goldFrame(ctx, x, y, w, h, r = 6, lw = 4) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.shadowColor = "rgba(0,0,0,.6)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#050c20";
  ctx.fill();
  ctx.restore();
}
export function goldFrameStroke(ctx, x, y, w, h, r = 6, lw = 4) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.lineWidth = lw;
  ctx.strokeStyle = goldGradient(ctx, x, y, x + w, y + h);
  ctx.stroke();
  ctx.restore();
}

// Fundo sem foto: gradiente suave com ícone de casa.
export function drawPhotoPlaceholder(ctx, x, y, w, h, r = 6) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, "#16295a");
  g.addColorStop(1, "#0b1735");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  iconLine(ctx, "house", x + w / 2, y + h / 2, Math.min(w, h) * 0.38, "rgba(233,191,92,.55)", 2.4);
}

export function sparkles(ctx, W, H, count = 60, seed = 7) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = rnd() * W, y = rnd() * H, r = 0.6 + rnd() * 1.6;
    ctx.globalAlpha = 0.15 + rnd() * 0.45;
    ctx.fillStyle = "#f6dc8a";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Texto com espaçamento entre letras (centro em x, a menos que align="left").
export function drawSpaced(ctx, text, x, y, { font, size, spacing = 6, fill = "#fff", align = "center", maxW }) {
  const t = String(text ?? "").trim();
  if (!t) return;
  let s = size;
  let sp = spacing;
  const width = () => {
    ctx.font = font(s);
    return [...t].reduce((a, ch) => a + ctx.measureText(ch).width + sp, -sp);
  };
  while (maxW && width() > maxW && s > 9) {
    s -= 0.5;
    sp = Math.max(1, spacing * (s / size));
  }
  const total = width();
  let cx = align === "center" ? x - total / 2 : x;
  ctx.save();
  ctx.font = font(s);
  ctx.textAlign = "left";
  ctx.fillStyle = typeof fill === "function" ? fill(s) : fill;
  for (const ch of t) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + sp;
  }
  ctx.restore();
}

export function drawBackground(ctx, W, H, { glow = [[W * 0.85, H * 0.12, 420], [W * 0.1, H * 0.7, 380]] } = {}) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0b1d46");
  bg.addColorStop(0.5, "#08173a");
  bg.addColorStop(1, "#050e26");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  for (const [x, y, r] of glow) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(40,80,170,.15)");
    g.addColorStop(1, "rgba(40,80,170,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  sparkles(ctx, W, H, 70);
}

// Foto recortada dentro de um polígono (pts) preenchendo a caixa (x,y,w,h), com borda dourada.
export function drawPolyPhoto(ctx, img, pts, box, lw = 4.5) {
  const path = () => {
    ctx.beginPath();
    pts.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
    ctx.closePath();
  };
  ctx.save();
  path();
  ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
  ctx.fillStyle = "#050c20"; ctx.fill();
  ctx.restore();
  ctx.save();
  path();
  ctx.clip();
  if (img) {
    const [x, y, w, h] = box;
    const s = Math.max(w / img.width, h / img.height);
    const sw = w / s, sh = h / s;
    ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
  } else {
    ctx.fillStyle = "#12255a"; ctx.fillRect(...box);
  }
  ctx.restore();
  ctx.save();
  path();
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.strokeStyle = goldGradient(ctx, box[0], box[1], box[0] + box[2], box[1] + box[3]);
  ctx.stroke();
  ctx.restore();
}
