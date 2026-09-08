# wuld.ink — what's owed, ranked

**Rewritten 2026-09-06 (K285). Revised 2026-09-06 (K287) — Tier 1 is now empty.**
**Revised again 2026-09-06 (K287b): item 11 is now partly done and carries its two remaining
sub-items; the next session is scoped in `C:\Users\y_m_a\Downloads\k288\NEXT-SESSION-hygiene.md`.**
**Revised again 2026-09-05 (K288): Tier 4 is CLOSED — and three of its four items were mis-scoped, all by grep; corrections are in place below. Item 15 turned out to be a privacy leak in three files, not dead comments in two. The three standing "Josiah's call" items now carry a staked recommendation instead of a deferral.**
**Revised again 2026-09-05 (K289): 11a is DONE — the long-press measurement came back yes, so the three right-click strings were reworded on touch rather than hidden. 11b remains declined, item 20 withdrawn. Only the reach metric is still owed.**
**Final state 2026-09-06 (K289b, HEAD `191a947`): everything on this list is closed except the reach metric. The site-wide desktop-assumption copy audit — the generalisation of 11a — was run at K289 close and came back CLEAN: `/void-engine/` was the only offender sitewide, `right-click` appears in no other file, all 15 non-selector `hover` hits are colour-token names, and `click and drag` / `double-click` / `scroll wheel` / `mouse over` are zero. Next session is scoped at `C:\Users\y_m_a\Downloads\k290\NEXT-SESSION-reach-audit.md` — measure all 70 pages, rank, build nothing.**
Ranked by consequence, not by age. Rewritten rather than annotated, twice now, because both
times the shape of the list changed and not just its contents.

---

## Correction to the K285 draft

The K285 rewrite already corrected the draft before it (the `/frame/` "four unfilled sections"
error — a grep for a class *name* read as evidence a page was empty). That correction stands.

**This revision corrects one of its own entries.** Old Tier 1 item 2 called the ambient-player
bar "the last remaining horizontal-scroll source site-wide", inherited from the K275 stratum.
Measured at K287 on a purpose-built isolation harness with no `html{overflow-x:hidden}` mask:
**the document never scrolled horizontally at any width, before or after.** `.ambient-player`
is `position: fixed`, and a fixed element's overflow does not extend document scroll width in
any current browser. The bug was real but different — see Closed, item 2.

Cause, and it is the same shape as last time: a claim written once into a stratum, then quoted
forward through four sessions without anyone re-measuring it. A carried claim is a claim, not
a measurement.

---

## Closed since the K285 draft

1. **`/void-engine/` full mobile reflow — DONE (K287).** Sub-44px targets 389 → 5, zero
   uncontained horizontal overflow at 320/360/390/430 across all three engine panes, desktop
   geometry-inert (0 deltas, 1401 nodes, 641px through 1440px). The headline finding: **370 of
   the 388 "small targets" were `.nadd`, which is `opacity:0` until `.card:hover`** — invisible
   on a phone, so the negation set was unreachable rather than fiddly. Revealed at
   `@media (hover: none)`, then sized. The other real defect was the sticky tab strip: 406px of
   tabs in a 390px bar, *clipped* rather than scrolled, so "Transmission" could not be tapped,
   and the labels wrapped to a 90px sticky header on a 103,000px page. Now 390px and 45px.
2. **The ambient bar — DONE (K287), and it was never the bug it was filed as.** Composed
   minimum ≈1088px (eleven `flex-shrink:0` children, one shrinkable track, plus the two chips
   `wrong-hour.js` docks at runtime — hence "intermittent and JS-state-dependent"), with **no
   `overflow` rule at all**. From 641px to 1088px the track name collapsed to zero width and
   the right-hand controls — including `[v]`, the bar's only escape hatch — rendered past the
   right edge, unreachable. Tablets and half-width desktop windows, never phones. Three
   declarations, nothing removed.
3. **A `/watch/` card for *Illogically Is* — DONE (K286).** First in the grid, house ytimg
   pattern, photosensitivity strip on the thumb, zero static iframes.

Also closed earlier in the K283–K285 run: the Apparatus route in from the site, the changelog
backfill, the PAT rotation, the mobile rebuild, the six-card desktop index.

---

## Tier 1 — engineering

*Empty.* Nothing on the site currently fails a standard the rest of the site meets. The three
known sub-44px residuals are listed under Tier 3 with their costs; each is a decision, not an
oversight.

---

## Tier 2 — the film's remaining surfaces

4. Vimeo and Internet Archive links, when those exist: uncomment the marked line in
   `wuld:links` (the Apparatus) and add them to the essay band.
5. A full `/illogically-is/` page if it earns one — cover, 150-word synopsis, chapters,
   trailer (on R2, never in the Pages deploy), four to six stills.
