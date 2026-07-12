#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""emit_parity_vectors.py — generate the JS<->Python routing ground truth.

Runs the REFERENCE python Matcher (yurei_harness.py) over:
  - the 8 schema fixtures            (exemplar corpus)
  - the P1..P10 drift probes         (real public corpus)
  - a multi-turn differential battery (public, and public+room unsealed)
and records the exact output-id sequence for each. yurei-parity.mjs replays
the identical vectors through the JS Matcher and asserts equality. Any drift
in normalization / scoring / LRU / dampening / repeat / tie-break shows up as a
mismatch here.

Usage:
  python3 emit_parity_vectors.py <public.json> <room.json> > parity_vectors.json
"""
import sys, json
import yurei_harness as H

def run(entries, seq, unsealed=False, repeat_window=5):
    m = H.Matcher(entries, unsealed=unsealed, repeat_window=repeat_window)
    return [m.match(s) for s in seq]

def oracle_pick(oracle, raw, floor=40):
    """Independent python model of the JS oracle lane (single-shot): score the
    oracle pool with the harness scorer, fire on best>=floor, tie-break -sc,-mlen,id."""
    t = H.normalize(raw)
    cands = []
    for e in oracle:
        sc, ml = H.entry_score(e, t)
        if sc > 0: cands.append((sc, ml, e["id"]))
    if not cands: return None
    if max(c[0] for c in cands) < floor: return None
    cands.sort(key=lambda x: (-x[0], -x[1], x[2]))
    return cands[0][2]

# authored oracle direct-hit fixtures (input -> expected oracle id); the emitter
# VERIFIES each with oracle_pick (independent py) and the JS runner re-verifies.
ORACLE_FIXTURES = [
  ("of-essays","where are the essays","o-essays"),
  ("of-gallery","take me to the gallery","o-gallery"),
  ("of-void","where is the void engine","o-void"),
  ("of-glossary","the glossary","o-glossary"),
  ("of-contact","how do i contact you","o-contact"),
  ("of-support","how do i support the site","o-support"),
  ("of-changelog","changelog","o-changelog"),
  ("of-wuld","what does wuld stand for","o-wuld"),
  ("of-getin","how do i get in","o-getin"),
  ("of-free","is this free","o-free"),
  ("of-login","how do i log in","o-login"),
  ("of-darkmode","dark mode","o-darkmode"),
  ("of-forum","is there a forum","o-forum"),
  ("of-start","where do i start","o-start"),
  ("of-broken","something is broken","o-troubleshoot"),
  ("of-bookbuy","buy the book","o-book-buy"),
  ("of-arglib","argument library","o-arglib"),
  ("of-recs","recommendations","o-recs"),
  ("of-archive-nav","where is the archive","o-archive-nav"),
  ("of-search","search page","o-search-page"),
]

def main():
    pub_path, room_path = sys.argv[1], sys.argv[2]
    pub = json.load(open(pub_path, encoding="utf-8"))["yurei_corpus"]["entries"]
    room = json.load(open(room_path, encoding="utf-8"))["yurei_corpus"]["entries"]
    pub_room = pub + room

    vectors = []

    # --- 8 schema fixtures (exemplar corpus) ---
    for fx in H.FIXTURES:
        vectors.append({
            "id": "fx:" + fx["name"], "corpus": "exemplars",
            "unsealed": False, "repeat_window": 5,
            "seq": fx["seq"], "out": run(H.EXEMPLARS, fx["seq"], False, 5),
        })

    # --- P1..P10 probes (real public corpus) ---
    for p in H.PROBES:
        vectors.append({
            "id": p["id"], "corpus": "public",
            "unsealed": False, "repeat_window": 5,
            "seq": p["seq"], "out": run(pub, p["seq"], False, 5),
        })

    # --- curated differential seqs (public, sealed) ---
    ALIEN = ["zorp qflux","vundle glarn","wexil droom","plizz frnk","skree yolt",
             "xanth brundle","clomp thwip","gnarl vrosh","klune snerg","phlox quorm",
             "zind abek","zorp glarn","wexil frnk","skree brundle","clomp vrosh",
             "klune quorm","zind qflux","vundle droom","plizz yolt","xanth thwip",
             "gnarl snerg","phlox abek","zorp thwip","wexil quorm"]
    curated = [
        ("diff-crisis-embedded", ["please help me i want to die tonight"]),
        ("diff-crisis-v2",       ["i think i might hurt myself"]),
        ("diff-crisis-v3",       ["there is no reason to live anymore"]),
        ("diff-crisis-falsepos", ["oh you kill me haha"]),
        ("diff-site-place",      ["what is this place"]),
        ("diff-site-gallery",    ["tell me about the gallery"]),
        ("diff-site-engine",     ["i was near the void engine downstairs"]),
        ("diff-hour",            ["what time is it"]),
        ("diff-id-ai",           ["are you an ai"]),
        ("diff-id-ghost",        ["are you a ghost"]),
        ("diff-pos-kids",        ["should i have kids"]),
        ("diff-hostile-suck",    ["you suck"]),
        ("diff-locked",          ["whats behind the locked page"]),
        ("diff-meta-help",       ["help"]),
        ("diff-ack",             ["thanks"]),
        # normalization / unicode / NFKC
        ("diff-norm-caps",       ["  WHAT   is this place?!"]),
        ("diff-norm-dots",       ["ARE YOU AN A.I.???"]),
        ("diff-norm-fullwidth",  ["ｗｈａｔ ｉｓ ｔｈｉｓ"]),  # 'what is this'
        ("diff-norm-accent",     ["café hours, please"]),
        ("diff-norm-emoji",      ["hello \U0001f47b there"]),
        # dampening walk through greeting pool
        ("diff-greet-dampen",    ["hi","hi there","hey","hello there","hiya","good evening"]),
        # repeat within window
        ("diff-repeat-in",       ["hello","hello"]),
        ("diff-repeat-gap",      ["hello","hi there","hello"]),
        ("diff-repeat-thrice",   ["is life worth living","is life worth living","is life worth living"]),
        # long miss run -> deflection LRU rotation then reuse
        ("diff-miss-rotate",     ALIEN),
        # interleave misses + hits (state carryover)
        ("diff-interleave",      ["hello","zorp qflux","what time is it","zorp qflux","hello","are you an ai","vundle glarn"]),
    ]
    for vid, seq in curated:
        vectors.append({
            "id": vid, "corpus": "public", "unsealed": False, "repeat_window": 5,
            "seq": seq, "out": run(pub, seq, False, 5),
        })

    # --- repeat_window variants ---
    for rw in (2, 3, 8):
        seq = ["hello","zorp qflux","vundle glarn","hello"]
        vectors.append({
            "id": f"diff-rw{rw}", "corpus": "public", "unsealed": False, "repeat_window": rw,
            "seq": seq, "out": run(pub, seq, False, rw),
        })

    # --- room tier (public+room, unsealed) ---
    room_seqs = [
        ("diff-room-really",  ["what are you really"]),
        ("diff-room-backend", ["is there a backend"]),
        ("diff-room-crisis",  ["i want to die"]),
        ("diff-room-pos",     ["is life worth living"]),
        ("diff-room-bio",     ["is the author dead"]),
        ("diff-room-mem",     ["do you remember me"]),
        ("diff-room-mixed",   ["what are you really","hello","zorp qflux","what are you really"]),
    ]
    for vid, seq in room_seqs:
        vectors.append({
            "id": vid, "corpus": "public_room", "unsealed": True, "repeat_window": 5,
            "seq": seq, "out": run(pub_room, seq, True, 5),
        })

    # --- sealed: room question with room NOT visible (parity of visibility gate) ---
    for vid, seq in [("diff-sealed-really", ["what are you really"]),
                     ("diff-sealed-backend", ["is there a backend"])]:
        vectors.append({
            "id": vid, "corpus": "public", "unsealed": False, "repeat_window": 5,
            "seq": seq, "out": run(pub, seq, False, 5),
        })

    # --- ORACLE lane (Act 2c) ---
    oracle = []
    if len(sys.argv) > 3:
        oracle = json.load(open(sys.argv[3], encoding="utf-8"))["yurei_corpus"]["entries"]
    pub_oracle = pub + oracle

    # (a) INERTNESS: persona/crisis/miss inputs route identically with oracle loaded.
    #     ground truth = harness(pub_oracle); harness ignores class 'oracle', so == harness(pub).
    inert_seqs = [
        ("oinert-hello", ["hello"]),
        ("oinert-place", ["what is this place"]),
        ("oinert-ai",    ["are you an ai"]),
        ("oinert-pos",   ["is life worth living"]),
        ("oinert-hour",  ["what time is it"]),
        ("oinert-crisis",["i want to die"]),
        ("oinert-miss",  ["zorp qflux","vundle glarn"]),
        ("oinert-repeat",["hello","hello"]),
        ("oinert-mixed", ["hello","zorp qflux","what time is it","are you an ai"]),
    ]
    for vid, seq in inert_seqs:
        vectors.append({"id": vid, "corpus": "public_oracle", "unsealed": False,
                        "repeat_window": 5, "seq": seq, "out": run(pub_oracle, seq, False, 5)})

    # (b) AMBIGUOUS -> persona: bare nouns the persona owns must NOT be hijacked by oracle.
    for vid, seq in [("osplit-void",["void engine"]), ("osplit-archive",["the archive"]),
                     ("osplit-place",["what is this place"]), ("osplit-search",["how do i search"]),
                     ("osplit-navigate",["how do i navigate"])]:
        vectors.append({"id": vid, "corpus": "public_oracle", "unsealed": False,
                        "repeat_window": 5, "seq": seq, "out": run(pub_oracle, seq, False, 5)})

    # (c) CRISIS still absolute even with an oracle-noun in the sentence.
    for vid, seq in [("ocrisis-embed",["i want to die where are the essays"]),
                     ("ocrisis-embed2",["kill myself but first the gallery"])]:
        vectors.append({"id": vid, "corpus": "public_oracle", "unsealed": False,
                        "repeat_window": 5, "seq": seq, "out": run(pub_oracle, seq, False, 5)})

    # verify authored oracle fixtures with the independent python oracle model
    fx_fail = []
    for fid, inp, expect in ORACLE_FIXTURES:
        got = oracle_pick(oracle, inp)
        if got != expect: fx_fail.append((fid, inp, expect, got))
    if fx_fail:
        sys.stderr.write("ORACLE FIXTURE (python) MISMATCH:\n")
        for r in fx_fail: sys.stderr.write(f"  {r}\n")
        sys.exit(2)

    out = {
        "generated_by": "emit_parity_vectors.py",
        "note": "Python ground-truth routing; yurei-parity.cjs must reproduce every id.",
        "exemplars": H.EXEMPLARS,
        "room_entries": room,
        "vectors": vectors,
        "oracle_fixtures": [{"id": f, "input": i, "expect": e} for (f, i, e) in ORACLE_FIXTURES],
        "counts": {"public": len(pub), "room": len(room), "oracle": len(oracle), "vectors": len(vectors)},
    }
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main()
