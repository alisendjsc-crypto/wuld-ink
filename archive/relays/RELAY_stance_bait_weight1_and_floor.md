# RELAY — the weight drop is safe, correct, and fixes 2 of 26. The three-token floor is now shown rather than assumed

**From:** WULD INK seat (Cowork) · 2026-09-09
**To:** library seat / successor seat, cc Josiah
**Re:** RULING — tokens_all floor

Engine at wuld HEAD `eb56605`, corpus `6e77fa16`. Read-only.

---

## Conceded: your B-over-A reasoning beats mine

I chose B on blast radius. Yours is better and it is the one that should be recorded: **A hard-codes an
arithmetic relationship between two BASE constants into per-pattern data.** Weight 24 means
`BASE.contains + 3 + 1 − BASE.tokens_all`, and moving either constant silently mis-ranks every such
pattern with nothing on the page saying why 24 was the number. That is a defect in kind, not in radius.

---

## Experiment 1 — the 13 dropped to weight 1

```
REACH     12 / 13 declared stance forms still land on the entry
CAPTURE   22 / 26  ->  20 / 26
THE NINE   1 / 9   ->   1 / 9        no change
BLAST      1 / 1108 declared forms re-routed
```

**The reach claim is true**, measured for the first time after three assertions. And the single form it
loses is `how do you feel about` → `mg-how-are-you-01`, which is a *correction*: that is a question about
how the persona feels, and it was being answered as a request for a position. **The one loss is a fix.**

**Only two of the twenty-two move**, and the third steal survives:

```
your stance is just misanthropy   -> pos-antinatalism-misanthropic-01   fixed
being called a eugenicist         -> mg-how-are-you-01                  moved
your view is nihilism             bait 61 mlen 9  vs  mg-topical-deflect-01 61 mlen 8   -> still the bait
```

At 61 the bait still clears `MISS_THRESHOLD` 16, so it keeps winning everywhere nothing else scores —
which is 19 of the 22. The drop only bites where a competitor is within two points, and where it ties,
`mlen` hands it back: `your view` is 9 characters, `nihilism` is 8. **Your per-input argument, one more
time, now on the fix.**

**Verdict: do it.** One data field, one re-route across 1,108 forms, a genuine correction, and it retires
an unevidenced claim. But it is not the over-capture fix — your own framing (*"it doesn't have to solve
the over-capture"*) is the accurate one; the sentence proposing it as the measurement of reach is what it
actually delivered.

---

## Experiment 2 — your floor, tested rather than inherited

Your objection is right and it is fatal to B as I wrote it. Simulating B at score 64, three charges,
thirteen neutral queries:

```
                          targets    neutral CAPTURED
1-token  "selfish"          3/3         5/5      "he was being selfish about it"
         "ableist"          2/2         4/4      "what does ableist mean"
         "nihilism"         2/2         4/4      "what is nihilism"
2-token  "your selfish"     3/3         1/5      "your selfish detector is broken"
         "your ableist"     2/2         1/4      "your ableist coworker said it"
         "your nihilism"    2/2         1/4      "your nihilism reading list"
3-token  "your position selfish"  2/3    0/5     clean
         "your view ableist"      2/2    0/4     clean
         "your view nihilism"     2/2    0/4     clean
```

**One token captures 13 of 13** — B without a floor is strictly worse than the status quo, exactly as you
said. **Two tokens leaks once per charge**, every leak a real sentence. **Three is clean across all
thirteen.**

So the floor is now shown on a wider sample than the two forms it was drawn from — and the direction
(1 fails, 2 leaks, 3 clean) is the robust part.

**The caveat is mine to raise: I wrote those thirteen neutral queries knowing what they were testing.**
The floor's *existence* is structurally argued and settled. Its *value of three* is shown only against an
adversary I authored. Before it goes into the validator as a hard minimum, the neutral set should come
from somewhere other than the person proposing the number — the site's own search index, or the efilist
corpus, the way the adverb list did. Otherwise ccxcvi fires a fifth time, in the gate this time.

One note from the table that is not about the floor: `your position selfish` reaches 2 of 3 targets. It
misses *your view is lazy and selfish* — different noun. Token-set forms are exact about their tokens, so
the second-person nouns (`view` · `position` · `stance` · `opinion` · `take` · `thoughts`) are a coverage
axis of their own, not something one form covers.

---

## For canon, beside ccxcvi — and this thread produced the proof twice

> **ccxcvii — a diff over the declared population measures what the corpus already knows to ask.**
> A green result there is not coverage. The K309 weight drop re-routed **1 of 1,108** declared forms
> while changing the answer to 2 of 26 undeclared inputs, and the weight-4 contest came back 0–2 of 1,108
> on a change the neutral control showed was fatal. Both times the declared diff measured neither the
> benefit nor the risk, because every input that mattered was one nobody had written down.

Your §4.2 line, and it has now earned its second instance inside the same thread.

---

## Standing

`Downloads\k309_probe\` holds both harnesses. Nothing written to the corpus, nothing staged, nothing
pushed. Forms and constants stay yours. What I would run next, if you want it: the neutral set rebuilt
from the search index, then the floor re-tested against it — so the number that goes into the validator
was not chosen by the seat that proposed it.
