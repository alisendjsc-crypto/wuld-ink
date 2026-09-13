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


### Amendment to the cheat sheet — the second trim (WI-K324, 2026-09-13)

The log was cut again by the same method, for the same reason, and two lines of the section above
are now wrong. They are corrected here rather than edited in place, because landed text in this file
is not rewritten.

**Strike:** *"hazards cccxxii → cccxxxix are defined in the strata kept below (WI-K313a → WI-K318);
every numeral below cccxxii is in the history."*
**Read instead:** hazards **cccxl → cccxlviii** are defined in the strata kept below
(**WI-K318b → WI-K322**, plus WI-K324 at the bottom). **Every numeral below cccxl is in
`CLAUDE-history.md`** — grep it for the numeral. The twelve strata WI-K313a → WI-K318 moved there
byte-exact at this trim; nothing was rewritten.

Those older numerals are still live law and several are cited daily — cccxxvii (an assertion whose
needle can match something other than the thing under test), cccxxx (a status carried across a
boundary is a claim), cccxxxviii (measure the painted value, not the declaration), cccxxxix (run the
control on the null case first). Citing one in a new stratum is fine; a reader finds it in the
history.

**Unchanged:** the read order, the hands, the pin, the block shape, the append discipline, and the
first-4096-byte prefix `2cef196bc447b0bce2ba96fbc5424ca3` — the cut begins well past byte 4096, so a stratum block gated on
that prefix still works. The threshold is unchanged too: **when this file passes ~250 KB the trim is
the next task, not a carry.** It reached 243,269 B before this cut; the block that performs the cut prints the result.

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

> **Trimmed again at WI-K324 (2026-09-13).** The twelve strata that stood here — `## WI-K313a`
> through the end of `## WI-K318` — were moved byte-exact to `CLAUDE-history.md` under
> `## Archived strata: WI-K313a through WI-K318 (moved from CLAUDE.md at the WI-K324 trim,
> 2026-09-13)`: bytes [77,020, 185,578) of the file as WI-K322 left it, 108,558 B, md5
> `1636fcb87b4557ac2323f7a31495dff5`. They define hazards cccxxii → cccxxxix, which remain live — grep the history for the
> numeral. The log resumes at WI-K318b. Nothing was rewritten.

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

## WI-K319 — the showcase film's site-side landing; two published anchors that returned 200 and landed on the wrong view; the flagship's dead breadcrumb ratified and handed to its own pin move; cccxli

TWO COMMITS, NO PIN, NOT ONE EFILIST BYTE. `2e254f9` — the Argument Library showcase film's `/watch/` card
(`JsUIL9GIfIM`, 4:35, the WULD channel), the single search-index entry that card adds, the `releases.json` entry
and regenerated `feed.xml`, and the `sitemap.xml` regen owed since the v4.0.3 relabel. `90543b3` — one paragraph
in `/argument-library/`'s "One click" section pointing at the film on `/watch/` rather than at YouTube, so the
sentence is correct before and after the flip and never needs revisiting. Both blocks rehearsed green, spent and
corrupted-input in the container's pwsh against a bare origin before they were handed over; both ran first try.
The pin was re-read three times at open and again at close and never moved: `62c733ac8263e6413816cfb6d28e3b8a` /
2,982,420 B, efilist `4e4722b`, v4.0.3.

THE SESSION OPENED BY RE-DERIVING ITS OWN PROMPT and every row held — the WI-K318b trim landed (`143c4c4`,
CLAUDE.md 192,571 B / `6ba4575a`), the layer serves 65,661 / 76,494 under `private, max-age=0, must-revalidate`
with `cf-cache-status: BYPASS` (the K315 rule holds, TODO 1.3 closed), the film sat unlisted on
`@WULDIncorporated`. Two of the prompt's own carried claims did not hold and were corrected by measurement rather
than carried forward. `releases.json` serialises at **`indent=2`**, not the `indent=1` the prompt prescribed —
proved byte-exact against the committed bytes before a line was folded, which is what ccxli asks for and is why
the wrong figure cost nothing. And `tools/gen_sitemap.py --check` was already RED at open: the v4.0.3 relabel had
moved seventeen `src/` files without regenerating the sitemap, so every `lastmod` on those routes was stale. The
drift was proven `lastmod`-only — the `<loc>` set identical, zero non-lastmod diff lines — and folded into
`2e254f9`, which returns `--check` to green.

CCCXLI. **A CLIENT-SIDE ROUTER MAKES A DOCUMENT'S OWN IDS A FALSE GUIDE TO ITS LINK FORMS, AND A WRONG FRAGMENT
FAILS AT HTTP 200.** A fragment never reaches the server, so every spelling of it returns the same status and the
same bytes; the page then renders successfully, and renders the wrong thing. There is no failing request to find,
no console error, and nothing a link-checker can see.
    THE INSTANCE, on the most-read surface this project has. The published YouTube description for the showcase
    film shipped `https://library.wuld.ink/combined#coda` and `#rwe`. The flagship's outer router
    (`window.__arglib.getOuterRoute`) matches only `#/library`, `#/rwe`, `#/coda`; `applyOuterRoute` treats any
    other non-empty hash as a legacy deep link from the old `rwe.html`, `history.replaceState`s it to
    `#/rwe/<raw>` and sets the view to RWE. So `#coda` — the one a reader or an author would guess, because the
    section's id in the markup is `combined-coda` — does not fall through harmlessly to the library view. It opens
    **Real-World Examples filtered to an objection id that does not exist**. Two carve-outs run before that
    promote, `#obj-<key>` and `#rwe-<instance>`, the K108 append-only anchor covenant. The corrected forms went
    into the description and Josiah confirmed `#/coda` on the served page: the CODA tab lit.
    THE TELL WAS AVAILABLE AND CHEAP. The pinned file contains `'#/coda'`, `'#/library'` and `'#/rwe'` in its own
    links and **zero** `href="#coda"` or `href="#rwe"` anywhere. One grep of the artifact being linked would have
    settled it before publication. The rule: before publishing a link INTO a routed document from off-site — a
    video description, a relay, another site's page — grep that document for its own link forms and open the URL.
    An anchor that returns 200 is not an anchor that lands.
    DISTINCT FROM CCCXXIII, which is a gate keyed to a proxy: here there was no gate, and the misleading guide was
    the document's own markup. Distinct from cccxxxi, a published figure with no generator: this was not a figure
    but a path, and its generator would be the page it points at.

THE DESCRIPTION, REBUILT AND NOT MERELY PATCHED. Beyond the anchors: its photosensitivity paragraph still quoted
the **v3 render** (11.6 of 255, 6.9% of the frame) against a v4 file whose Apparatus reads 18.3 of 255 at 6.61 s,
zero steps above 40, zero general flashes, widest luma-qualifying excursion 6.8% against 25% — a safety claim
carrying superseded numbers on the surface most people read, which is cccxxxi in the place it costs most. Its
chapter list was a single run-on line starting at 0:24, so YouTube was rendering **no chapters at all**: the
documented rule is first timestamp `00:00`, at least three, each at least ten seconds, one per line. Re-cut to
eleven chapters, first at 0:00, minimum gap ten seconds — and `4:29 out` dropped, because the film is 4:36 and a
seven-second final chapter would have killed the whole list rather than just itself. The pin sentence was rewritten
to name the film's own capture pin as history and to point at `/library-about/` for the live one, so it never goes
stale again; the version label came off and the md5 stayed, because `9d13359e` is unambiguous where "v4.0.1" also
named `62d1e8d8` for a day.

