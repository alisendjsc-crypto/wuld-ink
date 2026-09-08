#!/usr/bin/env node
/* coverage_audit.cjs — the Successor proxy's PROACTIVE coverage audit (K295).
   ------------------------------------------------------------------------
   The Gap Log (tools/yurei/gaplog-visitor-e2e.cjs, the 1.5b visitor lane) is
   REACTIVE: it records a miss after a real person hits one — and it is not wired
   into the Successor surface at all (`gaplog` occurs 0 times in successor-stage.js,
   omega-assistant.js, yurei-oracle.js). This tool is the proactive counterpart:
   it computes the gaps FROM THE CORPUS AND THE REAL MATCHER, with no user in the
   loop. Measure-only. It writes nothing into src/ and phones nowhere.

   Engine: the REAL src/components/yurei-oracle.js, `require`d byte-identical —
   the same way tools/omega/omega-persona-gate.cjs runs it. A FRESH Matcher per
   probe (K260: per-session dampening makes a shared instance false-FAIL).

   Sections (each prints its population beside every assertion — an assertion
   over an empty set passes, because [].every() is true; that bit twice in one
   month):
     0  anatomy       — counts, asserted against the expected shape
     1  calibration   — known answers from landed strata; refuse to report if red
     2  crisis floor  — HOW it fires (structural) + THAT it fires (empirical) +
                        the floor's OWN coverage (adjacent phrasings, report-only)
     3  self-match    — control group: every declared form must retrieve its entry
     4  ambiguity     — winner / runner-up / margin for every form; ties by id
     5  reachability  — MISS_THRESHOLD inertness proof + per-entry profile
                        (replaces the kickoff's "threshold headroom", which
                        presumed scores SUM; they are a MAX)
     6  mutation      — brittleness under contraction/expansion, plural, order,
                        fillers, typos; controls that MUST survive normalization
     7  subject       — what wuld.ink is about (search-index titles/headings/
                        glossary/void categories + the library's own objection
                        phrasings and keywords) vs what the proxy can field
     8  help intents  — what "help"-shaped inputs route to today
     9  dynamics      — multi-turn behaviour the single-probe families cannot see

   Run:  node tools/omega/coverage_audit.cjs [corpus.json] [search-index.json]
                                              [objections-index.json] [out.json]
         e.g. node tools/omega/coverage_audit.cjs "" "" "" tools/omega/coverage-audit-K295.json
         (an empty arg falls to the default; out.json defaults to the OS temp dir)
   Writes out.json (all rows) + out.md (the ranked summary beside it).
   Exit 1 also flags a corpus whose anatomy or calibration differs from the K270
   corpus this was cut against — re-pin those two assertions deliberately when
   the corpus moves; they are the tool's own "known answers".
   Exit 0 iff calibration + normalization controls are green (the report is
   still written on red, so the failure is inspectable). */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = process.env.WULD_ROOT || path.join(__dirname, "..", "..");
const A = process.argv.slice(2);
const CORPUS = A[0] || path.join(ROOT, "src", "components", "omega-corpus-mrgrey.json");
const SINDEX = A[1] || path.join(ROOT, "src", "search-index.json");
const VENDOR = A[2] || path.join(ROOT, "tools", "omega", "vendor", "objections-index.json");
// default output lands in the OS temp dir, NOT beside the tool: an untracked stray in tools/omega/ would dirty every
// later session's verify-at-open (K288). Pass an explicit K-named path to produce a committed artifact.
const OUT    = A[3] || path.join(require("os").tmpdir(), "coverage-audit.json");
const ENGINE = path.join(ROOT, "src", "components", "yurei-oracle.js");

const YO = require(ENGINE);
const { normalize, entryScore, CONST } = YO;
const E = JSON.parse(fs.readFileSync(CORPUS, "utf8")).yurei_corpus.entries;
const byId = {}; for (const e of E) byId[e.id] = e;

let fatal = 0;
const report = { meta: {}, sections: {} };
const log = (s) => process.stdout.write(s + "\n");
function assert(ok, label, pop) {
  const line = (ok ? "  ok   " : "  FAIL ") + label + (pop !== undefined ? "   [n=" + pop + "]" : "");
  log(line); if (!ok) fatal++;
  return ok;
}

// ---------- the real engine, one fresh instance per probe ----------
function fresh() { return new YO.Matcher(E, { unsealed: false }); }
function route(text, m) {
  m = m || fresh();
  const id = m.match(text);
  return { id: id, lane: m._lastLane, cls: id ? byId[id].class : null };
}
// annotate a FRESH decision with the candidate ranking the engine would see.
// This mirrors match() for a history-less matcher: crisis (sc>0) > oracle
// (>= ORACLE_MIN) > response (>= MISS_THRESHOLD) > deflection. It is used ONLY
// for margins; the engine's own answer is asserted to agree (section 4).
function rank(text) {
  const t = normalize(text);
  const cand = (pool) => pool.map(e => { const r = entryScore(e, t); return { id: e.id, sc: r[0], mlen: r[1] }; })
                             .filter(c => c.sc > 0)
                             .sort((a, b) => b.sc - a.sc || b.mlen - a.mlen || (a.id < b.id ? -1 : 1));
  const crises = cand(E.filter(e => e.class === "crisis"));
  if (crises.length) return { lane: "crisis", top: crises[0], second: crises[1] || null, pool: "crisis" };
  const oracle = cand(E.filter(e => e.class === "oracle"));
  if (oracle.length && oracle[0].sc >= CONST.ORACLE_MIN) return { lane: "oracle", top: oracle[0], second: oracle[1] || null, pool: "oracle" };
  const resp = cand(E.filter(e => e.class === "response"));
  if (resp.length && resp[0].sc >= CONST.MISS_THRESHOLD) return { lane: "response", top: resp[0], second: resp[1] || null, pool: "response" };
  return { lane: "deflection", top: null, second: null, pool: null };
}
function margin(r) {
  if (!r.top) return null;
  if (!r.second) return { d: r.top.sc, by: "sole" };
  const d = r.top.sc - r.second.sc;
  return { d: d, by: d > 0 ? "score" : (r.top.mlen !== r.second.mlen ? "mlen" : "id") };
}

// ======================================================================
// 0. ANATOMY
// ======================================================================
log("== 0 anatomy ==");
const forms = []; // {id, form, mode, weight, cls}
const cls = {}, modes = {}, weights = {}, tiers = {};
for (const e of E) {
  cls[e.class] = (cls[e.class] || 0) + 1; tiers[e.tier] = (tiers[e.tier] || 0) + 1;
  for (const p of (e.patterns || [])) { forms.push({ id: e.id, form: p.form, mode: p.mode, weight: p.weight | 0, cls: e.class }); modes[p.mode] = (modes[p.mode] || 0) + 1; weights[p.weight] = (weights[p.weight] || 0) + 1; }
}
const noPat = E.filter(e => !(e.patterns || []).length).map(e => e.id);
report.meta = { corpus: path.relative(ROOT, CORPUS), engine: path.relative(ROOT, ENGINE), entries: E.length, patterns: forms.length, classes: cls, tiers, modes, weights, CONST,
                no_pattern_entries: noPat };
