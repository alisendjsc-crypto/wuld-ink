WULD.INK -- Successor STAGE "viewfinder widen" (K240 kickoff). NO PIN.

Recommended default: widen the `/successor/` stage panel so the chat viewfinder fits more text per line and the avatar (Mr. Grey / Yūrei) reads slightly larger. LAYOUT-ONLY, CSS-first: the width lives in `.sstage-panel` in `successor-stage.css` + a `?v` bump on the css tag in `successor/index.html`. NO engine, corpus, matcher, persona, manifest, or avatar-asset change. Self-contained, arc-advancing, firewall-clean. K239's hero-avatar redesign (avatar-as-background + glass lower-band chat + idle-peek + appear-on-open) is LIVE and STAYS -- this only grows the vessel.

Why this session exists (the ask)
K239 shipped the hero-avatar stage: the companion's clip fills the panel and the chat floats over it as glass. Josiah's read after living with it: the panel is a touch narrow -- text wraps short (a scrollbar with only ~2 exchanges visible) and the avatar could stand to be a little bigger. The panel is `width: clamp(360px, 42vw, 520px)` against `height: min(92vh, 880px)` -- NARROWER than the avatar's native 3:4, so the clip is side-cropped and the text column is tight. Widen it: more reading width AND a fuller, larger avatar in one move. ("larger model" == the 3D avatar reads bigger; the chat stays the local firewall-clean matcher, NOT an LLM.)

Verify-at-open (fresh public-origin clone; verify-don't-redo)
* wuld HEAD == origin (expect `b2dc503` [K239 hero-avatar redesign] or later). ONE-committer law: confirm no other wuld-committing session is mid-flight -- the render lane is actively producing new avatar clips/manifests (see Hazards); make sure it is NOT mid-push to wuld when you start. Read a FRESH clone's actual HEAD + CLAUDE.md carries; do not trust the mount.
* K239 is LIVE + real: `successor-stage.css`/`.js` load at `?v=K239` in `successor/index.html`; the CSS carries `.sstage-fg` (glass foreground cluster) + `.sstage-panel.sstage-peeked` (idle-peek states); the JS reparents the avatar to a panel background layer, wires `wake()`/idle-peek, and opens on `showSprite("appear",{then:"idle"})`. Served CSS at `/components/successor-stage.css?v=K239` contains `sstage-fg` + `sstage-peeked` (K239 deploy-verify passed).
* Current geometry you're changing: `.sstage-panel { width: clamp(360px, 42vw, 520px); height: min(92vh, 880px); }`; `.sstage-transcript { max-height: 54% }` (48% mobile); `.sstage-line { max-width: 90% }`; avatar `object-position: 50% 22%`. Mobile (`<=520px`) already fills the viewport -- leave it.
* Untouched HELD: flagship `library.wuld.ink/combined` pin (v4.0.0); search-index; Yūrei + Mr. Grey corpora/matchers/personas; ALL avatar manifests + asset bytes + the resolver; `persona-switcher.js`. Internal `var VER="K238"` (manifest/corpus fetch cache-bust) stays -- no fetch change this session.

The design (crisp)
Persona-AGNOSTIC (serves BOTH avatars via the switcher; test both).
1. Widen the panel. Target the avatar's native 3:4 so the clip fills with minimal side-crop and reads larger: at `height: min(92vh, 880px)`, a ~660px width lands near 3:4 (Mr. Grey's frame is 540x720 = 0.75). Recommend `width: clamp(380px, 52vw, 660px)` -- then TUNE by screenshot to a comfortable reading measure and a well-framed avatar on a common desktop (1440x900) without overrunning the overlay's 3vw side padding. Do NOT exceed ~3:4 (a landscape panel crops the avatar's head off).
2. Keep the text measure sane. Wider is the point, but cap the reading measure so lines don't sprawl -- a transcript inner column around ~600-640px (~60-70ch) is the comfort zone. Bubbles stay `max-width: 90%` of the now-wider column; sanity-check `.sstage-you`/`.sstage-them` bubbles don't get uncomfortably long.
3. Avatar reads larger for free. The bigger panel enlarges the clip. Re-check `object-position` frames the head/upper third for BOTH personas at the new size (Mr. Grey front-face; Yūrei back-view figure). Adjust the anchor ONLY if a persona's head drifts out of the safe upper band.
4. Everything else K239 is untouched: hero background layer, glass lower-band chat, bottom-up scrim, idle-peek reveal (chat eases to ~0.15 after 4s; input stays usable), appear-on-open, reduced-motion still, the mono speaker chips, the sgate curtain + "nothing leaves your browser" copy.
5. Accessibility holds: text stays WCAG-AA over the DARKEST and BRIGHTEST avatar frames. The bubble colors don't change, so the K239 ~9.9:1 floor holds -- but re-screenshot + re-sample to confirm at the new geometry; focus order + visible focus ring on input/send/x preserved; transcript stays `role="log" aria-live`.

