r"""emit_kit.py -- publish-sitting kit emitter (K103; the post-RED surviving automation).

Printful Quick Stores have NO product-creation API (K102 lane research, verdict RED,
adversarially re-verified 2026-06-09) -- publishing stays supervised evening Chrome
sittings, and this tool automates the PREP, never the publish. Deterministic,
idempotent, ZERO-network.

Reads (never writes):
  worksheet   D:\print-ladder\publish-input.json   THE worksheet (ladder/operator-owned)
  ledger      D:\print-ladder\ladder-ledger.tsv    optional; id<TAB>status; non-OK excluded
  outcomes    D:\k10*-outcomes.md                  shipped-id dedupe (contract below)

Writes:
  kits        D:\sitting-kits\sitting-NN.md + .tsv next-N paste-ready kit + checklist twin

Worksheet schema (schema 1):
  { "schema": 1, "generated": "YYYY-MM-DD", "generated_by": "...",
    "rows": [ { "id": "<manifest plate id>",
                "status": "ELIGIBLE|REVIEW|HOLD|LIVE_PENDING_VERIFY",
                "tier": "T1|T2", "jpg": "D:\...", "name": "Plate XIV -- ...",
                "description": "<paste block>", "size_line": "16x24 + 24x36 -- ...",
                "aspect": "~1.8:1", "donor": "<optional>", "markup": 2.5 } ] }

Selection contract: status==ELIGIBLE only (REVIEW waits for the operator to flip the
worksheet; holds never; LIVE_PENDING_VERIFY excluded) -> minus ledger non-OK ids ->
minus shipped ids -> stable worksheet order -> first N (default 10).

Shipped contract: a plate counts as shipped iff its FULL id appears in any outcomes
file ON A LINE that also carries "http" or "commit" (product-URL / admin-drop lines).
Planning prose (tranche lists, Paths lines) carries neither token and never matches.
Outcomes growth IS the cursor: no state file; re-run after a sitting -> next kit.

Idempotence: if an existing kit's id-set == the current selection, NOTHING is written
(operator edits to the live kit survive); else the kit lands as max+1. Same inputs ->
same bytes. The kit date comes from the worksheet's "generated" (or --date) -- the
emitter itself never reads the clock.

Usage (operator, PowerShell, repo root):
  python tools\print-pipeline\emit_kit.py                # emit next kit of 10
  python tools\print-pipeline\emit_kit.py --dry-run      # census only, writes nothing
  python tools\print-pipeline\emit_kit.py --n 6
Sandbox: pass --worksheet/--ledger/--outcomes-glob/--kits-dir with mount paths.
"""

import argparse
import glob as globmod
import hashlib
import json
import os
import re
import sys

HARD_RULES = """## Hard rules (the round-2 traps, promoted -- each cost real time)

1. **Duplicates inherit SESSION size-state, never the donor's variants.** Verify + re-set the size checkboxes on EVERY product; re-verify after any variant churn (a silently-surviving variant shipped a near-miss in round 2).
2. **Only the UNLABELED file input actually ingests.** The labeled one is decorative.
3. **Wizard-seeded retails are a 4x-cost table artifact.** Set retails DIRECTLY = cost x markup. NEVER the % control -- it COMPOUNDS the current retail, not cost.
4. form_input by ref = the instrument (drift-immune); viewport drift killed typed input twice in round 2.
5. GPSR: UNCHECKED on every publish (privacy posture lock -- the field renders a public address).
6. Details page REVERTS on variant churn -- re-enter title + copy AFTER sizes are final, just before submit.
7. **A form reset is NOT commit proof** (the round-2 lie). Verify every admin drop on the WIRE: cache-busted live manifest fetch (https://wuld.ink/gallery/manifest.json?_=<ts>) -> print_url count increments AND the plate id carries the URL.
8. Write each product URL into the outcomes file THE MOMENT it exists -- a dead session must never lose a published URL. Close at a PRODUCT boundary; do NOT start a product you cannot finish.
9. **FIT placements: background WHITE by default** (round-2 XI precedent -- white bands shipped clean). Set it in the Design Lab before placement verify; confirm per image only if the palette argues otherwise.
"""

REQUIRED_KIT_FIELDS = ("jpg", "name", "size_line")


def md5_8(data):
    return hashlib.md5(data).hexdigest()[:8]


