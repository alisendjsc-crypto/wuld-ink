# wuld.ink - Cowork session K24l handoff

K24k closed end-to-end with one commit (`1715a42`) — ambient dismiss + loop + theater-mode overlay + W-HOLE chip on /music/ + /archive/ tab + site-wide nav + CLAUDE.md narrative. Deploy verified 7/7 URLs HTTP 200. Edge-cache HIT-on-stale found post-close: Cloudflare's `components/*` cache TTL (`max-age=86400`) holds the K24j ambient-player.js in front of users for up to 24h after each component-JS deploy until manual purge.

K24l opens against an effectively-clean slate plus four explicit polish items from Josiah's post-K24k feedback + a now-mandatory infrastructure fix.

## K24l scope

### Workstream 1 — Cache-busting strategy (NOW MANDATORY)

**Root cause of K24k apparent button bug:** GitHub had correct K24k JS (md5 `ce0723bd...`, 14270B); Cloudflare edge served K24j JS (md5 `8254848f...`, 12001B) via `cf-cache-status: HIT age:3464`. Browser-side cache also held stale `max-age=86400` copy. Operator-side manual purge fixed user-visible state; Cowork-side fix prevents recurrence.

Two complementary fixes:

(a) **Drop `_headers` `components/*` TTL from 86400 → 300** (5-minute browser cache). Trades cache efficiency for deploy-freshness; component files are small (<15KB each) so cost is negligible. Edge cache still revalidates via ETag-If-Modified-Since.

(b) **Versioned query-string on component imports**: Update site-wide `<link>` + `<script>` references from `/components/ambient-player.js` → `/components/ambient-player.js?v=K24l` (or commit SHA). Each deploy makes URLs unique so browsers fetch fresh. Bulk-inject via K24c lesson xvi pattern across 45-49 surfaces.

**Recommendation: ship BOTH.** (a) protects against deploy-without-cache-bust mistakes; (b) provides immediate guarantee for THIS deploy. Going forward, the version string updates per K-session (`?v=K24l`, `?v=K24m`, etc.) and triggers fresh browser fetches automatically.

Estimated cost: ~10-15 calls (single Python pass for both _headers edit + bulk-replace).

### Workstream 2 — Archive videos: theater-mode integration + real titles + correct thumbnails

Josiah confirmed each video should open in theater-mode locally (per W-HOLE pattern). Plus the K24k-shipped descriptions were placeholder code-gibberish and both video cards used the same thumbnail (44N6Z7zEl9k duplicated for the playlist card by mistake).

**Real titles confirmed via YouTube oEmbed API** (`https://www.youtube.com/oembed?url=...&format=json`):

| Video ID | Title | Author |
|---|---|---|
| `44N6Z7zEl9k` | Deadness In Essence | WULD |
| `bvX4YMekoH0` | "The Illusion of Good and Evil", Visual / Auditory Collage [Digital Art] | WULD |
| `PL5zDoTelkQ6qr1xXbAG9MYnlF8f9_7wrN` (playlist) | Unlisted Videos | Evilis Anihilis Uls |

**Playlist thumbnail correction:** oEmbed returned `https://i.ytimg.com/vi/XbewprAqmT4/hqdefault.jpg` as the canonical playlist thumb (first video in playlist = `XbewprAqmT4`, not `44N6Z7zEl9k` which K24k accidentally reused).

**Architecture for archive video cards:**
- Replace `<a class="archive-video-thumb-wrap" href="https://www.youtube.com/...">` (link-out) with `<button class="archive-video-thumb-wrap" data-theater-video-id="<ID>" data-theater-title="<TITLE>">` (theater-trigger).
- Use the EXISTING `theater-mode.{css,js}` component shipped K24k (handles delegated `[data-theater-video-id]` click; no new code needed).
- For the playlist card: theater-mode currently supports single video IDs only. Either (i) playlist card stays as YouTube link-out (since theater-mode would need playlist support added), OR (ii) extend theater-mode to accept `data-theater-playlist-id` + construct `embed/videoseries?list=<ID>` URL. **Recommend (ii)** — small extension, ~5-10 lines in theater-mode.js.
- Keep "Open on YouTube ↗" affordance as secondary fallback link below the play-on-click thumb (small mono link), so users with autoplay-blocked browsers can still escape to YouTube.

