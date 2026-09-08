#!/usr/bin/env python3
"""K300/K301 handout fold — the four items Josiah ruled on 2026-09-08.

Ruling: "go with your recommendations on all of the above." Applied:
  1. c-crisis-harm-other-01  — AUTHORED here (Josiah reassigned drafting to Cowork), both corpora.
  2. mg-never-born-01        — the seat's TX15-BACK §4 draft, verbatim, class response + href.
  3. mg-worth-living-01      — amendment DECLINED (it would be the 4th stand-down body, and the
                               entry is a nav pointer, not a help answer). Instead the real defect
                               is fixed: the `whats` normalizer exclusion costs 8 named misses.
  4. /book/ cover cap        — separate, page-local CSS; not this script.

Idempotent. Run from repo root:  python3 <this> src
"""
import json, sys, pathlib

FMT = {"omega-corpus-mrgrey.json": {"indent": 2, "nl": "\n"},
       "yurei-corpus-public.json": {"indent": 1, "nl": ""}}

HARM_OTHER = {
  "id": "c-crisis-harm-other-01",
  "class": "crisis",
  "tier": "public",
  "response": ("Out of character for this one too. If someone is in danger right now, contact "
               "emergency services. If it is the pressure underneath you want help with, in the "
               "US call or text 988; elsewhere findahelpline.com lists a local line. Saying it to "
               "a person beats saying it here."),
  "register_tags": ["clinical"],
  "length_band": "b3_passage",
  "animation_hint": "speak",
  "patterns": [
    {"form": "going to hurt someone", "mode": "contains", "weight": 9},
    {"form": "want to hurt someone", "mode": "contains", "weight": 9},
    {"form": "going to hurt somebody", "mode": "contains", "weight": 9},
    {"form": "want to hurt somebody", "mode": "contains", "weight": 9},
    {"form": "going to kill someone", "mode": "contains", "weight": 9},
    {"form": "want to kill someone", "mode": "contains", "weight": 9},
    {"form": "going to hurt them", "mode": "contains", "weight": 8},
    {"form": "hurt someone else", "mode": "contains", "weight": 8}
  ],
  "note": ("V14 override; register dropped by design. K300: authored by Cowork on Josiah's "
           "reassignment after the Successor-Protocol seat declined to write shared-floor bytes "
           "unilaterally (TX15-BACK §4). Emergency services is named FIRST because the risk is to "
           "a third party and imminence governs; 988 is named second for the distress underneath, "
           "which is what that line is scoped for. The entry does not accuse, does not moralise, "
           "and makes no claim about what this page does with the sentence.")
}

NEVER_BORN = {
  "id": "mg-never-born-01",
  "class": "response",
  "tier": "public",
  "patterns": [
    {"form": "wish i had never been born", "mode": "contains", "weight": 3},
    {"form": "wish i was never born", "mode": "contains", "weight": 3},
    {"form": "wish i were never born", "mode": "contains", "weight": 3},
    {"form": "should never have been born", "mode": "contains", "weight": 3},
    {"form": "never asked to be born", "mode": "contains", "weight": 3},
    {"form": "did not ask to be born", "mode": "contains", "weight": 3}
  ],
  "response": ("Taken as a claim, that one is the house's whole subject — it gets argued at "
               "the library, not waved off. Taken as a report on where you are, say it plainly as "
               "that and the script stands down for it."),
  "href": "/argument-library/",
  "register_tags": ["clinical", "site"],
  "length_band": "b3_passage",
  "animation_hint": "speak"
}

# The `whats` exclusion (K299, kept to protect two Yurei site entries) costs exactly these 8
# misses. Fixed page-locally by declaring the expanded spelling, NOT by loosening the map.
WHATS_FIX = {
  "mg-how-many-01":        "what is in the corpus",
  "mg-why-successor-01":   "what is a successor",
  "mg-when-positions-01":  "what is the point of you",
  "mg-worth-living-01":    "what is the point of life",
  "mg-how-are-you-01":     "what is up",
  "mg-utility-01":         "what is 22",
  "mg-nav-changelog-01":   "what is new",
  "pos-policy-proposal-01":"what is your actual plan",
}


def dump(p, d):
    f = FMT[pathlib.Path(p).name]
    pathlib.Path(p).write_text(json.dumps(d, ensure_ascii=False, indent=f["indent"]) + f["nl"],
                               encoding="utf-8", newline="")


def main(root):
    root = pathlib.Path(root)

    # --- the shared floor: harm-other goes in BOTH corpora, byte-identical ---
    for rel in ("omega-corpus-mrgrey.json", "yurei-corpus-public.json"):
        p = root / "components" / rel
        d = json.loads(p.read_text(encoding="utf-8"))
        E = d["yurei_corpus"]["entries"]
        if any(e["id"] == "c-crisis-harm-other-01" for e in E):
            print("  SKIP %s (harm-other present)" % rel)
        else:
            last = max(i for i, e in enumerate(E) if e.get("class") == "crisis")
            E.insert(last + 1, json.loads(json.dumps(HARM_OTHER)))
            dump(p, d)
            print("  +c-crisis-harm-other-01  %s" % rel)

    # --- mrgrey only ---
    p = root / "components" / "omega-corpus-mrgrey.json"
    d = json.loads(p.read_text(encoding="utf-8"))
    E = d["yurei_corpus"]["entries"]
    by = {e["id"]: e for e in E}

    if "mg-never-born-01" not in by:
        idx = next(i for i, e in enumerate(E) if e["id"] == "mg-worth-living-01")
        E.insert(idx + 1, NEVER_BORN)
        print("  +mg-never-born-01 (after mg-worth-living-01)")
    else:
        print("  SKIP mg-never-born-01")

    n = 0
    for eid, form in WHATS_FIX.items():
        e = by.get(eid)
        assert e is not None, "missing " + eid
        if any(x["form"] == form for x in e["patterns"]):
            continue
        w = max(x.get("weight", 0) for x in e["patterns"] if x["mode"] == "contains") \
            if any(x["mode"] == "contains" for x in e["patterns"]) else 3
        e["patterns"].append({"form": form, "mode": "contains", "weight": w})
        n += 1
    print("  whats-gap: +%d expanded forms across %d entries" % (n, len(WHATS_FIX)))

    dump(p, d)
    print("\n  mrgrey entries %d  forms %d" % (len(E), sum(len(e.get("patterns", [])) for e in E)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "src"))
