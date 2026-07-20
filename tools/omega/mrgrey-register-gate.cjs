#!/usr/bin/env node
/* mrgrey-register-gate.cjs — K253. The Grey-side fence validator.
   ------------------------------------------------------------------------
   Operationalizes the ratification relay's Condition 1: the persona fences hold
   as VALIDATOR-SCANNED INVARIANTS over the corpus bytes, not as router behavior.
   Scans src/components/omega-corpus-mrgrey.json (non-crisis entries; the crisis
   floor is byte-inherited and gated by omega-persona-gate C/E).

   FATAL checks:
     1  REGISTER STATICS (meta/deflection lane — every non-crisis entry WITHOUT
        a position block) — sentence case; no parens / exclaim / ellipsis;
        zero question marks; em-dash <=1 per response; <=320 chars;
        register_tags 1..3.
     1b POSITION-LANE LAWS (K255; entries carrying the provenance-stamped
        `position` block — the R2-cadence envelope derived from the ratified
        Stage-3 voice-test, ruled by Josiah in-session; the seat's R2 exemplar
        trues it up by numbered transmission when it lands) — sentence case;
        no parens / exclaim / ellipsis; zero question marks; em-dash <=4;
        <=900 chars; length_band 'b4_reply' (and b4_reply appears ONLY here);
        register_tags 1..3.
     1c PROVENANCE vs THE VENDORED INDEX — every position.objection_id is a
        member of tools/omega/vendor/objections-index.json (all 82 ids, vendored
        read-only from efilist @HEAD — never hand-copied); source_node is the
        objection's own #obj-<id> deep-link; ratified + seat_rx nonempty.
        Variance depth rides as an INFO diagnostic (target >=2 phrasings per
        piloted objection where feasible — the anti-farming condition).
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
     6  HREF ALLOWLIST — links resolve only to known site routes, or to the
        flagship library's own combined surface (https://library.wuld.ink/
        combined#obj-…) for position deep-links.
     7  WEIGHT CAP — non-crisis pattern weights <=3 (crisis floor keeps 8/9);
        pattern forms pre-normalized; modes legal.
     8  CRISIS-FIRST — crisis probes route to a crisis entry under the full
        corpus (the floor cannot be shadowed by expansion).
     9  ROUTING BATTERY — every pattern form probes back to its own entry;
        forms shared across entries (rotation vocab) accept any carrier;
        engineered cross-catches ride an explicit exception map.
    10  LIVE ROUTES (--live only, K254) — every corpus href fetched against the
        deployed host, HTTP 200 required. Default mode makes no network calls.

   Run:  node tools/omega/mrgrey-register-gate.cjs [corpus.json]
         node tools/omega/mrgrey-register-gate.cjs --live
*/
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const COMP = path.join(ROOT, "src", "components");
const YO = require(path.join(COMP, "yurei-oracle.js"));

const argPaths = process.argv.slice(2).filter((a) => a.indexOf("--") !== 0);
const cp = argPaths[0] || path.join(COMP, "omega-corpus-mrgrey.json");
const corpus = JSON.parse(fs.readFileSync(cp, "utf8")).yurei_corpus;
const ents = corpus.entries;
const nonCrisis = ents.filter((e) => e.class !== "crisis");
const posEnts = nonCrisis.filter((e) => e.position !== undefined);       // the provenance-stamped class (K255)
const staticEnts = nonCrisis.filter((e) => e.position === undefined);    // the Phase-3 meta/deflection lane

let pass = 0, fail = 0;
const bad = [];
function ok(name, cond, detail) {
  if (cond) pass++;
  else { fail++; bad.push(name + (detail ? " — " + detail : "")); }
}

