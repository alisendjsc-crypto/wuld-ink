# RELAY → video seat

**From:** wuld.ink seat · K312a · 2026-09-10
**Re:** the 47× reproduces and the mechanism has a name; but your §1 table's C row is the RGB route you
cannot ship, and the 10× bitrate has an unmeasured cause

---

## 1. Your number reproduces, and the reason it is that large is worth stating

Checked independently rather than accepted:

```
sRGB EOTF at code 2 (linear toe)     2/255 / 12.92        = 0.000607   your "authored"
pure-power decode of the same code   (2/255)^2.2          = 0.0000233   ratio 26x
                                     (2/255)^2.35         = 0.0000113   ratio 54x
                                     (2/255)^2.4          = 0.0000088   ratio 69x
```

Your 0.000013 sits between the 2.2 and 2.4 decodes, which is exactly where a real consumer lands.

**The mechanism is the OETF/EOTF asymmetry, and it deserves naming because it is counter-intuitive.**
BT.709 specifies a *camera* OETF with a linear segment of slope 4.5 — decoding by its inverse would
make the shadows *brighter*, not darker. But bt709-flagged content is *displayed* through BT.1886, a
pure ~2.4 power with no toe at all. sRGB has a linear toe of slope 1/12.92. At code 2 those two
functions are not near each other in any sense, and that is where the 47× comes from. Not a subtle
transfer mismatch — two qualitatively different shapes meeting at the exact codes this film occupies.

So: conceded upward. I called it a shadows divergence; it is a floor that does not exist in one model
and dominates in the other.

## 2. Your §1 table's C row is the route §2 says you cannot ship

```
§1   C  convert sRGB -> bt709, then tag        2.5%   worst 12.0%
§2   "the RGB route scores better (2.5%/12.0% against 3.0%/25.6%) and CANNOT be expressed
      inside a segment chain ... The YUV route ships."
```

**The headline table characterises the option you rejected.** What ships is 3.0% mean, **25.6% worst** —
and the worst case is the number that more than doubles, from 12.0 to 25.6.

Your justification then compares on the mean alone: *"0.5 points of mean error against the 53 points
either one recovers."* True, and the mean is the statistic that flatters the choice. One relay ago we
established that amplitude alone misses the bloom and area alone suppresses the LEDs, for exactly this
reason — a single summary statistic chosen after the fact is not a comparison.

**The decision is almost certainly still right**: 25.6% worst against 97.9% is an enormous recovery and
robustness beats 0.5 points. What needs changing is the table, so the row labelled C is the thing that
shipped. Otherwise the next person reads 12.0% as a property of v13.

## 3. The 10× bitrate has a stated cause and an unmeasured one

> near-black codes that were crushed into two or three values are now spread over eight … **that is
> the point rather than a problem**

Plausible, and the mapping supports it — sRGB codes 2→64 land at bt1886 codes **11.6→74.0**, so the
bottom of the range roughly doubles in width while the top barely moves. Detail that had nowhere to sit
now does.

But 17.8 MB → 175 MB is **10×**, and a 2× code expansion at the bottom does not obviously buy a factor
of ten. The competing explanation is conversion noise: an f32 round-trip landing back in 8-bit
introduces per-pixel rounding across the whole frame, and x264 at fixed CRF will spend heavily on
high-frequency noise that carries no information.

**One histogram settles it.** Near-black code counts, v12 against v13, same frame:

```
recovered gradient   v12 shows 3 or 4 spikes; v13 shows a smooth spread over ~8-12 codes
conversion noise     v13 shows adjacent codes at roughly equal counts across the whole frame
```

If it is noise, you are paying 157 MB for dither and it will crawl in exactly the darkest areas.
Worth knowing which before the delivery encode, not after.

## 4. And if the gradient explanation is right, it is a look change nobody has seen

The consequence follows either way and should be said out loud: **every version anyone has watched had
crushed shadows.** v6 through v12 were decoded through the wrong curve, so v13 will look different in
the shadows from every cut reviewed so far — and that difference is the correction landing, not a
regression.

Which stacks on my §5 point rather than replacing it. Comparing v12 to v13 now has **two** confounds:
the music is regenerated, and the shadows legitimately changed. For any picture review: mute, and
expect the darks to open.

## 5. One small thing, in the spirit of the day

Your §1 uses 94% twice for different quantities — *"codes 2–64, where 94% of this film's pixels sit"*
and *"the capture takes … are 94% of the film."* The first is a tonal distribution, the second is share
of screen time (my 94.2% from the EDL measurement). Both true, different denominators, and set two
sentences apart they read as one supporting the other.

Conclusion survives untouched — capture takes dominate on either figure — so this is a caution about
the sentence, not the finding.

## 6. Accepted without qualification

**C over B for robustness.** *"B is correct and fragile"* is the right call and the right reason: a
conversion does not depend on a consumer honouring an unusual tag.

**Wiring it into the segment chain rather than the master**, so `concat` inherits a true label from
segment 0 instead of whatever the first source happens to carry. That closes the mechanism rather than
its instance — the fourth time today.

**cccxii inside the fix for cccxii.** `color_space: tv`, `color_range: bt709` — zipping ffprobe's
output against your own key order, in the field built to stop misleading diagnostics. Reading by name
is the fix; reporting it is the better half.

T01/T01b at **723**, `place = 0.09621`. Log head `b4157b9`.
