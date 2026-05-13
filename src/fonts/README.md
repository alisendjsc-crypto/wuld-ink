# src/fonts — self-hosted typography

The site references three faces, all under the SIL Open Font License. Drop the WOFF2 files listed below into this directory and the `@font-face` declarations in `src/tokens.css` will pick them up automatically.

**Current rendering behavior:** The `@font-face` `src` chain uses `local()` first, so the fonts render correctly on Josiah's machine immediately (the fonts are installed locally). The self-hosted files below are only required for web visitors who don't have the fonts installed. Until they exist, those visitors fall through to the system serif fallback chain in `tokens.css`.

---

## File list (exact names — must match)

### EB Garamond (body text, h3–h5)
| File | Weight | Style |
|---|---|---|
| `EBGaramond-Regular.woff2` | 400 | normal |
| `EBGaramond-Italic.woff2`  | 400 | italic |
| `EBGaramond-SemiBold.woff2`| 600 | normal |
| `EBGaramond-Bold.woff2`    | 700 | normal |

Optional `.woff` companions for older browsers (basically unnecessary in 2026; WOFF2 has near-universal support).

### IM Fell English (h1, h2 essay titles)
| File | Weight | Style |
|---|---|---|
| `IMFellEnglish-Regular.woff2` | 400 | normal |
| `IMFellEnglish-Italic.woff2`  | 400 | italic |

IM Fell English is a single-weight face — no need to include bold or semibold variants.

### Cormorant Garamond (display, homepage hero, title-page)
| File | Weight | Style |
|---|---|---|
| `CormorantGaramond-Regular.woff2`  | 400 | normal |
| `CormorantGaramond-Medium.woff2`   | 500 | normal |
| `CormorantGaramond-SemiBold.woff2` | 600 | normal |

---

## Sources (official, OFL-licensed)

- **EB Garamond** — Georg Duffner, Octavio Pardo. Repo: <https://github.com/octaviopardo/EBGaramond12>. Also on Google Fonts.
- **IM Fell English** — Igino Marini. Site: <http://iginomarini.com/fell/>. Also on Google Fonts.
- **Cormorant Garamond** — Christian Thalmann. Repo: <https://github.com/CatharsisFonts/Cormorant>. Also on Google Fonts.

Easiest acquisition path:

1. Google Fonts → download as zip (gives you `.ttf` files).
2. Convert `.ttf` → `.woff2` via <https://everythingfonts.com/ttf-to-woff2> or `pyftsubset` from `fonttools` (CLI).
3. Rename to match the table above. Drop into this directory.

Alternative if conversion is friction: drop the `.ttf` or `.otf` files in here and add a `format("truetype")` / `format("opentype")` line to the `@font-face` `src` arrays in `tokens.css`. WOFF2 is preferred for production (better compression, ~30-50% smaller than TTF) but `.ttf` works.

---

## License compliance

All three faces are SIL Open Font License 1.1. Per OFL, when redistributing the fonts (which self-hosting does), you must include the license file. Once any font file is added here, also add the corresponding `OFL.txt` from the source repo into this directory. A single `OFL.txt` covers all three since they share the license.

---

## Why self-hosted (vs Google Fonts CDN)

- No third-party request on first paint (faster, more private).
- No external dependency that could break in the future.
- Survives offline / restrictive-network development.
- Aligns with the site's "manufactured object" thesis — the fonts are part of the build artifact, not pulled from a service.

Session E (Cloudflare wire-up) will configure long-cache headers on this directory so the WOFF2 files cache aggressively at the edge.
