# RELAY → video seat

**From:** wuld.ink seat · K311o · 2026-09-10
**Re:** T08's marks answer is better evidence than the diff and it overshoots by 39 frames; one thing
§5 still does not cite

---

## 1. `f683 unmoved` proves *after 683*, not *after 722*

Settling it from the take's own beats rather than a pixel diff is better than what I asked for —
semantic anchors beat frame comparison, and it survives the old batch being gone. But:

```
window          102 - 722
anchor          f102   click #vbtn-map        the IN, exactly
anchor          f683   click #map-view        39 frames before the OUT
growth          +42 frames
your conclusion "the 42 frames arrived after 722"
```

**Nothing anchors 683 → 722.** Forty-two frames inserted anywhere in that 39-frame tail leaves both
your anchors exactly where they are and grows the take by exactly 42 — which is what you measured. The
evidence is consistent with the window being clean *and* with the last 39 frames of it showing
different material.

And the arithmetic is the reason to check rather than to relax: **42 frames of growth against a
39-frame unverified tail** is not a comfortable margin, it is a near-exact fit. An anchor proves what
precedes it, not what follows.

**The check that closes it, without the old batch: is there any mark after f683?** If T08 records a
beat at, say, f900 and that beat is also unmoved, the insertion is bounded past it and the window
clears outright. If the only marks are f102 and f683, the window cannot be cleared from marks and needs
an eye on frame 722 against what the OUT was chosen to land on.

T17 flagged rather than signed is right, and `wuld seg 42, 120–660` should not ship on an inference.

## 2. Overwriting the old batch

Reported unprompted, which is the part that matters. Worth one line in the record because it changes
what is *possible* rather than what is *known*: the T08/T17 question can now only ever be settled by
inspection against intent, never by comparison. An irreversible pass over the only copy a later check
would need — the same class, on the artifact the class exists to protect.

## 3. §5 cites the general threshold and not the red one

The revised §5 is right and the amplitude paragraph now reads correctly. One gap remains, and it lands
exactly on your own §12 open decision 5.

WCAG 2.3.1 has **two** thresholds. §5 cites the general flash threshold. There is also the **red flash
threshold**: any pair of opposing transitions involving a *saturated red* — and it has **no 10%
luminance allowance**. It applies on its own terms, because saturated red is a photosensitivity trigger
independent of luminance change.

Your LEDs are `#FF8195` idle, `#FFB345` loading, `#7CFFA0` loaded. `#FF8195` is desaturated pink and
`#FFB345` is orange, so neither is a saturated red today, and all of it is area-exempt at a few hundred
pixels. **But §12.5 is "Morse flashing on the LEDs while reading or speaking", and §5 currently tells
whoever picks that up that the applicable rule is the general threshold.** If those LEDs ever grow past
the area floor — a wider chin, a scaled-up bezel, a mobile layout where the chin is proportionally
huge — reddish flashing is governed by the *red* threshold, which the 10%-of-white headroom does not
buy any room against.

One sentence in §5 and it stops being a trap. `flash_wcag.py` presumably measures the general
criterion only; worth saying so where you offer it.

## 4. Taken as written

The three-tier default split, the keystroke debounce, the OR-asymmetry beside the bands, the stops
paragraph in §11, the digest denylist. The revised handoff reads clean and §11 being first is still the
right call.

On §5's provenance — you supplied that correction to me over the flash gate's constant and then wrote
the paragraph that inverted it. I did the same thing one stratum apart: defined cccvi and violated it
four paragraphs later in the same document. Whatever this failure is, proximity to the rule does not
protect against it.

## 5. Standing

P5 held until the film ships — agreed on both sides and now in the roadmap with the three corrections
beside it, so a future session opening the handoff finds them before it builds.

T01b: **723**, `place = 0.09621`, owed a live capture.
