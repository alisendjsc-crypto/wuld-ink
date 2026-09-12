"""typediff.py -- every text element's type metrics on the pristine flagship vs the integrated one.
Keyed by (tag, class, id, first 40 chars of own text), so the stage wrapper, the precis blocks and the
layer's furniture do not shift the alignment. Reports every changed (selector, property) group."""
import shutil, pathlib, json, sys
from hz import *
from collections import Counter, defaultdict
JS = r"""() => { const out={}; function own(el){let t='';for(const n of el.childNodes) if(n.nodeType===3) t+=n.textContent; return t.replace(/\s+/g,' ').trim();}
  for (const el of document.body.querySelectorAll('*')) { if (el.closest('.wz-frame,.wz-chin,.wz-hint,.precis-start')) continue; if(['SCRIPT','STYLE'].includes(el.tagName)) continue;
    const t=own(el); if(t.length<2) continue; const cs=getComputedStyle(el);
    const key=el.tagName+'|'+(typeof el.className==='string'?el.className:'')+'|'+el.id+'|'+t.slice(0,40);
    if(out[key]) continue;
    out[key]={fs:cs.fontSize, fw:cs.fontWeight, ls:cs.letterSpacing, ff:cs.fontFamily.split(',')[0], br:cs.borderRadius, pt:cs.paddingTop, pb:cs.paddingBottom, pl:cs.paddingLeft, lh:cs.lineHeight, tt:cs.textTransform, w:Math.round(el.getBoundingClientRect().width), h:Math.round(el.getBoundingClientRect().height)}; }
  return out; }"""
serve(); shutil.copy('orig/combined.html', 'site/__pristine.html')
def grab(page):
    page.evaluate("""() => { const seen={}; for (const h of document.querySelectorAll('#results .objection-header[id^=obj-]')) { const t=(h.querySelector('.tier-badge')||{}).textContent||''; if(seen[t]) continue; seen[t]=1; h.click(); } }"""); page.wait_for_timeout(300)
    page.evaluate("(() => { const b=document.querySelector('.rsi-methodology-btn'); if (b) b.click(); const r=document.querySelector('#results .rsi-badge'); if (r) r.click(); })()"); page.wait_for_timeout(300)
    return page.evaluate(JS)
res = {}
with sync_playwright() as pw:
    br = browser(pw)
    for mode in (sys.argv[1:] or ['standard','legible']):
        for name, path in (('pristine','/__pristine.html'),('integrated','/combined.html')):
            ctx = context(br, mode=mode, tier=0); page = open_page(ctx, path); res[(mode,name)] = grab(page); ctx.close()
        a, b = res[(mode,'pristine')], res[(mode,'integrated')]
        common = [k for k in a if k in b]
        changes = defaultdict(list)
        for k in common:
            for prop in ('fs','fw','ls','ff','br','pt','pb','pl','lh','tt','h'):
                if a[k][prop] != b[k][prop]:
                    sel = k.split('|')[0].lower() + ('.' + k.split('|')[1].replace(' ', '.') if k.split('|')[1] else '')
                    changes[(sel, prop, a[k][prop], b[k][prop])].append(k.split('|')[3][:30])
        print(f"\n== mode={mode}: {len(a)} pristine keys, {len(b)} integrated, {len(common)} matched; only-pristine {len(set(a)-set(b))}, only-integrated {len(set(b)-set(a))}")
        print(f"   changed (selector, property, before -> after): {len(changes)} groups over {sum(len(v) for v in changes.values())} elements")
        for (sel, prop, x, y), ks in sorted(changes.items(), key=lambda kv: -len(kv[1])):
            print(f"   x{len(ks):3d} {sel[:44]:44s} {prop:3s} {str(x):>24s} -> {str(y):<24s} e.g. '{ks[0]}'")
    br.close()
pathlib.Path('site/__pristine.html').unlink()
