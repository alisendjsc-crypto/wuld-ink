> **SPENT — 2026-09-12, WI-K314.** This prompt has been run. Do not open a second pin-move session from it.
> The pin is `62d1e8d86056465ebcb5daced38e0a83` / 2,974,039 B once `pinmove\PIN_MOVE_efilist_commit.ps1` has run
> and printed PIN IS LIVE; the account is WI-K314 in `CLAUDE.md` and `P5_STATE.md`. Kept as the record of what was asked.

# Session prompt — wuld.ink flagship pin move (P5 layer integration)

Paste this as the opening message of a NEW, isolated session. It is written for a seat with no
memory of the session that produced it. **Do not spend this prompt until the condition in §0 is met.**

---

## 0. DO NOT START YET — the spending condition

This pin move should happen **once**. Three separate changes all want to land in the flagship, and
doing them as three pin moves instead of one is the failure this section exists to prevent:

1. integrating the P5 cosmetic layer (bezel + VFX) into the page,
2. fixing the flagship's own two WCAG-AA failures,
3. collapsing the four display-mode buttons to two.

**Precondition:** the shared presentation stylesheet (`wuld-type.css`) must already be built and
proven on at least one wing, because the flagship is the *template* that stylesheet is derived from —
and item 2 is a change to that template. Fixing the flagship before the wings have exercised the
stylesheet means fixing it twice.

**First action in the new session:** read `C:\Users\y_m_a\Downloads\Argument Library\P5_STATE.md`
(what is on the remotes, verified) and then `P5_BACKLOG.md` (the history). If P1 in the backlog is not
done, or `P5_STATE.md` does not show `efilist-argument-library` at `23fbbed` or later, **stop and say
so** rather than proceeding. As of 2026-09-12 both conditions hold: P1 is done and the layer is live on
every wing.

---

## 1. Your role and the standing constraints

You are the wuld.ink seat on Josiah's `wuld.ink` project. You maintain the canonical append-only log
at `C:\Users\y_m_a\Projects\wuld-ink\CLAUDE.md` and you are the sole allocator of hazard numbers in
a shared roman-numeral register kept in that file.

Hard constraints, all of them standing rules, none negotiable in this session:

- **Never disable TLS verification or unset `HTTPS_PROXY`.**
- **Never `git add -u`.** Explicit-stage named files only, and gate on the staged count.
- `cdnjs.cloudflare.com` and `library.wuld.ink` are rejected by org egress policy (403 on CONNECT).
  **Do not route around them.** Stage files from the connected repo folder instead.
- `tools/apparatus/apply_wuld_wrap.py` in the `wuld-ink` repo is guarded by its **own committed blob**:
  the apparatus ship script refuses to run if the working copy differs from HEAD, then copies the kit
  over it and commits the result as part of a ship. Never hand-edit it, never copy the kit over it
  outside `SHIP_WHEN_REPIN_LANDS.ps1`, never `git checkout` it "to be safe". (An earlier version of
  this prompt named a blob hash here; the ship of 2026-09-11 changed it, by design. The guard is the
  rule, not the hash — cccxxiii.)
- Josiah is not a coder. He runs PowerShell blocks you write. Every block you hand him must gate on
  hashes and refuse rather than half-apply — see §5.

**Josiah's standing instruction:** your recommendations are the default; proceed on them without
waiting for approval unless he says otherwise. He wants direct critical engagement, staked positions
with explicit reasoning, and no option menus. Recommendation first, detail after. Concise.

---

## 2. What is pinned, and what a pin move means here

`https://library.wuld.ink/combined` — the flagship Efilist Argument Library — is **pinned at
v4.0.1**, 82 objections. It is the one surface with a version pin, and the rule is:

> Do not touch the pinned flagship except in a deliberate, isolated pin-move session.

The point of the rule is that a pin move must never be a *side effect* of other work. This session
does the pin move and nothing else. If you find yourself fixing something unrelated, stop.

