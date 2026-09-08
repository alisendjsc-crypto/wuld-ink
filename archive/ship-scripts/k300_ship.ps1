& {
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "FAIL no .git at $repo"; return }
  Set-Location $repo; [Environment]::CurrentDirectory = $repo
  Get-ChildItem '.git\index.lock*' -EA SilentlyContinue | Remove-Item -Force -EA SilentlyContinue
  Get-ChildItem '.git\objects' -Recurse -Filter 'tmp_obj_*' -EA SilentlyContinue | Remove-Item -Force -EA SilentlyContinue
  function Md5($p){ if(-not(Test-Path $p)){return 'MISSING'}; (Get-FileHash $p -Algorithm MD5).Hash.ToLower() }

  # K300 - the help vessel. NO Move-Item: the five files were written straight into
  # the working tree over the mount, so the guards below VERIFY the tree instead of
  # producing it. That is strictly stronger than a move - any drift between the
  # measurement and this run trips a gate. Nothing is irreversible before the commit.
  # coverage_audit is called with NO ARGUMENTS (cclxxv).

  $head = (git rev-parse HEAD 2>$null)
  if ([string]::IsNullOrWhiteSpace($head)) { Write-Host "FAIL no HEAD"; return }
  $head = $head.Trim()
  git fetch origin main --quiet
  $orig = (git rev-parse origin/main).Trim()
  if ($head -ne '37d0bab7615a6b042e2e1ea71a32e60f20322173') { Write-Host "FAIL HEAD $head != 37d0bab - K300 may already be in; STOP and report"; return }
  if ($head -ne $orig) { Write-Host "FAIL HEAD != origin/main $orig"; return }
  Write-Host "OK   HEAD == origin == 37d0bab (K299)"

  # the five files this commit carries, as measured at the K300 close
  $want = @{
    'src\components\successor-stage.js'   = '32b160cb5f011ad19c4c691a6d940804';
    'src\components\successor-stage.css'  = 'bdc756e41af0d31bc19be3364fc16f53';
    'src\successor\index.html'            = '7297631557c8bb8d46e0474844a1351e';
    'tools\omega\successor-stage-e2e.cjs' = 'd5c3872ce54c1c75d6f170cb93267847';
    'CLAUDE.md'                           = 'd149a0856a34aa0c0ad21f0dac7fbf90'
  }
  # and the load-bearing files this commit must NOT have touched
  $hold = @{
    'src\components\yurei-oracle.js'          = '7583b3767283ba7b081c0ed297af8943';
    'src\components\omega-corpus-mrgrey.json' = 'f0e02187df436e03a3ec9fcef4887bfb';
    'src\components\yurei-corpus-public.json' = '76c98eea698eb656e266fe9fa3c1b669';
    'tools\omega\coverage-audit-K299.json'    = '31f901dc49545f74798722e17482b39a'
  }
  $bad = 0
  foreach ($k in $want.Keys) { if ((Md5 $k) -ne $want[$k]) { Write-Host "FAIL changed-file md5 $k"; $bad++ } }
  foreach ($k in $hold.Keys) { if ((Md5 $k) -ne $hold[$k]) { Write-Host "FAIL UNMOVED-file md5 drifted $k"; $bad++ } }
  if ($bad -ne 0) { Write-Host "FAIL $bad file gate(s)"; return }
  Write-Host "OK   5 changed + 4 unmoved file gates"

  # shape asserts, with populations. Select-String counts LINES, never -AllMatches.
  $vNew = @(Select-String -Path 'src\successor\index.html' -SimpleMatch -Pattern 'successor-stage.css?v=K300','successor-stage.js?v=K300').Count
  if ($vNew -ne 2) { Write-Host "FAIL ?v=K300 lines $vNew, expected 2"; return }
  $vOld = @(Get-ChildItem 'src' -Recurse -File -Include *.html | Select-String -SimpleMatch -Pattern 'successor-stage.css?v=K275','successor-stage.js?v=K270').Count
  if ($vOld -ne 0) { Write-Host "FAIL stale ?v still in src: $vOld line(s)"; return }
  $pl = @(Get-ChildItem 'src' -Recurse -File -Include *.css,*.html,*.js | Select-String -SimpleMatch -Pattern 'pre-line').Count
  if ($pl -ne 0) { Write-Host "FAIL pre-line present in src: $pl line(s) - the seat amendment is preemptive"; return }
  $cap = @(Select-String -Path 'src\components\successor-stage.js' -SimpleMatch -Pattern 'var HINT_CAP = 4;').Count
  if ($cap -ne 1) { Write-Host "FAIL HINT_CAP lines $cap, expected 1"; return }
  $hid = @(Select-String -Path 'src\components\successor-stage.css' -SimpleMatch -Pattern '.sstage-hints[hidden]','.sstage-help-btn[hidden]').Count
  if ($hid -ne 2) { Write-Host "FAIL [hidden] display gates $hid, expected 2 - collapsed state would fail silent"; return }
  Write-Host "OK   ?v 2 new / 0 stale ; pre-line 0 ; HINT_CAP 4 ; 2 [hidden] gates"

  # the corpus must be untouched, proven by its own anatomy and not by the md5 alone
  $ent = (node -e "const c=require('./src/components/omega-corpus-mrgrey.json').yurei_corpus;console.log(c.entries.length+' '+c.entries.reduce((n,e)=>n+((e.patterns||[]).length),0))").Trim()
  if ($ent -ne '185 850') { Write-Host "FAIL mrgrey anatomy '$ent' != '185 850'"; return }
  $hn = (node -e "const e=require('./src/components/omega-corpus-mrgrey.json').yurei_corpus.entries.find(x=>x.id==='mg-oracle-help-01');console.log(e.class+' '+e.hints.length+' '+(e.href?'HREF':'nohref'))").Trim()
  if ($hn -ne 'response 4 nohref') { Write-Host "FAIL mg-oracle-help-01 shape '$hn' != 'response 4 nohref'"; return }
  Write-Host "OK   corpus untouched: 185/850 ; mg-oracle-help-01 response/4 hints/no href"

  node tools\yurei\yurei-parity.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL yurei-parity"; return }
  node tools\omega\omega-persona-gate.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL omega-persona-gate"; return }
  node tools\omega\mrgrey-register-gate.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL mrgrey-register-gate"; return }
  node tools\omega\coverage_audit.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL coverage_audit"; return }
  Write-Host "OK   4 house gates green"

  $e2e = (node tools\omega\successor-stage-e2e.cjs | Out-String)
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL successor-stage-e2e"; Write-Host $e2e; return }
  if ($e2e -notmatch '146/146 passed') { Write-Host "FAIL e2e count moved: $e2e"; return }
  node tools\omega\wgate-e2e.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL wgate-e2e"; return }
  node tools\omega\omega-surface-e2e.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL omega-surface-e2e"; return }
  Write-Host "OK   successor-stage-e2e 146/146 ; wgate ; omega-surface"

  git add src\components\successor-stage.js
  git add src\components\successor-stage.css
  git add src\successor\index.html
  git add tools\omega\successor-stage-e2e.cjs
  git add CLAUDE.md
  $staged = @(git diff --cached --name-only).Count
  if ($staged -ne 5) { Write-Host "FAIL staged $staged, expected 5"; git diff --cached --name-only; return }
  Write-Host "OK   staged 5"

  git commit -q -m "K300 the help vessel: [ ? ] control + four corpus-declared hint chips on /successor/, submitting through respond() so the crisis floor still fires at stage 1; e2e 90->146; suggestion system measured, not built; NO PIN, no corpus byte"
  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL push exited $LASTEXITCODE"; return }
  Write-Host "OK   pushed $(git rev-parse --short HEAD)"

  Start-Sleep -Seconds 75
  $t = Join-Path $env:TEMP 'k300.chk'
  curl.exe -s -o $t 'https://wuld.ink/components/successor-stage.js?v=K300'
  if ((Md5 $t) -ne '32b160cb5f011ad19c4c691a6d940804') { Write-Host "WARN served successor-stage.js != expected (edge cold, re-check in 2 min)" } else { Write-Host "OK   served successor-stage.js?v=K300" }
  curl.exe -s -o $t 'https://wuld.ink/components/successor-stage.css?v=K300'
  if ((Md5 $t) -ne 'bdc756e41af0d31bc19be3364fc16f53') { Write-Host "WARN served successor-stage.css != expected (edge cold)" } else { Write-Host "OK   served successor-stage.css?v=K300" }
  curl.exe -s -o $t 'https://wuld.ink/successor/'
  $n = @(Select-String -Path $t -SimpleMatch -Pattern 'successor-stage.css?v=K300','successor-stage.js?v=K300').Count
  if ($n -ne 2) { Write-Host "WARN served /successor/ carries $n of 2 K300 refs (edge cold)" } else { Write-Host "OK   served /successor/ carries both K300 refs" }
  curl.exe -s -o $t 'https://wuld.ink/components/omega-corpus-mrgrey.json'
  if ((Md5 $t) -ne 'f0e02187df436e03a3ec9fcef4887bfb') { Write-Host "FAIL served corpus moved - K300 must not have touched it" } else { Write-Host "OK   served corpus held f0e02187 (185/850)" }
  curl.exe -s -o $t 'https://library.wuld.ink/combined'
  if ((Md5 $t) -ne 'e654eabd32fa95e5969d49e6eb15aa87') { Write-Host "FAIL flagship moved" } else { Write-Host "OK   flagship held e654eabd (pin v4.0.0)" }
  Remove-Item $t -EA SilentlyContinue
  Write-Host "K300 DONE. Now open /successor/, tap [ ? ], and type: I do not want to live"
}
