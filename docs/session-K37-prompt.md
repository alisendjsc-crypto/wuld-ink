session-K37-prompt.md
Upload this at the start of K37 so Cowork knows the scope.

K37 primary scope — flexible (no marquee carry-forward from K36)

K36 + K36a shipped lightly (root .gitignore dedupe + CRLF strip + K33 cxlv truncation marker + /archive/ Position 3 video card swap). K36 closing confirmed all deploy 200; K36a closing confirmed Position 3 card renders correctly with "Video · Vlog" eyebrow inference. K37 opens without a clear marquee scope from carry-forwards alone — operator picks at session-open. Same shape as K36 open.

AQ at open is the right call unless operator pre-commits in this prompt.

Track shapes (lightest → heaviest, recommendation-ordered)

Track (a) — MAINTENANCE LIGHT (~30-50 calls). No new builds. Close operator-elective deferred items operator wants to clear; refresh any drift from K36 close.

* K36a eyebrow QA — operator decides if "Video · Vlog" inference fits "Not A Joke" or wants different classification (~1 call atomic Python eyebrow swap if change requested).
* Old `.png`/`.jpg` cleanup in R2 `gallery/` (~75 MB unreferenced, K33 carry; operator R2-dashboard task — Cowork can produce manifest of unreferenced files but operator does the dashboard click).
* `outputs/k34-dev-doc-hits.txt` scratchpad verify (sandbox-self-cleaned per K36 clxii expectation; check + close).
* Standard verify pass + handoff.

Track (b) — GUI EXTENSIONS (~50-80 calls). Operator brings real-use feedback from `tools/wuld-gui/` after extended use; Cowork extends. Likely additions (best guesses, not commitments):

* `&middot;`/`&mdash;` embedded-entity handling on `<sub>` lines + essay tags (K35 carry).
* Card-eyebrow-swap operation (K36a surfaced as canonical ~1-call pattern; promote to first-class GUI op).
* "Reorder cards within section" operation (drag-position UI).
* "Scaffold new essay page from template" — copies `src/templates/essay.html` to `src/essays/<slug>/index.html`, fills slug + title placeholders, leaves body for chat-side authoring.
* "Scaffold new glossary entry from template" — same shape.
* "Add to blog index" — currently no blog-card pattern exists.
* Each new op: ~10-15 calls; budget by count.

Track (c) — CONTENT FILL via handout-mode + Cowork verify (~30-50 calls). Operator authors content in regular claude.ai (handout-loaded) for one of the remaining placeholder surfaces; Cowork verifies + ships via GUI or atomic Python. Candidates:

* `/recommendations/` Work section (2 placeholders).
* `/recommendations/` Groups section (1 placeholder per K31 narrative; likely already filled at K30 — verify before scoping).
* `/glossary/` body fills for shell-now entries (alogical-isness, contextus-claudit, and the ~8 other forthcoming entries).

Track (d) — NEW TAB / SECTION BUILD (~100-150 calls). Operator brings clear scope at session-open. Candidates surfaced across prior K-sessions:

* Watch tab NSFW sub-section (K25 carry, dormant since gallery NSFW pattern landed at K27).
* /chat/ IRC channel NickServ + ChanServ registration verification (K26 carry; may already be done per K28 prompt operator note).
* /ne-hoc-fiat/ outline content fill (currently scaffold + lede + status; outline section placeholder per K10 ship).
* /book/nothingist/ updates (chat-side draft pending per CLAUDE.md refs).

Track (e) — CROSS-CLAUDE COORD ROUND (~50-100 calls). Operator surfaces new exchange with book-Claude / library-Claude / successor-Claude. Cowork relays + verifies + updates the relevant `docs/*-coordination.md`.

Track (f) — PHOTOS-3-001 PICKS WORKFLOW (~50-80 calls per batch of 10-15). Operator drops 10-15 selected photos into `images/archive/Photos-3-001/_picks/`. Cowork inspects via multimodal Read, identifies via on-image-content + filename metadata, optimizes to WebP at q85 m6 max-2400px (K33 cxlvii anchor), generates R2 upload manifest, appends cards to `/archive/` Section C: Images. Operator-side R2 drag-drop + git push + cache-bust pending after Cowork manifest delivery.

Default recommendation if operator silent

AQ at session-open with tracks (a)-(f). Recommend (a) maintenance light as default + offer (b) GUI extensions as cheapest add-on if operator has specific GUI feedback or (f) Photos-3-001 if operator has selected picks ready.

Carry-forwards from K36 (in priority order)

Verification (operator-side, ~0 Cowork calls — assumed done at K36 close):

