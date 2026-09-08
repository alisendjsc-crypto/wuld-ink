#!/usr/bin/env python3
"""K306 §3 fold — the library's own title phrasings that deflect.

Source of truth: tools/omega/k306/candidates_k306.json, itself derived from
coverage_audit §7a' (sections.subject.signed_title_gaps) + the kickoff's named
extras.  The list is READ, never retyped (cclxxxii), and its length asserted.

Mode/weight per TX18-BACK: `exact` for a single ordinary word (the `community`
precedent), `contains`@w2 for a distinctive multi-word phrase (scores 62 -- above
mg-topical-deflect-01's 61, below every w3 position form, so subordination holds).

Doctrine-not-name (TX19-BACK) is honoured by OMISSION: every name-bearing phrasing
in §7a' is held for the library seat, not folded here.
"""
import io, json, sys

CORPUS = "src/components/omega-corpus-mrgrey.json"
CAND   = "tools/omega/k306/candidates_k306.json"
EXPECT = 33            # assert the parsed length (cclxxxii)

raw = io.open(CORPUS, encoding="utf-8", newline="").read()
assert "\r" not in raw, "corpus has CR"
d = json.loads(raw)

# --- serializer round-trip proof BEFORE touching anything (K219/K299) ---
ser = lambda o: json.dumps(o, indent=2, ensure_ascii=False) + "\n"
assert ser(d) == raw, "serializer mismatch -- refusing to write a reformatted corpus"

cand = json.load(open(CAND, encoding="utf-8"))["fold"]
assert len(cand) == EXPECT, "candidate count %d != %d" % (len(cand), EXPECT)

E = d["yurei_corpus"]["entries"]
byid = {e["id"]: e for e in E}
before_forms = sum(len(e.get("patterns", [])) for e in E)
before_keys  = {e["id"]: sorted(e.keys()) for e in E}

for c in cand:
    e = byid[c["entry"]]                       # KeyError = a bad id, fail loud
    have = {(p["form"], p["mode"]) for p in e.get("patterns", [])}
    assert (c["form"], c["mode"]) not in have, "duplicate: %s on %s" % (c["form"], c["entry"])
    e["patterns"].append({"form": c["form"], "mode": c["mode"], "weight": c["weight"]})

after_forms = sum(len(e.get("patterns", [])) for e in E)
assert after_forms - before_forms == EXPECT, "form delta %d != %d" % (after_forms - before_forms, EXPECT)
# key-shape drift guard (cclxxiii): no entry may gain or lose a key
assert {e["id"]: sorted(e.keys()) for e in E} == before_keys, "entry key-shape drift"
assert len(E) == len(byid), "entry count moved"

out = ser(d)
assert "\r" not in out and "\ufffd" not in out, "CR or U+FFFD in output"
io.open(CORPUS, "w", encoding="utf-8", newline="").write(out)
print("folded %d forms; entries %d, forms %d -> %d" % (EXPECT, len(E), before_forms, after_forms))
