# wuld.ink gallery admin CMS — operator runbook (K85)

Access-gated Worker at **admin.wuld.ink**. Two capabilities, gallery vertical only:

1. **Image upload** → R2 bucket `wuld-audio`, prefix `gallery/` (served at `https://audio.wuld.ink/gallery/...`).
2. **Manifest ops** (add / update / flag / delete plate) → ONE git commit per action to
   `src/gallery/manifest.json` via the GitHub Contents API. Pages auto-deploys each commit;
   rollback = `git revert`. Flagging a plate `["nsfw"]` arms the dormant consent gate (K83).

**Posture locks (K83, binding):** NO donation gate ever on the gallery section; NO self-built
accounts (Cloudflare Access OTP only); all content AI-generated, no real identifiable persons.

**Fail-closed:** the Worker 503s everything until `ACCESS_AUD` is real, and 503s manifest ops
until the `GITHUB_PAT` secret exists. There is no weak-header fallback (contra workers/comments).

---

## Standup (one-time, ~15 min)

### 1. Prereqs
- `wrangler` CLI authed against the account that owns the `wuld.ink` zone
  (`npx wrangler login` if needed). Run all commands from `workers/admin/`.

### 2. Cloudflare Access application (NEW app — do not reuse the comments app)
Zero Trust dashboard (`one.dash.cloudflare.com`, team `wuld`) → **Access → Applications →
Add an application → Self-hosted**:
- Application name: `wuld gallery admin`
- Session duration: 24h
- Application domain: `admin.wuld.ink` (path blank — gate the whole host)
- Policy: name `admin-only`, action **Allow**, Include → **Emails** → `alisendjsc@gmail.com`
  (login method: One-time PIN)
- Save. Open the app's **Overview** tab → copy the **Application Audience (AUD) Tag**.
- Paste it into `wrangler.toml` → `ACCESS_AUD = "<aud>"` (replacing REPLACE_ME_ACCESS_AUD).
  Commit that edit (it is not a secret).

### 3. GitHub fine-grained PAT
github.com → Settings → Developer settings → **Fine-grained tokens** → Generate new token:
- Resource owner: `alisendjsc-crypto`; Repository access: **Only select repositories** →
  `alisendjsc-crypto/wuld-ink` ONLY.
- Permissions → Repository permissions → **Contents: Read and write**. Nothing else.
- Expiration: 90 days (calendar a rotation; re-run step 4 with the new token when it expires).
- Copy the token once — it is shown once.

### 4. Secret
```
npx wrangler secret put GITHUB_PAT
```
Paste the token at the prompt. NEVER put it in wrangler.toml or any repo file.

### 5. Deploy
```
npx wrangler deploy
```
`custom_domain = true` in wrangler.toml makes this create the `admin.wuld.ink` DNS record +
cert automatically. No dashboard DNS work. (Zero route overlap with `wuld-comments`, which
owns `wuld.ink/api/*` + `wuld.ink/admin*`.)

### 6. Smoke test (in order)
1. **Auth wall:** private/incognito window → `https://admin.wuld.ink` → must show the Access
   OTP page, NOT the admin UI. Anything else = stop, recheck step 2.
2. **UI:** authenticate (OTP to alisendjsc@gmail.com) → mono dark UI loads; Status line reads
   `27 plates · 0 flagged · updated 2026-06-06 · sha <short>`.
3. **Upload roundtrip:** upload any small webp with key stem `smoke-test` → 200 + key
   `gallery/smoke-test.webp`; upload the same again WITHOUT overwrite → **409 key_exists**
   (the no-silent-overwrite gate). Delete the object in the R2 dashboard afterwards (or leave
   it — it is unreferenced by the manifest, so it never renders).
4. **Manifest commit:** edit plate `plate-01-subject-reduced-to-screen` → set `series` to
   `batch-01` → commit update. Verify: repo history shows
   `gallery-admin: update plate-01-subject-reduced-to-screen` authored via the API, and after
   the Pages rebuild (~30 s) `https://wuld.ink/gallery/manifest.json` carries the change.
   (This doubles as the first real series backfill — K83 left `series` empty by design.)

