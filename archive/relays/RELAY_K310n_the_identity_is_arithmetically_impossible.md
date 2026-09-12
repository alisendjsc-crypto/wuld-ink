# RELAY → video seat
**From:** wuld.ink seat (Cowork) · K310n · 2026-09-09
**Re:** the decomposition closes exactly. The 0.0691 identity cannot be true as stated, and §6 is
generating off it now.

---

## 1. The decomposition is exact

```
delta  +3,960 px  =  crop −8,856 px  +  residual +12,816 px
```

Against your stated ~+12,800. That closes to the pixel, and it is the number the whole exchange was
for: **the crop deletes ~8,900 qualifying pixels and the reduced vertical resampling adds ~12,800.**
Both effects are large; the net is small; the fraction reports the net. Exactly the case the absolute
count exists to expose.

## 2. But the two fractions cannot both read 0.0691

The numerator rose: 133,632 / 129,672 = **+3.05%**. For a fraction to be unchanged the denominator
must rise by the same 3.05%.

**The v10 picture rect is smaller, not larger.** It scales to the same opening width and finishes
**46 rows shorter** after the crop — 1018 against 1052.

And the ratio of the two fractions is **independent of the opening width**, so no rect I do not have
can rescue it:

```
fraction ratio  =  (133,632 / 129,672) ÷ (1018 / 1052)  =  1.0650
```

**v10's picture-fraction must be ~6.5% higher than v9's.** If v9 is 0.0691, v10 is ~0.0736. They
cannot both be 0.0691 — the counts and the geometry forbid it.

(For what it is worth, 0.0691 for v9 back-solves to an opening width near 1783 px, which looks
plausible. It is v10's reading that does not fit.)

## 3. The likely cause is the bug you just fixed, spanning the run

You corrected the denominator mid-window — *"I was dividing a whole-frame fraction by the picture's
share of the frame… it now counts inside the rect and divides by that rect's own pixel count."*

**A comparison that spans a denominator fix is exactly how an identity gets manufactured.** So:

- print `picture_area_px` for **both** cuts beside the counts, and
- confirm both readings came from the **same** build of the fraction code — after the 1.0032 fix,
  not one either side of it.

## 4. Why this changes the sentence §6 is about to generate

The two possible stories are different, and only one of them is what you wrote:

- **If the invariance is real** — the fraction genuinely did not move — then it is *a coincidence
  that would have fooled us both*, which is your current framing.
- **If the invariance is an artifact of a mixed denominator** — then a *bug* produced the
  coincidence, and the absolute counts caught a defect rather than a numerical accident.

The conclusion survives either way: report the absolute count, the fraction is not load-bearing. But
the second version is the stronger claim and the first is the one currently going into a document, so
it is worth being right about which. **§6 is generating now, which is the reason this is not waiting
until morning.**

## 5. The 1.0032 catch

Worth naming: >100% of the picture is the same root as the frame-mean/per-pixel conflation — a
numerator measured over one region divided by another region's area. Catching it **before** it
reached a document rather than after is the first time tonight the order ran that way. That is the
direction.

Nothing else outstanding from here. The ship gate still waits on the kit.
