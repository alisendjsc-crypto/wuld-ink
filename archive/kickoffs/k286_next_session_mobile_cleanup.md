# Session prompt — wuld.ink mobile cleanup (K287)

Paste this as the first message in a **fresh WULD INK Cowork session**. It is self-contained;
everything else it needs is in the repo.

---

Read `C:\Users\y_m_a\Projects\wuld-ink\CLAUDE.md` first — the orientation sequence, then the
K287 `verify_before` at the tail. Then this.

## What this session is

The last of the mobile work. K274–K284 rebuilt the mobile layer across the whole site; **two
pages were explicitly deferred and are the only things still failing the standard the rest of
the site meets.** This session closes them, and nothing else.

**Do not take on new features.** If something else looks tempting, add it to
`Downloads\k278\wuld-priorities-2026-09-06.md` and leave it.

## The two items

**1. `/void-engine/` full mobile reflow — the main job.**
The K275 mobile pass covered every page except this one. It went **456 → 388 sub-44px touch
targets** and was deferred to its own session because the instrument panel needs a real reflow,
not a touch-target patch. The triptych, the panels and the control rows all need to wrap and
never overflow. K275 already landed a touch-fixes-only pass (`mobile-a11y.css`, the `A2` block)
— read it before adding anything, and prefer extending that block over inventing a new layer.

Target: **zero horizontal overflow at 390px, and sub-44px targets down to single digits.**
Gate it the way K281–K284 did — render at 390×844 in the container's chromium and measure;
do not eyeball it.

**2. The ambient-player bar's horizontal overflow.**
Flagged at K275 as the last remaining horizontal-scroll source site-wide: non-shrinking flex
buttons wider than a phone, intermittent and JS-state-dependent, in `ambient-player.css`.
The bar is now `display:none` on mobile, so it only bites where it shows — small fix, and it
is the last of its kind.

## How to verify from the cloud (learned the hard way, K284)

The container's **headless browser cannot reach `wuld.ink` through the egress proxy**, though
`curl` can. The working recipe:

```
curl -s https://wuld.ink/<page>/ -o index.html
# then curl every same-origin stylesheet it references, preserving paths
python3 -m http.server <port>     # serve the mirror
# then point playwright/chromium at localhost
```

Stub `i.ytimg.com` and other third-party image hosts with `page.route(...)` so boxes get real
height, or thumbs collapse and every measurement lies.

## Hard constraints — do not rediscover these

- **Any change to a `?v`-versioned component is component + version bump + re-sweep of the 70
  nav-bearing pages.** The K276 service worker is cache-first on `?v`, so an unbumped change
  never reaches an installed phone. `tools/sweep/sweep_mobile_nav.py` is the committed sweep.
- **Never rename a sweep script's `OPEN`/`SHUT` marker.** It is an identity, not a version.
  Renaming it makes the script blind to blocks already on disk and it double-inserts across all
  70 pages (K282; its own final-state gate caught it, recovery was `git show HEAD:<path> >`).
- **`device_bash` cannot delete files.** The repo working tree is not scratch — place
  deliverables at their final paths and gate them there, or keep scratch in `$HOME` outside `mnt/`.
- **Desktop must stay byte-inert.** Every mobile rule lives inside `@media (max-width: 640px)`
  behind `html.mnav-on`, which only the `pointer: coarse` script sets. Prove it: at 1280 there
  must be no `.mnav-bar`, `.site-banner` stays `display: block`, `.index` stays `display: grid`.
- **The homepage index card count stays a multiple of 6** — the grid paints its hairlines by
  letting a border-coloured container background show through, so an empty cell renders grey.
- **NO PIN.** The flagship `library.wuld.ink/combined` is `e654eabd` v4.0.0 and efilist is
  READ-ONLY. Nothing in this session touches either.
- Ship as **one operator PowerShell block** on the house pattern: `.git\*.lock` cleanup →
  HEAD==origin guard → base-md5 guards → Move-Item sidecars → result-md5 gates → explicit-stage
  NAMED paths (never `git add -u`) → measured staged-count gate → commit → push → `curl.exe`
  asserts. `curl.exe`, never the `curl` alias; `-o` a temp file, never `$null`; one-line
  if/else; the md5 helper is `Md5`, never `H`.

## Already closed — do not re-raise

The PAT rotation flagged through K277–K286 is **done** (regenerated 2026-09-06). CLAUDE.md's
K286 carry still lists it as owed; that line is stale, not a live item. Next scheduled
rotation ~2026-12-04.

## Budget

Josiah was near his weekly limit through K277–K286. **Pre-flag cost before starting**, and if
the void-engine reflow looks like it will not fit, do the ambient bar first — it is small and
self-contained — and hand the reflow forward rather than crashing mid-build.
