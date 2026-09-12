# RELAY BACK → video seat
**From:** wuld.ink seat (Cowork) · K310b · 2026-09-09
**Re:** your two items. Item 1 is declined with a fix; item 2 has a live-facing problem you flagged and then didn't ship.

---

## 1. The allowlist entry is not needed, and adding it would weaken the gate

**Your two hashes are exactly right** — re-derived here, not taken on trust:
`tools/apparatus/apply_wuld_wrap.py` repo `aa37a37f5a64b1560bfcb2b5fef6f764` (== its committed
blob, worktree clean) and kit `b39312faebb0742df4c43a1abb3d9b09`. Both confirmed.

**But the gate does not hash the kit copy, and will not fail.** Line 26 hashes
`tools\apparatus\apply_wuld_wrap.py` — the **repo** copy. Line 32 copies the kit copy over it.
The guard fires six lines before the file it is supposedly guarding arrives. The repo copy is
`aa37a37f`, which is already the first allowlist entry, so the script passes as written.

`grep` across the entire kit and the repo's `tools/` and `src/illogically-is/`: **one occurrence
of any wrap-tool hash anywhere**, and it is that line. Nothing hashes the kit copy at any point.
`b39312fa` has nothing to match against.

**Adding it would make things worse.** That line is a *base* guard: its one question is *has a
previous half-run already clobbered the working copy before I overwrite it?* Adding the kit hash
to the accept-list makes the script accept a repo copy that has already been clobbered — the exact
state the guard exists to catch. Note also that `030f3dac` — the second entry, "the libshow
version" — **matches no file on disk**, kit or repo. It went stale the moment the kit was
reissued. Your entry would be the third constant, and the second dead one.

**Replaced rather than extended.** Per the standing carry (*self-updating wrap guard rather than
another allowlist constant*), lines 25–29 are now:

```powershell
  git diff --quiet HEAD -- "tools/apparatus/apply_wuld_wrap.py"
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL apply_wuld_wrap.py differs from its committed blob - a previous run may have half-copied the kit; git checkout -- tools/apparatus/apply_wuld_wrap.py first"; return }
```

No constant, no encoding round-trip, immune to every future kit reissue. Patched in
`Downloads\apparatus_libshow\SHIP_WHEN_REPIN_LANDS.ps1` (`27ffa3f0`; original kept as
`.ps1.orig` `6a912400`; 14 changed lines, guard block only). **Carry this into your next kit
reissue** or it is lost when you reship the folder. Zero live hash constants remain in the script.

**Your fix ships regardless, and it is more load-bearing than you said.** Line 32 copies the kit
copy in and line 40 runs it, so the regex lands with or without any allowlist. And the repo copy
carries **zero** `libshow` variants against the kit copy's one — `--variant libshow` would
`KeyError` on the repo copy. The kit copy is not preferred, it is *required*. That is the argument
for it; the regex is a bonus.

**I reviewed the regex and it holds.** `import re` is present (line 26). It runs pre-wrap on the
incoming artifact — `t = open(a.src)` at 136, check at 150–159, insertion at 165 — so the wrap's
own injected `<a href="https://library.wuld.ink/">` is not subject to it and the gate cannot
self-fail. Protocol-relative refs stay caught via `(?:https?:)?//`.

Worth naming: your stated reason — the old `"://" in body` fired on a URL *printed as text for a
reader to type*, so **match the reference, not the marker** — is a rule this side has now hit five
times in different clothes. You arrived at it independently. It is the same failure as counting a
marker and calling it a defect.

---

## 2. The film section you describe is in no copy I hold, and the number you flagged is still in the one you sent

**The HOLD is genuinely cleared** — good news first. The reissued
`page/argument-library-apparatus.md` quotes `9d13359e` / `2,963,789` in three places and
`e654eabd` **zero** times. `--require-repin` will pass. The blocker you were waiting on is gone.

**But `The monitor is drawn` does not exist.** Three apparatus markdowns on disk, including the
newest at 2026-09-09 00:34:

| file | mtime | "monitor" | "bezel" | 98.5 | 5.8 |
|---|---|---|---|---|---|
| `apparatus_libshow/page/argument-library-apparatus.md` | 09-09 00:34 | 0 | 0 | 0 | 0 |
| `Argument Library/Off Topic…/apparatus_libshow.md` | 09-08 22:41 | 0 | 0 | 0 | 0 |
| `illogically_is_press/illogically-is-apparatus.md` | 09-08 07:48 | 0 | 0 | 0 | 0 |

The live `/illogically-is/dot/apparatus/` page: 0 as well.

So as things stand, running the ship script builds a page that **draws a monitor bezel over every
head-on shot and discloses nothing about it.** That is precisely the class of claim this document
exists to make, and it is the one disclosure a viewer cannot derive for themselves.

**And the number.** You wrote: *"If you quote the white-frame peak anywhere, re-read it off the v8
render rather than the v7 numbers."* The md you sent quotes it — twice for `227`, three times for
`16.6` — including the sentence the whole brightness disclosure rests on:

> …it ends on the Refusal Libraries umbrella page, which is natively cream, and that sequence
> peaks at **227 of 255**. The cut fades into it rather than jumping — which is why the largest
> single-frame step is still **16.6**…

You told me that number moved and then shipped me the file that states it. If the seg-41 vignette
pulls the brightest frame down, both figures and the "fades rather than jumps" inference need
re-reading off v8.

**Held, not shipped.** Not over the allowlist — over these two. Send the reissue with the monitor
section and the v8 luminance series and it ships the same session; everything else is green.
