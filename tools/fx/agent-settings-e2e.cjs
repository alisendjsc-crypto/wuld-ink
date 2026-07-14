#!/usr/bin/env node
/* agent-settings-e2e.cjs — public FX/voice settings card proof (K231).
   ===========================================================================
   Drives the REAL src/components/agent-settings.js inside a tiny zero-dep DOM /
   localStorage / matchMedia shim (no jsdom — matches the repo's other .cjs
   gates). Proves the K231 settings-panel contract:
     • renders one control per site-fx.json entry (groups + all control types)
     • wires each control to the LIVE public API by `target` (WuldWrongHour /
       YureiVoice set/get, bed/mood/play, speak) — the SAME registry the sealed
       /_/fx-bench/ renders
     • persists ONLY its own state under its own namespace (wuld:agentfx:*);
       never writes the component stores or wuld:persona-active
     • reduced-motion path: mount flagged + CSS strips transitions
     • APIs absent -> renders + no-ops without throwing (progressive)
   Not a substitute for yurei-parity / omega-persona-gate; this proves the
   public control LAYER, which touches no matcher/corpus byte. */
"use strict";
const fs = require("fs");
const path = require("path");
const COMP = path.join(__dirname, "..", "..", "src", "components");
const SRC = fs.readFileSync(path.join(COMP, "agent-settings.js"), "utf8");
const CSS = fs.readFileSync(path.join(COMP, "agent-settings.css"), "utf8");
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, "");   // fences test executable code, not the header prose

let pass = 0, fail = 0; const fails = [];
function ok(name, cond, got) { if (cond) pass++; else { fail++; fails.push(name + "  (got: " + JSON.stringify(got) + ")"); } }

// registry mirror (site-fx.json shape): 4 groups, 9 controls, every type
const CFG = { groups: [
  { id: "master", label: "Master", controls: [
    { id: "sfx", label: "SFX volume", type: "range", min: 0, max: 1, step: 0.05, default: 0.35, target: "wronghour.sfx" },
    { id: "vfx", label: "VFX", type: "range", min: 0, max: 1, step: 0.05, default: 0.35, target: "wronghour.vfx" } ] },
  { id: "bed", label: "Ambient bed", controls: [
    { id: "bedOn", label: "Bed on", type: "toggle", default: true, target: "wronghour.bedOn" },
    { id: "bedMood", label: "Bed mood", type: "select", options: ["room", "clinical", "oceanic", "breeze"], default: "breeze", target: "wronghour.mood" } ] },
  { id: "cues", label: "Cues", controls: [
    { id: "boot", label: "boot", type: "cue", cue: "boot", target: "wronghour.play" } ] },
  { id: "voice", label: "Her voice", controls: [
    { id: "voiceOn", label: "Voice on", type: "toggle", default: false, target: "voice.on" },
    { id: "voiceStyle", label: "Style", type: "select", options: ["inner", "animalese", "whisper"], default: "inner", target: "voice.style" },
    { id: "voiceVolume", label: "Volume", type: "range", min: 0, max: 1.5, step: 0.05, default: 1, target: "voice.volume" },
    { id: "voiceSay", label: "Say a line", type: "speak", default: "the desk is attended", target: "voice.speak" } ] }
] };

// ---------------------------------------------------------------- DOM shim
function Elem(tag) {
  this.tagName = tag; this.children = []; this.parentNode = null;
  this._cls = {}; this._attrs = {}; this._ls = {};
  this.textContent = ""; this.type = ""; this.value = ""; this.id = ""; this.hidden = false; this.selected = false;
  const el = this;
  this.classList = {
    add: function () { for (let i = 0; i < arguments.length; i++) el._cls[arguments[i]] = 1; },
    remove: function () { for (let i = 0; i < arguments.length; i++) delete el._cls[arguments[i]]; },
    toggle: function (c, f) { const has = !!el._cls[c]; const on = (f === undefined) ? !has : !!f; if (on) el._cls[c] = 1; else delete el._cls[c]; return on; },
    contains: function (c) { return !!el._cls[c]; }
  };
}
Elem.prototype.setAttribute = function (k, v) { this._attrs[k] = String(v); };
Elem.prototype.getAttribute = function (k) { return (k in this._attrs) ? this._attrs[k] : null; };
Elem.prototype.appendChild = function (c) { c.parentNode = this; this.children.push(c); return c; };
Elem.prototype.removeChild = function (c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; };
Elem.prototype.addEventListener = function (t, fn) { (this._ls[t] = this._ls[t] || []).push(fn); };
Elem.prototype.fire = function (t, ev) { const self = this; (this._ls[t] || []).forEach(function (fn) { fn.call(self, ev || {}); }); };
Object.defineProperty(Elem.prototype, "className", {
  get: function () { return Object.keys(this._cls).join(" "); },
  set: function (v) { this._cls = {}; String(v).split(/\s+/).forEach(function (c) { if (c) this._cls[c] = 1; }, this); }
});
Object.defineProperty(Elem.prototype, "innerHTML", {
  get: function () { return this._html || ""; },
  set: function (v) { this._html = String(v); if (v === "") this.children.length = 0; }
});

