# recover-git.ps1 - K16 forensic-hardened git index recovery
# wuld.ink Cowork project
# Handles: corrupt .git/config branch.main.merge key (K15-NEW failure mode,
#          K16-confirmed recurring) + stale .git/index.lock + binary-corrupt
#          index + null-sha1 phantom entries
# Idempotent + interruption-survivable + ASCII-only (PowerShell 5.1 safe)
#
# Why this script exists:
#   Cowork sessions K7-K16 hit recurring failure pattern:
#     (i)  .git/index.lock recreated post-recovery (orphan-stale, 0-byte,
#          mtime in K-close window); sandbox-side rm blocked by Windows file
#          lock ("Operation not permitted")
#     (ii) .git/index binary-corrupted (bad sha1 signature, fatal: index file
#          corrupt); fsck fails, git operations blocked
#     (iii)[K10+] null-sha1 phantom entries in index (D+?? working-tree pattern
#          for same files; index-corruption artifact, not real drift)
#     (iv) [K15-NEW, K16-confirmed-recurring] .git/config [branch "main"]
#          merge key truncated mid-line (`\tmerge ` orphan, no `=`, no value,
#          no EOL); PS-write-truncation family, same vector as E3-era
#          setup-git.ps1 corruption. Blocks `git pull` / `git push`-tracking
#          / branch-aware operations.
#   Out-of-band Windows-side process (cowork-svc.exe candidate per K14
#   handle.exe trace; Defender ruled out post-Experiment-1; remaining proof
#   needs Procmon trace on .git/ writes during session-close cycle) is the
#   leading-candidate corruption vector.
#
# Usage:
#   cd C:\Users\y_m_a\Projects\wuld-ink
#   powershell -ExecutionPolicy Bypass -File recover-git.ps1
#
# Or just double-click in Explorer if PS execution is permitted.
#
# Idempotent: safe to re-run; each step short-circuits if state is already clean.
# Interruption-survivable: if PS terminal closes mid-operation, partial state
# is detectable by the next run via the same checks.

# Move to script's directory (repo root)
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $repoRoot

Write-Output "=== recover-git.ps1 - K16 hardened recovery ==="
Write-Output "Repo root: $repoRoot"
Write-Output ""

# Sanity: verify .git/ exists
if (-not (Test-Path ".git")) {
    Write-Output "ERROR: Not a git repository (.git not found at $repoRoot)"
    exit 1
}

