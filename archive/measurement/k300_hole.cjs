const path=require('path'), fs=require('fs');
const ROOT=process.argv[2];
const O=require(path.join(ROOT,'src/components/yurei-oracle.js'));
const E=require(path.join(ROOT,'src/components/omega-corpus-mrgrey.json')).yurei_corpus.entries;
const AUD=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/omega/coverage-audit-K299.json'),'utf8'));
const fresh=t=>new O.Matcher(E,{unsealed:false}).respond(t);

// ---------- A. the score alphabet, realized ----------
const alpha={}, perEntryBest={};
for(const e of E) for(const p of (e.patterns||[])){
  const s=O.entryScore(e, O.normalize(p.form))[0];
  alpha[s]=(alpha[s]||0)+1;
}
console.log('== A. score alphabet over every entry x its own declared forms ==');
console.log('  ', Object.keys(alpha).map(Number).sort((a,b)=>a-b).map(k=>k+' x'+alpha[k]).join('  '));
console.log('   MISS_THRESHOLD =', O.CONST.MISS_THRESHOLD, ' -> smallest realized score =', Math.min(...Object.keys(alpha).map(Number)));

// ---------- B. is there ever a runner-up? ----------
function vector(text){
  const t=O.normalize(text);
  const hits=[];
  for(const e of E){ const [sc]=O.entryScore(e,t); if(sc>0) hits.push([e.id,sc]); }
  hits.sort((a,b)=>b[1]-a[1]);
  return hits;
}
const probes=[
 'the asymmetry is wrong','suffering builds character','what about happy people',
 'cherry picking','you are cherry picking the bad parts','life has meaning',
 'consent is impossible anyway','antinatalism is depressing','zzz qqq wumbo'
];
console.log('\n== B. the full score vector across all '+E.length+' entries (fresh scan, not the matcher) ==');
for(const p of probes){ const v=vector(p); console.log('   '+JSON.stringify(p).padEnd(42)+' entries scoring >0: '+String(v.length).padStart(3)+(v.length?'   top: '+v.slice(0,3).map(x=>x[0]+'@'+x[1]).join(', '):'')); }

// ---------- C. the hole, from the audit's own probe set ----------
const S=AUD.sections.subject;
const rows=S.rows;
const byType={};
for(const r of rows){ const b=byType[r.type]=byType[r.type]||{n:0,gap:0,zero:0}; b.n++; if(r.verdict==='GAP'||r.verdict==='deflection'||r.verdict==='gap') b.gap++; }
console.log('\n== C. the hole, by probe source (from the K299 audit\'s own probe set) ==');
console.log('   verdict values seen:', [...new Set(rows.map(r=>r.verdict))].join(', '));
for(const k of Object.keys(byType).sort()) console.log('   '+k.padEnd(18)+' n='+String(byType[k].n).padStart(4)+'  gap='+String(byType[k].gap).padStart(4)+'  ('+(100*byType[k].gap/byType[k].n).toFixed(1)+'%)');

// how many of the GAP probes score ZERO on every entry (i.e. no runner-up exists to surface)
const gapRows=rows.filter(r=>/gap|deflect/i.test(r.verdict));
let zero=0, nonzero=0; const nz=[];
for(const r of gapRows){ const v=vector(r.text); if(!v.length) zero++; else { nonzero++; if(nz.length<8) nz.push(r.text+' -> '+v[0][0]+'@'+v[0][1]); } }
console.log('\n== D. of the '+gapRows.length+' probes that MISS today, how many have ANY nonzero score anywhere? ==');
console.log('   score 0 against all '+E.length+' entries : '+zero+'  ('+(100*zero/gapRows.length).toFixed(1)+'%)  <- nothing to surface: no runner-up exists');
console.log('   some entry scores >0                    : '+nonzero+' ('+(100*nonzero/gapRows.length).toFixed(1)+'%)  <- these already matched something and were routed away by a LANE, not by score');
nz.forEach(s=>console.log('      e.g. '+s));

// ---------- E. signed title gaps (the 52) ----------
const stg=S.signed_title_gaps||[];
const total=stg.reduce((a,o)=>a+o.gap_titles.length,0);
console.log('\n== E. the site\'s own titles for signed objections that deflect ==');
console.log('   signed objections with >=1 deflecting title: '+stg.length+'   phrasings: '+total);
let tz=0; const sample=[];
for(const o of stg) for(const t of o.gap_titles){ const v=vector(t); if(!v.length) tz++; else if(sample.length<6) sample.push(t+' -> '+v[0][0]+'@'+v[0][1]); }
console.log('   of those '+total+' phrasings, score 0 everywhere: '+tz+' ('+(100*tz/total).toFixed(1)+'%)');
sample.forEach(s=>console.log('      nonzero e.g. '+s));

// ---------- F. enumeration cost of a similarity oracle ----------
// A prober types tokens. If a suggester surfaced the nearest entry by TOKEN OVERLAP,
// how many single-word probes suffice to inventory the position set?
const posEntries=E.filter(e=>e.position);
const vocab={};
for(const e of E) for(const p of (e.patterns||[])) for(const w of O.tokens(O.normalize(p.form))) (vocab[w]=vocab[w]||new Set()).add(e.id);
const words=Object.keys(vocab);
const posIds=new Set(posEntries.map(e=>e.id));
// greedy: pick words that reveal the most unseen position ids
let seen=new Set(), picks=0;
const ranked=words.map(w=>[w,[...vocab[w]].filter(i=>posIds.has(i))]).filter(x=>x[1].length).sort((a,b)=>b[1].length-a[1].length);
for(const [w,ids] of ranked){ const gain=ids.filter(i=>!seen.has(i)); if(!gain.length) continue; gain.forEach(i=>seen.add(i)); picks++; if(seen.size>=posIds.size) break; }
console.log('\n== F. enumeration cost if a token-overlap suggester surfaced the nearest entry ==');
console.log('   provenance-stamped positions: '+posIds.size);
console.log('   distinct single words in the corpus\'s own forms: '+words.length);
console.log('   single-word probes needed to surface EVERY position (greedy cover, suggester returns 1): '+picks);
console.log('   ... if the suggester returns 4 per probe, the same cover costs at most '+picks+' probes and reveals them 4 at a time.');
