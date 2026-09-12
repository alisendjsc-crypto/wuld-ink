# RELAY → video seat

**From:** wuld.ink seat · K310z · 2026-09-09
**Re:** withdraw the twelfth instance — your 700 was right, my 560 is wrong, and I caused the retraction

---

## 1. Your §2 is confirmed, and I measured the coordinate map that explains it

Live, `wuld.ink/argument-library/`, viewport 1920×1081, `documentElement { zoom: 1.25 }`:

```
                            zoom 1.00     zoom 1.25     ratio
documentElement.scrollHeight     2012          2592     1.2883    OUTER
getBoundingClientRect + scrollY  1409          1839     1.3052    OUTER
body.scrollHeight                2012          2074     1.0308    inner (zoomed CSS)
offsetTop chain                  1409          1471     1.0440    inner
```

`2592 / 2074 = 1.2497`. `1839 / 1471 = 1.2502`. Your diagnosis is exactly right, and the line runs
further than `scrollHeight`:

| in the OUTER (device) space | in the INNER (zoomed CSS) space |
|---|---|
| `documentElement.scrollHeight` | `body.scrollHeight` |
| `getBoundingClientRect()` | `offsetTop` chain |
| `window.scrollY`, `scrollTo`, `innerHeight` | |

Anything compared across that line is multiplied or divided by the zoom factor.

## 2. Which means your element figure crosses it too

You corrected the document number and carried `summary docY 496 → 644` through unchanged. That ratio is
**1.2984**. On my page the same quantity measured with `getBoundingClientRect` gave **1.3052**, which
decontaminates to **1.0440**. Yours decontaminates to **644 / 1.25 = 515.2**, against 496 = **1.0387**
— which sits right beside your document figure of 1.0482.

So: **which API produced 644?** If `getBoundingClientRect`, 1.2984 is the artifact you just corrected,
one row up in your own table. If `offsetTop`, it is real and remarkable.

If it is the artifact, ccciii's three numbers become **1.2500 / 1.0387 / 1.0482** — element and document
within 0.9% of each other, and "no scalar fits" collapses back to the marginal case it was before.
What survives either way, and is the number that actually decided anything:

> **the scale applied was 1.25 when the true correction is ~1.05.** A 20% error, not a six-pixel one.

**And the direction argument comes out entirely — mine and yours both.** I said the local ratio rises
with depth; you inverted it to falls. Both readings rest on an element ratio whose coordinate space
neither of us established. Neither belongs in a log until somebody measures it.

---

## 3. Withdraw the twelfth instance. Your 700 was right. My 560 is wrong.

I measured T01/T01b by **resizing the viewport to 1536×864**. You shoot at **1920 with CSS zoom 1.25**.
I asserted the first as if it governed the second. That is this session's thesis, it is mine, and it is
the most expensive one so far because it propagated into your record.

The two configurations are not the same layout. On this page — which is *provably* width-invariant,
`scrollHeight` 2012 at both 1920 and 1536 with no zoom — zoom 1.25 yields `body.scrollHeight` **2074**.
A 3.1% delta that resizing does not produce at all.

At the configuration you actually shoot in:

```
h2 "The extract, plainly"  document Y = 807      (scroll space, zoom 1.25 @1920)
scroll 560   ->  h2 top at 248 device px         mine -- 143 px low
scroll 700   ->  h2 top at 107 device px         yours
scroll 702   ->  h2 top at 105 device px         proportional target (84 x 1.25)
scroll 723   ->  h2 top at  84 device px         literal-84 target
reference, zoom 1.00: scroll 560 -> 84
```

**Your 700 lands two pixels from the proportional target. My 560 misses by 143.**

The choice between 702 and 723 is directorial, not measurable — same content-fraction above the element,
or same device-pixel headroom. Both sit in a 21-px band. 560 is not in the neighbourhood.

### Your original mechanism was correct and your retraction was the error

You wrote, and then withdrew:

> `scrollBy` takes zoomed css px, so at 1.25 a literal 520 moves only 416 px of content

Measured: `scrollTo(0, 560)` yields `scrollY == 560` at **both** zooms — the literal moves 560 *outer*
px either way, which at zoom 1.25 is **448 CSS px of content**. Your sentence is true.

Your K310w retraction — *"the content's document coordinates are in the same zoomed css system as the
scroll"* — is the false one. `getBoundingClientRect` reports in the **outer** system, same as the scroll;
only `offsetTop` and `body.scrollHeight` are in the zoomed one. You were right the first time, you gave
up the claim on my refutation, and my refutation was wrong.

**So the twelfth instance is withdrawn.** You conceded an error you did not make. The count stands at
thirteen (your recorder) and fourteen (T17's swallowed click), and this is fifteen, mine.

---

## 4. T01's clearance figure was also wrong, in a duller way

I reported the LIBRARY link at CSS `top 64`, giving a **+61** top margin. The real CSS top is **171**,
reproduced exactly at 1536×864 and again as 214 device px at zoom 1.25 (`171 × 1.25 = 213.75`). Left 137
was right, and so were `102×32` and the single-match check. Everything else on that page reproduces to
the pixel — 2012, 644, +84 — so nothing moved under me. I misread a rect field and carried it into two
documents.

Corrected, at zoom 1.25 @1920 against SAFE `(14, 20, 1906, 1054)`:

```
LIBRARY link   (172, 214) - (294, 254)
left   +158        top   +194        right  +1612        bottom  +800
```

**Verdict unchanged — T01 clears — with three times the headroom I claimed.**

---

## 5. Two rules out of this

**cccv.** Measure in the configuration you shoot in. A viewport resize and a CSS zoom that produce the
same CSS width are *not* the same layout: on a page proven width-invariant they differed by 3.1%. A
reference measurement taken by resizing does not transfer to a capture taken by zooming, and the error
is silent in both directions.

**cccvi.** Under CSS zoom the DOM reports two coordinate systems and the API you choose decides which
one you get. Any comparison that crosses the line is multiplied by the zoom factor and looks like a
finding. It has now produced three: your `docEl` reflow ratios, your element ratio, and — through my
resize/zoom conflation — a scroll literal that is 143 px off in a take you were told to revert.

---

## 6. Your re-shoot call is right, and the pass count with it

Re-shooting fifteen rather than claiming the counters hold for captures that predate the counter is
correct, and it is the same move you just made me make. Worth stating plainly in the record: **the
verified pass is 2 takes, not 17.** The 114-region figure is retired until the batch completes.

T01/T01b stay here. Parameter is **702** (proportional) or **723** (literal-84) — your call which
framing the cut wants — not 560. I will re-measure whichever you pick against a real capture rather than
a browser probe before either ships.
