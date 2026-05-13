# setup-git.ps1 -- one-shot local git init + commit for wuld.ink
# Run from PowerShell in this folder. Idempotent: safe to re-run.
#
# Why this script exists: the Cowork bash sandbox cannot unlink files in the
# OneDrive-synced workspace folder, and OneDrive sync corrupted the .git/config
# during a sandbox-side git init attempt. Windows git + PowerShell handle
# OneDrive cleanly. This script does the local prep work, then hands off to
# you for the remote-add + push step.

# NOTE: deliberately NOT using $ErrorActionPreference = "Stop" because git's
# stderr output (even harmless "fatal: not a git repository" probes) trips
# PowerShell's NativeCommandError handling under Stop mode. We do our own
# exit-code checks via $LASTEXITCODE instead.

$ProjectRoot = $PSScriptRoot
Set-Location $ProjectRoot
Write-Host "Working in: $ProjectRoot`n" -ForegroundColor DarkGray

# --- 1. Wipe any prior .git/ (always; we are cold-initializing) ----------
Write-Host "=== [1/6] Cleaning prior .git/ ===" -ForegroundColor Cyan
if (Test-Path .git) {
    Write-Host "  .git/ present. Wiping for cold init." -ForegroundColor Yellow
    # Clear any read-only attributes OneDrive may have set
    Get-ChildItem -Path .git -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
        try { $_.Attributes = 'Normal' } catch { }
    }
    Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
    if (Test-Path .git) {
        Write-Host "  .git/ still present after rm. Trying cmd /c rd /s /q ..." -ForegroundColor Yellow
        cmd /c "rd /s /q .git"
    }
    if (Test-Path .git) {
        Write-Host "  FAIL: cannot remove .git/. Pause OneDrive sync (tray icon -> Pause syncing) and re-run." -ForegroundColor Red
        exit 1
    }
    Write-Host "  Removed .git/" -ForegroundColor Green
} else {
    Write-Host "  No .git/ present. Clean start." -ForegroundColor Green
}

# --- 2. Remove stray sandbox artifacts (zip + temp files) ----------------
Write-Host "`n=== [2/6] Removing stray artifacts ===" -ForegroundColor Cyan
$strays = @("wuld-ink-deploy-2026-05-13.zip", "ziGq6fkD", "ziCwRmw0")
foreach ($s in $strays) {
    if (Test-Path $s) {
        Remove-Item -Force $s
        Write-Host "  Removed $s" -ForegroundColor Green
    }
}
Get-ChildItem -File -Filter "zi*" -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "^zi[A-Za-z0-9]{6}$" } | ForEach-Object {
    Remove-Item -Force $_.FullName
    Write-Host "  Removed $($_.Name)" -ForegroundColor Green
}

# --- 3. git init ---------------------------------------------------------
Write-Host "`n=== [3/6] git init -b main ===" -ForegroundColor Cyan
$initOut = git init -b main 2>&1
$initOut | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
if ($LASTEXITCODE -ne 0) {
    Write-Host "  git init FAILED (exit $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}

# --- 4. git config (local scope) ----------------------------------------
Write-Host "`n=== [4/6] git config (local) ===" -ForegroundColor Cyan
git config user.name "Josiah S Cooper"
git config user.email "alisendjsc@gmail.com"
$un = git config user.name
$ue = git config user.email
Write-Host "  user.name  = $un" -ForegroundColor DarkGray
Write-Host "  user.email = $ue" -ForegroundColor DarkGray

# --- 5. stage + verify ---------------------------------------------------
Write-Host "`n=== [5/6] Staging + verifying ===" -ForegroundColor Cyan
git add .
$count = (git ls-files | Measure-Object).Count
Write-Host "  $count files staged" -ForegroundColor DarkGray

$strayCheck = git ls-files | Where-Object { $_ -match "(\.zip$|^ziGq6fkD$|^ziCwRmw0$|^zi[A-Za-z0-9]{6}$)" }
if ($strayCheck) {
    Write-Host "  FAIL: strays staged:" -ForegroundColor Red
    $strayCheck | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    exit 1
} else {
    Write-Host "  PASS: no strays in stage" -ForegroundColor Green
}

$expected = @("CLAUDE.md", "README.md", ".gitignore", "src/index.html", "src/void-engine/index.html", "src/tokens.css", "docs/wuld-ink-cowork-brief.md")
$missing = @()
$allFiles = git ls-files
foreach ($f in $expected) {
    $needle = $f -replace '\\','/'
    if (-not ($allFiles | Select-String -Pattern ([regex]::Escape($needle)) -SimpleMatch -Quiet)) {
        $missing += $f
    }
}
if ($missing.Count -gt 0) {
    Write-Host "  WARN: expected files not staged:" -ForegroundColor Yellow
    $missing | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
} else {
    Write-Host "  PASS: all spot-checked files staged" -ForegroundColor Green
}

# --- 6. commit (single -m, no here-string; PS 5.1 parser-safe) -----------
Write-Host "`n=== [6/6] Committing ===" -ForegroundColor Cyan
$msg1 = "Initial commit: wuld.ink source (sessions A + B + D-prime-prime + E + E2 state, 2026-05-13)"
$msg2 = "Snapshot at end of session E2: title-page homepage, 6 page shells, glossary scaffold + 2 anchor entries, SV essay shell with audio data-keys, Void Engine triptych port (Void / Signal / Transmission) at /void-engine/."
$msg3 = "Infrastructure live: Cloudflare Pages (wuld-ink.pages.dev) + R2 (audio.wuld.ink) + DNSSEC + www-to-apex 301. R2 TLS minimum 1.2."
$msg4 = "This commit becomes the basis for Pages Git-deploy (session E3)."

git commit -m $msg1 -m $msg2 -m $msg3 -m $msg4 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
if ($LASTEXITCODE -ne 0) {
    Write-Host "  git commit FAILED (exit $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Log ===" -ForegroundColor Cyan
git log --oneline -3 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host " DONE. Local repo ready." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next:" -ForegroundColor Yellow
Write-Host "  1. Create empty repo on github.com (no README, no gitignore, no license)." -ForegroundColor Yellow
Write-Host "     Suggested name: wuld-ink, Public." -ForegroundColor Yellow
Write-Host "  2. Paste the repo URL back to Claude." -ForegroundColor Yellow
Write-Host "  3. Claude returns the remote-add + push one-liner." -ForegroundColor Yellow
