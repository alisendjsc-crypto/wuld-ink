# efilist v4.0.1 — display-string sweep + re-pin.  *** THIS MOVES THE FLAGSHIP PIN. ***
# pin == live.  After it lands, wuld-ink owes a search-index regen + objection re-vendor.
& {
  $repo = "C:\Users\y_m_a\Projects\efilist-argument-library"
  $k    = "C:\Users\y_m_a\Downloads\v4_0_1_sweep"
  if (-not (Test-Path (Join-Path $repo ".git"))) { Write-Host "FAIL no .git at $repo"; return }
  Set-Location $repo
  [Environment]::CurrentDirectory = (Get-Location).Path
  Remove-Item ".git\index.lock*" -Force -ErrorAction SilentlyContinue

  function Md5($p) { if (-not (Test-Path $p)) { return "MISSING" } ; return (Get-FileHash $p -Algorithm MD5).Hash.ToLower() }

  $head = git rev-parse HEAD 2>$null
  if ($null -eq $head) { Write-Host "FAIL rev-parse returned nothing"; return }
  git fetch origin main 2>&1 | Out-Null
  if ($head.Trim() -ne (git rev-parse origin/main).Trim()) { Write-Host "FAIL HEAD != origin"; return }
  Write-Host "OK  HEAD == origin == $($head.Trim())"

  # ---- base guards: order section 0.2 is the load-bearing one ----
  $bases = @{}
  $bases["combined.html"]                        = "e654eabd32fa95e5969d49e6eb15aa87"
  $bases["README.md"]                            = "5d10aa31b32f9271007fc5579ea59984"
  $bases["CHANGELOG.md"]                         = "7efe27c9d0e045989aaab0a9a1672f33"
  $bases["efilist_argument_library_v4_0_0.json"] = "6ee1f6f31e0f012db0d58cae4f912fcb"
  $bases["libraries\index.html"]                 = "97880c375311ea05380ec1d7a186e36f"
  foreach ($p in $bases.Keys) { $m = Md5 $p ; if ($m -ne $bases[$p]) { Write-Host "FAIL base $p"; Write-Host "     got  $m"; Write-Host "     want $($bases[$p])"; return } }
  Write-Host "OK  5 base files match HEAD (combined.html is the pre-sweep pin e654eabd)"

  # ---- sidecar guards ----
  $side = @{}
  $side["$k\files\combined.html"]                        = "9d13359e305c6caa3ae64759f3dcc0e6"
  $side["$k\files\README.md"]                            = "aedc045436ab6b6d11cabbb57f45c5d3"
  $side["$k\files\CHANGELOG.md"]                         = "494ca165bd6343adddb925a3a8cfcbcd"
  $side["$k\files\efilist_argument_library_v4_0_0.json"] = "ace3f963833eee26d6578a08769872ee"
  $side["$k\files\libraries_index.html"]                 = "b4e4f2d4d312d97346fbe3d4a6919890"
  $side["$k\tools\sweep_v4_0_1.py"]                      = "d448e7cbfe5697d1fc4d347a055ccea9"
  $side["$k\tools\restamp_v4_0_1.py"]                    = "b1b066f8ba283fa8f80ab0364523f9f5"
  $side["$k\tools\verify_v4_0_1.py"]                     = "705c4e20fcea02e86deff5a20a5d2be1"
  foreach ($p in $side.Keys) { $m = Md5 $p ; if ($m -ne $side[$p]) { Write-Host "FAIL sidecar $p"; Write-Host "     got  $m"; Write-Host "     want $($side[$p])"; return } }
  Write-Host "OK  8 sidecars byte-exact"

  New-Item -ItemType Directory -Force -Path "tools" | Out-Null
  Move-Item "$k\files\combined.html"                        "combined.html" -Force
  Move-Item "$k\files\README.md"                            "README.md" -Force
  Move-Item "$k\files\CHANGELOG.md"                         "CHANGELOG.md" -Force
  Move-Item "$k\files\efilist_argument_library_v4_0_0.json" "efilist_argument_library_v4_0_0.json" -Force
  Move-Item "$k\files\libraries_index.html"                 "libraries\index.html" -Force
  Move-Item "$k\tools\sweep_v4_0_1.py"                      "tools\sweep_v4_0_1.py" -Force
  Move-Item "$k\tools\restamp_v4_0_1.py"                    "tools\restamp_v4_0_1.py" -Force
  Move-Item "$k\tools\verify_v4_0_1.py"                     "tools\verify_v4_0_1.py" -Force

  if ((Md5 "combined.html") -ne "9d13359e305c6caa3ae64759f3dcc0e6") { Write-Host "FAIL result combined.html"; return }
  Write-Host "OK  result files in place; combined.html == 9d13359e"

  # ---- the complete post-mutation gate, BEFORE commit (it diffs against HEAD, which is
  # still the pre-sweep pin). Stronger than the order's section-3 greps: those prove the
  # named strings moved, not that NOTHING ELSE did. Dry-run proved the greps pass a file
  # with an unintended one-byte change at L2041 while this gate names it and fails.
  python tools\verify_v4_0_1.py
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL v4.0.1 gate - DO NOT SHIP"; return }
  Write-Host "OK  v4.0.1 gate GREEN - exactly 7 loci differ, L1722 held, literals frozen"

  git add "combined.html" "README.md" "CHANGELOG.md" "efilist_argument_library_v4_0_0.json" "libraries/index.html" "tools/sweep_v4_0_1.py" "tools/restamp_v4_0_1.py" "tools/verify_v4_0_1.py"
  $staged = @(git diff --cached --name-only).Count
  if ($staged -ne 8) { Write-Host "FAIL staged $staged want 8"; git diff --cached --name-only; return }
  Write-Host "OK  staged 8"

  git commit -m "v4.0.1 display-string sweep + re-pin: seven loci in combined.html (line-indexed, per-line anchor asserted), README grade line and pin table, front-door badge, corpus version field; L1722 and the 35-mechanism count HELD; no content change; md5 e654eabd -> 9d13359e"
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL commit"; return }
  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL push"; return }
  Write-Host "OK  pushed"

  Start-Sleep -Seconds 90

  # ---- pin == live: verify SERVED BYTES, never a version string ----
  $t = Join-Path $env:TEMP "v401"
  curl.exe -s -o $t "https://library.wuld.ink/combined"
  $m = Md5 $t
  $b = (Get-Item $t).Length
  if ($m -eq "9d13359e305c6caa3ae64759f3dcc0e6" -and $b -eq 2963789) {
    Write-Host "OK  PIN == LIVE  served md5 $m  $b bytes"
  } else {
    Write-Host "WARN served md5 $m / $b bytes - want 9d13359e305c6caa3ae64759f3dcc0e6 / 2963789 (edge may be cold; re-run in 2 min)"
  }
  Write-Host ""
  Write-Host "ATTESTATION (five fields, one unit):"
  Write-Host "  new_md5:        9d13359e305c6caa3ae64759f3dcc0e6"
  Write-Host "  new_byte_count: 2963789"
  Write-Host "  release:        v4.0.1"
  Write-Host "  swept_loci:     L1650, L1652, L1727 x2, L1783, L1873, L2469, L10536"
  Write-Host "  l1722_status:   UNTOUCHED - verified, count == 1"
  Write-Host "  superseded:     e654eabd32fa95e5969d49e6eb15aa87 / 2,963,752"
  Write-Host ""
  Write-Host "OWED NEXT, same session: wuld-ink search-index regen + objection re-vendor (the pin moved)."
}
