# /book/ — cover cap: a ruling for Josiah (K298, 2026-09-07)

**Nothing was built or shipped for this. It is measurement + a recommendation. The cover is the
page's identity, so its size is your call, not a build call.**

## What K3 intended, and why it no longer holds

`src/book/index.html` caps the cover at `max-width: 24rem` with the comment: *"anchors the
page-hero without pushing title-block + lede below the desktop fold."* That was true when it was
written. The site header has since grown to 250px, and today the title block sits at
**y = 910 on a 900px desktop viewport** — i.e. the thing the cap exists to protect is now
*below* the fold. The cap is doing the opposite of its stated job.

## Measured (local mirror, `/book/`, service workers blocked)

| option | phone cover h | phone purchase link | desktop cover h | desktop title block | desktop purchase |
|---|---|---|---|---|---|
| **A — today, 24rem** | 447 | 1295 (**1.53 scr**) | 575 | **910** (below fold) | 1441 (1.60 scr) |
| **B — 18rem both** | 431 | 1279 (1.52 scr) | 431 | **766** ✓ | 1297 (1.44 scr) |
| **C — phone-only 14rem** | 335 | 1183 (**1.40 scr**) | 575 | 910 (below fold) | 1441 (1.60 scr) |
| **D — 18rem + phone 14rem** | 335 | **1183 (1.40 scr)** | 431 | **766** ✓ | **1297 (1.44 scr)** |

**These are not competing options.** B fixes desktop and barely moves the phone; C fixes the
phone and leaves desktop untouched. The reason B does almost nothing on a phone: at 390px the
column is only ~336px wide, so a 24rem (432px) cap is *already* overridden by the column — the
cover is width-constrained, not cap-constrained. Only a cap below ~336px (14rem = 252px) moves it.

## Recommendation — **D**, and it is one line

```css
.book-cover { max-width: 18rem; }                       /* was 24rem */
@media (max-width: 640px) { .book-cover { max-width: 14rem; } }
```

D restores the K3 intent on desktop (title block 910 → **766**, back above the fold) *and* lifts
the phone purchase link from 1.53 → **1.40 screens**. It is the only option that pays on both.

**The cost, stated plainly:** the cover shrinks. On desktop 575 → 431px tall; on a phone
447 → 335. Malgré Tout's cover is a designed object and this makes it materially smaller in the
one place it is presented. If the cover's presence matters more than the fold, **take B alone** —
desktop is fixed, the phone cover keeps its current size, and the phone pays 0.12 screens.
If you want the cover untouched, **take nothing**: 1.53 screens is not a defect, and `/book/`
was never the worst page on the site.

## What I would not do

Fold the cover behind a `<details>`, as `/archive/` (K291) and `/gallery/` (K297) do. Those folds
hide *prose*; a book page's cover **is** the content. A collapsed cover is a worse page.

---
*Contact sheet: `book-cover-ruling-K298.png` — phone + desktop, all four options, same scale.*
