import sys
from hz import *
rid=sys.argv[1]; path=sys.argv[2]; serve()
with sync_playwright() as pw:
    br=browser(pw); ctx=context(br); page=ctx.new_page(); errs=[]; page.on('pageerror', lambda e: errs.append(str(e)[:60]))
    page.goto('http://127.0.0.1:8765'+path+'#rwe-'+rid, wait_until='load'); page.wait_for_timeout(2000)
    r=page.evaluate("id => { const e=document.getElementById(id); if(!e) return null; const r=e.getBoundingClientRect(); return {top:Math.round(r.top), inView: r.top>=-5 && r.top<900, view:document.body.getAttribute('data-active-view'), scrollY:Math.round(scrollY), focused: e.classList.contains('focused')||e.classList.contains('is-focused')}; }", 'rwe-'+rid)
    print(path, r, 'errors:', errs)
    ctx.close(); br.close()
