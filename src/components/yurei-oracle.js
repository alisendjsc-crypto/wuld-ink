/* yurei-oracle.js — Yūrei deterministic matcher (persona + oracle lanes)
   ------------------------------------------------------------------------
   PORTED, byte-for-routing, from tools/yurei/yurei_harness.py (the library-seat
   reference). The Python harness is the authority; this file reproduces its
   normalization law, matching pipeline, scoring, LRU and tie-breaks EXACTLY.
   A parity suite (tools/yurei/yurei-parity.mjs) proves identical routing over
   the 8 schema fixtures + P1..P10 probes + a differential battery.

   Two lanes, one pipeline. When NO oracle-class entries are loaded the oracle
   lane is inert and this matcher is bit-identical to the Python persona matcher
   (that invariant is what the parity gate asserts).

   Pipeline order, per turn:
     1. CRISIS scan  — absolute priority, exempt from dampening (persona crises).
     2. ORACLE lane  — a DIRECT site question (best oracle score >= ORACLE_MIN)
                       routes to the oracle FAQ; ambiguous falls through.
     3. CONTINUATION — exact low-signal answer to an entry with followups.
     4. REPEAT       — identical normalized input within repeat_window.
     5. SCORE        — persona responses; threshold + dampening.
     6. MISS         — deflection pool (LRU, dampened).

   No backend, no network, no open-domain QA. A bounded bank of prepared
   answers and a rule for choosing one.  (UMD: module.exports + globalThis.) */
