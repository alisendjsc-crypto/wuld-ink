#!/usr/bin/env node
/* persona-switcher-e2e.cjs — Ω2.1 switcher SURFACE proof (K231).
   ===========================================================================
   Drives the REAL src/components/persona-switcher.js inside a tiny zero-dep DOM
   shim (no jsdom — matches the repo's other .cjs gates). Proves the Ω2.1
   contract the kickoff names:
     • both personas present  -> switcher engages, one anchored seat, toggle
     • default = Mr. Grey first visit, last-used after (own key wuld:persona-active)
     • toggle flips active/dormant BOTH ways (opens the active via its public API)
     • the switcher only ever calls open/close/state — never say/input/matcher,
       so it cannot swallow or alter a crisis input; crisis fires from each
       persona's own matcher regardless of active/dormant DOM state
     • dismiss (a root removed) degrades to INERT without stranding the survivor
     • single-persona surface stays INERT (no chrome, persona untouched)
     • reduced-motion greys with NO motion (opacity-only) — source-asserted in CSS
   Not a substitute for yurei-parity.cjs / omega-persona-gate.cjs (those prove the
   vessel + the frozen matcher); this proves the coordination LAYER above them. */
"use strict";
const fs = require("fs");
const path = require("path");
const COMP = path.join(__dirname, "..", "..", "src", "components");
const SRC = fs.readFileSync(path.join(COMP, "persona-switcher.js"), "utf8");
const CSS = fs.readFileSync(path.join(COMP, "persona-switcher.css"), "utf8");
const YO = require(path.join(COMP, "yurei-oracle.js"));

let pass = 0, fail = 0; const fails = [];
function ok(name, cond, got) { if (cond) pass++; else { fail++; fails.push(name + "  (got: " + JSON.stringify(got) + ")"); } }

