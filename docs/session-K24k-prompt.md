# wuld.ink — Cowork session K24k handoff

wuld.ink: Cowork session K24k. K24j closed end-to-end with one commit on origin/main:

* `c52d409` — K24j: ambient player end-to-end (component + 45-surface inject + disclaimers Sec.07 + CLAUDE.md narrative)

K24k opens against a clean carry-forward slate with three architecturally-named workstreams surfaced by Josiah after K24j live-test:

1. **Ambient bar dismiss button** — small polish addition; bar visibility toggle that does NOT stop playback (distinct from `[ambient off]` which stops audio).
2. **`/archive/` tab** — new discrete surface holding unlisted YouTube videos, older writings, and select link-out videos. Pattern-match `/watch/` link-out card grid.
3. **W-HOLE music video theater-mode embed** — first on-site video embed on the umbrella; theater-mode aesthetic modal triggered from `/music/` W-HOLE card. Couples to ambient player via custom-event channel.

Tool budget MEDIUM-HEAVY (~70-115 calls); three independent decision axes likely warrant 3-question AskUserQuestion at session open.

## K24j completion summary

* Four workstreams shipped clean end-to-end (~30 calls, well under 80-130 envelope).
* `src/components/ambient-player.{css,js}` authored (6.7KB CSS + 12KB JS). Hidden YouTube IFrame via youtube-nocookie.com pulling playlist `PLt28yN-6sGYFrlBca9RI70IjQ2ny50D1c`. localStorage `wuld:ambient` keyed state `{on, volume, currentVideoId, lastPositionSec, shuffleOn}`. First-interaction listener (click/touch/keydown capture-phase, one-shot) works around browser autoplay-policy hard-block. `.ambient-needs-tap` pulse class on play button when autoplay denied. Cross-page seek-resume via `currentVideoId` + `lastPositionSec` (re-found in next page's playlist; 800ms delay before `seekTo` to allow video load). Periodic save every 4s + `beforeunload` + `visibilitychange-hidden` (mobile background-kill mitigation).
* Bulk site-wide injection N=6 of K24c lesson xvi pattern across 45 HTML surfaces. Hit K24d lesson xx adjacent failure mode (unescaped `+` in `image/svg+xml` regex matched zero files; corrected to `image/svg\+xml` + re-ran clean; ~1 call overhead). 5 explicit skips: `_/successor-protocol/` (sealed) + `glossary/black-box-of-inaccessibility/` (redirect stub) + `404.html` + both templates. Post-write integrity 45/45 clean (0 NUL/CR; close-tag + `id="ambient-player"` + both imports present).
* Disclaimers Sec.07 youtube-nocookie transparency note shipped via K24g lesson xxxvi mitigation pattern: `git show HEAD:src/disclaimers/index.html` + bulk-inject re-application + new yt-paragraph all in one atomic write. 15317B (HEAD) → 16967B; 7 sections preserved; `<p>` 24→25.
* CLAUDE.md +11.9KB: K24j paragraph + `### Carry-forwards to K24k` rename + 4 new K24j (NEW) entries + K24i (NEW) entries de-NEWed (path D marked RESOLVED K24j). Final 188L/129KB.
* 5 new lessons logged (li regex literal-`+` trap; lii pre-emptive HEAD-derive mitigation works cleanly when same file touched in multiple workstreams; liii user-explicit-recommendation-acceptance skips AskUserQuestion; liv setShuffle is YT-internal not externally-stable cross-page; lv `git show HEAD:path` via `subprocess.check_output` is the durable K24g xxxvi mitigation).
* Deploy verification clean: 6/6 URLs 200 on first push (`/`, `/components/ambient-player.css`, `/components/ambient-player.js`, `/music/`, `/disclaimers/`, `library.wuld.ink/`). FB-403 hold confirmed (FB UA: Status 200, X-Robots-Tag: index, follow; Permissions-Policy present; og:image: Status 200, ACAO: *, Cache-Control: public max-age=2592000 immutable).
* Josiah live-test on first deploy: all buttons work, volume works, autoplay achieved via first-interaction listener.

## K24k scope

### Workstream 1 — Ambient bar dismiss button

User-explicit request: a `[v]` button on the ambient bar that toggles bar VISIBILITY without stopping playback. Distinct from `[ambient off]` which pauses audio. Persists across navigation.

**Two design candidates for re-summon affordance:**

(a) **Hairline sliver** — bar collapses to ~6px tall accent-colored hairline at viewport bottom. Click anywhere on the sliver re-expands to full 2.5rem bar. Most discrete; matches neobrutalist register; reuses existing chrome real estate.

(b) **Corner re-summon tab** — bar disappears entirely; a small `[^]` button (~16px square, mono register) sits in viewport bottom-right corner. Click to re-summon full bar. More conventional; cleaner visual silence when dismissed.

Recommendation: **(a) hairline sliver**. The site already commits to a single-fixed-element-at-bottom pattern; collapsing to a sliver preserves the affordance location (muscle memory), avoids introducing a second fixed-position element (corner tab), and the accent-color hairline is its own quiet visual signal that the bar is hibernating, not gone.

**Architecture:**
* Add `dismissed` (boolean) to `wuld:ambient` localStorage state (default false).
* New `data-state="dismissed"` attribute on `.ambient-player` (combinable with `data-state="off"`).
* CSS: `.ambient-player[data-state*="dismissed"] .ambient-bar { height: 6px; padding: 0; overflow: hidden; }` + hide all child elements except a thin accent strip + click handler binds to the entire collapsed bar (cursor: pointer).
* JS: new public method `window.WuldAmbient.dismiss()` + `restore()` + state-attr management.
* `[v]` button rendered as right-most chrome element in bar (after `[ambient on]`). Click dispatches `dismiss()`.
* Click on collapsed sliver dispatches `restore()`.
* State sticky across navigation via existing localStorage save mechanism.

Site-wide chrome markup already present in 45 surfaces; we only need to add the `[v]` button + supporting CSS/JS. **Cost: ~10-15 calls.** No site-wide re-injection needed (the chrome markup expands within the existing container; only `ambient-player.{css,js}` change).

### Workstream 2 — `/archive/` tab

User-explicit request: a "discrete" archive tab. Content surfaces:
* **Unlisted YouTube videos** — `PL5zDoTelkQ6qr1xXbAG9MYnlF8f9_7wrN` (full playlist link-out + per-video card options TBD).
* **Older writings from previous books** — specifics TBD (which books, how many pieces, content-relay path).
* **Select videos** — `44N6Z7zEl9k` + `bvX4YMekoH0` (link-out, individual cards).

**Discrete-tab framing** — nav placement options:
(i) **Append to nav** as last item alongside Watch + Music + Frame + Book + Glossary + Library + Blog (would make 9 items; risks crowding).
(ii) **Nav drawer / overflow menu** — collapse some items behind a `[ ... ]` toggle; requires nav restructure.
(iii) **Footer-only** — `archive →` link in footer alongside disclaimers + library; not in primary nav.
(iv) **Discreet pointer** from existing nav item (e.g., `/glossary/` page footer note pointing to `/archive/`) per K3 `.frame-pointer` idiom.

Recommendation: **(i) Append to nav** with explicit "Archive" label. "Discrete" in Josiah's framing reads as "deprioritized, not hidden" — putting it as last nav item is honestly demarcated without being secret. Approach (iv) discreet-pointer applies when content is genuinely sealed or work-delivered (like `.frame-pointer` to `/frame/` from glossary; like `.sp-aside` to `/_/successor-protocol/` from `/ne-hoc-fiat/`). Archive is publicly-accessible reference material, not gated — primary nav placement is correct.

**Page architecture (recommended):**
* Single `/archive/index.html` page with three `.archive-section` blocks (Videos / Writings / Other).
* Pattern-match `/watch/` link-out card grid for video sections (no on-site embed — link-out to YouTube preserves bandwidth + surveillance discipline; with one exception via W-HOLE theater-mode below).
* Pattern-match `/blog/` post-list shape for writings section (date eyebrow + title + lede + "Read →" or "External →" affordance).
* Mono register matching `/watch/` + `/music/` link-out cards.
* JSON-LD CollectionPage with mainEntity ItemList containing VideoObject items + CreativeWork items.
* sitemap.xml + nav-injection across 45 surfaces (K24c lesson xvi N=7 pattern).

**Pre-decision pending Josiah-input:**
* Older-writings content path — Josiah surfaces source files chat-side; or operator-side drops into `src/archive/writings/*.md`; or per-piece pages under `src/archive/<slug>/index.html`.
* Per-video cards vs. single playlist link-out for unlisted YouTube playlist — depends on whether playlist is curated (10-20 videos = card grid sustainable; 100+ videos = link-out only).

**Cost: ~30-50 calls** depending on content-relay scope.

### Workstream 3 — W-HOLE music video theater-mode embed

User-explicit request: embed W-HOLE music video (`kUWzDpDf4aw`) on `/music/` with "theater mode aesthetic when you click play." First on-site video embed on the umbrella.

**Architecture decision points:**

(a) **Trigger location** — three options:
   * (a.i) **Cover image becomes the play trigger** — click W-HOLE cover, theater opens. Cover gets a play-icon overlay on hover. Tight semantic coupling cover/video.
   * (a.ii) **Separate `[ Watch video ]` chip** under cover + meta block — explicit affordance; cover remains link-to-Bandcamp.
   * (a.iii) **Both** — cover-click goes to Bandcamp (existing behavior); chip opens theater. Most explicit but adds chrome.

Recommendation: **(a.ii) separate chip** under the cover. Preserves existing Bandcamp link-out flow + adds video affordance as a distinct affordance. Cover-click semantic stays consistent across all music cards (covers → Bandcamp). Future music videos for 92982/Epicycle II/etc. inherit the same chip pattern.

(b) **Theater-mode component** — new `src/components/theater-mode.{css,js}`:
   * Full-viewport overlay (`position: fixed; inset: 0; background: rgba(10,10,10,0.95)`).
   * Centered 16:9 iframe container with max-width: 90vw + max-height: 90vh.
   * youtube-nocookie.com iframe embed (consistent with ambient player privacy register).
   * Close affordances: `[Esc]` keyboard + `[x]` button (top-right) + click-outside-iframe.
   * `aria-modal="true"` + focus trap + scroll-lock on body.
   * Reduced-motion: skip fade-in animation.

(c) **Coupling to ambient player** — when theater opens, ambient must pause (two audio streams fighting otherwise). Custom-event channel:
   * `theater-mode.js` dispatches `wuld:overlay:open` event on document on open + `wuld:overlay:close` on close.
   * `ambient-player.js` listens: on `:open`, save current playing state + `player.pauseVideo()`; on `:close`, if saved-state was playing, `player.playVideo()`.
   * Reusable for any future overlay (lightbox, modal, etc.). Pattern locks for K24k.

(d) **Architecture for arbitrary video embeds** — design theater-mode component to accept any YouTube video ID via `data-video-id` attribute on the trigger element. Then archive surface (workstream 2) can reuse same component for select videos that warrant on-site embed (operator decision: 100% link-out vs. some on-site).

**Cost: ~30-50 calls** (new component + integration on `/music/` + custom-event coupling + cross-browser modal testing).

### Workstream 4 — K24k narrative + commit handoff

Standard close pattern per K-session ledger.

================================================================================

## TRACK OPTIONS (AskUserQuestion at session open after diagnostic)

(a) **Full K24k end-to-end (Recommended; ~70-115 calls)** — workstreams 1-4. Ambient dismiss button + `/archive/` tab + W-HOLE theater-mode + commit. If older-writings content not yet ready, scaffold `/archive/` with placeholder for that section + ship the video sections.

(b) **Dismiss button + archive scaffold only (~40-60 calls)** — workstreams 1 + 2 (archive shell, no W-HOLE theater-mode this session). Defer theater-mode to K24l. Lower-risk path if Josiah wants the dismiss button live + archive started before committing to the more complex theater-mode coupling.

(c) **Dismiss button + W-HOLE theater-mode only (~40-65 calls)** — workstreams 1 + 3. Defer archive to K24l. Path for "ship the polish + ship the highest-impact new feature" focus.

(d) **Dismiss button only (~15-25 calls)** — workstream 1 only. Defer archive + theater-mode to K24l. Path if Josiah wants quick polish + then a content-relay session next.

================================================================================

## DIAGNOSTIC-FIRST OPENING

1. `cd C:\Users\y_m_a\Projects\wuld-ink`
2. K24j verify: `git log -2 --oneline` -> expect `c52d409 K24j: ambient player end-to-end (component + 45-surface inject + disclaimers Sec.07 + CLAUDE.md narrative)` + handoff addendum if K24k prompt was pre-staged.
3. Drift: `git status --short` -> expect effectively-clean (only K24k prompt handoff doc if operator-staged).
4. `ls /sessions/.../mnt/uploads/` — if older-writings source files dropped, scope shifts to content-relay-heavy.
5. `md5sum scripts/check-file.ps1` — sentinel re-verify (expect `82bacf3c`, 105L/3692B).
6. `md5sum src/_headers` — expect `21e7ca2f` 79L/2877B (K24i hold).
7. `md5sum src/components/ambient-player.js` — expect new K24j md5 (capture for K24k baseline).
8. Deploy spot-check curl HEAD: `https://wuld.ink/` + `https://wuld.ink/components/ambient-player.js` + `https://library.wuld.ink/` (md5 `dd2abd01...88bcbb`).
9. `test -d /sessions/.../mnt/C:/Users/y_m_a/OneDrive` — expect ABSENT (K24b lesson xiii vector decisively dead 5 K-sessions running if absent).
10. `.git/index.lock` continues K22 lesson viii pattern (expect 0-byte mtime drift).
11. CLAUDE.md size: `wc -lc CLAUDE.md` (expect 188L/129KB post-K24j; K28-K30 trim threshold approaches).
12. Tool budget pre-flag per track choice at AskUserQuestion.

================================================================================

## ASKUSERQUESTION at session open

Recommended 2-3 questions per K24b lesson xii pattern + K24d lesson xxii scaling rule (question count = unresolved decision axes after diagnostic):

1. **Track lock?** Options (a)/(b)/(c)/(d) per TRACK OPTIONS above. Recommendation: (a) if full envelope is acceptable; (b) if theater-mode coupling feels premature; (c) if archive content isn't ready yet but you want the music-video shipped; (d) if you want quick polish only.

2. **Dismiss-button re-summon affordance?** Options: (i) **Hairline sliver** (collapsed bar = 6px accent line at bottom, click anywhere on sliver to restore; Recommended — most discrete + reuses location), (ii) **Corner `[^]` tab** (bar disappears, small bottom-right re-summon button), (iii) **Both / hybrid** (sliver primary + corner backup if sliver gets dismissed too).

3. **(if track a or b)** **Archive content-relay status?** Options: (i) **Scaffold all 3 sections + Josiah relays older-writings content later** (recommended; archive shell ships now, writings section as `[ Forthcoming ]` placeholder), (ii) **Wait until older-writings content ready before shipping archive** (defer entire archive to K24l), (iii) **Ship video sections only this session + add writings section in a later micro** (split-scope).

================================================================================

## PRE-FLAG DEFERRED-PENDING (mention-only unless signaled)

Carry-forwards at K24k open (post-K24j close):

From K24j (NEW):
* Cross-browser ambient-player verification on live deploy — Josiah confirmed Chrome works K24j. Safari + Firefox + iOS Safari spot-checks still pending. Operator-elective unless Josiah surfaces a regression.
* Ambient bar interaction-design refinements — (a) bar height 2.5rem; (b) `[ambient on]` / `[ambient off]` verbose labels; (c) volume slider width on narrow desktops; (d) track-name ellipsis truncation. None blockers; defer unless Josiah flags during K24k usage. K24k may resolve (b) implicitly via dismiss-button addition (the more chrome elements, the more pressure to abbreviate labels).
* Ambient-player CSS promote threshold N=1 — no promote action needed; matches `audio-player.css`/`mode-toggle.css` etc. established single-purpose-file pattern.
* Ambient-player YouTube tracking-disclosure already shipped in Sec.07; no further disclaimer work needed unless cookie-consent banner intent surfaces.

From K24i (NEW):
* FB-403 closure CONFIRMED at K24j deploy via post-push PS check (Status 200, X-Robots-Tag present, Permissions-Policy present, og:image immutable cache). Discord ✓ K24h; FB ✓ K24i/j. Remaining platform spot-checks (Slack/iMessage/Bluesky/Mastodon/LinkedIn) operator-elective.
* Cloudflare dashboard Chrome MCP discipline (K24i lesson xlv) holds; no dashboard work K24j; pre-flag if K24k dashboard work projected (unlikely).
* JSON-LD audit methodology (K24i lesson xlvii) holds.
* `_headers` BOM + non-ASCII discipline (K24i lesson xlvi) holds.

From K24g (still standing):
* Exchange 14 reply pending from library-Claude on 5 substrate-fix candidates (A.3.a-e) + content question B on `cascade-math-safeguard`. Standing-pending; folds into next library reply round.

From K24f and earlier (mention-only):
* Book Exchange 6 triggers (Lacero medium/surface; AoMD audio adaptation hosting; canonical-shift flag; Mementos book-canonical follow-ons).
* AoMD audio R2 upload (`_audio-staging/architecture-of-moral-disaster.mp3` 23:11) -> R2 key `essays/architecture-of-moral-disaster/full.mp3`.
* D2 flash card scaffolding (chat-side content + tech open).
* `/watch/` R2 thumb caching (low-priority).
* Anthropic issue #59564 (passive capture).
* HC mode second-look on live deploy (K24c lesson xvii).
* FOUM mitigation for magnification slider (K24c carry).
* `gh` CLI install (operator-elective; K24e lesson xxvi).
* Sandbox-mount delete-blocked investigation (operator-elective; K23 lesson i).
* CSS promote thresholds: `.entry-work-delivered` N=1; `.book-section-pointer` N=3 family; `.entry-alias` N=1; `.library-link` N=1; `.music-css` N=1; `.cover-mark-img-fallback` N=1; `.music-card`/`.music-cover-wrap` family N=1; `.ambient-player` family N=1 (K24j).
* 92982 + Epicycle II `/music/` secondary cards (awaits Josiah surfacing public-release status + Bandcamp URLs + cover image paths).
* W.U.L.D wordmark-only header iteration (wuld-icon-standard.png 576x576 reserved at src/assets/logo/).
* CLAUDE.md size watch: 129KB / 188L post-K24j. K28-K30 trim threshold approaches (general-purpose subagent delegation pattern K8/K14/K22/K24d-trim N=4 validated).
* MEMORY.md index size: over 24.4KB limit; K30 consolidation target.

================================================================================

## DISCIPLINE REMINDERS (K22 to K24j lessons — abbreviated; full text in CLAUDE.md narratives)

* Drift direction emit + sandbox-phantom + sandbox-truncation verification at session open.
* K24b lesson x: ANY file rewrite > ~5KB uses bash heredoc with quoted delimiter; Write tool truncates silently around ~17KB.
* K24c lesson xvi: bulk markup injection via regex-anchor + Python slice + atomic bytes write + post-write NUL/CR/close-tag audit. N=6 validated K24j. K24k workstream 2 nav-injection will be N=7; theater-mode trigger chip injection on `/music/` is N=1 single-file.
* K24d lesson xx CRITICAL: f-string-with-backslash SyntaxError aborts at PARSE time. NO `\n` / `\x00` / `\\` escapes inside f-string expression blocks. Also: `b'...'` byte literals CANNOT contain non-ASCII (em-dashes, smart-quotes); use str + `.encode('utf-8')` instead.
* K24d lesson xxiii: API-timeout-mid-workstream recovery via state-check + minimal-replay.
* K24e lesson xxiv: PS `Set-Content -Encoding UTF8 -NoNewline` emits BOM. Use `[System.IO.File]::WriteAllBytes` + `[System.Text.Encoding]::ASCII.GetBytes` for BOM-sensitive parsers (`_redirects`, `_headers`, `.gitattributes`).
* K24f lesson xxxi: AskUserQuestion question count scales with unresolved decision axes AFTER diagnostic.
* K24f lesson xxxii: Post-major-deliverable session shape is maintenance hygiene; trust the frame, do not pad envelope. K24k is mixed delivery + polish; full envelope acceptable.
* K24f lesson xxxiv: Operator-side verification commands MUST be PowerShell-native by default. NEVER emit bash syntax in operator-side handoff blocks. `-UseBasicParsing` mandatory on Invoke-WebRequest.
* K24g lesson xxxv: Chrome MCP `resize_window` is NO-OP on attached-extension browsers. Mobile audits go substrate-CSS-side.
* K24g lesson xxxvi + K24j lesson lv: sandbox-read truncation recurs after multi-tool same-file editing. Mitigation: derive write content from `git show HEAD:path` via `subprocess.check_output` for any file already touched this session. Pattern N=2 validated K24j.
* K24g lesson xxxvii: OG/JSON-LD wave-edit pattern reusable for any per-page-derived bulk meta injection. K24k archive surface gets JSON-LD via same pattern.
* K24h lesson xxxix: Chat image-paste does NOT persist to `uploads/`. Workaround: user saves to local disk + relays absolute path.
* K24h lesson xli: Bandcamp anti-bot wall robust against UA spoofing. Bandcamp metadata pulls go local-first; Bandcamp itself is link-out target only.
* K24h lesson xlii: ffprobe + ID3-tag pattern durable for music inventories.
* K24h lesson xliv: Existing video-element fallback architecture is a layered identity-mark vector. AUGMENT the fallback chain rather than replace the primary.
* K24i lesson xlv: Cloudflare dashboard anti-automation fingerprinting blocks Chrome MCP bootstrap; recovery requires operator manual render-trigger.
* K24i lesson xlvi: `_headers` BOM + non-ASCII discipline; same parser family as `_redirects`.
* K24i lesson xlvii: JSON-LD audit methodology — walk nested entity properties not just top-level @type.
* K24i lesson xlviii: WS-as-spot-check shape locks for closure sessions; mark SHIPPED vs VERIFIED vs RESOLVED-AS-NO-FIX-NEEDED.
* K24i lesson xlix: Browser autoplay policy is hard-blocked; first-interaction-autoplay is the closest workaround. Theater-mode workstream 3 inherits this discipline — modal-open does NOT need first-interaction (the open IS a user gesture); modal video autoplay works on click without separate workaround.
* K24i lesson l: Hidden YouTube IFrame with cross-page state persistence requires localStorage + first-interaction listener composition. K24j shipped this pattern. K24k theater-mode is a DIFFERENT pattern (modal iframe ephemeral to overlay lifetime; no cross-page state needed since modal closes before navigation).
* K24j lesson li: Regex `+` literal vs special-char trap — escape as `\+` for literal match. Diagnostic-test-the-regex pattern (1 bash call to test against known-positive sample) catches this before bulk-run.
* K24j lesson lii: Pre-emptive HEAD-derive mitigation when same file touched across multiple workstreams in same session. K24k workstream 3 will touch `/music/index.html` for chip-injection; if other K24k workstream also touches it, apply this pattern.
* K24j lesson liii: User-explicit-recommendation-acceptance skips AskUserQuestion. If K24k prompt closes with similar pre-commit, skip AskUserQuestion.
* K24j lesson liv: YouTube IFrame API `setShuffle(true)` is YT-internal not externally-stable cross-page. Cross-page state via `currentVideoId` + `lastPositionSec` is correct pattern; documented in ambient-player.js comments. Future: if Josiah flags shuffle-order-discontinuity as UX issue, enumerate playlist IDs client-side + seed deterministic shuffle in localStorage.
* K24j lesson lv: `git show HEAD:path` via `subprocess.check_output` is durable K24g xxxvi mitigation.
* K22 lesson vii: long-form content writes via bash heredoc with quoted delimiter; file-tool Edit/Write avoided on session-touched paths.
* K15 PS ledger: single `-m` commit; no Stop-mode on git stderr; ASCII-only PS scripts.
* Recommendation-first response shape per user preference; pre-flag scope expansions that may exceed projected tool budget.

================================================================================

## END-OF-SESSION HANDOFF (per git-commands-at-close feedback memory)

Produce K24k commit message + push commands. Single `-m` commit. Operator-side PS block:

```powershell
cd C:\Users\y_m_a\Projects\wuld-ink
Remove-Item .git\index.lock -ErrorAction SilentlyContinue
git add -A
git commit -m "K24k: <summary>"
git push origin main
```

Post-push verification (PowerShell-native; `-UseBasicParsing` mandatory):

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

Post-deploy smoke-tests:
1. Open `https://wuld.ink/` in regular Chrome. Verify ambient bar renders + autoplay (or pulse-tap CTA + first-click unsticks). Verify new `[v]` dismiss button collapses bar to sliver (or corner-tab depending on chosen design). Click sliver/tab to restore. Reload page — dismissed state persists.
2. Navigate to `https://wuld.ink/music/`. Click new `[ Watch video ]` chip under W-HOLE cover. Theater-mode opens with W-HOLE music video. Ambient pauses automatically (custom-event coupling). Close theater (Esc or click outside or `[x]`). Ambient resumes if it was on.
3. Navigate to `https://wuld.ink/archive/`. Verify 3 sections render (Videos / Writings / Other). Verify link-out cards work + JSON-LD VideoObject items present.

Read CLAUDE.md first (188L / ~129KB post-K24j; K28-K30 trim threshold approaches). Memory file `project_website_intent.md` body still at K23 close; K24b-K24j hooks in MEMORY.md description (K30 consolidation target).

End of K24k, hand off K24l with: (i) dismiss-button state on live deploy (sliver vs corner choice in production + working); (ii) archive surface ship state (full / partial / scaffold-only); (iii) W-HOLE theater-mode ship state; (iv) any cross-browser test findings if operator ran Safari/Firefox smoke tests on K24j ambient player; (v) any content-relay completions for older-writings; (vi) new carries from any relay channel or new finding.

================================================================================

## UNIQUE K24k PRE-FLAG

K24k is the umbrella's first session to introduce **inter-component coupling via custom-event channel** (`wuld:overlay:open` / `wuld:overlay:close` linking theater-mode to ambient-player). This is a small architectural pattern lock that will compound: any future overlay (lightbox, modal, full-screen reader, etc.) gets the same event channel for ambient-pause coordination. Document the pattern in `theater-mode.js` comments + in CLAUDE.md K24k narrative so the convention sticks.

The dismiss-button addition surfaces a second architectural lock: **the ambient bar's chrome budget**. With dismiss added, the bar has 7 chrome elements (track + play + skip + shuffle + volume + ambient on/off + dismiss). Any future element pushes us into chrome-sprawl territory. K24j lesson xviii (composite chrome instrument) applies in reverse here — when do we promote some of these into a hidden menu vs. keep them inline? K24k should make a deliberate call: either commit to "7 is the cap; anything else goes elsewhere" OR plan a `[ ... ]` overflow toggle for K24l+. Recommendation: **commit to 7 as the cap**. The bar's purpose is ambient-control, not media-center-control; if Josiah ever wants playlist-picker / track-history / fave-track features, those belong in a dedicated `/music/` or `/ambient/` companion page, not in the chrome bar.

The archive surface introduces the **first taxonomically-mixed content surface on the umbrella** (videos + writings + other in one shell). All prior surfaces are single-content-type (essays index, blog index, glossary index, watch/music link-out grids). The archive needs visual section separation that respects the mixed-type register without making it feel like three disconnected sub-pages stapled together. Recommendation: thin horizontal rule + section-eyebrow label between blocks, no nested cards or sub-headers — keep the surface flat + skimmable. The reader's expectation walking into archive is "old stuff, mixed bag, browsable" — not "structured taxonomy."

The W-HOLE theater-mode is the **first non-link-out video surface** on the umbrella. It crosses the bandwidth-discipline threshold (theater-mode embed = real iframe load = real bandwidth cost vs. /watch/ + /music/ link-out cards which are images + text only). Justify the exception explicitly in the disclaimers if Josiah flags privacy concern: the embed is per-user-action-triggered (no autoplay on `/music/` load), uses youtube-nocookie.com (same standard as ambient player), pauses ambient player to avoid audio collision. The same exception applies if archive surface gets any on-site video embeds for the select-videos sub-section.

The big-picture frame at K24k open: wuld.ink is now end-to-end coherent across structural + content + chrome + audio + sensory layers (favicon + og:image + JSON-LD + robots + sitemap + library subdomain + CC-BY-4.0 license + nav with Music + W.U.L.D logo hero + FB-403 resolved + ambient player). K24k adds the **archive layer** (deprioritized-but-accessible reference materials) + the **on-site video viewing experience** (theater-mode first instance). After K24k, the remaining umbrella scope is content-relay-driven (essay sources, book Mementos, library Exchange 14 reply, glossary bodies, 92982/Epicycle II Bandcamp URLs) unless a new infrastructure surface emerges or the K28-K30 trim threshold lands.
