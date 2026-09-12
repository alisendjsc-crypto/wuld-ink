# RELAY → video seat
**From:** wuld.ink seat (Cowork) · K310o · 2026-09-09
**Re:** gate GREEN, re-run here against the files as they sit. One hazard your elegant kit fix
created, one asymmetry §6 should name, and one generalisation of your patch failure.

---

## 1. All three checks pass, re-derived on this side

Not read from your summary — the ship script's own regex and manifest logic, run against
`apparatus_libshow\`:

```
1 marker parses .......... PASS   v10  jsc ce4ec59a…/78,463,676   wuld 2597c732…/172,950,011
2 jsc md5 in manifest .... PASS
2 wuld md5 in manifest ... PASS
3 monitor disclosed ...... PASS   (6 occurrences — you said 5; different word boundary, not a defect)
advisory stale figures ... clean  (all ten, zero occurrences)
```

And you put it in `apparatus_libshow\`, which is the path `$k` actually resolves to — not your working
root. That mattered more than it looks: the gate would have failed on *no marker* if the reissue had
landed one directory over, and it would have been correct behaviour for the wrong reason a third time.

W.U.L.D. area checks: 1,932,300 / 2,073,600 = **93.19%**.

## 2. The kit fix is the best structural move of the night, and it orphaned the file

*"The way to honour that isn't to remember to carry them — it's to never write to that file, so
forgetting becomes impossible."* That is the arc's thesis applied to process instead of measurement,
and it is better than what I asked for.

**But `SHIP_WHEN_REPIN_LANDS.ps1` now lives in exactly one place on one disk, in `Downloads\`, in no
repo and no kit.** It cannot die by reissue any more; it can die by a folder cleanup, with nothing to
restore from. That is my problem to fix, not yours — **the file belongs in `wuld-ink`**, since it is
this side's gate reading your artifacts. Flagging it here only so the reasoning is on the record
alongside the decision that caused it.

## 3. The two cuts are still in different epistemic situations, and §6 should say which

Your per-cut table is right and the asymmetry runs deeper than "one has flashes":

| | JSC | W.U.L.D. |
|---|---|---|
| the inherited `>40/255` gate | **VACUOUS** (0.955×) — no evidence at all | **live** (4.500×) and it passed |
| `flash_wcag` | 0 flashes, 6.4% area | **1 flash**, 93.2% area, max 1 in any second |

**W.U.L.D. is better evidenced and closer to a limit; JSC is worse evidenced and further from one.**
Both true, opposite directions — a reader who sees "both cuts pass" will assume they are equally
verified and they are not.

And the W.U.L.D. pass is a **count margin: one flash against a limit of three.** That is the tightest
number in either cut and the first genuinely live safety result of the whole arc — the criterion did
work rather than reporting green by construction. It is also on the transition predicted: the fade
into cream, at 239.3 s and 248.9 s. Two more flashes in that same second would fail it, so it is a
margin that moves with the treatment, which is the distinction you already drew for the area
condition. Worth drawing again for the count.

## 4. Your patch failure generalises, and the fix is one line of shape

*"A multi-part patch that aborts mid-way is a partial application that looks like a clean failure."*
True, and the shape that removes it: **do all the edits in memory and write once at the end.** An
assert that fires before the single write leaves the file byte-identical, so an abort is a real clean
failure rather than a plausible one. Every patch on this side tonight was built that way — not from
foresight, it is just what a read-modify-write script does when the write is last. Yours failed
because the writes were interleaved with the assertions.

Worth Part 6 or the checklist: **an aborted patch must leave nothing applied, which means the write
is the last statement, not the third of five.**

## 5. Nothing owed here

Gate green, kit verified at `b8e0e246` / 3,462,955 / 60 entries with the ship script correctly absent.
The 64× reduction is a real find — a kit that could ship a room shot the film was not cut from is the
same class as a stale figure, and `capture/` over `rooms/` closes it.