log("  entries=" + E.length + " patterns=" + forms.length + " classes=" + JSON.stringify(cls) + " modes=" + JSON.stringify(modes) + " weights=" + JSON.stringify(weights));
assert(E.length === 189 && forms.length === 1076, "anatomy matches the K304 corpus (189 entries / 1076 patterns)", E.length);
assert(noPat.every(id => /^mg-(deflect|repeat)-/.test(id)) && noPat.length === 7, "the 7 pattern-less entries are exactly the deflection+repeat pool (miss path, by construction)", noPat.length);
let nonNorm = 0; for (const f of forms) if (normalize(f.form) !== f.form) nonNorm++;
assert(nonNorm === 0, "every declared form is already normalized (pre-normalized corpus law)", forms.length);
const tokensAny = forms.filter(f => f.mode === "tokens_any");
report.sections.tokens_any = tokensAny;
assert(tokensAny.length === 1 && tokensAny[0].cls === "crisis", "the lone tokens_any pattern is a CRISIS form (" + (tokensAny[0] && tokensAny[0].id) + " " + JSON.stringify(tokensAny[0] && tokensAny[0].form) + ")", tokensAny.length);

// ======================================================================
// 1. CALIBRATION — answers already recorded as live round-trips in landed strata
// ======================================================================
log("== 1 calibration ==");
const CAL = [
  ["life is a gift", "pos-life-gift-01"], ["happiness is a choice", "pos-happiness-is-choice-01"],
  ["the social contract", "pos-social-contract-02"], ["why are you still here", "pos-why-not-suicide-01"],
  ["i want to die", "c-crisis-01"], ["its a luxury belief", "pos-luxury-belief-01"],
  ["the good outweighs the bad", "pos-joy-outweighs-harms-01"], ["care ethics", "pos-care-ethics-02"],
  ["even if the asymmetry fails", "pos-boonin-critique-02"], ["help", "mg-oracle-help-01"],
  ["survivors are glad they survived and i want to die", "c-crisis-01"], ["antinatalism is selfish", "mg-antinatalism-01"]
];
const calRows = CAL.map(([q, want]) => { const r = route(q); return { q, want, got: r.id, lane: r.lane, ok: r.id === want }; });
report.sections.calibration = calRows;
for (const c of calRows) if (!c.ok) log("  MISMATCH " + JSON.stringify(c.q) + " want " + c.want + " got " + c.got + " (" + c.lane + ")");
assert(calRows.every(c => c.ok), "calibration battery: every known answer reproduced", calRows.length);

// ======================================================================
// 2. CRISIS FLOOR — how it fires, that it fires, and what it does not catch
// ======================================================================
log("== 2 crisis floor ==");
const crisisEntries = E.filter(e => e.class === "crisis");
const crisisForms = forms.filter(f => f.cls === "crisis");
const minCrisisScore = Math.min(...crisisForms.map(f => CONST.BASE[f.mode] + f.weight));
const structural = {
  stage: "match() stage 1 scans ONLY class=crisis entries; ANY pattern hit with score>0 wins; it runs BEFORE oracle/continuation/repeat/score; it never consults MISS_THRESHOLD and is exempt from dampening (no _damped check on the crisis path).",
  scoring: "entryScore = MAX over matching patterns of BASE[mode]+weight (BASE " + JSON.stringify(CONST.BASE) + "); scores never SUM. A contains-w9 form scores 69, a tokens_any-w9 form 24 — the kickoff's 'weight 9 does not clear 16' presumed the weight alone is the score.",
  min_crisis_score: minCrisisScore, MISS_THRESHOLD: CONST.MISS_THRESHOLD
};
const bare = crisisForms.map(f => { const r = route(f.form); return { form: f.form, mode: f.mode, want: f.id, got: r.id, lane: r.lane, ok: r.lane === "crisis" }; });
assert(bare.every(x => x.ok), "every crisis form, bare, routes to the crisis lane", bare.length);
// embedded in prose; stacked against an oracle token; stacked against a position trigger; repeated on ONE matcher
const wrap = ["honestly i ", " and it is fine", "antinatalism aside i ", "life is a gift but i ", "you are wrong and i "];
const embedded = [];
for (const f of crisisForms.filter(f => f.mode === "contains")) for (const w of wrap) {
  const text = w.endsWith(" ") ? (w + f.form) : (f.form + w);
  const r = route(text); embedded.push({ text, lane: r.lane, id: r.id, ok: r.lane === "crisis" });
}
assert(embedded.every(x => x.ok), "crisis forms embedded in prose / beside an oracle token / beside a position trigger still route to crisis", embedded.length);
const m1 = fresh(); const rep = [1, 2, 3, 4].map(() => route("i want to die", m1));
assert(rep.every(x => x.lane === "crisis"), "the same crisis input 4 turns running on ONE matcher fires crisis every time (dampening-exempt; the repeat lane is never reached)", rep.length);
const m2 = fresh(); route("help", m2); route("life is a gift", m2); const afterConv = route("i want to die", m2);
assert(afterConv.lane === "crisis", "crisis after an oracle hit and a position hit on the same matcher still fires", 1);
const tokProbe = ["suicide", "suicide is wrong", "the suicide objection", "suicidal", "suicidality"].map(q => { const r = route(q); return { q, lane: r.lane, id: r.id }; });
assert(tokProbe.slice(0, 4).every(x => x.lane === "crisis"), "bare 'suicide' / 'suicidal' reach the floor (the tokens_any pattern is the ONLY route for the bare token suicide)", 4);
// the floor's OWN coverage — adjacent phrasings NOT declared. Report only; the floor is byte-frozen and shared with Yurei.
const ADJ = ["i want to end things", "i dont want to exist", "i want to disappear", "i cant do this anymore", "i want it to stop",
             "nothing matters anymore", "i wish i had never been born", "im done with everything", "i give up on life", "i hate my life",
             "life isnt worth living", "why should i keep going", "whats the point of going on", "i dont see a reason to keep going",
             "i want to sleep and not wake up", "i am not safe", "im going to hurt someone", "i want to kill myself", "should i kill myself",
             "everyone would be better off without me", "i cant go on", "i want out", "no point living", "i dont want to be alive"];
const adj = ADJ.map(q => { const r = route(q); return { q, lane: r.lane, id: r.id, cls: r.cls }; });
const adjMiss = adj.filter(x => x.lane !== "crisis");
log("  crisis-adjacent phrasings probed=" + adj.length + " -> crisis=" + (adj.length - adjMiss.length) + " not-crisis=" + adjMiss.length + " (report-only; the floor is a ratified surface)");
for (const x of adjMiss) log("    not-crisis: " + JSON.stringify(x.q) + " -> " + x.lane + (x.id ? " " + x.id : ""));
report.sections.crisis = { structural, bare, embedded_n: embedded.length, embedded_all_ok: embedded.every(x => x.ok), repeat_on_one_matcher: rep.map(x => x.lane), after_conversation: afterConv.lane, token_probe: tokProbe, adjacent: adj };