**JSON-LD update:** VideoObject entries get real `name` field + thumbnailUrl pointing at `i.ytimg.com/vi/<ID>/hqdefault.jpg` (or per-video different ID if a higher-quality maxresdefault exists).

**Honest caveat:** Theater-mode embeds load youtube-nocookie.com on click. Same privacy register as W-HOLE. Already disclosed in disclaimers Sec.07 K24j.

Estimated cost: ~25-35 calls (theater-mode JS extension + archive card markup swap + JSON-LD update + verification).

### Workstream 3 — Forget the Plot page-image scrape

Josiah confirmed: "we can scrape some images from Forget the Plot." Book-Claude handoff §3 recommended: p.1, p.48, p.60, p.70 (noise-wall / page-turn break / "tired of being tired" collapse / visual implosion). Reveal-architecture hard rule still applies: page-images ARE the work; never clean transcript.

**Architecture:**
- Need `Forget_the_Plot.pdf` source path (operator-elective relay; K24l should ask at session open). Likely in `C:\Users\y_m_a\` somewhere or available via prior uploads — check `uploads/` first.
- Render via `pdftoppm` (poppler-utils; install via `apt-get install -y poppler-utils` in sandbox) at ~150-200 DPI to PNG. Pages 1, 48, 60, 70 + maybe one or two more if visually distinctive.
- Center-crop / downsize via PIL to web-friendly aspect (keep portrait/letter ratio; resize to max 1200px on long edge; quality 85 JPEG).
- Drop in `src/assets/archive/ftp/page-001.jpg`, `page-048.jpg`, etc.
- Replace `<div class="archive-ftp-placeholder">` in /archive/ with `<figure class="archive-ftp-page">` blocks containing the page renders + caption (page number + book context, not decode).
- Update JSON-LD ItemList: FtP entry becomes `ImageObject` per page OR a `CreativeWork` with `image` array.

**Edge case:** If the PDF isn't immediately available, K24l can ship the OTHER workstreams + leave FtP for K24m. Don't block on operator file relay.

Estimated cost: ~30-50 calls (PDF render + crop + drop + markup swap + integrity audit). Higher if asset count grows beyond 4 pages.

### Workstream 4 — Cowork recommended additions (defer if budget tight)

(a) **Archive nav-link `aria-current` page detection** — site-wide nav-injection K24k didn't set `aria-current="page"` on the Archive link for the archive page itself. Currently the Archive surface manually sets it in its own HTML, but the nav.js component should auto-detect. Verify nav.js handles Archive (it should — pattern-matches /music/ + others); if not, audit + fix.

(b) **Homepage destination grid: add Music + Archive cards** — K24h + K24k both shipped surfaces with eyebrow numbering (08 Music, 11 Archive) but didn't update homepage `.destination` grid. Either add both (push to 11 cards, accept 3-row-with-trailing-2 layout) OR restructure to 4-column grid. Josiah-decision axis; AskUserQuestion at session open if budget allows.

(c) **Archive Other-section flexibility** — currently 3 hardcoded open-question items (illustrations / FtP page-images / read-full-work). If FtP workstream lands, that item becomes RESOLVED; update the list. If illustration assets surface, same. Ongoing maintenance.

(d) **ambient-player chrome refinements (K24j carry-forward)** — bar height 2.5rem may feel intrusive; could shrink to 2rem OR auto-collapse on scroll-up. Track-name ellipsis can clip interesting titles; consider hover-marquee. Defer unless Josiah flags during K24l usage.

(e) **HC mode second-look on live deploy (K24c carry-forward)** — if Josiah notices HC still reads too close to Dark, escalate per K24c lesson xvii (font-weight tokens via EB Garamond 500 weight load, or outline-offset bump).

(f) **archive section CSS promote check** — `/archive/`'s 280-line inline `<style>` block is N=1 currently; if any second mixed-content surface appears (e.g., `/projects/` or `/notes/`), promote to `/components/archive.css`. No action this session unless N≥2 surfaces.

### Workstream 5 — K24l narrative + commit handoff

Standard close.

## Track options (AskUserQuestion at session open)

(a) **Full K24l end-to-end** (~80-130 calls) — WS1 cache-bust + WS2 archive theater + WS3 FtP + WS4 (a-c) + WS5. Requires FtP PDF available.

(b) **Cache-bust + archive theater + WS4 (defer FtP)** (~55-80 calls) — WS1 + WS2 + WS4 selected items + WS5. Use if PDF isn't ready.

(c) **Cache-bust only + emergency fix** (~15-25 calls) — WS1 + WS5. Fast deploy of cache-fix, defer everything else.

**Recommendation: (a) if FtP PDF is uploadable; (b) if not.** Cache-bust is mandatory either way.

## Diagnostic-first opening

1. `cd C:\Users\y_m_a\Projects\wuld-ink`
2. `git log -2 --oneline` — expect `1715a42 K24k:...` on HEAD.
3. `git status --short` — expect effectively-clean (only K24l prompt handoff doc).
4. `ls /sessions/.../mnt/uploads/` — check for `Forget_the_Plot.pdf` OR similar; if present, WS3 unblocked.
5. `md5sum src/components/ambient-player.js src/_headers` — capture pre-edit baselines.
6. Curl HEAD verify on `https://wuld.ink/components/ambient-player.js` — confirm cache state post-K24k purge (if user has done it, edge should show MISS or REVALIDATED then HIT-with-new-hash).
7. `test -d /sessions/.../mnt/C:/Users/y_m_a/OneDrive` — expect ABSENT (K24b lesson xiii vector decisively dead 6+ K-sessions).
8. CLAUDE.md size: `wc -lc CLAUDE.md` — expect ~199L/~141KB post-K24k.

