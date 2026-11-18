// Layout do Modo 2 — "Curva & Ficha" (locação). Quadro de 768 x 1376.

import { BROKER } from "../config.js";
import {
  F, drawBackground, drawCover, drawFit, drawPhotoPlaceholder, drawPolyPhoto, fitSize, getLogo, goldFrame,
  goldFrameStroke, goldGradient, iconFill, iconLine, loadPhoto, newCanvas, roundRect, setupFonts, wrapLines,
} from "./common.js";

const W = 768;
const H = 1376;
const S = 1080 / W;
const T = (v) => String(v ?? "").trim();
const up = (t) => String(t ?? "").toUpperCase();
const ICONS = ["bed", "sofa", "bbq", "car", "party"];

function goldLine(ctx, x0, y0, x1, y1, lw = 3) {
  ctx.save();
  ctx.lineWidth = lw;
  ctx.strokeStyle = goldGradient(ctx, x0, y0, x1, y1);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  ctx.restore();
}

function header(ctx, f) {
  drawFit(ctx, up(f.m2_mod), 26, 78, { font: F.m7, size: 26, maxW: 262, fill: "#f0d37c", align: "left" });
  // bairro: até 2 linhas grandes, douradas
  const name = up(f.m2_neighborhood);
  let size = 54, lines = [];
  for (; size >= 28; size -= 1) {
    ctx.font = F.m8(size);
    lines = wrapLines(ctx, name, 262);
    if (lines.length <= 2 && lines.every((l) => ctx.measureText(l).width <= 262)) break;
  }
  lines.slice(0, 2).forEach((l, i) => {
    ctx.save();
    ctx.font = F.m8(size);
    ctx.textAlign = "left";
    const b = 128 + i * (size + 8);
    ctx.fillStyle = goldGradient(ctx, 0, b - size * 0.8, 0, b);
    ctx.fillText(l, 26, b);
    ctx.restore();
  });
  const yCity = 128 + (Math.min(lines.length, 2) - 1) * (size + 8) + 62;
  drawFit(ctx, up(f.m2_city), 26, yCity, { font: F.m8, size: 38, maxW: 262, fill: (s) => goldGradient(ctx, 0, yCity - 34, 0, yCity), align: "left" });
  // pílula distância
  const py = yCity + 28;
  roundRect(ctx, 22, py, 270, 46, 23);
  ctx.fillStyle = "#f4e3b0";
  ctx.fill();
  iconFill(ctx, "pin", 48, py + 23, 24, "#0a1a3d");
  drawFit(ctx, up(f.m2_dist), 66, py + 30, { font: F.m8, size: 17, maxW: 216, fill: "#0a1a3d", align: "left" });
  return py + 46;
}

function features(ctx, f, y0) {
  const items = [f.m2_f1, f.m2_f2, f.m2_f3, f.m2_f4, f.m2_f5].map(T).filter(Boolean);
  const gap = 124;
  items.forEach((text, i) => {
    const cy = y0 + 60 + i * gap;
    iconLine(ctx, ICONS[i], 46, cy, 52, goldGradient(ctx, 22, cy - 23, 70, cy + 23), 2.6);
    let size = 20, lines = [];
    for (; size >= 12; size -= 0.5) {
      ctx.font = F.m7(size);
      lines = wrapLines(ctx, up(text), 176);
      if (lines.length <= 3 && lines.every((l) => ctx.measureText(l).width <= 176)) break;
    }
    ctx.save();
    ctx.font = F.m7(size);
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    const lh = size * 1.22;
    const top = cy - ((lines.length - 1) * lh) / 2 + size * 0.34;
    lines.forEach((l, k) => ctx.fillText(l, 92, top + k * lh));
    ctx.restore();
  });
}

function photos(ctx, imgs) {
  const pick = (i) => (imgs.length ? imgs[i % imgs.length] : null);
  // hero (polígono inclinado)
  drawPolyPhoto(ctx, pick(0), [[372, 0], [768, 0], [768, 596], [320, 596]], [320, 0, 448, 596], 5);
  const slots = [
    { x: 262, y: 616, w: 240, h: 178 },
    { x: 514, y: 616, w: 240, h: 178 },
    { x: 262, y: 806, w: 492, h: 200 },
  ];
  slots.forEach((s, i) => {
    goldFrame(ctx, s.x, s.y, s.w, s.h, 6);
    if (imgs.length) drawCover(ctx, pick(i + 1), s.x, s.y, s.w, s.h, 6);
    else drawPhotoPlaceholder(ctx, s.x, s.y, s.w, s.h, 6);
    goldFrameStroke(ctx, s.x, s.y, s.w, s.h, 6, 4);
  });
}

