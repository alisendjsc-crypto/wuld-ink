/* yurei-voice.js — desk-Yūrei's synthesized voice (K227).
   ------------------------------------------------------------------------
   Her site voice IS the game's `inner_voice` (Sfx.gd S60): a voiced saw shaped
   by two vowel _formant() peaks, sequenced into short syllables, built into a
   22050 Hz AudioBuffer — ~82 Hz, one-pole lowpass, a slow unstable wobble. The
   `inner` synthesis (_formant / V / voiceBuffer) is lifted BYTE-FAITHFUL from the
   game's port (the yurei-sfx-vfx-dictionary). `animalese` and `whisper` are two
   selectable alternates on the same lineage.

   NON-SEMANTIC BY CONSTRUCTION (privacy + register — the hard fence): a line's
   TEXT reaches the audio through ONE channel only — sylCount(text), the vowel-group
   COUNT. Vowels, formants, consonant onsets, and pitch are drawn at RANDOM per
   syllable in EVERY style. Nothing maps a letter to a sound; the actual words are
   never phoneme-mapped. (The dictionary's animalese/whisper derived vowels from the
   letters; that letter→sound path is deliberately removed here — a longer line just
   babbles longer. If a semantic dialect is ever wanted, that is a register decision,
   not this vessel's call.)

   SYNTH-ONLY / CSP-CLEAN: oscillators + a computed AudioBuffer, nothing else —
   no sampled assets, no network requests, no dynamic code, no worklet node, no
   external origin.

   RESPECTFUL: default OFF (opt-in per browser); first-gesture unlock (she speaks
   only in reply to the user, inside a gesture); prefers-reduced-motion → silent
   (the transcript line still stands); dismissible via the assistant's kill-switch.

   ROUTING: reuses wrong-hour's single AudioContext + reverberant room via
   WuldWrongHour.voiceBus() (so she shares the space and ducks the bed under her);
   self-provisions a minimal room if wrong-hour is absent.

   (UMD: module.exports [node/gate] + globalThis.YureiVoice [browser].) */
