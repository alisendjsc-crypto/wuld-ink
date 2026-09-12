# Session 1 — open

**From:** the unattended run, 2026-09-11, 03:30 MST slot · **Itinerary:** §A1–A5, complete
**Read order:** this, then `corpus_survey.md`, then `corpus_sheet.md` if you want the lines.

---

## Delivered

| file | what |
|---|---|
| `corpus_sheet.md` | 319 card-capable lines from all 21 files, sourced to file and line, tagged register / cluster / proposed movement / length, flagged where flagged |
| `corpus_survey.md` | what the corpus contains, and what it does to the plan's §1 |
| `try_alternation.py` | flash-gate probe, 20 self-tests passing, **verified against `flash_wcag.py` on four real encodes** — transition count, flash census, per-second rate and verdict all matched |
| `SESSION_1_OPEN.md` | this |

Nothing settled, nothing published, libshow untouched. Both folders reached; no blockers.

---

## What I found

**The corpus is bigger and readier than the plan assumed.** 319 usable lines; 245 of them already
90 characters or under; four blocks that are finished sequences and should not be re-ordered —
the `A Fool's Hope` closing incantation (15 cards, ends on your deliberate blank), the `A Life
Inside` litany (16), its eight negations, the 2012 `Prelude I` principles (8, and two of them are
both numbered 6).

**The thesis survives and comes back sharper — from your own hand.** `THE TORCH THAT WALKS ALONE`
states §1's mechanism better than §1 does: *"the desire to die is always a symptom to be treated
rather than a position to be respected"*, and *"not as wound, not as tragedy, but as condition."*
Its version locates the psychologising in **sympathy** rather than contempt — the nurse, the peer
who survived and means it with love. Harder to answer, much harder to wave off as persecution.

**The fragile part isn't §1. It's §2.** The plan says of the twenty files, *"It is the script."*
It is two scripts in two registers that make opposite cases, and the film can't run both. 48 lines
are first-person damage testimony and they are the best-made things in the corpus. Put them on
screen and the Tier 1 reading arrives by invitation, in your voice — which is the plan's own
argument against gore, applied consistently.

**Luminance alternation has almost no rate budget.** Measured on real encodes, not derived: the
project's gate passes full-frame black/white at a **20-frame hold — 3.00 state changes per second**
— and fails at 19 (4 flashes/s). One cut every third of a second. "Vicious" cannot be bought with
rate; it has to come from hue, area or amplitude. The probe reports all four levers on every run,
and it predicted all four of those encodes exactly.

---

## What surprised me

**`Hostile OS 2.txt` is not prose — it's a web page, and it's your structural figure already
built.** An entropy engine that compounds decay on every visit until the page collapses, with a
reset key so it can never finish. That is *the frenzy that attempts and fails to complete its own
destruction*, running, in code. `Frenetic apophasis.txt` concludes English has no word for it; you
had already implemented it two files away. It is also the method `gen_degrade.py` wants. (It's
broken as it stands — empty arrays, the excavate mechanic can't run. `Hostile OS.html` next to it
may be intact; I didn't open it, outside the named set.)

**Two of the nineteen "own prose" files aren't yours.** `To the Reader.txt` is Baudelaire's *Au
Lecteur* in the Aggeler 1954 translation — I extracted nothing from it. `Nothing is Alright.txt`
credits its first part to Cioran via Zarifopol-Johnston. Three more files are model output
(`Frenetic apophasis` entire, and the DeepSeek blocks in `Ruin Your Life` and `Long Winding Road`).
All logged, none extracted.

**The gate is about 2× stricter than the criterion's conventional reading.** `flash_wcag.py` pairs
every *adjacent* opposing transition, so flashes/s comes out equal to cuts/s rather than half.
The ITC convention counts one flash per up-down cycle, which would put the ceiling near 6 changes/s
instead of 3. The probe reproduces the gate rather than arbitrating it — a probe that disagreed
with the gate would be worse than none — but that 2× is real design budget and it's currently a
choice nobody made on purpose.

---

## The three that need you

**1. Which register is the film's voice?**
This is the whole design and it blocks B3 and B4. The Torch register holds the position *as
position*; the `A Life Inside` / `A Pile of Dust` register is testimony and supplies the wound.
My recommendation is in `corpus_survey.md` §0 — Torch as voice, confessional demoted to a movement
held at arm's length — but it is a recommendation about your own material and it isn't mine to
take. Related and awkward: `Prelude I` line 1 does the psychologising move itself, in your hand,
about your own work. That doesn't break §1; it makes it asymmetric in a way the plan doesn't
anticipate. `corpus_survey.md` §3.2.

**2. `Nothing is Alright.txt` lines 1–15 — yours, or Cioran's?**
The credit block is explicit but may be describing the two halves of a *video* rather than the two
halves of that file. Eight strong lines are held pending your answer. One clue, not a resolution:
line 11 uses *ad nihilum*, which you assembled yourself in `Ruin Your Life.txt`.

**3. `THE TORCH THAT WALKS ALONE` — written, or drafted?**
Its register breaks from the other twenty files: sectioned, essayistic, Latin mottoes with
translations, and emphasis markup lost in a rich-text export. I'm asking only because **question 1's
recommendation rests on this document.** If the film's answer to "can this position be heard as
argument" is spoken in a voice that isn't the one in dispute, that's worth knowing before it's
load-bearing rather than after.

---

## Also open, cheaper

- **§1's actual test is still outstanding** and §A was never able to do it — the corpus is your
  writing, not evidence about McCarthy or Pizzolatto. One question against both re-watches: *is
  White or Cohle ever allowed to be simply right, in a scene that doesn't also remind you what
  happened to him?* One counterexample retires "only" and leaves "characteristically", which is
  the version worth building on.
- **The third act doesn't fit the corpus.** *Mori angustia* promises the anguish of dying; the
  corpus answers with the serenity of never having been. Rename the act or write into it.
  `corpus_sheet.md` §2.
- **`God is Not On Your Side` line 2** opens with a second-person imperative to die. Aimed outward
  in context; on a card it reads as an instruction. Flagged, not proposed — your call.
- **The title comes from the material that was cut.** *Chronicles of Horror* ← *"chronicles of
  sadism"*, `Blood Footprint` line 2. Not an objection. Just true, and the title decision is on
  the list.

---

## Using the probe

```
python3 try_alternation.py --selftest
python3 try_alternation.py --alternate "#ffffff,#000000" --hz 12 --area 1.0 --sweep
python3 try_alternation.py --alternate "#c8005a,#00915e" --hz 20        # opposite hue, passes
python3 try_alternation.py --alternate "#ffffff,#000000" --hz 20 --area 0.25   # inset, passes
python3 try_alternation.py pattern.json --fps 23.976
```

It reports where a pattern sits on all four of the criterion's conjuncts — amplitude, darker end,
area, rate — because breaking any one of them passes the sequence at any speed. `--sweep` returns
the shortest hold that still passes. Feed it the luminance of the **bright region** of each state,
never the frame mean; a mean under-reports and the tool will return a false pass, for the same
reason the old 40/255 gate did.
