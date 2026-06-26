// WeldGauge — service worker
// Versionér cachen ved hver ny udgivelse, så klienter henter nyt.
const CACHE = 'weldgauge-v2.6.1';
const CORE = ['./', './index.html', './manifest.json', './favicon.ico', './icon-192.png', './icon-512.png', './icon-180.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // lad eksterne (fx kamera) gå udenom
  // navigation → network-first, fallback cache (så ny version hentes når online)
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  // øvrige same-origin → cache-first, ellers netværk
  e.respondWith(caches.match(req).then(c => c || fetch(req).then(r => {
    const cp = r.clone(); caches.open(CACHE).then(ch => ch.put(req, cp)); return r;
  })));
});
