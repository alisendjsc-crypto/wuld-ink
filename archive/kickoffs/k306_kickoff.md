# K306 kickoff — the delivery path, then the §3 fold

Repo `C:\Users\y_m_a\Projects\wuld-ink`. **HEAD = `a6fb96b`** (K305, pushed and live-verified).
Read `CLAUDE.md` before acting — the `verify_before for K306+` block at the end is
authoritative for pins, and the standing hazards (K213–cclxxxiii) are load-bearing.

**NO PIN. efilist is READ-ONLY. The flagship `library.wuld.ink/combined` holds at
`e654eabd` / 2,963,752 (v4.0.0) and is not opened.**

---

## What just happened, and the one thing K305 got wrong

K300→K305 shipped in one long session: the help vessel, `dampening_exempt`, the crisis
floor's third-party entry, the tense distinction, the reachability gate, the names oracle,
and two inflection folds totalling ~190 forms. Corpus is **189 entries / 1,076 forms**.

K305's last act was pulling three forms off `pos-life-gift-01` — `life was beautiful`,
`life was a gift`, `life was a blessing` — because someone writing *her life was a gift*
after a death was being answered with a rebuttal of the claim that life is a gift.

**The pull is live and correct.** Verified against the bytes the browser actually
receives (`https://wuld.ink/components/omega-corpus-mrgrey.json` → md5
`ed4b9442c1307b3a52c3e245d49c72f3`, 189/1076): the three past forms deflect, all three
present-tense claims still answer.

**What K305 got wrong was the verification instruction.** It told the operator to type
`life was a gift` on `/successor/` and check the answer. The stage **replays the
transcript from `localStorage`** (`successor-stage.js:203` — `loadTx(p).lines.forEach(...)`);
it does not re-derive replies. So a reply saved under the previous corpus renders
forever, and refreshing cannot change it. The operator refreshed several times and saw
the old answer, which looked exactly like a failed fix.

**Standing hazard to fold into CLAUDE.md this session — cclxxxiv:** *a persisted
transcript makes a corpus fix look like it failed.* Any live check of a routing change
must say **"press `[ clear ]` first, then type it"**, or it is testing a saved record
rather than the engine. Refresh is not a re-test and never will be.

---

## Task 1 — the dead cache-busters (small, safety-adjacent, do it first)

Both assistant loaders carry a `VER` constant whose stated job is to cache-bust the
corpus fetch. **Both stopped being bumped and nobody noticed:**

```
src/components/successor-stage.js:32   var VER = "K255";   // stale by 9 corpus ships
src/components/omega-assistant.js:30   var VER = "K299";   // stale by 4
```

They are not currently breaking anything — the corpus serves `cache-control: public,
max-age=300` and `cf-cache-status: DYNAMIC`, so Cloudflare does not edge-cache it and a
browser goes stale for at most five minutes. But those constants exist precisely to make
a corpus change take effect **immediately**, and right now they do nothing. For a routing
fold that is irrelevant; for a safety pull it is the exact five minutes that matter.

**Do:**
1. `VER` → `"K306"` in both files. Consider a comment naming the rule so it is not missed
   again: *bump on every corpus ship.*
2. `?v` bumps in `src/successor/index.html` for whatever you touched — currently
   `omega-assistant.js?v=K270`, `successor-stage.js?v=K301`, `successor-stage.css?v=K300`.
   K238 rule: bump only what changed.
3. **Fix the ship-block live-assert pattern.** K305's block fetched
   `omega-corpus-mrgrey.json?vk305=1` — a URL no browser has ever requested, so it is
   always an origin pull. It proved the origin, not the delivery. **Fetch the exact URL
   the page requests** (`?v=<VER>`) and assert on that. Record as **cclxxxv**: *a
   cache-busted verify URL is not the URL the page requests; verifying it proves the
   origin and says nothing about what a visitor receives.*
4. Re-run the four house gates + `successor-stage-e2e` (180 checks) + wgate. The e2e has
   source-shape fences on the stage — expect to update any that name `VER`.

---

## Task 2 — the §3 fold, deferred five sessions and now unblocked

Everything it needs is settled. It has been kept out of every inflection fold on purpose:
each of those ended with a clean one-to-three-line route diff **because nothing else was
mixed in**, and that is what caught `parfit` and the three pulls.

**Mode rule (TX18-BACK, ratified):** bare index terms are **not** uniformly `exact`.
`exact` for a single ordinary English word (the `community` precedent — the bare word
appears inside unrelated sentences). **`contains` at w2 for a distinctive multi-word
phrase** — scores 62, above `mg-topical-deflect-01`'s 61 and below every w3 position
form, so subordination survives while `youre cherry picking` / `thats cherry picking`
stop being thrown away.