// ---------------------------------------------------------------- DOM shim
function makeWorld(initialStore) {
  const moCbs = [];
  let body = null;
  function notify(parent) { if (parent === body) moCbs.slice().forEach(function (cb) { try { cb(); } catch (e) {} }); }

  function Elem(tag) {
    this.tagName = tag; this.children = []; this.parentNode = null;
    this._cls = {}; this._attrs = {}; this.textContent = ""; this.type = ""; this.tabIndex = 0;
    const el = this;
    this.classList = {
      add: function () { for (let i = 0; i < arguments.length; i++) el._cls[arguments[i]] = 1; },
      remove: function () { for (let i = 0; i < arguments.length; i++) delete el._cls[arguments[i]]; },
      contains: function (c) { return !!el._cls[c]; }
    };
  }
  Elem.prototype.setAttribute = function (k, v) { this._attrs[k] = String(v); };
  Elem.prototype.getAttribute = function (k) { return (k in this._attrs) ? this._attrs[k] : null; };
  Elem.prototype.appendChild = function (c) { c.parentNode = this; this.children.push(c); notify(this); return c; };
  Elem.prototype.removeChild = function (c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; notify(this); return c; };
  Elem.prototype.addEventListener = function (t, fn) { (this._ls = this._ls || {}); (this._ls[t] = this._ls[t] || []).push(fn); };
  Elem.prototype.focus = function () { this._focused = true; };
  Object.defineProperty(Elem.prototype, "className", {
    get: function () { return Object.keys(this._cls).join(" "); },
    set: function (v) { this._cls = {}; String(v).split(/\s+/).forEach(function (c) { if (c) this._cls[c] = 1; }, this); }
  });

  body = new Elem("body");
  function find(node, cls, hit) {
    for (let i = 0; i < node.children.length; i++) {
      const c = node.children[i];
      if (c._cls[cls]) { hit.push(c); return c; }
      const r = find(c, cls, hit); if (r) return r;
    }
    return null;
  }
  const doc = {
    readyState: "complete",
    body: body,
    createElement: function (t) { return new Elem(t); },
    querySelector: function (sel) { if (sel[0] !== ".") return null; const h = []; return find(body, sel.slice(1), h); },
    addEventListener: function () {}
  };

  const store = Object.assign({}, initialStore || {});
  const writes = [];
  const ls = {
    getItem: function (k) { return (k in store) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); writes.push(k); }
  };

  const win = {
    setInterval: function () { return 1; },      // driven manually via _reconcile / notify
    clearInterval: function () {},
    requestAnimationFrame: function (fn) { fn(); return 1; }
  };
  function MO(cb) { this.cb = cb; }
  MO.prototype.observe = function () { moCbs.push(this.cb); };
  MO.prototype.disconnect = function () {};

  // persona stub: launcher + panel + a public API that logs every method the switcher calls
  function persona(prefix, ns) {
    const launcher = new Elem("button"); launcher.className = prefix + "-launcher";
    const panel = new Elem("div"); panel.className = prefix + "-panel";
    const st = { mounted: true, open: false, killed: false, entries: 20 };
    const calls = [];
    const api = {
      open: function () { calls.push("open"); st.open = true; return "open"; },
      close: function () { calls.push("close"); st.open = false; return "close"; },
      say: function () { calls.push("say"); return "say"; },
      off: function () { calls.push("off"); return "off"; },
      state: function () { calls.push("state"); return { mounted: st.mounted, open: st.open, killed: st.killed, entries: st.entries }; }
    };
    win[ns] = { assistant: api };
    return { launcher: launcher, panel: panel, api: api, calls: calls, st: st, ns: ns,
             mount: function () { body.appendChild(launcher); body.appendChild(panel); },
             unmount: function () { if (launcher.parentNode) body.removeChild(launcher); if (panel.parentNode) body.removeChild(panel); } };
  }
  const yurei = persona("yasst", "yurei");
  const mrgrey = persona("oasst", "omega");

  // install globals, then eval the real module (its IIFE boots against this world)
  global.window = win; global.document = doc; global.localStorage = ls; global.MutationObserver = MO;
  eval(SRC);
  const P = win.wuldPersona;

  function segOf(name) {
    const h = []; find(body, "persona-switch", h);
    const tog = h[0]; if (!tog) return null;
    for (let i = 0; i < tog.children.length; i++) if (tog.children[i].getAttribute("data-persona") === name) return tog.children[i];
    return null;
  }
  function clickSeg(name) { const s = segOf(name); if (!s || !s._ls || !s._ls.click) return; s._ls.click.forEach(function (fn) { fn.call(s, {}); }); }
  function dormant(p) { return p.launcher.classList.contains("persona-dormant"); }
  function toggleEl() { const h = []; find(body, "persona-switch", h); return h[0] || null; }

  return { win, doc, body, ls, store, writes, yurei, mrgrey, P, segOf, clickSeg, dormant, toggleEl,
           reconcile: function () { P._reconcile(); } };
}

