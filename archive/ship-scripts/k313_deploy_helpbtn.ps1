# =====================================================================================
#  P5 deploy 7 -- the tutorial button no longer appears where there is no tutorial.
#  One file: wuld-layer.js. Runs after deploy 6 (e61c91a).
#  Nothing is pushed.
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\efilist-argument-library'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library'
  $HEAD_EXPECT = 'e61c91a'

  function Get-Md5     { param($p) (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }
  function Write-Abort { param($m) Write-Host "ABORT: $m" -ForegroundColor Red; throw $m }

  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Abort "no git repo at $repo" }
  Push-Location $repo
  try {
    $head = (git rev-parse --short HEAD).Trim()
    if ($head -ne $HEAD_EXPECT) {
      Write-Abort "HEAD is $head, expected $HEAD_EXPECT (the per-view tutorials commit). Run P5_deploy_views.ps1 first, or tell me what landed."
    }
    $already = @(git diff --cached --name-only)
    if ($already.Count) { Write-Abort "already staged:`n$($already -join "`n")" }
    Write-Host "gate 1  HEAD $head, index clean" -ForegroundColor Green

    $dirty = @(git status --porcelain -- wuld-layer.js)
    if ($dirty.Count) { Write-Abort "the repo copies differ from HEAD already:`n$($dirty -join "`n")" }
    Write-Host "gate 2  wuld-layer.js is unmodified relative to HEAD" -ForegroundColor Green

    $incoming = [ordered]@{
      'wuld-layer.js'  = @{ md5 = 'fb4f19984ec4375ae300323da1e91719'; bytes = 51530 }
    }
    foreach ($k in $incoming.Keys) {
      $s = Join-Path $drop $k
      if (-not (Test-Path $s)) { Write-Abort "source missing: $s" }
      $h = Get-Md5 $s; $b = (Get-Item -LiteralPath $s).Length
      if ($h -ne $incoming[$k].md5)   { Write-Abort "$k source md5 $h, expected $($incoming[$k].md5)" }
      if ($b -ne $incoming[$k].bytes) { Write-Abort "$k source is $b bytes, expected $($incoming[$k].bytes)" }
    }
    Write-Host "gate 3  the incoming file matches their expected md5 and byte count" -ForegroundColor Green

    foreach ($k in $incoming.Keys) {
      $d = Join-Path $repo $k
      Copy-Item -LiteralPath (Join-Path $drop $k) -Destination $d -Force
      $h = Get-Md5 $d
      if ($h -ne $incoming[$k].md5) { Write-Abort "$k landed as $h. Copy corrupted; nothing staged." }
      "{0,-18} {1,6} B  {2}" -f $k, $incoming[$k].bytes, $h | Write-Host
    }
    Write-Host "gate 4  the file verified on disk after writing" -ForegroundColor Green

    foreach ($k in $incoming.Keys) { git add -- $k }
    $staged  = @(git diff --cached --name-only)
    $missing = @($incoming.Keys | Where-Object { $staged -notcontains $_ })
    $extra   = @($staged        | Where-Object { $incoming.Keys -notcontains $_ })
    if ($missing.Count) { Write-Abort "expected but not staged:`n$($missing -join "`n")" }
    if ($extra.Count)   { Write-Abort "staged but not expected:`n$($extra -join "`n")" }
    if ($staged -match 'combined\.html') { Write-Abort "combined.html is staged -- the flagship must not move here." }
    Write-Host "gate 5  exactly the 1 expected file staged, flagship untouched" -ForegroundColor Green
    $staged | ForEach-Object { Write-Host "        $_" }

    git commit -m "library: no tutorial button on a page that has no tutorial

The chin exists on every page the layer touches, so /troubleshooting/ was getting a ? that
returned 0 and opened nothing -- a control whose only behaviour is to do nothing when
pressed, which is worse than its absence. The button is now gated on the same test as the
auto-run: a library surface, detected by the mode buttons' stable ids, which are in the
static HTML of every wing and the index and absent there.

CSS unchanged; one condition in wuld-tour.js.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BhsNYGTo9DBRtTPN94YsjW"

    Write-Host ""
    git show --stat --oneline HEAD
    Write-Host ""
    Write-Host "COMMITTED, NOT PUSHED." -ForegroundColor Yellow
  }
  finally { Pop-Location }
}
