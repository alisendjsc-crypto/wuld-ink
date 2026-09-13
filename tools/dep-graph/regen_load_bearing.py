#!/usr/bin/env python3
"""
regen_load_bearing.py -- regenerate the flagship's LOAD-BEARING HIERARCHY table
from DEP_GRAPH_DATA's links array, which is the only live source of edge counts.

WHY THIS EXISTS (WI-K325).  combined.html carries three era's worth of edge counts
at once and nothing in the document marks which is which:

    the static table under "THE LOAD-BEARING HIERARCHY"   148 strong / 74 weak = 222   (v3.3/v3.5)
    the per-node strongCount/weakCount/totalCount fields  161 strong / 84 weak = 245   (inert, drifted)
    DEP_GRAPH_DATA.links                                  167 strong / 88 weak = 255   (LIVE)

Only the third is read at render time (depCount() computes from links).  The table is
static HTML introduced by the sentence "The current dependency distribution", so it is
the one place in the artifact where a superseded figure is presented as current.

This script never patches rows.  It recomputes every row from the links and emits the
whole table, because twelve of the thirteen rows move and a row-by-row patch is exactly
how a partial refresh leaves two eras one <br> apart (ccclv).

A published figure gets a generator (cccxxxi); constants are computed, never transcribed
(cccl); the instrument must be able to fail, so --self-test runs it on a mutated corpus
and requires the comparison to report drift (cccxxxix).

USAGE
    python3 tools/dep-graph/regen_load_bearing.py --combined path/to/combined.html
    python3 tools/dep-graph/regen_load_bearing.py --combined ... --emit-table
    python3 tools/dep-graph/regen_load_bearing.py --self-test

EXIT CODES
    0  the static table already agrees with the links (nothing to do)
    2  drift found -- the expected state before the K232 batch lands
    1  structural failure (marker absent, unparseable, unexpected shape)

ROW ORDER is generator-determined: total desc, then strong desc, then label asc.
The hand-made order it replaces followed no single rule (Terror Management preceded
Labor Sine Fructu on a strong-count tie while Zero-Sum trailed two premises it
outranked on strong), so the order is stated here rather than inferred.
"""

import argparse, hashlib, json, re, sys

MARKER = "var DEP_GRAPH_DATA = "
TABLE_HEADING = "THE LOAD-BEARING HIERARCHY"
HEADER_ROW = ("      <tr><th>Premise</th><th>Strong</th><th>Weak</th>"
              "<th>Total</th><th>Layer</th></tr>")


def die(msg):
    print("FAIL: " + msg, file=sys.stderr)
    sys.exit(1)


def extract_dep_graph(text):
    """Pull DEP_GRAPH_DATA out by brace balance. Returns the parsed object."""
    i = text.find(MARKER)
    if i < 0:
        die("marker %r not found" % MARKER)
    s = i + len(MARKER)
    if text[s] != "{":
        die("marker is not followed by an object literal")
    depth = 0
    for j in range(s, len(text)):
        c = text[j]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[s:j + 1])
                except Exception as e:
                    die("DEP_GRAPH_DATA did not parse as JSON: %s" % e)
    die("DEP_GRAPH_DATA object never closed")


def counts_from_links(graph):
    """The live figures. Every edge is classified; an unknown strength is fatal."""
    premises = {n["id"]: n for n in graph["nodes"] if n.get("type") == "premise"}
    if not premises:
        die("no premise nodes")
    tally = {pid: [0, 0] for pid in premises}
    for link in graph["links"]:
        src = link["source"]
        strength = link.get("strength")
        if src not in tally:
            die("link from a non-premise source: %r" % src)
        if strength == "strong":
            tally[src][0] += 1
        elif strength == "weak":
            tally[src][1] += 1
        else:
            die("edge with unclassified strength %r (source %s)" % (strength, src))
    rows = []
    for pid, node in premises.items():
        strong, weak = tally[pid]
        rows.append({
            "label": node["label"],
            "strong": strong,
            "weak": weak,
            "total": strong + weak,
            "layer": (node.get("layer") or "").capitalize(),
            "baked": (node.get("strongCount"), node.get("weakCount"), node.get("totalCount")),
        })
    rows.sort(key=lambda r: (-r["total"], -r["strong"], r["label"]))
    return rows


def parse_static_table(text):
    """Parse the committed table so drift is measured, not assumed."""
    h = text.find(TABLE_HEADING)
    if h < 0:
        die("heading %r not found" % TABLE_HEADING)
    start = text.find("<table", h)
    end = text.find("</table>", h)
    if start < 0 or end < 0 or end < start:
        die("no <table> after the heading")
    raw = text[start:end + len("</table>")]
    rows = []
    for tr in re.findall(r"<tr>(.*?)</tr>", raw, re.S):
        cells = [re.sub(r"<[^>]*>", "", c).strip()
                 for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S)]
        if len(cells) >= 5 and cells[1].isdigit():
            rows.append({"label": cells[0], "strong": int(cells[1]),
                         "weak": int(cells[2]), "total": int(cells[3]), "layer": cells[4]})
    if not rows:
        die("table found but no data rows parsed")
    return raw, rows, start, end + len("</table>")


def render_table(rows):
    out = ['<table class="mp-premise-table">', HEADER_ROW]
    for r in rows:
        out.append("      <tr><td>%s</td><td>%d</td><td>%d</td><td>%d</td><td>%s</td></tr>"
                   % (r["label"], r["strong"], r["weak"], r["total"], r["layer"]))
    out.append("    </table>")
    return "\n".join(out)


