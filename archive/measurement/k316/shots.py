"""shots.py -- README captures at 1440x900, sRGB, from the deploy bytes (the replica serves the same files
the site serves; d3 and IBM Plex Mono are vendored so the pixels are the site's). Tours suppressed, vfx
tier, dark OS scheme unless the capture is the cream mode."""
import sys, pathlib
from hz import *
import hz
hz.SUPPRESS = hz.SUPPRESS + ";try{sessionStorage.setItem('wz-hint-seen','1')}catch(e){}"
OUT = pathlib.Path('shots/readme'); OUT.mkdir(parents=True, exist_ok=True)
serve()
def settle(page, ms): page.wait_for_timeout(ms)
def shot(page, name, full=False):
    p = OUT / name; page.screenshot(path=str(p), full_page=full); print('  ', name, p.stat().st_size, 'B')
with sync_playwright() as pw:
    br = browser(pw)
    # 1. the flagship's library view, dark, effects on
    ctx = context(br, tier=2, scheme='dark'); page = open_page(ctx, '/combined.html'); settle(page, 900)
    page.mouse.move(720, 450); settle(page, 400)
    shot(page, 'flagship-library.png')
    # 2. a row open with its response (deconstruct depth), plus the feedback panel on the row above
    page.click('#results .objection-header[id^=obj-] >> nth=1'); settle(page, 500)
    page.evaluate("document.querySelectorAll('.wz-fb')[0].scrollIntoView({block:'start'})"); settle(page, 300)
    page.evaluate("window.scrollBy(0, -140)"); settle(page, 300)
    b = page.evaluate("() => { const r=document.querySelectorAll('.wz-fb')[0].getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]; }")
    page.mouse.click(*b); settle(page, 400)
    page.fill('.wz-fb-text', 'The third sentence of the response assumes what the objection denies.')
    page.mouse.move(700, 600); settle(page, 500)
    shot(page, 'feedback-panel.png')
    page.keyboard.press('Escape'); settle(page, 200)
    # 3. the mechanism web
    page.evaluate("window.scrollTo(0,0)"); page.click('#vbtn-map'); settle(page, 2600)
    page.mouse.move(720, 500); settle(page, 400)
    shot(page, 'mechanism-web.png')
    # 4. the dependency graph
    page.click('#vbtn-dep'); settle(page, 2600); page.mouse.move(720, 500); settle(page, 400)
    shot(page, 'dependency-graph.png')
    # 5. the argument flow map with a source selected
    page.click('#vbtn-map1'); settle(page, 1500)
    try:
        page.click('.m1-source-item >> nth=3', timeout=3000); settle(page, 2200)
    except Exception as e:
        print('   map1: no source item clicked --', str(e)[:80])
    page.mouse.move(900, 500); settle(page, 400)
    shot(page, 'argument-flow-map1.png')
    # 6. the magnifier on the library rows
    page.click('#vbtn-library'); settle(page, 600); page.evaluate("window.scrollTo(0,0)"); settle(page, 300)
    page.mouse.move(520, 620)
    page.keyboard.down('Shift')
    for _ in range(6): page.mouse.wheel(0, -300); settle(page, 60)
    page.keyboard.up('Shift'); settle(page, 700)
    z = page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--wz-zoom')")
    print('   magnifier zoom', z.strip())
    shot(page, 'magnifier.png')
    page.keyboard.press('Escape'); settle(page, 300)
    # 7. real-world examples
    page.click('.top-nav-view-btn[data-view="rwe"]'); settle(page, 1200); page.mouse.move(720, 500); settle(page, 300)
    shot(page, 'real-world-examples.png')
    ctx.close()
    # 8. high-contrast (cream) mode, effects step down by the glow gate
    ctx = context(br, tier=2, scheme='light', mode='high-contrast'); page = open_page(ctx, '/combined.html'); settle(page, 900)
    page.mouse.move(720, 450); settle(page, 400)
    shot(page, 'flagship-high-contrast.png')
    ctx.close()
    # 9. a wing, dark
    ctx = context(br, tier=2, scheme='dark'); page = open_page(ctx, '/veganism/combined.html'); settle(page, 900)
    page.click('article.obj summary >> nth=0'); settle(page, 500); page.mouse.move(720, 450); settle(page, 400)
    shot(page, 'wing-veganism.png')
    ctx.close(); br.close()
