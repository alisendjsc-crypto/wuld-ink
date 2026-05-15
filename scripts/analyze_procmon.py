#!/usr/bin/env python3
"""
analyze_procmon.py — K17 forensic helper

Streams a Procmon .pml capture and extracts events touching the wuld-ink
.git/ tree. Designed to run Josiah-side on the 15.5 GB Procmon-K16-close.PML
capture without loading the entire file into memory.

Goal: identify the process(es) that wrote to .git\\index.lock and/or
.git\\config during the K16-close window (the leading suspect remaining
after K14's handle.exe trace is cowork-svc.exe, but the trace itself is
the only durable forensic evidence).

USAGE (Josiah-side, in PowerShell or cmd):

    pip install procmon-parser
    python scripts\\analyze_procmon.py docs\\Procmon-K16-close.PML --out k17-trace.csv

Optional flags:
    --window-start "2026-05-14 00:35:00"   # ISO-ish timestamp (local time)
    --window-end   "2026-05-14 00:50:00"   # ISO-ish timestamp (local time)
    --path-substr  ".git"                  # default: ".git"; case-insensitive
    --ops          "WriteFile,CreateFile,SetEndOfFileInformationFile,CloseFile"
                                            # default: writes + create + close

Output (CSV):
    timestamp, process_name, pid, operation, path, result, detail

Then upload k17-trace.csv to Cowork for K18 analysis.

REQUIREMENTS:
    Python 3.8+
    pip install procmon-parser

If procmon-parser is not available offline:
    pip download procmon-parser --dest .\\procmon-parser-wheels
    pip install --no-index --find-links=.\\procmon-parser-wheels procmon-parser

ROBUSTNESS NOTES:
    - Streams events (does NOT load full .pml into RAM).
    - Handles malformed events by skipping with a warning to stderr.
    - Writes CSV incrementally; safe to interrupt with Ctrl-C — partial
      output remains valid CSV up to the last flushed row.
    - Default filter is conservative (.git\\ path substring + write/create
      ops); widen via --path-substr / --ops if first pass returns no hits.

OUTPUT SIZING:
    Expect kilobytes, not megabytes. The 15.5 GB capture contains millions
    of events; only a few hundred should match the .git\\ filter in the
    K-close window.
"""

import argparse
import csv
import sys
from datetime import datetime
from pathlib import Path


