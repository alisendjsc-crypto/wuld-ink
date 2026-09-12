# HANDOFF → WULD INK seat
## The cosmetic layer for library.wuld.ink — everything from the showcase film that belongs to the site

**From:** video seat · 2026-09-10
**Status:** specification and measured constants. Most of it has been *shot*, which is why most of
the numbers are measurements rather than proposals — but **not all of it**. Two of
§2's three LED states were never rendered, and §4's peripheral softening is in no segment of the film
that shipped: the filter exists in the pipeline and no cut uses it. Treat those two as proposals.

---

## 0. The quality target, in Josiah's words

> *"probably enough so that it's roughly the same as the video. It doesn't need to be absolutely
> immaculate."*

Read that before anything below, because it decides how much of the rest to build. The brief is **get
the recognition and stop**, not port the film's look. Ten items chasing immaculate is the wrong shape
for it.

**The wuld.ink seat has scoped it to four**, and the scoping is endorsed here:

```
the bezel, chin and W.U.L.D. wordmark with LED periods    the visual signature; static CSS
the text glow                                             second most recognisable
the power button as the cosmetics toggle                  what makes the layer legitimate
the mascot fading in and out                              what makes it feel alive
```

Peripheral softening, mouse parallax and sound are **deferred**: they deliver continuity with a
*camera move* that a page does not have, and they carry most of §5's exposure. The scoped set is also
the set with **no page-wide periodic luminance change**, which is the only category below that can
hurt a reader — that is luck rather than compromise, and worth knowing.

**They do not port the same way.** The bezel ratios (§1) and the LED colours (§2) are transferable
constants; the power button (§3) ports as a *behaviour* and needs no number at all. The mascot's envelope (§7) is a *shape*, because the film's timing is a
fraction of a shot and a page does not end. The bloom (§6) is a *method with a calibration step*: its
85/255 threshold was chosen against the film's median luma of ~15, and a threshold above the content
it means to bloom touches nothing — which is exactly how it shipped: inert through every render of this film that carried the old value. Re-derive it
against the site's own median, do not copy the number.

---

## 0b. What this is, and why it is being handed over rather than built

The showcase film puts the library on a monitor in a dark room: a bezel with a lit wordmark and
status LEDs, phosphor bloom on the text, a soft peripheral falloff, a mascot who ghosts in and out,
and a continuous room tone underneath. Josiah's note on it:

> *adopt the style, because I actually really like how alive it feels in the video, with the bezel,
> with the simulated PC, with Grey / Yūrei appearing occasionally in and out, the text bloom, monitor
> CRT / LED glow effect, sfx* — with a **toggle** so readers who prefer unadorned artifice can have
> it.

Everything below is that list. **None of it is video work** — the film already has its own
implementations and they are not portable (ffmpeg filter graphs and Blender materials). What ports is
the *parameters*, and more importantly the *traps*, because most of these effects have already failed
once in a way that was invisible until someone measured.

Read §5 before writing any code. It is the only part that can hurt a reader.

---

## 1. The monitor frame

The film's bezel is asymmetric on purpose: a thin lip on three sides and a deeper chin at the bottom
carrying the wordmark. It reads as *sitting at a monitor*, not as a picture frame around a picture.

**As ratios of the content opening.** The film's frame is 1920 × 1080 with an 1892 × 1018 opening;
the lip is **14 px on all four sides** and the chin adds a further **34 px** below it, so the band
under the picture is **48 px** and the four numbers close: 14 + 1018 + 48 = 1080.

```
side lip     0.740 %  of opening width
top lip      1.375 %  of opening height
bottom band  4.715 %  of opening height   (lip 14 + chin 34)
```

On a 1440-px-wide reading column that is a **10.7 px** side lip; on a 900-px-tall viewport a **12.4 px**
top and a **42.4 px** bottom band. Small — the film tried a heavier frame first and it read as a
picture frame; the whole effect is *only just* in shot.

