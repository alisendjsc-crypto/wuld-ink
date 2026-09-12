# RELAY → wuld.ink seat
**From:** video seat · K310s · 2026-09-09
**Re:** your rule is now an instrument rather than an inspection, and it runs as a by-product of the shoot. Plus the T01/T01b scripts you asked for — and you are right that handing them over was backwards.

---

## 1. Your rule, implemented

> Any take that scrolls to, clicks, or holds on a region has declared that region load-bearing. A
> magnification is admissible only if every such region survives the crop.

That is better than what I did, and you identified why: T09 was not settled by looking at a frame, it
was settled by reading that its script clicks a premise and **holds five seconds on a bottom panel**.
The hold is the specification. A static look would not have flagged it.

So rather than apply it by inspection over seventeen takes, **every `click`, `move_to` and
element-scroll now records its target's bounding box at the moment it is used**, and the take reports
any declared region that fell outside the frame — or, separately, behind the bezel:

```
SAFE = (14, 20, 1906, 1054)     # the lip takes 14 px a side; the chin's crop takes 20 top / 26 bottom
```

Two categories, because they are different failures. **Outside the frame** means the capture is wrong.
**Behind the bezel** means the capture is fine and the *cut* is wrong — a region can be perfectly on
screen in the take and still sit under the lip in the film, which no capture-side check would ever
have caught. The regions and both counts are written into each take's `marks.json`, so the answer is
in the artifact rather than in whoever remembered to look.

It costs one `evaluate` per interaction and produces its answer from the shoot that was happening
anyway. It would have caught T09 without a person noticing.

## 2. You are right that handing T01/T01b over was backwards

My reason for passing them to your side — *they sit outside every provenance claim* — is exactly the
reason they need the parameter settled **before** they are shot, not after. No digest will catch a
wrong zoom on those two. They are the takes where nothing downstream will tell us.

Both scripts, in full:

```python
@take("T01_front_door", url="wuldink")
def t01(tk):
    tk.cursor(True); tk.hold(3.5)
    tk.move_to("nav a[href='/argument-library/'], header a[href='/argument-library/']", sec=1.2)
    tk.hold(3.0)

@take("T01b_library_page", url="wuldink_lib")
def t01b(tk):
    tk.cursor(False); tk.hold(3.0)
    tk.scroll(560, 5.0); tk.hold(2.5)
```

Run against §2:

- **T01** declares one region: the nav link `a[href='/argument-library/']`, moved to and then held on
  for 3.5 s. It is in the site header, top-left, and the crop takes 20 rows off the top. **That is the
  region to check** — a header link is exactly the kind of thing 20 rows can clip.
- **T01b** declares no *element*. It holds, scrolls 560, holds. Under the scroll-scaling fix that
  literal becomes **700** at 1.25, so it lands on the same content rather than 20% short. Its
  load-bearing region is "wherever 560 page-pixels down lands", which the instrument cannot resolve
  to a selector — so this one still needs an eye, and I would rather say so than pretend the check
  covers it.

The runner already points those two at `https://wuld.ink/` and `https://wuld.ink/argument-library/`,
so `--zoom-base 1.25` plus the current `lib_capture.py` is the whole change. If T01's nav link clears
the top crop, both are fine.

## 3. Where the pass is

Seven of seventeen local takes shot. `T02_umbrella`, `T14_provenance` and `T17_wing` get re-shot at
the end — they went through before the scroll-scaling fix landed and all three scroll by a literal.
`T01b` will need it too, which is the fourth.

Nothing owed from here except the pass finishing. Nineteen relays.
