# The Argument Library Apparatus - ship script.
#
# HOLD: this refuses to run while the page still quotes the PRE-SWEEP pin
# (md5 e654eabd... / 2,963,752 bytes). Handout section 5: the library is mid re-pin;
# when it lands the video seat reissues argument-library-apparatus.md with a new hash,
# byte count, frame count and duration. DROP THAT FILE IN FIRST, then run this.
#
# The page is BUILT here, not copied: its bytes depend on the reissued Markdown.
& {
  $repo = "C:\Users\y_m_a\Projects\wuld-ink"
  $k    = "C:\Users\y_m_a\Downloads\apparatus_libshow"
  if (-not (Test-Path (Join-Path $repo ".git"))) { Write-Host "FAIL no .git at $repo"; return }
  Set-Location $repo
  [Environment]::CurrentDirectory = (Get-Location).Path
  Remove-Item ".git\index.lock*" -Force -ErrorAction SilentlyContinue

  function Md5($p) { if (-not (Test-Path $p)) { return "MISSING" } ; return (Get-FileHash $p -Algorithm MD5).Hash.ToLower() }

  $head = git rev-parse HEAD 2>$null
  if ($null -eq $head) { Write-Host "FAIL rev-parse returned nothing"; return }
  git fetch origin main 2>&1 | Out-Null
  if ($head.Trim() -ne (git rev-parse origin/main).Trim()) { Write-Host "FAIL HEAD != origin - land the outstanding commit first"; return }
  Write-Host "OK  HEAD == origin == $($head.Trim())"

  # The wrap tool is shared with the two live Apparatus pages: guard its base.
  # K310: this guard is against the REPO copy, and it fires SIX LINES BEFORE the kit
  # copy is written over it below - so it never sees a kit hash and never needed one.
  # It asks one question: has a previous half-run already clobbered the working copy?
  # An allowlist answers that with a constant that goes stale on every kit reissue
  # (030f3dac matched no file on disk by K310). The committed blob answers it forever.
  git diff --quiet HEAD -- "tools/apparatus/apply_wuld_wrap.py"
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL apply_wuld_wrap.py differs from its committed blob - a previous run may have half-copied the kit; git checkout -- tools/apparatus/apply_wuld_wrap.py first"; return }
  Write-Host "OK  apply_wuld_wrap.py == committed blob (self-updating; no constant to maintain)"

  # K310i - THE READ-BACK GATE, and it now holds NO CONSTANT OF ITS OWN.
  # History: a name is a claim, a hash is a fingerprint. $EXPECT_RENDER was a version string
  # this side had no way to verify - bumped on an announcement it was a rubber stamp with a
  # version in it. The marker now carries the render md5s, and cut_libshow.py writes the same
  # two facts into the manifest from the step that PRODUCED the file. Their generator refuses
  # to emit when those disagree; this re-runs the same check AT THE HANDOFF BOUNDARY, which is
  # a different place and the one where it has actually broken - a document from one reissue
  # paired with a manifest from another arrives looking fine to both pipelines.
  # This closes doc-against-render. It does not close doc-against-what-YouTube-serves.
  $apMd = Join-Path $k "page\argument-library-apparatus.md"
  if (-not (Test-Path $apMd)) { Write-Host "FAIL apparatus markdown missing at $apMd"; return }
  $ap = Get-Content -LiteralPath $apMd -Raw
  # K310p - COUNT the markers, do not take the first. A first-match read cannot tell one marker
  # from two, so a stale marker sitting above a fresh one would certify the superseded render and
  # the gate would report PASS. The video seat fixed the applier that could emit two; this asserts
  # it at the boundary, because an upstream fix protects the pipeline that has it, not this one.
  $mkAll = [regex]::Matches($ap, '(?im)^\s*<!--\s*measured:\s*(v[0-9]+)\s+jsc:([0-9a-f]{32})/([0-9]+)\s+wuld:([0-9a-f]{32})/([0-9]+)\s*-->\s*$')
  $rawCount = ([regex]::Matches($ap, '(?im)^\s*<!--\s*measured:')).Count
  if ($mkAll.Count -gt 1) { Write-Host ("FAIL apparatus carries " + $mkAll.Count + " measured markers - a stale one can outrank the fresh one; the document must carry exactly one"); return }
  if ($rawCount -gt 1) { Write-Host ("FAIL apparatus carries " + $rawCount + " measured-marker lines, only " + $mkAll.Count + " of them parseable - the unparseable ones must go"); return }
  $mk = if ($mkAll.Count -eq 1) { $mkAll[0] } else { $null }
  if ($null -eq $mk -or -not $mk.Success) { $seen = ($ap -split "`n" | Where-Object { $_ -match "measured:" } | Select-Object -First 1); if ($seen) { Write-Host ("FAIL measured-marker present but unparseable: " + $seen.Trim()) } else { Write-Host "FAIL apparatus carries no <!-- measured: vN jsc:<md5>/<bytes> wuld:<md5>/<bytes> --> marker - it was not re-measured, or the reissue never reached this path" }; return }
  $ver = $mk.Groups[1].Value; $jsc = $mk.Groups[2].Value.ToLower(); $wul = $mk.Groups[4].Value.ToLower()
  $man = $null
  foreach ($cand in @((Join-Path $k "cut\render_manifest.json"), (Join-Path $k "render_manifest.json"))) { if (Test-Path $cand) { $man = $cand; break } }
  if (-not $man) { Write-Host "FAIL no render_manifest.json in the kit - the marker cannot be checked against the step that produced the file"; return }
  $hashes = @([regex]::Matches((Get-Content -LiteralPath $man -Raw), '[0-9a-f]{32}') | ForEach-Object { $_.Value.ToLower() })
  if ($hashes -notcontains $jsc) { Write-Host ("FAIL JSC md5 in the marker (" + $jsc + ") is absent from " + $man + " - the document was measured off a render this kit did not produce"); return }
  if ($hashes -notcontains $wul) { Write-Host ("FAIL W.U.L.D. md5 in the marker (" + $wul + ") is absent from " + $man + " - the document was measured off a render this kit did not produce"); return }
  if ($ap -notmatch "(?i)\bmonitor\b") { Write-Host "FAIL apparatus does not disclose the drawn monitor - the bezel is on every head-on shot and the page must say so"; return }
  Write-Host ("OK  marker " + $ver + " agrees with the render manifest on both cuts; monitor disclosed")
  Write-Host ("    jsc " + $jsc + "/" + $mk.Groups[3].Value + "   wuld " + $wul + "/" + $mk.Groups[5].Value)
  foreach ($stale in @("227 of 255", "14,348", "16,400")) { if ($ap -match [regex]::Escape($stale)) { Write-Host ("WARN a known v7 figure survives in a doc marked " + $ver + ": " + $stale + " - advisory only, verify it was re-measured rather than carried") } }

  New-Item -ItemType Directory -Force -Path "src\argument-library\apparatus" | Out-Null
  Copy-Item "$k\tools\apply_wuld_wrap.py"          "tools\apparatus\apply_wuld_wrap.py" -Force
  Copy-Item "$k\tools\build_libshow_apparatus.py"  "tools\apparatus\build_libshow_apparatus.py" -Force
  Copy-Item "$k\tools\verify_libshow_apparatus.py" "tools\apparatus\verify_libshow_apparatus.py" -Force
  Copy-Item "$k\page\argument-library-apparatus.md" "src\argument-library\apparatus\argument-library-apparatus.md" -Force

  $art = Join-Path $env:TEMP "libshow-artifact.html"
  python tools\apparatus\build_libshow_apparatus.py --in "src\argument-library\apparatus\argument-library-apparatus.md" --out $art
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL build"; return }
  python tools\apparatus\apply_wuld_wrap.py --in $art --variant libshow --out "src\argument-library\apparatus\index.html"
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL wrap"; return }

  # THE HOLD. Refuses while the page still quotes the pre-sweep pin.
  python tools\apparatus\verify_libshow_apparatus.py --md "src\argument-library\apparatus\argument-library-apparatus.md" --page "src\argument-library\apparatus\index.html" --dot "src\illogically-is\dot\apparatus\index.html" --require-repin
  if ($LASTEXITCODE -ne 0) { Write-Host ""; Write-Host "HELD - the Markdown is still the pre-sweep one. Drop in the seat's reissue and re-run."; return }
  Write-Host "OK  apparatus gate GREEN, re-pin confirmed"

  # phase 1 - the page must exist in git before gen_sitemap.py can date it
  git add "src/argument-library/apparatus/index.html"
  git add "src/argument-library/apparatus/argument-library-apparatus.md"
  git add "tools/apparatus/apply_wuld_wrap.py"
  git add "tools/apparatus/build_libshow_apparatus.py"
  git add "tools/apparatus/verify_libshow_apparatus.py"
  $staged = @(git diff --cached --name-only).Count
  if ($staged -ne 5) { Write-Host "FAIL phase-1 staged $staged want 5"; git diff --cached --name-only; return }
  git commit -m "The Argument Library Apparatus: /argument-library/apparatus/ built from the video seat's Markdown (build + wrap + gate), shipped after the library re-pin; NO PIN"
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL commit 1"; return }
  Write-Host "OK  phase 1 committed (5 files)"

  # phase 2 - the two generated files, which need phase 1 in history
  # count BEFORE the regen: this ship waits on the re-pin, so an absolute target would
  # false-fail if any other page lands in between. Assert the delta, not the total.
  $before = @(Select-String -Path "src\sitemap.xml" -Pattern "<loc>" -SimpleMatch).Count
  python tools\gen_sitemap.py --repo . --out src\sitemap.xml
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL gen_sitemap"; return }
  python tools\search-index\build_index.py --src src --out src\search-index.json
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL search index"; return }
  $locs = @(Select-String -Path "src\sitemap.xml" -Pattern "<loc>" -SimpleMatch).Count
  if ($locs -ne $before + 1) { Write-Host "FAIL sitemap went $before -> $locs, want +1 exactly"; return }
  if (-not (Select-String -Path "src\sitemap.xml" -Pattern "argument-library/apparatus/" -SimpleMatch)) { Write-Host "FAIL page not in sitemap"; return }
  Write-Host "OK  sitemap $before -> $locs, page listed; search index regenerated"

  git add "src/sitemap.xml"
  git add "src/search-index.json"
  $staged2 = @(git diff --cached --name-only).Count
  if ($staged2 -ne 2) { Write-Host "FAIL phase-2 staged $staged2 want 2"; git diff --cached --name-only; return }
  git commit -m "sitemap + search index regenerated for /argument-library/apparatus/ (66 -> 67 locs); NO PIN"
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL commit 2"; return }

  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL push"; return }
  Write-Host "OK  pushed"

  Start-Sleep -Seconds 75
  $t = Join-Path $env:TEMP "apv"
  curl.exe -s -o $t "https://wuld.ink/argument-library/apparatus/"
  $h1 = @(Select-String -Path $t -Pattern "The Argument Library" -SimpleMatch).Count
  $h2 = @(Select-String -Path $t -Pattern "RESULT OK" -SimpleMatch).Count
  $h3 = @(Select-String -Path $t -Pattern "e654eabd" -SimpleMatch).Count
  Write-Host "    served page: title=$h1  RESULT=$h2  stale-pin=$h3   (want >=1 1 0)"
  Write-Host "Apparatus done. The film itself is still unlinked - that line goes in when it is public."
}
