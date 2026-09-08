# SPENT — executed at K289 (2026-09-06). Do not run this as a session prompt.

The measurement this prompt asked for came back **yes**: long-press on Josiah's phone opens the
plain-description panel, so Branch A applied and was built the same session.

**What shipped:** the three "right-click" strings on `/void-engine/` — the header lede, `.neg-hint`,
and `.ctx-hint` — now carry `hint-mouse` / `hint-touch` span pairs, swapped at
`@media (hover: none)`. Nothing hidden. One file (`src/void-engine/index.html`, `+9/-3`), mirrored
byte-identically into `C:\Users\y_m_a\Downloads\Void Engine\DUAL_ENGINE_v2.html`, whose pre-edit
state is backed up as `DUAL_ENGINE_v2.html.bak-pre-k289-hint-swap` (md5 `dcf4897f`).

**Two things this prompt got wrong, kept here because they are the useful part:**

1. It said to leave `.ctx-hint` alone, reasoning that a touch user would never see a hint rendered
   inside the panel. **They see it first** — it is the only one of the three read by someone who has
   already succeeded, and it told them their successful action was wrong while offering `esc` next
   to a `CLOSE` button. It was the worst of the three, not the one to skip.
2. It said to put the swap rule in `mobile-a11y.css`. That would have split the rule from the markup
   it selects across two files, so a future engine sync dropping the spans would leave a live rule
   selecting nothing, silently — and it would have cost a `?v` bump, a 70-page sweep and an `sw.js`
   edit for a one-file change. Both went upstream into the engine source instead.

Full record: the K289 stratum in `C:\Users\y_m_a\Projects\wuld-ink\CLAUDE.md`.
