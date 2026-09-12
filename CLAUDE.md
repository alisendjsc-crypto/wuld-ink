# CLAUDE.md — wuld.ink project primer

You are a Cowork instance working on Josiah's `wuld.ink` personal site. Read this file first. Then read `docs/wuld-ink-cowork-brief.md`. That is the orientation sequence.

---

## START HERE — the cheat sheet (WI-K318b, 2026-09-12)

This section is an index to the log below, not a replacement for it; where the two disagree, the stratum is the record and
this is the error. It exists because the log had grown to 1,293,685 bytes and is loaded whole into every Cowork session and
again after every compaction, so a session could not compact its way out of it: the first K319 session (2026-09-12) compacted
three times in a row, on Opus 5 and then on Fable 5.1, and Josiah stopped it. WI-K318b moved the strata K212 → WI-K312g into
`CLAUDE-history.md` byte-exact and kept what is below. Nothing was rewritten. **When this file passes ~250 KB the trim is the
next task, not a carry: `k318b\trim_claude_md.py` cuts it and the WI-K318b stratum (at the bottom) has the block's method.**

**Read in this order and stop when the task is in hand.**

1. This section; then `## Register and working norms` and `## Aesthetic register (LOCKED …)` below.
2. The LAST stratum in this file (`## WI-K3xx —`, at the bottom). Its STATE paragraph is the current state, its Carries are
   the open items, its last sentence names the highest hazard numeral. A status carried from an earlier stratum is a claim
   until it is re-read live (cccxxx).
3. `## File layout` when the task names a path; `docs/wuld-ink-cowork-brief.md` as the orientation sequence says.
4. `CLAUDE-history.md` (≈3.9 MB) never whole: grep it for a K-number or a roman numeral. Hazards cccxxii → cccxxxix are
   defined in the strata kept below (WI-K313a → WI-K318); every numeral below cccxxii is in the history (K310v → WI-K312g
   hold ccciii → cccxxi; cccix → cccxv and cccxx are the video seat's by authorship and are recorded there).

**The hands.** Josiah is the operator: he runs the blocks, publishes, and rules; his intention is quoted, never paraphrased
(cccxi). This seat is wuld.ink (W). The library seat (L) owns efilist — `library.wuld.ink`, the flagship `combined.html` and
the wings: to this seat efilist is READ-ONLY except through a gated block whose subject is the change, and a wing's file,
`/troubleshooting/`, and the two apparatus pages (`/argument-library/apparatus/`, `/illogically-is/apparatus/`) are touched
only when that is the task. The video seat (V) owns the films' kits (`Downloads\apparatus_libshow\`, the Illogically Is and
dot material) and every figure on an apparatus page: a figure without a generator is a transcription (cccxxxi), and the pages
are dated records the relabel sweep must skip (cccxxxvi; `EXEMPT_FILES` in `tools/library-pin.py`). Seats talk through files
in `Downloads\Argument Library\` — relays, prompts, and the drops `k3xx\`.

**The pin.** `https://library.wuld.ink/combined` (and `/combined.html`, the same bytes) is the flagship. At WI-K318b:
**v4.0.3, `62c733ac8263e6413816cfb6d28e3b8a` / 2,982,420 B**, efilist `4e4722b` — recompute at open, never carry. A pin
move is an efilist commit by a gated block whose subject is the move; wuld.ink follows with `tools/library-pin.py` (the
relabel; `tools/library-pin-state.json`), a `release_vX_Y_Z.json` → `src/releases.json` → `tools/changelog/gen_feed.py` →
`src/feed.xml`, and `tools/search-index/build_index.py` → `src/search-index.json`. Nothing else moves the pin.

**Blocks.** Every commit is one PowerShell block, written by the seat and run by Josiah as one line
(`Get-Content '<block>.ps1' -Raw | Invoke-Expression`); blocks are never chained, and the next is never run after an ABORT.
The shape, as `k318\WI-K318_commit.ps1` has it: `.git\*.lock` cleanup → HEAD guard → every base file gated by md5 AND byte
count (`git rev-parse HEAD:path` for the blob) → inputs gated the same way → the write predicted (bytes + md5) and verified,
or nothing commits → `git add -- <the exact names>` and the staged set compared to that list (never `git add -u`, never
`git add .`; ccxxvii) → index blobs after the add → commit → fetch, 0 behind, exactly 1 ahead, push → whatever is served
read back with status and byte count beside every md5. `curl.exe`, never `curl` (K113); `-o` to a temp file, never `$null`;
one-line `if () {} else {}`; no double quote inside a double-quoted string or a native command's argument (the WI-K313d
abort); helpers `Get-Md5` / `Get-Md5Bytes`. Dates are operator-local (America/Phoenix); a run that crosses midnight stops
and says so. No PAT or credential ever appears in a block or a transcript. Rehearse a block in the workspace's pwsh against
a local clone with a bare origin and a fake `curl.exe` before handing it over.

**This log.** Append-only, as bytes: a stratum `## WI-K3xx — …` is appended by a block that gates the base file's md5 and
byte count and the sha256 of its first 4096 bytes (first 32 hex; after WI-K318b: `2cef196bc447b0bce2ba96fbc5424ca3`), refuses a numeral already
in the log, predicts the result and verifies it. Landed strata are never rewritten; a correction is a new stratum that says
what it strikes (K310w). Large files move by `git show` or device staging, never through the Edit or Write tools
(ccxxxv/K204). `docs/dot-handoff/` is untracked by design (K293e). Written so that a smaller-context model can work the
project: read 1–2 above and the task's own files; do not read the rest of the log.

---

## What this project is

A multi-page philosophical-content site for Josiah (WULD / AnomicIndividual87 / Evilis Anihilis Uls). Cloudflare end-to-end stack (Registrar + Pages + R2). Domain `wuld.ink` registered 2026-05-11 (auto-renew $20/yr, expires 2027-05-11). The site is the umbrella for all his philosophical output.

---

## Orientation sequence (in order)

1. Read this file.
2. Read `docs/wuld-ink-cowork-brief.md` — full implementation brief, stack rationale, capacity math, audio architecture, open decisions, working preferences.
3. Confirm what Josiah is asking. If a session-A-prerequisite decision is still open (see "Current state" below), surface it via `AskUserQuestion` before building anything.

---

## File layout

