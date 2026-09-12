# COWORK EXECUTION ORDER — v4.0.0 sweep + re-pin

**Authored:** library seat, 2026-09-08 · **RELEASED** 2026-09-08 — precondition §0.1 met, baseline confirmed down against md5 `e654eabd…`, 16 artifact takes, control diff 0 findings.
**Amended on release:** ships as **v4.0.1**, not v4.0.0 — see §4a. Re-render count is **sixteen**, not fourteen.
**Supersedes:** `WORKORDER_v4_0_count_string_sweep.md` §A + `RULING_prose_loci_and_source_vehicle.md` §1–4. Those remain the reasoning; this is the instruction. Where they differ, this wins.
**Class:** maintenance, canon **MINOR**.
**Target:** `combined.html` — md5 `e654eabd32fa95e5969d49e6eb15aa87`, 2,963,752 bytes. Plus `README.md`.

---

## 0 · Preconditions — all four, in order

1. ~~Video seat has sent **"baseline is down."**~~ **MET** — confirmed 2026-09-08, two seeded passes, control diff clean at 52.5–61.8 dB against a 45 dB threshold.
2. `md5sum combined.html` returns `e654eabd…`. **If it does not, stop** — every line number below is keyed to this exact file.
3. Line count recorded before the edit.
4. Byte-length of lines **10529**, **10532**, **10594** recorded. These are the graph and RWE mega-literals. They must be byte-identical afterward.

---

## 1 · Edits — seven, all on normal-length lines

Do these as a **line-indexed Python pass with per-line anchor assertion**, not `sed -i` and not a global regex. Read lines, assert the anchor is present on the named line, replace within that line only, write out. Any failed assertion aborts the whole pass.

| # | Line | Anchor (must be present) | Replacement |
|---|---|---|---|
| 1 | 1727 | `<span>81</span> OBJECTIONS` | `<span>82</span> OBJECTIONS` |
| 2 | 1727 | `<span>140</span> CONNECTIONS` | `<span>142</span> CONNECTIONS` |
| 3 | 2469 | `catalogs 81 ways` | `catalogs 82 ways` |
| 4 | 1650 | `close reading of all 81 entries` | `close reading of all 82 entries` |
| 5 | 1783 | `close reading of all 81 entries` | `close reading of all 82 entries` |
| 6 | 1873 | `close reading of all 81 entries` | `close reading of all 82 entries` |
| 7 | 1652 | `the sole drag on 32 of 81 nodes` | `the sole drag on 31 of 82 nodes` |
| 8 | 10536 | `stored sum 245 vs 254 links` | `stored sum 245 vs 255 links` |

**On #1:** `<span>35</span> MECHANISMS` on the same line **does not change.**

**On #5 (L1783):** that line also contains a correct `82` and a correct `255`. The anchor above is long enough to be safe — do not shorten it, and do not anchor on a bare `81`.

**On #7 — optional upgrade, executor's discretion:** the richer sentence is `robustness is the sole weakest axis on 31 of 82 nodes and ties for weakest on 34 more`. It is more informative and stops the line going stale every time one node is regenerated — which is exactly how it went stale. It requires reading the surrounding sentence and splicing grammatically, so **if the surrounding prose does not accommodate it cleanly, take the minimal replacement in the table and move on.** Do not force it.

**On #8:** the `245` is correct — it is the drifted stored sum, and it is the defect being recorded. Only the `254` moves.

### README.md

Replace the stale grade line (L80) in full:

> `Grade distribution (long, n=81): A 36 / B 34 / C 11 / 0 ungraded`
> → `Grade distribution (long, n=82): A 28 / B 53 / C 1 / 0 ungraded`

Source is `rebuttal_grading_ledger.json`, recomputed independently on both seats. The pin table at **L63–L68** takes the new md5 (L67) and byte count (L68) after the re-pin.

---

## 2 · Do not touch — the sweep fails if any of these move

**`combined.html` L1722 — HOLD, permanently.**

> *"The 35 mechanism clusters were derived bottom-up from the original 81 objections, not imposed top-down from a pre-existing taxonomy."*

`original` makes it historically exact, and it is the sentence that explains why the mechanism count held at 35 across v4.0. **It is also filmed** — it is an on-screen beat in both cuts. Sweeping it to 82 destroys a true claim, replaces it with a false one, and kills a take. Flag it do-not-touch in canon so a future sweep does not "fix" it.

**Not defects — leave alone:** `K81` in a CSS comment (L1548) · `81` inside RWE content (L5409) · `140ms` CSS transitions (L1221) · `#140a0a` (L856) · "140 million children" in objection prose (L3818, L4190).

