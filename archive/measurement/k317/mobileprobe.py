"""mobileprobe.py -- a first look at the flagship and a wing at phone width, for the mobile kickoff brief."""
import json, sys
from hz import *
serve()
JS = r"""() => {
  const cw = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth;
  const vis = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const wide = [...document.querySelectorAll('body *')].filter(e => vis(e) && e.getBoundingClientRect().right > cw + 1).slice(0, 12)
     .map(e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0,2).join('.') : '') + ' right=' + Math.round(e.getBoundingClientRect().right));
  const fonts = {}; let small = 0, n = 0;
  for (const e of document.querySelectorAll('body *')) { if (!vis(e)) continue; const t = [...e.childNodes].filter(x => x.nodeType === 3).map(x => x.textContent.trim()).join(''); if (t.length < 3) continue; n++; const fs = parseFloat(getComputedStyle(e).fontSize); fonts[fs] = (fonts[fs] || 0) + 1; if (fs < 12) small++; }
  const taps = [...document.querySelectorAll('button, a, summary, [role=button], input')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return {w: Math.round(r.width), h: Math.round(r.height), t: (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 20)}; });
  const tiny = taps.filter(t => t.h < 32 || t.w < 32);
  const cs = getComputedStyle(document.documentElement);
  const chin = document.querySelector('.wz-chin, .wz-bezel'); const chinR = chin ? chin.getBoundingClientRect() : null;
  const nav = document.querySelector('.top-nav'); const navR = nav ? nav.getBoundingClientRect() : null;
  const ctrls = [...document.querySelectorAll('.wz-power, .wz-mag, .wz-mute, .wz-help, #mode-legible, #mode-hc, .mode-btn')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return {c: e.className || e.id, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height)}; });
  return { cw, sw, overflow: sw - cw, wide, textNodes: n, smallText: small, fonts: Object.entries(fonts).sort((a,b)=>b[1]-a[1]).slice(0,8), taps: taps.length, tiny: tiny.length, tinySample: tiny.slice(0,8),
           lipX: cs.getPropertyValue('--wz-lip-x'), lipY: cs.getPropertyValue('--wz-lip-y'), band: cs.getPropertyValue('--wz-band'), navH: navR && Math.round(navR.height), navW: navR && Math.round(navR.width), ctrls,
           html_cls: document.documentElement.className, tier: localStorage.getItem('wz-tier') };
}"""
with sync_playwright() as pw:
    br = browser(pw)
    for path, tag in (('/combined.html', 'flagship'), ('/veganism/combined.html', 'wing'), ('/libraries/index.html', 'index')):
        for tier in (2, 0):
            ctx = br.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True, color_scheme='dark')
            route_external(ctx)
            ctx.add_init_script(SUPPRESS + ";try{localStorage.setItem('wz-tier','%d');sessionStorage.setItem('wz-hint-seen','1')}catch(e){}" % tier)
            page = ctx.new_page(); errs = []; page.on('pageerror', lambda e: errs.append(str(e)))
            page.goto(f'http://127.0.0.1:{PORT}{path}', wait_until='load'); page.wait_for_timeout(1200)
            r = page.evaluate(JS); r['errors'] = errs
            print(f'== {tag} tier {tier}:', json.dumps(r)[:1400])
            page.screenshot(path=f'shots/mobile/{tag}_t{tier}_top.png')
            if tag == 'flagship' and tier == 2:
                page.evaluate("window.scrollTo(0, 900)"); page.wait_for_timeout(300); page.screenshot(path='shots/mobile/flagship_t2_rows.png')
                try:
                    page.click('#results .objection-header[id^=obj-] >> nth=1', timeout=3000); page.wait_for_timeout(500); page.screenshot(path='shots/mobile/flagship_t2_open.png')
                except Exception as e: print('   row click failed', str(e)[:80])
                page.evaluate("window.scrollTo(0,0)"); page.click('#vbtn-map'); page.wait_for_timeout(2500); page.screenshot(path='shots/mobile/flagship_t2_map.png')
                print('   map view:', json.dumps(page.evaluate(JS))[:300])
                page.click('.top-nav-view-btn[data-view="rwe"]'); page.wait_for_timeout(1200); page.screenshot(path='shots/mobile/flagship_t2_rwe.png')
                print('   rwe view:', json.dumps(page.evaluate(JS))[:300])
            ctx.close()
    br.close()
