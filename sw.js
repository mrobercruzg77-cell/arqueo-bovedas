/* Service Worker — Arqueo Bóveda EPMPTP */
const CACHE_NAME = 'arqueo-boveda-v1';
const ARCHIVOS = [
  './arqueo-boveda.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* Instalación: pre-cachear todos los archivos */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

/* Activación: limpiar cachés viejos */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* Fetch: cache first, luego red, luego HTML principal */
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return resp;
        })
        .catch(() => caches.match('./arqueo-boveda.html'));
    })
  );
});
