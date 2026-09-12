"""k318_edit.py -- the v4.0.3 edit to combined.html: the phone block, the graph-view fit, the SVG label fills.

usage: python k318_edit.py SRC DST [--no-fills] [--no-phone]
Every edit is an exact-once string replacement over the pin's bytes (the K314 aa_remap discipline): a search
text that matches zero or several times aborts before anything is written. The source must hash to the pin.
--no-fills / --no-phone build the two halves separately (the desktop-identity control wants the phone half alone)."""
import sys, hashlib, re, pathlib

PIN_MD5 = '62d1e8d86056465ebcb5daced38e0a83'
PIN_BYTES = 2974039
args = [a for a in sys.argv[1:] if not a.startswith('--')]
flags = set(a for a in sys.argv[1:] if a.startswith('--'))
SRC, DST = pathlib.Path(args[0]), pathlib.Path(args[1])
raw = SRC.read_bytes()
if hashlib.md5(raw).hexdigest() != PIN_MD5 or len(raw) != PIN_BYTES:
    sys.exit(f'ABORT: {SRC} is {hashlib.md5(raw).hexdigest()} / {len(raw)} B, not the pin {PIN_MD5} / {PIN_BYTES}')
s = raw.decode('utf-8')
assert '\r\n' not in s, 'CRLF in source'

edits = []   # (label, old, new)
def E(label, old, new): edits.append((label, old, new))

# ---------------------------------------------------------------------------------------------------------
# 1. SVG LABEL FILLS (TODO 17 / K314 follow-up). Values measured on the painted ground -- see census_svg.py.
#    dark ground #0a0a0a (map, dep) / #0f0f0f (flow): #88847c = the wings' --faint, 5.32 / 5.15
#    cream ground #eee8dd / #ede8df: #615b50 = the K314 cream grey, 5.52 / 5.51; #7a5c00 = the K314 mpk-c gold, 5.13
#    premise labels sit ON their family rect (fill-opacity .85): light text on six families, black on the mustard
#    (#b8860b -> rgb(158,115,11) dark / rgb(192,149,43) cream: white 4.26 / 2.78, black 4.90 / 7.60) and, on cream,
#    on characterization (#666 -> rgb(122,122,120): white 4.32, black 4.90).
# ---------------------------------------------------------------------------------------------------------
if '--no-fills' not in flags:
    E('dep obj label dark', ".dep-node-obj text {\n  font-family: 'IBM Plex Mono', monospace; font-size: 7px; fill: #555;",
                            ".dep-node-obj text {\n  font-family: 'IBM Plex Mono', monospace; font-size: 7px; fill: #88847c;")
    E('dep obj label cream', "&.high-contrast .dep-node-obj text { fill: #777; }", "&.high-contrast .dep-node-obj text { fill: #615b50; }")
    E('dep layer label dark', ".dep-layer-label {\n  font-family: 'IBM Plex Mono', monospace; font-size: 8px; fill: #333;",
                              ".dep-layer-label {\n  font-family: 'IBM Plex Mono', monospace; font-size: 8px; fill: #88847c;")
    E('dep layer label cream', "&.high-contrast .dep-layer-label { fill: #999; }", "&.high-contrast .dep-layer-label { fill: #615b50; }")
    E('dep layer label legible dark', 'body[data-active-view="library"].legible .dep-layer-label { font-size: 10px; fill: #555; }',
                                      'body[data-active-view="library"].legible .dep-layer-label { font-size: 10px; fill: #88847c; }')
    E('dep layer label legible cream', 'body[data-active-view="library"].legible.high-contrast .dep-layer-label { fill: #777; }',
                                       'body[data-active-view="library"].legible.high-contrast .dep-layer-label { fill: #615b50; }')
    E('map obj label dark', ".map-node-obj text {\n  font-family: 'IBM Plex Mono', monospace; font-size: 7.5px; fill: #666;",
                            ".map-node-obj text {\n  font-family: 'IBM Plex Mono', monospace; font-size: 7.5px; fill: #88847c;")
    E('map obj label cream', "&.high-contrast .map-node-obj text { fill: #888; }", "&.high-contrast .map-node-obj text { fill: #615b50; }")
    E('premise label cream + family rules',
      "&.high-contrast .dep-node-premise text { fill: #222; }",
      "&.high-contrast .dep-node-premise text { fill: #fff; }\n"
      "/* label ON the family rect (pin move v4.0.3): white reads on six families; the mustard takes black on both grounds, characterization on cream */\n"
      '.dep-node-premise[data-family="psychological"] text { fill: #000; }\n'
      '&.high-contrast .dep-node-premise[data-family="psychological"] text, &.high-contrast .dep-node-premise[data-family="characterization"] text { fill: #000; }')
    E('premise count label dark', ".dep-node-premise .dep-count-label {\n  font-size: 7.5px; fill: rgba(255,255,255,0.5); font-weight: 400;",
                                  ".dep-node-premise .dep-count-label {\n  font-size: 7.5px; fill: #e8e8e8; font-weight: 400;")
    E('premise count label cream', "&.high-contrast .dep-node-premise .dep-count-label { fill: rgba(0,0,0,0.4); }",
                                   "&.high-contrast .dep-node-premise .dep-count-label { fill: #fff; }")
    E('flow source/target badge cream', "&.high-contrast .m1-node-label-source { fill: #fff; }",
      "&.high-contrast .m1-node-label-source { fill: #1a1a1a; }\n&.high-contrast .m1-node-source .m1-node-label-source { fill: #fff; }")
    E('flow stars cream', "&.high-contrast .m1-stars-badge { fill: #b8860b; }", "&.high-contrast .m1-stars-badge { fill: #7a5c00; }")
    E('flow empty label class rules', ".m1-stars-badge { fill: #cc9900; font-family: 'IBM Plex Mono', monospace; font-size: 9px; pointer-events: none; }",
      ".m1-stars-badge { fill: #cc9900; font-family: 'IBM Plex Mono', monospace; font-size: 9px; pointer-events: none; }\n"
      ".m1-empty-label { fill: #88847c; font-family: 'IBM Plex Mono', monospace; font-size: 12px; }\n"
      "&.high-contrast .m1-empty-label { fill: #615b50; }")
    E('flow empty label js', ".attr('fill','#555').style('font-family','IBM Plex Mono, monospace').style('font-size','12px')",
                             ".attr('class','m1-empty-label')")
    E('premise data-family js', ".attr('class','dep-node-premise')\n", ".attr('class','dep-node-premise')\n    .attr('data-family', function(d) { return d.family; })\n")

