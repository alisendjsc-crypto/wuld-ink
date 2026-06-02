# Library release manifest + pin handoff (standing contract)

**Purpose:** kill the per-release archaeology. Every EFIList library release ships
one machine-readable manifest (`release_vX.json`); the push, the verify, and the
wuld.ink pin all read it. No truncated hashes in prose, no hunting for staged
scripts, no guessing two-branch git logic. Authored K47 after a release where the
push script never hit disk and three stale scripts had to be read to rule out.

This is what lets library-Claude and the operator stay on the philosophy: the
mechanical relay becomes four deterministic steps with the manifest as contract.

---

## The manifest: `release_vX.json` (library-Claude writes it)

Library-Claude already computes every value below during its fold + self-test.
Dumping them to one file instead of into chat prose IS the whole optimization.

```jsonc
{
  "release": "v3.8.5r",                  // wuld.ink display label (v3.8.x convention, NOT canon 37.x)
  "canon": { "version": "37.9", "bump": "MINOR", "invariant_block_changed": false },
  "git":   { "baseline": "3735f7b", "branches": ["main","v3.8.x"], "parity_required": true },
  "surfaces": {
    "combined_v3_8_0.html": { "md5": "<full 32-hex>", "size_bytes": 2349783, "status": "PROVEN" },
    "index_...":            { "md5": "PENDING" },     // operator fills post-preflight
    "...jsx / json / ledger / canon": { "md5": "PENDING" }
  },
  "pin": {
    "old": "<full 32-hex currently live>",
    "new": "<full 32-hex of the new combined>",
    "rule": "move ONLY after live combined == new (deploy must land first)"
  },
  "commit_message": "<full commit body library-Claude wants>"
}
```

Rules:
- **Full hashes only.** Never truncate (`53db35a4...`) -- the consumers do exact compares.
- `pin.old` MUST equal the value currently in `tools/library-pin-state.json`. The
  pin script aborts if they disagree (catches a stale state file or a skipped release).
- `release` is the **wuld.ink label** (`v3.8.5r`), distinct from `canon.version` (37.9).
- PENDING per-file md5s are filled by the operator after `preflight` (the values
  can't be computed off-tree without risking whitespace-diverged false hashes).

---

## The release flow (four steps, no archaeology)

1. **library-Claude** folds + writes `release_vX.json` (PENDING md5s allowed).
2. **operator** runs the read-only `preflight_vX.ps1` in the library repo -> pastes
   the report (gates + `git status` + `git branch -vv`) back to library-Claude, who
   finalizes the commit+push tail against the *actual* branch topology. Operator
   fills the PENDING md5s into the manifest with the one-liner preflight prints.
3. **operator** runs the finalized push (commits the fold; pushes `main` + `v3.8.x`
   to parity) -> Cloudflare Pages deploys.
4. **operator** runs `tools/verify-live-library.ps1 -Manifest release_vX.json`.
   When it says **GREEN**, **Cowork** runs `python3 tools/library-pin.py
   --manifest release_vX.json --apply`. Done.

The pin step is **gated in code**: `library-pin.py` refuses to write unless the
live bytes (fetched 3x, must agree) equal `pin.new` and differ from the current pin.
Pinning before the deploy lands is impossible by construction (the K45 lesson, as code).

---

## Gotcha baked into the tools (do not "simplify" away)

**Fetch the live file with `curl`, never urllib/requests.** Observed K47:
Cloudflare served Python's urllib a body 504 bytes larger with a different md5
(`15ca0f4b` vs the canonical `51ec8f03`), and urllib on `/combined.html` got a 403.
The canonical md5 and the operator's `curl.exe` verify both speak curl; the gate
must read the same bytes or it will never agree with reality. `library-pin.py`
shells out to curl on purpose; `verify-live-library.ps1` uses `curl.exe`.

**Multi-fetch agreement.** A single fetch can catch an edge-cache transient. Both
tools fetch 3x and require all identical before declaring GREEN.

---

## Files

| File | Who runs it | What it does |
|---|---|---|
| `release_vX.json` | library-Claude writes | single source of truth for the release |
| `preflight_vX.ps1` | operator (library repo) | read-only gate check + topology report |
| `tools/library-pin.py` | Cowork (sandbox) | gate-enforced wuld.ink pin-move (md5+version+bytecount+releases.json+feed) |
| `tools/verify-live-library.ps1` | operator (native) | GREEN/STILL/UNEXPECTED/UNSTABLE against the manifest |
| `tools/library-pin-state.json` | auto | the currently-live pin; read+rewritten by library-pin.py |
