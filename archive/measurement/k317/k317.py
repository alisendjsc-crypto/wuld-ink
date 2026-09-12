"""k317.py -- the sticky bar under the magnifier (TODO 22) and the pointer-as-camera (TODO 23), measured.

  A. the flagship's LIBRARY | EXAMPLES | CODA bar: zoomed ~2x and scrolled, its rect must NOT sit
     (k-1)*scroll down the viewport; the examples view's sidebar likewise. Escape gives sticky back.
  B. the camera: at ~2.5x the pointer at the right edge brings the stage's right edge to the viewport's
     (hidden-right -> 0), at the left edge the stage's left edge (hidden-left -> 0); a block wider than the
     viewport is completable end to end by the pointer alone; a 6x6 pointer grid at several scroll positions
     never puts a stage edge inside the viewport beyond the lip; a wheel scroll with the pointer still opens
     no void; a zoom step taken with the camera far right keeps the point under the cursor under it; the
     pointer leaving the window keeps the camera; at 1x the pan is the old +-6px, unchanged; a wing obeys
     the same edge invariants.

CONTROL: --old routes the packs to the K316 bytes (k316packs/): A must show the drift and B's first
checks must find the camera 6px from rest."""
import sys, math, pathlib
from hz import *

OLD = '--old' in sys.argv
OLD_CSS = pathlib.Path('k316packs/wuld-layer.css'); OLD_JS = pathlib.Path('k316packs/wuld-layer.js')
fails = 0
def verdict(ok, msg):
    global fails
    print(('   PASS ' if ok else '   FAIL ') + msg); fails += (0 if ok else 1)

def mk(br, **kw):
    ctx = context(br, tier=2, **kw)
    if OLD:
        def h(route, request):
            u = request.url
            if u.endswith('/wuld-layer.css'): route.fulfill(path=str(OLD_CSS), content_type='text/css')
            elif u.endswith('/wuld-layer.js'): route.fulfill(path=str(OLD_JS), content_type='application/javascript')
            else: route.continue_()
        ctx.route('**/wuld-layer.*', h)
    return ctx

