# Refusal Libraries — long-range roadmap & guidance map

**Purpose.** Capture Josiah's idea-list for extending the argument libraries, organized + prioritized + with Cowork's recommendations and revisions baked in, so nothing is lost and the work has a spine when we get to it. This is a living map — revise freely. The arc is large (months, which is fine); it is sequenced so each phase ships value on its own and the heavy/charter-gated work is de-risked before it starts.

**How to use.** Fold this into the repo at `docs/refusal-libraries-roadmap.md` (doc-only commit, no pin) so it is the single source of truth. Each Cowork/library-Claude session picks the next ready item; mark items as it lands. Phase numbers are priority bands, not rigid order — items inside a band can reorder by readiness.

**Status (2026-06-29).** Wings: flagship (Procreation & Existence, pin v3.9.15, 81 objections) · Right to Die (Wing 1, provisional-complete, 17) · Anthropocentrism (Wing 2, provisional-complete, 6) · Transgenderism (Wing 1, complete, 12) · Abortion (Wing 1, in build, 3 / Layer-1 ongoing). Veganism parked (charter L141). P0 (umbrella coherence) is the next session.

---

## §0 — Guiding principles & constraints (read before any phase)

- **Firewall / register is load-bearing.** The libraries are rebut-only / optionality / appraisal-silent / asymmetry-independent (the K170 capstone `the-firewall-does-not-misfire` CERTIFIED this). Several roadmap items (esp. the steelman extension, the referee, the game) touch the suite's dialectical STANCE. Anything that could read as the suite *endorsing* a positive claim is a CHARTER decision (Josiah + library-Claude ratify), not a Cowork build call. The lone licensed exception is the abortion Layer-2 advisory claim (charter L137).
- **No-pin discipline.** The flagship `combined.html` is pin-locked (`5f068153` / v3.9.15); touching it triggers the heavy ccxxxvii path (pin move + search-index regen + objection re-vendor). Prefer AUX-side render edits, new sibling pages, and wuld-native data/doc — all no-pin. Reserve flagship edits for deliberate, isolated pin-move sessions.
- **Render-from-data.** Aux surfaces fetch the corpus at runtime; node cards, counts, version auto-render. Only static chrome (About-lede, masthead prefix) is hand-frozen. New per-card features should be DATA fields + a render branch, dormant-scaffold first (the `provisional-complete` / `print_url` pattern), so authoring and vessel decouple.
- **Integrity gates are non-negotiable.** prose_md5 binding, round-trip identity, change-isolation, cold-grade independent reproduction, leg-A + additive index, conservation, validator self-test + path-mode, mojibake 0, frozen re-check. Every content fold rides them.
- **Cowork builds the vessel; chat/library-Claude fills content.** Philosophy authoring + cold-grading is library-Claude's lane (in-chat Max). Cowork forks vessels, folds, renders, ships.

---

## §1 — Phases

### P0 — Umbrella coherence & discoverability  [NEXT; Cowork-native, no-pin]
**Goal:** the umbrella reads as one product and every surface is reachable.
- Wing-switcher on all aux wings (links all five surfaces). [bug fix]
- `/libraries/` front-door index page (card grid + status badges). [deferred memory item]
- Changelog cadence restored (Transgenderism + Abortion wings; gen_feed regen).
- Chrome convergence aux->flagship: descriptive tier vocabulary, red-accent palette; KEEP reading modes / expand-all / badges / RWE render; DO NOT port the flagship viz tabs (no aux data).
- Granular-depth golden-indicator SCAFFOLD (dormant per-card field + badge) — seeds P1.
- (Follow-on) wire the aux corpora into wuld.ink site-search (build_index over the aux objection exports -> search-index.json; the K129 keyword-projecting path; wuld-native, no flagship pin).
**Deps:** none. **Effort/risk:** low/low. **Spec:** see `session-aux-umbrella-ui-prompt.md`.
**Open decisions:** legible-mode serif vs mono-recolor (reverses K156 AQ — ask); switcher flat vs grouped; front-door host + root routing.

