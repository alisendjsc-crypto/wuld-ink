# Session K prompt (draft for next Cowork instance)

Paste into a fresh Cowork session prompt window. Drop this preamble line before sending.

---

wuld.ink: Cowork session K. Book-project Claude baton intake (already triaged MEDIUM by a stuck K-instance, two open questions surfaced) + cover-axis post-J patch state + Alogical Isness audio repositioning + optional footer dead-CSS sweep.

**Orientation:** Read CLAUDE.md ("Session J deliverables" + the "Status" header at top of "Current state"), then `docs/wuld-ink-cowork-brief.md`. THEN read the book-project Claude baton file Josiah will attach at session start before drafting any reply.

**Background from a previous K-instance that glitched mid-planning (Josiah is relaying):** A prior K-Claude staked the session plan, triaged the baton as MEDIUM, surfaced two questions, and got stuck in thinking before producing artifacts. Nothing committed by that instance. The two questions it surfaced (preserved below for continuity) and its baton-triage MEDIUM read are valid inputs. Item 1 below incorporates them.

**Post-session-J state worth knowing:**
- Cover-axis fix from session J (margin-inline:auto on .cover-mark--video) deployed and verified live via curl. Visual centering achieved.
- Same-day follow-on tune shipped: `.cover-mark--video` `max-width: 50rem` → `32rem` so brackets hug the figure inside the intro stamp video tighter (mix-blend-mode:screen made the dark video margins transparent at 50rem, leaving an empty halo between brackets and figure). If Josiah's live-deploy eye on this 32rem crop reads as too tight, dial back to 36rem or 40rem in a one-line edit. If it reads as still-too-wide, dial down to 28rem.

**Five items in priority order. Recommended default path = items 1 + 2 + 3 (the substantive scope). Items 4 and 5 ship if budget allows.**

---

### 1. Book-project Claude baton intake (MEDIUM triage from glitched K-instance)

Josiah's book-project Claude (different project surface — source-of-truth for the in-development hybrid compendium AND the glossary vocabulary) filled what it could of the baton template (`docs/baton-template.md` schema). The previous K-instance triaged as MEDIUM with these characteristics: Book section filled cleanly; no material-shift ratifications; **one forced question** (Lacero handling) + **one architecturally-significant signal** (the published-book / in-development-compendium distinction collapses — `/book/` and card 09 refer to the same artifact).

**Triage-and-build flow for this session:**

(a) Confirm the MEDIUM read by reviewing the baton at session start. If the prior K's triage was right, create `docs/book-claude-coordination.md` mirroring the library + void-engine relay-doc pattern. Draft Exchange 1 with confirm / nudge / reject responses to whatever the baton brought, plus answers to the two questions below.

