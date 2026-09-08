#!/usr/bin/env python3
"""K299 - move the coverage audit's two hardcoded baselines to the K299 corpus.

Both are EXPECTED failures of a ratified change, not defects, and both are recorded here so
the move is visible rather than silent:

  1. anatomy: 184 entries / 833 patterns -> 185 / 850. K299 adds mg-oracle-help-01 (TX15-BACK
     Ask A) and 11 crisis-floor forms (Ask C), and retires 8 twins via the K299 re-spelling.

  2. calibration: `help` -> `mg-oracle-nav-01` becomes `help` -> `mg-oracle-help-01`. This IS
     rider edit i: bare `help` is a capability question far more often than a map question, and
     the nav oracle was shipping an href to `/` at a visitor already standing on `/successor/`.

Nothing else in the battery moves. The assertions themselves are untouched - only the numbers
and the one expected id they compare against.
"""
import sys, pathlib

def main(root):
    p = pathlib.Path(root) / "tools/omega/coverage_audit.cjs"
    s = p.read_text(encoding="utf-8")
    old_a = ('assert(E.length === 184 && forms.length === 833, '
             '"anatomy matches the K270 corpus (184 entries / 833 patterns)", E.length);')
    new_a = ('assert(E.length === 185 && forms.length === 850, '
             '"anatomy matches the K299 corpus (185 entries / 850 patterns)", E.length);')
    assert s.count(old_a) == 1, "anatomy assertion shape changed"
    s = s.replace(old_a, new_a)
    old_c = '["help", "mg-oracle-nav-01"]'
    new_c = '["help", "mg-oracle-help-01"]'
    assert s.count(old_c) == 1, "calibration entry shape changed"
    s = s.replace(old_c, new_c)
    p.write_text(s, encoding="utf-8", newline="")
    print("  coverage_audit.cjs: anatomy 184/833 -> 185/849 ; calibration help -> mg-oracle-help-01")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "."))
