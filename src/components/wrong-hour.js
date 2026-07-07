/*
  wrong-hour.js — synthesized SFX + VFX ("the wrong hour"), K207
  ---------------------------------------------------------------------------
  NO-PIN auto-deploying component. Progressive enhancement: with JS off there
  are zero effects and the page is byte-identical (homepage D1 invariant holds).

  ONE DIAL — the bleed. rot() (0..1) = user VFX intensity swelled by the clock:
  rot = vfx x (0.4 + 0.6 * bleedNow()). Drives colour / grain / aberration /
  vignette every tick, the interaction VFX one-shots, and (opt-in) the audio.
  Colour-only tint (mix-blend:color) holds LIGHTNESS. Grain is real canvas noise.
  Two laws (from Sfx.gd): synthesize never sample; the bleed never darkens to black.

  SFX = a synth CUE LIBRARY (default 0.35, gated behind the first gesture, muted at 0):
    boot / key / soft / click / bell / purr. K207: soft (nav) is a warm resonant
    pluck that walks a minor-pentatonic scale — consecutive nav clicks make a little
    melody. The synced-smart boot power-on (K206) is unchanged.

  AMBIANCE ENGINE (K207) — a generative synth BED that now LAYERS with the playlist
  instead of replacing it: an evolving mechanical whir/hum drone + sparse analog-piano
  motifs + faint breath. It is an INDEPENDENT layer — the toggle never pauses YouTube
  (K206 paused it, which flipped the bar to its disabled 'off' state; decoupled here).
  Bed is ON by default (prefs.bedOn). It rides the ambient volume knob and persists
  across navigation. If the YT track CHANGES (a skip), the bed auto-disables until the
  listener re-enables it — the opening track is paired; other tracks may clash. (Pair
  it by making that song playlist-track-1 + ambient-player's loop-one default.)

  VFX REGISTRY (K206) — interaction one-shots routed by type (nav->pulse, buttons->flick,
  typing->glitch + data-wh-vfx / data-wh-vfx-scene), peaks swelled by the same bleed,
  legibility-safe, off under prefers-reduced-motion.

  Controls dock into the ambient bar ([synth bed] + [fx] chips -> popover), persisted to
  localStorage 'wuld:wrongHour'. Audio coexists with the ambient-player (own first-gesture
  listener; never touches the YouTube unlock). prefers-reduced-motion -> motion off.
*/
(function () {
  "use strict";

  var STORAGE  = "wuld:wrongHour";
  var BOOT_KEY = "wuld:wrongHour.booted";
  var VERSION  = "K207";
  var DEFAULTS = { sfx: 0.35, vfx: 0.35, bedOn: true };
  var SCENES   = { frame: "bell", threshold: "bell", glossary: "bell", summon: "purr", power: "boot" };

  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  function noop() {}
  function clamp01(x) { x = +x; return isFinite(x) ? Math.max(0, Math.min(1, x)) : 0; }

  // ---------------- preferences ----------------
  function load() {
    try {
      var r = JSON.parse(localStorage.getItem(STORAGE));
      if (r && typeof r === "object") return {
        sfx: clamp01(r.sfx), vfx: clamp01(r.vfx),
        bedOn: (typeof r.bedOn === "boolean" ? r.bedOn : DEFAULTS.bedOn)
      };
    } catch (e) {}
    return { sfx: DEFAULTS.sfx, vfx: DEFAULTS.vfx, bedOn: DEFAULTS.bedOn };
  }
  var prefs = load();
  function save() { try { localStorage.setItem(STORAGE, JSON.stringify(prefs)); } catch (e) {} }

  // ---------------- time-of-day bleed (0..1), peaks ~3am ----------------
  function bleedNow() {
    var h;
    if (typeof window.__whHour === "number") h = window.__whHour;
    else { var d = new Date(); h = d.getHours() + d.getMinutes() / 60; }
    var dist = Math.abs(((h - 3 + 12 + 24) % 24) - 12);
    return clamp01(1 - dist / 9);
  }
  function rot() { return clamp01(prefs.vfx * (0.4 + 0.6 * bleedNow())); }
  function fxi() { return 0.4 + 0.6 * bleedNow(); }   // VFX one-shot swell (time only)
  function label(r) { return r < 0.04 ? "clear" : r < 0.34 ? "dusk" : r < 0.68 ? "the wrong hour" : "3am"; }

  // ---------------- VFX layers ----------------
  var layers = {}, bootEl = null, hourOut = null, fxEl = null;
  var grainFrames = [], grainIdx = 0, grainTimer = null;

  function makeNoise(size, density) {   // real film grain: sparse light/dark speckles on transparent
    var c = document.createElement("canvas"); c.width = c.height = size;
    var g = c.getContext("2d"); var img = g.createImageData(size, size), d = img.data, i;
    for (i = 0; i < d.length; i += 4) {
      if (Math.random() < density) {
        var bright = Math.random() < 0.62 ? 235 : 12;
        d[i] = d[i + 1] = d[i + 2] = bright;
        d[i + 3] = 70 + Math.random() * 165;
      } else { d[i + 3] = 0; }
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL();
  }
  function buildGrain() {
    var n = reduce ? 1 : 4, i;
    for (i = 0; i < n; i++) grainFrames.push(makeNoise(150, 0.5));
    layers.grain.style.backgroundImage = "url(" + grainFrames[0] + ")";
    if (!reduce && grainFrames.length > 1) {
      grainTimer = setInterval(function () {
        if (rot() <= 0.02) return;                 // invisible — skip the work
        grainIdx = (grainIdx + 1) % grainFrames.length;
        layers.grain.style.backgroundImage = "url(" + grainFrames[grainIdx] + ")";
      }, 90);
    }
  }

  function mk(cls) { var d = document.createElement("div"); d.className = "wh-layer " + cls; return d; }
  function buildVFX() {
    layers.tint = mk("wh-tint"); layers.grain = mk("wh-grain");
    layers.scan = mk("wh-scan"); layers.vignette = mk("wh-vignette");
    fxEl = mk("wh-fx");                                     // one-shot stage
    var f = document.createDocumentFragment();
    f.appendChild(layers.tint); f.appendChild(layers.grain);
    f.appendChild(layers.scan); f.appendChild(layers.vignette); f.appendChild(fxEl);
    document.body.appendChild(f);
    buildGrain();
    bootEl = document.createElement("div"); bootEl.className = "wh-boot";
    document.body.appendChild(bootEl);
  }
  function paint() {
    var r = rot(), s = document.documentElement.style;
    s.setProperty("--wh-rot", r.toFixed(3));
    s.setProperty("--wh-abr", (reduce ? 0 : r * 2.2).toFixed(2) + "px");
    if (hourOut) hourOut.textContent = label(r);
    maybeBell();
  }

  // ---------------- audio spine (synth-only) ----------------
  var actx = null, room = null, master = null, pending = [], armed = false;
  function ensureAudio() {
    if (actx) return actx;
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try { actx = new AC(); } catch (e) { return null; }
    master = actx.createGain(); master.gain.value = 0.9;
    var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 4200;
    var conv = actx.createConvolver(); conv.buffer = impulse(1.8, 2.6);  // the empty room (A8)
    var wet = actx.createGain(); wet.gain.value = 0.45;
    room = actx.createGain();
    room.connect(lp);                                       // dry
    room.connect(conv); conv.connect(wet); wet.connect(lp); // wet
    lp.connect(master); master.connect(actx.destination);
    return actx;
  }
  function noiseBuf(sec) {
    var n = Math.floor(actx.sampleRate * sec), b = actx.createBuffer(1, n, actx.sampleRate), d = b.getChannelData(0), i;
    for (i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function impulse(sec, decay) {
    var n = Math.floor(actx.sampleRate * sec), b = actx.createBuffer(2, n, actx.sampleRate), c, d, i;
    for (c = 0; c < 2; c++) { d = b.getChannelData(c); for (i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
    return b;
  }
  function crushCurve(bits) {          // A7 · bitcrush (amplitude quantize) via WaveShaper
    var n = 1024, c = new Float32Array(n), lv = Math.pow(2, bits), i, x;
    for (i = 0; i < n; i++) { x = (i / (n - 1)) * 2 - 1; c[i] = Math.round(x * lv) / lv; }
    return c;
  }
  function gate() { return prefs.sfx; }  // 0..1 SFX master; explicit amp overrides it
  var NAV_HZ = [220, 262, 294, 330, 392], navIdx = 0;   // A minor pentatonic (A C D E G) — nav pluck walk

  // ---- cues (synth-only). amp: undefined -> master gate; number -> forced ----
  function thunk(amp) {   // A3 · degauss whoomp (placeable)
    if (!ensureAudio() || actx.state !== "running") return;
    amp = (amp == null ? gate() : amp); if (amp <= 0) return;
    var t = actx.currentTime;
    var o = actx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.22);
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.9 * amp, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(g); g.connect(room); o.start(t); o.stop(t + 0.55);
    var ns = actx.createBufferSource(); ns.buffer = noiseBuf(0.25);
    var bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 120; bp.Q.value = 4;
    var ng = actx.createGain();
    ng.gain.setValueAtTime(0.5 * amp, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    ns.connect(bp); bp.connect(ng); ng.connect(room); ns.start(t); ns.stop(t + 0.25);
  }
  function bootSeq(amp) { // a computer waking — smooth, warm, ASMR (no clanky beep)
    if (!ensureAudio() || actx.state !== "running") return;
    amp = (amp == null ? gate() : amp); if (amp <= 0) return;
    var t = actx.currentTime;
    var sub = actx.createOscillator(); sub.type = "sine";                 // rounded sub-whoomp
    sub.frequency.setValueAtTime(90, t); sub.frequency.exponentialRampToValueAtTime(46, t + 0.7);
    var subg = actx.createGain();
    subg.gain.setValueAtTime(0.0001, t); subg.gain.linearRampToValueAtTime(0.62 * amp, t + 0.18); subg.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
    sub.connect(subg); subg.connect(room); sub.start(t); sub.stop(t + 1.5);
    var h1 = actx.createOscillator(); h1.type = "triangle"; h1.frequency.value = 60;   // warm mains hum
    var h2 = actx.createOscillator(); h2.type = "triangle"; h2.frequency.value = 90.4;
    var hlp = actx.createBiquadFilter(); hlp.type = "lowpass";
    hlp.frequency.setValueAtTime(120, t); hlp.frequency.linearRampToValueAtTime(600, t + 1.2);
    var hg = actx.createGain();
    hg.gain.setValueAtTime(0.0001, t); hg.gain.linearRampToValueAtTime(0.22 * amp, t + 0.9); hg.gain.linearRampToValueAtTime(0.0001, t + 2.2);
    h1.connect(hlp); h2.connect(hlp); hlp.connect(hg); hg.connect(room);
    h1.start(t); h2.start(t); h1.stop(t + 2.25); h2.stop(t + 2.25);
    var ns = actx.createBufferSource(); ns.buffer = noiseBuf(2.3);        // soft air (no buzz)
    var nlp = actx.createBiquadFilter(); nlp.type = "lowpass"; nlp.frequency.value = 900; nlp.Q.value = 0.5;
    var ng = actx.createGain();
    ng.gain.setValueAtTime(0.0001, t); ng.gain.linearRampToValueAtTime(0.08 * amp, t + 1.0); ng.gain.linearRampToValueAtTime(0.0001, t + 2.25);
    ns.connect(nlp); nlp.connect(ng); ng.connect(room); ns.start(t); ns.stop(t + 2.3);
    var sh = actx.createOscillator(); sh.type = "sine"; sh.frequency.value = 1560;    // breathing CRT shimmer
    var shg = actx.createGain();
    shg.gain.setValueAtTime(0.0001, t + 0.6); shg.gain.linearRampToValueAtTime(0.06 * amp, t + 1.3); shg.gain.exponentialRampToValueAtTime(0.0001, t + 2.1);
    sh.connect(shg); shg.connect(room); sh.start(t + 0.6); sh.stop(t + 2.15);
  }
  function key(amp) {    // mechanical thock — rounded body + soft click + variation
    if (!ensureAudio() || actx.state !== "running") return;
    amp = (amp == null ? gate() : amp); if (amp <= 0) return;
    var t = actx.currentTime, v = 0.85 + Math.random() * 0.3;
    var ns = actx.createBufferSource(); ns.buffer = noiseBuf(0.02);       // soft top-out click
    var bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1200 + Math.random() * 700; bp.Q.value = 0.7;
    var ng = actx.createGain();
    ng.gain.setValueAtTime(0.0001, t); ng.gain.linearRampToValueAtTime(0.28 * amp * v, t + 0.002); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);
    ns.connect(bp); bp.connect(ng); ng.connect(room); ns.start(t); ns.stop(t + 0.03);
    var o = actx.createOscillator(); o.type = "sine"; o.frequency.value = 120 + Math.random() * 55;   // rounded thock body
    var og = actx.createGain();
    og.gain.setValueAtTime(0.0001, t); og.gain.linearRampToValueAtTime(0.5 * amp * v, t + 0.004); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
    o.connect(og); og.connect(room); o.start(t); o.stop(t + 0.08);
    if (Math.random() < 0.12) {                                          // occasional soft spring
      var p = actx.createOscillator(); p.type = "sine"; p.frequency.value = 1400 + Math.random() * 500;
      var pg = actx.createGain();
      pg.gain.setValueAtTime(0.0001, t + 0.004); pg.gain.linearRampToValueAtTime(0.05 * amp, t + 0.01); pg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      p.connect(pg); pg.connect(room); p.start(t + 0.004); p.stop(t + 0.06);
    }
  }
  function soft(amp) {   // navigation (K207) — a warm resonant pluck, pentatonic, a little wistful
    if (!ensureAudio() || actx.state !== "running") return;
    amp = (amp == null ? gate() : amp); if (amp <= 0) return;
    var t = actx.currentTime;
    var hz = NAV_HZ[navIdx % NAV_HZ.length];
    navIdx = (navIdx + 1 + (Math.random() < 0.4 ? 1 : 0)) % NAV_HZ.length;   // walk up the scale, occasional skip
    var o = actx.createOscillator(); o.type = "triangle";                    // pluck body
    o.frequency.setValueAtTime(hz * 1.006, t); o.frequency.exponentialRampToValueAtTime(hz, t + 0.06);
    var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 6;  // resonant filter snaps closed
    lp.frequency.setValueAtTime(hz * 6, t); lp.frequency.exponentialRampToValueAtTime(hz * 1.5, t + 0.28);
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.26 * amp, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    o.connect(lp); lp.connect(g); g.connect(room); o.start(t); o.stop(t + 0.55);
    var sub = actx.createOscillator(); sub.type = "sine"; sub.frequency.value = hz / 2;   // sub-octave warmth
    var sg = actx.createGain();
    sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.12 * amp, t + 0.01); sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    sub.connect(sg); sg.connect(room); sub.start(t); sub.stop(t + 0.34);
    var sh = actx.createOscillator(); sh.type = "sine"; sh.frequency.value = hz * 2;       // faint octave-up shimmer
    var shg = actx.createGain();
    shg.gain.setValueAtTime(0.0001, t + 0.005); shg.gain.exponentialRampToValueAtTime(0.05 * amp, t + 0.02); shg.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    sh.connect(shg); shg.connect(room); sh.start(t + 0.005); sh.stop(t + 0.26);
  }
  function bell(amp) {    // A6 · inharmonic chime — bitcrushes as the room rots (A7)
    if (!ensureAudio() || actx.state !== "running") return;
    amp = (amp == null ? gate() : amp); if (amp <= 0) return;
    var t = actx.currentTime, base = 124, ratios = [1, 2.76, 5.40, 8.93], decays = [3.4, 2.7, 2.0, 1.4], i, r = rot(), dest = room;
    if (r > 0.25) { var ws = actx.createWaveShaper(); ws.curve = crushCurve(Math.max(3, 8 - Math.round(r * 5))); ws.connect(room); dest = ws; }
    for (i = 0; i < ratios.length; i++) {
      var o = actx.createOscillator(); o.type = "sine"; o.frequency.value = base * ratios[i];
      var g = actx.createGain(), peak = (0.5 / (i + 1)) * amp;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decays[i]);
      o.connect(g); g.connect(dest); o.start(t); o.stop(t + decays[i] + 0.1);
    }
  }
  function click(amp) {   // buttons — a soft tick with a small round body
    if (!ensureAudio() || actx.state !== "running") return;
    amp = (amp == null ? gate() : amp); if (amp <= 0) return;
    var t = actx.currentTime;
    var ns = actx.createBufferSource(); ns.buffer = noiseBuf(0.025);
    var bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1000 + Math.random() * 600; bp.Q.value = 0.8;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.3 * amp, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    ns.connect(bp); bp.connect(g); g.connect(room); ns.start(t); ns.stop(t + 0.04);
    var o = actx.createOscillator(); o.type = "sine"; o.frequency.value = 260;
    var og = actx.createGain();
    og.gain.setValueAtTime(0.0001, t); og.gain.linearRampToValueAtTime(0.14 * amp, t + 0.004); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(og); og.connect(room); o.start(t); o.stop(t + 0.06);
  }
  function purr(amp) {    // A5 · 55 Hz sub-bass throbbed by a 22 Hz LFO — headphone/felt only
    if (!ensureAudio() || actx.state !== "running") return;
    amp = (amp == null ? gate() : amp); if (amp <= 0) return;
    var t = actx.currentTime, dur = 2.2;
    var o = actx.createOscillator(); o.type = "sine"; o.frequency.value = 55;
    var lfo = actx.createOscillator(); lfo.type = "sine"; lfo.frequency.value = 22;
    var lg = actx.createGain(); lg.gain.value = 0.45 * amp;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.45 * amp, t + 0.3);
    g.gain.setValueAtTime(0.45 * amp, t + dur - 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lfo.connect(lg); lg.connect(g.gain);
    o.connect(g); g.connect(room);
    o.start(t); lfo.start(t); o.stop(t + dur); lfo.stop(t + dur);
  }

  var CUES = { boot: bootSeq, thunk: thunk, key: key, soft: soft, bell: bell, click: click, purr: purr };

  // ---------------- ambiance engine (K207): generative bed, an INDEPENDENT layer ----------------
  var ambNodes = null, ambNoise = null, ambPianoTimer = null, ambBreathTimer = null, ambBtns = [];
  var ambWatchTimer = null, ambBaseVid = null;
  var PIANO_HZ = [131, 147, 156, 175, 196, 208, 233, 262];   // C minor-ish set, C3..C4

  function ambNoiseLoop() { if (!ambNoise) ambNoise = noiseBuf(2.4); return ambNoise; }
  function ambLevel() {
    var v = 0.4;
    try { if (window.WuldAmbient && window.WuldAmbient.getState) { var s = window.WuldAmbient.getState(); if (s && typeof s.volume === "number") v = s.volume / 100; } } catch (e) {}
    return clamp01(v) * 0.5;                                  // ceiling: the bed sits under everything
  }
  function ambBuildDrone() {
    var t = actx.currentTime;
    var bed = actx.createGain(); bed.gain.value = 0.0001;    // bed master (fade + slow breath)
    var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 320; lp.Q.value = 6;
    var flfo = actx.createOscillator(); flfo.type = "sine"; flfo.frequency.value = 0.13;   // the whir
    var flfoG = actx.createGain(); flfoG.gain.value = 120;
    flfo.connect(flfoG); flfoG.connect(lp.frequency); flfo.start(t);
    var oscs = [], specs = [[50, "sine", 0.5], [100, "triangle", 0.26], [100.7, "triangle", 0.2], [150.5, "sine", 0.1]], i;
    for (i = 0; i < specs.length; i++) {
      var o = actx.createOscillator(); o.type = specs[i][1]; o.frequency.value = specs[i][0];
      var g = actx.createGain(); g.gain.value = specs[i][2];
      o.connect(g); g.connect(lp); o.start(t); oscs.push(o);
    }
    var ns = actx.createBufferSource(); ns.buffer = ambNoiseLoop(); ns.loop = true;         // faint high air
    var nbp = actx.createBiquadFilter(); nbp.type = "bandpass"; nbp.frequency.value = 2200; nbp.Q.value = 0.7;
    var ng = actx.createGain(); ng.gain.value = 0.015;
    ns.connect(nbp); nbp.connect(ng); ng.connect(lp);
    try { ns.start(t); } catch (e) {}
    lp.connect(bed);
    var alfo = actx.createOscillator(); alfo.type = "sine"; alfo.frequency.value = 0.06;    // slow breathing
    var alfoG = actx.createGain(); alfoG.gain.value = 0.035;
    alfo.connect(alfoG); alfoG.connect(bed.gain); alfo.start(t);
    bed.connect(room);
    ambNodes = { bed: bed, oscs: oscs, flfo: flfo, alfo: alfo, ns: ns };
  }
  function ambPiano(hz, t, amp) {                            // soft analog-piano-ish voice
    var parts = [[1, 1.0], [2, 0.26], [3.01, 0.1]], i;
    for (i = 0; i < parts.length; i++) {
      var o = actx.createOscillator(); o.type = "sine"; o.frequency.value = hz * parts[i][0];
      var g = actx.createGain(), peak = 0.12 * amp * parts[i][1];
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6 + Math.random() * 1.2);
      o.connect(g); g.connect(ambNodes.bed); o.start(t); o.stop(t + 4.2);
    }
  }
  function ambPianoNote() {
    if (!ambNodes || !actx || actx.state !== "running") return;
    var t = actx.currentTime, a = PIANO_HZ[(Math.random() * PIANO_HZ.length) | 0];
    ambPiano(a, t, 1);
    if (Math.random() < 0.34) {                              // occasional soft two-note fall
      var b = PIANO_HZ[(Math.random() * PIANO_HZ.length) | 0];
      ambPiano(b, t + 0.28 + Math.random() * 0.24, 0.62);
    }
  }
  function ambSchedulePiano() {
    clearTimeout(ambPianoTimer);
    ambPianoTimer = setTimeout(function () { ambPianoNote(); ambSchedulePiano(); }, 4200 + Math.random() * 7200);
  }
  function ambBreath() {                                     // faint breath / whisper swell
    if (!ambNodes || !actx || actx.state !== "running") return;
    var t = actx.currentTime;
    var ns = actx.createBufferSource(); ns.buffer = noiseBuf(2.4);
    var bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 520 + Math.random() * 260; bp.Q.value = 3.2;
    var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.9);           // inhale
    g.gain.linearRampToValueAtTime(0.0001, t + 2.2);         // exhale
    ns.connect(bp); bp.connect(lp); lp.connect(g); g.connect(ambNodes.bed);
    try { ns.start(t); ns.stop(t + 2.4); } catch (e) {}
  }
  function ambScheduleBreath() {
    clearTimeout(ambBreathTimer);
    ambBreathTimer = setTimeout(function () { ambBreath(); ambScheduleBreath(); }, 16000 + Math.random() * 26000);
  }
  function ambStart() {
    if (!ensureAudio() || actx.state !== "running") return;  // needs a gesture-resumed context
    if (ambNodes) return;
    ambBuildDrone();
    var t = actx.currentTime, lvl = ambLevel();
    ambNodes.bed.gain.cancelScheduledValues(t);
    ambNodes.bed.gain.setValueAtTime(0.0001, t);
    ambNodes.bed.gain.linearRampToValueAtTime(Math.max(0.0002, lvl), t + 3.5);   // slow fade-in
    ambSchedulePiano(); ambScheduleBreath();
  }
  function ambStop() {
    clearTimeout(ambPianoTimer); ambPianoTimer = null;
    clearTimeout(ambBreathTimer); ambBreathTimer = null;
    if (!ambNodes) return;
    var nodes = ambNodes; ambNodes = null;
    var t = actx ? actx.currentTime : 0;
    try {
      nodes.bed.gain.cancelScheduledValues(t);
      nodes.bed.gain.setValueAtTime(nodes.bed.gain.value, t);
      nodes.bed.gain.linearRampToValueAtTime(0.0001, t + 1.2);
    } catch (e) {}
    setTimeout(function () {
      try { for (var i = 0; i < nodes.oscs.length; i++) { try { nodes.oscs[i].stop(); } catch (e) {} } } catch (e) {}
      try { nodes.flfo.stop(); } catch (e) {}
      try { nodes.alfo.stop(); } catch (e) {}
      try { nodes.ns.stop(); } catch (e) {}
    }, 1400);
  }

  // ---- YT track-change watch: a skip off the paired opening track auto-disables the bed ----
  function ambCurrentVid() {
    try { if (window.WuldAmbient && window.WuldAmbient.getState) { var s = window.WuldAmbient.getState(); return s ? s.currentVideoId : null; } } catch (e) {}
    return null;
  }
  function ambStopWatch() { if (ambWatchTimer) { clearInterval(ambWatchTimer); ambWatchTimer = null; } }
  function ambStartWatch() {
    ambStopWatch(); ambBaseVid = null;
    ambWatchTimer = setInterval(function () {
      if (!prefs.bedOn) { ambStopWatch(); return; }
      var vid = ambCurrentVid();
      if (!vid) return;
      if (ambBaseVid == null) { ambBaseVid = vid; return; }   // baseline the opening track
      if (vid !== ambBaseVid) { ambSetBed(false); }           // skipped away -> auto-disable
    }, 2000);
  }

  // ---- bed on/off (independent — NEVER pauses YouTube) ----
  function ambSetBed(on) {
    on = !!on;
    prefs.bedOn = on; save(); ambSyncBtn();
    if (on) { whenReady(function () { ambStart(); }); ambStartWatch(); }
    else { ambStop(); ambStopWatch(); }
  }
  function ambToggleBed() { ambSetBed(!prefs.bedOn); }
  function ambSyncBtn() {
    var on = prefs.bedOn, i, b;
    for (i = 0; i < ambBtns.length; i++) {
      b = ambBtns[i];
      b.textContent = "[synth bed]";
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.setAttribute("aria-label", on ? "Synth bed on (tap to turn off)" : "Synth bed off (tap to turn on)");
    }
  }
  function ambInit() {
    if (prefs.bedOn) { whenReady(function () { ambStart(); }); ambStartWatch(); }
  }

  // ---------------- VFX registry (K206): interaction one-shots, swelled by the bleed ----------------
  var glTimer = null, FX_CLASSES = ["wh-fx--flick", "wh-fx--pulse", "wh-fx--burst", "wh-fx--roll", "wh-fx--bloom"];
  function fxFire(cls, ms) {
    if (!fxEl) return;
    fxEl.style.setProperty("--wh-fxi", fxi().toFixed(3));
    for (var i = 0; i < FX_CLASSES.length; i++) fxEl.classList.remove(FX_CLASSES[i]);  // one at a time
    void fxEl.offsetWidth;                                    // restart
    fxEl.classList.add(cls);
    clearTimeout(fxEl._t);
    fxEl._t = setTimeout(function () { fxEl.classList.remove(cls); }, ms);
  }
  function fxGlitch() {
    var h = document.documentElement;
    h.style.setProperty("--wh-gl", fxi().toFixed(3));
    h.classList.add("wh-glitch");
    clearTimeout(glTimer);
    glTimer = setTimeout(function () { h.classList.remove("wh-glitch"); }, 220);
  }
  var VFX = {
    flick:  function () { fxFire("wh-fx--flick", 200); },     // CRT brightness flick
    pulse:  function () { fxFire("wh-fx--pulse", 320); },     // accent tint pulse (lightness held)
    burst:  function () { fxFire("wh-fx--burst", 240); },     // grain / static burst
    roll:   function () { fxFire("wh-fx--roll", 380); },      // one scanline sweep
    bloom:  function () { fxFire("wh-fx--bloom", 460); },     // soft vignette breathe
    glitch: fxGlitch                                          // heading chromatic shiver
  };
  function whFx(name) {
    if (!name || name === "none" || prefs.vfx <= 0 || reduce) return;
    var fn = VFX[name]; if (fn) fn();
  }

  // ---------------- gesture-gated firing (coexists with ambient unlock) ----------------
  function flush() {
    if (!actx || actx.state !== "running") return;
    var q = pending.slice(); pending.length = 0;
    for (var i = 0; i < q.length; i++) { try { q[i](); } catch (e) {} }
  }
  function whenReady(fn) {
    if (!ensureAudio()) return;
    if (actx.state === "running") { fn(); return; }
    pending.push(fn);
    try { var p = actx.resume(); if (p && p.then) p.then(flush, noop); } catch (e) {}
    arm();
  }
  function arm() {
    if (armed) return; armed = true;
    var once = function () {
      window.removeEventListener("pointerdown", once);
      window.removeEventListener("keydown", once);
      armed = false;
      if (ensureAudio()) { var p; try { p = actx.resume(); } catch (e) {} if (p && p.then) p.then(flush, flush); else flush(); }
    };
    window.addEventListener("pointerdown", once, { once: true, passive: true });
    window.addEventListener("keydown", once, { once: true });
  }
  function play(name, amp) { var fn = CUES[name]; if (!fn) return; whenReady(function () { fn(amp); }); }

  // ---------------- boot cue + the 3am threshold bell (each once/session) ----------------
  var bootDone = false, bellDone = false;
  function boot() {                                           // synced-smart power-on (K206)
    if (bootDone) return; bootDone = true;
    try { if (sessionStorage.getItem(BOOT_KEY)) return; } catch (e) {}
    var mark  = function () { try { sessionStorage.setItem(BOOT_KEY, "1"); } catch (e) {} };
    var flash = function () { if (prefs.vfx > 0 && !reduce && bootEl) { void bootEl.offsetWidth; bootEl.classList.add("wh-boot--go"); } };
    if (prefs.sfx > 0 && ensureAudio()) {                     // hold the flash to land WITH the sound
      whenReady(function () { mark(); flash(); bootSeq(); });
    } else {                                                  // muted / no audio -> flash on open
      mark(); flash();
    }
  }
  // one chime the first time the CLOCK crosses into deep night — bleedNow() >= 0.85 ~ 1:40am..4:20am.
  function maybeBell() {
    if (bellDone || prefs.sfx <= 0) return;
    if (bleedNow() >= 0.85) { bellDone = true; whenReady(function () { bell(); }); }
  }

  // ---------------- placement: default + declarative + per-scene + typing ----------------
  function isEditable(el) {
    if (!el) return false;
    var tag = (el.tagName || "").toLowerCase();
    if (tag === "textarea") return true;
    if (el.isContentEditable) return true;
    if (tag === "input") return /^(text|search|email|url|tel|password|number|)$/.test((el.type || "").toLowerCase());
    return false;
  }
  function wirePlacements() {
    document.addEventListener("pointerdown", function (e) {   // fires before navigation
      if (!e.target || !e.target.closest) return;
      var el = e.target;
      var dS = el.closest("[data-wh]"), dV = el.closest("[data-wh-vfx]");
      var muted = dS && dS.getAttribute("data-wh") === "none";
      var nav = el.closest("nav a[href], .nav a[href], header a[href], .site-nav a[href]");
      var btn = el.closest("button");
      if (prefs.sfx > 0) {                                    // sound router
        if (dS) play(dS.getAttribute("data-wh"));
        else if (nav) play("soft");
        else if (btn) play("click");
      }
      if (prefs.vfx > 0 && !reduce) {                         // VFX router (parallel)
        if (dV) whFx(dV.getAttribute("data-wh-vfx"));
        else if (muted) return;                              // data-wh="none" mutes both
        else if (nav) whFx("pulse");
        else if (btn) whFx("flick");
      }
    }, true);
    document.addEventListener("keydown", function (e) {       // mechanical key per keystroke
      if (!isEditable(e.target)) return;
      var k = e.key;
      if (!(k && (k.length === 1 || k === "Backspace" || k === "Enter" || k === "Spacebar" || k === " "))) return;
      if (prefs.sfx > 0) play("key");
      if (prefs.vfx > 0 && !reduce) whFx("glitch");           // headings shiver while you type
    }, true);
    if (document.querySelector("[data-wh-hover]")) {
      document.addEventListener("pointerover", function (e) {
        if (prefs.sfx <= 0 || !e.target || !e.target.closest) return;
        var h = e.target.closest("[data-wh-hover]"); if (h) play(h.getAttribute("data-wh-hover"));
      }, true);
    }
    var scene = document.body.getAttribute("data-wh-scene");
    if (scene && SCENES[scene]) play(SCENES[scene]);
    var vscene = document.body.getAttribute("data-wh-vfx-scene");
    if (vscene && prefs.vfx > 0 && !reduce) whFx(vscene);
  }

  // ---------------- controls: [synth bed] + [fx] chips in the ambient bar + popover ----------------
  function pct(x) { return Math.round(x * 100); }
  function barBtn(cls, txt, aria) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "ambient-btn ambient-toggle " + cls;
    b.textContent = txt; b.setAttribute("aria-label", aria); b.setAttribute("data-wh", "none");
    return b;
  }
  function buildUI() {
    var panel = document.createElement("div");
    panel.className = "wh-panel";
    panel.setAttribute("data-open", "false");
    panel.setAttribute("aria-label", "The wrong hour - effects");
    panel.innerHTML =
      '<div class="wh-head"><span>the wrong hour</span><span class="wh-hour" id="wh-hour">clear</span></div>' +
      '<div class="wh-row"><label for="wh-vfx">rot</label>' +
        '<input class="wh-range" id="wh-vfx" type="range" min="0" max="100" step="5" aria-label="Visual intensity">' +
        '<span class="wh-val" id="wh-vfx-val">0%</span></div>' +
      '<div class="wh-row"><label for="wh-sfx">sound</label>' +
        '<input class="wh-range" id="wh-sfx" type="range" min="0" max="100" step="5" aria-label="Sound intensity">' +
        '<span class="wh-val" id="wh-sfx-val">off</span></div>' +
      '<div class="wh-row"><label>bed</label>' +
        '<button class="ambient-btn wh-amb" id="wh-amb" type="button" data-wh="none" aria-pressed="false">[synth bed]</button>' +
        '<span class="wh-val"></span></div>' +
      '<div class="wh-row"><button class="ambient-btn wh-test" id="wh-test" type="button" data-wh="none">[ hear it ]</button></div>' +
      '<p class="wh-note">Synthesized, never sampled — sound needs one click to wake, then rides at your level. Effects answer clicks + typing and deepen toward 3am. <b>bed</b> layers a generative synth room over the playlist; a skip turns it off. Reduced-motion holds visuals steady.</p>';
    document.body.appendChild(panel);
    hourOut = panel.querySelector("#wh-hour");

    var vfx = panel.querySelector("#wh-vfx"), sfx = panel.querySelector("#wh-sfx");
    var vfxV = panel.querySelector("#wh-vfx-val"), sfxV = panel.querySelector("#wh-sfx-val");
    vfx.value = pct(prefs.vfx); sfx.value = pct(prefs.sfx);
    vfxV.textContent = pct(prefs.vfx) + "%";
    sfxV.textContent = prefs.sfx > 0 ? pct(prefs.sfx) + "%" : "off";

    vfx.addEventListener("input", function () {
      prefs.vfx = clamp01(vfx.value / 100); vfxV.textContent = pct(prefs.vfx) + "%"; save(); paint();
    });
    sfx.addEventListener("input", function () {
      var was = prefs.sfx; prefs.sfx = clamp01(sfx.value / 100);
      sfxV.textContent = prefs.sfx > 0 ? pct(prefs.sfx) + "%" : "off"; save();
      if (prefs.sfx > 0 && was <= 0 && ensureAudio()) { try { actx.resume(); } catch (e) {} }
    });
    panel.querySelector("#wh-test").addEventListener("click", function () {  // a montage: boot -> key -> bell
      whenReady(function () { bootSeq(0.6); });
      whenReady(function () { setTimeout(function () { key(0.7); }, 1700); });
      whenReady(function () { setTimeout(function () { bell(0.6); }, 2050); });
    });
    var ambPop = panel.querySelector("#wh-amb");
    ambBtns.push(ambPop);
    ambPop.addEventListener("click", ambToggleBed);

    var bar = document.querySelector(".ambient-bar");
    if (bar) {
      var dismiss = bar.querySelector("#ambient-dismiss");
      var bedChip = barBtn("wh-bedchip", "[synth bed]", "Synth bed");
      ambBtns.push(bedChip);
      bedChip.addEventListener("click", ambToggleBed);
      var chip = barBtn("wh-chip", "[fx]", "Effects");
      chip.setAttribute("aria-pressed", "false"); chip.setAttribute("aria-expanded", "false");
      if (dismiss) { bar.insertBefore(bedChip, dismiss); bar.insertBefore(chip, dismiss); }
      else { bar.appendChild(bedChip); bar.appendChild(chip); }
      chip.addEventListener("click", function () {
        var open = panel.getAttribute("data-open") !== "true";
        panel.setAttribute("data-open", open ? "true" : "false");
        chip.setAttribute("aria-pressed", open ? "true" : "false");
        chip.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    ambSyncBtn();
  }

  // ---------------- init ----------------
  function init() { buildVFX(); buildUI(); wirePlacements(); paint(); boot(); ambInit(); setInterval(paint, 60000); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // public surface (parity with window.WuldAmbient)
  window.WuldWrongHour = {
    version: VERSION,
    cues: Object.keys(CUES),
    vfx: Object.keys(VFX),
    play: play,
    fx: whFx,
    bed: ambSetBed,
    get: function () { return { sfx: prefs.sfx, vfx: prefs.vfx, bedOn: prefs.bedOn, rot: rot(), bleed: bleedNow() }; },
    set: function (o) { if (o && typeof o === "object") { if ("sfx" in o) prefs.sfx = clamp01(o.sfx); if ("vfx" in o) prefs.vfx = clamp01(o.vfx); save(); paint(); } },
    boot: bootSeq, thunk: thunk, key: key, soft: soft, bell: bell, click: click, purr: purr, paint: paint
  };
})();
