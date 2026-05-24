"""
wuld-gui — local Flask app for common mechanical edits to wuld.ink.

Run:
    cd tools/wuld-gui
    pip install -r requirements.txt   # one-time
    python app.py

Then open http://localhost:5000 in a browser.

Covers the 7 mechanical patterns from outputs/k35-pattern-inventory.md.
Heavier judgment ops (essay/glossary body authoring, eyebrow classification,
disclaimer prose) belong in docs/wuld-ink-non-cowork-guide.md and run via
regular claude.ai with the discipline corpus loaded.

Architecture:
    - app.py   : Flask routes + shared helpers (this file)
    - ops.py   : one function per pattern; each returns (target_path, new_bytes)
    - templates/ : Jinja2 templates (base + index + form + preview + result)

Atomic-pass discipline (mirrors Cowork's K22-K34 canonical pass):
    1. Pre-flight git-clean / dirty check
    2. Derive base bytes (current disk if dirty, HEAD if clean)
    3. Pre-flight occurrence count on anchor
    4. Build new bytes in memory
    5. Bytes-mode write
    6. Post-write verify: NUL count, CR count, tail bytes
    7. Diff preview to user
    8. On explicit commit click: git add + commit + push
"""
from __future__ import annotations
import os
import subprocess
import difflib
from pathlib import Path

from flask import Flask, render_template, request, redirect, url_for, flash, abort

import ops

# ============================================================
# CONFIG
# ============================================================
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent  # tools/wuld-gui/ -> repo root
SRC = REPO_ROOT / "src"

assert SRC.is_dir(), f"src/ not found at {SRC}; run app.py from tools/wuld-gui/"

app = Flask(__name__)
app.secret_key = "wuld-gui-local-only-not-for-prod"


# ============================================================
# OPERATION REGISTRY (shape consumed by index + form templates)
# ============================================================
OPS = {
    "add-video-archive": {
        "title": "Add video card to /archive/ Videos",
        "blurb": "Insert a new video card into the archive Videos section.",
        "handler": ops.add_video_archive,
        "fields": [
            ("id_type",          "ID type",                                "select", ["video", "playlist"]),
            ("youtube_id",       "YouTube video ID or playlist ID",        "text", "e.g. eJ_pF0D9eWo  OR  PL5zDoTelkQ6q..."),
            ("thumb_video_id",   "Thumbnail video ID (playlists only)",    "text", "blank for video; required for playlist"),
            ("title",            "Title",                                  "text", "shown as h3"),
            ("eyebrow",          "Eyebrow",                                "text", "e.g. 'Video · Antinatalism'  /  'Interview · Podcast'"),
            ("sub",              "Sub line (optional)",                    "text", "e.g. 'with Josiah S. Cooper · External podcast (not WULD-owned)'"),
            ("position",         "Position (1-N from top of section, blank = append)", "text", "leave blank to add at end"),
        ],
    },
    "add-video-watch": {
        "title": "Add video card to /watch/ Selected uploads",
        "blurb": "Insert a new video card into the /watch/ grid.",
        "handler": ops.add_video_watch,
        "fields": [
            ("youtube_id",  "YouTube video ID",     "text", "e.g. dQw4w9WgXcQ"),
            ("title",       "Title",                "text", ""),
            ("date",        "Date string",          "text", "e.g. 'Mar 2026'"),
            ("position",    "Position (blank = append)", "text", ""),
        ],
    },
    "add-image-archive": {
        "title": "Add image card to /archive/ Images",
        "blurb": "Insert image card. Pre-req: file already uploaded to R2 at audio.wuld.ink/archive/images/{slug}.webp",
        "handler": ops.add_image_archive,
        "fields": [
            ("slug",     "Slug (matches R2 filename without .webp)", "text", "e.g. with-cat-2020"),
            ("alt",      "Alt text",                                 "text", "for screen readers"),
            ("kind",     "Kind",                                     "text", "e.g. 'Composite' / 'Photograph' / 'Self-portrait'"),
            ("title",    "Title",                                    "text", "e.g. '2020–2021: Collage'"),
            ("note",     "Note (1–2 sentences)",                     "textarea", ""),
            ("position", "Position (blank = append)",                "text", ""),
        ],
    },
    "add-recommendation": {
        "title": "Add recommendation card",
        "blurb": "Add to media / film / books / sites / groups / work / art.",
        "handler": ops.add_recommendation,
        "fields": [
            ("section",  "Section",        "select", ["media", "film", "books", "sites", "groups", "work", "art"]),
            ("kind",     "Kind line",      "text", "e.g. 'Iannis Xenakis — composer'  /  'Béla Tarr — 1994'"),
            ("title",    "Title",          "text", ""),
            ("url",      "URL",            "text", "e.g. https://www.imdb.com/title/tt0118175/"),
            ("note",     "Note (prose)",   "textarea", "May contain inline links."),
            ("position", "Position (blank = append)", "text", ""),
        ],
    },
    "add-essay-card": {
        "title": "Add essay card to /essays/ index",
        "blurb": "Adds the INDEX CARD only. Authoring the essay page itself (src/essays/<slug>/index.html) is handout territory — see docs/wuld-ink-non-cowork-guide.md.",
        "handler": ops.add_essay_card,
        "fields": [
            ("slug",     "URL slug",                       "text", "e.g. architecture-of-moral-disaster"),
            ("eyebrow",  "Eyebrow",                        "text", "e.g. 'Pessimism manifesto'"),
            ("title",    "Title",                          "text", ""),
            ("tag",      "Tag line",                       "text", "e.g. '2026 · Long-form'  /  '2026 · Long-form · 35:54 audio'"),
            ("position", "Position (blank = append)",      "text", ""),
        ],
    },
    "text-swap": {
        "title": "Generic text swap (find/replace)",
        "blurb": "Find-and-replace on any src/ file. Refuses if find string occurs 0 or >1 times unless you check 'replace all'.",
        "handler": ops.text_swap,
        "fields": [
            ("file_path",  "File (relative to repo root)", "text", "e.g. src/recommendations/index.html"),
            ("find_text",  "Find",                         "textarea", "exact match; supports multi-line"),
            ("replace_text", "Replace with",               "textarea", ""),
            ("replace_all", "Replace all occurrences",     "checkbox", "leave unchecked for unique-match safety"),
        ],
    },
    "cache-bump": {
        "title": "Cache-bump components",
        "blurb": "Sweep ?v=K{OLD} -> ?v=K{NEW} across all HTML in src/. Use after touching any /components/*.css or .js.",
        "handler": ops.cache_bump,
        "fields": [
            ("old_version", "Old version (e.g. K34)", "text", "must match what currently ships"),
            ("new_version", "New version (e.g. K35)", "text", ""),
        ],
    },
}


