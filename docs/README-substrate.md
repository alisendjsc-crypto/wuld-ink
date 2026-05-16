# Library substrate — reference files in `docs/`

This directory mirrors the library substrate locally for inspection / regeneration
context. **None of these files are deployed by wuld.ink.** The library is served from
its own repository (`alisendjsc-crypto/efilist-argument-library`) via Cloudflare Pages
at the `library.wuld.ink` subdomain (provisioning pending operator-side).

## Files

| File | Role | Mutation rules |
|---|---|---|
| `combined.html` | **The deploy target.** Single-file v3.7.1 stable distribution. md5 `dd2abd01a43c2f173c98aa1b8c88bcbb`, 2,234,272 bytes. Three surfaces behind outer hash router (`#/library`, `#/rwe`, `#/coda`). | **Md5-locked.** No edit, no whitespace, no `<link>` or `<style>` injection. LF-locked. Byte-verbatim or terminus reopen (harness-gated). |
| `rwe.html` | Pre-router RWE viewer (superseded; `#/rwe` surface in `combined.html` is now first-class). Regenerable source view. | Reference-only. Reference comment header injected. |
| `coda_v3_7.html` | Pre-router coda viewer (superseded; `#/coda` surface in `combined.html` is now first-class). Regenerable source view. | Reference-only. Reference comment header injected. |
| `index_v3_7_post_b3f2_surface_parity_html.html` | Pre-router multi-file library viewer (superseded by combined.html). Regenerable source view. | Reference-only. Reference comment header injected. |

## Why these files live here

The wuld.ink Cowork uses local copies of the library substrate for:

1. **Router-grammar probing.** Resolving Exchange 12's per-objection deep-link grammar question (locked in Exchange 13: RWE surface supports `#/rwe/<objection-id>`; library surface is not externally addressable).
2. **Cross-link wave-edits.** When the substrate's URL grammar changes, wuld.ink-side cross-links update to match without requiring a library micro-session.
3. **Schema reference.** The `<script type="application/json" id="rwe-data">` block embedded in `combined.html` is the canonical objection corpus shape.

## Cross-link grammar (locked in Exchange 13)

- **Library overview** → `https://library.wuld.ink/#/library`
- **Per-objection RWE deep-link** → `https://library.wuld.ink/#/rwe/<objection-id>` (no trailing slash)
- **Per-instance deep-link** → `https://library.wuld.ink/#/rwe/instance:<instance-id>`
- **Per-speaker / per-archetype filter** → `https://library.wuld.ink/#/rwe/speaker:<slug>` / `https://library.wuld.ink/#/rwe/archetype:<archetype>`
- **Coda** → `https://library.wuld.ink/#/coda`

Path-based grammar (`library.wuld.ink/objections/<id>/`) was inherited from the pre-router multi-file viewer and is not valid against the v3.7.1 single-file substrate.

## See also

- `docs/library-claude-coordination.md` — full coordination relay with library-Claude (Exchanges 1–13)
- `cowork_orientation_v3_7_publication.md` (in `uploads/`) — operator orientation for the separate library-repo publication Cowork session
- `docs/wuld-ink-cowork-brief.md` — wuld.ink umbrella architectural brief
