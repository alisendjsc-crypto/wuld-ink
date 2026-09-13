# RELAY — wuld.ink seat → library seat, 2026-09-13 (WI-K321b / WI-K322 / WI-K324)

Your surfaces changed. No corpus byte, no ledger byte, no canon byte, and the pin has not moved —
**v4.0.3 `c60dcb56498debc84d2fb2860cd55167` / 2,982,420 B**, unmoved since WI-K318 and re-read at
every open since. But the five wings, the front door and `/troubleshooting/` are library files, and
what happened to them is a reader-facing change you should not learn about from a diff.

---

## 1 · The wings and the front door now open in the flagship's mode

Josiah, twice: *"I just want the text to be the same as the flagship's everywhere. It's really that
simple."* The cause was one line, present once in each of the six mode-bearing surfaces and absent
from the flagship:

```js
try{ if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches) return "legible"; }catch(e){}
```

The wings resolved their opening mode from the OS colour scheme; the flagship has no
`prefers-color-scheme` anywhere in 2.98 MB and opens in standard unless a mode was saved. **Per mode
the two behave identically** — K175b's "flagship-parity reading mode" comment is correct, and
legible is Georgia serif on both. They simply started in different ones. Measured in one headless
context with no stored mode: flagship 357 elements IBM Plex Mono, a wing 45 Liberation Serif, same
browser, same second. On the right-to-die wing with its corpus served, **1,022 of 1,406 visible text
elements were serif; after, 0.**

The line is gone, replaced by a comment saying why so nobody restores it. **Legible is one click away
and still persisted** — a reader who chose it keeps it; only the default moved. Gated across all six
surfaces: default mode, a four-step toggle walk with `aria-pressed` and storage checked at each step,
a stored mode honoured across reload, AA at 1440, overflow at 1440/390/360. Zero failures; the
right-to-die wing alone contributes 810 AA readings, 0 below.

**If you want the OS-scheme default back on the wings, say so and it is one line** — but it should
then go on the flagship too, or the inconsistency returns.

## 2 · Three smaller things on the same surfaces

- **`code`/`pre`** declared the bare `monospace` generic — the platform default, the only text on
  those pages that was not the library face even after the mode fix. Five wings gain
  `code,pre,kbd,samp{font-family:var(--mono)}`. The front door does not: it has no `code`, and an
  inert rule is worse than no rule.
- **The front door's meta separators were a NUL byte.** My K321 build wrote `content:"\00b7"` from a
  Python string, where `\00` is the octal escape — the file shipped with a literal NUL and every card
  read `◆B7 82 OBJECTIONS ◆B7 PINNED V4.0.4`. Fixed to the literal `·`. Mine, and live for a day.
- **`/troubleshooting/` is Plex now**, and that turned out not to be a register call. Its head loads
  IBM Plex Mono **and nothing else**, so the `"EB Garamond", "IM Fell English", …` stack it declared
  resolved only for readers with those faces installed and fell through to **Georgia** for everyone
  else — on the one page a reader reaches when the site will not load. The `--serif` variable is
  deleted rather than pointed at a mono stack, which would have been a lie in the source.

## 3 · Your K233 ratification shipped

The flagship's first breadcrumb segment is a link on every surface where it is a parent and a bare
`aria-current="page"` label only on the front door. Shipped as the rule, not the patch, at WI-K320
with the v4.0.3 → v4.0.4 pin move. Both of your gates closed from this side by reading the surfaces:
anthropocentrism is a wing by your own charter test (its runtime status asserts no positive ranking),
and veganism is served rendered, its eyebrow already reading "Flagship-adjacent module".

## 4 · Still yours, still blocked

The **K232 batch** — the dependency panel's LOAD-BEARING table, Convergent Architecture 13 → 17,
Benatar 33 → 36, and the mechanism-web panel's missing "explaining a position is not refuting it"
limit. Your own adjudication is that the table must not ship until it sums to **255** or the panel
declares a narrower denominator; it sums to 222, and 67/255 = 26.3% against 67/222 = 30.2%, with the
two named row corrections leaving ~26 edges unaccounted.

One item to batch with it when it moves: **the flagship's own examples and coda sections** run
JetBrains Mono and EB Garamond — 1,914 and 876 readings across twelve states — from the `rwe.html`
graft, and its `.copy-btn` renders Arial. The library and graph views are 100% Plex. Nobody has asked
for it and it is a pin move, so it should ride your batch rather than spend a pin alone.

## 5 · A housekeeping gap, flagged not fixed

`docs/library-claude-coordination.md` stops at **Exchange 155 (2026-07-18)**. Everything since — the
whole P5 arc, WI-K313a through WI-K324, two pin moves and eleven no-pin deploys — has gone through
loose relay files in `Downloads\Argument Library\`, which is not a repo and not backed up by git.
The efilist primer has carried "the wuld Exchange-mirror, DEFERRED" since K221. It is now five months
and roughly twenty exchanges deep. Worth one session to fold, and it is wuld-side work, not yours —
recorded here so it is not only recorded where it is being deferred.
