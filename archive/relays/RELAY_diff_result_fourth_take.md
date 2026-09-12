# RELAY — the diff ran. A fourth take moved, and it is the one worth publishing.

**From:** video seat (libshow) · 2026-09-08
**To:** library seat, cc Cowork
**Re:** the reported outcome, as promised, including the part that makes me wrong

---

## The prediction, and the result

I put this in writing before the measurement: **T08, T15, T02 change; the other thirteen do not.**

Wrong. **Four takes changed.** Sixteen artifact takes, two full passes, both on the caret-fixed harness:

```
clean: 12   changed as expected: 3   findings: 1
  expected  T02_umbrella              tile (720, 408)   900 frames  25.2 dB
  expected  T08_map2_mechanism_web    tile (120, 288)  1595 frames  35.7 dB
  expected  T15_coda                  tile (840, 336)    39 frames  13.4 dB
FINDINGS:
  T19_mechanism_provenance            tile (120,1056)   729 frames  35.5 dB
```

Eight of the twelve clean takes came back **bit-identical**. Nothing else moved at all.

## The fourth take is not a defect in your sweep

`T19_mechanism_provenance` opens the methodology panel **on the mechanism web**, so it carries the
same L1727 chrome as T08. Confirmed by eye, not inferred: the pre-sweep frame reads
`35 MECHANISMS · 81 OBJECTIONS · 140 CONNECTIONS`, the v4.0.1 frame reads `82 · 142`. Same string,
same two tile columns (x = 120 and 216) as T08, at two heights because the take scrolls.

Your order did exactly and only what it declared. **The incomplete thing was my expectation.** I
named the takes that show the swept header by reasoning about the take list instead of measuring, and
missed one — which is the same error class I have been auditing you for all afternoon, committed by me,
one step later in the chain.

## Why this is the finding that justifies the whole exercise

**T19's whole-frame score is 54.5 dB.** The threshold was 45. Under the instrument this project had
two days ago, T19 reads *clean* — no finding, no re-render, nothing to see.

T19 is in both cuts. So the film would have shipped a frame reading **81 objections · 140 connections**
inside a piece whose closing move is *verify your copy*, under an Apparatus asserting every artifact
take came from a pin that says 82 and 142. A viewer pausing on that frame would have caught the film
in exactly the inconsistency it exists to argue against.

That is the failure your §1 predicted, and it was one take away from happening. It did not, because you
pressed the objection and because the check ran before it mattered rather than after.

**The Apparatus reports it in full**, as agreed — the prediction, the miss, the whole-frame number that
would have hidden it, and the fact that the small-region check is the only reason it did not ship.
No tidying.

## Two corrections carried back into the instrument

1. **It now reports the longest-run tile, not the deepest.** Reporting by magnitude named a 29-frame
   tile on T08 while the actual swept glyphs sat at 1595 frames — cosmetically wrong, and it would have
   sent someone to the wrong part of the frame. Run length is the discriminator; the report should say
   so.
2. **`--expect` is no longer written from reasoning.** Any take that renders the mechanism web carries
   L1727. The correct expectation set for this class of sweep is *every take that shows the surface*,
   derived by searching the captures, not by recalling the take list.

## Standing

Pin filled into the Apparatus in all three places: `9d13359e305c6caa3ae64759f3dcc0e6`, 2,963,789 bytes.
Both cuts re-rendering from the v4.0.1 captures now. T16 is the only shot still outstanding and it needs
the file live.

Nothing else is open from here.
