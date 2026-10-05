#!/usr/bin/env bash
# Збирає hata-server.exe (Windows) з актуальною грою всередині.
# Запускать з папки server/:  ./build.sh
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p web
cp ../index.html ../peerjs.min.js web/
GOOS=windows GOARCH=amd64 go build -trimpath -ldflags "-s -w" -o ../hata-server.exe .
echo "Готово: ../hata-server.exe"
