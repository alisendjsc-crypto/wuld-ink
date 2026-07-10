# Argue the Argument — landing plan (K215, 2026-07-10)

**Status:** decision doc only — NO public bytes, no page, no stub, no nav change. The game is authored in `D:\Argue the Argument` (own S-ledger; S24 = "Route persistence"; objection-vs-rebuttal appraisal frame, PUNCH / DISMANTLE moves, flagship set = the antinatalist case). Content/frame text is ratified library-Claude + Josiah material. **Cowork builds the vessel only.**

---

## a · Mount point — RECOMMENDATION: wuld.ink page (`/argue/`), wuld repo

Not library.wuld.ink, not the efilist repo, not its own subdomain.

- **Pin blast-radius.** The efilist repo carries the PINNED flagship. A game iterates (bugfixes, balance, UI passes) — high-cadence pushes through the pin-bearing repo buy nothing and multiply exposure. The wuld repo is the NO-PIN lane end-to-end.
- **The vendoring lane already exists.** wuld.ink already consumes validator-gated exact-byte library exports (`src/library-objections.json` 81 objections; `src/right-to-die-objections.json`). The game reads the antinatalist set the same way — snapshot in, ritual regen on corpus change. No live coupling to the pin.
- **IA precedent.** "Flash Cards — game mode" is in the original site brief's content scope; the game is a planned wuld.ink vertical. wuld.ink is the umbrella for participatory surfaces; library.wuld.ink is the reference instrument.
- **Firewall geometry.** Mounting game mechanics INSIDE library.wuld.ink is exactly the "mechanic beside the instrument" adjacency the P4c register gate exists to police. Separation keeps it clean: the game CITES the library (deep-links into card anchors); the instrument never hosts play chrome.
- **Free infrastructure.** A wuld.ink page inherits tokens.css, nav, search index, changelog/RSS, ambient chrome, reading-mode/a11y machinery. library.wuld.ink is a different render system (efilist build artifacts).

**Rejected:** `library.wuld.ink/argue` sidecar (all five points above). **Escalation path, not v1:** own Pages project (`argue.wuld.ink`) — only if the game ever app-izes around server saves; even then workers live in the wuld repo (`workers/admin`, `workers/comments` precedent), so separation would be organizational, not technical.

**PUNCH / DISMANTLE note:** the library already renders depth keys `punch / deconstruct / dismantle` (aux wings, K156-class). The game's move names are library depth vocabulary — reuse rides the vendored export's depth fields; no schema invention Cowork-side.

## b · Persistence infra (S24 "Route persistence")

**RECOMMENDATION: zero-infra v1 — URL route-codes as the share primitive + localStorage for continuity. No worker, no KV/D1, no accounts.**

- **Route-codes (share + save).** Run state serialized into a compact URL code (`/argue/#r=<code>`). Shareable, bookmarkable, zero identity, zero storage cost, zero moderation surface. This also discharges most of "users save and share their own content" with no profile infra.
- **localStorage (continuity).** Per-browser resume + streaks/history under a versioned `wuld:argue` key — precedent: `wuld:notes` (multi-note v1 schema), `wuld:ambient`, `wuld-admin-open`. Same graceful-degradation rules (JS off → static page text; no data leaves the browser).
- **Server saves (SCOPED ONLY — a real build, NOT started, separately ratified).** Shape if ever needed: `workers/argue` Worker + D1 table (`runs: id/code/payload/created_at`), POST → short code / GET by code, honeypot + salted-IP rate-limit per `workers/comments` patterns, retention + purge policy, admin list via the Access-gated admin worker. Standing costs: moderation/abuse/data-holding on a one-operator site. **Trigger to revisit:** route-code state outgrowing practical URL limits (~2 KB) or genuine cross-device resume demand. Neither is in evidence.

