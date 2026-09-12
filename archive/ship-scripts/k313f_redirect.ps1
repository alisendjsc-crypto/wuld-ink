# =====================================================================================
#  wuld-ink: ONE commit + gated push. Adds a permanent redirect
#     /library-apparatus/  ->  /argument-library/apparatus/
#  because the showcase film's PUBLIC YouTube description links the first path, which
#  404s (fetched 2026-09-12 01:40 UTC). The wrong path was this seat's, inherited by the
#  video seat. Edit the description too; the redirect covers every copy already made.
#  Gated on HEAD = 06a0b6c (WI-K313e) and on src\_redirects being the file that was read
#  (550 bytes / 65b4c0c1...). Append is bytes; result must be 925 bytes / 01dc8972...
#  One-liner:  Get-Content 'C:\Users\y_m_a\Downloads\Argument Library\WI-K313f_redirect.ps1' -Raw | Invoke-Expression
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library'
  $rel  = 'src/_redirects'
  $rf   = Join-Path $repo 'src\_redirects'
  $tail = Join-Path $drop '_redirects_K313f_tail.txt'
  Set-Location $repo

  function Get-Md5 { param($p) (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }

  # --- 0. HEAD is WI-K313e and the redirects file is untouched ------------------------
  $head = (git rev-parse HEAD).Trim()
  Write-Host "HEAD                : $head"
  if (-not $head.StartsWith('06a0b6c')) { Write-Host 'ABORT: HEAD is not 06a0b6c (WI-K313e). Tell me what it is.' -ForegroundColor Red; return }
  if (git status --porcelain -- $rel) { Write-Host 'ABORT: src/_redirects already modified.' -ForegroundColor Red; return }
  if (-not (Test-Path -LiteralPath $tail)) { Write-Host "ABORT: $tail missing." -ForegroundColor Red; return }

  # --- 1. gates on both inputs -------------------------------------------------------
  $h1 = Get-Md5 $rf;   $l1 = (Get-Item -LiteralPath $rf).Length
  $h2 = Get-Md5 $tail; $l2 = (Get-Item -LiteralPath $tail).Length
  Write-Host ("_redirects {0,6} bytes  md5 {1}" -f $l1, $h1)
  Write-Host ("tail       {0,6} bytes  md5 {1}" -f $l2, $h2)
  if ($h1 -ne '65b4c0c13705e30e88bc6b948b621b76' -or $l1 -ne 550) { Write-Host 'ABORT: src/_redirects is not the file that was read.' -ForegroundColor Red; return }
  if ($h2 -ne 'e36a558abea6f0bbd771361a58f96654' -or $l2 -ne 375) { Write-Host 'ABORT: the tail file is not the one that was written.' -ForegroundColor Red; return }

  # --- 2. append as bytes, verify against the prediction -----------------------------
  $b  = [IO.File]::ReadAllBytes($tail)
  $fs = [IO.File]::Open($rf, 'Append', 'Write')
  $fs.Write($b, 0, $b.Length); $fs.Close()
  $l3 = (Get-Item -LiteralPath $rf).Length; $h3 = Get-Md5 $rf
  Write-Host ("result     {0,6} bytes  md5 {1}" -f $l3, $h3)
  if ($l3 -ne 925 -or $h3 -ne '01dc8972c0cab5da8098a09872d3c93d') {
    Write-Host 'ABORT: append did not produce the predicted file. NOT COMMITTED. Run: git checkout -- src/_redirects' -ForegroundColor Red; return }

  # --- 3. explicit stage, one path, commit -------------------------------------------
  git add -- $rel
  $staged = @(git diff --cached --name-only)
  Write-Host "staged              : $($staged -join ', ')"
  if ($staged.Count -ne 1 -or $staged[0] -ne $rel) { Write-Host 'ABORT: staging is not exactly src/_redirects.' -ForegroundColor Red; git reset -q; return }
  git commit -m 'redirect: /library-apparatus/ -> /argument-library/apparatus/ (301), the path the film description carries; NO PIN' | Out-Null
  git log -1 --pretty='%h %s'

  # --- 4. push, gated ----------------------------------------------------------------
  $ErrorActionPreference = 'Continue'
  git fetch --quiet origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'NOT PUSHED: fetch failed. The commit is local and safe; re-run P5_push.ps1 later (it will skip: HEAD subject is not WI-). Tell me.' -ForegroundColor Red; return }
  $behind = @(git log --oneline HEAD..origin/main)
  if ($behind.Count) { Write-Host 'NOT PUSHED: origin/main is ahead. Do not force. Tell me.' -ForegroundColor Red; $behind | ForEach-Object { Write-Host ('   ' + $_) }; return }
  $ahead = @(git log --oneline origin/main..HEAD)
  if ($ahead.Count -ne 1) { Write-Host 'ABORT: expected exactly one commit above origin/main. Not pushed.' -ForegroundColor Red; $ahead | ForEach-Object { Write-Host ('   ' + $_) }; return }
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'PUSH FAILED - nothing changed on origin; the commit is still local.' -ForegroundColor Red; return }
  Write-Host ('pushed. origin/main is now ' + (git rev-parse --short origin/main)) -ForegroundColor Green

  # --- 5. read it back off the live site after Cloudflare builds ----------------------
  Write-Host 'waiting 90 s for Cloudflare Pages, then checking the redirect on the live site...'
  Start-Sleep -Seconds 90
  $code = (curl.exe -s -o NUL -w '%{http_code} -> %{redirect_url}' 'https://wuld.ink/library-apparatus/')
  Write-Host ("    GET /library-apparatus/   : " + $code + "   (want 301 -> https://wuld.ink/argument-library/apparatus/)")
  $t = Join-Path $env:TEMP 'apredir.html'
  curl.exe -sL -o $t 'https://wuld.ink/library-apparatus/'
  $ok = @(Select-String -Path $t -Pattern 'The Argument Library' -SimpleMatch).Count
  Write-Host ("    followed to a page with the title: " + $ok + "   (want >= 1)")
  if ($code -notlike '301*' -or $ok -lt 1) { Write-Host 'Cloudflare may still be building - re-check in two minutes with: curl.exe -sI https://wuld.ink/library-apparatus/' -ForegroundColor Yellow }
  else { Write-Host 'Redirect live. Now edit the YouTube description to https://wuld.ink/argument-library/apparatus/ so new readers never touch the redirect.' -ForegroundColor Green }
}
