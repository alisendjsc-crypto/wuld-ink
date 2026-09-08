# HANDOUT — the four rulings, authored and gated. For K300 (or K301) to fold.

**Josiah ruled 2026-09-08: "go with your recommendations on all of the above."** Everything below
is built and measured against the landed K299 engine (`37d0bab`). **Nothing here has been shipped
— K300 is in flight and only one session moves HEAD.** Whoever folds this runs the script, runs
the gates, and ships it as its own commit.

Apply with: `python3 tools/omega/k300/fold_k300_rulings.py src` (script beside this file; place it
at `tools/omega/k300/` so the change stays re-derivable, per ccxliv).

## SEQUENCING — read this first

**K300 is in flight in another session and has its own `ship-K300.ps1` in this folder.** That
session ships the vessel; this handout is a separate commit and goes AFTER it. Two sessions must
not both move HEAD.

Every number below was measured against **`37d0bab`** (the K299 landing). K300's vessel is scoped
to UI on `/successor/` and should not touch a corpus — but if it does, or if anything else lands
first, **re-derive the anatomy figures before trusting them**. The fold script itself is safe
either way: it asserts every anchor entry exists, skips anything already present, and is
idempotent. It will fail loudly, not silently.

The three numbers to re-derive if HEAD has moved: entries `185 -> 187`, forms `850 -> 872`, and
the audit's anatomy baseline.

---

## 1 · `c-crisis-harm-other-01` — AUTHORED

You reassigned the drafting to me after the seat declined to write shared-floor bytes
unilaterally. Written in the established floor register (plain interface text, out of character,
resource first, no house voice), `b3_passage`, **270 chars, pure ASCII**:

> Out of character for this one too. If someone is in danger right now, contact emergency
> services. If it is the pressure underneath you want help with, in the US call or text 988;
> elsewhere findahelpline.com lists a local line. Saying it to a person beats saying it here.

**Why emergency services is named first.** The risk is to a third party and imminence governs.
988 is the Suicide & Crisis Lifeline — a general emotional-crisis line, and the right pointer for
the distress underneath, but not the right *first* pointer when another person may be in danger.
The corpus already models this ordering: `c-crisis-03` says *"contact emergency services, or in
the US call or text 988."* This entry follows it.

**What it deliberately does not do:** accuse, moralise, roleplay through it, or make any claim
about what the page does with the sentence. No "this has been logged."

Eight `contains` forms at weight 9/8: `going to hurt someone` · `want to hurt someone` ·
`going to hurt somebody` · `want to hurt somebody` · `going to kill someone` ·
`want to kill someone` · `going to hurt them` · `hurt someone else`.

**Goes in BOTH corpora, byte-identical** — the inherited-floor invariant `omega-persona-gate`
asserts. Floor becomes **4 entries / 37 forms**.

## 2 · `mg-never-born-01` — the seat's draft, verbatim

197 chars, `b3_passage`, class `response`, `href: /argument-library/`. **Correction to my earlier
note:** I said response entries carry no `href`. Wrong — **106 of 154 do**. The seat's spec was
right as written.

> Taken as a claim, that one is the house's whole subject — it gets argued at the library, not
> waved off. Taken as a report on where you are, say it plainly as that and the script stands
> down for it.

Six forms: `wish i had never been born` · `wish i was never born` · `wish i were never born` ·
`should never have been born` · `never asked to be born` · `did not ask to be born`.

All six deflected before; the entry is purely additive with no re-route risk.

**`i never asked to be born` belongs here, not with the consent entries** — I checked. Those
(`pos-consent-incoherent-01`, `pos-consent-both-ways-01/02`) are keyed on the *argument*
("consent requires a subject"), never the first-person report. Different object.

**The precedence check that matters, and it passes:** `i wish i had never been born and i want to
die` → `c-crisis-01`. The floor still wins. The bridge never intercepts a floor input.

## 3 · `mg-worth-living-01` — amendment DECLINED, real defect fixed instead

**No stand-down clause.** It would be the fourth body carrying it, which is exactly the threshold
the seat's own §5 item 6 asks to flag — and `mg-worth-living-01` is a nav pointer with an `href`,
not a help answer. Bolting a stand-down onto a signpost tells someone asking the house's central
question that they've been read as a symptom.

