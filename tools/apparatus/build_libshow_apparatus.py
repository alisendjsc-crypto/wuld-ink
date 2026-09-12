#!/usr/bin/env python3
"""build_libshow_apparatus.py - the Argument Library showcase Apparatus, from its Markdown.

The other two Apparatus pages are HTML artifacts authored by the Video Editing project
and only WRAPPED here (apply_wuld_wrap.py). This one arrives as Markdown instead, so
wuld.ink builds the artifact -- and builds it from the Markdown rather than by hand,
because the video seat will REISSUE that Markdown after the library re-pin with a new
hash, byte count, frame count and duration (handout section 5). A hand-authored page
would make that reissue a hand-edit; this makes it a re-run.

Output is a CLEAN artifact: no wuld:head / wuld:links / wuld:colophon regions. Pipe it
through apply_wuld_wrap.py --variant libshow to get the shipped index.html.

  python3 tools/apparatus/build_libshow_apparatus.py \
      --in  src/argument-library/apparatus/argument-library-apparatus.md \
      --out /tmp/libshow-artifact.html

Style: the dot page's <style> block VERBATIM (handout section 3 -- the three Apparatus
pages are one object seen three times), with exactly TWO changes:

  1. AUTHORISED (handout section 3): the h1 rule becomes the Illogically Is apparatus's,
     because 7rem is sized for a single glyph.
  2. REPORTED, not authorised -- one appended declaration, `code{overflow-wrap:anywhere}`.
     This page is the first Apparatus to quote a hash and a corpus filename in PROSE
     rather than inside a .scroll table, and an unbreakable 32/36-character token in a
     paragraph makes the whole document side-scroll on a phone: measured 73 px of
     overflow at 320 px wide, 33 at 360, 3 at 390, clean at 430. The dot page is 0 at
     every width because it never quotes one; the FILM apparatus already overflows 158 px
     from exactly this cause, so the defect is the family's, not this page's invention.
     It is one declaration, it changes no look at any width where nothing overflows, and
     without it the page fails the site's own "the body must never scroll horizontally"
     rule on most phones. Flagged to the video seat rather than smuggled.
"""
import argparse, html, re, sys

# --- the dot page's style block, verbatim, with the ONE authorised h1 swap ----------
STYLE = """:root{--bg:#faf9f7;--fg:#16151a;--mut:#5d5b63;--line:#dcd9d3;--acc:#8b1013;--card:#f2f0ec}
@media (prefers-color-scheme:dark){:root{--bg:#0c0c0e;--fg:#e9e7e3;--mut:#8f8d95;--line:#26262b;--acc:#c1121f;--card:#141416}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:"IBM Plex Serif",Georgia,"Times New Roman",serif;
line-height:1.6;font-size:17px}
main{max-width:56rem;margin:0 auto;padding:3.5rem 1.25rem 6rem}
h1{font:600 1.9rem/1.15 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.02em;margin:0 0 1rem}
h1 .dot{color:var(--acc)}
.sub{font-family:"IBM Plex Mono",ui-monospace,monospace;color:var(--mut);font-size:.84rem;letter-spacing:.04em;text-transform:uppercase;margin:0 0 2.5rem}
h2{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:1rem;letter-spacing:.08em;text-transform:uppercase;
color:var(--mut);border-top:1px solid var(--line);padding-top:1.4rem;margin:3rem 0 1.1rem}
.warn{border-left:3px solid var(--acc);background:var(--card);padding:.9rem 1.1rem;margin:0 0 2rem;font-size:.97rem}
dl{margin:0}dt{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.82rem;letter-spacing:.05em;
text-transform:uppercase;color:var(--mut);margin-top:1.1rem}dd{margin:.25rem 0 0}
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:1rem 0}
table{border-collapse:collapse;width:100%;min-width:40rem;font-size:.92rem}
th,td{text-align:left;vertical-align:top;padding:.5rem .7rem;border-bottom:1px solid var(--line)}
th{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.74rem;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);white-space:nowrap}
td:first-child{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.85rem;color:var(--mut);white-space:nowrap}
.todo{color:var(--acc);font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.8rem}
.qc{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:.8rem;color:var(--mut);line-height:1.75}
.qc b{color:var(--fg);font-weight:600}
footer{margin-top:3.5rem;border-top:1px solid var(--line);padding-top:1.2rem;color:var(--mut);font-size:.86rem}
a{color:inherit;text-decoration:underline;text-underline-offset:.15em;text-decoration-color:var(--acc)}
code{overflow-wrap:anywhere}"""

TITLE = "The Argument Library \u2014 the Apparatus"   # literal em-dash, as the dot page's <title> has
H1    = "The Argument Library"
SUB   = "The Apparatus &middot; showcase film for library.wuld.ink &middot; %s"  # runtime DERIVED in main()

