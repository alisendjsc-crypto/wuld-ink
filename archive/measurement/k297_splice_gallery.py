import sys, re, hashlib
src = sys.argv[1]; dst = sys.argv[2]
b = open(src, 'rb').read()
assert b.count(b'\r') == 0, 'CR present'
t = b.decode('utf-8')
def once(hay, needle):
    n = hay.count(needle); assert n == 1, f'anchor count {n} != 1 for {needle[:60]!r}'
# ---- (1) head: page-local phone rhythm + fold CSS, before </head> ----
STYLE = '''  <!-- K297 -- phone reach for the lobby (page-local, no component touched,
       no ?v). Rhythm + type are phone-scoped; the handout fold is the
       K291/K296 mechanism; the rooms-index reorder below is the one change
       that is visible on desktop too (rooms before the plate-grid controls). -->
  <style>
    /* K297 -- the lobby h1 escaped the K275 phone type scale by specificity
       (.gallery-page .page-hero-title beats mobile-a11y's bare `h1`); it
       rejoins the site scale here. Hero / rooms-index / controls / gate
       rhythm tightened on phones only. Every rule sits under (max-width: 640px). */
    @media (max-width: 640px) {
      .gallery-page .page-hero { padding-block: var(--s-6) var(--s-5); margin-block-end: var(--s-5); }
      .gallery-page .page-hero-title { font-size: clamp(1.9rem, 7vw, 2.6rem); line-height: 1.12; overflow-wrap: break-word; }
      .gallery-page .page-intro { margin-block-end: var(--s-4); }
      .gallery-page .gallery-category-index { margin: var(--s-5) 0; }
      .gallery-page .gallery-category-index-aside { margin-block-end: var(--s-3); }
      .gallery-page .gallery-controls { margin-block-end: var(--s-4); padding-block-end: var(--s-2); }
      .gallery-page .gallery-nsfw-bar { margin-block-end: var(--s-5); }
    }
    /* K297 -- the exhibition handout folds on phones behind a one-line
       summary; the rooms index is the next thing on the screen. Ships OPEN
       in the markup; a parse-time script closes it at <=640px. No JS =>
       fully expanded, i.e. the desktop page. Summary hidden >=641px, so
       desktop is untouched. Framing degrades toward MORE, never less. */
    .gallery-fold { margin: 0; }
    .gallery-fold > summary {
      display: block;
      list-style: none;
      cursor: pointer;
      padding-block: var(--s-3);
      font-family: var(--font-mono);
      font-size: var(--t-xs);
      line-height: var(--lh-relaxed);
      text-transform: uppercase;
      letter-spacing: var(--ls-wide);
      color: var(--c-fg-muted);
    }
    .gallery-fold > summary::-webkit-details-marker { display: none; }
    .gallery-fold > summary::after { content: " [+]"; color: var(--c-accent); }
    .gallery-fold[open] > summary::after { content: " [\\2212]"; }
    .gallery-fold > summary:hover { color: var(--c-accent); }
    .gallery-fold > summary:focus-visible {
      outline: var(--bw-thick) solid var(--c-accent);
      outline-offset: 2px;
    }
    @media (min-width: 641px) {
      .gallery-fold > summary { display: none; }
    }
  </style>
'''
once(t, '</head>')
t = t.replace('</head>', STYLE + '</head>')
# ---- (2) fold the handout ----
open_p = '      <p class="page-intro">Exhibition handout in the form of a wall.'
once(t, open_p)
t = t.replace(open_p, '      <details class="gallery-fold" open>\n      <summary>Exhibition handout</summary>\n' + open_p)
close_hero = '</p>\n    </header>\n'
once(t, close_hero)
SCRIPT = '''    <script>
    /* K297 - the exhibition handout ships OPEN in the markup; phones get it
       closed behind its summary. No JS => fully expanded, i.e. the desktop
       page. Never the reverse: framing degrades toward MORE, not less. */
    (function(){try{if(window.matchMedia&&window.matchMedia("(max-width: 640px)").matches){var f=document.querySelectorAll("details.gallery-fold");for(var i=0;i<f.length;i++){f[i].removeAttribute("open");}}}catch(e){}})();
    </script>
'''
t = t.replace(close_hero, '</p>\n      </details>\n    </header>\n' + SCRIPT)
# ---- (3) rooms index above the gate ----
idx_start = '    <!-- K87 category index: rooms light up when the manifest holds\n'
once(t, idx_start)
idx_end = '      <div class="gallery-cat-grid" id="gallery-cat-grid"></div>\n    </section>\n\n'
once(t, idx_end)
i0 = t.index(idx_start); i1 = t.index(idx_end) + len(idx_end)
block = t[i0:i1]
t = t[:i0] + t[i1:]
gate_start = '    <!-- K83 consent gate: reveal of [data-nsfw] plates now runs through a\n'
once(t, gate_start)
NOTE = '''    <!-- K297: the rooms index sits ABOVE the gate and the JS-inserted controls
         (gallery-room.js inserts the controls bar before the gate), so the
         rooms are the first thing after the handout on every viewport; the
         controls filter the plate grid below them. -->
'''
t = t.replace(gate_start, NOTE + block + gate_start)
out = t.encode('utf-8')
assert b'\r' not in out and out.endswith(b'\n')
open(dst, 'wb').write(out)
print('ok', len(b), '->', len(out), hashlib.md5(out).hexdigest()[:8])
