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

**Not CMS surfaces:** the Void Engine (`/void-engine/`) ships via Cowork wholesale substitution, and the `/argument-library/` pin moves via `tools/library-pin.py` (Cowork-exclusive). Neither is editable here.

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

Per-plate CMS adds = one commit each. Fine for singles; **wrong for a large corpus**
(N commits + N Pages builds). Bulk = sandbox pipeline: re-encode → R2 bulk upload →
manifest entries written in-repo as ONE commit. That is a Cowork session (K88), not a CMS
session. **Landed so far:** the small-room batch (39 plates) and the Main Character batch (436) shipped this way — the gallery now holds **502 plates across 9 rooms**. After a bulk commit, this tool is the right instrument for corrections.

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


## 10 · Content verticals — blog-post + essay-page (K212)

Sections **11** and **12** create whole pages, not just cards: a NEW `/blog/<slug>/` post
or `/essays/<slug>/` essay PLUS its index card, landed as **ONE commit** (Pages deploys in
~1 min). The new page's chrome (head, nav, footer, component `?v=` includes, inline styles)
is **grafted live from a donor page** at preview time — `/blog/the-easiest-case/` for posts,
`/essays/architecture-of-moral-disaster/` for essays — so pages are born with current
chrome. Every donor substitution is occurrence-counted: if a future redesign moves the
donor's anchors, the op refuses with 422 `op_refused` ("donor drift") instead of landing a
half-grafted page; that error means "book a Cowork session to update the op", nothing broke.

**Blog post (section 11):** title · slug (blank = derived) · date (pre-filled, local) ·
optional Source line · summary (becomes the meta description AND the index-card excerpt) ·
optional figure (URL + alt + caption — the image itself must already exist: `/assets/…` in
repo, or R2 via section 1 / dashboard) · body. Body syntax: blank line = new paragraph;
`**bold**`, `*italic*`, `[link](https://…)`. Position blank = newest-first (top of the index).

**Essay (section 12):** title · slug · date · genre eyebrow (renders "Essay / <genre>" on
the page and as the card eyebrow) · summary · optional audio duration (e.g. `23:11` — adds
the audio band wired to `essays/<slug>/full.mp3`; **the mp3 itself still lands in R2 by
hand**, same as always) · optional reading time (blank = computed from the body) · body.
A line starting `## Heading` opens a new numbered Section (Section I, II, …); an EMPTY body
ships the placeholder shell for later fill. New essays inherit the full essay apparatus:
reader/HC mode toggle, text-size slider, audio player, yurei. Position blank = append last
(the essays list reads as a sequence, not newest-first).

