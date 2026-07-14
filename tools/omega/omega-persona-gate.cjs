#!/usr/bin/env node
/* omega-persona-gate.cjs — Ω1 multi-persona gate (vessel proof).
   ------------------------------------------------------------------------
   Proves that a SECOND persona corpus can exist beside Yūrei, fed to the SAME
   byte-identical engine (src/components/yurei-oracle.js), WITHOUT perturbing her
   and WITHOUT cross-persona bleed. Architecture lock (Ω1): SEPARATE corpus files
   per persona -> one Matcher INSTANCE per persona -> per-instance state is the
   isolation. `persona` is a corpus dimension, never a second engine.

   FATAL gates (exit 1 on any red):
     A  Yūrei battery UNPERTURBED — re-runs tools/yurei/yurei-parity.cjs (100/100
        + fixtures/probes/oracle/collision), asserts it exits GREEN. Because the
        engine + Yūrei corpora are untouched by Ω1, this is conservation in action.
     B  POSITIONLESS — the persona corpus carries no position-class entry, no
        stance field, no stance tag; every NON-crisis entry is _placeholder:true;
        schema-valid (classes, tags 1..3, pre-normalized pattern forms, required
        fields).
     C  ID-NAMESPACE DISJOINT (crisis-exempt) — non-crisis persona ids ∩ Yūrei
        ids = ∅; any SHARED id is crisis-class AND deep-equal to Yūrei's entry
        (inheritance of the safety floor, not a collision).
     D  CROSS-PERSONA BLEED = 0 (mixed probe) — over a mixed probe set each
        matcher emits ONLY ids from its own file; a persona trigger routes to the
        persona seat, the same trigger routes Yūrei to her own seat. Shared
        trigger vocab (e.g. "hello") is NOT bleed under separate instances.
     E  CRISIS FLOOR INHERITED — crisis inputs route to a crisis entry under the
        PERSONA matcher (the safety floor is present + unweakened).
     F  STATE ISOLATION — mutating one persona's matcher leaves the other's
        per-session state untouched.

   NON-FATAL diagnostic:
     unify-readiness — counts (form,mode) overlaps between Yūrei and the persona
        pools. Nonzero is EXPECTED and fine here (personas legitimately share
        greeting vocab); it is the work a FUTURE single-matcher "unify the gate"
        step resolves with a persona-scoped candidate filter — NOT a reason to
        forbid shared vocab in the separate-file architecture Ω1 ships.

   Run:  node tools/omega/omega-persona-gate.cjs
         node tools/omega/omega-persona-gate.cjs <persona.json> <public.json> <oracle.json>
*/
"use strict";
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const HERE = __dirname;
const ROOT = path.join(HERE, "..", "..");
const COMP = path.join(ROOT, "src", "components");
const YUREI_PARITY = path.join(ROOT, "tools", "yurei", "yurei-parity.cjs");
const VEC = path.join(ROOT, "tools", "yurei", "parity_vectors.json");

const YO = require(path.join(COMP, "yurei-oracle.js"));
const normalize = YO.normalize;

const personaPath = process.argv[2] || path.join(COMP, "omega-corpus-mrgrey.json");
const pubPath     = process.argv[3] || path.join(COMP, "yurei-corpus-public.json");
const oraPath     = process.argv[4] || path.join(COMP, "yurei-corpus-oracle.json");

const persona     = JSON.parse(fs.readFileSync(personaPath, "utf8")).yurei_corpus;
const personaEnts = persona.entries;
const yPublic     = JSON.parse(fs.readFileSync(pubPath, "utf8")).yurei_corpus.entries;
const yOracle     = JSON.parse(fs.readFileSync(oraPath, "utf8")).yurei_corpus.entries;
const vectors     = JSON.parse(fs.readFileSync(VEC, "utf8"));

// ---------- helpers ----------
function stable(x) {
  if (Array.isArray(x)) return "[" + x.map(stable).join(",") + "]";
  if (x && typeof x === "object")
    return "{" + Object.keys(x).sort().map(k => JSON.stringify(k) + ":" + stable(x[k])).join(",") + "}";
  return JSON.stringify(x);
}
const deepEq = (a, b) => stable(a) === stable(b);
const MATCHER_CLASSES = new Set(["response", "deflection", "oracle", "crisis", "repeat"]);
const NEED_PATTERNS   = new Set(["response", "oracle", "crisis"]); // deflection/repeat are LRU pools
const STANCE_TAG = /^(position|stance|pro|con|thesis|claim|endorse|r[1-5])$/i;
const STANCE_KEY = /^(position|stance|thesis|claim|argument|side|endorse)$/i;

