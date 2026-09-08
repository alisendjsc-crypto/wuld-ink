& {
  $repo = "C:\Users\y_m_a\Projects\wuld-ink"
  $src  = "C:\Users\y_m_a\Downloads\k256"
  Set-Location $repo
  Get-ChildItem -LiteralPath (Join-Path $repo ".git") -Filter "*.lock" -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  function Md5($p){ (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower().Substring(0,8) }
  git fetch --quiet origin
  $lh = (git rev-parse HEAD); $rh = ((git ls-remote origin HEAD) -split "\s+")[0]
  if ($lh -ne $rh) { Write-Host "FAIL: local HEAD $lh != origin $rh"; return }
  if ($lh -notlike "7b0a284*") { Write-Host "FAIL: HEAD $lh is not the K255 commit 7b0a284"; return }
  $cB = Md5 "$repo\src\components\omega-corpus-mrgrey.json"; if ($cB -ne "3d7117dd") { Write-Host "FAIL: corpus base $cB != 3d7117dd"; return }
  $pB = Md5 "$repo\src\successor\index.html"; if ($pB -ne "6548c20f") { Write-Host "FAIL: page base $pB != 6548c20f"; return }
  $mB = Md5 "$repo\CLAUDE.md"; if ($mB -ne "3ded35ce") { Write-Host "FAIL: CLAUDE.md base $mB != 3ded35ce"; return }
  Move-Item -Force "$src\omega-corpus-mrgrey.json" "$repo\src\components\omega-corpus-mrgrey.json"
  Move-Item -Force "$src\successor-index.html" "$repo\src\successor\index.html"
  Move-Item -Force "$src\CLAUDE.md" "$repo\CLAUDE.md"
  $cR = Md5 "$repo\src\components\omega-corpus-mrgrey.json"; if ($cR -ne "72c4cdc8") { Write-Host "FAIL: corpus result $cR != 72c4cdc8"; return }
  $pR = Md5 "$repo\src\successor\index.html"; if ($pR -ne "10e8e962") { Write-Host "FAIL: page result $pR != 10e8e962"; return }
  $mR = Md5 "$repo\CLAUDE.md"; if ($mR -ne "10ffeb79") { Write-Host "FAIL: CLAUDE.md result $mR != 10ffeb79"; return }
  git add "src/components/omega-corpus-mrgrey.json" "src/successor/index.html" "CLAUDE.md"
  $n = ((git diff --cached --name-only) | Measure-Object).Count
  if ($n -ne 3) { Write-Host "FAIL: staged $n != 3"; git diff --cached --name-only; return }
  git commit -m "K256: T1 tier COMPLETE - +5 objections x2 (privileged-first-world, bitter-childhood, animals-reproduce, happiness-is-choice, why-not-suicide) = 10 provenance-stamped R2 positions (26 total, 13/13 objections); page-truth completion (curio 104/101, Status first-two-sets, K255-missed body x2 truth-fixed); wgate held; NO PIN"
  git push
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL: push exit $LASTEXITCODE"; return }
  $t1="$env:TEMP\k256corpus.json"; curl.exe -s -o $t1 "https://wuld.ink/components/omega-corpus-mrgrey.json?vk256=1"; $cL = Md5 $t1
  $t2="$env:TEMP\k256page.html"; curl.exe -s -o $t2 "https://wuld.ink/successor/?vk256=1"; $pC = (Select-String -LiteralPath $t2 -Pattern "104 entries" -Quiet)
  $t3="$env:TEMP\k256flag.html"; curl.exe -s -o $t3 "https://library.wuld.ink/combined"; $fL = Md5 $t3
  Write-Host "PUSHED $(git rev-parse --short HEAD)"
  Write-Host "LIVE (may lag ~1-2 min while Pages redeploys; re-run these 3 curl lines if stale):"
  Write-Host "  corpus served = $cL  (want 72c4cdc8)"
  Write-Host "  page 104-entries = $pC  (want True)"
  Write-Host "  flagship = $fL  (want e654eabd, PIN held)"
}
