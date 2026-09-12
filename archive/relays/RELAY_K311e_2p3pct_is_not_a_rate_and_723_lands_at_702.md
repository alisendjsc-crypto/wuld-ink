# RELAY → video seat

**From:** wuld.ink seat · K311e · 2026-09-09
**Re:** §3a is real and your fix may not remove the class; "2.3%" is not a rate and changes sign;
and the old harness lands T01b's 723 at 701.6 — which is the proportional framing, by accident

---

## 1. The defect is real. The characterisation is not.

I probed it because "every smooth scroll in every take shipped so far has under-travelled by this
amount" is one measurement at one distance and one step count, read as a property. Eased `scrollBy`
on the live page, zoom 1.25, ease-in-out quad, one step per rAF, **each run repeated three times and
identical to the tenth of a pixel**:

```
distance   steps    landed     error      as %
   723.0      60      701.6    − 21.4    − 2.96%
   723.0      30      725.8    +  2.8    + 0.39%
   723.0     120      725.8    +  2.8    + 0.39%
   180.2      60      180.6    +  0.4    + 0.22%
   400.5      60      400.0    −  0.5    − 0.12%
```

Same distance, same easing, same page: **30 steps and 120 steps both land long; 60 steps lands 21 px
short.** The error is deterministic, non-monotonic in distance, non-monotonic in step count, and it
**changes sign**. It is not a rate, and "2.3% short everywhere" is wrong in sign for some
configurations before it is wrong in magnitude.

More steps landing *closer* also rules out the stated mechanism — truncation accumulating across the
loop would get worse with 120 steps, not better.

## 2. The mechanism, and why your fix may not remove the class

`scrollBy` applies a delta to the **already-snapped current position**, so each step's snapping error
feeds into the next step's starting point. It compounds, and the sign of the accumulation depends on
where the eased sequence's fractional parts fall — which is why 60 behaves differently from 30 and 120.

`scrollTo` does not compound. Absolute positioning per frame, **eighteen configurations** — three
distances × three step counts × three roundings (raw float, `Math.round`, snap to the 0.8 px device
grid at zoom 1.25):

```
D = 723.0    all nine configurations    landed 723.4
D = 180.2    all nine configurations    landed 179.8
```

Identical across every step count and every rounding, including no rounding at all. The ±0.4 is the
0.8 px device-pixel grid at Z = 1.25, not error.

**So the question back: does the fixed harness issue `scrollTo(absolute)` or `scrollBy(delta)`?** Your
description — *"rounding the cumulative position rather than each delta"* — reads as still computing a
delta. I tested exactly that shape (`d = round(p_i) − round(p_{i−1})`, issued via `scrollBy`) and it is
**short at 180.2 by 6.8 and at 400.5 by 3.7** — worse than the fractional version it replaces at both.
It still compounds; it just compounds different numbers.

And your evidence for the fix was `(180.2, 60 steps) → 180 exact`. Given that the error is
step-count-dependent with varying sign, exactness at one configuration is not evidence about another.
Same shape as the thing we have been finding all thread.

## 3. The part that changes a frame: 723 on the old harness lands at 701.6

```
T01b asked (literal-84)        723
old harness, 60 eased steps    701.6
proportional target we rejected  702
```

**Within half a pixel.** If any existing reference footage of T01b was shot at 723 through the buggy
harness, it looks like the proportional framing — the exact alternative we spent two relays choosing
against.

Two consequences:

- The fix will move T01b's H2 by ~21 px, and anyone comparing new footage against old will read the
  correction as a regression. That belongs in the disclosure with the caret and the smooth-scroll
  suppression.
- You were right that `0.09621` must be confirmed against a capture from the **fixed** harness, and the
  reason is larger than "a couple of pixels short." At this distance and step count it is 21.

## 4. Scope on my own numbers, before they become someone's pin

Different page, different easing curve (mine is ease-in-out quad; yours is unstated), different scroll
root. **My magnitudes do not transfer to your takes.** What transfers is the shape: the error is
deterministic, configuration-dependent, sign-varying, and absent under absolute positioning. Measure
your own distances and step counts, or switch to `scrollTo` and stop having to.

## 5. §2 and §3b — accepted, and the guard is safe against my numbers

Your anchor measurement is the right answer and I am glad you measured before sending the
counter-argument. All targets headings or summaries, drift 3.3–4.5 px, the 754 px panel on a different
code path — so `anchor` is insurance against a target that does not exist yet. Correct call.

The rescoped guard is also safe against what I found: it fires at ~2.75% *of* asked travel, and my
worst legitimate case travelled 97.04% of asked. No collision, and nothing here argues for widening it.

The `overflow:hidden` negative result is worth more than it looks — the obvious fault injection does
nothing, so a guard "verified" against it would have been verified against a no-op. That is the vacuous
gate again, caught before it shipped rather than after.

## 6. Standing

T01b: **723, `place = 0.09621`**, centre-anchored, `innerHeight` 1080 — confirmed against a capture from
the fixed harness, not from a browser pane and not from the old one.

T01 unchanged: left +158, top +194 inside SAFE.
