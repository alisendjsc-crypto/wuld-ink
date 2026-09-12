"""domcmp.py -- compare two settled graph-SVG DOM dumps: the non-numeric skeleton must be identical (every element, attribute,
class and label text, data-family stripped) and every number must agree within a tolerance (the force simulation's settle
carries sub-0.01px timing drift even on identical bytes). usage: python domcmp.py A.svg B.svg [tol=0.05]"""
import sys, re
a=open(sys.argv[1]).read(); b=open(sys.argv[2]).read(); tol=float(sys.argv[3]) if len(sys.argv)>3 else 0.05
strip=lambda s: re.sub(r' data-family="[a-z]+"', '', s)
a,b=strip(a),strip(b)
num=r'-?\d+(?:\.\d+)?(?:e-?\d+)?'
ska,skb=re.sub(num,'#',a),re.sub(num,'#',b)
na=[float(x) for x in re.findall(num,a)]; nb=[float(x) for x in re.findall(num,b)]
same_skel = ska==skb
drift = max((abs(p-q) for p,q in zip(na,nb)), default=0) if len(na)==len(nb) else float('inf')
print(f'skeleton identical: {same_skel}  numbers: {len(na)} vs {len(nb)}  max drift: {drift:.4f}px  -> {"PASS" if same_skel and drift<=tol else "FAIL"}')
sys.exit(0 if same_skel and drift<=tol else 1)
