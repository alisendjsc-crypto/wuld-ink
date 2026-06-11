/* yurei.js — yurei mascot easter-egg widget (K115 core + K116 choreography)
   ====================================================================
   Site-side DOM layer; loaded ONLY by heavy-read pages. Graduates the
   K111 sealed harness (src/_/yurei-harness/) to a live, discreet egg.

   CORE (K115):
     - boot gate: viewport >= 900px AND not prefers-reduced-motion AND not
       opted-out (wuld:yurei.off). Reduced-motion -> canonical still only.
     - manifest-first: reads /assets/yurei/manifest_v2.json; resolves assets
       by manifest filename (never hard-coded), verifies px at load.
     - idle loop (VP9/WebM alpha) with the canonical still as poster + fallback.
     - WATCH: split-origin cursor geometry (asset spec sec4/sec4.1) — engage/disengage
       radii from the box CENTRE, zone angle + 140px dead zone from the scaled head
       anchor; 8 directional head-still swaps with hysteresis (360->460) + swap
       gates (>=150ms persist, >=200ms between).
     - runtime sha256 byte-gate (SubtleCrypto) on the idle loop before it plays;
       mismatch -> still-only fallback.
     - a11y opt-out (reduced-motion) + discreet kill-switch (wuld:yurei.off).
     - z-band above content / below lightbox-theater; pointer-events:none on all
       layers; floor 2.5rem + 8px above viewport bottom (ambient-bar band).

   CHOREOGRAPHY (K116):
     - DRIFT/PEEK transit oneshots — site-side CSS translateX on the container
       (never baked into video; asset spec sec6). Drift recedes +X so 38% of width
       stays visible past the viewport edge (3.0s ease, clip 4.0s); after a short
       receded dwell, PEEK returns to rest (2.0s ease, clip 3.0s). While receded:
       idle loop continues, WATCH suspends. Horizontal-only -> floor binds the
       rest anchor (already clamped in layout()).
     - FRAGMENT scheduler — the EB-Garamond DOM text layer (text library F01-F18).
       Rare/probabilistic ACTIVE-dwell cadence (4-9 min x 40% fire, K116a) + a manual
       window.yurei.surface() trigger; N=3 per session hard cap; ONE
       fragment on screen ever; without-replacement pool persisted cross-session in
       wuld:yurei.fragmentPool (re-pool on exhaustion). A fragment fires ONLY from
       IDLE via the SURFACE clip; fade-in begins 1.0s after the clip starts (hair
       cessation = annunciation cue), fully gone before clip-time 11.0s. Suppressed
       while receded / in transit / WATCH-active / reduced-motion (no SURFACE clip
       plays in reduced-motion, so no fragment — a divergence from text-library sec4
       "fade in place"; per the K116 operator instruction; flagged for W.U.L.D.).
     - EXORCISM — 3 consecutive no-dwell surfacings (visitor never approaches her
       during a fragment) -> she fades out (2.5s, no motion) and stays gone for the
       browsing session. Streak + exorcised flag live in sessionStorage (true
       per-session semantics on a multi-page site).

   Reads/writes localStorage key wuld:yurei (RESERVED) + a session-scoped sibling
   in sessionStorage (wuld:yurei.s). Trigger geometry is ours. */
