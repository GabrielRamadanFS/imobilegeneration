#!/bin/sh
# Baixa os arquivos estáticos do site antigo (rode no seu computador, onde há acesso à internet).
# Uso: sh scripts/fetch-assets.sh
set -e
BASE="https://imobile-sm.netlify.app"
mkdir -p public/refs
for n in modo1 modo2 modo3; do
  echo "Baixando refs/$n.jpg"
  curl -fsSL "$BASE/refs/$n.jpg" -o "public/refs/$n.jpg"
done
echo "Baixando favicon.ico"
curl -fsSL "$BASE/favicon.ico" -o public/favicon.ico
echo "Pronto."
ls -l public/refs public/favicon.ico
