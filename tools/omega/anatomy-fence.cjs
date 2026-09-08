/* anatomy-fence.cjs — the page's PROSE about the corpora must equal the corpora.

   K307 origin: /successor/'s "how the desk works" panel told visitors the proxy
   held "184 entries - 181 authored, 3 inherited crisis". It was correct when it
   was written at K270 and nothing ever re-derived it; by K306 the corpus was
   189/185/4 and Yurei's desk was 166, not 165. Thirty-six sessions, seven corpus
   ships, and every corpus gate green the whole time -- because no gate read the
   page. A number in prose is a claim, and an unfenced claim rots.

   The panel is inside a <details> and must read correctly with NO JS, so the
   numbers stay hard-coded and this gate keeps them honest. Rows are matched by
   their own <dt> text, never by ordinal position (a row inserted above would
   silently re-point an index-keyed assertion).
*/
const fs = require("fs"), path = require("path");
const ROOT = process.env.WULD_ROOT || path.join(__dirname, "..", "..");
const rd = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = p => JSON.parse(rd(p)).yurei_corpus.entries;

const PAGE = rd("src/successor/index.html");
const mrgrey = corpus("src/components/omega-corpus-mrgrey.json");
const yPub   = corpus("src/components/yurei-corpus-public.json");
const yOra   = corpus("src/components/yurei-corpus-oracle.json");
const crisis = E => E.filter(e => e.class === "crisis").length;

let pass = 0, fail = 0;
const ok = (name, cond, got) => { if (cond) { pass++; console.log("  ok   " + name); } else { fail++; console.log("  FAIL " + name + "  got: " + got); } };

// dd text for a given dt label -- keyed on the label's own words, not its index
function dd(label) {
  const re = new RegExp("<dt>" + label + "</dt>\\s*<dd>([^<]*)</dd>");
  const m = PAGE.match(re);
  return m ? m[1].trim() : null;
}
const nums = s => (s === null ? [] : (s.match(/\d+/g) || []).map(Number));

const rows = [
  { label: "Y&#363;rei &middot; desk persona", want: [yPub.length],  what: "Yurei desk entries" },
  { label: "Y&#363;rei &middot; oracle lane",  want: [yOra.length],  what: "Yurei oracle entries" },
  { label: "Mr. Grey &middot; proxy",          want: [mrgrey.length, mrgrey.length - crisis(mrgrey), crisis(mrgrey)],
    what: "Mr. Grey entries / authored / inherited crisis" },
];

console.log("== /successor/ anatomy panel vs the corpora it describes ==");
for (const r of rows) {
  const text = dd(r.label);
  ok("row present: " + r.what, text !== null, "<dt> not found -- label changed?");
  if (text === null) continue;
  const got = nums(text);
  ok(r.what + " = [" + r.want.join(", ") + "]", got.length === r.want.length && got.every((n, i) => n === r.want[i]), JSON.stringify(text));
}

// the floor is shared: the page calls the proxy's crisis entries "inherited", so they must BE the Yurei ones
ok("inherited crisis really is inherited (byte-identical across corpora)",
   JSON.stringify(mrgrey.filter(e => e.class === "crisis")) === JSON.stringify(yPub.filter(e => e.class === "crisis")),
   "mrgrey crisis !== yurei crisis");

console.log("\nANATOMY FENCE: " + (fail ? "RED — " + fail + " stale claim(s)" : "GREEN — " + pass + " checks; the page's numbers are the corpora's"));
process.exit(fail ? 1 : 0);
