/* =============================================================================
 * wuld.ink gallery admin CMS — Cloudflare Worker (K85, admin-CMS arc session 2)
 * =============================================================================
 * Serves admin.wuld.ink (own custom domain; zero overlap with the comments
 * worker's wuld.ink/api/* + wuld.ink/admin* routes).
 *
 * WRITE CONTRACT = src/gallery/index.html head-comment schema:
 *   { schema_version: 1, media_base, updated: "YYYY-MM-DD",
 *     plates: [ { id, r2key, num, title, technique, body, epitaph,
 *                 series, order, tier: "standard"|"sealed",
 *                 content_flags: ["nsfw", ...], added: "YYYY-MM-DD" } ] }
 *   - tier "sealed" is RESERVED: the CMS may set the field; it never renders
 *     logic for it. In-room gating runs on content_flags — flagging an entry
 *     ["nsfw"] arms the dormant consent gate automatically (K83).
 *
 * SECURITY POSTURE (contra the comments worker's weak fallback — FAIL-CLOSED):
 *   - Cloudflare Access in front of EVERY route, UI included. JWT verified
 *     cryptographically (JWKS RS256, same machinery as workers/comments).
 *   - No team-domain/AUD configured -> 503 everything. No weak header path.
 *   - Email must equal ADMIN_EMAIL exactly. No bindings/PAT -> 503 that op.
 *   - Same-origin CSRF on all writes; best-effort per-isolate rate caps
 *     (Access is the real gate; the cap is a belt).
 *   - GITHUB_PAT is a wrangler secret. Never in repo bytes, never echoed.
 *
 * AUDIT TRAIL: every manifest mutation = one GitHub Contents API commit
 * (`gallery-admin: <op> <plate-id>`), sha optimistic-concurrency with one
 * conflict retry. Pages auto-deploys each commit. Rollback = git revert.
 *
 * POSTURE LOCKS (K83): NO donation gate ever on the gallery section; NO
 * self-built accounts (Access OTP only); all content AI-generated, no real
 * identifiable persons.
 *
 * K86 (arc session 3): SITE-EDIT vertical — ops.py patterns as endpoints.
 *   POST /api/site/preview + /api/site/commit (diff-confirm; sha-pinned —
 *   409 stale_preview on drift, no silent retry). Patterns this cut:
 *   video-watch · rec-card · text-swap · cache-bump. Single-file ops =
 *   Contents API; cache-bump = Git Data API one-commit sweep (ref CAS).
 *   Commit grain: `site-admin: <pattern> <detail>`.
 * ========================================================================== */

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MiB cap (plates run ~0.8 MB)
const ALLOWED_TYPES = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
};
const RATE_MAX_WRITES = 30;       // per window, per isolate (best-effort belt)
const RATE_WINDOW_MS = 60_000;
const VALID_TIERS = ["standard", "sealed"];
const KNOWN_FLAGS = ["nsfw"];     // advisory; unknown flags pass with a warning

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    // ---- FAIL-CLOSED: no Access config -> nothing answers ----------------
    if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || /REPLACE_ME/.test(env.ACCESS_AUD)) {
      return json({ error: "not_configured", detail: "ACCESS_TEAM_DOMAIN / ACCESS_AUD unset — Worker refuses to serve until Access is wired (README step 2)." }, 503);
    }

    // ---- Access gate on EVERY route (UI included) -------------------------
    const gate = await verifyAccess(request, env);
    if (!gate.ok) return json({ error: "forbidden", reason: gate.reason }, 403);

    try {
      if (request.method === "GET" && path === "/") {
        return html(adminHtml(env, gate.email));
      }
      if (request.method === "GET" && path === "/api/manifest") {
        return apiManifest(env);
      }
      if (request.method === "GET" && path === "/api/r2list") {
        return apiR2List(env, url);
      }
      if (request.method === "POST") {
        // CSRF + rate belt on every mutation.
        if (!sameOrigin(request)) return json({ error: "csrf_origin_mismatch" }, 403);
        const rl = rateCheck(gate.email);
        if (!rl.ok) return json({ error: "rate_capped", retry_in_s: rl.retryS }, 429);

        if (path === "/api/upload") return apiUpload(request, env);
        if (path === "/api/plate/add") return apiPlateAdd(request, env);
        if (path === "/api/plate/update") return apiPlateUpdate(request, env);
        if (path === "/api/plate/flag") return apiPlateFlag(request, env);
        if (path === "/api/plate/delete") return apiPlateDelete(request, env);
        if (path === "/api/site/preview") return apiSitePreview(request, env);
        if (path === "/api/site/commit") return apiSiteCommit(request, env);
      }
      return json({ error: "not_found" }, 404);
    } catch (e) {
      return json({ error: "internal", detail: String(e && e.message || e).slice(0, 300) }, 500);
    }
  },
};

/* ------------------------------ API: reads ------------------------------- */

async function apiManifest(env) {
  const got = await ghGetManifest(env);
  if (!got.ok) return json({ error: got.error, detail: got.detail }, got.status || 502);
  return json({ manifest: got.manifest, sha: got.sha });
}

async function apiR2List(env, url) {
  if (!env.GALLERY_BUCKET) return json({ error: "no_r2_binding" }, 503);
  const prefix = env.R2_PREFIX || "gallery/";
  const cursor = url.searchParams.get("cursor") || undefined;
  const listed = await env.GALLERY_BUCKET.list({ prefix, cursor, limit: 200 });
  return json({
    objects: listed.objects.map((o) => ({ key: o.key, size: o.size, uploaded: o.uploaded })),
    truncated: listed.truncated,
    cursor: listed.truncated ? listed.cursor : null,
  });
}

/* ------------------------------ API: upload ------------------------------ */

async function apiUpload(request, env) {
  if (!env.GALLERY_BUCKET) return json({ error: "no_r2_binding", detail: "R2 binding absent — fail closed." }, 503);

  let form;
  try { form = await request.formData(); }
  catch { return json({ error: "bad_multipart" }, 400); }

  const file = form.get("file");
  if (!file || typeof file === "string") return json({ error: "no_file" }, 400);
  if (file.size === 0) return json({ error: "empty_file" }, 400);
  if (file.size > MAX_UPLOAD_BYTES) return json({ error: "too_large", max_bytes: MAX_UPLOAD_BYTES }, 413);

  const declaredType = (file.type || "").toLowerCase();
  if (!ALLOWED_TYPES[declaredType]) {
    return json({ error: "type_not_allowed", allowed: Object.keys(ALLOWED_TYPES) }, 415);
  }

  // Magic-byte sniff — don't trust the declared type alone.
  const buf = await file.arrayBuffer();
  const sniffed = sniffImageType(new Uint8Array(buf));
  if (sniffed !== declaredType) {
    return json({ error: "content_mismatch", declared: declaredType, sniffed: sniffed || "unknown" }, 415);
  }

  // Key: sanitized stem + extension derived from the VERIFIED type.
  const rawStem = String(form.get("key") || file.name || "").replace(/\.[a-z0-9]+$/i, "");
  const stem = sanitizeStem(rawStem);
  if (!stem) return json({ error: "bad_key", detail: "stem sanitized to empty — supply [a-z0-9-]" }, 400);
  const key = (env.R2_PREFIX || "gallery/") + stem + "." + ALLOWED_TYPES[declaredType];

  // No silent overwrite.
  const overwrite = String(form.get("overwrite") || "") === "true";
  const existing = await env.GALLERY_BUCKET.head(key);
  if (existing && !overwrite) {
    return json({ error: "key_exists", key, size: existing.size, hint: "set overwrite=true to replace" }, 409);
  }

  await env.GALLERY_BUCKET.put(key, buf, { httpMetadata: { contentType: declaredType } });
  return json({
    ok: true, key, bytes: buf.byteLength, overwrote: Boolean(existing),
    url: (env.MEDIA_BASE || "https://audio.wuld.ink") + "/" + key,
  });
}

