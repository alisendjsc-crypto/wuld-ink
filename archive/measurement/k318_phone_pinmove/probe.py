"""probe.py -- phone-width layout probe for the flagship (WI-K318 pin move v4.0.2 -> v4.0.3).

Drives the flagship through its views at phone widths in mobile contexts (is_mobile, has_touch, dsf 2)
and records, per state: documentElement overflow (scrollWidth - clientWidth), every visible element whose
rect extends past clientWidth, tap-target heights, small-text counts. Screenshots each state.

usage: python probe.py <tag> [--site DIR] [--widths 390x844,360x780,430x932] [--modes standard,high-contrast]
                       [--tiers 2] [--views library,open,map,dep,map1,rwe,coda] [--wings] [--no-shots]
Output: ../out/probe_<tag>.json and ../out/shots/<tag>/*.png. Prints a table; exit code 0 always (the verdict
script reads the JSON)."""
import json, sys, argparse, pathlib, os
import hz
from hz import *

ap = argparse.ArgumentParser()
ap.add_argument('tag')
ap.add_argument('--site', default=None)
ap.add_argument('--widths', default='390x844,360x780,430x932')
ap.add_argument('--modes', default='standard,high-contrast')
ap.add_argument('--tiers', default='2')
ap.add_argument('--views', default='library,open,map,dep,map1,rwe,coda')
ap.add_argument('--wings', action='store_true')
ap.add_argument('--no-shots', action='store_true')
args = ap.parse_args()

OUT = pathlib.Path(__file__).parent.parent / 'out'
SHOTS = OUT / 'shots' / args.tag
SHOTS.mkdir(parents=True, exist_ok=True)
site = pathlib.Path(args.site) if args.site else hz.SITE
serve(site)

JS = r"""() => {
  const de = document.documentElement;
  const cw = de.clientWidth, sw = de.scrollWidth;
  const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const name = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0,3).join('.') : '');
  const all = [...document.querySelectorAll('body *')];
  // offenders: any visible element whose rect passes clientWidth (0.5px subpixel tolerance)
  const off = [];
  for (const e of all) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.right > cw + 0.5) off.push({sel: name(e), right: Math.round(r.right*10)/10, left: Math.round(r.left*10)/10, w: Math.round(r.width*10)/10}); }
  off.sort((a,b)=>b.right-a.right);
  // is the offender clipped by an overflow:hidden/auto/scroll ancestor (i.e. not a page-overflow cause)?
  const clipped = e => { let p = e.parentElement; while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === 'hidden' || o === 'auto' || o === 'scroll' || o === 'clip') return true; p = p.parentElement; } return false; };
  const offUnclipped = [];
  for (const e of all) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.right > cw + 0.5 && !clipped(e)) offUnclipped.push({sel: name(e), right: Math.round(r.right*10)/10, w: Math.round(r.width*10)/10}); }
  offUnclipped.sort((a,b)=>b.right-a.right);
  // text
  const fonts = {}; let small = 0, n = 0;
  for (const e of all) { if (!vis(e)) continue; const t = [...e.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent.trim()).join(''); if (t.length < 3) continue; n++; const fs = parseFloat(getComputedStyle(e).fontSize); fonts[fs] = (fonts[fs] || 0) + 1; if (fs < 12) small++; }
  // tap targets
  const taps = [...document.querySelectorAll('button, a[href], summary, [role=button], input, select, textarea')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return {sel: name(e), w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, t: (e.textContent || e.getAttribute('aria-label') || e.getAttribute('placeholder') || '').trim().slice(0, 24)}; });
  const tinyH = taps.filter(t => t.h < 36);
  const tiny32 = taps.filter(t => t.h < 32 || t.w < 32); const tiny28 = taps.filter(t => t.h < 28); const tiny24 = taps.filter(t => t.h < 24 || t.w < 24);
  const byH = {}; for (const t of tinyH) { const k = t.sel.replace(/#[^.]+/, ''); byH[k] = (byH[k]||0)+1; }
  const ctrlSel = '#vbtn-library,#vbtn-map,#vbtn-dep,#vbtn-map1,.depth-btn,.rsi-methodology-btn,.filter-btn,.top-nav-view-btn,#mode-legible,#mode-hc,.mode-toggle button,.m1-mode-btn,.map-methodology-btn,.dep-methodology-btn,.m1-methodology-btn';
  const unreach = [];
  const sy = scrollY, sx = scrollX;
  for (const e of document.querySelectorAll(ctrlSel)) { if (!vis(e)) continue; e.scrollIntoView({block: 'center', inline: 'nearest'}); const r = e.getBoundingClientRect(); const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    // reachable = its centre is inside the viewport after a vertical scroll (no horizontal scroll) and the hit test lands on it
    let ok = cx >= 0 && cx <= cw && cy >= 0 && cy <= de.clientHeight && scrollX === sx; if (ok) { const hit = document.elementFromPoint(cx, cy); ok = !!hit && (hit === e || e.contains(hit)); }
    if (!ok) unreach.push(name(e) + ' cx=' + Math.round(cx) + ' cy=' + Math.round(cy) + (scrollX !== sx ? ' scrolledX' : '')); }
  window.scrollTo(sx, sy);
  const csr = getComputedStyle(document.documentElement);
  return { cw, sw, overflow: sw - cw, offenders: off.slice(0, 60), nOffenders: off.length, offUnclipped: offUnclipped.slice(0, 30), nOffUnclipped: offUnclipped.length,
           textNodes: n, smallText: small, fonts: Object.entries(fonts).sort((a,b)=>b[1]-a[1]).slice(0,10),
           taps: taps.length, tinyH: tinyH.length, tiny32: tiny32.length, tiny28: tiny28.length, tiny24: tiny24.length, tinyByGroup: Object.entries(byH).sort((a,b)=>b[1]-a[1]),
           tinySample: tinyH.slice(0, 12), unreach, nUnreach: unreach.length, lipX: csr.getPropertyValue('--wz-lip-x'), band: csr.getPropertyValue('--wz-band'),
           bodyCls: document.body.className, view: document.body.getAttribute('data-active-view'), tier: localStorage.getItem('wz-tier') };
}"""