**Correct numbers a careless pass will break:** 78 (Map 1, archetype-curated by design) · 2,886 · 35 · 13 / 9 / 4 premises · 136 / 171 · 167 strong links · 16 variant nodes · 4 registered moves.

**Not present in the file, nothing to sweep:** `116 nodes` · `94 nodes` · `87 weak` · `243 responses` · `13/17/14/31/6` · `n=81` · any grade-distribution line · any `V3.8.x` version string. Map 2's methodology panel, Map 3's header, the RSI panel and the stats panel carry no stale counts.

**Wings and `libraries/index.html`:** untouched. Already correct.

---

## 3 · Post-edit verification — run all seven before shipping

Use `grep -c` only. Never plain `grep` on this file.

| Check | Expected |
|---|---|
| `grep -c 'catalogs 81 ways'` | **0** |
| `grep -c 'close reading of all 81 entries'` | **0** |
| `grep -c '<span>81</span> OBJECTIONS'` | **0** |
| `grep -c 'sole drag on 32 of 81'` | **0** |
| `grep -c 'original 81 objections'` | **1** ← L1722 must survive |
| `grep -c '<span>35</span> MECHANISMS'` | **1** |
| line count | unchanged from §0.3 |
| byte-length of lines 10529 / 10532 / 10594 | unchanged from §0.4 |

**Then re-attest the graph literals.** Slice L10529 and L10532, strict-JSON-decode, count by `type`. Expect **117 nodes / 142 links** and **95 nodes / 255 links, 167 strong / 88 weak** — identical to the video seat's Gate 0. This closes the loop: it proves the splice touched chrome and prose only, and that no data moved.

---

## 4 · Ship, pin, attest

Ship to live. `pin == live`. Then emit the attestation as one unit — four fields, five destinations, no retyping:

```
new_md5:        …
new_byte_count: …
swept_loci:     [as executed, by line number]
l1722_status:   UNTOUCHED — verified, grep -c == 1
```

**Destinations:** canon `archive_attestation` · the Apparatus · video handout §2 and §12 · the hash-shot expected value.

**Canon MINOR.** Log the keyset delta if any, and add one open item:

> *Open invariant defect: `DEP_GRAPH_DATA` per-node stored link sums total 245 against an actual 255. Fields left in place; strip in a post-release maintenance pass. Do not strip during video production — it mutates the data literal and re-opens render risk on a filmed artifact.*

---

## 4a · Ships as v4.0.1 — added on release

**Ruling: this goes out as v4.0.1, not as a re-pinned v4.0.0.**

The order as originally written shipped a new md5 under the existing version string. That is a defect, and it is precisely the seam the film instructs viewers to look for. A reader who downloaded v4.0.0 last month, hashes it against a pin table that now reads differently, and finds a mismatch has no way to tell *superseded* from *corrupt* — and the film has just told them a mismatch means corrupt. One version must map to one hash or the verification claim does not hold.

**Do:**

- `CHANGELOG.md` — new entry, **`## [v4.0.1] — 2026-09-08`**, MINOR. State plainly: display-string sweep and methodology-provenance correction; **no content change**; corpus, ledger and graph literals byte-unchanged in substance; all four surfaces re-stamped. Record the superseded md5 alongside the new one so an old copy is diagnosable rather than suspect.
- `efilist_argument_library_v4_0_0.json` — `version` field `4.0.0` → `4.0.1`. Filename stays frozen, per convention.
- JSX and ledger — re-stamp the version string only.
- `libraries/index.html` L189 — `pinned v4.0.0` → `pinned v4.0.1`.
- `README.md` pin table L63–L68 — new md5 and byte count, and carry the release identifier and date beside the hash so a future mismatch is legible.

**Do not** treat this as a content cut. Nothing in the corpus moves; the version bump exists so that the hash a reader computes has exactly one release it can belong to.

**Consequence for the film:** if either cut puts `v4.0.0` on screen anywhere, that frame is now stale and the take is added to the re-render set. `T01b_library_page` shows the libraries page and will pick the change up automatically, since it shoots the live site at the end of the chain.

---

## 5 · What happens on the other side

Attestation lands → video seat re-renders all **sixteen** artifact takes against the new pin → diffs against the seeded baseline → the only takes that may legitimately differ are **T08** (mechanism-web header) and **T15** (coda lead). Anything else is a finding, and a finding means this order did something it did not declare.

That diff is the check on this document. Write it so it passes.