function sniffImageType(b) {
  if (b.length > 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  return null;
}

function sanitizeStem(s) {
  return String(s).toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/* --------------------------- API: manifest ops --------------------------- */
/* Pattern per op: GET manifest (content + sha) -> validate + mutate ->
 * PUT with sha (one conflict retry). One commit per CMS action (K85 AQ). */

async function apiPlateAdd(request, env) {
  const body = await readJson(request);
  if (!body) return json({ error: "bad_json" }, 400);
  const p = body.plate || {};

  return withManifest(env, async (manifest) => {
    const errs = [];
    const id = String(p.id || "").trim();
    if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(id)) errs.push("id: slug [a-z0-9-], 2-81 chars");
    if (manifest.plates.some((x) => x.id === id)) errs.push("id: already exists");
    const prefix = env.R2_PREFIX || "gallery/";
    const r2key = String(p.r2key || "").trim();
    if (!r2key.startsWith(prefix) || /\.\.|\/\//.test(r2key)) errs.push("r2key: must start '" + prefix + "', no traversal");
    const title = String(p.title || "").trim();
    if (!title) errs.push("title: required");
    let order = Number.isInteger(p.order) ? p.order : maxOrder(manifest) + 1;
    if (order < 1) errs.push("order: positive integer");
    const tier = p.tier ? String(p.tier) : "standard";
    if (!VALID_TIERS.includes(tier)) errs.push("tier: standard|sealed");
    const flags = normFlags(p.content_flags);
    if (errs.length) return { fail: json({ error: "validation", errors: errs }, 422) };

    // The entry must point at real bytes — block when the R2 object is
    // absent unless explicitly forced (upload-first is the intended flow).
    if (env.GALLERY_BUCKET && !body.force) {
      const head = await env.GALLERY_BUCKET.head(r2key);
      if (!head) return { fail: json({ error: "r2_object_missing", r2key, hint: "upload first, or pass force:true" }, 409) };
    }

    const plate = {
      id, r2key,
      num: String(p.num || "").trim() || romanize(order),
      title,
      technique: String(p.technique || "").trim(),
      body: String(p.body || "").trim(),
      epitaph: String(p.epitaph || "").trim(),
      series: String(p.series || "").trim(),
      order,
      tier,
      content_flags: flags,
      added: today(),
    };
    manifest.plates.push(plate);
    manifest.plates.sort((a, b) => a.order - b.order);
    return { message: "gallery-admin: add " + id, result: { ok: true, plate } };
  });
}

async function apiPlateUpdate(request, env) {
  const body = await readJson(request);
  if (!body) return json({ error: "bad_json" }, 400);
  const id = String(body.id || "").trim();
  const patch = body.patch || {};

  return withManifest(env, async (manifest) => {
    const plate = manifest.plates.find((x) => x.id === id);
    if (!plate) return { fail: json({ error: "not_found", id }, 404) };

    const errs = [];
    const editable = ["r2key", "num", "title", "technique", "body", "epitaph", "series", "order", "tier", "content_flags"];
    for (const k of Object.keys(patch)) {
      if (!editable.includes(k)) errs.push(k + ": not editable (id/added are fixed; delete+add to rekey)");
    }
    if ("r2key" in patch) {
      const prefix = env.R2_PREFIX || "gallery/";
      if (!String(patch.r2key).startsWith(prefix) || /\.\.|\/\//.test(String(patch.r2key))) errs.push("r2key: must start '" + prefix + "'");
    }
    if ("order" in patch && (!Number.isInteger(patch.order) || patch.order < 1)) errs.push("order: positive integer");
    if ("tier" in patch && !VALID_TIERS.includes(String(patch.tier))) errs.push("tier: standard|sealed");
    if ("title" in patch && !String(patch.title).trim()) errs.push("title: required");
    if (errs.length) return { fail: json({ error: "validation", errors: errs }, 422) };

    for (const k of Object.keys(patch)) {
      plate[k] = k === "content_flags" ? normFlags(patch[k])
        : k === "order" ? patch[k]
        : String(patch[k]).trim();
    }
    manifest.plates.sort((a, b) => a.order - b.order);
    return { message: "gallery-admin: update " + id, result: { ok: true, plate } };
  });
}

async function apiPlateFlag(request, env) {
  const body = await readJson(request);
  if (!body) return json({ error: "bad_json" }, 400);
  const id = String(body.id || "").trim();
  const flags = normFlags(body.content_flags);

  return withManifest(env, async (manifest) => {
    const plate = manifest.plates.find((x) => x.id === id);
    if (!plate) return { fail: json({ error: "not_found", id }, 404) };
    plate.content_flags = flags;
    const label = flags.length ? "[" + flags.join(",") + "]" : "[clear]";
    return { message: "gallery-admin: flag " + id + " " + label, result: { ok: true, plate } };
  });
}

async function apiPlateDelete(request, env) {
  const body = await readJson(request);
  if (!body) return json({ error: "bad_json" }, 400);
  const id = String(body.id || "").trim();
  if (body.confirm !== id) return json({ error: "confirm_mismatch", hint: "pass confirm: <id> verbatim" }, 400);

  let deletedKey = null;
  const res = await withManifest(env, async (manifest) => {
    const i = manifest.plates.findIndex((x) => x.id === id);
    if (i === -1) return { fail: json({ error: "not_found", id }, 404) };
    deletedKey = manifest.plates[i].r2key;
    manifest.plates.splice(i, 1);
    return { message: "gallery-admin: delete " + id, result: { ok: true, id, r2key: deletedKey } };
  });

  // Optional R2 object removal AFTER the manifest commit lands (entry gone
  // first means the live grid never points at a deleted object).
  if (body.delete_object === true && deletedKey && env.GALLERY_BUCKET && res.status === 200) {
    try { await env.GALLERY_BUCKET.delete(deletedKey); } catch { /* manifest is truth; orphan cleanup can re-run */ }
  }
  return res;
}

function maxOrder(manifest) {
  return manifest.plates.reduce((m, p) => Math.max(m, Number(p.order) || 0), 0);
}
function normFlags(v) {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.map((s) => String(s).trim().toLowerCase()).filter(Boolean))];
}
function today() {
  return new Date().toISOString().slice(0, 10);
}
function romanize(n) {
  const table = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  let out = "";
  for (const [v, s] of table) while (n >= v) { out += s; n -= v; }
  return out || "I";
}

/* ----------------------- GitHub Contents API layer ----------------------- */

async function withManifest(env, mutate) {
  if (!env.GITHUB_PAT) return json({ error: "no_github_pat", detail: "secret unset — fail closed (README step 4)." }, 503);

  for (let attempt = 0; attempt < 2; attempt++) {
    const got = await ghGetManifest(env);
    if (!got.ok) return json({ error: got.error, detail: got.detail }, got.status || 502);

    const manifest = got.manifest;
    if (manifest.schema_version !== 1 || !Array.isArray(manifest.plates)) {
      return json({ error: "schema_unexpected", detail: "manifest schema_version!==1 — refusing to write" }, 409);
    }

    const out = await mutate(manifest);
    if (out.fail) return out.fail;

    manifest.updated = today();
    const put = await ghPutManifest(env, manifest, got.sha, out.message);
    if (put.ok) return json({ ...out.result, commit: put.commit, manifest_updated: manifest.updated });
    if (put.conflict && attempt === 0) continue; // sha raced — refetch once
    return json({ error: put.error, detail: put.detail }, put.status || 502);
  }
  return json({ error: "conflict_retry_exhausted" }, 409);
}

async function ghGetManifest(env) {
  const r = await ghFetch(env, "GET");
  if (r.status === 404) return { ok: false, error: "manifest_not_found", status: 404 };
  if (!r.ok) return { ok: false, error: "github_get_failed", detail: await safeText(r), status: 502 };
  const data = await r.json();
  let manifest;
  try { manifest = JSON.parse(utf8FromB64(data.content)); }
  catch { return { ok: false, error: "manifest_parse_failed", status: 502 }; }
  return { ok: true, manifest, sha: data.sha };
}

async function ghPutManifest(env, manifest, sha, message) {
  const content = b64FromUtf8(JSON.stringify(manifest, null, 2) + "\n");
  const r = await ghFetch(env, "PUT", {
    message, content, sha, branch: env.GITHUB_BRANCH || "main",
    committer: { name: "wuld-gallery-admin", email: "263501734+alisendjsc-crypto@users.noreply.github.com" },
  });
  if (r.status === 409 || r.status === 422) return { ok: false, conflict: true, error: "sha_conflict", status: r.status };
  if (!r.ok) return { ok: false, error: "github_put_failed", detail: await safeText(r), status: 502 };
  const data = await r.json();
  return { ok: true, commit: data.commit && data.commit.sha };
}

function ghFetch(env, method, bodyObj) {
  const url = "https://api.github.com/repos/" + env.GITHUB_REPO + "/contents/" +
    (env.MANIFEST_PATH || "src/gallery/manifest.json") +
    (method === "GET" ? "?ref=" + (env.GITHUB_BRANCH || "main") : "");
  return fetch(url, {
    method,
    headers: {
      "Authorization": "Bearer " + env.GITHUB_PAT,
      "Accept": "application/vnd.github+json",
      "User-Agent": "wuld-gallery-admin",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(bodyObj ? { "Content-Type": "application/json" } : {}),
    },
    body: bodyObj ? JSON.stringify(bodyObj) : undefined,
  });
}

async function safeText(r) {
  try { return (await r.text()).slice(0, 300); } catch { return "(unreadable)"; }
}

/* UTF-8-safe base64 — the manifest is full of em-dashes; naive btoa corrupts. */
function b64FromUtf8(s) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}
function utf8FromB64(b64) {
  const bin = atob(String(b64).replace(/\s+/g, ""));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/* ============================ SITE-EDIT layer (K86) ======================= */
/* admin-CMS arc session 3: tools/wuld-gui/ops.py patterns ported as Worker
 * endpoints behind the same Access gate / CSRF / rate belt. Flow per edit:
 *   POST /api/site/preview {pattern, params}
 *     -> GET the live repo file, run the transform, return BEFORE/AFTER
 *        excerpts + tag-balance delta + the file sha the preview saw;
 *   POST /api/site/commit {pattern, params, expected}
 *     -> re-fetch, REFUSE on sha drift (409 stale_preview; the confirmed
 *        diff is the diff that lands — no silent retry), re-run the
 *        deterministic transform, write ONE commit `site-admin: ...`.
 * Single-file ops ride the Contents API (sha optimistic concurrency).
 * cache-bump is multi-file (ops.py sweeps src HTML) and rides the Git Data
 * API — tree read at one head commit, inline-content tree create, commit
 * parented on that head, ref CAS (non-fast-forward -> 409 to client).
 * SITE_SWEEP_MAX_FILES guards the Workers subrequest budget.
 * Discipline carried from ops.py / the K-series: find/anchor asserts REFUSE
 * on 0 (K33 cxlviii) and on ambiguity; splice-only string surgery keeps
 * file tails byte-exact outside the edit (K34); tag counting strips
 * comments + script/style bodies first (ccxvi); transforms are byte-parity
 * ports of ops.py, proven against real src/ copies in the K86 dry-run. */

const SITE_SWEEP_MAX_FILES = 40; // subrequest budget guard (free plan: 50/request)

class SiteOpError extends Error {}

/* --- SITE TRANSFORMS (pure; node-testable) --- */

const SITE_REC_SECTIONS = ["media", "film", "books", "sites", "groups", "work", "art"];
const SITE_VERSION_RE = /^K\d+[a-z]?$/;
const SITE_TAGS = ["article", "div", "section", "figure", "figcaption", "li", "ul", "ol",
  "main", "header", "footer", "nav", "p", "h1", "h2", "h3", "h4", "a", "button", "span"];

function siteEsc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function siteRequire(params, names) {
  const missing = names.filter(function (n) { return !params[n]; });
  if (missing.length) throw new SiteOpError("Required field(s) empty: " + missing.join(", "));
}

/* Port of ops.py _insert_at_position — identical semantics:
 * position blank/"0" -> append after LAST card; "1" -> before FIRST card;
 * "N" -> 1-based slot N; > count -> append. Throws when 0 cards match. */
function siteInsertAtPosition(data, newBlock, cardPatternSrc, position) {
  const re = new RegExp(cardPatternSrc, "g");
  const opens = [];
  for (let m = re.exec(data); m; m = re.exec(data)) {
    opens.push(m.index);
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  if (!opens.length) {
    throw new SiteOpError("No existing cards matching /" + cardPatternSrc +
      "/ found. Use text-swap with an explicit anchor if the section is empty.");
  }
  const nameMatch = /^<(\w+)\b/.exec(cardPatternSrc);
  if (!nameMatch) throw new SiteOpError("Cannot infer tag name from /" + cardPatternSrc + "/");
  const closeTag = "</" + nameMatch[1] + ">";

  const ends = [];
  for (const start of opens) {
    const ci = data.indexOf(closeTag, start);
    if (ci < 0) throw new SiteOpError("Unbalanced card at index " + start + ": no " + closeTag);
    let end = ci + closeTag.length;
    while (end < data.length && (data[end] === " " || data[end] === "\t")) end++;
    if (end < data.length && data[end] === "\n") end++;
    ends.push(end);
  }

  const posStr = String(position == null ? "" : position).trim();
  let insAt;
  if (!posStr || posStr === "0") {
    insAt = ends[ends.length - 1];
  } else {
    const n = parseInt(posStr, 10);
    if (!Number.isInteger(n) || String(n) !== posStr) {
      throw new SiteOpError("Position must be a number or blank; got " + JSON.stringify(position));
    }
    if (n < 1) throw new SiteOpError("Position must be >= 1; got " + n);
    insAt = n > opens.length ? ends[ends.length - 1] : opens[n - 1];
  }
  return data.slice(0, insAt) + newBlock + data.slice(insAt);
}

/* ops.py pattern 2: add video card to /watch/ Selected uploads. */
function siteVideoWatch(content, params) {
  siteRequire(params, ["youtube_id", "title"]);
  const yid = String(params.youtube_id).trim();
  if (!/^[A-Za-z0-9_-]{5,40}$/.test(yid)) {
    throw new SiteOpError("youtube_id: expected a bare id, charset [A-Za-z0-9_-]");
  }
  const titleE = siteEsc(params.title);
  const date = String(params.date == null ? "" : params.date).trim();
  const dateHtml = date ? '\n            <p class="video-card-date">' + siteEsc(date) + "</p>" : "";

  const block =
    '      <article class="video-card" data-video-id="' + yid + '">\n' +
    '        <button class="video-thumb-wrap" type="button" aria-label="Play ' + titleE + '">\n' +
    '          <img class="video-thumb" src="https://i.ytimg.com/vi/' + yid + '/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">\n' +
    '          <span class="video-play" aria-hidden="true">&#9658;</span>\n' +
    "        </button>\n" +
    '        <div class="video-meta">\n' +
    '            <h3 class="video-card-title">' + titleE + "</h3>" + dateHtml + "\n" +
    "        </div>\n" +
    "      </article>\n";

  let next;
  try {
    next = siteInsertAtPosition(content, block, '<article class="video-card"', params.position);
  } catch (e) {
    if (!(e instanceof SiteOpError)) throw e;
    // ops.py fallback: insert before the closing </div> of .video-grid.
    const idx = content.indexOf('<div class="video-grid">');
    if (idx < 0) throw new SiteOpError("Could not find .video-grid container in /watch/.");
    const end = content.indexOf("</div>", idx);
    if (end < 0) throw new SiteOpError("Could not find closing </div> for .video-grid.");
    next = content.slice(0, end) + block + content.slice(end);
  }
  return {
    content: next,
    summary: "Add video card to /watch/: " + JSON.stringify(String(params.title)) + " (" + yid + ")",
    message: "site-admin: video-watch add — " + String(params.title),
  };
}

/* ops.py pattern 4: add recommendation card (section-scoped insertion). */
function siteRecCard(content, params) {
  siteRequire(params, ["section", "kind", "title", "url", "note"]);
  const section = String(params.section).trim();
  if (SITE_REC_SECTIONS.indexOf(section) < 0) {
    throw new SiteOpError("Section must be one of " + SITE_REC_SECTIONS.join("|") + "; got " + section);
  }
  const url = String(params.url).trim();
  if (!/^https?:\/\/[^\s"<>]+$/.test(url)) {
    throw new SiteOpError("url: absolute http(s), no spaces/quotes");
  }
  const kindE = siteEsc(params.kind);
  const titleE = siteEsc(params.title);
  const note = String(params.note); // raw BY DESIGN (ops.py): allows inline <a>/<em>; admin-only input

  const block =
    '        <article class="rec-card" data-status="live">\n' +
    '          <p class="rec-card-kind">' + kindE + "</p>\n" +
    '          <h3 class="rec-card-title"><a href="' + url + '" target="_blank" rel="noopener noreferrer">' + titleE + "</a></h3>\n" +
    '          <p class="rec-card-note">' + note + "</p>\n" +
    "        </article>\n";

  const sectionAnchor = '<section class="rec-section" id="' + section + '">';
  const sectStart = content.indexOf(sectionAnchor);
  if (sectStart < 0) throw new SiteOpError("Section anchor not found: " + sectionAnchor);
  const sectEnd = content.indexOf("</section>", sectStart);
  if (sectEnd < 0) throw new SiteOpError("Section closing tag not found after index " + sectStart);

  const sectionStr = content.slice(sectStart, sectEnd);
  let newSection;
  try {
    newSection = siteInsertAtPosition(sectionStr, block, '<article class="rec-card"', params.position);
  } catch (e) {
    if (!(e instanceof SiteOpError)) throw e;
    // ops.py fallback: empty section -> insert before </div> of .rec-cards.
    const rc = sectionStr.indexOf('<div class="rec-cards">');
    if (rc < 0) throw new SiteOpError("No .rec-cards container in section " + section + ".");
    const cc = sectionStr.indexOf("</div>", rc);
    newSection = sectionStr.slice(0, cc) + block + sectionStr.slice(cc);
  }
  return {
    content: content.slice(0, sectStart) + newSection + content.slice(sectEnd),
    summary: "Add rec card to /" + section + "/: " + JSON.stringify(String(params.title)),
    message: "site-admin: rec-card " + section + " — " + String(params.title),
  };
}

/* ops.py pattern 6: generic text-swap. count==1 unless replace_all. */
function siteTextSwap(content, params, relPath) {
  siteRequire(params, ["find_text"]);
  const findS = String(params.find_text);
  const replaceS = String(params.replace_text == null ? "" : params.replace_text);
  const count = content.split(findS).length - 1;
  const replaceAll = Boolean(params.replace_all);
  if (count === 0) throw new SiteOpError("Find string not found in file (pre-flight K33 cxlviii).");
  if (count > 1 && !replaceAll) {
    throw new SiteOpError("Find string occurs " + count + " times; tighten the find, or set replace_all.");
  }
  let next;
  if (replaceAll) {
    next = content.split(findS).join(replaceS); // split/join: no $-pattern hazards
  } else {
    const i = content.indexOf(findS);
    next = content.slice(0, i) + replaceS + content.slice(i + findS.length);
  }
  return {
    content: next,
    summary: "Text-swap on " + relPath + ": " + count + " occurrence(s) " + (replaceAll ? "(all replaced)" : "(first replaced)"),
    message: "site-admin: text-swap " + relPath,
  };
}

/* ops.py pattern 7, pure half: per-file ?v= bump. null when no occurrence. */
function siteCacheBumpApply(content, oldV, newV) {
  const oldS = "?v=" + oldV;
  const count = content.split(oldS).length - 1;
  if (!count) return null;
  return { content: content.split(oldS).join("?v=" + newV), count: count };
}

function siteCleanRel(p) {
  const rel = String(p == null ? "" : p).trim().replace(/\\/g, "/").replace(/^\/+/, "");
  if (!rel.startsWith("src/")) throw new SiteOpError("File must be inside src/ (relative path). Got: " + rel);
  if (rel.indexOf("..") >= 0 || rel.indexOf("//") >= 0 || !/^[A-Za-z0-9._/-]+$/.test(rel)) {
    throw new SiteOpError("Path rejected (traversal / charset).");
  }
  return rel;
}

/* Tag-balance accounting (ccxvi: strip comments + script/style bodies first). */
function siteStripForCount(s) {
  return s
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "");
}
function siteCountTag(s, t) {
  const open = (s.match(new RegExp("<" + t + "(?=[\\s>])", "g")) || []).length;
  const close = (s.match(new RegExp("</" + t + ">", "g")) || []).length;
  return open - close;
}
function siteTagDelta(oldS, newS) {
  const a = siteStripForCount(oldS);
  const b = siteStripForCount(newS);
  const out = {};
  for (const t of SITE_TAGS) {
    const d = siteCountTag(b, t) - siteCountTag(a, t);
    if (d !== 0) out[t] = d;
  }
  return out; // {} == splice left tag balance untouched
}

/* Common-prefix/suffix diff excerpt for the confirm panel. */
function siteDiffExcerpt(oldS, newS) {
  const ctx = 220;
  let p = 0;
  const minLen = Math.min(oldS.length, newS.length);
  while (p < minLen && oldS[p] === newS[p]) p++;
  let so = oldS.length, sn = newS.length;
  while (so > p && sn > p && oldS[so - 1] === newS[sn - 1]) { so--; sn--; }
  const a = Math.max(0, p - ctx);
  return {
    at: p,
    removed_chars: so - p,
    added_chars: sn - p,
    before: (a > 0 ? "…" : "") + oldS.slice(a, Math.min(oldS.length, so + ctx)) + (so + ctx < oldS.length ? "…" : ""),
    after: (a > 0 ? "…" : "") + newS.slice(a, Math.min(newS.length, sn + ctx)) + (sn + ctx < newS.length ? "…" : ""),
  };
}

/* --- END SITE TRANSFORMS (pure) --- */

/* ------------------------ site-edit endpoint layer ------------------------ */

async function siteRun(env, pattern, params) {
  params = params || {};
  if (pattern === "cache-bump") return siteRunCacheBump(env, params);

  let rel, applyFn;
  if (pattern === "video-watch") { rel = "src/watch/index.html"; applyFn = siteVideoWatch; }
  else if (pattern === "rec-card") { rel = "src/recommendations/index.html"; applyFn = siteRecCard; }
  else if (pattern === "text-swap") {
    try { siteRequire(params, ["file_path"]); rel = siteCleanRel(params.file_path); }
    catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
    applyFn = siteTextSwap;
  }
  else return { fail: json({ error: "unknown_pattern", known: ["video-watch", "rec-card", "text-swap", "cache-bump"] }, 400) };

  const got = await ghGetFile(env, rel);
  if (!got.ok) return { fail: json({ error: got.error, detail: got.detail, path: rel }, got.status || 502) };

  let out;
  try { out = applyFn(got.content, params, rel); }
  catch (e) {
    if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) };
    throw e;
  }

  const isHtml = rel.endsWith(".html");
  const tagDelta = isHtml ? siteTagDelta(got.content, out.content) : {};
  const balanced = Object.keys(tagDelta).length === 0;
  if (pattern !== "text-swap" && !balanced) {
    // Card splices are balanced by construction; a delta here means the
    // target file surprised us — refuse even at preview.
    return { fail: json({ error: "tag_balance_broken", delta: tagDelta }, 422) };
  }
  return { kind: "single", rel: rel, sha: got.sha, oldContent: got.content, newContent: out.content,
           summary: out.summary, message: out.message, tagDelta: tagDelta, balanced: balanced };
}

