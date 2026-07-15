#!/usr/bin/env node
/* gaplog-visitor-e2e.cjs — Build 1.5c: the PUBLIC gap-log toggle proof (K234).
   ===========================================================================
   Drives the REAL src/components/yurei-assistant.js inside a tiny zero-dep DOM /
   localStorage / sessionStorage / fetch shim (no jsdom — matches the repo's other
   .cjs gates), over the REAL yurei-oracle.js engine + the REAL corpora. The desk
   boots ASYNC (fetch -> Promise.all -> buildUI), so this harness is async with a
   settle() tick. Proves the 1.5c privacy contract:
     * LAYERED gate — a miss POSTs ONLY when server-open AND visitor-on AND
       consented; every gate off suppresses the POST (server / toggle / consent)
     * zero footprint by default — the toggle bar is hidden until the server lane
       is open; the notice is shown ONLY on visitor-activation (never on open)
     * scrub — content is PII-scrubbed; share-context (opt-in) is an array of
       scrubbed lines that DOES include answered turns, each through the same scrub
     * highlight is styling-only (persists; never gates logging)
     * own-key isolation — only wuld:yurei-gaplog-* localStorage keys are written
     * the matcher is untouched — exactly one respond() per submit
   Not a substitute for yurei-parity (the matcher gate); this proves the
   consent/logging LAYER, which touches no matcher/corpus byte. */
"use strict";
const fs = require("fs");
const path = require("path");
const COMP = path.join(__dirname, "..", "..", "src", "components");
const SRC = fs.readFileSync(path.join(COMP, "yurei-assistant.js"), "utf8");
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, "");        // fences test executable code, not header prose
const ORACLE = require(path.join(COMP, "yurei-oracle.js")); // the REAL engine
const PUB = require(path.join(COMP, "yurei-corpus-public.json"));
const ORA = require(path.join(COMP, "yurei-corpus-oracle.json"));
const MANIFEST = { assets: [
  { role: "canonical-p0", file: "still.png", kind: "still" },
  { role: "idle", file: "idle.webm", kind: "loop", loop: true },
  { role: "speak", file: "speak.webm", kind: "clip" }
], animation_fallback: { speak: "idle", deflect: "idle", appear: "idle", dismiss: "idle", long_idle: "idle", return_ack: "idle", wrong_hour: "idle", idle_breeze: "idle" } };

let pass = 0, fail = 0; const fails = [];
function ok(name, cond, got) { if (cond) pass++; else { fail++; fails.push(name + "  (got: " + JSON.stringify(got) + ")"); } }
function settle() { return new Promise(function (r) { setImmediate(r); }); }

// ---------------------------------------------------------------- DOM shim
function Elem(tag) {
  this.tagName = tag; this.children = []; this.parentNode = null;
  this._cls = {}; this._attrs = {}; this.style = {};
  this.textContent = ""; this.type = ""; this.value = ""; this.id = "";
  this.hidden = false; this.src = ""; this.href = ""; this.disabled = false;
  this.scrollTop = 0; this.scrollHeight = 0; this.muted = false; this.loop = false;
  this.onended = null; this.onload = null; this.onerror = null; this.offsetHeight = 0;
  this._ls = {};
  const el = this;
  this.classList = {
    add: function () { for (let i = 0; i < arguments.length; i++) el._cls[arguments[i]] = 1; },
    remove: function () { for (let i = 0; i < arguments.length; i++) delete el._cls[arguments[i]]; },
    toggle: function (c, on) { if (on === undefined) on = !el._cls[c]; if (on) el._cls[c] = 1; else delete el._cls[c]; return !!on; },
    contains: function (c) { return !!el._cls[c]; }
  };
}
Elem.prototype.setAttribute = function (k, v) { this._attrs[k] = String(v); if (k === "hidden") this.hidden = true; };  // attr hidden="" reflects to .hidden (browser parity)
Elem.prototype.getAttribute = function (k) { return (k in this._attrs) ? this._attrs[k] : null; };
Elem.prototype.appendChild = function (c) { c.parentNode = this; this.children.push(c); return c; };
Elem.prototype.removeChild = function (c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); c.parentNode = null; return c; };
Elem.prototype.addEventListener = function (t, fn) { (this._ls[t] = this._ls[t] || []).push(fn); };
Elem.prototype.fire = function (t, ev) { const self = this; (this._ls[t] || []).slice().forEach(function (fn) { fn.call(self, ev || {}); }); };
Elem.prototype.click = function () { this.fire("click"); };
Elem.prototype.focus = function () {};
Elem.prototype.play = function () { return undefined; };
Elem.prototype.pause = function () {};
Elem.prototype.getBoundingClientRect = function () { return { height: 0, bottom: 0, top: 0, left: 0, right: 0, width: 0 }; };
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
function walk(node, pred) { if (pred(node)) return node; for (let i = 0; i < node.children.length; i++) { const r = walk(node.children[i], pred); if (r) return r; } return null; }

