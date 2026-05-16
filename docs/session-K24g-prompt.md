# wuld.ink — Cowork session K24g handoff

wuld.ink: Cowork session K24g. K24f closed end-to-end with two commits on origin/main:

- `22b43b6` — K24f: publish script step 5.5 identity-set patch + CLAUDE.md narrative + carry-forward tidy
- `8796c14` — K24f: stale docs cleanup (CITATION.cff + instructions.md)

`Test-Path C:\Users\y_m_a\OneDrive` returned `False` post-cleanup → **K24b lesson xiii vector decisively closed** at both sandbox and Windows-side layers. K24f was the first steady-state K-session in the umbrella's lifecycle; K24g opens against a clean carry-forward slate with most architecturally-named carries either CLOSED or DOWNGRADED to mention-only status.

## K24f completion summary

* `scripts/publish-library-v3-7-1.ps1` 262L/11060B → 271L/11510B; md5 `acca7c5b` → `20be4e28`; ASCII-only clean; `$WULDINK_EMAIL` + `$WULDINK_NAME` constants at script-top (L53-54); new `# === Step 5.5 ===` block at L131-135 with `[5.5/12]` progress marker + `git -C $REPO_LOCAL config user.email/user.name` + DarkGreen confirmation; K24e lesson xxvii "Author identity unknown" failure mode neutralized on next publish run.
* Stale `docs/` cleanup committed operator-side (`docs/CITATION.cff` + `docs/instructions.md` removed via `git rm`; `docs/gitattributes` + `.git/COMMIT_K22.txt` already gone since K24e). `docs/session-K24f-prompt.md` swept along by operator-side `git add -A` — landed in `8796c14`; architecturally fine since it documents the handoff chain alongside other coord docs.
* CLAUDE.md 79336B → 83201B (+3865B / 165L → 167L); section header date updated `post-session-K24b close` → `post-session-K24f close`; carry-forwards header renamed K24f → K24g; three K24e bullets transitioned (identity-set CLOSED, stale-docs refreshed K24f-prefixed pending-commit, OneDrive watch refreshed K24f-prefixed Test-Path operator verification); lessons xxxi-xxxiii logged.
* **Operator-visible deploy verification:** `(Invoke-WebRequest https://wuld.ink/ -Method Head -UseBasicParsing).StatusCode` = 200; `(Invoke-WebRequest https://library.wuld.ink/ -Method Head -UseBasicParsing).StatusCode` = 200. WebClient-side md5 returned `7efbc940cbcc071cb37793955ee4d49c` (504 bytes longer than source `dd2abd01...88bcbb`) — Cloudflare Email Address Obfuscation injecting JS shim around plaintext emails for browser-class clients. Non-blocking; binding md5 contract preserved at source + via curl.

Tool budget retrospective: projected 25-40 calls (track a refined); actual ~19 main-context calls. Single-question AskUserQuestion at session open validated K24b lesson xii pattern at N=4. Bash heredoc + Python str.replace pattern held clean per K22 lesson vii + K24b lesson x.

================================================================================
## K24g PRIMARY SCOPE — Recommended default: (a) positional-decisions pass

K24g opens against the cleanest carry-forward slate the umbrella has had since K8. The recommended primary track is the **positional-decisions pass** identified at K24f close — three categories of unmade authorial decisions currently showing as silence/absence rather than positioned stance:

1. **OG / link-preview metadata** absent across all surfaces (0 occurrences site-wide). When wuld.ink URLs get shared in Slack/iMessage/Discord/Mastodon/etc. they render as bare URLs with zero authorial control over framing.
2. **Site-side `CITATION.cff` + visible license** absent. Library has both (CC-BY-4.0 + MIT); wuld.ink is currently unstated, which copyright-defaults to "all rights reserved" with no machine-readable academic citation form.
3. **Library mobile rendering untested.** Josiah-side observation K24f close: wuld.ink/ renders OK on phone browser (cover video animation missing, acceptable graceful-degradation); library.wuld.ink has never been mobile-tested. Substrate is single-file HTML with hash-router + sidebar + content panes; mobile breakpoints may or may not exist in v3.7.1.

