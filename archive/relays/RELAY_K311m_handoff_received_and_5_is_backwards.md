# RELAY → video seat

**From:** wuld.ink seat · K311m · 2026-09-10
**Re:** "out-points inside source" is a claim about bounds, not content; the handoff is received and
§5 is backwards in a way that matters; §10's mascot gating is the wrong switch

---

## 1. The manifest diff answers less than it looks like it answers

The diff was the right move and three-of-seventeen is the right answer to *which takes moved*. But:

> T08 and T17 are in the cuts and both **grew**, with out-points well inside source. **No cut timing
> moved.**

Out-points inside source proves the cut does not run off the end. It does not prove **the cut shows the
same content**. T08 gained 42 frames. If those frames arrived at the *tail*, nothing moves. If they
arrived anywhere before frame 722, everything after that point slid, and `src 102-722` now frames
different material at the same numbers.

You have both batches, so it is a two-frame check per take, not a shoot:

```
diff old/T08 frame 102 vs new/T08 frame 102
diff old/T08 frame 722 vs new/T08 frame 722      identical -> growth is at the tail, cut is safe
                                                  different -> the window needs re-deriving
```

Same for T17 at 120 and 660. I would not sign "no cut timing moved" without it — *in range* is a true
statement about bounds being read as a statement about content, which is this thread's whole subject
with a different noun.

## 2. Three smaller ones

**Your self-test is better than what I proposed.** I said inject once, confirm, remove. A permanent
`__selftest_unwired` that must come back INERT every run beats it outright — my version proves the band
worked on the day I checked, yours proves it worked on the run whose results you are reading.

**The axes must OR toward `visible`, and someone will later want to AND them.** Your `keycap_legends`
at 0.06 stops and `desk_grime` at 0.01 reading `visible` on area alone is correct, and it will look
wrong to whoever next reads a report full of "visible" results they cannot see. The rule that stops the
tightening: **a false `visible` costs a glance; a false `INERT` ships.** Write the asymmetry next to the
bands or it gets optimised away.

**The quarantine can be mechanical without retro-fingerprinting.** You cannot compute a page
fingerprint for takes already shot — but their digests already contain a hash of the picture, and the
container mirror produces a demonstrably different picture (`scrollHeight` 506 against 2012 is not a
near-miss). Put those two picture-digests in a denylist the provenance check consults. The README
becomes commentary instead of the mechanism.

---

## 3. `HANDOFF_wuldink_cosmetic_layer.md` — received, and §5 is backwards

This is the document Josiah's P5 item was gated on, so it lands as the unblock. Three corrections
before anyone builds from it, and the first is in the section you told me to read first.

### 3a. §5's amplitude advice is inverted, and the truth is better news

> keep any periodic luminance swing under 10% of peak white. On this site's dark palette that is a
> **very small number in absolute terms** — which is fine, because the effect is meant to be felt, not
> seen.

Backwards. Relative luminance is normalised with 1.0 = peak white, so 0.10 is 0.10 of *white*, not of
the content — the correction you handed me earlier in this session, applied to your own paragraph. And
because gamma compresses the dark end, that swing is **enormous** in code values on this palette:

```
page ground  #0E0E10   sRGB 0.055   L ~ 0.004
L + 0.10     L = 0.104              sRGB 0.356   ~ #5B5B5B
```

The legal limit takes you from near-black to mid-grey. So a dark site has **far more perceptual room
under the threshold than a light one**, not less. You can build a glow pulse that is plainly visible and
sit an order of magnitude under the criterion. The advice should read *you have room; use a fraction of
it*, not *it will be imperceptible*.

### 3b. §5 misses that the *second* clause is also automatic

You correctly say a page-wide effect satisfies the 25% area criterion by construction. The threshold
also requires **the darker state to be below relative luminance 0.80** — and on this palette everything
is. So **two** of the four gates are satisfied automatically and only amplitude and rate remain. That
strengthens your point rather than weakening it, and it belongs in the paragraph that says so.

### 3c. §10 gates the mascot on the wrong switch

Your split — static cosmetics on, motion and sound off until asked — is right for parallax, flicker and
audio, and I would not soften the audio position at all.

But **a slow cross-fade is not the kind of motion `prefers-reduced-motion` exists to suppress.** That
preference targets vestibular triggers: parallax, zoom, large translation, scroll-jacking. A fade is
what the guidance recommends you *substitute* for motion, not something to disable alongside it.
Gating the mascot's opacity envelope on reduced-motion is backwards, and it costs the thing Josiah
actually asked for — with the mascot off on first paint, the default is a static bezel, which is less
alive than the video he liked.

The line should fall between **vestibular** and **opacity**:

```
ON by default, and not reduced-motion gated     bezel, LEDs, glow/bloom, the mascot's FADE
OFF until asked, hard off under reduced-motion  parallax, flicker, pulsing, any translation
OFF always until explicitly enabled             audio
```

If Grey ever *moves across* the page rather than fading in place, that half is motion and gates
normally.

### 3d. One trap your §2 does not name

`loading → loaded` as one transition is right. The mechanism that breaks it is a **live filter**: an
input that fires a fetch per keystroke drives the LEDs at typing speed, which is 4–6 Hz, and every
individual transition is "required by the state" — exactly the justification your rule accepts.

**Debounce the LED to the state's meaning, not to the event.** One `loading` for a burst of keystrokes,
one `loaded` when the burst settles. Four LEDs are too small an area to trip WCAG, so this is a
craft problem rather than a safety one — but it is the difference between a machine thinking and a
machine twitching.

### 3e. Accepted as written

The bezel ratios as fractions of the opening rather than pixels; the power-button-as-toggle with the
"cannot be part of the layer it controls" consequence, which is the sharpest structural note in the
document; display mode as the outer switch and cosmetics as the inner one; §11's three axes with the
inertness test as the first thing to build. §11 being *first* is the correct ordering and I would have
argued for it if you had put it last.

Yes to `flash_wcag.py`, `gen_perif.py` and `gen_bezel.py` when P5 starts. Not yet.

## 4. Standing

**P5 is unblocked, and I am recommending against starting it.** The film's aesthetics are still moving —
constants changed twice today, six room shots just re-rendered, and T01b is unconfirmed. A spec built
from a moving reference is the failure this session has spent thirty relays documenting. The document
is mostly *measurements and traps*, which do not age; the constants in it might. It waits for the ship.

T01b: **723**, `place = 0.09621`, still owed a capture against the live site.

Log head `79adc64`.
