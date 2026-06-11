/* yurei-summon.js — archive easter egg (K117c).
   Scrolling to the very bottom of /archive/ elects the yurei mascot for THIS
   browser (sticky), so she follows the reader across the heavy-read pages.
   External + same-origin (CSP-safe); writes only the RESERVED wuld:yurei blob.
   No figure mounts here — the archive is the rite, not a display surface. */
(function () {
  "use strict";
  if (location.pathname.indexOf("/archive") === -1) return;     // archive only
  var KEY = "wuld:yurei";
  var fired = false;
  function elect() {
    try {
      var b = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
      if (b.elected === true && b.summoned === true) return;     // already followed
      b.elected = true; b.summoned = true; b.off = false;        // sticky; survives the 1/100 gate
      localStorage.setItem(KEY, JSON.stringify(b));
    } catch (e) {}
  }
  function check() {
    if (fired) return;
    var atBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 4);
    if (atBottom) { fired = true; elect(); window.removeEventListener("scroll", onScroll); }
  }
  function onScroll() { window.requestAnimationFrame(check); }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("load", check);                        // short page / restored scroll already at bottom
})();
