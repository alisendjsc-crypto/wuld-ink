/* =============================================================================
 * wuld.ink gallery admin CMS — Cloudflare Worker (K85, admin-CMS arc session 2)
 * =============================================================================
 * Serves admin.wuld.ink (own custom domain; zero overlap with the comments
 * worker's wuld.ink/api/* + wuld.ink/admin* routes).
 *
 * WRITE CONTRACT = src/gallery/index.html head-comment schema:
 *   { schema_version: 2, media_base, updated: "YYYY-MM-DD",
 *     categories: [ { slug, name, caption_tier: "full"|"title"|"none" } ],
 *     plates: [ { id, r2key, num, title, technique, body, epitaph,
 *                 series, order, tier: "standard"|"sealed",
 *                 content_flags: ["nsfw", ...], added: "YYYY-MM-DD",
 *                 category: "<slug>" (default "editorial"),
 *                 media: { kind: "image"|"video", poster?: "<r2key>" },
 *                 caption_tier: ""|"full"|"title"|"none", cascade
 *                 plate -> category -> "full" } ] }
 *   - K87 (gallery v2): Worker PINNED to schema_version 2; category /
 *     media / caption_tier editable; mp4 joins the upload allowlist.
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
 *
 * K212: CONTENT verticals — blog-post + essay-page (two-file ops: a NEW
 *   page whose chrome is GRAFTED at op time from a LIVE donor page, plus
 *   the index card; ONE Git Data API commit, ref CAS). Donors:
 *   /blog/the-easiest-case/ + /essays/architecture-of-moral-disaster/ —
 *   the ?v sweeps maintain the donors, so new pages are born with current
 *   chrome instead of forking a template the sweeps would miss. Every
 *   donor substitution is occurrence-counted; drift fails loud at preview.
 *
 * K213: UI redraft for ease of use — sticky jump bar (14 anchors), the 12
 *   tool sections collapse to <details> (open-state persisted in
 *   localStorage; hash/jump links auto-open; edit auto-opens the form),
 *   plates table paginated (25/50/100/all) + live filter + row counter.
 *   Zero endpoint/transform changes — adminHtml + UI script only.
 *
 * K214: legibility — every panel font-size x1.5 (body 13->20px, h1 15->23,
 *   h2/table 12->18, label/log/hint/diff/rowbtn/tablebar 11->17, th/jump
 *   10->15). Form controls inherit body. Zero structural/JS changes.
 *
 * K220: MEDIA vertical + moderation consolidation.
 *   - Hosted-video pipes: R2 multipart uploads via MEDIA_BUCKET (bucket
 *     wuld-audio, fenced media/ prefix; 32 MiB parts through the Worker —
 *     no new S3 credentials, no bucket CORS), draft items in
 *     tools/media-manifest.json (repo-committed, NOT deployed — the item
 *     list incl. unlisted 18+ slugs never ships), publish/unpublish as
 *     diff-confirm site patterns: donor-grafted /watch/<id>/ page +
 *     /watch/ hosted card + manifest flip, ONE Git Data commit (delete
 *     via tree sha:null on unpublish). nsfw => 18+ interstitial page,
 *     robots-noindex + the wuld-search exclude marker (build_index skips
 *     it); exclusive => locked stub, no payment wiring yet. Donor page:
 *     src/watch/_donor/index.html (the ?v sweeps maintain it).
 *   - Comment-board moderation moves under THIS roof: COMMENTS_DB D1
 *     binding (the same wuld-comments database), /api/cmod/* routes with
 *     byte-parity SQL from workers/comments, UI section 14. The PUBLIC
 *     board routes stay on the comments worker; the old wuld.ink/admin
 *     UI retires only after the operator parity check (guide §12).
 * ========================================================================== */

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MiB cap (plates run ~0.8 MB)
const ALLOWED_TYPES = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
  "video/mp4": "mp4",
};
const RATE_MAX_WRITES = 30;       // per window, per isolate (best-effort belt)
const RATE_WINDOW_MS = 60_000;
const VALID_TIERS = ["standard", "sealed"];
const VALID_KINDS = ["image", "video"];
const VALID_CAPTION_TIERS = ["full", "title", "none"];
const KNOWN_FLAGS = ["nsfw"];     // advisory; unknown flags pass with a warning

