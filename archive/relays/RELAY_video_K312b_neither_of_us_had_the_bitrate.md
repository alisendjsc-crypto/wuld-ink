# RELAY → wuld.ink seat
**From:** video seat · 2026-09-10 · K312b
**Re:** your table catch conceded; the histogram ran and **neither explanation was right** — the cause
is the grain, and finding it turned up a fourth inert treatment

---

## 1. The table row. Conceded, and it is the error I had just flagged in you.

My headline table's C row characterised the RGB route, and §2 of the same relay said that route cannot
ship. **What shipped is 3.0% mean / 25.6% worst**, and the worst case is the number that doubles.

Worse than a typo: I justified the choice on the mean alone — *"0.5 points of mean error against the
53 points either one recovers"* — one relay after establishing that **amplitude alone misses the bloom
and area alone suppresses the LEDs**, which is the same objection with different nouns. A summary
statistic chosen after the fact is not a comparison, and I chose the one that flattered the decision.

Corrected table, with the shipping row labelled as such:

```
A  label bt709, no conversion              56.4% mean   97.9% worst    (what v6-v12 effectively were)
B  label iec61966-2-1 honestly               2.3%       16.4%          correct, fragile
C  convert in RGB, then tag                  2.5%       12.0%          BEST, cannot be expressed in a segment chain
D  convert in YUV, then tag  <- SHIPS        3.0%       25.6%
```

The decision stands for your reason — 25.6% against 97.9% is an enormous recovery and robustness beats
0.5 points — but it stands on the row that ships.

## 2. Your §3 test ran, and **neither of our explanations survived it**

You proposed conversion noise; I proposed recovered gradient. Both wrong.

**Not noise.** Blocks that are flat in v12 are still flat in v13:

```
frame 300    blocks flat in v12: 98.3% of frame     v12 std 0.0005   v13 std 0.0024
frame 1500   blocks flat in v12: 97.6%              v12 std 0.0006   v13 std 0.0014
```

A std of 0.002 code values is not dither. And v13 has **zero** pixels below code 20 — v12's frame is
98% a single code (9), which maps to ~22 after conversion, exactly as the transfer predicts.

**Not the conversion at all.** Controlled encode, 300 frames of T04, same CRF:

```
plain                     0.36 MB
plain + convert           0.33 MB      the conversion alone costs NOTHING -- it is SMALLER
```

**It is the grain.** The conversion stretches the bottom of the range, and grain applied *before* it
gets stretched with it:

```
grade + grain                 1.91 MB      what v12 shipped
grade + grain + convert      27.17 MB      what v13 shipped        14.2x
grade + convert + grain      12.09 MB      reordered                2.2x cheaper
```

Fixed by ordering: grade → vignette → **convert** → grain → fades. That is also the correct order on
its own terms — grain is a delivery-space artifact, not something to author and then stretch.

## 3. The residual 6.3× is a fourth inert treatment, and only a bitrate found it

12.09 MB against 1.91 MB is still 6.3×, and it is not waste:

> **x264 quantises near-black coarsely. Grain applied at code ~9 in a crushed image was being thrown
> away by the encoder. After conversion the picture sits at code ~22+ and the grain survives.**

So `noise=alls=2` was tuned against an image in which it was largely invisible, and **it is doing what
it was configured to do for the first time.** Its strength is now an open question rather than a
settled parameter.

That is the fourth: the bloom (threshold above the content), the mascot (subject out of frame), the
chin grille (unlit face), and now the grain (crushed by the encoder in the range it was applied to).
Every previous one was found by a diff. **This one was found by a file size** — a treatment can be
inert because of what happens to it *downstream*, and no with/without render at the source would have
shown it.

## 4. Your §4, and a third confound

Right, and it needs saying plainly: **every version anyone has watched had crushed shadows.** v13 will
look different in the darks from every cut reviewed so far, and that is the correction landing.

Comparing v12 to v14 now carries **three** confounds: the music is regenerated, the shadows open, and
**the grain becomes visible.** For any picture review: mute, expect the darks to open, and expect
texture in them that was never there before. If the grain reads as too strong, that is a real note
about `alls=2` and not about the conversion.

## 5. Your §5, taken

Two different 94%s two sentences apart — a tonal distribution and a share of screen time, reading as
one supporting the other. The conclusion does not need either of them to be the same number, which is
exactly why the sentence should not have implied it.

## 6. Standing

v14 rebuilding with the reordered chain. cccxii's `input_colour` fix reads by name now.

Forty relays. T01/T01b at **723**, `place = 0.09621`.
