& {
  # ============================================================================
  # K305 SHIP -- the verb-map gap.  NO PIN.  NO efilist.  NO search-index.  NO ?v.
  # ONE commit.  65 forms land, 22 held, THREE PULLED (grief reading on pos-life-gift-01).
  # ============================================================================
  $ErrorActionPreference = 'Continue'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "ABORT: no .git at $repo"; return }
  Set-Location $repo
  Remove-Item '.git\index.lock*' -Force -ErrorAction SilentlyContinue
  Get-ChildItem '.git\objects' -Recurse -Filter 'tmp_obj_*' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  function Md5($p) { (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }

  $head = (git rev-parse HEAD 2>$null); if (-not $head) { Write-Host 'ABORT: no rev-parse'; return }
  $head = $head.Trim()
  git fetch origin main --quiet
  if ($head.Substring(0,7) -ne '47e1f9b') { Write-Host "ABORT: HEAD $($head.Substring(0,7)) != K304 47e1f9b"; return }
  if ($head -ne (git rev-parse origin/main).Trim()) { Write-Host 'ABORT: HEAD != origin/main'; return }
  Write-Host "OK  HEAD == origin == $($head.Substring(0,7))"

  $bases = @{
    'src/components/omega-corpus-mrgrey.json' = '23bc78fecaedfae74c179053fc123ba0'
    'tools/omega/coverage_audit.cjs'          = 'f7263137141c9e777c6fd479a68174fb'
    'CLAUDE.md'                               = '81fb577661e2d4f8705c739d7dbdea35'
  }
  foreach ($k in $bases.Keys) {
    $got = (git rev-parse "HEAD:$k").Trim().Substring(0,32)
    if ($got -ne $bases[$k]) { Write-Host "ABORT: base blob $k"; Write-Host "         got  $got"; Write-Host "         want $($bases[$k])"; return }
  }
  Write-Host 'OK  3 base blobs match HEAD'

  $res = @{
    'src\components\omega-corpus-mrgrey.json'          = 'ed4b9442c1307b3a52c3e245d49c72f3'
    'tools\omega\coverage_audit.cjs'                   = '5202b2d22f6f34cf9a677d3d68942466'
    'tools\omega\coverage-audit-K305.json'             = '5e9153ae369747e00d90f32cb57240aa'
    'tools\omega\coverage-audit-K305.md'               = '533a152d11f5be67664b3a43c349164a'
    'tools\omega\k305\sweep_wide.cjs'                  = '2e25f852df151120b1724046685e5288'
    'tools\omega\k305\sweep_wide.json'                 = 'afe8eb4d25a9a6253eb33052b5a74f71'
    'tools\omega\k305\fold_k305_wide.py'               = '4bbb97e38ab7bcf4cdeccf0a25fb0e0a'
    'tools\omega\k305\review_batch_pass_v1.csv'        = 'e40cd1299ca916b44093ed2a9bb6c4f2'
    'CLAUDE.md'                                        = '5396634d9e15a2d09c9f70ff0aa20fe4'
  }
  foreach ($k in $res.Keys) {
    if (-not (Test-Path $k)) { Write-Host "ABORT: missing $k"; return }
    $g = Md5 $k
    if ($g -ne $res[$k]) { Write-Host "ABORT: result $k"; Write-Host "         got  $g"; Write-Host "         want $($res[$k])"; return }
  }
  Write-Host 'OK  9 result md5s match the gated bytes (full 32 chars, measured)'

  # THE NINE HOLDS must be absent. Two of these shipped in an earlier draft of this
  # session's fold because a hand-copied list lost them; the gate is the durable fix.
  $holds = @('why were you still here','yet here you were','got therapy','this was eugenics',
             'this was nazi eugenics','this was a slippery slope to eugenics','pain was subjective',
             'pain was relative','one persons pain was anothers pleasure')
  foreach ($h in $holds) {
    $c = @(Select-String -LiteralPath 'src\components\omega-corpus-mrgrey.json' -Pattern "`"$h`"" -SimpleMatch).Count
    if ($c -ne 0) { Write-Host "ABORT: HELD form is declared: $h"; return }
  }
  Write-Host "OK  all 9 seat-held forms absent from the corpus"

  # THE THREE PULLS must be gone, and their present-tense claims must remain.
  foreach ($p in @('life was beautiful','life was a gift','life was a blessing')) {
    $c = @(Select-String -LiteralPath 'src\components\omega-corpus-mrgrey.json' -Pattern "`"$p`"" -SimpleMatch).Count
    if ($c -ne 0) { Write-Host "ABORT: pulled form still declared: $p"; return }
  }
  foreach ($p in @('life is beautiful','life is a gift','life is a blessing')) {
    $c = @(Select-String -LiteralPath 'src\components\omega-corpus-mrgrey.json' -Pattern "`"$p`"" -SimpleMatch).Count
    if ($c -ne 1) { Write-Host "ABORT: present-tense claim missing: $p"; return }
  }
  Write-Host 'OK  3 grief forms pulled; all 3 present-tense claims intact'

  $shape = @(
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"they regretted jumping"';   want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"survivors regretted it"';   want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"your view was ableist"';    want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"your view led to violence"'; want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"you still chose to live"';  want=1 },
    @{ f='tools\omega\coverage_audit.cjs';          n='forms.length === 1076';      want=1 },
    @{ f='CLAUDE.md';                               n='### K305 ';                  want=1 }
  )
  foreach ($s in $shape) {
    $c = @(Select-String -LiteralPath $s.f -Pattern $s.n -SimpleMatch).Count
    if ($c -ne $s.want) { Write-Host "ABORT: $($s.f) '$($s.n)' = $c want $($s.want)"; return }
  }
  Write-Host 'OK  7 shape asserts'

  node tools\yurei\yurei-parity.cjs         | Select-Object -Last 1
  node tools\omega\omega-persona-gate.cjs   | Select-Object -Last 1
  node tools\omega\mrgrey-register-gate.cjs | Select-Object -Last 1
  node tools\omega\coverage_audit.cjs       | Select-Object -Last 1                                  # cclxxv: NO ARGUMENTS
  node tools\omega\successor-stage-e2e.cjs  | Select-Object -Last 1
  node tools\omega\wgate-e2e.cjs            | Select-Object -Last 1
  Write-Host '^^ expect: PARITY GREEN / GATE GREEN / 6966 checks / fatal=0 / 180-180 / PASS 24-24'

  git add src\components\omega-corpus-mrgrey.json
  git add tools\omega\coverage_audit.cjs
  git add tools\omega\coverage-audit-K305.json
  git add tools\omega\coverage-audit-K305.md
  git add tools\omega\k305\sweep_wide.cjs
  git add tools\omega\k305\sweep_wide.json
  git add tools\omega\k305\fold_k305_wide.py
  git add tools\omega\k305\review_batch_pass_v1.csv
  git add CLAUDE.md
  $n = @(git diff --cached --name-only).Count
  if ($n -ne 9) { Write-Host "ABORT: staged $n paths, want 9"; git reset; return }
  Write-Host "OK  staged $n paths"

  git commit -q -m "K305 verb-map gap: 65 inflected forms (wide sweep), 22 held per the library seat's REVIEW pass, 3 pulled for a grief reading on pos-life-gift-01; NO PIN"
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: commit failed'; return }
  Write-Host "OK  commit $((git rev-parse --short HEAD).Trim())"

  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: push failed'; return }
  Write-Host 'OK  pushed'

  Start-Sleep -Seconds 75
  $t = "$env:TEMP\k305"
  curl.exe -s -o "$t.json" 'https://wuld.ink/components/omega-corpus-mrgrey.json?vk305=1'
  $m = Md5 "$t.json"; if ($m -eq 'ed4b9442c1307b3a52c3e245d49c72f3') { Write-Host 'OK  served corpus == ed4b9442 (189/1076)' } else { Write-Host "WARN corpus = $($m.Substring(0,8))" }
  curl.exe -s -o "$t.comb" 'https://library.wuld.ink/combined'
  $m = Md5 "$t.comb"; if ($m -eq 'e654eabd32fa95e5969d49e6eb15aa87') { Write-Host 'OK  flagship HELD e654eabd' } else { Write-Host "WARN flagship = $($m.Substring(0,8))" }
  Remove-Item "$t.*" -Force -ErrorAction SilentlyContinue
  Write-Host ''
  Write-Host 'K305 done.  One probe on /successor/, and it is not about routing:'
  Write-Host '   type   life was a gift'
  Write-Host 'It must NOT answer as an objection. That is what someone writes about a person'
  Write-Host 'who has died, and until now the proxy argued with them about it.'
}