# ---------------------------------------------------------------------------------------------------------
# 2. PHONE (<=600px): one media block at the end of the page's stylesheet + the graph canvases fit their drawing.
# ---------------------------------------------------------------------------------------------------------
PHONE_CSS = r"""
/* ===== PHONE LAYOUT (pin move v4.0.3, 2026-09-12). One block, <=600px: the shared top nav, the library view's
   control rows, the graph toolbars, the argument flow's three columns, the examples filter bar. Nothing here
   reaches 601px and up; the 1440x900 captures are the control. Measured on the v4.0.2 bytes at 390/360/430 wide:
   the library view overflowed the viewport by 149/179/110 px (the view switcher's fourth tab and the RSI
   METHODOLOGY button off-screen and unreachable), the graph views by 145/175/104, the argument flow by 369/399/328
   (a 320px | 1fr | 360px grid), the examples and coda by 43/73/3 (the top nav's mode toggle). Control-row buttons
   here are at least 36px tall. */
@media (max-width: 600px) {
  /* the shared top nav wraps when its five buttons do not fit, and scrolls away with the page: two sticky rows
     would hold 11% of a phone screen, and the wings' header scrolls too */
  body .top-nav { position: static; flex-wrap: wrap; gap: 8px 12px; padding: 8px 12px; }
  body .top-nav-view-btn, body .top-nav .mode-toggle button { min-height: 36px; }
  /* library: the four view tabs as a 2x2 grid (all four visible at 360 wide -- a scrolling strip would hide the
     fourth, which is the defect); the depth row wraps with its label on its own line */
  body[data-active-view="library"] .view-switcher { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px; }
  body[data-active-view="library"] .view-btn { padding: 10px 8px; letter-spacing: 1.5px; min-height: 40px; }
  body[data-active-view="library"] .view-btn:first-child, body[data-active-view="library"] .view-btn:nth-child(2) { border-right: 1px solid #333; }
  body[data-active-view="library"].high-contrast .view-btn:first-child, body[data-active-view="library"].high-contrast .view-btn:nth-child(2) { border-right-color: #bbb; }
  body[data-active-view="library"].legible .view-btn { padding: 12px 8px; letter-spacing: 1.5px; }
  body[data-active-view="library"] .filter-btn { min-height: 36px; }
  body[data-active-view="library"] .depth-controls { flex-wrap: wrap; row-gap: 8px; }
  body[data-active-view="library"] .depth-label { flex: 1 1 100%; margin-right: 0; }
  body[data-active-view="library"] .depth-btn, body[data-active-view="library"] .rsi-methodology-btn { min-height: 36px; }
  body[data-active-view="library"] .rsi-methodology-btn { margin-left: 0; }
  /* graph views: toolbars wrap, the zoom buttons grow to 36px; the canvas fit itself is in initMap / initDepGraph
     (a zoom transform to the drawing's bounding box, phone only) and the legends start closed */
  body[data-active-view="library"] #map-container, body[data-active-view="library"] #dep-container { height: 100vw; min-height: 320px; }
  body[data-active-view="library"] .map-toolbar { flex-wrap: wrap; }
  body[data-active-view="library"] .map-toolbar button { min-height: 36px; }
  body[data-active-view="library"] .map-controls button, body[data-active-view="library"] .dep-controls button { width: 36px; height: 36px; }
  body[data-active-view="library"] #map-search-input { width: min(280px, 70vw); }
  /* argument flow: the three columns stack, the source list keeps a short scroll, the canvas takes the height its
     viewBox gives it (m1RenderGraph sets the viewBox to the drawing's bounding box on a phone) and collapses while empty --
     it stays in layout, because the render measures the container's width */
  body[data-active-view="library"] .m1-layout { grid-template-columns: minmax(0, 1fr); min-height: 0; }
  body[data-active-view="library"] .m1-source-list { max-height: 280px; }
  body[data-active-view="library"] .m1-mode-group { flex-wrap: wrap; }
  body[data-active-view="library"] .m1-mode-btn, body[data-active-view="library"] .m1-methodology-btn, body[data-active-view="library"] .m1-search { min-height: 36px; }
  body[data-active-view="library"] .m1-search { min-width: 0; flex: 1 1 100%; }
  body[data-active-view="library"] .m1-methodology-btn { margin-left: 0; }
  body[data-active-view="library"] .m1-graph-container { min-height: 0; }
  body[data-active-view="library"] .m1-graph-container:has(#m1-graph:empty) { border-width: 0; }
  body[data-active-view="library"] #m1-graph { height: auto; }
  body[data-active-view="library"] #m1-graph:empty { height: 0; }
  /* in-card action chips (SHOW IN MAP, COPY, the plain toggle, the examples badge and pills, the notes toggle): 28px, above
     WCAG 2.2's 24px minimum; 36 would break the line rhythm inside a card's text */
  body .show-in-map-btn, body .show-in-dep-btn, body .copy-btn, body .plain-toggle, body .note-toggle, body .rwe-badge, body .archetype-pill { min-height: 28px; }
  /* examples: the filter bar as label | control rows with the reset on its own line; a field's long unbroken token wraps */
  body[data-active-view="rwe"] .filter-bar { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; }
  body[data-active-view="rwe"] .view-tabs { flex-wrap: wrap; }
  body[data-active-view="rwe"] .view-tabs button { white-space: nowrap; }
  body[data-active-view="rwe"] .filter-bar select, body[data-active-view="rwe"] .view-tabs button { min-height: 36px; }
  body[data-active-view="rwe"] .reset-btn { grid-column: 1 / -1; justify-self: end; margin-left: 0; min-height: 36px; }
  body[data-active-view="rwe"] .rwe-field .v { overflow-wrap: anywhere; }
}
"""

