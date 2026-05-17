/* ============================================================
   wuld.ink - ambient background player controller
   Hidden YouTube IFrame loading a curated playlist via
   youtube-nocookie.com. localStorage state persists across
   navigation; first-interaction listener works around browser
   autoplay policy hard-block.

   K24k extension:
     - dismiss/restore (hairline sliver state; bar visibility
       toggle distinct from audio toggle)
     - loop-one (repeat current video on end)
     - wuld:overlay:open/close listener (auto-pause when a
       modal opens, e.g. theater-mode; auto-resume on close
       if was playing)

   Public surface: window.WuldAmbient
   ============================================================ */

(() => {
  "use strict";

  const STORAGE_KEY  = "wuld:ambient";
  const PLAYLIST_ID  = "PLt28yN-6sGYFrlBca9RI70IjQ2ny50D1c";
  const IFRAME_API   = "https://www.youtube.com/iframe_api";
  const STATE_SAVE_MS = 4000;  // periodic seek-position save

  const DEFAULT_STATE = {
    on: true,             // user toggle (sticky across sessions)
    volume: 40,           // 0..100
    currentVideoId: null, // resume target on next page
    lastPositionSec: 0,   // resume offset
    shuffleOn: true,
    loopOne: false,       // K24k: repeat current video on end
    dismissed: false      // K24k: bar collapsed to sliver
  };

  let state    = readState();
  let player   = null;          // YT.Player instance
  let apiBooted = false;        // YT iframe API script loaded?
  let initInteractionBound = false;
  let saveInterval = null;
  let initialPlayAttempted = false;
  let elements = {};            // cached DOM refs
  let overlayPauseResumeNeeded = false;  // K24k: was-playing memory across overlay

  // ---------------- localStorage helpers ----------------

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT_STATE, parsed);
    } catch (_) {
      return Object.assign({}, DEFAULT_STATE);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* storage may be disabled */ }
  }

  // ---------------- YouTube IFrame API boot ----------------

  function loadYouTubeAPI() {
    if (apiBooted) return;
    apiBooted = true;
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
      if (typeof prev === "function") { try { prev(); } catch (_) {} }
      createPlayer();
    };
    const tag = document.createElement("script");
    tag.src = IFRAME_API;
    tag.async = true;
    const first = document.getElementsByTagName("script")[0];
    if (first && first.parentNode) {
      first.parentNode.insertBefore(tag, first);
    } else {
      document.head.appendChild(tag);
    }
  }

  function createPlayer() {
    if (player) return;
    if (!window.YT || !window.YT.Player) return;

    const playerVars = {
      listType: "playlist",
      list: PLAYLIST_ID,
      autoplay: state.on ? 1 : 0,
      controls: 0,
      disablekb: 1,
      enablejsapi: 1,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      iv_load_policy: 3,
      fs: 0
    };
    try { playerVars.origin = window.location.origin; } catch (_) {}

    player = new YT.Player("ambient-iframe", {
      host: "https://www.youtube-nocookie.com",
      width: "1",
      height: "1",
      playerVars: playerVars,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  }

  function onPlayerReady(evt) {
    try { evt.target.setVolume(state.volume); } catch (_) {}
    if (state.shuffleOn) {
      try { evt.target.setShuffle(true); } catch (_) {}
    }
    setTimeout(resumeFromSavedState, 600);

    if (state.on) {
      attemptInitialPlay();
    } else {
      setStateAttr("off");
    }

    if (saveInterval) clearInterval(saveInterval);
    saveInterval = setInterval(captureNowPlaying, STATE_SAVE_MS);

    refreshTrackName();
  }

  function resumeFromSavedState() {
    if (!player || !state.currentVideoId) return;
    try {
      const playlist = player.getPlaylist();
      if (!playlist || !playlist.length) return;
      const idx = playlist.indexOf(state.currentVideoId);
      if (idx >= 0) {
        player.playVideoAt(idx);
        if (state.lastPositionSec > 1) {
          setTimeout(() => {
            try { player.seekTo(state.lastPositionSec, true); } catch (_) {}
          }, 800);
        }
      }
    } catch (_) {}
  }

  function attemptInitialPlay() {
    if (initialPlayAttempted) return;
    initialPlayAttempted = true;
    try { player.playVideo(); } catch (_) {}
    setTimeout(() => {
      if (!player) return;
      let st = -1;
      try { st = player.getPlayerState(); } catch (_) {}
      if (st !== 1 && st !== 3) {
        bindFirstInteraction();
        showNeedsTap(true);
      }
    }, 1400);
  }

  function bindFirstInteraction() {
    if (initInteractionBound) return;
    initInteractionBound = true;
    const events = ["click", "touchstart", "keydown"];
    const handler = function() {
      events.forEach(e => document.removeEventListener(e, handler, true));
      initInteractionBound = false;
      try { player && player.playVideo(); } catch (_) {}
      showNeedsTap(false);
    };
    events.forEach(e => document.addEventListener(e, handler, true));
  }

  function showNeedsTap(yes) {
    if (!elements.playpause) return;
    elements.playpause.classList.toggle("ambient-needs-tap", !!yes);
  }

  function onPlayerStateChange(evt) {
    const YTState = window.YT && window.YT.PlayerState;
    if (!YTState) return;
    if (evt.data === YTState.PLAYING) {
      setPlayPauseGlyph(true);
      showNeedsTap(false);
      refreshTrackName();
    } else if (evt.data === YTState.PAUSED) {
      setPlayPauseGlyph(false);
    } else if (evt.data === YTState.ENDED) {
      setPlayPauseGlyph(false);
      // K24k: loop-one - restart current video on end
      if (state.loopOne && player) {
        try {
          player.seekTo(0, true);
          player.playVideo();
        } catch (_) {}
      }
    } else if (evt.data === YTState.CUED) {
      refreshTrackName();
    }
    captureNowPlaying();
  }

  function onPlayerError(evt) {
    try { player.nextVideo(); } catch (_) {}
  }

  function setPlayPauseGlyph(playing) {
    if (!elements.playpause) return;
    elements.playpause.textContent = playing ? "[pause]" : "[play]";
    elements.playpause.setAttribute("aria-label", playing ? "Pause" : "Play");
  }

  function setShuffleGlyph(on) {
    if (!elements.shuffle) return;
    elements.shuffle.textContent = on ? "[shuffle on]" : "[shuffle off]";
    elements.shuffle.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function setOnOffGlyph(on) {
    if (!elements.onoff) return;
    elements.onoff.textContent = on ? "[ambient on]" : "[ambient off]";
    elements.onoff.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function setLoopGlyph(on) {
    if (!elements.loop) return;
    elements.loop.textContent = on ? "[loop one]" : "[loop off]";
    elements.loop.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function setStateAttr(s) {
    if (!elements.root) return;
    if (s) elements.root.setAttribute("data-state", s);
    else   elements.root.removeAttribute("data-state");
  }

  function setDismissedAttr(yes) {
    if (!elements.root) return;
    if (yes) {
      elements.root.setAttribute("data-dismissed", "true");
      document.body.classList.add("ambient-dismissed");
    } else {
      elements.root.removeAttribute("data-dismissed");
      document.body.classList.remove("ambient-dismissed");
    }
  }

  function refreshTrackName() {
    if (!elements.track || !player) return;
    try {
      const data = player.getVideoData();
      if (data && data.title) {
        elements.track.textContent = data.title;
      } else {
        elements.track.textContent = "ambient";
      }
    } catch (_) {
      elements.track.textContent = "ambient";
    }
  }

  function captureNowPlaying() {
    if (!player) return;
    try {
      const data = player.getVideoData();
      const t = player.getCurrentTime();
      if (data && data.video_id) state.currentVideoId = data.video_id;
      if (typeof t === "number" && isFinite(t)) state.lastPositionSec = Math.max(0, t);
      saveState();
    } catch (_) {}
  }

  // ---------------- Public controls ----------------

  function togglePlayPause() {
    if (!player) return;
    let st = -1;
    try { st = player.getPlayerState(); } catch (_) {}
    const YTState = window.YT && window.YT.PlayerState;
    if (!YTState) return;
    if (st === YTState.PLAYING || st === YTState.BUFFERING) {
      try { player.pauseVideo(); } catch (_) {}
    } else {
      try { player.playVideo(); } catch (_) {}
    }
  }

  function skip() {
    if (!player) return;
    try { player.nextVideo(); } catch (_) {}
    setTimeout(refreshTrackName, 300);
  }

  function shuffleToggle() {
    state.shuffleOn = !state.shuffleOn;
    setShuffleGlyph(state.shuffleOn);
    if (player) {
      try { player.setShuffle(state.shuffleOn); } catch (_) {}
    }
    saveState();
  }

  function loopToggle() {
    state.loopOne = !state.loopOne;
    setLoopGlyph(state.loopOne);
    saveState();
  }

  function ambientToggle() {
    state.on = !state.on;
    setOnOffGlyph(state.on);
    setStateAttr(state.on ? null : "off");
    if (state.on) {
      if (player) {
        try { player.playVideo(); } catch (_) {}
      } else {
        attemptInitialPlay();
      }
    } else {
      if (player) {
        try { player.pauseVideo(); } catch (_) {}
      }
      showNeedsTap(false);
    }
    saveState();
  }

  function dismiss() {
    state.dismissed = true;
    setDismissedAttr(true);
    saveState();
  }

  function restore() {
    state.dismissed = false;
    setDismissedAttr(false);
    saveState();
  }

  function setVolume(v) {
    const n = Math.max(0, Math.min(100, Math.round(v)));
    state.volume = n;
    if (player) {
      try { player.setVolume(n); } catch (_) {}
    }
    saveState();
  }

  // ---------------- Overlay coordination (K24k) ----------------
  // Custom-event channel: wuld:overlay:open / wuld:overlay:close
  // Any overlay component (theater-mode, future lightbox, modal,
  // full-screen reader) dispatches these events on document. The
  // ambient player pauses on :open if it was playing, and resumes
  // on :close. The state.on toggle is unchanged - the pause is a
  // courtesy hold, not a user dismissal.

  function onOverlayOpen() {
    if (!player) return;
    let st = -1;
    try { st = player.getPlayerState(); } catch (_) {}
    const YTState = window.YT && window.YT.PlayerState;
    if (!YTState) return;
    if (st === YTState.PLAYING || st === YTState.BUFFERING) {
      overlayPauseResumeNeeded = true;
      try { player.pauseVideo(); } catch (_) {}
    } else {
      overlayPauseResumeNeeded = false;
    }
  }

  function onOverlayClose() {
    if (!player) return;
    if (overlayPauseResumeNeeded && state.on) {
      try { player.playVideo(); } catch (_) {}
    }
    overlayPauseResumeNeeded = false;
  }

  // ---------------- Boot ----------------

  function bindControls() {
    if (elements.playpause) {
      elements.playpause.addEventListener("click", togglePlayPause);
    }
    if (elements.skip) {
      elements.skip.addEventListener("click", skip);
    }
    if (elements.shuffle) {
      elements.shuffle.addEventListener("click", shuffleToggle);
      setShuffleGlyph(state.shuffleOn);
    }
    if (elements.loop) {
      elements.loop.addEventListener("click", loopToggle);
      setLoopGlyph(state.loopOne);
    }
    if (elements.onoff) {
      elements.onoff.addEventListener("click", ambientToggle);
      setOnOffGlyph(state.on);
    }
    if (elements.volume) {
      elements.volume.value = String(state.volume);
      elements.volume.addEventListener("input", (e) => {
        setVolume(parseInt(e.target.value, 10) || 0);
      });
    }
    if (elements.dismiss) {
      elements.dismiss.addEventListener("click", dismiss);
    }
    if (elements.sliver) {
      elements.sliver.addEventListener("click", restore);
      elements.sliver.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          restore();
        }
      });
    }
  }

  function init() {
    const root = document.getElementById("ambient-player");
    if (!root) return;
    elements = {
      root: root,
      track: document.getElementById("ambient-track"),
      playpause: document.getElementById("ambient-playpause"),
      skip: document.getElementById("ambient-skip"),
      shuffle: document.getElementById("ambient-shuffle"),
      loop: document.getElementById("ambient-loop"),
      volume: document.getElementById("ambient-volume"),
      onoff: document.getElementById("ambient-onoff"),
      dismiss: document.getElementById("ambient-dismiss"),
      sliver: document.getElementById("ambient-sliver")
    };

    bindControls();
    root.hidden = false;

    if (!state.on) setStateAttr("off");
    if (state.dismissed) setDismissedAttr(true);

    loadYouTubeAPI();

    window.addEventListener("beforeunload", () => {
      captureNowPlaying();
      saveState();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        captureNowPlaying();
        saveState();
      }
    });

    // K24k: overlay coordination via custom events
    document.addEventListener("wuld:overlay:open", onOverlayOpen);
    document.addEventListener("wuld:overlay:close", onOverlayClose);

    window.WuldAmbient = {
      toggle: ambientToggle,
      setVolume: setVolume,
      skip: skip,
      shuffleToggle: shuffleToggle,
      loopToggle: loopToggle,
      dismiss: dismiss,
      restore: restore,
      getState: () => Object.assign({}, state)
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
