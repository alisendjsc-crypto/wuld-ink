#!/usr/bin/env python3
"""wing_collapse.py -- STANDARD / LEGIBLE / HIGH-CONTRAST / BOTH -> two aria-pressed toggles on the five wings
and the umbrella index, the same mechanism the flagship got at K314 (mode_collapse.py): the mode strings,
the storage key (wuld:libmode), data-mode and every [data-mode] rule are untouched; only the four buttons
become two, and sync() marks each axis pressed or not. Exact-once edits, or nothing is written."""
import sys, pathlib, re, hashlib
FILES = ['right-to-die/combined.html', 'abortion/combined.html', 'transgenderism/combined.html',
         'anthropocentrism/combined.html', 'veganism/combined.html', 'libraries/index.html']
ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'site')

OLD_MARKUP = re.compile(
    r'(?P<ind>[ \t]*)<button id="mode-standard" class="active" type="button" onclick="setMode\(\'standard\'\)">standard</button>\n'
    r'[ \t]*<button id="mode-legible" type="button" onclick="setMode\(\'legible\'\)">legible</button>\n'
    r'[ \t]*<button id="mode-hc" type="button" onclick="setMode\(\'high-contrast\'\)">high-contrast</button>\n'
    r'[ \t]*<button id="mode-both" type="button" onclick="setMode\(\'both\'\)">both</button>\n')
NEW_MARKUP = ('{ind}<button id="mode-legible" type="button" aria-pressed="false" onclick="toggleModeAxis(\'legible\')">legible</button>\n'
              '{ind}<button id="mode-hc" type="button" aria-pressed="false" onclick="toggleModeAxis(\'high-contrast\')">high-contrast</button>\n')

OLD_SYNC = ('  function sync(mode){\n'
            '    var btns=document.querySelectorAll(".mode-toggle button"),i;\n'
            '    for(i=0;i<btns.length;i++) btns[i].classList.remove("active");\n'
            '    var b=document.getElementById(IDS[mode]); if(b) b.classList.add("active");\n'
            '  }\n')
NEW_SYNC = ('  /* Two toggles since 2026-09-12 (the flagship got the same at K314): LEGIBLE and HIGH-CONTRAST are\n'
            '     independent axes and the four modes are their four combinations, so each button is pressed\n'
            '     when its axis is on. The mode strings, the storage key and every [data-mode] rule are as before. */\n'
            '  function sync(mode){\n'
            '    var l=(mode==="legible"||mode==="both"), h=(mode==="high-contrast"||mode==="both");\n'
            '    var bl=document.getElementById("mode-legible"), bh=document.getElementById("mode-hc");\n'
            '    if(bl){ bl.classList.toggle("active",l); bl.setAttribute("aria-pressed",String(l)); }\n'
            '    if(bh){ bh.classList.toggle("active",h); bh.setAttribute("aria-pressed",String(h)); }\n'
            '  }\n')
OLD_SET = ('  window.setMode=function(mode){\n'
           '    if(ALLOWED.indexOf(mode)===-1) mode="standard";\n'
           '    document.documentElement.setAttribute("data-mode", mode);\n'
           '    try{ localStorage.setItem(KEY,mode); }catch(e){}\n'
           '    sync(mode);\n'
           '  };\n')
NEW_SET = OLD_SET + ('  window.toggleModeAxis=function(axis){\n'
                     '    var m=document.documentElement.getAttribute("data-mode")||"standard";\n'
                     '    var l=(m==="legible"||m==="both"), h=(m==="high-contrast"||m==="both");\n'
                     '    if(axis==="legible") l=!l; else if(axis==="high-contrast") h=!h;\n'
                     '    window.setMode(l&&h ? "both" : l ? "legible" : h ? "high-contrast" : "standard");\n'
                     '  };\n')

def once(s, old, new, label, path):
    n = s.count(old)
    if n != 1: sys.exit(f'*** {path}: {label} found {n} times, expected 1')
    return s.replace(old, new)

for rel in FILES:
    p = ROOT / rel; s = p.read_bytes().decode('utf-8')
    before = hashlib.md5(s.encode()).hexdigest()
    m = list(OLD_MARKUP.finditer(s))
    if len(m) != 1: sys.exit(f'*** {rel}: mode-toggle markup found {len(m)} times')
    s = s[:m[0].start()] + NEW_MARKUP.format(ind=m[0].group('ind')) + s[m[0].end():]
    s = once(s, ',\n      IDS={standard:"mode-standard",legible:"mode-legible","high-contrast":"mode-hc",both:"mode-both"};', ';', 'IDS table', rel)
    s = once(s, OLD_SYNC, NEW_SYNC, 'sync()', rel)
    s = once(s, OLD_SET, NEW_SET, 'setMode()', rel)
    for tok in ('mode-standard', 'mode-both', 'IDS[mode]'):
        if tok in s: sys.exit(f'*** {rel}: {tok!r} still referenced after the edit')
    p.write_bytes(s.encode('utf-8'))
    print('%-32s %s -> %s  %+d B' % (rel, before[:8], hashlib.md5(s.encode()).hexdigest()[:8], len(s.encode()) - len(s.encode()) ))
