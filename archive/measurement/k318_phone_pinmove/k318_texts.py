"""k318_texts.py -- the v4.0.3 text edits: README.md, CHANGELOG.md, the corpus JSON's version field, the front door's badge.
Exact-once replacements over the HEAD copies (md5-gated); writes into ../build/. usage: python k318_texts.py"""
import sys, hashlib, pathlib, re
SRC = pathlib.Path('/home/claude/k318/efilist'); DST = pathlib.Path('/home/claude/k318/build')
NEW_MD5 = '62c733ac8263e6413816cfb6d28e3b8a'; NEW_BYTES = 2982420; NEW_BYTES_FMT = '2,982,420'; DELTA = 8381
OLD_MD5 = '62d1e8d86056465ebcb5daced38e0a83'; OLD_BYTES_FMT = '2,974,039'
DATE = '2026-09-12'
IN = {'README.md': ('4c9a61597b793b48faddcf5c4e391e54', 16379), 'CHANGELOG.md': ('ce4591c6d38b116883b4026d37986e6a', 24635),
      'efilist_argument_library_v4_0_0.json': ('a922ba4914608842f328830284ddc3f0', 1333912), 'libraries/index.html': ('e6442297aa2f34bd1762c8bfc0052e58', 15331)}
built = pathlib.Path('/home/claude/k318/harness/build/combined.html').read_bytes()
assert hashlib.md5(built).hexdigest() == NEW_MD5 and len(built) == NEW_BYTES, 'build/combined.html is not the candidate this text describes'

def load(name):
    b = (SRC / name).read_bytes(); h = hashlib.md5(b).hexdigest()
    if (h, len(b)) != IN[name]: sys.exit(f'ABORT: {name} is {h} / {len(b)}, expected {IN[name]}')
    s = b.decode('utf-8'); assert '\r\n' not in s; return s
def save(name, s):
    p = DST / name; p.parent.mkdir(parents=True, exist_ok=True); p.write_bytes(s.encode('utf-8'))
    b = p.read_bytes(); print(f'{name:40s} {hashlib.md5(b).hexdigest()}  {len(b):>9,} B')
def once(s, old, new, label):
    n = s.count(old)
    if n != 1: sys.exit(f'ABORT: "{label}" matches {n} times')
    return s.replace(old, new, 1)

# ---- README ---------------------------------------------------------------------------------------------
r = load('README.md')
r = once(r, "| Version (pin) | `v4.0.2` |\n| md5 | `62d1e8d86056465ebcb5daced38e0a83` |\n| Size | `2,974,039` bytes |",
            f"| Version (pin) | `v4.0.3` |\n| md5 | `{NEW_MD5}` |\n| Size | `{NEW_BYTES_FMT}` bytes |", 'pin table')
r = once(r, "flagship · pinned v4.0.2 |", "flagship · pinned v4.0.3 |", 'suite table badge')
r = once(r, "**Stable at v4.0.2** (canon v38.1 line).", "**Stable at v4.0.3** (canon v38.1 line).", 'status')
r = once(r, "v4.0.1 re-stamped stale display strings; v4.0.2 integrated the presentation layer and brought every HTML text colour to WCAG AA in both grounds (the graph views' SVG labels are the remaining carry). Neither touched the corpus.",
            "v4.0.1 re-stamped stale display strings; v4.0.2 integrated the presentation layer and brought every HTML text colour to WCAG AA in both grounds; v4.0.3 laid the page out for phones (one media block at 600px and under: the shared nav, the library's control rows, the graph canvases, the argument flow's columns, the examples' filter bar — measured to zero overflow at 390, 360 and 430 wide in both grounds) and brought the graph views' SVG labels to AA against the ground each is painted on, so every text colour on the page now reads at AA in both grounds, the graphs' dimmed de-emphasis states excepted. None of the three touched the corpus.", 'status sentence')
save('README.md', r)

