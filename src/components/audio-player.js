/* ============================================================
   wuld.ink — audio player controller
   Hydrates all .audio-block elements on the page. Builds R2 URLs
   from a configurable base + per-block data-audio-key.
   Stops any other playing block when a new one starts (one-at-a-time).
   ============================================================ */

(() => {
  "use strict";

  // Audio host. Switch to "https://audio.wuld.ink" once the R2 custom
  // subdomain is wired (planned for session E). For now, override per
  // page by setting <body data-audio-base="https://pub-xxx.r2.dev"> or
  // by assigning window.WULD_AUDIO_BASE before this script runs.
  const DEFAULT_BASE = "https://audio.wuld.ink";

  function getAudioBase() {
    if (typeof window !== "undefined" && window.WULD_AUDIO_BASE) {
      return window.WULD_AUDIO_BASE;
    }
    const body = document.body;
    if (body && body.dataset.audioBase) return body.dataset.audioBase;
    return DEFAULT_BASE;
  }

  function fmtTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // Track currently-playing block so we can stop it when another starts.
  let activeBlock = null;

  function hydrate(block) {
    const key = block.dataset.audioKey;
    if (!key) {
      console.warn("[audio] .audio-block missing data-audio-key", block);
      return;
    }

    const playBtn   = block.querySelector(".audio-play");
    const progress  = block.querySelector(".audio-progress");
    const progBar   = block.querySelector(".audio-progress-bar");
    const timeEl    = block.querySelector(".audio-time");

    if (!playBtn || !progress || !progBar || !timeEl) {
      console.warn("[audio] .audio-block missing required children", block);
      return;
    }

    const url = `${getAudioBase()}/${key}`;
    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = url;

    block.dataset.state = "loading";
    block.dataset.playing = "false";

    audio.addEventListener("loadedmetadata", () => {
      block.dataset.state = "ready";
      timeEl.textContent = fmtTime(audio.duration);
    });

    audio.addEventListener("error", () => {
      block.dataset.state = "error";
      timeEl.textContent = "—:—";
      playBtn.setAttribute("aria-label", "Narration unavailable");
      playBtn.disabled = true;
    });

    audio.addEventListener("timeupdate", () => {
      if (!audio.duration) return;
      const pct = (audio.currentTime / audio.duration) * 100;
      progBar.style.width = `${pct}%`;
      timeEl.textContent = fmtTime(audio.duration - audio.currentTime);
    });

    audio.addEventListener("ended", () => {
      block.dataset.playing = "false";
      progBar.style.width = "0%";
      timeEl.textContent = fmtTime(audio.duration);
      if (activeBlock === block) activeBlock = null;
      playBtn.setAttribute("aria-label", "Play narration");
    });

    playBtn.addEventListener("click", () => {
      const isPlaying = block.dataset.playing === "true";
      if (isPlaying) {
        audio.pause();
        block.dataset.playing = "false";
        playBtn.setAttribute("aria-label", "Play narration");
        if (activeBlock === block) activeBlock = null;
      } else {
        // Stop any other active block
        if (activeBlock && activeBlock !== block) {
          const evt = new CustomEvent("wuld:audio-stop");
          activeBlock.dispatchEvent(evt);
        }
        audio.play().then(() => {
          block.dataset.playing = "true";
          activeBlock = block;
          playBtn.setAttribute("aria-label", "Pause narration");
        }).catch((err) => {
          console.warn("[audio] play failed:", err);
          block.dataset.state = "error";
        });
      }
    });

    // External stop event (so the controller can stop other blocks)
    block.addEventListener("wuld:audio-stop", () => {
      audio.pause();
      block.dataset.playing = "false";
      playBtn.setAttribute("aria-label", "Play narration");
    });

    // Click on progress bar to seek
    progress.addEventListener("click", (e) => {
      if (!audio.duration) return;
      const rect = progress.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      audio.currentTime = Math.max(0, Math.min(audio.duration, ratio * audio.duration));
    });

    // Keyboard seeking on focused play button
    playBtn.addEventListener("keydown", (e) => {
      if (!audio.duration) return;
      if (e.key === "ArrowRight") {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        audio.currentTime = Math.max(0, audio.currentTime - 5);
        e.preventDefault();
      }
    });
  }

  function init() {
    const blocks = document.querySelectorAll(".audio-block");
    blocks.forEach(hydrate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
