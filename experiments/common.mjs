// Dados de teste compartilhados pelos experimentos de renderização.
import fs from "node:fs";
import sharp from "sharp";
export const ROOT = new URL("../", import.meta.url).pathname;
export const fields = (mode) => JSON.parse(fs.readFileSync(`${ROOT}scripts/sample-fields-${mode}.json`, "utf8"));
// 6 fotos de teste (recortes das fotos dos modelos), como Buffers JPEG
export async function testPhotos() {
  const ref = `${ROOT}public/refs/modo1.jpg`;
  const crops = [[28,310,715,215],[200,540,540,190],[110,750,600,160],[380,1070,370,210],[40,320,300,200],[420,560,300,170]];
  return Promise.all(crops.map(([left, top, width, height]) => sharp(ref).extract({ left, top, width, height }).jpeg({ quality: 92 }).toBuffer()));
}
