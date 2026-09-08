# Session prompt — wuld.ink Tier-4 hygiene (K288)

Paste this as the first message in a **fresh WULD INK Cowork session**. It is self-contained;
everything else it needs is in the repo.

---

Read `C:\Users\y_m_a\Projects\wuld-ink\CLAUDE.md` first — the orientation sequence, then the
K287b `verify_before` at the tail. Then this.

## Do this first, before any other work

K287 and K287b both landed and were live-verified, but the log still says "pending" for K287b.
**Fold this into CLAUDE.md as your first commit** — you have the evidence here, so do not
re-derive it:

- **K287b landing: LANDED GREEN 2026-09-06** — commit `888b81a`, 74 files, `+148/-75`.
  Live-verified: `mobile-a11y.css?v=K287b` md5 `a5ed6a2c` (13,416 B) served byte-exact ·
  `ambient-player.css?v=K287` md5 `76f06ba2` (14,006 B) **held**, not bumped · `sw.js` serving
  `wuld-sw-K287b` with SHELL on `?v=K287b` · `/void-engine/`, `/gallery/`, `/frame/` and `/`
  all on `a11y=K287b, ambient=K287, mnav=K284`. Josiah confirmed on his own phone: *"Better now."*

Two corrections that belong in the same commit, because the K287b stratum overstates one thing:

- **The `.stat-pills` stack-to-row change contributed NOTHING to the reach win.** Measured after
  the fact: `.stat-pills` went 154px → 157px — it got 3px *taller*. The entire 3,965 → 2,162
  came from the four caps plus the `perm-bar`/`sb-stat` leading (panel −365, presets −368,
  categories −843, negative −140, perm-bar −50, sb-stat −39). The row change was cosmetic.
