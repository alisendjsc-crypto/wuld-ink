/* =============================================================================
 * wuld.ink comment board — Cloudflare Worker
 * -----------------------------------------------------------------------------
 * One global board. Anonymous-or-named. Owned-stack (Workers + D1 + Access).
 * Zero third-party tracking. Store raw, escape on render.
 *
 * Routes:
 *   GET  /api/comments?board=global          public list (visible only; NO email/ip)
 *   POST /api/comments                       create (honeypot + rate-limit + caps)
 *   GET  /admin   (and /admin/)              RETIRED (K222): 302 -> admin.wuld.ink/#sec-cmod
 *   POST /api/admin/*                        RETIRED (K222): 410 Gone -- moderation
 *                                            moved to the admin worker's /api/cmod/*
 *                                            (same D1; parity verified 2026-07-11)
 *
 * Security posture:
 *   - email is PRIVATE: never returned by the public API, never rendered publicly.
 *     It surfaces ONLY in the Access-gated /admin view.
 *   - raw IP is never stored; only a salted SHA-256 (IP_SALT secret).
 *   - admin routes: Cloudflare Access is the edge gate. The Worker ALSO verifies
 *     the Access JWT (cryptographically if ACCESS_TEAM_DOMAIN + ACCESS_AUD are set,
 *     else it requires the Access header to be present) AND enforces a same-origin
 *     check on mutations (CSRF defense).
 * ===========================================================================*/

const RATE_LIMIT_MAX = 5;            // posts per window per ip_hash
const RATE_LIMIT_WINDOW_MS = 60_000; // 60s
const MAX_BODY = 2000;
const MAX_NAME = 80;
const MAX_EMAIL = 254;
const LIST_LIMIT = 500;

/* Yūrei Gap Log — visitor lane (Build 1.5b). Privacy floor === 1.5a: ZERO
 * identity is ever stored (no IP, no session/cookie/UA). Toggle-gated by the D1
 * setting `gaplog_visitor_open` (default CLOSED). Public surface logs MISSES
 * only; thin/novel/repetitive stay admin-only. */
const GAPLOG_PERSONA = "yurei";
const GAPLOG_MAX_ITEMS = 20;           // items accepted per POST (public lane is low-volume)
const GAPLOG_RATE_MAX = 12;            // miss-writes per window per ephemeral ip-hash
const GAPLOG_RATE_WINDOW_MS = 60_000;  // 60s

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method.toUpperCase();

    try {
      // ---- Public API: list + create ------------------------------------
      if (pathname === "/api/comments") {
        if (method === "OPTIONS") return preflight(env, request);
        if (method === "GET") return listComments(url, env, request);
        if (method === "POST") return createComment(request, env);
        return json({ error: "method_not_allowed" }, 405, cors(env, request));
      }

      // ---- Public API: Yūrei Gap Log — visitor-lane coverage logging (1.5b)
      // Toggle-gated (default CLOSED) + honeypot + same-origin + ephemeral rate
      // belt + length caps + server RE-scrub. ZERO identity stored; closed ->
      // 200 no-op. GET returns only the visitor-open boolean.
      if (pathname === "/api/gaplog") {
        if (method === "OPTIONS") return preflight(env, request);
        if (method === "GET") return gaplogStatus(env, request);
        if (method === "POST") return createGaplog(request, env);
        return json({ error: "method_not_allowed" }, 405, cors(env, request));
      }

      // ---- Admin moderation UI: RETIRED (K222) --------------------------
      // Moderation lives at admin.wuld.ink section 14 (COMMENTS_DB, same D1;
      // operator parity verified). adminHtml/verifyAccess stay in-file as
      // dead code deliberately (smallest blast radius).
      if (pathname === "/admin" || pathname === "/admin/") {
        return Response.redirect("https://admin.wuld.ink/#sec-cmod", 302);
      }

      // ---- Admin actions: RETIRED (K222) — 410 Gone ---------------------
      if (pathname.startsWith("/api/admin/")) {
        return json({ error: "gone", moved: "https://admin.wuld.ink/#sec-cmod" }, 410);
      }

      return json({ error: "not_found" }, 404);
    } catch (err) {
      return json({ error: "server_error", detail: String(err && err.message || err) }, 500);
    }
  },
};

