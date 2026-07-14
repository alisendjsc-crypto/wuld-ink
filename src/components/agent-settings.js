/* agent-settings.js — public FX / voice settings card (K231).
   ===========================================================================
   A visitor-facing controls card for /successor/ (the Successor Hub). It renders
   ONE control per entry in /site-fx.json — the SAME registry the sealed
   /_/fx-bench/ renders — and wires each to the LIVE public component API by its
   `target`, so a change is heard/seen immediately. Adding a knob to site-fx.json
   surfaces it here with no code change.

   FENCE: this is the FX / VOICE bench only (WuldWrongHour + YureiVoice). It holds
   NO operator / moderation / gallery-CMS surface — those live on admin.wuld.ink
   and stay operator-gated.

   ISOLATION: the card's OWN state (open/closed) persists under its own namespace
   (wuld:agentfx:*). It NEVER writes the component stores (wuld:wrongHour /
   wuld:yurei.voice) or wuld:persona-active directly — the values ride the
   components' own public set(), which persist themselves.

   PROGRESSIVE: JS-off leaves the static mount empty (nothing thrown). Missing
   registry -> nothing rendered. A control whose API is absent no-ops (never
   throws). Reduced-motion strips the card's transitions. */
(function () {
  "use strict";

  var OWN_PREFIX = "wuld:agentfx:";           // own store namespace — never the component keys
  var OPEN_KEY   = OWN_PREFIX + "open";
  var CFG_URL    = "/site-fx.json";
  var MOUNT_SEL  = "#agent-fx-panel";
  var VOICE_SRC  = "/components/yurei-voice.js?v=K227";

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function WH() { return window.WuldWrongHour; }
  function VOICE() { return window.YureiVoice; }
  function reducedMotion() {
    try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch (e) { return false; }
  }

  // lazy-load the voice module on first demand (same pattern as the bench/assistant)
  function ensureVoice(cb) {
    if (window.YureiVoice) { if (cb) cb(); return; }
    if (document.getElementById("agentfx-yv")) { if (cb) window.setTimeout(cb, 300); return; }
    var s = document.createElement("script"); s.id = "agentfx-yv"; s.src = VOICE_SRC;
    s.onload = function () { if (cb) cb(); }; s.onerror = function () {};
    document.head.appendChild(s);
  }

  // registry `target` -> live public API (mirrors /_/fx-bench/). Every branch is
  // guarded: an absent API no-ops rather than throwing.
  function apply(ctrl, value) {
    var t = ctrl && ctrl.target; if (!t) return;
    try {
      if (t === "wronghour.sfx" && WH()) WH().set({ sfx: +value });
      else if (t === "wronghour.vfx" && WH()) WH().set({ vfx: +value });
      else if (t === "wronghour.bedOn" && WH()) WH().bed(!!value);
      else if (t === "wronghour.mood" && WH()) WH().mood(value);
      else if (t === "wronghour.play" && WH()) WH().play(ctrl.cue);
      else if (t === "voice.speak") ensureVoice(function () { if (VOICE()) VOICE().speak(String(value || ""), { force: true }); });
      else if (t.indexOf("voice.") === 0) {
        var f = t.slice(6);
        ensureVoice(function () { if (VOICE()) { var vo = {}; vo[f] = (f === "on") ? !!value : (f === "style") ? value : +value; VOICE().set(vo); } });
      }
    } catch (e) {}
  }

  function liveValue(ctrl) {
    try {
      var wg = (WH() && WH().get) ? WH().get() : null, vg = (VOICE() && VOICE().get) ? VOICE().get() : null;
      switch (ctrl.target) {
        case "wronghour.sfx":  return wg ? wg.sfx : ctrl.default;
        case "wronghour.vfx":  return wg ? wg.vfx : ctrl.default;
        case "wronghour.bedOn": return wg ? wg.bedOn : ctrl.default;
        case "wronghour.mood": return wg ? wg.bedMood : ctrl.default;
        default:
          if (vg && ctrl.target && ctrl.target.indexOf("voice.") === 0) { var vf = ctrl.target.slice(6); return (vf in vg) ? vg[vf] : ctrl.default; }
          return ctrl.default;
      }
    } catch (e) { return ctrl.default; }
  }

  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  function renderControl(ctrl) {
    var row = el("div", "agent-fx-ctl");
    var lab = el("label", "agent-fx-clabel"); lab.textContent = ctrl.label; row.appendChild(lab);
    var v0 = liveValue(ctrl);
    if (ctrl.type === "range") {
      var wrap = el("div", "agent-fx-rangewrap");
      var inp = el("input"); inp.type = "range"; inp.min = ctrl.min; inp.max = ctrl.max; inp.step = ctrl.step;
      inp.value = (v0 == null ? ctrl.default : v0); inp.setAttribute("aria-label", ctrl.label);
      var out = el("span", "agent-fx-val"); out.textContent = inp.value;
      inp.addEventListener("input", function () { out.textContent = inp.value; apply(ctrl, inp.value); });
      wrap.appendChild(inp); wrap.appendChild(out); row.appendChild(wrap);
    } else if (ctrl.type === "toggle") {
      var b = el("button", "agent-fx-tgl"); b.type = "button";
      var st = !!v0;
      var paint = function (x) { b.setAttribute("aria-pressed", x ? "true" : "false"); b.textContent = x ? "on" : "off"; b.classList.toggle("on", !!x); };
      paint(st);
      b.addEventListener("click", function () { st = !st; paint(st); apply(ctrl, st); });
      row.appendChild(b);
    } else if (ctrl.type === "select") {
      var sel = el("select", "agent-fx-select"); sel.setAttribute("aria-label", ctrl.label);
      (ctrl.options || []).forEach(function (o) { var op = el("option"); op.value = o; op.textContent = o; if (o === v0) op.selected = true; sel.appendChild(op); });
      sel.addEventListener("change", function () { apply(ctrl, sel.value); });
      row.appendChild(sel);
    } else if (ctrl.type === "cue") {
      lab.textContent = "";
      var cb = el("button", "agent-fx-cue"); cb.type = "button"; cb.textContent = "▶ " + ctrl.label; cb.setAttribute("aria-label", "Play " + ctrl.label);
      cb.addEventListener("click", function () { apply(ctrl, ctrl.cue); });
      row.appendChild(cb);
    } else if (ctrl.type === "speak") {
      var ti = el("input", "agent-fx-say"); ti.type = "text"; ti.value = ctrl.default || ""; ti.setAttribute("aria-label", ctrl.label);
      var sb = el("button", "agent-fx-cue"); sb.type = "button"; sb.textContent = "▶ say";
      sb.addEventListener("click", function () { apply(ctrl, ti.value); });
      row.appendChild(ti); row.appendChild(sb);
    } else { return null; }
    return row;
  }

  function renderGroups(container, config) {
    container.innerHTML = "";
    (config.groups || []).forEach(function (g) {
      var sec = el("section", "agent-fx-grp");
      var h = el("p", "agent-fx-grp-label"); h.textContent = g.label; sec.appendChild(h);  // <p>, never a heading
      (g.controls || []).forEach(function (c) { var r = renderControl(c); if (r) sec.appendChild(r); });
      container.appendChild(sec);
    });
    return container;
  }

  var mountEl = null, bodyEl = null, discloseBtn = null, cfg = null, built = false;

  function setOpen(open) {
    if (!mountEl) return;
    mountEl.classList.toggle("agent-fx-open", !!open);
    if (discloseBtn) discloseBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (bodyEl) bodyEl.hidden = !open;
    lsSet(OPEN_KEY, open ? "1" : "0");
  }

  function build(config) {
    if (built) return;
    if (!mountEl) mountEl = document.querySelector(MOUNT_SEL);
    if (!mountEl || !config || !config.groups) return;
    built = true; cfg = config;
    if (reducedMotion()) mountEl.classList.add("agent-fx-reduced");
    mountEl.hidden = false;

    discloseBtn = el("button", "agent-fx-disclose"); discloseBtn.type = "button";
    discloseBtn.setAttribute("aria-controls", "agent-fx-body");
    discloseBtn.textContent = "Sound & voice";
    var head = el("div", "agent-fx-head"); head.appendChild(discloseBtn);

    bodyEl = el("div", "agent-fx-body"); bodyEl.id = "agent-fx-body";
    renderGroups(bodyEl, config);

    var note = el("p", "agent-fx-foot");
    note.textContent = "Tuned in this browser only · her voice defaults off · sound unlocks on your first touch.";
    bodyEl.appendChild(note);

    mountEl.appendChild(head); mountEl.appendChild(bodyEl);
    discloseBtn.addEventListener("click", function () { setOpen(!mountEl.classList.contains("agent-fx-open")); });

    setOpen(lsGet(OPEN_KEY) === "1");   // default collapsed; own key remembers the last state
  }

  function boot() {
    if (typeof fetch !== "function") return;   // no-fetch env (headless e2e) drives via _build
    fetch(CFG_URL, { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (config) { if (config && config.groups) build(config); })
      .catch(function () {});                   // registry unreachable -> render nothing
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // tiny surface for the headless e2e / console (own namespace; no component keys)
  window.wuldAgentFx = {
    _build: build,
    _render: renderGroups,
    _apply: apply,
    _setOpen: setOpen,
    built: function () { return built; },
    isOpen: function () { return !!(mountEl && mountEl.classList.contains("agent-fx-open")); },
    ownKeys: [OPEN_KEY]
  };
})();
