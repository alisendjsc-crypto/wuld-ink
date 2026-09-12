#!/usr/bin/env python3
"""Assemble wuld_live_test.js from build/. The embedded copies must be BYTE-IDENTICAL to the
   build files; pack_verify.py proves that by reading them back out of a real page."""
import pathlib, hashlib
B=pathlib.Path("build"); OUT=pathlib.Path("/mnt/user-data/outputs/wuld_live_test.js")
def lit(s):                      # safe inside a JS template literal, still readable
    return s.replace("\\","\\\\").replace("`","\\`").replace("${","\\${")
typ=(B/"wuld-type.css").read_text()
bez=(B/"wuld-bezel.css").read_text(); vfx=(B/"wuld-vfx.css").read_text()
html=(B/"wuld-bezel.html").read_text()
# BOTH scripts, not just the visual one. The paste-in test shipped without the sound layer
# entirely -- and with a console notice telling the reader to click something to unlock audio
# that had no listener behind it. Caught by asking for the mute button; snipverify never would.
js=(B/"wuld-vfx.js").read_text() + "\n\n" + (B/"wuld-sfx.js").read_text() \
                                 + "\n\n" + (B/"wuld-fb.js").read_text() \
                                 + "\n\n" + (B/"wuld-tour.js").read_text()
HEADER = """/* ============================================================================
   WULD.INK presentation + cosmetic layer -- LIVE TEST
   Paste into the console on any library page (F12 -> Console). Works on the
   flagship /combined, on every wing, and on /troubleshooting/.
   Nothing is saved to the page; reload to remove it.

   THE POWER BUTTON DESCENDS:  vfx -> cosmetic -> off -> vfx
   It starts at vfx and remembers where you left it, per browser.
     Reset with:  localStorage.removeItem('wz-tier')

   THE MAGNIFIER:  hold SHIFT and scroll, or click the magnifier button in the
   chin. 1x to 4x, anchored to the pointer. Escape or the button returns to 1x.
   The phosphor grille is at zero opacity until you start zooming.

   WHAT IS ALWAYS ON (no tier, no JS needed on a real deploy): the palette and
   type scale. Every text colour clears WCAG AA on every ground, and the wings'
   sub-10px text is gone. Stepping the power button to off keeps those and
   removes only the cosmetics.

   THE GLOW FOLLOWS THE BACKGROUND, NOT THE MODE NAME. Live wherever the ground
   is dark -- standard, legible, high-contrast, both -- and silent on the cream
   grounds. The mode name does not predict which is which: the flagship is dark
   in legible and cream in high-contrast; the umbrella is the reverse.

   Tune live, no reload:
     var R = document.documentElement.style;
     R.setProperty('--wz-pan','3px');          // camera travel ('0px' disables)
     R.setProperty('--wz-glow-mix','65%');     // plain-text glow
     R.setProperty('--wz-tint','#FF8195');     // warm cast: LED rose .. #FFA85C
     R.setProperty('--wz-grille-max','.25');   // phosphor strength at full zoom
     R.setProperty('--wz-zoom-max','6');       // how far the magnifier goes
   ============================================================================ */
(function(){
  document.querySelectorAll('.wz-frame,.wz-chin,.wz-vig,.wz-grille,.wz-soft-l,.wz-soft-r,.wz-hint,#wz-css-t,#wz-css-b,#wz-css-v')
    .forEach(function(e){e.remove();});
  document.documentElement.classList.remove('wz-on','wz-vfx','wz-lightbg','wz-zoomed','wz-mag-on','wz-zooming');
  document.documentElement.style.setProperty('--wz-zoom','1');
  function style(id, txt){ var s=document.createElement('style'); s.id=id; s.textContent=txt;
                           document.head.appendChild(s); }
"""
body = ("  style('wz-css-t', `" + lit(typ) + "`);\n\n"
        "  style('wz-css-b', `" + lit(bez) + "`);\n\n"
        "  style('wz-css-v', `" + lit(vfx) + "`);\n\n"
        "  document.body.insertAdjacentHTML('beforeend', `" + lit(html) + "`);\n\n"
        + lit(js).replace("\\`","`").replace("\\\\","\\") + "\n\n"    # the JS is code, not a string
        "  window.wzInit();\n"
        # The same defect as inject() earlier this session: the layer was pasted in and never
        # initialised. snipverify passes without this because it only checks the visual layer,
        # so the miss is invisible until something asks for the mute button.
        "  if (window.wzSfxInit) window.wzSfxInit();\n"
        "  if (window.wzFbInit)  window.wzFbInit();\n"
        "  if (window.wzTourInit) window.wzTourInit();\n"
        "  console.log('%cWULD VFX loaded - power button bottom-right cycles off / cosmetic / vfx',\n"
        "              'color:#FF8195;font-weight:bold');\n"
        # The tour is once-ever per browser, so after the first paste it will not appear again --
        # which reads as "it broke" unless the way back in is stated where it is noticed.
        "  console.log('%cTOUR: runs once per browser. To see it again: wzTour()',\n"
        "              'color:#9aa7ff;font-weight:bold');\n"
        # The sounds are fetched from /sfx/, which does not exist on the live site until the
        # sfx deploy lands. Without this the page is simply silent, and the honest conclusion
        # -- 'the files are not deployed yet' -- is indistinguishable from 'the sound layer is
        # broken'. So the script says which one it is.
        "  fetch('/sfx/wz-click.ogg', {method:'HEAD'}).then(function(r){\n"
        "    if (r.ok) console.log('%cSFX: /sfx/ is present - click a card or summary to unlock audio',\n"
        "                          'color:#8ecf9a;font-weight:bold');\n"
        "    else throw 0;\n"
        "  }).catch(function(){\n"
        "    console.log('%cSFX: /sfx/ NOT on this host yet - the page will be silent. That is the\\n"
        "deploy not having landed, not the sound layer failing. Everything else on this script works.',\n"
        "                'color:#e8b24a;font-weight:bold');\n"
        "  });\n"
        "})();\n")
OUT.write_text(HEADER+body)
print("wrote %s  %d B  md5=%s" % (OUT, OUT.stat().st_size, hashlib.md5(OUT.read_bytes()).hexdigest()))
