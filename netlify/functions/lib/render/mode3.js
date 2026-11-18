// Layout do Modo 3 — "Grade 6 Fotos" (venda mobiliada). Mapeamento fiel a public/refs/modo3.jpg (682 x 1024).
// Geometria em coordenadas do MODELO; P()/X()/Y() levam para o quadro de saída 768 x 1376 (9:16): escala pela
// largura e a altura extra vai toda para a grade de fotos (y 418..911), sem esticar textos.

import { BROKER } from "../config.js";
import {
  F, OUT_WIDTH, drawIcon, GOLD_ICON, drawBackground, drawFit, drawLogo, drawPhotoPlaceholder, drawSpaced, fitSize, getMonogram, goldGradient,
  iconFill, iconLine, loadPhoto, newCanvas, roundRect, setupFonts, wrapLines,
} from "./common.js";

const TW = 682, TH = 1024;
const W = 768, H = 1376;
const K = W / TW;
const EXTRA = H - TH * K;
const S = OUT_WIDTH / W;
const T = (v) => String(v ?? "").trim();
const up = (t) => String(t ?? "").toUpperCase();

const ex = (y) => EXTRA * Math.min(1, Math.max(0, (y - 418) / (911 - 418)));
const X = (x) => x * K;
const Y = (y) => y * K + ex(y);
const P = ([x, y]) => [X(x), Y(y)];

function path(ctx, pts) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

function goldText(ctx, text, x, y, { size, maxW, font = F.anton, align = "center" }) {
  const t = T(text);
  if (!t) return 0;
  const s = fitSize(ctx, t, font, maxW, size);
  ctx.save();
  ctx.font = font(s); ctx.textAlign = align; ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  ctx.lineWidth = 3; ctx.strokeStyle = "#5a3606"; ctx.strokeText(t, x, y);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = goldGradient(ctx, x, y - s * 0.8, x, y);
  ctx.fillText(t, x, y);
  ctx.restore();
  return s;
}

function decor(ctx) {
  // chevron dourado à direita do título
  ctx.save();
  ctx.lineJoin = "miter"; ctx.lineCap = "round";
  ctx.shadowColor = "rgba(255,200,80,.5)"; ctx.shadowBlur = 10;
  for (const [dx, lw] of [[0, 9], [-14, 1.6]]) {
    ctx.lineWidth = lw * K;
    ctx.strokeStyle = goldGradient(ctx, X(372), 0, X(440), Y(258));
    ctx.beginPath();
    ctx.moveTo(X(372 + dx), 0); ctx.lineTo(X(443 + dx), Y(150)); ctx.lineTo(X(402 + dx), Y(256));
    ctx.stroke();
  }
  ctx.restore();
  // faixa-pincel dourada abaixo do logo
  ctx.save();
  path(ctx, [P([318, 262]), P([682, 250]), P([682, 266]), P([330, 266])]);
  ctx.fillStyle = goldGradient(ctx, X(318), 0, X(682), 0); ctx.fill();
  ctx.restore();
}

function title(ctx, f) {
  drawSpaced(ctx, up(f.m3_cat), X(204), Y(52), { font: F.m6, size: 21 * K, spacing: 9 * K, fill: "#e9e3d0", maxW: X(250) });
  goldText(ctx, up(f.m3_highlight), X(212), Y(155), { size: 134 * K, maxW: X(368) });
  // à Venda + fios
  ctx.save();
  ctx.lineWidth = 1.4; ctx.strokeStyle = goldGradient(ctx, X(30), 0, X(390), 0);
  for (const [a, b] of [[30, 92], [336, 392]]) { ctx.beginPath(); ctx.moveTo(X(a), Y(188)); ctx.lineTo(X(b), Y(188)); ctx.stroke(); }
  ctx.restore();
  drawFit(ctx, T(f.m3_mod), X(214), Y(205), { font: F.script, size: 66 * K, maxW: X(236), fill: "#fff", shadow: { blur: 8, y: 3 } });
  // faixa dourada com 3 palavras
  ctx.save();
  path(ctx, [P([28, 252]), P([52, 222]), P([386, 222]), P([362, 252])]);
  ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  ctx.fillStyle = goldGradient(ctx, X(28), Y(222), X(386), Y(252)); ctx.fill();
  ctx.restore();
  drawFit(ctx, up(f.m3_ribbon), X(207), Y(241), { font: F.m7, size: 16 * K, maxW: X(300), fill: "#0a1a3d" });
}

