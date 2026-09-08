# WULD Master Index — Project Reference v2.0

> Compiled 2026-05-02 from project-baton_8.md + cross-session memory. v2 revises v1 to mark interpretive appendices and clarify biographical scope. Reference doc for any incoming Claude. Read META + QUICK INDEX first; consult specific blocks and appendices on demand.

---

## META

- **Author:** Josiah S. Cooper. Handles: WULD, Evilis Anihilis Uls, AnomicIndividual87.
- **Source materials:** 8 project baton blocks (verbatim from baton_8) + appendix data drawn from cross-session memory not previously consolidated.
- **Calibration:**
  - **STATUS** = `alive / orbiting / shelved / dormant / dead`. No hedging.
  - **PULSE** = 1–10. 1 = corpse. 5 = quiet but warm. 7 = active. 10 = on fire / present-tense urgent.
  - **Dates** = absolute (ISO YYYY-MM-DD) when known, relative otherwise.
- **Read-order priority for new Claude:** META → QUICK INDEX → relevant project block → relevant appendix. Don't load everything; load on demand.
- **Appendix provenance markers (new in v2):**
  - Appendices A, E, F, G, H = direct from author / cross-session memory of authored content.
  - Appendices B, C, D = **secondary gloss** — distillations by a Claude instance, not authored definitions. Treat as orienting summary, not canonical phrasing. Confirm with author when precision matters.

---

## QUICK INDEX

| # | Project | Medium | Status | Pulse | One-line |
|---|---|---|---|---|---|
| 1 | Malgré Tout — A Guide to Nothingness | Book (KDP) | alive | 9 | 89-page hybrid compendium; awaiting physical proof |
| 2 | Illogically Is / Alogical Isness | Essay-film | alive | 9 | 35:53 narration spine; bridge pipeline verified end-to-end |
| 3 | efilist_argument_library | Web tool / data | alive | 8 | 74-objection taxonomy; mid-port v3.4 → v3.6.1 |
| 4 | WULD Game | Godot 4.x game | alive | 8 | Punctum Room v0.24 + GAME_CANON corpus extraction |
| 5 | RuneLite Mining Stats Plugin | Java plugin | alive | 8 | v0.3.1 prod-shipped; v0.3.2 scope locked |
| 6 | Successor Protocol | Cowork emulation-proxy | alive | 7 | 5-register exemplar calibration; canon stable |
| 7 | W.U.L.D. Engine Suite | HTML creative suite | alive | 7 | DUAL_ENGINE_v1.html merged; quiet pending direction |
| 8 | Banal Activity Org. | Cowork life-logistics | alive | 5 | Empty substrate; pre-content |

**Heat reading:** Two book/film projects in production-tail (Malgré Tout, essay-film). Three software projects active. Two operational substrates (Successor, Banal). One creative suite cooling. No corpses. Game project is the dark horse — large corpus, real engine commitment, longest runway.

---

## PROJECT BLOCKS

*Verbatim from project-baton_8.md. Order reshuffled by pulse + production-stage. Blocks unchanged; NOTES preserved to avoid silent edits to authored work.*

### 1. Malgré Tout — A Guide to Nothingness
```
PROJECT NAME: Malgré Tout — A Guide to Nothingness
MEDIUM: book — self-published hybrid compendium (pessimist philosophy, personal narrative, experimental prose, comedy)
STATUS: alive
LAST TOUCHED: this week (Session 11 just closed; Session 12 queued)
PURPOSE: WULD-moniker self-publication via Amazon KDP, working the territory of philosophical pessimism, antinatalism, metaphysical nihilism, negative utilitarianism — Cioran/Ligotti/Zapffe lineage. Success defined by author's satisfaction with finished object, not sales.
CURRENT STATE: Interior manuscript locked at 89 pages (Ch I–IV, NothinGist interlude, experimental section, mementos, 32 endnotes, 26 references). Cover ODT structurally audited and surgically corrected (P6 bold hint removed). Typography locked: IM Fell English / EB Garamond / Cormorant Garamond. KDP listing finalized — Draft A description (LD #31), 7 keywords, 3 categories, pricing set, no Expanded Distribution. Facebook post drafts delivered.
BLOCKERS: None mechanical — awaiting physical proof copy in author's hands.
NEXT MEANINGFUL STEP: Session 12 — physical proof review (D6 proof-gate) and publish-gate decisions for final KDP submission.
PULSE: 9
NOTES: Canonical state in bookcanon.md, read first every session. ISBN 979-8-2583663-5-1. Closing line: "The cat is on the table." word_primer_wuld_v1_4.docx §2/§6 refresh deferred.
```