// ======================================================================
// 3. SELF-MATCH — control group
// ======================================================================
log("== 3 self-match ==");
const selfRows = forms.map(f => {
  const r = route(f.form); const rk = rank(f.form); const mg = margin(rk);
  return { id: f.id, form: f.form, mode: f.mode, weight: f.weight, got: r.id, lane: r.lane, ok: r.id === f.id,
           margin: mg ? mg.d : null, by: mg ? mg.by : null, top_sc: rk.top ? rk.top.sc : 0, second: rk.second ? rk.second.id : null, second_sc: rk.second ? rk.second.sc : null };
});
const selfFail = selfRows.filter(x => !x.ok);
for (const x of selfFail) {
  const declaredElsewhere = forms.some(f => f.form === x.form && f.id !== x.id);
  x.kind = (byId[x.id].class === "crisis" && x.lane === "crisis") ? "intra-floor arbitration (lane-correct: crisis->crisis)"
         : declaredElsewhere ? "declared collision (another entry declares the same form)" : "steal (an undeclared form of another entry outranks this one)";
}
const laneCorrect = selfFail.filter(x => x.kind.startsWith("intra-floor")).length;
const selfRate = ((forms.length - selfFail.length) / forms.length * 100).toFixed(2);
log("  self-match rate " + selfRate + "% (" + (forms.length - selfFail.length) + "/" + forms.length + ") · lane-correct failures " + laneCorrect + " · real failures " + (selfFail.length - laneCorrect));
for (const x of selfFail) log("    miss " + x.id + " " + JSON.stringify(x.form) + " (" + x.mode + " w" + x.weight + ") -> " + (x.got || "deflection") + " [" + x.lane + "] margin=" + x.margin + " by " + x.by + "  :: " + x.kind);
const steals = selfFail.filter(x => x.kind.startsWith("steal"));
assert(steals.length === 0, "no UNDECLARED steal: every self-match failure is a declared collision or an intra-floor arbitration", selfFail.length);
// per-entry own-form reachability (fresh)
const perEntry = {};
for (const e of E) perEntry[e.id] = { id: e.id, cls: e.class, forms: (e.patterns || []).length, self: 0, exact_only: (e.patterns || []).length > 0 && (e.patterns || []).every(p => p.mode === "exact") };
for (const x of selfRows) if (x.ok) perEntry[x.id].self++;
const deadFresh = Object.values(perEntry).filter(p => p.forms > 0 && p.self === 0);
log("  entries with >=1 form but ZERO self-retrieving forms (unreachable on a fresh matcher): " + deadFresh.length + (deadFresh.length ? " -> " + deadFresh.map(p => p.id).join(", ") : ""));
report.sections.self_match = { rate_pct: +selfRate, n: forms.length, failures: selfFail, lane_correct_failures: laneCorrect, dead_fresh: deadFresh.map(p => p.id) };

// ======================================================================
// 4. AMBIGUITY — every distinct form: winner, runner-up, margin, tie-break
// ======================================================================
log("== 4 ambiguity ==");
const claimants = {}; for (const f of forms) (claimants[f.form] = claimants[f.form] || []).push(f.id + "/" + f.mode + "/w" + f.weight);
const collided = Object.entries(claimants).filter(([, v]) => v.length > 1).map(([form, v]) => {
  const r = route(form); const rk = rank(form); const mg = margin(rk);
  const owners = [...new Set(v.map(s => s.split("/")[0]))];
  return { form, claimants: v, distinct_entries: owners.length, winner: r.id, lane: r.lane, margin: mg ? mg.d : null, by: mg ? mg.by : null, intra_entry_only: owners.length === 1 };
});
// K301: the SET, not the count -- a bare count cannot tell a new collision from a moved one (cclxxiii).
// The 6 K295 collisions + 2 minted by mg-topical-deflect-01, both of which it LOSES:
//   "procreation"  -> mg-antinatalism-01 (oracle; thesis-naming routes to the library, the oracle-net law)
//   "misanthropy"  -> pos-antinatalism-misanthropic-01 (signed position beats an unsigned register lane, K299)
//   "parfit" -> mg-oracle-names-01 (K304). Declared on its position AND on the names
//   oracle; the oracle lane fires first, so the bare surname reaches the shelf while the
//   position keeps every stated-objection form. Deliberate, and the ONLY re-route in the
//   1,597-form K304 diff.
const COLLIDED_EXPECT = ["edgelord","goodbye","hello","hi","misanthropy","parfit","procreation","see a therapist","you are depressed"];
const collidedSorted = collided.map(c => c.form).sort();
assert(collidedSorted.length === COLLIDED_EXPECT.length && collidedSorted.every((f, i) => f === COLLIDED_EXPECT[i]),
  "collided forms (a form declared by more than one pattern) are exactly the 8 audited ones",
  collidedSorted.filter(f => !COLLIDED_EXPECT.includes(f)).join(", ") || collidedSorted.length);
for (const c of collided) log("    " + JSON.stringify(c.form) + " -> " + c.winner + " [" + c.lane + "] margin=" + c.margin + " by " + c.by + (c.intra_entry_only ? " (intra-entry duplicate, benign)" : "") + "  claimants: " + c.claimants.join(" , "));
// engine-vs-ranker agreement over all forms (the ranker is only trusted for margins if it agrees with the engine)
let agree = 0; for (const x of selfRows) { const rk = rank(x.form); if ((rk.top ? rk.top.id : null) === x.got || (x.lane === "deflection" && !rk.top)) agree++; }
assert(agree === selfRows.length, "the margin ranker agrees with the real engine on every form (fresh matcher)", selfRows.length);
const fragile = selfRows.filter(x => x.ok && x.by !== "sole" && x.margin !== null && x.margin <= 2).sort((a, b) => a.margin - b.margin || a.id.localeCompare(b.id));
const coinFlips = selfRows.filter(x => x.margin === 0);
// dedupe by FORM (a collided form appears once per claimant row)
const uniq = (rows) => { const m = {}; for (const x of rows) if (!m[x.form]) m[x.form] = x; return Object.values(m); };
const tiedForms = uniq(coinFlips);
const byMlen = tiedForms.filter(x => x.by === "mlen"), byIdTie = tiedForms.filter(x => x.by === "id");
log("  score-tied forms (distinct): " + tiedForms.length + " -> decided by MATCHED LENGTH (the engine's specificity rule; the longer, more specific form wins; deterministic): " + byMlen.length + " · decided by ALPHABETICAL ID (a true coin flip): " + byIdTie.length + " · forms winning by a margin of 1..2: " + uniq(fragile.filter(x => x.margin > 0)).length);
for (const x of byIdTie) log("    coin flip: " + JSON.stringify(x.form) + " claimed by " + [...new Set(forms.filter(f => f.form === x.form).map(f => f.id))].join(" + ") + " -> " + x.got + " (alphabetical)");
report.sections.ambiguity = { collided, score_tied: tiedForms.map(x => ({ id: x.id, form: x.form, got: x.got, second: x.second, by: x.by, ok: x.ok })), coin_flips_by_id: byIdTie.length, specificity_ties_by_mlen: byMlen.length, fragile_wins: fragile.map(x => ({ id: x.id, form: x.form, margin: x.margin, by: x.by, second: x.second })) };

