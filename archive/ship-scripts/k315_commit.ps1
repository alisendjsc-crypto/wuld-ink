# =====================================================================================
#  Canonical log: WI-K315 appended and committed, then a gated push. wuld-ink only.
#  Run AFTER layerfix\LAYER_FIX_efilist_commit.ps1.
#
#  THE STATE THIS BLOCK EXPECTS, either of two:
#   (a) the log is exactly as WI-K314 left it at c8619fb -- 1,248,030 B / dcea1aa9... -- and the tree is
#       clean: append, predicted 1,258,007 B / 70e08812..., or nothing commits.
#   (b) the other seat has since landed WI-K313g (HEAD subject starts 'WI-K313g', tree clean): the first
#       1,248,030 bytes must still hash dcea1aa9..., neither 'cccxxxiii' nor 'cccxxxiv' may already be
#       in the log (they are allocated here), and the prediction is computed from the bytes on disk
#       before the append and verified after it.
#   Anything else -- a pending uncommitted append, another HEAD, other bytes -- aborts and tells you.
#  Zero bytes under src/. The append is bytes; nothing is force-pushed or rewritten.
#  One-liner:  Get-Content 'C:\Users\y_m_a\Downloads\Argument Library\layerfix\WI-K315_commit.ps1' -Raw | Invoke-Expression
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  $md   = Join-Path $repo 'CLAUDE.md'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library\layerfix'
  Set-Location $repo
  [Environment]::CurrentDirectory = $repo
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "ABORT: no git repo at $repo" -ForegroundColor Red; return }
  Get-ChildItem -LiteralPath (Join-Path $repo '.git') -Filter '*.lock' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

  function Get-Md5 { param($p) (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }
  function Get-Md5Bytes { param([byte[]]$b, [int]$n) ([BitConverter]::ToString([System.Security.Cryptography.MD5]::Create().ComputeHash($b, 0, $n))).Replace('-','').ToLower() }

  $stratumFile = Join-Path $drop 'WI-K315_stratum.txt'
  $stratumMd5  = '17e3ae6a4e0cd1fd1aa0d9c221478874'; $stratumLen = 9977
  $baseMd5 = 'dcea1aa904274f3ab5fa0d12b247a0c7'; $baseLen = 1248030
  $predLen = 1258007; $predMd5 = '70e08812cc6a9b5ed8ef8cb3da5e14d2'
  $subject = 'WI-K315 - the layer fix after the pin move: ? reachable by mouse, one tour flag per surface, softer cues with a master gain, a cache rule for /wuld-layer.*, .gitattributes css/js; NO PIN; cccxxxiii and cccxxxiv allocated'

  # --- 0. which state? ---------------------------------------------------------------------------
  $head = (git rev-parse HEAD).Trim()
  $subj = (git log -1 --pretty=%s)
  $mdDirty = [bool](git status --porcelain -- CLAUDE.md)
  $all = [IO.File]::ReadAllBytes($md)
  $h1 = Get-Md5 $md; $l1 = $all.Length
  Write-Host "HEAD                : $head"
  Write-Host "HEAD subject        : $subj"
  Write-Host "CLAUDE.md modified  : $mdDirty"
  Write-Host ("CLAUDE.md  {0,9} bytes  md5 {1}" -f $l1, $h1)
  if ($mdDirty) { Write-Host 'ABORT: CLAUDE.md has an uncommitted change (another seat''s append pending?). Commit that under its own subject first, then re-run this. Nothing changed.' -ForegroundColor Red; return }
  $state = ''
  if ($h1 -eq $baseMd5 -and $l1 -eq $baseLen -and $subj -like 'WI-K314*') { $state = 'a' }
  elseif ($subj -like 'WI-K313g*' -and $l1 -gt $baseLen -and (Get-Md5Bytes $all $baseLen) -eq $baseMd5) { $state = 'b' }
  if ($state -eq '') { Write-Host 'ABORT: neither expected state (log 1,248,030 / dcea1aa9 with HEAD = WI-K314, or WI-K313g landed on top of those bytes). Tell me the four lines above.' -ForegroundColor Red; return }
  Write-Host ("state: " + $(if ($state -eq 'a') { 'WI-K314 is the last stratum; appending after it' } else { 'WI-K313g landed on top of WI-K314; appending after it, prediction computed from disk' })) -ForegroundColor Green

  # --- 1. prefix identity, numeral collision, stratum identity ---------------------------------
  $pre = New-Object byte[] 4096
  [Array]::Copy($all, 0, $pre, 0, 4096)
  $sha = ([BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash($pre))).Replace('-','').ToLower()
  Write-Host "prefix(4096) sha256 : $($sha.Substring(0,32))"
  if ($sha.Substring(0,32) -ne '1dc1af43debe92b690f3cf1a33cd6e96') { Write-Host 'ABORT: prefix changed.' -ForegroundColor Red; return }
  $n3 = @(Select-String -LiteralPath $md -SimpleMatch -Pattern 'cccxxxiii').Count
  $n4 = @(Select-String -LiteralPath $md -SimpleMatch -Pattern 'cccxxxiv').Count
  Write-Host "lines naming cccxxxiii / cccxxxiv already in the log: $n3 / $n4"
  if ($n3 -or $n4) { Write-Host 'ABORT: a numeral this stratum allocates is already in the log (the other seat spent it). Tell me; I re-cut the stratum. Nothing changed.' -ForegroundColor Red; return }
  if (-not (Test-Path -LiteralPath $stratumFile)) { Write-Host "ABORT: $stratumFile missing." -ForegroundColor Red; return }
  $h2 = Get-Md5 $stratumFile; $l2 = (Get-Item -LiteralPath $stratumFile).Length
  Write-Host ("stratum    {0,9} bytes  md5 {1}" -f $l2, $h2)
  if ($h2 -ne $stratumMd5 -or $l2 -ne $stratumLen) { Write-Host 'ABORT: stratum is not the file that was written.' -ForegroundColor Red; return }
  $b = [IO.File]::ReadAllBytes($stratumFile)
  if ($state -eq 'b') {
    $joined = New-Object byte[] ($all.Length + $b.Length)
    [Array]::Copy($all, 0, $joined, 0, $all.Length); [Array]::Copy($b, 0, $joined, $all.Length, $b.Length)
    $predLen = $joined.Length; $predMd5 = Get-Md5Bytes $joined $joined.Length
  }
  Write-Host ("predicted  {0,9} bytes  md5 {1}" -f $predLen, $predMd5)

  # --- 2. append as BYTES; the result must be the file that was predicted, or nothing commits ---
  $fs = [IO.File]::Open($md, 'Append', 'Write')
  $fs.Write($b, 0, $b.Length); $fs.Close()
  $len = (Get-Item -LiteralPath $md).Length
  $h3  = Get-Md5 $md
  Write-Host ("result     {0,9} bytes  md5 {1}" -f $len, $h3)
  if ($len -ne $predLen -or $h3 -ne $predMd5) {
    Write-Host 'ABORT: append did not produce the predicted file. NOT COMMITTED.' -ForegroundColor Red
    Write-Host 'The log now has an unverified tail. Do not commit it; tell me the two numbers above.' -ForegroundColor Red
    return }

  git add -- CLAUDE.md
  $staged = @(git diff --cached --name-only)
  Write-Host "staged              : $($staged -join ', ')"
  if ($staged.Count -ne 1 -or $staged[0] -ne 'CLAUDE.md') { Write-Host 'ABORT: staging is not exactly CLAUDE.md.' -ForegroundColor Red; git reset -q; return }
  git commit -m $subject | Out-Null
  git log -1 --pretty='%h %s'

  # --- 3. the push, gated -------------------------------------------------------------------------
  $ErrorActionPreference = 'Continue'
  Write-Host ''
  Write-Host '---- push ----' -ForegroundColor Cyan
  git fetch --quiet origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'NOT PUSHED: fetch failed (network?). The commit is local and safe; re-run P5_push.ps1 later.' -ForegroundColor Red; return }
  $behind = @(git log --oneline HEAD..origin/main)
  if ($behind.Count) { Write-Host ('NOT PUSHED: origin/main has ' + $behind.Count + ' commit(s) this machine does not. The commit is local and safe; do not force. Tell me.') -ForegroundColor Red; $behind | ForEach-Object { Write-Host ('   ' + $_) }; return }
  $ahead = @(git log --oneline origin/main..HEAD)
  Write-Host ('pushing ' + $ahead.Count + ' commit(s):') -ForegroundColor Green
  $ahead | ForEach-Object { Write-Host ('   ' + $_) }
  if ($ahead.Count -ne 1) { Write-Host ('ABORT: expected exactly 1 commit above origin/main. Not pushed; tell me what is listed.') -ForegroundColor Red; return }
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'PUSH FAILED - nothing changed on origin; the commit is still local.' -ForegroundColor Red; return }
  Write-Host ('pushed. origin/main is now ' + (git rev-parse --short origin/main)) -ForegroundColor Green
  Write-Host 'WI-K315 landed. Nothing in wuld.ink/src changed, so the site is unaffected by this push.' -ForegroundColor Yellow
}
