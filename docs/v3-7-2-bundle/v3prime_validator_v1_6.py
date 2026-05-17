#!/usr/bin/env python3
"""
v3prime_validator_v1_6.py
=========================

Canonical mechanical implementation of schema v1.6 validation rules for the
efilist_argument_library project. Additive superset of v3prime_validator.py
(schema v1.5): retains the v3' rule logic unchanged and adds three new
blocking rules (v18, v19, v20) covering the v1.6 speaker-attestation field
extension.

SCHEMA VERSION COVERAGE
-----------------------

This validator covers BOTH:
  - schema v1.5 rule v3' (one quote per source per objection set), CASE-A
    literal reading. Logic inlined from v3prime_validator.py for portability;
    sync-discipline: if v3' rule is amended in /mnt/project/v3prime_validator.py,
    update the copy below.
  - schema v1.6 rules v18 / v19 / v20 covering the three new speaker-
    attestation fields (short_quote_attestation_status, speaker_attestation_basis,
    verbatim_recovery_status).

ADDITIVE BEHAVIOR ON v1.5-CONFORMANT ENTRIES
---------------------------------------------

v1.5-conformant entries lack the three v1.6 fields entirely. Per the schema
v1.6 default-value rules:
  - missing short_quote_attestation_status -> treated as "verbatim_verified"
  - missing verbatim_recovery_status        -> treated as "anchored"
  - missing speaker_attestation_basis       -> treated as null/absent

Under these defaults, v1.5-conformant entries satisfy all three new rules
trivially: enum-range checks (v18, v19) pass for absent fields; the
conditional-required rule (v20) is vacuously satisfied because
short_quote_attestation_status defaults to verbatim_verified, which does not
require speaker_attestation_basis. The validator therefore reports zero
v1.6-rule violations against any v1.5-conformant corpus.

This is the intended additive-validation semantics: v1.6 deployment does not
require retroactive per-entry mutation of v1.5 corpus content.

USAGE
-----

    # Validate the canonical project JSON
    python3 v3prime_validator_v1_6.py /path/to/efilist_argument_library.json

    # Validate any realWorldExamples-bearing JSON (batch file, post-merge snapshot)
    python3 v3prime_validator_v1_6.py /path/to/snapshot.json

    # Self-test
    python3 v3prime_validator_v1_6.py --self-test

    # Exit code: 0 if compliant under v1.6 (zero blocking violations across all
    # rules); 1 if any blocking violation present.

    # As a module:
    from v3prime_validator_v1_6 import (
        validate_v3_prime,
        validate_v1_6_attestation_fields,
        run_synthetic_tests,
        run_v1_6_synthetic_tests,
    )

CROSS-FIELD COHERENCE
---------------------

The v1.6 schema deliberately does NOT commit cross-field coherence rules
(e.g. verbatim_verified x search_exhausted as a contradiction) to blocking
validation. These are flagged as Q_v1_6_cross_field_coherence_rules for
cluster-insertion-session empirical review. This validator does not enforce
them at v1.6 cut.

ORIGIN
------

Schema v1.5 v3' logic ported from /mnt/project/v3prime_validator.py
(session 4k-m / 4k-v canonical operational lock).
v1.6 attestation rules added in session schema-extension per the
speaker_attestation_extension_discipline_directive registered in canon v21.0
and codified in real_world_examples_schema_v1_6.json.
"""

from __future__ import annotations
import json
import sys
from typing import Any


# =============================================================================
# SCHEMA v1.5: rule v3' (one quote per source per objection set)
# =============================================================================
# Sync-discipline note: this block mirrors v3prime_validator.py. If the v1.5
# canonical validator is amended, propagate the change here.

def _objection_ids(record: dict[str, Any]) -> set[str]:
    """Extract the set of objection_id strings from a record's attached_objections list."""
    out: set[str] = set()
    for a in record.get("attached_objections", []) or []:
        oid = a.get("objection_id")
        if isinstance(oid, str) and oid:
            out.add(oid)
    return out


