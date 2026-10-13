#!/usr/bin/env python3
"""Собирает всю игру в один файл nikita-game.html (CSS и JS внутри).
Этот файл можно скачать и открыть в браузере на компьютере или Android."""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'css/style.css').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '</style>')
# манифест и сервис-воркер в одиночном файле не нужны
html = re.sub(r'\s*<link rel="manifest"[^>]*>', '', html)
html = re.sub(r'\s*<link rel="(icon|apple-touch-icon)"[^>]*>', '', html)
def inline(m):
    src = (root / m.group(1)).read_text(encoding='utf-8')
    return '<script>\n' + src.replace('</script', '<\\/script') + '\n</script>'
html = html.replace('<script src="js/util.js"></script>', '<script>window.NIKITA_SINGLE = true;</script>\n  <script src="js/util.js"></script>')
html = re.sub(r'<script src="(js/[^"]+)"></script>', inline, html)
(root / 'nikita-game.html').write_text(html, encoding='utf-8')
print('nikita-game.html:', round(len(html.encode()) / 1024), 'KB')
