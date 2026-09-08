#!/usr/bin/env python3
"""
K304 -- TX19-BACK section 1: the names oracle.

The law: a bare surname is not an objection.  Parfit is the non-identity problem AND
personal identity AND the repugnant conclusion AND moral mathematics; routing `parfit`
to one position picks one and presents it as the one the visitor meant.  That is the
"did you mean" fabrication in a different costume, at a threshold of one, and it is the
thing both seats already refused.

But the seat's first instruction -- "not on the position, at all" -- was a DELETION WITH
NO DESTINATION, and the destination it described did not exist.  `benatar` reaches an
oracle only by accident of topic; the other four names had nowhere to go.  Which exposed
what my own TX19 table had marked `ok`: scanlon / harman / bradley / boonin all land on
mg-deflect-01, and all four objections are SIGNED.  Five philosopher names central to the
site's subject were being told they are off the path it keeps -- a class-1 miss sitting
under a column I had marked fine, because I asked "does a name reach a position?" when
the question was "does a name reach anywhere sensible?"

So: BUILD THE DESTINATION AND NO DELETION IS NEEDED.  `parfit` stays on its position.
The oracle lane fires ahead of the score lane and `exact` does the discrimination free:
  bare "parfit"                       -> oracle exact (102), wins lane and score
  "...parfits non identity problem"   -> oracle exact misses; the position's own form runs
One edit instead of two, and no window where the deletion has landed and the
destination has not.

`exact` per the K302 mode rule: these are single ordinary words, and `bradley` / `harman`
are ordinary surnames that would otherwise fire inside unrelated sentences.
`benatar` is NOT added -- he reaches mg-antinatalism-01, a TOPIC oracle, which is a
better destination than a generic names oracle and churning it buys nothing.
"""
import json, io, sys, os

ENTRY = {
  "id": "mg-oracle-names-01",
  "class": "oracle",
  "tier": "public",
  "patterns": [{"form": n, "mode": "exact", "weight": 2}
               for n in ["parfit", "scanlon", "harman", "bradley", "boonin"]],
  "response": ("I answer arguments, not authors. A surname isn't an argument, it's a shelf - and I "
               "don't guess which book you meant. The reasoning is written out where it can be "
               "checked; take the one you came for and put it to me in your own words."),
  "register_tags": ["site"],
  "length_band": "b3_passage",
  "animation_hint": "speak",
  "href": "/argument-library/",
  "nav_label": "the argument library",
  "note": ("K304, body verbatim from the Successor-Protocol seat (TX19-BACK section 1). A bare "
           "surname is not an objection -- routing one to a single position is the 'did you mean' "
           "fabrication at a threshold of one. NO philosopher name appears in the emitted body: "
           "the canon principle is about what gets spoken, and this entry talks about names "
           "without using one. benatar is deliberately absent -- he reaches mg-antinatalism-01, "
           "a topic oracle, which points at the subject and picks no argument.")
}

def main(root="."):
    p = os.path.join(root, "src/components/omega-corpus-mrgrey.json")
    raw = io.open(p, encoding="utf-8", newline="").read()
    doc = json.loads(raw)
    assert json.dumps(doc, ensure_ascii=False, indent=2) + "\n" == raw, "round-trip not byte-exact"
    ents = doc["yurei_corpus"]["entries"]
    assert not any(e["id"] == ENTRY["id"] for e in ents), "already folded"

    b = ENTRY["response"]
    assert 154 <= len(b) <= 296, f"{len(b)} chars outside b3_passage"
    for ch in "?()!":
        assert ch not in b, f"forbidden {ch!r}"
    assert "\n" not in b and "..." not in b
    for name in ["parfit", "scanlon", "harman", "bradley", "boonin", "benatar"]:
        assert name not in b.lower(), f"philosopher name {name!r} in the emitted body"
    for q in ENTRY["patterns"]:
        assert q["form"] == q["form"].lower().strip(), "pre-normalized corpus law"

    # insert beside the other /argument-library/ oracles, after the last one
    idx = max(i for i, e in enumerate(ents) if e.get("class") == "oracle")
    ents.insert(idx + 1, ENTRY)

    io.open(p, "w", encoding="utf-8", newline="").write(
        json.dumps(doc, ensure_ascii=False, indent=2) + "\n")
    n = len(ents); f = sum(len(e.get("patterns", [])) for e in ents)
    print(f"  +{ENTRY['id']}  {len(ENTRY['patterns'])} exact name forms, body {len(b)} chars")
    print(f"  mrgrey: {n} entries / {f} forms")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
