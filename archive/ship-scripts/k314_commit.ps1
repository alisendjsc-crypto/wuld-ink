# =====================================================================================
#  Canonical log: WI-K314 appended and committed, then a gated push. wuld-ink only.
#  Run AFTER pinmove\PIN_MOVE_efilist_commit.ps1.
#
#  THE STATE THIS BLOCK EXPECTS, either of two: at 19:26 -0700 the working-copy CLAUDE.md was the
#  K313e log + the WI-K313f stratum (1,233,579 B / 93956468...) with HEAD still 5b5d1af and the
#  reflog silent after it -- WI-K313f appended but not committed. If that is still so, this block
#  commits it FIRST under its own subject (the one WI-K313f_commit.ps1 carries), then appends
#  WI-K314. If WI-K313f has been committed since, HEAD's subject starts 'WI-K313f' and the tree is
#  clean; this block then appends WI-K314 only. Any other HEAD, or any other log bytes, aborts.
#       log   1,233,579 B / 93956468...  ->  1,248,030 B / dcea1aa9...   (predicted, or nothing commits)
#  Zero bytes under src/. The append is bytes; nothing is force-pushed or rewritten.
#  One-liner:  Get-Content 'C:\Users\y_m_a\Downloads\Argument Library\pinmove\WI-K314_commit.ps1' -Raw | Invoke-Expression
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  $md   = Join-Path $repo 'CLAUDE.md'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library\pinmove'
  Set-Location $repo
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "ABORT: no git repo at $repo" -ForegroundColor Red; return }
  Get-ChildItem -LiteralPath (Join-Path $repo '.git') -Filter '*.lock' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

  function Get-Md5 { param($p) (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }

  $s = @{ file='WI-K314_stratum.txt'; md5='2b1718cbcc5a38a10d3a60a4d29d3cae'; bytes=14451
          logBefore='93956468cc657c012d1970cdd1cfb7b8'; lenBefore=1233579
          lenAfter=1248030; md5After='dcea1aa904274f3ab5fa0d12b247a0c7'
          subject='WI-K314 - the flagship pin move: layer integrated into /combined, AA remap at source, two mode toggles, precis landed; pin 9d13359e -> 62d1e8d8; cccxxxii allocated'
          k313fSubject='WI-K313f - the apparatus corrected twice in an hour; cccxxxi, a published figure without a generator is a transcription of a claim; the 404 in the film description came from this seat' }

  # --- 0. which of the two states are we in? ---------------------------------------------------
  $head = (git rev-parse HEAD).Trim()
  $subj = (git log -1 --pretty=%s)
  $mdDirty = [bool](git status --porcelain -- CLAUDE.md)
  Write-Host "HEAD                : $head"
  Write-Host "HEAD subject        : $subj"
  Write-Host "CLAUDE.md modified  : $mdDirty"
  $h1 = Get-Md5 $md; $l1 = (Get-Item -LiteralPath $md).Length
  Write-Host ("CLAUDE.md  {0,9} bytes  md5 {1}" -f $l1, $h1)
  if ($h1 -ne $s.logBefore -or $l1 -ne $s.lenBefore) { Write-Host 'ABORT: CLAUDE.md is not the K313e log + the WI-K313f stratum (1,233,579 / 93956468). Tell me the two numbers above.' -ForegroundColor Red; return }
  $expectAhead = 0
  if ($head -eq '5b5d1af27c93893f1a8f79f15eecab30a9a7a437' -and $mdDirty) {
    Write-Host 'state: WI-K313f appended but not committed -- committing it first under its own subject' -ForegroundColor Yellow
    $other = @(git status --porcelain | Where-Object { $_ -notmatch 'CLAUDE\.md$' })
    if ($other.Count) { Write-Host 'working tree (this block stages only CLAUDE.md):'; $other | ForEach-Object { Write-Host ('   ' + $_) } }
    git add -- CLAUDE.md
    $staged = @(git diff --cached --name-only)
    if ($staged.Count -ne 1 -or $staged[0] -ne 'CLAUDE.md') { Write-Host 'ABORT: staging is not exactly CLAUDE.md.' -ForegroundColor Red; git reset -q; return }
    git commit -m $s.k313fSubject | Out-Null
    git log -1 --pretty='%h %s'
    $expectAhead = 2
  } elseif ($subj -like 'WI-K313f*' -and -not $mdDirty) {
    Write-Host 'state: WI-K313f already committed, tree clean' -ForegroundColor Green
    $expectAhead = 1
  } else {
    Write-Host 'ABORT: neither expected state (HEAD 5b5d1af with the K313f append pending, or HEAD = the WI-K313f commit with a clean log). Tell me the three lines above.' -ForegroundColor Red; return
  }

  # --- 1. prefix identity: the log still starts where it started --------------------------------
  $all = [IO.File]::ReadAllBytes($md)
  $pre = New-Object byte[] 4096
  [Array]::Copy($all, 0, $pre, 0, 4096)
  $sha = ([BitConverter]::ToString(
            [System.Security.Cryptography.SHA256]::Create().ComputeHash($pre))).Replace('-','').ToLower()
  Write-Host "prefix(4096) sha256 : $($sha.Substring(0,32))"
  if ($sha.Substring(0,32) -ne '1dc1af43debe92b690f3cf1a33cd6e96') { Write-Host 'ABORT: prefix changed.' -ForegroundColor Red; return }

  $st = Join-Path $drop $s.file
  if (-not (Test-Path -LiteralPath $st)) { Write-Host "ABORT: $st missing." -ForegroundColor Red; return }
  $h2 = Get-Md5 $st; $l2 = (Get-Item -LiteralPath $st).Length
  Write-Host ("stratum    {0,9} bytes  md5 {1}" -f $l2, $h2)
  if ($h2 -ne $s.md5 -or $l2 -ne $s.bytes) { Write-Host 'ABORT: stratum is not the file that was written.' -ForegroundColor Red; return }

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
    return }

  git add -- CLAUDE.md
  $staged = @(git diff --cached --name-only)
  Write-Host "staged              : $($staged -join ', ')"
  if ($staged.Count -ne 1 -or $staged[0] -ne 'CLAUDE.md') { Write-Host 'ABORT: staging is not exactly CLAUDE.md.' -ForegroundColor Red; return }
  git commit -m $s.subject | Out-Null
  git log -1 --pretty='%h %s'

  # --- 2. the push, gated -------------------------------------------------------------------------
  $ErrorActionPreference = 'Continue'
  Write-Host ''
  Write-Host '---- push ----' -ForegroundColor Cyan
  git fetch --quiet origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'NOT PUSHED: fetch failed (network?). The commit(s) are local and safe; re-run P5_push.ps1 later.' -ForegroundColor Red; return }
  $behind = @(git log --oneline HEAD..origin/main)
  if ($behind.Count) { Write-Host ('NOT PUSHED: origin/main has ' + $behind.Count + ' commit(s) this machine does not. The commit(s) are local and safe; do not force. Tell me.') -ForegroundColor Red; $behind | ForEach-Object { Write-Host ('   ' + $_) }; return }
  $ahead = @(git log --oneline origin/main..HEAD)
  Write-Host ('pushing ' + $ahead.Count + ' commit(s):') -ForegroundColor Green
  $ahead | ForEach-Object { Write-Host ('   ' + $_) }
  if ($ahead.Count -ne $expectAhead) { Write-Host ('ABORT: expected exactly ' + $expectAhead + ' commit(s) above origin/main. Not pushed; tell me what is listed.') -ForegroundColor Red; return }
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'PUSH FAILED - nothing changed on origin; the commit(s) are still local.' -ForegroundColor Red; return }
  Write-Host ('pushed. origin/main is now ' + (git rev-parse --short origin/main)) -ForegroundColor Green
  Write-Host 'WI-K314 landed. Nothing in wuld.ink/src changed, so the site is unaffected by this push.' -ForegroundColor Yellow
}
