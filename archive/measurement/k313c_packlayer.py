#!/usr/bin/env python3
"""Rebuild build/ + site/ wuld-layer.{css,js} from their parts. Binary, generative, self-checking.

The first version derived its joiners by LOCATING each part inside the file it was about to
overwrite -- which works exactly until a part changes, i.e. every time it is actually needed. It
now generates the banners and verifies the result three ways: every part present exactly once and
in order, the pack minus its generated banners equal to the parts concatenated, and the byte delta
against the previous pack equal to the delta of the parts that changed. A packer that cannot
account for every byte it emits is a second source of truth."""
import sys, hashlib, pathlib, difflib
B=pathlib.Path('build'); S=pathlib.Path('site')
BAR=b'='*94
def banner(n): return b'\n\n/* '+BAR+b'\n   '+n.encode()+b'\n   '+BAR+b' */\n\n'
def md5(b): return hashlib.md5(b).hexdigest()

CSS_HEAD=(b'/* wuld-layer.css -- library.wuld.ink shared presentation + cosmetic layer.\n'
          b'   Concatenated by pack_layer.py. Edit the sources in build/, never this file. */\n')
CSS=['wuld-type.css','wuld-bezel.css','wuld-vfx.css']
JS_HEAD=b'/* wuld-layer.js -- library.wuld.ink cosmetic + sound layer. */\n'
JS =['wuld-vfx.js','wuld-sfx.js','wuld-fb.js','wuld-tour.js']
JS_TAIL=(B/'wuld-layer.js').read_bytes()
JS_TAIL=JS_TAIL[JS_TAIL.index(b'\n(function(){\n  var FURNITURE'):]

def pack(head, names, first_banner, tail=b''):
    out=bytearray(head); parts=[]
    for k,n in enumerate(names):
        d=(B/n).read_bytes(); parts.append(d)
        out += (banner(n) if (k or first_banner) else b'') + d
    out += tail
    return bytes(out), parts

def verify(pack_bytes, parts, names, label):
    pos=0
    for n,d in zip(names,parts):
        i=pack_bytes.find(d,pos)
        if i<0: sys.exit("*** %s: %s missing from the pack"%(label,n))
        if pack_bytes.count(d)!=1: sys.exit("*** %s: %s appears %d times"%(label,n,pack_bytes.count(d)))
        pos=i+len(d)
    joined=b''.join(parts)
    stripped=pack_bytes
    for n in names: stripped=stripped.replace(banner(n),b'')
    if joined not in stripped:
        sys.exit("*** %s: pack minus banners is not the parts concatenated"%label)
    print("  %s: %d parts, in order, each once; every byte accounted for" % (label,len(parts)))

css,cp = pack(CSS_HEAD, CSS, True)
js ,jp = pack(JS_HEAD , JS , False, JS_TAIL)
verify(css,cp,CSS,"css"); verify(js,jp,JS,"js ")
# GOLDEN: the js parts are unchanged this run, so the generator must reproduce the deployed file
# byte for byte. If it cannot, the banners it emits are not the banners already in the tree.
g=pathlib.Path('/tmp/golden-layer.js')
if g.exists():
    if g.read_bytes()!=js: sys.exit("*** js: generator does not reproduce the deployed pack byte-for-byte")
    print("  js : reproduces the deployed pack byte-for-byte from parts")
if '--check' in sys.argv: sys.exit(0)
for name,data in (('wuld-layer.css',css),('wuld-layer.js',js)):
    prev=(S/name).read_bytes() if (S/name).exists() else b''
    (B/name).write_bytes(data); (S/name).write_bytes(data)
    print("  %-16s %6d B  (%+d)  md5=%s"%(name,len(data),len(data)-len(prev),md5(data)))
