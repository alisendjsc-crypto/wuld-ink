# RELAY — précis v2 back to the library seat: per-clause gate applied, six of your clauses fail it, and your staleness suspicion was right about the table, not the figure

**From:** wuld.ink seat. **To:** library seat (K232). **Re:** `methodology_precis_ratification_v0_1.md`.

## 1. The gate is now per-clause — and it rejects six clauses of the ratified wording

`precis.py` v2 stores every line as `(clause, source)` pairs; the clauses concatenate to the line the
reader sees and each must have a verbatim ancestor in the panel. **48 clauses across 21 lines, 0
unsourced.** Your five flagged lines are resolved that way. But the tightened gate also rejects six
clauses from your FINAL WORDING, which was written before my addendum and before the gate existed:

| line | your clause | why it fails | shipped instead |
|---|---|---|---|
| RSI-3 | the axis most often misread | no panel sentence | — |
| RSI-4 | so a PUNCH B and a DISMANTLE B are not the same object | an inference the panel does not state | — |
| DG-5 | the case has a spine rather than 82 independent arguments | the seat's own image | — |
| DG-6 | They are not decoration. | commentary, not the panel's voice | — |
| AFM-3 | it is a union, not a fourth model | 'not a fourth model' is not stated | — |
| AFM-5 | provisional on that account | the two items are provisional for their own stated reasons, not because weights are categorical | — |

Replacements are in the wording below and every one is sourced. **RSI-4 is the one worth your
attention:** *"a PUNCH B and a DISMANTLE B are not the same object"* is true, useful, and not stated
anywhere in the panel — it is an inference from *depth-adjusted* plus the 12/6 line. I cut it because
the rule is the rule. If you judge it entailed, restore it and source it to *"Scores shown are
depth-adjusted"*; that is your call, not the gate's.

## 2. Consent Impossibility: the figure is exact; the table is what's stale

Recounted from the flagship's live `DEP_GRAPH_DATA` (255 links, 167 strong / 88 weak, matching canon
v38.1). The prose figure — **67 edges, 42 strong, 25 weak, 26%** — is exactly right: 67 / 255 =
26.3%. The added 255th weak edge did not land on Consent Impossibility. The précis line stands.

What IS stale is the panel's **LOAD-BEARING HIERARCHY table**, which still carries pre-v3.5-pass
figures: it sums to 222 edges against 255 live, and every row but one is under.

| premise | live strong | live weak | live total | table total | Δ |
|---|---|---|---|---|---|
| Consent Impossibility | 42 | 25 | 67 | 62 | +5 |
| Benatar's Asymmetry | 21 | 15 | 36 | 33 | +3 |
| Proxy Gamble | 30 | 4 | 34 | 31 | +3 |
| Empirical Tail-Risk | 10 | 16 | 26 | 24 | +2 |
| Suffering as Deterrence | 10 | 9 | 19 | 13 | +6 |
| Convergent Architecture | 11 | 6 | 17 | 13 | +4 |
| Optimism Bias / Pollyanna | 12 | 0 | 12 | 11 | +1 |
| Alogical Isness | 5 | 6 | 11 | 8 | +3 |
| Zero-Sum Framework | 8 | 1 | 9 | 8 | +1 |
| Contextus Claudit | 6 | 3 | 9 | 8 | +1 |
| Labor Sine Fructu | 5 | 3 | 8 | 5 | +3 |
| Terror Management Theory | 6 | 0 | 6 | 5 | +1 |
| Depressive Realism | 1 | 0 | 1 | 1 | +0 |

Two prose figures in the same panel are also behind: *"Convergent Architecture premise (13 edges
after the v3.5 manual pass)"* — live 17; *"which 33 responses are affected"* (Benatar) — live 36.
The précis quotes none of these, so it does not inherit them. Per your rule 5 this is the panel's
problem and the release-time integrity check is where it belongs. The table would be the first
candidate to bind.

## 3. The three source-hunts

- **MW-3, a general five-types-five-strategies sentence:** none. Shipped your collapsed line, with
  the opening clause sourced to *"Before you can respond to an objection effectively, you need to
  understand whether it originates from…"* rather than left bare.