### 2. Illogically Is / Alogical Isness (essay-film)
```
PROJECT NAME: Illogically Is / Alogical Isness (essay-film)
MEDIUM: essay-film (video) + Python bridge tooling for Cowork-assisted editing
STATUS: alive
LAST TOUCHED: 2026-04-24 (session 5, same-day burst)
PURPOSE: Hour-long essay-film treatise on metaphysical nihilism, composed against a fixed 35:53 ElevenLabs TTS narration spine, citing reference cinema as source material rather than mood.
CURRENT STATE: DaVinci Resolve timeline imported and verified. Three bridges built and working: asset_surveyor.py, script_to_edl.py, storyboard_to_xml.py. Populated storyboard.yaml with 37 clips across 10 sections (8 gap placeholders). V1/V2/V3 + A1 spine + 11 markers all land correctly in DaVinci.
BLOCKERS: None mechanical — pipeline is verified end-to-end. Remaining work is curatorial: refining source-clip in/out points against actual viewing, deciding music underlay strategy, triaging gap acquisitions (Mirror, 2001, Koyaanisqatsi, Tree of Life, etc.). Section 9 is 100% gaps.
NEXT MEANINGFUL STEP: Solo viewing pass against storyboard.yaml's first-draft timecodes; refine; re-run bridge v3; re-import.
PULSE: 9
NOTES: Companion to but distinct from Alogical Isness book. Phantom <name>→<n> patch retired session 5. Manual marker nudges live only in .drp; motivates silencedetect v2.
```

### 3. efilist_argument_library
```
PROJECT NAME: efilist_argument_library (antinatalism objection taxonomy)
MEDIUM: structured JS/JSON data artifact + interactive HTML visualization
STATUS: alive
LAST TOUCHED: this week (session 3a just completed; 3b queued)
PURPOSE: Multi-tier taxonomy of objections to antinatalism — 74 objections across 5 tiers, 34 mechanisms — with a force-directed Map 1 visualization modeling four interlocutor archetypes (sophisticate / defender / drifter / blended).
CURRENT STATE: Mid-port from v3.4 to v3.6.1. Session 3a delivered top-fields diff audit. `premises` field current; `dependencyGraph` and `premiseDependencyMatrix` flagged stale (carried unchanged via session 2d wholesale merge). Canon at v1.5. `MAP_GRAPH_DATA` identified as visualization substrate with no v3.4 JSON counterpart.
BLOCKERS: None — sequencing-bound. Stale dependency fields await re-derivation from current index.html source.
NEXT MEANINGFUL STEP: Open session 3b; re-derive `dependencyGraph` and `premiseDependencyMatrix` from v3.6.1 index.html.
PULSE: 8
NOTES: Strict one-deliverable-per-session discipline. index.html (~1.2MB) contains hazardous single-line JS literals; greps require head/line-slice guards. project_canon.json is the living handoff.
```

### 4. WULD Game
```
PROJECT NAME: WULD Game (Game Project)
MEDIUM: 2D game — Godot 4.x — philosophical pessimism rendered as playable artifact
STATUS: alive
LAST TOUCHED: this week
PURPOSE: 2D game embodying the author's pessimist / antinatalist / Alogical-Isness corpus — "Cioran with a whoopee cushion." One-line identity: "a fictional game based on real suffering."
CURRENT STATE: Two parallel tracks. (1) Corpus consolidation — source files extracted one-per-session into GAME_CANON.md (now >70k tokens; whole-reads prohibited, §14 spot-check rule; CORPUS_EXTRACTS.md logs provenance). (2) Prototype — Punctum Room v0.24 with SceneHistory + MapRegistry autoloads functioning as reusable inheritance template for future rooms.
BLOCKERS: Canon size is itself now a budget hazard — navigable only via grep + targeted offset reads. Corpus pass and prototype work running in parallel despite original "corpus first, prototype after" sequencing. Author drives Godot editor manually; Claude is text-only scaffold and reviewer.
NEXT MEANINGFUL STEP: Either continue corpus extraction (next source file per canon §12 working refs) OR fork Punctum Room template into a second room to validate the inheritance pattern.
PULSE: 8
NOTES: Project lives at Downloads/Game Project (NOT OneDrive). Engine committed: Godot 4.x. Graveyard (§11) discipline enforced — killed ideas stay killed.
```

