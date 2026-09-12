# =====================================================================================
#  THE FLAGSHIP PIN MOVE (WI-K314). efilist-argument-library only; run this block FIRST.
#  Three files, one commit atop 23fbbed, then a gated push, then the served bytes read back
#  until library.wuld.ink/combined IS the new pin (pin==live by md5, never by version string).
#    combined.html   9d13359e / 2,963,789 B  ->  62d1e8d8 / 2,974,039 B   (the pin)
#    wuld-layer.css  089dff05 /    58,676 B  ->  24907d89 /    59,392 B
#    wuld-layer.js   85665e34 /    55,585 B  ->  be7de70c /    57,746 B
#  Every gate refuses rather than half-applies: the three inputs are hashed on disk before a byte
#  moves, the repo copies must still be the pinned bytes, the results are hashed after writing,
#  exactly these three names are staged (never git add -u). Nothing is force-pushed or rewritten.
#  One-liner:  Get-Content 'C:\Users\y_m_a\Downloads\Argument Library\pinmove\PIN_MOVE_efilist_commit.ps1' -Raw | Invoke-Expression
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\efilist-argument-library'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library\pinmove'
  $HEAD_EXPECT = '23fbbedb301786c3d9861a99f97d0b11adfa0f16'

  function Get-Md5     { param($p) (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }
  function Write-Abort { param($m) Write-Host "ABORT: $m" -ForegroundColor Red; throw $m }

  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Abort "no git repo at $repo" }
  Push-Location $repo
  try {
    Get-ChildItem -LiteralPath (Join-Path $repo '.git') -Filter '*.lock' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
    $head = (git rev-parse HEAD).Trim()
    if ($head -ne $HEAD_EXPECT) { Write-Abort "HEAD is $head, expected 23fbbed (the quality-check pass). Tell me what landed." }
    $already = @(git diff --cached --name-only)
    if ($already.Count) { Write-Abort "already staged:`n$($already -join "`n")" }
    Write-Host "gate 1  HEAD 23fbbed, index clean" -ForegroundColor Green

    $files = [ordered]@{
      'combined.html'  = @{ was = '9d13359e305c6caa3ae64759f3dcc0e6'; wasBytes = 2963789; md5 = '62d1e8d86056465ebcb5daced38e0a83'; bytes = 2974039 }
      'wuld-layer.css' = @{ was = '089dff05cce29ccb51cc359c05556736'; wasBytes = 58676;   md5 = '24907d8919b6f14d99cfbcef1d2b534f'; bytes = 59392 }
      'wuld-layer.js'  = @{ was = '85665e349de9447b9d41b4eeaec398ac'; wasBytes = 55585;   md5 = 'be7de70c3d6505b6de3d53355c874e3c'; bytes = 57746 }
    }
    $dirty = @(git status --porcelain -- combined.html wuld-layer.css wuld-layer.js)
    if ($dirty.Count) { Write-Abort "the repo copies differ from HEAD already:`n$($dirty -join "`n")" }
    foreach ($k in $files.Keys) {
      $d = Join-Path $repo $k
      $h = Get-Md5 $d; $b = (Get-Item -LiteralPath $d).Length
      if ($h -ne $files[$k].was -or $b -ne $files[$k].wasBytes) { Write-Abort "$k in the repo is $h / $b B, not the pinned $($files[$k].was) / $($files[$k].wasBytes). This is not the file the session measured. Nothing moved." }
    }
    Write-Host "gate 2  the three repo copies are the pinned bytes (combined.html is 9d13359e / 2,963,789)" -ForegroundColor Green

    foreach ($k in $files.Keys) {
      $s = Join-Path $drop $k
      if (-not (Test-Path -LiteralPath $s)) { Write-Abort "source missing: $s" }
      $h = Get-Md5 $s; $b = (Get-Item -LiteralPath $s).Length
      if ($h -ne $files[$k].md5)   { Write-Abort "$k source md5 $h, expected $($files[$k].md5)" }
      if ($b -ne $files[$k].bytes) { Write-Abort "$k source is $b bytes, expected $($files[$k].bytes)" }
    }
    Write-Host "gate 3  the three incoming files match their md5 and byte count" -ForegroundColor Green

    foreach ($k in $files.Keys) {
      $d = Join-Path $repo $k
      Copy-Item -LiteralPath (Join-Path $drop $k) -Destination $d -Force
      $h = Get-Md5 $d
      if ($h -ne $files[$k].md5) { Write-Abort "$k landed as $h. Copy corrupted; nothing staged. Restore with: git checkout -- $k" }
      "{0,-16} {1,9} B  {2}" -f $k, $files[$k].bytes, $h | Write-Host
    }
    Write-Host "gate 4  all three verified on disk after writing" -ForegroundColor Green

    foreach ($k in $files.Keys) { git add -- $k }
    $staged  = @(git diff --cached --name-only)
    $missing = @($files.Keys | Where-Object { $staged -notcontains $_ })
    $extra   = @($staged     | Where-Object { $files.Keys -notcontains $_ })
    if ($missing.Count) { Write-Abort "expected but not staged:`n$($missing -join "`n")" }
    if ($extra.Count)   { Write-Abort "staged but not expected:`n$($extra -join "`n")" }
    if ($staged.Count -ne 3) { Write-Abort "staged count is $($staged.Count), expected 3" }
    Write-Host "gate 5  exactly the 3 expected files staged" -ForegroundColor Green
    $staged | ForEach-Object { Write-Host "        $_" }

    git commit -m "flagship pin move: presentation layer integrated into /combined; AA remap at source; two mode toggles; START HERE precis; v4.0.1 held

The pinned flagship (v4.0.1, 82 objections) leaves 9d13359e305c6caa3ae64759f3dcc0e6 / 2,963,789 B for
62d1e8d86056465ebcb5daced38e0a83 / 2,974,039 B. No content change, no version bump.

- Links /wuld-layer.css and /wuld-layer.js and ships the .wz-stage wrapper in its markup, as the wings do.
- The four body-child rules that switch the three top-level sections use the descendant combinator now:
  with the wrapper in the markup they stopped matching until the deferred script's shim landed (~100 ms
  after parse: CLS 0.61, all three sections stacked; the whole stack with scripts off). CLS back to the
  page's own 0.08; the shim has nothing left to mirror.
- Four START HERE precis blocks after each methodology panel's title (+4,024 B; per-clause sourced, K232).
- The AA remap, at source: the #444/#555/#666/#777 grey ladder (1.9-4.4:1 on the dark ground) -> #88847c;
  #8b0000 as text (1.9-2.0:1) -> #ef3a58 where the ground is dark, the dark red kept for borders, fills,
  selection and cream; the tier and RSI badges darkened per hue on cream via data-tier/data-grade; the
  methodology panels' inline strong keys as classes with a value per ground. Four modes x eleven states:
  every HTML text element clears 4.5:1 (the chin's aria-hidden wordmark aside). Graph-view d3 label
  fills left to the K74 spec.
- STANDARD/LEGIBLE/HIGH-CONTRAST/BOTH -> two aria-pressed toggles; mode strings, storage and event unchanged.
- examples view: null guard on the #counts write that threw on every examples navigation.
- The wing-switcher row insets by the bezel's top lip; the layer's palette variables declared per ground.
- wuld-layer.js: the feedback control and the sound layer learn the flagship's div.objection-header row
  (82/82 controls, layout cost 0 at four widths; the wing row-for-row identical). wuld-layer.css: the
  control's position on that row (+716 B, flagship-scoped). The tour's mode sentence reads true on both shapes.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Tsn31Dt28wkQhkpmzgt6zF"

    Write-Host ""
    git show --stat --oneline HEAD
    $new = (git rev-parse --short HEAD).Trim()

    # ---- the push, gated -------------------------------------------------------------------------
    $ErrorActionPreference = 'Continue'
    Write-Host ""
    Write-Host '---- push ----' -ForegroundColor Cyan
    git fetch --quiet origin main
    if ($LASTEXITCODE -ne 0) { Write-Host 'NOT PUSHED: fetch failed (network?). The commit is local and safe; re-run P5_push.ps1 later (its library half will push it).' -ForegroundColor Red; return }
    $behind = @(git log --oneline HEAD..origin/main)
    if ($behind.Count) { Write-Host ('NOT PUSHED: origin/main has ' + $behind.Count + ' commit(s) this machine does not. The commit is local and safe; do not force. Tell me.') -ForegroundColor Red; $behind | ForEach-Object { Write-Host ('   ' + $_) }; return }
    $ahead = @(git log --oneline origin/main..HEAD)
    if ($ahead.Count -ne 1) { Write-Host ('NOT PUSHED: expected exactly one commit above origin/main, found ' + $ahead.Count + '. Tell me what is listed.') -ForegroundColor Red; $ahead | ForEach-Object { Write-Host ('   ' + $_) }; return }
    Write-Host ('pushing 1 commit: ' + $ahead[0]) -ForegroundColor Green
    git push origin main
    if ($LASTEXITCODE -ne 0) { Write-Host 'PUSH FAILED - nothing changed on origin; the commit is still local.' -ForegroundColor Red; return }
    Write-Host ('pushed. origin/main is now ' + (git rev-parse --short origin/main)) -ForegroundColor Green

    # ---- pin==live: read the served bytes back until they ARE the new pin -----------------------
    Write-Host ""
    Write-Host '---- served bytes (Cloudflare Pages builds on push; polling up to 6 minutes) ----' -ForegroundColor Cyan
    $want = @{ 'combined' = $files['combined.html'].md5; 'wuld-layer.css' = $files['wuld-layer.css'].md5; 'wuld-layer.js' = $files['wuld-layer.js'].md5 }
    $t = Join-Path $env:TEMP 'pinmove_served.bin'
    $live = $false
    for ($i = 0; $i -lt 18 -and -not $live; $i++) {
      Start-Sleep -Seconds 20
      curl.exe -s -L -H 'Cache-Control: no-cache' -o $t "https://library.wuld.ink/combined?nocache=$i"
      $h = if (Test-Path -LiteralPath $t) { Get-Md5 $t } else { '(no file)' }
      $b = if (Test-Path -LiteralPath $t) { (Get-Item -LiteralPath $t).Length } else { 0 }
      if ($h -eq $want['combined']) { $live = $true; Write-Host ("  /combined  {0} / {1} B  == the new pin. PIN IS LIVE." -f $h, $b) -ForegroundColor Green }
      else { Write-Host ("  /combined  {0} / {1} B  (not yet; want {2})" -f $h, $b, $want['combined']) -ForegroundColor Yellow }
    }
    if ($live) {
      foreach ($k in 'wuld-layer.css', 'wuld-layer.js') {
        curl.exe -s -L -H 'Cache-Control: no-cache' -o $t "https://library.wuld.ink/$k?nocache=1"
        $h = Get-Md5 $t
        if ($h -eq $want[$k]) { Write-Host ("  /{0}  {1}  OK" -f $k, $h) -ForegroundColor Green } else { Write-Host ("  /{0}  {1}  MISMATCH (want {2}) -- tell me" -f $k, $h, $want[$k]) -ForegroundColor Red }
      }
      Write-Host ""
      Write-Host ("PIN MOVED. library.wuld.ink/combined is " + $files['combined.html'].md5 + " / 2,974,039 B; commit " + $new + ". Now run WI-K314_commit.ps1 (the log).") -ForegroundColor Green
    } else {
      Write-Host ""
      Write-Host 'PUSHED BUT NOT YET SERVED after 6 minutes. That is Cloudflare, not the commit. Re-check later with:' -ForegroundColor Yellow
      Write-Host '  curl.exe -s -L -o "$env:TEMP\c.bin" https://library.wuld.ink/combined; (Get-FileHash -Algorithm MD5 "$env:TEMP\c.bin").Hash.ToLower()' -ForegroundColor Yellow
      Write-Host ('  wanted: ' + $files['combined.html'].md5) -ForegroundColor Yellow
    }
  }
  finally { Pop-Location }
}