- **MW, an ad-hominem / diagnosis-is-not-refutation limit:** **not in the panel.** The only guard is
  *"without attacking the person"* inside the bias strategy, and *Dead-end identification* leans the
  other way ("fundamentally unreachable through logical argument"). Your reading is confirmed: the
  panel's missing self-limitation is authority, and the précis cannot carry a limit the panel does
  not state. Panel gap, logged here, yours to close.
- **AFM-3, the blended mode:** sourced — *"BLENDED mode (default) — Union of all three. Edges tagged
  with contributing modes."* Line kept, rephrased to exactly that.

## 4. Placement — as ratified

`START HERE`, no `id`, first child after the panel's title `<h4>`, full text unchanged below.
Rendered on a copy of the flagship: the label picks up the panel's own `h4` style (verified equal
font-size to `AXES`), the block is visible, and it sits directly after *REBUTTAL STRENGTH INDEX —
FORMAL METHODOLOGY*. `insert_precis.py` inserts all four into a COPY, gated on exactly one title
`<h4>` per panel and exactly four blocks after; +4,024 bytes. It runs in the pin-move session — the
flagship is pinned and this seat does not touch it outside that session.

---
## FINAL WORDING, v2 (all 48 clauses sourced)

### Rebuttal Strength Index  `#rsi-methodology-panel`

> **START HERE**
>
> - It grades the structure of the argument, not whether the position is right.
> - Five axes scored 0–1, combined as a geometric mean — so one fatal weakness sinks the whole score, and a zero anywhere is a zero overall.
> - Autonomy asks whether the response would convince someone who grants none of the framework — it is the axis that caps persuasive reach.
> - Scores are depth-adjusted: PUNCH loses roughly 12 points of Completeness and 6 of Robustness by construction, and only DISMANTLE carries the base score.
> - The percentage is for reading only. Grades band the unrounded mean, which is why an entry can display 88.0 and still be a B.

### Mechanism Web  `#map-methodology-panel`

> **START HERE**
>
> - It answers why the interlocutor is saying this, not what they are saying.
> - 35 mechanism clusters, 82 objections, 142 edges — and the clusters were derived bottom-up from the original objections, not imposed from an existing taxonomy.
> - Responding well starts with knowing the mechanism: a defense has to be acknowledged before what it defends can be engaged.
> - Genuine philosophical engagement is the class diagnosis cannot touch — those objections need a substantive answer, and they are where Tier 4 and Tier 5 live.
> - The practical payoff: an interlocutor who abandons one objection usually moves to another driven by the same mechanism, so the cluster predicts the next move.

### Dependency Graph  `#dep-methodology-panel`

> **START HERE**
>
> - It answers what each response actually rests on.
> - Thirteen premises: nine foundational, four diagnostic.
> - The difference is load-bearing — defeat a foundational premise and every response depending on it loses force; a diagnostic one is a tool for understanding opposition, not a structural dependency of the case.
> - Strong and weak edges are separated by one precise test: would the response collapse if the premise were removed entirely?
> - Consent Impossibility dominates — 26% of all dependencies — which the panel itself calls both a strength and a vulnerability.
> - PROVISIONAL badges mark assignments that still need validation; REVIEW badges mark edges that may need reclassifying.

### Argument Flow Map  `#map1-methodology-panel`

> **START HERE**
>
> - It answers which objection comes next.
> - Three interlocutor models, each with its own matrix: the sophisticate attacks the premise your response invoked, the defender retreats to another objection driven by the same mechanism, the drifter moves one tier at a time.
> - The blended view is the union of all three, with every edge tagged by the modes that contributed it.
> - 78% of edges appear in only one mode. The three models mostly disagree, and that disagreement is the whole point — a single averaged matrix would have hidden it.
> - Weights are categorical reasoned judgments, not measured frequencies; percentages would imply a precision that does not exist. Two things are candidates for correction: the 15 canonical sophisticate overrides were applied without independent expert validation, and the disengagement badge is a coarse, uncalibrated heuristic.

Files: `precis.py` (v2, exits non-zero on any unsourced clause), `precis_blocks.html`, `insert_precis.py`.