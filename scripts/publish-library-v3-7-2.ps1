# publish-library-v3-7-2.ps1 - v3.7.2 content-advance re-cut publication.
#
# Supersedes scripts/publish-library-v3-7-1.ps1 (v3.7.1 4-file flat ship).
#
# This is an INCREMENTAL UPDATE - not wipe-and-stage:
#   - REPLACE: combined.html, CITATION.cff, README.md, instructions.md (4)
#   - ADD:     STATISTICS.md + 7 v3.7.2 provenance set files (8 new)
#   - PRESERVE: LICENSE, LICENSE-CODE, .gitattributes, _redirects (operator-managed)
#
# Source dir:    $env:USERPROFILE\Projects\wuld-ink\docs\v3-7-2-bundle
# Target clone:  $env:USERPROFILE\Projects\efilist-argument-library
#
# Binding md5 contract (canon v29.0 archive_attestation, 8 substrate anchors):
#   combined.html                            2accf16a834f31b9e8dbb3fcc7d61a6b
#   efilist_argument_library_v3_7_2.json     26fc409ed3e46899e9ab094a9a8d26e0
#   efilist_argument_library_v3_7_2.jsx      c3442b4a72d2da7093cbbf580da1176a
#   index_v3_7_2.html                        20cf4071566f283ed4bdedbeb37598e0
#   coda_v3_7.html                           654f56cf29d9a808fc870dda4c98b3cc
#   real_world_examples_schema_v1_6.json     a5011ddba98cd98c5afc9c28cdc79752
#   v3prime_validator_v1_6.py                f114d87c46a05891ac0077854200f000
#   rebuttal_grading_ledger.json             a85c1191b8fe0935c0c0e6a7dc13d99a
#
# K15 PS ledger + K24f step 5.5 + K24e xxiv discipline preserved:
#   - ASCII-only script body
#   - Single -m commit message
#   - Stop-mode disabled on native stderr
#   - .gitattributes written via [System.IO.File]::WriteAllText UTF8 no-BOM
#   - Md5 verified pre-stage AND post-stage on all 8 substrate files
#   - Local identity-set on fresh clone (prevents Author identity unknown)
#   - Y/n gates at every irreversible step
#
# Exit codes:
#   1  source dir missing
#   2  source files missing
#   3  pre-stage md5 drift on any substrate file
#   4  operator declined prior-clone cleanup
#   5  clone failed
#   6  operator-managed file missing in cloned tree (LICENSE/LICENSE-CODE/_redirects)
#   7  stage copy failed
#   8  post-stage md5 drift on any substrate file
#   9  operator declined commit
#  10  git commit failed
#  11  git push origin main failed
#  12  git tag push failed

param(
    [switch]$FullProvenance
)

$ErrorActionPreference = 'Continue'

$STAGE_SRC    = "$env:USERPROFILE\Projects\wuld-ink\docs\v3-7-2-bundle"
$REPO_LOCAL   = "$env:USERPROFILE\Projects\efilist-argument-library"
$REPO_URL     = "https://github.com/alisendjsc-crypto/efilist-argument-library.git"
$REPO_SLUG    = "alisendjsc-crypto/efilist-argument-library"

# v3.7.2 binding md5 contract (canon v29.0)
$MD5_CONTRACT = @{
    'combined.html'                            = '2accf16a834f31b9e8dbb3fcc7d61a6b'
    'efilist_argument_library_v3_7_2.json'     = '26fc409ed3e46899e9ab094a9a8d26e0'
    'efilist_argument_library_v3_7_2.jsx'      = 'c3442b4a72d2da7093cbbf580da1176a'
    'index_v3_7_2.html'                        = '20cf4071566f283ed4bdedbeb37598e0'
    'coda_v3_7.html'                           = '654f56cf29d9a808fc870dda4c98b3cc'
    'real_world_examples_schema_v1_6.json'     = 'a5011ddba98cd98c5afc9c28cdc79752'
    'v3prime_validator_v1_6.py'                = 'f114d87c46a05891ac0077854200f000'
    'rebuttal_grading_ledger.json'             = 'a85c1191b8fe0935c0c0e6a7dc13d99a'
}

$COMMIT_MSG = "v3.7.2 content-advance re-cut: VAR C->B (quadrant cleared), prose strengthens, 78/78 graded, chrome 74/222->78/245; canon v29.0; new md5 contract"
$TAG        = "v3.7.2"

