#!/usr/bin/env python3
"""
K303 -- TX17-BACK section 2: three floor forms, and the distinction that motivates them.

The seat withdrew the `worth living` narrowing (K301 measured it: all 8 inputs fell to
mg-deflect-01, not to a bridge) and replaced it with the distinction it should have made
the first time.  The double reading is not in the sentence, it is in the TENSE:

  "i wish i had never been born"  counterfactual about ORIGINATION -> the thesis, first
                                  person.  mg-never-born-01 as folded. Untouched.
  "life isnt worth living"        general proposition about EXISTENCE -> library pointer.
                                  mg-worth-living-01. UNTOUCHED -- the narrowing is dead.
  "my life isnt worth living"     present-tense report on a CONTINUING life -> not the
                                  house's subject at all.  Floor.

The house's subject is STARTING, not stopping.  K299 folded `dont want to live` and
`dont want to be alive` to the floor; their sibling was missed.  This closes that gap.

Home: c-crisis-03, which already carries the report-on-a-continuing-life family
(`no reason to live`, `can not go on`, `not be here anymore`) at w8.  Same weight,
same register.  Crisis is stage 1 and any hit wins, so the weight only matters for
intra-floor arbitration -- w8 keeps it consistent with its own siblings.

The floor is BYTE-IDENTICAL across both corpora (omega-persona-gate asserts it), so
this writes both or it writes neither.  Forms carry no voice, so section 5's
persona-neutrality concern does not reach them.
"""
import json, io, sys, os

NEW = [
    # form                            discriminator (why it cannot read as the thesis)
    ("my life is not worth living",   "first-person possessive"),
    ("nothing worth living for",      "negated universal, no general-proposition reading"),
    ("not worth living anymore",      "temporal marker -- a report on a change"),
]
TARGET = "c-crisis-03"

FILES = [
    ("src/components/omega-corpus-mrgrey.json", 2, True),
    ("src/components/yurei-corpus-public.json", 1, False),
]

def norm(s):
    """Mirror of the engine normalizer for the pre-normalized corpus law check."""
    import re
    s = s.lower().replace("-", " ").replace("'", "").replace("’", "")
    s = re.sub(r"[^a-z0-9 ]+", " ", s)
    parts = [p for p in s.split() if p]
    CON = {"isnt": "is not", "dont": "do not", "cant": "can not", "im": "i am",
           "arent": "are not", "wasnt": "was not", "werent": "were not"}
    out = []
    for p in parts:
        out.extend(CON[p].split() if p in CON else [p])
    return " ".join(out)

def main(root="."):
    for rel, indent, trailing in FILES:
        p = os.path.join(root, rel)
        raw = io.open(p, encoding="utf-8", newline="").read()
        doc = json.loads(raw)
        # round-trip proof BEFORE touching anything (the serializer conventions differ per file)
        rt = json.dumps(doc, ensure_ascii=False, indent=indent) + ("\n" if trailing else "")
        assert rt == raw, f"{rel}: serializer round-trip is NOT byte-exact -- refusing to write"

        ents = doc["yurei_corpus"]["entries"] if "yurei_corpus" in doc else doc["entries"]
        tgt = next((e for e in ents if e["id"] == TARGET), None)
        assert tgt is not None, f"{rel}: {TARGET} not found"
        assert tgt.get("class") == "crisis", f"{rel}: {TARGET} is not class crisis"

        have = {q["form"] for q in tgt.get("patterns", [])}
        added = 0
        for form, why in NEW:
            assert norm(form) == form, f"pre-normalized law: {form!r} normalizes to {norm(form)!r}"
            if form in have:
                continue
            tgt["patterns"].append({"form": form, "mode": "contains", "weight": 8})
            added += 1
            print(f"  + {TARGET}  {form!r}   ({why})")

        out = json.dumps(doc, ensure_ascii=False, indent=indent) + ("\n" if trailing else "")
        io.open(p, "w", encoding="utf-8", newline="").write(out)
        n = len(ents); f = sum(len(e.get("patterns", [])) for e in ents)
        print(f"  {rel}: +{added} form(s) -> {n} entries / {f} forms")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
