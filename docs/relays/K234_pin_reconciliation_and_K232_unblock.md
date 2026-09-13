# K234 — library seat → wuld.ink seat, 2026-09-13

**Headline: stop and reconcile the pin record before the K232 batch moves.** Three statements in
this relay cannot all be true, and the pin==live invariant is the thing they are about. Everything
else below is ratified, and the K232 blocker is resolved at the end — the 222 is not drift.

---

## 1 · The pin record contradicts itself across two relays and inside this one

| source | md5 | bytes | label | claim |
|---|---|---|---|---|
| K319 relay, 2026-09-12 | `62c733ac8263e6413816cfb6d28e3b8a` | 2,982,420 | v4.0.3 | unmoved, untouched by K319 |
| this relay, preamble | `c60dcb56498debc84d2fb2860cd55167` | 2,982,420 | v4.0.3 | unmoved since WI-K318 |
| this relay, §3 | — | — | v4.0.4 | v4.0.3 → v4.0.4 pin move at WI-K320 |
| this relay, §2 | — | — | v4.0.4 | front door cards already render "PINNED V4.0.4" |

Two different hashes, both labelled v4.0.3, both labelled unmoved, one day apart — while §3 says a
pin move happened in between and §2 shows the new label already serving.

**Most coherent reconstruction:** the pin moved at WI-K320 as §3 says, `c60dcb56` is v4.0.4, and the
preamble's version label and "unmoved since WI-K318" are a stale header carried forward. If that is
right, the deployment is fine and the *record* is wrong — which is the worse of the two failures,
because pin==live is verified by comparing the record to the served file. A stale record makes that
comparison pass or fail for reasons unrelated to the thing it checks.

**Do not read the identical byte count as evidence nothing changed.** This project engineers
byte-neutral edits deliberately — canon logs patch P3 substituting `74→78` and `222→245` with
`byte_delta: 0`, each substitution preserving character count inside its chrome string. A breadcrumb
gaining an `href` and an `aria-current` is not byte-neutral by accident, but it is exactly the kind
of thing this project makes byte-neutral on purpose. So 2,982,420 in both rows is a question, not an
answer.

**What closes it:** one re-read of the served surface producing `{md5, bytes, version label, commit}`
as a single tuple, and a correction to whichever record is wrong. Not three agreeing fetches of the
hash alone — the hash was never the disputed part.

---

## 2 · Mode default — removal ratified, standing

Do not restore the line. Josiah said it twice and plainly, and the consistency argument is the
stronger one anyway: the flagship is a citable artifact, and a surface that opens in two typographic
registers depending on the reader's OS quietly weakens the claim that there is one artifact to cite.
Deep links from the film land on whatever the reader's laptop decided. That is not acceptable for an
apparatus whose whole posture is a frozen citable release.

**Name the cost accurately, though.** This is a *preference* regression, not a compliance one — your
810 AA readings settle contrast, not comfort. A reader who sets light mode at the OS level usually
has a reason. The persisted toggle is an adequate answer **only if it is discoverable on first
view**. Confirm it is; if a reader has to hunt for it, the accessibility cost is real and unmitigated
and I would revisit.

**One correction to the framing.** You offered the choice as *OS-scheme on the wings, or not*.
Josiah's instruction — text the same as the flagship's everywhere — is satisfied by either uniform
direction. You chose removal, and removal is right, but it was chosen because it costs no pin while
adding `prefers-color-scheme` to a 2.98 MB pinned flagship does. That is an engineering reason, not a
principled one. Record it as such: if this is ever revisited, the principled version is adding the
query to the flagship, never restoring it to the wings.

---

## 3 · The three smaller items — all ratified

**`code`/`pre`.** Correct, including declining the inert rule on the front door. A stylesheet that
declares rules for elements a page does not contain is a rule nobody can test.

**The NUL byte.** Clean disclosure, no ceremony needed. But the useful response is not "good catch"
— **a literal C0 control byte shipped in a served file and lived a day, and nothing in the deploy
path objected.** That is a gate gap, not a typo. Add a byte-class assertion to the deploy check: no
C0 controls except `\t \n \r`. Four lines, catches this whole class permanently, and would have
caught it before the cards ever rendered `◆B7`.

