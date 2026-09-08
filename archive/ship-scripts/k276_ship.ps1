& {
  $ErrorActionPreference = 'Stop'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  $dl   = 'C:\Users\y_m_a\Downloads\k276'
  Set-Location $repo
  [Environment]::CurrentDirectory = $repo
  function Md5($p){ (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }
  function Blob($p){ (git -C $repo hash-object $p).Trim() }

  # 0 -- .git lock cleanup
  Get-ChildItem "$repo\.git" -Recurse -Filter '*.lock' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue

  # 1 -- HEAD == origin == the K275 tip (sole-committer + no concurrent lane landed)
  git -C $repo fetch origin main --quiet
  $head = (git -C $repo rev-parse HEAD).Trim()
  $orig = (git -C $repo rev-parse origin/main).Trim()
  $tip  = '42e8a49558a67e33344259dcef2a4424cf2b7e53'
  if ($head -ne $orig) { Write-Host "ABORT: HEAD $head != origin/main $orig (unpushed local commit -- resolve first)"; return }
  if ($head -ne $tip)  { Write-Host "ABORT: HEAD moved off the K275 tip ($head). A concurrent lane landed -- tell Claude to renumber K276 atop the new tip (re-derive). Nothing moved."; return }
  Write-Host "OK  HEAD == origin == K275 tip"

  # 2 -- base-blob guards (the precache ?v refs depend on these being byte-frozen)
  $bad = 0
  if ((git -C $repo rev-parse HEAD:src/base.css).Trim()               -ne '144b2841d3f33b5bf705d3350129953eda058fd4') { Write-Host 'ABORT base.css blob';        $bad = 1 }
  if ((git -C $repo rev-parse HEAD:src/tokens.css).Trim()             -ne '4654928de964dc0429d6c707e3140ada17cec26e') { Write-Host 'ABORT tokens.css blob';      $bad = 1 }
  if ((git -C $repo rev-parse HEAD:src/components/nav.css).Trim()     -ne '23a577f1652995ef8cb7c87e07c28a26c4098caf') { Write-Host 'ABORT nav.css blob';         $bad = 1 }
  if ((git -C $repo rev-parse HEAD:src/components/footer.css).Trim()  -ne '45ab8d23a423277b3c684055e923619115bd19d7') { Write-Host 'ABORT footer.css blob';      $bad = 1 }
  if ((git -C $repo rev-parse HEAD:src/components/mobile-a11y.css).Trim() -ne '0f385eb0b85d444749523a73feae5badeb5196ef') { Write-Host 'ABORT mobile-a11y.css blob'; $bad = 1 }
  if ($bad -ne 0) { Write-Host 'ABORT: precache base-blob mismatch'; return }
  Write-Host 'OK  base-blob guards (base/tokens/nav/footer/mobile-a11y @ K275 tip)'

  # 3 -- greenfield: the new files must not already exist (re-run guard)
  if (Test-Path "$repo\src\sw.js")                    { Write-Host 'ABORT: src\sw.js exists (re-run? re-derive)'; return }
  if (Test-Path "$repo\src\manifest.webmanifest")     { Write-Host 'ABORT: src\manifest.webmanifest exists'; return }
  if (Test-Path "$repo\src\offline.html")             { Write-Host 'ABORT: src\offline.html exists'; return }
  if (Test-Path "$repo\src\components\sw-register.js") { Write-Host 'ABORT: src\components\sw-register.js exists'; return }
  Write-Host 'OK  greenfield (new files absent)'

  # 4 -- Move-Item the .k276 sidecars to final paths
  New-Item -ItemType Directory -Force -Path "$repo\src\icons" | Out-Null
  Move-Item -Force "$dl\manifest.k276.webmanifest"   "$repo\src\manifest.webmanifest"
  Move-Item -Force "$dl\sw.k276.js"                  "$repo\src\sw.js"
  Move-Item -Force "$dl\sw-register.k276.js"         "$repo\src\components\sw-register.js"
  Move-Item -Force "$dl\offline.k276.html"           "$repo\src\offline.html"
  Move-Item -Force "$dl\icon-192.k276.png"           "$repo\src\icons\icon-192.png"
  Move-Item -Force "$dl\icon-512.k276.png"           "$repo\src\icons\icon-512.png"
  Move-Item -Force "$dl\icon-maskable-512.k276.png"  "$repo\src\icons\icon-maskable-512.png"

  # 5 -- result-blob gates (git hash-object == pinned; catches any transfer corruption)
  $rb = 0
  if ((Blob "$repo\src\manifest.webmanifest")        -ne '79c905b3c8b04079f4fbd8ecf2c477bbf6b0dc61') { Write-Host 'ABORT manifest blob';       $rb = 1 }
  if ((Blob "$repo\src\sw.js")                       -ne '59cea6832d3450ad07b1e3b0146ade168d7b212b') { Write-Host 'ABORT sw.js blob';          $rb = 1 }
  if ((Blob "$repo\src\components\sw-register.js")   -ne 'a73ba3ed4432314661166692993b56eefb6c4498') { Write-Host 'ABORT sw-register blob';    $rb = 1 }
  if ((Blob "$repo\src\offline.html")                -ne '8495ce98fe53fc3ecf38380da395146095cc15f6') { Write-Host 'ABORT offline blob';        $rb = 1 }
  if ((Blob "$repo\src\icons\icon-192.png")          -ne 'e7977c649c65a34e23c66001a019adb4a931897b') { Write-Host 'ABORT icon-192 blob';       $rb = 1 }
  if ((Blob "$repo\src\icons\icon-512.png")          -ne '415fba68f3a83e161c6a47785491d13fcd7d597c') { Write-Host 'ABORT icon-512 blob';       $rb = 1 }
  if ((Blob "$repo\src\icons\icon-maskable-512.png") -ne '6c1c2e744fefdb9d892aa959fa7480fda31fa3d4') { Write-Host 'ABORT icon-maskable blob';  $rb = 1 }
  if ($rb -ne 0) { Write-Host 'ABORT: result-blob mismatch'; return }
  Write-Host 'OK  result-blob gates (7 new files)'

  # 6 -- head-only sweep (self-gates 74 manifest / 73 sw-register, idempotent, CRLF-free)
  python "$dl\sweep-head.py" "$repo\src"
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: sweep-head gate failed'; return }
  Write-Host 'OK  head sweep'

  # 7 -- CLAUDE.md stratum append (large file: git-show base + append; NEVER Edit). Semantic gate.
  $ap = @'
import subprocess, sys
repo, strat = sys.argv[1], sys.argv[2]
base = subprocess.run(['git', '-C', repo, 'show', 'HEAD:CLAUDE.md'], capture_output=True).stdout.decode('utf-8')
if '### K276 (' in base:
    print('ABORT: K276 stratum already present in CLAUDE.md'); sys.exit(1)
if not base.endswith('\n'):
    base += '\n'
s = open(strat, encoding='utf-8', newline='').read()
open(repo + '/CLAUDE.md', 'w', encoding='utf-8', newline='').write(base + s)
nb = base.count('\n'); nn = (base + s).count('\n')
ok = ('### K276 (' in (base + s)) and (nn > nb)
print('CLAUDE.md lines %d -> %d (+%d)  gate=%s' % (nb, nn, nn - nb, 'OK' if ok else 'FAIL'))
sys.exit(0 if ok else 1)
'@
  $ap | Out-File -Encoding ascii "$env:TEMP\append_k276.py"
  python "$env:TEMP\append_k276.py" "$repo" "$dl\k276_stratum.md"
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: CLAUDE.md append gate failed'; return }
  Write-Host 'OK  CLAUDE.md stratum appended'

  # 8 -- review + explicit-stage (scoped; NEVER git add -u/.) + MEASURED staged-count gate
  git -C $repo status --short
  git -C $repo add src CLAUDE.md
  $staged = @(git -C $repo diff --cached --name-only).Count
  if ($staged -ne 82) { Write-Host "ABORT: staged-count $staged != 82 (expect 74 swept HTML + 4 new + 3 icons + CLAUDE.md). Unstage + tell Claude."; git -C $repo reset --quiet HEAD; return }
  Write-Host "OK  staged-count == 82"

  # 9 -- commit + push (NO PIN)
  git -C $repo config http.postBuffer 524288000
  git -C $repo commit -m "K276 Track B PWA: manifest + sw.js + icons + offline.html + mobile-only sw-register; head-only sweep 74/73; desktop FP 68/68 inert; NO PIN" | Out-Host
  git -C $repo push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: push failed ($LASTEXITCODE)'; return }
  Write-Host 'OK  pushed'

  # 10 -- live asserts (Pages deploys in ~1 min; WARN, not fatal -- the push already landed)
  Start-Sleep -Seconds 50
  curl.exe -s -o "$env:TEMP\k276_man" 'https://wuld.ink/manifest.webmanifest'
  curl.exe -s -o "$env:TEMP\k276_sw"  'https://wuld.ink/sw.js'
  if ((Md5 "$env:TEMP\k276_man") -eq 'd74af82763244ec469117690b232e86f') { Write-Host 'OK  served /manifest.webmanifest md5' } else { Write-Host 'WARN /manifest.webmanifest not yet fresh (edge-cold -- re-fetch in ~1 min)' }
  if ((Md5 "$env:TEMP\k276_sw")  -eq '6fa5b396c803246bfafbea3ad98658e0') { Write-Host 'OK  served /sw.js md5' } else { Write-Host 'WARN /sw.js not yet fresh (edge-cold)' }
  curl.exe -s -o "$env:TEMP\k276_glo" 'https://wuld.ink/glossary/'
  $g = Get-Content "$env:TEMP\k276_glo" -Raw
  if (($g -match 'manifest\.webmanifest') -and ($g -match 'sw-register\.js\?v=K276')) { Write-Host 'OK  /glossary/ carries manifest + sw-register (content-grep)' } else { Write-Host 'WARN /glossary/ PWA head links not yet served (edge-cold)' }
  curl.exe -s -o "$env:TEMP\k276_idx" 'https://wuld.ink/'
  $ix = Get-Content "$env:TEMP\k276_idx" -Raw
  if (($ix -match 'manifest\.webmanifest') -and ($ix -notmatch 'sw-register')) { Write-Host 'OK  index.html manifest-only (D1 held)' } else { Write-Host 'WARN index.html D1 check pending (edge-cold)' }
  curl.exe -s -o "$env:TEMP\k276_comb" 'https://library.wuld.ink/combined'
  $cs = (Get-Item "$env:TEMP\k276_comb").Length
  if ($cs -gt 2900000) { Write-Host "OK  flagship /combined still serving ($cs B, untouched)" } else { Write-Host "WARN flagship /combined served $cs B (edge-cold SPA wrapper -- re-fetch)" }
  Write-Host '--- K276 ship complete (NO PIN). Record the commit sha; a phone can now Add-to-Home-Screen. ---'
}
