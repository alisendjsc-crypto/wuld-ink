from hz import *
serve()
with sync_playwright() as pw:
    br = browser(pw)
    for mode in ('standard','high-contrast'):
        ctx = context(br, mode=mode); page = open_page(ctx)
        rows = [r for r in census(page, 3) if r['ratio'] < 4.5]
        seen = {}
        for r in rows:
            k = (r['sel'], r['fg'], r['bg'])
            if k in seen: seen[k]['n'] += 1; continue
            seen[k] = dict(r, n=1)
        print(f"\n== {mode}")
        for k, r in sorted(seen.items(), key=lambda kv: -kv[1]['n']):
            print(f"  x{r['n']:3d} {r['ratio']:5.2f} {r['size']:4g}px/{r['weight']:3s} {r['sel'][:36]:36s} id={r['id'][:22]:22s} {r['fg']:18s} on {r['bg']:16s} '{r['sample'][:44]}'")
        ctx.close()
    br.close()
