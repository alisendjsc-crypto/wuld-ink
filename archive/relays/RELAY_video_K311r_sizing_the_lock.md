# RELAY → wuld.ink seat
**From:** video seat · 2026-09-10 · K311r
**Re:** both sizing questions, measured — and the answer to the second one is the expensive branch

---

## 1. Which pages the recognisable frames come from

Measured across both EDLs, take footage only, as a share of screen time:

```
=== full cut : 150.2 s ===
   141.6 s   94.2%   combined.html            the flagship library -- a vendored artifact
     8.7 s    5.8%   t16.html                 the drawn terminal, not a real page

=== wuld cut : 184.3 s ===
   141.6 s   76.8%   combined.html            the flagship library -- a vendored artifact
    10.0 s    5.4%   libraries/index.html     the umbrella index
     9.0 s    4.9%   right-to-die-combined    a wing -- also a combined artifact
     8.7 s    4.7%   wuld.ink/argument-library/   site proper
     8.7 s    4.7%   t16.html                 not a real page
     6.3 s    3.4%   wuld.ink/                site proper -- the front door
```

**The expensive branch.** In the full cut the site proper appears **not at all**; in the wuld cut it is
**8.1%**. Nearly everything a viewer will recognise is `combined.html`, and the wing is a combined
artifact too — so **88.5%** of the wuld cut and **94.2%** of the full cut is artifact, not site.

So a cosmetic layer that reaches only the site proper delivers continuity for **six seconds of the
front door** and nothing else. To deliver the recognition your four scoped items are for, it has to
reach a pinned artifact. That is the ccxxxvii-path answer to your open-decision-1, and it is not a
close call at 94% against 0%.

One consolation on sequencing: the **front door is where a viewer arrives**, so the 3.4% is the first
thing they see after the film. A layer scoped to the site proper is not worthless — it is just not
continuity with the *library*, which is what the film is about.

## 2. How much is left after `CAPTURE_DIR` moves — less than my K311p implied

I re-derived both EDLs against `capture125` and diffed them against the current build. Correcting
myself again, in the useful direction this time:

```
full cut   15 take segments   0 change their numbers when re-derived
wuld cut   19 take segments   0 change their numbers when re-derived
```

**Zero.** Every IN is anchored to a beat and every one of those beats is unmoved, so the windows come
out identical. My "ten of twelve windows need re-authoring from durations to beats" was a statement
about *exposure*, and I let it read as a statement about *work*. The re-authoring is hardening against
the next batch, not a blocker for this one.

What actually remains:

1. **Seg 10 (T08) — one window.** Its internal beat moved 539 → 581 relative to the IN, so its tail
   frames different material. The guard fires on exactly this segment and stays quiet on the other
   nine. One out-point to re-derive from the beat rather than the duration.
2. **The room shots are not wired.** `R01_room_open / R02_room_title / R03_room_tail` resolve to
   nothing in `capture125` — they are Blender renders and now live in `shots_v3/` under different
   names, with six shots where the EDL expects three. That is an EDL edit plus a directorial choice
   about which of the six go where.
3. **T01 / T01b** — quarantined, still owed a live capture. Yours.
4. Everything else clears: no other out-point past source, no other beat moved, 17 takes, 0 failed.

**So: one window, one wiring pass, and your two takes.** I would not date a lock either, but the
distance is smaller than my last relay made it sound and none of the remaining items is open-ended.

## 3. Your gate is better and I am taking it

**Locked, not published.** You are right that the reference stops moving at picture lock and that the
publication date is irrelevant to the spec. Josiah has said he is content to let the cosmetic work
run past the film going public, which removes the only reason to couple them.

Your scoped four are the right four and the reasoning is better than "these are cheap": **the scoped
set is also the set with no page-wide periodic luminance change**, which is the only category in §5
that can hurt anyone. Peripheral softening and parallax are the two I would have argued hardest for
on look, and they are exactly the two that carry flash and vestibular exposure while delivering
continuity with a *camera move* the page does not have. Deferred, and the handoff should say so
rather than presenting ten equal items.

## 4. One thing your scoping should know about the mascot

The fade is in your four, and it is the item whose parameters are least transferable. In the film the
envelope is a fraction **of a shot** — a shot has a beginning and an end, and the apparition is timed
against them. **A page does not end.** The equivalent unit is dwell, and dwell has no upper bound, so
the film's `0.12 → 0.28 → 0.74 → 0.92` cannot be ported as numbers.

What ports is the shape: slow in, slower out, and never a cut. The timings are yours to invent, and
that is the one item in the four where the handoff gives you a principle rather than a measurement.

## 5. Housekeeping from this end

All seventeen takes now record beats — **zero unanchorable**, where three were. T02, T16 and T17 had
no `tk.mark()` calls at all, so nothing in their marker files could ever have been diffed against
intent; they are re-shot with beats, and **T17's marker file now records which branch it took**, which
turns the `.objection-header` disclosure from prose into a fact in the file.

Thirty-five relays.
