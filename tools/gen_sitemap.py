#!/usr/bin/env python3
"""gen_sitemap.py - deterministic sitemap generator for wuld.ink (K222, audit F2).

Usage:
  python3 tools/gen_sitemap.py --repo . --out src/sitemap.xml          # write
  python3 tools/gen_sitemap.py --repo . --check                        # drift gate

Walks src/**/index.html and emits <url> blocks sorted by path. A page is
EXCLUDED when any of these hold (mirrors the search-index discipline where the
two overlap, plus sitemap-specific skips):

  - any path segment starts with "_"          (donors / sealed / templates)
  - <meta name="robots" ... noindex ...>      (404-class + deliberately unlinked)
  - <meta name="wuld-search" content="exclude">  (18+ media pages - never listed)
  - path in SKIP                              (/search/ - utility, hint-free)

lastmod = `git log -1 --format=%as -- <page>` (author date, operator-local at
commit time - the dual-boot skew rule: never stamp with the build machine's
clock). A page with no git history fails loud rather than guessing a date.

changefreq/priority: KNOWN map below (the hand-tuned K-era matrix, preserved
verbatim); unknown future pages fall to rules - /glossary/* -> monthly 0.7,
everything else -> monthly 0.8 (content default; promote hubs by hand when one
is born). Admin-created blog/essay/media pages therefore join the sitemap at
the next regen with sane values and no hand edit.
"""
import argparse, pathlib, re, subprocess, sys

SITE = "https://wuld.ink"
SKIP = {"/search/"}

KNOWN = {
    "/": ("weekly", "1.0"),
    "/archive/": ("weekly", "0.8"),
    "/argument-library/": ("weekly", "0.9"),
    "/blog/": ("weekly", "0.9"),
    "/book/": ("weekly", "0.9"),
    "/coda/": ("weekly", "0.9"),
    "/disclaimers/": ("weekly", "0.9"),
    "/essays/": ("weekly", "0.9"),
    "/frame/": ("weekly", "0.9"),
    "/glossary/": ("weekly", "0.9"),
    "/library-about/": ("weekly", "0.9"),
    "/changelog/": ("weekly", "0.8"),
    "/chat/": ("weekly", "0.7"),
    "/gallery/": ("weekly", "0.9"),
    "/music/": ("weekly", "0.9"),
    "/notes/": ("weekly", "0.9"),
    "/preface/": ("monthly", "0.6"),
    "/troubleshooting/": ("monthly", "0.8"),
    "/void-engine/": ("weekly", "0.9"),
    "/watch/": ("weekly", "0.9"),
}

NOINDEX = re.compile(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', re.I)
WSEARCH = re.compile(r'<meta[^>]+name=["\']wuld-search["\'][^>]+content=["\']exclude["\']', re.I)


def freq_pri(path):
    if path in KNOWN:
        return KNOWN[path]
    if path.startswith("/glossary/"):
        return ("monthly", "0.7")
    return ("monthly", "0.8")


def pages(src):
    for f in sorted(src.rglob("index.html")):
        rel = f.relative_to(src)
        if any(part.startswith("_") for part in rel.parts):
            continue
        path = "/" if rel.parent == pathlib.Path(".") else "/" + rel.parent.as_posix() + "/"
        if path in SKIP:
            continue
        head = f.read_text(encoding="utf-8", errors="replace")[:4096]
        if NOINDEX.search(head) or WSEARCH.search(head):
            continue
        yield path, f


def lastmod(repo, f):
    d = subprocess.run(["git", "log", "-1", "--format=%as", "--", str(f.relative_to(repo))],
                       cwd=repo, capture_output=True, text=True).stdout.strip()
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
        sys.exit(f"FAIL: no git date for {f} - commit the page first (never stamp from the local clock)")
    return d


def build(repo):
    src = repo / "src"
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    n = 0
    for path, f in sorted(pages(src)):
        cf, pr = freq_pri(path)
        out += ["  <url>",
                f"    <loc>{SITE}{path}</loc>",
                f"    <lastmod>{lastmod(repo, f)}</lastmod>",
                f"    <changefreq>{cf}</changefreq>",
                f"    <priority>{pr}</priority>",
                "  </url>"]
        n += 1
    out.append("</urlset>")
    return "\n".join(out) + "\n", n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=".")
    ap.add_argument("--out")
    ap.add_argument("--check", action="store_true")
    a = ap.parse_args()
    repo = pathlib.Path(a.repo).resolve()
    xml, n = build(repo)
    target = repo / (a.out or "src/sitemap.xml")
    if a.check:
        cur = target.read_bytes() if target.exists() else b""
        if cur == xml.encode("utf-8"):
            print(f"OK: sitemap current ({n} urls)")
            return
        sys.exit(f"DRIFT: regenerated sitemap ({n} urls) != {target} - rerun with --out")
    target.write_bytes(xml.encode("utf-8"))
    print(f"wrote {target}  urls={n}")


if __name__ == "__main__":
    main()