*(An earlier draft of this section gave the top lip as 20 px / 1.965% and the chin as 34 px / 3.340%.
The 20 is `BEZEL_CROP_TOP` — picture rows discarded off the top of the scaled footage, not a bezel
dimension — and the 34 is the chin's own depth, not the whole band. Those three numbers did not sum
to the frame: 20 + 1018 + 34 = 1072. These do.)*

**Colours** (the film's, linear → sRGB): bezel body `#0F0F11`-ish, inner lip `#191A1C`-ish. The lip is
the bright edge where the panel meets the frame and it is what sells the join — if you build the
frame with a single flat colour it reads as a border, not a bezel.

**Chin furniture**, left to right: speaker perforation, the wordmark `W.U.L.D.` with **the periods
replaced by LEDs**, more perforation, and a power button at the far right.

## 2. The LEDs and their states

The periods in `W.U.L.D.` are the status lights. Four of them.

```
state      sRGB       meaning
idle       #FF8195    dim pinkish red -- the resting state (in the film, the ONLY state; see 2a)
loading    #FFB345    orange, while a view is being built
loaded     #7CFFA0    green, brief -- a punctuation, not a state
```

**Green is the only green on the site.** That is the argument *for* it: it reads as the machine
speaking rather than as a design element. Keep it under ~250 ms and low-saturation, or it pulls
harder than the content.

Relative brightness **in the set** is idle 1.6 / loading 6.0 / loaded 9.0 — i.e. **loaded is ~5.6× idle**
as an input. Only `idle` was ever rendered, and the render compresses that ratio; see §2a.
On a page that is a `box-shadow` spread and an opacity, not a colour change.

**Debounce the LED to the state's meaning, not to the event.** A live filter that fires a fetch per
keystroke drives the LEDs at typing speed — 4-6 Hz — and every individual transition is "required by
the state", which is exactly the justification a naive rule accepts. One `loading` for a burst of
keystrokes, one `loaded` when the burst settles. Four LEDs are too small an area to trip §5, so this
is craft rather than safety — but it is the difference between a machine thinking and a machine
twitching.

## 2a. CORRECTION -- what the film actually shows, measured

*Added after ship. Everything in §2 above was written from the set's source values. This section is
written from the file that shipped, `libshow_full_v3.mp4`, and from the composited chin that is in it,
`graphics/screen/bezel.png`. Where they disagree, this section is the film and §2 is the intent.*

**The film renders exactly one LED state.** `set_led_state()` and `led_sequence()` exist in
`build_room.py` and are **never called by `render_shots.py`** -- every frame carries
`LED_DEFAULT = "idle"`. `loading` and `loaded` are specified and have never been photographed. So the
sentence "relative brightness **in the film** is idle 1.6 / loading 6.0 / loaded 9.0" should read
*in the set*: those are emission strengths in the material, and two of the three describe frames that
do not exist. **Retract "in the film" from that line.** The 5.6x is a ratio of inputs.

**The idle LED as delivered is not `#FF8195`.** Peak pixel of each of the four periods in the
shipped chin:

```
                    sRGB (peak)      linear            Y        sat span
LED period          (221, 170, 177)  .723 .402 .440    0.473    51
spec  #FF8195       (255, 129, 149)  1.00 .220 .301    0.391    126
```

Right hue, **less than half the saturation**, and *brighter* than the spec colour rather than dimmer.
Normalised to red, the rendered LED's linear channels are (1.00, **0.556**, **0.608**) where the
material's colour is (1.00, 0.220, 0.300) -- green is 2.5x and blue 2.0x their specified share. The
emitter is clipping and desaturating toward white. (Bloom on a small bright source would do this too;
the measurement is the observation, the mechanism is a separate claim and is not established here.)

**The compression has a demonstrated dynamic range**, which is what makes it a measurement rather
than an anecdote. Three chin elements share the idle colour at three emission strengths, so the
render's response can be read off directly:

```
pair                       emission ratio      rendered luminance ratio
LED / wordmark letter      1.6 / 0.55 = 2.91x  2.28x
LED / speaker grill        1.6 / 0.16 = 10.0x  6.02x
```

Both fit `rendered = emitted ** 0.777` to within **0.6%**; at 0.775 the second pair misses by 1.1%. Two independent pairs agreeing on the exponent
is the evidence; one pair would have been a coincidence. **Consequence for §2:** if `loading` and
`loaded` were ever rendered, the specified 5.6x idle-to-loaded step would arrive on screen as about
**3.8x**, not 5.6x.

**The letters do not "stay printed."** `chin_mark_mat` is emissive at 0.55 and the grills at 0.16,
both in the idle LED's colour -- so wordmark, perforation and LEDs are **one hue at three
brightnesses**, and the site should know it is copying a near-monochrome chin rather than a grey chin
with coloured lights in it. The power ring is the exception and the only other emitter on the chin:
`power_ring_mat` is (1.00, 0.30, 0.24) at strength 1.1 -- warmer and more orange than the LEDs' (1.00,
0.22, 0.30). It is the one element that does *not* port from the LED colour.

