# P5 — wuld.ink cosmetic layer: backlog register

> **The wings are release-ready.** Full results in `P5_RELEASE_AUDIT.md`. The audit found one
> blocker that would otherwise have shipped: the default tier was scrolling at 30fps. Fixed, along
> with print, tap targets, and the first-visit hint. Nine files are written into the deploy repo and
> uncommitted; `P5_deploy_wings.ps1` commits them.

Everything raised, nothing dropped. Ordered by this seat's recommendation, with the reason each item
sits where it does and what actually blocks it. Measured numbers are from this session's harnesses
(`census5.py`, `contrast.py`, `tokens.py`, `gate6.py`) at 1440x900, Chromium, sRGB forced.

---

## P0 — THE BLOCKER NOBODY NAMED

### 0.1  The layer is not on the site — **wings LIVE (pushed 23fbbed, 2026-09-11 17:32 −0700), flagship still pending**
*(Written when it was true; kept as history.)* Every test so far runs by pasting `wuld_live_test.js` into a console. **No visitor to wuld.ink has
ever seen any of this.** That matters more now than it did this morning: reversing the power ladder
to start at `vfx` changes the default *for a snippet Josiah pastes*, and nothing else. Until the
layer ships inside the pages, "default on" is a statement about one browser tab.

Two halves, and they are NOT the same job:

- **Wings + umbrella + /troubleshooting/** — not pinned (v0.1.x–v0.3.x, complete /
  provisional-complete). Safe to integrate in normal work.
- **Flagship `/combined`** — PINNED at v4.0.1. The standing rule is: *do not touch the pinned
  flagship except in a deliberate, isolated pin-move session.* Integrating the layer there is a pin
  move. It gets its own session or it does not happen.

Sub-items that come with integration:
- **FOUC / layout shift — SOLVED.** The wrapper now ships in the markup and `wrapStage()` adopts it
  rather than reparenting (building one remains the fallback for the console snippet). Measured with
  a `layout-shift` PerformanceObserver: **CLS 0.000** on all seven integrated pages, identical to the
  originals.
- **First-visit hint — RESOLVED, now a build item.** Josiah's answer to the off-ramp concern: on a
  fresh browser session the reader gets a discreet prompt pointing at the power button, saying they
  can lower or disable the effects. That is the right affordance and it settles the objection. To
  build: shown once per browser session (`sessionStorage`, wrapped), dismissible, must not itself
  glow or pan, and must not be the first thing a screen reader hits.
- **Persistence is in** (`localStorage['wz-tier']`, every touch wrapped) so a step-down survives
  navigation. Verified across two pages in one profile.

---

## P1 — UNIFY THE WINGS TO THE FLAGSHIP'S PRESENTATION

Josiah's call, and the measurements back it: this is a readability win, not only a consistency one.
It is also the prerequisite for P2 — collapse the mode buttons *before* this and the wings are
stranded with no remedy.

**Contrast, every visible prose element ≥25 chars, STANDARD:**

| surface | median | min | below WCAG AA 4.5:1 |
|---|---|---|---|
| flagship | **13.90:1** | 2.66 | 2 of 87 (2.3%) |
| right-to-die | **4.20:1** | 2.06 | 90 of 165 (**54.5%**) |
| right-to-die, HIGH-CONTRAST | 13.89:1 | 6.15 | 0 (0.0%) |

Worst single offender on the wings: `a.permalink` at **2.06:1**. Unification fixes it at the source.

**The spec, measured rather than described.** Both families already share IBM Plex Mono; everything
below is what actually differs.

| axis | FLAGSHIP (the target) | WING (right-to-die) |
|---|---|---|
| type scale | **3 sizes** carry it: 13px/500, 10px/700, 10px/400 (×82 each) | **6 sizes**: 9.6, 9.92, 11.2, 12.48, 12.8, 13.76 — fractional, i.e. derived not designed |
| weight | 400 / 500 / 700 in active use | **400 only** — no weight contrast anywhere |
| tracking | a design device: 1px, 2px, 3px, uppercase labels | mostly `normal`; one uppercase style |
| body colour | `#ddd` on `#0a0a0a` → 13.9:1 | `#7A766E` (×288) and `#4A4742` (×146) → 4.20:1 |
| accents | semantic set: `#6699CC` `#FF6633` `#CC9900` `#FF3333` | `#C41E3A` + blue + gold, less systematic |
| card | `1px solid #222`, **radius 0**, pad 14/18 | `1px solid #23211F`, **radius 2–3px**, pad 0.8/5.6 and 16/17.6 |

So "awkward" decomposes into three concrete things: **six accidental sizes instead of three
deliberate ones, no weight contrast, and two dim greys doing the work of one bright one.** Rounded
corners are the visible identity tell.

### PART A — THE PALETTE: **DONE AND MEASURED**
`wuld-type.css`, **3 rules, 7 declarations**, verified on 6 surfaces × 4 modes = 24 cells:

| mode | before (range across surfaces) | after |
|---|---|---|
| STANDARD | 68.9% – 89.9% of text below AA | **0.0%** |
| LEGIBLE | 26.7% – 47.6% | **0.0%** |
| HIGH-CONTRAST | 0.0% | 0.0% — untouched |
| BOTH | 0.0% – 6.5% | **0.0%** |

Not a selector list. All six surfaces declare the identical nine CSS variables, so the fix redefines
variables and reaches every element in every mode with nothing to go stale. Only failing values were
moved; two of the four modes are not touched at all. The crimson keeps its hue (`#c41e3a` →
`#e83a56`), lifted in lightness only.
**Four wrong turns on the way, all caught by measurement, all worth not repeating:**
1. A selector list got 78.7% → 40.9% and stalled. A list of names reaches only the names on it.
2. Overrides on `:root` beat the page's own `[data-mode]` blocks (equal specificity, later wins) and
   made BOTH *worse* — 2.8% → 81.5%. Scope to the mode being fixed.
3. `.rsi-badge` is inline-styled, so it needs `!important`; the count (17 inline colours = 17 badges)
   was in an earlier probe's output and went unread.
4. A comment block lost its opening `/*` and CSS error recovery silently ate the rule after it.
   `element.matches(sel)` returned **true** the whole time — it tests a selector string, not whether
   the rule parsed. Check `sheet.cssRules.length` instead.

### PART B — TYPE SCALE AND GEOMETRY: **DONE AND MEASURED**
**Filed at first as "an aesthetic call rather than a correctness one." That was wrong.** The wings put
the *majority* of their text elements below 10px; the flagship essentially never does.

| surface | elements | under 10px, before | after | distinct sizes |
|---|---|---|---|---|
| flagship | 274 | 1 (0.4%) | — (template) | 5 |
| right-to-die | 601 | 429 (**71.4%**) | **2.8%** | 12 → 5 |
| veganism | 296 | 187 (63.2%) | **2.7%** | 10 → 5 |
| abortion | 120 | 66 (55.0%) | **5.8%** | 10 → 5 |
| libraries | 45 | 22 (48.9%) | **0.0%** | 8 → 6 |

Sub-10px is below any practical reading floor, and it is **also why Part A was hard to see**: 324 of
the palette patch's 473 changed elements sit at 9.9px, and only 46 of them are above the fold of an
8,394px document. A contrast fix on type that small is a compliance win before it is a reading one.

Method: the selector list is **every `font-size` rule in all six pages' own stylesheets**, extracted
by parsing them with comments stripped — 36–39 rules per surface, unioned to 39 across the family,
bucketed by computed px and mapped onto the flagship's 10 / 11 / 13. Exhaustive by construction, not
by inference; re-extract if a page gains a rule rather than adding names by hand. Expressed in `rem`
so `[data-mode="legible"]`'s 17px root still scales them — `px` would silently defeat that mode.
Plus weight contrast (the wings were 400 on every element) and radius 2–3px → 0.

Verified after: contrast still **24/24 cells at 0.0% below AA**; zero horizontal overflow at 1440,
1024, 768 and 420px; document height **−0.2%**, because collapsing the scale brought the large sizes
down as much as it brought the small ones up.

---

## P2 — RUNS IN PARALLEL

### 2.1  Mode buttons: four → two
What ships today is not four modes. It is a **2×2 matrix with the cells labelled as alternatives**:
- LEGIBLE = the *typography* axis (IBM Plex Mono → Georgia, size and leading up)
- HIGH-CONTRAST = the *contrast + polarity* axis
- BOTH = both cells at once

That mislabelling is the whole source of the confusion Josiah identified — and it is why the same
word lands on opposite grounds in the two families (flagship dark in LEGIBLE, wings cream; wings pure
black in HIGH-CONTRAST, flagship cream). Two toggles, zero capability lost, `BOTH` deleted.
**After P1, re-measure:** if the wings land near 13.9:1 the contrast toggle may genuinely become
droppable, which is the one-button outcome Josiah wanted — reached by evidence rather than by
assertion.

### 2.2  Magnifier / phosphor zoom — **DONE**
Shift+wheel or the chin button, 1×–4×, pointer-anchored with 0px drift, `transform-origin: 0 0`,
phosphor grille invisible at 1× and resolving as the pitch grows. 16.70ms median at every zoom.
Escape or the button exits; stepping the power tier down drops the zoom with it. Full findings in
`P5_RELEASE_AUDIT.md`. *(Original scoping below, kept for the record.)*

#### original scoping
**Activation:** `Shift` + wheel, plus a magnifier button in the chin. Verified: on these pages
Shift+wheel fires a *cancelable* wheel event and horizontal overflow is **0 px**, so its normal
behaviour is already a no-op — free to bind.
**Not Ctrl.** Ctrl+wheel is the browser's own zoom, and trackpad pinch arrives as ctrl+wheel too.
Binding it would take away real accessible zoom *and* pinch in exchange for an aesthetic effect —
self-defeating, given the argument for keeping accessible zoom on the browser where it is better.
**Scale, not reflow.** Reflow-zoom is Ctrl+ and the browser does it better than we could. Scale is
the only mechanism that magnifies the *texture*, which is the point of the feature. Sold as the
aesthetic feature it is, never as the accessibility replacement.
**Risk to retire first (spike before building):** zoom scales `.wz-stage`, which already carries the
camera's `translate3d`. The pan bounds were derived from lip width at 1× — the whole no-black-void
guarantee. Must clamp to **≥ 1×** and re-derive the bound as a function of scale. Prove the
composition before any texture work.

### 2.3  The phosphor texture — **DONE**, built as a fixed overlay whose pitch scales with zoom

#### original scoping
There is nothing to zoom into yet. The stage has a glow and no structure. Needs an aperture-grille /
subpixel mask that is invisible at 1× and resolves past roughly 3×. This is the build; the zoom is
just the lens.

---

## P3 — DEFERRED, BLOCKED ON AN ASSET

### 3.1  SFX layer — **DONE, WIRED, GATED AND MEASURED**
See `P5_SFX_SPEC.md`. The reference was segmented into 100 events and measured; Josiah's "no
high-pitched" instruction turns out to be a clean filter (centroid <1200 Hz, <5% above 3 kHz) that
keeps 76 and removes 24. Seven sounds generated from the surviving profile — **not** cut from the
reference, which is Valve's — in `wuld-sfx/`, 50 KB of Vorbis for the whole set including a seamless
ambience loop. **Now wired**: `wuld-sfx.js`, delegated listeners (the wings render their cards from
JSON after load, so anything bound at init would miss all 82), one decoded buffer per sample, a fresh
source node per play, hover rate-limited to 120ms and dropped rather than queued. Chin mute button at
44×44, persisted in `localStorage`. 14 silence gates pass — **with four live positive controls**, see
below. Frame cost measured with audio actually running: 16.70ms median, 0.0% of frames over budget.

#### original scoping
Hover/focus/activate sounds. Steam Big Picture as *reference for construction* — how highlight,
sound and motion are one event rather than three — explicitly not a copy. **Blocked: Josiah is
supplying a soundfont.**
Constraints worth fixing now so the build is not relitigated later:
- Autoplay policy: no sound before a user gesture. First gesture unlocks the audio context.
- Sound is part of the VFX tier, off at `cosmetic` and `off`, and muted under
  `prefers-reduced-motion` — a reader who suppressed motion did not ask for whooshes.
- Needs its own mute, persisted alongside `wz-tier`.
- One buffer per sample, pooled; no per-hover network or decode.

---

## P3.5 — NEW, FROM THE 2026-09-10 NOTES

### 3.5.1  Library ambience — **DONE**
PC mechanical whirring / humming, subtle, ASMR-esque, **exclusive to the library** (not the rest of
wuld.ink). `wz-ambience_loop` — 118 Hz hum with band-limited fan noise and a slow wobble, seamless.
Cannot autoplay; starts on first gesture, ramps in over 1.6s and out over 0.5s so it never arrives or
vanishes abruptly. Stops on tier step-down, on a light ground, on mute, and under reduced motion.

### 3.5.2  First-session tutorial — **DONE, one per view**
A short walkthrough per view, once per browser each, always skippable. One feature at a time, ringed
at full brightness with everything else under 74% black.

**Per view, not per page** — the generalisation Josiah asked for, and the right one. The flagship is
five surfaces behind one URL, and a reader who opens the dependency graph three weeks after their
first visit has had no introduction to it at all. Each view carries its own three-step tour and its
own `wz-tour:<key>`, fired when that view is **activated** rather than at page load. The library's
runs longest: six steps on a wing, seven on the flagship, which has a view switcher and an RSI
methodology panel the wings do not. The last step of every view tour is its METHODOLOGY button —
the affordance readers most often never find, and the one that most changes how the view reads.

**A ? button, fourth in the chin**, runs the tour for whatever view is in front of you — no menu of
five. Four 44×44 buttons with 6px gaps still fit at 320px; that is why the wordmark hides below 500 (see the QC pass below — it was 420, derived for three buttons).
`wzTour()` does the same from the console.

Skip and Escape at every step, arrow keys both ways, clicking off ends it, focus trapped in the
dialog while it is open, nothing at all under `prefers-reduced-motion`. It owns the first visit: the
one-line hint says the same thing as the library tour's first step, so the tour claims the hint's
key at parse time — before boot calls `hint()` — and only on a page that can actually run it, so
/troubleshooting/ keeps its hint and spends no flag.

Four things it got wrong first, each caught by measuring:
- **One overlay with a box-shadow hole** meant raising the spotlit element above it — which, for a
  chin button, meant raising the whole chin: the row stayed bright and the ring hid behind it.
  Replaced with four panels around the target, which cover everything *except* the target and touch
  nobody else's z-index. Then they had to go above the frame and chin at 2147483000/1, which is
  where the tour belongs while it runs.
- **The ring drew mid-scroll**, spanning the bottom of one card and the top of the next — a rect
  read two frames after a *smooth* `scrollIntoView` is a rect in flight. It now settles first.
- **A tall target centred** puts both ring edges off-screen, so the spotlight has no visible
  boundary at all. Anything over 70% of the viewport scrolls to its top instead.
- **It ran on /troubleshooting/**, which has a chin and therefore resolved three steps and passed
  the "enough steps" test. That page is where a reader lands when the site is *broken*; a
  walkthrough of screen effects is the last thing they want, and it would have spent the once-ever
  flag so the real tour never ran on a wing. The tour now requires a library surface, detected at
  parse time by the mode buttons' stable ids — present in the static HTML of every wing and the
  index, absent there.

**And a harness consequence worth recording, because it is the kind of thing that rots quietly:**
the tour runs in every fresh Playwright context, so every harness that samples pixels was suddenly
measuring a 74% black mask. `fbcontrast.py` went from eight cells at 5.37–13.89:1 to eight cells at
1.00–1.74:1 with no CSS change at all, two of them reading exactly 1.00 because the mask had
flattened glyph and ground to the same colour. 26 harnesses now set the flag; `wzharness.py` records
why, and `tourtest.py` is the one place deliberately left alone.

### 3.5.2a  THE STAGE WRAPPER BREAKS THE FLAGSHIP — **fixed in the layer, and a pin-move hazard**
Found by running the per-view tours against the flagship. The flagship switches its three top-level
sections with `body > #id` selectors:

    body > #combined-library, body > #combined-rwe, body > #combined-coda { display: none; }
    body[data-active-view="rwe"] > #combined-rwe { display: block; }

`.wz-stage` is a real element between `<body>` and the content — that is what carries the camera
transform — so the moment it exists **neither rule matches anything**. Both the hide and the show
stop working and every section renders at once. Measured before and after the wrap on the same page,
which is the only way to tell this from a page behaviour; and no rule in the layer sets `display` on
those ids at all, verified by walking every stylesheet for one.

`mirrorBodyChildRules()` in `wuld-vfx.js` now walks the page's own rules and injects a mirrored copy
of every `body ... >` selector with `.wz-stage` spliced in. Mechanical, recurses into `@media`,
edits nothing, and a **verified no-op on all three wing surfaces** — it injects no stylesheet there
at all. The pin-move prompt carries the full finding and the verification steps.

Two flagship items still open, both recorded in the pin-move prompt: the feedback control does not
attach to the flagship's `div.objection-header` markup, and the flagship throws on its own top-nav
examples/coda buttons — reproduced with no layer present, so not ours to fix outside that session.

### 3.5.3  Feedback button — **DONE, per-card**
A `FEEDBACK` label at the top-right of every objection card opens a mail draft to
`contact@wuld.ink` already carrying the card. No backend, no form, no storage, no consent banner.

**Why not a corner button.** A global one produces "something's broken somewhere"; a per-card one
arrives with the objection id attached, which is the difference between a report you can act on and
one you have to chase. Site-wide comments already have a route — `wuld.ink/contact` — so a fourth
chin button would add a channel without adding information, and at 320px the chin row is already as
wide as it can be.

**The draft describes the card so the sender doesn't have to.** Library, headline, the colloquial
names off the card's own `.kw` chips, the classification strip, the id and the deep link — read from
the card at click time, so it cannot drift out of date. On the sanctity card that means the draft
says *also called: sanctity of life · sacred · inviolable · life is a gift · playing God · sin* by
itself. Built longest-first and degraded in a fixed order against an 1800-character budget, because
Windows passes the whole mailto through a shell and clients truncate well before 2000. Measured
across 50 cards on five wings: **longest 1295 chars, every field present, nothing over budget.**

Three things it got wrong first, each caught by measuring:
- **Floated, and it rewrapped every headline.** A float is only contained by a block taller than
  itself; `.obj-meta` is 17px and the control has to be 26px to clear the WCAG 2.5.8 target floor,
  so 9px hung past the strip and shortened the first line of each `h2`. Anchored against the card
  instead (which measured `position: static`, so making it relative changes nothing it does today),
  with the strip reserving the lane by padding keyed to the injector's own attribute. Re-measured at
  1440/768/390/320: document height, every card height and the headline height **identical** with
  the control and without it.
- **Dimmed with opacity, and the cream ground failed.** `.62` measured 3.56:1 on dark but **2.58:1**
  on cream — under 1.4.11's 3:1 for a UI component. Opacity is the trap: `getComputedStyle` returns
  the token, the compositor draws something else, and only a pixel sample tells you which. At `--dim`
  full strength the worst of eight mode/tier cells is **5.37:1**.
- **An envelope glyph that read as a close button.** At 12px in the card's mono stack `✉` renders as
  a small outlined box. An ambiguous icon repeated on 82 cards is worse than a plain word, so it now
  borrows the card's own micro-label voice (10px/700/1px tracked uppercase, same as `DIAGNOSIS`).

Injected and observed, not delegated: **0 of 5 wings carry a single `class="obj"` in their static
HTML** — the cards come from JSON and a filter replaces the lot — so a one-shot pass at boot would
find nothing. Six scripted re-render cycles: 16.70ms median, worst 16.80ms. Suppressed in print,
releasing the reserved padding with it.

## P4 — OPEN, SMALL

- **Tint hue not chosen.** Shipped `#FF9A78`. Strip rendered at `#FF8195` (LED spec) / `#FF9A78` /
  `#FFA85C`; the three are near-indistinguishable at subtle strength. Wash level is the axis that
  reads: `.10` shipped, `.18` is where it becomes deliberate.
- **Ship script `(want >=1 1 0)` line is stale for v4.** `SHIP_WHEN_REPIN_LANDS.ps1` greps the served
  page for `RESULT OK`, a v10 phrase; v4 says *result | OK — 5 of 5* in a table, so `RESULT=0` is the
  correct reading and the annotation is what is wrong. Fix it in the same edit that adds the film link
  (the script's last line says that goes in when the film is public) — one edit, before the next ship,
  which the post-pin-move apparatus reissue will need anyway. The v4.1 script is committed as it ran
  (`WI-K313e_commit.ps1`, commit 1), stale line included, because the blob that produced `d60ec13`
  should be the blob in history.
- **DONE and PUSHED — wings live.** *(the rest of this item is the history of how)* `C:\Users\y_m_a\Projects\efilist-argument-library`
  (Cloudflare Pages, `_redirects`). Nine files: `wuld-layer.css` + `wuld-layer.js` at the root, and
  7 pages each gaining exactly **4 lines / +122 bytes** — a `<link>`, a deferred `<script>`, and the
  `<div class="wz-stage">` wrapper. Externalised rather than inlined, so one edit updates every
  surface and the pin move later is the same 4 lines. Run `P5_deploy_wings.ps1` to commit; it hash-
  gates all nine, refuses if the staged count isn't 9, and **aborts if the pinned root
  `combined.html` is staged**. Undo before pushing: `git reset --hard HEAD~1`.
- **CORRECTION — the wings never defaulted to LEGIBLE.** Stated repeatedly this session and wrong.
  Their pre-paint bootstrap resolves: saved `localStorage['wuld:libmode']` → else
  `prefers-color-scheme: light` → `legible` → else `standard`. The `data-mode` in the markup is a
  placeholder the script overwrites before first paint. Every measurement said "legible" because
  headless Chromium reports a light colour scheme. A dark-mode reader has been getting STANDARD all
  along. An earlier version of `integrate.py` rewrote that attribute to `standard` and changed
  nothing whatsoever. `resolve()` is left alone deliberately: having just moved the glow gate's
  accessibility floor *onto* OS signals, overriding an OS signal here to impose an aesthetic would
  be the same error pointing the other way.
- **Inline prose links stay under 24px** — 34 of them per wing. WCAG 2.5.8 exempts targets
  constrained by surrounding line-height, and padding them would overlap hit boxes between lines.
- **RESOLVED — `em` stays on the base glow, and the stated rule was wrong.** Measured across the
  wings at the vfx tier: editorial `em` renders at colour luma **160.1**, `strong`/`b` at **95.0**.
  So the brighter element is the one *not* on the bold list — and the old comment ("brightness earns
  the boost") would have argued for adding it. Two corrections fall out. First, `strong` is dim by
  *inheritance*, not by styling: every instance measured sits inside `.rsi-formula`, a deliberately
  quiet block, so the bold glow is doing the right thing there. Second, what the bold list actually
  selects is **structural prominence** — headings, `th`, `dt`, badges, the trigger line — not
  brightness. `em` is stress inside a sentence and appears 35 times in running prose on one wing;
  the loudest paint on the view has no business mid-line. The CSS comment has been rewritten to say
  this, so the next reader doesn't apply the rule the file used to claim.
- **RESOLVED — `code` / `pre` audited on the dark wings, no change needed.** `/troubleshooting/`:
  `code` ×10 at colour luma **62.0** (the accent red), `pre` ×3 at **193.5**, both on the 10px base
  glow. A `text-shadow` scales with `currentColor`, so dark saturated text cannot smear — the effect
  is self-limiting, which is the part that was being guessed at. `pre` rendered at 2× and inspected:
  the monospace stays crisp. Contrast unaffected — /troubleshooting/ is 14.28 median, 0 below AA.
- **Flagship's own AA failures — the count was wrong and is corrected here.** Reported earlier as
  "2 of 87". That was the prose-only population (elements ≥25 chars). Including short labels, a third
  site appears: **`span.category-label`, 83 elements at 4.42:1** (`#777` on `#0a0a0a`). So the
  flagship has **85+**, not two. The pin-move prompt has been corrected. Two populations, two true
  numbers, and quoting the flattering one is how a page gets called clean.

---

## QUALITY-CHECK PASS — end of 2026-09-11, on a model switch

Requested as "anything that may have been missed, errors, gaps in continuity." Run as an adversarial
review of the *harnesses*, not a re-run of the suite, on the principle that a green suite tests what
its author thought to test. Nine findings, all fixed and re-verified; two of them in shipped copy
that describes the operator's own apparatus, which no geometry test could ever have seen.

- **The wordmark clashed with the `?` button between 421 and 476px.** The 420px hide threshold was
  derived for three chin buttons and never re-derived for four. `chinfit` sampled 1440/768/390/320
  and nothing in the band. Hides below 500 now; `chinfit` samples 520/480/440 as well.
- **Three factual errors in the graph-view tour copy.** "Click an edge" on the mechanism web — nodes
  are clickable (117 with pointer cursors; 142 lines with none). That web's edges described as
  "relations between mechanisms" — they join an objection to a mechanism. The dependency graph's
  weak edges called "low-confidence" — weak means *the response would survive the premise's
  removal*; confidence is what the REVIEW and PROVISIONAL badges mark. All copy rewritten and now
  under `tourcopy_gate.py`: 15 claims, each tied to a verbatim panel sentence, read straight from
  the shipped source so the gate cannot drift. The précis got this discipline on day one; the tour
  copy, making the same kind of claims, did not.
- **Step-2 rings on the map and dependency views covered 77% of the viewport.** My "toolbar"
  selector guessed `.map-controls`, which is the *zoom* container; the union then ran from the
  toolbar to the graph's `+ − FIT` buttons. The toolbar is `.map-toolbar`. `flagtour` asserted step
  counts and never ring geometry; it now asserts the step-2 ring contains exactly its buttons.
- **A second scroll-timing bug in `place()`, opposite to the first.** Smooth scroll has ~2 frames of
  startup latency, and "stable for two frames" was satisfied *before the scroll began*: frame log
  shows the loop out at 39ms, the page scrolling until 221ms, and the ring easing via its own CSS
  transition onto the view switcher 130px above the toolbar. The wings passed by timing luck. Scroll
  is instant now, and no stability inside the first 150ms counts.
- **A rapid-arrow race**, found by reading: two quick presses started two settle loops and the last
  painter won. Generation counter; six trials at 40ms spacing, zero mismatches.
- **Tour keys leaked to the page.** Escape and the arrows were `preventDefault`ed but not stopped, so
  the flagship's own handlers also saw them. The tour is modal; they stop there now.
- **The sound layer repainted the mute button on every wheel tick** — its observer fires on any class
  change of `<html>`, and the magnifier toggles `wz-zooming` per event. 40 zoom ticks: five DOM
  writes each before, zero after; a real mute still repaints. (The first version of *this* fix
  compared a value to itself after assigning it — caught on re-read, not by a test.)
- **The shim re-emitted `@supports` blocks as `@media`.** Both have `conditionText`. Now re-emits
  under the rule's own at-keyword.
- **`.obj{position:relative}` was unscoped** — any element with that class on any page. Scoped to
  cards the injector has marked.
- **Two lines in the methodology précis added claims their source sentence does not make** — "the
  axis most often misread", and "they are not decoration". The source gate cannot see an addition
  riding on a real sentence. Corrected in `precis.py`; the library seat has the addendum.

## CLOSED THIS SESSION

- **The ship script's parity gate, added and removed the same day.** Added this morning to catch a
  v4 document paired with a v10 manifest; removed this evening because the presence check already
  caught that pairing (v4's md5 was absent) and parity refused the film seat's *superset* manifest —
  fifteen renders, both v10 entries preserved byte for byte — which is the more honest record. A gate
  added on top of a sufficient one encoded an assumption about the shape of an input this seat does
  not own. It fired on its first real run, as predicted, with nothing written. **Misfiled here as
  "same family as cccxxix" and corrected in WI-K313e:** cccxxix is a denylist *passing* what it was
  not told to fear; this gate *failed a valid input*, keying on a count (renders = cuts named) as a
  proxy for the identity the md5 presence check already measured — **cccxxiii** in the false-FAIL
  direction, and a breach of K310c's own rule, *a check that can cry wolf must not be able to block.*
- **The apparatus page**, which yesterday's version of this document said was waiting on the operator's
  endnotes (cccxxx). It was waiting on three artefacts at three versions. Reconciled; v4 builds through
  the real chain, verifier GREEN at 28 checks; the film seat supplied the v4 manifest within the hour.
- **The paste-in test script shipped without the sound layer.** `pack.py` read `wuld-vfx.js` only,
  and its footer called `wzInit()` but not `wzSfxInit()` — the exact defect `inject()` had earlier
  this session, in a different file. `snipverify.py` passed throughout, because it checks stylesheet
  identity and the visual layer and has no reason to ask about a button it doesn't know exists. Worse,
  the new console notice would have told the reader "click a card to unlock audio" with no listener
  behind it — a script that lies about its own state is worse than one that is merely incomplete.
  `snipsfx.py` now asks for the mute button, pastes onto an un-integrated page, clicks a real
  `<summary>` and counts sources: **1 one-shot + 1 ambience with `/sfx/` present, 0 and 0 without**,
  and prints which of the two notices fired. Both directions, both asserted.
- **Sound layer: two defects the positive control found, and one it invented.** Worth recording as a
  set, because the failing row was right and my reading of it was wrong twice.
  1. *The first click a reader ever made was silent.* `unlock()` creates the AudioContext and
     schedules `decodeAudioData` in the same tick as the click that triggers it; `play()` then ran
     ~45ms before the buffer existed (measured: context at 2596ms, decodes done at 2665ms). The file's
     own comment claimed the opposite — "the first click is audible instead of silently arming".
     Fixed: `play()` records the name it could not sound, and the decode callback fires it once if it
     lands within 400ms and the tier still allows it.
  2. *Worse, and only visible on a slow connection: sounds that had not downloaded by the first
     gesture were **never decoded at all**.* `unlock()` iterated `Object.keys(raw)` exactly once and
     set `unlocked = true`. Arrive late, stay silent — for the rest of the session, not just that
     click. Fixed: decode is arrival-driven and idempotent; whichever of fetch/unlock happens second
     does the decoding. A/B with a 3s server-side delay: **before — silent forever; after — audible.**
  3. *The original failing row was a bad control.* It clicked (700,450) and asked for ≥2 sounds; that
     point is an `<h2>`, with no clickable ancestor, so nothing ever requested a sound. "0 sounds" was
     correct behaviour misread as a product failure. The harness now finds its target in the page and
     carries a **negative** control too (a click on prose must stay silent), so the two cases can
     never again be confused. Same shape as cccxxiv: the control was drawn from the same frame as the
     claim.
  4. *And the first attempt to test the slow case tested the fast case twice.* Playwright's sync route
     handler blocks the dispatcher, so `sleep(3)` inside it also stopped the test's own clock — the
     "gesture at 1.2s" actually happened at 21.2s, after every file had landed. Replaced with a real
     threaded fixture server that delays `/sfx/` server-side.
- **`perf.py` was measuring the sound layer switched off.** It scrolls without ever making a gesture,
  so no AudioContext is ever created. `perfsfx.py` unlocks audio, drives hover traffic through the
  scroll, and **counts the sources started** — a row with 0 sources prints as "MEASURED NOTHING"
  rather than as a fast row. Result: 16.70ms median in all three conditions, 0.0% over budget.
- **The wordmark collided with the third chin button at 320px.** Adding mute moved the row 50px
  further from the right edge and `W·U·L·D` ran 25px underneath it. `chinfit.py` had passed because it
  only ever compared the two buttons that used to be adjacent — it now walks the whole row and checks
  every neighbouring pair. Measured clash threshold 370px with three buttons; the mark and the perforations hid
  below 420px — and then a fourth button moved the threshold to 476px and nobody re-derived it (QC pass, below: hides below 500 now). The mark is `aria-hidden` decoration and the buttons are the only route to the tier,
  the magnifier and the sound, so the ornament is what yields.
- **The packer could not pack.** `packlayer.py` derived its joiners by locating each part inside the
  file it was about to overwrite — which works right up until a part changes, i.e. every time it is
  actually needed. Rewritten to generate the banners and verify three ways: every part present once
  and in order, pack-minus-banners equal to the parts concatenated, and byte-for-byte reproduction of
  the deployed JS pack. CSS rule count checked before and after every comment edit (64 → 69, and all
  five new rules named), because a malformed comment silently eating the rule after it has happened
  twice this session and `element.matches()` cannot see it.
- **The `.wz-grille` scare.** `magtest.py` prints the grille's computed opacity, which reads `1` at
  the cosmetic tier — alarming for a `position:fixed` full-viewport element at z-index 2147481250.
  It is not one: every geometry declaration lives inside the `html.wz-vfx` rule, so outside that tier
  it is an unstyled zero-area block. Verified by rendered box (1440×0) and a real hit test at the
  viewport centre, not by reading the property. Opacity cannot answer that question.

- **Scroll performance** — the warm wash cost half the frame rate; replaced with a warmed palette,
  back to the unmodified page's 16.70ms median at every tier.
- **Print** — the entire layer was printing; now suppressed, chin reserve released.
- **Power button tap target** — 13×16 → 44×44, with a visible focus ring.
- **First-visit hint** — built, once per tab session, dismissible three ways.
- **`<summary>` tap targets** — 15px → 24px+; block-level targets all clear.

- **Camera pan in LEGIBLE** — resolved: runs in every mode, gated only on `prefers-reduced-motion`.
  Josiah confirmed the behaviour is what he wanted.
- **Power ladder** — reversed to descend (`vfx → cosmetic → off`), starts at `vfx`, persists.
- **Glow gate** — now measured from background luma, not mode names. 29 rows, zero failures.
- **Warm cast** — halo tint + soft-light wash, both tunable.

## NOT OURS

- **Video seat's `page_signature` drift check** — theirs, after the ship.
- **Two pairs in the film seat's render manifest share one md5** — `libshow_proof_v15_nograin.mp4` =
  `libshow_proof_v16.mp4` (`9205aed4…`, 109,139,715 B) and `s5_grain.mp4` = `s5_nograin.mp4`
  (`407ebf9c…`, 239,202 B). Renames, a segment the grain never touched, or an A/B that compared a
  file with itself — the manifest cannot say which. Relayed as an observation. Their v4 entry is
  right: md5/bytes match the marker; `duration_s` 275.442 = 16,510 × 1001/60000; `edl_clock_s`
  275.472 beside it, which v1–v3 had recorded *as* the duration.
- **Library seat, from their K232 ratification:** dependency panel's LOAD-BEARING table sums to 222
  edges against 255 live; Convergent Architecture 13 → 17 and Benatar 33 → 36 in the same panel's
  prose; the mechanism-web panel has no explaining-is-not-refuting limit; RSI-4 optional restore.