### 5. RuneLite Mining Stats Plugin
```
PROJECT NAME: RuneLite Mining Stats Plugin (osrs-mining-stats)
MEDIUM: software tool — RuneLite plugin (Java), distributed via official plugin hub
STATUS: alive
LAST TOUCHED: ~4 days ago (2026-04-28)
PURPOSE: OSRS in-client overlay tracking per-ore yield, ores/hr, XP/hr, and inventory ETA across mining activities; shipped publicly under alisendjsc-crypto.
CURRENT STATE: v0.3.1 merged (PR #11688) and prod-confirmed at Camdozaal — Barronite 2,035/h on FlowersOEvil — validating the gameval-namespace animation-gate migration. Leagues self-test partial pass: coin-drop relic exposed yield-event miscategorization (~375k ores/hr inflation) and collateral ETA collapse. v0.3.2 scope locked: blacklist coins/bars/gems/geodes/scrolls + Scenario II bank-handler re-architect (preserve, not full-revert).
BLOCKERS: None hard. Awaiting one explicit fill-then-bank cycle on alt to commit the preserve+re-architect path. Kyle's Leagues re-test downgraded to confirmation, not gate.
NEXT MEANINGFUL STEP: Run fill-then-bank test; on pass, implement v0.3.2 (~30 LOC re-architect + curated exclude-set + stackable-yield ETA edge-case test).
PULSE: 8
NOTES: HANDOFF.md canonical at C:\Users\y_m_a\IdeaProjects. Slot-consuming-yield ETA refactor deferred to v0.4.0. OTHER PROJECTS TOUCHED HERE: RuneLite Fishing timer (vetoed Mar 2026), next-plugin scan (paused Apr 2026).
```

### 6. Successor Protocol
```
PROJECT NAME: Successor Protocol
MEDIUM: emulation-proxy framework (Cowork project — primer + canon + corpus governing a Claude instance trained to impersonate Josiah's voice across five registers)
STATUS: alive
LAST TOUCHED: ~4 days ago (2026-04-28 — "No Essential Protection" canon-add); today's session is meta — the baton handoff itself
PURPOSE: Train and govern a Claude instance to function as a transparent emulation-proxy for Josiah S. Cooper — calibrated against five register exemplars (not averaged into a single voice), constrained by source hierarchy (emulationcanon > word_primer > corpus > general knowledge), and bound to defer-and-flag rather than fabricate Josiah-positions.
CURRENT STATE: Six-item project instruction locked (identity frame, source hierarchy, register calibration, failure-mode canon — clinical voice not exempt, Lacero in range — contraindications, defer-and-flag). Five exemplars in active use; Register 3 (Personal-Clinical) calibration confirmed. Canon idiom "No Essential Protection" foregrounded as cosmological-horror anchor; proposed as essay-companion to *Null Return*.
BLOCKERS: None mechanical — operational substrate, not deliverable. Work is drift-testing proxy outputs against exemplars rather than shipping artifacts.
NEXT MEANINGFUL STEP: Either continue exemplar drift-testing with new proxy prompts, or draft the *Null Return* companion essay around No Essential Protection.
PULSE: 7
NOTES: "Long instructions rot" — six-item cap enforced. Proxy-mode register-native formatting exempted from conciseness preferences. Refused domains: legal/medical/financial impersonation, third-party harm, active crisis-counseling.
```

### 7. W.U.L.D. Engine Suite
```
PROJECT NAME: W.U.L.D. Engine Suite (Void + Signal + Transmission)
MEDIUM: software tool — single-file HTML creative suite (AI image prompt generator + music catalog browser + ambient generative visual)
STATUS: alive
LAST TOUCHED: ~2 weeks ago (2026-04-18 trifecta merge; this session is a fresh open with no edits yet)
PURPOSE: Unified creative toolset under the W.U.L.D.: Incorporated identity — Void Engine (~190 prompt modifiers across 12 categories), Signal Engine (992-track catalog with genre/mood tagging, generator, YT Music links), Transmission (mood-cycling generative ambient visual). Dark-first, anti-generic-AI aesthetic, self-contained.
CURRENT STATE: Trifecta merged into DUAL_ENGINE_v1.html (~359 KB) — primary deliverable. Three standalone backups (Void v5, Signal v2, Transmission v1) stable. Canon v1.0 documents architecture, known fragilities (function/DB collisions, partial CSS scoping), and surgical-edit discipline.
BLOCKERS: None mechanical — architecturally sound. Quiet because consolidation finished; no committed next direction. Future paths (Canva UI polish, Signal mood-arc generation, iframe CSS isolation) noted but uncommitted.
NEXT MEANINGFUL STEP: User selects from noted future directions — most likely Void Engine UI polish via Canva tooling, or Signal Engine playlist/mood-arc expansion.
PULSE: 7
NOTES: Surgical Python edits only; full-file rewrites prohibited. CSS scoped only via :root and wrapper IDs — class-level selectors collide if engines render simultaneously. Companion to but distinct from essay-film and efilist_argument_library projects.
```