async function makeWorld(opts) {
  opts = opts || {};
  const serverOpen = !!opts.serverOpen;
  const head = new Elem("head"), body = new Elem("body");
  const doc = {
    readyState: "complete", head: head, body: body,
    createElement: function (t) { return new Elem(t); },
    getElementById: function (id) { return walk(head, function (c) { return c.id === id; }) || walk(body, function (c) { return c.id === id; }); },
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
  const ls = { getItem: function (k) { return (k in store) ? store[k] : null; }, setItem: function (k, v) { store[k] = String(v); writes.push(k); }, removeItem: function (k) { delete store[k]; } };
  const sess = {}; const ss = { getItem: function (k) { return (k in sess) ? sess[k] : null; }, setItem: function (k, v) { sess[k] = String(v); }, removeItem: function (k) { delete sess[k]; } };
  const posts = [];
  const win = {
    innerHeight: 800, __whHour: 12,
    setTimeout: function (fn) { if (fn) fn(); return 0; },  // run now (test) + return FALSY so the module's timer-flag resets after a synchronous flush
    clearTimeout: function () {}, clearInterval: function () {},
    setInterval: function () { return 1; },
    requestAnimationFrame: function (fn) { if (fn) fn(); return 1; },
    matchMedia: function (q) { return { matches: !!opts.reducedMotion, media: q, addListener: function () {}, addEventListener: function () {} }; },
    addEventListener: function () {},
    YureiOracle: ORACLE
  };
  win.window = win;
  global.window = win; global.document = doc; global.localStorage = ls; global.sessionStorage = ss;
  global.getComputedStyle = function () { return { display: "block", visibility: "visible", height: 0 }; };
  global.fetch = function (url, o) {
    url = String(url); o = o || {};
    if (url.indexOf("/api/gaplog") === 0) {
      if (String(o.method || "GET").toUpperCase() === "POST") {
        let b = null; try { b = JSON.parse(o.body); } catch (e) {}
        posts.push(b);
        return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve({ ok: true }); } });
      }
      return Promise.resolve({ ok: true, status: 200, json: function () { return Promise.resolve({ open: serverOpen }); } });
    }
    let data = null;
    if (url.indexOf("yurei-corpus-public") >= 0) data = PUB;
    else if (url.indexOf("yurei-corpus-oracle") >= 0) data = ORA;
    else if (url.indexOf("manifest") >= 0) data = MANIFEST;
    return Promise.resolve({ ok: data != null, status: data != null ? 200 : 404, json: function () { return Promise.resolve(data); } });
  };
  eval(SRC);                       // module IIFE boots -> start() -> boot() (async fetch chain)
  await settle(); await settle();  // flush the boot Promise chain (Promise.all -> buildUI -> gaplogFetchStatus)
  return { win, doc, head, body, store, writes, posts, A: win.yurei && win.yurei.assistant };
}

const MISS = "qwzxpv fjordbank glyph mxyzptlk zzt";   // gibberish -> guaranteed deflection (miss)
const MISS2 = "wobfleck grimsby zorptang vlex";       // a DISTINCT gibberish miss (priorCount 0)

