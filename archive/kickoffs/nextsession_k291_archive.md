# Session prompt — wuld.ink K291: `/archive/` gets its first two screens back (ONE FILE)

Paste this as the first message in a fresh WULD INK Cowork session. It is self-contained.

Read `C:\Users\y_m_a\Projects\wuld-ink\CLAUDE.md` first — the orientation sequence, then the
`verify_before` at the tail (**K290's block is current; three pins in it were CORRECTED and the
old values are wrong, see below**). Then this.

---

## Fold this in first, before any other work — you have the evidence, do not re-derive it

**K290 landed.** Commit `eba9678` atop `191a947`, **5 files, +8,289**, zero `src/` bytes.
`git status` empty. All three live asserts green: `/void-engine/` unchanged at 648,526 B md5
`45695ad9`, `/` unchanged at md5 `ef24e174`, `/argue/` still 404. The K290 stratum, its carries and
hazard **cclxii** are already written into `CLAUDE.md`; this is just the sha.

**THE THREE CORRECTED PINS ARE LOAD-BEARING. Do not trust any pin you did not measure this
session** — that is hazard cclxii, and it is why K290 found three wrong ones:

- `src/index.html` = **`ef24e174`** (27,690 B). NOT `25395c1a` — that is the file at K285,
  copy-carried through five `verify_before` blocks including the one written by K287b, the
  session that changed the file.
- `src/base.css` = **`f7b7f4ea`** (since K34, 2026-05-23). NOT `144b2841`.
- `src/tokens.css` = **`870bf737`** (since K24c, 2026-05-15). NOT `4654928d`.
  The last two were labelled **BYTE-FROZEN**, and that label is exactly why nobody ever ran them.

**THE COWORK DEVICE SHELL CAN REACH `wuld.ink`.** The standing "the container cannot reach
wuld.ink (egress)" note is true of the **cloud container** and false of the **device VM**. Assert
served bytes yourself with `curl` in `device_bash` — before the ship and after — instead of
waiting for the operator's paste. (Playwright/Chromium also runs there: `npm i playwright`,
`npx playwright install chromium`, then extract `libxdamage1` with `dpkg-deb -x` into VM scratch
and point `LD_LIBRARY_PATH` at it. No root needed. Nothing lands in Josiah's folders.)

**THE REACH GATE IS COMMITTED AND RE-RUNNABLE. Do not rebuild it.**
`node tools/gate/reach_audit.cjs <copy-of-src> tools/gate/reach-pages.txt out.json` → `out.json`
+ `out-table.md`. It serves the whole tree through `context.route` (no HTTP server: Cowork's
device shell is `--die-with-parent`, so a backgrounded server dies with the call that started it)
and aborts every non-local origin. Baseline to beat is `tools/gate/reach-audit-K290.json`.

---

## What this session is

**`/archive/` — the only Tier 1 page on the site, and the only one bad at BOTH widths.** One
file. The whole anatomy is measured below; you are building, not surveying.

### The measurement, already taken (390×844, phone)

| block | y | height | screens |
|---|--:|--:|--:|
| site-header + sticky `div.mnav-bar` | 0 | 152 | 0.18 |
| `header.archive-page-hero` (eyebrow 22 + h1 48 + lede 119) | 152 | 357 | 0.42 |
| `div.archive-disclaimer-body` | 632 | **541** | 0.64 |
| `div.archive-disclaimer-warning[role="note"]` | 1,209 | **356** | 0.42 |
| `blockquote.archive-epigraph` | 1,666 | **659** | 0.78 |
| **`section.archive-section` — "Videos", the first archived object** | **2,397** | 3,290 | **2.84** |
| "Writings" | 5,795 | 10,542 | |
| "Images" | 16,445 | 1,189 | |

`docH` 18,154. Desktop 1280×900: hero 284 · body 333 · warning 208 · epigraph 214 · **first
section 1,639 = 1.82 screens**, `docH` 11,702.

**`.archive-disclaimer-body` + `.archive-epigraph` = 1,200 px = 1.42 phone screens of read-once
framing.** That is the whole defect. Everything else in the stack is either chrome, the title, or
the content warning.

### The hard constraint, and it is not negotiable

**`div.archive-disclaimer-warning[role="note"]` is a content warning about depression,
suicidality and despair in the archived material. It stays exactly where it is, at full height,
uncapped, uncollapsed, unwrapped, on every width.** Shrinking it is a safety regression wearing a
layout optimisation's clothes. If a proposed change would reduce its prominence, the change is
wrong, not the constraint. Say so and pick something else.

