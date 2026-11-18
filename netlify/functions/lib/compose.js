// Cola as fotos REAIS nas áreas de foto da arte.
// O modelo de imagem pinta as áreas de foto com magenta chapado (#FF00FF); aqui detectamos
// essas áreas (qualquer formato, inclusive curvas), recortamos cada foto no formato exato da área
// e compomos por cima. Assim as fotos do cliente nunca são redesenhadas pela IA.

import sharp from "sharp";

const isKey = (r, g, b) => r > 170 && b > 170 && g < 125 && Math.abs(r - b) < 100 && r - g > 80 && b - g > 80;

// Encontra regiões magenta. Devolve regiões em coordenadas da imagem original, em ordem de leitura.
export async function findKeyRegions(buf, { detectWidth = 640, minAreaRatio = 0.004 } = {}) {
  const meta = await sharp(buf).metadata();
  const scale = Math.min(1, detectWidth / meta.width);
  const dw = Math.max(1, Math.round(meta.width * scale));
  const dh = Math.max(1, Math.round(meta.height * scale));

  const { data } = await sharp(buf).resize(dw, dh, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });

  const key = new Uint8Array(dw * dh);
  for (let i = 0; i < key.length; i++) key[i] = isKey(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) ? 1 : 0;

  const labels = new Int32Array(dw * dh);
  const regions = [];
  const stack = [];
  let nextLabel = 0;

  for (let start = 0; start < key.length; start++) {
    if (!key[start] || labels[start]) continue;
    nextLabel += 1;
    let minX = dw, minY = dh, maxX = 0, maxY = 0, area = 0;
    stack.push(start);
    labels[start] = nextLabel;
    while (stack.length) {
      const p = stack.pop();
      const x = p % dw;
      const y = (p / dw) | 0;
      area += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (x > 0 && key[p - 1] && !labels[p - 1]) { labels[p - 1] = nextLabel; stack.push(p - 1); }
      if (x < dw - 1 && key[p + 1] && !labels[p + 1]) { labels[p + 1] = nextLabel; stack.push(p + 1); }
      if (y > 0 && key[p - dw] && !labels[p - dw]) { labels[p - dw] = nextLabel; stack.push(p - dw); }
      if (y < dh - 1 && key[p + dw] && !labels[p + dw]) { labels[p + dw] = nextLabel; stack.push(p + dw); }
    }
    if (area >= minAreaRatio * dw * dh) regions.push({ id: nextLabel, minX, minY, maxX, maxY, area });
  }

  // Máscara de cada região (recorte do bbox) em baixa resolução
  const out = [];
  for (const r of regions) {
    const bw = r.maxX - r.minX + 1;
    const bh = r.maxY - r.minY + 1;
    const mask = Buffer.alloc(bw * bh);
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) {
        if (labels[(r.minY + y) * dw + (r.minX + x)] === r.id) mask[y * bw + x] = 255;
      }
    }
    out.push({
      x: Math.round(r.minX / scale),
      y: Math.round(r.minY / scale),
      w: Math.min(meta.width, Math.round(bw / scale)),
      h: Math.min(meta.height, Math.round(bh / scale)),
      mask,
      maskW: bw,
      maskH: bh,
    });
  }

  // Ordem de leitura: linhas (tolerância de 8% da altura), depois esquerda -> direita
  const rowTol = meta.height * 0.08;
  out.sort((a, b) => {
    const ra = Math.round(a.y / rowTol);
    const rb = Math.round(b.y / rowTol);
    return ra !== rb ? ra - rb : a.x - b.x;
  });
  return { regions: out, width: meta.width, height: meta.height };
}

async function maskToAlpha(region) {
  // fecha furos e expande ~2px para cobrir a franja rosada na borda, depois suaviza a borda
  const alpha = await sharp(region.mask, { raw: { width: region.maskW, height: region.maskH, channels: 1 } })
    .resize(region.w, region.h, { fit: "fill" })
    .blur(3.5)
    .threshold(40) // expande ~2-3px: cobre a franja rosada que a compressão JPEG deixa na borda
    .blur(1)
    .extractChannel(0) // garante 1 canal (o threshold pode devolver 3)
    .raw()
    .toBuffer();
  if (alpha.length !== region.w * region.h) {
    throw new Error(`Máscara inválida: ${alpha.length} bytes para ${region.w}x${region.h}.`);
  }
  return alpha;
}

// photos: Buffer[]  ->  { image: Buffer(JPEG), slots, used }
export async function composePhotos(baseBuf, photos, { quality = 90 } = {}) {
  const { regions, width, height } = await findKeyRegions(baseBuf);
  if (!regions.length || !photos.length) {
    const image = await sharp(baseBuf).jpeg({ quality }).toBuffer();
    return { image, slots: regions.length, used: 0, width, height };
  }

  const layers = [];
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    const photo = photos[i % photos.length];
    const alpha = await maskToAlpha(region);
    const rgb = await sharp(photo)
      .rotate()
      .resize(region.w, region.h, { fit: "cover", position: "attention" })
      .removeAlpha()
      .raw()
      .toBuffer();
    const rgba = Buffer.alloc(region.w * region.h * 4);
    for (let p = 0; p < region.w * region.h; p++) {
      rgba[p * 4] = rgb[p * 3];
      rgba[p * 4 + 1] = rgb[p * 3 + 1];
      rgba[p * 4 + 2] = rgb[p * 3 + 2];
      rgba[p * 4 + 3] = alpha[p];
    }
    const input = await sharp(rgba, { raw: { width: region.w, height: region.h, channels: 4 } }).png().toBuffer();
    layers.push({ input, left: region.x, top: region.y });
  }

  const image = await sharp(baseBuf).composite(layers).jpeg({ quality }).toBuffer();
  return { image, slots: regions.length, used: Math.min(photos.length, regions.length), width, height };
}

export async function toStoryJpeg(buf, { width = 1080, quality = 88 } = {}) {
  return sharp(buf).resize({ width, withoutEnlargement: true }).jpeg({ quality }).toBuffer();
}