### 8. Banal Activity Organization and Comprehension
```
PROJECT NAME: Banal Activity Organization and Comprehension
MEDIUM: life-logistics scaffold (Cowork project — groceries, schedules, messages, to-do, chores, household)
STATUS: alive
LAST TOUCHED: 2026-05-02 (today — first real touch is the baton handoff itself)
PURPOSE: Catch-all Cowork space for everyday-life operational noise that does not belong in the creative/research projects — designed to keep banal logistics out of corpus-bearing sessions.
CURRENT STATE: Project framing established; auto-memory seeded with dietary profile (vegan-leaning, acid reflux, ~1 meal/day, Indian/Mexican palette), household context (Mr. Grey, 11yo cat — Blue Wilderness + Rachael Ray), and corpus-style versioned-handout discipline. No grocery list, schedule, chore log, or recurring artifact committed yet. Empty space, ready substrate.
BLOCKERS: None — pre-content. Nothing has been requested of it yet beyond this handoff.
NEXT MEANINGFUL STEP: First real ask — likely a bundled grocery cycle (Josiah staples + Mr. Grey's food) or a recurring chore/schedule template versioned and dated.
PULSE: 5
NOTES: Frame is "build the corpus; don't seal anything prematurely." Versioned dated files preferred over editing-in-place. No connectors wired in this session.
```

---

## APPENDIX A — Published Works (completed artifacts)

*Existing standalone books under WULD. Not active projects but essential context — these define voice, prior territory, and what the current work is responding to.*

1. **Love Void Love: Dreams from the Abyss** (2019) — compiled early writings.
2. **The Book of Nought** — details limited in available corpus.
3. **The Point** (2021) — numbered philosophical-literary fragments. Written during severe mental health crisis.
4. **Forget the Plot** (2022) — **steganographic autobiography**. Random dictionary words (sourced via libraryofbabel.info) with confessional text embedded in bold. Final pages dissolve into pure visual noise. His most formally innovative work.
5. **Hatred** (2022) — raw confessional prose-poetry on misanthropy, self-loathing, isolation.

---

## APPENDIX B — Aesthetic Canon (VOID ENGINE)

> ⚠ **Secondary gloss.** Distilled by Claude from cross-session work, not authored as canonical aesthetic statement. Treat as orienting summary; defer to author for precise palette/type calls in production.