function collect(node, pred, out) { for (let i = 0; i < node.children.length; i++) { const c = node.children[i]; if (pred(c)) out.push(c); collect(c, pred, out); } return out; }
function byClass(root, cls) { return collect(root, function (c) { return !!c._cls[cls]; }, []); }
function ranges(root) { return collect(root, function (c) { return c.tagName === "input" && c.type === "range"; }, []); }
function selects(root) { return collect(root, function (c) { return c.tagName === "select"; }, []); }
function texts(root) { return collect(root, function (c) { return c.tagName === "input" && c.type === "text"; }, []); }
function walk(node, pred) { for (let i = 0; i < node.children.length; i++) { const c = node.children[i]; if (pred(c)) return c; const r = walk(c, pred); if (r) return r; } return null; }

function mockWH() {
  const calls = []; const s = { sfx: 0.35, vfx: 0.35, bedOn: true, bedMood: "breeze" };
  return { _calls: calls,
    set: function (o) { calls.push(["set", o]); if (o) { if ("sfx" in o) s.sfx = o.sfx; if ("vfx" in o) s.vfx = o.vfx; } },
    bed: function (b) { calls.push(["bed", b]); s.bedOn = !!b; },
    mood: function (m) { calls.push(["mood", m]); s.bedMood = m; },
    play: function (c) { calls.push(["play", c]); },
    get: function () { return { sfx: s.sfx, vfx: s.vfx, bedOn: s.bedOn, bedMood: s.bedMood }; } };
}
function mockVoice() {
  const calls = []; const s = { on: false, style: "inner", pitch: 1, rate: 1, volume: 1 };
  return { _calls: calls,
    set: function (o) { calls.push(["set", o]); if (o) for (const k in o) s[k] = o[k]; },
    speak: function (t, opt) { calls.push(["speak", t, opt]); },
    get: function () { return { on: s.on, style: s.style, pitch: s.pitch, rate: s.rate, volume: s.volume }; } };
}
function had(calls, name, kv) {
  return calls.some(function (c) {
    if (c[0] !== name) return false;
    if (kv === undefined) return true;
    if (typeof kv === "object") { const o = c[1] || {}; for (const k in kv) if (o[k] !== kv[k]) return false; return true; }
    return c[1] === kv;
  });
}

function makeWorld(opts) {
  opts = opts || {};
  const head = new Elem("head"), body = new Elem("body");
  const panel = new Elem("div"); panel.id = "agent-fx-panel"; body.appendChild(panel);
  const doc = {
    readyState: "complete", head: head, body: body,
    createElement: function (t) { return new Elem(t); },
    getElementById: function (id) { return walk(body, function (c) { return c.id === id; }) || walk(head, function (c) { return c.id === id; }); },
    querySelector: function (sel) {
      if (sel[0] === "#") { const id = sel.slice(1); return walk(body, function (c) { return c.id === id; }); }
      if (sel[0] === ".") { const cl = sel.slice(1); return walk(body, function (c) { return !!c._cls[cl]; }); }
      return null;
    },
    addEventListener: function () {}
  };
  const store = Object.assign({}, opts.store || {});
  const writes = [];
  const ls = { getItem: function (k) { return (k in store) ? store[k] : null; }, setItem: function (k, v) { store[k] = String(v); writes.push(k); } };
  const RM = !!opts.reducedMotion;
  const win = {
    setTimeout: function (fn) { if (fn) fn(); return 1; },
    matchMedia: function (q) { return { matches: RM, media: q, addListener: function () {}, addEventListener: function () {} }; }
  };
  if (opts.wh) win.WuldWrongHour = opts.wh;
  if (opts.voice) win.YureiVoice = opts.voice;

  global.window = win; global.document = doc; global.localStorage = ls;
  eval(SRC);   // the module's IIFE boots against this world (no fetch -> boot() no-ops)
  return { win, doc, head, body, panel, ls, store, writes, P: win.wuldAgentFx };
}