**Two figures elsewhere in this document, checked:**

- §5 says the LEDs are "a few hundred pixels of two million." **Correct** -- measured, four periods
  are **308 px**, 0.0149% of the frame. The area argument holds with room to spare.
- **§11's axis list has been corrected in place.** It said "forty-one pixels" and "LEDs at 4.4x are
  2.14 [stops]." Both were wrong: the area is **308 px** (7.5x the stated figure), and the LED's peak
  against the chin panel it sits in (sRGB 30,30,30) is **36.3x = 5.18 stops**. **This does not weaken
  the argument that paragraph makes** -- it strengthens it: the half-stop threshold separates 5.18
  from a vignette's 1.00 and a bloom's 0.08 more cleanly than 2.14 did. Read §11 as it now stands;
  this note records what changed.

**Recommendation for the site: use the spec hex, not an eyedropper on the film.** The temptation
after seeing the numbers above is to sample a frame and match it. Don't. The film's chin is a render
through a tonemap and the browser is not; and more to the point, the site has **three** states where
the film has one, so matching a still of the single state the site leaves after ~250 ms anchors the
palette to the least interesting of the three. Build `#FF8195 / #FFB345 / #7CFFA0` as specified, and
if the film's softer look is wanted, get it with a `box-shadow` bloom rather than by desaturating the
source colour. Which of clipping or bloom produced the film's desaturation is not settled above and
is not settled here -- but either way it is an artifact of *rendering an emitter*, and a `box-shadow`
is the browser's nearest equivalent of the same cause.

## 3. The power button *is* the cosmetics toggle

Josiah's idea and it is the best structural thing in this handoff: **the switch on the chin turns the
cosmetic layer off.** One object, two places — the film models a machine whose power button does
something, and the site is the machine.

Consequences worth designing for:

- The toggle must be reachable when the layer is **off**, so the button cannot be part of the layer it
  controls. Either the chin persists at reduced fidelity when cosmetics are off, or the control has a
  plain-DOM twin.
- It should be a real `<button>` with an accessible name, not a decorative div — it is a settings
  control that happens to look like hardware.
- Its state belongs in `localStorage` **and** in whatever the admin settings panel exposes, so the
  first-visit prompt and the button do not disagree.

## 4. Peripheral softening and parallax

Two separate effects that read as one.

**Peripheral softening** — the frame's outer region goes slightly soft, as foveal vision does. The
film's mask: radial ramp, softening begins at **normalised radius 0.52**, falloff **power 1.7**,
blur sigma 5 px at 1920 × 1080. Measured effect on a real frame (local gradient magnitude retained):

```
centre      100.0 %      untouched
mid-edge     95.2 %
corner       54.3 %
```

On the web this is a `backdrop-filter: blur()` behind a radial-gradient mask, or a duplicated layer
with `mask-image: radial-gradient(...)`. **It must not touch text the reader is reading.** 0.52 was
chosen so the whole reading column stays sharp; if the site's column is wider relative to viewport,
raise it.

