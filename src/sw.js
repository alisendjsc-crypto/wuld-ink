/* wuld.ink service worker — K276 (Track B PWA). NO PIN. Progressive, mobile-registered.
 *
 * Freshness law (hazards 5-7):
 *   - navigations  -> NETWORK-FIRST -> cache -> offline.html   (never stale HTML online)
 *   - ?v= assets   -> CACHE-FIRST (immutable by version)       (a redeploy bumps ?v -> new URL)
 *   - *.json data  -> NETWORK-ONLY, never cached                (corpus/search-index/releases
 *                                                                mutate at a stable URL; K262)
 *   - /api/,/admin -> NETWORK-ONLY                              (comment board, gap-log, admin)
 *   - cross-origin -> PASSTHROUGH, SW-transparent               (R2 audio, youtube, library,
 *                                                                admin subdomains)
 * The cache is version-named; `activate` deletes every non-current cache, so a redeploy is
 * never masked by a stale precache. Bump CACHE on every SW change.
 */
'use strict';

var CACHE = 'wuld-sw-K287b';

/* App-shell precache. Only assets that always exist and are needed to paint the chrome +
 * the offline page. No fonts (the site's @font-face chain is local()-first; no woff2 ships).
 * The other ?v CSS/JS are cached opportunistically (cache-first) as the visitor browses. */
var SHELL = [
  '/offline.html',
  '/tokens.css',
  '/base.css',
  '/components/mobile-a11y.css?v=K287b',
  '/components/nav.css?v=K274',
  '/components/footer.css?v=K274',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // Precache defensively: one missing asset must not fail the whole install.
      return Promise.all(SHELL.map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches.delete(k);   // evict every non-current cache
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;                          // mutations pass straight through
  var url = new URL(req.url);

  if (url.origin !== self.location.origin) return;           // cross-origin: SW-transparent
  var p = url.pathname;

  // dynamic / private lanes — NETWORK-ONLY (never cached, never served stale)
  if (p.indexOf('/api/') === 0 || p.indexOf('/admin') === 0) {
    e.respondWith(fetch(req));
    return;
  }

  // all data JSON — NETWORK-ONLY, never cache-first (corpus has no ?v; search-index's ?v is
  // stable while its bytes mutate — either way a cache-first copy could mask a live update)
  if (/\.json$/.test(p)) {
    e.respondWith(fetch(req));
    return;
  }

  // navigations — NETWORK-FIRST -> cache -> offline.html
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('/offline.html');
        });
      })
    );
    return;
  }

  // versioned assets (?v=…) — CACHE-FIRST (immutable by version), populate on miss
  if (url.search.indexOf('v=') !== -1) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) {
          if (res && res.ok && res.type === 'basic') {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        });
      })
    );
    return;
  }

  // precached shell (tokens/base/offline/icons/manifest — no ?v) — CACHE-FIRST, network fallback
  e.respondWith(
    caches.match(req).then(function (hit) { return hit || fetch(req); })
  );
});