# -----------------------------------------------------------------------------
# Step 1: Verify .git/config [branch "main"] merge key integrity
#   K15-NEW failure mode: PS-write-truncation corrupts the merge key.
#   K16-confirmed: recurring vector (not one-time write artifact).
#   Detection: line-parse the [branch "main"] section, verify
#       merge = <non-empty value>
#   present. Fail loud + emit repair instructions; do NOT auto-repair
#   (per K15 lesson i: fail loud with manual-repair guidance).
#   Must precede lock-clear / fsck / read-tree: broken config affects
#   branch-aware git operations unpredictably.
# -----------------------------------------------------------------------------
Write-Output "Step 1: Checking .git/config [branch ""main""] merge key..."
$configPath = ".git\config"
if (-not (Test-Path $configPath)) {
    Write-Output "  ERROR: .git\config not found at $repoRoot\$configPath"
    Write-Output "  Repo may be partially initialized. Re-run setup-git.ps1 OR clone fresh."
    exit 5
}
$configLines = Get-Content $configPath
$inBranchMain = $false
$mergeFound = $false
$mergeValue = ""
$branchBlockLines = @()
foreach ($line in $configLines) {
    if ($line -match '^\s*\[branch\s+"main"\]\s*$') {
        $inBranchMain = $true
        $branchBlockLines += $line
        continue
    }
    if ($line -match '^\s*\[.*\]\s*$') {
        if ($inBranchMain) { $inBranchMain = $false }
        continue
    }
    if ($inBranchMain) {
        $branchBlockLines += $line
        if ($line -match '^\s*merge\s*=\s*(\S.*?)\s*$') {
            $mergeFound = $true
            $mergeValue = $Matches[1]
        }
    }
}
if ($branchBlockLines.Count -eq 0) {
    Write-Output "  WARN: No [branch ""main""] section found in .git\config."
    Write-Output "  Non-standard config; skipping merge-key check."
    Write-Output "  If push/pull tracking fails, run: git branch --set-upstream-to=origin/main main"
} elseif (-not $mergeFound) {
    Write-Output "  ERROR: [branch ""main""] merge key is missing or truncated."
    Write-Output "  This is the K15-NEW / K16-recurring failure mode (PS-write-truncation)."
    Write-Output ""
    Write-Output "  Current [branch ""main""] block content (likely truncated):"
    foreach ($l in $branchBlockLines) {
        $shown = $l -replace "`t", "\t"
        Write-Output "    | $shown"
    }
    Write-Output ""
    Write-Output "  Repair: open .git\config in a text editor (Notepad / VS Code / etc.)"
    Write-Output "  and ensure the [branch ""main""] section reads exactly:"
    Write-Output ""
    Write-Output "    [branch ""main""]"
    Write-Output "    `tremote = origin"
    Write-Output "    `tmerge = refs/heads/main"
    Write-Output ""
    Write-Output "  (Note: leading whitespace is a single TAB character, not spaces.)"
    Write-Output ""
    Write-Output "  After repair, re-run: powershell -ExecutionPolicy Bypass -File recover-git.ps1"
    exit 5
} else {
    Write-Output "  OK: merge = $mergeValue"
    if ($mergeValue -ne "refs/heads/main") {
        Write-Output "  NOTE: merge value is not the canonical 'refs/heads/main'."
        Write-Output "  This may be intentional (non-standard remote tracking). No action taken."
    }
}
Write-Output ""

# -----------------------------------------------------------------------------
# Step 2: Clear .git/index.lock if present
# -----------------------------------------------------------------------------
$lockPath = ".git\index.lock"
if (Test-Path $lockPath) {
    Write-Output "Step 2: Lock present, attempting removal..."
    try {
        # Clear attributes first (handles read-only / system / hidden)
        $lockItem = Get-Item $lockPath -Force -ErrorAction SilentlyContinue
        if ($lockItem) { $lockItem.Attributes = "Normal" }
        Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Output "  Remove-Item threw: $_"
    }
    if (Test-Path $lockPath) {
        Write-Output "  Remove-Item did not clear. Falling back to cmd /c del..."
        cmd /c "del /f /q .git\index.lock" 2>&1 | Out-Null
    }
    if (Test-Path $lockPath) {
        Write-Output "  ERROR: Lock persists after Remove-Item AND cmd del."
        Write-Output "  Windows-side process holds an exclusive handle on the lock."
        Write-Output ""
        Write-Output "  Diagnostic steps:"
        Write-Output "    1. Close any IDE / editor with this repo open (VS Code, etc.)"
        Write-Output "    2. Run Sysinternals Handle.exe: handle.exe .git\index.lock"
        Write-Output "    3. If Defender / AV is the holder: add .git\ to exclusions"
        Write-Output "    4. Re-run this script."
        exit 2
    }
    Write-Output "  OK: lock cleared."
} else {
    Write-Output "Step 2: No lock present (clean state)."
}
Write-Output ""

