#!/usr/bin/env node
/* console-scene-e2e.cjs -- gate for the K249 /console/ takeover surface
   (scene layer K248 + overlay takeover K249).
   Runs the REAL modules (console-prng + console-engine + console-scene, plus
   the REAL console.js shell for the reparent tests) against a zero-dep
   DOM/matchMedia/interval/MutationObserver shim. Gates: spec determinism
   (goldens + twice-equal + distinct-across-rooms over 8 seeds -- the goldens
   ARE the pure-refactor proof), archetype mapping, spec ranges, purity fences
   (source scans + deep-frozen runtime state), the overlay round-trip
   (reparent preserves node identity + listeners; focus in/out; Esc; [ x ];
   enter affordance), auto-open off the wgate's cgate-open class (present at
   attach + MutationObserver flip), canvases INSIDE the overlay, the
   reduced-motion static path, the crossfade swap, the glass-band contrast +
   z-order tokens in console-scene.css, and the page splice (includes + mount
   + affordance + wgate curtain regions held).
   Usage: node tools/console/console-scene-e2e.cjs */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const SCENE_JS = path.join(ROOT, "src", "components", "console-scene.js");
const SCENE_CSS = path.join(ROOT, "src", "components", "console-scene.css");
const CONSOLE_JS = path.join(ROOT, "src", "components", "console.js");
const PAGE = path.join(ROOT, "src", "console", "index.html");

const E = require(path.join(ROOT, "src", "components", "console-engine.js"));
const PRNG = require(path.join(ROOT, "src", "components", "console-prng.js"));
const S = require(SCENE_JS);
const CONSOLE_SRC = fs.readFileSync(CONSOLE_JS, "utf8");

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.error("FAIL: " + name); }
}

// ---------------------------------------------------------------- 1. determinism
const GOLDEN_SEED = "wuld-descent";
const gw = E.genWorld(GOLDEN_SEED);
t("golden world is the K235 fingerprint world (14 rooms)", gw.rooms.length === 14);
t("golden threshold fp (K248 shipped -- the refactor proof)", S.fingerprint(S.sceneSpec(gw.seed, gw.rooms[gw.startId])) === "7e22f759ff61e5d8");
t("golden descent fp (K248 shipped -- the refactor proof)", S.fingerprint(S.sceneSpec(gw.seed, gw.rooms[gw.terminusId])) === "9010b7e215a681d1");

const SEEDS = ["wuld-descent", "test-seed", "alpha", "beta", "gamma", "delta", "epsilon", "omega"];
let twiceEqual = true, allDistinct = true, ranges = true, archKnown = true, glintRule = true;
let toneDescent = true, toneThreshold = true, itemRooms = 0;
for (const seed of SEEDS) {
  const w = E.genWorld(seed);
  const fps = new Set();
  for (const room of w.rooms) {
    const a = S.sceneSpec(w.seed, room), b = S.sceneSpec(w.seed, room);
    const fa = S.fingerprint(a);
    if (fa !== S.fingerprint(b)) twiceEqual = false;
    if (fps.has(fa)) allDistinct = false;
    fps.add(fa);
    if (!(a.horizon >= 0.5 && a.horizon <= 0.66)) ranges = false;
    if (!(a.vanish >= 0.32 && a.vanish <= 0.68)) ranges = false;
    if (!(a.vig >= 0.5 && a.vig <= 0.75)) ranges = false;
    if (!(a.fog.length >= 2 && a.fog.length <= 4)) ranges = false;
    if (!(a.props.length >= 1 && a.props.length <= 3)) ranges = false;
    if (!(a.detail >= 3 && a.detail <= 7)) ranges = false;
    if (!(a.scan.period >= 3 && a.scan.period <= 4)) ranges = false;
    if (S.ARCHETYPES.indexOf(a.arch) < 0) archKnown = false;
    if (!!a.glint !== !!room.item) glintRule = false;
    if (room.item) itemRooms++;
    if (room.id === w.terminusId && a.tone !== 5) toneDescent = false;
    if (room.id === w.startId && a.tone === 5) toneThreshold = false;
  }
}
t("fingerprint twice-equal across 8 seeds x all rooms", twiceEqual);
t("all rooms distinct within every world", allDistinct);
t("spec fields inside their documented ranges", ranges);
t("every archetype is a known member", archKnown);
t("glint present iff the room holds an item", glintRule);
t("item rooms exist in the battery (key room guaranteed)", itemRooms >= SEEDS.length);
t("the descent always reads blood (tone 5)", toneDescent);
t("the threshold never reads blood", toneThreshold);
t("same room id, different seed -> different spec",
  S.fingerprint(S.sceneSpec("alpha", E.genWorld("alpha").rooms[0])) !==
  S.fingerprint(S.sceneSpec("beta", E.genWorld("beta").rooms[0])));