/* ----------------------------- settings (kill-switch) -------------------- */
// board_open lives in the D1 `settings` table (K46). Fail-OPEN: if the table is
// missing (migration not yet run) or a read errors, treat the board as OPEN so a
// transient hiccup never bricks posting.
async function getSetting(env, key, fallback) {
  try {
    const row = await env.DB.prepare(`SELECT value FROM settings WHERE key = ?`).bind(key).first();
    return row && typeof row.value === "string" ? row.value : fallback;
  } catch {
    return fallback;
  }
}
async function setSetting(env, key, value) {
  await env.DB.prepare(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`
  ).bind(key, String(value)).run();
}
async function isBoardOpen(env) {
  const v = await getSetting(env, "board_open", "1");
  return v !== "0"; // anything but an explicit "0" is open
}
// Gap-log visitor lane: DEFAULT CLOSED. The lane is inert (logs nothing) until
// the operator explicitly opens it from the admin worker (disclosure-first gate).
async function isGaplogVisitorOpen(env) {
  return (await getSetting(env, "gaplog_visitor_open", "0")) === "1";
}

/* ----------------------------- public: list ----------------------------- */
async function listComments(url, env, request) {
  const board = (url.searchParams.get("board") || "global").slice(0, 64);
  const { results } = await env.DB.prepare(
    `SELECT id, name, body, created_at
       FROM comments
      WHERE board = ? AND hidden = 0
      ORDER BY created_at DESC, id DESC
      LIMIT ${LIST_LIMIT}`
  ).bind(board).all();
  const open = await isBoardOpen(env);
  return json({ board, comments: results || [], open }, 200, cors(env, request));
}

/* ---------------------------- public: create ----------------------------- */
async function createComment(request, env) {
  let data;
  try { data = await request.json(); }
  catch { return json({ error: "invalid_json" }, 400, cors(env, request)); }

  // Kill-switch (K46): when the board is closed, refuse all new posts.
  if (!(await isBoardOpen(env))) {
    return json({ error: "board_closed" }, 403, cors(env, request));
  }

  // Honeypot: a bot filled the hidden field. Return a benign success; store nothing.
  if (typeof data.hp === "string" && data.hp.trim() !== "") {
    return json({ ok: true }, 200, cors(env, request));
  }

  const body = typeof data.body === "string" ? data.body.trim() : "";
  const name = typeof data.name === "string" ? data.name.trim().slice(0, MAX_NAME) : "";
  const email = typeof data.email === "string" ? data.email.trim().slice(0, MAX_EMAIL) : "";
  const board = (typeof data.board === "string" ? data.board.trim() : "global").slice(0, 64) || "global";

  if (body.length < 1) return json({ error: "empty_body" }, 400, cors(env, request));
  if (body.length > MAX_BODY) return json({ error: "body_too_long", max: MAX_BODY }, 400, cors(env, request));
  if (email && !looksLikeEmail(email)) return json({ error: "bad_email" }, 400, cors(env, request));

  // Salted IP hash — raw IP never stored.
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ipHash = await sha256Hex((env.IP_SALT || "no-salt-set") + "|" + ip);

  // Rate limit by ip_hash over the window.
  const since = Date.now() - RATE_LIMIT_WINDOW_MS;
  const recent = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM comments WHERE ip_hash = ? AND created_at > ?`
  ).bind(ipHash, since).first();
  if (recent && recent.n >= RATE_LIMIT_MAX) {
    return json({ error: "rate_limited", retry_after_s: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) }, 429, cors(env, request));
  }

  const now = Date.now();
  const res = await env.DB.prepare(
    `INSERT INTO comments (board, name, email, body, created_at, ip_hash)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(board, name || null, email || null, body, now, ipHash).run();

  const id = res.meta && res.meta.last_row_id;
  // Return ONLY the public projection (no email, no ip_hash).
  return json({ comment: { id, name: name || null, body, created_at: now } }, 201, cors(env, request));
}

/* --------------------- public: Yūrei Gap Log (1.5b) ---------------------- */
// PII scrub — byte-identical to the admin Worker's gaplogScrub AND the public
// widget's client copy (privacy floor: ONE scrub, three call-sites). Mechanical
// only: strips emails, links, @handles, and long digit runs; caps length.
function gaplogScrub(s) {
  s = String(s == null ? "" : s);
  s = s.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[email]");
  s = s.replace(/\bhttps?:\/\/\S+/gi, "[url]");
  s = s.replace(/\bwww\.\S+/gi, "[url]");
  s = s.replace(/(^|\s)@[A-Za-z0-9_]{2,}/g, "$1[handle]");
  s = s.replace(/\+?\d[\d\s().\-]{6,}\d/g, "[number]");
  s = s.replace(/\s+/g, " ").trim();
  return s.slice(0, 500);
}
// Phoenix (UTC-7, no DST) day-granular stamp — matches the 1.5a store exactly.
function gaplogToday() {
  return new Date(Date.now() - 7 * 3600 * 1000).toISOString().slice(0, 10);
}

// Ephemeral, per-isolate rate belt keyed on a SALTED ip-hash. LIMITING ONLY —
// the hash is NEVER written to a gap_log row (privacy fence) and there is no
// table: it lives in module memory and resets on isolate recycle. Best-effort;
// the load-bearing belts are the toggle + consent + honeypot + caps + origin.
const GAPLOG_RATE = new Map();
function gaplogRateOk(ipHash) {
  const now = Date.now();
  const since = now - GAPLOG_RATE_WINDOW_MS;
  let hits = (GAPLOG_RATE.get(ipHash) || []).filter((t) => t > since);
  if (hits.length >= GAPLOG_RATE_MAX) { GAPLOG_RATE.set(ipHash, hits); return false; }
  hits.push(now);
  GAPLOG_RATE.set(ipHash, hits);
  if (GAPLOG_RATE.size > 5000) {               // bound memory: prune empty buckets
    for (const [k, v] of GAPLOG_RATE) {
      const f = v.filter((t) => t > since);
      if (f.length) GAPLOG_RATE.set(k, f); else GAPLOG_RATE.delete(k);
    }
  }
  return true;
}

// GET /api/gaplog — the visitor-open flag ONLY (a single boolean). The widget
// reads it on boot and won't POST when closed; createGaplog re-checks too.
async function gaplogStatus(env, request) {
  return json({ open: await isGaplogVisitorOpen(env) }, 200, cors(env, request));
}

// POST /api/gaplog  {items:[{lane:'miss',content_scrubbed,class}]}
// Mirrors the 1.5a admin /api/gaplog/log MISS contract, minus admin auth/CSRF.
// Closed toggle -> 200 no-op. Only the MISS lane is accepted here.
async function createGaplog(request, env) {
  // Toggle gate (default CLOSED) -> 200 no-op; store nothing.
  if (!(await isGaplogVisitorOpen(env))) {
    return json({ ok: true, logged: 0, closed: true }, 200, cors(env, request));
  }
  let data;
  try { data = await request.json(); }
  catch { return json({ error: "invalid_json" }, 400, cors(env, request)); }

  // Honeypot: a bot filled the hidden field. Benign success; store nothing.
  if (typeof data.hp === "string" && data.hp.trim() !== "") {
    return json({ ok: true, logged: 0 }, 200, cors(env, request));
  }
  // CSRF: the widget POSTs same-origin from wuld.ink. Reject cross-origin writes.
  if (!sameOrigin(request, env)) {
    return json({ error: "csrf_origin_mismatch" }, 403, cors(env, request));
  }

  // Ephemeral rate belt on a salted ip-hash (LIMIT ONLY; never stored).
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const ipHash = await sha256Hex((env.IP_SALT || "no-salt-set") + "|gaplog|" + ip);
  if (!gaplogRateOk(ipHash)) {
    return json({ error: "rate_limited", retry_after_s: Math.ceil(GAPLOG_RATE_WINDOW_MS / 1000) }, 429, cors(env, request));
  }

  const items = Array.isArray(data.items) ? data.items : (data && data.lane ? [data] : []);
  if (!items.length) {
    return json({ error: "bad_json", hint: "{items:[{lane:'miss',content_scrubbed,class}]}" }, 400, cors(env, request));
  }

  const today = gaplogToday();
  let logged = 0, skipped = 0;
  for (let i = 0; i < items.length && i < GAPLOG_MAX_ITEMS; i++) {
    const it = items[i] || {};
    if (it.lane !== "miss") { skipped++; continue; }          // public lane logs MISSES only
    const content = gaplogScrub(it.content_scrubbed);          // server RE-scrub (defense in depth)
    if (!content) { skipped++; continue; }
    const cls = it.class === "all_damped" ? "all_damped" : "below_threshold";
    // 1.5c share-context: an OPTIONAL scrubbed transcript. RE-scrub every line
    // (defense in depth — identical scrub), cap to the last 40, store as JSON.
    let ctx = null;
    if (Array.isArray(it.context_scrubbed) && it.context_scrubbed.length) {
      const lines = it.context_scrubbed.slice(-40).map(function (x) { return gaplogScrub(x); }).filter(function (x) { return x; });
      if (lines.length) ctx = JSON.stringify(lines);
    }
    try {
      await env.DB.prepare(
        "INSERT INTO gap_log_miss (persona, content_scrubbed, class, count, first_date, last_date, resolved, context_scrubbed) VALUES (?,?,?,1,?,?,0,?) " +
        "ON CONFLICT(persona, content_scrubbed) DO UPDATE SET count = count + 1, last_date = excluded.last_date, class = excluded.class, " +
        "context_scrubbed = CASE WHEN excluded.context_scrubbed IS NOT NULL AND excluded.context_scrubbed <> '' THEN excluded.context_scrubbed ELSE gap_log_miss.context_scrubbed END"
      ).bind(GAPLOG_PERSONA, content, cls, today, today, ctx).run();
      logged++;
    } catch (e) { skipped++; }                                 // table absent / transient -> fail-safe no-op
  }
  return json({ ok: true, logged, skipped }, 200, cors(env, request));
}

/* ---------------------------- admin: actions ----------------------------- */
async function adminAction(action, request, env) {
  let data;
  try { data = await request.json(); }
  catch { return json({ error: "invalid_json" }, 400); }

  // ---- Board-wide actions (no single comment id) ------------------------
  if (action === "board-state") {
    const open = data.open === true || data.open === 1 || data.open === "1" || data.open === "true";
    await setSetting(env, "board_open", open ? "1" : "0");
    return json({ ok: true, open });
  }
  if (action === "purge") {
    const scope = String(data.scope || "");
    if (scope === "hide-all") {
      const r = await env.DB.prepare(`UPDATE comments SET hidden = 1 WHERE hidden = 0`).run();
      return json({ ok: true, scope, affected: (r.meta && r.meta.changes) || 0 });
    }
    if (scope === "delete-hidden") {
      const r = await env.DB.prepare(`DELETE FROM comments WHERE hidden = 1`).run();
      return json({ ok: true, scope, affected: (r.meta && r.meta.changes) || 0 });
    }
    if (scope === "delete-all") {
      const r = await env.DB.prepare(`DELETE FROM comments`).run();
      return json({ ok: true, scope, affected: (r.meta && r.meta.changes) || 0 });
    }
    return json({ error: "bad_scope" }, 400);
  }

  // ---- Per-comment actions (require a valid id) -------------------------
  const id = parseInt(data.id, 10);
  if (!Number.isInteger(id) || id < 1) return json({ error: "bad_id" }, 400);

  if (action === "hide") {
    await env.DB.prepare(`UPDATE comments SET hidden = 1 WHERE id = ?`).bind(id).run();
    return json({ ok: true, id, hidden: 1 });
  }
  if (action === "unhide") {
    await env.DB.prepare(`UPDATE comments SET hidden = 0 WHERE id = ?`).bind(id).run();
    return json({ ok: true, id, hidden: 0 });
  }
  if (action === "delete") {
    await env.DB.prepare(`DELETE FROM comments WHERE id = ?`).bind(id).run();
    return json({ ok: true, id, deleted: true });
  }
  if (action === "edit") {
    const body = typeof data.body === "string" ? data.body.trim() : "";
    if (body.length < 1) return json({ error: "empty_body" }, 400);
    if (body.length > MAX_BODY) return json({ error: "body_too_long", max: MAX_BODY }, 400);
    await env.DB.prepare(`UPDATE comments SET body = ? WHERE id = ?`).bind(body, id).run();
    return json({ ok: true, id, edited: true });
  }
  return json({ error: "unknown_action" }, 404);
}

/* --------------------------- admin: moderation UI ------------------------ */
async function adminHtml(env, adminEmail) {
  const boardOpen = await isBoardOpen(env);
  const { results } = await env.DB.prepare(
    `SELECT id, board, name, email, body, created_at, hidden
       FROM comments
      ORDER BY created_at DESC, id DESC
      LIMIT 1000`
  ).all();
  const rows = results || [];
  const visible = rows.filter((r) => !r.hidden).length;
  const hidden = rows.length - visible;

  const cards = rows.map((r) => {
    const when = new Date(r.created_at).toISOString().replace("T", " ").slice(0, 16) + " UTC";
    const nm = r.name ? esc(r.name) : "<span class='anon'>anonymous</span>";
    const em = r.email
      ? `<a class="email" href="mailto:${esc(r.email)}">${esc(r.email)}</a>`
      : "<span class='anon'>&mdash; no email</span>";
    return `
    <article class="cmt ${r.hidden ? "is-hidden" : ""}" data-id="${r.id}">
      <div class="cmt-meta">
        <span class="cmt-id">#${r.id}</span>
        <span class="cmt-name">${nm}</span>
        <span class="cmt-email">${em}</span>
        <span class="cmt-when">${when}</span>
        <span class="cmt-board">${esc(r.board)}</span>
        ${r.hidden ? '<span class="cmt-flag">HIDDEN</span>' : ""}
      </div>
      <textarea class="cmt-body" data-id="${r.id}">${esc(r.body)}</textarea>
      <div class="cmt-actions">
        <button class="act act-save" data-id="${r.id}">save edit</button>
        ${r.hidden
          ? `<button class="act act-unhide" data-id="${r.id}">unhide</button>`
          : `<button class="act act-hide" data-id="${r.id}">hide</button>`}
        <button class="act act-del" data-id="${r.id}">delete</button>
        <span class="act-status" data-id="${r.id}"></span>
      </div>
    </article>`;
  }).join("\n");

  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>moderation :: wuld.ink board</title>
<style>
  :root{--bg:#0a0a0a;--raised:#141414;--fg:#f0ebe5;--dim:#8a857d;--accent:#c41e3a;--rule:#2a2a2a;--mono:'IBM Plex Mono','SF Mono',Menlo,Consolas,monospace}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--mono);font-size:14px;line-height:1.5;padding:2rem 1.25rem 5rem;max-width:60rem;margin-inline:auto}
  h1{font-size:1.1rem;letter-spacing:.18em;text-transform:uppercase;color:var(--accent);margin:0 0 .25rem}
  .sub{color:var(--dim);font-size:.78rem;letter-spacing:.08em;margin-bottom:2rem;border-bottom:1px solid var(--rule);padding-bottom:1rem}
  .sub b{color:var(--fg);font-weight:400}
  .cmt{border:1px solid var(--rule);background:var(--raised);padding:1rem;margin-bottom:1rem}
  .cmt.is-hidden{opacity:.55;border-style:dashed}
  .cmt-meta{display:flex;flex-wrap:wrap;gap:.25rem 1rem;font-size:.72rem;color:var(--dim);letter-spacing:.05em;margin-bottom:.6rem;align-items:baseline}
  .cmt-id{color:var(--accent)}
  .cmt-name{color:var(--fg)}
  .cmt-email a{color:var(--accent);text-decoration:none;border-bottom:1px dotted var(--accent)}
  .anon{font-style:italic;color:var(--dim)}
  .cmt-flag{color:#fff;background:var(--accent);padding:0 .4rem;letter-spacing:.12em}
  .cmt-body{width:100%;min-height:3.5rem;background:var(--bg);color:var(--fg);border:1px solid var(--rule);font-family:var(--mono);font-size:.85rem;line-height:1.5;padding:.6rem;resize:vertical}
  .cmt-actions{display:flex;gap:.5rem;margin-top:.6rem;align-items:center;flex-wrap:wrap}
  .act{font-family:var(--mono);font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;background:var(--bg);color:var(--fg);border:1px solid var(--rule);padding:.35rem .7rem;cursor:pointer}
  .act:hover{border-color:var(--accent);color:var(--accent)}
  .act-del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .act-status{font-size:.7rem;color:var(--dim)}
  .empty{color:var(--dim);font-style:italic}
  .ctl{border:1px solid var(--rule);background:var(--raised);padding:1rem 1rem .6rem;margin-bottom:1.5rem}
  .ctl-row{display:flex;gap:.6rem;align-items:center;flex-wrap:wrap;margin:.3rem 0 .5rem}
  .ctl-label{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);min-width:3.5rem}
  .ctl-state{font-size:.78rem;letter-spacing:.12em;padding:0 .45rem;border:1px solid var(--rule)}
  .ctl-state.is-open{color:var(--fg);border-color:var(--rule)}
  .ctl-state.is-closed{color:#fff;background:var(--accent);border-color:var(--accent)}
  .ctl-hint{font-size:.68rem;color:var(--dim);font-style:italic}
  .act-danger:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
</style></head><body>
<h1>moderation</h1>
<p class="sub">signed in as <b>${esc(adminEmail || "operator")}</b> &middot; <b>${rows.length}</b> total &middot; <b>${visible}</b> visible &middot; <b>${hidden}</b> hidden &middot; store-raw / escape-on-render</p>
<section class="ctl" aria-label="Board controls">
  <div class="ctl-row">
    <span class="ctl-label">board</span>
    <span class="ctl-state ${boardOpen ? "is-open" : "is-closed"}" id="board-state">${boardOpen ? "OPEN" : "CLOSED"}</span>
    <button class="act" id="btn-toggle" data-open="${boardOpen ? "1" : "0"}">${boardOpen ? "close board" : "open board"}</button>
    <span class="ctl-hint">closing refuses new posts instantly &mdash; the thread stays readable</span>
  </div>
  <div class="ctl-row">
    <span class="ctl-label">purge</span>
    <button class="act" id="btn-hide-all">hide all visible</button>
    <button class="act" id="btn-del-hidden">delete hidden</button>
    <button class="act act-danger" id="btn-del-all">delete ALL</button>
    <span class="act-status" id="purge-status"></span>
  </div>
</section>
${rows.length ? cards : '<p class="empty">no comments yet.</p>'}
<script>
const post=async(action,payload)=>{
  const r=await fetch('/api/admin/'+action,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
  if(!r.ok){let d={};try{d=await r.json()}catch(e){} throw new Error(d.error||('HTTP '+r.status));}
  return r.json();
};
const setStatus=(id,msg)=>{const el=document.querySelector('.act-status[data-id="'+id+'"]');if(el)el.textContent=msg;};
document.addEventListener('click',async(e)=>{
  const b=e.target.closest('.act');if(!b)return;
  if(b.closest('.ctl'))return; // control-panel buttons are wired separately below
  const id=parseInt(b.dataset.id,10);
  try{
    if(b.classList.contains('act-save')){
      const ta=document.querySelector('.cmt-body[data-id="'+id+'"]');
      await post('edit',{id,body:ta.value});setStatus(id,'saved');
    }else if(b.classList.contains('act-hide')){
      await post('hide',{id});location.reload();
    }else if(b.classList.contains('act-unhide')){
      await post('unhide',{id});location.reload();
    }else if(b.classList.contains('act-del')){
      if(!confirm('Hard-delete comment #'+id+'? This cannot be undone. (Use hide for reversible removal.)'))return;
      await post('delete',{id});location.reload();
    }
  }catch(err){setStatus(id,'error: '+err.message);}
});
// ---- board controls: kill-switch + purge (K46) ----
const ctlStatus=(m)=>{const el=document.getElementById('purge-status');if(el)el.textContent=m;};
const tgl=document.getElementById('btn-toggle');
if(tgl)tgl.addEventListener('click',async()=>{
  const willOpen=tgl.dataset.open==='0';
  if(!willOpen&&!confirm('Close the board? New posts are refused immediately. The thread stays readable; reopen here any time.'))return;
  try{await post('board-state',{open:willOpen});location.reload();}
  catch(err){ctlStatus('error: '+err.message);}
});
const purge=async(scope)=>{
  try{const r=await post('purge',{scope});ctlStatus(scope+': '+(r.affected||0)+' affected');setTimeout(()=>location.reload(),800);}
  catch(err){ctlStatus('error: '+err.message);}
};
const hb=document.getElementById('btn-hide-all');
if(hb)hb.addEventListener('click',()=>{if(confirm('Hide ALL visible comments? Reversible - unhide individually, or delete the hidden pile later.'))purge('hide-all');});
const dh=document.getElementById('btn-del-hidden');
if(dh)dh.addEventListener('click',()=>{if(confirm('Permanently delete every HIDDEN comment? This cannot be undone.'))purge('delete-hidden');});
const da=document.getElementById('btn-del-all');
if(da)da.addEventListener('click',()=>{const t=prompt('This permanently deletes EVERY comment on the board. Type  DELETE ALL  to confirm:');if(t==='DELETE ALL')purge('delete-all');else ctlStatus('delete-all cancelled');});
</script>
</body></html>`;
}

