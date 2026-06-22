/* ═══════════════════════════════════════════════════════════════
   CAPM® Practice Exam Simulator  ·  Service Worker
   ───────────────────────────────────────────────────────────────
   Caches the complete app shell on first install so the simulator
   works fully offline after one initial page load.

   Bump CACHE_VERSION whenever the file list or content changes
   so returning users get fresh assets on next visit.
═══════════════════════════════════════════════════════════════ */

const CACHE_VERSION = 'v2';
const CACHE_NAME    = `capm-sim-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './css/style.css',
  './js/questions.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-16.png',
  './icons/favicon-32.png',
  './favicon.ico',
];

/* ── Install: pre-cache the app shell ──────────────────────── */
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

/* ── Activate: delete stale caches from previous versions ──── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: cache-first strategy for GET requests ─────────── */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request)
        .then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached || caches.match('./index.html'));

      // Return cached copy immediately if available; otherwise wait for network.
      return cached || networkFetch;
    })
  );
});
