& {
  $ErrorActionPreference = 'Stop'
  Set-Location 'C:\Users\y_m_a\Projects\efilist-argument-library'

  # Second P5 commit. Only the two SHARED files change -- the seven pages are untouched, because
  # they carry nothing but a <link>, a <script> and the stage wrapper. That is the whole point of
  # having externalised them: a feature lands in two files instead of nine.
  $expected = @{
    'wuld-layer.css' = 'f09294bb85f90616ca2140969399d337'
    'wuld-layer.js'  = 'aed5fd76e516da31522edde9435a4b69'
  }
  $bad = @()
  foreach ($k in $expected.Keys | Sort-Object) {
    if (-not (Test-Path $k)) { $bad += "MISSING $k"; continue }
    $h = (Get-FileHash $k -Algorithm MD5).Hash.ToLower()
    Write-Host ("{0,-18} {1,8} bytes  {2}  {3}" -f $k,(Get-Item $k).Length,$h,$(if($h -eq $expected[$k]){'ok'}else{'MISMATCH'}))
    if ($h -ne $expected[$k]) { $bad += "MISMATCH $k" }
  }
  if ($bad.Count) { Write-Host ''; Write-Host 'ABORT. Nothing staged:'; $bad | ForEach-Object { Write-Host "  $_" }; return }

  Write-Host ''; Write-Host 'git status (working tree):'
  git status --porcelain | ForEach-Object { Write-Host "  $_" }

  foreach ($k in $expected.Keys) { git add -- $k }
  $staged = @(git diff --cached --name-only)
  Write-Host ''; Write-Host ("staged {0} file(s):" -f $staged.Count); $staged | ForEach-Object { Write-Host "  $_" }
  if ($staged.Count -ne 2) { Write-Host 'ABORT: expected exactly 2 staged files.'; git reset; return }
  if ($staged -contains 'combined.html') { Write-Host 'ABORT: the PINNED flagship is staged.'; git reset; return }

  git commit -m "P5: magnifier, phosphor grille, print suppression, tap targets

Shift+wheel (or the chin magnifier button) zooms 1x-4x, anchored to the
pointer with 0px drift, transform-origin 0 0 so all of it stays reachable.
A fixed phosphor overlay resolves as the pitch grows, invisible at 1x.
Also: the whole layer is now suppressed in print, both chin controls are
44x44 with visible focus rings, and the warm cast moved from a blend layer
into the palette -- measured 33.30ms -> 16.70ms median scroll."
  git log -1 --pretty='%h %s'
  Write-Host ''
  Write-Host 'To undo before pushing:  git reset --hard HEAD~1'
}
