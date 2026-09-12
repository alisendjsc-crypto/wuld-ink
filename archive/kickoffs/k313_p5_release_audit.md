# P5 — release audit

Everything below is measured on the integrated files against a local fixture of the real pages
(byte-identical to the deploy repo, verified by md5), Chromium, sRGB forced, unless a row says
otherwise. Nothing here is an estimate.

---

## What the audit found, in order of severity

### 1. The default tier halved the frame rate — **fixed**
Scripted full-document scroll, 1440×900, frame intervals in ms:

| | median | p95 | worst | frames over 32ms |
|---|---|---|---|---|
| original page, no layer | 16.70 | 16.70 | 16.80 | 0.0% |
| **vfx, as first built** | **33.30** | **50.00** | 66.70 | **85.4%** |
| vfx, as shipped now | 16.70 | 16.80 | 49.90 | 1.1% |

Isolated one mechanism at a time. Killing the vignette, the peripheral blur, the text glow, the
stage transform, the SVG drop-shadow or the badge shadows changed **nothing**. Only the warm wash
did — a fixed full-viewport `mix-blend-mode: soft-light` overlay, which forces the browser to
re-composite its entire backdrop every frame, and on an 8,400px document that backdrop is the
document. With the tier defaulting to vfx, **every visitor would have got a 30fps scroll**.

The look did not go with it. The warmth is now baked into the palette — the same nine variables,
pre-mixed 16% toward `--wz-tint` and written as literals. Same picture, zero compositing, and
closer to the brief: the ask was to tint the *text*, and the wash was tinting panels and grounds
too. Every warmed value re-checked against its own ground; worst is `--faint` at 5.58:1.

### 2. The whole layer printed — **fixed**
Measured under `emulate_media('print')`: frame, chin, vignette, wash, peripheral blur and the power
button all still painted, body kept its 42px chin reserve, and the text kept its halo. Printing an
argument page produced a black monitor frame around haloed type. These are reference documents
people print to argue from. `@media print` now strips the layer entirely and returns the reserve.

### 3. The power button was 13×16px — **fixed**
12×15 on a 390px phone. Under the WCAG 2.5.8 floor of 24×24 and far under the 44×44 a thumb needs —
and with the tier defaulting to vfx it is the *only* way out of the effect. Now a 44×44 target
wearing the same small glyph, with a `:focus-visible` ring that is actually visible on a near-black
chin.

### 4. Block-level tap targets — **improved, 91 → 34**
`<summary>` measured 870×15, ×22 per page: a disclosure control 9px short of usable. A bare
`summary` rule reached only half of them — `.resp-d>summary` carries its own padding at higher
specificity. Named explicitly, from the stylesheet. **All 34 remaining are inline prose links,
which WCAG 2.5.8 explicitly exempts** (targets constrained by the line-height of surrounding text).

### 5. Focus indicators — **checked, not broken**
The gate strips `box-shadow` inside `.wz-stage`, which would have killed a shadow-based focus ring
on every control in the page. The pages use `outline`, which the gate does not touch: verified
present in all four modes. The hazard did not fire. Our own controls now carry explicit
`:focus-visible` rings.

### 6. First-visit hint — **built**
The default-on tier means nobody opted in, so they get told once where the exit is. Shown once per
browser-tab session (`sessionStorage`, every touch wrapped), above the chin beside the button it
names, `role="status"` + `aria-live="polite"`, appended last so it is not the first thing a screen
reader meets. Dismissible by a 24×24 button, by using the power button, or by 9 seconds passing.
Not shown to a reader already stepped down. Lives outside `.wz-stage`, so it neither glows nor pans
— a hint that is hard to read because it is participating in the effect it offers to turn off would
be a joke at the reader's expense.

---

## Full result matrix

