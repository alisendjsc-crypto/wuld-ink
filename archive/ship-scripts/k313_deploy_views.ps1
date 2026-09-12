# =====================================================================================
#  P5 deploy 6 -- per-view tutorials, the chin ? button, and the stage shim.
#  Two files: wuld-layer.css, wuld-layer.js. Runs after deploy 5 (d5b8b58).
#  Nothing is pushed.
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\efilist-argument-library'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library'
  $HEAD_EXPECT = 'd5b8b58'

  function Get-Md5     { param($p) (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }
  function Write-Abort { param($m) Write-Host "ABORT: $m" -ForegroundColor Red; throw $m }

  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Abort "no git repo at $repo" }
  Push-Location $repo
  try {
    $head = (git rev-parse --short HEAD).Trim()
    if ($head -ne $HEAD_EXPECT) {
      Write-Abort "HEAD is $head, expected $HEAD_EXPECT (the walkthrough commit). Run P5_deploy_tour.ps1 first, or tell me what landed."
    }
    $already = @(git diff --cached --name-only)
    if ($already.Count) { Write-Abort "already staged:`n$($already -join "`n")" }
    Write-Host "gate 1  HEAD $head, index clean" -ForegroundColor Green

    $dirty = @(git status --porcelain -- wuld-layer.css wuld-layer.js)
    if ($dirty.Count) { Write-Abort "the repo copies differ from HEAD already:`n$($dirty -join "`n")" }
    Write-Host "gate 2  both files are unmodified relative to HEAD" -ForegroundColor Green

    $incoming = [ordered]@{
      'wuld-layer.css' = @{ md5 = '16ab9347b3b111c7b12c1a7663fdf61b'; bytes = 58271 }
      'wuld-layer.js'  = @{ md5 = 'e5947dc21a72f9e01334da49848fddb6'; bytes = 51001 }
    }
    foreach ($k in $incoming.Keys) {
      $s = Join-Path $drop $k
      if (-not (Test-Path $s)) { Write-Abort "source missing: $s" }
      $h = Get-Md5 $s; $b = (Get-Item -LiteralPath $s).Length
      if ($h -ne $incoming[$k].md5)   { Write-Abort "$k source md5 $h, expected $($incoming[$k].md5)" }
      if ($b -ne $incoming[$k].bytes) { Write-Abort "$k source is $b bytes, expected $($incoming[$k].bytes)" }
    }
    Write-Host "gate 3  both incoming files match their expected md5 and byte count" -ForegroundColor Green

    foreach ($k in $incoming.Keys) {
      $d = Join-Path $repo $k
      Copy-Item -LiteralPath (Join-Path $drop $k) -Destination $d -Force
      $h = Get-Md5 $d
      if ($h -ne $incoming[$k].md5) { Write-Abort "$k landed as $h. Copy corrupted; nothing staged." }
      "{0,-18} {1,6} B  {2}" -f $k, $incoming[$k].bytes, $h | Write-Host
    }
    Write-Host "gate 4  both files verified on disk after writing" -ForegroundColor Green

    foreach ($k in $incoming.Keys) { git add -- $k }
    $staged  = @(git diff --cached --name-only)
    $missing = @($incoming.Keys | Where-Object { $staged -notcontains $_ })
    $extra   = @($staged        | Where-Object { $incoming.Keys -notcontains $_ })
    if ($missing.Count) { Write-Abort "expected but not staged:`n$($missing -join "`n")" }
    if ($extra.Count)   { Write-Abort "staged but not expected:`n$($extra -join "`n")" }
    if ($staged -match 'combined\.html') { Write-Abort "combined.html is staged -- the flagship must not move here." }
    Write-Host "gate 5  exactly the 2 expected files staged, flagship untouched" -ForegroundColor Green
    $staged | ForEach-Object { Write-Host "        $_" }

    git commit -m "library: a tutorial per view, a ? button to re-open it, and a stage shim

The flagship is five surfaces behind one URL -- library, mechanism web, dependency graph,
argument flow, examples -- and a reader who opens the dependency graph three weeks after
their first visit has had no introduction to it at all. Each view now carries its own
three-step tour and its own once-ever key, fired when that view is ACTIVATED rather than
at page load. The library tour stays longest (six steps on a wing, seven on the flagship,
which has a view switcher and an RSI methodology panel the wings do not).

A ? button joins the chin as its fourth control and runs the tour for whatever view is in
front of you, seen or not -- no menu of five. Four 44x44 buttons with 6px gaps still fit
at 320px, which is the reason the wordmark hides below 420.

AND A PIN-MOVE BLOCKER, FOUND BY TESTING THE TOURS ON THE FLAGSHIP: the stage wrapper --
a real element between <body> and the content, which is what carries the camera transform
-- silently stops every 'body > #id' rule in the page from matching. The flagship switches
its three top-level sections with exactly that shape, so wrapping turned its whole
navigation off: every section rendered at once. Measured before and after the wrap on the
same page, which is the only way to tell this from a page behaviour. The layer now mirrors
any 'body ... >' rule with .wz-stage spliced in -- mechanical, never editing the page's own
rules, and a verified no-op on all three wing surfaces, where it injects nothing.

Separately and NOT ours: the flagship throws on its own top-nav examples/coda buttons,
with or without this layer. Reproduced on the unmodified page. Left alone; it is a
flagship change and belongs in the pin-move session.

24 flagship checks and 25 wing checks pass; contrast, CLS, overflow, print, chin fit,
sound gates and 16.70ms scroll all unchanged.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BhsNYGTo9DBRtTPN94YsjW"

    Write-Host ""
    git show --stat --oneline HEAD
    Write-Host ""
    Write-Host "COMMITTED, NOT PUSHED." -ForegroundColor Yellow
  }
  finally { Pop-Location }
}
