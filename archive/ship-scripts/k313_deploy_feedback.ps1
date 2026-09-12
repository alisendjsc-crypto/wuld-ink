# =====================================================================================
#  P5 deploy 4 -- per-card feedback control.
#
#  Two files only: wuld-layer.css and wuld-layer.js. No new assets, no page edits.
#
#  GATE 2 CHANGED, AND THE REASON MATTERS. The last run warned that git will convert
#  both files to CRLF in the working copy the next time it touches them, which would
#  make any md5 I measured today wrong tomorrow for reasons that have nothing to do
#  with the content. So instead of hashing the working tree, this asks git whether the
#  tree is clean relative to HEAD -- the same question, asked of the thing that knows.
#
#  Nothing is pushed.
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\efilist-argument-library'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library'
  $HEAD_EXPECT = '8b4537d'

  function Get-Md5     { param($p) (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }
  function Write-Abort { param($m) Write-Host "ABORT: $m" -ForegroundColor Red; throw $m }

  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Abort "no git repo at $repo" }
  Push-Location $repo
  try {
    # --- gate 1: at the commit I built on, with a clean index -------------------------
    $head = (git rev-parse --short HEAD).Trim()
    if ($head -ne $HEAD_EXPECT) { Write-Abort "HEAD is $head, expected $HEAD_EXPECT. Tell me and stop." }
    $already = @(git diff --cached --name-only)
    if ($already.Count) { Write-Abort "already staged:`n$($already -join "`n")" }
    Write-Host "gate 1  HEAD $head, index clean" -ForegroundColor Green

    # --- gate 2: the files I am replacing are exactly what HEAD says they are ---------
    $dirty = @(git status --porcelain -- wuld-layer.css wuld-layer.js)
    if ($dirty.Count) { Write-Abort "the repo copies differ from HEAD already:`n$($dirty -join "`n")" }
    Write-Host "gate 2  both files are unmodified relative to HEAD" -ForegroundColor Green

    # --- gate 3: the incoming files are the ones I built ------------------------------
    $incoming = [ordered]@{
      'wuld-layer.css' = @{ md5 = 'a896fb8b6cc68eaa2c3ce9caf5dc6295'; bytes = 54490 }
      'wuld-layer.js'  = @{ md5 = '72a0e1a38e855d1b0ce88446557a818a'; bytes = 29413 }
    }
    foreach ($k in $incoming.Keys) {
      $s = Join-Path $drop $k
      if (-not (Test-Path $s)) { Write-Abort "source missing: $s" }
      $h = Get-Md5 $s; $b = (Get-Item -LiteralPath $s).Length
      if ($h -ne $incoming[$k].md5)   { Write-Abort "$k source md5 $h, expected $($incoming[$k].md5)" }
      if ($b -ne $incoming[$k].bytes) { Write-Abort "$k source is $b bytes, expected $($incoming[$k].bytes)" }
    }
    Write-Host "gate 3  both incoming files match their expected md5 and byte count" -ForegroundColor Green

    # --- write, verify, stage ---------------------------------------------------------
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
    if ($staged -match 'combined\.html') { Write-Abort "combined.html is staged -- the pinned flagship must not move here." }
    Write-Host "gate 5  exactly the 2 expected files staged, flagship untouched" -ForegroundColor Green
    $staged | ForEach-Object { Write-Host "        $_" }

    git commit -m "library: per-card feedback control (mailto carrying the objection id)

A FEEDBACK label at the top-right of every objection card opens a mail draft already
carrying the card's id, its deep link and its headline, so a report arrives with the
thing it is about attached. No backend, no form, no storage. Site-wide comments keep
their existing route at wuld.ink/contact rather than earning a fourth chin button.

The draft describes the card so the sender doesn't have to: library, headline, the
colloquial names on the card's own chips, its classification strip, its id and its deep
link -- read off the card at click time, so it cannot drift. Built longest-first and
degraded in order against an 1800-char budget, because Windows passes the whole mailto
through a shell and clients truncate well before 2000. Measured across 50 cards on five
wings: longest 1295 chars, every field present, none over budget.

Anchored, not floated: a float is only contained by a block taller than itself, and a
26px control (the WCAG 2.5.8 target floor) hung 9px past the 17px meta strip and
rewrapped every headline. Measured at 1440/768/390/320: document height, card heights
and headline height all identical with the control and without it.

Drawn at --dim with no opacity. The first version dimmed to .62 and measured 3.56:1 on
the dark ground but 2.58:1 on the cream one, under 1.4.11's 3:1 floor for a UI
component; at full strength the worst mode measures 5.37:1. Injected and observed, not
delegated -- 0 of 5 wings carry a single card in their static HTML, and a filter
re-render replaces the lot. Six re-render cycles: 16.70ms median.

28 feedback checks pass; 25 contrast cells still 0 below AA; CLS 0.000; tap targets
still 34 under 24px, none of them new.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BhsNYGTo9DBRtTPN94YsjW"

    Write-Host ""
    git show --stat --oneline HEAD
    Write-Host ""
    Write-Host "COMMITTED, NOT PUSHED." -ForegroundColor Yellow
  }
  finally { Pop-Location }
}
