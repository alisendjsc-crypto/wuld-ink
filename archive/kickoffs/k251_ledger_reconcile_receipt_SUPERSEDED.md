# K251 ledger-reconcile receipt -- adv-map exchange-mirror + pointer stratum + resolved shas (wuld DOC-ONLY; NO PIN)

**From:** wuld-committing Cowork session **K251** (2026-07-18; FENCED off efilist -- zero efilist bytes, zero library-surface bytes, zero flagship).
**Status:** wuld ledger brought current on the adv-map lane through Phase C. Operator push pending (one wuld-only PS block; the commit sha self-appends at the foot of this file on push).

## The DERIVED true gap (vs the carried owed-list)
- Baseline: `docs/library-claude-coordination.md` last mirrored Exchange = **152** (K223, Phase A fold, 2026-07-11).
- Carried list (K221/K223/K224/K226/K228/K229/K230) OVERSTATED by **2 of 7 sessions**: K221 was already **Exchange 151** (mirrored at wuld-K222) and K223 was already **Exchange 152** (logged by K223 itself). The list copied itself stratum-to-stratum without re-derivation, exactly as the kickoff predicted.
- TRUE gap = 5 sessions (K224/K226/K228/K229/K230) collapsing to **3 fold-arcs -> 3 mirror entries**.

## Mirrored (appended to the coordination doc)
- **Exchange 153 -- B1:** library-seat K224 (2026-07-12) authored `adv_map_phaseB1_v0_1.json` `04a6069f`/26,009 (16 entries / 15 nodes T4[0:15], a8/b5/d3, validator PASS 0); K226 fold (2026-07-13) atop `2c2c3e0` -> efilist **`e28455e`**. No K226 receipt file exists; sourced from `session_K224_state.json` + the K228 state's `b1_gate` attestation.
- **Exchange 154 -- B2:** seats K228 (A+B, partial `2865f9a5`) + K229 (C+D + merge), both PROVISIONAL; `adv_map_phaseB2_v0_1.json` `b55e2ea8`/42,065 (16 entries T4[15:31], d12/a1/b3, PASS 0); fold (2026-07-17, concurrent wuld-K243) atop `e28455e` -> **`e197c65e676b92529b41562c4c11e13bfee8bba6`**. Via `K229_B2_fold_receipt_v1.md`.
- **Exchange 155 -- C:** seat K230 PROVISIONAL; `adv_map_phaseC_v0_1.json` `40b501f7fcbbf28c3e40f65e3d01e63d`/31,890 (14 entries = the whole T3 tier, a7/b4/d3/c0, coverage 14/82 {C:14}, terminal:false, PASS 0); fold (2026-07-18, concurrent wuld-K250) atop `e197c65` -> **`579cfbd57a72896a392f9b3f494c975baeae4425`**; PUSH CONFIRMED LIVE (pin `e654eabd` held, asserted first; fragment served 200 + md5). Via `K230_C_fold_receipt_v1.md`.

## Pointer stratum landed (wuld CLAUDE.md, K251)
Lineage baked with the resolved shas as durable anchors: A-fold **`2c2c3e0`** (resolved from the K228 state; the K223 stratum had left it symbolic as "a0437d9+1") -> B1 **`e28455e`** -> B2 **`e197c65e676b92529b41562c4c11e13bfee8bba6`** (full form; the wuld ledger previously carried only the K244 rider's short form) -> C **`579cfbd57a72896a392f9b3f494c975baeae4425`** (previously ABSENT from the wuld ledger entirely). Plus: the shipping-fork disposition verbatim; pointers to the efilist primer strata + these receipts; verify_before refreshed (efilist HEAD `579cfbd`; flagship `e654eabd`/2,963,752 pin v4.0.0 HELD -- NO PIN, untouched from anywhere).

## Session-id reconciliation (attempted, per the kickoff CLOSE)
NOT determinable from the coordination doc: its K-labels are wuld-side session numbers; the library seats self-numbered provisionally (K228 declares its own provenance provisional; K229/K230 inherit the flag). DISPOSITION: the commit shas stand as the durable anchors; the K228/K229/K230 K-labels stay FLAGGED for reconciliation on the next library relay.

## Standing flags PRESERVED (library/efilist lane -- deliberately NOT fixed by this wuld docs session)
1. Stale efilist canon `next_recommended_session` -- still points to the Phase-A pilot.
2. Validator PHASES needs an 'E' bump BEFORE Phase E = T1 (n=13). D=T2 is already valid.

## Debt state after this lands
Adv-map owed-forward debt **CLEARED to Phase C**. The next efilist fold (Phase D = T2, n=17, when the library seat emits `adv_map_phaseD_v0_1.json`) starts a fresh, single-item owed-forward.

## Anchors
- wuld parent: `8ec892543915ada2e2d21c506a147cca7933b7f3` (K250, the vitrine).
- `docs/library-claude-coordination.md`: `20cc078d80ea97a254bac863b49a6504` -> **`cab421dc17c8d2f8171881d7c7bcda99`/650,865** (append-only, Exchanges 153-155).
- `CLAUDE.md`: `28235bc66c8b283e2b9b257dfd651a4d` -> **`4449b86385884e3982755c9a398502e0`/356,456** (append-only, the K251 stratum).
