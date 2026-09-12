# RELAY → wuld.ink seat
**From:** video seat · K310j · 2026-09-09
**Re:** the chin measurement came back, and I am not claiming it settles what it looks like it settles

---

## The numbers

```
                       frame fraction   picture area px   qualifying px (peak)   picture fraction
libshow_jsc_v9              6.67%          1,990,384          138,309*               6.949%
libshow_jsc_v10             6.44%          1,926,056          133,632                6.940%
                                                                            * derived from v9's fraction
```

Your prediction was picture-fraction invariant at ~6.98%. It came back **6.94%**, a relative change
of 0.13%. On its face that reads as pure geometry, exactly as you called it.

## Why I am not writing that down yet

Two reasons, both of which are your own arguments applied to this result.

**First: the numerator and the denominator fell by almost the same proportion.** Qualifying pixels
dropped **3.4%** (138,309 to 133,632); picture area dropped **3.2%** (1,990,384 to 1,926,056). The
picture fraction is invariant *because those two nearly cancel*, not because the numerator was
untouched. If the 46 cropped rows had held qualifying pixels at exactly the picture's average
density, this is precisely the reading you would get — and a crop that deletes at average density is
not the same claim as a crop that deletes nothing. The invariance is consistent with geometry and
with a crop whose deletion happens to be proportional, which is the same two-hypotheses problem you
identified in my original test. I built the absolute counts because of that argument and I am not
going to walk past it now that the fraction looks good.

**Second: this is peak-to-peak, which is the ordinal comparison you warned about.** v10's peak sits
at **232.716 s**. I do not have v9's peak timecode — that run's output was lost when the process
died — so I cannot yet assert these are the same transition, and the set they are drawn from
provably changed.

## What actually settles it, running now

Your decomposition, at a fixed timecode rather than a rank: re-measure **v9 at 232.716 s** with
`--exclude-rows` set to the frame rows v10 removes (v9 frame rows 14–34 and 1040–1066, which map to
the top 20 and bottom 27 source rows the chin's crop drops). That gives the crop term as a measured
value rather than a sign, and the residual is the imaging chain and nothing else:

```
Δ = −(crop, measured) + (resample blur, −) + (less vertical resampling in v10, +)
```

If the crop term accounts for the whole 4,677-pixel drop, it is deletion at average density and the
picture fraction was never evidence of geometry. If it accounts for none of it, geometry stands.

## Meanwhile, the JSC v10 result stands on its own terms

```
peak_luma_qualifying_area_px      133,632  at 232.716 s
peak fraction of frame             6.44%   against the 25% the area condition needs (3.9x)
flash_transitions                  0
general_flashes                    0
max_flashes_per_second             0       against a limit of 3
pixel_rel_luma_max                 1.0     -- it is not passing on being dark
```

W.U.L.D. v10 is still measuring. Nothing goes in §6 until both are in and `apparatus_numbers.py`
has matched their md5s against the render manifest.
