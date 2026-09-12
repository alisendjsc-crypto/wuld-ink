"""layerfix.py -- the three layer fixes of 2026-09-12, each with a control that can fail.

  1. `?` reachable by MOUSE on every surface: document.elementFromPoint at the button's centre must be the
     button, and a real page.mouse.click there must open the tour. (The K313 harness clicked it
     synthetically, which bypasses hit-testing, so it passed a button no pointer could press.)
  2. one once-ever flag per SURFACE for the library tour: wing -> flagship -> index in ONE context, each
     tour must start; and the reverse order.
  3. softer cues: GainNode values at the moment each cue starts (hover .064, expand .19, click .21),
     the hover rate limit (250 ms), and --wz-sfx-gain scaling.

CONTROL: --old routes /wuld-layer.css and /wuld-layer.js to the K314 packs (the bytes live before this
deploy). Checks 1 and 2 must go RED on them and check 3 must read the old gains; a fix whose test cannot
fail on the unfixed bytes has not been tested (cccxxiv)."""
import sys, json, pathlib
from hz import *

OLD = '--old' in sys.argv
OLD_CSS = pathlib.Path('/tmp/probe/efilist-argument-library_main_wuld-layer.css')
OLD_JS  = pathlib.Path('/tmp/probe/efilist-argument-library_main_wuld-layer.js')
SURFACES = [('/combined.html', 'flagship', True), ('/veganism/combined.html', 'wing', True), ('/libraries/index.html', 'index', False)]
fails = 0
def verdict(ok, msg):
    global fails
    print(('   PASS ' if ok else '   FAIL ') + msg); fails += (0 if ok else 1)

def route_old(ctx):
    if not OLD: return
    def h(route, request):
        u = request.url
        if u.endswith('/wuld-layer.css'): route.fulfill(path=str(OLD_CSS), content_type='text/css')
        elif u.endswith('/wuld-layer.js'): route.fulfill(path=str(OLD_JS), content_type='application/javascript')
        else: route.continue_()
    ctx.route('**/wuld-layer.*', h)

def mk(br, suppress=True):
    ctx = context(br, tier=2, suppress_tour=suppress)
    route_old(ctx)
    return ctx

def touring(page, timeout=6000):
    try:
        page.wait_for_function("document.documentElement.classList.contains('wz-touring')", timeout=timeout); return True
    except Exception:
        return False

def skip(page):
    page.click('.wz-tour-skip'); page.wait_for_timeout(300)