function priceBox(ctx, f) {
  const x = X(25), y = Y(270), w = X(343), h = Y(412) - Y(270);
  ctx.save();
  roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = "rgba(4,12,34,.55)"; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = goldGradient(ctx, x, y, x + w, y + h); ctx.stroke();
  ctx.restore();
  drawSpaced(ctx, up(f.m3_price_lbl), X(46), Y(296), { font: F.m6, size: 19 * K, spacing: 5 * K, fill: "#fff", align: "left", maxW: X(160) });
  const raw = T(f.m3_price);
  const m = raw.match(/^\s*(R\$)?\s*([\d.,]+)\s*(.*)$/i);
  const base = Y(398);
  if (!m) { goldText(ctx, raw, x + w / 2, base, { size: 110 * K, maxW: w - X(26) }); return; }
  const [, cur = "", num, unit = ""] = m;
  const parts = [[cur, 58 * K], [num, 112 * K], [up(unit), 50 * K]].filter(([t]) => t);
  const gap = 8 * K, maxW = w - X(28);
  let scale = 1;
  const widthAt = (sc) => parts.reduce((a, [t, s], i) => { ctx.font = F.anton(s * sc); return a + ctx.measureText(t).width + (i ? gap : 0); }, 0);
  while (widthAt(scale) > maxW && scale > 0.3) scale -= 0.02;
  let cx = x + (w - widthAt(scale)) / 2;
  ctx.save();
  ctx.textAlign = "left"; ctx.lineJoin = "round";
  for (const [t, s] of parts) {
    ctx.font = F.anton(s * scale);
    ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
    ctx.lineWidth = 3; ctx.strokeStyle = "#5a3606"; ctx.strokeText(t, cx, base);
    ctx.shadowColor = "transparent";
    ctx.fillStyle = goldGradient(ctx, cx, base - s * scale * 0.8, cx, base);
    ctx.fillText(t, cx, base);
    cx += ctx.measureText(t).width + gap;
  }
  ctx.restore();
}

async function highlights(ctx, f) {
  const rows = [
    ["sofa", f.m3_h1_t1, f.m3_h1_t2, 294, 292, 307],
    ["shield", f.m3_h2_t1, f.m3_h2_t2, 339, 339, 354],
    ["pin", f.m3_h3_t1, f.m3_h3_t2, 384, 385, 400],
  ];
  for (const [icon, t1, t2, iy, ty, sy] of rows) {
    await drawIcon(ctx, icon, X(416), Y(iy), 34 * K, { gradient: GOLD_ICON, stroke: 1.6 });
    drawFit(ctx, up(t1), X(444), Y(ty), { font: F.m7, size: 16 * K, maxW: X(220), fill: "#fff", align: "left" });
    drawFit(ctx, up(t2), X(444), Y(sy), { font: F.m6, size: 11.5 * K, maxW: X(220), fill: "#cdd3e0", align: "left" });
  }
}

function drawCoverBox(ctx, img, x, y, w, h) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  if (img) {
    const s = Math.max(w / img.width, h / img.height);
    const sw = w / s, sh = h / s;
    ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
  } else {
    ctx.fillStyle = "#12255a"; ctx.fillRect(x, y, w, h);
  }
  ctx.restore();
}

function grid(ctx, imgs) {
  const x0 = X(22), x1 = X(313.5), x2 = X(662);
  const ys = [Y(418), Y(583), Y(758), Y(911)];
  let i = 0;
  for (let r = 0; r < 3; r++) {
    for (const [a, b] of [[x0, x1], [x1, x2]]) {
      const img = imgs.length ? imgs[i % imgs.length] : null;
      drawCoverBox(ctx, img, a, ys[r], b - a, ys[r + 1] - ys[r]);
      if (!imgs.length) drawPhotoPlaceholder(ctx, a + 2, ys[r] + 2, b - a - 4, ys[r + 1] - ys[r] - 4, 2);
      i++;
    }
  }
  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = goldGradient(ctx, x0, ys[0], x2, ys[3]);
  ctx.strokeRect(x0, ys[0], x2 - x0, ys[3] - ys[0]);
  ctx.beginPath(); ctx.moveTo(x1, ys[0]); ctx.lineTo(x1, ys[3]);
  ctx.moveTo(x0, ys[1]); ctx.lineTo(x2, ys[1]); ctx.moveTo(x0, ys[2]); ctx.lineTo(x2, ys[2]);
  ctx.stroke();
  ctx.restore();
}

