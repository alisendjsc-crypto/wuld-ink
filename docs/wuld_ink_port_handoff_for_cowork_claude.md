# wuld.ink Port — Coordination Handoff for Cowork Claude

**Status: PORT DEFERRED.** Read this whole document before any action.

You are receiving this from a regular-Claude session (claude.ai) mid-execution on the efilist argument library project (Josiah / AnomicIndividual87). The operator asked regular-Claude whether the wuld.ink port should begin now. Regular-Claude said no. This document explains why, what would change that, and what — if anything — cowork-Claude can usefully do in the meantime.

---

## 1. Project identity (read first)

**efilist argument library** — antinatalism objection taxonomy. 78 objections across 5 tiers, 34 mechanisms, force-directed map (MAP1) modeling four interlocutor archetypes (sophisticate / defender / drifter / blended). Author: Josiah. This is his intellectual work — treat it as such. The objections are live philosophical claims, not neutral specimens; engage substantively where you engage at all. Register: direct, no flattery, no hedging. Iconoclastic framing is welcome when it earns its keep, not as costume.

**Current artifact set** (paths as seen on regular-Claude side; cowork may need different mounts):
- `efilist_argument_library_v3_7_post_c8_ord3.json` — canonical JSON corpus (~1.07 MB)
- `efilist_argument_library_v3_7_post_c8_ord5.jsx` — React component (~583 KB)
- `index_v3_7_post_c8_ord9.html` — standalone HTML (~1.65 MB; contains the large JS literals MAP_GRAPH_DATA, DEP_GRAPH_DATA, MAP1_TRANSITIONS that drive the viz)
- `coda_v3_7.html` — supplementary
- `project_canon_v19_0.json` — authoritative state (~1.18 MB)
- Schemas, validators, build-batch artifacts (peripheral)

**Critical operational hazard**: `index.html` contains single-line JS literals hundreds of KB each. NEVER `view` it. NEVER `grep` it without a line-range slice or `-c` / `-l` / `| head`. The regular-Claude side has line-bounded `awk` → `node` eval → `python3` pipelines for surgery on those literals; cowork should not need to touch them.

---

## 2. Why the port is deferred — four gates

