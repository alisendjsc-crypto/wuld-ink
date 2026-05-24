# session-K35-prompt.md

Upload this at the start of K35 so Cowork knows the scope.

---

## K35 primary scope — GUI bridge feasibility + prototype + fallback handout

**Operator goal:** Reduce sole dependency on Cowork for site updates. Want to be able to make simple updates (changing text, adding essays, images, videos) during periods when Max plan / Cowork is unavailable. Two acceptable outcomes: (a) a local GUI app that handles common operations without LLM-in-the-loop, OR (b) an instructions handout for regular Claude that captures the canonical patterns Cowork has been using. Track (c) hybrid: do both.

**Recommended track: (c) hybrid — feasibility scope + working prototype + handout (single session).**

### Track (c) workstreams

**WS1 — Diagnostic-first open + scope confirm.** Standard K-session diagnostic (HEAD SHA + CLAUDE.md md5 anchor + tail-byte audit on production HTML + nav-hash + NUL/CR audits + tail-byte audit extended to root meta-files per K33 cxlv carry). Confirm K34/K34a/K34b/K34c-g operator-side QA closed. Surface drift if any.

**WS2 — Mechanical-pattern inventory.** Audit the last ~15 K-sessions' atomic Python passes to extract the canonical operation set. Expected categories: (i) text swap on anchor; (ii) add video card to /archive/ or /watch/; (iii) add image card to /archive/ Section C; (iv) add essay card to /essays/; (v) add glossary entry; (vi) add recommendation card to /recommendations/ sections; (vii) eyebrow/sub refinement; (viii) reorder cards (placeholder-substitution pattern); (ix) disclaimer or content-warning insertion. Output: `outputs/k35-pattern-inventory.md` listing each pattern + canonical block template + anchor regex + frequency-of-use across K22-K34.

**WS3 — AskUserQuestion at scope-decision point.** After WS2 inventory surfaces, AQ operator with 3 GUI shapes:
  - **(a) Tkinter single-file Python script** — zero-install beyond Python; native Windows window; forms for each pattern; git commit+push via subprocess. Simplest; least flexible UI.
  - **(b) Local Flask web app** — runs on `localhost:5000`; browser-rendered UI; can preview generated HTML before commit; richer styling. Slightly more install (`pip install flask`); more pleasant UX.
  - **(c) Defer GUI — handout-only.** If WS2 surfaces too many edge cases to template safely, fall back to writing the instruction handout only and revisit GUI at K36+.

Cowork's recommendation: **(b) Flask** if pattern count is ≤10 and templates clean; **(a) Tkinter** if simpler subset is enough; **(c) handout-only** if patterns are too contextual to template (judge after WS2).

**WS4 — GUI prototype build** (per WS3 choice). For Flask: single `app.py` (~300-500 lines) + Jinja2 templates for each operation form + a "preview" endpoint that renders the proposed diff against current src/ + a "commit" endpoint that runs the atomic Python pass + `git add` + `git commit` + `git push origin main`. Self-contained in operator's repo at `tools/wuld-gui/` (gitignored or committed per operator preference; recommend committed so future Cowork sessions can extend). Output: working prototype + README with launch instructions (`cd tools/wuld-gui && python app.py`).

**WS5 — Instructions handout for regular Claude (fallback path).** Markdown document at `docs/wuld-ink-non-cowork-guide.md` covering: (i) canonical block templates for each operation; (ii) anchor patterns to find/replace against; (iii) the standing discipline corpus (K27 ci Python-batch / K28a cxiii NUL-padding / K31 cxxviii tail-byte / K33 cxlviii pre-flight regex count / K26 xcvii no-cache-bump rule); (iv) git workflow (commit message format, `--force-with-lease` when amending pushed commits); (v) how to verify post-deploy without breaking conventions. Goal: operator can paste this doc + their edit request into regular claude.ai and get the same shape of edit Cowork would have produced. Should be self-contained (no Cowork-specific tool references).

**WS6 — CLAUDE.md K35 narrative + carry-forward refresh + handoff.** Standard close. Lock the GUI prototype location + handout location in CLAUDE.md file layout table.

### Tool budget envelope

**Projected: 80-150 main-context calls.** Heavier than recent K-sessions (K33 30-40, K34 25-30). Justification: WS4 prototype build is the bulk (~50-80 calls if Flask, ~30-50 if Tkinter). WS2 inventory and WS5 handout are ~20-30 each. Diagnostic + handoff ~15-20.

**Pre-flag hazard:** if WS2 inventory surfaces >12 distinct patterns OR pattern templates require LLM-grade judgment per operation (e.g., "write the body of a glossary entry"), GUI scope must narrow. Pure-mechanical-only patterns are GUI-tractable; LLM-judgment patterns belong in the handout. Surface this split at WS3 AQ. **If operator's primary GUI use-case turns out to need LLM judgment for most operations, the right answer is handout-only + a thin "find/replace and commit" helper, NOT a heavyweight GUI.**

**Token ceiling risk:** moderate. CLAUDE.md ~92 KB at K35 open (per K34 size watch; ~47% of trim threshold). K35 narrative addition + GUI workstream notes will add ~5-10 KB. No trim needed at K35 open.

### Carry-forwards from K34 (in priority order)

