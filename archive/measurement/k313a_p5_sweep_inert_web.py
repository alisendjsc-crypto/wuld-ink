#!/usr/bin/env python3
"""
sweep_inert_web.py -- the web port of cccviii's inertness test.

  Render the thing twice, once with the treatment and once without, and diff.
  Identical output means inert, whatever the config says.

Three axes, OR'd toward `visible`, because each one alone is blind to a real effect:
  amplitude  -- alone it misses the bloom (few pixels, moved a long way)
  area       -- alone it suppresses the LEDs (41 px, the most legible thing in frame)
  stops      -- |log2(new/old)| on the changed region. The discriminator. Stops rather than a
                ratio because a ratio is one-directional: darkening tops out at 1.0 while
                brightening is unbounded, so any floor vetoes every darkening treatment.

A false `visible` costs a glance; a false `INERT` ships. That asymmetry is why the axes OR.

VACUITY GATE. A treatment whose selector matched nothing produces three confident zeros that read
as INERT. That is not a measurement, it is an empty room. Every run asserts the selector matched
and reports VACUOUS -- never INERT -- when it did not. This harness's own author shipped that bug
earlier today against `main#main`, which has zero descendants on this site.
"""
import argparse, json, math, os, sys
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

# Floors. Chosen, not inherited -- cccviii was committed deliberately without its constants.
AMP_FLOOR   = 2.0     # /255 max luma delta. Below this is antialiasing and encoder noise.
AREA_FLOOR  = 0.001   # 0.1% of pixels moved by >= AMP_FLOOR.
STOPS_FLOOR = 0.5     # half a stop. Separates LEDs (2.14) and a vignette (1.00) from bloom (0.08),
                      # which the OTHER two axes are there to catch.

DETERMINISM = """
  *, *::before, *::after {
    animation: none !important; transition: none !important;
    animation-duration: 0s !important; transition-duration: 0s !important;
    caret-color: transparent !important;
  }
  html { scroll-behavior: auto !important; }
"""

def luma(img):
    a = np.asarray(img.convert("RGB"), dtype=np.float64)
    return 0.2126*a[:,:,0] + 0.7152*a[:,:,1] + 0.0722*a[:,:,2]

def score(before_png, after_png):
    b, a = luma(Image.open(before_png)), luma(Image.open(after_png))
    if b.shape != a.shape:
        return {"error": "geometry changed: %s vs %s" % (b.shape, a.shape)}
    d = np.abs(a - b)
    amp = float(d.max())
    moved = d >= AMP_FLOOR
    area = float(moved.mean())
    if moved.sum() == 0:
        stops = 0.0
    else:
        eps = 1.0                       # keeps log2 finite at true black
        stops = float(np.abs(np.log2((a[moved]+eps) / (b[moved]+eps))).mean())
    return {"amplitude": round(amp,3), "area": round(area,6), "stops": round(stops,4),
            "px_moved": int(moved.sum()), "px_total": int(d.size)}

def verdict(s):
    if "error" in s: return "ERROR", []
    hits = []
    if s["amplitude"] >= AMP_FLOOR:   hits.append("amplitude")
    if s["area"]      >= AREA_FLOOR:  hits.append("area")
    if s["stops"]     >= STOPS_FLOOR: hits.append("stops")
    return ("visible" if hits else "INERT"), hits