- **And it moved something I had not modelled.** `.quote-bar` ("Nothing is alright and never
  will be.") is the **fourth child of `.stat-pills`**, not a sibling — so making that container
  a row put the quote beside the `LEGIBILITY+` button instead of below it. Josiah saw it and
  approved, so **keep it**; but record that it was an unpredicted visual change shipped inside
  a change sold as pure compression. The lesson is small and real: a container you flip to
  `flex-direction: row` reflows *every* child, including ones you did not know were in there.

## What this session is

**Tier 4 hygiene — four items, one commit, and nothing else.** From
`C:\Users\y_m_a\Downloads\k278\wuld-priorities-2026-09-06.md`, which is the ranked list and is
current. Tier 1 is empty; there is no urgent work. This is the "make `git status` readable
again" session, and that matters for a specific reason: **every ship block in this repo ends in
a staged-file-count gate, and that gate is only meaningful if a stray file would be noticed.**
Twenty-two untracked entries is how a real stray gets missed.

**Do not take on new features.** If something looks tempting, add it to the priorities file and
leave it.

## The four items

**1. `docs/wuld-hub-backlog.md` — a living ledger that lies.** Untracked, and it still lists the
procedural console game, a real Mr. Grey avatar, and Build B as unshipped ideas. All three landed
at K235 / K237 / K232. **Recommendation: retire it, don't refresh it.** The priorities file in
Downloads is the live ranked list and a second one in the repo will drift again. If Josiah wants
a repo-side ledger, it should be generated from CLAUDE.md, not maintained by hand.

**2. Twenty-two untracked entries at the repo root.** Nineteen session-kickoff `.md` files plus
`_k275/`, `_k275_gates.zip`, `_k275_sidecars.zip`, `asset_repurpose_field_notes_v1.md`,
`ship_k275.ps1`, `recover-git.ps1`, `docs/yurei-sfx-vfx-dictionary.pdf`.

**The obstacle, and plan for it before you start:** `device_bash` **cannot delete files**. `rm`
on a mounted path fails with "Operation not permitted". Your options, in order of preference:

  - **Commit them, don't delete them.** Move the kickoff prompts into `archive/kickoffs/` and
    commit. They are provenance for the whole K-log and they cost nothing — Cloudflare Pages
    builds from `src/`, so nothing outside `src/` deploys (**verify that claim against the
    Pages build config before relying on it**). `git status` goes clean, history is kept, no
    permission prompt is spent. This is the recommendation.
  - `device_request_delete_permission` on the repo root if Josiah would rather they were gone.
    That spends a permission prompt and he has to answer it on the machine.
  - Failing both, `mv` them into `_to_delete/` and tell him.

  The two `.zip`s and the PDF are the judgement call — they are build artefacts and a generated
  document, not prompts. Ask, or leave them untracked and say so.

**3. `REPLACE_ME` setup comments still ship to every visitor.** `src/contact/index.html` (3
occurrences) and `src/donations/index.html` (2). The Formspree endpoint and the PayPal buttons
are configured and working; these are leftover `<head>` instructions to a past version of
yourself. Delete the comment blocks, not the working markup. **Read both files carefully first**
— confirm no live attribute still contains the token before removing anything.

**4. Three placeholder cards on `/recommendations/`** (out of 216). Either fill them or remove
them. **This one is content, so it is Josiah's call, not yours** — surface what the three are
and ask. Do not invent recommendations in his voice.

## Also open, and NOT yours to decide

Two mobile moves on `/void-engine/`, measured at K287b and deliberately left. Both are in the
priorities file as 11a and 11b. Raise them once if Josiah is present; do not build either
unsolicited:

- **11a — hide the header lede on phones (−104px).** It advertises "RIGHT-CLICK ANY CARD FOR
  PLAIN DESCRIPTION & SOURCE", an affordance a touch device does not have, so on a phone that
  sentence is *wrong*, not merely long. But the same paragraph carries the "Analog & Nihilist
  Generative Lexicon v5.0" subtitle. Splitting them needs markup, and the markup is a spliced
  region — so a clean fix has to happen upstream in the void-engine-suite `DUAL_ENGINE` source.
- **11b — cap `#grid` (~60vh).** Measured: first card ~1,565px, whole instrument in ~3 screens,
  presets and compiler reachable below the card pane. Cost: browsing 397 entries through a
  ~500px porthole. Right if filter-first is the real workflow, wrong if scanning is.

## Hard constraints — do not rediscover these

- **Any change to a `?v`-versioned component is component + version bump + re-sweep of the 70
  nav-bearing pages — AND `src/sw.js`.** The K276 service worker is cache-first on `?v`, so an
  unbumped change never reaches an installed phone; and its `SHELL` precache array hard-codes
  component URLs *with* their `?v`, which every sweep script in this repo misses because they
  all walk `*.html` only. Bump `var CACHE` in the same edit — the file's own header says so.
  `sw-register.js` registers `/sw.js` with no query, so the SW updates on byte-change alone.
- **Never rename a sweep script's `OPEN`/`SHUT` marker.** It is an identity, not a version.
  Renaming it makes the script blind to blocks already on disk and it double-inserts across all
  70 pages (K282). `tools/sweep/sweep_mobile_nav.py` is the committed sweep; it should be a
  NO-OP this session (`targets=70 already=70 to-write=0`) — run it and prove that.
- **Desktop must stay byte-inert.** Every mobile rule lives inside `@media (max-width: 640px)`
  or `@media (pointer: coarse)`. Prove it with the layout fingerprint, pristine-vs-shipped, at
  1280 and 900 — not by eye. This session should touch no CSS at all, so the proof is trivial.
- **`src/void-engine/index.html`'s inline `<style>` (lines 47–639) is a SPLICED REGION**, one of
  two wholesale-substituted from the void-engine-suite `DUAL_ENGINE` source on every engine sync.
  Never patch it. Engine rules live in `mobile-a11y.css`, which loads *before* it — so equal
  specificity **loses**, and every selector needs a real ancestor or tag qualifier.
- **The homepage index card count stays a multiple of 6** — the grid paints its hairlines by
  letting a border-coloured container background show through, so an empty cell renders grey.
- **NO PIN.** The flagship `library.wuld.ink/combined` is `e654eabd` v4.0.0 and efilist is
  READ-ONLY. Nothing in this session touches either.

## The PS handoff house pattern — and four ways it broke in one session

One `& { … }` scriptblock: `.git\*.lock` cleanup → HEAD==origin guard → base-blob guards
(`git rev-parse HEAD:path`, immune to a stale worktree) → result gates (`git hash-object`) →
shape/sweep asserts → explicit-stage NAMED paths (never `git add -u`) → measured staged-count
gate → commit → push (`$LASTEXITCODE` gated, `http.postBuffer 524288000`) → `curl.exe` live
asserts. `curl.exe`, never the `curl` alias; `-o` a temp file, never `$null`; one-line if/else;
the md5 helper is `Md5`, never `H`.

K287/K287b found four defects **in the gates, not the work**. All four are now in project memory;
they are here because they cost two aborted pastes:

1. **Anchor your own cwd.** `# Run from repo root` in a comment enforces nothing. Pasted from
   `C:\Users\y_m_a`, the block died on `(git rev-parse HEAD).Trim()` — null-method stack trace,
   and every carefully-worded ABORT was bypassed. Open with
   `$repo = 'C:\Users\y_m_a\Projects\wuld-ink'` + `Test-Path (Join-Path $repo '.git')` +
   `Set-Location -LiteralPath $repo` + `[Environment]::CurrentDirectory = $repo`, **then** the
   lock cleanup (cd first, or `Remove-Item .git\*.lock` no-ops in the wrong folder), and make the
   first `rev-parse` null-safe: `(git rev-parse HEAD 2>$null | Out-String).Trim()`.
2. **Never put a double quote inside a native-command argument.** PowerShell mangles it, git
   receives a malformed argument list and matches **nothing**. This aborted one ship honestly
   *and silently vacuum-passed another gate that wanted 0* — a gate that can only return the
   value it wants is not a gate. If a new `?v` token contains the old one as a substring
   (`K287b` contains `K287`), anchor by **arithmetic**, not by delimiter:
   `$stale = $allRefs - $newRefs`, with quote-free `--fixed-strings` arguments.
3. **Gate the bytes, not the probe.** Playwright's `add_style_tag` appends at the end of the
   document and wins every source-order tie. A rule in `mobile-a11y.css` that loses to the page's
   inline `<style>` will pass the probe and do nothing in production. Iterate with the probe;
   **decide with the served or committed file.**
4. **A live assert fired sooner than ~60s after push returns the OLD bytes.** Static hosting
   ignores the query string, so an un-rebuilt origin serves the previous file at the new `?v`
   URL — the md5 comes back as the *previous version's*, which reads like a failed bump rather
   than an unfinished deploy. Sleep 75s, or re-check before believing a mismatch.

Add one more to the gate set while you are here: **measure first-content offset in viewport
heights**, not only touch targets and overflow. K287 passed every assertion and the page was
still five screens of chrome deep; Josiah found that in thirty seconds on his own phone.

## Budget

This is a small session by design — four items, one or two commits, no CSS, no `?v` bump unless
item 3 forces one (it should not; `?v` lives on components, and `/contact/` and `/donations/`
are pages). If item 2 turns into a debate about what to keep, **stop and ask** rather than
committing a reorganisation Josiah did not choose. Pre-flag cost before starting, as always.
