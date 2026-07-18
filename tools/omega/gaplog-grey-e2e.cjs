"use strict";
/* gaplog-grey-e2e.cjs (K247) — Mr Grey persona-lane regression for the admin
 * gap-log machinery (worker sections 16/17). Zero deps beyond node:sqlite
 * (node >= 22; emits an ExperimentalWarning — harmless).
 *
 *   node tools/omega/gaplog-grey-e2e.cjs
 *
 * Proves, without a worker runtime (the K213/K246 extract pattern):
 *   A. STATIC — every gap_log statement persona-scoped; the wgl-persona
 *      chokepoint present; GAPLOG_SRC per-persona (mrgrey has NO oracle);
 *      client tags every write with its persona; Yurei defaults intact
 *      (seen key, TY.persona, log-line formats); no identity reads in the
 *      gap-log block; scrub PARITY across all three copies (admin server,
 *      admin client, comments worker) — ONE scrub, three call-sites.
 *   B. BEHAVIOR — gaplogPersona() unit vectors (absent/unknown -> 'yurei');
 *      scrub vectors; and a node:sqlite :memory: run of the EXACT SQL
 *      (composed from the worker's own source bytes) on the real schema:
 *      store-level lane isolation — a Yurei write/mod can never touch the
 *      Grey lane and vice versa; absent-persona writes land in Yurei
 *      byte-identically to pre-K247. */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..", "..");
const rd = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const src = rd("workers/admin/src/index.js");
const cw = rd("workers/comments/src/index.js");
const schema = rd("workers/admin/schema-gaplog.sql");
const corpus = JSON.parse(rd("src/components/omega-corpus-mrgrey.json"));

let pass = 0, fail = 0;
function ok(msg, cond, got) {
  if (cond) { pass++; }
  else { fail++; console.log("  FAIL: " + msg + (got !== undefined ? "  got: " + JSON.stringify(got).slice(0, 200) : "")); }
}
const norm = (s) => s.replace(/\s+/g, " ").trim();

