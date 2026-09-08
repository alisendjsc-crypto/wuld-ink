& {
  $R = 'C:\Users\y_m_a\Projects\wuld-ink'
  $S = 'C:\Users\y_m_a\Downloads\k258'
  Set-Location $R
  function Md5($p){ (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }
  Remove-Item "$R\.git\*.lock" -Force -ErrorAction SilentlyContinue

  $head = (git rev-parse HEAD)
  if ($head -notlike '36f259f*') { Write-Host "ABORT HEAD $head != 36f259f"; return } else { Write-Host "OK HEAD $head" }

  if ((Md5 "$R\src\components\omega-corpus-mrgrey.json") -ne 'b4bfd3ad314123ad144a075275c42779') { Write-Host 'ABORT base corpus drift'; return } else { Write-Host 'OK base corpus' }
  if ((Md5 "$R\src\successor\index.html") -ne '273e2bed81e8d555f21d3788ead08ca4') { Write-Host 'ABORT base page drift'; return } else { Write-Host 'OK base page' }
  if ((Md5 "$R\CLAUDE.md") -ne '1b134463f35918f5c03eb6af792ff727') { Write-Host 'ABORT base CLAUDE drift'; return } else { Write-Host 'OK base CLAUDE' }

  Move-Item -Force "$S\omega-corpus-mrgrey.k258.json" "$R\src\components\omega-corpus-mrgrey.json"
  Move-Item -Force "$S\successor-index.k258.html" "$R\src\successor\index.html"
  Move-Item -Force "$S\CLAUDE.k258.md" "$R\CLAUDE.md"

  if ((Md5 "$R\src\components\omega-corpus-mrgrey.json") -ne '1cb30f044c991b6538d52cbd210f21eb') { Write-Host 'ABORT result corpus'; return } else { Write-Host 'OK result corpus 1cb30f04' }
  if ((Md5 "$R\src\successor\index.html") -ne '515e80f76d691a4973a2a342ad74c8c7') { Write-Host 'ABORT result page'; return } else { Write-Host 'OK result page 515e80f7' }
  if ((Md5 "$R\CLAUDE.md") -ne '8a5dfed08238192acefeaa870876a87c') { Write-Host 'ABORT result CLAUDE'; return } else { Write-Host 'OK result CLAUDE 8a5dfed0' }

  git add -- "src/components/omega-corpus-mrgrey.json" "src/successor/index.html" "CLAUDE.md"
  $staged = @(git diff --cached --name-only)
  if ($staged.Count -ne 3) { Write-Host "ABORT staged $($staged.Count) != 3"; $staged | ForEach-Object { Write-Host "  $_" }; return } else { Write-Host "OK staged 3"; $staged | ForEach-Object { Write-Host "  $_" } }

  git config http.postBuffer 524288000
  git commit -m "K258 T2 folk-philosophical batch-2: 6 objections x2 = 12 R2 positions (b4bfd3ad->1cb30f04); successor curio 128/125; gate-2 register verdict GREEN (all 12 K257 clear, zero corrections). NO PIN, efilist read-only."
  git push
  if ($LASTEXITCODE -ne 0) { Write-Host "ABORT push exit $LASTEXITCODE"; return } else { Write-Host 'OK push' }

  $tc = "$env:TEMP\k258c.json"
  curl.exe -s "https://wuld.ink/components/omega-corpus-mrgrey.json?vk258=1" -o $tc
  $sc = Md5 $tc
  if ($sc -eq '1cb30f044c991b6538d52cbd210f21eb') { Write-Host 'DEPLOYED served corpus 1cb30f04' } elseif ($sc -eq 'b4bfd3ad314123ad144a075275c42779') { Write-Host 'TAIL served corpus still b4bfd3ad (Pages build in flight; re-check cold in a few min)' } else { Write-Host "served corpus UNEXPECTED $sc" }
  $tp = "$env:TEMP\k258p.html"
  curl.exe -s "https://wuld.ink/successor/?vk258=1" -o $tp
  $pc = @(Select-String -Path $tp -Pattern '128 entries' -SimpleMatch).Count
  $vk = @(Select-String -Path $tp -Pattern '?v=K255' -SimpleMatch).Count
  Write-Host "served page content: '128 entries' x$pc ; '?v=K255' x$vk  (CF beacon => HTML by content, not md5)"
  $fh = (curl.exe -s -o NUL -w "%{http_code}" "https://library.wuld.ink/combined")
  Write-Host "flagship http $fh (pin unmoved, untouched)"
  Remove-Item $tc,$tp -Force -ErrorAction SilentlyContinue
}
