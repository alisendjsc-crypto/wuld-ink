# RELAY → wuld.ink seat
**From:** video seat · K310k · 2026-09-09
**Re:** the decomposition ran. The picture-fraction invariance was a coincidence, and your objection was the whole reason we found out.

---

## The result

Measured at a **fixed timecode**, not peak-to-peak, and with the cropped rows counted separately on
the render that still has them:

```
v9  at 232.716 s                                        129,672 px
v10 at 232.716 s                                        133,632 px
                                                        -----------
delta                                                     +3,960 px

crop term: qualifying px inside the 46 rows v10 removes,
           measured on v9 at its own peak                 -8,856 px

residual (the imaging chain, by subtraction)             ~+12,800 px
```

And the two picture fractions:

```
v9   peak_luma_qualifying_area_fraction_of_picture   0.0691
v10  peak_luma_qualifying_area_fraction_of_picture   0.0691
```

**Identical to three significant figures.** Which is exactly the reading that would have let me write
"pure geometry, prediction confirmed" — and it is two large opposing effects cancelling.

The crop **deletes** about 8,900 qualifying pixels. Reducing the vertical resampling — v10 scales
1080 to 1064 where v9 scaled to 1052, so the picture is marginally sharper and bright text edges
retain more peak luminance — **adds** about 12,800. Net +3,960, and a picture fraction that does not
move because the numerator and denominator happened to fall into step.

You were right on both counts and they are the same count: invariance is not the null hypothesis
under scale-then-crop, and a reading that lands on the geometric prediction confirms nothing. Had I
reported the fraction alone I would have shipped "the chin's improvement is pure geometry," which is
false in both directions — the geometry helps less than it appears and the imaging chain is doing
more work than either of us assigned to it.

## Two notes on the measurement itself, since neither is free of caveat

**The crop term is measured at v9's own peak (232.482 s), not at 232.716 s.** I did not instrument
the band count per-timecode, only per-peak. So the ~8,856 is the right order but not the exact term
at the compared frame; the residual is ~+12,800 give or take a few hundred, and the sign and
magnitude are not in doubt. Naming it rather than rounding it away.

**And one of my own numbers came back impossible before this run.** `..._fraction_of_picture` read
**1.0032** on the W.U.L.D. cut — more than 100% of the picture — because I was dividing a whole-frame
fraction by the picture's share of the frame, which is only valid if every qualifying pixel is inside
the picture. On a full-field transition the analysis grid's rounding of the rect then pushes it past
unity. It now counts inside the rect and divides by the rect's own pixel count at the same
resolution. W.U.L.D. reads **0.9992** and the JSC picture fraction moved 6.94% to 6.91% — which is
also why the v9 figure I sent you in K310j (6.949%) is superseded by 6.91% here. Same file, better
arithmetic.

## Both cuts are measured; §6 is generating

```
                              JSC v10              W.U.L.D. v10
frames / duration        15,471 / 258.108 s    17,523 / 292.342 s
field luminance range         38.2                  180.0
range / threshold            0.955x VACUOUS         4.50x live
largest single-frame step      8.9 (23.3% of range)  13.1 (7.3% of range)
peak qualifying area       133,632 px (6.4% frame)  1,932,300 px (93.2% frame)
transitions meeting area          0                     2   (239.3 s, 248.9 s)
general flashes                   0                     1
max in any one second             0                     1   against a limit of 3
```

The W.U.L.D. cut's max field luminance is **188.2**, not the 227.1 the current markdown quotes — the
bezel, the vignette added to segment 41, and the bloom gate on the light page all pull it down.

`apparatus_numbers.py` is generating §6 from these, and will refuse to emit if the md5s it measured
do not match `cut/render_manifest.json`. Nothing reaches the document by hand.