**Gate 1: Coverage milestone unmet.** The wuld.ink integration relay (canon block `wuld_ink_integration`) anchors stable-tag declaration to "Sigma-m3 build-pass close (RWE 90%+)". Current coverage: 65/78 distinct objections touched = 83.3%. Need 71/78 (≥91%). Sigma-m3 — the mining session that would clear this — has not yet executed (the v19.0 canon's `next_recommended_session` for sigma-m3 was found, this session, to point at already-merged batches; canon-vs-reality drift, instance of Q94). Real sigma-m3 has to run.

**Gate 2: Two open verbatim/attribution questions.**
- **Q97** — candidate_5 `prem_pleasure-as-relief` node-existence resolution: preflight required before any candidate_5 cascade mutation. Status: open.
- **Q98** — Inmendham (Gary Mosher) thought-experiments source-attribution: open since pre-c6 era. Public-facing publication with unresolved attribution risks false-attribution to a real living person. Status: open / source-attribution-required.

**Gate 3: Mech-inventory gap (Q106).** The 34-mech taxonomy has known structural gaps: dedicated nodes for **Counterexample Fallacy** and **Surface-Reading** are missing despite both being well-attested across the rebuttal arcs (most explicitly in T2 folk-philosophical hedonic cluster). Operator-deferred to long-term. May ship with the gap documented as a known limitation; should not ship silently over it.

**Gate 4: Six unresolved wuld.ink operational questions.** From canon `wuld_ink_integration.open_operational_questions_to_resolve_with_operator`, status `OPEN_PENDING_OPERATOR_ANSWER`. Chief one: *what declares a stable tag?* (c8 close? sigma-m3 close? both? a milestone elsewhere?) Until that's operator-defined, the port has no fixed target.

---

## 3. Timeline estimate to port-ready

Sequence (regular-Claude side, declared sessions):

1. **sigma-m3** — mining, 5–7 instances against the 13-objection residue pool; single session, footprint ≈ sigma-m1.
2. **sigma-m3-merge** — canonical merge into corpus; single session per sigma-m1-merge precedent.
3. **wuld-ops-sextet** — declared session answering the six pending ops questions; operator-decision-heavy, low compute.
4. **Q97 preflight** — candidate_5 node-existence resolution; single session if clean, potentially multi-session cascade if DAG mutation needed.
5. **Q98 resolution** — Inmendham source-attribution surface audit; single session if source materials staged, longer if rebuttals need rewording for v2-verbatim audit compliance.
6. **Optional: Q106 mech-inventory expansion** — cascade adding nodes 35 / 36 with backfill; multi-session.
7. **wuld-port-prep** — editorial wrap authoring, per-piece discipline application, baton template lock. Content session, not engineering. This is Josiah's authorial work; not delegable to either Claude instance.
8. **wuld-port-exec** — actual deployment. See §5 for vector.

Rough span: **4–8 declared sessions for gating work** (steps 1–5), plus **2–3 sessions for prep and execution** (steps 7–8). Calendar at observed operator cadence (1–3 sessions/day from recent session_log entries): **2–10 days** if continuous. More if Q98 turns out to be deep.

---

## 4. What cowork-Claude CAN usefully do right now (limited list)

Cowork is a desktop file/task automation tool, not a web-deployment agent. The eventual deployment vector is almost certainly **Claude in Chrome** (if wuld.ink is a CMS-style platform with an editor UI) or **Claude Code** (if Git-backed static site or API-driven). Cowork is most likely not the deployment vector.

Cowork-shaped tasks that could run in parallel with regular-Claude session work, **if Josiah wants**:

- **Local artifact backup + versioning** — snapshot canon, corpus JSON, JSX, HTML to a dated archive structure (e.g., `~/efilist_archive/YYYYMMDD/`). Disaster-recovery snapshots independent of the regular-Claude pipeline.
- **MD5 / size manifests** — generate a `manifest.json` summarizing all current artifacts with size, line count, MD5. Feed back to regular-Claude for `files` registry refresh in canon.
- **Editorial wrap drafting space** — open a local markdown scratch file (`efilist_wuld_wrap_draft.md`) for Josiah to compose the introduction / piece-framing that wuld.ink expects under per-piece editorial-drift discipline (per Exchange 3 locks). Cowork can structure-check it against agreed length / register / tag conventions once Josiah drafts.
- **Smoke-check the standalone HTML renders locally** — open `index_v3_7_post_c8_ord9.html` in a local browser, confirm no console errors, capture a screenshot for pre-port baseline.

Tasks cowork-Claude **SHOULD NOT** do:

- **Edit canonical artifacts** (JSON / JSX / HTML). Those mutations happen on the regular-Claude side under byte-minimal / cascade protocols. Cowork lacks the line-bounded extraction pipeline needed for safe HTML literal surgery.
- **Touch `project_canon_v19_0.json`.** Canon mutations are declared-session work; uncoordinated edits will desync the state machine.
- **Deploy anything to wuld.ink** without operator-defined stable-tag criteria (see Gate 4) and explicit operator go-ahead.

---

## 5. When the port becomes appropriate — deployment vector

When Gates 1–4 clear and Josiah authorizes deployment:

- **Recommended vector: Claude in Chrome** if wuld.ink is a CMS-style platform with a logged-in editor UI. Coordinate one session: open wuld.ink editor → paste piece-framing → upload the standalone HTML as embed payload → publish under operator-defined stable tag.
- **Alternative vector: Claude Code** if wuld.ink is Git-backed static site or has an API. Deployment is a commit + push or authenticated API call. Regular-Claude can prep the commit payload; Claude Code or CLI executes.
- **Operator-direct alternative**: Josiah uploads/commits himself. Regular-Claude provides the prepared artifact bundle.

**Pure port vs alternative.** A pure port of the current standalone HTML is technically feasible right now — one file, self-contained, renders. The objection is editorial: it omits the wrap negotiated in Exchanges 1–3 and ships sub-90% coverage. Josiah can override for a v0.1 / soft-launch / draft if he chooses — but doing so should be a deliberate operator decision to waive Gate 1, not a default fallback.

---

## 6. What to do if cowork-Claude receives this and Josiah asks "begin the port"

Push back. Cite the gates. Confirm whether one or more gates are being deliberately waived (e.g., "soft-launch v0.1 acknowledging incomplete coverage") or whether the regular-Claude side has cleared them since this doc was written. If gates have cleared, ask Josiah for (a) the operator-defined stable tag identifier and (b) the deployment vector — then proceed.

Do not silently expand scope. Do not invent stable-tag criteria. Do not deploy to a real public URL without explicit operator go-ahead.

---

## 7. Pointers back to the regular-Claude side

- Canon: `project_canon_v19_0.json` (~1.18 MB; authoritative state; re-read on every session open per project protocol).
- Open questions: canon `open_questions` array (19 items as of v19.0).
- Operational protocols: canon `update_protocol`, `session_close_protocol`, `canon_micro_session_protocol`.
- Hazard map: canon `hazard_map` (includes the `index.html` JS-literal hazard).
- wuld.ink relay history: canon `wuld_ink_integration` (3 exchanges logged; library-side close at v18.4).
- Drift protocol-Q: Q94 (`canon_reality_drift_detection_protocol`) — this handoff doc is itself the kind of artifact that surfaces such drift; flag it if you spot more.

End of handoff.