(function () {
  "use strict";

  /* ---- core spec constants (asset spec sec4 / sec4.1, storyboard sec3) ---- */
  var MIN_W = 900;                                  // desktop-only mount gate
  var ENGAGE = 360, DISENGAGE = 460, DEADZONE = 140; // CSS px
  var ZONE_PERSIST_MS = 150, SWAP_MIN_MS = 200;     // sec4 swap gates
  var FLOOR_REM = 2.5, FLOOR_PAD = 8;               // sec5 floor: 2.5rem + 8px
  var FILL_VH = 0.55, CENTRE_VH = 0.58, EDGE_INSET = 16; // sec5 rest anchor

  /* ---- choreography spec constants (storyboard sec3/sec4/sec5, asset spec sec6, text lib sec4) ---- */
  var RECEDE_VISIBLE = 0.38;                         // sec6: fraction of width left visible while receded
  var DRIFT_CLIP_MS = 4000, DRIFT_MOVE_MS = 3000, DRIFT_LEAD_MS = 500;  // sec6: translate f12->f84
  var PEEK_CLIP_MS = 3000, PEEK_MOVE_MS = 2000, PEEK_LEAD_MS = 500;     // sec6: translate f12->f60
  var SURFACE_CLIP_MS = 12000;                       // sec4: 288f surface clip
  var RECEDE_DWELL_MIN = 9000, RECEDE_DWELL_MAX = 16000;   // receded idle dwell before peek-back
  var DRIFT_EVERY_MIN = 300000, DRIFT_EVERY_MAX = 540000;  // 5-9 min active-dwell between drift breaks
  var FRAG_EVERY_MIN = 240000, FRAG_EVERY_MAX = 540000, FRAG_FIRE_PROB = 0.4; // K116a: 4-9 min active dwell + 40% fire (rarer/random per operator)
  var FRAG_SESSION_CAP = 3;                          // sec4: N=3 per session
  var FRAG_AFTER_SURFACE_MS = 1000;                  // sec4 coupling: fade-in 1.0s after surface starts
  var FRAG_FADEIN_MS = 1800, FRAG_FADEOUT_MS = 3000; // sec4 lifecycle (K116b: gentler fades)
  var FRAG_HOLD_BASE_MS = 9000, FRAG_HOLD_PER_CHAR_MS = 40, FRAG_HOLD_CHAR_FLOOR = 40; // K116b hold = 9s + 40ms/char past 40 (was 5s; operator: too brief)
  var FRAG_OPACITY = 0.57;                           // sec3 channel lock
  var FRAG_OFFSET_FACTOR = 0.6;                      // sec4: 0.6 x figure-width toward viewport centre
  var FRAG_Y_MIN = 40, FRAG_Y_MAX = 90;             // sec4: head-anchor y + 40-90px
  var FRAG_DRIFT_MIN = 24, FRAG_DRIFT_MAX = 40;     // sec4: 24-40px toward nearest vertical edge
  var EXORCISM_STREAK = 3;                           // x3 consecutive no-dwell surfacings
  var EXORCISM_FADE_MS = 2500;                       // sec5 session-exit fade

  /* ---- fragment library — text library sec2, F01-F18 VERBATIM (em-dash, period-staccato) ---- */
  var FRAGMENTS = [
    "The filing continues. No one reads the filings.",
    "Indefinite respite — extended again, without notice.",
    "Taedium vitae, catalogued under T. The drawer does not close.",
    "Another circular from the interior. Unsigned, as always.",
    "The hour is kept. Nothing else is.",
    "Orthodox platitudes, shelved by weight.",
    "Dispatches from the inside. The inside has no further comment.",
    "The ganglion objects. The objection is noted and stored.",
    "The wound is on file. The file is the wound.",
    "Circulation: one. Readership: assumed.",
    "All departments dark — except this one.",
    "The night shift accepts no deliveries.",
    "Presence noted in the minutes. Attendance: partial.",
    "The archive breathes at intervals. This is one of them.",
    "Nothing is owed — something is kept anyway.",
    "The exit was filed under miscellany.",
    "Hours of operation: none. Operation continues.",
    "Grief, amortized over a long enough term, books as overhead."
  ];

  var BASE = "/assets/yurei/";
  var MANIFEST_URL = BASE + "manifest_v2.json";
  var KEY = "wuld:yurei";        // RESERVED localStorage (cross-session)
  var SKEY = "wuld:yurei.s";     // session-scoped sibling (sessionStorage)

  /* ---- localStorage blob (RESERVED key; cross-session) ---- */
  function readBlob() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function writeBlob(b) { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch (e) {} }
  var blob = readBlob();

  /* ---- sessionStorage sub-state (per-session: cap, no-dwell streak, exorcism) ---- */
  function readSess() { try { return JSON.parse(sessionStorage.getItem(SKEY) || "{}") || {}; } catch (e) { return {}; } }
  function writeSess(s) { try { sessionStorage.setItem(SKEY, JSON.stringify(s)); } catch (e) {} }
  var sess = readSess();

  /* ---- discreet console kill-switch (present regardless of mount) ---- */
  window.yurei = {
    off: function () { var b = readBlob(); b.off = true; writeBlob(b); teardown(); var f = document.getElementById("yurei"); if (f) f.parentNode.removeChild(f); return "yurei: off"; },
    on: function () { var b = readBlob(); b.off = false; writeBlob(b); var s = readSess(); s.exorcised = false; writeSess(s); return "yurei: on (reload to summon)"; },
    surface: function () { return forceSurface(); },  // K116a: manual surfacing for the initiated
    scale: function (v) { if (typeof v === "number" && v > 0 && v <= 1) { FILL_VH = v; if (fig) layout(); return "yurei: scale " + v; } return "yurei: scale=" + FILL_VH + " (pass 0-1)"; },  // K117 live dial (non-persistent)
    fade: function (v) { if (typeof v === "number" && v >= 0 && v <= 1) { if (fig) fig.style.opacity = String(v); return "yurei: fade " + v; } return "yurei: fade (pass 0-1)"; }  // K117 live dial (inline opacity override)
  };

  if (blob.off === true) return; // opted out — never mounts

  var mqReduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reduced() { return !!(mqReduce && mqReduce.matches); }
  function wide() { return window.innerWidth >= MIN_W; }

  /* ---- zone resolver (lifted from harness; asset spec sec4.1 sectors) ---- */
  var ZONES = [
    { name: "E", c: 0 }, { name: "NE", c: 45 }, { name: "N", c: 90 }, { name: "NW", c: 135 },
    { name: "W", c: 180 }, { name: "SW", c: -135 }, { name: "S", c: -90 }, { name: "SE", c: -45 }
  ];
  function zoneFor(theta, r) {
    if (r < DEADZONE) return "P0";
    var best = null, bd = 999;
    for (var i = 0; i < ZONES.length; i++) {
      var d = Math.abs(((theta - ZONES[i].c + 540) % 360) - 180); // angular distance
      if (d < bd) { bd = d; best = ZONES[i]; }
    }
    return best.name;                                  // zone NAME only — still resolved via stillFor() (manifest)
  }
  /* zone -> still filename, resolved from the manifest byRole map (no hard-coded version) */
  function stillFor(name) { return (name === "P0") ? p0Still : (stillByZone[name] || p0Still); }

  /* ---- module state ---- */
  var manifest = null, byRole = {}, idleAsset = null, stillAsset = null;
  var driftAsset = null, peekAsset = null, surfaceAsset = null;
  var px = { w: 540, h: 720 }, anchorPx = { x: 270, y: 169 }, scale = 1;
  var stillByZone = {}, p0Still = "";              // K117: zone->still filenames, built from manifest byRole at boot
  var fig = null, video = null, img = null;
  var mode = "boot";            // boot | live | still | gone
  var mounted = false, idleVerified = false;
  var watchActive = false, curZone = "", committedZone = "", zoneSince = 0, lastSwap = 0, curStill = "";
  var mouse = { x: -1, y: -1, seen: false }, pending = false;

  /* choreography state */
  var receded = false, transit = false, fragLive = false, surfaceActive = false, dwellThisSurface = false;
  var activeMs = 0, nextDriftAt = 0, nextFragAt = 0, surfaceManual = false;
  var fragEl = null, choreoStarted = false;
  var timers = [];
  function T(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() { for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]); timers = []; }

  function remPx() { return parseFloat(getComputedStyle(document.documentElement).fontSize) || 18; }
  function floorY() { return window.innerHeight - (FLOOR_REM * remPx() + FLOOR_PAD); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function dispW() { return parseFloat(fig && fig.style.width) || 0; }

  /* ---- runtime sha256 byte-gate (SubtleCrypto; secure context) ---- */
  function sha256ok(url, expected) {
    if (!(window.crypto && window.crypto.subtle)) return Promise.resolve(false);
    return fetch(url, { cache: "force-cache" })
      .then(function (r) { return r.arrayBuffer(); })
      .then(function (buf) { return window.crypto.subtle.digest("SHA-256", buf); })
      .then(function (d) {
        var a = new Uint8Array(d), hex = "";
        for (var i = 0; i < a.length; i++) hex += a[i].toString(16).padStart(2, "0");
        return hex === expected;
      })
      .catch(function () { return false; });
  }

  /* ---- layout: derive display size + rest anchor from manifest px (lifted from harness) ---- */
  function layout() {
    if (!fig) return;
    var vh = window.innerHeight, vw = window.innerWidth;
    var dispH = Math.min(px.h, vh * FILL_VH);
    var dW = dispH * (px.w / px.h);
    scale = dispH / px.h;
    var left = vw - dW - EDGE_INSET;             // sec5: right silhouette inset 16px
    var centreY = vh * CENTRE_VH;                // figure vertical centre at 58vh
    var top = centreY - dispH / 2;
    var maxTop = floorY() - dispH;               // floor law: anchor_bottom <= floor
    if (top > maxTop) top = maxTop;
    if (top < 0) top = 0;
    fig.style.width = dW + "px";
    fig.style.height = dispH + "px";
    fig.style.left = left + "px";
    fig.style.top = top + "px";
    if (receded) fig.style.transform = "translateX(" + recedeX() + "px)"; // keep receded offset on resize
  }
  function recedeX() { return (1 - RECEDE_VISIBLE) * dispW() + EDGE_INSET; } // sec6: 38% visible past edge

  /* ---- WATCH (rAF-throttled mousemove; sec4 A4) ---- */
  function onMove(e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.seen = true; if (!pending) { pending = true; requestAnimationFrame(tick); } }
  function setStill(file) { if (curStill !== file) { img.src = BASE + file; curStill = file; } }
  function engage() {
    watchActive = true; fig.setAttribute("data-watch", "1");
    if (video) { try { video.pause(); } catch (e) {} }
    committedZone = "P0"; curZone = "P0"; setStill(stillFor("P0"));
    if (surfaceActive) dwellThisSurface = true;       // approach during a surfacing = dwell (exorcism reset)
  }
  function disengage() {
    watchActive = false; fig.removeAttribute("data-watch"); committedZone = ""; curZone = "";
    restoreIdle();                                     // always resume the idle loop (never a stranded oneshot)
  }
  function tick() {
    pending = false;
    if (mode !== "live" || !fig || !mouse.seen) return;
    if (transit || receded) { if (watchActive) disengage(); return; } // WATCH suspends mid-transit / receded (sec6)
    var r = fig.getBoundingClientRect();
    var bcx = r.left + r.width / 2, bcy = r.top + r.height / 2;
    var rBox = Math.hypot(mouse.x - bcx, mouse.y - bcy);
    if (!watchActive && rBox <= ENGAGE) engage();
    else if (watchActive && rBox > DISENGAGE) disengage();
    if (!watchActive) return;
    var hax = r.left + anchorPx.x * scale, hay = r.top + anchorPx.y * scale;
    var vx = mouse.x - hax, vy = mouse.y - hay;
    var rHead = Math.hypot(vx, vy);
    var theta = Math.atan2(-vy, vx) * 180 / Math.PI;
    var zname = zoneFor(theta, rHead);
    var now = performance.now();
    if (zname !== curZone) { curZone = zname; zoneSince = now; }
    if (zname !== committedZone && (now - zoneSince) >= ZONE_PERSIST_MS && (now - lastSwap) >= SWAP_MIN_MS) {
      committedZone = zname; lastSwap = now; setStill(stillFor(zname));  // hard cut — sec4 (manifest-resolved)
    }
  }

  /* ---- video clip helpers ---- */
  function restoreIdle() {
    if (!video || !idleAsset) return;
    if (video.src.indexOf(idleAsset.file) === -1 || !video.loop) {
      video.loop = true; video.setAttribute("loop", "");
      video.src = BASE + idleAsset.file; video.currentTime = 0;
      var p = video.play(); if (p && p.catch) p.catch(function () {});
    } else {
      video.currentTime = 0;                       // sec4: resume idle from frame 0
      var q = video.play(); if (q && q.catch) q.catch(function () {});
    }
  }
  function playClip(asset, durMs, onEnd) {     // oneshot -> idle, idempotent finish
    if (!video || !asset) { if (onEnd) onEnd(); return; }
    var done = false;
    function finish() { if (done) return; done = true; video.removeEventListener("ended", finish); restoreIdle(); if (onEnd) onEnd(); }
    video.loop = false; video.removeAttribute("loop");
    try { video.pause(); } catch (e) {}
    video.src = BASE + asset.file; video.currentTime = 0;
    var p = video.play(); if (p && p.catch) p.catch(function () {});
    video.addEventListener("ended", finish, { once: true });
    T(finish, durMs + 400);                     // fallback if 'ended' is missed
  }

  /* ---- DRIFT / PEEK transit (site-side CSS translateX; asset spec sec6) ---- */
  function canMotion() {
    return mode === "live" && !reduced() && !transit && !receded && !fragLive && !surfaceActive && !watchActive && !sess.exorcised;
  }
  function doDrift() {
    if (!driftAsset) return;
    transit = true;
    playClip(driftAsset, DRIFT_CLIP_MS, function () {  // clip ends on P0 -> idle resumes receded
      transit = false; receded = true;
      T(doPeek, rnd(RECEDE_DWELL_MIN, RECEDE_DWELL_MAX)); // real-time dwell, then return
    });
    fig.style.transition = "transform " + DRIFT_MOVE_MS + "ms cubic-bezier(.4,0,.2,1)";
    T(function () { fig.style.transform = "translateX(" + recedeX() + "px)"; }, DRIFT_LEAD_MS);
  }
  function doPeek() {
    if (!peekAsset) { transit = false; receded = false; fig.style.transform = "translateX(0)"; return; }
    transit = true; receded = false;
    playClip(peekAsset, PEEK_CLIP_MS, function () { transit = false; });
    fig.style.transition = "transform " + PEEK_MOVE_MS + "ms cubic-bezier(.4,0,.2,1)";
    T(function () { fig.style.transform = "translateX(0)"; }, PEEK_LEAD_MS);
  }

  /* ---- FRAGMENT scheduler (text library sec4) ---- */
  function canFragment() {
    return mode === "live" && !reduced() && !transit && !receded && !fragLive && !surfaceActive && !watchActive &&
      !sess.exorcised && (sess.fragCount || 0) < FRAG_SESSION_CAP && !!surfaceAsset;
  }
  function drawFragment() {                      // without-replacement; persist remaining pool cross-session
    var b = readBlob();
    var pool = Array.isArray(b.fragmentPool) ? b.fragmentPool.slice() : null;
    if (!pool || !pool.length) { pool = []; for (var i = 0; i < FRAGMENTS.length; i++) pool.push(i); } // re-pool on exhaustion
    var k = Math.floor(Math.random() * pool.length);
    var idx = pool.splice(k, 1)[0];
    b.fragmentPool = pool; writeBlob(b); blob = b;
    return idx;
  }
  function holdMs(text) { return FRAG_HOLD_BASE_MS + Math.max(0, text.length - FRAG_HOLD_CHAR_FLOOR) * FRAG_HOLD_PER_CHAR_MS; }

  function doSurface() {                          // organic: counts toward the N=3 session cap
    if (!canFragment()) return;
    sess.fragCount = (sess.fragCount || 0) + 1; writeSess(sess);
    beginSurface(false);
  }
  function forceSurface() {                       // K116a manual trigger — ignores cadence + cap, skips exorcism streak
    if (mode !== "live") return "yurei: not live (reduced-motion / not mounted / gone)";
    if (!surfaceAsset) return "yurei: no surface asset";
    if (fragLive || surfaceActive || transit || receded) return "yurei: busy, try again in a moment";
    beginSurface(true);
    return "yurei: surfacing";
  }
  function beginSurface(manual) {
    surfaceManual = !!manual;
    dwellThisSurface = false; surfaceActive = true;
    var idx = drawFragment();
    var text = FRAGMENTS[idx];
    playClip(surfaceAsset, SURFACE_CLIP_MS, function () {}); // in place; no translation
    T(function () { spawnFragment(text); }, FRAG_AFTER_SURFACE_MS); // hair has ceased -> annunciation cue
  }

  function spawnFragment(text) {
    if (mode !== "live" || !fig) { surfaceActive = false; return; }
    fragLive = true;
    var el = document.createElement("div");
    el.className = "yurei-fragment";
    el.setAttribute("aria-hidden", "true");
    el.textContent = text;                        // textContent = XSS-safe; library is static anyway
    document.body.appendChild(el);
    fragEl = el;

    // position: offset 0.6x figure-width toward viewport centre (her left), head-anchor y + 40-90px
    var r = fig.getBoundingClientRect();
    var headX = r.left + anchorPx.x * scale, headY = r.top + anchorPx.y * scale;
    var x = headX - FRAG_OFFSET_FACTOR * r.width;
    var y = headY + rnd(FRAG_Y_MIN, FRAG_Y_MAX);
    var ew = el.offsetWidth, eh = el.offsetHeight;
    if (x < EDGE_INSET) x = headX + 0.12 * r.width;          // sec4 flip-side rather than shrink the offset
    if (x + ew > window.innerWidth - EDGE_INSET) x = window.innerWidth - EDGE_INSET - ew;
    var maxY = floorY() - eh;                                 // sec4 never crosses the floor
    if (y > maxY) y = maxY;
    if (y < EDGE_INSET) y = EDGE_INSET;
    el.style.left = Math.round(x) + "px";
    el.style.top = Math.round(y) + "px";

    var toEdge = (y + eh / 2 < window.innerHeight / 2) ? -1 : 1;  // drift toward the nearer vertical edge
    var driftPx = rnd(FRAG_DRIFT_MIN, FRAG_DRIFT_MAX) * toEdge;
    var hold = holdMs(text);

    requestAnimationFrame(function () {                       // fade-in 1.5s, no positional motion
      el.style.transition = "opacity " + FRAG_FADEIN_MS + "ms ease";
      el.style.opacity = String(FRAG_OPACITY);
    });
    T(function () {                                           // hold begins -> slow drift across hold + fade-out
      if (!fragEl) return;
      el.style.transition = "opacity " + FRAG_FADEOUT_MS + "ms ease, transform " + (hold + FRAG_FADEOUT_MS) + "ms linear";
      el.style.transform = "translateY(" + driftPx + "px)";
    }, FRAG_FADEIN_MS);
    T(function () { if (fragEl) fragEl.style.opacity = "0"; }, FRAG_FADEIN_MS + hold); // fade-out
    T(function () {                                           // teardown + surfacing verdict
      if (fragEl && fragEl.parentNode) fragEl.parentNode.removeChild(fragEl);
      fragEl = null; fragLive = false;
      endSurfacing();
    }, FRAG_FADEIN_MS + hold + FRAG_FADEOUT_MS);
  }

  function endSurfacing() {
    surfaceActive = false;
    if (surfaceManual) { surfaceManual = false; return; }   // manual surfacings are exempt from the exorcism streak
    if (dwellThisSurface) { sess.noDwellStreak = 0; }
    else { sess.noDwellStreak = (sess.noDwellStreak || 0) + 1; }
    writeSess(sess);
    if ((sess.noDwellStreak || 0) >= EXORCISM_STREAK) exorcise();
  }

  function exorcise() {                                       // x3 no-dwell -> gone for the session
    sess.exorcised = true; writeSess(sess);
    clearTimers();
    if (fragEl && fragEl.parentNode) { fragEl.parentNode.removeChild(fragEl); fragEl = null; }
    fragLive = false; surfaceActive = false; receded = false; transit = false;
    if (fig) {
      fig.style.transition = "opacity " + EXORCISM_FADE_MS + "ms ease";  // sec5 exit: fade, no motion
      fig.classList.remove("yurei-in"); fig.style.opacity = "0";
      window.setTimeout(function () { if (fig && fig.parentNode) fig.parentNode.removeChild(fig); }, EXORCISM_FADE_MS + 100);
    }
    mode = "gone";
  }

  /* ---- idle-break ticker: 1s, gated on visible + live; counts ACTIVE dwell only ---- */
  function startChoreo() {
    if (choreoStarted) return; choreoStarted = true;
    nextDriftAt = rnd(DRIFT_EVERY_MIN, DRIFT_EVERY_MAX);
    nextFragAt = rnd(FRAG_EVERY_MIN, FRAG_EVERY_MAX);
    var iv = window.setInterval(function () {
      if (mode !== "live") { window.clearInterval(iv); return; }
      if (document.visibilityState === "hidden") return;   // "active dwell" — clock pauses when backgrounded
      activeMs += 1000;
      if (activeMs >= nextFragAt) {                         // fragment cadence (rare + probabilistic, K116a)
        if ((sess.fragCount || 0) >= FRAG_SESSION_CAP) { nextFragAt = Number.MAX_VALUE; }      // capped -> stop polling, free the drift lane
        else if (canFragment() && Math.random() < FRAG_FIRE_PROB) { doSurface(); nextFragAt = activeMs + rnd(FRAG_EVERY_MIN, FRAG_EVERY_MAX); }
        else { nextFragAt = activeMs + rnd(FRAG_EVERY_MIN, FRAG_EVERY_MAX); }                   // prob miss / transient block -> reschedule (keeps it rare)
      }
      if (activeMs >= nextDriftAt) {                         // drift lane independent of the fragment cap
        if (canMotion()) { doDrift(); nextDriftAt = activeMs + rnd(DRIFT_EVERY_MIN, DRIFT_EVERY_MAX); }
      }
    }, 1000);
    timers.push(iv);
  }

  /* ---- mount ---- */
  function preloadStills() {                           // K117: preload the manifest-resolved stills (no hard-coded names)
    var names = [];
    if (p0Still) names.push(p0Still);
    for (var z in stillByZone) { if (stillByZone.hasOwnProperty(z)) names.push(stillByZone[z]); }
    for (var i = 0; i < names.length; i++) { var im = new Image(); im.src = BASE + names[i]; }
  }

  function buildDom() {
    fig = document.createElement("div");
    fig.id = "yurei";
    fig.setAttribute("aria-hidden", "true");
    video = document.createElement("video");
    video.muted = true; video.loop = true; video.playsInline = true;
    video.setAttribute("muted", ""); video.setAttribute("playsinline", "");
    video.setAttribute("aria-hidden", "true"); video.preload = "none";
    img = document.createElement("img");
    img.alt = ""; img.setAttribute("aria-hidden", "true"); img.decoding = "async";
    img.src = BASE + p0Still;                          // canonical still (manifest-resolved) = poster + fallback
    curStill = p0Still;
    fig.appendChild(video); fig.appendChild(img);
    document.body.appendChild(fig);
    layout();
    requestAnimationFrame(function () { fig.classList.add("yurei-in"); });
  }

  function goStill() {            // reduced-motion opt-out, or sha256 fallback — no choreography
    mode = "still";
    fig.setAttribute("data-still", "1");
  }

  function goLive() {
    mode = "live";
    video.poster = BASE + p0Still;
    video.preload = "auto";
    video.src = BASE + idleAsset.file;
    var p = video.play(); if (p && p.catch) p.catch(function () {});
    preloadStills();
    window.addEventListener("mousemove", onMove, { passive: true });
    startChoreo();                                          // K116: idle-break scheduler boots only when live
  }

  function teardown() { clearTimers(); choreoStarted = false; mode = "gone"; }

  function activate() {
    if (mounted) return;
    if (readSess().exorcised) return;                        // gone for this session — never re-mounts
    mounted = true;
    var b = readBlob(); b.activated = true; writeBlob(b);    // A1 activation flag
    buildDom();
    if (reduced()) { goStill(); return; }                   // sec6 reduced-motion = still only, no clips
    sha256ok(BASE + idleAsset.file, idleAsset.sha256).then(function (ok) {
      idleVerified = ok;
      if (ok) goLive(); else goStill();                     // mismatch -> still-only fallback
    });
  }

  /* ---- boot: manifest-first ---- */
  function boot() {
    if (readSess().exorcised) return;                        // respect a prior-page exorcism this session
    fetch(MANIFEST_URL, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (m) {
        manifest = m;
        for (var i = 0; i < m.assets.length; i++) { byRole[m.assets[i].role] = m.assets[i]; }
        idleAsset = byRole["idle"];
        stillAsset = byRole["canonical-p0"];
        driftAsset = byRole["drift"]; peekAsset = byRole["peek"]; surfaceAsset = byRole["surface"];
        if (!idleAsset || !stillAsset) return;              // contract broken — render nothing
        p0Still = stillAsset.file;                          // K117: build zone->still map from manifest roles
        stillByZone = {};
        var ZN = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        for (var zj = 0; zj < ZN.length; zj++) { var ra = byRole["watch-" + ZN[zj].toLowerCase()]; if (ra) stillByZone[ZN[zj]] = ra.file; }
        px = { w: idleAsset.px.w, h: idleAsset.px.h };
        anchorPx = { x: idleAsset.anchorPx.x, y: idleAsset.anchorPx.y };
        if (wide()) activate();
        else {                                              // narrow now — mount if widened later
          var onResize = function () { if (wide()) { window.removeEventListener("resize", onResize); activate(); } };
          window.addEventListener("resize", onResize);
        }
      })
      .catch(function () { if (window.console && console.warn) console.warn("yurei: manifest unreachable"); });
  }

  window.addEventListener("resize", function () { if (fig) layout(); });
  if (mqReduce && mqReduce.addEventListener) {
    mqReduce.addEventListener("change", function () {        // honor a live reduced-motion flip
      if (mode === "live" && reduced()) { goStill(); if (video) { try { video.pause(); } catch (e) {} } clearTimers(); }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