async function siteRunCacheBump(env, params) {
  try { siteRequire(params, ["old_version", "new_version"]); }
  catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
  const oldV = String(params.old_version).trim();
  const newV = String(params.new_version).trim();
  if (!SITE_VERSION_RE.test(oldV) || !SITE_VERSION_RE.test(newV)) {
    return { fail: json({ error: "op_refused", detail: "Versions must match K<NN> or K<NN><letter>; e.g. K34, K35, K35a" }, 422) };
  }
  if (oldV === newV) return { fail: json({ error: "op_refused", detail: "old_version == new_version" }, 422) };

  const head = await ghHead(env);
  if (!head.ok) return { fail: json({ error: head.error, detail: head.detail }, head.status || 502) };
  const tree = await ghTreeRecursive(env, head.treeSha);
  if (!tree.ok) return { fail: json({ error: tree.error, detail: tree.detail }, tree.status || 502) };

  let htmls = tree.entries.filter(function (e) { return e.type === "blob" && /^src\/.*\.html$/.test(e.path); });
  // Optional paths scoping (K86 dry-run fact: this repo holds ~57 src HTML
  // files, and a sweep must FETCH every candidate to know where ?v= lives —
  // beyond the Workers free-plan subrequest budget). The operator names the
  // referencing pages for the high-frequency small bump (board-asset class);
  // a BLANK list = full sweep, which the guard refuses on free plan — raise
  // env.SITE_SWEEP_MAX on paid, or run site-wide bumps via tools/wuld-gui.
  if (Array.isArray(params.paths) && params.paths.length) {
    let want;
    try { want = params.paths.map(function (p) { return siteCleanRel(p); }); }
    catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
    want = want.filter(function (p, i) { return want.indexOf(p) === i; });
    const have = {};
    htmls.forEach(function (e) { have[e.path] = e; });
    const missing = want.filter(function (p) { return !have[p]; });
    if (missing.length) {
      return { fail: json({ error: "op_refused", detail: "paths not in the repo tree as src HTML: " + missing.join(", ") }, 422) };
    }
    htmls = want.map(function (p) { return have[p]; });
  }
  const maxSweep = Number(env.SITE_SWEEP_MAX || SITE_SWEEP_MAX_FILES);
  if (htmls.length > maxSweep) {
    return { fail: json({ error: "sweep_too_large", files: htmls.length, max: maxSweep,
      detail: "Workers subrequest budget guard — scope with paths, or run the site-wide bump via tools/wuld-gui locally." }, 413) };
  }

  const changes = [];
  const report = [];
  for (const e of htmls) {
    const blob = await ghBlob(env, e.sha);
    if (!blob.ok) return { fail: json({ error: blob.error, detail: blob.detail, path: e.path }, blob.status || 502) };
    const hit = siteCacheBumpApply(blob.content, oldV, newV);
    if (hit) {
      changes.push({ path: e.path, content: hit.content });
      report.push({ path: e.path, occurrences: hit.count });
    }
  }
  if (!changes.length) {
    return { fail: json({ error: "op_refused", detail: "No occurrences of ?v=" + oldV + " found in src/**/*.html." }, 422) };
  }
  return { kind: "multi", headSha: head.commitSha, baseTreeSha: head.treeSha, changes: changes, report: report,
           summary: "Cache-bump " + oldV + " -> " + newV + " across " + changes.length + " HTML file(s)",
           message: "site-admin: cache-bump " + oldV + " -> " + newV + " (" + changes.length + " files)" };
}

