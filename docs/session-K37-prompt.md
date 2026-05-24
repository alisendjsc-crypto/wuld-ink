session-K37-prompt.md
Upload this at the start of K37 so Cowork knows the scope.

**ALSO UPLOAD:** `cowork_repo_update_handout_v33_0.md` (library-Claude handout, dated 2026-05-23) — contains the full file-by-file plan for the v3.7.2 → v3.7.3 library repo advance. K37 marquee depends on it.

---

K37 primary scope — MARQUEE: library v3.7.3 advance + wuld.ink link refresh

K36 + K36a closed without a marquee carry. Between K36a close and K37 open, library-Claude shipped a v33.0 canon update that needs to land on the `efilist-argument-library` repo as v3.7.3 (PATCH-class, invariants byte-identical to v3.7-stable). Operator brought this handout at K36a close + asked Cowork to absorb as K37 marquee.

**Two-repo scope this session** (departure from K34/K35/K36/K36a single-repo norm):
1. Cross-repo: `alisendjsc-crypto/efilist-argument-library` — 3 file replacements + 5 new files + 4 docs refreshed + optional CHANGELOG + optional git tag.
2. In-repo: `alisendjsc-crypto/wuld-ink` — grep for library version refs (any `v3.7.0`/`v3.7.1`/`v3.7.2` strings in `src/` or docs/) and bump to `v3.7.3` where they appear in user-visible link text or anchors.

**Scope-override note:** wuld-ink CLAUDE.md's "Cowork is NOT FOR" section lists EFIList project work as out-of-scope and "Out of scope for K37" reiterates this in the prompt's standard template. Operator's K37 upload explicitly overrides this default for the library publication round. K37-Cowork should NOT extend this override to other cross-repo work — it applies only to the v3.7.3 advance described in the handout.

---

Track shapes (rescoped for K37; marquee first, then fallback tracks if marquee finishes early or operator pivots)

Track (MARQUEE) — LIBRARY v3.7.3 ADVANCE + WULD.INK LINK REFRESH (~80-120 calls).

Library-side (cross-repo to `alisendjsc-crypto/efilist-argument-library`):

* Pre-flight: locate the v3.7.3 delivery artifacts. K20 shipped via `scripts/publish-library-v3-7.ps1` on operator-side — check if handout's artifacts are staged there OR in uploads/ OR in operator's working folder. If unclear, AQ operator at session open.
* Replace 3 artifacts: `efilist_argument_library_v3_7_2.{json,jsx}` + `index_v3_7_2.html` → `_v3_7_3` variants (md5s in handout).
* Add 5 new files: `rwe.html` (~552 KB stats view), `v3_7_cut_invariants.json`, `corpus_statistics_spec.md`, `sort_feature_spec.md`. Per handout recommendation, DEFER `granular_variation_candidates.md` + `project_canon_v33_0.json` unless operator wants public.
* Verify-and-preserve 2 already-at-v3.7.3 files (`combined.html`, `coda_v3_7.html`) — md5 check only.
* Verify-and-preserve 3 release-set carriers (`v3prime_validator_v1_6.py`, `real_world_examples_schema_v1_6.json`, `rebuttal_grading_ledger.json`) — md5 check only.
* Refresh 4 docs: `README.md` (version strings + corpus counts), `STATISTICS.md` (re-derive numbers from v3.7.3 corpus), `CITATION.cff` (`version:` + `date-released:`), `instructions.md` (filename refs).
* Optional: add `CHANGELOG.md` (per handout suggestion 1), git tag `v3.7.3` (per existing K20 tag convention), README screenshot refresh.
* Open AQs from handout: include `project_canon_v33_0.json`? include `granular_variation_candidates.md`? add CHANGELOG.md? tag commit?
* Commit message draft provided in handout — adapt or use verbatim.

wuld.ink-side (in-repo):

* Grep `src/` + `docs/` for any library version string references (`v3.7.0`, `v3.7.1`, `v3.7.2`).
* Locate the live link from wuld.ink → library; verify which surface(s) point at library (likely homepage card or footer or essays/argument-library page).
* Refresh link text and/or filename pointers to v3.7.3 where applicable.
* If library subdomain is auto-routing to latest (per K20 Cloudflare Pages auto-deploy), the link itself may not need a change — just verify it resolves to v3.7.3 content post-publication.

Standing discipline: K20 used `scripts/publish-library-v3-7.ps1` (281L, 9 steps, 3 Y/n gates) for the v3.7-stable publish — that script may be adaptable to v3.7.3 or need version-bump editing. Check script first.

