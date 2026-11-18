# imobilegeneration

Gerador de anúncios imobiliários (Imobile — Samia Mohamed). Recria o site `imobile-sm.netlify.app`:
o usuário cola a descrição do imóvel, envia fotos e recebe uma arte 9:16 + legendas.

- **Front-end:** `public/index.html` (página única, sem build).
- **Back-end:** funções do Netlify em `netlify/functions/` (rotas `/api/*`).
- **IA:** Gemini para texto e imagem, atrás de uma camada que permite trocar de motor.
- **Fotos reais:** o modelo de imagem NÃO redesenha as fotos do cliente. Ele pinta as áreas de foto em
  magenta e o servidor cola as fotos reais por cima (`lib/compose.js`).

## Estrutura

```
public/                    site estático (index.html, refs/modo1-3.jpg, favicon.ico)
netlify/functions/
  verify-pin.js            POST /api/verify-pin
  analyze.js               POST /api/analyze        (escolhe layout, campos, legendas)
  generate-art.js          POST /api/generate-art   (arte em streaming NDJSON)
  lib/
    config.js              corretora, modelos, limites, descrição dos modos
    fields.js              campos de texto de cada modo
    auth.js                PIN (comparação segura) + limites de tentativas/gerações
    gemini.js              cliente do Gemini com modelos de reserva
    compose.js             detecção das áreas magenta + colagem das fotos (sharp)
    providers/text.js      provedor de texto (TEXT_PROVIDER)
    providers/art.js       provedor de arte (ART_PROVIDER) + prompt da arte
test/functions.test.js     16 testes (Gemini simulado)
scripts/fetch-assets.sh    baixa refs/modo1-3.jpg e favicon do site antigo
```

## Como colocar no ar

1. **Arquivos estáticos que faltam** (rode no seu computador, com internet):
   `sh scripts/fetch-assets.sh` baixa `public/refs/modo1-3.jpg` e `public/favicon.ico` do site antigo.
   Sem os `modoN.jpg` a geração de arte não funciona (são os templates enviados ao modelo).
2. **Netlify:** Add new site > Import from Git > escolha este repositório.
   Publish directory `public`, functions `netlify/functions` (já estão no `netlify.toml`).
3. **Variáveis de ambiente** (Site configuration > Environment variables), conforme `.env.example`:
   obrigatórias `APP_PIN` e `GEMINI_API_KEY`. Nunca commite o `.env`.
4. Para testar local: `npm install`, copie `.env.example` para `.env`, `npm run dev` (precisa do Netlify CLI).
5. Testes: `npm test`.

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
- **Arte:** `ART_PROVIDER`. O Claude não gera imagens. Plano B sem modelo de imagem: provedor `local`, que monta
  a arte com o template + textos desenhados por código (SVG/sharp) + fotos reais. Mantém o mesmo contrato
  (`generateArt -> {buffer, model, keyed}`). Ainda não implementado: precisa das coordenadas de cada campo nos
  3 templates.

## Pontos de atenção (não verificados em produção)

- Os testes simulam o Gemini. A chamada real **ainda não foi testada**: confirme os nomes dos modelos no
  Google AI Studio (os padrões são `gemini-3.8-flash` e `gemini-3-pro-image`; o site antigo
  registrava `gemini-3-pro-image`).
- A colagem depende de o modelo obedecer "pintar as áreas de foto de magenta chapado". Se alguma arte sair sem
  áreas detectadas, o servidor avisa no status e mantém a arte do modelo. Nesse caso, ajuste o prompt em
  `lib/providers/art.js` ou use coordenadas fixas por modo.
- Quais modos usam quantas fotos (provavelmente 1, 1 e 6) é suposição: a lógica usa quantas áreas magenta
  encontrar e repete fotos se faltarem.
- A escolha automática de modo (venda com condições → 1, locação → 2, destaque com várias fotos → 3) foi
  deduzida dos exemplos do site antigo; ajuste em `lib/config.js` (`MODE_INFO`).
- Limites de PIN/gerações ficam em memória, por instância da função: reduzem abuso, mas não são globais.
  Se precisar de limite exato, use um armazenamento externo (ex.: Netlify Blobs).
- Tempo de execução: a geração leva ~15 s; a resposta em streaming mantém a conexão viva, mas confira o
  limite de tempo das funções no seu plano do Netlify.
- O PIN ainda trafega em cada chamada (como no site original). Uma melhoria futura é trocá-lo por um token
  de sessão.
