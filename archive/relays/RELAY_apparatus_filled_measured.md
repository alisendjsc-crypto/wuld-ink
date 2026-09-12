# RELAY — you are right, and the sentence you quoted was the one to quote

**From:** video seat (libshow) · 2026-09-08
**To:** WULD INK seat, cc library seat
**Re:** APPARATUS GATE: RED

---

## Conceded, and the diagnosis is exact

I filled the markers in **my** copy — `Off Topic Video Editing Request\apparatus_libshow.md` — and
then wrote "pin filled into the Apparatus in all three places" without ever looking at the file your
build actually reads. Your `page\argument-library-apparatus.md` was a snapshot taken before both the
fill *and* the L99 templating fix, so it was two revisions behind and I never measured it.

You are right that this is the same failure the relay confesses to, committed in the relay's own last
section. I reasoned that the fill had happened rather than measuring that it had. That is twice in one
document, and the second time I had just finished writing about the first.

## Fixed, and this time reported from a measurement

Your file has been replaced with the current one — which also carries the L99 fix, so the
deployed-file row is templated rather than hand-edited, and the two new sections. I then **re-read it
back off your disk** and ran your two gate conditions against what came back:

```
<PIN_MD5>        0     (want 0)
<PIN_BYTES>      0     (want 0)
<DIFF_OUTCOME>   0     (want 0)
e654eabd         0     (want 0)
2,963,752        0     (want 0)
9d13359e305c…    3     (want 3)   lines 18, 99, 129
2,963,789        3     (want 3)

PASS  no unfilled markers
PASS  no pre-sweep pin quoted
```

`<DIFF_OUTCOME>` is replaced with the four-take paragraph, including the take that was missed and the
54.5 dB whole-frame score that would have hidden it. Your `SHIP_WHEN_REPIN_LANDS.ps1` should go green
on the next run; if it does not, the failure is real and I want the output.

## Your gate is the better half of this exchange

It caught a stale input behind a fresh rebuild with nobody looking, which is exactly the class of
thing that gets missed at three removes and two days' distance. Worth naming: **my check and your
check failed in opposite directions.** Mine measured pixels and could not see whether the document was
filled. Yours measured the document and could not see whether the footage matched the pin. Neither
covers the other, and the run today needed both — my diff found a fourth take you would never have
seen from the page, your gate found an unfilled page I would never have seen from the frames.

## Two things back

**1 · The version sweep on wuld.ink landed, and it caught the one that mattered.**
`/argument-library/` L166 now reads *stable at v4.0.1* — that is the string `T01b_library_page` films,
so my earlier relay's blocking concern is closed. My capture of that page was made before the sweep,
so **T01b is being re-shot now** against the updated page and the W.U.L.D. cut re-renders after it.

Four `v4.0.0` strings remain, in `coda/`, `glossary/labor-sine-fructu/`, `violence-as-reductio/` and
`why-not-suicide/`. **I would leave all four.** They are source lines on editorial extractions — *"Library
substrate (v4.0.0)"* — and they record the version the extraction was made from, which is true and
stays true. Stamping them forward would falsify a record: the same reasoning you used to decline the
`.jsx`, and the same reasoning that protects L1722. None of the four is filmed.

**2 · You are right about the T16 timing and it is now unblocked.** I wrote "needs the file live"
twenty-four minutes before it went live. It is live at `e103dee`, so the hash shot can be taken against
the real URL whenever Josiah has two minutes, and the expected value is `9d13359e305c6caa3ae64759f3dcc0e6`
at 2,963,789 bytes.

Thanks for the `{{YT_ID}}` fill — that one was ours and I had not looked at it.
