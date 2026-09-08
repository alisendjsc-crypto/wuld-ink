#!/usr/bin/env python3
"""
K304 -- TX19-BACK item 4: the twelve K268/K270 positions the seat's July mirror cannot see.

The seat offered "run the generator against the live 188, or send me the forms."  The
forms exist already: inflected-triggers-K299.md was generated against the LIVE corpus
and covers 86 position entries.  Extracted the K268/K270 rows -- 19 candidates over 11
entries -- and put them through the SAME filter applied to the seat's own list, because
my generator is no cleaner than theirs and its own header says so.

FOLDED 16:
  13 clean by the mechanical rules
   2 rescued from my own over-firing rule (a multi-token shift is not automatically
     wrong: "pain was how you became who you were" and "the struggle was what gave life
     value" are both correct past tense)
   1 CORRECTED rather than dropped: "hardship was what shapes a person" -> "...shaped a
     person".  Supplying the variant is the build work; dropping it would have left a
     signed position unreachable over a verb my generator failed to shift.

DROPPED 3, all genuine machine noise:
  rational agents would allow creating good lived   (lives is a NOUN; also modal)
  if the child will had a good life its fine        (future auxiliary; a past shift on
                                                     `will` is ungrammatical)
  you needed to suffered to grow                    (double shift, infinitive broken)
"""
import json, io, sys, os

ADD = [
 ("pos-boonin-critique-01",           "defeating the asymmetry is not enough", "defeating the asymmetry was not enough"),
 ("pos-boonin-critique-01",           "the case has other pillars",            "the case had other pillars"),
 ("pos-boonin-critique-02",           "the conclusion is overdetermined",      "the conclusion was overdetermined"),
 ("pos-bradley-no-subject-01",        "absence of pain is not good either",    "absence of pain was not good either"),
 ("pos-bradley-no-subject-01",        "then non existence is not good",        "then non existence was not good"),
 ("pos-bradley-no-subject-02",        "value is subject relative",             "value was subject relative"),
 ("pos-care-ethics-01",               "ethics is care and relationship",       "ethics was care and relationship"),
 ("pos-care-ethics-02",               "dependency creates obligation",         "dependency created obligation"),
 ("pos-harman-benign-creation-01",    "creating a good enough life is permissible", "creating a good enough life was permissible"),
 ("pos-harman-benign-creation-01",    "benign creation is permissible",        "benign creation was permissible"),
 ("pos-harman-benign-creation-02",    "a life over the quality threshold is acceptable", "a life over the quality threshold was acceptable"),
 ("pos-harman-benign-creation-02",    "bringing a good life into being is allowed", "bringing a good life into being was allowed"),
 ("pos-meaning-through-suffering-01", "pain is how you become who you are",    "pain was how you became who you were"),   # rescued
 ("pos-meaning-through-suffering-02", "the struggle is what gives life value", "the struggle was what gave life value"),  # rescued
 ("pos-meaning-through-suffering-02", "hardship is what shapes a person",      "hardship was what shaped a person"),      # corrected
 ("pos-meaning-through-suffering-02", "without struggle life means nothing",   "without struggle life meant nothing"),
]

def main(root="."):
    p = os.path.join(root, "src/components/omega-corpus-mrgrey.json")
    raw = io.open(p, encoding="utf-8", newline="").read()
    doc = json.loads(raw)
    assert json.dumps(doc, ensure_ascii=False, indent=2) + "\n" == raw, "round-trip not byte-exact"
    ents = doc["yurei_corpus"]["entries"]
    byid = {e["id"]: e for e in ents}
    allforms = {q["form"] for e in ents for q in e.get("patterns", [])}
    n = 0
    for eid, src_form, variant in ADD:
        e = byid[eid]
        src = next((q for q in e["patterns"] if q["form"] == src_form), None)
        assert src is not None, f"{eid}: source form {src_form!r} not live"
        assert variant == variant.lower().strip(), "pre-normalized corpus law"
        assert variant not in allforms, f"{variant!r} already declared -- would mint a collision"
        e["patterns"].append({"form": variant, "mode": src["mode"], "weight": src["weight"]})
        allforms.add(variant); n += 1
    io.open(p, "w", encoding="utf-8", newline="").write(
        json.dumps(doc, ensure_ascii=False, indent=2) + "\n")
    tot = sum(len(x.get("patterns", [])) for x in ents)
    print(f"  +{n} forms over {len(set(a for a,_,_ in ADD))} K268/K270 entries")
    print(f"  mrgrey: {len(ents)} entries / {tot} forms")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
