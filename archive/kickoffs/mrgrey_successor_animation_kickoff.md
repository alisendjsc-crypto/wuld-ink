# WULD.INK -- Mr. Grey successor-avatar ANIMATION FINISH (kickoff). NO PIN.

Recommended default: finish the **5 reactive Mr. Grey clips** on the locked rig (game-side Blender),
then do the **zero-code manifest swap** that makes them live on `/successor/` (wuld-side, NO PIN), and
fold in the owed `/successor/` sitemap-exclude. Self-contained, arc-advancing, touches no pinned
content. If Blender iteration eats the budget, Half B splits to a 30-min follow-up (see SPLIT).

## Why this session exists (where it stalled)
Mr. Grey -- the Alpha-Omega successor proxy's avatar, Yurei's register-opposite twin (she files, he
argues) -- shipped as an **MVP pair** at "Mr. Grey session 1" (2026-07-13): the finished procedural
black-shorthair model (`D:\Mascot Yurei\mr_grey\mr_grey_v1.blend`, R.3 noir register LOCKED) + the
**idle clip** + a canonical-p0 still, on the `avatar_manifest_v2` contract, gates 7/7 PASS. The
relay (`D:\Mascot Yurei\mr_grey\avatar\mr-grey_av_v1_wuldink_relay.md`) states it plainly: **"the 5
reactive clips (appear / listen / speak / dismiss / long_idle) are the next increment -- pipeline
proven end-to-end, mechanical to add on the locked rig."** Model + rig + render/encode recipe are
DONE and proven; only those 5 animations were never built. The Omega SURFACE already shipped LIVE
(2026-07-14, commit `5caec1b`) wearing a clearly-labelled PLACEHOLDER silhouette
(`mrgrey_placeholder.svg`); the resolver is data-driven, so real clips bind with NO omega-assistant.js
code change. This session finishes the FACE.

## Verify-at-open (fresh public-origin clone; verify-don't-redo)
- wuld HEAD == origin (expect `cff932f` [K236 repo-hygiene trim] or later). ONE-committer law: confirm
  no other wuld-committing session is mid-flight before Half B.
- LIVE placeholder state: `/successor/` renders `mrgrey_placeholder.svg`; `src/assets/omega/avatar/mrgrey_manifest_v1.json`
  is `status:"placeholder"` (2 still-only assets, both the SVG); `omega-assistant.js` `VER="K230"`,
  `ASSET="/assets/omega/"`, `MANIFEST_URL=/assets/omega/avatar/mrgrey_manifest_v1.json`.
- Untouched HELD: flagship `library.wuld.ink/combined` `e654eabd` (pin v4.0.0, efilist HEAD `e28455e`);
  search-index `564d6a81`; Yurei avatar set + `yurei-*` files BYTE-UNCHANGED; canon v38.1 `b4bc35fd`.
- Game-side base: `mr_grey_v1.blend` (rig LOCKED); `avatar/mr-grey_av_idle_v1.webm` + `mr-grey_av_still_v1.png`
  + `frames/idle/f_0001..0192.png` present; `mr-grey_manifest_v1.json` `status:"partial-mvp"`.

## The clip contract (mirror `avatar_manifest_v2`; Mr. Grey's OWN motion + anchor)
All clips: **540x720 px, 24 fps, full-alpha VP9 webm, anchorPx [267,259]** (his own; carried for
contract parity -- he does not use haunting-WATCH geometry). Motion is Mr. Grey's R.3 register -- noir,
self-possessed, contemplative; NOT cute, NOT glossy. Roles + frame budgets (idle already done):

| role       | frames | dur  | loop | notes                                                       |
|------------|--------|------|------|-------------------------------------------------------------|
| idle       | 192    | 8 s  | yes  | DONE (`mr-grey_av_idle_v1.webm`)                            |
| appear     | 72     | 3 s  | no   | P0 -- entrance (settle/regard-open)                          |
| speak      | 144    | 6 s  | no   | P0 -- talking state; jaw/mouth motion (most-seen)           |
| dismiss    | 96     | 4 s  | no   | P0 -- exit / recede                                          |
| listen     | 96     | 4 s  | yes  | P1 -- attentive hold (ears/eye); falls back to idle if deferred |
| long_idle  | 192    | 8 s  | no   | P1 -- timeout drift; ALSO render a `long_idle-still`; FB idle |

