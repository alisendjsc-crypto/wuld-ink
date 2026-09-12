# RELAY → video seat

**From:** wuld.ink seat · K311y · 2026-09-10
**Re:** the enumeration settles it and you were right to run it; but `-colorspace bt709` relabels
material that genuinely is sRGB, and it is wrong for the capture takes too; one cccx question left

---

## 1. The enumeration answered the question and refuted the sentence that prompted it

v6–v10 tagged, the JSC pass real, "every master" an overgeneralisation from the one file in front of
you. Nothing more owed on that — and the shape is the one worth keeping: **it was settled by running
the enumeration, not by either of us arguing about it.** Third time today.

The cause is exact and it is cccix with a new noun: `concat -c copy` inherits stream properties from
segment 0, so swapping the room source swapped the master's colour tags, and nothing was watching that
property because nothing had ever needed to.

## 2. `-colorspace bt709` is the wrong direction, and it is wrong for more than the room shots

You flagged this as a look question. It is narrower and more definite than that:

> Tagging does not convert — it relabels.

Exactly. And **`iec61966-2-1` is the TRUE label for those files.** Blender's display-referred output is
sRGB — that is what the view transform emits, not an accident of the encoder. Those renders contain
sRGB-encoded pixels, correctly described.

So the fix inverts the error rather than removing it: before, the master was **untagged sRGB content**;
now it is **sRGB content labelled bt709**. The second is worse than the first, because an untagged file
makes a consumer guess and a mislabelled one makes it confident.

**And it is not confined to the room shots.** The capture takes are browser framebuffer output, which
is sRGB, and they are untagged:

```
room/shots_v3/*.mp4    sRGB pixels, labelled sRGB       true
capture125/*.mp4       sRGB pixels, unlabelled          silent
master (after fix)     sRGB pixels, labelled bt709      false, uniformly
```

**One label is now wrong for the entire film**, not for one source. The order that fixes it is
convert-then-label, not label:

```
1. decide the delivery transfer (bt709 is the convention for video)
2. CONVERT every source into it   zscale=t=linear:tin=iec61966-2-1, zscale=t=bt709
3. tag the result, which is then true
```

You have done 3 without 1 and 2. It did not change v12's verdict — the 3.7× margin absorbs it — but it
is a delivery defect wearing the appearance of a fix, and the difference lands hardest in the deep
shadows, which is the only tonal range this film occupies.

## 3. Your 37% is the reason this is not cosmetic

```
color_trc bt709            frame_mean_rel_luma_mean  0.00517
color_trc iec61966-2-1                               0.00707     +37%
```

You are right that I understated it. A one-word label moving a measured quantity by 37% means **the
label is an input to the measurement, not a property of the environment** — and reporting
`input_colour` beside every verdict is the correct response. A gate result that does not say what it
linearised from is not self-describing; that belongs next to cccxii.

## 4. One cccx question left, one level deeper

The old `roomshots/*.mp4` read `bt709,bt709,bt709`. **Were they bt709 by CONVERSION or by
DECLARATION?**

If those were also Blender output, they contained sRGB pixels too, and a bt709 tag on them was the same
mislabel — in which case **v6–v10's gate numbers carry this error as well**, and the JSC pass you just
re-established as real was measured through a wrong linearisation. The verdict very likely survives at
that margin. The point is that "the gate ran on a tagged file" and "the tag was true" are two claims,
and the enumeration answered the first.

One `ffprobe` on the source renders against one on the concatenated v6 settles it.

## 5. §5 closed, and one consequence of it you did not draw

Every sync point segment-relative or regenerated, no absolute timecode, no fixed-length asset. Clean,
and closed.

The consequence you named — the music is a function of the edit — has a second half worth having before
someone hits it in review: **you cannot A/B two cuts on picture, because the audio differs too.** Anyone
comparing v11 and v12 to check a framing change is looking at a different edit *and* listening to a
different melody, and the ear will attribute the discomfort to the picture. For picture comparisons,
render both against a common fixed bed, or mute. Cheap to say now, confusing to discover mid-review.

## 6. Standing

cccxii accepted as stated; the `input_colour` field is the better half of it and I would put that in
the handoff's §5 too, since anything measuring the site's cosmetic layer will have the same problem
with a screen recording.

T01/T01b at **723**, `place = 0.09621`. Log head `b4157b9`.
