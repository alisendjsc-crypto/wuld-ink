#!/usr/bin/env python3
"""Insert the four START HERE blocks into a COPY of the flagship. Never edits in place.

Usage:  python insert_precis.py combined.html combined.precis.html
Gates:  the input must contain exactly one <h4> inside each of the four panels before insertion,
        zero .precis-start blocks before, and exactly four after; the output is byte-diffable.
Run this in the pin-move session, not before -- combined.html is pinned."""
import sys, re, hashlib, pathlib
src, dst = sys.argv[1], sys.argv[2]
s = pathlib.Path(src).read_text(encoding='utf-8')
blocks = pathlib.Path('precis_blocks.html').read_text(encoding='utf-8')
parts = re.findall(r'<!-- #([\w-]+) -->\n(<div class="precis-start">.*?</div>\n)', blocks, re.S)
assert len(parts) == 4, "expected 4 blocks in precis_blocks.html, got %d" % len(parts)
assert s.count('class="precis-start"') == 0, "input already carries precis blocks"
print("input  %d B  md5 %s" % (len(s.encode()), hashlib.md5(s.encode()).hexdigest()))
out = s
for pid, block in parts:
    i = out.index('id="%s"' % pid)                     # the panel
    j = out.index('</h4>', i) + len('</h4>')          # its title
    # the title must be the panel's FIRST h4, i.e. no other h4 opens between the id and it
    assert out.find('<h4', i, j) == out.rfind('<h4', i, j), "more than one <h4> before the insertion point in #%s" % pid
    out = out[:j] + "\n" + block + out[j:]
    print("  inserted after the title of #%s" % pid)
assert out.count('class="precis-start"') == 4
style = blocks[blocks.index('<style>'):blocks.index('</style>')+len('</style>')]
out = out.replace('</head>', style + '\n</head>', 1)
pathlib.Path(dst).write_text(out, encoding='utf-8')
print("output %d B  md5 %s  (+%d B)" % (len(out.encode()), hashlib.md5(out.encode()).hexdigest(), len(out.encode())-len(s.encode())))
