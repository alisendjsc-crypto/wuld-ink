"""shots_phone.py -- the acceptance screenshots (WI-K318 section 3.4): 390x844 and 360x780, dark then cream, six states each
(library top; a card open; mechanism web; dependency graph; argument flow with a source selected; examples), composed into
one contact sheet per width and ground. Mobile contexts (is_mobile, has_touch, dsf 2), vfx tier, tour suppressed.
usage: python shots_phone.py --site DIR --out DIR [--tag new]"""
import sys, argparse, pathlib
import hz
from hz import *
from PIL import Image, ImageDraw
ap = argparse.ArgumentParser(); ap.add_argument('--site', required=True); ap.add_argument('--out', required=True); ap.add_argument('--tag', default='new')
args = ap.parse_args()
OUT = pathlib.Path(args.out); OUT.mkdir(parents=True, exist_ok=True)
serve(pathlib.Path(args.site))

def ctx_for(br, w, h, mode):
    ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, is_mobile=True, has_touch=True, color_scheme='light' if mode == 'high-contrast' else 'dark')
    route_external(ctx)
    init = SUPPRESS + ";try{localStorage.setItem('wz-tier','2');sessionStorage.setItem('wz-hint-seen','1')}catch(e){}"
    init += ";try{localStorage.setItem('arglib-mode','%s');localStorage.setItem('wuld:libmode','%s')}catch(e){}" % (mode, mode)
    ctx.add_init_script(init)
    return ctx

shots = {}
def shot(page, key):
    p = OUT / (key + '.png'); page.screenshot(path=str(p)); shots[key] = p

with sync_playwright() as pw:
    br = browser(pw)
    for (w, h) in ((390, 844), (360, 780)):
        for mode in ('standard', 'high-contrast'):
            g = 'dark' if mode == 'standard' else 'cream'
            ctx = ctx_for(br, w, h, mode); page = ctx.new_page()
            page.goto(f'http://127.0.0.1:{PORT}/combined.html', wait_until='load')
            page.wait_for_function("document.querySelectorAll('#results .objection-header[id^=obj-]').length >= 8", timeout=20000); page.wait_for_timeout(1200)
            k = f'{args.tag}_{w}_{g}_'
            shot(page, k + '1-library')
            page.evaluate("document.querySelectorAll('#results .objection-header[id^=obj-]')[1].click()"); page.wait_for_timeout(500)
            page.evaluate("document.querySelectorAll('#results .objection-header[id^=obj-]')[1].scrollIntoView({block:'start'})"); page.wait_for_timeout(300)
            shot(page, k + '2-card')
            page.evaluate("document.querySelectorAll('#results .objection-header[id^=obj-]')[1].click()"); page.wait_for_timeout(300)
            for v, sel, n in (('map', '#vbtn-map', '3-web'), ('dep', '#vbtn-dep', '4-dependency'), ('map1', '#vbtn-map1', '5-flow')):
                page.evaluate("window.scrollTo(0,0)"); page.evaluate("s => document.querySelector(s).click()", sel); page.wait_for_timeout(1800)
                if mode != 'standard': set_mode(page, mode); page.wait_for_timeout(300)   # K73: graph tabs default to STANDARD
                if v == 'map1':
                    page.evaluate("document.querySelectorAll('.m1-source-item')[3].click()"); page.wait_for_timeout(900)
                    page.evaluate("document.querySelector('.m1-graph-container').scrollIntoView({block:'start'})"); page.wait_for_timeout(300)
                else:
                    page.evaluate("v => document.getElementById(v + '-container').scrollIntoView({block:'start'})", v); page.wait_for_timeout(300)
                    page.evaluate("window.scrollBy(0, -60)"); page.wait_for_timeout(200)
                shot(page, k + n)
            page.evaluate("document.querySelector('#vbtn-library').click()"); page.wait_for_timeout(300)
            page.evaluate("window.scrollTo(0,0)"); page.evaluate("document.querySelector('.top-nav-view-btn[data-view=\"rwe\"]').click()"); page.wait_for_timeout(1200)
            shot(page, k + '6-examples')
            ctx.close()
            # contact sheet
            keys = [k + n for n in ('1-library', '2-card', '3-web', '4-dependency', '5-flow', '6-examples')]
            ims = [Image.open(shots[x]) for x in keys]
            sw, sh = ims[0].size; scale = 0.5; tw, th = int(sw * scale), int(sh * scale); pad = 16; label_h = 40
            sheet = Image.new('RGB', (pad + len(ims) * (tw + pad), label_h + th + pad), (24, 24, 24))
            d = ImageDraw.Draw(sheet)
            d.text((pad, 10), f'library.wuld.ink/combined  v4.0.3 candidate  {w}x{h}  {g}  (states: library / a card open / mechanism web / dependency graph / argument flow / examples)', fill=(220, 220, 220))
            for i, im in enumerate(ims):
                sheet.paste(im.resize((tw, th), Image.LANCZOS), (pad + i * (tw + pad), label_h))
            sp = OUT / f'sheet_{args.tag}_{w}x{h}_{g}.png'; sheet.save(sp, optimize=True); print('sheet', sp, sp.stat().st_size, 'B')
    br.close()
