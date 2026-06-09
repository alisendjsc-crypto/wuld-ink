/* ============================================================
   gallery-room.js — K95. Shared renderer for /gallery/ and the
   category sub-rooms. The page declares its room via
   <body data-gallery-category="<slug>">; everything else comes
   from /gallery/manifest.json (schema_version 2).

   Schema v2 (authoritative copy: /gallery/ page head comment):
     categories: [ { slug, name, caption_tier } ]
     plates[]:   + category (default "editorial")
                 + media { kind: "image"|"video", poster? }
                 + caption_tier "" -> cascade: plate -> category -> "full"

   CONSENT DISCIPLINE (K83, media-agnostic): flagged plates render
   as withheld cards — no img, no video, no poster in the DOM —
   until the consent interstitial passes. localStorage
   "wuld:gallery-consent" persists consent; reveal resets per visit.
   Lightbox (K27, delegation) covers images; videos use native
   controls with preload="none" (click-to-play, zero network cost
   before interaction).

   K94 NAVIGABILITY: a controls bar (search + series chips) is
   injected above the grid where it earns its place. Filtering
   re-renders the grid (the K27 lightbox click delegation lives on
   the grid, so it survives the rebuild; visiblePlates() recomputes).
   - Search: shown on the LOBBY (the page carrying
     #gallery-category-index — scope = ALL non-sealed plates, every
     room) and on any room with >12 plates (scope = that room).
     Consent-safe: flagged matches render as withheld result cards
     pre-consent, identical to in-room. Matches over
     id+title+technique+body+series+category.
   - Series chips: shown on any non-lobby room with >=2 non-empty
     series (today: main-character, 18 series / 436 plates).
     Single-select + "All"; each chip carries its count.
   K95 FAVORITES + PLATE-# SEARCH:
   - A per-plate star (.gallery-star, figure corner) toggles the
     plate id in localStorage "wuld:gallery-saved". Id-based, so it
     works on withheld cards pre-consent (no media enters the DOM);
     the star is a <button>, never an img, so the K27 lightbox
     delegation ignores it.
   - A "Saved (N)" toggle rides the controls bar on every page
     (the bar now builds wherever there are plates). Active ->
     restricts the scope to saved ids; composes AND with search;
     clears the active series chip; on the lobby it spans all rooms.
   - Plate-number search: a pure-digit or "plate NNN" query matches
     by NUMERIC plate number (numToInt handles editorial Roman
     I..XXVII and arabic 001..436), so "1" / "001" / "plate 001"
     all surface every plate numbered 1 across rooms; digit queries
     no longer collide with id hashes. Word queries keep the
     id+title+... substring search.
   Plate id is surfaced in the lightbox caption for reference; the
   lightbox reads metadata off the card, so caption-less ("none"
   tier) plates still carry num/title/id there. No new pages, no
   manifest schema change.
   ============================================================ */
