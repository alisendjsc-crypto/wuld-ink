# =====================================================================================
#  THE PUSH. Both repos. Cloudflare Pages deploys library.wuld.ink and wuld.ink on push.
#
#  Each push is gated on what HEAD actually is, and shows you exactly which commits will
#  leave the machine before any of them do. Nothing is force-pushed. Nothing is rewritten.
#  If a gate fails, that repo is skipped and the other still proceeds.
# =====================================================================================
& {
  $ErrorActionPreference = 'Continue'
  function Push-Gated {
    param($repo, $expectSubjectPrefix, $label)
    Write-Host ""
    Write-Host ("==== " + $label + " ====") -ForegroundColor Cyan
    if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "SKIP: no git repo at $repo" -ForegroundColor Red; return }
    Push-Location $repo
    try {
      $subj = (git log -1 --pretty=%s)
      Write-Host ("HEAD: " + $subj)
      if ($subj -notlike ($expectSubjectPrefix + '*')) {
        Write-Host ("SKIP: HEAD is not the commit I expected (wanted a subject starting '" + $expectSubjectPrefix + "'). Tell me what HEAD is.") -ForegroundColor Red; return }
      $dirty = @(git status --porcelain)
      if ($dirty.Count) { Write-Host "note: uncommitted paths present (not pushed, not touched):"; $dirty | ForEach-Object { Write-Host ("   " + $_) } }
      git fetch origin main 2>&1 | Out-Null
      $ahead  = @(git log --oneline origin/main..HEAD)
      $behind = @(git log --oneline HEAD..origin/main)
      if ($behind.Count) { Write-Host ("SKIP: origin/main has " + $behind.Count + " commit(s) this machine does not. Pull first; do not force.") -ForegroundColor Red; $behind | ForEach-Object { Write-Host ("   " + $_) }; return }
      if (-not $ahead.Count) { Write-Host "nothing to push - origin already has HEAD" -ForegroundColor Yellow; return }
      Write-Host ("pushing " + $ahead.Count + " commit(s):") -ForegroundColor Green
      $ahead | ForEach-Object { Write-Host ("   " + $_) }
      git push origin main
      if ($LASTEXITCODE -ne 0) { Write-Host "PUSH FAILED - nothing changed on origin" -ForegroundColor Red; return }
      Write-Host ("pushed. origin/main is now " + (git rev-parse --short origin/main)) -ForegroundColor Green
    } finally { Pop-Location }
  }
  Push-Gated 'C:\Users\y_m_a\Projects\efilist-argument-library' 'library: quality-check pass' 'library.wuld.ink  (deploys 3-8)'
  Push-Gated 'C:\Users\y_m_a\Projects\wuld-ink'                 'WI-K313'                    'wuld.ink  (canonical log strata)'
  Write-Host ""
  Write-Host "Cloudflare Pages builds on push. library.wuld.ink: give it ~2 minutes, then paste wuld_live_test.js" -ForegroundColor Yellow
  Write-Host "on a wing -- the console line should now say /sfx/ is PRESENT." -ForegroundColor Yellow
}
