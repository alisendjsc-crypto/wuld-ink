# scripts/check-file.ps1
#
# Null-byte corruption detector + integrity report.
#
# Origin: K21 second-addendum lesson (xi), 2026-05-15. The K4 OneDrive null-byte
# corruption pattern recurred during cross-Claude file relay: an uploaded
# coordination doc reported byte-identical md5 + line count to the on-disk
# version, but `cat -A | tail` revealed ~1694 trailing null bytes padded onto
# the end of the file. md5+size match alone was INSUFFICIENT to catch the
# corruption; trailing-null inspection was required.
#
# This script automates the trailing-null inspection so the discipline survives
# across future cross-Claude file relays without manual `cat -A | tail` runs.
#
# Usage:
#   .\check-file.ps1 <path-to-file>
#
# Example:
#   .\check-file.ps1 .\docs\book-claude-coordination.md
#
# Output fields:
#   Path           - resolved absolute path
#   Size           - total bytes
#   MD5            - MD5 hash (case-insensitive comparable to md5sum)
#   Line count     - LF-delimited line count
#   Trailing nulls - count of 0x00 bytes at end of file
#   Status         - CLEAN if trailing nulls == 0, ** CORRUPT ** otherwise
#
# Exit codes:
#   0  - file is clean (no trailing nulls)
#   1  - null-byte corruption detected
#   2  - file not found
#   3  - invalid argument
#
# K15 PS ledger compliance: ASCII-only, no Stop mode on native commands,
# no quoted-code-samples in Write-Output per K16 lesson.

param(
    [Parameter(Mandatory=$true, Position=0, HelpMessage="Path to the file to check")]
    [string]$Path
)

if ([string]::IsNullOrWhiteSpace($Path)) {
    Write-Output "ERROR: Path argument is empty."
    Write-Output "Usage: .\check-file.ps1 <path-to-file>"
    exit 3
}

if (-not (Test-Path $Path -PathType Leaf)) {
    Write-Output "ERROR: File not found: $Path"
    exit 2
}

$resolvedPath = (Resolve-Path $Path).Path
$bytes = [System.IO.File]::ReadAllBytes($resolvedPath)
$size = $bytes.Length

# Count trailing null bytes (walk backwards from end while byte == 0x00)
$nullTail = 0
for ($i = $size - 1; $i -ge 0 -and $bytes[$i] -eq 0; $i--) {
    $nullTail++
}

# MD5 hash for cross-check against md5sum output (case-insensitive comparison)
$md5 = (Get-FileHash $resolvedPath -Algorithm MD5).Hash.ToLower()

# Line count via LF delimiter (matches `wc -l` semantics)
$lineCount = 0
if ($size -gt 0) {
    foreach ($b in $bytes) {
        if ($b -eq 10) { $lineCount++ }
    }
}

Write-Output "--- File integrity check ---"
Write-Output "Path:           $resolvedPath"
Write-Output "Size:           $size bytes"
Write-Output "MD5:            $md5"
Write-Output "Line count:     $lineCount"
Write-Output "Trailing nulls: $nullTail"

if ($nullTail -gt 0) {
    Write-Output ""
    Write-Output "** NULL-BYTE CORRUPTION DETECTED **"
    Write-Output ""
    Write-Output "The last $nullTail bytes of the file are 0x00 padding."
    Write-Output ""
    Write-Output "Likely root cause: file save/sync race (OneDrive sync indexer,"
    Write-Output "sparse-file allocation, buffered write interrupted before flush,"
    Write-Output "or browser download truncation)."
    Write-Output ""
    Write-Output "Recommended action:"
    Write-Output "  1. Do NOT trust this file even if md5 + size match an expected reference."
    Write-Output "  2. Re-fetch the file from the original source."
    Write-Output "  3. If re-fetch is impossible, recover content from chat capture or"
    Write-Output "     other authoritative source; this file is corrupt at the tail."
    Write-Output ""
    Write-Output "Reference: K21 second-addendum lesson (xi), CLAUDE.md."
    Write-Output "--- end ---"
    exit 1
}

Write-Output "Status:         CLEAN"
Write-Output "--- end ---"
exit 0