def run(url, css, selector, scroll, w, h, tag, outdir):
    shots = {}
    with sync_playwright() as p:
        # NO PROXY, DELIBERATELY. The subject is served from 127.0.0.1, so the container's egress
        # proxy has nothing to do here -- and routing through it returns 405 and leaves the page at
        # ONE body node. Measured both ways rather than reasoned about: unproxied 6,121 body nodes,
        # proxied 1. External assets (Google Fonts, cdnjs d3) fail either way; see the scope note.
        br = p.chromium.launch(args=["--force-color-profile=srgb","--disable-lcd-text"])
        pg = br.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
        # Block every off-origin request. Google Fonts and cdnjs cannot be reached from this
        # container and each load spent seconds waiting to find that out -- time, and a source of
        # run-to-run variance in a test whose whole premise is that only the treatment differs.
        # DECLARED, NOT HIDDEN: the subject therefore renders in fallback fonts and without d3, so
        # results here are valid for the four scoped cosmetic items and NOT for the argument maps.
        pg.route("**/*", lambda r: r.abort() if "127.0.0.1" not in r.request.url else r.continue_())
        pg.goto(url, wait_until="domcontentloaded", timeout=120000)  # networkidle holds the tunnel open
        # SETTLE ON A STABLE DOM, NOT ON A CLOCK. This page builds itself in JS: at 1500 ms it has
        # ~30 nodes, at 2500 ms it has 6,133. A fixed wait made the BEFORE shot a half-built page and
        # the diff measured page load rather than the treatment -- caught by a same-value negative
        # control reading 99.93% area, which is what negative controls are for.
        # "Unchanged" is not "built": this page sits at 6 nodes for ~2 s before its JS runs, so a
        # stability test alone settles on the empty shell. Require growth past a floor FIRST.
        BUILD_FLOOR = 100
        prev, stable, built = -1, 0, False
        for _ in range(120):
            n = pg.evaluate("document.body ? document.body.querySelectorAll('*').length : 0")
            if n >= BUILD_FLOOR: built = True
            stable = stable + 1 if (built and n == prev) else 0
            prev = n
            if stable >= 3: break
            pg.wait_for_timeout(250)
        if not built:
            raise RuntimeError("DOM never exceeded %d body nodes (stuck at %d) -- refusing to measure "
                               "an unbuilt page" % (BUILD_FLOOR, prev))
        pg.add_style_tag(content=DETERMINISM)
        pg.evaluate("y => window.scrollTo(0, y)", scroll)
        pg.wait_for_timeout(400)
        matched = pg.evaluate("s => document.querySelectorAll(s).length", selector)
        # A THIRD VACUITY MODE. `matched` counts elements in the DOCUMENT; a treatment on 39 headings
        # none of which is on screen at this scroll changes nothing, and reporting that as INERT is
        # the exact misreading cccviii exists to prevent -- it is not "the treatment does nothing",
        # it is "the subject was not in the picture".
        in_view = pg.evaluate("""s => [...document.querySelectorAll(s)].filter(e => {
            const r = e.getBoundingClientRect();
            return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth
                   && r.width > 0 && r.height > 0; }).length""", selector)
        nodes_before = pg.evaluate("document.body.querySelectorAll('*').length")  # body only:
        # the treatment is injected as a <style> in <head>, and counting it would make every
        # run read INVALID by exactly one node -- a gate that always fires is worth as little
        # as one that never can.
        shots["before"] = "%s/%s_before.png" % (outdir, tag)
        pg.screenshot(path=shots["before"])
        pg.add_style_tag(content=css)
        pg.evaluate("y => window.scrollTo(0, y)", scroll)
        pg.wait_for_timeout(400)
        shots["after"] = "%s/%s_after.png" % (outdir, tag)
        pg.screenshot(path=shots["after"])
        nodes_after = pg.evaluate("document.body.querySelectorAll('*').length")
        br.close()
    s = score(shots["before"], shots["after"])
    v, hits = verdict(s)
    # Order matters: an INVALID run cannot be trusted to report vacuity either.
    if nodes_before != nodes_after:
        v, hits = "INVALID", ["DOM changed between shots: %d -> %d nodes" % (nodes_before, nodes_after)]
    elif matched == 0:
        v, hits = "VACUOUS", ["selector matched 0 elements -- nothing was treated"]
    elif in_view == 0 and v == "INERT":
        v, hits = "OUT-OF-FRAME", ["%d matched, 0 in viewport at this scroll -- not a null result" % matched]
    return {"tag": tag, "selector": selector, "matched": matched, "in_view": in_view,
            "nodes": nodes_before, "nodes_after": nodes_after,
            "verdict": v, "fired_on": hits, **s}

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True); ap.add_argument("--scroll", type=int, default=0)
    ap.add_argument("--width", type=int, default=1440); ap.add_argument("--height", type=int, default=900)
    ap.add_argument("--out", default="/home/claude/p5/shots")
    ap.add_argument("--case", action="append", default=[], help="tag::selector::css")
    a = ap.parse_args()
    import os; os.makedirs(a.out, exist_ok=True)
    rows = []
    for c in a.case:
        tag, sel, css = c.split("::", 2)
        rows.append(run(a.url, css, sel, a.scroll, a.width, a.height, tag, a.out))
    print("%-20s %7s %7s %8s %8s %7s  %-12s %s" % ("case","matched","inview","amp","area%","stops","verdict","fired on"))
    for r in rows:
        print("%-20s %7d %7d %8.2f %8.4f %7.3f  %-12s %s" %
              (r["tag"], r["matched"], r.get("in_view",-1), r.get("amplitude",-1), 100*r.get("area",0),
               r.get("stops",0), r["verdict"], ",".join(r["fired_on"]) or "-"))
    json.dump(rows, open(a.out+"/results.json","w"), indent=2)
