# STATISTICS — efilist argument library

Corpus-level numbers, the transition calculus, the dependency and mechanism
topology, the real-world-example distributions, and the RSI scoring model.

> **What this file is.** A *documentation* artifact reporting canon-attested
> figures with provenance. It is **not** the in-surface STATS section specified
> in `corpus_statistics_spec.md` — that section is a deferred, harness-gated,
> terminus-reopening v3.8-class build and remains unbuilt. Nothing here is a
> live computed render. Every figure below names its source. Where a figure
> requires the corpus bytes (not in scope for the publication-prep session that
> authored this), it is cited from canon's invariant block or from the stats
> spec's attested reference values and flagged **recompute-at-render**.

---

## sampling_provenance — read first (structural caveat, not a footnote)

The real-world-example corpus is **diversified but opportunistic**. It was
harvested across five deliberately different surface classes — institutional
writing, lifestyle explainers, student journalism, primary social platforms,
niche forums — to avoid single-channel bias. It is **not a representative sample
of real-world objection frequency.** Every "share" or "deployment" figure below
is internal to the harvested set. A high deployment count means *"this move
shows up a lot in what was collected,"* never *"this is how often the move
occurs in the world."* The denominator for a true real-world rate does not
exist and is not claimed. This caveat governs every number in this document.

---

## 1. Corpus scale

| Dimension | Value | Source |
|---|---|---|
| Objections | **78** | canon `invariants.objection_count` |
| Tiers | **5** | canon `invariants.tier_count` |
| Psychological mechanisms | **34** | canon `invariants.mechanism_count` |
| Total responses | **238** | corpus `totalResponses` (canon-mirrored) |
| Attested real-world deployments | **136** | canon / `release_manifest_v3_7_1` |
| Interlocutor archetypes | **4** | sophisticate · defender · drifter · blended |
| Dependency-graph nodes | **91** | canon `invariants.dep_graph_data_node_count` |
| Dependency links | **245** | canon `invariants.dep_graph_data_link_count_v361` |
| Mechanism-web nodes | **112** | canon `invariants.map_graph_data_node_count` |
| Mechanism-web links | **133** | canon `invariants.map_graph_data_link_count` |
| Map 1 transition edges | **2,886** | canon `invariants.map1_edge_count_total` |

The 77→78 objection count was a v3.7.1 reconciliation: the v3.7-stable
attestation of `map1_node_count = 77` was defective against a 78-node shipped
literal and was re-certified to **78** by the v27.0 invariant snapshot. The
static UI chrome in the two graph views previously displayed a *pre-sweep*
`74` / `222`; the **v3.7.2** content-advance re-cut corrected it
(length-preserving, byte-neutral) to **78 / 245**, matching this table.

---

## 2. Tier taxonomy

| Tier | Name | Register |
|---|---|---|
| T1 | Emotional / Reflexive | reflexive, affect-driven, low deliberation |
| T2 | Folk Philosophical | inherited intuitions, unexamined commonplaces |
| T3 | Structural / Pragmatic | systems / consequences / feasibility framing |
| T4 | Genuine Philosophical | engaged, internally coherent, hardest to dismiss |
| T5 | Meta-Objection | objections to the framework / the project itself |

Tier is a property of the *objection*. It is orthogonal to dependency-link
strength (a link's strong/weak status is about how tightly an objection leans
on a premise, not about which tier the objection sits in). Per-tier populations
are not carried as a canon invariant; derive from `objections[].tier` at need.

---

## 3. Map 1 — the transition calculus

Map 1 is a force-directed *next-move predictor*: from a selected source
objection it renders predicted successor objections within the selected
archetype's mode, annotated with convergence tier and mode rationale.

**Edge distribution across the 78 source-keys** (v3.7.2 attestation; unchanged — score-layer + prose re-cut, topology untouched):

| Archetype | Edges |
|---|---|
| sophisticate | 675 |
| defender | 526 |
| drifter | 390 |
| blended | 1,295 |
| **total** | **2,886** |

**Blended mode-count distribution** — how many successor modes a blended edge
discloses: `{1: 1,010 · 2: 274 · 3: 11}` (Σ = 1,295, matches the blended edge
count). **Two-mechanism disclosure true-counts** (edges that surface a second
mechanism): `defender 5 · drifter 42 · blended 45`. (Source: canon
`invariants.map1_*`; cross-verified against `release_manifest_v3_7_1`
invariant attestation.)