def load_worksheet(path):
    raw = open(path, "rb").read()
    ws = json.loads(raw.decode("utf-8"))
    if ws.get("schema") != 1:
        raise SystemExit("FAIL: worksheet schema != 1 (got %r)" % ws.get("schema"))
    rows = ws.get("rows")
    if not isinstance(rows, list) or not rows:
        raise SystemExit("FAIL: worksheet rows missing/empty")
    seen = set()
    for r in rows:
        if not r.get("id") or "status" not in r:
            raise SystemExit("FAIL: worksheet row missing id/status: %r" % (r,))
        if r["id"] in seen:
            raise SystemExit("FAIL: duplicate worksheet id %s" % r["id"])
        seen.add(r["id"])
    return ws, raw


def load_ledger(path):
    if not path or not os.path.exists(path):
        return {}, False
    bad = {}
    with open(path, encoding="utf-8", errors="replace") as f:
        for ln in f:
            parts = ln.rstrip("\n").split("\t")
            if len(parts) >= 2 and parts[0] and parts[0].lower() != "id":
                status = parts[1].strip().upper()
                if status and status != "OK":
                    bad[parts[0]] = status
    return bad, True


def shipped_ids(glob_pat, ids):
    hits = {}
    files = sorted(globmod.glob(glob_pat))
    for fp in files:
        try:
            text = open(fp, encoding="utf-8", errors="replace").read()
        except OSError:
            continue
        for ln in text.splitlines():
            low = ln.lower()
            if "http" in low or "commit" in low:
                for pid in ids:
                    if pid in ln and pid not in hits:
                        hits[pid] = os.path.basename(fp)
    return hits, [os.path.basename(f) for f in files]


def select(rows, ledger_bad, shipped, n):
    census = {"total": len(rows), "by_status": {}, "ledger_excluded": [],
              "shipped_excluded": [], "selected": [], "eligible_after": 0}
    eligible = []
    for r in rows:
        st = str(r["status"]).upper()
        census["by_status"][st] = census["by_status"].get(st, 0) + 1
        if st != "ELIGIBLE":
            continue
        if r["id"] in ledger_bad:
            census["ledger_excluded"].append("%s (%s)" % (r["id"], ledger_bad[r["id"]]))
            continue
        if r["id"] in shipped:
            census["shipped_excluded"].append("%s (%s)" % (r["id"], shipped[r["id"]]))
            continue
        eligible.append(r)
    census["eligible_after"] = len(eligible)
    sel = eligible[:n]
    for r in sel:
        missing = [k for k in REQUIRED_KIT_FIELDS if not r.get(k)]
        if missing:
            raise SystemExit("FAIL: selected row %s missing %s" % (r["id"], missing))
    census["selected"] = [r["id"] for r in sel]
    return sel, census


def existing_kits(kits_dir):
    out = []
    if not os.path.isdir(kits_dir):
        return out
    for fn in sorted(os.listdir(kits_dir)):
        m = re.match(r"sitting-(\d+)\.tsv$", fn)
        if not m:
            continue
        ids = []
        with open(os.path.join(kits_dir, fn), encoding="utf-8", errors="replace") as f:
            for ln in f:
                cell = ln.split("\t", 1)[0].strip()
                if cell and cell != "id":
                    ids.append(cell)
        out.append((int(m.group(1)), frozenset(ids)))
    return out


def render_tsv(sel):
    lines = ["id\tjpg\tname\tdonor\tsizes\tmarkup\tproduct_url\tadmin_drop_verified"]
    for r in sel:
        lines.append("\t".join([r["id"], r.get("jpg", ""), r.get("name", ""),
                                r.get("donor", ""), r.get("size_line", ""),
                                str(r.get("markup", 2.5)), "", ""]))
    return "\n".join(lines) + "\n"


