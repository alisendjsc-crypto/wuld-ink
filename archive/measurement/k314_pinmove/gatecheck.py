"""gatecheck.py -- the glow gate is measured from the ground, not the mode name. For every mode x tier:
bg luma, html.wz-lightbg, the stage's text-shadow (the glow), the bezel ::before box-shadow, the LED
glow, overflow at rest. Then reduced-motion and print."""
from hz import *
serve()
JS = """() => { const H=document.documentElement; const st=document.querySelector('.wz-stage'); const fr=document.querySelector('.wz-frame'); const led=document.querySelector('.wz-led');
  const p=s=>{const m=s&&s.match(/[\\d.]+/g); return m? m.map(Number):null};
  let luma=255; for (const el of [document.body, H]) { const c=p(getComputedStyle(el).backgroundColor); if(c&&c.length>=3&&!(c.length>3&&c[3]<0.5)) { luma=0.2126*c[0]+0.7152*c[1]+0.0722*c[2]; break; } }
  // the light-ground rule suppresses the glow on every DESCENDANT (html.wz-lightbg .wz-stage *), so read a text element, not the stage box
  const tx = document.querySelector('.wz-stage .trigger-text, .wz-stage h1, .wz-stage p');
  const glow = tx ? getComputedStyle(tx).textShadow : 'no-text';
  return { luma: +luma.toFixed(1), lightbg: H.classList.contains('wz-lightbg'), tierClass: H.className.trim(),
    glow: glow !== 'none' && glow !== '' , bezelShadow: fr ? (getComputedStyle(fr,'::before').boxShadow !== 'none') : null,
    frameVisible: fr ? fr.getClientRects().length>0 : null, ledGlow: led ? (getComputedStyle(led).boxShadow !== 'none' || getComputedStyle(led).textShadow !== 'none') : null,
    ledOpacity: led ? getComputedStyle(led).opacity : null, overflow: H.scrollWidth - H.clientWidth, chin: !!document.querySelector('.wz-chin'),
    hint: !!document.querySelector('.wz-hint') } }"""
with sync_playwright() as pw:
    br = browser(pw)
    print(f"{'mode':14s} {'tier':5s} {'luma':>6s} lightbg glow  bezel::before frame LED-glow LEDop overflow hint  expected")
    bad = 0
    for mode in ('standard', 'legible', 'high-contrast', 'both'):
        for tier in (2, 1, 0):
            ctx = context(br, mode=mode, tier=tier); page = open_page(ctx); page.mouse.move(720, 450); page.wait_for_timeout(700)
            r = page.evaluate(JS)
            want_glow = (tier == 2 and r['luma'] <= 90)
            want_lightbg = r['luma'] > 90
            ok = (r['glow'] == want_glow) and (r['lightbg'] == want_lightbg) and r['overflow'] == 0 and (tier == 0 or (r['bezelShadow'] and r['ledGlow']))
            bad += 0 if ok else 1
            print(f"{mode:14s} {tier:<5d} {r['luma']:6.1f} {str(r['lightbg']):7s} {str(r['glow']):5s} {str(r['bezelShadow']):13s} {str(r['frameVisible']):5s} {str(r['ledGlow']):8s} {str(r['ledOpacity']):5s} {r['overflow']:8d} {str(r['hint']):5s} glow={want_glow} {'OK' if ok else 'FAIL'}")
            ctx.close()
    # reduced motion: no camera pan, no tour, hint still allowed
    ctx = context(br, tier=2, reduced_motion='reduce', suppress_tour=False); page = open_page(ctx); page.mouse.move(5, 450); page.wait_for_timeout(600)
    print('reduced-motion: --wz-px after edge hover =', page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--wz-px').trim() || '(unset)'"), '| stage transform:', page.evaluate("getComputedStyle(document.querySelector('.wz-stage')).transform"), '| tour running:', page.evaluate("!!document.querySelector('.wz-tour-card')"))
    ctx.close()
    # print: nothing of the layer renders
    ctx = context(br, tier=2); page = open_page(ctx); page.emulate_media(media='print'); page.wait_for_timeout(300)
    print('print: layer boxes rendered =', page.evaluate("['.wz-frame','.wz-chin','.wz-vig','.wz-grille','.wz-fb','.wz-hint'].map(s => { const e=document.querySelector(s); return s+':'+(e? e.getClientRects().length : 'absent'); }).join(' ')"), '| stage padding:', page.evaluate("getComputedStyle(document.querySelector('.wz-stage')).paddingLeft"))
    ctx.close(); br.close()
    print('\nGATE MATRIX:', 'GREEN' if bad == 0 else f'RED ({bad} rows)')
