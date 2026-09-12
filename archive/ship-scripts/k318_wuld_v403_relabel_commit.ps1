# =====================================================================================
#  wuld.ink: the v4.0.3 RELABEL of the library pin (WI-K318). wuld-ink only. Run AFTER K318_efilist_commit.ps1 has printed
#  'v4.0.3 IS LIVE' (the pin tool live-fetches /combined three times and refuses unless all three serve 62c733ac).
#
#  What it does, in the site's own lane:
#   1. writes release_v4_0_3.json (repo root; gated by md5)
#   2. runs tools\library-pin.py DRY, requires GATE: GREEN; then --apply --date 2026-09-12 (operator-local; the CHANGELOG and
#      this block were cut for that date -- if the run has slipped past midnight Phoenix, stop and tell me before running)
#      -> md5 / version / byte count swept across src\**\*.html and *.js (held provenance phrases untouched; the film's
#         apparatus page EXEMPT, cccxxxvi), src\releases.json gets a new entry, src\feed.xml regenerated, tools\library-pin-state.json updated
#   3. replaces the cloned changelog summary with the v4.0.3 prose (exactly once) and regenerates feed.xml
#   4. regenerates src\search-index.json (the version string is indexed text)
#   5. DIFF-SHAPE GATE: every changed line in src\**\*.html|js must carry only the new md5 / version / bytes,
#      and every removed line the old -- or nothing is staged
#   6. stages exactly the changed files, commits, pushes, reads /library-about/ back until it says v4.0.3
#  One-liner:  Get-Content 'C:\Users\y_m_a\Downloads\Argument Library\k318\WULD_v403_relabel_commit.ps1' -Raw | Invoke-Expression
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library\k318'
  Set-Location $repo
  [Environment]::CurrentDirectory = $repo
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "ABORT: no git repo at $repo" -ForegroundColor Red; return }
  Get-ChildItem -LiteralPath (Join-Path $repo '.git') -Filter '*.lock' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  function Get-Md5 { param($p) (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }
  $py = if (Get-Command python -ErrorAction SilentlyContinue) { 'python' } elseif (Get-Command py -ErrorAction SilentlyContinue) { 'py' } else { '' }
  if ($py -eq '') { Write-Host 'ABORT: no python on PATH (the pin tool is Python). Nothing changed.' -ForegroundColor Red; return }
  $date = '2026-09-12'
  $oldMd5 = '62d1e8d86056465ebcb5daced38e0a83'; $newMd5 = '62c733ac8263e6413816cfb6d28e3b8a'

  # --- 0. where the clone is; the tree must be clean -----------------------------------------------
  $head = (git rev-parse HEAD).Trim()
  Write-Host "HEAD                : $head  $(git log -1 --pretty=%s)"
  git fetch --quiet origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: fetch failed (network?). Nothing changed.' -ForegroundColor Red; return }
  $behind = @(git log --oneline HEAD..origin/main)
  if ($behind.Count) { Write-Host ('ABORT: origin/main has ' + $behind.Count + ' commit(s) this clone does not. Nothing changed; tell me.') -ForegroundColor Red; $behind | ForEach-Object { Write-Host ('   ' + $_) }; return }
  $ahead0 = @(git log --oneline origin/main..HEAD)
  if ($ahead0.Count) { Write-Host ('ABORT: this clone is already ' + $ahead0.Count + ' commit(s) ahead of origin/main. Nothing changed; tell me.') -ForegroundColor Red; return }
  # Untracked files (another seat's drafts) are not this block's business; MODIFIED tracked files are.
  $dirty0 = @(git status --porcelain --untracked-files=no)
  if ($dirty0.Count) { Write-Host 'ABORT: tracked files are modified in the working tree (another seat mid-work?). Nothing changed:' -ForegroundColor Red; $dirty0 | ForEach-Object { Write-Host ('   ' + $_) }; return }
  $untracked = @(git status --porcelain | Where-Object { $_ -like '??*' } | ForEach-Object { Write-Host ('   untracked, left alone: ' + $_.Substring(3)) })
  $stateFile = Join-Path $repo 'tools\library-pin-state.json'
  $hState = Get-Md5 $stateFile
  Write-Host "pin-state md5       : $hState"
  # the v4.0.2 state: 19dd9e8a as the Windows working copy carries it (CRLF), ed51fa2c as the repository stores it (LF)
  if ($hState -ne '19dd9e8a81ac798e077b3a017af480aa' -and $hState -ne 'ed51fa2c4af3a498db28d6b44be8b5b0') { Write-Host 'ABORT: tools\library-pin-state.json is not the v4.0.2 state (62d1e8d8). Someone has moved the pin already, or the file was edited; tell me.' -ForegroundColor Red; return }
  $stateTxt = [IO.File]::ReadAllText($stateFile)
  if ($stateTxt -notmatch '62d1e8d86056465ebcb5daced38e0a83' -or $stateTxt -notmatch 'v4\.0\.2') { Write-Host 'ABORT: the pin state does not name 62d1e8d8 / v4.0.2. Tell me.' -ForegroundColor Red; return }
  if (Test-Path -LiteralPath (Join-Path $repo 'release_v4_0_3.json')) { Write-Host 'ABORT: release_v4_0_3.json already exists in the repo. Tell me.' -ForegroundColor Red; return }
  $bTool = (git rev-parse 'HEAD:tools/library-pin.py').Trim()
  Write-Host "HEAD:tools/library-pin.py : $bTool"

  # --- 1. the manifest, from the drop ----------------------------------------------------------------
  $src = Join-Path $drop 'release_v4_0_3.json'
  if (-not (Test-Path -LiteralPath $src)) { Write-Host "ABORT: $src missing." -ForegroundColor Red; return }
  $hMan = Get-Md5 $src; $lMan = (Get-Item -LiteralPath $src).Length
  Write-Host ("manifest   {0,7} B  md5 {1}" -f $lMan, $hMan)
  if ($hMan -ne '5633ec25430c4cbb0853906daa918ab6' -or $lMan -ne 2470) { Write-Host 'ABORT: drop release_v4_0_3.json is not the file that was written. Nothing changed.' -ForegroundColor Red; return }
  [IO.File]::Copy($src, (Join-Path $repo 'release_v4_0_3.json'), $true)

  # --- 2. the pin tool: dry run must be GREEN, then apply ----------------------------------------------
  Write-Host ''; Write-Host '---- library-pin.py (dry run) ----' -ForegroundColor Cyan
  $ErrorActionPreference = 'Continue'
  $dry = & $py tools\library-pin.py --manifest release_v4_0_3.json --date $date 2>&1
  $dry | ForEach-Object { Write-Host ('   ' + $_) }
  $green = @($dry | Where-Object { $_ -match 'GATE: GREEN' })
  if ($LASTEXITCODE -ne 0 -or $green.Count -ne 1) { Write-Host 'ABORT: the pin tool did not report GATE: GREEN (live /combined is not 62c733ac yet, or the state disagrees). Nothing committed; release_v4_0_3.json is in the working tree -- run: Remove-Item release_v4_0_3.json ; then tell me.' -ForegroundColor Red; return }
  Write-Host ''; Write-Host '---- library-pin.py --apply ----' -ForegroundColor Cyan
  $app = & $py tools\library-pin.py --manifest release_v4_0_3.json --apply --date $date 2>&1
  $app | ForEach-Object { Write-Host ('   ' + $_) }
  $okState = @($app | Where-Object { $_ -match 'state updated -> 62c733ac8263e6413816cfb6d28e3b8a' })
  if ($LASTEXITCODE -ne 0 -or $okState.Count -ne 1) { Write-Host 'ABORT: --apply did not finish (see above). The working tree may be half-swept: run git status, tell me, do not commit.' -ForegroundColor Red; return }
  $ErrorActionPreference = 'Stop'

  # --- 3. the changelog summary: replace the cloned v4.0.2 prose with the v4.0.3 prose, exactly once ----
  $swap = Get-Content -LiteralPath (Join-Path $drop 'releases_summary_swap.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  $relPath = Join-Path $repo 'src\releases.json'
  $rel = [IO.File]::ReadAllText($relPath, [Text.Encoding]::UTF8)
  $cnt = ([regex]::Matches($rel, [regex]::Escape($swap.cloned))).Count
  Write-Host "cloned summary occurrences in src\releases.json: $cnt (must be 1)"
  if ($cnt -ne 1) { Write-Host 'ABORT: the cloned summary is not present exactly once. The tree is swept but not committed; tell me (git checkout -- . reverts the sweep; Remove-Item release_v4_0_3.json).' -ForegroundColor Red; return }
  $rel = $rel.Replace($swap.cloned, $swap.new)
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [IO.File]::WriteAllText($relPath, $rel, $utf8)
  $first = (Get-Content -LiteralPath $relPath -Raw -Encoding UTF8 | ConvertFrom-Json)[0]
  Write-Host ("releases[0]         : {0}  {1}" -f $first.id, $first.date)
  if ($first.id -ne ($date + '-library-v4-0-3')) { Write-Host 'ABORT: releases[0] is not the v4.0.3 entry. Tell me.' -ForegroundColor Red; return }
  $ErrorActionPreference = 'Continue'
  & $py tools\changelog\gen_feed.py 2>&1 | ForEach-Object { Write-Host ('   ' + $_) }
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: gen_feed.py failed. Tell me.' -ForegroundColor Red; return }

  # --- 4. the search index (the version string is indexed text) ------------------------------------
  & $py tools\search-index\build_index.py --src src --out src\search-index.json 2>&1 | ForEach-Object { Write-Host ('   ' + $_) }
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: build_index.py failed. Tell me.' -ForegroundColor Red; return }
  $ErrorActionPreference = 'Stop'

  # --- 5. diff-shape gate over everything the sweep touched -------------------------------------------
  Write-Host ''; Write-Host '---- what changed ----' -ForegroundColor Cyan
  $changed = @(git status --porcelain --untracked-files=no | ForEach-Object { $_.Substring(3).Trim('"') }) + @('release_v4_0_3.json')
  $changed | ForEach-Object { Write-Host ('   ' + $_) }
  $known = @('release_v4_0_3.json', 'tools/library-pin-state.json', 'src/releases.json', 'src/feed.xml', 'src/search-index.json')
  $bad = 0
  if ($changed -contains 'src/argument-library/apparatus/index.html') { Write-Host 'ABORT: the film''s apparatus page changed -- the sweep must skip it (EXEMPT_FILES, cccxxxvi). Nothing staged; tell me (git checkout -- . reverts).' -ForegroundColor Red; return }
  foreach ($f in $changed) {
    if ($known -contains $f) { continue }
    if (-not ($f -like 'src/*.html' -or $f -like 'src/*.js')) { Write-Host "UNEXPECTED change outside the sweep's scope: $f" -ForegroundColor Red; $bad++; continue }
    $d = @(git diff -U0 -- $f)
    foreach ($ln in $d) {
      if ($ln -like '+++*' -or $ln -like '---*' -or $ln -like '@@*' -or $ln -like 'diff*' -or $ln -like 'index*') { continue }
      if ($ln -like '+*') { if (-not ($ln -match 'v4\.0\.3|62c733ac8263e6413816cfb6d28e3b8a|2,982,420|2982420')) { Write-Host "  + line without the new pin in $f : $ln" -ForegroundColor Red; $bad++ } }
      elseif ($ln -like '-*') { if (-not ($ln -match 'v4\.0\.2|62d1e8d86056465ebcb5daced38e0a83|2,974,039|2974039')) { Write-Host "  - line without the old pin in $f : $ln" -ForegroundColor Red; $bad++ } }
    }
  }
  if ($bad) { Write-Host ('ABORT: ' + $bad + ' diff line(s) are not a pin relabel. Nothing staged; tell me (git checkout -- . reverts the sweep; Remove-Item release_v4_0_3.json).') -ForegroundColor Red; return }
  foreach ($k in $known) { if (-not ($changed -contains $k)) { Write-Host "ABORT: expected $k to change and it did not. Nothing staged; tell me." -ForegroundColor Red; return } }
  Write-Host ('diff-shape gate     : every changed line is the relabel; ' + $changed.Count + ' files') -ForegroundColor Green

  git add -- $changed
  $staged = @(git diff --cached --name-only)
  if ($staged.Count -ne $changed.Count) { Write-Host ('ABORT: staged ' + $staged.Count + ' vs changed ' + $changed.Count + '. Unstaged; tell me.') -ForegroundColor Red; git reset -q; return }
  git commit -m 'v4.0.3 pin relabel (62d1e8d8 -> 62c733ac, 2,974,039 -> 2,982,420 B): library-pin.py sweep of src html/js, release_v4_0_3.json, releases.json + feed.xml, search-index regen; no content change (WI-K318)' | Out-Null
  git log -1 --pretty='%h %s'

  # --- 6. push, then read /library-about/ back ---------------------------------------------------------
  $ErrorActionPreference = 'Continue'
  Write-Host ''; Write-Host '---- push ----' -ForegroundColor Cyan
  $ahead = @(git log --oneline origin/main..HEAD)
  $ahead | ForEach-Object { Write-Host ('   ' + $_) }
  if ($ahead.Count -ne 1) { Write-Host ('ABORT: expected exactly 1 commit above origin/main, found ' + $ahead.Count + '. Not pushed; tell me.') -ForegroundColor Red; return }
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'PUSH FAILED - nothing changed on origin; the commit is local. Tell me.' -ForegroundColor Red; return }
  Write-Host ('pushed. origin/main is now ' + (git rev-parse --short origin/main)) -ForegroundColor Green
  Write-Host ''; Write-Host '---- served read-back of /library-about/ (polling up to 6 min) ----' -ForegroundColor Cyan
  $tmp = Join-Path $env:TEMP 'wuld-relabel-k318'; New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  $f = Join-Path $tmp 'about.html'; $done = $false
  for ($n = 1; $n -le 24; $n++) {
    $code = & curl.exe -sS -o $f -w '%{http_code}' "https://wuld.ink/library-about/?nocache=$([DateTime]::UtcNow.Ticks)"
    $txt = if (Test-Path -LiteralPath $f) { [IO.File]::ReadAllText($f) } else { '' }
    $new = ([regex]::Matches($txt, '62c733ac')).Count; $old = ([regex]::Matches($txt, '62d1e8d8')).Count; $v = ([regex]::Matches($txt, 'v4\.0\.3')).Count
    Write-Host ('  try {0,2}: http {1}  62c733ac x{2}  62d1e8d8 x{3}  v4.0.3 x{4}' -f $n, $code, $new, $old, $v)
    if ($code -eq '200' -and $new -ge 1 -and $old -eq 0 -and $v -ge 1) { $done = $true; break }
    Start-Sleep -Seconds 15
  }
  if (-not $done) { Write-Host 'NOT YET SERVED after 6 min: the push landed; Pages may still be building. Check the dashboard and tell me.' -ForegroundColor Red; return }
  Write-Host 'wuld.ink says v4.0.3 / 62c733ac and no longer names 62d1e8d8. Next: k318\WULD_archive_commit.ps1, then k318\WI-K318_commit.ps1 (the log).' -ForegroundColor Green
}
