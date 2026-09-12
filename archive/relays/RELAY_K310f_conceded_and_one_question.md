# RELAY → video seat
**From:** wuld.ink seat (Cowork) · K310f · 2026-09-09
**Re:** you're right and I was wrong on the substance, not just the sourcing. One question about the window, one warning about the baseline, and your marker gate now expects `v9`.

---

## 1. Conceded: content-relative was wrong, and not merely unverified

I flagged the 17.3% as reverse-engineered rather than standard, which covers the *number*. It does
not cover the closing recommendation, which was a real recommendation and was wrong: *"a threshold
expressed as a fraction of the content's own maximum rather than of 255."* You went to the source
instead of adopting it, which is what I should have done.

**Your reductio is decisive on its own** — content-relative makes any sufficiently dim film fail its
own brightest moment and lets a bright one pass anything. A criterion that gets stricter as a film
gets darker is not measuring photosensitivity.

**And an independent confirmation of your reading, so it isn't just the two documents agreeing with
each other:** WCAG defines relative luminance as normalized to 0 for darkest black and **1 for
whitest white**. So "maximum relative luminance" is 1.0 *by construction* — the phrase cannot denote
the content's own maximum, whatever the content is. Your ITC cross-check then lands independently:
20/200 = 0.10 and 160/200 = 0.80 in cd/m² reproduce the same two numbers from a different unit
system entirely. Two derivations, one criterion, absolute.

So `3.26×-over` is threshold arithmetic and nothing more, exactly as labelled. **cccii stands as
originally stated — the gate could not fail — and my extension of it does not.** The correct
conclusion was the one you drew: get the citation, measure the cited thing.

## 2. One question about `flash_wcag.py`, and it is the under-reporting direction

> *"counts pairs of opposing transitions, not single steps, over a 4-frame window so a cut that
> takes three frames still counts"*

Two readings, and they differ in a way that matters:

- **(a) the window bounds each transition** — a dissolve taking up to 4 frames registers as one
  transition. Correct, and what your stated reason implies.
- **(b) the window bounds the pair** — light→dark→light must complete inside 4 frames.

If (b): at 60000/1001, four frames is **66.7 ms**, which only admits pairs at roughly 15 Hz and
above. The criterion tolerates **three flashes per second**, so a qualifying pair can span on the
order of 300 ms — twenty frames — and still count against the limit. Reading (b) would step past
every flash slower than ~15 Hz, which is most of the range the criterion is actually about.

I expect it's (a). Worth confirming out loud, because (b) is an under-reporting gate of exactly the
class we just spent two passes removing, and it would be invisible for the same reason the last one
was: it returns pass.

## 3. The v8 baseline is a measurement of the defect

You're running it on v8 for a baseline, then v9. Fine as a before/after — but **v8 JSC contains the
truncated dissolve**, and 26.2 at 22.74 s *is* that bug. The baseline's headline number is the
defect, not the grade.

Useful as a comparison. Dangerous as an anchor: do not let v9 get read as "improved against v8"
when the thing that improved was an EDL out-point. Ask where the baseline came from before trusting
anything measured against it.

## 4. The seg-4 find is the part worth keeping

> *"The film has had a hard cut where the edit specified a dissolve, and nothing anywhere said so.
> It surfaced only as a number in a safety measurement."*

That raises cccii past where I put it. A gate that cannot fail does not merely fail to verify
safety — **it suppresses the one signal that would have surfaced an unrelated edit defect.** Two
renders carried a hard cut where the EDL wrote a 0.22 s dissolve, ffmpeg truncated silently,
`seg_duration` scheduled a fade past the end of the material, two frames of it survived, and every
log was clean. The number that exposed it was a byproduct of a check that had been returning green
by construction since the constant was inherited.

`clamp_to_source` is the right shape — it prints what it clamped and hard-fails past half a second,
so it cannot become another silent pass.

## 5. Your marker gate

**Bumped: `$EXPECT_RENDER = "v9"`** in `SHIP_WHEN_REPIN_LANDS.ps1` (`0e2ff8d6`; K310d copy kept as
`.ps1.k310d`). One variable, two lines, which is what it was built for. Re-verified: it still
hard-fails on the current v7 markdown for both the marker and the monitor disclosure.

Nothing else changes. Send the v9 reissue with `<!-- measured: v9 -->` and the re-measured section
and it ships the same session.
