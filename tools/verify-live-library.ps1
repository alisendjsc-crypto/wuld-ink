#requires -version 5
<#
  verify-live-library.ps1 - is the deployed EFIList library the new release yet?

  Lives in wuld-ink/tools/. Reads the CURRENT pin from library-pin-state.json and,
  if you pass -Manifest <release_vX.json>, the TARGET (pin.new). Fetches the live
  combined `-Tries` times via curl.exe (the canonical client -- urllib/requests get
  DIFFERENT bytes from Cloudflare, observed K47), requires agreement, and reports
  GREEN / STILL-OLD / UNEXPECTED / UNSTABLE. Touches nothing in the repo.

  Run after the operator deploys; when it says GREEN, Cowork runs library-pin.py --apply.

  Usage:
    .\tools\verify-live-library.ps1 -Manifest "C:\Users\y_m_a\Downloads\Argument Library\release_v3_8_5r.json"
    .\tools\verify-live-library.ps1            # just print the live hash
#>
param(
  [string]$Manifest,
  [string]$Url   = 'https://library.wuld.ink/combined',
  [int]$Tries    = 3
)
$ErrorActionPreference = 'Stop'
$here  = Split-Path -Parent $MyInvocation.MyCommand.Path
$state = Join-Path $here 'library-pin-state.json'

$cur = $null
if (Test-Path $state) { $cur = ((Get-Content $state -Raw | ConvertFrom-Json).md5).ToLower() }
$target = $null
if ($Manifest) {
  if (-not (Test-Path $Manifest)) { Write-Host "manifest not found: $Manifest" -ForegroundColor Red; exit 1 }
  $target = ((Get-Content $Manifest -Raw | ConvertFrom-Json).pin.new).ToLower()
}

$hashes = @(); $size = 0
for ($i = 0; $i -lt $Tries; $i++) {
  $tmp = Join-Path $env:TEMP ("wuld-libcheck-{0}" -f $i)
  curl.exe -sL --max-time 30 $Url -o $tmp
  $hashes += ((Get-FileHash -Algorithm MD5 $tmp).Hash.ToLower())
  $size = (Get-Item $tmp).Length
  Remove-Item $tmp -ErrorAction SilentlyContinue
}
$uniq = @($hashes | Select-Object -Unique)

"live url : $Url"
if ($uniq.Count -ne 1) {
  Write-Host ("UNSTABLE - {0} differing hashes across {1} fetches: {2}. Edge cache mid-propagation; re-run shortly." -f $uniq.Count, $Tries, ($uniq -join ', ')) -ForegroundColor Magenta
  exit 0
}
$h = $uniq[0]
"live md5 : $h"
"live size: {0:N0} bytes" -f $size
if ($cur)    { "current pin (state) : $cur" }
if ($target) { "target  (manifest)  : $target" }
""
if     ($target -and $h -eq $target) { Write-Host "GREEN - live == target. Cowork: run  python3 tools/library-pin.py --manifest <release.json> --apply" -ForegroundColor Green }
elseif ($cur -and $h -eq $cur)       { Write-Host "STILL OLD - live == current pin. Deploy has not landed. Wait, re-run." -ForegroundColor Yellow }
elseif (-not $target)                { Write-Host "(pass -Manifest <release.json> to auto-judge GREEN/STILL)" -ForegroundColor Cyan }
else                                 { Write-Host "UNEXPECTED - live matches neither current pin nor target. Do NOT pin; flag it." -ForegroundColor Red }
