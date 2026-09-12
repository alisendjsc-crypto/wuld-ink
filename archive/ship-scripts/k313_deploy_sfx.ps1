# =====================================================================================
#  P5 deploy 3 of 3 -- the sound layer.                                        [v2]
#
#  v1 died at gate 2 with "Get-History : Cannot bind parameter 'Id'". The helper was
#  named  H , and  h  is a built-in PowerShell ALIAS for Get-History; aliases resolve
#  before functions, so every hash call went to the wrong command. Renamed to Get-Md5.
#  Git pathspecs are forward-slashed here too -- backslashes are accepted by git on
#  Windows but not reliably in a pathspec after  -- .
#
#  Adds  sfx/*.ogg  (7 new files) and replaces  wuld-layer.css / wuld-layer.js  in the
#  library repo. Does NOT touch combined.html, the wing HTML, or anything else.
#
#  Every input is hashed before it is used and every output is hashed after it is
#  written. Refuses to run if HEAD has moved, if anything is already staged, or if the
#  files it is about to overwrite are not the ones I measured against.
#  Nothing is pushed.
# =====================================================================================
& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\efilist-argument-library'
  $drop = 'C:\Users\y_m_a\Downloads\Argument Library'
  $HEAD_EXPECT = '09665d9'

  function Get-Md5   { param($p) (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }
  function Write-Abort { param($m) Write-Host "ABORT: $m" -ForegroundColor Red; throw $m }

  # --- gate 1: the repo is where I think it is, at the commit I think it is ----------
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Abort "no git repo at $repo" }
  Push-Location $repo
  try {
    $head = (git rev-parse --short HEAD).Trim()
    if ($head -ne $HEAD_EXPECT) {
      Write-Abort "HEAD is $head, expected $HEAD_EXPECT. Something landed since I measured. Tell me and stop."
    }
    $already = @(git diff --cached --name-only)
    if ($already.Count) { Write-Abort "already staged:`n$($already -join "`n")`nCommit or reset first." }
    Write-Host "gate 1  HEAD $head, index clean" -ForegroundColor Green

    # --- gate 2: the files I am replacing are the ones I measured ---------------------
    $inPlace = @{
      'wuld-layer.css' = 'f09294bb85f90616ca2140969399d337'
      'wuld-layer.js'  = 'aed5fd76e516da31522edde9435a4b69'
    }
    foreach ($k in $inPlace.Keys) {
      $p = Join-Path $repo $k
      if (-not (Test-Path $p)) { Write-Abort "$k missing from the repo" }
      $h = Get-Md5 $p
      if ($h -ne $inPlace[$k]) { Write-Abort "$k in the repo is $h, expected $($inPlace[$k]). It changed since I measured." }
    }
    Write-Host "gate 2  both files in the repo are the versions I measured against" -ForegroundColor Green

    # --- gate 3: the incoming files are the ones I built ------------------------------
    #     keys are GIT pathspecs (forward slashes); sources live in the drop folder
    $incoming = [ordered]@{
      'wuld-layer.css'           = @{ from = 'wuld-layer.css';                md5 = '7cab1402546ca4ac01f7eee1e6110dc8'; bytes = 51451 }
      'wuld-layer.js'            = @{ from = 'wuld-layer.js';                 md5 = 'a72eca577e3c6ddee3125e5a0944eda0'; bytes = 23017 }
      'sfx/wz-hover.ogg'         = @{ from = 'wuld-sfx\wz-hover.ogg';         md5 = 'bd8ef32ba7bf19b351cb8294153b6704'; bytes = 4329  }
      'sfx/wz-click.ogg'         = @{ from = 'wuld-sfx\wz-click.ogg';         md5 = '78b403b0686f8c6a5be034cdbf6a7108'; bytes = 4622  }
      'sfx/wz-expand.ogg'        = @{ from = 'wuld-sfx\wz-expand.ogg';        md5 = 'cf3441613067771164d11d84981d57b0'; bytes = 5454  }
      'sfx/wz-collapse.ogg'      = @{ from = 'wuld-sfx\wz-collapse.ogg';      md5 = 'a9a0a925f434d792b1dc097fdf9aee09'; bytes = 5577  }
      'sfx/wz-magnifier_in.ogg'  = @{ from = 'wuld-sfx\wz-magnifier_in.ogg';  md5 = '310d42358680268711c04d799f4d7380'; bytes = 5549  }
      'sfx/wz-tier_step.ogg'     = @{ from = 'wuld-sfx\wz-tier_step.ogg';     md5 = '5671fe41b82d58f4049dd9047060d97c'; bytes = 6785  }
      'sfx/wz-ambience_loop.ogg' = @{ from = 'wuld-sfx\wz-ambience_loop.ogg'; md5 = '71361796f68046d655e585f83165e845'; bytes = 18083 }
    }
    foreach ($k in $incoming.Keys) {
      $s = Join-Path $drop $incoming[$k].from
      if (-not (Test-Path $s)) { Write-Abort "source missing: $s" }
      $h = Get-Md5 $s
      $b = (Get-Item -LiteralPath $s).Length
      if ($h -ne $incoming[$k].md5)   { Write-Abort "$k source md5 $h, expected $($incoming[$k].md5)" }
      if ($b -ne $incoming[$k].bytes) { Write-Abort "$k source is $b bytes, expected $($incoming[$k].bytes)" }
    }
    Write-Host "gate 3  all 9 incoming files match their expected md5 and byte count" -ForegroundColor Green

    # --- write, then hash what actually landed ----------------------------------------
    $sfxDir = Join-Path $repo 'sfx'
    if (-not (Test-Path $sfxDir)) { New-Item -ItemType Directory -Path $sfxDir | Out-Null; Write-Host "        created sfx\" }
    foreach ($k in $incoming.Keys) {
      $s = Join-Path $drop $incoming[$k].from
      $d = Join-Path $repo ($k -replace '/','\')
      Copy-Item -LiteralPath $s -Destination $d -Force
      $h = Get-Md5 $d
      if ($h -ne $incoming[$k].md5) { Write-Abort "$k landed as $h, not $($incoming[$k].md5). Copy corrupted; nothing staged." }
      "{0,-26} {1,6} B  {2}" -f $k, $incoming[$k].bytes, $h | Write-Host
    }
    Write-Host "gate 4  all 9 files verified on disk after writing" -ForegroundColor Green

    # --- stage EXACTLY these, never -u -------------------------------------------------
    foreach ($k in $incoming.Keys) { git add -- $k }
    $staged = @(git diff --cached --name-only)
    # count alone is not enough: a stray file plus a missing one cancels out at 9
    $missing = @($incoming.Keys | Where-Object { $staged -notcontains $_ })
    $extra   = @($staged        | Where-Object { $incoming.Keys -notcontains $_ })
    if ($missing.Count) { Write-Abort "expected but not staged:`n$($missing -join "`n")" }
    if ($extra.Count)   { Write-Abort "staged but not expected:`n$($extra -join "`n")" }
    if ($staged -match 'combined\.html') { Write-Abort "combined.html is staged -- the pinned flagship must not move here. Reset and tell me." }
    Write-Host "gate 5  exactly the 9 expected files staged, flagship untouched" -ForegroundColor Green
    $staged | ForEach-Object { Write-Host "        $_" }

    git commit -m "library: sound layer (7 synthesized cues + ambience), gated to the vfx tier on a dark ground

Sounds are synthesized from a measured profile, not sampled. Audible only at the vfx
tier, on a dark ground, with prefers-reduced-motion off and the chin mute button on.
Decode is arrival-driven, so a first click before the files land is no longer
permanently silent. Wordmark hides below 420px so the third chin button clears it at 320.

14 silence gates pass with four live positive controls; 16.70ms median scroll with the
ambience running and hover traffic firing; 25 contrast cells still 0 below AA; CLS 0.000.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BhsNYGTo9DBRtTPN94YsjW"

    Write-Host ""
    git show --stat --oneline HEAD
    Write-Host ""
    Write-Host "COMMITTED, NOT PUSHED. Cloudflare deploys on push -- push when you are ready." -ForegroundColor Yellow
  }
  finally { Pop-Location }
}
