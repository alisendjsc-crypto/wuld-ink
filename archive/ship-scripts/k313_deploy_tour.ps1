# =====================================================================================
#  P5 deploy 5 -- the first-visit walkthrough.
#  Two files: wuld-layer.css, wuld-layer.js. Runs after deploy 4 (4782766).
#  Nothing is pushed.
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\efilist-argument-library'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library'
  $HEAD_EXPECT = '4782766'

  function Get-Md5     { param($p) (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }
  function Write-Abort { param($m) Write-Host "ABORT: $m" -ForegroundColor Red; throw $m }

  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Abort "no git repo at $repo" }
  Push-Location $repo
  try {
    $head = (git rev-parse --short HEAD).Trim()
    if ($head -ne $HEAD_EXPECT) {
      Write-Abort "HEAD is $head, expected $HEAD_EXPECT (the feedback commit). Run P5_deploy_feedback.ps1 first, or tell me what landed."
    }
    $already = @(git diff --cached --name-only)
    if ($already.Count) { Write-Abort "already staged:`n$($already -join "`n")" }
    Write-Host "gate 1  HEAD $head, index clean" -ForegroundColor Green

    $dirty = @(git status --porcelain -- wuld-layer.css wuld-layer.js)
    if ($dirty.Count) { Write-Abort "the repo copies differ from HEAD already:`n$($dirty -join "`n")" }
    Write-Host "gate 2  both files are unmodified relative to HEAD" -ForegroundColor Green

    $incoming = [ordered]@{
      'wuld-layer.css' = @{ md5 = 'f54c1fc13629c024a21ed24ea9f94498'; bytes = 57406 }
      'wuld-layer.js'  = @{ md5 = '48dcc033a1610f76d8b078cf043f90e8'; bytes = 43560 }
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

    git commit -m "library: first-visit walkthrough, once per browser, skippable throughout

Six steps on a wing, four on the index: power button, magnifier, sound, reading modes,
the anatomy of an objection card, and the feedback control. Skip and Escape at every
step, arrow keys both ways, clicking anywhere off it ends it. Never runs under
prefers-reduced-motion. wzTour() re-opens it from the console.

It owns the first visit: the one-line hint says the same thing as step 1, so the tour
claims the hint's key at parse time -- before boot calls hint() -- and only on a page
that can actually run it, so /troubleshooting/ keeps its hint and spends nothing.

Three things it got wrong first, each caught by measuring rather than looking:
one overlay with a box-shadow hole meant raising the spotlit element, which for a chin
button meant raising the whole chin -- the row stayed bright and the ring hid behind it;
four panels around the target cover everything except the target and touch nobody's
z-index. The ring then drew mid-scroll, spanning the bottom of one card and the top of
the next, because a rect read two frames after a smooth scrollIntoView is a rect in
flight; it now settles before it draws. And a tall card centred puts both ring edges
off-screen, so a target over 70% of the viewport scrolls to its top instead.

25 tour checks pass, including that a page with no library surface runs no tour and
spends no flag. Six steps verified against their targets at 1440x900 and 390x844.

One consequence for the harnesses, recorded because it is the kind of thing that rots
quietly: the tour runs in every fresh Playwright context, so every harness that samples
pixels was measuring a 74% black mask. fbcontrast went from eight cells at 5.37-13.89:1
to eight at 1.00-1.74:1 with no CSS change at all. 26 harnesses now suppress it.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BhsNYGTo9DBRtTPN94YsjW"

    Write-Host ""
    git show --stat --oneline HEAD
    Write-Host ""
    Write-Host "COMMITTED, NOT PUSHED." -ForegroundColor Yellow
  }
  finally { Pop-Location }
}