async function apiSitePreview(request, env) {
  const body = await readJson(request);
  if (!body || !body.pattern) return json({ error: "bad_json", hint: "{pattern, params}" }, 400);
  const r = await siteRun(env, String(body.pattern), body.params || {});
  if (r.fail) return r.fail;

  if (r.kind === "multi") {
    return json({ ok: true, pattern: String(body.pattern), kind: "multi", summary: r.summary,
                  files: r.report, expected: { head: r.headSha }, commit_message: r.message });
  }
  const enc = new TextEncoder();
  return json({
    ok: true, pattern: String(body.pattern), kind: "single", target: r.rel, summary: r.summary,
    bytes_before: enc.encode(r.oldContent).length, bytes_after: enc.encode(r.newContent).length,
    tag_delta: r.tagDelta, excerpt: siteDiffExcerpt(r.oldContent, r.newContent),
    expected: { sha: r.sha }, commit_message: r.message,
  });
}

async function apiSiteCommit(request, env) {
  if (!env.GITHUB_PAT) return json({ error: "no_github_pat", detail: "secret unset — fail closed (README step 4)." }, 503);
  const body = await readJson(request);
  if (!body || !body.pattern || !body.expected) return json({ error: "bad_json", hint: "{pattern, params, expected}" }, 400);
  const r = await siteRun(env, String(body.pattern), body.params || {});
  if (r.fail) return r.fail;

  if (r.kind === "multi") {
    if (r.headSha !== body.expected.head) {
      return json({ error: "stale_preview", detail: "head moved since preview — re-preview", head_now: r.headSha }, 409);
    }
    const put = await ghMultiCommit(env, r.headSha, r.baseTreeSha, r.changes, r.message);
    if (!put.ok) return json({ error: put.error, detail: put.detail }, put.status || 502);
    return json({ ok: true, commit: put.commit, files: r.report, summary: r.summary });
  }

  if (r.sha !== body.expected.sha) {
    return json({ error: "stale_preview", detail: "target changed since preview — re-preview", sha_now: r.sha }, 409);
  }
  if (!r.balanced && !(body.params && body.params.allow_tag_delta === true)) {
    return json({ error: "tag_delta_blocked", delta: r.tagDelta,
                  hint: "re-preview; set allow_tag_delta only if the tag change is intended" }, 422);
  }
  const put = await ghPutFile(env, r.rel, r.newContent, r.sha, r.message);
  if (!put.ok) return json({ error: put.error, detail: put.detail }, put.status || 502);
  return json({ ok: true, commit: put.commit, target: r.rel, summary: r.summary });
}