### The recommendation — staked, and one of the two halves needs Josiah's ruling

**Wrap `.archive-disclaimer-body` and `.archive-epigraph` each in a `<details>`, closed on phones,
`open` above 640px, with a one-line `<summary>` that names what is inside** (the disclaimer's
existence stays above the fold; only its prose folds away). The warning sits between them,
untouched. Arithmetic: 2,397 → **≈1,100 px ≈ 1.30 screens**, a full screen and a half recovered.

**Why `<details>` and not the K287b height-cap.** K287b's rule — *the fix is height, not sequence*
— was right there because reordering would have stranded `COPY POSITIVE` below a 98,690 px card
list. Capping works here too, but the arithmetic is not enough: 152 chrome + 357 hero + 356
warning is a **~900 px floor before the cappable material gets one pixel**, so caps land you at
~1.5–1.8 screens, not under 1.5. And moving the two blocks *below* the sections buries a
disclaimer 12.5 screens deep, which for a disclaimer is a stance change, not a layout one.
`<details>` is the only shape that keeps all three: order, presence, and reach. The pattern is
already in-house — `details.successor-about` on `/successor/`.

**RULED BY JOSIAH, not a build call:** reducing a disclaimer's default prominence, even to a
visible summary line one tap away, is his decision. **Ask before splicing**, with the arithmetic
above in the question. If he declines the `<details>`, fall back to the K287b cap on those same
two blocks (`max-height` + `overflow-y: auto` + `overscroll-behavior: contain`, mobile only) and
report the smaller win honestly rather than dressing it up.

**DESKTOP IS A SEPARATE RULING AND DEFAULTS TO NO.** `<details open>` above 640px leaves desktop
geometry identical, which is the safe ship. Desktop still sits at 1.82 screens afterwards and the
honest fix there is different — at 1280 the disclaimer wants to be a column *beside* the Videos
section, not above it. But desktop has been byte-inert for many sessions and Josiah's standing
word is "the desktop site looks fine." **Ship mobile, hand desktop forward.**

### Second ruled item, cheap, ask in the same breath

**`/successor/index.html:266` links to `/argue/`, which is not a route** — no `src/argue/`, no
`_redirects` rule, no worker — and it 404s live today. Three ways to close it: build the route,
repoint the link at the real Argue the Argument project, or drop the cross-reference. **Content
decision, Josiah's.** It is a one-line rider on this session if he answers; otherwise carry it.

---

## Hard constraints — do not rediscover these

- **ALL `.archive-*` RULES ARE PAGE-LOCAL.** 19 of them live in `src/archive/index.html`'s single
  inline `<style>`; no component carries them. **So this is ONE FILE: no component byte, no `?v`
  bump, no 70-page sweep, no `src/sw.js`.** The same shape as K289, the cheapest ship there is.
  If that stops being true, the full chain is: component + `?v` bump + re-sweep of the 70
  nav-bearing pages + **`src/sw.js`** (its `SHELL` array hard-codes component URLs with their
  `?v` and every `*.html`-only sweep misses it; bump `var CACHE` in the same edit).
- **A layout fingerprint over a change that ADDS elements differs by construction** (hazard cclx).
  `<details>`/`<summary>` are added nodes — **exclude them and compare like with like**, with
  `docH`/`docW` as the corroborating scalar. K289's gate cried wolf on exactly this and the gate
  was what was wrong.
- **Gate the bytes, not the probe.** Playwright's `add_style_tag` appends at the end of the
  document and wins every source-order tie, so it passes rules that lose in the real cascade.
  Iterate with the probe; decide on the committed or served file.
- **Block external requests in every probe** (`context.route` → abort non-local). K289 lost two
  minutes to hanging `fonts.googleapis.com` fetches.
- **Never reuse one temp path across a loop of `curl -o` probes** — K288 got three byte-identical
  readings for three different URLs. `mktemp` per probe.
- **Re-run the gate as the proof.** `/archive/` must move in `reach_audit.cjs`'s own output, not
  in a bespoke one-off measurement. Diff against `tools/gate/reach-audit-K290.json` and check that
  **no other page moved** — that is the regression gate this session exists to have.
- Never rename the sweep script's `OPEN`/`SHUT` marker; it is an identity, not a version (K282).
  `python3 tools/sweep/sweep_mobile_nav.py src` must report
  `targets=70 skipped=6 already=70 to-write=0` — run it and prove it.
