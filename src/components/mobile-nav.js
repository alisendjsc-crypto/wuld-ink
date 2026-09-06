/* ============================================================
   mobile-nav.js (K281) — builds the mobile navigation sheet.

   TOTAL DESKTOP NO-OP. The whole script is gated on
   (pointer: coarse): on a desktop it registers nothing, mutates
   no DOM, and adds no listeners.

   PROGRESSIVE. Without JS the legacy .site-nav disclosure is
   untouched and remains the navigation, exactly as today; the
   html.mnav-on class that retires it is only ever set from here.

   The sheet is built FROM the page's own nav: a route appears
   only if this page's .site-nav already links to it, so the sheet
   can never advertise a room the page itself does not carry.
   /successor/ and /console/ are absent from GROUPS by ruling
   (K281) — mobile is the utilitarian surface; the curtained
   tease stays on desktop.

   Labels and tags are the site's own words, lifted from the
   homepage .destination cards and each room's meta description.
   Nothing here is newly invented copy.
   ============================================================ */
(function () {
  "use strict";

  if (!window.matchMedia || !window.matchMedia("(pointer: coarse)").matches) return;

  var GROUPS = [
    ["Read", [
      ["/essays/",           "Long-form",    "Essays",           "Pessimism · Nihilism · Personal"],
      ["/book/",             "Long-work",    "Book",             "Malgré Tout · A Guide to Nothingness"],
      ["/blog/",             "Journal",      "Blog",             "Posts"],
      ["/archive/",          "Holdings",     "Archive",          "Defiant archiving · videos · prior works"],
      ["/recommendations/",  "Pointers",     "Recommendations",  "Film · books · sites · art — not exhaustive, not for sale"]
    ]],
    ["Reference", [
      ["/argument-library/", "Catalogue",    "Argument Library", "EFIList v4.0.0 — library.wuld.ink"],
      ["/glossary/",         "Vocabulary",   "Glossary",         "Alogical Isness · Contextus Claudit · &c."],
      ["/search/",           "Find",         "Search",           "Every surface — client-side; queries never leave your browser"]
    ]],
    ["See & hear", [
      ["/gallery/",          "Plates",       "Gallery",          "Void Engine output · plates I–XXVII"],
      ["/watch/",            "Video mirror", "Watch",            "YouTube · WULD Incorporated"],
      ["/music/",            "Audio mirror", "Music",            "W-HOLE · Bandcamp"],
      ["/void-engine/",      "Triptych",     "Void Engine",      "Lexicon · signal · transmission"]
    ]],
    ["Say", [
      ["/notes/",            "Scratch",      "Notes",            "A quiet place to write — private to this browser"],
      ["/chat/",             "IRC",          "Chat",             "Open channel on libera.chat — no account"],
      ["/contact/",          "Direct",       "Contact",          "Form or alias — replies arrive when they arrive"]
    ]],
    ["The umbrella", [
      ["/preface/",          "Entry point",  "About",            "What the umbrella holds, and who it is for"],
      ["/donations/",        "Upkeep",       "Support",          "PayPal · CashApp · Venmo — nothing is paywalled"]
    ]]
  ];

  var nav = document.querySelector(".site-nav");
  if (!nav) return;

  var have = {};
  var anchors = nav.querySelectorAll("a[href]");
  for (var i = 0; i < anchors.length; i++) {
    have[anchors[i].getAttribute("href")] = true;
  }

  var here = location.pathname.replace(/\/+$/, "/") || "/";
  var lastFocus = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var sheet = el("div", "mnav-sheet");
  sheet.id = "mnav-sheet";
  sheet.hidden = true;
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-modal", "true");
  sheet.setAttribute("aria-label", "Site navigation");

  var bar = el("div", "mnav-bar");
  bar.appendChild(el("span", "mnav-wordmark", "wuld.ink · index"));
  var close = el("button", "mnav-close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "Close navigation");
  bar.appendChild(close);
  sheet.appendChild(bar);

  var rows = 0;
  for (var g = 0; g < GROUPS.length; g++) {
    var name = GROUPS[g][0], items = GROUPS[g][1];
    var present = [];
    for (var j = 0; j < items.length; j++) {
      if (have[items[j][0]]) present.push(items[j]);
    }
    if (!present.length) continue;

    var group = el("section", "mnav-group");
    group.appendChild(el("p", "mnav-group-label", name));
    for (var k = 0; k < present.length; k++) {
      var it = present[k];
      var a = el("a", "mnav-item");
      a.href = it[0];
      if (it[1] && it[1].toLowerCase() !== it[2].toLowerCase()) a.appendChild(el("span", "mnav-label", it[1]));
      a.appendChild(el("span", "mnav-title", it[2]));
      a.appendChild(el("span", "mnav-tag", it[3]));
      if (it[0] === here) a.setAttribute("aria-current", "page");
      group.appendChild(a);
      rows++;
    }
    sheet.appendChild(group);
  }
  if (!rows) return;

  var trigger = el("button", "mnav-trigger", "Index");
  trigger.type = "button";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "mnav-sheet");

  function open() {
    lastFocus = document.activeElement;
    sheet.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("mnav-locked");
    var first = sheet.querySelector(".mnav-item");
    if (first) first.focus();
  }

  function shut() {
    sheet.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("mnav-locked");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  trigger.addEventListener("click", function () {
    if (sheet.hidden) { open(); } else { shut(); }
  });
  close.addEventListener("click", shut);
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && !sheet.hidden) shut();
  });

  document.body.appendChild(sheet);

  // K282: mount into the header bar, not floating over the page.
  var host = document.querySelector(".site-header-inner") || document.querySelector(".site-header");
  if (host) {
    var home = el("a", "mnav-home", "wuld.ink");
    home.href = "/";
    host.appendChild(home);
    host.appendChild(trigger);
  } else {
    document.body.appendChild(trigger);
  }
  document.documentElement.classList.add("mnav-on");
})();
