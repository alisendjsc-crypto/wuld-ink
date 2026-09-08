# K308 kickoff — after the pin move

Repos: `C:\Users\y_m_a\Projects\wuld-ink` (at `83df0b6`, or later if the pin block ran) and `C:\Users\y_m_a\Projects\efilist-argument-library` (at `e253f23`).
Read `wuld-ink\CLAUDE.md` first — the `verify_before` block is authoritative for pins, and the standing hazards (K213–cclxxxix) are load-bearing. **Re-derive every pin; never copy one.**

## What landed

- **`83df0b6`** (wuld-ink) — reduced-flash edition linked from the three pages carrying the photosensitivity warning; `/watch/` card handler no longer swallows links.
- **`e253f23`** (efilist) — **the v4.0.1 flagship pin move. `PIN == LIVE`, verified by served bytes.**

```
library pin: 9d13359e305c6caa3ae64759f3dcc0e6 · 2,963,789 bytes · v4.0.1
superseded:  e654eabd32fa95e5969d49e6eb15aa87 · 2,963,752
```

## 1 · If `Downloads\v4_0_1_pin\SHIP_PIN_FOLLOW.ps1` has not run, run it first

It is the work the pin move owes on the wuld.ink side: the stated md5, byte count and version label across the site, plus the changelog entry, the feed and the search index. **Check before assuming** — `git log --oneline -2` and `curl https://wuld.ink/library-about/ | grep 9d13359e`.

Two things about it worth carrying forward:

- **The objections re-vendor was a verified no-op.** `tools/omega/vendor/objections-index.json` is byte-identical to the efilist source, because the sweep genuinely moved no content. That was measured, not assumed — measure it again next time rather than inheriting the conclusion.
- **14 version mentions are HELD as provenance** and must never be swept: the byline `Library substrate (<code>vX</code>)`, the objection pages' `F+ slice … (vX, Tier …)` and `at the vX stable tag`, and the glossary's dated `vX substrate locked`. Those name the tag an extract was *taken at*; the extract was never re-derived. **The rule is now encoded in `tools/library-pin.py` as `HOLD_VERSION`, with the held count printed on every run and exempted from the residual check** — so it survives the next pin move without anyone remembering it.

## 2 · Two Apparatus pages, both held, both for the same reason

- **`/argument-library/apparatus/`** (libshow) — built and gated in `Downloads\apparatus_libshow\`. Its ship script **refuses itself** while the page quotes the pre-sweep pin *or* carries an unfilled `<PIN_MD5>` / `<PIN_BYTES>` / `<DIFF_OUTCOME>`. The pin has now moved, so the video seat's reissue is unblocked: drop in the new Markdown and re-run. Ship is **two commits** — the page first, because `gen_sitemap.py` refuses a page with no git date.
- **`/illogically-is/apparatus/` §2.12 Editions** — the regenerated page in `docs/rf3-handoff/` wraps to **+4 lines / −0** against the served page, exactly as its handoff claimed. Not shipped because **its PDF prints a literal `{{YT_ID}}`**. The HTML and MD there are already filled with `A-S3MF5rCtg`; the PDF is `build_apparatus.py`'s and belongs to the video project. Ship HTML + MD + PDF as a matched set once it is regenerated.

## 3 · Standing, from this arc

- **cclxxxvii** — a generator has no memory of a judgement. Guard the corpus with a ledger, not the generator with a filter.
- **cclxxxviii** — a number in prose is an unfenced claim, and it rots.
- **cclxxxix** — write the fence before the fix and watch it fail.
- **ccxc — a handoff's own draft copy can overclaim past its own QC.** The rf3 handoff proposed writing that the reduced-flash edition holds "under three per second by measurement"; the QC in the same folder reports `max/s 4`, one second over at 0:21:09, and four over on BT.1702. The published YouTube description is the honest authority. **Where a handoff's prose and its measurements disagree, the measurements win — and safety copy is the last place to compress.**
- **ccxci — a whole-element click target swallows its own links.** `/watch/` activated on `e.target.closest('.video-card')`; an anchor inside a card played the card's video, which for the reduced-flash link meant handing a photosensitive viewer the strobing edition. Guarded and behaviourally tested. Check the pattern anywhere an element is made clickable in full.
- **ccxcii — a version sweep must sort live claims from provenance.** Same shape as combined.html L1722 and the unstamped `.jsx` line: 14 of 37 mentions named the tag an extract was taken at. A blunt replace would have asserted re-derivations that never happened.

## 4 · Open, not started

- `mg-stance-bait-01` probed against the accusation space (TX21 item 5, idle-session).
- The 12 §7a′ phrasings held for the library seat at K306; `why do not you just kill yourself then` still unruled.
- `the music page` deflects — there is no music nav entry at all.
- `reach_audit.cjs` does not block service workers (cclxxi); wants its own re-baseline.
- efilist canon: the order's §4 asks for the `archive_attestation` entry and the `DEP_GRAPH_DATA` open-invariant item (245 vs 255 stored sums). Not done — canon is the library seat's file.
