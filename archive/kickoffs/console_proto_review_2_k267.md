# console_proto_review_2 — K267 SEED-SHARE deep-links + deferred MECHANICS ruling

**Session:** K267 (concurrent, NON-SHIPPING while K266 runs). Built + sandbox-verified against a
fresh public-origin shallow clone at HEAD `f088403` (K265). **No wuld commit, no CLAUDE.md touch,
no ?v bump, NO PIN** — this is a reviewed drop, held for the sequenced fold after K266 lands.

**Baseline at open (green, matches K265 record):** console-e2e **77/77** · console-scene-e2e **94/94**
· wgate-e2e **24/24**.

**Recommendation up front:** ship the CORE seed-share **as-is** once K266 lands, gated only on your
tone nod for the four new strings listed in §A.4. On the deferred MECHANICS (§B): hold your K265
default — the terminus already carries the futility; if you want *anything*, take the minimal
terminus-fold (Option B), not a standalone completion line. Reasoning below.

---

## A. CORE — SEED-SHARE deep-links (register-safe, Cowork-owned, done + green)

A deterministic world makes this exact: the same seed is the same structure, so **a link IS the
world**. Shipped behaviour:

- **Boot-from-URL.** On boot the shell reads `#seed=<word>` from the URL **hash** (never the query —
  client-only, never hits Pages routing, curtain-safe). If present it **overrides** the localStorage
  resume (the sharer wants the recipient to see *that* seed); if absent, behaviour is unchanged
  (resume, else random). The hash survives the cgate unlock **for free** — the curtain is a no-reload
  class toggle (`index.html:111`) and `boot()` runs on DOMContentLoaded regardless of curtain state,
  so the world is generated behind the curtain and is simply revealed when the passphrase lands.
- **Share-out.** A `share` command + a `[ share ]` control emit the current run's deep-link
  (`https://wuld.ink/console/#seed=<seed>`) into the console output and copy it to the clipboard
  (`navigator.clipboard` → `execCommand` fallback, like the notes surface).

### A.1 Surface touched — console.js ONLY

`console-engine.js` is **byte-frozen** (engine `?v=K265` unchanged). The sanitiser is a *shell*
concern (it parses untrusted URL input), so it lives in `console.js`. Consequence: the `fp()`
world-goldens are **not** touched (genWorld output is unchanged), and only **one** shell-trio pin
element moves at ship (console.js). `src/console/index.html` was **not** touched — no seed-persist
shim was needed (the no-reload curtain persists the hash for free).

Design decision worth your eye: **normalise the seed at world genesis** (`newGame`), so `world.seed`
is *always* URL-safe. That makes the share round-trip **exact** rather than lossy — the emitted link
always reproduces the current world byte-for-byte. Side effect: `new <Word With Caps/Spaces>` now
normalises (lowercased, whitespace→`-`, `[a-z0-9-]` only, ≤48 chars, idempotent). Normal seeds
(`dungeon`, `the-cold-below`, `12345`) are fixed points — zero observable change. Exotic input
(unicode-only) degrades to a random world. This also makes seeds **case-insensitive** — a plus for
sharing (`DUNGEON` and `dungeon` → same link → same place).

### A.2 e2e deltas — console-e2e.cjs 77 → **100** (PASS 11 added, +23 assertions)

New PASS 11 is **structural**, not brittle goldens:

- normaliser: lowercase+hyphenate, strips hostile chars (no injection surface), leaves no
  key/stance punctuation, **idempotent**, caps at 48, unicode-only → empty.
- **URL-hash → exact world**, independent of any unlocked flag in the store (curtain-independent).
- **#seed OVERRIDES resume** when both present; **no hash → resume unchanged**.
- **share-link round-trip**: emitted link's seed regenerates the **byte-identical** world; and the
  full boot-from-emitted-link path reproduces it.
- `share` prints the deep-link + the in-register line; the `[ share ]` control renders.
- **malformed / empty / hostile hash** falls through safely — no throw, no injection (empty `#seed=`,
  `#nonsense`, malformed `%`-escape, `<img onerror>` → opaque `[a-z0-9-]` seed).
- **own-key isolation** still holds across hash-boot + move + share (writes only `wuld:console:*`).

The K265 determinism/reachability/firewall invariants (PASS 1–10) stay green. Firewall PASS 8
(STANCE regex over the shell) passes with the new strings — the seed is an opaque string, only ever
a `genWorld()` argument.