// ======================================================================
// 5. REACHABILITY — MISS_THRESHOLD inertness + per-entry profile
// ======================================================================
log("== 5 reachability ==");
const minScore = Math.min(...forms.map(f => CONST.BASE[f.mode] + f.weight));
const minResp = Math.min(...forms.filter(f => f.cls === "response").map(f => CONST.BASE[f.mode] + f.weight));
assert(minScore >= CONST.MISS_THRESHOLD, "MISS_THRESHOLD (" + CONST.MISS_THRESHOLD + ") is INERT on this corpus: the smallest possible match score is " + minScore + " (responses: " + minResp + "); scores are a MAX, never a sum", forms.length);
const profile = Object.values(perEntry).filter(p => p.forms > 0);
const exactOnly = profile.filter(p => p.exact_only);
const single = profile.filter(p => p.self === 1);
log("  entries with patterns=" + profile.length + " · exact-only (must be typed verbatim)=" + exactOnly.length + " · exactly ONE self-retrieving form=" + single.length + " · zero=" + deadFresh.length);
report.sections.reachability = { min_score: minScore, min_response_score: minResp, threshold: CONST.MISS_THRESHOLD, exact_only: exactOnly.map(p => p.id), single_form: single.map(p => p.id), profile };

// ======================================================================
// 6. MUTATION — brittleness
// ======================================================================
log("== 6 mutation ==");
const CONTR = [["youre", "you are"], ["im", "i am"], ["dont", "do not"], ["cant", "cannot"], ["isnt", "is not"], ["doesnt", "does not"],
               ["whats", "what is"], ["thats", "that is"], ["wont", "will not"], ["didnt", "did not"], ["arent", "are not"], ["youve", "you have"],
               ["ive", "i have"], ["theyre", "they are"], ["wasnt", "was not"], ["havent", "have not"], ["wouldnt", "would not"], ["couldnt", "could not"],
               ["shouldnt", "should not"], ["theres", "there is"], ["heres", "here is"], ["youd", "you would"], ["youll", "you will"], ["lets", "let us"], ["hasnt", "has not"]];
const LEAD = ["hey ", "can you ", "i want to ", "so ", "ok ", "what about ", "tell me ", "i think "];
const TRAIL = [" please", " right", " though", " lol"];
function tokReplace(text, from, to) { const t = text.split(" "); let hit = false; const out = t.map(x => x === from ? (hit = true, to) : x); return hit ? out.join(" ") : null; }
function phraseReplace(text, from, to) { const s = " " + text + " ", f = " " + from + " "; return s.indexOf(f) === -1 ? null : s.replace(f, " " + to + " ").trim().replace(/\s+/g, " "); }
function mutants(form) {
  const out = []; const toks = form.split(" ");
  for (const [c, x] of CONTR) { const a = tokReplace(form, c, x); if (a) out.push(["expand", a]); const b = phraseReplace(form, x, c); if (b) out.push(["contract", b]); }
  const last = toks[toks.length - 1];
  if (/^[a-z]+$/.test(last)) out.push(["plural", toks.slice(0, -1).concat([last.endsWith("s") && last.length > 3 ? last.slice(0, -1) : last + "s"]).join(" ")]);
  if (toks.length >= 2 && toks[0] !== toks[1]) out.push(["order", [toks[1], toks[0]].concat(toks.slice(2)).join(" ")]);
  for (const l of LEAD) out.push(["lead", l + form]);
  for (const t of TRAIL) out.push(["trail", form + t]);
  const li = toks.reduce((b, t, i) => t.length > toks[b].length ? i : b, 0); const L = toks[li];
  if (L.length >= 4) {
    const m = L.length >> 1;
    out.push(["typo-del", toks.map((t, i) => i === li ? L.slice(0, m) + L.slice(m + 1) : t).join(" ")]);
    out.push(["typo-swap", toks.map((t, i) => i === li ? L.slice(0, m) + L[m + 1] + L[m] + L.slice(m + 2) : t).join(" ")]);
    out.push(["typo-dup", toks.map((t, i) => i === li ? L.slice(0, m) + L[m] + L.slice(m) : t).join(" ")]);
  }
  // hyphenated compound: the normalization law DELETES hyphens with no substitution, so "cherry-picking" -> "cherrypicking",
  // which can never match a spaced form; measure how often a visitor's hyphen kills the match
  if (toks.length >= 2) out.push(["hyphen", toks[0] + "-" + toks[1] + (toks.length > 2 ? " " + toks.slice(2).join(" ") : "")]);
  // controls: MUST be no-ops under the normalization law
  out.push(["ctl-upper", form.toUpperCase()]); out.push(["ctl-punct", form + "?"]); out.push(["ctl-space", form.replace(/ /g, "  ") + " "]);
  const ap = tokReplace(form, "youre", "you're") || tokReplace(form, "dont", "don't") || tokReplace(form, "im", "i'm") || tokReplace(form, "cant", "can't") || tokReplace(form, "isnt", "isn't") || tokReplace(form, "whats", "what's") || tokReplace(form, "thats", "that's");
  if (ap) out.push(["ctl-apostrophe", ap]);
  return out;
}
const mut = {}; const wrongAnswer = []; let ctlFail = 0, ctlN = 0;
const bareWin = {}; for (const x of selfRows) bareWin[x.form] = x.got;
for (const f of forms) {
  if (f.cls === "crisis") continue; // the floor is measured in section 2, not mutated here
  for (const [kind, text] of mutants(f.form)) {
    const r = route(text); const same = r.id === bareWin[f.form];
    const key = kind + "|" + f.mode; const k = (mut[key] = mut[key] || { kind, mode: f.mode, n: 0, survived: 0, deflected: 0, wrong: 0, crisis: 0 });
    k.n++; if (same) k.survived++; else if (r.lane === "deflection") k.deflected++; else if (r.lane === "crisis") k.crisis++; else { k.wrong++; wrongAnswer.push({ id: f.id, form: f.form, mode: f.mode, kind, text, got: r.id, lane: r.lane }); }
    if (kind.startsWith("ctl-")) { ctlN++; if (!same) ctlFail++; }
  }
}
assert(ctlFail === 0, "normalization controls (case / trailing punctuation / whitespace) are no-ops for every non-crisis form", ctlN);
const mutTable = Object.values(mut).sort((a, b) => a.kind.localeCompare(b.kind) || a.mode.localeCompare(b.mode)).map(k => ({ ...k, survive_pct: +(k.survived / k.n * 100).toFixed(1) }));
for (const k of mutTable) if (!k.kind.startsWith("ctl-")) log("  " + (k.kind + "/" + k.mode).padEnd(22) + " n=" + String(k.n).padStart(5) + "  survive=" + String(k.survive_pct).padStart(5) + "%  deflect=" + k.deflected + "  WRONG-ANSWER=" + k.wrong + "  crisis=" + k.crisis);
log("  wrong-answer mutants (a mutated form landing on a DIFFERENT non-deflection entry): " + wrongAnswer.length);
// which entries act as catch-alls: a wrong answer is usually a NESTED FALLBACK — the mutant still contains a shorter form of another entry
const catchAll = {};
for (const w of wrongAnswer) {
  const landing = byId[w.got]; const t = normalize(w.text);
  const via = (landing.patterns || []).filter(p => YO.patternMatch(p, t)).map(p => p.form).sort((a, b) => b.length - a.length)[0] || null;
  const nested = via !== null && YO.wordBoundaryContains(via, w.form);
  w.via = via; w.nested_fallback = nested;
  const c = (catchAll[w.got] = catchAll[w.got] || { landing: w.got, n: 0, nested: 0, via: {} }); c.n++; if (nested) c.nested++; c.via[via] = (c.via[via] || 0) + 1;
}
const catchRows = Object.values(catchAll).sort((a, b) => b.n - a.n).map(c => ({ ...c, via: Object.entries(c.via).sort((a, b) => b[1] - a[1]).map(([f, k]) => f + " x" + k).join(", ") }));
for (const c of catchRows) log("    catch-all " + c.landing.padEnd(28) + " n=" + String(c.n).padStart(3) + " nested-fallback=" + c.nested + "  via " + c.via);
report.sections.mutation = { table: mutTable, wrong_answer: wrongAnswer, catch_all: catchRows, controls: { n: ctlN, failed: ctlFail } };

