/* yurei-pointing.js — Yūrei/Omega declarative "pointing" (links + lazy image).
   ------------------------------------------------------------------------
   Parity-neutral BY CONSTRUCTION: the matcher (yurei-oracle.js) never reads this.
   The assistant reads an entry's optional `pointing` (or the legacy {href,nav_label})
   at RENDER time and normalizes it here — so routing is untouched and the parity
   gate stays green with no vector regeneration.

   The same-origin + alt gate is the RUNTIME boundary: cross-origin / schemed /
   protocol-relative targets and altless images are DROPPED, never rendered. This
   is defense-in-depth beneath the authoring-time gate (tools/yurei/pointing-check.cjs).

   Field shape (any entry, any persona):
     pointing: {
       links: [ { href:"/same-origin", label:"in-fiction label" }, ... ],   // <= MAX_LINKS, same-origin
       image: { src:"/thumb", alt:"required", full?:"/full" }               // same-origin, alt REQUIRED
     }
   Register note (not enforced here — authored): she points IN FICTION (the archive,
   the shelves), never recites URLs; the label is the pointer, the href is plumbing.

   (UMD: module.exports + globalThis.YureiPointing.) */
(function (root) {
  "use strict";

  var MAX_LINKS = 3;
  var MAX_LABEL = 48;
  var MAX_ALT = 120;

  // Same-origin path: a root-relative "/..." (NOT protocol-relative "//") or a pure
  // "#fragment". Anything carrying a scheme (http:, https:, data:, javascript:,
  // mailto:, tel:, …) or "//" is cross-origin/unsafe -> rejected.
  function isSameOriginPath(u) {
    if (typeof u !== "string") return false;
    u = u.trim();
    if (!u) return false;
    if (u.charAt(0) === "#") return true;              // in-page fragment
    if (u.slice(0, 2) === "//") return false;          // protocol-relative -> cross-origin
    if (u.charAt(0) !== "/") return false;             // must be root-relative
    if (/^\/[^/]*:/.test(u)) return false;             // no scheme sneaking after the leading "/"
    for (var ci = 0; ci < u.length; ci++) if (u.charCodeAt(ci) <= 0x20) return false; // no ctrl chars / raw whitespace
    return true;
  }

  function clip(s, n) { s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n) : s; }

  function normLink(l) {
    if (!l || typeof l !== "object") return null;
    if (!isSameOriginPath(l.href)) return null;
    var label = clip(l.label || l.nav_label || l.href, MAX_LABEL).trim();
    if (!label) label = l.href.trim();
    return { href: l.href.trim(), label: label };
  }

  function normImage(img) {
    if (!img || typeof img !== "object") return null;
    var thumb = img.thumb || img.src;                  // prefer a lightweight thumbnail source
    if (!isSameOriginPath(thumb)) return null;
    var alt = clip(img.alt, MAX_ALT).trim();
    if (!alt) return null;                              // alt REQUIRED — never render an altless image
    var t = thumb.trim();
    var full = isSameOriginPath(img.src) ? img.src.trim() : null;
    return { src: t, alt: alt, full: (full && full !== t) ? full : null };
  }

  // entry -> { links:[{href,label}], image:{src,alt,full}|null } | null
  function normalize(entry) {
    if (!entry || typeof entry !== "object") return null;
    var links = [], image = null;
    var p = entry.pointing;
    if (p && typeof p === "object") {
      var arr = Array.isArray(p.links) ? p.links : (p.href ? [{ href: p.href, label: p.label }] : []);
      for (var i = 0; i < arr.length && links.length < MAX_LINKS; i++) {
        var nl = normLink(arr[i]); if (nl) links.push(nl);
      }
      image = normImage(p.image);
    }
    // legacy single-link back-compat (the shipped oracle nav entries: {href,nav_label})
    if (!links.length && !image && isSameOriginPath(entry.href)) {
      links.push({ href: entry.href.trim(), label: clip(entry.nav_label || entry.href, MAX_LABEL).trim() || entry.href.trim() });
    }
    if (!links.length && !image) return null;
    return { links: links, image: image };
  }

  var API = {
    isSameOriginPath: isSameOriginPath,
    normalize: normalize,
    CONST: { MAX_LINKS: MAX_LINKS, MAX_LABEL: MAX_LABEL, MAX_ALT: MAX_ALT }
  };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.YureiPointing = API;
})(typeof self !== "undefined" ? self : (typeof globalThis !== "undefined" ? globalThis : this));