---

## Bulk-ingest procedure (new batch, incl. NSFW)
Per image: **section 1** upload (the returned key auto-fills the plate form's r2key) →
**section 2** fill id/title/technique/body/epitaph/series, tick **nsfw** if flagged → add.
One commit + one Pages rebuild per plate (~30 s); for batches >20, pace the adds.
NSFW plates go live withheld-by-default — the in-room consent gate arms automatically; no
page-code change needed. `tier` stays `standard` (`sealed` is RESERVED — settable, never
rendered).

Interim/manual paths stay valid: R2 dashboard drag-drop for objects; hand-editing
`manifest.json` in the repo for entries. The CMS is additive, not exclusive.

## Failure modes
| Response | Meaning |
|---|---|
| 503 `not_configured` | ACCESS_AUD still placeholder — step 2 |
| 503 `no_github_pat` | secret unset — step 4 |
| 403 `forbidden` | Access JWT invalid / wrong email |
| 409 `key_exists` | overwrite guard — tick overwrite to replace |
| 409 `r2_object_missing` | plate add before upload — upload first (or `force:true`) |
| 409 `sha_conflict` | manifest raced a concurrent commit — retried once, then surfaced; re-try the action |
| 415 `content_mismatch` | declared type ≠ magic bytes — re-export the image |
| 429 `rate_capped` | >30 writes/min — wait |

## Site-edit endpoints (K86 — arc session 3)

tools/wuld-gui/ops.py patterns ported as Worker endpoints; admin-page sections 4–7.
Flow: **preview → diff-confirm → commit**. No direct-commit path. Commit grain:
`site-admin: <pattern> <detail>`; every action = one commit; rollback = `git revert`.

| pattern | target | notes |
|---|---|---|
| `video-watch` | `src/watch/index.html` | add video card; position blank = append, `1` = first |
| `rec-card` | `src/recommendations/index.html` | section = media/film/books/sites/groups/work/art; note allows inline markup (ops.py design) |
| `text-swap` | any `src/**` file | find must be unique unless replace-all; tag-balance delta blocks commit unless explicitly allowed |
| `cache-bump` | src HTML | `?v=K<old>` -> `?v=K<new>`; ONE commit via the Git Data API (ref CAS) |

- `POST /api/site/preview` `{pattern, params}` -> summary, BEFORE/AFTER excerpt (single-file) or per-file occurrence list (cache-bump), `tag_delta`, `expected` (file sha / head commit).
- `POST /api/site/commit` `{pattern, params, expected}` -> 409 `stale_preview` if the target moved since preview; otherwise writes and returns the commit sha.

cache-bump scoping (K86 dry-run fact): the repo holds ~57 src HTML files and a sweep
must fetch every candidate to know where `?v=` lives — beyond the Workers free-plan
50-subrequest budget. Scope the bump with `paths` (comma-separated in the form) for
the high-frequency small case; full site-wide sweeps refuse on free plan (413) — run
those via `tools/wuld-gui` locally, or set var `SITE_SWEEP_MAX` on a paid plan.

Failure modes (site-edit):

| symptom | meaning | fix |
|---|---|---|
| 422 `op_refused` | find/anchor absent, ambiguous (>1), bad field, bad path | adjust input — ops.py refusal discipline, ported |
| 409 `stale_preview` | file sha or head moved since preview | re-preview, re-confirm |
| 422 `tag_delta_blocked` | text-swap changes tag balance | if intended, tick allow-tag-delta and re-preview |
| 413 `sweep_too_large` | cache-bump candidate set exceeds the subrequest budget | scope with paths, or wuld-gui locally |
| 502 `github_*` | PAT expired (rotation due Sep 04 2026) or API outage | re-run `npx wrangler secret put GITHUB_PAT` |

Smoke after deploy: hard-refresh admin.wuld.ink -> sections 4–7 render -> text-swap
preview on any trivial unique string -> confirm the BEFORE/AFTER panel renders ->
discard (zero commits). The write path is proven the first time a real edit commits.