// ======================================================================
// 7. SUBJECT COVERAGE — what the site is about vs what the proxy can field
// ======================================================================
log("== 7 subject coverage ==");
const SI = JSON.parse(fs.readFileSync(SINDEX, "utf8")).entries;
const V = JSON.parse(fs.readFileSync(VENDOR, "utf8")).objections;
const signed = {}; for (const e of E) if (e.position) (signed[e.position.objection_id] = signed[e.position.objection_id] || []).push(e.id);
const probes = []; const seen = new Set();
function addProbe(type, text, meta) { const n = normalize(text); if (n.length < 2 || seen.has(type + "|" + n)) return; seen.add(type + "|" + n); probes.push({ type, text: n, raw: String(text), ...meta }); }
for (const s of SI) {
  if (s.type === "page" || s.type === "glossary" || s.type === "heading" || s.type === "void") addProbe(s.type, s.title, { route: s.route });
  else if (s.type === "library-objection") { const oid = s.route.split("#obj-")[1]; for (const alt of s.title.split(" / ")) addProbe("library-title", alt, { oid, signed: !!signed[oid] }); }
  else if (/-objection$/.test(s.type)) { const oid = s.route.split("#obj-")[1]; addProbe("aux-wing-id", oid.replace(/-/g, " "), { wing: s.type, oid }); }
}
for (const o of V) for (const k of (o.keywords || [])) addProbe("library-keyword", k, { oid: o.id, signed: !!signed[o.id] });
// K303 (TX17-BACK section 1): a GAP is not one thing. Three distinct miss classes were
// being reported as one deflection, and misfiling one as another sends the work to the
// wrong seat -- which is exactly what happened to `cherry picking` in TX17.
//   class1 form-absent      the objection IS signed; no declared form matches. BUILD WORK.
//   class2 normalizer-eaten a form exists and the input path destroyed it. K299 closed
//                           this class; the audit now proves it stays closed rather than
//                           assuming it. Detected mechanically: the RAW probe contains a
//                           declared form of the signed objection, the NORMALIZED one does not.
//   class3 objection-absent no signed position exists. Commissioning question for the
//                           library seat, and a position only Josiah can sign.
// Only class 3 is the library seat's to fill. 1 and 2 are ours.
const formsByObj = {};
for (const e of E) if (e.position) for (const q of (e.patterns || []))
  (formsByObj[e.position.objection_id] = formsByObj[e.position.objection_id] || []).push(q.form);
// K303b (TX18-BACK section 4): computed from the OBJECTION SPACE, never from the
// landing entry.  The seat asked which it was, and the bad branch was the true one:
// mg-topical-deflect-01 is class "response", so a probe it catches stopped being a
// GAP and silently left the class-1 count.  MEASURED: adding one token (`happy`) to
// the net moved class1 415 -> 412 while ZERO positions became reachable.  A floor
// that hides the gap it caught makes the counter mean less every time it grows.
// The test is now landing-independent: does ANY entry of this objection score > 0
// against this probe?  Scored with the engine's own entryScore, so it cannot drift
// from the matcher, and it is unaffected by whatever else the corpus grows.
const entriesByObj = {};
for (const e of E) if (e.position) (entriesByObj[e.position.objection_id] = entriesByObj[e.position.objection_id] || []).push(e);
function ownFormMatches(p) {
  return (entriesByObj[p.oid] || []).some(e => entryScore(e, p.text)[0] > 0);
}
function missClass(p) {
  if (!p.oid) return "n/a";                       // page/glossary/heading/void probes have no objection
  if (!signed[p.oid]) return "class3-objection-absent";
  if (ownFormMatches(p)) return null;             // reachable by its own objection: not a miss at all
  // class 2 means the NORMALIZER destroyed a match that was there before it ran.
  // Test it with the engine on both sides -- a naive substring test on the raw string
  // is not the same predicate and false-positives on plurals (it flagged the library's
  // own title "first world problems" against the declared singular "first world
  // problem", which is whole-token-distinct and therefore a class-1 form gap).
  const rawLower = String(p.raw == null ? p.text : p.raw).toLowerCase();
  if (rawLower !== p.text && (entriesByObj[p.oid] || []).some(e => entryScore(e, rawLower)[0] > 0))
    return "class2-normalizer-eaten";
  return "class1-form-absent";
}
const subj = probes.map(p => { const r = route(p.text); const pos = r.id && byId[r.id].position ? byId[r.id].position.objection_id : null;
  let verdict; if (r.lane === "deflection") verdict = "GAP"; else if (r.lane === "crisis") verdict = "crisis"; else if (r.lane === "oracle") verdict = "oracle"; else if (pos && p.oid && pos === p.oid) verdict = "own-position"; else if (pos && p.oid) verdict = "OTHER-position"; else verdict = "response";
  return { ...p, id: r.id, lane: r.lane, verdict, miss_class: missClass(p) }; });
