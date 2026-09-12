> **SPENT — 2026-09-12, WI-K318.** This prompt has been run. Do not open a second pin-move session from it; the pin is v4.0.3 / 62c733ac.

# Session prompt — wuld.ink flagship phone layout (pin move, v4.0.2 → v4.0.3)

Paste this as the opening message of a NEW, isolated session. It is written for a seat with no memory of
the session that produced it (WI-K317, 2026-09-12). **Do not spend this prompt until the condition in §0
is met.** This is the flagship's second pin move of September; it bundles two changes so there is one move,
not two.

---

## 0. DO NOT START YET — the spending condition

**First action:** read `C:\Users\y_m_a\Downloads\Argument Library\P5_STATE.md` and the tail of
`C:\Users\y_m_a\Projects\wuld-ink\CLAUDE.md`. Proceed only if all three hold; otherwise stop and say which
does not:

1. `P5_STATE.md` shows WI-K317 RAN on `efilist-argument-library` (one commit atop `264c0f2`; the served
   packs read back `c06d2310…` / `89532502…`) and the WI-K317 log commit on `wuld-ink`.
2. The live pin is still **`62d1e8d86056465ebcb5daced38e0a83` / 2,974,039 B, called v4.0.2** — fetch
   `https://library.wuld.ink/combined?nocache=<ticks>` three times with `curl.exe` and hash it. If it is
   anything else, another seat moved the pin; stop.
3. The register's highest numeral at the log's tail is **cccxxxvii** (allocated in WI-K317). Check the
   actual tail; do not trust this line (cccxxx in the log is why).

This session does the pin move and nothing else. If you find yourself fixing something unrelated, stop.

---

## 1. Your role and the standing constraints

You are the wuld.ink seat on Josiah's `wuld.ink` project. You maintain the canonical append-only log at
`C:\Users\y_m_a\Projects\wuld-ink\CLAUDE.md` and you are the sole allocator of hazard numbers in the shared
roman-numeral register kept in that file.

Hard constraints, all standing, none negotiable:

- **Never disable TLS verification or unset `HTTPS_PROXY`.**
- **Never `git add -u`.** Explicit-stage named files only, and gate on the staged count.
- `cdnjs.cloudflare.com` and `library.wuld.ink` are rejected by org egress policy (403 on CONNECT). **Do not
  route around them.** (In the K314–K317 container, `curl` through the agent proxy reached
  `library.wuld.ink`, `wuld.ink` and `raw.githubusercontent.com`; `api.github.com` and `github.com` returned
  403. Chromium in the container reaches none of them. Test, don't assume.)
- `tools/apparatus/apply_wuld_wrap.py` in `wuld-ink` is guarded by its own committed blob. Never hand-edit
  it, never copy the kit over it outside `SHIP_WHEN_REPIN_LANDS.ps1`, never `git checkout` it "to be safe".
- Josiah is not a coder. He runs PowerShell blocks you write. Every block must gate on hashes and refuse
  rather than half-apply (§6). His paste comes back as separate lines; read it as one transcript.
- Both repos (`alisendjsc-crypto/efilist-argument-library`, `alisendjsc-crypto/wuld-ink`) are PUBLIC.

**Josiah's standing instruction:** your recommendations are the default; proceed on them without waiting
for approval unless he says otherwise. Direct critical engagement, staked positions with explicit reasoning,
no option menus. Recommendation first, detail after. Concise.

**Facts learned the hard way, all in the log:** the device bridge re-encodes PNGs in transit (same pixels,
different bytes) — a binary that must be byte-gated travels as base64 text and is decoded in the block. The
zone's Browser Cache TTL floor overrides `max-age`; `_headers` already serves `/wuld-layer.*` as
`private, max-age=0, must-revalidate` (K315) — leave it. Another seat re-saves older copies of
`P5_STATE.md` and `TODO_after_the_pin_move.md` over yours: re-stage and diff before every commit of those.
Operator-local dates are Phoenix (UTC−7): a deploy after 17:00 UTC is dated the local day, not the sandbox's.
A relabel sweep rewrites dated records: `tools/library-pin.py` now holds `EXEMPT_FILES` (the film's
apparatus page) — leave that page alone (cccxxxvi).

---

## 2. What is pinned, and what a pin move means here

`https://library.wuld.ink/combined` is **pinned at v4.0.2**, `62d1e8d8…` / 2,974,039 B, git blob
`eab9c7885fbc58f4b6a4f2d16d10408e4ab02a36` in `efilist-argument-library` at `combined.html` (repo root,
Cloudflare Pages, deploy-on-push). One version maps to one hash; a pin move is a new version. This one is
**v4.0.3, PATCH** by the CHANGELOG's own convention (invariants subtree byte-identical, no content change —
say so in the entry, and say that v4.0.1 called the same condition MINOR, as the v4.0.2 entry does).