| check | result |
|---|---|
| Contrast, 25 surface-mode cells | **0 elements below WCAG AA** in every cell |
| Text under 10px | 71.4% → **2.8%** (largest wing); 0.0% on the umbrella |
| Cumulative Layout Shift | **0.000** on all 7 pages, identical to the originals |
| Horizontal overflow | **0px** at 1440 / 1024 / 768 / 420 |
| Scroll, all three tiers | **16.70ms median** — the unmodified page's number |
| Print | layer fully suppressed, chin reserve released, halo off |
| `prefers-reduced-motion: reduce` | pan dead, stage `transform: none` |
| `forced-colors: active` | glow off, vignette hidden |
| `prefers-contrast: more` | glow off, vignette hidden |
| Phone 390×844, touch, no hover | no overflow, 40px chin, 44×44 power target, pan correctly inert |
| JavaScript disabled | palette and type scale **still apply**; furniture and glow absent; nothing breaks |
| Console / network errors | none on any page |
| Pinned flagship | untouched, and the deploy block aborts if it is ever staged |

The JS-disabled row is the split worth noting: **the readability work needs no JavaScript**, because
it is CSS on variables the page already declares. Only the cosmetics need the script. A reader with
JS off gets the accessible palette and the fixed type scale and simply never sees a monitor.

---

## The magnifier (added after the audit)

**Shift + wheel**, or the magnifier button in the chin. Not Ctrl+wheel: that is the browser's own
zoom, and trackpad pinch arrives as ctrl+wheel too, so binding it would trade real accessible zoom
*and* pinch for an aesthetic one. Shift+wheel is free — measured, it fires a cancelable event and
its native job (horizontal scroll) is a no-op on a page with no horizontal overflow.

The spike that had to pass first, and what it found:

- **`transform-origin` was the whole risk, and not in the way expected.** With the origin at 50%,
  zoom 2 grows the stage 720px past each side of the viewport and only the right 714px is reachable
  — there is no negative scroll, so **the left 726px of every line would be permanently
  unreachable**. With origin `0 0` the growth is right-and-down only and `maxScrollX` matches the
  growth exactly at every zoom.
- **The pan does not scale with the zoom.** The translate stays outside the scale in the composed
  matrix: `scale(3)` with `--wz-px:-10px` gives `matrix(3,0,0,3,-10,0)`. Verified on the computed
  style rather than inferred from the spec.
- **The void risk inverts.** Above 1× the content always overflows, so the camera pan can never
  expose an edge — the guarantee gets *stronger* as you zoom. The clamp that matters is the one at
  the bottom: below 1× the stage shrinks away from the frame and the bezel stops framing anything.
- **Anchoring: 0px drift.** Zoom is anchored to the pointer — the document point under the cursor
  stays under the cursor — by compensating both scroll axes.
- **Cost: none.** 16.70ms median at 1×, 2.2× and 3.9×, ≤1.7% of frames over budget. The phosphor is
  a *fixed* overlay with no blend mode, so it is one viewport-sized compositor layer however far in
  you go — the warm wash's lesson paid forward rather than relearned.

Two things caught in review rather than by a harness: the grille's first opacity ramp hit full by
2.6× and buried the type under RGB stripes, and the two chin buttons were offset by 42px while being
44px wide — a 2px overlap at every width, which means the thumb lands on whichever the stacking
order favours rather than the one it aimed at.

---

## What is deliberately not done

- **The wings' own inline prose links** stay under 24px. Exempt, and padding them would make hit
  boxes on adjacent lines overlap — a regression dressed as a fix.
- **`--fg` and friends are not warmed in high-contrast mode.** That mode exists to maximise
  separation; a tint spends a little of it for a look. The warm palette applies only where the glow
  already does.
- **`resolve()` — the mode bootstrap — is untouched.** The wings follow the reader's
  `prefers-color-scheme`. Overriding an OS signal to impose an aesthetic would be the same error as
  the one the glow gate was just fixed for, pointing the other way.
- **The pinned flagship.** Its own contrast failures (85+ elements, see the backlog) and the layer
  integration both belong to one isolated pin-move session, with a prompt already written.
