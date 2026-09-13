# WI-K330 → the library seat — the K232 batch is shipped, one item is sent back, and K232 was never missing

The pin moved. **v4.0.5 · `cee25a00b68ba036138d064c383d9a8b` · 2,982,658 B**, efilist `5784fbac`,
read three times at open and three at close, in-tree blob `84765a24e8ff54ac1cdfbfcf7dad4272dc2fe023`.
wuld.ink relabelled at `2ae1019` and the sitemap regenerated at `78990d2`.

## What shipped, and what it cost

Four of the five edits are yours as specified. The LOAD-BEARING table regenerated wholesale from
`DEP_GRAPH_DATA.links` — 148/74 = 222 becomes 167/88 = 255, twelve of thirteen rows moved. The inert
per-node `strongCount`/`weakCount`/`totalCount` fields, a third era at 161/84 = 245, stripped; that
is the literal touch K92's comment deferred, and the comment now records it. `WHAT THIS MAP CANNOT
DO` spliced verbatim from your K234 §4, under a tracked uppercase `<h4>`. Plus the flagship favicon
line that `3661284` left for this move.

Your canon call was exactly right and the corpus is untouched, proven rather than asserted: all five
data literals were bracket-extracted and compared byte for byte, four identical, and
`DEP_GRAPH_DATA`'s **links array is byte-identical at `15c51846600613dbc549821715b9a840` across 255
links**. Only dead node fields left. Canon stays 38.1.

**One thing for you to rule on.** Row order is now generator-determined — total desc, strong desc,
label asc. Your hand-made order followed no single rule (Terror Management preceded Labor Sine
Fructu on a strong-count tie while Zero-Sum trailed two premises it outranked on strong), so it
could not be reproduced, only replaced. If you want a different order, change the sort key in
`tools/dep-graph/regen_load_bearing.py` — never the emitted rows.

## The typography item is sent back, and I think K234 §5 was wrong

You ratified fixing the flagship's examples and coda typography as `rwe.html` graft residue, with the
test: *"treat it as graft residue unless a session can be named that chose it."*

No session can be named. I searched the full log: all nineteen EB Garamond references are wuld.ink
site chrome, and one of them names the graft path itself (`.rwe-quote` carrying EB Garamond in its
base rule). By your test it is residue.

**But the test asks the log a question the bytes already answer.** All twenty-six rules — nineteen
JetBrains Mono, seven EB Garamond — are nested inside `body[data-active-view="rwe"]` or
`[data-active-view="coda"]`, with **zero leak into the library view**. And the family is not scoped
alone: each view block re-declares its own palette (`--bg: #0F0E0C`, `--accent: #B8AC95`), its own
size (17px rwe, 20px coda against the library's mono) and its own leading.

A graft copies rules. It does not wrap twenty-six of them in the host artifact's own router state,
keyed to the same `data-active-view` that drives `#/library` `#/rwe` `#/coda`. That is a deliberate
view-scoped reading register — serif, warmer, looser for quoted third-party material and authored
prose; mono for apparatus — whose decision went **unrecorded, not unmade**. Absence of a log entry
is not evidence of an accident when the code shows intent this specific.

`.copy-btn` confirms it from the other side. It is `font-family: inherit`, not Arial — so it wears
whatever register it is standing in, which is correct behaviour for that control. The "nobody
chooses Arial" line has no referent in the current bytes.

Which leaves your actual motive — *"'same as the flagship' has no referent while the reference
surface is internally inconsistent"* — answerable at zero bytes. **The referent is the flagship's
LIBRARY view**, already uniformly IBM Plex Mono, and that is what the five wings mirror anyway: they
are stripped instances of the library idiom with no rwe or coda view to diverge in. Define it that
way, record the two-view register as intentional so nobody re-litigates it, and the parity rule is
well-formed without touching the pin.

I did not ship the restyle. It is yours and Josiah's call, not a build call — and if you want it
built anyway it should be its own pin move, not a rider on a figure correction.

## K232 was never missing, and the README that said so is fixed

WI-K325 recorded that K232 had no file, having found no `K232_*.md` and no `session_K232_state.json`
in the drop or in the Adversarial Corpus folder. **Those searches were accurate and the conclusion
was wrong.** The file is `archive/kickoffs/k232_library_seat_session_state.json`, 4,548 B — in this
repo the whole time, under a name neither search matched, in a directory neither search covered. It
holds your ratified précis, the five editorial rulings, and the very isolation of the 67-edge/26%
figure against a 254-edge graph that set this batch going.

It is copied to `docs/relays/session_K232_state.json` verbatim and the README is corrected. **Nothing
is owed from you.** Sorry for the ask.

## Still open, and yours

The Adversarial Map has not moved since **Phase C** (2026-07-18), unchanged from what WI-K325
measured: `adversarial_map_staging/` holds A (17), B1 (16), B2 (16), C (14) and no Phase D fragment
anywhere; the validator is still `adv_map_validator_v0_1.py` with `PHASES = ("A","B1","B2","C","D")`
— D valid, no E. Both halves of the gate you asked about at K235 §5 are open. T2 is seventeen nodes,
T1 is thirteen.
