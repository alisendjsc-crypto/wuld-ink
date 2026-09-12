# =====================================================================================
#  WI-K317, efilist only, NO PIN. Deploys four files to library.wuld.ink:
#     wuld-layer.css   ff362370 -> c06d23100aa628b02777736193f90d33   65,661 B   (the sticky bar and sidebar un-stuck under zoom)
#     wuld-layer.js    a0c46518 -> 895325023541685808f1ae332f0739d8   76,494 B   (the pointer is the camera under the magnifier)
#     README.md        8af941da -> 4c9a61597b793b48faddcf5c4e391e54   16,379 B   (one clause on the magnifier)
#     CHANGELOG.md     337f2ef1 -> ce4591c6d38b116883b4026d37986e6a   24,635 B   (the v4.0.2 Layer bullet extended)
#  combined.html is NOT touched: its blob is gated before AND after the commit (the pin stays 62d1e8d8).
#  Every base is gated by its blob at HEAD, every input by md5 + byte count, every index blob by SHA
#  after staging, the staged set exactly; each gate refuses rather than half-applies. Then a gated push
#  and a served read-back of both packs and the pin.
#  One-liner:  Get-Content 'C:\Users\y_m_a\Downloads\Argument Library\k317\K317_efilist_commit.ps1' -Raw | Invoke-Expression
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\efilist-argument-library'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library\k317'
  Set-Location $repo
  [Environment]::CurrentDirectory = $repo
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "ABORT: no git repo at $repo" -ForegroundColor Red; return }
  Get-ChildItem -LiteralPath (Join-Path $repo '.git') -Filter '*.lock' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  function Get-Md5 { param($p) (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }
  $names = @('wuld-layer.css', 'wuld-layer.js', 'README.md', 'CHANGELOG.md')
  $base  = @{ 'wuld-layer.css' = '3c9f7bd827783e41d443218978e3485806860364'; 'wuld-layer.js' = '554e5c9a8ad6a079ba5f0a430526b011d28c2c53';
              'README.md' = '304a3fa40c216ba73f962d182d32a79bf1661a8c'; 'CHANGELOG.md' = '06b1062991d2590bcb8bf48c969f3c56758cf741' }
  $md5   = @{ 'wuld-layer.css' = 'c06d23100aa628b02777736193f90d33'; 'wuld-layer.js' = '895325023541685808f1ae332f0739d8';
              'README.md' = '4c9a61597b793b48faddcf5c4e391e54'; 'CHANGELOG.md' = 'ce4591c6d38b116883b4026d37986e6a' }
  $len   = @{ 'wuld-layer.css' = 65661; 'wuld-layer.js' = 76494; 'README.md' = 16379; 'CHANGELOG.md' = 24635 }
  $blob  = @{ 'wuld-layer.css' = 'd853ddefaa7e2e23063862755e4d82aa5bccbb52'; 'wuld-layer.js' = '609ce6a6487cd7ef1b02040b0c04d4b0bf7c9f48';
              'README.md' = 'b330a19a9ea6a3e1129fac4e47a01880ae324f50'; 'CHANGELOG.md' = '58e1a55130751878052f5a7324c3d9a922f494db' }
  $pinBlob = 'eab9c7885fbc58f4b6a4f2d16d10408e4ab02a36'

  # --- 0. where the clone is ---------------------------------------------------------------------
  $head = (git rev-parse HEAD).Trim()
  Write-Host "HEAD                : $head  $(git log -1 --pretty=%s)"
  git fetch --quiet origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: fetch failed (network?). Nothing changed.' -ForegroundColor Red; return }
  $behind = @(git log --oneline HEAD..origin/main)
  if ($behind.Count) { Write-Host ('ABORT: origin/main has ' + $behind.Count + ' commit(s) this clone does not. Nothing changed; tell me.') -ForegroundColor Red; $behind | ForEach-Object { Write-Host ('   ' + $_) }; return }
  $ahead0 = @(git log --oneline origin/main..HEAD)
  if ($ahead0.Count) { Write-Host ('ABORT: this clone is already ' + $ahead0.Count + ' commit(s) ahead of origin/main. Nothing changed; tell me.') -ForegroundColor Red; $ahead0 | ForEach-Object { Write-Host ('   ' + $_) }; return }

  # --- 1. base guards, by BLOB at HEAD (immune to CRLF working copies) --------------------------
  foreach ($n in $names) {
    $b = (git rev-parse ('HEAD:' + $n)).Trim()
    Write-Host ("HEAD:{0,-16}: {1}" -f $n, $b)
    if ($b -ne $base[$n]) { Write-Host ('ABORT: HEAD ' + $n + ' is not the K316 file this block replaces (expected ' + $base[$n].Substring(0,8) + '). Nothing changed; tell me the blob above.') -ForegroundColor Red; return }
  }
  $bPin = (git rev-parse 'HEAD:combined.html').Trim()
  Write-Host "HEAD:combined.html  : $bPin"
  if ($bPin -ne $pinBlob) { Write-Host 'ABORT: HEAD combined.html is not the pin (62d1e8d8 / 2,974,039 B). Nothing changed; tell me.' -ForegroundColor Red; return }
  $dirty = @(git status --porcelain -- wuld-layer.css wuld-layer.js README.md CHANGELOG.md combined.html)
  if ($dirty.Count) { Write-Host 'ABORT: one of the gated files has uncommitted changes in the working copy:' -ForegroundColor Red; $dirty | ForEach-Object { Write-Host ('   ' + $_) }; return }
  Write-Host 'base blobs          : all four as K316 left them; the pin in place' -ForegroundColor Green

  # --- 2. the four inputs, by md5 + byte count -------------------------------------------------
  foreach ($n in $names) {
    $p = Join-Path $drop $n
    if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
    $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length
    Write-Host ("input {0,-16} {1,7} B  md5 {2}" -f $n, $l, $h)
    if ($h -ne $md5[$n] -or $l -ne $len[$n]) { Write-Host ('ABORT: drop ' + $n + ' is not the file that was built. Nothing changed.') -ForegroundColor Red; return }
  }
  Write-Host 'inputs              : all four match their build hashes' -ForegroundColor Green

  # --- 3. copy in (bytes), verify, stage exactly four names, verify the INDEX blobs ------------
  foreach ($n in $names) { [IO.File]::Copy((Join-Path $drop $n), (Join-Path $repo $n), $true) }
  foreach ($n in $names) {
    if ((Get-Md5 (Join-Path $repo $n)) -ne $md5[$n]) { Write-Host ('ABORT: ' + $n + ' did not land byte-identical. NOT staged; run: git checkout -- wuld-layer.css wuld-layer.js README.md CHANGELOG.md ; then tell me.') -ForegroundColor Red; return }
  }
  git add -- wuld-layer.css wuld-layer.js README.md CHANGELOG.md
  $staged = @(git diff --cached --name-only)
  Write-Host "staged              : $($staged -join ', ')"
  $four = ($staged.Count -eq 4) -and ($staged -contains 'wuld-layer.css') -and ($staged -contains 'wuld-layer.js') -and ($staged -contains 'README.md') -and ($staged -contains 'CHANGELOG.md')
  if (-not $four) { Write-Host 'ABORT: staging is not exactly the four names. Unstaged (the working copies hold the new files); tell me.' -ForegroundColor Red; git reset -q -- wuld-layer.css wuld-layer.js README.md CHANGELOG.md; return }
  foreach ($n in $names) {
    $i = (git rev-parse (':' + $n)).Trim()
    Write-Host ("index {0,-16}: {1}" -f $n, $i)
    if ($i -ne $blob[$n]) { Write-Host ('ABORT: index blob for ' + $n + ' is not the predicted ' + $blob[$n].Substring(0,8) + ' (a line-ending filter rewrote it on add?). Unstaged; tell me the blobs above.') -ForegroundColor Red; git reset -q -- wuld-layer.css wuld-layer.js README.md CHANGELOG.md; return }
  }
  $inPin = @(git diff --cached --name-only -- combined.html)
  if ($inPin.Count) { Write-Host 'ABORT: combined.html is staged. Unstaged everything; tell me.' -ForegroundColor Red; git reset -q; return }

  git commit -m 'WI-K317 layer (NO-PIN): under the magnifier the pointer is the camera (the sweep is the hidden extent, bounded by the geometry); the sticky bar and the examples sidebar un-stuck while zoomed; README and CHANGELOG say so' | Out-Null
  git log -1 --pretty='%h %s'
  $pinAfter = (git rev-parse 'HEAD:combined.html').Trim()
  if ($pinAfter -ne $pinBlob) { Write-Host 'ABORT: combined.html blob changed in this commit. NOT PUSHED. Tell me; do not push by hand.' -ForegroundColor Red; return }
  Write-Host 'pin blob unchanged  : eab9c788 (combined.html 62d1e8d8 / 2,974,039 B)' -ForegroundColor Green

  # --- 4. the push, gated -------------------------------------------------------------------------
  $ErrorActionPreference = 'Continue'
  Write-Host ''
  Write-Host '---- push ----' -ForegroundColor Cyan
  $ahead = @(git log --oneline origin/main..HEAD)
  $ahead | ForEach-Object { Write-Host ('   ' + $_) }
  if ($ahead.Count -ne 1) { Write-Host ('ABORT: expected exactly 1 commit above origin/main, found ' + $ahead.Count + '. Not pushed; tell me.') -ForegroundColor Red; return }
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'PUSH FAILED - nothing changed on origin; the commit is local. Tell me.' -ForegroundColor Red; return }
  Write-Host ('pushed. origin/main is now ' + (git rev-parse --short origin/main)) -ForegroundColor Green

  # --- 5. served read-back: both packs by md5 (status + bytes beside every hash), then the pin ----
  Write-Host ''
  Write-Host '---- served read-back (Pages builds in ~1-3 min; polling up to 6 min) ----' -ForegroundColor Cyan
  $tmp = Join-Path $env:TEMP 'wuld-k317'
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  $okCss = $false; $okJs = $false
  for ($i = 1; $i -le 24; $i++) {
    $t = [DateTime]::UtcNow.Ticks
    $fCss = Join-Path $tmp 'css.bin'; $fJs = Join-Path $tmp 'js.bin'
    $cCss = & curl.exe -sS -o $fCss -w '%{http_code}' "https://library.wuld.ink/wuld-layer.css?nocache=$t"
    $cJs  = & curl.exe -sS -o $fJs  -w '%{http_code}' "https://library.wuld.ink/wuld-layer.js?nocache=$t"
    $mCss = if (Test-Path -LiteralPath $fCss) { Get-Md5 $fCss } else { '-' }
    $mJs  = if (Test-Path -LiteralPath $fJs)  { Get-Md5 $fJs }  else { '-' }
    $nCss = if (Test-Path -LiteralPath $fCss) { (Get-Item -LiteralPath $fCss).Length } else { 0 }
    $nJs  = if (Test-Path -LiteralPath $fJs)  { (Get-Item -LiteralPath $fJs).Length }  else { 0 }
    $okCss = ($mCss -eq $md5['wuld-layer.css']); $okJs = ($mJs -eq $md5['wuld-layer.js'])
    Write-Host ("  try {0,2}: css http {1} {2,6} B {3} {4}   js http {5} {6,6} B {7} {8}" -f $i, $cCss, $nCss, $mCss, $(if ($okCss) {'MATCH'} else {'old'}), $cJs, $nJs, $mJs, $(if ($okJs) {'MATCH'} else {'old'}))
    if ($okCss -and $okJs) { break }
    Start-Sleep -Seconds 15
  }
  if (-not ($okCss -and $okJs)) { Write-Host 'NOT YET SERVED after 6 min: the push landed; Pages may still be building or the build failed. Check the Pages dashboard and tell me.' -ForegroundColor Red; return }
  Write-Host 'SERVED == COMMITTED for both packs.' -ForegroundColor Green
  $fPin = Join-Path $tmp 'combined.bin'
  $cPin = & curl.exe -sS -o $fPin -w '%{http_code}' "https://library.wuld.ink/combined?nocache=$([DateTime]::UtcNow.Ticks)"
  $mPin = if (Test-Path -LiteralPath $fPin) { Get-Md5 $fPin } else { '-' }
  $nPin = if (Test-Path -LiteralPath $fPin) { (Get-Item -LiteralPath $fPin).Length } else { 0 }
  Write-Host ("  /combined: http {0} {1} B {2}" -f $cPin, $nPin, $mPin)
  if ($mPin -eq '62d1e8d86056465ebcb5daced38e0a83' -and $nPin -eq 2974039) { Write-Host 'PIN UNMOVED: /combined is still 62d1e8d8 / 2,974,039 B.' -ForegroundColor Green } else { Write-Host 'PIN READ-BACK DIFFERS from 62d1e8d8 / 2,974,039 -- tell me the line above (a CF beacon or a mid-build read; not a failed deploy by itself).' -ForegroundColor Yellow }
  Write-Host ''
  Write-Host 'WI-K317 LIVE on library.wuld.ink. Now run k317\WI-K317_commit.ps1 (the log).' -ForegroundColor Yellow
}