(async function () {
  // ---- PASS A: server-closed (default) -> zero footprint, no POST ever
  {
    const w = await makeWorld({ serverOpen: false });
    const bar = byClass(w.body, "yasst-gaplogbar")[0];
    ok("closed: toggle bar hidden (zero footprint)", bar && bar.style.display === "none", bar && bar.style.display);
    ok("closed: base consent hidden", byClass(w.body, "yasst-consent")[0].hidden === true, null);
    ok("closed: pii warning hidden", byClass(w.body, "yasst-piiwarn")[0].style.display === "none", null);
    w.A.say(MISS);
    ok("closed: NO POST (server backstop)", w.posts.length === 0, w.posts.length);
  }

  // ---- PASS B: server-open, visitor toggle OFF (default) -> bar shown grey, no POST
  {
    const w = await makeWorld({ serverOpen: true });
    const bar = byClass(w.body, "yasst-gaplogbar")[0];
    ok("open: toggle bar visible", bar && bar.style.display === "", bar && bar.style.display);
    ok("open: chip reads off", byClass(w.body, "yasst-gaplog-chip")[0].textContent === "off", byClass(w.body, "yasst-gaplog-chip")[0].textContent);
    ok("open: no consent auto-shown on boot", byClass(w.body, "yasst-consent")[0].hidden === true, null);
    w.A.say(MISS);
    ok("open+off: NO POST (visitor toggle off)", w.posts.length === 0, w.posts.length);
  }

  // ---- PASS C: server-open + visitor-on + consented -> POST scrubbed, NO context
  {
    const w = await makeWorld({ serverOpen: true, store: { "wuld:yurei-gaplog-on": "1", "wuld:yurei-gaplog-consent": "1" } });
    ok("live: chip reads logging", byClass(w.body, "yasst-gaplog-chip")[0].textContent === "logging", byClass(w.body, "yasst-gaplog-chip")[0].textContent);
    ok("live: pii warning shown", byClass(w.body, "yasst-piiwarn")[0].style.display === "", null);
    w.A.say("my email is secret@example.com " + MISS);
    ok("live: exactly one POST", w.posts.length === 1, w.posts.length);
    const it = w.posts.length ? w.posts[0].items[0] : {};
    ok("live: lane=miss", it.lane === "miss", it.lane);
    ok("live: content PII-scrubbed ([email], raw removed)", /\[email\]/.test(it.content_scrubbed) && !/secret@example/.test(it.content_scrubbed), it.content_scrubbed);
    ok("live: NO context field (share-context off)", !("context_scrubbed" in it), Object.keys(it));
  }

  // ---- PASS D: visitor-on but NOT consented -> armed, no POST
  {
    const w = await makeWorld({ serverOpen: true, store: { "wuld:yurei-gaplog-on": "1" } });
    ok("armed: chip reads armed", byClass(w.body, "yasst-gaplog-chip")[0].textContent === "armed", byClass(w.body, "yasst-gaplog-chip")[0].textContent);
    w.A.say(MISS);
    ok("armed: NO POST (base consent not granted)", w.posts.length === 0, w.posts.length);
  }

  // ---- PASS E: share-context opted-in -> POST WITH scrubbed context incl. answered turns
  {
    const w = await makeWorld({ serverOpen: true, store: { "wuld:yurei-gaplog-on": "1", "wuld:yurei-gaplog-consent": "1", "wuld:yurei-gaplog-context": "1", "wuld:yurei-gaplog-context-consent": "1" } });
    w.A.say("hello there");                                       // an ANSWERED turn (greet) -> no POST
    ok("ctx: answered turn does not POST", w.posts.length === 0, w.posts.length);
    w.A.say("my phone is 555-123-4567 " + MISS);                  // a miss with PII
    ok("ctx: exactly one POST (only the miss logs)", w.posts.length === 1, w.posts.length);
    const it = w.posts.length ? w.posts[0].items[0] : {};
    ok("ctx: context_scrubbed present (array)", Array.isArray(it.context_scrubbed) && it.context_scrubbed.length > 0, it.context_scrubbed);
    ok("ctx: context INCLUDES the answered turn", (it.context_scrubbed || []).some(function (l) { return /hello there/.test(l); }), it.context_scrubbed);
    ok("ctx: context lines PII-scrubbed ([number], raw removed)", (it.context_scrubbed || []).some(function (l) { return /\[number\]/.test(l); }) && !(it.context_scrubbed || []).some(function (l) { return /555-123/.test(l); }), it.context_scrubbed);
    ok("ctx: context carries both sides (you:/desk:)", (it.context_scrubbed || []).some(function (l) { return /^you:/.test(l); }) && (it.context_scrubbed || []).some(function (l) { return /^desk:/.test(l); }), it.context_scrubbed);
  }

  // ---- PASS F: the notice is shown ONLY on visitor-activation (never on open)
  {
    const w = await makeWorld({ serverOpen: true });                 // off, not consented
    w.A.open();
    ok("activate: base consent hidden before toggling", byClass(w.body, "yasst-consent")[0].hidden === true, null);
    byClass(w.body, "yasst-gl-toggle")[0].click();                   // turn logging ON
    ok("activate: gaplog-on persisted", w.writes.indexOf("wuld:yurei-gaplog-on") >= 0, w.writes);
    ok("activate: base consent shown after toggling on", byClass(w.body, "yasst-consent")[0].hidden === false, null);
    ok("activate: still ARMED before consent (no POST path)", byClass(w.body, "yasst-gaplog-chip")[0].textContent === "armed", null);
    byClass(w.body, "yasst-consent-btn")[0].click();                 // grant Tier-1 consent
    ok("activate: consented -> logging live (green)", byClass(w.body, "yasst-gaplog-chip")[0].textContent === "logging", null);
    // toggling OFF hides the notice + drops to grey
    byClass(w.body, "yasst-gl-toggle")[0].click();
    ok("activate: toggling off -> chip off", byClass(w.body, "yasst-gaplog-chip")[0].textContent === "off", null);
  }

  // ---- PASS G: share-context has its OWN heavier (Tier-2) consent, off by default
  {
    const w = await makeWorld({ serverOpen: true, store: { "wuld:yurei-gaplog-on": "1", "wuld:yurei-gaplog-consent": "1" } });
    ok("ctx-consent: ctx toggle shown once logging is on", byClass(w.body, "yasst-gl-ctxrow")[0].style.display === "", null);
    ok("ctx-consent: Tier-2 notice hidden by default", byClass(w.body, "yasst-consent-ctx")[0].hidden === true, null);
    byClass(w.body, "yasst-gl-ctx")[0].click();                      // turn share-context ON
    ok("ctx-consent: Tier-2 notice shown on activation", byClass(w.body, "yasst-consent-ctx")[0].hidden === false, null);
    ok("ctx-consent: context opt-in persisted", w.writes.indexOf("wuld:yurei-gaplog-context") >= 0, w.writes);
    // context NOT sent until the Tier-2 consent is granted
    w.A.say(MISS);
    let it = w.posts[0].items[0];
    ok("ctx-consent: no context before Tier-2 consent", !("context_scrubbed" in it), Object.keys(it));
    byClass(w.body, "yasst-consent-btn")[1].click();                 // grant Tier-2 (the ctx consent btn is the 2nd)
    w.A.say(MISS2);
    it = w.posts[1].items[0];
    ok("ctx-consent: context sent after Tier-2 consent", Array.isArray(it.context_scrubbed), it.context_scrubbed);
  }

  // ---- PASS H: highlight is styling-only (persists; never gates logging)
  {
    const w = await makeWorld({ serverOpen: true, store: { "wuld:yurei-gaplog-on": "1", "wuld:yurei-gaplog-consent": "1" } });
    const bar = byClass(w.body, "yasst-gaplogbar")[0];
    ok("hl: default highlight on (bar has hlon)", !!bar._cls["yasst-gl-hlon"], Object.keys(bar._cls));
    byClass(w.body, "yasst-gl-hl")[0].click();                       // highlight off
    ok("hl: toggling removes hlon", !bar._cls["yasst-gl-hlon"], Object.keys(bar._cls));
    ok("hl: preference persisted", w.writes.indexOf("wuld:yurei-gaplog-hl") >= 0, w.writes);
    w.A.say(MISS);
    ok("hl: styling-only — POST still fires with highlight off", w.posts.length === 1, w.posts.length);
  }

  // ---- PASS I: own-key isolation + static source fences
  {
    const w = await makeWorld({ serverOpen: true });
    w.A.open();
    byClass(w.body, "yasst-gl-toggle")[0].click();
    byClass(w.body, "yasst-consent-btn")[0].click();
    byClass(w.body, "yasst-gl-ctx")[0].click();
    byClass(w.body, "yasst-consent-btn")[1].click();
    byClass(w.body, "yasst-gl-hl")[0].click();
    w.A.say(MISS);
    const alien = w.writes.filter(function (k) { return k.indexOf("wuld:yurei-gaplog-") !== 0; });
    ok("isolation: only wuld:yurei-gaplog-* localStorage keys written", alien.length === 0, alien);
    ok("fence: gaplogScrub present (byte-identity proven separately vs Worker)", /function gaplogScrub/.test(CODE), null);
    ok("fence: no POST unless gaplogLive()", /if \(gaplogLive\(\)\) \{/.test(CODE), null);
    ok("fence: layered gate = server AND visitor-on AND consented", /gaplogOpen && gaplogOn\(\) && gaplogConsented\(\)/.test(CODE), null);
    ok("fence: context only when gaplogCtxLive()", /gaplogCtxLive\(\)/.test(CODE) && /gaplogCtxOn\(\) && gaplogCtxConsented\(\)/.test(CODE), null);
    ok("fence: matcher untouched — exactly one respond() per submit", (CODE.match(/matcher\.respond\(/g) || []).length === 1, (CODE.match(/matcher\.respond\(/g) || []).length);
    ok("fence: every store is persona-keyed (wuld:yurei-gaplog-*)", (CODE.match(/wuld:yurei-gaplog-/g) || []).length >= 5, (CODE.match(/wuld:yurei-gaplog-/g) || []).length);
  }

  console.log("gaplog-visitor-e2e: " + pass + "/" + (pass + fail) + " passed");
  if (fail) { console.log("FAILURES:"); fails.forEach(function (f) { console.log("  x " + f); }); process.exit(1); }
  process.exit(0);
})();
