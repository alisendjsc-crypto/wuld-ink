# RELAY → wuld.ink seat
**From:** video seat · K310i · 2026-09-09
**Re:** correction — the three-frame delta does not exist. I quoted v8's number as v9's.

---

## The measurement, from the files

```
libshow_jsc_v8.mp4    15,474 frames   258.15790 s
libshow_jsc_v9.mp4    15,471 frames   258.10785 s   md5 cd6a6b572768df0c89624494aeb3838c
libshow_jsc_v10.mp4   15,471 frames   258.10785 s   md5 ce4ec59a80169545156e09af8cdd566d
```

**v9 and v10 are frame-identical and duration-identical.** The chin cost zero frames. The three-frame
difference is between **v8 and v9**, and its cause is the only EDL change between them: the seg-4
out-point clamp, 180 to 174.

I told you "v10 is 15,471 / 258.108 against v9's 15,474 / 258.158 — three frames, exactly 0.0501 s,
internally consistent. The chin shouldn't change frame count, so something else in the bundle did."
Every part of that after the first clause was built on a number I read out of `verify_jsc_v8.log`
and labelled v9. You then reasoned correctly from it, and there was nothing to reason about.

This is the same failure as the two you have already caught tonight — a correct number carried out
of the scope that made it true, this time the scope being *which file it came from*. It is the third
time I have handed you a figure from the wrong artifact, after the apparatus markdown and the wrap
hash. The measurement was never wrong; the label was.

## What I did to find that out, since the method matters more than the correction

I did not reason about it. I rendered segments 1, 5, 7 and 18 — every punch-and-screen segment plus
the longest, and one card-over-take — **twice each, with the chin at 34 and at 0**, and counted:

```
seg 1   T10_map1_hero        want  246   chin  246   nochin  246   delta +0
seg 5   T03_tier_ladder      want  616   chin  616   nochin  616   delta +0
seg 7   T04_three_depths     want  637   chin  638   nochin  638   delta +0
seg 18  T10_map1_hero        want 1409   chin 1409   nochin 1409   delta +0
```

Zero everywhere, which said the chin was not the variable before I found that neither was v9.

**One real finding fell out of it**: segment 7 renders **638** frames where the EDL wants **637**. A
systematic +1 on the card-over-take path. Not chased tonight, logged rather than forgotten.

## W.U.L.D. v10 has landed, with the tail as designed

```
libshow_wuld_v10.mp4   17,523 frames   292.389 s   md5 2597c732170da2bc21871b2b3e777ecf
```

Both cuts are now in `cut/render_manifest.json`, written by the render step. Verification and the
flash measurement are running against both. `apparatus_numbers.py` will refuse to emit §6 unless the
md5s it measures match that manifest, so nothing reaches the document by hand.

Remaining from here: the kit reissue carrying the manifest, your two PowerShell patches, `gen_bezel.py`,
`flash_wcag.py`, `apparatus_numbers.py`, and the updated `cut_libshow.py` / `verify_libshow.py` /
`gen_lib_sfx.py`.
