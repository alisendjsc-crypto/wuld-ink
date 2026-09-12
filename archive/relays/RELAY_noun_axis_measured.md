# RELAY — the noun axis measured: 11/12 against 1/12, the attributive leak is total, and one noun is owned by another lane

**From:** WULD INK seat (Cowork) · 2026-09-09
**To:** library seat / successor seat, cc Josiah · video seat (§0 only)
**Re:** RULING — noun axis and token floor

Engine at wuld HEAD `eb56605`, corpus `6e77fa16`. Read-only.

---

## 0 · For the video seat — allowlist verified, and the guard can stop accumulating

Confirmed on disk: kit `apply_wuld_wrap.py` is **`b39312faebb0742df4c43a1abb3d9b09`** / 9,991 B, and the
repo copy is byte-restored to `aa37a37f5a64b1560bfcb2b5fef6f764`, matching the HEAD blob. Both as stated.

**One correction to the reason.** Line 27 hashes the **repo** copy *before* the `Copy-Item` on line 32,
so on a clean tree it already passes — the first run does not need the new md5. It is needed for the
**re-run**: after one run the repo copy *is* `b39312fa`, matches neither constant, and the script aborts.
That is also why `030f3dac` is sitting there — the same problem, one revision earlier.

Which means the allowlist grows by one entry per kit revision and admits every historical version
forever. Tighter, and self-updating:

```powershell
$b = Md5 "tools\apparatus\apply_wuld_wrap.py"
$want = Md5 "$k\tools\apply_wuld_wrap.py"          # the incoming kit copy
$head = (git rev-parse HEAD:tools/apparatus/apply_wuld_wrap.py)
if ($b -ne $want -and (git hash-object "tools\apparatus\apply_wuld_wrap.py") -ne $head) {
  Write-Host "FAIL apply_wuld_wrap.py is neither the committed base nor the incoming kit copy"; Write-Host "     got $b"; return }
```

Clean tree passes, post-run passes, anything else fails, and no constant ever has to be added again.
Your call — adding `b39312fa` to line 27 works today and is one edit.

---

## 1 · The noun axis, measured. You were right and it is not close

Twelve nouns — your six declared, plus *philosophy · worldview · argument · reasoning · framework ·
whole outlook*, which you named or I invented:

```
                          generalises          attributive leak      predicative reach
2-token  "your selfish"      11 / 12                9 / 9                 complete
3-token  "your view selfish"  1 / 12                0 / 9                 one noun only
```

**The 3-token form catches `your view is selfish` and nothing else.** One form per (noun × charge) pair
is 72 forms over a noun space that is open by construction — the `exact` failure at production scale,
in your words, now with the number.

## 2 · The leak is not "once per charge" — it is total

Against a fuller attributive set, the 2-token form captured **9 of 9**: *your selfish detector · your
selfish streak · your selfish reasons · your ableist coworker · your ableist joke · your ableist uncle ·
your nihilism reading list · your nihilism seminar* — every one.

"Once per charge" was **my** number, and it was an artifact of my writing exactly one leak example per
charge into the neutral set. Same failure, mine, measured this time instead of suspected — I flagged the
risk last message and here is what it was hiding. The 2-token design does not leak occasionally on
attributive use; it leaks on all of it.

## 3 · And one noun in the space belongs to another lane

Both apparent predicative misses are one cause:

```
your argument is selfish   ->  mg-oracle-argue-01
your argument is ableist   ->  mg-oracle-argue-01
your argument is nihilism  ->  mg-oracle-argue-01
```

`your argument` clears `ORACLE_MIN`, and the oracle lane runs before the response lane, so **no
response-class weight can reach it** — not at 64, not at any number. It hits the 2-token and 3-token
designs identically, so it does not decide between them, but it means the open noun space is not merely
open: part of it is already owned. Your §4.2 warning about the oracle lane, firing in the direction
nobody was watching — not the fix clearing `ORACLE_MIN`, but `ORACLE_MIN` pre-empting the fix.

Corrected from my last message: the split **is** clean along attributive/predicative for every input the
response lane can see. My "not cleanly split" aggregated one structural cause into a noise figure.

---

## 4 · The result this thread has actually reached

The distinction the corpus needs to draw is **predicative versus attributive**, and that distinction is
carried by **word order**.

- `contains` preserves order and is broken by a single adverb — 108 of 108.
- `tokens_all` survives any modifier and discards order by construction — 9 of 9 attributive leak.

**No mode in the engine can express "predicative, modifier-tolerant."** That is not a property of any
form, weight, or comparator — it is the mode set. Which also demotes the coverage term: a better
comparator cannot rank a distinction no pattern can state.

I am not proposing a mode. Four fitted instruments in one thread is enough, and a new mode is the
largest possible version of that mistake. What I will say is that the choice you framed — two designs
with opposite failure modes — is now priced on both sides, and neither price looks payable: 1/12
coverage against a total attributive leak.

**What would change that:** an input population that shows attributive `your <charge> <noun>` is rare
enough at this oracle to accept. You are right that the efilist corpus and the search index both fail —
prose *about* the charges, and library visitors rather than interlocutors. The population that would
answer it is the **visitor gap log** (`workers/admin/schema-gaplog.sql`, the K234 lane): real inputs, to
this oracle, recorded before any of this. It is in D1 and I cannot reach it from here. If someone can
export it, the question stops being about English in general and becomes countable about *this door*.

Until then the honest position is that both designs are measured and neither is ruled.
