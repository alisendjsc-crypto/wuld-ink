#!/usr/bin/env python3
"""Regenerate src/feed.xml (RSS 2.0) from src/releases.json.

src/releases.json is the single source of truth for the public changelog.
Author releases newest-first. After editing releases.json, run:

    python3 tools/changelog/gen_feed.py

This keeps feed.xml in sync. The /changelog/ page and the nav-glow read
releases.json directly at runtime; only feed.xml needs regenerating.
"""
import json, os, html
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REL  = os.path.join(ROOT, 'src', 'releases.json')
OUT  = os.path.join(ROOT, 'src', 'feed.xml')
SITE = 'https://wuld.ink'

DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

def rfc822(datestr):
    d = datetime.strptime(datestr, '%Y-%m-%d').replace(tzinfo=timezone.utc)
    return f"{DAYS[d.weekday()]}, {d.day:02d} {MONTHS[d.month-1]} {d.year} 00:00:00 +0000"

def esc(s):
    return html.escape(str(s), quote=False)

def main():
    with open(REL, encoding='utf-8') as f:
        releases = json.load(f)
    releases = sorted(releases, key=lambda r: r['date'], reverse=True)
    now = datetime.now(timezone.utc)
    build = (f"{DAYS[now.weekday()]}, {now.day:02d} {MONTHS[now.month-1]} "
             f"{now.year} {now.hour:02d}:{now.minute:02d}:{now.second:02d} +0000")
    items = []
    for r in releases:
        secs = r.get('sections', [])
        sec_note = (" (Sections: " + ", ".join(secs) + ")") if secs else ""
        items.append(
            "    <item>\n"
            f"      <title>{esc(r['summary'])}</title>\n"
            f"      <link>{SITE}/changelog/#{esc(r['id'])}</link>\n"
            f"      <guid isPermaLink=\"false\">wuld.ink:{esc(r['id'])}</guid>\n"
            f"      <pubDate>{rfc822(r['date'])}</pubDate>\n"
            f"      <description>{esc(r['summary'])}{esc(sec_note)}</description>\n"
            "    </item>"
        )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        '  <channel>\n'
        '    <title>wuld.ink — changelog</title>\n'
        f'    <link>{SITE}/changelog/</link>\n'
        f'    <atom:link href="{SITE}/feed.xml" rel="self" type="application/rss+xml"/>\n'
        '    <description>Changes to wuld.ink — for posterity and transparency.</description>\n'
        '    <language>en</language>\n'
        f'    <lastBuildDate>{build}</lastBuildDate>\n'
        + "\n".join(items) + "\n"
        '  </channel>\n'
        '</rss>\n'
    )
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(xml)
    print(f"feed.xml: {len(releases)} items, {len(xml.encode('utf-8'))} bytes")

if __name__ == '__main__':
    main()
