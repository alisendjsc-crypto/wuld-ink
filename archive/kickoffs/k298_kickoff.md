# Session prompt — wuld.ink K298: the `/donations/` micro-pass + the phone type-scale census + the `/book/` ruling packet — the help vessel is NOT this session

Written at the K297 close (2026-09-07). K297 LANDED `f9ec361` atop `e211d56`: `/gallery/` 1.86 → 0.59 phone
screens; the served-page behaviour gate (cclxiv) passed both faces the same session (phone
`details.gallery-fold.open=false`, first room card 495 = 0.59, 3 of 9 cards fully on screen 1; desktop
`open=true`, summary 0, rooms 807 = 0.90, plate grid 1,722). The CLAUDE.md K297 carry still says
"landing: pending" — **you record `f9ec361` and those numbers in the stratum you write** (forward-record,
K295 pattern).

Josiah is bringing TX15-BACK (the Successor-Protocol seat's reply to
`Downloads\Successor Protocol\omega_proxy_expansion_transmission_15.md`) back by the end of this session.
**When it lands, it is K299, its own session** — the ship path is serial (every ship appends CLAUDE.md
and moves HEAD), and the vessel touches the corpus + two omega components with `?v` bumps. Do not fold it
into K298. If it is already on disk when you open: note it in the stratum, finish K298, hand K299 the
K296 prompt (`Downloads\k295\NEXTSESSIONK296successor.md`, renumbered; nothing in it changed).

## Gate on entry — four things must be true, or stop and say so

1. **K297 landed:** wuld HEAD is `f9ec361` (or a later one-committer commit atop it), HEAD == origin,
   `git status` clean (`docs/dot-handoff/` on disk, ignored by design). Served `/gallery/` md5 `4c4fbd54`.
   Expect a 0-byte `.git\index.lock` left by a Cowork `git status` (cclix) — the ship block clears it;
   never `rm` it from the mount (refused); if you must stage from the mount, `mv` it aside.
2. **Every pin re-derived, none copied** (cclxii). The ones this session leans on: `src/donations/index.html`
   `3248341c` (396 lines, 17,499 B; inline `<style>` lines 33–239; ZERO `REPLACE_ME`) · `src/gallery/index.html`
   `4c4fbd54` · `src/search-index.json` `51ce5c50` (998; regen == committed) · `src/sitemap.xml` `d13cb884`/66 ·
   `components/gallery.css` `28e50931` @ `?v=K275` on 10 pages · `components/glossary.css` [compute] on 22
   pages · `mobile-a11y.css` `a5ed6a2c` @ `?v=K287b` · `sw.js` `679eaa5d` cache `wuld-sw-K287b` (gallery.css
   is NOT precached; `?v` assets are cache-first on miss) · reach baseline `tools/gate/reach-audit-K297.json`
   `94ecb213` · flagship `library.wuld.ink/combined` `e654eabd`/2,963,752 (efilist READ-ONLY, not opened).
