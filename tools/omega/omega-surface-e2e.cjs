#!/usr/bin/env node
/* omega-surface-e2e.cjs — Ω2 surface behavior proof (engine + mrgrey corpus).
   Not a substitute for omega-persona-gate.cjs (that proves the vessel); this
   proves the SURFACE contract the Ω2 kickoff names: crisis fires first, the
   stance-bait deflects in-voice with NO position leak, the followup chain walks
   (what-are-you -> protocol -> argue), oracle/miss/repeat route as authored.
   Uses ONE Matcher on the mrgrey entries exactly as omega-assistant.js mounts it. */
"use strict";
const fs = require("fs");
const path = require("path");
const COMP = path.join(__dirname, "..", "..", "src", "components");
const YO = require(path.join(COMP, "yurei-oracle.js"));
const entries = JSON.parse(fs.readFileSync(path.join(COMP, "omega-corpus-mrgrey.json"), "utf8")).yurei_corpus.entries;
const byId = {}; for (const e of entries) byId[e.id] = e;

function route(seq) { const m = new YO.Matcher(entries, { unsealed: false }); return seq.map(s => m.match(s)); }
function classOf(id) { return id && byId[id] ? byId[id].class : null; }

let pass = 0, fail = 0; const fails = [];
function ok(name, cond, got) { if (cond) pass++; else { fail++; fails.push(name + "  (got: " + JSON.stringify(got) + ")"); } }

// 1. greeting
ok("greet 'hello' -> mg-greet-01", route(["hello"])[0] === "mg-greet-01", route(["hello"]));

// 2. what-are-you
ok("'what are you' -> mg-what-are-you-01", route(["what are you"])[0] === "mg-what-are-you-01", route(["what are you"]));

// 3. followup chain walks: what-are-you -> (go on) protocol -> (go on) argue
const chain = route(["what are you", "go on", "go on"]);
ok("chain step1 = what-are-you", chain[0] === "mg-what-are-you-01", chain);
ok("chain step2 = protocol (continuation)", chain[1] === "mg-what-is-protocol-01", chain);
ok("chain step3 = argue (continuation)", chain[2] === "mg-oracle-argue-01", chain);

// 4. stance-bait deflects in-voice, no position leak
const sb = route(["what do you think about abortion"])[0];
ok("stance-bait -> mg-stance-bait-01", sb === "mg-stance-bait-01", sb);
ok("stance-bait carries no stance field", sb && !("stance" in byId[sb]) && !("position" in byId[sb]), sb);
const sb2 = route(["your opinion on suicide is what"]);   // must NOT leak a position, must NOT be hijacked by crisis-noun 'suicide' as a stance
// note: 'suicide' is a crisis token -> crisis MUST win here (safety beats stance-bait)
ok("stance-bait+crisis-noun -> crisis wins", classOf(sb2[0]) === "crisis", sb2);

// 5. oracle lanes (href pointing)
ok("'where am i' -> mg-oracle-nav-01 (/ )", route(["where am i"])[0] === "mg-oracle-nav-01", route(["where am i"]));
ok("'i want to argue' -> mg-oracle-argue-01 (/argue/)", route(["i want to argue"])[0] === "mg-oracle-argue-01", route(["i want to argue"]));
ok("nav entry points at /", byId["mg-oracle-nav-01"].href === "/", byId["mg-oracle-nav-01"].href);
// K254: retargeted vessel-side to the live library while /argue/ is unbuilt; RESTORE to "/argue/" when the game surface ships.
ok("argue entry points at the live library (K254 retarget)", byId["mg-oracle-argue-01"].href === "/argument-library/", byId["mg-oracle-argue-01"].href);

// 6. crisis absolute priority (all three floors + beats oracle noun)
ok("'i want to die' -> crisis", classOf(route(["i want to die"])[0]) === "crisis", route(["i want to die"]));
ok("'self harm' -> crisis", classOf(route(["self harm"])[0]) === "crisis", route(["self harm"]));
ok("'end it all' -> crisis", classOf(route(["end it all"])[0]) === "crisis", route(["end it all"]));
ok("crisis beats oracle: 'i want to die help' -> crisis", classOf(route(["i want to die help"])[0]) === "crisis", route(["i want to die help"]));

// 7. miss -> deflection pool
ok("nonsense -> deflection", classOf(route(["zzqq no such entry 999"])[0]) === "deflection", route(["zzqq no such entry 999"]));

// 8. repeat lane
const rep = route(["hello", "hello"]);
ok("repeat 'hello' twice -> repeat lane", classOf(rep[1]) === "repeat", rep);

// 9. farewell
ok("'bye' -> mg-farewell-01", route(["bye"])[0] === "mg-farewell-01", route(["bye"]));

// 10. crisis renders as plain (corpus note present, register clinical only)
const c1 = byId["c-crisis-01"];
ok("crisis register is clinical-only (plain)", Array.isArray(c1.register_tags) && c1.register_tags.length === 1 && c1.register_tags[0] === "clinical", c1.register_tags);

// 11. K255 — the position lane (presence-gated: vacuously GREEN with zero
//     position entries; the checks arm the moment the ratified pilot lands)
const posE = entries.filter(e => e.position !== undefined);
if (posE.length) {
  // a. every position entry's strongest pattern routes home to its own
  //    objection's variance pool (a sibling phrasing is a legal carrier)
  const byObj = {};
  posE.forEach(e => { (byObj[e.position.objection_id] = byObj[e.position.objection_id] || new Set()).add(e.id); });
  for (const e of posE) {
    const pats = (e.patterns || []).slice().sort((a, b) => b.form.length - a.form.length);
    if (!pats.length) { ok(e.id + " has patterns", false, "none"); continue; }
    const got = route([pats[0].form])[0];
    ok("pos route " + JSON.stringify(pats[0].form), got !== null && byObj[e.position.objection_id].has(got), got);
  }
  // b. crisis still beats a position trigger riding a crisis token
  const posForm = (posE[0].patterns && posE[0].patterns[0]) ? posE[0].patterns[0].form : "";
  ok("crisis beats position", classOf(route([posForm + " i want to die"])[0]) === "crisis", route([posForm + " i want to die"]));
  // c. each position entry deep-links its OWN graded node on the flagship
  for (const e of posE) ok(e.id + " deep-links its node",
    e.href === "https://library.wuld.ink/combined#obj-" + e.position.objection_id, e.href);
}

// 12. K255 — the request tier is SEALED on the open surface: a matcher built
//     { unsealed:false } (both loaders' construction) can never emit one
const gated = entries.filter(e => e.tier === "request");
for (const e of gated) for (const p of (e.patterns || [])) {
  const got = route([p.form])[0];
  ok("sealed " + JSON.stringify(p.form), got !== e.id, got);
}

console.log("== Ω2 surface e2e (engine + mrgrey corpus) ==");
console.log("entries=" + entries.length + "  pass=" + pass + "  fail=" + fail);
if (fails.length) { console.log("\n-- FAILURES --"); fails.forEach(f => console.log("  RED  " + f)); }
console.log("\n" + (fail === 0 ? "SURFACE E2E: GREEN — crisis-first, stance-bait deflects, chain walks, oracle/miss/repeat route." : "SURFACE E2E: RED"));
process.exit(fail === 0 ? 0 : 1);