6. `/illogically-is/press/` when festival submissions start (Ann Arbor, Antimatter,
   Prismatic Ground).
7. A reduced-flash edition, as the Apparatus already promises.

---

## Tier 3 — small, known, deliberately left

Four findings from the K287 measurement pass. None is urgent; each is written down so it stays
a decision rather than drifting back into being a surprise.

8. **`.page-footer a` is 114×13 on every page.** A genuine sub-44px target site-wide. The fix
   is one rule, but it lives in `footer.css`, which means its own `?v` bump and a 75-page
   sweep — worth batching with the next thing that touches the footer, not worth a session.
9. **`.mnav-home` is 68×40 — four pixels short.** Growing it moves the sticky mobile bar that
   K282/K283 tuned to 71px, on all 70 pages, and requires a `mobile-nav.css` bump plus the
   committed sweep. Four pixels is not worth re-tuning a bar that took two sessions to settle.
10. **The `@media (max-width: 480px)` block in `ambient-player.css` is dead code.** K275 set
    `.ambient-player{display:none}` at ≤640, which strictly contains ≤480, so that whole
    tightening block has never rendered. Left in place and commented at K287 — it is the
    composition to restore if the bar ever comes back to phones.
11. ~~**`/void-engine/` is ~103,000px tall on a phone**~~ — **partly addressed at K287b.** The
    length itself is inherent to a 397-entry lexicon and is not the complaint. The complaint was
    *reach*: the first card sat 3,965px down — 4.7 phone screens of chrome before any content,
    because four blocks sized for a desktop column were stacked on a phone. K287b caps each one
    into a self-scrolling box and turns two desktop-column stacks into rows: **first card 3,965 →
    2,162 (4.7 → 2.6 screens), nothing hidden, nothing reordered.** Two further moves would get
    below ~2 screens, and both are Josiah's calls, not build calls:

    **11a. Hide the header lede on phones (−104px).** It reads "ANALOG & NIHILIST GENERATIVE
    LEXICON V5.0 — FOR ANY MODERN IMAGE / VIDEO GENERATOR — **RIGHT-CLICK ANY CARD FOR PLAIN
    DESCRIPTION & SOURCE**". The right-click instruction is an affordance a touch device does not
    have, so on a phone that sentence is not just filler, it is *wrong*. But the same paragraph
    carries the "Analog & Nihilist Generative Lexicon v5.0" subtitle, and deleting a subtitle is
    an editorial call. Splitting the sentence would need markup — and the markup is a spliced
    region, so it would have to happen upstream in the DUAL_ENGINE source.

    **11a-note.** One correction to how 11 was fixed, worth carrying: the `.stat-pills`
    stack-to-row change shipped at K287b contributed **nothing** to the reach win — measured
    after the fact, that container went 154px → 157px, three pixels *taller*. The whole
    3,965 → 2,162 came from the four caps plus the `perm-bar`/`sb-stat` leading. And it moved
    something unmodelled: `.quote-bar` is the **fourth child of `.stat-pills`**, not a sibling,
    so flipping that container to a row put "Nothing is alright and never will be." beside the
    LEGIBILITY+ button instead of below it. Josiah approved it on sight, so it stays — but the
    lesson is real: flipping a container to `flex-direction: row` reflows *every* child,
    including the ones you did not know were in there.

    **11b. Cap `#grid` itself (~60vh) — the whole instrument in three screens.** Measured: this
    puts the first card at ~1,565px and the entire page at ~2,650px, with presets and the
    compiler reachable just below the card pane. The cost is browsing 397 entries through a
    ~500px porthole (about two cards visible). Right if the filter-first workflow is the real
    one; wrong if scanning the unfiltered list is. Only Josiah knows which.

---

## Tier 3½ — real, and not fixable in this repo

12. **The Void Engine instrument has no keyboard or screen-reader path.** Its 397 lexicon cards
    are `div[onclick]`; the controls are `button[onclick]` without the ARIA state that would
    make their toggles legible. Tap and mouse work; Tab and a screen reader do not.
    **This cannot be fixed on wuld.ink.** The page's inline `<style>` *and* its `<main>` body
    are the two regions wholesale-substituted from the void-engine-suite's `DUAL_ENGINE` source
    on every engine sync — anything patched there dies at the next paste-relay. The fix belongs
    upstream, in the engine source, and would then flow into the site on the next substitution.
    Larger than anything else on this list, and correspondingly not a wuld.ink session.

---

## Tier 4 — hygiene — CLOSED (K288, 2026-09-05, commit `8876644`)

All four done in one commit — and **three of the four were wrong about their own scope**, every
error an artefact of counting a token instead of opening the hits. Left in place, corrected,
because the pattern is now three drafts old: K285 `/frame/`, K287 the sub-44 count, K288 the
below. **Count the things, then look at them.**

