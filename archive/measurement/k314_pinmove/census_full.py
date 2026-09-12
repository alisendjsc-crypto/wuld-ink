"""census_full.py -- the flagship in every state this harness can drive, per mode.
States: library closed; library with one card per tier open; examples (rwe); coda; mechanism web;
dependency graph; argument flow. All visible text >=3 chars, incl. SVG labels by fill."""
import sys, json
from hz import *
serve()
def state_rows(page):
    return census(page, 3)
def report(rows, label):
    s = summarize(rows, label)
    print(f"   {label:28s} n={s['n']:4d} median={s.get('median',0):6.2f} below-AA={s.get('fails',0)} ({s.get('fail_pct',0)}%)")
    for (sel, fg, bg), cnt, mn in s.get('groups', [])[:14]:
        print(f"      x{cnt:3d}  {mn:5.2f}  {sel[:44]:44s} {fg} on {bg}")
    return s
out = {}
with sync_playwright() as pw:
    br = browser(pw)
    modes = sys.argv[1:] or ['standard','legible','high-contrast','both']
    for mode in modes:
        ctx = context(br, mode=mode); page = open_page(ctx)
        print(f"\n===== mode={mode}  errors={page.errors}")
        allrows = []
        r = state_rows(page); report(r, 'library/closed'); allrows += r
        # open one card per tier
        page.evaluate("""() => { const seen={}; for (const h of document.querySelectorAll('#results .objection-header[id^=obj-]')) { const t=(h.querySelector('.tier-badge')||{}).textContent||''; if(seen[t]) continue; seen[t]=1; h.click(); } }""")
        page.wait_for_timeout(300)
        r = state_rows(page); report(r, 'library/5 cards open'); allrows += r
        # deeper library states: RSI methodology panel, an RSI detail, the layman toggle if any
        page.evaluate("(() => { const b=document.querySelector('.rsi-methodology-btn'); if (b) b.click(); })()"); page.wait_for_timeout(300)
        page.evaluate("(() => { const b=document.querySelector('#results .rsi-badge'); if (b) b.click(); })()"); page.wait_for_timeout(300)
        r = state_rows(page); report(r, 'library/rsi panel+detail'); allrows += r
        for view, sel in (('map','#vbtn-map'),('dep','#vbtn-dep'),('map1','#vbtn-map1')):
            page.click(sel); page.wait_for_timeout(1500)
            r = state_rows(page); report(r, 'view/'+view); allrows += r
            # the view's methodology panel + an info panel (click the first node / first source)
            page.evaluate("v => { const b=document.querySelector('#'+v+'-view .'+v+'-methodology-btn, #'+v+'-view .m1-methodology-btn'); if (b) b.click(); }", view); page.wait_for_timeout(300)
            page.evaluate("v => { const n=document.querySelector('#'+v+'-view svg g.map-node-mech, #'+v+'-view svg g.node, #'+v+'-view svg circle, #'+v+'-view .m1-source-item'); if (n) n.dispatchEvent(new MouseEvent('click', {bubbles:true})); }", view); page.wait_for_timeout(600)
            r = state_rows(page); report(r, 'view/'+view+' +panels'); allrows += r
        page.click('#vbtn-library'); page.wait_for_timeout(300)
        for view in ('rwe','coda'):
            page.click(f'.top-nav-view-btn[data-view="{view}"]'); page.wait_for_timeout(800)
            r = state_rows(page); report(r, 'section/'+view); allrows += r
        page.click('.top-nav-view-btn[data-view="library"]'); page.wait_for_timeout(200)
        print(f"   errors after driving: {page.errors}")
        out[mode] = allrows
        ctx.close()
    br.close()
json.dump(out, open('/home/claude/pin/census_full_' + ('-'.join(modes)) + '.json','w'))
