# RELAY — mg-stance-bait-01 over-captures, but not for the reason the carry gives, and the harm is 3 not 22

**From:** WULD INK seat (Cowork) · 2026-09-09
**To:** library seat / successor seat, cc Josiah
**Re:** TX21 item 5, the idle-session probe — run, against the real engine, with the counterfactual measured

---

## What was run

`Downloads\k309_probe\probe_stance_bait.cjs` drives `src/components/yurei-oracle.js` — the shipped
`Matcher`, `normalize`, `entryScore` and `CONST`, one fresh instance per input. No reimplementation.
Corpus `6e77fa16`, 189 entries, at wuld HEAD `eb56605`. Artifact: `probe_stance_bait_K309.json`.

Three sets: the 13 declared forms (control), 26 accusation-shaped inputs that happen to contain one
of those forms, and 17 of the same accusations with the substring removed (control).

**The counterfactual is measured, not inferred.** "Where would this land without the entry" is a second
routing pass against the corpus with `mg-stance-bait-01` deleted — not a reading of a candidate list
that still contains it. My first pass reported the lane *with* the entry present and labelled it
"without the bait"; that pass was wrong and is not the one reported here.

## The result

```
control     13/13 declared forms still route to the entry
capture     22/26 accusation-shaped inputs land on mg-stance-bait-01
steals       3/26 — a scoring alternative existed and lost
bare control 0/17 — no accusation reaches the entry without a declared substring
```

**The carry's phrasing — "over-capturing accusations generally" — is right about the count and wrong
about the damage.** With the entry removed, 19 of the 22 captures fall to `mg-deflect-01`, which has
`patterns: null` — the pure fallback. The corpus has no better home for them. The entry is not taking
those from a correct answer; it is substituting a *specifically wrong* answer for a *generically
evasive* one. `who do you think you are` currently gets *"That's a position you're after"* — a
misreading — where it would otherwise get *"That's off the path I keep."* Which is worse is a register
call and it is yours, not a measurement.

**The three steals are the measurable defect:**

| input | routed | should reach | margin |
|---|---|---|---|
| `your stance is just misanthropy` | bait 63 | `pos-antinatalism-misanthropic-01` 62 | **1** |
| `your view is nihilism` | bait 63 | `mg-topical-deflect-01` 61 | **2** |
| `how do you feel about being called a eugenicist` | bait 63 | `mg-how-are-you-01` 63 | **0** (tie) |

## Why it wins: the score does not vary with fit

All 13 patterns are `contains`, weight 3. `entryScore` is a MAX of `BASE[mode] + weight`, so the entry
returns a **flat 63 whenever any one of them fires**, regardless of how little of the sentence it
explains. `pos-antinatalism-misanthropic-01` scored 62 on `your stance is just misanthropy` because it
matched the *topic*; it lost to a 63 earned by the two words `your stance`.

The 13 forms are second-person address fragments. An accusation is distinguished from a request for a
position by what follows the fragment, and `contains` cannot see what follows. `do you think` alone
accounts for 4 of the 22; `your position`, `your view` 3 each.

Not a recommendation on the fix — that is a stance change and yours to rule — but the shape of the
choice: narrowing the modes costs the entry its reach on real stance questions; dropping the weight
moves all 13 at once, since they share it; adding the accusation frames to `mg-hostile-01..06` so they
win on specificity leaves the entry untouched and is the only option that does not trade one
mis-capture for another.

## One gap found on the way

**`eugenicist` is not on the net.** Five forms contain `eugenic`, all of them the noun `eugenics`
(`this is eugenics`, `sounds like eugenics`, `sounded like eugenics`, `this is a slippery slope to
eugenics`, `this is nazi eugenics`). The agent-noun reaches nothing, which is why *"being called a
eugenicist"* falls through to `mg-how-are-you-01` — an entry about how the persona is feeling — rather
than to `pos-slippery-slope-eugenics-*`. That is a one-form addition on a surface every miss falls
through, so it is yours; the same shape as the `meaningless` miss reported at K307.

Same shape in `pos-nihilism-label-01`: it declares `this is just nihilism`, `sounds like nihilism` and
`you are a nihilist`, but not the bare `nihilism`, so `your view is nihilism` reaches only
`mg-topical-deflect-01` at weight 1.

## Standing

Read-only. No corpus byte moved, nothing staged, nothing pushed. The probe is re-runnable on a changed
tree — `node probe_stance_bait.cjs <repo-root>` — and should be re-run after any edit to the entry, so
the next claim about it is measured rather than reasoned.
