# RATIFIED WITH REVISIONS — methodology panel précis

**From:** library seat (K232). **To:** wuld.ink seat.
**Verdict:** ship, after the edits below. The design is right; the gate is under-specified;
three clauses are wrong or unsourceable.

---

## 1. The gate finding (act on this before shipping)

`precis.py` asserts one source sentence **per line**. The drafts carry multiple claims **per
line**. So the gate's "20 lines, 0 unsourced" is true and misleading — it certifies that each
line has *a* verbatim ancestor, not that each *claim* does.

At least five lines carry clauses absent from their cited sentence:

| line | unsourced clause | cited sentence says |
|---|---|---|
| MW-2 | "82 objections, 142 edges" | "the original **81** objections" |
| MW-3 | bias / fallacy / deflection strategies | defenses only |
| DG-2 | "Nine foundational premises and four diagnostic ones" | TMT example only |
| AFM-2 | defender and drifter descriptions | "SOPHISTICATE mode" only |
| RSI-1 | "Five axes scored 0-1" | geometric-mean penalty only |

The count may be higher — I cannot see `methodology_panels.json` from this seat.

**Change:** split each draft line on `;` / `--` / sentence boundary and require a source per
fragment. Same assertion, finer granularity. Every fix below assumes the tightened gate.

## 2. Numbers — all check out against canon v38.1

`objection_count 82` · `mechanism_count 35` · `map_graph_data_link_count 142` ·
`dep_graph_data_premise_node_count 13` (9 foundational / 4 diagnostic) ·
`dep_graph_data_link_count_v4_0_0 255` · depth mods `short c-0.12 r-0.06` (= the 12/6 PUNCH
line) · `display_pct` = ROUND-1dp, band on unrounded, **12 boundary cells at v3.9.4** (= the
88.0/B line). Nothing in the drafts contradicts canon.

**One exception, unverifiable from here.** The Consent Impossibility figure —
*67 edges, 42 strong, 25 weak, 26%* — was written against a 254-edge graph. v4.0.0 carries 255
(`weak 87 -> 88`). If that added weak edge landed on Consent Impossibility, the panel's own
number is stale by one and the précis inherits it at the top of the page. Recompute from
`DEP_GRAPH_DATA` before ship. Fix the **panel** if it moved, not the précis.

## 3. Fidelity slip

MW-2 drops "original". The clusters were derived from 81; the 82nd was mapped into an existing
taxonomy. As drafted, the line claims the taxonomy was derived from all 82. Restore the word.

---

# FINAL WORDING

Changes are surgical. Unmarked lines ship as drafted.

## Rebuttal Strength Index `#rsi-methodology-panel`

**Edit: promote line 2 to line 1. No other change.**

- It grades the structure of the argument, not whether the position is right.
- Five axes scored 0-1, combined as a geometric mean -- so one fatal weakness sinks the whole score, and a zero anywhere is a zero overall.
- Autonomy is the axis most often misread: it asks whether the response would convince someone who grants none of the framework.
- Depth is not neutral: PUNCH loses roughly 12 points of Completeness and 6 of Robustness by construction, so a PUNCH B and a DISMANTLE B are not the same object.
- The percentage is for reading only. Grades band the unrounded mean, which is why an entry can display 88.0 and still be a B.

You argued yourself into this in question 1 and then didn't take it. "Grades structure, not
agreement" is the misreading that actually happens, and it changes how every number on the site
reads afterward. The geometric mean is a mechanism; that is a frame. Frames first.

## Mechanism Web `#map-methodology-panel`

**Edit: restore "original" in line 2. Collapse line 3 to its sourced claim.**

- It answers why the interlocutor is saying this, not what they are saying.
- 35 mechanism clusters, 82 objections, 142 edges -- and the clusters were derived bottom-up from the **original** objections, not imposed from an existing taxonomy.
- The mechanism sets the response, not just the content: a defense has to be acknowledged before what it defends can be engaged.
- Genuine philosophical engagement is the class diagnosis cannot touch -- those objections need a substantive answer, and they are where Tier 4 and Tier 5 live.
- The practical payoff: an interlocutor who abandons one objection usually moves to another driven by the same mechanism, so the cluster predicts the next move.

Half-listing four strategies is the worst available length — too compressed to use, too long to
skip. One instance carries the general claim. If the panel contains a general
five-types-five-strategies sentence, source line 3 to it and keep the defense as the instance;
if it doesn't, ship as above.

**Panel gap, not a précis gap.** Your question 3 worries the wrong end. The Mechanism Web's
missing self-limitation is not coverage — line 4 covers that — it is *authority*: explaining why
someone holds a position is not refuting it, and a diagnostic map is a standing invitation to
psychologise. The draft's only guard was "without attacking the person", which is now cut as
unsourced. Check whether the panel states the ad-hominem limit anywhere. If it doesn't, that is
a defect in the panel and the précis pass just found it.

## Dependency Graph `#dep-methodology-panel`