Behavioral content lives in each edge's `rationale` (or `mode_rationales` for
blended edges) — the specific move from one objection to the next. The map is
the artifact; the numbers above are its shape, not its content.

---

## 4. Dependency graph

**91 nodes** = 78 objections + **13 premises**. Premise split: **9
foundational + 4 diagnostic** (canon `invariants.dep_graph_data_premise_*`).
**245 links**, partitioned **161 strong** (load-bearing) / **84 weak**
(softer / invoked) — canon
`invariants.dep_graph_data_strong|weak_link_count_post_cluster_insertion`.

Premise families (surface legend): Axiological · Consent · Metaphysical ·
Empirical · Structural · Diagnostic (Psychological) · Diagnostic
(Characterization). The foundational spine includes Consent Impossibility,
Benatar's Asymmetry, the Proxy Gamble, Empirical Tail-Risk, Suffering-as-
Deterrent, Convergent Architecture, Alogical Isness, Contextus Claudit, and the
zero-line premise; the four diagnostic frameworks include Optimism Bias,
Labor Sine Fructu, Terror Management Theory, and Depressive Realism. Per-premise
strong/weak dependency counts are render-bound; recompute from
`premiseDependencyMatrix` for exact per-premise figures.

---

## 5. Mechanism web

**112 nodes** = 34 mechanisms + 78 objections. **133 links** (canon
`invariants.map_graph_data_*`). Mechanism-type taxonomy (surface legend):
Psychological Defense · Cognitive Bias · Rhetorical Fallacy · Structural
Deflection · Genuine Engagement. Node size scales by connection count —
load-bearing mechanisms (e.g. Terror Management Theory, Optimism Bias) carry
many objection edges; singletons carry one.

---

## 6. Real-world examples

| Metric | Value | Source / status |
|---|---|---|
| Attested deployments | **136** | canon / manifest |
| Attachment edges (RWE → objection) | **171** | stats spec — recompute-at-render |
| First-commitment instances | **15** | canon `invariants.realWorldExamples_first_commitment_instance_count` |
| v3.6.1 top-level key count post-splice | **12** | canon invariant |

**Archetype-signal distribution** (stats-spec reference; recompute-at-render):
sophisticate 72 · not-applicable 38 · defender 15 · drifter 6 · blended 5.
The ~28% `not-applicable` share is a **corpus-health signal** — it means many
harvested deployments do not legibly read as any single archetype — and is
reported, not hidden.

Each record enforces a **<15-word quotation bound** at the schema level (not by
convention) plus required provenance fields (`source_url`, `source_date`,
`accessed_date`, `archive_url`, decay-risk / recovery-status tracking). Schema:
`real_world_examples_schema_v1_6.json`.

---

## 7. Rebuttal strength — the RSI calculus

Responses render at three depths — **PUNCH**, **DECONSTRUCT**, **DISMANTLE** —
each with an in-app `RSI METHODOLOGY` panel.

**The model (canon-attested at structure level):**

- Each rebuttal carries a raw 5-axis tuple `REBUTTAL_STRENGTH {v, s, c, r, a}`.
- This raw tuple persists in **`index.html` only** (with `combined.html` as its
  derived superset). It is **not** in the corpus JSON or JSX — those are the
  non-score-bearing taxonomic spine by canonized design (2-artifact
  score-layering, canon v28.1).
- `RSI`, the percentage, and the letter grade-band are **never persisted**
  anywhere — they are derived at render by `computeRSI` → `rsiGrade`, with
  `depthModifiedRSI` applying a depth-dependent modifier (PUNCH / DECONSTRUCT /
  DISMANTLE).

**What is deliberately not stated here.** The exact word each of `{v, s, c, r,
a}` expands to, the weight coefficients, and the precise `depthModifiedRSI`
modifier values are render-layer implementation inside `index.html`, surfaced in
the in-app `RSI METHODOLOGY` panel. They are not canon-attested at the formula
level and are not reconstructed here — fabricating them would be exactly the
hand-authored-figure failure the architecture exists to prevent. (Canon records
the cautionary case: a depth-modifier *comment string* once drifted against the
code's actual modifier — the standing reason every figure is computed, never
written down.)

**Grade distribution by tier** (long depth; stats-spec reference figures —
recompute-at-render; ungraded shown explicitly, never dropped):

| Tier | A | B | C | Ungraded |
|---|---|---|---|---|
| T1 | 6 | 5 | 2 | — |
| T2 | 4 | 7 | 3 | — |
| T3 | 5 | 8 | — | 1 |
| T4 | 7 | 14 | 7 | — |
| T5 | 4 | 2 | — | — |

