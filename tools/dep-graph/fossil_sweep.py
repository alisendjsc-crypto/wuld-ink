#!/usr/bin/env python3
"""
fossil_sweep.py -- find superseded corpus counts on the library's served surfaces,
and refuse to call a match a fossil until something says what it counts and when.

WHY (WI-K325).  The corpus has been 74, 78, 81 and now 82 objections, joined by
222, 245, 254 and now 255 dependency edges.  Sweeping for those digits over a 3 MB
single-file artifact returns mostly noise and -- worse -- returns correct sentences.
Measured on the v4.0.4 flagship: 24 claim-proximate candidates, of which ONE was a
live false claim.  Two of the rest were right, and a sweep that reconciled them to
the table beside them would have replaced current values with fossil ones (ccclv).

So this script does not emit a fix list.  It emits an ADJUDICATION WORKSHEET: every
candidate, with its context, classified into buckets that a reader must confirm.
The only bucket that licenses an edit is LIVE-CLAIM, and nothing lands in it
automatically.

    CSS-OR-CODE    a hex colour, an rgba(), a K-numbered session comment
    PERCENT        the digits are a percentage, not a count
    DATED-RECORD   framed as a past pass or audit ("the v3.5 manual pass ...")
                   -- these must NEVER be swept; cccxxxvi
    OTHER-POP      counts a different population than the corpus
                   (the RWE subset is 78 objections / 136 instances, and correct)
    LIVE-CLAIM     asserted of the corpus now, in the present tense
    UNCLASSIFIED   the sweep could not tell -- a human reads it

WHAT THIS INSTRUMENT CANNOT SEE, said here because a tool that stays silent about
its blind spot gets read as a clean bill of health.  The largest fossil on the
flagship is the LOAD-BEARING HIERARCHY table, whose thirteen rows SUM to 222 --
and the string "222" appears nowhere in that table, or in any prose on any surface.
Every standalone 222 in combined.html is the hex colour #222.  A fossil that is an
arithmetic property of a set of rows is invisible to every string search ever
written, so a clean run here is not evidence that the counts are current.  Recompute
sums with regen_load_bearing.py; use this script for the sentences only.

USAGE
    python3 tools/dep-graph/fossil_sweep.py --root path/to/efilist-clone
    python3 tools/dep-graph/fossil_sweep.py --self-test
"""

import argparse, os, re, sys

SURFACES = ["combined.html", "rwe.html", "libraries/index.html",
            "troubleshooting/index.html", "veganism/combined.html", "veganism/index.html",
            "right-to-die/combined.html", "anthropocentrism/combined.html",
            "transgenderism/combined.html", "abortion/combined.html"]

NUMERALS = ["222", "245", "254", "74", "78", "81"]

CLAIM = re.compile(r"objection|node|edge|dependenc|link|across|via |connect|total|"
                   r"entries|spans|comprising|load-bearing|consent", re.I)
CSS_CODE = re.compile(r"#[0-9a-f]{0,6}$|rgba?\(|K\d{2,3}:|\bK\d{2,3}\b|px|solid|opacity|"
                      r"stroke|fill|background|border|margin|padding|font-size", re.I)
PERCENT = re.compile(r"\d%|% of|percent", re.I)
DATED = re.compile(r"\bv\d\.\d\b|audit|manual pass|SCOPE FLAG|original|at the time|"
                   r"was |were |generation across|ratified delta", re.I)
OTHER_POP = re.compile(r"real-world example|instances across|rwe", re.I)
PRESENT = re.compile(r"\bis\b|\bare\b|current|displays|dominates|reveals", re.I)


def classify(num, ctx, window):
    """Order matters: the cheap exclusions first, the licensing bucket last."""
    near = window[max(0, len(window) // 2 - 26):len(window) // 2 + 26]
    if CSS_CODE.search(near):
        return "CSS-OR-CODE"
    if PERCENT.search(near):
        return "PERCENT"
    if OTHER_POP.search(ctx):
        return "OTHER-POP"
    if DATED.search(ctx):
        return "DATED-RECORD"
    if PRESENT.search(ctx):
        return "LIVE-CLAIM"
    return "UNCLASSIFIED"


def sweep(root):
    buckets = {}
    scanned = []
    for rel in SURFACES:
        path = os.path.join(root, rel)
        if not os.path.exists(path):
            continue
        text = open(path, encoding="utf-8", errors="replace").read()
        scanned.append((rel, len(text)))
        for num in NUMERALS:
            for m in re.finditer(r"(?<![\d.])" + num + r"(?![\d.])", text):
                window = text[max(0, m.start() - 110):m.start() + 110].replace("\n", " ")
                if not CLAIM.search(window):
                    continue
                ctx = re.sub(r"\s+", " ", text[max(0, m.start() - 320):m.start() + 320])
                buckets.setdefault(classify(num, ctx, window), []).append((rel, num, m.start(), ctx))
    return scanned, buckets


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--root", help="a FRESH public-origin clone of efilist (never a mount)")
    p.add_argument("--self-test", action="store_true")
    p.add_argument("--show", default="LIVE-CLAIM,UNCLASSIFIED",
                   help="comma-separated buckets to print in full")
    a = p.parse_args()
    print("$ " + " ".join(sys.argv))        # cccxxxi

    if a.self_test:
        ok = True
        cases = [("74", "the v3.5 manual pass read all 74 entries", "DATED-RECORD"),
                 ("78", "78% of edges appear in only one mode", "PERCENT"),
                 ("222", "border: 1px solid #222; padding", "CSS-OR-CODE"),
                 ("78", "136 real-world example instances across 78 objections", "OTHER-POP"),
                 ("222", "the current dependency distribution is 222 edges", "LIVE-CLAIM")]
        for num, ctx, want in cases:
            got = classify(num, ctx, ctx)
            ok &= got == want
            print("  %-12s want %-13s got %-13s %s" % (num, want, got, "PASS" if got == want else "FAIL"))
        print("SELF-TEST", "PASS" if ok else "FAIL")
        sys.exit(0 if ok else 1)

    if not a.root:
        print("FAIL: --root is required (or --self-test)", file=sys.stderr)
        sys.exit(1)

    scanned, buckets = sweep(a.root)
    print("SCANNED %d surfaces" % len(scanned))
    for rel, n in scanned:
        print("   %-34s %9d B" % (rel, n))
    total = sum(len(v) for v in buckets.values())
    print("\n%d claim-proximate candidates" % total)
    for name in ("CSS-OR-CODE", "PERCENT", "OTHER-POP", "DATED-RECORD", "UNCLASSIFIED", "LIVE-CLAIM"):
        print("   %-14s %d" % (name, len(buckets.get(name, []))))

    show = [s.strip() for s in a.show.split(",") if s.strip()]
    for name in show:
        rows = buckets.get(name, [])
        if not rows:
            continue
        print("\n===== %s (%d) -- a human reads every one of these =====" % (name, len(rows)))
        for rel, num, off, ctx in rows:
            print("\n  %s  [%s] @%d" % (rel, num, off))
            print("    " + ctx.strip()[:330])
    print("\nNOTHING IS AN EDIT UNTIL a reader names what it counts and when it was true.")
    print("A CLEAN RUN IS NOT A CLEAN CORPUS. This instrument reads strings. The flagship's")
    print("largest fossil -- the LOAD-BEARING table -- is a SUM of thirteen rows and the digits")
    print("222 appear nowhere in it. Run regen_load_bearing.py for anything that is arithmetic.")
    sys.exit(0)


if __name__ == "__main__":
    main()
