/* console-sigil.js — the SEEDED DESCENT-SIGIL for /console/ (K269).
   A seed string -> one deterministic monochrome mark, drawn from a FRESH
   console-prng stream on the same seed as the world. Same seed -> the same
   sigil, every run, on any device: so a shared descent link now carries the
   STRUCTURE and the MARK together — a link IS the world, made visible.

   PURE. Depends ONLY on console-prng.js — no DOM, no engine, no world graph,
   no external library. The seed is an opaque token: drawn only as numbers,
   never evaluated, never a storage key, never a stance token, and it never
   appears as text inside the output. FICTION ONLY — a spare bone-on-black
   ward, nothing more. */
(function (root, factory) {
  "use strict";
  var PRNG = (typeof require === "function")
    ? require("./console-prng.js")
    : (typeof window !== "undefined" ? window.ConsolePRNG : null);
  var api = factory(PRNG);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ConsoleSigil = api;
})(typeof self !== "undefined" ? self : this, function (PRNG) {
  "use strict";

  var SIZE = 120, C = 60, TAU = Math.PI * 2;
  var BONE = "#f0ebe5", BG = "#050506";   // scene tokens (--c-fg on the console black)

  // deterministic 2-decimal formatter — kills float noise so same seed -> same bytes
  function n(x) {
    var v = Math.round(x * 100) / 100;
    if (v === 0) v = 0;                    // normalise -0 -> 0
    return String(v);
  }
  function pt(x, y) { return n(x) + "," + n(y); }

  // makeStream(seed): a deterministic [0,1) source that NEVER throws, even with no PRNG.
  function makeStream(seed) {
    if (PRNG && PRNG.makeRng) { var r = PRNG.makeRng(seed == null ? "" : String(seed)); return function () { return r.float(); }; }
    var a = 0.3141592653;                  // fixed fallback (PRNG-absent contexts only)
    return function () { a = (a + 0.6180339887) % 1; return a; };
  }

  // ---- genSigil(seed) -> a deterministic drawing spec (pure data, no DOM) ----
  function genSigil(seed) {
    var f = makeStream(seed);
    function rint(lo, hi) { return lo + Math.floor(f() * (hi - lo + 1)); }

    var rOuter = 52;
    var rInner = 30 + Math.floor(f() * 8);           // 30..37
    var outerSides = f() < 0.42 ? 0 : rint(6, 12);   // 0 = circle, else regular polygon
    var rot = f() * TAU;                             // whole-figure rotation

    var spokes = rint(5, 9);
    var spokeAng = [];
    for (var i = 0; i < spokes; i++) spokeAng.push(rot + (i / spokes) * TAU);

    var teeth = [];                                  // ward teeth: outward ticks on a seeded subset
    for (var t = 0; t < spokes; t++) if (f() < 0.55) teeth.push(t);
    if (!teeth.length) teeth.push(0);                // always at least one tooth

    var skip = 0;                                    // star-chord skip (0 = no chords)
    if (spokes >= 5 && f() < 0.7) {
      var maxSkip = Math.max(2, Math.floor((spokes - 1) / 2));
      skip = rint(2, maxSkip);
      if (skip >= spokes) skip = 0;
    }

    var levels = rint(0, 2);                          // faint "floor" rings between inner and outer
    var coreKind = f() < 0.5 ? "chevron" : "diamond"; // core glyph — always points DOWN (the descent)
    var coreDepth = 10 + Math.floor(f() * 8);         // 10..17
    var coreWide = 7 + Math.floor(f() * 5);           // 7..11
    var markSpoke = rint(0, spokes - 1);              // a lone offset dot (the key's echo)
    var markR = rInner + (rOuter - rInner) * (0.4 + f() * 0.4);

    return {
      seed: seed == null ? "" : String(seed), size: SIZE, cx: C, cy: C,
      rOuter: rOuter, rInner: rInner, outerSides: outerSides, rot: rot,
      spokes: spokes, spokeAng: spokeAng, teeth: teeth, skip: skip, levels: levels,
      coreKind: coreKind, coreDepth: coreDepth, coreWide: coreWide,
      markSpoke: markSpoke, markR: markR
    };
  }

  // ---- geometry emitters ----
  function ringPath(cx, cy, r, sides, rot) {
    if (!sides) return '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '"/>';
    var pts = [];
    for (var i = 0; i < sides; i++) { var a = rot + (i / sides) * TAU; pts.push(pt(cx + Math.cos(a) * r, cy + Math.sin(a) * r)); }
    return '<polygon points="' + pts.join(" ") + '"/>';
  }
  function seg(x1, y1, x2, y2) {
    return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '"/>';
  }

  // ---- renderSVG(spec, opts) -> a deterministic, STATIC svg string ----
  //   opts.standalone = true bakes the bone colour + black ground (for a saved / shared file);
  //   inline (default) inherits currentColor from the console so it tracks the --c-fg token.
  function renderSVG(spec, opts) {
    opts = opts || {};
    var standalone = !!opts.standalone;
    var cx = spec.cx, cy = spec.cy, i, a;

    var dim = [];                                    // faint tier: floor rings + the key echo
    for (var L = 0; L < spec.levels; L++) {
      var rr = spec.rInner + (spec.rOuter - spec.rInner) * ((L + 1) / (spec.levels + 1));
      dim.push('<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(rr) + '"/>');
    }
    var ma = spec.spokeAng[spec.markSpoke];
    dim.push('<circle cx="' + n(cx + Math.cos(ma) * spec.markR) + '" cy="' + n(cy + Math.sin(ma) * spec.markR) + '" r="1.6"/>');

    var main = [];                                   // main tier
    main.push(ringPath(cx, cy, spec.rOuter, spec.outerSides, spec.rot));
    main.push(ringPath(cx, cy, spec.rInner, 0, spec.rot));
    for (i = 0; i < spec.spokes; i++) {              // spokes: inner ring -> outer ring
      a = spec.spokeAng[i];
      main.push(seg(cx + Math.cos(a) * spec.rInner, cy + Math.sin(a) * spec.rInner, cx + Math.cos(a) * spec.rOuter, cy + Math.sin(a) * spec.rOuter));
    }
    for (i = 0; i < spec.teeth.length; i++) {        // ward teeth
      a = spec.spokeAng[spec.teeth[i]];
      main.push(seg(cx + Math.cos(a) * spec.rOuter, cy + Math.sin(a) * spec.rOuter, cx + Math.cos(a) * (spec.rOuter + 6), cy + Math.sin(a) * (spec.rOuter + 6)));
    }
    if (spec.skip) {                                 // star chords across inner-ring points
      var order = [], idx = 0;
      for (i = 0; i <= spec.spokes; i++) { var aa = spec.spokeAng[idx % spec.spokes]; order.push(pt(cx + Math.cos(aa) * spec.rInner, cy + Math.sin(aa) * spec.rInner)); idx += spec.skip; }
      main.push('<polyline points="' + order.join(" ") + '"/>');
    }
    var d = spec.coreDepth, w = spec.coreWide;       // core descent glyph (points down)
    if (spec.coreKind === "chevron") {
      main.push('<polyline points="' + pt(cx - w, cy - d * 0.3) + " " + pt(cx, cy + d * 0.7) + " " + pt(cx + w, cy - d * 0.3) + '"/>');
      main.push('<polyline points="' + pt(cx - w, cy - d * 0.3 + 5) + " " + pt(cx, cy + d * 0.7 + 5) + " " + pt(cx + w, cy - d * 0.3 + 5) + '"/>');
    } else {
      main.push('<polygon points="' + pt(cx, cy - d * 0.5) + " " + pt(cx + w * 0.7, cy) + " " + pt(cx, cy + d * 0.7) + " " + pt(cx - w * 0.7, cy) + '"/>');
      main.push(seg(cx, cy + d * 0.7, cx, cy + d * 0.7 + 5));
    }

    // inline pins the bone token (with a hard fallback) so an ancestor colour reset can't hide the mark;
    // standalone bakes the literal bone + ground for a saved/shared file. Both render as a block box.
    var styleAttr = standalone
      ? ' style="display:block;color:' + BONE + ';background:' + BG + '"'
      : ' style="display:block;color:var(--c-fg, ' + BONE + ')"';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + spec.size + ' ' + spec.size + '" width="' + spec.size + '" height="' + spec.size + '" role="img" aria-label="descent sigil"' +
      styleAttr +
      ' fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round">';
    if (standalone) svg += '<rect x="0" y="0" width="' + spec.size + '" height="' + spec.size + '" fill="' + BG + '" stroke="none"/>';
    svg += '<g stroke-opacity="0.4">' + dim.join("") + '</g>';
    svg += '<g>' + main.join("") + '</g></svg>';
    return svg;
  }

  function svgFor(seed, opts) { return renderSVG(genSigil(seed), opts); }
  function toDataURL(seed, opts) {
    var o = { standalone: true }; if (opts) for (var k in opts) o[k] = opts[k]; o.standalone = true;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svgFor(seed, o));
  }

  // ---- asciiSigil(seed): the ultra-austere contender — a pure monospace seal ----
  //   Off its own '#ascii' stream so it can coexist with the SVG without sharing draws.
  function asciiSigil(seed) {
    var f = (function () {
      if (PRNG && PRNG.makeRng) { var r = PRNG.makeRng((seed == null ? "" : String(seed)) + "#ascii"); return function () { return r.float(); }; }
      var a = 0.271828; return function () { a = (a + 0.618) % 1; return a; };
    })();
    var N = 11, mid = (N - 1) / 2, g = [], x, y;
    for (y = 0; y < N; y++) { var row = []; for (x = 0; x < N; x++) row.push(" "); g.push(row); }
    for (var i = 0; i < N; i++) { g[0][i] = "─"; g[N - 1][i] = "─"; g[i][0] = "│"; g[i][N - 1] = "│"; }
    g[0][0] = "┌"; g[0][N - 1] = "┐"; g[N - 1][0] = "└"; g[N - 1][N - 1] = "┘";
    // 4-fold mirror so any seed reads as an intentional seal, not noise
    function place(dx, dy, ch) {
      var q = [[dx, dy], [-dx, dy], [dx, -dy], [-dx, -dy]];
      for (var qi = 0; qi < q.length; qi++) {
        var xx = mid + q[qi][0], yy = mid + q[qi][1];
        if (xx > 0 && xx < N - 1 && yy > 0 && yy < N - 1 && g[yy][xx] === " ") g[yy][xx] = ch;
      }
    }
    var arms = 2 + Math.floor(f() * 2);              // 2..3 mirrored arm angles (x4 = a full seal)
    for (var sp = 0; sp < arms; sp++) {
      var ang = (f() * 0.5 + sp * 0.4) * Math.PI * 0.5;   // first-quadrant angle; mirrored to 4
      var ch = f() < 0.4 ? "•" : "·";
      for (var rr = 2; rr <= mid - 1; rr++) place(Math.round(Math.cos(ang) * rr), Math.round(Math.sin(ang) * rr), ch);
    }
    if (f() < 0.6) place(mid - 1, 0, "•"), place(0, mid - 1, "•");  // seeded cardinal studs (mirrored)
    g[mid][mid] = "▼";                           // the descent, always at the core
    return g.map(function (r) { return r.join(""); }).join("\n");
  }

  return {
    genSigil: genSigil, renderSVG: renderSVG, svgFor: svgFor,
    toDataURL: toDataURL, asciiSigil: asciiSigil, SIZE: SIZE
  };
});
