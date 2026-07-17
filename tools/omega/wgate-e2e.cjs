"use strict";
/* wgate-e2e.cjs (K246) — canonical page-curtain regression, generalized from the
 * K233 successor-gate-e2e pattern (extract inline scripts by marker, eval against a
 * hand-rolled DOM/localStorage shim; zero deps). Runs against ANY wgate-curtained
 * page and auto-derives the expected key / open-class / passphrase / gate-id.
 *
 *   node tools/omega/wgate-e2e.cjs src/successor/index.html
 *
 * NB: keep the wgate marker strings out of this file's own /* block comments *​/. */
const fs = require("fs");
const PAGE = process.argv[2] || "src/successor/index.html";
const html = fs.readFileSync(PAGE, "utf8");

let pass = 0, fail = 0;
function ok(msg, cond) { if (cond) { pass++; } else { fail++; console.log("  FAIL: " + msg); } }

function extract(marker) {
  const m = html.match(new RegExp("<script>\\s*/\\*" + marker + "\\*/([\\s\\S]*?)</script>"));
  if (!m) throw new Error("missing inline script: " + marker);
  return m[1];
}
const prepaintSrc = extract("wgate-prepaint");
const logicSrc = extract("wgate-logic");

// derive expected tokens from the page bytes
const KEY = (prepaintSrc.match(/getItem\('([^']+)'\)/) || [])[1];
const OPEN = (prepaintSrc.match(/classList\.add\('([^']+)'\)/) || [])[1];
const PASS = (logicSrc.match(/var PASS="([^"]*)"/) || [])[1];
const GID = (logicSrc.match(/getElementById\("([^"]+)"\)/) || [])[1];

function makeEnv(preOpen, initLS) {
  const store = Object.assign({}, initLS || {});
  const ls = {
    getItem: k => Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
    _keys: () => Object.keys(store),
  };
  const cls = new Set(preOpen ? [OPEN] : []);
  const input = { value: "", _focus: 0, focus() { this._focus++; } };
  const err = { hidden: true };
  const handlers = {};
  const form = { addEventListener: (t, fn) => { handlers[t] = fn; }, _fire: (t, ev) => { if (handlers[t]) handlers[t](ev || { preventDefault() {} }); }, _wired: () => Object.keys(handlers).length };
  const gate = { querySelector: sel => sel === "form" ? form : sel === ".wgate-input" ? input : sel === ".wgate-err" ? err : null };
  const de = { classList: { add: c => cls.add(c), remove: c => cls.delete(c), contains: c => cls.has(c) } };
  const document = { documentElement: de, getElementById: id => id === GID ? gate : null };
  return { document, ls, input, err, form, cls };
}
const runPrepaint = (E) => new Function("document", "localStorage", prepaintSrc)(E.document, E.ls);
const runLogic = (E) => new Function("document", "localStorage", logicSrc)(E.document, E.ls);

console.log("wgate-e2e :: " + PAGE + "  (key=" + KEY + " open=" + OPEN + " gid=" + GID + ")");

// derivation sanity
ok("storage key derived", !!KEY);
ok("open-class derived", !!OPEN);
ok("passphrase present + nonempty", typeof PASS === "string" && PASS.length > 0);
ok("gate id derived", !!GID);

// prepaint: fresh visit stays locked
{ const E = makeEnv(false, {}); runPrepaint(E); ok("fresh visit: no open class (locked)", !E.cls.has(OPEN)); }
// prepaint: remembered unlock opens before paint
{ const E = makeEnv(false, { [KEY]: "1" }); runPrepaint(E); ok("remembered unlock: opens pre-paint (no FOUC)", E.cls.has(OPEN)); }

// logic when locked: wires submit + focuses input
{ const E = makeEnv(false, {}); runLogic(E); ok("locked: submit handler wired", E.form._wired() === 1); ok("locked: input focused", E.input._focus > 0); }

// correct passphrase unlocks + persists
{ const E = makeEnv(false, {}); runLogic(E); E.input.value = PASS; E.form._fire("submit");
  ok("correct pass: storage key set to '1'", E.ls.getItem(KEY) === "1");
  ok("correct pass: open class added", E.cls.has(OPEN)); }

// normalization tolerance (space / case / hyphen->space)
{ const E = makeEnv(false, {}); runLogic(E); E.input.value = " " + PASS.toUpperCase().replace(/-/g, " ") + " "; E.form._fire("submit");
  ok("normalized variant unlocks (space/case/hyphen)", E.cls.has(OPEN) && E.ls.getItem(KEY) === "1"); }

// wrong passphrase: no write, no open, error shown, input cleared
{ const E = makeEnv(false, {}); runLogic(E); E.input.value = "definitely-not-the-pass"; E.form._fire("submit");
  ok("wrong pass: storage untouched", E.ls.getItem(KEY) === null);
  ok("wrong pass: stays locked", !E.cls.has(OPEN));
  ok("wrong pass: error revealed", E.err.hidden === false);
  ok("wrong pass: input cleared", E.input.value === ""); }

// already-open short-circuit
{ const E = makeEnv(true, { [KEY]: "1" }); runLogic(E);
  ok("already-open: no submit handler wired", E.form._wired() === 0);
  ok("already-open: input not focused", E.input._focus === 0); }

// exactly one key, and it's the unlock key
{ const E = makeEnv(false, {}); runLogic(E); E.input.value = PASS; E.form._fire("submit");
  ok("exactly one storage key written", E.ls._keys().length === 1);
  ok("the one key is " + KEY, E.ls._keys()[0] === KEY); }

// no cross-key contamination
{ const bad = /wuld:persona-active|agentfx|wrongHour|ambient|successor:stage|successor:transcript/;
  ok("scripts reference no persona/component keys", !bad.test(prepaintSrc) && !bad.test(logicSrc)); }
{ const keys = (logicSrc.match(/wuld:[a-z0-9:._-]+/g) || []).concat(prepaintSrc.match(/wuld:[a-z0-9:._-]+/g) || []);
  ok("every wuld: key in the scripts is the unlock key", keys.length > 0 && keys.every(k => k === KEY)); }

// structural: overlay outside <main>, no headings inside, no network
ok("overlay lives OUTSIDE <main> (before it)", html.indexOf('id="' + GID + '"') >= 0 && html.indexOf('id="' + GID + '"') < html.indexOf("<main"));
{ const gi = html.indexOf('id="' + GID + '"'); const ge = html.indexOf("wgate:body:end", gi); const block = html.slice(gi, ge > gi ? ge : html.length);
  ok("no h1/h2/h3 inside the gate block", !/<h[123]\b/i.test(block)); }
ok("no network calls in either gate script", !/fetch\(|XMLHttpRequest|import\(/.test(prepaintSrc + logicSrc));

console.log((fail ? "FAIL " : "PASS ") + pass + "/" + (pass + fail) + "  (" + PAGE + ")");
process.exit(fail ? 1 : 0);
