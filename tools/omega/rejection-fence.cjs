/* rejection-fence.cjs — a form removed on purpose must stay removed.

   K307 origin: TX21 asked for the inflection sweep to be run to fixpoint. It converges
   (4 passes), but 12 of the 43 forms it produces are forms the record had already
   REFUSED — all three grief/distress pulls (`life was a gift`, `life was a blessing`,
   `life was meaningless anyway`) and seven of the seat's K305 DROPs. The generator has
   no memory of a pull, and it never will: a pull is a judgement, and the generator is
   a string transform.

   So the guard belongs on the CORPUS, not the generator. This fence fails whenever a
   rejected form is declared again, whatever produced it — this generator, a future one,
   or a hand-fold. Removing a row from the ledger is how a verdict gets reversed, and
   that is a seat ruling, not a build call.
*/
const fs = require("fs"), path = require("path");
const ROOT = process.env.WULD_ROOT || path.join(__dirname, "..", "..");
const rd = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));

const LED = rd("tools/omega/rejected_forms.json").rejected;
const CORPORA = ["src/components/omega-corpus-mrgrey.json",
                 "src/components/yurei-corpus-public.json",
                 "src/components/yurei-corpus-oracle.json"];

let fail = 0, checked = 0;
const declared = new Map();                       // form -> "corpus:entry"
for (const c of CORPORA)
  for (const e of rd(c).yurei_corpus.entries)
    for (const p of (e.patterns || []))
      if (!declared.has(p.form)) declared.set(p.form, path.basename(c) + ":" + e.id);

console.log("== rejected forms must not be declared in any corpus ==");
for (const r of LED) {
  checked++;
  const where = declared.get(r.form);
  if (where) { fail++; console.log("  FAIL " + JSON.stringify(r.form) + " is declared again on " + where +
                                   "\n         " + r.kind + ", " + r.session + " — " + r.why); }
}
if (!fail) console.log("  ok   none of the " + checked + " rejected forms is declared");

// the ledger is only meaningful if its harm-pulls kept a live twin for the objection
console.log("\n== every harm-pull kept a twin, so the objection still has a route ==");
for (const r of LED.filter(x => x.kind === "harm-pull")) {
  const t = declared.get(r.twin_kept);
  if (t) console.log("  ok   " + JSON.stringify(r.form) + " -> twin " + JSON.stringify(r.twin_kept) + " live on " + t);
  else { fail++; console.log("  FAIL twin " + JSON.stringify(r.twin_kept) + " for pulled " + JSON.stringify(r.form) + " is NOT declared"); }
}

console.log("\nREJECTION FENCE: " + (fail ? "RED — " + fail + " regression(s)" : "GREEN — " + checked + " rejected forms stay rejected; every pull kept its twin"));
process.exit(fail ? 1 : 0);