PHONE_JS_HELPERS = r"""
// ===== phone (<=600px): the graph canvases fit their drawing (pin move v4.0.3) =====
// The force layouts spread to the desktop canvas they were tuned for; at phone width the mechanism web is three
// screens wide and the argument flow's labels leave the SVG. On a phone the simulation is settled synchronously
// and the zoom transform set to the drawing's bounding box (pinch and drag continue from there); ZOOM FIT does the
// same. Nothing here runs at 601px and up.
function __wzPhone() { try { return window.matchMedia('(max-width: 600px)').matches; } catch (e) { return false; } }
function __wzFitGraph(svgSel, gSel, zoom, container, pad) {
  var bb; try { bb = gSel.node().getBBox(); } catch (e) { return false; }
  if (!bb || !bb.width || !bb.height) return false;
  var cw = container.clientWidth, ch = container.clientHeight; pad = pad || 16;
  var ext = zoom.scaleExtent();
  var s = Math.min((cw - 2 * pad) / bb.width, (ch - 2 * pad) / bb.height);
  s = Math.max(ext[0], Math.min(ext[1], s));
  svgSel.call(zoom.transform, d3.zoomIdentity.translate(cw / 2 - s * (bb.x + bb.width / 2), ch / 2 - s * (bb.y + bb.height / 2)).scale(s));
  return true;
}
function __wzSettle(sim) { var n = Math.ceil(Math.log(sim.alphaMin()) / Math.log(1 - sim.alphaDecay())); sim.stop(); sim.tick(n); }
"""

