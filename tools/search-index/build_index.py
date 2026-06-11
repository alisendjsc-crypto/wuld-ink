#!/usr/bin/env python3
"""build_index.py - wuld.ink site-search index generator (K98).

Usage:  python3 build_index.py --src <repo>/src --out <repo>/src/search-index.json

Deterministic & byte-stable: same input tree -> same bytes (sorted keys,
sorted entries, compact separators, ASCII-escaped, trailing newline, NO
timestamps). Safe to md5-gate at wire time.

Sources:
  pages     every src/**/index.html (h1/title + lede + h2/h3 headings),
            EXCLUDING routes under /_/ (sealed), /search/ (self),
            src/templates/, glossary/_template.html
  glossary  glossary/<slug>/index.html typed 'glossary' (term entries)
  void      category labels regex-extracted from void-engine/index.html
            (file is ~646KB with the inline engine; never parsed as DOM)
  plates    src/gallery/manifest.json - id/num/title/series/room ONLY
            (consent discipline: no body/technique/epitaph, no media keys;
            results link to the ROOM page where the consent gate applies)

Unknown manifest fields (featured, print_url, ...) are ignored by design.
"""
import argparse, collections, html, json, os, re, sys

SKIP_ROUTE_PREFIXES = ("/_/",)
SKIP_ROUTES = ("/search/",)
SKIP_RELPATHS = ("templates/essay.html", "glossary/_template.html")
NO_HEADING_HARVEST = ("/void-engine/",)  # engine body h2s are instrument chrome, not content
HEADING_SKIP_CLASSES = ("destination-title",)  # homepage nav cards duplicate page entries

TAG_RE = re.compile(r"<[^>]+>")

def clean(s):
    """tag-strip + entity-unescape + whitespace-collapse"""
    return " ".join(html.unescape(TAG_RE.sub(" ", s)).split())

def strip_blocks(t):
    # style BEFORE script: a <style> CSS comment may mention the literal
    # "<script>" (watch head note); stripping scripts first would pair that
    # fake open with a real </script> and swallow the body in between.
    t = re.sub(r"<style\b.*?</style>", " ", t, flags=re.S | re.I)
    t = re.sub(r"<script\b.*?</script>", " ", t, flags=re.S | re.I)
    t = re.sub(r"<!--.*?-->", " ", t, flags=re.S)
    return t

def page_title(t, route):
    m = re.search(r"<h1[^>]*>(.*?)</h1>", t, re.S)
    if m:
        h = clean(m.group(1))
        if h:
            return h
    m = re.search(r"<title[^>]*>(.*?)</title>", t, re.S)
    if m:
        # "Changelog &mdash; wuld.ink" -> "Changelog"
        first = clean(m.group(1)).split("—")[0].strip(" -")
        if first:
            return first
    slug = route.strip("/").split("/")[-1]
    return slug.replace("-", " ").title() if slug else "wuld.ink"

def page_lede(t):
    main = re.search(r"<main\b.*?</main>", t, re.S | re.I)
    scope = main.group(0) if main else t
    scope = re.sub(r"<noscript\b.*?</noscript>", " ", scope, flags=re.S | re.I)
    cands = []
    m = re.search(r'<p[^>]*class="[^"]*(?:lede|intro)[^"]*"[^>]*>(.*?)</p>', scope, re.S)
    if m:
        cands.append(clean(m.group(1)))
    for pm in re.finditer(r"<p[^>]*>(.*?)</p>", scope, re.S):
        cands.append(clean(pm.group(1)))
        if len(cands) >= 9:
            break
    pick = next((c for c in cands if len(c) >= 30), next((c for c in cands if c), ""))
    return pick[:197] + "…" if len(pick) > 200 else pick

