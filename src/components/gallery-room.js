/* ============================================================
   gallery-room.js — K87. Shared renderer for /gallery/ and the
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
   ============================================================ */
(function() {
  'use strict';
  var CONSENT_KEY = 'wuld:gallery-consent';
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

  var MEDIA_BASE = 'https://audio.wuld.ink';
  var PLATES = [];
  var CATS = {};
  var CAT_ORDER = [];
  var revealed = false;

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

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
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

  function plateCard(p) {
    var art = el('article', 'gallery-plate');
    art.setAttribute('data-plate', (p.order < 10 ? '0' : '') + p.order);
    if (isGated(p)) art.setAttribute('data-nsfw', 'true');
    var fig = el('figure', 'gallery-plate-figure');
    fig.appendChild(mediaEl(p));
    var tier = tierOf(p);
    if (tier !== 'none') {
      var cap = el('figcaption', 'gallery-plate-caption');
      cap.appendChild(el('span', 'gallery-plate-num', 'Plate ' + p.num));
      cap.appendChild(el('h2', 'gallery-plate-title', p.title || ('Plate ' + p.num)));
      if (tier === 'full') {
        if (p.technique) cap.appendChild(el('p', 'gallery-plate-technique', p.technique));
        if (p.body) cap.appendChild(el('p', 'gallery-plate-body', p.body));
        if (p.epitaph) cap.appendChild(el('p', 'gallery-plate-epitaph', p.epitaph));
      }
      fig.appendChild(cap);
    }
    art.appendChild(fig);
    return art;
  }

  function withheldCard(p) {
    var art = el('article', 'gallery-plate gallery-plate-withheld');
    art.setAttribute('data-plate', (p.order < 10 ? '0' : '') + p.order);
    var inner = el('div', 'gallery-withheld-inner');
    inner.appendChild(el('span', 'gallery-plate-num', 'Plate ' + p.num));
    inner.appendChild(el('p', 'gallery-withheld-note',
      'Withheld. Flagged: ' + (p.content_flags || []).join(', ') +
      '. Reveal runs through the consent gate above.'));
    art.appendChild(inner);
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

  function render() {
    grid.textContent = '';
    var visible = PLATES.filter(function(p) { return !isSealed(p) && plateRoom(p) === ROOM; });
    if (!visible.length) {
      grid.appendChild(el('p', 'gallery-empty', 'This room is empty. The vessel precedes the cargo.'));
      if (statusEl) statusEl.textContent = '0 plates currently flagged in this room.';
      if (heroCurrent) heroCurrent.textContent = 'Currently: 0 plates.';
      return;
    }
    var gated = 0;
    visible.forEach(function(p) {
      if (isGated(p)) {
        gated++;
        grid.appendChild(revealed ? plateCard(p) : withheldCard(p));
      } else {
        grid.appendChild(plateCard(p));
      }
    });
    if (statusEl) statusEl.textContent = gated + (gated === 1 ? ' plate' : ' plates') + ' currently flagged in this room.';
    if (heroCurrent) {
      if (catIndex) {
        var totP = PLATES.filter(function(p) { return !isSealed(p); }).length;
        var rmP = CAT_ORDER.filter(function(s) { return PLATES.some(function(p) { return !isSealed(p) && plateRoom(p) === s; }); }).length;
        heroCurrent.textContent = 'Currently: ' + totP + ' plates across ' + rmP + ' rooms.';
      } else {
        heroCurrent.textContent = 'Currently: ' + visible.length + ' plates.';
      }
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
    var num = plate.querySelector('.gallery-plate-num');
    var title = plate.querySelector('.gallery-plate-title');
    lbImg.setAttribute('src', src);
    lbImg.setAttribute('alt', title ? title.textContent : '');
    capNum.textContent = num ? num.textContent : '';
    capTitle.textContent = title ? title.textContent : '';
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
    });
  }

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
      setToggleUI();
      render();
      renderCatIndex();
    })
    .catch(function() {
      grid.textContent = '';
      grid.appendChild(el('p', 'gallery-empty', 'The manifest failed to load. The plates are unharmed — reload, or return later.'));
    });
})();
