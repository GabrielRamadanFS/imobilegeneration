// Renderizador SVG -> resvg: monta a arte como SVG (ouro com relevo/brilho por filtros) e rasteriza em JPEG.
import { renderJpeg } from "./lib.js";
import { buildMode1 } from "./m1.js";
import { buildMode2 } from "./m2.js";
import { buildMode3 } from "./m3.js";

const OUT_WIDTH = () => Number(process.env.ART_WIDTH) || 1080;
const toBuf = (p) => (Buffer.isBuffer(p) ? p : Buffer.from(p.data, "base64"));
const BUILD = { 1: buildMode1, 2: buildMode2, 3: buildMode3 };

export async function renderSvgMode(mode, { fields, photos = [] }) {
  const build = BUILD[mode];
  if (!build) throw new Error(`Modo ${mode} sem layout.`);
  const bufs = photos.map(toBuf);
  const w = OUT_WIDTH();
  // sem fotos: o layout usa o quadro vazio (photos[i % 0] seria NaN)
  const svg = await build(fields || {}, bufs, w);
  return renderJpeg(svg, w, 95);
}
