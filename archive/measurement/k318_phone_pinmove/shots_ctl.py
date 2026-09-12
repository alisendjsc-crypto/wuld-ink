"""shots_ctl.py -- the nine README captures at 1440x900 as a DESKTOP-IDENTITY CONTROL (WI-K318).

Same sequence as k316/shots.py, made reproducible: Math.random is seeded (mulberry32) before any page script runs, so
the two force layouts land on the same coordinates run to run; each graph capture waits for its simulation to reach
alphaMin instead of a fixed 2600 ms; CSS animations and transitions are frozen (the layer's vfx tier animates). Run on
the pin's bytes and on the candidate's, then compare md5s: the phone block must not move a desktop pixel, and the fill
remap may move only the two graph captures.
usage: python shots_ctl.py --site DIR --out DIR [--seed 318] [--old-fills]
--old-fills injects the v4.0.2 SVG label fills over the candidate (a control for 'the graph captures differ ONLY by the
fills': with the old fills back, the candidate's graph captures must equal the pin's)."""
import sys, pathlib, argparse, hashlib
import hz
from hz import *

ap = argparse.ArgumentParser()
ap.add_argument('--site', required=True); ap.add_argument('--out', required=True)
ap.add_argument('--seed', type=int, default=318); ap.add_argument('--old-fills', action='store_true')
ap.add_argument('--tier', type=int, default=2); ap.add_argument('--reduced', action='store_true')
args = ap.parse_args()
OUT = pathlib.Path(args.out); OUT.mkdir(parents=True, exist_ok=True)
serve(pathlib.Path(args.site))

SEED_JS = """(function(){ var s = %d >>> 0; Math.random = function() { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();""" % args.seed
FREEZE_CSS = "*, *::before, *::after { animation-play-state: paused !important; animation-delay: -1s !important; transition-duration: 0s !important; transition-delay: 0s !important; caret-color: transparent !important; }"
OLD_FILLS_CSS = """
body[data-active-view="library"] .dep-node-obj text { fill: #555 !important; }
body[data-active-view="library"].high-contrast .dep-node-obj text { fill: #777 !important; }
body[data-active-view="library"] .dep-layer-label { fill: #333 !important; }
body[data-active-view="library"].high-contrast .dep-layer-label { fill: #999 !important; }
body[data-active-view="library"].legible .dep-layer-label { fill: #555 !important; }
body[data-active-view="library"].legible.high-contrast .dep-layer-label { fill: #777 !important; }
body[data-active-view="library"] .map-node-obj text { fill: #666 !important; }
body[data-active-view="library"].high-contrast .map-node-obj text { fill: #888 !important; }
body[data-active-view="library"] .dep-node-premise text { fill: #e8e8e8 !important; }
body[data-active-view="library"].high-contrast .dep-node-premise text { fill: #222 !important; }
body[data-active-view="library"] .dep-node-premise .dep-count-label { fill: rgba(255,255,255,0.5) !important; }
body[data-active-view="library"].high-contrast .dep-node-premise .dep-count-label { fill: rgba(0,0,0,0.4) !important; }
body[data-active-view="library"].high-contrast .m1-node-label-source { fill: #fff !important; }
body[data-active-view="library"].high-contrast .m1-stars-badge { fill: #b8860b !important; }
body[data-active-view="library"] .m1-empty-label { fill: #555 !important; }
"""

hz.SUPPRESS = hz.SUPPRESS + ";try{sessionStorage.setItem('wz-hint-seen','1')}catch(e){}"

def ctx_for(br, **kw):
    kw['tier'] = args.tier
    if args.reduced: kw['reduced_motion'] = 'reduce'
    c = context(br, **kw)
    c.add_init_script(SEED_JS)
    return c

def prep(page):
    page.add_style_tag(content=FREEZE_CSS)
    if args.old_fills: page.add_style_tag(content=OLD_FILLS_CSS)

def settle(page, ms): page.wait_for_timeout(ms)
def wait_sim(page, name):
    page.wait_for_function("n => { var s = window[n]; return !!s && s.alpha() < s.alphaMin(); }", arg=name, timeout=30000)
    settle(page, 400)
def shot(page, name):
    p = OUT / name; page.screenshot(path=str(p)); b = p.read_bytes()
    print(f'   {name:28s} {len(b):7d} B  md5={hashlib.md5(b).hexdigest()}')

with sync_playwright() as pw:
    br = browser(pw)
    ctx = ctx_for(br, tier=2, scheme='dark'); page = open_page(ctx, '/combined.html'); prep(page); settle(page, 900)
    page.mouse.move(720, 450); settle(page, 400)
    shot(page, 'flagship-library.png')
    page.click('#results .objection-header[id^=obj-] >> nth=1'); settle(page, 500)
    page.evaluate("document.querySelectorAll('.wz-fb')[0].scrollIntoView({block:'start'})"); settle(page, 300)
    page.evaluate("window.scrollBy(0, -140)"); settle(page, 300)
    b = page.evaluate("() => { const r=document.querySelectorAll('.wz-fb')[0].getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]; }")
    page.mouse.click(*b); settle(page, 400)
    page.fill('.wz-fb-text', 'The third sentence of the response assumes what the objection denies.')
    page.mouse.move(700, 600); settle(page, 500)
    shot(page, 'feedback-panel.png')
    page.keyboard.press('Escape'); settle(page, 200)
    page.evaluate("window.scrollTo(0,0)"); page.click('#vbtn-map'); wait_sim(page, 'mapSimulation')
    page.mouse.move(720, 500); settle(page, 400)
    shot(page, 'mechanism-web.png')
    page.click('#vbtn-dep'); settle(page, 1500); wait_sim(page, 'depSimulation'); page.mouse.move(720, 500); settle(page, 400)
    shot(page, 'dependency-graph.png')
    page.click('#vbtn-map1'); settle(page, 1500)
    page.click('.m1-source-item >> nth=3', timeout=3000); settle(page, 2200)
    page.mouse.move(900, 500); settle(page, 400)
    shot(page, 'argument-flow-map1.png')
    page.click('#vbtn-library'); settle(page, 600); page.evaluate("window.scrollTo(0,0)"); settle(page, 300)
    page.mouse.move(520, 620)
    page.keyboard.down('Shift')
    for _ in range(6): page.mouse.wheel(0, -300); settle(page, 60)
    page.keyboard.up('Shift'); settle(page, 700)
    shot(page, 'magnifier.png')
    page.keyboard.press('Escape'); settle(page, 300)
    page.click('.top-nav-view-btn[data-view="rwe"]'); settle(page, 1200); page.mouse.move(720, 500); settle(page, 300)
    shot(page, 'real-world-examples.png')
    ctx.close()
    ctx = ctx_for(br, tier=2, scheme='light', mode='high-contrast'); page = open_page(ctx, '/combined.html'); prep(page); settle(page, 900)
    page.mouse.move(720, 450); settle(page, 400)
    shot(page, 'flagship-high-contrast.png')
    ctx.close()
    ctx = ctx_for(br, tier=2, scheme='dark'); page = open_page(ctx, '/veganism/combined.html'); prep(page); settle(page, 900)
    page.click('article.obj summary >> nth=0'); settle(page, 500); page.mouse.move(720, 450); settle(page, 400)
    shot(page, 'wing-veganism.png')
    ctx.close(); br.close()