const byType = {}; for (const s of subj) { const t = (byType[s.type] = byType[s.type] || { type: s.type, n: 0, GAP: 0, oracle: 0, response: 0, "own-position": 0, "OTHER-position": 0, crisis: 0 }); t.n++; t[s.verdict]++; }
for (const t of Object.values(byType)) log("  " + t.type.padEnd(16) + " n=" + String(t.n).padStart(4) + "  GAP=" + String(t.GAP).padStart(4) + "  oracle=" + String(t.oracle).padStart(3) + "  response=" + String(t.response).padStart(3) + "  own-pos=" + String(t["own-position"]).padStart(3) + "  OTHER-pos=" + t["OTHER-position"] + "  crisis=" + t.crisis);
// K303: the GAP column, split by whose work it is
const mc = {}; for (const s2 of subj) if (s2.miss_class) mc[s2.miss_class] = (mc[s2.miss_class] || 0) + 1;
log("  -- GAP by miss class (K303): " + Object.keys(mc).sort().map(k => k + "=" + mc[k]).join("  ") || "  (no gaps)");
log("     class1 form-absent = signed, no form matches -> OURS.  class2 normalizer-eaten -> OURS (K299 closed it; a nonzero count is a REGRESSION).  class3 objection-absent -> library seat + Josiah.");
const c1 = subj.filter(s2 => s2.miss_class === "class1-form-absent");
const c1obj = {}; for (const s2 of c1) (c1obj[s2.oid] = c1obj[s2.oid] || []).push(s2.raw || s2.text);
log("     class1 spans " + Object.keys(c1obj).length + " signed objection(s); the phrasings are the K302 fold's own input list.");
const masked = c1.filter(s2 => s2.lane !== "deflection");
const maskedBy = {}; for (const s2 of masked) maskedBy[s2.id] = (maskedBy[s2.id] || 0) + 1;
log("     of those, " + masked.length + " are MASKED -- caught by a floor or another entry, so they no longer look like gaps: " + (Object.keys(maskedBy).sort((a, b) => maskedBy[b] - maskedBy[a]).slice(0, 4).map(k => k + "=" + maskedBy[k]).join(" ") || "none"));
log("     (this count is landing-INDEPENDENT by construction: growing a floor can no longer shrink it.)");
assert((mc["class2-normalizer-eaten"] || 0) === 0, "class2 (normalizer-eaten) is EMPTY -- K299 stays closed", mc["class2-normalizer-eaten"] || 0);
report.sections.miss_classes = { counts: mc, class1_by_objection: c1obj };
// per-objection table: the library's own phrasing of each objection, where does it land?
const perObj = {};
for (const s of subj.filter(s => s.type === "library-title" || s.type === "library-keyword")) {
  const o = (perObj[s.oid] = perObj[s.oid] || { oid: s.oid, signed: !!signed[s.oid], titles: 0, keywords: 0, own: 0, other: 0, oracle: 0, response: 0, gap: 0, crisis: 0, other_ids: [], gap_titles: [], oracle_titles: [] });
  if (s.type === "library-title") o.titles++; else o.keywords++;
  if (s.verdict === "own-position") o.own++; else if (s.verdict === "OTHER-position") { o.other++; o.other_ids.push(s.text + "->" + s.id); } else if (s.verdict === "oracle") { o.oracle++; if (s.type === "library-title") o.oracle_titles.push(s.text + "->" + s.id); } else if (s.verdict === "response") o.response++; else if (s.verdict === "crisis") o.crisis++; else { o.gap++; if (s.type === "library-title") o.gap_titles.push(s.text); }
}
const objRows = Object.values(perObj).sort((a, b) => (b.signed - a.signed) || a.oid.localeCompare(b.oid));
const signedRows = objRows.filter(o => o.signed);
const signedNoOwn = signedRows.filter(o => o.own === 0);
log("  library objections probed=" + objRows.length + " · signed=" + signedRows.length + " · signed but NO library phrasing/keyword reaches its own position=" + signedNoOwn.length + (signedNoOwn.length ? " -> " + signedNoOwn.map(o => o.oid).join(", ") : ""));
const signedTitleGaps = signedRows.filter(o => o.gap_titles.length);
log("  signed objections with at least one library TITLE phrasing that deflects=" + signedTitleGaps.length + " (candidate trigger forms for the persona seat; " + signedTitleGaps.reduce((a, o) => a + o.gap_titles.length, 0) + " phrasings)");
const crossPos = subj.filter(s => s.verdict === "OTHER-position");
log("  library phrasings that land on a DIFFERENT objection's position (wrong answer): " + crossPos.length);
for (const s of crossPos) log("    " + JSON.stringify(s.text) + " (" + s.oid + ") -> " + s.id);
report.sections.subject = { by_type: Object.values(byType), rows: subj, per_objection: objRows, signed_no_own: signedNoOwn.map(o => o.oid), signed_title_gaps: signedTitleGaps.map(o => ({ oid: o.oid, gap_titles: o.gap_titles, oracle_titles: o.oracle_titles })), cross_position: crossPos };

// ======================================================================
// 8. HELP INTENTS
// ======================================================================
log("== 8 help intents ==");
const HELP = ["help", "help me", "what can i ask", "what can i ask you", "what can you do", "what do you do", "commands", "list commands", "menu", "options",
              "what do you know", "what should i ask", "what can i say", "how does this work", "how do i talk to you", "what are you for", "what is this",
              "instructions", "topics", "what can we talk about", "give me a list", "show me what you can answer", "?", "hello what can you do",
              "can you help", "help please", "need help", "i need some help", "what do you cover", "what questions can i ask", "what can you answer", "what are the rules"];
const helpRows = HELP.map(q => { const r = route(q); return { q, lane: r.lane, id: r.id, snippet: r.id ? String(byId[r.id].response || "").slice(0, 90) : null }; });
for (const h of helpRows) log("  " + JSON.stringify(h.q).padEnd(34) + " -> " + (h.id || "deflection").padEnd(26) + " [" + h.lane + "]");
report.sections.help = helpRows;

// ======================================================================
// 9. DYNAMICS — multi-turn behaviour
// ======================================================================
log("== 9 dynamics ==");
const m3 = fresh(); const hello3 = [1, 2, 3].map(() => route("hello", m3).id);
log("  'hello' x3 on one matcher -> " + hello3.join(" , "));
const m4 = fresh(); const rot = []; rot.push(route("hello", m4).id); for (const f of ["one", "two", "three", "four", "five"]) route(f, m4); rot.push(route("hello", m4).id); for (const f of ["six", "seven", "eight", "nine", "ten"]) route(f, m4); rot.push(route("hello", m4).id);
log("  'hello' spaced 5 distinct turns apart x3 -> " + rot.join(" , ") + "  (greeting rotation is reachable only this way)");
const m5 = fresh(); const hiRot = []; hiRot.push(route("hi", m5).id); for (const f of ["one", "two", "three", "four", "five"]) route(f, m5); hiRot.push(route("hi", m5).id);
log("  'hi' then 5 distinct turns then 'hi' -> " + hiRot.join(" , ") + "  (the only greeting path to the Latin greet mg-greet-04 besides its own forms welcome/salve/good day)");
// exhaustive: can ANY schedule of "hello" turns reach mg-greet-04? Try every pair of gaps 1..12 between three hellos.
let helloReaches04 = false, sched = null;
for (let g1 = 1; g1 <= 12 && !helloReaches04; g1++) for (let g2 = 1; g2 <= 12 && !helloReaches04; g2++) {
  const m = fresh(); route("hello", m); for (let i = 0; i < g1 - 1; i++) route("filler " + i, m); route("hello", m); for (let i = 0; i < g2 - 1; i++) route("filler b" + i, m);
  if (route("hello", m).id === "mg-greet-04") { helloReaches04 = true; sched = [g1, g2]; }
}
log("  can three 'hello's on ANY schedule (gaps 1..12) reach mg-greet-04? " + (helloReaches04 ? "yes at gaps " + sched : "NO — the repeat lane and the dampening window never align; 'hello' cannot reach the Latin greet"));
// rephrase-within-window: for every entry with >=2 self-retrieving forms, ask form A then form B on ONE matcher
let reN = 0, reSame = 0, reOther = 0, reDefl = 0; const reOtherRows = [];
for (const e of E) {
  const own = selfRows.filter(x => x.id === e.id && x.ok); if (own.length < 2) continue;
  const m = fresh(); route(own[0].form, m); const r = route(own[1].form, m); reN++;
  if (r.id === e.id) reSame++; else if (r.lane === "deflection") reDefl++; else { reOther++; reOtherRows.push({ id: e.id, a: own[0].form, b: own[1].form, got: r.id, lane: r.lane }); }
}
log("  rephrase within the dampening window (form A then form B of the SAME entry): entries=" + reN + " -> same=" + reSame + " deflection=" + reDefl + " OTHER entry=" + reOther);
report.sections.dynamics = { hello_x3: hello3, hello_rotation: rot, hi_rotation: hiRot, hello_can_reach_greet04: helloReaches04, rephrase: { n: reN, same: reSame, deflection: reDefl, other: reOther, other_rows: reOtherRows } };

