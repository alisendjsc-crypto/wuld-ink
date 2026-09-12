"""sfxcheck.py -- the sound layer on the flagship's rows, with positive AND negative controls, counted
by AudioBufferSourceNode.start calls (instrumented before boot); the wing as the control surface."""
from hz import *
serve()
INSTR = "(() => { const o=AudioBufferSourceNode.prototype.start; window.__starts=[]; AudioBufferSourceNode.prototype.start=function(){ window.__starts.push(1); return o.apply(this, arguments); }; })()"
CASES = {
  '/combined.html': [('#results .objection-header[id^=obj-] >> nth=0', 'row click (unlock + expand)  [positive]'),
                     ('#results .objection-header[id^=obj-] >> nth=0', 'row click again (collapse)   [positive]'),
                     ('.header p', 'prose click                  [negative]'),
                     ('hover:#results .objection-header[id^=obj-] >> nth=3', 'row hover                    [positive]'),
                     ('fb', 'feedback link click          [click, card stays closed]')],
  '/veganism/combined.html': [('article.obj summary >> nth=0', 'summary click (unlock+expand) [positive]'),
                     ('article.obj summary >> nth=0', 'summary click again (collapse) [positive]'),
                     ('header.site h1', 'prose click                  [negative]'),
                     ('hover:article.obj >> nth=2', 'card hover                   [positive]'),
                     ('fb', 'feedback link click          [click]')]}
with sync_playwright() as pw:
    br=browser(pw)
    for path, cases in CASES.items():
        ctx=context(br, tier=2); ctx.add_init_script(INSTR); page=open_page(ctx, path); page.wait_for_timeout(600)
        starts=lambda: page.evaluate('window.__starts.length')
        print('==', path)
        for sel, note in cases:
            before=starts()
            if sel=='fb': page.evaluate("(() => { const a=document.querySelector('.wz-fb'); a.addEventListener('click', e=>e.preventDefault()); a.click(); })()")
            elif sel.startswith('hover:'): page.mouse.move(5,5); page.wait_for_timeout(200); page.hover(sel[6:])
            else: page.click(sel)
            page.wait_for_timeout(700)
            print(f"   {note:46s} sources started: {starts()-before}")
        print('   card open after link click?', page.evaluate("!!document.querySelector('.objection-header.open, article.obj details[open]')"), '| errors:', page.errors)
        ctx.close()
    br.close()