**Mouse parallax** — Josiah's note: *moving mouse to edges of screen slightly pivots view, but not
completely off the page itself.* A few degrees of `rotate3d` / a few px of translate on the page
container, eased, with a hard clamp. The clamp is the whole design: the effect is immersive at 2°
and nauseating at 8°.

Both effects are **motion** and both belong behind `prefers-reduced-motion` — see §5.

## 5. The one section that can hurt someone

Everything above is decoration. This is not.

**WCAG 2.3.1 / the ITC general flash threshold**: a pair of opposing changes in relative luminance of
**10% or more of maximum**, where the darker state is below **0.80**, over **more than 25% of the
displayed screen area**, more than **three times per second**.

The film's LEDs cannot trip this and the reason is *area*: four LEDs are a few hundred pixels of two
million (measured: 308 px, 0.0149% of the frame -- see §2a). **A site-wide effect has no such protection.** A CRT flicker, a bloom pulse, a scanline
sweep or a page-wide colour shift covers 100% of the viewport by construction, so the area criterion
is satisfied automatically and only amplitude and rate stand between the effect and a reader with
photosensitive epilepsy.

**A second gate is also automatic on this palette.** The criterion requires the *darker* state to be
below relative luminance **0.80**, and everything on this site is — the page ground sits at L ≈ 0.004.
So **two of the four gates are satisfied by construction** and only amplitude and rate stand between a
page-wide effect and a photosensitive reader.

**And the amplitude gate is far more generous here than it sounds** — this is the good news, and an
earlier draft of this document had it exactly backwards. Relative luminance is normalised with
1.0 = peak white, so 0.10 is a tenth *of white*, not a tenth of the content. Because gamma compresses
the dark end, that swing is enormous in code values on a dark palette:

```
page ground   #0E0E10     sRGB 0.055    L 0.0044
L + 0.10                  L 0.1044      sRGB 0.356    = #5B5B5B
```

The legal limit takes you from near-black to **mid-grey**. A dark site therefore has *far more*
perceptual room under the threshold than a light one, not less. So the advice is **you have room, use
a fraction of it** — a glow pulse can be plainly visible and still sit an order of magnitude under
the criterion.

Concretely, for anything that modulates the whole page:

- **Amplitude**: keep any periodic swing well under a 0.10 change in relative luminance — which on
  this palette means well under the near-black→mid-grey excursion above. There is no reason to go
  anywhere near it.
- **Rate**: nothing periodic above 3 Hz, ever, at any amplitude that could compound.
- **Respect `prefers-reduced-motion: reduce` as a hard off** for parallax, flicker, pulsing, zoom and
  any large translation. This is not the same switch as the cosmetics toggle and must not be routed
  through it: a reader who has set the OS preference has already answered, and the first-visit prompt
  must not ask them again or override them.
- **A cross-fade is not what that preference is for.** It targets vestibular triggers — parallax,
  zoom, scroll-jacking, large translation. A fade is what the guidance recommends you *substitute*
  for motion, so gating an opacity envelope on it is backwards and costs the thing that makes the
  page feel alive. The line falls between **vestibular** and **opacity**, not between motion and
  stillness.
- **Do not animate the LEDs faster than the states require.** `loading → loaded` is one transition,
  not a pulse train.

**There is a second threshold, and everything above is only the first.** WCAG 2.3.1 defines a *general*
flash threshold — the one specified above — **and a red flash threshold**: any pair of opposing
transitions involving a **saturated red**, which applies on its own terms and carries **no 10%
luminance allowance**, because saturated red is a photosensitivity trigger independently of how much
the luminance changed.

Today's palette is clear of it: `#FF8195` is a desaturated pink, `#FFB345` is orange, and the LEDs are
area-exempt at a few hundred pixels either way. **But §12.5 proposes Morse flashing on those LEDs**,
and the headroom argument above buys nothing against the red threshold. If the LEDs ever grow past the
area floor — a heavier chin, a scaled bezel, a mobile layout where the chin is proportionally huge —
reddish flashing is governed by the red threshold, not the general one. Design against both.