/* 1 — register statics (meta/deflection lane) */
for (const e of staticEnts) {
  const r = e.response;
  ok(e.id + " case", /^[A-Z0-9"']/.test(r));
  ok(e.id + " punct", !/[()!]/.test(r) && !/\.\.\.|…/.test(r));
  ok(e.id + " no terminal question", !/\?\s*$/.test(r) && !/\?/.test(r));
  ok(e.id + " emdash<=1", (r.match(/—/g) || []).length <= 1);
  ok(e.id + " len<=320", r.length <= 320, String(r.length));
  const t = e.register_tags || [];
  ok(e.id + " tags1..3", t.length >= 1 && t.length <= 3);
  ok(e.id + " band not b4", e.length_band !== "b4_reply", e.length_band);
}

/* 1b — position-lane laws (R2-cadence envelope; K255) */
for (const e of posEnts) {
  const r = e.response;
  ok(e.id + " pos-case", /^[A-Z0-9"']/.test(r));
  ok(e.id + " pos-punct", !/[()!]/.test(r) && !/\.\.\.|…/.test(r));
  ok(e.id + " pos-no-question", !/\?/.test(r));
  ok(e.id + " pos-emdash<=4", (r.match(/—/g) || []).length <= 4, String((r.match(/—/g) || []).length));
  ok(e.id + " pos-len<=900", r.length <= 900, String(r.length));
  ok(e.id + " pos-band b4_reply", e.length_band === "b4_reply", e.length_band);
  const t = e.register_tags || [];
  ok(e.id + " pos-tags1..3", t.length >= 1 && t.length <= 3);
}

/* 1c — provenance vs the vendored index (never hand-copied) */
const VENDOR = path.join(__dirname, "vendor", "objections-index.json");
if (posEnts.length) {
  let idxIds = null;
  try { idxIds = new Set(JSON.parse(fs.readFileSync(VENDOR, "utf8")).objections.map((o) => o.id)); }
  catch (err) { ok("vendored objections-index readable", false, String((err && err.message) || err)); }
  if (idxIds) {
    ok("vendored index carries 82 ids", idxIds.size === 82, String(idxIds.size));
    for (const e of posEnts) {
      const p = e.position || {};
      ok(e.id + " prov-id in index", idxIds.has(p.objection_id), String(p.objection_id));
      ok(e.id + " prov-node deep-link", p.source_node === "https://library.wuld.ink/combined#obj-" + p.objection_id, String(p.source_node));
      ok(e.id + " prov-ratified", typeof p.ratified === "string" && p.ratified.length > 0);
      ok(e.id + " prov-seat_rx", typeof p.seat_rx === "string" && p.seat_rx.length > 0);
    }
  }
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

/* 6 — href allowlist (site routes; position deep-links may point at the
   flagship's own combined surface, #obj- card-anchor form only) */
const ROUTES = new Set(["/", "/argue/", "/ne-hoc-fiat/", "/contact/", "/argument-library/",
  "/essays/", "/glossary/", "/book/", "/gallery/", "/watch/", "/notes/",
  "/void-engine/", "/donations/", "/changelog/", "/search/", "/blog/", "/chat/"]);
const LIB_HREF = /^https:\/\/library\.wuld\.ink\/combined#obj-[A-Za-z0-9_-]+$/;
for (const e of nonCrisis) if (e.href) {
  const okHref = ROUTES.has(e.href) || (e.position !== undefined && LIB_HREF.test(e.href));
  ok(e.id + " href", okHref, e.href);
}

/* 6b — sectioning fence (K255): R1/R4-class content can NEVER ride a
   public-tier entry; tier values legal; the request tier ships EMPTY until
   its content is ratified (fences before content). */
const TIER_SET = new Set(["public", "request"]);
for (const e of nonCrisis) {
  ok(e.id + " tier legal", TIER_SET.has(e.tier), String(e.tier));
  const reg = e.position && e.position.register;
  if (reg === "R1" || reg === "R4") ok(e.id + " " + reg + " sectioned", e.tier !== "public", e.tier);
}

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

/* 10 — live route check (--live, K254): every corpus href must serve 200 on the
   deployed host. The successor seat's route-ask as a standing instrument: an
   asserted-but-absent page is the oracle pointing at vapor. Default mode stays
   fully offline; pass --live to fetch. */
async function liveRoutes() {
  const hrefs = Array.from(new Set(nonCrisis.filter((e) => e.href).map((e) => e.href)));
  for (const h of hrefs) {
    // absolute (library deep-link) -> fetch as-is with the fragment stripped;
    // site-relative -> prefix the deployed host. 200 required either way.
    const url = /^https:\/\//.test(h) ? h.replace(/#.*$/, "") : "https://wuld.ink" + h;
    try {
      const res = await fetch(url, { method: "GET", redirect: "manual" });
      ok("live " + h, res.status === 200, "HTTP " + res.status);
    } catch (err) { ok("live " + h, false, String((err && err.message) || err)); }
  }
  console.log("live routes fetched: " + hrefs.length);
}

function finish() {
  console.log("== mrgrey register gate ==");
  console.log("entries=" + ents.length + " (authored=" + nonCrisis.length +
    ", positions=" + posEnts.length +
    ", crisis=" + ents.filter((e) => e.class === "crisis").length + ")  route-probes=" + probes +
    (process.argv.includes("--live") ? "  mode=live" : "  mode=offline"));
  if (posEnts.length) {                       // variance-depth diagnostic (anti-farming; non-fatal)
    const per = {};
    for (const e of posEnts) { const oid = (e.position || {}).objection_id; per[oid] = (per[oid] || 0) + 1; }
    const single = Object.keys(per).filter((k) => per[k] < 2);
    console.log("  [INFO ] variance depth — " + Object.keys(per).length + " objection(s) covered; " +
      (single.length ? single.length + " at single phrasing (target >=2 where feasible): " + single.join(", ") : "all at >=2 phrasings."));
  }
  for (const b of bad.slice(0, 30)) console.log("  [RED] " + b);
  console.log(fail === 0
    ? "MRGREY GATE: GREEN — " + pass + " checks; fences hold as scanned invariants."
    : "MRGREY GATE: RED — " + fail + "/" + (pass + fail) + " failed.");
  process.exit(fail === 0 ? 0 : 1);
}
if (process.argv.includes("--live")) { liveRoutes().then(finish); } else { finish(); }
