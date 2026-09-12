#!/usr/bin/env python3
"""verify_libshow_apparatus.py - the built page must still say what the Markdown says.

The Apparatus exists so a sceptic can check the film's numbers, so the numbers are the
one thing that must survive the Markdown -> HTML conversion intact. The video seat will
REISSUE the Markdown after the library re-pin (handout section 5) with a new hash, byte
count, frame count and duration; this gate is what says the rebuild picked them up.

  python3 tools/apparatus/verify_libshow_apparatus.py \
      --md   src/argument-library/apparatus/argument-library-apparatus.md \
      --page src/argument-library/apparatus/index.html \
      --dot  src/illogically-is/dot/apparatus/index.html
"""
import argparse, html, re, sys

# handout section 4: "Do not soften 'does not archive its citations' into something more
# flattering." These are the document's credibility; each must survive verbatim.
WITHDRAWN = [
    "No archive claim.",
    'No "every example is quoted."',
    "No source-diversity count.",
    "No correction of 78 to 82 in the Argument Flow map.",
]
# handout section 5: these are the PRE-SWEEP pin. The page must not ship quoting them.
PRE_SWEEP_MD5   = "e654eabd32fa95e5969d49e6eb15aa87"
PRE_SWEEP_BYTES = "2,963,752"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--md", required=True)
    ap.add_argument("--page", required=True)
    ap.add_argument("--dot", required=True)
    ap.add_argument("--require-repin", action="store_true",
                    help="also assert the page no longer quotes the pre-sweep pin (ship gate)")
    a = ap.parse_args()
    md = open(a.md, encoding="utf-8").read()
    # The measured marker is for the ship gate, not the page: its md5 and byte count are not
    # figures the page must carry, and counting them as such reported the marker's own byte
    # count "missing" from every page built after the marker convention arrived. Strip the
    # leading comment lines here exactly as the build tool does.
    _ls = md.split("\n"); _i = 0
    while _i < len(_ls) and (_ls[_i].strip() == "" or _ls[_i].lstrip().startswith("<!--")): _i += 1
    md = "\n".join(_ls[_i:])
    pg = open(a.page, encoding="utf-8").read()
    dot = open(a.dot, encoding="utf-8").read()
    txt = html.unescape(re.sub(r"<[^>]+>", " ", pg))
    txt = re.sub(r"\s+", " ", txt)

    ok = fail = 0
    def chk(name, cond, got=""):
        nonlocal ok, fail
        if cond: ok += 1; print("  ok   " + name)
        else:    fail += 1; print("  FAIL " + name + ("  " + got if got else ""))

    print("== every number in the Markdown survives into the page ==")
    nums = sorted({n for n in re.findall(r"\d[\d,]*\.?\d*", md) if len(n) > 1})
    missing = [n for n in nums if n not in txt]
    chk("all %d multi-digit figures present" % len(nums), not missing, repr(missing[:8]))

    print("\n== the four withdrawn claims survive verbatim ==")
    for w in WITHDRAWN:
        chk(w, w in txt)

    print("\n== no Markdown survived the conversion ==")
    # a numbers check cannot see markup residue: nested emphasis once shipped a literal
    # `**` onto the page while every figure was present and correct.
    residue = {
        "unconverted ** (bold)": "**" in txt,
        "unconverted backtick": "`" in txt,
        "unconverted [text](url)": bool(re.search(r"\[[^\]]+\]\([^)]+\)", txt)),
        "stray heading marker": bool(re.search(r"(^|\s)#{1,6}\s", txt)),
        "stray table pipe": "|" in txt,
    }
    for name, bad in residue.items():
        chk("no " + name, not bad)

    print("\n== structure the handout specifies (section 4) ==")
    chk("numbers section is a dl", "<dl>" in pg and pg.count("<dt>") >= 6)
    # v0.9: three tables (sound, claims, verification). Verification became a two-cut
    # comparison table, so the handout's ".qc block" mapping no longer applies -- a .qc
    # list cannot hold two columns. Deviation recorded in build_libshow_apparatus.py.
    nscroll, ntable = pg.count('<div class="scroll">'), pg.count("<table>")
    chk("every table is inside a .scroll", nscroll == ntable and ntable >= 1, "scroll=%d table=%d" % (nscroll, ntable))
    # v0.9 fixed the table count at three. v4 carries five: the Colour section documents the
    # regrade as a table and Verification grew a second. The count is DERIVED from the Markdown
    # now -- one table per section whose body contains a pipe row -- so a document that adds or
    # removes a table is checked against itself rather than against a constant.
    # A table is a RUN of consecutive pipe rows, not a section that contains one: v4's Colour
    # section holds two tables, and counting sections read 4 against the page's honest 5.
    n_md_tables = len(re.findall(r"(?:^\|.*\|[ \t]*\n)+", md + "\n", re.M))
    chk("as many tables as the Markdown has", ntable == n_md_tables, "page %d, markdown %d" % (ntable, n_md_tables))
    chk("verification renders, and as a table not a .qc list",
        "Verification" in txt and 'class="qc"' not in pg)
    # v0.9 compared two cuts and required two "OK - 5 of 5" rows. v4 is ONE cut, by the film's own
    # second paragraph, so the number of cuts is read off the intro rather than assumed: it says
    # "One cut." or gives two runtimes. Require one result row per cut.
    n_cuts = 2 if re.search(r"\d:\d\d\s*/\s*\d:\d\d", md.split("\n---\n")[0]) else 1
    n_ok = txt.count("OK — 5 of 5") + txt.count("OK - 5 of 5")
    chk("one verification result per cut (%d cut%s)" % (n_cuts, "s" if n_cuts > 1 else ""), n_ok == n_cuts, "found %d" % n_ok)
    chk("colophon footer block present", 'class="wuld-colophon"' in pg)

    print("\n== one object seen three times (handout section 3) ==")
    sdot = re.findall(r"<style>(.*?)</style>", dot, re.S)[-1].strip().split("\n")
    spg  = re.findall(r"<style>(.*?)</style>", pg,  re.S)[-1].strip().split("\n")
    diff = [i for i, (x, y) in enumerate(zip(sdot, spg)) if x != y]
    extra = spg[len(sdot):]
    chk("style block differs from the dot page's in exactly 1 line (the h1)",
        len(diff) == 1 and spg[diff[0]].startswith("h1{"), "diff lines=%r" % diff)
    chk("h1 uses the Illogically Is sizing, not the dot's 7rem",
        bool(diff) and "1.9rem" in spg[diff[0]])
    # the one appended declaration, documented in build_libshow_apparatus.py's docstring
    chk("exactly one appended rule, and it is the phone-overflow fix",
        extra == ["code{overflow-wrap:anywhere}"], repr(extra))

    print("\n== the rules that are not about looks ==")
    chk("no script tag", "<script" not in pg)
    chk("no video embed or iframe", "<iframe" not in pg and "<video" not in pg)
    chk("no hero image", "<img" not in pg)
    chk("no external font/analytics ref beyond the two the other pages load",
        not re.search(r'https?://(?!library\.wuld\.ink|wuld\.ink)', pg.split("</head>", 1)[1]))
    # the predicate is "is there a LINK to the film", not "does the word appear": the
    # hold comment names YouTube on purpose, and a substring test fails on its own note.
    vid = re.findall(r'(?:href|src)="([^"]*(?:youtu\.?be|youtube|vimeo|archive\.org)[^"]*)"', pg, re.I)
    chk("film is NOT linked (handout section 6)", not vid, repr(vid))
    chk("the Markdown is linked from the page", 'href="argument-library-apparatus.md"' in pg)
    chk("canonical is the argument-library path",
        'href="https://wuld.ink/argument-library/apparatus/"' in pg)

    print("\n== no unfilled fill-markers (v0.9 templated the pin) ==")
    # v0.9 replaced the hardcoded pin with <PIN_MD5> / <PIN_BYTES> / <DIFF_OUTCOME>,
    # which fill from the attestation. That silently opened a hole in the hold below:
    # a templated page no longer quotes the pre-sweep hash, so the pre-sweep check alone
    # would let an UNFILLED template ship. Match any <UPPERCASE_MARKER>, not a fixed list,
    # so a marker invented later is caught too.
    # Check the UNESCAPED text, not the raw HTML: the builder html-escapes, so a marker
    # reaches the page as &lt;PIN_MD5&gt; and a regex over the source misses it entirely.
    # (Scan both, so a marker that arrives unescaped is caught too.)
    markers = sorted(set(re.findall(r"<[A-Z][A-Z0-9_]*>", txt)) | set(re.findall(r"<[A-Z][A-Z0-9_]*>", pg)))
    if a.require_repin:
        chk("no unfilled markers in the page", not markers, repr(markers))
    else:
        print("  note %s" % ("unfilled, as expected pre-attestation: " + ", ".join(markers)
                             if markers else "no markers outstanding"))

    print("\n== the re-pin hold (handout section 5) ==")
    quotes_old = PRE_SWEEP_MD5 in pg or PRE_SWEEP_BYTES in pg or bool(markers)
    if a.require_repin:
        chk("page no longer quotes the pre-sweep pin -- the reissue has landed",
            not quotes_old, "still quotes %s / %s" % (PRE_SWEEP_MD5[:8], PRE_SWEEP_BYTES))
    else:
        print("  note %s the pre-sweep pin (%s). HOLD THE PUBLISH until the seat reissues."
              % ("page still quotes" if quotes_old else "page no longer quotes", PRE_SWEEP_MD5[:8]))

    print("\nAPPARATUS GATE: %s" % ("RED — %d failure(s)" % fail if fail else "GREEN — %d checks" % ok))
    sys.exit(1 if fail else 0)


if __name__ == "__main__":
    main()
