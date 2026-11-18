# imobilegeneration

Gerador de anúncios imobiliários (Imobile — Samia Mohamed). A usuária cola a descrição do imóvel, envia fotos e
recebe uma arte 9:16 + legendas. Nada é gravado: se a aba for fechada, a arte some (sem histórico, por escolha).

**Em produção:** https://imobile-sm.onrender.com (Render, plano grátis, deploy do branch `main`).

## Como funciona hoje

- **Front-end:** `public/index.html` (página única, sem build). Modo "Automático" escolhe o layout pelo tipo de anúncio.
- **Servidor:** `server.js` (Node) serve `public/` e as rotas `/api/*`, reaproveitando as funções em
  `netlify/functions/` (mesmo código roda no Netlify ou em qualquer Node). Gera uma arte por vez (memória).
- **Arte (sem IA de imagem, sem custo):** `netlify/functions/lib/render-svg/` monta cada modo como SVG
  (ouro com relevo/brilho por filtros, fotos recortadas em polígonos, texto vetorizado com opentype.js) e rasteriza
  com `@resvg/resvg-js` + `sharp` → JPEG. Largura padrão 1080 px (`ART_WIDTH`). Fontes TTF em `assets/fonts-ttf`,
  ícones SVG (Lucide/Tabler) em `assets/icons` (ver `assets/icons/README.md`).
  `ART_RENDERER=canvas` volta ao desenho antigo por `@napi-rs/canvas` (`lib/render/`), mantido como reserva.
- **Texto (Gemini, gratuito):** só interpreta a descrição (campos), escolhe o modo e escreve as legendas.
  Sem `GEMINI_API_KEY` o Automático e as legendas deixam de funcionar; escolhendo o modo à mão e preenchendo os
  campos a arte sai sem Gemini.

## Variáveis de ambiente

`APP_PIN` e `GEMINI_API_KEY` (obrigatórias; configuradas no Render, nunca no repositório). Opcionais: `ART_WIDTH`
(padrão 1080), `ART_RENDERER` (`svg`|`canvas`), `ART_PROVIDER` (`local`|`gemini`), `TEXT_PROVIDER`.

## Rodar e publicar

- Local: `npm install`, `APP_PIN=... GEMINI_API_KEY=... npm start` → http://localhost:8888. Testes: `npm test`.
- Render: o `render.yaml` define o serviço (Node, plano grátis). **O Render não atualiza sozinho depois do push:**
  em Manual Deploy > Deploy latest commit. O plano grátis dorme após ~15 min parado (1º acesso demora ~50 s) e
  cada arte leva ~20–25 s lá (≈3 s num PC comum).
- Netlify (alternativa): `netlify.toml` continua válido, mas o plano grátis pausa deploys quando os créditos acabam.

## Estrutura

```
public/                    site estático (index.html, refs/modo1-3.jpg)
refs-hd/                   modelos originais em alta resolução (referência de fidelidade)
server.js, render.yaml     servidor Node e blueprint do Render
netlify/functions/         verify-pin, analyze, generate-art + lib/ (config, fields, auth, gemini, providers,
                           render-svg = motor atual, render = motor canvas de reserva)
assets/                    fonts-ttf, fonts (woff), icons (svg), monogram/logo/corner (png)
scripts/                   preview-modes.mjs (gera /tmp/outN.jpg), overlay.mjs (modelo x render), sample-fields-*.json
experiments/               comparativo de motores (Satori, Chromium, SVG) - só histórico; o SVG foi o escolhido
test/                      testes (Gemini simulado)
```

## Pendências / ideias

- Refinar fidelidade dos Modos 2 e 3 contra `refs-hd` ("à Venda" encosta em "MOBILIADO" no Modo 3; textos laterais
  um pouco pequenos; Modo 2 sem o painel azul curvo do rodapé e foto principal mais larga que o modelo).
- Velocidade no Render grátis: reduzir `ART_WIDTH` (ex.: 900) ou aliviar blurs/filtros SVG.
- Modo sem Gemini (interpretação por regras e legendas fixas), se a cota/instabilidade incomodar.
- PNGs antigos (`assets/icon-*`, `m2-*`, `m3-*`) não são mais usados e podem ser apagados.
- Higiene: trocar o PIN/chave se vazarem; o PIN ainda trafega em cada chamada (melhoria: token de sessão).

## Contrato das APIs (compatível com o front-end original)

| Rota | Entrada | Saída |
|---|---|---|
| `POST /api/verify-pin` | `{ pin }` | `200 {valid:true}` · `401 {valid:false,error:"Código PIN incorreto."}` · `429` |
| `POST /api/analyze` | `{ pin, rawText, photoCount, preferredMode }` | `{ ok, model, chosenMode, reason, captionComplete, captionShort, fields }` |
| `POST /api/generate-art` | `{ pin, mode, fields, rawText, photos:[{mimeType,data}] }` | NDJSON: `{type:"status",message}` … `{type:"done",modelUsed,imageDataUrl}` ou `{type:"error",error}` |

## Trocar de motor de IA (Gemini pode mudar ou sair)

- **Modelos:** `GEMINI_TEXT_MODEL` / `GEMINI_IMAGE_MODEL` e as listas `GEMINI_*_FALLBACKS`. Se um modelo for
  descontinuado (404, 429, 5xx ou "not found"), o próximo da lista é usado sem intervenção.
- **Texto (legendas/campos):** `TEXT_PROVIDER`. Para usar o Claude, crie um provedor com a mesma assinatura
  (`generateStructured({prompt, schema}) -> {json, model}`) em `lib/providers/text.js` e registre em `PROVIDERS_TEXT`.
- **Arte:** `ART_PROVIDER` (padrão `local`). O provedor `local` desenha a arte por código (@napi-rs/canvas), sem IA
  de imagem e sem custo: refaz os 3 layouts (`lib/render/mode1|2|3.js`), cola as fotos reais, escreve os textos
  exatos e usa o logo em `assets/logo.png`. Fontes em `assets/fonts` (Anton, Montserrat, Great Vibes, Playfair
  Display; todas licença OFL). `ART_PROVIDER=gemini` mantém o caminho antigo, que exige faturamento ativo no Google.
  Mesmo contrato nos dois: `generateArt -> {buffer, model, keyed}`.
- Os templates em `public/refs` ficam commitados; o script `scripts/fetch-assets.sh` só baixa o que faltar.

