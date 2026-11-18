// Layout do Modo 1 — "Casa & Condições" (venda com condições). Coordenadas em um quadro de 768 x 1376.

import { BROKER } from "../config.js";
import {
  F, drawCover, drawFit, drawPhotoPlaceholder, fitSize, getLogo, goldFrame, goldFrameStroke, goldGradient,
  iconFill, iconLine, loadPhoto, newCanvas, roundRect, setupFonts, sparkles, star, wrapLines,
} from "./common.js";

const REF_W = 768;
const REF_H = 1376;
const OUT_W = 1080;
const S = OUT_W / REF_W;

const SLOTS = [
  { x: 28, y: 310, w: 716, h: 214 },
  { x: 122, y: 536, w: 630, h: 188 },
  { x: 122, y: 738, w: 604, h: 168 },
  { x: 378, y: 1066, w: 372, h: 219 },
];

const up = (t) => String(t ?? "").toUpperCase();
const T = (v) => String(v ?? "").trim();

function background(ctx) {
  const bg = ctx.createLinearGradient(0, 0, 0, REF_H);
  bg.addColorStop(0, "#0b1d46");
  bg.addColorStop(0.5, "#08173a");
  bg.addColorStop(1, "#050e26");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, REF_W, REF_H);
  for (const [x, y, r, a] of [[640, 160, 420, 0.16], [120, 900, 380, 0.12], [400, 1150, 360, 0.08]]) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(40,80,170,${a})`);
    g.addColorStop(1, "rgba(40,80,170,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, REF_W, REF_H);
  }
  sparkles(ctx, REF_W, REF_H, 70);
  // canto dourado
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(130, 0); ctx.lineTo(0, 118); ctx.closePath();
  ctx.fillStyle = goldGradient(ctx, 0, 0, 130, 118);
  ctx.fill();
}

function goldText(ctx, text, x, y, { size, maxW, font = F.anton, depth = 3 }) {
  const t = T(text);
  if (!t) return;
  const s = fitSize(ctx, t, font, maxW, size);
  ctx.save();
  ctx.font = font(s);
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(0,0,0,.6)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.lineWidth = depth * 2;
  ctx.strokeStyle = "#5a3606";
  ctx.strokeText(t, x, y);
  ctx.shadowColor = "transparent";
  ctx.fillStyle = goldGradient(ctx, x, y - s * 0.8, x, y);
  ctx.fillText(t, x, y);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = "rgba(255,244,190,.7)";
  ctx.strokeText(t, x, y);
  ctx.restore();
}

function header(ctx, f, logo) {
  // logo
  const lw = 236;
  const lh = (logo.height / logo.width) * lw;
  ctx.drawImage(logo, 38, 24, lw, lh);

  drawFit(ctx, up(f.m1_pre), 525, 94, { font: F.anton, size: 66, maxW: 440, fill: "#fff", shadow: { blur: 8, y: 3 } });
  goldText(ctx, up(f.m1_main), 525, 196, { size: 132, maxW: 450, font: F.m8, depth: 2.5 });

  // barra do bairro
  roundRect(ctx, 314, 218, 424, 46, 5);
  ctx.fillStyle = goldGradient(ctx, 314, 218, 738, 264);
  ctx.fill();
  const loc = up(f.m1_loc);
  const ls = fitSize(ctx, loc, F.m8, 356, 22, 12);
  ctx.font = F.m8(ls);
  const tw = ctx.measureText(loc).width;
  const total = 24 + 8 + tw;
  const sx = 526 - total / 2;
  iconFill(ctx, "pin", sx + 12, 241, 26, "#0a1a3d");
  ctx.fillStyle = "#0a1a3d";
  ctx.textAlign = "left";
  ctx.fillText(loc, sx + 32, 249);

  drawFit(ctx, T(f.m1_cursive), 526, 294, { font: F.script, size: 34, maxW: 430, fill: "#f3d98a", shadow: { blur: 6, y: 2 } });
}

function photos(ctx, imgs) {
  SLOTS.forEach((s, i) => {
    goldFrame(ctx, s.x, s.y, s.w, s.h, 8);
    if (imgs.length) drawCover(ctx, imgs[i % imgs.length], s.x, s.y, s.w, s.h, 8, i === 0 ? 0.55 : 0.5);
    else drawPhotoPlaceholder(ctx, s.x, s.y, s.w, s.h, 8);
    goldFrameStroke(ctx, s.x, s.y, s.w, s.h, 8, 4.5);
    ctx.save();
    roundRect(ctx, s.x + 5, s.y + 5, s.w - 10, s.h - 10, 5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,240,180,.45)";
    ctx.stroke();
    ctx.restore();
  });
}

function seal(ctx) {
  const cx = 103, cy = 766, r = 88;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.6)";
  ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy, r);
  g.addColorStop(0, "#142a5f"); g.addColorStop(1, "#08122e");
  ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  ctx.lineWidth = 8; ctx.strokeStyle = goldGradient(ctx, cx - r, cy - r, cx + r, cy + r);
  ctx.beginPath(); ctx.arc(cx, cy, r - 2, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(255,240,180,.6)";
  ctx.beginPath(); ctx.arc(cx, cy, r - 13, 0, Math.PI * 2); ctx.stroke();

  iconLine(ctx, "house", cx, 712, 24, "#e9bf5c", 2.6);
  goldText(ctx, "ÓTIMA", cx, 752, { size: 34, maxW: 120, depth: 1.5 });
  drawFit(ctx, "OPORTUNIDADE", cx, 775, { font: F.anton, size: 21, maxW: 128, fill: (s) => goldGradient(ctx, 0, 765, 0, 777) });
  drawFit(ctx, "PARA MORAR OU", cx, 796, { font: F.m8, size: 12, maxW: 122, fill: "#fff" });
  drawFit(ctx, "INVESTIR!", cx, 812, { font: F.m8, size: 12, maxW: 122, fill: "#fff" });
  for (const dx of [-16, 0, 16]) star(ctx, cx + dx, 832, 5.5, "#e9bf5c");
}

function pillars(ctx, f) {
  const cols = [
    { icon: "house", cx: 76, w: 108, top: f.m1_p1_top, bot: f.m1_p1_bot },
    { icon: "pool", cx: 203, w: 126, top: f.m1_p2_top, bot: f.m1_p2_bot },
    { icon: "bed", cx: 349, w: 146, top: f.m1_p3_top, bot: f.m1_p3_bot },
  ];
  // linhas divisórias
  ctx.save();
  ctx.strokeStyle = "rgba(233,191,92,.55)";
  ctx.lineWidth = 1.5;
  for (const x of [136, 270]) { ctx.beginPath(); ctx.moveTo(x, 932); ctx.lineTo(x, 1040); ctx.stroke(); }
  ctx.restore();
  for (const c of cols) {
    iconLine(ctx, c.icon, c.cx, 954, 48, goldGradient(ctx, c.cx - 24, 930, c.cx + 24, 978), 2.8);
    drawFit(ctx, up(c.top), c.cx, 1001, { font: F.m8, size: 15, maxW: c.w, fill: "#fff" });
    drawFit(ctx, T(c.bot), c.cx, 1030, { font: F.anton, size: 28, maxW: c.w, fill: (s) => goldGradient(ctx, 0, 1008, 0, 1032) });
  }
}

function priceBox(ctx, f) {
  ctx.save();
  roundRect(ctx, 435, 936, 315, 104, 12);
  ctx.fillStyle = "rgba(4,12,34,.85)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = goldGradient(ctx, 435, 936, 750, 1040);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.font = F.m8(13);
  ctx.fillStyle = "#e9bf5c";
  ctx.textAlign = "left";
  ctx.fillText("VALOR:", 458, 960);
  ctx.restore();
  goldText(ctx, T(f.m1_price), 592, 1010, { size: 54, maxW: 288, depth: 1.5 });
  drawFit(ctx, T(f.m1_price_sub), 592, 1030, { font: F.m7, size: 14.5, maxW: 292, fill: "#fff" });
}

function conditions(ctx, f) {
  drawFit(ctx, "CONDIÇÕES FACILITADAS:", 25, 1092, { font: F.m8, size: 23, maxW: 330, fill: (s) => goldGradient(ctx, 0, 1070, 0, 1094), align: "left" });
  const rows = [f.m1_c1, f.m1_c2, f.m1_c3, f.m1_c4];
  rows.forEach((text, i) => {
    const cy = 1137 + i * 44;
    ctx.beginPath(); ctx.arc(39, cy, 14, 0, Math.PI * 2);
    ctx.fillStyle = goldGradient(ctx, 25, cy - 14, 53, cy + 14); ctx.fill();
    ctx.save();
    ctx.strokeStyle = "#0a1a3d"; ctx.lineWidth = 3.2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(32, cy + 0.5); ctx.lineTo(37.5, cy + 6); ctx.lineTo(47, cy - 6); ctx.stroke();
    ctx.restore();
    drawFit(ctx, up(text), 63, cy + 6, { font: F.m7, size: 17.5, maxW: 305, fill: "#fff", align: "left" });
  });
}

function note(ctx, f) {
  const text = T(f.m1_note);
  if (!text) return;
  const cx = 654, cy = 1240, w = 216, h = 116;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((-7 * Math.PI) / 180);
  ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
  roundRect(ctx, -w / 2, -h / 2, w, h, 6);
  const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  g.addColorStop(0, "#fbf3dc"); g.addColorStop(1, "#e7d8b0");
  ctx.fillStyle = g; ctx.fill();
  ctx.shadowColor = "transparent";
  // texto cursivo em até 3 linhas
  let size = 36, lines = [];
  for (; size >= 18; size -= 1) {
    ctx.font = F.script(size);
    lines = wrapLines(ctx, text, w - 28);
    if (lines.length <= 3 && lines.length * size * 0.95 <= h - 22 && lines.every((l) => ctx.measureText(l).width <= w - 20)) break;
  }
  ctx.fillStyle = "#14234a";
  ctx.textAlign = "center";
  const lh = size * 0.95;
  const y0 = -((lines.length - 1) * lh) / 2 + size * 0.28;
  lines.forEach((l, i) => ctx.fillText(l, 0, y0 + i * lh));
  ctx.restore();
}

function footer(ctx) {
  ctx.fillStyle = "#040b1f";
  ctx.fillRect(0, 1301, REF_W, 75);
  ctx.fillStyle = goldGradient(ctx, 0, 1299, REF_W, 1303);
  ctx.fillRect(0, 1298, REF_W, 4);
  iconLine(ctx, "calendar", 62, 1338, 52, goldGradient(ctx, 36, 1312, 88, 1364), 2.6);
  drawFit(ctx, "AGENDE SUA VISITA:", 100, 1352, { font: F.anton, size: 30, maxW: 232, fill: "#fff", align: "left" });
  roundRect(ctx, 338, 1309, 414, 60, 30);
  ctx.fillStyle = goldGradient(ctx, 338, 1309, 752, 1369);
  ctx.fill();
  ctx.beginPath(); ctx.arc(371, 1339, 26, 0, Math.PI * 2); ctx.fillStyle = "#0a1a3d"; ctx.fill();
  iconFill(ctx, "phone", 371, 1339, 28, "#e9bf5c");
  drawFit(ctx, BROKER.phone, 565, 1354, { font: F.anton, size: 44, maxW: 300, fill: "#0a1a3d" });
}

export async function renderMode1({ fields, photos: rawPhotos = [] }) {
  setupFonts();
  const f = fields || {};
  const { canvas, ctx } = newCanvas(OUT_W, Math.round(REF_H * S));
  ctx.scale(S, S);
  const logo = await getLogo();
  const imgs = await Promise.all(rawPhotos.slice(0, 4).map(loadPhoto));

  background(ctx);
  header(ctx, f, logo);
  photos(ctx, imgs);
  seal(ctx);
  pillars(ctx, f);
  priceBox(ctx, f);
  conditions(ctx, f);
  note(ctx, f);
  footer(ctx);
  return canvas.encode("jpeg", 92);
}
