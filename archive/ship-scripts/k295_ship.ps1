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
  if ($head -ne '2c985964b65ffdd9ea9871a10711c4e4658e558b') { Write-Host "FAIL: HEAD is $head, expected 2c98596 (K294b) - re-derive"; return } else { Write-Host 'OK: HEAD == 2c98596' }
  if ($head -ne $origin) { Write-Host "FAIL: HEAD $head != origin/main $origin (another committer?)"; return } else { Write-Host 'OK: HEAD == origin/main' }
  $blob = "$(git rev-parse HEAD:CLAUDE.md)".Trim()
  if ($blob -ne 'f36e15b0d77db7d518ff24f85b2d516ff5b144bb') { Write-Host "FAIL: CLAUDE.md base blob $blob (expected f36e15b0)"; return } else { Write-Host 'OK: CLAUDE.md base blob f36e15b0' }
  # --- sidecar + pre-placed files: MD5 gates BEFORE any move ---
  $m = Md5 'CLAUDE.md.k295'; if ($m -ne '0680ba07f8f509805862ffbd73b68663') { Write-Host "FAIL: CLAUDE.md.k295 md5 $m"; return } else { Write-Host 'OK: sidecar CLAUDE.md.k295 0680ba07' }
  $m = Md5 'tools\omega\coverage_audit.cjs'; if ($m -ne 'a336eea0018e86ddf57a9a566a848caf') { Write-Host "FAIL: coverage_audit.cjs md5 $m"; return } else { Write-Host 'OK: coverage_audit.cjs a336eea0' }
  $m = Md5 'tools\omega\coverage-audit-K295.json'; if ($m -ne '0cd28e3511946baa111196d96f1d0f5a') { Write-Host "FAIL: coverage-audit-K295.json md5 $m"; return } else { Write-Host 'OK: coverage-audit-K295.json 0cd28e35' }
  $m = Md5 'tools\omega\coverage-audit-K295.md'; if ($m -ne '11dffd4f9cc64d8280190c3797a6efb2') { Write-Host "FAIL: coverage-audit-K295.md md5 $m"; return } else { Write-Host 'OK: coverage-audit-K295.md 11dffd4f' }
  if (Test-Path 'tools\omega\coverage-audit.json') { Write-Host 'FAIL: stray tools\omega\coverage-audit.json exists (default-output trap)'; return } else { Write-Host 'OK: no default-output stray' }
  # --- the one move + result gate ---
  Move-Item -LiteralPath 'CLAUDE.md.k295' -Destination 'CLAUDE.md' -Force
  $m = Md5 'CLAUDE.md'; if ($m -ne '0680ba07f8f509805862ffbd73b68663') { Write-Host "FAIL: CLAUDE.md result md5 $m"; return } else { Write-Host 'OK: CLAUDE.md result 0680ba07' }
  # --- shape asserts, populations printed ---
  node --check tools\omega\coverage_audit.cjs; if ($LASTEXITCODE -ne 0) { Write-Host 'FAIL: node --check coverage_audit.cjs'; return } else { Write-Host 'OK: node --check' }
  $n = @(Select-String -LiteralPath 'tools\omega\coverage-audit-K295.json' -SimpleMatch -Pattern '"fatal": 0').Count; if ($n -ne 1) { Write-Host "FAIL: JSON fatal-0 lines = $n (expected 1)"; return } else { Write-Host "OK: JSON meta.fatal 0 [lines=$n]" }
  $n = @(Select-String -LiteralPath 'tools\omega\coverage-audit-K295.json' -SimpleMatch -Pattern '"entries": 184').Count; if ($n -ne 1) { Write-Host "FAIL: JSON entries-184 lines = $n (expected 1)"; return } else { Write-Host "OK: JSON meta.entries 184 [lines=$n]" }
  $n = @(Select-String -LiteralPath 'tools\omega\coverage-audit-K295.md' -SimpleMatch -Pattern '## Findings').Count; if ($n -ne 1) { Write-Host "FAIL: MD Findings headings = $n (expected 1)"; return } else { Write-Host "OK: MD carries ## Findings [lines=$n]" }
  $n = @(Select-String -LiteralPath 'CLAUDE.md' -SimpleMatch -Pattern '### K295 (').Count; if ($n -ne 1) { Write-Host "FAIL: K295 strata in CLAUDE.md = $n (expected 1)"; return } else { Write-Host "OK: CLAUDE.md carries the K295 stratum once [lines=$n]" }
  git status --short
  # --- explicit stage, one path per line; NEVER git add -u / . ---
  git add -- CLAUDE.md
  git add -- tools/omega/coverage_audit.cjs
  git add -- tools/omega/coverage-audit-K295.json
  git add -- tools/omega/coverage-audit-K295.md
  $staged = @(git diff --cached --name-only); if ($staged.Count -ne 4) { Write-Host "FAIL: staged $($staged.Count) paths, expected 4:`n$($staged -join "`n")"; git reset --quiet; return } else { Write-Host "OK: staged 4 [$($staged -join ', ')]" }
  $ls = git ls-files -s -- CLAUDE.md tools/omega/coverage_audit.cjs tools/omega/coverage-audit-K295.json tools/omega/coverage-audit-K295.md
  $n = @($ls | Select-String -SimpleMatch -Pattern '4929034fde88c066540bec7565240f6b739fe159').Count; if ($n -ne 1) { Write-Host 'FAIL: index blob CLAUDE.md != 4929034f'; git reset --quiet; return } else { Write-Host 'OK: index blob CLAUDE.md 4929034f' }
  $n = @($ls | Select-String -SimpleMatch -Pattern '4b912c7e95fcb36104eb9249c9e448c08777deaa').Count; if ($n -ne 1) { Write-Host 'FAIL: index blob coverage_audit.cjs != 4b912c7e'; git reset --quiet; return } else { Write-Host 'OK: index blob coverage_audit.cjs 4b912c7e' }
  $n = @($ls | Select-String -SimpleMatch -Pattern 'daaae1039bbde2850373aa1010643325c0ec45bc').Count; if ($n -ne 1) { Write-Host 'FAIL: index blob coverage-audit-K295.json != daaae103'; git reset --quiet; return } else { Write-Host 'OK: index blob coverage-audit-K295.json daaae103' }
  $n = @($ls | Select-String -SimpleMatch -Pattern '2b4b1dbcc1ccddfa6a8d95bda7cd6f15044be94c').Count; if ($n -ne 1) { Write-Host 'FAIL: index blob coverage-audit-K295.md != 2b4b1dbc'; git reset --quiet; return } else { Write-Host 'OK: index blob coverage-audit-K295.md 2b4b1dbc' }
  git commit --quiet -m 'K295 the Successor coverage audit: what the proxy cannot answer, computed from the corpus and the real matcher with no visitor in the loop - tools/omega/coverage_audit.cjs plus its K295 evidence (JSON every row, MD ranked tables); three kickoff premises corrected by reading the engine (the crisis floor fires at stage 1 on any hit with no threshold, scores are a MAX of BASE+weight never a sum, so threshold headroom cannot exist; the K253 Latin-greet claim was wrong - no schedule of three hellos reaches mg-greet-04); calibration 12/12, self-match 826/833 with every failure a declared collision, 0 undeclared steals, 2 true coin flips (hi, edgelord), contraction expansion survives 14.9 pct and a hyphen kills 97 pct, 27 of 32 help-shaped inputs deflect, a rephrase within the dampening window deflects for 147 of 177 entries, 33 signed objections have 52 library-authored phrasings that deflect, the floor own coverage 2 of 24 adjacent distress phrasings (report-only, shared bytes); the help affordance MECHANISM proven on a scratch candidate (oracle-class mg-oracle-help-01 + additive hints, three gates GREEN) and handed to the seat as TX15 with the words unwritten; MEASURE-ONLY, zero src bytes, no ?v, no sweep, no sw.js, NO PIN'
  if ($LASTEXITCODE -ne 0) { Write-Host 'FAIL: commit'; return } else { Write-Host "OK: committed $(git rev-parse --short HEAD)" }
  git config http.postBuffer 524288000
  git push origin main; if ($LASTEXITCODE -ne 0) { Write-Host 'FAIL: push (ignore any Everything up-to-date noise after an RPC error - re-run push)'; return } else { Write-Host 'OK: pushed' }
  Start-Sleep 75
  # --- live asserts: measure-only ship, so every check is a NEGATIVE one (nothing served may have moved) ---
  $t1 = Join-Path $env:TEMP 'k295-corpus.json'; curl.exe -s -o $t1 'https://wuld.ink/components/omega-corpus-mrgrey.json?vk295ship=1'
  $m = Md5 $t1; if ($m -ne '46eea9d15adf6b2bac6a61e69a609855') { Write-Host "FAIL: served corpus md5 $m (expected 46eea9d1 - the ship must move NO corpus byte)"; return } else { Write-Host 'OK: served corpus still 46eea9d1' }
  $t2 = Join-Path $env:TEMP 'k295-flagship.html'; curl.exe -s -o $t2 'https://library.wuld.ink/combined?vk295ship=1'
  $m = Md5 $t2; if ($m -ne 'e654eabd32fa95e5969d49e6eb15aa87') { Write-Host "FAIL: flagship md5 $m (pin e654eabd)"; return } else { Write-Host 'OK: flagship e654eabd, pin v4.0.0 held' }
  $t3 = Join-Path $env:TEMP 'k295-successor.html'; curl.exe -s -o $t3 'https://wuld.ink/successor/?vk295ship=1'
  $n = @(Select-String -LiteralPath $t3 -SimpleMatch -Pattern 'successor-stage.js?v=K270').Count; if ($n -lt 1) { Write-Host "FAIL: /successor/ stage ref lines = $n"; return } else { Write-Host "OK: /successor/ still successor-stage.js?v=K270 [lines=$n]" }
  $n = @(Select-String -LiteralPath $t3 -SimpleMatch -Pattern 'omega-assistant.js?v=K270').Count; if ($n -lt 1) { Write-Host "FAIL: /successor/ assistant ref lines = $n"; return } else { Write-Host "OK: /successor/ still omega-assistant.js?v=K270 [lines=$n]" }
  Write-Host "K295 LANDED: $(git rev-parse --short HEAD) atop 2c98596 - measure-only, nothing served moved"
}
