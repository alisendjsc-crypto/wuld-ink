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
  if ($head -ne '4f5b53b2cb0e44a08ac4873ac852c130290b9275') { Write-Host "FAIL: HEAD is $head, expected 4f5b53b (K295) - re-derive"; return } else { Write-Host 'OK: HEAD == 4f5b53b' }
  if ($head -ne $origin) { Write-Host "FAIL: HEAD $head != origin/main $origin (another committer?)"; return } else { Write-Host 'OK: HEAD == origin/main' }
  # --- base guards: HEAD blobs AND the disk files, like-to-like (blob vs blob) ---
  $b = "$(git rev-parse HEAD:src/frame/index.html)".Trim(); if ($b -ne '9cc0cda1a1459b828c2ad44c16519e381cb8ac17') { Write-Host "FAIL: frame base blob $b (expected 9cc0cda1)"; return } else { Write-Host 'OK: HEAD:src/frame/index.html 9cc0cda1' }
  $b = "$(git hash-object src/frame/index.html)".Trim(); if ($b -ne '9cc0cda1a1459b828c2ad44c16519e381cb8ac17') { Write-Host "FAIL: DISK frame page blob $b != HEAD (stale worktree?)"; return } else { Write-Host 'OK: disk src/frame/index.html == HEAD blob' }
  $b = "$(git rev-parse HEAD:CLAUDE.md)".Trim(); if ($b -ne '4929034fde88c066540bec7565240f6b739fe159') { Write-Host "FAIL: CLAUDE.md base blob $b (expected 4929034f)"; return } else { Write-Host 'OK: HEAD:CLAUDE.md 4929034f' }
  $b = "$(git hash-object CLAUDE.md)".Trim(); if ($b -ne '4929034fde88c066540bec7565240f6b739fe159') { Write-Host "FAIL: DISK CLAUDE.md blob $b != HEAD (stale worktree?)"; return } else { Write-Host 'OK: disk CLAUDE.md == HEAD blob' }
  # --- sidecars + pre-placed files: MD5 gates BEFORE any move ---
  $m = Md5 'src\frame\index.k296.html'; if ($m -ne '9ea9d5bb6559600564c28b11b0807be8') { Write-Host "FAIL: index.k296.html md5 $m"; return } else { Write-Host 'OK: sidecar src\frame\index.k296.html 9ea9d5bb' }
  $m = Md5 'CLAUDE.md.k296'; if ($m -ne 'be630ce3e66d96e35ed2dd226dd745f6') { Write-Host "FAIL: CLAUDE.md.k296 md5 $m"; return } else { Write-Host 'OK: sidecar CLAUDE.md.k296 be630ce3' }
  $m = Md5 'tools\gate\reach-audit-K296.json'; if ($m -ne '047227f3b2a9ec06b3f90fed7c8ed4da') { Write-Host "FAIL: reach-audit-K296.json md5 $m"; return } else { Write-Host 'OK: reach-audit-K296.json 047227f3' }
  $m = Md5 'tools\gate\reach-audit-K296.md'; if ($m -ne '57ab1d3c28dc001b74bcbb04689ea728') { Write-Host "FAIL: reach-audit-K296.md md5 $m"; return } else { Write-Host 'OK: reach-audit-K296.md 57ab1d3c' }
  # --- the two moves + result gates ---
  Move-Item -LiteralPath 'src\frame\index.k296.html' -Destination 'src\frame\index.html' -Force
  Move-Item -LiteralPath 'CLAUDE.md.k296' -Destination 'CLAUDE.md' -Force
  $m = Md5 'src\frame\index.html'; if ($m -ne '9ea9d5bb6559600564c28b11b0807be8') { Write-Host "FAIL: frame result md5 $m"; return } else { Write-Host 'OK: src/frame/index.html result 9ea9d5bb' }
  $m = Md5 'CLAUDE.md'; if ($m -ne 'be630ce3e66d96e35ed2dd226dd745f6') { Write-Host "FAIL: CLAUDE.md result md5 $m"; return } else { Write-Host 'OK: CLAUDE.md result be630ce3' }
  # --- shape asserts, populations printed; every constant was measured with grep -c (LINES), the same thing Select-String .Count counts ---
  $len = (Get-Item -LiteralPath 'src\frame\index.html').Length; if ($len -ne 22966) { Write-Host "FAIL: frame page bytes $len (expected 22966)"; return } else { Write-Host "OK: frame page bytes $len" }
  $n = @(Select-String -LiteralPath 'src\frame\index.html' -SimpleMatch -Pattern '<details class="frame-fold" open>').Count; if ($n -ne 1) { Write-Host "FAIL: details-open lines = $n (expected 1)"; return } else { Write-Host "OK: details class=frame-fold open [lines=$n]" }
  $n = @(Select-String -LiteralPath 'src\frame\index.html' -SimpleMatch -Pattern '<summary>How these compose &mdash; two layers, not four co-equal positions</summary>').Count; if ($n -ne 1) { Write-Host "FAIL: summary element lines = $n (expected 1)"; return } else { Write-Host "OK: ratified summary element [lines=$n]" }
  $n = @(Select-String -LiteralPath 'src\frame\index.html' -SimpleMatch -Pattern 'frame-fold').Count; if ($n -ne 10) { Write-Host "FAIL: frame-fold lines = $n (expected 10)"; return } else { Write-Host "OK: frame-fold [lines=$n]" }
  $n = @(Select-String -LiteralPath 'src\frame\index.html' -SimpleMatch -Pattern 'K296').Count; if ($n -ne 3) { Write-Host "FAIL: K296 comment lines = $n (expected 3)"; return } else { Write-Host "OK: K296 comments [lines=$n]" }
  $n = @(Select-String -LiteralPath 'tools\gate\reach-audit-K296.json' -SimpleMatch -Pattern '"page": "/frame/"').Count; if ($n -ne 2) { Write-Host "FAIL: JSON /frame/ rows = $n (expected 2)"; return } else { Write-Host "OK: JSON carries /frame/ x2 [lines=$n]" }
  $n = @(Select-String -LiteralPath 'CLAUDE.md' -SimpleMatch -Pattern '### K296 (').Count; if ($n -ne 1) { Write-Host "FAIL: K296 strata in CLAUDE.md = $n (expected 1)"; return } else { Write-Host "OK: CLAUDE.md carries the K296 stratum once [lines=$n]" }
  git status --short
  # --- explicit stage, one path per line; NEVER git add -u / . ---
  git add -- src/frame/index.html
  git add -- tools/gate/reach-audit-K296.json
  git add -- tools/gate/reach-audit-K296.md
  git add -- CLAUDE.md
  $staged = @(git diff --cached --name-only); if ($staged.Count -ne 4) { Write-Host "FAIL: staged $($staged.Count) paths, expected 4:`n$($staged -join "`n")"; git reset --quiet; return } else { Write-Host "OK: staged 4 [$($staged -join ', ')]" }
  $ls = git ls-files -s -- src/frame/index.html tools/gate/reach-audit-K296.json tools/gate/reach-audit-K296.md CLAUDE.md
  $n = @($ls | Select-String -SimpleMatch -Pattern '3586c61b8fbcb680dcdddb1947d8a6c741cd8909').Count; if ($n -ne 1) { Write-Host 'FAIL: index blob src/frame/index.html != 3586c61b'; git reset --quiet; return } else { Write-Host 'OK: index blob src/frame/index.html 3586c61b' }
  $n = @($ls | Select-String -SimpleMatch -Pattern '81f8d5329b9e1e6d1fa9f8139ac1f50e23c0b646').Count; if ($n -ne 1) { Write-Host 'FAIL: index blob reach-audit-K296.json != 81f8d532'; git reset --quiet; return } else { Write-Host 'OK: index blob reach-audit-K296.json 81f8d532' }
  $n = @($ls | Select-String -SimpleMatch -Pattern '9830baa8e23431c69da2c25ea499230f391e5d5c').Count; if ($n -ne 1) { Write-Host 'FAIL: index blob reach-audit-K296.md != 9830baa8'; git reset --quiet; return } else { Write-Host 'OK: index blob reach-audit-K296.md 9830baa8' }
  $n = @($ls | Select-String -SimpleMatch -Pattern '3e849783d64311a71f6821b24dc4b1f6f0947733').Count; if ($n -ne 1) { Write-Host 'FAIL: index blob CLAUDE.md != 3e849783'; git reset --quiet; return } else { Write-Host 'OK: index blob CLAUDE.md 3e849783' }
  git commit --quiet -m 'K296 /frame/ folded to ONE phone screen: the library-relayed composition block behind a summary that carries its own orientation (How these compose - two layers, not four co-equal positions; ratified by Josiah, stance-adjacent because the block closed a library NUDGE) plus the page phone rhythm; K291 mechanism verbatim (details open in the markup, a parse-time script strips open at 640 and under, summary hidden at 641 and up; no JS = the desktop page exactly); first position 1645 -> 864 px = 1.95 -> 1.02 screens, rank 1 -> 17; spacing alone was measured at 1.69 and rejected (the prose was the cost); desktop 170-node fingerprint IDENTICAL at 1280/1440/1024/900/768/641 with the added nodes excluded; reach gate 140 rows vs K291 - 7 moved, all accounted (frame x2, the four known-stale K292/K293 rows, and console stickyBottom 596->152 on byte-identical bytes = capture-context, so cclxv now covers stickyBottom); search-index 51ce5c50 reproduces from the pristine tree AND from the patched tree = HELD, no regen; sweep NO-OP; parser 0 unclosed 0 mismatched; toggle gate closed 864 -> open 1501 -> closed, Enter opens, 72px target; new reach baseline tools/gate/reach-audit-K296; the briefed help-affordance vessel did NOT run because TX15 has not come back - it is K297 when it does; K295 landing 4f5b53b recorded; ONE src file, 52 lines added 0 deleted, NO ?v, NO sweep, NO sw.js, NO changelog, NO PIN'
  if ($LASTEXITCODE -ne 0) { Write-Host 'FAIL: commit'; return } else { Write-Host "OK: committed $(git rev-parse --short HEAD)" }
  git config http.postBuffer 524288000
  git push origin main; if ($LASTEXITCODE -ne 0) { Write-Host 'FAIL: push (ignore any Everything up-to-date noise after an RPC error - re-run push)'; return } else { Write-Host 'OK: pushed' }
  Start-Sleep 75
  # --- live asserts: md5 is SOFT (a CF beacon or build lag makes it lie while the page is right); the content-greps are the hard gates ---
  $t1 = Join-Path $env:TEMP 'k296-frame.html'; curl.exe -s -o $t1 'https://wuld.ink/frame/?vk296ship=1'
  $m = Md5 $t1; if ($m -ne '9ea9d5bb6559600564c28b11b0807be8') { Write-Host "WARN: served /frame/ md5 $m != 9ea9d5bb (CF beacon or build lag; the two greps below decide)" } else { Write-Host 'OK: served /frame/ byte-exact 9ea9d5bb' }
  $n = @(Select-String -LiteralPath $t1 -SimpleMatch -Pattern '<summary>How these compose &mdash; two layers, not four co-equal positions</summary>').Count; if ($n -ne 1) { Write-Host "FAIL: served /frame/ summary element lines = $n (expected 1) - build lag? re-run this curl in 60s"; return } else { Write-Host "OK: served /frame/ carries the ratified summary [lines=$n]" }
  $n = @(Select-String -LiteralPath $t1 -SimpleMatch -Pattern '<details class="frame-fold" open>').Count; if ($n -ne 1) { Write-Host "FAIL: served /frame/ details-open lines = $n (expected 1)"; return } else { Write-Host "OK: served /frame/ carries the fold [lines=$n]" }
  $t2 = Join-Path $env:TEMP 'k296-flagship.html'; curl.exe -s -o $t2 'https://library.wuld.ink/combined?vk296ship=1'
  $m = Md5 $t2; if ($m -ne 'e654eabd32fa95e5969d49e6eb15aa87') { Write-Host "FAIL: flagship md5 $m (pin e654eabd)"; return } else { Write-Host 'OK: flagship e654eabd, pin v4.0.0 held' }
  Write-Host "K296 LANDED: $(git rev-parse --short HEAD) atop 4f5b53b - /frame/ folded to one phone screen; NO PIN"
}