**scene-e2e 94/94 and wgate-e2e 24/24 unchanged** (console.js change touches neither the page nor the
scene; no ?v bumped in-sandbox). Note: **wgate-e2e reads cwd-relative — run the battery from the
repo root** (running it from elsewhere prints a bare Node banner and looks like a crash; it isn't).

### A.3 Live proof (sandbox headless Chromium, zero device dependency)

- `shot1-curtain.png` — a locked visitor on `…/#seed=the-cold-below` still lands on the passphrase
  (curtain NOT weakened by the deep-link).
- `shot2-world-share.png` — after the passphrase: the exact world (`SEEN 1/13`, per-seed
  `Exits: south, west`), `> share` emitting `https://wuld.ink/console/#seed=the-cold-below` with
  `— copied.`, `> seed` → `the-cold-below`, the map, and the new `[ share ]` control in the row.
- `round-trip-sample.txt` — 6 seeds incl. hostile/exotic; every non-empty seed round-trips
  byte-identically (world fp MATCH); unicode-only degrades safely.

### A.4 New in-register strings — YOUR TONE NOD (the only gate on CORE)

1. share label: **`a way back in, for someone else:`**  *(then the link on its own line)*
2. copy confirm: **`— copied.`**  *(only when the clipboard write succeeds)*
3. help line: **`share    a link back to this exact descent`**
4. control: **`[ share ]`**

Redline any of these and I'll swap before the fold. My read: (1) honours "you never left" — the way
back isn't for *you*, it's a door you hand to someone else. Terse, no SaaS chrome.

---

## B. DEFERRED MECHANICS (K265 §6) — DRAFT + tradeoffs for your ruling

Both are **drafted only, NOT applied** to the delivered console.js. Build only what you rule in.

### B.1 SEEN-complete futility line

The reachability is proven (PASS 10: every non-terminus room walkable without descending, 0
stranded), so a player *can* exhaust the walkable structure. The question is whether saying so helps.

**The hazard you flagged at K265 stands:** any line that *fires on completion* implies completion was
a goal — even phrased as futility, its existence is a faint reward gradient, which fights the no-exit
weight. So the design axis is *where* it fires, not just *what* it says.

- **Option A — standalone line** (fires once when the last non-terminus room is newly seen, i.e.
  `seen == roomCount-1`, descent still sealed). Draft:
  > *You have been everywhere the structure allows. It has not changed. The only door left goes down.*

  Cost: a second "beat" before the terminus; needs a flag in engine `move()`; most exposed to the
  reward-gradient risk. **I recommend against it.**

- **Option B — fold into the terminus** (one extra clause in `winText`, only when the descent was the
  last unseen room: `state.visited.length >= world.rooms.length`). Draft — inserted before
  *"You go down…"*:
  > *You had walked all of it by then — every room, every one the same. It made no difference.*

  Keeps a **single** close, no second beat, rewards the completionist with one somber clause they may
  not even notice. Touches `winText` in console-engine.js (a runtime string — **does not** move
  genWorld output, so `fp()` goldens are safe), so it *does* bump engine `?v` and needs one PASS-3
  assertion. **This is the only version I'd ship, and only if you want a nod at all.**

- **Option C — do nothing** (your K265 default). The terminus already lands *"you were always going
  to go down."* Adding anything is gilding. **Fully defensible; my co-recommendation with B.**

**My call:** C or B-minimal. Not A.

### B.2 Deepened terminus/descent close — PROPOSAL, recommend HOLD

The current `winText` is tight and already carries the weight (*"the cold that was under every room in
this place / You go down. You were always going to go down."*). A seen-scaled or bleaker final couplet
is possible, but the risk is over-writing a close that currently lands clean. **Recommend hold** unless
a specific line is itching at you — if so, give me the couplet and I'll fit it in-register.

---

## C. SHIP CHECKLIST — the sequenced fold (after K266 LANDS, on your go)

Same session, the K265 pattern. NON-SHIPPING until then.

1. Fresh public-origin shallow clone at the **then-current HEAD** (post-K266). **verify-at-open**:
   confirm K266 left the console files at their K265 pins (engine `00f84602` `?v=K265`; prng/console.js/
   console-scene.{js,css} byte-frozen; page `60e8cd3e`). Resolve the standing **"console landing:
   pending"** carry (commit `f088403`) → **LANDED** in the K267 stratum.
2. `Move-Item` the reviewed files from `Downloads\console-proto-K267\` into place: **console.js**,
   `tools\console\console-e2e.cjs`. *(+ console-engine.js ONLY if you ruled in §B — then also add the
   PASS-3 futility assertion.)*
3. **Bump ?v of the CHANGED files only** (K238): `index.html` line 206 `console.js?v=K235` → **`?v=K267`**.
   *(engine → `?v=K267` too, ONLY if §B ruled in.)*
4. **UPDATE the scene-e2e shell-trio pin** (`console-scene-e2e.cjs`, the `"shell trio held…"` assert):
   `"console.js?v=K235"` → **`"console.js?v=K267"`** in the array. *(and the engine element if §B.)*
   This is the K265 93/94 trap — a ?v bump without the pin update fails scene-e2e in the same ship.
5. Re-run the battery **from repo root**: console-e2e (100/100, or 101/101 if §B adds an assertion)
   · console-scene-e2e (94/94) · wgate-e2e (24/24). All green.
6. Author the K267 CLAUDE.md stratum. Carry the K266 corpus/flagship pins forward **verbatim** — only
   the console delta changes. **NO PIN, no efilist, no search-index/sitemap** (console page is
   `wuld-search: exclude`).
7. ONE wuld PS block: `.git\*.lock` cleanup + HEAD/one-committer guard + blob-sha base guards +
   Move-Item + result-md5 gates + explicit-stage the named files (NEVER `git add -u`) + staged-count
   gate + postBuffer push gate + `curl.exe` content-grep deploy-verify.

**DO-NOT held all session:** console-scene.{js,css} BYTE-HELD; homepage zero-JS, the cgate curtain,
`wuld:console:unlocked`, `cgate-open`, and `<meta name="wuld-search" content="exclude">` untouched;
seed-share does not weaken the curtain (proven — shot1) nor un-exclude the page; FICTION-ONLY firewall
green (STANCE assert holds; the seed is opaque, never a stance token, never a storage key, never
eval'd).