* K36 commit landed clean (`d6bea0b` → `2e527a6`); deploy verified 200 OK at K36 close.
* K36a commit landed clean (`2e527a6` → `a67051c`); deploy verified 200 OK at K36a close.
* /archive/ Position 3 card renders correctly with "Video · Vlog" eyebrow + "Dec. 31st, 2014" sub + thumbnail loaded.

Operator-elective deferred items (skip unless surfaced):

* K36a eyebrow QA — if operator wants "Video · Vlog" changed to different classification, surface at K37 open (~1 call).
* K35 carry — GUI `<sub>`-with-`&middot;` embedded entity handling (operator-elective).
* K34 carry — Borderline category (v) session-prefix cleanup on substantive provenance comments (operator-elective; NOT recommended per K34 clii).
* K34 carry — `outputs/k34-dev-doc-hits.txt` scratchpad (likely sandbox-self-cleaned per K36 clxii; verify at K37 open).
* K33 carry — `/void-engine/` meta-description "Triptych instrument" judgment call (~2-3 calls if rewrite).
* K33 carry — Old `.png`/`.jpg` cleanup in R2 `gallery/` (~75 MB unreferenced; operator dashboard work).
* K33 carry — Photos-3-001 picks workflow when operator wants to extend `/archive/` Section C.
* K33 cxlv — CLOSED at K36 via append-marker. No longer carries.

Standing discipline (load into K37 working memory; full corpus in docs/wuld-ink-non-cowork-guide.md):

* K22 vii / K27 ci: multi-Edit on same file → Python batch from FIRST patch.
* K28a cxiii / K31c cxxxix / K32 cxlii: NUL audit on shrinking Edits only.
* K28 cviii: literal-vs-entity grep pre-flight.
* K31 cxxviii: tail-byte audit at session open; extended to root meta-files per K33 cxlv.
* K31 cxxix: component-presence audit (script include implies markup hook).
* K31 cxxxiv: LITERAL non-ASCII in Python heredocs, not `\xNN`.
* K33 cxlviii: pre-flight regex count BEFORE atomic swap.
* K33 cl: audit `src/assets/` + `images/` for existing candidates BEFORE creating new.
* K34 cli: scope-disagreement >5x → surface to operator via AQ.
* K34 clii: provenance comments are load-bearing project history.
* K34a clv: editorial polish on operator-supplied draft = OK; net-new philosophical authorship = deflect to chat-side.
* K34a clvi: content-warning placement BEFORE heaviest content on page.
* K35 clvii: verify-don't-make-worse semantics for batch operations.
* K35 clviii: K27 ci pattern applies to Python files too — `py_compile` catches Python truncation instantly.
* K35 clix: 60/40 GUI/handout split is stable; expand path-selector table rather than re-litigating the split.
* K35 clx: when uploaded prompt's K-number doesn't match diagnostic-derived expected K-number, STOP and verify before atomic action.
* K36 clxi: extend session-open tail-byte audit to CR audit on root meta-files (.gitignore, CLAUDE.md, README.md) — catches Windows-side CRLF drift between sessions.
* K36 clxii: sandbox `/outputs/` scratchpads self-clean between sessions — no explicit cleanup needed for sandbox-only artifacts.
* K36 clxiii: pre-flight check on per-subdir `.gitignore` files before adding to root — don't double-cover.
* K36 clxiv: per-card video swap in JSON-LD-bearing surfaces has 5 ID instances (data-theater-id + img src + json-thumb + json-embed + link-href), not 4.
* K26 xcvii: cache-bump only when `/components/*` touched.
* K24q: discreet-pointer idiom; don't promote inline CSS to component until N=3 convergence.

Diagnostic-first opening (template)