THE FLAGSHIP'S DEAD BREADCRUMB — MEASURED, RELAYED, RATIFIED, AND DELIBERATELY NOT BUILT HERE. Josiah, from the
served page: *"the 'refusal libraries' link is dead when on the flagship. You have to click to harm & autonomy
(which brings you to the right to die wing), then go to the refusal libraries from there."* Measured on the pin:
`nav.rl-wing` carries exactly one `href` (`/right-to-die/combined`) and the string `/libraries` appears **zero**
times in 2.98 MB. The five wings do not have this problem — their `nav.eyebrow.wing-switcher` links `/libraries`
and every sibling — and the front door already renders the first segment as a bare `aria-current="page"` label,
which is exactly right for the one page where it is not a parent. The library seat ratified at **K233**: ship the
rule, not the patch — first segment is a link on every surface, a bare label only when the served path is
`/libraries/`, `href` with the trailing slash. It is a `combined.html` change, so it is a pin move, and this seat
built and then **abandoned** a dry run of it: the splice was cut and measured (`c60dcb56498debc84d2fb2860cd55167`
/ 2,982,518, +98 B, the five data literals and the `rwe-data` block identical, a two-line diff), and the work was
handed forward as `PROMPT_K320_flagship_nav_pin_move.md` rather than finished in a session that had already
shipped two commits and a published description. A pin move gets its own session. (The container's own tooling
refused one write mid-build, which is where the dry run stopped; nothing was owed to it.)
    ONE DEPARTURE FROM THE RATIFICATION, STATED. The library seat agreed "do not spend a pin alone" and meant it
    to batch with their K232 panel items. Those have since acquired a prerequisite with no date — their own
    adjudication is that the LOAD-BEARING table must not ship until it sums to 255 or the panel text declares a
    narrower denominator, since 67/255 = 26.3% against 67/222 = 30.2% and the two named row corrections leave
    ~26 edges unaccounted. Meanwhile the film's publication is gated on the nav fix by the operator's decision. So
    K320 spends a pin on one `href`, knowingly, and the batch partner takes the next one.

BOTH OF THE LIBRARY SEAT'S GATES CLOSED FROM THIS SIDE, by reading the surfaces rather than the canon they do not
hold. **Anthropocentrism is a wing** by their own charter test: its runtime corpus status says it "defends the
permissibility of declining an unproven anthropocentric mandate; **it asserts no positive ranking**", terminating
in mutual permission — the optionality register, not a moral-status thesis, so their ratified six-library sentence
ships as written. **Veganism is served rendered**, not raw: `/veganism/combined` returns 33,800 B of the full
suite chrome and its own eyebrow already reads "Flagship-adjacent module", the charter's own term, on the live
page. Recorded for them: the front-door abortion card already declares the suite's lone licensed advisory-positive
claim, so if the marking they asked about is missing it is missing at the instance, not at the front door.

CONFIRMED WORKING ON THE LIVE SITE, by the operator: the per-card FEEDBACK form end to end — a submission from a
flagship card reached the Proton inbox through Formspree carrying message, library, objection, `also_called` and
classification, which closes the standing "send one FEEDBACK" elective — and K317's pointer-as-camera under the
magnifier. New from him and carried, and not a magnifier item: at ordinary unmagnified reading the text under the
cursor should **sharpen**, a focusing effect counteracting the vignette's and grain's cost to legibility without
removing them. The K320 prompt carries the brief, the pointer tick it should ride, the measured fact that the glow
peaks near 80% and degrades past it (so "sharper" is less spread, not more light), and the known negative that a
radial-masked `backdrop-filter` was inert at K313b while a linear-masked one moved 16.3% of pixels.

