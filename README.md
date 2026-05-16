# wuld.ink

The multi-page umbrella for Josiah's (WULD / AnomicIndividual87 / Evilis Anihilis Uls) philosophical output: essays, glossary, the book *Malgré Tout*, the argument library, the Void Engine instrument, and the surrounding apparatus. Cloudflare end-to-end stack. Domain registered 2026-05-11.

Substrate aesthetic: neobrutalist dark-mode (canonical) with scoped accessibility modes (reader / high-contrast) on heavy-read containers. Typography: Cormorant Garamond (display) + IM Fell English (headlines) + EB Garamond (body) + IBM Plex Mono (chrome) — all self-hosted. Magnification slider 90–140% (K24c).

Live at [`wuld.ink`](https://wuld.ink) — single auto-deployed Cloudflare Pages project (`git push origin main` → live).

## Architecture

| Surface | Path | Status |
|---|---|---|
| Homepage (title page + destination index) | `/` | Live |
| Essays | `/essays/` | Live (Sanguinolentum Vestigium, Alogically Is, Architecture of Moral Disaster, A Life Inside) |
| Book *Malgré Tout* | `/book/` (+ `/book/nothingist/`) | Live; cover image + Mementos surface; chapters forthcoming |
| Glossary | `/glossary/` | 22 entries (mix of live + scaffolded-pending) |
| Argument Library entry-point | `/argument-library/` | Live; surfaces v3.7.1 count + substrate cross-link |
| About the Library | `/library-about/` | Live (K24d scaffold) |
| Coda | `/coda/` | Scaffold (K24d) — F+ editorial extraction pending |
| Violence as Reductio (long-form) | `/violence-as-reductio/` | Scaffold (K24d) — F+ editorial extraction pending |
| Why Not Suicide Then? (long-form) | `/why-not-suicide/` | Scaffold (K24d) — F+ editorial extraction pending |
| Blog | `/blog/` | 2 posts (The Easiest Case + Load-Bearing) |
| Watch (video link-out) | `/watch/` | Scaffold; placeholder cards await live video data |
| Void Engine instrument | `/void-engine/` | Live; awaiting chat-side transmission-mode registry fills |
| Ne Hoc Fiat (project page) | `/ne-hoc-fiat/` | Live (K10) |
| Frame (cold-reader entry) | `/frame/` | Live (K3) |
| Disclaimers | `/disclaimers/` | Live (K24a) — site-wide legal + personal disclaimers v1 |
| Successor Protocol | `/_/successor-protocol/` | Sealed surface; Cloudflare Access OTP gate (operator-side, pending) |

## Argument library

The systematic objection corpus lives in a separate repository (`alisendjsc-crypto/efilist-argument-library`) and is served from `library.wuld.ink` as a single-file Cloudflare Pages deploy.

- **Substrate:** `combined.html` v3.7.1 stable (md5 `dd2abd01a43c2f173c98aa1b8c88bcbb`, 2,234,272 bytes). Three surfaces behind an outer hash router (`#/library` / `#/rwe` / `#/coda`).
- **Corpus:** 78 objections / 5 tiers / 34 mechanisms / 136 attested real-world deployments / 4-archetype interlocutor model.
- **License:** CC-BY-4.0 (content) + MIT (code).
- **Status:** substrate canon-terminus stable; subdomain provisioning pending operator-side Cloudflare dashboard wiring. Cross-link grammar: `library.wuld.ink/#/rwe/<objection-id>` (RWE surface; per-objection deep-link); `library.wuld.ink/#/library` (surface-level).

See `docs/library-claude-coordination.md` for the full coordination relay with library-Claude (Exchanges 1–13).

## Screenshots

Library substrate surfaces (screenshots taken against `combined.html` v3.7.1):

<img src="docs/screenshots/01-library-argument-flow.png" alt="Library — Argument Flow view, BLENDED mode" />

<img src="docs/screenshots/02-library-dependency-graph.png" alt="Library — Dependency Graph view" />

<img src="docs/screenshots/03-library-mechanism-web.png" alt="Library — Mechanism Web view" />

<img src="docs/screenshots/04-library-rwe-by-objection.png" alt="Library — Real-World Examples surface, by-objection facet" />

<img src="docs/screenshots/05-library-objection-detail.png" alt="Library — Tier 1 objection detail with response deconstruction" />

<img src="docs/screenshots/06-library-top-nav.png" alt="Library — top-nav chrome with mode toggles" />

See `docs/screenshots/README.md` for filename conventions and drop instructions.

## Stack

| Layer | Service |
|---|---|
| Registrar | Cloudflare |
| Hosting | Cloudflare Pages (free tier; auto-deploy on `git push`) |
| Object storage | Cloudflare R2 (`wuld-audio` bucket → `audio.wuld.ink`) |
| Audio architecture | Per-paragraph selective; ElevenLabs generation offline → R2 upload → `<audio>` embed |
| DNS | Cloudflare (DNSSEC enabled) |
| TLS minimum on R2 custom domain | 1.2 |

## Audio architecture

Per-paragraph but **selective** — specific paragraphs across the site, not all. Controller at `/components/audio-player.js`; audio host at `audio.wuld.ink` (R2 public custom domain). Each audio block uses `data-audio-key="<path>"` to resolve to `https://audio.wuld.ink/<path>`.

Currently live: Sanguinolentum Vestigium (3 sections). Staged: Architecture of Moral Disaster (23:11 full reading, awaits R2 upload).

## Repository layout

| Path | Role |
|---|---|
| `src/` | Live site content (HTML/CSS/JS, all under `data-mode` cascade) |
| `src/tokens.css` | Design tokens (typography, colors × 3 modes, spacing, borders, motion) + `@font-face` declarations |
| `src/base.css` | Reset + element defaults; root font-size 18px × magnification scale |
| `src/components/` | Shared components (nav, footer, audio-player, mode-toggle + mag-slider, essay, glossary, void-engine) |
| `src/fonts/` | Self-hosted WOFF2 typography (Cormorant Garamond, IM Fell English, EB Garamond) |
| `src/favicon.svg` | Site favicon (neobrutalist W on near-black ground, blood-red accent) |
| `docs/` | Coordination docs, brief, library substrate reference copies |
| `docs/library-claude-coordination.md` | Full cross-Claude coordination relay (Exchanges 1–13) |
| `docs/book-claude-coordination.md` | Book-project Claude coordination |
| `docs/successor-claude-coordination.md` | Successor Protocol coordination |
| `docs/wuld-ink-cowork-brief.md` | Full implementation brief |
| `docs/combined.html` + 3 regenerable sources | Library substrate reference copies (NOT deploy targets; see `docs/README-substrate.md`) |
| `docs/screenshots/` | Screenshots embedded in this README (drop instructions in `screenshots/README.md`) |
| `CLAUDE.md` | Cowork primer (active session context) |
| `CLAUDE-history.md` | Per-session narrative archive (K1 through prior trim point) |

## License

Content authored on this site: all rights reserved unless otherwise noted. The argument library substrate (separate repository) ships under CC-BY-4.0 (content) + MIT (code).

## Notes

- The argument library is a **separate project** (`efilist-argument-library`) consumed by wuld.ink; not a parent.
- Site work is coordinated via Cowork sessions; per-session narratives in `CLAUDE-history.md`.
- Cross-project coordination (library / book / successor protocol) uses append-only relay docs in `docs/*-coordination.md`.

See `docs/wuld-ink-cowork-brief.md` for the full architectural brief.
