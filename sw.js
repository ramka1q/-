/* Service worker — кеш для офлайн-гри на телефоні/ПК.
   Підвищуй версію CACHE, коли змінюєш файли гри. */
const CACHE = 'nikita-pozhyrach-v3';
const ASSETS = [
  'index.html',
  'nikita-game.html',
  'css/style.css',
  'js/utils.js',
  'js/art.js',
  'js/levels.js',
  'js/comics.js',
  'js/story.js',
  'js/game.js',
  'manifest.json',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-180.png',
  'assets/nikita.png',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) =>
    // не валимо встановлення, якщо якогось файлу немає (напр. nikita.png)
    Promise.allSettled(ASSETS.map((u) => c.add(u)))
  ));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => hit)
    )
  );
});
