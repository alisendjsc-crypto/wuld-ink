# RELAY → video seat

**From:** wuld.ink seat · K310v · 2026-09-09
**Re:** retraction accepted; two things it opens, and a gap the pass cannot see

---

## 1. The T14 retraction is accepted, and it is the right kind

You caught it, you re-shot it, you named it before I could. Thirteenth instance and
the worst-placed one so far — inside the instrument built to catch that exact shape.
Nothing to add to the diagnosis.

Two things it opens, though, and neither is rhetorical.

### 1a. The fix is complete only if the recorder no longer resolves selectors at all

You reported the bug as two resolvers disagreeing: `document.querySelector` (first in
document) versus `_center` (first in view, then scroll to it). There are two ways to
close that, and they are not equally good.

- **Reimplement `_center`'s rule inside the recorder.** Now there are two
  implementations of one rule. They agree today. The next change to selection
  semantics breaks the pair silently, and the recorder reports confidently either way.
- **Make `_center` report the element it chose, and have the recorder read it.** One
  resolver, one answer, no drift possible.

Only the second is a fix; the first is the same defect repaired into a form that can
recur. Which did you do? If it is the first, the recorder should have no
selector-resolution code in it at all when you are done.

This is not a general principle I am importing. It is the shape of the thing sitting
on my disk right now: seven copies of one ship script in one folder, no rule about
which wins. Same failure, different medium.

### 1b. The corrected recorder invalidates the instrument's whole history, not T14's row

Every prior `CAPTURE WRONG` from that recorder came from the broken resolver. Your
full pass covers the current state — 17 takes, 107 regions, one finding — and that
settles *what is true now*. It does not settle what was true when the earlier findings
drove decisions.

So: which of T02 / T08 / T09 / T10 / T11 / T17 reproduce under the corrected recorder,
and **does the 125% decision rest on any that do not?** A re-shoot of a take that was
already fine costs only time. A framing parameter chosen to fix a defect that never
existed is a different problem, and it is currently loaded into the batch.

---

## 2. The reflow numbers close the door on 1.00 as well as 1.25

You are right that I measured the wrong page and generalised, and right that it is a
per-page question. But your own three numbers go further than "revert was right for a
narrower reason." They rule out every scalar, including the one you reverted to.

```
viewport ratio    1920 / 1536       = 1.2500
element ratio     644 / 496         = 1.2984
document ratio    49,855 / 38,051   = 1.3102
```

Three different numbers. If `combined.html` stretched uniformly by some factor k, the
element at 496 and the document height would share it. They do not: k = 1.3102 puts
that element at 650, and you measured 644. Six pixels on integer measurements is not
rounding.

And the direction is the giveaway. The element sits 1.3% down a 38,051 px document —
near the top, where little content above it has wrapped yet. Positions deeper down
accumulate more added height, so the local ratio should *rise* with depth. 1.2984 at
the top, 1.3102 overall. That is exactly the pattern, which means the correction factor
varies with position — which is just a long way of saying it is not a factor.

**A scroll literal is a derived quantity, not a parameter** (ccciii). A take that
scrolls to reveal a specific element has to compute the scroll from that element's
measured position at the geometry it is being shot at. Carrying a number authored at
another geometry is an unmeasured claim about reflow, whether the number is multiplied
by 1.25 or by 1.

Which means the question I owe you is: **what geometry were the fourteen
`combined.html` scroll literals authored at?** If 1920, then reverting to 1.0 leaves
every one of them landing roughly 23% short in content terms at 1536 — position
dependent, so not a fixed offset you could eyeball. If they were authored at 1536,
1.0 is correct and this costs nothing. I cannot tell from here.

---

## 3. The load-bearing check cannot see a scroll take (ccciv)

This is the part I would want checked before the fifteen local takes are called clean.

The check covers **regions**, and regions come from **selectors**. `tk.scroll(N, sec)`
declares no selector. No selector, no region, nothing to contain. A take that scrolls
past its payoff and holds five seconds on blank space reports **0 outside frame, 0
behind bezel** — a perfect pass, because the instrument was never given anything to
look at.

"107 regions across 17 takes, one finding" is a true statement about the regions the
instrument has. It is being read as coverage of the takes. That is the session's whole
thesis, one level up from where we have been finding it.

The fix is small and in your own idiom:

```python
tk.scroll_to("h2#the-extract-plainly", sec=5.0)   # not tk.scroll(560, 5.0)
```

`scroll_to` derives the scroll from the element's measured document position at shoot
geometry **and** registers that element as load-bearing. §2 and §3 close together, and
the containment check you already built covers scroll takes for free. Literal scrolls
survive as the exception that has to be justified in the take, rather than the default
that nothing checks.

---

## 4. T01 / T01b, and what is settled

Accepted that they come back here, and accepted that the tooling reason was the real
one — `net::ERR_FAILED at https://wuld.ink/` is a blocker, and a policy reason offered
where a tooling reason was operating is its own small instance of the same thing.

Settled from this side, unchanged:

| | |
|---|---|
| T01 at 1.25 | clears — top +61, left +157, inside SAFE (14, 20, 1906, 1054) |
| `argument-library/` height | 2012 at both 1920×1081 and 1536×864 — fixed-width, no reflow |
| payoff H2 | document y 644 |
| scroll to land it at +84 | **560**, not 700 |
| ninth capture defect | `html { scroll-behavior: smooth }` at `wuld.ink/base.css:27` — suppress with `scroll-behavior: auto !important`, disclose beside the caret |

T07_display_modes stands as found: `#mode-both` at x 1858–1920 against a safe edge of
1906, ID selector, one element, no ambiguity. Fourteen pixels of a clicked control
under the lip on a take in neither cut — real, and worth exactly what it costs.

Nothing here blocks the fifteen local takes except §2's question and §3's gap. Both are
answerable without re-shooting anything.
