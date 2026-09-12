"""aa_remap.py -- the flagship's AA fix, applied AT SOURCE to combined.html.

WHY AT SOURCE AND NOT IN THE SHARED STYLESHEET. The prompt preferred wuld-type.css "where possible, so
the fix propagates to every wing that adopts the flagship's tokens". The flagship has no tokens: its
stylesheet is ~130 rules carrying literal colours (#444/#555/#666/#777 on the dark ground, #777/#888/
#999 on cream, #8b0000 as text in fifteen rules). A selector list in the shared sheet would reach only
the names on it, need !important against the page's own later-loading inline styles, and be a second
place the flagship's palette is defined -- the exact second-source-of-truth the packer comment warns
about. The wings already declare their palette as nine variables and are fixed; nothing here reaches
them, and wuld-layer.css ships byte-identical.

MECHANISM: every edit names the rule by its selector as written and the declaration it replaces, and
must match exactly once -- a remap that matches zero or two places aborts before writing anything.

VALUES (measured in aa_values, all >=4.5 on their real painted ground, most >=5.0):
  dark ground   #444/#555/#666/#777 -> #88847c   the wings' --faint: 5.32 page, 5.07 card, 4.77 #181818
                hover states that were #666      -> #a6a096   the wings' --dim, so hover still brightens
                #8b0000 as text                  -> #ef3a58   the library's one crimson: 5.11 page, 5.19 on #1a0000
                .psych-mechanism #996633         -> #b1763b   hue held, 5.04 on the detail panel
                TIERS[5] #9966cc (badge/filter)  -> #a273d0   hue held, 5.01 over its own tint
                rsiGrade D #c55                  -> lifted, hue held, >=5 over its own tint (computed below)
  cream ground  #666/#777/#888/#999 -> #615b50   5.93 cream, 5.51 card header, 5.14 #e8e0d4, 5.0 #e5ddd2
                tier badges (inline)             -> darkened per hue via [data-tier] + !important
                rsi badges (inline)              -> darkened per grade via [data-grade] + !important
                .show-in-dep-btn #669966         -> #486c48   hue held, 5.05
  Borders, backgrounds, ::selection and the cream-mode #8b0000 text (8.8:1) are untouched: the
  signature red survives everywhere contrast minima do not apply."""
import re, sys, pathlib, hashlib, colorsys

SRC = pathlib.Path(sys.argv[1]); DST = pathlib.Path(sys.argv[2])
s = SRC.read_text(encoding='utf-8')
head, tail = s.split('</style>', 1)          # the page's own <style> is the first one
n_edits = 0

def rule_edit(selector, old, new, count=1):
    """Replace `old` with `new` inside the body of the rule whose selector line is exactly `selector`."""
    global head, n_edits
    pat = re.compile(r'(^' + re.escape(selector) + r'\s*\{)([^{}]*)(\})', re.M)
    ms = list(pat.finditer(head))
    if len(ms) != 1: sys.exit('*** selector %r matched %d rules' % (selector, len(ms)))
    m = ms[0]; body = m.group(2)
    # whitespace-tolerant on the declaration: two rules in this sheet are written `color:#777`
    prop, val = old.split(':', 1); val = val.strip().rstrip(';').strip()
    dpat = re.compile(r'(?<![-\w])' + re.escape(prop.strip()) + r'\s*:\s*' + re.escape(val) + r'\s*;')
    found = dpat.findall(body)
    if len(found) != count: sys.exit('*** %r: %r found %d times in body (want %d)' % (selector, old, len(found), count))
    head = head[:m.start(2)] + dpat.sub(new, body) + head[m.end(2):]
    n_edits += 1

FAINT, DIM, CRIMSON, HCFAINT = '#88847c', '#a6a096', '#ef3a58', '#615b50'