3. **The harness is gone again** (VM scratch is wiped per session): `cd $HOME && npm i playwright@1.47.2`,
   `PLAYWRIGHT_BROWSERS_PATH=$HOME/pw/browsers npx playwright install chromium`, `apt-get download
   libxdamage1` → `dpkg-deb -x` → `LD_LIBRARY_PATH=$HOME/pw/libs/usr/lib/x86_64-linux-gnu`. ~2 min. Copy
   `src/` out of the mount twice (`pristine`, `cand`). Scratch scripts from K297 are in `Downloads\k297\`
   (`anatomy.cjs`, `measure_donations.cjs`, `fp_gallery.cjs`, `toggle_gallery.cjs`, `shot.cjs`,
   `live_gallery.cjs`, `splice_gallery.py`) — reuse, don't rewrite.
4. **The reach crawl runs in the FOREGROUND of one `device_bash` call** (89 s for 140 rows). A `nohup … &`
   crawl died silently at 30 rows at K297 — any background process dies with the call that started it.

## What this session is

Three deliverables, in order of value, ONE commit for the first two, NO PIN, NO `sw.js`, NO changelog:

### Part 1 — `/donations/` micro-pass (build + ship; ONE `src/` file; NO fold)

The K297 finding: the queue's 1.89 was the three one-time cards (the `first` column ranks by REPEAT-GROUP,
≥3 siblings); the page's purpose, the PayPal Donate button, is a singleton `<form>` at **930 px = 1.10**
phone (desktop 894 = 0.99). Measured anatomy above the button (`Downloads\k297\measure_donations.cjs`):
chrome 152 → eyebrow 30 + mb 18 → h1 34.2 px (the K275 clamp — this h1 is NOT an escape) 38 + mb 36 → intro
(69 words) 267 + mb 18 → section mt **72** (collapsed) → eyebrow 22 + mb 9 → h2 **mt 54** (inherited from
base.css — find the rule before overriding), **40.5 px** (`.donations-section-heading { font-size:
var(--t-h2) }` beats the bare-`h2` phone clamp by specificity → a phone h2 LARGER than its h1), 47 + mb 18 →
lede (39 words) 148 + mb 27 / form mt 27 (collapsed) → button 930, 281 px tall.

**Instrument = a `@media (max-width: 640px)` block appended to the page's inline `<style>`, selectors at
≥ the escaping rules' specificity, later in source.** Expected, by arithmetic: h2 → `clamp(1.5rem, 5.5vw,
2rem)` (= 27 px at 390, two lines → one) ≈ −14; h2 `margin-block-start: 0` (the eyebrow's mb 9 carries
the gap) ≈ −45; `.page-hero-title` mb 36 → 18 = −18; `.donations-section` mt 72 → 36 = −36; lede mb /
form mt 27 → 18 = −9. **≈ −122 → the button top ≈ 808 = 0.96** — above the fold, the label visible.
Measure it; if the measured number is under 844 ship it; if it is not, do NOT reach for the intro — the
"nothing here is paywalled" paragraph is the ethical frame and belongs BEFORE a donate button (K297
ruling); record the shortfall and ship the rhythm anyway (the h2 > h1 inversion is a defect on its own).
Do not touch the second section, the tail, or the disclaimer aside beyond the shared section margin.

**Gates, all on the shipped bytes:** (1) desktop fingerprint pristine-vs-candidate at 1280 / 1440 / 1024 /
900 / 768 / 641 — the STRICT K296 form (zero deltas, no added nodes — there is no fold and no reorder, so
nothing is excluded); (2) the committed reach gate, 140 rows vs `reach-audit-K297.json` — only the two
`/donations/` rows may move (`interact.y` is the number that matters; `first` and `docH` move with it);
zero other rows, `nodes`/`stickyBottom` never gated (cclxv); (3) search-index: `build_index.py` over
pristine == over candidate == `51ce5c50` (no text changes → HELD, no regen); (4) `sweep_mobile_nav.py`
NO-OP (`targets=70 skipped=8 already=70 to-write=0`); (5) a real parser: 0 unclosed / 0 mismatched; CR 0;
U+FFFD 0; trailing newline; (6) diff-proven: N inserted, 0 deleted, 0 modified; (7) sitemap untouched.
**NEW BASELINE `tools/gate/reach-audit-K298.{json,md}`** rides the commit (measured on the K297 tree +
this change).

### Part 2 — the phone type-scale escape CENSUS (measure → table → fix within scope)

`mobile-a11y.css` scales headings at ≤640 with BARE element selectors — `h1 { clamp(1.9rem, 7vw, 2.6rem) }`
= 34.2 px at 390; `h2 { clamp(1.5rem, 5.5vw, 2rem) }` = 27; `h3 { clamp(1.25rem, 4.5vw, 1.6rem) }` = 22.5.
Any class-qualified size rule wins by specificity. Known escapes: `components/gallery.css:33`
`.gallery-page .page-hero-title { font-size: var(--t-h1) }` (10 pages — the lobby is fixed page-locally at
K297; the NINE room pages still render their h1 at 54 px: `Original Character` / `Main Character` /
`The Wrong Thing` likely wrap to two lines at 336 px), `components/glossary.css:99` `.entry-term {
font-size: var(--t-h1) }` (22 glossary pages), and inline heading-size rules in 8 pages: `/archive/`,
`/contact/`, `/donations/`, `/essays/`, `/music/`, `/recommendations/`, `/troubleshooting/`, `/watch/`.

**Instrument:** Playwright at 390×844 (mobile emulation) over those 10 + 22 + 8 = 40 pages, served from the
local tree: for every `h1/h2/h3` inside `<main>`, record computed `font-size`, rendered height, line
count (height / line-height), and the phone-scale value for its level; flag `font-size > scale × 1.05`.
Write `tools/gate/type-scale-K298.{json,md}` (the K297 reach-audit shape: JSON every row, MD a ranked
table). A rule inside a page's own `≤640` block that sets a size at or below the scale is NOT an escape;
say so in the table rather than dropping the row.

**Fix policy (decide by the table, not by the grep):** (a) page-local escapes on the page already being
touched (`/donations/`) ride Part 1; (b) the COMPONENT escapes ride K298 **only if the census finds ≥ 2
consumer pages with a heading over 1.4× its phone-scale value** (a wrapped 54-px h1 qualifies) — then
the fix is ONE edit in the component (`@media (max-width: 640px) { .gallery-page .page-hero-title {
font-size: clamp(1.9rem, 7vw, 2.6rem); line-height: 1.12; overflow-wrap: break-word; } }` — the same
clamp, at the escaping selector's specificity) + a `?v=K275 → ?v=K298` bump on that component's
consumers by ARITHMETIC (old-count == 0, new-count == consumers; grep ALL tracked files for the old
string, ccliii — `sw.js` does not precache gallery.css, but prove it, don't assume it), desktop
fingerprint zero-delta on every consumer at 1280 and 641 (the rule is phone-scoped), and the lobby's
K297 inline rule left in place (same value; harmless; note it). Otherwise the component escapes are
RECORDED in the stratum and deferred. Pre-flag the budget before taking path (b): it is a 10-page (or
22-page) `?v` edit — a mini-sweep, not the 70-page one.

### Part 3 — the `/book/` RULING PACKET (measure + render; NO build, NO commit)

`/book/` is 1.73 by `first` (desktop 1.79 — worse on desktop) and its purpose, the purchase link, sits at
**1,295 = 1.53 phone / 1,441 = 1.60 desktop**. Measured anatomy (phone): eyebrow → `div.book-cover` **447**
+ mb 36 → title block 120 → hero pb 36 + mb 54 → lede (26 words at 20.25 px) 234 + mb 54 → purchase
block 188 → mb 108 → `section.book-section` 1,462. Desktop: cover **575**, title block at **910 on a
900 viewport** — the K3 addendum tuned the 24 rem cap "to keep the title-block + lede above the desktop
fold", and it no longer does (the header grew to 250 px since K3). The cover is the page's identity, so
cap changes are Josiah's ruling, not a build call.

**Produce, for Josiah:** one contact sheet (phone 390 + desktop 1280) of pristine vs THREE candidates —
cap 24 rem (today) / 18 rem / a phone-only `max-width` (14 rem) with the desktop cap held — each row
annotated with: desktop title-block top (goal ≤ ~780), phone purchase-link y, phone first-section y.
Plus a five-line recommendation (mine, to be overruled: 18 rem restores the K3 intent on desktop
without touching phone identity; the phone-only cap is the only thing that moves the purchase link
meaningfully on phones and costs the cover). Deliver to `Downloads\k298\` + the chat; write the numbers
into the stratum as a carry. Nothing enters `src/` for this part.

## Hard constraints — do not rediscover

- **Page-local, phone-scoped, byte-inert on desktop** is the default shape for every reach fix (K291 →
  K297). The K297 reorder was the arc's ONE deliberate desktop change and was gated by regions; nothing in
  K298 needs that — the strict zero-delta fingerprint applies.
- Prose is a ruling: no fold, no cut, no re-flow of Josiah's paragraphs without his call. The `/donations/`
  intro stays above the button (ruled at K297). Fold summaries are new prose and get flagged as
  unratified-verbatim if he has waived the wait.
- `gallery-room.js` `b3e1c9e6` `?v=K110` is byte-frozen (its K110 "controls-first" comment is stale for the
  lobby since K297 — a comment, not behaviour; fix at the file's next real touch, not now).
- Never a bare grep count as a claim: measure every constant with the same instrument that checks it
  (`grep -c` LINES == `Select-String … .Count`); the stratum body must not quote its own `### K298 (`
  heading literal or the CLAUDE.md gate counts 2.
