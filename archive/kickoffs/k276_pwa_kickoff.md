K276 kickoff — PWA / installable "app-like" mobile experience (Track B; DESKTOP-INERT, NO PIN)

Paste into a fresh wuld.ink Cowork session. Track A (mobile overhaul) landed as K275; this is its
DEFERRED Track B, split at the K275 §6 budget checkpoint so the service worker gets its own clean
gate pass. Site-only, NO PIN, efilist READ-ONLY, corpus/flagship byte-untouched. The K274/K275
load-bearing invariant carries verbatim: the desktop render does not change — proven by layout
FINGERPRINT, not eyeballed.

§0 — State-in / verify-at-open (fresh public-origin clone; mounts never trusted for repo state)
- Clone https://github.com/alisendjsc-crypto/wuld-ink.git fresh. HEAD must == origin/main == the
  K275 landing (git log -1: message begins "K275 mobile overhaul phase 2"). If a K27x console(odd)/
  corpus(even) lane landed on top, HEAD moved — re-derive every base blob live and read by content
  (lanes file-disjoint; the HEAD guard serializes).
- Confirm K275 LIVE (don't redo): served /components/mobile-a11y.css?v=K275 contains "K275 — Phase
  2"; served /gallery/ contains mobile-a11y.css?v=K275 + viewport-fit=cover.
- RE-DERIVE base blobs at the K275 tip (git rev-parse HEAD:path) for every page the head-sweep
  touches (the 71 mobile-a11y pages + index.html) and for the shell-precache assets
  (mobile-a11y.css, nav.css, footer.css, tokens.css, base.css). Do NOT reuse K274/K275 numbers.
- Harness: reuse _k275_gates.zip (pass3-ship FP, pass4b-measure, pass5-axe, lib.js) from repo root;
  in the cloud, sed its ROOT paths to your clone and launch chromium with
  executablePath=/opt/pw-browsers/chromium-*/chrome-linux/chrome (the image ships an older browser
  build than npm playwright wants — do NOT run `playwright install`). npm i playwright axe-core.
  Snapshot /pristine from src BEFORE the head-sweep. NOTE: Bash runs as root (/root/...); the Write
  tool targets /home/claude — keep files in one tree.

§1 — Mandate: a phone can Add-to-Home-Screen, it launches standalone, loads fast on repeat visits,
shows an offline fallback instead of the dinosaur. Everything PROGRESSIVE: JS off / SW unsupported
=> the site behaves exactly as today. Offline scope (K275 fork = shell precache + offline page +
cache-first ?v assets; NOT aggressive reading-page caching). Register MOBILE-ONLY.

§2 — Build (all new files; head additions are non-rendering => desktop-inert):
 B1 src/manifest.webmanifest: name "WULD — wuld.ink", short_name "WULD", start_url "/", scope "/",
    display standalone, background+theme #0a0a0a, icons 192/512 "any" + 512 maskable.
 B2 src/icons/ (new PNGs): palette #0a0a0a bg / #c41e3a accent / #f0ebe5 fg, a WULD serif glyph;
    192 + 512 any + 512 maskable (glyph inside inner 80% safe circle). Pillow or SVG->PNG.
 B3 src/sw.js (scope /): versioned cache wuld-sw-K276; on activate delete non-current caches
    (deploy-freshness — bump the version every SW change). install: precache app shell (offline.html,
    tokens.css, base.css, nav.css?v=<current>, footer.css?v=<current>, mobile-a11y.css?v=K275,
    fonts, icons, manifest). fetch routing: HTML nav = network-first -> cache -> offline.html (NEVER
    stale HTML online); ?v= assets = cache-first (immutable by version); /api/*, /admin*, comment
    board, gap-log = NETWORK-ONLY; bare /components/*.json (no ?v — the K262 corpus) = network-
    first/only, NEVER cache-first; cross-origin (audio.wuld.ink R2, youtube-nocookie, library.
    wuld.ink, admin.wuld.ink) = passthrough, no cache. Vanilla, zero deps. Don't precache gated
    /successor|/console into the shell.
 B4 src/components/sw-register.js (?v=K276, tiny): homepage zero-JS (D1) forbids a script on
    index.html — register from a <head> DEFER script on NON-home pages; SW-controls-origin covers
    the homepage after first navigation. Mobile-only guard:
    if (matchMedia('(pointer:coarse)').matches && 'serviceWorker' in navigator) navigator.
    serviceWorker.register('/sw.js').
 B5 install affordance: capture beforeinstallprompt, stash it, reveal a custom [Install app] button
    shipped [hidden], un-hidden only @media(max-width:640px) (K274 nav-toggle pattern), FP-excluded
    (add .pwa-install to pass3's exclude list). Desktop uses browser-native install. iOS: optional
    one-line "Add via Share" hint, mobile-only. Footer slot — NOT a nagging banner.
 B6 src/offline.html (sealed-simple): site chrome + "You're offline — cached pages are available;
    reconnect for the rest." Dark, zero external deps.

§3 — Head-only sweep (extend the K275 sweep.py pattern; idempotent + exact-count-gated): add to
every page <head> <link rel=manifest href=/manifest.webmanifest> + <meta name=theme-color
content=#0a0a0a> + <link rel=apple-touch-icon href=/icons/icon-192.png>; add the sw-register
<head>-defer <script> to every NON-home page (EXCLUDE src/index.html — D1). EXPECT exact counts;
abort on mismatch; re-run must no-op.

§4 — Gates (all green before ship): (1) Desktop FP pass3 pristine-vs-swept N/N ZERO delta @1280&900
with .pwa-install in the exclude list (head links are body-blind — prove it). (2) manifest parses +
validates. (3) node --check sw.js + sw-register.js. (4) install-criteria smoke (headless mobile:
manifest linked + SW registers + beforeinstallprompt fires). (5) offline: SW serves offline.html on
cut network + network-firsts HTML (bump-version-evicts test — prove a redeploy isn't masked by a
stale cache). (6) SW does NOT cache /api/* or a bare /components/*.json. (7) search-index/sitemap
neutral (manifest/sw/icons aren't pages — prove byte-identical). (8) U+FFFD 0; index.html got NO
script (D1).

§5 — Ship (NO PIN; ONE wuld PS block): .git\*.lock cleanup; HEAD==origin==<K275 tip> guard; base-
blob guards (git rev-parse HEAD:path); Move-Item the new files (manifest, sw.js, sw-register.js,
offline.html, icons/*) from _k276\; result-blob gates (git hash-object); python head-sweep self-
gate (aborts on count mismatch); CLAUDE.md stratum python-append (never Edit — large file);
git status review; explicit-stage named files/dirs (NEVER git add -u/.); measured staged-count
gate; commit; git config http.postBuffer 524288000; push + $LASTEXITCODE gate; curl.exe live
asserts (content-grep HTML for the manifest link; md5 manifest.webmanifest + sw.js — static, serve
clean; -o NUL/temp never $null). Helper NOT named H (Md5/FH). One-line if/else. Self-resolve the
K-number atop the fresh tip; renumber if HEAD moved.

§6 — PWA hazards (bake in): (5) SW freshness — network-first HTML + version-named cache evicted on
activate; a cache-first-HTML SW serves stale pages forever after a deploy. (6) bare-URL corpus
/components/*.json (K262) network-first/only, never cache-first. (7) api/admin/comment/gap-log
network-only. (8) homepage zero-JS (D1) — no register script on index.html; register from non-home
head-defer. (9) SW registered mobile-only keeps desktop cache-free (no stale desktop cache). (10)
CF-beacon injects a script into served HTML -> content-grep HTML in curl asserts, md5 only static
(css/js/json/manifest). (11) CRLF benign (operator CRLF, git normalizes LF; result-blob guards
pass). (12) icons are small binaries — pre-flag, trivial. Carry the K275 stratum + the CLAUDE.md
ledger's standing hazards.

§7 — Deliverables: sidecars -> _k276\ (manifest, sw.js, sw-register.js, offline.html, icons/*,
sweep-head.py, k276_stratum.md, REVIEW.md); ONE wuld ship block; gates green. Non-shipping until
Josiah's go unless he says ship-on-green. F6: install on a phone -> launches standalone, works
offline; desktop byte-inert.

— end K276 kickoff —
