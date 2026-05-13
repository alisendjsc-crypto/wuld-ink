# wuld.ink — Cowork Implementation Brief

**Project:** WULD personal site — philosophical content distribution
**Stack:** Cloudflare end-to-end (Registrar + Pages + R2)
**Author context:** Josiah / WULD. Self-taught philosopher, writer. Works under handles WULD, AnomicIndividual87, Evilis Anihilis Uls. Not a coder — relies on Claude for technical implementation. Background in deconstructed radical Evangelical Christianity surfaces as biographical context in the work.

---

## Locked decisions

- **Domain:** `wuld.ink` (or close variant if .ink is taken at register time — check `wuld.org`, `wuld.press`, `wuld.art` as fallbacks; `wuld.com` is aftermarket-premium, skip)
- **Registrar:** Cloudflare Registrar — at-cost pricing, no markup, no renewal hike
- **Hosting:** Cloudflare Pages (free tier, unlimited bandwidth, commercial use allowed)
- **Object storage:** Cloudflare R2 (free tier, 10 GB, free egress) — for audio files and any single asset over 25 MB
- **Deploy method:** GitHub repo connected to Pages — push to deploy. Mirrors his existing GitHub-Pages-based workflow but with real CDN and edge headroom.

---

## Why this stack (one-paragraph rationale for context)

Cloudflare unifies registrar, DNS, hosting, CDN, SSL, and object storage in one dashboard. At-cost domain pricing eliminates the year-two renewal trap most registrars rely on. Pages' unlimited bandwidth and free tier are uniquely generous for a project distributed publicly to philosophy communities where a single viral link can spike traffic. R2's free egress is the killer feature for hosting audio — competitor object stores (AWS S3, Backblaze B2) charge per-GB-out, which would meter every play button click. The only tradeoff: domain must use Cloudflare nameservers, which for this stack is a feature, not a constraint.

---

## Audio narration architecture

Josiah wants pre-generated AI voice playback embedded on the site, without storing audio files in the Pages deployment itself. Architecture:

1. **Generation (offline):** Josiah produces narration in ElevenLabs (already familiar tool — used for prior YouTube essay work). Voice character matches his Baroque/Clinical register. One MP3 per logical unit — could be per-paragraph, per-section, or per-essay depending on design call.
2. **Upload to R2:** Files uploaded to a public R2 bucket with predictable naming, e.g. `essays/illogically-is/section-3.mp3`. R2 public access URLs follow pattern `https://pub-<hash>.r2.dev/<key>` or can be served from a custom subdomain like `audio.wuld.ink`.
3. **Embed on Pages:** Each narratable block in HTML gets an `<audio>` element with `src` pointing at the R2 URL. Play button styling is custom (see aesthetic notes below).
4. **Result:** Audio streams from R2 on demand. Zero footprint in the Pages build. Bandwidth cost: $0.

**Capacity math:** 10 GB R2 free tier ≈ 170 hours of MP3 narration at 128 kbps, or ~340 hours at 64 kbps (still acceptable for spoken voice). Likely never approached.

**Implementation note for Cowork session:** Build the HTML scaffolding with placeholder R2 URLs first (e.g. `data-audio-key="essays/foo/section-1.mp3"` attributes). Josiah generates and uploads the audio files separately. Wire up the JS audio controller to read the data attributes and construct the R2 URLs at runtime. This decouples Cowork-session work from Josiah's audio generation pipeline.

**RESOLVED 2026-05-11:** Audio granularity = per-paragraph but SELECTIVE — specific paragraphs across the site, not all paragraphs. Architecture supports per-paragraph; Josiah picks which paragraphs get audio per page.

---

## Aesthetic direction (carry over from existing work)

Josiah's locked visual register across all his work:

