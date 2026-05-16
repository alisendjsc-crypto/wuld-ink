# Using the efilist argument library

A short utility guide. The README is the door; this file is the room.

---

## Open the viewer

`viewer/index_v3_7_post_b3f2_surface_parity_html.html` is a single-file SPA. Open it in any modern browser. No server, no build step, works offline. Or pull it directly from the release-asset bundle at the `v3.7.0` git tag.

---

## The four archetypes

The viewer renders the objection space across four interlocutor modes:

- **sophisticate** — pivots via shared premises and shared mechanisms.
- **defender** — surfaces mechanism with two-mechanism disclosure.
- **drifter** — moves by pattern, often across mechanisms.
- **blended** — composite mode with per-mode rationales and convergence-tier accounting.

Edge distribution across the 77 source-keys (canon v26.x): 667 sophisticate, 518 defender, 385 drifter, 1,276 blended — 2,846 total.

The behavioral content lives in the viewer's `rationale` field on each edge (or `mode_rationales` for blended edges). Each edge walks the specific move from one objection to the next within that archetype's mode. The patterns are easier to see than to summarize — work the map.

---

## The dependency graph

91 nodes: 78 objections + 13 premises (9 foundational, 4 diagnostic). 245 links, of which 161 are strong (load-bearing) and 84 are weak (softer relevance).

Strong vs. weak is a separate axis from tier. An objection's tier is a categorization of the objection itself; a link's strength is a property of how tightly that objection depends on the premise (or another objection) at the other end of the link.

---

## A reading order

The library doesn't enforce a path. If you want one:

1. Open the viewer. Pick a tier 1 or tier 2 objection. Read the responses.
2. Follow a few archetype transitions outward. Notice how the four modes pivot differently from the same starting node.
3. Open `coda/coda_v3_7.html` *after* — not before — the taxonomy feels familiar. The coda makes the load-bearing axiom explicit.
4. Return to the viewer with the coda's framing in mind.

---

## Programmatic use

- **Corpus:** `corpus/efilist_argument_library_v3_7_post_cluster_insertion_inmendham.json`.
  Top-level keys: `version`, `generated`, `totalEntries`, `totalResponses`, `tiers`, `objections`, `dependencyGraph`, `premiseDependencyMatrix`, `premises`, `realWorldExamples`, `registered_moves`, `features`.
- **RWE schema:** `schema/real_world_examples_schema_v1_6.json`.
- **Validator:** `validator/v3prime_validator_v1_6.py`. Confirm integrity:
  ```
  python3 validator/v3prime_validator_v1_6.py --self-test
  ```
  Expect `13/13 PASS` and `_overall_pass: true`.

The denormalized React sibling at `corpus/efilist_argument_library_v3_7_post_surface_parity_jsx.jsx` carries `registered_moves` and `realWorldExamples` as top-level constants for tooling that prefers JSX over JSON ingestion. Content is byte-identical to the corpus JSON's corresponding fields.

---

## Verifying integrity

`release_manifest_v3_7_stable.json` at repo root carries md5 and sha256 for all six release artifacts. After cloning or download, re-checksum:

```
md5sum corpus/* viewer/* coda/* schema/* validator/*
```

Compare to the manifest. Mismatches usually mean line-ending conversion on cross-platform pulls (the repo's `.gitattributes` enforces LF to prevent this; if you've sidestepped that, restore from the `v3.7.0` release tag).

---

## Citing

See the `README.md` **Cite** section for the BibTeX block. A `CITATION.cff` will land in a follow-up session and will enable GitHub's "Cite this repository" widget when present.

---

## Reporting

Archived stable. No maintenance cadence. Open an issue if something seems off, but expect resolution only via an operator-elective follow-up session — not a patch release.