13. **`docs/wuld-hub-backlog.md` — RETIRED, not refreshed.** It listed the console game, the
    Mr. Grey avatar and Build B as unshipped when all three had landed at K235 / K237 / K232.
    A second hand-maintained ledger beside `CLAUDE.md` and this file will always drift back into
    lying; if a repo-side one is ever wanted it should be *generated* from `CLAUDE.md`. Moved to
    `_to_delete\`.
14. **The untracked entries — `git status` 22 → ZERO.** The count above was wrong twice:
    `recover-git.ps1` has been **tracked since K218a**, and both `_k275_*.zip`s were always hidden
    from `git status` by `*.zip` in `.gitignore`. The real set: 17 consumed kickoffs +
    `asset_repurpose_field_notes_v1.md` **committed** into `archive/` — provenance for the whole
    K-log, and free, because only `src/` deploys (proved live: `wuld.ink/CLAUDE.md` and
    `/tools/media-manifest.json` both 404 while `/` is 200) · `docs/yurei-sfx-vfx-dictionary.pdf`
    committed · `_k275/` and its duplicate `ship_k275.ps1` → `_to_delete\`, which is now
    **gitignored**, closing a loop K231 left open: an un-ignored staging bay becomes the untracked
    noise it exists to clear. `k219_assembly_kickoff.md` joined the archive in the follow-up
    commit, so all 18 kickoffs now live in one place.
15. **The `<head>` setup comments — deleted, and this was never hygiene.** `/contact/` was
    shipping *"Destination: woeinvsdnl@protonmail.com (NOT alisendjsc@gmail.com — the
    public-facing contact intentionally routes to the privacy address.)"* to every visitor in page
    source: a comment written to protect the privacy address was publicly documenting it, and
    naming the address it was protecting you from. `/donations/` named the business-account email
    and stated which account holds R2. **And `/chat/` carried the same protonmail leak while being
    invisible to this list** — its block has no `REPLACE_ME` token, because its pending step is
    "register the channel on libera", which has no placeholder to fill. **A grep for a marker finds
    the marker, not the defect.** Three files, not two. The instructions are not lost: they live in
    `git show 888b81a:src/chat/index.html` forever, which is the whole argument for committing
    rather than deleting.
16. **Placeholder cards — there was ONE, not three, out of 52, not 216.** The other two
    "placeholder" hits were the CSS rule selectors `.rec-card[data-status="placeholder"]` and its
    `::after`. The one real card ("Second entry", section 06 · Work) is gone; the CSS rule stays
    for genuine future use.

**Two email references deliberately left, both correct:** `src/CITATION.cff` carries the gmail as
the **author email** — that is what a citation file is for. `src/_/successor-protocol/index.html`
carries the protonmail in *body copy* on a sealed page rather than in a comment; that is Successor
Protocol content and register-sensitive, so it is an editorial call, not a hygiene one.

---

## Standing electives

17. Release-day curtain strips for `/successor/` and `/console/`. Both are built, both sit
    greyed on desktop; they are now hidden entirely on mobile.
18. efilist Pages `@v4` → `@v5`; the FIRST-PUBLISH ritual; the gap-log lane switch; a wrangler bump.
19. ~~A second PAT rotation~~ — **DONE 2026-09-06.** Next scheduled rotation ~2026-12-04.
20. The homepage section heading still reads `<h2>Index</h2>`. With twelve nav-shaped cards that
    was accurate; with six curated works, "The Work" would fit the intent. Editorial, Josiah's
    call, offered since K285 and deliberately kept out of the K287 commit — a one-word change
    is not worth invalidating four byte-gates and a staged-file count.

---

## Constraints worth remembering

- **Keep the homepage index card count a multiple of 6.** The grid paints its gaps by letting a
  border-coloured container background show through; an empty cell therefore renders as a grey
  block. Six divides evenly at the 3-, 2- and 1-column breakpoints. Seven would put the grey back.
- **Any change to a `?v`-versioned component is component + version bump + re-sweep** — the
  service worker is cache-first on `?v`, so an unbumped change never reaches installed phones.
  **And the sweep is not HTML-only.** `src/sw.js`'s `SHELL` precache array hard-codes component
  URLs with their `?v`; every sweep script in the repo walks `*.html` and leaves it stale, which
  fails silently — the SW precaches a version no page requests and the app shell goes stale
  offline. Grep *all* tracked files, and bump `var CACHE` in the same edit (its own header says
  so). `sw-register.js` registers `/sw.js` with no query, so the SW updates on byte-change alone.
- **Never rename a sweep script's marker.** It is an identity, not a version; renaming it makes
  the script blind to blocks already on disk and it double-inserts across every page.
- **`/void-engine/`'s inline `<style>` is not chrome.** It is a spliced region from the canonical
  `DUAL_ENGINE` source. Patch it and the patch dies at the next engine sync. Engine mobile rules
  belong in `mobile-a11y.css` — which loads *before* that inline block, so a rule there needs a
  real ancestor or tag qualifier to win at equal specificity.
- **An element whose rect exceeds the viewport is not overflow if an ancestor clips it.** An
  overflow counter that ignores `overflow:hidden` ancestors false-positives on animated,
  absolutely-positioned decoration. Related: `position: fixed` elements never extend document
  scroll width, so a fixed bar that "overflows" is a reachability bug, not a scroll bug.
- **A `?v` token that contains the previous one as a substring makes every leftover gate lie.**
  `K287b` contains `K287`, so a plain fixed-string search for the old ref matches the new ones
  and reports "clean" whether or not the sweep ran. Anchor on the delimiter: `...?v=K287"` for
  the HTML attribute, `...?v=K287',` for the `sw.js` array entry, `wuld-sw-K287';` for the cache.
