# wuld.ink — Non-Cowork edit guide

Paste this document into a regular **claude.ai** chat (any model) when you
want to make site edits and Cowork mode is not available. Combined with the
GUI at `tools/wuld-gui/`, this covers the full edit surface:

- **GUI** (`python tools/wuld-gui/app.py`) handles the **7 mechanical patterns**
  — repeat-shape low-judgment operations like adding cards, bumping cache
  versions, generic text-swaps. Forms + diff preview + commit & push.
- **This handout** handles the **judgment-heavy ops** — authoring new essay,
  glossary, or blog body prose; deciding eyebrow classifications; writing
  disclaimer text; picking placement; new page scaffolding.

Together: roughly 60% GUI / 40% handout. Cowork sessions become reserved for
higher-leverage work when available.

---

## How to use this document with regular Claude

Paste **everything below this line** plus your edit request. Claude does not
have repo access, so:

1. You describe the edit in plain English.
2. Claude consults the canonical block templates and the discipline corpus
   below to produce either: (a) the exact text to paste into a file, with a
   line-anchor for where it goes; or (b) a small Python script you can save
   as `tools/one-off.py` and run.
3. You apply the change, run the verify checks listed below, then commit and
   push.

Claude should NOT try to invent block markup from scratch — the templates
here are authoritative. If a template is missing for your edit, ask Claude
to read an existing similar block and pattern-match before producing output.

---

## Project context (load this into the chat)

`wuld.ink` is a multi-page philosophical-content site. Cloudflare end-to-end
(Registrar + Pages + R2). Repo: `alisendjsc-crypto/wuld-ink`. Pushes to
`origin/main` auto-deploy via Cloudflare Pages GitHub App.

**Aesthetic register (LOCKED — applies to all visual decisions):**
- Neobrutalist dark mode default. Reader-mode + HC-mode are scoped accessibility
  affordances on `[data-readable]` containers only.
- Typography: Cormorant Garamond (display), IM Fell English (headlines),
  EB Garamond (body), IBM Plex Mono (chrome / instrument register).
- Three-mode palette via `[data-mode]`: dark / reader / hc.
- **Reject categorically:** SaaS landing-page aesthetics, pastels, gradients,
  drop shadows, rounded soft corners, Material Design, generic AI design.

**Working norms:**
- Direct, no hedging or sycophancy.
- Iconoclastic framing welcome where it earns its keep.
- Disagree substantively; concede only to superior argument.
- No menus — recommendation first, then supporting reasoning.
- Operator (Josiah) reads without prescription glasses currently; keep blocks
  short and scannable.

**Cowork is for the vessel; chat is for the content.** Authoring new
philosophical prose, vocabulary, or argumentation belongs in regular
claude.ai. Implementation (HTML, CSS, JS, file shape) belongs in Cowork.
This handout sits in the middle: judgment-heavy implementation that doesn't
need Cowork's tool stack.

