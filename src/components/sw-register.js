/* wuld.ink SW registration + install affordance — K276 (Track B PWA).
 *
 * Progressive + MOBILE-ONLY + desktop-inert: the whole script is gated on pointer:coarse, so
 * on a desktop (fine pointer) it is a TOTAL no-op — no SW, no cache, no DOM mutation (hazard 9;
 * desktop stays a plain website, browser-native install if the UA offers it). Head-defer on
 * every NON-home page (homepage stays register-free per D1; the SW controls the whole origin
 * after the first navigation). JS off / SW unsupported => the site behaves exactly as today.
 * The install button carries class .pwa-install (FP-excluded); it is created only on mobile.
 */
(function () {
  'use strict';
  try {
    var coarse = window.matchMedia && matchMedia('(pointer:coarse)').matches;
    if (!coarse) return;                       // DESKTOP: total no-op

    /* 1. Service worker — mobile-only, progressive. */
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').catch(function () {});
      });
    }

    /* 2. Mobile-only styles for the install affordance (injected into <head>, so the button
          shows only <=640px and never widens the page). */
    var css =
      '.pwa-install{display:none;margin:0.85rem 0 0}' +
      '.pwa-install button{font:600 0.78rem/1.4 "IBM Plex Mono",ui-monospace,monospace;' +
      'letter-spacing:0.05em;text-transform:uppercase;color:#f0ebe5;background:#0a0a0a;' +
      'border:1px solid #c41e3a;padding:0.7rem 1.1rem;min-height:44px;width:100%;cursor:pointer}' +
      '.pwa-install button:hover,.pwa-install button:focus-visible{background:#c41e3a;color:#0a0a0a}' +
      '.pwa-hint{display:none;margin:0.7rem 0 0;font:0.72rem/1.5 "IBM Plex Mono",ui-monospace,monospace;color:#8a8580}' +
      '@media (min-width:641px){.pwa-install,.pwa-hint{display:none!important}}';
    var st = document.createElement('style');
    st.id = 'pwa-install-style';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);

    function slot() {
      return document.querySelector('.site-footer') ||
             document.querySelector('footer') ||
             document.body;
    }

    /* 3. Custom [Install app] button — captured beforeinstallprompt, footer slot, not a banner. */
    var deferred = null;
    window.addEventListener('beforeinstallprompt', function (ev) {
      ev.preventDefault();
      deferred = ev;
      var host = slot();
      if (!host || host.querySelector('.pwa-install')) return;
      var wrap = document.createElement('div');
      wrap.className = 'pwa-install';
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = 'Install app';
      b.addEventListener('click', function () {
        if (!deferred) return;
        deferred.prompt();
        if (deferred.userChoice) {
          deferred.userChoice.then(function () { deferred = null; wrap.remove(); });
        }
      });
      wrap.appendChild(b);
      wrap.style.display = 'block';             // un-hidden (the @media(min-width:641px) rule still hides it on desktop)
      host.appendChild(wrap);
    });

    /* 4. iOS Safari has no beforeinstallprompt — one-line Add-via-Share hint, mobile-only. */
    var ua = navigator.userAgent || '';
    var isIOS = /iP(hone|ad|od)/.test(ua) && !/CriOS|FxiOS/.test(ua);
    var standalone = (navigator.standalone === true) ||
                     (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    if (isIOS && !standalone) {
      window.addEventListener('load', function () {
        var host = slot();
        if (!host || host.querySelector('.pwa-hint')) return;
        var h = document.createElement('p');
        h.className = 'pwa-hint';
        h.textContent = 'Add to Home Screen: tap Share, then Add to Home Screen.';
        h.style.display = 'block';
        host.appendChild(h);
      });
    }
  } catch (e) { /* progressive: any failure leaves the page exactly as today */ }
})();