- `src/void-engine/index.html`'s inline `<style>` and engine body are **SPLICED REGIONS**,
  wholesale-substituted from `C:\Users\y_m_a\Downloads\Void Engine\DUAL_ENGINE_v2.html` with **no
  sync script**. Not this session's file, but never patch them locally if it becomes one.
- Homepage index card count stays a multiple of 6. **NO PIN**: the flagship
  `library.wuld.ink/combined` is `e654eabd` v4.0.0 and efilist is READ-ONLY.

## Settled — do not reopen

- The desktop-assumption copy audit: **closed and clean** (K289/K290).
- The reach metric: **built, committed, calibrated** (K290). The commissioned first-content rule
  is inert on this site — worst 0.31 screens across all 70 pages — and is retained as column four
  only. Rank by first browsable group and payload group.
- `/console/` and `/watch/` binding audits: **CLEAR** (K290). `theater-mode.js` closes three ways,
  two of them touch-native. Do not re-audit them.
- `/void-engine/` mobile arc: **closed.** 11a done, 11b declined, item 20 withdrawn. It ranks 13th
  now. Its `dblclick`→fullscreen is unreachable on iOS — recorded, deferred, not this session.

## After `/archive/`, the queue (do not start it here)

`/frame/` 1.95 · `/donations/` 1.89 · `/gallery/` 1.86 · `/recommendations/` 1.79 · `/book/` 1.73 ·
`/music/` 1.48. **`/book/` (1.79) and `/music/` (2.33) are WORSE ON DESKTOP than on phone** — a
mobile-only fix is the wrong shape for those two. Full table:
`tools/gate/reach-audit-K290.md`.

## PS handoff

One `& { … }` scriptblock: `$repo` anchor + `Test-Path .git` + `Set-Location` +
`[Environment]::CurrentDirectory` → **then** `.git\*.lock` and `.git\objects\*\tmp_obj_*` cleanup
(**there was a stale zero-byte `index.lock` at K290 open — expect one**) → null-safe first
`rev-parse` → HEAD==origin guard → base-blob guards (`git rev-parse HEAD:path`) → shape asserts →
explicit-stage **named paths, one per line** (never `git add -u`) → measured staged-count gate →
`git ls-files -s` index gates → commit → push (`$LASTEXITCODE` gated,
`http.postBuffer 524288000`) → `Start-Sleep 75` → `curl.exe` content-grep live asserts.
`curl.exe`, never the `curl` alias. `-o` a temp file, never `$null`. One-line if/else. The md5
helper is `Md5`, never `H`.

**Gate hygiene — five ways a gate has lied here, all cheap to avoid:**

1. **`Select-String -AllMatches` is IGNORED when `-SimpleMatch` is set** (cclxi) — `$_.Matches` is
   empty and the sum is 0 whatever the file holds. Count matching **lines** and corroborate with
   `@(git grep -o --fixed-strings <needle> …).Count`, that needle kept **quote-free**.
2. **Never put a double quote inside a native-command argument** — PowerShell mangles it, git
   matches nothing, and a gate wanting 0 passes while checking nothing. Anchor a substring-prefix
   `?v` by **arithmetic** (all − new), never by delimiter.
3. **A gate that can only return one value is not a gate.** Feed a new gate a case whose answer you
   already measured by other means. K290 did this four times and two of its own defects fell out.
4. **Order every byte-check before the first `git add`.** K289's broken gate aborted with nothing
   staged — it cost a paste, not an incident.
5. **Grep the defect, not the marker.** K290's first pass counted `class="rec-card` and got 211
   against a pinned 51; `<article class="rec-card` returns 51. The pin was right and the grep was
   wrong, caught only because the number was absurd. Fourth session running.

**Do not stage from Cowork.** The mount cannot `unlink`, so a mounted `git add` can leave a stale
zero-byte `.git/index.lock` that makes every later git write fail, plus undeletable
`.git/objects/*/tmp_obj_*` litter. `rm` is refused on the mount; `mv` works. Cowork builds and
verifies the bytes; Windows git writes the index.

## Budget

Small and bounded: **one `src/` file** (`src/archive/index.html`), one gate re-run proving
`/archive/` moved and nothing else did, one stratum, one commit. No component, no `?v`, no sweep,
no `sw.js`, no pin. If Josiah declines the `<details>` shape, the fallback cap is smaller still.
Pre-flag cost before starting, as always.

Tier 1 is this page and nothing else. `/void-engine/` cost two sessions and was 13th on the list;
this one was on nobody's list until a gate went looking.
