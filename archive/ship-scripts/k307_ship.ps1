& {
  $repo = "C:\Users\y_m_a\Projects\wuld-ink"
  $k    = "C:\Users\y_m_a\Downloads\k307"
  if (-not (Test-Path (Join-Path $repo ".git"))) { Write-Host "FAIL no .git at $repo"; return }
  Set-Location $repo
  [Environment]::CurrentDirectory = (Get-Location).Path
  Remove-Item ".git\index.lock*" -Force -ErrorAction SilentlyContinue
  Get-ChildItem ".git\objects" -Recurse -Filter "tmp_obj_*" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

  function Md5($p) { if (-not (Test-Path $p)) { return "MISSING" } ; return (Get-FileHash $p -Algorithm MD5).Hash.ToLower() }

  $head = git rev-parse HEAD 2>$null
  if ($null -eq $head) { Write-Host "FAIL rev-parse returned nothing"; return }
  $head = $head.Trim()
  git fetch origin main 2>&1 | Out-Null
  $orig = (git rev-parse origin/main).Trim()
  if ($head -ne "2b3aa0d60b5107ed7c0f33cab37f7919c13ea864") { Write-Host "FAIL HEAD $head want 2b3aa0d60b5107ed7c0f33cab37f7919c13ea864"; return }
  if ($head -ne $orig) { Write-Host "FAIL HEAD $head != origin $orig"; return }
  Write-Host "OK  HEAD == origin == $head"

  # ---- base guards ----
  $bases = @{}
  $bases["src\components\omega-corpus-mrgrey.json"] = "74a36bd0e40b5a9b360291dd250d3969"
  $bases["src\components\agent-settings.css"]       = "b1e401ddceab79c4f0b8e2f019b48d80"
  $bases["src\successor\index.html"]                = "ec741930fc0dc2a61d6000b37e128f7a"
  $bases["tools\omega\coverage_audit.cjs"]          = "1c5ad7736a842e535195a407ba3a9b67"
  $bases["tools\omega\successor-stage-e2e.cjs"]     = "0ad4df2bd0aad4f929682d319cfb78d5"
  $bases["CLAUDE.md"]                               = "f0ecd6b24140b11d2408dc7d1d8ae720"
  foreach ($p in $bases.Keys) { $m = Md5 $p ; if ($m -ne $bases[$p]) { Write-Host "FAIL base $p"; Write-Host "     got  $m"; Write-Host "     want $($bases[$p])"; return } }
  Write-Host "OK  6 base files match HEAD"

  # ---- sidecar gates BEFORE any move ----
  $side = @{}
  $side["$k\omega-corpus-mrgrey.k307.json"]   = "6e77fa16608b56c5eab3ed8a726875be"
  $side["$k\agent-settings.k307.css"]         = "ef40db53e50f884b744615867d051eb6"
  $side["$k\successor-index.k307.html"]       = "7fd9f3c622673a1e592e3d4efad7238f"
  $side["$k\coverage_audit.k307.cjs"]         = "aaf2017eddf3ab3ee985c2e6f1b76ca0"
  $side["$k\successor-stage-e2e.k307.cjs"]    = "563d8a65c317e74cb821eafbda802702"
  $side["$k\anatomy-fence.cjs"]               = "0e86d92a6e75835b2604f835ebfa1e30"
  $side["$k\rejection-fence.cjs"]             = "d1d514f46593be0e528f79bccd63e081"
  $side["$k\rejected_forms.json"]             = "fda8c78d43c1f878d5ea24d5f831b770"
  $side["$k\coverage-audit-K307.json"]        = "4bf5a79981f2697511ff067d51dcac84"
  $side["$k\coverage-audit-K307.md"]          = "ac10b2a9da0a7cf523449801dc2ac893"
  $side["$k\k307\tx21_k307.json"]             = "012d71ca0f253657dbbe16013ea474b5"
  $side["$k\k307\apply_k307.py"]              = "455576956944a5deb392694f787386ee"
  $side["$k\k307\probe_k307.cjs"]             = "1a9c15b0249e3465071c3edc217e6046"
  $side["$k\k307\fixpoint_k307.py"]           = "c48b17c043c43e3ea1ca244e0dfa787c"
  $side["$k\k307\redirect_out.cjs"]           = "50c294d15267ef118b2a219ac8402ee6"
  $side["$k\k307\fixpoint_k307.json"]         = "278b1acc5c6d5edf5673d7ebb1762659"
  $side["$k\k307\fixpoint_classified.json"]   = "c15e957406193a79acb79ce84a3ad0cc"
  $side["$k\k307\review_batch_k307.csv"]      = "094e083ef427e7a77593689b7dccf12b"
  $side["$k\CLAUDE.md.k307"]                  = "7046efc0cdc5686aa942f9d9f0033691"
  foreach ($p in $side.Keys) { $m = Md5 $p ; if ($m -ne $side[$p]) { Write-Host "FAIL sidecar $p"; Write-Host "     got  $m"; Write-Host "     want $($side[$p])"; return } }
  Write-Host "OK  19 sidecars byte-exact"

  New-Item -ItemType Directory -Force -Path "tools\omega\k307" | Out-Null

  Move-Item "$k\omega-corpus-mrgrey.k307.json" "src\components\omega-corpus-mrgrey.json" -Force
  Move-Item "$k\agent-settings.k307.css"       "src\components\agent-settings.css" -Force
  Move-Item "$k\successor-index.k307.html"     "src\successor\index.html" -Force
  Move-Item "$k\coverage_audit.k307.cjs"       "tools\omega\coverage_audit.cjs" -Force
  Move-Item "$k\successor-stage-e2e.k307.cjs"  "tools\omega\successor-stage-e2e.cjs" -Force
  Move-Item "$k\anatomy-fence.cjs"             "tools\omega\anatomy-fence.cjs" -Force
  Move-Item "$k\rejection-fence.cjs"           "tools\omega\rejection-fence.cjs" -Force
  Move-Item "$k\rejected_forms.json"           "tools\omega\rejected_forms.json" -Force
  Move-Item "$k\coverage-audit-K307.json"      "tools\omega\coverage-audit-K307.json" -Force
  Move-Item "$k\coverage-audit-K307.md"        "tools\omega\coverage-audit-K307.md" -Force
  Move-Item "$k\k307\tx21_k307.json"           "tools\omega\k307\tx21_k307.json" -Force
  Move-Item "$k\k307\apply_k307.py"            "tools\omega\k307\apply_k307.py" -Force
  Move-Item "$k\k307\probe_k307.cjs"           "tools\omega\k307\probe_k307.cjs" -Force
  Move-Item "$k\k307\fixpoint_k307.py"         "tools\omega\k307\fixpoint_k307.py" -Force
  Move-Item "$k\k307\redirect_out.cjs"         "tools\omega\k307\redirect_out.cjs" -Force
  Move-Item "$k\k307\fixpoint_k307.json"       "tools\omega\k307\fixpoint_k307.json" -Force
  Move-Item "$k\k307\fixpoint_classified.json" "tools\omega\k307\fixpoint_classified.json" -Force
  Move-Item "$k\k307\review_batch_k307.csv"    "tools\omega\k307\review_batch_k307.csv" -Force
  Move-Item "$k\CLAUDE.md.k307"                "CLAUDE.md" -Force

  # ---- result gates ----
  $res = @{}
  $res["src\components\omega-corpus-mrgrey.json"]      = "6e77fa16608b56c5eab3ed8a726875be"
  $res["src\components\agent-settings.css"]            = "ef40db53e50f884b744615867d051eb6"
  $res["src\successor\index.html"]                     = "7fd9f3c622673a1e592e3d4efad7238f"
  $res["tools\omega\coverage_audit.cjs"]               = "aaf2017eddf3ab3ee985c2e6f1b76ca0"
  $res["tools\omega\successor-stage-e2e.cjs"]          = "563d8a65c317e74cb821eafbda802702"
  $res["tools\omega\anatomy-fence.cjs"]                = "0e86d92a6e75835b2604f835ebfa1e30"
  $res["tools\omega\rejection-fence.cjs"]              = "d1d514f46593be0e528f79bccd63e081"
  $res["tools\omega\rejected_forms.json"]              = "fda8c78d43c1f878d5ea24d5f831b770"
  $res["tools\omega\coverage-audit-K307.json"]         = "4bf5a79981f2697511ff067d51dcac84"
  $res["tools\omega\coverage-audit-K307.md"]           = "ac10b2a9da0a7cf523449801dc2ac893"
  $res["tools\omega\k307\tx21_k307.json"]              = "012d71ca0f253657dbbe16013ea474b5"
  $res["tools\omega\k307\apply_k307.py"]               = "455576956944a5deb392694f787386ee"
  $res["tools\omega\k307\probe_k307.cjs"]              = "1a9c15b0249e3465071c3edc217e6046"
  $res["tools\omega\k307\fixpoint_k307.py"]            = "c48b17c043c43e3ea1ca244e0dfa787c"
  $res["tools\omega\k307\redirect_out.cjs"]            = "50c294d15267ef118b2a219ac8402ee6"
  $res["tools\omega\k307\fixpoint_k307.json"]          = "278b1acc5c6d5edf5673d7ebb1762659"
  $res["tools\omega\k307\fixpoint_classified.json"]    = "c15e957406193a79acb79ce84a3ad0cc"
  $res["tools\omega\k307\review_batch_k307.csv"]       = "094e083ef427e7a77593689b7dccf12b"
  $res["CLAUDE.md"]                                    = "7046efc0cdc5686aa942f9d9f0033691"
  foreach ($p in $res.Keys) { $m = Md5 $p ; if ($m -ne $res[$p]) { Write-Host "FAIL result $p"; Write-Host "     got  $m"; Write-Host "     want $($res[$p])"; return } }
  Write-Host "OK  19 result files byte-exact"

  # ---- shape asserts on the post-mutation tree ----
  $a = @(Select-String -Path "src\successor\index.html" -Pattern '<dd>189 entries &mdash; 185 authored, 4 inherited crisis</dd>' -SimpleMatch).Count
  $b = @(Select-String -Path "src\successor\index.html" -Pattern '<dd>166 entries</dd>' -SimpleMatch).Count
  $c = @(Select-String -Path "src\successor\index.html" -Pattern 'agent-settings.css?v=K307' -SimpleMatch).Count
  $d = @(Select-String -Path "src\components\agent-settings.css" -Pattern '.successor-counts dd' -SimpleMatch | Where-Object { $_.Line -match 'nowrap' }).Count
  if ($a -ne 1 -or $b -ne 1 -or $c -ne 1) { Write-Host "FAIL page shape: grey=$a yurei=$b css-v=$c want 1/1/1"; return }
  if ($d -ne 0) { Write-Host "FAIL .successor-counts dd still carries nowrap ($d)"; return }
  Write-Host "OK  page shape 4/4"

  # ---- residual OLD strings, SCOPED TO src (repo-wide hits CLAUDE.md prose -- cclxxii) ----
  $r1 = @(Get-ChildItem src -Recurse -Include *.html | Select-String -Pattern '184 entries' -SimpleMatch).Count
  $r2 = @(Get-ChildItem src -Recurse -Include *.html | Select-String -Pattern '165 entries' -SimpleMatch).Count
  $r3 = @(Get-ChildItem src -Recurse -Include *.html | Select-String -Pattern 'agent-settings.css?v=K231' -SimpleMatch).Count
  if ($r1 -ne 0 -or $r2 -ne 0 -or $r3 -ne 0) { Write-Host "FAIL residual in src: 184=$r1 165=$r2 cssK231=$r3"; return }
  Write-Host "OK  no stale anatomy or ?v left in src"

  # ---- the two new fences, run against the SHIPPED tree ----
  $n = node -e "const d=require('./src/components/omega-corpus-mrgrey.json').yurei_corpus.entries;let f=0;for(const e of d)f+=(e.patterns||[]).length;console.log(d.length+'/'+f)"
  if ($n.Trim() -ne "189/1108") { Write-Host "FAIL corpus anatomy $($n.Trim()) want 189/1108"; return }
  Write-Host "OK  corpus parses 189 entries / 1108 forms"
  node tools\omega\anatomy-fence.cjs
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL anatomy fence"; return }
  node tools\omega\rejection-fence.cjs
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL rejection fence"; return }
  Write-Host "OK  both new fences GREEN on the shipped tree"

  git status --short
  git add "src/components/omega-corpus-mrgrey.json"
  git add "src/components/agent-settings.css"
  git add "src/successor/index.html"
  git add "tools/omega/coverage_audit.cjs"
  git add "tools/omega/successor-stage-e2e.cjs"
  git add "tools/omega/anatomy-fence.cjs"
  git add "tools/omega/rejection-fence.cjs"
  git add "tools/omega/rejected_forms.json"
  git add "tools/omega/coverage-audit-K307.json"
  git add "tools/omega/coverage-audit-K307.md"
  git add "tools/omega/k307/tx21_k307.json"
  git add "tools/omega/k307/apply_k307.py"
  git add "tools/omega/k307/probe_k307.cjs"
  git add "tools/omega/k307/fixpoint_k307.py"
  git add "tools/omega/k307/redirect_out.cjs"
  git add "tools/omega/k307/fixpoint_k307.json"
  git add "tools/omega/k307/fixpoint_classified.json"
  git add "tools/omega/k307/review_batch_k307.csv"
  git add "CLAUDE.md"
  $staged = @(git diff --cached --name-only).Count
  if ($staged -ne 19) { Write-Host "FAIL staged $staged want 19"; git diff --cached --name-only; return }
  Write-Host "OK  staged 19"

  git commit -m "K307 TX21 executed: two harm pulls + sounded-like-eugenics fold; the inflection sweep CONVERGES in 4 passes (36-9-2-0) but 12 of its 43 forms were already refused - all three grief pulls and seven seat DROPs - so the guard is a rejection ledger on the corpus, not a filter on the generator; /successor/ anatomy corrected after 36 sessions stale + fenced; NO PIN"
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL commit"; return }
  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL push"; return }
  Write-Host "OK  pushed"

  Start-Sleep -Seconds 75

  $t = Join-Path $env:TEMP "k307v"
  curl.exe -s -o $t "https://wuld.ink/components/omega-corpus-mrgrey.json?v=K306"
  $m = Md5 $t ; if ($m -ne "6e77fa16608b56c5eab3ed8a726875be") { Write-Host "WARN served corpus?v=K306 = $m (5-min TTL, re-run)" } else { Write-Host "OK  served corpus?v=K306 byte-exact (189/1108)" }
  curl.exe -s -o $t "https://wuld.ink/components/agent-settings.css?v=K307"
  $m = Md5 $t ; if ($m -ne "ef40db53e50f884b744615867d051eb6") { Write-Host "WARN served agent-settings.css?v=K307 = $m (edge cold, re-run)" } else { Write-Host "OK  served agent-settings.css?v=K307 byte-exact" }
  curl.exe -s -o $t "https://wuld.ink/successor/"
  $h1 = @(Select-String -Path $t -Pattern '189 entries' -SimpleMatch).Count
  $h2 = @(Select-String -Path $t -Pattern '166 entries' -SimpleMatch).Count
  $h3 = @(Select-String -Path $t -Pattern '184 entries' -SimpleMatch).Count
  Write-Host "    /successor/ content-grep: 189=$h1  166=$h2  stale-184=$h3   (want 1 1 0)"
  curl.exe -s -o $t "https://library.wuld.ink/combined"
  $m = Md5 $t ; if ($m -ne "e654eabd32fa95e5969d49e6eb15aa87") { Write-Host "WARN flagship $m -- expected e654eabd32fa95e5969d49e6eb15aa87" } else { Write-Host "OK  flagship HELD e654eabd (pin v4.0.0)" }
  Write-Host "K307 done."
}