def parse_window(s):
    """Accept 'YYYY-MM-DD HH:MM:SS' or 'YYYY-MM-DDTHH:MM:SS'."""
    if not s:
        return None
    s = s.replace("T", " ").strip()
    try:
        return datetime.strptime(s, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return datetime.strptime(s, "%Y-%m-%d %H:%M")


def main():
    ap = argparse.ArgumentParser(
        description="Filter Procmon .pml capture for .git\\ writes."
    )
    ap.add_argument("pml", type=Path, help="path to .pml capture file")
    ap.add_argument(
        "--out",
        type=Path,
        default=Path("k17-trace.csv"),
        help="output CSV path (default: k17-trace.csv)",
    )
    ap.add_argument(
        "--window-start",
        default=None,
        help='earliest event timestamp to keep (e.g., "2026-05-14 00:35:00")',
    )
    ap.add_argument(
        "--window-end",
        default=None,
        help='latest event timestamp to keep (e.g., "2026-05-14 00:50:00")',
    )
    ap.add_argument(
        "--path-substr",
        default=".git",
        help="case-insensitive path substring to match (default: .git)",
    )
    ap.add_argument(
        "--ops",
        default="WriteFile,CreateFile,SetEndOfFileInformationFile,CloseFile,SetRenameInformationFile",
        help="comma-separated Procmon operation names to keep",
    )
    ap.add_argument(
        "--verbose",
        action="store_true",
        help="print progress every 100k events to stderr",
    )
    args = ap.parse_args()

    if not args.pml.exists():
        sys.exit(f"error: {args.pml} not found")

    try:
        from procmon_parser import ProcmonLogsReader
    except ImportError:
        sys.exit(
            "error: procmon-parser not installed.\n"
            "  install with: pip install procmon-parser"
        )

    win_start = parse_window(args.window_start)
    win_end = parse_window(args.window_end)
    path_needle = args.path_substr.lower()
    keep_ops = {op.strip() for op in args.ops.split(",") if op.strip()}

    print(f"[analyze_procmon] reading {args.pml} ({args.pml.stat().st_size / 1e9:.2f} GB)", file=sys.stderr)
    print(f"[analyze_procmon] path filter: substring {path_needle!r} (case-insensitive)", file=sys.stderr)
    print(f"[analyze_procmon] op filter:   {sorted(keep_ops)}", file=sys.stderr)
    if win_start:
        print(f"[analyze_procmon] window:      {win_start} → {win_end}", file=sys.stderr)
    else:
        print(f"[analyze_procmon] window:      (full capture)", file=sys.stderr)

    matched = 0
    scanned = 0
    skipped = 0

    with open(args.pml, "rb") as fh, open(args.out, "w", newline="", encoding="utf-8") as out_fh:
        writer = csv.writer(out_fh)
        writer.writerow(["timestamp", "process_name", "pid", "operation", "path", "result", "detail"])

        reader = ProcmonLogsReader(fh)
        try:
            total_events = len(reader)
            print(f"[analyze_procmon] events in capture: {total_events:,}", file=sys.stderr)
        except Exception:
            total_events = None

        # Subscript access (reader[i]) lets us skip individual events that
        # raise from procmon-parser internals (e.g. KeyError on unknown
        # process_idx from a corrupted/truncated event mid-capture). The
        # `for event in reader:` pattern propagates such errors out of
        # __next__ and terminates iteration early — one bad event kills
        # the whole run. Circuit breaker aborts gracefully if errors
        # compound beyond MAX_POISONED_STREAK consecutive failures (likely
        # indicates the file is corrupted past that point).
        MAX_POISONED_STREAK = 1000
        poisoned_streak = 0
        i = 0
        while True:
            if total_events is not None and i >= total_events:
                break
            try:
                event = reader[i]
                poisoned_streak = 0
            except (IndexError, StopIteration):
                break
            except Exception as ex:
                skipped += 1
                poisoned_streak += 1
                if skipped <= 20:
                    print(f"[analyze_procmon] skip event #{i}: {type(ex).__name__}: {ex}", file=sys.stderr)
                if poisoned_streak >= MAX_POISONED_STREAK:
                    print(f"[analyze_procmon] {poisoned_streak} consecutive read errors at #{i} — aborting; partial CSV preserved ({matched:,} rows)", file=sys.stderr)
                    break
                i += 1
                continue

            scanned += 1
            i += 1
            if args.verbose and scanned % 100_000 == 0:
                print(f"[analyze_procmon] scanned {scanned:,} events, matched {matched:,}", file=sys.stderr)

            try:
                op_name = str(event.operation.name) if hasattr(event.operation, "name") else str(event.operation)
                if keep_ops and op_name not in keep_ops:
                    continue

                path = getattr(event, "path", "") or ""
                if path_needle not in path.lower():
                    continue

                # Timestamp extraction — procmon-parser 0.3.13 exposes event.date
                # as a callable (method, not property), so we must invoke it.
                # Fall back to FILETIME→datetime conversion if .date() isn't usable.
                ts = None
                raw_date = getattr(event, "date", None)
                if callable(raw_date):
                    try:
                        ts = raw_date()
                    except Exception:
                        ts = None
                elif raw_date is not None:
                    ts = raw_date

                if ts is None:
                    ft = getattr(event, "date_filetime", None)
                    if ft is not None and ft > 0:
                        try:
                            from datetime import timedelta, timezone
                            # Windows FILETIME: 100-ns ticks since 1601-01-01 UTC
                            ts = datetime(1601, 1, 1, tzinfo=timezone.utc) + timedelta(microseconds=ft / 10)
                        except Exception:
                            ts = None

                if win_start or win_end:
                    if ts is None:
                        continue
                    # Strip tzinfo for naive comparison against parsed window
                    ts_naive = ts.replace(tzinfo=None) if hasattr(ts, "tzinfo") and ts.tzinfo else ts
                    if win_start and ts_naive < win_start:
                        continue
                    if win_end and ts_naive > win_end:
                        continue

                proc_name = getattr(event.process, "process_name", "?") if getattr(event, "process", None) else "?"
                pid = getattr(event.process, "pid", "?") if getattr(event, "process", None) else "?"
                result = getattr(event, "result", "") or ""
                detail = getattr(event, "details", "") or ""

                writer.writerow([
                    ts.isoformat() if ts else "",
                    proc_name,
                    pid,
                    op_name,
                    path,
                    str(result),
                    str(detail)[:200],
                ])
                matched += 1

                if matched % 100 == 0:
                    out_fh.flush()
            except Exception as ex:
                skipped += 1
                if skipped < 10:
                    print(f"[analyze_procmon] skip event #{scanned}: {ex}", file=sys.stderr)
                continue

    print(f"[analyze_procmon] done. scanned={scanned:,} matched={matched:,} skipped={skipped:,}", file=sys.stderr)
    print(f"[analyze_procmon] output: {args.out}", file=sys.stderr)


if __name__ == "__main__":
    main()
