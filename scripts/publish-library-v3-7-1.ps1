# publish-library-v3-7-1.ps1 - v3.7.1 stable single-file publication.
#
# Supersedes scripts/publish-library-v3-7.ps1 (K20-era v3.7.0 nested-folder push).
#
# Pushes 4-file flat set to alisendjsc-crypto/efilist-argument-library:
#   combined.html  CITATION.cff  README.md  instructions.md
#
# Optional full-provenance via -FullProvenance switch additionally stages:
#   LICENSE  LICENSE-CODE
#
# Source dir:    $env:USERPROFILE\Projects\wuld-ink\docs
# Target clone:  $env:USERPROFILE\Projects\efilist-argument-library
# Md5 contract on combined.html: dd2abd01a43c2f173c98aa1b8c88bcbb
#
# K15 PS ledger compliance:
#   - ASCII-only script body
#   - Single -m commit message
#   - Stop-mode disabled on native stderr (git writes informational to stderr)
#   - .gitattributes written via [System.IO.File]::WriteAllText UTF8 no-BOM
#   - md5 verified pre-stage AND post-stage
#   - Y/n gates at every irreversible step
#
# Exit codes:
#   1 source dir missing
#   2 source files missing
#   3 pre-stage md5 drift on source combined.html
#   4 operator declined prior-clone cleanup
#   5 clone failed
#   6 operator declined stale-content destruction
#   7 stage copy failed
#   8 post-stage md5 drift on staged combined.html
#   9 operator declined commit
#  10 git commit failed
#  11 git push origin main failed
#  12 git tag push failed

param(
    [switch]$FullProvenance
)

$ErrorActionPreference = 'Continue'

$STAGE_SRC    = "$env:USERPROFILE\Projects\wuld-ink\docs"
$REPO_LOCAL   = "$env:USERPROFILE\Projects\efilist-argument-library"
$REPO_URL     = "https://github.com/alisendjsc-crypto/efilist-argument-library.git"
$REPO_SLUG    = "alisendjsc-crypto/efilist-argument-library"

$MD5_COMBINED = "dd2abd01a43c2f173c98aa1b8c88bcbb"
$COMMIT_MSG   = "v3.7.1 stable - single-file distribution; md5-locked; CC-BY-4.0 + MIT"
$TAG          = "v3.7.1"
$REPO_DESC    = "An interactive objection-map and next-move predictor for antinatalist, efilist, and negative-utilitarian debate. 78 objections across five tiers, 13 premises with 245 dependencies, 34 mechanisms, 136 attested real-world deployments, across four interlocutor archetypes (sophisticate / defender / drifter / blended). Single HTML file, no build step, works offline."

$FILES_MIN  = @('combined.html', 'CITATION.cff', 'README.md', 'instructions.md')
$FILES_PROV = @('LICENSE', 'LICENSE-CODE')

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host " efilist_argument_library v3.7.1 stable publication           " -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""
if ($FullProvenance) {
    Write-Host "Mode: FULL PROVENANCE (4-file + LICENSE + LICENSE-CODE + .gitattributes)" -ForegroundColor Yellow
} else {
    Write-Host "Mode: MINIMAL (4-file flat + .gitattributes)" -ForegroundColor Yellow
}
Write-Host ""

# === Step 1: pre-flight source dir ===
Write-Host "[1/12] Pre-flight: source dir check"
if (-not (Test-Path $STAGE_SRC)) {
    Write-Host "FAIL: source dir not found: $STAGE_SRC" -ForegroundColor Red
    exit 1
}
Write-Host "  OK: $STAGE_SRC exists" -ForegroundColor DarkGreen

# === Step 2: source files inventory ===
Write-Host "[2/12] Source files inventory"
$wanted = $FILES_MIN
if ($FullProvenance) { $wanted = $wanted + $FILES_PROV }

$missing = @()
foreach ($f in $wanted) {
    if (-not (Test-Path (Join-Path $STAGE_SRC $f))) { $missing += $f }
}
if ($missing.Count -gt 0) {
    Write-Host "FAIL: missing source files in $STAGE_SRC :" -ForegroundColor Red
    foreach ($m in $missing) { Write-Host "  - $m" -ForegroundColor Red }
    exit 2
}
foreach ($f in $wanted) { Write-Host "  OK $f" -ForegroundColor DarkGreen }

