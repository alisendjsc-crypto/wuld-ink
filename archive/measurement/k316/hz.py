"""hz.py -- shared harness for the flagship pin move.

Serves ./site (a replica of the efilist repo root) on 127.0.0.1:8765 and opens pages in Chromium at
1440x900 with sRGB forced. External fetches are answered LOCALLY so the bytes under test are the
bytes that ship: d3 7.8.5 from the npm tarball (cdnjs is rejected by egress policy), IBM Plex Mono
from @fontsource. Anything else off-origin is aborted, so a hung font request cannot stall `load`.

THE TOUR IS SUPPRESSED (wzharness.py): every fresh context has an empty localStorage, so the
first-visit walkthrough would otherwise cover the viewport with a 74% mask and every pixel-sampling
harness would measure the mask. Pass suppress_tour=False only when the tour is the subject."""
import threading, http.server, socketserver, functools, os, json, math, pathlib, re, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).parent
SITE = ROOT / 'site'
VENDOR = ROOT / 'vendor'
D3 = VENDOR / 'd3-7.8.5/package/dist/d3.min.js'
FONTDIR = VENDOR / 'fontsource-ibm-plex-mono-5.3.0/package/files'
PORT = 8765
# wzharness.py's key predates the per-view tours; the live keys are wz-tour:<view> (wuld-tour.js PREFIX).
SUPPRESS = "try{localStorage.setItem('wz-tour-done','1');['library','library:flagship','library:index','map','dep','map1','examples','rwe','coda','index','wing'].forEach(function(k){localStorage.setItem('wz-tour:'+k,'1')})}catch(e){}"

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store'); super().end_headers()

_srv = None
def serve(site=SITE):
    global _srv
    if _srv: return
    h = functools.partial(Quiet, directory=str(site))
    socketserver.TCPServer.allow_reuse_address = True
    _srv = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), h)
    threading.Thread(target=_srv.serve_forever, daemon=True).start()

def font_css():
    out = []
    for w in (300, 400, 500, 700):
        for style, tag in (('normal', 'normal'), ('italic', 'italic')):
            f = FONTDIR / f'ibm-plex-mono-latin-{w}-{tag}.woff2'
            if f.exists():
                out.append("@font-face{font-family:'IBM Plex Mono';font-style:%s;font-weight:%d;"
                           "src:url(/__font/%s) format('woff2');}" % (style, w, f.name))
    return '\n'.join(out)

def route_external(context):
    def handler(route, request):
        url = request.url
        if '/__font/' in url:
            name = url.rsplit('/', 1)[1]
            route.fulfill(path=str(FONTDIR / name), content_type='font/woff2'); return
        if url.startswith(f'http://127.0.0.1:{PORT}/'):
            route.continue_(); return
        if 'd3.min.js' in url:
            route.fulfill(path=str(D3), content_type='application/javascript'); return
        if 'fonts.googleapis.com' in url:
            route.fulfill(body=font_css(), content_type='text/css'); return
        route.abort()
    context.route('**/*', handler)

def browser(pw, **kw):
    return pw.chromium.launch(args=['--force-color-profile=srgb', '--disable-gpu'], **kw)

def context(br, width=1440, height=900, suppress_tour=True, tier=None, mode=None, reduced_motion=None, scheme='light'):
    """tier: None | 0 | 1 | 2 (localStorage wz-tier). mode: None | 'standard' | 'legible' | 'high-contrast' | 'both'
    (the flagship's own localStorage key arglib-mode; the wings use wuld:libmode)."""
    ctx = br.new_context(viewport={'width': width, 'height': height}, device_scale_factor=1,
                         reduced_motion=reduced_motion or 'no-preference', color_scheme=scheme)
    route_external(ctx)
    init = []
    if suppress_tour: init.append(SUPPRESS)
    if tier is not None: init.append("try{localStorage.setItem('wz-tier','%d')}catch(e){}" % tier)
    if mode is not None:
        init.append("try{localStorage.setItem('arglib-mode','%s');localStorage.setItem('wuld:libmode','%s')}catch(e){}" % (mode, mode))
    if init: ctx.add_init_script(';'.join(init))
    return ctx

def open_page(ctx, path='/combined.html', wait_cards=True, console=None):
    page = ctx.new_page()
    errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    if console is not None:
        page.on('console', lambda m: console.append((m.type, m.text)))
    page.goto(f'http://127.0.0.1:{PORT}{path}', wait_until='load')
    if wait_cards:
        page.wait_for_function("document.querySelectorAll('#results .objection-header[id^=obj-], article.obj[id^=obj-]').length >= 8", timeout=20000)
    page.wait_for_timeout(300)
    page.errors = errs
    return page