# 317 chars, well under the 350 GitHub limit (33-char buffer)
$REPO_DESC  = "An interactive objection-map and next-move predictor for antinatalist, efilist, and negative-utilitarian debate. 78 objections across five tiers, 13 premises with 245 dependencies, 34 mechanisms, 136 attested real-world deployments, across four interlocutor archetypes. Single HTML file, no build step, works offline."

$WULDINK_EMAIL = "263501734+alisendjsc-crypto@users.noreply.github.com"
$WULDINK_NAME  = "alisendjsc-crypto"

# Files to stage from the bundle (all 12)
$FILES_REPLACE = @('combined.html', 'CITATION.cff', 'README.md', 'instructions.md')
$FILES_NEW     = @('STATISTICS.md', 'efilist_argument_library_v3_7_2.json', 'efilist_argument_library_v3_7_2.jsx', 'index_v3_7_2.html', 'coda_v3_7.html', 'real_world_examples_schema_v1_6.json', 'v3prime_validator_v1_6.py', 'rebuttal_grading_ledger.json')
$FILES_ALL     = $FILES_REPLACE + $FILES_NEW

# Files that must persist in repo (preserved across the publish; verified pre-stage)
$FILES_PRESERVE = @('LICENSE', 'LICENSE-CODE', '_redirects', '.gitattributes')

Write-Host ""
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host " efilist_argument_library v3.7.2 content-advance publication  " -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Mode: INCREMENTAL UPDATE (4 replace + 8 add + operator-managed preserved)" -ForegroundColor Yellow
Write-Host ""

# === Step 1: pre-flight source dir ===
Write-Host "[1/12] Pre-flight: source dir check"
if (-not (Test-Path $STAGE_SRC)) {
    Write-Host "FAIL: source dir not found: $STAGE_SRC" -ForegroundColor Red
    exit 1
}
Write-Host "  OK: $STAGE_SRC exists" -ForegroundColor DarkGreen

# === Step 2: source files inventory ===
Write-Host "[2/12] Source files inventory ($($FILES_ALL.Count) files)"
$missing = @()
foreach ($f in $FILES_ALL) {
    if (-not (Test-Path (Join-Path $STAGE_SRC $f))) { $missing += $f }
}
if ($missing.Count -gt 0) {
    Write-Host "FAIL: missing source files in $STAGE_SRC :" -ForegroundColor Red
    foreach ($m in $missing) { Write-Host "  - $m" -ForegroundColor Red }
    exit 2
}
foreach ($f in $FILES_ALL) { Write-Host "  OK $f" -ForegroundColor DarkGreen }

# === Step 3: pre-stage md5 audit on all 8 substrate files ===
Write-Host "[3/12] Pre-stage md5 audit (8 substrate files)"
$preFail = $false
foreach ($f in $MD5_CONTRACT.Keys) {
    $src = Join-Path $STAGE_SRC $f
    $expected = $MD5_CONTRACT[$f]
    $actual = (Get-FileHash $src -Algorithm MD5).Hash.ToLower()
    if ($actual -eq $expected) {
        Write-Host "  OK   $f  $actual" -ForegroundColor DarkGreen
    } else {
        Write-Host "  FAIL $f  expected=$expected actual=$actual" -ForegroundColor Red
        $preFail = $true
    }
}
if ($preFail) {
    Write-Host "ABORT: pre-stage md5 drift on one or more substrate files" -ForegroundColor Red
    exit 3
}
Write-Host "  ALL 8 substrate md5 contracts hold" -ForegroundColor DarkGreen

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

# === Step 5.5: set local git identity (K24f xxvii patch) ===
Write-Host "[5.5/12] Local identity-set on fresh clone"
git -C $REPO_LOCAL config user.email $WULDINK_EMAIL
git -C $REPO_LOCAL config user.name  $WULDINK_NAME
Write-Host "  OK: identity set ($WULDINK_NAME <$WULDINK_EMAIL>)" -ForegroundColor DarkGreen

# === Step 6: verify operator-managed files PRESERVED in clone ===
Set-Location $REPO_LOCAL
Write-Host "[6/12] Verify operator-managed files present in cloned tree"
$preserveMissing = @()
foreach ($f in $FILES_PRESERVE) {
    if (Test-Path (Join-Path $REPO_LOCAL $f)) {
        Write-Host "  OK $f" -ForegroundColor DarkGreen
    } else {
        Write-Host "  MISSING $f" -ForegroundColor Yellow
        $preserveMissing += $f
    }
}
if ($preserveMissing.Count -gt 0) {
    Write-Host "  WARN: operator-managed files missing from clone: $($preserveMissing -join ', ')" -ForegroundColor Yellow
    Write-Host "        These will not be in the published v3.7.2 unless committed separately." -ForegroundColor Yellow
    $resp = Read-Host "  Continue anyway? (y/n)"
    if ($resp -ne 'y') {
        Write-Host "ABORT: operator-managed file check failed" -ForegroundColor Red
        exit 6
    }
}

