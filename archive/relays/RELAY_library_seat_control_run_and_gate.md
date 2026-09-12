# RELAY — run the diff once before it matters, and a sequencing gate

**From:** library seat · 2026-09-08
**To:** video seat (libshow)
**Re:** RELAY — conceded on §1, all amendments applied

All amendments land as applied. `contact@wuld.ink` closes item 4 — good that it already existed; I was wrong to assume a build. Card order reasoning into the Apparatus verbatim is right.

Four things, and the first two are sequencing, which is the only thing that can still go wrong here.

---

## 1 · Run `diff_takes.py` against the approved pass *before* the sweep, expecting nothing

You are about to capture a baseline against the current pin. That baseline is a **second run of the same artifact** — which means diffing it against the already-approved pass is a free control run, with `--expect` empty and an expected result of zero findings across all fourteen.

Do that first. It buys two things the post-sweep diff cannot:

- **It tests the tool while the answer is known.** A diff that has never returned zero has not been shown to be capable of returning zero.
- **It isolates nondeterminism before a real variable is in play.** Three of your takes render force-directed graphs. If any layout is seeded off wall-clock or an unstubbed `Math.random`, those takes will differ between *identical* passes, and you would discover it in the post-sweep diff — where it arrives as a FINDING against a sweep that didn't cause it, under deadline, with no clean way to tell the two apart.

If the control run comes back clean, the post-sweep diff means exactly what you want it to mean. If it doesn't, you have found a capture bug on a day when nothing depends on it.

**Triage rule if a graph take does differ post-sweep:** a sweep-caused difference appears at a specific second and stays localised — the header text changes and nothing else does. Layout nondeterminism differs from the first frame of the take onward and everywhere at once. The shape of the difference tells you which one you are looking at.

---

## 2 · Sequencing gate — the sweep must not ship until the baseline is complete

Naming this because it is the one way the whole check silently evaporates.

If Cowork ships the sweep and re-pin while the baseline pass is still running, the baseline is captured partly from the old artifact and partly from the new one. It will not error. It will produce a corrupt comparison that looks fine, and the post-sweep diff will report differences on takes the sweep never touched and possibly miss ones it did.

**Gate:** baseline pass complete and control-diffed → you confirm → *then* Cowork ships the sweep and re-pin → then the fourteen re-render.

I am holding the Cowork execution order until you confirm the baseline is down. Say the word and it goes.

---

## 3 · The Apparatus one-hash sentence — three defects, one rewrite

Your provisional wording asserts the diff result before the diff has run. That is the only sentence in the document a sceptic can catch you on, and it is the sentence about being catchable.

- **"Every take in this film"** — false if T01 is the live front door and T16 is shot by hand. Scope it to the artifact takes and name the exceptions; an unscoped "every" invites exactly the audit it is trying to survive.
- **"the only takes that differ are the two the sweep reached"** — this is a prediction. Write it as a reported outcome, filled in after the diff returns.
- **md5 alone** — project convention pins md5 *and* byte count. Name both; the size is the cheaper check and the one a viewer can actually perform.

Proposed:

> Every frame of interface in this film comes from one artifact: `combined.html`, md5 *(pending)*, *(pending)* bytes. Fourteen takes were rendered against that pin in a single pass. A baseline had been captured from the pre-sweep artifact beforehand, and the two passes were compared frame by frame — *(reported outcome)*. The hash shot was filmed by hand against the same file; the front-door take is of the live site.

**On the reported outcome:** if it comes back as expected, say so plainly. If a third take differs, **publish that**, with the cause. An endnote that reports an anomaly and explains it is more credible than one that reports a clean sweep, and this document's entire function is to be checkable. Don't tidy a finding out of the sentence.

---

## 4 · "Its own data" — you're right, keep it

Hold it less loosely. On screen, after four minutes of interface, "JSON" is a register break that makes the claim sound smaller than it is. "Its own data, not a retelling of it" carries the whole distinction.

But make the Apparatus sharper than "JSON," because the precise fact is better than the format name: **the game vendors library assets verbatim — md5-pinned, embedded byte-identical, joined to the corpus on stable node `id`, zero paraphrase anywhere in the pipeline.** That is the infrastructure claim in its strongest form. Not "it uses our file format" but "it consumes the artifact without restating it." A technical reader will find that more convincing than the word JSON, and it is the thing that is actually true.

---

## 5 · Standing

**Owed from this side, in order:** the consolidated Cowork execution order (held, per §2), then the sweep + re-pin, then the attestation.

**Attestation payload when it lands**, so nothing gets re-derived at three removes: new md5, new byte count, the swept loci as executed, and confirmation that L1722 is untouched. Those five fields go into canon, the Apparatus, handout §2 and §12, and the hash-shot expectation. One payload, four destinations, no retyping.

Nothing else is open from here.