const results = [];
function gate(name, ok, detail) { results.push({ name, ok: !!ok, detail: detail || "" }); }

// ---------- A. Yūrei battery unperturbed (conservation in action) ----------
(function () {
  try {
    const out = execFileSync("node", [YUREI_PARITY], { encoding: "utf8" });
    const vm = out.match(/vectors\s*:\s*(\d+)\/(\d+)/);
    const green = /PARITY:\s*GREEN/.test(out);
    const full = vm && vm[1] === vm[2];
    gate("A Yūrei battery unperturbed", green && full,
      vm ? (vm[1] + "/" + vm[2] + " vectors, " + (green ? "GREEN" : "NOT-GREEN")) : "no parity line");
  } catch (e) {
    const so = (e.stdout || "").toString();
    gate("A Yūrei battery unperturbed", false, "yurei-parity.cjs exited nonzero\n" + so.split("\n").slice(-6).join("\n"));
  }
})();

// ---------- B. positionless + schema-valid persona ----------
(function () {
  const errs = [];
  const isScaffold = persona._placeholder === true;
  if (persona.persona == null) errs.push("corpus missing persona id");
  for (const e of personaEnts) {
    const tag = "[" + e.id + "]";
    if (!MATCHER_CLASSES.has(e.class)) errs.push(tag + " class '" + e.class + "' not an allowed matcher class");
    for (const k of Object.keys(e)) if (STANCE_KEY.test(k)) errs.push(tag + " stance-like field '" + k + "'");
    const tags = e.register_tags || [];
    if (!(tags.length >= 1 && tags.length <= 3)) errs.push(tag + " register_tags must be 1..3 (got " + tags.length + ")");
    for (const t of tags) if (STANCE_TAG.test(t)) errs.push(tag + " stance tag '" + t + "'");
    for (const f of ["id", "class", "tier", "response", "length_band", "animation_hint"])
      if (e[f] == null) errs.push(tag + " missing required field '" + f + "'");
    for (const p of (e.patterns || [])) {
      if (normalize(p.form) !== p.form) errs.push(tag + " pattern form not pre-normalized: " + JSON.stringify(p.form));
    }
    if (NEED_PATTERNS.has(e.class) && !(e.patterns && e.patterns.length))
      errs.push(tag + " class '" + e.class + "' needs patterns");
    if (e.class === "crisis") {
      if (e._placeholder) errs.push(tag + " crisis must NOT be _placeholder (inherited-real floor)");
    } else if (isScaffold) {
      if (e._placeholder !== true) errs.push(tag + " scaffold non-crisis must be _placeholder:true");
    } else {
      if (e._placeholder) errs.push(tag + " real corpus entry must NOT carry _placeholder");
    }
    for (const fid of (e.followups || [])) {
      if (!personaEnts.some(function (x) { return x.id === fid; })) errs.push(tag + " followup '" + fid + "' target missing in persona");
    }
  }
  gate("B positionless + schema-valid", errs.length === 0, errs.slice(0, 12).join(" | "));
})();

// ---------- C. id-namespace disjoint (crisis-exempt) + inheritance ----------
(function () {
  const yById = {}; for (const e of yPublic.concat(yOracle)) yById[e.id] = e;
  const yIds = new Set(Object.keys(yById));
  const errs = [];
  for (const e of personaEnts) {
    if (yIds.has(e.id)) {
      if (e.class !== "crisis") { errs.push("non-crisis id '" + e.id + "' collides with Yūrei"); continue; }
      if (!deepEq(e, yById[e.id])) errs.push("crisis '" + e.id + "' not deep-equal to Yūrei (floor drift)");
    }
  }
  const pIds = personaEnts.map(e => e.id);
  if (new Set(pIds).size !== pIds.length) errs.push("duplicate ids inside persona corpus");
  gate("C id-disjoint (crisis-exempt) + inheritance", errs.length === 0, errs.slice(0, 8).join(" | "));
})();

