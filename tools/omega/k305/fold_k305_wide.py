#!/usr/bin/env python3
"""
K305 -- TX20-BACK items 1 + 2, folded together because the wide sweep SUBSUMES the
REVIEW batch: 14 of the seat's 18 FOLD verdicts are rows the wide generator produces
anyway, so folding them separately would have meant two drop lists for one decision.

THE VERB-MAP GAP IS REAL AND BIGGER THAN THE FOUR ROWS THAT FOUND IT.
The seat noticed four rows in their mirror absent from my live K299 file and stated it
as a condition they could not check.  Verified: all four declared forms are live, all
four variants deflect, none is declared.  Re-running with a map built from the corpus's
own vocabulary (the K299 generator was scratch, not repo state -- itself a ccxliv
violation, and the reason its map could not simply be read) yields 87 new misses:
  43 copula/aux  -- entries the K299 run never covered at all
  44 new-verb    -- the map gap proper: regret, lead, value, choose, want, prove,
                    show, become, permit, justify, devalue, sound, cure, ignore...
So the 102 BULK forms folded at K304 were incomplete by roughly their own size again.

DROPPED, and the seat's own REVIEW verdicts are authoritative where they ruled:
  got therapy                          imperative -- a mood shifted, not a tense (seat)
  grew up                              same class; "grow up" is an insult, not a claim
  this was eugenics / ...slippery slope / ...nazi eugenics
                                       REFERENT SHIFT: names a historical program rather
                                       than accusing the argument (seat, all three)
  sounded like eugenics                HELD, not dropped -- same objection, and the seat
                                       asked for a per-row pass on it; a fourth row there
                                       is theirs to rule on, not mine to infer
  one persons pain was anothers pleasure   timeless proposition (seat)
  wait until you were older / when you were older you will   ungrammatical
  the struggle was what gave life valued   `value` is the noun
  ...plus 10 multi-verb half-shifts (a single shift inside a two-verb sentence)

RESCUED from the multi-verb flag after a read (6), including both the seat's CORRECTions:
  if life was so bad why are you here   first clause only (seat's correction)
  you still chose to live               (seat's correction; theirs generated the double shift)
  you needed to suffer to grow          single shift, grammatical
  surveys showed people are happy · people say they were happy · happy people proved life is good
"""
import json, io, sys, os, csv

# The seat's REVIEW verdicts are READ FROM THEIR CSV, never retyped.  The first attempt
# hand-transcribed the nine holds and got seven: `why were you still here` and `yet here
# you were` both landed on positions the seat had explicitly dropped -- and K304's own
# ship block had asserted the first of those was ABSENT from the corpus.  A hand-copied
# list is a claim like any other, and this one was wrong in the direction that ships.
def seat_verdicts(root):
    drops = set()
    with io.open(os.path.join(root, "tools/omega/k305/review_batch_pass_v1.csv"),
                 encoding="utf-8", newline="") as fh:
        for row in csv.DictReader(fh):
            if row["verdict"].strip() == "DROP":
                drops.add(row["variant"].strip())
    assert len(drops) == 9, f"expected 9 DROP verdicts in the seat's CSV, read {len(drops)}"
    return drops

# my own reads, on rows the seat's batch never contained
MY_DROP = {
  "grew up",                                  # "grow up" is an insult; its past is not the same act
  "sounded like eugenics",                    # HELD: same objection the seat asked to rule per-row
  "wait until you were older", "when you were older you will",
  "the struggle was what gave life valued",   # `value` is the noun
  # multi-verb half-shifts
  "if life is so bad why were you here", "what do you wanted to do about it",
  "what did you wanted to do about it", "pain was how you become who you are",
  "pain is how you became who you are", "the struggle was what gives life value",
  "the struggle is what gave life value", "hardship was what shapes a person",
  "hardship is what shaped a person", "what does not kill you made you stronger",
}
# multi-verb rows that a read rescues
RESCUE = {
  "if life was so bad why are you here", "you still chose to live",
  "you needed to suffer to grow", "surveys showed people are happy",
  "people say they were happy", "happy people proved life is good",
}
# TX20-BACK section 3: folded at K304, pulled here. A grief reading routes someone
# writing about a loss to a position REBUTTING the claim that life is beautiful --
# wrong answer, wrong register, worst moment. The seat named this one explicitly.
PULL = [("pos-life-gift-01", "life was beautiful"),
        ("pos-life-gift-01", "life was a gift"),
        ("pos-life-gift-01", "life was a blessing")]
# The seat named `life was beautiful` and asked to do the read on the rest themselves.
# I am pulling two more on their own stated criterion and flagging it for reversal, on
# harm asymmetry: all three live on the SAME entry -- the objection whose whole subject
# is "life is a gift" -- so someone writing "her life was a gift" after a death gets a
# rebuttal of the claim that life is a gift. As objections these past forms are close to
# dead (the claim is the present tense); as grief they are the natural phrasing. Wrong
# answer, wrong register, worst moment, in the seat's own words. If they disagree the
# cost is two dead forms; if I had waited and they are right, the cost is that reply.

def main(root="."):
    p = os.path.join(root, "src/components/omega-corpus-mrgrey.json")
    raw = io.open(p, encoding="utf-8", newline="").read()
    doc = json.loads(raw)
    assert json.dumps(doc, ensure_ascii=False, indent=2) + "\n" == raw, "round-trip not byte-exact"
    ents = doc["yurei_corpus"]["entries"]
    byid = {e["id"]: e for e in ents}
    allforms = {q["form"] for e in ents for q in e.get("patterns", [])}

    SEAT_DROP = seat_verdicts(root)
    DROP = SEAT_DROP | MY_DROP
    print(f"  drop list: {len(SEAT_DROP)} read from the seat's CSV + {len(MY_DROP)} of my own reads")
    sweep = json.load(io.open(os.path.join(root, "tools/omega/k305/sweep_wide.json"), encoding="utf-8"))
    added = dropped = 0
    for r in sweep["new_miss"]:
        v = r["variant"]
        if v in DROP: dropped += 1; continue
        if r["multiverb"] and v not in RESCUE: dropped += 1; continue
        if v in allforms: continue
        e = byid[r["id"]]
        src = next((q for q in e["patterns"] if q["form"] == r["form"]), None)
        assert src is not None, f"{r['id']}: source form {r['form']!r} not live"
        assert v == v.lower().strip(), "pre-normalized corpus law"
        e["patterns"].append({"form": v, "mode": src["mode"], "weight": src["weight"]})
        allforms.add(v); added += 1

    pulled = 0
    for eid, form in PULL:
        e = byid[eid]
        n0 = len(e["patterns"])
        e["patterns"] = [q for q in e["patterns"] if q["form"] != form]
        assert len(e["patterns"]) == n0 - 1, f"{eid}: {form!r} not found to pull"
        pulled += 1

    io.open(p, "w", encoding="utf-8", newline="").write(
        json.dumps(doc, ensure_ascii=False, indent=2) + "\n")
    tot = sum(len(e.get("patterns", [])) for e in ents)
    print(f"  folded {added} · dropped {dropped} · PULLED {pulled} (life was beautiful)")
    print(f"  mrgrey: {len(ents)} entries / {tot} forms")

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