### P1 — Granular depth polish (aux libraries)  [content wave; library-Claude authors, Cowork folds]
**Goal:** bastion the strongest aux cards with granular-depth retorts, like the main-library depth pass — best-candidate cards only, where it adds real strength, never superficial padding.
- library-Claude selects best-candidate cards (per wing), authors granular-depth additions to existing rebuttals (a deeper `granular` response layer or an extended `long`), cold-graded.
- Cowork folds (node-class fold) + flips the **golden "granular" indicator** (the P0 scaffold) live on tagged cards; a distinct "pending granular" state optional.
**Deps:** P0 scaffold. **Effort/risk:** medium/low (rides existing fold machinery). **Recommendation:** run wing-by-wing AFTER each wing is content-complete (don't deep-polish a wing still being built — abortion waits until its Layer-1+Layer-2 set lands). RTD / Anthropocentrism / Transgenderism are eligible now.

### P2 — The dialectic extension: steelman + final pessimist response  [THE big one; CHARTER-GATED]
**Goal (Josiah):** not a separate "opposing-side mirror" but an EXTENSION of the existing library — take the library's own rebuttals, add the strongest natalist STEELMAN response to each (the natalist position breathes), then a FINAL pessimist response so it is not left open on the natalist side (the pessimistic preference is not unguarded at the end). A 4-ply card: **objection -> library rebuttal -> natalist steelman -> final pessimist response.**
**Why this is charter-gated (Cowork's load-bearing flag):** the suite was just CERTIFIED rebut-only / appraisal-silent (K170 firewall). Adding a natalist-steelman ply changes the dialectical stance from pure refutation to adversarial-collaborative. Done carelessly it reads as the suite entertaining/endorsing the natalist claim — exactly what the firewall forbids. The **final pessimist ply + explicit side-attribution + per-ply grading** are what keep it firewall-clean (the opponent breathes but does not get the last word, and no ply is presented as the suite's own positive thesis). This is a register/charter decision Josiah + library-Claude ratify BEFORE authoring.
**Sub-phases:**
- **2a. Charter decision + register design.** Does the firewall permit a steelman layer, and under what attribution/seal? (library-Claude drafts the redline; Josiah ratifies the FENCED charter edit; Cowork byte-proves + folds — the K137/K155 discipline.) Define how the steelman is marked NOT-the-suite's-view and how the final-pessimist ply is graded vs the steelman.
- **2b. Schema extension.** Add `natalist_steelman` + `final_response` plies to the node schema (additive-optional; validator + builder + render branches; dormant-scaffold first). Decide grading: does each ply get its own RSI? (Recommend: yes — grade the steelman's strength AND the final response's strength, so the dashboard in P3 has real data.)
- **2c. Authoring.** library-Claude authors the steelman + final response per card, cold-graded; Cowork folds.
- **2d. Render.** A collapsible ply stack per card, clearly attributed (e.g. "Natalist steelman" / "Final response"), reading-mode aware.
**Deps:** wings content-complete (do NOT extend incomplete wings); P0 (vessel coherence). **Effort/risk:** high/high (charter + authoring volume + render). **Recommendation:** start the 2a charter conversation EARLY (it can run in parallel with P0/P1) so the decision is settled by the time wings are complete; author 2c only after a wing is done.

### P3 — Referee / leverage view  [depends on P2 data]
**Goal (Josiah):** Claude as unbiased referee — tally the sum of results/grades and see which side has the most leverage.
**Cowork's revision (push back on false precision):** grades are RSI cold-grades of REBUTTAL strength, not symmetric two-sided debate scores. A single "side X wins" verdict over-claims and smuggles a metric the corpus was not built to support. Build instead a **transparency dashboard**: grade distributions per wing/tier, where the natalist steelman scored highest vs where the final pessimist response scored highest, tier coverage, unresolved residuals. A bounded "leverage read" can be OFFERED with an explicit methodology caveat (what the grade measures, what it does not). This keeps the referee honest and is far more useful than a scoreboard.
**Deps:** P2 (need both-side grades for a fair tally). **Effort/risk:** medium/medium. **Recommendation:** ship the dashboard as a render-side view over the existing grade data first (no new data); add the "leverage read" as a clearly-caveated layer.

### P4 — Pedagogy arc: laymen tiers -> logic course -> educational game  [the largest; sequence internally]
**Goal (Josiah):** bridge elite<->layperson; teach argument flow + critical thinking so users improve on their OWN; a game-like, educational layer over the existing card set.
- **4a. Laymen tier per card  [KEYSTONE — do first within P4].** A plain-language "for the interlocutor" section under each card (gender-neutral), SUPPLEMENTING (never replacing) the graded rebuttal — an active bridge for the average person entering the debate. Additive-optional data field + render branch (dormant-scaffold). This unlocks both the course and the game's easy tiers. library-Claude authors; Cowork folds + renders.
- **4b. Logic / critical-thinking course.** A curated PATH through the library (not new corpus): teaches the objection->rebuttal->steelman->response flow, fallacy-spotting, steelmanning, the RSI taxonomy. Frame it as the "case study" Josiah wants — how non-power-users learn + how power users sharpen. A guided sequence + explainers; reuses the existing cards + the argument-flow system.
- **4c. Educational card game.** A flashcard drill over the existing card set with the **argument-flow system as the train-track**: the player is shown a premise/argument and must choose (or compose) the best rebuttal accurately + consistently; tiered difficulty laymen->elite (mapped to 4a's tiers). The BUILDABLE-NOW core = a choose-the-best-rebuttal drill over existing data + the argument-flow track (no new backend). The STRETCH = a live read of free-text user rebuttals — AI-API-gated; scope only if an API path exists, else keep the robust card set. Goal is EDUCATION (teach flow + critical thinking), not entertainment — every mechanic justifies itself pedagogically or it is cut.
**Deps:** 4a unlocks 4b/4c; P2 enriches the game (steelman/response plies = harder rounds). **Effort/risk:** high/medium-high. **Recommendation:** 4a first (keystone), then 4b (low-tech, high-value), then 4c core, then 4c live-input only if API-feasible.

---

## §2 — Charter-level decisions (must be ratified before the dependent build)

1. **Steelman extension (P2a).** Does the firewall permit a natalist-steelman + final-pessimist ply, and under what attribution/seal? — the gate for all of P2. (FENCED charter edit; library-Claude redline -> Josiah ratify -> Cowork byte-prove + fold.)
2. **Per-ply grading (P2b).** Grade the steelman + final response with their own RSI, or only annotate? (Recommend grade — it powers P3.)
3. **Referee framing (P3).** Transparency dashboard + caveated leverage read, NOT a single verdict. (Cowork's recommendation; confirm.)
4. **Game register (P4c).** Confirm the game stays diegetically within the instrument register + the firewall (educational, not endorsement; no mechanic that reads the suite as taking the natalist or any positive side).

---

## §3 — Open decisions index (carry until resolved)

- Legible-mode typography: aux serif (match flagship) vs mono-recolor (K156). [P0]
- Wing-switcher form: flat in-header vs grouped; front-door host + `library.wuld.ink/` root routing. [P0]
- Granular-depth field name + whether "pending granular" gets its own state. [P0 scaffold / P1]
- Steelman ply schema + attribution + grading. [P2]
- Referee metric definition + caveat language. [P3]
- Laymen-tier field name + how its difficulty tiers map to the game. [P4a/4c]
- Game scope: card-drill only vs live-input (API dependency). [P4c]
- Aux-wing site-search wiring (separate from the flagship search index). [P0 follow-on]

---

## §4 — Do-not-lose appendix (Josiah's raw idea-list -> phase map)

- Steelman EXTENSION (use the library's own rebuttals, add strongest natalist responses; natalist breathes, no final word) -> **P2 / 2c**.
- FINAL pessimist response after each natalist steelman (not left open on the natalist side; pessimistic preference not unguarded) -> **P2 / the 4th ply**.
- Referee tally (unbiased sum of results/grades; which side has leverage) -> **P3** (revised to a transparency dashboard + caveated read).
- Logic-course metric case study (how non-power-users learn; how power users improve) -> **P4b framing**.
- Logic/critical-thinking course -> **P4b**.
- Laymen section per card (bridge elite<->layperson; supplements graded rebuttals; gender-neutral "interlocutor") -> **P4a (keystone)**.
- Polish passes / granular depth on best-candidate aux cards (bastion strength, not superficial) + golden "granular" indicator (and "pending" state) -> **P1** (+ **P0** scaffold).
- Other UI improvements to bolster the library -> **P0 / cross-cutting**.
- Game-like card flashgame (premise -> best rebuttal; argument-flow = train-track; educational; tiered laymen->elite; live-input = AI-API stretch) -> **P4c**.
- Laymen tiers <-> game difficulty tiers -> **P4a + P4c link**.

---

*Sequencing in one line:* **P0 now** -> **P1 + P4a** (next content waves, ride existing machinery) -> **P2a charter decision early, author P2c after wings complete** -> **P3 + P4b** -> **P4c** (core, then live-input only if API-feasible). The vast scope is fine; this map keeps it from getting lost.
