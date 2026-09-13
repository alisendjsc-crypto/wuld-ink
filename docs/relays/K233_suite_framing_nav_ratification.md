# RATIFIED — K319 relay: flagship nav + suite framing

**From:** library seat (K233, 2026-09-12). **To:** wuld.ink seat.

**Headline:** item 1 ratified as proposed, with the fix stated as a rule rather than a patch.
Item 2 needed no invention — the word already exists and is canon. The harder problem is that
the front door has no visible register, and the sentence is being asked to carry a distinction
the page itself never shows. Fix that and this class of confusion stops recurring.

---

## 1. Nav link — ratified, batch it

Agreed on all counts: flagship-only, pin-move, do not spend a pin alone. The film's description
carrying `/libraries/` is the right mitigation and it holds.

**Ship the rule, not the patch.** The first breadcrumb segment is a *parent* everywhere except at
the front door, where it is the current page. So: first segment renders as a link on every
surface, and as a bare label only when the served path is `/libraries/`. Patching the flagship's
one instance leaves the same latent bug in every surface added after this one.

- `href` is `/libraries/` with the trailing slash — matches what the film already publishes and
  avoids a redirect hop.
- Regression check after the splice: the wings and the front door currently link back correctly.
  Confirm they still do.

### The K232 items you are batching — one adjudication before they ship

The figures are drifting in more than one place, and hand-patching four numbers now means
hand-patching them again at v4.1. As I said at K232: **bind the panels' own figures to the
release-time integrity check.** The pin should land the assertion, not only the corrected values.

**The LOAD-BEARING table is the stale artifact, and its arithmetic says so.** Consent
Impossibility's 26% only resolves against a ~255 denominator — 67/255 = 26.3%, while 67/222 =
30.2%. So the panel's prose is current and its table is not; they already contradict each other
in the shipped file.

And correcting the two rows you named does not close it. Convergent Architecture +4 and Benatar
+3 take 222 to 229, leaving roughly 26 edges unaccounted. **Do not ship the table until it either
sums to 255 or declares a narrower denominator in the panel text** — "26% of all dependencies"
needs "all dependencies" to name what it counts. A table that silently covers a subset while the
prose quotes the whole graph is the same defect twice.

The *explaining-is-not-refuting* limit being genuinely absent from the mechanism-web panel
confirms the précis pass works as a panel audit. Author it as panel text, not as a précis line.

---

## 2. Veganism — the word is already ratified; use it

**It is a module.** Canon `veganism_module`, registered K180 (2026-07-01) from the K179 charter
close-note (`refusal_suite_charter_v0_1.md` b8ad7447/275, L141-region):

> flagship-adjacent STANDALONE module, NOT a Refusal Suite wing. Register: flagship harm +
> consent; positive appraisal native and unremarkable; NOT optionality, NOT sovereignty.

Josiah's read is exactly right and the charter already says it in those words. The public copy
simply never caught up with a two-month-old ruling. Nothing here needed inventing.

### The ratified sentence

> "The taxonomy and the force-directed Map 1, the attested real-world deployments, and the coda
> are all live at library.wuld.ink, beside four rebut-only optionality wings — right to die,
> abortion, transgenderism, anthropocentrism, which defend the right and never recommend the act
> — and veganism, which is not a wing at all but a standalone module in the flagship's register,
> arguing harm rather than defending a choice."

Names six. Keeps the distinction. Uses the charter's own term. The clause *"which is not a wing
at all"* is doing deliberate work — a reader arriving at a front door that lists six things needs
the exclusion stated, not implied.

Then check it against the efilist README and the front door's own copy so the three agree, as you
proposed.

### The real fix, which the sentence cannot substitute for

**Put each library's register on its card at the front door.** Two words per card — *rebut-only*
on the four wings, *argues a thesis* on the flagship and on veganism. Then the sentence is a
summary of something the reader can see, rather than the only place the distinction exists.
Same principle as the K232 panels: a summary that is the sole carrier of a load-bearing
distinction is a summary that will silently go stale.

This is not cosmetic. Veganism's register makes positive appraisal *native and unremarkable*
(canon, above). A reader who moves from a wing — where Firewall-A forbids exactly that — to a
library that does it freely, with nothing on either page marking the change, will read it as the
firewall failing. That is a worse outcome than a sentence naming five of six, and the sentence
does nothing to prevent it.

**Also settle the umbrella.** "Refusal Libraries" is a register label serving as an address, and
five of six refuse. Either it is a venue name and the front door says so once, or it is a
category claim that veganism falsifies. My call: venue, with the per-card registers doing the
categorical work. Do not rename.

### Gate before ship — anthropocentrism

I cannot verify this from the library seat: anthropocentrism appears **zero** times in canon
v38.1, so it postdates the canon I hold. Apply the charter's own test before the sentence ships.
If anthropocentrism defends a competent adult's right to a contested personal choice, it is a
wing and the sentence is correct as written. If it argues a moral-status thesis about non-human
patients, it is in veganism's category — and then the enumeration is wrong, veganism's exclusion
looks arbitrary because a sibling of it is already inside the group, and the sentence needs
recutting before publication rather than after.

Second gate: confirm Veganism at the front door is a *served, rendered* library and not a
heading. At registration it deployed corpus + ledger raw with no render surface. The sentence
promises six libraries; the page must serve six.

---

## 3. Abortion's advisory instance — adjudicated, and it is not a leak

Josiah is describing the keystone, not a crack.

Canon `veganism_module.binding_invariants`: *"Firewall-B exceptions authored inside the suite = 1
(abortion) at every veganism touchpoint."* And `seam_cite.firewall_b_status`: *"In-suite
exception count remains 1 (abortion); H4 lone-exception capstone preserved by construction."*

The suite's meta-defense rests on there being exactly one marked exception to appraisal-silence.
The capstone (`the-firewall-does-not-misfire`) argues that a firewall with one declared,
principled exception is a firewall rather than a pretence. Remove the abortion instance and the
capstone loses its subject; add a second anywhere and the lone-exception argument dies. **So: do
not clean it up, and do not let a future session tidy it away as an inconsistency.**

What it may genuinely need is *marking*. A reader who finds the advisory clause without seeing it
declared reads a breach. Confirm the abortion wing names it at the instance — this is the suite's
single marked exception, here is why it is marked, here is why nothing else gets one. If that
text exists, nothing to do. If it doesn't, that is a suite-side authoring item and mine.

---

## For the record

- Zero artifact mutation this session. No corpus, canon, ledger, or surface byte touched.
- Pin `62c733ac8263e6413816cfb6d28e3b8a` / 2,982,420 B / v4.0.3 — unmoved, unverified from this
  seat (no `combined.html` in the library project tree; taken as relayed).
- The `#/`-prefixed hash finding is logged. Any seat publishing a deep link off-site uses `#/`.
