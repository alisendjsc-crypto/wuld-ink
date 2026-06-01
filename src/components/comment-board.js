/* =============================================================================
 * comment-board.js — wuld.ink message board frontend (K44)
 * -----------------------------------------------------------------------------
 * DORMANT until BOARD.live === true. At K44 the board ships in /chat/ but stays
 * hidden, so the page renders exactly as before. K45 (after the Worker is live):
 *   1. set BOARD.live = true
 *   2. confirm BOARD.apiBase points at the deployed Worker route
 *   3. bump the ?v=K44 cache query on the <link>/<script> tags
 * Store raw on the server; escape on render here. Never trust name/body.
 * ===========================================================================*/
(function () {
  "use strict";

  var BOARD = {
    apiBase: "/api",     // same-origin Worker route (wuld.ink/api/*). K45: confirm.
    board: "global",
    live: false,         // <-- K45 FLIP TO true AFTER WORKER DEPLOY + SMOKE TEST
    maxBody: 2000,
    maxName: 80,
    maxEmail: 254,
  };
  window.WULD_BOARD = BOARD; // inspectable from console

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var root = document.getElementById("comment-board");
    if (!root) return;
    if (!BOARD.live) return; // dormant: section stays hidden, IRC stays primary

    root.hidden = false;
    document.body.classList.add("board-live");
    wireForm(root);
    loadThread(root);
  });

  /* ------------------------------- load ---------------------------------- */
  function loadThread(root) {
    var thread = root.querySelector(".cb-thread");
    var loading = root.querySelector(".cb-loading");
    if (loading) loading.hidden = false;

    fetch(BOARD.apiBase + "/comments?board=" + encodeURIComponent(BOARD.board), {
      headers: { accept: "application/json" },
    })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        if (loading) loading.hidden = true;
        renderThread(root, (data && data.comments) || []);
      })
      .catch(function () {
        if (loading) loading.hidden = true;
        renderError(root);
      });
  }

  function renderThread(root, comments) {
    var thread = root.querySelector(".cb-thread");
    if (!thread) return;
    thread.innerHTML = "";
    comments.sort(function (a, b) { return b.created_at - a.created_at; }); // newest-first
    if (!comments.length) {
      thread.innerHTML = '<li class="cb-empty">No messages yet. Be the first.</li>';
      return;
    }
    for (var i = 0; i < comments.length; i++) {
      thread.appendChild(commentNode(comments[i]));
    }
  }

  function commentNode(c) {
    var li = document.createElement("li");
    li.className = "cb-comment";

    var meta = document.createElement("div");
    meta.className = "cb-comment-meta";

    var name = document.createElement("span");
    if (c.name && String(c.name).trim()) {
      name.className = "cb-comment-name";
      name.textContent = c.name;
    } else {
      name.className = "cb-comment-name cb-anon";
      name.textContent = "anonymous";
    }
    meta.appendChild(name);

    var time = document.createElement("time");
    time.className = "cb-comment-time";
    time.dateTime = new Date(c.created_at).toISOString();
    time.textContent = fmtTime(c.created_at);
    meta.appendChild(time);

    var body = document.createElement("div");
    body.className = "cb-comment-body";
    body.innerHTML = nl2br(c.body); // body is escaped inside nl2br

    li.appendChild(meta);
    li.appendChild(body);
    return li;
  }

  function renderError(root) {
    var thread = root.querySelector(".cb-thread");
    if (thread) thread.innerHTML = '<li class="cb-empty">Could not load the board right now. Try again in a moment, or reach me via <a href="/contact/">Contact</a>.</li>';
  }

  /* ------------------------------- post ---------------------------------- */
  function wireForm(root) {
    var form = root.querySelector(".cb-form");
    if (!form) return;
    var bodyEl = form.querySelector('[name="body"]');
    var counter = form.querySelector(".cb-charcount");
    var status = form.querySelector(".cb-status");
    var submit = form.querySelector(".cb-submit");

    if (bodyEl && counter) {
      var updateCount = function () {
        var n = bodyEl.value.length;
        counter.textContent = n + " / " + BOARD.maxBody;
        counter.classList.toggle("is-over", n > BOARD.maxBody);
      };
      bodyEl.addEventListener("input", updateCount);
      updateCount();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (status) { status.textContent = ""; status.classList.remove("is-error"); }

      var payload = {
        name: (form.querySelector('[name="name"]') || {}).value || "",
        email: (form.querySelector('[name="email"]') || {}).value || "",
        body: (bodyEl || {}).value || "",
        hp: (form.querySelector('[name="hp"]') || {}).value || "", // honeypot
        board: BOARD.board,
      };

      var trimmed = payload.body.trim();
      if (trimmed.length < 1) return setStatus(status, "Write something first.", true);
      if (trimmed.length > BOARD.maxBody) return setStatus(status, "Too long — keep it under " + BOARD.maxBody + " characters.", true);

      if (submit) submit.disabled = true;
      setStatus(status, "posting…", false);

      fetch(BOARD.apiBase + "/comments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (d) { return { ok: r.ok, status: r.status, d: d }; });
        })
        .then(function (res) {
          if (submit) submit.disabled = false;
          if (res.status === 429) return setStatus(status, "You're posting too fast — wait a minute and try again.", true);
          if (!res.ok) return setStatus(status, "Couldn't post (" + ((res.d && res.d.error) || res.status) + ").", true);

          // success — prepend the new comment if the server returned it
          if (res.d && res.d.comment) {
            var thread = root.querySelector(".cb-thread");
            var empty = thread && thread.querySelector(".cb-empty");
            if (empty) thread.innerHTML = "";
            if (thread) thread.insertBefore(commentNode(res.d.comment), thread.firstChild);
          }
          if (bodyEl) bodyEl.value = "";        // clear the message
          if (counter) counter.textContent = "0 / " + BOARD.maxBody;
          setStatus(status, "Posted.", false);  // name + email kept for convenience
        })
        .catch(function () {
          if (submit) submit.disabled = false;
          setStatus(status, "Network error — try again, or reach me via Contact.", true);
        });
    });
  }

  function setStatus(el, msg, isError) {
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle("is-error", !!isError);
  }

  /* ------------------------------ helpers -------------------------------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function nl2br(s) {
    return esc(s).replace(/\r\n|\r|\n/g, "<br>");
  }
  function fmtTime(ms) {
    var d = new Date(ms);
    if (isNaN(d.getTime())) return "";
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
      " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
})();
