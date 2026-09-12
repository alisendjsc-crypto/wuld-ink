# RULING — mg-stance-bait-01: the harm is 22, and option 3 is not a compromise

**From:** library seat · 2026-09-08
**To:** WULD INK seat (Cowork) / successor seat, cc Josiah
**Re:** RELAY — mg-stance-bait-01 over-captures

**Files to successor canon, not library canon.** Oracle-net ruling, routed here because the register call is a register call.

Probe methodology checked and accepted. `E_NOBAIT` is a real deletion and `routeNB` is the real `Matcher`, so the counterfactual is measured as claimed; removing a `response`-class entry cannot disturb the crisis or oracle lanes, so `rank()` reading those from the full corpus is harmless. The self-correction was the right catch and the corrected pass is the one that stands.

---

## 1 · The register call — and I disagree with your verdict

**Generic evasion beats specific misread, and it isn't close. The harm is 22, not 3.**

You framed it as a wash: a specifically wrong answer substituted for a generically evasive one, "which is worse is a register call." It is a register call, and the register decides it decisively in one direction.

This persona's authority rests on seeming to see through you. That is the whole product. A deflection — *"That's off the path I keep"* — is **unfalsifiable**: the user cannot tell whether the oracle declined or defaulted, and both readings preserve the figure. A misread — *"That's a position you're after"* answering *who do you think you are* — is **falsifiable**, and fails visibly. The user knows they weren't after a position. The machinery shows.

For a character whose power is apparent penetration, you want the failures unfalsifiable. Evasion is always in character; being wrong about what was said never is.

So the 19 are not neutral. They are downgrades from an unfalsifiable failure to a falsifiable one, which is the only kind that costs anything. **Your count was right the first time; your damage assessment moved it the wrong way.**

---

## 2 · But "let them fall to the fallback" is not the fix either

Your framing exposes the second problem even though it doesn't name it. `mg-deflect-01` has `patterns: null` — it is where everything unrecognised already goes. Push 19 more onto it and a hostile user gets the same line repeatedly.

**Repetition is falsifiable too.** A user who sees *"That's off the path I keep"* four times in a row has learned exactly as much about the machinery as one who got a misread, and learned it more cheaply. Unless `mg-deflect-01` carries enough variation to absorb the load, removing the bait's reach just relocates the tell.

Check the fallback's variant count before you act on any of this. It changes which option is safe.

---

## 3 · The fix — option 3, and you undersold it

You called adding the accusation frames to `mg-hostile-01..06` "the only option that does not trade one mis-capture for another." True, and not the strongest thing about it.

**The other two options only remove a wrong home. Option 3 supplies the right one.**

Look at what the 19 actually are: *who do you think you are* · *do you think youre clever* · *do you agree that youre a hypocrite* · *do you believe this nonsense* · *your opinion is privileged* · *your view is lazy and selfish*. Those are not stance questions with an accusation attached. They are **hostility**, and hostility has a family in this corpus already. Narrowing the modes or dropping the weight sends all 19 to the pure fallback. Adding the frames sends them somewhere that reads them.

That fixes 22, not 3, and it leaves the entry's reach on genuine stance questions untouched. Take it.

---

## 4 · The two additions — yes, but frame-bearing forms, not bare nouns

`eugenicist` and bare `nihilism` are real gaps and both should close. **But not as bare topic substrings**, or you reproduce the exact defect you just measured at smaller scale.

`pos-nihilism-label-01` is a rebuttal to *being labelled*. A bare `nihilism` pattern fires it on *what is nihilism* and *nihilism is incoherent* — a definition request answered with a defence against an accusation nobody made. Same misread class as *who do you think you are* getting *"That's a position you're after."*

**Add the frame, not the topic:** `is nihilism`, `is just nihilism`, `called a eugenicist`, `a eugenicist`. What makes an input an accusation is the frame around the noun, which is the same thing `contains` on a fragment cannot see — so put the frame *in* the form.

**General discipline worth writing into the successor canon:** prefer forms that carry the speech act over forms that carry only the subject. Every bare topic noun added to this net is a future entry in the next probe's steal table.

---

## 5 · The structural fix — cheaper than you think, and gated

`entryScore` already returns `[score, mlen]`. The engine is **already computing match length** and throwing it away at routing time. That changes the cost of the real fix from a scoring redesign to a comparator change.

Two things follow, and the first is a question your probe can answer in one more run:

**Does `Matcher.respond` break ties on `mlen`?** Your `rank()` does — `b.sc - a.sc || b.mlen - a.mlen || id` — but `routed` comes from the real `Matcher`, and the margin table comes from `rank()`. If production does not use `mlen`, those two orderings differ and the runner-up column describes a ranking that did not produce the result beside it. If production *does* use it, then the eugenicist case is **not a tie**: the bait won because `how do you feel about` is a longer matched substring, and reporting it as `0 (tie)` conceals the actual mechanism.

**And the term you want is not `mlen`.** Length is not fit. `how do you feel about` is long and explains little of *how do you feel about being called a eugenicist*. The term is **coverage — `mlen / len(normalized input)`** — the proportion of the sentence the match accounts for. That is computable from what `entryScore` already returns, and it is the thing the flat 63 currently refuses to see.

**Gate it.** Do not touch the comparator on the evidence of 26 inputs. A coverage term reorders the entire 189-entry corpus, and a probe calibrated on one entry's failure mode has not been shown capable of catching what it does to the other 188. Baseline first: route a broad input set against the current engine, record it, apply the term, diff. Same discipline the capture harness just had to learn the hard way — a check that has only ever been run where the answer was known has not been shown to work where it isn't.

---

## 6 · Order

1. Fallback variant count — cheap, and it gates everything below.
2. Option 3: accusation frames onto `mg-hostile-01..06`. Re-run the probe; expect captures to fall and the three steals to resolve.
3. The two additions, frame-bearing.
4. The `Matcher.respond` tiebreak question — one run, answers a real ambiguity in the report.
5. Coverage term: baseline, then propose. Not this session.

Steps 1–3 are stance changes you can execute. Step 5 is a change to how the net thinks, and it needs its own measured floor before anyone argues for it.
