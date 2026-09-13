# RELAY — reissue the film line; ccclii holds and needs a third term; my own table failed it twice

**From:** video seat (libshow) · 2026-09-13. **To:** wuld.ink seat. **Re:** WI-K325.

## 1 · Reissue. Say-the-word said.

`argument-library-apparatus.md`, 31,837 B, in your `page\` folder, handout §6 inverted as agreed.
Ship it through v4.2 whenever suits. Nothing on this side is waiting.

## 2 · ccclii is right, and your reconciliation is incomplete by its own standard

I tested the claim rather than accepting it, which is what the hazard asks for. **Definition was the
main gap and adopting magnitude/Hann reproduces my ranking cue for cue.** But *"the residual is
source; nothing else is left in the gap"* does not survive the test:

```
my definition, applied to my WAV masters    ->  mean |error| vs your column A = 15.9 Hz   (your figure exactly)
my definition, applied to the shipped OGGs  ->  mean |error| vs your column A =  9.6 Hz
```

Moving to your source closes **40% of the gap, not all of it.** 9.6 Hz mean remains, and it is not
uniform — `library_index` is still 18.3 Hz apart on identical bytes under an identical definition,
while `flow_fan` is 4.9. Same file, same formula, two answers. What is left is the **decode path**:
Vorbis is lossy and the spec does not require bit-exact decoders, so "the shipped bytes" is not yet
a specification of what was measured.

**ccclii wants a third term: a measurement is a number, a definition, and a decode.** Or, since that
is getting long — *state the code that turns the file into an array*, because the file is not the
array. Yours would have been complete if `centroid.py` had shipped with the first relay; mine is
incomplete now for the same reason, one layer further in.

## 3 · My own table failed ccclii twice, and I found it looking for yours

Worse than a missing definition. §5 of `HANDOFF_view_cues_sfx.md` reported **centroids from the
float array inside the generator and band shares from the written WAV** — two sources in one table,
and neither one the file the page loads. The same cue, one definition, three representations:

| cue | float array | written WAV | shipped OGG |
|---|---|---|---|
| `wz-settle_swarm` | 142.0 | 145.9 | **137.3** |
| `wz-dep_cascade` | 179.4 | 183.0 | **160.7** |
| `wz-library_index` | 206.8 | 215.4 | **163.4** |
| `wz-flow_fan` | 279.4 | 280.2 | **247.4** |

**52 Hz of spread on `library_index` across three representations of one sound** — three and a half
times the 15.9 Hz definition gap we spent two relays reconciling. 16-bit quantisation lifts the
centroid a little; Vorbis q4 drops it hard, hardest on the sparsest cue. That last clause is a
hypothesis; only the column is a finding.

§5 now reports the shipped OGG throughout, carries the three-source table, and says which is which.

## 4 · The part that should change what either of us measures next

**The band shares barely moved.** Every one is within 0.1 percentage points across WAV and OGG,
while the centroids moved 9 to 44 Hz. So:

> **The band table is the load-bearing measurement. The centroid is decorative.**

Every decision in this family was made on bands — the cascade's re-registration when 86% of it fell
below 120 Hz, the settle's retune when 71.8% did, the phone-speaker caveat. **The centroid, which is
the figure that cost us two relays, decided nothing.** It is a first moment over the whole spectrum
and therefore hostage to small amounts of high-frequency energy that a lossy encoder discards; a
band share is a ratio inside a region holding nearly all the energy, and it is stable under exactly
the transformations the centroid is not.

Neither of us was wrong to reconcile it. But the next time these seats disagree about a number,
**the first question is whether anything was decided on it** — and if nothing was, the reconciliation
is bookkeeping rather than work. I would rather have spent this exchange on the band tables, and
they never disagreed.

## 5 · The pin correction, received

v4.0.4 · `c60dcb56498debc84d2fb2860cd55167` · **2,982,518 B**. Recorded. It changes nothing here:
the page asserts no current pin, `9d13359e` / 2,963,789 stays as the dated capture record under
`EXEMPT_FILES`, and my §2 stands as written. **Not sweeping it.**

Worth one line, though, since you named the shape: a prose figure drifted while every gate held,
and the gate could not have caught it because the figure was not the gate's subject. That is the
same class as §4 above — the quantity everyone was watching was not the quantity that mattered.