# ---- contrast --------------------------------------------------------------------------------
CENSUS_JS = r"""
(minChars) => {
  function lum(c){ c=c.map(v=>v/255).map(v=> v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4)); return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; }
  function parse(s){ const m=s&&s.match(/[\d.]+/g); if(!m||m.length<3) return null; return [+m[0],+m[1],+m[2], m.length>3? +m[3]:1]; }
  function ground(el){
    // walk up compositing translucent backgrounds until an opaque one; the html/body ground last
    let acc=null; let e=el;
    while(e){
      const cs=getComputedStyle(e); const bg=parse(cs.backgroundColor);
      if(bg && bg[3]>0){
        if(!acc) acc=[bg[0],bg[1],bg[2],bg[3]];
        else { const a=acc[3]; acc=[acc[0]*a+bg[0]*(1-a), acc[1]*a+bg[1]*(1-a), acc[2]*a+bg[2]*(1-a), a+bg[3]*(1-a)]; }
        if(acc[3]>=0.999) return acc.slice(0,3);
      }
      if(cs.backgroundImage && cs.backgroundImage!=='none') { /* gradients: unknown ground */ }
      e=e.parentElement;
    }
    if(acc){ const a=acc[3]; return [acc[0]*a+255*(1-a), acc[1]*a+255*(1-a), acc[2]*a+255*(1-a)]; }
    return [255,255,255];
  }
  function ownText(el){ let t=''; for(const n of el.childNodes) if(n.nodeType===3) t+=n.textContent; return t.replace(/\s+/g,' ').trim(); }
  function visible(el){ const r=el.getClientRects(); if(!r.length) return false; const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.opacity==='0') return false; return true; }
  function effOpacity(el){ let o=1, e=el; while(e){ o*=parseFloat(getComputedStyle(e).opacity); e=e.parentElement; } return o; }
  const out=[];
  const all=document.body.querySelectorAll('*');
  for(const el of all){
    if(['SCRIPT','STYLE','NOSCRIPT','TEMPLATE','svg','path','g','line','circle','rect','defs','marker','polygon'].includes(el.tagName)) continue;
    const isSvgText = (el.namespaceURI==='http://www.w3.org/2000/svg');
    const t=ownText(el); if(t.length<minChars) continue;
    if(!visible(el)) continue;
    const cs=getComputedStyle(el); const fg=parse(isSvgText? cs.fill : cs.color); if(!fg) continue;
    if(isSvgText && (cs.fillOpacity && parseFloat(cs.fillOpacity)<1)) fg[3]*=parseFloat(cs.fillOpacity);
    const bg=ground(el.parentElement||el);
    const bgOwn=ground(el);
    const o=effOpacity(el);
    // text pixels = fg composited over its own ground by alpha and by opacity
    const a=fg[3]*o; const tx=[fg[0]*a+bgOwn[0]*(1-a), fg[1]*a+bgOwn[1]*(1-a), fg[2]*a+bgOwn[2]*(1-a)];
    const L1=lum(tx), L2=lum(bgOwn); const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
    const sel=el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'? '.'+el.className.trim().split(/\s+/).join('.'):'');
    out.push({sel, ratio:+ratio.toFixed(2), fg:cs.color, bg:'rgb('+bgOwn.map(Math.round).join(',')+')', size:parseFloat(cs.fontSize), weight:cs.fontWeight, chars:t.length, sample:t.slice(0,60), id:el.id||''});
  }
  return out;
}
"""

def census(page, min_chars=3):
    return page.evaluate(CENSUS_JS, min_chars)

def summarize(rows, label='', thresh=4.5):
    import statistics
    if not rows: return {'label': label, 'n': 0}
    rs = sorted(r['ratio'] for r in rows)
    fails = [r for r in rows if r['ratio'] < thresh]
    from collections import Counter
    byfail = Counter((r['sel'], r['fg'], r['bg']) for r in fails)
    return {'label': label, 'n': len(rows), 'median': statistics.median(rs), 'min': rs[0],
            'fails': len(fails), 'fail_pct': round(100*len(fails)/len(rows), 1),
            'groups': sorted(((k, v, min(r['ratio'] for r in fails if (r['sel'], r['fg'], r['bg']) == k)) for k, v in byfail.items()), key=lambda x: -x[1])}

def set_mode(page, mode):
    page.evaluate("m => window.__arglib && window.__arglib.setMode ? window.__arglib.setMode(m) : (window.setMode && setMode(m))", mode)
    page.wait_for_timeout(150)

def bg_luma(page):
    return page.evaluate("""() => { const p=s=>{const m=s.match(/[\\d.]+/g); return m? m.map(Number):null};
      for (const el of [document.body, document.documentElement]) { const c=p(getComputedStyle(el).backgroundColor); if(c&&c.length>=3&&!(c.length>3&&c[3]<0.5)) return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; } return 255; }""")
