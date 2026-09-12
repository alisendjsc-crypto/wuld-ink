"""navcheck.py -- 3.1a: the stage shim fires and the flagship's navigation still switches ONE thing at a
time. Rendered-ness is read by getClientRects().length, never computed display (an inner view keeps
display:block while its ancestor is hidden). Also: CLS on load, stage adopted-not-built, chin/frame
outside the stage, page errors.

CONTROL: run with --no-shim to disable the mirror (window.wzStageShim replaced by a no-op before boot)
and confirm the SAME checks go RED -- a harness that only sees green has not been shown to see."""
import sys, json
from hz import *

NO_SHIM = '--no-shim' in sys.argv
PATH = next((a for a in sys.argv[1:] if a.startswith('/')), '/combined.html')
SECTIONS = ['combined-library', 'combined-rwe', 'combined-coda']
VIEWS = [('library', '#vbtn-library', '#library-view'), ('map', '#vbtn-map', '#map-view'),
         ('dep', '#vbtn-dep', '#dep-view'), ('map1', '#vbtn-map1', '#map1-view')]

def rendered(page, ids):
    return page.evaluate("ids => ids.map(i => { const e=document.getElementById(i); return e ? e.getClientRects().length : -1; })", ids)

serve()
with sync_playwright() as pw:
    br = browser(pw)
    ctx = context(br, tier=2)
    # CLS observer before load
    ctx.add_init_script("""window.__cls=0; window.__shifts=[]; try{ new PerformanceObserver(l=>{ for(const e of l.getEntries()) if(!e.hadRecentInput){ window.__cls+=e.value; window.__shifts.push([Math.round(e.startTime), +e.value.toFixed(3), (e.sources||[]).map(s=>s.node&&(s.node.tagName+'#'+(s.node.id||'')+'.'+(s.node.className||'')).slice(0,40)).slice(0,3)]); } }).observe({type:'layout-shift', buffered:true}); }catch(e){}""")
    console = []
    page = open_page(ctx, PATH, console=console)
    page.wait_for_timeout(800)
    if NO_SHIM:
        # THE CONTROL, timing-independent: pull the injected shim out of the CSSOM after boot and
        # re-measure. Two earlier versions of this control were inert (a shadowed window property
        # wzInit never reads; an observer attached before documentElement existed) -- cccxxiv.
        page.evaluate("(() => { const s=document.getElementById('wz-stage-shim'); window.__shimRemoved = s ? (s.remove(), 1) : 0; })()")
    shim = page.evaluate("(() => { const s=document.getElementById('wz-stage-shim'); return s ? s.textContent.split('\\n')[1].trim() : ('ABSENT (removed '+(window.__shimRemoved||0)+'x)'); })()")
    stage = page.evaluate("""() => { const s=document.querySelector('.wz-stage'); return { present: !!s, bodyIndex: s ? [...document.body.children].indexOf(s) : -1,
        bodyChildren: [...document.body.children].map(e => e.tagName.toLowerCase()+(e.className? '.'+String(e.className).split(' ')[0]:'')).join(' '),
        frameOutside: !!document.querySelector('body > .wz-frame'), chinOutside: !!document.querySelector('body > .wz-chin'),
        tier: document.documentElement.className, cls: window.__cls } }""")
    print('shim      :', shim)
    print('stage     :', json.dumps(stage))
    ok = True
    # sections: exactly one rendered, in each state
    for sec in ['library', 'rwe', 'coda', 'library']:
        page.click(f'.top-nav-view-btn[data-view="{sec}"]'); page.wait_for_timeout(500)
        r = rendered(page, SECTIONS)
        want = ['combined-' + sec]
        good = sum(1 for i, x in zip(SECTIONS, r) if x > 0) == 1 and r[SECTIONS.index('combined-' + sec)] > 0
        ok &= good
        print(f"section={sec:8s} rects={dict(zip(SECTIONS, r))}  {'OK' if good else 'FAIL'}")
    # views inside the library: exactly one rendered
    for name, btn, vid in VIEWS:
        page.click(btn); page.wait_for_timeout(900)
        ids = [v[2][1:] for v in VIEWS]
        r = rendered(page, ids)
        good = sum(1 for x in r if x > 0) == 1 and r[ids.index(vid[1:])] > 0
        ok &= good
        print(f"view={name:8s} rects={dict(zip(ids, r))}  {'OK' if good else 'FAIL'}")
    page.click('#vbtn-library'); page.wait_for_timeout(300)
    ov = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    page.mouse.move(720, 450); page.wait_for_timeout(450)
    ov = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    print('overflow  :', ov, 'px at pointer rest (the pan at the left edge adds --wz-pan on every surface, wing and flagship alike)', '(OK)' if ov == 0 else '(FAIL)')
    print('errors    :', page.errors)
    print('console   :', [c for c in console if c[0] in ('error', 'warning')][:6])
    print('CLS       :', stage['cls'], page.evaluate('window.__shifts')[:8])
    wide = page.evaluate("""() => { const W=document.documentElement.clientWidth; const out=[]; for (const e of document.querySelectorAll('body *')) { const r=e.getBoundingClientRect(); if (r.right > W+0.5 && r.width>0) out.push(e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:'')+' right='+Math.round(r.right)); } return out.slice(0,12); }""")
    print('past edge :', wide)
    print('\nVERDICT:', 'GREEN' if (ok and stage['present'] and stage['bodyIndex'] == 0 and stage['frameOutside'] and stage['chinOutside'] and ov == 0) else 'RED')
    ctx.close(); br.close()
