# wuld-gui

Local Flask app for common mechanical edits to the wuld.ink site.

**Built K35 (2026-05-23).** Covers the 7 mechanical patterns operator does
repeatedly — the 60% of typical site updates that don't need LLM judgment.
For heavier judgment ops (authoring essay/glossary body prose, picking eyebrow
classifications, writing disclaimer text), see
`docs/wuld-ink-non-cowork-guide.md` and use regular claude.ai with that
document loaded as context.

## What it covers

1. **Add video card to /archive/ Videos** — youtube_id / playlist_id, title,
   eyebrow, optional sub line, position
2. **Add video card to /watch/ Selected uploads** — youtube_id, title, date
3. **Add image card to /archive/ Images** — slug (file must already be on R2),
   alt text, kind, title, note
4. **Add recommendation card** — section (media/film/books/sites/groups/work/art),
   kind line, title, URL, note (prose with optional inline markup)
5. **Add essay-list-item to /essays/ index** — slug, eyebrow, title, tag.
   (Does NOT create the essay page itself — that's a handout op.)
6. **Generic text-swap** — find/replace on any file in `src/`. Refuses if find
   string occurs 0 or >1 times (pre-flight per K33 cxlviii) unless you tick
   "replace all".
7. **Cache-bump** — sweep `?v=K{OLD}` -> `?v=K{NEW}` across all `src/**/*.html`.
   Use after any change to `src/components/*.css` or `.js` per K26 xcvii.

## Setup (one-time)

From inside `tools/wuld-gui/`:

```powershell
# If you don't have a Python yet:  https://www.python.org/downloads/
python -m pip install -r requirements.txt
```

## Run

```powershell
cd C:\Users\y_m_a\Projects\wuld-ink\tools\wuld-gui
python app.py
```

Then open <http://localhost:5000>.

Stop the server with Ctrl+C.

## How a typical edit goes

1. Pick an operation from the index page.
2. Fill in the form. Required fields are marked.
3. Click **Preview diff**. App reads the target file, builds the new content
   in memory, and shows a unified diff.
4. Edit the suggested commit message if you want.
5. Click **Write, commit & push** (or "Write + stage only" if you want to
   batch multiple ops into one commit).

## What gets verified before any write

- Pre-flight: existing anchor / unique find string / valid section / file exists.
- For HTML files: tail bytes must be `</html>\n`.
- 0 NUL bytes, 0 CR bytes in the post-transform output.

Verification mirrors the discipline corpus Cowork has built up (K28a cxiii
NUL-padding, K31 cxxviii tail-byte, K33 cxlviii regex-count pre-flight).

## When NOT to use this GUI

- Authoring new essay / glossary / blog body prose → regular claude.ai with
  `docs/wuld-ink-non-cowork-guide.md` loaded.
- New page scaffolding (new essay slug, new glossary entry, new blog post) →
  the GUI doesn't create new pages. Handout covers the manual template copy.
- Component edits (`src/components/*.css|.js`) — the GUI can't edit these
  safely without also doing audit work; defer to Cowork or the handout.
- Cross-Claude coordination doc updates (book-Claude / library-Claude /
  successor-Claude exchanges).
- Cloudflare dashboard changes, R2 uploads, DNS edits — operator-side
  separately.

## Architecture

- `app.py` — Flask routes (index, op form, preview, commit) + git helpers
- `ops.py` — per-pattern transform functions
- `templates/` — Jinja2 templates (mono register, dark mode, no JS)

Single port, single user, localhost only. No auth (it's binding to 127.0.0.1).
Don't expose to a network.

## If something goes wrong

- The GUI never deletes; worst case a bad insert lands as uncommitted drift.
  Use `git diff` and `git checkout -- <file>` to revert.
- If commit succeeds but push fails (network out, etc.), the commit is local;
  re-push later via `git push origin main`.
- If the GUI itself crashes, no files are modified — writes only happen on
  the `/commit/<op>` route after preview passes verify.