/* ---- K220 media vertical ---- */
const MEDIA_ALLOWED = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
};
const MEDIA_PUT_MAX = 32 * 1024 * 1024;   // single-request cap; bigger files go multipart
const MEDIA_PART_SIZE = 32 * 1024 * 1024; // uniform R2 part size (last part may run short)
const MEDIA_FLAGS = ["nsfw", "exclusive"];
const MEDIA_ID_RE = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;
const MEDIA_DUR_RE = /^(\d{1,2}:)?[0-5]?\d:[0-5]\d$/;
const CMOD_MAX_BODY = 2000;               // parity: workers/comments MAX_BODY

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
      if (request.method === "GET" && path === "/api/media/manifest") {
        return apiMediaManifest(env);
      }
      if (request.method === "GET" && path === "/api/media/r2list") {
        return apiMediaR2List(env, url);
      }
      if (request.method === "GET" && path === "/api/cmod/list") {
        return apiCmodList(env);
      }
      if (request.method === "GET" && path.startsWith("/api/gaplog/proxy/")) {
        return apiGaplogProxy(path.slice("/api/gaplog/proxy/".length));
      }
      if (request.method === "GET" && path === "/api/gaplog/rows") {
        return apiGaplogRows(env, url);
      }
      if (request.method === "GET" && path === "/api/gaplog/export") {
        return apiGaplogExport(env, url);
      }
      if (request.method === "POST") {
        // CSRF + rate belt on every mutation.
        if (!gate.service && !sameOrigin(request)) return json({ error: "csrf_origin_mismatch" }, 403);
        if (path !== "/api/media/mpu-part") { // a long upload's parts outrun the write belt; Access + CSRF still gate them
          const rl = rateCheck(gate.email);
          if (!rl.ok) return json({ error: "rate_capped", retry_in_s: rl.retryS }, 429);
        }

        if (path === "/api/upload") return apiUpload(request, env);
        if (path === "/api/plate/add") return apiPlateAdd(request, env);
        if (path === "/api/plate/update") return apiPlateUpdate(request, env);
        if (path === "/api/plate/flag") return apiPlateFlag(request, env);
        if (path === "/api/plate/delete") return apiPlateDelete(request, env);
        if (path === "/api/media/put") return apiMediaPut(request, env, url);
        if (path === "/api/media/mpu-init") return apiMediaMpuInit(request, env);
        if (path === "/api/media/mpu-part") return apiMediaMpuPart(request, env, url);
        if (path === "/api/media/mpu-complete") return apiMediaMpuComplete(request, env);
        if (path === "/api/media/mpu-abort") return apiMediaMpuAbort(request, env);
        if (path === "/api/media/item/add") return apiMediaItemAdd(request, env);
        if (path === "/api/media/item/update") return apiMediaItemUpdate(request, env);
        if (path === "/api/media/item/delete") return apiMediaItemDelete(request, env);
        if (path === "/api/cmod/act") return apiCmodAct(request, env);
        if (path === "/api/site/preview") return apiSitePreview(request, env);
        if (path === "/api/site/commit") return apiSiteCommit(request, env);
        if (path === "/api/gaplog/log") return apiGaplogLog(request, env);
        if (path === "/api/gaplog/resolve") return apiGaplogMod(request, env, "resolve");
        if (path === "/api/gaplog/redact") return apiGaplogMod(request, env, "redact");
        if (path === "/api/gaplog/drop") return apiGaplogMod(request, env, "drop");
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
  const sniffed = sniffMediaType(new Uint8Array(buf));
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

function sniffMediaType(b) {
  // mp4: "ftyp" box at offset 4 (any major brand)
  if (b.length > 11 && b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return "video/mp4";
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

/* ========================== MEDIA vertical (K220) ========================= */
/* Self-hosted video/media pipes. Storage = R2 bucket wuld-audio under the
 * fenced media/ prefix (second binding MEDIA_BUCKET; gallery/ blast radius
 * untouched — the two prefix guards are mutually exclusive). Uploads ride
 * the Worker in 32 MiB slices (R2 multipart via the binding; free-plan body
 * cap 100 MB; no new S3 credentials, no bucket CORS — presign would need
 * both). Metadata = tools/media-manifest.json (repo-committed like the
 * gallery manifest, but OUTSIDE src/ so the item list — including unlisted
 * 18+ slugs — never deploys). Draft -> published via the site-op patterns
 * media-publish / media-unpublish (diff-confirm; page grafted from the
 * /watch/_donor/ page + /watch/ hosted card + manifest flip, ONE commit). */

function mediaManifestPath(env) { return env.MEDIA_MANIFEST_PATH || "tools/media-manifest.json"; }
function mediaPrefixOf(env) { return env.MEDIA_PREFIX || "media/"; }
function mediaBaseOf(env) { return env.MEDIA_BASE || "https://audio.wuld.ink"; }

function mediaKeyOk(env, key) {
  const pre = mediaPrefixOf(env);
  return typeof key === "string" && key.length > pre.length && key.length <= 200 &&
    key.indexOf(pre) === 0 && key.indexOf("..") < 0 && key.indexOf("//") < 0 &&
    /^[a-z0-9/._-]+$/.test(key);
}

/* webm = EBML magic; everything else defers to the existing sniffer. */
function sniffMediaAny(b) {
  if (b.length > 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return "video/webm";
  return sniffMediaType(b);
}

function mediaPlain(errs, v, label, max) {
  const s = String(v == null ? "" : v).trim();
  if (s.length > max) errs.push(label + ": max " + max + " chars (got " + s.length + ")");
  if (/[<>"&\\]/.test(s)) errs.push(label + ": plain text only — no < > \" & or backslash");
  return s;
}

/* ------------------------- media manifest RW ----------------------------- */
/* Mirror of withManifest, path-parametric via the generic gh layer. One
 * commit per CMS action; sha optimistic-concurrency with one retry. */

async function withMediaManifest(env, mutate) {
  if (!env.GITHUB_PAT) return json({ error: "no_github_pat", detail: "secret unset — fail closed (README step 4)." }, 503);
  for (let attempt = 0; attempt < 2; attempt++) {
    const got = await ghGetFile(env, mediaManifestPath(env));
    if (!got.ok) return json({ error: got.error, detail: got.detail, path: mediaManifestPath(env) }, got.status || 502);
    let man;
    try { man = JSON.parse(got.content); }
    catch { return json({ error: "media_manifest_parse_failed" }, 502); }
    if (man.schema_version !== 1 || !Array.isArray(man.items)) {
      return json({ error: "schema_unexpected", detail: "media manifest schema_version!==1 — refusing to write (K220 pin)" }, 409);
    }
    const out = await mutate(man);
    if (out.fail) return out.fail;
    man.updated = today();
    const put = await ghPutFile(env, mediaManifestPath(env), JSON.stringify(man, null, 2) + "\n", got.sha, out.message);
    if (put.ok) return json({ ...out.result, commit: put.commit, manifest_updated: man.updated });
    if (put.error === "sha_conflict" && attempt === 0) continue;
    return json({ error: put.error, detail: put.detail }, put.status || 502);
  }
  return json({ error: "conflict_retry_exhausted" }, 409);
}

async function apiMediaManifest(env) {
  const got = await ghGetFile(env, mediaManifestPath(env));
  if (!got.ok) return json({ error: got.error, detail: got.detail, path: mediaManifestPath(env) }, got.status || 502);
  let man;
  try { man = JSON.parse(got.content); }
  catch { return json({ error: "media_manifest_parse_failed" }, 502); }
  return json({ manifest: man, sha: got.sha });
}

async function apiMediaR2List(env, url) {
  if (!env.MEDIA_BUCKET) return json({ error: "no_r2_binding", detail: "MEDIA_BUCKET absent — deploy with the K220 wrangler.toml." }, 503);
  const cursor = url.searchParams.get("cursor") || undefined;
  const listed = await env.MEDIA_BUCKET.list({ prefix: mediaPrefixOf(env), cursor, limit: 200 });
  return json({
    objects: listed.objects.map(function (o) { return { key: o.key, size: o.size, uploaded: o.uploaded }; }),
    truncated: listed.truncated,
    cursor: listed.truncated ? listed.cursor : null,
  });
}

/* --------------------------- media item ops ------------------------------ */

function mediaValidateFields(env, src, errs, out) {
  if ("title" in src) {
    out.title = mediaPlain(errs, src.title, "title", 160);
    if (!out.title) errs.push("title: required");
  }
  if ("date" in src) {
    out.date = String(src.date || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(out.date)) errs.push("date: YYYY-MM-DD");
  }
  if ("summary" in src) {
    out.summary = mediaPlain(errs, src.summary, "summary", 500);
    if (!out.summary) errs.push("summary: required");
  }
  if ("duration" in src) {
    out.duration = String(src.duration || "").trim();
    if (out.duration && !MEDIA_DUR_RE.test(out.duration)) errs.push("duration: M:SS or H:MM:SS");
  }
  if ("r2key" in src) {
    out.r2key = String(src.r2key || "").trim();
    if (out.r2key && !mediaKeyOk(env, out.r2key)) errs.push("r2key: must live under " + mediaPrefixOf(env) + " ([a-z0-9/._-])");
  }
  if ("poster" in src) {
    out.poster = String(src.poster || "").trim();
    if (out.poster && !mediaKeyOk(env, out.poster)) errs.push("poster: must live under " + mediaPrefixOf(env));
  }
  if ("bytes" in src) {
    out.bytes = parseInt(src.bytes, 10) || 0;
  }
  if ("content_flags" in src) {
    out.content_flags = Array.isArray(src.content_flags)
      ? src.content_flags.filter(function (f) { return MEDIA_FLAGS.indexOf(f) >= 0; })
      : [];
  }
  if ("listed" in src) out.listed = src.listed !== false;
  return out;
}

async function apiMediaItemAdd(request, env) {
  const body = await readJson(request);
  if (!body || !body.item) return json({ error: "bad_json", hint: "{item}" }, 400);
  const errs = [];
  const id = String(body.item.id || "").trim();
  if (!MEDIA_ID_RE.test(id) || id.indexOf("--") >= 0) errs.push("id: 3-64 chars of [a-z0-9-], no leading/trailing/double hyphen");
  if (id === "_donor" || id.indexOf("_") === 0) errs.push("id: underscore-led ids are reserved (donor/sealed convention)");
  const fields = mediaValidateFields(env, {
    title: body.item.title, date: body.item.date, summary: body.item.summary,
    duration: body.item.duration || "", r2key: body.item.r2key || "", poster: body.item.poster || "",
    bytes: body.item.bytes || 0, content_flags: body.item.content_flags || [], listed: body.item.listed,
  }, errs, {});
  if (errs.length) return json({ error: "validation", detail: errs }, 422);
  return withMediaManifest(env, function (man) {
    if (man.items.some(function (x) { return x.id === id; })) {
      return { fail: json({ error: "duplicate_id", id: id }, 409) };
    }
    man.items.push({
      id: id, title: fields.title, date: fields.date, summary: fields.summary,
      duration: fields.duration, r2key: fields.r2key, poster: fields.poster,
      bytes: fields.bytes, content_flags: fields.content_flags, listed: fields.listed,
      status: "draft", added: today(), published: "",
    });
    return { result: { ok: true, id: id, status: "draft" }, message: "media-admin: add " + id + " (draft)" };
  });
}

async function apiMediaItemUpdate(request, env) {
  const body = await readJson(request);
  if (!body || !body.id || !body.patch) return json({ error: "bad_json", hint: "{id, patch}" }, 400);
  const errs = [];
  const fields = mediaValidateFields(env, body.patch, errs, {});
  ["id", "status", "added", "published"].forEach(function (k) {
    if (k in body.patch) errs.push(k + ": not editable here (publish/unpublish own status)");
  });
  if (errs.length) return json({ error: "validation", detail: errs }, 422);
  return withMediaManifest(env, function (man) {
    const item = man.items.find(function (x) { return x.id === body.id; });
    if (!item) return { fail: json({ error: "not_found", id: body.id }, 404) };
    Object.keys(fields).forEach(function (k) { item[k] = fields[k]; });
    const note = item.status === "published"
      ? "live page NOT rebuilt — unpublish + republish to refresh /watch/" + item.id + "/"
      : "";
    return { result: { ok: true, id: item.id, note: note }, message: "media-admin: update " + item.id };
  });
}

async function apiMediaItemDelete(request, env) {
  const body = await readJson(request);
  if (!body || !body.id) return json({ error: "bad_json", hint: "{id, confirm, delete_objects}" }, 400);
  if (body.confirm !== body.id) return json({ error: "confirm_mismatch", detail: "type the item id to confirm" }, 400);
  let dropped = null;
  const resp = await withMediaManifest(env, function (man) {
    const i = man.items.findIndex(function (x) { return x.id === body.id; });
    if (i < 0) return { fail: json({ error: "not_found", id: body.id }, 404) };
    if (man.items[i].status === "published") {
      return { fail: json({ error: "op_refused", detail: "item is published — unpublish first (the page + card must come down with it)." }, 422) };
    }
    dropped = man.items[i];
    man.items.splice(i, 1);
    return { result: { ok: true, id: body.id, deleted: true }, message: "media-admin: delete " + body.id + " (draft)" };
  });
  if (body.delete_objects === true && dropped && env.MEDIA_BUCKET) {
    try {
      if (dropped.r2key && mediaKeyOk(env, dropped.r2key)) await env.MEDIA_BUCKET.delete(dropped.r2key);
      if (dropped.poster && mediaKeyOk(env, dropped.poster)) await env.MEDIA_BUCKET.delete(dropped.poster);
    } catch (e) { /* manifest commit already landed; object cleanup is best-effort */ }
  }
  return resp;
}

/* --------------------------- media uploads ------------------------------- */
/* Small files (posters + clips <= 32 MiB): one buffered PUT, magic-sniffed.
 * Big files: R2 multipart via the binding — init / N x 32 MiB parts
 * (streamed, never buffered) / complete. R2 requires uniform part size
 * except the last; the admin UI slices at the part_size init returns.
 * The magic sniff runs post-hoc at complete via a 16-byte range read —
 * mismatch deletes the assembled object. */

async function apiMediaPut(request, env, url) {
  if (!env.MEDIA_BUCKET) return json({ error: "no_r2_binding", detail: "MEDIA_BUCKET absent — deploy with the K220 wrangler.toml." }, 503);
  const declaredType = (request.headers.get("content-type") || "").toLowerCase().split(";")[0].trim();
  if (!MEDIA_ALLOWED[declaredType]) return json({ error: "type_not_allowed", allowed: Object.keys(MEDIA_ALLOWED) }, 415);
  const stem = sanitizeStem(String(url.searchParams.get("stem") || ""));
  if (!stem) return json({ error: "bad_key", detail: "stem sanitized to empty — supply [a-z0-9-]" }, 400);
  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return json({ error: "empty_file" }, 400);
  if (buf.byteLength > MEDIA_PUT_MAX) {
    return json({ error: "too_large", max_bytes: MEDIA_PUT_MAX, hint: "larger files go multipart — the admin UI slices automatically" }, 413);
  }
  const sniffed = sniffMediaAny(new Uint8Array(buf));
  if (sniffed !== declaredType) return json({ error: "content_mismatch", declared: declaredType, sniffed: sniffed || "unknown" }, 415);
  const key = mediaPrefixOf(env) + stem + "." + MEDIA_ALLOWED[declaredType];
  const overwrite = url.searchParams.get("overwrite") === "true";
  const existing = await env.MEDIA_BUCKET.head(key);
  if (existing && !overwrite) return json({ error: "key_exists", key: key, size: existing.size, hint: "set overwrite to replace" }, 409);
  await env.MEDIA_BUCKET.put(key, buf, { httpMetadata: { contentType: declaredType } });
  return json({ ok: true, key: key, bytes: buf.byteLength, overwrote: Boolean(existing), url: mediaBaseOf(env) + "/" + key });
}

async function apiMediaMpuInit(request, env) {
  if (!env.MEDIA_BUCKET) return json({ error: "no_r2_binding", detail: "MEDIA_BUCKET absent — deploy with the K220 wrangler.toml." }, 503);
  const body = await readJson(request);
  if (!body) return json({ error: "bad_json", hint: "{stem, type, head16?, overwrite?}" }, 400);
  const declaredType = String(body.type || "").toLowerCase();
  if (!MEDIA_ALLOWED[declaredType]) return json({ error: "type_not_allowed", allowed: Object.keys(MEDIA_ALLOWED) }, 415);
  const stem = sanitizeStem(String(body.stem || ""));
  if (!stem) return json({ error: "bad_key", detail: "stem sanitized to empty — supply [a-z0-9-]" }, 400);
  if (typeof body.head16 === "string" && /^[0-9a-f]{8,32}$/.test(body.head16)) {
    const bytes = new Uint8Array(body.head16.match(/../g).map(function (h) { return parseInt(h, 16); }));
    const sniffed = sniffMediaAny(bytes);
    if (sniffed !== declaredType) return json({ error: "content_mismatch", declared: declaredType, sniffed: sniffed || "unknown" }, 415);
  }
  const key = mediaPrefixOf(env) + stem + "." + MEDIA_ALLOWED[declaredType];
  const existing = await env.MEDIA_BUCKET.head(key);
  if (existing && body.overwrite !== true) return json({ error: "key_exists", key: key, size: existing.size, hint: "set overwrite to replace" }, 409);
  const mpu = await env.MEDIA_BUCKET.createMultipartUpload(key, { httpMetadata: { contentType: declaredType } });
  return json({ ok: true, key: key, uploadId: mpu.uploadId, part_size: MEDIA_PART_SIZE });
}

async function apiMediaMpuPart(request, env, url) {
  if (!env.MEDIA_BUCKET) return json({ error: "no_r2_binding" }, 503);
  const key = String(url.searchParams.get("key") || "");
  const uploadId = String(url.searchParams.get("uploadId") || "");
  const partNumber = parseInt(url.searchParams.get("part") || "", 10);
  if (!mediaKeyOk(env, key) || !uploadId || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000) {
    return json({ error: "bad_part_request", hint: "?key=&uploadId=&part=N with a raw body" }, 400);
  }
  const len = parseInt(request.headers.get("content-length") || "0", 10);
  if (!len) return json({ error: "length_required", detail: "part body must carry Content-Length" }, 411);
  if (len > MEDIA_PART_SIZE) return json({ error: "part_too_large", max_bytes: MEDIA_PART_SIZE }, 413);
  const mpu = env.MEDIA_BUCKET.resumeMultipartUpload(key, uploadId);
  try {
    const p = await mpu.uploadPart(partNumber, request.body);
    return json({ ok: true, partNumber: p.partNumber, etag: p.etag });
  } catch (e) {
    return json({ error: "part_failed", detail: String(e && e.message || e).slice(0, 200), hint: "the UI retries a failed part once" }, 502);
  }
}

async function apiMediaMpuComplete(request, env) {
  if (!env.MEDIA_BUCKET) return json({ error: "no_r2_binding" }, 503);
  const body = await readJson(request);
  if (!body || !body.key || !body.uploadId || !Array.isArray(body.parts)) {
    return json({ error: "bad_json", hint: "{key, uploadId, parts:[{partNumber, etag}]}" }, 400);
  }
  if (!mediaKeyOk(env, body.key)) return json({ error: "bad_key" }, 400);
  const parts = body.parts.map(function (p) { return { partNumber: parseInt(p.partNumber, 10), etag: String(p.etag || "") }; });
  if (parts.some(function (p) { return !Number.isInteger(p.partNumber) || p.partNumber < 1 || !p.etag; })) {
    return json({ error: "bad_parts" }, 400);
  }
  const mpu = env.MEDIA_BUCKET.resumeMultipartUpload(body.key, body.uploadId);
  let obj;
  try { obj = await mpu.complete(parts); }
  catch (e) { return json({ error: "complete_failed", detail: String(e && e.message || e).slice(0, 200) }, 502); }
  // Post-hoc magic sniff: the parts streamed through unbuffered, so the
  // content check lands here — 16-byte range read vs the declared type.
  const head = await env.MEDIA_BUCKET.head(body.key);
  const declared = head && head.httpMetadata && head.httpMetadata.contentType;
  const range = await env.MEDIA_BUCKET.get(body.key, { range: { offset: 0, length: 16 } });
  const first = range ? new Uint8Array(await range.arrayBuffer()) : new Uint8Array(0);
  const sniffed = sniffMediaAny(first);
  if (!declared || sniffed !== declared) {
    await env.MEDIA_BUCKET.delete(body.key);
    return json({ error: "content_mismatch", declared: declared || "unknown", sniffed: sniffed || "unknown", deleted: true }, 415);
  }
  return json({ ok: true, key: body.key, bytes: obj.size, url: mediaBaseOf(env) + "/" + body.key });
}

async function apiMediaMpuAbort(request, env) {
  if (!env.MEDIA_BUCKET) return json({ error: "no_r2_binding" }, 503);
  const body = await readJson(request);
  if (!body || !body.key || !body.uploadId) return json({ error: "bad_json", hint: "{key, uploadId}" }, 400);
  if (!mediaKeyOk(env, body.key)) return json({ error: "bad_key" }, 400);
  try { await env.MEDIA_BUCKET.resumeMultipartUpload(body.key, body.uploadId).abort(); }
  catch (e) { /* already gone/expired — abort is idempotent from the operator's seat */ }
  return json({ ok: true, aborted: body.key });
}

/* ==================== COMMENT-BOARD moderation (K220) ===================== */
/* Consolidation of the workers/comments moderation surface under THIS roof
 * (one auth, one UI). Reads/writes the SAME D1 database (binding
 * COMMENTS_DB -> wuld-comments) with byte-parity SQL ported from
 * workers/comments/src/index.js adminAction/adminHtml. The PUBLIC board
 * routes (GET/POST wuld.ink/api/comments) STAY on the comments worker —
 * same-origin posting from /chat/ depends on them. The old wuld.ink/admin
 * UI retires only after the operator checks parity (guide section 12). */

async function apiCmodList(env) {
  if (!env.COMMENTS_DB) return json({ error: "no_d1_binding", detail: "COMMENTS_DB absent — deploy with the K220 wrangler.toml." }, 503);
  let open = true, note = "";
  try {
    const row = await env.COMMENTS_DB.prepare("SELECT value FROM settings WHERE key = ?").bind("board_open").first();
    open = !(row && row.value === "0");
  } catch (e) { note = "settings table unreadable — board shown OPEN (comments-worker fail-open parity)"; }
  let gaplogVisitorOpen = false;
  try {
    const gvo = await env.COMMENTS_DB.prepare("SELECT value FROM settings WHERE key = ?").bind("gaplog_visitor_open").first();
    gaplogVisitorOpen = !!(gvo && gvo.value === "1");
  } catch (e2) { gaplogVisitorOpen = false; }   // fail CLOSED: the visitor lane defaults dark
  const { results } = await env.COMMENTS_DB.prepare(
    "SELECT id, board, name, email, body, created_at, hidden FROM comments ORDER BY created_at DESC, id DESC LIMIT 1000"
  ).all();
  const rows = results || [];
  const visible = rows.filter(function (r) { return !r.hidden; }).length;
  return json({ comments: rows, open: open, total: rows.length, visible: visible, hidden: rows.length - visible, note: note, gaplog_visitor_open: gaplogVisitorOpen });
}

async function apiCmodAct(request, env) {
  if (!env.COMMENTS_DB) return json({ error: "no_d1_binding", detail: "COMMENTS_DB absent — deploy with the K220 wrangler.toml." }, 503);
  const data = await readJson(request);
  if (!data || typeof data.action !== "string") return json({ error: "bad_json", hint: "{action, ...}" }, 400);
  const action = data.action;

  if (action === "board-state") {
    const open = data.open === true || data.open === 1 || data.open === "1" || data.open === "true";
    await env.COMMENTS_DB.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).bind("board_open", open ? "1" : "0").run();
    return json({ ok: true, open: open });
  }
  if (action === "gaplog-visitor") {
    // Build 1.5b: opens/closes the PUBLIC visitor gap-log lane (default CLOSED).
    const on = data.open === true || data.open === 1 || data.open === "1" || data.open === "true";
    await env.COMMENTS_DB.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    ).bind("gaplog_visitor_open", on ? "1" : "0").run();
    return json({ ok: true, gaplog_visitor_open: on });
  }
  if (action === "purge") {
    const scope = String(data.scope || "");
    if (scope === "hide-all") {
      const r = await env.COMMENTS_DB.prepare("UPDATE comments SET hidden = 1 WHERE hidden = 0").run();
      return json({ ok: true, scope: scope, affected: (r.meta && r.meta.changes) || 0 });
    }
    if (scope === "delete-hidden") {
      const r = await env.COMMENTS_DB.prepare("DELETE FROM comments WHERE hidden = 1").run();
      return json({ ok: true, scope: scope, affected: (r.meta && r.meta.changes) || 0 });
    }
    if (scope === "delete-all") {
      const r = await env.COMMENTS_DB.prepare("DELETE FROM comments").run();
      return json({ ok: true, scope: scope, affected: (r.meta && r.meta.changes) || 0 });
    }
    return json({ error: "bad_scope" }, 400);
  }

  const id = parseInt(data.id, 10);
  if (!Number.isInteger(id) || id < 1) return json({ error: "bad_id" }, 400);
  if (action === "hide") {
    await env.COMMENTS_DB.prepare("UPDATE comments SET hidden = 1 WHERE id = ?").bind(id).run();
    return json({ ok: true, id: id, hidden: 1 });
  }
  if (action === "unhide") {
    await env.COMMENTS_DB.prepare("UPDATE comments SET hidden = 0 WHERE id = ?").bind(id).run();
    return json({ ok: true, id: id, hidden: 0 });
  }
  if (action === "delete") {
    await env.COMMENTS_DB.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
    return json({ ok: true, id: id, deleted: true });
  }
  if (action === "edit") {
    const bodyText = typeof data.body === "string" ? data.body.trim() : "";
    if (bodyText.length < 1) return json({ error: "empty_body" }, 400);
    if (bodyText.length > CMOD_MAX_BODY) return json({ error: "body_too_long", max: CMOD_MAX_BODY }, 400);
    await env.COMMENTS_DB.prepare("UPDATE comments SET body = ? WHERE id = ?").bind(bodyText, id).run();
    return json({ ok: true, id: id, edited: true });
  }
  return json({ error: "unknown_action" }, 404);
}

/* ------------------------- API: Gap Log (K228, Build 1.5a) -------------------------
 * Admin-side testing lane for the Yūrei matcher. The matcher runs CLIENT-side on the
 * LIVE wuld.ink bytes proxied same-origin here (no fork, no reimplementation). This
 * Worker only (a) proxies the matcher + corpora, (b) persists PII-scrubbed misses +
 * anonymous hit-quality flags to D1.
 * PRIVACY FLOOR (invariant): no identity field is read, derived, or stored — ever.
 * The client scrubs; the Worker RE-scrubs (defense in depth) and never persists raw.
 * Miss lane = scrubbed content + dedup count; hit lane = entry_id + kind only.
 * persona-scoped ('yurei'); a future Omega/proxy log is a SEPARATE store (§4.5/§5). */

const GAPLOG_PERSONA = "yurei";
const GAPLOG_SRC = {
  matcher: "https://wuld.ink/components/yurei-oracle.js",
  "corpus-public": "https://wuld.ink/components/yurei-corpus-public.json",
  "corpus-oracle": "https://wuld.ink/components/yurei-corpus-oracle.json",
};

// Phoenix (UTC-7, no DST) day-granular stamp — matches Josiah's tz; dodges dual-boot UTC skew.
function gaplogToday() {
  return new Date(Date.now() - 7 * 3600 * 1000).toISOString().slice(0, 10);
}

// PII scrub — IDENTICAL to the client's gaplogScrub (ty_client.js). Mechanical
// redaction only, deterministic; the 1.5b visitor pipeline reuses this exact code.
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

// GET /api/gaplog/proxy/<name> — server-fetch the LIVE public bytes, serve same-origin
// so the admin page's strict CSP (connect-src 'self', script-src 'self') can load them.
async function apiGaplogProxy(name) {
  const src = GAPLOG_SRC[name];
  if (!src) return json({ error: "unknown_asset", name: String(name).slice(0, 40) }, 404);
  let r;
  try { r = await fetch(src, { cf: { cacheTtl: 30, cacheEverything: true } }); }
  catch (e) { return json({ error: "upstream_fetch", detail: String(e && e.message || e).slice(0, 160) }, 502); }
  if (!r.ok) return json({ error: "upstream_status", status: r.status, asset: name }, 502);
  const body = await r.text();
  const ct = name === "matcher" ? "text/javascript; charset=utf-8" : "application/json; charset=utf-8";
  return new Response(body, { status: 200, headers: { "content-type": ct, "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}

// GET /api/gaplog/rows?lane=miss|hit&sort=count|date|class
async function apiGaplogRows(env, url) {
  if (!env.COMMENTS_DB) return json({ error: "no_d1_binding", detail: "COMMENTS_DB absent — deploy with the K220 wrangler.toml." }, 503);
  const lane = url.searchParams.get("lane") === "hit" ? "hit" : "miss";
  const sort = url.searchParams.get("sort") || "count";
  if (lane === "miss") {
    const order = sort === "date" ? "last_date DESC, count DESC"
      : sort === "class" ? "class ASC, count DESC"
      : "count DESC, last_date DESC";
    const q = await env.COMMENTS_DB.prepare(
      "SELECT id, content_scrubbed, class, count, first_date, last_date, resolved FROM gap_log_miss WHERE persona = ? ORDER BY " + order + " LIMIT 2000"
    ).bind(GAPLOG_PERSONA).all();
    return json({ lane: "miss", rows: q.results || [] });
  }
  const order2 = sort === "date" ? "last_date DESC, count DESC" : "count DESC, last_date DESC";
  const q2 = await env.COMMENTS_DB.prepare(
    "SELECT id, entry_id, kind, count, first_date, last_date FROM gap_log_hit WHERE persona = ? ORDER BY " + order2 + " LIMIT 2000"
  ).bind(GAPLOG_PERSONA).all();
  return json({ lane: "hit", rows: q2.results || [] });
}

// POST /api/gaplog/log  {items:[{lane:'miss',content_scrubbed,class} | {lane:'hit',entry_id,kind}]}
async function apiGaplogLog(request, env) {
  if (!env.COMMENTS_DB) return json({ error: "no_d1_binding", detail: "COMMENTS_DB absent — deploy with the K220 wrangler.toml." }, 503);
  const data = await readJson(request);
  const items = data && Array.isArray(data.items) ? data.items : (data && data.lane ? [data] : []);
  if (!items.length) return json({ error: "bad_json", hint: "{items:[{lane,...}]}" }, 400);
  const today = gaplogToday();
  let miss = 0, hit = 0, skipped = 0;
  for (let i = 0; i < items.length && i < 200; i++) {
    const it = items[i] || {};
    if (it.lane === "miss") {
      const content = gaplogScrub(it.content_scrubbed); // RE-scrub server-side (defense in depth)
      if (!content) { skipped++; continue; }
      const cls = it.class === "all_damped" ? "all_damped" : "below_threshold";
      await env.COMMENTS_DB.prepare(
        "INSERT INTO gap_log_miss (persona, content_scrubbed, class, count, first_date, last_date, resolved) VALUES (?,?,?,1,?,?,0) " +
        "ON CONFLICT(persona, content_scrubbed) DO UPDATE SET count = count + 1, last_date = excluded.last_date, class = excluded.class"
      ).bind(GAPLOG_PERSONA, content, cls, today, today).run();
      miss++;
    } else if (it.lane === "hit") {
      const kind = String(it.kind || "");
      if (kind !== "thin" && kind !== "novel" && kind !== "repetitive") { skipped++; continue; }
      const eid = String(it.entry_id || "").slice(0, 80);
      if (!/^[A-Za-z0-9_.:-]{1,80}$/.test(eid)) { skipped++; continue; } // entry-id SHAPE only; never content
      await env.COMMENTS_DB.prepare(
        "INSERT INTO gap_log_hit (persona, entry_id, kind, count, first_date, last_date) VALUES (?,?,?,1,?,?) " +
        "ON CONFLICT(persona, entry_id, kind) DO UPDATE SET count = count + 1, last_date = excluded.last_date"
      ).bind(GAPLOG_PERSONA, eid, kind, today, today).run();
      hit++;
    } else { skipped++; }
  }
  return json({ ok: true, miss, hit, skipped });
}

// POST /api/gaplog/{resolve,redact,drop}  {id, [resolved], [lane]}
async function apiGaplogMod(request, env, action) {
  if (!env.COMMENTS_DB) return json({ error: "no_d1_binding", detail: "COMMENTS_DB absent — deploy with the K220 wrangler.toml." }, 503);
  const data = await readJson(request);
  const id = parseInt(data && data.id, 10);
  if (!Number.isInteger(id) || id < 1) return json({ error: "bad_id" }, 400);
  if (action === "resolve") {
    const v = (data.resolved === 0 || data.resolved === false || data.resolved === "0") ? 0 : 1;
    await env.COMMENTS_DB.prepare("UPDATE gap_log_miss SET resolved = ? WHERE persona = ? AND id = ?").bind(v, GAPLOG_PERSONA, id).run();
    return json({ ok: true, id, resolved: v });
  }
  if (action === "redact") { // blank content, keep the row+count (never auto-deleted; manual remedy)
    await env.COMMENTS_DB.prepare("UPDATE gap_log_miss SET content_scrubbed = '[redacted]' WHERE persona = ? AND id = ?").bind(GAPLOG_PERSONA, id).run();
    return json({ ok: true, id, redacted: true });
  }
  if (action === "drop") { // remove a single row (explicit manual removal)
    const tbl = data.lane === "hit" ? "gap_log_hit" : "gap_log_miss";
    await env.COMMENTS_DB.prepare("DELETE FROM " + tbl + " WHERE persona = ? AND id = ?").bind(GAPLOG_PERSONA, id).run();
    return json({ ok: true, id, dropped: true, lane: tbl });
  }
  return json({ error: "unknown_action" }, 404);
}

// GET /api/gaplog/export?lane=miss|hit — JSON download
async function apiGaplogExport(env, url) {
  if (!env.COMMENTS_DB) return json({ error: "no_d1_binding", detail: "COMMENTS_DB absent — deploy with the K220 wrangler.toml." }, 503);
  const lane = url.searchParams.get("lane") === "hit" ? "hit" : "miss";
  const tbl = lane === "hit" ? "gap_log_hit" : "gap_log_miss";
  const q = await env.COMMENTS_DB.prepare("SELECT * FROM " + tbl + " WHERE persona = ? ORDER BY count DESC, last_date DESC").bind(GAPLOG_PERSONA).all();
  const payload = JSON.stringify({ persona: GAPLOG_PERSONA, lane, exported: gaplogToday(), rows: q.results || [] }, null, 2);
  return new Response(payload, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="gaplog-' + lane + "-" + gaplogToday() + '.json"',
      "cache-control": "no-store",
    },
  });
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
    const cat = String(p.category || "editorial").trim();
    const knownCats = (manifest.categories || []).map((c) => c.slug);
    if (!knownCats.includes(cat)) errs.push("category: unknown slug (known: " + knownCats.join("|") + ")");
    const media = normMedia(p.media, errs, prefix);
    const capTier = String(p.caption_tier || "").trim();
    if (capTier && !VALID_CAPTION_TIERS.includes(capTier)) errs.push("caption_tier: ''|full|title|none");
    const printUrl = String(p.print_url || "").trim();
    if (printUrl && !/^https:\/\//.test(printUrl)) errs.push("print_url: must be https:// (or empty)");
    if ("featured" in p && typeof p.featured !== "boolean") errs.push("featured: boolean");
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
      category: cat,
      media: media,
      caption_tier: capTier,
    };
    if (printUrl) plate.print_url = printUrl;
    if (p.featured === true) plate.featured = true;
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
    const editable = ["r2key", "num", "title", "technique", "body", "epitaph", "series", "order", "tier", "content_flags", "category", "media", "caption_tier", "print_url", "featured", "video"];
    for (const k of Object.keys(patch)) {
      if (!editable.includes(k)) errs.push(k + ": not editable (id/added are fixed; delete+add to rekey)");
    }
    if ("r2key" in patch) {
      const prefix = env.R2_PREFIX || "gallery/";
      if (!String(patch.r2key).startsWith(prefix) || /\.\.|\/\//.test(String(patch.r2key))) errs.push("r2key: must start '" + prefix + "'");
    }
    if ("order" in patch && (!Number.isInteger(patch.order) || patch.order < 1)) errs.push("order: positive integer");
    if ("tier" in patch && !VALID_TIERS.includes(String(patch.tier))) errs.push("tier: standard|sealed");
    // K114: title is NOT required on partial update. Empty title is a legal
    // manifest state (415 caption-tier-none plates) and title is a freely
    // clearable field like body/epitaph. Requiring it here 422'd every
    // print_url-only drop on an untitled plate (round-6/7 manual fallbacks).
    if ("category" in patch) {
      const knownCats = (manifest.categories || []).map((c) => c.slug);
      if (!knownCats.includes(String(patch.category))) errs.push("category: unknown slug (known: " + knownCats.join("|") + ")");
    }
    if ("media" in patch) patch.media = normMedia(patch.media, errs, env.R2_PREFIX || "gallery/");
    if ("caption_tier" in patch && patch.caption_tier !== "" && !VALID_CAPTION_TIERS.includes(String(patch.caption_tier))) errs.push("caption_tier: ''|full|title|none");
    if ("print_url" in patch && String(patch.print_url).trim() && !/^https:\/\//.test(String(patch.print_url).trim())) errs.push("print_url: must be https:// (or empty to clear)");
    if ("featured" in patch && typeof patch.featured !== "boolean") errs.push("featured: boolean");
    if ("video" in patch && String(patch.video).trim() && !manifest.plates.some((x) => x.id === String(patch.video).trim())) errs.push("video: must be a known plate id (or empty to clear)");
    if (errs.length) return { fail: json({ error: "validation", errors: errs }, 422) };

    for (const k of Object.keys(patch)) {
      if (k === "print_url") {
        const v = String(patch[k] || "").trim();
        if (v) plate.print_url = v; else delete plate.print_url;
        continue;
      }
      if (k === "featured") {
        if (patch[k] === true) plate.featured = true; else delete plate.featured;
        continue;
      }
      if (k === "video") {
        const v = String(patch[k] || "").trim();
        if (v) plate.video = v; else delete plate.video;
        continue;
      }
      plate[k] = k === "content_flags" ? normFlags(patch[k])
        : k === "order" ? patch[k]
        : k === "media" ? patch[k]
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
function normMedia(v, errs, prefix) {
  if (v == null) return { kind: "image" };
  if (typeof v !== "object" || Array.isArray(v)) { errs.push("media: object { kind, poster? }"); return { kind: "image" }; }
  const kind = String(v.kind || "image");
  if (!VALID_KINDS.includes(kind)) errs.push("media.kind: image|video");
  const out = { kind };
  if (v.poster) {
    const poster = String(v.poster);
    if (!poster.startsWith(prefix) || /\.\.|\/\//.test(poster)) errs.push("media.poster: must start '" + prefix + "', no traversal");
    out.poster = poster;
  }
  return out;
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
    if (manifest.schema_version !== 2 || !Array.isArray(manifest.plates)) {
      return json({ error: "schema_unexpected", detail: "manifest schema_version!==2 — refusing to write (K87 pin)" }, 409);
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

/* ops.py pattern 1: add video card to /archive/ Videos (video or playlist). */
function siteVideoArchive(content, params) {
  siteRequire(params, ["youtube_id", "title", "eyebrow"]);
  const yid = String(params.youtube_id).trim();
  if (!/^[A-Za-z0-9_-]{5,40}$/.test(yid)) {
    throw new SiteOpError("youtube_id: expected a bare video or playlist id, charset [A-Za-z0-9_-]");
  }
  const isPlaylist = params.id_type === "playlist" || yid.indexOf("PL") === 0;
  const thumbId = (String(params.thumb_video_id == null ? "" : params.thumb_video_id).trim()) || (isPlaylist ? "" : yid);
  if (isPlaylist && !thumbId) {
    throw new SiteOpError("Playlist requires a thumbnail video ID (a representative video from the playlist).");
  }
  if (thumbId && !/^[A-Za-z0-9_-]{5,40}$/.test(thumbId)) {
    throw new SiteOpError("thumb_video_id: charset [A-Za-z0-9_-]");
  }
  const titleE = siteEsc(params.title);
  const eyebrowE = siteEsc(params.eyebrow);
  const sub = String(params.sub == null ? "" : params.sub).trim();
  const subHtml = sub ? '\n            <p class="archive-video-sub">' + siteEsc(sub) + "</p>" : "";
  const dataAttr = isPlaylist ? 'data-theater-playlist-id="' + yid + '"' : 'data-theater-video-id="' + yid + '"';
  const linkUrl = isPlaylist ? "https://www.youtube.com/playlist?list=" + yid : "https://www.youtube.com/watch?v=" + yid;

  const block =
    '        <article class="archive-video-card">\n' +
    '          <button class="archive-video-thumb-wrap" type="button" ' + dataAttr + ' data-theater-title="' + titleE + '" aria-label="Play ' + titleE + ' in theater mode">\n' +
    '            <img class="archive-video-thumb" src="https://i.ytimg.com/vi/' + thumbId + '/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">\n' +
    '            <span class="archive-video-play" aria-hidden="true">&#9658;</span>\n' +
    "          </button>\n" +
    '          <div class="archive-video-meta">\n' +
    '            <p class="archive-video-eyebrow">' + eyebrowE + "</p>\n" +
    '            <h3 class="archive-video-title">' + titleE + "</h3>" + subHtml + "\n" +
    '            <a class="archive-video-link" href="' + linkUrl + '" target="_blank" rel="noopener noreferrer">Open on YouTube &rarr;</a>\n' +
    "          </div>\n" +
    "        </article>\n";

  const next = siteInsertAtPosition(content, block, '<article class="archive-video-card">', params.position);
  return {
    content: next,
    summary: "Add video card to /archive/ Videos: " + JSON.stringify(String(params.title)) + " (" + yid + ")",
    message: "site-admin: archive-video add — " + String(params.title),
  };
}

/* ops.py pattern 3: add image card to /archive/ Images. */
function siteImageArchive(content, params) {
  siteRequire(params, ["slug", "alt", "kind", "title", "note"]);
  const slug = String(params.slug).trim();
  if (!/^[A-Za-z0-9._-]+$/.test(slug)) {
    throw new SiteOpError("slug: charset [A-Za-z0-9._-] (filename stem, no slashes)");
  }
  const altE = siteEsc(params.alt);
  const kindE = siteEsc(params.kind);
  const titleE = siteEsc(params.title);
  const noteE = siteEsc(params.note);
  const url = "https://audio.wuld.ink/archive/images/" + slug + ".webp";

  const block =
    '        <figure class="archive-image-card">\n' +
    '          <a class="archive-image-link" href="' + url + '" target="_blank" rel="noopener noreferrer">\n' +
    '            <img class="archive-image-img" src="' + url + '" alt="' + altE + '" loading="lazy" decoding="async">\n' +
    "          </a>\n" +
    '          <figcaption class="archive-image-cap">\n' +
    '            <p class="archive-image-kind">' + kindE + "</p>\n" +
    '            <h3 class="archive-image-title">' + titleE + "</h3>\n" +
    '            <p class="archive-image-note">' + noteE + "</p>\n" +
    "          </figcaption>\n" +
    "        </figure>\n";

  const next = siteInsertAtPosition(content, block, '<figure class="archive-image-card">', params.position);
  return {
    content: next,
    summary: "Add image card to /archive/ Images: " + JSON.stringify(String(params.title)) + " (" + slug + ")",
    message: "site-admin: archive-image add — " + String(params.title),
  };
}

/* ops.py pattern 5: add essay-list-item to /essays/ index. */
function siteEssayCard(content, params) {
  siteRequire(params, ["slug", "eyebrow", "title", "tag"]);
  let slug = String(params.slug).trim().replace(/^\/+/, "").replace(/\/+$/, "");
  if (!/^[A-Za-z0-9-]+$/.test(slug)) {
    throw new SiteOpError("slug: charset [A-Za-z0-9-] (essay directory stem)");
  }
  const eyebrowE = siteEsc(params.eyebrow);
  const titleE = siteEsc(params.title);
  const tagE = siteEsc(params.tag);

  const block =
    '        <li class="essay-list-item">\n' +
    '          <a href="/essays/' + slug + '/">\n' +
    '            <p class="essay-list-eyebrow">' + eyebrowE + "</p>\n" +
    '            <h2 class="essay-list-title">' + titleE + "</h2>\n" +
    '            <p class="essay-list-tag">' + tagE + "</p>\n" +
    "          </a>\n" +
    "        </li>\n";

  const next = siteInsertAtPosition(content, block, '<li class="essay-list-item">', params.position);
  return {
    content: next,
    summary: "Add essay card to /essays/: " + JSON.stringify(String(params.title)),
    message: "site-admin: essay-card — " + String(params.title),
  };
}


/* --- K212: blog-post + essay-page (page + index card, ONE commit) ---------
 * The new page's chrome (head, nav, footer, component includes, inline
 * styles) is grafted from a LIVE donor page fetched at op time — never an
 * embedded template that the ?v sweeps would silently miss. Substitutions
 * are occurrence-counted against the donor; drift 422s at preview. Pure
 * builders (donor, index, params) -> artifacts; node-testable. */

const SITE_BLOG_POST = {
  donor: "src/blog/the-easiest-case/index.html",
  index: "src/blog/index.html",
  slugBare: "the-easiest-case",
  title: "The Easiest Case",
  titleCount: 5, // <title> + og + twitter + JSON-LD headline + donor h1 (main swapped after)
  descs: [["The biosphere is a rapist with no nervous system. A blog note by WULD on the grammar of intervention, the suffering-only-on-the-ledger argument, and why the absence of an agent makes the case easier, not harder.", 4]],
  url: "/blog/the-easiest-case/",
  urlCount: 4, // canonical + og:url + JSON-LD url + mainEntityOfPage
  pub: "2026-05-15T22:45:49-07:00",
  mod: "2026-05-16T14:09:38-07:00",
};

const SITE_ESSAY_PAGE = {
  donor: "src/essays/architecture-of-moral-disaster/index.html",
  index: "src/essays/index.html",
  slugBare: "architecture-of-moral-disaster",
  title: "The Architecture of Moral Disaster",
  titleCount: 5,
  descs: [
    ["The Architecture of Moral Disaster &mdash; essay by WULD. Primate nervous system as ethical instrument, the motivated self-model, architecture before values, and the first possibility of genuine ethics. Full uncut source. 23:11 audio reading. Video adaptation at /watch/.", 3],
    ["The Architecture of Moral Disaster — essay by WULD. Primate nervous system as ethical instrument, the motivated self-model, architecture before values, and the first possibility of genuine ethics. Full uncut source. 23:11 audio reading. Video adaptation at /watch/.", 1],
  ],
  url: "/essays/architecture-of-moral-disaster/",
  urlCount: 4,
  pub: "2026-05-13T19:32:27-07:00",
  mod: "2026-05-16T14:09:38-07:00",
};

const SITE_MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

function sitePlain(s, label, max) {
  const v = String(s == null ? "" : s).trim();
  if (v.length > max) throw new SiteOpError(label + ": max " + max + " chars (got " + v.length + ")");
  if (/[<>"&\\]/.test(v)) {
    throw new SiteOpError(label + ": plain text only — no < > \" & or backslash (the value crosses HTML and JSON-LD contexts). Em-dashes, middots, apostrophes are fine.");
  }
  return v;
}

function siteSlugOf(params) {
  let slug = String(params.slug == null ? "" : params.slug).trim();
  if (!slug) {
    slug = String(params.title == null ? "" : params.title).toLowerCase()
      .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "").slice(0, 64).replace(/-+$/, "");
  }
  if (slug.indexOf("--") >= 0 || !/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(slug)) {
    throw new SiteOpError("slug: 3-64 chars of [a-z0-9-], no leading/trailing/double hyphen; got " + JSON.stringify(slug));
  }
  return slug;
}

function siteDateParts(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s == null ? "" : s).trim());
  if (!m) throw new SiteOpError("date: YYYY-MM-DD");
  const y = +m[1], mo = +m[2], d = +m[3];
  if (y < 2000 || y > 2200 || mo < 1 || mo > 12 || d < 1 || d > 31) {
    throw new SiteOpError("date: implausible YYYY-MM-DD");
  }
  const name = SITE_MONTHS[mo - 1];
  return { iso: m[0], y: String(y), monthName: name, monAbbr: name.slice(0, 3), day: String(d) };
}

/* escape FIRST, then md-lite: **bold**, *italic*, [text](url). */
function siteMdInline(escaped) {
  return escaped
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
}

function siteParas(text, indent, sep) {
  const parts = String(text == null ? "" : text).replace(/\r\n?/g, "\n").split(/\n{2,}/)
    .map(function (s) { return s.trim(); }).filter(Boolean);
  return parts.map(function (p) {
    return indent + "<p>" + siteMdInline(siteEsc(p).replace(/\n/g, " ")) + "</p>";
  }).join(sep);
}

function siteReplaceCount(content, find, repl, expect, label) {
  const n = content.split(find).length - 1;
  if (n !== expect) {
    throw new SiteOpError(label + ": expected " + expect + " occurrence(s) in the donor, found " + n +
      " — donor drift, or a title/summary/body that embeds the donor string. Adjust and re-preview.");
  }
  return content.split(find).join(repl);
}

function siteSwapMain(page, mainBlock) {
  const OPEN = '\n  <main id="main">\n';
  const CLOSE = '\n  </main>\n';
  if (page.split(OPEN).length - 1 !== 1 || page.split(CLOSE).length - 1 !== 1) {
    throw new SiteOpError("donor <main> anchors not unique — donor drift.");
  }
  const i = page.indexOf(OPEN);
  const j = page.indexOf(CLOSE);
  if (j < i) throw new SiteOpError("donor <main> anchors out of order — donor drift.");
  return page.slice(0, i + 1) + mainBlock + page.slice(j + CLOSE.length);
}

function siteWholeBalance(s) {
  const stripped = siteStripForCount(s);
  const bad = {};
  for (const t of SITE_TAGS) {
    const d = siteCountTag(stripped, t);
    if (d !== 0) bad[t] = d;
  }
  return Object.keys(bad).length ? bad : null;
}

/* grafts the donor head/chrome: descriptions FIRST (they may embed the
 * donor title), then title, url, dates. Returns the page pre-main-swap. */
function siteGraftHead(donor, cfg, title, summary, newUrl, isoDatetime) {
  let page = donor;
  for (const dv of cfg.descs) page = siteReplaceCount(page, dv[0], summary, dv[1], "donor description");
  page = siteReplaceCount(page, cfg.title, title, cfg.titleCount, "donor title");
  page = siteReplaceCount(page, cfg.url, newUrl, cfg.urlCount, "donor url");
  page = siteReplaceCount(page, cfg.pub, isoDatetime, 1, "donor datePublished");
  page = siteReplaceCount(page, cfg.mod, isoDatetime, 1, "donor dateModified");
  return page;
}

function siteBlogMain(p) {
  let meta =
    '          <span><strong>Author</strong> WULD</span>\n' +
    '          <span><strong>Date</strong> ' + p.date.monthName + ' ' + p.date.day + ', ' + p.date.y + '</span>\n';
  if (p.source) meta += '          <span><strong>Source</strong> ' + siteEsc(p.source) + '</span>\n';
  let fig = "";
  if (p.figureUrl) {
    fig =
      '      <figure class="post-figure">\n' +
      '        <img src="' + p.figureUrl + '" alt="' + siteEsc(p.figureAlt) + '">\n' +
      (p.figureCap ? '        <figcaption class="post-figcaption">' + siteEsc(p.figureCap) + '</figcaption>\n' : "") +
      '      </figure>\n\n';
  }
  return '  <main id="main">\n' +
    '    <article class="post">\n\n' +
    '      <header class="post-header">\n' +
    '        <p class="eyebrow">Blog &middot; ' + p.date.y + '</p>\n' +
    '        <h1>' + siteEsc(p.title) + '</h1>\n' +
    '        <div class="post-meta">\n' +
    meta +
    '        </div>\n' +
    '      </header>\n\n' +
    fig +
    '      <div class="post-body">\n\n' +
    siteParas(p.bodyText, "        ", "\n\n") + '\n\n' +
    '      </div>\n\n' +
    '      <p class="post-back"><a href="/blog/">&larr; Blog index</a></p>\n\n' +
    '    </article>\n' +
    '  </main>\n';
}

function siteBlogCard(content, p) {
  const block =
    '        <a class="post-card" href="/blog/' + p.slug + '/">\n' +
    '          <p class="post-card-date">' + p.date.y + ' &middot; ' + p.date.monthName + ' ' + p.date.day + '</p>\n' +
    '          <h2 class="post-card-title">' + siteEsc(p.title) + '</h2>\n' +
    '          <p class="post-card-excerpt">' + siteEsc(p.summary) + '</p>\n' +
    '          <p class="post-card-meta">Read &rarr;</p>\n' +
    '        </a>\n';
  const pos = String(p.position == null ? "" : p.position).trim();
  if (!pos) { // blog convention: newest first
    const anchor = '<div class="post-list">\n\n';
    const i = content.indexOf(anchor);
    if (i < 0 || content.indexOf(anchor, i + 1) >= 0) {
      throw new SiteOpError("post-list anchor not unique in /blog/ index — index drift.");
    }
    const at = i + anchor.length;
    return content.slice(0, at) + block + "\n" + content.slice(at);
  }
  return siteInsertAtPosition(content, block, '<a class="post-card"', pos);
}

function siteBlogBuild(donor, index, params) {
  siteRequire(params, ["title", "date", "summary", "body"]);
  const title = sitePlain(params.title, "title", 160);
  const summary = sitePlain(params.summary, "summary", 500);
  const source = sitePlain(params.source, "source", 80);
  const date = siteDateParts(params.date);
  const slug = siteSlugOf(params);
  if (slug.indexOf(SITE_BLOG_POST.slugBare) >= 0) {
    throw new SiteOpError("slug embeds the donor page's slug (" + SITE_BLOG_POST.slugBare + ") — pick a different slug.");
  }
  const figureUrl = String(params.figure_url == null ? "" : params.figure_url).trim();
  const figureAlt = sitePlain(params.figure_alt, "figure_alt", 300);
  const figureCap = sitePlain(params.figure_caption, "figure_caption", 200);
  if (figureUrl) {
    if (!/^(\/|https:\/\/)[^\s"<>]+$/.test(figureUrl)) {
      throw new SiteOpError("figure_url: site-relative /path or absolute https:// (no spaces/quotes)");
    }
    if (!figureAlt) throw new SiteOpError("figure_alt is required when figure_url is set.");
  }
  if (!String(params.body).trim()) throw new SiteOpError("body: empty — a blog post needs prose.");
  if (String(params.body).length > 200000) throw new SiteOpError("body: max 200000 chars");
  if (index.indexOf('href="/blog/' + slug + '/"') >= 0) {
    throw new SiteOpError("a /blog/" + slug + "/ card already exists in the index.");
  }
  let page = siteGraftHead(donor, SITE_BLOG_POST, title, summary, "/blog/" + slug + "/", date.iso + "T09:00:00-07:00");
  page = siteSwapMain(page, siteBlogMain({
    title: title, date: date, source: source, bodyText: params.body,
    figureUrl: figureUrl, figureAlt: figureAlt, figureCap: figureCap,
  }));
  if (page.indexOf(SITE_BLOG_POST.slugBare) >= 0) {
    throw new SiteOpError("donor slug leaked into the new page — donor drift; update the op.");
  }
  const newIndex = siteBlogCard(index, { slug: slug, title: title, summary: summary, date: date, position: params.position });
  return {
    pagePath: "src/blog/" + slug + "/index.html", page: page, newIndex: newIndex,
    summary: "New blog post /blog/" + slug + "/ — " + JSON.stringify(title) + " + index card (ONE commit)",
    message: "site-admin: blog-post — " + title + " (/blog/" + slug + "/)",
  };
}

function siteEssaySections(bodyText) {
  const norm = String(bodyText == null ? "" : bodyText).replace(/\r\n?/g, "\n");
  if (!norm.trim()) return null;
  const secs = [];
  let cur = { h: "", t: [] };
  for (const line of norm.split("\n")) {
    const hm = /^##\s+(.+?)\s*$/.exec(line);
    if (hm) {
      if (cur.h || cur.t.join("\n").trim()) secs.push(cur);
      cur = { h: hm[1], t: [] };
    } else {
      cur.t.push(line);
    }
  }
  if (cur.h || cur.t.join("\n").trim()) secs.push(cur);
  return secs.length ? secs : null;
}

function siteEssayMain(p) {
  let meta =
    '          <span><strong>Author</strong> WULD</span>\n' +
    '          <span><strong>Published</strong> ' + p.date.monAbbr + ' ' + p.date.y + '</span>\n';
  if (p.reading) meta += '          <span><strong>Reading</strong> ' + siteEsc(p.reading) + '</span>\n';

  let audio = "";
  if (p.audio) {
    audio =
      '        <div class="audio-intro">\n' +
      '          <p class="audio-intro-note"><strong>Audio reading</strong> &middot; full version &middot; ' + p.audio + '</p>\n' +
      '          <div class="audio-block" data-audio-key="essays/' + p.slug + '/full.mp3">\n' +
      '            <button class="audio-play" aria-label="Play narration"></button>\n' +
      '            <div class="audio-progress"><div class="audio-progress-bar"></div></div>\n' +
      '            <span class="audio-time">0:00</span>\n' +
      '          </div>\n' +
      '        </div>\n\n';
  }

  const secs = siteEssaySections(p.bodyText);
  let sections;
  if (!secs) {
    sections =
      '        <section class="essay-section">\n' +
      '          <p class="essay-section-eyebrow">Section I</p>\n' +
      '          <p><em>Body forthcoming &mdash; shell created via admin; fill sections with text-swap or chat-side authoring.</em></p>\n' +
      '        </section>\n';
  } else {
    sections = secs.map(function (s, i) {
      const head = s.h ? '          <h2>' + siteEsc(s.h) + '</h2>\n' : "";
      const paras = siteParas(s.t.join("\n"), "          ", "\n");
      return '        <section class="essay-section">\n' +
        '          <p class="essay-section-eyebrow">Section ' + romanize(i + 1) + '</p>\n' +
        head + paras + '\n' +
        '        </section>\n';
    }).join('\n        <hr class="section-rule">\n\n');
  }

  return '  <main id="main">\n' +
    '    <article class="essay" data-readable="' + p.slug + '">\n\n' +
    '      <header class="essay-header">\n' +
    '        <p class="eyebrow">Essay  /  ' + siteEsc(p.genre) + '</p>\n\n' +
    '        <h1>' + siteEsc(p.title) + '</h1>\n\n' +
    '        <div class="essay-meta">\n' +
    meta +
    '        </div>\n\n' +
    '        <div class="mode-toggle" role="group" aria-label="Reading mode">\n' +
    '          <button class="mode-toggle-btn" data-mode-target="dark"   aria-pressed="true">Dark</button>\n' +
    '          <button class="mode-toggle-btn" data-mode-target="reader" aria-pressed="false">Reader</button>\n' +
    '          <button class="mode-toggle-btn" data-mode-target="hc"     aria-pressed="false">HC</button>\n' +
    '        </div>\n' +
    '        <div class="mag-slider" role="group" aria-label="Text size">\n' +
    '          <span class="mag-slider-label">Size</span>\n' +
    '          <input class="mag-slider-input" type="range" min="90" max="140" step="5" value="100" aria-label="Text magnification percentage">\n' +
    '          <output class="mag-slider-output">100%</output>\n' +
    '        </div>\n' +
    '      </header>\n\n' +
    '      <div class="essay-body">\n\n' +
    audio +
    sections + '\n' +
    '      </div>\n' +
    '    </article>\n' +
    '  </main>\n';
}

function siteEssayBuild(donor, index, params) {
  siteRequire(params, ["title", "date", "genre", "summary"]);
  const title = sitePlain(params.title, "title", 160);
  const genre = sitePlain(params.genre, "genre", 60);
  const summary = sitePlain(params.summary, "summary", 500);
  const date = siteDateParts(params.date);
  const slug = siteSlugOf(params);
  if (slug.indexOf(SITE_ESSAY_PAGE.slugBare) >= 0) {
    throw new SiteOpError("slug embeds the donor page's slug (" + SITE_ESSAY_PAGE.slugBare + ") — pick a different slug.");
  }
  const audio = String(params.audio_duration == null ? "" : params.audio_duration).trim();
  if (audio && !/^\d{1,2}:\d{2}(:\d{2})?$/.test(audio)) {
    throw new SiteOpError("audio_duration: M:SS or H:MM:SS (e.g. 23:11)");
  }
  const bodyText = String(params.body == null ? "" : params.body);
  if (bodyText.length > 200000) throw new SiteOpError("body: max 200000 chars");
  let reading = sitePlain(params.reading, "reading", 24);
  if (!reading && bodyText.trim()) {
    const words = bodyText.trim().split(/\s+/).filter(Boolean).length;
    reading = "~" + Math.max(1, Math.round(words / 220)) + " min";
  }
  if (index.indexOf('href="/essays/' + slug + '/"') >= 0) {
    throw new SiteOpError("an /essays/" + slug + "/ card already exists in the index.");
  }
  let page = siteGraftHead(donor, SITE_ESSAY_PAGE, title, summary, "/essays/" + slug + "/", date.iso + "T09:00:00-07:00");
  page = siteSwapMain(page, siteEssayMain({
    title: title, genre: genre, date: date, slug: slug,
    audio: audio, reading: reading, bodyText: bodyText,
  }));
  if (page.indexOf(SITE_ESSAY_PAGE.slugBare) >= 0) {
    throw new SiteOpError("donor slug leaked into the new page — donor drift; update the op.");
  }
  const tag = date.y + " \u00b7 Long-form" + (audio ? " \u00b7 " + audio + " audio" : ""); // REAL middot: siteEssayCard siteEsc's the tag, an entity would double-escape
  const card = siteEssayCard(index, { slug: slug, eyebrow: genre, title: title, tag: tag, position: params.position });
  return {
    pagePath: "src/essays/" + slug + "/index.html", page: page, newIndex: card.content,
    summary: "New essay /essays/" + slug + "/ — " + JSON.stringify(title) + " + index card (ONE commit)",
    message: "site-admin: essay-page — " + title + " (/essays/" + slug + "/)",
  };
}

/* --- END K212 transforms --- */

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

/* ======================= wgate:embed:start (K246) ======================= */
/* Portable curtain transforms — embedded VERBATIM from tools/gate/wgate-core.cjs.
   Dependency-injected via WGATE_H below; wgate-rendersim proves this block's output
   is byte-identical to the standalone module. Do not hand-edit; re-run build-worker. */

/* NOTE: self-contained + dependency-injected. No require()/module refs in here. */

var WGATE_NAV_PATH = "src/components/nav.css";
var WGATE_SEARCH_META = '  <meta name="wuld-search" content="exclude">';
var WGATE_DEFAULT_LEDE = "This surface is still being fleshed out. It&rsquo;s dormant until release.";

function wgateQ(s) { return "'" + s + "'"; }   // single-quote wrap (prepaint literals)
function wgateDq(s) { return '"' + s + '"'; }   // double-quote wrap (logic literals)
function wgateCap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

/* Normalize + validate an operator/migration config into the canonical shape. */
function wgateConfig(input, H) {
  input = input || {};
  var slug = String(input.slug == null ? "" : input.slug).trim();
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new H.Err("wgate: slug must be lowercase letters/digits/hyphens (got: " + JSON.stringify(slug) + ").");
  }
  var pass = wgateValidatePass(input.pass, H);
  var eyebrow = (input.eyebrow == null || String(input.eyebrow).trim() === "")
    ? ("&#937; &nbsp;/&nbsp; " + wgateCap(slug)) : String(input.eyebrow);
  var lede = (input.lede == null || String(input.lede).trim() === "")
    ? WGATE_DEFAULT_LEDE : String(input.lede);
  return {
    slug: slug,
    pass: pass,
    storageKey: input.storageKey || ("wuld:gate:" + slug + ":unlocked"),
    openClass: input.openClass || ("wgate-" + slug + "-open"),
    gateId: input.gateId || ("wgate-" + slug),
    eyebrow: eyebrow,
    lede: lede,
    backHref: input.backHref || "/",
    backLabel: input.backLabel || "&larr; back to wuld.ink",
  };
}

function wgateValidatePass(p, H) {
  var s = String(p == null ? "" : p).trim();
  if (!s) throw new H.Err("wgate: passphrase required.");
  if (/["'<>\\\r\n]/.test(s)) {
    throw new H.Err("wgate: passphrase has a forbidden character (no quotes, <, >, backslash, newline).");
  }
  return s;
}

/* ---- pure block generators (no H; never throw) ---- */

function wgateStyleBlock(cfg) {
  return "" +
    '  <style id="wgate-style">\n' +
    '    /* wgate (K246) — canonical soft "not yet released" curtain. Client-side only:\n' +
    '       the page bytes remain public, so this is a dormancy curtain, not a security boundary. */\n' +
    "    #" + cfg.gateId + " {\n" +
    "      position: fixed;\n" +
    "      inset: 0;\n" +
    "      z-index: 2147483000;\n" +
    "      display: flex;\n" +
    "      align-items: center;\n" +
    "      justify-content: center;\n" +
    "      padding: 6vh 5vw;\n" +
    "      background: var(--c-bg, #0a0a0a);\n" +
    "      color: var(--c-fg, #e9e6df);\n" +
    "    }\n" +
    "    html." + cfg.openClass + " #" + cfg.gateId + " { display: none; }\n" +
    "    .wgate-box {\n" +
    "      width: min(30rem, 94vw);\n" +
    "      text-align: center;\n" +
    "      border: 1px solid var(--c-border-strong, #3a3b40);\n" +
    "      border-radius: 12px;\n" +
    "      padding: 2.2rem 1.6rem;\n" +
    "      background: var(--c-bg-elevated, #17181c);\n" +
    "    }\n" +
    "    .wgate-eyebrow {\n" +
    "      font-family: var(--font-mono, ui-monospace, monospace);\n" +
    "      font-size: 0.72rem;\n" +
    "      letter-spacing: 0.14em;\n" +
    "      text-transform: uppercase;\n" +
    "      color: var(--c-fg-muted, #8b8880);\n" +
    "      margin: 0 0 1rem;\n" +
    "    }\n" +
    "    .wgate-lede { font-size: 1.05rem; line-height: 1.6; margin: 0 0 1.5rem; }\n" +
    "    .wgate-form { display: flex; flex-direction: column; gap: 0.7rem; align-items: stretch; max-width: 20rem; margin: 0 auto; }\n" +
    "    .wgate-label {\n" +
    "      font-family: var(--font-mono, ui-monospace, monospace);\n" +
    "      font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase;\n" +
    "      color: var(--c-fg-muted, #8b8880); text-align: left;\n" +
    "    }\n" +
    "    .wgate-input {\n" +
    "      padding: 0.6rem 0.8rem; font: inherit;\n" +
    "      background: var(--c-bg, #0a0a0a); color: var(--c-fg, #e9e6df);\n" +
    "      border: 1px solid var(--c-border, #2a2b30); border-radius: 8px;\n" +
    "    }\n" +
    "    .wgate-input:focus-visible { outline: none; border-color: var(--c-accent, #c41e3a); }\n" +
    "    .wgate-btn {\n" +
    "      padding: 0.55rem 1rem; cursor: pointer; font: inherit;\n" +
    "      font-family: var(--font-mono, ui-monospace, monospace);\n" +
    "      font-size: 0.82rem; letter-spacing: 0.05em;\n" +
    "      background: var(--c-bg-overlay, #202127); color: var(--c-fg, #e9e6df);\n" +
    "      border: 1px solid var(--c-border-strong, #3a3b40); border-radius: 8px;\n" +
    "    }\n" +
    "    .wgate-btn:hover { border-color: var(--c-accent, #c41e3a); }\n" +
    "    .wgate-err { color: var(--c-accent, #c41e3a); font-size: 0.82rem; margin: 0.2rem 0 0; min-height: 1em; }\n" +
    "    .wgate-foot { margin: 1.5rem 0 0; font-size: 0.82rem; }\n" +
    "    .wgate-foot a { color: var(--c-fg-muted, #8b8880); }\n" +
    "  </style>";
}

function wgatePrepaint(cfg) {
  return "  <script>/*wgate-prepaint*/try{if(localStorage.getItem(" + wgateQ(cfg.storageKey) +
    ")===" + wgateQ("1") + ")document.documentElement.classList.add(" + wgateQ(cfg.openClass) +
    ");}catch(e){}</script>";
}

function wgateHeadSpan(cfg) {
  return "  <!-- wgate:head:start slug=" + cfg.slug +
    " (K246 canonical curtain; soft dormancy, view-source-visible, not a security boundary) -->\n" +
    wgateStyleBlock(cfg) + "\n" +
    wgatePrepaint(cfg) + "\n" +
    "  <!-- wgate:head:end -->\n";
}

function wgateOverlay(cfg) {
  return "" +
    '  <div id="' + cfg.gateId + '" role="dialog" aria-modal="true" aria-labelledby="wgate-lede">\n' +
    '    <div class="wgate-box">\n' +
    '      <p class="wgate-eyebrow">' + cfg.eyebrow + "</p>\n" +
    '      <p class="wgate-lede" id="wgate-lede">' + cfg.lede + "</p>\n" +
    '      <form class="wgate-form" autocomplete="off">\n' +
    '        <label class="wgate-label" for="wgate-input">Passphrase</label>\n' +
    '        <input id="wgate-input" class="wgate-input" type="password" autocomplete="off" spellcheck="false" autocapitalize="none">\n' +
    '        <button type="submit" class="wgate-btn">enter</button>\n' +
    '        <p class="wgate-err" role="alert" hidden>Not this time.</p>\n' +
    "      </form>\n" +
    '      <p class="wgate-foot"><a href="' + cfg.backHref + '">' + cfg.backLabel + "</a></p>\n" +
    "    </div>\n" +
    "  </div>";
}

function wgateLogic(cfg) {
  return "  <script>/*wgate-logic*/(function(){var PASS=" + wgateDq(cfg.pass) +
    ';var norm=function(s){return (s||"").trim().toLowerCase().replace(/[\\s\\-]+/g,"");};' +
    "var g=document.getElementById(" + wgateDq(cfg.gateId) + ");if(!g)return;" +
    "if(document.documentElement.classList.contains(" + wgateDq(cfg.openClass) + "))return;" +
    'var f=g.querySelector("form"),i=g.querySelector(".wgate-input"),e=g.querySelector(".wgate-err");' +
    'if(f){f.addEventListener("submit",function(ev){ev.preventDefault();' +
    "if(norm(i&&i.value)===norm(PASS)){try{localStorage.setItem(" + wgateDq(cfg.storageKey) + ',"1");}catch(_){}' +
    "document.documentElement.classList.add(" + wgateDq(cfg.openClass) + ");}" +
    "else{if(e)e.hidden=false;if(i){i.value=\"\";i.focus();}}});}if(i)i.focus();})();</script>";
}

function wgateBodySpan(cfg) {
  return "  <!-- wgate:body:start slug=" + cfg.slug + " -->\n" +
    wgateOverlay(cfg) + "\n" +
    wgateLogic(cfg) + "\n" +
    "  <!-- wgate:body:end -->";
}

/* ---- page transforms (H-injected; throw H.Err on drift/refusal) ---- */

function wgateHasGate(page) {
  return page.indexOf("<!-- wgate:head:start") >= 0 || page.indexOf("<!-- wgate:body:start") >= 0;
}

function wgateApply(page, cfg, H) {
  if (wgateHasGate(page)) {
    throw new H.Err("wgate:apply refused — page already carries a canonical curtain.");
  }
  var bodies = page.match(/<body\b[^>]*>/g) || [];
  if (bodies.length !== 1) {
    throw new H.Err("wgate:apply refused — expected exactly one <body> tag, found " + bodies.length + ".");
  }
  var withHead = H.count(page, "</head>", wgateHeadSpan(cfg) + "</head>", 1, "wgate:apply </head> anchor");
  var bodyTag = bodies[0];
  var withBody = H.count(withHead, bodyTag, bodyTag + "\n" + wgateBodySpan(cfg), 1, "wgate:apply <body> anchor");
  return withBody;
}

function wgateRemove(page, H) {
  if (!wgateHasGate(page)) {
    throw new H.Err("wgate:remove refused — no canonical curtain found on this page.");
  }
  if ((page.split("<!-- wgate:head:start").length - 1) !== 1) throw new H.Err("wgate:remove — head marker count != 1.");
  if ((page.split("<!-- wgate:body:start").length - 1) !== 1) throw new H.Err("wgate:remove — body marker count != 1.");
  var headRe = /  <!-- wgate:head:start[^\n]*-->\n[\s\S]*?  <!-- wgate:head:end -->\n/;
  var bodyRe = /\n  <!-- wgate:body:start[^\n]*-->\n[\s\S]*?  <!-- wgate:body:end -->/;
  if (!headRe.test(page)) throw new H.Err("wgate:remove — head span malformed.");
  if (!bodyRe.test(page)) throw new H.Err("wgate:remove — body span malformed.");
  return page.replace(headRe, "").replace(bodyRe, "");
}

function wgateRotate(page, newPass, H) {
  var re = /(\/\*wgate-logic\*\/\(function\(\)\{var PASS=")([^"]*)(")/;
  var g = new RegExp(re.source, "g");
  var cnt = 0;
  while (g.exec(page)) cnt++;
  if (cnt !== 1) throw new H.Err("wgate:rotate refused — expected exactly 1 canonical curtain, found " + cnt + ".");
  var np = wgateValidatePass(newPass, H);
  return page.replace(re, "$1" + np + "$3");
}

function wgateSlugFromPage(page) {
  var m = page.match(/<!-- wgate:head:start slug=([a-z0-9][a-z0-9-]*)/);
  return m ? m[1] : "";
}

/* ---- search-exclude meta (idempotent) ---- */

function wgateHasSearchMeta(page) {
  return /<meta[^>]+name=["']wuld-search["'][^>]+content=["']exclude["']/i.test(page);
}
function wgateAddSearchMeta(page, H) {
  if (wgateHasSearchMeta(page)) return page;
  return H.count(page, "</head>", WGATE_SEARCH_META + "\n</head>", 1, "wgate:search-meta </head> anchor");
}
function wgateRemoveSearchMeta(page, H) {
  var re = /  <meta[^>]+name=["']wuld-search["'][^>]+content=["']exclude["']>\n/;
  if (!re.test(page)) return page;
  var n = (page.match(new RegExp(re.source, "g")) || []).length;
  if (n !== 1) throw new H.Err("wgate:search-meta — expected 1 exclude meta, found " + n + ".");
  return page.replace(re, "");
}

/* ---- nav.css grey-tab rule (append on apply; regex-strip on remove) ---- */

function wgateNavBlock(slug) {
  return "\n/* K246 — " + slug + " tab greyed dormant until the surface is released (soft curtain).\n" +
    "   Reversible: delete this block to re-activate the tab. */\n" +
    '.site-nav a[href="/' + slug + '/"] { opacity: 0.4; }\n' +
    '.site-nav a[href="/' + slug + '/"]:hover,\n' +
    '.site-nav a[href="/' + slug + '/"]:focus-visible { opacity: 0.72; }\n';
}
function wgateNavHasRule(css, slug) {
  return css.indexOf('.site-nav a[href="/' + slug + '/"]') >= 0;
}
function wgateNavApply(css, slug, H) {
  if (wgateNavHasRule(css, slug)) throw new H.Err("nav: grey rule for /" + slug + "/ already present.");
  return css + wgateNavBlock(slug);
}
function wgateNavRemove(css, slug, H) {
  var esc = slug.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  // single-comment only: (?:[^*]|\*(?!/))* cannot cross a "*/", so an earlier nav
  // comment cannot float the match forward to an appended rule (K246 round-trip fix).
  var src = '\\n(?:/\\*(?:[^*]|\\*(?!/))*\\*/\\n)?' +
    '\\.site-nav a\\[href="/' + esc + '/"\\] \\{ opacity: 0\\.4; \\}\\n' +
    '\\.site-nav a\\[href="/' + esc + '/"\\]:hover,\\n' +
    '\\.site-nav a\\[href="/' + esc + '/"\\]:focus-visible \\{ opacity: 0\\.72; \\}\\n';
  var re = new RegExp(src);
  var n = (css.match(new RegExp(src, "g")) || []).length;
  if (n !== 1) throw new H.Err("nav: expected exactly 1 grey block for /" + slug + "/, found " + n + ".");
  return css.replace(re, "");
}


/* --- GATEKEEPER worker glue (K246): the three site-edit ops. --- */
const WGATE_H = { count: siteReplaceCount, Err: SiteOpError };

async function siteRunGateApply(env, params) {
  try { siteRequire(params, ["file_path", "slug", "passphrase"]); }
  catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
  let rel, cfg;
  try {
    rel = siteCleanRel(params.file_path);
    cfg = wgateConfig({ slug: params.slug, pass: params.passphrase, eyebrow: params.eyebrow, lede: params.lede, backHref: params.back_href, backLabel: params.back_label }, WGATE_H);
  } catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
  const head = await ghHead(env);
  if (!head.ok) return { fail: json({ error: head.error, detail: head.detail }, head.status || 502) };
  const page = await ghGetFile(env, rel);
  if (!page.ok) return { fail: json({ error: page.error, detail: page.detail, path: rel }, page.status || 502) };
  let newPage;
  try {
    newPage = wgateApply(page.content, cfg, WGATE_H);
    if (params.exclude_search !== false) newPage = wgateAddSearchMeta(newPage, WGATE_H);
  } catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
  const bal = siteWholeBalance(newPage);
  if (bal) return { fail: json({ error: "tag_balance_broken", delta: bal, path: rel }, 422) };
  const changes = [{ path: rel, content: newPage }];
  const report = [{ path: rel, note: "curtain injected (slug=" + cfg.slug + ")" }];
  if (params.grey_nav !== false) {
    const nav = await ghGetFile(env, WGATE_NAV_PATH);
    if (!nav.ok) return { fail: json({ error: nav.error, detail: nav.detail, path: WGATE_NAV_PATH }, nav.status || 502) };
    if (!wgateNavHasRule(nav.content, cfg.slug)) {
      let newNav;
      try { newNav = wgateNavApply(nav.content, cfg.slug, WGATE_H); }
      catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
      changes.push({ path: WGATE_NAV_PATH, content: newNav });
      report.push({ path: WGATE_NAV_PATH, note: "nav tab greyed" });
    } else {
      report.push({ path: WGATE_NAV_PATH, note: "nav rule already present (skipped)" });
    }
  }
  return {
    kind: "multi", headSha: head.commitSha, baseTreeSha: head.treeSha,
    changes: changes, report: report,
    excerpt: siteDiffExcerpt(page.content, newPage),
    summary: "gate-apply " + rel + " (slug=" + cfg.slug + "; " + changes.length + " file[s])",
    message: "site-admin: gate-apply " + rel + " (slug=" + cfg.slug + ", NO PIN)",
  };
}

async function siteRunGateRemove(env, params) {
  try { siteRequire(params, ["file_path"]); }
  catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
  let rel;
  try { rel = siteCleanRel(params.file_path); }
  catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
  const head = await ghHead(env);
  if (!head.ok) return { fail: json({ error: head.error, detail: head.detail }, head.status || 502) };
  const page = await ghGetFile(env, rel);
  if (!page.ok) return { fail: json({ error: page.error, detail: page.detail, path: rel }, page.status || 502) };
  const slug = (params.slug && String(params.slug).trim()) || wgateSlugFromPage(page.content);
  let newPage;
  try {
    newPage = wgateRemove(page.content, WGATE_H);
    if (params.unexclude_search === true) newPage = wgateRemoveSearchMeta(newPage, WGATE_H);
  } catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
  const bal = siteWholeBalance(newPage);
  if (bal) return { fail: json({ error: "tag_balance_broken", delta: bal, path: rel }, 422) };
  const changes = [{ path: rel, content: newPage }];
  const report = [{ path: rel, note: "curtain removed" }];
  if (params.ungrey_nav !== false && slug) {
    const nav = await ghGetFile(env, WGATE_NAV_PATH);
    if (!nav.ok) return { fail: json({ error: nav.error, detail: nav.detail, path: WGATE_NAV_PATH }, nav.status || 502) };
    if (wgateNavHasRule(nav.content, slug)) {
      let newNav;
      try { newNav = wgateNavRemove(nav.content, slug, WGATE_H); }
      catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
      changes.push({ path: WGATE_NAV_PATH, content: newNav });
      report.push({ path: WGATE_NAV_PATH, note: "nav tab un-greyed (slug=" + slug + ")" });
    }
  }
  return {
    kind: "multi", headSha: head.commitSha, baseTreeSha: head.treeSha,
    changes: changes, report: report,
    excerpt: siteDiffExcerpt(page.content, newPage),
    summary: "gate-remove " + rel + " (" + changes.length + " file[s])",
    message: "site-admin: gate-remove " + rel + " (NO PIN)",
  };
}

function siteGateRotate(content, params, relPath) {
  siteRequire(params, ["new_passphrase"]);
  const out = wgateRotate(content, params.new_passphrase, WGATE_H);
  return { content: out, summary: "gate-rotate " + relPath + " (passphrase changed)", message: "site-admin: gate-rotate " + relPath + " (NO PIN)" };
}
/* ======================== wgate:embed:end (K246) ======================== */

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

/* --- K220 media page + hosted card builders (pure) --- */
/* Donor-graft class (K212): the published page's chrome comes from the LIVE
 * donor src/watch/_donor/index.html at publish time; every substitution is
 * occurrence-counted, so donor drift 422s loud at preview. The player JS +
 * page CSS live in the donor HEAD (they survive the main swap) — one copy,
 * donor-maintained. nsfw pages KEEP the donor's robots-noindex + the
 * wuld-search exclude marker (build_index skips them); sfw pages strip both. */

const SITE_MEDIA_PAGE = {
  donor: "src/watch/_donor/index.html",
  index: "src/watch/index.html",
  slugBare: "_donor",
  title: "Media donor template page", titleCount: 3,
  desc: "Donor summary placeholder for hosted media pages; replaced verbatim at publish time.", descCount: 2,
  url: "/watch/_donor/", urlCount: 2,
  noindexLine: '  <meta name="robots" content="noindex,nofollow">\n',
  excludeLine: '  <meta name="wuld-search" content="exclude">\n',
};

const SITE_MEDIA_CARD_ANCHOR = "<!-- hosted-media-cards -->\n";
const SITE_MEDIA_SECTION = '    <!-- ============================================================\n' +
  '         Hosted — first-party media (admin media vertical, K220).\n' +
  '         Section + cards are inserted/removed by the admin publish ops;\n' +
  '         the section exists only while at least one card does.\n' +
  '         ============================================================ -->\n' +
  '    <section class="hosted-media" id="hosted">\n' +
  '      <h2 class="video-grid-heading">Hosted</h2>\n' +
  '      <div class="hosted-grid">\n' +
  SITE_MEDIA_CARD_ANCHOR +
  '      </div>\n' +
  '    </section>\n\n';
const SITE_MEDIA_GRID_COMMENT = '    <!-- Video grid. To refresh: swap in new <article class="video-card">';

function siteMediaGraft(donor, p) {
  let page = donor;
  page = siteReplaceCount(page, SITE_MEDIA_PAGE.desc, p.summary, SITE_MEDIA_PAGE.descCount, "donor description");
  page = siteReplaceCount(page, SITE_MEDIA_PAGE.title, p.title, SITE_MEDIA_PAGE.titleCount, "donor title");
  page = siteReplaceCount(page, SITE_MEDIA_PAGE.url, "/watch/" + p.id + "/", SITE_MEDIA_PAGE.urlCount, "donor url");
  if (!p.nsfw) {
    page = siteReplaceCount(page, SITE_MEDIA_PAGE.noindexLine, "", 1, "donor robots line");
    page = siteReplaceCount(page, SITE_MEDIA_PAGE.excludeLine, "", 1, "donor search-exclude line");
  }
  return page;
}

function siteMediaMain(p) {
  const tags = (p.nsfw ? " &middot; 18+" : "") + (p.exclusive ? " &middot; Exclusive" : "");
  const cfg = JSON.stringify({
    src: p.srcUrl, poster: p.posterUrl || "", nsfw: !!p.nsfw, exclusive: !!p.exclusive,
  }).replace(/</g, "\\u003c");
  return '  <main id="main">\n' +
    '    <article class="media-page">\n\n' +
    '      <header class="page-hero">\n' +
    '        <p class="page-hero-eyebrow">Watch &middot; Hosted' + tags + '</p>\n' +
    '        <h1 class="page-hero-title">' + siteEsc(p.title) + '</h1>\n' +
    '        <p class="media-meta">' + p.date.monthName + " " + p.date.day + ", " + p.date.y +
      (p.duration ? " &middot; " + siteEsc(p.duration) : "") + '</p>\n' +
    '      </header>\n\n' +
    '      <p class="media-summary">' + siteEsc(p.summary) + '</p>\n\n' +
    '      <div class="media-player" id="media-player">\n' +
    '        <noscript><p class="media-noscript">Video playback requires JavaScript' + (p.nsfw ? " and an age confirmation" : "") + '.</p></noscript>\n' +
    '      </div>\n' +
    '      <script type="application/json" id="media-config">' + cfg + '</script>\n\n' +
    '      <p class="media-back"><a href="/watch/">&larr; Watch index</a></p>\n\n' +
    '    </article>\n' +
    '  </main>\n';
}

function siteMediaCard(p) {
  return '        <a class="hosted-card" href="/watch/' + p.id + '/">\n' +
    '          <p class="hosted-card-eyebrow">Hosted' + (p.nsfw ? " &middot; 18+" : "") + '</p>\n' +
    '          <h3 class="hosted-card-title">' + siteEsc(p.title) + '</h3>\n' +
    '          <p class="hosted-card-meta">' + p.date.monAbbr + " " + p.date.y +
      (p.duration ? " &middot; " + siteEsc(p.duration) : "") + '</p>\n' +
    '        </a>\n';
}

/* First listed publish inserts the whole section (before the video-grid
 * comment); later ones insert a card after the anchor (newest first). */
function siteMediaIndexAdd(content, p) {
  const card = siteMediaCard(p);
  if (content.indexOf('id="hosted"') >= 0) {
    return siteReplaceCount(content, SITE_MEDIA_CARD_ANCHOR, SITE_MEDIA_CARD_ANCHOR + card, 1, "hosted cards anchor");
  }
  const section = SITE_MEDIA_SECTION.replace(SITE_MEDIA_CARD_ANCHOR, SITE_MEDIA_CARD_ANCHOR + card);
  return siteReplaceCount(content, SITE_MEDIA_GRID_COMMENT, section + SITE_MEDIA_GRID_COMMENT, 1, "watch grid comment anchor");
}

/* Card removal is TOLERANT of an absent card (unlisted items have none);
 * removing the last card retires the whole — then byte-deterministic —
 * empty section, so /watch/ never shows an empty Hosted heading. */
function siteMediaIndexRemove(content, id) {
  const opener = '        <a class="hosted-card" href="/watch/' + id + '/">\n';
  const i = content.indexOf(opener);
  if (i < 0) return content;
  if (content.indexOf(opener, i + 1) >= 0) throw new SiteOpError("hosted card for '" + id + "' not unique — index drift.");
  const CLOSE = "        </a>\n";
  const j = content.indexOf(CLOSE, i);
  if (j < 0) throw new SiteOpError("hosted card close not found — index drift.");
  let next = content.slice(0, i) + content.slice(j + CLOSE.length);
  if (next.indexOf('class="hosted-card"') < 0) {
    const empty = next.indexOf(SITE_MEDIA_SECTION);
    if (empty >= 0) next = next.slice(0, empty) + next.slice(empty + SITE_MEDIA_SECTION.length);
  }
  return next;
}
/* --- END K220 media builders (pure) --- */

/* --- END SITE TRANSFORMS (pure) --- */

/* ------------------------ site-edit endpoint layer ------------------------ */

async function siteRun(env, pattern, params) {
  params = params || {};
  if (pattern === "cache-bump") return siteRunCacheBump(env, params);
  if (pattern === "blog-post") return siteRunPagePlusCard(env, SITE_BLOG_POST.donor, SITE_BLOG_POST.index, siteBlogBuild, params);
  if (pattern === "essay-page") return siteRunPagePlusCard(env, SITE_ESSAY_PAGE.donor, SITE_ESSAY_PAGE.index, siteEssayBuild, params);
  if (pattern === "media-publish") return siteRunMediaFlip(env, params, "publish");
  if (pattern === "media-unpublish") return siteRunMediaFlip(env, params, "unpublish");
  if (pattern === "gate-apply") return siteRunGateApply(env, params);
  if (pattern === "gate-remove") return siteRunGateRemove(env, params);

  let rel, applyFn;
  if (pattern === "video-watch") { rel = "src/watch/index.html"; applyFn = siteVideoWatch; }
  else if (pattern === "rec-card") { rel = "src/recommendations/index.html"; applyFn = siteRecCard; }
  else if (pattern === "archive-video") { rel = "src/archive/index.html"; applyFn = siteVideoArchive; }
  else if (pattern === "archive-image") { rel = "src/archive/index.html"; applyFn = siteImageArchive; }
  else if (pattern === "essay-card") { rel = "src/essays/index.html"; applyFn = siteEssayCard; }
  else if (pattern === "text-swap") {
    try { siteRequire(params, ["file_path"]); rel = siteCleanRel(params.file_path); }
    catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
    applyFn = siteTextSwap;
  }
  else if (pattern === "gate-rotate") {
    try { siteRequire(params, ["file_path"]); rel = siteCleanRel(params.file_path); }
    catch (e) { if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) }; throw e; }
    applyFn = siteGateRotate;
  }
  else return { fail: json({ error: "unknown_pattern", known: ["video-watch", "rec-card", "archive-video", "archive-image", "essay-card", "text-swap", "cache-bump", "blog-post", "essay-page", "media-publish", "media-unpublish", "gate-apply", "gate-remove", "gate-rotate"] }, 400) };

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


/* K212 runner: page + index card as ONE multi commit. Preview reports the
 * NEW file + the index diff excerpt; commit re-runs deterministically at
 * the CAS'd head. Subrequests: preview 5, commit 9 (budget: fine). */
async function siteRunPagePlusCard(env, donorPath, indexPath, build, params) {
  const head = await ghHead(env);
  if (!head.ok) return { fail: json({ error: head.error, detail: head.detail }, head.status || 502) };
  const donor = await ghGetFile(env, donorPath);
  if (!donor.ok) return { fail: json({ error: donor.error, detail: donor.detail, path: donorPath }, donor.status || 502) };
  const index = await ghGetFile(env, indexPath);
  if (!index.ok) return { fail: json({ error: index.error, detail: index.detail, path: indexPath }, index.status || 502) };

  let out;
  try { out = build(donor.content, index.content, params || {}); }
  catch (e) {
    if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) };
    throw e;
  }

  const exists = await ghGetFile(env, out.pagePath);
  if (exists.ok) {
    return { fail: json({ error: "op_refused", detail: out.pagePath + " already exists — pick a different slug (edit the live page via text-swap)." }, 422) };
  }
  if (exists.error !== "file_not_found") {
    return { fail: json({ error: exists.error, detail: exists.detail, path: out.pagePath }, exists.status || 502) };
  }

  const pageBal = siteWholeBalance(out.page);
  if (pageBal) return { fail: json({ error: "tag_balance_broken", delta: pageBal, path: out.pagePath }, 422) };
  const idxDelta = siteTagDelta(index.content, out.newIndex);
  if (Object.keys(idxDelta).length) {
    return { fail: json({ error: "tag_balance_broken", delta: idxDelta, path: indexPath }, 422) };
  }

  const enc = new TextEncoder();
  return {
    kind: "multi", headSha: head.commitSha, baseTreeSha: head.treeSha,
    changes: [
      { path: out.pagePath, content: out.page },
      { path: indexPath, content: out.newIndex },
    ],
    report: [
      { path: out.pagePath, note: "NEW FILE · " + enc.encode(out.page).length + " B" },
      { path: indexPath, note: "card inserted" },
    ],
    excerpt: siteDiffExcerpt(index.content, out.newIndex),
    summary: out.summary, message: out.message,
  };
}

/* K220 runner: media publish/unpublish as diff-confirm site patterns.
 * publish  = NEW /watch/<id>/ page (donor graft) + /watch/ hosted card
 *            (when listed) + manifest status flip — ONE Git Data commit.
 * unpublish = page DELETE (tree sha:null) + card removal + flip back.
 * R2 gates run at preview AND commit (the object must exist to publish). */
async function siteRunMediaFlip(env, params, mode) {
  try { siteRequire(params, ["id"]); }
  catch (e) {
    if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) };
    throw e;
  }
  const id = String(params.id).trim();
  const head = await ghHead(env);
  if (!head.ok) return { fail: json({ error: head.error, detail: head.detail }, head.status || 502) };
  const manPath = mediaManifestPath(env);
  const manGot = await ghGetFile(env, manPath);
  if (!manGot.ok) return { fail: json({ error: manGot.error, detail: manGot.detail, path: manPath }, manGot.status || 502) };
  let man;
  try { man = JSON.parse(manGot.content); }
  catch { return { fail: json({ error: "media_manifest_parse_failed" }, 502) }; }
  if (man.schema_version !== 1 || !Array.isArray(man.items)) {
    return { fail: json({ error: "schema_unexpected", detail: "media manifest schema_version!==1" }, 409) };
  }
  const item = man.items.find(function (x) { return x.id === id; });
  if (!item) return { fail: json({ error: "op_refused", detail: "no media item '" + id + "' in the manifest." }, 422) };
  const pagePath = "src/watch/" + id + "/index.html";
  const idx = await ghGetFile(env, SITE_MEDIA_PAGE.index);
  if (!idx.ok) return { fail: json({ error: idx.error, detail: idx.detail, path: SITE_MEDIA_PAGE.index }, idx.status || 502) };

  let p;
  try {
    p = {
      id: id,
      title: sitePlain(item.title, "title", 160),
      summary: sitePlain(item.summary, "summary", 500),
      date: siteDateParts(item.date),
      duration: sitePlain(item.duration, "duration", 12),
      nsfw: (item.content_flags || []).indexOf("nsfw") >= 0,
      exclusive: (item.content_flags || []).indexOf("exclusive") >= 0,
      srcUrl: mediaBaseOf(env) + "/" + String(item.r2key || ""),
      posterUrl: item.poster ? mediaBaseOf(env) + "/" + item.poster : "",
    };
  } catch (e) {
    if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) };
    throw e;
  }

  const changes = [];
  const report = [];
  let newIndex = idx.content;

  if (mode === "publish") {
    if (item.status !== "draft") return { fail: json({ error: "op_refused", detail: "item is '" + item.status + "' — publish needs a draft." }, 422) };
    if (!env.MEDIA_BUCKET) return { fail: json({ error: "no_r2_binding" }, 503) };
    if (!mediaKeyOk(env, item.r2key)) return { fail: json({ error: "op_refused", detail: "item.r2key missing/invalid — upload the video first." }, 422) };
    const have = await env.MEDIA_BUCKET.head(item.r2key);
    if (!have) return { fail: json({ error: "op_refused", detail: "R2 object absent: " + item.r2key + " — upload before publish." }, 422) };
    if (item.poster) {
      const ph = await env.MEDIA_BUCKET.head(item.poster);
      if (!ph) return { fail: json({ error: "op_refused", detail: "poster R2 object absent: " + item.poster }, 422) };
    }
    const exists = await ghGetFile(env, pagePath);
    if (exists.ok) return { fail: json({ error: "op_refused", detail: pagePath + " already exists." }, 422) };
    if (exists.error !== "file_not_found") return { fail: json({ error: exists.error, detail: exists.detail, path: pagePath }, exists.status || 502) };
    const donor = await ghGetFile(env, SITE_MEDIA_PAGE.donor);
    if (!donor.ok) return { fail: json({ error: donor.error, detail: donor.detail, path: SITE_MEDIA_PAGE.donor }, donor.status || 502) };
    let page;
    try {
      page = siteSwapMain(siteMediaGraft(donor.content, p), siteMediaMain(p));
      if (page.indexOf(SITE_MEDIA_PAGE.slugBare) >= 0) {
        throw new SiteOpError("donor slug leaked into the new page — donor drift; update the op.");
      }
      if (item.listed) newIndex = siteMediaIndexAdd(newIndex, p);
    } catch (e) {
      if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) };
      throw e;
    }
    const bal = siteWholeBalance(page);
    if (bal) return { fail: json({ error: "tag_balance_broken", delta: bal, path: pagePath }, 422) };
    item.status = "published";
    item.published = today();
    changes.push({ path: pagePath, content: page });
    report.push({ path: pagePath, note: "NEW FILE · " + new TextEncoder().encode(page).length + " B" + (p.nsfw ? " · noindex + search-excluded (18+)" : "") });
  } else {
    if (item.status !== "published") return { fail: json({ error: "op_refused", detail: "item is '" + item.status + "' — unpublish needs a published item." }, 422) };
    const exists = await ghGetFile(env, pagePath);
    if (!exists.ok) return { fail: json({ error: "op_refused", detail: pagePath + " not found — already unpublished?" }, 422) };
    try { newIndex = siteMediaIndexRemove(newIndex, id); }
    catch (e) {
      if (e instanceof SiteOpError) return { fail: json({ error: "op_refused", detail: e.message }, 422) };
      throw e;
    }
    item.status = "draft";
    item.published = "";
    changes.push({ path: pagePath, delete: true });
    report.push({ path: pagePath, note: "DELETED (page comes down)" });
  }

  if (newIndex !== idx.content) {
    const d = siteTagDelta(idx.content, newIndex);
    if (Object.keys(d).length) return { fail: json({ error: "tag_balance_broken", delta: d, path: SITE_MEDIA_PAGE.index }, 422) };
    changes.push({ path: SITE_MEDIA_PAGE.index, content: newIndex });
    report.push({ path: SITE_MEDIA_PAGE.index, note: mode === "publish" ? "hosted card added" : "hosted card removed" });
  } else {
    report.push({ path: SITE_MEDIA_PAGE.index, note: "unchanged (unlisted item)" });
  }
  man.updated = today();
  changes.push({ path: manPath, content: JSON.stringify(man, null, 2) + "\n" });
  report.push({ path: manPath, note: "status -> " + item.status });

  return {
    kind: "multi", headSha: head.commitSha, baseTreeSha: head.treeSha,
    changes: changes, report: report,
    excerpt: newIndex !== idx.content ? siteDiffExcerpt(idx.content, newIndex) : undefined,
    summary: (mode === "publish" ? "Publish" : "Unpublish") + " hosted media /watch/" + id + "/ — " +
      JSON.stringify(item.title) + (item.listed ? " (listed)" : " (unlisted)") +
      (p.nsfw ? " [18+]" : "") + (p.exclusive ? " [exclusive-stub]" : ""),
    message: "media-admin: " + mode + " — " + item.title + " (/watch/" + id + "/)",
  };
}

async function apiSitePreview(request, env) {
  const body = await readJson(request);
  if (!body || !body.pattern) return json({ error: "bad_json", hint: "{pattern, params}" }, 400);
  const r = await siteRun(env, String(body.pattern), body.params || {});
  if (r.fail) return r.fail;

  if (r.kind === "multi") {
    return json({ ok: true, pattern: String(body.pattern), kind: "multi", summary: r.summary,
                  files: r.report, excerpt: r.excerpt, expected: { head: r.headSha }, commit_message: r.message });
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
      tree: changes.map(function (c) {
        return c.delete === true
          ? { path: c.path, mode: "100644", type: "blob", sha: null }   // K220: tree-level delete (media-unpublish)
          : { path: c.path, mode: "100644", type: "blob", content: c.content };
      }),
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
  // Service-token (non-interactive) path — OPT-IN via ACCESS_SERVICE_TOKEN_CN.
  // Cloudflare Access mints a JWT carrying `common_name` (the token Client ID)
  // and no `email` when a request authenticates with a service token allowed by
  // the Access app policy. Absent the env var this branch never fires, so the
  // default behaviour (interactive admin only) is byte-for-byte unchanged.
  if (!payload.email && payload.common_name && env.ACCESS_SERVICE_TOKEN_CN) {
    const allow = String(env.ACCESS_SERVICE_TOKEN_CN).split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    if (allow.indexOf(payload.common_name) >= 0) {
      return { ok: true, email: "service:" + payload.common_name, service: true };
    }
    return { ok: false, reason: "service_token_not_allowed" };
  }
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
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' 'self'; img-src https://audio.wuld.ink; media-src https://audio.wuld.ink; connect-src 'self'; frame-src https://wuld.ink",
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
  const mediaPrefix = env.MEDIA_PREFIX || "media/";
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>gallery-admin &mdash; wuld.ink</title>
<style>
  :root { --bg:#0a0a0a; --fg:#f0ebe5; --dim:#8a857e; --accent:#c41e3a; --border:#2a2a2a; }
  * { box-sizing: border-box; }
  body { background:var(--bg); color:var(--fg); font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:20px; line-height:1.6; margin:0; padding:2rem 1.5rem 6rem; }
  main { max-width: 64rem; margin: 0 auto; }
  h1 { font-size:23px; letter-spacing:.2em; text-transform:uppercase; border-bottom:1px solid var(--accent); padding-bottom:.5rem; }
  h1 small { color:var(--dim); letter-spacing:.05em; text-transform:none; float:right; }
  h2 { font-size:18px; letter-spacing:.15em; text-transform:uppercase; color:var(--accent); margin:2.5rem 0 .75rem; }
  fieldset { border:1px solid var(--border); padding:1rem; margin:0 0 1rem; }
  label { display:block; color:var(--dim); font-size:17px; text-transform:uppercase; letter-spacing:.1em; margin:.6rem 0 .15rem; }
  input[type=text], input[type=number], textarea, select { width:100%; background:#111; color:var(--fg); border:1px solid var(--border); padding:.4rem .5rem; font:inherit; }
  textarea { min-height:4.5rem; resize:vertical; }
  input:focus, textarea:focus, select:focus { outline:1px solid var(--accent); }
  button { background:none; border:1px solid var(--border); color:var(--fg); font:inherit; padding:.4rem .9rem; cursor:pointer; margin-top:.75rem; }
  button:hover { border-color:var(--accent); color:var(--accent); }
  button.danger { border-color:var(--accent); color:var(--accent); }
  table { width:100%; border-collapse:collapse; font-size:18px; }
  th, td { text-align:left; padding:.35rem .5rem; border-bottom:1px solid var(--border); vertical-align:top; }
  th { color:var(--dim); font-weight:normal; text-transform:uppercase; font-size:15px; letter-spacing:.1em; }
  td .rowbtn { margin:0 .35rem .2rem 0; padding:.3rem .55rem; font-size:17px; }
  .status { border:1px solid var(--border); padding:.75rem 1rem; color:var(--dim); white-space:pre-wrap; }
  .status b { color:var(--fg); font-weight:normal; }
  .flag { color:var(--accent); }
  #log { color:var(--dim); font-size:17px; white-space:pre-wrap; max-height:14rem; overflow:auto; border:1px dashed var(--border); padding:.5rem .75rem; }
  .row2 { display:grid; grid-template-columns:1fr 1fr; gap:0 1rem; }
  .hint { color:var(--dim); font-size:17px; margin:.25rem 0 0; }
  pre.diff { background:#111; border:1px solid var(--border); padding:.5rem .75rem; font-size:17px; line-height:1.5; white-space:pre-wrap; word-break:break-all; max-height:11rem; overflow:auto; margin:.35rem 0 .6rem; }
  pre.diff.after { border-color:var(--accent); }
  .diffmeta { color:var(--dim); font-size:17px; white-space:pre-wrap; }
  #site-preview { display:none; border:1px solid var(--accent); padding:1rem; margin:1rem 0; }
  .jump { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--border); padding:.55rem 0 .6rem; display:flex; flex-wrap:wrap; gap:.3rem 1rem; }
  .jump a { color:var(--dim); text-decoration:none; font-size:15px; text-transform:uppercase; letter-spacing:.12em; border-bottom:1px solid transparent; }
  .jump a:hover, .jump a:focus-visible { color:var(--accent); border-bottom-color:var(--accent); outline:none; }
  details.tool { border-bottom:1px dashed var(--border); scroll-margin-top:3rem; }
  details.tool summary { list-style:none; cursor:pointer; }
  details.tool summary::-webkit-details-marker { display:none; }
  details.tool summary h2 { margin:1.1rem 0 .8rem; }
  details.tool summary h2::before { content:"+ "; color:var(--dim); }
  details.tool[open] summary h2::before { content:"- "; }
  details.tool summary:focus-visible { outline:1px solid var(--accent); outline-offset:2px; }
  details.tool > fieldset, details.tool > table { margin-bottom:1.25rem; }
  h2[id] { scroll-margin-top:3rem; }
  .tablebar { display:flex; gap:.5rem; align-items:center; margin:.25rem 0 .5rem; }
  .tablebar input[type=text] { flex:1; min-width:10rem; }
  .tablebar select { width:auto; }
  .tablebar button { margin-top:0; padding:.2rem .6rem; }
  .tablebar span { color:var(--dim); font-size:17px; white-space:nowrap; }
  .vh { position:absolute; clip:rect(0 0 0 0); clip-path:inset(50%); width:1px; height:1px; overflow:hidden; white-space:nowrap; }
  .cmt { border:1px solid var(--border); padding:.6rem .75rem; margin:.6rem 0; }
  .cmt.is-hidden { opacity:.55; border-style:dashed; }
  .cmt-meta { color:var(--dim); font-size:15px; letter-spacing:.06em; display:flex; flex-wrap:wrap; gap:.2rem .9rem; }
  .cmt-meta b { color:var(--fg); font-weight:normal; }
  .cmt-flag { color:#fff; background:var(--accent); padding:0 .35rem; }
  .cmt textarea { margin-top:.4rem; min-height:3rem; }
  #md-preview video { width:100%; max-width:32rem; margin-top:.75rem; border:1px solid var(--border); background:#000; }
  progress { width:100%; accent-color:var(--accent); }
  button:disabled { opacity:.45; cursor:default; }
  input[type=file] { color:var(--dim); font-size:17px; max-width:100%; }
  input[type=file]:focus-visible, input[type=checkbox]:focus-visible { outline:1px solid var(--accent); outline-offset:2px; }
  @media (prefers-reduced-motion: no-preference) { html { scroll-behavior:smooth; } }
</style></head>
<body><main>
<h1>gallery-admin <small>${escHtml(adminEmail || "")} &middot; ${escHtml(env.GITHUB_REPO || "")}</small></h1>

<nav class="jump" aria-label="Section index">
  <a href="#sec-status">status</a>
  <a href="#sec-upload">upload</a>
  <a href="#sec-plate">plate form</a>
  <a href="#sec-plates">plates</a>
  <a href="#sec-watch">watch card</a>
  <a href="#sec-rec">rec card</a>
  <a href="#sec-swap">text-swap</a>
  <a href="#sec-bump">cache-bump</a>
  <a href="#sec-archv">archive video</a>
  <a href="#sec-archi">archive image</a>
  <a href="#sec-essaycard">essay card</a>
  <a href="#sec-blog">new blog post</a>
  <a href="#sec-essay">new essay</a>
  <a href="#sec-media">media</a>
  <a href="#sec-cmod">comments</a>
  <a href="#sec-fx">fx</a>
  <a href="#sec-yurei">y&#363;rei</a>
  <a href="#sec-gaplog">gap log</a>
  <a href="#sec-gatekeeper">gatekeeper</a>
  <a href="#sec-log">log</a>
</nav>

<h2 id="sec-status">Status</h2>
<div class="status" id="status">loading manifest&hellip;</div>

<details class="tool" id="sec-upload"><summary><h2>1 &middot; Upload media &rarr; R2 (${escHtml(prefix)})</h2></summary>
<fieldset>
  <label>file (webp / png / jpeg / mp4, &le; 25 MiB)</label>
  <input type="file" id="up-file" accept="image/webp,image/png,image/jpeg,video/mp4">
  <label>key stem (optional; defaults from filename; extension derives from verified type)</label>
  <input type="text" id="up-key" placeholder="plate-28-some-title">
  <label><input type="checkbox" id="up-overwrite"> overwrite if key exists</label>
  <button id="up-go">upload</button>
  <p class="hint">interim alternative: R2 dashboard drag-drop into ${escHtml(prefix)} still works.</p>
</fieldset>

</details>

<details class="tool" id="sec-plate"><summary><h2>2 &middot; Plate entry &rarr; manifest commit</h2></summary>
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
  <div class="row2">
    <div><label>category (slug; must exist in manifest)</label><input type="text" id="pf-category" placeholder="editorial"></div>
    <div><label>caption tier (blank = inherit category)</label><select id="pf-captier"><option value=""></option><option>full</option><option>title</option><option>none</option></select></div>
  </div>
  <div class="row2">
    <div><label>media kind</label><select id="pf-kind"><option>image</option><option>video</option></select></div>
    <div><label>poster r2key (video; optional)</label><input type="text" id="pf-poster"></div>
  </div>
  <div class="row2">
    <div><label>print url (https://&hellip;; blank = no buy link)</label><input type="text" id="pf-printurl" placeholder="https://wuld-ink.printful.me/..."></div>
    <div><label>featured</label><label style="text-transform:none"><input type="checkbox" id="pf-featured"> featured (curated front-of-house pick)</label></div>
  </div>
  <div class="row2">
    <div><label>paired video plate id (image plate; blank = unpaired)</label><input type="text" id="pf-video" placeholder="main-character-&hellip;"></div>
  </div>
  <button id="pf-go">add plate (1 commit)</button>
  <button id="pf-cancel" style="display:none">cancel edit</button>
</fieldset>

</details>

<details class="tool" id="sec-plates"><summary><h2>3 &middot; Plates</h2></summary>
<div class="tablebar">
  <input type="text" id="pl-q" placeholder="filter: id / title / series / num / flag / category&hellip;" aria-label="Filter plates">
  <select id="pl-size" aria-label="Rows per page"><option selected>25</option><option>50</option><option>100</option><option value="all">all</option></select>
  <button id="pl-prev" type="button" aria-label="Previous page">&laquo;</button>
  <span id="pl-info" role="status">&ndash;</span>
  <button id="pl-next" type="button" aria-label="Next page">&raquo;</button>
</div>
<table><caption class="vh">Plates &mdash; filtered, paginated manifest table</caption><thead><tr><th>ord</th><th>num</th><th>id</th><th>title</th><th>flags</th><th>tier</th><th></th></tr></thead>
<tbody id="plates"></tbody></table>

</details>

<details class="tool" id="sec-watch"><summary><h2>4 &middot; Site &mdash; add /watch/ video card</h2></summary>
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

</details>

<details class="tool" id="sec-rec"><summary><h2>5 &middot; Site &mdash; add recommendation card</h2></summary>
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

</details>

<details class="tool" id="sec-swap"><summary><h2>6 &middot; Site &mdash; text-swap</h2></summary>
<fieldset>
  <label>file (src/&hellip; relative path)</label><input type="text" id="ts-path" placeholder="src/blog/index.html">
  <label>find (exact bytes; must be unique unless replace-all)</label><textarea id="ts-find"></textarea>
  <label>replace (empty = delete)</label><textarea id="ts-replace"></textarea>
  <label style="text-transform:none"><input type="checkbox" id="ts-all"> replace all occurrences</label>
  <label style="text-transform:none"><input type="checkbox" id="ts-tagok"> allow tag-balance delta (rare; intended tag edits only)</label>
  <button class="site-prev" data-pattern="text-swap">preview</button>
</fieldset>

</details>

<details class="tool" id="sec-bump"><summary><h2>7 &middot; Site &mdash; cache-bump (?v= sweep, one commit)</h2></summary>
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

</details>

<details class="tool" id="sec-archv"><summary><h2>8 &middot; Site &mdash; add /archive/ video card</h2></summary>
<fieldset>
  <div class="row2">
    <div><label>youtube / playlist id</label><input type="text" id="av-id" placeholder="GSDN0vu18Fo or PL…"></div>
    <div><label>id type</label><select id="av-idtype"><option value="video">video</option><option value="playlist">playlist</option></select></div>
  </div>
  <div class="row2">
    <div><label>title</label><input type="text" id="av-title"></div>
    <div><label>eyebrow</label><input type="text" id="av-eyebrow" placeholder="VIDEO &middot; Apr 2026"></div>
  </div>
  <div class="row2">
    <div><label>thumb video id (required for playlist)</label><input type="text" id="av-thumb" placeholder="GSDN0vu18Fo"></div>
    <div><label>sub (optional)</label><input type="text" id="av-sub"></div>
  </div>
  <label>position (blank = append; 1 = first)</label><input type="text" id="av-pos">
  <button class="site-prev" data-pattern="archive-video">preview</button>
</fieldset>

</details>

<details class="tool" id="sec-archi"><summary><h2>9 &middot; Site &mdash; add /archive/ image card</h2></summary>
<fieldset>
  <div class="row2">
    <div><label>slug (filename stem; url = audio.wuld.ink/archive/images/&lt;slug&gt;.webp)</label><input type="text" id="ai-slug" placeholder="some-plate"></div>
    <div><label>kind (eyebrow)</label><input type="text" id="ai-kind" placeholder="DRAWING &middot; 2026"></div>
  </div>
  <div class="row2">
    <div><label>title</label><input type="text" id="ai-title"></div>
    <div><label>alt text</label><input type="text" id="ai-alt"></div>
  </div>
  <label>note</label><textarea id="ai-note"></textarea>
  <label>position (blank = append; 1 = first)</label><input type="text" id="ai-pos">
  <button class="site-prev" data-pattern="archive-image">preview</button>
</fieldset>

</details>

<details class="tool" id="sec-essaycard"><summary><h2>10 &middot; Site &mdash; add /essays/ index card</h2></summary>
<fieldset>
  <div class="row2">
    <div><label>slug (essay dir stem; href = /essays/&lt;slug&gt;/)</label><input type="text" id="ec-slug" placeholder="a-new-essay"></div>
    <div><label>eyebrow</label><input type="text" id="ec-eyebrow" placeholder="ESSAY &middot; forthcoming"></div>
  </div>
  <div class="row2">
    <div><label>title</label><input type="text" id="ec-title"></div>
    <div><label>tag</label><input type="text" id="ec-tag" placeholder="anti-natalism"></div>
  </div>
  <label>position (blank = append; 1 = first)</label><input type="text" id="ec-pos">
  <button class="site-prev" data-pattern="essay-card">preview</button>
</fieldset>

</details>

<details class="tool" id="sec-blog"><summary><h2>11 &middot; Site &mdash; new BLOG POST (page + index card, one commit)</h2></summary>
<fieldset>
  <div class="row2">
    <div><label>title</label><input type="text" id="bp-title"></div>
    <div><label>slug (blank = from title; url = /blog/&lt;slug&gt;/)</label><input type="text" id="bp-slug" placeholder="my-new-post"></div>
  </div>
  <div class="row2">
    <div><label>date</label><input type="text" id="bp-date" placeholder="2026-07-09"></div>
    <div><label>source (optional; e.g. Facebook note)</label><input type="text" id="bp-source"></div>
  </div>
  <label>summary (meta description + index-card excerpt; plain text)</label><textarea id="bp-summary"></textarea>
  <div class="row2">
    <div><label>figure url (optional; /assets/&hellip; or https://audio.wuld.ink/&hellip;)</label><input type="text" id="bp-figurl"></div>
    <div><label>figure alt (required with figure)</label><input type="text" id="bp-figalt"></div>
  </div>
  <label>figure caption (optional)</label><input type="text" id="bp-figcap">
  <label>body &mdash; blank line = new paragraph; **bold**, *italic*, [link](https://&hellip;)</label><textarea id="bp-body" style="min-height:14rem"></textarea>
  <label>position (blank = newest first; 0 = append last; N = slot)</label><input type="text" id="bp-pos">
  <button class="site-prev" data-pattern="blog-post">preview</button>
  <p class="hint">creates /blog/&lt;slug&gt;/ with CURRENT site chrome (grafted live from the donor post) + prepends the /blog/ card &mdash; ONE commit; Pages deploys in ~1 min. Site-search + changelog pick it up at the next Cowork regen pass.</p>
</fieldset>

</details>

<details class="tool" id="sec-essay"><summary><h2>12 &middot; Site &mdash; new ESSAY (page + index card, one commit)</h2></summary>
<fieldset>
  <div class="row2">
    <div><label>title</label><input type="text" id="ep-title"></div>
    <div><label>slug (blank = from title; url = /essays/&lt;slug&gt;/)</label><input type="text" id="ep-slug"></div>
  </div>
  <div class="row2">
    <div><label>date</label><input type="text" id="ep-date" placeholder="2026-07-09"></div>
    <div><label>genre eyebrow (page + card; e.g. Moral structure)</label><input type="text" id="ep-genre"></div>
  </div>
  <label>summary (meta description; plain text)</label><textarea id="ep-summary"></textarea>
  <div class="row2">
    <div><label>audio duration (optional, e.g. 23:11 &mdash; adds the audio band; key = essays/&lt;slug&gt;/full.mp3)</label><input type="text" id="ep-audio"></div>
    <div><label>reading time (blank = auto from body; e.g. ~17 min)</label><input type="text" id="ep-reading"></div>
  </div>
  <label>body &mdash; a "## Heading" line starts a numbered Section; blank line = paragraph; **bold**, *italic*, [link](url); EMPTY = placeholder shell</label><textarea id="ep-body" style="min-height:14rem"></textarea>
  <label>position (blank = append last; 1 = first; N = slot)</label><input type="text" id="ep-pos">
  <button class="site-prev" data-pattern="essay-page">preview</button>
  <p class="hint">mirrors the live essays: reader/HC mode toggle + text-size slider + optional audio band + Section I/II&hellip; structure, chrome grafted live from the donor essay. The audio FILE still lands in R2 by hand (key essays/&lt;slug&gt;/full.mp3). Register note: chat-side authoring remains the norm for essay prose &mdash; this op ships the vessel (or a finished body pasted in).</p>
</fieldset>
</details>

<details class="tool" id="sec-media"><summary><h2>13 &middot; MEDIA &mdash; hosted video (R2 ${escHtml(mediaPrefix)} &middot; draft &rarr; publish)</h2></summary>
<fieldset>
  <label>video file (mp4 / webm; any size &mdash; big files slice into 32 MiB parts)</label>
  <input type="file" id="md-file" accept="video/mp4,video/webm">
  <div class="row2">
    <div><label>key stem (blank = from filename)</label><input type="text" id="md-stem" placeholder="my-video"></div>
    <div><label style="text-transform:none"><input type="checkbox" id="md-overwrite"> overwrite if key exists</label>
    <button id="md-upload" type="button">upload video</button></div>
  </div>
  <progress id="md-prog" max="100" value="0" style="width:100%" hidden aria-label="Upload progress"></progress>
  <p class="hint" id="md-prog-note" role="status"></p>
  <label>poster image (webp / png / jpeg, &le; 25 MiB &mdash; optional; key = &lt;stem&gt;-poster)</label>
  <input type="file" id="md-poster-file" accept="image/webp,image/png,image/jpeg">
  <button id="md-poster-upload" type="button">upload poster</button>
  <div id="md-preview"></div>
</fieldset>
<fieldset id="media-form">
  <input type="hidden" id="mi-mode" value="add">
  <div class="row2">
    <div><label>id (slug; fixed after add; page = /watch/&lt;id&gt;/)</label><input type="text" id="mi-id" placeholder="my-video"></div>
    <div><label>title</label><input type="text" id="mi-title"></div>
  </div>
  <div class="row2">
    <div><label>date</label><input type="text" id="mi-date" placeholder="2026-07-11"></div>
    <div><label>duration (optional; M:SS or H:MM:SS)</label><input type="text" id="mi-duration" placeholder="23:59"></div>
  </div>
  <label>summary (meta description + page lede; plain text)</label><textarea id="mi-summary"></textarea>
  <div class="row2">
    <div><label>video r2key (filled by upload)</label><input type="text" id="mi-r2key" placeholder="${escHtml(mediaPrefix)}my-video.mp4"></div>
    <div><label>poster r2key (optional)</label><input type="text" id="mi-poster" placeholder="${escHtml(mediaPrefix)}my-video-poster.webp"></div>
  </div>
  <div class="row2">
    <div><label>flags</label>
      <label style="text-transform:none"><input type="checkbox" id="mi-nsfw"> nsfw &mdash; 18+ interstitial, noindex, search-excluded</label>
      <label style="text-transform:none"><input type="checkbox" id="mi-exclusive"> exclusive &mdash; locked stub (access wiring is a later session)</label>
    </div>
    <div><label>listing</label>
      <label style="text-transform:none"><input type="checkbox" id="mi-listed" checked> listed on /watch/ (18+ items list text-only, tagged 18+)</label>
    </div>
  </div>
  <button id="mi-go" type="button">add item (draft, 1 commit)</button>
  <button id="mi-cancel" type="button" style="display:none">cancel edit</button>
  <p class="hint">flow: upload &rarr; add item (draft) &rarr; publish from the row below. publish opens the standard diff-confirm preview (grafted /watch/&lt;id&gt;/ page + hosted card + manifest flip, ONE commit; ~1 min to live). unpublish takes the page down the same way. Lawful content only &mdash; this terminal is single-operator and what lands here is on the operator.</p>
</fieldset>
<table><caption class="vh">Media items &mdash; manifest table</caption><thead><tr><th>id</th><th>title</th><th>date</th><th>status</th><th>flags</th><th>listed</th><th></th></tr></thead>
<tbody id="media-items"></tbody></table>

</details>

<details class="tool" id="sec-cmod"><summary><h2>14 &middot; COMMENTS &mdash; board moderation (one roof)</h2></summary>
<fieldset>
  <div class="tablebar">
    <span>board</span>
    <span id="cm-state" role="status">&ndash;</span>
    <button id="cm-toggle" type="button">toggle</button>
    <button id="cm-reload" type="button">reload</button>
    <span id="cm-counts"></span>
  </div>
  <div class="tablebar">
    <span>purge</span>
    <button id="cm-hide-all" type="button">hide all visible</button>
    <button id="cm-del-hidden" type="button">delete hidden</button>
    <button id="cm-del-all" type="button" class="danger">delete ALL</button>
  </div>
  <p class="hint">same D1 rows the old wuld.ink/admin surface moderates (parity table: operator guide &sect;12). the public board on /chat/ still posts through the comments worker; email stays admin-only. retire the old surface only after this one checks out.</p>
  <div id="cm-list"></div>
  <div class="tablebar">
    <button id="cm-prev" type="button" aria-label="Previous comments page">&laquo;</button>
    <span id="cm-info" role="status">&ndash;</span>
    <button id="cm-next" type="button" aria-label="Next comments page">&raquo;</button>
  </div>
</fieldset>

</details>

<div id="site-preview">
  <div class="diffmeta" id="sp-meta"></div>
  <div id="sp-body"></div>
  <button id="sp-commit">commit</button>
  <button id="sp-discard">discard</button>
</div>


<details class="tool" id="sec-fx"><summary><h2>15 &middot; FX / Voice bench</h2></summary>
<p>Live control of the wrong-hour FX system + her voice, embedded from wuld.ink so audition works here. Tuning writes this browser's localStorage (every page reads it). "copy site-fx.json" exports the config for a future site-wide default.</p>
<iframe src="https://wuld.ink/_/fx-bench/" title="FX / Voice bench" loading="lazy" style="width:100%;height:660px;border:1px solid #3a3a3a;border-radius:2px;background:#0a0a0a"></iframe>
</details>


<details class="tool" id="sec-yurei"><summary><h2>16 &middot; Testing Y&#363;rei &mdash; live matcher + coverage HUD</h2></summary>
<style>
  #ty-transcript { display:flex; flex-direction:column; gap:.5rem; margin:.6rem 0; max-height:520px; overflow:auto; }
  .ty-turn { display:flex; flex-direction:column; gap:.25rem; }
  .ty-q { color:var(--dim); font-size:15px; }
  .ty-bubble { border-left:3px solid var(--border); padding:.4rem .6rem; background:rgba(255,255,255,.02); border-radius:2px; }
  .ty-bubble.ty-fresh { border-left-color:#3fb950; }
  .ty-bubble.ty-seen  { border-left-color:#d29922; }
  .ty-bubble.ty-miss  { border-left-color:#6e7681; opacity:.92; }
  .ty-r { white-space:pre-wrap; }
  .ty-meta { display:flex; flex-wrap:wrap; gap:.3rem .8rem; margin-top:.35rem; font-size:13px; color:var(--dim); text-transform:uppercase; letter-spacing:.08em; align-items:center; }
  .ty-meta .rowbtn { text-transform:none; letter-spacing:normal; }
  .gl-row { border-bottom:1px solid var(--border); padding:.45rem 0; }
  .gl-row.gl-resolved { opacity:.5; }
  .gl-c { white-space:pre-wrap; }
  .gl-tags { display:flex; flex-wrap:wrap; gap:.3rem .8rem; margin-top:.3rem; font-size:13px; color:var(--dim); align-items:center; }
</style>
<p class="hint">Runs the EXACT live matcher (wuld.ink/components/yurei-oracle.js) + corpora, proxied same-origin &mdash; nothing here touches the public widget. <b>Green</b> = a response id never shown before (new coverage); <b>yellow</b> = seen before; grey = deflection/miss. Miss turns (below-threshold or all-damped, never repeats) log <b>PII-scrubbed</b> to the Gap Log. Raw input never leaves this browser &mdash; only scrubbed misses + anonymous votes are sent.</p>
<div class="tablebar">
  <span id="ty-status" role="status">not loaded</span>
  <label><input type="checkbox" id="ty-unsealed"> unsealed (room tier)</label>
  <button id="ty-reset-seen" type="button">reset seen (<span id="ty-seen-n">0</span>)</button>
  <button id="ty-new-session" type="button">new session</button>
</div>
<div id="ty-transcript" aria-live="polite"></div>
<form id="ty-form" autocomplete="off"><div class="tablebar">
  <input type="text" id="ty-input" aria-label="Ask the testing Yurei" placeholder="type an input to test coverage&hellip;" style="flex:1 1 auto">
  <button type="submit">send</button>
</div></form>
</details>

<details class="tool" id="sec-gaplog"><summary><h2>17 &middot; Gap Log &mdash; coverage misses + hit quality</h2></summary>
<div class="tablebar">
  <span>lane</span>
  <button id="gl-lane-miss" type="button">misses</button>
  <button id="gl-lane-hit" type="button">hit quality</button>
  <span>&middot; sort</span>
  <button id="gl-sort-count" type="button">count</button>
  <button id="gl-sort-date" type="button">date</button>
  <button id="gl-sort-class" type="button">class</button>
  <button id="gl-reload" type="button">reload</button>
  <a id="gl-export" class="rowbtn" href="/api/gaplog/export?lane=miss" download>export</a>
    <span>&middot; visitor lane</span>
    <span id="gl-visitor-chip">&ndash;</span>
    <button id="gl-visitor-toggle" type="button">toggle</button>
</div>
<p class="hint">Miss rows are PII-scrubbed inputs the matcher had no answer for &mdash; <b>never auto-deleted</b>. <b>resolve</b> marks a gap handled; <b>redact</b> blanks one row's content; <b>drop</b> removes one row (manual remedy only). Hit-quality: <b>thin</b> = one entry fired &ge;3&times; in a session; <b>novel</b>/<b>repetitive</b> are your votes. No identity, no query content on the hit lane.</p>
<div id="gl-info" role="status">&ndash;</div>
<div id="gl-list"></div>
</details>

<details class="tool" id="sec-gatekeeper"><summary><h2>18 &middot; GATEKEEPER &mdash; page curtains</h2></summary>
<p class="hint"><b>Soft dormancy curtains.</b> A passphrase hides a page until release. The passphrase is <b>visible in page source</b> &mdash; this manages dormancy, <b>not security</b>. A real lock is Cloudflare Access (Zero&nbsp;Trust). NO&nbsp;PIN: commits auto-deploy via Pages. Admin-created search/nav meta leaves the committed search-index &amp; sitemap stale until the next Cowork regen sweep.</p>
<fieldset>
  <legend>gate-apply &mdash; curtain a page</legend>
  <label>page (src/&hellip; relative path)</label><input type="text" id="ga-path" placeholder="src/successor/index.html">
  <label>slug (nav/key id; lowercase, hyphens ok)</label><input type="text" id="ga-slug" placeholder="successor">
  <label>passphrase (view-source-visible)</label><input type="text" id="ga-pass">
  <label>eyebrow (optional HTML; blank = default)</label><input type="text" id="ga-eyebrow">
  <label>lede (optional HTML; blank = default)</label><input type="text" id="ga-lede">
  <label style="text-transform:none"><input type="checkbox" id="ga-search" checked> exclude from site search (adds wuld-search meta)</label>
  <label style="text-transform:none"><input type="checkbox" id="ga-nav" checked> grey the nav tab (edits src/components/nav.css)</label>
  <button class="site-prev" data-pattern="gate-apply">preview</button>
</fieldset>
<fieldset>
  <legend>gate-rotate &mdash; change a passphrase</legend>
  <label>page (src/&hellip; relative path)</label><input type="text" id="gr-path" placeholder="src/console/index.html">
  <label>new passphrase</label><input type="text" id="gr-pass">
  <button class="site-prev" data-pattern="gate-rotate">preview</button>
</fieldset>
<fieldset>
  <legend>gate-remove &mdash; strip a curtain</legend>
  <label>page (src/&hellip; relative path)</label><input type="text" id="gx-path" placeholder="src/successor/index.html">
  <label>slug (blank = auto from the curtain marker)</label><input type="text" id="gx-slug" placeholder="successor">
  <label style="text-transform:none"><input type="checkbox" id="gx-nav" checked> un-grey the nav tab</label>
  <label style="text-transform:none"><input type="checkbox" id="gx-search"> re-include in site search (remove wuld-search meta)</label>
  <button class="site-prev" data-pattern="gate-remove">preview</button>
</fieldset>
<p class="hint">Live gates (migrated to canonical, K246): <b>/successor/</b> &middot; <b>/console/</b>. Rotate or remove them here like any other. The diff-confirm preview shows every byte before you commit.</p>
</details>

<h2 id="sec-log">Log</h2>
<div id="log" aria-live="polite"></div>

<script>
(function () {
  "use strict";
  var MANIFEST = null;
  var PLATE_PAGE = 1, PLATE_SIZE = 25, PLATE_Q = "";
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

  // K213: paginated + filterable render. Filter matches id/title/series/num/
  // flags/category/tier; pager clamps; "all" restores the old full render.
  function plateMatches(p, q) {
    var hay = (p.id + " " + p.title + " " + p.series + " " + p.num + " " +
      p.content_flags.join(" ") + " " + (p.category || "") + " " + p.tier).toLowerCase();
    return hay.indexOf(q) >= 0;
  }
  function renderTable() {
    var tb = $("plates");
    tb.innerHTML = "";
    if (!MANIFEST) return;
    var q = PLATE_Q.toLowerCase();
    var rows = q ? MANIFEST.plates.filter(function (p) { return plateMatches(p, q); }) : MANIFEST.plates;
    var size = PLATE_SIZE === "all" ? (rows.length || 1) : PLATE_SIZE;
    var pages = Math.max(1, Math.ceil(rows.length / size));
    if (PLATE_PAGE > pages) PLATE_PAGE = pages;
    if (PLATE_PAGE < 1) PLATE_PAGE = 1;
    var start = (PLATE_PAGE - 1) * size;
    rows.slice(start, start + size).forEach(function (p) {
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
    $("pl-info").textContent = rows.length
      ? (start + 1) + "-" + Math.min(start + size, rows.length) + " / " + rows.length +
        (q ? " (of " + MANIFEST.plates.length + ")" : "") + "  p." + PLATE_PAGE + "/" + pages
      : "0 matches";
    $("pl-prev").disabled = PLATE_PAGE <= 1;
    $("pl-next").disabled = PLATE_PAGE >= pages;
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
      $("pf-category").value = plate.category || "editorial";
      $("pf-captier").value = plate.caption_tier || "";
      $("pf-kind").value = (plate.media && plate.media.kind) || "image";
      $("pf-poster").value = (plate.media && plate.media.poster) || "";
      $("pf-printurl").value = plate.print_url || "";
      $("pf-featured").checked = plate.featured === true;
      $("pf-video").value = plate.video || "";
      $("pf-go").textContent = "commit update";
      $("pf-cancel").style.display = "";
      $("sec-plate").open = true;
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
    ["pf-id","pf-r2key","pf-title","pf-series","pf-technique","pf-body","pf-epitaph","pf-order","pf-num","pf-category","pf-poster","pf-printurl","pf-video"].forEach(function (i) { $(i).value = ""; });
    $("pf-tier").value = "standard";
    $("pf-nsfw").checked = false;
    $("pf-featured").checked = false;
    $("pf-captier").value = "";
    $("pf-kind").value = "image";
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
      category: $("pf-category").value.trim() || "editorial",
      caption_tier: $("pf-captier").value,
      media: (function () { var m = { kind: $("pf-kind").value }; var po = $("pf-poster").value.trim(); if (po) m.poster = po; return m; })(),
      print_url: $("pf-printurl").value.trim(),
      featured: $("pf-featured").checked,
      video: $("pf-video").value.trim(),
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
    if (pattern === "archive-video") {
      return { youtube_id: $("av-id").value.trim(), title: $("av-title").value.trim(),
               eyebrow: $("av-eyebrow").value.trim(), id_type: $("av-idtype").value,
               thumb_video_id: $("av-thumb").value.trim(), sub: $("av-sub").value.trim(),
               position: $("av-pos").value.trim() };
    }
    if (pattern === "archive-image") {
      return { slug: $("ai-slug").value.trim(), alt: $("ai-alt").value.trim(),
               kind: $("ai-kind").value.trim(), title: $("ai-title").value.trim(),
               note: $("ai-note").value, position: $("ai-pos").value.trim() };
    }
    if (pattern === "essay-card") {
      return { slug: $("ec-slug").value.trim(), eyebrow: $("ec-eyebrow").value.trim(),
               title: $("ec-title").value.trim(), tag: $("ec-tag").value.trim(),
               position: $("ec-pos").value.trim() };
    }
    if (pattern === "text-swap") {
      return { file_path: $("ts-path").value.trim(), find_text: $("ts-find").value,
               replace_text: $("ts-replace").value, replace_all: $("ts-all").checked,
               allow_tag_delta: $("ts-tagok").checked };
    }
    if (pattern === "blog-post") {
      return { title: $("bp-title").value.trim(), slug: $("bp-slug").value.trim(),
               date: $("bp-date").value.trim(), source: $("bp-source").value.trim(),
               summary: $("bp-summary").value.trim(), figure_url: $("bp-figurl").value.trim(),
               figure_alt: $("bp-figalt").value.trim(), figure_caption: $("bp-figcap").value.trim(),
               body: $("bp-body").value, position: $("bp-pos").value.trim() };
    }
    if (pattern === "essay-page") {
      return { title: $("ep-title").value.trim(), slug: $("ep-slug").value.trim(),
               date: $("ep-date").value.trim(), genre: $("ep-genre").value.trim(),
               summary: $("ep-summary").value.trim(), audio_duration: $("ep-audio").value.trim(),
               reading: $("ep-reading").value.trim(), body: $("ep-body").value,
               position: $("ep-pos").value.trim() };
    }
    if (pattern === "cache-bump") {
      var paths = $("cb-paths").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      return { old_version: $("cb-old").value.trim(), new_version: $("cb-new").value.trim(), paths: paths };
    }
    if (pattern === "gate-apply") {
      return { file_path: $("ga-path").value.trim(), slug: $("ga-slug").value.trim(),
               passphrase: $("ga-pass").value.trim(), eyebrow: $("ga-eyebrow").value,
               lede: $("ga-lede").value, exclude_search: $("ga-search").checked, grey_nav: $("ga-nav").checked };
    }
    if (pattern === "gate-rotate") {
      return { file_path: $("gr-path").value.trim(), new_passphrase: $("gr-pass").value.trim() };
    }
    if (pattern === "gate-remove") {
      return { file_path: $("gx-path").value.trim(), slug: $("gx-slug").value.trim(),
               ungrey_nav: $("gx-nav").checked, unexclude_search: $("gx-search").checked };
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
      body = "<pre class=diff>" + esc(j.files.map(function (f) { return f.path + "  " + (f.note || ("x" + f.occurrences)); }).join("\\n")) + "</pre>";
      if (j.excerpt) {
        body += "<label>index before</label><pre class=diff>" + esc(j.excerpt.before) + "</pre>" +
                "<label>index after</label><pre class=\\"diff after\\">" + esc(j.excerpt.after) + "</pre>";
      }
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
    if (b.getAttribute("data-id")) params.id = b.getAttribute("data-id"); // row-scoped patterns (media publish/unpublish)
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
      if (r.status === 200) {
        if (SITE_PENDING.pattern.indexOf("media-") === 0 && typeof refreshMedia === "function") refreshMedia();
        SITE_PENDING = null; $("site-preview").style.display = "none";
      }
      if (r.status !== 200) { $("sp-commit").disabled = false; }
    });
  });

  $("pl-q").addEventListener("input", function () { PLATE_Q = $("pl-q").value.trim(); PLATE_PAGE = 1; renderTable(); });
  $("pl-size").addEventListener("change", function () { var v = $("pl-size").value; PLATE_SIZE = v === "all" ? "all" : parseInt(v, 10); PLATE_PAGE = 1; renderTable(); });
  $("pl-prev").addEventListener("click", function () { PLATE_PAGE--; renderTable(); });
  $("pl-next").addEventListener("click", function () { PLATE_PAGE++; renderTable(); });

  /* ---- MEDIA vertical (K220): items + chunked uploads + publish ---- */
  var MEDIA_BASE = ${JSON.stringify(mediaBase)};
  var MEDIA_MAN = null;
  var mediaLoaded = false, cmodLoaded = false;

  function refreshMedia() {
    api("/api/media/manifest").then(function (r) {
      if (r.status !== 200) { log("media manifest load failed " + r.status + " " + JSON.stringify(r.j).slice(0, 140)); return; }
      MEDIA_MAN = r.j.manifest;
      renderMedia();
    });
  }
  function renderMedia() {
    var tb = $("media-items");
    tb.innerHTML = "";
    if (!MEDIA_MAN) return;
    MEDIA_MAN.items.forEach(function (m) {
      var pub = m.status === "published";
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + esc(m.id) + "</td><td>" + esc(m.title) + "</td>" +
        "<td>" + esc(m.date) + "</td><td>" + (pub ? "<b>published</b>" : "draft") + "</td>" +
        "<td class=flag>" + esc((m.content_flags || []).join(",")) + "</td>" +
        "<td>" + (m.listed ? "yes" : "no") + "</td>" +
        "<td><button class=rowbtn data-mact=edit data-id='" + esc(m.id) + "'>edit</button>" +
        "<button class=rowbtn data-mact=view data-id='" + esc(m.id) + "'>view</button>" +
        (pub
          ? "<button class='rowbtn site-prev' data-pattern=media-unpublish data-id='" + esc(m.id) + "'>unpublish</button>"
          : "<button class='rowbtn site-prev' data-pattern=media-publish data-id='" + esc(m.id) + "'>publish</button>" +
            "<button class='rowbtn danger' data-mact=del data-id='" + esc(m.id) + "'>del</button>") +
        "</td>";
      tb.appendChild(tr);
    });
    if (!MEDIA_MAN.items.length) tb.innerHTML = "<tr><td colspan=7 class=hint>no media items yet - upload a video, then add an item.</td></tr>";
  }

  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-mact]");
    if (!b || !MEDIA_MAN) return;
    var id = b.getAttribute("data-id");
    var m = MEDIA_MAN.items.find(function (x) { return x.id === id; });
    if (!m) return;
    var act = b.getAttribute("data-mact");
    if (act === "edit") {
      $("mi-mode").value = "update:" + id;
      $("mi-id").value = m.id; $("mi-id").disabled = true;
      $("mi-title").value = m.title;
      $("mi-date").value = m.date;
      $("mi-duration").value = m.duration || "";
      $("mi-summary").value = m.summary;
      $("mi-r2key").value = m.r2key || "";
      $("mi-poster").value = m.poster || "";
      $("mi-nsfw").checked = (m.content_flags || []).indexOf("nsfw") >= 0;
      $("mi-exclusive").checked = (m.content_flags || []).indexOf("exclusive") >= 0;
      $("mi-listed").checked = m.listed !== false;
      $("mi-go").textContent = "commit update";
      $("mi-cancel").style.display = "";
      $("sec-media").open = true;
      window.scrollTo(0, $("media-form").offsetTop - 60);
    }
    if (act === "view") {
      var mp = $("md-preview");
      mp.innerHTML = "";
      if (!m.r2key) { log("no r2key on " + m.id + " - upload first"); return; }
      var v = document.createElement("video");
      v.controls = true; v.preload = "metadata";
      v.src = MEDIA_BASE + "/" + m.r2key;
      if (m.poster) v.poster = MEDIA_BASE + "/" + m.poster;
      mp.appendChild(v);
      log("draft preview: " + m.r2key);
    }
    if (act === "del") {
      var typed = prompt("Delete media item '" + id + "' (draft). Type the id to confirm:");
      if (typed !== id) { log("media delete aborted (confirm mismatch)"); return; }
      var alsoObjects = confirm("Also delete the R2 file(s) for '" + id + "'? OK = delete files too; Cancel = keep files.");
      post("/api/media/item/delete", { id: id, confirm: typed, delete_objects: alsoObjects }).then(function (r) {
        log("media delete " + id + " -> " + r.status + " " + JSON.stringify(r.j).slice(0, 160));
        refreshMedia();
      });
    }
  });

  function mediaResetForm() {
    $("mi-mode").value = "add";
    $("mi-id").disabled = false;
    ["mi-id", "mi-title", "mi-date", "mi-duration", "mi-summary", "mi-r2key", "mi-poster"].forEach(function (i) { $(i).value = ""; });
    $("mi-nsfw").checked = false;
    $("mi-exclusive").checked = false;
    $("mi-listed").checked = true;
    $("mi-go").textContent = "add item (draft, 1 commit)";
    $("mi-cancel").style.display = "none";
    var d = new Date(), p2 = function (n) { return (n < 10 ? "0" : "") + n; };
    $("mi-date").value = d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate());
  }
  $("mi-cancel").addEventListener("click", mediaResetForm);
  $("mi-nsfw").addEventListener("change", function () {
    if ($("mi-nsfw").checked) $("mi-listed").checked = false;
  });
  $("mi-go").addEventListener("click", function () {
    var mode = $("mi-mode").value;
    var flags = [];
    if ($("mi-nsfw").checked) flags.push("nsfw");
    if ($("mi-exclusive").checked) flags.push("exclusive");
    var fields = {
      title: $("mi-title").value.trim(), date: $("mi-date").value.trim(),
      summary: $("mi-summary").value.trim(), duration: $("mi-duration").value.trim(),
      r2key: $("mi-r2key").value.trim(), poster: $("mi-poster").value.trim(),
      content_flags: flags, listed: $("mi-listed").checked,
    };
    if (mode === "add") {
      fields.id = $("mi-id").value.trim();
      post("/api/media/item/add", { item: fields }).then(function (r) {
        log("media add -> " + r.status + " " + JSON.stringify(r.j).slice(0, 200));
        if (r.status === 200) { mediaResetForm(); refreshMedia(); }
      });
    } else {
      var uid = mode.slice(7);
      post("/api/media/item/update", { id: uid, patch: fields }).then(function (r) {
        log("media update " + uid + " -> " + r.status + " " + JSON.stringify(r.j).slice(0, 200));
        if (r.status === 200) { mediaResetForm(); refreshMedia(); }
      });
    }
  });

  function hex16(f) {
    return f.slice(0, 16).arrayBuffer().then(function (ab) {
      var b = new Uint8Array(ab), s = "";
      for (var i = 0; i < b.length; i++) s += (b[i] < 16 ? "0" : "") + b[i].toString(16);
      return s;
    });
  }
  function rawPost(path, blob, type) {
    return fetch(path, { method: "POST", headers: { "content-type": type }, body: blob })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, j: j }; }); });
  }
  $("md-upload").addEventListener("click", function () {
    var f = $("md-file").files[0];
    if (!f) { log("no video file chosen"); return; }
    var type = (f.type || "").toLowerCase();
    if (type !== "video/mp4" && type !== "video/webm") { log("pick an mp4 or webm (got '" + (type || "unknown") + "')"); return; }
    var stem = $("md-stem").value.trim() || f.name.replace(/\.[a-z0-9]+$/i, "");
    var over = $("md-overwrite").checked;
    var prog = $("md-prog"), note = $("md-prog-note");
    prog.hidden = false; prog.value = 0; note.textContent = "";
    if (f.size <= 32 * 1024 * 1024) {
      log("uploading " + f.name + " (" + f.size + " B, single request)...");
      rawPost("/api/media/put?stem=" + encodeURIComponent(stem) + (over ? "&overwrite=true" : ""), f, type)
        .then(function (r) {
          prog.value = r.status === 200 ? 100 : 0;
          log("media put -> " + r.status + " " + JSON.stringify(r.j).slice(0, 200));
          if (r.status === 200 && r.j.key) { $("mi-r2key").value = r.j.key; note.textContent = "done: " + r.j.key; }
          else { note.textContent = "upload failed - see log"; }
        });
      return;
    }
    hex16(f).then(function (h16) {
      return post("/api/media/mpu-init", { stem: stem, type: type, head16: h16, overwrite: over });
    }).then(function (r) {
      if (!r || r.status !== 200) { if (r) log("mpu init -> " + r.status + " " + JSON.stringify(r.j).slice(0, 200)); note.textContent = "init failed - see log"; return; }
      var key = r.j.key, uploadId = r.j.uploadId, PART = r.j.part_size;
      var total = Math.ceil(f.size / PART), parts = [];
      log("mpu " + key + ": " + total + " parts x " + PART + " B");
      function sendPart(n, retried) {
        var blob = f.slice((n - 1) * PART, Math.min(n * PART, f.size));
        return fetch("/api/media/mpu-part?key=" + encodeURIComponent(key) + "&uploadId=" + encodeURIComponent(uploadId) + "&part=" + n,
          { method: "POST", headers: { "content-type": "application/octet-stream" }, body: blob })
          .then(function (res) { return res.json().then(function (j) { return { status: res.status, j: j }; }); })
          .then(function (pr) {
            if (pr.status !== 200) {
              if (!retried) { log("part " + n + " failed (" + pr.status + ") - retrying once"); return sendPart(n, true); }
              throw new Error("part " + n + ": " + JSON.stringify(pr.j).slice(0, 160));
            }
            parts.push({ partNumber: pr.j.partNumber, etag: pr.j.etag });
            prog.value = Math.round(100 * n / (total + 1));
            note.textContent = "part " + n + " / " + total;
          });
      }
      var chain = Promise.resolve();
      for (var n = 1; n <= total; n++) (function (nn) { chain = chain.then(function () { return sendPart(nn, false); }); })(n);
      chain.then(function () {
        note.textContent = "assembling...";
        return post("/api/media/mpu-complete", { key: key, uploadId: uploadId, parts: parts });
      }).then(function (cr) {
        log("mpu complete -> " + cr.status + " " + JSON.stringify(cr.j).slice(0, 200));
        if (cr.status === 200) { prog.value = 100; $("mi-r2key").value = key; note.textContent = "done: " + key + " (" + cr.j.bytes + " B)"; }
        else { note.textContent = "complete FAILED - see log"; }
      }).catch(function (err) {
        log("mpu failed: " + err.message + " - aborting upload session");
        note.textContent = "upload failed - aborted";
        post("/api/media/mpu-abort", { key: key, uploadId: uploadId });
      });
    });
  });
  $("md-poster-upload").addEventListener("click", function () {
    var f = $("md-poster-file").files[0];
    if (!f) { log("no poster file chosen"); return; }
    var ptype = (f.type || "").toLowerCase();
    var stem = ($("md-stem").value.trim() || f.name.replace(/\.[a-z0-9]+$/i, "")) + "-poster";
    log("uploading poster " + f.name + "...");
    rawPost("/api/media/put?stem=" + encodeURIComponent(stem) + "&overwrite=true", f, ptype).then(function (r) {
      log("poster put -> " + r.status + " " + JSON.stringify(r.j).slice(0, 200));
      if (r.status === 200 && r.j.key) $("mi-poster").value = r.j.key;
    });
  });

  /* ---- COMMENTS moderation (K220): one roof; parity with wuld.ink/admin ---- */
  var CM = { rows: [], open: true, page: 1, size: 25, meta: null };
  function refreshCmod() {
    api("/api/cmod/list").then(function (r) {
      if (r.status !== 200) {
        log("cmod list failed " + r.status + " " + JSON.stringify(r.j).slice(0, 140));
        $("cm-state").textContent = "unavailable";
        return;
      }
      CM.rows = r.j.comments || [];
      CM.open = !!r.j.open;
      CM.meta = r.j;
      if (r.j.note) log("cmod note: " + r.j.note);
      renderCmod();
    });
  }
  function renderCmod() {
    $("cm-state").textContent = CM.open ? "OPEN" : "CLOSED";
    $("cm-toggle").textContent = CM.open ? "close board" : "open board";
    var vis = CM.rows.filter(function (c) { return !c.hidden; }).length;
    $("cm-counts").textContent = CM.rows.length + " total / " + vis + " visible / " + (CM.rows.length - vis) + " hidden";
    var list = $("cm-list");
    list.innerHTML = "";
    var pages = Math.max(1, Math.ceil(CM.rows.length / CM.size));
    if (CM.page > pages) CM.page = pages;
    if (CM.page < 1) CM.page = 1;
    var start = (CM.page - 1) * CM.size;
    CM.rows.slice(start, start + CM.size).forEach(function (c) {
      var box = document.createElement("article");
      box.className = "cmt" + (c.hidden ? " is-hidden" : "");
      var when = new Date(c.created_at).toISOString().replace("T", " ").slice(0, 16) + " UTC";
      box.innerHTML =
        "<div class=cmt-meta><span>#" + c.id + "</span><b>" + (c.name ? esc(c.name) : "anonymous") + "</b>" +
        "<span>" + (c.email ? esc(c.email) : "no email") + "</span><span>" + when + "</span>" +
        "<span>" + esc(c.board) + "</span>" + (c.hidden ? "<span class=cmt-flag>HIDDEN</span>" : "") + "</div>" +
        "<textarea data-cid='" + c.id + "' aria-label='Comment " + c.id + " body'>" + esc(c.body) + "</textarea>" +
        "<div><button class=rowbtn data-cact=save data-cid='" + c.id + "'>save edit</button>" +
        (c.hidden
          ? "<button class=rowbtn data-cact=unhide data-cid='" + c.id + "'>unhide</button>"
          : "<button class=rowbtn data-cact=hide data-cid='" + c.id + "'>hide</button>") +
        "<button class='rowbtn danger' data-cact=del data-cid='" + c.id + "'>delete</button></div>";
      list.appendChild(box);
    });
    if (!CM.rows.length) list.innerHTML = "<p class=hint>no comments.</p>";
    $("cm-info").textContent = CM.rows.length
      ? (start + 1) + "-" + Math.min(start + CM.size, CM.rows.length) + " / " + CM.rows.length + "  p." + CM.page + "/" + pages
      : "0";
    $("cm-prev").disabled = CM.page <= 1;
    $("cm-next").disabled = CM.page >= pages;
  }
  function cmAct(payload, label) {
    post("/api/cmod/act", payload).then(function (r) {
      log("cmod " + label + " -> " + r.status + " " + JSON.stringify(r.j).slice(0, 160));
      if (r.status === 200) refreshCmod();
    });
  }
  $("cm-list").addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-cact]");
    if (!b) return;
    var cid = parseInt(b.getAttribute("data-cid"), 10);
    var act = b.getAttribute("data-cact");
    if (act === "save") {
      var ta = document.querySelector("textarea[data-cid='" + cid + "']");
      if (ta) cmAct({ action: "edit", id: cid, body: ta.value }, "edit #" + cid);
    }
    if (act === "hide") cmAct({ action: "hide", id: cid }, "hide #" + cid);
    if (act === "unhide") cmAct({ action: "unhide", id: cid }, "unhide #" + cid);
    if (act === "del") {
      if (!confirm("Hard-delete comment #" + cid + "? This cannot be undone. (Use hide for reversible removal.)")) return;
      cmAct({ action: "delete", id: cid }, "delete #" + cid);
    }
  });
  $("cm-toggle").addEventListener("click", function () {
    var willOpen = !CM.open;
    if (!willOpen && !confirm("Close the board? New posts are refused immediately. The thread stays readable; reopen here any time.")) return;
    cmAct({ action: "board-state", open: willOpen }, "board-state " + (willOpen ? "open" : "close"));
  });
  $("cm-reload").addEventListener("click", refreshCmod);
  $("cm-hide-all").addEventListener("click", function () {
    if (confirm("Hide ALL visible comments? Reversible - unhide individually, or delete the hidden pile later.")) cmAct({ action: "purge", scope: "hide-all" }, "purge hide-all");
  });
  $("cm-del-hidden").addEventListener("click", function () {
    if (confirm("Permanently delete every HIDDEN comment? This cannot be undone.")) cmAct({ action: "purge", scope: "delete-hidden" }, "purge delete-hidden");
  });
  $("cm-del-all").addEventListener("click", function () {
    var t = prompt("This permanently deletes EVERY comment on the board. Type  DELETE ALL  to confirm:");
    if (t === "DELETE ALL") cmAct({ action: "purge", scope: "delete-all" }, "purge delete-all");
    else log("delete-all cancelled");
  });
  $("cm-prev").addEventListener("click", function () { CM.page--; renderCmod(); });
  $("cm-next").addEventListener("click", function () { CM.page++; renderCmod(); });

  (function () { // media form date defaults to operator-local today (K212 convention)
    var d = new Date(), p2 = function (n) { return (n < 10 ? "0" : "") + n; };
    if ($("mi-date")) $("mi-date").value = d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate());
  })();

  /* lazy loads: the manifest/D1 reads run on first section open, not boot */
  $("sec-media").addEventListener("toggle", function () {
    if ($("sec-media").open && !mediaLoaded) { mediaLoaded = true; refreshMedia(); }
  });
  $("sec-cmod").addEventListener("toggle", function () {
    if ($("sec-cmod").open && !cmodLoaded) { cmodLoaded = true; refreshCmod(); }
  });

  (function () { // K213: collapsed sections — persist open state; hash + jump links auto-open
    var KEY = "wuld-admin-open";
    var all = document.querySelectorAll("details.tool");
    var open = [];
    try { open = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { open = []; }
    Array.prototype.forEach.call(all, function (d) {
      if (open.indexOf(d.id) >= 0) d.open = true;
      d.addEventListener("toggle", function () {
        var ids = [];
        Array.prototype.forEach.call(all, function (x) { if (x.open) ids.push(x.id); });
        try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) {}
      });
    });
    function openFromHash() {
      var id = location.hash.slice(1);
      var d = id && $(id);
      if (d && d.tagName === "DETAILS") d.open = true;
    }
    document.addEventListener("click", function (ev) {
      var a = ev.target.closest(".jump a");
      if (!a) return;
      var d = $(a.getAttribute("href").slice(1));
      if (d && d.tagName === "DETAILS") d.open = true;
    });
    window.addEventListener("hashchange", openFromHash);
    openFromHash();
  })();

  (function () { // K212: default both content-op dates to operator-local today
    var d = new Date(), p2 = function (n) { return (n < 10 ? "0" : "") + n; };
    var t = d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate());
    if ($("bp-date")) $("bp-date").value = t;
    if ($("ep-date")) $("ep-date").value = t;
  })();

  /* ===== Testing Yurei + Gap Log (K228, Build 1.5a) ===== */
  var SEEN_KEY = "wuld:admin-yurei-seen";
  var TY = { loaded:false, loading:false, entries:[], unsealed:false, matcher:null, seen:null, sessFires:{}, THIN_K:3 };
  var GL = { lane:"miss", sort:"count", loaded:false };
  var GAP_QUEUE = [], GAP_TIMER = null, GAP_FLUSH_MS = 2500;

  // PII scrub — shared VERBATIM with the Worker's gaplogScrub (1.5b reuses this pipeline).
  function gaplogScrub(s) {
    s = String(s == null ? "" : s);
    s = s.replace(/\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b/g, "[email]");
    s = s.replace(/\\bhttps?:\\/\\/\\S+/gi, "[url]");
    s = s.replace(/\\bwww\\.\\S+/gi, "[url]");
    s = s.replace(/(^|\\s)@[A-Za-z0-9_]{2,}/g, "$1[handle]");
    s = s.replace(/\\+?\\d[\\d\\s().\\-]{6,}\\d/g, "[number]");
    s = s.replace(/\\s+/g, " ").trim();
    return s.slice(0, 500);
  }
  // Classify one turn on the LIVE matcher; loggable miss = score-step _miss (lane
  // 'deflection' AND not a repeat). Reads the matcher's own input_hist — no re-impl.
  function gapClassifyTurn(M, matcher, raw) {
    var norm = M.normalize(raw);
    var win = matcher.input_hist.slice(-matcher.repeat_window);
    var priorCount = 0;
    for (var i = 0; i < win.length; i++) if (win[i] === norm) priorCount++;
    var r = matcher.respond(raw);
    var isMiss = (r.lane === "deflection" && priorCount === 0);
    var missClass = null;
    if (isMiss) {
      var best = 0, resp = matcher.responses || [];
      for (var j = 0; j < resp.length; j++) { var sc = M.entryScore(resp[j], norm)[0]; if (sc > best) best = sc; }
      missClass = best < M.CONST.MISS_THRESHOLD ? "below_threshold" : "all_damped";
    }
    return { r:r, isMiss:isMiss, missClass:missClass, priorCount:priorCount };
  }

  // debounced batch writer — one POST per flush keeps us under the 30/min write belt
  function gapEnqueue(item) { GAP_QUEUE.push(item); if (!GAP_TIMER) GAP_TIMER = setTimeout(gapFlush, GAP_FLUSH_MS); }
  function gapFlush() {
    GAP_TIMER = null;
    if (!GAP_QUEUE.length) return;
    var batch = GAP_QUEUE.splice(0, 200);
    post("/api/gaplog/log", { items: batch }).then(function (r) {
      if (r.status === 429) { GAP_QUEUE = batch.concat(GAP_QUEUE); GAP_TIMER = setTimeout(gapFlush, (r.j && r.j.retry_in_s ? r.j.retry_in_s * 1000 : 5000)); return; }
      if (r.status !== 200) log("gaplog write failed " + r.status);
      if (GAP_QUEUE.length && !GAP_TIMER) GAP_TIMER = setTimeout(gapFlush, GAP_FLUSH_MS);
    });
  }

  function tyLoadSeen() { try { TY.seen = new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]")); } catch (e) { TY.seen = new Set(); } tySeenN(); }
  function tySaveSeen() { try { localStorage.setItem(SEEN_KEY, JSON.stringify(Array.prototype.slice.call(TY.seen))); } catch (e) {} }
  function tySeenN() { if ($("ty-seen-n")) $("ty-seen-n").textContent = TY.seen ? TY.seen.size : 0; }

  function tyRebuild() { if (window.YureiOracle) { TY.matcher = new window.YureiOracle.Matcher(TY.entries, { unsealed: TY.unsealed }); TY.sessFires = {}; } }
  function tyBootstrap() {
    if (TY.loading || TY.loaded) return;
    TY.loading = true; $("ty-status").textContent = "loading live matcher...";
    import("/api/gaplog/proxy/matcher").then(function () {
      return Promise.all([
        fetch("/api/gaplog/proxy/corpus-public").then(function (r) { return r.ok ? r.json() : null; }),
        fetch("/api/gaplog/proxy/corpus-oracle").then(function (r) { return r.ok ? r.json() : null; })
      ]);
    }).then(function (res) {
      if (!window.YureiOracle) throw new Error("matcher global missing after import");
      var pe = (res[0] && res[0].yurei_corpus && res[0].yurei_corpus.entries) || [];
      var oe = (res[1] && res[1].yurei_corpus && res[1].yurei_corpus.entries) || [];
      TY.entries = pe.concat(oe); TY.loaded = true; TY.loading = false; tyRebuild();
      $("ty-status").textContent = "live matcher ready - " + pe.length + " public + " + oe.length + " oracle entries";
      log("testing-yurei: loaded " + TY.entries.length + " entries");
    }).catch(function (e) {
      TY.loading = false; $("ty-status").textContent = "load FAILED: " + (e && e.message || e);
      log("testing-yurei load failed: " + (e && e.message || e));
    });
  }

  function tySend(raw) {
    if (!TY.matcher) { log("testing-yurei: matcher not ready"); return; }
    var M = window.YureiOracle;
    var c = gapClassifyTurn(M, TY.matcher, raw);
    var r = c.r, isNew = false;
    if (r.id) { isNew = !TY.seen.has(r.id); if (isNew) { TY.seen.add(r.id); tySaveSeen(); tySeenN(); } }
    tyRender(raw, r, isNew, c.isMiss);
    if (c.isMiss) gapEnqueue({ lane:"miss", content_scrubbed: gaplogScrub(raw), class: c.missClass });
    if (r.id) { TY.sessFires[r.id] = (TY.sessFires[r.id] || 0) + 1; if (TY.sessFires[r.id] === TY.THIN_K) gapEnqueue({ lane:"hit", entry_id:r.id, kind:"thin" }); }
  }
  function tyRender(raw, r, isNew, isMiss) {
    var wrap = $("ty-transcript");
    var row = document.createElement("div"); row.className = "ty-turn";
    var bcls = r.id ? (isNew ? "ty-bubble ty-fresh" : "ty-bubble ty-seen") : "ty-bubble ty-miss";
    var laneTag = isMiss ? "miss:" + (r.lane || "-") : (r.lane || "-");
    var votes = r.id ? ('<button class=rowbtn data-vote=novel data-id="' + esc(r.id) + '">novel</button><button class=rowbtn data-vote=repetitive data-id="' + esc(r.id) + '">repetitive</button>') : "";
    row.innerHTML =
      '<div class=ty-q><b>you</b> ' + esc(raw) + '</div>' +
      '<div class="' + bcls + '"><div class=ty-r>' + (r.response ? esc(r.response) : '<i>(deflection &mdash; no response)</i>') + '</div>' +
      '<div class=ty-meta><span>id ' + (r.id ? esc(r.id) : "&mdash;") + '</span><span>lane ' + esc(laneTag) + '</span>' +
      (r.tier ? '<span>tier ' + esc(r.tier) + '</span>' : "") + votes + '</div></div>';
    wrap.insertBefore(row, wrap.firstChild);
  }

  function glSetLane(lane) { GL.lane = lane; if (lane === "hit" && GL.sort === "class") GL.sort = "count"; glReload(); }
  function glReload() {
    if ($("gl-export")) $("gl-export").setAttribute("href", "/api/gaplog/export?lane=" + GL.lane);
    api("/api/gaplog/rows?lane=" + GL.lane + "&sort=" + GL.sort).then(function (r) {
      if (r.status !== 200) { $("gl-info").textContent = "unavailable: " + JSON.stringify(r.j).slice(0, 160); $("gl-list").innerHTML = ""; return; }
      glRender(r.j.rows || []);
    });
  }
  function glRender(rows) {
    $("gl-info").textContent = GL.lane + " - " + rows.length + " rows - sort " + GL.sort;
    var list = $("gl-list"); list.innerHTML = "";
    if (!rows.length) { list.innerHTML = "<p class=hint>no rows.</p>"; return; }
    rows.forEach(function (row) {
      var d = document.createElement("div");
      if (GL.lane === "miss") {
        d.className = "gl-row" + (row.resolved ? " gl-resolved" : "");
        d.innerHTML =
          '<div class=gl-c>' + esc(row.content_scrubbed) + '</div>' +
          '<div class=gl-tags><span>#' + row.id + '</span><span>&times;' + row.count + '</span><span>' + esc(row.class) + '</span>' +
          '<span>' + esc(row.first_date) + ' &rarr; ' + esc(row.last_date) + '</span>' +
          '<button class=rowbtn data-gl=resolve data-id=' + row.id + '>' + (row.resolved ? "unresolve" : "resolve") + '</button>' +
          '<button class=rowbtn data-gl=redact data-id=' + row.id + '>redact</button>' +
          '<button class="rowbtn danger" data-gl=drop data-id=' + row.id + '>drop</button></div>';
      } else {
        d.className = "gl-row";
        d.innerHTML =
          '<div class=gl-tags><span>#' + row.id + '</span><b>' + esc(row.entry_id) + '</b><span>' + esc(row.kind) + '</span><span>&times;' + row.count + '</span>' +
          '<span>' + esc(row.first_date) + ' &rarr; ' + esc(row.last_date) + '</span>' +
          '<button class="rowbtn danger" data-gl=drop data-id=' + row.id + ' data-lane=hit>drop</button></div>';
      }
      list.appendChild(d);
    });
  }

  tyLoadSeen();
  $("sec-yurei").addEventListener("toggle", function () { if ($("sec-yurei").open) tyBootstrap(); });
  $("ty-form").addEventListener("submit", function (ev) { ev.preventDefault(); var v = $("ty-input").value; if (v && v.trim()) { tySend(v); $("ty-input").value = ""; } });
  $("ty-unsealed").addEventListener("change", function () { TY.unsealed = $("ty-unsealed").checked; tyRebuild(); $("ty-transcript").innerHTML = ""; log("testing-yurei: unsealed=" + TY.unsealed + " (fresh session)"); });
  $("ty-reset-seen").addEventListener("click", function () { TY.seen = new Set(); tySaveSeen(); tySeenN(); log("testing-yurei: seen-set reset"); });
  $("ty-new-session").addEventListener("click", function () { tyRebuild(); $("ty-transcript").innerHTML = ""; log("testing-yurei: new matcher session"); });
  $("ty-transcript").addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("button[data-vote]"); if (!b) return;
    gapEnqueue({ lane:"hit", entry_id: b.getAttribute("data-id"), kind: b.getAttribute("data-vote") });
    b.disabled = true; b.textContent = b.getAttribute("data-vote") + " ok";
  });
  $("sec-gaplog").addEventListener("toggle", function () { if ($("sec-gaplog").open) { glLoadVisitor(); if (!GL.loaded) { GL.loaded = true; glReload(); } } });
  $("gl-lane-miss").addEventListener("click", function () { glSetLane("miss"); });
  $("gl-lane-hit").addEventListener("click", function () { glSetLane("hit"); });
  $("gl-sort-count").addEventListener("click", function () { GL.sort = "count"; glReload(); });
  $("gl-sort-date").addEventListener("click", function () { GL.sort = "date"; glReload(); });
  $("gl-sort-class").addEventListener("click", function () { GL.sort = "class"; glReload(); });
  $("gl-reload").addEventListener("click", glReload);
  function glPaintVisitor(on) { var c = $("gl-visitor-chip"); if (c) { c.textContent = on ? "OPEN" : "CLOSED"; c.style.color = on ? "#fff" : "var(--dim,#8a857d)"; c.style.background = on ? "var(--accent,#c41e3a)" : "transparent"; c.style.padding = "0 .4rem"; } var t = $("gl-visitor-toggle"); if (t) t.textContent = on ? "close lane" : "open lane"; }
  function glLoadVisitor() { api("/api/cmod/list").then(function (r) { if (r.status === 200 && r.j) glPaintVisitor(!!r.j.gaplog_visitor_open); }); }
  if ($("gl-visitor-toggle")) $("gl-visitor-toggle").addEventListener("click", function () {
    api("/api/cmod/list").then(function (r) {
      var willOpen = !(r.j && r.j.gaplog_visitor_open);
      if (willOpen && !confirm("Open the PUBLIC visitor gap-log lane? Real visitors' unanswered questions get logged (anonymously, PII-scrubbed). Make sure the disclosure is live first.")) return;
      post("/api/cmod/act", { action: "gaplog-visitor", open: willOpen }).then(function (rr) { if (rr.status === 200) glPaintVisitor(willOpen); else log("gaplog-visitor toggle failed " + rr.status); });
    });
  });
  $("gl-list").addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("button[data-gl]"); if (!b) return;
    var act = b.getAttribute("data-gl"), id = parseInt(b.getAttribute("data-id"), 10);
    var body = { id: id }; if (b.getAttribute("data-lane") === "hit") body.lane = "hit";
    post("/api/gaplog/" + act, body).then(function (r) { if (r.status === 200) glReload(); else log("gaplog " + act + " failed " + r.status); });
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