/* ------------------------------- Access gate ----------------------------- */
async function verifyAccess(request, env) {
  const token =
    request.headers.get("Cf-Access-Jwt-Assertion") ||
    cookie(request, "CF_Authorization");

  // No token at all -> Access is not in front of this route (or was bypassed).
  if (!token) {
    return { ok: false, reason: "no_access_token (is Cloudflare Access gating /admin and /api/admin/*?)" };
  }

  // Strong path: cryptographic verification when team domain + AUD are configured.
  if (env.ACCESS_TEAM_DOMAIN && env.ACCESS_AUD) {
    const payload = await verifyAccessJwt(token, env);
    if (!payload) return { ok: false, reason: "jwt_invalid" };
    if (env.ADMIN_EMAIL && payload.email && payload.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      return { ok: false, reason: "not_admin" };
    }
    return { ok: true, email: payload.email };
  }

  // Fallback: header present and Access is the gate. Email is best-effort from the
  // unverified payload (display only). Strongly recommend setting the env vars.
  const claims = decodeJwtPayload(token);
  return { ok: true, email: claims && claims.email, weak: true };
}

async function verifyAccessJwt(token, env) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  let header, payload;
  try {
    header = JSON.parse(b64urlToString(h));
    payload = JSON.parse(b64urlToString(p));
  } catch { return null; }

  const certsUrl = `https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`;
  let jwks;
  try { jwks = await (await fetch(certsUrl, { cf: { cacheTtl: 3600 } })).json(); }
  catch { return null; }
  const jwk = (jwks.keys || []).find((k) => k.kid === header.kid);
  if (!jwk) return null;

  let key;
  try {
    key = await crypto.subtle.importKey(
      "jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
    );
  } catch { return null; }

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5", key, b64urlToBytes(s), new TextEncoder().encode(`${h}.${p}`)
  );
  if (!valid) return null;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) return null;
  if (payload.nbf && payload.nbf > now + 60) return null;
  if (payload.iss && payload.iss !== `https://${env.ACCESS_TEAM_DOMAIN}`) return null;
  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!auds.includes(env.ACCESS_AUD)) return null;
  return payload;
}

