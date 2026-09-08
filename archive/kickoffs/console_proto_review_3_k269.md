# console_proto_review_3 — K269 SEEDED DESCENT-SIGIL + aesthetic ruling

**Session:** K269 (concurrent, NON-SHIPPING while K268 runs). Built + sandbox-verified against a
fresh public-origin shallow clone at HEAD `d75051ca` (K266 correction atop K267 console). **No wuld
commit, no CLAUDE.md touch, no ?v bump, NO PIN** — a reviewed drop, held for the sequenced fold
after K268 lands.

**Baseline at open (green, matches the K267 record):** console-e2e **102/102** · console-scene-e2e
**94/94** · wgate-e2e **24/24**. (K268 is corpus-only; it left the console lane untouched — proven,
not trusted.)

---

## Recommendation up front

Ship the seeded descent-sigil once K268 lands, gated only on **(1) your aesthetic ruling** (§1b) and
**(2) your tone nod** on the new strings (§ strings). My build call, all four axes:

- **Visual language → WARD/SEAL, pure-seed.** It reads as a *mark/signature* (which is the point — a
  link's own hand), it is the most compact and shareable, and pure-seed keeps the firewall clean.
- **Palette → monochrome bone-on-black**, locked to `--c-fg`. Colour would fight "nothing more."
- **Placement → `sigil` command + `[ sigil ]` control + on the descent close.** Opt-in, austere; the
  mark is the last thing you see going down.
- **Form → inline SVG** ships; the **ASCII contender is real** and I built it too (`sigil ascii`), so
  you can rule from live artifacts, not descriptions.

And on the **deferred §B.2 terminus deepening: the sigil-on-descent *is* the deepening.** A mark at
the close carries the weight a second couplet would. **Recommend continue-HOLD** on any text change.

Everything below is drafted/built but **held** — nothing ships until your go, after K268.

---

## A. What it is (register-safe, Cowork-owned, done + green)

A deterministic world already makes the seed the structure. This makes the seed a **mark** too.
`genSigil(seed)` draws an austere monochrome figure from a **fresh console-prng stream on the same
seed as the world** — so the K267 deep-link now hands a recipient the **same structure and the same
sigil**: *a link IS the world*, made visible. The mark rides the existing link **for free** (it is
regenerated from the seed on the recipient's machine — nothing is added to the URL).

Shipped behaviour:

- **`sigil`** renders the current run's mark inline; **`sigil ascii`** prints the pure-text seal;
  **`sigil save`** / a **`[ save ]`** affordance downloads a self-contained SVG. A **`[ sigil ]`**
  control sits in the button row.
- **On the descent close**, the mark is drawn after the terminus text (the warded door made visible).
- **Reduced-motion:** the mark is fully static (no animation elements at all), matching the scene's
  contract. **Opt-in:** never auto-splashed on boot; austerity preserved.

### A.1 Surface touched

| file | change |
|---|---|
| `console-sigil.js` | **NEW.** Pure. Depends ONLY on `console-prng.js`. `genSigil`/`renderSVG`/`svgFor`/`toDataURL`/`asciiSigil`. Vanilla inline SVG, no libs. |
| `console.js` | `sigil` verb (`ascii`/`save`) + `[ sigil ]` + `[ save ]` + descent-close reveal + `_sigil*` e2e hooks. |
| `src/console/index.html` | new `console-sigil.js?v=K269` `<script>` (after engine, before the shell) + `console.js?v=K267`→`?v=K269`. |
| `console-e2e.cjs` | PASS 12 (sigil) + PASS 8 fence extended over the module. |
| `console-scene-e2e.cjs` | shell-trio pin → **QUARTET** + load-order anchor + 1 sigil load-order assert. |

**`console-engine.js` is BYTE-FROZEN** — the sigil is *seed-pure*, not graph-derived, so it never
touches genWorld/`fp()`. **`console-scene.{js,css}` BYTE-HELD** (K249a). **`console.css` untouched** —
all sigil styling is inline, so the surface is exactly `console-sigil.js` + `console.js` + `index.html`
as the kickoff specified.

### A.2 e2e deltas — all green in-sandbox

- **console-e2e 102 → 125** (+23): **PASS 12** (21 asserts) — spec+SVG byte-determinism, 800→800
  distinct, never-throws over exotic+hostile+400-seed sweep, injection firewall (hostile seed → no
  `<script`/handler/seed-text; whitelist-only primitives), reduced-motion static, data-URL, and shell
  integration (mark drawn from the world's own seed; `sigil`/`sigil ascii`/`sigil save` don't throw;
  writes nothing outside `wuld:console:*`). **PASS 8** +2 (STANCE + prng-only-import over the module).
- **console-scene-e2e 94 → 95** (+1): the shell-trio pin is now a **QUARTET** (adds
  `console-sigil.js?v=K269`, bumps `console.js`→`?v=K269`, adds a `console.js?v=K267 < 0` guard so a
  half-applied bump fails), the load-order anchor moves K267→K269, plus **1 new** assert (sigil loads
  after prng, before the shell). This is the K265 93/94 trap — **already updated in the delivered file.**
- **wgate-e2e 24/24 unchanged.** Run the battery **from repo root** (wgate reads cwd-relative).

### A.3 Firewall (FICTION-ONLY, HARD)

The seed is drawn **as numbers only** — never eval'd, never a corpus key, never a stance token, and
**it never appears as text inside the SVG** (proven: a `<img onerror><script>` seed yields a mark with
no `<script`, no handler, no seed substring, only whitelisted svg primitives). STANCE regex green over
`console-sigil.js`; imports = `console-prng.js` only; **no external library ships** (p5.js is the LAB
only). The sigil renders **behind the curtain** like the console (a locked visitor still meets the
passphrase) and does **not** un-exclude the page.

### A.4 Live proof (sandbox, zero device dependency)

- `console-live-sigil.png` — a real headless-Chromium console: `> new the-cold-below` → `> sigil` →
  *"the mark this seed leaves:"* + the ward rendered inline (live stroke = `rgb(240,235,229)` = the
  bone token, 120×120), `[ save ]` beneath it, `[ sigil ]` in the control row.
- `console-live-ascii.png` — `> sigil ascii` → the pure-text seal in the terminal.
- `sigil-wardseal-contact.{svg,png}` — six seeds, each a distinct ward (these SVGs are byte-identical
  to what the console renders inline).
- **Note on the scene:** the K249a takeover (a fixed overlay you *enter*) confounds a full-page
  screenshot under the takeover, so the proof uses a clean no-scene harness to isolate the render; the
  live integration is *also* asserted green in PASS 12. (The scene stays BYTE-HELD.)

---

## B. §1b AESTHETIC RULING — the gate (drawn, not described)

Four contenders, in the delivered artifacts. Open **`ashen-wards-lab.html`** to explore all three
graphic dialects live (seed nav + language toggle + reseed); the ASCII contender is in
`sigil-ascii-samples.txt` and live via `sigil ascii`.

**(i) Visual language** — `sigil-lab-three-dialects.png` shows all three:
- **Ward/Seal (RECOMMENDED)** — concentric rings + radial spokes + ward teeth + a downward core. Reads
  as a struck seal / signature. Most compact, most shareable, most "mark."
- **Floor-plan** — the descent seen from above: an orthogonal blueprint, threshold ○ and a
  downward-chevron terminus. **Most on-theme** (it literally encodes the descent) but a touch literal,
  and busier at a thumbnail size.
- **Ashen-mesh** — a web of ash, points strung on faint rings. Atmospheric but the loosest read; least
  "seal."

  **Pure-seed (recommended)** vs **graph-aware** (room-count/terminus-depth modulate the mark):
  graph-aware "encodes the descent" thematically but **couples to engine internals, risks spoiling
  exploration, and complicates the firewall.** I recommend pure-seed — clean, and the seed already
  *is* the structure.

**(ii) Palette** — **monochrome ashen, locked to the scene tokens** (bone `--c-fg` on the console
black). No colour. Inline inherits the token (mode-aware for free); a saved file bakes the literal bone.

**(iii) Placement** — **`sigil` command + descent-close (recommended)** vs also-on-map vs
auto-on-descent-only. Opt-in keeps the austerity; the descent-close mark is the deepening (see §C).

**(iv) Form** — **inline SVG (recommended: crisp, shareable)** vs the **ASCII/box-drawing contender**
(ultra-austere, pure text, trivially shareable — it may honour "a black-console descent, nothing more"
better than any graphic). **I built both**, so `sigil` (SVG) and `sigil ascii` (text) are both live —
rule from the artifacts. If you rule SVG-only or ASCII-only, the other path is a few-line strip.

---

## C. §B.2 DEFERRED terminus/descent-close deepening — reassessed

K267 recommended HOLD; the kickoff asked whether the sigil-on-descent changes the calculus. **It does,
in the direction of continuing to hold text:** the mark at the close *is* a deepening — the last thing
you see going down is now the structure's own seal, not another line. The close stays tight; Option B
already folds the futility. **Recommend continue-HOLD** on any textual couplet. If a specific line is
itching, give it to me and I'll fit it in-register — but the mark is doing the work now.

---

## Strings — YOUR TONE NOD (the only text gate on the ship)

1. help line: **`sigil [ascii|save]     the mark this seed leaves`**
2. reveal header (on `sigil`): **`the mark this seed leaves:`**
3. descent-close preface (on descend): **`— its mark —`**  *(dim, then the mark)*
4. controls: **`[ sigil ]`**, **`[ save ]`**
5. status lines: **`— mark saved.`** · **`There is no mark to draw yet.`**

Redline any and I'll swap before the fold. My read: (3) is the terminus honouring "you never left" —
the door is a wall, but it leaves a mark.

---

## D. SHIP CHECKLIST — the sequenced fold (after K268 LANDS, on your go)

Same session, the K265/K267 pattern. NON-SHIPPING until then. NO PIN, no efilist, no search/sitemap
(console page is `wuld-search: exclude`).

1. **Fresh public-origin shallow clone at the then-current HEAD.** verify-at-open: confirm K268 left
   the console lane at its **K267 pins** — `console.js` `8c7c595b` `?v=K267`, `console-engine.js`
   `dc4ff674` `?v=K267`, `console-e2e.cjs` `551eaed2` [102/102], `console-scene-e2e.cjs` `7116bd9f`
   [94/94], `index.html` `f46387ed`, `console-prng.js` `?v=K235`, `console-scene.{js,css}` `?v=K249a`
   byte-frozen. **Resolve the K267 "landing: pending" carry → LANDED** (`0ccada2` + served checks).
2. **Move-Item the reviewed files** from `Downloads\console-proto-K269\` into place:
   - `console-sigil.js` → `src/components/console-sigil.js` **(NEW)**
   - `console.js` → `src/components/console.js`
   - `console-e2e.cjs` → `tools/console/console-e2e.cjs`
   - `console-scene-e2e.cjs` → `tools/console/console-scene-e2e.cjs`
   - `index.html` → `src/console/index.html`
   - **Engine NOT touched.**
3. **?v bumps (K238, CHANGED files only)** — already baked into the delivered `index.html`: a new
   `console-sigil.js?v=K269` `<script>` (after engine, before the shell) + `console.js?v=K267`→`?v=K269`.
   `prng` K235, `engine` K267, `scene` K249a **unchanged**.
4. **scene-e2e shell-QUARTET pin** — already baked into the delivered `console-scene-e2e.cjs` (array +
   guard + load-order anchor + the new sigil load-order assert). *If you re-derive it by hand, this is
   the K265 93/94 trap: a ?v bump without the pin update fails scene-e2e in the same ship.*
5. **Battery from repo root:** console-e2e **125/125** · console-scene-e2e **95/95** · wgate-e2e **24/24**.
6. **K269 CLAUDE.md stratum.** Carry K268's corpus/flagship pins forward **VERBATIM** — only the
   console delta changes.
7. **ONE wuld PS block:** `.git\*.lock` cleanup + HEAD/one-committer guard + blob-sha base guards +
   Move-Item + result-md5 gates + **explicit-stage the 5 named files** (NEVER `git add -u`) +
   staged-count gate + postBuffer push gate + **`curl.exe` content-grep deploy-verify** (served
   `console-sigil.js?v=K269` contains a sigil marker; `/console/` page includes `console-sigil.js?v=K269`
   + `console.js?v=K269` by CONTENT-grep [CF beacon]; page still search-excluded).

**DO-NOT held all session:** `console-scene.{js,css}` BYTE-HELD; engine byte-frozen; homepage zero-JS,
the cgate curtain, `wuld:console:unlocked`, `cgate-open`, `<meta name="wuld-search" content="exclude">`
all untouched; the sigil does not weaken the curtain nor un-exclude the page; FICTION-ONLY firewall
green (opaque seed, never a stance token / storage key / eval target); no external library ships.

---

*Bonus in the drop: `ashen-wards-philosophy.md` (the design movement) + `ashen-wards-lab.html` (the
p5.js exploration — LAB only, never shipped; the ship is the vanilla SVG in `console-sigil.js`).*
