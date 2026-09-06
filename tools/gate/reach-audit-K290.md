# The reach audit — K290 (2026-09-06)

**Run it again:** `node tools/gate/reach_audit.cjs <copy-of-src> tools/gate/reach-pages.txt out.json`
(page list = every page carrying `class="site-nav"`, the same 70-page set `sweep_mobile_nav.py` targets).
Raw evidence: `tools/gate/reach-audit-K290.json` (140 rows = 70 pages × 2 viewports).

---

## Why this exists

K287 gated touch-target size, horizontal overflow and desktop inertness. Every gate passed. It
shipped. `/void-engine/` was still **4.7 phone screens of chrome before the lexicon**, and Josiah
found it in thirty seconds on his own phone. **Every gate measured whether the page was correct;
none measured whether it was reachable.** Seventy pages had never been asked.

## The metric — and the correction to it

The commissioned rule was *first-content offset*: the first non-chrome element carrying a
non-empty text node or being `img`/`video`/`canvas`, divided by 844.

**That rule is inert on this site.** Its worst score across all 70 pages is **264 px = 0.31
screens** (`/`). It measures how far down the page-hero eyebrow sits, and the site's chrome is
disciplined, so it always answers "fine". Run against the pre-K287b `/void-engine/` it would have
scored ~0.24 screens and passed the exact page that started this. **A gate that can only return
one value is not a gate.** It is reported below in full, as commissioned, and it is column four.

So three numbers per page, off one crawl:

| symbol | rule |
|---|---|
| `y_content` | **the commissioned rule, verbatim.** First non-chrome *visible* element with a direct non-empty text node, or `img`/`video`/`canvas`/`svg`/`picture`/`iframe`. |
| `y_first` | **first browsable group** — ≥3 visible sibling elements sharing tag+class, each ≥24 px tall, signature tag not a bare text-flow tag (`p`, `h1`–`h6`, `blockquote`, `pre`, `span`, …), and ≥half the members carrying a link, control, media, or ≥20 characters of text. The first thing on the page you can act on or browse. |
| `y_payload` | **largest browsable group** — same test, ranked by member count. The page's own index/grid/list: the lexicon, the plate wall, the card deck. |

**Ordering rule: MINIMUM DOCUMENT-Y, tie-broken by document order** — not document order alone.
Grid and flex `order` make document order a lie about what the eye meets first.

**Chrome** (excluded by construction) = anything inside a `<nav>`, inside `header.site-header` or a
`<header>` that is a direct child of `<body>`, inside `<footer>`, inside `.skip-link`, or inside any
`position: fixed` / `position: sticky` container. The mobile sticky INDEX bar is chrome by this rule.

The chosen element's **selector is printed with every number**, so a misclassification is visible
in the output instead of buried in the score.

## Harness

Playwright/Chromium, 390×844 `isMobile+hasTouch` (so `(pointer: coarse)` and `(hover: none)` fire
and `mobile-nav.js` actually builds) and 1280×900 desktop. **Every request is fulfilled from a
local copy of `src/` through `context.route`; any other origin is aborted** — K289 lost two
minutes to hanging `fonts.googleapis.com` fetches, and neither the container nor the device VM
can reach `wuld.ink`. No HTTP server is used at all (Cowork's device shell is `--die-with-parent`,
so a backgrounded server does not survive the call that started it).

### Calibration — the gate was fed four answers it already had

