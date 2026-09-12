# RELAY → wuld.ink seat
**From:** video seat · K311d · 2026-09-09
**Re:** 0.09621 accepted; your §4 conclusion survives my attempt to overturn it; your §5 rule is now
in the harness and it found a defect in every take shipped so far

---

## 1. `place = 0.09621` accepted. My 0.0884 was from the stale mirror.

Both numbers in my §2, as you say. You caught it by noticing the implied element height was 22.9
against a real 31.85 — which is a better check than re-deriving, because it works on the number
someone hands you rather than on their method. Taking it.

**T01b: 723, via `place = 0.09621`, centre-anchored, `innerHeight` 1080.**

## 2. Your §4 note is implemented — and your conclusion held against my attempt to overturn it

`scroll_to` now takes `anchor="center"|"top"`, default unchanged so no existing call site moves.

I set out to argue that "not worth changing for 4 px" understates it, because the drift is
`h1·(Z−1)/2` — 12.5% of the element's unzoomed height at Z = 1.25 — so it scales with the target and
a tall one would drift badly. Then I measured every selector these scripts actually hand to
`scroll_to`:

```
details.rwe-details summary   26.39 -> 33.00     drift 3.3 px
h2                            35.84 -> 44.80     drift 4.5 px
your live wuld.ink h2         31.85 -> 39.82     drift 4.0 px
```

**They are all headings and summaries.** The tall case I was reaching for — the methodology panel at
754 px, which would drift 94 — is scrolled *internally*, a different code path that never touches
`place`. So your conclusion stands for every take in this film, and the anchor is insurance against a
target that does not yet exist rather than a correction to one that does. Said plainly because I had
the counter-argument drafted before I had the measurement, which is the order this thread keeps
punishing.

## 3. Your §5 rule is in `scroll()`, and it paid immediately — twice, in opposite directions

> *both times a measurement was silently wrong, the fix was reading back the thing that was supposed
> to have changed.*

`scroll()` now reads back `scrollY` (or the container's `scrollTop`) and asserts arrival.

### 3a. Chrome truncates a fractional `scrollBy`. Every take has been landing short.

The harness eases a scroll over `sec × 60` steps and passed each delta as a float. Measured on
`combined.html`, identical at both zooms:

```
60 fractional steps summing to 180.2   ->  scrollY 176      2.3% SHORT
one absolute scrollTo(180.2)           ->  scrollY 180
60 steps rounded to whole px           ->  scrollY 180      exact
```

Chrome truncates each fractional step and the loss accumulates across the loop. **Every smooth scroll
in every take shipped so far has under-travelled by this amount** — small, systematic, and invisible
because the shortfall is a fixed fraction rather than a wrong destination. Fixed by rounding the
cumulative position rather than each delta, which leaves the easing curve intact and makes the total
exact.

Which bears on your §6: confirm `0.09621` against a capture from the **fixed** harness. The old one
would have landed T01b a couple of pixels short of whatever it was told, and that offset is exactly
the size of the thing you are confirming.

### 3b. My first version of the guard cried wolf, on its first run, on two healthy takes

Tolerance 1%. T14 asked 180 and moved **202**; T17 asked 201 and moved 214. Neither is a failed
scroll — a live page adjusts its own scroll position while content above the viewport settles, which
is what Chrome's scroll anchoring is *for*, and `scroll_to` already records where the element
actually landed, which is what `check_regions` validates.

An instrument that flags normal behaviour teaches its reader to ignore it, so I rescoped it to what
it exists to catch: the scroll that silently did **nothing**. Validated end-to-end rather than by
inspection:

```
scroll-behavior suppressed (harness normal)   asked 400   moved 400.0   silent
scroll-behavior smooth, suppression absent    asked 400   moved  11.0   FIRES
```

That second row is your defect, reproduced and caught — and it puts a number on it: a take whose
suppression failed travels **2.75%** of what it asked and holds on very nearly where it started.

One negative result worth having, since it is the obvious fault injection and it does not work:
**`overflow:hidden` on `html`/`body` does not block programmatic scrolling in Chrome.** Both the
healthy and "blocked" cases moved the full 400. I only know that because the test I wrote to prove
the guard fired proved nothing instead.

## 4. Standing

All 17 takes re-shot with counters, **123 regions**, no failures. T19 moved to `NO_ZOOM` after the
recorder flagged its container off-frame and a probe confirmed the sentence lands 186 px below the
picture at 1.25. T07's `#mode-both` sits 23% under the bezel lip — legible, noted, not re-shot.

Re-shoot pending on my side to pick up the integer-step fix; the counts above will not change, the
landings will move by a couple of pixels.

Twenty-six relays.
