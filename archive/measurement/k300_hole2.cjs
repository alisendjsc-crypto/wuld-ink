const path=require('path'), fs=require('fs');
const ROOT=process.argv[2];
const O=require(path.join(ROOT,'src/components/yurei-oracle.js'));
const E=require(path.join(ROOT,'src/components/omega-corpus-mrgrey.json')).yurei_corpus.entries;
const AUD=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/omega/coverage-audit-K299.json'),'utf8'));
const S=AUD.sections.subject;
const posIds=new Set(E.filter(e=>e.position).map(e=>e.id));
const forms=[]; for(const e of E) for(const p of (e.patterns||[])) forms.push({id:e.id,form:p.form,toks:O.tokens(O.normalize(p.form))});

// F2 — a THRESHOLDED token-overlap suggester: fires only when the probe covers
// >= HALF of some declared form's tokens. Harder to walk than bare any-token.
function suggest(probe, minFrac){
  const pt=new Set(O.tokens(O.normalize(probe)));
  const hit=new Set();
  for(const f of forms){ if(!f.toks.length) continue;
    const ov=f.toks.filter(t=>pt.has(t)).length;
    if(ov/f.toks.length>=minFrac && posIds.has(f.id)) hit.add(f.id); }
  return hit;
}
// greedy cover over the corpus's own single words, at a given threshold + cap
function cover(minFrac,cap){
  const vocab=new Set(); for(const f of forms) f.toks.forEach(t=>vocab.add(t));
  const words=[...vocab];
  const yields=words.map(w=>[w,suggest(w,minFrac)]).filter(x=>x[1].size).sort((a,b)=>b[1].size-a[1].size);
  const seen=new Set(); let probes=0;
  for(const [w,ids] of yields){
    const gain=[...ids].filter(i=>!seen.has(i));
    if(!gain.length) continue;
    gain.slice(0,cap).forEach(i=>seen.add(i)); probes++;
    if(seen.size>=posIds.size) break;
  }
  return {probes,covered:seen.size};
}
console.log('== F2. enumeration cost of a THRESHOLDED, CAPPED similarity suggester ==');
console.log('   target: inventory all '+posIds.size+' provenance-stamped positions, using only single words the corpus itself uses');
for(const mf of [0.34,0.5,0.67,1.0]) for(const cap of [1,4]){
  const r=cover(mf,cap);
  console.log('   overlap>='+String(Math.round(mf*100)).padStart(3)+'% of a form\'s tokens, cap '+cap+' -> '+String(r.probes).padStart(4)+' probes cover '+r.covered+'/'+posIds.size+' positions');
}

// G — sizing the ALTERNATIVE: the §3 fold
const stg=S.signed_title_gaps||[];
const all=[]; for(const o of stg) for(const t of o.gap_titles) all.push({oid:o.oid,text:t});
const byOid={}; all.forEach(x=>(byOid[x.oid]=byOid[x.oid]||[]).push(x.text));
console.log('\n== G. sizing the alternative: fold the site\'s own titles as `contains` forms ==');
console.log('   phrasings: '+all.length+' across '+Object.keys(byOid).length+' signed objections  (median '+(()=>{const a=Object.values(byOid).map(v=>v.length).sort((x,y)=>x-y);return a[a.length>>1];})()+' per objection)');
// collision risk: does a new form CONTAIN an existing declared form (would steal) or vice versa?
let contains=0, containedBy=0, clean=0; const risky=[];
for(const x of all){
  const n=O.normalize(x.text);
  let hit=null;
  for(const f of forms){ const nf=O.normalize(f.form);
    if(f.id===x.oid) continue;
    if(n===nf){hit='EQUALS '+f.id+' "'+f.form+'"';break;}
    if(O.wordBoundaryContains(n,nf)){hit='CONTAINS existing "'+f.form+'" ('+f.id+')';break;} }
  if(hit){ contains++; if(risky.length<10) risky.push(x.text+'  ->  '+hit); } else clean++;
}
console.log('   phrasings that would swallow an existing declared form (arbitration needed): '+contains);
console.log('   phrasings with no containment against any of the '+forms.length+' declared forms: '+clean);
risky.forEach(r=>console.log('      ! '+r));
console.log('\n   engine surface added by this fold: 0 lines. Parity contract touched: no. New gate needed: no.');
