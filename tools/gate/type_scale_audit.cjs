// K298 — phone type-scale escape census (v2).
// v1 was UNRELIABLE: reusing one page across a sustained crawl let p.evaluate() bind to a
// STALE document — it reported an <h1> on /glossary/black-box-of-inaccessibility/, a page
// that has none. v2 uses a fresh page per route, settles on fonts+rAF, and ASSERTS the
// measured document's own location against the requested route. A mismatch is fatal.
const path=require('path'),fs=require('fs');const {chromium}=require('playwright');
const SRC=path.resolve(process.argv[2]||'pristine');const OUT=process.argv[3]||'census.json';const FILT=process.argv[4]||'';
const MIME={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.xml':'application/xml','.webmanifest':'application/manifest+json','.woff2':'font/woff2','.txt':'text/plain'};
const SCALE={H1:34.2,H2:27,H3:22.5};   // K275 phone scale @390px / root 18px (mobile-a11y.css 83-85)
function lp(u){let p=decodeURIComponent(u.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(SRC,p);if(!f.startsWith(SRC))return null;if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;return null;}
function routes(){const o=[];(function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())w(f);else if(e.name.endsWith('.html')){const r='/'+path.relative(SRC,f).split(path.sep).join('/');o.push(r.endsWith('/index.html')?r.slice(0,-10):r);}}})(SRC);return o.sort();}
(async()=>{let rs=routes();if(FILT)rs=rs.filter(r=>r.includes(FILT));
const b=await chromium.launch();
const c=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:3,userAgent:'Mozilla/5.0 (Linux; Android 13; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36'});
await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='wuld.ink')return r.abort();const f=lp(u.pathname);if(!f)return r.fulfill({status:404,body:'nf'});return r.fulfill({status:200,body:fs.readFileSync(f),headers:{'content-type':MIME[path.extname(f).toLowerCase()]||'application/octet-stream','cache-control':'no-store'}});});
const rows=[];const bad=[];
for(const rt of rs){const p=await c.newPage();p.on('pageerror',()=>{});
 try{await p.goto('https://wuld.ink'+rt,{waitUntil:'load',timeout:20000});}catch(e){bad.push(`${rt}: goto ${String(e).slice(0,50)}`);await p.close();continue;}
 await p.evaluate(()=>document.fonts&&document.fonts.ready).catch(()=>{});
 await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))).catch(()=>{});
 // STYLE SETTLE — v2a. A fresh page can be measured before every linked sheet is applied,
 // which silently reports base.css's unclamped size. Poll until the first in-main heading's
 // computed font-size is stable across two consecutive frames (bounded), then measure.
 await p.evaluate(()=>new Promise(res=>{const g=()=>{const m=document.querySelector('main')||document.body;const el=m.querySelector('h1,h2,h3');return el?getComputedStyle(el).fontSize:'-';};
   let last=g(),n=0;const tick=()=>{const v=g();if(v===last){if(++n>=3)return res();}else{last=v;n=0;}
     if(performance.now()>4000)return res();requestAnimationFrame(tick);};requestAnimationFrame(tick);})).catch(()=>{});
 const d=await p.evaluate(()=>{const m=document.querySelector('main')||document.body;const out=[];
   for(const el of m.querySelectorAll('h1,h2,h3')){const cs=getComputedStyle(el);const rc=el.getBoundingClientRect();
     if(cs.display==='none'||rc.height===0)continue;
     out.push({tag:el.tagName,cls:String(el.className||'').slice(0,60),fs:parseFloat(cs.fontSize),h:Math.round(rc.height),lh:parseFloat(cs.lineHeight)||0,txt:el.textContent.trim().replace(/\s+/g,' ').slice(0,44)});}
   let k298=false,sheets=0,errs=0;
   for(const sh of document.styleSheets){sheets++;let rr;try{rr=sh.cssRules}catch(e){errs++;continue}
     for(const r of rr){if(r.type===4&&String(r.conditionText||'').includes('640')){for(const ir of r.cssRules){if(ir.selectorText==='.entry-term'||ir.selectorText==='.gallery-page .page-hero-title')k298=true;}}}}
   return {heads:out,loc:location.pathname,title:document.title.slice(0,40),k298,sheets,errs};});
 await p.close();
 // IDENTITY ASSERT — the v1 defect: never trust a measurement whose document is not the one asked for.
 const want=rt.endsWith('.html')?rt:rt; if(d.loc!==want){bad.push(`${rt}: measured ${d.loc}`);continue;}
 for(const h of d.heads){const sc=SCALE[h.tag];rows.push({route:rt,k298:d.k298,sheets:d.sheets,tag:h.tag,cls:h.cls,fs:h.fs,scale:sc,ratio:+(h.fs/sc).toFixed(2),lines:h.lh?Math.round(h.h/h.lh):1,h:h.h,txt:h.txt,escape:h.fs>sc*1.05});}}
await b.close();
const esc=rows.filter(x=>x.escape);
fs.writeFileSync(OUT,JSON.stringify({meta:{generated:'K298',src:SRC,scale:SCALE,pages:rs.length,measured:rs.length-bad.length,headings:rows.length,escapes:esc.length,routesWithEscapes:new Set(esc.map(e=>e.route)).size,identityFailures:bad},rows},null,1));
console.log(`pages=${rs.length} measured=${rs.length-bad.length} headings=${rows.length} escapes=${esc.length} routes_with_escapes=${new Set(esc.map(e=>e.route)).size} identity_failures=${bad.length}`);
if(bad.length)console.log('IDENTITY/LOAD FAILURES:\n  '+bad.join('\n  '));
})();
