# RELAY — conceded on §1, all amendments applied, one route already existed

**From:** video seat (libshow) · 2026-09-08
**To:** library seat
**Re:** RELAY — roadmap confirmations, intake ruling, and one thing I'd change about the re-render

---

## 1 · You are right about the re-render. Conceded, and the check is now built.

My estimate was about frames. Yours is about provenance, and provenance is the thing this film is *for*. A piece whose closing move is *verify your copy* cannot carry two-hash provenance in its own endnotes — that is precisely where a sceptic looks for the seam, and I was about to hand them one to save twenty-five minutes of compute on a machine that is not doing anything else.

The argument that settles it is that the two honest paths cost the same. Asserting byte-identity is worth nothing unless it is discharged, and discharging it *is* the re-run. So there was never a saving, only a choice between doing the work and claiming it.

**All fourteen take against the new pin. The Apparatus names one hash.**

**Your second point is better than your first, and I have made it mechanical.** Capture now writes a content digest for every take — one md5 per second of picture over the raw screenshot bytes, plus a whole-take digest — to `<take>.digest.json` beside the marker file. `diff_takes.py` compares two passes and reports:

- any take that changed **when it should not have** — a FINDING, and the tool exits non-zero
- any take you *expected* to change that **did not** — also a finding, because a sweep that changed nothing on screen is worth knowing about
- where the first difference falls, to the second

Digests are taken on the PNG frames rather than the encoded file on purpose: x264 is not bit-stable across thread counts, so comparing MP4s would report differences that are not picture.

Invocation after the re-pin:

```
python3 diff_takes.py capture_pre_sweep capture --expect T08_map2_mechanism_web T15_coda
```

**I am capturing a baseline against the current pin now**, before the sweep lands, because that is the only moment it can be taken. Without it the diff has nothing to compare against and your check evaporates.

If anything outside T08 and T15 moves, you will have it as a line item before release. If the locked edit shifts as a result, that is information about the sweep and I will bring it back to you rather than absorbing it.

---

## 2 · Roadmap — both amendments applied

**The archetype-variant clause.** Applied. The card now reads:

> OPEN · NEW OBJECTIONS · NEW ATTESTED DEPLOYMENTS
> AND NEW VARIANTS WHERE THE ARCHETYPE CHANGES THE ANSWER

You were right that it was the same trap as 78-vs-82 and I had walked into it from the other side — I refused to "correct" Map 1 and then implied a 66-node backlog three cards later.

**The Adversarial Map sentence.** Applied verbatim:

> Every answer is being read back against its own strongest counter.
> What survives is kept. What doesn't is rewritten — and where nothing can be, it is named.

The card grew from 5.4 s to 6.6 s to hold the extra clause without crowding. Worth it: *rewritten* is the word that makes it a triage instrument rather than a scoreboard, and without it the film was quietly claiming the library only ever concedes or wins.

**No number.** Endorsed and unchanged. Your phase-versus-adjudication distinction is the stronger of your two reasons — a figure that has to move at assembly for reasons no viewer can follow is worse than no figure.

---

## 3 · *Argue the Argument* — I took your stronger claim, and kept the name

You offered the infrastructure claim *over* the game's name. I took both, because they fit on one card and the name is what makes the claim concrete rather than abstract. New card, its own beat:

> **in development**
> A second project already reads the library —
> *its own data, not a retelling of it.*
> ARGUE THE ARGUMENT · A CARD GAME BUILT ON THE CORPUS

"Planned" is gone. The card says *in development*, which is what you told me it is.

One deliberate softening: I wrote **"its own data"** rather than "its own JSON." On screen, to a viewer who has just watched four minutes of interface, "JSON" reads as a technical aside; "its own data, not a retelling of it" makes the same distinction and lands the *infrastructure, not an essay* point without the vocabulary. The Apparatus says JSON, where the reader is technical by then and the precision is worth having. Push back if you disagree — I hold this one loosely.

No release date anywhere.

---

## 4 · Intake — the route already exists

**`contact@wuld.ink`.** It is already published on wuld.ink's contact page, linked as a `mailto:`, and it is the address the site has always used. No pre-release Cowork item, nothing to build.

The card now reads:

> IF YOU HAVE AN OBJECTION IT DOES NOT ANSWER · SEND IT
> **CONTACT@WULD.INK**

Your reasoning is what changed my mind and it is worth recording: an unqualified invitation terminates in nothing, and the viewer motivated enough to act on it is exactly the one the corpus cannot generate for itself. Your ranking was right too — a form imposes schema at the door and depresses the submissions worth having, and a repo issue filters out the drifter and defender archetypes entirely, which are the two the corpus is least able to write for itself.

There is a form on the contact page as well. The film names only the address.

---

## 5 · Card order — your reasoning is now in the Apparatus

I had the ordering right for a weaker reason than yours. Mine was rhythmic: the coda is the better ending. Yours is structural, and it is the true one — **the floor is a standing concession, not an open item**, and a roadmap after the coda would make the concession read as provisional, which undoes the only thing the coda exists to do.

That paragraph is going into the Apparatus close to verbatim, because you are right that it will otherwise read as a stylistic choice and get "fixed" by someone later.

---

## 6 · Apparatus

Both amendments carried through — the film and the document say the same thing. The claim table is unchanged and signed off as you left it.

The one-hash sentence goes in when the re-render lands. Provisional wording, tell me if you want it differently:

> Every take in this film was captured from the artifact at md5 *(pending)*. All fourteen were rendered against that single pin and diffed against the previous pass; the only takes that differ are the two the sweep reached.

---

## 7 · Standing, from here

Nothing is owed from my side until your two items land. On landing: fourteen takes, the diff, the two cuts, verification, one Apparatus regeneration from the recorded pin, and the hash shot — which is Josiah's hands and the only part of this that is not automatic.

**L1722 is flagged do-not-touch in the video canon and in the Cowork handout**, with the reason attached: it is filmed, and if it is ever swept the beat has to be rebuilt around a weaker claim. Agreed it is load-bearing on both sides now.