**As of v3.7.2: 0 nodes ungraded corpus-wide — all 78/78 graded.** The four
formerly-ungraded nodes (`violence-as-reductio`, `masochist-counterexample`,
`joy-outweighs-harms`, `wild-animal-suffering-consistency`) are graded in the
`index.html` score layer; a v3.7.2 pre-cut ledger-sync brought
`rebuttal_grading_ledger.json` fully consistent (ungraded → 0). The per-tier
A/B/C/Ungraded split above is a stats-spec reference matrix that predates the
four-ungraded grading — **recompute-at-render** for the exact post-v3.7.2
per-tier distribution; the corpus-wide ungraded count is **0**, not 4. An
ungraded node, where one ever appears, is a pending grade rendered as risk,
not absence.

**Deployment × grade — the danger quadrant** (the analytical view the project
most needs: a weak rebuttal that is heavily deployed in the wild):

- **`violence-as-reductio`** — grade **B** (≈83.8) @ 27 RWE (highest
  deployment) — **quadrant CLEARED in v3.7.2**. Its responses.long was
  strengthened (11795 chars) and it regraded **C(≈0.805) → B(≈0.838)**; the
  corpus's single most-deployed node is now robust, not weak.
- **`benatar-asymmetry-attack`** — grade **C** (≈80.7) @ 15 RWE —
  **still an active alarm**. responses.long was strengthened (4904 chars) and
  a blind re-grade moved it C78.3 → C80.7 — the argument is materially
  harder to a hostile reader but the band is unchanged and the quadrant is
  **not** cleared. Tracked; an S-axis pass is the evidenced (operator-elective)
  next move.
- `life-gift` — C @ 4 RWE — not in the quadrant.
- `ai-fear` — B @ 10 RWE — not in the quadrant.

---

## 8. How the project was built (the discipline)

The library is not just a dataset; it is built under a set of canonized
engineering invariants worth stating, because they explain why the numbers
above are trustworthy:

- **2-artifact score-layering (canon v28.1).** The taxonomic spine
  (corpus + JSX) is low-churn and score-free; the high-churn score overlay
  lives only in `index.html`. Coupling them was rejected because it manufactures
  the exact multi-surface cascade hazard the firewall arc exists to prevent.
- **Cascade-firewall arc (c6 / c7 / c8).** A sequence of consistency
  firewalls between the four artifact layers; the score-layering decision is
  the structural conclusion of that arc.
- **Invariant-derivation harness gate.** Any content mutation to the shipped
  artifact must pass `invariant_derivation_harness_v1` GREEN before close —
  the project's one standing live obligation. v3.7.2 is a deliberate
  content-advance re-cut (not verbatim); it passed the harness GREEN (exit 0,
  derived == canon == manifest) as a hard gate before close, alongside the
  cut-invariant roster and the validator self-test.
- **<15-word quotation discipline.** Schema-enforced on every real-world
  example — not a convention, a validation rule.
- **Compute-at-render, never hand-author.** No derived figure (RSI, share,
  band) is stored as a literal. This document inherits that posture: it cites
  sources and flags recompute-at-render rather than asserting a frozen number
  as live truth.
- **Diversified-but-opportunistic harvesting.** Five surface classes, no claim
  to representativeness — restated as §sampling_provenance above.

---

## Provenance & honest limits

Headline counts (78 / 5 / 34 / 238 / 136 / 91 / 245 / 161-84 / 112 / 133 /
2,886 and the Map 1 distributions) are read from the canon **invariants** block
at canon v29.0 (byte-identical to the v3.7 line — the v3.7.2 re-cut left the
structural invariants subtree unchanged, the version classifier confirming
PATCH-class) and cross-verified against the `release_manifest_v3_7_1`
invariant attestation — they agree. The corpus bytes were **not in scope** for
the publication-prep session that authored this file; figures requiring corpus
traversal (RWE attachment edges, archetype-signal distribution, per-tier grade
matrix, danger-quadrant grades) are cited from `corpus_statistics_spec.md`
attested reference values and are marked **recompute-at-render**. They are
accurate as of the spec's attestation; for live exactness, recompute against
`objections`, `realWorldExamples`, and the `index.html` score layer.

The in-surface STATS section (`corpus_statistics_spec.md`) — with live
computed metrics and the interactive danger quadrant — remains a deferred,
harness-gated, terminus-reopening build. It is not this file and is not
scheduled.
