"""fbcheck.py -- the per-card feedback control on the flagship's row shape, and on a wing (control)."""
import sys, json, urllib.parse
from hz import *
serve()
def heights(page):
    return page.evaluate("""() => ({doc: document.documentElement.scrollHeight, rows: [...document.querySelectorAll('#results .objection-header[id^=obj-], article.obj[id^=obj-]')].map(e => Math.round(e.getBoundingClientRect().height))})""")
with sync_playwright() as pw:
    br = browser(pw)
    for path, label in (('/combined.html', 'flagship'), ('/veganism/combined.html', 'wing (control)')):
        print(f"\n===== {label}")
        for mode in ('standard', 'high-contrast'):
            ctx = context(br, mode=mode, tier=2); page = open_page(ctx, path); page.wait_for_timeout(500)
            n_cards = page.evaluate("document.querySelectorAll('#results .objection-header[id^=obj-], article.obj[id^=obj-]').length")
            n_fb = page.evaluate("document.querySelectorAll('.wz-fb').length")
            n_marked = page.evaluate("document.querySelectorAll('[data-wz-fb]').length")
            info = page.evaluate("""() => { const a=document.querySelector('.wz-fb'); if(!a) return null; const r=a.getBoundingClientRect(); const card=a.closest('[data-wz-fb]');
                const icon=card.querySelector('.expand-icon'); const ir= icon? icon.getBoundingClientRect():null; const cs=getComputedStyle(a);
                const overlapIcon = ir ? !(r.right<=ir.left||r.left>=ir.right||r.bottom<=ir.top||r.top>=ir.bottom) : false;
                const lbl=card.querySelector('.category-label'); const lr=lbl?lbl.getBoundingClientRect():null;
                const overlapLbl = lr ? !(r.right<=lr.left||r.left>=lr.right||r.bottom<=lr.top||r.top>=lr.bottom) : false;
                return {w:Math.round(r.width), h:Math.round(r.height), color:cs.color, shadow:cs.textShadow, href:a.getAttribute('href').slice(0,60), overlapIcon, overlapLbl, text:a.textContent, ariaLabel:a.getAttribute('aria-label').slice(0,70)}; }""")
            print(f"  mode={mode:14s} cards={n_cards} controls={n_fb} marked={n_marked} first={json.dumps(info)}")
            # contrast of the control itself
            rows = [r for r in census(page, 3) if r['sel'].startswith('a.wz-fb')]
            print(f"     control contrast: n={len(rows)} min={min(r['ratio'] for r in rows) if rows else None} fg={rows[0]['fg'] if rows else None} on {rows[0]['bg'] if rows else None}")
            if label == 'flagship' and mode == 'standard':
                # the draft, decoded
                href = page.evaluate("document.querySelector('.wz-fb').getAttribute('href')")
                q = urllib.parse.parse_qs(href.split('?', 1)[1])
                print('     subject:', q['subject'][0]); print('     body   :', q['body'][0].replace('\n', ' | ')[:400]); print('     url len:', len(href))
                # click must NOT open the card; it must stay closed (no .open on the header)
                page.evaluate("(() => { const a=document.querySelector('.wz-fb'); a.addEventListener('click', e => e.preventDefault()); a.click(); })()"); page.wait_for_timeout(200)
                print('     after click: header.open =', page.evaluate("document.querySelector('[data-wz-fb]').classList.contains('open')"), '| detail open count =', page.evaluate("document.querySelectorAll('.detail-panel.open').length"))
                # keyboard: Tab reaches it
                page.evaluate("document.querySelector('.wz-fb').focus()"); print('     focusable:', page.evaluate("document.activeElement.className"))
            ctx.close()
        # layout cost: heights with the control vs with the injector disabled, at 4 widths
        print('  layout cost (doc height, rows changed) at 1440/768/390/320, with vs without the control:')
        for w in (1440, 768, 390, 320):
            hs = []
            for disable in (False, True):
                ctx = context(br, width=w, height=900, tier=2)
                if disable: ctx.add_init_script("Object.defineProperty(window, 'wzFbInit', { get(){ return function(){ return 0; }; }, set(){}, configurable:true });")
                page = open_page(ctx, path); page.wait_for_timeout(500); hs.append(heights(page))
                ov = page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
                ctx.close()
            with_, without = hs
            changed = sum(1 for a, b in zip(with_['rows'], without['rows']) if a != b)
            print(f"     {w:4d}px  doc {with_['doc']} vs {without['doc']} ({with_['doc']-without['doc']:+d})  rows changed {changed}/{len(with_['rows'])}  controls present: {'yes' if with_['rows'] else '?'}  overflow {ov}")
    br.close()
