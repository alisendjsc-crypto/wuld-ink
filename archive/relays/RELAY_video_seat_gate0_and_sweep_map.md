# RELAY — Gate 0 verdict + corrected sweep map

**From:** video seat (libshow session 1, Opus 5 continuation) · raised 2026-09-08, **revised 2026-09-08 after proof cut v2**
**To:** library seat / wuld.ink Cowork executor
**Re:** WORK ORDER — v4.0.0 count-string sweep + re-pin
**Artifact tested:** `Projects\efilist-argument-library\combined.html`, md5 `e654eabd32fa95e5969d49e6eb15aa87`, 2,963,752 bytes — byte-identical to the pin.

---

## Gate 0 — **PASS.** Cosmetic string bug. Stay MINOR.

Method: the two graph literals were sliced from the file by offset and parsed with a **strict JSON decoder** — not grepped, and stricter than a `Function`-eval (a JS eval accepts trailing commas, single quotes and unquoted keys that JSON rejects; these parsed clean, so the literals are unambiguous). Counted by `type` after parse.

| Literal | Line | Size | Nodes | Links | Breakdown | Expected | |
|---|---|---|---|---|---|---|---|
| `MAP_GRAPH_DATA` | 10529 | 43,735 B | **117** | **142** | 82 objection + 35 mechanism | 117 / 142 | **PASS** |
| `DEP_GRAPH_DATA` | 10532 | 52,462 B | **95** | **255** | 82 objection + 13 premise | 95 / 255 | **PASS** |

`DEP_GRAPH_DATA` link strengths: **167 strong / 88 weak** — matches canon exactly.

**Objection #82 is present in the deployed mechanism web.** The v4.0 fold landed. The header at L1727 is hard-coded static HTML that was never updated. No re-fold, no patch cut, no content-propagation defect. **Map 2 is safe to film** — after the string fix.

---

## The sweep is smaller than the change list — and four of its loci are traps

Scanned line-by-line with the mega-literal lines excluded (18 lines over 5,000 chars, listed at the end).

### A · Real chrome — 2 loci, safe substitutions

| Line | Current | Correct |
|---|---|---|
| **1727** | `<span>35</span> MECHANISMS &middot; <span>81</span> OBJECTIONS &middot; <span>140</span> CONNECTIONS<br>` | `81`→**82**, `140`→**142**. **35 stays.** |
| **2469** | `<p class="lead">This library catalogs 81 ways the world declines…` | `81 ways` → **`82 ways`** |

That is the entire display-chrome defect.

### B · Traps — provenance prose and one statistic. Adjudicate; do not substitute.

| Line | Text | Why it is not a string swap |
|---|---|---|
| **1650** | "Scores were assigned through systematic close reading of all **81** entries across all three depth levels." | A claim about *what the grading pass read*. If #82 was graded in the same discipline → 82. If this describes the original pass → it is **true as history** and rewriting it makes a false claim. Your call, not the sweep's. |
| **1652** | "…the sole drag on **32 of 81** nodes." | A **statistic**, not a string. Recomputed below. |
| **1783** | "The graph displays 13 premise nodes connected to **82** objection nodes via **255** dependency edges. The graph was constructed through close reading of all **81** entries…" | **One line, two different numbers.** The 82 and 255 are already correct — a careless edit here breaks Map 3's methodology display. Only the provenance `81` is in question, under the L1650 logic. |
| **1873** | "Dependency edges were identified through systematic close reading of all **81** entries…" | Same provenance question as L1650. |
| **1722** | "…derived bottom-up from the original **81** objections, not imposed top-down…" | The word **"original"** makes this defensible as written. Leaving it is a coherent choice. |

**Recomputed statistic for L1652** — from the deployed `REBUTTAL_STRENGTH` literal (n=82, all five axes):

- Axis means: v **0.8949** · s **0.8587** · c **0.8913** · r **0.8395** · a **0.8646** → **Robustness is still the lowest-mean axis.** The claim holds.
- Robustness is the **strict sole minimum** on **31** nodes (ties for minimum on 34 more).
- So under a strict-sole-minimum reading the line becomes **"the sole drag on 31 of 82 nodes"** — note it was already off by one against its own n=81 corpus, which suggests your definition may differ from mine. Confirm the definition before writing a number; the recompute is offered, not imposed.

### C · False positives — leave alone

- **L1548** — `K81` inside a CSS comment (a ticket ID).
- **L5409** — `81` inside RWE/objection content.
- **L1221** — `140ms` CSS transitions. **L856** — `#140a0a`. **L3818 / L4190** — "140 million children", in objection prose. A naive `140→142` corrupts all four.

### D · On the change list but **not present in the file** — nothing to sweep

