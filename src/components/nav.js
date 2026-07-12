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

  function sectionOf(href) {
    return normalize(new URL(href, window.location.origin).pathname);
  }

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // K43 — glow nav items whose section changed since the visitor last
  // saw it. Single source of truth: /releases.json (each release lists
  // the nav sections it touched). First-ever visit is treated as
  // caught-up so nothing mass-glows; visiting a section clears its flag.
  function navGlow(links, here) {
    var SEEN_KEY = "wuld:seen";
    fetch("/releases.json", { cache: "no-cache" })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (releases) {
        if (!Array.isArray(releases) || releases.length === 0) return;
        var sorted = releases.slice().sort(function (a, b) {
          return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
        });
        var sectionLatest = {};
        sorted.forEach(function (rel) {
          (rel.sections || []).forEach(function (sec) {
            var s = normalize(sec);
            if (!(s in sectionLatest)) sectionLatest[s] = rel.id;
          });
        });

        var raw = lsGet(SEEN_KEY);
        if (raw === null) {
          // First-ever visit: record current state, glow nothing.
          lsSet(SEEN_KEY, JSON.stringify(sectionLatest));
          return;
        }
        var seen;
        try { seen = JSON.parse(raw) || {}; } catch (e) { seen = {}; }

        var hereNorm = normalize(here);
        var dirty = false;
        links.forEach(function (a) {
          var sec = sectionOf(a.getAttribute("href"));
          var latest = sectionLatest[sec];
          if (!latest) { a.classList.remove("nav-updated"); a.removeAttribute("title"); return; }
          var onSection = sec === hereNorm || hereNorm.indexOf(sec + "/") === 0;
          if (onSection) {
            if (seen[sec] !== latest) { seen[sec] = latest; dirty = true; }
            a.classList.remove("nav-updated");
            a.removeAttribute("title");
          } else if (seen[sec] !== latest) {
            a.classList.add("nav-updated");
            a.setAttribute("title", "Updated since your last visit");
          } else {
            a.classList.remove("nav-updated");
            a.removeAttribute("title");
          }
        });
        if (dirty) lsSet(SEEN_KEY, JSON.stringify(seen));
      })
      .catch(function () {});
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

    navGlow(links, here);
  }

  // K224 — bootstrap the interactive Yūrei desk-assistant on every surface that
  // carries the nav. It coexists with the ambient haunting engine (yurei.js) and
  // self-gates on kill-switch (wuld:yurei.off), reduced-motion, and session
  // dismissal. Loaded here so a single component wires it site-wide; the /components
  // 300s TTL propagates this within ~5 min without a per-page ?v bump.
  function bootYureiAssistant() {
    if (document.getElementById("yurei-assistant-js")) return;
    var s = document.createElement("script");
    s.id = "yurei-assistant-js";
    s.src = "/components/yurei-assistant.js?v=K224";
    s.defer = true;
    document.head.appendChild(s);
  }

  function boot() { init(); bootYureiAssistant(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