- **Mode:** neobrutalist, dark-first, anti-generic-AI.
- **Type:** IBM Plex Mono (primary), IM Fell English / EB Garamond / Cormorant Garamond (book interior).
- **Palette:** void substrate (#0a0908), red_blood (#8b0a1a), bone (#c9b89a), with deeper voids and dimmer bones for shading. See `visual_generation_reference.md` for full hex set.
- **Visual instincts:** asymmetric structure, fractured rings, monospace captions, sparse interference fields. Closure without resolution.

## APPENDIX C — Philosophical Framework Canon

> ⚠ **Secondary gloss.** Concept names are author's; one-line definitions are Claude's compressed paraphrases for orientation. For precise phrasing, consult the source artifacts (Malgré Tout, essay-film script, EFIList canon, *Null Return* drafts).

Concepts that recur across book, essay-film, EFIList library, game, and proxy work. New Claude should know these by name:

- **Benatar's Asymmetry** — absence of pleasure for non-existent ≠ bad; presence of pain for existent = bad.
- **Alogical Isness** — the universe does not consult reason; existence as bare unjustified fact.
- **Contextus Claudit** — the closing of context; horizons of understanding.
- **Labor Sine Fructu** — labor without fruit. Effort uncompensated by outcome.
- **Proxy Gamble** — bringing a child into existence wagers their suffering on your psychological validation.
- **Terror Management Theory** (Becker) — proximal/distal defenses against mortality salience.
- **Pollyanna Principle / Optimism Bias** (Sharot) — biological hardwiring for distorted positive recall.
- **No Essential Protection** — cosmological-horror anchor; the universe offers no guaranteed shielding.
- Lineage cited: Schopenhauer, Mainländer, Cioran, Ligotti, Zapffe, Benatar.

## APPENDIX D — Writing Voice Canon (style features)

> ⚠ **Secondary gloss.** Style observations distilled by Claude from author's prose, not authored style guide. Useful for orientation; defer to author when adjudicating "is this in voice?"

For any Claude advising on his prose:

- **Em-dash cascades** — cognitive branching, parallel processing on the page.
- **Triadic escalation** — "bitter, sour, and hopeless."
- **Protective parenthetical** — vulnerability appears in asides, not main clauses.
- **Baroque mode** (emotionally activated): long, cascading, visceral. **Clinical mode** (detached): short, declarative, formal. Best work fuses both.
- **Neologism impulse** — constantly coining terms.
- **Archaic register** in creative prose ("thee," "o'er," "hither").
- **Censored profanity** in public comments (k\*ll, r\*pe); uncensored in books.

## APPENDIX E — Identity / Handles

- **Josiah S. Cooper** — legal name.
- **WULD** — primary publishing/release moniker. W.U.L.D.: Incorporated is the umbrella identity.
- **Evilis Anihilis Uls** — performative/ritual register.
- **AnomicIndividual87** — online comment / forum handle.
- Background: deconstructed from radical Evangelical Christianity. Self-taught. Not a coder. Collaborates with Claude as organizing force and honest outside perspective.
- Personal preferences (already in Claude memory but worth surfacing): direct critical engagement over flattery, light evenings over intensive grinding, free distribution and open-source tooling.

## APPENDIX F — Cross-Project Map

Projects share corpus, vocabulary, and aesthetic. Touching one often touches another.

- **Book ↔ Essay-Film** — share the *Alogical Isness* corpus and the metaphysical-nihilism territory. Distinct artifacts, common DNA.
- **Book ↔ EFIList Library** — frameworks (Asymmetry, Proxy Gamble, TMT, Pollyanna) cited in both. Library tags reach back to book canon.
- **Game ↔ Book + Essay-Film** — GAME_CANON.md is built from book/essay-film source material. Game is the playable extension of the same corpus.
- **W.U.L.D. Engine Suite ↔ Aesthetic Canon (Appendix B)** — Suite is the operational instance of the visual register; everything else inherits from or coexists with it.
- **Successor Protocol ↔ All creative work** — the proxy is calibrated against the published works (Appendix A) and current corpus. It speaks *for* him, so it's downstream of everything.
- **NothinGist** — appears as completed YouTube short film (in older memory) AND as interlude inside Malgré Tout. Same name, two artifacts. Don't conflate.

## APPENDIX G — Operational Discipline (cross-project)

Recurring rules across projects. New Claude should default to these unless a project block overrides:

- **Surgical edits over rewrites.** Especially for HTML/JS payloads (engine suite, EFIList library) and ODT covers (Malgré Tout). Full-file rewrites prohibited or strongly discouraged across most projects.
- **Canonical state files = read first.** `bookcanon.md`, `GAME_CANON.md`, `project_canon.json`, `HANDOFF.md`, `emulationcanon`. Each project has one. Find it, read it, then act.
- **One deliverable per session** is the EFIList library default. Other projects vary but conservatism is preferred.
- **Versioned dated files** preferred over in-place editing where feasible.
- **Greps with offset/line-slice guards** for files containing single-line literals (EFIList `index.html`, large canon files).
- **Token-economy awareness.** Object explicitly when an action risks wasted resources. Plan around chat ceilings.
- **No flattery, no menus** unless agreed for efficiency. Stake positions; concede only to superior arguments.
- **Conciseness exception for proxy work and where compression hurts quality.**

## APPENDIX H — Format Recommendations (for the next baton template)

If you revise the per-project baton template itself, consider:

1. **Split NOTES into structured sub-fields:** `CANONICAL_FILES` (read-first paths), `GOTCHAS` (operational hazards), `DISCIPLINE` (project-specific rules), `CROSS_REFS` (linked projects), `META` (catch-all). NOTES currently mixes these and the ingesting Claude has to disentangle them.
2. **Sub-tag STATUS:** `alive (active)` vs `alive (waiting on external)` vs `alive (cooling)`. Malgré Tout is technically "alive" but operationally "waiting on physical proof"; Engine Suite is "alive" but cooling. Same status word, different operational meaning.
3. **Standardize dates** on ISO when known. Mixed precision is fine; mixed format isn't.
4. **Anchor PULSE** with a calibration sentence per project, not just a number — or accept that the number is impressionistic and read accordingly.
5. ~~Add a PRIORITY field separate from PULSE.~~ **(Reviewed in v2 — declined.)** Two scalars invite confusion; keep pulse impressionistic and let blockers + status + author judgment carry priority.

---

## BIOGRAPHICAL SCOPE — what this document carries vs. what it doesn't (new in v2)

This document deliberately includes some biographical context because creative work is unintelligible without it. It deliberately excludes other biographical context because a project-reference is not a personality dossier.

**Included (and where):**
- Deconstruction from radical Evangelical Christianity (Appendix E) — explains thematic territory.
- "Written during severe mental health crisis" qualifier on *The Point* (Appendix A) — explains formal extremity.
- Working preferences, collaboration style, mode of self-teaching (Appendix E).

**Deliberately excluded:**
- Detailed mental health history (diagnoses, episodes, treatment).
- Self-disclosure regarding sadistic inclinations or related private content.
- Specific extreme-ideology research interests.

**Rationale:** the included items are interpretive context any reader of the work would eventually infer; the excluded items are private-by-default and would over-disclose on the author's behalf. The line is drawn on the side of caution. If you (Josiah) want any of the excluded items added — at any granularity — say so explicitly and they go in.

---

## CHANGELOG / TRANSPARENCY

### Changes from `project-baton_8.md` (v1):

| # | Change | Rationale |
|---|---|---|
| 1 | Added META block | Document needs version, calibration, read-order |
| 2 | Added QUICK INDEX table + heat reading | 30-second orientation for new Claude |
| 3 | Reordered project blocks by pulse + production-stage | Original order was add-order; pulse-order surfaces what's hottest first |
| 4 | Project blocks themselves left **unchanged** verbatim | Avoid silently editing your authored summaries |
| 5 | Added Appendix A (Published Works) | The 5 existing books were not in baton; they define voice and prior territory |
| 6 | Added Appendix B (Aesthetic Canon) | VOID ENGINE register lived in scattered NOTES; consolidated |
| 7 | Added Appendix C (Philosophical Framework Canon) | Concepts (Asymmetry, Alogical Isness, Contextus Claudit, etc.) recur cross-project; new Claude needs glossary |
| 8 | Added Appendix D (Writing Voice Canon) | Style features (em-dash cascades, baroque/clinical fusion, etc.) needed for prose advising |
| 9 | Added Appendix E (Identity / Handles) | Names, deconstruction-from-Evangelicalism context, working preferences |
| 10 | Added Appendix F (Cross-Project Map) | Projects share corpus and vocabulary; explicit map prevents siloed reasoning |
| 11 | Added Appendix G (Operational Discipline) | Cross-project rules (surgical edits, canon-files, versioning, etc.) repeated in every NOTES block; consolidated |
| 12 | Added Appendix H (Format Recommendations) | If/when you revise the per-project template, suggested structural improvements |

### Changes from v1 → v2 (this revision):

| # | Change | Rationale |
|---|---|---|
| 13 | Added "Appendix provenance markers" to META | Distinguish author-sourced appendices (A, E, F, G, H) from secondary-gloss appendices (B, C, D) so downstream Claudes don't treat compressed paraphrase as canonical phrasing |
| 14 | Added ⚠ Secondary gloss header to Appendices B, C, D | Same reason, in-place — visible at point of use |
| 15 | Added BIOGRAPHICAL SCOPE section | Make the inclusion/exclusion line explicit and reviewable, not buried in a "did NOT add" note at the bottom |
| 16 | Marked Appendix H item 5 (PRIORITY field) declined-on-review | Two scalars (PULSE + PRIORITY) would invite confusion; one impressionistic signal is enough |
| 17 | Companion file: `claude_md_index_slice_v1.md` | Slim always-loaded slice for CLAUDE.md; this full document becomes load-on-demand sibling |

**Sourcing (unchanged from v1):** Appendix A drawn from a 2026-04-14 corpus-organization session. Appendix D drawn from the same session. Appendices B/C/E/F/G drawn from cross-session memory (multiple project sessions Apr 2026). Appendix H is editorial recommendation, not historical content.

**Confidence:** High on appendix content (multiple corroborating sessions). Medium on PULSE numbers — they are author's numbers from the baton; not recalibrated.
