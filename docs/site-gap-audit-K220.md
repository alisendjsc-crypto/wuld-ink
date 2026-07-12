# Site gap audit — K220 · 2026-07-11 · read-only

Basis: a fresh clone at wuld HEAD `df388e6` (post-K219), 69 HTML pages + search-index +
releases/feed + sitemap, static analysis only (no live fetches). Method at the bottom.

## Verdict

Tight. One split fixed in the K220 ship (F1), one stale artifact flagged (F2), two
sitemap-only pages flagged (F3). Everything else is green or by-design.

## Findings

**F1 — footer.css `?v` split (FIXED in the K220 ship).** 60 pages loaded
`footer.css?v=K43`; six loaded `?v=K30` — `src/index.html`, `/watch/`,
`/argument-library/`, `/essays/`, `/glossary/`, `templates/essay.html` (the session-B-era
set that predates the K43 bump). Identical file bytes either way (the query string only
keys caches), so impact was nil by now — synced to K43 anyway. NOTE the fix vehicle: the
admin cache-bump op is version-pair-global per file and would ALSO have bumped
`ambient-player.css?v=K30`, which is a deliberate HOLD — a targeted
`footer.css?v=K30 → K43` string sweep was the correct tool.

**F2 — sitemap.xml is stale (ELECTIVE).** 46 URLs; missing `/notes/` (K208) and
`/troubleshooting/` (K204); `/search/` absent (fine for a utility page); `lastmod` values
frozen around 2026-05-16. Impact low — the site is fully crawlable through the 17-tab nav
and sitemaps are hints, not gates. Fix options: hand-add the two `<url>` blocks (S), or a
`tools/` sitemap generator run per page-add (M) — the generator also future-proofs
admin-created blog/essay/media pages, which today never reach the sitemap.

**F3 — sitemap-only pages (REPORT).** `/coda/` and `/library-about/` have zero on-site
inbound links (sitemap entries only). `/library-about/` is a pin page reachable from the
library side; `/coda/` is its sibling. If they should be discoverable on wuld.ink proper,
one discreet aside on `/argument-library/` covers both (S). May equally be left as-is.

## Green / by-design

- **Dead links: 0 real.** The three hits are `glossary/_template.html` placeholder tokens
  (`[related-1]`, `[essay-slug]`) — a template, never linked, now also excluded from the
  search index by the K220 underscore rule.
- **Nav coverage: 66/66.** Every nav-bearing page carries the IDENTICAL 17-tab set, zero
  deviants — remarkable across ~20 sessions of page adds. The only nav-less page is the
  sealed-class glossary entry (deliberate).
- **Apparent orphans that aren't:** the 8 gallery sub-rooms are client-side-linked
  (gallery-room.js renders the room index from the manifest — static link analysis cannot
  see it; verified by reading the renderer). `/glossary/black-box-of-inaccessibility/` is
  deliberately unlinked (noindex, ambient-skipped; `/archive/` links its ARTWORK, not the
  page — the inaccessibility is the point).
- **Meta/OG/viewport/canonical:** complete on every nav-bearing page. The three
  canonical/og gaps are `404.html` and the two templates (correct for all three).
- **Search-index: zero gaps both directions.** Every indexable page is indexed (both blog
  posts included); no stale entries. The K219 regen was complete.
- **Changelog/feed parity:** releases.json 66 == feed.xml 66 items; newest ids match
  (`2026-07-11-library-v4-0-0`).
- **`?v` audit (post-F1):** every component version is consistent sitewide; the deliberate
  holds (`ambient-player.css` K30, `wrong-hour.css` K208, `ambient-player.js` K209,
  `site-search.css` K98) are intact.

## Method

Link targets resolved against the src tree (`/x/` → `src/x/index.html`; assets literal).
Nav sets compared as ordered href tuples; canonical = the modal set. Component versions
histogrammed from `/components/<name>?v=K<N>` references. Search-index expected-set
recomputed under the K220 skip rules and diffed both ways against the committed index.
Parity counted from releases.json entries vs feed `<item>`s. Client-side-rendered links
are invisible to this method and were verified by reading the renderer source. Findings
that a fix would touch — and the fix itself — were kept strictly separate; only F1
(one-string class) rode the K220 ship.
