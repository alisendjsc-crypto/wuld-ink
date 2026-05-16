# wuld.ink — Cowork session K24h handoff

wuld.ink: Cowork session K24h. K24g closed end-to-end with one commit on origin/main:

* `eb61f1b` — K24g: positional-decisions pass (mobile audit + CC-BY-4.0 license + OG metadata wave-edit) + Exchange 14 + narrative

Three architecturally-named workstreams shipped K24g + a fourth that absorbed narrative + commit handoff. K24h opens against a clean carry-forward slate but with three NEW findings that surfaced post-K24g-deploy that drive the recommended scope.

## K24g completion summary

* **Library mobile audit (Cowork-side observation only).** Chrome MCP `resize_window` confirmed NO-OP on attached-extension browsers (lesson xxxv); audit pivoted to substrate-CSS-enumeration + desktop-pixel JS measurements. 2 `@media` blocks found (900px library/main + 480px coda-only); RWE surface zero mobile-specific rules; `.depth-btn` 32px fails WCAG 2.5.5 (passes 2.5.8); no pointer:coarse adaptations. Findings filed in Exchange 14 (5 substrate-fix candidates A.3.a-e + content question B on `cascade-math-safeguard` 0-instances). Cowork did NOT modify combined.html. Md5 contract held byte-verbatim.
* **CC-BY-4.0 license shipped site-wide.** `src/CITATION.cff` (1218B / CFF 1.2.0 / site-as-collection metadata); `src/LICENSE` (2406B / CC-BY-4.0 mirroring library shape with wuld.ink-scoped adaptation + audio + cover-image + library-substrate carveouts); `src/disclaimers/§07` rewritten from "All rights reserved" framing to CC-BY-4.0 framing with explicit `<a … rel="license">` + `/LICENSE` mirror; site-wide footer wave-edit `All rights reserved` → `Licensed CC-BY-4.0` across 45 HTML files + footer.css comment; `<link rel="license" href="/LICENSE">` injected across 47 HTML files. K24a lesson viii fired on disclaimers/index.html mid-pass (sandbox-read truncation after file-tool Edit on same file); recovered via HEAD blob + atomic rewrite (lesson xxxvi).
* **OG metadata + og:image wave-edit.** `src/assets/og-default.svg` (1590B / red W polyline + mono wordmark + neobrutalist frame); `src/assets/og-default.png` (25548B / md5 `690de81205da613cfa0c386998c0286e`) via cairosvg sandbox-install (lesson xxxviii). Full OG/Twitter metadata bulk-injected across 44 HTML surfaces (5 explicit skips: templates + sealed + 404 + redirect stub). Per-page values derived from existing `<title>` + `<meta name="description">` + path-to-URL canonical computation + og:type classification. Edge case: `src/index.html` initial canonical was `https://wuld.ink/index.html` (path-to-URL trim logic missed root); fix pass swapped 2 occurrences to `https://wuld.ink/`. K24c lesson xvi pattern (regex-anchor + atomic bytes write + integrity audit) held N=2.
* **Exchange 14 opens.** `docs/library-claude-coordination.md` 1661L/191559B → 1720L/196868B (+59L/+5309B). 5 substrate-fix candidates + 1 content question. No router/state/JS changes anticipated.

Tool budget retrospective: projected 60-90 calls (track a positional-decisions pass); actual ~37 main-context calls — well under projection. AskUserQuestion at session open locked 3 axes (track + license + og:image) in single round (K24b lesson xii at N=5 validated).

## Post-K24g findings (drive K24h scope)

Three findings surfaced post-K24g-deploy that drive K24h:

1. **Facebook OG scraper returns 403** at `https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fwuld.ink%2F` ("Bad Response Code; This response code could be due to a robots.txt block. Please allowlist facebookexternalhit on your sites robots.txt config to utilize Facebook scraping."). Cowork-side sandbox curl with FB UA returns 200 — confirms the 403 is IP-based at Cloudflare edge, not UA-based. Root cause almost certainly Cloudflare Bot Fight Mode (auto-enabled on free zones). Site has NO robots.txt currently. FB's debugger guessed robots.txt; actual culprit is Cloudflare's bot-protection.
2. **Discord renders OG card cleanly.** Big red W mark + "wuld.ink" + "PHILOSOPHY · PESSIMISM · LIBRARY" caption. ✓ Validates K24g OG metadata + og:image when scrapers can reach the page.
3. **Twitter Card Validator removed** by Twitter/X recently. No `cards-dev.x.com/validator` available. Defer Twitter-side validation; defer LinkedIn (post-inspector still works but K24h doesn't gate on it).
4. **W.U.L.D logo identity correction.** The red/black W.U.L.D logo with "WORTHLESS · USELESS · LIFELESS · DEAD" + "UGLY FROM THE INSIDE OUT" framing is NOT a music-project brand; it's Josiah's canonical multi-surface identity logo (YouTube + linktree + Bandcamp). K24g's pushback on swapping `[ wuld.ink ]` site-mark with the W.U.L.D logo was premise-incorrect; reconciled in conversation with three deploy-option offering (a/b/c). Josiah opened the question for K24h scope.
5. **Music tab requested.** Josiah has a Bandcamp page (https://wuld.bandcamp.com/) with multiple albums (W-HOLE, UGLY FROM THE INSIDE OUT, and others) and the actual audio locally. Wants dedicated `/music/` tab. Pattern-match `/watch/` (link-out card grid; no iframe embed per K3 surveillance/bandwidth discipline).
6. **Google search result has no image preview.** Google search snippets rarely render og:image even when present — Google uses schema.org JSON-LD for rich snippets, not Open Graph. Adding JSON-LD blocks site-wide would improve Google search result presentation.

================================================================================

## K24h PRIMARY SCOPE — Recommended default: (a) infra hygiene + music tab + logo + schema.org

Recommended primary track is 4 workstreams sequenced as: Cloudflare bot diagnostic FIRST (operator-side; observation-only from Cowork; unblocks FB) → crawler hygiene (robots.txt + sitemap.xml; Cowork autonomous) → /music/ tab + W.U.L.D logo placement (asset-handoff dependent on Josiah) → schema.org JSON-LD wave-edit (Cowork autonomous; pattern-matches K24g OG injection).

Recommended default track (a): ~100-130 calls. Tool-budget HEAVIER than K24g; pre-flag at session open per CLAUDE.md "always pre-flag actions that may significantly waste tool budget."

### Workstream 1 — Cloudflare bot diagnostic + crawler hygiene

**1a. Cloudflare Bot Fight Mode investigation (operator-side).**

Cowork emits PS-native diagnostic block + dashboard-navigation instructions for Josiah to run:

- Cloudflare dashboard → `wuld.ink` zone → **Security → Bots** — check "Bot Fight Mode" status.
- If ON: option (i) flip OFF entirely (simplest; restores normal scraper access); option (ii) under **Configure Super Bot Fight Mode** set "Verified bots" + "Definitely automated" to **Allow** (preserves some protection while letting scrapers through).
- Operator surfaces current state + chosen action.
- Belt-and-suspenders: also check **Security → WAF → Tools → User Agent Blocking** (none expected) and **Security → Events** (look for blocked requests with `facebookexternalhit` UA).

**1b. `src/robots.txt` shipped (Cowork autonomous).**

Permissive robots.txt explicitly allowing all crawlers + sitemap reference:

```
User-agent: *
Allow: /

Sitemap: https://wuld.ink/sitemap.xml
```

Single file at `src/robots.txt` (root-deployed at `https://wuld.ink/robots.txt`). Belt-and-suspenders to the Cloudflare fix — even if Bot Fight Mode is the actual blocker, explicit-allow robots.txt clarifies scraper intent and disposes of FB debugger's robots.txt fallback-guess.

**1c. `src/sitemap.xml` shipped (Cowork autonomous).**

XML sitemap of all deployable surfaces. Python script walks `src/**/*.html`, excludes:
- `src/templates/essay.html` + `src/glossary/_template.html` (templates not deployed)
- `src/_/successor-protocol/index.html` (sealed; noindex,nofollow)
- `src/404.html` (error page)
- `src/glossary/black-box-of-inaccessibility/index.html` (redirect stub)

Output: ~44 `<url>` entries with `<loc>`, `<lastmod>` (derived from git log per-file last-touch date), and `<changefreq>`/`<priority>` defaults per page-type (homepage/section-indexes higher; deep entries lower). XML declaration + sitemap.org namespace.

Optionally: re-run FB sharing-debugger from operator-side post-Cloudflare-fix + post-robots.txt-deploy to confirm 200 + populated W-mark preview.

### Workstream 2 — `/music/` tab

**2a. Asset handoff prerequisite (Josiah-side).**

Josiah surfaces in `uploads/` or via paste-relay:

- Album cover PNGs (square; reasonable web-resolution 800x800 to 1500x1500). Visible from screenshots: W-HOLE (black/cat image) + UGLY FROM THE INSIDE OUT (red/black face). Plus any other albums he wants on the page.
- Per-album metadata: title, release year, track count, total runtime, Bandcamp URL.
- Optional: short description paragraph per album (sleeve-notes register; chat-side authorship).
- Optional: featured/pinned album flag.

AskUserQuestion at session open includes pre-flag on asset-handoff state. If `uploads/` empty + Josiah doesn't paste-relay, workstream 2 scaffolds shell with placeholder cards (matching `/watch/` pattern at K-session G's first ship) for asset-drop in K24i.

**2b. `/music/` page shell.**

Pattern-match `/watch/` shape from session G:
- Site-header + nav (with new "Music" entry per 2c)
- Page-hero (eyebrow `Media · Music`; h1 `Music`; lede paragraph)
- `.music-grid` flex/grid card layout
- Per-card: `.music-card` with `.music-cover` (img) + `.music-meta` (title + year + tracks + runtime) + `.bandcamp-link` button
- Bandcamp CTA footer (link to canonical Bandcamp profile)
- Site-footer with disclaimer-link + license link + Licensed CC-BY-4.0 (per K24g pattern)
- OG metadata + favicon link + license link + canonical link (per K24g + K24a patterns)

CSS likely inline `<style>` block (N=1; promote to `/components/music.css` only on 2nd music-shaped surface per second-instance threshold).

`src/assets/music/` directory created for cover images. Pattern reusable.

**2c. Nav surgery — add "Music" across 47+ HTML surfaces.**

Current nav: `Essays / Library / Glossary / Void / Watch / Book / Blog` — 7 items.

Recommended insertion position: after "Watch" since both are link-out media surfaces. New nav: `Essays / Library / Glossary / Void / Watch / Music / Book / Blog` — 8 items.

Bulk-inject via Python regex anchor + atomic bytes write per K24c lesson xvi. Anchor on existing `<a href="/watch/">Watch</a>` line; inject `<a href="/music/">Music</a>` after it. Idempotent via `b'/music/' in nav_block` check.

Surfaces touched: all HTML files with `<nav class="site-nav">` block. ~47 files. Skip the 5 explicit-skip surfaces per K24g pattern.

### Workstream 3 — W.U.L.D logo placement

**3a. Asset handoff prerequisite (Josiah-side).**

Josiah surfaces in `uploads/` or via paste-relay:

- Full W.U.L.D logo (high-res PNG; presumably ~1500x1500 or larger). Contains: "WORTHLESS · USELESS · LIFELESS · DEAD" top + W.U.L.D mark + "UGLY FROM THE INSIDE OUT" bottom on red/black photo-collage ground.
- Optional: cropped/wordmark-only variant (just the W.U.L.D letters; no framing taglines). Useful for header chrome.
- Optional: SVG version if available.

**3b. AskUserQuestion lock — placement option.**

Four options for placement; Cowork recommends (b) or (c):

- **(a) Site-wide full logo (framing + W.U.L.D mark).** Mirrors all Josiah's external surfaces exactly. Highest visibility. Risk: rhetorical-charge of framing taglines clashes with academic register on `/frame/`, `/disclaimers/`, formal glossary entries.
- **(b) Homepage hero full + simpler chrome elsewhere (Recommended).** Full framed logo lands once with force at the door (replaces/augments current "wuld.ink" Cormorant title); deep pages keep `[ wuld.ink ]` mono chrome OR get a small W.U.L.D wordmark-only header. Reader register-setting where it lands hardest.
- **(c) Site-wide W.U.L.D wordmark only (no framing); full framing on homepage hero.** Wordmark = identity-mark site-wide; framing reserved for homepage. Compromise between (a) and (b). Also Recommended.
- **(d) Keep `[ wuld.ink ]` chrome unchanged; W.U.L.D mark only on homepage hero.** Most conservative. Site-wide chrome unchanged from K24g.

**3c. Implementation per chosen option.**

- Logo file lands in `src/assets/logo/` directory.
- Header chrome update: edit `<a class="site-mark" href="/">wuld.ink</a>` in nav across affected files. Either keep text OR swap to `<img src="/assets/logo/wuld-wordmark.png" alt="W.U.L.D · wuld.ink" class="site-mark-img">`.
- Homepage hero update: edit `src/index.html` cover-section. Replace/augment Cormorant `wuld.ink` title block with full-logo image. Preserve `[wuld.ink]` brackets identity ONLY if option (d).
- Mobile-friendly handling: `max-width` constraints + `aspect-ratio` preservation. Header chrome logo capped to fit header height (~3.5rem); homepage hero logo bounded to viewport-min for graceful mobile fallback.
- CSS additions inline OR promote to `/components/nav.css` if site-mark image is used (existing `.site-mark` rule needs sibling `.site-mark-img` rule).

### Workstream 4 — schema.org JSON-LD wave-edit

**4a. Per-page-type JSON-LD authorship.**

JSON-LD blocks injected into `<head>` after OG meta block (K24g anchor):

| Page type | Schema type | Required fields |
|---|---|---|
| Homepage (`/`) | `WebSite` + `Person` (author) | name, url, author, description, inLanguage, image |
| Essays (`/essays/<slug>/`) | `Article` | headline, author, datePublished, image, description, mainEntityOfPage |
| Blog posts (`/blog/<slug>/`) | `BlogPosting` | headline, author, datePublished, image, description |
| Glossary entries (`/glossary/<slug>/`) | `DefinedTerm` | name, description, inDefinedTermSet |
| Book page (`/book/`) | `Book` | name, author, image, description |
| Project pages (`/ne-hoc-fiat/`, `/violence-as-reductio/`, `/why-not-suicide/`) | `CreativeWork` | name, author, image, description |
| Frame / Coda / Library-about | `WebPage` | name, url, isPartOf (WebSite) |
| Section indexes (`/essays/`, `/blog/`, `/glossary/`, etc.) | `CollectionPage` | name, url, isPartOf |

Author = Person with `name: "Josiah S. Cooper"`, `alternateName: ["WULD", "AnomicIndividual87"]`, `url: "https://wuld.ink/"`, optional `sameAs` cross-links to other surfaces (Bandcamp + linktree + YouTube if Josiah wants).

`datePublished` derived from git log first-commit-date per file. `dateModified` derived from git log last-commit-date.

**4b. Bulk injection per K24c lesson xvi + K24g OG injection pattern.**

Python script with:
- Per-page-type classification (path-prefix matching)
- Per-page metadata derivation from existing `<title>` + `<meta name="description">` + git log + canonical URL (already set K24g)
- JSON-LD template substitution + JSON-encode safety (no string interpolation; use `json.dumps`)
- Inject `<script type="application/ld+json">{...}</script>` after OG meta block
- Idempotency via `b'application/ld+json' in data` check
- Same 5 explicit skips as K24g OG injection

Post-write integrity audit: NUL/CR/close-tag + JSON-parseable confirmation (Python `json.loads()` on extracted blocks).

**4c. Google Rich Results Test validation (optional, operator-side).**

Operator runs `https://search.google.com/test/rich-results` against `https://wuld.ink/` post-deploy + spot-checks 2-3 essay pages. Reports schema-type detected + any warnings/errors.

================================================================================

## TRACK OPTIONS (AskUserQuestion at session open after diagnostic)

**(a) Full 4-workstream stack (Recommended; ~100-130 calls)** — workstreams 1-4 above.

**(b) Split — infra hygiene + schema.org only (~60-80 calls).** Workstreams 1 + 4. Defers /music/ + W.U.L.D logo to K24i where Josiah's asset handoff can drive scope cleanly. Safe choice if asset uploads aren't ready at session open.

**(c) Split — /music/ + W.U.L.D logo only (~50-70 calls).** Workstreams 2 + 3. Defers infra hygiene + schema.org to K24i. Tighter scope if Josiah's focus is on the visible-surface refresh and Cloudflare/SEO work can wait.

**(d) Workstream 1 only — Cloudflare + crawler hygiene (~25-40 calls).** Minimum viable to close FB 403. Skips visible-surface work entirely.

**(e) Content-relay if uploads land first (variable, ~50-150 calls).** If `uploads/` at session open contains essay source files (K22 carry), book Exchange 6 trigger responses, AoMD audio R2 (operator-elective), library-Claude Exchange 14 reply, or successor-Claude responses — integrate per surface.

================================================================================

## DIAGNOSTIC-FIRST OPENING

1. `cd C:\Users\y_m_a\Projects\wuld-ink`
2. K24g verify: `git log -2 --oneline` → expect `eb61f1b K24g: positional-decisions pass...` + `8796c14 K24f: stale docs cleanup`.
3. Drift direction: `git status --short` → expect effectively-clean (only `docs/session-K24h-prompt.md` if operator-staged this handoff). K24f + K24g committed clean; clean streak holds N=2.
4. `ls /sessions/.../mnt/uploads/` — PRIMARY GATING SIGNAL for asset-handoff workstreams 2 + 3. Empty → AskUserQuestion includes asset-status as decision axis. Files present → integrate per file types (album-cover PNGs / logo PNG/SVG / coord-doc replies / essay sources).
5. `md5sum scripts/check-file.ps1` — sentinel re-verify (expect `82bacf3c`, 105L/3692B).
6. `md5sum scripts/publish-library-v3-7-1.ps1` — post-K24f sanity (expect `20be4e28`, 271L/11510B).
7. `md5sum docs/combined.html` — binding library md5 (expect `dd2abd01...88bcbb`; should hold byte-verbatim since K24g didn't touch).
8. Live-deploy spot-check:
   - `curl -sI https://wuld.ink/ | head -2` (HTTP 200)
   - `curl -sI https://wuld.ink/LICENSE | head -2` (HTTP 200)
   - `curl -sI https://wuld.ink/CITATION.cff | head -2` (HTTP 200)
   - `curl -sI https://wuld.ink/assets/og-default.png | head -2` (HTTP 200; content-type image/png)
   - `curl -sI https://library.wuld.ink/ | head -2` (HTTP 200)
9. FB-scraper verification: `curl -sI -A "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" https://wuld.ink/ | head -3` — from sandbox should be 200; operator-side via FB sharing-debugger may still be 403 pre-fix.
10. `test -d /sessions/.../mnt/C:/Users/y_m_a/OneDrive` — expect ABSENT (K24f close confirmed; K24g open confirmed; vector decisively dead).
11. `.git/index.lock` check (expect 0-byte continuing K22 lesson viii pattern).
12. CLAUDE.md size: `wc -lc CLAUDE.md` (expect ~172L/93084B post-K24g).
13. Tool budget pre-flag per track choice at AskUserQuestion.

================================================================================

## ASKUSERQUESTION at session open

Recommended question count: 3-4 axes per K24f lesson xxxi (question count scales with unresolved decision axes after diagnostic).

1. **Track lock?** Options (a)/(b)/(c)/(d) per TRACK OPTIONS above. Recommendation: (a) if uploads contain assets OR Josiah confirms paste-relay availability; (b) if uploads empty + no asset relay; (c) if Josiah explicitly wants visible-surface focus; (d) if minimum viable scope wanted.
2. **W.U.L.D logo placement?** Options (a) site-wide full / (b) homepage hero full + simpler chrome (Recommended) / (c) site-wide wordmark only (Recommended) / (d) keep current chrome. Only ask if track includes workstream 3.
3. **Asset handoff state?** "Have you brought the logo + album covers + per-album metadata?" Options: (i) already in uploads/ (Cowork verifies); (ii) bringing now via paste-relay; (iii) bringing later — scaffold placeholders this session; (iv) skip workstreams 2+3 entirely (switch to track b or d).
4. **Cloudflare Bot Fight Mode state?** Only ask if Josiah has Cloudflare dashboard open. Options: (i) verified OFF (proceed with belt-and-suspenders robots.txt); (ii) verified ON, will turn OFF (proceed); (iii) verified ON, want to keep ON with allowlist (Cowork ships WAF rule recommendation); (iv) haven't checked yet — emit diagnostic block + defer to mid-session.

================================================================================

## PRE-FLAG DEFERRED-PENDING (mention-only unless signaled)

Carry-forwards at K24h open (post-K24g + post-FB-403-finding):

**From K24g:**
* Exchange 14 reply pending from library-Claude on 5 substrate-fix candidates (A.3.a-e) + content question B on `cascade-math-safeguard`. Standing-pending; folds into next library reply round.
* og:image platform-rendering watch — Discord ✓ confirmed K24h handoff; FB pending Bot Fight Mode fix; Twitter validator removed (deferred entirely); LinkedIn post-inspector usable but K24h doesn't gate on it. iMessage/Bluesky/Mastodon spot-checks operator-elective.

**From K24f:**
* (closed) publish-library identity-set patch, stale-docs cleanup, OneDrive Test-Path operator verification.

**From K24e and earlier (mention-only):**
* Book Exchange 6 triggers (Lacero medium/surface decision; AoMD audio adaptation hosting; canonical-shift flag; Mementos book-canonical follow-ons).
* AoMD audio R2 upload (`_audio-staging/architecture-of-moral-disaster.mp3` 23:11) → R2 key `essays/architecture-of-moral-disaster/full.mp3`. Operator-side drag-drop.
* D2 flash card scaffolding (chat-side content + tech open).
* `/watch/` R2 thumb caching (low-priority).
* Anthropic issue #59564 (passive capture).
* HC mode second-look on live deploy (K24c lesson xvii) — escalate to font-weight tokens > outline-offset > spacing tokens if reads too-close-to-Dark.
* FOUM mitigation for magnification slider (K24c carry) — inline-head-script if Josiah notices flash-of-default-scale.
* gh CLI install (operator-elective; K24e lesson xxvi) — `winget install --id GitHub.cli`.
* CSS promote thresholds: `.entry-work-delivered` N=1; `.book-section-pointer` N=3 family; `.entry-alias` N=1; `.library-link` N=1; `/library-about/` inline `<style>` N=1; potential `/components/music.css` if 2nd music-shaped surface lands K24i+; potential `.site-mark-img` rule promote to `/components/nav.css` if option (b) or (c) ships.
* Sandbox-mount delete-blocked investigation (operator-elective; K23 lesson i). `icacls C:\Users\y_m_a\Projects\wuld-ink /reset /T /C /Q` may resolve ACL residue. Non-urgent.
* CLAUDE.md size watch: 93.1KB / 172L post-K24g. K28-K30 trim threshold projection holds. Memory file `project_website_intent.md` co-trim candidate.
* MEMORY.md index size: already over 24.4KB limit; K30 consolidation target.

**NEW K24g/K24h carry-forwards:**
* **og:image platform-rendering — Discord rendered cleanly K24h handoff (✓ visual confirmation).** Other platforms pending post-Bot-Fight-Mode-fix verification.
* **FB sharing-debugger 403 root cause** = Cloudflare bot-protection at edge level (not robots.txt). Sandbox curl with FB UA gets 200; FB scraper IPs get 403. Operator-side Cloudflare dashboard fix needed; workstream 1a.
* **Twitter Card Validator removed by Twitter/X.** Defer Twitter-side validation; reading X.com URL forms or Bluesky/Mastodon post-share previews are the surviving substitutes.
* **W.U.L.D logo = canonical multi-surface identity logo** (NOT music-project-specific). Used on YouTube + linktree + Bandcamp + presumably anywhere Josiah has presence. Architectural read at K24g initially treated it as music-project brand — correction landed in conversation. K24h scope ships it per Josiah's chosen placement option.
* **/music/ tab pattern-matches /watch/.** Link-out card grid + no iframe embed + no R2 self-hosting for full audio (would undercut Bandcamp purchase funnel + duplicate canonical source). Sleeve-notes / per-album commentary scaffolding reserved for future chat-side authorship.

================================================================================

## DISCIPLINE REMINDERS (K22 to K24g lessons — abbreviated; full text in CLAUDE.md narratives)

* Drift direction emit + sandbox-phantom + sandbox-truncation verification at session open.
* K24b lesson x: ANY file rewrite > ~5KB uses bash heredoc with quoted delimiter; Write tool truncates silently around ~17KB.
* K24c lesson xvi: bulk markup injection via regex-anchor + Python slice + atomic bytes write + post-write NUL/CR/close-tag audit. **Pattern N=3 validated K24g (license link + OG metadata + canonical wave-edit).**
* K24d lesson xx CRITICAL: f-string-with-backslash SyntaxError aborts at PARSE time. NO `\n` / `\x00` / `\\` escapes inside f-string expression blocks. Pre-compute every count / formatted value into named variable BEFORE the f-string. **Pattern fired K24g; mitigation held via pre-compute discipline.**
* K24d lesson xxiii: API-timeout-mid-workstream recovery via state-check + minimal-replay.
* K24e lesson xxiv: PS `Set-Content -Encoding UTF8 -NoNewline` emits BOM. Use `[System.IO.File]::WriteAllBytes` + `[System.Text.Encoding]::ASCII.GetBytes` for BOM-sensitive parsers.
* K24f lesson xxxi: AskUserQuestion question count scales with unresolved decision axes AFTER diagnostic. K24g locked 3 axes (track + license + og:image) in single round (N=5 validated).
* K24f lesson xxxii: Post-major-deliverable session shape is maintenance hygiene; trust the frame, do not pad envelope.
* K24f lesson xxxiv: Operator-side verification commands MUST be PowerShell-native by default. NEVER emit bash syntax in operator-side handoff blocks. `-UseBasicParsing` mandatory on Invoke-WebRequest.
* K24g lesson xxxv: Chrome MCP `resize_window` is NO-OP on attached-extension browsers. Mobile rendering audits go substrate-CSS-side; no viewport-driven path available.
* K24g lesson xxxvi: K24a lesson viii sandbox-read truncation recurs after multi-tool same-file editing (file-tool Edit followed by sandbox-bash Python read). Mitigation: derive write content from `git show HEAD:path` for any file already touched this session; per-file byte-delta audit catches truncations.
* K24g lesson xxxvii: OG metadata wave-edit pattern reusable for any per-page-derived bulk meta injection (schema.org, RSS link refs, additional twitter:* tags). **Lesson directly informs workstream 4 schema.org JSON-LD injection in K24h.**
* K24g lesson xxxviii: cairosvg pip-install + svg2png pattern durable for SVG→PNG rasterization. Reusable for any future raster-fallback need (e.g., W.U.L.D logo SVG→PNG if SVG-only doesn't render reliably on some platforms; workstream 3).
* K22 lesson vii: long-form content writes via bash heredoc with quoted delimiter; file-tool Edit/Write avoided on session-touched paths.
* K20 lesson i: vmwp.exe vector targets any C:\ mounted folder when sandbox initiates `.git/` writes. Operator-side PS for destructive ops bypasses VM entirely.
* K15 PS ledger: single `-m` commit; no Stop-mode on git stderr; ASCII-only PS scripts; `.gitattributes` via `[System.IO.File]::WriteAllText UTF8Encoding $false`.
* Recommendation-first response shape per user preference; pre-flag scope expansions that may exceed projected tool budget.

================================================================================

## END-OF-SESSION HANDOFF (per git-commands-at-close feedback memory)

Produce K24h commit message + push commands. Single -m commit. Operator-side PS block (PowerShell-native per K24f lesson xxxiv):

```powershell
cd C:\Users\y_m_a\Projects\wuld-ink
Remove-Item .git\index.lock -ErrorAction SilentlyContinue
git add -A
git commit -m "K24h: <summary>"
git push origin main
```

Post-push verification (PowerShell-native; `-UseBasicParsing` mandatory):

```powershell
(Invoke-WebRequest https://wuld.ink/ -Method Head -UseBasicParsing).StatusCode
(Invoke-WebRequest https://wuld.ink/robots.txt -Method Head -UseBasicParsing).StatusCode
(Invoke-WebRequest https://wuld.ink/sitemap.xml -Method Head -UseBasicParsing).StatusCode
(Invoke-WebRequest https://wuld.ink/music/ -Method Head -UseBasicParsing).StatusCode
(Invoke-WebRequest https://library.wuld.ink/ -Method Head -UseBasicParsing).StatusCode
```

If workstream 1a (Cloudflare Bot Fight Mode) was actioned operator-side mid-session, re-run FB sharing-debugger from operator-side post-deploy to confirm 200 + populated W-mark preview:
- Navigate to `https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fwuld.ink%2F`
- Hit "Scrape Again"
- Surface Response Code + Link Preview state for K24i handoff.

If sitemap.xml shipped, optionally submit to Google Search Console (operator-elective):
- Search Console → wuld.ink property → Sitemaps → Add `https://wuld.ink/sitemap.xml`.

Read CLAUDE.md first (172L / 93.1KB post-K24g). Memory file `project_website_intent.md` body at K23 close; K24b-K24g hooks in MEMORY.md description (K30 consolidation target).

End of K24h, hand off K24i with: (i) Cloudflare Bot Fight Mode resolution state + FB sharing-debugger post-fix verification; (ii) robots.txt + sitemap.xml live; (iii) `/music/` tab live with album cards (or placeholders if asset-handoff deferred); (iv) W.U.L.D logo placement per chosen option (a/b/c/d); (v) schema.org JSON-LD across 44 surfaces; (vi) any content-relay completions if uploads landed; (vii) new carries from any relay channel or visual-feedback finding.

================================================================================

## UNIQUE K24h PRE-FLAG

K24h is the third K-session in maintenance-mode territory (K24f + K24g + K24h), but the scope is HEAVIER than K24f-K24g because the deliverable axes branch in 4 independent directions (infra hygiene, music tab, logo refresh, schema.org). Tool-budget pre-flag at session open is essential — recommend explicit confirmation at AskUserQuestion that 100-130 calls is acceptable budget envelope before committing to track (a). If Josiah wants a tighter envelope, track (b) / (c) / (d) splits are available.

**Asset-handoff dependency is the load-bearing axis.** Workstreams 2 + 3 cannot ship-clean without Josiah's logo and album-cover files. If `uploads/` is empty at session open AND Josiah is not ready to paste-relay, default to track (b) — infra hygiene + schema.org only — and defer asset-dependent work to K24i. Do NOT scaffold placeholder cards if Josiah's ready-state isn't clear; placeholder shells without real cover images is the worst aesthetic outcome for the visible-surface refresh.

**Cloudflare Bot Fight Mode resolution is operator-side; Cowork emits instructions + waits for confirmation before workstream 1b/1c.** If Josiah resolves it mid-session and reports back, Cowork verifies via post-fix FB sharing-debugger curl + ships robots.txt + sitemap.xml. If Josiah hasn't resolved it by session-close, ship robots.txt + sitemap.xml anyway (belt-and-suspenders; non-blocking on the actual fix) and carry forward the Cloudflare investigation to K24i.

**W.U.L.D logo placement is Josiah's call; Cowork recommends but does not pre-select.** Surface options (a) site-wide full / (b) homepage hero full + simpler chrome / (c) site-wide wordmark only / (d) keep current chrome at AskUserQuestion. Cowork's preference is (b) or (c) based on rhetorical-register analysis from K24g conversation, but Josiah's authorial position holds.

**schema.org JSON-LD is the Google-side lever** — OG metadata alone doesn't move Google search snippets; JSON-LD does. Workstream 4 closes the Google-presentation gap K24g identified post-deploy.

The big-picture frame: at K24g close, OG metadata reached the SCRAPER LAYER but only some platforms could USE it (Discord ✓, FB blocked by Cloudflare, Twitter validator removed, Google needs JSON-LD). K24h closes those gaps and adds the music tab + W.U.L.D logo as visible-surface refreshes that align wuld.ink with Josiah's identity across his other external surfaces. After K24h, the umbrella's external-facing identity (link previews + search results + cross-surface visual continuity) should be coherent end-to-end.