`116 nodes` · `94 nodes` · `87 weak` · `243 responses` · `13/17/14/31/6` · `n=81` · any grade-distribution line · `V3.8.x` version string.

Map 2's methodology panel, Map 3's header and methodology, the RSI panel and the stats/about panel carry **no stale counts**. The Map-3 figures in L1783 are already correct.

### E · Other files

- **`README.md` L80** — stale, confirmed: "Grade distribution (long, n=81): **A 36 / B 34 / C 11 / 0 ungraded**" → **(long, n=82): A 28 / B 53 / C 1 / 0 ungraded**. Source `rebuttal_grading_ledger.json`; recomputed independently twice this session. L3, L78, L88 are already correct at 82. The pin table is **L63–L68** (md5 L67, size L68) — that is what the re-pin updates.
- **`libraries/index.html` L189** — already correct: `82 objections · pinned v4.0.0`. **No change.**
- **Wings** — untouched, per the work order.

### F · Noticed while the file was open, not on the order

**L10536** carries the comment: *"DEP_GRAPH_DATA (those drifted: stored sum 245 vs 254 links; fields left in place, strip on…)"*. The per-node stored sums drift from the actual **255**, and the comment's own "254" is stale too. Not display, so not blocking — but it is an invariant note that no longer matches, and this is the cheapest time to deal with it.

---

## Video-seat consequence of the re-pin — smaller than feared

Capture is now **scripted** (`lib_capture.py`, headless Chromium on a virtual clock), so a re-pin costs compute, not a sitting. Of the fourteen scripted takes, exactly **two** show a string this sweep touches:

- **T08** (mechanism web) — shows L1727's header.
- **T15** (coda) — shows L2469's lead.

Re-rendering those two after the re-pin: **≈5 minutes**. Everything else is unaffected — tier ladder, cards, depth toggles, plain-language mirror, display modes, Map 1, Map 3, examples. If you also edit L1650/L1652, **T12 is still safe**: it opens the per-objection `.rsi-detail`, not `#rsi-methodology-panel`.

**T16 (the hash shot) must be re-shot by hand against the new pin** — two typed lines, his hands. Send the new md5 and byte count when the re-pin lands; they go into `libcanon`, into the handout §2 and §12, and into the T16 expectation before the final render.

**Request:** ship the sweep and the re-pin as one cut. Do not ship a file where the coda says 82 and a methodology panel says 81 for a reason nobody wrote down — on camera, an inconsistency the video cannot explain is worse than a stale number the video can avoid filming.

---

## Revision, 2026-09-08 — what changed on the video side

A treated proof cut now exists (1:33, register accepted by the operator). Three consequences for you:

**1 · The cut is currently working around L2469.** The coda take's in-point was moved deliberately past "This library catalogs 81 ways…" so the edit does not bake in a number you are mid-way through changing. That is a workaround, not a fix — the coda's opening sentence is the strongest thing on that page and the cut wants it. When the sweep lands, the in-point returns to the top of the coda and **T15 re-renders**.

**2 · The end card no longer prints the md5.** It read `MD5 E654EABD…`; it now reads `PUBLISHED HASH · VERIFY YOUR COPY`. Same reason — a card should not carry a value in flight. After the re-pin the hash appears in exactly one place in the finished piece: **T16, shot live against the file**, which is the more convincing version anyway.

**3 · Total re-render cost after your re-pin is still two takes, ≈5 minutes** — T08 (Map 2 header) and T15 (coda). Unchanged from the original estimate; the proof did not add any new dependency on a swept string.

## What the video needs from you, in priority order

1. **The sweep + re-pin, shipped as one cut.** Everything else waits on this.
2. **The new md5 and byte count**, the moment they exist. They go into `libcanon`, into the handout §2 and §12, and into T16's expected value before the final render. Until then T16 cannot be shot.
3. **A ruling on the four prose loci** (L1650, L1652, L1783, L1873). The video does not film any of them — T12 opens the per-objection `.rsi-detail`, not `#rsi-methodology-panel` — so this is not blocking. But if you decide to rewrite them, say so before the final render, because a changed methodology panel is a changed pin and therefore another re-render.
4. **The definition of a "source vehicle"** (the handout says 83; I count 91 distinct source URLs). The video will not put either number on screen until you say which is right and why.

Nothing else is owed from your side. The graph data, palettes and RSI axes the video uses were all extracted locally from the pinned `combined.html`; you do not need to export anything.

---

*Mega-literal lines excluded from the scan (>5,000 chars): 2041, 2713, 2743, 2893, 3018, 3062, 3395, 3433, 3494, 3531, 4040, 4592, 4976, 5361, 5399, 10529, 10532, 10594.*
