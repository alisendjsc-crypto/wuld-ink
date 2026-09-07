#!/usr/bin/env python3
"""K298 — phone type-scale escape fix, applied to the two offending components + a ?v sweep.

WHY THIS IS A SCRIPT AND NOT 35 SIDECARS
  The fix is two CSS appends plus a version bump on every consumer of those components.
  Per ccxliv a script that rewrites N pages is repo state, not scratch, so the next session
  can re-derive the target set instead of guessing it.

WHAT IT DOES
  1. Appends a (max-width: 640px) block to components/gallery.css and components/glossary.css.
     Both selectors sit at the ESCAPING rule's own specificity and later in source, so they
     beat it; mobile-a11y.css's bare `h1` clamp (0,0,1) loses to `.entry-term` (0,1,0) and to
     `.gallery-page .page-hero-title` (0,2,0), which is the whole defect.
  2. Bumps gallery.css ?v=K275 -> ?v=K298 (10 occurrences) and glossary.css ?v=K30 -> ?v=K298
     (25 occurrences in 23 files — two files link it twice, so the gate counts OCCURRENCES).

IDEMPOTENT + FINAL-STATE GATED. A re-run reports SKIP/0 and exits 0 if already applied;
a partial application exits non-zero. Usage:  python tools/sweep/sweep_k298_typescale.py src
"""
import os, sys

GALLERY_BLOCK = """
/* ── K298 · phone type scale ─────────────────────────────────
   `.gallery-page .page-hero-title` (0,2,0) beats mobile-a11y's bare `h1`
   phone clamp (0,0,1), so the nine room pages render their h1 at 54px —
   1.58x the phone scale, wrapping to two lines. Same clamp as the site's
   own phone h1, at the escaping selector's specificity, phone-scoped;
   desktop is inert. (The lobby carries an identical page-local rule from
   K297 — a harmless duplicate at the same value, left in place.) */
@media (max-width: 640px) {
  .gallery-page .page-hero-title { font-size: clamp(1.9rem, 7vw, 2.6rem); line-height: 1.12; overflow-wrap: break-word; }
}
"""

GLOSSARY_BLOCK = """
/* ── K298 · phone type scale ─────────────────────────────────
   `.entry-term` (0,1,0) beats mobile-a11y's bare `h1` phone clamp
   (0,0,1), so every glossary entry renders its headword at 54px — 1.58x
   the phone scale, wrapping to four lines / 255px at worst. Same clamp
   as the site's own phone h1, at the escaping selector's specificity,
   phone-scoped; desktop is inert. The italic headline face and the
   term's own margin are untouched. */
@media (max-width: 640px) {
  .entry-term { font-size: clamp(1.9rem, 7vw, 2.6rem); line-height: 1.12; overflow-wrap: break-word; }
}
"""

MARK = "K298 · phone type scale"
COMPONENTS = [("gallery.css", GALLERY_BLOCK), ("glossary.css", GLOSSARY_BLOCK)]
SWEEPS = [("gallery.css?v=K275", "gallery.css?v=K298", 10),
          ("glossary.css?v=K30", "glossary.css?v=K298", 25)]


def rd(p):
    return open(p, encoding="utf-8").read()


def wr(p, s):
    open(p, "w", encoding="utf-8", newline="").write(s)


def main(root):
    fail, applied = [], False
    for comp, blk in COMPONENTS:
        p = os.path.join(root, "components", comp)
        if not os.path.exists(p):
            fail.append("missing " + comp); continue
        s = rd(p)
        if MARK in s:
            print("  SKIP   %s (block already present)" % comp)
        else:
            wr(p, s + blk); applied = True
            print("  +block %s" % comp)

    for old, new, expect in SWEEPS:
        hits = files = 0
        for dp, _, fns in os.walk(root):
            for fn in fns:
                if not fn.endswith(".html"):
                    continue
                fp = os.path.join(dp, fn); s = rd(fp); n = s.count(old)
                if n:
                    wr(fp, s.replace(old, new)); hits += n; files += 1
        if hits:
            applied = True
        print("  sweep  %-22s -> %-22s %2d occurrences in %2d files" % (old, new, hits, files))

    # FINAL-STATE GATE — counts OCCURRENCES, not files (two glossary pages link it twice).
    tot_old = {o: 0 for o, _, _ in SWEEPS}
    tot_new = {n: 0 for _, n, _ in SWEEPS}
    for dp, _, fns in os.walk(root):
        for fn in fns:
            if not fn.endswith(".html"):
                continue
            s = rd(os.path.join(dp, fn))
            for o, n, _ in SWEEPS:
                tot_old[o] += s.count(o); tot_new[n] += s.count(n)
    for o, n, e in SWEEPS:
        print("  final  %s=%d (need 0)   %s=%d (need %d)" % (o, tot_old[o], n, tot_new[n], e))
        if tot_old[o]:
            fail.append("%s residual %d" % (o, tot_old[o]))
        if tot_new[n] != e:
            fail.append("%s count %d != %d" % (n, tot_new[n], e))
    for comp, _ in COMPONENTS:
        s = rd(os.path.join(root, "components", comp))
        if s.count(MARK) != 1:
            fail.append("%s block count %d != 1" % (comp, s.count(MARK)))
        if "�" in s:
            fail.append("%s U+FFFD" % comp)
        if "\r" in s:
            fail.append("%s CR" % comp)

    if fail:
        print("\nFAIL: " + "; ".join(fail)); return 1
    print("\nOK - all gates green (%s)" % ("applied" if applied else "NO-OP, already at final state"))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "src"))