# handout section 4: which Markdown section renders as what. Unlisted heading = fail loud.
RENDER = {
    "The film, in numbers": "dl",
    "How the capture was made — and why it is not a recording": "prose",
    "Reproducibility, tested rather than asserted": "prose",
    "The sound is made from the corpus": "prose",
    "The typography": "prose",
    "Every claim on screen, and where it comes from": "prose",
    # v0.9 turned Verification from a bullet list into a TWO-CUT COMPARISON TABLE. The
    # handout's section-4 mapping says ".qc block" -- written against the v0.1 document,
    # which had one cut and one column. A .qc list cannot hold a comparison, so this now
    # renders as a .scroll table like the other tabular sections. Deviation, reported.
    "Verification": "prose",
    # v4 (one cut, 2026-09-10) added two sections the v0.9 map did not know: the regrade is
    # documented under "Colour", and the drawn-monitor section, which v10 also carried and which
    # this map had ALSO never listed -- so the tool as shipped could not build either document.
    # Both are prose. Adjudicated by the wuld.ink seat, which owns this tool.
    "Colour": "prose",
    "The monitor is drawn": "prose",
    "Provenance of the frames": "prose",
    "Colophon": "colophon",
}
# handout section 4: keep *Argue the Argument* in --acc, "without adding a class"
ACC_EM = "Argue the Argument"


def inline(s):
    """Markdown inline -> HTML. Escapes first, so no source markup can inject."""
    s = html.escape(s, quote=False)
    s = re.sub(r"`([^`]+)`", lambda m: "<code>" + m.group(1) + "</code>", s)
    # emphasis INNERMOST-FIRST. The source nests italic inside bold
    # (`**Planned - *Argue the Argument*,**`); running bold first, its [^*] class stops
    # at the inner marker, the outer `**` survive as literal asterisks on the page and
    # no numbers check can see it. Italic first leaves no `*` for bold to trip on.
    def em(m):
        t = m.group(1)
        # the one authorised colour, inline so the shared style block stays verbatim
        style = ' style="color:var(--acc)"' if t == ACC_EM else ""
        return "<em%s>%s</em>" % (style, t)
    s = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", em, s)
    s = re.sub(r"\*\*([^*]+)\*\*", lambda m: "<strong>" + m.group(1) + "</strong>", s)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", lambda m: '<a href="%s">%s</a>' % (m.group(2), m.group(1)), s)
    return s.replace("--", "&mdash;") if False else s


def split_blocks(body):
    """Group a section's lines into (kind, lines) blocks: para / ul / table."""
    out, cur, kind = [], [], None
    def flush():
        if cur: out.append((kind, cur[:])); cur.clear()
    for ln in body.split("\n"):
        if not ln.strip():
            flush(); kind = None; continue
        k = "table" if ln.lstrip().startswith("|") else ("ul" if ln.lstrip().startswith("- ") else "para")
        if k != kind: flush(); kind = k
        cur.append(ln)
    flush()
    return out


def render_table(lines):
    rows = [[c.strip() for c in l.strip().strip("|").split("|")] for l in lines]
    rows = [r for r in rows if not all(re.fullmatch(r":?-{2,}:?", c or "") for c in r)]
    head, body = rows[0], rows[1:]
    h = "".join("<th>%s</th>" % inline(c) for c in head)
    b = "".join("<tr>" + "".join("<td>%s</td>" % inline(c) for c in r) + "</tr>" for r in body)
    return ('<div class="scroll"><table><thead><tr>%s</tr></thead><tbody>%s</tbody></table></div>' % (h, b))


def render_dl(lines):
    """`- **Term** — rest`  ->  <dt>Term</dt><dd>rest</dd>"""
    out = []
    for l in lines:
        m = re.match(r"-\s+\*\*(.+?)\*\*\s*[—-]\s*(.*)$", l.strip())
        if not m:
            sys.exit("FAIL: numbers bullet is not `- **Term** - rest`: " + l)
        out.append("<dt>%s</dt><dd>%s</dd>" % (inline(m.group(1)), inline(m.group(2))))
    return "<dl>" + "".join(out) + "</dl>"


def render_qc(blocks):
    """Verification -> the .qc block, <b> on the value names as the dot page does."""
    lead, vals, result = [], [], []
    for kind, lines in blocks:
        if kind == "ul":
            for l in lines:
                m = re.match(r"-\s+\*\*(.+?)\*\*\s*[\u2014-]\s*(.*)$", l.strip())
                if not m:
                    sys.exit("FAIL: verification bullet is not `- **name** - value`: " + l)
                vals.append("<b>%s</b> &mdash; %s" % (inline(m.group(1)), inline(m.group(2))))
        else:
            txt = " ".join(x.strip() for x in lines)
            (result if txt.startswith("**RESULT") else lead).append(inline(txt))
    out = "".join("<p>%s</p>\n" % l for l in lead)
    out += '<div class="qc">' + "<br>".join(vals)
    if result:
        # the shared style block declares `.qc b`, not `.qc strong`: a <strong> here
        # would inherit .qc's --mut and the RESULT line would ship muted (the dot page
        # uses <b>). Swap inside the qc div only; prose outside it keeps <strong>.
        out += "<br><br>\n" + "<br>".join(r.replace("<strong>", "<b>").replace("</strong>", "</b>") for r in result)
    return out + "</div>"