**Pending S24 recon:** `D:\Argue the Argument` never became reachable during K215 (device refused the path throughout; Add-folder attempted, connect never landed). S24's exact persistence text folds in at the next touch — the branch above is written so any reading (route-codes / localStorage / server-save ask) slots in without structural change. K216 opens with the folder connect + a bounded S-ledger read.

## c · Nav — RECOMMENDATION: 18th top-level tab at ship time, label "Argue", after Notes

- Verticals get tabs on this site (17 today; Notes = 17 · Notes). The game is a first-class participatory vertical, not a utility page — burying it contradicts the IA precedent.
- Eyebrow numbering continues the sequence (`18 · Argue`).
- Homepage index grid (6 destination cards): adding a 7th vs swapping is a ship-time call for Josiah — flagged, not decided here.
- A nav-grouping redesign (if 18+ items starts to hurt) is its OWN session; do not couple it to the game landing.

## d · Ship-time hooks (all existing ritual — run at public ship, none now)

- **Search index:** `python3 tools/search-index/build_index.py --src src --out src/search-index.json` regen (page + h2 entries) + `node tools/search-index/test-match.js` stays green (50/50; new legs only if game entries get special routing).
- **Changelog/RSS:** prepend `src/releases.json` → `python3 tools/changelog/gen_feed.py` → `src/feed.xml`; nav-glow targets ride the entry's `sections` automatically.
- **Page chrome:** OG/JSON-LD head block per template; eyebrow + nav `aria-current`; `?v=` cache-bump ONLY on shared-component touches (game assets should be self-scoped to avoid sweeps).
- **Degradation + a11y:** game requires JS → honest `<noscript>` block; homepage zero-JS D1 invariant untouched (game JS page-scoped); reduced-motion gates on any animation; focus-visible + scroll-margin belts per K213 patterns.
- **Data:** vendored antinatalist-set export (exact bytes, validator-gated, like `library-objections.json`). The export GENERATOR is efilist-side — a library-Claude coordination ask (relay doc), not a Cowork improvisation.
- **Aesthetic register:** LOCKED — tokens.css, mono chrome, neobrutalist dark. No gamified-SaaS visuals, no confetti, no rounded-soft-corner play UI.

## e · DO-NOT-TOUCH (landing arc)

1. **The pinned flagship** — `library.wuld.ink/combined`(+`.html`), pin == live. ZERO efilist bytes in this arc; any export generator lands via the library coordination lane in its own NO-PIN fold.
2. **Register discipline** — the corpus stays rebut-only / optionality / firewall-clean. Game copy that characterizes stances = ratified material. The P4c charter gate — *educational, not endorsement; no mechanic that reads the suite as taking the natalist or any positive side* — must be RATIFIED (Josiah + library-Claude) before public ship.
3. **No accounts / no profiles** — K83/K84 posture (Access OTP only, no self-built auth). Route-codes carry zero identity by design. Forum/profiles remain separately gated (standing no-build position; see K215 stratum).
4. **Game content** — cards, move text, set composition: never authored or altered by Cowork.
5. **Homepage zero-JS invariant; aesthetic reject-list; CLAUDE.md large-file discipline** (git-show / device-stage + md5, never Write/Edit on repo files).

## f · Sequencing (v1 ship arc, when called)

1. S24 + S-ledger recon (folder connect) → confirm persistence reading + any mount/naming opinions the game's own ledger holds.
2. Vendored set export (coordination ask efilist-side; validator-gated) → wuld vendor fold.
3. Vessel page `/argue/` (chrome + game shell; content mounted from ratified material).
4. Route-code + localStorage layers.
5. Register-gate ratification (P4c) — blocking gate before anything public.
6. Nav tab + homepage-card call + hooks (§d) in the ship fold.

**Open at close:** route name `/argue/` vs alternatives (game ledger may hold one); nav label; homepage card add-vs-swap; S24 confirmation; laymen-tier ↔ difficulty mapping timing (P4a dependency for easy tiers).
