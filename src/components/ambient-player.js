/* ============================================================
   wuld.ink - ambient background player controller
   Hidden YouTube IFrame loading a curated playlist via
   youtube-nocookie.com. localStorage state persists across
   navigation; first-interaction listener works around browser
   autoplay policy hard-block.

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
    shuffleOn: true
  };

  let state    = readState();
  let player   = null;          // YT.Player instance
  let apiBooted = false;        // YT iframe API script loaded?
  let initInteractionBound = false;
  let saveInterval = null;
  let initialPlayAttempted = false;
  let elements = {};            // cached DOM refs

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
    // YT IFrame API uses a global callback. Define it before injecting the script.
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
    // origin param helps YouTube postMessage routing; only set when known.
    try { playerVars.origin = window.location.origin; } catch (_) {}

    // Construct player into the <div id="ambient-iframe">. YT replaces the
    // div with an <iframe>.
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
    // If we have a saved currentVideoId, try to resume that exact video.
    // The playlist may not be fully loaded yet; defer briefly.
    setTimeout(resumeFromSavedState, 600);

    if (state.on) {
      attemptInitialPlay();
    } else {
      setStateAttr("off");
    }

    // Periodic state save (every STATE_SAVE_MS while playing) keeps the
    // resume position fresh in case the user closes the tab without
    // triggering beforeunload (e.g., mobile background-kill).
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
          // Small extra delay so the video is loaded enough to seek.
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
    // After ~1.2s, check if playback actually started. If not, browser
    // autoplay policy blocked us - bind first-interaction listener +
    // surface the "tap to start" CTA.
    setTimeout(() => {
      if (!player) return;
      let st = -1;
      try { st = player.getPlayerState(); } catch (_) {}
      // YT.PlayerState.PLAYING === 1, BUFFERING === 3
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
    // Glyph swap on playpause button
    if (evt.data === YTState.PLAYING) {
      setPlayPauseGlyph(true);
      showNeedsTap(false);
      refreshTrackName();
    } else if (evt.data === YTState.PAUSED || evt.data === YTState.ENDED) {
      setPlayPauseGlyph(false);
    } else if (evt.data === YTState.CUED) {
      refreshTrackName();
    }
    captureNowPlaying();
  }

  function onPlayerError(evt) {
    // Video unavailable (e.g., region-locked or removed). Skip onward.
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

  function setStateAttr(s) {
    if (!elements.root) return;
    if (s) elements.root.setAttribute("data-state", s);
    else   elements.root.removeAttribute("data-state");
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

  function ambientToggle() {
    state.on = !state.on;
    setOnOffGlyph(state.on);
    setStateAttr(state.on ? null : "off");
    if (state.on) {
      // Boot or resume.
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

  function setVolume(v) {
    const n = Math.max(0, Math.min(100, Math.round(v)));
    state.volume = n;
    if (player) {
      try { player.setVolume(n); } catch (_) {}
    }
    saveState();
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
      volume: document.getElementById("ambient-volume"),
      onoff: document.getElementById("ambient-onoff")
    };

    bindControls();
    root.hidden = false;

    if (!state.on) setStateAttr("off");

    // Always boot the API even when state.on is false - so the user can
    // toggle on without a page reload. (The iframe loads silently with
    // autoplay=0; no network cost beyond YT's standard player chrome.)
    loadYouTubeAPI();

    // Save on navigation
    window.addEventListener("beforeunload", () => {
      captureNowPlaying();
      saveState();
    });
    // Save on tab visibility change (mobile background-kill mitigation)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        captureNowPlaying();
        saveState();
      }
    });

    // Expose public surface
    window.WuldAmbient = {
      toggle: ambientToggle,
      setVolume: setVolume,
      skip: skip,
      shuffleToggle: shuffleToggle,
      getState: () => Object.assign({}, state)
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