Approach (LAYOUT ONLY -- CSS-first)
* `successor-stage.css`: the whole change is `.sstage-panel` width (+ any small measure/transcript tune). Restyle, don't rename -- keep every `.sstage-*` class the e2e + JS reference. Keep the reduced-motion block's `.sstage-av-video { display: none; }` as the FIRST declaration after "prefers-reduced-motion" (the e2e regex `/\.sstage-av-video\s*\{\s*display:\s*none/` slices the file from that string to EOF -- don't break it).
* `successor/index.html`: bump ONLY `successor-stage.css?v=` (K239 -> K240). JS is unchanged this session, so leave `successor-stage.js?v=K239` and internal `VER="K238"` alone (bump the js tag only IF you end up touching the js).
* Judge by SCREENSHOTS (it's a visual change): headless shot or claude-in-chrome of `/successor/` with the stage open, at desktop (1440x900) + a wide desktop + mobile, dark, AND `prefers-reduced-motion`, AND over a bright avatar frame -- confirm framing + measure + legibility, BOTH personas. Contrast can also be checked numerically (bubble rgba composited over sampled avatar pixels) -- reuse the K239 method (ffmpeg frame-extract + PIL WCAG composite).

Guardrails
* NO PIN. NO efilist bytes. NO flagship/canon/search-index touch. NO corpus/matcher/persona/manifest/avatar-asset change -- width + presentation only.
* Avatar manifests + bytes + resolver stay FROZEN -- the render lane owns those and is mid-flight (Hazards). Do NOT fold clips here; that is K241.
* Yūrei + Mr. Grey BYTE-UNCHANGED except the shared stage CSS. Persona-gate GREEN A-F; `persona-switcher.js` untouched.
* sgate curtain (`ne-hoc-fiat`), transcript localStorage (`wuld:successor:*`), crisis rendering, firewall copy stay behavior-identical. `/successor/` stays nav-greyed + curtained (dormant polish behind the curtain).
* CSP: same-origin only.

Ship
* ONE wuld PS block (NO PIN): fresh-filename `.k240` sidecars for `successor-stage.css` + `successor/index.html` (js only if you touched it); `.git\*.lock` cleanup -> HEAD base-guard (`b2dc503`/later) -> base-md5 guards (read `git show HEAD:path` / a FRESH clone, NEVER the mount) -> Move-Item -> result-md5 gates -> explicit-stage the NAMED files (NEVER `git add -u` -- the tree carries untracked cruft: `_to_delete/`, kickoff `.md`s) -> commit -> push -> deploy-verify (`curl.exe -sI` /successor/ + `successor-stage.css?v=K240` = 200; plus a served-bytes grep that the new width rule is live). Text sidecars byte-exact LF via device_commit_files (watch the CRLF trap: write binary/newline="").
* Regress: `node tools/omega/{successor-stage-e2e,persona-switcher-e2e,omega-surface-e2e,omega-persona-gate,successor-gate-e2e}.cjs` all GREEN. No class renamed -> all stay green; if you rename any `.sstage-*`, update the e2e in the SAME commit.

SPLIT (if it runs long)
Land the panel widen for the ACTIVE persona (Mr. Grey) first, e2e green, ship. A Yūrei-parity anchor recheck (her back-view head-framing at the new width) becomes a 15-min follow-up. The layout degrades safely at every intermediate width (worst case: avatar larger, chat readable).

Key paths
* `src/components/successor-stage.css` (`.sstage-panel` width -- the change); `src/successor/index.html` (the css `?v` tag, line ~50).
* Untouched refs: `src/components/successor-stage.js`; `src/assets/omega/avatar/mrgrey_manifest_v1.json` + `src/assets/yurei/avatar/avatar_manifest_v2.json` (render lane owns; frozen here).
* Tests: `tools/omega/{successor-stage-e2e,persona-switcher-e2e,omega-surface-e2e,omega-persona-gate,successor-gate-e2e}.cjs`.

Hazards
WULD: ccxxvii (explicit-stage NAMED, never `git add -u`) -- K111 (`.git\*.lock`) -- K113 (`curl.exe` not `curl`) -- K218a/K228 (base-guard on HEAD-blob md5; read a fresh clone, never the mount) -- K238 (cache-bust the `?v` of the file that CHANGED -- here css only) -- K110 (authored prose ASCII `--`/`->`; U+FFFD 0) -- PowerShell: one-line if/else, Md5 helper NOT named `H`, `[Environment]::CurrentDirectory` if any .NET relative path. NO-PIN discipline (successor is a dormant auto-deploying sidecar). Cowork VM-cache truncation #59564: bash-verify on-disk after every Edit/Write. RENDER LANE MID-FLIGHT: a Fable session is producing new avatar clips + manifests (Mr. Grey base set shipped 2026-07-15; Yūrei v3 manifest `aa1a91bd`, `_v3` self-contained) and flagged a `regard` (frontal, steady eye-contact) role that COLLIDES with Yūrei's confirmed back-view framing (no face) -- that needs a design ruling from Josiah before render, and the whole clip-fold is the queued K241 (SEQUENTIAL with this, not concurrent: shared files + one-committer). Keep K240 strictly layout so it does not collide. TZ=America/Phoenix.
