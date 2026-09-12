"""census_svg.py -- the graph views' SVG <text> labels against their painted ground (TODO 17 / K314 follow-up).

Drives the K314 census_full states (library closed; one card per tier; RSI panel+detail; map/dep/map1 and
their panels after a node/source click; rwe; coda) at 1440x900 per mode and keeps every visible SVG text
element. Three readings per label:
  ratio        K314 method: fill (x fill-opacity x effective opacity) composited over the nearest opaque DOM
               ancestor background -- the number comparable with K314's "225 of 323 SVG labels below AA"
  ratioShape   shape-aware: if a <rect>/<circle> precedes the label in the same <g>, its fill is composited
               over the DOM ground first (a premise label sits on its family-coloured rect, the T-badge on its circle)
  dimmed       effective opacity < 0.5 (the K74 declutter state: .dimmed nodes at opacity .12/.06) -- an opacity
               state, not a colour; reported separately
usage: python census_svg.py <tag> [--site DIR] [--modes standard,legible,high-contrast,both]
Output ../out/census_svg_<tag>.json + a table."""
import sys, json, argparse, pathlib
import hz
from hz import *

ap = argparse.ArgumentParser()
ap.add_argument('tag'); ap.add_argument('--site', default=None)
ap.add_argument('--modes', default='standard,legible,high-contrast,both')
args = ap.parse_args()
OUT = pathlib.Path(__file__).parent.parent / 'out'
serve(pathlib.Path(args.site) if args.site else hz.SITE)

SVG_JS = r"""
(view) => {
  function lum(c){ c=c.map(v=>v/255).map(v=> v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4)); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; }
  function parse(s){ const m=s&&s.match(/[\d.]+/g); if(!m||m.length<3) return null; return [+m[0],+m[1],+m[2], m.length>3? +m[3]:1]; }
  function ground(el){
    let acc=null; let e=el;
    while(e){
      const cs=getComputedStyle(e); const bg=parse(cs.backgroundColor);
      if(bg && bg[3]>0){
        if(!acc) acc=[bg[0],bg[1],bg[2],bg[3]];
        else { const a=acc[3]; acc=[acc[0]*a+bg[0]*(1-a), acc[1]*a+bg[1]*(1-a), acc[2]*a+bg[2]*(1-a), a+bg[3]*(1-a)]; }
        if(acc[3]>=0.999) return acc.slice(0,3);
      }
      e=e.parentElement;
    }
    if(acc){ const a=acc[3]; return [acc[0]*a+255*(1-a), acc[1]*a+255*(1-a), acc[2]*a+255*(1-a)]; }
    return [255,255,255];
  }
  function over(fg, a, bg){ return [fg[0]*a+bg[0]*(1-a), fg[1]*a+bg[1]*(1-a), fg[2]*a+bg[2]*(1-a)]; }
  function ratio(tx, bg){ const L1=lum(tx), L2=lum(bg); return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05); }
  function effOpacity(el){ let o=1, e=el; while(e){ o*=parseFloat(getComputedStyle(e).opacity); e=e.parentElement; } return o; }
  function visible(el){ const r=el.getBoundingClientRect(); if(!(r.width>0&&r.height>0)) return false; const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none') return false; let p=el; while(p){ const c=getComputedStyle(p); if(c.display==='none'||c.visibility==='hidden') return false; p=p.parentElement; } return true; }
  const out=[];
  for (const el of document.querySelectorAll('svg text, svg tspan')) {
    const t=(el.textContent||'').replace(/\s+/g,' ').trim(); if(t.length<1) continue;
    if(!visible(el)) continue;
    const cs=getComputedStyle(el); const fg=parse(cs.fill); if(!fg) continue;
    let fa = fg[3] * (cs.fillOpacity ? parseFloat(cs.fillOpacity) : 1);
    const o=effOpacity(el); const a=fa*o;
    const bg=ground(el);
    const tx=over(fg, a, bg);
    // shape-aware ground: a rect/circle sibling before this text in the same g
    let bgShape=bg, shape=null;
    const p=el.parentElement;
    if(p && p.tagName.toLowerCase()==='g'){
      const tr=el.getBoundingClientRect(); const tcx=(tr.left+tr.right)/2, tcy=(tr.top+tr.bottom)/2;
      for(const s of p.children){ if(s===el) break; const tn=s.tagName.toLowerCase(); if(tn==='rect'||tn==='circle'){ const sr=s.getBoundingClientRect();
        // the shape is the label's ground only if the label's centre lies inside it (premise labels sit on their rect, T-badges in their circle; a label beside or above its dot is on the canvas)
        if(!(tcx>=sr.left && tcx<=sr.right && tcy>=sr.top && tcy<=sr.bottom)) continue;
        const sc=getComputedStyle(s); const sf=parse(sc.fill); if(sf){ const sa=sf[3]*(sc.fillOpacity?parseFloat(sc.fillOpacity):1)*effOpacity(s)/o; bgShape=over(sf, Math.min(1,sa), bg); shape=tn+' '+sc.fill; } } }
    }
    const txS=over(fg, a, bgShape);
    const svg=el.closest('svg');
    const sel='text'+(el.className&&el.className.baseVal? '.'+el.className.baseVal.trim().split(/\s+/).join('.'):'') + (p&&p.className&&p.className.baseVal? ' in g.'+p.className.baseVal.trim().split(/\s+/).join('.'):'');
    out.push({view, svg: svg? (svg.id||''):'', sel, fill: cs.fill, fillOpacity: cs.fillOpacity, opacity:+o.toFixed(3), dimmed: o<0.5,
      ground:'rgb('+bg.map(Math.round).join(',')+')', ratio:+ratio(tx,bg).toFixed(2),
      shape, groundShape:'rgb('+bgShape.map(Math.round).join(',')+')', ratioShape:+ratio(txS,bgShape).toFixed(2),
      size:parseFloat(cs.fontSize), chars:t.length, sample:t.slice(0,40)});
  }
  return out;
}
"""

