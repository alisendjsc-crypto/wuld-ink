# print-pipeline — gallery plates → Printful posters (K97)

Batch workflow for turning featured gallery plates into purchasable posters.
Cowork emits the batch JSON; the operator runs pull → Upscayl → verify →
product creation; product URLs come back to Cowork for the `print_url`
manifest pass (renderer shipped dormant at K96 — links go live on the next
Pages deploy, no component change).

## The two locks (ride every step)

1. **Tier gate** — T1 (SFW) and T2 (artistic nudity) plates ONLY to Printful.
   T3 (explicit) NEVER — unsellable on every checkout-bearing platform
   screened at K96; Printful's "obscene" discretion applies. Hard gore T4 =
   treat as T3; mild dark T4 = case-by-case. A T3/T4 plate can still be
   `featured` on-site — it just never gets a `print_url`.
2. **K83 payment lock** — Quick Store payouts go to BANK via Stripe ONLY.
   No PayPal anywhere in this rail (the shared PayPal/R2 billing identity
   must never couple to the print storefront).

Reference: `docs/print-storefront-research.md` (verdict table + vendor screens).

## One-time setup (operator)

- Python 3.8+ (already present for `tools/wuld-gui`).
- Optional but recommended: `pip install pillow` — enables dimension checks.
- Upscayl installed (GUI batch-folder mode is all we use — no CLI wrapper).

## Workflow

1. **Batch JSON** — Cowork emits `D:\print-batch-NN.json` from the curated
   picks (schema below). Non-image plates are auto-skipped.
2. **Pull sources** — `python tools\print-pipeline\stage_batch.py pull D:\print-batch-01.json`
   → resolves each plate's BEST source into `D:\print-staging\batch-01\in\`
   as `<id>.<ext>`: **originals first** (content-hash stem match under
   `C:\Users\y_m_a\Downloads\AI Images and Videos` — the pre-shrink files,
   2048²–4096² JPG; override with `--local-src`, skip with `--r2-only`),
   public R2 site copy as fallback (covers editorial + the few unmatched).
   Idempotent; re-run to resume. Report tags each plate ORIG / R2 / HAVE.
3. **Upscayl** (GUI): input folder `in\`, output folder `out\`, scale **4×**,
   output format **PNG**. Model: try "General Photo (Real-ESRGAN)" vs
   "Digital Art" on ONE plate first and pick by eye — AI-generated plates
   sometimes prefer one over the other. Upscayl appends a suffix to output
   names (`_upscayl_4x_<model>`): **do not rename** — verify matches by prefix.
4. **Verify** — `python tools\print-pipeline\stage_batch.py verify D:\print-batch-01.json`
   → count / naming / dimensions / scale per plate + max print size at
   300/200/150 DPI. Fix anything flagged before product creation.
5. **Products** (Quick Store runway below). 6. **URLs back to Cowork.**

## Batch JSON schema

```json
{ "batch": "batch-01", "date": "2026-06-09",
  "media_base": "https://audio.wuld.ink",
  "plates": [ { "id": "plate-07-ophelia-without-the-river",
                "r2key": "gallery/editorial/….webp",
                "url": "https://audio.wuld.ink/gallery/editorial/….webp",
                "num": "VII", "title": "Ophelia, Without the River",
                "tier": "T1", "kind": "image", "notes": "" } ] }
```

## Print math (catalog verified 2026-06-09 via Printful API)

- **Premium Luster Photo Paper Poster** (catalog id 171): 30 sizes.
  Squares: 10×10 · 12×12 · 14×14 · 16×16 · 18×18 · 20×20 · 24×24 (in).
  Rectangles up to 24×36. Base prices (USD): 10×10 $10.20 · 12×12 $11.22 ·
  14×14 $12.24 · 16×16 $13.77 · 18×18 $15.30 · 20×20 $16.02 · 24×24 $17.42 ·
  12×18 $13.52 · 18×24 $16.32 · 24×36 $22.44.
- **Enhanced Matte Paper Poster** (id 1): 33 sizes; squares to 28×28,
  rectangles to 30×40; slightly cheaper base.
- **Square plates** (MC + small rooms): square sizes exist natively →
  NO padding/crop. **Editorial plates are portrait 1792×2400 ≈ 3:4** →
  map to the 12×16 / 18×24 / 24×32 line (aspect slip ~0.4%, inside
  bleed tolerance).
- Resolution (sources vary 2048²–4096²; editorial 1792×2400): Upscayl ×4
  universally — 2048² → 8192² (**341 DPI at 24×24**); 1792×2400 → 7168×9600
  (**300 DPI at 24×32**); 4096² → 16384² (overkill but harmless — if a PNG
  exceeds ~100 MB, re-run that plate at ×2 = 8192², same print ceiling).
  `verify` gates on long edge ≥ 8000 px (`--min-edge`) and prints
  per-plate DPI ceilings; a WARN means cap that plate's product sizes.

## Quick Store runway (operator-side, guided first pass)

1. Printful dashboard → Stores → **Launch Quick Store**. Suggested handle:
   **`wuld-ink`** (→ wuld-ink.printful.me or similar — copy the real URL).
2. Payouts: Settings → payout method → **BANK account via Stripe**. Confirm
   NO PayPal option is selected anywhere (K83).
3. First 1–2 products together with Cowork to fix the pattern:
   - Naming: **`Plate NNN — <Title>`** (e.g. `Plate VII — Ophelia, Without
     the River`). Roman numerals for editorial, arabic for rooms.
   - Description: the plate `body` text where it exists; else the
     `technique` line. Append: "Open edition. Printed on premium luster
     photo paper." Nothing biographical.
   - Sizes: offer 3 (small/mid/large) — squares: 12×12 / 18×18 / 24×24;
     editorial 3:4 portraits: 12×16 / 18×24 / 24×32. Fewer choices,
     cleaner page.
   - Pricing: operator's margin call; typical art-poster markup 2.5–4×
     base → 12×12 ≈ $28–45 · 18×18 ≈ $38–61 · 24×24 ≈ $44–70.
4. Copy each product URL → paste in Cowork chat → `print_url` manifest pass
   (atomic, validated; the K96 renderer does the rest on deploy).
5. Tier reminder per upload: T1/T2 only. When in doubt, hold the plate.

## Failure notes

- `pull` FAIL on a plate → transient R2/network: re-run (idempotent).
- `verify` "no out file" → Upscayl skipped/errored that image: re-run it
  for the singleton, same output folder.
- Pillow absent → dims unchecked (count+naming only); install when convenient.
