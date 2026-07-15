/* console-prng.js — vendored seedable PRNG for the /console/ crawler (K235).
   xmur3 (string -> 32-bit seed generator) + mulberry32 (32-bit -> [0,1) stream).
   These are the canonical public-domain implementations (bryc / Tommy Ettinger).
   The void-engine's DUAL_ENGINE substitution (K93) dropped the original component's
   copy, so the named algorithm is vendored fresh here — a fixed algorithm, pinned
   in console-e2e.cjs against an inline reference + a golden output vector.
   FICTION ENGINE ONLY. No argument-library import, no stance, ever. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.ConsolePRNG = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // xmur3: hash a string into a function that yields well-mixed 32-bit seeds.
  function xmur3(str) {
    str = String(str == null ? "" : str);
    var h = 1779033703 ^ str.length, i = 0;
    for (; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  }

  // mulberry32: a 32-bit seed -> a deterministic [0,1) float stream.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // makeRng: a seed string -> a small, deterministic helper surface.
  function makeRng(seedStr) {
    var seedFn = xmur3(seedStr == null ? "" : String(seedStr));
    var f = mulberry32(seedFn());       // one xmur3 draw seeds the stream
    var rng = {
      seed: seedStr == null ? "" : String(seedStr),
      float: function () { return f(); },
      // 0 .. n-1
      int: function (n) { return Math.floor(f() * n); },
      // inclusive lo..hi
      range: function (lo, hi) { return lo + Math.floor(f() * (hi - lo + 1)); },
      pick: function (arr) { return arr[Math.floor(f() * arr.length)]; },
      chance: function (p) { return f() < p; },
      shuffle: function (arr) {
        var a = arr.slice(), i, j, t;
        for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(f() * (i + 1));
          t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      }
    };
    return rng;
  }

  return { xmur3: xmur3, mulberry32: mulberry32, makeRng: makeRng };
});
