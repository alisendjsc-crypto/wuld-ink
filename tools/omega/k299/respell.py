#!/usr/bin/env python3
"""K299 - re-spell every declared form to its value under the amended normalizer.

The corpora assert an invariant (omega-persona-gate + mrgrey-register-gate, ~57 checks):
every pattern form is stored PRE-NORMALIZED, i.e. normalize(form) == form. That invariant
exists because patternMatch compared forms RAW - an un-normalized form could never fire.

The K299 normalizer changes what "normalized" means, so the corpus must be re-spelled to stay
canonical. This is not a workaround for the gate; it is the gate doing its job. Re-spelling
also RETIRES TWINS: `im lost` and `i am lost` collapse to one form, which is the outcome
TX15-BACK §0 was arguing for.

Dedup keeps the HIGHEST weight of a collapsing pair and preserves first-seen order.
"""
import json, sys, pathlib, subprocess

FMT = {"omega-corpus-mrgrey.json": {"indent": 2, "nl": "\n"},
       "yurei-corpus-public.json": {"indent": 1, "nl": ""},
       "yurei-corpus-oracle.json": {"indent": 1, "nl": ""}}

def norm_via_js(root, forms):
    """Normalize through the REAL engine - never a python re-implementation of it."""
    script = ("const O=require(process.argv[1]);"
              "const f=JSON.parse(require('fs').readFileSync(process.argv[2],'utf8'));"
              "console.log(JSON.stringify(f.map(function(x){return O.normalize(x);})));")
    tmp = pathlib.Path("/tmp/k299_forms.json"); tmp.write_text(json.dumps(forms), encoding="utf-8")
    out = subprocess.run(["node", "-e", script,
                          str(pathlib.Path(root, "src/components/yurei-oracle.js").resolve()), str(tmp)],
                         capture_output=True, text=True, check=True)
    return json.loads(out.stdout)

def main(root):
    root = pathlib.Path(root)
    grand = {"respelled": 0, "collapsed": 0}
    for name, fmt in FMT.items():
        p = root / "src/components" / name
        if not p.exists(): continue
        d = json.loads(p.read_text(encoding="utf-8"))
        entries = d["yurei_corpus"]["entries"]
        allf = [pat["form"] for e in entries for pat in e.get("patterns", [])]
        normed = norm_via_js(root, allf)
        m = dict(zip(allf, normed))
        r = c = 0
        for e in entries:
            if "patterns" not in e:
                continue          # the deflection/repeat/ambient pool has none - do not add an empty key
            seen, out = {}, []
            for pat in e["patterns"]:
                nf = m[pat["form"]]
                if nf != pat["form"]: r += 1
                pat["form"] = nf
                key = (nf, pat["mode"])
                if key in seen:
                    c += 1
                    prev = seen[key]
                    if (pat.get("weight") or 0) > (prev.get("weight") or 0):
                        prev["weight"] = pat.get("weight")
                    continue
                seen[key] = pat; out.append(pat)
            e["patterns"] = out
        p.write_text(json.dumps(d, ensure_ascii=False, indent=fmt["indent"]) + fmt["nl"],
                     encoding="utf-8", newline="")
        print("  %-28s re-spelled %3d  collapsed %d" % (name, r, c))
        grand["respelled"] += r; grand["collapsed"] += c
    print("  TOTAL re-spelled %d, twins retired %d" % (grand["respelled"], grand["collapsed"]))
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "."))
