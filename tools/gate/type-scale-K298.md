# K298 — phone type-scale escape census

`mobile-a11y.css` scales headings at <=640 with BARE element selectors (h1 34.2px / h2 27 / h3 22.5 at 390px).
Any class-qualified `font-size` rule beats them by specificity. This is the census of every such escape.

**Measured:** 78 pages, 77 measured, 402 in-`<main>` headings, **158 escapes on 45 routes**. An escape is `font-size > scale x 1.05`.

**Instrument:** `tools/gate/type_scale_audit.cjs`. Fresh page per route, `serviceWorkers:'block'`, and a
**document-identity assert** (measured `location.pathname` must equal the requested route).

> **Why those three belts exist — read before reusing this instrument.** The first cut of this census
> reused one page across the crawl and reported *the opposite of the truth*: it said the K298 fix changed
> nothing. Two defects, both caught only because a known-good answer disagreed. (1) The pages register the
> K276 **service worker** (it is `pointer: coarse`-gated, and a mobile crawl is coarse); once it controls
> the origin it serves `?v` assets **cache-first from its own cache**, so a local-mirror crawl silently
> measures stale stylesheets — and the answer then depends on how many pages you crawled. (2) The identity
> assert caught `/glossary/black-box-of-inaccessibility/` reporting an `<h1>` **on a page that has none** —
> it is a `meta refresh` redirect to `/glossary/contextus-claudit/`. Expected, not a defect; it is the one
> route this census cannot measure in place.

> **The committed reach gate `tools/gate/reach_audit.cjs` is mobile-emulated and does NOT block service
> workers** — same exposure. Not changed here (that would invalidate the K297 baseline mid-ship), but it is
> the likely mechanism behind K297's unexplained `/console/@phone stickyBottom 596 -> 152` on identical bytes.

## Escapes, grouped (pristine, pre-K298)

| ratio | lvl | px | inst | pages | max lines | max h | class | K298 |
|---|---|---|---|---|---|---|---|---|
| 3.27x | H1 | 112 | 1 | 1 | 1 | 68 | `.(none)` | deliberate |
| 2.11x | H1 | 72 | 1 | 1 | 3 | 189 | `.cover-mark cover-mark--video` | deliberate |
| 1.58x | H1 | 54 | 22 | 22 | 4 | 255 | `.entry-term` | **FIXED** |
| 1.58x | H1 | 54 | 10 | 10 | 2 | 127 | `.page-hero-title` | **FIXED** |
| 1.5x | H3 | 33.75 | 5 | 1 | 2 | 81 | `.archive-book-title` | recorded |
| 1.5x | H3 | 33.75 | 5 | 1 | 2 | 81 | `.archive-image-title` | recorded |
| 1.5x | H2 | 40.5 | 2 | 1 | 2 | 94 | `.donations-section-heading` | **FIXED** |
| 1.5x | H2 | 40.5 | 4 | 1 | 2 | 96 | `.essay-list-title` | recorded |
| 1.5x | H3 | 33.75 | 1 | 1 | 2 | 81 | `.rec-card-title` | recorded |
| 1.5x | H2 | 40.5 | 3 | 1 | 1 | 47 | `.archive-section-title` | recorded |
| 1.5x | H2 | 40.5 | 3 | 1 | 1 | 47 | `.contact-section-heading` | recorded |
| 1.5x | H2 | 40.5 | 7 | 1 | 1 | 47 | `.rec-section-heading` | recorded |
| 1.5x | H2 | 40.5 | 2 | 1 | 1 | 47 | `.ts-section-heading` | recorded |
| 1.25x | H2 | 33.75 | 5 | 1 | 2 | 89 | `.book-section-heading` | recorded |
| 1.25x | H2 | 33.75 | 4 | 1 | 2 | 89 | `.frame-section-heading` | recorded |
| 1.25x | H2 | 33.75 | 1 | 1 | 1 | 39 | `.music-grid-heading` | recorded |
| 1.25x | H2 | 33.75 | 4 | 1 | 1 | 50 | `.project-section-heading` | recorded |
| 1.2x | H2 | 32.3 | 13 | 1 | 3 | 111 | `.(none)` | deliberate |
| 1.2x | H3 | 27 | 50 | 1 | 3 | 97 | `.rec-card-title` | recorded |
| 1.2x | H3 | 27 | 9 | 1 | 2 | 73 | `.video-title` | recorded |
| 1.2x | H3 | 27 | 3 | 1 | 1 | 32 | `.memento-title` | recorded |
| 1.2x | H3 | 27 | 1 | 1 | 1 | 36 | `.music-title` | recorded |
| 1.18x | H1 | 40.5 | 1 | 1 | 1 | 48 | `.archive-page-title` | recorded |
| 1.18x | H1 | 40.5 | 1 | 1 | 1 | 48 | `.page-hero-title` | **FIXED** |

## What K298 fixed: **33 escapes closed, 0 new**

| class | where | instrument |
|---|---|---|
| `.entry-term` | 22 glossary entry pages | `components/glossary.css` — phone block |
| `.gallery-page .page-hero-title` | 9 gallery room pages | `components/gallery.css` — phone block |
| `.donations-section-heading` | `/donations/` | page-local, rode the rhythm pass |

Worst case closed: a glossary headword at **54px / 4 lines / 255px tall** becomes **34.2px / 2 lines / 77px**.

## Deliberately NOT fixed

- **`/` cover mark, 2.11x** and **`/_/successor-protocol/`, 1.2x** — identity and a sealed page.
- **`/illogically-is/dot/apparatus/`, 3.27x** — a chrome-less generated artifact that does not load `mobile-a11y.css` at all; K294's *do not restyle the content* binds.
- **`/glossary/black-box-of-inaccessibility/`** — styles `.entry-term` in its own page and does not link `glossary.css`; it is a redirect stub, so no reader sees it.
- **Every other page-local escape** (`.archive-*`, `.rec-*`, `.essay-list-title`, `.video-title`, `.book-section-heading`, `.frame-section-heading`, `.music-*`, `.contact-section-heading`, `.ts-section-heading`, `.project-section-heading`, `.memento-title`) — one route each, and none is on a page K298 touched. Recorded here so the next session inherits a list, not a grep.

**Note on `/watch/`:** it already carries a phone rule for `.page-hero-title`, but it targets `var(--t-h2)` (40.5px) rather than the phone clamp — a half-fix, still 1.18x. Cheapest of the remaining, if one is ever wanted.

