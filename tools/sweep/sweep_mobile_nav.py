#!/usr/bin/env python3
"""
sweep_mobile_nav.py (K281) — add the mobile-nav component to every nav-bearing page.

COMMITTED ON PURPOSE. K276's equivalent lived only in session scratch and was gone
by the next session, so its 74/73 page-set could not be re-derived. This one stays.

Target set = pages carrying `class="site-nav"` (the sheet is meaningless without a
nav to build from). Head-bearing pages WITHOUT a nav — the sealed `_/` pages,
offline.html, 404, and the Illogically Is apparatus — are skipped by construction.

Inserts one marked block immediately before </head>:
    <!-- K281 mobile nav --> ... <!-- /K281 mobile nav -->
The stylesheet carries media="(max-width: 640px)" so a desktop never applies it;
the script is (pointer: coarse)-gated internally. Head additions are body-blind,
so the swept pages' bodies are byte-identical.

FINAL-STATE GATED and idempotent: a partial application ABORTS (nothing written)
and a re-run is a no-op.

    python3 tools/sweep/sweep_mobile_nav.py src
    python3 tools/sweep/sweep_mobile_nav.py src --check
"""
import pathlib, sys

OPEN, SHUT = "<!-- K281 mobile nav -->", "<!-- /K281 mobile nav -->"
BLOCK = (
    "  " + OPEN + "\n"
    '  <link rel="stylesheet" href="/components/mobile-nav.css?v=K281" media="(max-width: 640px)">\n'
    '  <script defer src="/components/mobile-nav.js?v=K281"></script>\n'
    "  " + SHUT + "\n"
)


def main():
    root = pathlib.Path(sys.argv[1])
    check = "--check" in sys.argv
    targets, skipped, already, planned = [], [], [], []

    for f in sorted(root.rglob("*.html")):
        t = f.read_text(encoding="utf-8")
        if "</head>" not in t:
            continue
        if 'class="site-nav"' not in t:
            skipped.append(f)
            continue
        targets.append(f)
        if OPEN in t:
            already.append(f)
        else:
            planned.append((f, t))

    if any(t.read_text(encoding="utf-8").count("</head>") != 1 for t in targets):
        sys.exit("FAIL: a target page has != 1 </head>")
    if already and planned:
        sys.exit("FAIL: partial application (%d done, %d pending) — adjudicate, do not sweep"
                 % (len(already), len(planned)))

    print("targets(nav-bearing)=%d  skipped(no nav)=%d  already=%d  to-write=%d"
          % (len(targets), len(skipped), len(already), len(planned)))
    if check or not planned:
        if not planned:
            print("NO-OP (already at final state)")
        return

    for f, t in planned:
        f.write_text(t.replace("</head>", BLOCK + "</head>", 1), encoding="utf-8", newline="\n")

    css = js = 0
    for f in targets:
        t = f.read_text(encoding="utf-8")
        css += t.count("mobile-nav.css?v=K281")
        js += t.count("mobile-nav.js?v=K281")
    if css != len(targets) or js != len(targets):
        sys.exit("FAIL final-state gate: css=%d js=%d expected=%d" % (css, js, len(targets)))
    stray = [f for f in skipped if OPEN in f.read_text(encoding="utf-8")]
    if stray:
        sys.exit("FAIL: block landed on a non-nav page: %s" % stray[:3])
    print("OK final state: %d/%d css, %d/%d js, 0 on non-nav pages" % (css, len(targets), js, len(targets)))


if __name__ == "__main__":
    main()