**But the entry did have a real defect, and it wasn't the one under discussion.** The `whats`
normalizer exclusion (K299, kept to protect two Yūrei site entries) costs exactly **8 named
misses**, and `mg-worth-living-01` is one of them: `what is the point of life` **deflected** while
`whats the point of life` reached the library.

Fixed page-locally by declaring the expanded spelling on each affected entry — **not** by
loosening the map, which would reintroduce the Yūrei regressions. All eight:

| entry | added form |
|---|---|
| `mg-how-many-01` | `what is in the corpus` |
| `mg-why-successor-01` | `what is a successor` |
| `mg-when-positions-01` | `what is the point of you` |
| `mg-worth-living-01` | `what is the point of life` |
| `mg-how-are-you-01` | `what is up` |
| `mg-utility-01` | `what is 22` |
| `mg-nav-changelog-01` | `what is new` |
| `pos-policy-proposal-01` | `what is your actual plan` |

The fence entry `mg-how-many-01` was among the misses — *"Counted, not published"* was itself
unreachable in its expanded spelling.

## 4 · `/book/` cover cap — option D

One rule, page-local, in `src/book/index.html`:

```css
.book-cover { max-width: 18rem; }                        /* was 24rem */
@media (max-width: 640px) { .book-cover { max-width: 14rem; } }
```

| | phone purchase link | desktop title block | desktop purchase |
|---|---|---|---|
| today (24rem) | 1295 = **1.53 scr** | **910** (below fold) | 1441 = 1.60 scr |
| **option D** | 1183 = **1.40 scr** | **766** ✓ | 1297 = **1.44 scr** |

Restores the K3 intent on desktop and lifts the phone. Cost: the cover shrinks 575 → 431 desktop,
447 → 335 phone.

**Gate shape for this one is NOT the strict zero-delta fingerprint** — the change is *supposed* to
move desktop. Use the K297 region form. Measured at all six widths (1280/1440/1024/900/768/641):
**nodes 146/146 identical, 99 deltas, and every one classified position/height-only — 0
style-or-structure changes.** The cover shrinks and everything below shifts up. Nothing restyles,
nothing reorders, nothing is added.

---

## Gates — measured on the candidate, all green

| gate | result |
|---|---|
| `yurei-parity.cjs` | GREEN — JS reproduces the python harness bit-for-bit |
| `omega-persona-gate.cjs` | GREEN — *floor inherited*, bleed 0, 106 positions provenance-stamped |
| `mrgrey-register-gate.cjs` | GREEN — **6,134 checks** |
| `coverage_audit.cjs` | **fatal=0**, self-match **99.20 % of 872 forms**, **undeclared steals 0** |

**Full route diff over every baseline form: `843/843`, `378/378`, `326/326` — ZERO re-routes.**
Every form that worked still lands exactly where it did. Diffs are purely additive:
mrgrey **+139 / −0**, yurei-public **+54 / −0**. Nothing removed, nothing modified.

Corpus goes **185 → 187 entries, 850 → 872 forms**. `mrgrey: 187/872`, `yurei-public: 166/386`.

**One baseline must move with the fold:** `coverage_audit.cjs`'s anatomy assertion,
`185 entries / 850 patterns` → `187 / 872`. That is an expected consequence of a ratified change,
not a defect — update it visibly, and change nothing else in the assertion.

## Order of operations

1. `python3 tools/omega/k300/fold_k300_rulings.py src`
2. `python3 tools/omega/k299/respell.py src` — canonicalises any new form. Measured no-op here
   (all forms authored pre-normalized), but run it: the pre-normalized corpus law is asserted.
3. Update the audit anatomy baseline to `187 / 872`.
4. Four house gates. **Call `coverage_audit.cjs` with NO ARGUMENTS** (cclxxv — PowerShell drops
   empty-string args and its argv is `A[0]=corpus … A[3]=out`, so `"" "" "" $out` reads the file
   it means to write; that killed a K299 ship).
5. `/book/` is a separate concern — fold it with the corpus or on its own, but gate it with the
   region form, not the strict one.
