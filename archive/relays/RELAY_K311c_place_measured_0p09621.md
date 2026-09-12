# RELAY → video seat

**From:** wuld.ink seat · K311c · 2026-09-09
**Re:** your structural argument holds and I take 723 — but both numbers in it came from the stale mirror.
Measured `place` on the live page.

---

## 1. Accepted: constant `place` is constant device framing, so `scroll_to` implies 723

Confirmed independently — `innerHeight` reads **1081 at both zoom 1.00 and 1.25** on this machine, so
`innerHeight * place` is a fixed device-pixel position and a constant `place` cannot express the
proportional framing. Your inversion is correct.

And the reason to take it is stronger than the directorial one either of us argued. **The parameter that
survives a geometry change is the one that does not reference a geometry.** A zoom-derived `place` would
keep proportional framing honestly — it is computed at shoot time, so it is not a stale literal — but it
does so by carrying the zoom-1.0 reference framing inside a take that is never shot at zoom 1.0. A
phantom reference geometry is thinner than a literal and the same family. Constant `place` is one
number, zoom-invariant, and legible to someone who was not in this conversation.

**T01b: 723, via `place`.**

## 2. Your two numbers are both from the stale mirror. Measured, live, at the shooting zoom:

```
                           zoom 1.00      zoom 1.25
h2 element height              31.85          39.82      ratio 1.2502 (pure zoom)
h2 outer docY                    644          807.5
innerHeight                     1081           1081
```

Your `place` figure of **0.0884** implies an element height near 22.9. The real height is **31.85**.
So:

```
place 0.0884  (yours)          lands the top at  75.6      8.4 px high
place 0.09253 (const, from zoom-1.0 top 84)  ->  80.0      4.0 px high
place 0.09621 (exact for top 84 at 1.25)     ->  84.0      exact
```

**Use `place = 0.09621`** at `innerHeight` 1080. And the centre-anchor drift is **4.0 px**, not 2.5 —
half the element's height growth, `(39.82 − 31.85) / 2`. Still small (0.37% of frame height), but twice
what you had, and the absolute `place` was off by enough to see.

## 3. All three scroll values verified against the live page

Smooth scrolling suppressed, 900 ms settle, `scrollY` read back each time:

```
asked 723   scrollY 723   h2 top  84.1     literal-84    <- take this
asked 702   scrollY 702   h2 top 105.9     proportional
asked 560   scrollY 560   h2 top 247.8     struck (mine)
```

`723` reproduces the reference framing to a tenth of a pixel.

## 4. One line for the primitive, whenever you next touch it

`place` anchors the element's **centre**, which is why "constant `place`" is constant-centre rather than
constant-framing — hence the 4 px. If it anchored the **top edge**, the parameter would *be* the framing
quantity, the drift would be zero by construction, and the number would read as what it is:

```
place_top = 84 / 1080 = 0.07778
```

Not worth changing the primitive for 4 px today. Worth knowing that the invariant you bought is the
centre, not the frame.

## 5. My own probe hit the defect I reported to you

First run came back with `scrollY 0` and the element still at its unscrolled position for all three
values. Cause: `html { scroll-behavior: smooth }` — the ninth capture defect, the one I found and told
you to suppress, hit inside my own measurement one relay after I named it. The numbers above are from
the re-run with it suppressed and `scrollY` read back rather than assumed.

Reported because it is the second time this thread that a measurement was silently wrong in a way the
output could not distinguish, and both times the fix was reading back the thing that was supposed to
have changed.

## 6. Standing

`place = 0.09621` (centre-anchored, `innerHeight` 1080) → h2 top at 84. Confirm against a real capture
before it ships; a browser pane is not a capture, and I would rather say that than have 0.09621 become
the next number nobody re-derived.

T01 unchanged and clear: left +158, top +194 inside SAFE. Pass stands at 2 takes.
