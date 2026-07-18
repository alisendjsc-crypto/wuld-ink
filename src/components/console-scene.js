/* console-scene.js -- the /console/ takeover surface (K249; scene layer K248).
   The terminal is a full-viewport overlay you ENTER -- the successor-stage
   move mirrored onto the console. Opening the takeover REPARENTS the live
   .con-term (console.js's node -- listeners, state, transcript intact) into a
   fixed overlay whose backdrop is the procedural scene: each room of the
   descent paints its own atmosphere -- palette from the room's tone, structure
   from the room's own title (a corridor converges, a stairwell goes down, a
   furnace grows pipework) -- derived from the SAME seed that built the room,
   so the same seed always paints the same place. Zero assets; the picture is
   code. Closing returns the terminal to the page and the cover renders as the
   plain K235 page. Pure spec generation (node-testable) is split from the
   canvas painter (browser-only); the spec is fingerprinted, the painter is
   not. The layer READS game state through the public window.wuldConsole hooks
   only -- it never mutates engine state, never calls a verb, never touches
   storage (the wgate's own cgate-open class on <html> is the unlock signal).
   Ambient motion runs on a modest tick only while the takeover is open and is
   fully static under prefers-reduced-motion (the room-state watcher still
   runs there: repainting a still frame on a room change is function, not
   motion). FICTION ONLY -- zero argument-library import, zero philosophical
   stance, ever. */
