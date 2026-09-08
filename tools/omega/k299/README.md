# K299 fold pipeline

The five scripts that produced the K299 corpus + engine, in the order they must run. Committed
because a change that re-spells 81 declared forms across three corpora is repo state, not
scratch: the next session re-derives it rather than trusting a paragraph.

```
python3 tools/omega/k299/patch_engine.py .   # 1. normalizer, BOTH sides of the parity contract
python3 tools/omega/k299/patch_corpus.py .   # 2. TX15-BACK Ask C + Ask A + the §1/§3 rulings
python3 tools/omega/k299/respell.py     .    # 3. canonicalise EVERY form under the new normalizer
python3 tools/omega/k299/patch_audit.py .    # 4. move the audit's two hardcoded baselines
python3 tools/omega/k299/patch_ver.py   .    # 5. bump the engine cache-bust in both loaders
```

**Order is load-bearing.** `respell.py` must run AFTER `patch_corpus.py`, or the newly folded
crisis forms are left in contracted spelling and `omega-persona-gate` fails the pre-normalized
corpus law. Every script asserts its anchors and is idempotent on a second run.

`respell.py` is the reusable one: any future change to `normalize()` requires it, because the
corpora assert that every declared form equals its own normalized value. It normalizes through
the REAL engine via `node`, never a python re-implementation of it.

Gates that must be green after a run (all four were, at K299):
`tools/yurei/yurei-parity.cjs` · `tools/omega/omega-persona-gate.cjs` ·
`tools/omega/mrgrey-register-gate.cjs` · `tools/omega/coverage_audit.cjs "" "" "" <out>.json`