Track (a) — MAINTENANCE LIGHT FALLBACK (~30-50 calls). If marquee finishes early or operator wants to bundle small items into K37 close:

* K36a eyebrow QA — operator decides if "Video · Vlog" inference fits "Not A Joke" or wants different classification (~1 call atomic Python eyebrow swap if change requested).
* Old `.png`/`.jpg` cleanup in R2 `gallery/` (~75 MB unreferenced, K33 carry; operator R2-dashboard task).
* `outputs/k34-dev-doc-hits.txt` scratchpad verify (sandbox-self-cleaned per K36 clxii expectation).

Track (b)-(f) — DEFERRED unless marquee + maintenance both finish under envelope. (GUI extensions, content fill, new tab/section, cross-Claude round for other projects, Photos-3-001 picks.)

---

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
test -f docs/session-K37-prompt.md && echo "K37 prompt present" || echo "K37 prompt MISSING"
test -f docs/cowork_repo_update_handout_v33_0.md && echo "library handout filed" || echo "library handout pending upload"

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

# 5. Deploy verify (K36/K36a didn't touch /components; smoke unchanged 200s)
for u in 'https://wuld.ink/' 'https://wuld.ink/archive/' 'https://wuld.ink/recommendations/'; do
  printf '%-72s ' "$u"
  curl -sI -m 8 "$u" 2>/dev/null | head -1
done

# 6. Uploads inventory — expect session-K37-prompt + library handout
ls -la /sessions/<NEW>/mnt/uploads/

# 7. K22 viii index corruption watch
git status --short 2>&1 | grep -o 'unknown index entry format 0x[0-9a-f]*' || echo "no corruption signature"

# 8. OneDrive sandbox-view (expect ABSENT; N=24 at K37 if streak holds)
test -d /sessions/<NEW>/mnt/C:/Users/y_m_a/OneDrive && echo PRESENT || echo ABSENT

# 9. CLAUDE.md size watch (trim threshold ~195 KB)
stat -c%s CLAUDE.md   # expect ~123,878 + drift; ~60% capacity

