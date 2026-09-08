#!/usr/bin/env node
/* mrgrey-register-gate.cjs — K253. The Grey-side fence validator.
   ------------------------------------------------------------------------
   Operationalizes the ratification relay's Condition 1: the persona fences hold
   as VALIDATOR-SCANNED INVARIANTS over the corpus bytes, not as router behavior.
   Scans src/components/omega-corpus-mrgrey.json (non-crisis entries; the crisis
   floor is byte-inherited and gated by omega-persona-gate C/E).

   FATAL checks:
     1  REGISTER STATICS — sentence case; no parens / exclaim / ellipsis;
        zero terminal-question responses; em-dash <=1 per response; <=320 chars;
        register_tags 1..3.
     2  TABOO LEXICON — hedges, assistant-speak, apology-forms, marketing
        affect, AI-self-labels. Zero hits outside crisis.
     3  YUREI-BLEED — her home lexicon (filing / minutes / department /
        attendance / ledger / requisition / archive / catalogued / shelved /
        night shift) absent from Grey responses. "the record" is shared license.
     4  LATIN FENCE — protocol adjuncts appear in exactly ONE whitelisted greet
        (mg-greet-04, Josiah-elected K253); zero elsewhere. Emitted responses
        only; input patterns are exempt.
     5  CURTAIN FENCE — no gated-surface leak: no /console/ href, no curtain
        passphrase tokens in any response.
     6  HREF ALLOWLIST — oracle links resolve only to known site routes.
     7  WEIGHT CAP — non-crisis pattern weights <=3 (crisis floor keeps 8/9);
        pattern forms pre-normalized; modes legal.
     8  CRISIS-FIRST — crisis probes route to a crisis entry under the full
        corpus (the floor cannot be shadowed by expansion).
     9  ROUTING BATTERY — every pattern form probes back to its own entry;
        forms shared across entries (rotation vocab) accept any carrier;
        engineered cross-catches ride an explicit exception map.

   Run:  node tools/omega/mrgrey-register-gate.cjs [corpus.json]
*/
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const COMP = path.join(ROOT, "src", "components");
const YO = require(path.join(COMP, "yurei-oracle.js"));

const cp = process.argv[2] || path.join(COMP, "omega-corpus-mrgrey.json");
const corpus = JSON.parse(fs.readFileSync(cp, "utf8")).yurei_corpus;
const ents = corpus.entries;
const nonCrisis = ents.filter((e) => e.class !== "crisis");

let pass = 0, fail = 0;
const bad = [];
function ok(name, cond, detail) {
  if (cond) pass++;
  else { fail++; bad.push(name + (detail ? " — " + detail : "")); }
}

