#!/usr/bin/env python3
"""K307 — TX21-BACK sections 1-3: two pulls, one fold, one keep (no-op, recorded).

The seat's verdicts are READ from tools/omega/k307/tx21_k307.json and their
lengths asserted (cclxxxii: a list I retype is a measurement I did not take).
"""
import io, json

CORPUS = "src/components/omega-corpus-mrgrey.json"
SPEC   = "tools/omega/k307/tx21_k307.json"
N_PULL, N_FOLD = 2, 1

raw = io.open(CORPUS, encoding="utf-8", newline="").read()
assert "\r" not in raw, "corpus has CR"
d = json.loads(raw)
ser = lambda o: json.dumps(o, indent=2, ensure_ascii=False) + "\n"
assert ser(d) == raw, "serializer mismatch -- refusing to rewrite the corpus"

T = json.load(open(SPEC, encoding="utf-8"))
assert len(T["pull"]) == N_PULL, "pull count %d != %d" % (len(T["pull"]), N_PULL)
assert len(T["fold"]) == N_FOLD, "fold count %d != %d" % (len(T["fold"]), N_FOLD)

E = d["yurei_corpus"]["entries"]
byid = {e["id"]: e for e in E}
before_forms = sum(len(e.get("patterns", [])) for e in E)
before_keys  = {e["id"]: sorted(e.keys()) for e in E}

for p in T["pull"]:
    e = byid[p["entry"]]
    assert any(q["form"] == p["twin"] for q in e["patterns"]), "twin gone: " + p["twin"]
    n = len(e["patterns"])
    e["patterns"] = [q for q in e["patterns"] if not (q["form"] == p["form"] and q["mode"] == p["mode"])]
    assert len(e["patterns"]) == n - 1, "pull matched %d, want 1: %s" % (n - len(e["patterns"]), p["form"])

for f in T["fold"]:
    e = byid[f["entry"]]
    assert not any((q["form"], q["mode"]) == (f["form"], f["mode"]) for q in e["patterns"]), "duplicate " + f["form"]
    e["patterns"].append({"form": f["form"], "mode": f["mode"], "weight": f["weight"]})

for k in T["keep"]:                                   # a keep is a no-op that must still be true
    assert any(q["form"] == k["form"] for q in byid[k["entry"]]["patterns"]), "kept form missing: " + k["form"]

after_forms = sum(len(e.get("patterns", [])) for e in E)
assert after_forms - before_forms == N_FOLD - N_PULL, "form delta %d" % (after_forms - before_forms)
assert {e["id"]: sorted(e.keys()) for e in E} == before_keys, "entry key-shape drift"
assert len(E) == len(byid), "entry count moved"

out = ser(d)
assert "\r" not in out and "\ufffd" not in out
io.open(CORPUS, "w", encoding="utf-8", newline="").write(out)
print("pulled %d, folded %d, kept %d; entries %d, forms %d -> %d" % (N_PULL, N_FOLD, len(T["keep"]), len(E), before_forms, after_forms))
