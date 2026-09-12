# -*- coding: utf-8 -*-
"""Source gate for the tour copy that describes the flagship's apparatus. Same discipline as
precis.py: each claim carries the panel sentence it rests on, and the gate fails on any it cannot
find verbatim (after normalisation). The first draft of this copy shipped three factual errors that
no harness could see, because every harness checked geometry and counts and none checked whether the
words were true."""
import json, pathlib, re, sys, unicodedata
P = json.loads(pathlib.Path('methodology_panels.json').read_text(encoding='utf-8'))
src = pathlib.Path('build/wuld-tour.js').read_text(encoding='utf-8')
def norm(s):
    s = unicodedata.normalize('NFKC', s)
    for a,b in [('—','--'),('–','-'),('’',"'"),('×','x'),(' ',' ')]: s=s.replace(a,b)
    return ' '.join(s.split()).lower()
N = {k: norm(v) for k,v in P.items()}
def step_text(key, n):
    """pull step n's text for tour `key` straight out of the shipped source, so the gate cannot drift
       from what is actually deployed"""
    blk = src[src.index("key: '%s'"%key):]
    texts = re.findall(r"text: '((?:[^'\\]|\\.)*)'", blk)
    if n >= len(texts): return ''
    # the source holds JS escapes like \u2014 as literal backslash-u; decode only those
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1),16)), texts[n]).replace("\\'", "'")
CLAIMS = [
 # (tour, step, fragment-of-shipped-copy, verbatim panel sentence, panel)
 ('map',0,'an edge wherever an objection runs on a mechanism',
     'Each objection is linked to the psychological, cognitive, or rhetorical mechanisms that generate it.','map-methodology-panel'),
 ('map',0,'why an interlocutor says a thing, not what they said',
     'Most argument preparation focuses on what the opponent says. This map focuses on why they say it.','map-methodology-panel'),
 ('map',0,'Click a node to see everything it connects to',
     'Click any node to see its connections highlighted and listed.','map-methodology-panel'),
 ('map',1,'Bigger mechanism nodes are more common patterns',
     'The size of mechanism nodes scales with the number of connected objections — larger nodes represent more common psychological patterns.','map-methodology-panel'),
 ('dep',0,'An edge joins a premise to an objection whose response invokes it',
     'Each edge represents an invocation of a philosophical premise within the response text.','dep-methodology-panel'),
 ('dep',0,'Solid means load-bearing',
     'Removing the premise would collapse or fundamentally weaken the argument. Displayed as solid lines in the graph.','dep-methodology-panel'),
 ('dep',0,'dashed means the response would survive without it',
     'The response references or implicitly invokes this premise, but would survive its removal.','dep-methodology-panel'),
 ('dep',1,'Toggle weak hides the dashed edges',
     'Use the TOGGLE WEAK button to show/hide these edges for clearer structural analysis.','dep-methodology-panel'),
 ('map1',0,'which objection is most likely to come next',
     'which objection are they most likely to deploy next?','map1-methodology-panel'),
 ('map1',0,'a move tree rather than a dictionary',
     'It transforms the library from a reference dictionary into a move tree.','map1-methodology-panel'),
 ('map1',1,'The sophisticate attacks the premise your response invoked',
     "if your response to Objection A invokes Premise P, the sophisticate's next move attacks P directly.",'map1-methodology-panel'),
 ('map1',1,'the defender retreats within the same mechanism',
     'when a defender loses ground on an objection driven by mechanism M, they retreat to another objection driven by M.','map1-methodology-panel'),
 ('map1',1,'the drifter moves one tier at a time',
     'real debates drift one tier at a time','map1-methodology-panel'),
 ('map1',1,'Most edges appear in only one of them',
     'The observed 78.0% single-mode distribution is the empirical validation of the three-mode architecture','map1-methodology-panel'),
 ('map1',2,'which edges were applied without independent validation',
     'They were applied without independent expert validation and are candidates for correction in future methodology passes.','map1-methodology-panel'),
]
bad=0
for tour,step,frag,sent,panel in CLAIMS:
    shipped = step_text(tour, step)
    in_copy = norm(frag) in norm(shipped)
    in_panel = norm(sent) in N[panel]
    ok = in_copy and in_panel
    if not ok: bad+=1
    print("  %-5s step %d  %-5s %-5s  %s" % (tour, step+1,
          "copy" if in_copy else "*** COPY", "panel" if in_panel else "*** PANEL", frag[:60]))
print("\n%d claims, %d failures" % (len(CLAIMS), bad))
sys.exit(1 if bad else 0)
