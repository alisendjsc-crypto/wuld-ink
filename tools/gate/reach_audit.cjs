#!/usr/bin/env node
/**
 * reach_audit.cjs (K290) -- FIRST-CONTENT REACH AUDIT for wuld.ink
 *
 * WHY THIS EXISTS: K287 gated touch-target size, horizontal overflow and desktop
 * inertness. Every gate passed. It shipped. /void-engine/ was still 4.7 phone
 * screens of chrome before the lexicon. Every gate measured whether the page was
 * CORRECT; none measured whether it was REACHABLE.
 *
 * THREE NUMBERS PER PAGE, all in document-y px, all divided by viewport height:
 *
 *   y_content     the spec rule: first non-chrome VISIBLE element carrying a direct
 *                 non-empty text node, or being img/video/canvas/svg/picture/iframe.
 *   y_repeat      the first BROWSABLE GROUP: >=3 visible sibling elements sharing
 *                 tag+class, each >=24px tall, signature tag not a bare text-flow
 *                 tag, and >=half the members containing a link/control/media.
 *                 This is the index, the grid, the card list, the lexicon -- the
 *                 thing the page exists to let you browse. N/A on prose pages,
 *                 and that N/A is itself the reading.
 *   y_interact    first in-<main> interactive element outside the page hero.
 *                 Cross-check that fails differently from the other two.
 *
 * ORDERING RULE: MINIMUM DOCUMENT-Y, tie-broken by document order -- not document
 * order alone. Grid/flex `order` makes document order a lie about what the eye
 * meets first. State it, apply it uniformly.
 *
 * CHROME = anything inside a <nav>, inside header.site-header (or a <header> that
 * is a direct child of <body>), inside <footer>, inside .skip-link, or inside any
 * position:fixed / position:sticky container. Chrome is excluded by construction.
 *
 * The chosen element's SELECTOR is printed with every number so a misclassification
 * is visible in the output rather than buried in the score.
 *
 * ALL EXTERNAL REQUESTS ARE ABORTED (K289 lost two minutes to hanging
 * fonts.googleapis.com fetches). Pages are served from a local http.server.
 *
 *   node tools/gate/reach_audit.cjs <baseUrl> <pageListFile> <outJson>
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
 '.json':'application/json', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
 '.svg':'image/svg+xml', '.webm':'video/webm', '.mp4':'video/mp4', '.woff2':'font/woff2', '.woff':'font/woff',
 '.ttf':'font/ttf', '.otf':'font/otf', '.xml':'application/xml', '.pdf':'application/pdf', '.txt':'text/plain',
 '.webmanifest':'application/manifest+json', '.mp3':'audio/mpeg', '.ico':'image/x-icon' };

const ROOT = process.argv[2];                 // local copy of src/
const LIST = process.argv[3];
const OUT  = process.argv[4] || 'reach-audit.json';
const ONLY = process.argv[5] || '';           // '' | 'phone' | 'desktop'
const FROM = parseInt(process.argv[6] || '0', 10);
const COUNT= parseInt(process.argv[7] || '9999', 10);
const BASE = 'http://wuld.local';

const VIEWPORTS = [
  { name: 'phone',   width: 390,  height: 844, isMobile: true,  hasTouch: true,  dsf: 3 },
  { name: 'desktop', width: 1280, height: 900, isMobile: false, hasTouch: false, dsf: 1 },
];

const MEASURE = () => {
  const CHROME_SKIP_TAGS = new Set(['SCRIPT','STYLE','TEMPLATE','NOSCRIPT','LINK','META','TITLE','HEAD','BR','HR']);
  const MEDIA = new Set(['IMG','VIDEO','CANVAS','SVG','PICTURE','IFRAME','OBJECT','EMBED']);
  const TEXTFLOW = new Set(['P','H1','H2','H3','H4','H5','H6','BLOCKQUOTE','PRE','FIGCAPTION','SPAN','EM','STRONG','LABEL','TIME','SMALL','CODE','BR','HR']);
  const INTERACTIVE = 'a[href],button,input,select,textarea,summary,[role="button"],[role="link"],[onclick],[tabindex]:not([tabindex="-1"])';

  const sel = (el) => {
    if (!el) return null;
    const parts = [];
    let n = el, depth = 0;
    while (n && n.nodeType === 1 && n !== document.documentElement && depth < 4) {
      let s = n.tagName.toLowerCase();
      if (n.id) { s += '#' + n.id; parts.unshift(s); break; }
      const cls = (n.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 3);
      if (cls.length) s += '.' + cls.join('.');
      parts.unshift(s); n = n.parentElement; depth++;
    }
    return parts.join(' > ');
  };

  const chromeRoots = [];
  const isChromeNode = (n) => {
    if (n.nodeType !== 1) return false;
    const tag = n.tagName;
    if (tag === 'NAV' || tag === 'FOOTER') return true;
    if (tag === 'HEADER' && (n.classList.contains('site-header') || n.parentElement === document.body)) return true;
    if (n.classList && n.classList.contains('skip-link')) return true;
    const cs = getComputedStyle(n);
    if (cs.position === 'fixed' || cs.position === 'sticky') return true;
    return false;
  };
  document.querySelectorAll('*').forEach(n => { if (isChromeNode(n)) { chromeRoots.push(n); n.setAttribute('data-k290-chrome',''); } });

  const inChrome = (el) => !!el.closest('[data-k290-chrome]');

  let opacityRejects = 0, offscreenRejects = 0;
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    // sr-only / offscreen: a screen-reader shim is not reachable content.
    // (/chat/ scored y = -9,995 before this guard: a left:-9999px live-region.)
    if (r.top + window.scrollY < 0 || r.left + window.scrollX < -50) { offscreenRejects++; return false; }
    if (r.width <= 2 && r.height <= 2) { offscreenRejects++; return false; }
    { const c = getComputedStyle(el);
      if (c.clip === 'rect(0px, 0px, 0px, 0px)' || c.clipPath === 'inset(50%)') { offscreenRejects++; return false; } }
    let n = el;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      if (parseFloat(cs.opacity) === 0) { opacityRejects++; return false; }
      n = n.parentElement;
    }
    return true;
  };
  const docY = (el) => Math.round(el.getBoundingClientRect().top + window.scrollY);

  const hasDirectText = (el) => {
    for (const c of el.childNodes) if (c.nodeType === 3 && c.nodeValue.trim().length >= 2) return true;
    return false;
  };

  const main = document.querySelector('main') || document.body;
  const scope = [...document.body.querySelectorAll('*')].filter(el =>
    !CHROME_SKIP_TAGS.has(el.tagName) && !inChrome(el));

  // ---- 1. y_content (spec rule) -------------------------------------------
  let content = null;
  for (const el of scope) {
    if (!(hasDirectText(el) || MEDIA.has(el.tagName.toUpperCase()))) continue;
    if (!visible(el)) continue;
    const y = docY(el);
    if (content === null || y < content.y) content = { y, sel: sel(el), tag: el.tagName.toLowerCase() };
  }

  // ---- 2. y_repeat (browsable group) --------------------------------------
  const mainScope = [...main.querySelectorAll('*')].filter(el => !inChrome(el));
  const parents = new Set(mainScope.map(e => e.parentElement).filter(Boolean));
  if (main.parentElement) parents.add(main);
  let repeat = null;
  const allGroups = [];
  for (const p of parents) {
    if (inChrome(p)) continue;
    const groups = new Map();
    for (const c of p.children) {
      if (CHROME_SKIP_TAGS.has(c.tagName)) continue;
      const cls = (c.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).sort().join('.');
      const sig = c.tagName.toLowerCase() + (cls ? '.' + cls : '');
      if (!groups.has(sig)) groups.set(sig, []);
      groups.get(sig).push(c);
    }
    for (const [sig, members] of groups) {
      if (members.length < 3) continue;
      const tag = sig.split('.')[0].toUpperCase();
      if (TEXTFLOW.has(tag)) continue;
      const vis = members.filter(m => visible(m) && m.getBoundingClientRect().height >= 24);
      if (vis.length < 3) continue;
      const rich = vis.filter(m => m.matches(INTERACTIVE) || m.querySelector(INTERACTIVE) ||
                                   m.querySelector('img,video,canvas,svg,picture') ||
                                   (m.textContent || '').trim().length >= 20);
      if (rich.length * 2 < vis.length) continue;
      const y = Math.min(...vis.map(docY));
      allGroups.push({ y, sel: sel(p) + ' > ' + sig, n: vis.length });
      if (repeat === null || y < repeat.y)
        repeat = { y, sel: sel(p) + ' > ' + sig, n: vis.length };
    }
  }

  // ---- diagnostics: the biggest sibling signature considered, and why it lost
  const diag = [];
  for (const p of parents) {
    if (inChrome(p)) continue;
    const groups = new Map();
    for (const c of p.children) {
      if (CHROME_SKIP_TAGS.has(c.tagName)) continue;
      const cls = (c.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).sort().join('.');
      const sig = c.tagName.toLowerCase() + (cls ? '.' + cls : '');
      if (!groups.has(sig)) groups.set(sig, []); groups.get(sig).push(c);
    }
    for (const [sig, members] of groups) {
      if (members.length < 2) continue;
      const tag = sig.split('.')[0].toUpperCase();
      const vis = members.filter(m => visible(m));
      const tall = vis.filter(m => m.getBoundingClientRect().height >= 24);
      const rich = tall.filter(m => m.matches(INTERACTIVE) || m.querySelector(INTERACTIVE) || m.querySelector('img,video,canvas,svg,picture') || (m.textContent || '').trim().length >= 20);
      let why = 'OK';
      if (members.length < 3) why = 'n<3';
      else if (TEXTFLOW.has(tag)) why = 'textflow-tag';
      else if (vis.length < 3) why = 'invisible(' + vis.length + '/' + members.length + ')';
      else if (tall.length < 3) why = 'short(<24px)';
      else if (rich.length * 2 < tall.length) why = 'not-rich(' + rich.length + '/' + tall.length + ')';
      diag.push({ sig, n: members.length, why, parent: sel(p) });
    }
  }
  diag.sort((a, b) => b.n - a.n);

  // ---- 2b. y_main: the LARGEST browsable group -- the page's own index ------
  let mainGroup = null;
  for (const g of allGroups) {
    if (mainGroup === null || g.n > mainGroup.n || (g.n === mainGroup.n && g.y < mainGroup.y)) mainGroup = g;
  }

  // ---- 3. y_interact ------------------------------------------------------
  let interact = null;
  for (const el of main.querySelectorAll(INTERACTIVE)) {
    if (inChrome(el)) continue;
    if (el.closest('.page-hero, .skip-link')) continue;
    if (!visible(el)) continue;
    const y = docY(el);
    if (interact === null || y < interact.y) interact = { y, sel: sel(el) };
  }

  // ---- context scalars ----------------------------------------------------
  const hdr = document.querySelector('header.site-header');
  const hdrBottom = hdr ? Math.round(hdr.getBoundingClientRect().bottom + window.scrollY) : 0;
  let stickyBottom = 0;
  for (const r of chromeRoots) {
    const cs = getComputedStyle(r);
    if (cs.position !== 'sticky') continue;
    const rr = r.getBoundingClientRect();
    if (rr.height > 0) stickyBottom = Math.max(stickyBottom, Math.round(rr.bottom + window.scrollY));
  }
  if (content) content.inHero = !!(document.querySelector('.page-hero, .hdr, .cover') &&
      [...document.querySelectorAll('.page-hero, .hdr, .cover')].some(h => h.contains(
        document.querySelector(content.sel.split(' > ').pop()) || document.createElement('x'))));
  return {
    content, repeat, mainGroup, interact, groups: allGroups.length,
    diag: diag.slice(0, 4), offscreenRejects,
    hdrBottom, stickyBottom, opacityRejects,
    docH: Math.round(document.documentElement.scrollHeight),
    docW: Math.round(document.documentElement.scrollWidth),
    nodes: document.querySelectorAll('*').length,
    hasMain: !!document.querySelector('main'),
  };
};

(async () => {
  const pages = fs.readFileSync(LIST, 'utf8').split('\n').map(s => s.trim()).filter(Boolean).slice(FROM, FROM + COUNT);
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const rows = [];
  for (const vp of VIEWPORTS) {
    if (ONLY && vp.name !== ONLY) continue;
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dsf, isMobile: vp.isMobile, hasTouch: vp.hasTouch,
      userAgent: vp.isMobile
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
    });
    // Everything is fulfilled from the local tree; ANY other origin is aborted.
    // (K289 lost two minutes to hanging fonts.googleapis.com fetches, and this
    // container/VM cannot reach wuld.ink at all.)
    await ctx.route('**/*', (route) => {
      const u = new URL(route.request().url());
      if (u.host !== 'wuld.local') return route.abort();
      let rel = decodeURIComponent(u.pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      let file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT)) return route.abort();
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        return route.fulfill({ status: 404, contentType: 'text/plain', body: 'nf' });
      }
      return route.fulfill({ status: 200, contentType: MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
                             body: fs.readFileSync(file) });
    });
    const page = await ctx.newPage();
    for (const rel of pages) {
      const url = BASE + '/' + rel.replace(/index\.html$/, '');
      let r;
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 25000 });
        await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
        await page.waitForTimeout(500);
        r = await page.evaluate(MEASURE);
      } catch (e) {
        r = { error: String(e).slice(0, 160) };
      }
      rows.push({ page: '/' + rel.replace(/index\.html$/, ''), vp: vp.name, vh: vp.height, ...r });
      process.stdout.write('.');
    }
    await ctx.close();
    process.stdout.write(' [' + vp.name + ' done]\n');
  }
  await browser.close();
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));

  // ---- ranked markdown table, so the next run is a re-run and not a rebuild ----
  const by = {}; for (const x of rows) (by[x.page] = by[x.page] || {})[x.vp] = x;
  const F = x => (x && x.repeat) ? x.repeat.y : null;
  const M = x => (x && x.mainGroup) ? x.mainGroup.y : null;
  const list = Object.entries(by).map(([p, v]) => ({ p, ph: v.phone, de: v.desktop }))
                     .sort((a, b) => (F(b.ph) === null ? -1 : F(b.ph)) - (F(a.ph) === null ? -1 : F(a.ph)));
  const scr = (y, vh) => y === null ? '—' : (y / vh).toFixed(2);
  const md = [];
  md.push('| # | page | first px | first scr | payload px | payload scr | desktop first | dsk scr | docH | first-group selector |');
  md.push('|--:|---|--:|--:|--:|--:|--:|--:|--:|---|');
  list.forEach((x, i) => {
    const f = F(x.ph), m = M(x.ph), d = F(x.de);
    const selector = (x.ph.repeat && x.ph.repeat.sel) || (x.ph.content ? '_[no group; content]_ `' + x.ph.content.sel + '`' : '—');
    md.push('| ' + (i + 1) + ' | `' + x.p + '` | ' + (f === null ? '—' : f) + ' | **' + scr(f, 844) + '** | ' +
            (m === null ? '—' : m) + ' | ' + scr(m, 844) + ' | ' + (d === null ? '—' : d) + ' | ' + scr(d, 900) + ' | ' +
            x.ph.docH + ' | ' + (selector.startsWith('_') ? selector : '`' + selector + '`') + ' |');
  });
  const withF = list.filter(x => F(x.ph) !== null);
  const band = (lo, hi) => withF.filter(x => { const s = F(x.ph) / 844; return s >= lo && s < hi; }).length;
  md.push('');
  md.push('phone first-group  >=2.00 screens: ' + withF.filter(x => F(x.ph) / 844 >= 2).length +
          ' · 1.50-1.99: ' + band(1.5, 2) + ' · 1.00-1.49: ' + band(1, 1.5) + ' · <1.00: ' + band(0, 1) +
          ' · no group (prose/portal): ' + (list.length - withF.length) + ' of ' + list.length);
  md.push('spec-rule y_content, worst across all ' + list.length + ' pages: ' +
          Math.max(...list.map(x => x.ph.content ? x.ph.content.y : 0)) + ' px = ' +
          (Math.max(...list.map(x => x.ph.content ? x.ph.content.y : 0)) / 844).toFixed(2) + ' screens');
  fs.writeFileSync(OUT.replace(/\.json$/, '') + '-table.md', md.join('\n') + '\n');
  console.log('wrote ' + OUT + ' rows=' + rows.length + ' + ' + OUT.replace(/\.json$/, '') + '-table.md');
})();