# ---- dark ground: the grey ladder --------------------------------------------------------------
for sel, old in [
    ('.header p', '#555'), ('.view-btn', '#555'), ('.mp-raw', '#555'), ('#map-stats', '#555'), ('#dep-stats', '#555'),
    ('.m1-empty-state', '#555'), ('&.legible .rwe-pol-neutral', '#555'),
    ('.footer', '#666'), ('.coda-link', '#666'), ('.ml-section h4', '#666'), ('.dl-section h4', '#666'),
    ('.msr-item', '#666'), ('.map-toolbar button', '#666'), ('.methodology-panel .mp-note', '#666'),
    ('#map-info-panel .mp-type', '#666'), ('#dep-info-panel .dp-type', '#666'), ('.m1-weight-LOW', '#666'),
    ('.m1-mode-rationale-label', '#666'), ('.rsi-detail .rsi-axis-label', '#666'), ('.lay-loading', '#666'),
    ('.category-label', '#777'), ('.section-label', '#777'), ('.depth-label', '#777'),
    ('.archetype-row .archetype-label', '#777'), ('.archetype-pill', '#777'), ('.rsi-detail .rsi-formula', '#777'),
    ('.methodology-panel .mp-premise-table td', '#777'), ('.m1-edge-meta', '#777'), ('.lay-tag', '#777'),
    ('.expand-icon', '#444'), ('.empty-state', '#444'), ('.rsi-methodology-btn', '#444'),
    ('.map-methodology-btn, .dep-methodology-btn', '#444'),
]:
    rule_edit(sel, 'color: %s;' % old, 'color: %s;' % FAINT)
for sel in ['.rsi-methodology-btn:hover', '.map-methodology-btn:hover, .dep-methodology-btn:hover']:
    rule_edit(sel, 'color: #666;', 'color: %s;' % DIM)

# ---- dark ground: #8b0000 as text ---------------------------------------------------------------
for sel in ['.header h1', '.keyword', '.copy-btn', '.view-btn.active', '#rsi-methodology-panel h4',
            '.methodology-panel h4', '.methodology-panel .mp-premise-table th', '#map-info-panel .mp-title',
            '.mp-mech-badge', '.mp-goto-library', '#map-stats span', '.show-in-map-btn',
            '#dep-info-panel .dp-title', '.dp-goto-library', '#dep-stats span']:
    rule_edit(sel, 'color: #8b0000;', 'color: %s;' % CRIMSON)
rule_edit('.psych-mechanism', 'color: #996633;', 'color: #b1763b;')

# ---- cream ground (the &.high-contrast nest) ------------------------------------------------------
for sel, old in [
    ('&.high-contrast .header p', '#666'), ('&.high-contrast .depth-label', '#666'),
    ('&.high-contrast .m1-source-list h4', '#666'), ('&.high-contrast .m1-diseng-MEDIUM', '#666'),
    ('&.high-contrast .m1-weight-LOW', '#666'), ('&.high-contrast .m1-edge-meta', '#666'),
    ('&.high-contrast .coda-link', '#777'), ('&.high-contrast .category-label', '#777'),
    ('&.high-contrast .section-label', '#777'), ('&.high-contrast .rsi-detail .rsi-axis-label', '#777'),
    ('&.high-contrast .rsi-methodology-btn', '#777'), ('&.high-contrast .view-btn', '#777'),
    ('&.high-contrast .map-methodology-btn, &.high-contrast .dep-methodology-btn', '#777'),
    ('&.high-contrast .m1-mode-rationale-label', '#777'),
    ('&.high-contrast .rsi-detail .rsi-formula', '#888'), ('&.high-contrast .m1-empty-state', '#888'),
    ('&.high-contrast .footer', '#999'), ('&.high-contrast .empty-state', '#999'), ('&.high-contrast .expand-icon', '#999'),
]:
    rule_edit(sel, 'color: %s;' % old, 'color: %s;' % HCFAINT)

# ---- inline-coloured badges: hooks in the templates, overrides in the sheet -----------------------
def lin(c): c = c / 255; return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
def L(rgb): return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2])
def ratio(a, b): la, lb = L(a), L(b); return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)
def hx(t): t = t.lstrip('#'); t = ''.join(c * 2 for c in t) if len(t) == 3 else t; return tuple(int(t[i:i + 2], 16) for i in (0, 2, 4))
def tohex(rgb): return '#%02x%02x%02x' % tuple(max(0, min(255, round(v))) for v in rgb)
def over(fg, bg, a): return tuple(fg[i] * a + bg[i] * (1 - a) for i in range(3))
def adjust(c, ground, target, direction):
    h, l, sat = colorsys.rgb_to_hls(*[v / 255 for v in hx(c)])
    for step in range(0, 400):
        rgb = tuple(v * 255 for v in colorsys.hls_to_rgb(h, min(1, max(0, l + direction * step * 0.0025)), sat))
        if ratio(rgb, ground) >= target: return tohex(rgb)
    sys.exit('*** no %s value reaches %.1f' % (c, target))