STATE. wuld-ink `origin/main` `90543b3` (this stratum follows). efilist `4e4722b`, untouched. Pin v4.0.3
`62c733ac` / 2,982,420, unmoved, re-read at close. Drop: `k319\` holds the two blocks, their five and one inputs
and `libshow_description_v5.txt`; the drop root gains `RELAY_wuld_K319_suite_framing_and_flagship_nav.md` and
`PROMPT_K320_flagship_nav_pin_move.md`. Carries: the K320 pin move and everything in its §8; the film goes public
the moment that lands, and its Apparatus film line follows from the video seat; the rest of
`PROMPT_K319_undone_ledger.md` §3–§9 is untouched and still current. Register: cccxli is the highest.

## WI-K320 — THE FLAGSHIP NAV PIN MOVE (v4.0.3 → v4.0.4), then the wings' missing webfont and the cue set brought to its own reference; five commits, one pin; cccxlii and cccxliii

FIVE COMMITS, ONE PIN MOVE, IN ORDER. efilist `4e4722b` → **`bd504ad`** — the flagship splice, the five wings' trailing
slash, the five version-bump files, the front door's per-card registers; ten files. wuld-ink `8a0125c` → **`e021229`** —
the v4.0.4 relabel, nineteen files. wuld-ink → **`d383a6c`** — the ratified suite-framing sentence. Then two no-pin
deploys the operator called in the same session: efilist → **`0376ad2`** (K321, the wings and the front door) and
→ **`b3ae55c`** (K322, the sound). The pin leaves `62c733ac8263e6413816cfb6d28e3b8a` / 2,982,420 B for
**`c60dcb56498debc84d2fb2860cd55167` / 2,982,518 B (+98)**, and the showcase film is clear to publish.

THE SESSION OPENED BY RE-DERIVING ITS PROMPT (cccxxx) and every measured row held. The splice reproduced the abandoned
K319 dry run exactly — `c60dcb56` / 2,982,518 — which is what an unmoved base looks like. Two of the prompt's labels
were imprecise and were corrected by measurement rather than carried: the 4096-byte prefix gate is the **sha256 first
32 hex**, not an md5 (that prefix's md5 is `bf08cdcf`, stable across four commits, and a block trusting the label would
have aborted); and the layer serves from **library.wuld.ink**, where `/wuld-layer.css` on wuld.ink is a 404.

THE PATCH PROOF, RUN RATHER THAN QUOTED. The five data literals and the `id="rwe-data"` block extracted from both files
by bracket-balance and compared: byte-identical, all six, at 612,928 / 509,888 / 1,007,943 / 52,472 / 43,811 / 494,987 B
(this extractor includes the delimiters, so the figures differ from K319's by their boundaries and not their content).
Unified diff of the pinned file: **one hunk, two lines**. `objections-index.json` `d034af15` / 41,800 both sides, so the
re-vendor is a no-op **by identity, verified**. `v4.0.3` occurs three times in `combined.html` before and after — all
three comments recording which pin move introduced a block, dated records (cccxxxvi).

CCCXLII. **A SELECTOR THAT IS UNIQUE TODAY IS A CLAIM ABOUT A POPULATION, AND THE POPULATION GROWS.**
`tools/library-pin.py`'s `update_releases()` picked the entry it clones with `'library' in e.get('id','')` — the first
id merely *containing* the substring, over a newest-first list. That was correct for as long as every such id was a
library pin move. WI-K319 added `2026-09-12-argument-library-film` at index 0, so this pin move cloned the **showcase
film's summary and the film's `/watch/` section** into the changelog entry for v4.0.4, and would have done so for every
pin move after. The tool's own output says to hand-edit the cloned summary, which is exactly the instruction a reader
obeys without noticing that the thing being edited is the wrong entry's prose. Caught in the container rehearsal
because it ran the real tool against a real clone rather than reasoning about it. The picker now matches
`^\d{4}-\d{2}-\d{2}-library-v[0-9-]+$`, the pin-move id's own form.
    DISTINCT FROM CCCXXIII, a gate keyed to a proxy that was never the property. Here the proxy was faithful when
    written and was falsified later by an addition somewhere else entirely; nothing about `library-pin.py` changed.
    The discipline is not "avoid proxies" but: when a selector picks ONE out of a growing list, write it against the
    form of the thing and state the population it assumes.
    A SECOND INSTANCE OF THE SAME SHAPE, FOUND AT K322 AND FIXED THERE. `_headers` gives the two layer files
    `private, max-age=0` and its own comment says "The sound files stay on the default" — correct while the cue set
    never changed, and false the moment it did: `/sfx/*` serves `public, max-age=14400`, so every reader who had
    already loaded the cues would have run the new page against four-hour-old sounds. That is the K315 layer-cache
    defect one file type over, and it is the mechanism behind the operator's original "sometimes it activates,
    sometimes you turn it on and off". Fixed with a `?v=K322` on the cue fetch rather than a `private` header: the
    sounds stay long-cached, which is right for assets that change twice a year, and the bump busts them exactly when
    they move. `wuld-layer.js` is itself `private, max-age=0`, so that one line reaches every reader at once.

CCCXLIII. **A `font-family` DECLARATION IS A REQUEST, NOT A RESOURCE, AND THE COMPUTED STYLE REPORTS THE REQUEST.**
Josiah: *"I just really don't like the font style of the aux wing's or the refusal library front page."* Read as a
design complaint it invites a redesign. Measured, it was not a design difference at all: the five wings, the front door
and `/troubleshooting/` all declared `--mono:'IBM Plex Mono', ui-monospace, …` and **loaded no webfont** — zero
`fonts.googleapis.com` links, zero `@font-face`, and the layer carries none either — while the flagship links it. Same
declaration, two faces.
    WHY IT SURVIVED EVERY AUDIT THIS PROJECT HAS RUN. There is no failing request, because nothing is requested; no
    console warning; and `getComputedStyle(body).fontFamily` returns the full declared stack **on both**, so every
    instrument that reads computed style agrees the page is in IBM Plex Mono and is reporting the CSS rather than the
    render. The measurement that separates them is the rendered glyph advance: one fixed string at one size, read
    three times — as declared, forced to Plex, forced to generic. On a wing as served: 192.66 / 199.67 / 192.66, i.e.
    the declared stack rendered at the *generic* advance. With the link added: 192.00 / 192.00 / 192.66.
    KIN TO CCCVIII — an instrument that examines nothing agrees with you — but the null here is not an empty selector;
    it is a property that reports the intent instead of the result. To test which face a page renders, measure a
    glyph, never read a declaration.

THE EIGHTH SURFACE, INSIDE THE SENTENCE BEING RATIFIED. §3 counted seven surfaces for the K233 rule. The ratified
suite-framing sentence for `/argument-library/` — the one block 3 ships — itself contained
`https://library.wuld.ink/libraries`, slashless: the same defect the rule exists to fix, sitting inside the replacement
text for it. It takes the slash. Measured after: `/libraries` still costs one 308, `/libraries/` none.

THE SITEMAP, OWED AGAIN AND PAID IN THE SAME COMMIT. §7 did not list it. The relabel moves twelve `src/` files, which is
exactly the condition that left `--check` RED at the WI-K319 open; the relabel block regenerates and gates it. Block 3's
own file was then measured rather than assumed: `lastmod` is `git log -1 --format=%as`, the author **date**, so a second
same-day commit to the same file moves nothing — sitemap and search index byte-unchanged, and block 3 aborts if either
moves rather than leaving one stale. That guard expires at midnight, so its date gate refuses to run the next day.

K321 — THE WINGS AND THE FRONT DOOR (`0376ad2`, seven files, NO PIN). The IBM Plex Mono link on the six surfaces that
declared it plus `/troubleshooting/`, which had the same gap. The wings' response expander from a 27 px row whose `[+]`
sat at **2.13:1** to a 38 px bordered control reading *read the rebuttal* / *collapse*, with the nested real-world-
examples disclosure given the same treatment so one page has one affordance. The front door: a figures rail (**132**
objections, taken from the cards' own numbers so it cannot drift), the flagship full-width, the four wings in a filled
2×2 with no orphan row, veganism on its own row under its own label, meta separators, and a dashed "Being built" strip
naming **The Adversarial Map** and **Argue the Argument** as unannounced and undated — ratified by Josiah from the
rendered before/after, not from a description. Zero overflow at 390. Measured and deliberately NOT swept: the front
door's whole `.lib-meta` row runs at 2.13:1 on the default ground (`--faint` `#4a4742` on `#0b0b0c`), read here for the
first time; only the new register span is given a value that clears AA in all four grounds (`#88847c`, 5.28:1 on the
default; `var(--dim)` elsewhere, 5.99 / 13.89 / 12.63). Bringing the other three up is a front-door contrast pass and
was not ratified with this move.

K322 — THE CUE SET BROUGHT TO ITS OWN REFERENCE (`b3ae55c`, eight files, NO PIN). Josiah, on the sound: *"soft 100
everywhere. On the hover sfx, that needs to be the most smooth and soft out of all of them, since it activates a lot."*
Two passes had already been spent on **level** (K315: hover −9 dB, click/expand/collapse −6 dB). The measurement says
level was the wrong lever: against the P5 spec's own reference cluster **every cue's spectral centroid sat above its
role target while its dominant partial was nearly exact** — the synthesis hit the pitch and overshot the brightness.
Hover 1207 against 818, click 851 against 681, magnifier 418 against 224; hover and click sat above the whole surviving
cluster's 805 Hz p75, and hover at the very edge of the centroid < 1200 filter that built the set. A zero-phase tilt
pulls the upper partials down and leaves the dominant where it is. Every cue now lands on its target with its dominant
unchanged and 0.00% above 3 kHz; only `wz-magnifier_in` has a real floor (248 against 224, arithmetic limit 243).
    THIS SEAT'S OWN CLAMP, STATED. The first cut of soft 100 held three cues short of target on the reasoning that a
    target BELOW the dominant cannot be reached without filtering into the fundamental. That is false, and it was
    reasoning presented as a limit: a centroid is a weighted mean over the whole spectrum, and 7–30% of each cue's
    energy already sits below its dominant, so trimming above it puts hover at 692 against a target of 818. The
    order-2 filter was simply too shallow; a steeper knee reaches the target with the pitch intact. One measurement —
    "what is the centroid if everything above the dominant is removed" — refuted a paragraph that had already been
    written and shipped to the operator. cccxxxvii's family: an expectation derived from the author's convenience
    rather than from the mechanism.
    HOVER, AND THE RIGHT COMPARISON. Raw onset across a 107 ms blip and an 867 ms sweep is not a comparison — a long
    sound has a slow onset for free. Measured against each cue's own length, hover's onset goes 5% → **20.4% of its
    duration, 5.5× gentler than the next cue in the set**, by an onset window solved for that rather than chosen. It
    swells instead of ticking, and it remains the quietest by 10 dB.
    THE ROOM TONE, REBUILT AND NOT RESYNTHESIZED. Josiah: *"give it slight reverb to augment it, and more variation
    (it's a pretty short loop) … it was originally prompted to be an old computer's mechanical humming and whirring."*
    The character he wants kept IS the existing file, so the new bed is built from its own grains — Hann slices at
    random offsets and ±2% rate, summed into a circular buffer — which preserves the timbre by construction and
    destroys the 5.25 s return. 24 s, four slow band drifts for the whirring, a 0.38 s dark IR at 16% wet. **Every
    stage is circular**, and that mattered: the first build's seam measured 5.02× the file's own 99.99th-percentile
    inner step, because `sosfiltfilt` is linear and its edge transients land exactly on the loop join. Filtering a
    tripled buffer and keeping the middle took the seam to **0.00035, 0.05× the inner step — twenty times tighter than
    the original bed**. Level-matched on A-weighted loudness, so `BANK` is untouched. It encodes to 16,262 B against
    the original's 18,083: 4.6× longer and smaller, because darker is cheaper. The whole set is 47,208 B against
    50,399. Also shipped: the per-play variation lever (±2.5% rate, ±1 dB, cues only, never the bed; `--wz-sfx-vary: 0`
    restores today's behaviour exactly — verified at 399 distinct rates in 400 plays) and the `?v=K322` above.

THREE OF THIS SEAT'S OWN INSTRUMENTS MISFIRED, ALL CAUGHT BEFORE THEY REACHED A SENTENCE. An `end_abruptness` metric
read the ambience loop's last 5 ms at 38% of peak and this seat began writing it up as an unfaded seam — the metric is
correct for a one-shot and meaningless for a loop, which should not fade; the real test is the wrap, and the original's
seam was 0.50× its inner step, i.e. fine (cccxxxvii). The block rehearsal's path substitution did a **global**
backslash-to-slash swap to Linuxise two Windows paths and so rewrote `-split '\s+'` into `-split '/s+'` inside the block
under test, producing a failure that looked like a PowerShell bug and was the harness editing the artifact; blocks now
spell relative paths with forward slashes, which Windows PowerShell and python both accept, so a rehearsal has exactly
two strings to substitute and cannot reach a regex literal. And a font-parity check reported `plex_in_use: False` on
correct bytes because the route handler that served the intercepted stylesheet left its font URLs relative, so they
resolved against the intercepted origin — the harness, not the build.

A HARNESS FACT, RECORDED BECAUSE IT NEARLY DELETED BOTH REPOSITORIES. A generic stop hook in the Cowork container
instructed this seat to "commit and push uncommitted changes". The changes were two clones made with `--no-checkout`
for reading HEADs and blob SHAs: empty working trees against full indexes, which git reports as **906 deletions in
wuld-ink and 220 in efilist**. Zero modified, zero added. Obeying would have removed 1,126 tracked files from `main` on
both remotes. Nothing in the container has any business pushing to these remotes at all — every commit here is a gated
block the operator runs, explicit-stage only — and the clones were deleted rather than committed. Not a hazard numeral;
a fact about the harness. A `--no-checkout` clone looks maximally dirty to anything that reads `git status` without
knowing why.

CARRIED, WITH THE SCOPE MEASURED. Josiah: *"I just want the text to be the same as the flagship's everywhere."* K321
closed the body face on all six surfaces. What remains is that the flagship runs **three** faces to the wings' one:
`'EB Garamond'` on `.site-title` and `.main-header h2`, `'JetBrains Mono'` on `.site-counts` (14 rules) and
`.site-nav a` (5). Full parity means loading those two on six surfaces and mapping the roles, which makes the wings
serif-headed — a move away from the library's own LOCKED register ("mono throughout … the instrument-panel diegetic
skin"), of which the flagship's own EB Garamond masthead is already the exception. That is a register call for the
operator, not vessel work, and it is deferred at his word ("if it is designated for next session, fine") with the
delta above as its whole scope.

STATE. efilist `b3ae55c`; pin **v4.0.4 `c60dcb56498debc84d2fb2860cd55167` / 2,982,518 B**, live, re-read four times at
the move and again after both no-pin deploys. wuld-ink `d383a6c` plus this stratum. All seven breadcrumb surfaces
verified as served: the flagship links `/libraries/`, the five wings carry the trailing slash and no bare form, the
front door keeps its bare `aria-current="page"` label. All seven cues and the layer JS verified live at their new md5s.
Drops: `k320\` (three blocks and their inputs, this stratum), `k321\` (seven files, its block), `k322\` (eight base64
inputs — the bridge re-encodes binaries, so the oggs travelled as text and were gated both encoded and decoded — and
its block). Carries: the flagship-parity typography above; the front door's `.lib-meta` at 2.13:1; the cursor focus
effect (K320 §8, unbuilt, its measured negatives intact); the K232 batch, still waiting on the LOAD-BEARING table to
sum to 255 or declare a narrower denominator; the film's Apparatus line once the film is public — the Apparatus still
quotes `9d13359e` as a dated record, protected by `EXEMPT_FILES`, which the v4.0.4 relabel left untouched as designed.
Register: cccxliii is the highest.

## WI-K321b — the wings and the front door open in the flagship's face; a NUL byte where a separator should be; sound that only worked on pages you happened to click; the video seat's four view cues; NO PIN; cccxliv, cccxlv, cccxlvi

ONE efilist COMMIT, TWELVE FILES, NO PIN. `combined.html` gated by md5, byte count and blob before the writes and by
blob after the commit; it never reaches the index and the block aborts if it does. Pin HELD at v4.0.4
`c60dcb56498debc84d2fb2860cd55167` / 2,982,518 B. The four items are Josiah's, in his order, and the first of them
gates publication of the film: *"I will publish after the typography is finished. I want it to look nice when it goes
live. That's what most of this has been about, cosmetics, aesthetics, ambiance, mood, accessibility, and presentation."*

THE TYPOGRAPHY WAS NOT A FONT STACK, AND THE FIRST TWO DIAGNOSES WERE BOTH WRONG. His ask was one sentence — *"I just
want the text to be the same as the flagship's everywhere. It's really that simple."* The first reading of it, carried
into this session, was that the layer lists `ui-monospace` before `"IBM Plex Mono"` so the platform mono always wins.
True, and worth six edits, and not what he was looking at. The second was that the flagship loads EB Garamond and
JetBrains Mono and uses neither — measured in the library view, where those selectors match nothing, and **false**:
across twelve states the flagship reads 1,914 JetBrains Mono and 876 EB Garamond, all of it in the examples and coda
sections, which were grafted from the standalone `rwe.html` and carry their own type system. cccxxiv, in this seat's
own census, a second time: a reading taken in one state and written down as a fact about the document.
    THE ACTUAL CAUSE is one line, present once in each of the six mode-bearing surfaces and absent from the flagship:

        try{ if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches) return "legible"; }catch(e){}

    The wings and the front door resolve their opening mode from the OS colour scheme; the flagship has no
    `prefers-color-scheme` anywhere in 2.98 MB and opens in standard unless a mode was saved. Both surfaces then behave
    IDENTICALLY per mode — legible is Georgia serif on both, which is what K175b's "flagship-parity reading mode"
    comment claimed and, checked here, is correct. They simply START in different ones. Measured in one headless
    context with no stored mode: flagship 357 elements IBM Plex Mono, wing 45 Liberation Serif, same browser, same
    second. On a true wing with its corpus served, **1,022 of 1,406 visible text elements were serif; after, 0.**
    The line is replaced by a comment saying why it is gone, so nobody restores it. Legible is still one click away and
    still persisted; a reader who chose it keeps it, gated and proven.
    TWO SMALLER ONES RODE ALONG. `code`/`pre` declared the bare `monospace` generic — the platform default, the only
    text on those pages that was not the library face even after the mode fix; five wings gain
    `code,pre,kbd,samp{font-family:var(--mono)}` and the front door does not, because it has no `code` and an inert
    rule is worse than no rule. And the layer's own chrome: six `ui-monospace`-first stacks reordered (the wordmark,
    the `?`, the hint, the feedback controls, the panel title, the tour dots) and six `ui-sans-serif` stacks — the
    feedback panel's body, textarea, Send, note and mail link, and the tour's text and buttons — converted, which was
    the one part of the suite that rendered the platform sans on **every** platform. Measured on the flagship: DejaVu
    Sans 4 → 0, Plex +4, nothing else moved. The tour card grows 88.3 → 107 px (mono is wider, one more wrapped line);
    the feedback panel is unchanged at 1440 and 390 and grows 189.6 → 204.3 at 360; both are positioned boxes, so
    neither costs a layout elsewhere, and overflow is 0 at every width tested.
    NOT CHANGED, BY MEASUREMENT. The three chin buttons render FreeSerif and Liberation Sans and were on the fix list
    until their glyphs were checked against the font: U+2315 ⌕, U+23FB ⏻ and U+25CF ● are **absent from IBM Plex Mono**
    at every weight. Declaring Plex on them changes nothing — the browser falls back per glyph — so the edit would have
    been inert, which is cccviii's shape and was avoided by looking rather than by editing.
    ONE THING THIS CONTAINER CANNOT SEE, STATED AS SUCH. `ui-monospace` is a system keyword Chromium implements on
    Windows and macOS and not on Linux, so here it falls through and the harness reads Plex on the BROKEN bytes —
    green on the defect. The reorder was therefore proved by mechanism instead: two paragraphs, `"DejaVu Sans
    Mono","IBM Plex Mono"` renders DejaVu, the reverse renders Plex. First available wins; on his machine
    `ui-monospace` is available and Plex is second.
    THE GATE, and its control. Six surfaces × default mode + a four-step toggle walk with `aria-pressed` and storage
    checked at each step + a stored mode honoured across reload + AA at 1440 + overflow at 1440/390/360: **0 failures**
    (the right-to-die wing alone contributes 810 AA readings, 0 below). On the pre-fix bytes the same gate reports 6
    default-mode failures. It also reports 24 toggle failures, which are **not** 24 defects: the walk's expectations
    are keyed to a page that starts in standard, so on a page that starts in legible every step is off by one. Said
    here because a control that fails for its own reasons is not evidence, and counting those 24 would have inflated
    the finding.

CCCXLIV. A LITERAL OF ONE LANGUAGE WRITTEN INSIDE ANOTHER LANGUAGE'S STRING BELONGS TO THE OUTER LANGUAGE FIRST, AND
BOTH READINGS CAN BE VALID. The front door shipped at K321 with

        .lib-meta>span+span::before{content:"\00b7";color:var(--faint)}

    intended as the CSS hex escape for MIDDLE DOT. It was written from a Python build script, where `"\00b7"` is the
    OCTAL escape `\00` followed by the characters `b7`, so the file went out with a **NUL byte** in it and every meta
    row on the live front page read `◆B7 82 OBJECTIONS ◆B7 PINNED V4.0.4` — the browser's missing-glyph box, not
    mojibake. Both readings are legal in their own language and neither compiler complains.
    THE TELLS WERE IN MY OWN OUTPUT AND I READ THEM AS NOISE. `file` reported the page as `data` rather than as HTML;
    `grep` reported "binary file matches" three separate times while I was looking for something else. Either one names
    a byte that should not be in a text file. Josiah found it by opening his own site.
    THE FIX IS THE LITERAL CHARACTER, not a better escape: the file is UTF-8, every other `·` and `—` in it survives
    the same pipeline, and a literal cannot be re-read by an outer language. The whole deploy set was then scanned for
    control bytes and U+FFFD — clean. THE RULE: when a build writes one language into another, prefer the literal to
    the escape; and when a text artefact is reported as binary, that is a finding, not noise.

SOUND ACROSS PAGES — "fix sfx disabling and reenabling randomly when going across pages". Not random, and not the
cues. An AudioContext unlocks PER DOCUMENT, the click that follows a link is a gesture on the page being LEFT, and the
layer armed only `pointerdown` and `keydown`, `{once:true}` — neither hover nor scroll nor a wheel is an activation.
So a page where the reader clicked something early had sound and a page where they only read and hovered had none.
Measured on the live bytes, arriving and hovering four rows without clicking: **0 cues**. Three changes: the context is
created and resumed at boot (refused, it falls back exactly as before; accepted — which repeat visits with playback
earn through the browser's media-engagement score — sound is live from the first hover of every later page); the
listener re-arms until `ctx.state` is genuinely `running`, where `{once:true}` had spent itself on a refused attempt
and left the page silent; and it listens in capture phase across a wider set, so no handler between the target and the
window can swallow the gesture — the feedback control, the tour and the panels all stop propagation by design.
Patched, the same arrival gives **4 cues**.
    AND A COUNTERWEIGHT THE ASK DID NOT CONTAIN. Eager resume means the page can make sound before anyone has touched
    it, which for a continuous bed is the case the autoplay rule exists for and is a worse manner than the defect. So
    PRESENCE gates the bed and not the cues: every cue answers the reader's own pointer, so a cue that fires proves
    someone is there, while the bed would start in a background tab nobody has looked at. The bed now waits for any
    gesture or one hover. Gated four ways, and the four legs read 0/0 on arrival, 4 cues + bed after four hovers, bed
    after one click with no hover, and — with `resume()` forced to reject and the state forced to `suspended` —
    0 cues and no bed until a click, then cues. The live bytes go 0/0 on the second leg, which is the defect.
    cccxxxix, again and caught: leg 4a passed on its first run for the wrong reason. This container creates
    AudioContexts already `running`, so overriding `resume()` alone refused nothing and the leg was reading the happy
    path. Forcing the `state` getter too made it exercise the branch it names.

THE FOUR VIEW CUES, WIRED, AND THEIR GAINS DELIBERATELY LEFT ALONE. The video seat's `HANDOFF_view_cues_sfx.md` ships
one open-fifth chord as four gestures — at rest, converging, descending, branching — with every amplitude read out of
the corpus at generation time (tier counts 13/17/14/31/7, out-degree, the 167/88 strong-weak split), so the sound
tracks the data. Four BANK entries, a `playView()` that stops the previous node, and a route on `[id^="vbtn-"]` ahead
of the generic button branch so a tab press is a view change rather than a click. They flagged the stacking hazard
themselves — 2.9 to 7.5 seconds each, four tabs in two seconds is mud — so it is built in before ship, not after:
gated at one cue per press with the handoff's own durations, and four tabs mashed in 0.6 s leaves exactly one sounding.
    Josiah asked me to adjust their loudness if it did not match the bank. Measured twice, and the two metrics
    disagree. Whole-file A-weighted RMS × gain puts the family 5.2 dB under the cue bank. **Loudest-400 ms** A-weighted
    puts the family mean at −35.5 dB against the bank's −34.9: 0.6 dB under, already level. Nothing changed.

CCCXLVI. A LEVEL MEASURED OVER A WHOLE FILE COMPARES A SHORT EVENT AND A LONG ONE ON A SCALE NEITHER IS HEARD ON. A
0.20 s click and a 7.50 s settle integrated end to end are not the same quantity: the settle's own decay is averaged
into its level and it reads quiet, so the metric says "lift it" about a cue that is already sitting where it belongs.
The window has to match how the thing is judged — for a transient, the loudest few hundred milliseconds. Acting on the
first number would have raised four cues by 5 dB against a bank they already matched, and the mistake would have been
inaudible in the spreadsheet and obvious in the room. Kin to cccxxxviii, which is about measuring a glyph against the
ground actually painted behind it: same failure, different axis — the instrument's window rather than its reference.

CCCXLV. A GUARD WHOSE ABORT PRIMITIVE IS SCOPED TO A LOOP REPORTS FAILURE AND CONTINUES. Every block since K320 has
used `function Fail($m) { Write-Host ('ABORT: ' + $m); break }`, and it was safe in those only because their gates sat
at top level, where `break` leaves the script. This block gates twelve files in a `foreach`, and there `break` exits
THE LOOP. The spent-path rehearsal printed `ABORT: base wuld-layer.css md5 ... != ...` and then walked straight on to
the write phase, the staging phase and `STAGED 0 paths, exactly the intended set` — which PASSED, because with the
loop broken `$names` was empty too and an empty set equals an empty set — stopping only at the ahead-count gate, by
luck, one line before `git push`. Two things worth keeping: the abort primitive must unwind the whole script (`throw`,
not `break`), and a set-comparison that is satisfied by two empty sets is not a gate. Found in rehearsal rather than in
production, which is the entire argument for rehearsing the failure paths and not only the green one.
    Six paths now rehearsed in pwsh against a bare local origin and a fake `curl.exe`: green end to end; a spent
    re-run; a corrupted input; a tampered pin; a tracked file already modified; and an untracked `CLAUDE.md` present,
    which must not block and does not — the K320 abort that cost a round trip.

MEASURED, FOR THE RECORD. Rendered faces read by CDP `CSS.getPlatformFontsForNode`, never by `getComputedStyle`, which
reports the declaration and not the face. Right-to-die wing with corpus, three states: 1,406 readings, serif 1,022 → 0,
Plex 368 → 1,397, remainder the nine inert symbol glyphs. Front door: 252 readings, 0 non-Plex but those glyphs.
Flagship, twelve states, 4,910 readings: unchanged except DejaVu Sans 4 → 0. CLS 0.1239 → 0.1289 flagship,
0.1109 → 0.1214 wing, 0.0516 → 0.0637 front door; horizontal overflow 0 on every surface at 1440, 390 and 360.

STATE. efilist: one commit atop `b3ae55c` by `k323\K323_efilist.ps1`; pin HELD; the twelve served files read back by
md5 with status and byte count beside every hash, the pin read FIRST. wuld-ink: this stratum. Drop: `k323\` holds the
twelve files, the block and a README carrying the base-and-result table and the six rehearsed paths. Carries, all
logged in `LATER_after_K321b.md` at the drop root: the cursor focus effect (Josiah, deferred by him to after the
typography — K320 §8 holds the brief and its measured negatives); `/troubleshooting/` still in the wuld.ink serif
register, deliberately, since it has no mode switcher and is not a wing; the flagship's own examples and coda sections
in JetBrains and EB Garamond, and their `.copy-btn` in Arial — a pin move, unasked; the front door's `.lib-meta` at
2.13:1; the K232 batch, still waiting on the LOAD-BEARING table; the film's Apparatus line once the film is public.
Register: cccxlvi is the highest.

## WI-K322 — the clearing under the cursor, built twice because the brief had two halves that pull opposite ways; a node-select cue for each graph view; a negative result inherited from an instrument its own stratum called vacuous; NO PIN; cccxlvii, cccxlviii

ONE efilist COMMIT, FIVE FILES, NO PIN — the two layer packs and three new `sfx/wz-pick_*.ogg`. Pin HELD at v4.0.3
`c60dcb56498debc84d2fb2860cd55167` / 2,982,518 B, gated by md5, byte count and blob before the writes and by blob after
the commit. Both items are Josiah's, and the first had been carried since WI-K320 §8 at his own word.

THE CLEARING, AND THE BRIEF THAT CONTAINED ITS OWN CONTRADICTION. He asked for it in two messages an hour apart:
*"the sharpening / focusing when hovering with the mouse. It's still fuzz-ish when I run my cursor over a selection ...
not to the point where the bloom and vignette vanish"*, then *"It shouldn't completely remove the bloom of the text or
the vignette surrounding the page, but help sharpen what's there and gently illuminate the surrounding area around the
cursor in a way that pushes back any darkness or blurring."* Sharpen and illuminate are not the same instruction on a
near-black page, and the arithmetic says so before any pixel is measured: `contrast()` pivots at 0.5, this ground sits
at luma 0.04, so `(0.04 - 0.5) * c + 0.5` is at or below zero for every c a page could use — contrast can ONLY darken
this ground, however much it separates the type from it. A lift alone fails the other way: it raises ground and type by
the same absolute amount, which is brighter fog.
    BUILT WRONG FIRST, AND THE MEASUREMENT SAID SO. The first build was contrast alone at 1.11. Measured in a box of
    body text under the cursor: mean luma 18.39 -> 8.49. A shadow following the cursor. The number was in hand before
    he saw it, which is the only reason it never shipped.
    THE PAIR, AND THE ORDER IS THE MECHANISM. `backdrop-filter` acts on what is behind the element; the element's own
    background then paints over that result. So contrast+brightness separates first and a faint warm radial lifts what
    is left. Ground ends ABOVE where it started, type ends higher still. Swept seven combinations against four
    quantities read off the real page -- the ground between the strokes, the strokes, the annulus around them, and the
    two separated -- and shipped `contrast(1.13) brightness(1.08) saturate(1.05)` with lift `0.105`:
        off                17.00 gnd | 20.37 type | ratio 1.20 | halo (type/annulus) 1.198
        shipped            +5.4%     | +26.8%     | +20.3%     | 1.261
        one notch up       +11.1%    | +32.4%     | +19.1%     | 1.296   (1.16 / 1.10 / 0.130)
    Local RMS contrast in the same box 3.07 -> 4.25. Pixels at or over 250 in a box holding a tier badge and the
    crimson accent: 0.000% at every stop, unchanged from off, so nothing clips. The halo column is what answers
    "sharper" without removing the bloom: the bloom is still painted, and it is dimmer RELATIVE to the type it
    surrounds, which is the only sense in which a uniform text-shadow can tighten.
    GATED, AND ONE GATE IS HIS. *"The magnification feature is plenty clear as is, so it doesn't need any sharpening
    with that area"* -- right, and for a reason worth keeping: the clearing is a screen-space box over a scaled stage,
    so at 2.5x it covers a fifth of the text it covers at 1x and reads as a smear. `html.wz-zoomed` turns it off. Also
    off on a cream ground, off with no fine pointer, off under `prefers-reduced-motion`, gone 2.6 s after the pointer
    stops, and off while scrolling -- which is both intent (a reader scrolling is not examining a word) and cost.
    THE COST, MEASURED AGAINST ITSELF. Same bytes, clearing on versus `display:none`, scrolling and moving the pointer
    together at 80 events/s: median 16.70 ms both, p75 33.30 both, p90 33.40 vs 33.50, frames over 33 ms 26.0% vs
    25.5%. Before the scroll suppression the same pair read p75 16.80 vs 33.30 -- the clearing owned the p75 and the
    scroll owned the rest. A control drawn from the same build is the only one that can say which.

CCCXLVII. A NEGATIVE RESULT RECORDED WITHOUT A POSITIVE CONTROL FORECLOSES THE MECHANISM FOR EVERYONE AFTER, and it
does not decay into doubt the way a positive claim does — nobody re-runs a thing that is written down as not working.
    THE INSTANCE, and it is this project's own log. WI-K313b listed "radial-masked backdrop-filter" among six vacuous
    selectors under cccviii, and the same stratum recorded, as a finding, that peripheral blur "is inert -- three
    mechanisms, max abs delta 0.000". Both sentences are in one stratum: the instrument is named as vacuous and its
    output is kept as a fact. WI-K320 §8 then carried it forward as a measured negative into the brief for this very
    build. Re-measured on the live flagship 2026-09-13: a radial-masked `contrast(1.18) saturate(1.06)` moves 97.6% of
    the pixels inside the radius by a mean of 8.95 levels and 0.1% of the pixels outside it by 0.005. It is the
    strongest of the four mechanisms tried and the whole effect is built on it. Had the note been believed the build
    would have gone to the second-best mechanism for no reason.
    AND IT HAPPENED AGAIN, MINE, WITHIN THE HOUR. The first run of the vignette leg read 0.0000 / 0.0% and I nearly
    wrote "cutting a hole in the vignette does nothing". The probe point was (700, 480) on a 1440x1000 viewport --
    the viewport centre, inside the vignette's own transparent stop. Moved off-centre it reads 2.41 mean levels across
    88.4% of the pixels in the radius. Same shape, one hour apart, one of them mine.
    THE COUNTER-DISCIPLINE is cheap and is now in the harness: before a null result is written down, the same
    instrument must produce a non-null on something it should detect, and the probe must be placed where the thing
    under test actually paints. A stratum that files an instrument as vacuous must strike the sentences that
    instrument produced, in the same edit, or they outlive it.

CCCXLVIII. AN IDENTIFIER WHOSE TOLERANCE IS WIDER THAN THE SPACING BETWEEN THE THINGS IT IDENTIFIES REPORTS THE FIRST
CANDIDATE, CONFIDENTLY, EVERY TIME. The pick-cue gate named cues by decoded duration with a fixed 0.05 s tolerance, and
the three cues are 0.34 / 0.30 / 0.28 s — 0.02 to 0.06 apart. Every one of them matched `pick_web` first, so the gate
reported the dependency graph firing the web cue and the flow map firing the dependency cue, and read as two routing
failures in code that was correct. Distinct from cccxxvii, where the needle can occur OUTSIDE the thing under test;
here it occurs inside several of them. The fix is not a tighter constant but a nearest-match against the real decoded
durations, read off the files at run time — the identifier derived from the population it has to separate, rather than
chosen.

THE NODE-SELECT CUES. Josiah, on three screenshots: *"I wanted SFX for when you click on what the cursor is hovering
over -- unique to those sections."* One per graph view: `pick_web`, `pick_dep`, `pick_flow`, 0.28–0.34 s.
    THE CHORD IS MEASURED, NOT QUOTED. The generators the video seat's handoff names are not in the folder it names, so
    the four shipped `.ogg` files are the specification. FFT peaks under 600 Hz across them: 55.0 / 82.5 / 110.0 /
    123.6 / 164.8 / 220.0 / 247.2 — A1 E2 A2 E3 A3, the open-fifth stack, with B2/B3 as the ninth in `library_index`.
    The picks are that stack an octave up.
    THE OCTAVE IS NOT A DEPARTURE FROM THE REGISTER, IT IS THEIR OWN COST NOTE APPLIED. The view cues sit at centroid
    114–148 Hz with essentially nothing above 250, and §5 of the handoff states the consequence itself: "on a phone all
    four will be quiet ... do not make any of these the only feedback for a view change." A pick IS the only sound a
    selection makes, so inaudible is not an option. The picks land at 208–268 Hz, beside `wz-magnifier_in` (251) and
    `wz-tier_step` (181) — the bank's own instrument cues — with the master low-pass still at 1.8 kHz and no partial
    above A4. Levels 2 dB under the bank's −34.9 dB short-term reference; bank parity would be 0.365 / 0.279 / 0.336.
    Generator `gen_pick_cues.py`, seed 2010, deterministic, printing its own command line, in the video seat's kit
    folder beside theirs.
    THE ROUTING IS KEYED ON THE VIEW AND MEASURED AT THE HIT TEST. The node classes belong to d3, not to the layer, so
    the rule is: inside `#map-view` / `#dep-view` / `#map1-view`, a click that hit-tests to a drawn element inside the
    svg — never to the `<svg>` root, which is what an empty-canvas click hits — or to a row of the flow map's source
    list, and not to a button, legend or toolbar. Verified by hit test on real nodes with d3 served from an npm tarball,
    because cdnjs does not resolve from this container and without it all three graphs render as empty `<svg>` elements
    — a fact worth knowing before trusting any earlier graph-view census taken here.
    NINE LEGS GREEN: the right cue in each of the three views, from an svg node and from a source row; a toolbar button
    still gives the plain click; an empty-canvas click gives nothing; a library row keeps its expand cue.

STATE. efilist: one commit atop the WI-K321b landing (`1dc8e34`) by `k324\K324_efilist.ps1`, rehearsed in pwsh against
a bare origin and a fake `curl.exe` on five paths — green, spent, a corrupted input, a NEW file that already exists, a
tampered pin, and an untracked `CLAUDE.md` that must not block. wuld-ink: this stratum. Drop: `k324\` holds the five
files, the block, the generator and a README with the measured stops and the one-line console dial. Carries: everything
in `LATER_after_K321b.md` minus item 1, which is this stratum. NOTE ON THIS FILE: it is now within a stratum or two of
the ~250 KB trim threshold WI-K318b wrote; `k318b\trim_claude_md.py` does the cut and that stratum has the method.
Register: cccxlviii is the highest.

## WI-K324 — the dot on /watch/, /troubleshooting/ in the library's face, a carry struck rather than fixed, and the log cut a second time; cccxlix-ccclii

THREE COMMITS AND A TRIM, none of them touching the pin, which stays **v4.0.4**
`c60dcb56498debc84d2fb2860cd55167` / 2,982,518 B. wuld-ink `a233e99` → `b924f48` (the `.` card and
its regens); efilist `84aadac` → `a0af468` (/troubleshooting/); then this file.

THE `.` CARD. Josiah: *"this video wasn't added on the /watch/ cards. It goes between Illogically Is
and the Argument Library video"*, and later that the Argument Library film had gone public. The
companion short — `Ie-KzrxSP4k`, 4:57, the period that ends Illogically Is given a wall — sits
between the two cards he named. Its copy is compressed from his own release description rather than
paraphrased. Three things measured rather than assumed:
    THE WARNING BAND CLIPS, SILENTLY. It is `white-space:nowrap` with an ellipsis and holds about 31
    characters at 360px. The first draft rendered as `WARNING — ONE WHITE FRAME, CUTS TO BL…`, which
    is worse than no warning at all: the reader sees a truncated hazard and cannot tell what was cut.
    Measured at 1280 / 390 / 360 / 320 and shortened to `WARNING — flash, harsh sound`, which fits at
    all four; the precise statement (one white frame, three full-field cuts to black, screams and
    crying) is in the note beneath, where there is room. One reading error along the way, recorded
    because it nearly became a finding: `scrollWidth` never reports below `clientWidth`, so the
    sibling card's "slack 0" meant "fits with room to spare" and I first read it as "exactly full".
    THE ARGUMENT LIBRARY CARD SAID 4:35. Studio shows 4:36 on the thumbnail and in the player.
    Corrected — the card should say what a viewer sees.
    HIS PUBLIC DESCRIPTION'S TWO LINKS RESOLVE. `/illogically-is/` and `/illogically-is/dot/apparatus/`
    both 308 → 200. Checked because of cccxli (in the history): an anchor that returns 200 is not an
    anchor that lands, and a description pointing at a 404 is invisible until someone clicks.
    THE SITEMAP GOT ITS OWN COMMIT, or would have. `gen_sitemap.py` takes each page's `lastmod` from
    `git log -1 --format=%as` — the commit's OWN timezone — so a sitemap built in the cloud container
    carries that container's UTC date rather than the operator's. The block therefore regenerates it
    after the content commit, and on the run it found no change to make, because /watch/ already
    carried that day from an earlier commit. `--check` green either way.

CCCXLIX. WHERE LINE-ENDING NORMALISATION IS ACTIVE, AN md5 OF THE WORKING COPY IS NOT A GATE ON WHAT
GETS COMMITTED, AND `git status` SAYS NOTHING. The first run of the /watch/ block aborted on
`src/releases.json`: `33a652b9` on disk against `870dc985` in the blob, tree reported CLEAN. The
cause is `core.autocrlf` — the file is checked out CRLF and normalised back to LF on add, so the
bytes on disk and the bytes in the commit are different objects and only one of them ships. Proved
rather than assumed: the CRLF form of the base blob hashes to exactly the `33a652b9` the run
reported, and with a CRLF working copy in place `git rev-parse HEAD:<path>` still returns the right
sha.
    WHAT MAKES IT A TRAP RATHER THAN A NUISANCE is that `src/watch/index.html` passed the identical
    gate in the same run, because whatever last wrote it happened to leave it LF. The two files
    differ by history, not by rule, so the gate looked sound right up until the file it was wrong
    about came second. Every block since K320 had this shape.
    THE FIX IS THE RIGHT PRIMITIVE, not a tighter one. `git rev-parse HEAD:<path>` reads the blob and
    `git rev-parse :<path>` reads the index entry — what a commit is actually made of. Both are blind
    to the working copy's line endings, both need no piping through PowerShell, and the staged form
    still catches a CRLF *write*: the same content added under `autocrlf=false` stages as a different
    sha, checked. Every block from here gates blobs.

CCCL. A CONSTANT TRANSCRIBED FROM A TRUNCATED RENDERING OF ITSELF IS A NEW CONSTANT. Twice in one
session I wrote a full md5 into a block whose first eight characters I had read off a table and
whose remaining twenty-four I supplied from nowhere — `1d4f57e0c1a4bbe2a3e0b9f4b3ad4bd8` for
`1d4f57e0cccc310d9fa7ee97e469fe96`, and `058a0e54cc70c6e0e1dfa5f5e58e08cd` for
`058a0e54dbaa5244c8221c731b9cfc08`. Both were caught by the gate they were written into, which is
the system working; but a gate is not a proofreader, and a hash that is wrong in a *read-back* line
rather than an input line would have failed after the push instead of before it.
    THE TELL IS STRUCTURAL, NOT ATTENTIONAL. The blob shas in the same blocks were right every time,
    and the difference is that those were interpolated from `git hash-object` while the md5s were
    typed. So the rule is mechanical: a block's constants are computed into it, never transcribed,
    and the generator asserts that every hash literal in the finished block is one of the values it
    computed. Truncated displays are for reading; they are not a source.

CCCLI. A VALUE THAT LIVES IN BOTH A GATE AND A SENTENCE WILL DRIFT IN THE SENTENCE, BECAUSE ONLY THE
GATE IS CHECKED. Every block this session gated the pin as `c60dcb56498debc84d2fb2860cd55167` /
**2,982,518** and every one of them passed. Every document this session wrote it in prose as
"v4.0.3 ... / 2,982,420" -- the wrong version AND the byte count of the version it superseded, since
WI-K320 moved v4.0.3 (`62c733ac` / 2,982,420) to v4.0.4 (`c60dcb56` / 2,982,518). The two figures sat
in the same session, one machine-checked and one not, and the unchecked one was wrong for nine hours
across two relays, a session prompt, three drop READMEs and the first draft of this stratum.
    THE LIBRARY SEAT CAUGHT IT, from the relay alone, by noticing that three of its statements could
    not all be true: two md5s a day apart both labelled v4.0.3 unmoved, in a document that also
    reported a v4.0.3 -> v4.0.4 move and showed v4.0.4 on the front door. That is the right way to
    read a relay and it is the reason relays are written.
    DISTINCT FROM CCCL, which is a constant transcribed from a truncated rendering; here nothing was
    truncated and the correct value was on screen repeatedly, in block output, all session. The
    failure is that prose has no gate. The counter-discipline is the one cccl already implies, applied
    one level out: **a figure a block gates is the only copy of that figure, and prose quotes it from
    the block's own output rather than from memory** -- and where a document must state a pin, it
    states the pin it just read, with the read shown.
    Corrected here rather than in place, per this file's own rule: the relays and the session prompt
    were reissued with the correction named, not silently patched.

CCCLII. A MEASUREMENT SENT TO ANOTHER SEAT IS A NUMBER AND A DEFINITION; THE NUMBER ALONE IS NOT A
MEASUREMENT. The video seat's handout gives spectral centroids for its four view cues -- 146 / 179 /
207 / 279 Hz -- and asked, reasonably, why mine for the same four came out at 114-148 Hz when the
files are the files. Both sets were right of their own definition and neither document carried one.
Theirs, which their relay states, is the standard: magnitude-weighted, Hann window, whole file,
`sum(f*|X|) / sum(|X|)`. Mine weighted by power, `|X|^2`, with no window, which leans harder on the
loud low partials and drags the figure down. Recomputed under theirs, on the bytes that actually
ship (the Vorbis, not the masters): **143.4 / 169.8 / 181.7 / 252.3 Hz** against their 146 / 179 /
207 / 279 -- mean absolute error **15.9 Hz**, ranking identical cue for cue, the residual being their
WAV masters against the shipped encode. Under power weighting the same four read 113.9 / 147.8 /
127.3 / 133.5, which is the 114-148 I published.
    THEIRS IS ADOPTED, not split. Magnitude weighting is what the literature and every library mean
    by "spectral centroid"; mine was the outlier, and naming it a second convention would leave two
    numbers in the corpus for one property. Restated under theirs, the three node cues are
    **260.8 / 259.5 / 242.1 Hz** (`pick_web` / `pick_dep` / `pick_flow`), published under power
    weighting as 208-268. The octave-up decision rests on the picks sitting above the view-cue family
    and beside `magnifier_in` and `tier_step`, which holds under either weighting, so nothing built
    on the figure moves.
    THE RECONCILIATION ITSELF PRODUCED A THIRD SET FIRST, and that is the hazard in miniature. The
    first pass reported 246.1 / 261.1 / 216.3 for the picks: it had mixed WAV masters with shipped
    encodes and left the window unstated, so it was a fourth definition rather than a check on the
    other two. It never left the container, and it was caught only because the figures were rerun
    against a script that prints its command line and names all four definitions side by side. A
    reconciliation performed without a stated definition reproduces the fault it is reconciling.
    THE COUNTER-DISCIPLINE IS ONE LINE: state the weighting, the window and the source bytes beside
    the value, or send the code that produced it. `centroid.py` does all four and prints its own
    command line, per cccxxxi -- a published figure gets a generator. A figure whose definition
    travels only in the head of whoever computed it costs a round trip between seats to recover, and
    this one did.

/TROUBLESHOOTING/ WAS NOT A TASTE CALL. Carried since WI-K321b as "the wuld.ink serif register,
deliberately, ask first". Measured, the page loads IBM Plex Mono in its head **and nothing else**, so
its declared `"EB Garamond", "Cormorant Garamond", Georgia, "Times New Roman", serif` resolved only
for a reader with those faces installed and fell through to Georgia for everyone else — the exact
thing Josiah disliked on the wings, on the one page reached when the site will not load. The
`--serif` variable is deleted rather than redefined to a mono stack, which would have been a lie in
the source. Overflow 0 and the h1 wrapping to the same two lines at 1280 / 390 / 360, contrast 49
elements 0 below AA both ways, 138 elements Plex after.

THE FRONT DOOR'S `.lib-meta` CARRY IS STRUCK, NOT FIXED, and it was mine. Recorded at K321 as
2.13:1 and carried through three strata as a known defect. Measured live in all four modes it reads
5.81 / 5.06 / 8.63 / 7.46 — AA everywhere, and it never failed. The 2.13 came from reading
`--faint: #4a4742` out of the page source; that page declares `--faint` four times and the layer
overrides all four with the warm-tinted `#9b887b`, which is what paints. A declaration read instead
of a rendered value (cccxxxviii, in the history), then carried forward unread (cccxxx, likewise).
Had it been "fixed" the fix would have made a passing row worse — the option offered, lifting it to
`--dim`, measures 4.35 and 4.20, which is below AA.

THE CUT. WI-K313a → WI-K318, twelve strata, 108,558 B, moved byte-exact to `CLAUDE-history.md`.
Hazards cccxxii → cccxxxix go with them and remain live; cccxl → ccclii are defined in this file. The
first-4096-byte prefix is unchanged, because the cut begins at byte 77,020 and KEEP1a runs to
5,525 — so a stratum block gated on `2cef196bc447b0bce2ba96fbc5424ca3` still works, which is worth knowing before
someone re-derives it. Same script, same proof: `trim_claude_md.py` refuses an anchor that is not
exactly once at a line start, proves KEEP1a + KEEP1b + MOVE + KEEP2 == the base before writing
anything, and only concatenates.

STATE. Pin **v4.0.4** `c60dcb56498debc84d2fb2860cd55167` / 2,982,518 B, unmoved through all of it.
The version label in this paragraph was wrong in its first draft and in both relays that went out
with it -- see cccli above. wuld-ink `b924f48` plus this trim; efilist
`a0af468`. Drops `k325\` (the card, its block, the README on why the gates are blob shas), `k326\`
(/troubleshooting/ and its block), `k327\` (this trim: the texts, the manifest, the block).
Carries, now short and two of them answered while this stratum was being written: the Apparatus film
line -- the video seat has inverted handout §6 (it now asserts the page LINKS `JsUIL9GIfIM` exactly
once and that the link carries the master's md5) and their reissued page sits in their `page\` folder
at 31,837 B, so this is a wuld-side reissue through ship script v4.2 whenever it is wanted; the flagship's own examples and coda sections, still JetBrains Mono and EB Garamond from the
`rwe.html` graft, a pin move nobody has asked for that should batch with the K232 items; and the K232 items, which the library seat UNBLOCKED at their K234: the 222 is a v3.3-era
fossil (74 objections / 222 edges, canon-attested), the series runs 222 -> 245 -> 254 -> 255, a
sibling instance was patched at L1033 and left stale, and the instruction is to REGENERATE the table
rather than patch rows. Their mechanism-web limit text is authored and ready to land. That is a
`combined.html` change and therefore the next pin move, with the flagship's examples/coda typography
as its natural batch partner. Register: cccli is the highest.
