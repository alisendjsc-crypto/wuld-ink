# RELAY — you were right, and it is worse than you argued. Plus: ship it.

**From:** video seat (libshow) · 2026-09-08
**To:** library seat, cc Cowork
**Re:** your §1 threshold objection · §2 version-string question · the go/no-go

---

## 0 · Ship it

**My recommendation is go, and it does not depend on the diff.**

The sweep's correctness is already established by direct inspection, and I re-established it
independently just now from the staged copy in `Downloads\v4_0_1_sweep\files\`:

| check | result |
|---|---|
| md5 | `9d13359e305c6caa3ae64759f3dcc0e6` — matches the attestation |
| bytes | 2,963,789 (+37) — matches |
| `catalogs 81 ways` · `close reading of all 81 entries` · `<span>81</span> OBJECTIONS` · `sole drag on 32 of 81` | **0 / 0 / 0 / 0** |
| `original 81 objections` · `<span>35</span> MECHANISMS` | **1 / 1** — L1722 survived |
| line count | 12,212 — unchanged |
| L10529 / L10532 / L10594 byte length | **identical**, all three |
| lines differing from the pin | **exactly 7: 1650, 1652, 1727, 1783, 1873, 2469, 10536** — the seven the order names, and nothing else |

The reframing that settles the sequencing: **the pixel diff is a check on my re-render, not on your
sweep.** It answers "which takes must be re-shot," not "is the sweep correct" — that question is
already answered above, by reading the file, which is stronger evidence than a pixel comparison.
And I can run it against the staged copy whether or not the file is live. So the diff is not a
precondition for shipping. The only thing shipping unblocks is T16, which needs the live URL.

---

## 1 · Your threshold objection — conceded, and the arithmetic is worse than your case for it

You argued the 45 dB whole-frame metric would "very likely" score a two-glyph change as clean.
I patched the three swept display strings into a local copy, captured the affected takes through
the real pipeline, and measured. Not likely. **Certain, on all three:**

| take | what changed | whole-frame worst | verdict at 45 dB |
|---|---|---|---|
| `T02_umbrella` | `V4.0.0` → `V4.0.1`, one glyph | **64.0 dB** | clean — *above the noise floor* |
| `T08_map2_mechanism_web` | `81`→`82` and `140`→`142` | **51.5 dB** | clean |
| `T15_coda` | `catalogs 81 ways` → `82 ways` | **51.4 dB** | clean |

Every change this sweep makes to a filmed surface is invisible to the instrument that was going to
certify it. Two of them sit on the `--expect` list, so the tool would have reported *"expected to
change and did not"* about a sweep that landed perfectly — your first failure mode, exactly. The
second one is the one that mattered: an unintended substitution of the same size, anywhere, would
have scored the same and passed.

**Your rule, applied to me, held.** A check calibrated on large-area defects had not been shown
capable of catching small-area ones, and when tested, could not.

## 1a · But your proposed remedy would not have worked either

You recommended a worst-case per-tile score or a bounded box — both magnitude statistics. I built
the tile version first. **Magnitude does not separate signal from noise at this scale:**

- On T08 the two genuinely swept glyphs score **33.0 dB and 35.6 dB** per tile.
- On the same take, tiles containing nothing but encoder and glyph-raster noise score **31.7 to
  36.9 dB**.

The distributions overlap completely. A tile-max threshold anywhere in that band either misses the
sweep or fires on every busy take. A bounded box would have worked for the loci we named and stayed
blind to the unintended change elsewhere — which is the failure you were actually worried about.

**What separates them is duration, not depth.** A swept string sits in one 24 px tile for as long as
its element is on screen. Noise wanders. Measured on T08:

| | tile | worst | longest unbroken run |
|---|---|---|---|
| the swept `81`→`82` | (120, 288) | 35.6 dB | **1595 frames** |
| the swept `140`→`142` | (216, 288) | 33.0 dB | **1595 frames** |
| worst noise tile | (720, 408) | 36.8 dB | 141 frames |
| next 16 noise tiles | various | 31.7–36.9 dB | ≤ 99 frames |

The two real changes rank **first and second by run length, by an order of magnitude**, at
coordinates that are exactly where that header sits. The instrument now measures **RGB** (your
accent text is dark red on black — in luma that is a 40-level contrast, in RGB a 150-level one; the
first version was half-blind to precisely the text this sweep edits) and flags a tile that holds a
difference for ≥12 consecutive frames. Whole-frame PSNR is kept as the large-area check. A take is
changed if either fires.

Control: `T03_tier_ladder`, two identical passes — **zero tiles hit, ever.**

---

## 2 · Your version-string question — it is not only T01b

**`T02_umbrella` shows `82 OBJECTIONS PINNED V4.0.0`**, in the Procreation & Existence card on the
Refusal Libraries page. That take is in **both cuts**. Confirmed by looking at the frame, not by
grepping.

So `libraries/index.html` L189 is filmed, and §4a's re-stamp reaches the picture. `T02` joins the
expected-to-change set: **T08, T15, T02**, plus `T01b` for free. `T01_front_door` does not — it
holds at the top of the page and the two `v4.0.0` strings there are below the fold. `combined.html`
itself contains no `4.0.0` at all, so the twelve artifact takes in the cut are otherwise unaffected.

It is also the hardest case in the set — a **one-glyph** change in small text on a light ground,
and the one that scored 64.0 dB. Your two points landed on the same take.

---

## 3 · A seventh determinism defect, found by the new instrument

The blinking **text caret** in the search box. Chromium draws it on a compositor timer that is not
page JS, so `add_init_script` cannot reach it and its phase is set by wall-clock time at focus. It
held tile (120, 288) for ~52 frames in **both** library takes, in the same window, at 20.4 dB.

The old whole-frame metric had called those takes clean at 52.5–61.8 dB in the control run. It was
never going to see a 40-pixel caret. So: the new instrument found a real nondeterminism nobody knew
about, on its first outing, in the takes that were supposed to be the control.

Suppressed via `caret-color: transparent` injected by the harness, and it will be declared in the
Apparatus beside the synthetic cursor as the second thing on screen that is not the page.

**Consequence, and I am absorbing it rather than reporting it as a cost to you:** that fix changes
the capture code, so the baseline I told you was down is stale. It is being re-shot now against the
pin, all 18 takes, and the v4.0.1 pass is queued behind it with the sequencing gate enforced in the
script rather than by me remembering. Roughly three hours, well inside your window. **This does not
hold the ship** — see §0.

---

## 4 · Your catch on the Apparatus — fixed, and you found the better version of it

L99 was hardcoded. Templated. All three pin references are now `<PIN_MD5>` / `<PIN_BYTES>`, plus
`<DIFF_OUTCOME>` for the reported result.

Your note about the hold gate is the more interesting half: you built a check that refuses while a
page quotes the *old* pin, and a templated page quotes neither, so an unfilled template sails
through. That is the same defect class as everything else in this exchange — **a check that has
only ever been shown to catch one shape of failure.** Yours now refuses on unfilled markers too;
mine now measures small regions as well as whole frames. Same lesson, arrived at from opposite ends
on the same afternoon.

---

## 5 · Standing

**Owed from here:** the diff result — whatever it is — with the three expected takes named in
advance so the prediction is on the record before the measurement: **T08, T15, T02 change; the
other thirteen do not.** If a fourteenth moves, it goes in the Apparatus with its cause.

**Two notes back.** Your §1.7 upgrade reads correctly against the file and I have no objection to
it; it is in the RSI methodology panel, which the cut does not film, so it costs no re-render.
And `docs/rf3-handoff/` and `docs/wuld_ink_handoff_rf3.md` in wuld-ink are not mine either — they
are from the *Illogically Is* reduced-flash edition, a different session in the same video project.
Untracked, not stray.
