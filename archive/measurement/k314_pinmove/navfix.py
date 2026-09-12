"""navfix.py -- the pre-existing examples/coda error (3.1b). render() in the examples section ends by
writing to #counts, an element of the standalone rwe.html header that was never carried into the
combined page; the throw aborts applyHash() before its focused-instance tail and logs on every
examples navigation. Reproduced on the unmodified page with no layer. One null guard."""
import sys, pathlib, hashlib
SRC, DST = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
s = SRC.read_text(encoding='utf-8')
old = """    document.getElementById('counts').textContent =
      `${RWE.length} instances · ${Object.keys(OBJ_COUNT).length} of ${DATA.objections.length} objections touched`;"""
new = """    /* #counts belonged to the standalone rwe.html header and is not in the combined page; writing to
       null threw here on every examples navigation and skipped applyHash's focus tail (pin move, 2026-09-12). */
    var __counts = document.getElementById('counts');
    if (__counts) __counts.textContent =
      `${RWE.length} instances · ${Object.keys(OBJ_COUNT).length} of ${DATA.objections.length} objections touched`;"""
assert s.count(old) == 1, s.count(old)
s = s.replace(old, new); DST.write_text(s, encoding='utf-8')
b = s.encode('utf-8'); print('navfix: 1 edit; output %d B md5 %s' % (len(b), hashlib.md5(b).hexdigest()))