**Verification (operator-side, 0 calls):**
- K34 ship QA — view-source on /watch/ /music/ /book/ /base.css /templates/essay.html confirms dev-doc comments cleaned.
- K34a QA — /archive/ disclaimer renders between page-hero and epigraph.
- K34b QA — /archive/ Videos section shows 8 cards (was 3); thumbnails load; theater-mode triggers play; **operator confirms attribution classification** on Podcast (eJ_pF0D9eWo on The Exploring Antinatalism Podcast channel) + TheNonDenominator (WuU8eYXalMI — operator's old secondary channel, no Parts 2+3 to add per K34c).
- K34c/d/e/f QA — Card order on /archive/ Videos: 1. Podcast, 2. Why I Am Against Creating Life, 3. Unlisted Videos, 4. Prelude I, 5. Illusion of Good and Evil, 6. Stable, 7. The Crawl, 8. Deadness In Essence.
- K34g QA — /archive/ disclaimer trimmed to ~150 words; pointer link routes to /disclaimers/#revision-and-open-mindedness; section 09 renders on /disclaimers/.

**Operator-elective deferred items (skip unless surfaced):**
- `src/void-engine/index.html` trailing-newline fix (~1 call atomic Python).
- `/void-engine/` meta-description "Triptych instrument" judgment call (~2 calls if rewrite, 0 if accepted as-is).
- Old `.png`/`.jpg` cleanup in R2 `gallery/` (~75 MB unreferenced; operator dashboard work).
- CLAUDE.md tail truncation reconstruction at "library-Claud" (K33 cxlv; requires git-archaeology or operator memory).
- Photos-3-001 picks workflow when operator wants to extend /archive/ Section C.
- `/archive/` smooth-scroll consideration if hash-link from pointer feels abrupt (accessibility tradeoffs — don't enact without ask).
- Category (v) session-prefix cleanup on substantive provenance comments (K34 carry; NOT recommended).

**Scratchpad cleanup:**
- `outputs/k34-dev-doc-hits.txt` (~70KB) — operator-elective whether to keep as artifact or discard.

### Standing discipline (load into K35 working memory)

- **K27 ci:** Multi-Edit on same file → Python batch from FIRST patch.
- **K28a cxiii / K31c cxxxix / K32 cxlii:** NUL-padding audit ONLY when `new_string` < `old_string`; skip when ≥.
- **K28 cviii:** Literal-vs-entity grep pre-flight before atomic edits.
- **K31 cxxviii:** Tail-byte audit (`endswith(b"</html>\n")` + last-30-bytes) on all production HTML at session open; extended to root meta-files per K33 cxlv.
- **K31 cxxix:** Component-presence audit when `<component>.js` is included, verify `id="<component>"` markup hook also present.
- **K31 cxxxiv:** LITERAL non-ASCII chars in Python heredocs, NOT `\xNN` escapes.
- **K33 cxlviii:** Pre-flight regex count audit before atomic swap pass; trust on-disk count over projection.
- **K33 cl:** Audit `src/assets/` + `images/` for existing candidates before creating new visual asset.
- **K34 cli:** Scope-disagreement >5x via on-disk classification → surface to operator via AQ even if AQ-count-zero streak prefers zero.
- **K34 clii:** Provenance comments are load-bearing; don't strip without explicit operator ask.
- **K34 cliii:** Regex pre-flight identifies CANDIDATES; classification-by-reading-content is the real filter.
- **K34a clv:** Editorial polish on operator-supplied draft = acceptable Cowork scope; net-new philosophical authorship = deflect to chat-side.
- **K34a clvi:** Content-warning placement defaults to BEFORE the heaviest content on the page.
- **K26 xcvii:** No cache-bump unless `/components/*` touched.
- **K24q:** Discreet-pointer idiom; don't promote inline CSS to component until N=3 convergence.

### AQ discipline for K35

- **Diagnostic open:** 0 AQ (standard pattern).
- **WS3 GUI-shape decision:** 1 AQ expected, but ONLY if WS2 inventory surfaces actual scope disagreement with operator's intent. If WS2 confirms ~5-8 clean mechanical patterns + Flask is obvious choice, skip AQ and recommend in narrative. If WS2 surfaces ambiguity, AQ with 3 options per K34 cli.
- **No AQ on diagnostic-only items.** Carries are operator-elective; pull only what operator surfaces.

### Out of scope for K35

- Authoring new essay/glossary/blog content (chat-side per project CLAUDE.md).
- Major architectural pivots (stack swap, registrar change).
- EFIList project work.
- Cross-Claude coordination doc updates (library-Claude / book-Claude / successor-Claude exchanges) — unless operator surfaces specific need.

### Session-close handoff template

Standard K-session close: CLAUDE.md narrative addition + carry-forward refresh + PowerShell commit+push block. If GUI prototype landed, include `cd tools/wuld-gui && python app.py` launch line in handoff for operator's reference. If handout landed, include `docs/wuld-ink-non-cowork-guide.md` link.

---

**Note to Cowork at K35 open:** This session has higher tool budget than recent K-sessions. Pre-flag at WS2 inventory if pattern count or complexity suggests handout-only is the right call; do NOT push through a heavyweight GUI build if the cost-benefit doesn't justify. Operator's stated fallback ("if that's not feasible, that's okay; we can generate an instructions handout") makes (c) handout-only a fully acceptable outcome. Recommend (b) Flask if patterns templatize cleanly; recommend (c) handout-only if they don't.
