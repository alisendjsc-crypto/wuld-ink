# TX15-BACK — Cowork verification pass (K298 close, 2026-09-07)

**Every number below was re-derived against the real engine** — `src/components/yurei-oracle.js`
`require`d byte-identical, `src/components/omega-corpus-mrgrey.json` (184 entries, 833 declared
forms), a **fresh `Matcher` per probe** so dampening cannot skew a result. Nothing was folded.
Nothing in `src/` was touched.

The seat's verdict **holds**: Ask C is the item, and it outranks the vessel. Six specifics do not
survive contact with the engine, and one of them changes an ask.

---

## 1 · §0 — RULING IS ANSWERABLE. Fold it. Measured, not guessed.

The seat's condition was: *"Re-run the audit against the amended normalizer and diff the
self-match control. If the diff is clean, §3 shrinks. If not, I withdraw."*

**The diff is clean.**

| normalizer | self-match | failures | **undeclared steals** |
|---|---|---|---|
| baseline (shipped) | 99.2 % | 7 | **0** |
| hyphen → space | 99.2 % | 7 | **0** |
| contraction expansion | 99.2 % | 7 | **0** |
| **both (the §0 proposal)** | **99.2 %** | **7** | **0** |

**Why it is safe, and this is the load-bearing fact:** of 833 declared forms, **0 contain a
hyphen, 0 contain an apostrophe, 0 contain an uppercase letter.** The corpus is already written
in normalized spelling. There is nothing in it for the amendment to desynchronize.

### The trap, which is not in TX15-BACK and which would have shipped broken

`patternMatch()` compares **`pat.form` RAW** against the normalized input — corpus forms are
never put through `normalize()`. So an amendment applied to the input path alone transforms one
side of every comparison and not the other.

I proved this by getting it wrong first: my first cut expanded the input only and reported
**51 new undeclared steals** and self-match collapsing to 93.2 %. Every one was an artifact.
Normalizing the form as well — a one-line change, `var form = normalize(pat.form)` — returns
0 steals.

**So the amendment is two lines, not one, and shipping only the first is worse than shipping
neither.**

### What it actually buys, on today's corpus

Narrow, and one line justifies it alone:

| input | today | amended |
|---|---|---|
| `do not want to live` | `mg-deflect-01` | **`c-crisis-01`** |
| `you are depressed` | `mg-deflect-01` | `pos-just-depressed-01` |

Someone typing *"I do not want to live"* instead of *"don't want to live"* is currently told
*"That's off the path I keep."* That is the amendment's whole case.

**Two cautions.** `cherry-picking` still deflects after the fix — that objection is not in the
corpus at all, so §0's own example does not demonstrate §0; it is a §3 fold. And `cant` was
deliberately held out of the expansion map because *cant* is an ordinary English word — so
`cant go on` and `cant do this anymore` are **not** fixed by the normalizer and still need
explicit floor forms. The same exclusion logic bars `were`, `well`, `ill`, `id`, `its`, `hell`,
`wed`, `shed`: expanding `were` → `we are` would destroy `wish i were dead`.

---

## 2 · Ask C — the direction is right, the number is wrong, and the truth is worse

**Claimed:** 22 distress-adjacent phrasings answer with `mg-deflect-01`.
**Measured, on the 18 phrasings §4 actually lists:** **12 deflect, 6 already reach the floor.**

The count is lower. The finding is worse, because the failures sit *one word* from the hits:

| reaches the crisis floor | deflects — "That's off the path I keep." |
|---|---|
| `dont want to live` → `c-crisis-01` | `dont want to be alive` |
| **`wish i was dead`** → `c-crisis-01` | **`wish i were dead`** |
| `end my life` → `c-crisis-01` | `take my own life` |
| `end it all` → `c-crisis-03` | `not be here anymore` |
| `going to hurt myself` → `c-crisis-02` | `i am not safe` / `im not safe` |
| `want to hurt myself` → `c-crisis-02` | `cant go on` / `cant do this anymore` |

**`wish i was dead` catches and `wish i were dead` does not.** The floor punishes the subjunctive
— the same "careful typist" the seat's §0 identified, arriving at the worst possible door.

