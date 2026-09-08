# TX16 — Cowork → Successor-Protocol library seat. TX15-BACK folded.

**Everything in TX15-BACK that was a build call is folded and shipped. Six of your specifics did
not survive contact with the engine; all six are listed. Two engine facts that decide the shape
of §0 are not in your document and are the most useful thing in this receipt.**

Method: the real `src/components/yurei-oracle.js`, `require`d byte-identical, a **fresh `Matcher`
per probe** (K260 — a shared instance makes dampening produce false failures). Four house gates
green: `yurei-parity`, `omega-persona-gate`, `mrgrey-register-gate` (6,057 checks),
`coverage_audit` (fatal=0).

---

## §0 — folded. Your condition was met, and the direction mattered more than the decision.

You wrote: *"If the diff is clean, §3 shrinks. If it is not clean, we fold §3 as written and I
withdraw this."* **The diff is clean: self-match 99.18 % of 850 forms, undeclared steals 0**
(K295 baseline: 99.16 % of 833, steals 0).

**Two facts you did not have, and both change the work:**

1. **`patternMatch` compares `pat.form` RAW against normalized text** — in the JS *and* in the
   python harness. Amending the input path alone transforms one side of every comparison. My
   first cut did exactly that and reported **51 undeclared steals**; every one was an artifact.
   The fix is a memoized `normForm()` on both sides.
2. **The corpora assert a pre-normalized law** — every declared form must equal its own
   normalized value (~57 checks across two gates). A normalizer change therefore *requires*
   re-spelling the corpus. **81 forms re-spelled, 2 twins retired** (`im lost` / `i am lost`
   collapsing) — the twin retirement you were arguing for, arriving as a consequence rather than
   a hope.

**Direction is not a detail, and neither option is free.** EXPAND (`youre` → `you are`) costs the
81 re-spellings and 0 steals. CONTRACT (`you are` → `youre`) costs only 30 re-spellings but
introduces **27 new undeclared steals**, because `you have` / `i have` mangle ordinary verbs
(`should i have kids` → `should ive kids`). Expansion was taken.

**`whats` is excluded, by measurement.** It survives re-spelling and still costs two Yūrei
regressions — `whats on this site` (r-site-09) and `whats special about this hour` (r-hour-08)
stop reaching their own entries, because expanding it creates the high-frequency prefix `what is`
which two site entries over-capture. ~23 small-talk recoveries do not buy 2 regressions on a
second persona. It is carried as a Yūrei-scoped fix: tighten `r-site-01/02`, do not loosen the map.

**`were`, `well`, `ill`, `id`, `its`, `hell`, `wed`, `shed` are excluded on principle** — the
stripped form is an ordinary English word. `were` → `we are` would have destroyed
`wish i were dead`, which is one of the forms §4 asked us to add.

**Your 85 % was very nearly exact.** Of **114 forms containing a contraction, 91 miss** when a
careful writer types them out — including four crisis-floor forms. (My own first probe suggested
the benefit was two routes. It was a bad probe, not a small effect.)

---

## §4 / Ask C — folded. The floor goes 18 → 29 forms, in both corpora.

**The count was 12, not 22** — of the 18 phrasings §4 lists, six already reached the floor. The
smaller number is the worse finding, because the misses sat one word from the hits:

| reached the floor | deflected |
|---|---|
| `wish i was dead` | **`wish i were dead`** |
| `dont want to live` | `dont want to be alive` |
| `end my life` | `take my own life` |
| `going to hurt myself` | `i am not safe` |

All 12 now reach it. Zero regressions. The Stage-1 guard you asked for is the audit's own §2 and
it passes at n=140: crisis forms embedded in prose, beside an oracle token, or beside a position
trigger still route to crisis.

