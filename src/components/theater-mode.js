/* ============================================================
   wuld.ink - theater-mode video overlay (K24k)
   Full-viewport modal containing a 16:9 youtube-nocookie iframe.
   Coordinates with ambient-player via wuld:overlay:open/close
   events (auto-pause/resume ambient audio while overlay is open).

   Trigger: any element with data-theater-video-id="<YT_VIDEO_ID>" OR
   data-theater-playlist-id="<YT_PLAYLIST_ID>" (K24l extension; opens
   embed/videoseries?list=<ID> form). When both are present, video-id
   wins (single-video path is the simpler default).
   Optional: data-theater-title="..." for aria-label (defaults to
   "Watch video").

   Public surface:
     window.WuldTheater = {
       open(id, opts), openPlaylist(listId, opts), close()
     }
   ============================================================ */

(() => {
  "use strict";

  const YT_HOST = "https://www.youtube-nocookie.com";
  let overlay = null;
  let frame = null;
  let closeBtn = null;
  let lastFocused = null;
  let escHandler = null;
  let clickOutsideHandler = null;
  let focusTrapHandler = null;

  function buildOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "theater-mode";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Video");
    overlay.setAttribute("data-open", "false");

    const wrap = document.createElement("div");
    wrap.className = "theater-frame-wrap";

    closeBtn = document.createElement("button");
    closeBtn.className = "theater-close";
    closeBtn.setAttribute("type", "button");
    closeBtn.setAttribute("aria-label", "Close video");
    closeBtn.textContent = "×";  // multiplication sign as close glyph

    wrap.appendChild(closeBtn);

    frame = document.createElement("iframe");
    frame.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    frame.setAttribute("title", "Video player");

    wrap.appendChild(frame);
    overlay.appendChild(wrap);
    document.body.appendChild(overlay);

    // click-outside to close (on overlay backdrop, not frame-wrap)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener("click", close);
  }

  function buildSrc(videoId) {
    // Theater mode embed: autoplay=1 (user-action triggered), modestbranding,
    // playsinline for mobile, rel=0 to suppress related-video grid.
    const params = new URLSearchParams({
      autoplay: "1",
      modestbranding: "1",
      rel: "0",
      playsinline: "1",
      iv_load_policy: "3"
    });
    return YT_HOST + "/embed/" + encodeURIComponent(videoId) + "?" + params.toString();
  }

  function buildPlaylistSrc(playlistId) {
    // K24l: embed/videoseries?list=<ID> form (different from single-video
    // embed/<ID>). Same playback options. listType=playlist is implicit
    // when videoseries path is used + list= param present.
    const params = new URLSearchParams({
      list: playlistId,
      autoplay: "1",
      modestbranding: "1",
      rel: "0",
      playsinline: "1",
      iv_load_policy: "3"
    });
    return YT_HOST + "/embed/videoseries?" + params.toString();
  }

  function open(videoId, opts) {
    if (!videoId) return;
    buildOverlay();
    opts = opts || {};
    if (opts.title) {
      overlay.setAttribute("aria-label", opts.title);
    } else {
      overlay.setAttribute("aria-label", "Video");
    }

    // Save current focus so we can restore on close
    lastFocused = document.activeElement;

    frame.src = buildSrc(videoId);

    // Reveal overlay (next frame so transition fires)
    requestAnimationFrame(() => {
      overlay.setAttribute("data-open", "true");
    });

    document.body.classList.add("theater-open");

    // Dispatch overlay-open event (ambient-player listens to pause)
    document.dispatchEvent(new CustomEvent("wuld:overlay:open", {
      detail: { source: "theater-mode", videoId: videoId }
    }));

    // Bind close handlers
    escHandler = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", escHandler);

    // Focus trap (Tab cycles between close button and iframe)
    focusTrapHandler = (e) => {
      if (e.key !== "Tab") return;
      const focusables = [closeBtn, frame];
      const current = document.activeElement;
      const idx = focusables.indexOf(current);
      if (e.shiftKey) {
        if (idx <= 0) {
          e.preventDefault();
          focusables[focusables.length - 1].focus();
        }
      } else {
        if (idx === focusables.length - 1) {
          e.preventDefault();
          focusables[0].focus();
        }
      }
    };
    document.addEventListener("keydown", focusTrapHandler);

    // Move focus to close button (predictable Esc-equivalent affordance)
    setTimeout(() => {
      if (closeBtn) closeBtn.focus();
    }, 60);
  }

  function openPlaylist(playlistId, opts) {
    if (!playlistId) return;
    buildOverlay();
    opts = opts || {};
    overlay.setAttribute("aria-label", opts.title || "Playlist");

    lastFocused = document.activeElement;
    frame.src = buildPlaylistSrc(playlistId);

    requestAnimationFrame(() => {
      overlay.setAttribute("data-open", "true");
    });
    document.body.classList.add("theater-open");

    document.dispatchEvent(new CustomEvent("wuld:overlay:open", {
      detail: { source: "theater-mode", playlistId: playlistId }
    }));

    escHandler = (e) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
    };
    document.addEventListener("keydown", escHandler);

    focusTrapHandler = (e) => {
      if (e.key !== "Tab") return;
      const focusables = [closeBtn, frame];
      const current = document.activeElement;
      const idx = focusables.indexOf(current);
      if (e.shiftKey) {
        if (idx <= 0) {
          e.preventDefault();
          focusables[focusables.length - 1].focus();
        }
      } else {
        if (idx === focusables.length - 1) {
          e.preventDefault();
          focusables[0].focus();
        }
      }
    };
    document.addEventListener("keydown", focusTrapHandler);

    setTimeout(() => { if (closeBtn) closeBtn.focus(); }, 60);
  }

  function close() {
    if (!overlay) return;
    overlay.setAttribute("data-open", "false");
    document.body.classList.remove("theater-open");

    // Empty iframe src - stops playback + frees YT player resources
    if (frame) frame.src = "";

    // Unbind close handlers
    if (escHandler) {
      document.removeEventListener("keydown", escHandler);
      escHandler = null;
    }
    if (focusTrapHandler) {
      document.removeEventListener("keydown", focusTrapHandler);
      focusTrapHandler = null;
    }

    // Restore focus
    try {
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    } catch (_) {}
    lastFocused = null;

    // Dispatch overlay-close event (ambient-player listens to resume)
    document.dispatchEvent(new CustomEvent("wuld:overlay:close", {
      detail: { source: "theater-mode" }
    }));
  }

  function bindTriggers() {
    // Delegated click: data-theater-video-id OR data-theater-playlist-id.
    // Video-id wins if both attrs are set on the same trigger.
    document.addEventListener("click", (e) => {
      const trigger = e.target && e.target.closest && e.target.closest("[data-theater-video-id],[data-theater-playlist-id]");
      if (!trigger) return;
      e.preventDefault();
      const videoId = trigger.getAttribute("data-theater-video-id");
      const playlistId = trigger.getAttribute("data-theater-playlist-id");
      const title = trigger.getAttribute("data-theater-title") || (playlistId ? "Playlist" : "Video");
      if (videoId) {
        open(videoId, { title: title });
      } else if (playlistId) {
        openPlaylist(playlistId, { title: title });
      }
    });
  }

  function init() {
    bindTriggers();
    window.WuldTheater = {
      open: open,
      openPlaylist: openPlaylist,
      close: close
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
