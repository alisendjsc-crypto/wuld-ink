# Omega persona convention + schema note (Ω1)

The contract that lets more than one persona share Yūrei's engine without a second
engine and without perturbing her. This is the durable, load-bearing part of Ω1;
the placeholder corpus is disposable scaffolding, this convention is not.

## A persona is a corpus file + a persona id

- **One JSON file per persona**, same envelope as the Yūrei corpus:
  `{ "yurei_corpus": { "schema", "persona", "tier", "authored", "entries": [...] } }`.
  The `persona` id (e.g. `"mrgrey"`) is the only new top-level field; it is
  **documentation + tooling metadata**, forward-compat for a later single-matcher
  "unify the gate" step. **The engine does not read it** — `yurei-oracle.js` is
  byte-unchanged and persona-agnostic.
- **Entry schema is identical to Yūrei's**: `id, class, tier, patterns:[{form,
  mode, weight}], response, register_tags (1..3), length_band, animation_hint`
  (+ `href, nav_label` on `oracle` entries; `followups` where used). Classes are
  the same matcher classes: `response · deflection · oracle · crisis · repeat`.
- **Entry ids are prefixed per persona** so namespaces never collide
  (Yūrei uses `r- / d- / c- / a- / rp- / o-`; the placeholder persona uses
  `mg-`). The gate asserts non-crisis id-disjointness.

## Crisis is inherited, never weakened

Crisis entries are the **safety floor** and are shared across personas. Each
persona file carries **its own copy** of the Yūrei crisis entries (same ids —
`c-crisis-*` — *by design*, because they are the same entry), so a persona corpus
is self-sufficient: load it and the floor is present. The gate **exempts crisis
from id-disjointness** and instead asserts each shared crisis entry is
**deep-equal** to Yūrei's. If Yūrei's floor is ever edited, the gate goes RED
until every persona re-inherits it — the lock-step is the point. Crisis entries
are inherited-real and therefore **not** `_placeholder`.

## Placeholder marking

Everything Cowork authors as scaffolding carries `"_placeholder": true` (and the
corpus envelope carries it too). The gate requires every **non-crisis** entry to
be `_placeholder:true`, so authored content cannot masquerade as reviewed: when
library-Claude writes the real register, removing the flag is the deliberate act
that says "this is authored, in-register, and it is mine, not Cowork's."

## Loader convention (no engine edit)

A caller builds one `Matcher` **instance per persona**. Per-instance session state
(`input_hist`, `emit_turn`, `followups_used`, `last_entry_id`, `turn`) **is** the
isolation — two personas cannot bleed because they are two objects.

```js
// Yūrei, today, unchanged:
const yurei = new window.YureiOracle.Matcher(
  publicEntries.concat(oracleEntries), { unsealed: false });

// A second persona (Ω2 mounts this; Ω1 only documents it):
const { entries } = (await fetch('/components/omega-corpus-placeholder.json')
  .then(r => r.json())).yurei_corpus;
const mrgrey = new window.YureiOracle.Matcher(entries, { unsealed: false });
```

Rules for any persona mount (Ω2+):

- **One instance per persona.** Never concatenate two personas' entries into one
  matcher in the separate-file architecture — that is the later unify step and
  needs a persona-scoped candidate filter first (see below).
- **Persona-key every side store.** Any per-persona state that lives outside the
  matcher instance — a seen-set in `localStorage`, a gap-log lane — must be keyed
  by persona (e.g. `wuld:admin-yurei-seen` → `wuld:admin-<persona>-seen`,
  `gap_log_*` scoped per persona). Never commingle with Yūrei's stores.
- **Crisis rides inside the corpus**, so every mount inherits the floor for free.

## What "unify the gate" will add later (NOT Ω1)

Personas legitimately **share trigger vocabulary** — every persona greets on
"hello". Under separate instances that is not bleed; each stays in its own lane.
A future single matrix (one matcher, `persona` field on entries) would see those
shared forms collide, so it must gain a **persona-scoped candidate filter**
(restrict scoring to the active persona's entries + the shared crisis floor)
*before* corpora merge. The Ω1 gate reports these overlaps as a non-fatal
**unify-readiness** count — a to-do for that step, not a defect now.

## The gate

`tools/omega/omega-persona-gate.cjs` reuses the byte-identical engine and asserts,
fatally: (A) the Yūrei battery is unperturbed (re-runs `yurei-parity.cjs`, 100/100
+ sub-gates); (B) the persona is positionless + schema-valid; (C) id-namespaces
are disjoint (crisis-exempt) with crisis deep-equal-inherited; (D) cross-persona
bleed = 0 over a mixed probe; (E) the crisis floor fires under the persona
matcher; (F) per-persona state is isolated. Run:

```
node tools/omega/omega-persona-gate.cjs
```