# 10. Library-publication prep — locate v3.7.3 delivery artifacts
ls -la /sessions/<NEW>/mnt/uploads/*.json 2>/dev/null    # corpus JSON?
ls -la /sessions/<NEW>/mnt/uploads/*.jsx 2>/dev/null     # JSX?
ls -la /sessions/<NEW>/mnt/uploads/index*.html 2>/dev/null
test -f scripts/publish-library-v3-7.ps1 && echo "K20 publish script present" || echo "publish script absent"
```

---

AQ discipline for K37

* MARQUEE pre-commits scope; expect minimal AQ unless artifact-location ambiguous OR operator wants to address handout's 4 open questions inline:
  1. Add `project_canon_v33_0.json` to library repo? (handout recommends NO — keep internal)
  2. Add `granular_variation_candidates.md`? (handout recommends NO)
  3. Add CHANGELOG.md? (operator decision)
  4. Tag commit `v3.7.3`? (operator decision; K20 used tags so default-yes)
* If artifacts staged operator-side and not in uploads/: AQ where to find them.
* Mid-session AQ per K34 cli for scope-disagreement >5x via on-disk classification.
* K35 clx: if uploaded prompt's K-number doesn't match expected, STOP and verify before atomic action.

---

Carry-forwards from K36 (preserved as fallback / informational)

Verification (operator-side, ~0 Cowork calls — assumed done at K36 close):

* K36 commit landed clean (`d6bea0b` → `2e527a6`); deploy verified 200 OK at K36 close.
* K36a commit landed clean (`2e527a6` → `a67051c`); deploy verified 200 OK at K36a close.
* /archive/ Position 3 card renders correctly with "Video · Vlog" eyebrow + "Dec. 31st, 2014" sub + thumbnail loaded.

Operator-elective deferred items (skip unless surfaced or marquee finishes early):

* K36a eyebrow QA — if operator wants "Video · Vlog" changed, surface at K37 open (~1 call).
* K35 carry — GUI `<sub>`-with-`&middot;` embedded entity handling (operator-elective).
* K34 carry — Borderline category (v) session-prefix cleanup on substantive provenance comments (operator-elective; NOT recommended per K34 clii).
* K34 carry — `outputs/k34-dev-doc-hits.txt` scratchpad (likely sandbox-self-cleaned per K36 clxii; verify at K37 open).
* K33 carry — `/void-engine/` meta-description "Triptych instrument" judgment call (~2-3 calls if rewrite).
* K33 carry — Old `.png`/`.jpg` cleanup in R2 `gallery/` (~75 MB unreferenced; operator dashboard work).
* K33 carry — Photos-3-001 picks workflow when operator wants to extend `/archive/` Section C.
* K33 cxlv — CLOSED at K36 via append-marker. No longer carries.

---

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
* K36 clxi: extend session-open tail-byte audit to CR audit on root meta-files — catches Windows-side CRLF drift between sessions.
* K36 clxii: sandbox `/outputs/` scratchpads self-clean between sessions.
* K36 clxiii: pre-flight check on per-subdir `.gitignore` files before adding to root.
* K36 clxiv: per-card video swap in JSON-LD-bearing surfaces has 5 ID instances.
* K26 xcvii: cache-bump only when `/components/*` touched.
* K24q: discreet-pointer idiom; don't promote inline CSS to component until N=3 convergence.

Cross-repo discipline (K20 carry, relevant to K37 marquee):

* Library repo is `alisendjsc-crypto/efilist-argument-library` on Cloudflare Pages (auto-deploys on push, like wuld.ink).
* K20 lesson: sandbox-clone-to-Windows-mount BLOCKED by vmwp.exe on ANY mounted folder where sandbox writes .git/. Library publication ran operator-side via `scripts/publish-library-v3-7.ps1`. Same constraint likely applies at K37 — Cowork-side library work limits to artifact prep + md5 verification + commit-message authorship; operator runs the actual git push.
* K20 publish script has 9 steps + 3 Y/n gates. Adaptable; check if it needs version-bump editing or full rewrite for v3.7.3.
* License: NOASSERTION flag (K21) still applies — SPDX doesn't recognize CC-BY-4.0 + MIT dual-license; operator-side library GitHub repo description update can be bundled if convenient.

---

Out of scope for K37

* Authoring new essay/glossary/blog body content (deflect to handout + chat-side per project CLAUDE.md).
* Major architectural pivots (stack, registrar, hosting).
* EFIList project work OUTSIDE the v3.7.3 publication round (override is scoped to handout-described scope only; do not extend to other cross-repo work).
* Major K22 vii subagent trim (CLAUDE.md at ~60% capacity; K37-K40 comfortable).

---

Session-close handoff template

Standard K-session close: CLAUDE.md narrative addition + carry-forward refresh + PowerShell commit+push block(s).

**Two-commit-target session this time** (cross-repo). Two PowerShell blocks expected:
1. Library repo commit+push (in `efilist-argument-library/`)
2. wuld-ink commit+push (in `wuld-ink/`)

Use `curl.exe -sI` (not bare `curl`) in PowerShell verify blocks per K36-close lesson — PowerShell aliases `curl` to `Invoke-WebRequest` which rejects curl flags.

If K37 touches `/components/*` on wuld-ink (unlikely given marquee scope): cache-bump K30 → K37.

If K37 adds new patterns to GUI: update the handout's path-selector table + section "The 7 mechanical patterns" → "The N mechanical patterns".

---

Tool budget envelopes

* MARQUEE (library v3.7.3 + wuld.ink link refresh): 80-120 calls
* Track (a) maintenance light: 30-50 calls (add-on if marquee finishes under envelope)
* Track (b) GUI extensions: 50-80 calls (deferred)
* Track (c) content fill: 30-50 calls (deferred)
* Track (d) new tab/section: 100-150 calls (deferred)
* Track (e) cross-Claude round for non-library projects: 50-100 calls (deferred)
* Track (f) Photos-3-001 picks: 50-80 calls per batch (deferred)

CLAUDE.md narrative addition: ~8-15 KB expected (cross-repo session = richer narrative). Trim threshold (~195 KB) at ~60% capacity. K37-K40 still comfortable; no trim needed at K37 open.

---

Note to Cowork at K37 open: Marquee is library v3.7.3 publication round + wuld.ink-side link refresh. Don't conflate with K35-style structural builds or K36-style maintenance — this is a cross-repo publication operation pattern-matching K20's v3.7-stable shape. Diagnostic-first opening → AQ on artifact location (if uploads/ doesn't have them) → execute marquee → standard K-session close with two PowerShell blocks.

If anything surfaces operator-side between K36a close and K37 open (real-use GUI bugs, deploy issues, K36a eyebrow QA, OR additional library-Claude addenda), mention in K37 opening message and Cowork adjusts scope accordingly.
