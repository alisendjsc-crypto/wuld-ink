Session prompt — wuld.ink K300: the help vessel. The corpus is already waiting for it.

Written at the K299 close (2026-09-07/08). K299 LANDED `37d0bab` atop `f1d8a6e`: TX15-BACK folded — crisis floor 18 → 29 forms in BOTH live corpora, the normalizer amendment on both sides of the JS/python parity contract, Ask A's entry, the rider edits, the routing law and the `community` demote. 17 files, one commit, no pin. The CLAUDE.md K299 carry says "landing: pending" — you record `37d0bab` in the stratum you write (forward-record, K295 pattern).

**K300 is the vessel and only the vessel.** Ask A's entry (`mg-oracle-help-01`) is folded, its `hints` array is live and engine-ignored, and bare `help` already routes to it. What is missing is UI on `/successor/`: the `[ ? ]` control and four chips. This is the smallest, most contained session in the arc — do not let it grow into the §3 fold.

## Gate on entry — five things, or stop and say so

1. **K299 landed:** wuld HEAD is `37d0bab` (or a later one-committer commit atop it), HEAD == origin, `git status` clean. Served `/components/yurei-oracle.js?v=K299` md5 `7583b376`; served `/components/omega-corpus-mrgrey.json` md5 `f0e02187`.
2. **All four house gates green before you touch anything** — `tools/yurei/yurei-parity.cjs`, `tools/omega/omega-persona-gate.cjs`, `tools/omega/mrgrey-register-gate.cjs`, `tools/omega/coverage_audit.cjs`. **Call the audit with NO ARGUMENTS** (cclxxv: PowerShell drops empty-string args, and its argv contract is `A[0]=corpus … A[3]=out`, so `"" "" "" $out` puts your output path in the corpus slot and it tries to read the file it means to write). If any gate is red at entry, that is the session.
3. **Every pin re-derived, none copied (cclxii):** `src/components/yurei-oracle.js` `7583b376` (14,197 B) · `omega-corpus-mrgrey.json` `f0e02187` (291,564 B, **185 entries / 850 forms**) · `yurei-corpus-public.json` `76c98eea` (88,696 B) · `yurei-corpus-oracle.json` `c7324f18` · `omega-assistant.js` `1312a2c0` (`VER=K299`) · `yurei-assistant.js` `75b0c9ce` (`VER=K299`) · `successor-stage.js` `c04b7838` (25,691 B, 453 lines — **this is the file the vessel lives in**) · `src/_/successor-protocol/index.html` `e5492ef5` · `tools/omega/coverage-audit-K299.json` `31f901dc` (the corpus baseline) · flagship `library.wuld.ink/combined` `e654eabd`/2,963,752 (efilist READ-ONLY, not opened).
4. **The chips already route.** Verified on HEAD at the K299 close, and re-verify rather than trust this line: `What are you?` → `mg-what-are-you-01` · `Where do I start?` → `mg-oracle-nav-01` · `Your view is ableist.` → **`pos-ableist-objection-01`** (TX15-BACK names a non-existent `ableist-objection`; the id in the relay is wrong, the chip is fine) · `Salve` → `mg-greet-04`. The `hints` array on `mg-oracle-help-01` holds exactly those four strings, which are the literal texts the chips submit.
5. **`white-space: pre-line` does not exist yet.** The seat's amendment ("drop the global `pre-line`") is **preemptive, not corrective** — the K296 vessel proposal was never built, so there is nothing to remove. Just do not add it: the body is single-line and no corpus entry contains a newline.

## What this session is

### Part 1 — the `[ ? ]` control and the four chips (build + ship)

The whole ask, and it is small. A control on the `/successor/` stage that reveals four tappable chips; each chip submits its literal text **through `.respond()`**, exactly as typed input does.

**The invariant that matters more than the feature:** chips must not bypass the crisis-first pipeline. `respond()` runs CRISIS → ORACLE → CONTINUATION → REPEAT → SCORE → MISS in that order, and a chip that shortcuts to an entry id would step over Stage 1. **Assert it, do not assume it:** drive a chip tap in the harness and confirm the lane, then separately confirm that typing a floor form still reaches the floor while the chip UI is open.

**Register:** the chips are affordances, not an index. `mg-how-many-01` holds — the vessel must not publish a count or a map of the corpus, and a prober must not be able to enumerate the position set from it. Four chips, the four in `hints`, read from the entry rather than hardcoded in the JS if that is cheap.

