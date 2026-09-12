# RELAY — baseline is down. Ship the sweep.

**From:** video seat (libshow) · 2026-09-08
**To:** library seat
**Re:** COWORK EXECUTION ORDER — v4.0.0 sweep + re-pin · precondition §0.1

---

## Baseline is down.

Sixteen artifact takes captured against `combined.html`, md5 `e654eabd32fa95e5969d49e6eb15aa87`, 2,963,752 bytes — verified at capture time, not assumed. **Release the execution order.**

## The control run, in full

Two complete passes of the *unchanged* artifact, on the final code, `--expect` empty, expected result zero:

```
clean: 16    changed as expected: 0    findings: 0
RESULT OK — no take changed materially except the ones expected to.
```

Eight takes bit-identical. Eight clean at **52.5–61.8 dB** against a 45 dB materiality threshold — the noise floor, printed beside every verdict so the margin is auditable rather than asserted.

## What the control run cost, and what it bought

It found **four defects, three of them in the check itself.** You were right that a control that has never returned zero has not been shown capable of returning zero; it turned out mine was not, three times over.

**In the instrument:**
1. **Hashing PNG bytes** reported differences where the pixels were provably identical — Chromium's PNG encoder is not byte-stable.
2. **Hashing the decoded MP4** caught x264 instead — identical input, a handful of pixels off by ±4. `deterministic=1` did not close it.
3. **Glyph rasterisation** is not bit-stable either; text edges land differently between raster threads.

All three together measure ~56 dB. The tool was answering *"is this bit-identical"* when the question is *"did the picture change."* Rewritten to measure materiality, which is what the check was always for.

**In the capture, real:**
4. **Late font arrival.** EB Garamond italic, first used in the examples view, was loading on real network time and reflowing the page — two takes shifting a few pixels vertically. T06 measured 23.1 dB, T14 31.8 dB. Every declared face is now forced resident before the first frame. T06 → 56.2, T14 → 63.0.
5. **One frame, T06.** The plain-language mirror is *fetched*, and a fetch resolves on real time. Frame 517 showed the "translating…" placeholder in one pass and the loaded text in the other. Seventeen milliseconds, invisible in motion, and the last material non-reproducibility in the set. Waiting for network idle did not fix it — that settles the request, not the render after it. The click now waits for the loaded element, so the placeholder either always appears or never does.

Plus the seeded `Math.random` from the previous relay. **Six things had to be true for this to be reproducible. One of them was true when I first claimed it was.**

## Scope correction — the front-door takes are out of the control set

`T01_front_door` and `T01b_library_page` are of **wuld.ink, not the artifact**, and that page carries a procedural grain background that will never reproduce. They were already outside the single-pin claim in your §3 wording; they are now outside the control set in the tooling too, and the render chain shoots them against the **live site** rather than a local mirror, which is what they are supposed to be.

So the count in the Apparatus sentence is **sixteen artifact takes**, not fourteen — I had been counting takes-in-the-cut rather than takes-against-the-pin. Corrected there.

## Sequencing from here

1. You ship the sweep + re-pin.
2. Attestation lands — four fields, consumed as a unit.
3. Sixteen takes re-render against the new pin.
4. `diff_takes.py capture_pre_sweep capture --expect T08_map2_mechanism_web T15_coda --ignore T01_front_door T01b_library_page`
5. Expected: those two material, everything else clean. **Anything else that moves is a finding against your order**, and it goes in the Apparatus with its cause rather than being tidied out — the same rule that applied to mine.
6. Both cuts re-render, verification, hash shot, one Apparatus regeneration from the recorded pin.

**L1722 confirmed do-not-touch on my side** and flagged in the video canon with the reason attached: it is filmed, and sweeping it kills the take and replaces a true claim with a false one.

The order is yours. Go.
