/* omega-assistant.js — Ω2 Mr. Grey proxy desk (Alpha-Omega Successor Protocol).
   ============================================================================
   The SURFACE for the `mrgrey` persona. Mounts the BYTE-IDENTICAL Yurei engine
   (yurei-oracle.js, window.YureiOracle) on the Successor-Protocol proxy corpus
   (omega-corpus-mrgrey.json) as ONE Matcher instance — the Omega loader
   convention (docs/omega-persona-convention.md). Phase-4 positions ride the provenance-stamped class (K255); the
   crisis floor rides inside the corpus and fires first, exactly as on Yurei.

   CONSERVATION: this is a SEPARATE file. It does not import, edit, or perturb
   yurei-assistant.js, yurei-oracle.js, or the Yurei corpora. It reuses the
   engine that yurei-assistant may already have loaded; if absent it loads the
   same same-origin file. Per-instance matcher state + persona-keyed side stores
   (wuld:mrgrey.*) are the isolation — zero commingling with Yurei's stores.

   AVATAR: "Mr. Grey" is a SKIN on the same manifest/resolver tech as Yurei
   (avatar_manifest_v2). Ships against a clearly-labelled PLACEHOLDER silhouette
   until the game-side black-cat set lands; the resolver is data-driven, so the
   real clips bind with no code change here.

   CSP: same-origin only — corpus + engine at /components/*, avatar at
   /assets/omega/avatar/*. No external origins, no open-domain QA. */