| case | independently known | this harness | Δ |
|---|--:|--:|--:|
| `/void-engine/` first lexicon card, phone (K287b stratum) | **2,162** | **2,162** | 0 |
| `/void-engine/` `docH`, phone (K287b stratum, pre-K289) | 101,049 | 101,098 | +49 (K289's six added spans) |
| `/void-engine/` `.hdr` height (K287b stratum) | 397 | 400 | +3 |
| `/music/` · `/frame/` · `/book/` first group (hand-probed separately) | 1,249 · 1,645 · 1,462 | 1,249 · 1,645 · 1,462 | 0 |

**Two defects were found in the gate by doing this, both fixed before the run that produced the
table below:**

1. **`/chat/` scored `y_content` = −9,995.** A screen-reader live region at `left: -9999px` has
   real width and height, so it passed a naive visibility test and became "first content" *above
   the top of the document*. Offscreen, sub-2px and `clip: rect(0,0,0,0)` elements are now rejected.
2. **`/music/`, `/frame/`, `/book/` reported NO GROUP AT ALL** while their payload sat 1.5–2.0
   screens down, because the "browsable" test demanded a link or media and those lists carry
   neither. The text clause (≥20 chars) was added. Without it the gate could only ever return one
   value for those pages.

---

## The table — 70 pages, ranked worst first by `y_first` at 390×844

| # | page | first px | first scr | payload px | payload scr | desktop first | dsk scr | docH | first-group selector |
|--:|---|--:|--:|--:|--:|--:|--:|--:|---|
| 1 | `/archive/` | 2397 | **2.84** | 12804 | 15.17 | 1639 | 1.82 | 18154 | `body > main.archive-page > section.archive-section` |
| 2 | `/frame/` | 1645 | **1.95** | 1645 | 1.95 | 1413 | 1.57 | 5603 | `main#main > article.page > section.frame-section` |
| 3 | `/donations/` | 1595 | **1.89** | 1595 | 1.89 | 1465 | 1.63 | 3975 | `main#main > section.donations-section > div.donations-platforms > article.donations-platform` |
| 4 | `/gallery/` | 1568 | **1.86** | 2841 | 3.37 | 1193 | 1.33 | 11826 | `div#gallery-cat-grid > a.gallery-cat-card` |
| 5 | `/recommendations/` | 1509 | **1.79** | 2363 | 2.80 | 1197 | 1.33 | 21467 | `main#main > section.rec-section` |
| 6 | `/book/` | 1462 | **1.73** | 1462 | 1.73 | 1608 | 1.79 | 6740 | `main#main > article.page > section.book-section` |
| 7 | `/music/` | 1249 | **1.48** | 1249 | 1.48 | 2098 | 2.33 | 2073 | `article.music-card > div.music-meta > details.music-tracklist > ol > li` |
| 8 | `/gallery/original-character/` | 1163 | **1.38** | 1163 | 1.38 | 1010 | 1.12 | 5149 | `section#gallery-grid > article.gallery-plate.gallery-plate-withheld` |
| 9 | `/gallery/the-wrong-thing/` | 1099 | **1.30** | 1099 | 1.30 | 992 | 1.10 | 2599 | `section#gallery-grid > article.gallery-plate.gallery-plate-withheld` |
| 10 | `/changelog/` | 1058 | **1.25** | 1058 | 1.25 | 963 | 1.07 | 40356 | `ol#changelog-list > li.changelog-entry` |
| 11 | `/console/` | 1050 | **1.24** | 1050 | 1.24 | 1090 | 1.21 | 2025 | `div#console-app > div.con-term.con-fx.con-fx-low > div.con-ctrl > button.con-btn` |
| 12 | `/gallery/gore/` | 1035 | **1.23** | 1035 | 1.23 | 992 | 1.10 | 2748 | `section#gallery-grid > article.gallery-plate.gallery-plate-withheld` |
| 13 | `/void-engine/` | 1031 | **1.22** | 2162 | 2.56 | 531 | 0.59 | 101098 | `div.app > div.panel > div.pb.col > div.ctrl > select` |
| 14 | `/gallery/mascot-yurei/` | 982 | **1.16** | 982 | 1.16 | 936 | 1.04 | 2630 | `section#gallery-grid > article.gallery-plate.gallery-plate-withheld` |
| 15 | `/gallery/other/` | 982 | **1.16** | 982 | 1.16 | 936 | 1.04 | 2630 | `section#gallery-grid > article.gallery-plate.gallery-plate-withheld` |
| 16 | `/gallery/workshop/` | 973 | **1.15** | 1599 | 1.89 | 884 | 0.98 | 16834 | `div#gallery-chips > button.gallery-chip` |
| 17 | `/gallery/main-character/` | 945 | **1.12** | 1943 | 2.30 | 873 | 0.97 | 15383 | `div#gallery-chips > button.gallery-chip` |
| 18 | `/watch/` | 802 | **0.95** | 802 | 0.95 | 802 | 0.89 | 4901 | `main#main > div.video-grid > article.video-card` |
| 19 | `/glossary/` | 734 | **0.87** | 734 | 0.87 | 798 | 0.89 | 4604 | `main#main > article.page > ul.glossary-list` |
| 20 | `/ne-hoc-fiat/` | 716 | **0.85** | 716 | 0.85 | 723 | 0.80 | 3051 | `main#main > article.page > section.project-section` |
| 21 | `/notes/` | 685 | **0.81** | 685 | 0.81 | 572 | 0.64 | 2118 | `main#main > div.notes-app > section.notes-main > div.notes-toolbar > button.notes-btn` |
| 22 | `/violence-as-reductio/` | 636 | **0.75** | 636 | 0.75 | 561 | 0.62 | 2310 | `main#main > article.essay > header.essay-header > div.mode-toggle > button.mode-toggle-btn` |
| 23 | `/troubleshooting/` | 613 | **0.73** | 613 | 0.73 | 598 | 0.66 | 4150 | `main#main > section.ts-section` |
| 24 | `/why-not-suicide/` | 599 | **0.71** | 599 | 0.71 | 561 | 0.62 | 2184 | `main#main > article.essay > header.essay-header > div.mode-toggle > button.mode-toggle-btn` |
| 25 | `/glossary/no-essential-protection-from-destruction/` | 565 | **0.67** | 1947 | 2.31 | 483 | 0.54 | 3215 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 26 | `/contact/` | 554 | **0.66** | 841 | 1.00 | 607 | 0.67 | 3576 | `main#main > section.contact-section` |
| 27 | `/glossary/empirical-asymmetry-argument/` | 551 | **0.65** | 809 | 0.96 | 468 | 0.52 | 3048 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 28 | `/glossary/contextus-claudit/` | 523 | **0.62** | 781 | 0.93 | 504 | 0.56 | 3170 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 29 | `/glossary/synapse-syntax-lapse/` | 487 | **0.58** | 745 | 0.88 | 468 | 0.52 | 2353 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 30 | `/glossary/censorship-reversal-trap-door/` | 479 | **0.57** | 737 | 0.87 | 419 | 0.47 | 3115 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 31 | `/glossary/framework-vs-actor-distinction/` | 479 | **0.57** | 737 | 0.87 | 419 | 0.47 | 2906 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 32 | `/glossary/modal-architectural-pessimism/` | 479 | **0.57** | 1921 | 2.28 | 419 | 0.47 | 3357 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 33 | `/essays/alogically-is/` | 468 | **0.55** | 468 | 0.55 | 561 | 0.62 | 18467 | `main#main > article.essay > header.essay-header > div.mode-toggle > button.mode-toggle-btn` |
| 34 | `/glossary/anfractuous-aporia/` | 465 | **0.55** | 723 | 0.86 | 419 | 0.47 | 3035 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 35 | `/disclaimers/` | 459 | **0.54** | 459 | 0.54 | 536 | 0.60 | 10502 | `main#main > article.page > div.disclaimer-body > section.disclaimer-section` |
| 36 | `/library-about/` | 457 | **0.54** | 1085 | 1.29 | 501 | 0.56 | 4152 | `main#main > article.lib-page > header.lib-hero > div.mode-toggle > button.mode-toggle-btn` |
| 37 | `/coda/` | 438 | **0.52** | 438 | 0.52 | 460 | 0.51 | 1827 | `main#main > article.essay > header.essay-header > div.mode-toggle > button.mode-toggle-btn` |
| 38 | `/glossary/foundational-fork/` | 438 | **0.52** | 696 | 0.82 | 419 | 0.47 | 2067 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 39 | `/essays/sanguinolentum-vestigium/` | 431 | **0.51** | 431 | 0.51 | 524 | 0.58 | 16438 | `main#main > article.essay > header.essay-header > div.mode-toggle > button.mode-toggle-btn` |
| 40 | `/templates/essay.html` | 427 | **0.51** | 676 | 0.80 | 460 | 0.51 | 3916 | `main#main > article.essay > header.essay-header > div.mode-toggle > button.mode-toggle-btn` |
| 41 | `/essays/a-life-inside/` | 425 | **0.50** | 1923 | 2.28 | 518 | 0.58 | 14669 | `main#main > article.essay > header.essay-header > div.mode-toggle > button.mode-toggle-btn` |
| 42 | `/glossary/_template.html` | 423 | **0.50** | 681 | 0.81 | 468 | 0.52 | 1771 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 43 | `/glossary/w-holes/` | 423 | **0.50** | 681 | 0.81 | 468 | 0.52 | 3002 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 44 | `/glossary/cascade-math-safeguard/` | 415 | **0.49** | 673 | 0.80 | 419 | 0.47 | 3140 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 45 | `/glossary/labor-sine-fructu/` | 415 | **0.49** | 2057 | 2.44 | 419 | 0.47 | 2986 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 46 | `/glossary/protecting-class-absence/` | 415 | **0.49** | 673 | 0.80 | 419 | 0.47 | 3148 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 47 | `/glossary/proxy-gamble/` | 415 | **0.49** | 673 | 0.80 | 419 | 0.47 | 3049 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 48 | `/glossary/two-layer-architecture/` | 415 | **0.49** | 673 | 0.80 | 419 | 0.47 | 3235 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 49 | `/essays/architecture-of-moral-disaster/` | 405 | **0.48** | 893 | 1.06 | 460 | 0.51 | 12337 | `main#main > article.essay > header.essay-header > div.mode-toggle > button.mode-toggle-btn` |
| 50 | `/successor/` | 405 | **0.48** | 1425 | 1.69 | 460 | 0.51 | 1903 | `main#main > article.essay > header.essay-header > div.mode-toggle > button.mode-toggle-btn` |
| 51 | `/glossary/alogical-isness/` | 401 | **0.48** | 659 | 0.78 | 419 | 0.47 | 3015 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 52 | `/glossary/ne-hoc-fiat/` | 401 | **0.48** | 659 | 0.78 | 468 | 0.52 | 2926 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 53 | `/glossary/nothingist/` | 374 | **0.44** | 374 | 0.44 | 419 | 0.47 | 1818 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 54 | `/glossary/signal/` | 352 | **0.42** | 610 | 0.72 | 419 | 0.47 | 2758 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 55 | `/glossary/transmission/` | 352 | **0.42** | 610 | 0.72 | 419 | 0.47 | 2788 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 56 | `/glossary/void-engine/` | 352 | **0.42** | 610 | 0.72 | 419 | 0.47 | 2758 | `main#main > article.entry > header.entry-header > div.mode-toggle > button.mode-toggle-btn` |
| 57 | `/essays/` | 349 | **0.41** | 349 | 0.41 | 491 | 0.55 | 1871 | `main#main > article.page > ul.essay-list > li.essay-list-item` |
| 58 | `/404.html` | — | **—** | — | — | — | — | 1028 | _[no group; content]_ `main#main > div.not-found > p.not-found-line` |
| 59 | `/argument-library/` | — | **—** | — | — | — | — | 2577 | _[no group; content]_ `main#main > article.page > header.page-hero > p.eyebrow` |
| 60 | `/blog/` | — | **—** | — | — | — | — | 1551 | _[no group; content]_ `main#main > article.page > header.page-hero > p.eyebrow` |
| 61 | `/blog/load-bearing/` | — | **—** | — | — | — | — | 2876 | _[no group; content]_ `main#main > article.post > header.post-header > p.eyebrow` |
| 62 | `/blog/the-easiest-case/` | — | **—** | — | — | — | — | 3280 | _[no group; content]_ `main#main > article.post > header.post-header > p.eyebrow` |
| 63 | `/book/nothingist/` | — | **—** | — | — | — | — | 11995 | _[no group; content]_ `main#main > article.page > header.page-hero > p.eyebrow` |
| 64 | `/chat/` | — | **—** | — | — | — | — | 3555 | _[no group; content]_ `main#main > header.page-hero > p.page-hero-eyebrow` |
| 65 | `/gallery/gap-dweller/` | — | **—** | — | — | — | — | 1993 | _[no group; content]_ `main#main > p.gallery-room-back > a` |
| 66 | `/gallery/the-tall-one/` | — | **—** | — | — | — | — | 1993 | _[no group; content]_ `main#main > p.gallery-room-back > a` |
| 67 | `/` | — | **—** | — | — | 1230 | 1.37 | 1194 | _[no group; content]_ `section.cover > div.cover-mark-block > h1.cover-mark.cover-mark--video > video.cover-mark-video` |
| 68 | `/preface/` | — | **—** | — | — | — | — | 1867 | _[no group; content]_ `main#main > article.page > header.page-hero > p.eyebrow` |
| 69 | `/search/` | — | **—** | — | — | — | — | 1209 | _[no group; content]_ `main#main > article.page > header.page-hero > p.eyebrow` |
| 70 | `/watch/_donor/` | — | **—** | — | — | — | — | 1352 | _[no group; content]_ `main#main > article.media-page > header.page-hero > p.page-hero-eyebrow` |

phone first-group  >=2.00 screens: 1 · 1.50-1.99: 5 · 1.00-1.49: 11 · <1.00: 40 · no group (prose/portal): 13 of 70
spec-rule y_content, worst across all 70 pages: 264 px = 0.31 screens

---

## What the numbers say

**The site is broadly fine and there is no second `/void-engine/`.** 40 of the 57 pages with a
group put it inside one screen; the commissioned metric passes everywhere by a factor of three.
Nothing here is an incident. But six pages put their first browsable thing past 1.5 screens on a
phone, and one of those is the worst-shaped page on the site.

### Tier 1 — the one page that is genuinely wrong

**`/archive/` — first group 2,397 px (2.84 screens), payload 12,804 px (15.17 screens), and
1.82 screens on DESKTOP.** It is the only page that is bad at both widths, and it is worse on a
phone today than `/void-engine/` is after two sessions of work on it. The 15.17 figure is a
`div.archive-ku-gallery` image strip *inside one book's article* rather than the archive index —
the largest-group heuristic misfires here, and the printed selector is how you can see that — but
the honest number, first-section at 2.84 screens, still ranks first on the site.

### Tier 2 — past 1.5 screens on a phone

| page | first | note |
|---|--:|---|
| `/frame/` | 1.95 | 4 framework sections; 1.57 screens on desktop too |
| `/donations/` | 1.89 | 3 platform cards — the page has exactly one job |
| `/gallery/` | 1.86 | 9 category cards; payload (27 plates) at 3.37 |
| `/recommendations/` | 1.79 | 51 cards behind 1.8 screens of preamble |
| `/book/` | 1.73 | **worse on desktop (1.79) than on phone** — the only page that inverts |
| `/music/` | 1.48 | **2.33 screens on DESKTOP** — the other inversion |

### Tier 3 — the payload/first split ≥ 2×

Pages where you reach *something* early but the thing you came for is much deeper:
`/archive/`, `/void-engine/` (1.22 → 2.56), `/gallery/main-character/` (1.12 → 2.30),
`/library-about/` (0.54 → 1.29), `/successor/` (0.48 → 1.69), `/essays/a-life-inside/`
(0.50 → 2.28), and four glossary entries whose see-also lists sit 2.3–2.4 screens down.
Most of these are prose pages where depth is the point; `/gallery/main-character/` is not.

### Known wobbles in the classification, stated rather than hidden

- **Glossary and essay entries report `y_first` ≈ 415 px at `header.entry-header > div.mode-toggle
  > button`** — the reader-mode control cluster. It is a real, reachable, browsable group of three
  buttons, but it is closer to chrome than to content. It never changes a ranking (all such pages
  score < 0.7), and the selector says so on every row.
- **`/` reports no group on phone.** Correct and intended: `a.destination × 6` is present but
  `invisible(0/6)` — K282/K283 retired the duplicate index grid on phones. Desktop shows 1.37.
- **13 pages report no group**: prose (`/preface/`, `/blog/*`, `/book/nothingist/`,
  `/ne-hoc-fiat/`…), 2-item pages (`/blog/` has two post cards, `/gallery/gap-dweller/` and
  `/gallery/the-tall-one/` two plates each), and pages with nothing to group (`/search/`,
  `/404.html`, `/watch/_donor/`, `/chat/`). For all of them `y_content` governs and all are ≤ 0.31.
- **`/argument-library/` reports no group but IS a finding** — see below.

---

## Secondary — the K289 question asked of the surfaces nobody asked it of

Method: enumerate every `addEventListener` / inline handler per surface, then read the ones a
phone cannot produce. **Reported, not fixed.**

### `/console/` — CLEAR

9 `click` bindings, all on real buttons (`soundBtn`, `crtBtn`, `helpBtn`, `mapBtn`, `newBtn`,
`shareBtn`, `sigilBtn`, `save`, `out`), plus `input` + `submit` for commands. The single `keydown`
is ArrowUp/ArrowDown command history and "any key completes an in-flight typeout" — a convenience
on a surface that raises a soft keyboard anyway. `console-scene.js` pairs its `keydown` with an
`onOvlClick`. **No primary action is pointer- or key-only.**

### `/watch/` — CLEAR, and its own comment is accurate

`theater-mode.js` opens on a **delegated `click`** on `[data-theater-video-id]` — touch-native.
It closes **three** ways: the close button's `click`, `overlay` click-outside (`e.target ===
overlay`), and Esc. Two of the three work on a phone, and focus is moved to the close button on
open. The HTML comment at `src/watch/index.html:334,690` ("click outside any card OR press
Escape") is true on touch. **Nothing owed.**

### `/argue/` — DOES NOT EXIST, AND IS LINKED ANYWAY

There is no `/argue/` route in `src/` and no rule for it in `_redirects`. **`src/successor/index.html:266`
links to `/argue/`** ("The referee — /argue/"), so that link 404s on the live site today.
Argue the Argument lives in `D:\Argue the Argument`, a separate project; the prompt inherited the
path from this link rather than from a route. **Smallest real defect found this session.**

### `/void-engine/` — two pointer-only bindings beyond the known `oncontextmenu`

- **`document.addEventListener('dblclick')` → fullscreen toggle** (line 5151). iOS Safari does not
  synthesise `dblclick` dependably (double-tap is zoom) and does not support `requestFullscreen`
  on non-video elements at all. **Fullscreen is unreachable on iPhone, with no alternative
  affordance and no hint** — the same shape as K289, one notch less important because fullscreen
  is an enhancement rather than the instrument.
- **`canvas.addEventListener('mousedown')`** (line 4993, gated on `transRunning`) — browsers
  synthesise `mousedown` with `clientX/clientY` after a tap, so this most likely works; it has
  not been measured on a real phone and should not be assumed.
- 86 inline `onclick=` handlers: all touch-native.

### `/successor/` — one minor

`successor-stage.js:313` wakes the stage on `mousemove`, which never fires on touch. Taps still
produce `click` (line 312) and `keydown` (314) also wakes it, so a phone user who interacts is
fine; a phone user who only *reads* may see it idle out where a desktop user would not.

---

## Recommendation

`/archive/` is the next session, alone. It is the only page that is bad at both widths, its
desktop number (1.82 screens) is worse than most pages' phone numbers, and it is the site's
memory — the one surface where "I could not find the thing" is the whole failure mode.
`/frame/`, `/donations/`, `/gallery/`, `/recommendations/`, `/book/` and `/music/` are a
second, cheaper batch. The `/argue/` dead link and the `/void-engine/` fullscreen affordance are
one-line riders on whichever session goes next.

---

## Found while calibrating: THREE of the K289 `verify_before` pins are wrong

Verifying the gate against the pinned state — the thing a session is supposed to do at open —
turned up pins that match nothing. All three are now confirmed three ways (**disk == git blob ==
bytes served by `wuld.ink`**), so it is the pins that are wrong, not the files.

| file | pinned in K289 `verify_before` | disk | blob at HEAD | live-served | true since |
|---|---|---|---|---|---|
| `src/index.html` | `25395c1a` | `ef24e174` | `ef24e174` | `ef24e174` (27,690 B) | K287b `888b81a` |
| `src/base.css` | `144b2841` **"BYTE-FROZEN"** | `f7b7f4ea` | `f7b7f4ea` | `f7b7f4ea` | **K34, 2026-05-23** |
| `src/tokens.css` | `4654928d` **"BYTE-FROZEN"** | `870bf737` | `870bf737` | `870bf737` | **K24c, 2026-05-15** |

- `25395c1a` **is** `src/index.html` at K285 (`eebed70`) — correct when first written into the
  K286 block. K287 changed the file to `bb39c7c5` and K287b changed it to `ef24e174`, **and the
  pin was copied forward unchanged through five successive `verify_before` blocks** (K287+, K288+,
  the K288+ supersede, K289+, K290+) — including K287b's own, in the session that changed the file.
- `144b2841` and `4654928d` correspond to **no commit in either file's history**. `base.css` has
  been `f7b7f4ea` since 2026-05-23; `tokens.css` has been `870bf737` since 2026-05-15. Both
  values are independently corroborated by the **K271 stratum**, which recorded
  "tokens `870bf737` / base `f7b7f4ea` … UNCHANGED" at verify-at-open and was right.

**The mechanism, and why "BYTE-FROZEN" is what protected the error.** The `verify_before` block is
carried forward wholesale each session. A pin is therefore only as true as the last session that
actually *ran* it — and the pins labelled byte-frozen are precisely the ones no session ever
bothers to check, because the label says they cannot have moved. Nobody was harmed only because
nobody used them: a session that had gated `src/base.css` against `144b2841` would have aborted on
a correct file, for months, with a message that looked like a real defect. **Hazard cclxii.** This
is cclxi's family again — a gate that can only return one value — one level up, at the level of
the constants the gates are fed.

Everything else in the K289 block verified clean: `void-engine/index.html` `45695ad9` (and the
**served** bytes are byte-identical at 648,526 B), `mobile-a11y.css` `a5ed6a2c`, `ambient-player.css`
`76f06ba2`, `mobile-nav.css` `7f7d888b`, `mobile-nav.js` `73742bb7`, `sweep_mobile_nav.py`
`71a8dd48`, `sw.js` `679eaa5d` @ `wuld-sw-K287b`, `contact` `64f95065`, `donations` `3248341c`,
`chat` `1ea1cebd`, `recommendations` `61b62f38` (51 `<article class="rec-card`), `search-index.json`
`2c898738`, `releases.json` `93d2e054`, `feed.xml` `aff10731`, sitemap 64 `<loc>`,
`archive/kickoffs/` 18 files, and `sweep_mobile_nav.py` reporting
`targets=70 skipped=6 already=70 to-write=0`.

### A process capability that changes future sessions

**The Cowork device shell CAN reach `wuld.ink`.** Every live assertion in this document was made
from it (`https://wuld.ink/argue/` → 404, `/successor/` → 200, `/void-engine/` → 648,526 B md5
`45695ad9`). The standing assumption — recorded in the constraints as "the container cannot reach
`wuld.ink` at all (egress)" — is true of the **cloud container** and false of the **device VM**.
Live content-greps no longer have to wait for the operator's PowerShell block; Cowork can assert
the served bytes itself, before and after a ship.

### One live instance of the standing "grep the defect, not the marker" hazard

The first pass counted `class="rec-card` and got **211** against a pinned 51, and for a moment
that looked like a fourth stale pin. It was the marker: `rec-card-title`, `rec-card-tag` and
friends all match that prefix. `<article class="rec-card` returns **51**. The pin was right and
the grep was wrong — caught only because the number was too absurd to believe.