- **Mode:** Neobrutalist dark-mode default. Light mode optional, dark is canonical.
- **Typography:** IBM Plex Mono primary. Consider IBM Plex Sans for body if Mono fatigues over long-form reading; Mono retains for headings, code, structural elements.
- **Palette:** High-contrast. Near-black background, off-white text, **blood-red accents** for interactive elements, links, emphasis.
- **Influences:** Risograph print, zine culture, underground photography (Paul Clipson's optical printing), analog/experimental visual aesthetics. Not glossy, not corporate, not Material Design.
- **Reject:** Generic AI design aesthetic. Pastels. Gradients. Drop shadows. Rounded soft corners. Anything that looks like a SaaS landing page.

Reference work: his existing **EFIList Argument Library** at `alisendjsc-crypto.github.io/efilist-argument-library` carries this register and should function as a visual anchor for the new site.

---

## Content scope (informs IA decisions)

**EXPANDED 2026-05-11** — Josiah confirmed multi-page architecture with broader scope than original brief:

- **Argument Library** — efilist v3.6.1 (74 objections, 4-archetype interlocutor model, multiple visualization maps). One of the largest branches.
- **Book** — hybrid compendium (in active development): personal narrative + pessimistic philosophy + experimental form + comedy. Excerpts on site. Voice rule: clean body text, philosophical hedges in endnotes.
- **Essays** — *Sanguinolentum Vestigium* (pessimism manifesto), *Illogically Is* (nihilism treatise), *A Life Inside* (personal mementos).
- **Blog** — posts.
- **Void Engine** — prompt tool, with **Signal** and **Transmission** components.
- **Flash Cards** — game mode.
- **Glossary** — proprietary vocabulary: Alogical Isness, Contextus Claudit, Labor Sine Fructu, the Proxy Gamble, the NothinGist, w-holes (and Void Engine / Signal / Transmission if conceptually loaded).
- **Animations** — scope TBD.
- **Title page** — landing.
- **YouTube essays** — mirror only, don't host. Existing channel handles delivery.
- Future projects as added.

---

## Cloudflare-specific limits to remember

| Constraint | Limit | Practical impact |
|---|---|---|
| Files per Pages deployment | 20,000 | Effectively unlimited for this project |
| Max single file size (Pages) | 25 MB | Anything larger → put on R2 |
| Builds per month (Pages) | 500 | ~16 deploys/day before hitting cap |
| Bandwidth (Pages) | Unlimited | No throttling, no surprise bills |
| R2 storage (free) | 10 GB | ~170 hrs MP3, or thousands of large PDFs |
| R2 egress | Free | No per-download cost ever |
| Pages Functions requests | 100k/day | Only relevant if dynamic features added |

If a file exceeds 25 MB (e.g., print-ready PDF of the full book): host on R2, link from Pages.

---

## Recommended Cowork session sequence

1. **Scaffold the site structure** — IA decisions: single-page vs multi-page, essay index format, glossary location, EFIList integration approach. **PARTIAL RESOLUTION 2026-05-11:** multi-page confirmed.
2. **Build the design system first** — typography scale, color tokens, spacing rhythm, audio player component. Lock these before any page-level work. Reference EFIList visual register.
3. **Implement one full essay page** as canonical template — including audio narration scaffolding (placeholder R2 URLs).
4. **Glossary/vocabulary page** — standalone reference for the proprietary terms.
5. **EFIList integration** — decision needed from Josiah: link out, iframe embed, or extract components.
6. **Set up Cloudflare account + Pages deploy** — connect GitHub repo, configure custom domain wuld.ink, enable DNSSEC.
7. **R2 bucket creation + public access config** — set up custom subdomain `audio.wuld.ink` pointing at R2 if desired (cleaner URLs than `pub-*.r2.dev`).

---

## Open questions (status as of 2026-05-11)

- ~~Single-page vs multi-page architecture?~~ **RESOLVED: multi-page.**
- ~~Audio granularity?~~ **RESOLVED: per-paragraph, selective.**
- EFIList integration approach: link out / iframe embed / extract components. **OPEN.**
- Endnotes implementation: footnote popups / bottom-of-page / separate endnotes page. **OPEN.**
- Light mode toggle: include or omit? **OPEN.**
- Email contact: Cloudflare Email Routing free forwarding to Gmail, or omit? **OPEN.**
- **NEW:** Void Engine — pure client-side or needs Pages Functions backend? **OPEN.**
- **NEW:** Flash card game — content source (efilist objections? glossary terms? both?) and tech (vanilla JS / React / htmx)? **OPEN.**
- **NEW:** Animations — page transitions / decorative / illustrative? **OPEN.**
- **NEW:** Title page — distinct from homepage, or IS the homepage? **OPEN.**

---

## Working preferences (Josiah's stated workflow constraints)

- **Reading load:** Hard time with large text blocks (no current prescription glasses). Keep responses concise, use em-dash separation, avoid wall-of-text formatting.
- **Decisions first:** Recommendations before details. He wants the answer, then the reasoning, not the reverse.
- **Quality over speed:** Batch saves to prevent data loss. Don't sacrifice outcome quality for terseness.
- **Non-deferential register preferred:** Push back when there's a genuine disagreement; don't flatter; don't manufacture menus when a clear recommendation exists.
- **Iconoclasm:** Subvert conventional patterns where it improves the work. Default web aesthetics are the enemy.

---

## Handoff note

This brief consolidates: domain registrar comparison, Cloudflare stack rationale, storage capacity analysis, and audio narration architecture decisions from the prior session. Josiah has committed to `wuld.ink` on Cloudflare Registrar (registered 2026-05-11). Implementation can begin without further upstream decisions — the open questions above are design-level, not stack-level.
