/* yurei-assistant.js — the interactive Yūrei (K224)
   ============================================================================
   A quirky desk-assistant in script form. THREE response domains, one avatar:
     1. PERSONA   — the successor-protocol corpus (161 public entries).
     2. ORACLE    — a bounded site-help FAQ authored in her register.
     3. AMBIENT   — site-state reactions (wrong-hour, tab-return, long-idle, breeze).

   COEXISTS with the ambient haunting engine (yurei.js): it reads the same state
   (wuld:yurei kill-switch [read-only], wuld:wrongHour hour, wuld:visited,
   window.WuldAmbient, reduced-motion) and never forks a parallel store. The
   haunting is a ~1/100 election; the assistant is the reliably-available helper.

   Matcher = yurei-oracle.js (proven bit-for-bit against the reference harness).
   Room tier stays SEALED here (unsealed:false); the sealed room is Part 2.

   CSP: same-origin only — corpora at /components/*.json, sprites at /assets/yurei/*.
   No external origins. No network beyond same-origin fetches. No open-domain QA.
   ========================================================================== */
(function () {
  "use strict";

  var COMP = "/components/";
  var ASSET = "/assets/yurei/";
  var MANIFEST_URL = ASSET + "avatar/avatar_manifest_v2.json";   // K224d: dedicated assistant avatar set (the haunting keeps manifest_v2.json)
  var MANIFEST_BASE = MANIFEST_URL.slice(0, MANIFEST_URL.lastIndexOf("/") + 1);   // assets resolve alongside the manifest
  var VER = "K227";

  // ---- guards (kill-switch parity + reduced-motion + session dismiss) ----
  function readYureiBlob() { try { return JSON.parse(localStorage.getItem("wuld:yurei") || "{}") || {}; } catch (e) { return {}; } }
  function sessGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  var DISMISS_KEY = "wuld:yurei.assistant.dismissed";

  var mqReduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reduced() { return !!(mqReduce && mqReduce.matches); }

  if (readYureiBlob().off === true) return;                 // kill-switch: opted out entirely
  if (sessGet(DISMISS_KEY) === "1") { /* dismissed this session — still expose API, no chrome */ }

  // ---- small utils ----
  function el(tag, cls, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    return e;
  }
  function hour() { return (typeof window.__whHour === "number") ? window.__whHour : new Date().getHours(); }
  function isWrongHour() { var h = hour(); return h >= 22 || h < 5; }          // shares the engine's hour source
  function ambientActive() {
    try { if (window.WuldAmbient && window.WuldAmbient.getState) { var s = window.WuldAmbient.getState(); return !!(s && (s.playing || s.currentVideoId) && !s.dismissed); } } catch (e) {}
    return false;
  }

  // ---- state ----
  var matcher = null, corpus = [], ambientPool = [], manifest = null, assetByRole = {};
  var mounted = false, open = false, lastActivity = Date.now(), idleTimer = null, killed = false;
  var launcher, panel, transcript, input, avatarWrap, avatarVideo, avatarImg, statusEl;
  var ambientCursor = 0;

  // =====================================================================
  // load matcher dep, corpora, manifest, then build UI
  // =====================================================================
  function ensureMatcher(cb) {
    if (window.YureiOracle) return cb();
    var s = el("script", null, { src: COMP + "yurei-oracle.js?v=" + VER });
    s.onload = cb;
    s.onerror = function () { /* matcher missing -> assistant cannot answer; abort quietly */ };
    document.head.appendChild(s);
  }
  function ensurePointing() {                                 // K226: declarative pointing (links + lazy thumb); render falls back to legacy href if absent
    if (window.YureiPointing) return;
    var s = el("script", null, { src: COMP + "yurei-pointing.js?v=" + VER });
    s.onerror = function () {};
    document.head.appendChild(s);
  }
  function ensureVoice(cb) {                                  // K227: her synth voice (default OFF; loads lazily; speak degrades silently if it fails)
    if (window.YureiVoice) { if (cb) cb(); return; }
    if (document.getElementById("yurei-voice-js")) { if (cb) window.setTimeout(cb, 300); return; }
    var s = el("script", null, { src: COMP + "yurei-voice.js?v=" + VER });
    s.id = "yurei-voice-js";
    s.onload = function () { if (cb) cb(); };
    s.onerror = function () {};
    document.head.appendChild(s);
  }
  function fetchJSON(url) { return fetch(url, { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }); }

  function boot() {
    if (mounted || killed) return;
    ensurePointing();                                         // K226: pointing module (render degrades to legacy href if it fails to load)
    ensureVoice();                                            // K227: start loading her voice (stays silent until opted in)
    ensureMatcher(function () {
      if (!window.YureiOracle) return;
      Promise.all([
        fetchJSON(COMP + "yurei-corpus-public.json?v=" + VER),
        fetchJSON(COMP + "yurei-corpus-oracle.json?v=" + VER),
        fetchJSON(MANIFEST_URL)
      ]).then(function (res) {
        var pub = res[0], ora = res[1];
        if (!pub) return;                                   // no persona -> abort
        corpus = (pub.yurei_corpus.entries || []).concat(ora ? (ora.yurei_corpus.entries || []) : []);
        ambientPool = corpus.filter(function (e) { return e.class === "ambient"; });
        matcher = new window.YureiOracle.Matcher(corpus, { unsealed: false });  // room SEALED (Part 2)
        manifest = res[2];
        assetByRole = {};
        if (manifest && manifest.assets) manifest.assets.forEach(function (a) { assetByRole[a.role] = a; });
        buildUI();
        mounted = true;
        armAmbient();
      }).catch(function () {});
    });
  }

  // =====================================================================
  // sprite resolution — animation_hint -> manifest role, graceful fallback.
  // Final art (more roles: listen/speak/long_idle...) binds automatically.
  // =====================================================================
  // Resolve an animation_hint to a manifest asset, DATA-DRIVEN off the manifest's
  // own animation_fallback: use the role of the same name if it exists, else walk
  // the fallback chain to an existing role, else idle/canonical-p0. The 3D seat owns
  // the map, so a new art set with new roles binds with no code change (K224d).
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
  var flavorClasses = ["yasst-speaking", "yasst-glitch", "yasst-breeze", "yasst-wrong"];
  function setFlavor(hint) {
    flavorClasses.forEach(function (c) { avatarWrap.classList.remove(c); });
    if (hint === "speak" || hint === "deflect") avatarWrap.classList.add("yasst-speaking");
    else if (hint === "glitch") avatarWrap.classList.add("yasst-glitch");
    else if (hint === "idle_breeze") avatarWrap.classList.add("yasst-breeze");
    else if (hint === "wrong_hour") avatarWrap.classList.add("yasst-wrong");
  }
  function showSprite(hint, opts) {
    opts = opts || {};
    var a = resolveAsset(hint);
    setFlavor(hint);
    if (!a) return;
    var url = MANIFEST_BASE + a.file;
    if (reduced() || a.kind === "still") {                  // still frame — no motion
      if (avatarVideo) { try { avatarVideo.pause(); } catch (e) {} avatarVideo.style.display = "none"; }
      avatarImg.src = (a.kind === "still") ? url : (MANIFEST_BASE + (assetByRole["canonical-p0"] ? assetByRole["canonical-p0"].file : a.file));
      avatarImg.style.display = "";
      return;
    }
    // motion
    avatarImg.style.display = "none";
    avatarVideo.style.display = "";
    var looping = (a.loop === true) || (a.kind === "loop");   // new manifest: kind "clip" + loop bool; old widget: kind "loop"
    avatarVideo.loop = looping;
    if (avatarVideo.getAttribute("data-file") !== a.file) {
      avatarVideo.setAttribute("data-file", a.file);
      avatarVideo.src = url;
    }
    var p = avatarVideo.play();
    if (p && p.catch) p.catch(function () { avatarVideo.style.display = "none"; avatarImg.src = MANIFEST_BASE + (assetByRole["canonical-p0"] ? assetByRole["canonical-p0"].file : a.file); avatarImg.style.display = ""; });
    if (!looping) {                                            // one-shot clip -> return to idle when it ends
      avatarVideo.onended = function () { showSprite(opts.then || "idle"); };
    } else { avatarVideo.onended = null; }
  }

  // seat the chrome ABOVE the fixed ambient-player bar (it can be dismissed / resize)
  function positionChrome() {
    if (!launcher) return;
    var barH = 0, bar = document.getElementById("ambient-player") || document.querySelector(".ambient-player");
    if (bar) { var r = bar.getBoundingClientRect(); var c = getComputedStyle(bar);
      if (r.height > 4 && r.bottom >= window.innerHeight - 8 && c.display !== "none" && c.visibility !== "hidden") barH = r.height; }
    var lb = barH ? (barH + 14) : 18;
    launcher.style.bottom = lb + "px";
    if (panel) panel.style.bottom = (lb + launcher.offsetHeight + 10) + "px";
  }

  // =====================================================================
  // UI
  // =====================================================================
  function buildUI() {
    injectCSS();
    // launcher
    launcher = el("button", "yasst-launcher", {
      "type": "button", "aria-label": "Ask Yūrei, the desk", "aria-expanded": "false", "title": "The desk"
    });
    var still = assetByRole["canonical-p0"];
    if (still) launcher.style.backgroundImage = "url(" + MANIFEST_BASE + still.file + ")";
    launcher.addEventListener("click", toggle);

    // panel
    panel = el("div", "yasst-panel", { "role": "dialog", "aria-label": "Yūrei — the desk", "aria-modal": "false", "hidden": "" });
    var head = el("div", "yasst-head");
    avatarWrap = el("div", "yasst-avatar");
    avatarVideo = el("video", "yasst-av-vid", { "muted": "", "playsinline": "", "aria-hidden": "true" });
    avatarVideo.muted = true;
    avatarImg = el("img", "yasst-av-img", { "alt": "", "aria-hidden": "true" });
    avatarImg.style.display = "none";
    avatarWrap.appendChild(avatarVideo); avatarWrap.appendChild(avatarImg);
    var title = el("div", "yasst-title"); title.textContent = "Yūrei";
    var sub = el("div", "yasst-sub"); sub.textContent = "the desk";
    var titleWrap = el("div", "yasst-titlewrap"); titleWrap.appendChild(title); titleWrap.appendChild(sub);
    var closeBtn = el("button", "yasst-close", { "type": "button", "aria-label": "Dismiss the desk" });
    closeBtn.innerHTML = "&#215;";
    closeBtn.addEventListener("click", dismiss);
    head.appendChild(avatarWrap); head.appendChild(titleWrap); head.appendChild(closeBtn);

    transcript = el("div", "yasst-transcript", { "role": "log", "aria-live": "polite", "aria-atomic": "false" });

    var form = el("form", "yasst-form");
    input = el("input", "yasst-input", {
      "type": "text", "autocomplete": "off", "spellcheck": "false",
      "aria-label": "Say something to the desk", "placeholder": "Speak. The desk files it."
    });
    var send = el("button", "yasst-send", { "type": "submit", "aria-label": "File it" });
    send.textContent = "File";
    form.appendChild(input); form.appendChild(send);
    form.addEventListener("submit", function (ev) { ev.preventDefault(); submit(); });

    statusEl = el("div", "yasst-status"); statusEl.setAttribute("aria-hidden", "true");

    // K227 — voice control: opt-in toggle + style cycle (inner / animalese / whisper), persisted.
    var voicebar = el("div", "yasst-voicebar");
    var vToggle = el("button", "yasst-vtoggle", { "type": "button", "aria-pressed": "false", "title": "Her voice — synth, off by default" });
    var vStyle = el("button", "yasst-vstyle", { "type": "button", "title": "Voice style" });
    function vRead() { return (window.YureiVoice && window.YureiVoice.get) ? window.YureiVoice.get() : { on: false, style: "inner" }; }
    function vPaint() {
      var s = vRead();
      vToggle.setAttribute("aria-pressed", s.on ? "true" : "false");
      vToggle.textContent = s.on ? "voice on" : "voice off";
      voicebar.classList.toggle("yasst-voice-on", !!s.on);
      vStyle.textContent = s.style;
      vStyle.disabled = !s.on;
    }
    vToggle.addEventListener("click", function () {
      if (!window.YureiVoice) return;
      var now = !vRead().on; window.YureiVoice.set({ on: now }); vPaint();
      if (now) { try { window.YureiVoice.speak("mm, filed", { force: true }); } catch (e) {} }   // audition on enable (this click is the gesture)
    });
    vStyle.addEventListener("click", function () {
      if (!window.YureiVoice) return;
      var st = window.YureiVoice.STYLES || ["inner"], cur = vRead().style;
      window.YureiVoice.set({ style: st[(st.indexOf(cur) + 1) % st.length] }); vPaint();
      try { window.YureiVoice.speak("mm hm", { force: true }); } catch (e) {}                     // audition the new style
    });
    voicebar.appendChild(vToggle); voicebar.appendChild(vStyle);

    panel.appendChild(head); panel.appendChild(transcript); panel.appendChild(voicebar); panel.appendChild(form); panel.appendChild(statusEl);
    ensureVoice(vPaint);                                       // refresh the control once the voice module reports its stored prefs

    document.body.appendChild(launcher);
    document.body.appendChild(panel);
    positionChrome();
    window.addEventListener("resize", positionChrome, { passive: true });
    if (sessGet("wuld:yurei.assistant.seen") !== "1") { launcher.classList.add("yasst-pulse"); sessSet("wuld:yurei.assistant.seen", "1"); window.setTimeout(function () { if (launcher) launcher.classList.remove("yasst-pulse"); }, 7200); }

    // greeting line (first open only, in-register; sprite deferred to first open)
    addLine("desk", "The desk is attended. Speak, and it is filed.", null, null);

    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && open) { close(); launcher.focus(); } });
    if (mqReduce && mqReduce.addEventListener) mqReduce.addEventListener("change", function () { if (open) showSprite("idle"); });
  }

  function toggle() { open ? close() : openPanel(); }
  function openPanel() {
    if (killed) return;
    open = true; panel.hidden = false;
    // rAF so the transition runs
    window.requestAnimationFrame(function () { panel.classList.add("yasst-open"); });
    launcher.setAttribute("aria-expanded", "true");
    showSprite(isWrongHour() ? "wrong_hour" : "appear", { then: "idle" });
    if (isWrongHour()) queueAmbient("wrong");
    else if (ambientActive()) avatarWrap.classList.add("yasst-breeze");
    input.focus();
    bump();
  }
  function close() {
    open = false; panel.classList.remove("yasst-open");
    launcher.setAttribute("aria-expanded", "false");
    showSprite("dismiss", { then: "idle" });
    window.setTimeout(function () { if (!open) panel.hidden = true; }, 260);
  }
  function dismiss() {                                       // session-scoped dismissal (not the kill-switch)
    close(); sessSet(DISMISS_KEY, "1");
    window.setTimeout(function () { if (launcher && launcher.parentNode) launcher.parentNode.removeChild(launcher); }, 280);
  }

  // add a line. who: "you"|"desk". pointing: normalized {links,image}|null. hint: animation_hint
  function addLine(who, text, pointing, hint) {
    var row = el("div", "yasst-line yasst-" + who);
    var bubble = el("div", "yasst-bubble");
    bubble.textContent = text;
    if (pointing) renderPointing(bubble, pointing);
    row.appendChild(bubble);
    transcript.appendChild(row);
    transcript.scrollTop = transcript.scrollHeight;
    if (who === "desk" && hint) {
      showSprite(hint, { then: "idle" });
      if ((hint === "speak" || hint === "deflect") && window.YureiVoice && typeof window.YureiVoice.speak === "function") {
        try { window.YureiVoice.speak(text); } catch (e) {}   // K227: synth voice — silent unless opted in (default OFF) + reduced-motion-safe
      }
    }
  }
  // entry -> normalized pointing via the shared module; falls back to a legacy same-origin href only.
  function normPointing(e) {
    if (!e) return null;
    if (window.YureiPointing && window.YureiPointing.normalize) return window.YureiPointing.normalize(e);
    if (typeof e.href === "string" && e.href.charAt(0) === "/" && e.href.slice(0, 2) !== "//")
      return { links: [{ href: e.href, label: e.nav_label || e.href }], image: null };
    return null;
  }
  // draw the "desk points" block: same-origin links + an optional lazy thumbnail.
  // pointing is pre-guarded by YureiPointing.normalize (same-origin + alt required); this only renders.
  function renderPointing(bubble, pt) {
    var box = el("div", "yasst-pointing");
    (pt.links || []).forEach(function (l) {
      var a = el("a", "yasst-navlink", { "href": l.href });
      a.textContent = "→ " + l.label;
      box.appendChild(a);
    });
    if (pt.image) {
      var img = el("img", "yasst-thumb", { "loading": "lazy", "decoding": "async", "alt": pt.image.alt, "src": pt.image.src });
      if (pt.image.full) { var a2 = el("a", "yasst-thumblink", { "href": pt.image.full }); a2.appendChild(img); box.appendChild(a2); }
      else box.appendChild(img);
    }
    if (box.childNodes.length) bubble.appendChild(box);
  }

  function submit() {
    var raw = (input.value || "").trim();
    if (!raw || !matcher) return;
    addLine("you", raw, null, null);
    input.value = "";
    bump();
    var r = matcher.respond(raw);                            // {id, lane, response, animation_hint, ...}
    if (!r || !r.response) { addLine("desk", "Filed. Nothing in the drawers answers to that.", null, "deflect"); return; }
    var pointing = null;
    if (r.id) { var e = matcher.by_id[r.id]; pointing = normPointing(e); }
    addLine("desk", r.response, pointing, r.animation_hint || "speak");
  }

  // =====================================================================
  // ambient behavior — sprite reactions + a bounded corpus line
  // =====================================================================
  function pickAmbient(filter) {
    var pool = ambientPool.filter(filter || function () { return true; });
    if (!pool.length) pool = ambientPool;
    if (!pool.length) return null;
    var e = pool[ambientCursor % pool.length]; ambientCursor++;
    return e;
  }
  function queueAmbient(kind) {
    var e;
    if (kind === "wrong") e = pickAmbient(function (x) { return x.context_trigger && x.context_trigger.hour === "wrong" || (x.register_tags || []).indexOf("hour") >= 0; });
    else if (kind === "idle") e = pickAmbient(function (x) { return /^a-f/.test(x.id); });
    else e = pickAmbient(null);
    if (e) window.setTimeout(function () { if (open) addLine("desk", e.response, null, e.animation_hint || "idle"); }, 650);
  }

  function bump() { lastActivity = Date.now(); }
  function armAmbient() {
    // long-idle while open
    idleTimer = window.setInterval(function () {
      if (open && (Date.now() - lastActivity) > 240000) {   // 4 min
        showSprite("long_idle", { then: "idle" });
        queueAmbient("idle");
        bump();                                              // one fragment per idle window
      }
    }, 30000);
    ["click", "keydown", "pointerdown"].forEach(function (ev) { document.addEventListener(ev, bump, { passive: true }); });
    // tab blur/return
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && open) { showSprite("return_ack", { then: "idle" }); }
    });
    // breeze mood follows the bed; keep chrome seated above the ambient bar
    window.setInterval(function () {
      positionChrome();
      if (open) { if (ambientActive()) avatarWrap.classList.add("yasst-breeze"); else avatarWrap.classList.remove("yasst-breeze"); }
    }, 6000);
  }

  // =====================================================================
  // kill-switch parity — wrap window.yurei.off (defined by yurei.js when present)
  // and expose window.yurei.assistant. Works with or without the haunting engine.
  // =====================================================================
  function teardown() {
    killed = true; open = false;
    if (idleTimer) window.clearInterval(idleTimer);
    [launcher, panel].forEach(function (n) { if (n && n.parentNode) n.parentNode.removeChild(n); });
  }
  function installAPI() {
    if (!window.yurei) window.yurei = {};
    if (typeof window.yurei.off === "function") {
      var prevOff = window.yurei.off;
      window.yurei.off = function () { teardown(); return prevOff.apply(this, arguments); };
    } else {
      window.yurei.off = function () { var b = readYureiBlob(); b.off = true; try { localStorage.setItem("wuld:yurei", JSON.stringify(b)); } catch (e) {} teardown(); return "yurei: off"; };
    }
    window.yurei.assistant = {
      open: function () { if (!mounted) boot(); openPanel(); return "assistant: open"; },
      close: function () { close(); return "assistant: closed"; },
      say: function (t) { if (mounted && matcher) { openPanel(); input.value = String(t || ""); submit(); } return "assistant: said"; },
      off: function () { teardown(); return "assistant: off (session)"; },
      state: function () { return { mounted: mounted, open: open, killed: killed, entries: corpus.length }; }
    };
  }

  // =====================================================================
  // CSS (external stylesheet, same-origin — CSP-clean)
  // =====================================================================
  function injectCSS() {
    if (document.getElementById("yasst-css")) return;
    var l = el("link", null, { id: "yasst-css", rel: "stylesheet", href: COMP + "yurei-assistant.css?v=" + VER });
    document.head.appendChild(l);
  }

  // ---- entry ----
  function start() {
    installAPI();
    if (sessGet(DISMISS_KEY) === "1") return;                // dismissed this session: API only, no chrome
    boot();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  // expose boot for the nav bootstrap / manual init
  window.__yureiAssistantBoot = start;
})();
