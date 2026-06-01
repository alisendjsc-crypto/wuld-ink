# wuld.ink comment board — operator runbook

The umbrella's first dynamic surface: one global comment board at `/chat/`,
backed by a Cloudflare Worker + D1, moderated behind Cloudflare Access.
Owned-stack, zero third-party tracking.

**Cowork built all the code (K44). This runbook is the part only you can do (K45):**
stand up the backend in your Cloudflare account, then flip the board live.
Until you finish this, `/chat/` looks exactly as it did before — the board ships
**dormant** (`BOARD.live = false`).

Everything below runs from this folder unless noted:
`C:\Users\y_m_a\Projects\wuld-ink\workers\comments\`

---

## What you're standing up

| Piece | What it is |
|---|---|
| **D1 database** `wuld-comments` | SQLite table of comments (see `schema.sql`) |
| **Worker** `wuld-comments` | `src/index.js` — the API + the moderation page |
| **Routes** | `wuld.ink/api/*` and `wuld.ink/admin*` (run in front of Pages) |
| **Access policy** | email-OTP gate on `/admin` + `/api/admin/*`, only your email |
| **Frontend** (already in repo) | `src/components/comment-board.{css,js}` + the dormant section in `src/chat/index.html` |

Identity = optional name + **optional private email** (email is never shown
publicly and never returned by the public API — it exists only so you can reply
from the `/admin` view). Spam defense = hidden honeypot + per-IP rate-limit
(5 posts/min) + length caps. No CAPTCHA, no third-party anything.

---

## Prerequisites (one-time)

1. **Node + npm** installed. Check: `node --version` and `npm --version`.
2. **Wrangler** (Cloudflare's CLI):
   ```
   npm install -g wrangler
   wrangler --version
   ```
3. **Log in** to the Cloudflare account that owns the `wuld.ink` zone:
   ```
   wrangler login
   ```
   A browser opens; approve. (Account ID is `a2fc6a0d2e2f1fff96fe425de624a388`.)

---

## Step 1 — Create the D1 database

```
wrangler d1 create wuld-comments
```

It prints a block like:

```
[[d1_databases]]
binding = "DB"
database_name = "wuld-comments"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Copy the `database_id`** and paste it into `wrangler.toml`, replacing
`REPLACE_ME_AFTER_D1_CREATE`. Save.

## Step 2 — Create the table

```
wrangler d1 execute wuld-comments --remote --file=./schema.sql
```

Confirm it ran (it prints the executed statements). Sanity check:

```
wrangler d1 execute wuld-comments --remote --command "SELECT count(*) FROM comments;"
```
Expect `0`.

## Step 3 — Set the IP-salt secret

The Worker hashes each commenter's IP with this salt (raw IPs are never stored).
Generate a long random value and store it as a secret:

```
wrangler secret put IP_SALT
```

When prompted, paste a random 32+ char string. To generate one:
- PowerShell: `-join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })`
- or any password manager's random-string generator.

(Keep it out of the repo — it lives only in the Worker secret store.)

## Step 4 — Deploy the Worker

```
wrangler deploy
```

This also binds the two routes from `wrangler.toml`
(`wuld.ink/api/*` and `wuld.ink/admin*`). If wrangler complains about the
routes (zone permissions), bind them in the dashboard instead:
**Workers & Pages → wuld-comments → Settings → Domains & Routes → Add route**,
zone `wuld.ink`, patterns `wuld.ink/api/*` and `wuld.ink/admin*`.

Quick check (no Access yet, so `/api` is public — that's expected):

```
curl.exe -s https://wuld.ink/api/comments
```
Expect `{"board":"global","comments":[]}`.

---

## Step 5 — Gate `/admin` with Cloudflare Access  ← the moderation password

This is the "password-invoked privilege." Same shape as the gate planned for
`/_/successor-protocol/`. **Cloudflare dashboard → Zero Trust → Access → Applications.**

1. **Add an application → Self-hosted.**
2. Name: `wuld comments admin`.
3. **Application domain** — add TWO entries (this is the critical part):
   - `wuld.ink` path `/admin`
   - `wuld.ink` path `/api/admin`

   > ⚠️ You MUST cover **both**. `/admin` alone leaves the action endpoints
   > (`/api/admin/delete` etc.) ungated — anyone could call them. Two entries,
   > one application.
4. Session duration: your choice (e.g. 24h).
5. **Add a policy:** Action **Allow**; Include → **Emails** → `alisendjsc@gmail.com`.
6. **Login methods:** enable **One-time PIN** (email OTP). You can disable the
   others so it's email-OTP only.
7. Save. On the application's overview, copy the **Application Audience (AUD) Tag**.

## Step 6 — Turn on cryptographic admin verification (defense-in-depth)

Access is the real gate, but the Worker should also verify the Access JWT so the
admin routes are safe even if a route is ever misconfigured. In `wrangler.toml`
`[vars]`, fill:

```
ACCESS_TEAM_DOMAIN = "<your-team>.cloudflareaccess.com"
ACCESS_AUD = "<the AUD tag you copied>"
```

Your team domain is in **Zero Trust → Settings → Custom Pages** (or the URL you
log into, `https://<your-team>.cloudflareaccess.com`). Then redeploy:

```
wrangler deploy
```

(`ADMIN_EMAIL` is already set to `alisendjsc@gmail.com` in `wrangler.toml`; the
Worker rejects any Access identity that isn't that email.)

---

## Step 7 — Smoke test the backend

Run these from any machine (PowerShell shown; note `curl.exe`, not `curl`).

```powershell
# 1. list (public) — expect {"board":"global","comments":[]}
curl.exe -s https://wuld.ink/api/comments

# 2. post a comment — expect 201 + the comment echoed back
curl.exe -s -X POST https://wuld.ink/api/comments `
  -H "content-type: application/json" `
  -d '{"name":"test","body":"hello from the runbook","board":"global"}'

# 3. list again — your comment should appear (newest-first)
curl.exe -s https://wuld.ink/api/comments

# 4. honeypot — filling hp should return {"ok":true} and store NOTHING
curl.exe -s -X POST https://wuld.ink/api/comments `
  -H "content-type: application/json" `
  -d '{"body":"spam","hp":"i am a bot","board":"global"}'
#   (list again; the spam line must NOT be there)

# 5. rate limit — fire 6 quick posts; the 6th should return HTTP 429
1..6 | ForEach-Object {
  curl.exe -s -o NUL -w "%{http_code}`n" -X POST https://wuld.ink/api/comments `
    -H "content-type: application/json" -d '{"body":"rate test","board":"global"}'
}
```

**Moderation:** open `https://wuld.ink/admin` in a browser. Cloudflare Access
prompts for your email → sends a one-time PIN → you land on the mono moderation
page listing every comment (including hidden ones and any private emails). Test
**hide**, **unhide**, **save edit**, and **delete** on the test rows.

Clean up the test rows when done (delete them in `/admin`, or):
```
wrangler d1 execute wuld-comments --remote --command "DELETE FROM comments WHERE board='global';"
```

---

## Step 8 — Flip the board live (then it's real)

Two tiny edits in the **site repo** (`C:\Users\y_m_a\Projects\wuld-ink`):

1. `src/components/comment-board.js` — change `live: false` to **`live: true`**.
2. `src/chat/index.html` — bump the cache query on the two board assets so
   browsers re-fetch the changed JS (K26 xcvii cache-bump rule):
   `comment-board.css?v=K44` → `?v=K45` and `comment-board.js?v=K44` → `?v=K45`.

Then commit + push (Cloudflare Pages auto-deploys in ~30s):

```
git add -A
git commit -m "K45: comment board live — flip BOARD.live, cache-bump K44->K45"
git push
```

Add a changelog entry while you're at it (the board going live is worth one):
prepend to `src/releases.json`, then `python3 tools/changelog/gen_feed.py`, commit.

Hard-refresh `https://wuld.ink/chat/`: the board appears above a compact
"for live chat" IRC affordance; post a real message; confirm it shows up.

---

## Reverting to zero-PII (dropping email)

If you decide the optional-email field isn't worth the liability:

```
wrangler d1 execute wuld-comments --remote --command "ALTER TABLE comments DROP COLUMN email;"
```
Then remove the email `<div class="cb-field">…email…</div>` from the form in
`src/chat/index.html` and the `email` handling in `src/index.js` (the
`looksLikeEmail` check + the column in the INSERT). The board keeps working;
existing rows just lose the column. Nothing else depends on it.

---

## Troubleshooting

- **`/admin` returns 403 `no_access_token`** — Access isn't actually in front of
  the route. Confirm the Access application covers `wuld.ink/admin`.
- **`/admin` returns 403 `not_admin` / `jwt_invalid`** — `ACCESS_TEAM_DOMAIN` or
  `ACCESS_AUD` is wrong, or you logged in with a different email. Recheck Step 6.
- **Admin action returns `bad_origin`** — you're POSTing from somewhere other than
  the `/admin` page. Use the buttons on the page.
- **`/api/comments` 404s** — the Worker route isn't taking precedence over Pages.
  Verify the route exists (Step 4) and points at `wuld-comments`.
- **CORS error in the browser** — shouldn't happen; the frontend calls same-origin
  `/api`. If you moved the Worker to a subdomain, set `ALLOWED_ORIGIN` to the
  site origin and redeploy.
- **`git commit` fails with `index.lock`** — a stale lock. PowerShell:
  `Remove-Item -Force .git\index.lock` then retry. (This repo has accumulated a
  stale `.git\index.lock`; the publish script clears it.)
- **Watch logs live:** `wrangler tail` while you reproduce an issue.

---

## Files

```
workers/comments/
  wrangler.toml   Worker config — you fill database_id + ACCESS_* vars
  schema.sql      D1 table + indexes
  package.json    npm scripts (dev/deploy/schema/tail)
  src/index.js    the Worker (API + moderation UI + Access verify)
  README.md       this runbook
```

Frontend (in the main site, already wired, dormant until Step 8):
```
src/components/comment-board.css
src/components/comment-board.js   (BOARD.live = false until you flip it)
src/chat/index.html               (hidden <section id="comment-board">)
```