# === Step 3: pre-stage md5 audit on source combined.html ===
Write-Host "[3/12] Pre-stage md5 audit on source combined.html"
$srcCombined = Join-Path $STAGE_SRC 'combined.html'
$preMd5 = (Get-FileHash $srcCombined -Algorithm MD5).Hash.ToLower()
Write-Host "  expected: $MD5_COMBINED"
Write-Host "  actual:   $preMd5"
if ($preMd5 -ne $MD5_COMBINED) {
    Write-Host "ABORT: pre-stage md5 drift on source combined.html" -ForegroundColor Red
    exit 3
}
Write-Host "  OK: source combined.html md5 contract holds" -ForegroundColor DarkGreen

# === Step 4: cleanup prior clone ===
Write-Host "[4/12] Prior clone cleanup"
if (Test-Path $REPO_LOCAL) {
    Write-Host "  Existing clone found at $REPO_LOCAL"
    $resp = Read-Host "  Remove and re-clone fresh? (y/n)"
    if ($resp -ne 'y') {
        Write-Host "ABORT: operator declined cleanup" -ForegroundColor Red
        exit 4
    }
    Remove-Item -Recurse -Force $REPO_LOCAL
    Write-Host "  Removed prior clone" -ForegroundColor DarkGreen
} else {
    Write-Host "  No prior clone (clean start)" -ForegroundColor DarkGreen
}

# === Step 5: fresh clone ===
Write-Host "[5/12] Fresh clone"
git clone $REPO_URL $REPO_LOCAL 2>&1 | ForEach-Object { Write-Host "  $_" }
if (-not (Test-Path (Join-Path $REPO_LOCAL '.git'))) {
    Write-Host "FAIL: clone did not produce .git directory" -ForegroundColor Red
    exit 5
}
Write-Host "  OK: cloned to $REPO_LOCAL" -ForegroundColor DarkGreen

# === Step 6: surface stale content + Y/n destruction gate ===
Set-Location $REPO_LOCAL
Write-Host "[6/12] Surface stale (v3.7.0) tracked content"
$tracked = git ls-tree -r HEAD --name-only 2>&1
$trackedCount = ($tracked | Measure-Object).Count
Write-Host "  Currently tracked: $trackedCount paths"
$tracked | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
Write-Host ""
$resp = Read-Host "  Wipe all tracked content for v3.7.1 flat replacement? (y/n)"
if ($resp -ne 'y') {
    Write-Host "ABORT: operator declined stale-content destruction" -ForegroundColor Red
    exit 6
}

if ($trackedCount -gt 0) {
    git rm -rf . 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
}
# Sweep any untracked leftovers (keep .git/)
Get-ChildItem -Force | Where-Object { $_.Name -ne '.git' } | ForEach-Object {
    Remove-Item -Recurse -Force $_.FullName -ErrorAction SilentlyContinue
}
Write-Host "  OK: working tree cleared (.git preserved)" -ForegroundColor DarkGreen

# === Step 7: copy 4-file set (+ optional provenance) ===
Write-Host "[7/12] Stage v3.7.1 file set"
foreach ($f in $wanted) {
    $src = Join-Path $STAGE_SRC $f
    $dst = Join-Path $REPO_LOCAL $f
    Copy-Item -LiteralPath $src -Destination $dst
    if (-not (Test-Path $dst)) {
        Write-Host "FAIL: copy did not produce $f" -ForegroundColor Red
        exit 7
    }
    Write-Host "  staged $f" -ForegroundColor DarkGreen
}

# === Step 8: write .gitattributes (UTF-8 no-BOM, LF lock) ===
Write-Host "[8/12] Write .gitattributes (UTF-8 no-BOM, LF lock)"
$gitattrPath = Join-Path $REPO_LOCAL '.gitattributes'
$gitattrContent = "*.html text eol=lf`n*.md   text eol=lf`n*.cff  text eol=lf`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($gitattrPath, $gitattrContent, $utf8NoBom)
if (-not (Test-Path $gitattrPath)) {
    Write-Host "FAIL: .gitattributes write produced no file" -ForegroundColor Red
    exit 7
}
Write-Host "  OK: .gitattributes (LF lock for *.html *.md *.cff)" -ForegroundColor DarkGreen