/* ---------------------- GitHub generic-path API layer --------------------- */
/* The manifest layer above stays as-is (gallery vertical byte-held); these
 * are the path-parametric siblings the site-edit endpoints ride. */

function ghHeaders(env, hasBody) {
  const h = {
    "Authorization": "Bearer " + env.GITHUB_PAT,
    "Accept": "application/vnd.github+json",
    "User-Agent": "wuld-gallery-admin",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (hasBody) h["Content-Type"] = "application/json";
  return h;
}

function ghPathUrl(env, repoPath, withRef) {
  return "https://api.github.com/repos/" + env.GITHUB_REPO + "/contents/" + repoPath +
    (withRef ? "?ref=" + (env.GITHUB_BRANCH || "main") : "");
}

async function ghGetFile(env, repoPath) {
  if (!env.GITHUB_PAT) return { ok: false, error: "no_github_pat", detail: "secret unset — fail closed (README step 4).", status: 503 };
  const r = await fetch(ghPathUrl(env, repoPath, true), { headers: ghHeaders(env, false) });
  if (r.status === 404) return { ok: false, error: "file_not_found", status: 404 };
  if (!r.ok) return { ok: false, error: "github_get_failed", detail: await safeText(r), status: 502 };
  const data = await r.json();
  if (Array.isArray(data)) return { ok: false, error: "path_is_directory", status: 422 };
  if (data.encoding !== "base64" || typeof data.content !== "string") {
    return { ok: false, error: "file_too_large_for_contents_api", status: 422 };
  }
  return { ok: true, content: utf8FromB64(data.content), sha: data.sha };
}

async function ghPutFile(env, repoPath, contentStr, sha, message) {
  const r = await fetch(ghPathUrl(env, repoPath, false), {
    method: "PUT",
    headers: ghHeaders(env, true),
    body: JSON.stringify({
      message: message, content: b64FromUtf8(contentStr), sha: sha, branch: env.GITHUB_BRANCH || "main",
      committer: { name: "wuld-site-admin", email: "263501734+alisendjsc-crypto@users.noreply.github.com" },
    }),
  });
  if (r.status === 409 || r.status === 422) return { ok: false, error: "sha_conflict", detail: await safeText(r), status: 409 };
  if (!r.ok) return { ok: false, error: "github_put_failed", detail: await safeText(r), status: 502 };
  const data = await r.json();
  return { ok: true, commit: data.commit && data.commit.sha };
}

/* Git Data API (cache-bump only): head -> tree -> inline-content tree create
 * -> commit -> ref CAS. One commit, one Pages rebuild, N files. */

async function ghHead(env) {
  const branch = env.GITHUB_BRANCH || "main";
  const base = "https://api.github.com/repos/" + env.GITHUB_REPO + "/git/";
  const rr = await fetch(base + "ref/heads/" + branch, { headers: ghHeaders(env, false) });
  if (!rr.ok) return { ok: false, error: "github_ref_failed", detail: await safeText(rr), status: 502 };
  const ref = await rr.json();
  const commitSha = ref.object && ref.object.sha;
  if (!commitSha) return { ok: false, error: "github_ref_shape", status: 502 };
  const cr = await fetch(base + "commits/" + commitSha, { headers: ghHeaders(env, false) });
  if (!cr.ok) return { ok: false, error: "github_commit_failed", detail: await safeText(cr), status: 502 };
  const commit = await cr.json();
  if (!commit.tree || !commit.tree.sha) return { ok: false, error: "github_commit_shape", status: 502 };
  return { ok: true, commitSha: commitSha, treeSha: commit.tree.sha };
}

async function ghTreeRecursive(env, treeSha) {
  const r = await fetch("https://api.github.com/repos/" + env.GITHUB_REPO + "/git/trees/" + treeSha + "?recursive=1",
    { headers: ghHeaders(env, false) });
  if (!r.ok) return { ok: false, error: "github_tree_failed", detail: await safeText(r), status: 502 };
  const data = await r.json();
  if (data.truncated) return { ok: false, error: "tree_truncated", detail: "repo tree too large for recursive listing", status: 502 };
  return { ok: true, entries: data.tree || [] };
}

async function ghBlob(env, sha) {
  const r = await fetch("https://api.github.com/repos/" + env.GITHUB_REPO + "/git/blobs/" + sha,
    { headers: ghHeaders(env, false) });
  if (!r.ok) return { ok: false, error: "github_blob_failed", detail: await safeText(r), status: 502 };
  const data = await r.json();
  return { ok: true, content: utf8FromB64(data.content) };
}

async function ghMultiCommit(env, parentSha, baseTreeSha, changes, message) {
  const base = "https://api.github.com/repos/" + env.GITHUB_REPO + "/git/";
  const tr = await fetch(base + "trees", {
    method: "POST", headers: ghHeaders(env, true),
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: changes.map(function (c) { return { path: c.path, mode: "100644", type: "blob", content: c.content }; }),
    }),
  });
  if (!tr.ok) return { ok: false, error: "github_tree_create_failed", detail: await safeText(tr), status: 502 };
  const newTree = await tr.json();
  const cr = await fetch(base + "commits", {
    method: "POST", headers: ghHeaders(env, true),
    body: JSON.stringify({
      message: message, tree: newTree.sha, parents: [parentSha],
      committer: { name: "wuld-site-admin", email: "263501734+alisendjsc-crypto@users.noreply.github.com" },
    }),
  });
  if (!cr.ok) return { ok: false, error: "github_commit_create_failed", detail: await safeText(cr), status: 502 };
  const newCommit = await cr.json();
  const ur = await fetch(base + "refs/heads/" + (env.GITHUB_BRANCH || "main"), {
    method: "PATCH", headers: ghHeaders(env, true),
    body: JSON.stringify({ sha: newCommit.sha, force: false }),
  });
  if (ur.status === 422) return { ok: false, error: "stale_preview", detail: "ref moved during commit — re-preview", status: 409 };
  if (!ur.ok) return { ok: false, error: "github_ref_update_failed", detail: await safeText(ur), status: 502 };
  return { ok: true, commit: newCommit.sha };
}

