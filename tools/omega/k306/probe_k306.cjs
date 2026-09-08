/* K306 §3 candidate probe — measure BEFORE folding.
   Engine: the REAL src/components/yurei-oracle.js, required byte-identical.
   FRESH Matcher per probe (K260: a shared instance false-fails on dampening).
   Predicate for every column is stated in its header (cclxxx). */
const fs=require("fs"), path=require("path");
const ROOT=process.cwd();
const CORPUS=path.join(ROOT,"src/components/omega-corpus-mrgrey.json");
const YO=require(path.join(ROOT,"src/components/yurei-oracle.js"));
const CAND=JSON.parse(fs.readFileSync(path.join(ROOT,"tools/omega/k306/candidates_k306.json"),"utf8")).fold;
const base=JSON.parse(fs.readFileSync(CORPUS,"utf8"));
const E0=base.yurei_corpus.entries;
const byid=Object.fromEntries(E0.map(e=>[e.id,e]));
const route=(E,s)=>{const m=new YO.Matcher(E,{unsealed:false});const r=m.respond(s);return {id:r.id||"(none)",cls:r.class||"?"};};
let fail=0; const say=(ok,m)=>{if(!ok)fail++;console.log((ok?"  ok  ":"  FAIL")+" "+m);};

console.log("== 0 target entries exist ==");
for(const c of CAND) if(!byid[c.entry]) say(false,"missing entry "+c.entry+" ("+c.form+")");
console.log("  checked "+CAND.length+" candidates against "+E0.length+" entries");

console.log("\n== 1 pre-normalized corpus law (form === normalize(form)) ==");
for(const c of CAND){const n=YO.normalize?YO.normalize(c.form):c.form; if(n!==c.form) say(false,"not pre-normalized: "+JSON.stringify(c.form)+" -> "+JSON.stringify(n));}
console.log("  all "+CAND.length+" forms checked");

console.log("\n== 2 does each candidate CURRENTLY deflect? (confirms the gap is real) ==");
const notgap=[];
for(const c of CAND){const r=route(E0,c.form); if(r.id!=="mg-deflect-01"){notgap.push([c.form,r.id,r.cls]);}}
console.log("  gap confirmed for "+(CAND.length-notgap.length)+"/"+CAND.length);
notgap.forEach(([f,i,cl])=>console.log("  NOTE already routes: "+JSON.stringify(f)+" -> "+i+" ["+cl+"]"));

// build candidate corpus
const E1=JSON.parse(JSON.stringify(E0));
const byid1=Object.fromEntries(E1.map(e=>[e.id,e]));
for(const c of CAND){const e=byid1[c.entry]; if(!e) continue; e.patterns=e.patterns||[]; e.patterns.push({form:c.form,mode:c.mode,weight:c.weight});}

console.log("\n== 3 each new form homes to its intended entry ==");
for(const c of CAND){const r=route(E1,c.form); say(r.id===c.entry, JSON.stringify(c.form)+" -> "+r.id+(r.id===c.entry?"":"  WANT "+c.entry));}

console.log("\n== 4 route diff over ALL DECLARED forms (input set = declared forms only, cclxxxiii) ==");
const decl=[]; E0.forEach(e=>(e.patterns||[]).forEach(p=>decl.push([p.form,e.id])));
let moved=0;
for(const [f,own] of decl){const a=route(E0,f), b=route(E1,f); if(a.id!==b.id){moved++;console.log("  MOVED "+JSON.stringify(f)+" ["+own+"]  "+a.id+" -> "+b.id);}}
say(moved===0,"declared forms re-routed: "+moved+" of "+decl.length);

console.log("\n== 5 watchlist — inputs the diff CANNOT see (undeclared) ==");
const watch=["nothing matters anymore","i want to die","i want it to stop","my life isnt worth living","i wish i had never been born",
 "life isnt worth living","music","the music page","where is the music","art","the gallery","antinatalism","procreation","asymmetry","sentience",
 "parfit","bradley","harman","scanlon","boonin","benatar","help","the essays","the book","cherry picking the worst","most people are happy",
 "the social contract","your view is ableist","why are you still here","knowledge is worth preserving","classical music is beautiful"];
let wmoved=0;
for(const w of watch){const a=route(E0,w), b=route(E1,w); if(a.id!==b.id){wmoved++;console.log("  MOVED "+JSON.stringify(w)+"  "+a.id+" ["+a.cls+"] -> "+b.id+" ["+b.cls+"]");}else{console.log("  held  "+JSON.stringify(w)+" -> "+a.id+" ["+a.cls+"]");}}
console.log("  watchlist moved: "+wmoved+" of "+watch.length);

console.log("\nPROBE: "+(fail?"RED ("+fail+" failures)":"GREEN")+"  [moved-declared="+moved+" moved-watch="+wmoved+"]");
process.exit(fail?1:0);
