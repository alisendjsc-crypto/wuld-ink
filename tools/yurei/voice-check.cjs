#!/usr/bin/env node
/* voice-check.cjs — the authoring-time gate for desk-Yūrei's voice.
   Proves src/components/yurei-voice.js is (1) CSP-clean synth-only (no fetch / eval /
   Blob / AudioWorklet / .wav / external origin), (2) NON-SEMANTIC (text reaches audio
   ONLY through sylCount — a count; no vowel/onset derived from the letters, in any
   style), and (3) that the style set {inner, animalese, whisper} is present, default
   OFF, and set() clamps. Parity-neutral: this does not touch routing. Exit 0 iff green.

   Scans a COMMENT-STRIPPED copy of the source (the header legitimately NAMES the
   forbidden APIs), so a match means the CODE uses them, not the prose.

   Run:  node tools/yurei/voice-check.cjs                                          */
"use strict";
const fs = require("fs"), path = require("path");
const HERE = __dirname, COMP = path.join(HERE, "..", "..", "src", "components");
const SRC_PATH = path.join(COMP, "yurei-voice.js");
const YV = require(SRC_PATH);
const RAW = fs.readFileSync(SRC_PATH, "utf8");
// strip block + line comments so scans see CODE, not the header prose
const CODE = RAW.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

let pass = 0, fail = 0; const fails = [];
function ok(name, cond) { if (cond) pass++; else { fail++; fails.push(name); } }
function absent(name, needle) { ok("code has no " + name, CODE.indexOf(needle) < 0); }
function present(name, needle) { ok("code has " + name, CODE.indexOf(needle) >= 0); }

// ---- 1. CSP-shape: synth-only, no samples / network / worklet / eval ----
absent("fetch(", "fetch(");
absent("eval(", "eval(");
absent("new Blob", "Blob");
absent("AudioWorklet", "AudioWorklet");
absent("importScripts", "importScripts");
absent(".wav", ".wav");
absent("XMLHttpRequest", "XMLHttpRequest");
ok("no http/https/ftp scheme", !/\b(?:https?|ftp):/.test(CODE));
ok("no protocol-relative URL literal", !/["']\/\//.test(CODE));
// the ONLY web-audio entry is a same-page AudioContext (synth)
present("AudioContext", "AudioContext");

// ---- 2. NON-SEMANTIC: text -> audio only via sylCount; vowels/onsets are random ----
present("sylCount", "function sylCount");
absent("vowelOf (letter->vowel)", "vowelOf");
absent("onsetOf (letter->onset)", "onsetOf");
absent("FORMANTS letter-map", "FORMANTS");            // the dictionary's letter-keyed map is gone
present("FORMANT_SET array", "FORMANT_SET");          // random-indexed timbre table
present("random pick", "Math.random");
ok("pick() draws from Math.random", /function pick\([^)]*\)\s*\{[^}]*Math\.random/.test(CODE));
// voiceBuffer is count-based: signature (ac, kind, nSyll) — no text reaches it
ok("voiceBuffer is count-based (ac,kind,nSyll)", /function voiceBuffer\(\s*ac\s*,\s*kind\s*,\s*nSyll\s*\)/.test(CODE));

// sylCount is deterministic and count-only (2..14), independent of letter identity
ok("sylCount deterministic", YV.sylCount("the desk files it") === YV.sylCount("the desk files it"));
ok("sylCount counts vowel groups", YV.sylCount("a e i o u") === 5);
ok("sylCount ignores non-letters", YV.sylCount("a1e2i3") === 3);
ok("sylCount empty -> min 2", YV.sylCount("") === 2 && YV.sylCount("brr") === 2);
ok("sylCount clamps to 14", YV.sylCount(Array(40).join("a ")) === 14);
ok("sylCount tolerant of non-string", YV.sylCount(null) === 2 && YV.sylCount(undefined) === 2);
// two DIFFERENT texts with the SAME vowel-group count are audibly indistinguishable by design:
// the only derived quantity is the count, which is equal here (privacy invariant)
ok("equal-count texts share the only text-derived value", YV.sylCount("cat sat") === YV.sylCount("dog log"));

// ---- 3. style set + defaults + clamps + node-safety ----
ok("STYLES = inner/animalese/whisper", Array.isArray(YV.STYLES) && YV.STYLES.length === 3 &&
  YV.STYLES.indexOf("inner") >= 0 && YV.STYLES.indexOf("animalese") >= 0 && YV.STYLES.indexOf("whisper") >= 0);
ok("default OFF", YV.get().on === false);
ok("default style = inner", YV.get().style === "inner");
ok("set clamps pitch high -> 2", YV.set({ pitch: 5 }).pitch === 2);
ok("set clamps pitch low -> 0.5", YV.set({ pitch: -3 }).pitch === 0.5);
YV.set({ pitch: 1, rate: 1 });                                    // restore
ok("set rejects bogus style", (function () { var s0 = YV.get().style; var r = YV.set({ style: "megaphone" }); return r.style === s0; })());
ok("set ignores non-boolean on", (function () { YV.set({ on: false }); var r = YV.set({ on: "yes" }); return r.on === false; })());
ok("speak is a function", typeof YV.speak === "function");
ok("speak is silent in node (no window)", YV.speak("hello there") === 0);   // returns 0 outside a browser
ok("ready() false in node", YV.ready() === false);

console.log("== yurei voice gate ==");
console.log(`csp + non-semantic + styles: ${pass}/${pass + fail}`);
if (fails.length) { console.log("-- FAILURES --"); fails.forEach((x) => console.log("  " + x)); }
console.log(fail === 0
  ? "VOICE: GREEN — synth-only, CSP-clean; non-semantic (count-only, random vowels); styles present; default off."
  : "VOICE: RED");
process.exit(fail === 0 ? 0 : 1);
