# =====================================================================================
#  WI-K318, efilist only: THE PIN MOVE v4.0.2 -> v4.0.3 (the phone layout + the graph views' SVG label fills).
#  Six files, one commit, to library.wuld.ink:
#     combined.html                          62d1e8d8 -> 62c733ac8263e6413816cfb6d28e3b8a   2,982,420 B   (THE PIN MOVES)
#     README.md                              4c9a6159 -> 083adeeb766a917c290bca428873fe1b      16,797 B   (pin table, badge, status line)
#     CHANGELOG.md                           ce4591c6 -> 355329b376b1ef8e53ecf7fd5b9a7c88      32,313 B   (the v4.0.3 entry above v4.0.2's)
#     efilist_argument_library_v4_0_0.json   a922ba49 -> 351d14e249ba2907e9d2fd945f1b7ab8   1,333,912 B   (version field only; filename frozen)
#     libraries/index.html                   e6442297 -> 422660367c973856f9556835c3877a49      15,331 B   (badge pinned v4.0.3)
#     screenshots/dependency-graph.png       2b151554 -> b121b95b65e17e18367d846e13c8ac8f     329,902 B   (re-captured; travels as .b64 text)
#  The layer is NOT touched (wuld-layer.css c06d2310 / wuld-layer.js 89532502 stay). Every base is gated by its blob at HEAD,
#  every input by md5 + byte count, every index blob by SHA after staging, the staged set exactly; the pin's blob AFTER the
#  commit must be the predicted 3f07748b. Then a gated push and a served read-back: /combined three times agreeing on the
#  new md5 (status + bytes beside every hash), then both packs and the front door by md5 / badge.
#  One-liner:  Get-Content 'C:\Users\y_m_a\Downloads\Argument Library\k318\K318_efilist_commit.ps1' -Raw | Invoke-Expression
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\efilist-argument-library'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library\k318'
  Set-Location $repo
  [Environment]::CurrentDirectory = $repo
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "ABORT: no git repo at $repo" -ForegroundColor Red; return }
  Get-ChildItem -LiteralPath (Join-Path $repo '.git') -Filter '*.lock' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  function Get-Md5 { param($p) (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }
  $names = @('combined.html', 'README.md', 'CHANGELOG.md', 'efilist_argument_library_v4_0_0.json', 'libraries/index.html', 'screenshots/dependency-graph.png')
  $base  = @{ 'combined.html' = 'eab9c7885fbc58f4b6a4f2d16d10408e4ab02a36'; 'README.md' = 'b330a19a9ea6a3e1129fac4e47a01880ae324f50'; 'CHANGELOG.md' = '58e1a55130751878052f5a7324c3d9a922f494db';
              'efilist_argument_library_v4_0_0.json' = 'de63025163602d32a2969cd5f05e39e77b67d606'; 'libraries/index.html' = 'b0644b790d874da4d2e27083ae9b4fb079a88875'; 'screenshots/dependency-graph.png' = '642e16827852586f320e0875e181f7e59048b7f2' }
  $md5   = @{ 'combined.html' = '62c733ac8263e6413816cfb6d28e3b8a'; 'README.md' = '083adeeb766a917c290bca428873fe1b'; 'CHANGELOG.md' = '355329b376b1ef8e53ecf7fd5b9a7c88';
              'efilist_argument_library_v4_0_0.json' = '351d14e249ba2907e9d2fd945f1b7ab8'; 'libraries/index.html' = '422660367c973856f9556835c3877a49'; 'screenshots/dependency-graph.png' = 'b121b95b65e17e18367d846e13c8ac8f' }
  $len   = @{ 'combined.html' = 2982420; 'README.md' = 16797; 'CHANGELOG.md' = 32313; 'efilist_argument_library_v4_0_0.json' = 1333912; 'libraries/index.html' = 15331; 'screenshots/dependency-graph.png' = 329902 }
  $blob  = @{ 'combined.html' = '3f07748b76693490817aaf2f04f768502574a310'; 'README.md' = 'cd8e18833243517e73df56e7a3a4e247b8613116'; 'CHANGELOG.md' = 'e69862b27c94daabb816cc4ce908b83ebe76b12a';
              'efilist_argument_library_v4_0_0.json' = '6df1d7765cbb31be9567b9049ba650f032175d00'; 'libraries/index.html' = '661ece8b2c65a5fb5e9e052efdad0847d103aa83'; 'screenshots/dependency-graph.png' = '7e0918b9984c16330dfafa70484e2f1b16949333' }
  $oldPinMd5 = '62d1e8d86056465ebcb5daced38e0a83'; $oldPinLen = 2974039
  $newPinMd5 = '62c733ac8263e6413816cfb6d28e3b8a'; $newPinLen = 2982420; $newPinBlob = '3f07748b76693490817aaf2f04f768502574a310'
  $b64Name = 'screenshots\dependency-graph.png.b64'; $b64Md5 = 'a9527547ba9be58acb1bb3aab82f6f10'; $b64Len = 439872

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
    Write-Host ("HEAD:{0,-38}: {1}" -f $n, $b)
    if ($b -ne $base[$n]) { Write-Host ('ABORT: HEAD ' + $n + ' is not the file this block replaces (expected ' + $base[$n].Substring(0,8) + '). Nothing changed; tell me the blob above.') -ForegroundColor Red; return }
  }
  Write-Host 'base blobs          : all six as K317 left them; the pin (eab9c788 = 62d1e8d8 / 2,974,039 B) in place' -ForegroundColor Green
  $dirty = @(git status --porcelain -- combined.html README.md CHANGELOG.md efilist_argument_library_v4_0_0.json libraries/index.html screenshots/dependency-graph.png wuld-layer.css wuld-layer.js)
  if ($dirty.Count) { Write-Host 'ABORT: one of the gated files has uncommitted changes in the working copy:' -ForegroundColor Red; $dirty | ForEach-Object { Write-Host ('   ' + $_) }; return }
  $bCss = (git rev-parse 'HEAD:wuld-layer.css').Trim(); $bJs = (git rev-parse 'HEAD:wuld-layer.js').Trim()
  if ($bCss -ne 'd853ddefaa7e2e23063862755e4d82aa5bccbb52' -or $bJs -ne '609ce6a6487cd7ef1b02040b0c04d4b0bf7c9f48') { Write-Host 'ABORT: the layer packs at HEAD are not the K317 packs (c06d2310 / 89532502). Another seat moved the layer; tell me.' -ForegroundColor Red; return }

  # --- 2. the inputs, by md5 + byte count (the PNG as base64 text, decoded here and gated as bytes) ---
  foreach ($n in $names) {
    if ($n -eq 'screenshots/dependency-graph.png') { continue }
    $p = Join-Path $drop ($n.Replace('/', '\'))
    if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
    $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length
    Write-Host ("input {0,-38} {1,9} B  md5 {2}" -f $n, $l, $h)
    if ($h -ne $md5[$n] -or $l -ne $len[$n]) { Write-Host ('ABORT: drop ' + $n + ' is not the file that was built. Nothing changed.') -ForegroundColor Red; return }
  }
  $pB64 = Join-Path $drop $b64Name
  if (-not (Test-Path -LiteralPath $pB64)) { Write-Host "ABORT: $pB64 missing." -ForegroundColor Red; return }
  $hB64 = Get-Md5 $pB64; $lB64 = (Get-Item -LiteralPath $pB64).Length
  Write-Host ("input {0,-38} {1,9} B  md5 {2}" -f $b64Name, $lB64, $hB64)
  if ($hB64 -ne $b64Md5 -or $lB64 -ne $b64Len) { Write-Host 'ABORT: drop screenshots\dependency-graph.png.b64 is not the file that was written. Nothing changed.' -ForegroundColor Red; return }
  $pngBytes = [Convert]::FromBase64String((([IO.File]::ReadAllText($pB64)) -replace '\s', ''))
  $hPng = ([BitConverter]::ToString([System.Security.Cryptography.MD5]::Create().ComputeHash($pngBytes))).Replace('-','').ToLower()
  Write-Host ("decoded {0,-36} {1,9} B  md5 {2}" -f 'screenshots/dependency-graph.png', $pngBytes.Length, $hPng)
  if ($hPng -ne $md5['screenshots/dependency-graph.png'] -or $pngBytes.Length -ne $len['screenshots/dependency-graph.png']) { Write-Host 'ABORT: the decoded PNG is not the capture that was made. Nothing changed.' -ForegroundColor Red; return }
  Write-Host 'inputs              : all six match their build hashes' -ForegroundColor Green

  # --- 3. copy in (bytes), verify, stage exactly six names, verify the INDEX blobs ------------
  foreach ($n in $names) {
    if ($n -eq 'screenshots/dependency-graph.png') { [IO.File]::WriteAllBytes((Join-Path $repo 'screenshots\dependency-graph.png'), $pngBytes) }
    else { [IO.File]::Copy((Join-Path $drop ($n.Replace('/', '\'))), (Join-Path $repo ($n.Replace('/', '\'))), $true) }
  }
  foreach ($n in $names) {
    if ((Get-Md5 (Join-Path $repo ($n.Replace('/', '\')))) -ne $md5[$n]) { Write-Host ('ABORT: ' + $n + ' did not land byte-identical. NOT staged; run: git checkout -- combined.html README.md CHANGELOG.md efilist_argument_library_v4_0_0.json libraries/index.html screenshots/dependency-graph.png ; then tell me.') -ForegroundColor Red; return }
  }
  git add -- combined.html README.md CHANGELOG.md efilist_argument_library_v4_0_0.json libraries/index.html screenshots/dependency-graph.png
  $staged = @(git diff --cached --name-only)
  Write-Host "staged              : $($staged -join ', ')"
  $ok = ($staged.Count -eq $names.Count)
  foreach ($n in $names) { if (-not ($staged -contains $n)) { $ok = $false } }
  if (-not $ok) { Write-Host 'ABORT: staging is not exactly the six names. Unstaged (the working copies hold the new files); tell me.' -ForegroundColor Red; git reset -q -- combined.html README.md CHANGELOG.md efilist_argument_library_v4_0_0.json libraries/index.html screenshots/dependency-graph.png; return }
  foreach ($n in $names) {
    $i = (git rev-parse (':' + $n)).Trim()
    Write-Host ("index {0,-38}: {1}" -f $n, $i)
    if ($i -ne $blob[$n]) { Write-Host ('ABORT: index blob for ' + $n + ' is not the predicted ' + $blob[$n].Substring(0,8) + ' (a line-ending filter rewrote it on add?). Unstaged; tell me the blobs above.') -ForegroundColor Red; git reset -q -- combined.html README.md CHANGELOG.md efilist_argument_library_v4_0_0.json libraries/index.html screenshots/dependency-graph.png; return }
  }
  Write-Host 'index blobs         : all six as predicted' -ForegroundColor Green

  git commit -m 'v4.0.3 pin move (62d1e8d8->62c733ac, 2,974,039->2,982,420 B): the phone layout (one media block at 600px and under; the graph canvases fit their drawing) + the graph views SVG label fills to AA on their painted ground; README, CHANGELOG, corpus version field, front-door badge, dependency-graph capture; no content change; layer untouched (WI-K318)' | Out-Null
  git log -1 --pretty='%h %s'
  $pinAfter = (git rev-parse 'HEAD:combined.html').Trim()
  if ($pinAfter -ne $newPinBlob) { Write-Host ('ABORT: HEAD combined.html after the commit is ' + $pinAfter + ', not the predicted ' + $newPinBlob.Substring(0,8) + '. NOT PUSHED. Tell me; do not push by hand.') -ForegroundColor Red; return }
  $leftover = @(git status --porcelain -- combined.html README.md CHANGELOG.md efilist_argument_library_v4_0_0.json libraries/index.html screenshots/dependency-graph.png)
  if ($leftover.Count) { Write-Host 'ABORT: something is still modified or staged after the commit. NOT PUSHED; tell me.' -ForegroundColor Red; $leftover | ForEach-Object { Write-Host ('   ' + $_) }; return }
  Write-Host 'pin blob after      : 3f07748b (combined.html 62c733ac / 2,982,420 B) -- the new pin is committed' -ForegroundColor Green

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

  # --- 5. served read-back: /combined three times agreeing on the NEW pin, then the packs and the front door ----
  Write-Host ''
  Write-Host '---- served read-back of /combined (Pages builds in ~1-3 min; polling up to 8 min; a round is three fetches) ----' -ForegroundColor Cyan
  $tmp = Join-Path $env:TEMP 'wuld-k318'
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  $live = $false
  for ($i = 1; $i -le 32; $i++) {
    $hits = 0; $line = ''
    for ($k = 1; $k -le 3; $k++) {
      $f = Join-Path $tmp ('combined_' + $k + '.bin')
      if (Test-Path -LiteralPath $f) { Remove-Item -LiteralPath $f -Force }
      $code = & curl.exe -sS -o $f -w '%{http_code}' "https://library.wuld.ink/combined?nocache=$([DateTime]::UtcNow.Ticks)"
      $m = if (Test-Path -LiteralPath $f) { Get-Md5 $f } else { '-' }
      $nb = if (Test-Path -LiteralPath $f) { (Get-Item -LiteralPath $f).Length } else { 0 }
      $tag = if ($m -eq $newPinMd5 -and $nb -eq $newPinLen) { 'NEW' } elseif ($m -eq $oldPinMd5) { 'old' } else { '???' }
      if ($tag -eq 'NEW') { $hits++ }
      $line += (' [{0}] http {1} {2,9} B {3} {4}' -f $k, $code, $nb, $m, $tag)
    }
    Write-Host ('  try {0,2}:{1}' -f $i, $line)
    if ($hits -eq 3) { $live = $true; break }
    Start-Sleep -Seconds 15
  }
  if (-not $live) { Write-Host 'NOT YET SERVED after 8 min: the push landed; Pages may still be building, or the build failed. Check the Pages dashboard and tell me. Do NOT run the wuld-ink relabel until /combined reads 62c733ac three times.' -ForegroundColor Red; return }
  Write-Host 'SERVED == COMMITTED: /combined is 62c733ac8263e6413816cfb6d28e3b8a / 2,982,420 B, three fetches agreeing. The pin has moved.' -ForegroundColor Green
  $fCss = Join-Path $tmp 'css.bin'; $fJs = Join-Path $tmp 'js.bin'; $fIdx = Join-Path $tmp 'libraries.html'
  $cCss = & curl.exe -sS -o $fCss -w '%{http_code}' "https://library.wuld.ink/wuld-layer.css?nocache=$([DateTime]::UtcNow.Ticks)"
  $cJs  = & curl.exe -sS -o $fJs  -w '%{http_code}' "https://library.wuld.ink/wuld-layer.js?nocache=$([DateTime]::UtcNow.Ticks)"
  $cIdx = & curl.exe -sS -o $fIdx -w '%{http_code}' "https://library.wuld.ink/libraries/?nocache=$([DateTime]::UtcNow.Ticks)"
  $mCss = if (Test-Path -LiteralPath $fCss) { Get-Md5 $fCss } else { '-' }
  $mJs  = if (Test-Path -LiteralPath $fJs)  { Get-Md5 $fJs }  else { '-' }
  $idx  = if (Test-Path -LiteralPath $fIdx) { [IO.File]::ReadAllText($fIdx) } else { '' }
  $badge = ([regex]::Matches($idx, 'pinned v4\.0\.3')).Count; $badgeOld = ([regex]::Matches($idx, 'pinned v4\.0\.2')).Count
  Write-Host ("  wuld-layer.css : http {0} {1} {2}" -f $cCss, $mCss, $(if ($mCss -eq 'c06d23100aa628b02777736193f90d33') {'UNCHANGED (as it must be)'} else {'DIFFERS from c06d2310 -- tell me'}))
  Write-Host ("  wuld-layer.js  : http {0} {1} {2}" -f $cJs, $mJs, $(if ($mJs -eq '895325023541685808f1ae332f0739d8') {'UNCHANGED (as it must be)'} else {'DIFFERS from 89532502 -- tell me'}))
  Write-Host ("  /libraries/    : http {0}  pinned v4.0.3 x{1}  pinned v4.0.2 x{2} {3}" -f $cIdx, $badge, $badgeOld, $(if ($badge -ge 1 -and $badgeOld -eq 0) {'BADGE MOVED'} else {'badge not yet served (the front door may lag a minute; re-fetch by hand)'}))
  Write-Host ''
  Write-Host 'v4.0.3 IS LIVE on library.wuld.ink. Next: k318\WULD_v403_relabel_commit.ps1 (wuld-ink), then k318\WULD_archive_commit.ps1, then k318\WI-K318_commit.ps1 (the log).' -ForegroundColor Yellow
}
