# Omega persona convention + schema note

The contract that lets more than one persona share Yūrei's engine without a second
engine and without perturbing her. Durable — a persona's corpus content is
replaceable; this convention is not.

## A persona is a corpus file + a persona id

- **One JSON file per persona**, same envelope as the Yūrei corpus:
  `{ "yurei_corpus": { "schema", "persona", "tier", "authored", "entries": [...] } }`.
  The `persona` id (e.g. `"mrgrey"`) is the only new top-level field — documentation
  + tooling metadata, forward-compat for a later single-matcher "unify the gate"
  step. **The engine does not read it** — `yurei-oracle.js` is byte-unchanged and
  persona-agnostic.
- **Entry schema is identical to Yūrei's**: `id, class, tier, patterns:[{form,
  mode, weight}], response, register_tags (1..3), length_band, animation_hint`
  (+ `href, nav_label` on `oracle`; `followups` where used). Classes are the same
  matcher classes: `response · deflection · oracle · crisis · repeat`.
- **Entry ids are prefixed per persona** so namespaces never collide (Yūrei uses
  `r- / d- / c- / a- / rp- / o-`; the proxy persona uses `mg-`). The gate asserts
  non-crisis id-disjointness.

## Who authors what

- **The vessel/surface is Cowork**: the schema, the gate, the loader convention,
  the file mechanics, and (at Ω2) the mount.
- **The register + real entries are authored by the seat that holds Josiah's
  register.** For the `mrgrey` persona that is the **Successor Protocol seat** —
  its voice *is* Josiah's own. **"Mr. Grey" is only the black-cat avatar (a skin),
  not a separate register.** Cowork authors no register.
- The **argument-library / positions** work (R1–R5) is a *different* seat
  (library-Claude) and a *different* phase (Phase 4, the ratification cliff) —
  out of scope for this convention.

## Crisis is inherited, never weakened

Crisis entries are the **safety floor**, shared across personas. Each persona file
carries **its own copy** of the Yūrei crisis entries (same ids — `c-crisis-*` —
*by design*, because they are the same entry), so a persona corpus is
self-sufficient: load it and the floor is present. The gate **exempts crisis from
id-disjointness** and instead asserts each shared crisis entry is **deep-equal** to
Yūrei's; if the floor is edited anywhere, the gate goes RED until every persona
re-inherits it. Crisis entries are inherited-real and therefore **never**
`_placeholder`.

## `_placeholder` discipline (scaffold vs real)

- A **scaffold** corpus (envelope `_placeholder:true`, e.g. the now-retired seed)
  must flag **every non-crisis entry** `_placeholder:true` — so unreviewed
  scaffolding can never masquerade as authored content.
- A **real** corpus (no envelope `_placeholder`, e.g. `omega-corpus-mrgrey.json`)
  must carry **no `_placeholder`** on any entry — the absence is the deliberate
  "this is authored, in-register, and it is the author's, not Cowork's" state.
- The gate enforces the correct rule per corpus, and (real corpora) checks every
  `followups` target resolves within the persona.

## Loader convention (no engine edit)

A caller builds one `Matcher` **instance per persona**. Per-instance session state
(`input_hist`, `emit_turn`, `followups_used`, `last_entry_id`, `turn`) **is** the
isolation — two personas cannot bleed because they are two objects.

```js
// Yūrei, today, unchanged:
const yurei = new window.YureiOracle.Matcher(
  publicEntries.concat(oracleEntries), { unsealed: false });

// A second persona (Ω2 mounts this; Ω1 only documents it):
const { entries } = (await fetch('/components/omega-corpus-mrgrey.json')
  .then(r => r.json())).yurei_corpus;
const proxy = new window.YureiOracle.Matcher(entries, { unsealed: false });
```

Rules for any persona mount (Ω2+):
- **One instance per persona.** Never concatenate two personas' entries into one
  matcher in the separate-file architecture — that is the later unify step and
  needs a persona-scoped candidate filter first (below).
- **Persona-key every side store.** Any per-persona state outside the matcher — a
  seen-set in `localStorage`, a gap-log lane — must be keyed by persona
  (`wuld:admin-yurei-seen` → `wuld:admin-<persona>-seen`, `gap_log_*` per persona).
- **Crisis rides inside the corpus**, so every mount inherits the floor for free.

## What "unify the gate" will add later (NOT now)

Personas legitimately **share trigger vocabulary** — every persona greets on
"hello". Under separate instances that is not bleed; each stays in its own lane. A
future single matcher (one matcher, `persona` field on entries) would see those
shared forms collide, so it must gain a **persona-scoped candidate filter**
(restrict scoring to the active persona's entries + the shared crisis floor)
*before* corpora merge. The gate reports these overlaps as a non-fatal
**unify-readiness** count — a to-do for that step, not a defect now.

## The gate

`tools/omega/omega-persona-gate.cjs` reuses the byte-identical engine and asserts,
fatally: (A) the Yūrei battery is unperturbed (re-runs `yurei-parity.cjs`, 100/100
+ sub-gates); (B) positionless + schema-valid (+ `_placeholder` discipline +
followup integrity); (C) id-namespaces disjoint (crisis-exempt) with crisis
deep-equal-inherited; (D) cross-persona bleed = 0 over a mixed probe; (E) the
crisis floor fires under the persona matcher; (F) per-persona state is isolated.

```
node tools/omega/omega-persona-gate.cjs
```