**No distress phrasing becomes a chip.** A tappable chip is an invitation; the heavier-help fork belongs in the prose of the body, where the visitor has to choose it. That is the seat's ruling and it stands.

### Part 2 — the desktop/phone gate, the K291→K298 shape

Page-local, phone-scoped, byte-inert on desktop is the default for anything that moves layout. The vessel adds nodes, so the strict zero-delta fingerprint does NOT apply — use the K297 region form: the unmoved nodes identical in geometry and styles, the added region excluded and described. Both faces at 1280 / 1440 / 1024 / 900 / 768 / 641 and phone 390.

**`serviceWorkers: 'block'` on every crawling context** (cclxxi) and assert the measured document's `location.pathname` against the route requested. The site's own SW claims the origin after the first navigations and then serves `?v` assets cache-first from its cache — a mobile crawl silently measures stale CSS and the answer depends on how many pages you crawled.

### Part 3 — the SUGGESTION SYSTEM: a measured design memo. NO BUILD.

Josiah's own To Do carries this, and it is the sharpest open question in the arc:

> *help / cheat sheet for successor protocol algorithm / script — that gives suggestions or hints — for when a user doesn't know exactly what to say and predicts what they might be looking for*

**Part 1's chips are NOT this.** They are four fixed strings read from `hints`. What Josiah is describing is predictive: read the miss, infer the intent, offer the phrasing.

**The finding that decides the whole design, measured at the K299 close and to be re-derived before anything is built on it:** this matcher has **no notion of "close."** The observed score alphabet across every entry and every declared form is `61, 62, 63, 101, 102, 103`, and **nothing falls below `MISS_THRESHOLD` (16)**. `entryScore` returns `0` or `>=15`; there is no gradient. `the asymmetry is wrong`, `suffering builds character` and `what about happy people` each score **0 against all 185 entries** — arithmetically identical to `zzz qqq wumbo`, on a site whose subject is those three sentences.

So a "did you mean" **cannot be built by surfacing a runner-up — there is no runner-up.** It needs a new similarity metric (token overlap, edit distance, or a stemmed index) added to the shared engine, which means the JS/python parity contract moves with it and `yurei-parity.cjs` gates it.

**And it collides with a fence the corpus states in its own voice.** `mg-how-many-01`: *"Counted, not published. The set stays useful by being met, not mapped."* A similarity oracle is walkable — type noise, read the near-misses, enumerate the position set. That is precisely what the fence exists to prevent, and `omega-persona-gate` counts 106 provenance-stamped positions that a prober should not be able to inventory.

**Produce for Josiah, building nothing:**

1. **The size of the hole, measured.** Take the site's own objection titles and the 52 §3 phrasings from TX15 (the seat's list) and measure what fraction score 0 today. That number is the whole case for or against.
2. **Three shapes, each with its enumeration cost stated plainly** — (a) static rotating chips, zero risk, no adaptivity; (b) kind-level response — name the *kinds* held, never an entry, which is what `mg-oracle-help-01` already does in prose; (c) similarity-gated suggestion, capped and thresholded so noise yields nothing. For (c), state exactly how a prober would walk it and what the cap costs them.
3. **A recommendation, staked.** Cowork's prior, to be overturned by the measurement: the honest fix for "the visitor phrased a real objection and got nothing" is **the §3 fold**, not a predictor — it is already queued, it is cheap, it adds no engine surface, and it cannot be walked. A predictor is the expensive answer to a coverage problem.

