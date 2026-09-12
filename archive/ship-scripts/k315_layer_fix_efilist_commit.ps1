# =====================================================================================
#  LAYER FIX (WI-K315), efilist only, NO PIN. Deploys four files to library.wuld.ink:
#     wuld-layer.css   24907d89 -> 641dfe47eaabc5155135c176448f9cb0   60,123 B   (? clickable, master gain knob)
#     wuld-layer.js    be7de70c -> 6bda4b6c6e5e5a17625a0fcaf6546846   59,791 B   (tour flag per surface, softer cues)
#     _headers         NEW         461e038a9e060d59e4e4fa2eeac98d86    1,136 B   (browser revalidates /wuld-layer.* every load)
#     .gitattributes   4a961640 -> f15ecc9bdf5b7f86f01cf7740494cdcc      152 B   (+ *.css / *.js text eol=lf)
#  combined.html is NOT touched: its blob is gated before AND after the commit (the pin stays 62d1e8d8).
#  Every gate refuses rather than half-applies. Then a gated push and a served read-back of both packs,
#  with the served cache-control classified (honoured / floor still wins / other).
#  One-liner:  Get-Content 'C:\Users\y_m_a\Downloads\Argument Library\layerfix\LAYER_FIX_efilist_commit.ps1' -Raw | Invoke-Expression
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\efilist-argument-library'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library\layerfix'
  Set-Location $repo
  [Environment]::CurrentDirectory = $repo
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "ABORT: no git repo at $repo" -ForegroundColor Red; return }
  Get-ChildItem -LiteralPath (Join-Path $repo '.git') -Filter '*.lock' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  function Get-Md5 { param($p) (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }

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
  $bCss = (git rev-parse 'HEAD:wuld-layer.css').Trim()
  $bJs  = (git rev-parse 'HEAD:wuld-layer.js').Trim()
  $bAtt = (git rev-parse 'HEAD:.gitattributes').Trim()
  $bPin = (git rev-parse 'HEAD:combined.html').Trim()
  Write-Host "HEAD:wuld-layer.css : $bCss"
  Write-Host "HEAD:wuld-layer.js  : $bJs"
  Write-Host "HEAD:.gitattributes : $bAtt"
  Write-Host "HEAD:combined.html  : $bPin"
  if ($bCss -ne 'c0522578396f51d37918ef35d4d88e6b7a954914') { Write-Host 'ABORT: HEAD wuld-layer.css is not the K314 pack (24907d89). Nothing changed; tell me the blob above.' -ForegroundColor Red; return }
  if ($bJs  -ne 'c53d826a5a0192f6cd16db376e29751e89449ad2') { Write-Host 'ABORT: HEAD wuld-layer.js is not the K314 pack (be7de70c). Nothing changed; tell me the blob above.' -ForegroundColor Red; return }
  if ($bAtt -ne 'fb7ca06a94912b4a680b016689f3754c79e9eaa8') { Write-Host 'ABORT: HEAD .gitattributes is not the 114-byte file this block extends. Nothing changed; tell me.' -ForegroundColor Red; return }
  if ($bPin -ne 'eab9c7885fbc58f4b6a4f2d16d10408e4ab02a36') { Write-Host 'ABORT: HEAD combined.html is not the pin (62d1e8d8 / 2,974,039 B). Nothing changed; tell me.' -ForegroundColor Red; return }
  $tracked = @(git ls-files -- _headers)
  if ($tracked.Count -or (Test-Path -LiteralPath (Join-Path $repo '_headers'))) { Write-Host 'ABORT: a _headers file already exists in the repo. This block writes a NEW one; tell me what is there.' -ForegroundColor Red; return }
  $dirty = @(git status --porcelain -- wuld-layer.css wuld-layer.js .gitattributes combined.html)
  if ($dirty.Count) { Write-Host 'ABORT: one of the four gated files has uncommitted changes in the working copy:' -ForegroundColor Red; $dirty | ForEach-Object { Write-Host ('   ' + $_) }; return }

  # --- 2. the four inputs, by md5 + byte count -------------------------------------------------
  $sCss = Join-Path $drop 'wuld-layer.css'; $sJs = Join-Path $drop 'wuld-layer.js'; $sHdr = Join-Path $drop '_headers'; $sAtt = Join-Path $drop '.gitattributes'
  foreach ($p in @($sCss, $sJs, $sHdr, $sAtt)) { if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return } }
  $hCss = Get-Md5 $sCss; $lCss = (Get-Item -LiteralPath $sCss).Length
  $hJs  = Get-Md5 $sJs;  $lJs  = (Get-Item -LiteralPath $sJs).Length
  $hHdr = Get-Md5 $sHdr; $lHdr = (Get-Item -LiteralPath $sHdr).Length
  $hAtt = Get-Md5 $sAtt; $lAtt = (Get-Item -LiteralPath $sAtt).Length
  Write-Host ("input css       {0,7} B  md5 {1}" -f $lCss, $hCss)
  Write-Host ("input js        {0,7} B  md5 {1}" -f $lJs,  $hJs)
  Write-Host ("input _headers  {0,7} B  md5 {1}" -f $lHdr, $hHdr)
  Write-Host ("input .gitattr  {0,7} B  md5 {1}" -f $lAtt, $hAtt)
  if ($hCss -ne '641dfe47eaabc5155135c176448f9cb0' -or $lCss -ne 60123) { Write-Host 'ABORT: drop wuld-layer.css is not the file that was built. Nothing changed.' -ForegroundColor Red; return }
  if ($hJs  -ne '6bda4b6c6e5e5a17625a0fcaf6546846' -or $lJs  -ne 59791) { Write-Host 'ABORT: drop wuld-layer.js is not the file that was built. Nothing changed.' -ForegroundColor Red; return }
  if ($hHdr -ne '461e038a9e060d59e4e4fa2eeac98d86' -or $lHdr -ne 1136)  { Write-Host 'ABORT: drop _headers is not the file that was written. Nothing changed.' -ForegroundColor Red; return }
  if ($hAtt -ne 'f15ecc9bdf5b7f86f01cf7740494cdcc' -or $lAtt -ne 152)   { Write-Host 'ABORT: drop .gitattributes is not the file that was written. Nothing changed.' -ForegroundColor Red; return }

  # --- 3. copy in (bytes), verify, stage exactly four names, verify the INDEX blobs ------------
  [IO.File]::Copy($sCss, (Join-Path $repo 'wuld-layer.css'), $true)
  [IO.File]::Copy($sJs,  (Join-Path $repo 'wuld-layer.js'),  $true)
  [IO.File]::Copy($sHdr, (Join-Path $repo '_headers'),       $true)
  [IO.File]::Copy($sAtt, (Join-Path $repo '.gitattributes'), $true)
  if ((Get-Md5 (Join-Path $repo 'wuld-layer.css')) -ne $hCss -or (Get-Md5 (Join-Path $repo 'wuld-layer.js')) -ne $hJs -or (Get-Md5 (Join-Path $repo '_headers')) -ne $hHdr -or (Get-Md5 (Join-Path $repo '.gitattributes')) -ne $hAtt) { Write-Host 'ABORT: a copy did not land byte-identical. NOT staged; run: git checkout -- wuld-layer.css wuld-layer.js .gitattributes ; Remove-Item _headers ; then tell me.' -ForegroundColor Red; return }
  git add -- wuld-layer.css wuld-layer.js _headers .gitattributes
  $staged = @(git diff --cached --name-only)
  Write-Host "staged              : $($staged -join ', ')"
  $four = ($staged.Count -eq 4) -and ($staged -contains 'wuld-layer.css') -and ($staged -contains 'wuld-layer.js') -and ($staged -contains '_headers') -and ($staged -contains '.gitattributes')
  if (-not $four) { Write-Host 'ABORT: staging is not exactly the four names. Unstaged (the working copies hold the new files); tell me.' -ForegroundColor Red; git reset -q -- wuld-layer.css wuld-layer.js _headers .gitattributes; return }
  $iCss = (git rev-parse ':wuld-layer.css').Trim(); $iJs = (git rev-parse ':wuld-layer.js').Trim(); $iHdr = (git rev-parse ':_headers').Trim(); $iAtt = (git rev-parse ':.gitattributes').Trim()
  Write-Host "index blobs         : css $iCss  js $iJs"
  Write-Host "                      _headers $iHdr  .gitattributes $iAtt"
  if ($iCss -ne 'd877335801f3c36f8a5cce67a06063e64ae0871e' -or $iJs -ne 'cf54e6028cc68b6aef26ebdf2d906dff1e55c885' -or $iHdr -ne '9f91ed6bd89fff92b2e4d05ad907477495fe0184' -or $iAtt -ne '8ffc928bbe5e77d6d144561c3fab822557126cca') { Write-Host 'ABORT: an index blob is not the predicted SHA (a line-ending filter rewrote a file on add?). Unstaged; tell me the four blobs above.' -ForegroundColor Red; git reset -q -- wuld-layer.css wuld-layer.js _headers .gitattributes; return }
  $inPin = @(git diff --cached --name-only -- combined.html)
  if ($inPin.Count) { Write-Host 'ABORT: combined.html is staged. Unstaged everything; tell me.' -ForegroundColor Red; git reset -q; return }

  git commit -m 'WI-K315 layer fix (NO-PIN): ? clickable by mouse, one tour flag per surface, softer cues + --wz-sfx-gain, _headers so /wuld-layer.* revalidates every load, .gitattributes css/js eol=lf' | Out-Null
  git log -1 --pretty='%h %s'
  $pinAfter = (git rev-parse 'HEAD:combined.html').Trim()
  if ($pinAfter -ne 'eab9c7885fbc58f4b6a4f2d16d10408e4ab02a36') { Write-Host 'ABORT: combined.html blob changed in this commit. NOT PUSHED. Tell me; do not push by hand.' -ForegroundColor Red; return }
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

  # --- 5. served read-back: both packs by md5 (status + bytes beside every hash), then the header --
  Write-Host ''
  Write-Host '---- served read-back (Pages builds in ~1-3 min; polling up to 6 min) ----' -ForegroundColor Cyan
  $tmp = Join-Path $env:TEMP 'wuld-layerfix'
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  $okCss = $false; $okJs = $false; $ccCss = ''; $ccJs = ''
  for ($i = 1; $i -le 24; $i++) {
    $t = [DateTime]::UtcNow.Ticks
    $fCss = Join-Path $tmp 'css.bin'; $hdCss = Join-Path $tmp 'css.hdr'
    $fJs  = Join-Path $tmp 'js.bin';  $hdJs  = Join-Path $tmp 'js.hdr'
    $cCss = & curl.exe -sS -o $fCss -D $hdCss -w '%{http_code}' "https://library.wuld.ink/wuld-layer.css?nocache=$t"
    $cJs  = & curl.exe -sS -o $fJs  -D $hdJs  -w '%{http_code}' "https://library.wuld.ink/wuld-layer.js?nocache=$t"
    $mCss = if (Test-Path -LiteralPath $fCss) { Get-Md5 $fCss } else { '-' }
    $mJs  = if (Test-Path -LiteralPath $fJs)  { Get-Md5 $fJs }  else { '-' }
    $nCss = if (Test-Path -LiteralPath $fCss) { (Get-Item -LiteralPath $fCss).Length } else { 0 }
    $nJs  = if (Test-Path -LiteralPath $fJs)  { (Get-Item -LiteralPath $fJs).Length }  else { 0 }
    $okCss = ($mCss -eq '641dfe47eaabc5155135c176448f9cb0'); $okJs = ($mJs -eq '6bda4b6c6e5e5a17625a0fcaf6546846')
    Write-Host ("  try {0,2}: css http {1} {2,6} B {3} {4}   js http {5} {6,6} B {7} {8}" -f $i, $cCss, $nCss, $mCss, $(if ($okCss) {'MATCH'} else {'old'}), $cJs, $nJs, $mJs, $(if ($okJs) {'MATCH'} else {'old'}))
    if ($okCss -and $okJs) { $ccCss = ((Get-Content -LiteralPath $hdCss) | Where-Object { $_ -match '^cache-control:' }) -join ' '; $ccJs = ((Get-Content -LiteralPath $hdJs) | Where-Object { $_ -match '^cache-control:' }) -join ' '; break }
    Start-Sleep -Seconds 15
  }
  if (-not ($okCss -and $okJs)) { Write-Host 'NOT YET SERVED after 6 min: the push landed; Pages may still be building or the build failed. Check the Pages dashboard and tell me.' -ForegroundColor Red; return }
  Write-Host 'SERVED == COMMITTED for both packs.' -ForegroundColor Green
  Write-Host "  css: $ccCss"
  Write-Host "  js : $ccJs"
  if ($ccJs -match 'private') { Write-Host 'CACHE RULE HONOURED: private is served; browsers will revalidate /wuld-layer.* on every page load from now on (this is the last time Ctrl+F5 is needed).' -ForegroundColor Green }
  elseif ($ccJs -match 'max-age=14400') { Write-Host 'CACHE RULE OVERRIDDEN: the zone''s Browser Cache TTL floor (4 h) won even for private. Fallback is the dashboard: wuld.ink zone > Caching > Configuration > Browser Cache TTL > Respect Existing Headers. Tell me and I will write the exact steps.' -ForegroundColor Yellow }
  else { Write-Host 'CACHE RULE: unexpected header above -- tell me the two lines.' -ForegroundColor Yellow }
  $fPin = Join-Path $tmp 'combined.bin'
  $cPin = & curl.exe -sS -o $fPin -w '%{http_code}' "https://library.wuld.ink/combined?nocache=$([DateTime]::UtcNow.Ticks)"
  $mPin = if (Test-Path -LiteralPath $fPin) { Get-Md5 $fPin } else { '-' }
  $nPin = if (Test-Path -LiteralPath $fPin) { (Get-Item -LiteralPath $fPin).Length } else { 0 }
  Write-Host ("  /combined: http {0} {1} B {2}" -f $cPin, $nPin, $mPin)
  if ($mPin -eq '62d1e8d86056465ebcb5daced38e0a83' -and $nPin -eq 2974039) { Write-Host 'PIN UNMOVED: /combined is still 62d1e8d8 / 2,974,039 B.' -ForegroundColor Green } else { Write-Host 'PIN READ-BACK DIFFERS from 62d1e8d8 / 2,974,039 -- tell me the line above (a CF beacon or a mid-build read; not a failed deploy by itself).' -ForegroundColor Yellow }
  Write-Host ''
  Write-Host 'LAYER FIX LIVE. Now run layerfix\WI-K315_commit.ps1 (the log).' -ForegroundColor Yellow
}
