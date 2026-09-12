"""mode_collapse.py -- four mode buttons -> two toggles on the flagship (3.3).

STANDARD / LEGIBLE / HIGH-CONTRAST / BOTH were a 2x2 matrix labelled as four alternatives: LEGIBLE is
the typography axis, HIGH-CONTRAST the contrast + polarity axis, BOTH the cell with both on. Two
aria-pressed toggles say that directly. The mode string (standard | legible | high-contrast | both),
its storage key (arglib-mode) and the arglib:mode-change event are unchanged, so every consumer --
the graph views' mode stash, the saved-mode boot, the layer's tour -- keeps working; only the control
surface collapsed. The contrast toggle is NOT droppable on the evidence: on the flagship it is the only
route to the light (cream) polarity, which is a reader need, not a contrast number."""
import sys, pathlib, hashlib
SRC, DST = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
s = SRC.read_text(encoding='utf-8'); n = 0
def edit(old, new, count=1):
    global s, n
    if s.count(old) != count: sys.exit('*** mode_collapse: %r found %d times (want %d)' % (old[:70], s.count(old), count))
    s = s.replace(old, new); n += 1

edit('''    <button id="mode-standard" class="active" type="button" onclick="setMode('standard')">standard</button>
    <button id="mode-legible" type="button" onclick="setMode('legible')">legible</button>
    <button id="mode-hc" type="button" onclick="setMode('high-contrast')">high-contrast</button>
    <button id="mode-both" type="button" onclick="setMode('both')">both</button>''',
'''    <button id="mode-legible" type="button" aria-pressed="false" onclick="toggleModeAxis('legible')">legible</button>
    <button id="mode-hc" type="button" aria-pressed="false" onclick="toggleModeAxis('high-contrast')">high-contrast</button>''')

edit('''  ['standard', 'legible', 'hc', 'both'].forEach(function(slug) {
    var btn = document.getElementById('mode-' + slug);
    if (btn) btn.classList.remove('active');
  });
  var activeSlug = (mode === 'high-contrast') ? 'hc' : mode;
  var activeBtn = document.getElementById('mode-' + activeSlug);
  if (activeBtn) activeBtn.classList.add('active');''',
'''  /* Two toggles, not four buttons (pin move, 2026-09-12): each reports its own axis. */
  var lOn = (mode === 'legible' || mode === 'both'), hOn = (mode === 'high-contrast' || mode === 'both');
  var lb = document.getElementById('mode-legible'), hb = document.getElementById('mode-hc');
  if (lb) { lb.classList.toggle('active', lOn); lb.setAttribute('aria-pressed', lOn ? 'true' : 'false'); }
  if (hb) { hb.classList.toggle('active', hOn); hb.setAttribute('aria-pressed', hOn ? 'true' : 'false'); }''')

edit('''function setMode(mode) {
  currentMode = mode;
  window.__arglib.setMode(mode);
}
''', '''function setMode(mode) {
  currentMode = mode;
  window.__arglib.setMode(mode);
}
/* TWO TOGGLES, NOT FOUR BUTTONS (pin move, 2026-09-12). LEGIBLE is the typography axis and
   HIGH-CONTRAST the contrast + polarity axis; the old BOTH button was the cell with both on, labelled
   as a fourth alternative. Flip one axis, derive the mode string, and everything downstream --
   storage, the mode-change event, the graph views' mode stash -- is untouched. */
function toggleModeAxis(axis) {
  var l = document.body.classList.contains('legible'), h = document.body.classList.contains('high-contrast');
  if (axis === 'legible') l = !l; else if (axis === 'high-contrast') h = !h;
  setMode(l && h ? 'both' : l ? 'legible' : h ? 'high-contrast' : 'standard');
}
''')
DST.write_text(s, encoding='utf-8')
b = s.encode('utf-8'); print('mode_collapse: %d edits; output %d B md5 %s' % (n, len(b), hashlib.md5(b).hexdigest()))
