// Layout do Modo 2 — "Curva & Ficha" (locação). Mapeamento fiel a public/refs/modo2.jpg (682 x 1024).
// Toda a geometria abaixo está em coordenadas do MODELO; P() leva para o quadro de saída 768 x 1376 (9:16):
// escala pela largura e distribui a altura extra entre as fotos e a lista (y 260..800), sem esticar textos.

import { BROKER } from "../config.js";
import {
  F, OUT_WIDTH, getAsset, drawBackground, drawFit, drawLogo, drawPolyPhoto, getMonogram, goldGradient, iconFill, iconLine,
  loadPhoto, newCanvas, roundRect, setupFonts, wrapLines,
} from "./common.js";

const TW = 682, TH = 1024; // modelo
const W = 768, H = 1376;   // saída
const K = W / TW;
const EXTRA = H - TH * K;
const S = OUT_WIDTH / W;
const T = (v) => String(v ?? "").trim();
const up = (t) => String(t ?? "").toUpperCase();
const ICONS = ["bed", "sofa", "bbq", "car", "party"];

const ex = (y) => EXTRA * Math.min(1, Math.max(0, (y - 260) / (800 - 260)));
const P = ([x, y]) => [x * K, y * K + ex(y)];
const Y = (y) => y * K + ex(y);
const X = (x) => x * K;
const PP = (pts) => pts.map(P);

// Catmull-Rom: pontos -> curva suave amostrada
function smooth(pts, n = 8) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let t = 0; t < n; t++) {
      const u = t / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// Arredonda os cantos de um polígono (raio r por vértice ou único)
function rounded(pts, r) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const rad = Array.isArray(r) ? r[i] : r;
    const p = pts[i], a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    if (!rad) { out.push(p); continue; }
    const va = [a[0] - p[0], a[1] - p[1]], vb = [b[0] - p[0], b[1] - p[1]];
    const la = Math.hypot(...va), lb = Math.hypot(...vb);
    const ra = Math.min(rad, la / 2), rb = Math.min(rad, lb / 2);
    const s = [p[0] + (va[0] / la) * ra, p[1] + (va[1] / la) * ra];
    const e = [p[0] + (vb[0] / lb) * rb, p[1] + (vb[1] / lb) * rb];
    for (let t = 0; t <= 6; t++) {
      const u = t / 6;
      out.push([(1 - u) * (1 - u) * s[0] + 2 * (1 - u) * u * p[0] + u * u * e[0], (1 - u) * (1 - u) * s[1] + 2 * (1 - u) * u * p[1] + u * u * e[1]]);
    }
  }
  return out;
}

const bbox = (pts) => {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  return [x, y, Math.max(...xs) - x, Math.max(...ys) - y];
};

// Curva dourada que separa o painel esquerdo da foto principal (modelo)
const CURVE = [[278, 0], [290, 30], [310, 60], [328, 90], [333, 110], [330, 150], [322, 200], [308, 225], [292, 245], [272, 280], [255, 310], [245, 350], [237, 390], [233, 412]];

function swoosh(ctx, pts, lw) {
  const q = smooth(PP(pts));
  ctx.save();
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.shadowColor = "rgba(255,200,80,.55)"; ctx.shadowBlur = 10;
  ctx.lineWidth = lw;
  ctx.strokeStyle = goldGradient(ctx, 0, 0, 0, H * 0.5);
  ctx.beginPath(); q.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.restore();
}

function header(ctx, f) {
  drawFit(ctx, up(f.m2_mod), X(22), Y(78), { font: F.m7, size: 31 * K, maxW: X(250), fill: "#f0d889", align: "left" });
  const name = up(f.m2_neighborhood);
  let size = 58 * K, lines = [];
  const maxW = X(262);
  for (; size >= 24; size -= 1) {
    ctx.font = F.m8(size);
    lines = wrapLines(ctx, name, maxW);
    if (lines.length <= 2 && lines.every((l) => ctx.measureText(l).width <= maxW)) break;
  }
  const lh = 52 * K;
  lines.slice(0, 2).forEach((l, i) => {
    const b = Y(137) + i * lh;
    ctx.save();
    ctx.font = F.m8(size); ctx.textAlign = "left";
    ctx.fillStyle = goldGradient(ctx, 0, b - size * 0.8, 0, b);
    ctx.fillText(l, X(22), b);
    ctx.restore();
  });
  const nl = Math.min(lines.length, 2);
  const yCity = Y(137) + (nl - 1) * lh + 46 * K;
  drawFit(ctx, up(f.m2_city), X(22), yCity, { font: F.m8, size: 37 * K, maxW, fill: () => goldGradient(ctx, 0, yCity - 30 * K, 0, yCity), align: "left" });
  const py = yCity + 20 * K, ph = 40 * K;
  roundRect(ctx, X(20), py, X(245), ph, ph / 2);
  const g = ctx.createLinearGradient(0, py, 0, py + ph);
  g.addColorStop(0, "#f8e8bd"); g.addColorStop(1, "#e8cc8a");
  ctx.fillStyle = g; ctx.fill();
  iconFill(ctx, "pin", X(46), py + ph / 2, 22 * K, "#0a1a3d");
  drawFit(ctx, up(f.m2_dist), X(64), py + ph / 2 + 7 * K, { font: F.m7, size: 19 * K, maxW: X(192), fill: "#0a1a3d", align: "left" });
}

