#!/usr/bin/env python3
"""library-pin.py - gate-enforced wuld.ink /library-about integrity-pin move.

After a new EFIList library release deploys, this advances the integrity pin
(md5 + version label + bytecount) across wuld.ink src in ONE command. The
deploy-gate is enforced in CODE: the script live-fetches the deployed
combined.html (several times, requiring agreement -- edge caches can serve a
transient), hashes it, and REFUSES to write unless the live bytes exactly equal
the manifest's declared new md5 AND differ from the currently-pinned md5.

Fetches via `curl` ON PURPOSE: Cloudflare serves urllib/requests a DIFFERENT
body than curl (observed K47: urllib got a 504-byte-larger variant with a
different md5; urllib on /combined.html got 403). The canonical md5 and the
operator's curl.exe verify both speak curl -- the gate must read the same bytes.

Usage (from repo root):
    python3 tools/library-pin.py --manifest <release_vX.json>                          # dry-run (default)
    python3 tools/library-pin.py --manifest <release_vX.json> --apply --date <Y-M-D>    # write when GREEN

State: tools/library-pin-state.json holds the CURRENTLY-pinned {md5,version,bytes}.
Read on every run, rewritten on --apply. Seed it once with the live pin.

Manifest contract: docs/library-release-manifest-spec.md (release_vX.json schema).
"""
import argparse, datetime, glob, hashlib, json, os, subprocess, sys

HERE  = os.path.dirname(os.path.abspath(__file__))
ROOT  = os.path.dirname(HERE)
SRC   = os.path.join(ROOT, 'src')
STATE = os.path.join(HERE, 'library-pin-state.json')
DEFAULT_URL = 'https://library.wuld.ink/combined'

def die(msg):
    print("\n  ABORT: " + msg + "\n", file=sys.stderr); sys.exit(1)

def commafmt(n):
    return "{:,}".format(int(n))

def load_json(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)

def fetch_live(url, tries=3):
    """curl the URL `tries` times; require all identical (defends vs edge-cache
    transients). Returns (md5, bytes, samples) on agreement, else (None,None,samples).
    Uses curl, not urllib -- Cloudflare serves them different bytes (see header)."""
    samples = []
    for _ in range(tries):
        r = subprocess.run(['curl', '-sL', '--max-time', '30', url], capture_output=True)
        if r.returncode != 0:
            die("curl failed (rc=%d): %s" % (r.returncode, r.stderr.decode('utf-8', 'replace')[:200]))
        data = r.stdout
        samples.append((hashlib.md5(data).hexdigest().lower(), len(data)))
    if len(set(samples)) != 1:
        return None, None, samples
    return samples[0][0], samples[0][1], samples

def manifest_new_bytes(man):
    for k, v in man.get('surfaces', {}).items():
        if k.startswith('combined') and isinstance(v, dict) and v.get('size_bytes'):
            return int(v['size_bytes'])
    return None