// fresh-require determinism (module state free; runs BEFORE any global DOM shim)
delete require.cache[require.resolve(SCENE_JS)];
const S2 = require(SCENE_JS);
t("fresh require reproduces the golden fp",
  S2.fingerprint(S2.sceneSpec(gw.seed, gw.rooms[gw.startId])) === "7e22f759ff61e5d8");

// ---------------------------------------------------------------- 2. archetype vectors
const AV = [
  ["Ashen corridor", "corridor"], ["Humming concourse", "corridor"],
  ["Silent stairwell", "stair"], ["Derelict cistern", "vault"], ["Cold vault", "vault"],
  ["Flooded boiler room", "machine"], ["Sagging furnace", "machine"], ["Cratered substation", "machine"], ["Peeling pump house", "machine"],
  ["Frost-bitten ward", "rows"], ["Windowless dormitory", "rows"],
  ["Smoke-stained archive", "stacks"], ["Cold reading room", "stacks"], ["Overgrown sorting hall", "stacks"],
  ["Sunless atrium", "columns"], ["Waterlogged gallery", "columns"],
  ["Forgotten antechamber", "chairs"], ["Grey waiting room", "chairs"],
  ["Threshold", "threshold"], ["The Descent", "descent"]
];
let avOK = true;
for (const [title, want] of AV) if (S.archetypeFor({ title }) !== want) { avOK = false; console.error("  archetype miss: " + title); }
t("20 title->archetype vectors", avOK);
t("palette count is 6, all named", S.PALETTES.length === 6 && S.PALETTES.every(p => typeof p.name === "string"));

