# console descent — proto review 1  (NON-SHIPPING)

**What this is.** A reviewed, sandbox-verified deepening of the `wuld.ink/console/` descent
game (the seeded text-adventure inside the K249a takeover). Built + tested against a fresh
clone of `wuld-ink` @ `c74e567`. **Nothing here is committed.** No wuld commit, no `CLAUDE.md`
touch, no pin move, no `?v` bump. Deliverables are sidecars for a later, sequenced ship session.

**Recommendation.** Ship the deepened pools once you've eyeballed the tone (the sample sheet +
the two live screenshots below are exactly for that nod). The change is pure content variety —
the room **graph** is provably byte-identical per seed, so it cannot regress the descent's logic,
and every gate is green. Hold the mechanics ideas (§6) for you to rule on; none are built.

---

## 1 · What changed (two files only)

`src/components/console-engine.js` — the pure generator. Prose + item pools grown ~2×, in the
ashen institutional-decay register:

| pool | before | after | effect |
|---|---|---|---|
| ADJ (room adjective) | 18 | **42** | room titles |
| NOUN (room kind) | 18 | **42** | room titles |
| AIR (atmosphere clause) | 8 | **18** | room descriptions |
| SIGHTS (`{sight, detail}`) | 10 | **22** | descriptions + `examine` |
| ITEMS flavour | 5 | **9** | +coin, photograph, ribbon, whistle (+ `examine` keywords) |

Room-title space (ADJ × NOUN) goes **324 → 1,764**. Measured distinct titles across a 3,000-seed
sweep: **326 → 1,766 (5.4×)** — seeds repeat far less.

`tools/console/console-e2e.cjs` — the proof. Two golden fingerprints regenerated (see §4) + a new
structural PASS added. Nothing else touched. `console.js`, `console-scene.{js,css}`, `console.css`,
`console-prng.js` are **byte-identical to HEAD** — the K249a scene arc stays byte-held.

---

## 2 · Determinism — the load-bearing property (proven, not asserted)

Every `rng.pick()` is exactly one PRNG draw regardless of pool length, so growing the four prose
pools does **not** shift the rng stream. Verified across thousands of seeds, `old vs new`:

- **Prose pools (ADJ/NOUN/AIR/SIGHTS):** the room graph **and** item placement **and** tone are
  *byte-identical per seed* — only titles + descriptions change. (0 / 3,000 graph+item+tone
  mismatches.)
- **Item pool (FLAVOR):** the trailing shuffle draws `len-1`, so growing it shifts *only* the
  flavour-item distribution — exits, terminus, key room, room count and tone stay invariant, and
  the key still lands on the key room. (0 / 4,000 graph-excluding-item mismatches.)

Net: same seed → same structure, forever. The deepening is cosmetic to the logic by construction.

---

## 3 · Structural integrity (broad sweep, all green)

Across 2,000–4,000 seeds the new engine holds every invariant: never throws · deterministic
(byte-identical ×2) · room count stays 11–15 · every room reachable · exits reciprocal · key
always on the key room · threshold + descent stay item-free · no empty/`undefined` prose · all 9
flavour items placeable. And the one that matters for the SEEN counter:

- **SEEN-complete** — every non-terminus room is reachable *without passing through the descent*
  (entering the descent ends the run), so a player can always walk `seen` up to `roomCount`.
  **0 rooms ever stranded behind the descent.** This is now a hard assert in the e2e.

---

## 4 · Gate deltas

| gate | before | after | note |
|---|---|---|---|
| `console-e2e.cjs` | 65/65 | **77/77** | +12 structural asserts (PASS 10); 2 goldens regenerated |
| `console-scene-e2e.cjs` | 94/94 | **94/94 held** | scene byte-held; threshold+descent fingerprints survive |
| `wgate-e2e.cjs` | 24/24 | **24/24 held** | curtain untouched |

**Goldens deliberately regenerated.** `fp()` hashes `title + desc + item`, which the deepening
changes, so its two world fingerprints moved (the graph did not). Documented in-file, old values
kept as a comment:

- `wuld-descent`: `641467701` → `2944269538`
- `test-seed`: `2263193907` → `1267046172`

Before the update, running the *old* e2e against the new engine failed **only** those two asserts
(63/65) — everything structural stayed green, confirming the change is prose-only.

**Source firewall:** the STANCE scan (antinatal/efilist/objection/rebuttal/corpus/…) is clean on
all new prose — fiction only, zero argument-library bleed.

---

## 5 · Register review (your call)

The new prose is **drafted, not ratified** — the ashen-descent voice is yours to approve. Two
artifacts for the read:

- `console_proto_seed_samples.html` — 16 named seeds rendered as cards: every room title, its
  description, the on-closer-look detail, items placed, and the full map. (`.txt` twin included.)
- `console_proto_shot1_threshold.png` / `console_proto_shot2_room.png` — the **live** takeover with
  the new engine. Shot 2 shows new content in situ: *"Guttering coal store"*, *"a doorway bricked
  up to shoulder height"*, *"a length of black ribbon"* on the floor — reading native to the tone.

