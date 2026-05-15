# publish-library-v3-7.ps1 - one-shot library substrate publication to GitHub.
#
# Mission: stage v3.7 stable release artifacts to alisendjsc-crypto/efilist-argument-library,
# commit, push, tag. md5-binding integrity check pre- and post-stage.
#
# Idempotent, interruption-survivable, ASCII-only.
# K15 PS ledger compliance: single -m commit message, no Stop-mode-on-native-stderr.
# Pre-flight + surface-before-destruct + Y/n gates at every irreversible step.
#
# Source files MUST live at $env:USERPROFILE\Downloads\Argument Library\
# Target repo cloned to $env:USERPROFILE\Projects\efilist-argument-library\
#
# Exit codes:
#   1 source folder missing
#   2 source files missing
#   3 source md5 drift (pre-stage)
#   4 operator declined cleanup
#   5 failed prior-state cleanup
#   6 clone failed
#   7 operator declined overwrite
#   8 post-stage md5 drift
#   9 operator declined commit
#  10 commit failed
#  11 push origin main failed
#  12 tag push failed

$ErrorActionPreference = 'Continue'

$STAGE_SRC = "$env:USERPROFILE\Downloads\Argument Library"
$REPO_LOCAL = "$env:USERPROFILE\Projects\efilist-argument-library"
$REPO_URL = "https://github.com/alisendjsc-crypto/efilist-argument-library.git"

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host " efilist_argument_library v3.7 stable publication             " -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""

# === Step 1: pre-flight source folder ===
Write-Host "[1/9] Pre-flight: source folder check"
if (-not (Test-Path $STAGE_SRC)) {
    Write-Host "FAIL: source folder not found: $STAGE_SRC" -ForegroundColor Red
    exit 1
}
Write-Host "  OK: $STAGE_SRC exists" -ForegroundColor DarkGreen

# === Step 2: validate 14 source files present ===
Write-Host "[2/9] Source file inventory"
$REQUIRED = @(
    'efilist_argument_library_v3_7_post_cluster_insertion_inmendham.json',
    'efilist_argument_library_v3_7_post_surface_parity_jsx.jsx',
    'index_v3_7_post_b3f2_surface_parity_html.html',
    'coda_v3_7.html',
    'real_world_examples_schema_v1_6.json',
    'v3prime_validator_v1_6.py',
    'release_manifest_v3_7_stable.json',
    'release_notes_v3_7.md',
    'project_canon_v26_0.json',
    'session_closeout_state.json',
    'README.md',
    'LICENSE',
    'LICENSE-CODE',
    'instructions.md'
)
$missing = @()
foreach ($f in $REQUIRED) {
    if (-not (Test-Path (Join-Path $STAGE_SRC $f))) { $missing += $f }
}
if ($missing.Count -gt 0) {
    Write-Host "FAIL: missing source files:" -ForegroundColor Red
    foreach ($m in $missing) { Write-Host "  - $m" -ForegroundColor Red }
    exit 2
}
Write-Host "  OK: 14 source files present" -ForegroundColor DarkGreen

# === Step 3: pre-stage md5 integrity check (6 locked artifacts) ===
Write-Host "[3/9] Pre-stage md5 integrity check"
$MD5_LOCKS = [ordered]@{
    'efilist_argument_library_v3_7_post_cluster_insertion_inmendham.json' = 'fb0e41ca1c0722e8615b1e7001e229ed'
    'efilist_argument_library_v3_7_post_surface_parity_jsx.jsx'           = 'be25b1432e7228db629b7122f85dec4d'
    'index_v3_7_post_b3f2_surface_parity_html.html'                       = '39ea0cd42f137bbd3fdc86d6964ac91b'
    'coda_v3_7.html'                                                      = 'e955812115e6aaf5bb1c445cd1c878c0'
    'real_world_examples_schema_v1_6.json'                                = 'a5011ddba98cd98c5afc9c28cdc79752'
    'v3prime_validator_v1_6.py'                                           = 'f114d87c46a05891ac0077854200f000'
}
$drift = $false
foreach ($f in $MD5_LOCKS.Keys) {
    $expected = $MD5_LOCKS[$f]
    $actual = (Get-FileHash (Join-Path $STAGE_SRC $f) -Algorithm MD5).Hash.ToLower()
    if ($actual -ne $expected) {
        Write-Host "  DRIFT: $f" -ForegroundColor Red
        Write-Host "    expected $expected" -ForegroundColor Red
        Write-Host "    actual   $actual" -ForegroundColor Red
        $drift = $true
    } else {
        Write-Host "  OK $f" -ForegroundColor DarkGreen
    }
}
if ($drift) {
    Write-Host "ABORT: source md5 drift. Stop." -ForegroundColor Red
    exit 3
}

