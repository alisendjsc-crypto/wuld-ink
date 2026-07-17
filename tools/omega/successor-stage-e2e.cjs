#!/usr/bin/env node
/* successor-stage-e2e.cjs — Build B: the Successor Stage proof (K232; K241
   immersion pass: auto-open post-curtain, the sgate-unlock watcher, the live
   in-stage persona toggle — the ONE path that writes the shared
   wuld:persona-active key — crisis-post-swap, and the closed-state re-enter).
   ===========================================================================
   Drives the REAL src/components/successor-stage.js inside a tiny zero-dep DOM /
   localStorage / matchMedia shim (no jsdom — matches the repo's other .cjs
   gates), over the REAL yurei-oracle.js engine and the REAL mrgrey corpus.
   Proves the Build-B contract:
     * the stage builds its OWN YureiOracle.Matcher over the reused corpus and
       routes every input through .respond() -> the crisis floor fires FIRST and
       is flagged (sstage-crisis); ZERO new matcher / corpus bytes
     * it coordinates the corner surface through the persona's PUBLIC api
       (close/state) only -> closes the bubble on open, honours a killed persona
       (fall back to the other; both killed -> resting hint)
     * the transcript persists per-persona under its OWN keys (wuld:successor:*)
       and replays across a fresh module instance; download + clear work
     * own-key isolation: plain open/ask/close never writes wuld:persona-active
       or a component store; the EXPLICIT toggle writes wuld:persona-active
       (the shared key) and nothing else beyond its own wuld:successor:* keys
     * reduced-motion: the avatar shows the still, not the clip; CSS strips motion
     * page-scope: does nothing unless [data-successor-stage] is on the page
   Not a substitute for yurei-parity / omega-persona-gate; this proves the
   surface-coordination LAYER, which touches no matcher/corpus byte. */
"use strict";
const fs = require("fs");
const path = require("path");
const COMP = path.join(__dirname, "..", "..", "src", "components");
const SRC = fs.readFileSync(path.join(COMP, "successor-stage.js"), "utf8");
const CSS = fs.readFileSync(path.join(COMP, "successor-stage.css"), "utf8");
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, "");   // fences test executable code, not the header prose
const ORACLE = require(path.join(COMP, "yurei-oracle.js"));           // the REAL engine
const MRGREY = require(path.join(COMP, "omega-corpus-mrgrey.json"));  // the REAL corpus (3 inherited crisis)
const ENTRIES = MRGREY.yurei_corpus.entries;

// a minimal manifest exercising the ported avatar resolver (still + loop + clip + fallback)
const MANIFEST = { assets: [
  { role: "canonical-p0", file: "still.png", kind: "still" },
  { role: "idle", file: "idle.webm", kind: "loop", loop: true },
  { role: "speak", file: "speak.webm", kind: "clip" }
], animation_fallback: { speak: "idle", listen: "idle" } };

let pass = 0, fail = 0; const fails = [];
function ok(name, cond, got) { if (cond) pass++; else { fail++; fails.push(name + "  (got: " + JSON.stringify(got) + ")"); } }

