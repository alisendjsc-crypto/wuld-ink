& {
  # ============================================================================
  # K304 SHIP -- the inflection fold.  NO PIN.  NO efilist.  NO search-index.  NO ?v.
  # ONE commit.  Nothing served by a versioned URL changed; the corpus is fetched
  # at a bare URL and sw.js precaches neither it nor the stage.
  # Every byte-check runs BEFORE the first `git add` (K289).
  # ============================================================================
  $ErrorActionPreference = 'Continue'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "ABORT: no .git at $repo"; return }
  Set-Location $repo
  Remove-Item '.git\index.lock*' -Force -ErrorAction SilentlyContinue                                # cclix
  Get-ChildItem '.git\objects' -Recurse -Filter 'tmp_obj_*' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  function Md5($p) { (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }

  $head = (git rev-parse HEAD 2>$null); if (-not $head) { Write-Host 'ABORT: no rev-parse'; return }
  $head = $head.Trim()
  git fetch origin main --quiet
  $orig = (git rev-parse origin/main).Trim()
  if ($head.Substring(0,7) -ne '3844645') { Write-Host "ABORT: HEAD $($head.Substring(0,7)) != K303 3844645"; return }
  if ($head -ne $orig) { Write-Host 'ABORT: HEAD != origin/main'; return }
  Write-Host "OK  HEAD == origin == $($head.Substring(0,7))"

  $bases = @{
    'src/components/omega-corpus-mrgrey.json' = 'd53ad381e9cdfaf07490230a585236a0'
    'tools/omega/coverage_audit.cjs'          = '8aab4ac9b6881cac2f77d67aa9e4d4df'
  }
  foreach ($k in $bases.Keys) {
    $got = (git rev-parse "HEAD:$k").Trim().Substring(0,32)
    if ($got -ne $bases[$k]) { Write-Host "ABORT: base blob $k"; Write-Host "         got  $got"; Write-Host "         want $($bases[$k])"; return }
  }
  Write-Host 'OK  2 base blobs match HEAD'

  # full 32 chars on both sides -- the K303 abort printed truncated halves and read as
  # "f7fea0ec want f7fea0ec" on a REAL mismatch. A gate must be legible when it fires.
  $res = @{
    'src\components\omega-corpus-mrgrey.json'              = '0f0a180342905d4165b2b654e31a2b2a'
    'tools\omega\coverage_audit.cjs'                       = '5fc396678b0709a21b1d3e8f60d80ea2'
    'tools\omega\coverage-audit-K304.json'                 = 'd4bd3275afcd6fcebf6c1192a6996bf1'
    'tools\omega\coverage-audit-K304.md'                   = '3f9f690763b075b443718729265dff0b'
    'tools\omega\k304\fold_k304_names.py'                  = '57c667f5f11031e0271e9eca8041fc27'
    'tools\omega\k304\fold_k304_inflected.py'              = 'b5313e0be3d16bbedbba6d753171fa18'
    'tools\omega\k304\fold_k304_k268.py'                   = '9bb668c5f33e6bb954b013ea1bce17d9'
    'tools\omega\k304\inflected_variants_library_v1.csv'   = '23e0ad1dbf180b8bd46204473098dc69'
    'CLAUDE.md'                                            = '76e6cd340310ce8a9d307e286f5870e6'
  }
  foreach ($k in $res.Keys) {
    if (-not (Test-Path $k)) { Write-Host "ABORT: missing $k"; return }
    $g = Md5 $k
    if ($g -ne $res[$k]) { Write-Host "ABORT: result $k"; Write-Host "         got  $g"; Write-Host "         want $($res[$k])"; return }
  }
  Write-Host 'OK  9 result md5s match the gated bytes (full 32 chars, measured)'

  $shape = @(
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"id": "mg-oracle-names-01"';        want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"form": "scanlon"';                 want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"form": "boonin"';                  want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"form": "parfit"';                  want=2 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='I answer arguments, not authors.';  want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"first world problems"';            want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"value was subject relative"';      want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"hardship was what shaped a person"'; want=1 },
    @{ f='tools\omega\coverage_audit.cjs';          n='forms.length === 1014';             want=1 },
    @{ f='tools\omega\coverage_audit.cjs';          n='"parfit","procreation"';            want=1 },
    @{ f='CLAUDE.md';                               n='### K304 ';                         want=1 }
  )
  foreach ($s in $shape) {
    $c = @(Select-String -LiteralPath $s.f -Pattern $s.n -SimpleMatch).Count
    if ($c -ne $s.want) { Write-Host "ABORT: $($s.f) lines matching '$($s.n)' = $c want $($s.want)"; return }
  }
  Write-Host 'OK  11 shape asserts'

  # the REVIEW batch must NOT have shipped -- 19 rows the library seat has not read yet
  $rev = @(Select-String -LiteralPath 'src\components\omega-corpus-mrgrey.json' -Pattern 'why were you still here' -SimpleMatch).Count
  if ($rev -ne 0) { Write-Host "ABORT: a REVIEW-batch form is in the corpus ($rev)"; return }
  Write-Host 'OK  REVIEW batch held back (0 of 19 folded)'

  node tools\yurei\yurei-parity.cjs         | Select-Object -Last 1
  node tools\omega\omega-persona-gate.cjs   | Select-Object -Last 1
  node tools\omega\mrgrey-register-gate.cjs | Select-Object -Last 1
  node tools\omega\coverage_audit.cjs       | Select-Object -Last 1                                  # cclxxv: NO ARGUMENTS
  node tools\omega\successor-stage-e2e.cjs  | Select-Object -Last 1
  node tools\omega\wgate-e2e.cjs            | Select-Object -Last 1
  Write-Host '^^ expect: PARITY GREEN / GATE GREEN / 6718 checks / fatal=0 / 180-180 / PASS 24-24'

  git add src\components\omega-corpus-mrgrey.json
  git add tools\omega\coverage_audit.cjs
  git add tools\omega\coverage-audit-K304.json
  git add tools\omega\coverage-audit-K304.md
  git add tools\omega\k304\fold_k304_names.py
  git add tools\omega\k304\fold_k304_inflected.py
  git add tools\omega\k304\fold_k304_k268.py
  git add tools\omega\k304\inflected_variants_library_v1.csv
  git add CLAUDE.md
  $n = @(git diff --cached --name-only).Count
  if ($n -ne 9) { Write-Host "ABORT: staged $n paths, want 9"; git reset; return }
  Write-Host "OK  staged $n paths"

  git commit -q -m "K304 inflection fold: mg-oracle-names-01 (build the destination, no deletion), 102 BULK + 3 plural + 16 K268/K270 variants, REVIEW batch held; NO PIN"
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: commit failed'; return }
  Write-Host "OK  commit $((git rev-parse --short HEAD).Trim())"

  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: push failed'; return }
  Write-Host 'OK  pushed'

  Start-Sleep -Seconds 75
  $t = "$env:TEMP\k304"
  curl.exe -s -o "$t.json" 'https://wuld.ink/components/omega-corpus-mrgrey.json?vk304=1'
  $m = Md5 "$t.json"; if ($m -eq '0f0a180342905d4165b2b654e31a2b2a') { Write-Host 'OK  served corpus == 0f0a1803 (189/1014)' } else { Write-Host "WARN corpus = $($m.Substring(0,8))" }
  curl.exe -s -o "$t.comb" 'https://library.wuld.ink/combined'
  $m = Md5 "$t.comb"; if ($m -eq 'e654eabd32fa95e5969d49e6eb15aa87') { Write-Host 'OK  flagship HELD e654eabd (pin v4.0.0)' } else { Write-Host "WARN flagship = $($m.Substring(0,8))" }
  Remove-Item "$t.*" -Force -ErrorAction SilentlyContinue
  Write-Host ''
  Write-Host 'K304 done.  Then on /successor/, two probes:'
  Write-Host '  type  bradley                      -> the shelf answer, not "off the path I keep"'
  Write-Host '  type  value was subject relative   -> the signed position answers'
  Write-Host 'The first is the new entry. The second is the whole 123-form fold in one probe.'
}
