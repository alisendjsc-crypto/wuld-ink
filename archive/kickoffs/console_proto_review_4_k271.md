# K271 — Console Text-Effects Smorgasbord · proto review 4

**Status: BUILT, gates green, NON-SHIPPING. Held for (1) your §1b tone/strings nod and (2) the sequenced fold after any concurrent corpus session lands.** Nothing touched the wuld tree, CLAUDE.md, the pin, or efilist. No `?v` is live yet — the proto files already carry K271 so the sandbox battery is green; the operator applies them at the ship.

Recommendation: ship the **full modular smorgasbord you ruled in** at **default `low` (faint)**, keep it, and tune only the CRT tone if the samples read too faint for you. Open `console-fx-lab.html` to drive it live (off/low/full, replay typeout, trigger the descent) — that's the fastest way to give the tone nod.

---

## What's in the proto

New opt-in component, dependency-free vanilla (the "shell requires nothing" firewall holds — no libs, zero assets):

- **`console-fx.js`** (285 lines) — the effects engine: typeout, CRT class management, ashen glitch, living caret/settle, descent crescendo, and the diegetic WebAudio bed. Exposes an API + `_` e2e hooks. Attaches `window.ConsoleFx`; degrades to a no-op if absent.
- **`console-fx.css`** (78 lines) — phosphor bloom + text glow, flicker, breathing caret, settle, jolt, crescendo. Every animation double-gated (`:not(.con-fx-static)` + a `prefers-reduced-motion` block).
- **`console.js`** wiring (→ `?v=K271`) — a typeout-aware `print()`, the `[ crt ]` toggle, the ambient-bed hookup in `setSound`, instant-complete-on-keypress, and the win-path ordering (terminus → mark → crescendo, which holds in every fx state).
- **`index.html`** — two includes added (`console-fx.css?v=K271`, `console-fx.js?v=K271` before `console.js?v=K271`).

The six effect families (all built, each independently gated):

| # | effect | what it does | reduced-motion |
|---|--------|--------------|----------------|
| a | **typeout / structure-speaks** | room narration + help reveal char-by-char (8ms low / 16ms full), key-tick per char, any key instant-completes | instant full text |
| b | **CRT phosphor** | faint bone bloom on the text + a pooled `::before` bloom + slow flicker; complements (never duplicates) the K235 `::after` scanline + the K249a scene | static bloom, no flicker |
| c | **ashen glitch/decay** | sparse (0.5%/1.5%) one-tick crumble to an ash glyph, self-healing; a cold jolt on a blocked wall | off (static text) |
| d | **living caret + settle** | the blink deepens to a breathing block `▋`; new lines micro-fade + drop 1px into place | static caret / instant |
| e | **descent crescendo** | on the close: the frame dims and sinks, a low tone falls, the K269 sigil is the last thing lit | sigil still reveals, no swell |
| f | **ASMR / diegetic audio** | a low vault-hum drone bed + key-ticks + a cold whoosh on a move + a deeper resonance on the descent (WebAudio synth, opt-in via `[ sound ]`) | silent |

**Control surface:** `[ crt ]` toggle cycling **off / low / full**, persisted own-key `wuld:console:fx`, default **low** (tasteful-on, per your ruling). `prefers-reduced-motion` is a HARD override that forces the static/instant path regardless of the stored pref and silences all audio.

## e2e deltas (all green in-sandbox, from repo root)

- **console-e2e: 125 → 157** (+32) — a new PASS 11 (text-effects contract) + 2 firewall asserts over the fx layer.
- **console-scene-e2e: 95 → 97** (+2) — the shell pin grew **quartet → sextet** (added `console-fx.js`/`console-fx.css` @K271, bumped `console.js`→K271, negative-guarded the old `console.js?v=K269`), plus two load-order asserts (fx js after sigil/before console; fx css after console.css).
- **wgate: 24 → 24** (untouched).

## Reduced-motion proof (the load-bearing, non-negotiable contract)

Asserted in PASS 11, every effect proven inert under `prefers-reduced-motion`:
`motion()` false · `con-fx-static` applied · typeout instant (nothing left typing) · `onEvent('win')` adds **no** `con-fx-descend` · ambient bed never starts · **zero** AudioContext ever created. CSS-side: the fx stylesheet carries a `prefers-reduced-motion` block with `animation: none` + `transition: none`. Double-gated in JS (the `con-fx-static` flag) and CSS (the media query).

## Samples (real /console/ page, cover terminal)

- `strip-intensity.png` — off | low | full side by side (the intensity ruling at a glance).
- `typeout.gif` — the structure narrating a room, char-by-char.
- `crescendo.gif` — the mark revealing as the frame dims and sinks.
- **`console-fx-lab.html`** — open it to drive the REAL effects live (uses the actual `console-fx.js`/`.css` in the same folder). Buttons: off/low/full, replay typeout, descent, reduced-motion toggle. **This is the best way to give the tone nod.**

