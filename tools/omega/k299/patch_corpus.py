#!/usr/bin/env python3
"""K299 — the corpus fold. TX15-BACK, ratified by Josiah 2026-09-07, with three
measured corrections recorded in tools/omega/TX15-BACK-verify-K299.md.

Ask C (the crisis floor) is folded into BOTH live corpora, which must stay byte-identical
(the inherited-floor invariant omega-persona-gate asserts). Everything else is mrgrey-only.
Idempotent: re-running reports SKIP and exits 0.
"""
import json, sys, pathlib, collections

# Per-file serializer settings, PROVEN by a no-op round-trip: dumping the untouched file with
# these settings reproduces it byte-for-byte. The two corpora do NOT share a convention -
# mrgrey is indent=2 with a trailing newline, yurei-public is indent=1 with none. Using one
# setting for both silently reformats 4,098 lines of the other for a 3-entry change.
FMT = {
    "omega-corpus-mrgrey.json":  {"indent": 2, "nl": "\n"},
    "yurei-corpus-public.json":  {"indent": 1, "nl": ""},
}

def dump(path, data):
    f = FMT[pathlib.Path(path).name]
    raw = json.dumps(data, ensure_ascii=False, indent=f["indent"]) + f["nl"]
    pathlib.Path(path).write_text(raw, encoding="utf-8", newline="")

# --- Ask C: the floor. Forms written in SOURCE spelling; the K299 normalizer maps
# `cant`->`can not`, `im`->`i am`, so `im not safe` and `i am not safe` collapse to ONE form.
FLOOR = {
  "c-crisis-01": [("dont want to be alive", 9), ("wish i were dead", 9),
                  ("better off without me", 9), ("take my own life", 9)],
  "c-crisis-02": [("i am not safe", 9)],
  "c-crisis-03": [("cant go on", 8), ("cant do this anymore", 8), ("want to disappear", 8),
                  ("want to not exist", 8), ("not wake up", 8), ("not be here anymore", 8)],
}
FLOOR_NOTE = (" K299: widened per TX15-BACK Ask C - 11 forms added across the three floor "
              "entries. Measured before the fold: 12 of the 18 distress phrasings the relay "
              "listed answered with mg-deflect-01, and the misses sat one word from the hits "
              "(wish i was dead reached the floor; wish i were dead did not).")

HELP_ENTRY = {
  "id": "mg-oracle-help-01",
  "class": "response",
  "tier": "public",
  "patterns": [
    {"form": "help", "mode": "exact", "weight": 3},
    {"form": "what can you do", "mode": "contains", "weight": 3},
    {"form": "what can i ask", "mode": "contains", "weight": 3},
    {"form": "what do you do", "mode": "contains", "weight": 2},
  ],
  "response": ("Not a menu. I answer for what this is, where the pages sit, and objections "
               "that were argued out in writing and signed - put one plainly and you get it "
               "as written. If you meant the heavier kind of help, say that plainly too; the "
               "script stands down for it."),
  "hints": ["What are you?", "Where do I start?", "Your view is ableist.", "Salve"],
  "register_tags": ["clinical", "site"],
  "length_band": "b3_passage",
  "animation_hint": "speak",
}
NEED_HELP_ADD = [("can you help", 3), ("help please", 3), ("need help", 3), ("i need some help", 3)]


def add_forms(entry, adds, label):
    have = {p["form"] for p in entry["patterns"]}
    n = 0
    for form, w in adds:
        if form in have:
            continue
        entry["patterns"].append({"form": form, "mode": "contains", "weight": w})
        n += 1
    return n


def patch_floor(entries, tag):
    n = 0
    for cid, adds in FLOOR.items():
        e = next((x for x in entries if x["id"] == cid), None)
        assert e is not None, "%s: %s missing" % (tag, cid)
        assert e["class"] == "crisis", "%s: %s is not class crisis" % (tag, cid)
        n += add_forms(e, adds, cid)
        if FLOOR_NOTE.strip() not in e.get("note", ""):
            e["note"] = e.get("note", "").rstrip() + FLOOR_NOTE
    return n


def main(root):
    root = pathlib.Path(root)
    changed = []

    # ---- both corpora: the floor ----
    for rel in ("src/components/omega-corpus-mrgrey.json", "src/components/yurei-corpus-public.json"):
        p = root / rel
        d = json.loads(p.read_text(encoding="utf-8"))
        entries = d["yurei_corpus"]["entries"]
        n = patch_floor(entries, rel)
        dump(p, d)
        print("  floor  %-46s +%d forms" % (rel, n))
        changed.append(rel)

    # ---- mrgrey only ----
    p = root / "src/components/omega-corpus-mrgrey.json"
    d = json.loads(p.read_text(encoding="utf-8"))
    entries = d["yurei_corpus"]["entries"]
    by = {e["id"]: e for e in entries}

    # §3 - demote `community` to exact: a firewall-delicate accusation answered with a link
    # to the chat room reads as the accusation confirmed and then extended an invitation.
    chat = by["mg-nav-chat-01"]
    hit = [x for x in chat["patterns"] if x["form"] == "community"]
    assert len(hit) == 1
    hit[0]["mode"] = "exact"
    print("  §3     mg-nav-chat-01 'community' contains -> exact")

    # §1 routing law - signed position beats unsigned register lane on a tie. MEASURED:
    # `see a therapist` is 63 vs 62, NOT a tie, so a one-weight demote only CREATES a tie,
    # which the alphabetical tiebreak hands straight back to mg-hostile-05. It needs two.
    h5 = by["mg-hostile-05"]
    t = [x for x in h5["patterns"] if x["form"] == "see a therapist"]
    assert len(t) == 1 and t[0]["weight"] == 3
    t[0]["weight"] = 1
    print("  §1     mg-hostile-05 'see a therapist' w3 -> w1 (two, not one - measured)")

    h2 = by["mg-hostile-02"]
    t = [x for x in h2["patterns"] if x["form"] == "edgelord"]
    assert len(t) == 1 and t[0]["weight"] == 2
    t[0]["weight"] = 1
    print("  §1     mg-hostile-02 'edgelord' w2 -> w1 (a true tie today)")

    # Ask A rider i - bare `help` is a capability question, not a map question, and the nav
    # oracle ships an href to / at a visitor already standing on /successor/.
    nav = by["mg-oracle-nav-01"]
    before = len(nav["patterns"])
    nav["patterns"] = [x for x in nav["patterns"] if not (x["mode"] == "exact" and x["form"] == "help")]
    assert len(nav["patterns"]) == before - 1
    print("  rider i  mg-oracle-nav-01 loses exact 'help' (%d -> %d forms)" % (before, len(nav["patterns"])))

    # rider ii - widen the fork entry
    n = add_forms(by["mg-need-help-01"], NEED_HELP_ADD, "mg-need-help-01")
    print("  rider ii mg-need-help-01 +%d forms" % n)

    # Ask A - the entry itself. Body authored by the Successor-Protocol seat (TX15-BACK §2),
    # ratified by Josiah 2026-09-07. Class `response`, not `oracle`: all 21 oracle entries
    # carry href+nav_label, and rider i exists precisely to stop shipping an href here.
    if "mg-oracle-help-01" not in by:
        idx = next(i for i, e in enumerate(entries) if e["id"] == "mg-need-help-01")
        entries.insert(idx + 1, HELP_ENTRY)
        print("  Ask A    mg-oracle-help-01 inserted after mg-need-help-01")
    else:
        print("  Ask A    SKIP (already present)")

    dump(p, d)
    print("\n  entries %d  forms %d" % (len(entries), sum(len(e.get("patterns", [])) for e in entries)))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "."))
