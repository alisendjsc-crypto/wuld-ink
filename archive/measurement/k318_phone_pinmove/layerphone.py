"""layerphone.py -- the layer at phone width (WI-K318 section 3.3): three things the brief said to fix ONLY if found.
  1. the chin's controls must not overlap any page control (both at the top of the page and scrolled to the bottom)
  2. the feedback panel (.wz-fb-panel, min(380px, innerWidth-24)) opened on the first row must sit inside the viewport
  3. the first-visit tour card must not be wider than the viewport
usage: python layerphone.py [--site DIR] [--widths 360x780,390x844]"""
import sys, argparse, pathlib, json
import hz
from hz import *
ap = argparse.ArgumentParser(); ap.add_argument('--site', default=None); ap.add_argument('--widths', default='360x780,390x844'); ap.add_argument('--tag', default='new')
args = ap.parse_args()
serve(pathlib.Path(args.site) if args.site else hz.SITE)
OUT = pathlib.Path(__file__).parent.parent / 'out' / 'shots' / ('layer_' + args.tag); OUT.mkdir(parents=True, exist_ok=True)
fails = 0
def verdict(ok, msg):
    global fails
    print(('   PASS ' if ok else '   FAIL ') + msg); fails += (0 if ok else 1)

OVERLAP_JS = r"""() => {
  const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const chin = [...document.querySelectorAll('.wz-chin button, .wz-chin a, .wz-power, .wz-mag, .wz-mute, .wz-help')].filter(vis);
  const ctrls = [...document.querySelectorAll('button, a[href], summary, input, select')].filter(vis).filter(e => !e.closest('.wz-chin') && !e.classList.contains('wz-fb'));
  const hits = [];
  for (const c of chin) { const a = c.getBoundingClientRect(); for (const e of ctrls) { const b = e.getBoundingClientRect(); if (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top) hits.push((c.className||c.tagName) + ' x ' + (e.className||e.tagName) + ' ' + (e.textContent||'').trim().slice(0,16)); } }
  const rects = chin.map(c => { const r = c.getBoundingClientRect(); return {c: c.className, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height)}; });
  return {chin: rects, hits, cw: document.documentElement.clientWidth, ch: document.documentElement.clientHeight};
}"""

with sync_playwright() as pw:
    br = browser(pw)
    for wh in args.widths.split(','):
        w, h = (int(x) for x in wh.split('x'))
        for path, tag in (('/combined.html', 'flagship'), ('/veganism/combined.html', 'wing'), ('/libraries/index.html', 'index')):
            print(f'== {tag} {w}x{h}')
            ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, is_mobile=True, has_touch=True, color_scheme='dark')
            route_external(ctx)
            ctx.add_init_script(SUPPRESS + ";try{localStorage.setItem('wz-tier','2');sessionStorage.setItem('wz-hint-seen','1')}catch(e){}")
            page = ctx.new_page(); errs = []; page.on('pageerror', lambda e: errs.append(str(e)))
            page.goto(f'http://127.0.0.1:{PORT}{path}', wait_until='load'); page.wait_for_timeout(1200)
            # 1. chin vs page controls, top and bottom
            r = page.evaluate(OVERLAP_JS)
            toggles = [x for x in r['hits'] if 'mode' in x or 'top-nav' in x or 'toggle' in x]
            print(f"   info chin at scroll 0: {len(r['chin'])} controls y={[c['y'] for c in r['chin']]} h={[c['h'] for c in r['chin']]} (viewport {r['cw']}x{r['ch']}); page controls passing under the fixed band right now: {r['hits'][:4]}")
            verdict(len(r['chin']) >= 4 and not toggles, f"chin controls do not cover a mode toggle or nav button at the top: {toggles[:4]}")
            page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)"); page.wait_for_timeout(400)
            r2 = page.evaluate(OVERLAP_JS)
            verdict(len(r2['hits']) == 0, f"chin controls at bottom: overlaps={r2['hits'][:4]}")
            page.evaluate("window.scrollTo(0, 0)"); page.wait_for_timeout(200)
            # 2. the feedback panel
            if tag != 'index':
                page.wait_for_function("document.querySelectorAll('.wz-fb').length >= 1", timeout=20000)
                page.evaluate("document.querySelectorAll('.wz-fb')[0].scrollIntoView({block:'center'})"); page.wait_for_timeout(300)
                b = page.evaluate("() => { const r=document.querySelectorAll('.wz-fb')[0].getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]; }")
                page.touchscreen.tap(*b); page.wait_for_timeout(600)
                p = page.evaluate("""() => { const p=document.querySelector('.wz-fb-panel'); if(!p) return null; const r=p.getBoundingClientRect(); const cs=getComputedStyle(p); return {shown: cs.display!=='none' && cs.visibility!=='hidden' && r.width>0, l:Math.round(r.left), r:Math.round(r.right), t:Math.round(r.top), b:Math.round(r.bottom), w:Math.round(r.width), cw: document.documentElement.clientWidth, ch: document.documentElement.clientHeight}; }""")
                ok = bool(p) and p['shown'] and p['l'] >= 0 and p['r'] <= p['cw'] and p['t'] >= 0 and p['b'] <= p['ch']
                verdict(ok, f'feedback panel opened by a tap: {p}')
                page.screenshot(path=str(OUT / f'{tag}_{w}_fbpanel.png'))
                page.keyboard.press('Escape'); page.wait_for_timeout(200)
            verdict(not errs, f'page errors: {errs[:2]}')
            ctx.close()
            # 3. the tour card, tour NOT suppressed
            ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, is_mobile=True, has_touch=True, color_scheme='dark')
            route_external(ctx)
            ctx.add_init_script("try{localStorage.setItem('wz-tier','2')}catch(e){}")
            page = ctx.new_page(); page.goto(f'http://127.0.0.1:{PORT}{path}', wait_until='load'); page.wait_for_timeout(2500)
            t = page.evaluate("""() => { const c=document.querySelector('.wz-tour-card, .wz-tour .wz-card, .wz-tour'); if(!c) return null; const r=c.getBoundingClientRect(); return {sel: c.className, l:Math.round(r.left), r:Math.round(r.right), w:Math.round(r.width), t:Math.round(r.top), b:Math.round(r.bottom), cw: document.documentElement.clientWidth, ch: document.documentElement.clientHeight, text: (c.textContent||'').trim().slice(0,50)}; }""")
            if t is None:
                print('   tour card not found (selector?) -- listing wz- classes:', page.evaluate("[...new Set([...document.querySelectorAll('[class*=wz-tour], [class*=wz-card]')].map(e=>e.className))].slice(0,12)"))
                verdict(False, 'tour card: not located')
            else:
                verdict(t['w'] <= t['cw'] and t['l'] >= 0 and t['r'] <= t['cw'], f'tour card within the viewport: {t}')
            page.screenshot(path=str(OUT / f'{tag}_{w}_tour.png'))
            ctx.close()
    br.close()
print('RESULT:', 'GREEN' if fails == 0 else f'RED ({fails} failing)')
sys.exit(1 if fails else 0)
