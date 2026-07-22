/* console-fx.js — the text-effects layer for /console/ (K273).
   ===========================================================================
   Makes the terminal's TEXT feel alive: character typeout (the structure
   narrating itself), a faint CRT phosphor bloom + slow flicker, sparse ashen
   glyph-decay, a breathing caret + line-settle, a descent crescendo on the
   close, and a diegetic WebAudio ambient bed. An AUTHORIZED exception to the
   game's austerity (K269 Josiah mandate) — but THEME-BOUND: the dying CRT of
   the ashen structure, never arcade juice.

   OPT-IN + user-controllable via a [ crt ] toggle (off / low / full), persisted
   own-key wuld:console:fx. prefers-reduced-motion is a HARD override: it forces
   the static/instant path regardless of the stored pref, and silences all audio.

   SHELL REQUIRES NOTHING — dependency-free vanilla JS/CSS/WebAudio, ZERO assets.
   Wired by console.js; degrades to a no-op if console.js never calls init().
   FICTION ONLY — no argument-library import, no philosophical stance, ever. */
(function () {
  "use strict";
  var win = (typeof window !== "undefined") ? window : null;
  var doc = (typeof document !== "undefined") ? document : null;
  if (!win) return;

  var KEY = "wuld:console:fx";          // own-key namespace: wuld:console:* ONLY
  var LEVELS = ["off", "low", "full"];
  var DEFAULT_LEVEL = "low";            // tasteful-on (Josiah §1b ruling K273); gentle first-visit
  var ASH = "▓▒░·‹›#*";   // ▓▒░·‹›#* — cold decay glyphs, no letters

  // rAF is the ONLY animation clock. When it is absent (the e2e shim, or any
  // reduced-motion path we short-circuit before here), typeout writes the full
  // text synchronously — the static/instant equivalent. No setTimeout fallback
  // for reveal, so the contract "completes to the full text" holds everywhere.
  var raf = (typeof win.requestAnimationFrame === "function") ? function (cb) { return win.requestAnimationFrame(cb); } : null;
  var caf = (typeof win.cancelAnimationFrame === "function") ? function (id) { return win.cancelAnimationFrame(id); } : function () {};
  var now = function () { try { return (win.performance && win.performance.now) ? win.performance.now() : 0; } catch (e) { return 0; } };
  function later(fn, ms) { try { if (win.setTimeout) return win.setTimeout(fn, ms); } catch (e) {} return 0; }

  // ---- module state (set by init) ------------------------------------------
  var termEl = null;        // the .con-term root — carries the con-fx* classes
  var reduced = false;      // prefers-reduced-motion (hard override)
  var ctxFn = null;         // console.js's shared AudioContext factory (one ctx)
  var soundFn = null;       // () => bool : is the [ sound ] toggle on
  var level = DEFAULT_LEVEL;
  var started = false;

  var typers = [];          // active typeout jobs (for instant-complete)
  var bed = null;           // ambient drone nodes (null when silent)
  var lastTick = 0;         // key-tick throttle

  // ---- pref persistence (own-key) ------------------------------------------
  function loadLevel() {
    try { var v = win.localStorage && win.localStorage.getItem(KEY); if (LEVELS.indexOf(v) >= 0) return v; } catch (e) {}
    return DEFAULT_LEVEL;
  }
  function saveLevel(l) { try { if (win.localStorage) win.localStorage.setItem(KEY, l); } catch (e) {} }

  function motion() { return level !== "off" && !reduced; }   // may animation run?
  function on() { return level !== "off"; }                    // is fx enabled at all?

  // ---- class application on the terminal root ------------------------------
  function applyClasses() {
    if (!termEl || !termEl.classList) return;
    var cl = termEl.classList;
    cl.remove("con-fx"); cl.remove("con-fx-low"); cl.remove("con-fx-full"); cl.remove("con-fx-static");
    if (level === "off") return;
    cl.add("con-fx");
    cl.add(level === "full" ? "con-fx-full" : "con-fx-low");
    if (reduced) cl.add("con-fx-static");   // static bloom, animations killed by CSS + JS gate
  }

  // ---- typeout -------------------------------------------------------------
  // Builds the line divs immediately (so structure/scroll are correct), then
  // reveals character-by-character via rAF. Sparse ash-glyph decay rides the
  // reveal. Any active job hard-completes on the next keypress. When motion is
  // off (reduced, level off, or no rAF), writes the full text at once.
  function makeLine(out, cls) {
    var d = doc.createElement("div");
    d.className = "con-line" + (cls ? " " + cls : "");
    out.appendChild(d);
    return d;
  }
  function glitchRate() { return level === "full" ? 0.015 : 0.005; }
  function cadence() { return level === "full" ? 16 : 8; }     // ms per char

  function typeBlock(out, text, cls) {
    text = String(text == null ? "" : text);
    if (!out || !doc) return null;
    var lines = text.split("\n");
    // instant path — the static/instant equivalent (reduced-motion, level off,
    // or no rAF): the full text lands at once, no reveal, no timers.
    if (!motion() || !raf) {
      for (var i = 0; i < lines.length; i++) {
        var li = makeLine(out, cls);
        li.textContent = lines[i];
        if (!reduced) li.className += " con-fx-settle";
      }
      out.scrollTop = out.scrollHeight;
      return null;
    }
    // animated path — one job, revealed char-by-char on the rAF clock
    var els = [];
    for (var k = 0; k < lines.length; k++) els.push(makeLine(out, cls));
    var job = { out: out, lines: lines, els: els, cls: cls, li: 0, ci: 0, t: 0, done: false, rid: 0, rate: cadence(), gr: glitchRate() };
    typers.push(job);
    step(job);
    return job;
  }

  function step(job) {
    if (job.done) return;
    var t = now();
    if (t - job.t >= job.rate) {
      job.t = t;
      var line = job.lines[job.li];
      var el = job.els[job.li];
      if (job.ci < line.length) {
        job.ci++;
        var shown = line.slice(0, job.ci);
        // sparse ashen decay: the newest glyph briefly crumbles to an ash char,
        // then the next tick (or the line-finish) reveals the true one —
        // self-healing, so no character is ever lost. Never on the last glyph.
        if (job.ci < line.length && Math.random() < job.gr) {
          var ash = ASH.charAt((Math.random() * ASH.length) | 0);
          el.textContent = shown.slice(0, job.ci - 1) + ash;
          el.className = "con-line con-fx-glitch" + (job.cls ? " " + job.cls : "");
        } else {
          el.textContent = shown;
          el.className = "con-line" + (job.cls ? " " + job.cls : "");
        }
        keyTick();
        job.out.scrollTop = job.out.scrollHeight;
      }
      if (job.ci >= line.length) {
        el.textContent = line;
        el.className = "con-line con-fx-settle" + (job.cls ? " " + job.cls : "");
        job.li++; job.ci = 0;
        if (job.li >= job.lines.length) { finish(job); return; }
      }
    }
    job.rid = raf(function () { step(job); });
  }
  function finish(job) {
    job.done = true;
    if (job.rid) caf(job.rid);
    for (var i = 0; i < job.els.length; i++) { job.els[i].textContent = job.lines[i]; job.els[i].className = "con-line con-fx-settle" + (job.cls ? " " + job.cls : ""); }
    var idx = typers.indexOf(job); if (idx >= 0) typers.splice(idx, 1);
    if (job.out) job.out.scrollTop = job.out.scrollHeight;
  }
  function completeTyping() {
    var pending = typers.slice();
    for (var i = 0; i < pending.length; i++) finish(pending[i]);
    typers.length = 0;
  }
  function typing() { return typers.length > 0; }

  // ---- audio: diegetic bed + textural cues (opt-in via [ sound ]; off reduced)
  function audioReady() { return !reduced && soundFn && soundFn() && ctxFn && ctxFn(); }
  function keyTick() {
    var c = audioReady(); if (!c) return;
    var t = now(); if (t - lastTick < 24) return; lastTick = t;   // throttle: no machine-gun
    try {
      var t0 = c.currentTime, o = c.createOscillator(), g = c.createGain();
      o.type = "triangle"; o.frequency.value = 1650 + Math.random() * 500;
      g.gain.value = 0.0001; o.connect(g); g.connect(c.destination);
      g.gain.exponentialRampToValueAtTime(level === "full" ? 0.010 : 0.006, t0 + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);
      o.start(t0); o.stop(t0 + 0.05);
    } catch (e) {}
  }
  function noiseBuffer(c, secs) {
    var n = Math.floor(c.sampleRate * secs), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1);
    return b;
  }
  function startBed() {
    if (bed || !audioReady()) return;
    var c = ctxFn(); if (!c) return;
    try {
      var master = c.createGain(); master.gain.value = 0.0001; master.connect(c.destination);
      var o1 = c.createOscillator(); o1.type = "sine"; o1.frequency.value = 57.5;
      var o2 = c.createOscillator(); o2.type = "sine"; o2.frequency.value = 87.0;
      var g2 = c.createGain(); g2.gain.value = 0.35;
      var src = c.createBufferSource(); src.buffer = noiseBuffer(c, 2.2); src.loop = true;
      var lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 210; lp.Q.value = 0.6;
      var ng = c.createGain(); ng.gain.value = 0.5;
      o1.connect(master); o2.connect(g2); g2.connect(master);
      src.connect(lp); lp.connect(ng); ng.connect(master);
      o1.start(); o2.start(); src.start();
      // breathe up to a low ambient floor (full a hair louder than low)
      var floor = level === "full" ? 0.020 : 0.012;
      master.gain.exponentialRampToValueAtTime(floor, c.currentTime + 2.5);
      bed = { master: master, nodes: [o1, o2, src], floor: floor };
    } catch (e) { bed = null; }
  }
  function stopBed() {
    if (!bed) return;
    var c = ctxFn && ctxFn();
    try {
      if (c && bed.master) bed.master.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6);
      var nodes = bed.nodes; later(function () { for (var i = 0; i < nodes.length; i++) { try { nodes[i].stop(); } catch (e) {} } }, 700);
    } catch (e) {}
    bed = null;
  }
  function whoosh() {
    var c = audioReady(); if (!c) return;
    try {
      var t0 = c.currentTime, src = c.createBufferSource(); src.buffer = noiseBuffer(c, 0.5);
      var bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 520; bp.Q.value = 0.5;
      var g = c.createGain(); g.gain.value = 0.0001;
      src.connect(bp); bp.connect(g); g.connect(c.destination);
      g.gain.exponentialRampToValueAtTime(level === "full" ? 0.028 : 0.016, t0 + 0.10);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.34);
      bp.frequency.exponentialRampToValueAtTime(240, t0 + 0.34);
      src.start(t0); src.stop(t0 + 0.4);
    } catch (e) {}
  }
  function descendTone() {
    var c = audioReady(); if (!c) return;
    try {
      var t0 = c.currentTime, o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(116, t0);
      o.frequency.exponentialRampToValueAtTime(43.65, t0 + 1.6);
      g.gain.value = 0.0001; o.connect(g); g.connect(c.destination);
      g.gain.exponentialRampToValueAtTime(0.05, t0 + 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.9);
      o.start(t0); o.stop(t0 + 2.0);
      if (bed && bed.master) { bed.master.gain.exponentialRampToValueAtTime(Math.max(0.0002, bed.floor * 0.4), t0 + 0.4); bed.master.gain.exponentialRampToValueAtTime(bed.floor, t0 + 2.6); }
    } catch (e) {}
  }

  // ---- weight-events: visual jolt + descent crescendo ----------------------
  function jolt(cls, ms) {
    if (!motion() || !termEl || !termEl.classList) return;
    termEl.classList.add(cls);
    later(function () { if (termEl && termEl.classList) termEl.classList.remove(cls); }, ms || 260);
  }
  function onEvent(kind) {
    if (kind === "move") { if (motion()) whoosh(); }
    else if (kind === "blocked") { jolt("con-fx-jolt", 240); }
    else if (kind === "win") {
      // the descent close — the one place the effects are allowed to swell,
      // because the narrative does. The K269 sigil (already printed by
      // console.js) reveals into a dimming, sinking frame; a low tone falls.
      if (motion()) { jolt("con-fx-descend", 2800); descendTone(); }
    }
  }

  // ---- public surface (console.js wiring + the e2e hooks) ------------------
  win.ConsoleFx = {
    // lifecycle
    init: function (cfg) {
      cfg = cfg || {};
      termEl = cfg.term || null;
      reduced = !!cfg.reduced;
      ctxFn = (typeof cfg.ctx === "function") ? cfg.ctx : null;
      soundFn = (typeof cfg.sound === "function") ? cfg.sound : null;
      level = loadLevel();
      started = true;
      applyClasses();
      return this;
    },
    boot: function () { applyClasses(); },
    level: function () { return level; },
    setLevel: function (l) { if (LEVELS.indexOf(l) < 0) return level; level = l; saveLevel(level); applyClasses(); if (!on() || reduced) stopBed(); else startBed(); return level; },
    cycle: function () { var i = LEVELS.indexOf(level); return this.setLevel(LEVELS[(i + 1) % LEVELS.length]); },
    label: function () { return "[ crt: " + level + " ]"; },
    motion: motion,
    on: on,
    reduced: function () { return reduced; },
    // output
    typeBlock: typeBlock,
    complete: completeTyping,
    typing: typing,
    // events + audio
    onEvent: onEvent,
    setAudio: function (soundOn) { if (soundOn && on() && !reduced) startBed(); else stopBed(); },
    tick: keyTick,
    // e2e hooks
    _key: function () { return KEY; },
    _levels: function () { return LEVELS.slice(); },
    _classes: function () { return termEl ? termEl.className : ""; },
    _bedOn: function () { return !!bed; },
    _started: function () { return started; },
    _reset: function () { completeTyping(); stopBed(); }
  };
})();
