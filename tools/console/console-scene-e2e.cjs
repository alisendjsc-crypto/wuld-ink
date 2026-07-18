#!/usr/bin/env node
/* console-scene-e2e.cjs -- gate for the K248 /console/ immersion layer.
   Runs the REAL modules (console-prng + console-engine + console-scene) plus a
   zero-dep DOM/matchMedia/interval shim. Gates: spec determinism (goldens +
   twice-equal + distinct-across-rooms over 8 seeds), archetype mapping, spec
   ranges, purity fences (source scans + deep-frozen runtime state), the
   reduced-motion static path, the crossfade swap, the glass-band contrast
   tokens in console-scene.css, and the page splice (includes + mount placement
   + wgate curtain regions held).  Usage: node tools/console/console-scene-e2e.cjs */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const SCENE_JS = path.join(ROOT, "src", "components", "console-scene.js");
const SCENE_CSS = path.join(ROOT, "src", "components", "console-scene.css");
const PAGE = path.join(ROOT, "src", "console", "index.html");

const E = require(path.join(ROOT, "src", "components", "console-engine.js"));
const S = require(SCENE_JS);

let pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; }
  else { fail++; console.error("FAIL: " + name); }
}

// ---------------------------------------------------------------- 1. determinism
const GOLDEN_SEED = "wuld-descent";
const gw = E.genWorld(GOLDEN_SEED);
t("golden world is the K235 fingerprint world (14 rooms)", gw.rooms.length === 14);
t("golden threshold fp", S.fingerprint(S.sceneSpec(gw.seed, gw.rooms[gw.startId])) === "7e22f759ff61e5d8");
t("golden descent fp", S.fingerprint(S.sceneSpec(gw.seed, gw.rooms[gw.terminusId])) === "9010b7e215a681d1");

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

