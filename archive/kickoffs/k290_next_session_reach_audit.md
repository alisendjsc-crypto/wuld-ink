# Session prompt — wuld.ink K290: the reach audit (measure the whole site, build nothing yet)

Paste this as the first message in a fresh WULD INK Cowork session. It is self-contained.

Read `C:\Users\y_m_a\Projects\wuld-ink\CLAUDE.md` first — the orientation sequence, then the
`verify_before` at the tail (K289's block is current; wuld HEAD is `191a947`, the K289b landing
record). Then this.

---

## Fold this in first, before any other work — you have the evidence, do not re-derive it

Two records that belong in your first commit:

**1. K289b landed.** Commit `191a947` atop `76bafec`, 1 file, `+5/-3`. `git status` empty.
The K289 landing record and hazard cclxi are already written into `CLAUDE.md`; this is just the
sha for the K289b carry.

**2. THE SITE-WIDE DESKTOP-ASSUMPTION COPY AUDIT IS DONE, AND IT CAME BACK CLEAN.** Run at the
close of K289 across every `src/**/*.html`, this is the generalisation of the K289 defect — copy
that instructs an input a touch device does not have:

- `right-click` — **1 file**, `src/void-engine/index.html`, and all 5 occurrences are accounted
  for: the K289 explanatory comment, the 3 now-swapped `hint-mouse` spans, and one JS section
  header comment. **Nothing user-facing is left.**
- `hover` — 119 occurrences, of which **104 are `:hover` CSS selectors** and the remaining 15 are
  all `var(--c-accent-hover)` colour-token names or code comments. **Zero user-facing prose.**
- `esc` / `Escape` — `/void-engine/`'s swapped `.ctx-hint`, plus two **HTML comments** in
  `src/watch/index.html` (334, 690) that read "click outside any card OR press Escape" — a
  comment, not copy, and it names a fallback that works on touch anyway.
- `click and drag`, `double-click`, `scroll wheel`, `mouse over`, `tab key` — **zero, sitewide.**

**So do not re-run this audit.** `/void-engine/` was the only offender on the whole site and it
is fixed. Record it as closed so a future session does not spend an hour rediscovering it.

---

## What this session is

**The reach metric — the last owed item on the list, and the only one that is owed to the
process rather than to the site.** Build it, run it over the whole site, rank the results, and
**stop**. Bring the numbers back before building anything.

The justification is K287, and it is worth restating because it is the whole reason this exists:
K287 measured touch-target size, horizontal overflow and desktop inertness. It passed every one
of them. It shipped. And `/void-engine/` was still **4.7 phone screens of chrome before any
content**, which Josiah found in thirty seconds on his own phone. **Every gate measured whether
the page was correct; none measured whether it was reachable.** K287b fixed that one page by
hand. Seventy pages have never been asked the question at all.

### The metric

**First-content offset, expressed in viewport-heights at 390×844.** For each nav-bearing page:
the `y` of the first element that is *content* rather than chrome, divided by 844.

Defining "first content" is the only judgement call in this session, so make it explicit and
mechanical rather than clever — pick a rule, write it down in the stratum, and apply it
uniformly. A defensible one: the first element in document order that is not inside the header,
nav, skip-link, or a `position: fixed`/`sticky` container, and that has a non-empty text node or
is an `img`/`video`/`canvas`. **Print the chosen element's selector alongside the number for
every page**, so a wrong classification is visible in the output rather than buried in the score.

### Deliverable

A ranked table — page, offset in px, offset in screens, the element that was counted — sorted
worst first, plus the same run at 1280×900 so a page that is bad on both is distinguishable from
one that is bad only on a phone. Land it as a stratum in `CLAUDE.md` and, if it is long, a
committed artefact under `tools/gate/` alongside the script so the next run is a re-run rather
than a rebuild.

**Then stop and report.** Do not fix anything this session unless a page is so bad it is
self-evidently broken, and even then say so and ask. Today's whole lesson is that the
measurement comes before the decision — K289 was misfiled twice as "hide the lede" and the
answer only appeared after someone actually long-pressed a card.

### Secondary, if budget allows — the K289 question asked of the surfaces nobody asked it of

`/void-engine/`'s plain-description panel was bound to `oncontextmenu` alone and nobody had
checked it was reachable on touch. That was luck, not process. Three other interactive surfaces
have never been asked:

- **`/console/`** — the procedural console game (K235, deepened K265). Is every action reachable
  without a keyboard or a mouse?
- **`/argue/`** — Argue the Argument (K215).
- **`/watch/`** — theater mode. Its own comment says "click outside any card OR press Escape";
  tap-outside should work, but *should* is what K289 was about.

For each: enumerate the event bindings (`onclick` / `oncontextmenu` / `onkeydown` / `onmouseover`
/ drag handlers), and flag any primary action whose **only** binding requires a pointer or a key
a phone does not have. **Report; do not fix.** This is a grep-and-read pass, not a build.

---

## Hard constraints — do not rediscover these

