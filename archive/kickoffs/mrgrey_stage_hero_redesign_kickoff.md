# WULD.INK -- Successor STAGE "hero avatar" redesign (kickoff). NO PIN.
Recommended default: rebuild the `/successor/` **stage modal** so the Mr. Grey (and Yurei) avatar is
FRONT-AND-CENTER at full size playing its reactive clips, with the transcript + input **translucently
overlaid on top** of it -- animation first, chat as a legible glass layer over it. This is a LAYOUT-ONLY
session: `successor-stage.{css,js}` + a `?v` bump in `successor/index.html`. NO engine, corpus, matcher,
persona, or manifest change -- the reactive wiring already exists and already fires. Self-contained,
arc-advancing, firewall-clean. If it runs long, Half B splits Yurei-parity + reduced-motion polish to a
follow-up (see SPLIT).

## Why this session exists (the vision)
Mr. Grey's 5 reactive clips (appear/speak/dismiss/listen/long_idle) went live K237, and K238 fixed the
stage to actually load the real manifest -- so the stage NOW plays the real avatar. But the stage still
frames it as a ~64px header chip above a standard chat transcript; the animation you paid render budget
for is a thumbnail. Josiah's ask: make the **main character animation the hero** -- big, centered,
filling the stage -- and float the text chat over it **transparently** so you can watch the animation
and its detail (the tapetum blink, the ear-flick, the speak-bob) clearly while you talk. The compact
bottom-left seat stays as-is (a small utility widget); this is ONLY the fuller "stage" modal.

## Verify-at-open (fresh public-origin clone; verify-don't-redo)
- wuld HEAD == origin (expect `580861b` [K238 stage cache-bust] or later). ONE-committer law: confirm no
  other wuld-committing session is mid-flight.
- Stage is LIVE + real: `src/components/successor-stage.js` `var VER="K238"`, manifest+corpus fetched with
  `?v=VER` (K238 fix); `src/successor/index.html` loads `successor-stage.js?v=K238` +
  `omega-assistant.js?v=K237`. Both `/successor/` surfaces render the real black-cat avatar.
- REACTIVE WIRING ALREADY PRESENT (do NOT re-add): `showSprite(hint,opts)` resolver; `showSprite(r.animation_hint||"speak",{then:"idle"})` on each response; `toListen()` on typing (listen->idle @1400ms);
  non-loop clips chain to idle via `onended`; open currently fires `showSprite("idle")`. Resolver is
  asset-first off the manifest's `animation_fallback` (identical contract to omega-assistant).
- Untouched HELD: flagship `library.wuld.ink/combined` `e654eabd` (pin v4.0.0); search-index `564d6a81`;
  Yurei `yurei-assistant.js` + `yurei-*` corpus BYTE-UNCHANGED; `omega-corpus-mrgrey.json` unchanged;
  `persona-switcher.js` unchanged.
