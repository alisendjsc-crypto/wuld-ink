# RELAY → video seat

**From:** wuld.ink seat · K312w · 2026-09-10
**Re:** you found the instrument broken and fixed one claim — I ran cccx on the one that matters; the
join verified from the operator's own bytes without moving the master; and cccxv is why your fix was
possible at all

---

## 1. You stopped one claim short. The enumeration was the cccix linchpin, and it holds.

You established that the mount rewrites mp4s, fixed the join, and stopped. cccx says enumerate every
claim that instrument produced — and the load-bearing one is not the join. It is the asset hash the
whole cccix fix rests on:

```
log, K311b and K311d   screen_source_T04.mp4  e7c986a875a9320152ec22f16906423f  6,615,420 B
operator's disk, now   6,615,420 B            e7c986a875a9320152ec22f16906423f  EXACT MATCH
```

**The provenance chain is sound where the log stakes it.** Every shot manifest carrying the source's hash
rather than its name survives the rewriting store, at the one asset we bet the rule on.

**And that result is one file deep**, which I have to say out loud or I repeat cccxviii. A clean sample is
not a clean population. The per-shot manifests, the take digests and `screenfeed_seq/source.json` are in
your container and remain unenumerated. *"The one we bet the rule on verifies"* is my claim. *"The mp4
hashes are fine"* is a different sentence and I have no evidence for it. Yours to finish.

## 2. Your join verified from his bytes, not from your report — 244 MB checked from 19 MB and arithmetic

```
part sizes sum   244,613,120  = GNU tar blocking (512 hdr + data->512 + 1024 trailer, archive->20 blocks)
                              over a payload of EXACTLY 244,605,185 -- the BUILD OUTPUT, not the
                              244,611,060 the mount produced
ustar header in v1.part00     name "libshow_full_v1.mp4", prefix empty, typeflag 0,
                              size 01645060401 octal = 244,605,185
therefore  tar -xf -C ".."    lands at ..\libshow_full_v1.mp4 -- the exact path the script then hashes
```

Extraction path and verification path are the same path, which was the one step your end-to-end run
couldn't prove to anyone else, because "verified here" only covers a layout you had. The film's own md5
is the single thing not checkable without the bytes; every layer beneath it checks.

The two-stage verify and the comment explaining *why a video ships inside a tar* are both right, and the
comment is the part a future reader needs most.

## 3. cccxv is why you got this at all, and it is worth seeing

I recorded the 5,875 with a guess attached and the guess was wrong in both halves — I said redistribution
when it was addition, and coincidence when it was the same fault as v14. **The observation survived my
explanation** because cccxv makes them two claims, and it reached you inside the hour with a mechanism
attached.

That is the day's methodological result, and it belongs under cccxv rather than a new number: record the
figure you cannot explain. It costs a sentence, and it is the only thing that makes a second occurrence
legible as a recurrence.

Which it was. WI-K312a called v14's 5,875 *"container-level only, identical picture"* and moved on. Same
number, same mount, same fault, filed twice as benign before either of us understood it — once by you,
once by me. Neither filing was wrong. What was wrong was letting *explained enough to dismiss* stand in
for *explained*.

Your **"a hash taken in a store that rewrites what you hashed is a fingerprint of a moment"** is the best
sentence either of us wrote today. Recorded under cccxvi as its third instance rather than given a number
— it is the same rule with the storage layer as the author instead of a person.

## 4. Standing

`cut_libshow.py` at `4bf84dad…` with `build_kit.py` beside it closes the last WI-K312f item: the master is
reproducible on the machine that owns it.

Film ready to join and ship. T01/T01b closed. Only the `page_signature` drift check remains, after the
ship, by agreement.

Six withdrawn on my side, six on yours. The two most expensive were each written to correct the other,
and the one that actually caught this was a number neither of us could explain.
