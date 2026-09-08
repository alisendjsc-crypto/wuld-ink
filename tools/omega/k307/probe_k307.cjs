/* K307 TX21 probe — measure the seat's PREDICTED destinations, do not assume them (cclxxxiii). */
const fs=require("fs"), path=require("path");
const R=process.cwd();
const YO=require(path.join(R,"src/components/yurei-oracle.js"));
const C=path.join(R,"src/components/omega-corpus-mrgrey.json");
const T=JSON.parse(fs.readFileSync(path.join(R,"tools/omega/k307/tx21_k307.json"),"utf8"));
const base=JSON.parse(fs.readFileSync(C,"utf8"));
const E0=base.yurei_corpus.entries;
const route=(E,s)=>{const r=new YO.Matcher(E,{unsealed:false}).respond(s);return {id:r.id||"(none)",cls:r.class||"?"};};
let fail=0; const say=(ok,m)=>{if(!ok)fail++;console.log((ok?"  ok  ":"  FAIL")+" "+m);};

console.log("== 0 twins intact BEFORE (a pull is only safe if the objection keeps a route) ==");
for(const p of T.pull){
  const e=E0.find(x=>x.id===p.entry);
  const has=e.patterns.some(q=>q.form===p.twin);
  say(has, "twin "+JSON.stringify(p.twin)+" declared on "+p.entry);
  const r=route(E0,p.twin); say(r.id===p.entry, "  twin routes to "+r.id);
}
console.log("\n== 1 BEFORE: where the pulled forms land now ==");
for(const p of T.pull){const r=route(E0,p.form);console.log("  "+JSON.stringify(p.form)+" -> "+r.id+" ["+r.cls+"]");}
for(const f of T.fold){const r=route(E0,f.form);console.log("  "+JSON.stringify(f.form)+" -> "+r.id+" ["+r.cls+"]  (fold target: "+f.entry+")");}
for(const k of T.keep){const r=route(E0,k.form);console.log("  KEEP "+JSON.stringify(k.form)+" -> "+r.id+" ["+r.cls+"]");}

// mutate
const E1=JSON.parse(JSON.stringify(E0));
// Re-runnable: on a post-change tree the forms are already gone. That is the expected
// end state, not a regression -- report it and keep the diffs meaningful (ccxliv).
const POST = T.pull.every(p => !E0.find(x=>x.id===p.entry).patterns.some(q=>q.form===p.form));
if(POST) console.log("  note  tree is already POST-change; sections 1-2 read as the end state, diffs are no-ops");
for(const p of T.pull){const e=E1.find(x=>x.id===p.entry);const n=e.patterns.length;e.patterns=e.patterns.filter(q=>!(q.form===p.form&&q.mode===p.mode));
  say(POST ? e.patterns.length===n : e.patterns.length===n-1, (POST?"already pulled ":"pulled ")+JSON.stringify(p.form)+" from "+p.entry);}
for(const f of T.fold){const e=E1.find(x=>x.id===f.entry);if(!e.patterns.some(q=>q.form===f.form&&q.mode===f.mode))e.patterns.push({form:f.form,mode:f.mode,weight:f.weight});}

console.log("\n== 2 AFTER: the seat's predictions, verified ==");
for(const p of T.pull){const r=route(E1,p.form);console.log("  "+JSON.stringify(p.form)+" -> "+r.id+" ["+r.cls+"]");}
for(const f of T.fold){const r=route(E1,f.form);say(r.id===f.entry, JSON.stringify(f.form)+" -> "+r.id);}
console.log("\n== 3 twins STILL intact after ==");
for(const p of T.pull){const r=route(E1,p.twin);say(r.id===p.entry, "twin "+JSON.stringify(p.twin)+" -> "+r.id);}
for(const k of T.keep){const r=route(E1,k.form);say(r.id===k.entry, "kept "+JSON.stringify(k.form)+" -> "+r.id);}

console.log("\n== 4 route diff over DECLARED forms (input set: declared only, cclxxxiii) ==");
const decl=[];E0.forEach(e=>(e.patterns||[]).forEach(p=>decl.push([p.form,e.id])));
const pulled=new Set(T.pull.map(p=>p.form));
let moved=0;
for(const [f,own] of decl){ if(pulled.has(f)) continue; const a=route(E0,f),b=route(E1,f); if(a.id!==b.id){moved++;console.log("  MOVED "+JSON.stringify(f)+" ["+own+"] "+a.id+" -> "+b.id);} }
say(moved===0,"declared forms re-routed (excluding the 2 pulled): "+moved+" of "+(decl.length-pulled.size));

console.log("\n== 5 watchlist — undeclared inputs the diff cannot see ==");
const watch=["nothing matters anyway","nothing matters anymore","nothing really matters","my life is great","life is meaningless anyway",
"i want to die","my life isnt worth living","life isnt worth living","i wish i had never been born","sounds like eugenics","this is eugenics",
"this is nazi eugenics","population control","be grateful","count your blessings","you should be grateful","life is a gift","speak for everyone",
"some people love their lives","this was ableist","your view is ableist"];
let w=0;
for(const s of watch){const a=route(E0,s),b=route(E1,s);if(a.id!==b.id){w++;console.log("  MOVED "+JSON.stringify(s)+"  "+a.id+" ["+a.cls+"] -> "+b.id+" ["+b.cls+"]");}else console.log("  held  "+JSON.stringify(s)+" -> "+a.id+" ["+a.cls+"]");}
console.log("  watchlist moved: "+w+" of "+watch.length);
console.log("\nPROBE: "+(fail?"RED ("+fail+")":"GREEN")+"  [declared-moved="+moved+" watch-moved="+w+"]");
process.exit(fail?1:0);
