# Session prompt — wuld.ink K296: the `help` affordance VESSEL + the ratified corpus fold — DO NOT START until TX15 has come BACK

Paste this as the first message of a fresh WULD INK Cowork session. It is self-contained.

Read `C:\Users\y_m_a\Projects\wuld-ink\CLAUDE.md` first — the orientation sequence, then the K295 stratum
and its `verify_before` at the tail. Then this.

---

## Gate on entry — three things must be true, or this is not K296

1. **TX15-BACK exists** in `Downloads\Successor Protocol\` (the seat's reply to
   `omega_proxy_expansion_transmission_15.md`) and Josiah has ratified, at minimum, the words of
   `mg-oracle-help-01` and its 3–5 `hints`. Without the words there is no vessel to fill — stop, say so,
   and offer the standing queue instead (`/frame/` 1.95 · `/donations/` 1.89 · `/gallery/` 1.86 —
   `/book/` and `/music/` are worse on desktop, so a mobile-only fix is the wrong shape for those two).
2. **K295 landed:** wuld HEAD is `4f5b53b` (or a later one-committer commit atop it), `git status` clean
   (`docs/dot-handoff/` is ignored by design; expect it on disk). Record `4f5b53b` as the K295 landing in
   the stratum you write — the K295 carry left it "pending".
3. **Every pin re-derived, none copied** (cclxii). The ones this session leans on: corpus
   `omega-corpus-mrgrey.json` `46eea9d1`/287,795 (== served) · `omega-assistant.js` `ced05284` (VER K255
   inside) · `successor-stage.js` `c04b7838` (VER K255 inside) · `src/successor/index.html` `63ec9707` ·
   `yurei-oracle.js` `ea87794c` (byte-frozen; NOT touched) · `tools/omega/coverage_audit.cjs` `a336eea0` ·
   baseline `tools/omega/coverage-audit-K295.json` `0cd28e35`.

The device shell reaches the live site and runs Playwright (`npm i playwright` + `npx playwright install
chromium`, then `apt-get download libxdamage1` → `dpkg-deb -x` into VM scratch → `LD_LIBRARY_PATH`; ~4 min,
no root, nothing in Josiah's folders). `curl` works there. Use it for the e2e tools and the live asserts.

---

## What this session is

**Fold the ratified words, then build the vessel that renders them.** The mechanism was proven at K295 on a
scratch candidate (`Downloads\k295\candidate-corpus-mrgrey-help-SCRATCH.json` — a SHAPE reference, never
a source of words): one oracle-class entry `mg-oracle-help-01` (dampening-exempt, so it re-answers every
ask; single generic words `exact`-only; **no `href`** — the register gate's curtain fence refuses
`/successor/`; `?` cannot be a form), an additive `hints[]` array, and two riders — `help` (exact) MOVES
off `mg-oracle-nav-01`; `mg-need-help-01` WIDENS by `can you help` · `help please` · `need help` ·
`i need some help`. Proof on the candidate: help-shaped inputs 31/32 → the entry; the crisis-adjacent
bridge still wins every one of its own forms; floor 18/18 + 85/85 unchanged; `omega-persona-gate` 6/6;
`mrgrey-register-gate` 6122/6122.

**If TX15-BACK changed the shape** (response-class instead of oracle, different forms, `help` left on the
nav oracle, riders refused) — re-prove THAT shape with the same three tools before folding. The one
invariant that is not the seat's to move: **the oracle lane fires before `mg-need-help-01`** (cclxix), so
any oracle-class help entry must be form-disjoint from the bridge's inputs on a fresh matcher — the
audit's §3 (no undeclared steal) and §8 (help routing) are the instrument.

### Part 1 — corpus fold (seat-authored bytes; Cowork folds, never edits words)

- Fold `mg-oracle-help-01` + `hints` + the riders + whichever of the 52 §7a′ candidate triggers the seat
  elected (`coverage-audit-K295.md` §7a′), exactly as TX15-BACK spells them. Byte-prove the fold: the
  new corpus parses, entry count + pattern count are what arithmetic predicts, every new form is
  pre-normalized (`YureiOracle.normalize(form) === form`), and `git diff` touches only the intended entries.
- Gates, all four, before any `?v`: `node tools/omega/mrgrey-register-gate.cjs` (offline) and `--live`;
  `node tools/omega/omega-persona-gate.cjs`; `node tools/omega/coverage_audit.cjs "" "" "" tools/omega/coverage-audit-K296.json`
  — **re-pin its two "known answers" deliberately in the same commit:** anatomy (184/833 → the new counts)
  and calibration (`help` → `mg-oracle-help-01` if the move was ratified). Diff §3 and §8 against the K295
  baseline; a new self-match failure that is not a declared collision is a steal and blocks the ship.
- The four e2e tools (`omega-surface-e2e`, `successor-stage-e2e`, `persona-switcher-e2e`, `wgate-e2e`)
  pin `where am i` → `mg-oracle-nav-01` and `nav.href === "/"` — unaffected by moving `help`; run them
  anyway, populations printed.

### Part 2 — the vessel (Cowork's bytes; page-scoped; the cheapest change surface on the site)

Only `src/successor/index.html` loads the omega stack (re-verify: `grep -rl "omega-assistant\|successor-stage" src/ --include=*.html` → exactly that one file). None of it is in `sw.js`'s SHELL — **no `sw.js` edit, no sweep.**

- **`hints` → prompt chips**, in BOTH surfaces: the corner widget (`omega-assistant.js` `addLine`/`renderPointing`, ~L227–262) and the stage (`successor-stage.js` `pushLine`, ~L185–195). When `matcher.by_id[r.id].hints` is a non-empty array, render a row of `<button type="button">` chips under the reply; a tap sets the input to the prompt text and submits through the SAME `submit()` path (`.respond()` — crisis-first preserved; nothing leaves the browser). Keyboard-reachable, ≥44 px targets, honour `prefers-reduced-motion`. The engine never sees the field.
- **A `[ ? ]` control beside the input** in both surfaces that submits the literal word `help` (the console's `[ help ]` button is the precedent — `src/components/console.js` L311/L333; read, don't copy).
- **`white-space: pre-line`** on `.oasst-line` text and `.sstage-bubble`, so a reply carrying `\n` renders as lines. That is the only CSS change unless the chips need a rule (they will: one small block each in `omega-assistant.css` and `successor-stage.css`).
- **Cache-busting, read before you bump:** both JS files carry an internal `VER = "K255"` that stamps the corpus fetch (`omega-corpus-mrgrey.json?v=VER`), the manifest, `yurei-oracle.js?v=VER`, and (assistant only) a JS-injected `omega-assistant.css?v=VER` link — while the PAGE tags say `?v=K270` (JS) / `K230` + `K275` (CSS). A corpus fold that leaves `VER` at K255 asks the browser for the OLD corpus URL. **Bump `VER` to K296 in both files and the four page tags to `?v=K296`**; the engine gets a new `?v` without changing a byte — that is fine and expected. Grep ALL tracked files for the old refs before claiming the bump is complete (ccliii) — the answer should be the page + the two JS files and nothing else.
- Prove by RENDERING, not by hashing (K294): Playwright in the VM, unlock the gate first (`ne-hoc-fiat`,
  `localStorage['wuld:successor:unlocked']='1'`, `.sgate-open`) or you measure the gate; type `help` → the
  ratified line + N chips (N printed); tap a chip → the transcript gains the prompt AND the routed reply;
  type a crisis form → the floor still fires FIRST (the K260 assert, both surfaces); reduced-motion on.
- Phone viewport (390×844) and desktop: the chip row must not push the input below the fold, and the page
  must not scroll horizontally (the K294 vacuous-`every` lesson — assert the container COUNT, not `[].every`).

### Register discipline — unchanged

The words are the seat's; Josiah ratifies; `mg-how-many-01` ("Counted, not published… met, not mapped")
binds the help line to KINDS — never a count, never a map of entries. If a ratified line enumerates,
say so before folding; do not edit it.

---

## Hard constraints — do not rediscover

- `yurei-oracle.js` is byte-frozen (Python parity). No engine edit, whatever the rephrase-deflects finding
  tempts. The `-02` w1-mirror mitigation (K295 §9) is CORPUS-side and needs Josiah's ruling first.
- Nothing the user types leaves the browser — chips submit locally; no telemetry, no beacons.
- The crisis floor is shared bytes: if TX15 §4 (the floor's own coverage) came back ratified, that fold
  moves BOTH corpora (`omega-corpus-mrgrey.json` AND `yurei-corpus-public.json`) in the same commit or
  gate C goes red — and it regenerates `tools/yurei/parity_vectors.json` via `emit_parity_vectors.py`,
  which needs the sealed room plaintext the repo does not carry. That is a separate, deliberate session.
  Do not fold a floor change inside K296.
- Print the population beside every assertion. Measure a constant with the instrument that will check it.
- Every hash constant in the PS block is checked by SCRIPT against values measured this session (the K295
  close caught a guessed md5 that way).

## Settled — do not reopen

- The audit's three premise corrections (stage-1 floor; MAX scoring; no hello schedule reaches the Latin greet).
- Reach baseline `tools/gate/reach-audit-K291.json`; coverage baseline `tools/omega/coverage-audit-K295.json`.
- The flagship pin: `library.wuld.ink/combined` `e654eabd`, v4.0.0 — efilist is read-only here.

## PS handoff

One `& { … }` scriptblock, the K295 shape: `$repo` anchor + `Test-Path .git` + `Set-Location` +
`[Environment]::CurrentDirectory` → `.git\index.lock*` + `tmp_obj_*` cleanup → null-safe `rev-parse` →
HEAD==origin==`4f5b53b` (or the recorded successor) → base-blob guards on every file you rewrite →
sidecar MD5 gates BEFORE any move → `Move-Item` → result gates → shape asserts with populations
(old-`?v` count == 0 by ARITHMETIC, new-`?v` count == 4, `VER = "K296"` lines == 2, corpus parses,
`node --check` ×2) → explicit-stage named paths one per line → staged-count gate → `git ls-files -s` blob
gates → commit → `postBuffer` push + `$LASTEXITCODE` → `Start-Sleep 75` → `curl.exe` live asserts: served
corpus == the NEW md5 via a novel buster; `/successor/` carries `?v=K296` ×4 by content-grep; flagship
still `e654eabd`. `curl.exe`, never the alias; `-o` a temp file, never `$null`; one-line if/else; `Md5`,
never `H`; no double quote inside a native-command argument.

## Budget

Two files of vessel JS + two CSS + one page + one corpus + the re-pinned audit + one stratum: one commit.
Pre-flag before starting. If TX15-BACK also carries §7a′ triggers, they ride the same corpus fold under
the same gates — no second commit. If it carries a floor change, refuse it here (above) and route it.