A pin move touches, in order, and nothing else:

**efilist** (one commit): `combined.html` (the move), `README.md` (pin table + the sentence naming the
current hash), `CHANGELOG.md` (a `## [v4.0.3] — <operator-local date>` entry above v4.0.2's, the superseded
table extended), `efilist_argument_library_v4_0_0.json` (the `version` field only — the filename is
frozen), `libraries/index.html` (the front-door badge `pinned v4.0.3`). If the layer needs a phone rule
(§3.3), `wuld-layer.css`/`.js` ride in the same commit, NO separate deploy.

**wuld-ink** (one commit by the site's own tool, one for the log, optionally one for the archive):
`release_v4_0_3.json` in the shape of `release_v4_0_2.json` (in `archive/ship-scripts/` or the k316 drop —
copy the shape, write the new numbers); then `python tools\library-pin.py` dry run must print `GATE: GREEN`
(it live-fetches `/combined` three times and refuses unless all three hash the new pin — so it runs AFTER
Pages serves the new file), then `--apply --date <operator-local>`; then the summary swap, `feed.xml`
regenerated, `python tools\search-index\build_index.py --src src --out src\search-index.json`; the block
walks every changed file and stages nothing unless each added line carries the new md5/version/byte count
and each removed line the old. Read `archive/ship-scripts/k316_wuld_v402_relabel_commit.ps1` — it is the
block, with v4.0.2 constants. The read-back is `/library-about/` naming v4.0.3 and the new hash.

**The layer is NOT re-pinned.** `wuld-layer.css/js` are linked, not inlined; a change to them is NO-PIN.

---

## 3. The job — measured brief (K317 container, Chromium, 390×844, is_mobile, dark, vfx tier)

The five wings and the front door fit a phone: `scrollWidth == clientWidth` (0 overflow), the chin's four
44 px controls at y 802 of 844, no page errors. Josiah: "refusal libraries already look good on mobile" —
**do not touch a wing** except through a shared-layer rule that the harness proves neutral on them.

The flagship does not fit. On the K316 bytes (the pin) at 390 px:

| what | measured |
|---|---|
| horizontal overflow | **149 px** (scrollWidth 539); map view 145; examples view 45 |
| what overflows | `.view-switcher` (`#vbtn-dep` right 411, `#vbtn-map1` right 533), `.depth-controls` (`.depth-btn` right 432), `.rsi-methodology-btn` (right 539), examples view `.mode-toggle` (right 435), the graph SVGs (`g` right 811) |
| text | 354 visible text nodes, **271 under 12 px** (250 at 10 px, the label size); the wing has the same distribution, so this is not by itself the fault — the row bodies read well (screenshots `k317\mobile\*.png`) |
| tap targets | 107; **95 under 32 px** in one dimension: nav links 16 px high, tier filters 28 px, depth buttons 28 px, rows' `+` |
| already there | `<meta name=viewport width=device-width>` ✓; a `@media (max-width: 900px)` block that stacks the examples layout and a `(max-width: 480px)` block for the coda; nothing for the library view's control rows |
| the layer | lip 0.74vw = 2.9 px, band 4.7vh = 40 px — fine; the chin fits |

### 3.1 The flagship's phone rules (the pin move proper)

One `@media (max-width: 600px)` block in `combined.html`'s own stylesheet, scoped to the library view's
control rows: `.view-switcher` wraps (or scrolls horizontally inside its own `overflow-x:auto` box — choose
by measuring which reads better, and say which); `.depth-controls` wraps with the label on its own line;
`.rsi-methodology-btn` fits; the examples view's `.site-header-right`/`.mode-toggle` wraps under the title.
The three graph views get `width:100%; height:auto` on the SVG with a `viewBox` if they lack one, or a
horizontal scroll box, whichever keeps the labels legible — measure both. Tap targets on the phone: nav
links and tier filters to ≥ 36 px tall (44 is the guideline; 36 is the floor that does not wreck the row
density — argue it if you land elsewhere). Do not change the desktop rendering: the 1440×900 captures
under `README.md`'s screenshots must stay pixel-identical on the new bytes — that is a control.

### 3.2 TODO 17, folded in: the graph views' SVG label fills

K314 measured 225 of 323 SVG `<text>` labels below AA in the graph views (`census_full.py` in
`archive/measurement/k314_pinmove/`). They are a carry because they live in `combined.html`, i.e. a pin
move. Bring them to ≥ 4.5:1 against their measured ground in both the dark and the cream (high-contrast)
ground with the same discipline K314 used for HTML text (`aa_remap.py`, `whofails.py`): remap the fills,
re-census, and report the before/after counts. The README's "every HTML text colour to AA" sentence can
then say "every text colour" — change it only if the census says so.

### 3.3 The layer at phone width (NO-PIN, ride along)

Only if the harness finds it: the chin's controls overlapping the toggles at 360 px, the feedback panel
(`.wz-fb-panel`, `min(380px, innerWidth-24)`) off-screen, the tour card wider than the viewport. SFX and
some VFX may not run on phones (no hover, no wheel) — Josiah accepts that; "I confirm vfx glow works".
Do not add touch gestures to the magnifier in this session.

### 3.4 Josiah's acceptance criteria, in his words

"is it accessible? is it cluttered? is it sleek?" — three questions, each answered with a measurement and
a screenshot at 390×844 and 360×780 (dark; then the cream ground) before the block goes to him. Send the
screenshots as files; he will look.

---

## 4. Verification before any block goes to Josiah

Playwright + Chromium are in the cloud container at `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`; do not run
`playwright install`. Serve a replica of the efilist root on `127.0.0.1` (`hz.py` in
`archive/measurement/k316/` does this: local d3, local IBM Plex Mono, tours suppressed, `context(tier, mode,
scheme)`); add mobile contexts (`is_mobile=True, has_touch=True, device_scale_factor=2`) at 390×844,
360×780, 430×932.

Required, each with a control that must FAIL on the pin's bytes (cccxxiv, cccxxxv, cccxxxvii):

- `scrollWidth - clientWidth == 0` at all three widths, all three views, both grounds — the pin's bytes
  must read 149 at 390.
- No element's rect extends past `clientWidth` (the probe in `k317\mobileprobe.py` lists them).
- Tap targets: count under 36 px before/after.
- The SVG census before/after (§3.2) in both grounds.
- The 1440×900 captures byte-identical (or pixel-identical: compare the PNGs) — desktop untouched.
- The K316 battery on the new bytes: `fbform.py`, `layerfix.py`, `navcheck.py`, `wingtoggle.py`,
  `k317.py` (all in the archive or the k317 drop) GREEN, and the wings' overflow still 0.
- Hash `combined.html` yourself before the first edit and abort if it is not `62d1e8d8…`.

**A control whose expectation is a round number tests your arithmetic, not the code** — derive the expected
failure from the pin's own bytes and the state the harness produced (cccxxxvii).

---

## 5. Committing: the blocks, in order

1. **efilist pin-move block.** Gates: fetch, not behind/ahead; HEAD blobs of every replaced file (the pin's
   `eab9c788…` included); every input by md5 + byte count; copy as bytes; stage exactly the named set;
   index blobs by SHA; commit; the pin's blob AFTER the commit must be the NEW predicted blob and nothing
   else staged; gated push; served read-back of `/combined` ×3 (status + bytes beside every md5) until all
   three hash the new pin, then the packs and the front door by md5. Model: `archive/ship-scripts/
   k314_pin_move_efilist_commit.ps1` and `k316_efilist_commit.ps1`.
2. **wuld-ink relabel block** (§2) — `--untracked-files=no` on its clean-tree gates.
3. **Log block**: guard the last subject; refuse if `CLAUDE.md` is modified; md5-gate log and stratum;
   prefix hash; append as BYTES; predicted length + md5 or no commit; `git add -- CLAUDE.md`; staged set
   exactly one; commit; gated push. Model: `k317\WI-K317_commit.ps1`. Record the census numbers, the
   overflow before/after, what you allocated. Update `P5_STATE.md` and the TODO (item 25 → LANDED, 17 →
   LANDED, 19 if you touched it).
4. Archive block when the drop is done (convention: `archive/{relays,kickoffs,ship-scripts,measurement}`,
   `k<NNN>_<what>`, text only, ≤ 200 KB, credential scan, no payload copies or screenshots).

Josiah runs them as one-liners: `Get-Content '<path>' -Raw | Invoke-Expression`. Five blocks, five
one-liners, never chained — each aborts by printing ABORT and the next must not run on an abort.

---

## 6. What not to do

- Do not touch a wing's file, `/troubleshooting/`, or the film's apparatus page.
- Do not inline the layer into `combined.html`; do not move the pin for a layer-only change.
- Do not change the corpus, the ledger, the graph literals or any response text — PATCH means byte-identical.
- Do not "fix" `apply_wuld_wrap.py`. Do not add touch gestures to the magnifier here.
- If you cannot verify something, say so plainly rather than shipping it and noting a caveat.
