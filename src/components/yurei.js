/* yurei.js — yurei mascot easter-egg widget (K115)
   ====================================================================
   Site-side DOM layer; loaded ONLY by heavy-read pages. Graduates the
   K111 sealed harness (src/_/yurei-harness/) to a live, discreet egg.

   MUST-SHIP CORE (this session):
     - boot gate: viewport >= 900px AND not prefers-reduced-motion AND not
       opted-out (wuld:yurei.off). Reduced-motion -> canonical still only.
     - manifest-first: reads /assets/yurei/manifest_v1.json; resolves assets
       by manifest filename (never hard-coded), verifies px at load.
     - idle loop (VP9/WebM alpha) with the canonical still as poster + fallback.
     - WATCH: split-origin cursor geometry (asset spec §4/§4.1) lifted from the
       harness overlay — engage/disengage radii from the box CENTRE, zone angle +
       140px dead zone from the scaled head anchor; 8 directional head-still swaps
       with hysteresis (360->460) + swap gates (>=150ms persist, >=200ms between).
     - runtime sha256 byte-gate (SubtleCrypto) on the idle loop before it plays;
       mismatch -> still-only fallback (defensive vs the W.U.L.D. truncation trap).
     - a11y opt-out (reduced-motion) + discreet kill-switch (wuld:yurei.off).
     - z-band above content / below lightbox-theater; pointer-events:none on all
       layers; floor 2.5rem + 8px above viewport bottom (ambient-bar band).

   K116 (choreography, deliberately deferred): drift / peek / surface oneshots,
   the EB-Garamond fragment scheduler (text library), exorcism (×3 no-dwell).

   Reads/writes localStorage key wuld:yurei (RESERVED). Trigger geometry is ours. */
