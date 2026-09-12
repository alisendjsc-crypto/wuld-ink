# =====================================================================================
#  WI-K316, efilist only, NO PIN. Twenty files to library.wuld.ink in ONE commit:
#   - wuld-layer.css / wuld-layer.js : the FEEDBACK control opens an in-page form (the contact relay; email
#     optional; the mail draft kept as a link) + the pan clip (no 6px horizontal scroll at the left edge)
#   - the five wings + libraries/index.html : four mode buttons -> two toggles; the front-door badge v4.0.2
#   - README.md (rewritten, v4.0.2 pin table, layer section, nine captures), CHANGELOG.md (v4.0.2 entry),
#     efilist_argument_library_v4_0_0.json (version field 4.0.1 -> 4.0.2 only), screenshots/*.png (9, carried as .b64 text
#     because the file bridge re-encodes PNGs in transit; decoded on this machine and md5-gated as bytes)
#  combined.html is NOT touched: its blob is gated before AND after the commit (the pin stays 62d1e8d8).
#  Every input is gated by md5 + byte count, every base by its blob at HEAD, every index blob by SHA after
#  staging; exactly twenty names staged or nothing commits. Then a gated push and a served read-back.
#  One-liner:  Get-Content 'C:\Users\y_m_a\Downloads\Argument Library\k316\K316_efilist_commit.ps1' -Raw | Invoke-Expression
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\efilist-argument-library'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library\k316'
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

  # --- 1. base guards, by BLOB at HEAD; new files must be absent -------------------------------
  $bPin = (git rev-parse 'HEAD:combined.html').Trim()
  Write-Host "HEAD:combined.html  : $bPin"
  if ($bPin -ne 'eab9c7885fbc58f4b6a4f2d16d10408e4ab02a36') { Write-Host 'ABORT: HEAD combined.html is not the pin (62d1e8d8 / 2,974,039 B). Nothing changed; tell me.' -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:wuld-layer.css').Trim(); if ($b -ne 'd877335801f3c36f8a5cce67a06063e64ae0871e') { Write-Host ('ABORT: HEAD wuld-layer.css is ' + $b + ', not the file this block replaces (641dfe47). Nothing changed; tell me.') -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:wuld-layer.js').Trim(); if ($b -ne 'cf54e6028cc68b6aef26ebdf2d906dff1e55c885') { Write-Host ('ABORT: HEAD wuld-layer.js is ' + $b + ', not the file this block replaces (6bda4b6c). Nothing changed; tell me.') -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:right-to-die/combined.html').Trim(); if ($b -ne '6c6bc3db6c950c26c6d46d781dfab856401bb33e') { Write-Host ('ABORT: HEAD right-to-die/combined.html is ' + $b + ', not the file this block replaces (e8df1c12). Nothing changed; tell me.') -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:abortion/combined.html').Trim(); if ($b -ne 'e2316c7e6ef336ec7dec195511a221e0e7ea5461') { Write-Host ('ABORT: HEAD abortion/combined.html is ' + $b + ', not the file this block replaces (36018560). Nothing changed; tell me.') -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:transgenderism/combined.html').Trim(); if ($b -ne 'c9095ad4acd05419f1711e2a92258477aaa66f1c') { Write-Host ('ABORT: HEAD transgenderism/combined.html is ' + $b + ', not the file this block replaces (48b4844b). Nothing changed; tell me.') -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:anthropocentrism/combined.html').Trim(); if ($b -ne '1f93e7a50228e801851cfe6a5782f780b83bef11') { Write-Host ('ABORT: HEAD anthropocentrism/combined.html is ' + $b + ', not the file this block replaces (87bb91c6). Nothing changed; tell me.') -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:veganism/combined.html').Trim(); if ($b -ne 'eca16e1a87e8b67a5735cd8677539944630ebc16') { Write-Host ('ABORT: HEAD veganism/combined.html is ' + $b + ', not the file this block replaces (f0e56086). Nothing changed; tell me.') -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:libraries/index.html').Trim(); if ($b -ne 'c03bfd1174386845de78eedf6c60b42fbd19025d') { Write-Host ('ABORT: HEAD libraries/index.html is ' + $b + ', not the file this block replaces (4497457a). Nothing changed; tell me.') -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:README.md').Trim(); if ($b -ne '10979a4a75d20ec9481d9f811602f311aca75312') { Write-Host ('ABORT: HEAD README.md is ' + $b + ', not the file this block replaces (aedc0454). Nothing changed; tell me.') -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:CHANGELOG.md').Trim(); if ($b -ne 'd238c1074bd2f6363de2a0e34688e53883713180') { Write-Host ('ABORT: HEAD CHANGELOG.md is ' + $b + ', not the file this block replaces (494ca165). Nothing changed; tell me.') -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:efilist_argument_library_v4_0_0.json').Trim(); if ($b -ne 'fed86d84ce50deecc34f9e092c5d673d9680ae4b') { Write-Host ('ABORT: HEAD efilist_argument_library_v4_0_0.json is ' + $b + ', not the file this block replaces (ace3f963). Nothing changed; tell me.') -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:screenshots/argument-flow-map1.png').Trim(); if ($b -ne '4ed4f90d9a89682a2b49bfa2ee461be0a310762d') { Write-Host ('ABORT: HEAD screenshots/argument-flow-map1.png is ' + $b + ', not the file this block replaces (d38aeda1). Nothing changed; tell me.') -ForegroundColor Red; return }
  $b = (git rev-parse 'HEAD:screenshots/real-world-examples.png').Trim(); if ($b -ne '5652c3425ddbdff9eace638df3e36d8087c702a3') { Write-Host ('ABORT: HEAD screenshots/real-world-examples.png is ' + $b + ', not the file this block replaces (a782af34). Nothing changed; tell me.') -ForegroundColor Red; return }
  $t = @(git ls-files -- 'screenshots/dependency-graph.png'); if ($t.Count -or (Test-Path -LiteralPath (Join-Path $repo 'screenshots\dependency-graph.png'))) { Write-Host 'ABORT: screenshots/dependency-graph.png already exists (this block adds it new). Nothing changed; tell me.' -ForegroundColor Red; return }
  $t = @(git ls-files -- 'screenshots/feedback-panel.png'); if ($t.Count -or (Test-Path -LiteralPath (Join-Path $repo 'screenshots\feedback-panel.png'))) { Write-Host 'ABORT: screenshots/feedback-panel.png already exists (this block adds it new). Nothing changed; tell me.' -ForegroundColor Red; return }
  $t = @(git ls-files -- 'screenshots/flagship-high-contrast.png'); if ($t.Count -or (Test-Path -LiteralPath (Join-Path $repo 'screenshots\flagship-high-contrast.png'))) { Write-Host 'ABORT: screenshots/flagship-high-contrast.png already exists (this block adds it new). Nothing changed; tell me.' -ForegroundColor Red; return }
  $t = @(git ls-files -- 'screenshots/flagship-library.png'); if ($t.Count -or (Test-Path -LiteralPath (Join-Path $repo 'screenshots\flagship-library.png'))) { Write-Host 'ABORT: screenshots/flagship-library.png already exists (this block adds it new). Nothing changed; tell me.' -ForegroundColor Red; return }
  $t = @(git ls-files -- 'screenshots/magnifier.png'); if ($t.Count -or (Test-Path -LiteralPath (Join-Path $repo 'screenshots\magnifier.png'))) { Write-Host 'ABORT: screenshots/magnifier.png already exists (this block adds it new). Nothing changed; tell me.' -ForegroundColor Red; return }
  $t = @(git ls-files -- 'screenshots/mechanism-web.png'); if ($t.Count -or (Test-Path -LiteralPath (Join-Path $repo 'screenshots\mechanism-web.png'))) { Write-Host 'ABORT: screenshots/mechanism-web.png already exists (this block adds it new). Nothing changed; tell me.' -ForegroundColor Red; return }
  $t = @(git ls-files -- 'screenshots/wing-veganism.png'); if ($t.Count -or (Test-Path -LiteralPath (Join-Path $repo 'screenshots\wing-veganism.png'))) { Write-Host 'ABORT: screenshots/wing-veganism.png already exists (this block adds it new). Nothing changed; tell me.' -ForegroundColor Red; return }
  Write-Host 'base blobs          : all as expected; new files absent' -ForegroundColor Green
  $dirty = @(git status --porcelain -- 'wuld-layer.css' 'wuld-layer.js' 'right-to-die/combined.html' 'abortion/combined.html' 'transgenderism/combined.html' 'anthropocentrism/combined.html' 'veganism/combined.html' 'libraries/index.html' 'README.md' 'CHANGELOG.md' 'efilist_argument_library_v4_0_0.json' 'screenshots/argument-flow-map1.png' 'screenshots/real-world-examples.png' combined.html)
  if ($dirty.Count) { Write-Host 'ABORT: a gated file has uncommitted changes in the working copy:' -ForegroundColor Red; $dirty | ForEach-Object { Write-Host ('   ' + $_) }; return }

  # --- 2. the twenty inputs, by md5 + byte count -------------------------------------------------
  $p = Join-Path $drop 'wuld-layer.css'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne 'ff36237021ef307a1b612a9da9e81f68' -or $l -ne 63976) { Write-Host ('ABORT: drop wuld-layer.css is ' + $h + ' / ' + $l + ' B, not the file that was built (ff362370 / 63976). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'wuld-layer.js'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne 'a0c46518eeb88c4bc151ab1797e7eb6a' -or $l -ne 69958) { Write-Host ('ABORT: drop wuld-layer.js is ' + $h + ' / ' + $l + ' B, not the file that was built (a0c46518 / 69958). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'right-to-die\combined.html'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '1b01396e263ca13b53be25a06a4e94bf' -or $l -ne 32536) { Write-Host ('ABORT: drop right-to-die/combined.html is ' + $h + ' / ' + $l + ' B, not the file that was built (1b01396e / 32536). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'abortion\combined.html'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '12ca434ce5bf91aded122d69f822b426' -or $l -ne 33904) { Write-Host ('ABORT: drop abortion/combined.html is ' + $h + ' / ' + $l + ' B, not the file that was built (12ca434c / 33904). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'transgenderism\combined.html'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '466fc6cbc3b98250d4e34174d54057bc' -or $l -ne 33151) { Write-Host ('ABORT: drop transgenderism/combined.html is ' + $h + ' / ' + $l + ' B, not the file that was built (466fc6cb / 33151). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'anthropocentrism\combined.html'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '08be61575c51b0d66df419cfd7848fc3' -or $l -ne 32992) { Write-Host ('ABORT: drop anthropocentrism/combined.html is ' + $h + ' / ' + $l + ' B, not the file that was built (08be6157 / 32992). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'veganism\combined.html'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne 'd81d504143bd978e7d8ec8f9e4e65468' -or $l -ne 33800) { Write-Host ('ABORT: drop veganism/combined.html is ' + $h + ' / ' + $l + ' B, not the file that was built (d81d5041 / 33800). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'libraries\index.html'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne 'e6442297aa2f34bd1762c8bfc0052e58' -or $l -ne 15331) { Write-Host ('ABORT: drop libraries/index.html is ' + $h + ' / ' + $l + ' B, not the file that was built (e6442297 / 15331). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'README.md'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '8af941da42ea3404b3ae86862eb16282' -or $l -ne 16231) { Write-Host ('ABORT: drop README.md is ' + $h + ' / ' + $l + ' B, not the file that was built (8af941da / 16231). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'CHANGELOG.md'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '337f2ef18a93be6362a2dc091227c938' -or $l -ne 24127) { Write-Host ('ABORT: drop CHANGELOG.md is ' + $h + ' / ' + $l + ' B, not the file that was built (337f2ef1 / 24127). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'efilist_argument_library_v4_0_0.json'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne 'a922ba4914608842f328830284ddc3f0' -or $l -ne 1333912) { Write-Host ('ABORT: drop efilist_argument_library_v4_0_0.json is ' + $h + ' / ' + $l + ' B, not the file that was built (a922ba49 / 1333912). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'screenshots\argument-flow-map1.png.b64'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '4e0dfdb5ea2510e9897ff6ac6dd41065' -or $l -ne 266895) { Write-Host ('ABORT: drop screenshots/argument-flow-map1.png.b64 is ' + $h + ' / ' + $l + ' B, not the file that was written (4e0dfdb5 / 266895). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'screenshots\real-world-examples.png.b64'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne 'a33c5894c73cf597ec81427ebc153609' -or $l -ne 281833) { Write-Host ('ABORT: drop screenshots/real-world-examples.png.b64 is ' + $h + ' / ' + $l + ' B, not the file that was written (a33c5894 / 281833). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'screenshots\dependency-graph.png.b64'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne 'bd158fcaa46626a8d14f07e3742b467b' -or $l -ne 439249) { Write-Host ('ABORT: drop screenshots/dependency-graph.png.b64 is ' + $h + ' / ' + $l + ' B, not the file that was written (bd158fca / 439249). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'screenshots\feedback-panel.png.b64'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '066a269b5f1fe9749e71bf5b6d5e832c' -or $l -ne 267770) { Write-Host ('ABORT: drop screenshots/feedback-panel.png.b64 is ' + $h + ' / ' + $l + ' B, not the file that was written (066a269b / 267770). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'screenshots\flagship-high-contrast.png.b64'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '3670c52aab755020b23dd8ffb63c6ee3' -or $l -ne 40883) { Write-Host ('ABORT: drop screenshots/flagship-high-contrast.png.b64 is ' + $h + ' / ' + $l + ' B, not the file that was written (3670c52a / 40883). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'screenshots\flagship-library.png.b64'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '29d63eb7e35e831f6b37fb826d039c1a' -or $l -ne 156505) { Write-Host ('ABORT: drop screenshots/flagship-library.png.b64 is ' + $h + ' / ' + $l + ' B, not the file that was written (29d63eb7 / 156505). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'screenshots\magnifier.png.b64'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '329160500c49720ed9669600c813295f' -or $l -ne 238474) { Write-Host ('ABORT: drop screenshots/magnifier.png.b64 is ' + $h + ' / ' + $l + ' B, not the file that was written (32916050 / 238474). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'screenshots\mechanism-web.png.b64'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '9d2542a7b13829d12859846a77a7772d' -or $l -ne 183674) { Write-Host ('ABORT: drop screenshots/mechanism-web.png.b64 is ' + $h + ' / ' + $l + ' B, not the file that was written (9d2542a7 / 183674). Nothing changed.') -ForegroundColor Red; return }
  $p = Join-Path $drop 'screenshots\wing-veganism.png.b64'; if (-not (Test-Path -LiteralPath $p)) { Write-Host "ABORT: $p missing." -ForegroundColor Red; return }
  $h = Get-Md5 $p; $l = (Get-Item -LiteralPath $p).Length; if ($h -ne '24395bac6a4605dd05673045aa5aeebb' -or $l -ne 343291) { Write-Host ('ABORT: drop screenshots/wing-veganism.png.b64 is ' + $h + ' / ' + $l + ' B, not the file that was written (24395bac / 343291). Nothing changed.') -ForegroundColor Red; return }
  Write-Host 'inputs              : all twenty match their build hashes' -ForegroundColor Green

  # --- 3. copy in (bytes), verify, stage exactly twenty names, verify the INDEX blobs -----------
  New-Item -ItemType Directory -Force -Path (Join-Path $repo 'screenshots') | Out-Null
  [IO.File]::Copy((Join-Path $drop 'wuld-layer.css'), (Join-Path $repo 'wuld-layer.css'), $true)
  [IO.File]::Copy((Join-Path $drop 'wuld-layer.js'), (Join-Path $repo 'wuld-layer.js'), $true)
  [IO.File]::Copy((Join-Path $drop 'right-to-die\combined.html'), (Join-Path $repo 'right-to-die\combined.html'), $true)
  [IO.File]::Copy((Join-Path $drop 'abortion\combined.html'), (Join-Path $repo 'abortion\combined.html'), $true)
  [IO.File]::Copy((Join-Path $drop 'transgenderism\combined.html'), (Join-Path $repo 'transgenderism\combined.html'), $true)
  [IO.File]::Copy((Join-Path $drop 'anthropocentrism\combined.html'), (Join-Path $repo 'anthropocentrism\combined.html'), $true)
  [IO.File]::Copy((Join-Path $drop 'veganism\combined.html'), (Join-Path $repo 'veganism\combined.html'), $true)
  [IO.File]::Copy((Join-Path $drop 'libraries\index.html'), (Join-Path $repo 'libraries\index.html'), $true)
  [IO.File]::Copy((Join-Path $drop 'README.md'), (Join-Path $repo 'README.md'), $true)
  [IO.File]::Copy((Join-Path $drop 'CHANGELOG.md'), (Join-Path $repo 'CHANGELOG.md'), $true)
  [IO.File]::Copy((Join-Path $drop 'efilist_argument_library_v4_0_0.json'), (Join-Path $repo 'efilist_argument_library_v4_0_0.json'), $true)
  [IO.File]::WriteAllBytes((Join-Path $repo 'screenshots\argument-flow-map1.png'), [Convert]::FromBase64String(([IO.File]::ReadAllText((Join-Path $drop 'screenshots\argument-flow-map1.png.b64')) -replace '\s', '')))
  [IO.File]::WriteAllBytes((Join-Path $repo 'screenshots\real-world-examples.png'), [Convert]::FromBase64String(([IO.File]::ReadAllText((Join-Path $drop 'screenshots\real-world-examples.png.b64')) -replace '\s', '')))
  [IO.File]::WriteAllBytes((Join-Path $repo 'screenshots\dependency-graph.png'), [Convert]::FromBase64String(([IO.File]::ReadAllText((Join-Path $drop 'screenshots\dependency-graph.png.b64')) -replace '\s', '')))
  [IO.File]::WriteAllBytes((Join-Path $repo 'screenshots\feedback-panel.png'), [Convert]::FromBase64String(([IO.File]::ReadAllText((Join-Path $drop 'screenshots\feedback-panel.png.b64')) -replace '\s', '')))
  [IO.File]::WriteAllBytes((Join-Path $repo 'screenshots\flagship-high-contrast.png'), [Convert]::FromBase64String(([IO.File]::ReadAllText((Join-Path $drop 'screenshots\flagship-high-contrast.png.b64')) -replace '\s', '')))
  [IO.File]::WriteAllBytes((Join-Path $repo 'screenshots\flagship-library.png'), [Convert]::FromBase64String(([IO.File]::ReadAllText((Join-Path $drop 'screenshots\flagship-library.png.b64')) -replace '\s', '')))
  [IO.File]::WriteAllBytes((Join-Path $repo 'screenshots\magnifier.png'), [Convert]::FromBase64String(([IO.File]::ReadAllText((Join-Path $drop 'screenshots\magnifier.png.b64')) -replace '\s', '')))
  [IO.File]::WriteAllBytes((Join-Path $repo 'screenshots\mechanism-web.png'), [Convert]::FromBase64String(([IO.File]::ReadAllText((Join-Path $drop 'screenshots\mechanism-web.png.b64')) -replace '\s', '')))
  [IO.File]::WriteAllBytes((Join-Path $repo 'screenshots\wing-veganism.png'), [Convert]::FromBase64String(([IO.File]::ReadAllText((Join-Path $drop 'screenshots\wing-veganism.png.b64')) -replace '\s', '')))
  if ((Get-Md5 (Join-Path $repo 'wuld-layer.css')) -ne 'ff36237021ef307a1b612a9da9e81f68') { Write-Host 'ABORT: wuld-layer.css did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'wuld-layer.js')) -ne 'a0c46518eeb88c4bc151ab1797e7eb6a') { Write-Host 'ABORT: wuld-layer.js did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'right-to-die\combined.html')) -ne '1b01396e263ca13b53be25a06a4e94bf') { Write-Host 'ABORT: right-to-die/combined.html did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'abortion\combined.html')) -ne '12ca434ce5bf91aded122d69f822b426') { Write-Host 'ABORT: abortion/combined.html did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'transgenderism\combined.html')) -ne '466fc6cbc3b98250d4e34174d54057bc') { Write-Host 'ABORT: transgenderism/combined.html did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'anthropocentrism\combined.html')) -ne '08be61575c51b0d66df419cfd7848fc3') { Write-Host 'ABORT: anthropocentrism/combined.html did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'veganism\combined.html')) -ne 'd81d504143bd978e7d8ec8f9e4e65468') { Write-Host 'ABORT: veganism/combined.html did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'libraries\index.html')) -ne 'e6442297aa2f34bd1762c8bfc0052e58') { Write-Host 'ABORT: libraries/index.html did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'README.md')) -ne '8af941da42ea3404b3ae86862eb16282') { Write-Host 'ABORT: README.md did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'CHANGELOG.md')) -ne '337f2ef18a93be6362a2dc091227c938') { Write-Host 'ABORT: CHANGELOG.md did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'efilist_argument_library_v4_0_0.json')) -ne 'a922ba4914608842f328830284ddc3f0') { Write-Host 'ABORT: efilist_argument_library_v4_0_0.json did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'screenshots\argument-flow-map1.png')) -ne '1eeee0a5ab14c85008d8245096d123bf') { Write-Host 'ABORT: screenshots/argument-flow-map1.png did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'screenshots\real-world-examples.png')) -ne '9c0fdac43e526b472fbb245ce13914d4') { Write-Host 'ABORT: screenshots/real-world-examples.png did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'screenshots\dependency-graph.png')) -ne '2b151554402fed8567a18a64b39425f2') { Write-Host 'ABORT: screenshots/dependency-graph.png did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'screenshots\feedback-panel.png')) -ne '8619c6046de83a301b2dc2b279477a51') { Write-Host 'ABORT: screenshots/feedback-panel.png did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'screenshots\flagship-high-contrast.png')) -ne 'c9605964002a747c950d61d7507c6b10') { Write-Host 'ABORT: screenshots/flagship-high-contrast.png did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'screenshots\flagship-library.png')) -ne 'b3ab64e81cfb2d9bb5d5a5c73c49ec5e') { Write-Host 'ABORT: screenshots/flagship-library.png did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'screenshots\magnifier.png')) -ne 'dc38cccf17128d011e0008dd90825d8c') { Write-Host 'ABORT: screenshots/magnifier.png did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'screenshots\mechanism-web.png')) -ne 'fd356e936d08b3f6242d39d390ccaee1') { Write-Host 'ABORT: screenshots/mechanism-web.png did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  if ((Get-Md5 (Join-Path $repo 'screenshots\wing-veganism.png')) -ne 'a589835c58fc4ab2b3c18cbc43d0feb7') { Write-Host 'ABORT: screenshots/wing-veganism.png did not land byte-identical. NOT staged; tell me.' -ForegroundColor Red; return }
  git add -- 'wuld-layer.css' 'wuld-layer.js' 'right-to-die/combined.html' 'abortion/combined.html' 'transgenderism/combined.html' 'anthropocentrism/combined.html' 'veganism/combined.html' 'libraries/index.html' 'README.md' 'CHANGELOG.md' 'efilist_argument_library_v4_0_0.json' 'screenshots/argument-flow-map1.png' 'screenshots/real-world-examples.png' 'screenshots/dependency-graph.png' 'screenshots/feedback-panel.png' 'screenshots/flagship-high-contrast.png' 'screenshots/flagship-library.png' 'screenshots/magnifier.png' 'screenshots/mechanism-web.png' 'screenshots/wing-veganism.png'
  $staged = @(git diff --cached --name-only)
  Write-Host "staged (" + $staged.Count + "): $($staged -join ', ')"
  $ok = ($staged.Count -eq 20) -and ($staged -contains 'wuld-layer.css') -and ($staged -contains 'wuld-layer.js') -and ($staged -contains 'right-to-die/combined.html') -and ($staged -contains 'abortion/combined.html') -and ($staged -contains 'transgenderism/combined.html') -and ($staged -contains 'anthropocentrism/combined.html') -and ($staged -contains 'veganism/combined.html') -and ($staged -contains 'libraries/index.html') -and ($staged -contains 'README.md') -and ($staged -contains 'CHANGELOG.md') -and ($staged -contains 'efilist_argument_library_v4_0_0.json') -and ($staged -contains 'screenshots/argument-flow-map1.png') -and ($staged -contains 'screenshots/real-world-examples.png') -and ($staged -contains 'screenshots/dependency-graph.png') -and ($staged -contains 'screenshots/feedback-panel.png') -and ($staged -contains 'screenshots/flagship-high-contrast.png') -and ($staged -contains 'screenshots/flagship-library.png') -and ($staged -contains 'screenshots/magnifier.png') -and ($staged -contains 'screenshots/mechanism-web.png') -and ($staged -contains 'screenshots/wing-veganism.png')
  if (-not $ok) { Write-Host 'ABORT: staging is not exactly the twenty names. Unstaged (the working copies hold the new files); tell me.' -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':wuld-layer.css').Trim(); if ($i -ne '3c9f7bd827783e41d443218978e3485806860364') { Write-Host ('ABORT: index blob for wuld-layer.css is ' + $i + ', not the predicted 3c9f7bd8. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':wuld-layer.js').Trim(); if ($i -ne '554e5c9a8ad6a079ba5f0a430526b011d28c2c53') { Write-Host ('ABORT: index blob for wuld-layer.js is ' + $i + ', not the predicted 554e5c9a. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':right-to-die/combined.html').Trim(); if ($i -ne 'd9fde59e697ce4ef132409ec72d0e3130def751e') { Write-Host ('ABORT: index blob for right-to-die/combined.html is ' + $i + ', not the predicted d9fde59e. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':abortion/combined.html').Trim(); if ($i -ne 'f25907cbb6def95e127ec8c91f6d79f881a5b0ea') { Write-Host ('ABORT: index blob for abortion/combined.html is ' + $i + ', not the predicted f25907cb. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':transgenderism/combined.html').Trim(); if ($i -ne '883d19f17ec715de5bf1bd2adf557f5b780eeaae') { Write-Host ('ABORT: index blob for transgenderism/combined.html is ' + $i + ', not the predicted 883d19f1. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':anthropocentrism/combined.html').Trim(); if ($i -ne 'e823d31cadfb4d1b1176b51e134f189701a7899a') { Write-Host ('ABORT: index blob for anthropocentrism/combined.html is ' + $i + ', not the predicted e823d31c. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':veganism/combined.html').Trim(); if ($i -ne '37d772966275b68cc51e71dc68a57fb5e037bd18') { Write-Host ('ABORT: index blob for veganism/combined.html is ' + $i + ', not the predicted 37d77296. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':libraries/index.html').Trim(); if ($i -ne 'b0644b790d874da4d2e27083ae9b4fb079a88875') { Write-Host ('ABORT: index blob for libraries/index.html is ' + $i + ', not the predicted b0644b79. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':README.md').Trim(); if ($i -ne '304a3fa40c216ba73f962d182d32a79bf1661a8c') { Write-Host ('ABORT: index blob for README.md is ' + $i + ', not the predicted 304a3fa4. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':CHANGELOG.md').Trim(); if ($i -ne '06b1062991d2590bcb8bf48c969f3c56758cf741') { Write-Host ('ABORT: index blob for CHANGELOG.md is ' + $i + ', not the predicted 06b10629. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':efilist_argument_library_v4_0_0.json').Trim(); if ($i -ne 'de63025163602d32a2969cd5f05e39e77b67d606') { Write-Host ('ABORT: index blob for efilist_argument_library_v4_0_0.json is ' + $i + ', not the predicted de630251. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':screenshots/argument-flow-map1.png').Trim(); if ($i -ne 'a6ab49d726fd0a044a657ba2c17b78c2a1348991') { Write-Host ('ABORT: index blob for screenshots/argument-flow-map1.png is ' + $i + ', not the predicted a6ab49d7. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':screenshots/real-world-examples.png').Trim(); if ($i -ne 'e5587d6a0dd52eea2e5a0f300b0e561d99ea1c5b') { Write-Host ('ABORT: index blob for screenshots/real-world-examples.png is ' + $i + ', not the predicted e5587d6a. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':screenshots/dependency-graph.png').Trim(); if ($i -ne '642e16827852586f320e0875e181f7e59048b7f2') { Write-Host ('ABORT: index blob for screenshots/dependency-graph.png is ' + $i + ', not the predicted 642e1682. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':screenshots/feedback-panel.png').Trim(); if ($i -ne 'ce06c9fa03138675d0cf7a8371e949a3ea1bf74d') { Write-Host ('ABORT: index blob for screenshots/feedback-panel.png is ' + $i + ', not the predicted ce06c9fa. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':screenshots/flagship-high-contrast.png').Trim(); if ($i -ne 'c39efbb61d6e5b241900752272360b92869339de') { Write-Host ('ABORT: index blob for screenshots/flagship-high-contrast.png is ' + $i + ', not the predicted c39efbb6. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':screenshots/flagship-library.png').Trim(); if ($i -ne '20d9ac7909f2abe5dfd4e9b1b065100157ca978a') { Write-Host ('ABORT: index blob for screenshots/flagship-library.png is ' + $i + ', not the predicted 20d9ac79. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':screenshots/magnifier.png').Trim(); if ($i -ne 'e5def1ef71e175790973f2a6aead3654492419db') { Write-Host ('ABORT: index blob for screenshots/magnifier.png is ' + $i + ', not the predicted e5def1ef. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':screenshots/mechanism-web.png').Trim(); if ($i -ne '0e08a144789086fe233e454fb507ce60da962728') { Write-Host ('ABORT: index blob for screenshots/mechanism-web.png is ' + $i + ', not the predicted 0e08a144. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  $i = (git rev-parse ':screenshots/wing-veganism.png').Trim(); if ($i -ne '8bd5c7d9bb9f64ffe25f1202fde0364264668436') { Write-Host ('ABORT: index blob for screenshots/wing-veganism.png is ' + $i + ', not the predicted 8bd5c7d9. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  Write-Host 'index blobs         : all twenty as predicted' -ForegroundColor Green
  $inPin = @(git diff --cached --name-only -- combined.html)
  if ($inPin.Count) { Write-Host 'ABORT: combined.html is staged. Unstaged everything; tell me.' -ForegroundColor Red; git reset -q; return }

  git commit -m 'WI-K316 (NO-PIN): v4.0.2 relabel of the served pin 62d1e8d8 (README, CHANGELOG, corpus version field, front-door badge); feedback control -> in-page form via the contact relay; pan clip; wings + index to two mode toggles; README captures from the deployed bytes' | Out-Null
  git log -1 --pretty='%h %s'
  $pinAfter = (git rev-parse 'HEAD:combined.html').Trim()
  if ($pinAfter -ne 'eab9c7885fbc58f4b6a4f2d16d10408e4ab02a36') { Write-Host 'ABORT: combined.html blob changed in this commit. NOT PUSHED. Tell me; do not push by hand.' -ForegroundColor Red; return }
  Write-Host 'pin blob unchanged  : eab9c788 (combined.html 62d1e8d8 / 2,974,039 B)' -ForegroundColor Green

  # --- 4. the push, gated -------------------------------------------------------------------------
  $ErrorActionPreference = 'Continue'
  Write-Host ''; Write-Host '---- push ----' -ForegroundColor Cyan
  $ahead = @(git log --oneline origin/main..HEAD)
  $ahead | ForEach-Object { Write-Host ('   ' + $_) }
  if ($ahead.Count -ne 1) { Write-Host ('ABORT: expected exactly 1 commit above origin/main, found ' + $ahead.Count + '. Not pushed; tell me.') -ForegroundColor Red; return }
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'PUSH FAILED - nothing changed on origin; the commit is local. Tell me.' -ForegroundColor Red; return }
  Write-Host ('pushed. origin/main is now ' + (git rev-parse --short origin/main)) -ForegroundColor Green

  # --- 5. served read-back: the two packs, one wing, the index, then the pin ---------------------
  Write-Host ''; Write-Host '---- served read-back (Pages builds in ~1-3 min; polling up to 6 min) ----' -ForegroundColor Cyan
  $tmp = Join-Path $env:TEMP 'wuld-k316'; New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  $want = @{ 'wuld-layer.css'='ff36237021ef307a1b612a9da9e81f68'; 'wuld-layer.js'='a0c46518eeb88c4bc151ab1797e7eb6a'; 'veganism/combined'='d81d504143bd978e7d8ec8f9e4e65468'; 'libraries/'='e6442297aa2f34bd1762c8bfc0052e58' }
  $done = $false
  for ($n = 1; $n -le 24; $n++) {
    $t = [DateTime]::UtcNow.Ticks; $all = $true; $line = ('  try {0,2}:' -f $n)
    foreach ($k in @('wuld-layer.css', 'wuld-layer.js', 'veganism/combined', 'libraries/')) {
      $f = Join-Path $tmp ($k.Replace('/', '_') + '.bin')
      $code = & curl.exe -sS -o $f -w '%{http_code}' "https://library.wuld.ink/${k}?nocache=$t"
      $m = if (Test-Path -LiteralPath $f) { Get-Md5 $f } else { '-' }; $sz = if (Test-Path -LiteralPath $f) { (Get-Item -LiteralPath $f).Length } else { 0 }
      $hit = ($m -eq $want[$k]); if (-not $hit) { $all = $false }
      $short = if ($m.Length -ge 8) { $m.Substring(0,8) } else { $m }
      $line += ('  {0} http {1} {2,6} B {3} {4}' -f $k, $code, $sz, $short, $(if ($hit) {'MATCH'} else {'old'}))
    }
    Write-Host $line
    if ($all) { $done = $true; break }
    Start-Sleep -Seconds 15
  }
  if (-not $done) { Write-Host 'NOT YET SERVED after 6 min: the push landed; Pages may still be building or the build failed. Check the Pages dashboard and tell me.' -ForegroundColor Red; return }
  Write-Host 'SERVED == COMMITTED for the packs, the veganism wing and the index.' -ForegroundColor Green
  $fPin = Join-Path $tmp 'combined.bin'
  $cPin = & curl.exe -sS -o $fPin -w '%{http_code}' "https://library.wuld.ink/combined?nocache=$([DateTime]::UtcNow.Ticks)"
  $mPin = if (Test-Path -LiteralPath $fPin) { Get-Md5 $fPin } else { '-' }; $nPin = if (Test-Path -LiteralPath $fPin) { (Get-Item -LiteralPath $fPin).Length } else { 0 }
  Write-Host ('  /combined: http {0} {1} B {2}' -f $cPin, $nPin, $mPin)
  if ($mPin -eq '62d1e8d86056465ebcb5daced38e0a83' -and $nPin -eq 2974039) { Write-Host 'PIN UNMOVED: /combined is still 62d1e8d8 / 2,974,039 B.' -ForegroundColor Green } else { Write-Host 'PIN READ-BACK DIFFERS from 62d1e8d8 / 2,974,039 -- tell me the line above.' -ForegroundColor Yellow }
  Write-Host ''; Write-Host 'K316 LIVE on library.wuld.ink. Next: k316\WULD_v402_relabel_commit.ps1 (wuld.ink: the pin tool, releases, search index), then k316\WULD_archive_commit.ps1, then k316\WI-K316_commit.ps1 (the log).' -ForegroundColor Yellow
}
