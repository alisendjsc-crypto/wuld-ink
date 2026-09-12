"""k318_archive.py -- assemble the archive staging set for WULD_archive_commit.ps1 (WI-K318): the K318 harness and run record,
K317's never-filed drop, the ship scripts that do not gate the filing, the kickoff (SPENT banner prepended) and the stratum;
archive/INDEX.md extended with one section; MANIFEST.tsv (target, md5, git blob sha, bytes, source, source md5); the manifest's
md5 / length / row count spliced into the archive block. Re-run after any change to an archived file. Text only, LF, <= 200 KB,
credential-scanned."""
import hashlib, pathlib, re
D=pathlib.Path('/home/claude/k318'); ST=D/'drop_out/archive_staging'
import shutil; shutil.rmtree(ST, ignore_errors=True)
def blob(b): return hashlib.sha1(b'blob %d\0'%len(b)+b).hexdigest()
def lf(b): return b.replace(b'\r\n', b'\n')
items=[]
def add(target, src, transform=None):
    b=lf(pathlib.Path(src).read_bytes())
    if transform: b=transform(b)
    p=ST/target; p.parent.mkdir(parents=True, exist_ok=True); p.write_bytes(b); items.append((target, str(src), b))
H=D/'harness'
for f in ('hz.py','probe.py','census_svg.py','k318_edit.py','k318_texts.py','shots_ctl.py','domcmp.py','shots_phone.py','shots_readme_dep.py','layerphone.py','k318_archive.py'):
    add(f'measurement/k318_phone_pinmove/{f}', H/f)
add('measurement/k318_phone_pinmove/k318_runs.txt', D/'drop_out/k318_runs.txt')
for f in ('k317.py','mobileprobe.py','mobileprobe_run.txt','constants.json'):
    add(f'measurement/k317/{f}', D/'drop/k317'/f)
add('ship-scripts/k317_efilist_commit.ps1', D/'drop/k317/K317_efilist_commit.ps1')
add('ship-scripts/k317_commit.ps1', D/'drop/k317/WI-K317_commit.ps1')
add('ship-scripts/k318_efilist_commit.ps1', D/'drop_out/K318_efilist_commit.ps1')
add('ship-scripts/k318_wuld_v403_relabel_commit.ps1', D/'drop_out/WULD_v403_relabel_commit.ps1')
add('ship-scripts/k318_commit.ps1', D/'drop_out/WI-K318_commit.ps1')
banner=b"> **SPENT \xe2\x80\x94 2026-09-12, WI-K318.** This prompt has been run. Do not open a second pin-move session from it; the pin is v4.0.3 / 62c733ac.\n\n"
add('kickoffs/k318_prompt_flagship_phone_pin_move.md', D/'drop/PROMPT_flagship_mobile_pin_move.md', transform=lambda b: banner+b)
add('kickoffs/k318_stratum.txt', D/'drop_out/WI-K318_stratum.txt')
add('kickoffs/k318_release_v4_0_3.json', D/'drop_out/release_v4_0_3.json')
idx=(D/'wuld/archive/INDEX.md').read_bytes(); assert hashlib.md5(idx).hexdigest()=='413bd51dbcaf65d2497a8803ce95cefb'
def first_line(b):
    for ln in b.decode('utf-8').split('\n'):
        t=ln.strip().lstrip('#').strip().strip('"').lstrip('=').strip()
        if t: return t[:140].replace('|','\\|')
    return ''
rows=[f"| `{t}` | 2026-09-12 | {first_line(b)} |" for t,s,b in items]
section=("\n## Filed 2026-09-12 (WI-K318) — the phone pin move, and K317's drop\n\n"
"The v4.0.2 → v4.0.3 pin move's drop (`k318\\`): the kickoff (spent), the stratum, the release manifest, the three blocks that "
"do not gate this filing (the efilist pin move, the wuld-ink relabel, the log), the harness (the phone probe, the SVG census with the "
"painted ground, the exact-once edit script, the desktop-identity control and its DOM comparer, the contact-sheet and README captures, "
"the layer-at-phone check, this assembler) and a condensed record of its runs; with it K317's drop, which was never filed (its probe, its harness "
"and run, its constants, its two blocks). Left in the drop on purpose: the payloads (`combined.html` and the five edited files, the "
"`.b64` capture), the screenshots and contact sheets, `P5_STATE.md` and `TODO_after_the_pin_move.md`, and the archive block itself.\n\n"
"| file | date | first line |\n|---|---|---|\n" + "\n".join(rows) + "\n")
new_idx=idx+section.encode('utf-8'); (ST/'INDEX.md').write_bytes(new_idx); items.append(('INDEX.md','archive/INDEX.md (HEAD 30ae76e2) + this section', new_idx))
lines=[]
for t,s,b in items:
    srcmd5=hashlib.md5(pathlib.Path(s).read_bytes()).hexdigest() if pathlib.Path(s).exists() else '-'
    lines.append('\t'.join([f'archive/{t}', hashlib.md5(b).hexdigest(), blob(b), str(len(b)), s.replace('/home/claude/k318/','k318:'), srcmd5]))
man=('\n'.join(lines)+'\n').encode(); (ST/'MANIFEST.tsv').write_bytes(man)
cred=re.compile(r'ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY|xox[baprs]-[A-Za-z0-9-]{10,}|sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_\-]{30,}')
for t,s,b in items:
    assert len(b)<=200000 and pathlib.Path(t).suffix in ('.md','.txt','.ps1','.py','.json','.js','.log','.tsv') and not cred.search(b.decode('utf-8','replace')) and b'\r\n' not in b, t
# splice into the block (template placeholders or previous values)
blk=D/'drop_out/WULD_archive_commit.ps1'; s=blk.read_text()
s=re.sub(r"\$hMan -ne '[0-9a-f_A-Z]+' -or \$lMan -ne [0-9_A-Z]+", f"$hMan -ne '{hashlib.md5(man).hexdigest()}' -or $lMan -ne {len(man)}", s)
s=re.sub(r"\(expected [0-9_A-Z]+\)", f"(expected {len(lines)})", s); s=re.sub(r"\$rows\.Count -ne [0-9_A-Z]+\)", f"$rows.Count -ne {len(lines)})", s)
blk.write_text(s)
print('MANIFEST.tsv', hashlib.md5(man).hexdigest(), len(man), 'rows', len(lines)); print('INDEX.md new', hashlib.md5(new_idx).hexdigest(), blob(new_idx), len(new_idx))
print('archive block', hashlib.md5(blk.read_bytes()).hexdigest(), len(blk.read_bytes()))
