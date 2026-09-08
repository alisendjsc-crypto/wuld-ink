& {
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "FAIL no .git at $repo"; return }
  Set-Location $repo; [Environment]::CurrentDirectory = $repo
  Get-ChildItem '.git\index.lock*' -EA SilentlyContinue | Remove-Item -Force -EA SilentlyContinue
  Get-ChildItem '.git\objects' -Recurse -Filter 'tmp_obj_*' -EA SilentlyContinue | Remove-Item -Force -EA SilentlyContinue
  function Md5($p){ if(-not(Test-Path $p)){return 'MISSING'}; (Get-FileHash $p -Algorithm MD5).Hash.ToLower() }

  $head = (git rev-parse HEAD 2>$null)
  if ([string]::IsNullOrWhiteSpace($head)) { Write-Host "FAIL no HEAD"; return }
  $head = $head.Trim()
  git fetch origin main --quiet
  $orig = (git rev-parse origin/main).Trim()
  if ($head -ne 'f1d8a6e19a5452902ed3016724bbb2e8b83850cc') { Write-Host "FAIL HEAD $head != f1d8a6e (K298)"; return }
  if ($head -ne $orig) { Write-Host "FAIL HEAD != origin/main $orig"; return }
  if ((git rev-parse HEAD:CLAUDE.md).Trim() -ne '982d41d4a31242927072d3351ad776231ae92bfe') { Write-Host "FAIL base blob CLAUDE.md"; return }
  if ((Md5 'CLAUDE.md') -ne '50992a92c01404465a8161f65e03653e') { Write-Host "FAIL base md5 CLAUDE.md"; return }
  Write-Host "OK   HEAD == origin == f1d8a6e ; CLAUDE.md at K298 base"

  if ((Md5 'CLAUDE.md.k299') -ne 'c506b3a79f206e5af6dceb12e11a375c') { Write-Host "FAIL CLAUDE.md.k299 sidecar"; return }
  Move-Item -Force 'CLAUDE.md.k299' 'CLAUDE.md'
  if ((Md5 'CLAUDE.md') -ne 'c506b3a79f206e5af6dceb12e11a375c') { Write-Host "FAIL CLAUDE.md result"; return }
  Write-Host "OK   stratum moved"

  # the eight engine/corpus files + two audit artifacts, pre-placed at final paths
  $want = @{
    'src\components\yurei-oracle.js'            = '7583b3767283ba7b081c0ed297af8943';
    'src\components\omega-corpus-mrgrey.json'   = 'f0e02187df436e03a3ec9fcef4887bfb';
    'src\components\yurei-corpus-public.json'   = '76c98eea698eb656e266fe9fa3c1b669';
    'src\components\yurei-corpus-oracle.json'   = 'c7324f1817a303ae288dbcfdd4d88da3';
    'src\components\omega-assistant.js'         = '1312a2c054a03131ae54a8467c4b24ef';
    'src\components\yurei-assistant.js'         = '75b0c9ceb1f2f50b4449cd2a7907866e';
    'tools\yurei\yurei_harness.py'              = 'ea57c84dc9bd4e1137b1d1ca20e3f394';
    'tools\omega\coverage_audit.cjs'            = '555b208f5081f94c267a17949b7c81f4';
    'tools\omega\coverage-audit-K299.json'      = '31f901dc49545f74798722e17482b39a';
    'tools\omega\coverage-audit-K299.md'        = 'd2d1cbfb2ed1d5718bc716437350adf1'
  }
  $bad = 0
  foreach ($k in $want.Keys) { if ((Md5 $k) -ne $want[$k]) { Write-Host "FAIL md5 $k"; $bad++ } }
  if ($bad -ne 0) { Write-Host "FAIL $bad file gate(s)"; return }
  Write-Host "OK   10 file gates"

  # shape asserts, with populations
  $ent = (node -e "const c=require('./src/components/omega-corpus-mrgrey.json').yurei_corpus;console.log(c.entries.length+' '+c.entries.reduce((n,e)=>n+((e.patterns||[]).length),0))").Trim()
  if ($ent -ne '185 850') { Write-Host "FAIL mrgrey anatomy '$ent' != '185 850'"; return }
  $cf = (node -e "const a=require('./src/components/omega-corpus-mrgrey.json').yurei_corpus.entries.filter(e=>e.class==='crisis');const b=require('./src/components/yurei-corpus-public.json').yurei_corpus.entries.filter(e=>e.class==='crisis');const s=x=>JSON.stringify(x.slice().sort((p,q)=>p.id<q.id?-1:1));console.log((s(a)===s(b))+' '+a.reduce((n,e)=>n+e.patterns.length,0))").Trim()
  if ($cf -ne 'true 29') { Write-Host "FAIL crisis floor '$cf' != 'true 29' (identical + 29 forms)"; return }
  $v1 = @(Select-String -Path 'src\components\omega-assistant.js' -SimpleMatch 'var VER = "K299";').Count
  $v2 = @(Select-String -Path 'src\components\yurei-assistant.js' -SimpleMatch 'var VER = "K299";').Count
  if ($v1 -ne 1 -or $v2 -ne 1) { Write-Host "FAIL VER bumps $v1/$v2, expected 1/1"; return }
  Write-Host "OK   anatomy 185/850 ; floor identical + 29 forms ; VER K299 x2"

  # THE FOUR HOUSE GATES, run before the commit - a corpus change is not shippable without them
  node tools\yurei\yurei-parity.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL yurei-parity"; return }
  node tools\omega\omega-persona-gate.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL omega-persona-gate"; return }
  node tools\omega\mrgrey-register-gate.cjs | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL mrgrey-register-gate"; return }
  $tmpAudit = Join-Path $env:TEMP 'k299-audit.json'
  node tools\omega\coverage_audit.cjs "" "" "" $tmpAudit | Out-Null
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL coverage_audit"; return }
  Remove-Item $tmpAudit -EA SilentlyContinue
  Write-Host "OK   4 house gates green"

  git add src tools CLAUDE.md
  $staged = @(git diff --cached --name-only).Count
  if ($staged -ne 17) { Write-Host "FAIL staged $staged, expected 17"; git diff --cached --name-only; return }
  Write-Host "OK   staged 17"

  git commit -q -m "K299 TX15-BACK folded: crisis floor 18->29 forms in both corpora, normalizer amendment on both sides of the JS/python parity contract, Ask A entry + rider edits, routing law + community demote; NO PIN"
  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL push exited $LASTEXITCODE"; return }
  Write-Host "OK   pushed $(git rev-parse --short HEAD)"

  Start-Sleep -Seconds 75
  $t = Join-Path $env:TEMP 'k299.chk'
  curl.exe -s -o $t 'https://wuld.ink/components/yurei-oracle.js?v=K299'
  if ((Md5 $t) -ne '7583b3767283ba7b081c0ed297af8943') { Write-Host "WARN served engine != expected (edge cold, re-check in 2 min)" } else { Write-Host "OK   served yurei-oracle.js?v=K299" }
  curl.exe -s -o $t 'https://wuld.ink/components/omega-corpus-mrgrey.json'
  if ((Md5 $t) -ne 'f0e02187df436e03a3ec9fcef4887bfb') { Write-Host "WARN served mrgrey corpus != expected (edge cold)" } else { Write-Host "OK   served omega-corpus-mrgrey.json" }
  curl.exe -s -o $t 'https://wuld.ink/components/yurei-corpus-public.json'
  if ((Md5 $t) -ne '76c98eea698eb656e266fe9fa3c1b669') { Write-Host "WARN served yurei corpus != expected (edge cold)" } else { Write-Host "OK   served yurei-corpus-public.json" }
  curl.exe -s -o $t 'https://library.wuld.ink/combined'
  if ((Md5 $t) -ne 'e654eabd32fa95e5969d49e6eb15aa87') { Write-Host "FAIL flagship moved" } else { Write-Host "OK   flagship held e654eabd (pin v4.0.0)" }
  Remove-Item $t -EA SilentlyContinue
}