TIERS = {1: '#ff3333', 2: '#ff6633', 3: '#cc9900', 4: '#6699cc', 5: '#9966cc'}
GRADES = {'A': '#44aa77', 'B': '#6699cc', 'C': '#cc9900', 'D': '#cc5555'}
HDR, DPAN, PANEL = hx('#ede8df'), hx('#f0ebe3'), hx('#0f0f0f')
hc_tier = {t: adjust(c, over(hx(c), HDR, 0x11 / 255), 5.0, -1) for t, c in TIERS.items()}
hc_grade = {g: adjust(c, over(hx(c), DPAN, 0x11 / 255), 5.0, -1) for g, c in GRADES.items()}
d_lift = adjust('#cc5555', over(hx('#cc5555'), PANEL, 0x11 / 255), 5.0, +1)   # grade D on the dark panel: 4.32

hc_css = ('\n/* CREAM-GROUND BADGES (pin move, 2026-09-12). The tier and RSI badges carry their colour INLINE from\n'
          '   the render templates, so the high-contrast mode inherited the dark-ground hues onto cream, where the\n'
          '   five tier colours measure 2.02-3.13:1 and the four grades 2.07-3.28:1 (82 + up to 82 elements).\n'
          '   The templates now also stamp data-tier / data-grade; these rules darken each hue with hue and\n'
          '   saturation held, computed to >=5.0:1 over the badge\'s own 6.7%-tint on its ground. !important is\n'
          '   required, not lazy: an inline declaration outranks any sheet rule at normal weight. */\n')
for t, c in hc_tier.items():
    hc_css += 'body.high-contrast .tier-badge[data-tier="%d"] { color: %s !important; border-color: %s66 !important; }\n' % (t, c, c)
for g, c in hc_grade.items():
    hc_css += 'body.high-contrast .rsi-badge[data-grade="%s"] { color: %s !important; border-color: %s66 !important; }\n' % (g, c, c)
hc_css += 'body.high-contrast .show-in-dep-btn { color: #486c48; }\n'
hc_css += ('/* The crimson replaces #8b0000 as TEXT on the dark grounds (1.9-2.0:1 there). Where the same rule paints\n'
           '   onto cream or white in high-contrast mode the original dark red is the readable one (8.8:1 cream,\n'
           '   9.6:1 white) and is restored. The graph views keep their dark frame in every mode, so their\n'
           '   panels are not listed. */\n'
           'body.high-contrast .show-in-map-btn, body.high-contrast #rsi-methodology-panel h4,\n'
           'body.high-contrast .methodology-panel h4, body.high-contrast .methodology-panel .mp-premise-table th { color: #8b0000; }\n')
hc_css += ('/* THE LAYER\'S PALETTE CONTRACT (pin move, 2026-09-12). The wings declare nine variables that the shared\n'
           '   layer reads for its per-card feedback control (--dim, --fg, --faint, --accent). The flagship declared\n'
           '   none, so on the cream ground the control would have taken the shared sheet\'s dark-ground values\n'
           '   (2.1:1). Declared here for the library view, per ground. */\n'
           'body[data-active-view="library"] { --fg: #ddd; --dim: #a6a096; --faint: #88847c; --accent: #ef3a58; }\n'
           'body[data-active-view="library"].high-contrast { --fg: #1a1a1a; --dim: #615b50; --faint: #615b50; --accent: #8b0000; }\n')
# place it at the very end of the page's own stylesheet, after every nested block
head = head.rstrip('\n') + '\n' + hc_css

# template hooks (in the JS, i.e. in `tail`)
def tail_edit(old, new, count=1):
    global tail, n_edits
    if tail.count(old) != count: sys.exit('*** template edit: %r found %d times (want %d)' % (old[:60], tail.count(old), count))
    tail = tail.replace(old, new); n_edits += 1
