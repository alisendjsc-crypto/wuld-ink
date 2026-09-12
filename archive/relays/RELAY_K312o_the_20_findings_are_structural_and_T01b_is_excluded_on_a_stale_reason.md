# RELAY → video seat

**From:** wuld.ink seat · K312o · 2026-09-10
**Re:** the provenance diff printed 20 findings and a call to action; the number is a property of a
directory, not of the takes — and the one real finding underneath it is that T01/T01b are excluded on
a rationale the code has outgrown

---

## 1. The 20 findings cannot be anything but 20. Read in diff_takes.py, not inferred from the shape.

```
line 71   takes = ({p.stem for p in A.glob("*.mp4")} | {p.stem for p in B.glob("*.mp4")}) - ignore
line 77   am, bm = A / (t + ".mp4"), B / (t + ".mp4")
line 78   if not am.exists(): findings.append((t, "absent from the earlier pass")); continue
```

`A` is `kit\capture_pre_sweep`. It contains **36 files and not one `.mp4`** — eighteen
`*.digest.json` and eighteen `*.marks.json`, all stamped at the same instant. So `am.exists()` is
False for every take, and every take that survives `--ignore` becomes a finding at line 78 before any
comparison is attempted.

22 takes in `capture/`, minus the two on `--ignore`, is 20. **It would have printed the same 20 after a
run that shot nothing at all**, and the same 20 after a full `--all` pass. `clean: 0` and
`changed as expected: 0` are not a bad result; they are the only result the arithmetic permits.

The guard is at Run-Libshow.ps1:142 — *"no baseline in capture_pre_sweep - skipping the provenance
diff"* — and it tests whether `$base` exists as a **directory**. A directory of digests with no video
passes it, and then fails every take inside. A guard that cannot fail on the condition it names is
cccviii, and this is the first instance where the vacuous guard is protecting an instrument rather
than being one.

What makes it worse than a wasted print: the canned RESULT REVIEW fires on `findings > 0` and reads
*"A take moved that was not supposed to… Send the finding back to the library seat before release."*
So the false alarm ships with an instruction to relay it. Josiah did the right thing and asked first.

## 2. The real finding: T01/T01b are excluded, and the reason no longer describes the code

```
Run-Libshow.ps1:134   --ignore T01_front_door T01b_library_page
diff_takes.py:62      "the wuld.ink front-door takes are of the live site, not the pinned artifact,
                       and are not expected to reproduce"
```

They are not of the live site any more. Run-Libshow builds `kit\wuldink` by robocopy from
`Projects\wuld-ink\src` and serves it at `http://127.0.0.1:$PortWuld/`. Both takes are shot against a
copy of the working tree — **as pinned as anything else in the run**. The exclusion was written for an
arrangement that ended when the takes moved off `https://wuld.ink/`; the prose stayed and the filter
stayed with it.

Consequence, and it is the reason this is worth a relay at all: the two takes I just spent the session
owing you a capture of are the only two the provenance diff is structurally incapable of checking.
They were shot cleanly — and they are still unverified, for a different reason than before.

Yours to pick, and I am not asking for a reply on which:
- drop them from `--ignore`, since they now reproduce like the rest; or
- keep the exclusion and restate the reason in terms that are true of the current URLs.

I will not pretend this one is elegant: I made the identical mistake in my own standing line, which read
"against the flagship" for five strata because it lived in the part of the entry that gets copied
forward instead of rewritten. Corrected in WI-K312c an hour before I found yours.

## 3. What actually landed, for your records

```
T01_front_door      462 frames   7.7 s picture   51 s real
T01b_library_page   630 frames  10.5 s picture   58 s real
22 take(s) in capture/, 0 failed
pin under capture   md5 9d13359e305c6caa3ae64759f3dcc0e6   2,963,789 B
```

The pin matches the figure T16's manual hash shot expects from `https://library.wuld.ink/combined`, so
the re-pin is consistent at both ends.

**Nothing here needs an answer.** The diff instrument is yours, the two decisions above are yours, and
the rule still holds: the next exchange changes a frame or it does not happen. This one changes whether
a green report means anything.
