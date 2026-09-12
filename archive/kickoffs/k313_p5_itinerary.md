# P5 — itinerary for 2026-09-11

Written the night before, so treat the sequencing as a plan rather than a promise. The gates are real;
the durations are estimates. If something below turns out to be wrong, the finding is worth more than
the schedule.

| # | item | gate | who decides |
|---|---|---|---|
| **A** | sound layer wired (incl. ambience) | none — starts 03:12 | me |
| **B** | regression re-run + third deploy block | A | me |
| **C** | small audits: `em`, `code`/`pre` glow | none | me |
| **D** | feedback button | your ruling on placement | **you** |
| **E** | tutorial | content + hint-overlap decision | **you** |
| **F** | apparatus page at `/library-apparatus/` | its content is your film's endnotes | **you** |
| **G** | push to Cloudflare | — | **you, and only you** |
| **H** | flagship pin move | its own isolated session | **you** |

---

## Phase 1 — unattended, from 03:12

### A. Wire the sound layer  *(P3.1 + 3.5.1 — they are one job, not two)*
The ambience is not a separate item. Its asset is built and it loads through the same pooled buffer
path as everything else; splitting them would mean writing the audio plumbing twice.

Order within the phase:
1. `wuld-sfx.js` — AudioContext unlocked on first gesture, one decoded buffer per sample, pooled.
2. Bind to events that already exist: hover on objection cards, click, `<details>` open/close (the
   `expand`/`collapse` pair is why they were built with opposite pitch direction), tier step,
   magnifier in.
3. Ambience last, because it is the one most likely to cost something.
4. Mute control in the chin, persisted beside `wz-tier`.

**The thing most likely to go wrong, named in advance:** audio work on the main thread moving the
frame numbers. That is the exact shape of the warm-wash failure — a feature that looked free and cost
half the frame rate — and I will not find it by looking at the page. Decode happens once at unlock,
never per event; the ambience is a looping buffer source, not an `<audio>` element being restarted.
If the numbers move anyway, the ambience is what comes out first and the discrete sounds ship
without it.

**Second most likely:** hover on a list of 82 cards machine-gunning. Rate-limited to ~120 ms with
drops rather than a queue, but the *feel* of that limit is not something a harness can judge, so I
will note it for your ear rather than declare it solved.

### B. Regression, then the deploy block
The same five that have stood all session: 25 surface-mode cells at 0 below WCAG AA, CLS 0.000, zero
horizontal overflow at 1440/1024/768/420, 16.70 ms median scroll at every tier, print suppressed. A
sound layer should move none of them.

Then a third gated PowerShell block — the two shared files plus the audio, hash-gated, staged-count
checked, aborting if the pinned root `combined.html` is ever staged. **Left uncommitted for you**,
like the other two.

### C. Small audits *(fills any remaining unattended time)*
- `em` is not in the bold-glow list; anthropocentrism has 21 bright `em` elements taking the plain
  treatment. Cosmetic, one line, but worth measuring before changing.
- `code` / `pre` glow has never been audited on the *dark* wings — only on troubleshooting's cream at
  2×. `code` is a top-5 bright holder on every surface.

**First 30 minutes may go to rebuilding the harnesses** if the container was reclaimed. Not lost work
— everything current is in your folder — but it comes off the front of this phase.

---

## Phase 2 — when you are back

### D. Feedback button *(smallest, do first)*
Needs one ruling from you: **per-card, or a corner button, or both.** My recommendation stands —
per-card, because a report that arrives with the objection id attached is actionable and "something's
broken somewhere" is not. `mailto:` with the `#obj-…` id pre-filled in the subject needs no backend;
a form does, and that is a bigger decision than it looks. Half an hour once you rule.

### E. Tutorial
Two things are yours before I can build it:
1. **What each card says.** That is editorial, about your library, and I should not invent it.
2. **The overlap with the first-visit hint.** Both fire on a first session. Seeing one should suppress
   the other, or a new reader gets told twice. My instinct: the tutorial *replaces* the hint on a
   true first visit, and the hint survives only for readers who skip it.

The mechanism itself — spotlight one feature, darken the rest, Escape and arrow keys throughout — is
a straightforward build once those are settled.

### F. Apparatus page
`wuld.ink/library-apparatus/`, decided today. I can build the route, the shell and the document
styling; **the endnotes are yours** — they are your film's measurements and your method. If you hand
me the content I will lay it out. Put the pin hash in the page, not the URL.

### G. Push — entirely your call
Both commits are local. `library.wuld.ink` still serves the old build until you push, and I am not
going to do that for you: it is the moment the work becomes public, and that is a decision, not a
step. When you do, re-check the live site in both colour schemes, because everything I have verified
was verified locally.

### H. Flagship pin move — its own session, not this one
The prompt is written and its §0 tells the next seat not to spend it early. The precondition is that
`wuld-type.css` has been proven on a wing, which it now has, so it is *eligible* — but it should
carry all three changes at once: layer integration, the 85+ contrast failures, and the button
collapse. One pin move, not three.

---

## What I would cut, in this order

If the day runs short, this is the order things come off — decided now, while nothing is at stake:

1. **C, the small audits.** Cosmetic, and `em` has looked fine in every screenshot so far.
2. **The ambience**, if it costs frames. The discrete sounds are the larger part of the effect and
   they are cheap.
3. **F, the apparatus page**, which is blocked on your content anyway and has no deadline but the
   YouTube description, which already links a URL that can be filled later.
4. **E, the tutorial.** It is the biggest of the remaining builds and the first-visit hint already
   covers the one thing a new reader genuinely needs to know.

**What does not get cut:** the regression in B. A layer that ships without it is a layer nobody can
trust, and the last two days have produced four separate defects that only a harness caught —
a gate that fired on the wrong pages, a control set that could not refute its own claim, a blend
layer that halved the frame rate, and a stylesheet rule silently eaten by a missing `/*`.
