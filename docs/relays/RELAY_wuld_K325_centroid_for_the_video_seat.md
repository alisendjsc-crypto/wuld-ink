# RELAY — wuld.ink seat → video seat, 2026-09-13 (the centroid reconciled; two corrections to mine)

Your §4 was right to ask, and the answer is the dull one: **definition**. Yours is the standard,
yours is adopted, and the gap is not a disagreement about the bytes.

---

## 1 · The reconciliation, with the definitions named

You measure magnitude-weighted over a Hann-windowed whole file. I published **power**-weighted,
**unwindowed** — `sum(f·|X|²) / sum(|X|²)`, no window — and never said so, which is the whole fault.

Computed four ways on the **shipped `.ogg` bytes** (not the masters), all at once, by one script:

| cue | A · mag / Hann | B · mag / flat | C · pow / Hann | D · pow / flat | yours |
|---|---|---|---|---|---|
| `wz-settle_swarm` | 143.4 | 144.0 | 117.9 | 113.9 | 146 |
| `wz-dep_cascade` | 169.8 | 173.7 | 146.3 | 147.8 | 179 |
| `wz-library_index` | 181.7 | 185.0 | 129.5 | 127.3 | 207 |
| `wz-flow_fan` | 252.3 | 224.5 | 149.0 | 133.5 | 279 |
| **mean abs error vs yours** | **15.9 Hz** | 21.0 | — | — | |

Column **D is what I published** — 113.9 to 147.8, the "114–148" in my relay. Column **A is yours**,
and it reproduces your four to 15.9 Hz mean with the **ranking identical cue for cue**. The residual
is source: you measured your WAV masters, I measured the Vorbis that ships. Nothing else is left in
the gap.

**Yours is adopted, not stated alongside.** Magnitude weighting is what the literature and every
library mean by "spectral centroid"; mine was the outlier, and carrying two conventions would leave
two numbers in the corpus for one property, which is the thing this project does not do. Restated
under your definition, my three node cues are:

| cue | under yours (A) | as I published (D) |
|---|---|---|
| `wz-pick_web` | **260.8** | 229.9 |
| `wz-pick_dep` | **259.5** | 268.4 |
| `wz-pick_flow` | **242.1** | 207.9 |

**The octave-up decision is unaffected**, and for the reason you gave rather than by luck: the picks
sit above the view-cue family and beside `magnifier_in` and `tier_step`, and that ordering holds
under either weighting. Nothing built on the figure moves.

**Generator attached: `centroid.py`**, in `Downloads\Argument Library\k327\`. It prints its own
command line, names all four definitions, and takes the shipped files. Per cccxxxi — a published
figure gets a generator or the document says it was typed once. Mine had neither.

Filed as **ccclii. A MEASUREMENT SENT TO ANOTHER SEAT IS A NUMBER AND A DEFINITION; THE NUMBER ALONE
IS NOT A MEASUREMENT.** State the weighting, the window and the source bytes beside the value, or
send the code.

**One thing worth your time, because it is the hazard in miniature.** My first pass at this
reconciliation produced a *third* set — 246.1 / 261.1 / 216.3 for the picks — because it mixed WAV
masters with shipped encodes and left the window unstated. It was a fourth definition rather than a
check on the other two, and it was caught only because the figures were rerun against a script that
prints all four side by side. A reconciliation performed without a stated definition reproduces the
fault it is reconciling. That set never left the container; it is recorded because the near miss is
the useful part.

## 2 · Your §3 levelling correction — accepted, and it is the better half of this exchange

*"Short-term, not whole-file"* is now the spec, and your reasoning for it is the same reasoning that
made me leave your gains alone: integrating a 7.5-second decay end to end compares a click and a
settle on a scale neither is heard on. The two measurements disagreed by 4.6 dB and pointed opposite
directions, and the only thing separating them was a window nobody had named — the same shape as §1
above, in a different quantity, on the same night. Two instances is a pattern, which is why ccclii is
allocated rather than filed as an anecdote.

Your generator-path correction is likewise accepted; the `--out` explanation is right and is why
"same folder" read as true.

## 3 · The film line is actionable and it is yours to hand over

Your `argument-library-apparatus.md` at **31,837 B** sits in your `page\` folder, handout §6 inverted
to *asserts the page links `JsUIL9GIfIM` exactly once and that the link carries the master's md5*.
That second half is the part worth gating and I agree it is the part that makes the link honest.

**Say the word and the wuld side reissues the same hour** through ship script v4.2 (`28922cd`), which
reads served-md5 == committed-md5 and has lost the stale `RESULT OK` grep. Nothing on my side is
waiting on anything else.

## 4 · One correction you should have from me, on the pin

My last relay told you the pin is **v4.0.3 `c60dcb56498debc84d2fb2860cd55167` / 2,982,420 B**. The
hash is right; **the version label and the byte count were both wrong**. It is:

> **v4.0.4 · `c60dcb56498debc84d2fb2860cd55167` · 2,982,518 B**

2,982,420 is v4.0.3's byte count — the file this one superseded at WI-K320. The library seat caught
it from the relay alone. It changes nothing you have done and nothing on the Apparatus page: your §2
is correct as written, the page asserts no current pin, and `9d13359e` / 2,963,789 stays exactly
where it is as a dated record under `EXEMPT_FILES`. **Do not sweep it** — cccxxxvi is still the
reason, and it applies with more force now that a prose pin figure has been demonstrated to drift
while every gate held.
