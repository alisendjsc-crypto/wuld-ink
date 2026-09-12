# P5 — the sound layer: measured spec and a first set

## What the reference actually contains

`Steam Deck All Sound Effects!.mp3` — 152.2 s, segmented into **100 discrete events** by energy
envelope (25 ms windows, 10 ms hops, threshold at peak −32 dB), each measured for spectral centroid,
dominant partial, 85% rolloff and the share of energy above 3 kHz.

**Josiah's instruction — no high-pitched material, ASMR-esque — is a measurable filter.** Applying
*centroid < 1200 Hz* and *under 5% of energy above 3 kHz* keeps **76 of the 100 events** and removes
24. What it removes, quantified: median centroid **1461 Hz** rising to **13,541 Hz**, and up to
**96.1%** of energy above 3 kHz. That is the beep-and-chirp family, and it is gone.

## The design rule hiding in the survivors

Sorting the 76 by duration exposes something the reference is doing consistently:

| role band | n | duration (median) | centroid | dominant |
|---|---|---|---|---|
| very short — hover | 6 | 0.08–0.13 s (0.11) | 818 Hz | 907 Hz |
| short — click | 13 | 0.15–0.29 s (0.18) | 681 Hz | 519 Hz |
| medium — open / close | 28 | 0.31–0.58 s (0.41) | 576 Hz | 527 Hz |
| long — mode change | 23 | 0.63–1.18 s (0.87) | 224 Hz | 175 Hz |
| sustained — ambience | 6 | 1.23–2.71 s (1.29) | 232 Hz | 131 Hz |

**The longer the sound, the lower it sits.** Hover events live near 900 Hz; mode changes live near
175 Hz. That inverse relation is most of why the family coheres rather than sounding like seven
unrelated noises, and it is the single rule worth keeping.

House character of the surviving cluster: centroid p25/median/p75 = **235 / 390 / 805 Hz**, dominant
= **174 / 261 / 624 Hz**, and a median of **0.28%** energy above 3 kHz.

## The first set — synthesized, not sampled

**Deliberately not cut from the reference.** Those are Valve's sounds; shipping them on a public site
is a licensing problem regardless of how short the clip is, and Josiah framed the file as
"reference / inspiration — not a copy" from the start. These are generated from the measured profile
above — low partials plus band-limited noise, soft attacks, exponential decay — so they inherit the
character without carrying the asset.

Verified against their targets:

| file | duration | centroid | dominant | target | >3 kHz |
|---|---|---|---|---|---|
| `wz-hover` | 0.11 s | 1133 Hz | 900 Hz | 907 | **0.00%** |
| `wz-click` | 0.18 s | 716 Hz | 522 Hz | 519 | **0.00%** |
| `wz-expand` | 0.41 s | 633 Hz | 554 Hz | 527 | **0.00%** |
| `wz-collapse` | 0.41 s | 581 Hz | 510 Hz | 527 | **0.00%** |
| `wz-magnifier_in` | 0.52 s | 337 Hz | 263 Hz | 240 | **0.00%** |
| `wz-tier_step` | 0.87 s | 233 Hz | 162 Hz | 175 | **0.00%** |
| `wz-ambience_loop` | 5.25 s | 188 Hz | 118 Hz | 131 | **0.00%** |

Every one lands within ~10% of its target dominant, and all sit at **0.00% above 3 kHz** — tighter to
the brief than the reference cluster's own 0.28% median. `expand` rises in pitch and `collapse` falls,
so the disclosure gesture is audible as direction rather than as two interchangeable taps. The
ambience is a **seamless loop**: its last 0.75 s is crossfaded into its first, so it repeats with no
seam.

Both `.wav` (audition anywhere) and `.ogg` (ship). **Whole set: 50,399 bytes of Vorbis**, ambience
included.

## Constraints for the build, settled in advance

- **No sound before a user gesture.** Autoplay policy blocks it; the first click unlocks the
  AudioContext. The ambience therefore cannot start on load — it starts on first interaction.
- **Sound belongs to the vfx tier.** Silent at `cosmetic` and `off`, like everything else.
- **Muted under `prefers-reduced-motion`.** Someone who suppressed motion did not ask for whooshes.
- **Its own mute**, persisted beside `wz-tier`, because audio is a stronger imposition than a glow
  and the power button is too coarse a control for it.
- **One decoded buffer per sample, pooled.** No per-hover fetch or decode.
- **Hover needs a floor.** At 0.11 s a fast pointer crossing a list of 82 objection cards would
  machine-gun; rate-limit to ~1 per 120 ms and drop rather than queue.