# ============================================================
# SHARED HELPERS
# ============================================================
def collect_form_values(op_name: str) -> dict:
    """Read form fields into a flat dict (str values)."""
    cfg = OPS[op_name]
    out = {}
    for f in cfg["fields"]:
        name = f[0]
        ftype = f[2]
        if ftype == "checkbox":
            out[name] = bool(request.form.get(name))
        else:
            out[name] = request.form.get(name, "").strip()
    return out


def make_diff(rel_path: str, old: bytes, new: bytes, context: int = 4) -> str:
    """Unified diff for preview. Returns text; templates wrap with <pre class='diff'>."""
    old_s = old.decode("utf-8", errors="replace").splitlines(keepends=False)
    new_s = new.decode("utf-8", errors="replace").splitlines(keepends=False)
    return "\n".join(
        difflib.unified_diff(
            old_s, new_s,
            fromfile=f"a/{rel_path}",
            tofile=f"b/{rel_path}",
            n=context,
        )
    )


def make_multi_diff(changes: list[tuple[str, bytes, bytes]]) -> str:
    """For ops that touch multiple files (cache-bump)."""
    out = []
    for rel, old, new in changes:
        out.append(make_diff(rel, old, new, context=2))
    return "\n\n".join(out)


def verify_bytes(rel: str, new: bytes, old: bytes | None = None):
    """
    Post-transform verification with "don't make worse" semantics
    (K28a cxiii / K31 cxxviii / K31c cxxxix).

    If `old` is supplied, we only flag REGRESSIONS — pre-existing bad
    tail bytes / NULs / CRs on the input file don't block writes.
    If `old` is None, we apply strict absolute checks.
    """
    errs = []
    new_nul, new_cr = new.count(b"\x00"), new.count(b"\r")
    if old is None:
        if new_nul: errs.append(f"{rel}: NUL contamination ({new_nul})")
        if new_cr: errs.append(f"{rel}: CR contamination ({new_cr})")
        if rel.endswith(".html") and not new.endswith(b"</html>\n"):
            errs.append(f"{rel}: tail-byte bad; ends {new[-30:]!r}")
    else:
        old_nul, old_cr = old.count(b"\x00"), old.count(b"\r")
        if new_nul > old_nul: errs.append(f"{rel}: NUL regression ({old_nul}->{new_nul})")
        if new_cr > old_cr: errs.append(f"{rel}: CR regression ({old_cr}->{new_cr})")
        if rel.endswith(".html"):
            old_ok = old.endswith(b"</html>\n")
            new_ok = new.endswith(b"</html>\n")
            if old_ok and not new_ok:
                errs.append(f"{rel}: tail-byte regression; new ends {new[-30:]!r}")
    return errs


def git(args: list[str]) -> subprocess.CompletedProcess:
    """Run git in REPO_ROOT, return CompletedProcess. Caller checks returncode."""
    return subprocess.run(["git"] + args, cwd=REPO_ROOT, capture_output=True, text=True)


