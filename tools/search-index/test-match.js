/* K98 unit tests: PURE block of site-search.js vs the REAL generated index.
   Run: node test-match.js <site-search.js> <search-index.json> */
"use strict";
var fs = require("fs");
var jsPath = process.argv[2], idxPath = process.argv[3];
var src = fs.readFileSync(jsPath, "utf8");
var b = src.indexOf("PURE-BEGIN"), e = src.indexOf("PURE-END");
if (b < 0 || e < 0) { console.error("markers missing"); process.exit(1); }
var pure = src.slice(src.indexOf("\n", b) + 1, src.lastIndexOf("/*", e));
var api = new Function(pure + "\nreturn { numToInt: numToInt, plateQueryNum: plateQueryNum, blobOf: blobOf, scoreEntry: scoreEntry, runQuery: runQuery, sectionize: sectionize, SECTIONS: SECTIONS, CAP: CAP };")();
var idx = JSON.parse(fs.readFileSync(idxPath, "utf8"));
var E = idx.entries;
var pass = 0, fail = 0;
function t(name, cond) {
  if (cond) { pass++; } else { fail++; console.error("FAIL: " + name); }
}
// numToInt
t("arabic 001", api.numToInt("001") === 1);
t("arabic 436", api.numToInt("436") === 436);
t("roman I", api.numToInt("I") === 1);
t("roman IV", api.numToInt("IV") === 4);
t("roman XXVII", api.numToInt("XXVII") === 27);
t("empty null", api.numToInt("") === null);
t("word null", api.numToInt("plate") === null);
// plateQueryNum
t("q 1", api.plateQueryNum("1") === 1);
t("q #5", api.plateQueryNum("#5") === 5);
t("q plate 001", api.plateQueryNum("plate 001") === 1);
t("q Plate 12", api.plateQueryNum("Plate 12") === 12);
t("q ' #27 '", api.plateQueryNum("  #27  ") === 27);
t("q vile null", api.plateQueryNum("vile") === null);
t("q plate-bare null", api.plateQueryNum("plate") === null);
// plate mode
var r1 = api.runQuery(E, "1"), r1b = api.runQuery(E, "001"), r1c = api.runQuery(E, "plate 1");
t("mode plate", r1.mode === "plate");
t("digit forms agree", r1.results.length === r1b.results.length && r1.results.length === r1c.results.length);
t("multi-room number 1", r1.results.length > 1);
t("all num==1", r1.results.every(function (x) { return api.numToInt(x.num) === 1; }));
t("editorial roman I included", r1.results.some(function (x) { return x.num === "I" && x.room === "editorial"; }));
t("editorial routes to lobby", r1.results.filter(function (x) { return x.room === "editorial"; }).every(function (x) { return x.route === "/gallery/"; }));
t("plates only in digit mode", r1.results.every(function (x) { return x.type === "plate"; }));
// word mode: vile
var rv = api.runQuery(E, "vile");
var vilePlates = rv.results.filter(function (x) { return x.type === "plate"; });
var vileSeries = E.filter(function (x) { return x.type === "plate" && (x.series || "").toLowerCase().indexOf("vile") !== -1; });
t("vile >= series count", vilePlates.length >= vileSeries.length);
t("vile series all present", vileSeries.every(function (x) { return vilePlates.indexOf(x) !== -1; }));
// K94 ground truth: exact series "main-character-vile" = 162 (the chip count);
// substring 'vile' spans six series = 179 (the K94 stratum's all-blobs-match figure)
var vileExact = E.filter(function (x) { return x.type === "plate" && x.series === "main-character-vile"; });
t("vile exact-series 162", vileExact.length === 162);
t("vile substring-series 179", vileSeries.length === 179);
// glossary exact-term rank
var rc = api.runQuery(E, "contextus claudit");
t("exact term first", rc.results.length > 0 && rc.results[0].type === "glossary" && rc.results[0].title === "Contextus Claudit");
var rc2 = api.runQuery(E, "contextus");
t("partial finds term", rc2.results.some(function (x) { return x.title === "Contextus Claudit"; }));
// void category
var rce = api.runQuery(E, "celestial");
t("celestial void cat", rce.results.some(function (x) { return x.type === "void" && x.title.indexOf("Celestial") === 0; }));
// gore: page + plates
var rg = api.runQuery(E, "gore");
t("gore page present", rg.results.some(function (x) { return x.type === "page" && x.route === "/gallery/gore/"; }));
t("gore plates >= 5", rg.results.filter(function (x) { return x.type === "plate" && x.room === "gore"; }).length >= 5);
// hint mode
t("empty hint", api.runQuery(E, "").mode === "hint");
t("1-char hint", api.runQuery(E, "a").mode === "hint");
// nsfw flag carried
t("nsfw flag present", rg.results.some(function (x) { return x.type === "plate" && x.nsfw === true; }));
// sectionize: order + cap
var rm = api.runQuery(E, "main");
var secs = api.sectionize(rm.results);
var plateSec = secs.filter(function (s) { return s.key === "plate"; })[0];
t("plate section exists", !!plateSec);
t("cap applied", plateSec.items.length === api.CAP && plateSec.extra === plateSec.total - api.CAP);
t("plates last section", secs[secs.length - 1].key === "plate");
var order = secs.map(function (s) { return s.key; });
var want = api.SECTIONS.map(function (s) { return s.key; }).filter(function (k) { return order.indexOf(k) !== -1; });
t("section order stable", JSON.stringify(order) === JSON.stringify(want));
// rank: title match above body match for same query
var rw = api.runQuery(E, "watch");
var firstWatch = rw.results[0];
t("title-rank first for watch", (firstWatch.title || "").toLowerCase().indexOf("watch") !== -1);
console.log("PASS " + pass + " / " + (pass + fail));
process.exit(fail ? 1 : 0);