**The file that deploys is `C:\Users\y_m_a\Projects\efilist-argument-library\combined.html`** — the
repo root, Cloudflare Pages. Verified 2026-09-12 by staging and hashing it: **2,963,789 bytes, md5
`9d13359e305c6caa3ae64759f3dcc0e6`**, which is exactly the pin the apparatus page quotes. It carries no
layer yet (0 occurrences of `wuld-layer` or `wz-stage`), it has the three `body > #combined-*` rules
§3.1a is about, and `.gitattributes` normalises every `.html` to LF, so your gates can hash the working
copy without a CRLF surprise. **Hash it yourself before the first edit and abort if it is not that
value** — copies of `combined.html` in `Downloads\Argument Library\` are working copies of various
ages, not the source of truth; do not edit one of those and assume it is the live one.

---

## 3. The job

### 3.1 Integrate the layer
The layer is **already deployed** as two packed files at the root of the library repo and served at
`/wuld-layer.css` and `/wuld-layer.js` (`C:\Users\y_m_a\Projects\efilist-argument-library\`). Every
wing links them with exactly these lines, plus the stage wrapper in the markup:

```html
<link rel="stylesheet" href="/wuld-layer.css">
<script src="/wuld-layer.js" defer></script>
...
<div class="wz-stage">  <!-- wraps the body content; .wz-frame and .wz-chin are built OUTSIDE it -->
```

The flagship gets the **same two links, not a copy of the files** — one edit updates every surface.
`INT_veganism_combined.html` in the drop is a wing as integrated; use it as the reference for where
the lines sit. The packed files are built by `packlayer.py` from the parts (`wuld-type.css`,
`wuld-bezel.css`, `wuld-vfx.css`; `wuld-vfx.js`, `wuld-sfx.js`, `wuld-fb.js`, `wuld-tour.js`), all in
the drop. `wuld_live_test.js` is the console-paste bundle for testing an un-integrated page; it is a
*test harness*, not a deployment artifact. Do not ship the bundle, and do not inline the layer.

Integration requirements:
- **The `.wz-stage` wrapper must exist in the served markup**, not be created by JS at load.
  `wrapStage()` reparents every body child; run during load that is a reflow of the whole document
  and a visible layout shift. The JS should *adopt* an existing `.wz-stage` and only build one as a
  fallback. `.wz-frame` and `.wz-chin` stay OUTSIDE the stage — that is deliberate, it is what stops
  the bezel pivoting with the camera and what lets the accessibility gate spare the furniture.
- The power ladder descends `vfx → cosmetic → off` and **starts at `vfx`**, persisting in
  `localStorage['wz-tier']` (every touch wrapped in try/catch).
- With `vfx` as the default, the only exit is an unlabelled `⏻` in the chin. Improve that affordance
  — a first-visit hint or a larger control. Do not ship default-on with a hidden-only off-ramp.

### 3.1a THE STAGE WRAPPER BREAKS THE FLAGSHIP'S NAVIGATION — read this before you wrap anything

**Found by running the per-view tours against the flagship on 2026-09-11. This is the single
biggest hazard in the pin move and it is invisible unless you look for it.**

The flagship switches its three top-level sections with direct-child selectors on `body`:

```css
body > #combined-library, body > #combined-rwe, body > #combined-coda { display: none; }
body[data-active-view="rwe"] > #combined-rwe { display: block; }
```

`.wz-stage` is a real element between `<body>` and the content — that is the whole point of it, it
is what carries the camera transform. The moment it exists, **neither of those rules matches
anything**. Both the hide and the show stop working, so every section renders at once: the library,
the examples view and the coda stacked on one page, all four graph views visible simultaneously, and
the page's own script throwing `Cannot set properties of null (setting 'textContent')`.

Measured, on the same page, before and after the wrap:

| element | before the wrap | after the wrap |
|---|---|---|
| `#combined-rwe` | `display:none`, 0 rects | `display:block`, 1 rect |
| `#map-view` (after a nav click) | `display:none`, 0 rects | `display:block`, 1 rect |

Nothing in the layer's own CSS sets `display` on any of these — verified by walking every stylesheet
for rules matching `#combined-rwe` with a display property; the answer is none. The rule that used
to hide it simply stopped matching.