tail_edit('<span class="tier-badge" style="color:${tierInfo.color};', '<span class="tier-badge" data-tier="${obj.tier}" style="color:${tierInfo.color};')
tail_edit("'<span class=\"rsi-badge\" style=\"color:' + grade.color + ';", "'<span class=\"rsi-badge\" data-grade=\"' + grade.letter + '\" style=\"color:' + grade.color + ';")
tail_edit('5: { label: "Meta-Objection", color: "#9966cc",', '5: { label: "Meta-Objection", color: "#a273d0",')
tail_edit("return {letter:'D', color:'#c55',", "return {letter:'D', color:'%s'," % d_lift)
tail_edit("        btn.style.color = '#666';", "        btn.style.color = '%s';" % FAINT)
# two inline-dimmed legend notes (8.5px, #555 on the page ground, 2.66:1)
tail_edit('<div class="ml-item" style="color:#555">Mechanisms scale by connections</div>', '<div class="ml-item" style="color:%s">Mechanisms scale by connections</div>' % FAINT)
tail_edit('<div class="dl-item" style="color:#555">Premises scale by total connections</div>', '<div class="dl-item" style="color:%s">Premises scale by total connections</div>' % FAINT)
tail_edit('<div class="ml-item" style="color:#555">Objections scale by mechanism count</div>', '<div class="ml-item" style="color:%s">Objections scale by mechanism count</div>' % FAINT)
tail_edit('<div class="dl-item" style="color:#555">Objections scale by dependency count</div>', '<div class="dl-item" style="color:%s">Objections scale by dependency count</div>' % FAINT)
# THE TOP LIP. The layer's bezel is a fixed frame whose top border is --wz-lip-y (1.375vh, 12.4px at 900
# tall) at every tier; the layer insets the stage on the sides only. The wings' first row starts 26px
# down by their own design; this page's wing-switcher row (inline-styled K123 markup) started 7px down
# and lost the top half of its glyphs under the lip. The variable is declared on :root by the
# stylesheet, so this lands with the CSS -- no script timing, no layout shift.
tail_edit('<nav class="rl-wing" aria-label="Refusal Libraries" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;padding:7px 18px;',
          '<nav class="rl-wing" aria-label="Refusal Libraries" style="display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;padding:calc(7px + var(--wz-lip-y,0px)) 18px 7px;')
# the wing-switcher's inline label (K123 markup, flagship-only)
tail_edit('<span style="color:#6a6a6a">Refusal Libraries', '<span style="color:%s">Refusal Libraries' % FAINT)


# ---- the methodology panels' inline <strong> colour keys -> classes, legible per ground -----------
# The panels key their labels to the graph palettes INLINE (the mechanism-type and premise-family fills)
# and to a plain #ccc for emphasis. On the dark panel the keyed values measure 1.5-3.4:1; on the white
# high-contrast panel #ccc measures 1.61 (x24). A class per key lets each ground carry its own value,
# hue held, without !important; the graph NODE fills are not touched.
DARKP, WHITE = hx('#0c0c0c'), (255, 255, 255)
KEYS = {  # literal -> (class, dark value, hc value)   dark: lifted to >=5.0 on #0c0c0c; hc: darkened to >=5.0 on white
    '#ccc':    ('mpk-em',        '#ccc',                            '#1a1a1a'),
    '#888':    ('mpk-dim',       '#888',                            HCFAINT),
    '#666':    ('mpk-rhetorical', FAINT,                            '#555'),
    '#444':    ('mpk-structural', FAINT,                            '#444'),
    '#8b0000': ('mpk-defense',   CRIMSON,                           '#8b0000'),
    '#b8860b': ('mpk-cognitive', '#b8860b',                         adjust('#b8860b', WHITE, 5.0, -1)),
    '#2a4a6b': ('mpk-genuine',   adjust('#2a4a6b', DARKP, 5.0, +1), '#2a4a6b'),
    '#4a7':    ('mpk-a',         '#44aa77',                         hc_grade['A']),
    '#6699cc': ('mpk-b',         '#6699cc',                         hc_grade['B']),
    '#c90':    ('mpk-c',         '#cc9900',                         hc_grade['C']),
    '#cc9900': ('mpk-c',         '#cc9900',                         hc_grade['C']),
    '#c55':    ('mpk-d',         d_lift,                            hc_grade['D']),
}
EXPECT = {'#ccc': 24, '#4a7': 1, '#6699cc': 2, '#c90': 2, '#c55': 3, '#8b0000': 2, '#b8860b': 1, '#666': 2, '#444': 1, '#2a4a6b': 1, '#cc9900': 1, '#888': 1}
for lit, n in EXPECT.items():
    cls = KEYS[lit][0]
    tail_edit('<strong style="color:%s">' % lit, '<strong class="%s">' % cls, count=n)
