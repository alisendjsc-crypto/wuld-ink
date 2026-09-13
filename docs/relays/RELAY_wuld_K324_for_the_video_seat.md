# RELAY — wuld.ink seat → video seat, 2026-09-13 (WI-K322 / WI-K324)

Four things, none of them needing an answer except the last.

---

## 1 · Your four view cues are live

efilist `84aadac`, no pin. `wz-library_index` / `wz-settle_swarm` / `wz-dep_cascade` / `wz-flow_fan`
on `#vbtn-library` / `#vbtn-map` / `#vbtn-dep` / `#vbtn-map1`, wired exactly as §4 of
`HANDOFF_view_cues_sfx.md` prescribed, `playView()` and all.

**The cancel you flagged is in from the start.** You wrote that stacking "will bite after ship"; it
was built before ship and gated: four tabs pressed inside 0.6 s start four cues and leave exactly
one sounding. One cue per press, each at the duration your table gives (3.62 / 7.50 / 6.52 / 2.92
against your 3.60 / 7.50 / 6.50 / 2.90 — the surplus is AudioBuffer padding, not a different file).

## 2 · Your gains are unchanged, and that was a measurement rather than deference

Josiah asked me to re-level them against the existing bank if they did not match. Measured two ways,
and the two disagree:

| | family mean | vs the cue bank |
|---|---|---|
| whole-file A-weighted RMS × g | −41.1 dB | −5.2 dB — "lift them" |
| **loudest 400 ms, A-weighted × g** | **−35.5 dB** | **−0.6 dB — already level** |

The second is the fair one and the first is a trap: integrating a 7.5-second settle end to end
averages its own decay into its level, so it compares a 0.20 s click and a 7.50 s cue on a scale
neither is heard on. Acting on the first number would have raised all four by 5 dB against a bank
they already matched — inaudible in the spreadsheet, obvious in the room. Nothing changed. Your
instruction to level the four against each other rather than individually is honoured; the 3.7 dB
spread inside the family is intact.

## 3 · Three node-select cues, in your family, and where their generator sits

Josiah: *"I wanted SFX for when you click on what the cursor is hovering over — unique to those
sections."* So: `wz-pick_web` (0.34 s), `wz-pick_dep` (0.30 s), `wz-pick_flow` (0.28 s), one per
graph view, live in the same commit.

**The chord is measured off your shipped bytes, not taken from your prose** — because
`gen_view_cues.py` and `gen_settle_dark.py` are **not in `wuld-sfx\`**, where §1 of your handoff
says they are; they are one level up, at the root of `Downloads\Argument Library\`. Worth a one-line
correction in the handoff, since the next reader will do what I did. FFT peaks under 600 Hz across
your four: 55.0 / 82.5 / 110.0 / 123.6 / 164.8 / 220.0 / 247.2 — A1 E2 A2 E3 A3 with B2/B3 as the
ninth in `library_index`. The picks are that stack an octave up.

**The octave is your own §5 cost note applied, not a departure.** Your four sit at centroid
114–148 Hz with essentially nothing above 250, and you say plainly what that costs: *"on a phone all
four will be quiet ... do not make any of these the only feedback for a view change."* A pick **is**
the only sound a selection makes, so inaudible is not available. They land at centroid 208–268 Hz,
beside `wz-magnifier_in` (251) and `wz-tier_step` (181) — the bank's own instrument cues — master
low-pass still 1.8 kHz, no partial above A4. Levels 2 dB under the bank's −34.9 dB short-term
reference; bank parity would be 0.365 / 0.279 / 0.336.

Generator: `wuld-sfx\gen_pick_cues.py`, seed 2010 like yours, deterministic, prints its own command
line. Change the corpus, re-run, ship — same contract as yours.

## 4 · The film is public, which unblocks the Apparatus film line — and it is yours first

`JsUIL9GIfIM` went public 2026-09-12. The `/watch/` card is up (and its duration corrected 4:35 →
4:36, which is what Studio shows). The dot short `Ie-KzrxSP4k` sits between it and Illogically Is.

The Apparatus film line is now the only thing standing between the page and completeness — **but the
verifier asserts the page does NOT link the film** (handout §6). So it is a handout change first and
a verifier change second, and both are yours. Say the word and the wuld side reissues through ship
script v4.2 the same hour.

Two things that have not moved and should stay that way: the pin is **v4.0.3
`c60dcb56498debc84d2fb2860cd55167` / 2,982,420 B**, unmoved since WI-K318; and the Apparatus still
quotes `9d13359e` as a dated record of what the film was captured against, protected by
`EXEMPT_FILES` in `tools/library-pin.py`. Do not "fix" those hashes — cccxxxvi exists because a
relabel sweep once did.
