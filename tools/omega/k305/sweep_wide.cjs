// K305 -- TX20-BACK item 2: re-run the inflection sweep with a WIDE verb map and report
// the delta. The seat found four rows in their mirror batch absent from my K299 live file
// (three `regret`->`regretted`, one `leads`->`led`) and stated it as a condition, not a
// route, because they could not check it. All four verified live: the declared forms
// exist, the variants deflect, and none is declared. So the gap is real.
//
// The K299 map is unrecoverable (that generator was scratch, not repo state -- itself a
// ccxliv violation), so this rebuilds it from the corpus's own vocabulary rather than
// from memory of what it covered. Curated, not exhaustive, and it says so.
const fs=require("fs");
const YO=require(process.cwd()+"/src/components/yurei-oracle.js");
const E=JSON.parse(fs.readFileSync("src/components/omega-corpus-mrgrey.json","utf8")).yurei_corpus.entries;
const R=t=>new YO.Matcher(E,{unsealed:false}).respond(t);
const declared=new Set(); E.forEach(e=>(e.patterns||[]).forEach(p=>declared.add(p.form)));

// --- the map, built by reading the corpus's own -s tokens and bare verbs ------------
const MAP={
  // copulas + auxiliaries (K299 had these)
  "is":"was","are":"were","am":"was","has":"had","have":"had","does":"did","do":"did",
  // -s verbs actually present in the corpus (the K299 map appears to have stopped here)
  "makes":"made","gives":"gave","goes":"went","means":"meant","matters":"mattered",
  "needs":"needed","outweighs":"outweighed","redeems":"redeemed","requires":"required",
  "solves":"solved","works":"worked","shapes":"shaped","creates":"created","ends":"ended",
  "builds":"built","justifies":"justified","devalues":"devalued","permits":"permitted",
  "reproduces":"reproduced","supports":"supported","sounds":"sounded","fails":"failed",
  "agrees":"agreed","cures":"cured","breaks":"broke",
  // THE GAP the seat found: non-copular regulars and irregulars in BARE form
  "leads":"led","lead":"led","regret":"regretted","regrets":"regretted",
  "need":"needed","want":"wanted","wants":"wanted","prove":"proved","proves":"proved",
  "show":"showed","shows":"showed","say":"said","says":"said","choose":"chose",
  "chooses":"chose","become":"became","becomes":"became","grow":"grew","grows":"grew",
  "live":"lived","lives_V":"lived","get":"got","gets":"got","take":"took","takes":"took",
  "bring":"brought","brings":"brought","cause":"caused","causes":"caused",
  "allow":"allowed","allows":"allowed","deserve":"deserved","deserves":"deserved",
  "ignore":"ignored","ignores":"ignored","value":"valued","values":"valued",
  "solve":"solved","end":"ended","create":"created","exist":"existed","exists":"existed",
};
// tokens that LOOK like verbs but are nouns here -- never shift these
const NEVER=new Set(["lives","harms","brakes","cases","rights","rates","things","ways",
  "problems","beliefs","highs","lows","extremes","outliers","kids","babies","generations",
  "parents","persons","humans","animals","survivors","followers","gods","species","ethics",
  "eugenics","pillars","surveys","conditions","cultures","relationships","moments","roads",
  "issues","achievements","adherents","agents","beings","blessings","demographics","masochists",
  "pensions","workers","whats","its","anothers","cuts"]);

// --- exclusions established across K304/K305 -----------------------------------------
const MODALS=new Set(["should","would","could","must","might","may","will","shall","can"]);
const DET=new Set(["the","a","an","my","your","his","her","its","our","their","most","some","all"]);
const ABSTRACT=new Set(["life","pain","happiness","suffering","love","beauty","consent","death",
  "existence","reality","truth","meaning","joy","hope","art","nature","hardship","struggle"]);
function excluded(words,i,variant){
  if(i>0 && words[i-1]==="to") return "infinitive after 'to'";
  if(words.slice(0,i).some(w=>MODALS.has(w))) return "modal/future + past";
  if(/^(abolish|stop|start|go|try|look|imagine|get|give|leave)$/.test(words[0]) && i>0) return "imperative";
  if(i>0 && DET.has(words[i-1]) && NEVER.has(words[i])) return "nominal";
  // negated auxiliary: "do not get" -> "do not got" / "did not got". The aux already
  // carries the tense; the lexical verb stays bare.
  if(i>=2 && words[i-1]==="not" && ["do","does","did"].includes(words[i-2])) return "negated aux + past";
  // a token immediately followed by a copula is the SUBJECT, not the verb:
  // "value is subject relative" -- `value` is the noun.
  if(i+1<words.length && ["is","are","was","were"].includes(words[i+1])) return "subject, not verb";
  // ...and the same token at the END after a copula phrase is a predicate noun:
  // "the struggle is what gives life value"
  if(i===words.length-1 && words.includes("is")) return "predicate noun";
  // TX20-BACK section 3: timeless propositions take no past tense as an INPUT.
  // <abstract subject> is <adjective>  -- "pain is subjective", "life is beautiful"
  if((words[i]==="is"||words[i]==="are") && i>=1 && ABSTRACT.has(words[i-1]) && words.length===i+2)
    return "TIMELESS proposition";
  return null;
}
const out={new_miss:[],excluded:[],already:[],hits:[]};
for(const e of E.filter(x=>x.position)){
  for(const p of (e.patterns||[])){
    const w=p.form.split(" ");
    for(let i=0;i<w.length;i++){
      if(NEVER.has(w[i])) continue;
      const past=MAP[w[i]];
      if(!past) continue;
      const v=w.slice(0,i).concat([past],w.slice(i+1)).join(" ");
      if(v===p.form) continue;
      const ex=excluded(w,i,v);
      if(ex){ out.excluded.push({id:e.id,form:p.form,variant:v,why:ex}); continue; }
      if(declared.has(v)){ out.already.push({id:e.id,form:p.form,variant:v}); continue; }
      const mappable=w.filter(x=>MAP[x]&&!NEVER.has(x)).length;
      const r=R(v);
      if(r.id===e.id) out.hits.push({id:e.id,variant:v});
      else out.new_miss.push({id:e.id,obj:e.position.objection_id,form:p.form,variant:v,lands:r.id,shift:w[i]+"->"+past,multiverb:mappable>1});
    }
  }
}
console.log(`generated over ${E.filter(x=>x.position).length} position entries`);
console.log(`  already declared (K304 folded them) : ${out.already.length}`);
console.log(`  route home already                  : ${out.hits.length}`);
console.log(`  EXCLUDED by rule                    : ${out.excluded.length}`);
console.log(`  *** NEW MISSES (the delta)          : ${out.new_miss.length} ***`);
console.log(`      of which MULTI-VERB (possible half-shift, needs a read): ${out.new_miss.filter(r=>r.multiverb).length}`);
const byShift={}; out.new_miss.forEach(r=>byShift[r.shift]=(byShift[r.shift]||0)+1);
console.log("\n  delta by shift:");
Object.keys(byShift).sort((a,b)=>byShift[b]-byShift[a]).forEach(k=>console.log(`     ${k.padEnd(24)} ${byShift[k]}`));
const byEx={}; out.excluded.forEach(r=>byEx[r.why]=(byEx[r.why]||0)+1);
console.log("\n  exclusions by rule:");
Object.keys(byEx).sort().forEach(k=>console.log(`     ${k.padEnd(24)} ${byEx[k]}`));
fs.writeFileSync("/tmp/sweep_wide.json",JSON.stringify(out,null,1));
