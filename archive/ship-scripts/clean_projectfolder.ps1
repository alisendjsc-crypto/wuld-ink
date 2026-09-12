<#
.SYNOPSIS
  Reports and archives residual files in a project folder. Never deletes.

.DESCRIPTION
  Three passes:
    1. JUNK      .crdownload / .tmp / .partial leftovers and "name (1).ext" duplicate downloads.
    2. SUPERSEDED  versioned families (foo_v3_8_0.json, libcanon-v0_11.md, ...) beyond the
                   newest -Keep of each family. Version is parsed numerically, so v0_11
                   sorts after v0_9. Files whose name does not END in a version are never
                   touched -- foo_v3_8_0_pre_render_backup.html is left alone by design.
    3. EMPTY     directories with no files anywhere beneath them.

  Report mode (the default) changes nothing. Archive mode MOVES the selected files into
  _archive\<yyyy-MM-dd>\ under the same root, keeping their relative paths, so anything
  taken wrongly can be moved straight back. Deleting the archive is left to you.

.EXAMPLE
  .\Clean-ProjectFolder.ps1
  .\Clean-ProjectFolder.ps1 -Root 'C:\Users\y_m_a\Downloads\Argument Library' -Keep 3
  .\Clean-ProjectFolder.ps1 -Root 'A','B' -Mode Archive
#>
[CmdletBinding()]
param(
  [string[]] $Root = @("$env:USERPROFILE\Downloads\Argument Library"),
  [ValidateSet('Report','Archive')] [string] $Mode = 'Report',
  [int]      $Keep       = 2,
  [double]   $BigFileMB  = 5,
  [switch]   $Recurse
)

$ErrorActionPreference = 'Stop'
function HR { param([double]$b)
  if ($b -ge 1GB) { '{0:N2} GB' -f ($b/1GB) }
  elseif ($b -ge 1MB) { '{0:N1} MB' -f ($b/1MB) }
  elseif ($b -ge 1KB) { '{0:N0} KB' -f ($b/1KB) }
  else { "$b B" } }

# version key: "3_8_10" -> sortable padded string, so v0_11 > v0_9
function VerKey { param([string]$v)
  ($v -split '[._]' | ForEach-Object { '{0:D6}' -f [int]$_ }) -join '.' }

foreach ($r in $Root) {
  if (-not (Test-Path -LiteralPath $r)) { Write-Warning "not found: $r"; continue }
  $r = (Resolve-Path -LiteralPath $r).Path
  Write-Host ""
  Write-Host ("=" * 78)
  Write-Host "  $r"
  Write-Host ("=" * 78)

  $all = Get-ChildItem -LiteralPath $r -File -Recurse:$Recurse -Force |
         Where-Object { $_.FullName -notmatch '\\_archive\\' }
  if (-not $all) { Write-Host "  (no files)"; continue }

  Write-Host ("  {0} files, {1} total" -f $all.Count, (HR ($all | Measure-Object Length -Sum).Sum))

  # ---- pass 1: junk -------------------------------------------------------
  $junk = $all | Where-Object {
    $_.Extension -in '.crdownload','.tmp','.partial' -or $_.BaseName -match ' \(\d+\)$' }

  # ---- pass 2: superseded versions ---------------------------------------
  $superseded = @()
  $all | Where-Object { $_ -notin $junk } |
    ForEach-Object {
      if ($_.BaseName -match '^(?<stem>.+?)[-_ ]v?(?<ver>\d+(?:[._]\d+)*)$') {
        [pscustomobject]@{
          Family = ('{0}|{1}|{2}' -f $Matches.stem, $_.Extension, $_.DirectoryName)
          Ver    = VerKey $Matches.ver
          File   = $_ }
      }
    } | Group-Object Family | Where-Object { $_.Count -gt $Keep } | ForEach-Object {
      $ordered = $_.Group | Sort-Object Ver, { $_.File.LastWriteTime } -Descending
      $superseded += ($ordered | Select-Object -Skip $Keep)
    }

  # ---- pass 3: empty dirs -------------------------------------------------
  $emptyDirs = @()
  if ($Recurse) {
    $emptyDirs = Get-ChildItem -LiteralPath $r -Directory -Recurse -Force |
      Where-Object { $_.FullName -notmatch '\\_archive\\' -and
                     -not (Get-ChildItem -LiteralPath $_.FullName -File -Recurse -Force) }
  }

  # ---- report -------------------------------------------------------------
  $sections = @(
    @{ Name = 'JUNK  (download leftovers, duplicate "(1)" copies)'; Items = $junk }
    @{ Name = "SUPERSEDED  (versioned families, keeping newest $Keep)"
       Items = ($superseded | ForEach-Object { $_.File }) }
  )
  $picked = @()
  foreach ($s in $sections) {
    $items = @($s.Items)
    Write-Host ""
    Write-Host ("  -- {0}: {1} file(s), {2}" -f $s.Name, $items.Count,
                (HR (($items | Measure-Object Length -Sum).Sum)))
    $items | Sort-Object Length -Descending | Select-Object -First 25 | ForEach-Object {
      Write-Host ("     {0,10}  {1}" -f (HR $_.Length),
                  $_.FullName.Substring($r.Length).TrimStart('\')) }
    if ($items.Count -gt 25) { Write-Host "     ... and $($items.Count - 25) more" }
    $picked += $items
  }
  if ($emptyDirs) {
    Write-Host ""
    Write-Host ("  -- EMPTY DIRECTORIES: {0}" -f $emptyDirs.Count)
    $emptyDirs | ForEach-Object { Write-Host ("     {0}" -f $_.FullName.Substring($r.Length).TrimStart('\')) }
  }

  # biggest files, for the eyeball pass no rule can replace
  Write-Host ""
  Write-Host ("  -- BIGGEST FILES over {0} MB (not selected, shown so you can judge)" -f $BigFileMB)
  $all | Where-Object { $_.Length -gt $BigFileMB * 1MB } | Sort-Object Length -Descending |
    Select-Object -First 15 | ForEach-Object {
      $mark = if ($_ -in $picked) { '*' } else { ' ' }
      Write-Host ("   {0} {1,10}  {2}" -f $mark, (HR $_.Length),
                  $_.FullName.Substring($r.Length).TrimStart('\')) }

  $total = ($picked | Measure-Object Length -Sum).Sum
  Write-Host ""
  Write-Host ("  SELECTED: {0} file(s), {1}" -f $picked.Count, (HR $total))

  # ---- archive ------------------------------------------------------------
  if ($Mode -eq 'Archive' -and $picked.Count) {
    $dest = Join-Path $r ("_archive\{0:yyyy-MM-dd}" -f (Get-Date))
    foreach ($f in $picked) {
      $rel = $f.FullName.Substring($r.Length).TrimStart('\')
      $to  = Join-Path $dest $rel
      New-Item -ItemType Directory -Force -Path (Split-Path $to) | Out-Null
      Move-Item -LiteralPath $f.FullName -Destination $to -Force
    }
    foreach ($d in $emptyDirs) {
      if (Test-Path -LiteralPath $d.FullName) { Remove-Item -LiteralPath $d.FullName -Force }
    }
    Write-Host ""
    Write-Host "  MOVED to $dest"
    Write-Host "  Nothing was deleted. Check the archive, then delete that folder yourself."
  } elseif ($picked.Count) {
    Write-Host "  (report only -- re-run with -Mode Archive to move these aside)"
  }
}
