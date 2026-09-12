& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  $md   = Join-Path $repo 'CLAUDE.md'
  $st   = 'C:\Users\y_m_a\Downloads\Argument Library\WI-K313b_stratum.txt'
  Set-Location $repo

  # --- 0. the working tree is the one that was measured --------------------
  $last = (git log -1 --pretty=%s)
  Write-Host "last commit subject : $last"
  if ($last -notmatch 'WI-K313a') { Write-Host 'ABORT: last commit is not WI-K313a.'; return }
  if (git status --porcelain -- CLAUDE.md) { Write-Host 'ABORT: CLAUDE.md already modified.'; return }
  $other = (git status --porcelain)
  if ($other) { Write-Host "note: other uncommitted paths present; this block stages none of them:"; Write-Host $other }

  # --- 1. gates on BOTH inputs ---------------------------------------------
  $h1 = (Get-FileHash $md -Algorithm MD5).Hash.ToLower()
  $h2 = (Get-FileHash $st -Algorithm MD5).Hash.ToLower()
  Write-Host ("CLAUDE.md  {0,9} bytes  md5 {1}" -f (Get-Item $md).Length, $h1)
  Write-Host ("stratum    {0,9} bytes  md5 {1}" -f (Get-Item $st).Length, $h2)
  if ($h1 -ne '1d5d074cfb4903283fd4e89ba7b5a007') { Write-Host 'ABORT: CLAUDE.md is not the file that was measured.'; return }
  if ($h2 -ne 'd956d61a69b8733c4cc1d4b728323c00') { Write-Host 'ABORT: stratum is not the file that was written.'; return }

  # --- 2. prefix identity: the log still starts where it started -----------
  $all = [IO.File]::ReadAllBytes($md)
  $pre = New-Object byte[] 4096
  [Array]::Copy($all, 0, $pre, 0, 4096)
  $sha = ([BitConverter]::ToString(
            [System.Security.Cryptography.SHA256]::Create().ComputeHash($pre))).Replace('-','').ToLower()
  Write-Host "prefix(4096) sha256 : $($sha.Substring(0,32))"
  if ($sha.Substring(0,32) -ne '1dc1af43debe92b690f3cf1a33cd6e96') { Write-Host 'ABORT: prefix changed.'; return }

  # --- 3. append as BYTES. the log is LF; no text pipeline touches it -------
  $b  = [IO.File]::ReadAllBytes($st)
  $fs = [IO.File]::Open($md, 'Append', 'Write')
  $fs.Write($b, 0, $b.Length); $fs.Close()

  # --- 4. the result must be the file that was PREDICTED, or nothing commits
  $len = (Get-Item $md).Length
  $h3  = (Get-FileHash $md -Algorithm MD5).Hash.ToLower()
  Write-Host ("result     {0,9} bytes  md5 {1}" -f $len, $h3)
  if ($len -ne 1202798 -or $h3 -ne '8dc113efd55471933198592067191724') {
    Write-Host 'ABORT: append did not produce the predicted file. NOT COMMITTED.'; return }

  # --- 5. explicit stage, never -u -----------------------------------------
  git add -- CLAUDE.md
  $staged = @(git diff --cached --name-only)
  Write-Host "staged              : $($staged -join ', ')"
  if ($staged.Count -ne 1 -or $staged[0] -ne 'CLAUDE.md') { Write-Host 'ABORT: staging is not exactly CLAUDE.md.'; return }

  git commit -m "WI-K313b - wings swept; cccxxiii, three gates keyed to a proxy; cccxxiv, a control that could not refute its claim"
  git log -1 --pretty='%h %s'
}
