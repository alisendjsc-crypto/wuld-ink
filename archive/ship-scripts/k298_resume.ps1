& {
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "FAIL no .git at $repo"; return }
  Set-Location $repo; [Environment]::CurrentDirectory = $repo
  Get-ChildItem '.git\index.lock*' -EA SilentlyContinue | Remove-Item -Force -EA SilentlyContinue
  Get-ChildItem '.git\objects' -Recurse -Filter 'tmp_obj_*' -EA SilentlyContinue | Remove-Item -Force -EA SilentlyContinue
  function Md5($p){ if(-not(Test-Path $p)){return 'MISSING'}; (Get-FileHash $p -Algorithm MD5).Hash.ToLower() }

  # RESUME, not re-run: run 1 already did both Move-Items and the sweep, then aborted at a
  # self-defeating gate. Sidecars are gone and the tree has moved past base, so every guard
  # below is a RESULT guard.
  $head = (git rev-parse HEAD 2>$null)
  if ([string]::IsNullOrWhiteSpace($head)) { Write-Host "FAIL no HEAD"; return }
  $head = $head.Trim()
  git fetch origin main --quiet
  $orig = (git rev-parse origin/main).Trim()
  if ($head -ne 'f9ec361d471a79459604f5a7e034293024a6e79f') { Write-Host "FAIL HEAD $head != f9ec361 - K298 may already be in; STOP and report"; return }
  if ($head -ne $orig) { Write-Host "FAIL HEAD != origin/main $orig"; return }
  Write-Host "OK   HEAD == origin == f9ec361 (nothing landed yet)"

  # sidecars must be CONSUMED, not present
  if (Test-Path 'src\donations\index.k298.html') { Write-Host "FAIL donations sidecar still present - run 1 did not move it; use ship-K298.ps1 instead"; return }
  if (Test-Path 'CLAUDE.md.k298')                { Write-Host "FAIL CLAUDE.md sidecar still present - use ship-K298.ps1 instead"; return }
  Write-Host "OK   both sidecars consumed by run 1"

  # result guards - the tree must already be at the K298 bytes
  if ((Md5 'src\donations\index.html')    -ne '815e9854460220596a19f4b82f7e4a02') { Write-Host "FAIL donations not at K298"; return }
  if ((Md5 'src\components\gallery.css')  -ne '0330357811705cdd8f7deb020070feab') { Write-Host "FAIL gallery.css not at K298"; return }
  if ((Md5 'src\components\glossary.css') -ne '438b25931fa1258b02c36be2b30c503f') { Write-Host "FAIL glossary.css not at K298"; return }
  if ((Md5 'CLAUDE.md')                   -ne '50992a92c01404465a8161f65e03653e') { Write-Host "FAIL CLAUDE.md not at K298"; return }
  Write-Host "OK   4 result guards"

  # the sweep must have run EXACTLY once
  $bg = @(Select-String -Path 'src\components\gallery.css'  -SimpleMatch 'K298').Count
  $bs = @(Select-String -Path 'src\components\glossary.css' -SimpleMatch 'K298').Count
  if ($bg -lt 1) { Write-Host "FAIL gallery.css missing the K298 block"; return }
  if ($bs -lt 1) { Write-Host "FAIL glossary.css missing the K298 block"; return }
  Write-Host "OK   both component blocks present"

  # THE FIXED GATE. Scoped to src, where the string is load-bearing. Repo-wide is wrong:
  # CLAUDE.md documents the sweep, so it contains BOTH versions as prose, forever.
  $oldGal = @(git grep -o --fixed-strings 'gallery.css?v=K275' -- src).Count
  $oldGlo = @(git grep -o --fixed-strings 'glossary.css?v=K30' -- src).Count
  $newGal = @(git grep -o --fixed-strings 'gallery.css?v=K298' -- src).Count
  $newGlo = @(git grep -o --fixed-strings 'glossary.css?v=K298' -- src).Count
  if ($oldGal -ne 0)  { Write-Host "FAIL residual old gallery in src = $oldGal";  return }
  if ($oldGlo -ne 0)  { Write-Host "FAIL residual old glossary in src = $oldGlo"; return }
  if ($newGal -ne 10) { Write-Host "FAIL gallery.css?v=K298 = $newGal, expected 10";  return }
  if ($newGlo -ne 25) { Write-Host "FAIL glossary.css?v=K298 = $newGlo, expected 25"; return }
  Write-Host "OK   ?v arithmetic in src: old 0/0, new 10/25"

  if ((Md5 'tools\sweep\sweep_k298_typescale.py') -ne '06b0ada65d5da54b22b09c4e7506bed8') { Write-Host "FAIL sweep script"; return }
  if ((Md5 'tools\gate\type_scale_audit.cjs')     -ne '113fd054e2d1aa345ca0113ef37cdd2b') { Write-Host "FAIL type_scale_audit"; return }
  if ((Md5 'tools\gate\type-scale-K298.json')     -ne '82cfa4486d0eb1b10afc7692534a4db2') { Write-Host "FAIL type-scale json"; return }
  if ((Md5 'tools\gate\type-scale-K298.md')       -ne '53a032cbbfc8c10021af1230443ff7f1') { Write-Host "FAIL type-scale md"; return }
  if ((Md5 'tools\gate\reach-audit-K298.json')    -ne 'decf7f23d1553572bb0ee7d5819b6770') { Write-Host "FAIL reach json"; return }
  if ((Md5 'tools\gate\reach-audit-K298.md')      -ne '5a1f97396cb64bb25daab042f1e3b982') { Write-Host "FAIL reach md"; return }
  Write-Host "OK   6 tool artifact gates"

  git add src tools CLAUDE.md
  $staged = @(git diff --cached --name-only).Count
  if ($staged -ne 43) { Write-Host "FAIL staged $staged, expected 43"; git diff --cached --name-only; return }
  Write-Host "OK   staged 43"

  git commit -q -m "K298 donations phone rhythm + site-wide type-scale escape fix (glossary + gallery components, ?v=K298); census + reach artifacts; NO PIN"
  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL push exited $LASTEXITCODE"; return }
  Write-Host "OK   pushed $(git rev-parse --short HEAD)"

  Start-Sleep -Seconds 75
  $t = Join-Path $env:TEMP 'k298.chk'
  curl.exe -s -o $t 'https://wuld.ink/components/glossary.css?v=K298'
  if ((Md5 $t) -ne '438b25931fa1258b02c36be2b30c503f') { Write-Host "WARN served glossary.css != expected (edge cold, re-check in 2 min)" } else { Write-Host "OK   served glossary.css?v=K298" }
  curl.exe -s -o $t 'https://wuld.ink/components/gallery.css?v=K298'
  if ((Md5 $t) -ne '0330357811705cdd8f7deb020070feab') { Write-Host "WARN served gallery.css != expected (edge cold, re-check in 2 min)" } else { Write-Host "OK   served gallery.css?v=K298" }
  curl.exe -s -o $t 'https://wuld.ink/donations/'
  if (@(Select-String -Path $t -SimpleMatch 'phone rhythm + type scale').Count -lt 1) { Write-Host "FAIL served /donations/ lacks the K298 block" } else { Write-Host "OK   served /donations/ carries the K298 block" }
  curl.exe -s -o $t 'https://wuld.ink/glossary/nothingist/'
  if (@(Select-String -Path $t -SimpleMatch 'glossary.css?v=K298').Count -lt 1) { Write-Host "FAIL served glossary page not on ?v=K298" } else { Write-Host "OK   served glossary page on ?v=K298" }
  curl.exe -s -o $t 'https://library.wuld.ink/combined'
  if ((Md5 $t) -ne 'e654eabd32fa95e5969d49e6eb15aa87') { Write-Host "FAIL flagship moved" } else { Write-Host "OK   flagship held e654eabd (pin v4.0.0)" }
  Remove-Item $t -EA SilentlyContinue
}