/* 1 — register statics */
for (const e of nonCrisis) {
  const r = e.response;
  ok(e.id + " case", /^[A-Z0-9"']/.test(r));
  ok(e.id + " punct", !/[()!]/.test(r) && !/\.\.\.|…/.test(r));
  ok(e.id + " no terminal question", !/\?\s*$/.test(r) && !/\?/.test(r));
  ok(e.id + " emdash<=1", (r.match(/—/g) || []).length <= 1);
  ok(e.id + " len<=320", r.length <= 320, String(r.length));
  const t = e.register_tags || [];
  ok(e.id + " tags1..3", t.length >= 1 && t.length <= 3);
}

/* 2 — taboo lexicon (word/phrase scan over lowercased response) */
const TABOO = ["arguably", "perhaps", " maybe ", "possibly", "i think", "it could be said",
  "how can i help", "happy to", "great question", "let me know", "feel free",
  "sorry", "i apologize", "my apologies", "excited", "amazing", "awesome",
  "chatbot", "language model", "as an ai", " just "];
for (const e of nonCrisis) {
  const low = " " + e.response.toLowerCase() + " ";
  const hits = TABOO.filter((t) => low.indexOf(t) !== -1);
  ok(e.id + " taboo", hits.length === 0, hits.join(","));
}

/* 3 — Yūrei-bleed scan */
const YLEX = ["filing", "the minutes", "department", "attendance", "ledger",
  "requisition", "archive", "catalogued", "shelved", "night shift"];
for (const e of nonCrisis) {
  const low = " " + e.response.toLowerCase() + " ";
  const hits = YLEX.filter((t) => low.indexOf(t) !== -1);
  ok(e.id + " yurei-bleed", hits.length === 0, hits.join(","));
}

/* 4 — Latin fence (responses only; one elected greet) */
const LATIN = ["illogicaliter", "et tamen est", "taedium", "quies absoluta", "vita invisa", "ne hoc fiat"];
const LATIN_OK = new Set(["mg-greet-04"]);
for (const e of nonCrisis) {
  const low = e.response.toLowerCase();
  const hits = LATIN.filter((t) => low.indexOf(t) !== -1);
  ok(e.id + " latin-fence", hits.length === 0 || LATIN_OK.has(e.id), hits.join(","));
}
ok("latin greet present", ents.some((e) => e.id === "mg-greet-04" && /Illogicaliter est\. Et tamen est\./.test(e.response)));

/* 5 — curtain fence */
for (const e of nonCrisis) {
  const low = e.response.toLowerCase();
  ok(e.id + " curtain", low.indexOf("facilis") === -1 && low.indexOf("descensus") === -1 &&
    !(e.href && /console/.test(e.href)));
}

/* 6 — href allowlist */
const ROUTES = new Set(["/", "/argue/", "/ne-hoc-fiat/", "/contact/", "/argument-library/",
  "/essays/", "/glossary/", "/book/", "/gallery/", "/watch/", "/notes/",
  "/void-engine/", "/donations/", "/changelog/", "/search/", "/blog/", "/chat/"]);
for (const e of nonCrisis) if (e.href) ok(e.id + " href", ROUTES.has(e.href), e.href);

/* 7 — weight cap + normalization + modes */
const MODES = new Set(["exact", "contains", "tokens_all", "tokens_any"]);
for (const e of nonCrisis) for (const p of (e.patterns || [])) {
  ok(e.id + " w<=3", (p.weight | 0) <= 3, p.form + "=" + p.weight);
  ok(e.id + " normd", YO.normalize(p.form) === p.form, p.form);
  ok(e.id + " mode", MODES.has(p.mode), p.mode);
}
for (const e of ents.filter((x) => x.class === "crisis")) for (const p of e.patterns)
  ok(e.id + " crisis-w", (p.weight | 0) >= 8, p.form + "=" + p.weight);

/* 8 — crisis-first under the full corpus */
const byId = {}; for (const e of ents) byId[e.id] = e;
for (const raw of ["i want to die", "kill myself", "better off dead", "suicidal",
  "self harm", "end it all", "no reason to live"]) {
  const id = new YO.Matcher(ents, {}).match(raw);
  ok("crisis-first " + JSON.stringify(raw), id && byId[id] && byId[id].class === "crisis", String(id));
}

/* 9 — routing battery: every form probes home (shared forms accept any carrier) */
const carriers = {};
for (const e of nonCrisis) for (const p of (e.patterns || []))
  (carriers[p.form] = carriers[p.form] || new Set()).add(e.id);
/* engineered cross-catches: probe -> the DESIGNED winner (longer/heavier form elsewhere) */
const EXPECT = { "debate me": "mg-convince-me-01" };
let probes = 0;
for (const e of nonCrisis) for (const p of (e.patterns || [])) {
  probes++;
  const id = new YO.Matcher(ents, {}).match(p.form);
  const okSet = EXPECT[p.form] ? new Set([EXPECT[p.form]]) : carriers[p.form];
  ok("route " + JSON.stringify(p.form), id !== null && okSet.has(id), p.form + " -> " + id);
}

/* report */
console.log("== mrgrey register gate (K253) ==");
console.log("entries=" + ents.length + " (authored=" + nonCrisis.length +
  ", crisis=" + ents.filter((e) => e.class === "crisis").length + ")  route-probes=" + probes);
for (const b of bad.slice(0, 30)) console.log("  [RED] " + b);
console.log(fail === 0
  ? "MRGREY GATE: GREEN — " + pass + " checks; fences hold as scanned invariants."
  : "MRGREY GATE: RED — " + fail + "/" + (pass + fail) + " failed.");
process.exit(fail === 0 ? 0 : 1);
