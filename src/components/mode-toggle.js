/* ============================================================
   wuld.ink — mode toggle controller
   Each .mode-toggle controls the nearest [data-readable] container
   (or <html> if it has the [data-toggle-scope="global"] flag).
   Persists per-scope choice in localStorage keyed by scope id.
   ============================================================ */

(() => {
  "use strict";

  const STORAGE_PREFIX = "wuld:mode:";
  const VALID_MODES = new Set(["dark", "reader", "hc"]);

  function getScope(toggle) {
    // If the toggle itself flags global scope, target <html>.
    if (toggle.dataset.toggleScope === "global") {
      return document.documentElement;
    }
    // Otherwise, nearest ancestor with [data-readable].
    return toggle.closest("[data-readable]") || document.documentElement;
  }

  function scopeKey(scope) {
    if (scope === document.documentElement) return "global";
    return scope.id || "readable:" + (scope.dataset.readable || "unnamed");
  }

  function applyMode(scope, mode) {
    if (!VALID_MODES.has(mode)) mode = "dark";
    if (mode === "dark") {
      // Dark is the default (no override). Remove the attr.
      scope.removeAttribute("data-mode");
    } else {
      scope.setAttribute("data-mode", mode);
    }

    // ---------- Cross-surface protocol mirror ----------
    // Per library-Claude coordination Exchange 2 (2026-05-12):
    // mirror the library's body-class protocol when the scope is the
    // root document. State doesn't sync across the subdomain boundary
    // (localStorage is per-origin), but the protocol-name semantics
    // harmonize: reader ↔ .legible, hc ↔ .high-contrast.
    // The native [data-mode] attribute remains the primary mechanism
    // on the wuld.ink side; body classes are a SECONDARY output for
    // protocol-level alignment with library.wuld.ink's mode system.
    if (scope === document.documentElement && document.body) {
      document.body.classList.toggle("legible", mode === "reader");
      document.body.classList.toggle("high-contrast", mode === "hc");
    }
  }

  function syncButtons(toggle, activeMode) {
    toggle.querySelectorAll(".mode-toggle-btn").forEach((btn) => {
      const isActive = btn.dataset.modeTarget === activeMode;
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function init() {
    const toggles = document.querySelectorAll(".mode-toggle");
    toggles.forEach((toggle) => {
      const scope = getScope(toggle);
      const key = STORAGE_PREFIX + scopeKey(scope);

      // Restore persisted choice if any
      let saved = null;
      try {
        saved = localStorage.getItem(key);
      } catch (_) { /* no storage = no problem */ }

      const initial = (saved && VALID_MODES.has(saved)) ? saved : "dark";
      applyMode(scope, initial);
      syncButtons(toggle, initial);

      toggle.querySelectorAll(".mode-toggle-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.dataset.modeTarget;
          if (!VALID_MODES.has(target)) return;
          applyMode(scope, target);
          syncButtons(toggle, target);
          try {
            localStorage.setItem(key, target);
          } catch (_) { /* ignore — storage may be disabled */ }
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