/* ------------------------------- Access gate ----------------------------- */
/* Same JWKS RS256 machinery as workers/comments, MINUS the weak fallback:
 * this Worker already 503s upstream when team domain / AUD are unset. */

async function verifyAccess(request, env) {
  const token =
    request.headers.get("Cf-Access-Jwt-Assertion") ||
    cookie(request, "CF_Authorization");
  if (!token) return { ok: false, reason: "no_access_token (is the Access app in front of admin.wuld.ink?)" };

  const payload = await verifyAccessJwt(token, env);
  if (!payload) return { ok: false, reason: "jwt_invalid" };
  if (!env.ADMIN_EMAIL || !payload.email || payload.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    return { ok: false, reason: "not_admin" };
  }
  return { ok: true, email: payload.email };
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

  const certsUrl = "https://" + env.ACCESS_TEAM_DOMAIN + "/cdn-cgi/access/certs";
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
    "RSASSA-PKCS1-v1_5", key, b64urlToBytes(s), new TextEncoder().encode(h + "." + p)
  );
  if (!valid) return null;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) return null;
  if (payload.nbf && payload.nbf > now + 60) return null;
  if (payload.iss && payload.iss !== "https://" + env.ACCESS_TEAM_DOMAIN) return null;
  const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!auds.includes(env.ACCESS_AUD)) return null;
  return payload;
}

/* -------------------------------- helpers -------------------------------- */

const rateBucket = new Map(); // email -> [timestamps]; per-isolate, best-effort
function rateCheck(email) {
  const now = Date.now();
  const arr = (rateBucket.get(email) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX_WRITES) {
    return { ok: false, retryS: Math.ceil((RATE_WINDOW_MS - (now - arr[0])) / 1000) };
  }
  arr.push(now);
  rateBucket.set(email, arr);
  return { ok: true };
}

function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return request.headers.get("Sec-Fetch-Site") === "same-origin";
  try { return new URL(origin).host === new URL(request.url).host; }
  catch { return false; }
}

async function readJson(request) {
  try { return await request.json(); } catch { return null; }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function html(body) {
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src https://audio.wuld.ink; connect-src 'self'",
    },
  });
}

function cookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const m = raw.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : null;
}

function b64urlToString(str) { return atob(b64urlPad(str)); }
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

/* -------------------------------- admin UI ------------------------------- */
/* Mono register, dark, no framework. Inner JS avoids template literals and
 * any "</script" sequence by construction. */