# === Step 4: cleanup prior failed clone state ===
Write-Host "[4/9] Cleanup check for prior efilist-argument-library folder"
if (Test-Path $REPO_LOCAL) {
    Write-Host "  PRESENT: $REPO_LOCAL"
    Write-Host "  Contents preview:"
    Get-ChildItem $REPO_LOCAL -Force -ErrorAction SilentlyContinue | Select-Object -First 8 | ForEach-Object {
        Write-Host ("    {0,-12} {1}" -f $_.Mode, $_.Name)
    }
    $resp = Read-Host "  Remove and re-clone fresh? (y/n)"
    if ($resp -ne 'y') {
        Write-Host "ABORT: operator declined cleanup" -ForegroundColor Red
        exit 4
    }
    # Clear attributes pass
    Get-ChildItem $REPO_LOCAL -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
        try { $_.Attributes = 'Normal' } catch {}
    }
    Remove-Item $REPO_LOCAL -Recurse -Force -ErrorAction SilentlyContinue
    if (Test-Path $REPO_LOCAL) {
        # Fallback for sticky cases
        cmd /c "rd /s /q `"$REPO_LOCAL`"" 2>&1 | Out-Null
    }
    if (Test-Path $REPO_LOCAL) {
        Write-Host "FAIL: could not remove $REPO_LOCAL. Manual removal required." -ForegroundColor Red
        exit 5
    }
    Write-Host "  OK: prior state cleared" -ForegroundColor DarkGreen
} else {
    Write-Host "  OK: no prior folder" -ForegroundColor DarkGreen
}

# === Step 5: fresh clone ===
Write-Host "[5/9] Fresh clone from $REPO_URL"
if (-not (Test-Path "$env:USERPROFILE\Projects")) {
    New-Item -ItemType Directory -Path "$env:USERPROFILE\Projects" | Out-Null
}
Set-Location "$env:USERPROFILE\Projects"
git clone $REPO_URL 2>&1 | ForEach-Object { Write-Host "  $_" }
if (-not (Test-Path "$REPO_LOCAL\.git")) {
    Write-Host "FAIL: clone did not produce .git/" -ForegroundColor Red
    exit 6
}
Set-Location $REPO_LOCAL
Write-Host "  OK: cloned to $REPO_LOCAL" -ForegroundColor DarkGreen

# === Step 6: surface stale content before overwrite ===
Write-Host "[6/9] Current (stale) repo state - to be overwritten"
Write-Host "  HEAD commits:"
git log --oneline -3 2>&1 | ForEach-Object { Write-Host "    $_" }
Write-Host "  Top-level entries (all will be removed):"
Get-ChildItem -Force | Where-Object { $_.Name -ne '.git' } | ForEach-Object {
    $type = if ($_.PSIsContainer) { 'dir ' } else { 'file' }
    Write-Host ("    [{0}] {1}" -f $type, $_.Name)
}
$resp = Read-Host "  Proceed with full overwrite for v3.7 stable? (y/n)"
if ($resp -ne 'y') {
    Write-Host "ABORT: operator declined overwrite" -ForegroundColor Red
    exit 7
}

# Remove stale tracked content via git rm (preserves git history of deletions)
Write-Host "  Removing stale tracked files via git rm..."
Get-ChildItem -Force | Where-Object { $_.Name -ne '.git' } | ForEach-Object {
    if ($_.PSIsContainer) {
        git rm -rf $_.Name 2>&1 | Out-Null
    } else {
        git rm -f $_.Name 2>&1 | Out-Null
    }
}
Write-Host "  OK: stale content removed from working tree" -ForegroundColor DarkGreen

# === Step 7: create nested structure + stage 14 files + .gitattributes ===
Write-Host "[7/9] Staging v3.7 structure"
foreach ($d in 'corpus','viewer','coda','schema','validator','process') {
    New-Item -ItemType Directory -Path $d -Force | Out-Null
    Write-Host "  mkdir $d/" -ForegroundColor DarkGray
}

$STAGE_MAP = [ordered]@{
    'efilist_argument_library_v3_7_post_cluster_insertion_inmendham.json' = 'corpus\efilist_argument_library_v3_7_post_cluster_insertion_inmendham.json'
    'efilist_argument_library_v3_7_post_surface_parity_jsx.jsx'           = 'corpus\efilist_argument_library_v3_7_post_surface_parity_jsx.jsx'
    'index_v3_7_post_b3f2_surface_parity_html.html'                       = 'viewer\index_v3_7_post_b3f2_surface_parity_html.html'
    'coda_v3_7.html'                                                      = 'coda\coda_v3_7.html'
    'real_world_examples_schema_v1_6.json'                                = 'schema\real_world_examples_schema_v1_6.json'
    'v3prime_validator_v1_6.py'                                           = 'validator\v3prime_validator_v1_6.py'
    'project_canon_v26_0.json'                                            = 'process\project_canon_v26_0.json'
    'session_closeout_state.json'                                         = 'process\session_closeout_state.json'
    'release_manifest_v3_7_stable.json'                                   = 'release_manifest_v3_7_stable.json'
    'release_notes_v3_7.md'                                               = 'CHANGELOG.md'
    'README.md'                                                           = 'README.md'
    'LICENSE'                                                             = 'LICENSE'
    'LICENSE-CODE'                                                        = 'LICENSE-CODE'
    'instructions.md'                                                     = 'instructions.md'
}
foreach ($src in $STAGE_MAP.Keys) {
    $dst = $STAGE_MAP[$src]
    Copy-Item (Join-Path $STAGE_SRC $src) $dst -Force
    Write-Host "  cp $src -> $dst" -ForegroundColor DarkGray
}

# .gitattributes - LF preservation, no BOM
$GITATTR = "*.json text eol=lf`n*.jsx  text eol=lf`n*.html text eol=lf`n*.py   text eol=lf`n*.md   text eol=lf`n"
[System.IO.File]::WriteAllText("$REPO_LOCAL\.gitattributes", $GITATTR, [System.Text.UTF8Encoding]::new($false))
Write-Host "  wrote .gitattributes (5 lines, LF, no BOM)" -ForegroundColor DarkGray

# === Step 8: post-stage md5 audit (binding integrity) ===
Write-Host "[8/9] Post-stage md5 audit"
$STAGED_LOCKS = [ordered]@{
    'corpus\efilist_argument_library_v3_7_post_cluster_insertion_inmendham.json' = 'fb0e41ca1c0722e8615b1e7001e229ed'
    'corpus\efilist_argument_library_v3_7_post_surface_parity_jsx.jsx'           = 'be25b1432e7228db629b7122f85dec4d'
    'viewer\index_v3_7_post_b3f2_surface_parity_html.html'                       = '39ea0cd42f137bbd3fdc86d6964ac91b'
    'coda\coda_v3_7.html'                                                        = 'e955812115e6aaf5bb1c445cd1c878c0'
    'schema\real_world_examples_schema_v1_6.json'                                = 'a5011ddba98cd98c5afc9c28cdc79752'
    'validator\v3prime_validator_v1_6.py'                                        = 'f114d87c46a05891ac0077854200f000'
}
$drift2 = $false
foreach ($f in $STAGED_LOCKS.Keys) {
    $expected = $STAGED_LOCKS[$f]
    $actual = (Get-FileHash $f -Algorithm MD5).Hash.ToLower()
    if ($actual -ne $expected) {
        Write-Host "  DRIFT: $f" -ForegroundColor Red
        Write-Host "    expected $expected" -ForegroundColor Red
        Write-Host "    actual   $actual" -ForegroundColor Red
        $drift2 = $true
    } else {
        Write-Host "  OK $f" -ForegroundColor DarkGreen
    }
}
if ($drift2) {
    Write-Host "ABORT: post-stage md5 drift (likely LF/CRLF). Restore + re-stage required." -ForegroundColor Red
    exit 8
}
Write-Host "  OK: 6 md5 locks pass post-stage" -ForegroundColor DarkGreen

# === Step 9: stage in git, commit, push, tag ===
Write-Host "[9/9] git add + commit + push + tag"
git add -A 2>&1 | ForEach-Object { Write-Host "  $_" }
Write-Host "  git status:"
git status --short 2>&1 | ForEach-Object { Write-Host "    $_" }

$resp = Read-Host "  Commit + push + tag v3.7.0? (y/n)"
if ($resp -ne 'y') {
    Write-Host "ABORT: operator declined commit" -ForegroundColor Red
    exit 9
}

$MSG = "v3.7.0 stable - md5-locked release; CC-BY-4.0 + MIT dual-license; nested structure"
git commit -m $MSG 2>&1 | ForEach-Object { Write-Host "  $_" }
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: git commit returned $LASTEXITCODE" -ForegroundColor Red
    exit 10
}

git push origin main 2>&1 | ForEach-Object { Write-Host "  $_" }
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: git push origin main returned $LASTEXITCODE" -ForegroundColor Red
    exit 11
}

git tag v3.7.0 2>&1 | ForEach-Object { Write-Host "  $_" }
git push origin v3.7.0 2>&1 | ForEach-Object { Write-Host "  $_" }
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: git push origin v3.7.0 returned $LASTEXITCODE" -ForegroundColor Red
    exit 12
}

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Green
Write-Host " DONE                                                         " -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "v3.7.0 published to https://github.com/alisendjsc-crypto/efilist-argument-library"
Write-Host "Tag v3.7.0 pushed."
Write-Host ""
Write-Host "Next (Cowork-side):"
Write-Host "  - Post-push md5 re-verification via raw URLs"
Write-Host "  - GitHub repo description update via Chrome MCP (replace stale 74/222/three-modes)"
Write-Host ""