(function (root, factory) {
  "use strict";
  var PRNG = (typeof require === "function")
    ? require("./console-prng.js")
    : (typeof window !== "undefined" ? window.ConsolePRNG : null);
  var api = factory(PRNG);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof window !== "undefined") {
    window.ConsoleScene = api;
    if (typeof document !== "undefined") {
      var boot = function () { api._inst = api._attach(window, document); };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
      else boot();
    }
  }
})(typeof self !== "undefined" ? self : this, function (PRNG) {
  "use strict";

  var BASE_W = 480;                 // internal paint width (PS1-adjacent low res)
  var TICK_MS = 140;                // ambient tick, ~7fps -- grain / flicker / drift
  var WATCH_MS = 400;               // room-state watcher (functional; runs under reduced-motion too)

  // ---------------------------------------------------------------- palettes
  // Six tone palettes (room.tone is 0..5), all near-black washes -- the locked
  // red/black/ash register. `accent` appears only in traces (a glint, a gauge
  // needle, the descent's glow), never as a field colour. Floor is the darkest
  // band by construction: the glass terminal sits over the scene's lower half,
  // so the region behind the text is always at or below bg luminance.
  var PALETTES = [
    { name: "ash",   bg: [10, 10, 12],  wash: [42, 42, 46],  mid: [66, 66, 74],  fog: [88, 88, 96],   floor: [5, 5, 6], accent: [176, 60, 60] },
    { name: "rust",  bg: [13, 9, 7],    wash: [52, 34, 26],  mid: [80, 52, 38],  fog: [100, 68, 50],  floor: [6, 5, 4], accent: [196, 62, 42] },
    { name: "mould", bg: [8, 11, 9],    wash: [34, 45, 38],  mid: [52, 70, 58],  fog: [70, 88, 74],   floor: [4, 6, 5], accent: [110, 140, 96] },
    { name: "soot",  bg: [9, 9, 9],     wash: [32, 30, 30],  mid: [54, 50, 50],  fog: [76, 72, 70],   floor: [4, 4, 4], accent: [150, 120, 90] },
    { name: "bone",  bg: [11, 11, 13],  wash: [46, 46, 50],  mid: [76, 76, 84],  fog: [102, 102, 110], floor: [6, 6, 7], accent: [180, 174, 160] },
    { name: "blood", bg: [12, 8, 8],    wash: [46, 28, 30],  mid: [70, 38, 42],  fog: [94, 52, 58],   floor: [5, 4, 4], accent: [196, 30, 58] }
  ];

  var ARCHETYPES = ["threshold", "descent", "corridor", "stair", "vault", "machine", "rows", "stacks", "columns", "chairs"];

  // room title -> structural archetype (the engine's NOUN bank, classed)
  function archetypeFor(room) {
    var t = String((room && room.title) || "").toLowerCase();
    if (t === "threshold") return "threshold";
    if (t === "the descent") return "descent";
    if (/corridor|concourse/.test(t)) return "corridor";
    if (/stairwell/.test(t)) return "stair";
    if (/vault|cistern/.test(t)) return "vault";
    if (/boiler|furnace|substation|pump/.test(t)) return "machine";
    if (/ward|dormitory/.test(t)) return "rows";
    if (/archive|reading|sorting/.test(t)) return "stacks";
    if (/gallery|atrium/.test(t)) return "columns";
    if (/antechamber|waiting/.test(t)) return "chairs";
    return "corridor";
  }

  // ---------------------------------------------------------------- spec (pure)
  // sceneSpec(worldSeed, room) -> a plain deterministic object. Same inputs,
  // same bytes: the rng stream order below is FIXED -- append new draws at the
  // end only, or every shipped fingerprint moves.
  function sceneSpec(worldSeed, room) {
    var rng = PRNG.makeRng(String(worldSeed == null ? "" : worldSeed) + "::room" + (room ? room.id : "x") + "::scene");
    var arch = archetypeFor(room);
    var tone = (room && typeof room.tone === "number")
      ? ((room.tone % PALETTES.length) + PALETTES.length) % PALETTES.length : 0;
    if (arch === "descent") tone = 5;            // the terminus always reads blood
    if (arch === "threshold" && tone === 5) tone = 3;  // the start never does

    var horizon = 0.5 + rng.float() * 0.16;      // 0.50 .. 0.66
    var vanish = 0.32 + rng.float() * 0.36;      // 0.32 .. 0.68

    var fog = [];
    var nf = rng.range(2, 4);
    for (var i = 0; i < nf; i++) {
      fog.push({
        y: 0.16 + rng.float() * 0.5,
        h: 0.02 + rng.float() * 0.06,
        a: 0.04 + rng.float() * 0.07,
        sp: 0.3 + rng.float() * 0.7,
        ph: rng.float()
      });
    }

    var PROPS = ["bulb", "drain", "mirror", "clock", "coats", "tv", "pipe"];
    var props = [];
    var order = rng.shuffle(PROPS.slice());
    var np = rng.range(1, 3);
    for (var p = 0; p < np; p++) {
      props.push({ kind: order[p], x: 0.1 + rng.float() * 0.8, s: 0.6 + rng.float() * 0.8, ph: rng.float() });
    }

    return {
      v: 1,
      arch: arch,
      tone: tone,
      pal: PALETTES[tone].name,
      horizon: horizon,
      vanish: vanish,
      fog: fog,
      props: props,
      glint: (room && room.item) ? { x: 0.2 + rng.float() * 0.6, y: horizon + 0.06 + rng.float() * 0.1 } : null,
      grain: { density: 0.05 + rng.float() * 0.05, amp: 0.03 + rng.float() * 0.03 },
      scan: { period: rng.range(3, 4), a: 0.04 + rng.float() * 0.04 },
      vig: 0.5 + rng.float() * 0.25,
      flicker: 0.015 + rng.float() * 0.03,
      drift: 0.25 + rng.float() * 0.5,
      detail: rng.range(3, 7),
      gseed: rng.seed + "::g"
    };
  }

  // fingerprint(spec) -> 16 hex chars off the spec's exact JSON bytes (xmur3)
  function fingerprint(spec) {
    var h = PRNG.xmur3(JSON.stringify(spec));
    var a = h().toString(16), b = h().toString(16);
    return ("00000000" + a).slice(-8) + ("00000000" + b).slice(-8);
  }

  // ---------------------------------------------------------------- painter
  // paint(ctx, spec, frame, w, h) -- deterministic for a given (spec, frame):
  // ambient motion is just frame advancing; frame 0 is the static frame.
  function rgba(c, a) { return "rgba(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + "," + (a == null ? 1 : a) + ")"; }
  function scale(c, f) { return [Math.min(255, c[0] * f), Math.min(255, c[1] * f), Math.min(255, c[2] * f)]; }

  function paint(ctx, spec, frame, w, h) {
    var pal = PALETTES[spec.tone] || PALETTES[0];
    var fl = 1 + Math.sin(frame * 0.31) * spec.flicker * 6;   // faint luminance flicker
    var hy = spec.horizon * h * 0.74;   // painter-side lift: the structure sits in the open stage above the glass band
    var vx = spec.vanish * w;

    // base wash: bg above, wash at the horizon line, floor (darkest) below
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, rgba(scale(pal.bg, 0.85 * fl)));
    g.addColorStop(Math.max(0.02, spec.horizon * 0.74 - 0.1), rgba(scale(pal.wash, 0.75 * fl)));
    g.addColorStop(spec.horizon * 0.74, rgba(scale(pal.wash, fl)));
    g.addColorStop(Math.min(1, spec.horizon * 0.74 + 0.05), rgba(scale(pal.mid, 0.5 * fl)));
    g.addColorStop(1, rgba(scale(pal.floor, fl)));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    drawArch(ctx, spec, pal, frame, fl, w, h, hy, vx);

    // floor sheen: faint vertical streak under the vanishing point
    ctx.fillStyle = rgba(scale(pal.mid, fl), 0.1);
    ctx.fillRect(vx - w * 0.02, hy, w * 0.04, h - hy);

    // fog bands, drifting slowly sideways under motion
    for (var f = 0; f < spec.fog.length; f++) {
      var b = spec.fog[f];
      var by = b.y * h;
      ctx.fillStyle = rgba(scale(pal.fog, fl), b.a * 1.5);
      ctx.fillRect(0, by, w, b.h * h);
      var span = w + 160;
      var bx = ((b.ph * span) + frame * spec.drift * b.sp * 1.4) % span - 80;
      var grad = ctx.createLinearGradient(bx - 90, 0, bx + 90, 0);
      grad.addColorStop(0, rgba(pal.fog, 0));
      grad.addColorStop(0.5, rgba(scale(pal.fog, 1.25 * fl), b.a * 1.4));
      grad.addColorStop(1, rgba(pal.fog, 0));
      ctx.fillStyle = grad;
      ctx.fillRect(bx - 90, by, 180, b.h * h);
    }

    for (var p = 0; p < spec.props.length; p++) drawProp(ctx, spec.props[p], spec, pal, frame, fl, w, h, hy);

    // the item glint: a two-pixel accent trace, breathing
    if (spec.glint) {
      var ga = 0.35 + 0.3 * (0.5 + 0.5 * Math.sin(frame * 0.19));
      ctx.fillStyle = rgba(pal.accent, ga);
      ctx.fillRect(spec.glint.x * w, spec.glint.y * h, 2, 2);
      ctx.fillStyle = rgba(pal.accent, ga * 0.3);
      ctx.fillRect(spec.glint.x * w - 2, spec.glint.y * h - 2, 6, 6);
    }

    // vignette
    var vg = ctx.createRadialGradient(w / 2, h * 0.55, h * 0.22, w / 2, h * 0.55, w * 0.72);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, "rgba(0,0,0," + (spec.vig * 0.55) + ")");   // painter-side attenuation; spec.vig is fingerprinted
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);

    // film grain, seeded per frame -- deterministic even in motion
    var gr = PRNG.makeRng(spec.gseed + "#" + (frame % 89));
    var n = (w * h * spec.grain.density * 0.016) | 0;
    for (var i = 0; i < n; i++) {
      var gx = gr.int(w), gy = gr.int(h);
      ctx.fillStyle = gr.chance(0.5) ? "rgba(255,255,255," + spec.grain.amp + ")" : "rgba(0,0,0," + (spec.grain.amp * 1.4) + ")";
      ctx.fillRect(gx, gy, 1, 1);
    }

    // scanlines, rolling one pixel per frame under motion
    ctx.fillStyle = "rgba(0,0,0," + spec.scan.a + ")";
    for (var sy = (frame % spec.scan.period); sy < h; sy += spec.scan.period) ctx.fillRect(0, sy, w, 1);
  }

  // -- structural archetypes (silhouettes only; no text, no figures) ----------
  function drawArch(ctx, spec, pal, frame, fl, w, h, hy, vx) {
    var arng = PRNG.makeRng(spec.gseed + "::arch");   // frame-independent detail
    var mid = rgba(scale(pal.mid, fl), 0.75);
    var midSoft = rgba(scale(pal.mid, fl), 0.45);
    var dark = rgba(scale(pal.bg, 0.6), 0.85);
    var line = rgba(scale(pal.fog, fl), 0.42);
    var i, x, y, s;

    if (spec.arch === "corridor" || spec.arch === "threshold" || spec.arch === "descent") {
      // converging walls to a far wall around the vanishing point
      var fw = w * 0.16, fh = h * 0.2;
      var fx = vx - fw / 2, fy = hy - fh * 0.75;
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(fx, fy);
      ctx.moveTo(w, 0); ctx.lineTo(fx + fw, fy);
      ctx.moveTo(0, h); ctx.lineTo(fx, fy + fh);
      ctx.moveTo(w, h); ctx.lineTo(fx + fw, fy + fh);
      ctx.stroke();
      ctx.fillStyle = midSoft;
      ctx.fillRect(fx, fy, fw, fh);
      if (spec.arch === "threshold") {
        // the sealed way back: a bricked door, heavy lintel, no give in it
        var dw = fw * 0.5, dh = fh * 0.82, dx = vx - dw / 2, dy = fy + fh - dh;
        ctx.fillStyle = dark;
        ctx.fillRect(dx, dy, dw, dh);
        ctx.fillStyle = mid;
        ctx.fillRect(dx - dw * 0.14, dy - fh * 0.12, dw * 1.28, fh * 0.1);
        ctx.strokeStyle = line;
        for (i = 1; i < 5; i++) {
          y = dy + (dh / 5) * i;
          ctx.beginPath(); ctx.moveTo(dx, y); ctx.lineTo(dx + dw, y); ctx.stroke();
        }
      } else if (spec.arch === "descent") {
        // the shaft down: nested frames falling toward the floor, lit from below
        for (i = 0; i < spec.detail + 2; i++) {
          s = 1 - i / (spec.detail + 2);
          var rw = fw * (0.5 + s * 2.4), rh = fh * (0.4 + s * 2.2);
          ctx.strokeStyle = rgba(scale(pal.mid, fl), 0.16 + 0.3 * (1 - s));
          ctx.strokeRect(vx - rw / 2, hy + (h - hy) * (1 - s) * 0.72 - rh * 0.2, rw, rh);
        }
        var glow = ctx.createRadialGradient(vx, h * 0.96, 2, vx, h * 0.96, h * 0.4);
        glow.addColorStop(0, rgba(pal.accent, 0.28 + 0.05 * Math.sin(frame * 0.13)));
        glow.addColorStop(1, rgba(pal.accent, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(0, hy * 0.8, w, h - hy * 0.8);
      } else {
        // an open doorway in the far wall, darker than everything around it
        ctx.fillStyle = dark;
        ctx.fillRect(vx - fw * 0.14, fy + fh * 0.3, fw * 0.28, fh * 0.7);
      }
    } else if (spec.arch === "stair") {
      // a stairwell read from above: slabs stepping down toward the vanish
      for (i = 0; i < spec.detail + 3; i++) {
        s = i / (spec.detail + 3);
        var sw = w * (0.72 - s * 0.5), sh = (h - hy) * 0.12 * (1 - s * 0.6);
        x = vx - sw / 2; y = hy + (h - hy) * s * 0.85;
        ctx.fillStyle = rgba(scale(i % 2 ? pal.mid : pal.wash, fl), 0.3 - s * 0.12);
        ctx.fillRect(x, y, sw, sh);
      }
      ctx.strokeStyle = line;
      ctx.beginPath();
      ctx.moveTo(vx - w * 0.36, hy); ctx.lineTo(vx - w * 0.11, h);
      ctx.moveTo(vx + w * 0.36, hy); ctx.lineTo(vx + w * 0.11, h);
      ctx.stroke();
    } else if (spec.arch === "vault") {
      // a heavy arch with ribs; standing water sheen at the floor
      ctx.strokeStyle = mid;
      ctx.lineWidth = 2;
      for (i = 0; i < spec.detail; i++) {
        s = 0.36 + (i / spec.detail) * 0.5;
        ctx.beginPath();
        ctx.arc(vx, hy + h * 0.06, w * s * 0.42, Math.PI, Math.PI * 2);
        ctx.stroke();
      }
      ctx.lineWidth = 1;
      ctx.fillStyle = rgba(scale(pal.fog, fl), 0.08);
      ctx.fillRect(0, hy + (h - hy) * 0.55, w, (h - hy) * 0.12);
    } else if (spec.arch === "machine") {
      // pipework: vertical runs, one horizontal main, gauge dials
      for (i = 0; i < spec.detail + 2; i++) {
        x = w * (0.08 + 0.84 * (i / (spec.detail + 1)));
        var pw = 4 + arng.int(8);
        ctx.fillStyle = i % 2 ? mid : midSoft;
        ctx.fillRect(x, hy * (0.2 + arng.float() * 0.3), pw, h);
      }
      ctx.fillStyle = mid;
      ctx.fillRect(0, hy * 0.42, w, 5);
      for (i = 0; i < 2; i++) {
        x = w * (0.2 + arng.float() * 0.6); y = hy * (0.5 + arng.float() * 0.4); s = 5 + arng.int(6);
        ctx.strokeStyle = line;
        ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = rgba(pal.accent, 0.5);
        ctx.beginPath(); ctx.moveTo(x, y);
        var na = arng.float() * Math.PI * 2 + Math.sin(frame * 0.05) * 0.1;
        ctx.lineTo(x + Math.cos(na) * s * 0.8, y + Math.sin(na) * s * 0.8); ctx.stroke();
      }
    } else if (spec.arch === "rows") {
      // a ward: two receding rows of low cots
      for (i = 0; i < spec.detail + 2; i++) {
        s = i / (spec.detail + 2);
        var cw = w * 0.13 * (1 - s * 0.7), ch = h * 0.05 * (1 - s * 0.6);
        y = hy + (h - hy) * (0.16 + s * 0.6);
        ctx.fillStyle = rgba(scale(pal.mid, fl), 0.42 - s * 0.2);
        ctx.fillRect(vx - w * (0.34 - s * 0.16) - cw, y, cw, ch);
        ctx.fillRect(vx + w * (0.34 - s * 0.16), y, cw, ch);
      }
    } else if (spec.arch === "stacks") {
      // shelving: tall slabs flanking a center aisle
      for (i = 0; i < spec.detail + 1; i++) {
        s = i / (spec.detail + 1);
        var gap = w * (0.06 + s * 0.3);
        var sw2 = w * 0.05 * (1 - s * 0.5);
        var top = hy - (h - hy) * (0.85 - s * 0.4);
        ctx.fillStyle = rgba(scale(pal.mid, fl), 0.5 - s * 0.24);
        ctx.fillRect(vx - gap - sw2, top, sw2, h - top);
        ctx.fillRect(vx + gap, top, sw2, h - top);
        ctx.strokeStyle = line;
        for (var sh2 = 1; sh2 < 4; sh2++) {
          y = top + (h - top) * (sh2 / 4);
          ctx.beginPath(); ctx.moveTo(vx - gap - sw2, y); ctx.lineTo(vx - gap, y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(vx + gap, y); ctx.lineTo(vx + gap + sw2, y); ctx.stroke();
        }
      }
    } else if (spec.arch === "columns") {
      // a gallery: evenly-spaced columns with plain capitals
      for (i = 0; i <= spec.detail; i++) {
        x = w * (0.1 + 0.8 * (i / spec.detail));
        var colw = 8 + ((spec.detail - Math.abs(i - spec.detail / 2)) | 0);
        var top2 = hy - (h - hy) * 0.9;
        ctx.fillStyle = i % 2 ? mid : midSoft;
        ctx.fillRect(x - colw / 2, top2, colw, h - top2);
        ctx.fillRect(x - colw * 0.9, top2, colw * 1.8, 4);
      }
    } else if (spec.arch === "chairs") {
      // a waiting room: one row of empty chairs against the far wall
      var nch = spec.detail + 1;
      for (i = 0; i < nch; i++) {
        x = w * (0.14 + 0.72 * (i / (nch - 1 || 1)));
        y = hy + (h - hy) * 0.12; s = h * 0.055;
        ctx.fillStyle = mid;
        ctx.fillRect(x - s * 0.5, y - s * 1.4, s, s * 0.24);        // back
        ctx.fillRect(x - s * 0.5, y - s * 0.5, s, s * 0.2);         // seat
        ctx.fillRect(x - s * 0.5, y - s * 1.4, s * 0.16, s * 1.1);  // spine
        ctx.fillRect(x - s * 0.42, y - s * 0.3, s * 0.12, s * 0.5); // legs
        ctx.fillRect(x + s * 0.3, y - s * 0.3, s * 0.12, s * 0.5);
      }
    }
  }

  // -- small furniture (silhouettes; one or two per room) ---------------------
  function drawProp(ctx, prop, spec, pal, frame, fl, w, h, hy) {
    var x = prop.x * w, s = prop.s;
    var mid = rgba(scale(pal.mid, fl), 0.6);
    var line = rgba(scale(pal.fog, fl), 0.34);
    var y, r, i;
    if (prop.kind === "bulb") {
      // a single bulb on its cord; nothing moves the air -- it swings anyway
      var sw = Math.sin(frame * 0.08 + prop.ph * 6.28) * 7;
      var by = hy * (0.32 + prop.ph * 0.2);
      ctx.strokeStyle = line;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + sw, by); ctx.stroke();
      ctx.fillStyle = rgba(scale(pal.fog, 1.5 * fl), 0.8);
      ctx.fillRect(x + sw - 2 * s, by, 4 * s, 5 * s);
      var halo = ctx.createRadialGradient(x + sw, by + 2, 1, x + sw, by + 2, 26 * s);
      halo.addColorStop(0, rgba(scale(pal.fog, 1.4), 0.12));
      halo.addColorStop(1, rgba(pal.fog, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(x + sw - 30 * s, by - 26 * s, 60 * s, 60 * s);
    } else if (prop.kind === "drain") {
      y = hy + (h - hy) * (0.5 + prop.ph * 0.3); r = 4 * s;
      ctx.fillStyle = rgba(scale(pal.bg, 0.5), 0.9);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = line;
      ctx.beginPath(); ctx.arc(x, y, r + 2, 0, Math.PI * 2); ctx.stroke();
    } else if (prop.kind === "mirror") {
      y = hy - h * 0.16 * s;
      ctx.fillStyle = mid;
      ctx.fillRect(x - 7 * s, y, 14 * s, h * 0.16 * s + (hy - y));
      ctx.strokeStyle = line;
      ctx.strokeRect(x - 7 * s, y, 14 * s, h * 0.16 * s + (hy - y));
    } else if (prop.kind === "clock") {
      y = hy * (0.4 + prop.ph * 0.25); r = 7 * s;
      ctx.strokeStyle = line;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
      // no hands.
    } else if (prop.kind === "coats") {
      y = hy * 0.62;
      ctx.strokeStyle = line;
      ctx.beginPath(); ctx.moveTo(x - 22 * s, y); ctx.lineTo(x + 22 * s, y); ctx.stroke();
      for (i = -1; i <= 1; i++) {
        ctx.fillStyle = rgba(scale(pal.mid, fl), 0.5);
        ctx.fillRect(x + i * 14 * s - 3 * s, y, 6 * s, 13 * s);
      }
    } else if (prop.kind === "tv") {
      y = hy + (h - hy) * 0.12;
      ctx.fillStyle = mid;
      ctx.fillRect(x - 10 * s, y - 8 * s, 20 * s, 15 * s);
      // grey static, re-seeded per frame; for a moment it is a hallway
      var tv = PRNG.makeRng(spec.gseed + "::tv#" + (frame % 61));
      for (i = 0; i < 26; i++) {
        ctx.fillStyle = tv.chance(0.5) ? "rgba(210,210,210,0.16)" : "rgba(0,0,0,0.3)";
        ctx.fillRect(x - 8 * s + tv.int(16 * s | 0 || 1), y - 6 * s + tv.int(11 * s | 0 || 1), 1, 1);
      }
    } else if (prop.kind === "pipe") {
      y = hy * (0.2 + prop.ph * 0.3);
      ctx.fillStyle = rgba(scale(pal.mid, fl), 0.45);
      ctx.fillRect(0, y, w, 3 * s);
      ctx.fillRect(x, y, 4 * s, hy - y);
    }
  }

  // ---------------------------------------------------------------- browser attach
  // _attach(win, doc): K249 -- the takeover. Builds a fixed full-viewport
  // overlay inside [data-con-scene]; entering it REPARENTS the live .con-term
  // (same node -- console.js's listeners and state ride the move) into the
  // overlay and paints the scene full-bleed behind it; leaving moves the
  // terminal back into [data-console] and the page is the plain cover again.
  // Entry is automatic once the wgate curtain lifts: the unlock signal is the
  // gate's own cgate-open class on <html>, read from the DOM and observed
  // while the curtain is down -- this layer still touches no storage. Esc and
  // [ x ] leave; the cover's [ enter the console ] affordance re-enters.
  // Ticks run only while the takeover is open; under reduced-motion only the
  // room-state watcher ever registers and the overlay opens to a still frame.
  function _attach(win, doc) {
    if (!PRNG || !win || !doc) return null;
    var mount = doc.querySelector("[data-con-scene]");
    if (!mount) return null;

    var reduced = false;
    try { reduced = !!(win.matchMedia && win.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) {}

    // ---- overlay chrome (built once; closed until entered)
    try {
      mount.setAttribute("role", "dialog");
      mount.setAttribute("aria-modal", "true");
      mount.setAttribute("aria-label", "wuld://console -- the takeover terminal");
    } catch (e) {}
    var cvA = doc.createElement("canvas"), cvB = doc.createElement("canvas");
    cvA.setAttribute("aria-hidden", "true"); cvB.setAttribute("aria-hidden", "true");
    mount.appendChild(cvA); mount.appendChild(cvB);
    var closeBtn = doc.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "con-btn con-ovl-close";
    closeBtn.textContent = "[ x ]";
    try { closeBtn.setAttribute("aria-label", "leave the console (Escape)"); } catch (e) {}
    mount.appendChild(closeBtn);
    var slot = doc.createElement("div");
    slot.className = "con-ovl-slot";
    mount.appendChild(slot);

    // ---- the live terminal (console.js's node; found lazily, moved whole)
    var host = null, term = null;
    function findTerm() {
      if (term) return true;
      host = doc.querySelector("[data-console]");
      term = (host && host.querySelector) ? host.querySelector(".con-term") : null;
      return !!term;
    }
    function q(sel) { return (term && term.querySelector) ? term.querySelector(sel) : null; }

    // ---- the cover's enter affordance (static markup, unhidden + wired here)
    var enterBtn = null;
    (function () {
      var wrap = doc.querySelector("[data-con-enter]");
      if (!wrap) return;
      enterBtn = (wrap.querySelector && wrap.querySelector("button")) || wrap;
      wrap.hidden = false;
      if (enterBtn.addEventListener) enterBtn.addEventListener("click", function () { open(); });
    })();

    var live = null, back = cvA;
    var curSpec = null, lastKey = "", frame = 0;
    var isOpen = false, watchId = 0, animId = 0, mo = null;

    function sizeOf() {
      var iw = win.innerWidth || 1280, ih = win.innerHeight || 720;
      var cw = BASE_W;
      var ch = Math.max(180, Math.min(854, Math.round(cw * (ih / Math.max(1, iw)))));
      return { w: cw, h: ch };
    }
    function fit(cv) {
      var sz = sizeOf();
      if (cv.width !== sz.w) cv.width = sz.w;
      if (cv.height !== sz.h) cv.height = sz.h;
    }
    function ctxOf(cv) { try { return cv.getContext("2d"); } catch (e) { return null; } }
    function show(cv) {
      var other = (cv === cvA) ? cvB : cvA;
      cv.classList.add("con-scene-live");
      other.classList.remove("con-scene-live");
      live = cv; back = other;
    }
    function paintTo(cv, spec, fr) {
      fit(cv);
      var c = ctxOf(cv);
      if (c) paint(c, spec, fr, cv.width, cv.height);
    }
    function roomChanged(w, s) {
      var room = w.rooms[s.pos];
      if (!room) return;
      curSpec = sceneSpec(w.seed, room);
      frame = 0;
      paintTo(back, curSpec, 0);
      show(back);
    }
    function watch() {
      var api = win.wuldConsole;
      if (!api || !api._world || !api._state) return;
      var w, s;
      try { w = api._world(); s = api._state(); } catch (e) { return; }
      if (!w || !s || !w.rooms) return;
      var key = String(w.seed) + "#" + s.pos;
      if (key !== lastKey) { lastKey = key; roomChanged(w, s); }
    }
    function anim() {
      if (!curSpec || !live || doc.hidden) return;
      frame++;
      paintTo(live, curSpec, frame);
    }
    function onResize() { if (isOpen && curSpec && live) paintTo(live, curSpec, frame); }
    function startTicks() {
      if (!watchId) watchId = win.setInterval(watch, WATCH_MS);
      if (!reduced && !animId) animId = win.setInterval(anim, TICK_MS);
    }
    function stopTicks() {
      if (watchId) { try { win.clearInterval(watchId); } catch (e) {} watchId = 0; }
      if (animId) { try { win.clearInterval(animId); } catch (e) {} animId = 0; }
    }

    // ---- enter / leave
    function open() {
      if (isOpen) return false;
      if (!findTerm()) return false;
      var out = q(".con-out");
      var st = out ? out.scrollTop : 0;
      slot.appendChild(term);                      // the reparent IN -- same node, listeners intact
      mount.hidden = false;
      try { mount.removeAttribute("aria-hidden"); } catch (e) {}
      mount.classList.add("con-ovl-visible");
      try { doc.body.classList.add("con-takeover"); } catch (e) {}
      isOpen = true;
      if (out) out.scrollTop = st;                 // the move must not lose the transcript position
      startTicks();
      watch();                                     // paint the current room now
      if (curSpec && live) paintTo(live, curSpec, frame);   // refit after any closed-state resize
      var inp = q(".con-in");
      try { if (inp && inp.focus) inp.focus(); } catch (e) {}
      return true;
    }
    function close() {
      if (!isOpen) return false;
      stopTicks();
      var out = q(".con-out");
      var st = out ? out.scrollTop : 0;
      if (term && host) host.appendChild(term);    // the reparent OUT -- the cover terminal again
      if (out) out.scrollTop = st;
      mount.classList.remove("con-ovl-visible");
      mount.hidden = true;
      try { mount.setAttribute("aria-hidden", "true"); } catch (e) {}
      try { doc.body.classList.remove("con-takeover"); } catch (e) {}
      isOpen = false;
      try { if (enterBtn && enterBtn.focus) enterBtn.focus(); } catch (e) {}
      return true;
    }

    // ---- wiring
    if (closeBtn.addEventListener) closeBtn.addEventListener("click", function () { close(); });
    function onKey(ev) {
      if (!isOpen) return;
      var k = ev && (ev.key || ev.keyCode);
      if (k === "Escape" || k === "Esc" || k === 27) {
        if (ev.preventDefault) ev.preventDefault();
        close();
      }
    }
    function onOvlClick(ev) {
      if (!isOpen) return;
      var t = ev && ev.target;
      if (t && t.tagName && /^(BUTTON|INPUT|A|SELECT|TEXTAREA|LABEL)$/.test(String(t.tagName))) return;
      var inp = q(".con-in");
      try { if (inp && inp.focus) inp.focus(); } catch (e) {}
    }
    if (doc.addEventListener) doc.addEventListener("keydown", onKey);
    if (mount.addEventListener) mount.addEventListener("click", onOvlClick);
    if (win.addEventListener) win.addEventListener("resize", onResize);

    // ---- entry: the wgate's own unlock class IS the signal (no storage read)
    function unlockedNow() {
      try {
        var de = doc.documentElement;
        return !!(de && de.classList && de.classList.contains("cgate-open"));
      } catch (e) { return false; }
    }
    function bootOpen(tries) {
      if (isOpen) return;
      if (findTerm() || tries <= 0) { open(); return; }
      try { win.setTimeout(function () { bootOpen(tries - 1); }, 250); } catch (e) {}
    }
    function watchUnlock() {
      try {
        var de = doc.documentElement;
        var MO = win.MutationObserver;
        if (!de || !de.classList || !MO) return;
        mo = new MO(function () {
          if (unlockedNow()) {
            try { mo.disconnect(); } catch (e) {}
            if (!isOpen) bootOpen(24);
          }
        });
        mo.observe(de, { attributes: true, attributeFilter: ["class"] });
      } catch (e) {}
    }
    if (unlockedNow()) bootOpen(24);
    else watchUnlock();

    return {
      reduced: reduced,
      open: open,
      close: close,
      isOpen: function () { return isOpen; },
      off: function () {
        if (isOpen) close();
        stopTicks();
        try { if (mo) mo.disconnect(); } catch (e) {}
        try { if (doc.removeEventListener) doc.removeEventListener("keydown", onKey); } catch (e) {}
        try { if (win.removeEventListener) win.removeEventListener("resize", onResize); } catch (e) {}
        mount.hidden = true;
      },
      _key: function () { return lastKey; },
      _spec: function () { return curSpec; },
      _frame: function () { return frame; },
      _live: function () { return live; },
      _canvases: function () { return [cvA, cvB]; },
      _watch: watch,
      _anim: anim,
      _term: function () { return term; },
      _host: function () { return host; },
      _slot: function () { return slot; },
      _closeBtn: function () { return closeBtn; },
      _enterBtn: function () { return enterBtn; },
      _ticks: function () { return { watch: !!watchId, anim: !!animId }; }
    };
  }

  return {
    BASE_W: BASE_W, TICK_MS: TICK_MS, WATCH_MS: WATCH_MS,
    PALETTES: PALETTES, ARCHETYPES: ARCHETYPES,
    archetypeFor: archetypeFor, sceneSpec: sceneSpec, fingerprint: fingerprint,
    paint: paint, _attach: _attach
  };
});
