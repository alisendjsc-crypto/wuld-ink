/* console.js — the terminal shell for /console/ (K235).
   Renders a black command console into [data-console], parses input, and drives
   the pure console-engine.js. WebAudio synth is OPT-IN (no autoplay, no context
   until a user gesture) and is fully suppressed under prefers-reduced-motion,
   which also strips every animation. Own-key persistence: wuld:console:* only.
   FICTION ONLY — no argument-library import, no philosophical stance, ever. */
(function () {
  "use strict";

  var E = (typeof window !== "undefined" && window.ConsoleEngine) ? window.ConsoleEngine : null;
  var SG = (typeof window !== "undefined" && window.ConsoleSigil) ? window.ConsoleSigil : null;  // K269 seeded descent-sigil (pure; degrades if absent)
  var FX = (typeof window !== "undefined" && window.ConsoleFx) ? window.ConsoleFx : null;         // K273 text-effects layer (opt-in; degrades if absent)
  var AUDIO_KEY = "wuld:console:audio";     // own-key namespace: wuld:console:*
  var doc = (typeof document !== "undefined") ? document : null;
  if (!doc) return;

  var reduced = false;
  try { reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) {}

  // ---- module state
  var mount = null, out = null, input = null, statusEl = null, soundBtn = null, crtBtn = null;
  var TYPE = { type: true };   // K273: mark a print as a typeout "chosen surface"
  var world = null, state = null, audioOn = false, ctx = null;
  var history = [], hIdx = -1;
  var HELP = [
    "commands —",
    "  north / n   south / s   east / e   west / w    move",
    "  look / l                                        describe where you are",
    "  examine <thing> / x <thing>                     look closer",
    "  take / get                                      pick up what's here",
    "  inventory / i                                   what you carry",
    "  map / m                                         what you have walked",
    "  new [word]                                      a new structure (name the seed)",
    "  seed                                            show this run's seed",
    "  share                                           a link back to this exact descent",
    "  sigil [ascii|save]                              the mark this seed leaves",
    "  help / ?                                        this list"
  ].join("\n");

  function el(tag, cls) { var e = doc.createElement(tag); if (cls) e.className = cls; return e; }

  // ---------------------------------------------------------------- output
  function print(text, cls, opts) {
    if (!out) return;
    if (FX && opts && opts.type && FX.on()) { FX.typeBlock(out, text, cls); return; }   // K273: typeout on chosen surfaces
    var lines = String(text == null ? "" : text).split("\n");
    for (var i = 0; i < lines.length; i++) {
      var ln = el("div", "con-line" + (cls ? " " + cls : "") + (reduced ? "" : " con-reveal"));
      ln.textContent = lines[i];
      out.appendChild(ln);
    }
    out.scrollTop = out.scrollHeight;
  }
  function echo(cmd) { print("> " + cmd, "con-echo"); }

  // ---------------------------------------------------------------- audio (opt-in, no autoplay)
  function ensureCtx() {
    if (reduced || !audioOn) return null;
    if (ctx) return ctx;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      if (ctx.state === "suspended" && ctx.resume) { try { ctx.resume(); } catch (e) {} }
    } catch (e) { ctx = null; }
    return ctx;
  }
  function tone(freq, dur, type, gain, when) {
    var c = ensureCtx(); if (!c) return;
    try {
      var t0 = c.currentTime + (when || 0);
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.value = 0.0001;
      o.connect(g); g.connect(c.destination);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain || 0.05), t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) {}
  }
  function cue(kind) {
    if (reduced || !audioOn) return;
    if (kind === "move") tone(196, 0.13, "sine", 0.05);
    else if (kind === "blocked") { tone(92, 0.22, "sawtooth", 0.045); tone(96, 0.22, "sine", 0.03, 0.01); }
    else if (kind === "take") { tone(523.25, 0.10, "triangle", 0.05); tone(784, 0.09, "sine", 0.03, 0.03); }
    else if (kind === "win") { tone(220, 0.5, "sine", 0.05); tone(174.61, 0.6, "sine", 0.045, 0.18); tone(130.81, 0.9, "sine", 0.05, 0.36); }
    else if (kind === "error") tone(110, 0.10, "square", 0.03);
    else tone(320, 0.05, "sine", 0.03);   // look / examine — a faint tick
  }
  function loadAudioPref() {
    try { return localStorage.getItem(AUDIO_KEY) === "1"; } catch (e) { return false; }
  }
  function saveAudioPref(on) {
    try { localStorage.setItem(AUDIO_KEY, on ? "1" : "0"); } catch (e) {}
  }
  function setSound(on) {
    if (reduced) { audioOn = false; if (FX) FX.setAudio(false); renderSound(); return; }
    audioOn = !!on; saveAudioPref(audioOn);
    if (audioOn) { ensureCtx(); cue("take"); }   // confirm chirp on this gesture
    if (FX) FX.setAudio(audioOn);                 // K273: start/stop the diegetic ambient bed
    renderSound();
  }
  function renderSound() {
    if (!soundBtn) return;
    if (reduced) { soundBtn.textContent = "[ sound: off ]"; soundBtn.setAttribute("aria-pressed", "false"); soundBtn.disabled = true; soundBtn.title = "muted under reduced-motion"; }
    else { soundBtn.textContent = audioOn ? "[ sound: on ]" : "[ sound: off ]"; soundBtn.setAttribute("aria-pressed", audioOn ? "true" : "false"); soundBtn.disabled = false; }
  }
  function renderCrt() {                             // K273: the [ crt ] toggle label (off / low / full)
    if (!crtBtn) return;
    crtBtn.textContent = FX ? FX.label() : "[ crt ]";
    crtBtn.setAttribute("aria-pressed", (FX && FX.on()) ? "true" : "false");
    if (FX && reduced) crtBtn.title = "reduced-motion — effects shown static";
  }

  // ---------------------------------------------------------------- game
  function randSeed() {
    var s = "";
    try { s = Math.random().toString(36).slice(2, 8); } catch (e) {}
    return s || "descent";
  }
  // ---- seed-share (K267): a deterministic world means a link IS the world.
  // The seed is an opaque, sanitised string — only ever a genWorld() argument;
  // never a storage key, never evaluated, never a stance token. FICTION ONLY.
  var SHARE_BASE = "https://wuld.ink/console/";
  function normalizeSeed(s) {
    s = String(s == null ? "" : s).toLowerCase();
    s = s.replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]+/g, "").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
    return s.length > 48 ? s.slice(0, 48) : s;   // idempotent; safe URL charset
  }
  function readHashSeed() {
    var h = "";
    try { h = (window.location && window.location.hash) || ""; } catch (e) { h = ""; }
    var m = /[#&]seed=([^&]*)/i.exec(String(h));
    if (!m) return null;
    var raw = m[1];
    try { raw = decodeURIComponent(raw); } catch (e) {}   // keep raw on a malformed %-escape
    var s = normalizeSeed(raw);
    return s || null;                             // empty after sanitise -> fall through
  }
  function shareLink() {
    return SHARE_BASE + "#seed=" + ((world && world.seed) ? world.seed : "");
  }
  function copyText(text) {
    var okc = false;
    try { if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(String(text)); okc = true; } } catch (e) {}
    if (!okc) {
      try {
        var ta = doc.createElement("textarea");
        ta.value = String(text); ta.setAttribute("readonly", "");
        ta.style.position = "absolute"; ta.style.left = "-9999px";
        (doc.body || mount).appendChild(ta);
        if (ta.select) ta.select();
        okc = !!(doc.execCommand && doc.execCommand("copy"));
        if (ta.parentNode) ta.parentNode.removeChild(ta);
      } catch (e2) { okc = false; }
    }
    return okc;
  }
  function shareOut() {
    if (!world) return;
    var link = shareLink();
    print("a way back in, for someone else:", "con-sys");
    print("  " + link);
    if (copyText(link)) print("— copied.", "con-dim");
    cue("take");
  }
  // ---- descent-sigil (K269): a deterministic mark from the SAME seed as the world.
  // ConsoleSigil.svgFor() returns geometry-only markup (no seed text is ever placed
  // inside it — the seed is drawn purely as numbers), so injecting the trusted string
  // carries no user input. Static; unchanged under reduced-motion; own no storage.
  function sigilName(s) { return (String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9-]+/g, "").slice(0, 48)) || "descent"; }
  function downloadSigil() {
    if (!SG || !world) return false;
    try {
      var a = doc.createElement("a");
      a.href = SG.toDataURL(world.seed);
      a.download = "descent-" + sigilName(world.seed) + ".svg";
      (doc.body || mount).appendChild(a); a.click();
      if (a.parentNode) a.parentNode.removeChild(a);
      return true;
    } catch (e) { return false; }
  }
  function printSigil() {
    if (!out || !SG || !world) return;
    var box = el("div", "con-sigil");
    box.style.margin = "0.5rem 0"; box.style.lineHeight = "0";
    box.innerHTML = SG.svgFor(world.seed);        // trusted machine-generated geometry
    out.appendChild(box);
    var foot = el("div", "con-sigil-foot"); foot.style.margin = "0 0 0.4rem";
    var save = el("button", "con-btn"); save.type = "button"; save.textContent = "[ save ]";
    save.addEventListener("click", function () { if (downloadSigil()) print("— mark saved.", "con-dim"); if (input) input.focus(); });
    foot.appendChild(save); out.appendChild(foot);
    out.scrollTop = out.scrollHeight;
  }
  function sigilReveal() {                          // fires on the descent close only
    if (!SG || !world) return;
    print("— its mark —", "con-dim");
    printSigil();
  }
  function sigilOut(arg) {
    if (!SG || !world) { print("There is no mark to draw yet.", "con-dim"); return; }
    arg = (arg || "").trim().toLowerCase();
    if (arg === "ascii" || arg === "text") { print(SG.asciiSigil(world.seed), "con-sigil-ascii"); cue("look"); return; }
    if (arg === "save") { if (downloadSigil()) print("— mark saved.", "con-dim"); else print("Could not save the mark.", "con-dim"); return; }
    print("the mark this seed leaves:", "con-sys");
    printSigil();
    cue("look");
  }
  function persist() { if (E && state) E.save(state, safeLS()); }
  function safeLS() {
    return { setItem: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
      getItem: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      removeItem: function (k) { try { localStorage.removeItem(k); } catch (e) {} } };
  }
  function newGame(seed) {
    if (!E) return;
    var s = (seed == null) ? randSeed() : normalizeSeed(seed);
    if (!s) s = randSeed();                       // exotic/empty input -> a real random world
    world = E.genWorld(s);
    state = E.newState(world);
    persist();
    print("");
    print("A new structure closes around you.", "con-sys");
    print(E.describe(world, state, state.pos), null, TYPE);
  }
  function resume() {
    if (!E) return false;
    var saved = E.load(safeLS());
    if (!saved) return false;
    world = E.genWorld(saved.seed);
    // clamp restored position to a real room
    if (saved.pos < 0 || saved.pos >= world.rooms.length) saved.pos = world.startId;
    state = saved;
    print("You are still here. You never left.", "con-sys");
    print(E.describe(world, state, state.pos), null, TYPE);
    return true;
  }

  function apply(res) {
    state = res.state; persist();
    if (res.event === "win") {
      print(res.msg);                          // land the terminus immediately, so the mark + swell follow in order in EVERY fx state
      sigilReveal();                           // the warded door made visible — the mark is the last thing you see going down
      cue("win");
      if (FX) FX.onEvent("win");               // K273: the descent crescendo (dim + falling tone) frames the mark
    } else {
      print(res.msg, null, TYPE);              // K273: the structure narrates the room — typeout on this chosen surface
      cue(res.event);
      if (FX) FX.onEvent(res.event);           // K273: a cold whoosh on a move, a brief jolt on a blocked wall
    }
    updateStatus();
  }
  function updateStatus() {
    if (!statusEl || !world || !state) return;
    var carry = state.inv.length;
    statusEl.textContent = "moves " + state.turns + "  ·  carrying " + carry + "  ·  seen " + state.visited.length + "/" + world.rooms.length + (state.done ? "  ·  descended" : "");
  }

  // ---------------------------------------------------------------- parser
  function exec(line) {
    if (FX && FX.typing()) FX.complete();   // K273: a new command finishes any in-flight typeout
    line = String(line == null ? "" : line).trim();
    if (!line) return;
    if (!E || !world || !state) { print("The console is not ready."); return; }
    var sp = line.indexOf(" ");
    var verb = (sp < 0 ? line : line.slice(0, sp)).toLowerCase();
    var rest = (sp < 0 ? "" : line.slice(sp + 1)).trim();

    if (verb === "n" || verb === "north" || verb === "s" || verb === "south" ||
        verb === "e" || verb === "east" || verb === "w" || verb === "west") {
      apply(E.move(world, state, verb)); return;
    }
    if (verb === "go" || verb === "move") { apply(E.move(world, state, rest)); return; }
    if (verb === "l" || verb === "look") { apply(E.look(world, state)); return; }
    if (verb === "x" || verb === "examine" || verb === "inspect") { apply(E.examine(world, state, rest)); return; }
    if (verb === "take" || verb === "get" || verb === "grab") { apply(E.take(world, state)); return; }
    if (verb === "i" || verb === "inv" || verb === "inventory") { apply(E.inventory(world, state)); return; }
    if (verb === "m" || verb === "map") { print(E.renderMap(world, state)); cue("look"); return; }
    if (verb === "help" || verb === "?" || verb === "commands") { print(HELP, null, TYPE); return; }
    if (verb === "seed") { print("seed: " + (world.seed || "(empty)")); return; }
    if (verb === "share") { shareOut(); return; }
    if (verb === "sigil" || verb === "mark") { sigilOut(rest); return; }
    if (verb === "new" || verb === "restart") { newGame(rest || undefined); updateStatus(); return; }
    if (verb === "clear" || verb === "cls") { if (out) out.innerHTML = ""; return; }
    print("I don't understand \"" + verb + "\". Type  help  for the commands.", "con-dim");
    cue("error");
  }

  // ---------------------------------------------------------------- build DOM
  function render(host) {
    host.innerHTML = "";
    var term = el("div", "con-term" + (reduced ? " con-reduced" : ""));
    var head = el("div", "con-head");
    var title = el("span", "con-title"); title.textContent = "wuld://console";
    statusEl = el("span", "con-status"); statusEl.setAttribute("role", "status"); statusEl.setAttribute("aria-live", "polite");
    head.appendChild(title); head.appendChild(statusEl);

    out = el("div", "con-out"); out.setAttribute("role", "log"); out.setAttribute("aria-live", "polite"); out.setAttribute("aria-label", "console output"); out.tabIndex = 0;

    var inRow = el("form", "con-in-row");
    var prompt = el("span", "con-prompt"); prompt.textContent = ">"; prompt.setAttribute("aria-hidden", "true");
    input = el("input", "con-in");
    input.type = "text"; input.setAttribute("autocomplete", "off"); input.setAttribute("autocapitalize", "none");
    input.setAttribute("spellcheck", "false"); input.setAttribute("aria-label", "type a command"); input.setAttribute("data-wh", "none");
    input.placeholder = "north, look, take, map, help…";
    inRow.appendChild(prompt); inRow.appendChild(input);

    var ctrl = el("div", "con-ctrl");
    soundBtn = el("button", "con-btn"); soundBtn.type = "button";
    crtBtn = el("button", "con-btn"); crtBtn.type = "button";
    var helpBtn = el("button", "con-btn"); helpBtn.type = "button"; helpBtn.textContent = "[ help ]";
    var mapBtn = el("button", "con-btn"); mapBtn.type = "button"; mapBtn.textContent = "[ map ]";
    var newBtn = el("button", "con-btn"); newBtn.type = "button"; newBtn.textContent = "[ new ]";
    var shareBtn = el("button", "con-btn"); shareBtn.type = "button"; shareBtn.textContent = "[ share ]";
    var sigilBtn = el("button", "con-btn"); sigilBtn.type = "button"; sigilBtn.textContent = "[ sigil ]";
    ctrl.appendChild(soundBtn); ctrl.appendChild(crtBtn); ctrl.appendChild(mapBtn); ctrl.appendChild(shareBtn); ctrl.appendChild(sigilBtn); ctrl.appendChild(helpBtn); ctrl.appendChild(newBtn);

    term.appendChild(head); term.appendChild(out); term.appendChild(inRow); term.appendChild(ctrl);
    host.appendChild(term);

    // K273: bring the effects layer up over this terminal (opt-in; reads the stored fx pref, applies its classes)
    if (FX) FX.init({ term: term, reduced: reduced, ctx: ensureCtx, sound: function () { return audioOn; } });

    // wire
    inRow.addEventListener("submit", function (ev) { ev.preventDefault(); submit(); });
    input.addEventListener("keydown", function (ev) {
      if (FX && FX.typing()) FX.complete();   // K273: any key completes an in-flight typeout
      if (ev.key === "ArrowUp") { ev.preventDefault(); histStep(-1); }
      else if (ev.key === "ArrowDown") { ev.preventDefault(); histStep(1); }
    });
    soundBtn.addEventListener("click", function () { setSound(!audioOn); if (input) input.focus(); });
    crtBtn.addEventListener("click", function () { if (FX) { FX.cycle(); renderCrt(); } if (input) input.focus(); });
    helpBtn.addEventListener("click", function () { print(HELP); if (input) input.focus(); });
    mapBtn.addEventListener("click", function () { if (world && state) print(E.renderMap(world, state)); if (input) input.focus(); });
    newBtn.addEventListener("click", function () { newGame(); updateStatus(); if (input) input.focus(); });
    shareBtn.addEventListener("click", function () { shareOut(); if (input) input.focus(); });
    sigilBtn.addEventListener("click", function () { sigilOut(""); if (input) input.focus(); });
    out.addEventListener("click", function () { if (input) input.focus(); });

    renderSound();
    renderCrt();
  }
  function submit() {
    if (!input) return;
    var v = input.value.trim();
    if (!v) return;
    echo(v);
    history.push(v); if (history.length > 50) history.shift(); hIdx = history.length;
    input.value = "";
    exec(v);
    input.focus();
  }
  function histStep(d) {
    if (!history.length || !input) return;
    hIdx = Math.max(0, Math.min(history.length, hIdx + d));
    input.value = hIdx < history.length ? history[hIdx] : "";
  }

  // ---------------------------------------------------------------- boot
  function boot() {
    mount = doc.querySelector("[data-console]");
    if (!mount) return false;
    if (!E) { mount.textContent = "The console engine failed to load."; return false; }
    render(mount);
    audioOn = !reduced && loadAudioPref();  // reflect pref; NO context until a gesture
    renderSound();
    print("wuld://console  —  a descent, generated from a seed.", "con-sys");
    print("Type  help  for commands.  You wake at the threshold; the way back is a wall now.", "con-dim");
    if (FX && reduced && FX.on()) print("(reduced-motion: the console holds still)", "con-dim");
    var shared = readHashSeed();
    if (shared) { newGame(shared); }               // a shared descent overrides the local resume
    else if (!resume()) { newGame(randSeed()); }
    updateStatus();
    try { if (input) input.focus(); } catch (e) {}
    return true;
  }

  // public surface (also the e2e's hooks)
  window.wuldConsole = {
    boot: boot, exec: exec,
    _boot: boot, _mount: function () { return !!doc.querySelector("[data-console]"); },
    _exec: exec, _state: function () { return state; }, _world: function () { return world; },
    _new: function (s) { newGame(s); updateStatus(); }, _resume: resume,
    _shareLink: function () { return (world && state) ? shareLink() : null; },
    _normSeed: normalizeSeed, _hashSeed: readHashSeed, _share: shareOut,
    _reduced: function () { return reduced; },
    _audio: function () { return { on: audioOn, ctx: !!ctx }; },
    _setSound: setSound, _cue: cue, _outText: function () { return out ? out.textContent || (out.children ? Array.prototype.map.call(out.children, function (c) { return c.textContent; }).join("\n") : "") : ""; },
    _sigilAPI: function () { return SG; },
    _sigilSVG: function () { return (SG && world) ? SG.svgFor(world.seed) : null; },
    _sigilSpec: function () { return (SG && world) ? SG.genSigil(world.seed) : null; },
    _sigilAscii: function () { return (SG && world) ? SG.asciiSigil(world.seed) : null; },
    _sigilOut: sigilOut, _outHTML: function () { return out ? out.innerHTML : ""; },
    _fx: function () { return FX; }
  };

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
