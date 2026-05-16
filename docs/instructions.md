# Using the efilist argument library

A short utility guide. The README is the door; this file is the room.

---

## Open it

The whole library is one file: **`combined.html`**. Open it in any modern browser — no server, no build step, works offline. Three surfaces live behind an outer hash router:

- `#/library` — the taxonomy, dependency graph, and force-directed Map 1
- `#/rwe` — the real-world-examples table
- `#/coda` — the closing artifact on the load-bearing axiom

You can deep-link to any surface by appending the hash fragment to the file URL.

---

## The four archetypes

Map 1 renders the objection space across four interlocutor modes:

- **sophisticate** — pivots via shared premises and shared mechanisms.
- **defender** — surfaces mechanism with two-mechanism disclosure.
- **drifter** — moves by pattern, often across mechanisms.
- **blended** — composite mode with per-mode rationales and convergence-tier accounting.

Edge distribution across the **78 source-keys** (v3.7.1 attestation):
**675 sophisticate, 526 defender, 390 drifter, 1,295 blended — 2,886 total.**

The behavioral content lives in each edge's `rationale` field (or `mode_rationales` for blended edges). Each edge walks the specific move from one objection to the next within that archetype's mode. The patterns are easier to see than to summarize — work the map.

---

## The dependency graph

91 nodes: 78 objections + 13 premises (9 foundational, 4 diagnostic). 245 links, of which 161 are strong (load-bearing) and 84 are weak (softer relevance).

Strong vs. weak is a separate axis from tier. An objection's tier categorizes the objection itself; a link's strength is a property of how tightly that objection depends on the premise (or another objection) at the other end of the link.

The mechanism graph is a separate view: 112 nodes (34 mechanisms + 78 objections), 133 links.

---

## Real-world examples

`#/rwe` carries **136 attested real-world deployments** of objections in live discourse — institutional writing, lifestyle explainers, student journalism, social platforms, niche forums. They are evidence that the catalogued moves occur in the wild, not constructed illustrations.

**Schema:** `real_world_examples_schema_v1_6.json` (`spec_id: real_world_examples_schema_v1`, `spec_version: 1.6`). The authoritative store is the corpus JSON at JSON-path `$.realWorldExamples`; per-objection indices and the JSX embedding are derived views.

Each example record carries, among other fields:

- `instance_id` — unique, pattern-recommended identifier
- `attached_objections` — which catalogued objection(s) the deployment instantiates (≥1)
- `source_url`, `source_title`, `source_byline`, `source_publication`, `source_date`, `accessed_date`, `archive_url` — provenance and decay-resistance
- `short_quote_under_15_words` + `paraphrased_summary` — bounded excerpt plus a paraphrase (the under-15-word cap is a schema-enforced quotation discipline)
- `rhetorical_move_observed`, `instance_polarity`, `frame_inversion`, `layer_skepticism` — what the move *does*
- `speaker_type`, `archetype_signal_observed`, `archetype_signal_rationale` — which interlocutor archetype the source reads as, and why
- `corpus_decay_risk`, `short_quote_attestation_status`, `verbatim_recovery_status` — integrity / link-rot tracking

The schema's `validation_rules` block is what the validator exercises against the table; the under-15-word quotation bound and required-provenance fields are enforced there, not by convention.

---

## A reading order

The library doesn't enforce a path. If you want one:

1. Open `combined.html`. On `#/library`, pick a tier 1 or tier 2 objection. Read the responses.
2. Follow a few archetype transitions outward. Notice how the four modes pivot differently from the same starting node.
3. Cross to `#/rwe` and find a deployment attached to that objection. See the move in the wild.
4. Open `#/coda` *after* — not before — the taxonomy feels familiar. The coda makes the load-bearing axiom explicit.
5. Return to the library with the coda's framing in mind.

---

## Programmatic use

The regenerable sources behind the single file are not deprecated:

- **Corpus:** `efilist_argument_library_v3_7_post_cluster_insertion_inmendham.json`.
  Top-level keys: `version`, `generated`, `totalEntries`, `totalResponses`, `tiers`, `objections`, `dependencyGraph`, `premiseDependencyMatrix`, `premises`, `realWorldExamples`, `registered_moves`, `features`. `totalEntries` 78, `totalResponses` 238.
- **RWE schema:** `real_world_examples_schema_v1_6.json`.
- **Validator:** `v3prime_validator_v1_6.py`. Confirm integrity:
  ```
  python3 v3prime_validator_v1_6.py --self-test
  ```
  Expect `13/13 PASS` and `_overall_pass: true`.

The denormalized React sibling `efilist_argument_library_v3_7_post_surface_parity_jsx.jsx` carries `registered_moves` and `realWorldExamples` as top-level constants for tooling that prefers JSX over JSON ingestion. Content is byte-identical to the corpus JSON's corresponding fields.

---

## Verifying integrity

`release_manifest_v3_7_1.json` carries md5/sha256 for the release set. The single-file contract is:

```
md5sum combined.html        # -> dd2abd01a43c2f173c98aa1b8c88bcbb
stat -c %s combined.html    # -> 2234272
```

A mismatch usually means line-ending conversion on a cross-platform pull. The repo's `.gitattributes` enforces LF; if you've sidestepped it, restore from the `v3.7.1` release tag.

---

## Reporting

Archived stable at v3.7.1. No maintenance cadence. Open an issue if something seems off, but expect resolution only via an operator-elective follow-up session — not a patch release.
