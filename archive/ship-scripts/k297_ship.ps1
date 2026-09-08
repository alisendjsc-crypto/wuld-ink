& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "FAIL: no .git under $repo"; return }
  Set-Location $repo; [Environment]::CurrentDirectory = $repo
  Get-ChildItem -LiteralPath .git -Filter 'index.lock*' -Force -ErrorAction SilentlyContinue | Remove-Item -Force
  Get-ChildItem -LiteralPath .git\objects -Recurse -Filter 'tmp_obj_*' -Force -ErrorAction SilentlyContinue | Remove-Item -Force
  function Md5($p) { (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }
  $head = git rev-parse HEAD 2>$null
  if (-not $head) { Write-Host 'FAIL: git rev-parse HEAD returned nothing (wrong folder?)'; return }
  $head = "$head".Trim()
  git fetch origin 2>&1 | Out-Null
  $origin = "$(git rev-parse origin/main)".Trim()
  if ($head -ne 'e211d5670715cff11c85c15d2e3ba7690244cabe') { Write-Host "FAIL: HEAD is $head, expected e211d56 (K296) - re-derive"; return } else { Write-Host 'OK: HEAD == e211d56' }
  if ($head -ne $origin) { Write-Host "FAIL: HEAD $head != origin/main $origin (another committer?)"; return } else { Write-Host 'OK: HEAD == origin/main' }
  # --- base guards: HEAD blobs AND the disk files, like-to-like (blob vs blob) ---
  $b = "$(git rev-parse HEAD:src/gallery/index.html)".Trim(); if ($b -ne 'ae656d1d0a80daab9fe48a5d7a9eb2a4dc3a662e') { Write-Host "FAIL: gallery base blob $b (expected ae656d1d)"; return } else { Write-Host 'OK: HEAD:src/gallery/index.html ae656d1d' }
  $b = "$(git hash-object src/gallery/index.html)".Trim(); if ($b -ne 'ae656d1d0a80daab9fe48a5d7a9eb2a4dc3a662e') { Write-Host "FAIL: DISK gallery page blob $b != HEAD (stale worktree?)"; return } else { Write-Host 'OK: disk src/gallery/index.html == HEAD blob' }
  $b = "$(git rev-parse HEAD:CLAUDE.md)".Trim(); if ($b -ne '3e849783d64311a71f6821b24dc4b1f6f0947733') { Write-Host "FAIL: CLAUDE.md base blob $b (expected 3e849783)"; return } else { Write-Host 'OK: HEAD:CLAUDE.md 3e849783' }
  $b = "$(git hash-object CLAUDE.md)".Trim(); if ($b -ne '3e849783d64311a71f6821b24dc4b1f6f0947733') { Write-Host "FAIL: DISK CLAUDE.md blob $b != HEAD (stale worktree?)"; return } else { Write-Host 'OK: disk CLAUDE.md == HEAD blob' }
  # --- sidecars + pre-placed files: MD5 gates BEFORE any move ---
  $m = Md5 'src\gallery\index.k297.html'; if ($m -ne '4c4fbd54b9255baf31ff3c381a993be3') { Write-Host "FAIL: index.k297.html md5 $m"; return } else { Write-Host 'OK: sidecar src\gallery\index.k297.html 4c4fbd54' }
  $m = Md5 'CLAUDE.md.k297'; if ($m -ne '8ebcf4d2a6c6df6a4666eb193f7e740a') { Write-Host "FAIL: CLAUDE.md.k297 md5 $m"; return } else { Write-Host 'OK: sidecar CLAUDE.md.k297 8ebcf4d2' }
  $m = Md5 'tools\gate\reach-audit-K297.json'; if ($m -ne '94ecb2136c6f3ed6c84387b4d1abeec8') { Write-Host "FAIL: reach-audit-K297.json md5 $m"; return } else { Write-Host 'OK: reach-audit-K297.json 94ecb213' }
  $m = Md5 'tools\gate\reach-audit-K297.md'; if ($m -ne '073f2ea4b9fed2a4a9ab53d0abd6c35c') { Write-Host "FAIL: reach-audit-K297.md md5 $m"; return } else { Write-Host 'OK: reach-audit-K297.md 073f2ea4' }
  # --- the two moves + result gates ---
  Move-Item -LiteralPath 'src\gallery\index.k297.html' -Destination 'src\gallery\index.html' -Force
  Move-Item -LiteralPath 'CLAUDE.md.k297' -Destination 'CLAUDE.md' -Force
  $m = Md5 'src\gallery\index.html'; if ($m -ne '4c4fbd54b9255baf31ff3c381a993be3') { Write-Host "FAIL: gallery result md5 $m"; return } else { Write-Host 'OK: src/gallery/index.html result 4c4fbd54' }
  $m = Md5 'CLAUDE.md'; if ($m -ne '8ebcf4d2a6c6df6a4666eb193f7e740a') { Write-Host "FAIL: CLAUDE.md result md5 $m"; return } else { Write-Host 'OK: CLAUDE.md result 8ebcf4d2' }
  # --- shape asserts, populations printed; every constant was measured with grep -c (LINES), the same thing Select-String .Count counts ---
  $len = (Get-Item -LiteralPath 'src\gallery\index.html').Length; if ($len -ne 18789) { Write-Host "FAIL: gallery page bytes $len (expected 18789)"; return } else { Write-Host "OK: gallery page bytes $len" }
  $n = @(Select-String -LiteralPath 'src\gallery\index.html' -SimpleMatch -Pattern '<details class="gallery-fold" open>').Count; if ($n -ne 1) { Write-Host "FAIL: details-open lines = $n (expected 1)"; return } else { Write-Host "OK: details class=gallery-fold open [lines=$n]" }
  $n = @(Select-String -LiteralPath 'src\gallery\index.html' -SimpleMatch -Pattern '<summary>Exhibition handout</summary>').Count; if ($n -ne 1) { Write-Host "FAIL: summary element lines = $n (expected 1)"; return } else { Write-Host "OK: summary element [lines=$n]" }
  $n = @(Select-String -LiteralPath 'src\gallery\index.html' -SimpleMatch -Pattern 'gallery-fold').Count; if ($n -ne 10) { Write-Host "FAIL: gallery-fold lines = $n (expected 10)"; return } else { Write-Host "OK: gallery-fold [lines=$n]" }
  $n = @(Select-String -LiteralPath 'src\gallery\index.html' -SimpleMatch -Pattern 'K297').Count; if ($n -ne 5) { Write-Host "FAIL: K297 comment lines = $n (expected 5)"; return } else { Write-Host "OK: K297 comments [lines=$n]" }
  $t = [IO.File]::ReadAllText((Resolve-Path -LiteralPath 'src\gallery\index.html').Path); $i1 = $t.IndexOf('id="gallery-category-index"'); $i2 = $t.IndexOf('class="gallery-nsfw-bar"'); if (($i1 -lt 0) -or ($i2 -lt 0) -or ($i1 -gt $i2)) { Write-Host "FAIL: rooms index ($i1) is not before the gate ($i2) in the file"; return } else { Write-Host "OK: rooms index (offset $i1) precedes the gate (offset $i2)" }
  $n = @(Select-String -LiteralPath 'tools\gate\reach-audit-K297.json' -SimpleMatch -Pattern '"page": "/gallery/"').Count; if ($n -ne 2) { Write-Host "FAIL: JSON /gallery/ rows = $n (expected 2)"; return } else { Write-Host "OK: JSON carries /gallery/ x2 [lines=$n]" }
  $n = @(Select-String -LiteralPath 'CLAUDE.md' -SimpleMatch -Pattern '### K297 (').Count; if ($n -ne 1) { Write-Host "FAIL: K297 strata in CLAUDE.md = $n (expected 1)"; return } else { Write-Host "OK: CLAUDE.md carries the K297 stratum once [lines=$n]" }
  git status --short
  # --- explicit stage, one path per line; NEVER git add -u / . ---
  git add -- src/gallery/index.html
  git add -- tools/gate/reach-audit-K297.json
  git add -- tools/gate/reach-audit-K297.md
  git add -- CLAUDE.md
  $staged = @(git diff --cached --name-only); if ($staged.Count -ne 4) { Write-Host "FAIL: staged $($staged.Count) paths, expected 4:`n$($staged -join "`n")"; git reset --quiet; return } else { Write-Host "OK: staged 4 [$($staged -join ', ')]" }
  $ls = git ls-files -s -- src/gallery/index.html tools/gate/reach-audit-K297.json tools/gate/reach-audit-K297.md CLAUDE.md
  $n = @($ls | Select-String -SimpleMatch -Pattern '59587e5e4a92259b04c8f65e0f68475932e869a8').Count; if ($n -ne 1) { Write-Host 'FAIL: index blob src/gallery/index.html != 59587e5e'; git reset --quiet; return } else { Write-Host 'OK: index blob src/gallery/index.html 59587e5e' }
  $n = @($ls | Select-String -SimpleMatch -Pattern '5b73cd2f3cf613d8aea06420c5cd79ca9b2bbab5').Count; if ($n -ne 1) { Write-Host 'FAIL: index blob reach-audit-K297.json != 5b73cd2f'; git reset --quiet; return } else { Write-Host 'OK: index blob reach-audit-K297.json 5b73cd2f' }
  $n = @($ls | Select-String -SimpleMatch -Pattern 'bca1364d443edd0916a450b040c9ef496787ba43').Count; if ($n -ne 1) { Write-Host 'FAIL: index blob reach-audit-K297.md != bca1364d'; git reset --quiet; return } else { Write-Host 'OK: index blob reach-audit-K297.md bca1364d' }
  $n = @($ls | Select-String -SimpleMatch -Pattern '27adbdfe0f1abfde388a29c478d1486a986f347d').Count; if ($n -ne 1) { Write-Host 'FAIL: index blob CLAUDE.md != 27adbdfe'; git reset --quiet; return } else { Write-Host 'OK: index blob CLAUDE.md 27adbdfe' }
  git commit --quiet -m 'K297 /gallery/ lobby reaches the first phone screen: three rooms visible where there were none - the exhibition handout behind a one-line summary (K291/K296 mechanism: details open in the markup, a parse-time script strips open at 640 and under, summary hidden at 641 and up; no JS = the desktop page), the rooms index moved ABOVE the plate-grid controls on both viewports (a DOM move, never CSS order, so focus order matches visual order; gallery-room.js inserts the controls before the gate so the runtime order is hero > rooms > controls > gate > grid with zero JS change), and the lobby h1 rejoining the K275 phone type scale it had escaped by specificity (54px three lines 191px on a 390px phone); first room card 1568 -> 495 px = 1.86 -> 0.59 screens, rank 2 -> 28; desktop rooms 1193 -> 807 = 1.33 -> 0.90; desktop gate PASS at 1280/1440/1024/900/768/641 - 506 unmoved nodes identical in geometry and styles, the three reordered regions identical in size and styles within 1px relative-y, the plate grid pinned at 1722; reach gate 140 rows vs K296 - exactly 2 moved, both /gallery/; search-index 51ce5c50 reproduces from pristine and patched trees = HELD, no regen; sweep NO-OP; parser 0 unclosed 0 mismatched; toggle gate closed 495 -> open 814 -> closed, Enter works, 49px target; the queue top /donations/ 1.89 was a metric artifact (its Donate button sits at 1.10, singleton controls are invisible to the repeat-group column) - recorded, not built; new reach baseline tools/gate/reach-audit-K297; the help vessel did NOT run again (TX15-BACK still absent) - it is K298 when it lands; K296 landing e211d56 recorded; ONE src file, 8 lines moved 61 added 0 deleted, NO ?v, NO sweep, NO sw.js, NO changelog, NO PIN'
  if ($LASTEXITCODE -ne 0) { Write-Host 'FAIL: commit'; return } else { Write-Host "OK: committed $(git rev-parse --short HEAD)" }
  git config http.postBuffer 524288000
  git push origin main; if ($LASTEXITCODE -ne 0) { Write-Host 'FAIL: push (ignore any Everything up-to-date noise after an RPC error - re-run push)'; return } else { Write-Host 'OK: pushed' }
  Start-Sleep 75
  # --- live asserts: md5 is SOFT (a CF beacon or build lag makes it lie while the page is right); the content-greps + the order assert are the hard gates ---
  $t1 = Join-Path $env:TEMP 'k297-gallery.html'; curl.exe -s -o $t1 'https://wuld.ink/gallery/?vk297ship=1'
  $m = Md5 $t1; if ($m -ne '4c4fbd54b9255baf31ff3c381a993be3') { Write-Host "WARN: served /gallery/ md5 $m != 4c4fbd54 (CF beacon or build lag; the greps below decide)" } else { Write-Host 'OK: served /gallery/ byte-exact 4c4fbd54' }
  $n = @(Select-String -LiteralPath $t1 -SimpleMatch -Pattern '<summary>Exhibition handout</summary>').Count; if ($n -ne 1) { Write-Host "FAIL: served /gallery/ summary element lines = $n (expected 1) - build lag? re-run this curl in 60s"; return } else { Write-Host "OK: served /gallery/ carries the summary [lines=$n]" }
  $n = @(Select-String -LiteralPath $t1 -SimpleMatch -Pattern '<details class="gallery-fold" open>').Count; if ($n -ne 1) { Write-Host "FAIL: served /gallery/ details-open lines = $n (expected 1)"; return } else { Write-Host "OK: served /gallery/ carries the fold [lines=$n]" }
  $s = [IO.File]::ReadAllText($t1); $j1 = $s.IndexOf('id="gallery-category-index"'); $j2 = $s.IndexOf('class="gallery-nsfw-bar"'); if (($j1 -lt 0) -or ($j2 -lt 0) -or ($j1 -gt $j2)) { Write-Host "FAIL: served rooms index ($j1) is not before the gate ($j2)"; return } else { Write-Host "OK: served rooms index precedes the gate ($j1 < $j2)" }
  $t2 = Join-Path $env:TEMP 'k297-flagship.html'; curl.exe -s -o $t2 'https://library.wuld.ink/combined?vk297ship=1'
  $m = Md5 $t2; if ($m -ne 'e654eabd32fa95e5969d49e6eb15aa87') { Write-Host "FAIL: flagship md5 $m (pin e654eabd)"; return } else { Write-Host 'OK: flagship e654eabd, pin v4.0.0 held' }
  Write-Host "K297 LANDED: $(git rev-parse --short HEAD) atop e211d56 - /gallery/ lobby reaches the first phone screen; NO PIN"
}