# Surface current tracked state (informational; we do NOT wipe)
Write-Host "  Current tracked content (preserved unless explicitly replaced):"
git ls-tree -r HEAD --name-only 2>&1 | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }

# === Step 7: copy 12-file bundle (selective replace + add) ===
Write-Host "[7/12] Stage v3.7.2 bundle (4 REPLACE + 8 NEW)"
foreach ($f in $FILES_ALL) {
    $src = Join-Path $STAGE_SRC $f
    $dst = Join-Path $REPO_LOCAL $f
    $action = if (Test-Path $dst) { "REPLACE" } else { "ADD    " }
    Copy-Item -LiteralPath $src -Destination $dst -Force
    if (-not (Test-Path $dst)) {
        Write-Host "FAIL: copy did not produce $f" -ForegroundColor Red
        exit 7
    }
    Write-Host "  $action $f" -ForegroundColor DarkGreen
}

# === Step 8: post-stage md5 audit on all 8 substrate files ===
Write-Host "[8/12] Post-stage md5 audit (8 substrate files)"
$postFail = $false
foreach ($f in $MD5_CONTRACT.Keys) {
    $staged = Join-Path $REPO_LOCAL $f
    $expected = $MD5_CONTRACT[$f]
    $actual = (Get-FileHash $staged -Algorithm MD5).Hash.ToLower()
    if ($actual -eq $expected) {
        Write-Host "  OK   $f  $actual" -ForegroundColor DarkGreen
    } else {
        Write-Host "  FAIL $f  expected=$expected actual=$actual" -ForegroundColor Red
        $postFail = $true
    }
}
if ($postFail) {
    Write-Host "ABORT: post-stage md5 drift on one or more substrate files" -ForegroundColor Red
    Write-Host "       (likely cause: LF/CRLF conversion during Copy-Item)" -ForegroundColor Red
    exit 8
}
Write-Host "  ALL 8 staged substrate md5 contracts hold" -ForegroundColor DarkGreen

# === Step 9: ensure .gitattributes LF-lock (K24e xxiv discipline) ===
Write-Host "[9/12] Ensure .gitattributes LF-lock (UTF-8 no-BOM)"
$gitattrPath = Join-Path $REPO_LOCAL '.gitattributes'
$gitattrContent = "*.html text eol=lf`n*.md   text eol=lf`n*.cff  text eol=lf`n*.json text eol=lf`n*.jsx  text eol=lf`n*.py   text eol=lf`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($gitattrPath, $gitattrContent, $utf8NoBom)
Write-Host "  OK: .gitattributes (LF-lock for html/md/cff/json/jsx/py)" -ForegroundColor DarkGreen

# === Step 10: git add + commit gate ===
Write-Host "[10/12] git add + surface status"
git add . 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
Write-Host "  git status:"
git status --short 2>&1 | ForEach-Object { Write-Host "    $_" }

Write-Host ""
Write-Host "Commit message: $COMMIT_MSG"
Write-Host "Tag           : $TAG"
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
        Write-Host "  OK: repo description updated to v3.7.2 form" -ForegroundColor DarkGreen
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
Write-Host " DONE - v3.7.2 content-advance re-cut published               " -ForegroundColor Green
Write-Host "==============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Live:  https://github.com/$REPO_SLUG"
Write-Host "Tag :  $TAG pushed."
Write-Host "Md5 :  combined.html  $($MD5_CONTRACT['combined.html'])"
Write-Host "       (pre-stage + post-stage verified across all 8 substrate files)"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Wait ~30-60s for Cloudflare Pages auto-deploy from GitHub push"
Write-Host "  2. Verify edge: curl -s https://library.wuld.ink/ | md5sum"
Write-Host "     Expect: 2accf16a834f31b9e8dbb3fcc7d61a6b (the new v3.7.2 contract)"
Write-Host "  3. If still serving old md5 (dd2abd01...), purge Cloudflare edge cache"
Write-Host "     via dash.cloudflare.com -> wuld.ink -> Caching -> Purge Everything"
Write-Host "  4. Once live md5 confirmed, the wuld.ink CLAUDE.md infra-facts library"
Write-Host "     binding md5 is already updated (Cowork K24r)"
Write-Host ""