// ---------------------------------------------------------------- DOM shim
function Elem(tag) {
  this.tagName = tag; this.children = []; this.parentNode = null;
  this._cls = {}; this._attrs = {}; this.style = {};
  this.textContent = ""; this.type = ""; this.value = ""; this.id = "";
  this.hidden = false; this.src = ""; this.href = "";
  this.scrollTop = 0; this.scrollHeight = 0; this.muted = false; this.loop = false; this.onended = null;
  this._ls = {};
  const el = this;
  this.classList = {
    add: function () { for (let i = 0; i < arguments.length; i++) el._cls[arguments[i]] = 1; },
    remove: function () { for (let i = 0; i < arguments.length; i++) delete el._cls[arguments[i]]; },
    contains: function (c) { return !!el._cls[c]; }
  };
}
Elem.prototype.setAttribute = function (k, v) { this._attrs[k] = String(v); };
Elem.prototype.getAttribute = function (k) { return (k in this._attrs) ? this._attrs[k] : null; };
Elem.prototype.appendChild = function (c) { c.parentNode = this; this.children.push(c); return c; };
Elem.prototype.removeChild = function (c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; };
Elem.prototype.addEventListener = function (t, fn) { (this._ls[t] = this._ls[t] || []).push(fn); };
Elem.prototype.fire = function (t, ev) { const self = this; (this._ls[t] || []).slice().forEach(function (fn) { fn.call(self, ev || {}); }); };
Elem.prototype.click = function () { this.fire("click"); };
Elem.prototype.focus = function () {};
Elem.prototype.play = function () {};
Elem.prototype.pause = function () {};
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
function byAttr(root, name) { return collect(root, function (c) { return (name in c._attrs); }, []); }
function walk(node, pred) { for (let i = 0; i < node.children.length; i++) { const c = node.children[i]; if (pred(c)) return c; const r = walk(c, pred); if (r) return r; } return null; }
function lastByClass(root, cls) { const a = byClass(root, cls); return a.length ? a[a.length - 1] : null; }

// personas: mock ONLY the public api the stage may touch (close/state); records calls + kill state
function persona(killed) {
  const calls = [];
  return { _calls: calls, _killed: !!killed,
    api: { close: function () { calls.push("close"); }, state: function () { return { killed: calls._k }; } },
    setKilled: function (k) { this.api.state = function () { return { killed: !!k }; }; } };
}