(b) **Question 1 from previous K (book-Claude's forced question): Lacero handling.** Lacero is a four-movement experimental section of the book whose form depends on physical page-turns enacting voice interruption (the page-turn IS the structural break in the narrative voice). How should it surface on wuld.ink? The web has no native "page-turn" affordance; analogues are scroll-snap sections, click-to-advance interactions, or refusing-to-web-port the piece (keep Lacero print-only with a cross-reference on /book/). Draft a recommendation in the coordination doc — recommend reflecting before locking, this is an aesthetic/medium-fidelity call with no obvious right answer. Don't ship implementation this turn; lock direction via relay first.

(c) **Question 2 (architecturally-significant signal from baton): `/book/` recasting.** Session-J locked card 09 (Malgré Tout / Amazon) as "distinct from /book/'s in-development hybrid compendium" — that narrative collapses now that the baton confirms Malgré Tout IS the published flagship and IS the artifact /book/'s in-development version is iterating toward. Options to choose from:
- (i) Recast `/book/` as a behind-the-scenes / process page about the in-development version of Malgré Tout (vs Amazon's published edition). Card 09 stays at slot 09 pointing to Amazon; `/book/` card label shifts from "Long-work" to something like "Process" or "Workshop" or "Forthcoming edition".
- (ii) Collapse `/book/` and card 09 into a single destination — `/book/` becomes the canonical landing for Malgré Tout, linking to Amazon for purchase + showing in-development context. Slot 09 frees up for a 10th destination later.
- (iii) Keep /book/ as compendium-in-development but make the distinction explicit on the card tag (e.g., "Hybrid compendium · iterating beyond Malgré Tout"). Card 09 stays the published-canonical-pointer.

Recommend surfacing all three via AskUserQuestion at session start (this is a content-shape decision Josiah owns); Cowork ships the chosen rewrite + any sub-route migration.

(d) **Important boundary:** glossary entry BODIES (the actual philosophical content) stay chat-side per CLAUDE.md. Cowork can scaffold new entry shells (copy `src/glossary/_template.html` → fill placeholders for term/meta/etymology), update the glossary A–Z index listing, and wire `.audio-intro` bands if audio exists — but does NOT write the definitional prose. If the baton supplies new terms, scaffold the shells with placeholder bodies; flag the body-fill as chat-side work.

Projected: ~20–30 tool calls (baton read + coordination doc create + Exchange 1 draft + AskUserQuestion + /book/ card edit per chosen option + Lacero direction logged-but-not-shipped).

---

### 2. Alogical Isness audio repositioning (Josiah-flagged at session-J close)

**Current state:** `src/glossary/alogical-isness/index.html` mounts an `.audio-intro` band pointing at `glossary/alogical-isness/full.mp3` on R2 (25.85 MB / 35:54).

**Josiah's clarification:** that 35:54 reading is the ESSAY-FORMAT audio for "Alogically Is" — a supersedes-rename of the previously-listed "Illogically Is" essay. It belongs in the essay slot, not the glossary entry. Glossary entries are for brief explanations of terms, not full essay readings.

**Cowork-side work:**

(a) **New essay shell** at `src/essays/alogically-is/index.html` — copy structure from `src/essays/sanguinolentum-vestigium/index.html` (single `.audio-intro` band at top of `.essay-body` per session-H architecture). Update `src/essays/index.html`: replace the "Illogically Is" forthcoming card with a live "Alogically Is" listing pointing at the new shell.

(b) **R2 object move** — preferred path: ask Josiah to drag-drop a copy of the staged MP3 to a new R2 prefix `essays/alogically-is/full.mp3` (the source MP3 is still at `_audio-staging/glossary/alogical-isness/full.mp3` per `.gitignore`-covered local staging). Old R2 key `glossary/alogical-isness/full.mp3` can stay or be deleted — R2 cost is per-byte not per-object, and removing it cleanly avoids stale-key confusion. Decide at session.

(c) **Update glossary entry** `src/glossary/alogical-isness/index.html` — REMOVE the `.audio-intro` band (the 35:54 essay reading doesn't fit the glossary register). If Josiah later supplies a brief glossary-format audio (1–2 min summary), mount THAT via the same `.audio-intro` scaffold from session I.

(d) Glossary entry body remains chat-side authorship. The entry shell stays with placeholder Definition/Etymology/See-also/Appears-in scaffolds. The "Appears in" list should be updated to include the new `/essays/alogically-is/` shell once that exists.

**Projected:** ~10–15 tool calls (file reads + 3 file modifications + 1 new file + R2 dashboard step on Josiah's end).

---

### 3. Footer dead-CSS sweep across 8 shells (parallel-safe carry-forward)

~160 lines of inline `.page-footer*` rule blocks still live in 8 shell `<style>` tags as dead code (linked `/components/footer.css` wins on source order so zero visual impact, but the dead code accumulates). Each removal is one Edit per shell with a uniform `old_string` pattern. Bulk job, parallelizable in a single message.

Files: `essays/index`, `essays/sanguinolentum-vestigium`, `argument-library`, `book`, `blog`, `glossary/index`, `watch`, `book` shells.

Ship if budget allows after items 1+2 close. ~10 tool calls.

---

### 4. Architecture-of-Moral-Disaster MP3 placement (optional)

New essay shell at `/essays/architecture-of-moral-disaster/` vs watch-card audio embed. Source MP3 already staged at `_audio-staging/architecture-of-moral-disaster.mp3`. AskUserQuestion if scope opens.

### 5. Glossary entry shell scaffolding (optional, baton-dependent)

If the baton lists forthcoming glossary terms not yet stubbed in `src/glossary/`, copy `src/glossary/_template.html` per term and update the A–Z index. Body fills remain chat-side authorship. Mechanical Cowork work.

### Other follow-ons (mention-only)

- **Cover-axis tune-up dial:** if the 32rem crop shipped post-J reads as too tight in the live deploy, one-line edit to 36rem (looser) or 28rem (tighter). Mention proactively at session start so Josiah can compare with what's live.
- **Footer dead-CSS sweep** already covered in item 3.

---

### Boundaries reaffirmed

- Library pre-stable-tag — no F+ editorial extraction or `library.wuld.ink` subdomain provisioning this session. Substrate-protection invariant remains intact (FLAG via relay only, never edit/PR/issue substrate-side).
- Cowork builds the vessel; chat fills it with content. Glossary bodies, essay prose, Void Engine transmission modes all remain chat-side authorship.

### Tool-budget pre-flag

Pick session shape at session start. With prior K's MEDIUM triage confirmed:
- **Default path** (items 1 + 2 + 3 ship) → ~60–80 tool calls (full session). Most items can run partly in parallel via batched parallel Edits.
- **If baton reveals heavier than MEDIUM** on review → defer item 2 (Alogical repositioning) to K2; ship items 1 + 3 only.
- **If baton is actually LIGHT** (prior K may have over-classified) → ship items 1 + 2 + 3 + 4, item 5 if relevant terms appear.

State the projected shape before any work begins, per the pre-flag discipline locked into CLAUDE.md.