def mobile_ctx(br, w, h, mode, tier):
    ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, is_mobile=True, has_touch=True, color_scheme='dark')
    route_external(ctx)
    init = SUPPRESS + ";try{localStorage.setItem('wz-tier','%d');sessionStorage.setItem('wz-hint-seen','1')}catch(e){}" % tier
    if mode: init += ";try{localStorage.setItem('arglib-mode','%s');localStorage.setItem('wuld:libmode','%s')}catch(e){}" % (mode, mode)
    ctx.add_init_script(init)
    return ctx

def shot(page, name):
    if not args.no_shots:
        page.screenshot(path=str(SHOTS / (name + '.png')))

results = []
def rec(page, **meta):
    r = page.evaluate(JS); r.update(meta); results.append(r)
    print(f"  {meta.get('surface','flagship'):9s} {meta['w']}x{meta['h']} {meta['mode']:14s} {meta['view']:8s} overflow={r['overflow']:4d} offenders={r['nOffenders']:3d} unclipped={r['nOffUnclipped']:3d} taps={r['taps']:3d} <36h={r['tinyH']:3d} <28h={r['tiny28']:3d} <24={r['tiny24']:3d} unreach={r['nUnreach']:2d} text<12px={r['smallText']}/{r['textNodes']}"
          + (f"  top: {[o['sel'][:34]+' r='+str(o['right']) for o in r['offUnclipped'][:4]]}" if r['nOffUnclipped'] else ''))
    return r

widths = [tuple(int(x) for x in s.split('x')) for s in args.widths.split(',')]
modes = args.modes.split(',')
tiers = [int(t) for t in args.tiers.split(',')]
views = args.views.split(',')

