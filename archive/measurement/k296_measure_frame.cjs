// K296 — box every block on /frame/ at phone + desktop, from a local copy of src/.
// Usage: node measure_frame.cjs <srcDir> <route> [label]
// Every request is fulfilled from <srcDir> via context.route; any other origin is aborted.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const SRC = path.resolve(process.argv[2] || 'src');
const ROUTE = process.argv[3] || '/frame/';
const LABEL = process.argv[4] || '';
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.txt': 'text/plain' };

function localPath(urlPath) {
  let p = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(SRC, p);
  if (!f.startsWith(SRC)) return null;
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  if (fs.existsSync(f + '/index.html')) return f + '/index.html';
  return null;
}

async function measure(vpName, vp, mobile) {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 3 : 1,
    userAgent: mobile ? 'Mozilla/5.0 (Linux; Android 13; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Mobile Safari/537.36' : undefined });
  await ctx.route('**/*', route => {
    const u = new URL(route.request().url());
    if (u.hostname !== 'wuld.ink') return route.abort();
    const f = localPath(u.pathname);
    if (!f) return route.fulfill({ status: 404, body: 'nf' });
    const ext = path.extname(f).toLowerCase();
    return route.fulfill({ status: 200, body: fs.readFileSync(f), headers: { 'content-type': MIME[ext] || 'application/octet-stream' } });
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('https://wuld.ink' + ROUTE, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(400);
  const data = await page.evaluate(() => {
    const sels = ['header.site-header', '.site-banner', '.mnav-bar', '.nav-toggle', '.site-nav', 'main#main', 'header.page-hero', 'header.page-hero .eyebrow', 'header.page-hero h1', 'p.lede',
      'section.frame-composition', 'section.frame-composition h2', 'section.frame-composition p:nth-of-type(1)', 'section.frame-composition p:nth-of-type(2)',
      'details.frame-fold', 'details.frame-fold > summary',
      'section.frame-section:nth-of-type(1)', 'section.frame-section:nth-of-type(2)', 'section.frame-section:nth-of-type(3)', 'section.frame-section:nth-of-type(4)',
      '.frame-onward', 'footer.page-footer', '.ambient-player'];
    const out = [];
    for (const s of sels) {
      const el = document.querySelector(s);
      if (!el) { out.push({ sel: s, missing: true }); continue; }
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out.push({ sel: s, y: Math.round(r.top + scrollY), h: Math.round(r.height), w: Math.round(r.width),
        display: cs.display, mt: cs.marginTop, mb: cs.marginBottom, pt: cs.paddingTop, pb: cs.paddingBottom, pos: cs.position });
    }
    // the first frame-section's y is the reach target; word counts of the pre-section text blocks
    const wc = (s) => { const el = document.querySelector(s); return el ? el.textContent.trim().split(/\s+/).length : null; };
    return { out, docH: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, vw: innerWidth, vh: innerHeight,
      words: { lede: wc('p.lede'), comp: wc('section.frame-composition'), s1: wc('section.frame-section:nth-of-type(1)') },
      details: [...document.querySelectorAll('details')].map(d => ({ cls: d.className, open: d.open })) };
  });
  await browser.close();
  return { vpName, errors, ...data };
}

(async () => {
  const phone = await measure('phone', { width: 390, height: 844 }, true);
  const desk = await measure('desktop', { width: 1280, height: 900 }, false);
  for (const m of [phone, desk]) {
    console.log(`\n=== ${LABEL} ${m.vpName} ${m.vw}x${m.vh}  docH=${m.docH} docW=${m.docW} errors=${m.errors.length} details=${JSON.stringify(m.details)}`);
    console.log(`words: lede=${m.words.lede} composition=${m.words.comp} section1=${m.words.s1}`);
    let prevBottom = null;
    for (const b of m.out) {
      if (b.missing) { console.log(`  ${b.sel.padEnd(46)} (absent)`); continue; }
      const gap = prevBottom === null ? '' : `gap-from-prev=${b.y - prevBottom}`;
      console.log(`  ${b.sel.padEnd(46)} y=${String(b.y).padStart(5)} h=${String(b.h).padStart(4)} w=${b.w} ${b.display.padEnd(7)} pos=${b.pos.padEnd(8)} mt=${b.mt} mb=${b.mb} pt=${b.pt} pb=${b.pb} ${gap}`);
      if (b.display !== 'none' && b.pos !== 'fixed' && b.pos !== 'sticky') prevBottom = b.y + b.h;
    }
    const s1 = m.out.find(b => b.sel === 'section.frame-section:nth-of-type(1)');
    if (s1 && !s1.missing) console.log(`  >>> first frame-section y=${s1.y} = ${(s1.y / m.vh).toFixed(2)} screens`);
  }
  if (phone.errors.length || desk.errors.length) { console.log('PAGE ERRORS', phone.errors, desk.errors); process.exit(2); }
})();
