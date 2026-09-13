# docs/relays/ — seat-to-seat relays and session states, verbatim

The umbrella runs on three seats and they hand work to each other as files:

- **W** — wuld.ink Cowork, this repo: the site, the session log, the pin tooling.
- **L** — library-Claude: the efilist corpus, `library.wuld.ink`, the flagship and the wings.
- **V** — the video seat: the films' kits and every figure on an apparatus page.

Everything in this folder is **committed verbatim and is never edited**. A relay is a record of
what a seat believed, measured and asked for on a date. Correcting one in place would destroy the
thing it exists for, so corrections go **forward** — a later relay, or a `CLAUDE.md` stratum that
says what it strikes. That is the same discipline the session log follows, and the reason a wrong
figure in a landed relay gets a superseding stamp rather than a silent fix.

| filename prefix | direction |
|---|---|
| `K233_` … `K235_` | L → W: the library seat's relays |
| `session_K2*_state.json` | L's own end-of-session state, as it wrote it |
| `RELAY_wuld_K3*` | W → L, or W → V |
| `RELAY_video_*` | V → W |

**Why these are here.** A handoff assumes both halves survive. Until WI-K325 the library seat's
session states lived only in `Downloads\Argument Library\` on one machine, which makes
reconstruct-from-state half-blind: this repo could show what W did and not what L had decided.
The library seat asked for the correction and it is theirs.

**Gaps are recorded, not filled.** **K232 has no file.** It was not on the machine at WI-K325 —
no `K232_*.md`, no `session_K232_state.json`, in the drop or in the Adversarial Corpus folder —
and it is owed from the library seat. Do not reconstruct it from the K234 relay that discusses it.

**Where the narrative lives.** `CLAUDE.md` is the running session log. The Exchange-numbered fold
is `docs/library-claude-coordination.md`, which stops at **Exchange 155 (2026-07-18)**. This
folder is the raw material for the fold that has not happened yet; the fold is a session of its
own and folding it does not license editing anything here.
