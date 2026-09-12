# =====================================================================================
#  wuld-ink: ONE commit + gated push. Replaces tools/apparatus/SHIP_WHEN_REPIN_LANDS.ps1
#  v4.1 (the blob that shipped d60ec13, md5 6226a355...) with v4.2 from the drop
#  (md5 fb2e7b99..., 14,714 bytes). v4.2 can re-ship a reissued document: v4.1 assumed
#  every file was new ("staged 2 want 5", "sitemap want +1") and its read-back grepped a
#  v10 phrase. v4.2 stages by set, accepts a 0 or +1 sitemap delta, and compares the
#  served page's md5 to the committed page's. Run this BEFORE the ship one-liner, so the
#  script that ships is in history before the commits it makes.
#  One-liner:  Get-Content 'C:\Users\y_m_a\Downloads\Argument Library\WI-K313g_shipscript.ps1' -Raw | Invoke-Expression
#  Then ship:  Get-Content 'C:\Users\y_m_a\Projects\wuld-ink\tools\apparatus\SHIP_WHEN_REPIN_LANDS.ps1' -Raw | Invoke-Expression
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library'
  $rel  = 'tools/apparatus/SHIP_WHEN_REPIN_LANDS.ps1'
  $dst  = Join-Path $repo 'tools\apparatus\SHIP_WHEN_REPIN_LANDS.ps1'
  $src  = Join-Path $drop 'SHIP_WHEN_REPIN_LANDS_v4_2.ps1'
  Set-Location $repo

  function Get-Md5 { param($p) (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }

  # --- 0. HEAD is the redirect commit, and the script in the repo is v4.1 as committed ---
  $head = (git rev-parse HEAD).Trim()
  Write-Host "HEAD                : $head"
  if (-not $head.StartsWith('bdac2cf')) { Write-Host 'ABORT: HEAD is not bdac2cf (the redirect). Tell me what it is.' -ForegroundColor Red; return }
  if (git status --porcelain -- $rel) { Write-Host 'ABORT: the ship script in the repo is already modified.' -ForegroundColor Red; return }
  if (-not (Test-Path -LiteralPath $src)) { Write-Host "ABORT: $src missing." -ForegroundColor Red; return }
  $h0 = Get-Md5 $dst; $l0 = (Get-Item -LiteralPath $dst).Length
  $h1 = Get-Md5 $src; $l1 = (Get-Item -LiteralPath $src).Length
  Write-Host ("repo v4.1  {0,6} bytes  md5 {1}" -f $l0, $h0)
  Write-Host ("drop v4.2  {0,6} bytes  md5 {1}" -f $l1, $h1)
  if ($h0 -ne '6226a355daa9b64276f643870a9b84d1' -or $l0 -ne 11999) { Write-Host 'ABORT: the repo script is not v4.1 as committed at eb950e9.' -ForegroundColor Red; return }
  if ($h1 -ne 'fb2e7b99cffd599e359d3f130b8de033' -or $l1 -ne 14714) { Write-Host 'ABORT: the drop file is not v4.2 as written.' -ForegroundColor Red; return }

  # --- 1. replace as bytes, verify, stage exactly one path, commit --------------------
  [IO.File]::WriteAllBytes($dst, [IO.File]::ReadAllBytes($src))
  $h2 = Get-Md5 $dst
  if ($h2 -ne 'fb2e7b99cffd599e359d3f130b8de033') { Write-Host 'ABORT: the copy did not land byte-exact. Run: git checkout -- tools/apparatus/SHIP_WHEN_REPIN_LANDS.ps1' -ForegroundColor Red; return }
  git add -- $rel
  $staged = @(git diff --cached --name-only)
  Write-Host "staged              : $($staged -join ', ')"
  if ($staged.Count -ne 1 -or $staged[0] -ne $rel) { Write-Host 'ABORT: staging is not exactly the ship script.' -ForegroundColor Red; git reset -q; return }
  git commit -m 'apparatus ship script v4.2: re-ships a reissued document (staged set, 0 or +1 sitemap delta), read-back compares served md5 to committed md5; NO PIN' | Out-Null
  git log -1 --pretty='%h %s'

  # --- 2. push, gated ----------------------------------------------------------------
  $ErrorActionPreference = 'Continue'
  git fetch --quiet origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'NOT PUSHED: fetch failed. The commit is local and safe. Tell me.' -ForegroundColor Red; return }
  $behind = @(git log --oneline HEAD..origin/main)
  if ($behind.Count) { Write-Host 'NOT PUSHED: origin/main is ahead. Do not force. Tell me.' -ForegroundColor Red; $behind | ForEach-Object { Write-Host ('   ' + $_) }; return }
  $ahead = @(git log --oneline origin/main..HEAD)
  if ($ahead.Count -ne 1) { Write-Host 'ABORT: expected exactly one commit above origin/main. Not pushed.' -ForegroundColor Red; $ahead | ForEach-Object { Write-Host ('   ' + $_) }; return }
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'PUSH FAILED - nothing changed on origin; the commit is still local.' -ForegroundColor Red; return }
  Write-Host ('pushed. origin/main is now ' + (git rev-parse --short origin/main)) -ForegroundColor Green
  Write-Host 'Ship script v4.2 in history. HEAD == origin/main, so the ship one-liner can run now.' -ForegroundColor Yellow
}