if '--no-phone' not in flags:
    # the media block: last thing inside the page's first stylesheet
    E('phone css block', "body.high-contrast .mpk-d { color: #ab3333; }\n</style>",
                         "body.high-contrast .mpk-d { color: #ab3333; }\n" + PHONE_CSS + "</style>")
    # helpers, placed with the view-switching hooks
    E('phone js helpers', "function __isGraphView(v) { return v === 'map' || v === 'dep' || v === 'map1'; }\n",
                          "function __isGraphView(v) { return v === 'map' || v === 'dep' || v === 'map1'; }\n" + PHONE_JS_HELPERS)
    # dependency graph: the K74 column layout is computed from the canvas size and overlaps its nine premise boxes
    # below ~1000px; on a phone it is laid out on the desktop canvas (1400x900) and fitted, so the boxes keep their room
    E('dep virtual canvas phone',
      "  var W = container.clientWidth, H = container.clientHeight;\n  var svg = d3.select('#dep-graph');\n",
      "  var W = container.clientWidth, H = container.clientHeight;\n"
      "  if (__wzPhone()) { W = Math.max(W, 1400); H = Math.max(H, 900); }   // phone: lay out on the desktop canvas, then fit\n"
      "  var svg = d3.select('#dep-graph');\n")
    # dependency graph: named tick, phone settle + fit + closed legend
    E('dep tick + phone init',
      "  // Tick\n  depSimulation.on('tick', function() {\n"
      "    depLinkSel\n      .attr('x1', function(d){return d.source.x;}).attr('y1', function(d){return d.source.y;})\n"
      "      .attr('x2', function(d){return d.target.x;}).attr('y2', function(d){return d.target.y;});\n"
      "    depPremSel.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });\n"
      "    depObjSel.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });\n"
      "  });\n\n  // Initial zoom to fit\n  setTimeout(function() {",
      "  // Tick\n  function depTick() {\n"
      "    depLinkSel\n      .attr('x1', function(d){return d.source.x;}).attr('y1', function(d){return d.source.y;})\n"
      "      .attr('x2', function(d){return d.target.x;}).attr('y2', function(d){return d.target.y;});\n"
      "    depPremSel.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });\n"
      "    depObjSel.attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });\n"
      "  }\n  depSimulation.on('tick', depTick);\n\n"
      "  // phone: settle now, fit the drawing, legend closed (it covers half the canvas at 390 wide)\n"
      "  if (__wzPhone()) { __wzSettle(depSimulation); depTick(); document.getElementById('dep-legend').classList.add('hidden'); depZoomFit(); return; }\n\n"
      "  // Initial zoom to fit\n  setTimeout(function() {")
    E('dep zoom fit phone',
      "function depZoomFit() {\n  var c = document.getElementById('dep-container');\n  var w = c.clientWidth, h = c.clientHeight;\n",
      "function depZoomFit() {\n  var c = document.getElementById('dep-container');\n  var w = c.clientWidth, h = c.clientHeight;\n"
      "  if (__wzPhone() && __wzFitGraph(d3.select('#dep-graph'), depSvgG, depZoom, c, 16)) return;\n")
    # mechanism web: named tick, phone settle + fit + closed legend
    E('map tick + phone init',
      "    .alphaDecay(0.015)\n    .on('tick', function() {\n"
      "      mapLinkSel.attr('x1',function(d){return d.source.x;}).attr('y1',function(d){return d.source.y;})\n"
      "        .attr('x2',function(d){return d.target.x;}).attr('y2',function(d){return d.target.y;});\n"
      "      mapMechSel.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';});\n"
      "      mapObjSel.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';});\n"
      "    });\n\n  svg.on('click', function() { mapReset(); });\n}\n",
      "    .alphaDecay(0.015)\n    .on('tick', mapTick);\n  function mapTick() {\n"
      "      mapLinkSel.attr('x1',function(d){return d.source.x;}).attr('y1',function(d){return d.source.y;})\n"
      "        .attr('x2',function(d){return d.target.x;}).attr('y2',function(d){return d.target.y;});\n"
      "      mapMechSel.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';});\n"
      "      mapObjSel.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';});\n"
      "  }\n\n  svg.on('click', function() { mapReset(); });\n"
      "  // phone: settle now, fit the drawing, legend closed (it covers half the canvas at 390 wide)\n"
      "  if (__wzPhone()) { __wzSettle(mapSimulation); mapTick(); document.getElementById('map-legend').classList.add('hidden'); mapZoomFit(); }\n}\n")
    E('map zoom fit phone',
      "function mapZoomFit() {\n  var c = document.getElementById('map-container');\n  var w = c.clientWidth, h = c.clientHeight;\n",
      "function mapZoomFit() {\n  var c = document.getElementById('map-container');\n  var w = c.clientWidth, h = c.clientHeight;\n"
      "  if (__wzPhone() && __wzFitGraph(d3.select('#map-graph'), mapSvgG, mapZoom, c, 16)) return;\n")
    # argument flow: viewBox to the drawing on a phone (the radial labels leave a 340px-wide canvas)
    E('flow viewBox phone',
      "      svg.append('text').attr('class','m1-stars-badge')\n        .attr('x', p.x).attr('y', p.y - 22).attr('text-anchor','middle').text(starStr);\n    }\n  });\n}\n",
      "      svg.append('text').attr('class','m1-stars-badge')\n        .attr('x', p.x).attr('y', p.y - 22).attr('text-anchor','middle').text(starStr);\n    }\n  });\n"
      "  // phone: the viewBox becomes the drawing's bounding box, so the labels around the ring stay on the canvas\n"
      "  if (__wzPhone()) { var bb = svg.node().getBBox(); if (bb && bb.width && bb.height) svg.attr('viewBox', (bb.x - 10) + ' ' + (bb.y - 10) + ' ' + (bb.width + 20) + ' ' + (bb.height + 20)); }\n}\n")

# ---- apply, exactly once each ------------------------------------------------------------------------------
out = s
for label, old, new in edits:
    n = out.count(old)
    if n != 1:
        sys.exit(f'ABORT: edit "{label}" matches {n} times, not once. Nothing written.')
    out = out.replace(old, new, 1)
DST.write_bytes(out.encode('utf-8'))
b = DST.read_bytes()
print(f'{len(edits)} edits applied -> {DST}  md5={hashlib.md5(b).hexdigest()}  bytes={len(b)}  (+{len(b)-PIN_BYTES})')
