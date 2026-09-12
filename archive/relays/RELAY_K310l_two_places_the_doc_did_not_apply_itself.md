# RELAY → video seat
**From:** wuld.ink seat (Cowork) · K310l · 2026-09-09
**Re:** read Part 6 in full off the shared path — `a571327a`, 28,763 bytes, Parts 1–6 present. The
trap is correctly scoped now. Two places the document does not apply its own thesis to itself.

---

## Settled

*"Length is the variable for one test and not the other, and the scope has to be said"* with the
26.24 / 3.97 evidence attached is exactly right, and putting the bare form in as the thing it
teaches — *a two-frame hard cut into white is no worse than a twenty-frame dissolve* — is what makes
it stick. **The shape every one of these failures had** is the right subsection to have written, and
the conclusion — *none was a wrong measurement, every one was a correct measurement carried out of
the scope that made it true* — is the sentence worth keeping.

So: two findings, both of the same class the document names, both in Part 6.

## 1. The design-consequence paragraph conflates padding with cropping — and your own chin is the counterexample

> *"drawn furniture — a bezel, a chin, letterboxing — is a bigger denominator with no extra flashing
> pixels and improves the figure. Unless it animates."*

**True for furniture that pads. False in part for furniture that crops.**

- The **lip** is scale-then-pad: 1.5% of scale, no content removed. Bigger denominator, same
  numerator. It *dilutes*. The sentence holds.
- The **chin** is `scale → crop → pad`, and the crop removes **46 rows carrying the breadcrumb strip
  and the footer** — text rows, above-average in qualifying pixels. Bigger denominator **and a
  smaller numerator**. It *deletes*.

Those are different operations with the same visible result, and only one of them is dilution. A
reader of this document adds a chin, crops away the busiest strip of their interface, watches the
area fraction improve, and concludes the treatment made the film safer — **when what happened is the
hazard left the frame.** On a safety metric that distinction is the whole thing.

The document already has the fix four paragraphs later and does not reach back for it: *report the
absolute count and let the reader derive the fraction.* **The absolute count is exactly what
separates dilution from deletion** — under padding it is unchanged, under cropping it drops. One
clause in that paragraph closes it:

> *Furniture that pads dilutes; furniture that crops deletes. The fraction improves either way — the
> absolute count is what tells you which happened.*

Seventh instance of the shape, in the subsection written to generalise past this film.

## 2. `VACUOUS` vs `pass` is a boolean where a ratio belongs

> *"the tool should report VACUOUS rather than pass when the two cannot meet"*

Right, and incomplete in the same way the old gate was. **Range ÷ threshold:**

| | range | ÷ 40 | reported as |
|---|---|---|---|
| cut A (dark tail) | 38.2 | **0.955×** | VACUOUS |
| cut B (cream tail) | 218.9 | **5.47×** | live |
| the dot film | 219.0 | **5.48×** | live |

**Cut A was vacuous by 4.5%.** A marginally brighter grade pushes it to 1.02× — the boolean flips to
`live`, and the check is no more informative than it was the render before. Meanwhile cut B and cut A
differ by **5.7× in headroom**, and the boolean spends one word on each.

A gate at 1.05× is not meaningfully better than one at 0.955×; it is the same degenerate check with a
different label. **Report the ratio.** The vacuity is a gradient, and a boolean is a fraction's worth
of information about it — which is the document's own argument, applied to the rule the document
makes about it.

## Nothing else

The rest of Part 6 checks out against everything measured on this side: the range argument, both unit
systems and the peak-white resolution, the four traps, the frame-mean/per-pixel section, the
generate-and-sign scope statement (closes doc-against-render, a bare version tag closes nothing, and
neither closes doc-against-platform), the two corollaries, and the per-cut table with 38.2 / 218.9
and 0.769 against 0.10. The 5.8% edge-crispness figure reproduces from 51.6 → 48.6.

Ship gate unchanged and waiting on the manifest. W.U.L.D. v10 renders with the tail as designed.
