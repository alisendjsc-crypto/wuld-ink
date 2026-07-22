/* ============================================================
   wuld.ink — kaomoji picker (K271)
   Discrete insert-at-caret face picker for /notes/.

   Contract with the notes app: this file NEVER reaches into the
   notes IIFE. It writes into #editor.value and dispatches a
   synthetic `input` event, so the notes autosave + word-count
   fire naturally. Its own state lives under localStorage key
   "wuld:kaomoji" and never touches "wuld:notes".

   Lazy: the 59KB data is fetched on FIRST open only, so the notes
   page stays light and the feature costs nothing unless used.
   Reusable elsewhere later; for now it only binds on /notes/.
   ============================================================ */
(function () {
  "use strict";

  var VERSION  = "K271";
  var DATA_URL = "/components/kaomoji-data.json?v=" + VERSION;
  var LS_KEY   = "wuld:kaomoji";
  var ZALGO    = "Zalgo / Glitch";
  var ALL      = "__all__";
  var FAV      = "__fav__";

  var trigger = document.getElementById("kaomoji-trigger");
  var wrap    = document.getElementById("kaomoji-wrap");
  var editor  = document.getElementById("editor");
  if (!trigger || !wrap) return;

  // Progressive enhancement: the control only appears once JS can power it,
  // which also keeps the search-index harvest neutral (hidden until now).
  trigger.hidden = false;

  var canInsert = !!(editor && "selectionStart" in editor);

  // ---- state ----
  var data = null;          // { Category: [[face, tags], ...] }
  var cats = [];            // category names (minus Zalgo), source order
  var zalgoFace = {};       // face -> true when it belongs to Zalgo (containment)
  var built = false, loading = false, loaded = false;
  var activeCat = ALL, query = "";
  var copyMode = !canInsert;      // no editor -> copy is the only action
  var savedStart = 0, savedEnd = 0;
  var favs = loadFavs();

  // ---- favourites (own key; versioned; never touches wuld:notes) ----
  function loadFavs() {
    try {
      var r = JSON.parse(localStorage.getItem(LS_KEY));
      if (r && r.v === 1 && Array.isArray(r.favs)) return r.favs.slice();
    } catch (e) {}
    return [];
  }
  function saveFavs() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ v: 1, favs: favs })); } catch (e) {}
  }
  function isFav(face) { return favs.indexOf(face) !== -1; }
  function toggleFav(face) {
    var i = favs.indexOf(face);
    if (i === -1) favs.push(face); else favs.splice(i, 1);
    saveFavs();
  }

  // ---- caret tracking (no reach into notes' closure) ----
  function capture() {
    if (!canInsert) return;
    try { savedStart = editor.selectionStart; savedEnd = editor.selectionEnd; } catch (e) {}
  }
  if (canInsert) {
    editor.addEventListener("blur", capture);
    editor.addEventListener("keyup", capture);
    editor.addEventListener("click", capture);
    editor.addEventListener("select", capture);
  }

  // ---- DOM helpers ----
  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }

  var panel, searchEl, chipsEl, gridEl, toastEl, hintEl, copyBtn, toastTimer = null, searchTimer = null;

  function buildShell() {
    panel = el("div", "kaomoji-panel", { id: "kaomoji-panel", role: "dialog", "aria-label": "Kaomoji picker", "aria-modal": "false" });
    panel.hidden = true;

    var head = el("div", "kaomoji-head");
    searchEl = el("input", "kaomoji-search", { type: "text", placeholder: "search faces…", "aria-label": "Search kaomoji", autocomplete: "off", autocapitalize: "off", spellcheck: "false" });
    var shuffleBtn = el("button", "kaomoji-mini", { type: "button", title: "random", "aria-label": "Random face" });
    shuffleBtn.textContent = "[ ⚄ ]";
    var closeBtn = el("button", "kaomoji-mini", { type: "button", title: "close", "aria-label": "Close" });
    closeBtn.textContent = "[×]";
    head.appendChild(searchEl); head.appendChild(shuffleBtn); head.appendChild(closeBtn);

    chipsEl = el("div", "kaomoji-chips", { role: "group", "aria-label": "Categories" });
    gridEl  = el("div", "kaomoji-grid", { "aria-label": "Faces" });

    var foot = el("div", "kaomoji-foot");
    hintEl = el("span", "kaomoji-hint");
    copyBtn = el("button", "kaomoji-toggle", { type: "button", "aria-pressed": String(copyMode) });
    copyBtn.textContent = "[ copy ]";
    if (!canInsert) copyBtn.disabled = true;
    toastEl = el("span", "kaomoji-toast", { role: "status", "aria-live": "polite" });
    foot.appendChild(hintEl); foot.appendChild(copyBtn); foot.appendChild(toastEl);
    setHint();

    panel.appendChild(head); panel.appendChild(chipsEl); panel.appendChild(gridEl); panel.appendChild(foot);
    wrap.appendChild(panel);

    searchEl.addEventListener("input", function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { query = searchEl.value || ""; render(); }, 90);
    });
    searchEl.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        var c = gridEl.querySelector('.kaomoji-cell[tabindex="0"]') || gridEl.querySelector(".kaomoji-cell");
        if (c) { e.preventDefault(); c.focus(); }
      }
    });
    shuffleBtn.addEventListener("click", shuffle);
    closeBtn.addEventListener("click", function () { close(true); });
    copyBtn.addEventListener("click", function () {
      if (!canInsert) return;
      copyMode = !copyMode; copyBtn.setAttribute("aria-pressed", String(copyMode)); setHint();
    });
    panel.addEventListener("keydown", onPanelKey);
    gridEl.addEventListener("keydown", onGridKey);
    built = true;
  }

  function setHint() {
    if (!hintEl) return;
    hintEl.textContent = (copyMode ? "enter copies" : "enter inserts") + " · f favourites · esc closes";
  }

  // ---- data ----
  function loadData() {
    if (loaded || loading) return;
    loading = true;
    message("loading faces…");
    fetch(DATA_URL, { credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (json) {
        data = json || {};
        cats = Object.keys(data).filter(function (c) { return c !== ZALGO; });
        if (data[ZALGO]) data[ZALGO].forEach(function (row) { zalgoFace[row[0]] = true; });
        loaded = true; loading = false;
        renderChips(); render();
      })
      .catch(function () {
        loading = false;
        message("couldn’t load faces — check your connection and reopen.");
      });
  }

  function message(txt) {
    if (chipsEl) chipsEl.innerHTML = "";
    if (!gridEl) return;
    gridEl.innerHTML = "";
    var m = el("div", "kaomoji-empty"); m.textContent = txt; gridEl.appendChild(m);
  }

  // ---- chips ----
  function renderChips() {
    chipsEl.innerHTML = "";
    var list = [[ALL, "all"], [FAV, "★ favourites"]];
    cats.forEach(function (c) { list.push([c, c.toLowerCase()]); });
    if (data[ZALGO]) list.push([ZALGO, "zalgo / glitch"]);
    list.forEach(function (pair) {
      var key = pair[0];
      var chip = el("button", "kaomoji-chip" + (key === ZALGO ? " is-zalgo" : ""), { type: "button", "aria-pressed": String(key === activeCat), "data-cat": key });
      chip.textContent = "[ " + pair[1] + " ]";
      chip.addEventListener("click", function () { activeCat = key; syncChips(); render(); });
      chipsEl.appendChild(chip);
    });
  }
  function syncChips() {
    var all = chipsEl.querySelectorAll(".kaomoji-chip");
    for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-pressed", String(all[i].getAttribute("data-cat") === activeCat));
  }

  // ---- visible set (Zalgo walled off from All + search) ----
  function visibleRows() {
    var rows = [];
    if (activeCat === FAV) {
      favs.forEach(function (face) { rows.push([face, ""]); });
    } else if (activeCat === ZALGO) {
      rows = (data[ZALGO] || []).slice();
    } else if (activeCat === ALL) {
      cats.forEach(function (c) { rows = rows.concat(data[c]); });   // never Zalgo
    } else if (data[activeCat]) {
      rows = data[activeCat].slice();
    }
    var q = query.trim().toLowerCase();
    if (q) rows = rows.filter(function (row) { return (row[0] + " " + (row[1] || "")).toLowerCase().indexOf(q) !== -1; });
    return rows;
  }

  // ---- grid ----
  function render() {
    if (!loaded) return;
    var rows = visibleRows();
    gridEl.innerHTML = "";
    if (!rows.length) {
      var m = el("div", "kaomoji-empty");
      m.textContent = activeCat === FAV ? "no favourites yet — tap ☆ on a face to keep it." : "no faces match.";
      gridEl.appendChild(m);
      return;
    }
    var frag = document.createDocumentFragment();
    for (var i = 0; i < rows.length; i++) frag.appendChild(cell(rows[i][0]));
    gridEl.appendChild(frag);
    setRoving(0);
  }

  function cell(face) {
    var isZ = !!zalgoFace[face];
    var w = el("div", "kaomoji-cell-wrap" + (isZ ? " is-zalgo" : ""));
    var b = el("button", "kaomoji-cell", { type: "button", tabindex: "-1", "aria-label": (copyMode ? "Copy " : "Insert ") + face });
    b.textContent = face;
    b.addEventListener("click", function (ev) {
      if (ev && (ev.ctrlKey || ev.metaKey)) { copyFace(face); return; }
      choose(face);
    });
    var star = el("button", "kaomoji-star", { type: "button", tabindex: "-1", "aria-pressed": String(isFav(face)), "aria-label": (isFav(face) ? "Unfavourite " : "Favourite ") + face });
    star.textContent = isFav(face) ? "★" : "☆";
    star.addEventListener("click", function (ev) {
      ev.stopPropagation();
      toggleFav(face);
      syncStar(star, face);
      if (activeCat === FAV && !isFav(face)) render();
    });
    w.appendChild(b); w.appendChild(star);
    return w;
  }
  function syncStar(star, face) {
    var on = isFav(face);
    star.setAttribute("aria-pressed", String(on));
    star.setAttribute("aria-label", (on ? "Unfavourite " : "Favourite ") + face);
    star.textContent = on ? "★" : "☆";
  }

  // ---- primary: insert at caret / secondary: copy ----
  function choose(face) { if (copyMode || !canInsert) copyFace(face); else insertFace(face); }

  function insertFace(face) {
    if (!canInsert) { copyFace(face); return; }
    var v = editor.value;
    var s = Math.min(savedStart, v.length), e = Math.min(savedEnd, v.length);
    if (s > e) { var t = s; s = e; e = t; }
    editor.value = v.slice(0, s) + face + v.slice(e);
    var caret = s + face.length;
    savedStart = savedEnd = caret;
    try { editor.selectionStart = editor.selectionEnd = caret; } catch (ex) {}
    dispatchInput(editor);   // notes autosave + word-count react naturally
    toast("inserted");
    // panel stays open for multi-insert
  }
  function dispatchInput(node) {
    var ev;
    try { ev = new Event("input", { bubbles: true }); }
    catch (e) { ev = document.createEvent("Event"); ev.initEvent("input", true, false); }
    node.dispatchEvent(ev);
  }
  function copyFace(face) {
    function fb() {
      try {
        var t = document.createElement("textarea");
        t.value = face; t.setAttribute("readonly", "");
        t.style.position = "fixed"; t.style.top = "-1000px"; t.style.opacity = "0";
        document.body.appendChild(t); t.select();
        document.execCommand("copy"); document.body.removeChild(t);
        toast("copied");
      } catch (e) {}
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(face).then(function () { toast("copied"); }, fb);
      else fb();
    } catch (e) { fb(); }
  }
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg; toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 1100);
  }

  // ---- shuffle (excludes Zalgo) ----
  function shuffle() {
    if (!loaded) return;
    var pool = [];
    cats.forEach(function (c) { pool = pool.concat(data[c]); });
    if (!pool.length) return;
    var pick = pool[Math.floor(Math.random() * pool.length)][0];
    activeCat = ALL; query = ""; if (searchEl) searchEl.value = "";
    syncChips(); render();
    var cells = gridEl.querySelectorAll(".kaomoji-cell");
    for (var i = 0; i < cells.length; i++) {
      if (cells[i].textContent === pick) {
        setRoving(i);
        try { cells[i].focus(); } catch (e) {}
        try { cells[i].scrollIntoView({ block: "center" }); } catch (e2) {}
        break;
      }
    }
  }

  // ---- keyboard: roving grid + focus trap ----
  function gridCells() { return gridEl.querySelectorAll(".kaomoji-cell"); }
  function setRoving(idx) {
    var cells = gridCells();
    for (var i = 0; i < cells.length; i++) cells[i].setAttribute("tabindex", i === idx ? "0" : "-1");
  }
  function cols() {
    var wraps = gridEl.querySelectorAll(".kaomoji-cell-wrap");
    if (wraps.length < 2) return 1;
    var top0 = wraps[0].offsetTop, n = 0;
    for (var i = 0; i < wraps.length; i++) { if (wraps[i].offsetTop > top0) break; n++; }
    return Math.max(1, n);
  }
  function onGridKey(e) {
    var cells = gridCells(); if (!cells.length) return;
    var cur = -1;
    for (var i = 0; i < cells.length; i++) if (cells[i] === document.activeElement) { cur = i; break; }
    if (cur === -1) return;
    var c = cols(), next = cur, k = e.key;
    if (k === "ArrowRight") next = Math.min(cells.length - 1, cur + 1);
    else if (k === "ArrowLeft") next = Math.max(0, cur - 1);
    else if (k === "ArrowDown") next = Math.min(cells.length - 1, cur + c);
    else if (k === "ArrowUp") next = (cur - c < 0) ? cur : cur - c;
    else if (k === "Home") next = 0;
    else if (k === "End") next = cells.length - 1;
    else if (k === "f" || k === "F") {
      var face = cells[cur].textContent; toggleFav(face);
      var star = cells[cur].parentNode.querySelector(".kaomoji-star");
      if (star) syncStar(star, face);
      if (activeCat === FAV && !isFav(face)) render();
      e.preventDefault(); return;
    } else return;
    e.preventDefault(); setRoving(next);
    try { cells[next].focus(); } catch (ex) {}
  }
  function focusables() {
    return panel.querySelectorAll('input:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"])');
  }
  function onPanelKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(true); return; }
    if (e.key === "Tab") {
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  // ---- open / close ----
  function open() {
    if (!built) buildShell();
    if (!loaded && !loading) loadData();
    capture();
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    setTimeout(function () { try { searchEl.focus(); } catch (e) {} }, 0);
    document.addEventListener("pointerdown", onOutside, true);
  }
  function close(focusTrigger) {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    document.removeEventListener("pointerdown", onOutside, true);
    if (focusTrigger) { try { trigger.focus(); } catch (e) {} }
  }
  function toggle() { if (!built || panel.hidden) open(); else close(true); }
  function onOutside(e) {
    if (!panel || panel.hidden) return;
    if (wrap.contains(e.target)) return;
    close(false);
  }

  // ---- wire trigger + Alt+K ----
  trigger.setAttribute("aria-expanded", "false");
  trigger.addEventListener("click", function () { toggle(); });
  document.addEventListener("keydown", function (e) {
    if (e.altKey && !e.ctrlKey && !e.metaKey && (e.code === "KeyK" || e.key === "k" || e.key === "K")) {
      e.preventDefault(); toggle();
    }
  });
})();