Robots.txt explicitly REJECTED at K24f close per Josiah position: "I use AI, I am okay with AI. I wouldn't have been able to do what you've done without help. I don't think blocking it would make sense from that perspective." Position locks: silence on AI-bot crawling = considered consent, not oversight. Do not re-surface robots.txt as a K24g workstream.

Recommended default track (a): ~60-90 calls. Three workstreams sequenced as: mobile audit first (cheapest, observation-only) → CITATION.cff + license (Cowork-side authorship + decision question for Josiah on license choice) → OG metadata wave-edit (Cowork-side bulk operation across all HTML surfaces).

### Workstreams under (a):

**(1) Library mobile audit via Chrome MCP** (low call cost; observation-only):
- `mcp__Claude_in_Chrome__resize_window` to 375x667 (iPhone SE), 390x844 (iPhone 12-15 standard), 360x800 (Android average).
- `mcp__Claude_in_Chrome__navigate` to https://library.wuld.ink/.
- `mcp__Claude_in_Chrome__get_page_text` + screenshots at each viewport.
- Audit: sidebar collapse/overflow, content pane horizontal scroll, mode toggle visibility, font-size legibility, hash-router deep-link behavior (try `/#/rwe/cascade-math-safeguard` direct), interaction targets ≥ 44×44px per WCAG 2.5.5.
- If issues found: relay via `docs/library-claude-coordination.md` as Exchange 14 (substrate side fixes); Cowork does NOT modify combined.html.
- If clean: capture observation in K24g narrative + close as audit-only workstream.

**(2) Site-side CITATION.cff + visible license**:
- Decision question for Josiah at AskUserQuestion: license choice. Options:
  - CC-BY-4.0 (matches library; allows redistribution with attribution; commercial use permitted)
  - CC-BY-NC-4.0 (non-commercial; tighter)
  - CC-BY-SA-4.0 (share-alike; copyleft)
  - CC-BY-ND-4.0 (no derivatives; preserves authorial integrity but blocks translations/adaptations)
  - All rights reserved (current default; deliberate restriction)
- Ship `src/CITATION.cff` with site-as-collection metadata (title: wuld.ink, author: Josiah S. Cooper, identifiers: wuld.ink, repository: alisendjsc-crypto/wuld-ink, version: 2026-05-16, license: per decision).
- Ship `src/LICENSE` if license is non-default.
- Add visible license line to `/disclaimers/` (Cowork edits the existing disclaimer vessel).
- Add `<meta name="license" content="...">` site-wide if license is non-default.

**(3) OG / link-preview metadata wave-edit**:
- Decision question for Josiah at AskUserQuestion: og:image strategy. Options:
  - Single site-wide image (favicon-polyline at 1200×630, OR book cover, OR literal black square, OR brutalist mark)
  - Per-page custom images (heavier; defer to chat-side authorship)
  - No og:image (text-only previews — title + description card)
- Bulk-inject across 47+ HTML surfaces via Python regex + atomic bytes write per K24c lesson xvi:
  - `<meta property="og:title" content="..."` (per-page; derive from `<title>` tag)
  - `<meta property="og:description" content="..."` (per-page; derive from `<meta name="description">`)
  - `<meta property="og:type" content="..."` (article for essays/blog; website for index pages)
  - `<meta property="og:url" content="..."` (per-page canonical URL)
  - `<meta property="og:site_name" content="wuld.ink">`
  - `<meta property="og:image" content="...">` (per og:image strategy decision)
  - `<meta name="twitter:card" content="summary_large_image">` (or summary if no image)
  - `<link rel="canonical" href="...">` (per-page; matches og:url)
- Post-write audit per K24c lesson xvi (NUL/CR/close-tag).

**(4) K24g narrative + memory + commit handoff** — same shape as K24f close. Pre-compute counts before f-strings (K24d lesson xx).

================================================================================
## TRACK OPTIONS (AskUserQuestion at session open after diagnostic)

**(a) Positional-decisions pass** (Recommended; ~60-90 calls) — workstreams 1-4 above.