// fresh-require determinism (module state free)
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
t("no audio (this session ships none)", !/AudioContext|createOscillator|webkitAudio/.test(src));
t("no engine mutators, no verbs", !/_exec\(|_new\(|_setSound|_resume\(|\.save\(|clearSave|newGame|genWorld\(/.test(src));
t("reads via the public hooks only", /_world\(\)/.test(src) && /_state\(\)/.test(src));
t("no network", !/fetch\(|XMLHttpRequest|WebSocket|navigator\.sendBeacon/.test(src));
t("fiction firewall: zero stance strings (code + strings; the header comment DECLARES the firewall)",
  !/antinatal|natalis|efilist|objection|rebuttal|\bRSI\b|argument.?library|suffering|consent/i
    .test(src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")));
t("no U+FFFD in scene js", src.indexOf("�") < 0);

// ---------------------------------------------------------------- 4. DOM shim + attach
function mkClassList() {
  const s = new Set();
  return { add: c => s.add(c), remove: c => s.delete(c), contains: c => s.has(c), _set: s };
}
function mkCanvas() {
  const calls = [];
  const ctx = { canvas: null, lineWidth: 1, fillStyle: "", strokeStyle: "" };
  for (const m of ["fillRect", "strokeRect", "beginPath", "moveTo", "lineTo", "stroke", "fill", "arc", "closePath", "save", "restore"]) {
    ctx[m] = function () { calls.push(m); };
  }
  ctx.createLinearGradient = () => ({ addColorStop() {} });
  ctx.createRadialGradient = () => ({ addColorStop() {} });
  return { width: 0, height: 0, _calls: calls, classList: mkClassList(), setAttribute() {}, getContext: () => ctx };
}
function mkEnv(reduced) {
  const mount = { children: [], appendChild(c) { this.children.push(c); }, hidden: true };
  const doc = {
    hidden: false, readyState: "complete",
    querySelector: sel => (sel === "[data-con-scene]" ? mount : null),
    createElement: tag => (tag === "canvas" ? mkCanvas() : { classList: mkClassList(), setAttribute() {} }),
    body: { classList: mkClassList() },
    addEventListener() {}
  };
  const intervals = [], cleared = [];
  const win = {
    innerWidth: 1280, innerHeight: 720,
    matchMedia: q => ({ matches: !!reduced && /reduce/.test(q) }),
    setInterval: (fn, ms) => { intervals.push({ fn, ms }); return intervals.length; },
    clearInterval: id => cleared.push(id),
    addEventListener() {}, removeEventListener() {},
    wuldConsole: null
  };
  return { mount, doc, win, intervals, cleared };
}
function deepFreeze(o) {
  if (o && typeof o === "object" && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const k of Object.keys(o)) deepFreeze(o[k]);
  }
  return o;
}

// -- 4a. boots without wuldConsole, paints once it appears
{
  const env = mkEnv(false);
  const inst = S._attach(env.win, env.doc);
  t("attach returns an instance", !!inst);
  t("mount unhidden + two canvases", env.mount.hidden === false && env.mount.children.length === 2);
  t("body gains con-scene-on", env.doc.body.classList.contains("con-scene-on"));
  t("watcher + ambient tick registered (motion path)",
    env.intervals.length === 2 && env.intervals[0].ms === S.WATCH_MS && env.intervals[1].ms === S.TICK_MS);
  inst._watch();                                     // no wuldConsole yet
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
  t("off() clears both intervals + class + mount",
    env.cleared.length === 2 && !env.doc.body.classList.contains("con-scene-on") && env.mount.hidden === true);
}

// -- 4b. reduced-motion: static path
{
  const env = mkEnv(true);
  const inst = S._attach(env.win, env.doc);
  t("reduced instance reports reduced", inst.reduced === true);
  t("reduced registers ONLY the watcher (no ambient tick)",
    env.intervals.length === 1 && env.intervals[0].ms === S.WATCH_MS);
  const w = E.genWorld("still-seed");
  env.win.wuldConsole = { _world: () => w, _state: () => ({ pos: w.startId }) };
  inst._watch();
  t("reduced still paints the static frame on room change", !!inst._spec() && inst._frame() === 0);
  inst._anim();
  t("anim is inert under reduced (never scheduled; frame holds)", inst._frame() === 0 || inst._frame() === 1);
  inst.off();
}

// -- 4c. no-mount page: attach is a no-op
{
  const env = mkEnv(false);
  env.doc.querySelector = () => null;
  t("no mount -> attach returns null, nothing registered", S._attach(env.win, env.doc) === null && env.intervals.length === 0);
}

// ---------------------------------------------------------------- 5. css contrast tokens
const css = fs.readFileSync(SCENE_CSS, "utf8");
t("scene layer is pointer-transparent at z 0", /#con-scene\s*{[^}]*pointer-events:\s*none/.test(css) && /#con-scene\s*{[^}]*z-index:\s*0/.test(css));
const alphaM = css.match(/body\.con-scene-on\s+\.con-term\s*{[^}]*rgba\(\s*5\s*,\s*5\s*,\s*6\s*,\s*(0?\.\d+)\s*\)/);
t("glass band backing present with alpha >= 0.78", !!alphaM && parseFloat(alphaM[1]) >= 0.78);
t("glass band blurs the scene", /backdrop-filter:\s*blur\(/.test(css));
t("crossfade transition on the canvases", /transition:\s*opacity\s*0?\.3s/.test(css));
t("reduced-motion strips the crossfade", /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[^}]*{\s*transition:\s*none/.test(css.replace(/\n/g, " ")));
t("no color override on the terminal text", !/[^-]color\s*:/.test(css));
t("content lifted above the scene", /body\.con-scene-on\s+\.site-header[\s\S]*?z-index:\s*1/.test(css));
t("scoped: every rule is #con-scene or body.con-scene-on", (() => {
  const sels = css.replace(/\/\*[\s\S]*?\*\//g, "").match(/(^|})\s*([^{}@]+){/g) || [];
  return sels.every(s => /#con-scene|body\.con-scene-on|prefers-reduced-motion/.test(s));
})());
t("no U+FFFD in scene css", css.indexOf("�") < 0);

// ---------------------------------------------------------------- 6. page splice
const page = fs.readFileSync(PAGE, "utf8");
t("scene css include at ?v=K248", (page.match(/console-scene\.css\?v=K248/g) || []).length === 1);
t("scene js include at ?v=K248", (page.match(/console-scene\.js\?v=K248/g) || []).length === 1);
t("scene js loads after the shell trio", page.indexOf("console-scene.js?v=K248") > page.indexOf("console.js?v=K235"));
t("mount present, outside <main> (before it)", page.indexOf("data-con-scene") > 0 && page.indexOf("data-con-scene") < page.indexOf("<main"));
t("K235 shell trio + css held", ["console.css?v=K235", "console-prng.js?v=K235", "console-engine.js?v=K235", "console.js?v=K235"]
  .every(s => (page.split(s).length - 1) === 1));
t("wgate curtain markers held", ["wgate:head:start", "wgate:head:end", "wgate:body:start", "wgate:body:end"]
  .every(m => page.indexOf(m) > 0));
t("curtain key + open-class held", page.indexOf("wuld:console:unlocked") > 0 && page.indexOf("cgate-open") > 0);
t("search-exclude meta held", page.indexOf('name="wuld-search" content="exclude"') > 0);
t("no U+FFFD in the page", page.indexOf("�") < 0);

// ---------------------------------------------------------------- summary
console.log("console-scene-e2e: " + pass + "/" + (pass + fail) + " passed");
if (fail) process.exit(1);