def render_prose(blocks):
    out = []
    for kind, lines in blocks:
        if kind == "table":
            out.append(render_table(lines))
        elif kind == "ul":
            items = []
            for l in lines:
                items.append("<li>%s</li>" % inline(re.sub(r"^-\s+", "", l.strip())))
            out.append("<ul>" + "".join(items) + "</ul>")
        else:
            out.append("<p>%s</p>" % inline(" ".join(x.strip() for x in lines)))
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="src", required=True)
    ap.add_argument("--out", dest="out", required=True)
    a = ap.parse_args()
    md = open(a.src, encoding="utf-8").read()
    assert "\r" not in md, "source Markdown has CR"

    # The measured-marker convention (K310i) put two <!-- --> lines above the h1 after this tool
    # was written, so "must open with an h1" started failing on every reissued document. The
    # markers are for the gate, not the page: skip leading comment lines and blanks, keep the rest.
    _ls = md.split("\n"); _i = 0
    while _i < len(_ls) and (_ls[_i].strip() == "" or _ls[_i].lstrip().startswith("<!--")): _i += 1
    md = "\n".join(_ls[_i:])
    head, _, rest = md.partition("\n---\n")
    lines = head.split("\n")
    assert lines[0].startswith("# "), "Markdown must open with an h1"
    paras = [x.strip() for x in "\n".join(lines[1:]).split("\n\n") if x.strip()]
    assert len(paras) >= 2, "expected an intro plus at least one warning, got %d" % len(paras)
    intro, rest_paras = paras[0], paras[1:]

    # The runtime is DERIVED from the intro, never carried as a constant: v0.1 was one
    # 3:53 cut, v0.9 is two (3:59 / 4:34), and a hardcoded .sub would have shipped stale.
    m = re.search(r"\.\s*([0-9]+:[0-9]{2}(?:\s*/\s*[0-9]+:[0-9]{2})*)\s*\.", intro)
    if not m:
        sys.exit("FAIL: no runtime in the intro paragraph - adjudicate before building")
    runtime = re.sub(r"\s*/\s*", " / ", m.group(1))

    # Warnings group by their bolded label: a paragraph opening **Something.** starts a new
    # block, unlabelled paragraphs after it belong to it. v0.9's photosensitivity warning
    # runs to two paragraphs because it names the W.U.L.D. cream-page exception.
    warns, cur = [], []
    for para in rest_paras:
        if re.match(r"\*\*[A-Z][^*]*\.\*\*", para) and cur:
            warns.append(cur); cur = []
        cur.append(para)
    if cur:
        warns.append(cur)
    warn_html = ""
    for block in warns:
        if len(block) == 1:
            warn_html += '<p class="warn">%s</p>\n' % inline(block[0])
        else:
            warn_html += '<div class="warn">%s</div>\n' % "".join("<p>%s</p>" % inline(b) for b in block)

    secs = re.split(r"\n## ", "\n" + rest.strip())
    secs = [s for s in secs if s.strip()]
    body = []
    seen = []
    for s in secs:
        title, _, rest_s = s.partition("\n")
        title = title.strip()
        seen.append(title)
        if title not in RENDER:
            sys.exit("FAIL: unmapped section %r - handout section 4 lists every one; adjudicate" % title)
        blocks = split_blocks(rest_s.strip())
        mode = RENDER[title]
        if mode == "colophon":
            body.append("<h2>%s</h2>\n%s" % (inline(title), render_prose(blocks)))
        elif mode == "dl":
            assert len(blocks) == 1 and blocks[0][0] == "ul", "numbers section must be one list"
            body.append("<h2>%s</h2>%s" % (inline(title), render_dl(blocks[0][1])))
        elif mode == "qc":
            body.append("<h2>%s</h2>\n%s" % (inline(title), render_qc(blocks)))
        else:
            body.append("<h2>%s</h2>\n%s" % (inline(title), render_prose(blocks)))
    missing = [k for k in RENDER if k not in seen]
    if missing:
        sys.exit("FAIL: source is missing mapped section(s): %r" % missing)

    doc = (
        '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        "<title>%s</title>\n<style>\n%s\n</style></head><body><main>\n" % (TITLE, STYLE)
        + "<h1>%s</h1>\n" % H1
        + '<p class="sub">%s</p>\n' % (SUB % runtime)
        + warn_html
        + "<p>%s</p>\n" % inline(" ".join(intro.split("\n")))
        + "\n".join(body)
        + "\n</main></body></html>\n"
    )
    assert "\r" not in doc and "\ufffd" not in doc
    open(a.out, "w", encoding="utf-8", newline="\n").write(doc)
    print("wrote %s (%d B), %d sections" % (a.out, len(doc.encode()), len(secs)))


if __name__ == "__main__":
    main()