// ---------------------------------------------------------------- PASS 1: render + wire (APIs present)
(function () {
  const wh = mockWH(), voice = mockVoice();
  const w = makeWorld({ wh: wh, voice: voice });
  ok("boot: no premature build (no fetch env)", w.P.built() === false, w.P.built());
  w.P._build(CFG);
  ok("build: built flag set", w.P.built() === true, w.P.built());
  ok("render: 4 groups from registry", byClass(w.body, "agent-fx-grp").length === 4, byClass(w.body, "agent-fx-grp").length);
  ok("render: 9 control rows from registry", byClass(w.body, "agent-fx-ctl").length === 9, byClass(w.body, "agent-fx-ctl").length);
  ok("render: disclosure button present", byClass(w.body, "agent-fx-disclose").length === 1, byClass(w.body, "agent-fx-disclose").length);

  const rg = ranges(w.body), sl = selects(w.body), tg = byClass(w.body, "agent-fx-tgl"), cu = byClass(w.body, "agent-fx-cue"), tx = texts(w.body);
  ok("render: 3 ranges (sfx,vfx,voiceVolume)", rg.length === 3, rg.length);
  ok("render: 2 selects (mood,style)", sl.length === 2, sl.length);
  ok("render: 2 toggles (bedOn,voiceOn)", tg.length === 2, tg.length);
  ok("render: 2 cue buttons (boot,say)", cu.length === 2, cu.length);

  // wire: SFX range -> WuldWrongHour.set({sfx})
  rg[0].value = "0.7"; rg[0].fire("input");
  ok("wire: sfx range -> WuldWrongHour.set({sfx})", had(wh._calls, "set", { sfx: 0.7 }), wh._calls);
  rg[1].value = "0.2"; rg[1].fire("input");
  ok("wire: vfx range -> WuldWrongHour.set({vfx})", had(wh._calls, "set", { vfx: 0.2 }), wh._calls);
  // wire: bed toggle -> WuldWrongHour.bed(bool) (default on -> click => off)
  tg[0].fire("click");
  ok("wire: bed toggle -> WuldWrongHour.bed(false)", had(wh._calls, "bed", false), wh._calls);
  // wire: mood select -> WuldWrongHour.mood(name)
  sl[0].value = "oceanic"; sl[0].fire("change");
  ok("wire: mood select -> WuldWrongHour.mood('oceanic')", had(wh._calls, "mood", "oceanic"), wh._calls);
  // wire: cue -> WuldWrongHour.play(cue)
  cu[0].fire("click");
  ok("wire: cue -> WuldWrongHour.play('boot')", had(wh._calls, "play", "boot"), wh._calls);
  // wire: voice on toggle -> YureiVoice.set({on:true})
  tg[1].fire("click");
  ok("wire: voice toggle -> YureiVoice.set({on:true})", had(voice._calls, "set", { on: true }), voice._calls);
  // wire: voice style select -> YureiVoice.set({style})
  sl[1].value = "whisper"; sl[1].fire("change");
  ok("wire: style select -> YureiVoice.set({style:'whisper'})", had(voice._calls, "set", { style: "whisper" }), voice._calls);
  // wire: voice volume range -> YureiVoice.set({volume})
  rg[2].value = "1.3"; rg[2].fire("input");
  ok("wire: volume range -> YureiVoice.set({volume:1.3})", had(voice._calls, "set", { volume: 1.3 }), voice._calls);
  // wire: speak -> YureiVoice.speak(text,{force})
  cu[1].fire("click");
  ok("wire: say -> YureiVoice.speak(text,{force:true})", had(voice._calls, "speak", "the desk is attended") && voice._calls.some(function (c) { return c[0] === "speak" && c[2] && c[2].force === true; }), voice._calls);

  // own-key isolation: only wuld:agentfx:* ever written (component set()s are mocks; they don't touch LS)
  const alien = w.writes.filter(function (k) { return k.indexOf("wuld:agentfx:") !== 0; });
  ok("isolation: only wuld:agentfx:* keys written", alien.length === 0, alien);
  ok("isolation: never writes a component/persona key", w.writes.indexOf("wuld:wrongHour") === -1 && w.writes.indexOf("wuld:yurei.voice") === -1 && w.writes.indexOf("wuld:persona-active") === -1, w.writes);

  // disclosure: default collapsed, toggles + persists own key
  ok("disclosure: default collapsed (empty store)", w.P.isOpen() === false, w.P.isOpen());
  byClass(w.body, "agent-fx-disclose")[0].fire("click");
  ok("disclosure: opens on click", w.P.isOpen() === true, w.P.isOpen());
  ok("disclosure: persisted under own key", w.store["wuld:agentfx:open"] === "1", w.store["wuld:agentfx:open"]);
})();