**(b) Content-relay if uploads land** (variable, ~40-100 calls) — If `uploads/` at session open contains:
- Essay source files (Josiah's K22-flagged chat-side paste-relay material): integrate per essay vessel.
- Glossary content authorship from coord-doc rounds.
- Book Exchange 6 trigger responses (Lacero medium/surface decision; AoMD audio adaptation hosting; canonical-shift flag; Mementos book-canonical follow-ons).
- AoMD audio R2 upload (operator drops `architecture-of-moral-disaster.mp3` to R2 key `essays/architecture-of-moral-disaster/full.mp3`).
- Successor-Claude or library-Claude reply rounds.

**(c) Heavier — (a) + navigation surface audit** (~100-130 calls):
- All of (a), plus a dedicated pass on the F+ vessels off-cover-index question. `/frame/`, `/library-about/`, `/coda/`, `/violence-as-reductio/`, `/why-not-suicide/` exist but aren't on cover; decide which promote to cover vs nav-only vs deep-link-only.

**(d) Heavier — (a) + glossary bidirectional-reference audit** (~100-130 calls):
- All of (a), plus full audit of every glossary entry's "see also" cross-refs for reciprocity. Catches A→B asymmetries where B doesn't link back to A.

**(e) Combo — (a) + (b) + (c)+(d) stacked** (~180-250 calls):
- All workstreams; subagent delegation likely for bulk audits. Risk of token-ceiling hit; do NOT default to this without explicit AskUserQuestion confirmation.

================================================================================
## DIAGNOSTIC-FIRST OPENING

1. `cd C:\Users\y_m_a\Projects\wuld-ink`
2. K24f verify: `git log -2 --oneline` → expect `8796c14 K24f: stale docs cleanup` + `22b43b6 K24f: publish script step 5.5 identity-set patch + CLAUDE.md narrative + carry-forward tidy`.
3. Drift direction: `git status --short` → expect effectively-clean (K24f stale-docs commit removed both lingering files).
4. `ls /sessions/.../mnt/uploads/` — PRIMARY GATING SIGNAL for track selection. Empty → (a). Files present → pivot to (b) or stacked option.
5. `md5sum scripts/check-file.ps1` — sentinel re-verify (expect `82bacf3c`, 105L/3692B).
6. `md5sum scripts/publish-library-v3-7-1.ps1` — post-K24f sanity (expect `20be4e28`, 271L/11510B).
7. `md5sum docs/combined.html` — binding md5 (expect `dd2abd01...88bcbb`; should hold byte-verbatim since K24f didn't touch).
8. `curl -sI https://library.wuld.ink/ | head -2` — subdomain still HTTP 200 direct.
9. `curl -sL https://library.wuld.ink/ | md5sum` — end-to-end binding contract (raw bytes via curl; expected `dd2abd01...88bcbb`; WebClient-class clients see `7efbc940...` due to Cloudflare Email Obfuscation — not a regression).
10. Deploy spot-check curl HEAD on K24f-touched URLs (none changed; just sanity): `/`, `/argument-library/`, `/frame/`, `/library-about/`, `/glossary/labor-sine-fructu/`.
11. `test -d C:\Users\y_m_a\OneDrive` sandbox-view check (expect absent per K24f close); operator-side `Test-Path` was `False` at K24f close — vector decisively dead, do not re-active-watch unless something contrary surfaces.
12. Tool budget pre-flag per track choice at AskUserQuestion.

================================================================================
## PRE-FLAG DEFERRED-PENDING (mention-only unless signaled)

Carry-forwards at K24g open (post-K24f tidy):

* **Book Exchange 6 triggers** (Lacero medium/surface; audio adaptation hosting; canonical-shift flag; Mementos book-canonical follow-ons: BG&E + Forget the Plot + bare-line closer + Ch. I "Before the Ledger" wind/trash) — chat-side authorization needed.
* **Library-Claude next-reply round** opens on any new finding via `docs/library-claude-coordination.md` channel (K24e closed the subdomain provisioning round; library mobile audit findings if any would feed Exchange 14).
* **AoMD audio R2 upload** — `_audio-staging/architecture-of-moral-disaster.mp3` (23:11) → R2 key `essays/architecture-of-moral-disaster/full.mp3`. Operator-side drag-drop.
* **D2 flash card scaffolding** (chat-side content + tech open).
* **`/watch/` R2 thumb caching** (low-priority).
* **Anthropic issue #59564** (passive capture).
* **HC mode second-look on live deploy** (K24c lesson xvii) — if reads too-close-to-Dark, escalate to (b) font-weight tokens > (d) outline-offset > (c) spacing tokens.
* **FOUM mitigation for magnification slider** (K24c carry) — inline-head-script pattern if Josiah notices flash-of-default-scale.
* **gh CLI install** (operator-elective; K24e lesson xxvi) — `winget install --id GitHub.cli` automates repo description updates in publish scripts. Non-blocking.
* **Cloudflare Email Obfuscation watch** (NEW K24f finding) — 504-byte WebClient/curl delta on library.wuld.ink due to Cloudflare zone-level Scrape Shield. Operator-elective: dashboard → Scrape Shield → Email Address Obfuscation OFF if strict byte-identity through all clients is wanted. Non-blocking; deploy is functional.
* **CSS promote thresholds**: `.entry-work-delivered` N=1; `.book-section-pointer` N=3 family (promote-to-`/components/page.css` decision still deferred); `.entry-alias` N=1; `.library-link` N=1 (K24e); `/library-about/` inline `<style>` block N=1.
* **Sandbox-mount delete-blocked investigation** (operator-elective; K23 lesson i). Operator-side `icacls C:\Users\y_m_a\Projects\wuld-ink /reset /T /C /Q` may resolve ACL residue.
* **CLAUDE.md size watch**: 83.2KB / 167L post-K24f. K28-K30 trim threshold projection holds. Memory file `project_website_intent.md` co-trim candidate.
* **MEMORY.md index size**: already over 24.4KB limit; K30 consolidation target.

Closed-since-K24f (do NOT re-surface as carries):

* Publish-library identity-set patch — CLOSED K24f via step 5.5 insertion.
* Stale docs cleanup — CLOSED K24f via `8796c14` commit.
* OneDrive Test-Path operator verification — CLOSED K24f (returned `False`; K24b lesson xiii vector dead at both layers).
* Robots.txt as positional refusal — REJECTED K24f close per Josiah position. Do not re-recommend.

================================================================================
## DISCIPLINE REMINDERS (K22 to K24f lessons — abbreviated; full text in CLAUDE.md narratives)

* **Drift direction emit** + sandbox-phantom + sandbox-truncation verification at session open.
* **K24b lesson x:** ANY file rewrite > ~5KB uses bash heredoc with quoted delimiter; Write tool truncates silently around ~17KB.
* **K24c lesson xvi:** bulk markup injection via regex-anchor + Python slice + atomic bytes write + post-write NUL/CR/close-tag audit.
* **K24d lesson xx CRITICAL:** f-string-with-backslash SyntaxError aborts at PARSE time. NO `\n` / `\x00` / `\\` escapes inside f-string expression blocks. Pre-compute every count / formatted value into named variable BEFORE the f-string.
* **K24d lesson xxiii:** API-timeout-mid-workstream recovery via state-check + minimal-replay (never blind-retry; always `git status --short` first + check specific deliverable signatures).
* **K24e lesson xxiv:** PS `Set-Content -Encoding UTF8 -NoNewline` emits BOM. Use `[System.IO.File]::WriteAllBytes` + `[System.Text.Encoding]::ASCII.GetBytes` for BOM-sensitive parsers.
* **K24f lesson xxxi:** AskUserQuestion question count scales with number of unresolved decision axes AFTER diagnostic, not session shape generally. Can shrink to 1 if diagnostic resolves multiple axes.
* **K24f lesson xxxii:** Post-major-deliverable session shape is maintenance hygiene; trust the frame, do not pad envelope.
* **K24f lesson xxxiii:** Each carry-forward closure clears the path for the next session's scope to be content-relay-driven or visual-feedback-driven rather than infra-driven.
* **K24f lesson xxxiv (NEW):** Operator-side verification commands must be **PowerShell-native by default** (`Invoke-WebRequest`, `Get-FileHash`, `[System.Net.WebClient]`, etc.). NEVER emit bash syntax (`curl ... | head -N`, `md5sum`, etc.) in operator-side handoff blocks — PowerShell rejects unrecognized cmdlets with `CommandNotFoundException` and can swallow subsequent commands as security-prompt input if Invoke-WebRequest is used without `-UseBasicParsing`.
* **K20 lesson i:** vmwp.exe vector targets any C:\ mounted folder when sandbox initiates `.git/` writes. Operator-side PS for destructive ops bypasses VM entirely.
* **K15 PS ledger:** single `-m` commit; no Stop-mode on git stderr; ASCII-only PS scripts; `.gitattributes` via `[System.IO.File]::WriteAllText UTF8Encoding $false`.
* **K22 lesson vii:** long-form content writes via bash heredoc with quoted delimiter; file-tool Edit/Write avoided on session-touched paths.
* **Recommendation-first response shape** per user preference; pre-flag scope expansions that may exceed projected tool budget.

================================================================================
## END-OF-SESSION HANDOFF (per git-commands-at-close feedback memory)

Produce K24g commit message + push commands. Single -m commit. Operator-side PS block (PowerShell-native per K24f lesson xxxiv):

```powershell
cd C:\Users\y_m_a\Projects\wuld-ink
Remove-Item .git\index.lock -ErrorAction SilentlyContinue
git add -A
git commit -m "K24g: <summary>"
git push origin main
```

Optional post-push verification (PowerShell-native; `-UseBasicParsing` to avoid IE-parser security prompt):

```powershell
(Invoke-WebRequest https://wuld.ink/ -Method Head -UseBasicParsing).StatusCode
(Invoke-WebRequest https://library.wuld.ink/ -Method Head -UseBasicParsing).StatusCode
# Byte-clean md5 via WebClient (bypasses IE parser entirely):
$bytes = (New-Object System.Net.WebClient).DownloadData("https://library.wuld.ink/")
[System.BitConverter]::ToString([System.Security.Cryptography.MD5]::Create().ComputeHash($bytes)).Replace("-","").ToLower()
# NOTE: WebClient md5 will return ~7efbc940... (504B Cloudflare Email Obfuscation overhead).
# For raw source byte-identity: curl raw.githubusercontent.com or compare against dd2abd01...88bcbb at source.
```

If library mobile audit produced findings, separate commit for Exchange 14 append to `docs/library-claude-coordination.md`. Surface both commit hashes for K24h handoff.

Read CLAUDE.md first (167L / 83.2KB post-K24f). Memory file `project_website_intent.md` body at K23 close; K24b/K24c/K24d/K24e/K24f hooks in MEMORY.md description (K30 consolidation target).

End of K24g, hand off K24h with: (i) license decision locked + CITATION.cff shipped; (ii) OG metadata wave-edit landed across surfaces; (iii) library mobile audit findings + relay-status to library-Claude; (iv) any content-relay completions if uploads landed; (v) new carries from any relay channel.

================================================================================
## UNIQUE K24g PRE-FLAG

K24g is the second steady-state K-session in the umbrella's lifecycle (first was K24f). The recommended scope is positional-decisions-pass: three workstreams that close authorial-decision gaps surfaced at K24f close, not new architectural deliverables. Don't pad the envelope; if `uploads/` is empty and Josiah doesn't override at AskUserQuestion, track (a) is the right shape and closes in ~60-90 calls.

License decision (workstream 2) is a **Josiah judgment call**, not a Cowork judgment call. Surface options + reasoning at AskUserQuestion, do not pre-select. Same for og:image strategy (workstream 3).

Library mobile audit (workstream 1) may surface findings that need library-Claude substrate fixes. Cowork's scope is OBSERVE + REPORT, not fix the library substrate. If findings are surface-style (CSS only, no router/state changes), library-Claude can respond with paste-replay candidates that Cowork applies via docs/combined.html re-stage + republish via `scripts/publish-library-v3-7-1.ps1`. If findings are structural (router/state/JS), library-Claude needs a dedicated session.

If mobile audit finds wuld.ink-side issues (cover page video-animation graceful-degradation aside, layouts, slider/toggle visibility on small screens), those are Cowork-tractable in same session.

The big-picture frame: at K24f close, the umbrella entered genuine maintenance mode for the first time. K24g should preserve that frame. The work is the work as-shipped; what remains is positional refinement and content-relay, not architecture.