What these ops do NOT do (Cowork-session rituals, by design): site-search indexing (the
page is live + linked immediately, searchable at the next `search-index` regen), changelog
/ RSS entries, and image/audio binary ingestion. Titles/summaries are plain text (no
`< > " & \` — they cross HTML and JSON-LD); em-dashes, middots, apostrophes are fine.

| Symptom | Meaning | Fix |
|---|---|---|
| 422 `op_refused` "already exists" | slug taken (page or card) | different slug; edit the live page via text-swap |
| 422 `op_refused` "donor drift" | donor page restructured | Cowork session updates the op constants |
| 422 `op_refused` "embeds the donor page's slug" | slug contains the donor's slug | pick a different slug |
| 409 `stale_preview` | repo moved between preview+commit | re-preview, re-confirm |


## 11 · MEDIA vertical — hosted video (K220)

Section 13 in the terminal. Storage: R2 bucket `wuld-audio` under the fenced `media/`
prefix, served at `audio.wuld.ink/media/…` — public-URL like the gallery (the 18+ gate is
consent discipline, not byte-security; unlisted items are simply never enumerated: the
media manifest lives at `tools/media-manifest.json`, OUTSIDE the deployed src tree).

Flow, in order:

1. **Upload the video** (mp4/webm, any size). Files over 32 MiB slice into uniform 32 MiB
   parts automatically (R2 multipart through the Worker — no browser CORS, no extra
   credentials); the bar tracks parts; a failed part retries once; a failed run aborts the
   R2 upload session cleanly. Optional poster (webp/png/jpeg ≤ 25 MiB, keyed
   `<stem>-poster`). Magic-byte checks run on upload (single-shot) or at assembly
   (multipart) — a mismatched file is deleted, not stored.
2. **Add item (draft).** id (slug — becomes `/watch/<id>/`), title, date, summary,
   optional duration, flags, listed. The r2key field is filled by the upload. A draft is a
   manifest entry only — nothing public exists yet. `[view]` previews the raw R2 object
   inside the terminal.
3. **Publish** from the item row — the standard diff-confirm preview shows all three
   files: the NEW `/watch/<id>/` page (chrome grafted live from `/watch/_donor/`), the
   hosted card on `/watch/` (listed items; the Hosted section itself appears with the
   first card and retires with the last), and the manifest flip. ONE commit; live in ~1
   minute. **Unpublish** reverses all of it (page deleted, card removed, back to draft).

Gating semantics: **nsfw** ⇒ the page ships an 18+ consent interstitial (nothing loads
pre-confirm — no video element, no src, no poster in the DOM; decline routes to /watch/),
keeps robots-noindex, carries the `wuld-search` exclude marker (site-search skips it at
every regen), and never gets a thumbnail — a listed 18+ item renders a text-only card
tagged 18+; the form defaults 18+ items to UNLISTED (direct link only). **exclusive** ⇒
the player is replaced by a locked "supporter exclusive" panel — a STUB; no payment or
access wiring exists yet (a later session, after the Stripe W-9 elective). Lawful content
only — this is a single-operator terminal and what lands here is on the operator.

Notes: editing a published item's manifest fields does NOT rebuild the live page (it is
static) — unpublish + republish to refresh. The FIRST hosted publish is changelog-worthy:
ask Cowork for the releases.json entry. Extra failure rows for section 13:

| Symptom | Meaning | Fix |
|---|---|---|
| 422 "r2key missing/invalid" / "R2 object absent" | publish before upload finished | upload, or correct the r2key |
| 415 `content_mismatch` (assembled object deleted) | file bytes ≠ declared type | re-export the file, re-upload |
| 409 `key_exists` | stem already in R2 | tick overwrite, or new stem |
| 422 "item is 'published' — publish needs a draft" | double publish | already live; unpublish first to re-cut |

## 12 · Comments moderation — one roof (K220), parity, retirement

Section 14 moderates the SAME D1 rows as the old `wuld.ink/admin` surface (binding
`COMMENTS_DB` → database `wuld-comments`). The public board on /chat/ still posts through
the comments worker — untouched by this consolidation.

Parity map (old → new):

| Old (comments worker) | New (admin terminal) |
|---|---|
| GET `wuld.ink/admin` UI | section 14 (`#sec-cmod`) |
| POST `/api/admin/hide` `{id}` | `/api/cmod/act` `{action:"hide", id}` |
| unhide · delete · edit `{id, body}` | same action names via `/api/cmod/act` |
| board-state `{open}` | `{action:"board-state", open}` |
| purge `{scope}` (3 scopes, typed DELETE ALL) | `{action:"purge", scope}` — same scopes, same confirms |
| list (server-rendered, email visible) | GET `/api/cmod/list` (client-rendered; email admin-only; escape-on-render) |
| Access app "wuld comments admin" (own OTP) | the admin.wuld.ink Access app — one login |

The SQL is a byte-parity port (verified string-for-string at build). **Retirement** — only
AFTER a live parity check (hide/unhide/edit/delete one test comment + toggle the board
both ways from section 14): a later session edits `workers/comments/src/index.js` to 302
`/admin` → `admin.wuld.ink` (optionally 410 `/api/admin/*`), deploys from
`workers\comments`, and then the old Access app "wuld comments admin" can be deleted in
Zero Trust (keep it while `/api/admin/*` stays live). Until then both surfaces work — they
share one database, so nothing drifts.

## 13 · K220 dissection notes + electives

Shipped in the K220 pass: 16-anchor jump bar; ~38 px row-button touch targets; the log is
`aria-live`; file/checkbox inputs got focus-visible outlines; disabled buttons read as
disabled; media + comments sections lazy-load on first open (no boot-time GitHub/D1
reads); media date pre-fills operator-local.

Electives, effort-tagged: `label for=/id` association sweep across all sections (M) ·
XHR fine-grained upload progress + 2-way parallel parts (M) · `/` focuses the plates
filter (S) · `th scope=col` on tables (S) · media-items pagination once the list passes
~50 (S). Site-side (from `docs/site-gap-audit-K220.md`): sitemap freshen/generator (S/M) ·
discreet inbound links for `/coda/` + `/library-about/` (S).