# === Step 9: post-stage md5 audit on staged combined.html ===
Write-Host "[9/12] Post-stage md5 audit on staged combined.html"
$stagedCombined = Join-Path $REPO_LOCAL 'combined.html'
$postMd5 = (Get-FileHash $stagedCombined -Algorithm MD5).Hash.ToLower()
Write-Host "  expected: $MD5_COMBINED"
Write-Host "  actual:   $postMd5"
if ($postMd5 -ne $MD5_COMBINED) {
    Write-Host "ABORT: post-stage md5 drift on staged combined.html" -ForegroundColor Red
    Write-Host "       (likely cause: LF/CRLF conversion during Copy-Item)" -ForegroundColor Red
    exit 8
}
Write-Host "  OK: staged combined.html md5 contract holds" -ForegroundColor DarkGreen

# === Step 10: git add + commit gate ===
Write-Host "[10/12] git add + surface status"
git add . 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
Write-Host "  git status:"
git status --short 2>&1 | ForEach-Object { Write-Host "    $_" }

Write-Host ""
$resp = Read-Host "  Commit + push main + tag $TAG + push tag? (y/n)"
if ($resp -ne 'y') {
    Write-Host "ABORT: operator declined commit" -ForegroundColor Red
    exit 9
}

# === Step 11: commit + push + tag ===
Write-Host "[11/12] Commit + push + tag"
git commit -m $COMMIT_MSG 2>&1 | ForEach-Object { Write-Host "  $_" }
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: git commit returned $LASTEXITCODE" -ForegroundColor Red
    exit 10
}

git push origin main 2>&1 | ForEach-Object { Write-Host "  $_" }
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: git push origin main returned $LASTEXITCODE" -ForegroundColor Red
    exit 11
}

git tag $TAG 2>&1 | ForEach-Object { Write-Host "  $_" }
git push origin $TAG 2>&1 | ForEach-Object { Write-Host "  $_" }
if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: git push origin $TAG returned $LASTEXITCODE" -ForegroundColor Red
    exit 12
}
Write-Host "  OK: commit + push + tag pushed" -ForegroundColor DarkGreen

# === Step 12: repo description update ===
Write-Host "[12/12] Update repo description (gh CLI if available)"
$ghAvail = $false
try {
    $null = & gh --version 2>&1
    if ($LASTEXITCODE -eq 0) { $ghAvail = $true }
} catch {}
if ($ghAvail) {
    gh repo edit $REPO_SLUG --description $REPO_DESC 2>&1 | ForEach-Object { Write-Host "  $_" }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARN: gh repo edit returned $LASTEXITCODE (description not updated)" -ForegroundColor Yellow
        Write-Host "      Manual: github.com/$REPO_SLUG -> About -> edit description" -ForegroundColor Yellow
    } else {
        Write-Host "  OK: repo description updated to v3.7.1 form" -ForegroundColor DarkGreen
    }
} else {
    Write-Host "  gh CLI not available - skipping automated description update" -ForegroundColor Yellow
    Write-Host "  Manual: github.com/$REPO_SLUG -> About -> edit description -> paste:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host $REPO_DESC -ForegroundColor White
    Write-Host ""
}

# === DONE ===
Write-Host ""
Write-Host "==============================================================" -ForegroundColor Green
Write-Host " DONE - v3.7.1 stable published                               " -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Live:  https://github.com/$REPO_SLUG"
Write-Host "Tag :  $TAG pushed."
Write-Host "Md5 :  $MD5_COMBINED (pre-stage + post-stage verified)"
Write-Host ""
Write-Host "Next (Cowork-side, after operator confirms publication landed):"
Write-Host "  1. Post-push raw md5 re-verify via curl on raw.githubusercontent.com"
Write-Host "  2. Cloudflare dashboard: create Pages project + add library.wuld.ink"
Write-Host "  3. After subdomain returns 200, swap wuld.ink-side footer + cross-link"
Write-Host "     surfacing from 'pending' to live-link form"
Write-Host ""
