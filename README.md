# wuld.ink

Josiah's personal philosophical-content site. Domain registered through Cloudflare Registrar on 2026-05-11 (1yr, auto-renew $20/yr, expires 2027-05-11).

## Stack

- Registrar: Cloudflare
- Hosting: Cloudflare Pages (free tier)
- Object storage: Cloudflare R2 (audio narration)
- Deploy: GitHub repo → Pages (push to deploy)

## Status

Scaffold pending. Session A (design tokens + canonical essay template) not yet kicked off.

## Scope (per 2026-05-11 confirmation)

Multi-page site. Branches:

- **Argument Library** — efilist v3.6.1 integration (one of the largest branches)
- **Book** — hybrid compendium excerpts
- **Essays** — *Sanguinolentum Vestigium*, *Illogically Is*, *A Life Inside*
- **Blog** — posts
- **Void Engine** — prompt tool, with Signal and Transmission components
- **Flash Cards** — game mode
- **Glossary** — proprietary vocabulary
- **Animations** — scope TBD
- **Title page** — landing
- Future projects as added

## Audio

Per-paragraph but **selective** — specific paragraphs across the site, not all. ElevenLabs generation offline → R2 upload → `<audio>` embed.

## Notes

This is a separate project from `efilist_argument_library` (located at `C:\Users\y_m_a\Downloads\Argument Library\`). Efilist is content consumed by wuld.ink, not a parent.

See `docs/wuld-ink-cowork-brief.md` for the full implementation brief.
