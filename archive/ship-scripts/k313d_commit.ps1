# =====================================================================================
#  Canonical log: append WI-K313d (the quality-check pass; cccxxix, cccxxx). One commit.
#  Gated on the log as WI-K313c left it: 1,212,741 bytes / 9d215aa5... -- the value the
#  previous block PREDICTED and the screenshot of its run CONFIRMED. Nothing is pushed.
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  $md   = Join-Path $repo 'CLAUDE.md'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library'
  Set-Location $repo

  function Get-Md5 { param($p) (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }

  # --- 0. the working tree is the one that was measured ------------------------------
  $last = (git log -1 --pretty=%s)
  Write-Host "last commit subject : $last"
  if ($last -notmatch 'WI-K313c') { Write-Host 'ABORT: last commit is not WI-K313c.' -ForegroundColor Red; return }
  if (git status --porcelain -- CLAUDE.md) { Write-Host 'ABORT: CLAUDE.md already modified.' -ForegroundColor Red; return }
  $other = (git status --porcelain)
  if ($other) { Write-Host "note: other uncommitted paths present; this block stages none of them:"; Write-Host $other }

  # --- 1. prefix identity: the log still starts where it started ---------------------
  $all = [IO.File]::ReadAllBytes($md)
  $pre = New-Object byte[] 4096
  [Array]::Copy($all, 0, $pre, 0, 4096)
  $sha = ([BitConverter]::ToString(
            [System.Security.Cryptography.SHA256]::Create().ComputeHash($pre))).Replace('-','').ToLower()
  Write-Host "prefix(4096) sha256 : $($sha.Substring(0,32))"
  if ($sha.Substring(0,32) -ne '1dc1af43debe92b690f3cf1a33cd6e96') { Write-Host 'ABORT: prefix changed.' -ForegroundColor Red; return }

  # --- the two appends, each fully gated --------------------------------------------
  $steps = @(
    @{ file='WI-K313d_stratum.txt'; md5='e2f2722686d4647daeee7608784a73b3'
       logBefore='9d215aa5bc15bf25676f44108ae2d8a3'; lenAfter=1219391; md5After='f0bc08c0e04f45dd3dc7d5a0f32f2f71'
       subject='WI-K313d - the quality-check pass; cccxxix, a guard that lists what it fears; cccxxx, a status carried across a compaction is a claim' }
  )

  foreach ($s in $steps) {
    $st = Join-Path $drop $s.file
    Write-Host ""
    Write-Host "---- $($s.file) ----" -ForegroundColor Cyan
    if (-not (Test-Path $st)) { Write-Host "ABORT: $st missing." -ForegroundColor Red; return }

    # 2. gates on BOTH inputs, before a single byte is written
    $h1 = Get-Md5 $md
    $h2 = Get-Md5 $st
    Write-Host ("CLAUDE.md  {0,9} bytes  md5 {1}" -f (Get-Item $md).Length, $h1)
    Write-Host ("stratum    {0,9} bytes  md5 {1}" -f (Get-Item $st).Length, $h2)
    if ($h1 -ne $s.logBefore) { Write-Host 'ABORT: CLAUDE.md is not the file that was measured.' -ForegroundColor Red; return }
    if ($h2 -ne $s.md5)       { Write-Host 'ABORT: stratum is not the file that was written.'   -ForegroundColor Red; return }

    # 3. append as BYTES. the log is LF throughout; no text pipeline touches it
    $b  = [IO.File]::ReadAllBytes($st)
    $fs = [IO.File]::Open($md, 'Append', 'Write')
    $fs.Write($b, 0, $b.Length); $fs.Close()

    # 4. the result must be the file that was PREDICTED, or nothing commits
    $len = (Get-Item $md).Length
    $h3  = Get-Md5 $md
    Write-Host ("result     {0,9} bytes  md5 {1}" -f $len, $h3)
    if ($len -ne $s.lenAfter -or $h3 -ne $s.md5After) {
      Write-Host 'ABORT: append did not produce the predicted file. NOT COMMITTED.' -ForegroundColor Red
      Write-Host 'The log now has an unverified tail. Do not commit it; tell me the two numbers above.' -ForegroundColor Red
      return }

    # 5. explicit stage, never -u
    git add -- CLAUDE.md
    $staged = @(git diff --cached --name-only)
    Write-Host "staged              : $($staged -join ', ')"
    if ($staged.Count -ne 1 -or $staged[0] -ne 'CLAUDE.md') { Write-Host 'ABORT: staging is not exactly CLAUDE.md.' -ForegroundColor Red; return }

    git commit -m $s.subject | Out-Null
    git log -1 --pretty='%h %s'
  }

  Write-Host ""
  Write-Host "WI-K313d committed. NOT PUSHED." -ForegroundColor Yellow
}