/* -------------------------------- helpers -------------------------------- */
function json(obj, status = 200, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
}

function cors(env, request) {
  const origin = request.headers.get("Origin");
  const allowed = env.ALLOWED_ORIGIN || "";
  // Same-origin (no Origin header) needs no CORS. Cross-origin only if it matches.
  if (origin && allowed && origin === allowed) {
    return {
      "Access-Control-Allow-Origin": allowed,
      "Vary": "Origin",
    };
  }
  return {};
}

function preflight(env, request) {
  const origin = request.headers.get("Origin");
  const allowed = env.ALLOWED_ORIGIN || "";
  const headers = { "Vary": "Origin" };
  if (origin && allowed && origin === allowed) {
    headers["Access-Control-Allow-Origin"] = allowed;
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "content-type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return new Response(null, { status: 204, headers });
}

function sameOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) {
    // Some browsers omit Origin on same-origin GET, but admin mutations are fetch POSTs
    // which DO send Origin. Treat a missing Origin on a mutation as suspicious unless
    // Sec-Fetch-Site says same-origin.
    return request.headers.get("Sec-Fetch-Site") === "same-origin";
  }
  try {
    const host = new URL(request.url).host;
    return new URL(origin).host === host || origin === env.ALLOWED_ORIGIN;
  } catch { return false; }
}

function looksLikeEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= MAX_EMAIL;
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const m = raw.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function decodeJwtPayload(token) {
  try { return JSON.parse(b64urlToString(token.split(".")[1])); }
  catch { return null; }
}

function b64urlToString(str) {
  return atob(b64urlPad(str));
}
function b64urlToBytes(str) {
  const bin = atob(b64urlPad(str));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function b64urlPad(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = str.length % 4;
  return pad ? str + "=".repeat(4 - pad) : str;
}

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