with sync_playwright() as pw:
    br = browser(pw)
    for (w, h) in widths:
        for mode in modes:
            for tier in tiers:
                ctx = mobile_ctx(br, w, h, mode, tier)
                page = ctx.new_page(); errs = []; page.on('pageerror', lambda e: errs.append(str(e)))
                page.goto(f'http://127.0.0.1:{PORT}/combined.html', wait_until='load')
                page.wait_for_function("document.querySelectorAll('#results .objection-header[id^=obj-]').length >= 8", timeout=20000)
                page.wait_for_timeout(1200)
                base = f'{w}x{h}_{mode}_t{tier}'
                meta = dict(w=w, h=h, mode=mode, tier=tier, surface='flagship')
                if 'library' in views:
                    rec(page, view='library', **meta); shot(page, base + '_library')
                    page.evaluate("window.scrollTo(0, 700)"); page.wait_for_timeout(300); shot(page, base + '_library_rows'); page.evaluate("window.scrollTo(0,0)")
                if 'open' in views:
                    page.click('#results .objection-header[id^=obj-] >> nth=1', timeout=5000); page.wait_for_timeout(500)
                    rec(page, view='open', **meta); shot(page, base + '_open')
                    page.click('#results .objection-header[id^=obj-] >> nth=1', timeout=5000); page.wait_for_timeout(300)
                if 'rsi' in views:
                    page.evaluate("window.scrollTo(0,0)"); page.evaluate("document.querySelector('.rsi-methodology-btn').click()"); page.wait_for_timeout(400)
                    rec(page, view='rsi', **meta); shot(page, base + '_rsi'); page.evaluate("document.querySelector('.rsi-methodology-btn').click()"); page.wait_for_timeout(200)
                for v, sel in (('map', '#vbtn-map'), ('dep', '#vbtn-dep'), ('map1', '#vbtn-map1')):
                    if v not in views: continue
                    page.evaluate("window.scrollTo(0,0)"); page.evaluate("s => document.querySelector(s).click()", sel); page.wait_for_timeout(2600 if v == 'map' else 1500)
                    if mode and mode != 'standard': set_mode(page, mode); page.wait_for_timeout(300)   # K73: graph tabs default to STANDARD; cream is an explicit click inside the tab
                    rec(page, view=v, **meta); shot(page, base + '_' + v)
                    if v == 'map1':
                        try:
                            page.evaluate("document.querySelectorAll('.m1-source-item')[3].click()"); page.wait_for_timeout(900)
                            rec(page, view='map1sel', **meta); shot(page, base + '_map1sel')
                        except Exception as e: print('   map1 source click failed', str(e)[:80])
                if any(v in views for v in ('map', 'dep', 'map1')):
                    page.evaluate("document.querySelector('#vbtn-library').click()"); page.wait_for_timeout(300)
                for v in ('rwe', 'coda'):
                    if v not in views: continue
                    page.evaluate("window.scrollTo(0,0)"); page.evaluate(f"document.querySelector('.top-nav-view-btn[data-view=\"{v}\"]').click()"); page.wait_for_timeout(1200)
                    rec(page, view=v, **meta); shot(page, base + '_' + v)
                if any(v in views for v in ('rwe', 'coda')):
                    page.evaluate("document.querySelector('.top-nav-view-btn[data-view=\"library\"]').click()"); page.wait_for_timeout(300)
                if errs: print('   pageerrors:', errs[:3])
                results[-1]['errors'] = errs
                ctx.close()
    if args.wings:
        for path, tag in (('/veganism/combined.html', 'wing-veg'), ('/abortion/combined.html', 'wing-abo'), ('/anthropocentrism/combined.html', 'wing-ant'),
                          ('/right-to-die/combined.html', 'wing-rtd'), ('/transgenderism/combined.html', 'wing-tra'), ('/libraries/index.html', 'index'), ('/veganism/index.html', 'veg-index')):
            for (w, h) in widths:
                ctx = mobile_ctx(br, w, h, None, 2)
                page = ctx.new_page()
                page.goto(f'http://127.0.0.1:{PORT}{path}', wait_until='load'); page.wait_for_timeout(1200)
                rec(page, view='page', w=w, h=h, mode='-', tier=2, surface=tag)
                if w == 390: shot(page, f'{tag}_{w}x{h}')
                ctx.close()
    br.close()

json.dump(results, open(OUT / f'probe_{args.tag}.json', 'w'), indent=1)
print('wrote', OUT / f'probe_{args.tag}.json', len(results), 'states')