---

## §1b — what you ruled, what's built, what remains

**Ruled + built:** full suite (modular) · tasteful-on · off/low/full · reduced-motion hard override.

**Still yours to nod before the ship:**

1. **CRT tone.** Built to *faint failing-monitor* (bone-on-black, subtle). My rec: **keep faint** — it reads as the structure's dying CRT, not a demo. If the strip/lab reads too faint, say "bump full" and I'll raise the bloom/flicker ceiling on `full` only (low stays gentle).
2. **Default level.** Built `low`. My rec: **keep `low`** (a first-visit reader is never ambushed). Say the word to default `full`.
3. **Typeout speed.** Built 8ms (low) / 16ms (full) per char, help + room-narration surfaces only. My rec: **keep**. Faster/slower is a one-number change.
4. **New strings** (draft — nod or rewrite):
   - toggle: `[ crt: off ]` / `[ crt: low ]` / `[ crt: full ]`
   - reduced-motion boot note: `(reduced-motion: the console holds still)`
   - toggle title under reduced: `reduced-motion — effects shown static`

---

## SHIP CHECKLIST (sequenced fold — do NOT run until corpus lands + your go)

Emit the wuld PS block only at the ship (per the mandate, no PS block now). At that session:

1. Fresh public-origin clone at the then-current HEAD.
2. **Verify-at-open the K269 pins → LANDED** (served checks): `console-sigil.js?v=K269` serves `genSigil`/`descent sigil`; `/console/` page includes `console-sigil.js?v=K269` + `console.js?v=K269` by content-grep (CF-beacon: grep content, never md5 the HTML). Byte-held confirm: engine `dc4ff674` (K267), sigil `c66f5399` (K269) — **both already confirmed unchanged in this proto's clone.**
3. `Move-Item` the six proto files into place (base-MD5 guard on the pre-existing ones; result-MD5 gate after):

   | proto file | → repo path | result md5 |
   |---|---|---|
   | `console-fx.js` | `src/components/console-fx.js` | `c8fd4a6296d00fc9ddbdfeae319ca733` |
   | `console-fx.css` | `src/components/console-fx.css` | `f2fef88a8978ed4700e76d2f0f779a2b` |
   | `console.js` | `src/components/console.js` | `6a5d08d01c2a30fc99a8de567a69aa46` |
   | `index.html` | `src/console/index.html` | `03368f245b1c576a8a5d999916b078aa` |
   | `console-e2e.cjs` | `tools/console/console-e2e.cjs` | `d047a0d0744a3fbf2628b118ea785af7` |
   | `console-scene-e2e.cjs` | `tools/console/console-scene-e2e.cjs` | `47cc32688c6289876df06740843e4b58` |

   (md5 is disk-CRLF-sensitive if a Windows tool rewrites a file — if a gate mismatches, gate the parsed count/served content, not raw bytes.)
4. `?v` is already K271 in these files — no separate bump needed; the two new includes + the console.js bump are baked in.
5. Re-run the battery from repo root: `console-e2e` (expect 157), `console-scene-e2e` (expect 97 — read the served count, do not trust the file), `wgate` (24).
6. Author the K271 stratum in CLAUDE.md (carry the corpus/flagship pins forward VERBATIM; resolve the K269 "landing: pending" carry → LANDED with its served checks).
7. **ONE wuld PS block**: `.git\*.lock` cleanup + HEAD/one-committer guard + base-blob-sha guards + `Move-Item` + result-blob gates + **explicit-stage the six named files** (NEVER `git add -u`) + staged-count gate (6) + `http.postBuffer` + push `$LASTEXITCODE` gate + `curl.exe` content-grep deploy-verify (served `console-fx.js?v=K271` contains a marker; `/console/` includes the new files by content-grep [CF-beacon]; page still `wuld-search: exclude`).
8. **NO PIN. NO efilist. NO search-index/sitemap change** (page stays search-excluded).

## Firewall / byte-held (all confirmed in-proto)

- Engine BYTE-FROZEN (`dc4ff674`, K267) · scene js/css BYTE-HELD (K249a) · prng/console.css unchanged (K235) · sigil unchanged (`c66f5399`, K269). Effects are shell/CSS/audio only — world-gen, `genWorld`, `fp()` goldens, and the sigil are untouched (PASS 11 proves world + sigil byte-identical across fx levels).
- STANCE firewall green over `console-fx` (fiction only) · own-key writes confined to `wuld:console:*` · homepage zero-JS, cgate curtain, `wuld:console:unlocked`, and the `wuld-search: exclude` meta all untouched.
