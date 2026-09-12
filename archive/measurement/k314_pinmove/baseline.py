"""baseline.py -- contrast + type census of the UNMODIFIED pinned flagship. The control: the prompt's
numbers (median 13.90, p 2.66, div.footer 3.45, span.category-label x83 at 4.42) must reproduce here
before any measurement of the integrated page is believed."""
import sys, json, statistics
from hz import *

def run(path='/combined.html', label='', modes=('standard','legible','high-contrast','both')):
    serve()
    with sync_playwright() as pw:
        br = browser(pw)
        for mode in modes:
            ctx = context(br, mode=mode)
            page = open_page(ctx, path)
            n = page.evaluate("document.querySelectorAll('#results .objection-header[id^=obj-]').length")
            prose = census(page, 25); allt = census(page, 3)
            s1 = summarize(prose, 'prose>=25'); s2 = summarize(allt, 'all>=3')
            print(f"\n== {label} mode={mode:14s} cards={n} bgluma={bg_luma(page):.1f} body.class='{page.evaluate('document.body.className')}' errors={page.errors}")
            for s in (s1, s2):
                print(f"   {s['label']:10s} n={s['n']:4d} median={s['median']:6.2f} min={s['min']:5.2f} below-AA={s['fails']} ({s['fail_pct']}%)")
                for (sel, fg, bg), cnt, mn in s['groups'][:8]:
                    print(f"      x{cnt:3d}  {mn:5.2f}  {sel[:48]:48s} {fg} on {bg}")
            # sizes
            sizes = {}
            for r in allt: sizes[r['size']] = sizes.get(r['size'], 0) + 1
            print('   sizes:', ' '.join(f"{k:g}px×{v}" for k, v in sorted(sizes.items())))
            ctx.close()
        br.close()

if __name__ == '__main__':
    run(label=sys.argv[1] if len(sys.argv) > 1 else 'pristine')
