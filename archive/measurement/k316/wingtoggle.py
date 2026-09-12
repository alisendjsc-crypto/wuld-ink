"""wingtoggle.py -- the wings' and the index's two mode toggles: each click flips one axis, the four modes
are the four combinations, storage and data-mode are the same strings as before, and a reload keeps
the choice. CONTROL: --old serves the pristine files (orig_wings/): four buttons, no toggleModeAxis."""
import sys, pathlib
from hz import *
OLD = '--old' in sys.argv
PAGES = [('/veganism/combined.html', True), ('/right-to-die/combined.html', True), ('/abortion/combined.html', True),
         ('/transgenderism/combined.html', True), ('/anthropocentrism/combined.html', True), ('/libraries/index.html', False)]
fails = 0
def verdict(ok, msg):
    global fails
    print(('   PASS ' if ok else '   FAIL ') + msg); fails += (0 if ok else 1)
serve()
with sync_playwright() as pw:
    br = browser(pw)
    for path, cards in PAGES:
        ctx = context(br, tier=2, scheme='dark')
        if OLD:
            rel = path.lstrip('/')
            ctx.route('**' + path, lambda route, request, rel=rel: route.fulfill(path=str(pathlib.Path('orig_wings') / rel), content_type='text/html'))
        page = open_page(ctx, path, wait_cards=False)
        if cards: page.wait_for_function("document.querySelectorAll('article.obj').length >= 1", timeout=20000)
        page.wait_for_timeout(300)
        nb = page.evaluate("document.querySelectorAll('.mode-toggle button').length")
        has = page.evaluate("typeof window.toggleModeAxis === 'function'")
        state = lambda: page.evaluate("[document.documentElement.getAttribute('data-mode'), (document.getElementById('mode-legible')||{}).getAttribute && document.getElementById('mode-legible').getAttribute('aria-pressed'), document.getElementById('mode-hc') && document.getElementById('mode-hc').getAttribute('aria-pressed'), localStorage.getItem('wuld:libmode')]")
        seq = []
        for btn in ('#mode-legible', '#mode-hc', '#mode-legible', '#mode-hc'):
            page.click(btn); page.wait_for_timeout(120); seq.append(state())
        want = [['legible', 'true', 'false', 'legible'], ['both', 'true', 'true', 'both'], ['high-contrast', 'false', 'true', 'high-contrast'], ['standard', 'false', 'false', 'standard']]
        verdict(nb == 2 and has and seq == want, f'{path}: buttons={nb} toggleModeAxis={has} sequence={seq}')
        page.click('#mode-hc'); page.wait_for_timeout(120); page.reload(wait_until='load'); page.wait_for_timeout(400)
        after = page.evaluate("[document.documentElement.getAttribute('data-mode'), document.getElementById('mode-hc') && document.getElementById('mode-hc').classList.contains('active')]")
        verdict(after == ['high-contrast', True], f'{path}: reload keeps the choice: {after}; errors={page.errors}')
        ctx.close()
    br.close()
print('RESULT:', 'GREEN' if fails == 0 else f'RED ({fails} failing)')
