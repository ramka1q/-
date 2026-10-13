#!/usr/bin/env bash
# Собирает dist/NikitaEatsAll.exe (Windows 10/11, x64). Нужен Go 1.24+ и go-winres:
#   go install github.com/tc-hib/go-winres@latest
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"

# копия игры, которая встраивается в exe
rm -rf "$here/www"
mkdir -p "$here/www/css" "$here/www/js" "$here/www/icons" "$here/www/assets"
cp "$root/index.html" "$here/www/"
cp "$root/css/style.css" "$here/www/css/"
cp "$root"/js/*.js "$here/www/js/"
cp "$root/icons/favicon.png" "$here/www/icons/"
cp "$root"/assets/nikita.* "$here/www/assets/" 2>/dev/null || true

cd "$here"
"${GO_WINRES:-$(go env GOPATH)/bin/go-winres}" make --in winres/winres.json --arch amd64
mkdir -p "$root/dist"
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -trimpath -ldflags "-H windowsgui -s -w" -o "$root/dist/NikitaEatsAll.exe" .
echo "dist/NikitaEatsAll.exe: $(du -k "$root/dist/NikitaEatsAll.exe" | cut -f1) KB"