def zoom_of(page): return float(page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--wz-zoom')") or 1)
def zoom_steps(page, n, x, y):
    page.mouse.move(x, y); page.wait_for_timeout(50)
    page.keyboard.down('Shift')
    for _ in range(abs(n)): page.mouse.wheel(0, -300 if n > 0 else 300); page.wait_for_timeout(40)
    page.keyboard.up('Shift'); page.wait_for_timeout(150)
    return zoom_of(page)
def rect(page, sel): return page.evaluate("s => { const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}; }", sel)
def stage_rect(page): return rect(page, '.wz-stage')
def vp(page): return page.evaluate("() => ({cw: document.documentElement.clientWidth, ch: document.documentElement.clientHeight, sx: scrollX, sy: scrollY, iw: innerWidth, ih: innerHeight})")
def lip(page): return page.evaluate("() => { const cs=getComputedStyle(document.documentElement); const px=v=>{const p=v.trim(); if(p.endsWith('vw')) return parseFloat(p)*innerWidth/100; if(p.endsWith('vh')) return parseFloat(p)*innerHeight/100; return parseFloat(p)||0}; return {x: px(cs.getPropertyValue('--wz-lip-x')), y: px(cs.getPropertyValue('--wz-lip-y')), band: px(cs.getPropertyValue('--wz-band'))}; }")
def cam(page): return page.evaluate("() => { const s=document.documentElement.style; return {px: parseFloat(s.getPropertyValue('--wz-px'))||0, py: parseFloat(s.getPropertyValue('--wz-py'))||0}; }")
def move(page, x, y, ms=520): page.mouse.move(x, y); page.wait_for_timeout(ms)
def edges_ok(page, L, tol=0.75):
    """no stage edge inside the viewport beyond the lip (the lip covers the base pan's gap)."""
    r = stage_rect(page); v = vp(page)
    gl = r['l'] - 0; gr = v['cw'] - r['r']; gt = r['t']; gb = v['ch'] - r['b']
    ok = gl <= L['x'] + tol and gr <= L['x'] + tol and gt <= L['y'] + tol and gb <= L['band'] + tol
    return ok, (round(gl,1), round(gr,1), round(gt,1), round(gb,1))

serve()
print('layer bytes under test:', 'K316 packs (CONTROL)' if OLD else 'this build')
with sync_playwright() as pw:
    br = browser(pw)

    # ---------------------------------------------------------------- A. the sticky bar under the magnifier
    print('A. the sticky bar')
    ctx = mk(br); page = open_page(ctx, '/combined.html')
    page.evaluate("toggleMethodology && toggleMethodology()"); page.wait_for_timeout(300)
    vis = page.evaluate("() => { const p=document.getElementById('rsi-methodology-panel'); return p && getComputedStyle(p).display !== 'none'; }")
    print('   methodology panel open:', vis)
    pr = rect(page, '#rsi-methodology-panel'); print('   panel rect top', round(pr['t']) if pr else None)
    # zoom over the panel's text, ~2x, then scroll 300 as a reader would
    py0 = max(120, min(800, (pr['t'] + 60) if pr else 450))
    k = zoom_steps(page, 6, 720, py0); page.wait_for_timeout(300)
    page.evaluate("window.scrollBy(0, 300)"); page.wait_for_timeout(400)
    v = vp(page); nav = rect(page, '.top-nav'); pos = page.evaluate("getComputedStyle(document.querySelector('.top-nav')).position")
    ctop0 = float(page.evaluate("parseFloat(getComputedStyle(document.querySelector('.top-nav')).top)") or 0)
    drift = (k - 1) * v['sy'] + k * ctop0     # sticky laid out unscaled, painted scaled: (k-1)*scroll + k*top
    print(f'   zoom {k:.3f}, scrollY {v["sy"]}, .top-nav position {pos}, rect.top {nav["t"]:.1f} (a drifting bar would sit at (k-1)*{v["sy"]} + k*{ctop0:.1f} = {drift:.1f})')
    in_view = 0 <= nav['t'] < v['ch']
    if OLD: verdict(in_view and abs(nav['t'] - drift) < 2, f'CONTROL: the bar floats in the viewport at (k-1)*scroll + k*top')
    else:   verdict(pos == 'relative' and not in_view, 'the bar is relative under zoom and has scrolled out of the viewport')
    # scroll further: a sticky bar would follow into the panel; a relative one stays gone
    page.evaluate("window.scrollBy(0, 200)"); page.wait_for_timeout(300)
    nav2 = rect(page, '.top-nav')
    print(f'   after another 200: rect.top {nav2["t"]:.1f}')
    if not OLD: verdict(nav2['t'] < 0, 'still gone')
    # Escape: back to 1x and sticky
    page.keyboard.press('Escape'); page.wait_for_timeout(400)
    pos1 = page.evaluate("getComputedStyle(document.querySelector('.top-nav')).position"); nav3 = rect(page, '.top-nav')
    # under the bezel the bar rests at its own `top` (the layer sets it below the top lip), not at 0
    ctop = float(page.evaluate("parseFloat(getComputedStyle(document.querySelector('.top-nav')).top)") or 0)
    verdict(abs(zoom_of(page) - 1) < 0.001 and pos1 == 'sticky' and abs(nav3['t'] - ctop) < 1, f'Escape: zoom {zoom_of(page):.3f}, .top-nav {pos1} at top {nav3["t"]:.1f} (its own top: {ctop:.1f})')
    # the examples view's sidebar
    page.click('.top-nav-view-btn[data-view="rwe"]'); page.wait_for_timeout(900)
    sb = rect(page, '.sidebar'); print('   .sidebar present:', bool(sb), 'top', round(sb['t']) if sb else None)
    if sb:
        k = zoom_steps(page, 6, 720, 500); page.evaluate("window.scrollBy(0, 400)"); page.wait_for_timeout(400)
        spos = page.evaluate("getComputedStyle(document.querySelector('.sidebar')).position"); sb2 = rect(page, '.sidebar')
        print(f'   zoom {k:.3f}: .sidebar position {spos}, rect.top {sb2["t"]:.1f}')
        if OLD: verdict(spos == 'sticky', 'CONTROL: sidebar sticky under zoom')
        else:   verdict(spos == 'relative', 'sidebar relative under zoom')
        page.keyboard.press('Escape'); page.wait_for_timeout(300)
    verdict(not page.errors, f'no page errors ({len(page.errors)})')
    ctx.close()

    # ---------------------------------------------------------------- B. the camera
    print('B. the camera')
    ctx = mk(br); page = open_page(ctx, '/combined.html')
    L = lip(page); print('   lip x %.2f y %.2f band %.2f' % (L['x'], L['y'], L['band']))
    g = page.evaluate("() => { const s=document.querySelector('.wz-stage'); return {l:s.offsetLeft,t:s.offsetTop,w:s.offsetWidth,h:s.offsetHeight, op: s.offsetParent && s.offsetParent.tagName}; }")
    print('   stage layout', g)
    # 1x: the old pan exactly
    move(page, 2, 450); c = cam(page); move(page, 1438, 450); c2 = cam(page); move(page, 720, 2); c3 = cam(page)
    verdict(abs(c['px'] - 6*(1-2/1440)) < 0.05 and abs(c2['px'] + 6*(1438/1440*2-1)) < 0.05 and abs(c3['py'] - 3.6*(1-4/900)) < 0.05,
            f'1x: --wz-px {c["px"]:.2f} at the left edge, {c2["px"]:.2f} at the right, --wz-py {c3["py"]:.2f} at the top (the 6px pan, 0.6 vertical)')
    # zoom ~2.5x with the pointer at the centre, over the rows
    page.evaluate("toggleMethodology && toggleMethodology()"); page.wait_for_timeout(200)
    k = zoom_steps(page, 8, 720, 450); v = vp(page); r = stage_rect(page)
    print(f'   zoom {k:.3f}; scroll ({v["sx"]},{v["sy"]}); stage rect l {r["l"]:.0f} r {r["r"]:.0f} (viewport {v["cw"]})')
    hidden_r0 = r['r'] - v['cw']; hidden_l0 = -r['l']
    print(f'   hidden at rest: left {hidden_l0:.0f}, right {hidden_r0:.0f}')
    # pointer to the right edge: the stage's right edge comes to the viewport's
    move(page, 1439, 450); r1 = stage_rect(page); c = cam(page)
    gap_r = r1['r'] - v['cw']
    print(f'   pointer right edge: --wz-px {c["px"]:.1f}, stage right - viewport right = {gap_r:.1f}')
    if OLD: verdict(abs(c['px'] + 6) < 0.2 and gap_r > 200, 'CONTROL: the camera moved 6px; the hidden right stays hidden')
    else:   verdict(-L['x'] - 1 <= gap_r <= 8, 'hidden-right revealed in full (stage right edge at the viewport right, under the lip)')
    # then the left edge
    move(page, 1, 450); r2 = stage_rect(page); c = cam(page); v2 = vp(page)
    print(f'   pointer left edge: --wz-px {c["px"]:.1f}, stage left = {r2["l"]:.1f} (scrollX {v2["sx"]})')
    if not OLD: verdict(-8 <= r2['l'] <= L['x'] + 1, 'hidden-left revealed in full (stage left edge at the viewport left, under the lip)')
    # a block wider than the viewport, completed end to end by the pointer alone
    wide = page.evaluate("""() => { const cands=[...document.querySelectorAll('#rsi-methodology-panel p, #rsi-methodology-panel li, #results .objection-header, .top-nav, p')];
        for (const e of cands){ const r=e.getBoundingClientRect(); if (r.width > innerWidth*1.3 && r.height>0 && r.top>-2000 && r.top<3000) { e.setAttribute('data-k317','1'); return {w:r.width, t:r.top, txt:(e.textContent||'').trim().slice(0,50)}; } } return null; }""")
    print('   wide block:', wide)
    if wide:
        # bring it into vertical view
        page.evaluate("() => { const e=document.querySelector('[data-k317]'); const r=e.getBoundingClientRect(); window.scrollBy(0, r.top - innerHeight/2); }"); page.wait_for_timeout(300)
        move(page, 1, 450); rl = rect(page, '[data-k317]'); move(page, 1439, 450); rr = rect(page, '[data-k317]')
        print(f'   block left edge with the pointer left: {rl["l"]:.1f}; block right edge with the pointer right: {rr["r"]:.1f} (viewport {v["cw"]})')
        if OLD: verdict(rl['l'] < -20 or rr['r'] > v['cw'] + 20, 'CONTROL: the block cannot be completed by the pointer')
        else:   verdict(rl['l'] >= -1 and rr['r'] <= v['cw'] + 1, 'the block is readable end to end by the pointer alone')
    # the grid: no stage edge inside the viewport beyond the lip, at several scroll positions
    worst = (0, 0, 0, 0); bad = 0; n = 0
    for (sxf, syf) in [(0, 0), (0.5, 0.3), (1.0, 0.5), (0.25, 1.0), (1.0, 1.0)]:
        page.evaluate("(f) => { const mx=document.documentElement.scrollWidth-innerWidth, my=document.documentElement.scrollHeight-innerHeight; window.scrollTo(Math.round(mx*f[0]), Math.round(my*f[1])); }", [sxf, syf]); page.wait_for_timeout(200)
        for gx in range(6):
            for gy in range(6):
                x = 1 + gx * (1438 / 5); y = 1 + gy * (898 / 5)
                move(page, x, y, 340); ok, gaps = edges_ok(page, L); n += 1
                if not ok: bad += 1; worst = max(worst, gaps)
    verdict(bad == 0, f'no void: {n} pointer positions x 5 scroll positions, {bad} with a stage edge inside the viewport beyond the lip (worst gaps l/r/t/b {worst})')
    # a wheel scroll with the pointer still: the camera clamps, no void
    page.evaluate("window.scrollTo(0, 800)"); page.wait_for_timeout(200)
    move(page, 720, 2); c = cam(page); print(f'   pointer at the top edge at scrollY 800: --wz-py {c["py"]:.1f}')
    page.evaluate("window.scrollTo(0, 0)"); page.wait_for_timeout(300); ok, gaps = edges_ok(page, L); c2 = cam(page)
    verdict(ok, f'scrolled to the top with the pointer still: --wz-py {c2["py"]:.1f}, gaps l/r/t/b {gaps}')
    move(page, 720, 898); c = cam(page); print(f'   pointer at the bottom edge at scrollY 0: --wz-py {c["py"]:.1f}')
    page.evaluate("window.scrollTo(0, 1e9)"); page.wait_for_timeout(300); ok, gaps = edges_ok(page, L)
    verdict(ok, f'scrolled to the bottom with the pointer still: gaps l/r/t/b {gaps}')
    # the anchor under a zoom step taken with the camera far right
    page.evaluate("window.scrollTo(0, 600)"); page.wait_for_timeout(200)
    move(page, 1400, 450)
    probe = page.evaluate("""() => { const e=document.elementFromPoint(1400,450); if(!e) return null; e.setAttribute('data-k317a','1'); const r=e.getBoundingClientRect(); return {l:r.left,t:r.top,tag:e.tagName,cls:e.className}; }""")
    k0 = zoom_of(page); k1 = zoom_steps(page, 1, 1400, 450); page.wait_for_timeout(120)
    after = rect(page, '[data-k317a]')
    if probe and after:
        exp_l = 1400 + (probe['l'] - 1400) * k1 / k0; exp_t = 450 + (probe['t'] - 450) * k1 / k0
        d = math.hypot(after['l'] - exp_l, after['t'] - exp_t)
        print(f'   zoom {k0:.3f} -> {k1:.3f} with the camera far right: anchored element {probe["tag"]} drift {d:.2f}px')
        if OLD: verdict(0.3 < d < 1.5, f'CONTROL: the K316 arithmetic ignores the pan, and the pan is 6px: drift {d:.2f}px = 6*(1-1.12) -- at a K317 camera of ~1000px the same arithmetic would drift ~120px')
        else:   verdict(d < 1.5, 'the point under the cursor stays under it')
    # the pointer leaving the window keeps the camera
    move(page, 1439, 450); c = cam(page)
    page.evaluate("window.dispatchEvent(new Event('mouseleave'))"); page.wait_for_timeout(100); c2 = cam(page)
    sl = page.evaluate("document.documentElement.style.getPropertyValue('--wz-sl')")
    if OLD: verdict(c2['px'] == 0, f'CONTROL: mouseleave rests the camera to 0')
    else:   verdict(abs(c2['px'] - c['px']) < 0.01 and sl.strip() == '0', f'mouseleave keeps --wz-px {c2["px"]:.1f}; blur strips rested')
    # Escape: 1x, camera 0
    page.keyboard.press('Escape'); page.wait_for_timeout(400); c = cam(page); v = vp(page)
    verdict(abs(zoom_of(page) - 1) < 0.001 and c['px'] == 0 and c['py'] == 0 and v['sx'] == 0, f'Escape: zoom {zoom_of(page):.3f}, camera ({c["px"]},{c["py"]}), scroll ({v["sx"]},{v["sy"]})')
    verdict(not page.errors, f'no page errors ({len(page.errors)})')
    ctx.close()

    # ---------------------------------------------------------------- C. a wing
    print('C. a wing (veganism)')
    ctx = mk(br); page = open_page(ctx, '/veganism/combined.html'); L = lip(page)
    k = zoom_steps(page, 8, 720, 450)
    bad = 0; n = 0; worst = (0,0,0,0)
    for (sxf, syf) in [(0, 0), (1.0, 0.5), (0.5, 1.0)]:
        page.evaluate("(f) => { const mx=document.documentElement.scrollWidth-innerWidth, my=document.documentElement.scrollHeight-innerHeight; window.scrollTo(Math.round(mx*f[0]), Math.round(my*f[1])); }", [sxf, syf]); page.wait_for_timeout(200)
        for (x, y) in [(1, 1), (1439, 1), (1, 898), (1439, 898), (720, 450), (1439, 450), (1, 450)]:
            move(page, x, y, 340); ok, gaps = edges_ok(page, L); n += 1
            if not ok: bad += 1; worst = max(worst, gaps)
    move(page, 1439, 450); r = stage_rect(page); v = vp(page)
    verdict(bad == 0, f'zoom {k:.3f}: {n} positions, {bad} with a void (worst {worst}); pointer right: stage right - viewport = {r["r"]-v["cw"]:.1f}')
    if not OLD: verdict(r['r'] - v['cw'] <= 8, 'hidden-right revealed in full on the wing')
    verdict(not page.errors, f'no page errors ({len(page.errors)})')
    ctx.close(); br.close()
print('\nRESULT:', 'GREEN' if fails == 0 else f'RED x{fails}')
sys.exit(1 if fails else 0)