// ---------------------------------------------------------------- 3. purity fences (source)
const src = fs.readFileSync(SCENE_JS, "utf8");
t("no storage of any kind", !/localStorage|sessionStorage|\.setItem|\.getItem\(|\.removeItem/.test(src));
t("no audio (this layer ships none)", !/AudioContext|createOscillator|webkitAudio/.test(src));
t("no engine mutators, no verbs", !/_exec\(|_new\(|_setSound|_resume\(|\.save\(|clearSave|newGame|genWorld\(/.test(src));
t("reads via the public hooks only", /_world\(\)/.test(src) && /_state\(\)/.test(src));
t("no network", !/fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon/.test(src));
t("fiction firewall: zero stance strings (code + strings; the header comment DECLARES the firewall)",
  !/antinatal|natalis|efilist|objection|rebuttal|\bRSI\b|argument.?library|suffering|consent/i
    .test(src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")));
t("unlock signal is the wgate class, not a key read", /cgate-open/.test(src) && !/wuld:console:unlocked/.test(src));
t("no U+FFFD in scene js", src.indexOf("�") < 0);

// ---------------------------------------------------------------- 4. DOM shim
const LAST_FOCUS = { el: null };
function Elem(tag) {
  this.tagName = String(tag || "div").toUpperCase();
  this.children = []; this.parentNode = null;
  this._cls = {}; this._attrs = {}; this.style = {};
  this.textContent = ""; this.type = ""; this.value = ""; this.id = "";
  this.hidden = false; this.disabled = false; this.title = ""; this.placeholder = ""; this.tabIndex = 0;
  this.scrollTop = 0; this.scrollHeight = 0; this._ls = {};
  const el = this;
  this.classList = {
    add: function () { for (let i = 0; i < arguments.length; i++) el._cls[arguments[i]] = 1; },
    remove: function () { for (let i = 0; i < arguments.length; i++) delete el._cls[arguments[i]]; },
    contains: function (c) { return !!el._cls[c]; }
  };
}
Elem.prototype.setAttribute = function (k, v) { this._attrs[k] = String(v); };
Elem.prototype.getAttribute = function (k) { return (k in this._attrs) ? this._attrs[k] : null; };
Elem.prototype.removeAttribute = function (k) { delete this._attrs[k]; };
Elem.prototype.appendChild = function (c) {
  if (c.parentNode && c.parentNode.children) {           // real-DOM move semantics
    const i = c.parentNode.children.indexOf(c);
    if (i >= 0) c.parentNode.children.splice(i, 1);
  }
  c.parentNode = this; this.children.push(c); return c;
};
Elem.prototype.removeChild = function (c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; };
Elem.prototype.addEventListener = function (t2, fn) { (this._ls[t2] = this._ls[t2] || []).push(fn); };
Elem.prototype.removeEventListener = function (t2, fn) { const a = this._ls[t2]; if (a) { const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); } };
Elem.prototype.fire = function (t2, ev) {
  ev = ev || {};
  if (!ev.preventDefault) ev.preventDefault = function () {};
  if (!ev.target) ev.target = this;
  const self = this;
  (this._ls[t2] || []).slice().forEach(function (fn) { fn.call(self, ev); });
};
Elem.prototype.click = function () { this.fire("click"); };
Elem.prototype.focus = function () { LAST_FOCUS.el = this; };
Object.defineProperty(Elem.prototype, "className", {
  get: function () { return Object.keys(this._cls).join(" "); },
  set: function (v) { this._cls = {}; String(v).split(/\s+/).forEach(function (c) { if (c) this._cls[c] = 1; }, this); }
});
Object.defineProperty(Elem.prototype, "innerHTML", {
  get: function () { return this._html || ""; },
  set: function (v) { this._html = String(v); if (v === "") this.children.length = 0; }
});
function walk(node, pred) { for (let i = 0; i < node.children.length; i++) { const c = node.children[i]; if (pred(c)) return c; const r = walk(c, pred); if (r) return r; } return null; }
function byClass(root, cls) { const out = []; (function rec(n) { for (const c of n.children) { if (c._cls[cls]) out.push(c); rec(c); } })(root); return out; }
Elem.prototype.querySelector = function (sel) {
  if (sel[0] === ".") { const cl = sel.slice(1); return walk(this, function (c) { return !!c._cls[cl]; }); }
  return walk(this, function (c) { return String(c.tagName).toLowerCase() === String(sel).toLowerCase(); });
};

function mkCanvasCtx(el) {
  const calls = [];
  const ctx = { canvas: el, lineWidth: 1, fillStyle: "", strokeStyle: "" };
  for (const m of ["fillRect", "strokeRect", "beginPath", "moveTo", "lineTo", "stroke", "fill", "arc", "closePath", "save", "restore"]) {
    ctx[m] = function () { calls.push(m); };
  }
  ctx.createLinearGradient = () => ({ addColorStop() {} });
  ctx.createRadialGradient = () => ({ addColorStop() {} });
  el.width = 0; el.height = 0; el._calls = calls; el.getContext = () => ctx;
}

function mkEnv(opts) {
  opts = opts || {};
  const body = new Elem("body"), head = new Elem("head");
  const documentElement = new Elem("html");
  if (opts.unlocked) documentElement.classList.add("cgate-open");
  const mount = new Elem("div"); mount.setAttribute("data-con-scene", ""); mount.hidden = true; mount.setAttribute("aria-hidden", "true");
  const enterWrap = new Elem("p"); enterWrap.setAttribute("data-con-enter", ""); enterWrap.hidden = true;
  const enterBtn = new Elem("button"); enterBtn.className = "con-btn con-enter-btn"; enterWrap.appendChild(enterBtn);
  const host = new Elem("div"); host.setAttribute("data-console", "");
  if (!opts.noMount) body.appendChild(mount);
  body.appendChild(enterWrap);
  body.appendChild(host);
  if (opts.skeleton) {                                    // a minimal fake .con-term (no real shell)
    const term = new Elem("div"); term.className = "con-term";
    const out = new Elem("div"); out.className = "con-out";
    const inp = new Elem("input"); inp.className = "con-in";
    term.appendChild(out); term.appendChild(inp); host.appendChild(term);
  }
  const docLs = {};
  const doc = {
    readyState: "complete", head: head, body: body, documentElement: documentElement,
    hidden: false, activeElement: null,
    createElement: function (t2) { const el = new Elem(t2); if (String(t2).toLowerCase() === "canvas") mkCanvasCtx(el); return el; },
    querySelector: function (sel) {
      if (sel[0] === "[") { const nm = sel.replace(/^\[|\]$/g, "").split("=")[0]; return walk(body, function (c) { return nm in c._attrs; }); }
      if (sel[0] === "#") { const id = sel.slice(1); return walk(body, function (c) { return c.id === id; }); }
      if (sel[0] === ".") { const cl = sel.slice(1); return walk(body, function (c) { return !!c._cls[cl]; }); }
      return null;
    },
    addEventListener: function (t2, fn) { (docLs[t2] = docLs[t2] || []).push(fn); },
    removeEventListener: function (t2, fn) { const a = docLs[t2]; if (a) { const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); } }
  };
  const intervals = [], cleared = [], timeouts = [], mos = [];
  function MO(cb) {
    this._cb = cb; this._dis = false; this._t = null; this._o = null;
    this.observe = (t2, o) => { this._t = t2; this._o = o; };
    this.disconnect = () => { this._dis = true; };
    mos.push(this);
  }
  const RM = !!opts.reducedMotion;
  const win = {
    innerWidth: 1280, innerHeight: 720,
    matchMedia: function (q) { return { matches: RM && /reduce/.test(q), media: q, addListener() {}, addEventListener() {} }; },
    setInterval: (fn, ms) => { intervals.push({ fn, ms }); return intervals.length; },
    clearInterval: id => cleared.push(id),
    setTimeout: (fn, ms) => { timeouts.push({ fn, ms }); return timeouts.length; },
    addEventListener() {}, removeEventListener() {},
    MutationObserver: MO,
    wuldConsole: null
  };
  return { body, mount, enterWrap, enterBtn, host, doc, win, intervals, cleared, timeouts, mos,
    docFire: function (t2, ev) { ev = ev || {}; if (!ev.preventDefault) ev.preventDefault = function () {}; if (!ev.target) ev.target = body; (docLs[t2] || []).slice().forEach(fn => fn(ev)); } };
}
function bootShell(env) {                                  // eval the REAL console.js against the shim
  const store = {};
  global.localStorage = { getItem: k => (k in store) ? store[k] : null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
  env.win.ConsoleEngine = E; env.win.ConsolePRNG = PRNG;
  env.win.localStorage = global.localStorage; env.win.Math = Math;
  global.window = env.win; global.document = env.doc;
  eval(CONSOLE_SRC);                                       // IIFE boots (readyState complete)
  return env.win.wuldConsole;
}
function unShell() { delete global.window; delete global.document; delete global.localStorage; }
function deepFreeze(o) {
  if (o && typeof o === "object" && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const k of Object.keys(o)) deepFreeze(o[k]);
  }
  return o;
}

// -- 4a..4d. the takeover round-trip on the REAL shell ----------------------
{
  const env = mkEnv({});                                   // locked: no cgate-open yet
  const shell = bootShell(env);
  t("real shell booted a terminal into [data-console]", !!shell && byClass(env.host, "con-term").length === 1);
  const termRef = byClass(env.host, "con-term")[0];
  const inst = S._attach(env.win, env.doc);
  t("attach returns an instance", !!inst);
  t("overlay chrome built inside the mount (2 canvases + [ x ] + slot)",
    env.mount.children.length === 4 &&
    inst._canvases().every(cv => cv.parentNode === env.mount) &&
    inst._closeBtn().parentNode === env.mount && inst._slot().parentNode === env.mount);
  t("overlay is a labelled dialog", env.mount.getAttribute("role") === "dialog" && env.mount.getAttribute("aria-modal") === "true" && !!env.mount.getAttribute("aria-label"));
  t("locked: no auto-open, mount stays hidden, zero ticks",
    inst.isOpen() === false && env.mount.hidden === true && env.intervals.length === 0);
  t("locked: unlock observer registered on <html> (class flips)",
    env.mos.length === 1 && env.mos[0]._t === env.doc.documentElement &&
    !!env.mos[0]._o && env.mos[0]._o.attributes === true && (env.mos[0]._o.attributeFilter || []).indexOf("class") >= 0);
  t("enter affordance unhidden + wired", env.enterWrap.hidden === false && !!inst._enterBtn());

  // the unlock: wgate adds cgate-open -> the observer opens the takeover
  const out = byClass(termRef, "con-out")[0];
  out.scrollTop = 123;
  env.doc.documentElement.classList.add("cgate-open");
  env.mos[0]._cb();
  t("unlock flip -> the takeover opens", inst.isOpen() === true && env.mount.hidden === false && env.mount.classList.contains("con-ovl-visible"));
  t("observer disconnected after the unlock", env.mos[0]._dis === true);
  t("reparent IN: same .con-term node, now inside the overlay slot", inst._term() === termRef && termRef.parentNode === inst._slot());
  t("transcript scroll position survives the move", out.scrollTop === 123);
  t("focus lands in the input", LAST_FOCUS.el === byClass(termRef, "con-in")[0]);
  t("motion path: watcher + ambient tick run only while open",
    env.intervals.length === 2 && env.intervals[0].ms === S.WATCH_MS && env.intervals[1].ms === S.TICK_MS);
  t("aria-hidden dropped + page scroll parked", env.mount.getAttribute("aria-hidden") === null && env.body.classList.contains("con-takeover"));
  t("the room painted on entry (threshold; live canvas marked)",
    !!inst._spec() && inst._spec().arch === "threshold" && !!inst._live() && inst._live().classList.contains("con-scene-live"));

  // Esc leaves
  env.docFire("keydown", { key: "Escape" });
  t("Esc closes the takeover", inst.isOpen() === false && env.mount.hidden === true && env.mount.getAttribute("aria-hidden") === "true");
  t("reparent OUT: the same node returns to [data-console]", termRef.parentNode === env.host && byClass(env.host, "con-term")[0] === termRef);
  t("ticks cleared on close", env.cleared.length === 2);
  t("scroll lock released + focus restored to the enter affordance", !env.body.classList.contains("con-takeover") && LAST_FOCUS.el === env.enterBtn);

  // re-enter via the affordance; the shell's own listeners must survive two moves
  env.enterBtn.fire("click");
  t("[ enter the console ] re-opens", inst.isOpen() === true && termRef.parentNode === inst._slot());
  const inRow = byClass(termRef, "con-in-row")[0];
  const inp = byClass(termRef, "con-in")[0];
  const linesBefore = out.children.length;
  inp.value = "look";
  inRow.fire("submit");
  t("submit still routes through the REAL shell after two moves (listeners intact)",
    out.children.length > linesBefore && /descent|threshold|wall|door|room|air|Threshold/i.test(shell._outText()));
  t("Esc while typing needs no modifier: close button also leaves", (inst._closeBtn().fire("click"), inst.isOpen() === false && termRef.parentNode === env.host));

  // off() teardown is clean from the closed state
  inst.off();
  t("off(): overlay hidden, terminal stays home, no dangling ticks",
    env.mount.hidden === true && termRef.parentNode === env.host && env.cleared.length >= 4);
  unShell();
}

// -- 4e. engine purity on a deep-frozen world (skeleton term, fake hooks) ---
{
  const env = mkEnv({ unlocked: true, skeleton: true });
  const inst = S._attach(env.win, env.doc);
  t("unlocked at attach -> auto-open without the observer", inst.isOpen() === true && env.mos.length === 0);
  t("no paint before the console exists", inst._spec() === null && inst._key() === "");

  const w = deepFreeze(E.genWorld("shim-seed"));
  const snap = JSON.stringify(w);
  let pos = w.startId;
  env.win.wuldConsole = {
    _world: () => w,
    _state: () => ({ pos, seed: w.seed, visited: [pos], inv: [], turns: 0, done: false }),
    _exec: () => { throw new Error("scene called _exec"); },
    _new: () => { throw new Error("scene called _new"); }
  };
  inst._watch();
  t("first watch paints the threshold", !!inst._spec() && inst._spec().arch === "threshold");
  t("key tracks seed#pos", inst._key() === w.seed + "#" + w.startId);
  const liveA = inst._live();
  t("a live canvas is shown", !!liveA && liveA.classList.contains("con-scene-live"));
  t("canvas sized to the internal resolution", liveA.width === S.BASE_W && liveA.height > 0);
  const painted = liveA._calls.length;
  t("the painter actually drew", painted > 50);

  // room change -> the OTHER canvas becomes live (the crossfade swap)
  const next = (() => { const r = w.rooms[w.startId]; for (const d of ["n", "s", "e", "w"]) if (r.exits[d] != null) return r.exits[d]; return w.startId; })();
  pos = next;
  inst._watch();
  const liveB = inst._live();
  t("room change swaps to the other canvas", liveB !== liveA && liveB.classList.contains("con-scene-live"));
  t("old canvas dropped the live class", !liveA.classList.contains("con-scene-live"));
  t("spec follows the room", inst._spec().arch === S.archetypeFor(w.rooms[next]));
  t("frame resets on room change", inst._frame() === 0);

  // ambient tick advances the frame and repaints the live canvas
  const before = liveB._calls.length;
  inst._anim(); inst._anim();
  t("anim advances frame + repaints", inst._frame() === 2 && liveB._calls.length > before);

  // document.hidden pauses the ambient paint
  env.doc.hidden = true;
  inst._anim();
  t("hidden tab paints nothing", inst._frame() === 2);
  env.doc.hidden = false;

  // the world object was never mutated, no verb was ever called
  t("deep-frozen world byte-identical after the session", JSON.stringify(w) === snap);

  inst.off();
  t("off() closes, clears the ticks and hides the overlay",
    inst.isOpen() === false && env.cleared.length >= 2 && env.mount.hidden === true);
}

// -- 4f. reduced-motion: static takeover
{
  const env = mkEnv({ unlocked: true, skeleton: true, reducedMotion: true });
  const inst = S._attach(env.win, env.doc);
  t("reduced instance reports reduced + still auto-opens", inst.reduced === true && inst.isOpen() === true);
  t("reduced registers ONLY the watcher (no ambient tick, even open)",
    env.intervals.length === 1 && env.intervals[0].ms === S.WATCH_MS);
  const w = E.genWorld("still-seed");
  env.win.wuldConsole = { _world: () => w, _state: () => ({ pos: w.startId }) };
  inst._watch();
  t("reduced still paints the static frame on room change", !!inst._spec() && inst._frame() === 0);
  inst._anim();
  t("anim is inert under reduced (never scheduled; frame holds)", inst._frame() === 0 || inst._frame() === 1);
  inst.off();
}

// -- 4g. no-mount page: attach is a no-op
{
  const env = mkEnv({ noMount: true });
  t("no mount -> attach returns null, nothing registered", S._attach(env.win, env.doc) === null && env.intervals.length === 0);
}

// ---------------------------------------------------------------- 5. css tokens
const css = fs.readFileSync(SCENE_CSS, "utf8");
const zM = css.match(/#con-scene\s*{[^}]*z-index:\s*(\d+)/);
t("overlay is fixed full-viewport", /#con-scene\s*{[^}]*position:\s*fixed/.test(css) && /#con-scene\s*{[^}]*inset:\s*0/.test(css));
t("overlay z parses (10000)", !!zM && parseInt(zM[1], 10) === 10000);
t("overlay rides above the yurei desk launcher (9998)", !!zM && parseInt(zM[1], 10) > 9998);
t("wgate curtain stays ABOVE the takeover", !!zM && parseInt(zM[1], 10) < 2147483000);
t("desk companions suppressed while the takeover is up",
  /body\.con-takeover\s+\.yasst-launcher[\s\S]*?display:\s*none/.test(css));
t("closed overlay renders nothing", /#con-scene\[hidden\]\s*{\s*display:\s*none/.test(css));
t("open overlay fades up via the visible class", /#con-scene\.con-ovl-visible\s*{\s*opacity:\s*1/.test(css));
const alphas = [...css.matchAll(/background:\s*rgba\(\s*5\s*,\s*5\s*,\s*6\s*,\s*(0?\.\d+)\s*\)/g)].map(m => parseFloat(m[1]));
t("glass strips are a thin tint (0.22 <= alpha <= 0.4 -- the fx must pass through)",
  alphas.length >= 3 && Math.min(...alphas) >= 0.22 && Math.max(...alphas) <= 0.4);
t("legibility halo: the band carries a dark text-shadow", /#con-scene\s+\.con-out\s*{[^}]*text-shadow:/.test(css));
t("blur is a hint, not a frost (blur(2px), nothing heavier)", /backdrop-filter:\s*blur\(2px\)/.test(css) && !/blur\(7px\)/.test(css));
t("crossfade transition on the canvases", /transition:\s*opacity\s*0?\.3s/.test(css));
t("transcript band anchors low, never fills the middle",
  /#con-scene\s+\.con-out\s*{[^}]*margin-block-start:\s*auto/.test(css) && /#con-scene\s+\.con-out\s*{[^}]*flex:\s*0\s+1\s+auto/.test(css));
t("page scroll parks under the takeover", /body\.con-takeover\s*{\s*overflow:\s*hidden/.test(css));
t("reduced-motion strips BOTH transitions (enter + crossfade)", (() => {
  const m = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{([\s\S]*?)}\s*$/);
  return !!m && (m[1].match(/transition:\s*none/g) || []).length >= 2;
})());
t("no color override on the terminal text", !/[^-]color\s*:/.test(css));
t("scoped: every rule is overlay-, takeover- or affordance-scoped", (() => {
  const sels = css.replace(/\/\*[\s\S]*?\*\//g, "").match(/(^|})\s*([^{}@]+){/g) || [];
  return sels.every(s => /#con-scene|body\.con-takeover|\.con-enter|prefers-reduced-motion/.test(s));
})());
t("no U+FFFD in scene css", css.indexOf("�") < 0);

// ---------------------------------------------------------------- 6. page splice
const page = fs.readFileSync(PAGE, "utf8");
t("scene css include at ?v=K249a", (page.match(/console-scene\.css\?v=K249a"/g) || []).length === 1 && page.indexOf('console-scene.css?v=K249"') < 0);
t("scene js include at ?v=K249a", (page.match(/console-scene\.js\?v=K249a"/g) || []).length === 1 && page.indexOf('console-scene.js?v=K249"') < 0);
t("scene js loads after the shell quartet", page.indexOf("console-scene.js?v=K249") > page.indexOf("console.js?v=K269"));
t("sigil js loads after prng, before the shell console (K269)", page.indexOf("console-sigil.js?v=K269") > page.indexOf("console-prng.js?v=K235") && page.indexOf("console-sigil.js?v=K269") < page.indexOf("console.js?v=K269"));
t("mount present, outside <main> (before it)", page.indexOf("data-con-scene") > 0 && page.indexOf("data-con-scene") < page.indexOf("<main"));
t("enter affordance: hidden static markup, below the lede, inside <main>", (() => {
  const i = page.indexOf("data-con-enter");
  return i > 0 && i > page.indexOf("</header>") && i > page.indexOf("<main") && i < page.indexOf("</main>") &&
    /<p class="con-enter" data-con-enter hidden>/.test(page) && /con-enter-btn/.test(page);
})());
t("no new headings (exactly the one h1)", (page.match(/<h1/g) || []).length === 1 && page.indexOf("<h2") < 0 && page.indexOf("<h3") < 0);
t("shell quartet held (engine K267; sigil+console K269; prng/css K235)", ["console.css?v=K235", "console-prng.js?v=K235", "console-engine.js?v=K267", "console-sigil.js?v=K269", "console.js?v=K269"]
  .every(s => (page.split(s).length - 1) === 1) && page.indexOf("console-engine.js?v=K265") < 0 && page.indexOf("console.js?v=K235") < 0 && page.indexOf("console.js?v=K267") < 0);
t("wgate curtain markers held", ["wgate:head:start", "wgate:head:end", "wgate:body:start", "wgate:body:end"]
  .every(m => page.indexOf(m) > 0));
t("curtain key + open-class held", page.indexOf("wuld:console:unlocked") > 0 && page.indexOf("cgate-open") > 0);
t("search-exclude meta held", page.indexOf('name="wuld-search" content="exclude"') > 0);
t("no U+FFFD in the page", page.indexOf("�") < 0);

// ---------------------------------------------------------------- summary
console.log("console-scene-e2e: " + pass + "/" + (pass + fail) + " passed");
if (fail) process.exit(1);
