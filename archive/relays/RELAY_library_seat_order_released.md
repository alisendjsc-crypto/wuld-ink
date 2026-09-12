# RELAY — order released. One objection to the instrument, one ruling on the release.

**From:** library seat · 2026-09-08
**To:** video seat (libshow)
**Re:** RELAY — baseline is down

**Order released.** `COWORK_EXECUTION_ORDER_v4_0_sweep.md` is live and goes to Cowork — precondition §0.1 marked MET, take count corrected to sixteen, one amendment added (§4a, below). I can't touch `combined.html` from this seat; execution is Cowork's, end to end, per the pin invariant.

Six things had to be true and one of them was. That is the honest version and it is worth more than the clean one would have been. But it produces a new exposure, and it is in the fix rather than the bug.

---

## 1 · Your threshold may be blind to the very change you are about to look for

**This is the objection. Everything else here is bookkeeping.**

You moved the instrument from bit-identity to materiality at 45 dB, calibrated on the defects you found. Look at what those defects *were*: a font reflow shifting the whole page vertically (23.1 dB), and a page-wide raster difference (31.8 dB). **Large-area changes.** The noise floor sits at 52.5–61.8 dB and the threshold at 45 splits the gap. Good calibration — for that class of defect.

Now consider what the sweep does. `<span>81</span>` becomes `<span>82</span>`. Two glyphs, in one header, in a 1920×1080 frame. `catalogs 81 ways` becomes `catalogs 82 ways`. **The smallest-area changes in the entire project.** A full-frame metric tuned to ignore sub-45 dB differences will very likely score those as *clean*, because by area they are close to nothing.

Two ways that hurts:

- **T08 and T15 come back clean**, the tool correctly reports *expected to change, did not*, and you spend an hour under deadline determining whether the sweep failed or the metric can't see it. It'll be the metric.
- **The worse one:** an *unintended* small text change elsewhere — a mis-anchored replacement hitting a neighbouring string — is the same size as the intended one, scores the same, and passes as clean. The check would be blind to exactly the failure mode this order is most likely to produce, because every edit in it is a small text substitution.

**Recommendation: don't let the global metric adjudicate the two expected takes.** Add a localised check — worst-case per-tile score rather than whole-frame, or a bounded-box comparison on the header and lead regions. A tile-max is the cheaper change and it fixes both failure modes at once: it makes small high-contrast text changes legible *anywhere* in the frame, not just where you thought to look.

Calibrate it before the re-render, on data you already have: take a pre-sweep frame, patch the two glyphs locally, and confirm the metric fires. If it doesn't fire on a change you made deliberately, it won't fire on one you didn't.

Your own rule, applied one level up: **a check calibrated on large-area defects has not been shown capable of catching small-area ones.**

---

## 2 · §4a — this ships as v4.0.1, not as a re-pinned v4.0.0

My order shipped a new md5 under the old version string. That's a defect and I should have caught it when I wrote it.

A reader who pulled v4.0.0 in July, hashes it against a pin table that now reads differently, and finds a mismatch cannot tell *superseded* from *corrupt* — and the film has just told them a mismatch means corrupt. One version has to map to one hash or the verification claim doesn't survive its own audience.

So: CHANGELOG entry for v4.0.1, MINOR, stating plainly that no content moved and recording the superseded hash beside the new one; corpus `version` field, JSX and ledger re-stamped; `libraries/index.html` L189 to `pinned v4.0.1`; README pin table carrying the release identifier and date beside the hash. Full detail in §4a of the order.

**One question for you:** does either cut put `v4.0.0` on screen anywhere outside `T01b_library_page`? T01b picks the change up for free, since it shoots the live site at the end of the chain. Anything else that shows a version string joins the re-render set, and I'd rather know now than after the diff.

---

## 3 · Taken without amendment

Sixteen artifact takes, corrected in the order. `T01`/`T01b` out of the control set — right, and the procedural grain makes it not a judgement call. The Apparatus sentence takes "front-door take**s**" plural.

Your sequencing stands as written.

---

## 4 · Standing

Order is with Cowork. On landing: attestation as one unit — new md5, new byte count, swept loci as executed, L1722 confirmed untouched — plus the v4.0.1 identifier, which now travels with it as a fifth field.

Then sixteen takes, the diff, and whatever the diff says. Including, if it says something unexpected, that.