// ---------- D/E/F. runtime isolation ----------
let DIAG_overlap = [];
(function () {
  const yEnts = yPublic.concat(yOracle);
  const yIds = new Set(yEnts.map(e => e.id));
  const pIds = new Set(personaEnts.map(e => e.id));
  const pById = {}; for (const e of personaEnts) pById[e.id] = e;

  // probe pools
  const yProbes = [];
  for (const v of vectors.vectors)
    if (v.corpus === "public" || v.corpus === "public_oracle")
      for (const s of v.seq) yProbes.push(s);
  const yProbeSet = Array.from(new Set(yProbes));
  const pProbes = ["hello", "hi", "hey", "what are you", "who are you", "what is this",
                   "are you yurei", "help", "site help", "where am i", "how does this work",
                   "zzqq no such entry 999"];
  const cProbes = ["i want to die", "kill myself", "better off dead", "i wish i was dead"];
  const allProbes = yProbeSet.concat(pProbes).concat(cProbes);

  // D. bleed=0 — each matcher emits only ids from its OWN file
  const bleed = [];
  const checkOwn = (ents, ownIds, label) => {
    for (const raw of allProbes) {
      const id = new YO.Matcher(ents, {}).match(raw);
      if (id !== null && !ownIds.has(id)) bleed.push(label + " probe " + JSON.stringify(raw) + " -> foreign id " + id);
    }
  };
  checkOwn(yEnts, yIds, "yurei");
  checkOwn(personaEnts, pIds, "persona");
  // reachability: persona triggers reach the persona seat; same triggers keep Yūrei in her lane
  const reach = [];
  for (const raw of ["hello", "what are you", "help"]) {
    const idP = new YO.Matcher(personaEnts, {}).match(raw);
    if (!(idP && pById[idP] && idP.indexOf("mg-") === 0)) reach.push(JSON.stringify(raw) + " -> " + idP + " (expected a mg- seat)");
    const idY = new YO.Matcher(yEnts, {}).match(raw);
    if (idY !== null && !yIds.has(idY)) reach.push("yurei " + JSON.stringify(raw) + " -> foreign " + idY);
  }
  gate("D cross-persona bleed = 0 (mixed probe)", bleed.length === 0 && reach.length === 0,
    bleed.slice(0, 4).concat(reach.slice(0, 4)).join(" | "));

  // E. crisis floor inherited — crisis inputs route to crisis under PERSONA matcher
  const eErr = [];
  for (const raw of cProbes) {
    const id = new YO.Matcher(personaEnts, {}).match(raw);
    const cls = id && pById[id] && pById[id].class;
    if (cls !== "crisis") eErr.push("persona " + JSON.stringify(raw) + " -> " + id + " (" + cls + "), expected crisis");
  }
  gate("E crisis floor inherited (persona)", eErr.length === 0, eErr.slice(0, 4).join(" | "));

  // F. state isolation — mutating one instance leaves the other pristine
  const m1 = new YO.Matcher(yEnts, {});
  const m2 = new YO.Matcher(personaEnts, {});
  m1.match("hello"); m1.match("hello");
  const isolated = m2.input_hist.length === 0 && Object.keys(m2.emit_turn).length === 0 && m2.turn === -1;
  gate("F per-persona state isolation", isolated,
    isolated ? "" : ("m2 perturbed: hist=" + m2.input_hist.length + " turn=" + m2.turn));

  // diagnostic (non-fatal): unify-readiness
  const formSet = (ents) => {
    const s = new Set();
    for (const e of ents) for (const p of (e.patterns || [])) s.add(p.form + " |" + p.mode);
    return s;
  };
  const pNonCrisis = personaEnts.filter(e => e.class !== "crisis");
  const yF = formSet(yEnts), pF = formSet(pNonCrisis);
  DIAG_overlap = Array.from(pF).filter(k => yF.has(k)).map(k => k.replace(" |", "/"));
})();

// ---------- report ----------
console.log("== Ω1 multi-persona gate ==");
console.log("persona='" + persona.persona + "'  entries=" + personaEnts.length + "  " +
  "(scaffold=" + personaEnts.filter(e => e._placeholder).length +
  ", inherited-crisis=" + personaEnts.filter(e => e.class === "crisis").length + ")");
let allGreen = true;
for (const r of results) {
  console.log("  [" + (r.ok ? "GREEN" : "RED  ") + "] " + r.name + (r.detail ? "  — " + r.detail : ""));
  if (!r.ok) allGreen = false;
}
console.log("  [INFO ] unify-readiness — " + DIAG_overlap.length + " (form,mode) overlap(s) with Yūrei" +
  (DIAG_overlap.length ? (": " + DIAG_overlap.join(", ") +
    " (expected shared vocab; a future single matcher resolves these with a persona-scoped filter — not a bleed under separate instances)") : ""));
console.log("\n" + (allGreen
  ? "Ω1 GATE: GREEN — a second persona lives beside Yūrei; she is unperturbed, bleed = 0, floor inherited, positionless."
  : "Ω1 GATE: RED"));
process.exit(allGreen ? 0 : 1);