function adminHtml(env, adminEmail) {
  const mediaBase = env.MEDIA_BASE || "https://audio.wuld.ink";
  const prefix = env.R2_PREFIX || "gallery/";
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>gallery-admin &mdash; wuld.ink</title>
<style>
  :root { --bg:#0a0a0a; --fg:#f0ebe5; --dim:#8a857e; --accent:#c41e3a; --border:#2a2a2a; }
  * { box-sizing: border-box; }
  body { background:var(--bg); color:var(--fg); font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:13px; line-height:1.6; margin:0; padding:2rem 1.5rem 6rem; }
  main { max-width: 64rem; margin: 0 auto; }
  h1 { font-size:15px; letter-spacing:.2em; text-transform:uppercase; border-bottom:1px solid var(--accent); padding-bottom:.5rem; }
  h1 small { color:var(--dim); letter-spacing:.05em; text-transform:none; float:right; }
  h2 { font-size:12px; letter-spacing:.15em; text-transform:uppercase; color:var(--accent); margin:2.5rem 0 .75rem; }
  fieldset { border:1px solid var(--border); padding:1rem; margin:0 0 1rem; }
  label { display:block; color:var(--dim); font-size:11px; text-transform:uppercase; letter-spacing:.1em; margin:.6rem 0 .15rem; }
  input[type=text], input[type=number], textarea, select { width:100%; background:#111; color:var(--fg); border:1px solid var(--border); padding:.4rem .5rem; font:inherit; }
  textarea { min-height:4.5rem; resize:vertical; }
  input:focus, textarea:focus, select:focus { outline:1px solid var(--accent); }
  button { background:none; border:1px solid var(--border); color:var(--fg); font:inherit; padding:.4rem .9rem; cursor:pointer; margin-top:.75rem; }
  button:hover { border-color:var(--accent); color:var(--accent); }
  button.danger { border-color:var(--accent); color:var(--accent); }
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th, td { text-align:left; padding:.35rem .5rem; border-bottom:1px solid var(--border); vertical-align:top; }
  th { color:var(--dim); font-weight:normal; text-transform:uppercase; font-size:10px; letter-spacing:.1em; }
  td .rowbtn { margin:0 .35rem 0 0; padding:.1rem .45rem; font-size:11px; }
  .status { border:1px solid var(--border); padding:.75rem 1rem; color:var(--dim); white-space:pre-wrap; }
  .status b { color:var(--fg); font-weight:normal; }
  .flag { color:var(--accent); }
  #log { color:var(--dim); font-size:11px; white-space:pre-wrap; max-height:14rem; overflow:auto; border:1px dashed var(--border); padding:.5rem .75rem; }
  .row2 { display:grid; grid-template-columns:1fr 1fr; gap:0 1rem; }
  .hint { color:var(--dim); font-size:11px; margin:.25rem 0 0; }
  pre.diff { background:#111; border:1px solid var(--border); padding:.5rem .75rem; font-size:11px; line-height:1.5; white-space:pre-wrap; word-break:break-all; max-height:11rem; overflow:auto; margin:.35rem 0 .6rem; }
  pre.diff.after { border-color:var(--accent); }
  .diffmeta { color:var(--dim); font-size:11px; white-space:pre-wrap; }
  #site-preview { display:none; border:1px solid var(--accent); padding:1rem; margin:1rem 0; }
</style></head>
<body><main>
<h1>gallery-admin <small>${escHtml(adminEmail || "")} &middot; ${escHtml(env.GITHUB_REPO || "")}</small></h1>

<h2>Status</h2>
<div class="status" id="status">loading manifest&hellip;</div>

<h2>1 &middot; Upload image &rarr; R2 (${escHtml(prefix)})</h2>
<fieldset>
  <label>file (webp / png / jpeg, &le; 25 MiB)</label>
  <input type="file" id="up-file" accept="image/webp,image/png,image/jpeg">
  <label>key stem (optional; defaults from filename; extension derives from verified type)</label>
  <input type="text" id="up-key" placeholder="plate-28-some-title">
  <label><input type="checkbox" id="up-overwrite"> overwrite if key exists</label>
  <button id="up-go">upload</button>
  <p class="hint">interim alternative: R2 dashboard drag-drop into ${escHtml(prefix)} still works.</p>
</fieldset>

<h2>2 &middot; Plate entry &rarr; manifest commit</h2>
<fieldset id="plate-form">
  <input type="hidden" id="pf-mode" value="add">
  <div class="row2">
    <div><label>id (slug; fixed after add)</label><input type="text" id="pf-id"></div>
    <div><label>r2key</label><input type="text" id="pf-r2key" placeholder="${escHtml(prefix)}plate-28-x.webp"></div>
  </div>
  <div class="row2">
    <div><label>title</label><input type="text" id="pf-title"></div>
    <div><label>series</label><input type="text" id="pf-series"></div>
  </div>
  <label>technique</label><textarea id="pf-technique"></textarea>
  <label>body</label><textarea id="pf-body"></textarea>
  <label>epitaph</label><textarea id="pf-epitaph"></textarea>
  <div class="row2">
    <div><label>order (blank = append)</label><input type="number" id="pf-order" min="1"></div>
    <div><label>num (blank = roman from order)</label><input type="text" id="pf-num"></div>
  </div>
  <div class="row2">
    <div><label>tier</label><select id="pf-tier"><option>standard</option><option>sealed</option></select></div>
    <div><label>flags</label><label style="text-transform:none"><input type="checkbox" id="pf-nsfw"> nsfw (arms the consent gate)</label></div>
  </div>
  <button id="pf-go">add plate (1 commit)</button>
  <button id="pf-cancel" style="display:none">cancel edit</button>
</fieldset>

<h2>3 &middot; Plates</h2>
<table><thead><tr><th>ord</th><th>num</th><th>id</th><th>title</th><th>flags</th><th>tier</th><th></th></tr></thead>
<tbody id="plates"></tbody></table>

<h2>4 &middot; Site &mdash; add /watch/ video card</h2>
<fieldset>
  <div class="row2">
    <div><label>youtube id</label><input type="text" id="vw-id" placeholder="GSDN0vu18Fo"></div>
    <div><label>title</label><input type="text" id="vw-title"></div>
  </div>
  <div class="row2">
    <div><label>date (optional)</label><input type="text" id="vw-date" placeholder="Apr 2026 &middot; 23:59"></div>
    <div><label>position (blank = append; 1 = first)</label><input type="text" id="vw-pos"></div>
  </div>
  <button class="site-prev" data-pattern="video-watch">preview</button>
</fieldset>

<h2>5 &middot; Site &mdash; add recommendation card</h2>
<fieldset>
  <div class="row2">
    <div><label>section</label><select id="rc-section"><option>media</option><option>film</option><option>books</option><option>sites</option><option>groups</option><option>work</option><option>art</option></select></div>
    <div><label>kind (eyebrow)</label><input type="text" id="rc-kind" placeholder="FILM &middot; 1962"></div>
  </div>
  <div class="row2">
    <div><label>title</label><input type="text" id="rc-title"></div>
    <div><label>url</label><input type="text" id="rc-url" placeholder="https://example.org/thing"></div>
  </div>
  <label>note (inline markup allowed, by design)</label><textarea id="rc-note"></textarea>
  <label>position (blank = append; 1 = first)</label><input type="text" id="rc-pos">
  <button class="site-prev" data-pattern="rec-card">preview</button>
</fieldset>

<h2>6 &middot; Site &mdash; text-swap</h2>
<fieldset>
  <label>file (src/&hellip; relative path)</label><input type="text" id="ts-path" placeholder="src/blog/index.html">
  <label>find (exact bytes; must be unique unless replace-all)</label><textarea id="ts-find"></textarea>
  <label>replace (empty = delete)</label><textarea id="ts-replace"></textarea>
  <label style="text-transform:none"><input type="checkbox" id="ts-all"> replace all occurrences</label>
  <label style="text-transform:none"><input type="checkbox" id="ts-tagok"> allow tag-balance delta (rare; intended tag edits only)</label>
  <button class="site-prev" data-pattern="text-swap">preview</button>
</fieldset>

<h2>7 &middot; Site &mdash; cache-bump (?v= sweep, one commit)</h2>
<fieldset>
  <div class="row2">
    <div><label>old version</label><input type="text" id="cb-old" placeholder="K46"></div>
    <div><label>new version</label><input type="text" id="cb-new" placeholder="K47"></div>
  </div>
  <label>paths (optional, comma-separated src/&hellip;.html; blank = full sweep &mdash; free plan refuses, use wuld-gui)</label>
  <input type="text" id="cb-paths" placeholder="src/chat/index.html">
  <button class="site-prev" data-pattern="cache-bump">preview</button>
  <p class="hint">sweeps src HTML via the repo tree; K26 xcvii discipline &mdash; bump when a versioned component changes.</p>
</fieldset>

<div id="site-preview">
  <div class="diffmeta" id="sp-meta"></div>
  <div id="sp-body"></div>
  <button id="sp-commit">commit</button>
  <button id="sp-discard">discard</button>
</div>


<h2>Log</h2>
<div id="log"></div>

<script>
(function () {
  "use strict";
  var MANIFEST = null;
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function log(msg) {
    var el = $("log");
    el.textContent = new Date().toISOString().slice(11, 19) + "  " + msg + "\\n" + el.textContent;
  }
  function api(path, opts) {
    return fetch(path, opts).then(function (r) {
      return r.json().then(function (j) { return { status: r.status, j: j }; });
    });
  }
  function post(path, obj) {
    return api(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(obj),
    });
  }

  function refresh() {
    api("/api/manifest").then(function (r) {
      if (r.status !== 200) {
        $("status").textContent = "manifest load FAILED: " + JSON.stringify(r.j);
        log("manifest load failed " + r.status);
        return;
      }
      MANIFEST = r.j.manifest;
      var flagged = MANIFEST.plates.filter(function (p) { return p.content_flags.length; }).length;
      $("status").innerHTML =
        "<b>" + MANIFEST.plates.length + "</b> plates &middot; " +
        "<b>" + flagged + "</b> flagged &middot; updated <b>" + esc(MANIFEST.updated) +
        "</b> &middot; sha <b>" + esc(String(r.j.sha).slice(0, 10)) + "</b>";
      renderTable();
    });
  }

  function renderTable() {
    var tb = $("plates");
    tb.innerHTML = "";
    MANIFEST.plates.forEach(function (p) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + esc(p.order) + "</td><td>" + esc(p.num) + "</td>" +
        "<td>" + esc(p.id) + "</td><td>" + esc(p.title) + "</td>" +
        "<td class=flag>" + esc(p.content_flags.join(",")) + "</td>" +
        "<td>" + esc(p.tier) + "</td>" +
        "<td><button class=rowbtn data-act=edit data-id=\\"" + esc(p.id) + "\\">edit</button>" +
        "<button class=rowbtn data-act=flag data-id=\\"" + esc(p.id) + "\\">" +
        (p.content_flags.indexOf("nsfw") >= 0 ? "un-nsfw" : "nsfw") + "</button>" +
        "<button class=\\"rowbtn danger\\" data-act=del data-id=\\"" + esc(p.id) + "\\">del</button></td>";
      tb.appendChild(tr);
    });
  }

  // Delegated row actions (K27 lesson: re-renders never orphan listeners).
  $("plates").addEventListener("click", function (ev) {
    var b = ev.target.closest("button");
    if (!b) return;
    var id = b.getAttribute("data-id");
    var act = b.getAttribute("data-act");
    var plate = MANIFEST.plates.find(function (p) { return p.id === id; });
    if (!plate) return;

    if (act === "edit") {
      $("pf-mode").value = "update:" + id;
      $("pf-id").value = plate.id; $("pf-id").disabled = true;
      $("pf-r2key").value = plate.r2key;
      $("pf-title").value = plate.title;
      $("pf-series").value = plate.series;
      $("pf-technique").value = plate.technique;
      $("pf-body").value = plate.body;
      $("pf-epitaph").value = plate.epitaph;
      $("pf-order").value = plate.order;
      $("pf-num").value = plate.num;
      $("pf-tier").value = plate.tier;
      $("pf-nsfw").checked = plate.content_flags.indexOf("nsfw") >= 0;
      $("pf-go").textContent = "commit update";
      $("pf-cancel").style.display = "";
      window.scrollTo(0, $("plate-form").offsetTop - 60);
    }
    if (act === "flag") {
      var flags = plate.content_flags.slice();
      var i = flags.indexOf("nsfw");
      if (i >= 0) flags.splice(i, 1); else flags.push("nsfw");
      post("/api/plate/flag", { id: id, content_flags: flags }).then(function (r) {
        log("flag " + id + " -> " + r.status + " " + JSON.stringify(r.j).slice(0, 120));
        refresh();
      });
    }
    if (act === "del") {
      var typed = prompt("Delete manifest entry '" + id + "'. Type the id to confirm. (R2 object is KEPT; tick OK then see log.)");
      if (typed !== id) { log("delete aborted (confirm mismatch)"); return; }
      post("/api/plate/delete", { id: id, confirm: typed, delete_object: false }).then(function (r) {
        log("delete " + id + " -> " + r.status + " " + JSON.stringify(r.j).slice(0, 160));
        refresh();
      });
    }
  });

  $("pf-cancel").addEventListener("click", resetForm);
  function resetForm() {
    $("pf-mode").value = "add";
    $("pf-id").disabled = false;
    ["pf-id","pf-r2key","pf-title","pf-series","pf-technique","pf-body","pf-epitaph","pf-order","pf-num"].forEach(function (i) { $(i).value = ""; });
    $("pf-tier").value = "standard";
    $("pf-nsfw").checked = false;
    $("pf-go").textContent = "add plate (1 commit)";
    $("pf-cancel").style.display = "none";
  }

  $("pf-go").addEventListener("click", function () {
    var mode = $("pf-mode").value;
    var flags = $("pf-nsfw").checked ? ["nsfw"] : [];
    var common = {
      r2key: $("pf-r2key").value.trim(),
      title: $("pf-title").value.trim(),
      series: $("pf-series").value.trim(),
      technique: $("pf-technique").value.trim(),
      body: $("pf-body").value.trim(),
      epitaph: $("pf-epitaph").value.trim(),
      num: $("pf-num").value.trim(),
      tier: $("pf-tier").value,
      content_flags: flags,
    };
    if ($("pf-order").value) common.order = parseInt($("pf-order").value, 10);

    if (mode === "add") {
      common.id = $("pf-id").value.trim();
      post("/api/plate/add", { plate: common }).then(function (r) {
        log("add -> " + r.status + " " + JSON.stringify(r.j).slice(0, 200));
        if (r.status === 200) { resetForm(); refresh(); }
      });
    } else {
      var id = mode.slice(7);
      post("/api/plate/update", { id: id, patch: common }).then(function (r) {
        log("update " + id + " -> " + r.status + " " + JSON.stringify(r.j).slice(0, 200));
        if (r.status === 200) { resetForm(); refresh(); }
      });
    }
  });

  $("up-go").addEventListener("click", function () {
    var f = $("up-file").files[0];
    if (!f) { log("no file chosen"); return; }
    var fd = new FormData();
    fd.append("file", f);
    if ($("up-key").value.trim()) fd.append("key", $("up-key").value.trim());
    if ($("up-overwrite").checked) fd.append("overwrite", "true");
    log("uploading " + f.name + " (" + f.size + " B)…");
    api("/api/upload", { method: "POST", body: fd }).then(function (r) {
      log("upload -> " + r.status + " " + JSON.stringify(r.j).slice(0, 200));
      if (r.status === 200 && r.j.key) $("pf-r2key").value = r.j.key;
    });
  });

  /* ---- site-edit forms (K86): preview -> diff-confirm -> commit ---- */
  var SITE_PENDING = null;

  function siteCollect(pattern) {
    if (pattern === "video-watch") {
      return { youtube_id: $("vw-id").value.trim(), title: $("vw-title").value.trim(),
               date: $("vw-date").value.trim(), position: $("vw-pos").value.trim() };
    }
    if (pattern === "rec-card") {
      return { section: $("rc-section").value, kind: $("rc-kind").value.trim(),
               title: $("rc-title").value.trim(), url: $("rc-url").value.trim(),
               note: $("rc-note").value, position: $("rc-pos").value.trim() };
    }
    if (pattern === "text-swap") {
      return { file_path: $("ts-path").value.trim(), find_text: $("ts-find").value,
               replace_text: $("ts-replace").value, replace_all: $("ts-all").checked,
               allow_tag_delta: $("ts-tagok").checked };
    }
    if (pattern === "cache-bump") {
      var paths = $("cb-paths").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      return { old_version: $("cb-old").value.trim(), new_version: $("cb-new").value.trim(), paths: paths };
    }
    return {};
  }

  function siteRenderPreview(pattern, params, j) {
    SITE_PENDING = { pattern: pattern, params: params, expected: j.expected };
    var meta = "PATTERN " + pattern + "\\n" + j.summary + "\\ncommit: " + j.commit_message;
    var body = "";
    if (j.kind === "single") {
      meta += "\\ntarget: " + j.target + "  (" + j.bytes_before + " -> " + j.bytes_after + " B)";
      var keys = Object.keys(j.tag_delta || {});
      if (keys.length) {
        meta += "\\nTAG DELTA: " + keys.map(function (k) { return k + ":" + j.tag_delta[k]; }).join(" ") + "  (commit blocks unless allowed)";
      }
      body = "<label>before</label><pre class=diff>" + esc(j.excerpt.before) + "</pre>" +
             "<label>after</label><pre class=\\"diff after\\">" + esc(j.excerpt.after) + "</pre>";
    } else {
      meta += "\\nhead: " + String(j.expected.head).slice(0, 10) + "  files: " + j.files.length + "  (ONE commit)";
      body = "<pre class=diff>" + esc(j.files.map(function (f) { return f.path + "  x" + f.occurrences; }).join("\\n")) + "</pre>";
    }
    $("sp-meta").textContent = meta;
    $("sp-body").innerHTML = body;
    $("site-preview").style.display = "block";
    $("sp-commit").disabled = false;
    window.scrollTo(0, $("site-preview").offsetTop - 60);
  }

  // Delegated (K27): the four preview buttons share one document listener.
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("button.site-prev");
    if (!b) return;
    var pattern = b.getAttribute("data-pattern");
    var params = siteCollect(pattern);
    log("preview " + pattern + " …");
    post("/api/site/preview", { pattern: pattern, params: params }).then(function (r) {
      log("preview " + pattern + " -> " + r.status + " " + JSON.stringify(r.j).slice(0, 160));
      if (r.status !== 200) { $("site-preview").style.display = "none"; SITE_PENDING = null; return; }
      siteRenderPreview(pattern, params, r.j);
    });
  });

  $("sp-discard").addEventListener("click", function () {
    SITE_PENDING = null;
    $("site-preview").style.display = "none";
    log("preview discarded");
  });

  $("sp-commit").addEventListener("click", function () {
    if (!SITE_PENDING) return;
    $("sp-commit").disabled = true;
    post("/api/site/commit", SITE_PENDING).then(function (r) {
      log("commit " + SITE_PENDING.pattern + " -> " + r.status + " " + JSON.stringify(r.j).slice(0, 200));
      if (r.status === 200) { SITE_PENDING = null; $("site-preview").style.display = "none"; }
      if (r.status !== 200) { $("sp-commit").disabled = false; }
    });
  });

  refresh();
})();
<\/script>
</main></body></html>`;
}

function escHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