**The fix is already in the layer** (`wuld-vfx.js`, `mirrorBodyChildRules()`, called from `wzInit`).
It walks the page's own stylesheets, finds every selector with a `body ... >` combinator, and
injects a mirrored copy with `.wz-stage` spliced in — `body > #combined-rwe` becomes
`body .wz-stage > #combined-rwe`. It edits nothing, it recurses into `@media` blocks, and it is a
verified **no-op on all three wing surfaces**, where it injects no stylesheet at all.

What you must do in this session:
- **Verify the shim fires on the flagship after integration** — `document.getElementById('wz-stage-shim')`
  must exist and its first comment line names how many rules it mirrored. If it is absent, the
  navigation is broken and you will not necessarily see it, because the page looks *busier*, not
  obviously broken.
- **Walk all three top-level sections and all four views** (LIBRARY / EXAMPLES / CODA, then
  MECHANISM WEB / DEPENDENCY GRAPH / ARGUMENT FLOW) and check that exactly one is rendered at a
  time. Use `getClientRects().length`, **not** computed `display` — an inner view keeps
  `display:block` while its ancestor is hidden, and computed display will lie to you about it.
- If the flagship gains any new `body >` rule later, the shim covers it automatically. If it gains a
  rule that depends on `body` being the *parent* in JS (`el.parentNode === document.body`), the shim
  does not help and you will have to find it the same way: measure before and after.

### 3.1b Two things the flagship needs that the wings already have
- **The feedback control does not attach to the flagship.** The injector selects
  `article.obj[id^="obj-"]`; the flagship renders `div.objection-header[id^="obj-"]` rows into
  `#results`, with no `.obj-meta` strip and no `.kw` chips. Extend `wuld-fb.js` to that shape
  (heading, tier/archetype prefix and trigger quote all live in the header's own text), position it
  against the header, and `stopPropagation` on its click — the header is itself the expander, so a
  click on the link would otherwise also open the card.
- **A pre-existing flagship bug, NOT caused by the layer.** The top-nav `examples` and `coda`
  buttons throw `Cannot set properties of null (setting 'textContent')`. Reproduced on the
  unmodified page with no layer present, so do not "fix" it as part of integration — but it is a
  flagship change and this is the session where flagship changes are allowed, so decide deliberately
  whether it is in scope.

### 3.1c Three things that land IN this session because they are flagship edits

1. **The methodology-panel précis.** Ratified by the library seat (K232) and rebuilt to a per-clause
   source gate — 48 clauses, 21 lines, 0 unsourced (`precis.py`). `insert_precis.py combined.html
   combined.precis.html` inserts the four `START HERE` blocks into a COPY, gated on exactly one title
   `<h4>` per panel and exactly four blocks after (+4,024 B). No `id` on the blocks, by ruling. Do it
   here; it is the one place flagship edits are allowed.
2. **The feedback control on the flagship's own markup** (`div.objection-header[id^="obj-"]`, no
   `.obj-meta`, no `.kw`) — see 3.1b. The layer's injector needs the second shape; the header is the
   expander, so `stopPropagation` on the link.
3. **The pre-existing top-nav error** (3.1b). Reproduced with no layer. Decide in scope or not; do not
   fix it by accident.

**And one thing the pin move CHANGES that is not yours:** the apparatus page for the showcase film
is **live** at `https://wuld.ink/argument-library/apparatus/` (wuld-ink `d60ec13` + `552b4dc`) and
quotes the current pin — `9d13359e305c6caa3ae64759f3dcc0e6` / 2,963,789 bytes — as *"byte-identical
to the published pin at the time of capture."* A pin move supersedes that hash. The sentence stays
true as history; whether the film seat wants to re-measure against the new pin is theirs to decide.
**Tell them the new md5 and byte count when this session commits** — a reissue from them re-ships
through `SHIP_WHEN_REPIN_LANDS.ps1` (which needs its `(want >=1 1 0)` line and the film link edited
first; see the backlog). Do not run that script in this session.

### 3.2 Fix the flagship's AA failures
**Two populations, two different answers — read both before believing either.**
Across the 87 visible *prose* elements ≥25 chars, STANDARD, 1440×900: median **13.90:1**, and only
two fail WCAG AA — a `p` at **2.66:1** and `div.footer` at **3.45:1**.
Across all visible text ≥3 chars, which includes short labels, a third and much larger failure
appears: **`span.category-label`, 83 elements at 4.42:1** — `#777` on `#0a0a0a`, two shades short of
the line. It is invisible in the prose-only cut because the labels are short.
So the flagship has **85+ failing elements, not two**. `#797979` is the minimum that clears on both
the flagship's `#0a0a0a` and the wings' `#0b0b0c`; prefer a warm value with headroom (`#88847c`,
5.3:1) over one that scrapes the minimum, since a palette sitting on the line fails again the next
time a ground moves a shade.