(function () {
  "use strict";

  var COMP = "/components/";
  var ASSET = "/assets/omega/";
  var MANIFEST_URL = ASSET + "avatar/mr-grey_manifest_v3.json";
  var MANIFEST_BASE = MANIFEST_URL.slice(0, MANIFEST_URL.lastIndexOf("/") + 1);
  var CORPUS_URL = COMP + "omega-corpus-mrgrey.json";
  var VER = "K255";

  // ---- persona-keyed stores (never commingled with Yurei's wuld:yurei*) ----
  var KILL_KEY = "wuld:mrgrey";                        // { off:true } — proxy opt-out
  var DISMISS_KEY = "wuld:mrgrey.assistant.dismissed"; // session dismissal
  var SEEN_KEY = "wuld:mrgrey.assistant.seen";         // session first-run pulse
  function readBlob() { try { return JSON.parse(localStorage.getItem(KILL_KEY) || "{}") || {}; } catch (e) { return {}; } }
  function sessGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  var mqReduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reduced() { return !!(mqReduce && mqReduce.matches); }

  if (readBlob().off === true) return;                 // opted out entirely

  // ---- small utils ----
  function el(tag, cls, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    return e;
  }
  function fetchJSON(url) { return fetch(url, { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }); }

  // ---- state ----
  var matcher = null, corpus = [], manifest = null, assetByRole = {};
  var mounted = false, open = false, killed = false, booting = false;
  var bootThens = [];
  var launcher, panel, transcript, input, avatarWrap, avatarVideo, avatarImg;

  // =====================================================================
  // load the (shared) engine, then the persona corpus + placeholder manifest
  // =====================================================================
  function ensureMatcher(cb) {
    if (window.YureiOracle) return cb();
    if (document.getElementById("yurei-oracle-js")) {   // another mount is loading it — poll briefly
      var tries = 0, t = window.setInterval(function () {
        if (window.YureiOracle || tries++ > 60) { window.clearInterval(t); cb(); }
      }, 50);
      return;
    }
    var s = el("script", null, { src: COMP + "yurei-oracle.js?v=" + VER });
    s.id = "yurei-oracle-js";
    s.onload = cb;
    s.onerror = function () { /* engine missing -> proxy cannot answer; abort quietly */ };
    document.head.appendChild(s);
  }
  function flushBootThens() { var q = bootThens.splice(0); for (var i = 0; i < q.length; i++) try { q[i](); } catch (e) {} }

  function boot(then) {
    if (killed) return;
    if (then) bootThens.push(then);
    if (mounted) { flushBootThens(); return; }
    if (booting) return;
    booting = true;
    ensureMatcher(function () {
      if (!window.YureiOracle) { booting = false; return; }
      Promise.all([ fetchJSON(CORPUS_URL + "?v=" + VER), fetchJSON(MANIFEST_URL + "?v=" + VER) ]).then(function (res) {
        var c = res[0];
        if (!c || !c.yurei_corpus) { booting = false; return; }   // no persona corpus -> abort
        corpus = c.yurei_corpus.entries || [];
        matcher = new window.YureiOracle.Matcher(corpus, { unsealed: false });  // ONE instance, persona lane
        manifest = res[1]; assetByRole = {};
        if (manifest && manifest.assets) manifest.assets.forEach(function (a) { assetByRole[a.role] = a; });
        buildUI();
        mounted = true; booting = false;
        flushBootThens();
      }).catch(function () { booting = false; });
    });
  }

  // =====================================================================
  // sprite resolution — animation_hint -> manifest role, data-driven fallback.
  // (Identical resolver contract to the Yurei avatar; a richer clip set binds
  // with no code change. The placeholder is a single "still", so every hint
  // resolves to it and motion never runs until real clips land.)
  // =====================================================================
  function resolveAsset(hint) {
    var fb = (manifest && manifest.animation_fallback) || {};
    var seen = {}, role = hint;
    while (role && !seen[role]) {
      if (assetByRole[role]) return assetByRole[role];
      seen[role] = 1;
      role = fb[role] || (role === "idle" ? "canonical-p0" : "idle");
    }
    return assetByRole["idle"] || assetByRole["canonical-p0"] || (manifest && manifest.assets && manifest.assets[0]) || null;
  }
  function setFlavor(hint) {
    if (!avatarWrap) return;
    avatarWrap.classList.remove("oasst-speaking", "oasst-glitch");
    if (hint === "speak" || hint === "deflect") avatarWrap.classList.add("oasst-speaking");
    else if (hint === "glitch") avatarWrap.classList.add("oasst-glitch");
  }
  function showSprite(hint, opts) {
    opts = opts || {};
    var a = resolveAsset(hint);
    setFlavor(hint);
    if (!a) return;
    var url = MANIFEST_BASE + a.file;
    if (reduced() || a.kind === "still") {                 // still frame — no motion
      if (avatarVideo) { try { avatarVideo.pause(); } catch (e) {} avatarVideo.style.display = "none"; }
      avatarImg.src = (a.kind === "still") ? url : (MANIFEST_BASE + (assetByRole["canonical-p0"] ? assetByRole["canonical-p0"].file : a.file));
      avatarImg.style.display = "";
      return;
    }
    // motion (binds once real clips exist)
    avatarImg.style.display = "none";
    avatarVideo.style.display = "";
    var looping = (a.loop === true) || (a.kind === "loop");
    avatarVideo.loop = looping;
    if (avatarVideo.getAttribute("data-file") !== a.file) { avatarVideo.setAttribute("data-file", a.file); avatarVideo.src = url; }
    var p = avatarVideo.play();
    if (p && p.catch) p.catch(function () { avatarVideo.style.display = "none"; avatarImg.src = MANIFEST_BASE + (assetByRole["canonical-p0"] ? assetByRole["canonical-p0"].file : a.file); avatarImg.style.display = ""; });
    if (!looping) avatarVideo.onended = function () { showSprite(opts.then || "idle"); };
    else avatarVideo.onended = null;
  }

  // =====================================================================
  // UI
  // =====================================================================
  function buildUI() {
    injectCSS();
    launcher = el("button", "oasst-launcher", {
      "type": "button", "aria-label": "Wake Mr. Grey, the Successor-Protocol proxy", "aria-expanded": "false", "title": "Mr. Grey — the proxy"
    });
    var still = assetByRole["canonical-p0"] || assetByRole["idle"];
    if (still) launcher.style.backgroundImage = "url(" + MANIFEST_BASE + still.file + ")";
    launcher.addEventListener("click", toggle);

    panel = el("div", "oasst-panel", { "role": "dialog", "aria-label": "Mr. Grey — the Successor-Protocol proxy", "aria-modal": "false", "hidden": "" });

    var head = el("div", "oasst-head");
    avatarWrap = el("div", "oasst-avatar");
    avatarVideo = el("video", "oasst-av-vid", { "muted": "", "playsinline": "", "aria-hidden": "true" });
    avatarVideo.muted = true;
    avatarImg = el("img", "oasst-av-img", { "alt": "", "aria-hidden": "true" });
    avatarImg.style.display = "none";
    avatarWrap.appendChild(avatarVideo); avatarWrap.appendChild(avatarImg);
    var title = el("div", "oasst-title"); title.textContent = "Mr. Grey";
    var sub = el("div", "oasst-sub"); sub.textContent = "the proxy";
    var titleWrap = el("div", "oasst-titlewrap"); titleWrap.appendChild(title); titleWrap.appendChild(sub);
    var closeBtn = el("button", "oasst-close", { "type": "button", "aria-label": "Dismiss the proxy" });
    closeBtn.innerHTML = "&#215;";
    closeBtn.addEventListener("click", dismiss);
    head.appendChild(avatarWrap); head.appendChild(titleWrap); head.appendChild(closeBtn);

    transcript = el("div", "oasst-transcript", { "role": "log", "aria-live": "polite", "aria-atomic": "false" });

    var form = el("form", "oasst-form");
    input = el("input", "oasst-input", {
      "type": "text", "autocomplete": "off", "spellcheck": "false",
      "aria-label": "Ask the proxy", "placeholder": "Ask what it is, or where it points."
    });
    var send = el("button", "oasst-send", { "type": "submit", "aria-label": "Ask" });
    send.textContent = "Ask";
    form.appendChild(input); form.appendChild(send);
    form.addEventListener("submit", function (ev) { ev.preventDefault(); submit(); });

    panel.appendChild(head); panel.appendChild(transcript); panel.appendChild(form);

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    if (sessGet(SEEN_KEY) !== "1") { launcher.classList.add("oasst-pulse"); sessSet(SEEN_KEY, "1"); window.setTimeout(function () { if (launcher) launcher.classList.remove("oasst-pulse"); }, 7200); }

    // Opening lines: a system disclaimer (chrome) + the corpus's OWN authored
    // greeting (never invented here — Cowork authors no register).
    addLine("sys", "A scripted proxy of the writer — his signed positions only, nothing improvised. Not the author.");
    var greet = corpus.filter(function (e) { return e.class === "response" && e.tier === "public"; })[0];
    if (greet) addLine("grey", greet.response, {});   // sprite deferred to first open

    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) { close(); if (launcher) launcher.focus(); } });
    if (mqReduce && mqReduce.addEventListener) mqReduce.addEventListener("change", function () { if (open) showSprite("idle"); });
  }

  function toggle() { open ? close() : openPanel(); }
  function openPanel() {
    if (killed || !panel) return;
    open = true; panel.hidden = false;
    window.requestAnimationFrame(function () { panel.classList.add("oasst-open"); });
    if (launcher) launcher.setAttribute("aria-expanded", "true");
    showSprite("appear", { then: "idle" });
    if (input) input.focus();
  }
  function close() {
    open = false;
    if (panel) panel.classList.remove("oasst-open");
    if (launcher) launcher.setAttribute("aria-expanded", "false");
    showSprite("dismiss", { then: "idle" });
    window.setTimeout(function () { if (!open && panel) panel.hidden = true; }, 260);
  }
  function dismiss() {                                   // session-scoped dismissal (not the kill-switch)
    close(); sessSet(DISMISS_KEY, "1");
    window.setTimeout(function () { if (launcher && launcher.parentNode) launcher.parentNode.removeChild(launcher); }, 280);
  }

  // add a line. who: "you" | "grey" | "sys". opts:{pointing,hint,crisis}
  function addLine(who, text, opts) {
    opts = opts || {};
    if (who === "sys") {
      var s = el("div", "oasst-sys"); s.textContent = text;
      transcript.appendChild(s); transcript.scrollTop = transcript.scrollHeight; return;
    }
    var row = el("div", "oasst-line oasst-" + who + (opts.crisis ? " oasst-crisis" : ""));
    var bubble = el("div", "oasst-bubble");
    bubble.textContent = text;
    if (opts.pointing) renderPointing(bubble, opts.pointing);
    row.appendChild(bubble);
    transcript.appendChild(row);
    transcript.scrollTop = transcript.scrollHeight;
    if (who === "grey" && opts.hint) showSprite(opts.hint, { then: "idle" });
  }
  // same-origin href pointing (the mrgrey oracle entries carry href/nav_label),
  // plus — K255 — the flagship library's own combined surface for position
  // deep-links (#obj- card anchors; the register gate allowlists the exact
  // form and the --live mode fetches it). No other external origin renders.
  var LIB_PREFIX = "https://library.wuld.ink/combined#obj-";
  function normPointing(e) {
    if (!e) return null;
    if (typeof e.href === "string" &&
        ((e.href.charAt(0) === "/" && e.href.slice(0, 2) !== "//") || e.href.indexOf(LIB_PREFIX) === 0))
      return { links: [{ href: e.href, label: e.nav_label || e.href }] };
    return null;
  }
  function renderPointing(bubble, pt) {
    var box = el("div", "oasst-pointing");
    (pt.links || []).forEach(function (l) {
      var a = el("a", "oasst-navlink", { "href": l.href });
      a.textContent = "→ " + l.label;
      box.appendChild(a);
    });
    if (box.childNodes.length) bubble.appendChild(box);
  }

  function submit() {
    var raw = (input.value || "").trim();
    if (!raw || !matcher) return;
    addLine("you", raw, {});
    input.value = "";
    var r = matcher.respond(raw);                        // {id, lane, response, animation_hint, class, ...}
    if (!r || !r.response) { addLine("sys", "— nothing filed —"); return; }
    var pointing = r.id ? normPointing(matcher.by_id[r.id]) : null;
    addLine("grey", r.response, { pointing: pointing, hint: r.animation_hint || "speak", crisis: (r.class === "crisis") });
  }

  // =====================================================================
  // public API (persona-scoped; mirrors window.yurei.assistant, own namespace)
  // =====================================================================
  function teardown() {
    killed = true; open = false;
    [launcher, panel].forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
  }
  function installAPI() {
    if (!window.omega) window.omega = {};
    window.omega.assistant = {
      open: function () { if (mounted) openPanel(); else boot(function () { openPanel(); }); return "mrgrey: open"; },
      close: function () { close(); return "mrgrey: closed"; },
      say: function (t) { if (mounted && matcher) { openPanel(); input.value = String(t || ""); submit(); } else boot(function () { openPanel(); input.value = String(t || ""); submit(); }); return "mrgrey: said"; },
      off: function () { var b = readBlob(); b.off = true; try { localStorage.setItem(KILL_KEY, JSON.stringify(b)); } catch (e) {} teardown(); return "mrgrey: off"; },
      state: function () { return { mounted: mounted, open: open, killed: killed, entries: corpus.length, avatar: (manifest && manifest.status) || null }; }
    };
  }

  function injectCSS() {
    if (document.getElementById("oasst-css")) return;
    var l = el("link", null, { id: "oasst-css", rel: "stylesheet", href: COMP + "omega-assistant.css?v=" + VER });
    document.head.appendChild(l);
  }

  // wire any in-page summon affordance (CSP-safe: a data attribute, not inline JS).
  // A page element with [data-omega-open] opens the proxy on click.
  function wireSummons() {
    var nodes = document.querySelectorAll("[data-omega-open]");
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].__omegaWired) continue;
      nodes[i].__omegaWired = true;
      nodes[i].addEventListener("click", function (ev) {
        ev.preventDefault();
        if (window.omega && window.omega.assistant) window.omega.assistant.open();
      });
    }
  }

  // ---- entry ----
  function start() {
    installAPI();
    wireSummons();
    if (sessGet(DISMISS_KEY) === "1") return;             // dismissed this session: API only, no chrome
    boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  window.__omegaAssistantBoot = start;
})();
