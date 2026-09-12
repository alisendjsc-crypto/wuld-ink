# =====================================================================================
#  P5 deploy 8 -- the quality-check pass: nine fixes.
#  Two files: wuld-layer.css, wuld-layer.js. Runs after deploy 7 (ac609b6).
#  Nothing is pushed.
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\efilist-argument-library'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library'
  $HEAD_EXPECT = 'ac609b6'

  function Get-Md5     { param($p) (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }
  function Write-Abort { param($m) Write-Host "ABORT: $m" -ForegroundColor Red; throw $m }

  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Abort "no git repo at $repo" }
  Push-Location $repo
  try {
    $head = (git rev-parse --short HEAD).Trim()
    if ($head -ne $HEAD_EXPECT) {
      Write-Abort "HEAD is $head, expected $HEAD_EXPECT (the tutorial-button commit). Run P5_deploy_helpbtn.ps1 first, or tell me what landed."
    }
    $already = @(git diff --cached --name-only)
    if ($already.Count) { Write-Abort "already staged:`n$($already -join "`n")" }
    Write-Host "gate 1  HEAD $head, index clean" -ForegroundColor Green

    $dirty = @(git status --porcelain -- wuld-layer.css wuld-layer.js)
    if ($dirty.Count) { Write-Abort "the repo copies differ from HEAD already:`n$($dirty -join "`n")" }
    Write-Host "gate 2  both files are unmodified relative to HEAD" -ForegroundColor Green

    $incoming = [ordered]@{
      'wuld-layer.css' = @{ md5 = '089dff05cce29ccb51cc359c05556736'; bytes = 58676 }
      'wuld-layer.js'  = @{ md5 = '85665e349de9447b9d41b4eeaec398ac'; bytes = 55585 }
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

    git commit -m "library: quality-check pass -- nine fixes, two of them in copy describing the apparatus

Run as an adversarial review of the harnesses rather than a re-run of the suite. Findings:

The wordmark clashed with the ? button between 421 and 476px: the 420px hide threshold was
derived for three chin buttons and never re-derived for four, and chinfit sampled nothing in
that band. Hides below 500 now; chinfit samples the band.

Three factual errors in the graph-view tour copy. 'Click an edge' on the mechanism web (nodes
are clickable, edges are not); that web's edges called relations between mechanisms (they
join an objection to a mechanism); the dependency graph's weak edges called low-confidence
(weak means the response would survive the premise's removal). Rewritten, and now under a
source gate that reads the shipped copy and requires a verbatim panel sentence per claim.

Step-2 rings on the map and dependency views covered 77% of the viewport: the selector
guessed .map-controls, which is the zoom container. It is .map-toolbar. flagtour now
asserts the ring contains exactly its buttons.

A second scroll-timing bug in place(): smooth scroll's startup latency satisfied 'stable
for two frames' before the scroll began, so the ring eased onto the view switcher 130px
above its target. Instant scroll now, with a 150ms minimum before stability counts.

Also: a rapid-arrow race (generation counter), tour keys leaking to the page (stopped -- the
tour is modal), the sound layer repainting the mute button on every zoom tick (zero writes
now across 40 ticks), the shim re-emitting @supports as @media, and an unscoped
.obj{position:relative}.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BhsNYGTo9DBRtTPN94YsjW"

    Write-Host ""
    git show --stat --oneline HEAD
    Write-Host ""
    Write-Host "COMMITTED, NOT PUSHED." -ForegroundColor Yellow
  }
  finally { Pop-Location }
}
