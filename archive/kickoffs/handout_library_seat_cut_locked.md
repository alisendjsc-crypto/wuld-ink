# HANDOUT — the showcase film is locked. What the library seat owes it.

**From:** video seat (libshow) · 2026-09-08
**To:** library seat / wuld.ink Cowork executor
**Status:** **the edit is approved as-is.** Both cuts exist, both verify clean. Nothing further is wanted from you on structure or content — this is a list of four concrete items, then a table you can check the film against.

---

## The films, as delivered

| Cut | Runtime | Frames | Delivery | Goes |
|---|---|---|---|---|
| **JosiahSCooper** | 3:53.3 | 13,984 | −15.1 LUFS · LRA 5.9 · TP −1.0 dBFS | first, to the personal channel |
| **W.U.L.D. repost** | 4:27.6 | 16,036 | −15.1 LUFS | second, same middle, suite outro |

1920×1080 at 60000/1001, yuv420p. **No narration and no presenter** — the typography carries the argument and the sound design carries the feeling. Every frame of interface is the pinned artifact itself, captured deterministically in headless Chromium; nothing is a recreated UI.

`verify_libshow.py` on the delivered file: **RESULT OK, 5 of 5.** Zero full-field luma steps over 40/255, max 0 per second against a limit of 3, largest single-frame step 8.9 of 255. The photosensitivity note in the Apparatus is measured, not asserted.

---

## 1 · What the film needs from you, in order

1. **Ship the sweep and the re-pin as one cut.** Authorized in your ruling; not yet landed. Everything below waits on it.
2. **Send the new md5 and byte count the moment they exist.** They go into the Apparatus, the handout §2 and §12, and the expected value for the hash shot. Until then that shot cannot be taken.
3. **Confirm the roadmap wording below** (§3). The film now makes forward-looking claims about the library that are yours, not mine.
4. **Tell me if the Adversarial Map's adjudication count will move before release.** The film deliberately puts **no number** on screen for it — only "in progress" — so a moving count costs nothing. Say so if you would rather it named a figure, and I will add one; my recommendation is not to.

**Cost to the film of the re-pin: two takes, about five minutes.** T08 (the mechanism-web header) and T15 (the coda lead). Nothing else in either cut shows a swept string. The hash shot is Josiah's hands and is separate.

One thing the sweep will let me undo: the coda's in-point is currently set *past* "catalogs 81 ways" to avoid filming a number in flight. When the sweep lands, that in-point returns to the top of the coda, where the strongest sentence on the page is.

---

## 2 · Every number the film puts on screen

Check these against the corpus if you want a second pass. All were read from the deployed `combined.html` and the ledger with a strict JSON decoder, not searched for as text.

| On screen | Value | Where it came from |
|---|---|---|
| Objections | 82 | corpus; tier split 13 / 17 / 14 / 31 / 7 |
| Psychological mechanisms | 35 | mechanism-web literal, 117 nodes = 82 + 35 |
| Predicted transitions | 2,886 | Argument Flow literal, 78 source keys, four archetypes |
| Dependency graph | 13 premises · 82 objections · 255 edges | dependency literal, 95 nodes, 167 strong / 88 weak |
| Attested deployments | 136 · 78 of 82 objections | real-world-example records |
| RSI | geometric mean of five axes, A ≥ 88 / B ≥ 82 / C ≥ 76 | rubric |
| The single C | `masochist-counterexample`, 80.0, shown beside `performative-contradiction` at 95.0 | ledger |

**Four claims the film deliberately does NOT make**, all of them your corrections, all applied:

- **No archive claim.** `archive_url` is on 3 of 136. The film states link-decay grading instead: *"It does not archive its citations. It grades how fast they are dying."*
- **No "every example is quoted."** 96 of 136 carry a quotation; the film says nothing about coverage.
- **No source-diversity count.** 83 is withdrawn, 91 is clean, and the film uses neither — 136 · 171 · 78-of-82 makes the same point with no definition to defend.
- **No correction of Map 1's 78 to 82.** It is archetype-curated by design.

**One beat is your ruling, filmed rather than asserted.** The film opens the Map 2 methodology panel and holds on the sentence you told me to protect: *"The 35 mechanism clusters were derived bottom-up from the original 81 objections, not imposed top-down from a pre-existing taxonomy."* You were right that it is the strongest credibility beat available — it is the on-camera answer to "did you just invent a mechanism for the new objection?", and it comes from the library's own prose rather than from a card. **This is why L1722 must not be swept.** If it ever is, that beat dies and the take has to be re-shot around it.

---

## 3 · The forward-looking claims — please confirm these are accurate

The film closes, before the coda, on the library as an unfinished object. These statements are yours; I want them checked.

- **"The catalogue is not finished. It is not going to be."** Under the heading *the terminus is reopened* — your phrase.
- **In progress: the Adversarial Map.** Framed clinically, not adversarially: *"Every answer is being read back against its own strongest counter. What survives is kept. What doesn't is named."* No number.
- **Spec'd: sort the catalogue by deployment.**
- **Open: new objections, new archetype variants, new attested deployments.**
- **Planned: *Argue the Argument*, a card game built on the library.** Long-term.
- **"It will not stay static — not while I am here to change it,"** with an invitation on the same card: *if you have an objection it does not answer, send it.*

Two questions on this section, and only two. Is *Argue the Argument* the settled name to put on screen? And is there an intake route you want named — an address, a form, a repo issue — or should "send it" stay unqualified for now?

**Order note, since it will look deliberate and is:** these cards sit *before* the coda, not after. The catalogue being unfinished and the derivation never arriving are different claims, and the coda has to keep the last word or the film reads as walking back its own floor.

---

## 4 · The Apparatus

`apparatus_libshow.md` is written and goes on wuld.ink under its own handout (`HANDOUT_wuldink_apparatus_page.md`), in the same pattern as *Illogically Is* and *"."*. It carries the endnotes: how the scripted capture works and what it gives up, the corpus-derivation table for the sound, every on-screen claim with its source, the four withdrawn claims above, the roadmap, and the machine-checked verification block.

If you want anything in it worded differently — particularly §"Every claim on screen" and the roadmap — say so before it ships. It is the document a sceptical viewer will check the film against, so it should read as yours.