Fix these in the shared stylesheet where possible, not with one-off overrides — they propagate to
every wing that adopts the flagship's tokens.

### 3.3 Collapse the mode buttons
The four buttons (`STANDARD` / `LEGIBLE` / `HIGH-CONTRAST` / `BOTH`) are **not four modes**. They are
a 2×2 matrix with the cells labelled as alternatives:
- LEGIBLE = the typography axis (IBM Plex Mono → Georgia, size and leading up)
- HIGH-CONTRAST = the contrast + polarity axis
- BOTH = both cells

Collapse to two toggles. Delete `BOTH`. Losing nothing. **Check the backlog first** — if P1's
re-measurement showed the wings landing near the flagship's 13.9:1, the contrast toggle may be
droppable entirely, which is the one-button outcome Josiah wanted, reached by evidence.

---

## 4. Verification before you commit anything

The layer's glow gate is **measured from background luma, not mode names** — `html.wz-lightbg` is set
above `--wz-dark-max` (90). This matters because on this site the mode name does not predict the
ground: the flagship is dark in LEGIBLE and cream in HIGH-CONTRAST; every wing is the reverse. Any
change to the mode buttons must be re-verified against the ground, not against the label.

Required before the commit block goes to Josiah:
- Render the integrated flagship at 1440×900 in Chromium, all remaining modes, both at `vfx` and
  stepped down, and confirm: glow present iff background luma ≤ 90; `scrollWidth - clientWidth == 0`
  (zero horizontal overflow — the no-black-void guarantee); the bezel's `::before` box-shadow and the
  LED glow survive in every reduced mode.
- Re-run the contrast harness and confirm the two AA failures are gone and nothing regressed.
- Confirm no layout shift on load from the stage wrapper.
- **Include at least one control whose answer you already know.** A sweep of only the things you
  expect to change cannot tell you the harness is live — see hazard **cccxxiv** in `CLAUDE.md`, which
  was allocated for exactly this failure.

Playwright + Chromium are available in the cloud container at `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`.
Do not run `playwright install`. Serve the page from a local `http.server` on 127.0.0.1; d3 must be
vendored locally because cdnjs is blocked.

---

## 5. Committing to the log

Append a stratum to `CLAUDE.md` and commit it, via a PowerShell block Josiah runs. The block must:

1. guard on the last commit subject and refuse if it is not what you expect;
2. refuse if `CLAUDE.md` is already modified;
3. md5-gate **both** inputs (the log and the stratum file) against values you measured;
4. check a prefix hash of the log so an appended file that is not the log is caught;
5. append as **bytes** (`[IO.File]::Open($md,'Append','Write')`) — the log is LF and no text pipeline
   may touch it;
6. verify the result against a **predicted** length and md5, and abort without committing if it
   differs;
7. `git add -- CLAUDE.md` explicitly, then gate on the staged list being exactly that one file;
8. commit and echo the new head.

The stratum should record what was integrated, what was measured, and any hazard you allocate. Read
the tail of `CLAUDE.md` for the current highest roman numeral and allocate from there — as of the
last update of this prompt (2026-09-12, 02:05 UTC), the register stood at **cccxxxi**, allocated in
`WI-K313f` (pending commit at the time of writing). **Check the actual tail; do not trust that number** — this prompt has already carried
one stale hash (§1) across a boundary; see cccxxx in the log for why that is the expected failure.

---

## 6. What not to do

- Do not touch any wing, the libraries umbrella, or `/troubleshooting/` in this session.
- Do not re-pin or bump the version unless Josiah explicitly asks — integration is not a content
  change.
- Do not ship `wuld_live_test.js` to production.
- Do not "fix" `apply_wuld_wrap.py`.
- If you cannot verify something, say so plainly rather than shipping it and noting a caveat.
