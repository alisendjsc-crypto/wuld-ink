# Illogically Is — reduced-flash edition: link it from the three pages that carry the
# photosensitivity warning. NO PIN. wuld-ink only. No search-index regen (regenerates
# byte-identical — the warning notes are not harvested).
& {
  $repo = "C:\Users\y_m_a\Projects\wuld-ink"
  $k    = "C:\Users\y_m_a\Downloads\rf3_site"
  if (-not (Test-Path (Join-Path $repo ".git"))) { Write-Host "FAIL no .git at $repo"; return }
  Set-Location $repo
  [Environment]::CurrentDirectory = (Get-Location).Path
  Remove-Item ".git\index.lock*" -Force -ErrorAction SilentlyContinue

  function Md5($p) { if (-not (Test-Path $p)) { return "MISSING" } ; return (Get-FileHash $p -Algorithm MD5).Hash.ToLower() }

  $head = git rev-parse HEAD 2>$null
  if ($null -eq $head) { Write-Host "FAIL rev-parse returned nothing"; return }
  git fetch origin main 2>&1 | Out-Null
  if ($head.Trim() -ne (git rev-parse origin/main).Trim()) { Write-Host "FAIL HEAD != origin"; return }
  Write-Host "OK  HEAD == origin == $($head.Trim())"

  $bases = @{}
  $bases["src\essays\alogically-is\index.html"] = "889f328b8eb8e5c6ef95e7fd00480d1a"
  $bases["src\illogically-is\index.html"]       = "0fee37430a59f84f65068c1b07c04362"
  $bases["src\watch\index.html"]                = "12018847fab1526059c088905f6970f2"
  foreach ($p in $bases.Keys) { $m = Md5 $p ; if ($m -ne $bases[$p]) { Write-Host "FAIL base $p"; Write-Host "     got  $m"; Write-Host "     want $($bases[$p])"; return } }
  Write-Host "OK  3 base files match HEAD"

  $side = @{}
  $side["$k\files\essays-alogically-is.index.html"] = "3d5e0db23f25c17a5bb2edca9be287fe"
  $side["$k\files\illogically-is.index.html"]       = "c1e7230d48832e3c2fbdc49188c8698f"
  $side["$k\files\watch.index.html"]                = "5e0bf8aabcae9f32f2a3f47ed625368c"
  foreach ($p in $side.Keys) { $m = Md5 $p ; if ($m -ne $side[$p]) { Write-Host "FAIL sidecar $p"; Write-Host "     got  $m"; Write-Host "     want $($side[$p])"; return } }
  Write-Host "OK  3 sidecars byte-exact"

  Move-Item "$k\files\essays-alogically-is.index.html" "src\essays\alogically-is\index.html" -Force
  Move-Item "$k\files\illogically-is.index.html"       "src\illogically-is\index.html" -Force
  Move-Item "$k\files\watch.index.html"                "src\watch\index.html" -Force

  if ((Md5 "src\essays\alogically-is\index.html") -ne "3d5e0db23f25c17a5bb2edca9be287fe") { Write-Host "FAIL result essays"; return }
  if ((Md5 "src\illogically-is\index.html")       -ne "c1e7230d48832e3c2fbdc49188c8698f") { Write-Host "FAIL result film page"; return }
  if ((Md5 "src\watch\index.html")                -ne "5e0bf8aabcae9f32f2a3f47ed625368c") { Write-Host "FAIL result watch"; return }
  Write-Host "OK  3 result files byte-exact"

  # ---- shape: the link is on all three, the stale promise is gone, the guard is in ----
  $n1 = @(Get-ChildItem src -Recurse -Include *.html | Select-String -Pattern "A-S3MF5rCtg" -SimpleMatch).Count
  $n2 = @(Get-ChildItem src -Recurse -Include *.html | Select-String -Pattern "reduced-flash edition will follow" -SimpleMatch).Count
  $n3 = @(Select-String -Path "src\watch\index.html" -Pattern "e.target.closest('a')) card = null" -SimpleMatch).Count
  $n4 = @(Get-ChildItem src -Recurse -Include *.html | Select-String -Pattern "held under three" -SimpleMatch).Count
  if ($n1 -ne 3) { Write-Host "FAIL reduced-flash link on $n1 pages, want 3"; return }
  if ($n2 -ne 0) { Write-Host "FAIL stale promise still present ($n2)"; return }
  if ($n3 -ne 1) { Write-Host "FAIL watch anchor guard missing"; return }
  if ($n4 -ne 0) { Write-Host "FAIL an 'under three' safety claim is present ($n4) - the QC says 4/s at 0:21:09"; return }
  Write-Host "OK  link on 3 pages, promise gone, card guard in, no overclaim"

  git add "src/essays/alogically-is/index.html" "src/illogically-is/index.html" "src/watch/index.html"
  $staged = @(git diff --cached --name-only).Count
  if ($staged -ne 3) { Write-Host "FAIL staged $staged want 3"; git diff --cached --name-only; return }
  Write-Host "OK  staged 3"

  git commit -m "reduced-flash edition linked from the three pages carrying the photosensitivity warning (essays, film, watch); copy follows the published description - governed down and measured, not removed - rather than the handoff draft's 'under three per second', which the QC contradicts; /watch/ card handler no longer swallows links, which would have played the strobing edition; NO PIN"
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL commit"; return }
  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL push"; return }
  Write-Host "OK  pushed"

  Start-Sleep -Seconds 75
  $t = Join-Path $env:TEMP "rf3v"
  foreach ($u in @("https://wuld.ink/essays/alogically-is/","https://wuld.ink/illogically-is/","https://wuld.ink/watch/")) {
    curl.exe -s -o $t $u
    $a = @(Select-String -Path $t -Pattern "A-S3MF5rCtg" -SimpleMatch).Count
    $b = @(Select-String -Path $t -Pattern "will follow as a separate" -SimpleMatch).Count
    Write-Host ("    {0,-42} link={1} stale={2}  (want 1 0)" -f $u, $a, $b)
  }
  Write-Host "rf3 links done."
}