def _is_quote_bearing(record: dict[str, Any]) -> bool:
    """A record is quote-bearing iff short_quote_under_15_words is a non-empty string."""
    q = record.get("short_quote_under_15_words", None)
    return isinstance(q, str) and len(q) > 0


def validate_v3_prime(records: list[dict[str, Any]]) -> list[tuple[int, int, str, list[str]]]:
    """
    Apply rule v3' (CASE-A) to a list of realWorldExamples records.

    Returns
    -------
    list of (i1, i2, source_url, sorted intersecting objection_ids) tuples,
    one per violating pair. Empty list iff the corpus is v3'-compliant.
    """
    violations: list[tuple[int, int, str, list[str]]] = []
    buckets: dict[str, list[int]] = {}
    for i, r in enumerate(records):
        if not _is_quote_bearing(r):
            continue
        url = r.get("source_url")
        if not isinstance(url, str) or not url:
            continue
        buckets.setdefault(url, []).append(i)
    for url, idxs in buckets.items():
        m = len(idxs)
        if m < 2:
            continue
        for a in range(m):
            for b in range(a + 1, m):
                i1, i2 = idxs[a], idxs[b]
                s1 = _objection_ids(records[i1])
                s2 = _objection_ids(records[i2])
                overlap = s1 & s2
                if overlap:
                    violations.append((i1, i2, url, sorted(overlap)))
    return violations


# =============================================================================
# SCHEMA v1.6: attestation-field rules (v18, v19, v20)
# =============================================================================

V1_6_ATTESTATION_STATUS_VALUES = frozenset({
    "verbatim_verified",
    "speaker_attributed_unverified",
    "paraphrased_summary",
})

V1_6_RECOVERY_STATUS_VALUES = frozenset({
    "anchored",
    "search_exhausted",
    "deferred_corpus_scale_infeasible",
})

V1_6_NON_DEFAULT_STATUS_VALUES = frozenset({
    "speaker_attributed_unverified",
    "paraphrased_summary",
})


def _has_field(record: dict[str, Any], key: str) -> bool:
    """A field is 'present' iff the key exists AND its value is not None."""
    return key in record and record[key] is not None


def _attestation_status_or_default(record: dict[str, Any]) -> str:
    """Read short_quote_attestation_status with default-value semantics."""
    v = record.get("short_quote_attestation_status", None)
    if v is None:
        return "verbatim_verified"
    return v


def _recovery_status_or_default(record: dict[str, Any]) -> str:
    """Read verbatim_recovery_status with default-value semantics."""
    v = record.get("verbatim_recovery_status", None)
    if v is None:
        return "anchored"
    return v