const ROWS = [358, 430, 504, 588, 658];

async function features(ctx, f) {
  const items = [f.m2_f1, f.m2_f2, f.m2_f3, f.m2_f4, f.m2_f5].map(T).filter(Boolean);
  for (const [i, text] of items.entries()) {
    const cy = Y(ROWS[i]);
    const ic = await getAsset(`m2-${ICONS[i]}.png`);
    const ih = 50 * K, iw = Math.min(X(46), (ic.width / ic.height) * ih);
    ctx.drawImage(ic, X(46) - iw / 2, cy - ih / 2, iw, ih);
    const mw = X(150);
    let size = 21 * K, lines = [];
    for (; size >= 12; size -= 0.5) {
      ctx.font = F.m6(size);
      lines = wrapLines(ctx, up(text), mw);
      if (lines.length <= 4 && lines.every((l) => ctx.measureText(l).width <= mw)) break;
    }
    ctx.save();
    ctx.font = F.m6(size); ctx.fillStyle = "#fff"; ctx.textAlign = "left";
    const lh = size * 1.18;
    const top = cy - ((lines.length - 1) * lh) / 2 + size * 0.34;
    lines.forEach((l, k) => ctx.fillText(l, X(80), top + k * lh));
    ctx.restore();
  }
}

function photos(ctx, imgs) {
  const pick = (i) => (imgs.length ? imgs[i % imgs.length] : null);
  const hero = PP([...smooth(CURVE.map(([x, y]) => [x, y]), 3), [682, 412], [682, 0]]).map(([x, y]) => [x, y]);
  // o mapeamento de y é não linear; amostra mais pontos nas bordas retas
  const heroPts = [...smooth(PP(CURVE)), P([682, 412]), P([682, 0])];
  drawPolyPhoto(ctx, pick(0), heroPts, bbox(heroPts), 4);
  void hero;
  const L = rounded(PP([[236, 411], [456, 411], [456, 586], [262, 586]]), [18, 0, 0, 14]);
  const R = rounded(PP([[458, 411], [682, 411], [682, 586], [458, 586]]), [18, 0, 0, 0]);
  const B = rounded(PP([[262, 587], [682, 587], [682, 800], [270, 800], [258, 768], [215, 762]]), [20, 0, 0, 0, 0, 6]);
  drawPolyPhoto(ctx, pick(1), L, bbox(L), 3.5);
  drawPolyPhoto(ctx, pick(2), R, bbox(R), 3.5);
  drawPolyPhoto(ctx, pick(3), B, bbox(B), 3.5);
}