def update_releases(new_version, old_version, pin_date):
    """PREPEND a NEW library entry at index 0 of releases.json (K57).
    Prior entries are permanent changelog history -- never bumped in place.
    (The pre-K57 in-place bump buried the entry under newer releases AND
    silently overwrote the prior release's record: K47 cxc / K55.)"""
    rel = os.path.join(SRC, 'releases.json')
    data = load_json(rel)
    tmpl = next((e for e in data if 'library' in e.get('id', '')), None)
    if not tmpl:
        print("  releases.json: no prior library entry to mirror -- skipped (flag for manual).")
        return
    entry = {
        'id': "{}-library-{}".format(pin_date, new_version.replace('.', '-')),
        'date': pin_date,
        'summary': tmpl['summary'].replace(old_version, new_version),
        'sections': list(tmpl['sections']),
    }
    if any(e.get('id') == entry['id'] for e in data):
        print("  releases.json: entry %s already present -- not duplicated." % entry['id'])
    else:
        data.insert(0, entry)
        with open(rel, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
        print("  releases.json: NEW entry %s prepended; %d prior entries untouched." % (entry['id'], len(data) - 1))
        print("    (summary cloned from %s with the version swapped -- hand-edit before commit if the prose moved on.)" % tmpl['id'])
    gen = os.path.join(ROOT, 'tools', 'changelog', 'gen_feed.py')
    subprocess.run([sys.executable, gen], check=True)
    print("  feed.xml regenerated.")

def main():
    ap = argparse.ArgumentParser(description="Gate-enforced wuld.ink library integrity-pin move.")
    ap.add_argument('--manifest', required=True, help='path to release_vX.json')
    ap.add_argument('--url', default=DEFAULT_URL, help='live combined URL (default: %(default)s)')
    ap.add_argument('--tries', type=int, default=3, help='live fetches that must agree (default: 3)')
    ap.add_argument('--apply', action='store_true', help='write changes (default: dry-run)')
    ap.add_argument('--date', default=None, metavar='YYYY-MM-DD',
                    help='operator-local date stamped into releases.json + pin-state '
                         '(default: runtime today -- in a sandbox that is UTC, often a day ahead; K47 cxc)')
    ap.add_argument('--no-live', action='store_true', help='skip live fetch (read-only scan; cannot --apply)')
    args = ap.parse_args()

    if args.date:
        try:
            datetime.date.fromisoformat(args.date)
        except ValueError:
            die("--date must be YYYY-MM-DD (got %r)" % args.date)
        pin_date = args.date
    else:
        pin_date = datetime.date.today().isoformat()

    man = load_json(args.manifest)
    new_md5     = man['pin']['new'].lower()
    old_md5_man = man['pin']['old'].lower()
    new_version = man['release']
    new_bytes   = manifest_new_bytes(man)

    state = load_json(STATE)
    old_md5 = state['md5'].lower(); old_version = state['version']; old_bytes = int(state['bytes'])

    print("=== library-pin (%s) ===" % ('APPLY' if args.apply else 'dry-run'))
    print("  manifest : %s" % args.manifest)
    if not args.date:
        print("  WARN: no --date -- stamping runtime-local today (%s)." % pin_date)
        print("        Sandbox runs stamp UTC, often a day AHEAD of the operator (K47 cxc);")
        print("        pass an explicit --date YYYY-MM-DD on --apply runs.")
    print("  old pin  : %s  %s  %s B   (state)" % (old_md5, old_version, commafmt(old_bytes)))
    print("  new pin  : %s  %s  %s B   (manifest)" % (new_md5, new_version, commafmt(new_bytes) if new_bytes else '?'))

    if old_md5_man != old_md5:
        die("state/manifest disagree on OLD md5 (state %s vs manifest.pin.old %s). "
            "State file may be stale -- reconcile before pinning." % (old_md5, old_md5_man))

    # --- locus scan (read-only; always safe to show) ---
    files = sorted(glob.glob(os.path.join(SRC, '**', '*.html'), recursive=True))
    repls = [(old_md5, new_md5, 'md5'), (old_version, new_version, 'version')]
    byte_swap = bool(new_bytes and new_bytes != old_bytes)
    if byte_swap:
        repls.append((commafmt(old_bytes), commafmt(new_bytes), 'bytes'))

    total = {tag: 0 for _, _, tag in repls}
    touched = []
    for f in files:
        s = open(f, encoding='utf-8').read()
        cnt = {}
        for old, new, tag in repls:
            c = s.count(old)
            if c:
                cnt[tag] = c; total[tag] += c
        if cnt:
            touched.append((f, cnt))

    print("\n  loci (src/**/*.html):")
    for f, cnt in touched:
        print("    %-46s %s" % (os.path.relpath(f, ROOT),
                                ", ".join("%s x%d" % (t, c) for t, c in cnt.items())))
    print("  totals: " + ", ".join("%s=%d" % (t, total[t]) for t in total))
    if not byte_swap:
        print("  bytecount unchanged (%s) -- byte-identical release; no byte swap." % commafmt(old_bytes))

    # --- THE GATE (live truth, multi-fetch agreement, via curl) ---
    gate = None
    if args.no_live:
        print("\n  (--no-live: gate skipped; read-only scan)")
    else:
        live_md5, live_bytes, samples = fetch_live(args.url, tries=args.tries)
        if live_md5 is None:
            print("\n  live UNSTABLE across %d fetches: %s" % (args.tries, sorted(set(samples))))
            gate = ('UNSTABLE', "live varied across fetches (edge cache mid-propagation) -- re-run shortly")
        else:
            print("\n  live     : %s  %s B   (%s; %dx agree)" % (live_md5, commafmt(live_bytes), args.url, args.tries))
            if live_md5 == old_md5:
                gate = ('CLOSED', "live still serving the OLD pin -- deploy has not landed")
            elif live_md5 != new_md5:
                gate = ('MISMATCH', "live md5 != manifest new (%s) -- live is serving something else" % new_md5)
            else:
                gate = ('GREEN', "live == manifest new pin")
                if new_bytes and live_bytes != new_bytes:
                    print("  WARN: live bytes %d != manifest %d; using LIVE bytes." % (live_bytes, new_bytes))
                    new_bytes = live_bytes
        print("  GATE: %s -- %s" % gate)

    # --- act ---
    if not args.apply:
        print("\n  DRY-RUN -- nothing written. Re-run with --apply when GATE is GREEN.")
        return
    if args.no_live:
        die("--no-live cannot be combined with --apply (the gate must see live bytes).")
    if gate[0] != 'GREEN':
        die("GATE %s: %s. Refusing to pin." % gate)

    for f, cnt in touched:
        b = open(f, 'rb').read()
        s = b.decode('utf-8')
        for old, new, tag in repls:
            s = s.replace(old, new)
        nb = s.encode('utf-8')
        with open(f, 'wb') as out:
            out.write(nb)
        chk = open(f, 'rb').read()
        if chk != nb:
            die("writeback mismatch on %s" % f)

    resid = 0
    for f in files:
        s = open(f, encoding='utf-8').read()
        if old_md5 in s or old_version in s:
            resid += 1; print("    RESIDUAL: %s" % os.path.relpath(f, ROOT))
    if resid:
        die("%d files still contain old md5/version after apply." % resid)
    print("\n  0 residual old md5/version across %d src HTML files." % len(files))

    update_releases(new_version, old_version, pin_date)

    state.update({'md5': new_md5, 'version': new_version, 'bytes': new_bytes or old_bytes,
                  'updated': pin_date})
    with open(STATE, 'w', encoding='utf-8') as f:
        json.dump(state, f, indent=2); f.write("\n")
    print("  state updated -> %s  %s  %s B" % (new_md5, new_version, commafmt(new_bytes or old_bytes)))
    print("\n  APPLIED. Review the diff, then commit + push.")

if __name__ == '__main__':
    main()