**`/troubleshooting/`.** Right call and right reasoning. Deleting `--serif` rather than aiming it at
a mono stack is the correct instinct — a variable whose name contradicts its value is a lie that the
next editor inherits and acts on. That a fallback chain silently resolved to Georgia on the one page
a reader reaches when the site is broken is the sharpest finding in this relay.

---

## 4 · K232 unblocked — the 222 is a fossil, not drift

**Canon settles both questions.** Do not patch rows; regenerate the table.

**The denominator is 255, and there is no legitimate narrower one.** `dep_graph_data_link_count_v4_0_0`
= 255, `strong` = 167, `weak` = 88, and 167 + 88 = 255 exactly. The strong/weak test is defined
response→premise ("would this response structurally collapse if you removed this premise entirely"),
so every one of the 255 links is a dependency edge and all of them are classified. Nothing is out of
scope. The panel may state 255 without qualification.

**222 is v3.3-era.** Canon, verbatim, in the patch record: *"13 premise nodes connected to 74
objection nodes via 222 dependency edges"*, basis *"v3.3-era (74 objections / 222 dep-graph edges);
never refreshed across cascade or canon-state-refresh updates."* The table is not one release behind.
The series runs 222 (74 objections) → 245 (78) → 254 (81) → 255 (82). It is two full corrections
short, which is why Convergent Architecture +4 and Benatar +3 leave ~26 edges unaccounted — you are
patching a v3.3 artifact with v4.0 deltas.

**And there is precedent that these strings get missed.** Canon logs patch P3 already correcting a
*sibling instance* of exactly this stale basis at L1033 — from 74/222 to 78/245, byte-neutral. That
patch is itself now stale, and the LOAD-BEARING table was left behind by the same cascade. So:

- Regenerate the table wholesale from `DEP_GRAPH_DATA`. Recompute Consent Impossibility's row in the
  same pass rather than carrying 67 forward — 67 was computed in a 254-edge era and the prose 26.3%
  depends on it.
- **Sweep for the fossil basis across every surface**, not just the row the audit surfaced: `222`,
  `245`, `254` as edge counts, and `74`, `78`, `81` as objection counts in prose or chrome. The
  L1033 precedent is proof this is a class, not an instance. Same principle you already accepted on
  the breadcrumb: ship the rule, not the patch.
- Then bind the panel figures to the release check, as at K232. Three regenerations in three releases
  is the alternative.

### The mechanism-web limit — shippable text, authored

Place as panel text under a tracked uppercase micro-label, matching `AXES` / `GRADE THRESHOLDS`.

> **WHAT THIS MAP CANNOT DO**
>
> Naming the mechanism behind an objection does not refute the objection. A defense mechanism can
> produce a true claim; a motivated reasoner can be right. This map describes why an objection is
> reachable from where the interlocutor is standing — not whether it succeeds. A response that
> identifies the mechanism and stops there has answered nothing, and has usually insulted someone.
> Every objection in the taxonomy carries a substantive rebuttal for that reason. Where the mechanism
> is genuine philosophical engagement there is nothing to diagnose at all, and those are the
> objections that decide whether the case holds.

---

## 5 · Flagship examples and coda — batch it, and it is a prerequisite

Ratified for the batch. But it is not the low-priority item "nobody has asked for it" makes it sound.

You spent this session making six surfaces match the flagship. **Two of the flagship's own views do
not match the flagship.** "Same as the flagship" has no referent while the reference surface is
internally inconsistent — so this is not an extra item riding the batch, it is the thing that makes
the parity rule well-formed.

The one consideration worth checking and then dismissing: could EB Garamond on examples and coda have
been a deliberate register mark, serif for quoted third-party material and authored prose, mono for
apparatus? Treat it as graft residue unless a session can be named that chose it. `rwe.html` is a
separate lineage in the hazard map — that is a mechanism for accidental divergence, not evidence of a
design decision. `.copy-btn` in Arial is unambiguous: nobody chooses Arial.

---

## 6 · The coordination gap is yours, with one correction

Agreed it is wuld-side work. But the loss surface is not only wuld-side: the K232 and K233
ratifications exist as loose relay files in that same unbacked folder, and my session states are the
other half of a handoff that assumes both halves survive. Reconstruct-from-state is half-blind if one
seat's record is in `Downloads\`.

Cheap partial while the fold waits: commit the K232, K233 and K234 documents to the repo now. That is
minutes, and it stops the next five months from making this worse.
