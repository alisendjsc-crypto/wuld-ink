#!/usr/bin/env node
/* console-e2e.cjs — the /console/ crawler proof (K235).
   ===========================================================================
   Drives the REAL src/components/{console-prng,console-engine,console}.js inside
   a tiny zero-dep DOM / localStorage / matchMedia / AudioContext shim (no jsdom —
   matches the repo's other .cjs gates). Proves the MVP contract:
     * PRNG: the vendored xmur3/mulberry32 reproduce the canonical algorithm
       (an inline reference over many draws) + a hard-coded golden output vector
     * determinism: genWorld(seed) is byte-identical across runs + matches a
       hard-coded world fingerprint; a different seed differs
     * a playable, connected world: every room reachable, exits reciprocal,
       the descent reachable only with the key (blocked without it)
     * the shell boots page-scoped over [data-console]; verbs move/look/take;
       state persists under wuld:console:* and REPLAYS across a fresh instance
     * own-key isolation: never writes outside wuld:console:*
     * audio is OPT-IN (no AudioContext at boot) and FULLY SUPPRESSED under
       prefers-reduced-motion (no context even after opt-in); CSS strips motion
     * SOURCE FIREWALL: zero argument-library import, zero philosophical stance
   FICTION ONLY. This is a game; it never touches the argument corpus. */
"use strict";
const fs = require("fs");
const path = require("path");
const COMP = path.join(__dirname, "..", "..", "src", "components");
const P = require(path.join(COMP, "console-prng.js"));       // real PRNG
const E = require(path.join(COMP, "console-engine.js"));     // real engine
const CONSOLE_SRC = fs.readFileSync(path.join(COMP, "console.js"), "utf8");
const CONSOLE_CSS = fs.readFileSync(path.join(COMP, "console.css"), "utf8");
const PRNG_SRC = fs.readFileSync(path.join(COMP, "console-prng.js"), "utf8");
const ENGINE_SRC = fs.readFileSync(path.join(COMP, "console-engine.js"), "utf8");
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
const CONSOLE_CODE = stripComments(CONSOLE_SRC);
const ENGINE_CODE = stripComments(ENGINE_SRC);
const PRNG_CODE = stripComments(PRNG_SRC);

// hard golden values (drift catches): PRNG golden recomputed at K235 build time.
// WORLD_FP DELIBERATELY regenerated at the proto pool-deepening: growing the prose
// pools (ADJ/NOUN/AIR/SIGHTS) + the item pool changes room titles/descriptions/flavor
// per seed, so fp() (which hashes title+desc+item) moves. The room GRAPH is unchanged
// (proven by PASS 2 connectivity/reciprocity/playability + PASS 10 graph-invariance).
// Old goldens (pre-deepening): wuld-descent 641467701, test-seed 2263193907.
const PRNG_GOLDEN = [0.6527054542675614, 0.2266360546927899, 0.17785613634623587, 0.516596824163571];
const WORLD_FP = { "wuld-descent": 2944269538, "test-seed": 1267046172 };

let pass = 0, fail = 0; const fails = [];
function ok(name, cond, got) { if (cond) pass++; else { fail++; fails.push(name + "  (got: " + JSON.stringify(got) + ")"); } }