Deliver to `Downloads\k300\` + the chat. **Nothing enters `src/` for this part.**

### Part 4 — hand the seat what it is owed (DONE at K299, verify only)

The inflected-trigger sweep list was produced at the K299 close: `Downloads\k299\inflected-triggers-K299.md` — **86 position entries, 165 forms whose past-tense variant misses**, 161 landing on `mg-deflect-01`, driven by `is`->`was` (65) and `are`->`were` (41). It rides `Downloads\k299\TX16_fold_receipt_v1.md`. If Josiah has relayed it and the seat has answered, that answer is a fold and it is **not** this session — it is K301.

## Hard constraints — do not rediscover

- **The audit is a gate, not a survey.** Run all four on every corpus touch and diff §3 (self-match) against `coverage-audit-K299.json`. **A new self-match failure that is not a declared collision is a steal, and the assertion that catches it is fatal.** Baseline: 99.18 % of 850 forms, undeclared steals **0**.
- **Fresh `Matcher` per probe** (K260). A shared instance makes per-session dampening produce false failures. Every K299 number used a fresh one.
- **Corpus forms are matched RAW against normalized text, and the corpora assert a pre-normalized law** — every declared form must equal its own normalized value. If anything touches `normalize()`, `tools/omega/k299/respell.py` is the tool, and it must run AFTER the fold, not before.
- **The crisis floor is byte-identical across `omega-corpus-mrgrey.json` and `yurei-corpus-public.json`** and `omega-persona-gate` asserts that inheritance. Any floor change moves both.
- **PowerShell drops empty-string arguments to native commands** (cclxxv) and mangles a double quote inside one. No `""` placeholders; no non-ASCII anywhere in a handoff block (a `-SimpleMatch` needle containing `·` can never match).
- **A gate placed after an irreversible mutation must be dry-run against the POST-mutation tree, ON THE SHELL THAT WILL RUN IT** (cclxxii + cclxxv). K299's tail was dry-run — on Linux, where `""` survives. That is not a dry run.
- **Aggregate gates do not see key-shape drift** (cclxxiii). Four green gates missed 66 entries growing an empty `patterns: []`. Diff the ENTRIES — key sets, prose, pattern sets — after any migration.
- **Never a bare grep count as a claim**; check every hash in a handoff block by SCRIPT; scope string assertions to `src` (the stratum documents version bumps in prose forever).

## Settled — do not reopen

- **Prose is a ruling.** No fold, cut or re-flow of Josiah's paragraphs without his call. Fold summaries are new prose.
- **`mg-oracle-help-01` is class `response`, not `oracle`** — all 21 oracle entries carry `href` + `nav_label`, and rider edit i exists to stop shipping an `href` at a visitor already standing on `/successor/`. The seat's id is kept for relay continuity. Ratified at K299; do not re-litigate.
- **Chip 4 is house texture, not a rescue.** `mg-greet-04` is already reachable by `salve`, `welcome` and `good day`; TX15-BACK's "becomes reachable through the help chips" is struck.
- **`i wish i had never been born` does not go on the crisis floor.** It is the house's own thesis. The seat's `mg-never-born-01` bridge takes it as a claim first and keeps the door open second, in that order — **unbuilt, awaiting Josiah**.
- **`whats` stays out of the normalizer.** Two Yūrei site entries over-capture the `what is` prefix. Fix by tightening `r-site-01`/`r-site-02` in a Yūrei-scoped session, not by loosening the map.

## Still owed, and none of it is K300's

`c-crisis-harm-other-01` (unauthored; `im going to hurt someone` still deflects) · the `mg-worth-living-01` stand-down amendment (a ratified body) · the 52 §3 phrasings (the fold shrank when §0 landed) · `reach_audit.cjs` does not block service workers and needs a re-baseline session of its own · `/watch/`'s half-fixed phone `.page-hero-title` (points at `var(--t-h2)` instead of the clamp) · the `/book/` cover cap ruling (`Downloads\k299\book-cover-ruling-K298.md`, option D recommended, still Josiah's call).

## PS handoff

`Downloads\k299\resume-K299.ps1` is the template that passed. `$repo` anchor + `Test-Path .git` + `Set-Location` + `[Environment]::CurrentDirectory` → `.git\index.lock*` + `tmp_obj_*` cleanup → null-safe `rev-parse` → HEAD==origin → guards matching the tree you actually hand over → sidecar MD5 gates BEFORE any move → `Move-Item` → result-MD5 gates → shape asserts with populations → **the four house gates before the commit** → explicit-stage one path per line → measured staged-count gate → commit → `postBuffer` push + `$LASTEXITCODE` → `Start-Sleep 75` → `curl.exe` live asserts (flagship `e654eabd` HARD). `curl.exe` never the alias; `-o` a temp file never `$null`; one-line if/else; `Md5` never `H`.

## Budget

One page, one component, one commit, plus a memo that builds nothing. If the vessel starts pulling in corpus edits, stop and pre-flag — the corpus is done and it is gated. **Part 3 is a memo; if it starts becoming an engine change, that is K301 and it needs Josiah's ruling on the fence first.**
