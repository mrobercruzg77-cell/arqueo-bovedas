/* Service Worker — Arqueo Bóveda EPMPTP */
/* Versión: network-first para garantizar siempre la versión más reciente */
const CACHE_NAME = 'arqueo-boveda-v9';
const ARCHIVOS = [
  './arqueo-boveda.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* Instalación: borrar cachés viejos y pre-cachear */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => caches.open(CACHE_NAME))
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

/* Activación: limpiar todo lo viejo */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* Fetch: RED PRIMERO para el HTML principal, caché para el resto */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isHTML = url.pathname.endsWith('.html') || url.pathname.endsWith('/');

  if (isHTML) {
    /* HTML: siempre pedir a la red, c