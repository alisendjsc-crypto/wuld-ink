/* successor-stage.js — Build B: the Successor Stage. K232.
   ===========================================================================
   A Messenger-style enlargement of whichever desk companion currently holds
   the seat (persona-switcher's wuld:persona-active; default Mr. Grey). Corner
   bubbles stay the default everywhere; the stage is an OPT-IN larger view,
   opened from the Hub and closed back to the bubble.

   Two hard fences (proven by tools/omega/successor-stage-e2e.cjs):
     • ZERO new matcher / corpus bytes. The stage builds its OWN
       YureiOracle.Matcher over the SAME corpus files the corner widget loads
       (reused verbatim) and routes every input through .respond() — the full
       pipeline, so the crisis floor fires FIRST, exactly as at the desk. It
       never calls a persona's say()/off() to fake or bypass an answer.
     • It coordinates the corner surface through the persona's PUBLIC api
       (open/close/state) only — closing the bubble on open, honouring a
       killed/opted-out persona — and touches no matcher, corpus, or store
       that isn't its own (wuld:successor:*).

   Page-scoped: it does nothing unless [data-successor-stage] is on the page
   (the /successor/ Hub mount). Progressive: JS off -> the mount stays empty.
   No server, no accounts — the transcript lives in localStorage only. */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;

  var COMP = "/components/";
  var STAGE_KEY = "wuld:successor:stage";          // { open:bool } — last stage view state (informational)
  var TX_PREFIX = "wuld:successor:transcript:";     // + persona -> { v:1, lines:[{who,text,crisis}], updated }
  var ACTIVE_KEY = "wuld:persona-active";           // switcher's key — READ ONLY here
  var DEFAULT_PERSONA = "mrgrey";
  var ORACLE_SRC = COMP + "yurei-oracle.js";        // the SAME engine the widgets inject; not new matcher bytes

  // Per-persona binding: the corpus files (same the corner widget loads), the
  // avatar manifest, a display label, and a handle to the persona's PUBLIC api.
  var PERSONAS = {
    yurei: {
      label: "Yūrei",
      corpus: [ COMP + "yurei-corpus-public.json", COMP + "yurei-corpus-oracle.json" ],
      manifest: "/assets/yurei/avatar/avatar_manifest_v2.json",
      api: function () { return (window.yurei && window.yurei.assistant) || null; }
    },
    mrgrey: {
      label: "Mr. Grey",
      corpus: [ COMP + "omega-corpus-mrgrey.json" ],
      manifest: "/assets/omega/avatar/mrgrey_manifest_v1.json",
      api: function () { return (window.omega && window.omega.assistant) || null; }
    }
  };

  var mqReduce = (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)")) || null;
  function reduced() { return !!(mqReduce && mqReduce.matches); }

  // ---- localStorage: our own keys only -----------------------------------
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function stageBlob() { try { return JSON.parse(lsGet(STAGE_KEY) || "{}") || {}; } catch (e) { return {}; } }
  function setStageOpen(b) { var o = stageBlob(); o.open = !!b; lsSet(STAGE_KEY, JSON.stringify(o)); }
  function activePersona() { var v = lsGet(ACTIVE_KEY); return (v === "yurei" || v === "mrgrey") ? v : DEFAULT_PERSONA; }
  function txKey(p) { return TX_PREFIX + p; }
  function loadTx(p) { try { var o = JSON.parse(lsGet(txKey(p)) || "null"); if (o && o.v === 1 && Array.isArray(o.lines)) return o; } catch (e) {} return { v: 1, lines: [], updated: 0 }; }
  function saveTx(p, tx) { tx.updated = Date.now(); lsSet(txKey(p), JSON.stringify(tx)); }

  function fetchJSON(url) { return fetch(url, { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  // ---- module state ------------------------------------------------------
  var mountBtn = null;
  var overlay = null, panel = null, avatarWrap = null, avatarImg = null, avatarVideo = null,
      transcriptEl = null, inputEl = null, labelEl = null;
  var built = false, viewOpen = false;
  var current = null;                 // persona currently staged
  var cache = {};                     // persona -> { matcher, assetByRole, manifest, base }
  var listenTimer = null, idleTimer = null;

  // ---- the engine: our own Matcher over the reused corpus ----------------
  var oracleLoading = false, oracleThens = [];
  function ensureOracle(cb) {
    if (window.YureiOracle) { cb(); return; }
    oracleThens.push(cb);
    if (oracleLoading) return;
    oracleLoading = true;
    var s = document.createElement("script");
    s.src = ORACLE_SRC;                                    // reuse the existing engine file verbatim
    s.onload = function () { oracleLoading = false; var t = oracleThens.slice(); oracleThens.length = 0; t.forEach(function (f) { try { f(); } catch (e) {} }); };
    s.onerror = function () { oracleLoading = false; oracleThens.length = 0; };
    (document.head || document.body).appendChild(s);
  }
  function buildCache(persona, entries, manifest) {
    var cfg = PERSONAS[persona];
    var abr = {}; if (manifest && manifest.assets) manifest.assets.forEach(function (a) { abr[a.role] = a; });
    var base = cfg.manifest.slice(0, cfg.manifest.lastIndexOf("/") + 1);
    cache[persona] = {
      matcher: new window.YureiOracle.Matcher(entries, { unsealed: false }),   // full pipeline; crisis floor rides inside
      assetByRole: abr, manifest: manifest, base: base
    };
  }
  function ensurePersona(persona, then) {
    if (cache[persona]) { then(); return; }
    ensureOracle(function () {
      if (!window.YureiOracle) { then(); return; }
      var cfg = PERSONAS[persona];
      var jobs = cfg.corpus.map(fetchJSON).concat([ fetchJSON(cfg.manifest) ]);
      Promise.all(jobs).then(function (res) {
        var manifest = res[res.length - 1], entries = [];
        for (var i = 0; i < res.length - 1; i++) { var c = res[i]; if (c && c.yurei_corpus && c.yurei_corpus.entries) entries = entries.concat(c.yurei_corpus.entries); }
        if (!entries.length) { then(); return; }           // no corpus -> abort this persona (no invention)
        buildCache(persona, entries, manifest);
        then();
      }).catch(function () { then(); });
    });
  }
  function available(p) {
    var a = PERSONAS[p].api(); if (!a) return false;        // widget absent (killed at boot / opted out) -> respect it
    if (a.state) { try { if (a.state().killed) return false; } catch (e) {} }
    return true;
  }

  // ---- avatar (the widget's resolver, ported; no new asset bytes) --------
  function resolveAsset(persona, hint) {
    var c = cache[persona]; if (!c) return null;
    var fb = (c.manifest && c.manifest.animation_fallback) || {};
    var seen = {}, role = hint;
    while (role && !seen[role]) {
      if (c.assetByRole[role]) return c.assetByRole[role];
      seen[role] = 1;
      role = fb[role] || (role === "idle" ? "canonical-p0" : "idle");
    }
    return c.assetByRole["idle"] || c.assetByRole["canonical-p0"] || (c.manifest && c.manifest.assets && c.manifest.assets[0]) || null;
  }
  function stillFor(persona) {
    var c = cache[persona]; if (!c) return null;
    return c.assetByRole["canonical-p0"] || c.assetByRole["idle"] || null;
  }
  function showSprite(hint, opts) {
    opts = opts || {};
    if (!current || !avatarImg) return;
    var c = cache[current]; if (!c) return;
    var a = resolveAsset(current, hint); if (!a) return;
    var base = c.base;
    try {
      if (reduced() || a.kind === "still") {                 // still frame — no motion
        if (avatarVideo) { try { avatarVideo.pause(); } catch (e) {} avatarVideo.style.display = "none"; }
        var still = (a.kind === "still") ? a : stillFor(current);
        avatarImg.src = base + ((still && still.file) || a.file);
        avatarImg.style.display = "";
        return;
      }
      avatarImg.style.display = "none";
      if (!avatarVideo) return;
      avatarVideo.style.display = "";
      var looping = (a.loop === true) || (a.kind === "loop");
      avatarVideo.loop = looping;
      if (avatarVideo.getAttribute("data-file") !== a.file) { avatarVideo.setAttribute("data-file", a.file); avatarVideo.src = base + a.file; }
      var p; try { p = avatarVideo.play(); } catch (e) { p = null; }
      if (p && p.catch) p.catch(function () { try { avatarVideo.style.display = "none"; } catch (e) {} var s = stillFor(current); if (s) { avatarImg.src = base + s.file; avatarImg.style.display = ""; } });
      if (!looping) avatarVideo.onended = function () { showSprite(opts.then || "idle"); };
      else avatarVideo.onended = null;
    } catch (e) {}
  }
  function toIdle() { clearTimeout(idleTimer); idleTimer = setTimeout(function () { showSprite("idle"); }, 60); }
  function toListen() { clearTimeout(listenTimer); showSprite("listen"); listenTimer = setTimeout(function () { showSprite("idle"); }, 1400); }

  // ---- transcript rendering / persistence --------------------------------
  function labelFor(who, p) { if (who === "you") return "You"; if (who === "sys") return "System"; return (PERSONAS[p || current] && PERSONAS[p || current].label) || "Them"; }
  function renderLine(who, text, crisis) {
    if (!transcriptEl) return;
    var row = el("div", "sstage-line sstage-" + who + (crisis ? " sstage-crisis" : ""));
    row.appendChild(el("span", "sstage-who", labelFor(who)));
    var bub = el("div", "sstage-bubble"); bub.textContent = text; row.appendChild(bub);
    transcriptEl.appendChild(row);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
  }
  function pushLine(who, text, crisis) {
    renderLine(who, text, crisis);
    var tx = loadTx(current); tx.lines.push({ who: who, text: text, crisis: !!crisis }); saveTx(current, tx);
  }
  function seedIntro(p) {
    renderLine("sys", "The stage is set. You’re speaking with " + PERSONAS[p].label + ". Nothing you type here leaves your browser.", false);
  }
  function seedTranscript(p) {
    if (!transcriptEl) return;
    transcriptEl.innerHTML = "";
    seedIntro(p);
    loadTx(p).lines.forEach(function (l) { renderLine(l.who, l.text, l.crisis); });
  }
  function txText(p) {
    var out = []; loadTx(p).lines.forEach(function (l) { out.push(labelFor(l.who, p) + ": " + l.text); });
    return out.join("\n\n");
  }
  function downloadTx() {
    if (!current) return;
    var txt = txText(current); if (!txt.trim()) return;
    try {
      var blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
      var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "successor-" + current + ".txt";
      document.body.appendChild(a); a.click();
      setTimeout(function () { try { URL.revokeObjectURL(a.href); } catch (e) {} if (a.parentNode) a.parentNode.removeChild(a); }, 120);
    } catch (e) {}
  }
  function clearTx() {
    if (!current) return;
    lsSet(txKey(current), JSON.stringify({ v: 1, lines: [], updated: Date.now() }));
    if (transcriptEl) transcriptEl.innerHTML = "";
    seedIntro(current);
  }

  // ---- the ask path: full pipeline, crisis-first -------------------------
  function submit() {
    if (!inputEl) return;
    var raw = (inputEl.value || "").trim(); if (!raw) return;
    inputEl.value = "";
    pushLine("you", raw, false);
    var m = cache[current] && cache[current].matcher;
    if (!m) { renderLine("sys", "— the desk is loading —", false); return; }
    var r = m.respond(raw);                                  // crisis floor fires inside match(); never bypassed
    if (!r || !r.response) { renderLine("sys", "— nothing filed —", false); return; }
    var crisis = (r.class === "crisis");
    pushLine("them", r.response, crisis);
    showSprite(r.animation_hint || "speak", { then: "idle" });
  }

  // ---- overlay ------------------------------------------------------------
  function onKey(ev) { if (!viewOpen) return; if (ev && (ev.key === "Escape" || ev.keyCode === 27)) closeStage(); }
  function buildOverlay() {
    if (built) return;
    overlay = el("div", "sstage-overlay");
    overlay.setAttribute("role", "dialog"); overlay.setAttribute("aria-modal", "true"); overlay.setAttribute("aria-label", "Successor stage");
    overlay.hidden = true;
    if (reduced()) overlay.classList.add("sstage-reduced");

    panel = el("div", "sstage-panel");

    var head = el("div", "sstage-head");
    avatarWrap = el("div", "sstage-avatar");
    avatarImg = el("img", "sstage-av-img"); avatarImg.setAttribute("alt", ""); avatarImg.setAttribute("decoding", "async");
    avatarVideo = el("video", "sstage-av-video");
    avatarVideo.muted = true; avatarVideo.setAttribute("muted", "muted"); avatarVideo.setAttribute("playsinline", "playsinline"); avatarVideo.setAttribute("preload", "auto");
    avatarVideo.style.display = "none";
    avatarWrap.appendChild(avatarImg); avatarWrap.appendChild(avatarVideo);
    labelEl = el("div", "sstage-title");
    var x = el("button", "sstage-x", "×"); x.setAttribute("type", "button"); x.setAttribute("aria-label", "Close the stage");
    x.addEventListener("click", function () { closeStage(); });
    head.appendChild(avatarWrap); head.appendChild(labelEl); head.appendChild(x);

    transcriptEl = el("div", "sstage-transcript");
    transcriptEl.setAttribute("role", "log"); transcriptEl.setAttribute("aria-live", "polite"); transcriptEl.setAttribute("aria-label", "Conversation");

    var form = el("form", "sstage-form");
    inputEl = el("input", "sstage-input");
    inputEl.setAttribute("type", "text"); inputEl.setAttribute("autocomplete", "off"); inputEl.setAttribute("spellcheck", "false");
    inputEl.setAttribute("placeholder", "Say something…"); inputEl.setAttribute("aria-label", "Message");
    inputEl.setAttribute("data-wh", "none");                 // mute the wrong-hour focus cue (matches the notes editor)
    var send = el("button", "sstage-send", "Send"); send.setAttribute("type", "submit");
    inputEl.addEventListener("input", function () { toListen(); });
    form.addEventListener("submit", function (ev) { if (ev && ev.preventDefault) ev.preventDefault(); submit(); });
    form.appendChild(inputEl); form.appendChild(send);

    var foot = el("div", "sstage-foot");
    var dl = el("button", "sstage-btn", "[ download ]"); dl.setAttribute("type", "button"); dl.addEventListener("click", downloadTx);
    var clr = el("button", "sstage-btn", "[ clear ]"); clr.setAttribute("type", "button"); clr.addEventListener("click", clearTx);
    foot.appendChild(dl); foot.appendChild(clr); foot.appendChild(el("span", "sstage-note", "Saved in this browser only."));

    panel.appendChild(head); panel.appendChild(transcriptEl); panel.appendChild(form); panel.appendChild(foot);
    overlay.appendChild(panel);
    overlay.addEventListener("click", function (ev) { if (ev && ev.target === overlay) closeStage(); });
    document.addEventListener("keydown", onKey);
    document.body.appendChild(overlay);
    built = true;
  }
  function showOverlay() {
    if (!overlay) return;
    overlay.hidden = false; overlay.classList.add("sstage-visible");
    viewOpen = true; setStageOpen(true);
  }
  function closeStage() {
    if (overlay) { overlay.hidden = true; overlay.classList.remove("sstage-visible"); }
    viewOpen = false; setStageOpen(false);
    toIdle();
  }
  function openStage() {
    buildOverlay();
    var persona = activePersona();
    if (!available(persona)) {                               // active persona opted out -> fall back to the other
      var other = persona === "mrgrey" ? "yurei" : "mrgrey";
      if (available(other)) persona = other; else { renderRestingHint(); return; }
    }
    var swap = (persona !== current);
    current = persona;
    ensurePersona(persona, function () {
      if (!cache[persona]) { renderRestingHint(); return; }
      if (labelEl) labelEl.textContent = PERSONAS[persona].label;
      if (swap || !viewOpen) seedTranscript(persona);
      var api = PERSONAS[persona].api();                     // one surface at a time — close the corner bubble
      if (api && api.close) { try { api.close(); } catch (e) {} }
      showOverlay();
      showSprite("idle");
      if (inputEl && inputEl.focus) { try { inputEl.focus(); } catch (e) {} }
    });
  }
  function renderRestingHint() {
    buildOverlay(); current = current || activePersona();
    if (transcriptEl) { transcriptEl.innerHTML = ""; renderLine("sys", "— the desk is resting —", false); }
    if (labelEl) labelEl.textContent = "The desk";
    showOverlay();
  }

  // ---- Hub mount + boot ---------------------------------------------------
  function renderMount() {
    var host = document.querySelector("[data-successor-stage]");
    if (!host) return false;                                 // page-scope: only where the Hub mount exists
    if (mountBtn) return true;
    host.hidden = false;
    mountBtn = el("button", "sstage-open-btn", "Open the stage");
    mountBtn.setAttribute("type", "button"); mountBtn.setAttribute("aria-haspopup", "dialog");
    mountBtn.addEventListener("click", function () { openStage(); });
    host.appendChild(mountBtn);
    host.appendChild(el("p", "sstage-open-cap", "A larger, Messenger-style view of whichever companion has the desk. Your side of the conversation is saved in this browser and nowhere else."));
    return true;
  }
  function boot() { renderMount(); }        // no auto-open: the stage is a click-to-open surface (default off)
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // ---- public surface (+ e2e hooks) --------------------------------------
  window.wuldSuccessorStage = {
    open: function () { openStage(); return "stage: open"; },
    close: function () { closeStage(); return "stage: closed"; },
    isOpen: function () { return viewOpen; },
    persona: function () { return current; },
    built: function () { return built; },
    // test hooks (no network): seed a persona cache from provided data, then drive
    _seed: function (persona, entries, manifest) { buildCache(persona, entries, manifest); },
    _mount: function () { return renderMount(); },
    _open: function () { openStage(); },
    _ask: function (t) { if (inputEl) inputEl.value = String(t == null ? "" : t); submit(); },
    _lines: function () { return transcriptEl ? transcriptEl.children.length : 0; },
    _tx: function (p) { return loadTx(p || current); },
    _txText: function (p) { return txText(p || current); }
  };
})();
