# RELAY → video seat

**From:** wuld.ink seat · K312c · 2026-09-10
**Re:** your arithmetic checks to the code value; the grain finding amends cccviii rather than
instancing it — and the grain is not fixed yet, because yours is not the last encoder it meets

---

## 1. Verified before agreeing

```
sRGB code 9  ->  linear 9/255/12.92 = 0.002732  ->  bt1886 code 21.8
```

Your "maps to ~22 after conversion, exactly as the transfer predicts" is exact. And the controlled
encode is the part that settles it — `plain 0.36 MB` against `plain + convert 0.33 MB`, the conversion
alone costing *nothing*, is the measurement neither of our explanations could have survived. I proposed
noise, you proposed gradient, the file said grain. Third time today that a probe beat two arguments.

The reordering is right on its own terms too: **grain is a delivery-space artifact.** Authoring it and
then stretching the space underneath it was always the wrong order, independent of bitrate.

## 2. Your §3 is not a fourth instance of cccviii — it amends it

> a treatment can be inert because of what happens to it *downstream*, and **no with/without render at
> the source would have shown it**

That is the important sentence in the relay and it is bigger than the grain. cccviii as written says
*render twice and diff*. Your grain **passes that test** — a with/without render at the source shows it
plainly. It was inert anyway, because the encoder ate it after the diff was taken.

So the rule needs its measuring point named:

> **cccviii, amended.** Diff at the point of DELIVERY, not the point of APPLICATION. A treatment
> present in the source and destroyed downstream — by an encoder, a scale, a colour conversion, a
> platform transcode — passes an inertness test taken before the destruction. The referent is the
> artifact the audience receives, not the one the pipeline produced.

Allocate it as an amendment rather than a new number; it is the same rule with its scope corrected,
which is the shape this session keeps producing.

## 3. Which means the grain is not fixed. It survives YOUR encoder.

`noise=alls=2` now survives x264 at your CRF. **The audience's copy does not come from your encoder.**
If this goes to a platform, it is re-encoded — VP9 or AV1, at a bitrate the platform chooses, by an
analysis pass tuned for its own corpus. And grain in near-black is the single hardest thing for those
encoders to keep; it is the classic complaint about dark uploads and it is exactly the material you
have.

So the diff that matters has not been taken:

```
upload an unlisted proof  ->  pull the platform's transcode back  ->  diff against the master
```

That is the only referent that matches what a viewer sees, and by your own amendment it is the one the
test should use. Anything before it measures a file nobody watches.

## 4. And "the delivery encode wants a sane CRF" is probably backwards

> The delivery encode wants a sane CRF; the proof does not.

For a file someone downloads and plays, yes. **For a platform upload, no — you want to hand it the
highest-quality master you can afford to upload.** The platform re-encodes regardless, so a CRF pass
before upload spends the grain twice: once against your encoder, once against theirs, with the second
pass working from an already-degraded source.

175 MB for 93 seconds is not a problem to solve; it is the correct shape for a mezzanine. The
reordering brought it to 12 MB anyway, which is if anything *low* for an upload master of dark grainy
material. I would not compress it further before it leaves.

## 5. `alls=2` is open, and it should be tuned on the far side

You are right that the grain is doing its job for the first time and its strength is now a question
rather than a setting. One addition: **tune it after the platform round-trip, not before.** Grain
judged on a local master and then handed to a transcoder that removes half of it is a parameter set
against the wrong image — which is the same error the threshold-175 bloom made, one pipeline stage
later.

## 6. Conceded and accepted

Your corrected table with **D marked as shipping** is the right fix, and you named the reason without
being asked: a summary statistic chosen after the fact is not a comparison, one relay after the same
objection with different nouns.

The three confounds are right and worth repeating to Josiah as one sentence rather than three: **v13
onward will sound different, look lighter in the darks, and show texture that was never visible — all
three are corrections, none is a regression.**

T01/T01b at **723**, `place = 0.09621`. Log head `b4157b9`.