function priceAndGuarantee(ctx, f) {
  // caixa do valor
  const x = 14, y = 1034, w = 290, h = 150;
  ctx.save();
  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = "rgba(4,12,34,.92)"; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = goldGradient(ctx, x, y, x + w, y + h); ctx.stroke();
  ctx.restore();
  roundRect(ctx, x + 18, y + 14, 150, 34, 6);
  ctx.fillStyle = goldGradient(ctx, x + 18, y + 14, x + 168, y + 48); ctx.fill();
  drawFit(ctx, up(f.m2_badge), x + 93, y + 38, { font: F.anton, size: 22, maxW: 130, fill: "#3a2204" });
  drawFit(ctx, T(f.m2_price), x + w / 2, y + 100, { font: F.m8, size: 46, maxW: w - 34, fill: "#fff" });
  drawFit(ctx, T(f.m2_condo), x + w / 2, y + 132, { font: F.m7, size: 16, maxW: w - 30, fill: "#f0d37c" });

  // caixa dourada de garantia
  const gx = 320, gy = 1034, gw = 434, gh = 150;
  ctx.save();
  roundRect(ctx, gx, gy, gw, gh, 14);
  ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
  const g = ctx.createLinearGradient(gx, gy, gx + gw, gy + gh);
  g.addColorStop(0, "#f7e8b8"); g.addColorStop(0.5, "#e7c46e"); g.addColorStop(1, "#c9993a");
  ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  iconFill(ctx, "shield", gx + 52, gy + gh / 2, 64, "#0d2250");
  ctx.save();
  ctx.strokeStyle = "#f0d37c"; ctx.lineWidth = 4.5; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(gx + 40, gy + gh / 2 + 2); ctx.lineTo(gx + 49, gy + gh / 2 + 11); ctx.lineTo(gx + 66, gy + gh / 2 - 8); ctx.stroke();
  ctx.restore();
  const text = up(f.m2_guarantee);
  let size = 24, lines = [];
  for (; size >= 13; size -= 0.5) {
    ctx.font = F.m8(size);
    lines = wrapLines(ctx, text, gw - 130);
    if (lines.length <= 4 && lines.length * size * 1.22 <= gh - 26) break;
  }
  ctx.save();
  ctx.font = F.m8(size); ctx.fillStyle = "#0d2250"; ctx.textAlign = "left";
  const lh = size * 1.22;
  const top = gy + gh / 2 - ((lines.length - 1) * lh) / 2 + size * 0.34;
  lines.forEach((l, i) => ctx.fillText(l, gx + 100, top + i * lh));
  ctx.restore();
}

function footer(ctx, logo) {
  goldLine(ctx, 0, 1206, W, 1206, 3);
  ctx.save();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = goldGradient(ctx, 28, 1250, 100, 1322);
  ctx.beginPath(); ctx.arc(64, 1288, 36, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
  iconFill(ctx, "phone", 64, 1288, 36, "#e9bf5c");
  drawFit(ctx, "AGENDE SUA VISITA:", 118, 1262, { font: F.m7, size: 19, maxW: 300, fill: "#fff", align: "left" });
  drawFit(ctx, BROKER.phone, 118, 1314, { font: F.m8, size: 42, maxW: 360, fill: (s) => goldGradient(ctx, 0, 1280, 0, 1316), align: "left" });
  const lw = 172;
  const lh = (logo.height / logo.width) * lw;
  ctx.drawImage(logo, 568, 1192, lw, lh);
}

export async function renderMode2({ fields, photos: rawPhotos = [] }) {
  setupFonts();
  const f = fields || {};
  const { canvas, ctx } = newCanvas(1080, Math.round(H * S));
  ctx.scale(S, S);
  const logo = await getLogo();
  const imgs = await Promise.all(rawPhotos.slice(0, 4).map(loadPhoto));

  drawBackground(ctx, W, H);
  // moldura curva dourada da coluna esquerda
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = goldGradient(ctx, 300, 0, 240, 1000);
  ctx.beginPath(); ctx.moveTo(332, 0); ctx.bezierCurveTo(300, 260, 250, 520, 238, 1010); ctx.stroke();
  ctx.restore();
  const yEnd = header(ctx, f);
  features(ctx, f, yEnd + 10);
  photos(ctx, imgs);
  priceAndGuarantee(ctx, f);
  footer(ctx, logo);
  return canvas.encode("jpeg", 92);
}