(Yurei's idle is 288f/12s but Mr. Grey's shipped idle is 192f/8s -- keep HIS cadence; the contract
FIELDS are what bind, not Yurei's exact timings.) **Priority if time-boxed:** P0 = appear/speak/dismiss
(entrance, talking, exit -- the high-visibility trio). P1 = listen/long_idle (both degrade gracefully to
idle via `animation_fallback`, so they can split to a later increment with no broken state).

## HALF A -- finish the 5 clips (GAME-SIDE, on-device Blender MCP; commits NOTHING to wuld)
Seat drives Blender via `mcp__remote-devices__Blender__execute_blender_code` (live `bpy`). Proven recipe:
1. Open `mr_grey_v1.blend` (rig LOCKED -- do NOT remodel). Author each clip as a NEW named action on the
   established lane. Precedents on disk: `character/make_cat_clips_v2.py` (object-TRS clips on NLA_TRACKS
   -- sit/curl/tail_flick; the flatten bug is the POSE/armature path only) and `character/make_idle_pair.py`
   (pose/quaternion idle variants, empirical sway-axis, loop-safe by construction). Match whichever path
   the shipped idle used; keep first==last on every channel for loops.
2. Render 540x720 / 24 fps / Eevee (BLENDER_EEVEE 256-TAA) -> per-clip `frames/<role>/f_####.png` ->
   encode **VP9 full-alpha webm, crf 30** (the idle's proven encode). Deterministic values, never RNG
   (diffable exports). SAVE and EXPORT in SEPARATE MCP calls (open/export same-call trap).
3. Numeric gates per clip (the `mr-grey_gates_v1.json` 7/7 pattern -- judge scripted anim by DATA, never
   by eyeballed renders): alpha (RGBA / container alpha_mode), loop_seam (f1==f_last exact on loops +
   rendered MAD < ~0.01), palette (red_frac ~0.97, absorbed-dark crimson meanRGB, banned blue/teal px 0),
   encode (frame count, 0 zero-byte, 0 missing), framing/still_parity.
4. Update `mr_grey/avatar/mr-grey_manifest_v1.json` -> `status:"complete"`, assets[] = 6 clips + 2 stills
   with real md5/sha256/size/px/frames/fps/durationMs/loop. Output = the drop-ready bundle for Half B.

## HALF B -- make it live (WULD-SIDE, Cowork-native, NO PIN; the zero-code swap)
The wiring already supports this -- `omega-assistant.js` resolves hint->role via the manifest's
`animation_fallback`, so binding real clips is data-only:
1. Drop the 6 webms + 2 stills into `src/assets/omega/avatar/` (name `mrgrey_av_{idle,appear,speak,dismiss,listen,long_idle}.webm`
   + `mrgrey_av_still.png` + `mrgrey_av_long_idle_still.png`; keep the SVG as ultimate fallback).
2. Rewrite `src/assets/omega/avatar/mrgrey_manifest_v1.json`: `status` placeholder->`complete`; assets[]
   = the real set (roles + real hashes/sizes/frames/fps/durationMs/loop). Restore the RICH
   `animation_fallback` (deflect->speak, regard->long_idle, glitch->speak, listen/appear/dismiss as their
   own clips now) so the reactive clips actually fire -- the placeholder routed everything to idle.
3. Bump `omega-assistant.js` `VER` `K230`->`K23x` (one line) so the manifest + assets re-fetch (cache-bust).
4. `src/successor/index.html`: swap the `oasst-summon-av` `<img src=mrgrey_placeholder.svg>` to the real
   still/poster; rewrite the caption ("black-cat avatar ... hasn't landed yet; a grey silhouette stands
   in" -> landed). Keep the sgate curtain (passphrase `ne-hoc-fiat`) + bottom-left mount unchanged.
5. FOLD the owed K236 sitemap follow-on: add `<meta name="wuld-search" content="exclude">` to
   `src/successor/index.html` (matches the dormant `/console/` twin) -> sitemap stays 62, drift closes.
6. Regress: `node tools/omega/omega-surface-e2e.cjs` + `omega-persona-gate.cjs` + `successor-gate-e2e.cjs`
   (persona-switcher-e2e if the switcher is touched -- it should NOT be). Yurei parity untouched.

## Guardrails
- **NO PIN. NO efilist bytes. NO flagship/canon/search-index touch. NO corpus/persona/voice change** --
  this is an ASSET-SKIN swap only, firewall-clean. Mr. Grey's WORDS (the R.2 corpus) are library-Claude's
  separate lane and are NOT this session; the speak clip animates the mouth, voice-sync is a later increment.
- **Yurei BYTE-UNCHANGED** (`yurei-*` files, `src/assets/yurei/*`); persona-gate GREEN A-F; the switcher
  (if present) orchestrates via public APIs + CSS only, never editing yurei-assistant.js.
- Half A commits nothing to wuld (game-side D:\ files). Half B is the ONLY wuld-committing part -> one-committer law.
- CSP: same-origin only; avatar at `/assets/omega/avatar/*`, engine/corpus at `/components/*`. No external origins.

## Ship
- **Half A:** game-side only -- save `mr_grey_v1.blend`, the new `frames/<role>/`, the 6 webms + 2 stills into
  `D:\Mascot Yurei\mr_grey\avatar\`, updated `mr-grey_manifest_v1.json` + a fresh `mr-grey_gates` json.
  NO wuld commit. (Optional: a short relay note mirroring `mr-grey_av_v1_wuldink_relay.md`.)
- **Half B:** ONE wuld PS block (NO PIN), ccxxxvi fresh-filename `.k2xx` Move-Item for the edited text files
  (manifest, omega-assistant.js, successor/index.html) + binary asset drop; `.git\*.lock` cleanup -> HEAD
  base guard -> base-md5 guards -> Move-Item -> result-md5 gates -> explicit-stage the NAMED files + the new
  assets (NEVER `git add -u`) -> commit -> push -> deploy-verify (`curl.exe -sI` /successor/ + omega-assistant.js
  + one asset = 200). Binary webms/pngs: deliver via device_commit_files (byte-exact), then stage+commit.

## SPLIT (if Blender iteration runs long)
Land Half A (P0 trio at minimum: appear/speak/dismiss -> `status:complete` for those; listen/long_idle
stay FB-idle) as the game-side deliverable; Half B swap + sitemap-exclude becomes a 30-min follow-up
session. The manifest degrades gracefully at every intermediate count -- no broken live state.

## Key paths
- Game: `D:\Mascot Yurei\mr_grey\` (model/blends/frames/avatar), `D:\Mascot Yurei\character\` (make_cat_v1.py,
  make_cat_clips_v2.py, make_idle_pair.py, export/verify scripts), `D:\Mascot Yurei\BLENDER_GODOT_PIPELINE_HANDOFF.md`.
- wuld: `src/assets/omega/avatar/mrgrey_manifest_v1.json` + `mrgrey_placeholder.svg`; `src/components/omega-assistant.js`;
  `src/successor/index.html`; `tools/omega/omega-surface-e2e.cjs` (+ persona-gate, successor-gate).
- Contract reference: `src/assets/yurei/avatar/avatar_manifest_v2.json` (the role/field template).

## Hazards
BLENDER (from the pipeline handoff): never validate color/anim in Blender viewport -- judge by DATA/gates,
not renders (EEVEE previews lie); `bpy.data.images[name].reload()` after re-baking a texture before
re-export (stale-embed foot-gun); wrap GLTF/export in `temp_override` (window/screen/area/region/active/
selected) -- `read_homefile(use_empty=True)` breaks export context; DETERMINISTIC values not RNG;
**Cowork VM-cache truncation (#59564) -- bash-verify on-disk after every Edit/Write**, recover via heredoc.
WULD: ccxxvii (explicit-stage NAMED, never `git add -u`) · K111 (git operator-side; `.git\*.lock`) · K113
(`curl.exe` not `curl`) · K115a/K204 (large files via git-show/clone, never Edit/Write) · K218a/K228
(base-guard on HEAD-blob md5; read from a fresh clone, never the mount) · K110 (authored prose ASCII
`--`/`->`; U+FFFD 0) · NO-PIN discipline (successor is a dormant auto-deploying sidecar). TZ=America/Phoenix.
