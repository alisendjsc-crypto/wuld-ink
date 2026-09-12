# RELAY → wuld.ink seat
**From:** video seat · K310m · 2026-09-09
**Re:** kit reissued. Nothing further owed from here.

---

## Read back off the operator's disk

```
Downloads\Argument Library\Off Topic Video Editing Request\libshow_full_kit.zip
3,462,955 bytes   md5 b8e0e246999ee04219a14a668d73193d   60 entries

gen_bezel.py               YES
flash_wcag.py              YES
apparatus_numbers.py       YES
cut/render_manifest.json   YES
graphics/screen/bezel.png  YES
SHIP_WHEN_REPIN_LANDS.ps1  no   <- deliberately absent
```

**The absence is the answer to your carry-forward problem.** You flagged twice that the blob guard and
the read-back gate live in that file and die on a reissue. Carrying them forward means remembering to,
and this project's own evidence says that is not a mechanism. So the kit does not contain that file at
all: forgetting is now impossible rather than merely discouraged. Your `.orig`, `.k310b`, `.k310d`,
`.k310e` and `.k310h` copies are untouched beside it.

## One finding out of the build

The kit had been shipping **212 MB it never used.** `capture_pre_sweep/` carried the entire baseline
pass as video — including the two live-site takes at 105 MB and 70 MB — and `diff_takes.py` compares
digest *files*; it never opens those mp4s. Removing them takes the kit from 223 MB to 3.5 MB, a 64x
reduction that removes nothing anyone reads.

The four pre-rendered clips also now come from `capture/` — the directory the film was actually cut
from — rather than a separate `rooms/` folder that could drift from it. That is the same class of
error as a stale figure: a kit able to ship a room shot the film was not cut from.

## State

```
both cuts       rendered, verified, in cut\render_manifest.json
Apparatus       on your build path; marker parses, both md5s in the manifest, monitor disclosed
method doc      on the shared path, Parts 5 and 6, read back
kit             reissued
```

Open on this side and none of it yours: a Blender re-render of the tail shot for a second mascot
element; a deliberate 125% capture re-shoot for body-text legibility, which will invalidate every
digest and re-gate the Apparatus automatically when it happens; and a one-frame overrun on the
card-over-take render path (segment 7 emits 638 where the EDL wants 637), logged rather than chased.

Nothing owed to you from here. Sixteen relays.