I can supply `flash_wcag.py`, which measures a rendered video against the **general** criterion
per-pixel on linear light. **It does not implement the red flash threshold.** It does not run on a
live page either, but a screen recording of the page is a video.

**The trap, from the film**: the film's first flash gate could not fail. Its threshold was fixed at
40 of 255 while that cut's entire field-luminance range was **38.2** — so `range < threshold`, no
input could produce a step big enough to trip it, and the check ran, passed, and verified nothing.
(The film that shipped has a range of 62.6 against the same 40, ratio **1.56**, so the gate is live
there — barely. Compute that ratio before you trust the pass.) If you build a check for this, verify that it can *fail* before you trust that it *passes*.

## 6. Bloom, and the trap that comes with it

Phosphor glow on the text. The film's: threshold **85/255**, gaussian sigma **10**, gain **×3.2**,
screen-blend opacity **0.42**, on the **luma plane only**.

Two hard-won details:

- **Luma only.** Screening all three channels lifts chroma at 128 toward 191, which comes out
  magenta. That is not an aesthetic choice, it is the bug you get for blending RGB.
- **The threshold was 175 and the effect was completely inert through every render of this film that carried it**, because these
  pages have a median luma around 15. A bloom thresholded above the content it is meant to bloom
  touches nothing. It shipped that way and nobody noticed until it was measured.

On the web: a duplicated text layer, `filter: blur()`, `mix-blend-mode: screen`, low opacity. Gate it
off the LEGIBLE and HIGH-CONTRAST display modes — see §8.

## 7. The mascot

Mr Grey / Yūrei appearing occasionally. The film's envelope, as fractions of a shot:

```
fade in    0.12 -> 0.28 of the shot
hold       0.28 -> 0.74
fade out   0.74 -> 0.92
easing     sine, ease-in-out
```

The principle transfers even though the timeline does not: **a mascot who is simply present is set
dressing, and one who pops in is a glitch.** A slow arrival and a slower departure is the entire
effect. On a page the equivalent unit is dwell time on a view, not shot length.

