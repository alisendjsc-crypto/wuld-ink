WULD.INK -- Successor STAGE "immersion pass" (K241 kickoff). NO PIN.

Recommended default: on `/successor/`, make the STAGE the page. Behind the curtain it
should (1) AUTO-OPEN as the immersive main view, (2) carry an in-stage Yurei <-> Mr. Grey
TOGGLE that swaps the MAIN view live (not just the corner), (3) SUPPRESS the redundant corner
desk-companion + the site persona-pill on this one page (one surface, one toggle), and (4) fold
all the Hub prose into ONE discreet disclosure. LAYOUT + WIRING only, on
`successor-stage.{js,css}` + `successor/index.html` (+ a page-scoped corner-suppression rule).
Builds on K240's widen. NO engine, corpus, matcher, persona, manifest, or avatar-asset change.
Self-contained, arc-advancing, firewall-clean. K240's `.sstage-panel` widen is LIVE and STAYS --
this grows the vessel into a destination.

Why this session exists (the ask) K240 widened the modal and Josiah lived with it: better, but
the surface still isn't a destination. His read, verbatim intent: the persona switch (the pill
bottom-left) flips the CORNER widget, NOT the big stage -- so there's no way to change who's on
stage; the second corner chat that appears is redundant ("focus on the main view and the toggle
switch between Yurei and Mr Grey"); and the stage should be "immersive and the main thing that
loads when you switch on the nav tab," with "all the text descriptions in a drop-down menu,
discretely somewhere. More immersion." Separately: Josiah is commissioning the 3D-modeling
project for more detailing/texturing on both avatars IN THE MEAN TIME -- so the avatar CLIP-FOLD
(new models + manifests) is a SEPARATE later session; freeze every avatar byte here.

Verify-at-open (fresh public-origin clone; verify-don't-redo)

* wuld HEAD == origin (expect `f767f38` [K240 viewfinder widen] or later). ONE-committer law:
  the RENDER LANE is actively producing new Mr. Grey / Yurei avatar clips + manifests (Josiah's
  detailing ask) -- confirm it is NOT mid-push to wuld when you start. Read a FRESH clone's HEAD +
  the CLAUDE.md carries; do not trust the mount (K218a stale-worktree class).
* K240 is LIVE + real: `successor-stage.css` carries `.sstage-panel { width: clamp(380px, 52vw,
  660px); height: min(92vh, 880px); }`; `successor/index.html` loads `successor-stage.css?v=K240`
  (the js tag stays `?v=K239`). Served `/components/successor-stage.css?v=K240` contains the 660px
  clamp.
* Current stage shape you're changing (`successor-stage.js`, K232): `boot()` calls `renderMount()`
  ONLY -- "no auto-open: click-to-open." `openStage()` reads `activePersona()`
  (`wuld:persona-active`, default `mrgrey`) ONCE, falls back active->other if killed, seeds the
  per-persona transcript, CLOSES the corner bubble via `api.close()` ("one surface at a time"),
  builds the fixed `.sstage-overlay` (z 9000) + `.sstage-panel`, runs `appear`. There is NO live
  persona swap -- the `swap` var only re-seeds if `current` already differs. Public surface
  `window.wuldSuccessorStage.{open,close,isOpen,persona,built,_open,_ask,...}`.
* Curtain HELD (K233): sgate prepaint + `<style id="sgate-style">` + `#successor-gate` overlay
  (FIRST body child, OUTSIDE `<main>`) + logic; passphrase `ne-hoc-fiat`; key
  `wuld:successor:unlocked`. Greyed nav tab HELD (`nav.css` `.site-nav a[href="/successor/"]{opacity:.4}`).
* HELD/FROZEN: flagship `library.wuld.ink/combined` `e654eabd` (pin v4.0.0) -- ALL avatar
  manifests (`assets/omega/avatar/mrgrey_manifest_v1.json`, `assets/yurei/avatar/avatar_manifest_v2.json`)
  + asset bytes + the resolver -- both corpora + `yurei-oracle.js` matcher -- `persona-switcher.{js,css}`
  (its SITE-WIDE behavior must stay identical off `/successor/`) -- `agent-settings.{js,css}` --
  search-index `564d6a81` -- nav.js.

The design (crisp) One page, two states, one surface. Persona-AGNOSTIC (test BOTH avatars).

1. STAGE AUTO-OPENS on `/successor/`, post-curtain. Change `boot()` so that WHEN the page is
   unlocked (`wuld:successor:unlocked==='1'`) the stage opens itself; and wire the sgate unlock
   handler to open it on successful passphrase. It becomes the destination, not a button you hunt.
   Keep `renderMount()` as the fallback affordance for the CLOSED state (below). Reduced-motion:
   open straight to the still (no `appear`). a11y: focus lands on the input (or the panel h-label),
   Escape / the x still close, `aria-modal` holds. This is a deliberate shift: the stage is DEFAULT
   on `/successor/` only -- the corner bubbles stay the opt-in default on every OTHER page (the
   K232 principle updates for this one surface).

2. IN-STAGE PERSONA TOGGLE -- two mono chips (Yurei | Mr. Grey) in `.sstage-head`, styled like the
   persona-pill for consistency, active highlighted. Clicking the inactive chip calls a NEW
   `switchStagePersona(id)` that: writes `wuld:persona-active` (the SHARED key -> the corner
   widgets stay in sync off-page), sets `current`, `ensurePersona`, swaps `labelEl` + avatar
   (`appear`->`idle`, reduced-motion still), and re-seeds THAT persona's saved transcript
   (`wuld:successor:transcript:<persona>` already per-persona) -- all WITHOUT closing the overlay.
   Factor `openStage()` so the swap path reuses its persona-load body. This is the whole point of
   the session: the toggle drives the MAIN view.

3. KILL THE REDUNDANT SECOND SURFACE on `/successor/`. Page-scope-suppress the corner desk
   companion(s) + the site persona-pill here (they're redundant with the stage + its toggle; the
   full-viewport overlay already covers them, but a user can still summon a second chat -- Josiah's
   "redundant bubble"). Recommend a page-scoped CSS rule (e.g. a `body`/root marker on
   `successor/index.html` -> `display:none` on the launcher + switcher roots) -- NO `nav.js` edit,
   NO `.off()` kill (that persists a kill-key), fully reversible. VERIFY THE REAL ROOT SELECTORS at
   open (read the yurei-assistant / omega-assistant launcher + `persona-switcher` roots) before
   writing the rule.

4. HUB PROSE -> ONE DISCREET DISCLOSURE. The K231 "desk-Yurei elaboration" + "For the curious"
   `<details>` + the agent-settings mount collapse behind a SINGLE discreet control (a small mono
   "about / how it works / settings" affordance, e.g. a corner disclosure or a `<details>` seated
   out of the way). Stage-first; the text is reachable, not dominant. Keep it BELOW-lede /
   no-new-`h2/h3` (search stays neutral, per K231/K232).

5. CLOSED STATE (the x). Closing the stage reveals a MINIMAL, atmospheric page: the discreet
   disclosure (4) + a prominent "enter the stage" affordance (the `renderMount()` button, reworded)
   to re-open -- never a wall of text, never a dead end. Re-open restores the same persona +
   transcript.

6. IMMERSION geometry. `/successor/` is a dedicated page (the stage is only mounted here), so the
   auto-opened panel can read LARGER than a modal-over-content -- push `.sstage-panel` toward
   near-viewport on this surface (keep <= ~3:4 so the avatar frames; K240's clamp is the base).
   TUNE BY SCREENSHOT (both personas, 1440x900 + wide + mobile, dark + reduced-motion). Everything
   else K240/K232/K233 -- glass lower-band chat, idle-peek, transcript persist, download/clear,
   crisis floor, the mono speaker chips, the sgate curtain + "nothing leaves your browser" copy --
   UNTOUCHED.

Approach (LAYOUT + WIRING; CSS + the stage JS)

* `successor-stage.js`: `boot()` auto-open gate + sgate-unlock hook; `switchStagePersona()`
  factored out of `openStage()`; the head toggle chrome + its handler; the closed-state re-enter
  affordance. Restyle/extend, don't rename -- keep every `.sstage-*` class the e2e + CSS reference.
  Keep the reduced-motion `.sstage-av-video { display:none; }` as the block the e2e slices to EOF
  (`CSS.indexOf("prefers-reduced-motion")` -> the `av-video display:none` regex).
* `successor-stage.css`: the head toggle, the larger `/successor/` geometry, the corner-suppression
  rule (page-scoped), the discreet-disclosure styling. Mode-aware `--c-*` tokens; no `!important`
  on layout.
* `successor/index.html`: Hub prose -> the single disclosure; add the page-scope marker for
  suppression; bump the `?v` of EVERY successor-stage asset that CHANGED (css AND js this time ->
  `?v=K241` on both; the K238 cache-bust rule -- bump the file that changed, not a blanket sweep).
* Judge by SCREENSHOTS (headless chromium or claude-in-chrome of `/successor/` with the stage open,
  unlocked): desktop 1440x900 + wide + mobile, dark AND `prefers-reduced-motion`, BOTH personas,
  the live toggle swapping the main view, the closed state, the disclosure. Contrast stays WCAG-AA
  (bubble colors unchanged from K239/K240 -> the ~7:1-floor holds; re-sample if the geometry moved
  which avatar pixels sit behind text).

Guardrails

* NO PIN. NO efilist bytes. NO flagship/canon/search-index touch. NO corpus/matcher/persona change.
* AVATAR MANIFESTS + ASSET BYTES + RESOLVER stay FROZEN -- the render lane owns those and is
  mid-flight (Josiah's detailing ask). Do NOT fold clips or repoint manifests here; that is the
  NEXT-NEXT session (the clip-fold, gated on the improved models landing). Keep K241 strictly
  layout+wiring so it does not collide with the render lane.
* Yurei + Mr. Grey BYTE-UNCHANGED except the shared stage/successor files. `persona-switcher.{js,css}`
  site-wide behavior OFF `/successor/` must stay identical -- suppression is page-scoped only; its
  e2e stays GREEN.
* Crisis floor fires FIRST through the real matcher (`respond()`), in-stage, regardless of persona
  or which chip is active -- NEVER `say`/`off` to swap (source-fenced in the e2e). sgate curtain,
  transcript localStorage (`wuld:successor:*`), own-key stores, firewall copy stay behavior-identical.
* `/successor/` stays curtained (`ne-hoc-fiat`) + nav-greyed (dormant polish behind the curtain).
* Search-index HELD `564d6a81` -- prove neutrality (the disclosure keeps prose below-harvest; the
  gate stays outside `<main>`). CSP same-origin only.

Ship

* ONE wuld PS block (NO PIN): fresh-filename `.k241` sidecars for the changed files
  (`successor-stage.js`, `successor-stage.css`, `successor/index.html`, + `successor-stage-e2e.cjs`
  if you extend it; + CLAUDE.md fold via git-show->$HOME->python, NEVER Edit/Write); `.git\*.lock`
  cleanup -> HEAD base-guard (`f767f38`/later) -> base-blob guards (`git rev-parse HEAD:path`, the
  K228/K231-hashtype like-to-like way -- read a FRESH clone, NEVER the mount) -> Move-Item ->
  result-md5 gates -> explicit-stage the NAMED files (NEVER `git add -u`/`git add .` -- the tree
  carries untracked cruft: `_to_delete/`, kickoff `.md`s, the K240/K241 kickoffs) -> commit -> push
  -> deploy-verify (`curl.exe -sI` `/successor/` + the bumped `successor-stage.{css,js}?v=K241` =
  200; plus a served-bytes grep that the toggle/auto-open bytes are live). `curl.exe` not `curl`;
  one-line if/else; helper `Md5` not `H`; TZ=America/Phoenix.
* RIDER (fold in, cheap -- we edit this page anyway; K236 follow-on): add `<meta name="wuld-search"
  content="exclude">` to `successor/index.html` so the sitemap drops `/successor/` to match the
  dormant `/console/` twin. Then run `python3 tools/gen_sitemap.py --repo . --out src/sitemap.xml`
  (expect 62 URLs, `--check` PASS) and ship `sitemap.xml` in the same block. Prove the search-index
  stays `564d6a81` (the exclude meta makes `/successor/` index-invisible, which it already is ->
  neutral).

Regress: `node tools/omega/{successor-stage-e2e,persona-switcher-e2e,omega-surface-e2e,omega-persona-gate,successor-gate-e2e}.cjs`
all GREEN. EXTEND `successor-stage-e2e.cjs` for the new behavior: auto-open when unlocked; the
live `switchStagePersona` (toggle swaps `current` + label + transcript, overlay stays open, writes
ONLY `wuld:persona-active` + own keys); crisis still fires post-swap; the closed-state re-enter.
`persona-switcher-e2e` (47/47) + `successor-gate-e2e` (19/19: the curtain still gates; auto-open
fires only post-unlock) must stay green unchanged. No `.sstage-*` class renamed -> the others hold;
if you rename any, update the e2e in the SAME commit.

SPLIT (if it runs long) Land the CORE first -- auto-open + the in-stage toggle + corner-suppression
(the three things Josiah literally asked for) -- e2e green, ship. The prose-to-disclosure collapse
(4) + the closed-state polish (5) + the immersion-geometry tune (6) become a clean 20-min follow-on;
each degrades safely (worst case: stage opens + toggles + is the only surface, text still present
but not yet tucked).

Key paths

* `src/components/successor-stage.js` (auto-open in `boot()`; `switchStagePersona()`; head toggle;
  re-enter affordance) -- `src/components/successor-stage.css` (toggle + larger geometry +
  suppression + disclosure) -- `src/successor/index.html` (Hub prose -> disclosure; page-scope
  marker; `?v=K241` on css+js; the `wuld-search` exclude rider).
* Untouched refs (FROZEN): `src/assets/omega/avatar/mrgrey_manifest_v1.json` +
  `src/assets/yurei/avatar/avatar_manifest_v2.json` + asset bytes (render lane owns) --
  `persona-switcher.{js,css}` -- `agent-settings.{js,css}` -- `nav.{js,css}` -- both corpora +
  `yurei-oracle.js`.
* Tests: `tools/omega/{successor-stage-e2e,persona-switcher-e2e,omega-surface-e2e,omega-persona-gate,successor-gate-e2e}.cjs`.

Hazards WULD: ccxxvii (explicit-stage NAMED, never `git add -u`/`git add .`) -- K111 (`.git\*.lock`
operator-side) -- K113 (`curl.exe` not `curl`) -- K218a/K228 (base-guard on HEAD blob via
`git rev-parse HEAD:path`; read a fresh clone, never the mount) -- K231-hashtype (compare
like-to-like: git-blob vs `git rev-parse`, file-md5 vs file-md5; re-derive guards from live git at
open) -- K238 (cache-bust the `?v` of the file that CHANGED -- here css AND js) -- K204/ccxxxv
(CLAUDE.md fold via git-show->$HOME->python, NEVER Edit/Write) -- K110 (authored prose ASCII
`--`/`->`; U+FFFD 0; the `Yurei` macron is `&#363;` on the HTML side only) -- K186a (`/components/`
300s TTL edge-cold -> re-check ~5 min) -- K219/CRLF (Windows-tool-rewritten files gate SEMANTICALLY)
-- K233 (curtain markup OUTSIDE `<main>` keeps search neutral; passphrase is a soft curtain, not a
boundary). NO-PIN discipline (successor is a dormant auto-deploying sidecar). Cowork VM-cache
truncation: bash-verify on-disk after every Edit/Write. **NEW / load-bearing this session:**
(1) RENDER LANE MID-FLIGHT owns every avatar byte -- FREEZE manifests + assets + the resolver; the
clip-fold is SEQUENTIAL after this (shared files + one-committer), NOT concurrent. Confirm no
render-lane push is mid-flight before you start. (2) AUTO-OPEN-MODAL a11y: focus a sensible target
on open, keep Escape/x obvious, don't trap keyboard users -- the page's PURPOSE is the stage, so
auto-open is appropriate, but the closed state must be reachable and non-empty. (3) corner
SUPPRESSION is PAGE-SCOPED -- verify the real launcher/switcher root selectors first, and prove the
site-wide persona-switcher behavior is UNPERTURBED off `/successor/` (its e2e green). TZ=America/Phoenix.
