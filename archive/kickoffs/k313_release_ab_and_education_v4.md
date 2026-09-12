# A/B set, and the Education fields

**For:** `libshow_full_v4.mp4` · md5 `db01fb9d4331039148fdb51b7649e022`
Every claim below is checked against the library's own data, not against memory. Where a check
changed a variant, the original is recorded so the reasoning is visible.

---

## A/B TESTING — three variants, ONE variable

The plate is **identical in all three** — same frame, same grade, same crop. Only the words change.

A test that moves the image and the message together tells you which *pair* won and nothing about
why, and a result you cannot attribute is a result you cannot use next time. This set tells you
which **claim** makes a scroller stop. If you want to test the image later, run that as its own
round, holding the winning words fixed.

Each variant pairs a thumbnail with the title that finishes its sentence. **Keep the pairs together** —
splitting them across slots would make the test unreadable.

### A — the inventory  *(control, currently live)*

**Thumbnail:** `thumb_A_count.png` — 82 OBJECTIONS / TO ANTINATALISM
**Title:** `The Argument Library — 82 objections to antinatalism, graded and answered`

Says what the thing is and how many. The safe read, and the one already running.

### B — the concession

**Thumbnail:** `thumb_B_concession.png` — 82 ANSWERS. / ONE GETS A C.
**Title:** `The Argument Library — 82 objections to antinatalism, and the answer it grades a C`

The film's strangest true claim, and the one nothing else in the category makes. Its own card
says it: *"It grades its own weakest work in public,"* overlined **ONE C IN EIGHTY-TWO**.

> **This variant was wrong the first time and the error is worth seeing.** It read
> **SOME OF THESE / OBJECTIONS WORK** — which sounds like the honest hook and is not the film's
> claim. The Rebuttal Strength Index grades **the library's own answers**, not the objections.
> Checked against `data/rebuttal_strength.json`: 82 rebuttals, geometric mean of five factors,
> weakest **0.800** (`masochist-counterexample`), strongest **0.950** (`performative-contradiction`).
> Nothing in the library says an objection succeeds. Had that shipped it would have been an
> overclaim on the most-seen surface the project has — worse than the "every objection" title,
> because more people read a thumbnail than read a title. The real claim is stranger than the
> overclaim, which is how this usually goes.

### C — a named objection

**Thumbnail:** `thumb_C_named.png` — "LIFE IS A GIFT" / AND 81 OTHERS
**Title:** `"Life is a gift" — and 81 other objections to antinatalism, answered`

Puts a sentence the viewer may hold themselves on the plate instead of a count. *Life is a gift* is
a real Tier 1 entry — confirmed in both `data/dep_graph_data.json` and `data/map_graph_data.json`.
82 total, one named, 81 others: the arithmetic closes.

**Judged at 168 px**, which is a phone list row, not at 1280. All three survive it; see
`thumb_AB_at_phone_size.png`. That is the only size at which this decision is real.

**What I'd expect, for what it's worth:** B. A and C both promise a catalogue, and a catalogue is
a thing people bookmark rather than watch. B promises a self-inflicted wound, and that is a thing
people click. But that is a prediction, not a measurement, which is exactly why you run the test.

---

## EDUCATION FIELDS

**Category** Education · **Type** Real life application — both already correct.

### Problems  (672 of 800 characters)

```
0:24 What are the five tiers an objection can fall into, and what separates them?
0:39 Why answer the same objection at three different depths?
0:49 What does an objection look like stripped of philosophical vocabulary?
1:04 Which psychological mechanism is an objection actually running on?
1:23 Where does a mechanism's diagnosis come from, and who is cited for it?
1:37 Which premises does an objection depend on, and what falls if one fails?
2:40 Which objections to antinatalism are strongest, and which are weakest?
3:10 What real-world evidence is attached to an objection, and how is it weighted?
4:03 Where does the library concede its own foundations are axioms?
```

Every timecode is the **start of the segment that answers it**, re-derived from v4's own build log
rather than from the EDL — the log is what was actually assembled. They match the chapter list.

### Level, and Exam / course / standard — leave both **None**

Not an oversight. This film maps to no curriculum and sits at no level, and saying otherwise to
win a shelf placement is the same species of error as the "every objection" title: a claim made
because it is useful rather than because it is true. The two fields are optional; leave them empty.

**Academic system** United States is fine — it is a locale, not a claim.