# -----------------------------------------------------------------------------
# Step 3: Check index integrity via git fsck
# -----------------------------------------------------------------------------
Write-Output "Step 3: Checking index integrity (git fsck)..."
$fsckOutput = & git fsck --no-reflogs 2>&1 | Out-String
$indexCorrupt = ($fsckOutput -match "bad index file sha1 signature") -or `
                ($fsckOutput -match "index file corrupt")

if ($indexCorrupt) {
    Write-Output "  Index is binary-corrupt:"
    $fsckOutput.Trim() -split "`n" | ForEach-Object { Write-Output "    $_" }
    Write-Output "  Rebuilding index from HEAD via git read-tree..."
    & git read-tree HEAD 2>&1 | Out-String | ForEach-Object {
        if ($_.Trim()) { $_.Trim() -split "`n" | ForEach-Object { Write-Output "    $_" } }
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Output "  ERROR: git read-tree failed (exit $LASTEXITCODE)"
        Write-Output "  Manual investigation needed. Check .git/HEAD, .git/refs/heads/main."
        exit 3
    }
    # Re-verify
    $fsckOutput2 = & git fsck --no-reflogs 2>&1 | Out-String
    if (($fsckOutput2 -match "bad index") -or ($fsckOutput2 -match "corrupt")) {
        Write-Output "  ERROR: Index still corrupt after read-tree:"
        $fsckOutput2.Trim() -split "`n" | ForEach-Object { Write-Output "    $_" }
        exit 3
    }
    Write-Output "  OK: index rebuilt from HEAD."
} else {
    Write-Output "  OK: index integrity check passed."
}
Write-Output ""

# -----------------------------------------------------------------------------
# Step 4: Check for null-sha1 phantom entries (K10 corruption pattern)
# -----------------------------------------------------------------------------
Write-Output "Step 4: Checking for null-sha1 phantom entries..."
$lsFiles = & git ls-files --stage 2>&1
$nullEntries = $lsFiles | Where-Object { $_ -match "^\d+ 0{40} " }
$nullCount = ($nullEntries | Measure-Object).Count

if ($nullCount -gt 0) {
    Write-Output "  Found $nullCount null-sha1 phantom entries."
    Write-Output "  Rebuilding index from HEAD..."
    & git read-tree HEAD 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Output "  ERROR: git read-tree failed (exit $LASTEXITCODE)"
        exit 4
    }
    $lsFiles2 = & git ls-files --stage 2>&1
    $nullEntries2 = $lsFiles2 | Where-Object { $_ -match "^\d+ 0{40} " }
    $nullCount2 = ($nullEntries2 | Measure-Object).Count
    if ($nullCount2 -gt 0) {
        Write-Output "  ERROR: Still $nullCount2 null entries after rebuild."
        exit 4
    }
    Write-Output "  OK: null-sha1 entries cleared."
} else {
    Write-Output "  OK: no null-sha1 entries."
}
Write-Output ""

# -----------------------------------------------------------------------------
# Step 5: Working tree status report (informational; not modified)
# -----------------------------------------------------------------------------
Write-Output "Step 5: Working tree status..."
$statusOutput = & git status --short 2>&1 | Out-String
$statusClean = [string]::IsNullOrWhiteSpace($statusOutput)

if ($statusClean) {
    Write-Output "  Working tree clean (matches HEAD)."
} else {
    Write-Output "  Working tree has changes:"
    $statusOutput.Trim() -split "`n" | Where-Object { $_ } | ForEach-Object { Write-Output "    $_" }
    Write-Output ""
    Write-Output "  Review changes; if expected (e.g. K-session deliverables), commit:"
    Write-Output "    git add -A"
    Write-Output "    git commit -m 'KN deliverables: <summary>'"
    Write-Output "    git push origin main"
}
Write-Output ""

# -----------------------------------------------------------------------------
# Final summary
# -----------------------------------------------------------------------------
Write-Output "=== recovery complete ==="
Write-Output "  Config merge key: OK"
Write-Output "  Lock state:       cleared"
Write-Output "  Index integrity:  OK"
Write-Output "  Null entries:     cleared"
if ($statusClean) {
    Write-Output "  Working tree:     clean"
} else {
    Write-Output "  Working tree:     has uncommitted changes (see above)"
}
exit 0