**Current site state (snapshot 2026-06-08; numbers move — trust the live site over this line):**
- Nav surfaces: home, /essays/, /argument-library/ (pinned mirror of library.wuld.ink, **v3.9.13**), /glossary/, **/void-engine/** (triptych instrument, **397 entries / 25 categories**, Cowork wholesale ship), /watch/, /music/, /book/, /blog/, /recommendations/, /archive/, /frame/, /donations/, /contact/, /chat/ (comment board live). Plus /changelog/ + /feed.xml (RSS).
- **/gallery/** — 502 plates across 9 rooms (editorial + 8 consent-gated sub-rooms). Renders from `src/gallery/manifest.json` (schema v2); the main page shows the editorial room + a directory to the others.
- **admin.wuld.ink** — Cloudflare-Access CMS for gallery (upload + manifest) and the 4 site-edit patterns. **For any gallery or CMS op, load `docs/admin-wuld-ink-operator-guide.md` instead of this file.**
- **Not handout-editable:** the Void Engine body (`/void-engine/` — Cowork wholesale substitution only) and the `/argument-library/` pin loci (`tools/library-pin.py`, Cowork-exclusive).

---

## Path selector — which tool for which task

| Task | Tool |
|------|------|
| Add a video card to /archive/ or /watch/ | GUI |
| Add an image card to /archive/ Images (file already on R2) | GUI |
| Add a recommendation card | GUI |
| Add an essay-list-item to /essays/ index (card only) | GUI |
| Cache-bump after touching `src/components/*` | GUI |
| Generic find/replace on any src/ file | GUI |
| **Gallery upload / manifest edit, or any of the 4 site-edit patterns** | **CMS — admin.wuld.ink (see operator guide)** |
| **Author the body of a new essay** | **Handout** |
| **Author a new glossary entry** | **Handout** |
| **Write a new blog post body** | **Handout** |
| **Author disclaimer / content-warning text** | **Handout** |
| **Decide a card's eyebrow classification** | **Handout** |
| **Decide cross-link routing for a glossary entry** | **Handout** |
| **Scaffold a brand-new tab / section / page type** | **Handout (+ likely Cowork follow-up)** |
| **Major architectural pivots (stack, registrar)** | **Cowork only** |
| **Cross-Claude coordination doc updates** | **Cowork only** |

---

## Handout operations

### A. Author a new essay (long-form)

**Template:** `src/templates/essay.html` — copy to `src/essays/<slug>/index.html`.

**Required decisions (operator-authored prose unless noted):**
- `<slug>`: kebab-case URL slug. Stable; appears in audio R2 keys and
  permalinks forever.
- `<title>`: H1 + nav title.
- `<eyebrow>`: short tag-line; e.g. "Pessimism manifesto", "Nihilism treatise".
- Section count: 3–7 typical. Each section gets one `<section>` with optional
  audio block (`data-audio-key` attribute keyed to R2 path).
- Audio data-keys: if audio readings exist, key them as
  `essays/<slug>/section-1.mp3` etc. R2 hosts under `audio.wuld.ink`.
- Body prose: operator-authored. Per project norms, this is philosophical
  content; the chat-side is where it gets written.
- Endnotes: optional. Inline `<sup><a href="#fn-N">N</a></sup>` in body; the
  `<aside class="endnotes">` block at end holds the numbered notes.

**After authoring the page itself, also:**
- Use the GUI's "Add essay card to /essays/ index" to add the index card.
- If cross-referencing existing glossary terms, add `[[term-slug]]`-style links
  inside the prose; manually update the corresponding `glossary/<term>/index.html`
  "appears-in" section.

**Discipline check before committing:** essay reads like operator's voice,
not LLM voice. Avoid: tautological self-reference, my-side jargon
("instrument register", "analog-decay"), prompt-status flavor, meta-shape
declarative phrases ("an exhibition in the form of a wall"). See K32 cxli
in the discipline corpus.

### B. Author a new glossary entry

**Template:** `src/glossary/_template.html` — copy to
`src/glossary/<term-slug>/index.html`. Add the entry to `src/glossary/index.html`'s
A–Z list and bump the term count.

**Required:**
- Term + IPA-ish pronunciation guide (operator-elective).
- Etymology: 1–2 sentences on origin if coined or borrowed.
- Definition body: operator-authored prose. This IS the entry. Treat as
  philosophical writing, not dictionary copy.
- See-also: 2–5 related glossary terms; use `[[other-term-slug]]` link form.
- Appears-in: list of essays/blog posts that reference the term. Update these
  posts' bodies if cross-link should be reciprocal.

**Index page update:** `src/glossary/index.html` has an alphabetical list of
all entries with one-line gloss. Add new entry in alphabetical position; bump
the "N terms" count in the page-hero.

**Discipline:** glossary discipline holds coined vocabulary only. Words that
exist in the general philosophical canon (negative utilitarianism, anti-natalism,
etc.) belong in `/frame/`, NOT the glossary.

### C. Author a new blog post

**Template:** copy an existing post like `src/blog/load-bearing/index.html`.
Update slug, title, eyebrow, date, body. Add to `src/blog/index.html` listing.

### D. Author disclaimer / content-warning text

**Operator-supplied draft, GUI-or-manual insertion.** When operator brings
crude-draft prose:
- Preserve operator-voice phrasings verbatim.
- Tighten cadence if requested; reorder for logical priority if requested.
- Split rhetorically-distinct concerns into separate paragraphs.
- Do NOT add net-new philosophical claims.

**Placement rule (K34a clvi):** content warnings sit BEFORE the heaviest
content on the page, not just before indexed sections. If `/archive/` has an
existential-weight epigraph above the first section, the warning goes between
page-hero and that epigraph — not between epigraph and first section.

**Pattern:** an `<aside aria-labelledby="...-label">` block with eyebrow +
body paragraphs + optional `.archive-disclaimer-warning` accent-rail sub-block
mirroring the page's existing `.archive-epigraph` border-inline-start pattern.
See `src/archive/index.html` for the canonical shape.

### E. Decide a card's eyebrow classification

The umbrella's classification conventions:

- **Video cards on /archive/ Videos**: `Video · <Subject>` (e.g., "Video · Antinatalism",
  "Video · Selected", "Video · Music"). Special cases: "Interview · Podcast"
  (when on a third-party podcast channel), "Playlist · Unlisted" (for
  unlisted-videos playlist), "Video · Serial" (multi-part series).
- **Video cards on /watch/**: less formal; date string + title is enough.
- **Image cards on /archive/ Images**: `<medium>` only (e.g., "Composite",
  "Photograph", "Self-portrait"). No prefix.
- **Recommendation cards**: `<Maker> — <year>` or `<Maker> — <role>`
  (e.g., "Iannis Xenakis — composer", "Béla Tarr — 1994").
- **Essay cards**: `<form/topic>` (e.g., "Pessimism manifesto", "Nihilism treatise").
- **Frame sections**: numbered position + topic name.

When in doubt, look at existing cards in the same section for the prevailing
register. Don't invent novel formats.

### F. Cross-link routing for a glossary entry

When adding a new term, decide its "see-also" list by reading nearby
entries' "appears-in" + "see-also" blocks. Reciprocal links are encouraged:
if entry A's "see-also" includes B, then B's "see-also" should include A unless
the relationship is intentionally asymmetric (e.g., a primary term and its
narrower specialization).

For "appears-in", grep `src/essays/`, `src/book/`, and `src/blog/` for the
term-slug. Add bidirectional inline links where contextually appropriate
(don't carpet-bomb; one or two per essay is the norm).

### G. New page scaffolding (new tab/section)

**Beyond handout scope; usually Cowork.** But if you must:
- Pattern-match an existing similar page (e.g., new content tab → look at
  `/recommendations/`; new project page → look at `/ne-hoc-fiat/`).
- Copy structure verbatim; swap content.
- Add nav entry in `src/components/nav.css` (sectoral order) and update
  every page's `<nav class="primary-nav">` block — there are ~56 pages, so
  use a find/replace across all of them. This is GUI text-swap territory.
- Add canonical sizing for the new tab in `src/base.css` if needed.
- Bump cache: any `src/components/*` touch → cache-bump via GUI.

### H. Author override / paste-relay from cross-Claude coord docs

When operator brings content from book-Claude, library-Claude, or
successor-Claude:
- Treat as paste-replace; do NOT re-author.
- Preserve the source attribution in an HTML comment near the inserted block
  (per K34 clii — provenance comments are load-bearing project history).
- If the content needs to live in a specific section, find the anchor
  (`<!-- INSERTION POINT: ... -->` markers when present, otherwise nearest
  surrounding structural tag).

---

## The 7 mechanical patterns (canonical block templates)

These run via the GUI by default. If you must run them manually (e.g., the
GUI isn't installed and you can't install Flask right now), here are the
canonical blocks + anchor patterns.

### 1. Video card to /archive/ Videos

**File:** `src/archive/index.html`
**Block:**

```html
        <article class="archive-video-card">
          <button class="archive-video-thumb-wrap" type="button" data-theater-video-id="{ID}" data-theater-title="{TITLE}" aria-label="Play {TITLE} in theater mode">
            <img class="archive-video-thumb" src="https://i.ytimg.com/vi/{ID}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">
            <span class="archive-video-play" aria-hidden="true">&#9658;</span>
          </button>
          <div class="archive-video-meta">
            <p class="archive-video-eyebrow">{EYEBROW}</p>
            <h3 class="archive-video-title">{TITLE}</h3>
            <p class="archive-video-sub">{SUB}</p>            <!-- omit if SUB empty -->
            <a class="archive-video-link" href="https://www.youtube.com/watch?v={ID}" target="_blank" rel="noopener noreferrer">Open on YouTube &rarr;</a>
          </div>
        </article>
```

For playlists: swap `data-theater-video-id="{ID}"` for
`data-theater-playlist-id="{ID}"`, use a representative video ID for the
thumbnail (`/vi/{THUMB_ID}/`), and change the link to
`https://www.youtube.com/playlist?list={ID}`.

**Anchor pattern:** insert before any existing `<article class="archive-video-card">`
(position chosen) or after the last one (append).

### 2. Video card to /watch/

**File:** `src/watch/index.html`
**Block:** see `src/watch/index.html` itself for current shape — uses
`class="video-card"` (no `archive-` prefix), `data-video-id` attribute,
click-to-swap-to-iframe JS handles activation.

### 3. Image card to /archive/ Images

**Pre-req:** image already uploaded to R2 at
`audio.wuld.ink/archive/images/{slug}.webp` (operator-side R2 dashboard work).

**File:** `src/archive/index.html`
**Block:**

```html
        <figure class="archive-image-card">
          <a class="archive-image-link" href="https://audio.wuld.ink/archive/images/{SLUG}.webp" target="_blank" rel="noopener noreferrer">
            <img class="archive-image-img" src="https://audio.wuld.ink/archive/images/{SLUG}.webp" alt="{ALT}" loading="lazy" decoding="async">
          </a>
          <figcaption class="archive-image-cap">
            <p class="archive-image-kind">{KIND}</p>
            <h3 class="archive-image-title">{TITLE}</h3>
            <p class="archive-image-note">{NOTE}</p>
          </figcaption>
        </figure>
```

### 4. Recommendation card

**File:** `src/recommendations/index.html`
**Sections:** `media`, `film`, `books`, `sites`, `groups`, `work`, `art`
**Block:**

```html
        <article class="rec-card" data-status="live">
          <p class="rec-card-kind">{KIND}</p>
          <h3 class="rec-card-title"><a href="{URL}" target="_blank" rel="noopener noreferrer">{TITLE}</a></h3>
          <p class="rec-card-note">{NOTE}</p>
        </article>
```

`{NOTE}` may contain inline `<em>...</em>` and inline `<a>` affix links
like `[listen]`, `[watch]`, `[buy]`. URL discipline per K31a/b: museum
collection pages > gallery work-specific pages > Wikipedia > arbitrary
blog. Films default to IMDB; books default to operator-elective.

### 5. Essay-list-item to /essays/ index

**File:** `src/essays/index.html`
**Block:**

```html
        <li class="essay-list-item">
          <a href="/essays/{SLUG}/">
            <p class="essay-list-eyebrow">{EYEBROW}</p>
            <h2 class="essay-list-title">{TITLE}</h2>
            <p class="essay-list-tag">{TAG}</p>
          </a>
        </li>
```

`{TAG}` shape: `YYYY · <form> · <duration> audio` if audio, else `YYYY · <form>`.

### 6. Generic text-swap

Any find/replace on a `src/**/*` file. Hard rule: if find-string occurs 0
or >1 times, refuse unless caller explicitly asks for replace-all (K33 cxlviii
pre-flight regex count).

### 7. Cache-bump

After touching any `src/components/*.{css,js}`, sweep `?v=K{OLD}` →
`?v=K{NEW}` across all `src/**/*.html`. Use the next session-letter (K34 →
K35, K35 → K35a, etc.). If `src/components/*` was NOT touched this round,
SKIP the bump (K26 xcvii) — adds noise and breaks no-op invariants.

---

## Standing discipline corpus (load into working memory)

These are lessons earned across K22-K34 sessions. They apply to any edit you
make, GUI or manual.

### Edit-time discipline

- **K22 vii** — File rewrites > 5 KB should use bash heredoc with quoted
  delimiter. The Write tool truncates silently around 17 KB. The Edit tool
  has analogous truncation modes (K28a cxiii / K31c cxxxix below). Prefer
  atomic Python `Path.write_bytes()` for any rewrite that touches more than
  ~3 distinct regions of a file.

- **K27 ci** — Multi-Edit on same file → switch to Python batch from the
  FIRST patch. Cumulative Edit calls can desync between the harness's view
  and the disk file. If your second Edit fails mysteriously, the on-disk
  file likely diverged from the version Read shows you.

- **K28a cxiii / K31c cxxxix / K32 cxlii** — Trailing NUL bytes appear ONLY
  when `new_string` is BYTE-SHORTER than `old_string`. Edit overwrites in
  place; shrinking leaves padding. Same-length and longer Edits are NUL-safe.
  Audit: `data.count(b'\x00')` after any shrinking Edit.

- **K28 cviii** — Pre-flight literal-vs-entity grep on the OLD pattern
  before atomic edits. HTML entities (`&middot;`, `&mdash;`, `&rarr;`,
  `&ndash;`) vs their literal char equivalents (·, —, →, –) are NOT
  interchangeable; pick the one that's actually on disk.

- **K31 cxxviii** — Tail-byte audit on every production HTML file at
  session-open: `tail -c 8 <file> | grep -q '</html>'`. Truncations can
  ship to production undetected. Extended to root meta-files per K33 cxlv.

- **K31 cxxix** — Component-presence audit: when `<component>.js` is
  included on a page, verify the corresponding markup hook (`id="<component>"`)
  is also present. Implicit-template-omission pattern.

- **K31 cxxxiv** — Python heredocs: use LITERAL non-ASCII characters
  (→, —, etc.), NOT `\xNN` escapes. `\xNN` in non-bytes context creates
  Latin-1 codepoints that encode as 2-byte UTF-8 garbage.

- **K33 cxlviii** — Pre-flight regex count BEFORE any atomic swap pass.
  Project documented count is hint only; trust on-disk grep.

- **K33 cl** — Audit `src/assets/` + `images/` for existing candidates
  BEFORE creating new visual assets. Multiple unused assets have been
  rediscovered across sessions.

### Scope discipline

- **K34 cli** — Scope-disagreement >5x via on-disk classification → surface
  to operator via question, even if AQ-count-zero streak prefers zero. Pushing
  through a wrong-scope action costs more than asking.

- **K34 clii** — Provenance comments are load-bearing project history.
  Don't strip "session K<N>" date prefixes or cross-Claude Exchange refs
  from comments without an explicit operator ask. The cross-Claude reference
  IS the functional content; the date prefix is the cosmetic layer.

- **K34 cliii** — Regex pre-flight identifies CANDIDATES; classification-by-
  reading-content is the real filter. Don't atomic-edit on regex-hit alone
  for register-style concerns.

- **K34a clv** — Editorial polish on operator-supplied draft = acceptable
  Claude scope. Net-new philosophical authorship = deflect to operator
  chat-side (when in regular Claude — say so and ask operator to bring the
  draft).

- **K34a clvi** — Content-warning placement defaults to BEFORE the heaviest
  content on the page, not just before indexed sections.

### Cache + commit discipline

- **K26 xcvii** — No cache-bump unless `/components/*` touched. Page-level
  HTML edits don't trigger a bump.

- **K24q** — Discreet-pointer idiom: don't promote inline CSS to component
  until N=3 convergence (i.e., 3 different surfaces share the same shape).

### Atomic Python pass shape

This is the canonical operation Cowork runs for any non-trivial edit:

```python
import subprocess
from pathlib import Path

TARGET = Path("src/archive/index.html")

# 1. Pre-flight: dirty check (current-disk-derive if dirty per K24r lxxxiii)
r = subprocess.run(["git", "diff", "--quiet", "HEAD", "--", str(TARGET)], capture_output=True)
DIRTY = r.returncode != 0
if DIRTY:
    d = TARGET.read_bytes()       # in-session changes present, preserve them
else:
    d = subprocess.run(["git", "show", f"HEAD:{TARGET}"], capture_output=True).stdout

# 2. Pre-flight: occurrence count on anchor
ANCHOR = b'<!-- INSERTION POINT -->'
count = d.count(ANCHOR)
assert count == 1, f"expected 1 anchor, found {count}"

# 3. Transform in memory
NEW_BLOCK = b"<article>...</article>\n        "
d2 = d.replace(ANCHOR, NEW_BLOCK + ANCHOR, 1)

# 4. Atomic bytes-mode write
TARGET.write_bytes(d2)

# 5. Verify post-write
d3 = TARGET.read_bytes()
assert d3.count(b"\x00") == 0, "NUL contamination"
assert d3.count(b"\r") == 0, "CR contamination"
assert d3.endswith(b"</html>\n"), f"tail-byte bad: ends {d3[-30:]!r}"
print(f"OK: {len(d)} -> {len(d3)} bytes ({len(d3)-len(d):+d})")
```

For multi-file ops (cache-bump), wrap the read/transform/write in a for-loop
over `src.rglob("*.html")` and run verify on each.

---

## Git workflow

**Branch:** all work on `main`. No feature branches for this project.
Cloudflare Pages auto-deploys every push to main.

**Commit message format:** `K<NN>[<letter>]: <short summary>`
- Examples:
  - `K35: add /archive/ video card — Test Title`
  - `K35a: text-swap typo in /recommendations/`
  - `K34g: archive video reorder (Prelude<->Deadness) + ¶2-3 of disclaimer moved to /disclaimers/`
- Multi-line bodies: short summary on line 1, blank line, paragraphs.
- One commit per logical change. Multiple commits per session is fine; the
  letter suffix (K35a, K35b) distinguishes them.

**Push:**

```powershell
cd C:\Users\y_m_a\Projects\wuld-ink
git add -A
git status --short            # eyeball what's staged
git commit -m "K35: <summary>"
git push origin main
```

**If the index gets corrupted** (K22 viii pattern — has shown signature
`0x31340000` in past sessions):

```powershell
Remove-Item .git\index.lock -ErrorAction SilentlyContinue
Remove-Item .git\index       -ErrorAction SilentlyContinue
git read-tree HEAD
git add -A
git commit -m "K35: <summary>"
git push origin main
```

**If you need to amend a pushed commit:** use `git push --force-with-lease`
(NEVER plain `--force`); `--with-lease` rejects if the remote was updated
since you last fetched, preventing accidental overwrite of work pushed
from elsewhere.

---

## Post-deploy verification

After `git push origin main`:

1. **Watch Cloudflare Pages dashboard** (or just wait ~30-60 seconds) for
   the build to complete.
2. **Hard-refresh** the affected page (Ctrl+F5 / Cmd+Shift+R) to bust
   browser cache.
3. **View-source** to confirm the change actually landed (vs being a
   stale-cache illusion).
4. **For component changes**: cache-bumped URL should resolve 200.

If a page returns 404 after a deploy, check the build log on Cloudflare
Pages dashboard — sometimes a syntax error in a `_headers` or `_redirects`
file blocks the whole build silently.

Smoke-test PowerShell after a deploy:

```powershell
$urls = @(
  "https://wuld.ink/",
  "https://wuld.ink/archive/",
  "https://wuld.ink/recommendations/"
)
foreach ($u in $urls) {
  try { "$((Invoke-WebRequest $u -Method Head -UseBasicParsing).StatusCode) $u" }
  catch { "ERR $u $($_.Exception.Message)" }
}
```

---

## Common pitfalls

1. **Editing `/components/*.{css,js}` without cache-bumping** → users see
   stale styling/behavior. ALWAYS cache-bump after component edits.

2. **Operator pastes URL with tracking params** → strip to canonical form
   per K31a cxliii (e.g., IMDB `?ref_=nv_sr_...` → drop). Match shape of
   sibling cards.

3. **HTML entity confusion** → site uses `&middot;` (·), `&mdash;` (—),
   `&rarr;` (→), `&ndash;` (–), `&ldquo;`/`&rdquo;` (curly quotes),
   `&ndash;` for year ranges. Use entities, NOT literal Unicode, for
   anything that goes through copy/paste workflows.

4. **Insertion point ambiguity** → if more than one anchor could match,
   tighten the anchor regex to include surrounding context. Better to
   refuse than insert in the wrong place.

5. **Cross-Claude content** → never invent paste-relay content; if
   operator says "use what library-Claude sent in Exchange 4," ask
   operator to paste the actual content if it's not in the chat already.

6. **Authoring decision creep** → if a "small content fix" turns into
   "let me suggest a better way to phrase this," STOP and ask operator
   if they actually want a rewrite or just the fix.

7. **Skipping verify** → tail-byte and NUL audit take 2 seconds; do them
   after every write, especially shrinking edits.

---

## When to wait for Cowork instead

Defer the work and queue it for the next Cowork session when:

- The edit requires reading more than ~3-4 files to understand context.
- It touches `CLAUDE.md`, `CLAUDE-history.md`, or coordination docs.
- It involves cache-bump + component edit + multi-page sweep in one shot
  (the cascade can be tricky to get atomic without Cowork's tool stack).
- It needs cross-Claude relay (book-Claude, library-Claude, etc.).
- It might require a CLAUDE.md narrative addition.

Better to add to the K-session prompt's "carries to K<N+1>" list than to
ship something half-baked.

---

*Last updated: K35 (2026-05-23).*
*If patterns drift, this document drifts with them. Update at K-session
close when GUI gets new operations or canonical templates change.*
