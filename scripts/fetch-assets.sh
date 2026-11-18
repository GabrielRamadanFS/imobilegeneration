#!/bin/sh
# Baixa os arquivos estáticos do site antigo, só os que ainda não existem (rode no seu computador).
# Uso: sh scripts/fetch-assets.sh
# Não falha se o site antigo estiver fora do ar: os templates já ficam commitados em public/refs.
BASE="https://imobile-sm.netlify.app"
mkdir -p public/refs
for n in modo1 modo2 modo3; do
  [ -s "public/refs/$n.jpg" ] || curl -fsSL "$BASE/refs/$n.jpg" -o "public/refs/$n.jpg" || echo "aviso: refs/$n.jpg indisponivel"
done
[ -s public/favicon.ico ] || curl -fsSL "$BASE/favicon.ico" -o public/favicon.ico || echo "aviso: favicon indisponivel"
exit 0
