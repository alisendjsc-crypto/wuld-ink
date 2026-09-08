#!/usr/bin/env python3
"""K299 §0 — the normalizer amendment, applied to BOTH sides of the parity contract.

TX15-BACK §0: the shipped normalizer DELETES every non-alphanumeric character, so
`cherry-picking` becomes `cherrypicking` and misses the spaced form, and a typed-out
contraction never meets the corpus's stripped spelling. Two changes, and BOTH halves are
required:

  1. hyphen -> SPACE (substitute, do not delete).
  2. expand a fixed set of contractions AFTER stripping.

  ...and, load-bearing and NOT in TX15-BACK: patternMatch/pattern_match compare `form` RAW
  against normalized text. Amending the input path alone transforms one side of every
  comparison. Measured: input-only produces 51 phantom steals. So the form is normalized too.

The map is decided BY MEASUREMENT across all three live corpora, not by intuition:
  * `whats` is EXCLUDED. Measured twice, and it survives re-spelling: expanding it creates the
    high-frequency prefix `what is`, which two Yurei site entries then over-capture, so
    `whats on this site` (r-site-09) and `whats special about this hour` (r-hour-08) stop
    reaching their own entries. ~23 small-talk/nav recoveries are not worth 2 regressions on a
    second persona; zero regressions is the bar for a shared-engine change. Revisit in a
    Yurei-scoped session by tightening r-site-01/02, not here.
  * `were` `well` `ill` `id` `its` `hell` `wed` `shed` `hes` `lets` are EXCLUDED because the
    stripped form is an ordinary English word. `were` -> `we are` would destroy
    `wish i were dead` — the exact form K299's crisis fold adds.
"""
import re, sys, pathlib

MAP = {
 "youre":"you are","dont":"do not","isnt":"is not","wasnt":"was not","arent":"are not",
 "werent":"were not","wouldnt":"would not","couldnt":"could not","shouldnt":"should not",
 "didnt":"did not","doesnt":"does not","havent":"have not","hasnt":"has not","hadnt":"had not",
 "wont":"will not","theyre":"they are","youve":"you have","theres":"there is","thats":"that is",
 "ive":"i have","youd":"you would","youll":"you will","im":"i am","cant":"can not",
 "cannot":"can not","couldve":"could have","wouldve":"would have","shouldve":"should have",
}

def patch_js(p):
    s = p.read_text(encoding="utf-8")
    assert "K299_CONTRACTIONS" not in s, "already patched"
    js_map = "{\n" + ",\n".join('    "%s": "%s"' % (k, v) for k, v in sorted(MAP.items())) + "\n  }"
    old_re = '  var STRIP_RE = /[^\\p{L}\\p{N}\\s]/gu;'
    assert s.count(old_re) == 1
    s = s.replace(old_re,
        '  var STRIP_RE = /[^\\p{L}\\p{N}\\s]/gu;\n'
        '  var HYPHEN_RE = /[-\\u2010-\\u2015]/g;            // K299: hyphens become SPACE, not nothing\n'
        '  var K299_CONTRACTIONS = ' + js_map + ';')
    old_norm = """  function normalize(s) {
    if (s == null) s = "";
    s = String(s).normalize("NFKC").toLowerCase();
    s = s.replace(STRIP_RE, "");
    s = s.replace(WS_RE, " ");
    return s.trim();
  }"""
    assert s.count(old_norm) == 1, "normalize() shape changed"
    s = s.replace(old_norm, """  function normalize(s) {
    if (s == null) s = "";
    s = String(s).normalize("NFKC").toLowerCase();
    s = s.replace(HYPHEN_RE, " ");     // K299 - substitute, do not delete: wrong-hour -> wrong hour
    s = s.replace(STRIP_RE, "");
    s = s.replace(WS_RE, " ");
    s = s.trim();
    if (s === "") return s;
    var parts = s.split(" ");          // K299 - expand contractions AFTER stripping
    for (var i = 0; i < parts.length; i++) {
      var rep = K299_CONTRACTIONS[parts[i]];
      if (rep) parts[i] = rep;
    }
    return parts.join(" ");
  }

  /* K299 - forms are authored in source spelling and compared against NORMALIZED text, so
     they must pass through the same function or the amendment transforms one side only.
     Memoized: normalize() is otherwise re-run per form per input. */
  var _formCache = Object.create(null);
  function normForm(f) {
    var v = _formCache[f];
    if (v === undefined) { v = normalize(f); _formCache[f] = v; }
    return v;
  }""")
    old_pm = "    var form = pat.form, mode = pat.mode;"
    assert s.count(old_pm) == 1
    s = s.replace(old_pm, "    var form = normForm(pat.form), mode = pat.mode;")
    p.write_text(s, encoding="utf-8", newline="")
    return "js ok"

def patch_py(p):
    s = p.read_text(encoding="utf-8")
    assert "K299_CONTRACTIONS" not in s, "already patched"
    py_map = "{\n" + ",\n".join('    "%s": "%s"' % (k, v) for k, v in sorted(MAP.items())) + ",\n}"
    old = '''def normalize(s):
    s = unicodedata.normalize("NFKC", s)
    s = s.lower()
    out = []
    for ch in s:
        if ch.isalnum() or ch.isspace():
            out.append(ch)
        # else: dropped entirely (wrong-hour -> wronghour)
    s = "".join(out)
    s = re.sub(r"\\s+", " ", s)
    return s.strip()'''
    assert s.count(old) == 1, "python normalize() shape changed"
    s = s.replace(old, '''K299_CONTRACTIONS = ''' + py_map + '''

_K299_HYPHEN = re.compile(r"[-\\u2010-\\u2015]")

def normalize(s):
    s = unicodedata.normalize("NFKC", s)
    s = s.lower()
    s = _K299_HYPHEN.sub(" ", s)   # K299: hyphen -> SPACE (was: dropped, wrong-hour -> wronghour)
    out = []
    for ch in s:
        if ch.isalnum() or ch.isspace():
            out.append(ch)
    s = "".join(out)
    s = re.sub(r"\\s+", " ", s).strip()
    if not s:
        return s
    return " ".join(K299_CONTRACTIONS.get(w, w) for w in s.split(" "))''')
    old_pm = '''    form, mode = pat["form"], pat["mode"]'''
    assert s.count(old_pm) == 1
    s = s.replace(old_pm, '''    form, mode = _norm_form(pat["form"]), pat["mode"]''')
    # memoized form normalizer, inserted just before pattern_match
    anchor = "def pattern_match(pat, text):"
    assert s.count(anchor) == 1
    s = s.replace(anchor, '''_K299_FORM_CACHE = {}

def _norm_form(f):
    """K299 - forms are compared against normalized text, so they take the same path."""
    v = _K299_FORM_CACHE.get(f)
    if v is None:
        v = normalize(f)
        _K299_FORM_CACHE[f] = v
    return v

''' + anchor)
    p.write_text(s, encoding="utf-8", newline="")
    return "py ok"

if __name__ == "__main__":
    root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    print(" ", patch_js(root / "src/components/yurei-oracle.js"))
    print(" ", patch_py(root / "tools/yurei/yurei_harness.py"))