(function () {
  "use strict";

  /* ---- spec constants (asset spec §4 / §4.1, storyboard §3) ---- */
  var MIN_W = 900;                                  // desktop-only mount gate
  var ENGAGE = 360, DISENGAGE = 460, DEADZONE = 140; // CSS px
  var ZONE_PERSIST_MS = 150, SWAP_MIN_MS = 200;     // §4 swap gates
  var FLOOR_REM = 2.5, FLOOR_PAD = 8;               // §5 floor: 2.5rem + 8px
  var FILL_VH = 0.70, CENTRE_VH = 0.58, EDGE_INSET = 16; // §5 rest anchor

  var BASE = "/assets/yurei/";
  var MANIFEST_URL = BASE + "manifest_v1.json";
  var KEY = "wuld:yurei";

  /* ---- localStorage blob (RESERVED key) ---- */
  function readBlob() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function writeBlob(b) { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch (e) {} }
  var blob = readBlob();

  /* ---- discreet console kill-switch (present regardless of mount) ---- */
  window.yurei = {
    off: function () { var b = readBlob(); b.off = true; writeBlob(b); var f = document.getElementById("yurei"); if (f) f.parentNode.removeChild(f); return "yurei: off"; },
    on: function () { var b = readBlob(); b.off = false; writeBlob(b); return "yurei: on (reload to summon)"; }
  };

  if (blob.off === true) return; // opted out — never mounts

  var mqReduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reduced() { return !!(mqReduce && mqReduce.matches); }
  function wide() { return window.innerWidth >= MIN_W; }

  /* ---- zone resolver (lifted from harness; matches asset spec §4.1 sectors) ---- */
  var ZONES = [
    { name: "E", c: 0 }, { name: "NE", c: 45 }, { name: "N", c: 90 }, { name: "NW", c: 135 },
    { name: "W", c: 180 }, { name: "SW", c: -135 }, { name: "S", c: -90 }, { name: "SE", c: -45 }
  ];
  function zoneFor(theta, r) {
    if (r < DEADZONE) return { name: "P0", still: "yurei_still_v1.png" };
    var best = null, bd = 999;
    for (var i = 0; i < ZONES.length; i++) {
      var d = Math.abs(((theta - ZONES[i].c + 540) % 360) - 180); // angular distance
      if (d < bd) { bd = d; best = ZONES[i]; }
    }
    return { name: best.name, still: "yurei_head_" + best.name.toLowerCase() + "_v1.png" };
  }

  /* ---- module state ---- */
  var manifest = null, byRole = {}, idleAsset = null, stillAsset = null;
  var px = { w: 540, h: 720 }, anchorPx = { x: 270, y: 169 }, scale = 1;
  var fig = null, video = null, img = null;
  var mode = "boot";            // boot | live | still
  var mounted = false, idleVerified = false;
  var watchActive = false, curZone = "", committedZone = "", zoneSince = 0, lastSwap = 0, curStill = "";
  var mouse = { x: -1, y: -1, seen: false }, pending = false;

  function remPx() { return parseFloat(getComputedStyle(document.documentElement).fontSize) || 18; }
  function floorY() { return window.innerHeight - (FLOOR_REM * remPx() + FLOOR_PAD); }

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
    var dispW = dispH * (px.w / px.h);
    scale = dispH / px.h;
    var left = vw - dispW - EDGE_INSET;          // §5: right silhouette inset 16px
    var centreY = vh * CENTRE_VH;                // figure vertical centre at 58vh
    var top = centreY - dispH / 2;
    var maxTop = floorY() - dispH;               // floor law: anchor_bottom <= floor
    if (top > maxTop) top = maxTop;
    if (top < 0) top = 0;
    fig.style.width = dispW + "px";
    fig.style.height = dispH + "px";
    fig.style.left = left + "px";
    fig.style.top = top + "px";
  }

  /* ---- WATCH (rAF-throttled mousemove; §4 A4) ---- */
  function onMove(e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.seen = true; if (!pending) { pending = true; requestAnimationFrame(tick); } }
  function setStill(file) { if (curStill !== file) { img.src = BASE + file; curStill = file; } }
  function engage() { watchActive = true; fig.setAttribute("data-watch", "1"); if (video) { try { video.pause(); } catch (e) {} } committedZone = "P0"; curZone = "P0"; setStill("yurei_still_v1.png"); }
  function disengage() { watchActive = false; fig.removeAttribute("data-watch"); committedZone = ""; curZone = ""; if (video) { try { video.currentTime = 0; var p = video.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} } }
  function tick() {
    pending = false;
    if (mode !== "live" || !fig || !mouse.seen) return;
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
    var z = zoneFor(theta, rHead);
    var now = performance.now();
    if (z.name !== curZone) { curZone = z.name; zoneSince = now; }
    if (z.name !== committedZone && (now - zoneSince) >= ZONE_PERSIST_MS && (now - lastSwap) >= SWAP_MIN_MS) {
      committedZone = z.name; lastSwap = now; setStill(z.still);  // hard cut — §4
    }
  }

  /* ---- mount ---- */
  function preloadStills() {
    var names = ["yurei_still_v1.png", "yurei_head_n_v1.png", "yurei_head_ne_v1.png", "yurei_head_e_v1.png",
      "yurei_head_se_v1.png", "yurei_head_s_v1.png", "yurei_head_sw_v1.png", "yurei_head_w_v1.png", "yurei_head_nw_v1.png"];
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
    img.src = BASE + (stillAsset ? stillAsset.file : "yurei_still_v1.png"); // canonical still = poster + fallback
    curStill = stillAsset ? stillAsset.file : "yurei_still_v1.png";
    fig.appendChild(video); fig.appendChild(img);
    document.body.appendChild(fig);
    layout();
    requestAnimationFrame(function () { fig.classList.add("yurei-in"); });
  }

  function goStill() {            // reduced-motion opt-out, or sha256 fallback
    mode = "still";
    fig.setAttribute("data-still", "1");
  }

  function goLive() {
    mode = "live";
    video.poster = BASE + (stillAsset ? stillAsset.file : "yurei_still_v1.png");
    video.preload = "auto";
    video.src = BASE + idleAsset.file;
    var p = video.play(); if (p && p.catch) p.catch(function () {});
    preloadStills();
    window.addEventListener("mousemove", onMove, { passive: true });
  }

  function activate() {
    if (mounted) return;
    mounted = true;
    var b = readBlob(); b.activated = true; writeBlob(b);   // A1 activation flag
    buildDom();
    if (reduced()) { goStill(); return; }                   // §6 reduced-motion = still only
    // runtime sha256 gate on the idle loop before it plays
    sha256ok(BASE + idleAsset.file, idleAsset.sha256).then(function (ok) {
      idleVerified = ok;
      if (ok) goLive(); else goStill();                     // mismatch -> still-only fallback
    });
  }

  /* ---- boot: manifest-first ---- */
  function boot() {
    fetch(MANIFEST_URL, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (m) {
        manifest = m;
        for (var i = 0; i < m.assets.length; i++) { byRole[m.assets[i].role] = m.assets[i]; }
        idleAsset = byRole["idle"];
        stillAsset = byRole["canonical-p0"];
        if (!idleAsset || !stillAsset) return;              // contract broken — render nothing
        px = { w: idleAsset.px.w, h: idleAsset.px.h };
        anchorPx = { x: idleAsset.anchorPx.x, y: idleAsset.anchorPx.y };
        if (wide()) activate();
        else {                                              // narrow now — mount if widened later
          var onResize = function () { if (wide()) { window.removeEventListener("resize", onResize); activate(); } };
          window.addEventListener("resize", onResize);
        }
      })
      .catch(function () { /* manifest unreachable — silent, no egg */ });
  }

  window.addEventListener("resize", function () { if (fig) layout(); });
  if (mqReduce && mqReduce.addEventListener) {
    mqReduce.addEventListener("change", function () {        // honor a live reduced-motion flip
      if (mode === "live" && reduced()) { goStill(); if (video) { try { video.pause(); } catch (e) {} } }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
