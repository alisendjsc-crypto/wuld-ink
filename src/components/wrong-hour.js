/*
  wrong-hour.js — synthesized SFX + VFX ("the wrong hour"), K208
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
  var VERSION  = "K208";
  var DEFAULTS = { sfx: 0.35, vfx: 0.35, bedOn: true, bedMood: "breeze" };
  var SCENES   = { frame: "bell", threshold: "bell", glossary: "bell", summon: "purr", power: "boot" };
  // K208 - generative bed MOODS (additive); the drone/piano/texture read the active one
  // K209 - clinical is the default; oceanic elevated for small-speaker presence; +breeze (Radigue-ish deep drone w/ a resonant "howl")
  // K210 - breeze is the default + elevated (bolder drone + presence partials + louder howl)
  var MOODS = {
    room: {
      lpFreq: 320, lpQ: 6, whirFreq: 0.13, whirDepth: 120,
      specs: [[50, "sine", 0.5], [100, "triangle", 0.26], [100.7, "triangle", 0.2], [150.5, "sine", 0.1]],
      airType: "bandpass", airFreq: 2200, airQ: 0.7, airGain: 0.015,
      breathFreq: 0.06, breathDepth: 0.035,
      piano: [131, 147, 156, 175, 196, 208, 233, 262], pianoGap: [4200, 7200], fall: 0.34,
      tex: "breath", texGap: [16000, 26000]
    },
    clinical: {
      lpFreq: 780, lpQ: 3, whirFreq: 0.05, whirDepth: 40,
      specs: [[60, "sine", 0.22], [120, "sine", 0.34], [180, "sine", 0.12], [4200, "sine", 0.006]],
      airType: "bandpass", airFreq: 3400, airQ: 0.9, airGain: 0.02,
      breathFreq: 0.09, breathDepth: 0.02,
      piano: [156, 208, 262, 311, 349], pianoGap: [9000, 12000], fall: 0.14,
      tex: "tick", texGap: [6000, 12000]
    },
    oceanic: {
      lpFreq: 240, lpQ: 4, whirFreq: 0.045, whirDepth: 110,
      specs: [[32, "sine", 0.82], [48, "sine", 0.44], [64, "sine", 0.3], [96, "triangle", 0.16], [144, "sine", 0.15]],
      airType: "bandpass", airFreq: 360, airQ: 0.5, airGain: 0.075,
      breathFreq: 0.035, breathDepth: 0.06,
      piano: [98, 110, 131, 147, 165], pianoGap: [8000, 12000], fall: 0.5,
      tex: "tide", texGap: [20000, 30000]
    },
    breeze: {
      lpFreq: 260, lpQ: 5, whirFreq: 0.025, whirDepth: 100,
      specs: [[36, "sine", 0.85], [36.4, "sine", 0.72], [54, "sine", 0.36], [72.3, "sine", 0.2], [108, "triangle", 0.14], [150, "sine", 0.1], [204, "sine", 0.055]],
      airType: "bandpass", airFreq: 520, airQ: 0.8, airGain: 0.045,
      breathFreq: 0.02, breathDepth: 0.06,
      piano: [82, 98, 110, 123], pianoGap: [24000, 22000], fall: 0.12,
      tex: "howl", texGap: [15000, 12000]
    }
  };
  var MOOD_ORDER = ["room", "clinical", "oceanic", "breeze"];
  function curMood() { return MOODS[prefs.bedMood] || MOODS.room; }

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
        bedOn: (typeof r.bedOn === "boolean" ? r.bedOn : DEFAULTS.bedOn),
        bedMood: (r.bedMood && MOODS[r.bedMood] ? r.bedMood : DEFAULTS.bedMood)
      };
    } catch (e) {}
    return { sfx: DEFAULTS.sfx, vfx: DEFAULTS.vfx, bedOn: DEFAULTS.bedOn, bedMood: DEFAULTS.bedMood };
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
  var NAV_HZ = [131, 147, 165, 196, 220], navIdx = 0;   // K211: A-minor-pentatonic, an octave lower (C3 D3 E3 G3 A3) - warm nav register

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
  function soft(amp) {   // navigation (K211) - a warm, muted analog pluck; low + rounded, distinct from the word chime + the key click
    if (!ensureAudio() || actx.state !== "running") return;
    amp = (amp == null ? gate() : amp); if (amp <= 0) return;
    var t = actx.currentTime;
    var hz = NAV_HZ[navIdx % NAV_HZ.length];
    navIdx = (navIdx + 1 + (Math.random() < 0.4 ? 1 : 0)) % NAV_HZ.length;   // walk the scale, occasional skip
    var o = actx.createOscillator(); o.type = "sawtooth";                    // analog pluck body (harmonics for the filter to shape)
    o.frequency.setValueAtTime(hz * 1.004, t); o.frequency.exponentialRampToValueAtTime(hz, t + 0.05);
    var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 6;  // resonant filter snaps closed = warm pluck
    lp.frequency.setValueAtTime(hz * 3.4, t); lp.frequency.exponentialRampToValueAtTime(hz * 1.05, t + 0.24);   // modest opening -> closes near the fundamental (never bright)
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.28 * amp, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.44);
    o.connect(lp); lp.connect(g); g.connect(room); o.start(t); o.stop(t + 0.48);
    var sub = actx.createOscillator(); sub.type = "sine"; sub.frequency.value = hz / 2;   // sub-octave body / warmth
    var sg = actx.createGain();
    sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.14 * amp, t + 0.012); sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    sub.connect(sg); sg.connect(room); sub.start(t); sub.stop(t + 0.38);
  }
  function bell(amp) {    // A6 - inharmonic chime, heavier + long reverb + echo (K211); bitcrushes as the room rots (A7)
    if (!ensureAudio() || actx.state !== "running") return;
    amp = (amp == null ? gate() : amp); if (amp <= 0) return;
    var t = actx.currentTime, base = 110, ratios = [1, 2.76, 5.40, 8.93], decays = [4.8, 3.8, 2.8, 2.0], i, r = rot(), dest = room;
    if (r > 0.25) { var ws = actx.createWaveShaper(); ws.curve = crushCurve(Math.max(3, 8 - Math.round(r * 5))); ws.connect(room); dest = ws; }
    var bus = actx.createGain();                                            // shared bell bus -> dry + reverb + echo
    bus.connect(dest);
    var bverb = actx.createConvolver(); bverb.buffer = impulse(3.4, 1.9);   // a big, heavy reverb tail (its own, longer than the room)
    var bw = actx.createGain(); bw.gain.value = 0.55; bus.connect(bverb); bverb.connect(bw); bw.connect(room);
    var dl = actx.createDelay(1.0); dl.delayTime.value = 0.32;              // echo
    var fb = actx.createGain(); fb.gain.value = 0.42; dl.connect(fb); fb.connect(dl); bus.connect(dl); dl.connect(room);   // feedback echoes wash through the room
    var sub = actx.createOscillator(); sub.type = "sine"; sub.frequency.value = base / 2;   // sub-octave weight
    var sg = actx.createGain();
    sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.34 * amp, t + 0.01); sg.gain.exponentialRampToValueAtTime(0.0001, t + 5.2);
    sub.connect(sg); sg.connect(bus); sub.start(t); sub.stop(t + 5.4);
    for (i = 0; i < ratios.length; i++) {
      var o = actx.createOscillator(); o.type = "sine"; o.frequency.value = base * ratios[i];
      var g = actx.createGain(), peak = (0.55 / (i + 1)) * amp;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decays[i]);
      o.connect(g); g.connect(bus); o.start(t); o.stop(t + decays[i] + 0.1);
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

  var WORD_HZ = [392.0, 440.0, 493.88, 587.33, 659.25], wordIdx = 0;   // K211: down a fourth (G4 A4 B4 D5 E5) - a fraction of an octave lower
  function wordChime(amp) {   // K208 - a soft bright "word landed" chime; walks a high pentatonic
    if (!ensureAudio() || actx.state !== "running") return;
    amp = (amp == null ? gate() : amp); if (amp <= 0) return;
    var t = actx.currentTime, hz = WORD_HZ[wordIdx % WORD_HZ.length];
    wordIdx = (wordIdx + 1 + (Math.random() < 0.35 ? 1 : 0)) % WORD_HZ.length;
    var o = actx.createOscillator(); o.type = "triangle"; o.frequency.value = hz;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16 * amp, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    o.connect(g); g.connect(room); o.start(t); o.stop(t + 0.38);
    var sh = actx.createOscillator(); sh.type = "sine"; sh.frequency.value = hz * 2.004;
    var shg = actx.createGain();
    shg.gain.setValueAtTime(0.0001, t); shg.gain.exponentialRampToValueAtTime(0.05 * amp, t + 0.006); shg.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    sh.connect(shg); shg.connect(room); sh.start(t); sh.stop(t + 0.24);
  }
  var CUES = { boot: bootSeq, thunk: thunk, key: key, soft: soft, bell: bell, click: click, purr: purr, word: wordChime };

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
  function ambBuildDrone() {                                 // K208 - mood-aware (room / clinical / oceanic)
    var M = curMood(), t = actx.currentTime;
    var bed = actx.createGain(); bed.gain.value = 0.0001;
    var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = M.lpFreq; lp.Q.value = M.lpQ;
    var flfo = actx.createOscillator(); flfo.type = "sine"; flfo.frequency.value = M.whirFreq;
    var flfoG = actx.createGain(); flfoG.gain.value = M.whirDepth;
    flfo.connect(flfoG); flfoG.connect(lp.frequency); flfo.start(t);
    var oscs = [], i;
    for (i = 0; i < M.specs.length; i++) {
      var o = actx.createOscillator(); o.type = M.specs[i][1]; o.frequency.value = M.specs[i][0];
      var g = actx.createGain(); g.gain.value = M.specs[i][2];
      o.connect(g); g.connect(lp); o.start(t); oscs.push(o);
    }
    var ns = actx.createBufferSource(); ns.buffer = ambNoiseLoop(); ns.loop = true;
    var nbp = actx.createBiquadFilter(); nbp.type = M.airType; nbp.frequency.value = M.airFreq; nbp.Q.value = M.airQ;
    var ng = actx.createGain(); ng.gain.value = M.airGain;
    ns.connect(nbp); nbp.connect(ng); ng.connect(lp);
    try { ns.start(t); } catch (e) {}
    lp.connect(bed);
    var alfo = actx.createOscillator(); alfo.type = "sine"; alfo.frequency.value = M.breathFreq;
    var alfoG = actx.createGain(); alfoG.gain.value = M.breathDepth;
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
    var M = curMood(), t = actx.currentTime, set = M.piano, a = set[(Math.random() * set.length) | 0];
    ambPiano(a, t, writingMode ? 1.15 : 1);
    if (Math.random() < (writingMode ? M.fall + 0.2 : M.fall)) {
      var b = set[(Math.random() * set.length) | 0];
      ambPiano(b, t + 0.28 + Math.random() * 0.24, 0.62);
    }
  }
  function ambSchedulePiano() {
    clearTimeout(ambPianoTimer);
    var g = curMood().pianoGap, wait = g[0] + Math.random() * g[1];
    if (writingMode) wait *= 0.6;
    ambPianoTimer = setTimeout(function () { ambPianoNote(); ambSchedulePiano(); }, wait);
  }
  function ambBreath() {                                     // room - faint breath / whisper swell
    if (!ambNodes || !actx || actx.state !== "running") return;
    var t = actx.currentTime;
    var ns = actx.createBufferSource(); ns.buffer = noiseBuf(2.4);
    var bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 520 + Math.random() * 260; bp.Q.value = 3.2;
    var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1400;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.9);
    g.gain.linearRampToValueAtTime(0.0001, t + 2.2);
    ns.connect(bp); bp.connect(lp); lp.connect(g); g.connect(ambNodes.bed);
    try { ns.start(t); ns.stop(t + 2.4); } catch (e) {}
  }
  function ambTick() {                                       // clinical - a faint electrical tick / relay
    if (!ambNodes || !actx || actx.state !== "running") return;
    var t = actx.currentTime;
    var ns = actx.createBufferSource(); ns.buffer = noiseBuf(0.012);
    var bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2600 + Math.random() * 900; bp.Q.value = 1.2;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.04, t + 0.001); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
    ns.connect(bp); bp.connect(g); g.connect(ambNodes.bed);
    try { ns.start(t); ns.stop(t + 0.03); } catch (e) {}
    if (Math.random() < 0.5) {
      var o = actx.createOscillator(); o.type = "sine"; o.frequency.value = 60;
      var og = actx.createGain(); og.gain.setValueAtTime(0.0001, t); og.gain.linearRampToValueAtTime(0.03, t + 0.02); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      o.connect(og); og.connect(ambNodes.bed); o.start(t); o.stop(t + 0.45);
    }
  }
  function ambTide() {                                       // oceanic - a long low tidal swell
    if (!ambNodes || !actx || actx.state !== "running") return;
    var t = actx.currentTime;
    var ns = actx.createBufferSource(); ns.buffer = noiseBuf(6.5);
    var bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 220 + Math.random() * 140; bp.Q.value = 0.8;
    var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 640;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.095, t + 2.6);
    g.gain.linearRampToValueAtTime(0.0001, t + 6.2);
    ns.connect(bp); bp.connect(lp); lp.connect(g); g.connect(ambNodes.bed);
    try { ns.start(t); ns.stop(t + 6.5); } catch (e) {}
  }
  function ambHowl() {                                     // breeze - an aching resonant wind that swells and recedes between movements (Radigue-ish)
    if (!ambNodes || !actx || actx.state !== "running") return;
    var t = actx.currentTime, dur = 8 + Math.random() * 3;
    var f0 = 240 + Math.random() * 120, f1 = f0 + 180 + Math.random() * 160;
    var ns = actx.createBufferSource(); ns.buffer = noiseBuf(6.5); ns.loop = true;
    var bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 5.5;
    bp.frequency.setValueAtTime(f0, t);
    bp.frequency.linearRampToValueAtTime(f1, t + dur * 0.55);
    bp.frequency.linearRampToValueAtTime(f0 * 0.85, t + dur);
    var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100;
    var g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.09, t + dur * 0.45);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    ns.connect(bp); bp.connect(lp); lp.connect(g); g.connect(ambNodes.bed);
    var o = actx.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(f0 * 0.5, t);
    o.frequency.linearRampToValueAtTime(f1 * 0.5, t + dur * 0.55);
    o.frequency.linearRampToValueAtTime(f0 * 0.46, t + dur);
    var og = actx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.linearRampToValueAtTime(0.045, t + dur * 0.5);
    og.gain.linearRampToValueAtTime(0.0001, t + dur);
    o.connect(og); og.connect(ambNodes.bed);
    try { ns.start(t); ns.stop(t + dur + 0.1); o.start(t); o.stop(t + dur + 0.1); } catch (e) {}
  }
  var AMB_TEX = { breath: ambBreath, tick: ambTick, tide: ambTide, howl: ambHowl };
  function ambTextureFire() { var fn = AMB_TEX[curMood().tex]; if (fn) fn(); }
  function ambScheduleTexture() {
    clearTimeout(ambBreathTimer);
    var g = curMood().texGap;
    ambBreathTimer = setTimeout(function () { ambTextureFire(); ambScheduleTexture(); }, g[0] + Math.random() * g[1]);
  }
  function ambStart() {
    if (!ensureAudio() || actx.state !== "running") return;  // needs a gesture-resumed context
    if (ambNodes) return;
    ambBuildDrone();
    var t = actx.currentTime, lvl = ambLevel();
    ambNodes.bed.gain.cancelScheduledValues(t);
    ambNodes.bed.gain.setValueAtTime(0.0001, t);
    ambNodes.bed.gain.linearRampToValueAtTime(Math.max(0.0002, lvl), t + 3.5);   // slow fade-in
    ambSchedulePiano(); ambScheduleTexture();
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

  // ---- writing-mode + word-landed bed reaction (K208) ----
  var writingMode = false;
  function setWriting(on) { writingMode = !!on; }
  function ambFlourish() {                                    // a soft bed motif on each completed word
    if (!ambNodes || !actx || actx.state !== "running") return;
    var M = curMood(), t = actx.currentTime, set = M.piano, hz = set[(Math.random() * set.length) | 0];
    ambPiano(hz, t, 0.7);
    if (Math.random() < 0.25) { var b = set[(Math.random() * set.length) | 0]; ambPiano(b, t + 0.16 + Math.random() * 0.2, 0.4); }
  }
  function word() {                                          // public: "word landed" reaction (sound + bed)
    if (prefs.sfx > 0) whenReady(function () { wordChime(); });
    if (prefs.bedOn) whenReady(function () { ambFlourish(); });
  }
  var moodBtns = [];
  function ambSyncMoodBtn() { for (var i = 0; i < moodBtns.length; i++) moodBtns[i].textContent = "[bed: " + prefs.bedMood + "]"; }
  function setMood(m) {
    if (!MOODS[m] || m === prefs.bedMood) return;
    prefs.bedMood = m; save();
    if (prefs.bedOn && ambNodes) { ambStop(); whenReady(function () { ambStart(); }); }
    ambSyncMoodBtn();
  }
  function cycleMood() { var i = MOOD_ORDER.indexOf(prefs.bedMood); setMood(MOOD_ORDER[(i + 1) % MOOD_ORDER.length]); }

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

  // ---------------- strangeness: session-age corruption, site-wide + subtle (K208) ----------------
  // The longer the tab stays open, the stranger the site gets. Session-scoped
  // (sessionStorage) -> resets when the browser is closed + reopened. Everything is
  // brief, self-reverting, legibility-safe, gated by the vfx slider + reduced-motion,
  // and NEVER mutates the notes editor or real navigation. One shared throttle.
  var SESS_KEY = "wuld:wrongHour.sess", VIS_KEY = "wuld:visited", RAMP_MIN = 30;
  var INTRU = ["leave", "still here", "underneath", "no one", "it knows", "the wrong hour",
    "hollow", "why", "again", "don't look", "empty", "under", "wrong", "who", "listen",
    "behind you", "not yet", "come back", "almost", "nothing", "keep going", "you're still here"];
  var PHANTOM = ["/void-engine/", "/frame/", "/coda/", "/ne-hoc-fiat/", "/gallery/the-wrong-thing/",
    "/gallery/gap-dweller/", "/why-not-suicide/", "/violence-as-reductio/", "/glossary/", "/preface/", "/archive/"];
  var GLYPH = "█▓▒░╳≠∅¤∆×†‡/\\";
  var lastIntrusion = 0, glitchTimer = null, sessStart = 0;

  function sessionAgeMin() {
    if (!sessStart) {
      try { var v = +sessionStorage.getItem(SESS_KEY); if (v > 0) sessStart = v; } catch (e) {}
      if (!sessStart) { sessStart = Date.now(); try { sessionStorage.setItem(SESS_KEY, String(sessStart)); } catch (e) {} }
    }
    return (Date.now() - sessStart) / 60000;
  }
  function corruption() { return clamp01(sessionAgeMin() / RAMP_MIN); }
  function strangeOK() { return prefs.vfx > 0 && !reduce; }
  function throttled(gap) { var now = Date.now(); if (now - lastIntrusion < gap) return true; lastIntrusion = now; return false; }
  function excluded(el) {
    return !el || !el.closest || el.closest('[data-wh="none"], textarea, input, [contenteditable], .ambient-player, .wh-panel');
  }
  function rememberVisit() {
    try {
      var seen = JSON.parse(localStorage.getItem(VIS_KEY) || "[]"); if (!Array.isArray(seen)) seen = [];
      var p = location.pathname; if (seen.indexOf(p) < 0) { seen.push(p); localStorage.setItem(VIS_KEY, JSON.stringify(seen.slice(-60))); }
    } catch (e) {}
  }
  function unexplored() {
    var seen = [];
    try { seen = JSON.parse(localStorage.getItem(VIS_KEY) || "[]") || []; } catch (e) {}
    var pool = PHANTOM.filter(function (p) { return seen.indexOf(p) < 0; });
    if (!pool.length) pool = PHANTOM;
    return pool[(Math.random() * pool.length) | 0];
  }
  function floatGhost(txt, x, y, cls, ttl) {
    var s = document.createElement("span");
    s.className = "wh-ghost " + (cls || "");
    s.textContent = txt;
    s.style.left = Math.round(x) + "px"; s.style.top = Math.round(y) + "px";
    s.style.setProperty("--wh-gi", fxi().toFixed(3));
    document.body.appendChild(s);
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, ttl || 900);
  }
  function intrudeWord(e) {
    var c = corruption();
    if (Math.random() > c * 0.3) return;
    if (throttled(2400)) return;
    var el = e.target && e.target.closest ? e.target.closest("p, li, blockquote, figcaption, h1, h2, h3, h4, .page-intro, .lede") : null;
    if (!el || excluded(el)) return;
    var w = INTRU[(Math.random() * INTRU.length) | 0];
    floatGhost(w, e.clientX + (Math.random() * 40 - 20), e.clientY + (Math.random() * 22 - 26), "wh-ghost--word", 820);
  }
  function phantomLink(e) {
    var c = corruption(); if (c < 0.2) return;
    if (Math.random() > c * 0.22) return;
    if (throttled(2600)) return;
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || excluded(a)) return;
    var r = a.getBoundingClientRect();
    floatGhost("→ " + unexplored(), r.left + r.width * 0.5, r.top - 6, "wh-ghost--link", 900);
  }
  function corruptTextNode(el) {                              // brief, reversible glyph flicker on ONE text node
    var i, tn = null;
    for (i = 0; i < el.childNodes.length; i++) { var n = el.childNodes[i]; if (n.nodeType === 3 && n.nodeValue && n.nodeValue.replace(/\s/g, "").length > 5) { tn = n; break; } }
    if (!tn) return;
    var orig = tn.nodeValue, arr = orig.split(""), c = corruption();
    var hits = 1 + (Math.random() * (1 + c * 3) | 0), done = 0, guard = 0;
    while (done < hits && guard < 40) {
      guard++;
      var k = (Math.random() * arr.length) | 0;
      if (/\S/.test(arr[k])) { arr[k] = GLYPH[(Math.random() * GLYPH.length) | 0]; done++; }
    }
    tn.nodeValue = arr.join("");
    setTimeout(function () { try { tn.nodeValue = orig; } catch (e) {} }, 180 + Math.random() * 320);
  }
  function glitchTick() {
    var c = corruption(), base = 11000;
    if (strangeOK() && c >= 0.16 && Math.random() < 0.7) {
      var els = document.querySelectorAll("main p, main li, article p, .prose p, .ts-page p, main blockquote");
      var tries = 0, el = null;
      while (tries < 8) { el = els[(Math.random() * els.length) | 0]; if (el && !excluded(el)) break; el = null; tries++; }
      if (el) corruptTextNode(el);
      base = 9000 - c * 6000;
    }
    glitchTimer = setTimeout(glitchTick, Math.max(2600, base) + Math.random() * 3000);
  }
  function wireStrangeness() {
    rememberVisit();
    document.addEventListener("pointerover", function (e) {
      if (!strangeOK() || corruption() < 0.14) return;
      if (e.target && e.target.closest && e.target.closest("a[href]")) phantomLink(e);
      else intrudeWord(e);
    }, true);
    glitchTimer = setTimeout(glitchTick, 12000 + Math.random() * 8000);
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
    if (bleedNow() >= 0.85) {
      bellDone = true;
      // K224c fix: the deep-night bell must toll ONCE per night, not on every page
      // load. bellDone is per-page-load (resets on navigation), so persist the toll
      // by the night's date — otherwise the bell re-rang on every nav click and every
      // site open during the 1:40-4:20am window.
      try {
        var d = new Date(), key = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
        if (localStorage.getItem("wuld:wrongHour.belled") === key) return;
        localStorage.setItem("wuld:wrongHour.belled", key);
      } catch (e) {}
      whenReady(function () { bell(); });
    }
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
      '<div class="wh-row"><label>mood</label>' +
        '<button class="ambient-btn wh-mood" id="wh-mood" type="button" data-wh="none">[bed: room]</button>' +
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
    var moodBtn = panel.querySelector("#wh-mood");
    moodBtns.push(moodBtn); ambSyncMoodBtn();
    moodBtn.addEventListener("click", cycleMood);

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
  function init() { buildVFX(); buildUI(); wirePlacements(); wireStrangeness(); paint(); boot(); ambInit(); setInterval(paint, 60000); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // K227 — a shared voice bus for the desk-Yūrei voice (yurei-voice.js): reuses THIS
  // component's single AudioContext + reverberant room so her voice shares the space,
  // and ducks the generative bed under her while she speaks. Additive; nothing else
  // in this file references it. Absent wrong-hour, yurei-voice self-provisions.
  function voiceBus() {
    if (!ensureAudio()) return null;
    try { var p = actx.resume(); if (p && p.then) p.then(noop, noop); } catch (e) {}
    return {
      ctx: actx,
      dest: room,
      duck: function (seconds) {                              // dip the bed under her voice, then restore
        var b = ambNodes && ambNodes.bed; if (!b || !b.gain) return noop;
        var now = actx.currentTime, hold = Math.max(0.3, +seconds || 0.5), target = 0.2;
        try { target = ambLevel(); } catch (e) {}
        try {
          b.gain.cancelScheduledValues(now);
          b.gain.setTargetAtTime(target * 0.35, now, 0.05);
          b.gain.setTargetAtTime(target, now + hold + 0.12, 0.28);
        } catch (e) {}
        return function () { try { b.gain.cancelScheduledValues(actx.currentTime); b.gain.setTargetAtTime(target, actx.currentTime, 0.28); } catch (e) {} };
      }
    };
  }

  // public surface (parity with window.WuldAmbient)
  window.WuldWrongHour = {
    version: VERSION,
    cues: Object.keys(CUES),
    vfx: Object.keys(VFX),
    moods: MOOD_ORDER.slice(),
    play: play,
    fx: whFx,
    bed: ambSetBed,
    mood: setMood,
    word: word,
    writing: setWriting,
    corr: corruption,
    get: function () { return { sfx: prefs.sfx, vfx: prefs.vfx, bedOn: prefs.bedOn, bedMood: prefs.bedMood, rot: rot(), bleed: bleedNow(), corr: corruption() }; },
    set: function (o) { if (o && typeof o === "object") { if ("sfx" in o) prefs.sfx = clamp01(o.sfx); if ("vfx" in o) prefs.vfx = clamp01(o.vfx); save(); paint(); } },
    voiceBus: voiceBus,
    boot: bootSeq, thunk: thunk, key: key, soft: soft, bell: bell, click: click, purr: purr, paint: paint
  };
})();