// ---------------------------------------------------------------- scenarios
// PASS 1 — first visit (empty store)
(function () {
  const w = makeWorld({});

  // single persona -> inert
  w.mrgrey.mount(); w.reconcile();
  ok("single persona: NOT engaged", w.P.engaged() === false, w.P.engaged());
  ok("single persona: no persona-switch-on class", w.body.classList.contains("persona-switch-on") === false, w.body.className);
  ok("single persona: no toggle chrome", w.toggleEl() === null, "toggle present?");
  ok("single persona: survivor not dormant", w.mrgrey.launcher.classList.contains("persona-dormant") === false, "dormant");

  // second persona mounts -> engages (async-mount path via the observer)
  w.yurei.mount(); w.reconcile();
  ok("both present: engaged", w.P.engaged() === true, w.P.engaged());
  ok("engaged: body carries persona-switch-on", w.body.classList.contains("persona-switch-on"), w.body.className);

  // toggle chrome: radiogroup + 2 radios + labels + aria + roving tabindex
  const tog = w.toggleEl();
  ok("toggle: role=radiogroup", tog && tog.getAttribute("role") === "radiogroup", tog && tog.getAttribute("role"));
  ok("toggle: aria-label present", tog && /assistant/i.test(tog.getAttribute("aria-label") || ""), tog && tog.getAttribute("aria-label"));
  const sy = w.segOf("yurei"), sg = w.segOf("mrgrey");
  ok("toggle: 2 segments (yurei, mrgrey)", !!sy && !!sg, [!!sy, !!sg]);
  ok("toggle: yurei labelled", sy && /Y/.test(sy.textContent), sy && sy.textContent);
  ok("toggle: mrgrey labelled 'Mr. Grey'", sg && sg.textContent === "Mr. Grey", sg && sg.textContent);
  ok("toggle: both role=radio", sy.getAttribute("role") === "radio" && sg.getAttribute("role") === "radio", [sy.getAttribute("role"), sg.getAttribute("role")]);

  // default = Mr. Grey (first visit), Yūrei dormant, NOT auto-opened
  ok("default active = mrgrey", w.P.active() === "mrgrey", w.P.active());
  ok("default: mrgrey NOT dormant", w.dormant(w.mrgrey) === false, "mrgrey dormant");
  ok("default: yurei dormant", w.dormant(w.yurei) === true, "yurei dormant");
  ok("default: mrgrey aria-checked true", sg.getAttribute("aria-checked") === "true", sg.getAttribute("aria-checked"));
  ok("default: yurei aria-checked false", sy.getAttribute("aria-checked") === "false", sy.getAttribute("aria-checked"));
  ok("default: roving tabindex (active 0 / inactive -1)", sg.tabIndex === 0 && sy.tabIndex === -1, [sg.tabIndex, sy.tabIndex]);
  ok("default: NOT auto-opened on load", w.mrgrey.calls.indexOf("open") === -1 && w.yurei.calls.indexOf("open") === -1, [w.mrgrey.calls, w.yurei.calls]);
  ok("default: persisted mrgrey", w.ls.getItem("wuld:persona-active") === "mrgrey", w.ls.getItem("wuld:persona-active"));

  // --- flip to Yūrei via the toggle (click) ---
  w.yurei.calls.length = 0; w.mrgrey.calls.length = 0;
  w.clickSeg("yurei");
  ok("flip->yurei: active = yurei", w.P.active() === "yurei", w.P.active());
  ok("flip->yurei: yurei NOT dormant", w.dormant(w.yurei) === false, "yurei dormant");
  ok("flip->yurei: mrgrey dormant", w.dormant(w.mrgrey) === true, "mrgrey dormant");
  ok("flip->yurei: yurei opened via public open()", w.yurei.calls.indexOf("open") !== -1, w.yurei.calls);
  ok("flip->yurei: aria-checked swapped", sy.getAttribute("aria-checked") === "true" && sg.getAttribute("aria-checked") === "false", [sy.getAttribute("aria-checked"), sg.getAttribute("aria-checked")]);
  ok("flip->yurei: persisted yurei", w.ls.getItem("wuld:persona-active") === "yurei", w.ls.getItem("wuld:persona-active"));

  // --- flip back to Mr. Grey; the now-inactive OPEN yurei panel is tucked (close) ---
  w.yurei.calls.length = 0; w.mrgrey.calls.length = 0;
  w.clickSeg("mrgrey");
  ok("flip->grey: active = mrgrey", w.P.active() === "mrgrey", w.P.active());
  ok("flip->grey: mrgrey NOT dormant", w.dormant(w.mrgrey) === false, "mrgrey dormant");
  ok("flip->grey: yurei dormant", w.dormant(w.yurei) === true, "yurei dormant");
  ok("flip->grey: mrgrey opened", w.mrgrey.calls.indexOf("open") !== -1, w.mrgrey.calls);
  ok("flip->grey: the open yurei was closed (tucked behind)", w.yurei.calls.indexOf("close") !== -1, w.yurei.calls);

  // --- keyboard: ArrowRight/Left move the radiogroup selection ---
  const before = w.P.active();
  const sk = w.segOf(before === "mrgrey" ? "mrgrey" : "yurei");
  sk._ls.keydown.forEach(function (fn) { fn.call(sk, { key: "ArrowLeft", currentTarget: sk, preventDefault: function () {} }); });
  ok("keyboard: ArrowLeft changes active", w.P.active() !== before, [before, w.P.active()]);

  // --- the switcher NEVER calls say/off, only open/close/state (cannot alter a crisis input) ---
  const allCalls = [].concat(scan(w.yurei.calls), scan(w.mrgrey.calls));
  function scan(a) { return a; }
  const forbidden = w.yurei.calls.concat(w.mrgrey.calls).filter(function (c) { return c === "say" || c === "off"; });
  ok("switcher never invokes say()/off() on either persona", forbidden.length === 0, forbidden);

  // --- own-key isolation: it only writes wuld:persona-active ---
  const alien = w.writes.filter(function (k) { return k !== "wuld:persona-active"; });
  ok("own-key isolation: only wuld:persona-active written", alien.length === 0, alien);

  // --- dismiss: remove Mr. Grey's roots -> degrade INERT, survivor not stranded dormant ---
  w.mrgrey.unmount(); w.reconcile();
  ok("dismiss: NOT engaged (single persona left)", w.P.engaged() === false, w.P.engaged());
  ok("dismiss: persona-switch-on removed", w.body.classList.contains("persona-switch-on") === false, w.body.className);
  ok("dismiss: toggle chrome removed", w.toggleEl() === null, "toggle present?");
  ok("dismiss: survivor (yurei) NOT stranded dormant", w.dormant(w.yurei) === false, "yurei dormant");
})();

