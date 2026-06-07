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

  refresh();
})();
<\/script>
</main></body></html>`;
}

function escHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