def collect(page, view): return page.evaluate(SVG_JS, view)

def table(rows, label):
    n=len(rows); f=[r for r in rows if r['ratio']<4.5]; fs=[r for r in rows if r['ratioShape']<4.5]
    dim=[r for r in rows if r['dimmed']]; f_nd=[r for r in f if not r['dimmed']]; fs_nd=[r for r in fs if not r['dimmed']]
    print(f"   {label:34s} svg-labels={n:4d}  belowAA(K314)={len(f):4d}  belowAA(shape)={len(fs):4d}  dimmed={len(dim):4d}  belowAA-not-dimmed: K314={len(f_nd):4d} shape={len(fs_nd):4d}")
    from collections import Counter
    g=Counter((r['sel'], r['fill'], r['groundShape'] if r['shape'] else r['ground']) for r in fs_nd)
    for (sel, fill, gr), cnt in g.most_common(12):
        mn=min(r['ratioShape'] for r in fs_nd if (r['sel'], r['fill'], (r['groundShape'] if r['shape'] else r['ground']))==(sel,fill,gr))
        print(f"        x{cnt:3d}  {mn:5.2f}  {sel[:46]:46s} {fill:18s} on {gr}")

allout={}
with sync_playwright() as pw:
    br = browser(pw)
    for mode in args.modes.split(','):
        ctx = context(br, mode=mode); page = open_page(ctx)
        print(f"\n===== mode={mode}  errors={page.errors}")
        rows=[]
        for view, sel in (('map','#vbtn-map'),('dep','#vbtn-dep'),('map1','#vbtn-map1')):
            page.evaluate("s => document.querySelector(s).click()", sel); page.wait_for_timeout(3000 if view=='map' else 1500)
            # K73: a graph tab defaults the display mode to STANDARD (dark); the cream ground is an explicit mode click inside the tab
            if mode != 'standard': set_mode(page, mode); page.wait_for_timeout(300)
            print(f"   [{view}] body.className = '{page.evaluate('document.body.className')}'")
            r=collect(page, view); table(r, f'view/{view}'); rows+=r
            page.evaluate("v => { const b=document.querySelector('#'+v+'-view .'+v+'-methodology-btn, #'+v+'-view .m1-methodology-btn'); if (b) b.click(); }", view); page.wait_for_timeout(300)
            page.evaluate("v => { const n=document.querySelector('#'+v+'-view svg g.map-node-mech, #'+v+'-view svg g.node, #'+v+'-view svg circle, #'+v+'-view .m1-source-item'); if (n) n.dispatchEvent(new MouseEvent('click', {bubbles:true})); }", view); page.wait_for_timeout(800)
            r=collect(page, view+'+panels'); table(r, f'view/{view} +panels'); rows+=r
            if view=='map1':
                # a selected source in every mode of the flow map (edges differ per mode)
                for m in ('sophisticate','defender','drifter'):
                    page.evaluate("m => m1SetMode(m)", m); page.wait_for_timeout(400)
                    r=collect(page, 'map1:'+m); table(r, f'view/map1 {m}'); rows+=r
                page.evaluate("m1SetMode('blended')"); page.wait_for_timeout(200)
        page.evaluate("document.querySelector('#vbtn-library').click()"); page.wait_for_timeout(300)
        table(rows, f'ALL graph states ({mode})')
        allout[mode]=rows
        ctx.close()
    br.close()
tot=sum(len(v) for v in allout.values()); fail=sum(1 for v in allout.values() for r in v if r['ratio']<4.5)
failS=sum(1 for v in allout.values() for r in v if r['ratioShape']<4.5); failNd=sum(1 for v in allout.values() for r in v if r['ratioShape']<4.5 and not r['dimmed'])
dimmed=sum(1 for v in allout.values() for r in v if r['dimmed'])
print(f"\nTOTAL over modes {list(allout)}: svg-labels={tot} belowAA(K314)={fail} belowAA(shape)={failS} dimmed={dimmed} belowAA(shape, not dimmed)={failNd}")
json.dump(allout, open(OUT/f'census_svg_{args.tag}.json','w'))
