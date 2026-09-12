"""fbform.py -- the feedback PANEL (2026-09-12) on both card shapes, with the relay routed locally so no
mail is ever sent, and the pan clip.

  1. a real mouse click on FEEDBACK opens the panel under the control (hit-tested); the card does NOT open
  2. Send with an empty message sends nothing; Send with a message posts JSON to the relay with the card's
     context, `email` present only when given; the relay's {ok:true} -> 'sent', a 4xx -> 'error' with the
     mail link still there; a network failure -> 'error'
  3. the honeypot filled -> no request at all
  4. the panel survives the flagship's re-render (open another row: toggleObjection() rebuilds #results)
     and follows its control; Escape and an outside click close it; focus returns to the control
  5. the pan clip: pointer at the left edge, a horizontal wheel must not scroll the page (unzoomed); once
     zoomed the clip releases

CONTROL: --old routes the packs to the K315 bytes (drop layerfix\\): 1-4 cannot pass there (no panel), and
5 must read the 6px."""
import sys, json, pathlib
from hz import *

OLD = '--old' in sys.argv
PAN_ONLY = '--pan-only' in sys.argv
OLD_CSS = pathlib.Path('/mnt/user-data/outputs/layerfix/wuld-layer.css')
OLD_JS  = pathlib.Path('/mnt/user-data/outputs/layerfix/wuld-layer.js')
RELAY = 'https://formspree.io/f/xpqnzqlr'
fails = 0
def verdict(ok, msg):
    global fails
    print(('   PASS ' if ok else '   FAIL ') + msg); fails += (0 if ok else 1)

