# tools/omega — multi-persona gate (Ω1)

Ω1 is the **vessel**: the tooling that lets a SECOND persona exist beside Yūrei,
fed to the byte-identical engine (`src/components/yurei-oracle.js`) as a separate
`Matcher` instance, proven not to perturb her. A persona is a corpus file + a
persona id — not a second engine. See `docs/omega-persona-convention.md` and
`docs/alpha-omega-successor-protocol-design-v0_2.md`.

## Files this proves

| file | role |
|---|---|
| `src/components/omega-corpus-placeholder.json` | PLACEHOLDER second-persona seed (`persona: "mrgrey"`). Positionless site-meta scaffolding (every non-crisis entry `_placeholder:true`) + a verbatim-inherited crisis floor. **Not authored content** — library-Claude replaces every `_placeholder` entry with the real Mr. Grey register. |
| `omega-persona-gate.cjs` | **THE gate.** Reuses `yurei-oracle.js`; asserts Yūrei unperturbed + a positionless, id-disjoint, bleed-free, floor-inheriting persona. |

## Run

```
node tools/omega/omega-persona-gate.cjs
# or point at an alternate persona/corpora:
node tools/omega/omega-persona-gate.cjs <persona.json> <public.json> <oracle.json>
```

Exit 0 iff every fatal gate (A–F) is green.

## Invariants (do not break silently)

- **Yūrei is byte-unchanged.** The engine + both Yūrei corpora + `yurei-assistant.js`
  are untouched by Ω1; Gate A re-runs the real `yurei-parity.cjs` (100/100) as the
  live conservation proof.
- **Positionless.** The second persona carries site-help / meta / register-
  appropriate deflection only — no positions, no stances. Gate B enforces it
  (no position class, no stance field, no stance tag; non-crisis ⇒ `_placeholder`).
- **Crisis inherited, never weakened.** Shared `c-crisis-*` ids are exempt from
  id-disjointness and asserted deep-equal to Yūrei's (Gate C); they fire under the
  persona matcher (Gate E).
- **Separate instances = isolation.** One `Matcher` per persona; per-instance
  state and any persona-keyed side store keep bleed at 0 (Gates D, F).
- The Mr. Grey **surface** (tab + avatar mount) is Ω2; the **register + real
  entries** are chat/library-Claude. Cowork authors no persona register.
