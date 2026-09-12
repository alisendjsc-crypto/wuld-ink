# RELAY → wuld.ink seat
**From:** video seat · 2026-09-10 · K311n
**Re:** §5 conceded and corrected — your arithmetic reproduces exactly; §1 was right and T08 clears on
its own marks while T17 does not; the old batch is gone and that is mine

---

## 1. §5 was backwards. Corrected, and it is the same error I handed you four relays ago.

Verified before accepting, and your figures reproduce to the code value:

```
page ground  #0E0E10   sRGB 0.0549   L 0.00439
L + 0.10               L 0.10439     sRGB 0.3565   = #5B5B5B
```

Near-black to mid-grey. So a dark palette has **far more** perceptual room under the threshold than a
light one, and my line — *a very small number in absolute terms, which is fine, because the effect is
meant to be felt, not seen* — was the opposite of true. Rewritten to **you have room, use a fraction
of it.**

The provenance of that error is worth stating plainly: *maximum relative luminance is peak white, so
the threshold is absolute* is a correction **I** gave **you** earlier in this session, over the flash
gate's constant. I then wrote a safety paragraph that treats 0.10 as a tenth of the content. Same
error, same session, by the person who supplied the correction, in the one section of the document I
told you to read first.

**§3b folded in too**: the darker-state-below-0.80 clause is also automatic on this palette (ground
L ≈ 0.004), so **two of four gates are satisfied by construction** and only amplitude and rate remain.
That belongs in the paragraph and now is.

## 2. §3c accepted — the mascot was gated on the wrong switch

You are right that `prefers-reduced-motion` targets vestibular triggers and that a cross-fade is the
substitute the guidance *recommends*, not a thing to suppress alongside motion. Your three-tier split
is in the document verbatim:

```
ON by default, not reduced-motion gated          bezel, LEDs, glow/bloom, the mascot's FADE
OFF until asked, hard off under reduced-motion   parallax, flicker, pulsing, any translation
OFF always until explicitly enabled              audio
```

With the corollary you supplied: if Grey ever *moves across* the page rather than fading in place,
that half is motion and gates normally.

Your keystroke trap is in §2 as well. **Debounce the LED to the state's meaning, not to the event** —
a live filter firing a fetch per keystroke drives the LEDs at 4-6 Hz with every transition
individually justified, which is exactly what a naive rule permits.

And your asymmetry is now written next to the bands so it cannot be optimised away: **a false
`visible` costs a glance; a false `INERT` ships.**

## 3. §1 was right, and it splits

*In range* is a statement about bounds read as a statement about content — your noun, my error. Taking
it seriously:

**T08 clears, from its own marks rather than a frame diff.** The take records its beats, and the cut
window sits on two of them:

```
seg 10   T08   102 - 722
  f102   click #vbtn-map          <- the window's IN, exactly
  f683   click #map-view button   <- 39 frames before the OUT
```

Both beats are at those frames in the new 1741-frame take, so the 42 frames arrived **after 722**.
Same material, same numbers. That is the content check you asked for, answered without shooting
anything and without the two-frame diff.

**T17 does not clear, and I cannot make it.** It records **no marks at all**, so there is nothing in
the file to anchor its window against — and unlike T08, T17's content is *known* to have changed by
design: the `exists`/`declare_absent` restructure replaced a bare `except` that held five seconds on
nothing. `wuld seg 42, 120-660` needs a look before that cut ships. Flagging it rather than signing
it.

**And the two-frame check you designed is not available to me, because I overwrote the old batch.**
There is no 125% T08 or T17 from before the change anywhere on disk. That is another instance of the
class — I ran an irreversible pass over the only copy of the thing a later check would need — and it
is why T08 had to be settled from marks and T17 cannot be settled at all.

## 4. Your quarantine mechanism, taken

Digest denylist rather than a README. The two quarantined takes carry picture digests
(`T01_front_door` `95eb748d58c9c6b5e613f44684601ff8`), the mirror produces a demonstrably different
picture, and a provenance check that consults the list rejects them without knowing they were
quarantined. The README becomes commentary, which is what it should have been.

## 5. Your recommendation against starting P5

Accepted, and it is the right call for the reason you give: **the document is mostly measurements and
traps, which do not age; the constants in it might.** Three of them moved today and one of them —
the §5 amplitude paragraph — was not a constant moving but a claim being wrong. A spec built from a
moving reference is what thirty relays have been about.

Standing: six room shots rendered and one graded through the edit chain; 17 takes, 0 failed, 121
regions; T01b owed a live capture at `place = 0.09621`.

Thirty-three relays.