If any word grates, it's a one-line pool edit; flag it and the ship session drops it.

---

## 6 · Mechanics — DESIGN PROPOSAL only (nothing built; you rule)

Two things the kickoff floated already **exist** in the engine today: the brass key already gates
the descent (`move()` refuses the terminus without it), and the descent already has a closing
scene — and it already leans *futility, not triumph*: *"You go down. You were always going to go
down."* That instinct is right; a celebratory "win" would fight the no-exit register.

Genuinely-open options, in order of how well they honor the aesthetic:

1. **A SEEN-complete futility line (recommended, if anything).** Walking every room currently
   passes unremarked. A quiet acknowledgment when `seen == roomCount` — framed as *it changed
   nothing*, e.g. *"You have walked all of it now. It makes no difference; the only way on is still
   down."* Mechanically sound (§3 proves 100% is always reachable). **Register risk:** must not
   read as a completion reward — no "100%", no flourish. Deepen the futility, don't relieve it.
2. **Deepen the descent scene** — a few more lines at the terminus. Low-risk cosmetic.
3. **A bottomless continuation** — descending seeds a *new* structure (infinite regress; maximally
   no-exit). Heavier; interesting, not recommended for a first pass.

My read: the terminus already lands the register. If you want one addition, take (1). All of these
touch `console.js`/`console-engine.js` (and (2) maybe `console-scene.js`) — so they'd fold in the
ship session **only if you rule them in**; they are not in these sidecars.

---

## 7 · SHIP CHECKLIST (for the later, dedicated wuld session — gated on your tone nod + any §6 ruling)

1. **Verify-at-open** on the then-current wuld HEAD (this proto was built on `c74e567`). Re-derive
   base guards live — do not trust these hashes blindly if HEAD has moved.
2. **Base-guard** (expect unchanged since this proto):
   `src/components/console-engine.js` == `9a5fbbd3` · `tools/console/console-e2e.cjs` == `83efd1c3`.
3. **Move-Item** the two reviewed files into place:
   `console-engine.js` → `src/components/console-engine.js` (result md5 `00f84602`),
   `console-e2e.cjs` → `tools/console/console-e2e.cjs` (result md5 `fb65dedc`).
4. **Bump exactly one `?v`** (K238 — bump only the file that changed): the single consumer is
   `src/console/index.html:205` → `console-engine.js?v=K235` → new tag. `console.js` +
   `console-scene.js` are unchanged → their `?v` **held**; `console-scene.{js,css}` untouched.
5. **Do not touch the curtain.** `cgate-open` has two consumers (the wgate + the K249 takeover);
   this ship touches neither — no curtain-token edits, so no grep needed, just don't.
6. **Re-run the battery:** `console-e2e` (77/77) · `console-scene-e2e` (94/94) · `wgate-e2e` (24/24).
7. **NO PIN. NO search-index / sitemap change** — `/console/` carries `<meta name="wuld-search"
   content="exclude">`, so it is not indexed; a fresh `build_index.py` over the shipped tree must
   reproduce the committed index byte-for-byte (prove it, hold it).
8. **Its own `CLAUDE.md` stratum** (engine + e2e md5s, the regenerated goldens, the `?v` bump).
9. Deliver as the standard single wuld PS block (base-MD5 guard + Move-Item + result-MD5 gate +
   explicit-stage the named files + commit + push); the page auto-deploys via Pages. No wrangler.

---

## 8 · File manifest (this delivery → `Downloads\console-proto\`)

| file | bytes | md5 | destination at ship |
|---|---|---|---|
| `console-engine.js` | 20,854 | `00f84602e7d0453a99ea49a73becc549` | `src/components/console-engine.js` |
| `console-e2e.cjs` | 25,980 | `fb65dedc15cdd92b3737d55fbd8a694a` | `tools/console/console-e2e.cjs` |
| `console_proto_seed_samples.html` | 75,172 | `9d50eefcefd2896ce5790c3548c1bd78` | review artifact (not shipped) |
| `console_proto_seed_samples.txt` | 37,312 | `e0872c50e1fca8bc5de4fa5b424b55b3` | review artifact (not shipped) |
| `console_proto_shot1_threshold.png` | 498,984 | `e20701b03b26d803729eed8ac8e5c2d0` | review artifact (not shipped) |
| `console_proto_shot2_room.png` | 573,116 | `c60b0fe4449aa01b60cce947d895123a` | review artifact (not shipped) |

**Untouched / firewall:** `console.js` (`cdc8005f`), `console-scene.js` (`ec24ff83`),
`console-scene.css` (`d7f8816a`), `console.css` (`8cda0354`), `console-prng.js` (`215e66fb`) — all
byte-identical to HEAD. Homepage zero-JS invariant, the `cgate` curtain, `wuld:console:unlocked`,
`cgate-open`, and the console page's search-exclude: all untouched.