def validate_v1_6_attestation_fields(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Apply schema v1.6 rules v18, v19, v20 to a list of realWorldExamples records.

    Rule v18: short_quote_attestation_status, if present, must be in the enum
              {verbatim_verified, speaker_attributed_unverified, paraphrased_summary}.
              Absent / null is acceptable (default verbatim_verified).

    Rule v19: verbatim_recovery_status, if present, must be in the enum
              {anchored, search_exhausted, deferred_corpus_scale_infeasible}.
              Absent / null is acceptable (default anchored).

    Rule v20: If short_quote_attestation_status (with default applied) is in
              {speaker_attributed_unverified, paraphrased_summary}, then
              speaker_attestation_basis must be present and a non-empty string.

    Returns
    -------
    list of violation dicts, each with keys:
      - record_index   (int, 0-based position in `records`)
      - instance_id    (str | None, copied from record if present)
      - rule_id        (str: 'v18_short_quote_attestation_status_enum' |
                              'v19_verbatim_recovery_status_enum' |
                              'v20_speaker_attestation_basis_required_when_status_non_default')
      - severity       (str: 'blocking')
      - observed_value (the offending value, or null/missing marker)
      - detail         (str: human-readable explanation)
    Empty list iff the corpus is v1.6-compliant on these three rules.
    """
    violations: list[dict[str, Any]] = []
    for i, r in enumerate(records):
        iid = r.get("instance_id")

        # v18 ----------------------------------------------------------------
        if _has_field(r, "short_quote_attestation_status"):
            v = r["short_quote_attestation_status"]
            if v not in V1_6_ATTESTATION_STATUS_VALUES:
                violations.append({
                    "record_index": i,
                    "instance_id": iid,
                    "rule_id": "v18_short_quote_attestation_status_enum",
                    "severity": "blocking",
                    "observed_value": v,
                    "detail": (
                        f"short_quote_attestation_status='{v}' is not in the enum "
                        f"{sorted(V1_6_ATTESTATION_STATUS_VALUES)}."
                    ),
                })

        # v19 ----------------------------------------------------------------
        if _has_field(r, "verbatim_recovery_status"):
            v = r["verbatim_recovery_status"]
            if v not in V1_6_RECOVERY_STATUS_VALUES:
                violations.append({
                    "record_index": i,
                    "instance_id": iid,
                    "rule_id": "v19_verbatim_recovery_status_enum",
                    "severity": "blocking",
                    "observed_value": v,
                    "detail": (
                        f"verbatim_recovery_status='{v}' is not in the enum "
                        f"{sorted(V1_6_RECOVERY_STATUS_VALUES)}."
                    ),
                })

        # v20 ----------------------------------------------------------------
        status = _attestation_status_or_default(r)
        if status in V1_6_NON_DEFAULT_STATUS_VALUES:
            basis = r.get("speaker_attestation_basis", None)
            if not (isinstance(basis, str) and len(basis) > 0):
                violations.append({
                    "record_index": i,
                    "instance_id": iid,
                    "rule_id": "v20_speaker_attestation_basis_required_when_status_non_default",
                    "severity": "blocking",
                    "observed_value": basis,
                    "detail": (
                        f"short_quote_attestation_status='{status}' (non-default) "
                        f"requires speaker_attestation_basis to be a non-empty string; "
                        f"observed: {basis!r}."
                    ),
                })

    return violations


# =============================================================================
# Self-tests
# =============================================================================

def run_synthetic_tests() -> dict[str, Any]:
    """
    Reproduce the 4 hand-constructed synthetic cases from session 4k-m for v3'
    (unchanged from v3prime_validator.py / canon invariant
    schema_v1_5_v3_prime_synthetic_test_executed_session_4k_m).
    """
    cases = {
        "A_same_url_same_objection_both_quoted": {
            "records": [
                {"source_url": "u1", "short_quote_under_15_words": "q1",
                 "attached_objections": [{"objection_id": "o1"}]},
                {"source_url": "u1", "short_quote_under_15_words": "q2",
                 "attached_objections": [{"objection_id": "o1"}]},
            ],
            "expected_violation": True,
        },
        "B_same_url_distinct_objection_both_quoted": {
            "records": [
                {"source_url": "u1", "short_quote_under_15_words": "q1",
                 "attached_objections": [{"objection_id": "o1"}]},
                {"source_url": "u1", "short_quote_under_15_words": "q2",
                 "attached_objections": [{"objection_id": "o2"}]},
            ],
            "expected_violation": False,
        },
        "C_same_url_set_intersection_one_overlap_both_quoted": {
            "records": [
                {"source_url": "u1", "short_quote_under_15_words": "q1",
                 "attached_objections": [{"objection_id": "o1"}, {"objection_id": "o2"}]},
                {"source_url": "u1", "short_quote_under_15_words": "q2",
                 "attached_objections": [{"objection_id": "o2"}, {"objection_id": "o3"}]},
            ],
            "expected_violation": True,
        },
        "D_same_url_same_objection_one_quote_null": {
            "records": [
                {"source_url": "u1", "short_quote_under_15_words": "q1",
                 "attached_objections": [{"objection_id": "o1"}]},
                {"source_url": "u1", "short_quote_under_15_words": None,
                 "attached_objections": [{"objection_id": "o1"}]},
            ],
            "expected_violation": False,
        },
    }
    results: dict[str, Any] = {}
    all_pass = True
    for name, case in cases.items():
        v = validate_v3_prime(case["records"])
        observed = len(v) > 0
        expected = case["expected_violation"]
        passed = observed == expected
        if not passed:
            all_pass = False
        results[name] = {
            "expected_violation": expected,
            "observed_violation": observed,
            "violation_pairs": v,
            "pass": passed,
        }
    results["_overall_pass"] = all_pass
    return results


def run_v1_6_synthetic_tests() -> dict[str, Any]:
    """
    Synthetic cases for v1.6 attestation-field rules. Each case targets a
    specific (rule_id, expected-pass-or-fail) tuple.

        E: v1.5-conformant record (no v1.6 fields)             -> expected 0 violations
        F: v18 ENUM-OOR on short_quote_attestation_status      -> expected 1 violation (v18)
        G: v19 ENUM-OOR on verbatim_recovery_status            -> expected 1 violation (v19)
        H: v20 status=speaker_attributed_unverified, basis missing  -> expected 1 violation (v20)
        I: v20 status=paraphrased_summary, basis missing       -> expected 1 violation (v20)
        J: v20 status=verbatim_verified, basis missing         -> expected 0 violations (vacuous-satisfaction)
        K: v20 status=speaker_attributed_unverified, basis present -> expected 0 violations
        L: combined v18+v20: enum-OOR status + basis missing    -> expected 1 violation (v18 only; v20 with default applied is vacuous)
        M: combined v19+v20: enum-OOR recovery + status=paraphrased_summary + basis present -> expected 1 violation (v19 only)
    """
    cases = {
        "E_v1_5_conformant_no_v1_6_fields": {
            "records": [
                {"instance_id": "e1", "source_url": "u1",
                 "short_quote_under_15_words": "q",
                 "attached_objections": [{"objection_id": "o1"}]},
            ],
            "expected_violation_rules": [],
        },
        "F_v18_enum_oor_status": {
            "records": [
                {"instance_id": "f1",
                 "short_quote_attestation_status": "not_a_valid_enum_value"},
            ],
            "expected_violation_rules": ["v18_short_quote_attestation_status_enum"],
        },
        "G_v19_enum_oor_recovery": {
            "records": [
                {"instance_id": "g1",
                 "verbatim_recovery_status": "not_a_valid_recovery_value"},
            ],
            "expected_violation_rules": ["v19_verbatim_recovery_status_enum"],
        },
        "H_v20_speaker_attributed_unverified_basis_missing": {
            "records": [
                {"instance_id": "h1",
                 "short_quote_attestation_status": "speaker_attributed_unverified"},
            ],
            "expected_violation_rules": [
                "v20_speaker_attestation_basis_required_when_status_non_default"
            ],
        },
        "I_v20_paraphrased_summary_basis_missing": {
            "records": [
                {"instance_id": "i1",
                 "short_quote_attestation_status": "paraphrased_summary"},
            ],
            "expected_violation_rules": [
                "v20_speaker_attestation_basis_required_when_status_non_default"
            ],
        },
        "J_v20_verbatim_verified_basis_missing_vacuous_pass": {
            "records": [
                {"instance_id": "j1",
                 "short_quote_attestation_status": "verbatim_verified"},
            ],
            "expected_violation_rules": [],
        },
        "K_v20_non_default_basis_present_pass": {
            "records": [
                {"instance_id": "k1",
                 "short_quote_attestation_status": "speaker_attributed_unverified",
                 "speaker_attestation_basis": "operator has viewed >100 instances..."},
            ],
            "expected_violation_rules": [],
        },
        "L_v18_oor_status_v20_default_applied_vacuous": {
            # OOR status => v18 fires; default does NOT apply to an OOR value
            # for v20 logic, but the spec semantics are: v20 reads
            # _attestation_status_or_default which returns the OOR value as-is
            # (not the default). Thus v20 evaluates the OOR string and finds
            # it not in NON_DEFAULT_STATUS_VALUES, so v20 is vacuous. Only v18
            # fires.
            "records": [
                {"instance_id": "l1",
                 "short_quote_attestation_status": "not_valid"},
            ],
            "expected_violation_rules": ["v18_short_quote_attestation_status_enum"],
        },
        "M_v19_oor_recovery_status_non_default_basis_present": {
            "records": [
                {"instance_id": "m1",
                 "short_quote_attestation_status": "paraphrased_summary",
                 "speaker_attestation_basis": "composite reconstruction...",
                 "verbatim_recovery_status": "not_valid"},
            ],
            "expected_violation_rules": ["v19_verbatim_recovery_status_enum"],
        },
    }
    results: dict[str, Any] = {}
    all_pass = True
    for name, case in cases.items():
        violations = validate_v1_6_attestation_fields(case["records"])
        observed_rules = sorted({v["rule_id"] for v in violations})
        expected_rules = sorted(case["expected_violation_rules"])
        passed = observed_rules == expected_rules
        if not passed:
            all_pass = False
        results[name] = {
            "expected_violation_rules": expected_rules,
            "observed_violation_rules": observed_rules,
            "violation_count": len(violations),
            "violations": violations,
            "pass": passed,
        }
    results["_overall_pass"] = all_pass
    return results


# =============================================================================
# CLI
# =============================================================================

def _main(argv: list[str]) -> int:
    if "--self-test" in argv:
        v15_out = run_synthetic_tests()
        v16_out = run_v1_6_synthetic_tests()
        combined = {
            "v3_prime_self_test": v15_out,
            "v1_6_attestation_self_test": v16_out,
            "_overall_pass": v15_out["_overall_pass"] and v16_out["_overall_pass"],
        }
        print(json.dumps(combined, indent=2))
        return 0 if combined["_overall_pass"] else 1

    if len(argv) < 2:
        print(__doc__)
        print("\nERROR: pass a JSON file path or --self-test.", file=sys.stderr)
        return 2

    path = argv[1]
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        records = data
    elif isinstance(data, dict) and "realWorldExamples" in data:
        records = data["realWorldExamples"]
    else:
        print("ERROR: input must be a list or an object containing key 'realWorldExamples'.",
              file=sys.stderr)
        return 2

    v3_violations = validate_v3_prime(records)
    v1_6_violations = validate_v1_6_attestation_fields(records)

    report = {
        "input_path": path,
        "record_count": len(records),
        "quote_bearing_record_count": sum(1 for r in records if _is_quote_bearing(r)),
        "schema_v1_5_v3_prime": {
            "rule_id": "v3_one_quote_per_source_per_objection_set",
            "reading": "CASE-A (literal; both records must be quote-bearing)",
            "violation_pair_count": len(v3_violations),
            "violations": [
                {"i1": i1, "i2": i2, "source_url": url, "intersecting_objection_ids": ov}
                for (i1, i2, url, ov) in v3_violations
            ],
        },
        "schema_v1_6_attestation_fields": {
            "rule_ids": [
                "v18_short_quote_attestation_status_enum",
                "v19_verbatim_recovery_status_enum",
                "v20_speaker_attestation_basis_required_when_status_non_default",
            ],
            "default_application_note": (
                "Absent short_quote_attestation_status treated as 'verbatim_verified'; "
                "absent verbatim_recovery_status treated as 'anchored'. v1.5-conformant "
                "entries (which lack all three v1.6 fields) satisfy v18/v19/v20 trivially."
            ),
            "violation_count": len(v1_6_violations),
            "violations": v1_6_violations,
        },
        "verdict": (
            "PASS (zero blocking violations across v3' and v1.6 attestation rules)"
            if not (v3_violations or v1_6_violations) else
            "FAIL (blocking violations present)"
        ),
    }
    print(json.dumps(report, indent=2))
    return 0 if not (v3_violations or v1_6_violations) else 1


if __name__ == "__main__":
    sys.exit(_main(sys.argv))
