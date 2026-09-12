# =====================================================================================
#  Canonical log: append WI-K313f (the two apparatus reissues; cccxxxi; the 404 was this
#  seat's), ONE commit, then a gated push. Gated on HEAD = 5b5d1af (the second reissue) and
#  on the log as WI-K313e left it: 1,226,155 bytes / 89e1f944... -- the value the K313e block
#  predicted and the working copy read back at 01:58 UTC. Append is bytes; the result must be
#  1,233,579 bytes / 93956468... or nothing commits.
#  One-liner:  Get-Content 'C:\Users\y_m_a\Downloads\Argument Library\WI-K313f_commit.ps1' -Raw | Invoke-Expression
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  $md   = Join-Path $repo 'CLAUDE.md'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library'
  Set-Location $repo

  function Get-Md5 { param($p) (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }

  # --- 0. HEAD is the second reissue, and CLAUDE.md is untouched -----------------------
  $head = (git rev-parse HEAD).Trim()
  Write-Host "HEAD                : $head"
  if ($head -ne '5b5d1af27c93893f1a8f79f15eecab30a9a7a437') { Write-Host 'ABORT: HEAD is not 5b5d1af (the second apparatus reissue). Tell me what it is.' -ForegroundColor Red; return }
  if (git status --porcelain -- CLAUDE.md) { Write-Host 'ABORT: CLAUDE.md already modified.' -ForegroundColor Red; return }
  $other = @(git status --porcelain)
  if ($other.Count) { Write-Host 'working tree (this block stages only CLAUDE.md):'; $other | ForEach-Object { Write-Host ('   ' + $_) } }

  # --- 1. prefix identity: the log still starts where it started ---------------------
  $all = [IO.File]::ReadAllBytes($md)
  $pre = New-Object byte[] 4096
  [Array]::Copy($all, 0, $pre, 0, 4096)
  $sha = ([BitConverter]::ToString(
            [System.Security.Cryptography.SHA256]::Create().ComputeHash($pre))).Replace('-','').ToLower()
  Write-Host "prefix(4096) sha256 : $($sha.Substring(0,32))"
  if ($sha.Substring(0,32) -ne '1dc1af43debe92b690f3cf1a33cd6e96') { Write-Host 'ABORT: prefix changed.' -ForegroundColor Red; return }

  $s = @{ file='WI-K313f_stratum.txt'; md5='c3bf895fb83260c7959e753f3541af14'; bytes=7424
          logBefore='89e1f944628450a593b3eae40f900ec5'; lenBefore=1226155
          lenAfter=1233579; md5After='93956468cc657c012d1970cdd1cfb7b8'
          subject='WI-K313f - the apparatus corrected twice in an hour; cccxxxi, a published figure without a generator is a transcription of a claim; the 404 in the film description came from this seat' }

  $st = Join-Path $drop $s.file
  if (-not (Test-Path -LiteralPath $st)) { Write-Host "ABORT: $st missing." -ForegroundColor Red; return }

  # --- 2. gates on BOTH inputs, before a single byte is written -----------------------
  $h1 = Get-Md5 $md; $l1 = (Get-Item -LiteralPath $md).Length
  $h2 = Get-Md5 $st; $l2 = (Get-Item -LiteralPath $st).Length
  Write-Host ("CLAUDE.md  {0,9} bytes  md5 {1}" -f $l1, $h1)
  Write-Host ("stratum    {0,9} bytes  md5 {1}" -f $l2, $h2)
  if ($h1 -ne $s.logBefore -or $l1 -ne $s.lenBefore) { Write-Host 'ABORT: CLAUDE.md is not the file that was measured.' -ForegroundColor Red; return }
  if ($h2 -ne $s.md5       -or $l2 -ne $s.bytes)     { Write-Host 'ABORT: stratum is not the file that was written.'   -ForegroundColor Red; return }

  # --- 3. append as BYTES; the log is LF throughout; no text pipeline touches it -------
  $b  = [IO.File]::ReadAllBytes($st)
  $fs = [IO.File]::Open($md, 'Append', 'Write')
  $fs.Write($b, 0, $b.Length); $fs.Close()

  # --- 4. the result must be the file that was PREDICTED, or nothing commits ----------
  $len = (Get-Item -LiteralPath $md).Length
  $h3  = Get-Md5 $md
  Write-Host ("result     {0,9} bytes  md5 {1}" -f $len, $h3)
  if ($len -ne $s.lenAfter -or $h3 -ne $s.md5After) {
    Write-Host 'ABORT: append did not produce the predicted file. NOT COMMITTED.' -ForegroundColor Red
    Write-Host 'The log now has an unverified tail. Do not commit it; tell me the two numbers above.' -ForegroundColor Red
    return }

  # --- 5. explicit stage, exactly one path, commit ------------------------------------
  git add -- CLAUDE.md
  $staged = @(git diff --cached --name-only)
  Write-Host "staged              : $($staged -join ', ')"
  if ($staged.Count -ne 1 -or $staged[0] -ne 'CLAUDE.md') { Write-Host 'ABORT: staging is not exactly CLAUDE.md.' -ForegroundColor Red; git reset -q; return }
  git commit -m $s.subject | Out-Null
  git log -1 --pretty='%h %s'

  # --- 6. push, gated ----------------------------------------------------------------
  $ErrorActionPreference = 'Continue'
  git fetch --quiet origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'NOT PUSHED: fetch failed. The commit is local and safe; re-run P5_push.ps1 later.' -ForegroundColor Red; return }
  $behind = @(git log --oneline HEAD..origin/main)
  if ($behind.Count) { Write-Host 'NOT PUSHED: origin/main is ahead. Do not force. Tell me.' -ForegroundColor Red; $behind | ForEach-Object { Write-Host ('   ' + $_) }; return }
  $ahead = @(git log --oneline origin/main..HEAD)
  if ($ahead.Count -ne 1) { Write-Host 'ABORT: expected exactly one commit above origin/main. Not pushed.' -ForegroundColor Red; $ahead | ForEach-Object { Write-Host ('   ' + $_) }; return }
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'PUSH FAILED - nothing changed on origin; the commit is still local.' -ForegroundColor Red; return }
  Write-Host ('pushed. origin/main is now ' + (git rev-parse --short origin/main)) -ForegroundColor Green
  Write-Host 'WI-K313f landed. The register stands at cccxxxi. Nothing under src/ changed.' -ForegroundColor Yellow
}
