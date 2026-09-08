# Session prompt — wuld.ink K295: the Successor's coverage audit — find the gaps *without* waiting for logs

Paste this as the first message of a fresh WULD INK Cowork session. It is self-contained.

Read `C:\Users\y_m_a\Projects\wuld-ink\CLAUDE.md` first — the orientation sequence, then the
`verify_before` at the tail. Then this.

---

## Fold this in first — you have the evidence, do not re-derive it

**Check K294 before anything else.** If `git status` is dirty or `src/illogically-is/dot/apparatus/`
is untracked, the K294 ship block was never pasted: the dot Apparatus is built and gated on disk but
unshipped, and `CLAUDE.md.k294b` is waiting beside `CLAUDE.md`. Say so, hand the operator the K294
block from that session's transcript, and do not start K295 on a dirty tree. If HEAD is past
`4a85cd1` and `git status` is empty, K294 landed and you may proceed.

**Do not trust any pin you did not measure this session** — hazard cclxii, and its amendment: a `?v`
sweep silently retires every page-level pin in the block. Re-derive.

**`docs/dot-handoff/` is untracked BY DESIGN** (K293e). Expect `git status` clean with 17 files
present in it. Do not re-add it.

**The device shell reaches the live site and runs Playwright.** `curl` works; the rig is
`npm i playwright` + `npx playwright install chromium`, then `apt-get download libxdamage1` ->
`dpkg-deb -x` into VM scratch -> `LD_LIBRARY_PATH`. ~4 minutes, no root, nothing in Josiah's folders.

---

## What this session is

**The Successor Protocol's proxy answers from a scripted matcher over an authored corpus. Nobody
knows what it cannot answer.** Josiah's ask, verbatim from the To Do:

> *Successor improvements: algorithmically begin finding gaps in responses, don't wait for logs; just
> begin discovering them mathematically and through basic reasoning — hypothesize how you can improve
> responses meaningfully through user interaction — also for example: if a user asks for help, the
> chat bot can give them a list of helpful commands, kind of like the console.*

**"Don't wait for logs" is sharper than it reads.** A Gap Log already exists — `tools/yurei/
gaplog-visitor-e2e.cjs`, the K226-era visitor lane — and it is **reactive**: it records misses after a
real person hits one. **It is also not wired into this surface at all**: `gaplog` appears **zero**
times in `successor-stage.js`, `omega-assistant.js` and `yurei-oracle.js`. So on the Successor there
are no logs to wait for even in principle. **Build the proactive counterpart: a coverage audit that
computes the gaps from the corpus and the real matcher, with no user involved.**

### The anatomy, already measured — you are building, not surveying

`src/components/omega-corpus-mrgrey.json` — `yurei_corpus`, schema `0.1-persona`, persona `mrgrey`,
tier `public`:

| | |
|---|--:|
| entries | **184** |
| patterns | **833** (mean 4.5/entry, min 0, max 15) |
| classes | response **153** · oracle **21** · deflection **5** · repeat **2** · **crisis 3** |
| pattern modes | `contains` **740** · `exact` **92** · `tokens_any` **1** |
| pattern weights | 3→**428** · 2→**341** · 1→**46** · 9→**15** · 8→**3** |

`src/components/yurei-oracle.js` defines `window.YureiOracle.Matcher` — a five-stage pipeline ending
in SCORE, with **`MISS_THRESHOLD = 16`**, threshold plus dampening, and `_miss()` reached from three
places (two early returns, and best-below-threshold-or-all-damped).

**Two things that look like defects and are not — do not "fix" them:**

- **7 entries carry no `patterns`.** They are exactly the 5 `deflection` and 2 `repeat` entries
  (`mg-deflect-01..05`, `mg-repeat-01..02`). They are the *miss* path — reached by `_miss()`, not by
  typing. Correct by construction.
- **`tokens_any` is used exactly once** in 833 patterns. That may be vestigial, a typo, or load-bearing
  for one input. **Find which entry, decide, and report — do not delete it because it is rare.**

