# Alpha–Omega Successor Protocol — Design v0.2

*Status: Cowork draft, reconstructed from the persisted `omega-successor-roadmap`
for Josiah's ratification. This grounds the arc on disk (the Phase-2+ design
prereq). If the chat-delivered `v0.1` differs, Josiah's v0.1 supersedes this and
this file is re-synced to it. Nothing here changes a dialectical stance; the
ratification cliff is Phase 4 (below), not this document.*

## North star

Desk-Yūrei is **Phase 0** of *Omega* — a standalone agent that algorithmically
continues Josiah's persona (and beyond) for when he is no longer here. The goal
is to combine **all registers** (the successor-protocol proxy R1–R5 plus Yūrei)
and **all project knowledge** into one comprehensive web of scripted, gated
responses — robust enough to *simulate* an LLM offline on modest hardware — and
to graft an LLM-API seam on later when the infrastructure exists. Omega gets its
own site tab ("Alpha Omega Successor Protocol") and its own avatar, **Mr. Grey**
(a black cat), riding the same manifest/resolver avatar tech Yūrei uses. It
doubles as referee/instructor for *Argue the Argument*.

## Load-bearing decisions

**One gate, many personas.** `persona` is a *corpus dimension*, not a second
engine. There is ONE matcher, ONE validator, ONE parity harness. Yūrei /
proxy(Mr. Grey) / referee are corpus slices under a per-persona register + fence
policy. **Cross-persona bleed = 0**, asserted the way today's persona∩oracle
disjointness is asserted.

**The corpus is the durable asset; the generator is swappable.** An `Agent`
interface sits over the corpus: a deterministic matcher now, an API-backed
generator later — *grounded* on the same corpus (retrieval) and *gated* by the
same validator. The scripted corpus is the model's **safety floor** on any
gate-fail. Swapping the generator is not a rewrite.

**Fences are mechanical.** Every register fence is a validator rule or a parity
assertion — not a hope. Yūrei is fenced from positions (G7). The proxy deploys
**registered** positions only, with defer-and-flag on the unknown (fabrication is
a violation). The referee is educational-not-endorsement.

**Gap-finding is the parity-vector pattern generalized** into a standing
zero-perturbation ratchet: a multi-class adversarial probe → a coverage metric →
authoring under the register gate → every closed gap becomes a **frozen vector** →
new edits must perturb **zero** existing vectors. Loop until dry.

**"Feels like an LLM" is falsifiable and domain-bounded:** register integrity
100% (hard) · an intent-registration coverage ratchet · multi-turn coherence ·
zero verbatim repeat within a session · crisis recall 100%.

**Scale-up path:** an inverted-index prefilter (a superset filter, so routing
stays bit-identical — a parity assertion) · bounded multi-turn "open-file" topic
state · per-input-class miss-craft.

## Context, state, and persona-directness

The matcher already carries conversation context **structurally, not
semantically**: per-session `input_hist` (repeat detection), `emit_turn` +
dampening (`NO_REPEAT_WINDOW`), a continuation lane (low-signal inputs route to
the previous entry's `followups`), and `followups_used`. Pure script can carry
*more* context — deeper/branching followups, topic-stickiness bias, slot-filling —
which is exactly the design's "bounded multi-turn open-file topic state." The
ceiling is semantic understanding of *novel* specifics; that is the Phase-5 LLM
seam. Scripted specificity comes from **authoring deeper entries and chains**,
not runtime inference.

**Persona directness is a register axis, not a bug.** Yūrei is deliberately
evasive (files-not-answers, G7-fenced from stances). Omega / proxy(Mr. Grey) /
referee answer **more specifically where scripted** — the whole point of
combining registers over a deeper corpus. Directness is encoded per-persona in
the register policy: Yūrei deflects/withholds; the proxy is registered-positions-
direct with defer-and-flag on the unknown.

## Phase map

| Phase | What | Cliff? |
|---|---|---|
| 0 | Yūrei desk-assistant | done |
| 1 | Yūrei enrichment = Omega components (voice · admin FX terminal · pointing · eggs · coverage ratchet) | site-safe |
| 2 | **Unify the gate** — the schema/tooling gains `persona`; Yūrei parity unperturbed; cross-persona bleed = 0 | site-safe |
| 3 | Mr. Grey shell + tab — a bounded, site-safe persona corpus, **NO positions** | site-safe |
| 4 | **Scripted proxy positions corpus (R1–R5)** — defer-and-flag; byte-proof vs the FENCED canon; **Josiah + library-Claude only** | **RATIFICATION CLIFF** |
| 5 | LLM-API seam | — |
| 6 | Offline-LLM scale-up | — |
| 7 | Referee in `/argue/` | — |

Only Phase 4 is a hard cliff. Everything at or below Phase 3 is site-safe.

## Where Ω1 sits (this build)

Ω1 is the **front half of Phase 2 groundwork** — the *vessel* that lets a second
persona exist beside Yūrei, proven not to perturb her. Ω1's architecture lock:
**separate corpus files per persona**, fed to the byte-identical engine as
separate `Matcher` instances. `persona` becomes a documented corpus dimension and
a tooling/validator/convention generalization — **not** a risky corpus merge (that
is the later, deliberate single-matcher step). Ω1 ships positionless: a persona
convention + schema note, a clearly-marked **placeholder** second-persona corpus
(Cowork scaffolding for library-Claude to replace), a persona-aware
validator/parity gate, and a loader convention. See
`omega-persona-convention.md` and `tools/omega/`.

The Mr. Grey **surface** (tab + avatar mount) is Ω2. The proxy's **register and
real entries** are authored by the **Successor Protocol seat** (Josiah's own
register); "Mr. Grey" is only the black-cat avatar (a skin), not a separate
register. Cowork authors no persona register and no positions (positions are
Phase 4).