(function (root) {
  "use strict";

  // -------- constants (schema; mirror yurei_harness.py) --------
  var MISS_THRESHOLD   = 16;   // response miss floor
  var NO_REPEAT_WINDOW = 8;    // dampening.no_repeat_window
  var REPEAT_WINDOW    = 5;    // repeat-detection lookback
  var ORACLE_MIN       = 40;   // oracle fires only on a DIRECT hit (exact/contains/tokens_all);
                               // a bare tokens_any (<=24) is "ambiguous" -> persona.

  var BASE = { exact: 100, contains: 60, tokens_all: 40, tokens_any: 15 };

  var LOW_SIGNAL = ["ok", "and", "and then", "go on", "so", "more",
                    "then what", "continue", "yes", "why"];

  // -------- normalization law (schema.normalization) --------
  //   1 NFKC  2 lowercase  3 strip non-(letter|digit|space)  4 collapse ws  5 trim
  //   destructive: punctuation & hyphens removed with NO substitution.
  //   Parity note: Python uses str.isalnum()/str.isspace() (Unicode-aware). The
  //   \p{L}\p{N}\s class below matches those categories; all fixtures/probes are
  //   ASCII so routing is identical, and the differential battery checks Unicode
  //   inputs converge (benign: both sides miss -> same deflection).
  var STRIP_RE = /[^\p{L}\p{N}\s]/gu;
  var WS_RE = /\s+/g;
  function normalize(s) {
    if (s == null) s = "";
    s = String(s).normalize("NFKC").toLowerCase();
    s = s.replace(STRIP_RE, "");
    s = s.replace(WS_RE, " ");
    return s.trim();
  }

  function tokens(form) {
    var out = [], parts = form.split(" ");
    for (var i = 0; i < parts.length; i++) if (parts[i]) out.push(parts[i]);
    return out;
  }

  // -------- pattern scoring --------
  // form is a whole-token substring of text (both normalized => only [alnum space];
  // boundaries are string start/end or a space).
  function wordBoundaryContains(form, text) {
    if (form === text) return true;
    var i = text.indexOf(form);
    while (i !== -1) {
      var beforeOk = (i === 0) || (text.charAt(i - 1) === " ");
      var end = i + form.length;
      var afterOk = (end === text.length) || (text.charAt(end) === " ");
      if (beforeOk && afterOk) return true;
      i = text.indexOf(form, i + 1);
    }
    return false;
  }

  function patternMatch(pat, text) {
    var form = pat.form, mode = pat.mode;
    if (mode === "exact") return text === form;
    if (mode === "contains") return wordBoundaryContains(form, text);
    if (mode === "tokens_all") {
      var t = tokens(form);
      for (var i = 0; i < t.length; i++) if (!wordBoundaryContains(t[i], text)) return false;
      return true;
    }
    if (mode === "tokens_any") {
      var ta = tokens(form);
      for (var j = 0; j < ta.length; j++) {
        if (ta[j].length >= 3 && wordBoundaryContains(ta[j], text)) return true;
      }
      return false;
    }
    return false;
  }

  // returns [score, longestMatchedFormLen]; score = max(base+weight) over matches
  function entryScore(entry, text) {
    var best = null, bestLen = 0;
    var pats = entry.patterns || [];
    for (var i = 0; i < pats.length; i++) {
      var pat = pats[i];
      if (patternMatch(pat, text)) {
        var sc = BASE[pat.mode] + (pat.weight | 0);
        var mlen = pat.form.length;
        if (best === null || sc > best || (sc === best && mlen > bestLen)) {
          best = sc; bestLen = mlen;
        }
      }
    }
    if (best === null) return [0, 0];
    return [best, bestLen];
  }

  // candidate comparator: score desc, matched-len desc, id asc  (== python (-sc,-mlen,id))
  function cmpCandidate(a, b) {
    if (a.sc !== b.sc) return b.sc - a.sc;
    if (a.mlen !== b.mlen) return b.mlen - a.mlen;
    return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
  }

  // -------- matcher (deterministic; carries per-session state) --------
  function Matcher(entries, opts) {
    opts = opts || {};
    this.entries = entries;
    this.by_id = {};
    for (var i = 0; i < entries.length; i++) this.by_id[entries[i].id] = entries[i];
    this.unsealed = !!opts.unsealed;
    this.repeat_window = (opts.repeat_window != null) ? opts.repeat_window : REPEAT_WINDOW;

    this.input_hist = [];
    this.emit_turn = {};        // id -> last turn emitted
    this.turn = -1;
    this.last_entry_id = null;
    this.followups_used = {};   // id -> {fid:true}

    var self = this;
    function visible(e) { return e.tier === "public" ? true : self.unsealed; }
    this._visible = visible;

    this.responses   = entries.filter(function (e) { return e.class === "response"   && visible(e); });
    this.deflections = entries.filter(function (e) { return e.class === "deflection" && visible(e); });
    this.repeats     = entries.filter(function (e) { return e.class === "repeat"     && visible(e); });
    this.crises      = entries.filter(function (e) { return e.class === "crisis"; });
    this.oracle      = entries.filter(function (e) { return e.class === "oracle"     && visible(e); });

    this._lastLane = null;      // "crisis" | "oracle" | "continuation" | "repeat" | "response" | "deflection"
  }

  Matcher.prototype._lru_pick = function (pool) {
    if (!pool || !pool.length) return null;
    var self = this, best = null;
    for (var i = 0; i < pool.length; i++) {
      var e = pool[i];
      var t = (self.emit_turn[e.id] != null) ? self.emit_turn[e.id] : -1;
      if (best === null) { best = { e: e, t: t }; continue; }
      if (t < best.t || (t === best.t && e.id < best.e.id)) best = { e: e, t: t };
    }
    return best ? best.e : null;
  };

  Matcher.prototype._damped = function (id) {
    var t = this.emit_turn[id];
    return t != null && (this.turn - t) < NO_REPEAT_WINDOW;
  };

  Matcher.prototype._emit = function (entry, lane) {
    this.emit_turn[entry.id] = this.turn;
    this.last_entry_id = entry.id;
    this._lastLane = lane || null;
    return entry.id;
  };

  // scored candidates over a pool, above a floor, first non-damped by tie-break.
  // damp=false => dampening-exempt (oracle & any always-answer lane): take the
  // top candidate regardless of recency (a re-asked FAQ re-answers).
  Matcher.prototype._pickScored = function (pool, text, floor, lane, damp) {
    if (damp === undefined) damp = true;
    var scored = [];
    for (var i = 0; i < pool.length; i++) {
      var r = entryScore(pool[i], text);
      if (r[0] > 0) scored.push({ sc: r[0], mlen: r[1], id: pool[i].id, e: pool[i] });
    }
    var best = 0;
    for (var j = 0; j < scored.length; j++) if (scored[j].sc > best) best = scored[j].sc;
    if (best < floor) return { best: best, id: null };
    scored.sort(cmpCandidate);
    for (var k = 0; k < scored.length; k++) {
      if (scored[k].sc < floor) break;
      if (!damp || !this._damped(scored[k].id)) return { best: best, id: this._emit(scored[k].e, lane) };
    }
    return { best: best, id: null, allDamped: true };
  };

  Matcher.prototype._miss = function () {
    var pool = this.deflections.filter(function (e) { return !this._damped(e.id); }, this);
    if (!pool.length) pool = this.deflections;
    var pick = this._lru_pick(pool);
    if (pick == null) return null;
    return this._emit(pick, "deflection");
  };

  Matcher.prototype.match = function (raw) {
    this.turn += 1;
    var text = normalize(raw);

    // 1. CRISIS — absolute priority (any crisis pattern hit, sc>0), exempt from dampening
    var crisisHits = [];
    for (var i = 0; i < this.crises.length; i++) {
      var r = entryScore(this.crises[i], text);
      if (r[0] > 0) crisisHits.push({ sc: r[0], mlen: r[1], id: this.crises[i].id, e: this.crises[i] });
    }
    if (crisisHits.length) {
      crisisHits.sort(cmpCandidate);
      this.input_hist.push(text);
      return this._emit(crisisHits[0].e, "crisis");
    }

    // 2. ORACLE lane — a DIRECT site question routes to the FAQ (exact/contains/tokens_all).
    //    Inert when no oracle entries loaded => persona parity is exact.
    if (this.oracle.length) {
      var o = this._pickScored(this.oracle, text, ORACLE_MIN, "oracle", false); // dampening-exempt
      if (o.id) { this.input_hist.push(text); return o.id; }
      // no direct oracle hit -> fall through to persona (hist untouched)
    }

    // 3. CONTINUATION — exact low-signal answer to prev entry with unused followups
    if (this.last_entry_id) {
      var lowNorm = false;
      for (var s = 0; s < LOW_SIGNAL.length; s++) { if (normalize(LOW_SIGNAL[s]) === text) { lowNorm = true; break; } }
      if (lowNorm) {
        var prev = this.by_id[this.last_entry_id];
        if (prev && prev.followups && prev.followups.length) {
          var used = this.followups_used[prev.id] || (this.followups_used[prev.id] = {});
          for (var f = 0; f < prev.followups.length; f++) {
            var fid = prev.followups[f];
            if (!used[fid] && this.by_id[fid] && this._visible(this.by_id[fid])) {
              used[fid] = true;
              this.input_hist.push(text);
              return this._emit(this.by_id[fid], "continuation");
            }
          }
        }
      }
    }

    // 4. REPEAT — identical normalized input within window (hist excludes current)
    var window = this.repeat_window ? this.input_hist.slice(-this.repeat_window) : this.input_hist;
    var prior = 0;
    for (var w = 0; w < window.length; w++) if (window[w] === text) prior++;
    if (prior === 1) {
      this.input_hist.push(text);
      var rpool = this.repeats.filter(function (e) { return !this._damped(e.id); }, this);
      if (!rpool.length) rpool = this.repeats;
      var pick = this._lru_pick(rpool);
      if (pick) return this._emit(pick, "repeat");
      return this._miss();
    } else if (prior >= 2) {
      this.input_hist.push(text);
      return this._miss();
    }

    // 5. SCORE persona responses (append happens here on the normal path)
    this.input_hist.push(text);
    var res = this._pickScored(this.responses, text, MISS_THRESHOLD, "response");
    if (res.id) return res.id;
    // best < threshold OR all matching candidates damped -> miss
    return this._miss();
  };

  // convenience for the UI: full record + lane, without re-running match
  Matcher.prototype.respond = function (raw) {
    var id = this.match(raw);
    var e = id ? this.by_id[id] : null;
    return {
      id: id,
      lane: this._lastLane,
      response: e ? e.response : null,
      animation_hint: e ? e.animation_hint : null,
      register_tags: e ? (e.register_tags || []) : [],
      class: e ? e.class : null,
      tier: e ? e.tier : null
    };
  };

  var API = {
    normalize: normalize,
    tokens: tokens,
    wordBoundaryContains: wordBoundaryContains,
    patternMatch: patternMatch,
    entryScore: entryScore,
    Matcher: Matcher,
    CONST: {
      MISS_THRESHOLD: MISS_THRESHOLD,
      NO_REPEAT_WINDOW: NO_REPEAT_WINDOW,
      REPEAT_WINDOW: REPEAT_WINDOW,
      ORACLE_MIN: ORACLE_MIN,
      BASE: BASE,
      LOW_SIGNAL: LOW_SIGNAL
    }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.YureiOracle = API;
})(typeof self !== "undefined" ? self : (typeof globalThis !== "undefined" ? globalThis : this));
