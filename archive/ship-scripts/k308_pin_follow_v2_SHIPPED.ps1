# wuld.ink v4.0.1 pin move -- the work the flagship re-pin owes. NO PIN of its own.
# v2 (K308 audit). Changes from v1, each with a reason:
#   +1 file  src\components\mobile-nav.js -- "EFIList v4.0.0" reaches 70 pages' mobile nav.
#            It is a LIVE claim, not provenance, and v1 could not see it: the sweep and
#            tools/library-pin.py both glob src/**/*.html only.  (ccxciii)
#   +scope   tools/library-pin.py now globs html + js, so the next pin move catches this
#            class without anyone remembering it.  (the same promise HOLD_VERSION makes)
#   ~gate    library-pin-state.json is gated on PARSED FIELDS, not byte-md5: it is a
#            Windows-tool-rewritten JSON, disk is CRLF and the blob is LF, and a byte gate
#            silently depends on which one you are looking at.  (K219)
#   ~gate    version discrimination asserts EXACT measured counts (23 moved / 14 held),
#            not ">= 1".  A gate that cannot fail is not a gate.  (cclxxxix)
#   ~verb    Copy-Item, not Move-Item: an abort after a Move consumes the kit, and the kit
#            is what makes the run re-runnable.  Re-run is: git checkout -- src tools ;
#            Remove-Item release_v4_0_1.json -Force
& {
  $repo = "C:\Users\y_m_a\Projects\wuld-ink"
  $k    = "C:\Users\y_m_a\Downloads\v4_0_1_pin"
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

  # the library pin must ALREADY be live -- this repo only ever follows it
  $t = Join-Path $env:TEMP "pinchk"
  curl.exe -s -o $t "https://library.wuld.ink/combined"
  $lm = Md5 $t
  if ($lm -ne "9d13359e305c6caa3ae64759f3dcc0e6") { Write-Host "FAIL live library is $lm, not 9d13359e -- do not advance the stated pin ahead of the artifact"; return }
  Write-Host "OK  live library == 9d13359e (the pin this repo is about to state)"

  $bases = @{}
  $bases["src\argument-library\index.html"] = "1e4c2e271ca8b790549da2a958d51957"
  $bases["src\chat\index.html"] = "1ea1cebdb162ddd5cde5ede2095145f6"
  $bases["src\components\mobile-nav.js"] = "73742bb782743af369256248c95ce49f"
  $bases["src\console\index.html"] = "59fa4e741894df896990d39063d727ed"
  $bases["src\contact\index.html"] = "64f95065df4f01d9898868917a4e3607"
  $bases["src\donations\index.html"] = "815e9854460220596a19f4b82f7e4a02"
  $bases["src\feed.xml"] = "aff10731e2ca08971c78ee1db12ac5cb"
  $bases["src\frame\index.html"] = "9ea9d5bb6559600564c28b11b0807be8"
  $bases["src\index.html"] = "ef24e1747bf9bfaccf1661d7e4af112d"
  $bases["src\library-about\index.html"] = "e53267bb14a461c73ddf91037debeb41"
  $bases["src\notes\index.html"] = "45e6632f0c0a37f9a9d32f98befb5e77"
  $bases["src\recommendations\index.html"] = "61b62f385a5be5b0f40efaff17e8cccb"
  $bases["src\releases.json"] = "93d2e054b22a7e6da077bebb6ea5942d"
  $bases["src\search-index.json"] = "51ce5c50cae4d211675b3575a4c23e99"
  $bases["src\troubleshooting\index.html"] = "c2379e813d3eb551442f2086c590cc38"
  $bases["tools\library-pin.py"] = "516ad53d633acf7cabbecb604c3c1ef3"
  foreach ($p in $bases.Keys) { $m = Md5 $p ; if ($m -ne $bases[$p]) { Write-Host "FAIL base $p"; Write-Host "     got  $m"; Write-Host "     want $($bases[$p])"; return } }
  Write-Host "OK  16 base files match HEAD (byte)"

  # pin-state: parsed fields, NOT byte-md5 (K219 -- disk CRLF vs blob LF)
  $ps0 = Get-Content "tools\library-pin-state.json" -Raw | ConvertFrom-Json
  if ($ps0.md5 -ne "e654eabd32fa95e5969d49e6eb15aa87") { Write-Host "FAIL pin-state md5 is $($ps0.md5), want e654eabd..."; return }
  if ($ps0.version -ne "v4.0.0") { Write-Host "FAIL pin-state version is $($ps0.version), want v4.0.0"; return }
  if ($ps0.bytes -ne 2963752) { Write-Host "FAIL pin-state bytes is $($ps0.bytes), want 2963752"; return }
  Write-Host "OK  pin-state base == v4.0.0 / e654eabd / 2963752 (parsed, line-ending agnostic)"

  $side = @{}
  $side["$k\files\src~argument-library~index.html"] = "3dda2005c0481a7385f3f2ebacf8bdfa"
  $side["$k\files\src~chat~index.html"] = "2ddbff2224dcd85c6d7dcab304bd33bf"
  $side["$k\files\src~components~mobile-nav.js"] = "3950140f1e96e6b088b31965b05ec092"
  $side["$k\files\src~console~index.html"] = "a68456dd9438d682745e93be09c2e69d"
  $side["$k\files\src~contact~index.html"] = "838681fb4ad656a1aa505856a746beeb"
  $side["$k\files\src~donations~index.html"] = "7be4f02e34a7552f03085c36c88e1d0a"
  $side["$k\files\src~feed.xml"] = "8ec4ee9589392055125cfd9018587f25"
  $side["$k\files\src~frame~index.html"] = "76c38bf65982aa8f9fecd1bb682e3d39"
  $side["$k\files\src~index.html"] = "509c1fede5f48768501bd5b991c3c2eb"
  $side["$k\files\src~library-about~index.html"] = "8e6d983f60acd8f8f1f07ec5f9809929"
  $side["$k\files\src~notes~index.html"] = "7e46fa6271be3f1ff59bf182bd9de200"
  $side["$k\files\src~recommendations~index.html"] = "4db37013af1c4cb6e01de4dd2cabb4a0"
  $side["$k\files\src~releases.json"] = "ace1602091f55627d896260a0996d6cd"
  $side["$k\files\src~search-index.json"] = "b23566fa5b859b3de8bcbf0211c0b9c7"
  $side["$k\files\src~troubleshooting~index.html"] = "221a66f8c04c237741db2c4d69ba60bf"
  $side["$k\files\tools~library-pin-state.json"] = "26095b5f4137469db25b9e1885a842cb"
  $side["$k\files\tools~library-pin.py"] = "b92fcca89a33d6863c48ded13195d9db"
  $side["$k\files\release_v4_0_1.json"] = "61e90092a0b398fa04de79db0ba161c7"
  foreach ($p in $side.Keys) { $m = Md5 $p ; if ($m -ne $side[$p]) { Write-Host "FAIL sidecar $p"; Write-Host "     got  $m"; Write-Host "     want $($side[$p])"; return } }
  Write-Host "OK  18 sidecars byte-exact"

  Copy-Item "$k\files\src~argument-library~index.html" "src\argument-library\index.html" -Force
  Copy-Item "$k\files\src~chat~index.html" "src\chat\index.html" -Force
  Copy-Item "$k\files\src~components~mobile-nav.js" "src\components\mobile-nav.js" -Force
  Copy-Item "$k\files\src~console~index.html" "src\console\index.html" -Force
  Copy-Item "$k\files\src~contact~index.html" "src\contact\index.html" -Force
  Copy-Item "$k\files\src~donations~index.html" "src\donations\index.html" -Force
  Copy-Item "$k\files\src~feed.xml" "src\feed.xml" -Force
  Copy-Item "$k\files\src~frame~index.html" "src\frame\index.html" -Force
  Copy-Item "$k\files\src~index.html" "src\index.html" -Force
  Copy-Item "$k\files\src~library-about~index.html" "src\library-about\index.html" -Force
  Copy-Item "$k\files\src~notes~index.html" "src\notes\index.html" -Force
  Copy-Item "$k\files\src~recommendations~index.html" "src\recommendations\index.html" -Force
  Copy-Item "$k\files\src~releases.json" "src\releases.json" -Force
  Copy-Item "$k\files\src~search-index.json" "src\search-index.json" -Force
  Copy-Item "$k\files\src~troubleshooting~index.html" "src\troubleshooting\index.html" -Force
  Copy-Item "$k\files\tools~library-pin-state.json" "tools\library-pin-state.json" -Force
  Copy-Item "$k\files\tools~library-pin.py" "tools\library-pin.py" -Force
  Copy-Item "$k\files\release_v4_0_1.json" "release_v4_0_1.json" -Force

  $res = @{}
  $res["src\argument-library\index.html"] = "3dda2005c0481a7385f3f2ebacf8bdfa"
  $res["src\chat\index.html"] = "2ddbff2224dcd85c6d7dcab304bd33bf"
  $res["src\components\mobile-nav.js"] = "3950140f1e96e6b088b31965b05ec092"
  $res["src\console\index.html"] = "a68456dd9438d682745e93be09c2e69d"
  $res["src\contact\index.html"] = "838681fb4ad656a1aa505856a746beeb"
  $res["src\donations\index.html"] = "7be4f02e34a7552f03085c36c88e1d0a"
  $res["src\feed.xml"] = "8ec4ee9589392055125cfd9018587f25"
  $res["src\frame\index.html"] = "76c38bf65982aa8f9fecd1bb682e3d39"
  $res["src\index.html"] = "509c1fede5f48768501bd5b991c3c2eb"
  $res["src\library-about\index.html"] = "8e6d983f60acd8f8f1f07ec5f9809929"
  $res["src\notes\index.html"] = "7e46fa6271be3f1ff59bf182bd9de200"
  $res["src\recommendations\index.html"] = "4db37013af1c4cb6e01de4dd2cabb4a0"
  $res["src\releases.json"] = "ace1602091f55627d896260a0996d6cd"
  $res["src\search-index.json"] = "b23566fa5b859b3de8bcbf0211c0b9c7"
  $res["src\troubleshooting\index.html"] = "221a66f8c04c237741db2c4d69ba60bf"
  $res["tools\library-pin-state.json"] = "26095b5f4137469db25b9e1885a842cb"
  $res["tools\library-pin.py"] = "b92fcca89a33d6863c48ded13195d9db"
  $res["release_v4_0_1.json"] = "61e90092a0b398fa04de79db0ba161c7"
  foreach ($p in $res.Keys) { $m = Md5 $p ; if ($m -ne $res[$p]) { Write-Host "FAIL result $p"; Write-Host "     got  $m"; Write-Host "     want $($res[$p])"; Write-Host "     RECOVER: git checkout -- src tools ; Remove-Item release_v4_0_1.json -Force"; return } }
  Write-Host "OK  18 result files byte-exact"

  # ---- the discrimination, asserted on the shipped tree, EXACT ----
  $moved  = @(Get-ChildItem src -Recurse -Include *.html | Select-String -Pattern "v4.0.1" -SimpleMatch).Count
  $held   = @(Get-ChildItem src -Recurse -Include *.html | Select-String -Pattern "v4.0.0" -SimpleMatch).Count
  $oldmd5 = @(Get-ChildItem src -Recurse -Include *.html | Select-String -Pattern "e654eabd" -SimpleMatch).Count
  $newmd5 = @(Select-String -Path "src\library-about\index.html" -Pattern "9d13359e305c6caa3ae64759f3dcc0e6" -SimpleMatch).Count
  $jsold  = @(Select-String -Path "src\components\mobile-nav.js" -Pattern "v4.0.0" -SimpleMatch).Count
  $jsnew  = @(Select-String -Path "src\components\mobile-nav.js" -Pattern "v4.0.1" -SimpleMatch).Count
  $bad = 0
  if ($oldmd5 -ne 0) { Write-Host "FAIL superseded md5 still in src html: $oldmd5 (want 0)"; $bad = 1 }
  if ($newmd5 -lt 1) { Write-Host "FAIL library-about does not state the new md5"; $bad = 1 }
  if ($moved -ne 23) { Write-Host "FAIL v4.0.1 lines in src html = $moved (want 23)"; $bad = 1 }
  if ($held -ne 14)  { Write-Host "FAIL v4.0.0 provenance lines HELD = $held (want 14: 6 violence-as-reductio, 6 why-not-suicide, 1 coda, 1 glossary/labor-sine-fructu)"; $bad = 1 }
  if ($jsold -ne 0)  { Write-Host "FAIL mobile-nav.js still states v4.0.0"; $bad = 1 }
  if ($jsnew -ne 1)  { Write-Host "FAIL mobile-nav.js v4.0.1 lines = $jsnew (want 1)"; $bad = 1 }
  if ($bad -ne 0) { Write-Host "     RECOVER: git checkout -- src tools ; Remove-Item release_v4_0_1.json -Force"; return }
  Write-Host "OK  version: $moved html line(s) at v4.0.1, $held HELD as provenance, $jsnew js line moved; superseded md5 gone"

  git add "src/argument-library/index.html" "src/chat/index.html" "src/components/mobile-nav.js" "src/console/index.html" "src/contact/index.html" "src/donations/index.html" "src/feed.xml" "src/frame/index.html" "src/index.html" "src/library-about/index.html" "src/notes/index.html" "src/recommendations/index.html" "src/releases.json" "src/search-index.json" "src/troubleshooting/index.html" "tools/library-pin-state.json" "tools/library-pin.py" "release_v4_0_1.json"
  $staged = @(git diff --cached --name-only).Count
  if ($staged -ne 18) { Write-Host "FAIL staged $staged want 18"; git diff --cached --name-only; return }
  Write-Host "OK  staged $staged"

  git commit -m "wuld.ink follows the v4.0.1 library pin: e654eabd -> 9d13359e, 2,963,752 -> 2,963,789, version label across the site, changelog entry + feed + search index. 14 version mentions HELD as provenance - the objection-page extracts name the tag they were taken at and were never re-derived. ALSO src/components/mobile-nav.js, which reached 70 pages' mobile nav stating 'EFIList v4.0.0' and survived the sweep silently because both the sweep and tools/library-pin.py globbed src html only; that tool now scans html + js, so the next move catches the class without remembering it. pin-state gated on parsed fields, not byte-md5 (CRLF disk vs LF blob). objections-index re-vendor verified a no-op. NO PIN"
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL commit"; return }
  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host "FAIL push"; return }
  Write-Host "OK  pushed"

  Start-Sleep -Seconds 75
  curl.exe -s -o $t "https://wuld.ink/library-about/"
  $a = @(Select-String -Path $t -Pattern "9d13359e305c6caa3ae64759f3dcc0e6" -SimpleMatch).Count
  $b = @(Select-String -Path $t -Pattern "e654eabd" -SimpleMatch).Count
  $c = @(Select-String -Path $t -Pattern "2,963,789" -SimpleMatch).Count
  Write-Host "    /library-about/        new-md5=$a  stale-md5=$b  new-bytes=$c   (want >=1 0 >=1)"
  curl.exe -s -o $t "https://wuld.ink/changelog/"
  $d = @(Select-String -Path $t -Pattern "v4.0.1" -SimpleMatch).Count
  Write-Host "    /changelog/            v4.0.1 mentions=$d   (want >=1)"
  curl.exe -s -o $t "https://wuld.ink/components/mobile-nav.js?v=K284"
  $e = @(Select-String -Path $t -Pattern "EFIList v4.0.1" -SimpleMatch).Count
  $f = @(Select-String -Path $t -Pattern "EFIList v4.0.0" -SimpleMatch).Count
  Write-Host "    mobile-nav.js (edge)   v4.0.1=$e  v4.0.0=$f   (want 1 0; ?v= HELD at K284 by design - a returning browser keeps the old copy for up to the 4h max-age, which is the accepted cost of not sweeping 70 pages for a label)"
  Write-Host "v4.0.1 pin follow-through done."
}
