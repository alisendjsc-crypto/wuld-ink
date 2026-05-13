/* ============================================================
   wuld.ink — site nav controller
   Sets aria-current="page" on the link matching the current URL path.
   Match logic:
     - Exact pathname match → current
     - Pathname startsWith link href (e.g., /essays/sanguinolentum-vestigium/
       matches /essays/) → current for the section
   The "/" home link only matches on exact "/" (so it doesn't catch every page).
   ============================================================ */

(() => {
  "use strict";

  function normalize(path) {
    // Strip trailing slash for non-root paths so /essays and /essays/ compare equal.
    if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
    return path;
  }

  function matchScore(linkHref, currentPath) {
    // Returns 0 = no match, 1 = section match, 2 = exact match.
    const link = normalize(new URL(linkHref, window.location.origin).pathname);
    const here = normalize(currentPath);

    if (link === here) return 2;
    if (link === "" || link === "/") {
      // Home only matches exact root.
      return here === "" || here === "/" ? 2 : 0;
    }
    // Section match: here starts with link + "/" (so /essays doesn't match /essayspolicy)
    if (here.startsWith(link + "/")) return 1;
    return 0;
  }

  function init() {
    const nav = document.querySelector(".site-nav");
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll("a[href]"));
    if (links.length === 0) return;

    const here = window.location.pathname;

    // Find the best match (prefer exact over section).
    let best = null;
    let bestScore = 0;
    links.forEach((a) => {
      const score = matchScore(a.getAttribute("href"), here);
      if (score > bestScore) {
        bestScore = score;
        best = a;
      }
    });

    links.forEach((a) => a.removeAttribute("aria-current"));
    if (best) best.setAttribute("aria-current", "page");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
