& {
  # ============================================================================
  # K303 SHIP -- TX17-BACK fold.  NO PIN.  NO efilist.  NO search-index.  NO ?v.
  # ONE commit.  Nothing served by a versioned URL changed (the corpora are
  # fetched at bare URLs and sw.js precaches neither), so no cache-bust is owed.
  # Every byte-check runs BEFORE the first `git add` (K289).
  # ============================================================================
  $ErrorActionPreference = 'Continue'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "ABORT: no .git at $repo"; return }   # ccliv
  Set-Location $repo
  Remove-Item '.git\index.lock*' -Force -ErrorAction SilentlyContinue                                # cclix
  Get-ChildItem '.git\objects' -Recurse -Filter 'tmp_obj_*' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  function Md5($p) { (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }

  $head = (git rev-parse HEAD 2>$null)
  if (-not $head) { Write-Host 'ABORT: git rev-parse returned nothing'; return }
  $head = $head.Trim()
  git fetch origin main --quiet
  $orig = (git rev-parse origin/main).Trim()
  if ($head -ne '5d47ad3') { if ($head.Substring(0,7) -ne '5d47ad3') { Write-Host "ABORT: HEAD $($head.Substring(0,7)) != K301b 5d47ad3"; return } }
  if ($head -ne $orig) { Write-Host "ABORT: HEAD != origin/main"; return }
  Write-Host "OK  HEAD == origin == $($head.Substring(0,7))"

  $bases = @{
    'src/components/omega-corpus-mrgrey.json' = '5571a8402c73beafffdf59d969f8ed92'
    'src/components/yurei-corpus-public.json' = '88f2e722071bdf78e6e8f33d1275d400'
    'tools/omega/coverage_audit.cjs'          = 'f4cd6ea57f81836c775384aaf707752e'
    'tools/omega/successor-stage-e2e.cjs'     = 'b7bb41feddd8fe117fa983a0b801cca1'
    'CLAUDE.md'                               = 'fd4a8c61a110913136a6f28db5d538cf'
  }
  foreach ($k in $bases.Keys) {
    $got = (git rev-parse "HEAD:$k").Trim().Substring(0,32)
    if ($got -ne $bases[$k]) { Write-Host "ABORT: base blob $k = $got"; return }
  }
  Write-Host "OK  5 base blobs match HEAD"

  $res = @{
    'src\components\omega-corpus-mrgrey.json' = '2bc9beb331156f0b3d6ad0e57f10bdc9'
    'src\components\yurei-corpus-public.json' = '4f5c82e1a5edccc613486214a048ac14'
    'tools\omega\coverage_audit.cjs'          = 'd69602d335a25efdd4a0947fe3ecf85f'
    'tools\omega\successor-stage-e2e.cjs'     = '0ad4df2bd0aad4f929682d319cfb78d5'
    'tools\omega\coverage-audit-K303.json'    = '5c615e16aa4b1574e27583a20bb09326'
    'tools\omega\coverage-audit-K303.md'      = '280d594fd4b68fc723950215a1dfae41'
    'tools\omega\k303\fold_k303_floor.py'    = '21e805dd0488b94a982567c960d68395'
    'tools\omega\k303\fold_k303b_harmother.py' = '35480ca55da1d05c5ba3fab0c1fe525d'
    'CLAUDE.md'                               = '5280b4cc24e71b575d279810a5218095'
  }
  foreach ($k in $res.Keys) {
    if (-not (Test-Path $k)) { Write-Host "ABORT: missing $k"; return }
    $g = Md5 $k
    # print the FULL md5 on both sides. K303 attempt 1 truncated both to 8 and printed
    # "f7fea0ec want f7fea0ec" on a REAL mismatch -- a message that reads as a
    # contradiction and hides its own cause. A gate must be legible when it fires.
    if ($g -ne $res[$k]) { Write-Host "ABORT: result $k"; Write-Host "         got  $g"; Write-Host "         want $($res[$k])"; return }
  }
  Write-Host "OK  9 result md5s match the gated bytes (full 32 chars, measured)"

  # shape asserts -- LINES, measured with the same instrument that checks them (K293)
  $shape = @(
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"my life is not worth living"'; want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"nothing worth living for"';    want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"not worth living anymore"';    want=1 },
    @{ f='src\components\yurei-corpus-public.json'; n='"my life is not worth living"'; want=1 },
    @{ f='src\components\yurei-corpus-public.json'; n='"nothing worth living for"';    want=1 },
    @{ f='src\components\yurei-corpus-public.json'; n='"not worth living anymore"';    want=1 },
    @{ f='tools\omega\coverage_audit.cjs';          n='forms.length === 891';          want=1 },
    @{ f='tools\omega\coverage_audit.cjs';          n='class2-normalizer-eaten';       want=2 },
    @{ f='tools\omega\successor-stage-e2e.cjs';     n='PASS 15c: REACHABILITY';        want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='Out of character, plainly.';     want=2 },
    @{ f='src\components\yurei-corpus-public.json'; n='Out of character, plainly.';     want=2 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='the pressure underneath that you want help with'; want=1 },
    @{ f='CLAUDE.md';                                n='#### K303b ';                    want=1 },
    @{ f='CLAUDE.md';                               n='### K303 ';                     want=1 }
  )
  foreach ($s in $shape) {
    $c = @(Select-String -LiteralPath $s.f -Pattern $s.n -SimpleMatch).Count
    if ($c -ne $s.want) { Write-Host "ABORT: $($s.f) lines matching '$($s.n)' = $c want $($s.want)"; return }
  }
  Write-Host "OK  14 shape asserts"

  # gates, on the bytes about to be staged
  node tools\yurei\yurei-parity.cjs         | Select-Object -Last 1
  node tools\omega\omega-persona-gate.cjs   | Select-Object -Last 1
  node tools\omega\mrgrey-register-gate.cjs | Select-Object -Last 1
  node tools\omega\coverage_audit.cjs       | Select-Object -Last 1                                  # cclxxv: NO ARGUMENTS
  node tools\omega\successor-stage-e2e.cjs  | Select-Object -Last 1
  node tools\omega\wgate-e2e.cjs            | Select-Object -Last 1
  Write-Host "^^ expect: PARITY GREEN / GATE GREEN / 6213 checks / fatal=0 / 180-180 / PASS 24-24"

  git add src\components\omega-corpus-mrgrey.json
  git add src\components\yurei-corpus-public.json
  git add tools\omega\coverage_audit.cjs
  git add tools\omega\successor-stage-e2e.cjs
  git add tools\omega\coverage-audit-K303.json
  git add tools\omega\coverage-audit-K303.md
  git add tools\omega\k303\fold_k303_floor.py
  git add tools\omega\k303\fold_k303b_harmother.py
  git add CLAUDE.md
  $n = @(git diff --cached --name-only).Count
  if ($n -ne 9) { Write-Host "ABORT: staged $n paths, want 9"; git reset; return }
  Write-Host "OK  staged $n paths"

  git commit -q -m "K303 TX17/TX18-BACK fold: three floor forms (tense distinction), reachability gate, landing-independent miss-class column, harm-other body reworded from c-crisis-03; NO PIN"
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: commit failed'; return }
  Write-Host "OK  commit $((git rev-parse --short HEAD).Trim())"

  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: push failed'; return }
  Write-Host 'OK  pushed'

  Start-Sleep -Seconds 75
  $t = "$env:TEMP\k303"
  curl.exe -s -o "$t.json" 'https://wuld.ink/components/omega-corpus-mrgrey.json?vk303=1'
  $m = Md5 "$t.json"; if ($m -eq '2bc9beb331156f0b3d6ad0e57f10bdc9') { Write-Host 'OK  served mrgrey corpus == 2bc9beb3 (188/891)' } else { Write-Host "WARN mrgrey = $($m.Substring(0,8))" }
  curl.exe -s -o "$t.pub" 'https://wuld.ink/components/yurei-corpus-public.json?vk303=1'
  $m = Md5 "$t.pub"; if ($m -eq '4f5c82e1a5edccc613486214a048ac14') { Write-Host 'OK  served yurei-public == 4f5c82e1 (shared floor)' } else { Write-Host "WARN yurei-public = $($m.Substring(0,8))" }
  curl.exe -s -o "$t.comb" 'https://library.wuld.ink/combined'
  $m = Md5 "$t.comb"; if ($m -eq 'e654eabd32fa95e5969d49e6eb15aa87') { Write-Host 'OK  flagship HELD e654eabd (pin v4.0.0)' } else { Write-Host "WARN flagship = $($m.Substring(0,8))" }
  Remove-Item "$t.*" -Force -ErrorAction SilentlyContinue
  Write-Host ''
  Write-Host 'K303 done.  Then the one check no gate can make, on /successor/:'
  Write-Host '  type  my life isnt worth living   -> the FLOOR must answer'
  Write-Host '  type  life isnt worth living      -> must still point at the library'
  Write-Host 'That pair is the whole tense distinction.'
}