def mk(br, relay='ok'):
    ctx = context(br, tier=2)
    if OLD:
        def h(route, request):
            u = request.url
            if u.endswith('/wuld-layer.css'): route.fulfill(path=str(OLD_CSS), content_type='text/css')
            elif u.endswith('/wuld-layer.js'): route.fulfill(path=str(OLD_JS), content_type='application/javascript')
            else: route.continue_()
        ctx.route('**/wuld-layer.*', h)
    posts = []
    def relay_h(route, request):
        if request.method == 'OPTIONS':
            route.fulfill(status=200, headers={'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'accept, content-type'}, body=''); return
        try: posts.append(json.loads(request.post_data or 'null'))
        except Exception: posts.append({'_raw': request.post_data})
        if relay == 'ok': route.fulfill(status=200, headers={'Access-Control-Allow-Origin': '*'}, content_type='application/json', body='{"next":"/thanks","ok":true}')
        elif relay == 'refuse': route.fulfill(status=422, headers={'Access-Control-Allow-Origin': '*'}, content_type='application/json', body='{"errors":[{"message":"Form not active"}],"ok":false}')
        else: route.abort('failed')
    ctx.route(RELAY, relay_h)
    ctx.posts = posts
    return ctx

def ctrl_box(page, n=0):
    b = page.evaluate("n => { const a=document.querySelectorAll('.wz-fb')[n]; if(!a) return null; a.scrollIntoView({block:'center'}); const r=a.getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]; }", n)
    page.wait_for_timeout(150)
    return page.evaluate("n => { const r=document.querySelectorAll('.wz-fb')[n].getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]; }", n)
def hit(page, x, y):
    return page.evaluate("([x,y]) => { const e=document.elementFromPoint(x,y); return e ? e.tagName.toLowerCase()+'.'+e.className : 'null'; }", [x, y])
def state(page):
    return page.evaluate("() => { const p=document.querySelector('.wz-fb-panel'); if(!p) return 'absent'; return p.hidden ? 'hidden' : (p.getAttribute('data-state')||'idle'); }")
def panel_pos(page):
    return page.evaluate("() => { const p=document.querySelector('.wz-fb-panel'); if(!p||p.hidden) return null; const r=p.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; }")

serve()
print('layer bytes under test:', 'K315 packs (CONTROL)' if OLD else 'this build')
with sync_playwright() as pw:
    br = browser(pw)
    for path, name, row in ([] if PAN_ONLY else [('/combined.html', 'flagship', '#results .objection-header[id^=obj-]'), ('/veganism/combined.html', 'wing', 'article.obj')]):
        print('==', name)
        ctx = mk(br); page = open_page(ctx, path); page.wait_for_timeout(500)
        b = ctrl_box(page, 0)
        h = hit(page, *b)
        verdict(h.startswith('a.wz-fb'), f'hit-test at the first control: {h}')
        page.mouse.click(*b); page.wait_for_timeout(300)
        st = state(page); pos = panel_pos(page)
        verdict(st == 'idle' and pos is not None, f'real click opens the panel: state={st} pos={pos}')
        opened = page.evaluate(f"!!document.querySelector('{row} >> nth=0'.split(' >> ')[0]) && !!document.querySelector('.objection-header.open, article.obj details[open]')")
        verdict(not opened, f'the card did not open on that click ({opened})')
        if pos:
            page.wait_for_timeout(500)   # the camera pan eases for 260 ms after the pointer settles
            cb = page.evaluate("() => { const a=document.querySelector('.wz-fb'); const r=a.getBoundingClientRect(); return [Math.round(r.right), Math.round(r.bottom)]; }")
            pos = panel_pos(page)
            verdict(abs(pos[0] + pos[2] - cb[0]) <= 2 and pos[1] >= cb[1], f'panel sits under the control (panel right {pos[0]+pos[2]} vs control right {cb[0]}; top {pos[1]} >= control bottom {cb[1]})')
        # empty send
        page.click('.wz-fb-send'); page.wait_for_timeout(300)
        verdict(len(ctx.posts) == 0 and state(page) == 'idle', f'empty message: nothing posted ({len(ctx.posts)}), state {state(page)}')
        # message, no email
        page.fill('.wz-fb-text', 'harness message: the second sentence contradicts the first')
        page.click('.wz-fb-send'); page.wait_for_timeout(600)
        p = ctx.posts[-1] if ctx.posts else {}
        verdict(len(ctx.posts) == 1 and p.get('message', '').startswith('harness message') and 'email' not in p and p.get('id', '').startswith('obj-') and p.get('_subject', '').endswith(p.get('id', 'x')) and p.get('link', '').endswith('#' + p.get('id', 'x')), f'posted JSON: keys {sorted(p.keys())}; id={p.get("id")}')
        print('      library=%r objection=%r classification=%r also=%r' % (p.get('library'), (p.get('objection') or '')[:50], p.get('classification'), (p.get('also_called') or '')[:60]))
        verdict(state(page) == 'sent', f'state after {{ok:true}}: {state(page)}')
        page.wait_for_timeout(2100)
        verdict(state(page) == 'hidden', f'panel closes itself after sent: {state(page)}')
        foc = page.evaluate("document.activeElement && document.activeElement.className")
        verdict(foc == 'wz-fb', f'focus returned to the control: {foc}')
        # with email
        page.mouse.click(*ctrl_box(page, 0)); page.wait_for_timeout(300)
        page.fill('.wz-fb-text', 'second'); page.fill('.wz-fb-email', 'reader@example.org'); page.click('.wz-fb-send'); page.wait_for_timeout(600)
        p = ctx.posts[-1] if ctx.posts else {}
        verdict(len(ctx.posts) == 2 and p.get('email') == 'reader@example.org', f'email travels when given: {p.get("email")}')
        page.wait_for_timeout(2100)
        # honeypot
        page.mouse.click(*ctrl_box(page, 0)); page.wait_for_timeout(300)
        page.fill('.wz-fb-text', 'bot'); page.evaluate("document.querySelector('.wz-fb-trap input').value='http://spam'"); page.click('.wz-fb-send'); page.wait_for_timeout(500)
        verdict(len(ctx.posts) == 2 and state(page) == 'sent', f'honeypot filled: no request ({len(ctx.posts)} posts), state {state(page)}')
        page.wait_for_timeout(2100)
        # escape + outside click
        page.mouse.click(*ctrl_box(page, 1)); page.wait_for_timeout(300)
        page.keyboard.press('Escape'); page.wait_for_timeout(200)
        verdict(state(page) == 'hidden', f'Escape closes: {state(page)}')
        page.mouse.click(*ctrl_box(page, 1)); page.wait_for_timeout(300)
        page.mouse.click(5, 300); page.wait_for_timeout(200)
        verdict(state(page) == 'hidden', f'outside click closes: {state(page)}')
        # a draft survives a stray close, for the same card only
        page.mouse.click(*ctrl_box(page, 1)); page.wait_for_timeout(300)
        page.fill('.wz-fb-text', 'half-written thought'); page.mouse.click(5, 300); page.wait_for_timeout(200)
        page.mouse.click(*ctrl_box(page, 1)); page.wait_for_timeout(300)
        kept = page.evaluate("document.querySelector('.wz-fb-text').value")
        page.keyboard.press('Escape'); page.wait_for_timeout(150)
        page.mouse.click(*ctrl_box(page, 2)); page.wait_for_timeout(300)
        other = page.evaluate("document.querySelector('.wz-fb-text').value")
        page.keyboard.press('Escape'); page.wait_for_timeout(150)
        verdict(kept == 'half-written thought' and other == '', f'draft kept for its card ({kept!r}) and not for another ({other!r})')
        if name == 'flagship':
            # a click on another ROW closes the panel and still opens that row (the click is not swallowed)
            page.mouse.click(*ctrl_box(page, 0)); page.wait_for_timeout(300)
            page.click(f'{row} >> nth=2'); page.wait_for_timeout(600)
            opened = page.evaluate("document.querySelectorAll('.objection-header.open').length")
            verdict(state(page) == 'hidden' and opened == 1, f'row click while open: panel {state(page)}, rows open {opened}')
            fresh = page.evaluate("document.querySelectorAll('.wz-fb').length")
            verdict(fresh >= 80, f'controls re-injected after the re-render: {fresh}')
            page.click(f'{row} >> nth=2'); page.wait_for_timeout(400)
        print('   errors:', page.errors)
        ctx.close()

    print('== relay refusal and network failure (flagship)')
    for mode, want in ([] if PAN_ONLY else [('refuse', 'error'), ('fail', 'error')]):
        ctx = mk(br, relay=mode); page = open_page(ctx, '/combined.html'); page.wait_for_timeout(400)
        page.mouse.click(*ctrl_box(page, 0)); page.wait_for_timeout(300)
        page.fill('.wz-fb-text', 'x'); page.click('.wz-fb-send'); page.wait_for_timeout(800)
        st = state(page); msg = page.evaluate("document.querySelector('.wz-fb-status').textContent"); mail = page.evaluate("(document.querySelector('.wz-fb-mail')||{}).href || ''")
        verdict(st == want and mail.startswith('mailto:contact@wuld.ink'), f'{mode}: state={st} status={msg!r} mail link={mail[:32]}')
        ctx.close()

    print('== the pan clip')
    ctx = mk(br); page = open_page(ctx, '/combined.html'); page.wait_for_timeout(400)
    page.mouse.move(2, 450); page.wait_for_timeout(500)
    px = page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--wz-px')")
    page.mouse.wheel(60, 0); page.wait_for_timeout(300)
    sx = page.evaluate('scrollX'); ox = page.evaluate("getComputedStyle(document.documentElement).overflowX")
    verdict((sx == 0) if not OLD else (sx > 0), f'left-edge pan (--wz-px {px.strip()}): horizontal wheel moved the page by {sx}px (overflow-x {ox})')
    page.keyboard.down('Shift'); page.mouse.wheel(0, -300); page.keyboard.up('Shift'); page.wait_for_timeout(300)
    z = page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--wz-zoom')"); zc = page.evaluate("document.documentElement.classList.contains('wz-zoomed')")
    ox2 = page.evaluate("getComputedStyle(document.documentElement).overflowX")
    verdict(zc and ox2 != 'clip', f'zoomed (--wz-zoom {z.strip()}, wz-zoomed={zc}): overflow-x released to {ox2}')
    print('   errors:', page.errors)
    ctx.close(); br.close()

print('RESULT:', 'GREEN' if fails == 0 else f'RED ({fails} failing)')
sys.exit(1 if fails else 0)