```bash
cd /sessions/<NEW>/mnt/wuld-ink

# 1. HEAD + drift
git log -3 --oneline
git status --short 2>&1 | head -20

# 2. K36/K36a artifact verification
git rev-parse HEAD                       # expect a67051c (K36a commit) or newer if any drift commits landed
md5sum CLAUDE.md                         # expect 9d91956d... if K36a commit landed clean (first 8 hex)
wc -lc CLAUDE.md                         # expect ~499 lines / ~123,878 bytes
ls tools/wuld-gui/                       # expect app.py + ops.py + templates/ + README + requirements + .gitignore
test -f docs/wuld-ink-non-cowork-guide.md && echo "handout present" || echo "MISSING"

# 3. Tail-byte audit on production HTML (K31 cxxviii standing)
bad=0; nul=0; cr=0
while IFS= read -r f; do
  tail -c 8 "$f" | grep -q '</html>' || bad=$((bad+1))
  [ "$(tr -d -c '\0' < "$f" | wc -c)" != "0" ] && nul=$((nul+1))
  [ "$(tr -d -c '\r' < "$f" | wc -c)" != "0" ] && cr=$((cr+1))
done < <(find src -name '*.html' -type f)
echo "production HTML | tail-bad: $bad | NUL: $nul | CR: $cr (expect 0/0/0)"

# 4. Root meta-file tail + CR audit (K33 cxlv + K36 clxi extended discipline)
for f in CLAUDE.md CLAUDE-history.md README.md .gitignore; do
  cr=$(tr -d -c '\r' < "$f" | wc -c)
  printf "%-22s tail: " "$f:"
  tail -c 50 "$f" | tr -d '\n'
  printf " | CR: %d\n" "$cr"
done

# 5. Deploy verify (K36 + K36a didn't touch /components; smoke unchanged 200s)
for u in 'https://wuld.ink/' 'https://wuld.ink/archive/' 'https://wuld.ink/recommendations/'; do
  printf '%-72s ' "$u"
  curl -sI -m 8 "$u" 2>/dev/null | head -1
done

# 6. Uploads inventory
ls -la /sessions/<NEW>/mnt/uploads/

# 7. K22 viii index corruption watch
git status --short 2>&1 | grep -o 'unknown index entry format 0x[0-9a-f]*' || echo "no corruption signature"

# 8. OneDrive sandbox-view (expect ABSENT; N=24 at K37 if streak holds)
test -d /sessions/<NEW>/mnt/C:/Users/y_m_a/OneDrive && echo PRESENT || echo ABSENT

# 9. CLAUDE.md size watch (trim threshold ~195 KB)
stat -c%s CLAUDE.md   # expect ~123,878 + drift; ~60% capacity
```

AQ discipline for K37

* 0 AQ at open if operator pre-commits scope in this prompt OR uploads/ resolves all scope axes.
* 1-3 AQ at open if scope shape ambiguous OR operator silent. Bundle track-shape options + any specific feedback operator wants ordered.
* Mid-session AQ per K34 cli for scope-disagreement >5x via on-disk classification.
* K35 clx: if uploaded prompt's K-number doesn't match expected, STOP and verify before atomic action.

Out of scope for K37

* Authoring new essay/glossary/blog body content (deflect to handout + chat-side per project CLAUDE.md).
* Major architectural pivots (stack, registrar, hosting).
* EFIList project work (different repo).
* Major K22 vii subagent trim (CLAUDE.md at ~60% capacity; K37-K40 comfortable).

Session-close handoff template

Standard K-session close: CLAUDE.md narrative addition + carry-forward refresh + PowerShell commit+push block.

Use `curl.exe -sI` (not bare `curl`) in PowerShell verify blocks per K36-close lesson — PowerShell aliases `curl` to `Invoke-WebRequest` which rejects curl flags.

Single-commit pattern preferred unless deferred drift needs to be picked up separately (rare; K35 absorbed K34 base commit was the last instance).

If K37 touches `/components/*` (e.g., a GUI extension that requires component work, or a bug-fix on ambient-player), cache-bump K30 → K37 (note: K34/K35/K36 did NOT bump from K30 per K26 xcvii; next bump moves site from K30 directly to K37, skipping K31-K36).

If K37 adds new patterns to GUI: update the handout's path-selector table + section "The 7 mechanical patterns" → "The N mechanical patterns".

Tool budget envelopes

* Track (a) maintenance light: 30-50 calls
* Track (b) GUI extensions: 50-80 calls (varies by pattern count)
* Track (c) content fill: 30-50 calls (mostly atomic Python passes)
* Track (d) new tab/section: 100-150 calls
* Track (e) cross-Claude round: 50-100 calls
* Track (f) Photos-3-001 picks: 50-80 calls per batch of 10-15

CLAUDE.md narrative addition: ~2-10 KB per session depending on scope. Trim threshold (~195 KB) at ~60% capacity. K37-K40 still comfortable; no trim needed at K37 open.

Note to Cowork at K37 open: K36 + K36a closed lightly with no marquee carry. K37 likely lighter unless operator surfaces specific scope. Don't assume a marquee workstream — diagnostic-first opening → AQ on track shape with maintenance-light as recommended default → adjust per operator direction.

If anything surfaces operator-side between K36a close and K37 open (real-use GUI bugs, deploy issues, content needs, K36a eyebrow QA), mention in K37 opening message and Cowork adjusts scope accordingly.