// ======================================================================
// write
// ======================================================================
report.meta.fatal = fatal;
fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
const md = [];
md.push("# Successor proxy — coverage audit (K295)");
md.push("");
md.push("corpus `" + report.meta.corpus + "` · engine `" + report.meta.engine + "` · entries " + E.length + " · patterns " + forms.length + " · fresh Matcher per probe · measure-only");
md.push("");
md.push("## Findings (numbers; the reading is in the K295 stratum)");
md.push("");
md.push("- Crisis floor: fires by construction at stage 1 (any hit, score>0, no threshold, before every other lane); bare " + bare.filter(x => x.ok).length + "/" + bare.length + ", embedded " + embedded.filter(x => x.ok).length + "/" + embedded.length + ", repeated ×4 and post-conversation all crisis. The floor's own coverage of adjacent distress phrasings: " + (adj.length - adjMiss.length) + "/" + adj.length + " (§2).");
md.push("- Self-match (control): " + selfRate + "% — every failure is a declared collision or the floor arbitrating with itself; undeclared steals: " + steals.length + " (§3).");
md.push("- Ambiguity: " + collided.length + " declared collisions; " + byIdTie.length + " true coin flips (score-tied, decided by alphabetical id: " + byIdTie.map(x => "`" + x.form + "`").join(", ") + "); " + byMlen.length + " score ties decided by matched length, i.e. the specificity rule working (§4).");
md.push("- Reachability: `MISS_THRESHOLD` is inert (min score " + minScore + "); no entry is unreachable fresh; " + exactOnly.length + " entries are exact-only (§5).");
md.push("- Hyphens: the normalization law deletes them with no substitution, so a hyphenated compound survives " + (mutTable.find(k => k.kind === "hyphen" && k.mode === "contains") || {}).survive_pct + "% of the time on `contains` forms (§6); typed apostrophes (`you're`, `don't`) are no-ops by the same law (control).");
md.push("- Brittleness: `contains` forms survive a leading filler " + (mutTable.find(k => k.kind === "lead" && k.mode === "contains") || {}).survive_pct + "% and a trailing one " + (mutTable.find(k => k.kind === "trail" && k.mode === "contains") || {}).survive_pct + "%; `exact` forms survive a leading filler " + (mutTable.find(k => k.kind === "lead" && k.mode === "exact") || {}).survive_pct + "%; contraction expansion survives " + (mutTable.find(k => k.kind === "expand" && k.mode === "contains") || {}).survive_pct + "%; word order " + (mutTable.find(k => k.kind === "order" && k.mode === "contains") || {}).survive_pct + "%; one-edit typos ≈" + (mutTable.find(k => k.kind === "typo-del" && k.mode === "contains") || {}).survive_pct + "% (§6).");
md.push("- Subject coverage: " + objRows.length + " library objections, " + signedRows.length + " signed; " + signedNoOwn.length + " signed objections that no library phrasing or keyword reaches; " + signedTitleGaps.length + " signed objections with deflecting title phrasings (candidate triggers); " + crossPos.length + " cross-position landings (§7).");
md.push("- Help: " + helpRows.filter(h => h.lane === "deflection").length + "/" + helpRows.length + " help-shaped inputs deflect (§8).");
md.push("- Dynamics: a rephrase of the same response entry within the 8-turn dampening window deflects for " + reDefl + "/" + reN + " entries (§9).");
md.push("");
md.push("## 1 Calibration (" + calRows.filter(c => c.ok).length + "/" + calRows.length + ")");
md.push(""); md.push("| input | expected | got | lane |"); md.push("|---|---|---|---|");
for (const c of calRows) md.push("| `" + c.q + "` | `" + c.want + "` | `" + c.got + "` | " + c.lane + (c.ok ? "" : " **MISMATCH**") + " |");
md.push(""); md.push("## 2 Crisis floor");
md.push(""); md.push("- **How it fires:** " + structural.stage); md.push("- **Why weight 9 is not the score:** " + structural.scoring);
md.push("- bare forms -> crisis: " + bare.filter(x => x.ok).length + "/" + bare.length + " · embedded/stacked -> crisis: " + embedded.filter(x => x.ok).length + "/" + embedded.length + " · repeated x4 on one matcher: " + rep.map(x => x.lane).join(",") + " · after an oracle + a position hit: " + afterConv.lane);
md.push("- bare token probes: " + tokProbe.map(x => "`" + x.q + "`->" + x.lane).join(" · "));
md.push(""); md.push("**The floor's own coverage — adjacent phrasings NOT declared (report-only; the floor is a ratified surface shared with Yūrei):** " + (adj.length - adjMiss.length) + "/" + adj.length + " reach crisis.");
md.push(""); md.push("| phrasing | lane | entry |"); md.push("|---|---|---|");
for (const x of adjMiss) md.push("| `" + x.q + "` | " + x.lane + " | `" + (x.id || "—") + "` |");
md.push(""); md.push("## 3 Self-match (control) — " + selfRate + "% (" + (forms.length - selfFail.length) + "/" + forms.length + ")");
md.push(""); md.push("| entry | form | mode/w | routes to | lane | margin | tie by | kind |"); md.push("|---|---|---|---|---|--:|---|---|");
for (const x of selfFail) md.push("| `" + x.id + "` | `" + x.form + "` | " + x.mode + "/" + x.weight + " | `" + (x.got || "—") + "` | " + x.lane + " | " + x.margin + " | " + x.by + " | " + x.kind + " |");
md.push(""); md.push("Entries with patterns but ZERO self-retrieving forms on a fresh matcher: " + (deadFresh.length ? deadFresh.map(p => "`" + p.id + "`").join(", ") : "none") + ".");
md.push(""); md.push("## 4 Ambiguity");
md.push(""); md.push("| form | claimants | winner | lane | margin | decided by |"); md.push("|---|---|---|---|--:|---|");
for (const c of collided) md.push("| `" + c.form + "` | " + c.claimants.map(s => "`" + s + "`").join(", ") + " | `" + c.winner + "` | " + c.lane + " | " + c.margin + " | " + c.by + (c.intra_entry_only ? " (intra-entry, benign)" : "") + " |");
md.push(""); md.push("Score-tied forms (distinct): " + tiedForms.length + " — " + byMlen.length + " decided by matched length (the specificity rule: the longer form wins over the shorter one it contains; deterministic, and the intended behaviour), " + byIdTie.length + " decided by alphabetical id (true coin flips). Winning by a margin of 2 or less: " + fragile.length + ".");
if (tiedForms.length) { md.push(""); md.push("| entry | form | routes to | runner-up | decided by | self-match |"); md.push("|---|---|---|---|---|---|"); for (const x of tiedForms) md.push("| `" + x.id + "` | `" + x.form + "` | `" + x.got + "` | `" + x.second + "` | " + (x.by === "mlen" ? "matched length (specificity)" : "**alphabetical id**") + " | " + (x.ok ? "ok" : "**FAIL**") + " |"); }
md.push(""); md.push("## 5 Reachability");
md.push(""); md.push("`MISS_THRESHOLD` = " + CONST.MISS_THRESHOLD + " is inert: the smallest possible match score is " + minScore + " (responses " + minResp + "). Scores are a MAX over matching patterns, never a sum — the kickoff's \"threshold headroom\" axis cannot exist. Entries with patterns " + profile.length + " · exact-only " + exactOnly.length + " · exactly one self-retrieving form " + single.length + " · zero " + deadFresh.length + ".");
if (exactOnly.length) md.push("\nExact-only (typed verbatim or nothing): " + exactOnly.map(p => "`" + p.id + "`").join(", "));
if (single.length) md.push("\nOne self-retrieving form: " + single.map(p => "`" + p.id + "`").join(", "));
md.push(""); md.push("## 6 Mutation (survival = the mutant still retrieves what the bare form retrieves)");
md.push(""); md.push("| mutation | mode | n | survive % | deflected | WRONG answer | crisis |"); md.push("|---|---|--:|--:|--:|--:|--:|");
for (const k of mutTable) md.push("| " + k.kind + " | " + k.mode + " | " + k.n + " | " + k.survive_pct + " | " + k.deflected + " | " + k.wrong + " | " + k.crisis + " |");
md.push(""); md.push("Wrong-answer mutants (a mutated form landing on a DIFFERENT non-deflection entry): " + wrongAnswer.length + ", of which " + wrongAnswer.filter(w => w.nested_fallback).length + " are NESTED FALLBACKS — the broken form still contains a shorter form of the entry it fell to. The catch-alls:");
md.push(""); md.push("| landing entry | wrong answers | nested fallbacks | via form |"); md.push("|---|--:|--:|---|");
for (const c of catchRows) md.push("| `" + c.landing + "` | " + c.n + " | " + c.nested + " | " + c.via + " |");
if (wrongAnswer.length) { md.push(""); md.push("| entry | bare form | mutation | mutant | landed on | via | nested |"); md.push("|---|---|---|---|---|---|---|"); for (const w of wrongAnswer.slice(0, 80)) md.push("| `" + w.id + "` | `" + w.form + "` | " + w.kind + " | `" + w.text + "` | `" + w.got + "` | `" + w.via + "` | " + (w.nested_fallback ? "yes" : "no") + " |"); if (wrongAnswer.length > 80) md.push("\n… " + (wrongAnswer.length - 80) + " more in the JSON."); }
md.push(""); md.push("## 7 Subject coverage (what wuld.ink is about vs what the proxy can field)");
md.push(""); md.push("| source | n | GAP (deflection) | oracle | response | own position | OTHER position | crisis |"); md.push("|---|--:|--:|--:|--:|--:|--:|--:|");
for (const t of Object.values(byType)) md.push("| " + t.type + " | " + t.n + " | " + t.GAP + " | " + t.oracle + " | " + t.response + " | " + t["own-position"] + " | " + t["OTHER-position"] + " | " + t.crisis + " |");
md.push(""); md.push("### 7a The library's own phrasing of each objection — where it lands (signed first)");
md.push(""); md.push("| objection | signed | titles | keywords | own pos | other pos | oracle | response | GAP |"); md.push("|---|---|--:|--:|--:|--:|--:|--:|--:|");
for (const o of objRows) md.push("| `" + o.oid + "` | " + (o.signed ? "yes" : "—") + " | " + o.titles + " | " + o.keywords + " | " + o.own + " | " + o.other + " | " + o.oracle + " | " + o.response + " | " + o.gap + " |");
md.push(""); md.push("Signed objections that NO library phrasing or keyword reaches: " + (signedNoOwn.length ? signedNoOwn.map(o => "`" + o.oid + "`").join(", ") : "none") + ". Cross-position landings: " + crossPos.length + ".");
md.push(""); md.push("### 7a′ Signed objections whose library TITLE phrasings deflect — candidate trigger forms (persona-seat lane, ratified; not a build call)");
md.push(""); md.push("| objection | deflecting library phrasings | phrasings that route to the library oracle instead |"); md.push("|---|---|---|");
for (const o of signedTitleGaps) md.push("| `" + o.oid + "` | " + o.gap_titles.map(t => "`" + t + "`").join(" · ") + " | " + (o.oracle_titles.length ? o.oracle_titles.map(t => "`" + t + "`").join(" · ") : "—") + " |");
if (crossPos.length) { md.push(""); md.push("| phrasing | belongs to | landed on |"); md.push("|---|---|---|"); for (const s of crossPos) md.push("| `" + s.text + "` | `" + s.oid + "` | `" + s.id + "` |"); }
md.push(""); md.push("### 7b GAP list — subjects the site discusses that the proxy deflects");
md.push(""); md.push("Full lists for the site's declared subjects (page / glossary / void / library-title); headings, library keywords and aux-wing ids are structural or single-word and are sampled here (complete in the JSON).");
md.push(""); md.push("| type | subject |"); md.push("|---|---|");
const CAP = { heading: 40, "library-keyword": 40, "aux-wing-id": 60 }; const capN = {};
for (const s of subj.filter(s => s.verdict === "GAP")) { const lim = CAP[s.type]; capN[s.type] = (capN[s.type] || 0) + 1; if (lim && capN[s.type] > lim) continue; md.push("| " + s.type + " | `" + s.text + "`" + (s.oid ? " (" + s.oid + (s.signed === false ? ", unsigned" : "") + ")" : "") + " |"); }
for (const [t, lim] of Object.entries(CAP)) if ((capN[t] || 0) > lim) md.push("| " + t + " | _… " + (capN[t] - lim) + " more in the JSON_ |");
md.push(""); md.push("## 8 Help intents");
md.push(""); md.push("| input | routes to | lane | response (first 90 chars) |"); md.push("|---|---|---|---|");
for (const h of helpRows) md.push("| `" + h.q + "` | `" + (h.id || "—") + "` | " + h.lane + " | " + (h.snippet ? h.snippet.replace(/\|/g, "\\|") : "—") + " |");
md.push(""); md.push("## 9 Dynamics");
md.push(""); md.push("- `hello` ×3 on one matcher: " + hello3.map(x => "`" + x + "`").join(" → "));
md.push("- `hello` spaced five distinct turns apart ×3: " + rot.map(x => "`" + x + "`").join(" → "));
md.push("- `hi`, five distinct turns, `hi`: " + hiRot.map(x => "`" + x + "`").join(" → ") + " — can any schedule of three `hello`s reach `mg-greet-04` (the Latin greet)? **" + (helloReaches04 ? "yes" : "no") + "**.");
md.push("- Rephrase within the 8-turn dampening window (form A then form B of the same entry, one matcher): " + reN + " entries → same entry " + reSame + " · deflection " + reDefl + " · a different entry " + reOther + ".");
md.push("");
md.push("fatal assertions: " + fatal);
fs.writeFileSync(OUT.replace(/\.json$/, "") + ".md", md.join("\n") + "\n");
log("wrote " + OUT + " + " + OUT.replace(/\.json$/, "") + ".md   fatal=" + fatal);
process.exit(fatal ? 1 : 0);