function priceAndGuarantee(ctx, f) {
  // barra creme da garantia (atrás do box do preço)
  const cream = PP([[268, 800], [540, 800], [525, 832], [505, 872], [470, 902], [268, 902]]);
  ctx.save();
  ctx.beginPath(); cream.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  const g = ctx.createLinearGradient(X(268), Y(800), X(540), Y(902));
  g.addColorStop(0, "#f6e6bd"); g.addColorStop(1, "#e4c98f");
  ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  // linhas douradas horizontais (topo da barra e base do conjunto)
  ctx.save();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = goldGradient(ctx, 0, 0, W, 0);
  ctx.beginPath(); ctx.moveTo(0, Y(901)); ctx.lineTo(X(470), Y(901)); ctx.stroke();
  ctx.restore();

  // box do preço (painel azul com borda dourada)
  const bx = X(20), by = Y(763), bw = X(246), bh = Y(901) - Y(763);
  ctx.save();
  roundRect(ctx, bx, by, bw, bh, 22);
  ctx.fillStyle = "#0a1a44"; ctx.fill();
  ctx.lineWidth = 3.5; ctx.strokeStyle = goldGradient(ctx, bx, by, bx + bw, by + bh); ctx.stroke();
  ctx.restore();
  // etiqueta ALUGUEL
  const tx = X(26), ty = by + 14 * K, tw = X(118), th = 30 * K;
  roundRect(ctx, tx, ty, tw, th, 6);
  ctx.fillStyle = goldGradient(ctx, tx, ty, tx + tw, ty + th); ctx.fill();
  drawFit(ctx, up(f.m2_badge), tx + tw / 2, ty + th - 7 * K, { font: F.anton, size: 23 * K, maxW: tw - 16, fill: "#3a2204" });
  // preço
  {
    const m = T(f.m2_price).match(/^\s*(R\$)?\s*([\d.,]+)\s*(.*)$/i);
    const base = by + 85 * K;
    if (!m) drawFit(ctx, T(f.m2_price), bx + bw / 2, base, { font: F.m8, size: 46 * K, maxW: bw - 20, fill: "#fff" });
    else {
      const parts = [[m[1] || "", 36 * K], [m[2], 54 * K], [m[3] || "", 26 * K]].filter(([t]) => t);
      const maxW = bw - 24;
      let sc = 1;
      const wAt = (k) => parts.reduce((a, [t, s2], i) => { ctx.font = F.m8(s2 * k); return a + ctx.measureText(t).width + (i ? 5 * K : 0); }, 0);
      while (wAt(sc) > maxW && sc > 0.4) sc -= 0.02;
      let cx = bx + (bw - wAt(sc)) / 2;
      ctx.save(); ctx.textAlign = "left";
      parts.forEach(([t, s2], i) => {
        ctx.font = F.m8(s2 * sc);
        ctx.fillStyle = i === 1 ? goldGradient(ctx, 0, base - 44 * K, 0, base) : "#fff";
        ctx.fillText(t, cx, base);
        cx += ctx.measureText(t).width + 5 * K;
      });
      ctx.restore();
    }
  }
  drawFit(ctx, up(f.m2_condo), bx + bw / 2, by + 116 * K, { font: F.m7, size: 19 * K, maxW: bw - 22, fill: "#e9bf5c" });

  // escudo + garantia
  const sx = X(327), sy = (Y(800) + Y(902)) / 2;
  iconFill(ctx, "shield", sx, sy, 54 * K, "#0d2250");
  ctx.save();
  ctx.strokeStyle = "#f0d37c"; ctx.lineWidth = 4 * K; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(sx - 9 * K, sy + 1 * K); ctx.lineTo(sx - 2 * K, sy + 8 * K); ctx.lineTo(sx + 11 * K, sy - 8 * K); ctx.stroke();
  ctx.restore();
  const text = up(f.m2_guarantee);
  const gw = X(168), ghh = Y(902) - Y(800) - 20;
  let size = 17 * K, lines = [];
  for (; size >= 11; size -= 0.5) {
    ctx.font = F.m8(size);
    lines = wrapLines(ctx, text, gw);
    if (lines.length <= 4 && lines.length * size * 1.2 <= ghh && lines.every((l) => ctx.measureText(l).width <= gw)) break;
  }
  ctx.save();
  ctx.font = F.m8(size); ctx.fillStyle = "#0d2250"; ctx.textAlign = "left";
  const lh = size * 1.2;
  const top = sy - ((lines.length - 1) * lh) / 2 + size * 0.34;
  lines.forEach((l, i) => ctx.fillText(l, X(361), top + i * lh));
  ctx.restore();
}

async function footer(ctx, mono) {
  const cy = Y(957);
  const wa = await getAsset("m2-whats.png");
  const wh = 68 * K;
  ctx.drawImage(wa, X(60) - ((wa.width / wa.height) * wh) / 2, cy - wh / 2, (wa.width / wa.height) * wh, wh);
  drawFit(ctx, "AGENDE SUA VISITA:", X(110), Y(948), { font: F.m6, size: 17.5 * K, maxW: X(260), fill: "#e9d28f", align: "left" });
  drawFit(ctx, BROKER.phone, X(108), Y(988), { font: F.m8, size: 42 * K, maxW: X(300), fill: () => goldGradient(ctx, 0, Y(958), 0, Y(990)), align: "left" });
  drawLogo(ctx, mono, X(498), Y(826), X(172));
}

export async function renderMode2({ fields, photos: rawPhotos = [] }) {
  setupFonts();
  const f = fields || {};
  const { canvas, ctx } = newCanvas(OUT_WIDTH, Math.round(H * S));
  ctx.scale(S, S);
  const mono = await getMonogram();
  const imgs = await Promise.all(rawPhotos.slice(0, 4).map(loadPhoto));

  drawBackground(ctx, W, H);
  photos(ctx, imgs);
  swoosh(ctx, CURVE, 5);
  header(ctx, f);
  await features(ctx, f);
  priceAndGuarantee(ctx, f);
  await footer(ctx, mono);
  return canvas.encode("jpeg", 95);
}
