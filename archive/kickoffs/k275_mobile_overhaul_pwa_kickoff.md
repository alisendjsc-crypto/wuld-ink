# K275 kickoff — MOBILE OVERHAUL Phase 2/3 + PWA "app-like" install track (DESKTOP-INERT, NO PIN)

*Paste this into a fresh **wuld.ink Cowork** session. It is the marching order. Recommended default path is stated §1; the session opens with AskUserQuestion on the §1b forks, then builds.*

**Identity.** The K274 successor. Two tracks, one intent: make wuld.ink genuinely good on a phone. **Track A** — an aggressive mobile UI/a11y overhaul of every interactive surface K274 deferred, plus reading polish, fluid type, safe-area insets, and **the ambient bar disabled on mobile** (Josiah's explicit call). **Track B** — a PWA / installable "app-like" experience (manifest + service worker + icons + install affordance) so a phone can add wuld.ink to its home screen and it loads fast and works offline. The load-bearing invariant from K274 carries verbatim: **the desktop render does not change — proven by layout fingerprint, not eyeballed.** NO PIN, site-only, efilist READ-ONLY, corpus/flagship byte-untouched.

---

## §0 — State-in / verify-at-open (do this FIRST, from a fresh public-origin clone; mounts never trusted for repo state)

- **wuld HEAD == `df8975b3028dc35079cd78529bafeab8cad7e95a`** (the K274 landing) == origin/main. If a K27x console/corpus/site-feature lane landed since, HEAD moved — re-derive every base blob live and read the interleave by content (the lanes are file-disjoint; see §7).
- **K274 is LIVE** — confirm, don't redo: served `https://wuld.ink/components/mobile-a11y.css?v=K274` md5 `b03c13d2` (contains "touch accessibility"); any page includes `mobile-a11y.css?v=K274` + `nav-toggle-cb` (content-grep, CF-beacon); `nav.css?v=K274` contains "Variant B". If those are green, K274 landed clean.
- **Base blobs (git rev-parse HEAD:path):** `src/components/mobile-a11y.css` `cd31104d` (`?v=K274`) · `src/components/nav.css` `23a577f1` (`?v=K274`, +Variant B) · `src/components/footer.css` `45ab8d23` (`?v=K274`) · `src/components/ambient-player.css` + `.js` (recompute at open — Track A edits these) · `src/components/wrong-hour.{css,js}` · `src/components/mode-toggle.css` · `src/components/gallery-room.{css,js}` · `src/components/site-search.css` · `src/void-engine/index.html` · `src/notes/index.html` (note: K271 kaomoji is live here) · `base.css` / `tokens.css` **BYTE-FROZEN** (they carry no `?v`; every mobile layer self-versions — do not touch them).
- **HELD all session:** flagship `library.wuld.ink/combined` `e654eabd`/2963752 (pin v4.0.0; efilist READ-ONLY) · search-index / sitemap (harvest-neutral — nothing this session adds a heading; PROVE it, don't assume) · the successor / console / yurei / omega stacks **byte-frozen except where Track A touches a component's mobile CSS**. wgate 24/24 baseline.
- **Reuse the K274 gate harness** (delivered alongside this kickoff as `mobile-gates.zip` — unzip anywhere; the next session rebuilds its own gates regardless, this is a head-start + the method-of-record): `pass2a-layout.js` (single-tree inject-sim), `pass3-ship.js` (pristine-vs-swept, the SHIP gate), `pass2b-mobile.js` + `pass4-mobile-swept.js` (mobile measure), `pass5-axe.js` (axe-core AA), `lib.js`, `sweep.py`, `README.md`. Playwright is at `/opt/pw-browsers`; run with `NODE_PATH=/home/claude/.npm-global/lib/node_modules`. Take a **fresh `/root/pristine`** snapshot of src BEFORE sweeping so the ship gate has a clean baseline.

---

## §1 — The mandate + RECOMMENDED DEFAULT PATH

Josiah: *"Do as many things as you possibly can to overhaul the UI and ease and accessibility for mobile … the ambient bar … should just be disabled, unless we create a separate 'app' like download experience for mobile — which I am not against — and probably is a good idea for optimization."*

**Recommended default path (build this unless a §1b answer redirects):**
1. **Track A ships first, as the primary NO-PIN commit** — the full component overhaul + ambient-disable + fluid type + safe-area. It is CSS-dominant, desktop-inert by construction, and reuses the proven K274 sweep + gate.
2. **Track B (PWA) ships second, same session IF budget holds past a hard checkpoint (§6); else it becomes K276** with its own kickoff (this file's §3 is that kickoff-in-waiting). Track B is new files (manifest, sw.js, icons, register script) + a head-only sweep — it does not depend on Track A and splits cleanly.
3. **Desktop stays byte-inert** across BOTH tracks. Track A: every rule mobile-scoped. Track B: manifest link is a non-rendering `<head>` element; the SW registers **mobile-only** (coarse pointer) so desktop behaviour is untouched, not just its layout.

Rationale for the split: Track A is where the felt improvement is and it's the lower-risk lane; Track B is high-value but introduces a service worker (a genuine new failure surface — stale caches, scope, the homepage-zero-JS tension) that deserves its own gate pass. One session can do both if the void-engine scope stays bounded (§1b-2). Don't martyr Track A's quality to cram Track B under a ceiling — the checkpoint is real.

---

## §1b — Forks (AskUserQuestion at open; LEAD with these recommendations, hard-block only where scope materially changes)

1. **Session scope / sequencing** — (a) **Track A + Track B both this session, budget-checkpointed [RECOMMENDED]** / (b) Track A only, Track B → K276 / (c) Track B (PWA) first, Track A → K276.
2. **void-engine depth** (the heaviest surface — the 397-entry lexicon + 5-coordinate diagnosis form + 992-track signal index; ~442 sub-44 controls) — (a) **audit + highest-impact touch fixes this session (tap sizes + the dropdowns/chips + no horizontal overflow); a full instrument reflow deferred to its own session [RECOMMENDED]** / (b) full void-engine mobile reflow now (heavy — likely eats the Track B budget) / (c) defer void-engine entirely.
3. **PWA offline scope** — (a) **offline fallback page + precache the app shell (core CSS, nav, footer, fonts, icons) + cache-first for `?v`-versioned assets [RECOMMENDED]** / (b) aggressive: also cache visited reading pages for offline reading (stale-while-revalidate) / (c) minimal: installability only (manifest + a pass-through SW, no offline).
4. **Ambient-bar fx/bed controls on mobile** — the bar is disabled (ruled), but it *docks* the wrong-hour `[fx]` chip + `[synth bed]` popover. (a) **drop those controls on mobile — the effects still run at their defaults, only the dock vanishes [RECOMMENDED, simplest, and mobile perf wants fewer knobs]** / (b) relocate a single minimal floating `[fx]` toggle / (c) keep a slimmed one-row control strip (rejected-adjacent — he said disable).

State-and-proceed (do NOT block on these): install affordance = a custom mobile-only "Install" button via `beforeinstallprompt`, desktop uses the browser-native install (§3); SW registered **mobile-only**; a11y target stays **WCAG 2.2 AA**; touch floor **44px / 48 where room**; breakpoints **≤640 layout / coarse-pointer touch** (no desktop breakpoints).

---

## §2 — TRACK A: the mobile overhaul (every rule mobile-scoped; desktop byte-inert)

**Discipline (verbatim from K274):** append mobile blocks to each component's existing CSS — never edit a desktop rule. Scope with `@media (max-width:640px)` (layout) or `@media (pointer:coarse)` / `(hover:none)` (touch ergonomics). Any new site-wide rules go in `mobile-a11y.css` (bump `?v=K274→K275`). Component CSS files that change get `?v` bumped **only for the file that changed** (K238). Prove desktop-inertness on the full swept tree before ship (§5).

**A1 — Ambient bar DISABLED on mobile (Josiah's call; the K274 Phase-2 headliner).**
- `@media (max-width:640px){ .ambient-player{ display:none } }` in `ambient-player.css` (bump its `?v`). This kills the single remaining mobile horizontal-scroll source.
- **Reclaim the body bottom-padding** the fixed bar reserved (there's a `body`/`main` padding-block-end that clears the ~2.5rem bar — find it, zero it under `≤640`). Verify no page ends with dead space or a clipped last line.
- **`display:none` keeps the node in the DOM** — so `wrong-hour.js` (which injects its `[fx]`/`[bed]` chips *into* `.ambient-bar`) still finds its target and does not throw; the controls are simply invisible. CONFIRM wrong-hour boots clean with the bar hidden (console-clean on a mobile viewport). Per §1b-4: default = the fx/bed dock is gone on mobile, effects still run at defaults.
- The ambient player's hidden YouTube iframe: leave it — it's `display:none`-adjacent already; just don't let the SW (Track B) cache youtube-nocookie (network passthrough, §3).

**A2 — Component touch/reflow audit + fixes (the K274 deferred list).** For each, append a mobile block; target ≥44px touch, no horizontal overflow, legible reflow:
- **wrong-hour** — the `[fx]` popover controls (if kept per §1b-4) tap-sized; the effects are already reduced-motion-gated. Consider throttling grain/scanline cost on mobile (optional; only if a real perf issue shows).
- **console** (`/console/`, gated `facilis-descensus`) — the K249a takeover already has `@media(max-width:520px)` full-viewport + K273 fx. AUDIT: the terminal input focus + the mobile soft-keyboard (does the glass band stay visible above the keyboard? use `dvh`/`svh` if the fixed 82vh fights the keyboard), and tap-size `[ x ] [ share ] [ sigil ] [ crt ] [ sound ]`. Keep console-engine/scene/sigil/fx **byte-frozen** — mobile fixes are CSS + at most the takeover's height unit.
- **void-engine** (`/void-engine/`) — per §1b-2. The instrument HTML is inline (K93). Highest-impact: the category dropdown + diagnosis-coordinate inputs + the signal-index rows ≥44px, the triptych stacks to one column ≤640, zero horizontal overflow. A full reflow is its own session — don't sink Track B here.
- **notes** (`/notes/`) — toolbar buttons (new/delete/copy/download + the K271 kaomoji `[ ◡ ]`) ≥44px; the kaomoji panel already has a `≤640` bottom-sheet (verify it still seats above the keyboard); the editor textarea height with the soft keyboard (`dvh`). Notes JS byte-frozen — CSS only.
- **gallery** (`/gallery/` + rooms) — the controls bar (search / series chips / media chips / Saved / NSFW gate / pager / `[random]` / `[top]` / Prints band; ~54 sub-44) reflows to wrap + tap-sizes; the lightbox/theater close/next/prev ≥44px and thumb-reachable; the consent interstitial buttons tap-sized. `gallery-room.js` byte-frozen — CSS in `gallery-room.css` / `gallery.css`.
- **mode-toggle + mag-slider** (essays/frame heavy-read chrome) — the dark/reader/hc buttons + the magnification slider ≥44px and not overlapping the reading column ≤640.
- **audio-player** (`.audio-block` on essays) — play/scrub controls ≥44px.
- **forms + search** — K274 already did generic form-field ≥44px on coarse; extend: `/search/` input + result rows tap-reachable; `/contact/` Formspree fields; `/donations/` PayPal buttons don't overflow; `/chat/` Kiwi IRC iframe height sane on a phone; `/search/` results don't horizontally scroll.
- **successor stage** (`/successor/`, gated `ne-hoc-fiat`) — the K241 stage has `@media(max-width:520px)` full-viewport; AUDIT the head chips + input + disclosure tap sizes + keyboard behaviour. Stage JS byte-frozen.
- **comment-board** (`/chat/`) — form fields + submit ≥44px (if the board is live).

**A3 — Reading polish + fluid type (mobile-scoped ONLY — desktop root stays 18px / 112.5% byte-inert).**
- A `@media (max-width:640px)` fluid scale via `clamp()` for headings/body so long titles don't overflow and body reads comfortably at phone widths. **Never touch the top-level `html{font-size}`** — that's a desktop byte. Scope everything under `≤640`.
- Tap-friendly line-height + paragraph spacing on reading containers ≤640; comfortable measure (already narrow, mostly free).

**A4 — Safe-area insets (notched phones).**
- Add `viewport-fit=cover` to the `<meta name="viewport">` on every page (a sweep — see A5). Desktop ignores safe-area, so this is mobile-only in effect (still prove inertness).
- `env(safe-area-inset-*)` padding on: the nav toggle / disclosure, the console takeover, the successor stage, any fixed element, and the body bottom (now that the ambient bar is gone). Guard with `@supports(padding:env(safe-area-inset-bottom))`.

**A5 — The HTML sweep (self-gating python, K274 pattern — NOT PowerShell `.Replace`).**
- What the sweep does this session: (i) bump `mobile-a11y.css?v=K274→K275` where present (71 files), (ii) add `viewport-fit=cover` to the viewport meta where absent, (iii) any new site-wide component `?v` bumps for files Track A changed. **Do NOT re-add the toggle markup / skip-links / id=main** — K274 already landed them; guard every transform with a `not-already-present` check so a re-run is a no-op (idempotent, K274 hazard #3).
- Model it on `Downloads\mobile-gates\sweep.py` (or the version in `_k274\`): `EXPECT={...}` exact counts, `sys.exit(1)` on any mismatch or leftover old `?v`, idempotent-guarded. The operator runs `python _k275\sweep.py src` inside the ship block; a count mismatch aborts the ship.

---

## §3 — TRACK B: PWA / "app-like" install (progressive, desktop-safe)

Goal: a phone can "Add to Home Screen", it launches standalone (no browser chrome), loads instantly on repeat visits, and shows an offline fallback instead of the dinosaur. Everything here is **progressive** — with JS off or SW unsupported, the site behaves exactly as today.

**B1 — Web app manifest** (`src/manifest.webmanifest`, new). Neobrutalist-dark palette:
```
{ "name":"WULD — wuld.ink", "short_name":"WULD", "start_url":"/", "scope":"/",
  "display":"standalone", "background_color":"#0a0a0a", "theme_color":"#0a0a0a",
  "icons":[ {"src":"/icons/icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},
            {"src":"/icons/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},
            {"src":"/icons/maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"} ] }
```
- Linked from every page via `<link rel="manifest" href="/manifest.webmanifest">` + `<meta name="theme-color" content="#0a0a0a">` + `<link rel="apple-touch-icon" href="/icons/icon-192.png">` — all `<head>`, non-rendering, zero-JS, desktop-inert. A head-only sweep (idempotent-guarded).

**B2 — Icons** (`src/icons/`, new PNGs — small binaries, like the yurei assets; pre-flag but trivial). Generate in-session from the site palette (near-black `#0a0a0a`, blood-red `#c41e3a`, warm off-white `#f0ebe5`) — a simple WULD wordmark/glyph in Cormorant/serif. 192 + 512 "any" + a 512 **maskable** with the 20% safe-zone padding (the glyph inside the inner 80% circle). Pillow or a headless SVG→PNG render; commit under `src/icons/`.

**B3 — Service worker** (`src/sw.js`, new; scope `/`). **Cache strategy — get this exactly right or it serves stale pages after a deploy:**
- Versioned cache name `wuld-sw-K275`; on `activate`, delete every cache that isn't the current name (this is the deploy-freshness mechanism — bump the version every SW change).
- `install` → precache the app shell (offline fallback page `/offline.html`, `tokens.css`, `base.css`, `nav.css?v=K275`-or-current, `footer.css`, `mobile-a11y.css?v=K275`, the fonts, the icons, the manifest).
- `fetch` routing:
  - **HTML navigations → network-first**, fall back to cache, then `/offline.html`. (Never serve a stale page while online.)
  - **`?v=`-versioned assets** (CSS/JS/components) → **cache-first** (immutable by version — the `?v` IS the cache key; safe forever).
  - **Same-origin `/api/*`, `/admin*`, the comment board, the gap-log** → **NETWORK-ONLY, never cache** (dynamic + auth + writes).
  - **Bare `/components/*.json`** (the successor/console corpora fetched WITHOUT a `?v` — the K262 hazard) → **network-first or network-only**, never cache-first, or a stale corpus sticks forever.
  - **Cross-origin** (audio.wuld.ink R2 media, youtube-nocookie ambient, library.wuld.ink flagship, admin.wuld.ink) → **passthrough, do not cache** (big media + separate origins + the ambient iframe must stay live).
- Keep it dependency-free vanilla. Do NOT precache gated-surface content in a way that leaks (the curtains are client-side; the bytes are public anyway, but don't precache `/successor/` or `/console/` into the shell).

**B4 — Registration** (`src/components/sw-register.js`, new, tiny, `?v=K275`).
- **Homepage zero-JS invariant (D1) is absolute** — the homepage (`src/index.html`) gets NO script. So register the SW from a `<head>` `defer` script on **all NON-home pages** (sweep it in, head-defer so it's never a `body *` element for the fingerprint gate). Once the SW controls the origin, the homepage is covered on any subsequent visit; the only cost is the install prompt won't fire on a cold bare-homepage-only visit — acceptable, `start_url:"/"` still launches there once installed.
- **Register mobile-only** (recommended posture): `if (matchMedia('(pointer:coarse)').matches && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')`. This keeps **desktop behaviour** untouched, not merely desktop layout — no SW, no cache, nothing to go stale on desktop. (If Josiah wants desktop PWA too, drop the coarse guard — a §1b state-and-proceed, defaulting mobile-only.)

**B5 — Install affordance** (mobile-only, desktop-inert).
- Capture `beforeinstallprompt`, stash it, reveal a custom `[ Install app ]` button — shipped `[hidden]`, un-hidden only `@media (max-width:640px)` (the K274 nav-toggle pattern), and **excluded from the desktop fingerprint gate** exactly like `.nav-toggle`. On tap, call the stashed prompt. Desktop Chrome shows its native omnibox install icon — no custom UI needed there.
- iOS Safari has no `beforeinstallprompt` — a one-line "Add to Home Screen via Share ▸" hint under the button on iOS is optional (state-and-proceed; keep it tiny and mobile-only).
- Placement: the footer or a slim mobile-only slot — NOT a nagging banner (Josiah-register: no growth-hack patterns).

**B6 — `/offline.html`** (new, sealed-simple): site chrome + "You're offline — cached pages are available; reconnect for the rest." Register-clean, dark, zero external deps.

---

## §4 — DESKTOP-INERTNESS (the load-bearing invariant — reuse the proven gate)

- **Track A:** every rule mobile-scoped → the **pristine-vs-swept layout fingerprint** (`pass3-ship.js`: two servers, every `body` element's geometry + ~20 computed styles at 1280 & 900, JS frozen, the added hidden controls excluded) must be **ZERO element deltas across all 25 pages** (K274 got 50/50). Plus the static audit: every new rule sits inside a media query (grep for top-level rules).
- **Track B:** the manifest/theme-color/apple-touch `<link>`/`<meta>` are `<head>` elements — non-rendering, so the fingerprint (which walks `body *`) is naturally blind to them; still run the gate on the full swept tree to prove it. The `sw-register.js` is `<head>`-defer (not a `body *` node) and **registers mobile-only** → desktop is behaviourally inert too. The install button ships `[hidden]` and is **added to the fingerprint's exclude list** (`.nav-toggle-cb, .nav-toggle, .skip-link, .pwa-install`). If the gate shows ANY desktop delta, it's a real leak — do not ship past it.

---

## §5 — Gates (all green before the ship block is handed over)

1. **Desktop inertness (load-bearing):** `pass3-ship.js` pristine-vs-swept = **N/N ZERO deltas** at 1280 & 900. `pointer:coarse`==false on every desktop viewport. Static scope audit clean.
2. **Mobile measure:** `pass4-mobile-swept.js` at 390×844 — sub-44 control count **materially down** from K274's residual (the ambient bar + the audited components); **zero horizontal overflow** on every audited page (the ambient-disable should take the last page to zero); nav disclosure still works (collapsed→tap→open).
3. **axe-core AA:** `pass5-axe.js` pristine-vs-swept, mobile 390, JS live — **zero NEW serious/critical violations** (the pre-existing desktop `color-contrast` + base-`pre` `scrollable-region-focusable` are the known carry; nothing new).
4. **wgate 24/24** on the swept tree (the successor curtain regions must stay byte-intact if any successor CSS is touched).
5. **PWA (Track B):** manifest parses + validates (name/icons/start_url/display); the SW passes `node --check`; a headless install-criteria smoke (manifest linked + SW registers + `beforeinstallprompt` fires under a mobile ctx); the SW **serves `/offline.html` when the network is cut** and **network-firsts HTML** (prove a redeploy isn't masked by a stale cache — bump-version-evicts test); the SW **does NOT cache** `/api/*` or a bare `/components/*.json` (the corpus-staleness guard).
6. **Search-index / sitemap neutrality:** `build_index.py --src src` == the committed index BYTE-IDENTICAL (nothing Track A/B adds is harvested — manifest/sw/icons aren't pages, the mobile CSS adds no heading). Prove it; do not regen.
7. **U+FFFD 0** across every authored/swept file. `node --check` the new JS.

---

## §6 — Ship (NO PIN; ONE wuld PS block per commit; budget checkpoint)

- **Budget checkpoint (hard):** after Track A's gates are green and its ship block is authored, MEASURE spend. If comfortably under ceiling, build Track B and author its block (or fold both into one commit if clean). If near the ceiling, **ship Track A alone, write the K276 kickoff (Track B is §3 verbatim), stop.** Never crash mid-Track-B leaving a half-registered SW.
- **Ship block shape (per the K274 block, operator conventions carried):** `& { }` scriptblock; `.git\*.lock` cleanup; `git fetch` + **HEAD==origin==`df8975b`** guard (re-derive if moved); base-blob guards (`git rev-parse HEAD:path`); `Move-Item` the sidecars from `_k275\` to final paths; **result-blob gates** (`git hash-object`); `python _k275\sweep.py src` (self-gates counts + 0 leftover old `?v`, aborts on mismatch); CLAUDE.md stratum via **python-append** (never Edit/Write — large-file discipline); `git status --short` review; **explicit-stage named files/dirs — NEVER `git add -u`/`.`**; measured staged-count gate; commit; `git config http.postBuffer 524288000`; `git push` + `$LASTEXITCODE` gate; `curl.exe` live asserts (`-o` a temp/NUL, never `$null`; content-grep HTML for CF-beacon, md5 only static assets). Helper NOT named `H` (alias→Get-History; use `Md5`/`FH`). One-line `if/else`. Commit message `->` plain (no cmd caret). NO PIN, NO efilist, NO search/sitemap, NO canon.
- **Self-resolve the K-number** at push (site-feature lane; next free integer atop the current tip) — the HEAD==origin guard catches a same-day collision and aborts safe; renumber and re-cut `?v`/stratum against the fresh tip if so.
- Deliver the sidecars to `C:\Users\y_m_a\Projects\wuld-ink\_k275\` via the device bridge; the operator runs the block.

---

## §7 — Carried live pins + standing hazards

- **Pins (HELD unless this session edits them):** HEAD `df8975b` · `mobile-a11y.css` `cd31104d`/`b03c13d2` `?v=K274` · `nav.css` `23a577f1` `?v=K274` (+Variant B disclosure) · `footer.css` `45ab8d23` `?v=K274` · 71 swept HTML (toggle markup + skip-links[69] + `id=main`[2] + `mobile-a11y` link) · `base.css`/`tokens.css` BYTE-FROZEN · flagship `e654eabd` pin v4.0.0 (efilist READ-ONLY) · search-index / sitemap · the corpus/console/yurei/omega/successor stacks byte-frozen except a touched component's mobile CSS.
- **Lane interleave:** the console lane ships ODD, corpus EVEN, site-feature (this) grabs the next free integer; all file-disjoint except CLAUDE.md + HEAD; the HEAD guard serializes. If corpus/console landed since `df8975b`, they touched none of Track A/B's files — re-derive blobs, read by content, proceed.
- **Standing hazards (carry ALL from the K274 stratum + the CLAUDE.md ledger) — the load-bearing four:** (1) **desktop-inertness = LAYOUT FINGERPRINT, never pixel-diff** (pixel-diff drowns in image-decode/font-swap/lazy-load/scroll-timing noise — chased for passes at K274); compare pristine-vs-swept two-server, EXCLUDE the intentionally-added `[hidden]`/off-canvas elements from the FP so counts match. (2) **zero-JS disclosure/affordance = an element shipped `[hidden]` via the HTML attribute** (default-hidden by markup, NOT a top-level CSS rule → the "all rules in a media query" static audit stays clean) + un-hidden only ≤640; desktop-inert AND homepage-zero-JS-safe AND AA. (3) **mass HTML edits = a self-gating `python sweep.py`** (exact counts + 0 leftover + idempotent-guarded, exits nonzero on mismatch) — safer than PS `.Replace`; a re-run must no-op. (4) a "single remaining overflow" can be a FIXED component (the ambient bar) whose 100vw overlays inherit the over-wide width — this session KILLS that source by disabling the bar; verify no other fixed element reintroduces it.
- **NEW PWA hazards (bake these into Track B):** (5) **SW freshness** — network-first HTML + version-named cache evicted on `activate`; a cache-first-HTML SW serves stale pages forever after a deploy. Bump `wuld-sw-K<n>` every SW change. (6) **bare-URL corpus** (`/components/*.json` fetched without `?v`, K262) must be network-first/only in the SW, or the successor/console corpus freezes. (7) **API/admin/comment/gap-log = network-only**, never cached (auth + writes). (8) **homepage zero-JS (D1)** forbids a registration script on `index.html` — register from a head-defer script on non-home pages; SW-controls-origin covers the homepage after first navigation. (9) SW registered **mobile-only** keeps the "doesn't affect desktop" promise airtight (no desktop cache to go stale); the install button is `[hidden]`+`≤640`+FP-excluded like `.nav-toggle`. (10) CF-beacon injects a script into served HTML → content-grep HTML in curl asserts, md5 only static assets (css/js/json/manifest). (11) CRLF: the operator working copy is CRLF; git normalizes to LF on commit; result-blob (`git hash-object`) guards pass, origin stays LF — benign, note-don't-fix.

---

## §8 — Deliverables

- Track A sidecars → `_k275\` (the changed component CSS + the bumped `mobile-a11y.css` + `sweep.py` + `k275_stratum.md`), the ship block, gates green, a short `REVIEW.md` (what changed / desktop-proven / mobile-measured / the ambient-disable / deferred tail).
- Track B sidecars (if in-session) → `_k275\` (`manifest.webmanifest`, `sw.js`, `sw-register.js`, `src/icons/*`, `/offline.html`, the head-sweep additions).
- A playable F6: Josiah opens the swept tree on a phone (or the operator's live deploy) — the ambient bar gone, the components tappable, and (Track B) an "Add to Home Screen" that launches standalone and works offline.
- Non-shipping by default until his go (the K274 posture) UNLESS he says ship-on-green in-session.

*— end K275 kickoff —*
