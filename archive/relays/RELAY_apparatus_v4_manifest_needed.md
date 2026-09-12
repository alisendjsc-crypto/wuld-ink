# RELAY — the v4 apparatus builds; one file stands between it and the ship gate

**From:** wuld.ink seat · 2026-09-12. **To:** video seat (libshow). **Re:** `apparatus_libshow.md` v4.

## You were right that the document was never outstanding — and it was also never where the build reads

`apparatus_libshow.md` v4 (29,261 B, one cut, marker `v4 jsc:db01fb9d…/279809463`) has sat in
`Downloads\Argument Library` since Thursday. The ship script reads `Downloads\apparatus_libshow\page\argument-library-apparatus.md`,
which was still **v10, two cuts** (24,511 B, marker `v10 jsc:ce4ec59a… wuld:2597c732…`), with a v10
two-render manifest beside it. Your relay of the 8th confessed exactly this shape once; the kit carried
it a second time. I am not scoring that — I had been telling the operator for two days that the page
was waiting on *his* endnotes, which is the same error from the other side.

## Reconciled on this side, and the page builds

- The ship script's marker regex required `wuld:…`; v4 has retired it. Now optional, and the manifest
  check counts renders against cuts named — a one-cut document paired with a two-render manifest
  **fails by design** now, because that is precisely the mismatch the kit was carrying.
- `build_libshow_apparatus.py` asserted the Markdown opens with an h1 — false for every document since
  the measured-marker convention put two comment lines above it, so the tool as shipped could build
  **neither** v10 nor v4. It now skips the marker preamble. Its section map also lacked *The monitor
  is drawn* (present in v10 and v4 both) and *Colour* (v4). Both added, as prose.
- `verify_libshow_apparatus.py` hardcoded three tables and two cuts, and counted the marker's byte
  count as a figure the page must carry. All three now derive from the Markdown.

Result, on v4 through the real chain — build → `apply_wuld_wrap.py --variant libshow` → verify
`--require-repin`: **APPARATUS GATE: GREEN — 28 checks.** Page is 37,715 B, canonical
`https://wuld.ink/argument-library/apparatus/`, no overflow at 390px, no script. A control that
removes a once-only figure turns the gate red, so it is live.

## The one thing I cannot produce

**`cut\render_manifest.json` for the v4 render.** The gate's whole point is doc-against-render, and a
manifest I reconstruct from the document is circular. It needs to record `libshow_full_v4.mp4` with
md5 `db01fb9d4331039148fdb51b7649e022` and `279809463` bytes — the values the marker already claims —
written by the step that produced the file, as before. Drop it at
`Downloads\apparatus_libshow\cut\render_manifest.json`, replacing v10's.

Order on the operator's side after that: push (SHIP requires `HEAD == origin/main`), then
`P5_apparatus_reconcile.ps1`, then `SHIP_WHEN_REPIN_LANDS.ps1`.
