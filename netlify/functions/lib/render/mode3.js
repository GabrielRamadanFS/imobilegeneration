// Layout do Modo 3 — "Grade 6 Fotos" (destaque de preço, várias fotos). Quadro de 768 x 1376.

import { BROKER } from "../config.js";
import {
  F, drawBackground, drawCover, drawFit, drawPhotoPlaceholder, drawSpaced, fitSize, getLogo, goldFrame,
  goldFrameStroke, goldGradient, iconFill, iconLine, loadPhoto, newCanvas, roundRect, setupFonts, wrapLines,
} from "./common.js";

const W = 768;
const H = 1376;
const S = 1080 / W;
const T = (v) => String(v ?? "").trim();
const up = (t) => String(t ?? "").toUpperCase();

function goldText(ctx, text, x, y, { size, maxW, font = F.anton, depth = 2.5, align = "center" }) {
  const t = T(text);
  if (!t) return;
  const s = fitSize(ctx, t, font, maxW, size);
  ctx.save();
  ctx.font = font(s);
  ctx.textAlign = align;
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
  ctx.lineWidth = depth * 2; ctx.strokeStyle = "#5a3606";
  ctx.strokeText(t, x, y);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = goldGradient(ctx, x, y - s * 0.85, x, y);
  ctx.fillText(t, x, y);
  ctx.lineWidth = 1.1; ctx.strokeStyle = "rgba(255,244,190,.7)";
  ctx.strokeText(t, x, y);
  ctx.restore();
}

function top(ctx, f, logo) {
  // painel do logo (direita) com linha dourada inclinada
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = goldGradient(ctx, 540, 0, 500, 300);
  ctx.beginPath(); ctx.moveTo(548, 0); ctx.lineTo(500, 300); ctx.stroke();
  ctx.restore();
  const lw = 196;
  const lh = (logo.height / logo.width) * lw;
  ctx.drawImage(logo, 560, 40, lw, lh);

  drawSpaced(ctx, up(f.m3_cat), 262, 70, { font: F.m6, size: 24, spacing: 10, fill: "#fff", maxW: 440 });
  goldText(ctx, up(f.m3_highlight), 262, 200, { size: 124, maxW: 470 });
  drawFit(ctx, T(f.m3_mod), 262, 268, { font: F.script, size: 76, maxW: 380, fill: "#fff", shadow: { blur: 8, y: 3 } });

  // faixa dourada inclinada
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(14, 292); ctx.lineTo(500, 292); ctx.lineTo(488, 338); ctx.lineTo(0, 338); ctx.closePath();
  ctx.fillStyle = goldGradient(ctx, 0, 292, 500, 338);
  ctx.fill();
  ctx.restore();
  drawSpaced(ctx, up(f.m3_ribbon), 246, 322, { font: F.m8, size: 18, spacing: 3, fill: "#0a1a3d", maxW: 440 });
}

function priceRow(ctx, f) {
  const x = 22, y = 368, w = 452, h = 176;
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = "rgba(4,12,34,.88)"; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = goldGradient(ctx, x, y, x + w, y + h); ctx.stroke();
  ctx.restore();
  drawSpaced(ctx, up(f.m3_price_lbl), x + 28, y + 52, { font: F.m6, size: 24, spacing: 6, fill: "#fff", align: "left", maxW: 300 });
  goldText(ctx, T(f.m3_price), x + w / 2, y + 150, { size: 104, maxW: w - 44, depth: 2 });

  // 3 destaques à direita
  const items = [
    ["sofa", f.m3_h1_t1, f.m3_h1_t2],
    ["shield", f.m3_h2_t1, f.m3_h2_t2],
    ["pin", f.m3_h3_t1, f.m3_h3_t2],
  ];
  items.forEach(([icon, t1, t2], i) => {
    const cy = y + 34 + i * 60;
    if (icon === "sofa") iconLine(ctx, "sofa", 508, cy, 36, goldGradient(ctx, 490, cy - 18, 526, cy + 18), 2.6);
    else iconFill(ctx, icon, 508, cy, 32, goldGradient(ctx, 492, cy - 16, 524, cy + 16));
    drawFit(ctx, up(t1), 538, cy - 2, { font: F.m8, size: 16.5, maxW: 222, fill: "#fff", align: "left" });
    drawFit(ctx, up(t2), 538, cy + 16, { font: F.m6, size: 12, maxW: 222, fill: "#cfd6e6", align: "left" });
  });
}

