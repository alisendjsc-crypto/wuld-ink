"""shots_readme_dep.py -- the README's dependency-graph capture from the v4.0.3 bytes: k316/shots.py's sequence for that one
picture (1440x900, sRGB, dark scheme, vfx tier, tour suppressed, unseeded, 2600 ms settle), then quantized to an 8-bit palette
like the repository's captures. usage: python shots_readme_dep.py --site DIR --out FILE"""
import sys, pathlib, argparse, hashlib
import hz
from hz import *
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument('--site', required=True); ap.add_argument('--out', required=True); args = ap.parse_args()
hz.SUPPRESS = hz.SUPPRESS + ";try{sessionStorage.setItem('wz-hint-seen','1')}catch(e){}"
serve(pathlib.Path(args.site))
with sync_playwright() as pw:
    br = browser(pw)
    ctx = context(br, tier=2, scheme='dark'); page = open_page(ctx, '/combined.html'); page.wait_for_timeout(900)
    page.mouse.move(720, 450); page.wait_for_timeout(400)
    page.click('#results .objection-header[id^=obj-] >> nth=1'); page.wait_for_timeout(500)
    page.evaluate("window.scrollTo(0,0)"); page.click('#vbtn-map'); page.wait_for_timeout(2600); page.mouse.move(720, 500); page.wait_for_timeout(400)
    page.click('#vbtn-dep'); page.wait_for_timeout(2600); page.mouse.move(720, 500); page.wait_for_timeout(400)
    tmp = pathlib.Path(args.out).with_suffix('.rgb.png'); page.screenshot(path=str(tmp))
    ctx.close(); br.close()
im = Image.open(tmp).convert('RGB').quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
im.save(args.out, optimize=True); tmp.unlink()
b = pathlib.Path(args.out).read_bytes(); print(args.out, len(b), 'B', hashlib.md5(b).hexdigest(), Image.open(args.out).mode)