# ---- CHANGELOG -------------------------------------------------------------------------------------------
c = load('CHANGELOG.md')
ENTRY = f"""## [v4.0.3] — {DATE}

**PATCH** by the invariants convention at the top of this file — the invariants subtree is byte-identical and no content changed. (v4.0.1 called the same condition MINOR; this entry, like v4.0.2's, follows the definitions.) The flagship is laid out for phones, and the graph views' SVG labels — the carry named under v4.0.2 — are brought to WCAG AA on the ground each is painted on. **No content change.** The corpus, the grading ledger, both graph literals, the argument-flow matrix, the real-world-examples data and every response are byte-unchanged (`OBJECTIONS`, `REAL_WORLD_EXAMPLES`, `MAP1_TRANSITIONS`, `DEP_GRAPH_DATA`, `MAP_GRAPH_DATA` and the `rwe-data` block compared literal for literal); the objections index is unchanged (`d034af15…`).

**Why a new version.** The same rule as v4.0.1 and v4.0.2: one version maps to one hash. The phone block and the fills moved the pinned file, so the pin moved; a copy that hashes to `62d1e8d8…` is v4.0.2, diagnosable, not corrupt.

| | md5 | bytes |
|---|---|---|
| superseded — v4.0.0 | `e654eabd32fa95e5969d49e6eb15aa87` | 2,963,752 |
| superseded — v4.0.1 | `9d13359e305c6caa3ae64759f3dcc0e6` | 2,963,789 |
| superseded — v4.0.2 | `{OLD_MD5}` | {OLD_BYTES_FMT} |
| **current — v4.0.3** | **`{NEW_MD5}`** | **{NEW_BYTES_FMT}** |

### Changed

- **`combined.html`** (+{DELTA:,} B) — **the phone layout**: one `@media (max-width: 600px)` block at the end of the page's own stylesheet, nothing outside it. Measured on the v4.0.2 bytes in mobile contexts at 390×844, 360×780 and 430×932: the library view overflowed the viewport by 149 / 179 / 110 px (the view switcher's fourth tab and the RSI METHODOLOGY button off-screen, unreachable by any tap), the mechanism web and dependency graph by 145 / 175 / 104, the argument flow by 369 / 399 / 328 (a `320px | 1fr | 360px` grid), the examples and the coda by 43 / 73 / 3 (the shared nav's mode toggle). On the new bytes every one of 54 states (six views, three widths, both grounds) reads `scrollWidth − clientWidth = 0` with no element rect past the viewport; the wings and the front door stay at 0. The shared nav wraps to two rows when its five buttons do not fit and scrolls with the page instead of sticking (two sticky rows are 11% of a phone screen); the four view tabs become a 2×2 grid — all four visible at 360, where a scrolling strip would hide the fourth; the depth row wraps with its label on its own line; the graph toolbars wrap; the argument flow's three columns stack; the examples' filter bar becomes label | control rows. Every control-row button is at least 36 px tall (nav, view tabs, tier filters, depth, RSI, graph toolbars, zoom buttons, flow controls, examples tabs, selects and reset); the in-card chips (SHOW IN MAP / DEP, COPY, `[ plain ]`, `[NOTE]`, the examples badge and pills) 28 px. On the v4.0.2 bytes 96 of the library view's 107 interactive elements were under 36 px; what remains under 36 is the layer's 82 FEEDBACK controls (26 px, the layer's bytes), the wing-switcher's link (17 px, the K123 inline-styled bar shared with the wings) and the examples' `<summary>` rows (26 px, full-width). **The graph canvases** at phone width: the force layouts are tuned for the desktop canvas and drew three screens wide; on a phone each simulation is now settled synchronously and the zoom transform set to the drawing's bounding box (pinch and drag continue from there; ZOOM FIT does the same), the dependency graph is laid out on its desktop canvas (1400×900) before the fit so its nine premise boxes keep their room, the argument flow's `viewBox` becomes the drawing's bounding box so the labels around the ring stay on the canvas, and the legends start closed (open at 390 they covered half the canvas). None of this runs at 601 px and up: the desktop control (below) says so.
  **The SVG label fills** (TODO 17): every graph-view label measured against the ground it is painted on — the canvas for a label beside its dot, the family rect or the tier circle for a label on one — in all four modes and the K314 states plus the flow map's three other modes: 250 undimmed readings per ground, of which **123 (dark) and 172 (cream) were below 4.5:1**; on the new bytes **0 and 0**, minima 4.93 (dark) and 4.70 (cream, white on the empirical green). Values: the objection labels of both graphs `#555`/`#666` → `#88847c` (the wings' `--faint`, 5.32 on `#0a0a0a`) and `#777`/`#888` → `#615b50` on cream (5.52); the band labels `#333` → `#88847c`, `#999` → `#615b50`, the legible-mode pair likewise; the premise labels and their counts solid (`#e8e8e8` dark, `#fff` cream) with black on the mustard family in both grounds and on characterization in cream (`data-family` stamped on each premise group — the only DOM change); the flow map's T-badges and source label `#1a1a1a` on cream (white inside the red source node stays); the stars `#b8860b` → `#7a5c00` on cream (5.13); the "No successors" text a class with a value per ground instead of one inline `#555`. The K74 de-emphasis states (a selected node's non-neighbours at opacity .12 / .06 — 127 readings per ground) are an opacity, not a colour, and are left as the spec has them.
- **`screenshots/dependency-graph.png`** — re-captured from the new bytes at 1440×900; the only README capture the fills change (the mechanism web's objection labels are hidden until hover).
- **`libraries/index.html`** — the front-door badge `pinned v4.0.2 → v4.0.3`.
- **`README.md`** — pin table takes the v4.0.3 identifier, the new md5 and byte count; the status line names the phone layout and the AA claim widens from "every HTML text colour" to every text colour, the dimmed states excepted.
- **`efilist_argument_library_v4_0_0.json`** — `version` field only. **Filename stays frozen**, per convention.

### Controls

- **Desktop unchanged.** The nine README captures re-taken at 1440×900 from the v4.0.2 and the v4.0.3 bytes under one seeded `Math.random` with each force simulation run to rest: seven byte-identical PNGs; for the two graph captures, whose rasterization carries ±1 channel noise run to run even on the same bytes, the settled SVG DOM (every position and transform) is byte-identical for the mechanism web and identical but for the 13 `data-family` attributes for the dependency graph. The phone half alone leaves all nine desktop states unchanged; the fills change only what they name.
- **The layer is not touched** (`wuld-layer.css` `c06d2310…`, `wuld-layer.js` `89532502…`, no deploy). Checked at 360 and 390: the feedback panel opens 336 / 366 px wide inside the viewport, the tour card is 336 / 340 px, the chin's four 44 px controls sit at y 740 / 802 and cover no toggle; at the foot of every page nothing sits under the chin.
- The K316 battery (`navcheck`, `fbform`, `layerfix`, `wingtoggle`, `k317`) is GREEN on the new bytes.

### Held — deliberately not swept

- **`combined.html` L1722** — *"the original 81 objections…"* stays, for the reason given under v4.0.1.
- **The wing-switcher bar** (`.rl-wing`, inline-styled, K123) wraps to three lines at 390 and its link is 17 px tall; it is one markup in six copies and a change to it belongs with the wings.
- **The layer's FEEDBACK control** is 26 px tall on a phone; the layer is a separate deploy.
- **The graphs' phone canvases are overviews**: fitted, a 7 px label renders at 2–3 px until pinched; the source list and the detail panel carry the text.

### Open

- **Invariant defect: `DEP_GRAPH_DATA` per-node stored link sums total 245 against an actual 255** — carried from v4.0.1, unchanged.

"""
c = once(c, "---\n\n## [v4.0.2] — 2026-09-11\n", "---\n\n" + ENTRY + "## [v4.0.2] — 2026-09-11\n", 'insert v4.0.3 entry above v4.0.2')
save('CHANGELOG.md', c)

# ---- corpus JSON: version field only --------------------------------------------------------------------
j = load('efilist_argument_library_v4_0_0.json')
j = once(j, '  "version": "4.0.2",\n', '  "version": "4.0.3",\n', 'json version')
save('efilist_argument_library_v4_0_0.json', j)

# ---- front door badge ----------------------------------------------------------------------------------
i = load('libraries/index.html')
i = once(i, '<span>pinned v4.0.2</span>', '<span>pinned v4.0.3</span>', 'front-door badge')
save('libraries/index.html', i)