**Six forms are claimed by more than one entry**, which is real ambiguity the audit must adjudicate:
`hello` ×3 · `hi` ×2 · `goodbye` ×2 · `edgelord` ×2 · `see a therapist` ×2 · `youre depressed` ×2.
The last two cross **`mg-hostile-05`** and **`pos-just-depressed-01`** with mirrored weights (3/2 and
2/3), so each entry wins one form. That may be deliberate. It is the first thing to put in front of
Josiah, because of where it sits.

### The hard constraint, and it is not negotiable

**The crisis floor is `c-crisis-01/02/03`, three entries, six forms each, weight 9.** Its forms are
the plain ones — *want to die*, *kill myself*, *end my life*, *self harm*, *suicidal*, and so on. The
omega header says the floor *rides inside the corpus and fires first*. **Note that a single weight-9
pattern does NOT clear `MISS_THRESHOLD = 16` on its own, so the floor cannot be firing through ordinary
scoring — PROVE how it fires before you touch anything near it, and prove it still fires afterwards.**
Any coverage change that alters, delays, or outranks the crisis path is a safety regression wearing an
engineering improvement's clothes. If a proposed change would do that, the change is wrong, not the
constraint. Say so and pick something else.

---

## The recommendation — staked

**Build `tools/omega/coverage_audit.cjs` beside the existing `tools/omega/*.cjs` gates, run the REAL
`yurei-oracle.js` matcher in a browser context (the four e2e tools there already do this), and emit a
ranked JSON + Markdown table the same way `tools/gate/reach_audit.cjs` does.** Measure-only this
session: **no `src/` bytes, no `?v`, no sweep, no `sw.js`, no pin.** That is the K290 shape, and K290
is why K291 could be a one-file ship.

**Calibrate before you trust it — a gate that has only ever returned one value is not a gate.** Feed
it cases whose answers are already known: every one of the 833 pattern forms must retrieve its own
entry. A form that does not match the entry that declares it is a defect, and that set is your
control group. Report the self-match rate before reporting anything else.

**Then the four probe families, cheapest first:**

1. **Self-match** (control, above). Any failure here is a real bug and outranks everything else.
2. **Mutation.** For each form: contraction/expansion (`youre`/`you're`), plural/singular, word order,
   punctuation, a leading filler (`hey `, `can you `, `i want to `, `so `), and one-edit typos. A form
   that matches bare and misses under a filler prefix tells you `contains` is doing more work than the
   corpus thinks. **740 of 833 patterns are `contains`** — that is where the brittleness will be.
3. **Ambiguity.** For the 6 collided forms, and for any others the audit finds: which entry actually
   wins, at what margin, and is that the intended one? Margin near zero is a coin flip in disguise.
4. **Subject coverage, the part that answers "mathematically, without logs."** The site already knows
   what it is about: `src/search-index.json` holds **998** entries of page titles and h2/h3 headings.
   Harvest its nouns, ask the matcher about each, and list the subjects wuld.ink discusses that its own
   proxy cannot field at all. **That is the gap set Josiah is asking for, derived with no user in the
   loop.**

**Also report threshold headroom:** with `MISS_THRESHOLD = 16`, how close is each entry's best possible
score to the floor? An entry reachable only by an exact 15-form pile-up is nominally covered and
practically unreachable.

### Second item — RULED BY JOSIAH, not a build call

**The `help` affordance.** Josiah wants: *if a user asks for help, the chat bot can give them a list of
helpful commands, kind of like the console.* The **mechanism** is Cowork's — a `help` / `commands` /
`what can I ask` intent, and how the list is assembled. **The words Mr. Grey says are not.** The corpus
is authored persona voice, governed by `docs/omega-persona-convention.md` and
`docs/successor-claude-coordination.md`; Cowork builds the vessel, the persona lane fills it. **Draft the
mechanism, propose the shape, and get the line ratified before it enters the corpus.**

Precedent to read, not copy: `/console/`'s `[ map ]` and its command surface (`src/components/console-engine.js`).

---

## Hard constraints — do not rediscover these

