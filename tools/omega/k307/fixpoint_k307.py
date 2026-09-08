#!/usr/bin/env python3
"""K307 -- TX21-BACK section 5: run the inflection generator to FIXPOINT.

Method: the committed K305 generator is used VERBATIM as a subprocess (no refactor,
no re-implementation -- the thing measured is the artifact that ships). Each pass:
  run sweep_wide.cjs -> read its new_miss -> fold every one into a SCRATCH corpus -> repeat
until a pass yields zero new misses. Reports the iteration count and the per-pass delta.

Nothing here touches the shipped corpus. The fold is simulated so the CONVERGENCE
question can be answered without adding forms -- additions are the library seat's
call (TX21 section 1: Cowork may pull without waiting, and may not add).
"""
import json, subprocess, sys, os, shutil

SCRATCH = "/tmp/fx"
CORPUS  = os.path.join(SCRATCH, "src/components/omega-corpus-mrgrey.json")
GEN     = "tools/omega/k305/sweep_wide.cjs"
CAP     = 12
# OUT lands in the OS temp dir, never in the repo: an untracked stray in tools/omega/
# dirties every later session's verify-at-open (K288).
import tempfile
OUT     = os.path.join(tempfile.gettempdir(), "k307_sweep_out.json")
SHIM    = os.path.abspath("tools/omega/k307/redirect_out.cjs")

def load():
    return json.load(open(CORPUS, encoding="utf-8"))

def run_pass():
    env = dict(os.environ, SWEEP_OUT=OUT)
    r = subprocess.run(["node", "--require", SHIM, GEN], cwd=SCRATCH, capture_output=True, text=True, env=env)
    if r.returncode != 0:
        print(r.stdout[-2000:]); print(r.stderr[-2000:]); sys.exit("generator failed")
    return json.load(open(OUT, encoding="utf-8"))

rows = []
ALL = []
d = load()
E = d["yurei_corpus"]["entries"]
start_forms = sum(len(e.get("patterns", [])) for e in E)
print("start: %d entries / %d forms\n" % (len(E), start_forms))

for it in range(1, CAP + 1):
    out = run_pass()
    nm = out["new_miss"]
    mv = sum(1 for r in nm if r.get("multiverb"))
    rows.append((it, len(nm), mv, len(out["hits"]), len(out["already"]), len(out["excluded"])))
    for r in nm: ALL.append(dict(r, pass_no=it))
    print("pass %-2d  new_miss=%-4d  (multi-verb %-4d)  route-home=%-4d  already=%-4d  excluded=%d"
          % (it, len(nm), mv, len(out["hits"]), len(out["already"]), len(out["excluded"])))
    if not nm:
        print("\nCONVERGED after %d pass(es) -- pass %d produced zero new misses." % (it, it))
        break
    # simulate the fold: every new miss becomes a declared form on its own entry
    d = load(); E = d["yurei_corpus"]["entries"]; byid = {e["id"]: e for e in E}
    added = 0
    for r in nm:
        e = byid[r["id"]]
        if not any(p["form"] == r["variant"] for p in e["patterns"]):
            e["patterns"].append({"form": r["variant"], "mode": "contains", "weight": 2}); added += 1
    json.dump(d, open(CORPUS, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    open(CORPUS, "a", encoding="utf-8").write("\n")
    print("         folded %d into the scratch corpus -> %d forms"
          % (added, sum(len(e.get("patterns", [])) for e in E)))
else:
    print("\nDID NOT CONVERGE within %d passes -- treadmill confirmed." % CAP)

print("\n| pass | new misses | multi-verb |")
print("|---|---|---|")
for it, n, mv, *_ in rows: print("| %d | %d | %d |" % (it, n, mv))
seen=set(); uniq=[]
for r in ALL:
    k=(r["id"], r["variant"])
    if k in seen: continue
    seen.add(k); uniq.append(r)
json.dump({"passes": rows, "cap": CAP, "converged_at": rows[-1][0] if rows and rows[-1][1]==0 else None,
           "distinct_forms": len(uniq), "rows": uniq}, open("tools/omega/k307/fixpoint_k307.json","w"), indent=1)
import csv
with open("tools/omega/k307/review_batch_k307.csv","w",newline="") as f:
    w=csv.writer(f); w.writerow(["pass","entry","objection","source_form","variant","shift","lands_now","multiverb","VERDICT","note"])
    for r in uniq: w.writerow([r["pass_no"],r["id"],r.get("obj",""),r["form"],r["variant"],r["shift"],r["lands"],"Y" if r.get("multiverb") else "","",""])
print("\ndistinct new forms across all passes: %d" % len(uniq))
