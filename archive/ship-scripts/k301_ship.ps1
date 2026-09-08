& {
  # ============================================================================
  # K301 SHIP -- the ratifications fold.  NO PIN.  NO efilist.  NO search-index.
  # TWO commits, ONE push:  1) the work    2) the sitemap lastmod regen
  # Every byte-check runs BEFORE the first `git add` (K289): a failed gate costs
  # a paste, never a bad commit.  Nothing is moved -- Cowork wrote the files at
  # their final paths -- so an abort leaves the tree exactly as it stands now.
  # ============================================================================
  $ErrorActionPreference = 'Continue'
  $repo = 'C:\Users\y_m_a\Projects\wuld-ink'
  if (-not (Test-Path (Join-Path $repo '.git'))) { Write-Host "ABORT: no .git at $repo"; return }   # ccliv
  Set-Location $repo
  Remove-Item '.git\index.lock*' -Force -ErrorAction SilentlyContinue                                # cclix -- incl. a .stale-k301 left by Cowork's read-only git (the mount cannot unlink, only rename)
  Get-ChildItem '.git\objects' -Recurse -Filter 'tmp_obj_*' -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  function Md5($p) { (Get-FileHash -Algorithm MD5 -LiteralPath $p).Hash.ToLower() }                  # never `H` (-> Get-History)

  # ---- 1. one committer -----------------------------------------------------
  $head = (git rev-parse HEAD 2>$null)
  if (-not $head) { Write-Host 'ABORT: git rev-parse returned nothing'; return }
  $head = $head.Trim()
  git fetch origin main --quiet
  $orig = (git rev-parse origin/main).Trim()
  if ($head -ne '54f92924add2bc442bc877cd77b389f09165d35a') { Write-Host "ABORT: HEAD $head != K300 54f9292"; return }
  if ($head -ne $orig) { Write-Host "ABORT: HEAD != origin/main ($orig)"; return }
  Write-Host "OK  HEAD == origin == $($head.Substring(0,7))"

  # ---- 2. base-blob guards: the files this fold edits are untouched at HEAD --
  $bases = @{
    'CLAUDE.md'                               = 'e9648c36f29f84f5101f203e0a319d59'
    'src/book/index.html'                     = '4e161ab641e3ba73e79014281d56e818'
    'src/components/omega-corpus-mrgrey.json' = '94951b4ba30f2abc22cd27f46cefdc9a'
    'src/components/successor-stage.js'       = 'ede438b1a39bdf22775a56518030ef2e'
    'src/components/yurei-corpus-public.json' = 'a39bafd975e3468fe8f63e8135ec5943'
    'src/components/yurei-oracle.js'          = 'b8ccbda7683b2b84dddfcf5a3296e24b'
    'src/successor/index.html'                = '940cdad2604165b7cab23be0141caab1'
    'tools/omega/coverage_audit.cjs'          = 'f9ca1b829a251e44992add2c1b40d67d'
    'tools/omega/successor-stage-e2e.cjs'     = 'c747cf7e11b7f9bd1110d6c37d25c30f'
    'tools/yurei/yurei_harness.py'            = '287770a95549a2d3115488e7feafe677'
  }
  foreach ($k in $bases.Keys) {
    $got = (git rev-parse "HEAD:$k").Trim().Substring(0,32)
    if ($got -ne $bases[$k]) { Write-Host "ABORT: base blob $k = $got want $($bases[$k])"; return }
  }
  Write-Host "OK  10 base blobs match HEAD"

  # ---- 3. result md5 gates: the bytes on disk are the bytes that were gated --
  $res = @{
    'CLAUDE.md'                                  = '967292ac796430d35d716d3252275d56'
    'src\book\index.html'                        = '64e023a0401bef4d6c5de4c7cd8719f4'
    'src\components\omega-corpus-mrgrey.json'    = 'ce9d70ec0f994ee03b20feacf78f17a3'
    'src\components\successor-stage.js'          = 'aab19e180164cd194f54290406bd56ef'
    'src\components\yurei-corpus-public.json'    = '6bbf3da99c749eca60a4a1173ddb67a3'
    'src\components\yurei-oracle.js'             = '72f23f89edab8defc2ff5324b8f4304a'
    'src\successor\index.html'                   = '14c34c7e496ed6a999240ac7f6dd3b64'
    'tools\omega\coverage_audit.cjs'             = 'c24c3840b16a25fafa5676154888b837'
    'tools\omega\successor-stage-e2e.cjs'        = '11419a4fd648cf8844e640ccdbab312f'
    'tools\yurei\yurei_harness.py'               = '0881905fbccccca54e14a4ab49eaef3c'
    'tools\gate\reach-audit-K301.json'           = '0ec8a9492448c236b2b8c24345b9715d'
    'tools\gate\reach-audit-K301.md'             = '8222d777529ee991a644d996b34723ea'
    'tools\omega\coverage-audit-K301.json'       = '033143ba2d323913b0440fbcf2d40c59'
    'tools\omega\coverage-audit-K301.md'         = 'a4c2356c983c331831ad1e80da149b84'
    'tools\omega\k300\HANDOUT_K300_rulings.md'   = '1228aaa2ee283cb6768ae96a84094368'
    'tools\omega\k300\fold_k300_rulings.py'      = '349747e5c7821ec1497bffcf720da383'
    'tools\omega\k301\fold_k301_dampening.py'    = '6c6f8c3c3c32d2242a1b5d481c533b76'
  }
  foreach ($k in $res.Keys) {
    if (-not (Test-Path $k)) { Write-Host "ABORT: missing $k"; return }
    $g = Md5 $k
    if ($g -ne $res[$k]) { Write-Host "ABORT: result $k = $($g.Substring(0,8)) want $($res[$k].Substring(0,8))"; return }
  }
  Write-Host "OK  17 result md5s match the gated bytes"

  # ---- 4. shape asserts -- every constant measured as LINES, never occurrences (K293)
  $shape = @(
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"id": "mg-topical-deflect-01"'; want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"id": "c-crisis-harm-other-01"'; want=1 },
    @{ f='src\components\omega-corpus-mrgrey.json'; n='"dampening_exempt": true';       want=3 },
    @{ f='src\components\yurei-corpus-public.json'; n='"id": "c-crisis-harm-other-01"'; want=1 },
    @{ f='src\components\yurei-oracle.js';          n='dampening_exempt';               want=5 },
    @{ f='tools\yurei\yurei_harness.py';            n='dampening_exempt';               want=4 },
    # the parity-relevant fact is the EXECUTABLE reference count, 2 on each side.
    # The raw totals differ (5 vs 4) only because the JS carries an extra doc comment.
    @{ f='src\components\yurei-oracle.js';          n='.dampening_exempt === true';     want=2 },
    @{ f='tools\yurei\yurei_harness.py';            n='"dampening_exempt") is True';    want=2 },
    @{ f='src\components\successor-stage.js';       n='var HELP_ASK = "help";';         want=1 },
    @{ f='src\components\successor-stage.js';       n='if (opening) sendText(HELP_ASK);'; want=1 },
    @{ f='src\successor\index.html';                n='successor-stage.js?v=K301';      want=1 },
    @{ f='src\successor\index.html';                n='successor-stage.css?v=K300';     want=1 },
    @{ f='src\book\index.html';                     n='max-width: 18rem;';              want=1 },
    @{ f='src\book\index.html';                     n='max-width: 14rem;';              want=1 },
    @{ f='tools\omega\coverage_audit.cjs';          n='E.length === 188';               want=1 },
    @{ f='CLAUDE.md';                               n='### K301 ';                      want=1 }
  )
  foreach ($s in $shape) {
    $c = @(Select-String -LiteralPath $s.f -Pattern $s.n -SimpleMatch).Count                          # cclxi: count LINES
    if ($c -ne $s.want) { Write-Host "ABORT: $($s.f) lines matching '$($s.n)' = $c want $($s.want)"; return }
  }
  Write-Host "OK  16 shape asserts"

  # ---- 5. the OLD stage ?v is gone from src (scoped -- CLAUDE.md documents both, cclxxii)
  $old = @(git grep -c --fixed-strings 'successor-stage.js?v=K300' -- src 2>$null).Count
  if ($old -ne 0) { Write-Host "ABORT: residual successor-stage.js?v=K300 in src = $old"; return }
  Write-Host "OK  no stale stage ?v in src"

  # ---- 6. the four house gates + the vessel e2e, on the bytes about to be staged
  node tools\yurei\yurei-parity.cjs        | Select-Object -Last 1
  node tools\omega\omega-persona-gate.cjs  | Select-Object -Last 1
  node tools\omega\mrgrey-register-gate.cjs| Select-Object -Last 1
  node tools\omega\coverage_audit.cjs      | Select-Object -Last 1                                    # cclxxv: NO ARGUMENTS
  node tools\omega\successor-stage-e2e.cjs | Select-Object -Last 1
  node tools\omega\wgate-e2e.cjs           | Select-Object -Last 1
  Write-Host "^^ expect: PARITY GREEN / GATE GREEN / 6210 checks / fatal=0 / 160-160 / PASS 24-24"

  # ---- 7. stage exactly 17 named paths, one per line (ccxxvii; never `git add -u`)
  git add CLAUDE.md
  git add src\book\index.html
  git add src\components\omega-corpus-mrgrey.json
  git add src\components\successor-stage.js
  git add src\components\yurei-corpus-public.json
  git add src\components\yurei-oracle.js
  git add src\successor\index.html
  git add tools\omega\coverage_audit.cjs
  git add tools\omega\successor-stage-e2e.cjs
  git add tools\yurei\yurei_harness.py
  git add tools\gate\reach-audit-K301.json
  git add tools\gate\reach-audit-K301.md
  git add tools\omega\coverage-audit-K301.json
  git add tools\omega\coverage-audit-K301.md
  git add tools\omega\k300\HANDOUT_K300_rulings.md
  git add tools\omega\k300\fold_k300_rulings.py
  git add tools\omega\k301\fold_k301_dampening.py
  $n = @(git diff --cached --name-only).Count
  if ($n -ne 17) { Write-Host "ABORT: staged $n paths, want 17"; git reset; return }                   # MEASURED, never hardcoded in the OK string
  Write-Host "OK  staged $n paths"

  # ---- 8. commit 1
  git commit -q -m "K301 ratifications fold: crisis floor +harm-other, dampening_exempt lane (JS+py parity), topical deflect, [ ? ] speaks, /book/ cover cap; NO PIN"
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: commit 1 failed'; return }
  Write-Host "OK  commit 1 $((git rev-parse --short HEAD).Trim())"

  # ---- 9. commit 2 -- the sitemap regen.  MUST follow commit 1: gen_sitemap takes
  #        lastmod from `git log -1 --format=%as` per page, so regenerating first
  #        would stamp the pre-K301 dates and drift again immediately (K277/K293).
  $py = (Get-Command python -ErrorAction SilentlyContinue)
  if (-not $py) { $py = (Get-Command python3 -ErrorAction SilentlyContinue) }
  if (-not $py) { Write-Host 'NOTE: no python on PATH -- sitemap regen SKIPPED, carry it to K302'; }
  else {
    & $py.Source tools\gen_sitemap.py --repo . --out src\sitemap.xml
    if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: gen_sitemap failed'; return }
    $locs = @(Select-String -LiteralPath 'src\sitemap.xml' -Pattern '<loc>' -SimpleMatch).Count
    if ($locs -ne 66) { Write-Host "ABORT: sitemap has $locs locs, want 66 (route set must NOT change)"; return }
    git add src\sitemap.xml
    $n2 = @(git diff --cached --name-only).Count
    if ($n2 -ne 1) { Write-Host "ABORT: sitemap commit staged $n2 paths, want 1"; git reset; return }
    git commit -q -m "K301b sitemap: lastmod regen (route set held at 66; K246 drift closed)"
    Write-Host "OK  commit 2 $((git rev-parse --short HEAD).Trim())  sitemap 66 locs"
  }

  # ---- 10. push
  git config http.postBuffer 524288000
  git push origin main
  if ($LASTEXITCODE -ne 0) { Write-Host 'ABORT: push failed'; return }
  Write-Host "OK  pushed"

  # ---- 11. live asserts.  Static assets serve clean -> md5 them.  HTML gets the
  #          CF beacon -> content-grep only, never md5 (K258).
  Start-Sleep -Seconds 75
  $t = "$env:TEMP\k301"
  curl.exe -s -o "$t.js"  'https://wuld.ink/components/successor-stage.js?v=K301'
  $m = Md5 "$t.js";  if ($m -eq 'aab19e180164cd194f54290406bd56ef') { Write-Host "OK  served stage js == aab19e18" } else { Write-Host "WARN served stage js = $($m.Substring(0,8))" }
  curl.exe -s -o "$t.json" 'https://wuld.ink/components/omega-corpus-mrgrey.json?vk301=1'
  $m = Md5 "$t.json"; if ($m -eq 'ce9d70ec0f994ee03b20feacf78f17a3') { Write-Host "OK  served corpus == ce9d70ec (188/888)" } else { Write-Host "WARN served corpus = $($m.Substring(0,8))" }
  curl.exe -s -o "$t.pub" 'https://wuld.ink/components/yurei-corpus-public.json?vk301=1'
  $m = Md5 "$t.pub";  if ($m -eq '6bbf3da99c749eca60a4a1173ddb67a3') { Write-Host "OK  served yurei-public == 6bbf3da9 (shared floor)" } else { Write-Host "WARN served yurei-public = $($m.Substring(0,8))" }
  curl.exe -s -o "$t.html" 'https://wuld.ink/successor/'
  $h = Get-Content "$t.html" -Raw
  if ($h -match 'successor-stage\.js\?v=K301') { Write-Host 'OK  page carries js ?v=K301' } else { Write-Host 'WARN page missing js ?v=K301' }
  if ($h -match 'successor-stage\.css\?v=K300') { Write-Host 'OK  page holds css ?v=K300 (byte-unchanged)' } else { Write-Host 'WARN css ?v moved' }
  curl.exe -s -o "$t.book" 'https://wuld.ink/book/'
  if ((Get-Content "$t.book" -Raw) -match 'max-width: 18rem') { Write-Host 'OK  /book/ carries the 18rem cap' } else { Write-Host 'WARN /book/ cap not served yet' }
  curl.exe -s -o "$t.comb" 'https://library.wuld.ink/combined'
  $m = Md5 "$t.comb"; if ($m -eq 'e654eabd32fa95e5969d49e6eb15aa87') { Write-Host 'OK  flagship HELD e654eabd (pin v4.0.0)' } else { Write-Host "WARN flagship = $($m.Substring(0,8))" }
  Remove-Item "$t.*" -Force -ErrorAction SilentlyContinue
  Write-Host ''
  Write-Host 'K301 done.  Then by hand: /successor/ -> press [ ? ] and confirm Mr Grey now SAYS the'
  Write-Host 'capability line (K300 was silent); press it twice more -- it must answer each time.'
  Write-Host 'And on a phone, /book/ -- the cover is smaller and the purchase link nearer the fold.'
}
