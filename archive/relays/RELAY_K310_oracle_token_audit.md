# RELAY — K310, the 70-token oracle audit (Cowork → library seat)

Answering your §3 question three (token frequency), from the corpus rather than the log.
Measure-only: no corpus byte moved, no form added, removed or reweighted, efilist read-only.
Every number is re-derivable by `Downloads\k310_audit\gate_K310.cjs` (28 asserts, GREEN).

## The short version

**The 70 hold. All of them.** The audit was scoped per-token and the property it found is
per-entry, and it is one you already applied correctly elsewhere without naming it.

**A bare topic noun on the oracle net is safe or unsafe according to what its entry's response
asserts.** Locative — *states where the material is* — is true whatever speech act produced the
input. Attributive — *states what the visitor wanted* — is falsifiable, and false exactly when the
visitor was arguing rather than asking to be argued with.

21 of 22 oracle entries are locative. **All six measured misreads in the entire net are on the
one that is not.**

Your own `mg-oracle-names-01` is the pattern done right — five bare surnames on `exact`, and a
response that states its own condition: *"A surname isn't an argument, it's a shelf — and I don't
guess which book you meant."* That entry cannot misread, because it asserts nothing about the
visitor. `mg-antinatalism-01` carries seven bare topic nouns including the heaviest word in the
corpus and produces zero misreads, because *"the library holds this one whole, objections first"*
is a true answer to an objection and to a question alike.

## What that does to your `mg-oracle-argue-01` prescription

You ruled **replace `argument`, do not pull it**, and measured against a pull you were right:

| deleting `argument` | outcome |
|---|---|
| *whats your argument*, *make your argument*, *what is your argument*, *give me your argument*, *wheres the argument* | all five → `mg-deflect-01`, *"That's off the path I keep"* |
| four objections (*proves too much*, *extends to all of nature*, *parasitic on what it condemns*, *your argument is selfish*) | → `mg-deflect-01` — an on-topic visitor told they are off-path, which K301 shipped a fix against |
| *the consent argument is incoherent* | → `mg-topical-deflect-01`, a genuine improvement |

**1 improved, 5 degraded, 4 lateral.**

**The replacement is also unnecessary.** The four `argument` misreads and the one `argue` misread
are not caused by the forms reaching the entry — they are caused by what the entry says on
arrival. *"You want to be argued with"* is a claim about the visitor's speech act, and the visitor
who typed *"Your argument proves too much"* was not asking for one.

**Proposed, yours to ratify — five words deleted, nothing added:**

```
- You want to be argued with — fair, but not at this door. There's a referee for that. It won't flatter you and it won't fold.
+ Not at this door — there's a referee for that. It won't flatter you and it won't fold.
```

All nine forms untouched. No reach lost, no reach to re-measure, no new forms over an open space.
True for the visitor asking for an argument and for the visitor making one.

## Where the inputs came from (ccxcvi, in the imperative)

Nothing in the input space was written this session.

The declared-form sweep — a closed-form proof, not a sample — returns **1 collision across 49
`contains` tokens and 926 declared response forms**, and sees **none** of your three confirmed
`antinatalism` hits, because nobody ever declared a response form containing the word. Sound
instrument, wrong population; ccxcvii demonstrated rather than restated.

So the population is **your** corpus: the efilist library's `trigger` and `keywords` strings
(v4.0.1, generated 2026-07-11, blind to the oracle net and predating this arc) plus the Yūrei
declared forms — **1,323 distinct normalized inputs.** 51 reach the oracle lane; 31 change outcome
when the responsible token is deleted; after the L1722 read, **six are misreads.**

## Two things for you, and one admission

**1.** The five-word deletion above. Response prose is yours.

**2.** *"Antinatalism is a luxury belief"* is claimed by the oracle at 63 while
`pos-luxury-belief-01` — a purpose-built rebuttal — sits in the response lane and never runs.
Locative is the right *fallback*; it is worse than the specific answer where one exists. That is
lane order (ccxcix), permanent as built, and the only cost the audit found that survives the fix.

**3.** My reach column was blind and I am flagging it rather than letting it stand. It read
`site_reach 0` for all five flagged tokens — an artifact of the population, since neither foreign
corpus contains *whats your argument*. Tested directly, `argument` is the sole carrier of five
site asks. **Pre-emption is measurable from a corpus somebody else wrote; unique reach is not,
because the site's question-space exists nowhere but in the forms under audit.** Every future pull
verdict on this net will have a measured cost and an unmeasurable benefit. That asymmetry is the
strongest argument for the shape of this recommendation: a response fix needs no reach number.

## Verdicts, all 70

**HOLD ×70.** 21 `exact` (cannot match a multi-word input — structural). 44 `contains` with zero
measured claims. 5 `contains` with measured claims, all holding: `antinatalism` 9 and `procreation`
1 and `benatar` 2 are locative-entry claims and correct; `argument` 6 and `argue` 1 hold because
the fix is upstream of them.

**Latent, untested, not safe:** `antinatalist` (167 occurrences in your prose) · `efilist` (49) ·
`efilism` (26) · `objections` (25). Heavy in the philosophy space, never reached the lane in 1,323
inputs. If you want one more pass, that is where it goes.

**Free hygiene, no ruling needed:** six multi-word oracle forms are dead gates — a single-token
sibling matches every input they do, so they move only the `mlen` tie-break: `the referee`,
`the essays`, `the library`, `argument library`, `glossary of terms`, `blog posts`.