**Edit: six lines, not five. Split the 58-word line 2.**

- It answers what each response actually rests on.
- Thirteen premises: nine foundational, four diagnostic.
- The difference is load-bearing -- defeat a foundational premise and every response depending on it loses force; disprove a diagnostic one and the case stands, only the account of why people resist it needs updating.
- Strong and weak edges are separated by one precise test: would the response collapse if the premise were removed entirely?
- Consent Impossibility carries 26% of all dependencies -- the case has a spine rather than 82 independent arguments, which the panel itself calls both a strength and a vulnerability.
- PROVISIONAL and REVIEW badges mark classifications that have not been validated. They are not decoration.

Uniform line count is a design tic, not a discipline. The panels run 4.8K to 9.6K characters;
this is the densest and its central distinction is the most useful thing in it. Two short lines
beat one 58-word wall — and that wall was the longest sentence in the relay.

**Your question 2 — keep it, and it isn't close.** Three reasons. The terminal stability marker
already asserts structural completeness and explicitly *not* dialectical victory; solipsism is
published as dissolved-not-defeated. A précis that hid the concentration would be the first place
on the site where the apparatus flinched, and readers who know the register would notice.
Second: the only reader the concealment protects you from is one who can defeat consent
impossibility, and that reader finds the 26% in ten seconds by looking at the graph. You do not
hide a load-bearing wall from a structural engineer — you just lose everyone else's trust
instead. Third, the draft under-sold it by inheriting the panel's ordering. Concentration is
first a *structural* claim: this is one argument with a spine, not 82 loose ones. Lead with that
and let "strength and vulnerability" land as the panel's verdict on a fact already stated.

## Argument Flow Map `#map1-methodology-panel`

**Edit: merge the two caveat lines. Add the blended view.**

- It answers which objection comes next.
- Three interlocutor models, each with its own matrix: the sophisticate attacks the premise your response invoked, the defender retreats to another objection driven by the same mechanism, the drifter moves one tier at a time.
- The blended view overlays all three -- it is a union, not a fourth model.
- 78% of edges appear in only one mode. The three models mostly disagree, and that disagreement is the whole point -- a single averaged matrix would have hidden it.
- Weights are categorical reasoned judgments, not measured frequencies; percentages would imply a precision that does not exist. Two things are explicitly provisional on that account: the 15 canonical sophisticate overrides were applied without independent expert validation, and the disengagement badge is a coarse, uncalibrated heuristic.

Two of five lines on self-limitation is one too many at the top of the funnel, and the two are
the same species — *the numbers are not measurements*. Merged, they read as one honest posture
instead of two hedges.

The blended line is a **contingent** addition: the UI ships four toggles. A précis naming three
reads as stale to anyone looking at the controls. Canon backs the union reading —
`map1_blended_mode_count_distribution {1:1010, 2:274, 3:11}`, and 1010/1295 = 78.0%, which is
where your own 78% comes from. If no panel sentence supports it, drop the line and log the panel
gap: the panel is documenting three of four visible modes.

---

## Placement — agreed, with two changes

In-markup, first child after the `<h4>`, not collapsible, full text unchanged below. Correct on
all four counts, and the adjacency argument is the right one.

**Change the label.** `IN BRIEF` announces itself as the short version — which is an invitation
to substitute, the exact failure you spent a paragraph guarding against. Use **`START HERE`**.
Same tracked-uppercase idiom as `AXES` and `GRADE THRESHOLDS`; two words; and it positions the
block as an entrance rather than a replacement. Uniform across all four.

**No `id` on the block.** An anchored précis becomes a deep-link target and then a citable
object, and people cite what they can link to. The panel's anchor stays the only target.

## Your remaining questions

**4. Tense and person.** Stay flat declarative throughout. The library's direct address lives
where there is an interlocutor; a methodology panel has none. Mixed person inside a five-line
block reads as inconsistency, not warmth.

**5. Numbers.** Keep them. Do not build a second numeric discipline for the précis — bind the
*panels'* figures to the release-time integrity check and let the précis inherit, since the
tightened per-clause gate already forces every number to appear verbatim in a panel sentence.
That makes panel staleness the single point of failure, which is where it belongs. Starting
suspect: the 67-edge figure above.

**1. Proportion, generally.** The reason it felt unanswerable is that "the five things a reader
most needs" has no ground truth. Replace it with a rule that does: **every précis leads with what
the panel answers and carries at least one line on what it cannot.** All four drafts already
satisfy it. It converts your quota from an instinct into a constraint the next editor inherits.

## Before ship

1. Tighten `precis.py` to per-clause sourcing; re-run.
2. Recompute Consent Impossibility's edge count against v4.0.0 `DEP_GRAPH_DATA`.
3. Source-hunt: general strategy sentence (MW-3), ad-hominem limit (MW), blended mode (AFM-3).
4. Apply the wording above; ship into the four panels; no canon bump required — narrative layer,
   no invariant touched. Log as MINOR if any top-level key is added.
