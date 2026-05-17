# wuld.ink — Cowork session K25 handoff

K24r closed clean end-to-end. Working tree staged + operator executed (commit message + library v3.7.2 publication landing both operator-side at K24r close + ~12-13h before K25 open). Expected K25 diagnostic-first opening should find: K24r commit on HEAD origin/main (whatever SHA operator used); library v3.7.2 live at library.wuld.ink with binding md5 `2accf16a834f31b9e8dbb3fcc7d61a6b` / 2,236,312 B; chrome on DEPENDENCY GRAPH + MECHANISM WEB headers showing 78/245.

## Pre-resolved at K24r close — log at K25 open

- Library v3.7.2 publication script + bundle staged at K24r; operator should have executed `scripts/publish-library-v3-7-2.ps1` before K25 open. K25 verifies via `curl -s https://library.wuld.ink/ | md5sum` matching v3.7.2 anchor. If still serving `dd2abd01...88bcbb`, edge cache purge needed (dash.cloudflare.com → wuld.ink → Caching → Purge Everything).
- Book-coord Exchange 14 + library-coord Exchange 15 both closed. LD-supersession-applied-to-coord discipline locked. K24q lesson lxxix retracted/reframed forward in K24r narrative (no retcon of CLAUDE-history.md text per K22 viii).
- CLAUDE.md re-cut to ~37.4 KB / 180 lines (post-trim N=5 + K24r narrative + new carry-forwards). Trim threshold (~195 KB) is far. K25-K27 sessions can narrative-append normally.

## K25 user-driven goals (this session)

Operator-stated K25 scope, recommendation-ordered (smallest impact-per-call first; primary build last):

### Tier 1 — bug fixes + small content drops (Cowork-side cheap; do first)

1. **Ambient player bug investigation + fix.** Two distinct symptoms reported: (a) "ambient off" toggle sometimes doesn't work (state desync or YouTube IFrame call-path failure); (b) music player randomly restarts replay even when paused/selected. Investigate via Chrome DevTools console + `src/components/ambient-player.js` state-machine audit. Possibly related to YouTube IFrame API quirks + autoplay-policy first-interaction listener interactions. Pre-flag: intermittent bugs may need user-side reproduction steps. ~30-50 calls.

