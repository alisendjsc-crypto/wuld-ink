#!/usr/bin/env python3
"""K301 — the always-answer flag and the subject net.

Josiah ruled 2026-09-08 ("go with your recommendations on all of the above").
Folds, against the K301 engine which reads `dampening_exempt` on both sides of
the JS/python parity contract:

  1. dampening_exempt: true on mg-oracle-help-01 — TX16-BACK section 1. As folded at
     K299 the second `help` in a session returned mg-repeat-01 and a rephrase
     inside the eight-turn window deflected. The seat asked for a class
     restore; the flag is the smaller fix, because the class was right (this
     entry has no href and does not belong in the oracle set).
  2. dampening_exempt: true on mg-never-born-01 — the seat named it. A visitor
     who says the house's own thesis twice must not be told they already asked.
  3. mg-topical-deflect-01 — TX16-BACK section 4, body verbatim from the seat. A
     single-token subject net at w1 `contains`, subordinate BY CONSTRUCTION:
     w1 contains scores 61, the floor of the realized alphabet
     (61,62,63,68,69,101,102,103), so it loses to every heavier or exact form
     and, on a 61-61 tie, to any longer matched form. It can only win when
     nothing else matched at all -- which is the population it exists for.
     It leaks nothing: every topical miss returns the SAME body, so a prober
     learns only that a word is on the subject list the front page publishes.

Idempotent. Run from repo root:  python3 <this> src
"""
import json, sys, pathlib

SUBJECT = ["asymmetry", "suffering", "consent", "procreation", "birth", "children",
           "harm", "pessimism", "extinction", "nonexistence", "sentience", "breeding",
           "offspring", "misanthropy", "nihilism", "antinatal"]

TOPICAL = {
  "id": "mg-topical-deflect-01",
  "class": "response",
  "tier": "public",
  "patterns": [{"form": w, "mode": "contains", "weight": 1} for w in SUBJECT],
  "response": ("That's on the subject, but not in a shape I hold. The arguments are written out "
               "at full strength beside their strongest objections - go read one and put it to me "
               "the way it's put there."),
  "register_tags": ["clinical", "site"],
  "length_band": "b3_passage",
  "animation_hint": "speak",
  "dampening_exempt": True,
  "note": ("K301, body verbatim from the Successor-Protocol seat (TX16-BACK section 4). The corpus "
           "had ONE deflection where it needs two: mg-deflect-01 is a STANCE deflection, correct "
           "for an off-topic probe and wrong for an on-topic miss, and nothing told the engine "
           "apart. Subordinate by construction at w1 contains (score 61, the floor of the realized "
           "alphabet), so it wins only when nothing else matched. No similarity scoring, no "
           "runner-up disclosed: every topical miss returns this same body.")
}

def load(p):
    return json.loads(pathlib.Path(p).read_text(encoding="utf-8"))

def save(p, doc, indent, nl):
    pathlib.Path(p).write_text(json.dumps(doc, indent=indent, ensure_ascii=False) + nl, encoding="utf-8")

def main(src):
    p = pathlib.Path(src) / "components" / "omega-corpus-mrgrey.json"
    doc = load(p); ents = doc["yurei_corpus"]["entries"]
    by = {e["id"]: e for e in ents}
    changed = []

    for eid in ("mg-oracle-help-01", "mg-never-born-01"):
        assert eid in by, "anchor entry missing: " + eid
        if by[eid].get("dampening_exempt") is not True:
            by[eid]["dampening_exempt"] = True
            changed.append("  +dampening_exempt  " + eid)

    if "mg-topical-deflect-01" not in by:
        # place it beside the deflection it complements, after the last mg-* response
        idx = max(i for i, e in enumerate(ents) if e["id"].startswith("mg-")) + 1
        ents.insert(idx, TOPICAL)
        changed.append("  +mg-topical-deflect-01 (" + str(len(SUBJECT)) + " subject tokens, w1 contains)")

    if not changed:
        print("  no-op (already folded)"); return
    save(p, doc, 2, "\n")
    for c in changed: print(c)
    print("\n  mrgrey entries %d  forms %d" % (len(ents), sum(len(e.get("patterns", [])) for e in ents)))

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "src")
