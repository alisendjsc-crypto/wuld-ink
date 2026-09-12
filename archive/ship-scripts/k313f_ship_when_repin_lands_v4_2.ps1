# The Argument Library Apparatus - ship script, v4.2 (2026-09-12).
#
# Builds /argument-library/apparatus/ from the kit's Markdown (build -> wrap -> gate), commits,
# regenerates sitemap + search index, pushes, and reads the served page back against the
# committed bytes. v4.2 can RE-SHIP a reissued document: the first ship (d60ec13) assumed every
# file was new and would FAIL on a document-only reissue ("staged 2 want 5", "sitemap want +1").
# Gates: HEAD == origin/main; the shared wrap tool equals its committed blob; the marker's md5 is
# present in the render manifest (presence only, no parity - see the note below); verifier GREEN.
#
# The page is BUILT here, not copied: its bytes depend on the Markdown.
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
  # v4 (2026-09-10) is ONE cut. The film's second paragraph retires the two-cut design, and the
  # measured marker retires the wuld: group with it. The regex accepts either form; the manifest
  # check below verifies exactly the cuts the marker names, one or two, and no longer assumes two.
  $mkAll = [regex]::Matches($ap, '(?im)^\s*<!--\s*measured:\s*(v[0-9]+)\s+jsc:([0-9a-f]{32})/([0-9]+)(?:\s+wuld:([0-9a-f]{32})/([0-9]+))?\s*-->\s*$')
  $rawCount = ([regex]::Matches($ap, '(?im)^\s*<!--\s*measured:')).Count
  if ($mkAll.Count -gt 1) { Write-Host ("FAIL apparatus carries " + $mkAll.Count + " measured markers - a stale one can outrank the fresh one; the document must carry exactly one"); return }
  if ($rawCount -gt 1) { Write-Host ("FAIL apparatus carries " + $rawCount + " measured-marker lines, only " + $mkAll.Count + " of them parseable - the unparseable ones must go"); return }
  $mk = if ($mkAll.Count -eq 1) { $mkAll[0] } else { $null }
  if ($null -eq $mk -or -not $mk.Success) { $seen = ($ap -split "`n" | Where-Object { $_ -match "measured:" } | Select-Object -First 1); if ($seen) { Write-Host ("FAIL measured-marker present but unparseable: " + $seen.Trim()) } else { Write-Host "FAIL apparatus carries no <!-- measured: vN jsc:<md5>/<bytes> [wuld:<md5>/<bytes>] --> marker - it was not re-measured, or the reissue never reached this path" }; return }
  $ver = $mk.Groups[1].Value; $jsc = $mk.Groups[2].Value.ToLower()
  $wul = if ($mk.Groups[4].Success) { $mk.Groups[4].Value.ToLower() } else { $null }
  $man = $null
  foreach ($cand in @((Join-Path $k "cut\render_manifest.json"), (Join-Path $k "render_manifest.json"))) { if (Test-Path $cand) { $man = $cand; break } }
  if (-not $man) { Write-Host "FAIL no render_manifest.json in the kit - the marker cannot be checked against the step that produced the file"; return }
  $hashes = @([regex]::Matches((Get-Content -LiteralPath $man -Raw), '[0-9a-f]{32}') | ForEach-Object { $_.Value.ToLower() })
  if ($hashes -notcontains $jsc) { Write-Host ("FAIL JSC md5 in the marker (" + $jsc + ") is absent from " + $man + " - the document was measured off a render this kit did not produce"); return }
  if ($wul -and ($hashes -notcontains $wul)) { Write-Host ("FAIL W.U.L.D. md5 in the marker (" + $wul + ") is absent from " + $man + " - the document was measured off a render this kit did not produce"); return }
  # NO PARITY CHECK, and the reason is recorded because one was here for six hours. On 2026-09-12
  # this seat added "the manifest must record exactly as many renders as the marker names cuts",
  # to catch a v4 document paired with a v10 manifest. The PRESENCE check above already catches
  # that pairing -- v4's md5 was absent from v10's manifest, which is what FAIL'd -- and the
  # parity check was wrong for the case that actually arrived: the video seat shipped the
  # manifest as a SUPERSET, fifteen renders with both v10 entries preserved byte for byte, which
  # is the more honest record and which parity would have refused (15 against 1). Presence is the
  # right question: was the document measured off a render this kit produced? Nothing else.
  $nCuts = if ($wul) { 2 } else { 1 }
  if ($ap -notmatch "(?i)\bmonitor\b") { Write-Host "FAIL apparatus does not disclose the drawn monitor - the bezel is on every head-on shot and the page must say so"; return }
  Write-Host ("OK  marker " + $ver + " names " + $nCuts + " cut(s), each present in the render manifest (" + (($hashes | Measure-Object).Count) + " renders recorded); monitor disclosed")
  if ($wul) { Write-Host ("    jsc " + $jsc + "/" + $mk.Groups[3].Value + "   wuld " + $wul + "/" + $mk.Groups[5].Value) }
  else      { Write-Host ("    one cut " + $jsc + "/" + $mk.Groups[3].Value) }
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
  if ($LASTEXITCODE -ne 0) { Write-Host ""; Write-Host "HELD - the verifier is not GREEN on this Markdown (output above). Nothing committed; src/ carries the failed build until the next run overwrites it."; return }
  Write-Host "OK  apparatus gate GREEN"

  # phase 1 - the page must exist in git before gen_sitemap.py can date it.
  # Stage by name, then check the staged SET: everything staged must be one of the five, and the
  # two page files must be among them. Tools that did not change stage nothing, and that is fine;
  # a document that did not change means there is nothing to ship, and that is a FAIL.
  $five = @("src/argument-library/apparatus/index.html",
            "src/argument-library/apparatus/argument-library-apparatus.md",
            "tools/apparatus/apply_wuld_wrap.py",
            "tools/apparatus/build_libshow_apparatus.py",
            "tools/apparatus/verify_libshow_apparatus.py")
  foreach ($f in $five) { git add -- $f }
  $staged = @(git diff --cached --name-only)
  $stray  = @($staged | Where-Object { $five -notcontains $_ })
  if ($stray.Count) { Write-Host ("FAIL phase-1 staged a path outside the five: " + ($stray -join ", ")); git reset -q; return }
  if ($staged -notcontains $five[1]) { Write-Host "FAIL the Markdown in the repo equals HEAD - nothing to ship (is the kit's page\argument-library-apparatus.md the reissue?)"; git reset -q; return }
  if ($staged -notcontains $five[0]) { Write-Host "FAIL the built page equals HEAD although the Markdown changed - the build did not take"; git reset -q; return }
  $mdMd5 = Md5 "src\argument-library\apparatus\argument-library-apparatus.md"
  $first = -not (git ls-tree --name-only HEAD -- "src/argument-library/apparatus/index.html")
  if ($first) { $msg = "The Argument Library Apparatus: /argument-library/apparatus/ built from the video seat Markdown (build + wrap + gate); NO PIN" }
  else        { $msg = "The Argument Library Apparatus: reissued from the video seat Markdown " + $mdMd5 + " (build + wrap + gate); NO PIN" }
  git commit -m $msg
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL commit 1"; return }
  Write-Host ("OK  phase 1 committed (" + $staged.Count + " of 5 files changed: " + ($staged -join ", ") + ")")

  # phase 2 - the two generated files, which need phase 1 in history
  # count BEFORE the regen: this ship waits on the re-pin, so an absolute target would
  # false-fail if any other page lands in between. Assert the delta, not the total.
  $before = @(Select-String -Path "src\sitemap.xml" -Pattern "<loc>" -SimpleMatch).Count
  python tools\gen_sitemap.py --repo . --out src\sitemap.xml
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL gen_sitemap"; return }
  python tools\search-index\build_index.py --src src --out src\search-index.json
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL search index"; return }
  $locs = @(Select-String -Path "src\sitemap.xml" -Pattern "<loc>" -SimpleMatch).Count
  $wantDelta = if ($first) { 1 } else { 0 }
  if ($locs -ne $before + $wantDelta) { Write-Host "FAIL sitemap went $before -> $locs, want +$wantDelta exactly"; return }
  if (-not (Select-String -Path "src\sitemap.xml" -Pattern "argument-library/apparatus/" -SimpleMatch)) { Write-Host "FAIL page not in sitemap"; return }
  Write-Host "OK  sitemap $before -> $locs, page listed; search index regenerated"

  git add -- "src/sitemap.xml"
  git add -- "src/search-index.json"
  $staged2 = @(git diff --cached --name-only)
  $stray2  = @($staged2 | Where-Object { @("src/sitemap.xml","src/search-index.json") -notcontains $_ })
  if ($stray2.Count) { Write-Host ("FAIL phase-2 staged a path outside the two: " + ($stray2 -join ", ")); git reset -q; return }
  if ($staged2.Count -eq 0) { Write-Host "note: sitemap and search index unchanged by this reissue - no second commit" }
  else {
    git commit -m ("sitemap + search index regenerated for /argument-library/apparatus/ (" + $before + " -> " + $locs + " locs); NO PIN")
    if ($LASTEXITCODE -ne 0) { Write-Host "FAIL commit 2"; return }
    Write-Host ("OK  phase 2 committed (" + ($staged2 -join ", ") + ")")
  }

  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL push"; return }
  Write-Host "OK  pushed"

  # read-back: the served page must be the committed page, byte for byte. Cloudflare Pages serves
  # static files unchanged, so the md5s agree once the build has deployed. (v4.1 grepped "RESULT
  # OK" here - a v10 phrase v4 never carried, so it printed RESULT=0 against a "want 1".)
  Write-Host "waiting 90 s for Cloudflare Pages, then comparing the served page to the committed one..."
  Start-Sleep -Seconds 90
  $t = Join-Path $env:TEMP "apv.html"
  curl.exe -s -o $t "https://wuld.ink/argument-library/apparatus/"
  $served = Md5 $t
  $local  = Md5 "src\argument-library\apparatus\index.html"
  $h1 = @(Select-String -Path $t -Pattern "The Argument Library" -SimpleMatch).Count
  $h3 = @(Select-String -Path $t -Pattern "e654eabd" -SimpleMatch).Count
  Write-Host ("    served md5 " + $served)
  Write-Host ("    local  md5 " + $local)
  Write-Host "    title=$h1  stale-pin=$h3   (want >=1 0)"
  if ($served -eq $local) { Write-Host "OK  served page == committed page. Apparatus reissue live." }
  else { Write-Host "served page differs from the committed one - Cloudflare is probably still building; re-check in two minutes:  curl.exe -s https://wuld.ink/argument-library/apparatus/ | Select-String 're-measured 2026'" }
  Write-Host "The film is not linked from the page and the verifier asserts that (handout section 6); linking it is a handout change, not a ship-script change."
}
