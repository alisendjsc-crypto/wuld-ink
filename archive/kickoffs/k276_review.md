# K276 — Track B PWA — REVIEW

**Recommendation: ship on your go.** All 8 gates green; desktop proven byte-inert 68/68;
NO PIN; efilist/corpus/console/flagship byte-untouched. Non-shipping until you say so.

## What it does
The site becomes an **installable mobile web app**. On a phone: the browser offers
Add-to-Home-Screen, it launches **standalone** (no browser chrome), repeat visits paint
instantly from a cached shell, and going offline shows a **WULD offline card** instead of the
dinosaur. **Desktop is unchanged** — zero service worker, zero cache, byte-identical render.

## The six new files (all additions are head-only → desktop-inert)
- `manifest.webmanifest` — app identity (WULD, standalone, #0a0a0a, 3 icons).
- `icons/` — serif **W** on near-black + crimson accent: 192 + 512 (any) + 512 (maskable,
  glyph inside the 80% safe circle). DejaVu Serif (see note below).
- `sw.js` — the service worker. Freshness law: pages are **network-first** (never a stale page
  online), versioned `?v` assets are cache-first (immutable), **all `.json` data + `/api` +
  `/admin` are network-only** (never a stale corpus/search-index/comment), cross-origin passes
  straight through (R2 audio, YouTube, library). Cache is version-named and wiped on every
  redeploy of the worker.
- `sw-register.js` — registers the worker **mobile-only** and adds the install button. On
  desktop it does **nothing at all**.
- `offline.html` — the dark, self-contained offline card.

74 pages get 3 head links (manifest / theme-color / apple-touch-icon); 73 (all but the
homepage) also get the tiny register script. **Head-only, so nothing on any page renders
differently** — proven two ways (a static byte-diff + a 68/68 layout fingerprint).

## Three calls I made (flagging, not hiding)
1. **Desktop is intentionally NOT installable.** The mandate says "register mobile-only," and
   installability needs a service worker — so registering only on mobile means desktop stays a
   plain, cache-free website (which is exactly what keeps it byte-inert). If you want desktop
   installable too, that's a deliberate follow-up (it would put a cache on desktop).
2. **All `.json` is network-only, not just the corpus.** The kickoff said "bare
   `/components/*.json`," but the search index is fetched at a *stable* `?v=K98` while its bytes
   change — a `?v` cache-first rule would serve it stale. So every same-origin `.json` is
   network-only. Trade-off: the kaomoji picker + site search don't work offline (they need
   their data) — acceptable for the shell-only offline scope; nothing serves stale.
3. **No fonts are precached** — `src/fonts/` ships only a README (the faces load via `local()`),
   so there's nothing to cache. The offline card uses system fonts. The app icon uses DejaVu
   Serif; a Cormorant glyph would need a woff2→ttf convert — a nice-to-have, not shipped.

## Gates (all green)
1. Desktop FP pristine-vs-swept **68/68 ZERO delta** @1280 & 900 (+ static byte-proof).
2. manifest parses + validates.
3. `node --check` sw.js + sw-register.js.
4. install smoke: SW registers/active/controls scope `/`; manifest linked; icons 192+512+maskable.
5. offline serves offline.html; a stale cache is evicted on activate (a redeploy is never masked).
6. `/api/*` and bare `*.json` are NOT cached.
7. search-index `677a9678` byte-identical; sitemap 63 routes unchanged.
8. U+FFFD 0; index.html got 0 scripts (homepage stays register-free).
PWA smoke: 16/16.

## Deferred
Desktop install · precaching top reading pages for richer offline · an update toast · a
Cormorant app-icon glyph · void-engine full mobile reflow (K275 carry).
