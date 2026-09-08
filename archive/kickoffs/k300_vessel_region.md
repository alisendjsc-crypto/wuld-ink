# K300 — the help vessel: two-face region measurement

**Part 2 of the K300 brief.** The vessel adds nodes, so the strict zero-delta fingerprint does not
apply; this is the **K297 region form** — the unmoved nodes identical in geometry *and* styles, the
added region excluded and described.

## Method

Both faces of `successor-stage.{js,css}` — base = `git show HEAD:` (K299, `c04b7838` / `23248b47`),
new = the working tree (`32b160cb` / `bdc756e4`) — were mounted in a real Chromium against the REAL
`yurei-oracle.js` and the REAL `omega-corpus-mrgrey.json`, served locally, and crawled at seven
viewports. The `/successor/` page chrome is not in the harness because it cannot be: the stage is a
`position: fixed; inset: 0` overlay appended to `document.body`, so the page beneath it is out of
the vessel's reach by construction — and `src/successor/index.html` changed by exactly two `?v`
query strings and nothing else.

- `serviceWorkers: 'block'` on every context (cclxxi), and each measured document's
  `location.pathname` asserted against the route requested.
- `reducedMotion: 'reduce'`, which also disables the idle-peek — so no measurement lands mid-transition.
- Every node under `.sstage-overlay` snapshotted: bounding rect + 47 computed style properties,
  keyed by tag + class + text-prefix (not by DOM index, which the insertion necessarily shifts).
- The persona seats are stubbed to their PUBLIC api (`close`/`state`) only — the stage touches
  nothing else on them — identically on both faces.

## The declared added region

`.sstage-hints` · four `.sstage-hint` chips · `.sstage-help-btn` · and `.sstage-foot` itself, whose
*key* changed only because its text now contains `[ ? ]` (the element's own box is unchanged).

Its two row-mates, `[ download ]` and `[ clear ]`, are displaced **within that row** by the new
control. That is a real, desktop-visible change and it is named here rather than excluded.

## Result

```
 1280  | outside-region drift: geo=0 style=0 only-base=0 only-new=0 | row-mates shifted +69.6px on X ONLY (y/w/h identical: true) | PASS
 1440  | outside-region drift: geo=0 style=0 only-base=0 only-new=0 | row-mates shifted +69.6px on X ONLY (y/w/h identical: true) | PASS
 1024  | outside-region drift: geo=0 style=0 only-base=0 only-new=0 | row-mates shifted +69.6px on X ONLY (y/w/h identical: true) | PASS
  900  | outside-region drift: geo=0 style=0 only-base=0 only-new=0 | row-mates shifted +69.6px on X ONLY (y/w/h identical: true) | PASS
  768  | outside-region drift: geo=0 style=0 only-base=0 only-new=0 | row-mates shifted +69.6px on X ONLY (y/w/h identical: true) | PASS
  641  | outside-region drift: geo=0 style=0 only-base=0 only-new=0 | row-mates shifted +69.6px on X ONLY (y/w/h identical: true) | PASS
  390p | outside-region drift: geo=0 style=0 only-base=0 only-new=0 | row-mates shifted +69.59px on X ONLY (y/w/h identical: true) | PASS

REGION GATE: GREEN — outside the declared region, every node identical in geometry and styles at all 7 widths

On REVEAL (1280, chips shown) the following move — the disclosure opening, by design:
   div|sstage-transcript|SystemThe stage is set. You’re speak y 709.56 -> 667.64  (dy -41.92)
   div|sstage-line sstage-sys|SystemThe stage is set. You’re  y 723.56 -> 681.64  (dy -41.92)
   div|sstage-bubble|The stage is set. You’re speaking with M y 723.56 -> 681.64  (dy -41.92)
   div|sstage-hints|What are you?Where do I start?Your view i y 0 -> 720.52  (dy 720.52)
   button|sstage-hint|What are you?                           y 0 -> 720.52  (dy 720.52)
   button|sstage-hint|Where do I start?                       y 0 -> 720.52  (dy 720.52)
   button|sstage-hint|Your view is ableist.                   y 0 -> 720.52  (dy 720.52)
   button|sstage-hint|Salve                                   y 0 -> 720.52  (dy 720.52)
```

## Reading

- **Outside the declared region: zero drift of any kind, at all seven widths.** Not one shared node
  differs in geometry, and not one differs in any of the 47 computed style properties.
- **Inside it: `[ download ]` and `[ clear ]` move `+69.60 px` on X and nothing else** — identical
  `y`, `width` and `height` at every viewport. That is the `[ ? ]` button's width plus the foot's
  own `10px` gap. `.sstage-note` keeps its box exactly; only its *resolved* `margin-left: auto`
  changes (263.72px → 194.13px), which is the same 69.6px arriving from the other side of the row.
- **Collapsed, the vessel costs nothing.** `.sstage-hints` is `display: none` while hidden, and
  `.sstage-fg` is a `column` flex container with **no `gap`**, so a hidden child is not a flex item
  and adds no space. The `[hidden]` state is display-gated explicitly on both new nodes — a flex
  container would otherwise out-rank the UA default and the collapsed state would fail *silent*
  (K291: ship the verbose failure). The e2e gate asserts both rules by regex.
- **Revealed, the input does not move.** At 1280 and at 390 alike, opening the chips moves
  **zero** of `.sstage-form`, `.sstage-input`, `.sstage-send`, `.sstage-foot`. The chip block takes
  its space from above: the transcript's top edge rises 41.92px on desktop and 102.00px on phone
  (the chips wrap to two rows there), and the transcript's own height is unchanged. The thumb target
  stays exactly where it was — which is the property that matters on a phone.

## Scope note

This harness is **not** committed. It needs a synthetic page and persona stubs, and it measures a
one-off insertion; committing it would buy a maintenance burden for a comparison that will not
recur. The durable proofs went into `tools/omega/successor-stage-e2e.cjs` instead, which now carries
the functional invariants *and* the two CSS `[hidden]` rules. The harness and this report are
evidence, filed here.