(function() {
  'use strict';
  var CONSENT_KEY = 'wuld:gallery-consent';
  var SAVED_KEY = 'wuld:gallery-saved';
  var ROOM = (document.body.getAttribute('data-gallery-category') || 'editorial');
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var statusEl = document.getElementById('gallery-nsfw-status');
  var toggleBtn = document.getElementById('gallery-nsfw-toggle');
  var heroCurrent = document.getElementById('gallery-current');
  var consentEl = document.getElementById('gallery-consent');
  var consentYes = document.getElementById('gallery-consent-confirm');
  var consentNo = document.getElementById('gallery-consent-decline');
  var catIndex = document.getElementById('gallery-category-index');
  var catGrid = document.getElementById('gallery-cat-grid');
  var isLobby = !!catIndex;

  var MEDIA_BASE = 'https://audio.wuld.ink';
  var PLATES = [];
  var CATS = {};
  var CAT_ORDER = [];
  var revealed = false;
  var FILTER = { q: '', series: '', saved: false };
  var SAVED = {};
  var searchInput = null;
  var chipsWrap = null;
  var countEl = null;
  var savedBtn = null;
  var savedCountEl = null;
  var searchTimer = null;

  function hasConsent() {
    try { return !!localStorage.getItem(CONSENT_KEY); } catch (e) { return false; }
  }
  function storeConsent() {
    try { localStorage.setItem(CONSENT_KEY, new Date().toISOString()); } catch (e) {}
  }
  function isGated(p) { return (p.content_flags || []).indexOf('nsfw') !== -1; }
  function isSealed(p) { return p.tier === 'sealed'; }
  function plateRoom(p) { return p.category || 'editorial'; }
  function tierOf(p) {
    if (p.caption_tier) return p.caption_tier;
    var c = CATS[plateRoom(p)];
    if (c && c.caption_tier) return c.caption_tier;
    return 'full';
  }
  function mediaKind(p) { return (p.media && p.media.kind) || 'image'; }
  function plateAlt(p) {
    return 'Plate ' + p.num + (p.title ? ' — ' + p.title : '');
  }
  function roomName(slug) { return (CATS[slug] && CATS[slug].name) || slug; }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  /* ---- saved store (K95, localStorage "wuld:gallery-saved") ---- */
  function loadSaved() {
    try {
      var raw = localStorage.getItem(SAVED_KEY);
      if (!raw) return;
      var arr = JSON.parse(raw);
      if (Object.prototype.toString.call(arr) === '[object Array]') {
        arr.forEach(function(id) { if (id) SAVED[id] = true; });
      }
    } catch (e) {}
  }
  function persistSaved() {
    try {
      var arr = [];
      for (var k in SAVED) { if (SAVED[k]) arr.push(k); }
      localStorage.setItem(SAVED_KEY, JSON.stringify(arr));
    } catch (e) {}
  }
  function isSaved(id) { return !!(id && SAVED[id]); }
  function toggleSaved(id) {
    if (!id) return false;
    if (SAVED[id]) { delete SAVED[id]; } else { SAVED[id] = true; }
    persistSaved();
    return !!SAVED[id];
  }
  function inScopeSavedCount() {
    var n = 0;
    scopePlates().forEach(function(p) { if (isSaved(p.id)) n++; });
    return n;
  }

  /* ---- plate-number parsing (K95): editorial num is Roman
         I..XXVII, every other room is arabic 001..436 ---- */
  function romanToInt(s) {
    var map = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
    var total = 0, prev = 0;
    for (var i = s.length - 1; i >= 0; i--) {
      var v = map[s.charAt(i)];
      if (v === undefined) return NaN;
      if (v < prev) { total -= v; } else { total += v; prev = v; }
    }
    return total;
  }
  function numToInt(num) {
    if (num === undefined || num === null) return NaN;
    var str = String(num).trim().toLowerCase();
    if (/^\d+$/.test(str)) return parseInt(str, 10);
    if (/^[ivxlcdm]+$/.test(str)) return romanToInt(str);
    return NaN;
  }
  function plateQueryNum(q) {
    var m = /^(?:plate\s*)?#?\s*0*(\d+)$/.exec(q);
    return m ? parseInt(m[1], 10) : null;
  }

  /* ---- K94 filter helpers (pure over plate objects) ---- */
  function searchBlob(p) {
    return [p.id, p.title, p.technique, p.body, p.series, plateRoom(p)]
      .join(' ').toLowerCase();
  }
  function scopePlates() {
    /* lobby: every non-sealed plate (all rooms). room: this room only. */
    return PLATES.filter(function(p) {
      if (isSealed(p)) return false;
      return isLobby ? true : plateRoom(p) === ROOM;
    });
  }
  function defaultPlates() {
    /* lobby default view (no filter) = editorial only; room default = whole room. */
    if (isLobby) {
      return PLATES.filter(function(p) { return !isSealed(p) && plateRoom(p) === 'editorial'; });
    }
    return scopePlates();
  }
  function hasFilter() { return !!(FILTER.q || FILTER.series || FILTER.saved); }
  function matchedPlates() {
    var q = FILTER.q, s = FILTER.series;
    var pnum = q ? plateQueryNum(q) : null;
    return scopePlates().filter(function(p) {
      if (FILTER.saved && !isSaved(p.id)) return false;
      if (s && p.series !== s) return false;
      if (q) {
        if (pnum !== null) {
          if (numToInt(p.num) !== pnum) return false;
        } else if (searchBlob(p).indexOf(q) === -1) {
          return false;
        }
      }
      return true;
    });
  }
  function roomSeries() {
    /* distinct non-empty series within scope, with counts, count desc then name. */
    var counts = {};
    scopePlates().forEach(function(p) {
      if (!p.series) return;
      counts[p.series] = (counts[p.series] || 0) + 1;
    });
    return Object.keys(counts).map(function(s) {
      return { series: s, count: counts[s] };
    }).sort(function(a, b) {
      return b.count - a.count || (a.series < b.series ? -1 : 1);
    });
  }
  function chipLabel(series) {
    var s = series;
    if (s.indexOf(ROOM + '-') === 0) s = s.slice(ROOM.length + 1);
    return s.replace(/-/g, ' ');
  }

  function mediaEl(p) {
    if (mediaKind(p) === 'video') {
      var v = document.createElement('video');
      v.className = 'gallery-plate-video';
      v.controls = true;
      v.preload = 'none';
      v.src = MEDIA_BASE + '/' + p.r2key;
      if (p.media && p.media.poster) v.poster = MEDIA_BASE + '/' + p.media.poster;
      v.setAttribute('aria-label', plateAlt(p));
      return v;
    }
    var img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.className = 'gallery-plate-img';
    img.src = MEDIA_BASE + '/' + p.r2key;
    img.alt = plateAlt(p);
    return img;
  }

  function tagCard(art, p) {
    art.setAttribute('data-plate', (p.order < 10 ? '0' : '') + p.order);
    art.setAttribute('data-plate-id', p.id || '');
    art.setAttribute('data-num', p.num || '');
    art.setAttribute('data-title', p.title || '');
  }
  function roomBadge(p) {
    return el('span', 'gallery-plate-room', roomName(plateRoom(p)));
  }

  /* ---- saved star (K95) ---- */
  function starBtn(p) {
    var on = isSaved(p.id);
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'gallery-star' + (on ? ' is-saved' : '');
    b.setAttribute('data-star-id', p.id || '');
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.setAttribute('aria-label', on ? 'Saved — remove from your list' : 'Save to your list');
    b.setAttribute('title', on ? 'Saved — click to remove' : 'Save to your list');
    b.textContent = '★';
    return b;
  }

  function plateCard(p, withRoom) {
    var art = el('article', 'gallery-plate');
    tagCard(art, p);
    if (isGated(p)) art.setAttribute('data-nsfw', 'true');
    var fig = el('figure', 'gallery-plate-figure');
    fig.appendChild(mediaEl(p));
    var tier = tierOf(p);
    if (tier !== 'none' || withRoom) {
      var cap = el('figcaption', 'gallery-plate-caption');
      cap.appendChild(el('span', 'gallery-plate-num', 'Plate ' + p.num));
      if (tier !== 'none') {
        cap.appendChild(el('h2', 'gallery-plate-title', p.title || ('Plate ' + p.num)));
        if (tier === 'full') {
          if (p.technique) cap.appendChild(el('p', 'gallery-plate-technique', p.technique));
          if (p.body) cap.appendChild(el('p', 'gallery-plate-body', p.body));
          if (p.epitaph) cap.appendChild(el('p', 'gallery-plate-epitaph', p.epitaph));
        }
      }
      if (withRoom) cap.appendChild(roomBadge(p));
      fig.appendChild(cap);
    }
    art.appendChild(fig);
    art.appendChild(starBtn(p));
    return art;
  }

  function withheldCard(p, withRoom) {
    var art = el('article', 'gallery-plate gallery-plate-withheld');
    tagCard(art, p);
    var inner = el('div', 'gallery-withheld-inner');
    inner.appendChild(el('span', 'gallery-plate-num', 'Plate ' + p.num));
    inner.appendChild(el('p', 'gallery-withheld-note',
      'Withheld. Flagged: ' + (p.content_flags || []).join(', ') +
      '. Reveal runs through the consent gate above.'));
    if (withRoom) inner.appendChild(roomBadge(p));
    art.appendChild(inner);
    art.appendChild(starBtn(p));
    return art;
  }

  function renderCatIndex() {
    if (!catIndex || !catGrid) return;
    catGrid.textContent = '';
    var shown = 0;
    CAT_ORDER.forEach(function(slug) {
      if (slug === ROOM) return;
      var n = 0, flagged = 0;
      PLATES.forEach(function(p) {
        if (isSealed(p) || plateRoom(p) !== slug) return;
        n++;
        if (isGated(p)) flagged++;
      });
      if (!n) return;
      var card = el('a', 'gallery-cat-card');
      card.href = '/gallery/' + slug + '/';
      card.appendChild(el('span', 'gallery-cat-name', CATS[slug].name || slug));
      card.appendChild(el('span', 'gallery-cat-meta',
        n + (n === 1 ? ' plate' : ' plates') + (flagged ? ' · ' + flagged + ' flagged' : '')));
      catGrid.appendChild(card);
      shown++;
    });
    if (shown) { catIndex.removeAttribute('hidden'); }
    else { catIndex.setAttribute('hidden', ''); }
  }

  function updateStatus() {
    if (!statusEl) return;
    /* flagged count is the room's own (stable; does not chase the active filter). */
    var base = isLobby
      ? PLATES.filter(function(p) { return !isSealed(p) && plateRoom(p) === ROOM; })
      : scopePlates();
    var g = base.filter(isGated).length;
    statusEl.textContent = g + (g === 1 ? ' plate' : ' plates') + ' currently flagged in this room.';
  }
  function updateHero() {
    if (!heroCurrent) return;
    if (catIndex) {
      var totP = PLATES.filter(function(p) { return !isSealed(p); }).length;
      var rmP = CAT_ORDER.filter(function(s) {
        return PLATES.some(function(p) { return !isSealed(p) && plateRoom(p) === s; });
      }).length;
      heroCurrent.textContent = 'Currently: ' + totP + ' plates across ' + rmP + ' rooms.';
    } else {
      heroCurrent.textContent = 'Currently: ' + scopePlates().length + ' plates.';
    }
  }
  function updateCount(n) {
    if (!countEl) return;
    if (FILTER.saved) {
      countEl.textContent = n + ' saved';
    } else if (hasFilter()) {
      countEl.textContent = n + (n === 1 ? ' result' : ' results');
    } else if (isLobby) {
      countEl.textContent = 'search all ' + scopePlates().length + ' plates';
    } else {
      countEl.textContent = n + (n === 1 ? ' plate' : ' plates');
    }
  }

  function render() {
    grid.textContent = '';
    var withRoom = isLobby && hasFilter();
    var setTo = hasFilter() ? matchedPlates() : defaultPlates();

    if (!setTo.length) {
      grid.appendChild(el('p', 'gallery-empty', hasFilter()
        ? 'No plates match that filter.'
        : 'This room is empty. The vessel precedes the cargo.'));
    } else {
      setTo.forEach(function(p) {
        if (isGated(p) && !revealed) {
          grid.appendChild(withheldCard(p, withRoom));
        } else {
          grid.appendChild(plateCard(p, withRoom));
        }
      });
    }

    /* the category index is routing chrome — hide it while the lobby shows results. */
    if (catIndex) {
      if (withRoom) catIndex.setAttribute('hidden', '');
      else catIndex.removeAttribute('hidden');
    }

    updateStatus();
    updateHero();
    updateCount(setTo.length);
  }

  /* ---- K94 controls bar ---- */
  function makeChip(series, label, count) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'gallery-chip';
    b.setAttribute('data-series', series);
    b.setAttribute('aria-pressed', series === FILTER.series ? 'true' : 'false');
    if (series === FILTER.series) b.classList.add('is-active');
    b.appendChild(el('span', 'gallery-chip-label', label));
    b.appendChild(el('span', 'gallery-chip-count', String(count)));
    return b;
  }
  function syncChips() {
    if (!chipsWrap) return;
    Array.prototype.forEach.call(chipsWrap.querySelectorAll('.gallery-chip'), function(b) {
      var on = b.getAttribute('data-series') === FILTER.series;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) b.classList.add('is-active'); else b.classList.remove('is-active');
    });
  }
  function makeSavedToggle() {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'gallery-saved-toggle' + (FILTER.saved ? ' is-active' : '');
    b.id = 'gallery-saved-toggle';
    b.setAttribute('aria-pressed', FILTER.saved ? 'true' : 'false');
    b.appendChild(el('span', 'gallery-saved-star', '★'));
    b.appendChild(el('span', 'gallery-saved-label', 'Saved'));
    savedCountEl = el('span', 'gallery-saved-count', String(inScopeSavedCount()));
    savedCountEl.id = 'gallery-saved-count';
    b.appendChild(savedCountEl);
    return b;
  }
  function updateSavedToggle() {
    if (savedCountEl) savedCountEl.textContent = String(inScopeSavedCount());
    if (savedBtn) {
      savedBtn.setAttribute('aria-pressed', FILTER.saved ? 'true' : 'false');
      if (FILTER.saved) savedBtn.classList.add('is-active');
      else savedBtn.classList.remove('is-active');
    }
  }

  function buildControls() {
    if (document.getElementById('gallery-controls')) return;
    if (!scopePlates().length) return;
    var seriesList = roomSeries();
    var showChips = !isLobby && seriesList.length >= 2;
    var showSearch = isLobby || scopePlates().length > 12;

    var bar = el('div', 'gallery-controls');
    bar.id = 'gallery-controls';

    if (showSearch) {
      var lab = el('label', 'gallery-search-label');
      lab.setAttribute('for', 'gallery-search');
      lab.appendChild(el('span', 'gallery-search-tag', 'Search'));
      var inp = document.createElement('input');
      inp.type = 'search';
      inp.id = 'gallery-search';
      inp.className = 'gallery-search';
      inp.setAttribute('autocomplete', 'off');
      inp.setAttribute('placeholder', isLobby ? 'search all rooms…' : 'search this room…');
      lab.appendChild(inp);
      bar.appendChild(lab);
      searchInput = inp;
    }

    savedBtn = makeSavedToggle();
    bar.appendChild(savedBtn);

    countEl = el('span', 'gallery-result-count');
    countEl.id = 'gallery-result-count';
    bar.appendChild(countEl);

    if (showChips) {
      chipsWrap = el('div', 'gallery-chips');
      chipsWrap.id = 'gallery-chips';
      chipsWrap.appendChild(makeChip('', 'all', scopePlates().length));
      seriesList.forEach(function(row) {
        chipsWrap.appendChild(makeChip(row.series, chipLabel(row.series), row.count));
      });
      bar.appendChild(chipsWrap);
    }

    grid.parentNode.insertBefore(bar, grid);

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        var v = searchInput.value.trim().toLowerCase();
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(function() { FILTER.q = v; render(); }, 120);
      });
    }
    savedBtn.addEventListener('click', function() {
      FILTER.saved = !FILTER.saved;
      if (FILTER.saved) { FILTER.series = ''; syncChips(); }
      updateSavedToggle();
      render();
    });
    if (chipsWrap) {
      chipsWrap.addEventListener('click', function(e) {
        var b = e.target && e.target.closest ? e.target.closest('.gallery-chip') : null;
        if (!b) return;
        var s = b.getAttribute('data-series') || '';
        FILTER.series = (FILTER.series === s) ? '' : s;
        if (FILTER.series && FILTER.saved) { FILTER.saved = false; updateSavedToggle(); }
        syncChips();
        render();
      });
    }
  }

  function setToggleUI() {
    if (revealed) {
      document.body.setAttribute('data-nsfw-revealed', 'true');
    } else {
      document.body.removeAttribute('data-nsfw-revealed');
    }
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', revealed ? 'true' : 'false');
      toggleBtn.textContent = revealed ? '[ NSFW — visible ]' : '[ NSFW — hidden ]';
    }
  }

  function openConsent() {
    if (!consentEl) return;
    consentEl.setAttribute('data-open', 'true');
    if (consentYes) consentYes.focus();
  }
  function closeConsent() {
    if (consentEl) consentEl.setAttribute('data-open', 'false');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
      if (revealed) { revealed = false; setToggleUI(); render(); return; }
      if (hasConsent()) { revealed = true; setToggleUI(); render(); return; }
      openConsent();
    });
  }
  if (consentYes) {
    consentYes.addEventListener('click', function() {
      storeConsent();
      closeConsent();
      revealed = true;
      setToggleUI();
      render();
    });
  }
  if (consentNo) {
    consentNo.addEventListener('click', function() { closeConsent(); });
  }

  /* ---- lightbox (K27 logic, delegation-adapted; images only —
         videos carry native controls) ---- */
  var overlay = document.getElementById('gallery-lightbox');
  var lbImg = document.getElementById('gallery-lightbox-img');
  var capNum = document.getElementById('gallery-lightbox-caption-num');
  var capTitle = document.getElementById('gallery-lightbox-caption-title');
  var btnClose = document.getElementById('gallery-lightbox-close');
  var btnPrev = document.getElementById('gallery-lightbox-prev');
  var btnNext = document.getElementById('gallery-lightbox-next');
  var currentIdx = -1;

  function visiblePlates() {
    return Array.prototype.slice.call(grid.querySelectorAll('.gallery-plate')).filter(function(p) {
      return p.offsetParent !== null && p.querySelector('.gallery-plate-img');
    });
  }

  function lbOpen(idx) {
    var vis = visiblePlates();
    if (!vis.length) return;
    currentIdx = ((idx % vis.length) + vis.length) % vis.length;
    var plate = vis[currentIdx];
    var src = plate.querySelector('.gallery-plate-img').getAttribute('src');
    var num = plate.getAttribute('data-num');
    var title = plate.getAttribute('data-title');
    var pid = plate.getAttribute('data-plate-id');
    lbImg.setAttribute('src', src);
    lbImg.setAttribute('alt', title || (num ? 'Plate ' + num : ''));
    capNum.textContent = (num ? 'Plate ' + num : '') + (pid ? '  ·  ' + pid : '');
    capTitle.textContent = title || '';
    overlay.setAttribute('data-open', 'true');
    document.body.classList.add('gallery-lightbox-open');
  }

  function lbClose() {
    overlay.setAttribute('data-open', 'false');
    document.body.classList.remove('gallery-lightbox-open');
    setTimeout(function() {
      if (overlay.getAttribute('data-open') === 'false') {
        lbImg.setAttribute('src', '');
      }
    }, 200);
  }

  function lbStep(delta) {
    var vis = visiblePlates();
    if (!vis.length || currentIdx < 0) return;
    lbOpen(currentIdx + delta);
  }

  function lbRandom() {
    var vis = visiblePlates();
    if (!vis.length) return;
    var idx = Math.floor(Math.random() * vis.length);
    if (vis.length > 1 && idx === currentIdx) idx = (idx + 1) % vis.length;
    lbOpen(idx);
  }

  if (overlay && lbImg) {
    grid.addEventListener('click', function(e) {
      var t = e.target;
      if (!t || !t.classList || !t.classList.contains('gallery-plate-img')) return;
      var plate = t.closest('.gallery-plate');
      if (!plate) return;
      var vis = visiblePlates();
      var idx = vis.indexOf(plate);
      if (idx !== -1) lbOpen(idx);
    });
    btnClose.addEventListener('click', lbClose);
    btnPrev.addEventListener('click', function() { lbStep(-1); });
    btnNext.addEventListener('click', function() { lbStep(1); });
    /* randomizer (K95) — injected so no 9-shell markup edit; jumps the
       lightbox to a random visible plate, sits near the -> arrow */
    var btnRand = document.getElementById('gallery-lightbox-random');
    if (!btnRand && btnNext.parentNode) {
      btnRand = document.createElement('button');
      btnRand.type = 'button';
      btnRand.id = 'gallery-lightbox-random';
      btnRand.className = 'gallery-lightbox-random';
      btnRand.setAttribute('aria-label', 'Random plate');
      btnRand.setAttribute('title', 'Jump to a random plate (press r)');
      btnRand.textContent = '[ random ]';
      btnNext.parentNode.insertBefore(btnRand, btnNext.nextSibling);
    }
    if (btnRand) btnRand.addEventListener('click', lbRandom);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) lbClose();
    });
    lbImg.addEventListener('click', lbClose);
    document.addEventListener('keydown', function(e) {
      if (consentEl && consentEl.getAttribute('data-open') === 'true') {
        if (e.key === 'Escape') closeConsent();
        return;
      }
      if (overlay.getAttribute('data-open') !== 'true') return;
      if (e.key === 'Escape') { lbClose(); }
      else if (e.key === 'ArrowLeft') { lbStep(-1); }
      else if (e.key === 'ArrowRight') { lbStep(1); }
      else if (e.key === 'r' || e.key === 'R') { lbRandom(); }
    });
  }

  /* ---- saved-star delegation (K95; the star is a <button>, never
         .gallery-plate-img, so the lightbox handler ignores it; this
         survives grid re-renders, same as the lightbox delegation) ---- */
  grid.addEventListener('click', function(e) {
    var star = e.target && e.target.closest ? e.target.closest('.gallery-star') : null;
    if (!star) return;
    e.stopPropagation();
    var id = star.getAttribute('data-star-id');
    if (!id) return;
    var on = toggleSaved(id);
    if (on) star.classList.add('is-saved'); else star.classList.remove('is-saved');
    star.setAttribute('aria-pressed', on ? 'true' : 'false');
    star.setAttribute('aria-label', on ? 'Saved — remove from your list' : 'Save to your list');
    star.setAttribute('title', on ? 'Saved — click to remove' : 'Save to your list');
    updateSavedToggle();
    if (FILTER.saved) render();
  });

  /* ---- boot ---- */
  fetch('/gallery/manifest.json', { cache: 'no-cache' })
    .then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function(m) {
      MEDIA_BASE = (m.media_base || MEDIA_BASE).replace(/\/+$/, '');
      (m.categories || []).forEach(function(c) {
        if (!c || !c.slug) return;
        CATS[c.slug] = c;
        CAT_ORDER.push(c.slug);
      });
      PLATES = (m.plates || []).slice().sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
      loadSaved();
      buildControls();
      setToggleUI();
      render();
      renderCatIndex();
    })
    .catch(function() {
      grid.textContent = '';
      grid.appendChild(el('p', 'gallery-empty', 'The manifest failed to load. The plates are unharmed — reload, or return later.'));
    });
})();
