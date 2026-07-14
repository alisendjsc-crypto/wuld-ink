/* persona-switcher.js — Ω2.1 (K231).
   ===========================================================================
   A thin orchestrator ABOVE Yūrei (window.yurei.assistant) and Mr. Grey
   (window.omega.assistant). It seats both widgets in one anchored seat, renders
   a 2-way toggle, and marks the inactive persona `.persona-dormant` on its
   PUBLIC ROOT elements so it greys/recedes behind the active one.

   CONSERVATION: it never imports, edits, or perturbs yurei-assistant.js /
   omega-assistant.js / yurei-oracle.js / either corpus. It drives the two
   widgets ONLY through their public open()/close()/state() plus a CSS overlay
   toggled by class on their root elements — never their rendered internals,
   never their input, never the matcher. Crisis fires inside each widget exactly
   as today; the switcher is not in that path.

   ISOLATION: its own last-active choice lives under its own persona-agnostic key
   (wuld:persona-active), never commingled with wuld:yurei* / wuld:mrgrey*.

   DEGRADES SAFE: it engages ONLY where BOTH personas have mounted. One persona
   present (or one dismissed mid-session) -> inert: no toggle chrome, the
   surviving persona behaves exactly as it does without this file. */
(function () {
  "use strict";

  var ACTIVE_KEY = "wuld:persona-active";     // own store — "mrgrey" | "yurei"
  var DEFAULT = "mrgrey";                      // Mr. Grey's page; last-used wins after the first visit

  var PERSONAS = {
    yurei:  { api: function () { return window.yurei && window.yurei.assistant; },
              launcher: ".yasst-launcher", panel: ".yasst-panel", label: "Yūrei" },
    mrgrey: { api: function () { return window.omega && window.omega.assistant; },
              launcher: ".oasst-launcher", panel: ".oasst-panel", label: "Mr. Grey" }
  };
  var ORDER = ["yurei", "mrgrey"];             // toggle segment order (radiogroup)

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function launcherOf(p) { return document.querySelector(PERSONAS[p].launcher); }
  function rootsOf(p) {
    var s = PERSONAS[p], out = [];
    var l = document.querySelector(s.launcher); if (l) out.push(l);
    var pa = document.querySelector(s.panel);   if (pa) out.push(pa);
    return out;
  }
  function present(p) { return !!launcherOf(p); }
  function apiOf(p) { try { return PERSONAS[p].api() || null; } catch (e) { return null; } }
  function isOpen(p) { var a = apiOf(p); try { return !!(a && a.state && a.state().open); } catch (e) { return false; } }

  var mounted = false, active = null, toggleEl = null, segs = {};

  function readActive() {
    var v = lsGet(ACTIVE_KEY);
    return (v === "mrgrey" || v === "yurei") ? v : DEFAULT;
  }

  // p becomes active; the other persona recedes (dormant). openActive => open p's panel.
  function setActive(p, openActive) {
    if (!PERSONAS[p]) return;
    active = p;
    ORDER.forEach(function (other) {
      var isActive = (other === p);
      rootsOf(other).forEach(function (el) {
        if (isActive) el.classList.remove("persona-dormant");
        else el.classList.add("persona-dormant");
      });
      if (!isActive && isOpen(other)) {                 // tuck an OPEN inactive panel behind
        var a = apiOf(other);
        if (a && typeof a.close === "function") { try { a.close(); } catch (e) {} }
      }
      if (segs[other]) {
        segs[other].setAttribute("aria-checked", isActive ? "true" : "false");
        segs[other].tabIndex = isActive ? 0 : -1;       // roving tabindex
      }
    });
    lsSet(ACTIVE_KEY, p);
    if (openActive) {
      var act = apiOf(p);
      if (act && typeof act.open === "function") { try { act.open(); } catch (e) {} }
    }
  }

  function onSegKey(ev) {
    var k = ev.key;
    if (k === "ArrowRight" || k === "ArrowDown" || k === "ArrowLeft" || k === "ArrowUp") {
      ev.preventDefault();
      var idx = ORDER.indexOf(active);
      var next = (k === "ArrowRight" || k === "ArrowDown")
        ? ORDER[(idx + 1) % ORDER.length]
        : ORDER[(idx - 1 + ORDER.length) % ORDER.length];
      setActive(next, true);
      if (segs[next]) segs[next].focus();
    } else if (k === " " || k === "Enter") {
      ev.preventDefault();
      var seg = ev.currentTarget, p = seg && seg.getAttribute("data-persona");
      if (p) { if (active !== p) setActive(p, true); else { var a = apiOf(p); if (a && a.open) { try { a.open(); } catch (e) {} } } }
    }
  }

  function buildToggle() {
    if (toggleEl) return;
    toggleEl = document.createElement("div");
    toggleEl.className = "persona-switch";
    toggleEl.setAttribute("role", "radiogroup");
    toggleEl.setAttribute("aria-label", "Choose which assistant is active");
    ORDER.forEach(function (p) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "persona-switch-seg";
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", "false");
      b.setAttribute("data-persona", p);
      b.tabIndex = -1;
      b.textContent = PERSONAS[p].label;
      b.addEventListener("click", function () {
        if (active !== p) setActive(p, true);
        else { var a = apiOf(p); if (a && a.open) { try { a.open(); } catch (e) {} } }
      });
      b.addEventListener("keydown", onSegKey);
      toggleEl.appendChild(b);
      segs[p] = b;
    });
    document.body.appendChild(toggleEl);
  }

  // keep the toggle honest when the ACTIVE launcher is clicked directly (a dormant
  // launcher is pointer-events:none, so this only ever fires for the active one).
  function wireLaunchers() {
    ORDER.forEach(function (p) {
      var l = launcherOf(p);
      if (l && !l.__pswitchWired) {
        l.__pswitchWired = true;
        l.addEventListener("click", function () { if (active !== p) setActive(p, false); }, true);
      }
    });
  }

  function engage() {
    if (mounted) return;
    mounted = true;
    document.body.classList.add("persona-switch-on");
    buildToggle();
    wireLaunchers();
    setActive(readActive(), false);            // seat both, recede the inactive; DO NOT auto-open on load
  }

  function disengage() {                        // dropped to a single persona (dismiss etc.) -> inert
    document.body.classList.remove("persona-switch-on");
    if (toggleEl && toggleEl.parentNode) toggleEl.parentNode.removeChild(toggleEl);
    toggleEl = null; segs = {};
    ORDER.forEach(function (p) {                 // never strand the survivor as dormant
      rootsOf(p).forEach(function (el) { el.classList.remove("persona-dormant"); });
    });
    mounted = false;
  }

  function reconcile() {
    var both = present("yurei") && present("mrgrey");
    if (both && !mounted) engage();
    else if (!both && mounted) disengage();
    else if (both && mounted) wireLaunchers();  // re-wire if a root re-rendered
  }

  function boot() {
    reconcile();
    // both widgets mount async (corpus fetch) -> watch body's direct children until
    // both roots appear, then keep the observer live so a mid-session dismissal
    // degrades to inert. A bounded interval covers any observer-miss on first mount.
    try {
      var mo = new MutationObserver(reconcile);
      mo.observe(document.body, { childList: true });
    } catch (e) {}
    var tries = 0, iv = window.setInterval(function () {
      reconcile();
      if (++tries > 40) window.clearInterval(iv);        // ~10s ceiling
    }, 250);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // tiny read-only surface (own namespace) for the headless e2e / console.
  window.wuldPersona = {
    active: function () { return active; },
    engaged: function () { return mounted; },
    set: function (p) { if (mounted && PERSONAS[p]) setActive(p, true); return active; },
    _reconcile: reconcile
  };
})();
