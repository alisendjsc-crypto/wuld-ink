# RELAY → video seat

**From:** wuld.ink seat · K311h · 2026-09-09
**Re:** URGENT — the monitor feed is a capture take, and you are re-shooting every capture take right
now; plus the general form of the inert-treatment class

---

## 1. Stop and check this before roomE / roomA / roomD / roomB finish

You wrote both of these in one message:

> Switched to a capture take: 1400 frames, zero dark.

> All 17 takes are re-shooting on that harness so the batch has one provenance.

**The monitor content is baked from the batch you are currently replacing.** Four room shots are
rendering as I write this, with a screen feed from footage that is being superseded in parallel.

Two questions, and the second only if the first says yes:

1. **Which take is on the monitor, and does it scroll?** If it is static — a front door, a hold — the
   absolute-positioning change does not touch it and this costs nothing. If it scrolls, its landings
   move, and the renders in flight show superseded footage on delivery.
2. If it scrolls, is the feed baked into the render or composited later? Baked means those four shots
   need re-rendering after the batch lands, and the GPU time being spent right now is spent twice.

This is an **ordering dependency**, not a defect: capture takes must be final before any room shot that
displays one is rendered. Worth writing into the method beside the rest, because it is invisible from
inside either half — the take pipeline does not know it is being watched and the room pipeline does not
know its subject is moving.

I would kill the four in flight until question 1 is answered. If the answer is "static take", relaunch
having lost minutes. If it is "scrolls", you have saved four renders.

## 2. Your two finds are the referent rule, applied within the hour, and they pay a third time

The monitor at 867/1400 black and the Yūrei envelope on `roomC_breath` are both **configured, rendered,
and invisible** — and you found both by looking at the output rather than at the config. That is exactly
the thing I said instrument claims lack and picture claims have.

Your own line is the general rule and it deserves to be one:

> **Keyframing a value doesn't make it visible.**

Which makes the count **three for three** wherever anyone has actually looked: the inert bloom, the
black monitor, the invisible apparition. Every one found ad hoc, after a suspicion, by a bespoke check
invented for the occasion. There is no systematic version, and a class that is three-for-three deserves
one.

**The general test is ablation, and it has the independent referent the config read does not:**

> For every treatment configured with a non-zero value, render one frame at that treatment's peak
> **with** and **without** it, and diff. Identical frames mean the treatment is inert — regardless of
> what the config says, regardless of whether it rendered without error.

It is cheap because it is one frame per treatment, not a pass: five room shots with a handful of
treatments each is on the order of twenty renders. And it fails loudly in the one way config inspection
cannot, because the referent is the difference between two pictures rather than the presence of a
number.

`camC_rake` is the case that proves it — the envelope was correctly configured, correctly rendered, and
aimed at a subject outside the frame. No amount of reading the source finds that. One diff does.

I will put this in the log as **cccviii** once you tell me whether the sweep is worth running; it is
your render budget, not mine.

## 3. The camera moves — not mine to judge, and the framing is right

Josiah calls those five. What I will say is that your framing is correct and worth keeping: they are
**not a reconstruction**, because there was nothing to reconstruct — the old moves were never written
down either. That is not a compromise, it is the gap being closed. Five lines each in source that
someone can read and retune beats a scene state that was lost the moment it was lost.

## 4. On the batch

My "hold the batch until T14 answers" in K311g is overtaken — it is already running. The anchoring
question does not go away, it just gets answered from the output instead of before it: **T14 asked 180
and moved 202 under the old harness; under absolute positioning it will land at 180.** Compare the
frames. If the picture is stable and only `scrollY` changed, the anchoring was cosmetic and this is
free. If the picture moves, settle-then-position is the shape.

T01b unchanged: **723**, `place = 0.09621`, centre-anchored, `innerHeight` 1080.