def git_status_short() -> str:
    return git(["status", "--short"]).stdout


def commit_and_push(message: str, files: list[str]) -> tuple[bool, str]:
    """Stage listed files, commit with message, push to origin/main. Returns (ok, log)."""
    log = []
    for f in files:
        r = git(["add", "--", f])
        log.append(f"$ git add {f}\n{r.stdout}{r.stderr}".strip())
        if r.returncode != 0:
            return False, "\n".join(log)
    r = git(["commit", "-m", message])
    log.append(f"$ git commit -m '{message}'\n{r.stdout}{r.stderr}".strip())
    if r.returncode != 0:
        return False, "\n".join(log)
    r = git(["push", "origin", "main"])
    log.append(f"$ git push origin main\n{r.stdout}{r.stderr}".strip())
    if r.returncode != 0:
        return False, "\n".join(log)
    return True, "\n\n".join(log)


# ============================================================
# ROUTES
# ============================================================
@app.route("/")
def index():
    return render_template("index.html", ops=OPS, git_status=git_status_short(), repo_root=str(REPO_ROOT))


@app.route("/op/<name>")
def op_form(name):
    if name not in OPS:
        abort(404)
    return render_template("form.html", op_name=name, op=OPS[name])


@app.route("/preview/<name>", methods=["POST"])
def op_preview(name):
    if name not in OPS:
        abort(404)
    cfg = OPS[name]
    values = collect_form_values(name)
    try:
        result = cfg["handler"](REPO_ROOT, values)
    except ops.OpError as e:
        flash(f"Error: {e}", "error")
        return render_template("form.html", op_name=name, op=cfg, values=values), 400

    # result.changes is a list of (rel_path, old_bytes, new_bytes)
    diff_text = make_multi_diff(result.changes)

    # post-build verify (catches malformed transforms BEFORE write).
    # "don't make worse" semantics: flag only NEW regressions (K34 carry: void-engine
    # shipped without trailing \n; a sibling op shouldn't have to fix that).
    errors = []
    for rel, old, new in result.changes:
        errors.extend(verify_bytes(rel, new, old))
    if errors:
        flash("Verification failed:\n" + "\n".join(errors), "error")
        return render_template("form.html", op_name=name, op=cfg, values=values), 400

    return render_template(
        "preview.html",
        op_name=name, op=cfg, values=values,
        diff=diff_text,
        changes_summary=result.summary,
        commit_message=result.commit_message,
        files=[rel for rel, _, _ in result.changes],
    )


@app.route("/commit/<name>", methods=["POST"])
def op_commit(name):
    if name not in OPS:
        abort(404)
    cfg = OPS[name]
    values = collect_form_values(name)
    try:
        result = cfg["handler"](REPO_ROOT, values)
    except ops.OpError as e:
        flash(f"Error: {e}", "error")
        return render_template("form.html", op_name=name, op=cfg, values=values), 400

    # write all changes atomically (bytes mode)
    written = []
    try:
        for rel, _old, new in result.changes:
            target = REPO_ROOT / rel
            target.write_bytes(new)
            written.append(rel)
    except Exception as e:
        return render_template("result.html", ok=False, log=f"Write failed mid-batch: {e}\n\nPartial writes: {written}\nManually inspect repo state.", op_name=name)

    # re-verify on disk (don't-make-worse vs the pre-write bytes for each change)
    pre_state = {rel: old for rel, old, _new in result.changes}
    errors = []
    for rel in written:
        data = (REPO_ROOT / rel).read_bytes()
        errors.extend(verify_bytes(rel, data, pre_state.get(rel)))
    if errors:
        return render_template("result.html", ok=False, log="Post-write verify failed:\n" + "\n".join(errors), op_name=name)

    # commit + push
    push_clicked = request.form.get("push") == "yes"
    commit_message = request.form.get("commit_message", result.commit_message).strip() or result.commit_message
    if push_clicked:
        ok, log = commit_and_push(commit_message, written)
        return render_template("result.html", ok=ok, log=log, op_name=name)
    else:
        # write-only mode: stage but don't commit
        for f in written:
            git(["add", "--", f])
        return render_template(
            "result.html", ok=True,
            log=f"Wrote + staged {len(written)} file(s). Commit skipped.\n\n" + "\n".join(written),
            op_name=name,
        )


@app.route("/status")
def status():
    """Show current git status + last 10 commits."""
    status = git_status_short()
    log = git(["log", "--oneline", "-10"]).stdout
    return render_template("status.html", status=status, log=log, repo_root=str(REPO_ROOT))


# ============================================================
# ENTRY
# ============================================================
if __name__ == "__main__":
    print(f"wuld-gui starting against {REPO_ROOT}")
    print(f"Open http://localhost:5000")
    app.run(debug=True, host="127.0.0.1", port=5000)