(function (root) {
  "use strict";

  var STYLES = ["inner", "animalese", "whisper"];

  // ------------------------------------------------------------------
  // the ONLY text → audio channel: vowel-group COUNT (never the letters)
  // ------------------------------------------------------------------
  function sylCount(text) {
    var m = (typeof text === "string" ? text : "").toLowerCase().match(/[aeiouy]+/g) || [];
    return Math.max(2, Math.min(14, m.length || 2));
  }

  function clamp01(x) { x = +x; return x !== x ? 0 : (x < 0 ? 0 : (x > 1 ? 1 : x)); }
  function clampRange(x, lo, hi, dflt) { x = +x; return x !== x ? dflt : (x < lo ? lo : (x > hi ? hi : x)); }

  // ==================================================================
  // inner_voice — ported BYTE-FAITHFUL from Sfx.gd (via the dictionary).
  // Vowels + pitch are random PER SYLLABLE (rr); voiceBuffer takes a COUNT.
  // ==================================================================
  var RATE_G = 22050;
  function lerpf(a, b, c) { return a + (b - a) * c; }
  function _formant(f, f1c, f2c) {                          // two Lorentzian vowel peaks on a floor
    var a = 1.0 / (1.0 + Math.pow((f - f1c) / 120.0, 2.0));
    var b = 0.7 / (1.0 + Math.pow((f - f2c) / 170.0, 2.0));
    var r = 0.15 + a + b; return r < 0 ? 0 : (r > 1.3 ? 1.3 : r);
  }
  var V = {
    inner:  { syl: 0.16, gap: 0.05,  tail: 0.06, kMax: 9, vibHz: 4.0, vibDepth: 0.045, f1: [380, 700], f2: [850, 1500], f0j: [0.9, 1.12], base: 150 * 0.55, cons: 0.2, mode: "lp"   }, // S60 — HERS: ~82 Hz, muffled interior
    gibber: { syl: 0.13, gap: 0.045, tail: 0.05, kMax: 8, vibHz: 5.0, vibDepth: 0.03,  f1: [450, 820], f2: [950, 1900], f0j: [0.85, 1.2], base: 150 * 1.0, cons: 0.5, mode: "raw"  }, // S29 — the night babble
    call:   { syl: 0.13, gap: 0.045, tail: 0.05, kMax: 8, vibHz: 5.0, vibDepth: 0.03,  f1: [450, 820], f2: [950, 1900], f0j: [0.9, 1.15], base: 150 * 2.0, cons: 0.3, mode: "band" }  // S55 — the phone
  };
  function rr(a) { return a[0] + Math.random() * (a[1] - a[0]); }
  // build her voice, sample-by-sample, exactly as GDScript does. Returns {buf,dur}.
  function voiceBuffer(ac, kind, nSyll) {
    var P = V[kind] || V.inner, seg = P.syl + P.gap, dur = nSyll * seg + P.tail, n = Math.floor(RATE_G * dur);
    var f1s = [], f2s = [], f0s = [], sj;
    for (sj = 0; sj < nSyll; sj++) { f1s.push(rr(P.f1)); f2s.push(rr(P.f2)); f0s.push(P.base * rr(P.f0j)); } // random vowel + pitch per syllable
    var buf = ac.createBuffer(1, n, RATE_G), d = buf.getChannelData(0);
    var phase = 0, lp = 0, hp = 0, i, k;
    for (i = 0; i < n; i++) {
      var t = i / RATE_G, si = Math.floor(t / seg); if (si >= nSyll) si = nSyll - 1;
      var local = t - si * seg, raw = 0, sw;
      if (local < P.syl) {                                   // voiced vowel: saw harmonics weighted by the syllable's formants
        var f0 = f0s[si] * (1.0 + P.vibDepth * Math.sin(2 * Math.PI * P.vibHz * t)); // vibrato / wobble
        phase += 2 * Math.PI * f0 / RATE_G;
        var v = 0;
        for (k = 1; k <= P.kMax; k++) v += Math.sin(phase * k) * _formant(f0 * k, f1s[si], f2s[si]) / k;
        sw = Math.sin(Math.PI * Math.min(1, Math.max(0, local / P.syl)));            // soft per-syllable swell
        raw = v * 0.7 * sw;
      } else {                                               // consonant: a short noise burst
        var nz = Math.random() * 2 - 1;
        sw = Math.sin(Math.PI * Math.min(1, Math.max(0, (local - P.syl) / P.gap)));
        if (P.mode === "raw") { lp = lerpf(lp, nz, 0.5); raw = lp * 0.5 * sw; }
        else raw = nz * P.cons * sw;
      }
      var glob = Math.min(1, Math.max(0, t / 0.02)) * Math.min(1, Math.max(0, (dur - t) / P.tail)); // attack + tail
      var s;
      if (P.mode === "band") { lp = lerpf(lp, raw, 0.58); hp = lerpf(hp, lp, 0.085); s = (lp - hp) * glob * 1.8; }
      else if (P.mode === "lp") { lp = lerpf(lp, raw, 0.34); s = lp * glob * 1.3; }
      else s = raw * glob;
      d[i] = s < -1 ? -1 : (s > 1 ? 1 : s);
    }
    return { buf: buf, dur: dur };
  }

  // ==================================================================
  // shared audio bus — prefer wrong-hour's room; else a minimal one
  // ==================================================================
  var selfCtx = null, selfRoom = null;
  function impulse(ac, seconds, decay) {                    // exponential-decay noise = a room, no IR file
    var rate = ac.sampleRate, len = Math.max(1, Math.floor(rate * seconds));
    var buf = ac.createBuffer(2, len, rate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  function noiseBuf(ac, seconds) {
    var len = Math.max(1, Math.floor(ac.sampleRate * seconds)), b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function selfBus() {
    if (selfCtx) return { ctx: selfCtx, dest: selfRoom, duck: null };
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    selfCtx = new AC();
    selfRoom = selfCtx.createGain();
    var lp = selfCtx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6500; // dim top end
    var verb = selfCtx.createConvolver(); verb.buffer = impulse(selfCtx, 2.4, 2.6);         // synth reverb, no IR file
    var wet = selfCtx.createGain(); wet.gain.value = 0.18;
    selfRoom.connect(lp); lp.connect(selfCtx.destination);                 // dry
    selfRoom.connect(verb); verb.connect(wet); wet.connect(selfCtx.destination); // the room
    return { ctx: selfCtx, dest: selfRoom, duck: null };
  }
  function acquire() {
    try {
      if (root.WuldWrongHour && typeof root.WuldWrongHour.voiceBus === "function") {
        var b = root.WuldWrongHour.voiceBus();
        if (b && b.ctx && b.dest) return b;
      }
    } catch (e) {}
    return selfBus();
  }

  // ==================================================================
  // renderers — each takes (ac, dest, n, opts{pitch,rate,bleed}); returns
  // an approximate duration in seconds. n = sylCount(text) — the ONLY text input.
  // ==================================================================
  function renderInner(ac, dest, n, opts) {
    var vb = voiceBuffer(ac, "inner", n);
    var src = ac.createBufferSource(); src.buffer = vb.buf;
    var pitch = opts.pitch || 1; if (pitch !== 1) src.playbackRate.value = pitch;
    var g = ac.createGain(); g.gain.value = 0.95;
    src.connect(g); g.connect(dest); src.start();
    return vb.dur / pitch;
  }

  // animalese — pitched pentatonic formant-blips on the same lineage. Vowel +
  // consonant onset are RANDOM per blip (never the letters); prosody is none —
  // only the blip COUNT comes from the line. Sours on the bleed.
  var FORMANT_SET = [[850, 1200], [500, 2200], [300, 2700], [440, 900], [350, 800], [400, 1700]]; // vowel timbres, chosen at random
  var ONSET_SET = [
    { hp: 2600, dur: 0.010, g: 0.09, low: false }, // plosive
    { hp: 4200, dur: 0.030, g: 0.06, low: false }, // sibilant
    { hp: 280,  dur: 0.022, g: 0.05, low: true  }, // nasal/liquid
    { hp: 900,  dur: 0.026, g: 0.05, low: false }, // breathy
    { hp: 1500, dur: 0.008, g: 0.04, low: false }
  ];
  var BRIGHT = [0, 2, 4, 7, 9], DARK = [0, 3, 5, 7, 10]; // pentatonic: day vs the rot
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function renderAnimalese(ac, dest, n, opts) {
    var s = clamp01(opts.bleed || 0), pitch = opts.pitch || 1, rate = opts.rate || 1;
    var bus = ac.createGain(); bus.gain.value = 1; bus.connect(dest);
    var send = ac.createGain(); send.gain.value = 0.1 + 0.4 * s;          // recede into the room as it sours
    var verb = ac.createConvolver(); verb.buffer = impulse(ac, 2.6, 2.2); bus.connect(send); send.connect(verb); verb.connect(dest);
    var deg = 2, t0 = ac.currentTime + 0.03, at = t0, bi;
    for (bi = 0; bi < n; bi++) {
      var F = pick(FORMANT_SET), oc = pick(ONSET_SET);
      deg += (Math.random() < 0.5 ? 1 : -1) * (Math.random() < 0.5 ? 1 : 2);
      if (deg < 0) deg = 1; if (deg > 4) deg = 3;
      var semi = BRIGHT[deg] * (1 - s) + DARK[deg] * s;
      var rootHz = 330 * Math.pow(2, -0.75 * s);                          // descends toward the wrong hour
      var hz = rootHz * Math.pow(2, semi / 12) * pitch;
      var len = (0.075 + 0.06 * s) / rate, tail = (0.03 + 0.4 * s) / rate, t = at;
      var o = ac.createOscillator(); o.type = "sawtooth";
      o.frequency.setValueAtTime(hz * 0.985, t); o.frequency.linearRampToValueAtTime(hz * 1.02, t + len * 0.35); o.frequency.linearRampToValueAtTime(hz, t + len); // the bounce
      o.detune.value = (Math.random() * 2 - 1) * 45 * s;                  // unstable as it sours
      var f1 = ac.createBiquadFilter(); f1.type = "bandpass"; f1.frequency.value = F[0]; f1.Q.value = 9 - 5 * s;
      var f2 = ac.createBiquadFilter(); f2.type = "bandpass"; f2.frequency.value = F[1]; f2.Q.value = 9 - 5 * s;
      var env = ac.createGain();
      env.gain.setValueAtTime(0.0001, t); env.gain.exponentialRampToValueAtTime(0.16, t + 0.008 + 0.012 * s); env.gain.exponentialRampToValueAtTime(0.0001, t + len + tail);
      o.connect(f1); o.connect(f2); f1.connect(env); f2.connect(env); env.connect(bus);
      o.start(t); o.stop(t + len + tail + 0.02);
      var sub = ac.createOscillator(); sub.type = "sine"; sub.frequency.value = hz / 2; // sub-octave body
      var sg = ac.createGain(); sg.gain.setValueAtTime(0.0001, t); sg.gain.exponentialRampToValueAtTime(0.05 + 0.18 * s, t + 0.01); sg.gain.exponentialRampToValueAtTime(0.0001, t + len + tail);
      sub.connect(sg); sg.connect(bus); sub.start(t); sub.stop(t + len + tail + 0.02);
      if (s > 0.15) {                                                     // her bell's 2.76x ratio grows with the rot
        var inh = ac.createOscillator(); inh.type = "sine"; inh.frequency.value = hz * 2.76;
        var ig = ac.createGain(); ig.gain.setValueAtTime(0.0001, t); ig.gain.exponentialRampToValueAtTime(0.12 * s, t + 0.01); ig.gain.exponentialRampToValueAtTime(0.0001, t + len + tail * 0.7);
        inh.connect(ig); ig.connect(bus); inh.start(t); inh.stop(t + len + tail);
      }
      var ns = ac.createBufferSource(); ns.buffer = noiseBuf(ac, oc.dur + 0.01); // consonant onset (random class)
      var bp = ac.createBiquadFilter(); bp.type = oc.low ? "bandpass" : "highpass"; bp.frequency.value = oc.hp; if (oc.low) bp.Q.value = 1.2;
      var ng = ac.createGain(); ng.gain.setValueAtTime(oc.g, t); ng.gain.exponentialRampToValueAtTime(0.0001, t + oc.dur);
      ns.connect(bp); bp.connect(ng); ng.connect(bus); ns.start(t); ns.stop(t + oc.dur + 0.01);
      at += len + (0.02 + 0.03 * s) / rate;
    }
    if (s > 0.12) {                                                       // a 55 Hz dread bed under the line as it sours
      var total = at - t0, d = ac.createOscillator(); d.type = "sine"; d.frequency.value = 55;
      var dg = ac.createGain();
      dg.gain.setValueAtTime(0.0001, t0); dg.gain.linearRampToValueAtTime(0.06 * s, t0 + 0.4);
      dg.gain.setValueAtTime(0.06 * s, t0 + total); dg.gain.linearRampToValueAtTime(0.0001, t0 + total + 0.5);
      d.connect(dg); dg.connect(bus); d.start(t0); d.stop(t0 + total + 0.6);
    }
    return at - t0;
  }

  // whisper — a soft, breathy exhale (the office breathing out). Broadband "air":
  // a highpass to drop the low rumble + a gentle lowpass so it never hisses; NO
  // resonant band and NO filter sweep — a swept resonant filter over noise reads as
  // a scratch / turntable, not a breath. One soft breath per syllable, lightly
  // overlapping; it sinks + lengthens as it sours.
  function renderWhisper(ac, dest, n, opts) {
    var s = clamp01(opts.bleed || 0), rate = opts.rate || 1;
    var bus = ac.createGain(); bus.connect(dest);
    var t0 = ac.currentTime + 0.03, at = t0, wi;
    for (wi = 0; wi < n; wi++) {
      var t = at, dur = (0.16 + 0.10 * Math.random() + 0.06 * s) / rate;
      var ns = ac.createBufferSource(); ns.buffer = noiseBuf(ac, dur + 0.06);
      var hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1400 - 500 * s; hp.Q.value = 0.5; // air, not rumble (sinks as it sours)
      var lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6000 - 1500 * s; lp.Q.value = 0.4; // soft top, never hissy
      var g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.055 + 0.02 * s, t + dur * 0.4);    // slow breathy swell
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      ns.connect(hp); hp.connect(lp); lp.connect(g); g.connect(bus); ns.start(t); ns.stop(t + dur + 0.06);
      at += dur * 0.85 + (0.05 + 0.04 * s) / rate;                        // gentle gap; breaths overlap slightly
    }
    return at - t0;
  }

  // ==================================================================
  // prefs (per-browser, default OFF) + speak
  // ==================================================================
  var STORAGE = "wuld:yurei.voice";
  var DEFAULTS = { on: false, style: "inner", pitch: 1, rate: 1 };
  function load() {
    try {
      var r = JSON.parse(localStorage.getItem(STORAGE));
      if (r && typeof r === "object") return {
        on: (typeof r.on === "boolean" ? r.on : DEFAULTS.on),
        style: (STYLES.indexOf(r.style) >= 0 ? r.style : DEFAULTS.style),
        pitch: clampRange(r.pitch, 0.5, 2, DEFAULTS.pitch),
        rate: clampRange(r.rate, 0.5, 2, DEFAULTS.rate)
      };
    } catch (e) {}
    return { on: DEFAULTS.on, style: DEFAULTS.style, pitch: DEFAULTS.pitch, rate: DEFAULTS.rate };
  }
  var prefs = (typeof localStorage !== "undefined") ? load() : { on: DEFAULTS.on, style: DEFAULTS.style, pitch: DEFAULTS.pitch, rate: DEFAULTS.rate };
  function save() { try { localStorage.setItem(STORAGE, JSON.stringify(prefs)); } catch (e) {} }

  function reduced() { try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; } }
  function bleedNow() { try { if (root.WuldWrongHour && root.WuldWrongHour.get) { var g = root.WuldWrongHour.get(); if (g && typeof g.bleed === "number") return g.bleed; } } catch (e) {} return 0; }

  // speak(text, opts?) — opts overrides {style, pitch, rate, force}. Returns the
  // utterance length in seconds (0 if suppressed: default-off / reduced-motion / no audio).
  function speak(text, opts) {
    opts = opts || {};
    if (typeof window === "undefined") return 0;
    if (!opts.force && !prefs.on) return 0;                  // default OFF (opt-in)
    if (reduced()) return 0;                                 // reduced-motion → silent; the line stands
    var style = (opts.style && STYLES.indexOf(opts.style) >= 0) ? opts.style : prefs.style;
    var n = sylCount(text);
    var bus = acquire(); if (!bus || !bus.ctx || !bus.dest) return 0;
    var ac = bus.ctx, dest = bus.dest;
    try { var p = ac.resume(); if (p && p.then) p.then(function () {}, function () {}); } catch (e) {}
    var o = { pitch: (opts.pitch || prefs.pitch), rate: (opts.rate || prefs.rate), bleed: bleedNow() };
    var dur = 0;
    try {
      if (style === "animalese") dur = renderAnimalese(ac, dest, n, o);
      else if (style === "whisper") dur = renderWhisper(ac, dest, n, o);
      else dur = renderInner(ac, dest, n, o);
    } catch (e) { return 0; }
    if (bus.duck) { try { bus.duck(dur); } catch (e) {} }   // duck wrong-hour's bed under her
    return dur;
  }

  var API = {
    STYLES: STYLES.slice(),
    sylCount: sylCount,
    get: function () { return { on: prefs.on, style: prefs.style, pitch: prefs.pitch, rate: prefs.rate }; },
    set: function (o) {
      if (o && typeof o === "object") {
        if (typeof o.on === "boolean") prefs.on = o.on;
        if (o.style && STYLES.indexOf(o.style) >= 0) prefs.style = o.style;
        if ("pitch" in o) prefs.pitch = clampRange(o.pitch, 0.5, 2, prefs.pitch);
        if ("rate" in o) prefs.rate = clampRange(o.rate, 0.5, 2, prefs.rate);
        save();
      }
      return { on: prefs.on, style: prefs.style, pitch: prefs.pitch, rate: prefs.rate };
    },
    speak: speak,
    ready: function () { return !!((typeof window !== "undefined") && (window.AudioContext || window.webkitAudioContext)); }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.YureiVoice = API;
})(typeof self !== "undefined" ? self : (typeof globalThis !== "undefined" ? globalThis : this));
