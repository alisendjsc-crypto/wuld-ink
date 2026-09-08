& {
  $repo = "C:\Users\y_m_a\Projects\wuld-ink"
  $k    = "C:\Users\y_m_a\Downloads\k306"
  if (-not (Test-Path (Join-Path $repo ".git"))) { Write-Host "FAIL no .git at $repo"; return }
  Set-Location $repo
  [Environment]::CurrentDirectory = (Get-Location).Path
  Remove-Item ".git\index.lock*" -Force -ErrorAction SilentlyContinue
  Get-ChildItem ".git\objects" -Recurse -Filter "tmp_obj_*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

  function Md5($p) { if (-not (Test-Path $p)) { return "MISSING" } ; return (Get-FileHash $p -Algorithm MD5).Hash.ToLower() }
  function Blob($p) { $h = git rev-parse "HEAD:$p" 2>$null ; if ($null -eq $h) { return "MISSING" } ; return $h.Trim() }

  $head = git rev-parse HEAD 2>$null
  if ($null -eq $head) { Write-Host "FAIL rev-parse returned nothing"; return }
  $head = $head.Trim()
  git fetch origin main 2>&1 | Out-Null
  $orig = (git rev-parse origin/main).Trim()
  if ($head -ne "a6fb96b5b4dd78624160f13c1586ff52a1377f6e") { Write-Host "FAIL HEAD $head want a6fb96b5b4dd78624160f13c1586ff52a1377f6e"; return }
  if ($head -ne $orig) { Write-Host "FAIL HEAD $head != origin $orig"; return }
  Write-Host "OK  HEAD == origin == $head"

  # ---- base guards: working copy must equal HEAD for every file we replace ----
  $bases = @{}
  $bases["src\components\omega-corpus-mrgrey.json"] = "ed4b9442c1307b3a52c3e245d49c72f3"
  $bases["src\components\successor-stage.js"]       = "aab19e180164cd194f54290406bd56ef"
  $bases["src\components\omega-assistant.js"]       = "1312a2c054a03131ae54a8467c4b24ef"
  $bases["src\components\yurei-assistant.js"]       = "75b0c9ceb1f2f50b4449cd2a7907866e"
  $bases["src\successor\index.html"]                = "14c34c7e496ed6a999240ac7f6dd3b64"
  $bases["tools\omega\coverage_audit.cjs"]          = "5202b2d22f6f34cf9a677d3d68942466"
  $bases["CLAUDE.md"]                               = "5396634d9e15a2d09c9f70ff0aa20fe4"
  foreach ($p in $bases.Keys) { $m = Md5 $p ; if ($m -ne $bases[$p]) { Write-Host "FAIL base $p"; Write-Host "     got  $m"; Write-Host "     want $($bases[$p])"; return } }
  Write-Host "OK  7 base files match HEAD"

  # ---- sidecar gates BEFORE any move ----
  $side = @{}
  $side["$k\omega-corpus-mrgrey.k306.json"] = "74a36bd0e40b5a9b360291dd250d3969"
  $side["$k\successor-stage.k306.js"]       = "54d0892c2678962eca99973955f1d35c"
  $side["$k\omega-assistant.k306.js"]       = "ee5da38d3687c4536d4b4ae1aa2fe092"
  $side["$k\yurei-assistant.k306.js"]       = "5d3e142fa00d89dd15d9f5fdffcc01c4"
  $side["$k\successor-index.k306.html"]     = "ec741930fc0dc2a61d6000b37e128f7a"
  $side["$k\coverage_audit.k306.cjs"]       = "1c5ad7736a842e535195a407ba3a9b67"
  $side["$k\coverage-audit-K306.json"]      = "982a8f4f7a5ce3cb65c04b08806e02cb"
  $side["$k\coverage-audit-K306.md"]        = "1dfa9de235c946fc06848793b0203630"
  $side["$k\k306\candidates_k306.json"]     = "da0c21ed955da908a93d38c22f1f3de9"
  $side["$k\k306\fold_k306_sec3.py"]        = "27587340d6e516f9af798c121e645d22"
  $side["$k\k306\probe_k306.cjs"]           = "22cfae9f79ea4607328864382a59d77b"
  $side["$k\CLAUDE.md.k306"]                = "f0ecd6b24140b11d2408dc7d1d8ae720"
  foreach ($p in $side.Keys) { $m = Md5 $p ; if ($m -ne $side[$p]) { Write-Host "FAIL sidecar $p"; Write-Host "     got  $m"; Write-Host "     want $($side[$p])"; return } }
  Write-Host "OK  12 sidecars byte-exact"

  New-Item -ItemType Directory -Force -Path "tools\omega\k306" | Out-Null

  Move-Item "$k\omega-corpus-mrgrey.k306.json" "src\components\omega-corpus-mrgrey.json" -Force
  Move-Item "$k\successor-stage.k306.js"       "src\components\successor-stage.js" -Force
  Move-Item "$k\omega-assistant.k306.js"       "src\components\omega-assistant.js" -Force
  Move-Item "$k\yurei-assistant.k306.js"       "src\components\yurei-assistant.js" -Force
  Move-Item "$k\successor-index.k306.html"     "src\successor\index.html" -Force
  Move-Item "$k\coverage_audit.k306.cjs"       "tools\omega\coverage_audit.cjs" -Force
  Move-Item "$k\coverage-audit-K306.json"      "tools\omega\coverage-audit-K306.json" -Force
  Move-Item "$k\coverage-audit-K306.md"        "tools\omega\coverage-audit-K306.md" -Force
  Move-Item "$k\k306\candidates_k306.json"     "tools\omega\k306\candidates_k306.json" -Force
  Move-Item "$k\k306\fold_k306_sec3.py"        "tools\omega\k306\fold_k306_sec3.py" -Force
  Move-Item "$k\k306\probe_k306.cjs"           "tools\omega\k306\probe_k306.cjs" -Force
  Move-Item "$k\CLAUDE.md.k306"                "CLAUDE.md" -Force

  # ---- result gates ----
  $res = @{}
  $res["src\components\omega-corpus-mrgrey.json"]   = "74a36bd0e40b5a9b360291dd250d3969"
  $res["src\components\successor-stage.js"]         = "54d0892c2678962eca99973955f1d35c"
  $res["src\components\omega-assistant.js"]         = "ee5da38d3687c4536d4b4ae1aa2fe092"
  $res["src\components\yurei-assistant.js"]         = "5d3e142fa00d89dd15d9f5fdffcc01c4"
  $res["src\successor\index.html"]                  = "ec741930fc0dc2a61d6000b37e128f7a"
  $res["tools\omega\coverage_audit.cjs"]            = "1c5ad7736a842e535195a407ba3a9b67"
  $res["tools\omega\coverage-audit-K306.json"]      = "982a8f4f7a5ce3cb65c04b08806e02cb"
  $res["tools\omega\coverage-audit-K306.md"]        = "1dfa9de235c946fc06848793b0203630"
  $res["tools\omega\k306\candidates_k306.json"]     = "da0c21ed955da908a93d38c22f1f3de9"
  $res["tools\omega\k306\fold_k306_sec3.py"]        = "27587340d6e516f9af798c121e645d22"
  $res["tools\omega\k306\probe_k306.cjs"]           = "22cfae9f79ea4607328864382a59d77b"
  $res["CLAUDE.md"]                                 = "f0ecd6b24140b11d2408dc7d1d8ae720"
  foreach ($p in $res.Keys) { $m = Md5 $p ; if ($m -ne $res[$p]) { Write-Host "FAIL result $p"; Write-Host "     got  $m"; Write-Host "     want $($res[$p])"; return } }
  Write-Host "OK  12 result files byte-exact"

  # ---- shape asserts (lines; occ == lines was verified in-session) ----
  $a = @(Select-String -Path "src\components\successor-stage.js" -Pattern 'var VER = "K306"' -SimpleMatch).Count
  $b = @(Select-String -Path "src\components\omega-assistant.js" -Pattern 'var VER = "K306"' -SimpleMatch).Count
  $c = @(Select-String -Path "src\components\yurei-assistant.js" -Pattern 'var VER = "K306"' -SimpleMatch).Count
  $d = @(Select-String -Path "src\successor\index.html" -Pattern 'successor-stage.js?v=K306' -SimpleMatch).Count
  $e = @(Select-String -Path "src\successor\index.html" -Pattern 'omega-assistant.js?v=K306' -SimpleMatch).Count
  $f = @(Select-String -Path "src\components\successor-stage.js" -Pattern 'yurei-oracle.js?v=' -SimpleMatch).Count
  if ($a -ne 1 -or $b -ne 1 -or $c -ne 1) { Write-Host "FAIL VER lines stage=$a omega=$b yurei=$c want 1/1/1"; return }
  if ($d -ne 1 -or $e -ne 1) { Write-Host "FAIL page ?v lines stage=$d omega=$e want 1/1"; return }
  if ($f -ne 1) { Write-Host "FAIL versioned ORACLE_SRC lines=$f want 1"; return }
  Write-Host "OK  shape asserts 6/6"

  # ---- residual OLD strings, SCOPED TO src (repo-wide would hit CLAUDE.md prose -- cclxxii) ----
  $r1 = @(Get-ChildItem src -Recurse -Include *.js | Select-String -Pattern 'var VER = "K255"' -SimpleMatch).Count
  $r2 = @(Get-ChildItem src -Recurse -Include *.js | Select-String -Pattern 'var VER = "K299"' -SimpleMatch).Count
  $r3 = @(Select-String -Path "src\successor\index.html" -Pattern 'successor-stage.js?v=K301' -SimpleMatch).Count
  $r4 = @(Select-String -Path "src\successor\index.html" -Pattern 'omega-assistant.js?v=K270' -SimpleMatch).Count
  if ($r1 -ne 0 -or $r2 -ne 0 -or $r3 -ne 0 -or $r4 -ne 0) { Write-Host "FAIL residual in src: K255=$r1 K299=$r2 K301=$r3 K270=$r4"; return }
  Write-Host "OK  no stale VER or ?v left in src"

  # ---- corpus parses to the shipped anatomy ----
  $n = node -e "const d=require('./src/components/omega-corpus-mrgrey.json').yurei_corpus.entries;let f=0;for(const e of d)f+=(e.patterns||[]).length;console.log(d.length+'/'+f)"
  if ($n.Trim() -ne "189/1109") { Write-Host "FAIL corpus anatomy $($n.Trim()) want 189/1109"; return }
  Write-Host "OK  corpus parses 189 entries / 1109 forms"

  git status --short
  git add "src/components/omega-corpus-mrgrey.json"
  git add "src/components/successor-stage.js"
  git add "src/components/omega-assistant.js"
  git add "src/components/yurei-assistant.js"
  git add "src/successor/index.html"
  git add "tools/omega/coverage_audit.cjs"
  git add "tools/omega/coverage-audit-K306.json"
  git add "tools/omega/coverage-audit-K306.md"
  git add "tools/omega/k306/candidates_k306.json"
  git add "tools/omega/k306/fold_k306_sec3.py"
  git add "tools/omega/k306/probe_k306.cjs"
  git add "CLAUDE.md"
  $staged = @(git diff --cached --name-only).Count
  if ($staged -ne 12) { Write-Host "FAIL staged $staged want 12"; git diff --cached --name-only; return }
  Write-Host "OK  staged 12"

  git commit -m "K306 delivery path + section-3 fold: three dead cache-busters revived (VER gated the ENGINE at max-age=14400, not the corpus at 300; K24p closed - content type, not rule shape), ORACLE_SRC versioned for the first time, and 33 library-title forms folded (class1 469->435; 12 held for the seat); NO PIN"
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL commit"; return }
  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL push"; return }
  Write-Host "OK  pushed"

  Start-Sleep -Seconds 75

  # ---- live verify AT THE URL THE PAGE REQUESTS (cclxxxv), not a novel buster ----
  $t = Join-Path $env:TEMP "k306v"
  curl.exe -s -o $t "https://wuld.ink/components/successor-stage.js?v=K306"
  $m = Md5 $t ; if ($m -ne "54d0892c2678962eca99973955f1d35c") { Write-Host "WARN served successor-stage.js?v=K306 = $m (edge cold - re-run in 2 min)" } else { Write-Host "OK  served successor-stage.js?v=K306 byte-exact" }
  curl.exe -s -o $t "https://wuld.ink/components/omega-assistant.js?v=K306"
  $m = Md5 $t ; if ($m -ne "ee5da38d3687c4536d4b4ae1aa2fe092") { Write-Host "WARN served omega-assistant.js?v=K306 = $m (edge cold - re-run)" } else { Write-Host "OK  served omega-assistant.js?v=K306 byte-exact" }
  curl.exe -s -o $t "https://wuld.ink/components/omega-corpus-mrgrey.json?v=K306"
  $m = Md5 $t ; if ($m -ne "74a36bd0e40b5a9b360291dd250d3969") { Write-Host "WARN served corpus?v=K306 = $m (re-run)" } else { Write-Host "OK  served corpus?v=K306 byte-exact (189/1109)" }
  curl.exe -s -o $t "https://wuld.ink/successor/"
  $h1 = @(Select-String -Path $t -Pattern 'successor-stage.js?v=K306' -SimpleMatch).Count
  $h2 = @(Select-String -Path $t -Pattern 'omega-assistant.js?v=K306' -SimpleMatch).Count
  $h3 = @(Select-String -Path $t -Pattern 'successor-stage.js?v=K301' -SimpleMatch).Count
  Write-Host "    /successor/ content-grep: new stage=$h1 omega=$h2  stale K301=$h3  (want 1 1 0)"
  curl.exe -s -o $t "https://library.wuld.ink/combined"
  $m = Md5 $t ; if ($m -ne "e654eabd32fa95e5969d49e6eb15aa87") { Write-Host "WARN flagship $m -- expected e654eabd32fa95e5969d49e6eb15aa87" } else { Write-Host "OK  flagship HELD e654eabd (pin v4.0.0)" }
  Write-Host "K306 done."
}
