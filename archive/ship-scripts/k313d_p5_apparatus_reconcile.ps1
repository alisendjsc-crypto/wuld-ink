# =====================================================================================
#  Apparatus v4 reconciliation -- puts the four reconciled files where the ship script
#  reads them. Writes NOTHING to git. Run this, then the film seat's manifest lands, then
#  SHIP_WHEN_REPIN_LANDS.ps1 (which needs HEAD == origin/main, i.e. push first).
#
#  Why this exists: three artefacts were at three versions. The kit the ship script reads
#  was v10 (two cuts); the document the film seat calls current is v4 (one cut) and had
#  been sitting in Downloads\Argument Library, never copied into the kit; and the ship
#  script, the build tool and the verifier all encoded the two-cut design. Same failure
#  the 09-08 relay confessed to, one revision further along.
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library'
  $kit  = 'C:\Users\y_m_a\Downloads\apparatus_libshow'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  function Get-Md5 { param($p) (Get-FileHash -LiteralPath $p -Algorithm MD5).Hash.ToLower() }
  function Write-Abort { param($m) Write-Host "ABORT: $m" -ForegroundColor Red; throw $m }

  $files = [ordered]@{
    'argument-library-apparatus.md' = @{ md5='59734e9703f11dafda0cbbb45dc62642'; bytes=29261; to=(Join-Path $kit  'page\argument-library-apparatus.md') }
    'build_libshow_apparatus.py'    = @{ md5='fe1ef4b7e0960cb03798b1088a68495e'; bytes=14395; to=(Join-Path $kit  'tools\build_libshow_apparatus.py') }
    'verify_libshow_apparatus.py'   = @{ md5='7d1e24b5970e6337497c849cd5af6317'; bytes=9236;  to=(Join-Path $kit  'tools\verify_libshow_apparatus.py') }
    'SHIP_WHEN_REPIN_LANDS.ps1'     = @{ md5='1c1e0607ae07c8ddd284913b40236021'; bytes=11792; to=(Join-Path $repo 'tools\apparatus\SHIP_WHEN_REPIN_LANDS.ps1') }
  }
  # gate: every source is the file I measured
  foreach ($k in $files.Keys) {
    $s = Join-Path $drop $k
    if (-not (Test-Path $s)) { Write-Abort "missing: $s" }
    $h = Get-Md5 $s; $b = (Get-Item -LiteralPath $s).Length
    if ($h -ne $files[$k].md5 -or $b -ne $files[$k].bytes) { Write-Abort "$k is $h / $b B, expected $($files[$k].md5) / $($files[$k].bytes)" }
  }
  Write-Host "gate 1  all four sources match their md5 and byte count" -ForegroundColor Green
  # gate: what we are replacing is what I measured (so a newer reissue is never overwritten blind)
  $prev = @{ (Join-Path $kit 'page\argument-library-apparatus.md') = 24511; (Join-Path $kit 'tools\build_libshow_apparatus.py') = 13520
             (Join-Path $kit 'tools\verify_libshow_apparatus.py') = 7685; (Join-Path $repo 'tools\apparatus\SHIP_WHEN_REPIN_LANDS.ps1') = 10667 }
  foreach ($p in $prev.Keys) {
    if (Test-Path $p) { $b=(Get-Item -LiteralPath $p).Length; if ($b -ne $prev[$p]) { Write-Abort "$p is $b B, expected $($prev[$p]) -- something newer is there; tell me before overwriting it" } }
  }
  Write-Host "gate 2  every destination is the version I measured against" -ForegroundColor Green
  foreach ($k in $files.Keys) {
    Copy-Item -LiteralPath (Join-Path $drop $k) -Destination $files[$k].to -Force
    $h = Get-Md5 $files[$k].to
    if ($h -ne $files[$k].md5) { Write-Abort "$k landed as $h" }
    "{0,-32} -> {1}" -f $k, $files[$k].to | Write-Host
  }
  Write-Host "gate 3  all four verified on disk after writing" -ForegroundColor Green
  Write-Host ""
  $man = Join-Path $kit 'cut\render_manifest.json'
  $m = Get-Content -LiteralPath $man -Raw
  if ($m -match 'db01fb9d4331039148fdb51b7649e022') { Write-Host "manifest already carries the v4 render (db01fb9d) -- SHIP can run once HEAD == origin." -ForegroundColor Green }
  else { Write-Host "STILL NEEDED: the v4 render_manifest.json from the film seat, at $man" -ForegroundColor Yellow
         Write-Host "  It must record libshow_full_v4.mp4 with md5 db01fb9d4331039148fdb51b7649e022 and 279809463 bytes." -ForegroundColor Yellow
         Write-Host "  The current manifest is v10's (two renders). SHIP's parity gate will refuse the pairing until it is replaced." -ForegroundColor Yellow }
  Write-Host "Nothing staged, nothing committed." -ForegroundColor Yellow
}
