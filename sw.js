// Discendo Service Worker
// Zweck: (1) macht die Seite als PWA installierbar (Chrome verlangt einen
// registrierten Service Worker mit fetch-Handler dafür), (2) sorgt dafür,
// dass die Seite selbst bei kurzzeitig fehlender Verbindung noch lädt.

const CACHE_NAME = 'discendo-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: versucht immer zuerst das aktuelle Netzwerk, damit Nutzer
// nie eine veraltete Version sehen — greift nur auf den Cache zurück, wenn
// wirklich keine Verbindung da ist.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
