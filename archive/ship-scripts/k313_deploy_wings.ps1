& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\efilist-argument-library'
  Set-Location $repo

  # --- 0. this is the DEPLOY repo and the PINNED FLAGSHIP lives in it ----------
  #     combined.html at the root is v4.0.1 and is NOT touched by this change.
  #     If it appears in the staged list below, the block aborts.
  $expected = @{
    'wuld-layer.css'                  = '79d62c20edd0a0dfced3669159099b8d'
    'wuld-layer.js'                   = '9ea8cef0ceed170525950b40f21ee654'
    'right-to-die/combined.html'      = 'e8df1c1289556324c8f8b08930a2cfdd'
    'abortion/combined.html'          = '36018560001d4663112bf7dbf38dd708'
    'veganism/combined.html'          = 'f0e560868dab622251fb9bb019e25724'
    'transgenderism/combined.html'    = '48b4844b847f2c2c4fcb8593b260fb9d'
    'anthropocentrism/combined.html'  = '87bb91c6f440c50f47dd45ace53d9122'
    'libraries/index.html'            = '4497457a0152e6b537c190cf8132ac3b'
    'troubleshooting/index.html'      = '20a20a36163e2096cf9c8e79c3032096'
  }

  # --- 1. every file must be exactly what was measured -------------------------
  $bad = @()
  foreach ($k in $expected.Keys | Sort-Object) {
    if (-not (Test-Path $k)) { $bad += "MISSING $k"; continue }
    $h = (Get-FileHash $k -Algorithm MD5).Hash.ToLower()
    $ok = ($h -eq $expected[$k])
    Write-Host ("{0,-34} {1,8} bytes  {2}  {3}" -f $k,(Get-Item $k).Length,$h,$(if($ok){'ok'}else{'MISMATCH'}))
    if (-not $ok) { $bad += "MISMATCH $k" }
  }
  if ($bad.Count) { Write-Host ''; Write-Host 'ABORT. Nothing staged:'; $bad | ForEach-Object { Write-Host "  $_" }; return }

  # --- 2. show what git thinks changed, before staging anything ----------------
  Write-Host ''; Write-Host 'git status (working tree):'
  git status --porcelain | ForEach-Object { Write-Host "  $_" }

  # --- 3. explicit stage. NEVER git add -u -------------------------------------
  foreach ($k in $expected.Keys) { git add -- $k }
  $staged = @(git diff --cached --name-only)
  Write-Host ''; Write-Host ("staged {0} file(s):" -f $staged.Count)
  $staged | ForEach-Object { Write-Host "  $_" }

  # --- 4. gates: exactly our nine, and the pinned flagship is not among them ----
  if ($staged.Count -ne 9) { Write-Host 'ABORT: expected exactly 9 staged files.'; git reset; return }
  if ($staged -contains 'combined.html') { Write-Host 'ABORT: the PINNED flagship is staged. Not committing.'; git reset; return }

  git commit -m "P5: shared presentation + cosmetic layer on the wings

Palette and type scale unified to the flagship's, and the bezel/VFX layer
integrated. Measured across 25 surface-mode cells: 0 text elements below
WCAG AA (was 68.9-89.9% failing in standard), text under 10px down from
71.4% to 2.8% on the largest wing, CLS 0.000, zero horizontal overflow at
1440/1024/768/420px. The pinned flagship is untouched."
  git log -1 --pretty='%h %s'
  Write-Host ''
  Write-Host 'To undo before pushing:  git reset --hard HEAD~1'
}
