/* site-search.js — K98. Site-wide search, loaded ONLY on /search/.
   Client-side, zero-backend, zero-surveillance: fetches /search-index.json,
   filters in the page, stores nothing, phones nowhere.
   K95 lessons honored: pure-digit / "plate NNN" / "#N" queries route to
   NUMERIC plate equality via numToInt — Roman I..XXVII and arabic 001..436
   both resolve — so digit queries never collide with id hashes.
   DOM contract: #site-search-form #site-search-input #site-search-results
   #site-search-status — no-ops when absent. Escape-on-render via
   createElement/textContent only; no innerHTML with data. */
(function () {
  "use strict";

  /* ===== PURE-BEGIN — node-testable; keep markers intact ===== */
  function numToInt(s) {
    s = String(s == null ? "" : s).trim();
    if (!s) return null;
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    if (!/^[IVXLCDMivxlcdm]+$/.test(s)) return null;
    var map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    var up = s.toUpperCase(), total = 0, prev = 0;
    for (var i = up.length - 1; i >= 0; i--) {
      var v = map[up.charAt(i)];
      if (v < prev) { total -= v; } else { total += v; prev = v; }
    }
    return total > 0 ? total : null;
  }
  function plateQueryNum(q) {
    q = String(q == null ? "" : q);
    var m = /^\s*#?(\d{1,4})\s*$/.exec(q) || /^\s*plate\s*#?(\d{1,4})\s*$/i.exec(q);
    return m ? parseInt(m[1], 10) : null;
  }
  function blobOf(e) {
    return e.type === "plate"
      ? [e.id, e.num, e.series, e.room, e.title].join("|").toLowerCase()
      : [e.title, e.text, e.route].join("|").toLowerCase();
  }
  function scoreEntry(e, ql) {
    var t = (e.title || "").toLowerCase();
    if (t === ql) return 0;
    if (t.indexOf(ql) !== -1) return 1;
    if (blobOf(e).indexOf(ql) !== -1) return 2;
    return -1;
  }
  var SECTIONS = [
    { key: "glossary", label: "Glossary terms" },
    { key: "page", label: "Pages" },
    { key: "heading", label: "Page sections" },
    { key: "void", label: "Void Engine categories" },
    { key: "plate", label: "Gallery plates" }
  ];
  var CAP = 40;
  function runQuery(entries, raw) {
    var q = String(raw == null ? "" : raw).trim();
    if (!q) return { mode: "hint" };
    // numeric plate routing FIRST — "1" is a valid query (K95: digit forms
    // route to plate-number equality); the 2-char minimum is word-mode only
    var n = plateQueryNum(q);
    if (n !== null) {
      var hits = [];
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (e.type === "plate" && numToInt(e.num) === n) hits.push(e);
      }
      return { mode: "plate", n: n, results: hits };
    }
    if (q.length < 2) return { mode: "hint" };
    var ql = q.toLowerCase(), scored = [];
    for (var j = 0; j < entries.length; j++) {
      var s = scoreEntry(entries[j], ql);
      if (s >= 0) scored.push({ e: entries[j], s: s, i: j });
    }
    scored.sort(function (a, b) { return a.s - b.s || a.i - b.i; });
    var out = [];
    for (var k = 0; k < scored.length; k++) out.push(scored[k].e);
    return { mode: "word", q: ql, results: out };
  }
  function sectionize(results) {
    var by = {};
    for (var i = 0; i < results.length; i++) {
      var t = results[i].type;
      if (!by[t]) by[t] = [];
      by[t].push(results[i]);
    }
    var out = [];
    for (var s = 0; s < SECTIONS.length; s++) {
      var key = SECTIONS[s].key, items = by[key] || [];
      if (!items.length) continue;
      out.push({
        key: key, label: SECTIONS[s].label, total: items.length,
        items: items.slice(0, CAP),
        extra: items.length > CAP ? items.length - CAP : 0
      });
    }
    return out;
  }
  /* ===== PURE-END ===== */

  var form = document.getElementById("site-search-form");
  var input = document.getElementById("site-search-input");
  var resultsEl = document.getElementById("site-search-results");
  var statusEl = document.getElementById("site-search-status");
  if (!input || !resultsEl) return;

  var INDEX_URL = "/search-index.json?v=K98";
  var HINT = "type two or more characters — a word, a glossary term, or a plate number such as 041, #5, plate 7.";
  var entries = null;

  function setStatus(t) { if (statusEl) statusEl.textContent = t; }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function rowFor(e) {
    var li = el("li", "ss-row");
    var a = el("a", "ss-title");
    a.href = e.route;
    if (e.type === "plate") {
      a.textContent = "Plate " + e.num + (e.title ? " — " + e.title : "");
      var meta = el("p", "ss-meta", e.room + (e.series ? " · " + e.series : "") + " · " + e.id);
      if (e.nsfw) meta.appendChild(el("span", "ss-badge", "18+ consent-gated room"));
      li.appendChild(a);
      li.appendChild(meta);
    } else {
      a.textContent = e.title;
      li.appendChild(a);
      if (e.text) li.appendChild(el("p", "ss-text", e.text));
      li.appendChild(el("p", "ss-meta", e.route));
    }
    return li;
  }
  function render(res) {
    while (resultsEl.firstChild) resultsEl.removeChild(resultsEl.firstChild);
    if (!res || res.mode === "hint") { setStatus(HINT); return; }
    var sections = res.mode === "plate"
      ? (res.results.length
          ? [{ key: "plate", label: "Gallery plates — number " + res.n, total: res.results.length, items: res.results.slice(0, CAP), extra: res.results.length > CAP ? res.results.length - CAP : 0 }]
          : [])
      : sectionize(res.results);
    var total = res.results.length;
    setStatus(res.mode === "plate"
      ? total + (total === 1 ? " plate numbered " : " plates numbered ") + res.n + " across rooms"
      : total + (total === 1 ? " result" : " results"));
    if (!total) {
      resultsEl.appendChild(el("li", "ss-empty", "nothing matches — try a shorter fragment, a glossary term, or a plate number."));
      return;
    }
    for (var s = 0; s < sections.length; s++) {
      var sec = sections[s];
      var li = el("li", "ss-section");
      var head = el("h2", "ss-section-head", sec.label + " · " + sec.total);
      li.appendChild(head);
      var ul = el("ul", "ss-results");
      for (var i = 0; i < sec.items.length; i++) ul.appendChild(rowFor(sec.items[i]));
      li.appendChild(ul);
      if (sec.extra) li.appendChild(el("p", "ss-more", "+ " + sec.extra + " more — refine the query to narrow these."));
      resultsEl.appendChild(li);
    }
  }
  var debounceT = null;
  function onInput() {
    if (debounceT) clearTimeout(debounceT);
    debounceT = setTimeout(function () {
      var v = input.value;
      var url = v.trim()
        ? location.pathname + "?q=" + encodeURIComponent(v.trim())
        : location.pathname;
      try { history.replaceState(null, "", url); } catch (err) { /* sandboxed */ }
      render(entries ? runQuery(entries, v) : null);
    }, 120);
  }
  input.addEventListener("input", onInput);
  if (form) form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    render(entries ? runQuery(entries, input.value) : null);
  });

  setStatus("loading the index…");
  fetch(INDEX_URL, { cache: "no-cache" }).then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }).then(function (idx) {
    if (!idx || !idx.entries) throw new Error("bad index");
    entries = idx.entries;
    var q = "";
    try { q = new URLSearchParams(location.search).get("q") || ""; } catch (err) { q = ""; }
    if (q) input.value = q;
    render(runQuery(entries, input.value));
    input.focus();
  }).catch(function () {
    setStatus("could not load the search index — the navigation above reaches every section.");
  });
})();
