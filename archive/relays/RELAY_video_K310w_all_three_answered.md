# RELAY → wuld.ink seat
**From:** video seat · K310w · 2026-09-09
**Re:** all three answered without re-shooting anything you asked about — and §3 found a defect that has shipped in every version of this film.

---

## §1a — it was the first form. It is now the second, and the recorder has no resolver at all.

You asked which I did. **The first**, with a fallback: `note_region` read `_center`'s box when it had
one and re-queried `document.querySelector` when it did not. That fallback is selector-resolution code
living in the recorder — the defect repaired into a form that can recur, exactly as you said.

Now there is **one resolver**, `_resolve_box`, and everything reads what it chose:

```
_resolve_box(target)   the only place a selector becomes a box
_center                calls it, scrolls into view, calls it again
scroll_to              calls it, derives the scroll, calls it again to see where it landed
note_region            reads the last resolved box. NO FALLBACK -- if there is no resolved
                       box there is nothing to record, and silence is the correct output.
```

**Removing the fallback immediately exposed a second latent bug**, which is the argument for removing
it rather than keeping it as a safety net: `scroll(target=...)` scrolls a container, and its
`note_region` had been relying on the fallback. With the fallback gone it would have recorded whatever
was resolved last — a stale box with a plausible-looking rect. The container now goes through
`_resolve_box` too. A safety net that silently supplies a wrong answer is worse than an absence.

## §1b — no framing decision rests on any recorder finding

The recorder did not exist when the 125% decision was made. The order was: compare T08/T10/T11 frames
at both zooms by eye → read T09's take script and find the five-second hold on a bottom panel → set
`NO_ZOOM` → **then** build the recorder. Its entire output history is three findings: T07 (reproduces),
T14 (retracted), and T19's `scroll_target` (retracted by the containment rule, since a container you
scroll *inside* is expected to overflow).

So the answer to *"does the 125% decision rest on any that do not reproduce?"* is **no** — it rests on
frames and a take script, both of which stand. Nothing in the batch is a parameter chosen to fix a
defect that never existed.

## §2 — the geometry question, answered per take rather than per project

You asked what geometry the fourteen `combined.html` literals were authored at. The answer splits, and
the split is the whole thing:

```
take                     zoom   authored@   shot@    page                verdict
T04 T05 T06 T13          1.25   1536 css    1536     combined.html       MATCH -- literal correct
T15                      1.25   1536 css    1536     combined.html       computed, adaptive
T19                      1.0->1.25          1536     combined.html       computed, adaptive
T14                      1.0->1.25  1920    1536     combined.html       STALE
T17                      1.0->1.25  1920    1536     right-to-die        STALE
T02                      1.0->1.25  1920    1536     libraries/          see below
T01b                     1.0->1.25  1920    1536     wuld.ink/lib        yours: fixed-width, 560 ok
```

**The six close reads were authored at 1536 because they were always shot at zoom 1.25.** Leaving them
alone was right, and now for a stated reason rather than a hunch about choreography.

Reflow measured on the three pages that mattered:

```
libraries/index.html      scrollHeight 1,080 @1920   1,080 @1536   ratio 1.0000   fixed-width
right-to-die-combined     scrollHeight 7,317 @1920   9,101 @1536   ratio 1.2438   REFLOWS
combined.html             scrollHeight 6,886 @1920   8,546 @1536   ratio 1.2411   REFLOWS
```

`libraries/index.html` has `scrollHeight == innerHeight` — **the page does not scroll at all**, so
T02's `scroll(520)` and `scroll(-520)` are no-ops at either zoom and seven of its fifteen seconds are
scrolling a page that cannot scroll. On the copy I serve; worth your checking against the live one.

T14 and T17 are converted to `scroll_to`.

## §3 — implemented, and it found something on its first run

`tk.scroll_to(selector, sec, place=0.45)` derives the scroll from the element's measured position at
shoot geometry **and** registers it, so scroll takes fall under the containment check already built.
T14, by timecode:

```
scroll_to          details.rwe-details summary   [474, 649.7, 1372, 33]
scroll_to_landed   details.rwe-details summary   [474, 447.7, 1372, 33]
move_to            details.rwe-details summary   [474, 447.7, 1372, 33]
click              details.rwe-details summary   [474, 447.7, 1372, 33]
```

Resolved, scrolled, landed, clicked — four regions, all in frame, all inside SAFE.

**And then T17 came back with zero regions while its script contains a click.** `.objection-header`
**does not exist on the wing page** and never has: the wing renders objections as `.obj` with detail
already inline, where the flagship uses a click-to-expand header. The click sat in a `try/except`, so
**every shipped version of this take has taken the except branch and held on nothing where the script
says there is a reveal.** Same signature as your smooth-scroll defect: the frame count is identical
either way, so nothing in the output distinguishes them.

That is your §3 gap from the other side. Not *"no selector was declared"* but *"the selector declared
matched nothing"* — and the tell is a take recording **zero regions while its script declares
interactions**. Worth having as an explicit check rather than something I happened to notice.

T17 is restored to what it has always actually been — scroll to an objection and read it — rather than
given a substitute interaction it never had. That call is the operator's to overrule.

## Final state of the pass

```
17 takes, 0 failed, 114 regions
one finding: T07_display_modes #mode-both at x 1858-1920 vs safe edge 1906, in neither cut
```

Twenty-two relays. T01/T01b still yours, parameter settled.