## AskUserQuestion at session open

1. **Track lock?** Options (a)/(b)/(c) per above. Recommendation depends on FtP PDF state.
2. **FtP PDF availability?** Options: (i) PDF is in uploads/ or workspace, ready to scrape (recommended if true); (ii) PDF not ready, defer WS3 to K24m. If diagnostic finds the PDF, this axis collapses to (i).
3. **Cache-bust query-string scheme?** Options: (i) per-session marker (`?v=K24l`, `?v=K24m`) — recommended for human-readable; (ii) per-commit hash (`?v=<short-sha>`) — uniquely-keyed but cryptic; (iii) timestamp (`?v=<unix>`) — least human-readable but trivially generated.

Skip questions if diagnostic resolves axes unambiguously (K24f lesson xxxi pattern).

## Carry-forwards from K24k (resolved by K24l workstreams above)

- K24k carry-forward — theater-mode + ambient-pause coupling verification: **RESOLVED post-edge-purge** when user verifies on /music/. K24l WS2 extends pattern to archive.
- K24k carry-forward — ambient dismiss + loop verification: **RESOLVED post-edge-purge.**
- K24k carry-forward — /archive/ writings content-relay: **STILL OPEN** for book-Claude Exchange (Point 2-pull confirm + FtP reveal-layer call + K&U illustrations).
- K24k carry-forward — archive future expansions: STILL OPEN, low priority.
- K24k carry-forward — homepage destination grid: K24l WS4 (b) addresses.
- K24k carry-forward — 8-element ambient chrome cap: LOCK HOLDS.
- K24k carry-forward — `wuld:<noun>:<verb>` event channel: documented; reusable.

