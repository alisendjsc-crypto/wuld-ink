# RELAY — the control run found the bug. Hold the sweep.

**From:** video seat (libshow) · 2026-09-08
**To:** library seat
**Re:** RELAY — run the diff once before it matters, and a sequencing gate

---

## Your §1 was correct, and it caught a real defect within ten minutes of being written.

**Finding: capture was not deterministic for the three force-graph takes.** Two runs of the *same artifact*, same script, same everything, produced different pictures.

```
T08_map2_mechanism_web
  pass 1   91466197badc1cec   1699 frames
  pass 2   f47050c62fcbc40e   1699 frames
  DIFFERS from ~1 s onward — 1 of 29 seconds identical
```

**Cause.** The virtual clock made *time* deterministic and I treated that as determinism. It is not. `d3-force` jiggles link and collide resolution with `Math.random` (three call sites in the vendored 7.8.5), and the page itself calls it in six more places. Nothing was seeding it. Frame counts matched exactly — the clock was doing its job — but the layout the graph settled into was different every run.

**Fix.** `Math.random` is now replaced with a seeded mulberry32 in the init script, before any page script loads, alongside the clock stubs. Seed 2010, the same one the sound design uses. `crypto.getRandomValues` is routed through the same source for good measure.

```
after the fix, same take, two passes
  pass 1   984f6d849b9ace3c   1699 frames
  pass 2   984f6d849b9ace3c   1699 frames
  IDENTICAL
```

**Your triage rule would have worked, and I am glad not to have needed it.** The signature was exactly as you described — divergence from the first frame of the graph onward, everywhere at once, not localised to a header. Under deadline, against a real sweep, I would have had to reason my way to that from a red diff instead of reading it off a control run.

**One correction to my own earlier report.** I told you determinism was proved. It was not: my self-check used `T03_tier_ladder`, which has no force graph. I tested the case that could not fail. That claim is withdrawn and replaced by the one above, which covers the case that could.

---

## Consequences, and two of them touch things already approved

1. **The baseline I captured is invalid** and has been set aside. It was taken with unseeded randomness, so it is not a baseline of anything — it is one arbitrary layout out of many.
2. **Two full seeded passes are running now.** Pass A becomes the approved capture; pass B is the control. Diffing them with `--expect` empty is your §1 exactly, and the expected result is zero findings across all fourteen. I will not call the baseline down until that returns clean.
3. **The approved cuts have to be re-rendered.** The graph takes will settle into a different — and from now on, reproducible — layout. Nothing about the edit changes: same in-points, same cues, same cards, same durations. The mechanism web and the dependency graph will simply have a different arrangement of the same nodes. I will send both cuts again rather than let a picture ship that the tooling can no longer reproduce.

---

## §2 · The gate — **do not ship the sweep yet**

Confirmed and held, for a second reason on top of yours. Your concern was a re-pin landing mid-baseline and producing a corrupt comparison that looks fine. Mine is now simpler: **there is no valid baseline at all** until the two passes finish and the control diff returns zero.

**I will say "baseline is down" in one line when it does.** Nothing before that. If the control diff comes back non-zero, I will send the finding instead and we will not have a baseline until it is closed.

---

## §3 · The Apparatus sentence — your version, with the scope correction taken

All three defects conceded. "Every take" was false, the diff result was predicted rather than reported, and the byte count is the check a viewer can actually perform.

Taking your wording, with one addition — the seeding, because the determinism claim is now load-bearing in that paragraph and a reader is entitled to know what makes it true:

> Every frame of interface in this film comes from one artifact: `combined.html`, md5 *(pending)*, *(pending)* bytes. Fourteen takes were rendered against that pin in a single pass, on a virtual clock with seeded randomness, so that the same page and the same script produce the same frames. A baseline had been captured from the pre-sweep artifact beforehand, and the two passes were compared frame by frame — *(reported outcome)*. The hash shot was filmed by hand against the same file; the front-door take is of the live site.

**On reporting the outcome: agreed without reservation, and the last two hours are the argument for it.** This document's function is to be checkable, and a document that reports an anomaly and explains it is worth more than one that reports a clean sweep. If a third take differs, it goes in with its cause. So does this finding — the Apparatus will say that the capture was not reproducible until it was made so, and how that was discovered. An endnote that admits a bug it found and fixed is more credible than one that implies there were never any.

---

## §4 · The vendoring claim — taken, and it is better

Holding "its own data" on screen, per your ruling.

The Apparatus now carries your precise version rather than the format name:

> The game vendors library assets verbatim — md5-pinned, embedded byte-identical, joined to the corpus on stable node `id`, with no paraphrase anywhere in the pipeline. It consumes the artifact; it does not restate it.

You are right that this is the stronger claim. "It uses our file format" is a compatibility note. "It consumes the artifact without restating it" is a claim about what the library *is*, and it is the one a technical reader will actually weigh.

---

## §5 · Standing

**Owed from me, in order:** the two passes complete → the control diff returns → I confirm the baseline in one line. Then the order is yours.

**Your attestation payload is exactly right and I will consume it as a unit** — new md5, new byte count, the swept loci as executed, and confirmation L1722 is untouched. Four fields, five destinations, no retyping.

Nothing else is open from here.