seen = {}
for lit, (cls, dark, hc) in KEYS.items(): seen[cls] = (dark, hc)
key_css = ('\n/* METHODOLOGY-PANEL KEYS (pin move, 2026-09-12). The panels\' <strong> labels were coloured inline to\n'
           '   match the graph palettes (mechanism types, premise families, RSI grades) and a plain #ccc for\n'
           '   emphasis: 1.5-3.4:1 on the dark panel for the keyed ones, 1.61:1 for #ccc on the white\n'
           '   high-contrast panel. One class per key; each ground carries a legible value with hue held. */\n')
for cls, (dark, hc) in seen.items():
    key_css += '.%s { color: %s; }\n' % (cls, dark)
for cls, (dark, hc) in seen.items():
    key_css += 'body.high-contrast .%s { color: %s; }\n' % (cls, hc)
head = head.rstrip('\n') + '\n' + key_css

# ---- graph-view templates: inline dim labels and the premise-family text colour -------------------
tail_edit('<div style="margin-bottom:6px;font-size:9px;color:#666;letter-spacing:1px">DEPENDENT OBJECTIONS (',
          '<div style="margin-bottom:6px;font-size:9px;color:%s;letter-spacing:1px">DEPENDENT OBJECTIONS (' % FAINT)
tail_edit('<div style="margin-bottom:6px;font-size:9px;color:#666;letter-spacing:1px">PREMISE DEPENDENCIES (',
          '<div style="margin-bottom:6px;font-size:9px;color:%s;letter-spacing:1px">PREMISE DEPENDENCIES (' % FAINT)
tail_edit("<span style=\"color:#666\">' + connObjs.size + ' connected objections:</span>", "<span style=\"color:%s\">' + connObjs.size + ' connected objections:</span>" % FAINT)
tail_edit("<span style=\"color:#666\">Driven by:</span>", "<span style=\"color:%s\">Driven by:</span>" % FAINT)
tail_edit("<div style=\"color:#666; font-size:10px; letter-spacing:1px; margin-bottom:8px;\">' + edges.length + ' PREDICTED SUCCESSORS</div>",
          "<div style=\"color:%s; font-size:10px; letter-spacing:1px; margin-bottom:8px;\">' + edges.length + ' PREDICTED SUCCESSORS</div>" % FAINT)
# the dep info panel paints premise items in the FAMILY colour as text (1.5-3.4:1). A text table, hue held,
# lifted to >=5.0 on the page ground; the border keeps the family colour so the key still reads.
fam = {'axiological': '#8b0000', 'consent': '#6a4c93', 'metaphysical': '#1a535c', 'empirical': '#4a6741',
       'structural': '#5c4033', 'psychological': '#b8860b', 'characterization': '#666'}
famtext = {k: adjust(v, hx('#0a0a0a'), 5.0, +1) for k, v in fam.items()}
tail_edit("""  empirical:'#4a6741', structural:'#5c4033', psychological:'#b8860b', characterization:'#666'
};""", """  empirical:'#4a6741', structural:'#5c4033', psychological:'#b8860b', characterization:'#666'
};
// As TEXT the family colours measure 1.5-3.4:1 on the dark ground (pin move, 2026-09-12). Same hues,
// lifted to >=5.0:1; used only where a family colour paints text. Node fills keep DEP_FAMILY_COLORS.
var DEP_FAMILY_TEXT = {
  %s
};""" % ', '.join("%s:'%s'" % (k, v) for k, v in famtext.items()))
tail_edit("style=\"border-color:'+DEP_FAMILY_COLORS[e.node.family]+';color:'+DEP_FAMILY_COLORS[e.node.family]+'\"",
          "style=\"border-color:'+DEP_FAMILY_COLORS[e.node.family]+';color:'+DEP_FAMILY_TEXT[e.node.family]+'\"")
print('family text:', famtext, ' keys:', {c: v for c, v in seen.items()})

out = head + '</style>' + tail
DST.write_text(out, encoding='utf-8')
b = out.encode('utf-8')
print('edits: %d   hc tiers %s   hc grades %s   D-on-dark %s' % (n_edits, hc_tier, hc_grade, d_lift))
print('output %d B  md5 %s  (%+d B)' % (len(b), hashlib.md5(b).hexdigest(), len(b) - len(s.encode('utf-8'))))
