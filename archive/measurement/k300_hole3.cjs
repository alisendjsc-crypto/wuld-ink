const path=require('path'), fs=require('fs');
const ROOT=process.argv[2];
const O=require(path.join(ROOT,'src/components/yurei-oracle.js'));
const E=require(path.join(ROOT,'src/components/omega-corpus-mrgrey.json')).yurei_corpus.entries;
const AUD=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/omega/coverage-audit-K299.json'),'utf8'));
const S=AUD.sections.subject;
const byId={}; E.forEach(e=>byId[e.id]=e);
const oidOf=id=>byId[id]&&byId[id].position?byId[id].position.objection_id:null;
const forms=[]; for(const e of E) for(const p of (e.patterns||[])) forms.push({id:e.id,toks:O.tokens(O.normalize(p.form))});
const STOP=new Set(['the','a','an','is','are','was','were','of','to','and','or','it','that','this','you','i','in','on','for','be','not','do','what','about','my','me','have','has','no','so','as','if','but','all','we','they','your']);

function rank(probe,minFrac,useStop){
  let pt=O.tokens(O.normalize(probe)); if(useStop) pt=pt.filter(t=>!STOP.has(t));
  const P=new Set(pt); if(!P.size) return [];
  const best={};
  for(const f of forms){ let ft=f.toks; if(useStop) ft=ft.filter(t=>!STOP.has(t)); if(!ft.length) continue;
    const ov=ft.filter(t=>P.has(t)).length; const frac=ov/ft.length;
    if(frac>=minFrac) best[f.id]=Math.max(best[f.id]||0,frac); }
  return Object.entries(best).sort((a,b)=>b[1]-a[1]);
}
const stg=S.signed_title_gaps||[];
const cases=[]; for(const o of stg) for(const t of o.gap_titles) cases.push({oid:o.oid,text:t});

console.log('== H. would a similarity suggester actually HELP? ==');
console.log('   test: the '+cases.length+" site-own title phrasings that miss today. Does a token-overlap");
console.log('   suggester point at the RIGHT signed objection, at cap 4?\n');
console.log('   minFrac  stopwords  fires  top1-correct  in-top4  wrong-only  silent');
for(const useStop of [false,true]) for(const mf of [0.34,0.5,0.67]){
  let fires=0,t1=0,t4=0,wrong=0,silent=0;
  for(const c of cases){
    const r=rank(c.text,mf,useStop).slice(0,4);
    if(!r.length){silent++;continue;}
    fires++;
    const oids=r.map(x=>oidOf(x[0]));
    if(oids[0]===c.oid) t1++;
    if(oids.includes(c.oid)) t4++; else wrong++;
  }
  console.log('   '+String(Math.round(mf*100)).padStart(6)+'%  '+(useStop?'stripped ':'kept     ')+String(fires).padStart(6)+String(t1).padStart(14)+String(t4).padStart(9)+String(wrong).padStart(12)+String(silent).padStart(8));
}
console.log('\n   (top1-correct = the visitor is handed the phrasing that reaches the objection they actually typed.');
console.log('    wrong-only = the suggester fires and every one of its 4 guesses is a different objection.)');
