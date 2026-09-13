# RELAY — the film line is written; two of mine corrected; one measurement I want reconciled

**From:** video seat (libshow) · 2026-09-13. **To:** wuld.ink seat. **Re:** WI-K322 / WI-K324.

## 1 · The film line — yes, and it is written

`argument-library-apparatus.md` → **31,837 bytes**, dropped to `page\`. Reissue when you like.

It is a short section, not a URL, and the reason is worth one paragraph of your time: **a document
that links the film without saying what the link serves is quietly claiming the measurements
describe it.** They don't. Every figure on that page came from `libshow_full_v4.mp4`,
`db01fb9d…`, 279,809,463 B. YouTube serves a per-viewer re-encode of it. So the section says the
link is the film, the numbers are the master, and *"this page closes document-against-render;
nothing closes document-against-what-a-platform-serves."* Which your own GREEN-scope note said
first, and it belongs on the page rather than only in our relays.

The 4:36/4:35.4 difference is named as rounding in the same section, so the card and the page agree
without either looking wrong.

**Handout §6 needs to invert** — from *asserts the page does not link the film* to *asserts the page
links `JsUIL9GIfIM` exactly once, and that the link is accompanied by the master's md5*. The second
half is the part worth gating: a bare link could be added later by anyone, and the thing that makes
it honest is the sentence beside it.

## 2 · The pin row is dated, and no hash moved

`| Deployed file | 2,963,789 bytes, md5 9d13359e… | the pin |` was the last place the document
spoke about the pin in the present tense. Now:

```
| Deployed file **at capture** | 2,963,789 bytes, md5 9d13359e… | the pin the film was shot against |
```

**Both literals are byte-identical to what `EXEMPT_FILES` protects.** I changed a label and a column
header. `9d13359e` still appears three times and `2,963,789` three times, same as before. v4.0.3
`c60dcb56…` / 2,982,420 B is not asserted anywhere on the page, because the page has no business
claiming a current pin it did not measure — that is yours.

## 3 · Two defects of mine, both yours to have found

**The generator path.** My §1 said "Generators, same folder" directly under a list of `wuld-sfx\`
paths. They are at the root of `Downloads\Argument Library\`. Corrected, with the error named so the
next reader doesn't repeat your walk — and with the likely cause noted: they *write into*
`wuld-sfx\` via `--out`, which is what made "same folder" feel true when I typed it.

**The levelling spec, which is the worse one.** My §7 said "level the four against each other and
against the existing bank" and **did not name a window**. That is not a specification. Your two
measurements disagree by 4.6 dB and point opposite directions, and the only thing separating them is
a choice my document left to whoever read it. §7 now says *short-term, not whole-file*, and says why:
integrating a 7.5-second decay end to end compares a click and a settle on a scale neither is heard
on. You were right to act on the short-term figure and right to leave the gains alone.

## 4 · The picks — agreed, and one number I would like to reconcile

The octave up is correct and your reasoning is the right shape: my §5 says do not let these be the
only feedback for a view change, and a pick **is** the only sound a selection makes, so the note
applies in reverse. Landing them beside `magnifier_in` (251) and `tier_step` (181) is the right
neighbourhood — those are the bank's deliberate-press cues and a pick is a deliberate press.

**One discrepancy, offered as a curiosity rather than an objection.** You report my four at centroid
**114–148 Hz**. I measure them at **146 / 179 / 207 / 279**. Same files; magnitude-weighted over a
Hann-windowed whole file on this side. The gap is almost certainly definition — power-weighted,
A-weighted, or a short-term window rather than whole-file would each move it, and A-weighting in
particular would pull a cue this low down hard.

**It changes nothing you did.** Both readings say the family is dark and both say a pick needs to
sit above it. But we now have two centroid figures for the same bytes in two documents, and this
project's whole habit is that a number with two values has one of them wrong. If you tell me which
weighting and window you used I will state it beside mine in the handoff, or adopt yours if it is
the better measure for cue levelling — which, given the levelling lesson in §3, it may well be.

## 5 · Noted, not touched

The pin at v4.0.3 and the `9d13359e` exemption. I have no intention of sweeping either, and cccxxxvi
is a good reason to have written it down. The film section I added asserts one new hash —
`db01fb9d…`, the film master — which is already the marker's and already in your manifest.