// ---------------------------------------------------------------- PASS 2: liveValue reads from get()
(function () {
  const wh = mockWH(); wh.get = function () { return { sfx: 0.9, vfx: 0.1, bedOn: false, bedMood: "clinical" }; };
  const w = makeWorld({ wh: wh, voice: mockVoice() });
  w.P._build(CFG);
  const rg = ranges(w.body), sl = selects(w.body);
  ok("liveValue: sfx range seeds from WuldWrongHour.get() (0.9)", String(rg[0].value) === "0.9", rg[0].value);
  ok("liveValue: mood select seeds from get() (clinical)", sl[0].value === "clinical" || walk(w.body, function (c) { return c.tagName === "option" && c.value === "clinical" && c.selected; }) != null, sl[0].value);
})();

// ---------------------------------------------------------------- PASS 3: returning visitor (own key preset)
(function () {
  const w = makeWorld({ wh: mockWH(), voice: mockVoice(), store: { "wuld:agentfx:open": "1" } });
  w.P._build(CFG);
  ok("returning: panel restored open from own key", w.P.isOpen() === true, w.P.isOpen());
})();

// ---------------------------------------------------------------- PASS 4: reduced-motion
(function () {
  const w = makeWorld({ wh: mockWH(), voice: mockVoice(), reducedMotion: true });
  w.P._build(CFG);
  ok("reduced-motion: mount carries agent-fx-reduced", w.panel.classList.contains("agent-fx-reduced"), w.panel.className);
  const rm = CSS.slice(CSS.indexOf("prefers-reduced-motion"));
  ok("reduced-motion CSS: strips transition", /transition:\s*none/.test(rm), "transition:none");
})();

// ---------------------------------------------------------------- PASS 5: APIs absent -> renders + no-ops, no throw
(function () {
  const w = makeWorld({});   // no window.WuldWrongHour / YureiVoice
  let threw = null;
  try {
    w.P._build(CFG);
    const rg = ranges(w.body), sl = selects(w.body), tg = byClass(w.body, "agent-fx-tgl"), cu = byClass(w.body, "agent-fx-cue");
    if (rg[0]) { rg[0].value = "0.5"; rg[0].fire("input"); }
    if (tg[0]) tg[0].fire("click");
    if (sl[0]) { sl[0].value = "room"; sl[0].fire("change"); }
    if (cu[0]) cu[0].fire("click");
    if (tg[1]) tg[1].fire("click");   // voice.on with no YureiVoice -> ensureVoice injects a <script>; must not throw
  } catch (e) { threw = e && e.message; }
  ok("no-API: build + all interactions never throw", threw === null, threw);
  ok("no-API: still renders 9 controls (progressive)", byClass(w.body, "agent-fx-ctl").length === 9, byClass(w.body, "agent-fx-ctl").length);
  const alien = w.writes.filter(function (k) { return k.indexOf("wuld:agentfx:") !== 0; });
  ok("no-API: still only own-key writes", alien.length === 0, alien);
})();

// ---------------------------------------------------------------- source fences (static)
ok("fence: module namespaces its store (wuld:agentfx:)", /wuld:agentfx:/.test(CODE), "own prefix");
ok("fence: never writes the wrong-hour component store key", !/["']wuld:wrongHour/.test(CODE), "no wuld:wrongHour write");
ok("fence: never writes the voice component store key", !/["']wuld:yurei\.voice/.test(CODE), "no wuld:yurei.voice write");
ok("fence: never writes wuld:persona-active", !/["']wuld:persona-active/.test(CODE), "no persona key write");
ok("fence: no operator/moderation surface referenced", !/moderation|gallery-cms|gap-log|admin\.wuld/i.test(CODE), "fx/voice only");
ok("fence: wires only WuldWrongHour + YureiVoice", /WuldWrongHour/.test(CODE) && /YureiVoice/.test(CODE), "public APIs");

// ---------------------------------------------------------------- report
console.log("== K231 agent-settings (public FX/voice card) e2e ==");
console.log("pass=" + pass + "  fail=" + fail);
if (fails.length) { console.log("\n-- FAILURES --"); fails.forEach(function (f) { console.log("  RED  " + f); }); }
console.log("\n" + (fail === 0
  ? "AGENT-SETTINGS E2E: GREEN — renders from site-fx.json registry, wires every control to the live WuldWrongHour/YureiVoice API, own-key store only, reduced-motion flagged, degrades to a clean no-op when the APIs are absent."
  : "AGENT-SETTINGS E2E: RED"));
process.exit(fail === 0 ? 0 : 1);
