import fs from "node:fs";
import sharp from "sharp";
const mode = Number(process.argv[2] || 2);
const mod = await import(`../netlify/functions/lib/render/mode${mode}.js`);
const ref = "public/refs/modo1.jpg";
const crops = [[28,310,715,215],[200,540,540,190],[110,750,600,160],[380,1070,370,210],[40,320,300,200],[420,560,300,170]];
const photos = [];
for (const [l,t,w,h] of crops) photos.push({ mimeType: "image/jpeg", data: (await sharp(ref).extract({left:l,top:t,width:w,height:h}).jpeg().toBuffer()).toString("base64") });
const FIELDS = {
 2: { m2_mod:"Locação anual |", m2_neighborhood:"Balneário Perequê –", m2_city:"Porto Belo/SC", m2_dist:"150 metros da praia",
  m2_f1:"1 suíte + 2 dormitórios", m2_f2:"Living integrado", m2_f3:"Sacada com churrasqueira a carvão fechada com sistema Reiki", m2_f4:"1 vaga de garagem", m2_f5:"Salão de festas",
  m2_badge:"Aluguel", m2_price:"R$ 4.500/mês", m2_condo:"(Condomínio incluso)", m2_guarantee:"Garantia: seguro fiança ou 2 cauções." },
 3: { m3_cat:"Apartamento", m3_highlight:"Mobiliado", m3_mod:"à Venda", m3_ribbon:"Conforto • Segurança • Praticidade", m3_price_lbl:"Por apenas", m3_price:"R$ 460 mil",
  m3_h1_t1:"Mobiliado", m3_h1_t2:"Pronto para morar", m3_h2_t1:"Segurança", m3_h2_t2:"e tranquilidade", m3_h3_t1:"Ótima localização", m3_h3_t2:"Tudo perto de você!",
  m3_plaque1:"Realize o sonho de morar bem!", m3_plaque2:"Invista no seu futuro!" },
};
const t = Date.now();
const buf = await mod[`renderMode${mode}`]({ fields: FIELDS[mode], photos });
fs.writeFileSync(`/tmp/out${mode}.jpg`, buf);
console.log("ms", Date.now()-t, buf.length);