- **`/successor/` is the ONLY page that loads the omega stack.** `omega-assistant.js` `?v=K270`,
  `successor-stage.js` `?v=K270`, `persona-switcher.js` `?v=K231`, `agent-settings.js` `?v=K231`.
- **NONE of the omega components are in `src/sw.js`'s precache SHELL** — verified. So a future `?v`
  bump on them needs **no `sw.js` edit and no 70-page sweep**; only one page carries them. That makes
  this the cheapest change surface on the site. Do not let that tempt you into shipping `src/` bytes
  this session anyway.
- **The page is gated.** Passphrase `ne-hoc-fiat`, `localStorage['wuld:successor:unlocked'] === '1'`,
  with a prepaint script adding `.sgate-open`. Any browser probe must unlock first or it measures the gate.
- **Nothing the user types leaves the browser.** That is a stated property of the page. A coverage tool
  that phones anywhere, or that ships telemetry into the page, breaks the promise the page makes.
- **Existing tooling to reuse, not reinvent:** `tools/omega/{omega-persona-gate,omega-surface-e2e,persona-switcher-e2e,successor-stage-e2e}.cjs`
  and `tools/yurei/{drift_check.py,emit_parity_vectors.py,parity_vectors.json,yurei_harness.py,voice-check.cjs,yurei-parity.cjs}`.
  Read `tools/yurei/README.md` before writing a line.
- **Print the population beside every assertion.** An assertion over a selector or set that matches
  nothing passes, because `[].every()` is true. That happened twice this month.
- **Measure a constant with the same instrument that will check it.** `grep -o | wc -l` counts
  occurrences; `Select-String .Count` counts matching lines; `wc -l` counts newline terminators and
  undercounts by one on the generated artifacts here, which carry none. Three separate aborts.

## Settled — do not reopen

- `/archive/`, `/illogically-is/`, `/illogically-is/dot/apparatus` — all shipped and live-verified.
- The reach metric and its baseline: `tools/gate/reach-audit-K291.json`. Do not gate on `nodes` from a
  full crawl (cclxv).
- The dot's short page `/illogically-is/dot/` waits on the binding order: film public, then the last two
  artists (s09, s20 of 20), then a regenerated Apparatus that stops marking itself unpublishable.

## After the audit, the queue (do not start it here)

The reach queue is unchanged: `/frame/` 1.95 · `/donations/` 1.89 · `/gallery/` 1.86 ·
`/recommendations/` 1.79 · `/book/` 1.73 — with `/book/` and `/music/` **worse on desktop**, so a
mobile-only fix is the wrong shape for those two.

## PS handoff

One `& { … }` scriptblock: `$repo` anchor + `Test-Path .git` + `Set-Location` +
`[Environment]::CurrentDirectory` → **then** `.git\*.lock` + `.git\objects\*\tmp_obj_*` cleanup (the
Cowork mount cannot unlink; expect stale locks) → null-safe first `rev-parse` → HEAD==origin guard →
base-blob guards (`git rev-parse HEAD:path`) → sidecar MD5 gates BEFORE any move → ccxxxvi
fresh-filename `Move-Item` → result MD5 gates → shape asserts with populations printed →
explicit-stage named paths one per line (never `git add -u`) → measured staged-count gate →
`git ls-files -s` blob-sha index gates → commit → `$LASTEXITCODE`-gated push with
`http.postBuffer 524288000` → `Start-Sleep 75` → `curl.exe` live asserts. `curl.exe`, never the alias.
`-o` a temp file, never `$null`. One-line if/else. The md5 helper is `Md5`, never `H`. No double quote
inside a native-command argument.

## Budget

**Measure-only and bounded: one new tool, its output artifacts, one stratum, one commit. Zero `src/`
bytes.** If the audit finds something that demands a corpus change, that is a *separate*, ratified
session — the corpus is authored content, not a build target. Pre-flag cost before starting, as always.

The Successor has been shipped and extended for a dozen sessions without anyone asking what it cannot
say. Ask that first.
