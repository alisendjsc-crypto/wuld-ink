#!/usr/bin/env python3
"""
K303b -- TX18-BACK section 1.  Neutrality read PASSED; the construction I flagged
is real but the defect is not the one I named.

I distrusted "Out of character for this one too" as a possible Grey bleed.  The seat's
read is better: it is an ANAPHORA problem, twice.  "this one" has no antecedent in the
sentence, and "too" points at c-crisis-03 -- an entry a visitor almost certainly has
not seen, because someone who had hit it this session would be in a different
conversation.  A person in a spike should not resolve two pronouns to reach sentence 2.

Prescribed fix, and it is smaller than a re-authoring:
  1. sentence 1 <- c-crisis-03's opener, copied BYTE-FOR-BYTE FROM THE LIVE ENTRY
     (the seat read it as "Out of character, plainly." but explicitly said to take it
     from the entry, not from them -- so this script reads it, asserts it, and does
     not hardcode it).  Two floor entries opening identically is MORE floor-consistent,
     not less: the register shift arrives the same way every time it arrives.
  2. sentence 3 gains one word: "the pressure underneath THAT you want help with".
     Without it "underneath you" garden-paths and the reader backs up at "want" --
     in the sentence a distressed reader is most likely to be skimming.

NOT changed: sentence 4.  "beats" is a comparative doing a ranking where the moment
calls for a redirect, and the seat flagged it as the lightest register in the entry --
but it is folded, it is not wrong, and re-authoring a ratified crisis body over one
verb is churn.  Carried as a v2 candidate if the entry reopens for another reason.

Both corpora: the floor is byte-identical and omega-persona-gate asserts it.
"""
import json, io, sys, os

SRC   = "c-crisis-03"              # the opener is taken from here, never hardcoded
TGT   = "c-crisis-harm-other-01"
OLD_1 = "Out of character for this one too."
OLD_3 = "If it is the pressure underneath you want help with,"
NEW_3 = "If it is the pressure underneath that you want help with,"

FILES = [("src/components/omega-corpus-mrgrey.json", 2, True),
         ("src/components/yurei-corpus-public.json", 1, False)]

def main(root="."):
    bodies = set()
    for rel, indent, trailing in FILES:
        p = os.path.join(root, rel)
        raw = io.open(p, encoding="utf-8", newline="").read()
        doc = json.loads(raw)
        rt = json.dumps(doc, ensure_ascii=False, indent=indent) + ("\n" if trailing else "")
        assert rt == raw, f"{rel}: serializer round-trip not byte-exact -- refusing to write"

        ents = doc["yurei_corpus"]["entries"] if "yurei_corpus" in doc else doc["entries"]
        src = next(e for e in ents if e["id"] == SRC)
        tgt = next(e for e in ents if e["id"] == TGT)
        assert tgt["class"] == "crisis" and src["class"] == "crisis"

        opener = src["response"].split(". ")[0] + "."          # FROM THE ENTRY
        assert opener and len(opener) < 40, f"{rel}: implausible opener {opener!r}"

        body = tgt["response"]
        assert body.count(OLD_1) == 1, f"{rel}: sentence 1 not found exactly once"
        assert body.count(OLD_3) == 1, f"{rel}: sentence 3 not found exactly once"
        body = body.replace(OLD_1, opener).replace(OLD_3, NEW_3)

        # band + punctuation fences, asserted not assumed
        assert 154 <= len(body) <= 296, f"{rel}: {len(body)} chars outside b3_passage"
        for ch in "?()!":
            assert ch not in body, f"{rel}: forbidden {ch!r}"
        assert "\n" not in body and "..." not in body
        assert body.startswith(opener), f"{rel}: opener did not land first"

        tgt["response"] = body
        bodies.add(body)

        out = json.dumps(doc, ensure_ascii=False, indent=indent) + ("\n" if trailing else "")
        io.open(p, "w", encoding="utf-8", newline="").write(out)
        print(f"  {rel}: sentence 1 <- {SRC} opener {opener!r}; sentence 3 +1 word; {len(body)} chars")

    assert len(bodies) == 1, "the two corpora ended with DIFFERENT bodies -- floor must stay byte-identical"
    print("\n  both corpora carry the identical body (floor inheritance held)")
    print("  ---")
    print("  " + bodies.pop())

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