- `interact` can report a child of a CLOSED `<details>` at the summary's y; `nodes` and `stickyBottom` are
  crawl-context dependent — corroborate with an isolated re-run before calling either a change.
- Live docH ≠ harness docH (real plate images load from `audio.wuld.ink` live) — never gate docH across
  the two; the served-page behaviour gate (cclxiv) checks open-state, positions and errors only.

## Settled — do not reopen

- The `first` column ranks by repeat-group; a singleton control is invisible to it. Read `interact` beside
  `first` before any rank becomes a work order. The instrument itself is NOT edited this session.
- The queue after K297: `/donations/` 1.89 (purpose 1.10 → K298) · `/recommendations/` 1.79 · `/book/` 1.73
  (a ruling → Part 3) · `/archive/` 1.52 (desktop 1.82) · `/music/` 1.48 (desktop 2.33). Zero pages ≥ 2.00.
- The Yūrei launcher overlapping the second room card's corner on phones (K297) is NOTED, not fixed.
- The help affordance is K299, gated on TX15-BACK; the words are the seat's and Josiah's; none are written
  in K298.

## PS handoff

One `& { … }` scriptblock, the K297 shape (`Downloads\k297\ship-K297.ps1` is the template): `$repo`
anchor + `Test-Path .git` + `Set-Location` + `[Environment]::CurrentDirectory` → `.git\index.lock*` +
`tmp_obj_*` cleanup → null-safe `rev-parse` → HEAD==origin==`f9ec361` → base-blob guards
(`HEAD:src/donations/index.html` == [compute], `HEAD:CLAUDE.md` == `27adbdfe`, disk == HEAD for both) →
sidecar MD5 gates BEFORE any move (`src\donations\index.k298.html`, `CLAUDE.md.k298`; the reach + census
artifacts pre-placed at final paths) → `Move-Item` ×2 → result-MD5 gates → shape asserts with
populations (the K298 comment lines, page bytes, `@media (max-width: 640px)` lines by ARITHMETIC old vs
new, JSON `"page": "/donations/"` lines == 2, the K298 heading in CLAUDE.md == 1) → explicit-stage one
path per line → staged-count gate → `git ls-files -s` blob gates → commit → `postBuffer` push +
`$LASTEXITCODE` → `Start-Sleep 75` → `curl.exe` live asserts (served `/donations/` md5 SOFT; the K298
block's comment line by content-grep HARD; flagship `e654eabd` HARD). `curl.exe`, never the alias; `-o` a
temp file, never `$null`; one-line if/else; `Md5`, never `H`; no double quote inside a native-command
argument; every hash constant in the block checked by SCRIPT against a value measured this session.
If path (b) of Part 2 is taken, the consumer pages and the component are additional named paths in the
SAME commit with their own blob gates and an old-`?v` == 0 arithmetic assert.

## Budget

Part 1 ≈ K296 minus the fold and the toggle gate; Part 2 ≈ one 40-page Playwright pass + a table (+ a
mini-sweep only on the threshold); Part 3 ≈ three renders and a sheet. One commit. Pre-flag before
starting, and again before path (b). If TX15-BACK lands mid-session, it does not change this session's
scope — K299 is the vessel.
