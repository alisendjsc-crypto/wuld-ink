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
  var MANIFEST_URL = ASSET + "avatar/avatar_manifest_v5.json";   // K224d: dedicated assistant avatar set (the haunting keeps manifest_v2.json)
  var MANIFEST_BASE = MANIFEST_URL.slice(0, MANIFEST_URL.lastIndexOf("/") + 1);   // assets resolve alongside the manifest
  var VER = "K243";

  // ---- Gap Log (Build 1.5b): anonymous coverage logging of UNANSWERED turns.
  // Double-gated: the server flag gaplog_visitor_open (default CLOSED) AND local
  // consent. No logging until BOTH are true. Raw input is scrubbed before it
  // ever leaves the browser; the Worker re-scrubs. Matcher stays byte-unchanged.
  var GAPLOG_ENDPOINT = "/api/gaplog";
  var GAPLOG_CONSENT_KEY = "wuld:yurei-gaplog-consent";
  var GAPLOG_FLUSH_MS = 2500;
  // 1.5c — visitor-owned toggle + share-context. All persona-keyed (wuld:yurei-gaplog-*).
  var GAPLOG_ON_KEY = "wuld:yurei-gaplog-on";                // visitor master toggle (default off)
  var GAPLOG_CTX_KEY = "wuld:yurei-gaplog-context";          // share-context opt-in (default off)
  var GAPLOG_CTX_CONSENT_KEY = "wuld:yurei-gaplog-context-consent";
  var GAPLOG_HL_KEY = "wuld:yurei-gaplog-hl";                // chip highlight styling (default on)
  var GAPLOG_CTX_LINES = 40;                                 // share-context cap: last N transcript lines

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
  // gap-log visitor-lane state (inert until the server flag + consent are both on)
  var gaplogOpen = false, gaplogQueue = [], gaplogTimer = null;
  var piiWarnEl = null, consentEl = null, ctxConsentEl = null;
  var gaplogBar = null, gaplogChip = null, gaplogToggle = null, ctxRow = null, ctxToggle = null, hlToggle = null;
  var convo = [];                                            // running transcript {who,text}; scrubbed at send time for share-context

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
        gaplogFetchStatus();                                  // learn the visitor-open flag (won't POST when closed)
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

    // Gap Log (1.5c) chrome — styles injected inline so yurei-assistant.css stays
    // byte-unchanged. Tier-1 consent (base logging) + Tier-2 consent (share-context)
    // + the visitor toggle bar. Nothing here is intrusive until the visitor turns it on.
    injectGaplogCSS();
    consentEl = el("div", "yasst-consent", { "hidden": "", "role": "note" });
    var consentCopy = el("div", "yasst-consent-copy");
    consentCopy.textContent = "This desk keeps a note of the questions it couldn't answer — anonymously, to widen what it knows. No name, no account, no tracking; only the wording of unanswered questions, with anything that looks personal stripped out first, kept by the day. Please don't type anything private.";
    var consentBtn = el("button", "yasst-consent-btn", { "type": "button" });
    consentBtn.textContent = "Understood";
    consentBtn.addEventListener("click", function () { gaplogGrantConsent(); consentEl.hidden = true; refreshGaplogChrome(); if (input) input.focus(); });
    consentEl.appendChild(consentCopy); consentEl.appendChild(consentBtn);

    // Tier-2 — the heavier, ratified notice shown only when the visitor turns SHARE CONTEXT on.
    ctxConsentEl = el("div", "yasst-consent yasst-consent-ctx", { "hidden": "", "role": "note" });
    var ctxCopy = el("div", "yasst-consent-copy");
    ctxCopy.textContent = "Sharing context adds the conversation from this visit — including questions the desk did answer — to a logged gap, so what you were after is easier to make out. Every line is put through the same scrub first (emails, links, @handles, long number strings removed), and no name, account, or device is ever attached. This is more than the default, which keeps only the wording of unanswered questions. Turn it on only if you're comfortable the whole exchange, scrubbed, can be kept by the day. Off unless you enable it; off again whenever you like.";
    var ctxBtn = el("button", "yasst-consent-btn", { "type": "button" });
    ctxBtn.textContent = "Understood";
    ctxBtn.addEventListener("click", function () { gaplogGrantCtxConsent(); ctxConsentEl.hidden = true; refreshGaplogChrome(); if (input) input.focus(); });
    ctxConsentEl.appendChild(ctxCopy); ctxConsentEl.appendChild(ctxBtn);

    // The visitor toggle bar — hidden until the server lane is open (zero footprint by default).
    gaplogBar = el("div", "yasst-gaplogbar");
    var glMain = el("div", "yasst-gl-main");
    gaplogToggle = el("button", "yasst-gl-toggle", { "type": "button", "aria-pressed": "false", "title": "Coverage log — anonymous, off by default" });
    var glLabel = el("span", "yasst-gl-label"); glLabel.textContent = "coverage log";
    gaplogChip = el("span", "yasst-gaplog-chip yasst-gl-off"); gaplogChip.textContent = "off";
    gaplogToggle.appendChild(glLabel); gaplogToggle.appendChild(gaplogChip);
    hlToggle = el("button", "yasst-gl-hl", { "type": "button", "aria-pressed": "true", "title": "Show the log state in colour (styling only)" });
    hlToggle.textContent = "highlight";
    glMain.appendChild(gaplogToggle); glMain.appendChild(hlToggle);
    ctxRow = el("div", "yasst-gl-ctxrow");
    ctxToggle = el("button", "yasst-gl-ctx", { "type": "button", "aria-pressed": "false", "title": "Also keep the scrubbed conversation with a logged gap" });
    ctxToggle.textContent = "share context";
    var ctxHint = el("span", "yasst-gl-ctxhint"); ctxHint.textContent = "adds the scrubbed conversation";
    ctxRow.appendChild(ctxToggle); ctxRow.appendChild(ctxHint);
    ctxRow.style.display = "none";
    gaplogBar.appendChild(glMain); gaplogBar.appendChild(ctxRow);
    gaplogBar.style.display = "none";
    gaplogToggle.addEventListener("click", function () {
      var now = !gaplogOn(); gaplogSetOn(now);
      if (now && !gaplogConsented()) consentEl.hidden = false;   // activation shows the Tier-1 notice
      else consentEl.hidden = true;
      refreshGaplogChrome();
    });
    ctxToggle.addEventListener("click", function () {
      var now = !gaplogCtxOn(); gaplogSetCtxOn(now);
      if (now && !gaplogCtxConsented()) ctxConsentEl.hidden = false;   // activation shows the Tier-2 notice
      else ctxConsentEl.hidden = true;
      refreshGaplogChrome();
    });
    hlToggle.addEventListener("click", function () { gaplogSetHl(!gaplogHl()); refreshGaplogChrome(); });

    piiWarnEl = el("div", "yasst-piiwarn");
    piiWarnEl.textContent = "Unanswered questions are logged anonymously to improve coverage — don't share anything personal.";
    piiWarnEl.style.display = "none";                          // shown only once the visitor turns logging on

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

    panel.appendChild(head); panel.appendChild(consentEl); panel.appendChild(ctxConsentEl); panel.appendChild(transcript); panel.appendChild(voicebar); panel.appendChild(gaplogBar); panel.appendChild(piiWarnEl); panel.appendChild(form); panel.appendChild(statusEl);
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
    refreshGaplogChrome();                                    // reflect toggle/lane state; never auto-opens the notice
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
    convo.push({ who: who, text: text });                   // running transcript for share-context (scrubbed only at send time)
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

  // =====================================================================
  // Gap Log — anonymous coverage logging of UNANSWERED (miss) turns only.
  // FENCE: the matcher (yurei-oracle.js) + corpora are BYTE-UNCHANGED. This
  // reads matcher state and calls respond() exactly ONCE (via submit), so
  // routing behavior cannot shift. gaplogScrub is byte-identical to the Worker.
  // =====================================================================
  function gaplogScrub(s) {
    s = String(s == null ? "" : s);
    s = s.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[email]");
    s = s.replace(/\bhttps?:\/\/\S+/gi, "[url]");
    s = s.replace(/\bwww\.\S+/gi, "[url]");
    s = s.replace(/(^|\s)@[A-Za-z0-9_]{2,}/g, "$1[handle]");
    s = s.replace(/\+?\d[\d\s().\-]{6,}\d/g, "[number]");
    s = s.replace(/\s+/g, " ").trim();
    return s.slice(0, 500);
  }
  function gaplogConsented() { try { return localStorage.getItem(GAPLOG_CONSENT_KEY) === "1"; } catch (e) { return false; } }
  function gaplogGrantConsent() { try { localStorage.setItem(GAPLOG_CONSENT_KEY, "1"); } catch (e) {} }
  // 1.5c store helpers (persona-keyed) + the layered gate. LOGGING is LIVE only when
  // the server lane is open AND the visitor toggled it on AND base consent is granted.
  function glGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function glSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function gaplogOn() { return glGet(GAPLOG_ON_KEY) === "1"; }
  function gaplogSetOn(v) { glSet(GAPLOG_ON_KEY, v ? "1" : "0"); }
  function gaplogCtxOn() { return glGet(GAPLOG_CTX_KEY) === "1"; }
  function gaplogSetCtxOn(v) { glSet(GAPLOG_CTX_KEY, v ? "1" : "0"); }
  function gaplogCtxConsented() { return glGet(GAPLOG_CTX_CONSENT_KEY) === "1"; }
  function gaplogGrantCtxConsent() { glSet(GAPLOG_CTX_CONSENT_KEY, "1"); }
  function gaplogHl() { return glGet(GAPLOG_HL_KEY) !== "0"; }              // default ON
  function gaplogSetHl(v) { glSet(GAPLOG_HL_KEY, v ? "1" : "0"); }
  function gaplogLive() { return gaplogOpen && gaplogOn() && gaplogConsented(); }
  function gaplogCtxLive() { return gaplogLive() && gaplogCtxOn() && gaplogCtxConsented(); }
  // scrubbed recent transcript (both sides), capped — every line through the SAME scrub.
  function gaplogContext() {
    var out = [], lines = convo.slice(-GAPLOG_CTX_LINES);
    for (var i = 0; i < lines.length; i++) { var t = gaplogScrub(lines[i].text); if (t) out.push((lines[i].who === "you" ? "you: " : "desk: ") + t); }
    return out;
  }

  // priorCount over the repeat window, read BEFORE this turn's single respond()
  // call (mirrors the 1.5a classifier without a second respond -> state-neutral).
  function gaplogPreCount(raw) {
    try {
      var M = window.YureiOracle;
      var norm = M.normalize(raw);
      var win = matcher.input_hist.slice(-matcher.repeat_window);
      var pc = 0; for (var i = 0; i < win.length; i++) if (win[i] === norm) pc++;
      return { norm: norm, priorCount: pc };
    } catch (e) { return { norm: null, priorCount: 1 }; }     // fail-safe: treat as repeat -> not logged
  }
  // classify using the ALREADY-obtained response r (no respond() here).
  function gaplogClassify(r, pre) {
    var isMiss = !!(r && r.lane === "deflection" && pre.priorCount === 0);
    var missClass = null;
    if (isMiss && pre.norm != null) {
      try {
        var M = window.YureiOracle, best = 0, resp = matcher.responses || [];
        for (var j = 0; j < resp.length; j++) { var sc = M.entryScore(resp[j], pre.norm)[0]; if (sc > best) best = sc; }
        missClass = best < M.CONST.MISS_THRESHOLD ? "below_threshold" : "all_damped";
      } catch (e) { missClass = "below_threshold"; }
    }
    return { isMiss: isMiss, missClass: missClass };
  }

  function gaplogPost(body, useKeepalive) {
    var opt = { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
    if (useKeepalive) opt.keepalive = true;
    return fetch(GAPLOG_ENDPOINT, opt).then(function (res) {
      return res.json().then(function (j) { return { status: res.status, j: j }; }, function () { return { status: res.status, j: null }; });
    });
  }
  function gapEnqueue(item) { gaplogQueue.push(item); if (!gaplogTimer) gaplogTimer = window.setTimeout(gapFlush, GAPLOG_FLUSH_MS); }
  function gapFlush(useKeepalive) {
    gaplogTimer = null;
    if (!gaplogQueue.length) return;
    if (!gaplogLive()) { gaplogQueue = []; return; }         // any gate (server / visitor toggle / consent) off -> discard
    var batch = gaplogQueue.splice(0, 20);
    gaplogPost({ items: batch }, useKeepalive).then(function (r) {
      if (r.status === 429) { gaplogQueue = batch.concat(gaplogQueue); if (!gaplogTimer) gaplogTimer = window.setTimeout(gapFlush, (r.j && r.j.retry_after_s ? r.j.retry_after_s * 1000 : 5000)); return; }
      if (gaplogQueue.length && !gaplogTimer) gaplogTimer = window.setTimeout(gapFlush, GAPLOG_FLUSH_MS);
    }, function () { /* network error: coverage data is best-effort; drop */ });
  }

  // GET the visitor-open flag; the widget won't POST when the lane is closed.
  function gaplogFetchStatus() {
    fetch(GAPLOG_ENDPOINT, { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { gaplogOpen = !!(j && j.open === true); refreshGaplogChrome(); }, function () {});
  }
  // persistent PII warning shows only while the lane is open; consent hidden when closed.
  function refreshGaplogChrome() {
    var offered = gaplogOpen;                                // server lane open == the feature is offered at all
    if (gaplogBar) gaplogBar.style.display = offered ? "" : "none";        // zero footprint when the lane is closed
    if (!offered) {
      if (consentEl) consentEl.hidden = true;
      if (ctxConsentEl) ctxConsentEl.hidden = true;
      if (piiWarnEl) piiWarnEl.style.display = "none";
      return;
    }
    var on = gaplogOn(), state = !on ? "off" : (gaplogLive() ? "live" : "armed");
    if (gaplogChip) { gaplogChip.className = "yasst-gaplog-chip yasst-gl-" + state; gaplogChip.textContent = state === "live" ? "logging" : state; }
    if (gaplogToggle) gaplogToggle.setAttribute("aria-pressed", on ? "true" : "false");
    if (gaplogBar) gaplogBar.classList.toggle("yasst-gl-hlon", gaplogHl());
    if (hlToggle) hlToggle.setAttribute("aria-pressed", gaplogHl() ? "true" : "false");
    if (piiWarnEl) piiWarnEl.style.display = on ? "" : "none";             // PII warning only once the visitor turns it on
    if (ctxRow) ctxRow.style.display = on ? "" : "none";                   // share-context only relevant when logging is on
    if (ctxToggle) ctxToggle.setAttribute("aria-pressed", gaplogCtxOn() ? "true" : "false");
  }
  // (1.5c) the notice is activation-gated now — shown by the toggle handlers, never auto-opened.

  function submit() {
    var raw = (input.value || "").trim();
    if (!raw || !matcher) return;
    addLine("you", raw, null, null);
    input.value = "";
    bump();
    var pre = gaplogPreCount(raw);                           // repeat-window state BEFORE the single respond()
    var r = matcher.respond(raw);                            // {id, lane, response, animation_hint, ...}
    if (gaplogLive()) {                                      // gap-log: record genuine misses only (server-open AND visitor-on AND consented)
      var gc = gaplogClassify(r, pre);
      if (gc.isMiss) {
        var _item = { lane: "miss", content_scrubbed: gaplogScrub(raw), class: gc.missClass };
        if (gaplogCtxLive()) { var _ctx = gaplogContext(); if (_ctx.length) _item.context_scrubbed = _ctx; }
        gapEnqueue(_item);
      }
    }
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
      if (document.hidden) { gapFlush(true); }                // best-effort flush of a pending miss on tab-hide (keepalive)
      else if (open) { showSprite("return_ack", { then: "idle" }); }
    });
    window.addEventListener("pagehide", function () { gapFlush(true); }, { passive: true });
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
  // Gap Log chrome styles — injected inline so the external stylesheet (and its
  // ?v=) stays byte-unchanged. Scoped to .yasst-*; inherits the panel palette.
  function injectGaplogCSS() {
    if (document.getElementById("yasst-gaplog-css")) return;
    var css = ""
      + ".yasst-consent{margin:.5rem .75rem 0;padding:.6rem .7rem;border:1px solid rgba(196,30,58,.5);background:rgba(0,0,0,.28);font-size:.72rem;line-height:1.5;color:inherit;opacity:.95}"
      + ".yasst-consent[hidden]{display:none}"
      + ".yasst-consent-copy{margin:0 0 .5rem}"
      + ".yasst-consent-btn{font:inherit;font-size:.7rem;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;padding:.3rem .8rem;background:transparent;color:inherit;border:1px solid rgba(196,30,58,.7)}"
      + ".yasst-consent-btn:hover{background:rgba(196,30,58,.9);color:#fff;border-color:rgba(196,30,58,.9)}"
      + ".yasst-piiwarn{margin:.1rem .75rem .35rem;font-size:.64rem;line-height:1.4;letter-spacing:.02em;opacity:.62}"
      + ".yasst-gaplogbar{margin:.35rem .75rem 0;font-size:.66rem;letter-spacing:.03em;opacity:.9}"
      + ".yasst-gl-main{display:flex;gap:.4rem;align-items:center;flex-wrap:wrap}"
      + ".yasst-gl-toggle,.yasst-gl-hl,.yasst-gl-ctx{font:inherit;font-size:.62rem;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;padding:.22rem .55rem;background:transparent;color:inherit;border:1px solid rgba(240,235,229,.28)}"
      + ".yasst-gl-toggle{display:inline-flex;gap:.4rem;align-items:center}"
      + ".yasst-gl-toggle:hover,.yasst-gl-hl:hover,.yasst-gl-ctx:hover{border-color:rgba(240,235,229,.55)}"
      + ".yasst-gl-hl[aria-pressed=false],.yasst-gl-ctx[aria-pressed=false]{opacity:.5}"
      + ".yasst-gaplog-chip{font-size:.58rem;letter-spacing:.08em;padding:0 .35rem;border:1px solid currentColor;opacity:.8}"
      + ".yasst-gl-ctxrow{display:flex;gap:.45rem;align-items:baseline;margin-top:.3rem}"
      + ".yasst-gl-ctxhint{font-size:.58rem;opacity:.48}"
      + ".yasst-consent-ctx{border-color:rgba(196,30,58,.7)}"
      + ".yasst-gl-hlon .yasst-gl-live{color:#57b66a}"
      + ".yasst-gl-hlon .yasst-gl-armed{color:#d8a13a}"
      + ".yasst-gl-hlon .yasst-gl-off{opacity:.5}";
    var st = el("style", null, { id: "yasst-gaplog-css" });
    st.textContent = css;
    document.head.appendChild(st);
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
