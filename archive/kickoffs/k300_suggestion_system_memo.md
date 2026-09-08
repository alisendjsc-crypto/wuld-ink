# The suggestion system — a measured design memo

**K300, 2026-09-08. Nothing in this document is built. No byte of `src/` moved for it.**

Josiah's To Do carries the ask:

> *help / cheat sheet for successor protocol algorithm / script — that gives suggestions or hints — for when a user doesn't know exactly what to say and predicts what they might be looking for*

K300's `[ ? ]` chips are **not** this. They are four fixed strings read off `mg-oracle-help-01`'s
`hints` array. What is described above is *predictive*: read the miss, infer the intent, offer the
phrasing. This memo prices that.

---

## Recommendation, first

**Fold the §3 phrasings. Do not build a predictor.**

I went into this session expecting the measurement to overturn that prior. It did not — it
strengthened it, and it corrected two of my own numbers on the way. The short form:

| | the §3 fold | a similarity predictor |
|---|---|---|
| of the 54 site-own phrasings that miss today, how many get answered | **54** (45 clean, 9 need a one-line ruling) | **35** in top-4, **30** at top-1 |
| how often it confidently hands over four *wrong* objections | never | **10 of 54** (19 %) |
| lines added to the shared engine | **0** | a new similarity metric |
| JS/python parity contract | untouched | **moves**, and `yurei-parity.cjs` gates it |
| new gate owed | none | at least one |
| does the proxy start volunteering its own coverage map | no | **yes** |

A predictor is the expensive, probabilistic answer to a coverage problem. The coverage problem has
a cheap deterministic answer that is already queued.

The one thing the fold does *not* do is help a visitor who invents wording the site never uses.
That residual is real and it is addressed at the end — by shape (b), not by a predictor.

---

## 1 · The finding that decides the design

**This matcher has no notion of "close." Re-derived at K300, and it is stronger than the estimate
the session prompt carried.**

`entryScore` returns `BASE[mode] + weight`, or `0`. `BASE` is `{exact:100, contains:60,
tokens_all:40, tokens_any:15}`; declared weights are 1, 2, 3, 8, 9. A pattern either matches by
whole-token containment or exact equality, or it contributes nothing at all.

The score alphabet actually realized across all 850 declared forms:

```
24 ×1    61 ×2    62 ×294    63 ×431    68 ×9    69 ×19    101 ×46    102 ×47    103 ×1
```

`MISS_THRESHOLD` is **16**. The smallest realized score is **24**. The threshold is inert — it can
never separate a near-miss from a miss, because nothing ever lands between them.

*(Correction to the prompt: the alphabet was given there as `61,62,63,101,102,103`. Nine values are
realized, not six — `24`, `68` and `69` are also live. The reading is unchanged; the list was not.)*

**And the crucial number, measured at n=1102 rather than at the prompt's n=3:**

> Of the **1,102** probes in the K299 audit's own subject-coverage set that miss today,
> **1,102 — 100.0 % — score `0` against all 185 entries.**

Not "mostly." Every one. `the asymmetry is wrong`, `suffering builds character`, `what about happy
people` and `cherry picking` are arithmetically identical to `zzz qqq wumbo` on a site whose subject
is those four sentences.

**So a "did you mean" cannot be built by surfacing a runner-up. There is no runner-up.** The score
vector is not a gradient with a low peak; it is a vector of zeros. Any suggester needs a *new*
similarity metric — token overlap, edit distance, or a stemmed index — added to the shared engine.
That is not a UI feature. It is an engine change, and the parity contract moves with it.

---

## 2 · The size of the hole, measured

From the K299 audit's own probe set, by source:

| source | n | misses | |
|---|--:|--:|--:|
| library-title (the site's own objection titles) | 274 | 151 | 55.1 % |
| page | 44 | 29 | 65.9 % |
| glossary | 22 | 18 | 81.8 % |
| heading | 206 | 186 | 90.3 % |
| library-keyword | 696 | 646 | 92.8 % |
| aux-wing-id | 50 | 48 | 96.0 % |
| void | 25 | 24 | 96.0 % |

The row that matters is the first. **The site's own titles for its own signed objections** — the
words a visitor reads on the page and types back — miss **55 %** of the time.

Narrowed to the §3 target: **34 signed objections have at least one title phrasing that deflects,
totalling 54 phrasings.** (TX15 said 52; the current count is 54. §0 shrank some of this job and the
audit's own baseline moved at K299 — re-derive before folding, do not copy either number.)

**All 54 score zero everywhere.** There is nothing for any runner-up mechanism to find.

---

## 3 · Three shapes, each with its enumeration cost stated plainly

First, a correction to how the enumeration risk is usually stated here, because it changes the
argument:

> The library index publishes **82** objections. The proxy signs **53** of them across **106**
> provenance-stamped position entries. **29 published objections the proxy does not hold.**

A prober does not need a suggester to walk that. The titles are public. Typing all 82 published
titles and noting which deflect maps the proxy's coverage in **82 probes using only public
information** — today, against the current build, with no cleverness at all.

So `mg-how-many-01`'s fence — *"Counted, not published. The set stays useful by being met, not
mapped."* — is not an information-theoretic claim. It is a claim about the proxy's **mouth**. The
fence is that the proxy does not *volunteer* the map. That distinction survives everything below,
and it is the reason shape (c) fails even though the "walkable" objection is weaker than it looks.

### (a) Static rotating chips

Extend K300: rotate a larger declared pool through the same four slots.

- **Enumeration cost to a prober:** the pool size, one probe each. A 20-string pool is exhausted in
  20 taps. But nothing is *inferred* — the visitor learns only what was deliberately declared.
- **Adaptivity: none.** Does not read the miss. Does not help the visitor who typed something real
  and got nothing — which is the entire complaint.
- **Engine surface: zero.** Corpus-only, `hints` already ignored by the engine.

### (b) Kind-level response

On a miss, name the *kinds* of thing held — never an entry, never a count. This is what
`mg-oracle-help-01` already does in prose: *"I answer for what this is, where the pages sit, and
objections that were argued out in writing and signed."*

- **Enumeration cost: zero.** A kind is not a member. No probe distinguishes two objections.
- **Adaptivity: partial.** It can be miss-triggered — the deflection pool could route a *long,
  objection-shaped* miss to a kind-level line rather than the generic deflection, using input shape
  (length, question-form, first-person) and not corpus similarity. That needs no new metric.
- **Engine surface: near zero.** A routing rule in the MISS lane, or a new deflection-pool entry.

### (c) Similarity-gated suggestion, capped and thresholded

The thing actually asked for. Measured against the 54 phrasings it exists to serve, cap 4:

| overlap threshold | stopwords | fires | top-1 correct | in top-4 | **fires, all 4 wrong** | silent |
|---|---|--:|--:|--:|--:|--:|
| ≥34 % | kept | 45 | 30 | 35 | **10** | 9 |
| ≥50 % | kept | 44 | 29 | 34 | **10** | 10 |
| ≥67 % | kept | 22 | 15 | 18 | **4** | 32 |
| ≥34 % | stripped | 47 | 27 | 39 | **8** | 7 |
| ≥50 % | stripped | 47 | 27 | 39 | **8** | 7 |
| ≥67 % | stripped | 31 | 17 | 23 | **8** | 23 |

Best case is the ≥34 % stopword-stripped row: **39 of 54 in top-4, 8 confidently wrong, 7 silent.**
Raise the threshold to buy precision and it goes silent on 23 of 54 — it stops being a suggester.

**How a prober walks it, exactly.** Feed single words the corpus itself uses and read what comes
back. Greedy cover of all 106 positions:

| suggester | cap | probes | positions surfaced |
|---|--:|--:|--:|
| any shared token (naive) | 1 | 17 | 106 / 106 |
| ≥34 % overlap | 4 | 25 | 30 / 106 |
| ≥50 % overlap | 4 | 23 | 28 / 106 |
| ≥67 % overlap | 4 | 6 | 6 / 106 |

**What the cap costs the prober: almost nothing.** Going from cap 1 to cap 4 changes the ≥50 % walk
from 28 probes to 23 — the cap limits what one probe *shows*, not what a sequence of probes
*accumulates*. A cap is a display rule, not a defence. This is worth saying plainly because "capped
and thresholded" reads like mitigation and the threshold is doing all of the work; the cap is doing
none of it.

**Why (c) still fails, given that the set is already walkable in 82 public probes.** Not because a
prober learns something otherwise unlearnable. Because the proxy would be the one saying it. The
difference between *a visitor discovers by probing* and *the proxy hands over its own coverage map*
is exactly the difference `mg-how-many-01` was written to hold, and it is a register ruling, not an
engineering trade-off. That ruling is Josiah's and the seat's, not a build call — which is why
this memo stops here rather than proposing a threshold.

---

## 4 · The staked recommendation

**Fold §3. It is already queued, it is cheap, it adds no engine surface, and it cannot be walked.**

The fold's shape, sized this session against all 850 declared forms:

- **54 phrasings across 34 signed objections**, median 1 per objection.
- **45 fold clean** — no containment relation with any existing declared form. These are ordinary
  `contains` additions on their own signed positions.
- **9 need a ruling before they are forms at all**, because each would swallow an existing declared
  form:

  ```
  knowledge                -> swallows "all our knowledge will be lost"  (pos-extinction-culture-02)
  civilization             -> swallows "human civilization will end"     (pos-extinction-culture-02)
  net positive             -> swallows "my life is net positive"         (pos-joy-outweighs-harms-02)
  music                    -> swallows "what about music"                (pos-love-beauty-art-01)
  marxist objection        -> swallows "the marxist objection"           (pos-marxist-materialist-02)
  less violence than ever  -> swallows "there is less violence than ever"(pos-pinker-better-world-01)
  enlightenment now        -> swallows "read enlightenment now"          (pos-pinker-better-world-02)
  nazi eugenics            -> swallows "this is nazi eugenics"           (pos-slippery-slope-eugenics-02)
  social contract          -> swallows "the social contract"             (pos-social-contract-02)
  ```

  My read: **do not fold the bare ones.** `knowledge`, `civilization`, `music` and `social contract`
  as `contains` forms would capture half the site's vocabulary — they are index terms, not things a
  visitor says. The other five are already reachable through the longer form they would swallow.
  That is a ruling for the seat, and it is one line: *bare index terms are not trigger forms.*

- **Engine surface added: 0. Parity contract: untouched. New gate: none.** The existing four house
  gates cover it, and `coverage_audit.cjs` §3 self-match against `coverage-audit-K299.json`
  (99.18 % of 850, undeclared steals 0) is the acceptance test — steals stay at 0 or the fold is wrong.

**And then, separately, shape (b) for the residual.** The fold answers the visitor who types what
the site says. It does nothing for the visitor who invents their own wording, and we cannot size
that population: the Gap Log is wired into this surface **zero** times, so there are no logs. That
is the honest limit of every number in this memo — all 1,102 probes are *site text*, not visitor
text. A miss-triggered kind-level line costs no new metric, leaks no member, and is the only shape
here that improves for a visitor whose words the corpus has never seen.

**If Josiah wants a predictor anyway, the order is fixed:** the fence ruling comes first (does the
proxy volunteer its coverage, yes or no), then the metric, then the parity contract, then the gate.
That is K301 at the earliest, and it needs the ruling before any of it is worth designing.

---

## Provenance

Every number here was measured this session against `src/components/yurei-oracle.js` (`7583b376`)
and `src/components/omega-corpus-mrgrey.json` (`f0e02187`, 185 entries / 850 forms), with a **fresh
`Matcher` per probe** (K260) or by direct `entryScore` scan where the matcher's lane logic would
have masked the score. Audit baseline: `tools/omega/coverage-audit-K299.json` (`31f901dc`).
Scripts: `k300-hole.cjs`, `k300-hole2.cjs`, `k300-hole3.cjs` (this folder).