**Doctrine-not-name (TX19-BACK, ratified and already half-built):** the bare term is the
**doctrine**, never the surname. `contractualism` · `benign creation` · `no subject` go
on their positions. `parfit` `scanlon` `harman` `bradley` `boonin` are on
`mg-oracle-names-01` (built K304, `exact`, 5 forms); `benatar` stays on
`mg-antinatalism-01`, a topic oracle.

**The fold contents:**
- 45 clean `contains` phrasings (the §3 list)
- bare index terms under the mode rule above — the **13 four-plus-word-floor objections**
  from TX18 §2 are the natural source
- `cherry picking` as a **short form on the existing `pos-cherry-picking-worst-01`** — it
  is signed, and this is a short-form gap, not a commission
- `what about happy people` → `pos-most-people-happy-01` (a class-1 miss sitting on a
  live signed position; do **not** put `happy` on the topical net — that files a class-1
  as a class-3)
- `parfits non identity problem` → `pos-non-identity-problem-01` (the seat's own
  illustration, measured at K304 as *not* routing as they described)
- `first world problems` → `pos-privileged-first-world-01` (the library's own headline
  does not reach its own position; the declared form is the singular)

**Verify before folding, and diff §3 self-match before and after — undeclared steals stay
at 0 or the fold is wrong.**

---

## Owed to the library seat (Successor Protocol), all in `Successor Protocol\`

TX21 is filed. Four items are theirs, not yours — do not pre-empt them:

1. **The two extra pulls** (`life was a gift`, `life was a blessing`) — I pulled these on
   their stated criterion after they reserved the read for themselves, on harm asymmetry,
   and flagged them for one-line reversal. If they reverse, restore both forms to
   `pos-life-gift-01` at `contains` w3/w2 respectively.
2. **`copula_predicate_list_K305.csv`** (65 rows, shipped to them) — their grief read.
3. **`sounded like eugenics`** — HELD, not folded. They dropped all three
   `slippery-slope-eugenics` rows for referent shift; this fourth has no such shift, but a
   per-row pass on that objection is theirs.
4. **Content watch** on `pos-violence-as-reductio-01/02` (hypothetical → actual).

---

## House rules that bit during K300–K305, in the order they cost the most

- **Read lists, never retype them.** K305 hand-copied a nine-item drop list from the
  seat's CSV, got seven, and put two seat-rejected forms onto signed positions. The fold
  now parses the CSV with `assert len(drops) == 9`. **cclxxxii.**
- **A differ proves what it walks.** The route diff compares *declared* forms, so a
  re-route whose input was never declared is invisible to it. State a gate's input set
  before citing it. **cclxxxiii.**
- **A true answer to the wrong predicate ships with a tick beside it.** A K304 table
  asked "does this name reach a position?" and marked four rows `ok` while four signed
  philosophers were reaching `mg-deflect-01`. Put the predicate in the column heading.
  **cclxxx.**
- **A mechanical filter that is never overridden is a second author.** The K304/K305
  grammar rules flagged rows that were correct English and would have deleted live-worthy
  forms; one wanted *correcting*, not dropping. Run the rules, then read what they flagged
  and say which drops were mechanical and which were judgment. **cclxxxi.**
- **Fold scripts and their inputs are repo state (ccxliv).** The K299 generator was
  scratch; two sessions later its verb map could not be read, and rebuilding it found
  87 misses the original had missed. `tools/omega/k305/sweep_wide.cjs` now ships.
- **`coverage_audit.cjs` takes NO ARGUMENTS** (cclxxv — PowerShell drops empty-string
  args and it reads the file it means to write).
- **Dry-run every ship-block assert against the post-mutation tree before pasting**
  (cclxxii). It caught a fabricated md5 tail at K303 and two wrong counts at K301/K304.
- **Print full 32-char md5s on both sides of a gate failure.** K303's block truncated
  both and printed `f7fea0ec want f7fea0ec` on a real mismatch.
- **Parity is a contract.** `yurei-oracle.js` and `tools/yurei/yurei_harness.py` change
  together or not at all.
- **The crisis floor is byte-identical across both corpora** (4 entries / 40 forms);
  `omega-persona-gate` asserts it. A floor change moves both personas.
- **Shared-floor bodies go to the library seat for a persona-neutrality read before they
  land.** Byte-identity is not persona-neutrality and no gate can tell the difference.

## Ship shape

ONE PowerShell block, `& { ... }`, `curl.exe` not `curl`, helper named `Md5` (never `H`),
`.git\index.lock*` cleanup first, HEAD==origin guard, base-blob guards, full-md5 result
gates, shape asserts counted as **lines**, explicit-stage the NAMED paths (never
`git add -u`), staged-count assert, commit, push, live verify **at the URL the page
requests**, flagship held. Deliver to `Downloads\k306\`.
