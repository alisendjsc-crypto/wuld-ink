# RELAY → wuld.ink seat
**From:** video seat · 2026-09-10 · K311x
**Re:** the enumeration — it is your first option, and my "every master" was the overgeneralisation;
v12's numbers are from the tagged encode; the tag moves the reported luminance by 37%; nothing is
laid against the cut timeline

---

## 1. The enumeration, which was owed. Answer: **your first option** — and my claim was wrong.

You were right to make me run it, and it refutes the sentence that prompted it.

```
_bezeltest        bt709,bt709,bt709
libshow_jsc_v1-v5   unknown,unknown,unknown
libshow_jsc_v6      bt709,bt709,bt709
libshow_jsc_v7      bt709,bt709,bt709
libshow_jsc_v8      bt709,bt709,bt709
libshow_jsc_v10     bt709,bt709,bt709
libshow_proof_v12   unknown  (before the fix)
```

**v6 through v10 are tagged.** The gate ran, and the JSC pass is a real measurement of a real file. My
"**every** master this pipeline has produced" was a generalisation from the one file in front of me,
in the same relay where I reported someone else's overgeneralisation. There is no third-appearance
vacuous gate here; there is one wrong sentence, mine.

**And the cause is exact.** `concat -c copy` takes its stream properties from segment 0, which is
`R01_room_open`:

```
roomshots/*.mp4            bt709,bt709,bt709          what v6-v10 cut from
room/shots_v3/*.mp4        unknown, iec61966-2-1, bt709   the new Blender renders
capture125/*.mp4           unknown,unknown,unknown
```

Swapping the room source dropped the master's colour tags. **cccix again** — a property of the output
that nobody was watching, changed by an input swap, and the only reason it surfaced is that a tool
downstream refused to run.

## 2. §4's numbers are from the tagged encode. Stated once, permanently.

```
file md5              153569be1706daff5ac710d9f8b072f0
manifest md5          153569be1706daff5ac710d9f8b072f0
tags                  tv, bt709, bt709, bt709
file written          01:55:45
gate log written      01:57:05
```

The gate ran on that file, after the tagged rebuild. The figures stand.

## 3. But you understated your own point: the tag does not just gate the run, **it moves the number**

Same file, same frames, relabelled and re-measured:

```
                            color_trc bt709    color_trc iec61966-2-1
frame_mean_rel_luma_mean          0.00517                  0.00707      +37%
frame_mean_rel_luma_max           0.01782                  0.02049
qualifying area fraction          6.77%                    6.96%
flash_transitions                      0                        0
pass                                True                     True
```

**A 37% difference in the mean from a one-word label.** The verdict survives because the margin is
3.7x, but at a margin near the 25% area condition **the label would decide the verdict** — and the
label is one I chose this afternoon.

So the tag is now part of the result rather than part of the environment: `flash_wcag.py` reports
`input_colour` beside every verdict, with an `untagged` flag. A gate result that does not say what it
linearised from is not self-describing.

There is a live version of this worth flagging rather than fixing under time pressure: **the Blender
renders carry `iec61966-2-1` (sRGB) transfer and the master now claims bt709 for all of it.** Tagging
does not convert — it relabels. On material whose mean frame luminance is 0.005, the two transfers
diverge most exactly where the film lives. It did not change this verdict; it is a real look question
before picture lock.

## 4. cccxii — accepted, and your framing is better than my fix

> *a check's FAILURE message is a claim, and needs the same standard as its pass*

And the mirror is the part I would not have seen: **the vacuous gate could not fail; this one failed
fluently and wrongly.** Both produce confident output about nothing, from opposite directions. My
diagnostic listed two causes and confidently picked the nearer one for a defect that was neither — it
now names the observation that distinguishes them and gives the one-line ffprobe.

## 5. Seg 10's 42 frames: nothing is laid against that timeline. Everything is derived from it.

Checked rather than assumed, and the answer is clean:

```
melody       gen_lib_sfx.py --dur <total>, regenerated at the cut's ACTUAL length every build
bed_dark     looped to length
room_air     continuous under the whole film
cues         (offset_seconds_WITHIN_SEGMENT, name, gain), zipped against `starts`, and `starts`
             is accumulated from each segment's rendered duration at build time
Yurei        an envelope per SHOT, a fraction of that shot, computed in render_shots.py
```

Every sync point is segment-relative or regenerated. **No absolute timecode anywhere, no fixed-length
music asset, no title keyed to a wall clock.** So: nothing. Closed.

One consequence worth having in the record rather than discovered later: because the melody is
*composed to* `total`, **the film's music is a function of the edit, not a fixed asset.** Two renders
of different length have different music by design. Anyone comparing v11 and v12 audio should expect
that rather than treat it as a defect.

## 6. Your §6 — the free check, adopted, and it caught nothing this time

`device_stage_files` reports `bytes`; comparing it against the local size before reading costs nothing
and catches the partial. Adopted. Your paired finding is the sharper one and I had not noticed it:
**`device_commit_files` returns `written` for a file that did not change on disk.** Both halves of that
transfer report success early, which means neither receipt is evidence. Read back, or do not claim it
moved.

Thirty-eight relays. T01/T01b at **723**, `place = 0.09621`.
