"""
ops.py — per-pattern transform handlers for wuld-gui.

Each handler signature:
    handler(repo_root: Path, values: dict) -> OpResult

OpResult.changes is a list of (rel_path, old_bytes, new_bytes).
OpResult.summary is a short human-readable line.
OpResult.commit_message is a default commit message (operator can override in form).

All handlers raise OpError on bad input; the route catches and re-renders the form.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from pathlib import Path
import re


@dataclass
class OpResult:
    changes: list[tuple[str, bytes, bytes]] = field(default_factory=list)
    summary: str = ""
    commit_message: str = ""


class OpError(Exception):
    pass


# ============================================================
# UTILITIES
# ============================================================
def _require(values: dict, *names: str):
    """Raise OpError if any required field is empty."""
    missing = [n for n in names if not values.get(n)]
    if missing:
        raise OpError(f"Required field(s) empty: {', '.join(missing)}")


def _read(path: Path) -> bytes:
    if not path.exists():
        raise OpError(f"File not found: {path}")
    return path.read_bytes()


def _insert_at_position(
    data: bytes,
    new_block: bytes,
    card_pattern: bytes,
    position: str,
) -> bytes:
    """
    Insert new_block among existing cards matched by card_pattern.
      position blank/0 -> append after LAST card
      position "1"     -> insert before FIRST card
      position "N"     -> insert at 1-based slot N
                          (existing cards at >= N shift right)
    `card_pattern` is the OPENING tag regex (bytes, raw).
    Returns the modified bytes; raises OpError if 0 cards found (caller can fall back).
    """
    # Find all card-opening positions
    opens = [m.start() for m in re.finditer(card_pattern, data)]
    if not opens:
        raise OpError(
            f"No existing cards matching {card_pattern!r} found. "
            f"Use Generic text-swap with an explicit anchor if the section is empty."
        )

    # Find each card's matching close: scan forward from the opening tag.
    # We assume well-formed cards using the closing tag implied by card_pattern.
    # For simplicity: caller passes a closing pattern via a marker token; here we infer.
    # Determine close tag from opening tag name
    open_name_match = re.match(rb"<(\w+)\b", card_pattern)
    if not open_name_match:
        raise OpError(f"Cannot infer tag name from {card_pattern!r}")
    tag = open_name_match.group(1)
    close_tag = b"</" + tag + b">"

    # Compute card "end" positions = end of </tag> + trailing whitespace+newline
    ends = []
    for start in opens:
        ci = data.find(close_tag, start)
        if ci < 0:
            raise OpError(f"Unbalanced card at byte {start}: no {close_tag!r}")
        end = ci + len(close_tag)
        # consume trailing whitespace up to and including one newline
        while end < len(data) and data[end:end+1] in (b" ", b"\t"):
            end += 1
        if end < len(data) and data[end:end+1] == b"\n":
            end += 1
        ends.append(end)

    # Decide insertion byte-offset
    pos_str = (position or "").strip()
    if not pos_str or pos_str == "0":
        # Append: insert after LAST card-end
        ins_at = ends[-1]
    else:
        try:
            n = int(pos_str)
        except ValueError:
            raise OpError(f"Position must be a number or blank; got {position!r}")
        if n < 1:
            raise OpError(f"Position must be >= 1; got {n}")
        if n > len(opens):
            ins_at = ends[-1]  # past end -> append
        else:
            ins_at = opens[n - 1]

    return data[:ins_at] + new_block + data[ins_at:]


def _esc(s: str) -> str:
    """HTML-entity encode the dangerous chars for attribute / text values."""
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


# ============================================================
# 1. ADD VIDEO CARD TO /archive/ Videos
# ============================================================
def add_video_archive(repo_root: Path, v: dict) -> OpResult:
    _require(v, "youtube_id", "title", "eyebrow")
    target = repo_root / "src" / "archive" / "index.html"
    data = _read(target)

    yid = v["youtube_id"].strip()
    is_playlist = v.get("id_type") == "playlist" or yid.startswith("PL")
    thumb_id = v.get("thumb_video_id", "").strip() or (yid if not is_playlist else "")
    if is_playlist and not thumb_id:
        raise OpError("Playlist requires a thumbnail video ID (a representative video from the playlist).")
    title_e = _esc(v["title"])
    eyebrow_e = _esc(v["eyebrow"])
    sub = v.get("sub", "").strip()
    sub_html = f'\n            <p class="archive-video-sub">{_esc(sub)}</p>' if sub else ""

    if is_playlist:
        data_attr = f'data-theater-playlist-id="{yid}"'
        link_url = f"https://www.youtube.com/playlist?list={yid}"
    else:
        data_attr = f'data-theater-video-id="{yid}"'
        link_url = f"https://www.youtube.com/watch?v={yid}"

    block = (
        '        <article class="archive-video-card">\n'
        f'          <button class="archive-video-thumb-wrap" type="button" {data_attr} data-theater-title="{title_e}" aria-label="Play {title_e} in theater mode">\n'
        f'            <img class="archive-video-thumb" src="https://i.ytimg.com/vi/{thumb_id}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">\n'
        '            <span class="archive-video-play" aria-hidden="true">&#9658;</span>\n'
        '          </button>\n'
        '          <div class="archive-video-meta">\n'
        f'            <p class="archive-video-eyebrow">{eyebrow_e}</p>\n'
        f'            <h3 class="archive-video-title">{title_e}</h3>'
        f'{sub_html}\n'
        f'            <a class="archive-video-link" href="{link_url}" target="_blank" rel="noopener noreferrer">Open on YouTube &rarr;</a>\n'
        '          </div>\n'
        '        </article>\n'
    ).encode("utf-8")

    new_data = _insert_at_position(
        data, block,
        rb'<article class="archive-video-card">',
        v.get("position", ""),
    )

    rel = "src/archive/index.html"
    return OpResult(
        changes=[(rel, data, new_data)],
        summary=f"Add video card to /archive/ Videos: {v['title']!r} ({yid})",
        commit_message=f"K35: add /archive/ video card — {v['title']}",
    )


# ============================================================
# 2. ADD VIDEO CARD TO /watch/ Selected uploads
# ============================================================
def add_video_watch(repo_root: Path, v: dict) -> OpResult:
    _require(v, "youtube_id", "title")
    target = repo_root / "src" / "watch" / "index.html"
    data = _read(target)

    yid = v["youtube_id"].strip()
    title_e = _esc(v["title"])
    date = v.get("date", "").strip()
    date_html = f'\n            <p class="video-card-date">{_esc(date)}</p>' if date else ""

    block = (
        '      <article class="video-card" data-video-id="' + yid + '">\n'
        '        <button class="video-thumb-wrap" type="button" aria-label="Play ' + title_e + '">\n'
        f'          <img class="video-thumb" src="https://i.ytimg.com/vi/{yid}/hqdefault.jpg" alt="" loading="lazy" width="480" height="360">\n'
        '          <span class="video-play" aria-hidden="true">&#9658;</span>\n'
        '        </button>\n'
        '        <div class="video-meta">\n'
        f'            <h3 class="video-card-title">{title_e}</h3>'
        f'{date_html}\n'
        '        </div>\n'
        '      </article>\n'
    ).encode("utf-8")

    try:
        new_data = _insert_at_position(
            data, block,
            rb'<article class="video-card"',
            v.get("position", ""),
        )
    except OpError:
        # Fall back: insert before closing </div> of .video-grid
        anchor = b'<div class="video-grid">'
        idx = data.find(anchor)
        if idx < 0:
            raise OpError("Could not find .video-grid container in /watch/.")
        # find matching closing </div> by simple forward scan
        end = data.find(b"</div>", idx)
        if end < 0:
            raise OpError("Could not find closing </div> for .video-grid.")
        new_data = data[:end] + block + data[end:]

    rel = "src/watch/index.html"
    return OpResult(
        changes=[(rel, data, new_data)],
        summary=f"Add video card to /watch/: {v['title']!r} ({yid})",
        commit_message=f"K35: add /watch/ video card — {v['title']}",
    )


# ============================================================
# 3. ADD IMAGE CARD TO /archive/ Images
# ============================================================
def add_image_archive(repo_root: Path, v: dict) -> OpResult:
    _require(v, "slug", "alt", "kind", "title", "note")
    target = repo_root / "src" / "archive" / "index.html"
    data = _read(target)

    slug = v["slug"].strip()
    alt_e = _esc(v["alt"])
    kind_e = _esc(v["kind"])
    title_e = _esc(v["title"])
    note_e = _esc(v["note"])
    url = f"https://audio.wuld.ink/archive/images/{slug}.webp"

    block = (
        '        <figure class="archive-image-card">\n'
        f'          <a class="archive-image-link" href="{url}" target="_blank" rel="noopener noreferrer">\n'
        f'            <img class="archive-image-img" src="{url}" alt="{alt_e}" loading="lazy" decoding="async">\n'
        '          </a>\n'
        '          <figcaption class="archive-image-cap">\n'
        f'            <p class="archive-image-kind">{kind_e}</p>\n'
        f'            <h3 class="archive-image-title">{title_e}</h3>\n'
        f'            <p class="archive-image-note">{note_e}</p>\n'
        '          </figcaption>\n'
        '        </figure>\n'
    ).encode("utf-8")

    new_data = _insert_at_position(
        data, block,
        rb'<figure class="archive-image-card">',
        v.get("position", ""),
    )

    rel = "src/archive/index.html"
    return OpResult(
        changes=[(rel, data, new_data)],
        summary=f"Add image card to /archive/ Images: {v['title']!r} ({slug})",
        commit_message=f"K35: add /archive/ image card — {v['title']}",
    )


# ============================================================
# 4. ADD RECOMMENDATION CARD
# ============================================================
def add_recommendation(repo_root: Path, v: dict) -> OpResult:
    _require(v, "section", "kind", "title", "url", "note")
    target = repo_root / "src" / "recommendations" / "index.html"
    data = _read(target)

    section = v["section"].strip()
    valid = ("media", "film", "books", "sites", "groups", "work", "art")
    if section not in valid:
        raise OpError(f"Section must be one of {valid}; got {section!r}")

    kind_e = _esc(v["kind"])
    title_e = _esc(v["title"])
    url = v["url"].strip()
    note = v["note"]  # NOTE: kept raw to allow inline <a> + <em> markup

    block = (
        '        <article class="rec-card" data-status="live">\n'
        f'          <p class="rec-card-kind">{kind_e}</p>\n'
        f'          <h3 class="rec-card-title"><a href="{url}" target="_blank" rel="noopener noreferrer">{title_e}</a></h3>\n'
        f'          <p class="rec-card-note">{note}</p>\n'
        '        </article>\n'
    ).encode("utf-8")

    # Recommendations has 7 sections each with its own .rec-cards container.
    # Find the right section first, then scope insertion to that section's articles.
    section_anchor = (f'<section class="rec-section" id="{section}">').encode("utf-8")
    sect_start = data.find(section_anchor)
    if sect_start < 0:
        raise OpError(f"Section anchor not found: {section_anchor!r}")
    sect_end = data.find(b"</section>", sect_start)
    if sect_end < 0:
        raise OpError(f"Section closing tag not found after byte {sect_start}")

    section_bytes = data[sect_start:sect_end]
    try:
        new_section = _insert_at_position(
            section_bytes, block,
            rb'<article class="rec-card"',
            v.get("position", ""),
        )
    except OpError:
        # Section is empty: insert before </div> of .rec-cards
        rc = section_bytes.find(b'<div class="rec-cards">')
        if rc < 0:
            raise OpError(f"No .rec-cards container in section {section!r}.")
        cc = section_bytes.find(b"</div>", rc)
        new_section = section_bytes[:cc] + block + section_bytes[cc:]

    new_data = data[:sect_start] + new_section + data[sect_end:]
    rel = "src/recommendations/index.html"
    return OpResult(
        changes=[(rel, data, new_data)],
        summary=f"Add rec card to /{section}/: {v['title']!r}",
        commit_message=f"K35: add /recommendations/ {section} card — {v['title']}",
    )


# ============================================================
# 5. ADD ESSAY-LIST-ITEM TO /essays/ index
# ============================================================
def add_essay_card(repo_root: Path, v: dict) -> OpResult:
    _require(v, "slug", "eyebrow", "title", "tag")
    target = repo_root / "src" / "essays" / "index.html"
    data = _read(target)

    slug = v["slug"].strip().strip("/")
    eyebrow_e = _esc(v["eyebrow"])
    title_e = _esc(v["title"])
    tag_e = _esc(v["tag"])

    block = (
        '        <li class="essay-list-item">\n'
        f'          <a href="/essays/{slug}/">\n'
        f'            <p class="essay-list-eyebrow">{eyebrow_e}</p>\n'
        f'            <h2 class="essay-list-title">{title_e}</h2>\n'
        f'            <p class="essay-list-tag">{tag_e}</p>\n'
        '          </a>\n'
        '        </li>\n'
    ).encode("utf-8")

    new_data = _insert_at_position(
        data, block,
        rb'<li class="essay-list-item">',
        v.get("position", ""),
    )

    rel = "src/essays/index.html"
    return OpResult(
        changes=[(rel, data, new_data)],
        summary=f"Add essay card to /essays/: {v['title']!r}",
        commit_message=f"K35: add /essays/ index card — {v['title']}",
    )


# ============================================================
# 6. TEXT-SWAP (generic find/replace)
# ============================================================
def text_swap(repo_root: Path, v: dict) -> OpResult:
    _require(v, "file_path", "find_text")
    rel = v["file_path"].strip().lstrip("/").replace("\\", "/")
    if not rel.startswith("src/"):
        raise OpError("File must be inside src/ (relative path). Got: " + rel)
    target = repo_root / rel
    data = _read(target)
    find_b = v["find_text"].encode("utf-8")
    replace_b = v.get("replace_text", "").encode("utf-8")
    count = data.count(find_b)
    replace_all = bool(v.get("replace_all"))
    if count == 0:
        raise OpError("Find string not found in file (pre-flight K33 cxlviii).")
    if count > 1 and not replace_all:
        raise OpError(f"Find string occurs {count} times; either tighten the find, or check 'replace all'.")
    if replace_all:
        new_data = data.replace(find_b, replace_b)
    else:
        new_data = data.replace(find_b, replace_b, 1)
    return OpResult(
        changes=[(rel, data, new_data)],
        summary=f"Text-swap on {rel}: {count} occurrence(s) " + ("(all replaced)" if replace_all else "(first replaced)"),
        commit_message=f"K35: text-swap in {rel}",
    )


# ============================================================
# 7. CACHE-BUMP
# ============================================================
def cache_bump(repo_root: Path, v: dict) -> OpResult:
    _require(v, "old_version", "new_version")
    old = v["old_version"].strip()
    new = v["new_version"].strip()
    if not re.match(r"^K\d+[a-z]?$", old) or not re.match(r"^K\d+[a-z]?$", new):
        raise OpError("Versions must match pattern K<NN> or K<NN><letter>; e.g. K34, K35, K35a")
    old_b = f"?v={old}".encode("utf-8")
    new_b = f"?v={new}".encode("utf-8")

    changes = []
    src = repo_root / "src"
    for html_path in sorted(src.rglob("*.html")):
        d = html_path.read_bytes()
        if old_b in d:
            nd = d.replace(old_b, new_b)
            rel = str(html_path.relative_to(repo_root)).replace("\\", "/")
            changes.append((rel, d, nd))

    if not changes:
        raise OpError(f"No occurrences of {old_b.decode()!r} found in src/**/*.html.")

    return OpResult(
        changes=changes,
        summary=f"Cache-bump {old} -> {new} across {len(changes)} HTML file(s)",
        commit_message=f"K35: cache-bump {old} -> {new}",
    )