/* ---------------- A. static: server ---------------- */
const mkr = src.match(/\/\* wgl-persona:begin[^*]*\*\/([\s\S]*?)\/\* wgl-persona:end \*\//);
ok("wgl-persona marker block present", !!mkr);
ok("old GAPLOG_PERSONA const fully retired", !/GAPLOG_PERSONA\b(?!S)/.test(src));
ok("gap_log_ occurrence count pinned (10 — no unaudited statement slipped in)", (src.match(/gap_log_/g) || []).length === 10, (src.match(/gap_log_/g) || []).length);

// GAPLOG_SRC per-persona
const srcMapM = src.match(/const GAPLOG_SRC = \{([\s\S]*?)\n\};/);
ok("GAPLOG_SRC present", !!srcMapM);
const yureiBlk = srcMapM && (srcMapM[1].match(/yurei: \{([\s\S]*?)\}/) || [])[1];
const greyBlk = srcMapM && (srcMapM[1].match(/mrgrey: \{([\s\S]*?)\}/) || [])[1];
ok("yurei lane: matcher + public + oracle corpora", !!yureiBlk && /yurei-oracle\.js/.test(yureiBlk) && /yurei-corpus-public\.json/.test(yureiBlk) && /yurei-corpus-oracle\.json/.test(yureiBlk));
ok("mrgrey lane: SAME matcher engine", !!greyBlk && /yurei-oracle\.js/.test(greyBlk));
ok("mrgrey lane: omega corpus wired", !!greyBlk && /omega-corpus-mrgrey\.json/.test(greyBlk));
ok("mrgrey lane: NO oracle corpus (no room tier)", !!greyBlk && !/corpus-oracle/.test(greyBlk));

// identity scan on the gap-log server block
const blk = src.slice(src.indexOf("API: Gap Log"), src.indexOf("API: manifest ops"));
ok("gap-log block spans located", blk.length > 2000, blk.length);
ok("no identity reads in the gap-log block (no headers/IP/UA)", !/cf-connecting-ip|user-agent|x-real-ip|request\.headers/i.test(blk));
ok("server RE-scrub retained on the miss path", /gaplogScrub\(it\.content_scrubbed\)/.test(blk));

/* ---------------- A. static: client ---------------- */
ok("TY defaults to the Yurei persona", /var TY = \{ persona:"yurei"/.test(src));
ok("Yurei seen-key EXACT (K228 data preserved)", src.includes('"wuld:admin-yurei-seen"'));
ok("Grey seen-key distinct", src.includes('"wuld:admin-mrgrey-seen"'));
ok("miss enqueue persona-tagged", /gapEnqueue\(\{ lane:"miss", persona: TY\.persona/.test(src));
ok("thin-hit enqueue persona-tagged", /gapEnqueue\(\{ lane:"hit", persona: TY\.persona/.test(src));
ok("vote clicks carry row persona", /persona: b\.getAttribute\("data-persona"\) \|\| TY\.persona/.test(src));
ok("mod posts carry row persona", /body = \{ id: id, persona:/.test(src));
ok("rows + export requests persona-scoped", (src.match(/"&persona=" \+ TY\.persona/g) || []).length >= 2);
ok("persona toggle markup (sec 16)", src.includes('id="ty-p-yurei"') && src.includes('id="ty-p-mrgrey"'));
ok("persona chip markup (sec 17)", src.includes('id="gl-persona"'));
ok("visitor-lane controls addressable (Yurei-only hide)", src.includes('id="gl-visitor-label"'));
ok("sec-16 retitled for both personas", src.includes("Testing Y&#363;rei / Mr&nbsp;Grey"));
ok("sec-17 scrub-parity copy surfaced", src.includes("every persona lane"));
ok("Yurei log-line format preserved (testing-<persona>: loaded)", src.includes('log("testing-" + p + ": loaded "'));

/* ---------------- A. scrub parity (ONE scrub, three call-sites) ---------------- */
const scrubRe = /function gaplogScrub\(s\) \{[\s\S]*?return s\.slice\(0, 500\);\s*\n\s*\}/g;
const adminCopies = src.match(scrubRe) || [];
ok("admin worker carries exactly 2 scrub copies (server + client)", adminCopies.length === 2, adminCopies.length);
// client copy lives inside the served template: its regex backslashes are DOUBLED
const clientCopy = adminCopies.find((c) => c.includes("\\\\b"));
const serverCopy = adminCopies.find((c) => !c.includes("\\\\b"));
const cwCopy = (cw.match(scrubRe) || [])[0];
const unesc = (s) => s.replace(/\\\\/g, "\\");
ok("scrub parity: admin server == comments worker", !!serverCopy && !!cwCopy && norm(serverCopy) === norm(cwCopy));
ok("scrub parity: admin client (unescaped) == admin server", !!serverCopy && !!clientCopy && norm(unesc(clientCopy)) === norm(serverCopy));

/* ---------------- B. gaplogPersona unit vectors ---------------- */
let gaplogPersona = null;
try { gaplogPersona = new Function(mkr[1] + "; return gaplogPersona;")(); } catch (e) { /* fall through */ }
ok("gaplogPersona extractable + callable", typeof gaplogPersona === "function");
if (gaplogPersona) {
  ok("persona: 'yurei' -> yurei", gaplogPersona("yurei") === "yurei");
  ok("persona: 'mrgrey' -> mrgrey", gaplogPersona("mrgrey") === "mrgrey");
  ok("persona: absent -> yurei (pre-K247 shape unchanged)", gaplogPersona(undefined) === "yurei" && gaplogPersona(null) === "yurei" && gaplogPersona("") === "yurei");
  ok("persona: unknown/forged -> yurei (allowlist, never invents lanes)",
    gaplogPersona("grey") === "yurei" && gaplogPersona("YUREI") === "yurei" && gaplogPersona("omega") === "yurei" && gaplogPersona({}) === "yurei" && gaplogPersona(0) === "yurei");
}

/* ---------------- B. scrub vectors (server copy) ---------------- */
let scrub = null;
try { scrub = new Function(serverCopy + "; return gaplogScrub;")(); } catch (e) { /* fall through */ }
ok("server scrub extractable + callable", typeof scrub === "function");
if (scrub) {
  ok("scrub: email", scrub("mail secret@example.com now") === "mail [email] now");
  ok("scrub: url", scrub("see https://a.b/c ok") === "see [url] ok");
  ok("scrub: handle", scrub("ping @someone please") === "ping [handle] please");
  ok("scrub: phone/number", scrub("call 555-123-4567 late") === "call [number] late");
  ok("scrub: 500-char cap", scrub("x".repeat(700)).length === 500);
  ok("scrub: whitespace collapse", scrub("  a\n\n b  ") === "a b");
}

/* ---------------- B. store-level isolation on the EXACT SQL ---------------- */
// Compose statements FROM the worker's own source bytes — the tested SQL is the shipped SQL.
const mIns = src.match(/"(INSERT INTO gap_log_miss[^"]+)" \+\s*\n?\s*"(ON CONFLICT\(persona, content_scrubbed\)[^"]+)"/);
const hIns = src.match(/"(INSERT INTO gap_log_hit[^"]+)" \+\s*\n?\s*"(ON CONFLICT\(persona, entry_id, kind\)[^"]+)"/);
const mSel = src.match(/"(SELECT id, content_scrubbed[^"]+)" \+ order \+ " LIMIT 2000"/);
const hSel = src.match(/"(SELECT id, entry_id[^"]+)" \+ order2 \+ " LIMIT 2000"/);
ok("all 4 core statements recovered from source", !!(mIns && hIns && mSel && hSel));
const RESOLVE = src.includes('"UPDATE gap_log_miss SET resolved = ? WHERE persona = ? AND id = ?"');
const REDACT = src.includes("\"UPDATE gap_log_miss SET content_scrubbed = '[redacted]' WHERE persona = ? AND id = ?\"");
const DROP = src.includes('"DELETE FROM " + tbl + " WHERE persona = ? AND id = ?"');
const EXPORT = src.includes('"SELECT * FROM " + tbl + " WHERE persona = ? ORDER BY count DESC, last_date DESC"');
ok("mod + export statements persona-bound in source", RESOLVE && REDACT && DROP && EXPORT);

if (mIns && hIns && mSel && hSel) {
  const { DatabaseSync } = require("node:sqlite");
  const db = new DatabaseSync(":memory:");
  db.exec(schema);
  const MISS_INSERT = mIns[1] + mIns[2];
  const HIT_INSERT = hIns[1] + hIns[2];
  const MISS_SELECT = mSel[1] + "count DESC, last_date DESC LIMIT 2000";
  const HIT_SELECT = hSel[1] + "count DESC, last_date DESC LIMIT 2000";
  const D = "2026-07-18";
  const ins = (p, c) => db.prepare(MISS_INSERT).run(p, c, "below_threshold", D, D);

  // a+b: same scrubbed content, two lanes -> two rows; upsert stays lane-local
  ins("yurei", "alpha"); ins("mrgrey", "alpha"); ins("yurei", "alpha");
  const yRows = db.prepare(MISS_SELECT).all("yurei");
  const gRows = db.prepare(MISS_SELECT).all("mrgrey");
  ok("iso: same content, two lanes -> two rows", yRows.length === 1 && gRows.length === 1);
  ok("iso: upsert counts lane-local (yurei x2, mrgrey x1)", yRows[0].count === 2 && gRows[0].count === 1, [yRows[0].count, gRows[0].count]);

  // hit lane isolation
  db.prepare(HIT_INSERT).run("yurei", "y-entry-1", "thin", D, D);
  db.prepare(HIT_INSERT).run("mrgrey", "mg-greet-01", "novel", D, D);
  ok("iso: hit lanes pure", db.prepare(HIT_SELECT).all("yurei").length === 1 && db.prepare(HIT_SELECT).all("mrgrey").length === 1);

  // e: cross-lane mod is a no-op (server-side persona binding, not UI courtesy)
  const gId = gRows[0].id, yId = yRows[0].id;
  const rx = db.prepare("UPDATE gap_log_miss SET resolved = ? WHERE persona = ? AND id = ?").run(1, "yurei", gId);
  ok("iso: resolve across lanes -> 0 changes", rx.changes === 0, rx.changes);
  const rok = db.prepare("UPDATE gap_log_miss SET resolved = ? WHERE persona = ? AND id = ?").run(1, "mrgrey", gId);
  ok("iso: resolve in-lane -> 1 change", rok.changes === 1);

  // f: cross-lane redact no-op; in-lane redact leaves the other lane's content intact
  const cx = db.prepare("UPDATE gap_log_miss SET content_scrubbed = '[redacted]' WHERE persona = ? AND id = ?").run("mrgrey", yId);
  ok("iso: redact across lanes -> 0 changes", cx.changes === 0);
  db.prepare("UPDATE gap_log_miss SET content_scrubbed = '[redacted]' WHERE persona = ? AND id = ?").run("mrgrey", gId);
  ok("iso: in-lane redact leaves the Yurei row intact",
    db.prepare(MISS_SELECT).all("yurei")[0].content_scrubbed === "alpha" &&
    db.prepare(MISS_SELECT).all("mrgrey")[0].content_scrubbed === "[redacted]");

  // g: cross-lane drop no-op
  const dx = db.prepare("DELETE FROM gap_log_miss WHERE persona = ? AND id = ?").run("yurei", gId);
  ok("iso: drop across lanes -> 0 changes", dx.changes === 0);

  // h: export select lane-pure
  const ex = db.prepare("SELECT * FROM gap_log_miss WHERE persona = ? ORDER BY count DESC, last_date DESC").all("yurei");
  ok("iso: export select lane-pure", ex.length === 1 && ex.every((r) => r.persona === "yurei"));

  // i: absent-persona write lands in Yurei exactly as pre-K247
  if (gaplogPersona) {
    ins(gaplogPersona(undefined), "beta");
    ok("iso: absent persona -> Yurei lane (regression)", db.prepare(MISS_SELECT).all("yurei").some((r) => r.content_scrubbed === "beta") && !db.prepare(MISS_SELECT).all("mrgrey").some((r) => r.content_scrubbed === "beta"));
  }

  // PII parity at the column level: a captured Grey row carries EXACTLY the Yurei fields
  const gRow = db.prepare(MISS_SELECT).all("mrgrey")[0];
  ok("pii: Grey miss row fields == Yurei baseline (id, content_scrubbed, class, count, dates, resolved)",
    JSON.stringify(Object.keys(gRow).sort()) === JSON.stringify(["class", "content_scrubbed", "count", "first_date", "id", "last_date", "resolved"]), Object.keys(gRow));
}

/* ---------------- B. mrgrey corpus sanity ---------------- */
const mg = corpus.yurei_corpus || {};
ok("mrgrey corpus: persona field 'mrgrey'", mg.persona === "mrgrey", mg.persona);
ok("mrgrey corpus: same engine schema (yurei_corpus root)", !!corpus.yurei_corpus);
ok("mrgrey corpus: entries present", Array.isArray(mg.entries) && mg.entries.length >= 1, (mg.entries || []).length);
ok("mrgrey corpus: all-public tier (disabled room toggle loses nothing)", (mg.entries || []).every((e) => e.tier === "public"));

console.log("gaplog-grey-e2e: " + pass + "/" + (pass + fail) + (fail ? " RED" : " GREEN"));
process.exit(fail ? 1 : 0);
