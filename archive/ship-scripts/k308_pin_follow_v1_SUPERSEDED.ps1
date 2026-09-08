# wuld.ink v4.0.1 pin move — the work the flagship re-pin owes. NO PIN of its own.
# The library pin already moved (efilist e253f23, PIN == LIVE). This advances wuld.ink's
# stated pin to match: md5, byte count, version label, plus the changelog entry, the feed
# and the search index. 14 version mentions are HELD as provenance and must not move —
# that rule now lives in tools/library-pin.py, not in someone's head.
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

  # the library pin must ALREADY be live — this repo only ever follows it
  $t = Join-Path $env:TEMP "pinchk"
  curl.exe -s -o $t "https://library.wuld.ink/combined"
  $lm = Md5 $t
  if ($lm -ne "9d13359e305c6caa3ae64759f3dcc0e6") { Write-Host "FAIL live library is $lm, not 9d13359e — do not advance the stated pin ahead of the artifact"; return }
  Write-Host "OK  live library == 9d13359e (the pin this repo is about to state)"

  $bases = @{}
  $bases["src\argument-library\index.html"] = "1e4c2e271ca8b790549da2a958d51957"
  $bases["src\chat\index.html"] = "1ea1cebdb162ddd5cde5ede2095145f6"
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
  $bases["tools\library-pin-state.json"] = "f273d0b570cbd83055c48cfa6cd9d9ba"
  $bases["tools\library-pin.py"] = "516ad53d633acf7cabbecb604c3c1ef3"
  foreach ($p in $bases.Keys) { $m = Md5 $p ; if ($m -ne $bases[$p]) { Write-Host "FAIL base $p"; Write-Host "     got  $m"; Write-Host "     want $($bases[$p])"; return } }
  Write-Host "OK  16 base files match HEAD"

  $side = @{}
  $side["$k\files\src~argument-library~index.html"] = "3dda2005c0481a7385f3f2ebacf8bdfa"
  $side["$k\files\src~chat~index.html"] = "2ddbff2224dcd85c6d7dcab304bd33bf"
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
  $side["$k\files\tools~library-pin.py"] = "a0679594ef0a550e7895998a16a7682c"
  $side["$k\files\release_v4_0_1.json"] = "61e90092a0b398fa04de79db0ba161c7"
  foreach ($p in $side.Keys) { $m = Md5 $p ; if ($m -ne $side[$p]) { Write-Host "FAIL sidecar $p"; Write-Host "     got  $m"; Write-Host "     want $($side[$p])"; return } }
  Write-Host "OK  17 sidecars byte-exact"

  Move-Item "$k\files\src~argument-library~index.html" "src\argument-library\index.html" -Force
  Move-Item "$k\files\src~chat~index.html" "src\chat\index.html" -Force
  Move-Item "$k\files\src~console~index.html" "src\console\index.html" -Force
  Move-Item "$k\files\src~contact~index.html" "src\contact\index.html" -Force
  Move-Item "$k\files\src~donations~index.html" "src\donations\index.html" -Force
  Move-Item "$k\files\src~feed.xml" "src\feed.xml" -Force
  Move-Item "$k\files\src~frame~index.html" "src\frame\index.html" -Force
  Move-Item "$k\files\src~index.html" "src\index.html" -Force
  Move-Item "$k\files\src~library-about~index.html" "src\library-about\index.html" -Force
  Move-Item "$k\files\src~notes~index.html" "src\notes\index.html" -Force
  Move-Item "$k\files\src~recommendations~index.html" "src\recommendations\index.html" -Force
  Move-Item "$k\files\src~releases.json" "src\releases.json" -Force
  Move-Item "$k\files\src~search-index.json" "src\search-index.json" -Force
  Move-Item "$k\files\src~troubleshooting~index.html" "src\troubleshooting\index.html" -Force
  Move-Item "$k\files\tools~library-pin-state.json" "tools\library-pin-state.json" -Force
  Move-Item "$k\files\tools~library-pin.py" "tools\library-pin.py" -Force
  Move-Item "$k\files\release_v4_0_1.json" "release_v4_0_1.json" -Force

  $res = @{}
  $res["src\argument-library\index.html"] = "3dda2005c0481a7385f3f2ebacf8bdfa"
  $res["src\chat\index.html"] = "2ddbff2224dcd85c6d7dcab304bd33bf"
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
  $res["tools\library-pin.py"] = "a0679594ef0a550e7895998a16a7682c"
  $res["release_v4_0_1.json"] = "61e90092a0b398fa04de79db0ba161c7"
  foreach ($p in $res.Keys) { $m = Md5 $p ; if ($m -ne $res[$p]) { Write-Host "FAIL result $p"; Write-Host "     got  $m"; Write-Host "     want $($res[$p])"; return } }
  Write-Host "OK  17 result files byte-exact"

  # ---- the discrimination, asserted on the shipped tree ----
  $moved = @(Get-ChildItem src -Recurse -Include *.html | Select-String -Pattern "v4.0.1" -SimpleMatch).Count
  $held  = @(Get-ChildItem src -Recurse -Include *.html | Select-String -Pattern "v4.0.0" -SimpleMatch).Count
  $oldmd5 = @(Get-ChildItem src -Recurse -Include *.html | Select-String -Pattern "e654eabd" -SimpleMatch).Count
  $newmd5 = @(Select-String -Path "src\library-about\index.html" -Pattern "9d13359e305c6caa3ae64759f3dcc0e6" -SimpleMatch).Count
  if ($oldmd5 -ne 0) { Write-Host "FAIL the superseded md5 still appears in src ($oldmd5)"; return }
  if ($newmd5 -lt 1) { Write-Host "FAIL library-about does not state the new md5"; return }
  if ($held -lt 1)   { Write-Host "FAIL every v4.0.0 was swept - the provenance lines should have been HELD"; return }
  Write-Host "OK  version: $moved line(s) moved to v4.0.1, $held HELD as provenance; superseded md5 gone from src"

  git add "src/argument-library/index.html" "src/chat/index.html" "src/console/index.html" "src/contact/index.html" "src/donations/index.html" "src/feed.xml" "src/frame/index.html" "src/index.html" "src/library-about/index.html" "src/notes/index.html" "src/recommendations/index.html" "src/releases.json" "src/search-index.json" "src/troubleshooting/index.html" "tools/library-pin-state.json" "tools/library-pin.py" "release_v4_0_1.json"
  $staged = @(git diff --cached --name-only).Count
  if ($staged -ne 17) { Write-Host "FAIL staged $staged want 17"; git diff --cached --name-only; return }
  Write-Host "OK  staged 17"

  git commit -m "wuld.ink follows the v4.0.1 library pin: e654eabd -> 9d13359e, 2,963,752 -> 2,963,789, version label across the site, changelog entry + feed + search index. 14 version mentions HELD as provenance - the objection-page extracts name the tag they were taken at and were never re-derived - and that rule is now encoded in tools/library-pin.py rather than remembered. objections-index re-vendor verified a no-op: byte-identical to source. NO PIN"
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
  Write-Host "    /library-about/  new-md5=$a  stale-md5=$b  new-bytes=$c   (want >=1 0 1)"
  curl.exe -s -o $t "https://wuld.ink/changelog/"
  $d = @(Select-String -Path $t -Pattern "v4.0.1" -SimpleMatch).Count
  Write-Host "    /changelog/      v4.0.1 mentions=$d   (want >=1)"
  Write-Host "v4.0.1 pin follow-through done."
}