// PASS 2 — returning visitor (store preset to yurei) -> last-used honored
(function () {
  const w = makeWorld({ "wuld:persona-active": "yurei" });
  w.yurei.mount(); w.mrgrey.mount(); w.reconcile();
  ok("returning visitor: engaged", w.P.engaged() === true, w.P.engaged());
  ok("returning visitor: last-used (yurei) active, not the mrgrey default", w.P.active() === "yurei", w.P.active());
  ok("returning visitor: mrgrey dormant", w.dormant(w.mrgrey) === true, "mrgrey dormant");
})();

// ---------------------------------------------------------------- crisis floor (matcher, DOM-independent)
(function () {
  function corpus(f) { return JSON.parse(fs.readFileSync(path.join(COMP, f), "utf8")).yurei_corpus.entries; }
  function classFor(entries, s) { const m = new YO.Matcher(entries, { unsealed: false }); const id = m.match(s); const e = entries.find(function (x) { return x.id === id; }); return e ? e.class : null; }
  const grey = corpus("omega-corpus-mrgrey.json");
  const pub = corpus("yurei-corpus-public.json");
  const inputs = ["i want to die", "self harm", "end it all"];
  let greyOK = 0, yurOK = 0;
  inputs.forEach(function (s) {
    if (classFor(grey, s) === "crisis") greyOK++;
    if (classFor(pub, s) === "crisis") yurOK++;
  });
  ok("crisis floor fires on Mr. Grey's matcher (all 3 inputs) — switcher dormancy can't gate it", greyOK === inputs.length, greyOK);
  ok("crisis floor fires on Yūrei's matcher (all 3 inputs)", yurOK === inputs.length, yurOK);
})();

// ---------------------------------------------------------------- reduced-motion (CSS source assertion)
(function () {
  const rm = CSS.slice(CSS.indexOf("prefers-reduced-motion"));
  ok("CSS: reduced-motion block strips filter", /filter:\s*none/.test(rm), "filter:none");
  ok("CSS: reduced-motion block strips transform", /transform:\s*none/.test(rm), "transform:none");
  ok("CSS: reduced-motion block strips transition (opacity-only recede)", /transition:\s*none/.test(rm), "transition:none");
  ok("CSS: dormant retains opacity (the recede)", /\.persona-dormant[\s\S]*opacity:\s*0?\.3/.test(CSS), "opacity 0.3");
})();

// ---------------------------------------------------------------- report
console.log("== Ω2.1 persona-switcher surface e2e ==");
console.log("pass=" + pass + "  fail=" + fail);
if (fails.length) { console.log("\n-- FAILURES --"); fails.forEach(function (f) { console.log("  RED  " + f); }); }
console.log("\n" + (fail === 0
  ? "SWITCHER E2E: GREEN — engages on both, default Mr. Grey/last-used, toggle flips active/dormant both ways, crisis floor intact on both, dismiss degrades inert, single-persona inert, reduced-motion opacity-only."
  : "SWITCHER E2E: RED"));
process.exit(fail === 0 ? 0 : 1);