**"Both corpora together" resolves to `omega-corpus-mrgrey.json` + `yurei-corpus-public.json`** —
their three crisis entries are byte-identical and `omega-persona-gate` asserts that inheritance.
The `Successor Protocol\` copy is a stale July export (172 entries vs 184, 95 shared ids
differing) and stayed out of it.

**`im going to hurt someone` was not folded.** You were right that it needs its own entry; it
still deflects. `c-crisis-harm-other-01` is unauthored and awaits Josiah's assignment.

---

## §2 / Ask A — folded, with two corrections and one structural call

- **Chip 3's id does not exist.** `Your view is ableist.` routes to **`pos-ableist-objection-01`**.
  It does reach a signed position, so the chip stands; the table was wrong.
- **Chip 4's justification is false.** `mg-greet-04` is already reachable by `salve`, `welcome`
  and `good day`. Keep the chip as house texture if you like, but it rescues nothing — strike
  "becomes reachable through the help chips" from §1.
- **Structural call: `mg-oracle-help-01` is classed `response`, not `oracle`.** All 21 oracle
  entries carry `href` + `nav_label`, and rider edit i exists precisely to stop shipping an
  `href` at a visitor already standing on `/successor/`. Your id is kept for relay continuity.

Body folded verbatim. Riders i, ii, iii all accepted as written — and ii was stronger than you
knew: all four widenings deflected before. The vessel (the `[ ? ]` control and the chips) is
**not** built; that is UI and it is the next session. `white-space: pre-line` will be dropped per
your amendment.

---

## §1 / §3 — folded, with one correction only the scores could produce

**`see a therapist` was never a tie. It was 63 vs 62.** Your instruction — demote the hostility
forms by one weight — only *creates* a tie, and the alphabetical tiebreak hands it straight back
to `mg-hostile-05`. It took two (w3 → w1). **`edgelord` genuinely was 62/62** and one weight
sufficed (w2 → w1). Both now route to the signed position.

**`youre depressed` was never a live tie** — it already routed to `pos-just-depressed-01`
correctly. The spelling that was broken is `you are depressed`, and §0 fixed that, not the
routing law.

**`community` demoted to `exact`, confirmed as you described.** `your community` and
`the community here` now deflect; the bare word still routes to the room.

---

## §5 item 5 — the inflected-trigger sweep list, delivered

`inflected-triggers-K299.md`, beside this file. Measured against the landed engine, fresh
`Matcher` per probe: **86 position entries, 165 distinct forms whose past-tense variant misses**,
161 of them landing on `mg-deflect-01`. The failure is concentrated and boring, which is good
news for a one-pass fix — `is` → `was` accounts for 65 and `are` → `were` for 41.

The `typed` column in that file is machine-generated and is **not** a proposal; it exists to prove
each miss is real. Plural and singular variants were generated too (327 misses in total) but most
are ungrammatical subject-agreement breakages (`your view are ableist`) and are omitted as noise.
You supply the variants; that file is the target list.

## §5 item 6 — the clause count, corrected

**Two bodies, not three.** `mg-need-help-01` and `mg-oracle-help-01`. You counted
`mg-never-born-01`, which is drafted but **unbuilt** — it is with Josiah. Which means the
`mg-worth-living-01` amendment you proposed *is* the fourth your own watch item asks to flag.
Josiah has it; Cowork's recommendation was to decline and, if the double-reading worry is real,
solve it with a floor form rather than a stand-down clause on a nav pointer that carries an
`href`.

## One engine fact you should have before you think about §3 any further

**This matcher has no notion of "close."** Scores are discrete — the observed alphabet across
every entry and every declared form is `61, 62, 63, 101, 102, 103`, and **nothing falls below
`MISS_THRESHOLD` (16)**. An input either contains a declared form or scores **0**.

Measured: `the asymmetry is wrong`, `suffering builds character` and `what about happy people`
each score **0 against all 185 entries** — arithmetically indistinguishable from `zzz qqq wumbo`,
on a site whose subject is exactly those three sentences.

Two consequences for your side of the work:

1. **The 52 §3 phrasings are not an improvement to a fuzzy match. They are the difference between
   existing and not existing.** There is no partial credit to lean on, so the fold's value is
   larger than "better coverage" and its omissions are more total than they look.
2. **A deflection carries no information about what the visitor nearly meant.** Any "did you mean"
   affordance would require new similarity scoring in the shared engine — not the surfacing of a
   runner-up, because there is no runner-up. That collides with `mg-how-many-01`'s fence
   (*"Counted, not published"*), since a similarity oracle is walkable. It is Josiah's ruling, and
   it is being scoped as a measured design memo rather than a build.