function makeWorld(opts) {
  opts = opts || {};
  const created = [];                       // every element ever created (for post-detach inspection)
  const head = new Elem("head"), body = new Elem("body");
  const mount = new Elem("div"); mount.setAttribute("data-successor-stage", ""); mount.id = "successor-stage-mount";
  if (!opts.noMount) body.appendChild(mount);
  const doc = {
    readyState: "complete", head: head, body: body,
    createElement: function (t) { const e = new Elem(t); created.push(e); return e; },
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
  const ls = { getItem: function (k) { return (k in store) ? store[k] : null; }, setItem: function (k, v) { store[k] = String(v); writes.push(k); } };
  const RM = !!opts.reducedMotion;
  const objurls = [];
  const win = {
    setTimeout: function (fn) { if (fn) fn(); return 1; },
    matchMedia: function (q) { return { matches: RM, media: q, addListener: function () {}, addEventListener: function () {} }; },
    fetch: function () { return Promise.reject(new Error("no-network-in-e2e")); }
  };
  const yurei = opts.yurei || persona(false);
  const omega = opts.omega || persona(false);
  win.yurei = { assistant: yurei.api }; win._y = yurei;
  win.omega = { assistant: omega.api }; win._o = omega;
  win.YureiOracle = ORACLE;                  // the engine is already present -> ensureOracle() no-ops

  // K241: the unlock watcher needs documentElement + MutationObserver — shim a
  // recording observer so the sgate-open hook is drivable from the tests.
  const de = new Elem("html");
  doc.documentElement = de;
  const observers = [];
  global.MutationObserver = function (cb) {
    const o = { cb: cb, targets: [], disconnected: false };
    o.observe = function (t) { o.targets.push(t); };
    o.disconnect = function () { o.disconnected = true; };
    observers.push(o); return o;
  };

  global.window = win; global.document = doc; global.localStorage = ls;
  global.Blob = function (parts) { this._parts = parts; };
  global.URL = { createObjectURL: function () { const u = "blob:stage/" + objurls.length; objurls.push(u); return u; }, revokeObjectURL: function () {} };
  eval(SRC);   // the module IIFE boots -> boot() -> renderMount(); K241: + auto-open when unlocked
  return { win, doc, head, body, mount, ls, store, writes, created, objurls, yurei, omega, de, observers, P: win.wuldSuccessorStage };
}
function seedMrgrey(w) { w.P._seed("mrgrey", ENTRIES, MANIFEST); }
function seedYurei(w) { w.P._seed("yurei", ENTRIES, MANIFEST); }

// ---------------------------------------------------------------- PASS 1: page-scope mount render
(function () {
  const w = makeWorld({});
  ok("mount: renderMount returns true when host present", w.P._mount() === true, w.P._mount());
  ok("mount: exactly one open button injected", byClass(w.body, "sstage-open-btn").length === 1, byClass(w.body, "sstage-open-btn").length);
  ok("mount: a caption <p> injected", byClass(w.body, "sstage-open-cap").length === 1, byClass(w.body, "sstage-open-cap").length);
  ok("mount: host un-hidden", w.mount.hidden === false, w.mount.hidden);
  ok("mount: no overlay before open", byClass(w.body, "sstage-overlay").length === 0, byClass(w.body, "sstage-overlay").length);
  ok("mount: not open at boot", w.P.isOpen() === false, w.P.isOpen());

  // page-scope: absent host -> renderMount false, no button
  const w2 = makeWorld({ noMount: true });
  ok("scope: no host -> renderMount false", w2.P._mount() === false, w2.P._mount());
  ok("scope: no host -> no button", byClass(w2.body, "sstage-open-btn").length === 0, byClass(w2.body, "sstage-open-btn").length);
})();

// ---------------------------------------------------------------- PASS 2: open builds overlay + closes the corner bubble
(function () {
  const w = makeWorld({}); seedMrgrey(w);
  w.P._open();
  ok("open: built flag set", w.P.built() === true, w.P.built());
  ok("open: isOpen true", w.P.isOpen() === true, w.P.isOpen());
  ok("open: persona is mrgrey (default)", w.P.persona() === "mrgrey", w.P.persona());
  const ov = byClass(w.body, "sstage-overlay");
  ok("open: overlay appended to body", ov.length === 1, ov.length);
  ok("open: overlay visible + not hidden", ov[0] && ov[0]._cls["sstage-visible"] && ov[0].hidden === false, ov[0] && ov[0].hidden);
  ok("open: panel present", byClass(w.body, "sstage-panel").length === 1, byClass(w.body, "sstage-panel").length);
  ok("open: transcript present (role=log)", byClass(w.body, "sstage-transcript").length === 1, byClass(w.body, "sstage-transcript").length);
  ok("open: title reads Mr. Grey", byClass(w.body, "sstage-title")[0].textContent === "Mr. Grey", byClass(w.body, "sstage-title")[0].textContent);
  ok("open: corner bubble CLOSED via api().close()", w.omega._calls.indexOf("close") >= 0, w.omega._calls);
  ok("open: a system intro line seeded", byClass(w.body, "sstage-sys").length >= 1, byClass(w.body, "sstage-sys").length);

  // close returns to the corner, view flag flips
  w.P.close();
  ok("close: isOpen false", w.P.isOpen() === false, w.P.isOpen());
  ok("close: overlay hidden", byClass(w.body, "sstage-overlay")[0].hidden === true, byClass(w.body, "sstage-overlay")[0].hidden);
})();

// ---------------------------------------------------------------- PASS 3: ask -> normal round-trip through the real matcher
(function () {
  const w = makeWorld({}); seedMrgrey(w); w.P._open();
  w.P._ask("hello");
  const them = byClass(w.body, "sstage-them");
  ok("ask: a 'them' reply line rendered", them.length === 1, them.length);
  const bub = them.length ? byClass(them[0], "sstage-bubble")[0] : null;
  ok("ask: reply is the real mg-greet-01 response", bub && /you're here/i.test(bub.textContent), bub && bub.textContent.slice(0, 40));
  ok("ask: NOT flagged crisis on a normal message", byClass(w.body, "sstage-crisis").length === 0, byClass(w.body, "sstage-crisis").length);
  const tx = w.P._tx("mrgrey");
  ok("ask: transcript stored 2 lines (you+them)", tx.lines.length === 2 && tx.lines[0].who === "you" && tx.lines[1].who === "them", tx.lines.map(function (l) { return l.who; }));
  ok("ask: stored reply crisis=false", tx.lines[1].crisis === false, tx.lines[1].crisis);
})();

// ---------------------------------------------------------------- PASS 4: crisis fires FIRST + is flagged
(function () {
  const w = makeWorld({}); seedMrgrey(w); w.P._open();
  w.P._ask("I want to kill myself");
  const crisis = byClass(w.body, "sstage-crisis");
  ok("crisis: the reply line carries sstage-crisis", crisis.length === 1, crisis.length);
  const tx = w.P._tx("mrgrey");
  ok("crisis: stored reply flagged crisis=true", tx.lines[1] && tx.lines[1].crisis === true, tx.lines[1] && tx.lines[1].crisis);
  ok("crisis: reply text is the crisis response (not a persona line)", tx.lines[1] && tx.lines[1].text.length > 0, tx.lines[1] && tx.lines[1].text.slice(0, 30));
  // proves the floor rode the stage's OWN matcher (the seeded real engine)
  const O = ORACLE; const m = new O.Matcher(ENTRIES, { unsealed: false });
  ok("crisis: engine parity — same input hits class crisis", m.respond("I want to kill myself").class === "crisis", m.respond("I want to kill myself").class);
})();

// ---------------------------------------------------------------- PASS 5: persist + replay across a FRESH module instance
(function () {
  const a = makeWorld({}); seedMrgrey(a); a.P._open();
  a.P._ask("hello"); a.P._ask("who are you");
  const stored = a.P._tx("mrgrey").lines.length;
  ok("persist: two exchanges stored (4 lines)", stored === 4, stored);
  // a brand-new world, same localStorage store -> transcript replays
  const b = makeWorld({ store: a.store }); seedMrgrey(b); b.P._open();
  const rows = byClass(b.body, "sstage-line").length;
  const sys = byClass(b.body, "sstage-sys").length;
  ok("replay: fresh instance re-reads the store", b.P._tx("mrgrey").lines.length === 4, b.P._tx("mrgrey").lines.length);
  ok("replay: seeded transcript shows intro + all persisted lines", rows >= 4 && sys >= 1, { rows: rows, sys: sys });
})();

// ---------------------------------------------------------------- PASS 6: download + clear
(function () {
  const w = makeWorld({}); seedMrgrey(w); w.P._open();
  w.P._ask("hello");
  const dl = lastByClass(w.body, "sstage-foot") ? byClass(lastByClass(w.body, "sstage-foot"), "sstage-btn") : [];
  ok("foot: two mono buttons ([download] [clear])", dl.length === 2, dl.length);
  const txt = w.P._txText("mrgrey");
  ok("download: txText joins the transcript", /You: hello/.test(txt) && /Mr\. Grey:/.test(txt), txt.slice(0, 40));
  dl[0].click();   // [ download ]
  ok("download: URL.createObjectURL called (blob path ran)", w.objurls.length === 1, w.objurls.length);
  const anchors = w.created.filter(function (e) { return e.tagName === "a" && e.download; });
  ok("download: anchor carries successor-mrgrey.txt", anchors.length === 1 && anchors[0].download === "successor-mrgrey.txt", anchors.map(function (a) { return a.download; }));
  dl[1].click();   // [ clear ]
  ok("clear: store reset to empty lines", w.P._tx("mrgrey").lines.length === 0, w.P._tx("mrgrey").lines.length);
  ok("clear: transcript re-seeded to the intro only", byClass(w.body, "sstage-line").length === 1 && byClass(w.body, "sstage-sys").length === 1, byClass(w.body, "sstage-line").length);
})();

// ---------------------------------------------------------------- PASS 7: own-key isolation
(function () {
  const w = makeWorld({}); seedMrgrey(w); w.P._open(); w.P._ask("hello"); w.P.close();
  const alien = w.writes.filter(function (k) { return k.indexOf("wuld:successor:") !== 0; });
  ok("isolation: only wuld:successor:* keys written", alien.length === 0, alien);
  ok("isolation: never writes wuld:persona-active", w.writes.indexOf("wuld:persona-active") === -1, w.writes.indexOf("wuld:persona-active"));
  ok("isolation: never writes a component/persona store", ["wuld:wrongHour", "wuld:yurei.voice", "wuld:mrgrey", "wuld:yurei.off"].every(function (k) { return w.writes.indexOf(k) === -1; }), w.writes);
})();

// ---------------------------------------------------------------- PASS 8: kill fallback
(function () {
  // active (mrgrey) killed, yurei alive -> stage falls back to yurei
  const omega = persona(false); omega.setKilled(true);
  const yurei = persona(false);
  const w = makeWorld({ omega: omega, yurei: yurei }); seedMrgrey(w); seedYurei(w);
  w.P._open();
  ok("kill: active killed -> fell back to yurei", w.P.persona() === "yurei", w.P.persona());
  ok("kill: fallback title reads Yūrei", byClass(w.body, "sstage-title")[0].textContent === "Yūrei", byClass(w.body, "sstage-title")[0].textContent);
  ok("kill: fallback closed the yurei bubble", yurei._calls.indexOf("close") >= 0, yurei._calls);
  w.P.close();

  // BOTH killed -> resting hint (no persona staged)
  const o2 = persona(false); o2.setKilled(true);
  const y2 = persona(false); y2.setKilled(true);
  const w2 = makeWorld({ omega: o2, yurei: y2 }); seedMrgrey(w2); seedYurei(w2);
  w2.P._open();
  ok("kill: both killed -> one sys line", byClass(w2.body, "sstage-sys").length === 1, byClass(w2.body, "sstage-sys").length);
  const bubs = byClass(w2.body, "sstage-bubble");
  ok("kill: both killed -> resting sys line", bubs.some(function (b) { return /resting/i.test(b.textContent); }), bubs.map(function (b) { return b.textContent; }));
  ok("kill: both killed -> title 'The desk'", byClass(w2.body, "sstage-title")[0].textContent === "The desk", byClass(w2.body, "sstage-title")[0].textContent);
})();

// ---------------------------------------------------------------- PASS 9: reduced-motion still + static fences
(function () {
  const w = makeWorld({ reducedMotion: true }); seedMrgrey(w); w.P._open();
  w.P._ask("hello");   // reply -> showSprite("speak")
  const img = byClass(w.body, "sstage-av-img")[0];
  const vid = byClass(w.body, "sstage-av-video")[0];
  ok("reduced: avatar shows the still <img>", img && typeof img.src === "string" && /still\.png$/.test(img.src), img && img.src);
  ok("reduced: video hidden under reduced-motion", vid && vid.style.display === "none", vid && vid.style.display);

  // CSS strips motion under reduced-motion
  const rm = CSS.slice(CSS.indexOf("prefers-reduced-motion"));
  ok("css: reduced-motion block strips transitions", /transition:\s*none/.test(rm), rm.slice(0, 60));
  ok("css: reduced-motion hides the clip", /\.sstage-av-video\s*\{\s*display:\s*none/.test(rm), null);

  // static source fences: ZERO new matcher/corpus bytes, public-api-only coordination
  ok("fence: routes input through .respond() (full crisis-first pipeline)", /\.respond\(/.test(CODE), null);
  ok("fence: builds its OWN Matcher over the reused engine", /new\s+window\.YureiOracle\.Matcher\(/.test(CODE), null);
  ok("fence: reuses the existing engine file, not a new one", /yurei-oracle\.js/.test(CODE), null);
  ok("fence: never calls a persona say()/off()", !/\.say\s*\(/.test(CODE) && !/\.off\s*\(/.test(CODE), null);
  ok("fence: coordinates only via api().close()", /\.close\s*\(\)/.test(CODE), null);
  ok("fence: own-key store only (wuld:successor:*)", /wuld:successor:/.test(CODE) && !/setItem[\s\S]{0,40}persona-active/.test(CODE), null);
  // K241 fences: the immersion-pass wiring is present and correctly routed
  ok("fence: auto-open gated on the sgate key", /wuld:successor:unlocked/.test(CODE), null);
  ok("fence: unlock watcher targets the sgate-open class", /sgate-open/.test(CODE), null);
  ok("fence: the live swap is routed through switchStagePersona", /function switchStagePersona/.test(CODE), null);
  ok("fence: the shared-key write rides lsSet(ACTIVE_KEY (never a bare setItem)", /lsSet\(ACTIVE_KEY/.test(CODE), null);
})();

// ---------------------------------------------------------------- PASS 10: K241 auto-open — the stage IS the page post-curtain
(function () {
  const w = makeWorld({});
  ok("autoopen: locked at boot -> stage stays closed", w.P.isOpen() === false, w.P.isOpen());
  ok("autoopen: locked at boot -> unlock observer armed on documentElement",
     w.observers.length >= 1 && w.observers.some(function (o) { return o.targets.indexOf(w.de) >= 0; }), w.observers.length);
})();

// ---------------------------------------------------------------- PASS 11: the sgate-unlock hook opens the stage live
(function () {
  const w = makeWorld({}); seedMrgrey(w); seedYurei(w);
  ok("unlockhook: closed while curtained", w.P.isOpen() === false, w.P.isOpen());
  w.de.classList.add("sgate-open");
  w.observers.slice().forEach(function (o) { if (!o.disconnected) o.cb(); });
  ok("unlockhook: sgate-open -> stage opened itself", w.P.isOpen() === true, w.P.isOpen());
  ok("unlockhook: default persona staged", w.P.persona() === "mrgrey", w.P.persona());
  ok("unlockhook: observer disconnected after firing", w.observers.every(function (o) { return o.disconnected || o.targets.indexOf(w.de) < 0; }), null);
  ok("unlockhook: opening wrote NO shared persona key", w.writes.indexOf("wuld:persona-active") === -1, w.writes);
})();

// ---------------------------------------------------------------- PASS 12: the live in-stage toggle (the K241 point)
(function () {
  const w = makeWorld({}); seedMrgrey(w); seedYurei(w); w.P._open();
  const chips = byClass(w.body, "sstage-chip");
  ok("toggle: two chips rendered in the head", chips.length === 2, chips.length);
  const yChip = chips.filter(function (c) { return c.getAttribute("data-sstage-persona") === "yurei"; })[0];
  const mChip = chips.filter(function (c) { return c.getAttribute("data-sstage-persona") === "mrgrey"; })[0];
  ok("toggle: active chip marked at open (mrgrey)", mChip && mChip.getAttribute("aria-checked") === "true" && yChip.getAttribute("aria-checked") === "false", mChip && mChip.getAttribute("aria-checked"));
  w.P._ask("hello");
  const kept = w.P._tx("mrgrey").lines.length;
  yChip.click();
  ok("toggle: overlay STAYS open across the swap", w.P.isOpen() === true && byClass(w.body, "sstage-overlay")[0].hidden === false, w.P.isOpen());
  ok("toggle: main view swapped to yurei", w.P.persona() === "yurei", w.P.persona());
  ok("toggle: title follows the swap", byClass(w.body, "sstage-title")[0].textContent === "Yūrei", byClass(w.body, "sstage-title")[0].textContent);
  ok("toggle: chips re-marked", yChip.getAttribute("aria-checked") === "true" && mChip.getAttribute("aria-checked") === "false", yChip.getAttribute("aria-checked"));
  ok("toggle: writes the SHARED key -> corner widgets sync at next boot", w.writes.indexOf("wuld:persona-active") >= 0 && w.store["wuld:persona-active"] === "yurei", w.store["wuld:persona-active"]);
  const alien = w.writes.filter(function (k) { return k.indexOf("wuld:successor:") !== 0 && k !== "wuld:persona-active"; });
  ok("toggle: beyond the shared key, own keys only", alien.length === 0, alien);
  ok("toggle: the incoming persona's corner bubble closed (one surface)", w.yurei._calls.indexOf("close") >= 0, w.yurei._calls);
  ok("toggle: transcript re-seeded for yurei (intro only)", byClass(w.body, "sstage-line").length === 1, byClass(w.body, "sstage-line").length);
  w.P._ask("I want to kill myself");
  ok("toggle: crisis fires post-swap through respond()", byClass(w.body, "sstage-crisis").length === 1, byClass(w.body, "sstage-crisis").length);
  mChip.click();
  ok("toggle: swap back replays the held mrgrey transcript", w.P.persona() === "mrgrey" && w.P._tx("mrgrey").lines.length === kept && byClass(w.body, "sstage-line").length === 1 + kept, byClass(w.body, "sstage-line").length);
  ok("toggle: same-chip re-click holds (public switchPersona true)", w.P.switchPersona("mrgrey") === true && w.P.persona() === "mrgrey", w.P.persona());

  // a killed target seat is refused: view + shared key held, resting line shown
  const yk = persona(false); yk.setKilled(true);
  const w2 = makeWorld({ yurei: yk }); seedMrgrey(w2); seedYurei(w2); w2.P._open();
  const y2 = byClass(w2.body, "sstage-chip").filter(function (c) { return c.getAttribute("data-sstage-persona") === "yurei"; })[0];
  y2.click();
  ok("toggle: killed target refused -> persona held", w2.P.persona() === "mrgrey", w2.P.persona());
  ok("toggle: killed target -> a resting sys line", byClass(w2.body, "sstage-bubble").some(function (b) { return /resting/i.test(b.textContent); }), null);
  ok("toggle: killed target -> shared key NOT written", w2.writes.indexOf("wuld:persona-active") === -1, w2.writes);
})();

// ---------------------------------------------------------------- PASS 13: closed state -> the re-enter affordance restores
(function () {
  const w = makeWorld({}); seedMrgrey(w); w.P._open(); w.P._ask("hello"); w.P.close();
  ok("reenter: closed -> overlay hidden, mount affordance still present", w.P.isOpen() === false && byClass(w.body, "sstage-open-btn").length === 1, byClass(w.body, "sstage-open-btn").length);
  byClass(w.body, "sstage-open-btn")[0].click();
  ok("reenter: the mount button re-opens the stage", w.P.isOpen() === true, w.P.isOpen());
  ok("reenter: same persona + transcript replayed", w.P.persona() === "mrgrey" && byClass(w.body, "sstage-line").length === 3, byClass(w.body, "sstage-line").length);
})();

// ---------------------------------------------------------------- PASS 14 (async): auto-open at boot when already unlocked
(async function () {
  // unseeded on purpose: the corpus fetch is refused in-shim, so the open lands
  // on the resting hint — the AUTO-OPEN itself is the assertion.
  const w = makeWorld({ store: { "wuld:successor:unlocked": "1" } });
  await new Promise(function (r) { setImmediate(r); });
  ok("autoopen: unlocked at boot -> the stage opened itself", w.P.isOpen() === true, w.P.isOpen());
  ok("autoopen: overlay present + visible", byClass(w.body, "sstage-overlay").length === 1 && byClass(w.body, "sstage-overlay")[0].hidden === false, byClass(w.body, "sstage-overlay").length);
  ok("autoopen: auto-open wrote NO shared persona key", w.writes.indexOf("wuld:persona-active") === -1, w.writes);

  // report (moved here so the async pass is counted)
  console.log("successor-stage-e2e: " + pass + "/" + (pass + fail) + " passed");
  if (fail) { console.log("FAILURES:"); fails.forEach(function (f) { console.log("  x " + f); }); process.exit(1); }
  process.exit(0);
})();