| Path | Role |
|---|---|
| `README.md` | Quick orientation, scope summary |
| `CLAUDE.md` | This file — primer for Cowork sessions |
| `docs/wuld-ink-cowork-brief.md` | Full implementation brief |
| `src/tokens.css` | Multi-mode design tokens (type, color×3 modes, spacing, borders, motion) + `@font-face` declarations for 3 self-hosted serif faces |
| `src/base.css` | Reset + element defaults wired to tokens; root font-size bumped to 18px |
| `src/components/audio-player.{css,js}` | Inline `.audio-block` audio player; reads `data-audio-key` → R2 URL |
| `src/components/mode-toggle.{css,js}` | Scoped reader-mode toggle (dark / reader / hc) |
| `src/components/nav.{css,js}` | Site header + primary nav. JS sets `aria-current="page"` on matching link (session B). **K43:** nav-glow — `.nav-updated` text-shadow pulse on nav items whose section changed since the visitor's last visit (localStorage `wuld:seen` diffed against `/releases.json`); cleared on visiting that section; `prefers-reduced-motion` -> steady accent, no pulse. |
| `src/components/glossary.css` | Glossary index + per-entry layout (shared across all `/glossary/*` pages) |
| `src/components/ambient-player.{css,js}` | Site-wide ambient background player (K24j). Fixed-bottom 2.5rem mono chrome bar (track name + play/pause + skip + shuffle + volume + ambient on/off). Hidden YouTube IFrame loaded from youtube-nocookie.com pulling playlist `PLt28yN-6sGYFrlBca9RI70IjQ2ny50D1c`. localStorage key `wuld:ambient` persists `{on, volume, currentVideoId, lastPositionSec, shuffleOn}` across navigation. Browser autoplay-policy hard-block worked around via first-interaction listener (click/touch/keydown) bound when initial `playVideo()` is silently denied; `.ambient-needs-tap` pulse class signals the play button until interaction unsticks autoplay. Cross-page seek-resume via saved `currentVideoId` + `lastPositionSec` (re-found in next page's playlist; small delay before `seekTo`). Skipped surfaces: `/_/successor-protocol/` + `glossary/black-box-of-inaccessibility/` + `404.html` + both templates. **K207:** `DEFAULT_STATE.shuffleOn` true->false + `loopOne` false->true -> a fresh visitor opens on playlist track 1, looped (the paired opening track for the wrong-hour synth bed; existing listeners keep their persisted shuffle/loop); js `?v=K30`->`?v=K207` (css HELD `?v=K30`). |
| `src/components/wrong-hour.{css,js}` | Synthesized SFX/VFX component ("the wrong hour"), K205; NO-PIN auto-deploying, progressive (JS off -> zero effects; homepage D1 zero-JS invariant holds). ONE DIAL `rot() = prefs.vfx x (0.4 + 0.6*bleedNow())`, the bleed peaking ~3am; drives colour-tint (mix-blend:color, LIGHTNESS held) + real canvas film-grain + scanlines + heading chromatic-aberration + vignette on a 60s paint tick. Synth CUE LIBRARY (boot / key-per-keystroke / soft-nav / click-button / bell-3am / purr-mascot), consent-gated, lazy AudioContext resumed on our OWN passive first-gesture listener (coexists with the ambient-player YouTube unlock, never touches it); placement router nav->soft / buttons->click / typing->key + `data-wh` ("none" mutes) / `data-wh-scene` / `data-wh-hover`. Controls dock into `.ambient-bar` ([fx] chip -> popover); localStorage `wuld:wrongHour`; prefers-reduced-motion -> motion off. **K206:** sfx default 0->0.35; synced-smart boot power-on (flash fires WITH the boot sound on the first gesture, or immediately if sound muted); GENERATIVE AMBIANCE ENGINE (mechanical whir/hum drone + sparse analog-piano motifs + faint breath through the convolver room) as a `youtube <-> generated` source toggle on the bar + a "bed" popover row (pauses the playlist via `WuldAmbient`, rides the ambient volume, persists via `prefs.amb`; NO ambient-player.js edit); VFX REGISTRY of interaction one-shots (flick/pulse/burst/roll/bloom + heading `glitch`) routed parallel to the sound cues (nav->pulse / buttons->flick / typing->glitch + `data-wh-vfx` / `data-wh-vfx-scene`), peaks swelled by the same bleed (`fxi()`), legibility-safe, off under reduced-motion. Public `window.WuldWrongHour` (play/fx/bed/get/set + cues/vfx lists). **K207:** the bed DECOUPLED from YouTube (independent layer -- never pauses the playlist, fixing the K206 dead-bar bug: pausing YT flipped `[data-state=off]` -> `pointer-events:none` on the injected chips) + bed ON by default (`prefs.bedOn`) + auto-disable on YT track-change/skip (a 2s `WuldAmbient.currentVideoId` watch) + a resonant-pentatonic-pluck nav cue (`soft`, replacing the felt-tap); `ambience`->`bed` API; a css override keeps `[fx]`/`[synth bed]` live at `[data-state=off]`. `?v=K207`. **K208:** a notes-surface `word()`/`wordChime` cue (soft high-pentatonic "word landed" chime) + `setWriting()`/`ambFlourish()` (writing-mode bed reactivity); a SESSION-AGE STRANGENESS engine -- `corruption()` ramps 0->1 over ~30min of tab-open time (sessionStorage `wuld:wrongHour.sess`, resets on browser close) driving intrusive-word hover ghosts + reversible single-text-node glyph flicker + phantom link-destination labels (gated `vfx>0 && !reduce`, one throttle, NEVER mutates the editor/real nav, excludes textarea/input/contenteditable/`[data-wh=none]`/ambient-bar/panel); TWO additive bed MOODS `clinical`+`oceanic` via a `MOODS[bedMood]` config + a `[bed: <mood>]` popover cycle (`prefs.bedMood`). Public surface += `word/writing/mood/corr/moods`; `?v=K207`->`?v=K208` (js `b32b3825`->`0fa0932a`/865 ln, css `d101e59b`->`263f54a7`/202 ln). |
| `src/notes/index.html` | Notes surface (K208) -- `/notes/`, eyebrow `17 - Notes`, neobrutalist dark + tokens, standard chrome + the NEW Notes nav tab (after Search). PRIVATE per-browser writing: multi-note localStorage `wuld:notes` (v1 `notes[{id,body,created,updated}]`+activeId; 500ms autosave; list newest-first / new / delete[confirm-on-nonempty] / copy[clipboard+execCommand fallback] / download .txt; live word+char counts; saved/editing indicator); works with the component ABSENT (progressive). Editor = `<textarea data-wh=none>` (mutes the focus-click cue; the per-keystroke mechanical `key` sound still fires via isEditable; excluded from the strangeness engine). Typing FX: word-complete (a boundary key -- space/Enter/`.,;:!?)` -- after a word char, 110ms throttle) -> `WuldWrongHour.word()` (chime + bed flourish) + a field glow + a caret-mirror spark (page-side, defensive, gated by `get().vfx>0` + !reduced-motion); focus/blur -> `writing(true/false)`. Private-only; public share deferred. md5 `3e974fdb`. |
| `src/components/void-engine.{css,js}` | Void Engine instrument: signal textarea + mode radiogroup + seed input + transmit button + transmission output. JS exposes `window.VoidEngine.register(slug, {label, transform})` for chat-side authorship of transmission modes. Ships with two content-empty stub presets (NULL passthrough, INVERSION mirror) so the instrument boots usable. Seeded determinism via mulberry32 PRNG; empty seed input falls through to content-derived xmur3 hash for reproducible auto-seeding. |
| `src/components/yurei.{css,js}` | Yurei mascot easter-egg widget (K115) — site-side DOM layer, loaded ONLY by heavy-read pages (currently `/frame/`; full-set expansion staged K115a post live-eyeball). Manifest-first: reads `/assets/yurei/manifest_v1.json`, resolves every asset BY FILENAME, reads `anchorPx {270,169}`+`px` off the manifest (N5 single-source). Idle VP9 loop (`yurei_idle_v1.webm`) + canonical still poster/fallback; WATCH split-origin geometry lifted from the K111 harness (engage 360 / disengage 460 from box-centre, zone angle + 140px dead zone from the scaled head anchor, 8 directional head-still HARD-CUT swaps, hysteresis + >=150ms persist / >=200ms swap gates); runtime sha256 byte-gate (SubtleCrypto) on the idle loop before play -> still-only fallback. a11y: `prefers-reduced-motion` -> canonical still only; desktop-only `>=900px`; `pointer-events:none` all layers; floor 2.5rem+8px (ambient-bar band); z above content / below lightbox-theater; kill-switch `window.yurei.off()` (writes RESERVED `wuld:yurei.off`). CHOREOGRAPHY (K116): drift/peek/surface + EB-Garamond fragment scheduler (text library F01-F18, `wuld:yurei.fragmentPool`) + exorcism (x3 no-dwell). **K117:** TRUE manifest-resolved stills — `zoneFor` returns the zone NAME, `stillFor()` maps name->file via a `stillByZone`/`p0Still` map built at boot from `byRole` (the 8 WATCH stills + canonical P0 were hard-coded `_v1`; now ZERO `_v1` on the live path) + `MANIFEST_URL` -> `manifest_v2.json` (Phase-3.8b denser-hair render) + console dials `window.yurei.scale()/fade()` for live tuning. js `5daa3f73`->`b1f58997`/28,281 (`?v=K117`); css `b763eb1b` HELD (only its `?v=` query bumps). |
| `src/assets/yurei/` | K115 — the 13 web-shipped mascot assets + vendored `manifest_v1.json` (Pages-served; wuld.ink hosting call per asset-spec §8, NOT R2). idle/drift/peek/surface `.webm` (VP9 yuva420p alpha, `-auto-alt-ref 0`) + `yurei_still_v1.png` (canonical P0) + 8 directional `yurei_head_{n,ne,e,se,s,sw,w,nw}_v1.png`. ~1.95 MB, lazy after activation. All 13 gated GREEN md5+sha256+size vs manifest at ingest. Asset swaps (W.U.L.D. Phase 3.6 occlusion-clean diagonals) = drop `_v2` + manifest-bump, ZERO widget change. `manifest_v1.json` = full 13-asset contract, ~6,336 B (the K115 ship vendored a 1,641 B bash-clip truncation; FIXED at K115a via Write-tool rewrite — md5 via real-disk Get-FileHash, the bash mount clips it). **K117:** the 13 `*_v2` binaries (Phase-3.8b Set-C ~444-strand denser hair; anchorPx/px/codec/schema UNCHANGED) + `manifest_v2.json` (`06c65f09`/9,036 B, schema 1.1) vendored alongside v1; all 13 GREEN md5+size+sha256 vs manifest at ingest; widget reads v2 (the refactor made vN a true drop-in); v1 KEPT as rollback, retire K118. |
| `src/templates/essay.html` | Canonical essay template — root-relative asset paths after session B; serve `src/` via static server for local preview |
| `src/index.html` | Real homepage — collapsed title-page. Cover (full viewport, Cormorant Garamond display + handles row + descent affordance) → K98b cover-search band (GET form → `/search/?q=`; zero homepage JS — D1 holds) → Index grid of 6 destinations → footer |
| `src/essays/index.html` | Essay index — lists SV (live shell) + Illogically Is + A Life Inside (forthcoming) |
| `src/essays/sanguinolentum-vestigium/index.html` | SV essay shell — 3 sections wired with audio data-keys (`essays/sanguinolentum-vestigium/section-{1,2,3}.mp3`), prose placeholders awaiting chat-side injection |
| `src/argument-library/index.html` | Library page shell — placeholder; editorial extracts land in F+ once library declares stable tag |
| `src/glossary/index.html` | Glossary A–Z index — 9 terms listed, 2 live (Alogical Isness, Contextus Claudit) + 7 forthcoming |
| `src/glossary/_template.html` | Glossary entry template — copy for new entries, fill term/meta/sections |
| `src/glossary/alogical-isness/index.html` | Anchor entry shell — definition/etymology/see-also/appears-in scaffolded, bodies pending |
| `src/glossary/contextus-claudit/index.html` | Anchor entry shell — same scaffold as alogical-isness |
| `src/void-engine/index.html` | Void Engine page — triptych instrument. Three engine wrappers: `void-engine-wrap` (Sanguinolentum Vestigium lexicon — 397 entries / 25 categories / 4 STACK_TRIGGERS / 5-coordinate Diagnosis form), `sig-engine-wrap` (Signal Engine 992-track frequency index), `trans-engine-wrap` (ambient visual canvas). Site head + header/nav + main + footer + ambient-player chrome wrap canonical engine bodies. Engine CSS+JS authoritative source = void-engine-suite project's `DUAL_ENGINE_v2.html` (paste-relayed to wuld.ink-side via Cowork; current state K93 (2026-06-08): wholesale substitution, source md5 `dcf4897f` / 639,543 B (397 entries / 25 categories) -> shipped `9605507153` / 646,828 B (chrome + engine; +95,534 over K51). 6 new registers vs K51's 19 cats: Cyborg / Synthetic, Monster / Creature, Under-Skin / Black-Void, Hell / Infernal, Succubus / Domestic-Infernal, Celestial / Deep-Field (last in the dropdown). Per-user `void-new-seen` glow + figure-DNA `#posfilter-sel` carried. Prior: K51 `4f547a52`/551,294 (334/19, glow+posfilter feature bundle); K48 the 310->334 sync. Chrome HELD byte-identical across the two-region splice (inline `<style>` + the `<main>` engine body); K26 xcvii cache-bump N/A - engine assets are inline, not external components. |
| `src/book/index.html` | Book page shell |
| `src/blog/index.html` | Blog index — post-card list (newest first) + per-post pages at `/blog/<slug>/` (2 live pre-K212: the-easiest-case, load-bearing). **K212:** the admin `blog-post` op prepends the card here + creates the post page (chrome grafted live from the-easiest-case). |
| `src/watch/index.html` | Watch page (session G) — link-out video card grid mirroring selected uploads from the WULD Incorporated YouTube channel. Two placeholder cards ship as paste-replace stubs: swap `.video-thumb-placeholder` div for `<img class="video-thumb" src="https://i.ytimg.com/vi/<VIDEO_ID>/hqdefault.jpg">` when filling real video data. No iframe embeds (bandwidth + surveillance discipline). Channel CTA bar always points to source. **K220:** +hosted-media card CSS (.hosted-*; the Hosted section itself is INSERTED by the admin media-publish op with the first listed card and retired with the last — the committed page stays heading-clean) + footer.css ?v K30->K43 sync (audit F1); the page long ago gained in-place YouTube theater mode (uncatalogued earlier pass) — no longer link-out-only. |
| `src/watch/_donor/index.html` + `tools/media-manifest.json` | K220 media vertical. The DONOR: every published /watch/<slug>/ page grafts its chrome from this live page (underscore-sealed, noindex, wuld-search-excluded, never linked; the hosted-media player JS + page CSS live in its HEAD and survive the main swap — one copy, sweep-maintained; graft counts title x3 / desc x2 / url x2 + the two meta lines). The MANIFEST: schema 1, items {id,title,date,summary,duration,r2key,poster,bytes,content_flags[nsfw|exclusive],listed,status draft|published,added,published}; repo-committed OUTSIDE src/ so the item list (incl. unlisted 18+ slugs) never deploys; written only by the admin worker (sha-CAS, one commit per action). |
| `src/_/successor-protocol/index.html` | The Successor Protocol (session G) — hidden stub at `/_/successor-protocol/`. Underscored-prefix convention = not indexed, not linked, not surfaced. Sealed surface (no nav/header/footer; `noindex,nofollow` meta). Awaits Cloudflare Access policy (operator-side, Zero Trust dashboard) for email-OTP gating against alisendjsc@gmail.com + content paste-replace from baton (other-project chat). Setup instructions live in top-of-file HTML comment block. |
| `src/frame/index.html` | Frame (session K3) — entry-point anchor page for cold readers. Situates the umbrella's general philosophical stance through WULD's specific inflection: 4 `.frame-section` blocks (negative utilitarianism / anti-natalism / structural pessimism / voluntary human extinction). Each section ships a `.frame-section-canonical` mono line gesturing at the academic position + `.frame-section-placeholder` body awaiting chat-side authorship with seed-questions for inflection-from-canon. NOT a glossary entry; glossary discipline holds coined vocabulary only. Discreet `.frame-pointer` aside in `/glossary/index.html` header is the only on-site link in. NOT a homepage destination card. `.frame-onward` cross-link block at bottom routes to /glossary/ + /book/ + future library.wuld.ink. |
| `src/essays/architecture-of-moral-disaster/index.html` | Architecture of Moral Disaster essay shell (session K3) — audio-format slot for the 23:11 reading staged at `_audio-staging/architecture-of-moral-disaster.mp3` since session H. Pattern-matches Alogically Is. Audio-intro band with `data-audio-key="essays/architecture-of-moral-disaster/full.mp3"` + secondary cross-link to video adaptation at `/watch/` (ID `GSDN0vu18Fo`, 23:59, Apr 2026). Inherits `/components/essay.css` from K2 promotion (third use case). 3 section placeholders + endnotes scaffold. Audio block 404s until R2 drag-drop completes. |
| `src/assets/book-cover-malgre-tout.png` | Malgré Tout cover image (session K3 addendum, 2026-05-13) — Josiah's full-bleed cover variant (portrait, post-swap). True PNG with alpha (RGBA 8-bit, ~3.0 MB / 1152×1536, 3:4 portrait — canonical book-cover ratio). Single dissolved face in red/black with distressed paper texture. Mounted in `/book/`'s page-hero above the Cormorant title-block via `.book-cover` block (capped 24rem, hairline border — tighter cap accommodates portrait aspect without pushing title-block + lede below desktop fold). Future optimization candidate: re-encode as WebP to reduce above-fold transfer size while preserving alpha + distressed-texture detail. |
| `src/donations/index.html` | Support tab (K26) — `/donations/`. PayPal 4-cadence subscription buttons (weekly/bi-weekly/monthly/annually) with REPLACE_ME_*_BUTTON_ID placeholders pending operator-side PayPal dashboard hosted_button_id creation (10-step procedure in `<head>` HTML comment) + PayPal.me/JosiahSCooper one-time + cash.app/$evilisanihilis + venmo @Josiah-Cooper-12. Eyebrow `13 · Support`. Inline CSS (~2.5KB). |
| `src/contact/index.html` | Contact tab (K26) — `/contact/`. Formspree free-tier form (action `REPLACE_ME_FORMSPREE_ENDPOINT`; honeypot `_gotcha` field; auto-handled `_subject`) + direct email alias block `REPLACE_ME_DIRECT_ALIAS` pending Cloudflare Email Routing alias `contact@wuld.ink` → `woeinvsdnl@protonmail.com` (NOT `alisendjsc@gmail.com` per K26 lesson xcvi). Eyebrow `14 · Contact`. Both setup procedures in `<head>` HTML comment. |
| `src/chat/index.html` | Chat tab (K26) — `/chat/`. Kiwi IRC iframe embed pointing at `kiwiirc.com/nextclient/irc.libera.chat/?nick=guest_?#wuld-ink` with sandbox `allow-same-origin allow-scripts allow-forms allow-popups` + referrer-policy no-referrer + height 75vh. Fallback block (direct Kiwi link + web.libera.chat link + IRC client list). House rules (informal: disagreement welcome, bad faith removed, 988 crisis hotline referenced). Operator NickServ + ChanServ registration via deployed embed (3-step in `<head>` HTML comment). Eyebrow `15 · Chat`. |
| `src/recommendations/index.html` | Recommendations tab (K26) — `/recommendations/`. 7 sections (Film/Books/Sites/Groups/Work/Art/Media) with 16 placeholder cards (`data-status="placeholder"` → dashed border + opacity 0.55 + `::after " — pending"` label). TOC block with decimal-leading-zero counter + anchor-linked sections (scroll-margin-block-start for header offset). Content fill pending chat-side curation per scope discipline (Cowork builds vessel; chat fills content). Eyebrow `16 · Recommendations`. |
| `src/changelog/index.html` | Changelog page (K43) — `/changelog/`. Client-renders `src/releases.json` into a mono timeline (date + summary + section chips). Notifications panel: RSS subscribe (`/feed.xml`) + nav-glow explainer + Contact/Chat pointer (comment board "planned"). `<noscript>` -> /feed.xml fallback. Standard chrome; eyebrow `Site record`. Authored K30-style + upgraded by the K43 site-wide pass. |
| `src/releases.json` | Changelog single source of truth (K43) — array of `{id,date,summary,sections:[nav-paths]}`, newest-first. Read live by the changelog page + `nav.js` nav-glow. Upkeep: prepend entry -> run `tools/changelog/gen_feed.py` -> commit. `sections` must match nav hrefs (`/essays/`, `/void-engine/`, ...) for the glow to target them. |
| `src/feed.xml` | RSS 2.0 changelog feed (K43) — GENERATED from `releases.json` by `tools/changelog/gen_feed.py`; never hand-edit. Site-wide `<link rel="alternate" type="application/rss+xml" href="/feed.xml">` autodiscovery added to every nav-bearing page head. Register-aligned change-notification (zero PII, no backend). |
| `src/search/index.html` | Site search page (K98) — `/search/`, 16th nav item after Chat, eyebrow unnumbered "Site search". Client-side over `/search-index.json` (fetch no-cache + `?v=K98`); sections Glossary → Pages → Page sections → Void Engine → Plates, CAP 40/section + "+N more"; digit queries route NUMERIC plate equality (K95 parity, Roman I..XXVII + arabic) before the 2-char word minimum; NSFW results text-only + `18+ consent-gated room` badge linking the ROOM (no media in index or results); editorial plates route to the lobby (room-route derived from sub-room page existence, self-healing); escape-on-render; noscript fallback enumerates the nav. Chrome donor = changelog (header delta == exactly the Search anchor). |
| `src/components/site-search.{css,js}` | K98 — search component, loaded ONLY by /search/ (zero site-wide JS delta; assets `?v=K98`). CSS on existing tokens only, zero animation. **K107:** plate results deep-link `route#plate-<id>` (the K105 primitive — lightbox/theater/consent surfacing all gallery-side; index UNTOUCHED, matching logic untouched, test-match 38/38); js `?v=K107`, css HELD `?v=K98`. **K113:** `SECTIONS` gains `{key:"library-objection",label:"Library"}` after `heading`/before `plate`; rowFor adds cross-domain new-tab (`target=_blank rel=noopener noreferrer`) for the ONLY off-site results (the vendored library objections); js `?v=K107`->`?v=K113`, css HELD `?v=K98` (no tier style added); INDEX_URL stays `?v=K98` (no-cache fetch). |
| `src/search-index.json` | Build-GENERATED search index (K98) — regen via `python3 tools/search-index/build_index.py --src src --out src/search-index.json`, never hand-edit. 663 entries (39 pages / 22 glossary / 75 h2 headings / 25 void cats / 502 plates — plates carry id/num/title/series/room ONLY, consent-clean). Deterministic + byte-stable (no timestamps); regen on any page/glossary/void-cat/manifest change (no cache-bump needed — no-cache fetch). Excluded: `/_/` sealed, /search/ itself, templates, the 7 pageless glossary terms. **K109:** `bc35b7c4` -> `36c649ee`/116,250 (sole delta PROVEN = `v3.9.13`->`v3.9.14` ×2 in /argument-library/ page text — the K108a pin-tool locus sweep edited indexed text AFTER K108's invariance proof; ccxxxvii: regen rides EVERY pin move); fresh-filename `search-index.k109.json`. **K112:** `headings()` now harvests **h2 + h3** (archive work titles incl. Hatred / The Point, essay sub-sections, recommendations, Watch videos -- placeholder-card + `destination-title` chrome skipped) AND `strip_blocks` reordered style->script->comment, which recovered the Watch page that a fake `<script>` literal inside a `<style>` CSS-comment had been swallowing (its body, h2 + lede all absent pre-K112); 663 -> 765 entries (75 -> 177 headings, +102 all-heading, 0 removed); `36c649ee` -> `9945e0a5`/128,758; archive + essay h3 carry append-only deep-link ids (`work-<slug>` / section slug); fresh-filename `search-index.k112.json`. **K113:** +81 `library-objection` entries from the vendored `src/library-objections.json` (765 -> 846); `9945e0a5` -> `aa1753b1`/163,457; INVARIANCE proven (build WITHOUT the vendor file reproduces `9945e0a5` byte-exact -> purely additive); fresh-filename `search-index.k113.json`. **K122:** +`right-to-die-objection` entries from `src/right-to-die-objections.json` (846 -> 853). **K127/K128:** RTD corpus grew 7 -> 9 -> 11 (853 -> 858). **K129:** corpus `keywords[]` projected into `library-objection` + `right-to-die-objection` searchable text (gloss + ` · ` + keywords) — 92 entries text-enriched, entry count HELD 858; leg-A invariance == keyword-less vendors reproduce the prior index byte-exact (additive). `ae1cb9d9`/187,645 (858: 502 plate / 178 heading / 81 library-objection / 39 page / 25 void / 22 glossary / 11 right-to-die-objection). |
| `src/library-objections.json` | K113 — VENDORED snapshot of the efilist corpus's 81 OBJECTIONS, exact bytes of the library build artifact `objections-index.json` (generator `build_objections_index.py` lives efilist-side, co-located with `stats_render.py`; generated-only, validator-gated ==81 / id-set==corpus / sorted+unique / deterministic). Shape `{schema_version:1, objections:[{id,title,gloss}]}` — title=corpus `trigger` (the card heading), gloss=corpus `diagnosis` 200-char word-boundary snippet. `build_index.py` reads it -> `library-objection` entries deep-linking `library.wuld.ink/combined#obj-<id>` (cross-domain, new tab; the "Library" /search/ section after Page sections). NEVER hand-edit — re-vendor rides ccxxxvii pin cadence; the append-only anchor covenant (v37.39) keeps a lagging snapshot miss-never-misroute. `f437d5a3`/29,285. **K129:** shape gains an additive-optional `keywords` field (corpus `objections[].keywords` projected via the keyword-projecting generator; schema_version HELD 1 — library-Claude CONFIRMED additive-optional at Exchange 54, rejected the bump). `f437d5a3` -> `82f3cd1f`/41,160. |
| `src/right-to-die-objections.json` | K122 — VENDORED snapshot of the efilist **Right to Die** suite export (`right-to-die/build_right_to_die_index.py`), exact bytes of `right-to-die-objections-index.json`. Shape `{schema_version:1, objections:[{id,title,gloss,keywords?}]}` — title=corpus `trigger`, gloss=`diagnosis` snippet. `build_index.py` reads it -> `right-to-die-objection` entries deep-linking `library.wuld.ink/<surface_route>#obj-<id>` (cross-domain new tab; the "Right to Die" /search/ section after Library). NEVER hand-edit — re-vendor rides ccxxxvii (runs the keyword-projecting generator). **K127/K128:** 7 -> 9 -> 11 objections (RTD corpus v0.3.6/v0.3.7 node-pairs). **K129:** +keywords. `287790bd`/8,354 (11). |
| `src/fonts/README.md` | List of WOFF2 files to drop in + sources (Cormorant Garamond, IM Fell English, EB Garamond) |
| `src/gallery/index.html` | Gallery — `/gallery/` (pre-K22-history build; K83 manifest conversion). Void Engine plates, eyebrow `12 · Gallery`, full placement (nav + LAST homepage destination card), indexed. Client-renders the grid from `manifest.json`; K27 lightbox delegation-adapted (K83); K30 `components/gallery.css` byte-held; dark-only (image grid ≠ heavy-read container). Consent: NSFW toggle routes through a consent interstitial (18+ / AI-generated / no real persons); flagged plates render withheld with NO img element pre-consent (consent-discipline, not security); localStorage `wuld:gallery-consent`; reveal resets per visit. Currently 0 flagged — gate dormant until an NSFW batch lands. **K87 v2:** inline renderer + consent CSS extracted to `components/gallery-room.{css,js}` (page declares its room via `body[data-gallery-category]`); category index block (rooms light up at >=1 plate); video plates (preload=none click-to-play, optional poster, dark 16:9 placeholder); caption tiers full/title/none, cascade plate->category->"full"; consent media-agnostic (no img/video/poster pre-consent); 8 category sub-rooms at `/gallery/<slug>/`. |
| `src/gallery/manifest.json` | Gallery single source of truth (K83) — `{schema_version 2 (K87), media_base (https://audio.wuld.ink — R2 wuld-audio, prefix gallery/), updated, categories[9] {slug,name,caption_tier}, plates[502] (+ category / media {kind,poster?} / caption_tier)}`; per plate `{id, r2key, num, title, technique, body, epitaph, series, order, tier "standard"\|"sealed", content_flags ["nsfw",...], added}`. The admin-CMS Worker (arc sessions 2–3) writes against this. tier "sealed" RESERVED (never rendered in-room); in-room gating = content_flags. Schema doc lives in the gallery page head comment. **K89 (2026-06-08):** +39 NSFW small-room plates across 7 rooms (gap-dweller / gore / mascot-yurei / original-character / other / the-tall-one / the-wrong-thing); 27->66; content_flags ['nsfw'] arms the dormant consent gate; media on R2 wuld-audio/gallery/<slug>/, sources gitignored under images/gallery/nsfw/. **K90 (2026-06-08):** +436 Main Character plates (66->502; 248 img / 188 mp4; 21 captioned, 415 caption_tier 'none'); 442 staged files deduped to 436 (6 byte-identical: 2 root/sub same-stem + 4 OS '(1)' re-downloads, md5-verified); flat r2keys gallery/main-character/<stem>, Sexual/ + Sexual/Vile/ flattened; consent gate covers the room. **K96:** schema gains OPTIONAL per-plate `print_url` (additive, renderer-read; Worker allowlist pending admin arc 4); manifest bytes UNTOUCHED at K96. **K97:** `featured: true` (16th key, additive boolean, absent unless true) onto the 12 batch-01 picks; serializer parity proven; `a7391f45`/277,405 -> `0425955d`/277,693; updated -> 2026-06-09. **K100:** MC `order` re-sequenced for visual flow (248 images palette-chained, 188 videos trail 249..436; num HELD; field-only, array untouched; parity-proven on the b628e75 Worker shape); `3603a2bb`/278,414 -> `19436a31`/278,414. **K102:** all 191 video plates gain `media.poster` (`gallery/<room>/posters/<id>.webp`; additive field-only; parity-held on the post-lane `88781e41`/278,772 base, print_url 13) -> `f8008816`/294,969; updated -> 2026-06-09. **K107:** MC video `order` re-sequenced within 249..436 (poster palette chain, darkest-seed greedy + 2-opt; field-only — num/array/images/other-rooms held; parity-proven on the fresh origin bytes) `a7d19b22`/295,622 (rebased once mid-close on the round-5 plate-12 drop) -> `958b978c`/295,622; updated -> 2026-06-10; shipped via fresh-filename `manifest.k107.json` + operator Move-Item (ccxxxvi). **K109:** +42 additive image-plate `video: "<video-plate-id>"` pairing fields (operator-confirmed via the checkbox-sheet gate; end-of-object append, field-only, parity-proven on `13f74f15`; partners all same-room; `updated` HELD) -> `f3bb2e99`/297,821, shipped fresh-filename `manifest.k109.json`. |
| `src/components/gallery.css` | Gallery component CSS (K30 era, pre-K22-history) — grid, plate cards, caption stack, broken-img placeholder, NSFW hide/reveal contract (`body[data-nsfw-revealed]` + `.gallery-plate[data-nsfw="true"]`), lightbox. Byte-held through K87. |
| `src/components/gallery-room.{css,js}` | K87 — shared room renderer + chrome (consent interstitial, withheld cards, category index block, video cards, sub-room back link). JS parameterized via `body[data-gallery-category]`; caption cascade plate->category->"full"; lightbox images-only (videos = native controls); index block renders only >=1-plate rooms (dormant till the K88 ingest). **K94:** controls bar above the grid — search (LOBBY = all-rooms scope incl. withheld pre-consent results; non-lobby room >12 plates = room scope) + Main Character series chips (non-lobby room with >=2 non-empty series; single-select + All, per-chip counts); re-render-on-filter (the K27 lightbox grid-delegation survives the rebuild); lightbox reads num/title/id off card data-* (caption-"none" plates carry metadata) + surfaces the plate id; `?v=K94`. **K95:** per-plate star favorites (`wuld:gallery-saved`; figure-corner `.gallery-star` `<button>` on plate + withheld cards, id-based, pre-consent-safe) + `Saved (N)` controls-bar toggle on every page (scope-restrict, composes AND with search, clears the series chip); plate-number search (pure-digit / `plate NNN` / `#5` → numeric `numToInt` match — editorial Roman `I..XXVII` + arabic `001..436` — killing the id-hash digit-noise); JS-injected lightbox randomizer (`[ random ]` + `r` key); `?v=K95`. **K96:** optional per-plate `print_url` buy-link — `[ acquire print ]` link-out (target=_blank, noopener-noreferrer-nofollow; NEVER on withheld cards — consent discipline), dormant until manifest URLs land; `?v=K96`. **K99:** caption disclosure (full-tier bodies >200 chars fold behind a mono `[ more ]`/`[ less ]` toggle; title/num always visible; lightbox unaffected) + lobby-only Prints section keyed on `print_url` PRESENCE (featured-first then room/order; consent contract held; hidden while search/saved results show) + lightbox `lbScope` (a Prints-card open navigates within the Prints set) + star multi-instance sync; `?v=K99`. **K101:** video section — videos render in their OWN sub-grid below the image grid wherever media kinds mix (mono divider `Videos — N`, hides at 0; chips/search/Saved span both sections; flagged videos withheld pre-consent — no video element, no poster in the DOM; lightbox images-only held; sub-grid binds star+caption delegation, never lbCardClick); `?v=K101`. **K103:** media-kind access chips -- `all / images / videos N` chip row (`#gallery-mediachips`, built only where scope mixes kinds: MC + gore + twt + lobby); `FILTER.media` composes AND with search + series + Saved (single mutation site, nothing clears it, it clears nothing); videos-active empties the image grid so the annex renders at top of results; consent withheld path kind-agnostic HELD; **CSS BYTE-HELD** (chips reuse `.gallery-chip`; `.gallery-mediachips` is an unstyled hook) -> js-only bump `?v=K103`. **K104:** video theater — card videos lose inline controls; click opens a JS-injected theater (dim backdrop + LOOP + close/arrows/random + plate-id caption; the lightbox chrome classes under theater-own ids; stage video created on open, torn down on close AND every nav — one playing at a time; scope = the originating sub-grid, videos or Prints; Esc/arrows/r; withheld cards cannot reach it — K87 held; images-lightbox code byte-held) -> bump BOTH assets `?v=K104` ×9. **K105:** sticky NSFW reveal (`wuld:gallery-reveal`; boot = `hasConsent() && storedReveal()` — consent PRIMACY, K87 held) + per-plate share/deep links ([ share ] in lightbox + theater chrome — `.gallery-lightbox-random` base class + OWN offsets, the base is absolutely positioned; canonical `/gallery/<room>/#plate-<id>`, editorial -> `/gallery/`; replaceState hash on open/nav, cleared on close; routeHash post-render — video->theater, image->lightbox, flagged+unrevealed -> scrollIntoView the withheld card ONLY) + lobby gate placement (Prints inserts BELOW the NSFW bar — K99 had stranded the toggle under Prints; lobby status counts flagged across ALL rooms, 475 today) -> bump BOTH `?v=K105` ×9. **K106:** pagination + browse-all + UX bundle — K106-PURE (PAGE_SIZE 60 / pageCount / clampPage / pageSlice / pageOfIndex / lobbyPrintsFilter); displayList (images-first, videos-trail — render slices it, routeHash page-locates against it); mono pager top+bottom (`[ prev ] page N / M · total plates [ next ]`, hidden <=1 page); FILTER gains page+browse (page resets ×5 on filter change, clamps in render; browse = lobby-only `[ browse all N ]` chip, ORs into hasFilter so routing chrome hides); routeHash page-locates BEFORE card lookup; Track A — flagged deep link surfaces openConsent() for never-consented visitors (purposeful hide stays scroll-only), consentYes chains routeHash(); `[ top ]` fixed button past 1.5 viewports (instant, passive); lobby Prints strip excludes editorial via lobbyPrintsFilter at the renderPrints call-site (printsSet PURE held) + aside re-worded -> bump BOTH `?v=K106` ×9. **K107:** browse-all room-blocked — `roomBlockCmp` (NEW K107-PURE region; two-key: CAT_ORDER block rank, then `order`) applied per kind segment in displayList under `FILTER.browse` (editorial leads, rooms follow manifest category order; images-first/videos-trail held); js-only bump `?v=K107` ×9 (css BYTE-HELD). **K109:** paired-video affordance — image plates carrying manifest `video:` render a star-adjacent mono `[ mp4 ]` button (consent-held ×2: button exists only when the partner is renderable, and withheld cards never carry it); click opens the K104 theater on the partner — live-card scope where one is rendered+visible, else a detached INERT offscreen holder (singleton scope; offsetParent non-null by construction, thVisible() requires it); document-level delegation (star pattern, stopPropagation); bump BOTH assets `?v=K109` ×9. **K110:** controls-first — buildControls inserts BEFORE the static NSFW gate on every page (gate directly below the bar; lobby gate block moved above the rooms index, length-conserved); Prints insertion RE-KEYED to the GRID anchor (the K105 nsfwBar anchor died with the move) + collapsed-by-default band (`Prints — N available` + [ expand ] + [ storefront ] -> wuld.printful.me, K96 recipe; strip renders only while EXPANDED — no hidden-img fetches; no persistence) -> bump BOTH `?v=K110` ×9. |
| `src/gallery/<cat-slug>/index.html` | K87 — 8 category sub-room shells (gap-dweller · gore · main-character · mascot-yurei · original-character · other · the-tall-one · the-wrong-thing), ~9.9 KB each, chrome spans inherited verbatim from the main page; INDEXED (the gate is consent, not secrecy — K83 posture); same nsfw bar + consent dialog + lightbox markup; the shared renderer does the rest. |
| `docs/admin-wuld-ink-operator-guide.md` | K87 operator handout (K35 class) — admin.wuld.ink login + status semantics, gallery ops vs schema v2, site-edit ops + OFF-LIMITS pin loci, failure table, PAT rotation (due Sep 04 2026), posture locks, bulk-ingest = K88 lane, regular-Claude paste-load preamble. |
| `docs/print-storefront-research.md` | K96 print/poster storefront vendor screen (decision doc) — 16 vendors/labs vs the two hard screens (AI-adult-content AUP · K83 payment lock). Verdict: FourthWall = T1/SFW lane (FourthWall MoR, Stripe→bank only, PayPal not a payout option), Printful Quick Stores = T2/artistic-nudity lane (Printful seller of record, posters exempt from its nudity restrictions), Redbubble = T2 alternate (mature flag + US bank payout), T3 = do-not-sell (all checkout-bearing platforms ban; WhiteWall/Mixam = print-only fallback, rail unsolved), T4 per-plate. Durability rider: processor purges (Gumroad 2024, Steam/itch 2025). Operator runway + dormant scaffold documented in-doc. |
| `docs/baton-template.md` | Cross-project synthesis template Josiah carries between project chats; feeds session B's IA + glossary work |
| `docs/library-claude-coordination.md` | Cross-Claude relay doc between wuld.ink Cowork and library-Claude. Append a new dated Exchange section per round. Locks agreements + open pushes per item (confirm/nudge/reject format). |
| `docs/mascot-claude-coordination.md` | Cross-Claude relay doc between wuld.ink Cowork and the W.U.L.D. mascot project (FIFTH relay channel; opened K109). Exchange 1 = their Phase-3.4 questionnaire + our answers folded VERBATIM (source `D:\mascot-collab-answers-2026-06-10.md` `f861aa3c`/6,450). Locks pending their confirm: `wuld:yurei` key RESERVED · exorcism = ×3 consecutive no-dwell completions · a11y opt-out renders ONLY activated (plain language) · VP9-alpha + still fallback, NO HEVC v1 · desktop-only >=900px · fragments = site-side DOM layer (EB Garamond by inheritance). Trigger lock OURS. **K110:** Exchanges 2+3+3a folded VERBATIM (their CONFIRM sweep + our CONFIRM ×5; Q4 manifest NUDGE ANSWERED same-day in manifest_v0.json — md5+size_bytes+schema_version+px; fragmentPool TAKEN; WATCH split-origin geometry locked — radii from box center, angle+dead-zone from anchorPx; v1 surfaces = heavy-read pages ONLY, gallery/search/void-engine EXCLUDED). Deliverable set 1 + placeholders + manifest_v0.json LANDED in D:\mascot\ — dev-flag harness stub + batched §-review = staged K-session (never live; mandatory swap at their Phase 3.6). |
| `docs/book-claude-coordination.md` | Cross-Claude relay doc between wuld.ink Cowork and book-project Claude. Append a new dated Exchange section per round. K → Exchange 1 (wuld.ink-side: baton ratifications + (ii) collapse + Lacero forced question + canonical-shift discipline forced question). K3 → Exchange 1 response (book-Claude side: NUDGEs + locks). K3 → Exchange 2 (wuld.ink-side: closures + ratifications + round closes). |
| `docs/successor-claude-coordination.md` | Cross-Claude relay doc between wuld.ink Cowork and successor-Claude (Successor Protocol / Ne Hoc Fiat project). Fourth relay channel in the umbrella's coord-doc family. K8 close → Exchange 1 (wuld.ink-side asks). K9 (2026-05-14) → Exchange 2 reply (successor-Claude side: A confirmed with archive-trigger NUDGE accepted; B confirmed with Contextus listener-class nudge + Lacero meta-entry-or-no-entry opinion; C option (a) locked + lede + status text supplied; D confirmed with Protecting-class absence → (c) NUDGE accepted; 7 paste-relay bodies attached) + Exchange 3 ack (wuld.ink-side: all locks accepted; K9a shipped glossary body fills; K9b ships HTML mirror + /ne-hoc-fiat/ page). |
| `src/ne-hoc-fiat/index.html` | Ne Hoc Fiat project page (session K10, 2026-05-14) — first project-shaped page on the umbrella. Pattern-matched to `/book/` shape minus cover image + purchase block (project is in-development, no purchasable artifact yet). Page-hero (`09 · Project` eyebrow + Latin title + English subtitle "Let this not be done" + author line) + lede (paste-relayed verbatim from successor-Claude Exchange 2 Section C, ~50 words) + status section (paste-relayed verbatim, ~75 words: modal-architectural pessimism + empirical asymmetry argument + structural-absence pair) + outline placeholder + approved-excerpts sign-off-gated scaffold + cross-references (7 glossary entries + 3 sibling-surface links) + discreet `.sp-aside` at bottom (K3 `.frame-pointer` pattern, mono label + accent-bordered single-sentence body) pointing at gated `/_/successor-protocol/`. New inline CSS (`.project-title-block`, `.project-subtitle`, `.project-author`, `.project-section`, `.project-section-heading`, `.project-section-placeholder`, `.sp-aside` variants); promote to `/components/page.css` on second project-shaped page per second-instance-threshold. Cowork relays authoritative content from successor-Claude; zero net-new philosophical content authored. |

| `tools/wuld-gui/` | Local Flask app (K35) for the 7 mechanical site-edit patterns (add video/image/recommendation/essay cards, text-swap, cache-bump). `app.py` (Flask routes + helpers, 351 lines) + `ops.py` (per-pattern transforms, 425 lines) + `templates/` (Jinja2 base + index + parametric form + preview + result + status; mono register, dark mode, no JS). Run via `cd tools/wuld-gui && python app.py` → `localhost:5000`. Verify-don't-make-worse on writes (preserves pre-existing tail invariants per K34 carry). Smoke-tested 10/10 ops against real `src/`. |
| `tools/changelog/gen_feed.py` | RSS generator (K43) — reads `src/releases.json`, writes `src/feed.xml` (RSS 2.0, RFC-822 dates, atom:self). Run from repo root per release: `python3 tools/changelog/gen_feed.py`. Deterministic, no network. The only build step the changelog system needs; page + nav-glow read releases.json directly at runtime. |
| `tools/search-index/` | K98 — `build_index.py` (deterministic index generator, see `src/search-index.json` row) + `test-match.js` (**K113: 50-test** regression (44 priors + 6 library-objection legs: consent-incoherent route, cross-domain combined anchors, Library-section order/label; the 3 content legs FAIL on a pre-K113 index = non-tautological): `node tools/search-index/test-match.js src/components/site-search.js src/search-index.json`. **K113:** `build_index.py` gained a `library-objection` source reading `src/library-objections.json` (graceful skip if absent/malformed). Run both per index rebuild. The library EXPORT generator `build_objections_index.py` lives in the efilist repo, not here. **K122:** + a `right-to-die-objection` source (reads `surface_route` off `src/right-to-die-objections.json`); test-match 50 -> 56. **K129:** `build_index.py` `be84f58d`/11,682 folds vendored corpus `keywords[]` into the searchable text of BOTH objection types; test-match 56 -> **64** (`9df2f456`). The RTD export generator `right-to-die/build_right_to_die_index.py` also lives efilist-side. |
| `tools/gen_sitemap.py` | Deterministic sitemap generator (K222, audit F2). Walks `src/**/index.html` minus `_`-segments / robots-noindex / `wuld-search`-excluded / SKIP (`/search/`); lastmod = `git log -1 --format=%as` per page (never the build clock — dual-boot rule in-code); KNOWN changefreq/priority matrix + rules for future pages, so admin-created blog/essay/media pages join the sitemap at the next regen. `--check` = drift gate. Run per page-add: `python3 tools/gen_sitemap.py --repo . --out src/sitemap.xml`. |
| `tools/print-pipeline/` | Print/poster batch pipeline (K97). `stage_batch.py` `pull` resolves ORIGINALS FIRST (content-hash stem match under `C:\Users\y_m_a\Downloads\AI Images and Videos`; name-only os.walk index, code-env dirs pruned; public-R2 fallback; idempotent HAVE-skip) into `D:\print-staging\<batch>\in\` as `<id>.<ext>`; `verify` matches Upscayl outputs by stem-prefix, gates long edge >= `--min-edge` 8000px + per-plate DPI ceilings. README: workflow, Printful catalog VERIFIED LIVE 2026-06-09 (luster id 171 squares 10x10-24x24 base $10.20-22.44; editorial plates are PORTRAIT 1792x2400 ~ 3:4 -> 12x16/18x24/24x32 line), pricing 2.5-4x, Quick Store runway (handle wuld-ink, BANK-only payouts), T-gate + K83 locks. Batch JSONs live on D:\ (print-batch-01 = the featured 12; print-batch-02-review = the other 219 starred). **K99:** verify scans out/ RECURSIVELY (Upscayl nests outputs in upscayl_png_<model>; print-ready-* excluded) + Image.MAX_IMAGE_PIXELS=None (16384-px masters) + downscale subcommand (long-edge cap, default 8192 -> print-ready-<edge>/, --format jpg --quality 95 for hard upload caps); module docstring now RAW (Windows paths -- the \u/\b escape hazard, ccxxviii). **K103:** `emit_kit.py` NEW -- deterministic zero-network publish-sitting kit emitter (post-RED surviving automation): worksheet `D:\print-ladder\publish-input.json` (schema 1) -> `D:\sitting-kits\sitting-NN.{md,tsv}`; ELIGIBLE-only minus ledger non-OK minus shipped (id on an outcomes line carrying http\|commit), worksheet order, N=10; idempotent, no state file -- outcomes growth IS the cursor; kit date from worksheet.generated (never the clock); trap hard-rules header verbatim incl. rule 9 (FIT placements default WHITE bands, round-2 XI precedent). **K104:** shipped belt gains the BLOCK rule — a `PRODUCT N/ <token>` block carrying http/commit excludes the plate its HEADER names (Roman -> plate-NN- prefix; header-only, in-block prose never excludes; blocks end at next header/`## `/col-0 line); the round-3 doc shape defeated the line rule, caught by the K104 dry-run mandate. |
| `workers/comments/` | Comment board backend (K44; NOT deployed -- operator standup K45 via its README). Standalone Cloudflare Worker + D1. `wrangler.toml` (DB binding + routes `wuld.ink/api/*` + `wuld.ink/admin*` + ACCESS_* vars), `schema.sql` (comments: id/board/name/email/body/created_at/hidden/ip_hash), `src/index.js` (router: public `/api/comments` GET+POST with honeypot + 5-per-min salted-ip-hash rate-limit + length caps + store-raw; Access-gated `/admin` mono moderation UI + `/api/admin/{hide,unhide,delete,edit}`; JWKS RS256 Access-JWT verify + same-origin CSRF; email PRIVATE, never in public GET, droppable via ALTER TABLE), `README.md` (operator runbook). One global board at `/chat/`. **K220:** the MODERATION surface is duplicated into the admin worker (same D1 via COMMENTS_DB; /api/cmod/* + section 14 at admin.wuld.ink — one auth). This worker keeps the PUBLIC board routes; its /admin UI + /api/admin/* stay live until the operator parity check, then retire (302 + optional 410; guide §12). NOT deployed at K220. |
| `workers/admin/` | Gallery admin CMS Worker (K85; LIVE since K85c — admin.wuld.ink, Access-gated, smoke 4/4). Own custom domain `admin.wuld.ink` + own Access app (comments worker owns `wuld.ink/api/*`+`/admin*` — no overlap possible). `wrangler.toml` (GALLERY_BUCKET→wuld-audio prefix gallery/; ACCESS_AUD wired K85b) + `src/index.js` (FAIL-CLOSED JWKS RS256 — no weak fallback; email==ADMIN_EMAIL; same-origin CSRF; rate belt; upload→R2: webp/png/jpeg allowlist + magic-byte sniff + 25 MiB cap + key sanitize + head-before-put overwrite guard; manifest add/update/flag/delete via GitHub Contents API sha optimistic-concurrency retry-once, ONE commit per action `gallery-admin: <op> <id>`, UTF-8-safe base64; add blocks on absent R2 object unless force; delete needs confirm==id; mono dark delegated-listener UI) + `package.json` (ESM) + `README.md` (runbook: Access app → AUD → fine-grained PAT → secret → deploy → 4-step smoke → bulk-ingest + failure table). Write contract = the gallery page head-comment schema. **K86 SITE-EDIT vertical:** `/api/site/preview`+`/api/site/commit` (diff-confirm, sha-pinned, 409 stale_preview, NO silent retry — the confirmed diff is the diff that lands) porting wuld-gui ops.py patterns — video-watch · rec-card · text-swap · cache-bump (`paths`-scoped; Git Data API one-commit sweep + ref CAS; `SITE_SWEEP_MAX` guard vs the free-plan subrequest budget); UI sections 4–7 + diff-confirm panel; transforms byte-parity-proven vs ops.py on real src/ copies. **K87 GALLERY v2:** manifest schema PINNED 2; category (validated against manifest.categories) + media {kind, poster?} (normMedia: kind allowlist, poster prefix+traversal) + caption_tier editable on add/update (media object-safe in the patch switch); mp4 joins ALLOWED_TYPES + ftyp magic sniff (sniffImageType -> sniffMediaType); UI form/reset/populate/submit wired for the 4 new fields. **K97:** plate add/update gain `print_url` (https-guard; empty CLEARS) + `featured` (strict boolean; stored only when true — delete-semantics keep additive fields absent-unless-set); editable allowlist +2; form row `pf-printurl`+`pf-featured` + populate/reset/submit; `9e8a51cd`/70,988 -> `0f54b8c6`/72,560; .mjs parse gate; DEPLOY = K97 operator runway (`npx wrangler deploy`), MAX-deadline-driven. **K114:** the partial-UPDATE path no longer requires `title` (empty title is a legal manifest state -- 415 of 502 plates are caption-tier-none MC plates; the old check 422'd every `print_url`-only drop on an untitled plate, forcing the round-6/7 `508f113`-class manifest-fallback commits); the ADD-path guard (`if (!title)`) is UNTOUCHED. `video` joins the editable allowlist (known-plate-id OR empty-clears; delete-semantics; looked up in the loaded manifest) + a `pf-video` form row (populate/reset/submit/common), so the 42 photo->video pairs are CMS-editable (they survived updates before but a direct `video` patch 422'd as unknown). `0f54b8c6`/72,560 -> `55e614dc`/73,418; .mjs `node --check` gate; DEPLOY = `npx wrangler deploy` (operator-side, SEPARATE from the Pages push -- Pages does not deploy the worker). **K120:** +3 site-edit CARD patterns (archive-video / archive-image / essay-card; byte-parity ports of ops.py 1/3/5) as `/api/site/*` diff-confirm endpoints + UI sections 8/9/10 + siteCollect branches (preview/commit + the delegated `.site-prev` listener already pattern-generic -> zero change there) + an OPT-IN Access service-token path (verifyAccess accepts a signed JWT with `common_name` matching `env.ACCESS_SERVICE_TOKEN_CN` + no email -> non-interactive admin, `gate.service=true`, same-origin CSRF skipped for service auth; absent the env var = today's behavior byte-for-byte). 5/5 ops.py parity proven on real src; node --check; `55e614dc`/73,418 -> `9d4c31bb`/83,323; DEPLOY = `npx wrangler deploy`. **K212:** +2 CONTENT verticals `blog-post` + `essay-page` — TWO-file ops (NEW page + index card) as ONE Git Data API commit (ref CAS); page chrome GRAFTED at op time from LIVE donors (/blog/the-easiest-case/ + /essays/architecture-of-moral-disaster/) so new pages are born chrome-current (the ?v sweeps maintain the donors — no embedded-template fork for sweeps to miss); occurrence-counted donor guards 422 loud on drift; md-lite body (blank-line paragraphs, bold/italic/links; essays: `## Heading` -> Section I/II... roman eyebrows via the gallery romanize); optional figure+source (blog) / audio band + auto reading time (essay); UI sections 11+12 + siteCollect branches + multi-preview gains per-file notes + the index diff excerpt. sitePlain gate (values cross HTML+JSON-LD: no <>"&\). `9d4c31bb`/83,323 -> `34410de1`/108,045; node --check + 65/65 render-sim on real src bytes; DEPLOY = `npx wrangler deploy` (ALSO the first deploy since K114 -> lands the K120 sections 8-10 + service-token path, pending since K120). **K213:** UI redraft (adminHtml + UI script ONLY; zero endpoint/transform bytes): sticky mono jump bar (14 anchors); the 12 tool sections collapse to `<details class="tool">` (all-collapsed default; open-state persisted in localStorage `wuld-admin-open`; hash/jump-click auto-open; plate-EDIT auto-opens the form section); plates table paginated 25(default)/50/100/all + live filter (id/title/series/num/flags/category/tier) + range counter + visually-hidden caption + aria labels; scroll-margin under the sticky bar; reduced-motion-gated smooth scroll. `34410de1`/108,045 -> `9539e0fe`/114,859; node --check + 26/26 rendered-UI structural gate (adminHtml CALLED with stub env; the EMITTED script re-parsed via new Function — the template-literal escape layer gated at the real output). DEPLOY = `npx wrangler deploy`. **K214:** legibility pass — every panel font-size x1.5 (body 13->20px, h1 15->23, h2/table 12->18, label/log/hint/diff/rowbtn/tablebar-span 11->17, th/jump 10->15; form controls font:inherit ride body); zero structural/JS/endpoint changes. `9539e0fe`/114,859 -> `541d8e22`/115,084; node --check + 33/33 (re-run 26 structural + 7 size asserts incl. no-residual-sub-15px). DEPLOY = `npx wrangler deploy`. **K220:** MEDIA vertical + COMMENTS consolidation (see the K220 stratum) — +MEDIA_BUCKET/COMMENTS_DB bindings; /api/media/* (R2 multipart pipes: put / mpu-init / mpu-part [streamed, rate-belt-exempt] / mpu-complete [range-sniff, delete-on-mismatch] / mpu-abort / item ops vs tools/media-manifest.json) + /api/cmod/* (byte-parity SQL vs workers/comments); site patterns media-publish / media-unpublish (donor-grafted /watch/<id>/ page + hosted card + manifest flip, ONE commit; unpublish deletes via tree sha:null — ghMultiCommit extended); UI sections 13+14, jump bar 16, a11y belts (rowbtn ~38px, aria-live log, focus-visible, lazy section loads); CSP +media-src. `541d8e22`/115,084 -> `ee90942e`/174,412; node --check + 68-assertion gate (real-byte render sims, watch-index add->remove BYTE ROUND-TRIP, emitted-script re-parse, SQL parity). DEPLOY = `npx wrangler deploy` (lands the new bindings). |
| `src/components/comment-board.{css,js}` | Comment board frontend widget (K44), mono/neobrutalist site chrome. JS feature-guarded `BOARD.live` -- DORMANT until K45 (section `hidden`, /chat/ renders unchanged). Fetch+render newest-first; optional name + optional private email + honeypot; escape-on-render (XSS). Flips the IRC CTA to a demoted "for live chat" affordance via `body.board-live` when live. Cache-bump `?v=K44`->`?v=K45` on go-live per K26 xcvii. |
| `docs/wuld-ink-non-cowork-guide.md` | Standalone instructions handout (K35) for regular claude.ai when Cowork unavailable. ~580 lines / 24 KB. Covers (i) path selector GUI-vs-handout; (ii) 7 mechanical pattern templates with anchor regex; (iii) 8 handout-only patterns (essay/glossary/blog body authoring, eyebrow classification, disclaimer text, cross-link routing, new page scaffolding, paste-relay from cross-Claude coords); (iv) full discipline corpus K22-K34 (K22 vii / K27 ci / K28a cxiii / K28 cviii / K31 cxxviii/cxxix/cxxxiv / K33 cxlviii/cl / K34 cli/clii/cliii / K34a clv/clvi / K26 xcvii / K24q); (v) canonical atomic Python pass shape; (vi) git workflow + index-recovery PowerShell block; (vii) post-deploy verify smoke. Self-contained; paste-load into regular Claude alongside edit request. |

---

## Scope: what Cowork is for vs not for

### Cowork is FOR (most build work):

- Design system: typography scale, color tokens, spacing rhythm, component library
- HTML/CSS/JS implementation across all pages
- Audio player component + `data-audio-key` wiring to R2
- Build tooling, GitHub repo init, Cloudflare Pages config, DNSSEC enable
- Iterative debug/fix/refine cycles
- File reorganization, find-and-replace, structural lookups
- R2 bucket setup, custom subdomain (`audio.wuld.ink`) config

### Cowork is NOT FOR (defer to chat):

- Drafting essay or blog **content** (philosophical writing)
- Generating glossary entries (vocabulary curation)
- Drafting Void Engine prompts (semantic content authorship)
- Major architectural pivots (re-locking the stack, swapping registrar)
- Anything that would update the **efilist** project's canon (different project) — **EXCEPTION (ratified K48-close, 2026-06-01):** rebuttal-strengthen foldins that *ship to live + need a wuld.ink pin move* are routed to wuld.ink Cowork **end-to-end**. The deploy tail (`verify-live-library.ps1` + `tools/library-pin.py --apply`) is wuld.ink-exclusive, so splitting push-from-pin across projects creates the seam that stalls the chain; one project end-to-end = atomic. Corpus-internal / no-pin work (compaction, validator runs, schema migration) stays with the Argument Library project; MAX authoring (philosophy, cold-grade) stays in-chat. One-deliverable-per-session still holds.

Rule of thumb: **Cowork builds the vessel; chat fills it with content.**

---

## Register and working norms

- **Direct.** No hedging, apologies, sycophancy, "great question" openers.
- **Iconoclastic framing welcome** where it earns its keep.
- **Disagree substantively** — don't flatter, push back where the user's logic has gaps. Concede only to superior argument.
- **No menus.** Recommendation first, then supporting reasoning.
- **Concise.** Josiah reads without prescription glasses currently — keep blocks short, scannable.
- **Pre-flag token-budget risks.** Multi-session arc; sessions that may hit ceilings mid-build should be re-scoped, not pushed through.

---

## Aesthetic register (LOCKED — applies to all visual decisions)

- **Mode:** Neobrutalist dark-mode (canonical). Reader-mode (warm-cream light) and high-contrast (HC) modes are SCOPED accessibility affordances on heavy-read containers only — not site-global theme switches.
- **Typography (book-matched):** Three serif faces mirroring Josiah's book + IBM Plex Mono retained for UI chrome only.
  - **Cormorant Garamond** (Christian Thalmann) — `--font-display`: homepage hero, title-page, book-cover register.
  - **IM Fell English** (Igino Marini) — `--font-headline`: h1, h2 essay/section titles.
  - **EB Garamond** (Georg Duffner) — `--font-body`: body text, h3-h5 subheadings.
  - **IBM Plex Mono** — `--font-mono`: eyebrow labels, audio readouts, mode-toggle buttons, code, metadata, footer, nav. The "manufactured object" signal (running heads, colophons, page numbers in literary-press parlance). **Also the cross-surface anchor** between wuld.ink (where Mono = chrome) and `library.wuld.ink` (where Mono = everywhere, the instrument-panel diegetic skin). The Mono spine is the typographic constant across the umbrella; non-chrome typography diverges by design (serif on wuld.ink for content register; mono throughout on library for instrument register).
  - All three serifs self-hosted via `@font-face` with `local()` first in the src chain (renders Josiah's installed copies immediately, falls through to WOFF2 in `src/fonts/` for web visitors).
  - Root font-size bumped to 18px (`html { font-size: 112.5% }`) to compensate for Garamond's small x-height — also serves Josiah's no-glasses reading constraint.
- **Palette:** Three modes keyed on `[data-mode]`:
  - Dark (default): near-black `#0a0a0a`, warm off-white `#f0ebe5`, blood-red accent `#c41e3a`.
  - Reader: warm cream `#f5efe6`, dark warm-gray text `#1a1816`, darker accent `#a91930`.
  - HC: pure black/white, lifted accent `#ff4060`, yellow focus ring `#ffeb3b`.
- **Future axis:** `data-palette="cb-*"` reserved for colorblind-safe variants (deutan/protan/tritan).
- **Influences:** Risograph print, zine culture, underground photography (Paul Clipson), analog/experimental.
- **Reject categorically:** SaaS landing-page aesthetics, pastels, gradients, drop shadows, rounded soft corners, Material Design, generic AI design.

Visual anchor reference: `alisendjsc-crypto.github.io/efilist-argument-library` (do NOT inherit its patterns — reconcile to the wuld.ink token system in session C).

---

## Current state (as of 2026-06-24, post-K130 close)

**Status:** Sessions A → K95 complete. v3.9 line CLOSED at v3.9.4 (band-true revert K72); maintenance/correctness pins since: v3.9.5 graph-view legibility (K73), v3.9.6 dep-graph de-clutter (K74), v3.9.7 axis-legend reconcile (K76), v3.9.8 dep-panel calibration + masthead de-version (K78), v3.9.9 consent-annotation edge-count reconcile (K79), **v3.9.10 DEP_REVIEW_NOTES current-rider sweep (K80 — SHIPPED; TWO ORDERED PS blocks landed same-day at K80a: efilist `f0ccb25`, wuld-ink `3347718`)**, **v3.9.11 legible dep-review-note fix (K82 — SHIPPED; TWO ORDERED PS blocks landed same-day at K82a: efilist `e88aea2`, wuld-ink `69245e2`)**. **v3.9.12 jsx MechanismWeb resync (K84 — SHIPPED; TWO ORDERED PS blocks landed same-day at K84a: efilist `8252cf6`, wuld-ink `811831b`)**. At K84 close: jsx `f2f46efa`→`029a91d8`/1,265,927 in-tree (35/81/140, masthead render-from-data); combined BYTE-HELD `c436e720`/2,945,490 — first version-only pin (pin.old == pin.new; library-pin.py gate patched for the byte-identical class, `516ad53d`); canon 37.36→37.37 `2e001e86`/242,719; pin v3.9.12 LIVE (pin==live; byte-identical class proven at apply); next_rec = EMPTY/maintenance HELD; CLAUDE.md trimmed (K67–K74 → history, 61,627 B); K85 shipped the `workers/admin/` gallery-CMS vertical; K85b+K85c stood it up and smoked it 4/4 GREEN same-arc (admin.wuld.ink LIVE, Access-gated, first CMS commit landed); K86 shipped the SITE-EDIT vertical (ops.py 4-cut as /api/site/* diff-confirm endpoints + forms; deploy rides the K86 PS block); K87 shipped the gallery-v2 vessel (manifest schema v2 + 8 category rooms + video plates + caption tiers + Worker pin + operator guide); K89/K90 shipped the gallery NSFW + Main-Character ingests (66->502 plates); K91 diagnosed the dep-graph 66-vs-67 drift; **K92 SHIPPED the dep-graph render-from-data fix (v3.9.13; canon v37.38; combined `c436e720`->`8e0d823f`/2,946,927; pin moved).** **K93 (wuld.ink-native, no pin) shipped the Void Engine wholesale substitution (334->397 entries / 19->25 categories; `src/void-engine/index.html` `4f547a52`/551,294 -> `9605507153`/646,828), fixed the gallery hero plate-count (editorial-only 27 -> corpus-derived 502/9 rooms), and synced the operator + non-Cowork docs.** K94 shipped gallery navigability phase 1 (all-rooms lobby + per-room search, Main Character 18-series chips, plate id in the lightbox); K95 (wuld.ink-native, no pin) shipped phase 2 — per-plate favorites (localStorage star + `Saved`-toggle filter, every page), plate-number search ("1"/"001"/"plate 001" → numeric match across rooms, Roman editorial included), and a lightbox randomizer (`[ random ]` + `r`). **K96 (2026-06-09, wuld.ink-native, no pin) ran the print-storefront vendor research (docs/print-storefront-research.md — FourthWall = T1/SFW lane; Printful Quick Stores = T2/artistic-nudity lane; T3 explicit unsellable on every checkout-bearing platform screened; six load-bearing claims re-verified live 2026-06-09) and shipped the DORMANT per-plate `print_url` buy-link scaffold (`?v=K96`; manifest untouched).** **K97 (2026-06-09) shipped print-pipeline phase 1 — featured 12 + originals-first stager (`tools/print-pipeline/`) + the admin Worker print_url/featured lane (DEPLOYED at K97a; admin.wuld.ink self-serve links live).** **K98 (2026-06-09, wuld.ink-native, no pin) wired SITE-WIDE SEARCH — `/search/` page + `/search-index.json` (663 entries, regen-deterministic `bc35b7c4`) + the Search nav anchor across all 63 nav-bearing pages; component loads only on /search/.** **K99 (2026-06-09, wuld.ink-native, no pin) shipped gallery caption disclosure ([ more ]/[ less ] past 200-char full-tier bodies) + the lobby Prints section (print_url-keyed, featured-first, consent-held — Ophelia is its first card) + the stage_batch K99 bundle (recursive verify / bomb-guard lift / downscale helper).** **K100–K104: MC visual-flow order (K100) · video section (K101) · posters ×191 (K102) · media-kind chips + kit emitter (K103) · VIDEO THEATER + the emit_kit block-rule belt (K104) · share/deep links + sticky reveal + lobby gate placement (K105) · UX pass 2 — pagination/browse-all/deep-link consent surfacing/[ top ]/Prints dedupe (K106) · MC video palette flow + room-blocked browse-all + search plate deep-links + Exchange 42 drafted (K107) · LIBRARY per-card shareable links shipped END-TO-END — v3.9.14, anchor-stability covenant -> canon invariant v37.39 (K108) · PHOTO↔VIDEO PAIRING — 42 operator-confirmed pairs as manifest `video:` fields + the [ mp4 ] theater affordance + Exchange 45 fold (render-from-data sweep STAGED) + mascot relay channel opened + the stale-since-K108a search-index regen (K109) · GALLERY UX PASS 3 — controls-first ×9 + NSFW gate below search + lobby Prints collapsed band w/ storefront link-out; mascot Exchanges 2/3/3a + the D:\mascot\ asset landing folded (K110) · MASCOT DEV-FLAG HARNESS (sealed `/_/yurei-harness/`) + batched §-review -> Exchange 4 + the W.U.L.D. Exchange 5 CONFIRM ×5 fold (K111) — strata below.** See CLAUDE-history.md for per-session narratives.

### Infra facts locked (updated post-E3 close — reference for F+)

- **Account ID:** `a2fc6a0d2e2f1fff96fe425de624a388`
- **GitHub repo:** `alisendjsc-crypto/wuld-ink` (public). Default branch `main`. Commit author email: `263501734+alisendjsc-crypto@users.noreply.github.com` (locally configured). Auto-deploys to Cloudflare Pages on push.
- **Pages project:** `wuld-ink` → `wuld-ink.pages.dev` (auto-staging URL). **GIT-CONNECTED** via Cloudflare Pages GitHub App to `alisendjsc-crypto/wuld-ink` on branch `main` (since E3). Build config: framework preset None, build cmd empty, output dir `src`, root dir blank, no env vars. Every push to main auto-triggers a Pages build + deploy. **Future deploy workflow:** `git push origin main` from any machine with the repo cloned + creds; no Cloudflare dashboard interaction needed unless changing settings.
- **Live domains:** `https://wuld.ink` (canonical) + `https://www.wuld.ink` (301 → apex via E2 redirect rule). DNS for www is Pages-attached, not standalone proxied.
- **Library served-combined verify URL (settled K91a):** BOTH `https://library.wuld.ink/combined` (the pin-tool / verify-script `DEFAULT_URL`) AND `https://library.wuld.ink/combined.html` serve the SAME artifact — http 200, 2,945,490 B, md5 == the current pin (`8e0d823f` / 2,946,927 B at v3.9.13; was `c436e720` / 2,945,490 at v3.9.12) — confirmed by the K91a both-URLs diagnostic. Earlier failures (K89/K90a `.html` -> empty/12 KB; K91a-close `/combined` -> no body) were TRANSIENT Cloudflare Pages SPA-fallback / edge-cache-cold states, NOT a URL dichotomy — either form can transiently return the ~12 KB SPA wrapper or empty mid-propagation. **Verify robustly: md5 == pin AND size == 2,946,927 (v3.9.13; was 2,945,490), with retries** — the pin tool's 3-fetch-require-identical is the authority; a 12 KB/empty body = cache-cold -> re-run. `curl.exe`, not urllib (Cloudflare serves UAs different bytes; caveat in the pin tool).
- **DNSSEC:** enabled on `wuld.ink` zone; DS record auto-publishing on registrar side.
- **R2 bucket:** `wuld-audio`, location WNAM, default storage class Standard. Public Access ENABLED via custom domain only (no `r2.dev` public URL).
- **Audio host:** `https://audio.wuld.ink` → `wuld-audio` bucket. Propagation confirmed (clean 404 on absent keys, not error 1014). `<body data-audio-base="https://audio.wuld.ink">` set in session-B page shells.
- **R2 subscription:** activated on PayPal `evilisanihilis@live.com`. Free tier 10GB/1M Class A/10M Class B. Overage authorization signed.
- **TLS minimum on R2 custom domain:** 1.2 (post-E2 bump from 1.0 default). Edge still negotiates higher in practice; this enforces the floor.
- **Cloudflare Rules — Redirect Rules:** 1/10 used. Order 1 = "Redirect from WWW to root [Template]" — Active. URI Full wildcard `r"https://www.*"` → `https://${1}` at 301 with preserve-query-string.

- **Comment board (K45):** D1 database `wuld-comments` id `fbae13d3-7ec2-4c09-96a8-031046241f5a` (WNAM). Worker `wuld-comments` (source `workers/comments/`), routes `wuld.ink/api/*` + `wuld.ink/admin*`. Secret `IP_SALT` set via wrangler (not in repo). Cloudflare Access app **"wuld comments admin"** id `50e15617-18d6-4e76-b230-d5f72282dc3f`, AUD `dc2e385e80a87134f6050a63e4701ddf89d62387c0a89d9d8a3a9b1da04a350b`, team domain `wuld.cloudflareaccess.com`, policy `8e7ae819-ef4e-4656-a29d-ea41d6a810c5` (Allow / Include Emails alisendjsc@gmail.com / OTP), gating BOTH `/admin` and `/api/admin/*`. Board LIVE on /chat/ (BOARD.live=true; board assets at `?v=K46`). One global board ("global"). Moderation UI at `wuld.ink/admin` (Access email-OTP). K46 hardening: D1 `settings` table holds `board_open` (instant kill-switch, no redeploy); /admin has an OPEN/CLOSED toggle + bulk purge (hide-all / delete-hidden / delete-all, typed confirm on delete-all); `POST /api/admin/board-state` + `POST /api/admin/purge` are Access-gated + same-origin CSRF; `GET /api/comments` returns `open`; closed -> `POST` 403 `board_closed` + frontend disables the form; Worker FAILS OPEN if `settings` is absent.

### Resolved decisions

- Multi-page architecture
- Audio: per-paragraph but **selective** (not all paragraphs)
- Stack: Cloudflare Registrar + Pages + R2
- Domain: wuld.ink (registered)
- **Title page = homepage** (collapsed; zine-cover effect lives as first scroll-section)
- **Reader/HC modes = INCLUDED, but SCOPED** — accessibility affordance on `[data-readable]` containers, not site-global. Three modes: dark (canonical default), reader (warm-cream light), hc (WCAG-AAA). Colorblind-safe palette axis reserved.
- **EFIList integration = HYBRID** (fully locked across Exchange 1 + Exchange 2 with library-Claud [text truncated; pre-K22 era; original content lost]

> **Trimmed at WI-K318b (2026-09-12).** The strata that stood here — `**K212 (2026-07-09, …` through `## WI-K312g` — were
> moved byte-exact to `CLAUDE-history.md` under `## Archived strata: K212 through WI-K312g (moved from CLAUDE.md at WI-K318b
> trim, 2026-09-12)`: bytes [71,221, 1,185,128) of the file as WI-K318 left it, 1,113,907 B, md5 `292c24f14fd8fc6be2c050395b399798`. The log resumes
> at WI-K313a. Nothing was rewritten; the WI-K318b stratum at the bottom has every hash.

## WI-K313a — P5 begun and largely built; cccxxii; ccciii twice more; cccviii amended; cccxvii in this seat's own code

P5 IS NO LONGER A PLAN. The cosmetic layer the operator asked for at the top of the session, and which
the film's problems buried for ten hours, is built and running on the live site: bezel with lit inner
lip, chin with the W.U.L.D. wordmark whose periods are the status LEDs, a power button that CYCLES
off -> cosmetic -> vfx, text glow keyed to currentColor, a vignette, a camera that pans with the cursor,
and a far-side blur. Delivered as wuld-bezel.css / .html, wuld-vfx.css / .js, a validated inertness
harness (sweep_inert_web.py), and a console snippet that loads the whole layer on any library page so
the operator can judge motion with a real cursor, which no screenshot can.

CCCXXII. AN EFFECT MAY BE PRODUCED BY THE PIPELINE RATHER THAN BY THE SETTING THAT NAMES IT, and
copying the setting to a target that lacks the pipeline step copies nothing. Ask what PRODUCES the
effect, not what configures it.
    THE INSTANCE. The film's phosphor glow is specified as threshold 85 / sigma 10 / gain 3.2 on the
    luma plane, and the handoff (correctly, after its own correction) says the 85 is live rather than
    inert. All true, and all beside the point on a web page: the film scales 1892 px of content down
    into a monitor a few hundred px wide, which CONCENTRATES each glyph's energy into fewer and
    brighter pixels, and blooms THAT. At 1:1 there is nothing to concentrate. Measured: a text-shadow
    sweep from nothing to past-legible moved mean luma 19.90 -> 20.20 and was indistinguishable by eye
    at every step. The glow that reads in the film's own stills is on POINT SOURCES -- graph nodes,
    tier badges -- because those are small and bright, which is what survives a downscale.
    The fix was not a bigger number. It was to glow the point sources, and to glow text by an
    annulus-measured currentColor shadow that the film never specified at all.
    DISTINCT FROM CCCIII, which is about a literal carried between geometries. Here the literal was
    correct and the PIPELINE was absent. A parameter can be right and still describe nothing.

CCCIII, TWO MORE INSTANCES, and it is now clearly not a scroll rule:
    THE TOP LIP. The handoff's 20 px was BEZEL_CROP_TOP -- picture rows discarded off the top of the
    scaled footage, not a bezel dimension. Built as a frame, it clipped the site's sticky nav. Caught
    by CLOSURE: 20 + 1018 + 34 = 1072 against a 1080 frame, where the corrected set closes exactly.
    A set of dimensions that does not sum to its own container is refuted before anyone looks at it.
    THE LIP COLOUR. #191A1C, measured off the film, sits 11 luma above the bezel body and is invisible
    at full screen -- the frame read as a flat border, which §1 names as the failure mode. Re-derived
    by scanning the edge: body 15.1, and #43474E puts the lip line at 70.7, a step of +55.5.
    Both are ccciii AMENDED in its own words: a literal authored at geometry A is an unmeasured claim
    about geometry B. The film's numbers are right ABOUT THE FILM.

CCCVIII AMENDED (this seat's wording). THE DANGER OF A VACUOUS INSTRUMENT IS NOT THE NUMBER, IT IS THE
SENTENCE WRITTEN FROM IT. cccviii already says an empty gate returns a confident result; what this
session adds is that the result gets PROSE attached and the prose outlives the run.
    SIX VACUOUS SELECTORS IN ONE DAY, every one of them mine:
        main#main h2          the harness's own positive control -- 0 elements
        h2                    on a page whose 43 headings are h1/h3/h4 -- 0 elements
        p,span,td,h1,h3,h4    against the 82 div.trigger-text that hold the bright prose -- 0
        html[data-mode=...]   correct for the wings, matches nothing on the flagship
        body.legible          correct for the flagship, matches nothing on the wings
        radial-masked backdrop-filter   a configuration rather than a selector, same shape
    TWO OF THEM PRODUCED CLAIMS I WROTE DOWN AS FINDINGS: "a glow does not transfer to prose at 1:1"
    and "peripheral blur is inert -- three mechanisms, max abs delta 0.000". Both false. The first was
    a claim about a selector that touched no prose; the second was true of one configuration and
    written as a general fact about backdrop-filter. Re-tested: white glow on the real element lifts
    the glyph annulus +36.3%, and a linear-masked strip moves 16.3% of pixels on the treated side and
    exactly 0.00 on the other. BOTH WENT INTO CSS COMMENTS, where a later reader would have inherited
    them as settled. An instrument that examines nothing does not error; it agrees with you.

CCCXVII, IN THIS SEAT'S OWN CODE, hours after allocating it. The camera clamp was `MAX = 2` in the
JavaScript while the CSS declared `--wz-tilt: 0.7deg`. Two writers for one value; the visible one
inert; setting the documented variable changed nothing and the pivot stayed at 2 degrees at every
cursor position. The tuning line published to the operator did not work. Fixed by reading the variable
rather than restating it. Allocating a hazard does not inoculate the allocator.

TWO CONVENTIONS ON ONE SITE, and neither gate was wrong. The flagship marks display mode as
body.legible / body.high-contrast; the wings mark it as html[data-mode="legible"|"high-contrast"|
"standard"], and they DEFAULT to legible where the flagship defaults to standard. Each gate was
written from one page and was vacuous on the other. The covering form takes both, with
:not([data-mode="standard"]) so BOTH and any later mode are included. A convention verified on one
page of a site is a fact about that page.

THE GATE THAT STRIPPED ITS OWN CHROME. The accessibility gate was written with a bare `*` and killed
the bezel's inner shadow and the LED glow along with the content effects -- measured in legible mode as
frameShadow:none, ledShadow:none. The frame is CHROME, not an effect: a reader who wants plain type
still wants the monitor around it. Scoped to .wz-stage, which spares the furniture for free, because
the furniture already lives outside the stage so that the camera cannot move it. One structural
decision paying twice is the sign that the structure was right.

MEASURED, FOR THE RECORD, all on the site's own pixels:
    median luma          flagship 17.0 | right-to-die 16.1 | libraries 11.1   (STANDARD; the wings
                         read 239.6 on load because they default to LEGIBLE -- one click from a wrong
                         conclusion about a light-themed site)
    text glow            annulus lift +22.7% / +36.3% / +47.8% at 30 / 45 / 60% white; PEAKS near 80%
                         and DEGRADES past it (+78.9% at 92%) as the same light spreads wider
    vignette             centre/corner 0.964 -> 1.468
    graph views          SVG <text> inherits text-shadow and needed nothing; ONE drop-shadow on the
                         <svg> root beat per-element filters on both quality (+63.3% vs +38.8%) and
                         cost (21.6 ms vs 24.3 ms repaint) against ~600 filtered elements
    background median    17.00 unchanged at every glow level tested -- no legibility traded
    camera               pan, not tilt; travel bounded BY THE LIP WIDTH, so the gap that opens at the
                         trailing edge is always under the frame. No void is possible by construction
                         rather than by choosing a small number.

STANDING. P5's four scoped items are built; the wings right-to-die and libraries are verified end to
end and needed no wing-specific CSS. Remaining: the other five wings (abortion, transgenderism,
anthropocentrism, veganism, troubleshooting), a census each before claiming anything, since the census
has contradicted this seat's assumptions on every page so far. Also open: whether the camera should be
stilled in legible mode -- it is motion, and prefers-reduced-motion already covers the vestibular case,
so it is left running pending the operator. The video seat's page_signature drift check remains theirs,
after the ship. Hazard allocation: cccv-cccvii, cccxvi-cccxix, cccxxi and cccxxii mine, cccviii joint
(amended here by this seat), cccix-cccxv and cccxx theirs by authorship, all allocated here.

## WI-K313b — the wings swept; cccxxiii, three gates all keyed to a proxy; cccxxiv, a control that could not refute its own claim

THE SWEEP IS DONE and it produced two hazards, the second of which is the more valuable and was
found by the operator rather than by this seat. All five remaining library pages — abortion,
veganism, transgenderism, anthropocentrism and /troubleshooting/ — were censused in STANDARD before
anything was applied, then had the P5 layer applied and measured. Four were structurally identical
to right-to-die and needed nothing. The fifth broke the accessibility gate. Repairing that break
produced a gate that passed twenty controls and was still wrong about the only thing it was for.

CCCXXIII. A GATE KEYED TO A NAME IS KEYED TO A PROXY. Where the rule can measure the property it
actually cares about, the name is worse than the measurement at every strength, and the failure is
SILENT, because a rule whose whole job is to suppress produces nothing to notice when it suppresses
wrongly. Three versions of one gate, each keyed to a name, each wrong differently:
    v1  `html.wz-vfx[data-mode="legible"]` — an attribute the flagship never sets. VACUOUS: the
        glow ran in exactly the two modes the brief excludes.
    v2  `body.legible` + `[data-mode]:not([data-mode="standard"])` — correct on both of the site's
        two conventions, and still wrong. /troubleshooting/ ships <html data-mode="dark"> where the
        attribute is DECORATION: one occurrence, zero rules on the page selecting on it, no mode
        switcher at all (53 nodes, zero buttons). The gate read "dark != standard" as a reader
        asking for reduced visual noise and silenced the whole tier. Measured at tier 2: .wz-stage p
        and .wz-stage h1 both computed text-shadow:none. The comment beside it claimed it "covers
        any mode added later" — true of VALUES, false of PAGES.
    v3  detect whether [data-mode] is wired to any stylesheet rule, exempt the page when it is not.
        This repaired v2 exactly, survived every control, and left the actual defect untouched.
    THE ACTUAL DEFECT, WHICH THE OPERATOR FOUND BY LOOKING AT HIS OWN SITE: THE MODE NAME DOES NOT
    PREDICT THE BACKGROUND, and the background is the only thing the rule was ever about. Measured,
    8 pages x 4 modes, background luma of <body> at 1440x900:
        surface                STANDARD   LEGIBLE   HIGH-CONTRAST   BOTH
        flagship /combined        10.0      10.0        240.5       240.5
        libraries + all 5 wings   11.1     239.6          0.0       255.0
        /troubleshooting/         10.0  (no switcher)
    THE TWO FAMILIES ARE INVERTED. The flagship is DARK in legible and CREAM in high-contrast; every
    wing is CREAM in legible and PURE BLACK — luma 0.0, the highest-contrast ground on the site — in
    high-contrast. One vocabulary, two opposite meanings. No gate keyed to those four words can be
    right on both families, which is why all three versions failed and why the third failed while
    passing.
    THE FIX MEASURES. wuld-vfx.js reads the computed background of <body>, falls through to <html>
    when it is see-through, takes its Rec.709 luma, and sets html.wz-lightbg above --wz-dark-max
    (90; the site's two populations sit at 0–17 and 239–255, so the threshold is not delicate). A
    MutationObserver re-grades on every toggle, so the layer drives off the ground without knowing a
    single mode name, and an unreadable ground grades as light and stays silent — failure direction
    unchanged. 29 rows, glow present iff luma <= 90, zero failures. The stylesheet-walking detector
    from v3 was DELETED rather than kept: it existed only to save a gate that no longer exists, and
    dead code carrying a comment about a hazard that no longer applies is worse than no code.
    THE ACCESSIBILITY FLOOR MOVED TO WHERE IT BELONGS. Suppressing on a mode literally named
    "high-contrast" was always a proxy too. prefers-contrast and forced-colors are the real signals:
    they come from the OS rather than from one site's vocabulary, they are what a low-vision reader
    actually sets, and they now outrank a dark ground.
    ONE RESERVATION, STATED, OVERRULED, AND THEN PARTLY REINSTATED BY A LATER DECISION. A halo fills
    the luminance step at the glyph edge, so on a dark high-contrast ground the effect does spend
    some of the contrast that mode exists to provide. It was overruled on the ground that the tier is
    opt-in behind a power button defaulting to OFF, so a reader who switched it on had asked for it.
    That premise expired the same session: the ladder was reversed to descend (vfx -> cosmetic ->
    off) and to START at vfx, on the operator's call. Default-on is a defensible aesthetic decision
    and the tier now persists per reader so a step-down is not re-imposed on the next page -- but the
    argument that retired the reservation is gone with it, because nobody opts in to a default. What
    carries the accessibility case now is entirely the OS-level floor (prefers-contrast,
    forced-colors) plus prefers-reduced-motion for the pan. Recorded so that the reservation is not
    remembered as settled when only its justification was.

CCCXXIV. A CONTROL DRAWN FROM THE SAME FRAME AS THE CLAIM TESTS THE IMPLEMENTATION, NOT THE CLAIM.
It can only report whether the mechanism does what you meant; it is structurally unable to report
that you meant the wrong thing.
    THE INSTANCE. v3 shipped behind a control set this seat was pleased with: twenty negative rows
    (5 wings x 4 modes) confirming the glow appears in STANDARD only and the vignette is display:none
    in the other three; a flagship regression proving the body-class convention still gated and the
    bezel still survived; and — the part that felt rigorous — a POSITIVE control on the detector
    itself, injecting one inert `html[data-mode="dark"] .wrap{outline:0}` rule into /troubleshooting/
    and watching wz-freemode flip true -> false. Zero failures, and the whole set was worthless for
    the question that mattered. Every row asked "does the gate fire in the modes I named?" Not one
    could ask "are those the right modes?", because the mode names were the assumption under test and
    also the axis the controls were built on. A passing control set is evidence about a mechanism and
    silence about its premise.
    THE TELL WAS AVAILABLE AND NOT READ. census5.py had already printed bodyBG for every page —
    rgb(11,11,12) in STANDARD — and the earlier wing census had recorded the flagship at median 16.1
    against the wings' cream at 239.6. Both numbers were in this seat's own output. Neither was ever
    crossed against the mode name, because the gate's frame did not have a column for the ground.
    DISTINCT FROM CCCVIII, which is about a measurement that moved nothing. Here every measurement
    moved, correctly, in a frame that could not contain the error. Vacuity is a null result; this is
    a confident non-null one about the wrong variable.
    THE COUNTER-DISCIPLINE is cheap: when a rule suppresses something, state in one line the
    PROPERTY it is protecting — here, "text is legible on this ground" — and check whether the gate
    reads that property or a stand-in for it. If a stand-in, at least one control must vary the
    property while holding the stand-in fixed. Flagship LEGIBLE and wing LEGIBLE would have done it:
    same name, opposite ground, and the disagreement is visible in a single row.

THE WARM CAST, ON THE OPERATOR'S BRIEF: "give all of the text a subtle orangish tint, like the chin's
LED panels have." Two mechanisms, because neither does it alone. The HALO mixes toward --wz-tint
(default #FF9A78, between the LEDs' spec #FF8195 and amber), warming the emitted light where the
bloom lives. The WASH is a fixed soft-light overlay between the peripheral blur and the vignette, so
the vignette darkens an already-warmed picture — the bezel shadowing the emission rather than the
reverse. soft-light warms highlights and leaves black at black, which is what a phosphor does.
    A TRAP AVOIDED IN DESIGN RATHER THAN IN CODE, recorded because it would have been invisible:
    the obvious mechanism is `.wz-stage * { color: color-mix(in srgb, currentColor 88%, tint) }`, and
    it destroys the palette. Inside the `color` property `currentColor` resolves to the INHERITED
    colour, not the element's own, so every tier badge and every red accent would be replaced by a
    value derived from its parent. The page would still render, in the wrong colours, with no error.

STATE. Layer verified on the flagship, the libraries umbrella, all six wings and /troubleshooting/,
across every mode each page offers. The snippet is packed by pack.py and proved byte-identical to
build/ by pack_verify.py, which pastes it into a real page and reads the injected <style> nodes back
out. The camera pan and the resting angle run in every mode by the operator's confirmation and are
not gated on the ground, only on prefers-reduced-motion. The power ladder descends from vfx and the
tier persists in localStorage, every touch of which is wrapped -- a private window or blocked site
data costs the memory, not the layer. Hazard allocation: cccxxiii and cccxxiv mine, cccxxiv on this
seat's own control set.

## WI-K313c — sound, feedback and five tutorials shipped; cccxxv, a wrapper that broke a page by adding an element; cccxxvi, a feature that turned every pixel harness into a measurement of itself; cccxxvii, an assertion that could not fail; cccxxviii, a delay that delayed the clock measuring it

FOUR COMMITS LANDED, none pushed: 8b4537d the sound layer, 4782766 the per-card feedback control,
d5b8b58 the first-visit walkthrough, e61c91a the per-view tutorials and the stage shim. Cloudflare
deploys on push, so library.wuld.ink is still the old build by the operator's choice. The pinned
flagship was not touched; every gate in every deploy block aborts if combined.html reaches the index.

CCCXXV. A WRAPPER INSERTED BETWEEN AN ELEMENT AND ITS PARENT BREAKS EVERY SELECTOR THAT DEPENDED ON
THAT ANCESTRY, AND THE PAGE READS AS BUSIER RATHER THAN BROKEN. The layer's `.wz-stage` exists to
carry the camera transform and must therefore be a real element between <body> and the content. The
flagship switches its three top-level sections with direct-child selectors on body:
        body > #combined-library, body > #combined-rwe, body > #combined-coda { display: none; }
        body[data-active-view="rwe"] > #combined-rwe { display: block; }
    The moment the wrapper exists NEITHER RULE MATCHES ANYTHING. The hide stops hiding and the show
    stops showing, so every section renders at once — library, examples and coda stacked, all four
    graph views visible together — and the page's own script throws setting textContent on an
    element it no longer expects. Measured on the same page before and after the wrap:
        #combined-rwe        before: display:none, 0 rects     after: display:block, 1 rect
        #map-view (nav'd)    before: display:none, 0 rects     after: display:block, 1 rect
    THREE PROPERTIES MAKE THIS WORSE THAN AN ORDINARY REGRESSION.
    (a) IT IS ADDITIVE. Nothing disappears; more appears. A page showing five views at once looks
        like a page with a lot on it, not like a page whose navigation has been switched off.
    (b) THE OBVIOUS INVESTIGATION EXONERATES THE CULPRIT. The layer's own CSS was searched for any
        rule setting `display` on those ids: there are none, and a walk of every stylesheet for
        rules matching #combined-rwe with a display property returns an empty list. The rule that
        broke is the PAGE'S, and it broke by not matching, which no search for a conflicting
        declaration will ever surface.
    (c) IT IS INVISIBLE ON THE SURFACES ALREADY TESTED. Six wings and an index were swept for weeks
        and none of them uses `body >` for anything. The hazard was reachable only from the one
        surface the discipline forbids touching, and was found only because the per-view tutorials
        had to be tested there.
    THE FIX IS MECHANICAL, NOT HAND-WRITTEN. mirrorBodyChildRules() walks the page's own rules,
    finds every selector with a `body ... >` combinator, and injects a mirrored copy with .wz-stage
    spliced in — body > #x becomes body .wz-stage > #x. It recurses into @media, edits nothing, and
    every mirrored rule gains exactly one class of specificity so their order relative to each other
    is preserved while the originals match nothing at all. On the flagship it mirrors 4 rules in
    0.2ms across 169 rules in 7 stylesheets; on all three wing surfaces it injects no stylesheet.
    THE GENERAL RULE. Before inserting a wrapper into a document you did not write, enumerate what
    depends on the ancestry you are about to change — `body >`, `:first-child`, `parentNode ===`,
    sibling combinators — and measure the page before and after the insertion. A wrapper is not a
    no-op just because it is invisible.

CCCXXVI. A FEATURE THAT PAINTS OVER THE PAGE TURNS EVERY PIXEL-SAMPLING HARNESS INTO A MEASUREMENT
OF THE FEATURE, AND THE NUMBERS IT RETURNS LOOK LIKE A REGRESSION. The tutorial covers the viewport
with four panels at 74% black, and Playwright gives every context an empty localStorage, so the
once-ever tour fired on every page every harness opened. fbcontrast.py, which screenshots the
element and samples pixels, moved in a single run with no CSS change whatsoever:
        mode / tier          before the tutorial existed      after
        standard  vfx                    7.52 : 1            1.43 : 1
        legible   vfx                    5.37 : 1            1.00 : 1
        high-con  vfx                   13.89 : 1            1.74 : 1
        both      vfx                   12.63 : 1            1.00 : 1
    Eight cells, all suddenly failing a 3:1 floor. That is exactly the shape of a real contrast
    regression, and the tempting next move — "fix the contrast" — would have chased a defect that
    did not exist and quite possibly shipped a louder control to compensate for an overlay.
    THE TELL IS A RATIO OF EXACTLY 1.00. Glyph and ground identical to the byte is not a contrast
    measurement; it is an occlusion. A measurement that lands on a degenerate value should be read
    as the instrument reporting its own state, not the subject's.
    Distinct from cccviii, which is about a harness that measures NOTHING. This one measures
    something real, with full fidelity, and it is the wrong thing. 26 harnesses now set the flag
    that suppresses the tutorial; wzharness.py records why in the one place a future seat will look,
    and tourtest.py is deliberately exempt because there the tutorial is the subject.

CCCXXVII. AN ASSERTION WHOSE NEEDLE CAN OCCUR OUTSIDE THE THING UNDER TEST IS NOT AN ASSERTION. A
patch replaced the feedback control's glyph with a word and guarded itself with
        assert 'feedback' in j
    which passed — because the file's header comment begins "wuld-fb.js -- per-card feedback". The
    replacement had silently matched nothing, the build shipped the old glyph, and the only reason
    it was caught is that the next step was a rendered screenshot. A string replacement that no-ops
    is indistinguishable from one that applied unless the assertion can tell them apart.
    THE RULE: assert on the post-state that ONLY the successful mutation can produce, and pair it
    with `s != before`. The needle must be impossible in the surrounding prose — here,
    `a.textContent = 'feedback'`, not `feedback`.

CCCXXVIII. WHEN THE HARNESS AND THE SYSTEM SHARE A SCHEDULER, A DELAY THE HARNESS INJECTS DELAYS THE
HARNESS TOO, AND THE ORDERING IT WAS TESTING SILENTLY NEVER HAPPENS. To test whether sounds that
arrive after the first gesture are ever decoded, a Playwright route handler slept 3s on every /sfx/
request; the test then waited 1.2s and clicked. Playwright's sync route handlers run on the
dispatcher, so the sleep blocked the test's own clock: the timeline shows the seven files arriving
at 3.2s, 6.2s, 9.2s … 21.2s and THE GESTURE AT 21.219s — after every file had landed. The intended
condition never existed; the fast case was measured twice and reported as a before/after pair.
    Replaced with a threaded fixture server that delays /sfx/ server-side, at which point the real
    result appeared: before the fix, silent forever; after it, audible.
    THE RULE: a delay is only a delay if it is injected somewhere the instrument does not have to
    wait on. When an instrument can be blocked by the thing it is instrumenting, verify the ordering
    you intended actually occurred — log the timestamps rather than assuming the sleeps composed.

CCCXXIV, AGAIN, ON THIS SEAT'S OWN POSITIVE CONTROL. The sound layer's gate opened with a control
asserting that a click produces at least two sounds. It failed, and the ten silence rows beneath it
were correctly treated as provisional. The control was clicking the point (700,450), which on that
page is an <h2> with no clickable ancestor — so nothing ever requested a sound and "0 sounds" was
the correct behaviour, misread as a product failure. The control was drawn from the same frame as
the claim: it assumed "a click" meant "a click that should make a sound" and never checked what was
under the cursor. The gate now finds its target in the page and carries a NEGATIVE control beside
the positive one — a click on body prose must stay silent — so the two cases can never be confused
again. Two real defects were sitting behind that bad control and were found once it was fixed: the
first click a reader ever made was silent (decode is scheduled in the same tick as the context is
created, measured at 45ms), and any sound that had not downloaded by the first gesture was NEVER
decoded at all — silent for the remainder of the session, not merely for that click.

STATE. Sound: seven synthesized cues plus a seamless ambience, gated to the vfx tier on a dark
ground with reduced-motion and a persisted mute both honoured; 14 silence gates with four live
positive controls; 16.70ms median scroll with the ambience running and hover traffic firing, which
is the first time the sound layer has been measured while switched ON — perf.py scrolls without ever
making a gesture, so it had been measuring an AudioContext that was never created. Feedback: a
per-card mailto carrying the library, headline, the card's own chips, its classification, id and
deep link, read at click time and degraded longest-first against an 1800-character budget; longest
of 50 across five wings is 1295. Tutorials: five, one per view, each with its own once-ever key,
fired on view activation; a ? button fourth in the chin runs the one for the view in front of you.
Four 44x44 chin buttons with 6px gaps still fit at 320px, which is why the wordmark hides below 420.
Regression unmoved throughout: 25 contrast cells 0 below AA, CLS 0.000, no horizontal overflow at
four widths, print suppressed, 16.70ms median at every tier. Hazard allocation: cccxxv, cccxxvi,
cccxxvii and cccxxviii mine, all four on this seat's own work or its own instruments.

## WI-K313d — the quality-check pass; cccxxix, a guard that lists what it fears; cccxxx, a status carried across a compaction is a claim

ONE COMMIT LANDED, ONE DID NOT. ac609b6 removed the tutorial button from the one page that has no
tutorial. Deploy 8 -- nine fixes from an adversarial review of the harnesses, run on a model switch at
the operator's request -- never executed: PowerShell refused to parse it. Its commit message contained
"stable for two frames" in double quotes inside a double-quoted string. Nothing was committed; the
gates never ran; HEAD stayed at ac609b6. Reissued with the quotes removed and every deploy block in
the drop audited for the same three characters.

CCCXXIX. A GUARD WRITTEN AS A LIST OF THE HAZARDS ITS AUTHOR REMEMBERED CERTIFIES AGAINST EXACTLY
THOSE. The block carried `assert '`' not in msg and '$' not in msg` -- the two characters that had
bitten before -- and passed a message with four double quotes in it, the one character that actually
terminates a PowerShell string. The guard was not wrong about backticks or dollars; it was silent
about the thing it had not been told to fear, and its passing read as a clearance. The general rule:
a denylist guard's PASS means "none of the listed things", never "safe". Where the grammar is known,
guard against the grammar -- here, everything a double-quoted string cannot contain -- not against the
incidents. Distinct from cccxxvii (an assertion whose needle cannot fail): this assertion could fail,
and did not, because it was asking the wrong question.

THE NINE FINDINGS, for the record, because a green suite tests what its author thought to test.
    Two in COPY describing the operator's own apparatus, which no geometry test could see: the
    mechanism-web tour said "click an edge" (117 nodes carry pointer cursors, 142 lines carry none),
    called that web's edges relations between mechanisms (they join an objection to a mechanism),
    and called the dependency graph's weak edges "low-confidence" (weak means the response survives
    the premise's removal; confidence is what REVIEW and PROVISIONAL mark). Now under
    tourcopy_gate.py: 15 claims, each tied to a verbatim panel sentence, read from the shipped source.
    Two in GEOMETRY the harness sampled around: the wordmark clashed with the ? button from 421 to
    476px -- the 420px hide threshold was derived for three chin buttons and never re-derived for
    four, and chinfit sampled 1440/768/390/320 and nothing between; and two step-2 rings covered 77%
    of the viewport because the selector guessed `.map-controls`, which is the zoom container.
    One in TIMING, opposite to the last: smooth scroll's ~2-frame startup latency satisfied "stable
    for two frames" before the scroll began -- frame log: loop out at 39ms, page moving until 221ms,
    ring eased by its own CSS transition onto the row 130px above. The wings had passed by luck.
    Instant scroll now, and no stability inside the first 150ms counts. A function wrong twice in
    opposite directions is a function that was being tuned rather than understood.
    Four smaller: a rapid-arrow race (generation counter); tour keys reaching the page's own
    handlers; the sound layer repainting the mute button on every zoom tick (five writes, now zero);
    the stage shim re-emitting @supports as @media; an unscoped .obj{position:relative}.

CCCXXX. A STATUS CARRIED ACROSS A COMPACTION IS A CLAIM, NOT A FACT, AND IT DOES NOT RE-VERIFY
ITSELF. For two days this seat told the operator that the apparatus page for the showcase film was
"blocked on his endnotes". The endnotes had existed since Thursday evening -- apparatus_libshow.md v4,
29,261 bytes, in the shared folder -- and the wuld.ink build pipeline for the page had existed since
the 8th, with a gated ship script in this seat's own repo. The film seat noticed, from the other side.
The block was inherited through a context compaction as a one-line summary and never measured again;
every later status document repeated it, each citing the last. This is the project's own "a name is a
claim, a hash is a fingerprint", applied to state: a status line survives compaction as text, and
text does not know when it has gone stale. Before restating an inherited "blocked on X", look at X.
    And the page itself was one version-mismatch deep, in the film seat's confessed shape: the kit
    the ship script reads was v10 (two cuts); the current document is v4 (one cut); the ship script's
    marker regex, the build tool's opening assertion and section map, and the verifier's table count
    and cut count all encoded the two-cut design. The build tool as shipped could build NEITHER
    document. All three reconciled; v4 builds through the real chain and the verifier reports GREEN
    at 28 checks, with a control that turns it red. One input remains that this seat cannot honestly
    produce -- the v4 render manifest, because a manifest reconstructed from the document is
    circular and the gate exists to compare the two. Relayed.

THE PRECIS, RATIFIED WITH REVISIONS BY THE LIBRARY SEAT (K232), AND THE GATE TIGHTENED. Their finding
was structural: the source gate certified one sentence per LINE while the lines carried several claims
each, so "20 lines, 0 unsourced" was true and misleading. Rebuilt per CLAUSE: 48 clauses, 21 lines, 0
unsourced. The tightened gate then rejected six clauses of the ratified wording itself, which had been
written before the gate existed -- the ratifier's own text failing the ratifier's requested test, which
is not a criticism of either but is exactly what the test is for. Their staleness suspicion was placed
on the wrong number: the Consent Impossibility figure (67 / 42 / 25 / 26%) is exact against the live
v4.0.0 graph; the panel's LOAD-BEARING HIERARCHY table is what is stale, summing to 222 edges against
255. Their guess at a panel gap was right: the mechanism-web panel nowhere states that explaining a
position is not refuting it. Label START HERE, no id, insertion kit ready; it lands in the pin move.

STATE. library.wuld.ink: seven commits local (9077927 .. ac609b6), deploy 8 reissued and pending,
none pushed. wuld.ink: WI-K313b and c landed at 9ed8ac8 and 0077921; this stratum pending. The push
block is gated on HEAD's subject in each repo and refuses if origin is ahead. The pin-move prompt now
carries the stage-wrapper hazard, the precis insertion, the flagship feedback shape, the pre-existing
top-nav error, and a note that the apparatus quotes the pin the move will supersede. Hazard
allocation: cccxxix and cccxxx mine; cccxxx is the one to reread before the next handoff.

## WI-K313e — everything landed, read back off the remotes rather than carried; the parity gate reclassified under cccxxiii; two names with one fingerprint in the render manifest

LANDED, AND VERIFIED FROM THE REFLOGS, NOT FROM THE LAST STRATUM (cccxxx, applied to itself). Every
status line below was read off the two repositories' own `.git` after the fact -- the remote-tracking
reflogs, the index, and the log's bytes -- because the previous stratum's STATE paragraph was written
before the blocks ran and a compaction sat between then and now.
    library.wuld.ink (efilist-argument-library): deploy 8 landed as 23fbbed, "library: quality-check
    pass -- nine fixes". The push moved origin/main e253f23 -> 23fbbed, eight commits (9077927 ..
    23fbbed), recorded as "update by push" at 17:32:29 -0700 on the 11th. Cloudflare Pages deploys on
    push, so the P5 layer -- palette, type, bezel, glow, magnifier, sound, feedback, tutorials -- is
    now the served build on the five wings, the umbrella and /troubleshooting/. The deploy this seat
    cannot fetch (egress policy); the push it can read, and has. The flagship is pinned and untouched:
    combined.html was in no staged set, and every deploy block printed "flagship untouched".
    wuld.ink: WI-K313d landed as 72a80ab and was pushed at 17:32:33. The apparatus then landed as
    d60ec13 (five files: the page, its Markdown, and the three tools as they ran) and 552b4dc (sitemap
    66 -> 67 locs, search index), pushed 72a80ab -> 552b4dc at 17:42:26. CLAUDE.md read back at
    1,219,391 bytes, md5 f0bc08c0e04f45dd3dc7d5a0f32f2f71 -- the exact value the K313d block predicted.
    The page, fetched from this side: https://wuld.ink/argument-library/apparatus/, title "The Argument
    Library -- the Apparatus", marker "measured: v4", db01fb9d4331039148fdb51b7649e022, 279,809,463
    bytes, quoting the current pin 9d13359e305c6caa3ae64759f3dcc0e6, and the pre-sweep e654eabd nowhere
    on it.

THE PARITY GATE, RECLASSIFIED. The backlog filed its removal as "same family as cccxxix". Wrong family.
cccxxix is a denylist that PASSES what it was not told to fear. The parity gate FAILED a valid input:
it required the manifest to record exactly as many renders as the marker names cuts, a count standing
proxy for "same version", when the presence check beside it already measured identity directly by
md5. A count is a name for a shape. That is cccxxiii -- a gate keyed to a proxy -- in the other
direction, and it broke a rule this seat had written into K310c two days earlier: a check that can
cry wolf must not be able to block. The film seat's manifest arrived as a fifteen-entry superset with
both v10 entries preserved byte for byte, which is the more honest record, and parity refused it
(15 against 1) with nothing written. The presence check, alone, is the gate now.
    The script that actually produced d60ec13 -- SHIP_WHEN_REPIN_LANDS.ps1 v4.1, md5
    6226a355daa9b64276f643870a9b84d1, 11,999 bytes -- is committed in the commit immediately before
    this stratum. Until that commit the repository's ship script was the v10 blob (10,667 bytes),
    whose marker regex requires a `wuld:` group the v4 document has retired: as committed, the repo
    could not have shipped the page the repo serves. One stale line remains in v4.1 and is left as it
    ran: the served-page read-back greps "RESULT OK", a v10 phrase; v4 says "result | OK -- 5 of 5" in
    a table, so RESULT=0 is the correct reading and the "(want >=1 1 0)" annotation is wrong. Fix it
    in the same edit that adds the film link, which the next ship needs anyway.

THE FILM SEAT'S MANIFEST, READ ON THIS SIDE. The v4 entry carries the marker's md5 and byte count.
duration_s 275.442 against frames 16,510: 16,510 x 1001/60000 = 275.4418, so the document's claim that
the render step now takes duration from the decoded frame count is checked here rather than quoted.
edl_clock_s 275.472 sits beside it, and v1 through v3 record 275.472 as duration_s for the same
16,510 frames -- the 30 ms disagreement the new field was added to make visible, visible.
    One observation for them, no allocation. Two pairs of entries share one fingerprint:
    libshow_proof_v15_nograin.mp4 and libshow_proof_v16.mp4 (9205aed440e905b36553eefa5f9e050d,
    109,139,715 bytes); s5_grain.mp4 and s5_nograin.mp4 (407ebf9c6e41a2f3fed94d3bb41f2b1d, 239,202
    bytes). By the project's own rule a name is a claim and a hash is a fingerprint, so the manifest
    says v16 IS v15_nograin and s5's grain IS its nograin. If either pair was ever put side by side,
    the comparison was of a file with itself (the cccviii shape). If they are renames, or a segment
    the grain never touched, one line in the manifest saying so costs less than the next reader
    running that comparison. Relayed as an observation, not a finding.

CCCXXX FIRED AGAIN, ON THE DOCUMENT WRITTEN TO PREVENT IT. The pin-move prompt carried, as a standing
constraint, "apply_wuld_wrap.py at blob aa37a37f is supposed to differ from the kit copy". The ship's
first phase copies the kit over it and commits the result by design, and did: HEAD's blob is now the
kit copy (deb966ab, 9,991 bytes), and the guard that protects it is self-updating (working copy against
committed blob), so the constraint as written named a blob that is no longer anyone's. Rewritten to
state the guard, not the hash. Two more lines in the same prompt had gone stale the same way: it listed
four build files where the wings load two packed ones, /wuld-layer.css and /wuld-layer.js, which the
flagship must link rather than copy; and it put the register at cccxxiv. Caught by reading the index
and the served markup, not the prompt. A handoff document is a status carried across a boundary, and
it does not re-verify itself either.

STATE. library.wuld.ink: origin/main 23fbbed, layer deployed, flagship pinned at v4.0.1 and untouched.
wuld.ink: origin/main 552b4dc; the ship-script commit and this stratum follow it, then a gated push.
Next is the pin move, in its own session, opened from PROMPT_flagship_pin_move.md; it carries the
stage-shim verification, the precis insertion (48 clauses, 21 lines, 0 unsourced), the feedback control
on the flagship's own markup, the pre-existing top-nav decision, and the new pin's md5 and byte count
for the film seat, whose apparatus quotes the pin it will supersede. The library seat holds: the
dependency panel's LOAD-BEARING table stale at 222 edges against 255 live, Convergent Architecture 13
-> 17 and Benatar 33 -> 36 in the same panel's prose, the mechanism-web panel's missing
explaining-is-not-refuting limit, and RSI-4 optional. Register: cccxxx remains the highest; nothing
allocated here, and one misfiled family corrected.

## WI-K313f — the apparatus corrected twice in an hour; cccxxxi, a published figure without a generator is a transcription of a claim; the 404 in the film's description was this seat's

THE 404 WAS THIS SEAT'S. The showcase film is up, unlisted (youtu.be/JsUIL9GIfIM, libshow_full_v4.mp4,
4:36), and its description linked wuld.ink/library-apparatus/ -- which returned 404, fetched from this
side at 01:40 UTC. The page is at /argument-library/apparatus/. This seat mis-stated the path for two
days (K313d records it under cccxxx); the video seat's own release template carries [URL] unfilled, so
the wrong path reached the description from this seat's text through the operator's keyboard. Closed
both ways within the hour: a permanent 301 in src/_redirects (bdac2cf, 550 -> 925 bytes, appended as
bytes against a predicted hash), read back as 301 -> /argument-library/apparatus/ from the operator's
machine and from this side; and the operator edited the description to the real path.

THE GRAIN PARAGRAPH: A THIRD DEFECT, FOUND BY THE VIDEO SEAT RE-RUNNING THEIR INSTRUMENT FOR A REASON
UNRELATED TO IT. K313e's two-pairs observation resolved as follows. s5_grain = s5_nograin by
construction: segment 5 is a text card with no grain filter, so --no-grain removed nothing; no
published figure cited the pair. v15 = v16: two complete renders an hour apart, byte-identical --
neither a rename nor a self-comparison but a re-render whose intended change never reached the
picture, and the build log does not record its own command line, which is the gap and is theirs.
Re-running the grain instrument to check its controls before answering found the third: two of the
three VP9 candidates had been transcoded from a different mezzanine than the one their residual was
measured against -- their timestamps sit 56 and 18 seconds BEFORE the grained mezzanine P_G existed,
so neither could have been made from it -- and the denoise control was averaged over eight sampled
frames against the others' forty. Re-measured on an instrument that encodes its own candidates from
its own source in one run: grained master 1.0000, VP9 5 Mbps 0.5967, 3 Mbps 0.5290, 1.5 Mbps 0.4432,
hqdn3d=16 0.2662, ungrained build 0.0000. The published paragraph said 0.264 at 1.5 Mbps and called
it "worse than denoising the source outright" (0.282): both figures wrong, the comparison inverted.
The retraction is in the document, as a table with both controls in it, stating its cause. No figure
describing the film moved; the marker did not move.
    Two reissues, because the first carried a loose number in the paragraph whose job is exactness.
    823a49b (Markdown 63a74d75df74fb4c1670d260981848b7, 30,557 bytes) said the candidates "predated
    the reference pair by forty seconds"; neither timestamp is forty. This seat flagged it -- and then
    anchored its own correction to P_U, the subtrahend, giving 48 and 10, when the candidates are
    transcodes of P_G, the grained mezzanine, giving 56 and 18. A wrongly anchored correction of an
    imprecise one: cccxxi, one level down, and conceded. 5b5d1af (Markdown
    df0b7dfc0f8ae758afe003e9c515057f, 30,638 bytes) carries the right numbers and the impossibility
    they establish. "Forty seconds" was live for six minutes (823a49b pushed 18:51:26, 5b5d1af
    18:57:45, -0700). Both reissues were run through build -> wrap -> verify on this side before the
    operator shipped them, GREEN at 28 each, and the served page read back byte-identical to this
    seat's local build both times: 5ef13548f11fd940ab6f040d14fc5761 / 39,282, then
    98b58c3b628c25ee891ccf75a990d7ed / 39,376.

CCCXXXI (video seat's finding, their wording condensed, allocated here). A PUBLISHED FIGURE WITHOUT A
GENERATOR IS A TRANSCRIPTION OF A CLAIM. The apparatus gates certify document -> page (every figure
the Markdown carries is on the page, once) and document -> render (the marker's md5 is one the
manifest produced): faithfulness and provenance. Neither certifies that the measurement was sound,
and nothing on either side did. 0.264 passed 28 checks because it was faithfully transcribed, and
was caught only because the instrument happened to be re-run. The film's own figures are regenerated
from the file on every render by apparatus_numbers.py, so they cannot go stale without the marker
going stale with them; the grain figures had no generator -- typed once, from a run nobody re-ran --
and the difference between the two halves of one document was invisible until today. The rule: every
figure a document publishes either has a generator that re-derives it from its source in one run, or
the document says it was typed once. GREEN means "the page says what the Markdown says", nothing
stronger. Distinct from cccxxiii (a gate keyed to a proxy -- these gates measured exactly what they
claimed) and from cccxxx (a status carried across a boundary -- this was never a status, it was a
measurement never re-taken). Nearest kin is the project's standing rule for generated artefacts,
"generator output IS the shipped file" (sitemap, search index, the vendored exports), now extended
from artefacts to figures. grain_survival_v3.py closes it for the grain paragraph, and prints its
commands so a candidate cannot predate its reference again.

THE SHIP SCRIPT, v4.2 (28922cd). v4.1 as committed at eb950e9 assumed a first ship -- five files
staged exactly, sitemap +1 exactly, and a read-back that grepped a v10 phrase -- so a document-only
reissue would have failed twice before pushing. v4.2 stages by set (nothing outside the five, the two
page files required, an unchanged document a FAIL), accepts a sitemap delta of 0 or +1 according to
whether the page already existed in HEAD, skips the second commit when the regenerated files did not
change, and reads back by comparing the served page's md5 to the committed page's. That read-back is
sound because it was measured first: the page Cloudflare served at 01:47 UTC was byte-identical to
this seat's own build of the v4 Markdown (37,715 bytes, b4526ad1e72d07b16f9eb2d46026286d), so the
chain is deterministic across machines and the CDN alters nothing. The script that ships was committed
before the commits it made this time; v4.1 had been committed after the fact.

WITHDRAWN. This seat's unsent draft told the video seat the film was public and asked for the film
line to go in. It is unlisted, and the verifier asserts that the page does NOT link the film (handout
section 6), so a link is a handout change first and a verifier change second. Nothing went in.

STATE. wuld.ink: origin/main 5b5d1af; the chain since K313e is 06a0b6c (this seat's stratum), bdac2cf
(redirect), 28922cd (ship script v4.2), 823a49b and 5b5d1af (the two reissues); this stratum follows.
CLAUDE.md read back at 1,226,155 bytes, 89e1f944628450a593b3eae40f900ec5, as K313e predicted.
library.wuld.ink: origin/main 23fbbed, layer live on every wing, flagship pinned at v4.0.1 and
untouched -- 9d13359e305c6caa3ae64759f3dcc0e6 / 2,963,789 in the repo root, hashed from this side.
Next is the pin move, unchanged: its own session, opened from PROMPT_flagship_pin_move.md. The new
pin's md5 and byte count go to the video seat the hour that session commits; whether their v6
re-measures against it or only marks the old pin old is the operator's call, put to him by them with
the cost of each. Register: cccxxxi is the highest; one allocated here, by their finding.

## WI-K314 — THE FLAGSHIP PIN MOVE: the layer integrated into /combined, the AA remap at source, two mode toggles, the précis landed; pin 9d13359e → 62d1e8d8; cccxxxii allocated

THE PIN MOVES, ONCE. library.wuld.ink/combined leaves 9d13359e305c6caa3ae64759f3dcc0e6 / 2,963,789 B
for 62d1e8d86056465ebcb5daced38e0a83 / 2,974,039 B, version string held at v4.0.1 (integration is
not a content change; no re-pin). One efilist commit atop 23fbbed carries the three deploying files:
combined.html as above, wuld-layer.css 089dff05 → 24907d8919b6f14d99cfbcef1d2b534f / 59,392 B
(+716), wuld-layer.js 85665e34 → be7de70c3d6505b6de3d53355c874e3c / 57,746 B (+2,161). The build is
reproducible from the pinned file: rebuild.sh in the drop's pinmove\ folder replays integration →
descendant rules → insert_precis.py → aa_remap.py → mode_collapse.py → navfix.py and lands on the
same md5 every run. Opened from PROMPT_flagship_pin_move.md; §0's condition held (P1 done, library at
23fbbed, wuld-ink at 06a0b6c with K313e landed, read off both .git directories, not the state file).
By close the other seat had moved wuld-ink to 5b5d1af (the redirect, ship script v4.2, two
apparatus reissues) and appended WI-K313f -- allocating cccxxxi -- and the number this stratum first
carried was cccxxxi too: the register read at open was stale by the time it was spent. cccxxx,
applied to this seat; re-derived from the log as it stands at close, this allocation is cccxxxii.
    The device shell could not mount the connected folders this session (the Windows-update fault);
    every byte was staged into the container, worked there, and committed back to the drop. Nothing
    was fetched from library.wuld.ink or cdnjs (egress policy); d3 7.8.5 and IBM Plex Mono were
    served locally from npm tarballs so the bytes under test were the bytes that ship.

WHAT WENT IN (the 4 lines) AND WHAT THE 4 LINES BROKE. The flagship links /wuld-layer.css and
/wuld-layer.js exactly as the wings do and ships <div class="wz-stage"> in its markup (+122 B). The
3.1a hazard is real and it is worse than the prompt had it: the four `body >` rules that switch the
three top-level sections stop matching the moment the wrapper exists, and the layer's runtime shim
only lands when the DEFERRED script runs -- on a 2.9 MB document that is ~100 ms after parse. Measured
with a layout-shift observer: CLS 0.611 with #combined-rwe in the shift sources, i.e. all three
sections rendered stacked and then collapsed; and with scripts off the stack is the whole page.
    Fixed at source, not by the shim: the four rules now use the descendant combinator (`body
    #combined-rwe`), same specificity, matching with or without the wrapper. CLS back to the pristine
    page's own 0.082 (its card render moving the footer), the shim has nothing to mirror (0 rules, as
    on the wings), and navigation was walked by getClientRects().length -- three sections and four
    views, exactly one rendered in every state. The shim's capability was proven on a control copy
    that kept the child-combinator rules: with the shim it mirrors 4 rules and the walk is GREEN;
    with the shim element pulled out after boot the walk is RED (all three sections at once). Two
    earlier versions of that control were inert -- a shadowed window.wzStageShim that wzInit never
    reads, then an observer attached before documentElement existed -- cccxxiv, twice, before the
    third version could fail. The prompt's own check ("#wz-stage-shim must exist") keyed on the
    mechanism and would have read a correct build as broken: cccxxiii, and the reason the
    rendered-ness walk is the gate.

THE PRÉCIS. insert_precis.py on the working copy: four START HERE blocks after the first <h4> of
each methodology panel, +4,024 B exactly as K313d predicted, no ids, the panel stays the target.

THE AA REMAP, AND WHY IT IS AT SOURCE. The prompt counted 85+ failing elements from a closed-card,
one-mode census. The sweep here drives eleven states (closed; one card per tier open; the RSI panel
and an RSI detail; each graph view, then its methodology and info panels; the examples and coda
sections) in all four modes and reads every visible text element against its PAINTED ground, SVG
labels by fill. Pristine flagship: 352 failing rows across the standard-mode states (262 HTML text elements,
90 SVG labels) and more in high-contrast, from ~130 rules -- a grey ladder #444/#555/#666/#777 that is illegible in its
entirety on the dark ground (1.9-4.4:1), #8b0000 used as TEXT in fifteen rules (1.9-2.0:1: the
masthead, the active view button, the keyword chips), the five tier colours and four RSI grades
painted inline onto cream in high-contrast (2.0-3.3:1, 82 badges), and forty inline-coloured <strong>
keys in the methodology panels (1.5-3.4:1 on the dark panel; #ccc x24 at 1.61:1 on the white one).
    The shared stylesheet was the prompt's preferred home "so the fix propagates to wings that adopt
    the flagship's tokens". The flagship has no tokens: its sheet is literal colours in named rules,
    the wings already declare nine variables and are fixed, and an override list in wuld-type.css
    would reach only the names on it, need !important against the page's inline styles, and be a
    second place the flagship's palette is defined. So aa_remap.py edits combined.html itself: 76
    rule edits, each addressed by its selector and declaration and required to match exactly once,
    plus the template hooks. Values, all measured on their real ground: the dark greys → #88847c (the
    wings' --faint: 5.32 page, 5.07 card, 4.77 on the #181818 controls), hovers that were #666 →
    #a6a096 so hover still brightens; #8b0000-as-text → #ef3a58, the library's one crimson (5.11 page,
    5.19 on the #1a0000 chips) with the dark red kept everywhere it is a border, a fill, ::selection,
    or text on cream (8.8:1) -- the masthead is the one visible design change on the dark ground and
    it is deliberate; .psych-mechanism #996633 → #b1763b and TIERS[5] #9966cc → #a273d0, hue held; the
    cream-ground greys → #615b50 (5.0 on the darkest cream panel); the tier and RSI badges stamp
    data-tier / data-grade and high-contrast darkens each hue with hue and saturation held, computed
    to ≥5.0 over the badge's own tint, !important because inline outranks any sheet rule; the
    methodology keys become one class per key (mpk-*) with a value per ground. Two pre-existing
    high-contrast defects fell inside the same sweep and were fixed with it: the white RSI panel's
    #ccc labels, and the dep info panel's premise items painted in the family colour.
    Result on the deploy bytes, four modes x eleven states, 5,680 HTML text elements per mode: 0
    below 4.5:1, except the chin's aria-hidden wordmark (3.72, identical on every wing) and the
    first-visit hint caught mid-fade by one sample (12.72 settled, wing and flagship alike). Left,
    deliberately, and measured: the graph views' d3 label fills -- 82 objection labels at 7px #555
    and 8 band labels #333 on the dependency graph, the mechanism web's dimmed non-neighbours after a
    selection, 225 of 323 SVG labels below AA -- are the K74 legibility spec's declutter states and
    are not a stylesheet colour; re-adjudicating them is that spec's session, not this one.
    A type-fingerprint diff (1,534 matched text elements, three modes, eleven metrics) says
    integration is metric-neutral on the flagship: the only change the shared sheet makes is
    span.rsi-badge radius 2px → 0, the hard edge that is the flagship's own identity.

TWO TOGGLES, NOT FOUR BUTTONS. LEGIBLE and HIGH-CONTRAST as aria-pressed toggles; STANDARD and BOTH
buttons gone. The mode string, the arglib-mode key and the mode-change event are unchanged, so the
graph views' mode stash, the saved-mode boot and the layer's tour keep working; a reader saved on
`both` lands on both with both toggles pressed. The contrast toggle is NOT droppable on the evidence:
on the flagship it is the only route to the light polarity, which is a reader need, not a contrast
number. The wings keep their four buttons this session (§6); the tour's one sentence about the
modes now reads true on both shapes and dropped the claim that LEGIBLE lightens the page -- on the
flagship it never did (tourcopy_gate.py: 15 claims, 0 failures).

THE TWO FLAGSHIP GAPS (3.1b), CLOSED. The feedback control learned the row shape:
div.objection-header is the expander, so the injector reads the trigger line as the heading, the
badge strip as the classification, the sibling .detail-panel's .keyword chips as the colloquial
names, and stopPropagation on the link so a report does not open the card. Positioned top-right of
the row, left of the [+] glyph, level with the badge strip: 82/82 rows, 7.27:1 dark / 5.51:1 cream,
no overlap with glyph or label, keyboard-reachable, draft 806 chars, document and every row height
identical with and without the control at 1440/768/390/320. The flagship declares the four palette
variables the control reads (--fg --dim --faint --accent, per ground) -- it declared none, and the
shared sheet's dark-ground --dim would have been 2.1:1 on the cream row. The sound layer learned
the same row: hover and expand/collapse fire on the flagship's rows now (positive and negative
controls, sources counted at AudioBufferSourceNode.start; the wing row-for-row identical under the
deployed and the new JS). The top-nav examples/coda error is one null guard: render() ended by
writing to a #counts element that never came across from the standalone rwe.html, throwing on every
examples navigation and skipping applyHash's focus tail; the deep link still landed because the
view filters to the focused instance, so the visible gain is a clean log. In scope because it is a
flagship script edit and this is the session that may make one.

THE GATE MATRIX. Four modes x three tiers: html.wz-lightbg iff background luma > 90 (10.0 dark,
240.5 cream), glow on text iff vfx AND luma ≤ 90, bezel ::before shadow and LED glow present at vfx
and cosmetic in every mode, LEDs at .55/.55/.18 by tier, horizontal overflow 0 at pointer rest in
all twelve cells; reduced-motion: no pan, no tour; print: none of the layer's boxes render and the
stage padding is 0. One lip finding fixed at source: the bezel's top border is --wz-lip-y (12.4px at
900 tall) at every tier and the layer insets the stage on the sides only; the wings' first row starts
26px down by design, the flagship's wing-switcher row started 7px down, inline-styled, and lost the
top half of its glyphs. Its inline padding now adds the variable (declared on :root by the sheet, so
no script timing, CLS unchanged).

FOUND AND LEFT, WITH THE NUMBERS. (1) With the pointer at the left edge the camera pan translates the
stage +5.96px and the document gains 6px of scrollable width -- wing and flagship identically, 0 at
rest; a layer property with magnifier interplay, its own job. (2) The flagship overflows 147/217px at
390/320 on the PRISTINE page (its view-switcher and depth buttons do not wrap; it has no mobile
layout); 149/219 integrated, the 2px being the lip. (3) The wing's meta-strip lane costs +17/+106px
of document at 390/320 under the deployed JS as much as the new -- a property of the deployed lane.
(4) cccxxx, again: the drop's wuld-type.css (9,478 B) was not the part the deployed pack was built
from (13,339 B: the /troubleshooting/ crimson, tap targets, warm cast); the pack did not reproduce
(-3,861 B) until the true part was split back out of the deployed file. The drop copy is replaced.

CCCXXXII ALLOCATED — AN INLINE COLOUR IS A SINGLE-GROUND COLOUR. No colour clears 4.5:1 on both
#0a0a0a and #ffffff: the crossover luminance is 0.186, where both sides read 4.45 (against pure
black the crossover is 4.58, so this is a property of the ground PAIR, and every library ground --
#0a0a0a, #0b0b0c, #0c0c0c -- is on the failing side of it). So on a page with a dark mode and a
light mode, every `style="color:…"` on text is a failure in one of the two modes by arithmetic,
before any measurement, and only !important or a class can restate it per ground. The
flagship carried 65 inline colour literals, 43 on text, and every one of the 82 tier badges and the
methodology keys was among them; the wings' 17 inline .rsi-badge colours (Part A) were the same
fault. The test for a new rule is not "does it pass" but "which ground does it name".

THE PIN'S DEPENDANTS. Objection re-vendor: efilist objections-index.json and wuld-ink
src/library-objections.json are both d034af153aafa08c6f57884a9e7426a1 / 41,800 B -- the corpus did
not change, the re-vendor is a no-op by identity. Search-index regen: its inputs are wuld-ink src/
and that file; zero wuld-ink src/ bytes move this session, so the regen is a no-op by construction.
The apparatus page (second reissue, 5b5d1af) quotes the superseded pin as "byte-identical at the
time of capture" -- true as history; the film seat holds the new md5 and byte count
(RELAY_pin_moved_for_the_film_seat.md) and whether to re-measure is theirs. A third reissue re-ships
through ship script v4.2 (28922cd), which reads served-md5 == committed-md5 and has lost the stale
RESULT OK grep; the film link stays out until the film is public. Not run here.

STATE. library.wuld.ink: one commit atop 23fbbed, pushed by the block in the drop
(pinmove\PIN_MOVE_efilist_commit.ps1), which gates the three inputs on the pin's md5s, the three
outputs on the md5s above, stages exactly those three names, and reads the served /combined back
until its md5 is 62d1e8d8 -- pin==live by bytes, never by version string. wuld.ink: this stratum atop
5b5d1af after WI-K313f -- which at the time of writing was appended to the working copy and not yet
committed (reflog silent after 5b5d1af); the block commits it under its own subject first if that is
still so, then this one -- zero src/ bytes either way. Drop: pinmove\ holds the deploy inputs, the harness (hz.py and the
nine checks), the build scripts, two screenshots; the drop root's layer parts and packs are
replaced by the ones that reproduce. Carries: the wings' four mode buttons → two toggles (same
mechanism, their own session, NO-PIN); the graph-view label fills against the K74 spec; the pan
overflow at the left edge (layer); a CHANGELOG entry for the integration if wanted (NO-PIN
sidecar). Register: cccxxxii is the highest.

## WI-K315 — THE LAYER FIX AFTER THE PIN MOVE: the ? reachable by mouse, one tour flag per surface, softer cues with a master gain, a cache rule for /wuld-layer.*, .gitattributes for css/js; NO PIN; cccxxxiii and cccxxxiv allocated

FOUR THINGS THE FIRST EVENING ON THE MOVED FLAGSHIP FOUND, ONE DEPLOY, NO PIN. Josiah's release notes
from 2026-09-12 evening: no tutorial on the flagship, no feedback controls, the ? does nothing, the
cues too chirpy, "sometimes it activates, sometimes you turn it on and off". Read against the served
bytes (which were right: 82/82 controls and the library tour in a fresh browser) the four have three
causes, and none is in combined.html. Every fix is in wuld-layer.css/js and a Pages config file, so
the pin stays 62d1e8d86056465ebcb5daced38e0a83 / 2,974,039 B; the block gates on that blob before
and after. One efilist commit atop df4f785 carries four files: wuld-layer.css 24907d89 →
641dfe47eaabc5155135c176448f9cb0 / 60,123 B (+731), wuld-layer.js be7de70c →
6bda4b6c6e5e5a17625a0fcaf6546846 / 59,791 B (+2,045), _headers (new, 1,136 B,
461e038a9e060d59e4e4fa2eeac98d86), .gitattributes 114 → 152 B (f15ecc9bdf5b7f86f01cf7740494cdcc).
Parts reproduce the deployed packs byte-for-byte before the edit (cccxxx applied: split, compared,
then touched) and the packer accounts for every byte after it.

THE ? WAS MOUSE-DEAD ON EVERY SURFACE. .wz-chin is pointer-events:none so the page under the chin
stays clickable, and each of the three original buttons opts back in with pointer-events:auto.
.wz-help, built by wuld-tour.js at K313, never got the line. Measured: document.elementFromPoint at
its centre returned div.objection-header on the flagship, div.wz-stage on a wing, the html element
on the index -- three different things behind one button that was never there to the pointer. The
keyboard reached it (focus does not hit-test), and the K313 tour harness passed it because it called
el.click(), which dispatches the event without asking what is under the cursor. One declaration.
    cccxxxiii allocated -- A SYNTHETIC CLICK TESTS THE HANDLER, NOT THE CONTROL. el.click() and
    dispatchEvent deliver the event to the element by name; a pointer reaches an element only through
    hit-testing, which pointer-events, z-order, overlap and opacity all decide. A harness that
    dispatches the event it is testing for has proven that the handler runs, and nothing about whether
    a reader can make it run. The gate is elementFromPoint at the control's centre, then a real
    page.mouse.click there, on every surface the control appears on. layerfix.py does both; on the
    K314 bytes it goes RED six times (three surfaces × hit-test and click), which is the control.

ONE ONCE-EVER FLAG PER SURFACE. wuld-tour.js keys the library tour 'wz-tour:library' and the flag is
per origin -- but the "library tour" is three tours: the flagship's rows (seven steps: the view
switcher, the RSI methodology), a wing's cards (six), the index's list (four). Josiah saw the
veganism wing's tour first; the flagship's was then never offered. The surface is now read from
markup that is in the static HTML, so parse time and post-render agree: .view-switcher exists only on
/combined (→ 'wz-tour:library:flagship'), .lib-card only on /libraries/ (→ 'wz-tour:library:index'),
and the wings keep 'wz-tour:library' unchanged -- nobody who has seen a wing's tour is shown it
again by this change; the flagship and the index simply gain their own flags. The graph-view keys
(map, dep, map1, examples) were already per view and are untouched. Measured in one context with
fresh storage: wing → flagship → index, each tour starts, three keys land, the wing again does not
tour; and the reverse order. On the K314 bytes the second and third surfaces do not tour (RED ×4).
The parse-time claim of the hint key (the vfx one-liner that duplicates the tour's first step) uses
the same surface key, so it is claimed only on a surface whose tour has not run.

SOFTER CUES, AND THE NEXT ADJUSTMENT IS A NUMBER. Hover 0.18 → 0.064 (-9 dB) and its rate limit
120 → 250 ms -- on 82 rows it was the loudest thing on the page; click 0.42 → 0.21, expand 0.38 →
0.19, collapse 0.34 → 0.17 (-6 dB); magnifier, tier step and the room tone unchanged, because they
answer a deliberate press, not a passing pointer. A master --wz-sfx-gain (default 1, on :root in
wuld-vfx.css, read by play() the moment each cue starts, clamped 0..2) scales everything including
the ambience, so Josiah can try a value live in the console --
document.documentElement.style.setProperty('--wz-sfx-gain','0.5') -- and the value he settles on is
written into one CSS line, not rebuilt. Measured by instrumenting createGain: expand/collapse 0.19 /
0.17, hover 0.064, two hovers 180 ms apart → one cue (the K314 bytes keep both), 400 ms apart → two,
gain 0.5 → hover 0.032, gain 0 → the magnifier press at 0. This is a taste call made by measurement,
not by ear: the first cut is Josiah's to ratify, and if "chirpy" survives the level the next lever is
timbre (a low-pass on the hover cue), which was not shipped because nobody here could listen to it.

THE CACHE, AND A RECOMMENDATION THIS SEAT MADE FROM THE WRONG SOURCE. Pages serves /wuld-layer.css
and /wuld-layer.js with cache-control: public, max-age=14400 and the HTML with max-age=0 -- so for
four hours after any layer deploy a reader who had opened any library page ran the NEW page with the
OLD layer. That is Josiah's missing FEEDBACK controls, the silent rows and the page-to-page
flakiness: the page and its layer are not one artefact, and "link, don't inline" made them two. The
TODO written the same evening prescribed a _headers rule with max-age=0, must-revalidate. That rule
would have deployed and changed nothing: the zone's Browser Cache TTL is 4 h and Cloudflare's own
sentence is "respects whichever value is higher: the Browser Cache TTL in Cloudflare or the max-age
header" -- and wuld.ink had already measured exactly this at K24o/K24p: /components/* at 300 and the
exact-path probe at 600 both still come back 14400 today, /robots.txt at 3600 too, while /favicon.svg
at 2592000 and /sitemap.xml at 3600 (uncached type, DYNAMIC) are honoured. The documented exception
is `private` -- "if origin returns private in Cache-Control then preserve it" -- so the rule shipped
is Cache-Control: private, max-age=0, must-revalidate on the two layer files: the edge does not
store them, the browser keeps its copy and revalidates by ETag (one 304 per page load; the bytes
travel only when they changed). The sound files stay on the default. The deploy block reads the
served header back and says which of three things happened: `private` served (honoured), 14400
still (the floor wins even here: the fallback is the dashboard, Caching → Configuration → Browser
Cache TTL → Respect Existing Headers, which would also give wuld.ink's /components/* the 300 it has
asked for since K24l), or something else (printed raw). Ctrl+F5 remains the reader's remedy until
the rule is seen to hold. Nothing in this deploy is versioned with ?v= -- the flagship's links are
pinned bytes.
    cccxxxiv allocated -- A FIX PRESCRIBED FROM THE FILE'S SYNTAX, NOT THE ZONE'S BEHAVIOUR. The
    _headers rule was written from what the file format allows, on a zone whose own log records
    that shape being refuted (K24n lxix, K24o lxxi) and whose vendor documents the floor in one
    sentence. Before prescribing a change to a dependency's behaviour, read the dependency's behaviour
    -- a probe of the live zone, the vendor's sentence, and this project's own history with it -- and
    let the deploy block read the result back rather than assume the rule held.

.GITATTRIBUTES. efilist's file listed html/md/cff/json/jsx/py and no css/js; the K314 deploy printed
"LF will be replaced by CRLF" for both layer files, meaning the next checkout would flip the working
copies while the blobs stay LF, and a working-copy md5 gate would misread. Two lines added; the
block gates the INDEX blobs (git rev-parse :wuld-layer.css) against the SHAs computed here, which
proves the normalisation as well as the bytes.

FOUND AND LEFT. (1) Under a light OS colour scheme the wings resolve wz-lightbg (cream ground): the
glow gate closes and, since sound rides the same gate, the wing is silent -- sfxcheck's wing rows
read 0 starts on the K314 bytes as on these; under a dark scheme, 4. The flagship's ground is dark
either way. Pre-existing policy, TODO item 5, Josiah's to decide. (2) The harness's SUPPRESS now
sets the two new keys too, or the flagship tour would mask every pixel run (cccxxvi's family).
(3) navcheck GREEN on the new packs, CLS 0.0828 unchanged; fbcheck unchanged on both surfaces.

STATE. library.wuld.ink: one commit atop df4f785 by the block in the drop
(layerfix\LAYER_FIX_efilist_commit.ps1): base blobs gated at HEAD (both packs, .gitattributes, the
pin), _headers required absent, four inputs gated by md5, four index blobs gated by SHA, exactly
four names staged, the pin's blob re-read after the commit, a gated push, then the served packs read
back until both md5s match with http status and byte count beside every hash, the served
cache-control classified, and /combined re-read as 62d1e8d8. wuld.ink: this stratum atop the log
as it stands -- WI-K314 landed at c8619fb (1,248,030 B / dcea1aa9); if WI-K313g has landed since,
the block appends after it, refusing if either numeral above already appears in the log. Zero src/
bytes. Drop: layerfix\ holds the four deploying files, the two blocks, this stratum, the harness
(layerfix.py + hz.py); the root's four edited parts and both packs are replaced by the ones that
reproduce; P5_STATE.md and TODO_after_the_pin_move.md updated. Carries: the rest of the TODO -- the
v4.0.2 relabel and the loci sweep, the README captures, the relay archive, the wings' two toggles,
the light-scheme policy. Register: cccxxxiv is the highest.

## WI-K316 — THE REST OF THE LIST: v4.0.2 relabelled on both sites, the feedback control becomes a form, the wings' two toggles, the README recaptured, the drop filed into archive/; NO PIN; cccxxxv allocated

FIVE BLOCKS, NO PIN, IN ORDER. (1) efilist, twenty files, one commit: the layer packs (wuld-layer.css ff36237021ef307a1b612a9da9e81f68 /
63,976 B, wuld-layer.js a0c46518eeb88c4bc151ab1797e7eb6a / 69,958 B), the five wings and libraries/index.html, README.md, CHANGELOG.md,
the corpus JSON's version field, nine captures. (2) wuld-ink: the site's own pin tool run against release_v4_0_2.json, the changelog
entry, feed.xml, the search index. (3) wuld-ink: the drop filed into archive/. (4) the deletion of the filed originals, gated on
origin/main holding every blob. (5) this stratum. combined.html is gated by blob before and after the efilist commit; the pin stays
62d1e8d86056465ebcb5daced38e0a83 / 2,974,039 B, and from this evening it is called v4.0.2.

THE FEEDBACK CONTROL IS A FORM NOW, WITH THE MAIL DRAFT KEPT AS THE SECOND DOOR. Josiah's ask, in his words: a drop-down form, a
message without needing an address, the alias still reachable. wuld.ink/contact already posts to a hosted relay (Formspree, form
xpqnzqlr); the control now posts there too, as JSON, from the page -- probed first from the container with the library's origin: the
CORS preflight allows it and a honeypot-filled post answers 200 {ok:true}, which is the relay discarding it, so nothing was mailed by
the probe. The panel is a fixed element on <body>, anchored under the control that opened it and following it through scroll, resize,
the camera pan and the stage's transition -- outside the stage because the flagship's toggleObjection() rebuilds the whole #results
list on every click, and a panel inside a row would die with the row. It carries the card's own context (library, objection, its
colloquial names, classification, id, link) as hidden fields, a message, an optional address that becomes the reply-to, a honeypot,
a Send, the mail-draft link, and three states: sending, sent (closes itself after 1.8 s, focus back on the control), error (the
relay's own message if it gave one, and the mail link beside it). A stray click outside closes it like any popover, but the draft is
kept for that card and comes back when the same control is opened again; a different card starts empty. Measured with the relay
routed locally (no mail ever sent): on both card shapes the control hit-tests and a real click opens the panel under it without
opening the card; an empty Send posts nothing; a message posts the eight fields with `email` present only when given; {ok:true}
lands 'sent' and the panel closes; a 422 with an errors[] message and a network failure both land 'error' with the mail link there;
the honeypot filled posts nothing and reads 'sent'; Escape and an outside click close; a row clicked while the panel is open closes
the panel and opens the row (the click is not swallowed); 82 controls are re-injected after the re-render. On the K315 bytes the
harness fails at its first panel check and can go no further, which is the control it can have. The tour's feedback step says what
the control now does; tourcopy_gate still 15 claims, 0 unsourced.

THE PAN'S 6 PX, CLIPPED. K314 measured the camera pan adding --wz-pan of scrollable width with the pointer at the left edge -- on
Windows a horizontal scrollbar that appears and disappears with the pointer. Clipped on the root (`overflow-x:clip`, which the viewport
reads as hidden while overflow-y stays as it was) only under a fine pointer and only while unzoomed, because the magnifier's growth is
right-and-down from origin 0 0 and NEEDS the horizontal overflow; html.wz-zoomed releases it. Measured: pointer at x=2, --wz-px 5.98px,
a horizontal wheel moves the page 0 px (6 on the K315 bytes); zoomed to 1.12, overflow-x back to visible.

THE WINGS' TWO TOGGLES. The K156 bootstrap on the five wings and the umbrella index is one script in six copies; wing_collapse.py
edits the six exactly-once (markup, sync(), setMode(); the IDS table dropped) and refuses if any file differs in shape. The mode strings,
the storage key wuld:libmode, data-mode and every [data-mode] rule are as before; LEGIBLE and HIGH-CONTRAST are pressed when their
axis is on and the four modes are their four combinations. Measured on all six pages: legible → both → high-contrast → standard,
aria-pressed and storage in step at every click, a reload keeps the choice; the pristine files fail all six (RED ×6). The front-door
badge reads pinned v4.0.2 in the same edit.

V4.0.2 ON BOTH SITES. efilist: the README's pin table, the CHANGELOG entry (PATCH by the file's own definitions -- invariants
byte-identical, no content change; v4.0.1 called the same condition MINOR, and the entry says so rather than pretend the precedent
was the rule), the corpus JSON's version field (the filename frozen, per convention), the front-door badge. The canon is untouched at
38.1: it names neither 9d13359e nor v4.0.1 -- the pin lives in the manifests, the README and wuld.ink, not in the canon's
attestation, and the README's sentence to that effect is corrected. wuld.ink: release_v4_0_2.json in the shape of v4.0.1's, then
tools/library-pin.py -- dry run must print GATE: GREEN (it live-fetches /combined three times and refuses unless all three are
62d1e8d8), then --apply --date 2026-09-11, operator-local, not the sandbox's 12th (K47 cxc; the CHANGELOG entry first carried the 12th
and was corrected before shipping). The tool sweeps md5, version and byte count across src/**/*.html|js with its held provenance
phrases untouched, prepends a releases.json entry cloned from v4.0.1's, regenerates feed.xml and rewrites its state. The block then
replaces the cloned summary with the v4.0.2 prose exactly once, regenerates the feed again and the search index, and before staging
anything walks every changed file: each added line must carry the new md5, version or byte count and each removed line the old, or
nothing is staged. The read-back is /library-about/ saying v4.0.2 and 62d1e8d8 and no longer naming 9d13359e.

THE README, RECAPTURED. Nine screenshots from the deploy bytes at 1440×900, sRGB, tours suppressed, the hint quieted: the library
rows, the argument flow with a source selected (the first capture had none -- the list items are .m1-source-item, and the caption
promised a prediction the picture did not show), the dependency graph, the mechanism web, the examples table, high contrast, a wing
with its two toggles, the feedback panel open with a sentence typed, the magnifier at 1.97×. Palette-quantised with dithering, 3.6 MB
→ 1.64 MB, the glow surviving the quantisation (checked on a crop). The README reordered: what it is → open it → what it looks like →
the presentation layer → the deliverable and the pin → the suite → status → structure; the offline note now says what does not travel
with the file; the first draft's "every text colour to AA" was cut to "every HTML text colour" because the graph views' SVG labels are
a carry, not a claim.

THE DROP, FILED. 215 files into wuld-ink/archive/{relays,kickoffs,ship-scripts,measurement} with an INDEX.md (file, date, first line)
and a relays/ row in the archive README: 112 relays and rulings, 21 strata (K310w through K315 plus this one), the ship scripts
(K313b–K316, the P5 deploys, the ship script v4.1 and v4.2), the P5 documents and specs, the pin-move and layer-fix harnesses, the
K310–K313 apparatus instruments, wuld_live_test.js retired under that name. Text only, 200 KB cap, credential-shaped strings scanned
(0), CRLF normalised to LF. Left in the drop on purpose and said so in the INDEX: P5_STATE.md and the TODO (still being written), the
film seat's own working files (theirs to file when that seat closes), payload copies and screenshots (the convention excludes them),
and the May–July efilist session material (the efilist repo's archive, its own pass). The staging agent had put the two pack copies
in; they came out. The delete block runs only after the push and verifies, per file, that origin/main holds the archived blob and
that the drop copy still hashes to what was filed.

FOUND AND LEFT, WITH THE NUMBERS. (1) Josiah, on the live flagship: under the magnifier the LIBRARY | EXAMPLES | CODA bar floats
mid-panel in one section of the methodology text and nowhere else tested -- a sticky element whose scrollport arithmetic is done in
unscaled space while the stage is scaled; the candidate fix is one layer rule, `html.wz-zoomed .top-nav{position:static}` or its
equivalent, unbuilt because he asked for it later. (2) Josiah, same evening: the camera pan should be stronger when zoomed -- enough
to read a magnified paragraph from word to word by moving the pointer, bounded so the stage never leaves the page. Today the pan is a
constant --wz-pan at any zoom (composed outside the scale by design). A pan proportional to (zoom − 1) times the viewport, clamped to
the stage's overflow, is the shape of it; unbuilt. Both are in the TODO. (3) The search index regenerates on wuld.ink under the
relabel block, not here: this container cannot run the site's tooling, so the block runs it and gates the diff shape.
    cccxxxv allocated -- A PROBE THAT CANNOT REACH ITS TARGET REPORTS THE PREVIOUS STATE. Twice tonight a harness clicked a control
    whose box lay outside the viewport: the click landed on nothing, no error was raised, and the reading that followed was the
    reading from before -- the draft text still in the hidden textarea, a wing's third control "opening" with the second's message.
    Playwright's mouse.click at viewport coordinates has no notion of a miss. Every harness that positions by rect must first assert
    the rect is inside the viewport (or scroll it there and re-read), or its verdicts on off-screen controls are the last verdict
    repeated.

STATE. library.wuld.ink: one commit atop the K315 landing, twenty files, by K316_efilist_commit.ps1 (base blobs at HEAD for the
eleven replaced files, absence for the nine new, twenty inputs by md5, twenty index blobs by SHA, the pin's blob before and after, a
gated push, the served packs, the veganism wing and the index read back by md5, /combined re-read as 62d1e8d8). wuld.ink: three
commits by three blocks -- the relabel, the archive, this stratum -- each gating the clone against origin/main first. Drop: k316\
holds the twenty efilist files, the manifest, the summary swap, the five blocks, this stratum, constants.json; archive_staging\ is the
filed tree with MANIFEST.tsv; the root's parts and packs are the K316 build. Carries: the two new TODO items above; the graph views'
SVG label fills (a pin move); the flagship's phone layout (a pin move); the tint hue; the wings' light-scheme silence (policy); the
library seat's K232 items; the film seat's files. Register: cccxxxv is the highest.

## WI-K316b — the relabel swept a dated record: the film's apparatus page restored to the pin it was captured against; the pin tool taught to skip it; cccxxxvi allocated

THE SWEEP DID WHAT IT SAYS AND ONE FILE SHOULD NOT HAVE BEEN IN IT. tools/library-pin.py replaces the old md5, version and byte
count in every src/**/*.html|js, holding five version PHRASES that are provenance (a substrate tag, a dated record). It holds no
md5 or byte-count phrase, because until tonight no page carried the pin's hash as history. The apparatus page for the library
showcase film does -- three times: "Source: the pinned artifact combined.html, md5 9d13359e…, 2,963,789 bytes, byte-identical to
the published pin at the time of capture"; the numbers table's "Deployed file"; "Every frame of the library's interface in this
film comes from one artifact … All eleven of the film's interface takes were rendered against that pin." The v4.0.2 relabel
(9469367) rewrote all six to 62d1e8d8 / 2,974,039, and for forty minutes wuld.ink said the film's frames came from a file that
did not exist when they were captured. WI-K314's own stratum had named this page and this sentence -- "true as history … whether
to re-measure is theirs" -- and the block that swept it was written by the same seat the same night. The block's diff gate passed
it because every added line carried the new pin and every removed line the old: a relabel-shaped change. The gate could see the
shape of a line and not whether the sentence around it was a claim about now or a record of then.
    Restored in one commit: src/argument-library/apparatus/index.html back to its bytes at 808c2ee (98b58c3b628c25ee891ccf75a990d7ed /
    39,376 B -- the second reissue, exactly six substitutions reversed, verified byte-for-byte against the pre-sweep blob), and
    tools/library-pin.py given EXEMPT_FILES, a list of paths under src/ that the sweep and the residual scan both skip, with the
    apparatus page in it and the reason above it in the source. The Markdown the page is built from (apparatus_libshow.md, in the
    drop) still said 9d13359e throughout; a reissue through ship script v4.2 would have restored the page and its verifier would
    have refused the swept one -- the correction is what a reissue would have done, done now, without the film seat's pipeline.
    cccxxxvi allocated -- A RELABEL SWEEP REWRITES DATED RECORDS, AND A DIFF-SHAPE GATE CANNOT SEE A DATE. Any sweep that
    replaces every mention of a value assumes every mention is a live claim; a page that says what the value WAS at a named time
    is falsified by the replacement, and the more faithfully the sweep works the more completely it falsifies. The guard is not a
    smarter diff -- a line does not carry its tense -- but a list of files that are records, kept beside the tool, and a seat that
    puts a file on that list at the moment it writes "true as history" about it rather than the night after.

STATE. wuld-ink: one commit by k316b\WULD_apparatus_restore_commit.ps1 (HEAD blobs of both files gated -- the swept page d10f1bbe,
the tool 31eebaa5 -- the two inputs by md5, exactly two names staged, index blobs, a gated push, the served apparatus page read
back until it names 9d13359e three times and 62d1e8d8 not at all), then this stratum. Nothing else moves: the relabel's other
seventeen files are live claims and stay swept; the search index carries neither hash. Film seat: the apparatus page is as their
second reissue left it; the pin the site serves is 62d1e8d8 and the film's is 9d13359e, which is what the page says. Register:
cccxxxvi is the highest.

## WI-K317 — under the magnifier the pointer is the camera; the flagship's sticky bar un-stuck while zoomed; NO PIN; cccxxxvii allocated

TWO OF JOSIAH'S ITEMS FROM THE K316 EVENING, BUILT AS ONE LAYER DEPLOY. (1) "Increase camera panning ability when zoomed in -- if a
user zooms in on a paragraph but the full paragraph is not visible, the camera panning strength should be just enough so that they
can look from word to word to complete the paragraph but not off the web page and into the void." (2) The LIBRARY | EXAMPLES | CODA
bar floating mid-panel under the magnifier "in a specific section of the methodology panel" and nowhere else he tried. Four efilist
files in one commit by k317\K317_efilist_commit.ps1: the two packs (wuld-layer.css c06d23100aa628b02777736193f90d33 / 65,661 B,
wuld-layer.js 895325023541685808f1ae332f0739d8 / 76,494 B), one clause in the README, the v4.0.2 Layer bullet in the CHANGELOG. The
pin's blob is gated before and after; /combined stays 62d1e8d86056465ebcb5daced38e0a83 / 2,974,039 B.

THE POINTER IS THE CAMERA. Unzoomed the pan stays what K314 made it: 6px toward the pointer, under the lip, the no-void guarantee
by construction. Zoomed, 6px is nothing against a line three viewports wide, and the reader has no wheel for the rest of it --
Shift+wheel is the zoom, and once the magnifier button is armed the plain wheel is too. Written down, "just enough to finish the
paragraph but not into the void" is a statement about geometry, not a number: the pointer's place across the viewport now maps onto
what the scaled stage hides past that edge. At the centre nothing moves; at the right edge everything past the right edge has come
in; at the left edge everything past the left. The sweep IS the overflow, so no amplitude was chosen and none can be wrong, and the
stage's edge can never cross the viewport's because the map's range is exactly the hidden extent. Vertically the same map, capped at
(zoom - 1) times half the viewport per side, because the wheel still scrolls that axis and a page is tall. The 6px rides on top at
every zoom, so the feel is continuous through 1.0. Three consequences had to be built with it. A wheel scroll with the pointer
still moves the bounds and not the camera: the scroll handler clamps and never re-places, so nothing moves that the reader did not
move. The pointer leaving the window keeps the camera where it was, because the reader who overshoots the window's edge while
finishing a line must not have the line pulled away. And a zoom step taken under a large pan has to keep the point under the
cursor under it: the K316 arithmetic divided the raw scroll by the old zoom, which was exact to 0.7px while the pan was 6px and
would have slid the anchor 120px per step under a camera of 1,000; the camera's translation is composed outside the scale, so it
comes off before the division, and after the step the camera is split between scroll and pan by a bisection on the monotone map
so that the pan is what the pointer's model gives at that scroll and the next move changes nothing. Measured on the deploy bytes at
2.476x: pointer at the right edge, the stage's right edge 0.5px inside the viewport's; at the left edge, 4.5px; a 3,513px-wide block
readable end to end by the pointer alone (left edge 30.9, right edge 1,413.2 in a 1,440 viewport); 180 pointer positions across five
scroll positions with no stage edge inside the viewport beyond the lip; a scroll to the top and to the bottom with the pointer
parked at an edge, no void; a zoom step at 2.476 -> 2.773 taken with the pointer at the right edge, anchor drift 0.02px; mouseleave
keeps the camera (-2,456.8px); Escape returns zoom 1, camera 0, scroll 0; at 1x the pan reads 5.98 / -5.98 / 3.58, the K314 numbers. The wing
(veganism) obeys the same invariants at the same zoom. On the K316 bytes the same harness reads the camera at 6px with 1,058px
still hidden, the block unfinishable, mouseleave resting to 0 -- the control it can have.

THE STICKY BAR, EXPLAINED AND UN-STUCK. position:sticky is resolved by layout against the scrollport in the page's own coordinates;
the stage's scale is applied at paint. Scrolled s under zoom k, the bar is placed at layout y = s and painted at k*s - s = (k-1)*s
(plus k times its own `top`): it drifts DOWN the viewport as the reader scrolls, floats mid-panel until that passes the viewport's
height, and is then simply below the fold -- seen in one section near the top of the page and "nowhere else" because the band of
scroll positions in which it is visible is the top of the page. Measured on the K316 bytes at 1.974x scrolled 752: the bar 760.6px
down, (k-1)*752 + k*14.4 = 760.7. One rule in wuld-vfx.css: while html.wz-zoomed, the flagship's .top-nav and the examples
view's .sidebar (the only two sticky elements in the suite; the wings and the index carry none) are position:relative, so they
scroll with the page like everything else; Escape restores the zoom and the stickiness with it. Measured: relative under zoom, the
bar 635px above the viewport after the same scroll and gone after more; sticky again at its own top (14.4px, under the lip) after
Escape; the sidebar likewise. The tour's magnifier step and the README's magnifier sentence say what the pointer now does; the
CHANGELOG's v4.0.2 Layer bullet carries both items. tourcopy_gate: 15 claims, 0 unsourced. The K316 battery re-run on the deploy
bytes: fbform, layerfix, navcheck, wingtoggle GREEN; the sound probe unchanged (the sfx part is byte-identical).
    cccxxxvii allocated -- A CONTROL IS PROVEN BY ITS OWN ARITHMETIC, NOT BY A ROUND NUMBER. Twice tonight the control run
    failed for the harness's reasons and not the code's: the expected drift was written as (k-1)*300 because the harness had
    scrolled 300, when the zoom had already scrolled the page 452 to hold its anchor and the bar sat at (k-1)*752 + k*top; and
    the old arithmetic's anchor error was expected to exceed 10px when it is proportional to the pan, which on the old bytes is
    6px, so 0.7px was the correct failure. A control whose expectation is a number the author found convenient tests the
    author's arithmetic; the expectation has to be derived from the state the harness actually produced and the mechanism the
    old bytes actually have, or a passing control proves that the harness agrees with itself.

STATE. library.wuld.ink: one commit atop 264c0f2 by K317_efilist_commit.ps1 (four base blobs at HEAD, four inputs by md5 and byte
count, exactly four names staged, four index blobs by SHA, the pin's blob before and after, a gated push, both packs read back by
md5 with status and bytes, /combined re-read as 62d1e8d8). wuld-ink: this stratum. Drop: k317\ holds the four files, the two
blocks, this stratum, constants.json, the harness (k317.py) and its two runs. Carries: the flagship's phone layout (a pin move,
its own kickoff -- PROMPT_flagship_mobile_pin_move.md in the drop, with the graph views' SVG label fills folded in so there is one
pin move); the wings' mobile pass (Josiah: "refusal libraries already look good on mobile"); the tint hue; the wings' light-scheme
silence; the library seat's K232 items; the film seat's files. Register: cccxxxvii is the highest.

## WI-K318 — THE SECOND PIN MOVE OF SEPTEMBER: the flagship laid out for a phone, the graph views' SVG labels to AA on their painted ground; v4.0.2 → v4.0.3; cccxxxviii and cccxxxix allocated

ONE MOVE, TWO CHANGES, AS THE K317 KICKOFF ORDERED IT. The spending condition held: P5_STATE and the remotes showed WI-K317 run
(efilist 2c58e8f atop 264c0f2, the packs serving c06d2310 / 89532502; the WI-K317 log commit at 7d7635f), /combined read
62d1e8d86056465ebcb5daced38e0a83 / 2,974,039 B three times, and the register's tail said cccxxxvii. combined.html was hashed
before the first edit and is edited by a script (k318_edit.py) of 24 exact-once string replacements over those bytes -- a
search text that matches zero or several times aborts before anything is written -- so the build is reproducible from the pin
and the drop: 62d1e8d8 / 2,974,039 → 62c733ac8263e6413816cfb6d28e3b8a / 2,982,420 B (+8,381), git blob 3f07748b. PATCH: the
five data literals (OBJECTIONS, REAL_WORLD_EXAMPLES, MAP1_TRANSITIONS, DEP_GRAPH_DATA, MAP_GRAPH_DATA) and the rwe-data block
are byte-identical between the two files, literal for literal; the objections index is unchanged (d034af15); the 18 removed
lines are fills, two tick-handler wrappers and one inline attribute. Six efilist files in one commit by
k318\K318_efilist_commit.ps1 (combined.html, README, CHANGELOG, the corpus JSON's version field, the front door's badge, the
re-captured dependency-graph.png travelling as base64 text); the layer is not touched.

WHAT A PHONE SAW, MEASURED ON THE PIN. Mobile contexts (is_mobile, has_touch, dsf 2) at 390×844, 360×780 and 430×932, both
grounds, tour suppressed, vfx tier. The library view overflowed the viewport by 149 / 179 / 110 px -- the view switcher's
fourth tab (ARGUMENT FLOW, right edge 533) and the RSI METHODOLOGY button (539) off-screen with no tap able to reach them; the
mechanism web and the dependency graph by 145 / 175 / 104 (the same switcher); the argument flow by 369 / 399 / 328, a
`320px | 1fr | 360px` grid on a 342px canvas; the examples and the coda by 43 / 73 / 3, which is the shared nav's mode toggle
(LEGIBLE / HIGH-CONTRAST past the right edge under LIBRARY | EXAMPLES | CODA). At 390 in the library view 12 element rects
passed the viewport's edge, 140 in the mechanism web (the drawing's own nodes, three screens wide under an overflow:hidden
canvas), 204 in the flow map with a source selected. Of the library view's 107 interactive elements 96 were under 36px tall:
the nav buttons 24, the tier filters 28, the depth buttons 28, the layer's FEEDBACK controls 26. The wings and the front door:
0 overflow at all three widths (seven pages), as K317 said.

THE PHONE RULES. One `@media (max-width: 600px)` block at the end of the page's own stylesheet, flat selectors under the
`body[data-active-view=...]` parents, nothing outside it. The shared nav wraps when its five buttons do not fit and is
position:static at that width -- two sticky rows would hold 11% of a phone screen, and the wings' header scrolls too. The
four view tabs become a 2×2 grid (minmax(0,1fr) cells so a legible-mode label wraps inside its cell): all four visible at 360,
where a scrolling strip -- the other option the brief named -- would hide the fourth tab, which is the defect. The depth row
wraps with its label on its own line and the RSI button on the next. The graph toolbars wrap; the zoom buttons grow to 36; the
flow map's three columns stack, its search takes the row, its source list keeps a 280px scroll. The examples' filter bar becomes
`auto | 1fr` rows of label and control with the reset on its own line, the view tabs wrap as tabs rather than as words, and a
field's unbroken token (a 36-character hyphenated note) wraps rather than pushing past the card. Every control-row button is at
least 36px tall -- nav, view tabs, tier filters, depth, RSI, graph toolbars, zoom, flow controls, examples tabs, selects and
reset -- by min-height, not padding, so no mode's padding rule has to be out-specified; the in-card chips (SHOW IN MAP / DEP,
COPY, the plain and NOTE toggles, the examples badge and pills) 28px: above WCAG 2.2's 24px minimum, below 36 because a 36px
chip inside a card's text block breaks the line it sits in. On the new bytes every one of 54 states -- library, a card open,
the RSI panel, web, graph, flow (with and without a source), examples, coda; three widths; both grounds -- reads scrollWidth −
clientWidth = 0 with no element rect past the viewport; legible and both at 360 and 390 likewise; the layer off (tier 0)
likewise; every control reachable by a vertical scroll and a tap that hit-tests to itself. Under 36 there remain the layer's 82
FEEDBACK controls (26px, the layer's bytes), the wing-switcher's link (17px, the K123 inline-styled bar in six copies) and the
examples' <summary> rows (26px, full-width).

THE GRAPH CANVASES. The force layouts are tuned for the desktop canvas and drew three screens wide; the brief's two options
(viewBox, or a scroll box) were both wrong for a canvas under d3.zoom, which owns the touch events a scroll box would need. On a
phone each simulation is settled synchronously (alphaMin / alphaDecay ticks, which is what d3 would run) and the zoom transform
set to the drawing's bounding box, so pinch and drag continue from the fitted frame and ZOOM FIT does the same; the dependency
graph is laid out on its desktop canvas (1400×900) before the fit, because the K74 column layout is computed from the canvas
and overlapped its nine premise boxes below ~1000px; the flow map's viewBox becomes the drawing's bounding box after render, so
the labels around the ring stay on the canvas; both legends start closed (open, they covered half a 390px canvas); the graph
containers are 100vw tall on a phone. These are overviews: a 7px label renders at 2–3px until pinched; the source list and
the detail panel carry the text. None of it runs at 601px and up. One trap found and kept out of the bytes: the first cut hid
the flow map's empty canvas with `:has(#m1-graph:empty) { display:none }`, and since m1RenderGraph measures its container's
width at the start of a render -- when the SVG is still empty -- the radius came out 0 and every node sat on the centre. The
container now collapses its height and border while empty and stays in layout.

THE FILLS, AND WHAT A CENSUS HAS TO STAND ON. K314 left 225 of 323 SVG labels below AA as a carry. Re-measured here with the
K314 census states plus the flow map's three other modes, four display modes, 377 label readings per mode, each read against the
ground it is painted on: the canvas for a label beside or above its dot, the family rect or the tier circle for a label whose
centre lies inside one (compositing the shape's fill and fill-opacity over the canvas). 127 readings per mode are the K74
de-emphasis states -- a selected node's non-neighbours at opacity .12 / .06 -- an opacity, not a colour, reported apart. Of the
250 undimmed readings 123 were below 4.5:1 on the dark ground and 172 on the cream. The fills, all measured: the objection
labels of both graphs #555 / #666 → #88847c (the wings' --faint, 5.32 on #0a0a0a) and #777 / #888 → #615b50 on cream (5.52); the
band labels #333 → #88847c and #999 → #615b50, the legible-mode pair likewise; the premise labels and their strong/weak counts
solid (#e8e8e8 dark, #fff cream) with black on the mustard family in both grounds and on characterization in cream, because on
rgb(158,115,11) white reads 4.26 and black 4.90 -- a data-family attribute stamped on each premise group is the hook and the only
DOM change; the flow map's T-badges and source label #1a1a1a on cream, white kept inside the red source node; the stars #b8860b →
#7a5c00 on cream (5.13); the "No successors" text a class with a value per ground instead of one inline #555. After: 0 and 0,
minima 4.93 (dark, black on the mustard) and 4.70 (cream, white on the empirical green); the README's AA sentence widens from
"every HTML text colour" to every text colour, the dimmed states named. Two things the K314 method could not see, in both
directions: the flow map's T-badges in high-contrast were white on cream circles (1.13:1 -- invisible) and it read them against
the cream canvas as fine; and black on the mustard rect, which is correct, it would have failed against the dark canvas. And one
thing about the K314 numbers themselves: entering a graph tab defaults the display mode to STANDARD (the K73 stash), so a census
that sets the mode before clicking the tab measures the dark ground in every mode -- K314's four-mode graph figures were four
readings of the dark ground; the cream here is an explicit mode click inside the tab.
    cccxxxviii allocated -- THE GROUND IS WHAT IS PAINTED BEHIND THE GLYPH, NOT THE NEAREST CSS BACKGROUND. A contrast census
    that walks DOM ancestors for a background reads every SVG label against the canvas, which is right for a label beside its
    dot and wrong for a label on a rect or in a circle: it passes white on a cream circle and fails black on a mustard box. The
    ground has to be composited from whatever is drawn under the glyph -- shape fills and their opacities included -- and the
    page has to be in the mode the census claims to measure, checked from the body's class after the last click, not from the
    key that was set before the first.

DESKTOP UNCHANGED, AND WHAT THAT CONTROL CAN BE. The nine README captures re-taken at 1440×900 from the pin's bytes and the
new bytes under one seeded Math.random, every CSS animation frozen and each force simulation run to rest before its capture:
seven PNGs byte-identical. The two graph captures differ by ±1 channel values even between two runs on the SAME bytes -- 6 and 22
pixels of 1.3 million, the rasterizer's noise under the layer's drop-shadow filter -- so for them the control is the settled SVG
DOM: every element, attribute, class and label identical, positions within 0.008px against a null-run drift of 0.014px, the
dependency graph carrying its 13 data-family attributes and nothing else. The phone half alone moves no desktop pixel; the fills
move the dependency graph's label colours and nothing else on the page (the mechanism web's objection labels are display:none
until hover, so its capture is byte-identical), and that one capture is re-taken for the README. The K316 battery -- navcheck,
fbform, layerfix, wingtoggle, k317 -- is GREEN on the new bytes.
    cccxxxix allocated -- RUN THE CONTROL ON THE NULL CASE FIRST. A control that compares two captures has a noise floor, and
    the floor is not zero for a filtered, composited canvas: identical bytes produced different PNGs. Before a control is
    allowed to fail the candidate it has to have passed the pin against itself; where it cannot, the comparison moves to a
    layer that is deterministic (here the settled DOM) and the tolerance is the null run's own drift, measured, not chosen.
    A byte-identity expectation written into a brief is a hypothesis about the harness until the null run has confirmed it.

THE LAYER AT PHONE WIDTH, MEASURED AND LEFT. At 360 and 390: the feedback panel opens 336 / 366px wide inside the viewport, the
tour card is 336 / 340px, the chin's four 44px controls sit at y 740 / 802 and cover no toggle, and at the foot of every page
nothing sits under the chin; mid-scroll, content passes under the fixed band as under any fixed bar. Nothing in the layer
changes; no layer deploy. Josiah's three questions, answered with the contact sheets sent (390 and 360, dark then cream, six
states each): accessible -- every control on screen and tappable, 0 overflow in 54 states, every label at AA on its ground;
cluttered -- the first library screen is chrome to 760px of 844 before the first row (the wing-switcher bar wraps to three
lines, the nav to two, the tabs to two, six tier filters, two depth rows), which is the same chrome as the desktop's wrapped,
and the one honest reduction left is the wing-switcher bar, which is the wings' markup too; sleek -- the 2×2 tabs and the
label|control filter rows read as designed rather than as fallen-over desktop rows, the graphs as fitted overviews.

STATE. library.wuld.ink: one commit by k318\K318_efilist_commit.ps1 (six base blobs at HEAD incl. the pin's eab9c788, the packs'
blobs held, six inputs by md5 and byte count with the PNG decoded from text and gated as bytes, exactly six names staged, six
index blobs by SHA, the pin's blob after the commit = 3f07748b, a gated push, /combined read back three times agreeing on
62c733ac with status and bytes beside every hash, then the packs by md5 and the front door's badge). wuld-ink:
k318\WULD_v403_relabel_commit.ps1 (release_v4_0_3.json, the pin tool dry then --apply --date 2026-09-12, the summary swap,
feed.xml, the search index, the diff-shape gate, /library-about/ read back); k318\WULD_archive_commit.ps1 (the drop filed:
kickoff, strata, ship scripts, harnesses, K317's leftovers); this stratum by k318\WI-K318_commit.ps1. Drop: k318\ holds the
six files, the four blocks, this stratum, constants.json, the harness (hz.py, probe.py, census_svg.py, k318_edit.py,
k318_texts.py, shots_ctl.py, domcmp.py, shots_phone.py, shots_readme_dep.py, layerphone.py) and the contact sheets;
P5_STATE.md and TODO_after_the_pin_move.md updated (25 and 17 → LANDED). Carries: the wing-switcher bar at phone width (three
lines at 390, a 17px link; six copies, the wings' change); the layer's FEEDBACK control at 26px on a phone (a layer deploy);
the graphs' phone canvases as overviews (a re-tune of the force layouts for a 340px canvas, if ever); the wings' mobile pass
(Josiah: "refusal libraries already look good on mobile"); the tint hue; the wings' light-scheme silence; the library seat's
K232 items; the film seat's files. Register: cccxxxix is the highest.

## WI-K318b — THE LOG TRIMMED BY THE K236 METHOD: K212 → WI-K312g moved byte-exact to CLAUDE-history.md, a START HERE cheat sheet at the top; NO PIN, NO src; cccxl allocated

THE FILE WAS THE PROBLEM. The K319 session — the undone-ledger prompt written at the WI-K318 close — compacted three times in
a row, the window refilling within three turns of each compaction, first on Opus 5 and then on Fable 5.1, and Josiah stopped
it ("I stopped the other session because they ran into compaction 3 times in a row"). The cause is this file: at 1,293,685 B
it is loaded as the project's instructions into every Cowork session and re-injected after every compaction, so compaction
could evict everything except the thing that filled the window. K310w saw it coming — "CLAUDE.md passed 1 MB at a1159c5
(1,099,871 B). Not a task yet; noted before it is one." — and it became one. K236 met the same condition at 774,707 B and
moved K176 → K211 to CLAUDE-history.md with a recomposition proof; this is that method again.

cccxl allocated — A FILE THAT IS RE-INJECTED CANNOT BE COMPACTED AWAY. The primer is loaded into every session and again
after every compaction; past a size the window cannot hold both it and the work, and the session thrashes instead of
working. Its size is a budget spent on every turn of every session, not a record that costs nothing to keep. K236 trimmed
at 774 KB and wrote no threshold, so the file grew 1.06 MB in two months and every session since paid for it. The threshold
is now written: when this file passes ~250 KB, the trim is the next task, not a carry.

THE CUT. Three anchors, each exactly once in the file as WI-K318 left it (1,293,685 B / e58669a20e78f90af9a05248de91a6af,
HEAD 8c735bc): `## What this project is` at byte 218, `**K212 (2026-07-09` at byte 71,221, `## WI-K313a` at byte 1,185,128.
KEEP1a = [0, 218) md5 503507b0bf74f26dab2bbcf5d4294299; KEEP1b = [218, 71,221) = 71,003 B md5 812c9edff2950d16891839cb20a50148; MOVE = [71,221, 1,185,128) =
1,113,907 B md5 292c24f14fd8fc6be2c050395b399798; KEEP2 = [1,185,128, 1,293,685) = 108,557 B md5 ae1ec56a07f84d8785e1bb2a33dee9ac. KEEP1a+KEEP1b+MOVE+KEEP2 hashes
e58669a2… — proved on the bytes before the block was written, and re-proved by the block on the operator's disk before it
writes (slice hashes over the file in place; nothing copied). The new CLAUDE.md is KEEP1a + START HERE (5307 B,
43f93ccc5526c61f043800a834000998) + KEEP1b + a bridge note at the cut (492 B, 4b0580a4722a4917c43c26650a72ee78) + KEEP2 + this stratum; the block predicts its
length and md5 and prints them. The new CLAUDE-history.md is the old file (2,804,089 B / 2a44315ad70204dcb33c5351c50da47f)
as a byte prefix + the heading `## Archived strata: K212 through WI-K312g (moved from CLAUDE.md at WI-K318b trim,
2026-09-12)` with its note (556 B, 70b65a458eb8513c635dc1a516bd2905) + MOVE = 3918552 B / 77ca11d3fc774c110d10cdcff0b1e37c, appended as bytes. The kept
strata are WI-K313a → WI-K318, which define cccxxii → cccxxxix; no numeral below cccxxii is defined in this file any more,
and the START HERE says where they are. Nothing was rewritten: the moved bytes are the moved bytes, the kept bytes are the
kept bytes, and the K236 immutability note holds — landed strata are never rewritten; supersession is forward, in a new
stratum. The cut, the sidecars and the manifest are made by k318b\trim_claude_md.py (anchors, texts and paths as arguments;
it refuses an anchor that is not exactly once and prints every hash), so the next trim is a run, not a session.

WHAT CHANGES FOR THE NEXT BLOCK. The 4096-byte prefix of this file is new: sha256[:32] 2cef196bc447b0bce2ba96fbc5424ca3 (was 1dc1af43…). A
stratum-append block cut before this trim gates on the old base (e58669a2… / 1,293,685) or the old prefix and aborts by
design; it is re-cut against this file, never forced. The K319 undone-ledger prompt (`Downloads\Argument Library\
PROMPT_K319_undone_ledger.md`, now 30,211 B / 762072ff28703a92ba6efb821470f377) gained a precondition — stop if the instructions loaded are
still the 1.29 MB file — and Josiah's rulings from the stopped session, which are recorded here too so they are not lost with
it, in his words: "The YouTube slot is mine. I will publish sometime today or tomorrow. Though, the watch card can be updated
to match anytime, if it hasn't already. And also, since it's library specific. The front page (screenshot 4) can refer to it.
The github blurb about, give me a copy and paste. Screenshot 5 is the video that will go public today or tomorrow. Are it's
numbers correct? It will be the WULD channel. JosiahSCooper channel will only post a comment about it on their channel, not
upload the video itself. Everything else (screenshots 1-3) show that you can get to the other wing's through the nav bar, but
the "refusal libraries" link is dead when on the flagship. You have to click to harm & autonomy (which brings you to the right
to die wing), then go to the refusal libraries from there. Contine with the rest of your recommendations. Thank you." That
rules the channel question the WI-K318 relay put to the video seat (§2(c)): WULD holds the file (`@WULDIncorporated`,
`JsUIL9GIfIM`); JosiahSCooper comments and does not upload. The three sentences that said JSC-first — handout §3 and RELEASE
v3 §4 (the video seat's), the wrap tool's reserved comment (this seat's, at the film-line ship) — reconcile to it. The dead
"refusal libraries" link is real on the served pin (nav.rl-wing carries one href, /right-to-die/combined; /libraries ×0 in
62c733ac / 2,982,420 B): a combined.html content item, so a pin move, batched with the library seat's K232 items. The /watch/
card may go in before the flip ("can be updated to match anytime"), the front page gets a reference, and the GitHub About
blurb is handed over as a copy-paste — all carried in the prompt.

STATE. wuld-ink: this trim by k318b\WULD_log_trim_commit.ps1 (`.git\*.lock` cleanup; HEAD guard 8c735bc; a clean tree for
both files; both base files by md5 and byte count; both sidecars by md5 and byte count; the recomposition re-proved on disk
as slice hashes; cccxl not yet in the log; the history appended as bytes to a predicted length and md5; CLAUDE.md replaced
by its sidecar to a predicted length and md5; exactly two names staged; the index blobs printed; a gated push; the new
prefix printed). NO PIN: /combined is v4.0.3 / 62c733ac8263e6413816cfb6d28e3b8a / 2,982,420 B on both sites and nothing
under src/ changed. Cowork's bridge on this date: the workspace cannot mount the operator's folders (a Windows update of
2026-09-08), so files move by stage and commit and a read-back is a re-stage hashed in the workspace. Drop: k318b\ holds
trim_claude_md.py, the four texts, the two sidecars, trim_manifest.json and the block. Carries: everything in
PROMPT_K319_undone_ledger.md, to be run in a fresh session after this lands; the trim threshold above. Register: cccxl is
the highest.