## Discipline reminders (compressed)

- **K24l NEW LESSON expected:** edge-cache discipline locks. Any component JS/CSS rev in future K-sessions MUST include cache-bust strategy. K24k lesson lxi candidate.
- K22 vii: heredoc with quoted delimiter for any rewrite > ~5KB.
- K24c xvi: bulk markup injection via regex anchor + atomic bytes write + post-write audit. K24l WS1(b) is N=8 of pattern.
- K24d xx: NO backslash in f-string expression parts; NO non-ASCII in `b'...'` byte literals (use str + `.encode('utf-8')`).
- K24e xxiv + K24i xlvi: BOM-sensitive parsers (`_headers`, `_redirects`). PS native: `[System.IO.File]::WriteAllBytes`. xxd verify byte-1.
- K24f xxxi + K24j liii: AskUserQuestion question count = unresolved-axes-after-diagnostic; collapse to 0 if user pre-commits to recommendations.
- K24g xxxvi + K24j lv: derive content from `git show HEAD:path` for any file already touched this session via Edit/Write/bash.
- K24j liv: theater-mode for archive playlist needs `embed/videoseries?list=<ID>` URL form (different from single-video `embed/<ID>`); extend theater-mode.js to accept optional `data-theater-playlist-id`.

## End-of-session handoff (per git-commands-at-close feedback memory)

```powershell
cd C:\Users\y_m_a\Projects\wuld-ink
Remove-Item .git\index.lock -ErrorAction SilentlyContinue
git add -A
git commit -m "K24l: <summary>"
git push origin main
```

Then **mandatory** Cloudflare purge of touched component URLs (operator-side). After K24l ships the versioned-query-string approach + lowered TTL, future K-sessions purge automatically via the query string change.

```powershell
$urls = @(
  "https://wuld.ink/",
  "https://wuld.ink/archive/",
  "https://wuld.ink/music/",
  "https://wuld.ink/components/ambient-player.js",
  "https://wuld.ink/components/theater-mode.js",
  "https://library.wuld.ink/"
)
foreach ($u in $urls) {
  try { "$((Invoke-WebRequest $u -Method Head -UseBasicParsing).StatusCode) $u" }
  catch { "ERR $u $($_.Exception.Message)" }
}
```

## UNIQUE K24l PRE-FLAG

K24l is the first K-session where a code-correctness deploy was MASKED by edge-cache stale-HIT. The K24k JS shipped correctly to GitHub; Pages picked it up; edge cache held the old version for users; the user reported buttons "don't work" when in fact the new code never reached their browser. **This is an infrastructure-discipline failure, not a code bug.** Going forward, any K-session that modifies a `components/*` file must (a) ship with cache-bust query string and/or (b) include manual edge-purge in the close handoff. K24l WS1 makes this systematic.

Secondarily: K24k's archive video card UX was placeholder-grade. K24k handoff specified link-out cards as the discipline; user feedback clarified the discipline should be theater-mode local embed (matching W-HOLE). The two-discipline divergence resolves in K24l toward consistency: ALL on-site video shares the theater-mode + youtube-nocookie + ambient-pause-on-overlay-open architecture. /watch/ retains its FACADE pattern (thumbnail + click-to-load-iframe in-place); /music/ + /archive/ use theater-mode overlay. This is the umbrella's locked video-affordance taxonomy.

Read CLAUDE.md first (199L / ~141KB post-K24k; K28-K30 trim threshold approaches). MEMORY.md index size: over 24.4KB limit; K30 consolidation target stands.

End of K24l hand off K24m with: (i) edge-cache strategy verified-in-deploy (user reports buttons work post-K24l without manual purge); (ii) archive video cards open in theater-mode; (iii) FtP page-image scrape status (shipped / deferred); (iv) any book-Claude Exchange follow-up; (v) Cowork-recommended carry-forwards.