async function footer(ctx, f) {
  // fio curvo dourado
  ctx.save();
  ctx.lineWidth = 3; ctx.strokeStyle = goldGradient(ctx, 0, 0, X(340), 0);
  ctx.beginPath(); ctx.moveTo(0, Y(958)); ctx.quadraticCurveTo(X(120), Y(1020), X(335), Y(1022)); ctx.stroke();
  ctx.restore();
  // ícone de telefone
  const ix = X(30), iy = Y(928), is = 54 * K;
  roundRect(ctx, ix, iy, is, is, 12 * K);
  ctx.fillStyle = goldGradient(ctx, ix, iy, ix + is, iy + is); ctx.fill();
  await drawIcon(ctx, "phone", ix + is / 2, iy + is / 2, 34 * K, { color: "#0a1a3d", stroke: 2.2 });
  drawFit(ctx, "MAIS INFORMAÇÕES E", X(94), Y(944), { font: F.m6, size: 13.5 * K, maxW: X(220), fill: "#dccb97", align: "left" });
  drawFit(ctx, "AGENDAR UMA VISITA", X(94), Y(961), { font: F.m6, size: 13.5 * K, maxW: X(220), fill: "#dccb97", align: "left" });
  drawFit(ctx, BROKER.phone.replace(/[()]/g, ""), X(92), Y(990), { font: F.m8, size: 27 * K, maxW: X(220), fill: "#fff", align: "left" });

  // placa creme com moldura dupla
  const x = X(320), y = Y(915), w = X(330), h = 95 * K, c = 14 * K;
  const plate = [[x + c, y], [x + w - c, y], [x + w, y + c], [x + w, y + h - c], [x + w - c, y + h], [x + c, y + h], [x, y + h - c], [x, y + c]];
  ctx.save();
  path(ctx, plate);
  ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
  ctx.fillStyle = goldGradient(ctx, x, y, x + w, y + h); ctx.fill();
  ctx.restore();
  const ins = 5 * K;
  const inner = [[x + c + ins, y + ins], [x + w - c - ins, y + ins], [x + w - ins, y + c + ins], [x + w - ins, y + h - c - ins], [x + w - c - ins, y + h - ins], [x + c + ins, y + h - ins], [x + ins, y + h - c - ins], [x + ins, y + c + ins]];
  path(ctx, inner);
  const cr = ctx.createLinearGradient(x, y, x, y + h);
  cr.addColorStop(0, "#f6ecd3"); cr.addColorStop(1, "#e6d6ae");
  ctx.fillStyle = cr; ctx.fill();
  ctx.lineWidth = 1.5; ctx.strokeStyle = "#b8862b"; ctx.stroke();
  // texto
  const t1 = up(f.m3_plaque1);
  const maxW = w - 36 * K;
  let size = 23 * K, lines = [];
  for (; size >= 12; size -= 0.5) {
    ctx.font = F.m8(size);
    lines = wrapLines(ctx, t1, maxW);
    if (lines.length <= 2 && lines.every((l) => ctx.measureText(l).width <= maxW)) break;
  }
  ctx.save();
  ctx.font = F.m8(size); ctx.fillStyle = "#0d1f48"; ctx.textAlign = "center";
  const lh = size * 1.12;
  const first = y + 31 * K + (lines.length === 1 ? lh * 0.5 : 0);
  lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, x + w / 2, first + i * lh));
  ctx.restore();
  drawSpaced(ctx, up(f.m3_plaque2), x + w / 2, y + h - 17 * K, { font: F.m7, size: 13.5 * K, spacing: 2 * K, fill: "#9a6a12", maxW: maxW });
}

export async function renderMode3({ fields, photos: rawPhotos = [] }) {
  setupFonts();
  const f = fields || {};
  const { canvas, ctx } = newCanvas(OUT_WIDTH, Math.round(H * S));
  ctx.scale(S, S);
  const mono = await getMonogram();
  const imgs = await Promise.all(rawPhotos.slice(0, 6).map(loadPhoto));

  drawBackground(ctx, W, H);
  decor(ctx);
  drawLogo(ctx, mono, X(466), Y(24), X(206));
  title(ctx, f);
  priceBox(ctx, f);
  await highlights(ctx, f);
  grid(ctx, imgs);
  await footer(ctx, f);
  return canvas.encode("jpeg", 95);
}
