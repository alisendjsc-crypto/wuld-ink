# tools/yurei — Yūrei matcher regression suite (K224)

The Yūrei desk-assistant answers from a **bounded bank of prepared answers and a
deterministic rule for choosing one**. No backend, no network, no open-domain QA.
This folder is the proof that the shipped JS matcher routes exactly like the
library-seat reference, and that the register holds.

## What ships and what it proves

| file | role |
|---|---|
| `yurei_harness.py` | REFERENCE matcher + validator + 8 schema fixtures + P1–P10 probes (library seat; the authority for persona routing). |
| `drift_check.py` | Register/voice drift battery (room routing, crisis-at-every-tier, deflection rotation, punctuation stats). |
| `build_corpus.py` | Persona corpus builder (provenance). |
| `build_oracle.py` | Authors + gates `yurei-corpus-oracle.json`: schema, register taboo/punctuation, **zero (form,mode) collision with persona**. |
| `emit_parity_vectors.py` | Emits `parity_vectors.json` — python ground-truth routing over fixtures + probes + a multi-turn differential battery + the oracle lane. |
| `parity_vectors.json` | The frozen ground truth. |
| `yurei-parity.cjs` | **THE gate.** Replays every vector through the JS matcher (`src/components/yurei-oracle.js`); asserts bit-for-bit routing, oracle direct-hits, inertness, ambiguous→persona split, crisis-absolute, and 0 collisions. |
| `verify_browser.mjs` | Optional headless e2e (needs Playwright; dev-only) — mounts the assistant, checks persona/oracle/crisis routing, dismiss, kill-switch, reduced-motion. |

## Run

```
# matcher parity (no deps beyond node) — the load-bearing gate
node tools/yurei/yurei-parity.cjs

# reference battery (needs the AUTHORING corpora incl. the sealed room plaintext,
# which is NOT committed to src/ — keep it in _audio-staging/ or your seat):
python3 tools/yurei/yurei_harness.py all <public.json> <room.json>
python3 tools/yurei/drift_check.py
python3 tools/yurei/build_oracle.py            # re-gates the oracle slice

# regenerate the ground truth after any corpus/matcher change:
python3 tools/yurei/emit_parity_vectors.py <public.json> <room.json> \
    src/components/yurei-corpus-oracle.json > tools/yurei/parity_vectors.json
```

## Invariants (do not break silently)

- **Crisis is absolute** and exempt from length bands + the paren gate (`schema.crisis.laws`).
- **Oracle is a bounded FAQ**, dampening-exempt, fires only on a direct hit (score ≥ 40);
  ambiguous inputs fall through to persona. Oracle forms are disjoint from persona forms.
- **Room tier stays sealed** in `src/` (Part 2 = AES-GCM ciphertext + two-door unlock).
  The matcher only exposes it when constructed `{unsealed:true}`.
- The JS matcher must reproduce `yurei_harness.py` routing **bit-for-bit** — `yurei-parity.cjs`
  is the CI gate for that.
