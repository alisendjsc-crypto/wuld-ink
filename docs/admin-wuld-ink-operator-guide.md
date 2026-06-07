# admin.wuld.ink — operator guide

K87 handout (K35 non-cowork-guide class). Self-contained: paste this file into a regular
claude.ai chat alongside your request and it carries everything needed to drive the CMS
correctly without Cowork. Authoritative contract: `workers/admin/src/index.js` +
`src/gallery/index.html` head comment (schema v2) in `alisendjsc-crypto/wuld-ink`.

## 1 · What this is

A Cloudflare Worker on its own custom domain `admin.wuld.ink`, gated by Cloudflare Access
(email OTP, `alisendjsc@gmail.com` only; session 24 h). Two verticals:

- **GALLERY** — upload media to R2 (`wuld-audio`, prefix `gallery/`) + edit
  `src/gallery/manifest.json` via the GitHub Contents API.
- **SITE-EDIT** — 4 mechanical site patterns with a preview → diff-confirm → commit flow.

Every action lands as **one git commit** (`gallery-admin: <op> <id>` or
`site-admin: <pattern> <detail>`). Rollback is always `git revert <hash>`. The Worker is
FAIL-CLOSED: missing Access config or missing PAT → 503, never a weak fallback. Cloudflare
Pages auto-deploys every commit (~30 s).

## 2 · Login + status line

Open `https://admin.wuld.ink` → Access sends an OTP → UI. The status line
(`N plates · M flagged · sha <…>`) proves four things at once: JWT verify, email pin,
PAT validity, manifest GET+parse. If it shows an error instead, see §6.

## 3 · Gallery — manifest schema v2 (K87)

```
{ schema_version: 2,
  media_base: "https://audio.wuld.ink",
  updated: "YYYY-MM-DD",                 // Worker stamps UTC on every mutation
  categories: [ { slug, name, caption_tier: "full"|"title"|"none" } ],
  plates: [ { id, r2key, num, title, technique, body, epitaph,
              series, order, tier: "standard"|"sealed",
              content_flags: ["nsfw", ...], added: "YYYY-MM-DD",
              category: "<slug>",                          // default "editorial"
              media: { kind: "image"|"video", poster?: "<r2key>" },
              caption_tier: ""|"full"|"title"|"none" } ] }  // "" = inherit category
```

- **caption_tier cascade:** plate → category → `"full"`. Editorial keeps full captions;
  `main-character` renders bare media (`none`); the small rooms are `title`-only.
- **Rooms:** `/gallery/` renders category `editorial` + a category index block (cards
  appear only for categories holding ≥1 plate). Each other category renders at
  `/gallery/<slug>/`. Current slugs: `editorial`, `gap-dweller`, `gore`, `main-character`,
  `mascot-yurei`, `original-character`, `other`, `the-tall-one`, `the-wrong-thing`.
  `category` on a plate MUST be one of these (the Worker validates against
  `manifest.categories`; adding a new room is a repo edit, not a CMS op).
- **Consent discipline (media-agnostic):** `content_flags: ["nsfw"]` arms the in-room
  consent gate — flagged plates render withheld with no img/video/poster in the DOM until
  the interstitial passes. Flagging is the ONLY go-live switch an NSFW batch needs.
- `tier: "sealed"` is RESERVED — never rendered anywhere; don't use it casually.

### Ops

