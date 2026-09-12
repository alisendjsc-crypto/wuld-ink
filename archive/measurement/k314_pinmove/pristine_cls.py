"""CLS + overflow of the PRISTINE flagship (no layer) -- the baseline the integrated numbers are read against."""
from hz import *
import shutil, pathlib
serve()
# serve the pristine copy under a different name
shutil.copy('orig/combined.html', 'site/__pristine.html')
with sync_playwright() as pw:
    br = browser(pw); ctx = context(br)
    ctx.add_init_script("""window.__cls=0; window.__shifts=[]; try{ new PerformanceObserver(l=>{ for(const e of l.getEntries()) if(!e.hadRecentInput){ window.__cls+=e.value; window.__shifts.push([Math.round(e.startTime), +e.value.toFixed(3), (e.sources||[]).map(s=>s.node&&(s.node.tagName+'#'+(s.node.id||'')+'.'+(s.node.className||'')).slice(0,40)).slice(0,3)]); } }).observe({type:'layout-shift', buffered:true}); }catch(e){}""")
    page = open_page(ctx, '/__pristine.html'); page.wait_for_timeout(800)
    print('pristine CLS:', page.evaluate('window.__cls'), 'shifts:', page.evaluate('window.__shifts')[:8])
    print('pristine overflow:', page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth"))
    print('past edge:', page.evaluate("""() => { const W=document.documentElement.clientWidth; const out=[]; for (const e of document.querySelectorAll('body *')) { const r=e.getBoundingClientRect(); if (r.right > W+0.5 && r.width>0) out.push(e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:'')+' right='+Math.round(r.right)); } return out.slice(0,12); }"""))
    ctx.close(); br.close()
pathlib.Path('site/__pristine.html').unlink()
