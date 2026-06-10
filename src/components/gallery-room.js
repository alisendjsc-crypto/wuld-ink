/* ============================================================
   gallery-room.js — K99 (+K101 video section, +K104 video theater). Shared renderer for /gallery/ and the
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
   Lightbox (K27, delegation) covers images; video cards render
   poster-only (preload="none", no inline controls) and open the
   K104 theater on click.

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
   K99 CAPTION DISCLOSURE + PRINTS SECTION:
   - Full-tier captions whose body runs past CAP_COLLAPSE_LIMIT (200)
     render collapsed behind a mono [ more ]/[ less ] <button>
     (title/num stay visible; technique/body/epitaph ride the
     collapse; the lightbox is unaffected). Delegated handler, so it
     survives grid re-renders; the toggle is never .gallery-plate-img,
     so the lightbox handler ignores it.
   - The LOBBY gains a "Prints" section directly below the category
     index. Membership = plate.print_url PRESENCE (purchasable-only;
     "featured" is an ordering signal among them, never the key).
     Cards reuse plateCard/withheldCard verbatim -- CONSENT
     DISCIPLINE HELD: flagged plates render withheld pre-consent, no
     media in the DOM (K87 contract; a Prints row is not a consent
     bypass). Hidden while search/saved results show (routing chrome,
     same rule as the category index). Lightbox nav from a Prints
     card stays within the Prints set (lbScope).
   K101 VIDEO SECTION:
   - Videos render in their OWN sub-grid below the image grid in any
     room where media kinds mix (MC today: 248 images / 188 videos;
     gore + the-wrong-thing carry videos too — generic by
     construction). A mono divider heading carries the matched count
     ("Videos — N"); the section hides at 0. Chips, search and Saved
     filter BOTH sections. Flagged video plates render withheld in
     the section pre-consent — no video element, no poster in the
     DOM (the K87 media-agnostic contract; today all 191 videos are
     flagged). Stars + caption disclosure are delegated on the
     sub-grid; the lightbox stays images-only (visiblePlates filters
     on .gallery-plate-img, and video cards live outside the main
     grid besides).
   K104 VIDEO THEATER:
   - Card videos lose inline controls: clicking a video card opens a
     JS-injected theater overlay (no 9-shell markup edit) that reuses
     the images-lightbox chrome classes under theater-own ids —
     backdrop dim + [ close ] / [ <- ] / [ -> ] / [ random ] + the
     Plate num · id caption. The stage <video> is created ON OPEN
     (src assigned then; loop=true — auto-loop lives on the theater
     element; ALL playback lives in the theater) and torn down on
     close and on every prev/next/random: one playing video at a
     time by construction. Scope = the sub-grid the open came from
     (videos sub-grid / Prints grid) so nav walks the current
     filtered set; Esc / arrows / r keyboard parity. Consent held:
     withheld cards carry no .gallery-plate-video, so they cannot
     open the theater and never enter its scope. The images lightbox
     is untouched.
   K105 STICKY REVEAL + SHARE / DEEP LINKS + LOBBY GATE PLACEMENT:
   - The NSFW toggle persists in localStorage "wuld:gallery-reveal".
     Boot composes revealed = hasConsent() && storedReveal() —
     consent PRIMACY: the stored bit alone never reveals; first-ever
     reveal still gates 18+; pre-consent withheld cards stay
     media-free (K87). Toggle-off persists off; toggle-on and
     consent-confirm persist on. Persistence kills the re-click,
     never the gate.
   - [ share ] rides the theater AND lightbox chrome (injected, no
     shell edit; .gallery-lightbox-random base class + own offsets —
     the base is absolutely positioned). Copies location.origin +
     the plate's CANONICAL room URL (/gallery/<room>/#plate-<id>;
     editorial -> /gallery/#plate-<id>) via navigator.clipboard with
     an execCommand fallback; the button text flips [ copied ]
     briefly (textContent swap, no animation). The address-bar hash
     tracks open/prev/next/random via history.replaceState (share
     always copies the CURRENT plate) and clears on close.
   - #plate-<id> routes post-render: video -> theater, image ->
     lightbox (a plate rendered twice prefers its main-grid card);
     flagged + !revealed -> scrollIntoView the withheld card ONLY —
     a deep link is NOT a consent bypass (K87). hashchange re-routes
     (replaceState never fires it).
   - LOBBY: the Prints section now inserts BELOW the NSFW bar —
     rooms index -> gate -> Prints -> editorial grid (K99's catIndex
     anchor had stranded the toggle under the Prints grid) — and the
     status line counts flagged across ALL rooms (the lobby surfaces
     every room via search + Prints; editorial-only "0 in this
     room" misled beside withheld Prints cards).
   ============================================================   - K106: pagination + browse-all. Any rendered set past 60 plates
    slices into pages -- mono [ prev ] page N / M [ next ] chrome
    above and below the grid; the page resets on every filter change
    and deep links page-locate before opening. Lobby-only
    [ browse all N ] toggle walks the whole corpus paginated (counts
    as a filter: routing chrome hides). The lobby Prints strip now
    excludes editorial plates (their grid cards carry the links).
    Flagged deep links surface the 18+ interstitial for
    never-consented visitors; a purposeful hide stays scroll-only.
    [ top ] floats in after ~1.5 viewports. K87 consent contract
    held throughout.
*/
(function() {
  'use strict';
  var CONSENT_KEY = 'wuld:gallery-consent';
  var SAVED_KEY = 'wuld:gallery-saved';
  var REVEAL_KEY = 'wuld:gallery-reveal';
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
  var browseBtn = null;
  var FILTER = { q: '', series: '', saved: false, media: '', page: 1, browse: false };
  var SAVED = {};
  var searchInput = null;
  var chipsWrap = null;
  var countEl = null;
  var savedBtn = null;
  var savedCountEl = null;
  var mediaWrap = null;
  var searchTimer = null;

  function hasConsent() {
    try { return !!localStorage.getItem(CONSENT_KEY); } catch (e) { return false; }
  }
  function storeConsent() {
    try { localStorage.setItem(CONSENT_KEY, new Date().toISOString()); } catch (e) {}
  }
  /* K105 sticky reveal: the stored bit NEVER reveals on its own —
     boot composes hasConsent() && storedReveal() (consent primacy). */
  function storedReveal() {
    try { return localStorage.getItem(REVEAL_KEY) === 'on'; } catch (e) { return false; }
  }
  function persistReveal(on) {
    try { localStorage.setItem(REVEAL_KEY, on ? 'on' : 'off'); } catch (e) {}
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

  /* ---- K99 pure helpers (kept self-contained + dependency-free:
         the unit test extracts this region verbatim) ---- */
  /* K99-PURE-START */
  var CAP_COLLAPSE_LIMIT = 200;
  function capCollapse(body) {
    return !!(body && String(body).length > CAP_COLLAPSE_LIMIT);
  }
  function printsSet(plates, catOrder) {
    var idx = {};
    (catOrder || []).forEach(function(s, i) { idx[s] = i; });
    return (plates || []).filter(function(p) {
      return !!(p && p.tier !== 'sealed' &&
        typeof p.print_url === 'string' &&
        p.print_url.indexOf('https://') === 0);
    }).sort(function(a, b) {
      var fa = a.featured ? 0 : 1, fb = b.featured ? 0 : 1;
      if (fa !== fb) return fa - fb;
      var ca = idx[a.category || 'editorial'];
      var cb = idx[b.category || 'editorial'];
      if (ca === undefined) ca = 99;
      if (cb === undefined) cb = 99;
      if (ca !== cb) return ca - cb;
      return (a.order || 0) - (b.order || 0);
    });
  }
  /* K99-PURE-END */

  /* K105-PURE-START */
  function plateUrl(p) {
    var room = (p && p.category) || 'editorial';
    var path = room === 'editorial' ? '/gallery/' : '/gallery/' + room + '/';
    return path + '#plate-' + ((p && p.id) || '');
  }
  function parsePlateHash(hash) {
    var m = /^#plate-([A-Za-z0-9_-]+)$/.exec(hash || '');
    return m ? m[1] : null;
  }
  /* K105-PURE-END */

  /* K106-PURE-START (pagination math + lobby prints filter; pure) */
  var PAGE_SIZE = 60;
  function pageCount(total, size) {
    var sz = size || PAGE_SIZE;
    return total > 0 ? Math.ceil(total / sz) : 1;
  }
  function clampPage(page, total, size) {
    var max = pageCount(total, size);
    var p = page > 0 ? Math.floor(page) : 1;
    return p > max ? max : p;
  }
  function pageSlice(list, page, size) {
    var sz = size || PAGE_SIZE;
    var p = clampPage(page, (list || []).length, sz);
    return (list || []).slice((p - 1) * sz, p * sz);
  }
  function pageOfIndex(idx, size) {
    var sz = size || PAGE_SIZE;
    return idx >= 0 ? Math.floor(idx / sz) + 1 : 1;
  }
  function lobbyPrintsFilter(set) {
    /* K106 Track C: the lobby Prints strip excludes editorial plates --
       they are native to the lobby grid (which carries their
       [ acquire print ] links); the strip surfaces the OTHER rooms'
       purchasables. */
    return (set || []).filter(function(p) {
      return ((p && p.category) || 'editorial') !== 'editorial';
    });
  }
  /* K106-PURE-END */

  /* K107-PURE-START (browse room-block comparator; pure) */
  function roomBlockCmp(catOrder) {
    /* K107 Track B: browse-all room-blocked flow. Two-key comparator:
       CAT_ORDER block rank first (editorial leads, rooms follow the
       manifest category order; unknown rooms trail), manifest order
       within the block. Applied per kind segment in displayList() --
       the images-first / videos-trail partition stays structural. */
    var rank = {};
    (catOrder || []).forEach(function(s, i) { rank[s] = i; });
    return function(a, b) {
      var ra = rank[(a && a.category) || 'editorial'];
      var rb = rank[(b && b.category) || 'editorial'];
      if (ra === undefined) ra = 1e9;
      if (rb === undefined) rb = 1e9;
      if (ra !== rb) return ra - rb;
      return ((a && a.order) || 0) - ((b && b.order) || 0);
    };
  }
  /* K107-PURE-END */

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
  function hasFilter() { return !!(FILTER.q || FILTER.series || FILTER.saved || FILTER.media || FILTER.browse); }
  function matchedPlates() {
    var q = FILTER.q, s = FILTER.series;
    var pnum = q ? plateQueryNum(q) : null;
    return scopePlates().filter(function(p) {
      if (FILTER.saved && !isSaved(p.id)) return false;
      if (FILTER.media && mediaKind(p) !== FILTER.media) return false;
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

  /* ---- K103: media-kind access chips (all / images / videos) ---- */
  function scopeKindCounts() {
    var img = 0, vid = 0;
    scopePlates().forEach(function(p) {
      if (mediaKind(p) === 'video') vid++; else img++;
    });
    return { img: img, vid: vid };
  }
  function makeMediaChip(kind, label, count) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'gallery-chip';
    b.setAttribute('data-media', kind);
    b.setAttribute('aria-pressed', kind === FILTER.media ? 'true' : 'false');
    if (kind === FILTER.media) b.classList.add('is-active');
    b.appendChild(el('span', 'gallery-chip-label', label));
    b.appendChild(el('span', 'gallery-chip-count', String(count)));
    return b;
  }
  function syncMediaChips() {
    if (!mediaWrap) return;
    Array.prototype.forEach.call(mediaWrap.querySelectorAll('.gallery-chip'), function(b) {
      var on = (b.getAttribute('data-media') || '') === FILTER.media;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) b.classList.add('is-active'); else b.classList.remove('is-active');
    });
  }

  function mediaEl(p) {
    if (mediaKind(p) === 'video') {
      var v = document.createElement('video');
      v.className = 'gallery-plate-video';
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
          var extra = el('div', 'gallery-cap-extra');
          if (p.technique) extra.appendChild(el('p', 'gallery-plate-technique', p.technique));
          if (p.body) extra.appendChild(el('p', 'gallery-plate-body', p.body));
          if (p.epitaph) extra.appendChild(el('p', 'gallery-plate-epitaph', p.epitaph));
          if (extra.childNodes.length) {
            cap.appendChild(extra);
            if (capCollapse(p.body)) {
              cap.classList.add('is-collapsed');
              var tog = document.createElement('button');
              tog.type = 'button';
              tog.className = 'gallery-cap-toggle';
              tog.setAttribute('aria-expanded', 'false');
              tog.textContent = '[ more ]';
              cap.appendChild(tog);
            }
          }
        }
      }
      if (withRoom) cap.appendChild(roomBadge(p));
      fig.appendChild(cap);
    }
    art.appendChild(fig);
    var pl = printLink(p);
    if (pl) art.appendChild(pl);
    art.appendChild(starBtn(p));
    return art;
  }

  /* --- K96: optional per-plate print buy-link (manifest plate.print_url; link-out
     only; never rendered on withheld cards -- consent discipline) --- */
  function printLink(p) {
    if (!p || typeof p.print_url !== 'string' || p.print_url.indexOf('https://') !== 0) return null;
    var a = document.createElement('a');
    a.className = 'gallery-print-link';
    a.href = p.print_url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer nofollow';
    a.textContent = '[ acquire print ]';
    return a;
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

  /* ---- K99 Prints section (lobby only; membership = print_url
         presence -- see printsSet; consent contract identical to
         the rooms; K106: the lobby strip excludes editorial plates --
         their lobby grid cards already carry the link, see
         lobbyPrintsFilter) ---- */
  var printsSection = null;
  var printsGrid = null;
  function buildPrintsShell() {
    if (!isLobby || printsSection) return;
    printsSection = el('section', 'gallery-prints');
    printsSection.id = 'gallery-prints';
    printsSection.setAttribute('aria-label', 'Prints');
    printsSection.setAttribute('hidden', '');
    printsSection.appendChild(el('h2', 'gallery-prints-heading', 'Prints'));
    printsSection.appendChild(el('p', 'gallery-prints-aside',
      'Prints from the other rooms -- editorial prints carry [ acquire print ] on their own grid cards below. The shop link routes out; flagged plates still gate through consent.'));
    printsGrid = el('div', 'gallery-grid gallery-prints-grid');
    printsGrid.id = 'gallery-prints-grid';
    printsSection.appendChild(printsGrid);
    /* K105: Prints lands BELOW the NSFW bar — K99's catIndex anchor had
       stranded the gate toggle under the Prints grid (operator note).
       Order: rooms index -> gate -> Prints -> editorial grid. */
    var nsfwBar = toggleBtn ? toggleBtn.closest('.gallery-nsfw-bar') : null;
    var pAnchor = (nsfwBar && nsfwBar.parentNode === catIndex.parentNode) ? nsfwBar : catIndex;
    pAnchor.parentNode.insertBefore(printsSection, pAnchor.nextSibling);
    printsGrid.addEventListener('click', starClick);
    printsGrid.addEventListener('click', capToggleClick);
    printsGrid.addEventListener('click', thCardClick);
    if (overlay && lbImg) printsGrid.addEventListener('click', lbCardClick);
  }
  function renderPrints() {
    if (!printsSection || !printsGrid) return;
    var set = lobbyPrintsFilter(printsSet(PLATES, CAT_ORDER));
    printsGrid.textContent = '';
    if (!set.length || hasFilter()) {
      printsSection.setAttribute('hidden', '');
      return;
    }
    set.forEach(function(p) {
      if (isGated(p) && !revealed) {
        printsGrid.appendChild(withheldCard(p, true));
      } else {
        printsGrid.appendChild(plateCard(p, true));
      }
    });
    printsSection.removeAttribute('hidden');
  }

  /* ---- K101 video section (videos get their own sub-grid below
         the image grid wherever media kinds mix; the divider carries
         the matched count and hides at 0; consent contract identical
         to the rooms — flagged video plates render withheld here, no
         video element, no poster in the DOM pre-consent) ---- */
  var videosSection = null;
  var videosGrid = null;
  var videosHeading = null;
  function buildVideosShell() {
    if (videosSection) return;
    videosSection = el('section', 'gallery-videos');
    videosSection.id = 'gallery-videos';
    videosSection.setAttribute('aria-label', 'Videos');
    videosSection.setAttribute('hidden', '');
    videosHeading = el('h2', 'gallery-videos-heading', 'Videos');
    videosSection.appendChild(videosHeading);
    videosGrid = el('div', 'gallery-grid gallery-videos-grid');
    videosGrid.id = 'gallery-videos-grid';
    videosSection.appendChild(videosGrid);
    grid.parentNode.insertBefore(videosSection, grid.nextSibling);
    videosGrid.addEventListener('click', starClick);
    videosGrid.addEventListener('click', capToggleClick);
    videosGrid.addEventListener('click', thCardClick);
  }
  function renderVideos(set, withRoom) {
    if (!videosSection || !videosGrid) return;
    videosGrid.textContent = '';
    if (!set.length) {
      videosSection.setAttribute('hidden', '');
      return;
    }
    videosHeading.textContent = 'Videos — ' + set.length;
    set.forEach(function(p) {
      if (isGated(p) && !revealed) {
        videosGrid.appendChild(withheldCard(p, withRoom));
      } else {
        videosGrid.appendChild(plateCard(p, withRoom));
      }
    });
    videosSection.removeAttribute('hidden');
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
    /* room pages: the room's own flagged count (stable; does not chase
       the active filter). K105 lobby: count flagged across ALL rooms —
       the lobby surfaces every room via search + Prints, so the old
       editorial-only "0 ... in this room" misled the moment withheld
       Prints cards rendered beside it. */
    var g = scopePlates().filter(isGated).length;
    statusEl.textContent = isLobby
      ? g + (g === 1 ? ' plate' : ' plates') + ' flagged across the rooms — withheld until revealed.'
      : g + (g === 1 ? ' plate' : ' plates') + ' currently flagged in this room.';
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

  /* ---- K106 Track D: pagination + lobby browse-all ----
         Generic client-side pagination: any rendered set past
         PAGE_SIZE slices into pages; mono pager chrome above and
         below the grid; FILTER.page resets on every filter change
         and clamps on shrink. The browse flag (lobby only) swaps
         the default editorial view for the whole corpus -- it counts
         as a filter (hasFilter), so routing chrome (rooms index,
         Prints) hides while browsing, exactly as for search. ---- */
  function displayList() {
    /* the full pre-pagination set in display order -- images first,
       videos trail (the K101 partition). render() slices THIS list;
       routeHash page-locates against it. */
    var base = hasFilter() ? matchedPlates() : defaultPlates();
    var imgs = [], vids = [];
    base.forEach(function(p) {
      if (mediaKind(p) === 'video') vids.push(p); else imgs.push(p);
    });
    if (FILTER.browse) {
      /* K107 Track B: room-blocked browse -- group by room within each
         kind segment; kills the equal-order interleave at corpus scale. */
      var cmp = roomBlockCmp(CAT_ORDER);
      imgs.sort(cmp);
      vids.sort(cmp);
    }
    return imgs.concat(vids);
  }
  var pagerTop = null;
  var pagerBottom = null;
  function buildPagerShell() {
    if (pagerTop || !grid || !grid.parentNode) return;
    pagerTop = el('div', 'gallery-pager');
    pagerTop.id = 'gallery-pager-top';
    pagerTop.setAttribute('hidden', '');
    pagerBottom = el('div', 'gallery-pager');
    pagerBottom.id = 'gallery-pager-bottom';
    pagerBottom.setAttribute('hidden', '');
    grid.parentNode.insertBefore(pagerTop, grid);
    if (videosSection && videosSection.parentNode) {
      videosSection.parentNode.insertBefore(pagerBottom, videosSection.nextSibling);
    } else {
      grid.parentNode.insertBefore(pagerBottom, grid.nextSibling);
    }
    pagerTop.addEventListener('click', pagerClick);
    pagerBottom.addEventListener('click', pagerClick);
  }
  function pagerClick(e) {
    var b = e.target && e.target.closest ? e.target.closest('.gallery-pager-btn') : null;
    if (!b || b.disabled) return;
    var delta = b.getAttribute('data-page-delta') === 'next' ? 1 : -1;
    var total = displayList().length;
    var next = clampPage(FILTER.page + delta, total, PAGE_SIZE);
    if (next === FILTER.page) return;
    FILTER.page = next;
    render();
    /* land at the top of the new page -- instant, zero animation. */
    (pagerTop || grid).scrollIntoView({ block: 'start' });
  }
  function renderPagers(total) {
    if (!pagerTop || !pagerBottom) return;
    var max = pageCount(total, PAGE_SIZE);
    [pagerTop, pagerBottom].forEach(function(pg) {
      pg.textContent = '';
      if (max <= 1) { pg.setAttribute('hidden', ''); return; }
      var prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'gallery-pager-btn';
      prev.setAttribute('data-page-delta', 'prev');
      prev.textContent = '[ prev ]';
      prev.disabled = FILTER.page <= 1;
      pg.appendChild(prev);
      pg.appendChild(el('span', 'gallery-pager-state',
        'page ' + FILTER.page + ' / ' + max + ' · ' + total + ' plates'));
      var nx = document.createElement('button');
      nx.type = 'button';
      nx.className = 'gallery-pager-btn';
      nx.setAttribute('data-page-delta', 'next');
      nx.textContent = '[ next ]';
      nx.disabled = FILTER.page >= max;
      pg.appendChild(nx);
      pg.removeAttribute('hidden');
    });
  }

  function render() {
    grid.textContent = '';
    var withRoom = isLobby && hasFilter();
    /* K106 Track D: paginate past PAGE_SIZE -- the slice keeps display
       order (images first, videos trail), so mixed pages partition
       cleanly below. */
    var full = displayList();
    var total = full.length;
    FILTER.page = clampPage(FILTER.page, total, PAGE_SIZE);
    var setTo = total > PAGE_SIZE ? pageSlice(full, FILTER.page, PAGE_SIZE) : full;
    var imgSet = setTo.filter(function(p) { return mediaKind(p) !== 'video'; });
    var vidSet = setTo.filter(function(p) { return mediaKind(p) === 'video'; });

    if (!total) {
      grid.appendChild(el('p', 'gallery-empty', hasFilter()
        ? 'No plates match that filter.'
        : 'This room is empty. The vessel precedes the cargo.'));
    } else {
      imgSet.forEach(function(p) {
        if (isGated(p) && !revealed) {
          grid.appendChild(withheldCard(p, withRoom));
        } else {
          grid.appendChild(plateCard(p, withRoom));
        }
      });
    }

    renderVideos(vidSet, withRoom);
    renderPagers(total);

    /* the category index is routing chrome — hide it while the lobby shows results. */
    if (catIndex) {
      if (withRoom) catIndex.setAttribute('hidden', '');
      else catIndex.removeAttribute('hidden');
    }

    updateStatus();
    updateHero();
    updateCount(total);
    renderPrints();
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

    var kinds = scopeKindCounts();
    if (kinds.img > 0 && kinds.vid > 0) {
      mediaWrap = el('div', 'gallery-chips gallery-mediachips');
      mediaWrap.id = 'gallery-mediachips';
      mediaWrap.appendChild(makeMediaChip('', 'all', kinds.img + kinds.vid));
      mediaWrap.appendChild(makeMediaChip('image', 'images', kinds.img));
      mediaWrap.appendChild(makeMediaChip('video', 'videos', kinds.vid));
      bar.appendChild(mediaWrap);
    }

    if (showChips) {
      chipsWrap = el('div', 'gallery-chips');
      chipsWrap.id = 'gallery-chips';
      chipsWrap.appendChild(makeChip('', 'all', scopePlates().length));
      seriesList.forEach(function(row) {
        chipsWrap.appendChild(makeChip(row.series, chipLabel(row.series), row.count));
      });
      bar.appendChild(chipsWrap);
    }

    if (isLobby) {
      /* K106 Track D: explicit browse-everything affordance -- the
         default lobby view (editorial + rooms index + Prints) holds;
         the toggle swaps in the whole corpus, paginated. */
      browseBtn = document.createElement('button');
      browseBtn.type = 'button';
      browseBtn.className = 'gallery-chip gallery-browse-toggle';
      browseBtn.id = 'gallery-browse-toggle';
      browseBtn.setAttribute('aria-pressed', 'false');
      browseBtn.textContent = 'browse all ' + scopePlates().length;
      bar.appendChild(browseBtn);
    }

    grid.parentNode.insertBefore(bar, grid);

    if (searchInput) {
      searchInput.addEventListener('input', function() {
        var v = searchInput.value.trim().toLowerCase();
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(function() { FILTER.q = v; FILTER.page = 1; render(); }, 120);
      });
    }
    savedBtn.addEventListener('click', function() {
      FILTER.saved = !FILTER.saved;
      FILTER.page = 1;
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
        FILTER.page = 1;
        if (FILTER.series && FILTER.saved) { FILTER.saved = false; updateSavedToggle(); }
        syncChips();
        render();
      });
    }
    if (mediaWrap) {
      mediaWrap.addEventListener('click', function(e) {
        var b = e.target && e.target.closest ? e.target.closest('.gallery-chip') : null;
        if (!b) return;
        var k = b.getAttribute('data-media') || '';
        FILTER.media = (FILTER.media === k) ? '' : k;
        FILTER.page = 1;
        syncMediaChips();
        render();
      });
    }

    if (browseBtn) {
      browseBtn.addEventListener('click', function() {
        FILTER.browse = !FILTER.browse;
        FILTER.page = 1;
        browseBtn.setAttribute('aria-pressed', FILTER.browse ? 'true' : 'false');
        if (FILTER.browse) browseBtn.classList.add('is-active');
        else browseBtn.classList.remove('is-active');
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
      if (revealed) { revealed = false; persistReveal(false); setToggleUI(); render(); return; }
      if (hasConsent()) { revealed = true; persistReveal(true); setToggleUI(); render(); return; }
      openConsent();
    });
  }
  if (consentYes) {
    consentYes.addEventListener('click', function() {
      storeConsent();
      persistReveal(true);
      closeConsent();
      revealed = true;
      setToggleUI();
      render();
      /* K106 Track A: a flagged deep link may have surfaced this dialog --
         with consent + reveal now on, re-route opens the linked plate
         (theater or lightbox); no-ops when no plate hash rides. */
      routeHash();
    });
  }
  if (consentNo) {
    consentNo.addEventListener('click', function() { closeConsent(); });
  }

  /* ---- K105 share / deep links: canonical room URL per plate;
         clipboard with execCommand fallback; the address-bar hash
         tracks the open plate via replaceState (never pushState —
         no history spam; replaceState also never fires hashchange,
         so routeHash re-runs only on real external hash edits). ---- */
  function plateById(id) {
    if (!id) return null;
    for (var i = 0; i < PLATES.length; i++) {
      if (PLATES[i].id === id) return PLATES[i];
    }
    return null;
  }
  var shareTimer = null;
  function fallbackCopy(text, done) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    } catch (e) {}
  }
  function copyShare(btn, pid) {
    var p = plateById(pid);
    if (!p || !btn) return;
    var url = location.origin + plateUrl(p);
    var done = function() {
      btn.textContent = '[ copied ]';
      if (shareTimer) clearTimeout(shareTimer);
      shareTimer = setTimeout(function() { btn.textContent = '[ share ]'; }, 1400);
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function() { fallbackCopy(url, done); });
        return;
      }
    } catch (e) {}
    fallbackCopy(url, done);
  }
  function setPlateHash(pid) {
    if (!pid) return;
    try { history.replaceState(null, '', location.pathname + location.search + '#plate-' + pid); } catch (e) {}
  }
  function clearPlateHash() {
    if (!parsePlateHash(location.hash)) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }

  /* ---- lightbox (K27 logic, delegation-adapted; images only —
         video cards open the K104 theater) ---- */
  var overlay = document.getElementById('gallery-lightbox');
  var lbImg = document.getElementById('gallery-lightbox-img');
  var capNum = document.getElementById('gallery-lightbox-caption-num');
  var capTitle = document.getElementById('gallery-lightbox-caption-title');
  var btnClose = document.getElementById('gallery-lightbox-close');
  var btnPrev = document.getElementById('gallery-lightbox-prev');
  var btnNext = document.getElementById('gallery-lightbox-next');
  var currentIdx = -1;
  var lbScope = grid;
  var lbPid = '';

  function visiblePlates() {
    return Array.prototype.slice.call(lbScope.querySelectorAll('.gallery-plate')).filter(function(p) {
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
    lbPid = pid || '';
    setPlateHash(lbPid);
    overlay.setAttribute('data-open', 'true');
    document.body.classList.add('gallery-lightbox-open');
  }

  function lbClose() {
    clearPlateHash();
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

  /* K99: shared card->lightbox delegated handler; lbScope tracks the
     grid the open came from (main grid or the Prints grid), so prev/
     next, random and keyboard nav stay within that set. */
  function lbCardClick(e) {
    var t = e.target;
    if (!t || !t.classList || !t.classList.contains('gallery-plate-img')) return;
    var plate = t.closest('.gallery-plate');
    if (!plate) return;
    lbScope = (plate.parentNode && plate.parentNode.classList &&
      plate.parentNode.classList.contains('gallery-prints-grid')) ? plate.parentNode : grid;
    var vis = visiblePlates();
    var idx = vis.indexOf(plate);
    if (idx !== -1) lbOpen(idx);
  }
  if (overlay && lbImg) {
    grid.addEventListener('click', lbCardClick);
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
    /* K105 [ share ] — injected like the randomizer; rides the
       .gallery-lightbox-random base class with own offsets (the base
       is absolutely positioned — two same-class buttons would overlap). */
    var btnShare = document.getElementById('gallery-lightbox-share');
    if (!btnShare && btnRand && btnRand.parentNode) {
      btnShare = document.createElement('button');
      btnShare.type = 'button';
      btnShare.id = 'gallery-lightbox-share';
      btnShare.className = 'gallery-lightbox-random gallery-lightbox-share';
      btnShare.setAttribute('aria-label', 'Copy a link to this plate');
      btnShare.setAttribute('title', 'Copy a link to this plate');
      btnShare.textContent = '[ share ]';
      btnRand.parentNode.insertBefore(btnShare, btnRand.nextSibling);
    }
    if (btnShare) btnShare.addEventListener('click', function() { copyShare(btnShare, lbPid); });
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
  function starClick(e) {
    var star = e.target && e.target.closest ? e.target.closest('.gallery-star') : null;
    if (!star) return;
    e.stopPropagation();
    var id = star.getAttribute('data-star-id');
    if (!id) return;
    var on = toggleSaved(id);
    /* K99: a plate can render twice (main grid + Prints) -- sync every
       star carrying this id, not just the clicked one. */
    var sel = '.gallery-star[data-star-id="' + id + '"]';
    Array.prototype.forEach.call(document.querySelectorAll(sel), function(s) {
      if (on) s.classList.add('is-saved'); else s.classList.remove('is-saved');
      s.setAttribute('aria-pressed', on ? 'true' : 'false');
      s.setAttribute('aria-label', on ? 'Saved — remove from your list' : 'Save to your list');
      s.setAttribute('title', on ? 'Saved — click to remove' : 'Save to your list');
    });
    updateSavedToggle();
    if (FILTER.saved) render();
  }
  grid.addEventListener('click', starClick);

  /* ---- K99 caption-disclosure delegation (a <button>, never
         .gallery-plate-img, so the lightbox handler ignores it) ---- */
  function capToggleClick(e) {
    var btn = e.target && e.target.closest ? e.target.closest('.gallery-cap-toggle') : null;
    if (!btn) return;
    e.stopPropagation();
    var cap = btn.closest('.gallery-plate-caption');
    if (!cap) return;
    var collapsed = cap.classList.toggle('is-collapsed');
    btn.textContent = collapsed ? '[ more ]' : '[ less ]';
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }
  grid.addEventListener('click', capToggleClick);

  /* ---- K104 video theater: loop + dim-focus + lightbox-parity
         chrome. Shell is JS-INJECTED on first open (the K95 random-
         button precedent — no 9-shell markup edit) and reuses the
         .gallery-lightbox chrome classes (backdrop dim, stage,
         buttons, caption, body scroll lock) under theater-own ids;
         the images lightbox is untouched. The stage <video> is
         created ON OPEN (src assigned then; loop=true — the auto-
         loop ask lives on the theater element; ALL playback lives
         here, card videos carry no controls) and torn down on close
         AND on every prev/next/random — one playing video at a time
         by construction. Scope = the sub-grid the open came from
         (videos sub-grid or the Prints grid), so nav walks the
         current filtered video set (lbScope parity); keyboard
         Esc / arrows / r match the lightbox. CONSENT HELD: withheld
         cards carry no .gallery-plate-video, so they cannot open the
         theater and never enter its scope (K87 contract). ---- */
  var thOverlay = null;
  var thStage = null;
  var thCapWrap = null;
  var thCapNum = null;
  var thCapTitle = null;
  var thVideo = null;
  var thIdx = -1;
  var thScope = null;
  var thPid = '';

  function buildTheaterShell() {
    if (thOverlay) return;
    function mkBtn(cls, id, label, txt) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.id = id;
      b.setAttribute('aria-label', label);
      b.textContent = txt;
      return b;
    }
    thOverlay = el('div', 'gallery-lightbox gallery-theater');
    thOverlay.id = 'gallery-theater';
    thOverlay.setAttribute('role', 'dialog');
    thOverlay.setAttribute('aria-modal', 'true');
    thOverlay.setAttribute('aria-label', 'Video theater');
    thOverlay.setAttribute('data-open', 'false');
    thStage = el('div', 'gallery-lightbox-stage gallery-theater-stage');
    var bClose = mkBtn('gallery-lightbox-close', 'gallery-theater-close', 'Close theater', '[ close ]');
    var bPrev = mkBtn('gallery-lightbox-prev', 'gallery-theater-prev', 'Previous video', '[ \u2190 ]');
    var bNext = mkBtn('gallery-lightbox-next', 'gallery-theater-next', 'Next video', '[ \u2192 ]');
    var bRand = mkBtn('gallery-lightbox-random', 'gallery-theater-random', 'Random video', '[ random ]');
    bRand.setAttribute('title', 'Jump to a random video (press r)');
    var bShare = mkBtn('gallery-lightbox-random gallery-lightbox-share', 'gallery-theater-share', 'Copy a link to this plate', '[ share ]');
    bShare.setAttribute('title', 'Copy a link to this plate');
    thStage.appendChild(bClose);
    thStage.appendChild(bPrev);
    thStage.appendChild(bNext);
    thStage.appendChild(bRand);
    thStage.appendChild(bShare);
    thCapWrap = el('div', 'gallery-lightbox-caption');
    thCapNum = el('span', 'gallery-lightbox-caption-num');
    thCapNum.id = 'gallery-theater-caption-num';
    thCapTitle = el('span', 'gallery-lightbox-caption-title');
    thCapTitle.id = 'gallery-theater-caption-title';
    thCapWrap.appendChild(thCapNum);
    thCapWrap.appendChild(thCapTitle);
    thStage.appendChild(thCapWrap);
    thOverlay.appendChild(thStage);
    document.body.appendChild(thOverlay);
    bClose.addEventListener('click', thClose);
    bPrev.addEventListener('click', function() { thStep(-1); });
    bNext.addEventListener('click', function() { thStep(1); });
    bRand.addEventListener('click', thRandom);
    bShare.addEventListener('click', function() { copyShare(bShare, thPid); });
    thOverlay.addEventListener('click', function(e) {
      if (e.target === thOverlay) thClose();
    });
  }

  function thVisible() {
    if (!thScope) return [];
    return Array.prototype.slice.call(thScope.querySelectorAll('.gallery-plate')).filter(function(p) {
      return p.offsetParent !== null && p.querySelector('.gallery-plate-video');
    });
  }

  function thTeardown() {
    if (!thVideo) return;
    try { thVideo.pause(); } catch (e) {}
    thVideo.removeAttribute('src');
    try { thVideo.load(); } catch (e) {}
    if (thVideo.parentNode) thVideo.parentNode.removeChild(thVideo);
    thVideo = null;
  }

  function thOpen(idx) {
    buildTheaterShell();
    var vis = thVisible();
    if (!vis.length) return;
    thTeardown();
    thIdx = ((idx % vis.length) + vis.length) % vis.length;
    var plate = vis[thIdx];
    var card = plate.querySelector('.gallery-plate-video');
    var num = plate.getAttribute('data-num');
    var title = plate.getAttribute('data-title');
    var pid = plate.getAttribute('data-plate-id');
    var v = document.createElement('video');
    v.className = 'gallery-theater-video';
    v.controls = true;
    v.loop = true;
    v.preload = 'auto';
    v.src = card.getAttribute('src') || '';
    if (card.getAttribute('poster')) v.poster = card.getAttribute('poster');
    v.setAttribute('aria-label', title || (num ? 'Plate ' + num : ''));
    thStage.insertBefore(v, thCapWrap);
    thVideo = v;
    thCapNum.textContent = (num ? 'Plate ' + num : '') + (pid ? '  ·  ' + pid : '');
    thCapTitle.textContent = title || '';
    thPid = pid || '';
    setPlateHash(thPid);
    thOverlay.setAttribute('data-open', 'true');
    document.body.classList.add('gallery-lightbox-open');
    var pr = v.play();
    if (pr && pr.catch) pr.catch(function() {});
  }

  function thClose() {
    if (!thOverlay) return;
    thTeardown();
    clearPlateHash();
    thOverlay.setAttribute('data-open', 'false');
    document.body.classList.remove('gallery-lightbox-open');
  }

  function thStep(delta) {
    if (!thVisible().length || thIdx < 0) return;
    thOpen(thIdx + delta);
  }

  function thRandom() {
    var vis = thVisible();
    if (!vis.length) return;
    var idx = Math.floor(Math.random() * vis.length);
    if (vis.length > 1 && idx === thIdx) idx = (idx + 1) % vis.length;
    thOpen(idx);
  }

  /* card -> theater delegated handler (lbCardClick pattern; targets
     .gallery-plate-video ONLY, so images, stars, caption toggles and
     the print link never reach it; bound on the videos sub-grid and
     the Prints grid in their shell builders) */
  function thCardClick(e) {
    var t = e.target;
    if (!t || !t.classList || !t.classList.contains('gallery-plate-video')) return;
    var plate = t.closest('.gallery-plate');
    if (!plate || !plate.parentNode) return;
    thScope = plate.parentNode;
    var vis = thVisible();
    var idx = vis.indexOf(plate);
    if (idx !== -1) thOpen(idx);
  }

  document.addEventListener('keydown', function(e) {
    if (consentEl && consentEl.getAttribute('data-open') === 'true') return;
    if (!thOverlay || thOverlay.getAttribute('data-open') !== 'true') return;
    if (e.key === 'Escape') { thClose(); }
    else if (e.key === 'ArrowLeft') { thStep(-1); }
    else if (e.key === 'ArrowRight') { thStep(1); }
    else if (e.key === 'r' || e.key === 'R') { thRandom(); }
  });

  /* ---- K105 deep-link router: #plate-<id> opens post-render.
         CONSENT LEG (K87): flagged + !revealed scrolls to the
         withheld card and opens NOTHING — a deep link is not a
         consent bypass. A plate rendered twice (lobby: Prints +
         editorial grid) prefers its main-grid card. ---- */
  function routeHash() {
    var pid = parsePlateHash(location.hash);
    if (!pid) return;
    var p = plateById(pid);
    if (!p || isSealed(p)) return;
    /* K106 Track D: the target may live on a later page -- locate it in
       the active display list and turn the page BEFORE the card lookup
       (canonical room URLs enter unfiltered, so the page is always
       computable; a pid outside the current set falls through to the
       cards guard below unchanged). */
    var full = displayList();
    var fi = -1;
    for (var k0 = 0; k0 < full.length; k0++) {
      if (full[k0].id === pid) { fi = k0; break; }
    }
    if (fi !== -1 && full.length > PAGE_SIZE) {
      var want = pageOfIndex(fi, PAGE_SIZE);
      if (want !== FILTER.page) {
        FILTER.page = want;
        render();
      }
    }
    var cards = document.querySelectorAll('.gallery-plate[data-plate-id="' + pid + '"]');
    if (!cards.length) return;
    var card = cards[0];
    for (var j = 0; j < cards.length; j++) {
      if (cards[j].parentNode === grid) { card = cards[j]; break; }
    }
    if (isGated(p) && !revealed) {
      card.scrollIntoView({ block: 'center' });
      /* K106 Track A: surface the 18+ interstitial for a never-consented
         visitor -- the link recipient gets the choice (AQ-ratified);
         opening the dialog puts NO media in the DOM (K87 held). A
         consented visitor whose reveal is OFF made that choice --
         purposeful hide respected, scroll-only. */
      if (!hasConsent()) openConsent();
      return;
    }
    if (mediaKind(p) === 'video') {
      if (!card.querySelector('.gallery-plate-video') || !card.parentNode) return;
      thScope = card.parentNode;
      var vis = thVisible();
      var idx = vis.indexOf(card);
      if (idx !== -1) thOpen(idx);
    } else {
      if (!(overlay && lbImg) || !card.querySelector('.gallery-plate-img')) return;
      lbScope = (card.parentNode && card.parentNode.classList &&
        card.parentNode.classList.contains('gallery-prints-grid')) ? card.parentNode : grid;
      var vis2 = visiblePlates();
      var idx2 = vis2.indexOf(card);
      if (idx2 !== -1) lbOpen(idx2);
    }
  }
  window.addEventListener('hashchange', routeHash);

  /* ---- K106 Track B: back-to-top (gallery surfaces only -- injected
         here so all 9 pages inherit; hidden until ~1.5 viewports of
         scroll; instant jump, zero animation -- site discipline; sits
         above the ambient bar, below the lightbox/theater overlays) ---- */
  var topBtn = null;
  function buildTopBtn() {
    if (topBtn || !document.body) return;
    topBtn = document.createElement('button');
    topBtn.type = 'button';
    topBtn.id = 'gallery-top-btn';
    topBtn.className = 'gallery-top-btn';
    topBtn.textContent = '[ top ]';
    topBtn.setAttribute('aria-label', 'Back to top');
    topBtn.setAttribute('hidden', '');
    topBtn.addEventListener('click', function() { window.scrollTo(0, 0); });
    document.body.appendChild(topBtn);
    window.addEventListener('scroll', function() {
      if (!topBtn) return;
      if (window.scrollY > window.innerHeight * 1.5) topBtn.removeAttribute('hidden');
      else topBtn.setAttribute('hidden', '');
    }, { passive: true });
  }
  buildTopBtn();

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
      /* K105 sticky reveal — consent PRIMACY: the stored bit alone
         never reveals. */
      revealed = hasConsent() && storedReveal();
      buildControls();
      buildPrintsShell();
      buildVideosShell();
      buildPagerShell();
      setToggleUI();
      render();
      renderCatIndex();
      routeHash();
    })
    .catch(function() {
      grid.textContent = '';
      grid.appendChild(el('p', 'gallery-empty', 'The manifest failed to load. The plates are unharmed — reload, or return later.'));
    });
})();
