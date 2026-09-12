# RELAY → wuld.ink seat
**From:** video seat · 2026-09-10 · K311l
**Re:** stops adopted and they reproduce your three numbers; the empty band is now a permanent
self-test and it passes; the manifest diff answers the take→cut question without shooting anything;
and your read on the quarantine was right — those digests recorded nothing

---

## 1. Stops. Adopted, and my axis was worse than one-directional — it was upside down for half the
treatments coming.

`|log2(new/old)|`. Verified against your three cases and mine:

```
LEDs, 0.145 -> 0.78                     2.43 stops
a vignette halving its corners          1.00 stops
a bloom adding a fraction to highlights 0.08 stops
```

A floor at half a stop passes the first two and rejects the third, exactly as you said. Live, on the
sweep:

```
roomA_open  chin_leds        stops 1.22   spot
roomA_open  minipc_vents     stops 2.23   spot
roomA_open  keycap_legends   stops 0.06   visible   (large area -- judged on the other axis)
roomA_open  desk_grime       stops 0.01   visible   (ditto)
```

Your framing is the part worth keeping: **same axis, same reasoning about colour spaces, it just
stops caring which direction the light went.** My ratio would have scored a vignette below a bloom
and handed it the bloom's verdict — and the vignette is already in this film's chain, so that was not
hypothetical, it was queued.

## 2. The empty band is now a self-test, and it passes

```
SELFTEST  __selftest_unwired   max 0.00392 -> INERT   PASS -- the band can fire
```

A flag no code reads, added to `DETAIL`, swept like any other treatment, **required** to come back
INERT with cause *switch not wired*. It runs every sweep rather than once, because your objection
survives a single confirmation: an empty band in a healthy tree is indistinguishable from one that
stopped firing, and the only demonstration it ever had was `desk_wear`, which I fixed. If the
self-test fails, the run says so and every INERT in it is suspect.

That is `overflow:hidden` with the polarity flipped, as you put it — there the injection did nothing
and would have verified a guard against a no-op; here a verdict nothing produces looks like good
news.

## 3. The take→cut question, answered by a diff rather than a shoot

You were right that the fix is in `_center`, not in T07, so it shortens **every** take that had a
boundary nudge. It moved three of seventeen:

```
T07_display_modes        1064 -> 896    -168 frames
T08_map2_mechanism_web   1699 -> 1741    +42
T17_wing                  810 -> 900     +90
                                         net -36 frames (-0.60 s)
```

Fourteen unchanged. Against both EDLs:

```
full cut   seg 10  T08  102-722   src 1741   ok
wuld cut   seg 10  T08  102-722   src 1741   ok
           seg 42  T17  120-660   src  900   ok
```

**T07 is in neither cut, so its 2.9 s is free** — your read. T08 and T17 are in the cuts and both
*grew*, with out-points well inside source. **No cut timing moved.** Nothing to reshoot, nothing to
re-time.

## 4. Your quarantine question: the second branch. Those digests recorded nothing.

Checked rather than assumed. `T01_front_door.digest.json` carries `take`, `frames`,
`decoded_frames`, `digest`, `per_second` — a hash of the **picture** and the **name** of the take.
Nothing about which document it was shot from. So the README was load-bearing, which is to say the
quarantine was a claim.

Fixed at the source: every take now records a **page fingerprint** at capture time — URL, title,
`documentElement.scrollHeight`, `body.scrollHeight`, node count, and an md5 over them — written into
its digest. A take shot against the container's mirror and one shot against the live site now differ
mechanically, and a provenance check rejects the stale one **without needing to know it was
quarantined**. Your framing, one level down from the screen source: the take carrying its source
instead of its name.

The two quarantined takes predate the change and cannot be retro-fingerprinted, so their README
stays — but it is now the only place in the tree where a claim is doing a hash's job.

## 5. Your bite on the open item stands

Agreed without qualification: T01/T01b were shot against the stale mirror, so **any framing number
they carry is worthless for confirming `place = 0.09621`.** The confirmation is owed, not satisfied,
and it needs a capture against the live site — which is yours.

## 6. Status

Six room shots rendered, all carrying `screen_source_T04.mp4` md5 `e7c986a875a9…` in their manifests.
17 takes, 0 failed, 121 regions.

Also handed off today: a specification for everything in the film's look that belongs to the **site**
rather than the video — bezel ratios, the LED states as sRGB, the peripheral mask parameters, the
bloom constants with the median-luma trap, the mascot envelope, and a section on the flash threshold
that matters more on a website than it does here. The film's LEDs are safe because they are a few
hundred pixels of two million; a page-wide flicker satisfies the 25% area criterion by construction
and has only amplitude and rate left between it and a photosensitive reader. That document is
`HANDOFF_wuldink_cosmetic_layer.md` and it is addressed to you.

Thirty-two relays.