- **An injected-CSS probe is not a gate.** `add_style_tag` appends at the end of the document and
  therefore wins on source order; `mobile-a11y.css` loads *before* a page's inline `<style>` and
  loses at equal specificity. A rule can pass the probe and do nothing in production. Measure the
  bytes you are actually shipping — this cost a silent no-op at K287b, caught only by re-rendering
  the committed file.
- **No gate asked how far you scroll before the content starts.** K287 passed every touch-target
  and overflow assertion and the page was still five screens of chrome deep. Josiah found it in
  thirty seconds on his own phone. A mobile gate should measure *first-content offset in viewport
  heights* alongside targets and overflow.
- **A high sub-44px count may be hover-hidden controls rather than small ones.** Check computed
  `opacity` before sizing anything; a11y counters treat `opacity:0` as visible.

---

## What I'd do next

**Nothing urgent, and now nothing tidy either.** Tier 1 has been empty since K287; Tier 4 closed
at K288 with `git status` at zero. What remains is the film waiting on the world, the standing
electives, and three decisions that were repeatedly deferred as "Josiah's call". Asked to stop
deferring them, here is where I actually land:

**11a — DONE (K289).** The measurement came back **yes**: long-press on Josiah's phone opens the
plain-description panel. So `showCtx` is reachable on touch, and this was a **wording** defect, not
a missing feature — three strings that told a phone user to right-click:

- the header lede, "…right-click any card for plain description & source"
- `.neg-hint`, "Or right-click / use NEG button on any card."
- `.ctx-hint`, "right-click any card — esc to close" — **printed inside the panel itself**, so it is
  read by someone who has *already succeeded*, telling them the action that just worked was the
  wrong one and offering `esc` when a `CLOSE` button sits an inch above it. **This is the one I had
  told the next session to skip**, on the reasoning that a touch user would never see it. His
  screenshot showed it first. The exclusion I justified with a story about the user was the worst
  offender.

All three now carry `hint-mouse` / `hint-touch` span pairs, swapped at `@media (hover: none)` — the
predicate K287 already used for `.nadd`, and the right one, since a touchscreen laptop with a mouse
keeps the right-click wording. **Nothing hidden.** Hiding the lede would have saved 104px and cost a
phone user information; rewording costs nothing and tells the truth.

The rules went into the `DUAL_ENGINE` source and the spliced page, **not** `mobile-a11y.css`:
markup and the rule that selects it belong in the same file, or a future engine sync drops the
spans and leaves a live rule selecting nothing. The payoff is the whole ship — no component
touched, so **no `?v` bump, no 70-page sweep, no `sw.js`**: one file, `+9/-3`, desktop geometry
**identical** at 1280 and 900 (5,783 nodes, same `docH`/`docW`/fingerprint).

**Don't do 11b.** Capping `#grid` at ~60vh trades a **one-time** scroll cost for a **permanent**
browsing cost on the page's primary content: you pay 60vh on every visit to save ~1.6 screens once.
And by K287b's own finding the compiler and presets are *before-you-browse* tools, so "reachable
below the card pane" solves a problem the workflow doesn't have. The four caps already did the real
work. Filing this as declined rather than deferred.

**Withdraw item 20 — keep `<h2>Index</h2>`.** I think that recommendation has been wrong since
K285. It was justified there as merely accurate-for-twelve-cards, but "Index" is also the more
in-register word: clinical, catalogue-like, anti-curatorial. "The Work" is warmer and more
conventional, which is the wrong direction for this site. Not a change worth making.

That leaves the reach metric — **first-content offset in viewport-heights, added to the mobile
gate** — as the only genuinely owed engineering, and it is owed to the process rather than to the
site. K287 passed every assertion it was given and the page was still five screens of chrome deep;
the gate that would have caught it did not exist. Cheapest to add on the next session that measures
anything at all, which is 11a.