serve()
print('layer bytes under test:', 'K314 packs (CONTROL)' if OLD else 'this build')
with sync_playwright() as pw:
    br = browser(pw)

    print('== 1. the ? button by mouse')
    for path, name, cards in SURFACES:
        ctx = mk(br); page = open_page(ctx, path, wait_cards=cards); page.wait_for_timeout(500)
        box = page.evaluate("(() => { const b=document.querySelector('.wz-help'); if(!b) return null; const r=b.getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2, r.width, r.height]; })()")
        if not box: verdict(False, f'{name}: no .wz-help button'); ctx.close(); continue
        cx, cy = box[0], box[1]
        hit = page.evaluate("([x,y]) => { const e=document.elementFromPoint(x,y); return e ? (e.tagName.toLowerCase()+'.'+e.className) : 'null'; }", [cx, cy])
        verdict(hit.startswith('button.wz-help'), f'{name}: elementFromPoint({cx:.0f},{cy:.0f}) = {hit}  [{box[2]:.0f}x{box[3]:.0f}]')
        page.mouse.click(cx, cy)
        t = touring(page, 2500)
        steps = page.evaluate("document.querySelectorAll('.wz-tour-card').length") if t else 0
        verdict(t, f'{name}: real mouse click opens the tour (wz-touring={t}, cards={steps}); errors={page.errors}')
        ctx.close()

    print('== 2. one flag per surface (one context, fresh storage)')
    for order in (['wing', 'flagship', 'index'], ['flagship', 'wing', 'index']):
        ctx = mk(br, suppress=False)
        seen = []
        for name in order:
            path, cards = {n: (p, c) for p, n, c in SURFACES}[name]
            page = open_page(ctx, path, wait_cards=cards)
            t = touring(page)
            if t: skip(page)
            keys = page.evaluate("Object.keys(localStorage).filter(k=>k.startsWith('wz-tour:')).sort()")
            seen.append((name, t, keys))
            verdict(t, f'{" -> ".join(order)}: tour started on {name} = {t}; keys now {keys}')
            page.close()
        # replay guard: the first surface again must NOT tour
        name = order[0]; path, cards = {n: (p, c) for p, n, c in SURFACES}[name]
        page = open_page(ctx, path, wait_cards=cards); t = touring(page, 2500)
        verdict(not t, f'{name} again: tour started = {t} (must be False)')
        ctx.close()

    print('== 3. cue levels')
    INSTR = ("(() => { const cg=AudioContext.prototype.createGain; window.__gains=[]; AudioContext.prototype.createGain=function(){ const g=cg.apply(this, arguments); window.__gains.push(g); return g; };"
             " const o=AudioBufferSourceNode.prototype.start; window.__starts=0; AudioBufferSourceNode.prototype.start=function(){ window.__starts++; return o.apply(this, arguments); }; })()")
    ctx = mk(br); ctx.add_init_script(INSTR)
    page = open_page(ctx, '/combined.html'); page.wait_for_timeout(600)
    row = '#results .objection-header[id^=obj-] >> nth=0'
    page.click(row); page.wait_for_timeout(900)            # unlock + decode + expand
    page.click(row); page.wait_for_timeout(500)            # collapse
    gains = page.evaluate("window.__gains.map(g => +g.gain.value.toFixed(3))")
    print('   gains after expand, collapse:', gains, '| starts:', page.evaluate('window.__starts'))
    want = (0.19, 0.17) if not OLD else (0.38, 0.34)
    verdict(want[0] in gains and want[1] in gains, f'expand/collapse gains contain {want}')
    # hover rate limit, by in-page timing: park on prose (not hoverable), then row centres by mouse.move
    def centre(sel, n=0):
        return page.evaluate("([s,n]) => { const r=document.querySelectorAll(s)[n].getBoundingClientRect(); if (r.bottom > innerHeight || r.top < 0) throw new Error('row '+n+' not in the viewport'); return [r.x+r.width/2, r.y+r.height/2]; }", [sel, n])
    rows = '#results .objection-header[id^=obj-]'
    park = centre('.header p')
    def hover_pair(i, j, gap_ms):
        page.mouse.move(*park); page.wait_for_timeout(600)
        page.evaluate("window.__gains=[]; window.__starts=0")
        a = centre(rows, i); b = centre(rows, j)
        page.mouse.move(*a); page.wait_for_timeout(gap_ms); page.mouse.move(*b); page.wait_for_timeout(500)
        return page.evaluate("window.__gains.map(g => +g.gain.value.toFixed(3))")
    h1 = hover_pair(1, 3, 180)
    print('   hover cues ~180 ms apart:', h1)
    verdict((h1 == [0.064]) if not OLD else (h1 == [0.18, 0.18]), 'hover level + rate limit at 180 ms (dropped under the 250 ms limit; kept under the old 120)')
    h2 = hover_pair(2, 4, 400)
    verdict(len(h2) == 2, f'hover cues 400 ms apart: {h2} (two)')
    # master gain
    page.evaluate("document.documentElement.style.setProperty('--wz-sfx-gain','0.5')")
    h3 = hover_pair(5, 5, 50)
    verdict((h3 == [0.032]) if not OLD else (h3 == [0.18]), f'--wz-sfx-gain:0.5 -> hover {h3}')
    page.evaluate("document.documentElement.style.setProperty('--wz-sfx-gain','0'); window.__gains=[]")
    page.mouse.move(*park); page.wait_for_timeout(600); page.evaluate("window.__gains=[]")
    page.click('button.wz-mag'); page.wait_for_timeout(500)
    v = page.evaluate("window.__gains.map(g => +g.gain.value.toFixed(3))")
    verdict((len(v) >= 1 and all(x == 0 for x in v)) if not OLD else (len(v) >= 1 and all(x > 0 for x in v)), f'--wz-sfx-gain:0 -> magnifier press gains {v}')
    print('   errors:', page.errors)
    ctx.close(); br.close()

print('RESULT:', 'GREEN' if fails == 0 else f'RED ({fails} failing)')
sys.exit(1 if fails else 0)