function grid(ctx, imgs) {
  const cols = [24, 390];
  const rows = [566, 786, 1006];
  const w = 354, h = 208;
  let i = 0;
  for (const y of rows) for (const x of cols) {
    goldFrame(ctx, x, y, w, h, 5);
    if (imgs.length) drawCover(ctx, imgs[i % imgs.length], x, y, w, h, 5);
    else drawPhotoPlaceholder(ctx, x, y, w, h, 5);
    goldFrameStroke(ctx, x, y, w, h, 5, 3.5);
    i++;
  }
}

function footer(ctx, f) {
  ctx.fillStyle = "#040b1f";
  ctx.fillRect(0, 1238, W, H - 1238);
  ctx.fillStyle = goldGradient(ctx, 0, 1236, W, 1241);
  ctx.fillRect(0, 1235, W, 4);
  // ícone de telefone
  roundRect(ctx, 24, 1262, 66, 66, 14);
  ctx.fillStyle = goldGradient(ctx, 24, 1262, 90, 1328); ctx.fill();
  iconFill(ctx, "phone", 57, 1295, 36, "#0a1a3d");
  drawFit(ctx, "MAIS INFORMAÇÕES E", 106, 1284, { font: F.m6, size: 15, maxW: 230, fill: "#d6dcec", align: "left" });
  drawFit(ctx, "AGENDAR UMA VISITA", 106, 1304, { font: F.m6, size: 15, maxW: 230, fill: "#d6dcec", align: "left" });
  drawFit(ctx, BROKER.phone, 106, 1346, { font: F.m8, size: 34, maxW: 240, fill: "#fff", align: "left" });

  // placa dourada
  const x = 362, y = 1252, w = 388, h = 112;
  ctx.save();
  roundRect(ctx, x, y, w, h, 10);
  ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, "#f7e8b8"); g.addColorStop(0.5, "#ecd08a"); g.addColorStop(1, "#d5a944");
  ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  roundRect(ctx, x + 5, y + 5, w - 10, h - 10, 7);
  ctx.lineWidth = 3; ctx.strokeStyle = goldGradient(ctx, x, y, x + w, y + h); ctx.stroke();
  // linha 1 (até 2 linhas) + linha 2 (destaque)
  const t1 = up(f.m3_plaque1);
  let size = 27, lines = [];
  for (; size >= 15; size -= 0.5) {
    ctx.font = F.m8(size);
    lines = wrapLines(ctx, t1, w - 40);
    if (lines.length <= 2) break;
  }
  const lh = size * 1.15;
  const base = y + 38 + (lines.length === 1 ? 10 : 0);
  ctx.save();
  ctx.font = F.m8(size); ctx.fillStyle = "#0d2250"; ctx.textAlign = "center";
  lines.forEach((l, i) => ctx.fillText(l, x + w / 2, base + i * lh));
  ctx.restore();
  const y2 = y + h - 14;
  const bar = ctx.createLinearGradient(x, 0, x + w, 0);
  bar.addColorStop(0, "#0d2250"); bar.addColorStop(1, "#16336f");
  roundRect(ctx, x + 22, y2 - 24, w - 44, 28, 5);
  ctx.fillStyle = bar; ctx.fill();
  drawFit(ctx, up(f.m3_plaque2), x + w / 2, y2 - 4, { font: F.m8, size: 16.5, maxW: w - 70, fill: "#f0d37c" });
}

export async function renderMode3({ fields, photos: rawPhotos = [] }) {
  setupFonts();
  const f = fields || {};
  const { canvas, ctx } = newCanvas(1080, Math.round(H * S));
  ctx.scale(S, S);
  const logo = await getLogo();
  const imgs = await Promise.all(rawPhotos.slice(0, 6).map(loadPhoto));

  drawBackground(ctx, W, H);
  top(ctx, f, logo);
  priceRow(ctx, f);
  grid(ctx, imgs);
  footer(ctx, f);
  return canvas.encode("jpeg", 92);
}
