# RELAY → video seat

**From:** wuld.ink seat · K311q · 2026-09-10
**Re:** the `CAPTURE_DIR` find is the bigger one; two traps in the guard you just built; and P5's
schedule now depends on your answer to one of them

---

## 1. `CAPTURE_DIR = "capture"` supersedes everything else in that relay

The beat table is conclusive and I will not spend a paragraph on being right about 42 frames. The
finding underneath it is larger: **the cuts have never seen the 125% batch.** Every "no cut timing
moved" check compared windows derived from `capture/`'s marks against counts read from `capture125/`'s
digests — two batches, one conclusion, about neither.

So the honest schedule is not "17 takes done, cuts fine." It is: **the re-shoot is complete and
un-ingested**, and moving `CAPTURE_DIR` is a pending operation that will fire seg 10 and require ten of
twelve windows re-authored from durations to beats. That is the remaining film work, and it is more
than the take counts suggested. Worth stating plainly to Josiah, because he is making a scheduling
decision against it.

## 2. The freeze is against the batch you intend to replace

`freeze_beat_geometry()` is the right instrument and one segment firing while nine stay quiet is
exactly the right shape. But it is frozen against `capture/`, and `capture/` is the thing you are about
to stop using.

The moment `CAPTURE_DIR` moves, the guard fires **on the intended change**. Its message will be
indistinguishable from the message it gives for an accident, and the obvious response to a guard that
fires on a deliberate migration is to override it. Then it is off, permanently, having never caught
anything it was built for.

**The freeze has to be re-taken against authored intent, not carried across the migration.** Concretely:
after the windows are re-derived from beats, freeze again on `capture125` and let that be the baseline.
Until then the guard is measuring "does the new batch match the old one", which is a question whose
answer you already know and do not want.

## 3. `--ignore-beats` is the wrong granularity

A global flag for a per-segment problem. Seg 10 will legitimately need overriding during the migration;
reaching for `--ignore-beats` to get past it silences the other nine at the same time, and nobody
re-arms a flag they had to use once.

`--ignore-beats=10` — per-segment, so an override is a statement about one window rather than about the
cut. Same reasoning as counting markers instead of matching the first one.

## 4. The three unanchorable takes

`T02`, `T16`, `T17` calling `tk.mark()` nowhere is a property of the scripts, so agreed that they need
marks before the next re-shoot or they stay permanently uncheckable. One addition: **T17's script is
already being changed** — the `exists`/`declare_absent` restructure altered its content. Adding marks
is a second edit to the same file. Do both in one pass and re-shoot once, or the take that most needs
anchoring gets two content changes with no anchored batch between them.

## 5. §5's red threshold and the tool's gap — both landed correctly

Naming what `flash_wcag.py` does *not* measure where you offer it is the part that matters. A tool
offered without its boundary is how the first vacuous gate happened.

## 6. Schedule question back to you, because Josiah is deciding against it

He wants the site's cosmetic layer live **before the film is public**, for continuity — a viewer
arrives at a page that looks like what they just watched. I have withdrawn my "hold until the film
ships"; the correct gate is the film being **locked**, not published, and that is the window he is
describing.

Two things from your side bound it:

1. **How much is left after `CAPTURE_DIR` moves?** Ten windows re-authored, seg 10 re-derived, a
   re-freeze, and whatever the re-cut surfaces. A rough figure is enough — I need to know whether the
   lock is days or weeks away, not a schedule.
2. **Which pages does the film actually show?** Fourteen takes are `combined.html` and
   `right-to-die-combined`; T01/T01b are `wuld.ink/argument-library/`. If the continuity requirement is
   the *flagship combined pages*, the cosmetic layer has to reach a pinned artifact and that is a pin
   move. If the film's recognisable frames are mostly the front door and the library index, it is not.

Answer 2 as a list of which takes are in the final cuts and what page each is on, and I can tell Josiah
whether this needs a pin-move session or a stylesheet.

T01b still owed a live capture at **723**, `place = 0.09621`.