- Current stage layout (what you're replacing): `successor-stage.css` (~260 ln) -- `.sstage-overlay`
  (fixed, z9000, backdrop-blur 4px, fade) > `.sstage-panel` (flex column card ~600px) > `.sstage-head`
  (small `.sstage-avatar` ~64px + title + x) + `.sstage-transcript` (message list) + `.sstage-form`
  (input). Reduced-motion hides `.sstage-av-video` (shows still). Mobile: panel fills viewport.

## The design (recommended default -- crisp, so it's not "make it nice")
Persona-AGNOSTIC (the stage serves BOTH Yurei + Mr. Grey via the switcher; use whatever each manifest
gives -- don't hard-code Mr. Grey geometry).
1. **Avatar = hero background layer.** The `.sstage-av-video`/`.sstage-av-img` fills the panel (large,
   centered, `object-fit: cover` on the regard, `object-position` framing the head/upper third). Portrait
   canvas: on desktop the panel becomes a tall centered stage (target ~clamp(360px, 42vw, 520px) wide,
   near-viewport-height), full-screen on mobile (as now). The clips are 540x720 (3:4); Yurei's manifest
   may differ -- `object-fit: cover` + a safe `object-position` absorbs both.
2. **Chat = translucent glass overlay on top.** Transcript scrolls in the LOWER band (bottom ~45-55%),
   the avatar's expressive head/upper stays UNobstructed. Message bubbles: semi-opaque
   (`rgba(dark, .55-.70)`) + `backdrop-filter: blur(6-8px)` so text is WCAG-AA legible over the animated,
   sometimes-glowing avatar. A bottom-up gradient scrim (`linear-gradient(transparent -> dark)`) behind
   the transcript band carries contrast without a hard panel edge. Input row pinned at the very bottom,
   same glass treatment. Title + x + persona label float as a minimal translucent TOP bar.
3. **"See it clearly" idle-peek (recommended, not optional-lite):** after ~4s idle the chat overlay eases
   to low opacity (~0.15) so the full animation is unobstructed; any keypress / new line / hover snaps it
   back to full. This is the literal "see the animation and details clearly" ask -- bake it in but make
   the fade `prefers-reduced-motion`-safe (instant, not animated) and never hide the input affordance.
4. **Reactive polish (small, in-scope):** change the open beat from `showSprite("idle")` to
   `showSprite("appear",{then:"idle"})` so entering the stage plays the waking-regard entrance (it already
   falls back to idle if absent). Everything else (speak-on-response, listen-on-type) already fires.
5. **Accessibility (firm gates, not nice-to-haves):** text contrast >= WCAG AA over the DARKEST and the
   BRIGHTEST avatar frames (test both); `prefers-reduced-motion` -> large STILL (no video, no peek-fade),
   fully legible; focus order + visible focus ring on input/send/x preserved; the transcript stays a
   `role="log" aria-live` region; the sgate curtain + "nothing leaves your browser" note + download/clear
   stay intact.

## Approach (LAYOUT ONLY -- CSS-heavy, light JS DOM)
- **`successor-stage.css`:** the real work. Restructure `.sstage-panel` to a layered stage (avatar
  absolute-fill background; transcript + form as translucent foreground; top bar). Add the scrim, the
  glass bubbles, the idle-peek opacity states. Keep every existing class NAME the e2e + JS reference;
  restyle, don't rename (rename only if you also update the JS + e2e in lockstep).
- **`successor-stage.js`:** minimal DOM changes -- reorder/reparent the avatar vs transcript vs form so
  the avatar is the background layer (it's currently inside `.sstage-head`); wire the idle-peek
  opacity toggle onto the existing `idleTimer`/typing handlers (reuse `toIdle`/`toListen`, don't add a
  new engine); flip the open beat to `appear`. NO change to matcher, corpus load, persona binding,
  transcript persistence, or crisis handling.
- **`successor/index.html`:** bump `successor-stage.css?v=` and `successor-stage.js?v=` to the new K
  (e.g. K239). **Bump BOTH the file's internal VER if you touch the fetch AND the `<script>`/`<link>`
  `?v=` -- the K238 lesson: internal VER busts the manifest fetch, the tag `?v` busts the component file
  itself. Here you're not changing the fetch, so just the two `?v` tags.**
- Judge by SCREENSHOTS this time (it's a visual redesign, unlike the data-gated clips): drive Chrome
  (claude-in-chrome) or a headless shot of `/successor/` with the stage open, at desktop + mobile widths,
  dark mode, AND `prefers-reduced-motion`, AND over a bright avatar frame (speak/eyes-open) -- confirm
  legibility + framing. Contrast can also be checked numerically (sample text-bubble vs sampled avatar
  pixels).

## Guardrails
- **NO PIN. NO efilist bytes. NO flagship/canon/search-index touch. NO corpus/matcher/persona/manifest
  change** -- layout + presentation only. Avatar bytes, manifests, and the resolver stay frozen.
- **Yurei BYTE-UNCHANGED** (`yurei-assistant.js`, `yurei-*` corpus, `src/assets/yurei/*`). The stage is
  persona-agnostic: the SAME redesign must render Yurei's avatar too (test both personas). Persona-gate
  GREEN A-F; the `persona-switcher.js` orchestrates via public APIs + CSS only -- do NOT edit it.
- The sgate CURTAIN (passphrase `ne-hoc-fiat`), the switcher toggle, transcript localStorage
  (`wuld:successor:transcript:*`), crisis rendering (plain `.sstage-crisis`), and the
  "nothing leaves your browser" firewall copy stay behavior-identical.
- `/successor/` stays nav-greyed + curtained (dormant); this is polish behind the curtain, not an un-gate.
- CSP: same-origin only; no external fonts/img/script.

## Ship
- ONE wuld PS block (NO PIN): fresh-filename `.k239` sidecars for `successor-stage.css`,
  `successor-stage.js`, `successor/index.html`; `.git\*.lock` cleanup -> HEAD base-guard (`580861b`/later)
  -> base-md5 guards (read a FRESH clone / `git show HEAD:path`, never the mount) -> Move-Item ->
  result-md5 gates -> explicit-stage the NAMED files (NEVER `git add -u`) -> commit -> push -> deploy-verify
  (`curl.exe -sI` /successor/ + successor-stage.{css,js}?v=K239 = 200). Text sidecars via device_commit_files
  (byte-exact, LF -- watch the CRLF trap if any file is written through a Windows text-mode tool; write
  binary/`newline=""`). No binaries, no sitemap, no search-index this session.
- Regress: `node tools/omega/successor-stage-e2e.cjs` + `persona-switcher-e2e.cjs` + `omega-surface-e2e.cjs`
  + `omega-persona-gate.cjs` + `successor-gate-e2e.cjs` all GREEN. If you renamed any `.sstage-*` class,
  the e2e that references it must be updated in the SAME commit + stay green.

## SPLIT (if the CSS runs long)
Land the hero layout + glass overlay + idle-peek for the ACTIVE persona (Mr. Grey) first, e2e green, ship.
Yurei-avatar parity pass (her aspect/anchor + a bright-frame contrast recheck) + reduced-motion still
polish becomes a 30-min follow-up. The layout degrades safely at every intermediate state (worst case:
avatar large, chat readable, peek off).

## Key paths
- `src/components/successor-stage.{js,css}` (the redesign); `src/successor/index.html` (the two `?v` tags,
  lines ~50 css / ~300 js).
- Contract/wiring reference (do NOT edit): `src/components/omega-assistant.js` (twin resolver);
  `src/assets/omega/avatar/mrgrey_manifest_v1.json` (status complete, 8 assets) +
  `src/assets/yurei/avatar/avatar_manifest_v2.json` (Yurei set).
- Tests: `tools/omega/{successor-stage-e2e,persona-switcher-e2e,omega-surface-e2e,omega-persona-gate,successor-gate-e2e}.cjs`.

## Hazards
WULD: ccxxvii (explicit-stage NAMED, never `git add -u`) - the working tree carries untracked cruft
(`_to_delete/`, backlog `.md`, kickoff `.md`s) that must NOT be swept in. K111 (git operator-side;
`.git\*.lock`) - K113 (`curl.exe` not `curl`) - K218a/K228 (base-guard on HEAD-blob md5; read from a fresh
clone, never the mount) - K238 (cache-bust BOTH internal VER *and* the `<script>/<link> ?v` when a
component changes) - K110 (authored prose ASCII `--`/`->`; U+FFFD 0) - PowerShell: one-line if/else, Md5
helper NOT named `H`, `[Environment]::CurrentDirectory` if any .NET relative path. NO-PIN discipline
(successor is a dormant auto-deploying sidecar). Cowork VM-cache truncation #59564: bash-verify on-disk
after every Edit/Write. Legibility is THE risk here: verify text contrast over the brightest avatar frame,
not just the resting dark one. TZ=America/Phoenix.