def render_md(nn, date, sel, ws_path, ws_md5, outcome_files, ledger_present):
    L = []
    L.append("# Sitting kit %02d -- %s -- %d plates" % (nn, date, len(sel)))
    L.append("")
    L.append("Provenance: worksheet %s md5 %s | outcomes consumed: %s | ledger: %s" % (
        ws_path, ws_md5, ", ".join(outcome_files) if outcome_files else "(none)",
        "present" if ledger_present else "ABSENT (belt skipped)"))
    L.append("Regenerate after the sitting: outcomes growth advances the cursor; this file is a disposable snapshot.")
    L.append("")
    L.append(HARD_RULES)
    L.append("## Plates")
    for i, r in enumerate(sel, 1):
        L.append("")
        L.append("### %d/%d -- %s" % (i, len(sel), r.get("name", r["id"])))
        L.append("")
        L.append("- id: `%s` (tier %s)" % (r["id"], r.get("tier", "?")))
        L.append("- upload: %s" % r.get("jpg", "?"))
        L.append("- donor (duplicate FROM): %s" % r.get("donor", "by aspect -- measure the jpg first"))
        L.append("- sizes: %s" % r.get("size_line", "?"))
        L.append("- retails: cost x %s, set per-field (rule 3)" % r.get("markup", 2.5))
        if r.get("note"):
            L.append("- note: %s" % r["note"])
        L.append("- description (paste, after sizes are final -- rule 6):")
        L.append("")
        L.append(r.get("description", "(no description in worksheet -- pull from the copy docs)"))
        L.append("")
        L.append("---")
    L.append("")
    L.append("## Close checklist")
    L.append("")
    L.append("- [ ] every product URL written to the outcomes file the moment it existed (rule 8)")
    L.append("- [ ] admin drops: admin.wuld.ink -> Plates -> row edit -> print_url -> commit update")
    L.append("- [ ] every drop WIRE-verified (rule 7)")
    L.append("- [ ] GPSR unchecked everywhere (rule 5); Stripe bank onboarding status noted at close")
    L.append("")
    return "\n".join(L)


def main(argv=None):
    ap = argparse.ArgumentParser(description="publish-sitting kit emitter (K103)")
    ap.add_argument("--worksheet", default=r"D:\print-ladder\publish-input.json")
    ap.add_argument("--ledger", default=r"D:\print-ladder\ladder-ledger.tsv")
    ap.add_argument("--outcomes-glob", default=r"D:\k10*-outcomes.md")
    ap.add_argument("--kits-dir", default=r"D:\sitting-kits")
    ap.add_argument("--n", type=int, default=10)
    ap.add_argument("--date", default=None, help="kit date; default = worksheet 'generated'")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)
    if args.n < 1:
        raise SystemExit("FAIL: --n must be >= 1")

    ws, raw = load_worksheet(args.worksheet)
    ledger_bad, ledger_present = load_ledger(args.ledger)
    all_ids = [r["id"] for r in ws["rows"]]
    shipped, outcome_files = shipped_ids(args.outcomes_glob, all_ids)
    sel, census = select(ws["rows"], ledger_bad, shipped, args.n)

    print("worksheet: %s md5 %s (generated %s)" % (args.worksheet, md5_8(raw), ws.get("generated")))
    print("rows %d | by status: %s" % (census["total"], json.dumps(census["by_status"], sort_keys=True)))
    print("ledger: %s | excluded: %s" % ("present" if ledger_present else "ABSENT",
                                         census["ledger_excluded"] or "none"))
    print("outcomes files: %s | shipped-excluded: %s" % (outcome_files or "none",
                                                         census["shipped_excluded"] or "none"))
    print("eligible after belts: %d | selecting first %d -> %d" % (
        census["eligible_after"], args.n, len(sel)))
    for pid in census["selected"]:
        print("  + %s" % pid)
    if not sel:
        print("NOTHING TO EMIT (no eligible plates remain)")
        return 0
    if args.dry_run:
        print("DRY RUN -- nothing written")
        return 0

    date = args.date or ws.get("generated") or "undated"
    kits = existing_kits(args.kits_dir)
    sel_set = frozenset(census["selected"])
    for nn, ids in kits:
        if ids == sel_set:
            print("kit %02d already current (same id-set) -- files left untouched" % nn)
            return 0
    nn = (max(n for n, _ in kits) + 1) if kits else 1
    os.makedirs(args.kits_dir, exist_ok=True)
    ws_md5 = md5_8(raw)
    md = render_md(nn, date, sel, args.worksheet, ws_md5, outcome_files, ledger_present)
    tsv = render_tsv(sel)
    md_path = os.path.join(args.kits_dir, "sitting-%02d.md" % nn)
    tsv_path = os.path.join(args.kits_dir, "sitting-%02d.tsv" % nn)
    open(md_path, "w", encoding="utf-8", newline="\n").write(md)
    open(tsv_path, "w", encoding="utf-8", newline="\n").write(tsv)
    print("WROTE %s (%d B) + %s (%d B)" % (md_path, len(md.encode("utf-8")),
                                           tsv_path, len(tsv.encode("utf-8"))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