- **This session should touch no `src/` file at all.** A measurement script belongs in
  `tools/gate/`. If it somehow must touch a component, then: component + `?v` bump + re-sweep of
  the 70 nav-bearing pages + **`src/sw.js`** (cache-first on `?v`; its `SHELL` array hard-codes
  component URLs with their `?v`, which every `*.html`-only sweep misses; bump `var CACHE` in the
  same edit).
- **Gate the bytes, not the probe.** Playwright's `add_style_tag` appends at the end of the
  document and wins every source-order tie, so it will pass rules that silently lose in the real
  cascade. Iterate with the probe; decide on the served or committed file.
- **A fingerprint gate over a change that ADDS elements differs by construction** (hazard cclx) —
  exclude the added nodes and compare like with like; `docH`/`docW` are the corroborating scalar.
- **Block external requests in every Playwright probe** (`context.route` → abort non-localhost).
  K289's first fingerprint run timed out at two minutes on hanging `fonts.googleapis.com`
  fetches. The container also cannot reach `wuld.ink` at all (egress), so serve pages locally with
  `python3 -m http.server` over staged copies and probe `localhost`.
- **Never reuse one temp path across a loop of `curl -o` probes** — K288 got three byte-identical
  readings for three different URLs. `mktemp` per probe.
- `src/void-engine/index.html`'s inline `<style>` and engine body are **SPLICED REGIONS**,
  wholesale-substituted from `C:\Users\y_m_a\Downloads\Void Engine\DUAL_ENGINE_v2.html` with **no
  sync script**. Never patch them locally. If a change needs engine *markup*, both the markup and
  its rule go upstream (K289's finding) — and that folder is not a git repo, so write a
  `.bak-pre-<change>` snapshot first and verify it round-trips to the pre-edit md5.
- Never rename a sweep script's `OPEN`/`SHUT` marker; it is an identity, not a version (K282).
  `python3 tools/sweep/sweep_mobile_nav.py src` must report
  `targets=70 skipped=6 already=70 to-write=0` — run it and prove it.
- Homepage index card count stays a multiple of 6. **NO PIN**: the flagship
  `library.wuld.ink/combined` is `e654eabd` v4.0.0 and efilist is READ-ONLY.

## Settled — do not reopen

- **11a DONE (K289)**, **11b DECLINED** (capping `#grid` trades a one-time scroll cost for a
  permanent browsing cost on the primary content), **item 20 WITHDRAWN** (`<h2>Index</h2>` stays;
  it is the more in-register word). The `/void-engine/` mobile arc is closed.
- The desktop-assumption copy audit, above. Closed and clean.

## PS handoff

One `& { … }` scriptblock: `$repo` anchor + `Test-Path .git` + `Set-Location` +
`[Environment]::CurrentDirectory` → **then** `.git\*.lock` and `.git\objects\*\tmp_obj_*` cleanup
→ null-safe first `rev-parse` → HEAD==origin guard → base-blob guards (`git rev-parse HEAD:path`)
→ shape asserts → explicit-stage **named paths, one per line** (never `git add -u`) → measured
staged-count gate → index result gates (`git ls-files -s`, which already has the
`core.autocrlf=input` filter applied) → commit → push (`$LASTEXITCODE` gated,
`http.postBuffer 524288000`) → `Start-Sleep 75` → `curl.exe` content-grep live asserts.
`curl.exe`, never the `curl` alias. `-o` a temp file, never `$null`. One-line if/else. The md5
helper is `Md5`, never `H`.

**Gate hygiene — four ways a gate has lied here, all of them cheap to avoid:**

1. **`Select-String -AllMatches` is IGNORED when `-SimpleMatch` is set** (cclxi) — `$_.Matches`
   comes back empty and the sum is 0 whatever the file holds. Count matching **lines**
   (`@(Select-String … -SimpleMatch).Count`) and corroborate with `@(git grep -o --fixed-strings
   <needle> …).Count`, keeping that needle **quote-free** since it is a native-command argument.
2. **Never put a double quote inside a native-command argument** — PowerShell mangles it, git
   matches nothing, and a gate wanting 0 passes while checking nothing. Anchor a substring-prefix
   `?v` by **arithmetic** (all − new), never by delimiter.
3. **A gate that can only return one value is not a gate.** Both of the above produce that; one
   vacuum-passes, one vacuum-fails. Before trusting a new gate, feed it a case whose answer you
   have already measured by other means.
4. **Order every byte-check before the first `git add`.** K289's broken gate aborted with nothing
   staged — it cost a paste, not an incident. That ordering is the reason.

**Do not stage from Cowork.** The mount cannot `unlink`, so a mounted `git add` can leave a stale
zero-byte `.git/index.lock` that makes every later git write fail, plus undeletable
`.git/objects/*/tmp_obj_*` litter. `rm` is refused on the mount; `mv` works. Cowork builds and
verifies the bytes; Windows git writes the index.

## Budget

Small and bounded by design: one script in `tools/gate/`, one audit run, one stratum, one commit.
No `src/` file, no `?v` bump, no sweep, no pin. If the audit surfaces something that wants
fixing, **that is the next session's prompt, not this one's second half** — write it up and hand
it over. Pre-flag cost before starting, as always.

Tier 1 is empty and has been since K287. Nothing here is urgent; this is the session that makes
the next surprise findable by a gate instead of by Josiah's thumb.
