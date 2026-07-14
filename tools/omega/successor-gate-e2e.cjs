#!/usr/bin/env node
// successor-gate-e2e.cjs (K233) -- verifies the soft dormancy curtain on /successor/.
// Zero-dep: extracts the two inline gate scripts (the sgate-prepaint + sgate-logic
// marker blocks) from the page HTML, evals each against a tiny DOM/localStorage shim,
// and asserts: locked-by-default, correct-passphrase unlock (+ space/hyphen/case
// tolerance), wrong-passphrase stays locked, already-unlocked pre-paint short-circuit,
// own-key isolation (only wuld:successor:unlocked), and the page-level fences (gate
// outside <main>, no headings in the gate, single localStorage key). No network, no
// persona/matcher bytes touched.
"use strict";
const fs = require("fs");
const path = require("path");

const PAGE = process.argv[2] || path.join("src", "successor", "index.html");
const html = fs.readFileSync(PAGE, "utf8");

let pass = 0, fail = 0;
function ok(name, cond) { if (cond) { pass++; console.log("  ok   " + name); } else { fail++; console.log("  FAIL " + name); } }

function extract(marker) {
  const m = html.match(new RegExp("<script>\\s*/\\*" + marker + "\\*/([\\s\\S]*?)</script>"));
  if (!m) throw new Error("missing inline script: " + marker);
  return m[1];
}
const prepaintSrc = extract("sgate-prepaint");
const logicSrc = extract("sgate-logic");

function makeLS(init) {
  const m = Object.assign({}, init || {});
  return {
    _m: m,
    getItem: k => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v); },
    removeItem: k => { delete m[k]; },
    keys: () => Object.keys(m)
  };
}
function makeDoc(preOpen) {
  const cls = {};
  if (preOpen) cls["sgate-open"] = 1;
  const classList = { add: c => { cls[c] = 1; }, remove: c => { delete cls[c]; }, contains: c => !!cls[c] };
  const input = { value: "", focused: 0, focus() { this.focused++; } };
  const err = { hidden: true };
  const handlers = {};
  const form = { addEventListener: (t, fn) => { handlers[t] = fn; }, _fire: (t, ev) => { if (handlers[t]) handlers[t](ev); }, _wired: () => !!handlers.submit };
  const gate = { querySelector: sel => sel === "form" ? form : sel === ".sgate-input" ? input : sel === ".sgate-err" ? err : null };
  const doc = { documentElement: { classList }, getElementById: id => id === "successor-gate" ? gate : null };
  return { doc, form, input, err, classList };
}
const runPrepaint = (doc, ls) => new Function("document", "localStorage", prepaintSrc)(doc, ls);
const runLogic    = (doc, ls) => new Function("document", "localStorage", logicSrc)(doc, ls);
const submitEv = () => ({ preventDefault() { this._pd = 1; } });

console.log("successor-gate-e2e :: " + PAGE);

// 1) prepaint: fresh -> NOT open
{ const d = makeDoc(false), ls = makeLS(); runPrepaint(d.doc, ls); ok("prepaint fresh -> locked (no sgate-open)", !d.classList.contains("sgate-open")); }

// 2) prepaint: already-unlocked in storage -> open before paint (no FOUC)
{ const d = makeDoc(false), ls = makeLS({ "wuld:successor:unlocked": "1" }); runPrepaint(d.doc, ls); ok("prepaint remembers unlock -> sgate-open", d.classList.contains("sgate-open")); }

// 3) logic: locked by default wires the submit handler + focuses input
{ const d = makeDoc(false), ls = makeLS(); runLogic(d.doc, ls); ok("logic wires submit handler when locked", d.form._wired()); ok("logic focuses input when locked", d.input.focused === 1); }

// 4) correct passphrase -> unlock (localStorage + sgate-open)
{ const d = makeDoc(false), ls = makeLS(); runLogic(d.doc, ls); d.input.value = "ne-hoc-fiat"; d.form._fire("submit", submitEv());
  ok("correct passphrase sets storage", ls.getItem("wuld:successor:unlocked") === "1");
  ok("correct passphrase opens gate", d.classList.contains("sgate-open")); }

// 5) tolerance: spaces + caps also unlock
{ const d = makeDoc(false), ls = makeLS(); runLogic(d.doc, ls); d.input.value = "Ne Hoc Fiat"; d.form._fire("submit", submitEv());
  ok("space+caps passphrase unlocks (normalized)", d.classList.contains("sgate-open") && ls.getItem("wuld:successor:unlocked") === "1"); }

// 6) wrong passphrase -> stays locked, error shown, input cleared
{ const d = makeDoc(false), ls = makeLS(); runLogic(d.doc, ls); d.input.value = "nope"; d.form._fire("submit", submitEv());
  ok("wrong passphrase does NOT set storage", ls.getItem("wuld:successor:unlocked") === null);
  ok("wrong passphrase does NOT open gate", !d.classList.contains("sgate-open"));
  ok("wrong passphrase reveals error", d.err.hidden === false);
  ok("wrong passphrase clears input", d.input.value === ""); }

// 7) already-unlocked -> logic short-circuits (no handler wired)
{ const d = makeDoc(true), ls = makeLS({ "wuld:successor:unlocked": "1" }); runLogic(d.doc, ls); ok("already-unlocked short-circuits (no handler)", !d.form._wired()); }

// 8) own-key isolation: unlock writes EXACTLY one key, the successor key
{ const d = makeDoc(false), ls = makeLS(); runLogic(d.doc, ls); d.input.value = "ne-hoc-fiat"; d.form._fire("submit", submitEv());
  const ks = ls.keys();
  ok("writes exactly one localStorage key", ks.length === 1);
  ok("that key is wuld:successor:unlocked", ks[0] === "wuld:successor:unlocked");
  ok("never touches a persona/component key", !ks.some(k => k === "wuld:persona-active" || /agentfx|wrongHour|ambient|successor:stage|successor:transcript/.test(k))); }

// 9) page fences
{ ok("gate markup lives OUTSIDE <main> (before it)", html.indexOf('id="successor-gate"') < html.indexOf("<main"));
  const gateBlock = html.slice(html.indexOf('id="successor-gate"'), html.indexOf("</div>\n  <script>/*sgate-logic*/"));
  ok("no heading (h1/h2/h3) inside the gate", !/<h[123]\b/i.test(gateBlock));
  ok("logic references only the successor unlock key", (logicSrc.match(/wuld:[a-z:.-]+/g) || []).every(k => k === "wuld:successor:unlocked"));
  ok("no network in gate scripts", !/fetch\(|XMLHttpRequest|import\(/.test(prepaintSrc + logicSrc)); }

console.log("\n" + (fail ? "FAIL " : "PASS ") + pass + "/" + (pass + fail) + (fail ? " (" + fail + " failed)" : ""));
process.exit(fail ? 1 : 0);