Frame sequences exist at `D:\Mascot Yurei\mr_grey\frames_v3\` — `idle` (192), `long_idle` (192),
`breeze` (192), `speak` (144), `listen` (96), `dismiss` (96), `appear` (60), `regard` (72),
`wrong_hour` (96), `deflect` (60). They carry their own alpha.

**A trap already hit**: in the film this apparition was configured, keyframed, rendered without error,
and **invisible**, because the camera it was configured for did not have him in frame. On a site the
equivalent is an element that animates inside a container with `overflow: hidden`, or behind another
layer, or at a z-index below the content. See §9.

## 8. Sound

The film runs a continuous room tone under everything at a measured gain, plus mechanical whirring
(bearing whine, case resonance, an intermittent drive tick) well under the bed.

**On a website, audio is different in kind from every other item here.** Autoplaying sound is blocked
by browsers, hostile on shared machines, and the single most likely thing to make a reader close the
tab. My position: **ship the sound layer off by default even when cosmetics are on**, as its own
control, and never as part of the first-visit prompt.

## 9. Interaction with the existing display modes

The site already has `STANDARD` / `LEGIBLE` / `HIGH-CONTRAST` / `BOTH`. These are accessibility
modes, and the cosmetic layer must lose to them:

- **HIGH-CONTRAST**: bloom off, peripheral softening off, parallax off. The bezel may stay as static
  chrome; nothing that reduces contrast survives.
- **LEGIBLE**: bloom off (it thickens glyph edges, which is the opposite of what the mode is for);
  the rest may stay.

If the two systems can disagree, they will. Whichever of you builds this should make display mode the
outer switch and cosmetics the inner one, not two peers.

## 10. The default, and the first-visit prompt

Josiah's note: *have aesthetic / ambient mode be default, but a question pop up appears for any user
entering the library the first time what settings they would prefer — opt in or opt out.*

**My recommendation, and it is a split rather than a single answer:**

```
ON by default, not reduced-motion gated      bezel, LEDs, glow/bloom, the mascot's FADE
OFF until asked, hard off under reduced-motion   parallax, flicker, pulsing, any translation
OFF always until explicitly enabled          audio
```

- **Static cosmetics and the mascot's fade ON by default** — they are decoration, and a cross-fade is
  not a vestibular trigger. With the mascot off on first paint the default is a static bezel, which
  is less alive than the film Josiah liked, for no accessibility gain.
- **Vestibular motion and sound OFF until asked for** — parallax, flicker, pulsing, audio. Defaulting
  these on means every first-time reader takes the risk before being asked.
- **`prefers-reduced-motion` is an automatic answer that the prompt never overrides**, and a reader
  who has set it should not see a prompt about motion at all.

If Grey ever *moves across* the page rather than fading in place, that half is motion and gates
normally.

That gives the site the alive-feeling default on first paint while the two categories that can
actually harm someone stay opt-in.

## 11. The thing to build first, before any of it

Every cosmetic effect in this list has a failure mode where it is **configured, rendered, and
invisible**. The film hit it four times — the bloom, the mascot, the speaker grille, and the grain, which was tuned against an image where it was largely invisible and was caught by a bitrate rather than by an eye — and all of them
shipped or nearly shipped, because reading the source cannot detect it. The test is mechanical:

> **Render the thing twice, once with the treatment and once without, and diff. Identical output means
> inert, whatever the config says.**

On a website that is two screenshots at the same scroll position with a class toggled. Three numbers
matter and none is optional:

- **amplitude** — alone it misses the bloom, which moves a handful of pixels a long way and reads as
  present while a reader sees nothing;
- **area** — alone it suppresses the LEDs, 308 pixels and the most legible thing in frame;
- **contrast in stops**, `|log2(new/old)|` — the discriminator. Stops rather than a plain ratio
  because a ratio is one-directional: darkening tops out at 1.0 while brightening is unbounded, so
  any floor vetoes every darkening treatment or compresses them into noise. In stops, LEDs at 36.3×
  against the chin panel are 5.18, a vignette halving its corners is 1.00, and a bloom adding a
  fraction to highlights is 0.08 — one threshold at half a stop separates them.

**The axes OR toward `visible`, and they must stay that way.** A treatment that scores 0.06 stops but
covers a large area reads `visible` on area alone, which will look wrong to whoever next reads a
report full of results they cannot see. The asymmetry is the reason and it belongs written next to
the bands or it gets optimised away: **a false `visible` costs a glance; a false `INERT` ships.**

The video seat's implementation is `sweep_inert.py` if you want the shape of it, though it is written
against Blender and would need re-pointing at a headless browser.

---

## 12. Open decisions, all of them yours

1. **Where the cosmetic layer lives** — a stylesheet + a class on `<html>`, or a component wrapper.
   Affects whether the bezel can persist while the layer is off (§3).
2. **Whether the chin is fixed chrome or scrolls with the page.** The film has no answer: a monitor
   bezel does not scroll, but a web page's viewport is not a monitor.
3. **What the LEDs actually report.** The *set* defines `loading / loaded / idle` — the film renders
   only `idle`, per §2a, so this is a design question with no filmed answer. On a site those states
   mean view transitions and fetches. There may be better signals — a filtered result count, an
   unsaved state, a stale cache.
4. **Whether the prompt is a prompt at all**, or a persistent affordance the reader finds when they
   want it. A modal on first visit to an argument library is a cost.
5. **Morse flashing on the LEDs while reading or speaking** — Josiah logged it as a hypothetical.
   §5 applies with full force if it is ever more than a few pixels.

## 13. What the video seat can supply on request

- `perif_mask.png` — the radial softening mask, and `gen_perif.py` which generates it at any size.
- `bezel.png` — the film's composited bezel with the wordmark, and `gen_bezel.py`.
- `flash_wcag.py` — the WCAG/ITC criterion measured per-pixel on linear light, for checking a screen
  recording.
- The Blender set (`build_room.py`) if you ever want a rendered still of the site as a physical
  object — a press image, an OG card, a favicon of the monitor.
