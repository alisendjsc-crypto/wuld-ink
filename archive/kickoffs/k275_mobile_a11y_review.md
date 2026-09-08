# wuld.ink — Mobile + Accessibility Revamp · Phase 1 · REVIEW

**Non-shipping proto.** Nothing is committed. Desktop is *proven* untouched. One decision is yours (nav pick, below); on your go it ships as one NO-PIN PowerShell block.

---

## Bottom line
Phase 1 fixes the two dominant mobile gaps site-wide — **tap targets** and **skip-link coverage** — plus overflow safety and a real mobile nav, and it does so with **zero change to the desktop render** (measured, 50/50 pages). One decision remains: **which mobile nav** (I recommend Variant B).

## Rulings applied
Phase 1 · WCAG 2.2 AA · touch 44px floor / 48 where room · contrast *reported* not changed · new breakpoints only (640/480/900).

## What changed — every rule mobile-scoped, desktop byte-inert
| File | Change |
|---|---|
| **NEW `src/components/mobile-a11y.css`** (site-wide) | Overflow safety (long code / URLs / tables wrap, never the page) + form-field / `summary` / chip tap targets ≥44px on touch |
| `src/components/nav.css` (append) | Mobile nav — **your pick, A or B** — + a 44px tap height for touch tablets |
| `src/components/footer.css` (append) | Footer links get a 44px tap box |
| 22 pages | `<a href="#main" class="skip-link">` added (the only non-CSS edit; it's off-canvas, proven not to shift desktop) |

`base.css` / `tokens.css` are **byte-frozen** (they carry no `?v`; the new layer self-versions instead).

## Desktop is untouched — PROVEN two ways
1. **Static:** every rule in all three files sits inside a `@media (max-width:640px)` or `@media (pointer:coarse)` query (audited — zero rules at top level).
2. **Empirical (the load-bearing gate):** a layout-fingerprint diff — every element's geometry + 20 computed styles, before vs after injecting the CSS, at **1280 and 900**, across **25 representative pages** → **50/50 ZERO deltas.** `pointer:coarse` is `false` on every desktop viewport.

## Mobile — MEASURED improvement
- **Tap targets: sub-44px controls 1245 → 659 (−586)** across the measured pages. Nav (28px → 48px), footer, and form fields are now tappable on every page.
- **Overflow:** long code / URLs / tables now wrap or scroll inside their own box.
- Residual sub-44 counts per page (≈5–10) are **Phase-2 component controls** (ambient bar, wrong-hour, console, gallery, void-engine, mode-toggle) — intentionally out of Phase 1.

## Your decision — mobile nav (see `deliver_nav_options.png`)
- **Variant B — disclosure (RECOMMENDED).** Collapsed = a 48px `MENU` button, content visible immediately; open = a clean single-column list with the current-page red rail. Content-first, standard, accessible; zero-JS via native `<details>`/checkbox so the homepage stays JS-free. Ship cost: a toggle added to the shared nav markup (a 71-page sweep); desktop hides it (inert).
- **Variant A — touch grid.** CSS-only, no markup change. A tidy 2-column tap grid, but it's a ~480px nav wall atop every page and on the homepage it overlaps the cover figure.

## Deferred to Phase 2 (flagged, not forgotten)
- **Ambient-player bar** — the fixed bottom bar (`flex:nowrap`, non-shrinking buttons) is wider than a phone: the *single* remaining mobile horizontal-scroll source (intermittent, JS-state-dependent). A minimal `flex-wrap` fixes only some states because `ambient-player.js` manipulates the bar — it needs a proper pass (constrain the fixed container + wrap/scroll + tap sizes). Draft in `css/ambient-mobile.css`.
- Other components: wrong-hour dock, console, void-engine instrument, notes toolbar, gallery controls, mode-toggle.
- **Contrast:** desktop muted-gray labels sit ≈4.9:1 (passes AA for normal text, tight for the small mono labels). Recoloring is a desktop change → a separate ruling.

## Ship checklist — NO PIN, one wuld PS block, on your go
1. Move `mobile-a11y.css` → `src/components/`; append the nav + footer mobile blocks; add the skip-link to the 22 pages.
2. Sweep 71 pages: inject `mobile-a11y.css?v=K<n>` after `base.css`; bump `nav.css` + `footer.css` `?v=K43→K<n>` (+ the Variant-B toggle markup if chosen).
3. Re-run: desktop-inertness (expect 50/50) · mobile touch/overflow · `wgate` 24/24 · axe-core AA (0 serious).
4. NO PIN · NO efilist · NO search/sitemap. Self-resolve the K-number; HEAD==origin guard.

*Files in this proto: `css/*.css` (the four shipped + the ambient Phase-2 draft), the two montages, `gates/*.json` (raw results).*