def report(text, emit_table):
    graph = extract_dep_graph(text)
    live = counts_from_links(graph)
    raw, static, _, _ = parse_static_table(text)

    if emit_table:
        print(render_table(live))
        return 0

    n_obj = sum(1 for n in graph["nodes"] if n.get("type") != "premise")
    ls, lw = sum(r["strong"] for r in live), sum(r["weak"] for r in live)
    bs = sum(r["baked"][0] or 0 for r in live)
    bw = sum(r["baked"][1] or 0 for r in live)
    ss, sw = sum(r["strong"] for r in static), sum(r["weak"] for r in static)

    print("SOURCE      DEP_GRAPH_DATA: %d nodes (%d premise / %d objection), %d links"
          % (len(graph["nodes"]), len(live), n_obj, len(graph["links"])))
    print("LIVE        links          %3d strong / %3d weak = %d" % (ls, lw, ls + lw))
    print("INERT       baked fields   %3d strong / %3d weak = %d   (not read at render; strip on this touch)"
          % (bs, bw, bs + bw))
    print("COMMITTED   static table   %3d strong / %3d weak = %d" % (ss, sw, ss + sw))
    print()

    by_label = {r["label"]: r for r in static}
    print("ROW-BY-ROW  (committed -> live)")
    moved = 0
    for r in live:
        old = by_label.get(r["label"])
        if old is None:
            print("  %-26s  ABSENT from the committed table -> %d/%d/%d"
                  % (r["label"], r["strong"], r["weak"], r["total"]))
            moved += 1
            continue
        flag = ""
        if (old["strong"], old["weak"], old["total"]) != (r["strong"], r["weak"], r["total"]):
            moved += 1
            flag = "   <-- moves"
        print("  %-26s  %3d/%3d/%3d  ->  %3d/%3d/%3d%s"
              % (r["label"], old["strong"], old["weak"], old["total"],
                 r["strong"], r["weak"], r["total"], flag))
    for label in by_label:
        if label not in {r["label"] for r in live}:
            print("  %-26s  in the committed table, ABSENT from the links" % label)
            moved += 1
    print("\n%d of %d rows move." % (moved, len(live)))

    ci = next((r for r in live if "Consent" in r["label"]), None)
    if ci:
        pct = 100.0 * ci["total"] / (ls + lw)
        print("Consent Impossibility: %d edges (%d strong, %d weak) = %.2f%% -> displays as %d%%"
              % (ci["total"], ci["strong"], ci["weak"], pct, round(pct)))

    print("\nREPLACEMENT TABLE (md5 %s)" % hashlib.md5(render_table(live).encode()).hexdigest())
    print(render_table(live))
    return 2 if moved else 0


def self_test():
    """The control: the comparison must report drift on a corpus it should reject,
    and must report none on one it should accept."""
    base = {
        "nodes": [
            {"id": "prem_a", "type": "premise", "label": "Alpha", "layer": "foundational",
             "strongCount": 1, "weakCount": 0, "totalCount": 1},
            {"id": "obj_x", "type": "objection", "label": "X"},
        ],
        "links": [{"source": "prem_a", "target": "obj_x", "strength": "strong"}],
    }

    def doc(graph, strong):
        return ("<h4>%s</h4>\n" % TABLE_HEADING +
                '<table class="mp-premise-table">\n' + HEADER_ROW + "\n" +
                "      <tr><td>Alpha</td><td>%d</td><td>0</td><td>%d</td><td>Foundational</td></tr>\n"
                % (strong, strong) + "    </table>\n" +
                "<script>" + MARKER + json.dumps(graph) + ";</script>")

    ok = True
    import io, contextlib
    for label, strong, want in (("agreeing table", 1, 0), ("drifted table", 9, 2)):
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            rc = report(doc(base, strong), False)
        got = "PASS" if rc == want else "FAIL"
        ok &= rc == want
        print("  %-16s expected rc=%d got rc=%d  %s" % (label, want, rc, got))

    # the instrument must also refuse a corpus it cannot classify
    bad = json.loads(json.dumps(base))
    bad["links"][0]["strength"] = "medium"
    try:
        report(doc(bad, 1), False)
        print("  unclassified edge expected exit got return      FAIL")
        ok = False
    except SystemExit as e:
        good = e.code == 1
        ok &= good
        print("  unclassified edge expected exit(1) got exit(%s)  %s" % (e.code, "PASS" if good else "FAIL"))
    print("SELF-TEST", "PASS" if ok else "FAIL")
    return 0 if ok else 1


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    p.add_argument("--combined", help="path to combined.html")
    p.add_argument("--emit-table", action="store_true",
                   help="print only the replacement table, for splicing")
    p.add_argument("--self-test", action="store_true")
    a = p.parse_args()
    print("$ " + " ".join(sys.argv))        # cccxxxi: the figure carries its command line
    if a.self_test:
        sys.exit(self_test())
    if not a.combined:
        die("--combined is required (or --self-test)")
    with open(a.combined, encoding="utf-8", errors="replace") as fh:
        text = fh.read()
    print("INPUT       %s  %d bytes  md5 %s"
          % (a.combined, len(text.encode("utf-8", "replace")),
             hashlib.md5(open(a.combined, "rb").read()).hexdigest()))
    sys.exit(report(text, a.emit_table))


if __name__ == "__main__":
    main()
