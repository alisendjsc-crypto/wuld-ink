# =====================================================================================
#  Canonical log: TWO commits, then a gated push. wuld-ink only; the library repo is not
#  touched (its push landed at 23fbbed and was read back off its reflog).
#    1. tools/apparatus/SHIP_WHEN_REPIN_LANDS.ps1 v4.1 -- the script that actually produced
#       d60ec13, committed exactly as it ran (md5 6226a355..., 11,999 bytes). HEAD still
#       carries the v10 blob, which cannot parse the v4 marker.
#    2. WI-K313e appended to CLAUDE.md, gated on the log as the ship left it:
#       1,219,391 bytes / f0bc08c0... (read back off the working copy at 01:06 UTC).
#  Then: fetch, refuse if origin is ahead, show what leaves, push.
#  Every gate refuses rather than half-applies. Nothing is force-pushed or rewritten.
#  One-liner:  Get-Content 'C:\Users\y_m_a\Downloads\Argument Library\WI-K313e_commit.ps1' -Raw | Invoke-Expression
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  $md   = Join-Path $repo 'CLAUDE.md'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library'
  $ship = 'tools/apparatus/SHIP_WHEN_REPIN_LANDS.ps1'
  Set-Location $repo

  function Get-Md5 { param($p) (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }

  # --- 0. HEAD is the commit the ship left, and the tree is what was measured ---------
  $head = (git rev-parse HEAD).Trim()
  Write-Host "HEAD                : $head"
  if ($head -ne '552b4dcbd1f6565eff16d2512088a19b8f3d3bea') { Write-Host 'ABORT: HEAD is not 552b4dc (the sitemap commit the ship made). Tell me what it is.' -ForegroundColor Red; return }
  if (git status --porcelain -- CLAUDE.md) { Write-Host 'ABORT: CLAUDE.md already modified.' -ForegroundColor Red; return }
  $other = @(git status --porcelain)
  if ($other.Count) { Write-Host 'working tree (this block stages only the two named paths):'; $other | ForEach-Object { Write-Host ('   ' + $_) } }

  # --- 1. the ship script: the working copy must be the one that ran ------------------
  Write-Host ''
  Write-Host '---- commit 1: the ship script as it ran ----' -ForegroundColor Cyan
  $sp = Join-Path $repo ($ship -replace '/', '\')
  if (-not (Test-Path -LiteralPath $sp)) { Write-Host "ABORT: $ship missing." -ForegroundColor Red; return }
  $hs = Get-Md5 $sp
  $ls = (Get-Item -LiteralPath $sp).Length
  Write-Host ("ship script {0,9} bytes  md5 {1}" -f $ls, $hs)
  if ($hs -ne '6226a355daa9b64276f643870a9b84d1' -or $ls -ne 11999) { Write-Host 'ABORT: the ship script on disk is not v4.1 as it ran. Not staged.' -ForegroundColor Red; return }
  git diff --quiet HEAD -- $ship
  if ($LASTEXITCODE -eq 0) { Write-Host 'ABORT: the ship script already equals HEAD; nothing to commit here, and the stratum says otherwise. Tell me.' -ForegroundColor Red; return }
  git add -- $ship
  $staged = @(git diff --cached --name-only)
  Write-Host "staged              : $($staged -join ', ')"
  if ($staged.Count -ne 1 -or $staged[0] -ne $ship) { Write-Host 'ABORT: staging is not exactly the ship script.' -ForegroundColor Red; git reset -q; return }
  $subj1 = 'apparatus ship script v4.1 as it ran for d60ec13: wuld group optional in the marker, parity gate removed, presence check kept; NO PIN'
  git commit -m $subj1 | Out-Null
  git log -1 --pretty='%h %s'

  # --- 2. prefix identity: the log still starts where it started ---------------------
  Write-Host ''
  Write-Host '---- commit 2: WI-K313e ----' -ForegroundColor Cyan
  $all = [IO.File]::ReadAllBytes($md)
  $pre = New-Object byte[] 4096
  [Array]::Copy($all, 0, $pre, 0, 4096)
  $sha = ([BitConverter]::ToString(
            [System.Security.Cryptography.SHA256]::Create().ComputeHash($pre))).Replace('-','').ToLower()
  Write-Host "prefix(4096) sha256 : $($sha.Substring(0,32))"
  if ($sha.Substring(0,32) -ne '1dc1af43debe92b690f3cf1a33cd6e96') { Write-Host 'ABORT: prefix changed.' -ForegroundColor Red; return }

  $s = @{ file='WI-K313e_stratum.txt'; md5='6d7beb61a473c6b7112ef78bef933606'; bytes=6764
          logBefore='f0bc08c0e04f45dd3dc7d5a0f32f2f71'; lenBefore=1219391
          lenAfter=1226155; md5After='89e1f944628450a593b3eae40f900ec5'
          subject='WI-K313e - everything landed and read back off the remotes; the parity gate reclassified under cccxxiii; two names with one fingerprint in the render manifest' }

  $st = Join-Path $drop $s.file
  if (-not (Test-Path -LiteralPath $st)) { Write-Host "ABORT: $st missing." -ForegroundColor Red; return }

  # gates on BOTH inputs, before a single byte is written
  $h1 = Get-Md5 $md
  $h2 = Get-Md5 $st
  $l1 = (Get-Item -LiteralPath $md).Length
  $l2 = (Get-Item -LiteralPath $st).Length
  Write-Host ("CLAUDE.md  {0,9} bytes  md5 {1}" -f $l1, $h1)
  Write-Host ("stratum    {0,9} bytes  md5 {1}" -f $l2, $h2)
  if ($h1 -ne $s.logBefore -or $l1 -ne $s.lenBefore) { Write-Host 'ABORT: CLAUDE.md is not the file that was measured.' -ForegroundColor Red; return }
  if ($h2 -ne $s.md5       -or $l2 -ne $s.bytes)     { Write-Host 'ABORT: stratum is not the file that was written.'   -ForegroundColor Red; return }

  # append as BYTES. the log is LF throughout; no text pipeline touches it
  $b  = [IO.File]::ReadAllBytes($st)
  $fs = [IO.File]::Open($md, 'Append', 'Write')
  $fs.Write($b, 0, $b.Length); $fs.Close()

  # the result must be the file that was PREDICTED, or nothing commits
  $len = (Get-Item -LiteralPath $md).Length
  $h3  = Get-Md5 $md
  Write-Host ("result     {0,9} bytes  md5 {1}" -f $len, $h3)
  if ($len -ne $s.lenAfter -or $h3 -ne $s.md5After) {
    Write-Host 'ABORT: append did not produce the predicted file. NOT COMMITTED.' -ForegroundColor Red
    Write-Host 'The log now has an unverified tail. Do not commit it; tell me the two numbers above.' -ForegroundColor Red
    Write-Host 'Commit 1 (the ship script) stands and is fine to keep.' -ForegroundColor Yellow
    return }

  git add -- CLAUDE.md
  $staged = @(git diff --cached --name-only)
  Write-Host "staged              : $($staged -join ', ')"
  if ($staged.Count -ne 1 -or $staged[0] -ne 'CLAUDE.md') { Write-Host 'ABORT: staging is not exactly CLAUDE.md.' -ForegroundColor Red; return }
  git commit -m $s.subject | Out-Null
  git log -1 --pretty='%h %s'

  # --- 3. the push, gated the same way P5_push.ps1 is -------------------------------
  # (Continue from here: under Stop, git's progress lines on stderr can read as errors)
  $ErrorActionPreference = 'Continue'
  Write-Host ''
  Write-Host '---- push ----' -ForegroundColor Cyan
  git fetch --quiet origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'NOT PUSHED: fetch failed (network?). Both commits are local and safe; re-run P5_push.ps1 later.' -ForegroundColor Red; return }
  $behind = @(git log --oneline HEAD..origin/main)
  if ($behind.Count) { Write-Host ('NOT PUSHED: origin/main has ' + $behind.Count + ' commit(s) this machine does not. Both commits are local and safe; do not force. Tell me.') -ForegroundColor Red; $behind | ForEach-Object { Write-Host ('   ' + $_) }; return }
  $ahead = @(git log --oneline origin/main..HEAD)
  Write-Host ('pushing ' + $ahead.Count + ' commit(s):') -ForegroundColor Green
  $ahead | ForEach-Object { Write-Host ('   ' + $_) }
  if ($ahead.Count -ne 2) { Write-Host 'ABORT: expected exactly the two commits above origin/main. Not pushed; tell me what is listed.' -ForegroundColor Red; return }
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'PUSH FAILED - nothing changed on origin; both commits are still local.' -ForegroundColor Red; return }
  Write-Host ('pushed. origin/main is now ' + (git rev-parse --short origin/main)) -ForegroundColor Green
  Write-Host 'WI-K313e landed. Nothing in wuld.ink/src changed, so the site is unaffected by this push.' -ForegroundColor Yellow
}
