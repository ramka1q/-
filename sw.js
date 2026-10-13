// Офлайн-кэш: после первого запуска игра работает без интернета
const CACHE = 'nikita-v3';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/style.css',
  './js/util.js', './js/audio.js', './js/sprites.js', './js/sprites2.js', './js/chars.js', './js/bg.js',
  './js/behaviors.js', './js/engine.js', './js/bosses.js', './js/hud.js', './js/levels1.js', './js/levels2.js',
  './js/comics.js', './js/ui.js', './js/main.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png', './icons/favicon.png',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // свои файлы: сначала сеть (чтобы получать обновления), без сети — из кэша
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  // шрифты Google: из кэша, а в фоне обновляем
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(caches.open(CACHE).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(res => { c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