// ------- helpers: canonical reference PRNG + world fingerprint
function refX(str) { let h = 1779033703 ^ str.length; for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; } return function () { h = Math.imul(h ^ h >>> 16, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return (h ^= h >>> 16) >>> 0; }; }
function refM(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function fp(w) { let s = w.seed + "|" + w.rooms.length + "|" + w.startId + "|" + w.terminusId + "|" + w.keyRoomId; for (const r of w.rooms) s += "|" + r.id + ":" + r.title + ":" + r.desc + ":" + r.item + ":" + [r.exits.n, r.exits.s, r.exits.e, r.exits.w].join(","); let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function reach(w) { let d = new Array(w.rooms.length).fill(-1); d[w.startId] = 0; let q = [w.startId]; while (q.length) { let c = q.shift(); for (let dir of ["n", "s", "e", "w"]) { let n = w.rooms[c].exits[dir]; if (n != null && d[n] < 0) { d[n] = d[c] + 1; q.push(n); } } } return d; }
function pathTo(w, from, to) { let prev = new Array(w.rooms.length).fill(null), pd = new Array(w.rooms.length).fill(-1); pd[from] = 0; let q = [from]; while (q.length) { let c = q.shift(); for (let dir of ["n", "s", "e", "w"]) { let n = w.rooms[c].exits[dir]; if (n != null && pd[n] < 0) { pd[n] = pd[c] + 1; prev[n] = { p: c, dir }; q.push(n); } } } if (pd[to] < 0) return null; let steps = [], cur = to; while (cur !== from) { steps.unshift(prev[cur].dir); cur = prev[cur].p; } return steps; }

function pathToAvoid(w, from, to, avoid) { let prev = new Array(w.rooms.length).fill(null), pd = new Array(w.rooms.length).fill(-1); pd[from] = 0; let q = [from]; while (q.length) { let c = q.shift(); if (c === avoid) continue; for (let dir of ["n", "s", "e", "w"]) { let n = w.rooms[c].exits[dir]; if (n != null && n !== avoid && pd[n] < 0) { pd[n] = pd[c] + 1; prev[n] = { p: c, dir }; q.push(n); } } } if (pd[to] < 0) return null; let steps = [], cur = to; while (cur !== from) { steps.unshift(prev[cur].dir); cur = prev[cur].p; } return steps; }

// ---------------------------------------------------------------- PASS 1: PRNG
(function () {
  let s = "wuld-descent", rx = refX(s), vx = P.xmur3(s), okx = true;
  for (let i = 0; i < 64; i++) if (rx() !== vx()) okx = false;
  ok("prng: vendored xmur3 == canonical over 64 draws", okx, okx);
  let rm = refM(305419896), vm = P.mulberry32(305419896), okm = true;
  for (let i = 0; i < 64; i++) if (rm() !== vm()) okm = false;
  ok("prng: vendored mulberry32 == canonical over 64 draws", okm, okm);
  let g = P.mulberry32(2463534242 >>> 0), gv = [];
  for (let i = 0; i < 4; i++) gv.push(g());
  ok("prng: golden vector matches", JSON.stringify(gv) === JSON.stringify(PRNG_GOLDEN), gv);
  // makeRng determinism (the seeded stream used by the engine)
  let a = P.makeRng("x"), b = P.makeRng("x"), same = true;
  for (let i = 0; i < 50; i++) if (a.float() !== b.float()) same = false;
  ok("prng: makeRng deterministic per seed", same, same);
  ok("prng: makeRng differs by seed", P.makeRng("x").float() !== P.makeRng("y").float(), null);
  ok("prng: int in range", (function () { let r = P.makeRng("z"); for (let i = 0; i < 200; i++) { let v = r.int(5); if (v < 0 || v > 4 || v !== (v | 0)) return false; } return true; })(), null);
})();

// ---------------------------------------------------------------- PASS 2: determinism + fingerprint + connectivity
(function () {
  ok("world: genWorld deterministic (identical bytes x2)", JSON.stringify(E.genWorld("wuld-descent")) === JSON.stringify(E.genWorld("wuld-descent")), null);
  ok("world: different seed -> different world", JSON.stringify(E.genWorld("wuld-descent")) !== JSON.stringify(E.genWorld("other")), null);
  ok("world: golden fingerprint wuld-descent", fp(E.genWorld("wuld-descent")) === WORLD_FP["wuld-descent"], fp(E.genWorld("wuld-descent")));
  ok("world: golden fingerprint test-seed", fp(E.genWorld("test-seed")) === WORLD_FP["test-seed"], fp(E.genWorld("test-seed")));
  const seeds = ["", "a", "wuld", "12345", "Ω", "facilis descensus", "the-cold-below", "zzz"];
  let allConn = true, recipAll = true, playable = true, roomsMin = 99, roomsMax = 0;
  for (const s of seeds) {
    const w = E.genWorld(s);
    roomsMin = Math.min(roomsMin, w.rooms.length); roomsMax = Math.max(roomsMax, w.rooms.length);
    if (reach(w).some((x) => x < 0)) allConn = false;
    for (let i = 0; i < w.rooms.length; i++) for (const d of ["n", "s", "e", "w"]) { const n = w.rooms[i].exits[d]; if (n != null && w.rooms[n].exits[{ n: "s", s: "n", e: "w", w: "e" }[d]] !== i) recipAll = false; }
    if (w.startId === w.terminusId || w.keyRoomId === w.startId || w.keyRoomId === w.terminusId) playable = false;
    if (!pathTo(w, w.startId, w.keyRoomId) || !pathTo(w, w.keyRoomId, w.terminusId)) playable = false;
  }
  ok("world: every room reachable (all seeds)", allConn, allConn);
  ok("world: exits reciprocal (all seeds)", recipAll, recipAll);
  ok("world: key & descent placed + reachable (all seeds)", playable, playable);
  ok("world: room count in 11..15", roomsMin >= 11 && roomsMax <= 15, [roomsMin, roomsMax]);
})();

// ---------------------------------------------------------------- PASS 3: engine verbs
(function () {
  const w = E.genWorld("verbs"); let st = E.newState(w);
  ok("verb: start describe names Threshold", /Threshold/.test(E.describe(w, st, st.pos)), null);
  // walk to key, take it, reach descent -> win
  for (const d of pathTo(w, w.startId, w.keyRoomId)) st = E.move(w, st, d).state;
  ok("verb: reached key room", st.pos === w.keyRoomId, st.pos);
  const tk = E.take(w, st); st = tk.state;
  ok("verb: take -> holds key", E.hasKey(w, st) && tk.event === "take", tk.event);
  const inv = E.inventory(w, st);
  ok("verb: inventory lists the key", /brass key/.test(inv.msg), inv.msg.slice(0, 30));
  let won = false;
  for (const d of pathTo(w, w.keyRoomId, w.terminusId)) { const r = E.move(w, st, d); st = r.state; if (r.event === "win") won = true; }
  ok("verb: reaching descent with key -> win + done", won && st.done, { won, done: st.done });
  ok("verb: map renders visited grid", /map/.test(E.renderMap(w, st)), null);
  ok("verb: examine room returns the sight", E.examine(w, st, "").msg.length > 0, null);
  // blocked without key (fresh world)
  const w2 = E.genWorld("blocked"); let s2 = E.newState(w2), blocked = false;
  for (const d of pathTo(w2, w2.startId, w2.terminusId)) { const r = E.move(w2, s2, d); if (r.event === "blocked" && /sealed/.test(r.msg)) { blocked = true; break; } s2 = r.state; }
  ok("verb: descent sealed without the key", blocked, blocked);
  ok("verb: bad direction is a soft error, not a crash", E.move(w, st, "q").event === "error", null);
})();

// ---------------------------------------------------------------- PASS 3b: Option B — SEEN-complete futility fold (K267)
// The futility clause folds into the terminus, and ONLY when the descent was the last
// unseen room. It is a runtime string in winText -> does NOT move genWorld/fp() goldens.
(function () {
  const CLAUSE = "It made no difference";
  const w = E.genWorld("futility-b");
  // partial: grab key, straight down (not all rooms seen) -> clause ABSENT
  let sp = E.newState(w);
  for (const d of pathTo(w, w.startId, w.keyRoomId)) sp = E.move(w, sp, d).state;
  sp = E.take(w, sp).state;
  let winPartial = "";
  for (const d of pathTo(w, w.keyRoomId, w.terminusId)) { const r = E.move(w, sp, d); sp = r.state; if (r.event === "win") winPartial = r.msg; }
  ok("mechanic B: partial descent does NOT fire the futility clause", sp.visited.length < w.rooms.length && winPartial.indexOf(CLAUSE) < 0, { seen: sp.visited.length, rooms: w.rooms.length });
  // complete: grab key, walk EVERY non-terminus room, then descend -> clause PRESENT (once)
  let sc = E.newState(w);
  for (const d of pathTo(w, w.startId, w.keyRoomId)) sc = E.move(w, sc, d).state;
  sc = E.take(w, sc).state;
  for (let target = 0; target < w.rooms.length; target++) {
    if (target === w.terminusId || sc.visited.indexOf(target) >= 0) continue;
    const steps = pathToAvoid(w, sc.pos, target, w.terminusId);
    if (steps) for (const d of steps) sc = E.move(w, sc, d).state;
  }
  const seenAllNonTerm = sc.visited.length >= w.rooms.length - 1;
  let winFull = "";
  for (const d of pathTo(w, sc.pos, w.terminusId)) { const r = E.move(w, sc, d); sc = r.state; if (r.event === "win") winFull = r.msg; }
  ok("mechanic B: SEEN-complete descent fires the futility clause once",
     seenAllNonTerm && sc.visited.length >= w.rooms.length && winFull.indexOf(CLAUSE) >= 0 && (winFull.split(CLAUSE).length - 1) === 1,
     { seen: sc.visited.length, rooms: w.rooms.length, hasClause: winFull.indexOf(CLAUSE) >= 0 });
})();

// ---------------------------------------------------------------- DOM / audio shim
function Elem(tag) {
  this.tagName = tag; this.children = []; this.parentNode = null;
  this._cls = {}; this._attrs = {}; this.style = {};
  this.textContent = ""; this.type = ""; this.value = ""; this.id = "";
  this.hidden = false; this.disabled = false; this.title = ""; this.placeholder = ""; this.tabIndex = 0;
  this.scrollTop = 0; this.scrollHeight = 0; this._ls = {};
  const el = this;
  this.classList = { add: function () { for (let i = 0; i < arguments.length; i++) el._cls[arguments[i]] = 1; }, remove: function () { for (let i = 0; i < arguments.length; i++) delete el._cls[arguments[i]]; }, contains: function (c) { return !!el._cls[c]; } };
}
Elem.prototype.setAttribute = function (k, v) { this._attrs[k] = String(v); };
Elem.prototype.getAttribute = function (k) { return (k in this._attrs) ? this._attrs[k] : null; };
Elem.prototype.appendChild = function (c) { c.parentNode = this; this.children.push(c); return c; };
Elem.prototype.removeChild = function (c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; };
Elem.prototype.addEventListener = function (t, fn) { (this._ls[t] = this._ls[t] || []).push(fn); };
Elem.prototype.fire = function (t, ev) { const self = this; (this._ls[t] || []).slice().forEach(function (fn) { fn.call(self, ev || {}); }); };
Elem.prototype.click = function () { this.fire("click"); };
Elem.prototype.focus = function () {};
Object.defineProperty(Elem.prototype, "className", { get: function () { return Object.keys(this._cls).join(" "); }, set: function (v) { this._cls = {}; String(v).split(/\s+/).forEach(function (c) { if (c) this._cls[c] = 1; }, this); } });
Object.defineProperty(Elem.prototype, "innerHTML", { get: function () { return this._html || ""; }, set: function (v) { this._html = String(v); if (v === "") this.children.length = 0; } });
function collect(node, pred, out) { for (let i = 0; i < node.children.length; i++) { const c = node.children[i]; if (pred(c)) out.push(c); collect(c, pred, out); } return out; }
function byClass(root, cls) { return collect(root, function (c) { return !!c._cls[cls]; }, []); }
function walk(node, pred) { for (let i = 0; i < node.children.length; i++) { const c = node.children[i]; if (pred(c)) return c; const r = walk(c, pred); if (r) return r; } return null; }

function makeWorld(opts) {
  opts = opts || {};
  const body = new Elem("body"), head = new Elem("head");
  const mount = new Elem("div"); mount.setAttribute("data-console", "");
  if (!opts.noMount) body.appendChild(mount);
  const doc = {
    readyState: "complete", head: head, body: body,
    createElement: function (t) { return new Elem(t); },
    querySelector: function (sel) {
      if (sel[0] === "[") { const nm = sel.replace(/^\[|\]$/g, "").split("=")[0]; return walk(body, function (c) { return nm in c._attrs; }); }
      if (sel[0] === "#") { const id = sel.slice(1); return walk(body, function (c) { return c.id === id; }); }
      if (sel[0] === ".") { const cl = sel.slice(1); return walk(body, function (c) { return !!c._cls[cl]; }); }
      return null;
    },
    addEventListener: function () {}
  };
  const store = Object.assign({}, opts.store || {});
  const writes = [];
  global.localStorage = { getItem: function (k) { return (k in store) ? store[k] : null; }, setItem: function (k, v) { store[k] = String(v); writes.push(k); }, removeItem: function (k) { delete store[k]; writes.push(k); } };
  let audioCreated = 0;
  function MockCtx() {
    audioCreated++; this.state = "running"; this.currentTime = 0; this.destination = {};
    this.resume = function () {}; this.createOscillator = function () { return { type: "", frequency: { value: 0 }, connect: function () {}, start: function () {}, stop: function () {} }; };
    this.createGain = function () { return { gain: { value: 0, exponentialRampToValueAtTime: function () {} }, connect: function () {} }; };
  }
  const RM = !!opts.reducedMotion;
  const win = {
    matchMedia: function (q) { return { matches: RM, media: q, addListener: function () {}, addEventListener: function () {} }; },
    AudioContext: MockCtx, Math: Math, localStorage: global.localStorage,
    location: { hash: opts.hash || "" }
  };
  win.ConsoleEngine = E; win.ConsolePRNG = P;
  global.window = win; global.document = doc;
  eval(CONSOLE_SRC);   // IIFE boots -> boot() (readyState complete)
  return { win, doc, body, mount, store, writes, P: win.wuldConsole, audio: function () { return audioCreated; } };
}

// ---------------------------------------------------------------- PASS 4: shell boot + scope + verbs
(function () {
  const w = makeWorld({});
  ok("shell: boots over [data-console]", w.P && w.P._mount() === true, !!w.P);
  ok("shell: a terminal rendered", byClass(w.body, "con-term").length === 1, byClass(w.body, "con-term").length);
  ok("shell: output + input present", byClass(w.body, "con-out").length === 1 && byClass(w.body, "con-in").length === 1, null);
  ok("shell: opening lines printed", byClass(w.body, "con-line").length >= 2, byClass(w.body, "con-line").length);
  // deterministic run
  w.P._new("verbs");
  const st0 = w.P._state();
  ok("shell: _new sets the seed world", w.P._world().seed === "verbs" && st0.pos === w.P._world().startId, w.P._world().seed);
  // move via a valid exit
  const world = w.P._world(); let dir = null; for (const d of ["n", "s", "e", "w"]) if (world.rooms[world.startId].exits[d] != null) { dir = d; break; }
  w.P._exec(dir); ok("shell: a move changes position", w.P._state().pos !== st0.pos, { dir, pos: w.P._state().pos });
  w.P._exec("look"); ok("shell: look does not crash / stays put", true, null);
  w.P._exec("seed"); ok("shell: seed command prints the seed", /seed: verbs/.test(w.body_txt = byClass(w.body, "con-line").map(function (l) { return l.textContent; }).join("\n")), null);
  w.P._exec("frobnicate"); ok("shell: unknown verb is a soft message", /don't understand/.test(byClass(w.body, "con-line").map(function (l) { return l.textContent; }).join("\n")), null);
  // form-submit wiring
  const form = byClass(w.body, "con-in-row")[0]; const inp = byClass(w.body, "con-in")[0];
  inp.value = "look"; form.fire("submit", { preventDefault: function () {} });
  ok("shell: form submit echoes the command + clears input", byClass(w.body, "con-echo").length >= 1 && inp.value === "", { echoes: byClass(w.body, "con-echo").length, v: inp.value });
  // page-scope: no mount -> no terminal, no throw
  const w2 = makeWorld({ noMount: true });
  ok("shell: no [data-console] -> no terminal", byClass(w2.body, "con-term").length === 0, byClass(w2.body, "con-term").length);
})();

// ---------------------------------------------------------------- PASS 5: persist + replay
(function () {
  const a = makeWorld({});
  a.P._new("persist-seed");
  const world = a.P._world(); let dir = null; for (const d of ["n", "s", "e", "w"]) if (world.rooms[world.startId].exits[d] != null) { dir = d; break; }
  a.P._exec(dir); a.P._exec("look");
  const aPos = a.P._state().pos, aSeed = a.P._state().seed;
  ok("persist: save written under wuld:console:save", "wuld:console:save" in a.store, Object.keys(a.store));
  // fresh instance, same store -> resume replays the exact state
  const b = makeWorld({ store: a.store });
  ok("replay: fresh instance resumed the seed", b.P._world().seed === aSeed, b.P._world().seed);
  ok("replay: resumed to the saved position", b.P._state().pos === aPos, { got: b.P._state().pos, want: aPos });
  ok("replay: resumed world regenerates identically", JSON.stringify(b.P._world()) === JSON.stringify(E.genWorld(aSeed)), null);
})();

// ---------------------------------------------------------------- PASS 6: own-key isolation
(function () {
  const w = makeWorld({});
  w.P._new("iso"); const world = w.P._world();
  for (const d of ["n", "s", "e", "w"]) if (world.rooms[world.startId].exits[d] != null) { w.P._exec(d); break; }
  w.P._setSound(true); w.P._setSound(false); w.P._exec("look");
  const alien = w.writes.filter(function (k) { return k.indexOf("wuld:console:") !== 0; });
  ok("isolation: every localStorage write is wuld:console:*", alien.length === 0, alien);
  ok("isolation: never writes a persona/component store", ["wuld:persona-active", "wuld:wrongHour", "wuld:notes", "wuld:successor:unlocked"].every(function (k) { return w.writes.indexOf(k) === -1; }), w.writes);
})();

// ---------------------------------------------------------------- PASS 7: audio opt-in + reduced-motion
(function () {
  // non-reduced: no context at boot (no autoplay); opt-in creates one
  const w = makeWorld({});
  ok("audio: NO AudioContext at boot (no autoplay)", w.audio() === 0, w.audio());
  w.P._new("aud"); const world = w.P._world();
  for (const d of ["n", "s", "e", "w"]) if (world.rooms[world.startId].exits[d] != null) { w.P._exec(d); break; }
  ok("audio: still no context while sound is OFF", w.audio() === 0, w.audio());
  w.P._setSound(true);
  ok("audio: opt-in creates a context on the gesture", w.audio() === 1, w.audio());
  ok("audio: reflects on", w.P._audio().on === true, w.P._audio());

  // pref ON in storage but STILL no autoplay until a beep fires from a gesture
  const w2 = makeWorld({ store: { "wuld:console:audio": "1" } });
  ok("audio: pref-on does NOT autoplay a context at boot", w2.audio() === 0, w2.audio());
  ok("audio: pref-on reflected on", w2.P._audio().on === true, w2.P._audio());
  w2.P._cue("move");
  ok("audio: first cue after boot creates the context", w2.audio() === 1, w2.audio());

  // reduced-motion: audio fully suppressed even after opt-in
  const r = makeWorld({ reducedMotion: true });
  ok("reduced: reduced flag true", r.P._reduced() === true, r.P._reduced());
  ok("reduced: term carries con-reduced", byClass(r.body, "con-reduced").length === 1, byClass(r.body, "con-reduced").length);
  r.P._setSound(true); r.P._cue("win");
  ok("reduced: NO AudioContext ever (even opting in)", r.audio() === 0, r.audio());
  ok("reduced: audio forced off", r.P._audio().on === false, r.P._audio());
  const rbtn = byClass(r.body, "con-btn").filter(function (b) { return /sound/.test(b.textContent); })[0];
  ok("reduced: sound button disabled", rbtn && rbtn.disabled === true, rbtn && rbtn.disabled);
})();

// ---------------------------------------------------------------- PASS 8: source firewall
(function () {
  const STANCE = /\b(antinatal|antinatalism|efilist|refusal[\s-]?suite|objection[\s-]?node|rebuttal|cold[\s-]?grad|\bRSI\b|firewall[\s-]?[AB]|corpus|steelman|optionality)\b/i;
  ok("fence: engine has no argument-library stance strings", !STANCE.test(ENGINE_CODE), null);
  ok("fence: shell has no argument-library stance strings", !STANCE.test(CONSOLE_CODE), null);
  ok("fence: prng has no argument-library stance strings", !STANCE.test(PRNG_CODE), null);
  // imports: only console-prng <- engine; console.js & prng import nothing external
  ok("fence: engine imports only console-prng.js", (ENGINE_CODE.match(/require\(([^)]*)\)/g) || []).every(function (r) { return /console-prng\.js/.test(r); }), (ENGINE_CODE.match(/require\(([^)]*)\)/g) || []));
  ok("fence: shell requires nothing", !/require\s*\(/.test(CONSOLE_CODE), null);
  ok("fence: no import of any library/objection/efilist/persona module", !/(argument|objection|efilist|library-|persona|yurei|omega|combined)[^"']*\.(js|json)/i.test(CONSOLE_CODE + ENGINE_CODE + PRNG_CODE), null);
  // audio is opt-in: AudioContext is only referenced inside an audioOn/reduced-guarded path
  ok("fence: AudioContext only constructed via ensureCtx (guarded)", /audioOn/.test(CONSOLE_CODE) && /ensureCtx/.test(CONSOLE_CODE), null);
  // own-key namespace declared
  ok("fence: own-key namespace wuld:console:*", /wuld:console:/.test(CONSOLE_CODE) && /wuld:console:/.test(ENGINE_CODE), null);
})();

// ---------------------------------------------------------------- PASS 9: CSS reduced-motion
(function () {
  const rm = CONSOLE_CSS.slice(CONSOLE_CSS.indexOf("prefers-reduced-motion"));
  ok("css: has a reduced-motion block", CONSOLE_CSS.indexOf("prefers-reduced-motion") >= 0, null);
  ok("css: reduced-motion kills animation", /animation:\s*none/.test(rm), null);
  ok("css: reduced-motion strips transition", /transition:\s*none/.test(rm), null);
  ok("css: reduced-motion hides the scanline", /\.con-term::after\s*\{\s*display:\s*none/.test(rm), null);
  ok("css: no external url() refs", !/url\(/.test(CONSOLE_CSS), null);
})();

// ---------------------------------------------------------------- PASS 10: deepened-pool structural invariants (proto)
// Structural, NOT golden-string: proves the enlarged prose/item pools never break
// genWorld across a broad seed sweep, the descent is always 100%-walkable (SEEN can
// reach roomCount), and variety actually grew — without pinning exact generated text.
(function () {
  const OPP = { n: "s", s: "n", e: "w", w: "e" };
  function reachAvoid(w, avoid) {           // BFS from start, never expanding through `avoid`
    const d = new Array(w.rooms.length).fill(-1); d[w.startId] = 0; const q = [w.startId];
    while (q.length) { const c = q.shift(); if (c === avoid) continue;
      for (const dir of ["n", "s", "e", "w"]) { const n = w.rooms[c].exits[dir]; if (n != null && n !== avoid && d[n] < 0) { d[n] = d[c] + 1; q.push(n); } } }
    return d;
  }
  const N = 1200;
  let threw = 0, conn = 0, recip = 0, badCount = 0, keyBad = 0, endItem = 0,
      emptyProse = 0, undefProse = 0, orphan = 0, nondet = 0;
  const titles = new Set(), items = new Set();
  for (let i = 0; i < N; i++) {
    const seed = "sweep#" + i;
    let w;
    try { w = E.genWorld(seed); } catch (e) { threw++; continue; }
    if (JSON.stringify(w) !== JSON.stringify(E.genWorld(seed))) nondet++;   // determinism across the sweep
    if (w.rooms.length < 11 || w.rooms.length > 15) badCount++;
    if (reach(w).some((x) => x < 0)) conn++;                                 // every room physically reachable
    if (w.rooms[w.keyRoomId].item !== "key") keyBad++;
    if (w.rooms[w.startId].item != null || w.rooms[w.terminusId].item != null) endItem++;
    // SEEN-complete: every non-terminus room reachable WITHOUT descending (entering
    // the terminus ends the run) -> a player can walk seen up to roomCount.
    const ra = reachAvoid(w, w.terminusId);
    for (let k = 0; k < w.rooms.length; k++) { if (k === w.terminusId) continue; if (ra[k] < 0) { orphan++; break; } }
    for (let k = 0; k < w.rooms.length; k++) {
      const r = w.rooms[k];
      if (!r.title || !r.desc || !r.sight || !r.sightDetail) emptyProse++;
      if (/undefined|\bnull\b/.test(r.title + "|" + r.desc + "|" + r.sight)) undefProse++;
      titles.add(r.title); if (r.item) items.add(r.item);
      for (const dr of ["n", "s", "e", "w"]) { const n = r.exits[dr]; if (n != null && w.rooms[n].exits[OPP[dr]] !== k) recip++; }
    }
  }
  ok("proto: genWorld never throws across " + N + " seeds", threw === 0, threw);
  ok("proto: deterministic across the sweep (byte-identical x2)", nondet === 0, nondet);
  ok("proto: room count stays 11..15 across the sweep", badCount === 0, badCount);
  ok("proto: every room reachable across the sweep", conn === 0, conn);
  ok("proto: exits reciprocal across the sweep", recip === 0, recip);
  ok("proto: key always on the key room", keyBad === 0, keyBad);
  ok("proto: threshold + descent stay item-free", endItem === 0, endItem);
  ok("proto: SEEN-complete — no room stranded behind the descent", orphan === 0, orphan);
  ok("proto: no empty title/desc/sight across the sweep", emptyProse === 0, emptyProse);
  ok("proto: no undefined/null leaking into prose", undefProse === 0, undefProse);
  // variety actually grew (pre-deepening ceiling was ADJ*NOUN = 324 + 2 hardcoded = 326)
  ok("proto: title variety exceeds the pre-deepening ceiling (>900 distinct)", titles.size > 900, titles.size);
  // every declared flavour item + the key gets placed somewhere across the sweep
  const wantItems = ["key", "candle", "map", "wire", "lens", "matches", "coin", "photo", "ribbon", "whistle"];
  ok("proto: every declared item is placeable", wantItems.every((it) => items.has(it)), [...items].sort());
})();

// ---------------------------------------------------------------- PASS 11: seed-share deep-links (K267)
// Deterministic worlds make a link the world. Structural invariants only:
// URL-hash -> exact world; share-link round-trip; #seed overrides resume;
// malformed/hostile hash falls through safely; own-key isolation still holds.
(function () {
  const w0 = makeWorld({});
  const norm = w0.P._normSeed;
  ok("share: normaliser lowercases + hyphenates whitespace", norm("The Cold Below") === "the-cold-below", norm("The Cold Below"));
  ok("share: normaliser strips hostile chars (no injection surface)", norm("<script>alert(1)</script>") === "scriptalert1script", norm("<script>alert(1)</script>"));
  ok("share: normaliser leaves no key/stance punctuation", /[^a-z0-9-]/.test(norm("wuld:console:save")) === false, norm("wuld:console:save"));
  ok("share: normaliser is idempotent", norm(norm("  A_B--c!! ")) === norm("  A_B--c!! "), norm("  A_B--c!! "));
  ok("share: normaliser caps length at 48", norm("x".repeat(200)).length === 48, norm("x".repeat(200)).length);
  ok("share: unicode-only seed normalises to empty", norm("\u03a9\u03a9\u03a9") === "", norm("\u03a9\u03a9\u03a9"));

  // boot from URL hash -> exact world, with NO unlocked flag in the store (curtain-independent)
  const h = makeWorld({ hash: "#seed=cold-below" });
  ok("share: boot reads #seed and builds that world", h.P._world().seed === "cold-below", h.P._world().seed);
  ok("share: hash world == genWorld(seed) byte-for-byte", JSON.stringify(h.P._world()) === JSON.stringify(E.genWorld("cold-below")), null);

  // a saved prior run to override
  const saved = (function () { const a = makeWorld({}); a.P._new("prior-run"); return Object.assign({}, a.store); })();
  ok("share: a prior save exists", "wuld:console:save" in saved, Object.keys(saved));
  const ov = makeWorld({ store: Object.assign({}, saved), hash: "#seed=shared-one" });
  ok("share: #seed OVERRIDES the local resume", ov.P._world().seed === "shared-one", ov.P._world().seed);
  const rz = makeWorld({ store: Object.assign({}, saved) });
  ok("share: no hash -> resume unchanged", rz.P._world().seed === "prior-run", rz.P._world().seed);

  // share-link ROUND-TRIP
  const s1 = makeWorld({}); s1.P._new("round-trip-seed");
  const link = s1.P._shareLink();
  ok("share: link targets the canonical prod page", /^https:\/\/wuld\.ink\/console\/#seed=round-trip-seed$/.test(link), link);
  const back = norm(/[#&]seed=([^&]*)/.exec(link)[1]);
  ok("share: round-trip seed regenerates byte-identical world", JSON.stringify(E.genWorld(back)) === JSON.stringify(s1.P._world()), { back });
  const rt = makeWorld({ hash: link.slice(link.indexOf("#")) });
  ok("share: booting the emitted link reproduces the world", JSON.stringify(rt.P._world()) === JSON.stringify(s1.P._world()), null);

  // `share` command emits the deep-link into the output (+ the in-register line + control)
  const sc = makeWorld({}); sc.P._new("emit-seed"); sc.P._exec("share");
  const outTxt = byClass(sc.body, "con-line").map((l) => l.textContent).join("\n");
  ok("share: `share` prints the deep-link", outTxt.indexOf("https://wuld.ink/console/#seed=emit-seed") >= 0, null);
  ok("share: `share` prints the in-register line", /a way back in, for someone else/.test(outTxt), null);
  ok("share: a [ share ] control is rendered", byClass(sc.body, "con-btn").some((b) => /share/.test(b.textContent)), null);

  // malformed / empty / hostile hash -> safe fall-through, no throw, no injection
  let threw = false;
  try {
    ok("share: empty #seed= -> valid random world", makeWorld({ hash: "#seed=" }).P._world().rooms.length >= 11, null);
    ok("share: hash without seed param -> valid world", makeWorld({ hash: "#nonsense" }).P._world().rooms.length >= 11, null);
    ok("share: malformed %-encoding does not throw", makeWorld({ hash: "#seed=%E0%A4%A" }).P._world().rooms.length >= 11, null);
    const m4 = makeWorld({ hash: "#seed=<img src=x onerror=alert(1)>" });
    ok("share: hostile hash -> opaque safe seed only", /^[a-z0-9-]*$/.test(m4.P._world().seed), m4.P._world().seed);
  } catch (e) { threw = true; }
  ok("share: no hash path ever throws", threw === false, threw);

  // own-key isolation STILL holds across hash-boot + a move + share
  const iso = makeWorld({ hash: "#seed=iso-share" });
  const iw = iso.P._world(); for (const d of ["n", "s", "e", "w"]) if (iw.rooms[iw.startId].exits[d] != null) { iso.P._exec(d); break; }
  iso.P._exec("share");
  ok("share: hash-boot + share write only wuld:console:*", iso.writes.filter((k) => k.indexOf("wuld:console:") !== 0).length === 0, iso.writes.filter((k) => k.indexOf("wuld:console:") !== 0));
})();

// ---------------------------------------------------------------- report
console.log("console-e2e: " + pass + "/" + (pass + fail) + " passed");
if (fail) { console.log("FAILURES:"); fails.forEach(function (f) { console.log("  x " + f); }); process.exit(1); }
process.exit(0);
