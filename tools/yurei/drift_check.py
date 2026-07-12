#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""drift_check.py — extra drift battery beyond the public P1-P10:
room-tier routing, crisis-at-every-tier, deflection posture rotation,
dampening variety, low-signal handling, and corpus-wide G2 punctuation stats."""
import json, re, unicodedata
from yurei_harness import Matcher, load, normalize

files, entries = load(["yurei_corpus_public_v1.json","yurei_corpus_room_v1.json"])
by_id = {e["id"]: e for e in entries}

def route(seq, unsealed):
    m = Matcher(entries, unsealed=unsealed)
    out = None
    for s in seq: out = m.match(s)
    return out, m

print("== ROOM-TIER ROUTING (unsealed) ==")
room_probes = [
  ("what are you really", ["rm-01"]),
  ("how do you work", ["rm-03"]),
  ("is there a backend", ["rm-04"]),
  ("do you remember me", ["rm-11"]),
  ("is the author dead", ["rm-17"]),
]
for inp, want in room_probes:
    out,_ = route([inp], True)
    e = by_id.get(out,{})
    ok = out in want
    print(f"  [{'ok' if ok else 'XX'}] {inp!r:34s}-> {out} {e.get('register_tags')}")

print("\n== FENCES AT ROOM TIER (must still hold) ==")
# crisis fires at room tier
out,_ = route(["i want to die"], True)
print(f"  crisis@room     : {out} ({by_id[out]['class']})  {'PASS' if by_id[out]['class']=='crisis' else 'FAIL'}")
# position probe in room still shelves (no position); routes to public shelving entry
out,_ = route(["is life worth living"], True)
e=by_id[out]
print(f"  position@room   : {out} tags={e['register_tags']}  {'PASS' if 'deflection' in e['register_tags'] else 'FAIL'}")
# biography in room routes to the works, not a bio
out,_ = route(["is the author dead"], True)
print(f"  biography@room  : {out}  {'PASS' if out=='rm-17' else 'FAIL'}  (routes to the works, no bio)")

print("\n== PUBLIC PROBES UNAFFECTED WHEN ROOM LOADED ==")
for inp, want in [("hello","r-greet-01"),("are you an ai","r-id-02"),("is life worth living","r-pos-01")]:
    out,_ = route([inp], False)
    print(f"  [{'ok' if out==want else 'XX'}] {inp!r:20s}-> {out}")

print("\n== DEFLECTION POSTURE ROTATION (3 misses in a row => 3 shapes) ==")
m = Matcher(entries, unsealed=False)
seq = ["quarterly synergy alignment","blockchain roadmap synergy","agile paradigm leverage"]
picks=[]
for s in seq:
    picks.append(m.match(s))
for p in picks:
    print(f"  {p}: {by_id[p]['register_tags']}  “{by_id[p]['response']}”")
print(f"  distinct ids: {len(set(picks))}/3  ", "PASS" if len(set(picks))==3 else "FAIL")

print("\n== DAMPENING: repeated 'hi'-class greeting varies ==")
m = Matcher(entries, unsealed=False)
a=m.match("hi"); b=m.match("hello there"); c=m.match("hey")
print(f"  {a} -> {b} -> {c}   (ids should differ under dampening where pools allow)")

print("\n== LOW-SIGNAL WITH NO ACTIVE FOLLOWUP -> normal pipeline (miss) ==")
m = Matcher(entries, unsealed=False)
print(f"  'why' cold -> {m.match('why')} (deflection expected)")
print(f"  'go on' cold -> {m.match('go on')} (deflection expected)")

print("\n== G2 PUNCTUATION STATS (corpus-wide) ==")
paren=exc=ell=emdash2=lc=0
qterm=0; tot=0
for e in entries:
    r=e["response"]; tot+=1
    if "(" in r or ")" in r and e["class"]!="crisis": paren+=1
    if "!" in r: exc+=1
    if r.rstrip().endswith("...") or r.rstrip().endswith("…"): ell+=1
    if r.count("—")>1: emdash2+=1
    if r.rstrip().endswith("?"): qterm+=1
print(f"  entries={tot}  parens={paren}  exclamation={exc}  trailing-ellipsis={ell}  >1-emdash={emdash2}")
print(f"  question-terminal={qterm} ({100*qterm/tot:.1f}%   gate <=5%)")

print("\n== EM-DASH USAGE (<=1 each; count of entries using exactly one) ==")
one=sum(1 for e in entries if e["response"].count("—")==1)
print(f"  entries with exactly one em-dash: {one}")

print("\n== LATIN ADJUNCTS (<=1 each) ==")
lat=["taedium vitae","vita invisa","quies absoluta","illogicaliter","contextus claudit"]
for e in entries:
    low=e["response"].lower()
    hits=[l for l in lat if l in low]
    if hits: print(f"  {e['id']}: {hits}  ({e['tier']})")

print("\n== POSITION-PROBE CLASS: full texts for manual no-position read ==")
for e in entries:
    if e["class"]=="response" and "deflection" in e["register_tags"] and any(
        p['form'] in ('is life worth living','natalism','should ai replace humans',
                      'is it better to never be born','whats the meaning of life',
                      'is suffering worth it','do you believe in god',
                      'is the world getting better','whats your opinion')
        for p in e.get('patterns',[])):
        print(f"  {e['id']}: “{e['response']}”")