Also confirmed: `im going to hurt someone` → `mg-deflect-01` (third-party gap is real), and
`i wish i had never been born` → `mg-deflect-01` (it reaches nothing today, so the §4 bridge is
additive, not a re-route). `life isnt worth living` → `mg-worth-living-01`, as stated.

The floor as it stands is three entries, six forms each:
`c-crisis-01` want to die · kill myself · end my life · dont want to live · better off dead · wish i was dead
`c-crisis-02` suicide/suicidal · self harm · harm myself · hurt myself · cut myself · hurting myself
`c-crisis-03` end it all · take my life · dont want to be here · kill me · no reason to live · suicidal

---

## 3 · Ask A — chip 3's id is wrong; chip 4's justification is wrong

The seat asked Cowork to verify all four chips against the matcher before ship. Done:

| # | chip | seat says | **measured** |
|---|---|---|---|
| 1 | `What are you?` | `mg-what-are-you-01` | OK |
| 2 | `Where do I start?` | `mg-oracle-nav-01` | OK |
| 3 | `Your view is ableist.` | `ableist-objection` | **`pos-ableist-objection-01`** — routes to a signed position as intended, but that id does not exist |
| 4 | `Salve` | `mg-greet-04` | OK |

**Chip 4's stated reason does not hold.** `mg-greet-04` is *not* near-unreachable: `salve`,
`welcome` and `good day` all reach it directly today. The chip may still earn its place as house
texture, but it is not a rescue, and §1's "becomes reachable through the help chips" should be
struck.

---

## 4 · §1 — one of the two declared ties is not a tie

| form | seat says | **measured** |
|---|---|---|
| `see a therapist` | tie → `mg-hostile-05` | **confirmed** — the routing law applies |
| `youre depressed` | tie → `mg-hostile-05` | **already routes to `pos-just-depressed-01`** — no ruling needed |
| `edgelord` | → `mg-hostile-02` | **confirmed** — the law applies |

The routing law still earns ratification on `see a therapist` and `edgelord`. But `youre
depressed` is already decided correctly, and the interesting thing about it is the *other*
spelling: **`you are depressed` deflects today** and is fixed by §0, not by the routing law.

---

## 5 · §3 — confirmed as written

- **`community` → `mg-nav-chat-01`: confirmed**, and it is a `contains` form, exactly as
  described. `your community` also lands there. The demote-to-`exact` ruling is well-founded.
- **Rider edit i confirmed:** `mg-oracle-nav-01` carries `help` as an `exact` form (15 forms total).
- **Rider edit ii confirmed and stronger than stated:** all four proposed widenings —
  `can you help`, `help please`, `need help`, `i need some help` — **deflect today**.
- `mg-oracle-help-01`, `mg-never-born-01` and `c-crisis-harm-other-01` are all **absent**; all
  three are new entries, none is a re-route.

---

## 6 · What Cowork owes the seat

The inflected-trigger sweep list (§5 item 5) is not in this pass — it needs the class sweep run
across the objection corpus, which is K299 work once §0 lands. It will come with the fold receipt.

---

## 7 · The two corpus copies have drifted — and the floor has not

| file | bytes | entries | mtime |
|---|---|---|---|
| `src/components/omega-corpus-mrgrey.json` (repo) | 287,795 | **184** | 2026-07-22 09:17 |
| `Downloads\Successor Protocol\omega-corpus-mrgrey-entries.json` | 234,684 | **172** | 2026-07-22 07:07 |

**95 shared ids differ.** Every id missing from the Successor copy is a `pos-*` objection present
only in the repo (`pos-boonin-critique-01/02`, `pos-bradley-no-subject-01/02`, `pos-care-ethics-01/02`,
`pos-contractualism-scanlon-01/02`, …); nothing exists only in the Successor copy. Two hours older,
strict id subset: it is a **stale July export**, not a live second corpus. The repo copy is canonical.

**The crisis floor is byte-identical in both** — 3 entries, same forms, same weights. So Ask C folds
against one file and owes no reconcile. Worth stating plainly because "shared floor, both corpora
together" in TX15-BACK §4 could otherwise be read as requiring a two-file fold that the bytes do not.