def headings(t, route):
    """h2 + h3 section headings within <main>. h3 widens coverage to work
    titles / sub-sections (archive books, essay sections, recommendations,
    watch). Chrome filtered: placeholder cards stripped; HEADING_SKIP_CLASSES
    (homepage destination cards) skipped. Deep-links when the heading carries
    an id, else page-level."""
    out = []
    main = re.search(r"<main\b.*?</main>", t, re.S | re.I)
    scope = main.group(0) if main else t
    # drop placeholder cards (e.g. recommendations "pending" entries) - chrome
    scope = re.sub(r'<article[^>]*\bdata-status="placeholder"[^>]*>.*?</article>',
                   " ", scope, flags=re.S | re.I)
    for m in re.finditer(r"<(h[23])([^>]*)>(.*?)</\1>", scope, re.S):
        attrs, inner = m.group(2), m.group(3)
        txt = clean(inner)
        if not txt:
            continue
        clsm = re.search(r'\bclass="([^"]*)"', attrs)
        cls = clsm.group(1) if clsm else ""
        if any(sk in cls for sk in HEADING_SKIP_CLASSES):
            continue
        idm = re.search(r'\bid="([^"]+)"', attrs)
        out.append((txt, route + ("#" + idm.group(1) if idm else "")))
    return out

def build(src):
    entries = []
    counts = collections.Counter()
    # ---- pages + glossary + headings ----
    for dirpath, dirnames, filenames in os.walk(src):
        dirnames.sort()
        if "index.html" not in filenames:
            continue
        rel = os.path.relpath(os.path.join(dirpath, "index.html"), src).replace(os.sep, "/")
        if rel in SKIP_RELPATHS or rel.startswith("templates/"):
            continue
        route = "/" if rel == "index.html" else "/" + rel[: -len("index.html")]
        if route.startswith(SKIP_ROUTE_PREFIXES) or route in SKIP_ROUTES:
            continue
        raw = open(os.path.join(dirpath, "index.html"), encoding="utf-8").read()
        t = strip_blocks(raw)
        title = page_title(t, route)
        lede = page_lede(t)
        is_gloss = route.startswith("/glossary/") and route != "/glossary/"
        etype = "glossary" if is_gloss else "page"
        entries.append({"type": etype, "route": route, "title": title, "text": lede})
        counts[etype] += 1
        if not is_gloss and route not in NO_HEADING_HARVEST:
            seen = set()
            for txt, href in headings(t, route):
                key = (href, txt)
                if key in seen:
                    continue
                seen.add(key)
                entries.append({"type": "heading", "route": href, "title": txt, "text": "section on " + title})
                counts["heading"] += 1
    # ---- void-engine categories ----
    ve_path = os.path.join(src, "void-engine", "index.html")
    if os.path.exists(ve_path):
        ve = open(ve_path, encoding="utf-8").read()
        cc = collections.Counter(re.findall(r"cat:\s*'([^']+)'", ve))
        for label in sorted(cc):
            entries.append({
                "type": "void", "route": "/void-engine/", "title": label,
                "text": "Void Engine transmission category · %d lexicon entries" % cc[label],
            })
            counts["void"] += 1
    # ---- gallery plates (id/num/title/series/room ONLY) ----
    man_path = os.path.join(src, "gallery", "manifest.json")
    if os.path.exists(man_path):
        man = json.load(open(man_path, encoding="utf-8"))
        for p in man.get("plates", []):
            room = p.get("category", "")
            # a room only gets its own route if the sub-room page exists;
            # otherwise plates link to the lobby (editorial lives at /gallery/)
            room_route = ("/gallery/%s/" % room) if os.path.exists(
                os.path.join(src, "gallery", room, "index.html")) else "/gallery/"
            entries.append({
                "type": "plate", "route": room_route,
                "title": (p.get("title") or "").strip(),
                "id": p.get("id", ""), "num": str(p.get("num", "")),
                "series": (p.get("series") or "").strip(), "room": room,
                "nsfw": bool("nsfw" in (p.get("content_flags") or [])),
            })
            counts["plate"] += 1
            counts["plate:" + room] += 1
    entries.sort(key=lambda e: (e["type"], e["route"], e.get("id", ""), e["title"]))
    return {"schema": 1, "counts": dict(sorted(counts.items())), "entries": entries}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    idx = build(a.src)
    blob = json.dumps(idx, ensure_ascii=True, sort_keys=True, separators=(",", ":")) + "\n"
    with open(a.out, "w", encoding="utf-8", newline="\n") as f:
        f.write(blob)
    c = idx["counts"]
    total = sum(v for k, v in c.items() if ":" not in k)
    sys.stderr.write("wrote %s  entries=%d  bytes=%d\n" % (a.out, total, len(blob.encode())))
    for k in sorted(c):
        sys.stderr.write("  %-24s %d\n" % (k, c[k]))

if __name__ == "__main__":
    main()
