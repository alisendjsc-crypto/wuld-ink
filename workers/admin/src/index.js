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
        if (!gate.service && !sameOrigin(request)) return json({ error: "csrf_origin_mismatch" }, 403);
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
  if (pattern === "blog-post") return siteRunPagePlusCard(env, SITE_BLOG_POST.donor, SITE_BLOG_POST.index, siteBlogBuild, params);
  if (pattern === "essay-page") return siteRunPagePlusCard(env, SITE_ESSAY_PAGE.donor, SITE_ESSAY_PAGE.index, siteEssayBuild, params);

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
  else return { fail: json({ error: "unknown_pattern", known: ["video-watch", "rec-card", "archive-video", "archive-image", "essay-card", "text-swap", "cache-bump", "blog-post", "essay-page"] }, 400) };

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
  .jump { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--border); padding:.55rem 0 .6rem; display:flex; flex-wrap:wrap; gap:.3rem 1rem; }
  .jump a { color:var(--dim); text-decoration:none; font-size:10px; text-transform:uppercase; letter-spacing:.12em; border-bottom:1px solid transparent; }
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
  .tablebar span { color:var(--dim); font-size:11px; white-space:nowrap; }
  .vh { position:absolute; clip:rect(0 0 0 0); clip-path:inset(50%); width:1px; height:1px; overflow:hidden; white-space:nowrap; }
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

<div id="site-preview">
  <div class="diffmeta" id="sp-meta"></div>
  <div id="sp-body"></div>
  <button id="sp-commit">commit</button>
  <button id="sp-discard">discard</button>
</div>


<h2 id="sec-log">Log</h2>
<div id="log"></div>

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

  $("pl-q").addEventListener("input", function () { PLATE_Q = $("pl-q").value.trim(); PLATE_PAGE = 1; renderTable(); });
  $("pl-size").addEventListener("change", function () { var v = $("pl-size").value; PLATE_SIZE = v === "all" ? "all" : parseInt(v, 10); PLATE_PAGE = 1; renderTable(); });
  $("pl-prev").addEventListener("click", function () { PLATE_PAGE--; renderTable(); });
  $("pl-next").addEventListener("click", function () { PLATE_PAGE++; renderTable(); });

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

  refresh();
})();
<\/script>
</main></body></html>`;
}

function escHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