| Op | Flow | Notes |
|---|---|---|
| Upload | §1 form → choose file → optional key stem | webp/png/jpeg/**mp4**, ≤25 MiB, magic-byte sniffed (declared type must match bytes). Extension derives from the VERIFIED type. Re-using a key → 409 unless "overwrite" ticked. |
| Add plate | Upload FIRST, then §2 form | r2key must start `gallery/` and point at real bytes (409 `r2_object_missing` otherwise; `force:true` only for deliberate pre-staging). `num` blank = roman from order. `order` blank = append. |
| Update | Plates table → edit | `id` + `added` locked (delete+add to rekey). Submitting the form sends ALL fields as the patch. |
| Flag / unflag | Plates table → flag | Toggles `nsfw` — arms/disarms the consent gate for that plate. |
| Delete | Plates table → delete, type the id | R2 object KEPT by default; manifest entry goes. |
| Video plate | Upload mp4 → add with media kind `video` | `preload="none"` click-to-play on site; poster r2key optional (posters are generated at the K88 ingest; until then the card shows a dark 16:9 placeholder). |

## 4 · Site-edit (K86)

Preview → diff panel (BEFORE/AFTER excerpts, byte delta, tag-balance delta) → commit.
Commit re-fetches and REFUSES on drift (409 `stale_preview`) — the confirmed diff is the
diff that lands, or nothing lands. Patterns: **video-watch card** · **rec-card** ·
**text-swap** (tag-delta blocked unless explicitly allowed) · **cache-bump** (`?v=` sweep;
NAME the referencing pages in `paths` — a blank-paths full sweep refuses with 413 because
scanning ~57 files exceeds the Workers free-plan subrequest budget; full sweeps run
locally via `tools/wuld-gui`). Scope: `src/` only, traversal-rejected.

**OFF-LIMITS:** the `/library-about/` pin loci (version strings, md5s, byte counts across
the 12 pin-touched HTML files). Pin moves are Cowork-exclusive via `tools/library-pin.py`
— a text-swap there desyncs pin==live. Don't.

## 5 · Bulk ingest (K88 lane — not through this tool)

Per-plate CMS adds = one commit each. Fine for singles; **wrong for a 367-file corpus**
(367 commits + 367 Pages builds). Bulk = sandbox pipeline: re-encode → R2 bulk upload →
manifest entries written in-repo as ONE commit. That is a Cowork session (K88), not a CMS
session. After the bulk commit, this tool is the right instrument for corrections.

## 6 · Failure table

| Code | Meaning | Fix |
|---|---|---|
| Access login loop / 401 | not the pinned email | use alisendjsc@gmail.com |
| 403 `bad_origin` | CSRF check | drive from the admin.wuld.ink UI, not curl |
| 404 `not_found` | bad plate id | check the plates table |
| 409 `key_exists` | R2 key taken | tick overwrite, or new stem |
| 409 `r2_object_missing` | add before upload | upload first (or `force:true`) |
| 409 `stale_preview` | repo moved between preview+commit | re-preview, re-confirm |
| 409 `schema_unexpected` | manifest schema_version ≠ 2 | STOP — the manifest was hand-edited or rolled back; reconcile in-repo before any CMS write |
| 409 `conflict_retry_exhausted` | two writers raced twice | retry once; if persistent, check for a stuck automation |
| 413 `sweep_budget` | blank-paths cache-bump | name `paths`, or run tools/wuld-gui locally |
| 415 `type_not_allowed` / `content_mismatch` | bad file type or lying extension | webp/png/jpeg/mp4 only; bytes must match the declared type |
| 422 `validation` | field errors (listed in response) | fix the listed fields; category must be a known slug |
| 429 | rate belt (30 writes/min) | wait a minute |
| 502 `github_put_failed` | **PAT expired/revoked** | §7 rotation |
| 503 | fail-closed: AUD or GITHUB_PAT unset | `workers/admin/README.md` standup steps |

## 7 · PAT rotation — **due Sep 04 2026**

Symptom: every manifest/site op returns 502 `github_put_failed` while uploads still work.
Fix: GitHub → Settings → Developer settings → fine-grained tokens → new token scoped to
`alisendjsc-crypto/wuld-ink` ONLY, Contents read+write, 90 days → then:

```powershell
cd C:\Users\y_m_a\Projects\wuld-ink\workers\admin
npx wrangler secret put GITHUB_PAT   # paste the new token at the prompt
```

No redeploy needed. Set the next rotation reminder (+90 d).

## 8 · Posture locks (binding; K83/K84 ratified)

- **NO donation gate ever** on the gallery section — PayPal/Venmo/CashApp AUP coupling
  hazard (the R2 subscription bills through the same PayPal).
- **NO self-built accounts** — Cloudflare Access OTP is the only auth, ever.
- All gallery content **AI-generated; no real, identifiable persons**.
- The consent gate is **consent-discipline, not security** — never present it as the latter.
- Worker secrets live in wrangler, **never in repo bytes**.

## 9 · For a regular-Claude session (paste-load preamble)

You (Claude) have no browser here: the operator clicks; you compose and verify. You may:
draft manifest entry JSON against the §3 schema; interpret the §6 table; sequence multi-op
jobs (upload → add → flag); compose `git revert` instructions. You may NOT: invent schema
fields, suggest curl against the API (CSRF will 403 it), route around a 409
`schema_unexpected` (that one is a stop-the-line repo reconcile), or touch the §4
off-limits loci. When an op needs more than ~5 plates or any re-encoding, route it to a
Cowork session instead (§5).