2. **Nav bar shape consistency.** Top nav-bar changes shape/form across different pages; operator wants ONE canonical size/shape. Likely CSS specificity drift across page templates (essay vs glossary vs frame vs index). Audit via `src/components/nav.css` + per-page `<header>` markup; lock canonical sizing in nav.css; remove per-template overrides. Decision: if `/preface/` promotes to its own /about/ tab (Tier 3 goal #3), add it to nav atomically here. ~15-25 calls.

3. **Library-About description swap + GitHub repo link add.** Operator has a library-Claude-authored description ready to drop into `/library-about/` to replace placeholder text. Operator also wants the GitHub repo link (`https://github.com/alisendjsc-crypto/efilist-argument-library`) added near the live-link CTA so anyone can participate or analyze the code. Pre-flag: operator needs to relay the library-Claude description text at K25 open (currently in operator's chat with library-Claude, not in uploads/). ~10-15 calls.

### Tier 2 — primary new build (K25 marquee)

4. **Gallery tab scaffold.** Operator's stated PRIMARY K25 goal. House various pictures of operator's selection. Operator is getting suite-Claude to derive descriptions for each, attached to image filenames as design context. SFW + NSFW sub-section pattern inside the tab area itself (both as placeholders for now; actual image content drops later or in K26+). Decision axes pre-flag:
   - **Image hosting**: R2 like audio? Or in-repo `src/assets/`? Bandwidth + Class B operations matter at scale. Recommendation: R2 at `gallery.wuld.ink` subdomain (or under existing `audio.wuld.ink` bucket as `audio.wuld.ink/gallery/`). Operator decides at K25 open.
   - **Grid layout**: masonry (Pinterest-style variable heights) vs uniform-grid (clean rows; less visually noisy). Recommend uniform-grid for cohesion with site's neobrutalist register; masonry adds asymmetry the rest of the site avoids.
   - **NSFW gating**: in-tab toggle (default OFF; click-to-reveal section) vs separate sub-page (`/gallery/sfw/` + `/gallery/nsfw/`). Recommend in-tab toggle with explicit `[ NSFW — click to reveal ]` accent button; cheaper to build + matches the site's "no apologies, no disclaimers" register while still giving viewer agency.
   - **Image description rendering**: caption-on-hover (desktop-only; fails mobile) vs always-visible caption-below (works everywhere). Recommend always-visible caption-below in `--font-mono` for instrument-panel register match.
   - **Suite-Claude description delivery format**: text-in-chat (Cowork transcribes), markdown table in uploads/ (`gallery-manifest.md` with `filename | description | nsfw_flag` columns — recommended), or JSON metadata sidecar per image. Operator clarifies at K25 open.
   ~50-80 calls for scaffold (page shell + grid component + NSFW sub-tab toggle + placeholder cards; no actual images yet).

### Tier 3 — additive scaffolds (cheap; if budget allows after Tier 1-2)

5. **Recommendations tab scaffold.** Movies / books / sites / groups / work / art / media. Placeholder for now. Pattern-match to existing tab shells like `/argument-library/` for consistency. ~15-20 calls.

6. **Archive images drop.** Operator has extra archive-friendly images for the `/archive/` tab; "announced later or next session." Wait for operator to drop files in uploads/ at K25 open; if present, integrate; if absent, defer to K26.

7. **Preface → About promotion** (optional / depends on operator decision). Currently `/preface/` serves as the about section but isn't called out as such. Two paths: (a) promote `/preface/` to its own `/about/` tab in primary nav (operator's instinct); (b) leave `/preface/` discoverable via existing routes + add nav entry. Path (a) is cleaner. Pairs naturally with Tier 1 #2 (nav-bar fix) — add new nav item atomically during nav refactor. ~15-25 calls.

### Tier 4 — bigger builds requiring DISCOVERY before scaffolding (defer to K26+)

8. **Donations tab.** PayPal / CashApp / Venmo with recurring + one-time options. **Pre-flag constraint**: of the three platforms, **only PayPal natively supports recurring donations** via subscription buttons. CashApp + Venmo are one-time-only at the platform level; recurring on those requires user-side scheduling (operator can mention "via PayPal subscription" + offer CashApp/Venmo as one-time alternatives). Required from operator: PayPal.me link or business email; `$cashtag`; Venmo username. Recurring intervals operator listed (weekly / bi-weekly / monthly / annually) — all PayPal-supported. ~30-50 calls when ready.

9. **Contact tab — formal contact form (email).** Operator asks: "wuld.ink? I am not sure if my cloudflare site has a unique email address — let me know." **Answer**: Cloudflare Email Routing supports custom aliases like `contact@wuld.ink` that forward to operator's existing email (alisendjsc@gmail.com). It's **free for receiving** (forwards only — no send capability from the alias). Setup is operator-side at `dash.cloudflare.com → wuld.ink → Email → Email Routing → enable → create alias → verify destination email`. For the form to actually SEND email from the website, a serverless function is needed: (i) Cloudflare Workers + a paid email API (SendGrid / Mailgun / Postmark — $0-15/mo at low volume); (ii) third-party form service (Formspree free tier: 50 submissions/mo). Recommendation: enable CF Email Routing (free) + use Formspree for the contact form (no infra to maintain). Operator decides at the gate. ~30-50 calls when scoped.

10. **Contact tab — IRC chat channel.** Open chat for users to post anonymously or named; not private; for back-and-forth between operator + users. **Pre-flag constraint**: this is non-trivial. Three architectural paths:
    - **(a) Embedded Kiwi IRC client** pointing at a libera.chat channel (e.g., `#wuld-ink`). Cheapest; uses existing IRC network; works in iframe. ~30-40 calls.
    - **(b) Matrix.org embedded widget** (newer; better UX than IRC; persistent message history; supports anonymous via guest access). ~30-50 calls.
    - **(c) Custom Cloudflare Workers + Durable Objects build.** Real engineering effort; full control over UX + moderation. ~150-250 calls. Probably overkill for use case.
    Recommendation: **(a)** unless operator specifically wants Matrix's modern UX or persistence. Operator decides at K25 close or K26 open.

11. **Watch tab NSFW sub-section.** Mirrors Gallery's NSFW pattern. Wait for Gallery NSFW pattern to land first (Tier 2 above), then pattern-match into `/watch/`. K26+ work; placeholder mentioned now for planning.

## Default track recommendation

**Track (a) — Tier 1 + Tier 2 (~110-170 calls).** Three bug-fixes + small content drops + Gallery scaffold. Default workstreams:

1. **Diagnostic-first opening** (verify K24r commit landed + library v3.7.2 publication state via curl md5 + working tree drift + uploads/ inventory).
2. **AskUserQuestion** if needed (Gallery decision axes from Tier 2 above; library description content delivery format).
3. **WS1**: ambient player bug — repro + diagnose + fix + cache-bump.
4. **WS2**: nav-bar canonical-size audit + lock; if `/preface/` → `/about/` decided affirmatively, atomically add nav entry.
5. **WS3**: library-About description swap (from library-Claude relay) + GitHub repo link add.
6. **WS4**: Gallery tab scaffold (page + grid + NSFW toggle + placeholder cards).
7. **WS5**: K25 narrative + commit handoff.

### Conditional tracks

- **Track (b) — Tier 1 only (~50-90 calls).** Focused bug-fix + content-drop session if user wants to defer Gallery to K26.
- **Track (c) — Tier 1 + Recommendations + Preface→About + Gallery placeholder-only (~90-130 calls).** Structural-tab pass; no full Gallery build; multiple small scaffolds.
- **Track (d) — Tier 1 + one big build from Tier 4 (~130-200 calls).** Bug-fix + start one of Donations / Contact-form / IRC. Discovery items pre-flagged; AskUserQuestion at session open for which big build.
- **Track (e) — MAINTENANCE LIGHT (~30-50 calls).** Just verify K24r deploy + any post-deploy issues; small carry-forward closes; no new builds. Unlikely opener.

## Diagnostic-first opening (template)

```bash
cd /sessions/<NEW>/mnt/wuld-ink

# 1. HEAD + drift
git log -3 --oneline
git status --short 2>&1 | head -20 || echo "INDEX CORRUPT - K22 viii pattern; operator-recover-at-close"

# 2. K24r artifact verification
git rev-parse HEAD                                 # expect K24r commit SHA from operator
md5sum CLAUDE.md                                   # expect 180e7ec2... if K24r commit landed clean
wc -lc CLAUDE.md                                   # expect ~180 lines / ~37,453 bytes
md5sum scripts/publish-library-v3-7-2.ps1          # expect f36fca18...
ls docs/v3-7-2-bundle/                             # expect 12 files

# 3. Library v3.7.2 publication state (LOAD-BEARING)
curl -s -m 30 'https://library.wuld.ink/' | md5sum  # expect 2accf16a... (was dd2abd01... pre-K24r-publish)

# 4. Deploy verify (K24r ships)
for u in 'https://wuld.ink/' 'https://wuld.ink/archive/' 'https://wuld.ink/library-about/' 'https://wuld.ink/argument-library/' 'https://library.wuld.ink/' 'https://audio.wuld.ink/archive/Forget-the-Plot.pdf'; do
  printf '%-72s ' "$u"
  curl -sI -m 8 "$u" 2>/dev/null | head -1
done

# 5. Uploads inventory (K25 scope shape)
ls -la /sessions/<NEW>/mnt/uploads/
# Expected at K25 open: maybe library-Claude description for /library-about/; possibly gallery image manifest or images; possibly archive-friendly images for /archive/

# 6. Index corruption signature (K22 viii + K24r lxxxvii watch)
git status --short 2>&1 | grep -o 'unknown index entry format 0x[0-9a-f]*' || echo "no signature"
# K24r had 0x31340000 ("14"). If K25 sees same -> N=2 validates new stable signature; if different -> non-deterministic byte-layer

# 7. OneDrive sandbox-view (expect ABSENT, 13+ consecutive K-sessions)
test -d /sessions/<NEW>/mnt/C:/Users/y_m_a/OneDrive && echo PRESENT || echo ABSENT

# 8. CLAUDE.md size watch (trim threshold ~195 KB; should be far below at session open)
stat -c%s CLAUDE.md  # expect ~37,453 + any small drift; K25 narrative will add ~6-12 KB
```

## AskUserQuestion at session open

Per K24f xxxi + K24j liii + K24p lxxviii + K24q lxxxi + K24r lxxxviii: question count scales with unresolved scope axes AFTER diagnostic. Operator pre-commit reduces question count to zero.

Likely K25 question shape:

- **0 questions (skip per K24j liii)** if operator pre-commits to track shape in K25 prompt OR if uploads/ + diagnostic resolve all axes.
- **1-2 questions** at session open covering:
  - Track confirmation (a / b / c / d / e) — only if operator's K25 prompt is ambiguous.
  - Gallery decision axes (only IF track includes Tier 2): image hosting (R2 vs in-repo) + NSFW gating style + description delivery format. Bundle these in ONE multiSelect question if Gallery is in scope.

Pre-anticipate hybrid options:
- Gallery: (a) full scaffold this session / (b) shell-only with grid stub (defer NSFW pattern to K26) / (c) defer entirely (track b).
- Nav-bar fix: pairs naturally with Preface→About promotion if operator decides on (a) path; if not, nav fix is standalone.
- Library-About description: depends entirely on operator relaying library-Claude description at session open; if absent, defer that micro to K26.

## Discipline reminders (compressed; K24r-updated)

- **K22 vii + K24b x**: file rewrite > 5 KB → bash heredoc with quoted delimiter. Write tool truncates silently at ~17 KB.
- **K24a viii N=4 + K24g xxxvi (K24r lxxxiii REFINEMENT)**: ANY file-tool Edit on session-touched file → derive write content from `git show HEAD:path` + Python in-memory + atomic write. BUT: pre-flight `git diff --quiet HEAD -- <path>` first; if dirty (in-session change present), derive from CURRENT DISK STATE accepting K24a viii sandbox-read truncation risk in exchange for preserving in-session work. K24g xxxvi remains correct for files NOT touched this session.
- **K24c xvi + K24l lxv**: bulk markup injection via regex-anchor + atomic bytes write + post-write audit. Cache-bump `?v=K24r → ?v=K25` IF any `/components/*.{css,js}` file modified (ambient player + nav fixes will trigger this).
- **K24d xx + K24o lxxiii**: NO backslash in f-string expression parts; precompute as named variables BEFORE the f-string. Audit logic in SEPARATE Python invocation from write logic. Python bytes-literal cannot contain non-ASCII; use str + `.encode('utf-8')`.
- **K24e xxiv + K24i xlvi**: BOM + non-ASCII discipline on Cloudflare Pages config files (`_headers`, `_redirects`) AND publish scripts — pre-flight strip em-dashes / multi-byte glyphs to ASCII.
- **K24f xxxi + K24p lxxviii + K24q lxxxi + K24r lxxxviii**: AskUserQuestion shape — skip on user pre-commit; 1-2 questions when uploads/scope ambiguous; surface BLOCKERS at question level when uploaded files / framings could be scope-fence violations; INCLUDE HYBRID OPTIONS explicitly.
- **K22 viii + K24n+K24o+K24p+K24q+K24r N=5**: `.git/index.lock` + index corruption clears via PS recovery block at session close. K24r showed NEW signature `0x31340000`; pattern recurrence test at K25 open.
- **K24p lxxv + K24r lxxxvi**: md5-divergence audit is load-bearing for library work. NEVER trust filename markers; always md5-verify bytes against orientation §4 anchors when library bundle in uploads/.
- **K24r lxxxiv**: author-override events get LD-supersession-frame test first — is the conflict actually with the lock's content, or with a reach the lock didn't make? Don't reflexively classify as "author override coord consensus."
- **K24q lxxx**: CSS promote-at-N=3-with-non-shared-CSS is idiom-consolidation hygiene NOT byte reduction. K24r `/components/pointer.css` (N=3 promote at K24q) holds; next discreet-pointer surface at N=4 considers base-class refactor.

## End-of-session handoff (per git-commands-at-close memory)

```powershell
cd C:\Users\y_m_a\Projects\wuld-ink
# Index recovery (K22 viii pattern continues; check signature at session-open diagnostic)
Remove-Item .git\index.lock -ErrorAction SilentlyContinue
Remove-Item .git\index       -ErrorAction SilentlyContinue
git read-tree HEAD
git add -A
git status --short
git commit -m "K25: <summary>"
git push origin main
```

If K25 cache-bumps `?v=K24r → ?v=K25` (any `/components/*.{css,js}` touched — ambient + nav fixes will), deploy verify includes cache-bumped components:

```powershell
$urls = @(
  "https://wuld.ink/",
  "https://wuld.ink/components/ambient-player.js?v=K25",
  "https://wuld.ink/components/nav.css?v=K25",
  "https://wuld.ink/gallery/"  # if Gallery scaffold landed
)
foreach ($u in $urls) {
  try { "$((Invoke-WebRequest $u -Method Head -UseBasicParsing).StatusCode) $u" }
  catch { "ERR $u $($_.Exception.Message)" }
}
```

## UNIQUE K25 PRE-FLAGS (discovery items + tool-budget projections)

- **Tool budget envelope**: Track (a) 110-170 calls (4 workstreams + narrative); Track (b) 50-90 (bug fixes only); Track (c) 90-130 (structural-tab pass); Track (d) 130-200 (Tier 1 + one big build); Track (e) 30-50 (maintenance-light).
- **CLAUDE.md size watch**: post-K24r at ~37 KB; K25 narrative will add ~6-12 KB depending on track. No trim threshold concern this session.
- **Cache-bump decision**: K24r → K25 IF any `/components/*.{css,js}` modified. Ambient bug fix (modifies `/components/ambient-player.js`) + nav fix (modifies `/components/nav.css`) both trigger. ASSUME cache-bump on K25 close.
- **Operator email infrastructure pre-flag** (Tier 4 #9): Cloudflare Email Routing setup is required BEFORE contact-form work can begin. Operator-side dashboard task: `dash.cloudflare.com → wuld.ink → Email → Email Routing → enable → create alias `contact@wuld.ink` (or similar) → verify destination email (likely alisendjsc@gmail.com)`. Free; ~5 minutes operator-side. K26+ contact-form work blocked until this lands.
- **Donations recurring constraint pre-flag** (Tier 4 #8): only PayPal natively supports recurring (weekly/bi-weekly/monthly/annually). CashApp + Venmo are one-time-only at platform level. Donations tab UX should make this transparent (e.g., "Recurring via PayPal subscription" + "One-time via CashApp / Venmo / PayPal").
- **IRC channel architecture pre-flag** (Tier 4 #10): Recommend Kiwi IRC embedded client on libera.chat for cheapest path. Operator decides at K26 open.
- **Suite-Claude image description format pre-flag** (Tier 2): operator's preferred delivery format for gallery image descriptions. Recommend markdown manifest table in uploads/ (`gallery-manifest.md`) for atomic ingest by Cowork; alternative is JSON sidecar per image.
- **Library v3.7.2 post-deploy verify** (K24r carry-forward): if operator hasn't run publish script before K25 open, K25 starts with publish-script execution prompt; otherwise verify edge md5 matches v3.7.2 anchor in diagnostic-first opening.
- **No major architectural risks identified beyond standing K24a viii vector watch + K24p lxxv md5-divergence-audit (only triggers if library work resurfaces — none expected K25).**

If anything else surfaces operator-side between K24r close and K25 open, mention in the K25 opening message + Cowork will adjust scope accordingly.
