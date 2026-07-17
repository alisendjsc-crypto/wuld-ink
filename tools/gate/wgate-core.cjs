"use strict";
/* wgate-core (K246) — canonical page-curtain transforms. SINGLE SOURCE OF TRUTH.
 *
 * The PORTABLE section (between the wgate:portable markers) is embedded VERBATIM
 * into workers/admin/src/index.js by tools/gate/build-worker.cjs. It is written
 * dependency-injected: every function that can throw or splice takes an H object
 * = { count, Err }. The worker passes { count: siteReplaceCount, Err: SiteOpError };
 * this module passes CORE_H = { count: _count, Err: WGateError }. Same source, two
 * hosts — the render-sim proves worker output === core output byte-for-byte.
 *
 * Everything OUTSIDE the portable markers (WGateError, _count, CORE_H,
 * wgateStripBespoke, module.exports, selftest) is NOT embedded in the worker.
 *
 * Curtains are SOFT dormancy curtains: the passphrase is view-source-visible.
 * This manages dormancy, not security. A real lock is Cloudflare Access.
 */

class WGateError extends Error {}
function _count(content, find, repl, expect, label) {
  const n = content.split(find).length - 1;
  if (n !== expect) {
    throw new WGateError(label + ": expected " + expect + " occurrence(s), found " + n + " — donor drift.");
  }
  return content.split(find).join(repl);
}

/* ============================ wgate:portable:start ============================ */
/* NOTE: self-contained + dependency-injected. No require()/module refs in here. */

var WGATE_NAV_PATH = "src/components/nav.css";
var WGATE_SEARCH_META = '  <meta name="wuld-search" content="exclude">';
var WGATE_DEFAULT_LEDE = "This surface is still being fleshed out. It&rsquo;s dormant until release.";

function wgateQ(s) { return "'" + s + "'"; }   // single-quote wrap (prepaint literals)
function wgateDq(s) { return '"' + s + '"'; }   // double-quote wrap (logic literals)
function wgateCap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

/* Normalize + validate an operator/migration config into the canonical shape. */
function wgateConfig(input, H) {
  input = input || {};
  var slug = String(input.slug == null ? "" : input.slug).trim();
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new H.Err("wgate: slug must be lowercase letters/digits/hyphens (got: " + JSON.stringify(slug) + ").");
  }
  var pass = wgateValidatePass(input.pass, H);
  var eyebrow = (input.eyebrow == null || String(input.eyebrow).trim() === "")
    ? ("&#937; &nbsp;/&nbsp; " + wgateCap(slug)) : String(input.eyebrow);
  var lede = (input.lede == null || String(input.lede).trim() === "")
    ? WGATE_DEFAULT_LEDE : String(input.lede);
  return {
    slug: slug,
    pass: pass,
    storageKey: input.storageKey || ("wuld:gate:" + slug + ":unlocked"),
    openClass: input.openClass || ("wgate-" + slug + "-open"),
    gateId: input.gateId || ("wgate-" + slug),
    eyebrow: eyebrow,
    lede: lede,
    backHref: input.backHref || "/",
    backLabel: input.backLabel || "&larr; back to wuld.ink",
  };
}

function wgateValidatePass(p, H) {
  var s = String(p == null ? "" : p).trim();
  if (!s) throw new H.Err("wgate: passphrase required.");
  if (/["'<>\\\r\n]/.test(s)) {
    throw new H.Err("wgate: passphrase has a forbidden character (no quotes, <, >, backslash, newline).");
  }
  return s;
}

/* ---- pure block generators (no H; never throw) ---- */

function wgateStyleBlock(cfg) {
  return "" +
    '  <style id="wgate-style">\n' +
    '    /* wgate (K246) — canonical soft "not yet released" curtain. Client-side only:\n' +
    '       the page bytes remain public, so this is a dormancy curtain, not a security boundary. */\n' +
    "    #" + cfg.gateId + " {\n" +
    "      position: fixed;\n" +
    "      inset: 0;\n" +
    "      z-index: 2147483000;\n" +
    "      display: flex;\n" +
    "      align-items: center;\n" +
    "      justify-content: center;\n" +
    "      padding: 6vh 5vw;\n" +
    "      background: var(--c-bg, #0a0a0a);\n" +
    "      color: var(--c-fg, #e9e6df);\n" +
    "    }\n" +
    "    html." + cfg.openClass + " #" + cfg.gateId + " { display: none; }\n" +
    "    .wgate-box {\n" +
    "      width: min(30rem, 94vw);\n" +
    "      text-align: center;\n" +
    "      border: 1px solid var(--c-border-strong, #3a3b40);\n" +
    "      border-radius: 12px;\n" +
    "      padding: 2.2rem 1.6rem;\n" +
    "      background: var(--c-bg-elevated, #17181c);\n" +
    "    }\n" +
    "    .wgate-eyebrow {\n" +
    "      font-family: var(--font-mono, ui-monospace, monospace);\n" +
    "      font-size: 0.72rem;\n" +
    "      letter-spacing: 0.14em;\n" +
    "      text-transform: uppercase;\n" +
    "      color: var(--c-fg-muted, #8b8880);\n" +
    "      margin: 0 0 1rem;\n" +
    "    }\n" +
    "    .wgate-lede { font-size: 1.05rem; line-height: 1.6; margin: 0 0 1.5rem; }\n" +
    "    .wgate-form { display: flex; flex-direction: column; gap: 0.7rem; align-items: stretch; max-width: 20rem; margin: 0 auto; }\n" +
    "    .wgate-label {\n" +
    "      font-family: var(--font-mono, ui-monospace, monospace);\n" +
    "      font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase;\n" +
    "      color: var(--c-fg-muted, #8b8880); text-align: left;\n" +
    "    }\n" +
    "    .wgate-input {\n" +
    "      padding: 0.6rem 0.8rem; font: inherit;\n" +
    "      background: var(--c-bg, #0a0a0a); color: var(--c-fg, #e9e6df);\n" +
    "      border: 1px solid var(--c-border, #2a2b30); border-radius: 8px;\n" +
    "    }\n" +
    "    .wgate-input:focus-visible { outline: none; border-color: var(--c-accent, #c41e3a); }\n" +
    "    .wgate-btn {\n" +
    "      padding: 0.55rem 1rem; cursor: pointer; font: inherit;\n" +
    "      font-family: var(--font-mono, ui-monospace, monospace);\n" +
    "      font-size: 0.82rem; letter-spacing: 0.05em;\n" +
    "      background: var(--c-bg-overlay, #202127); color: var(--c-fg, #e9e6df);\n" +
    "      border: 1px solid var(--c-border-strong, #3a3b40); border-radius: 8px;\n" +
    "    }\n" +
    "    .wgate-btn:hover { border-color: var(--c-accent, #c41e3a); }\n" +
    "    .wgate-err { color: var(--c-accent, #c41e3a); font-size: 0.82rem; margin: 0.2rem 0 0; min-height: 1em; }\n" +
    "    .wgate-foot { margin: 1.5rem 0 0; font-size: 0.82rem; }\n" +
    "    .wgate-foot a { color: var(--c-fg-muted, #8b8880); }\n" +
    "  </style>";
}

function wgatePrepaint(cfg) {
  return "  <script>/*wgate-prepaint*/try{if(localStorage.getItem(" + wgateQ(cfg.storageKey) +
    ")===" + wgateQ("1") + ")document.documentElement.classList.add(" + wgateQ(cfg.openClass) +
    ");}catch(e){}</script>";
}

function wgateHeadSpan(cfg) {
  return "  <!-- wgate:head:start slug=" + cfg.slug +
    " (K246 canonical curtain; soft dormancy, view-source-visible, not a security boundary) -->\n" +
    wgateStyleBlock(cfg) + "\n" +
    wgatePrepaint(cfg) + "\n" +
    "  <!-- wgate:head:end -->\n";
}

function wgateOverlay(cfg) {
  return "" +
    '  <div id="' + cfg.gateId + '" role="dialog" aria-modal="true" aria-labelledby="wgate-lede">\n' +
    '    <div class="wgate-box">\n' +
    '      <p class="wgate-eyebrow">' + cfg.eyebrow + "</p>\n" +
    '      <p class="wgate-lede" id="wgate-lede">' + cfg.lede + "</p>\n" +
    '      <form class="wgate-form" autocomplete="off">\n' +
    '        <label class="wgate-label" for="wgate-input">Passphrase</label>\n' +
    '        <input id="wgate-input" class="wgate-input" type="password" autocomplete="off" spellcheck="false" autocapitalize="none">\n' +
    '        <button type="submit" class="wgate-btn">enter</button>\n' +
    '        <p class="wgate-err" role="alert" hidden>Not this time.</p>\n' +
    "      </form>\n" +
    '      <p class="wgate-foot"><a href="' + cfg.backHref + '">' + cfg.backLabel + "</a></p>\n" +
    "    </div>\n" +
    "  </div>";
}

function wgateLogic(cfg) {
  return "  <script>/*wgate-logic*/(function(){var PASS=" + wgateDq(cfg.pass) +
    ';var norm=function(s){return (s||"").trim().toLowerCase().replace(/[\\s\\-]+/g,"");};' +
    "var g=document.getElementById(" + wgateDq(cfg.gateId) + ");if(!g)return;" +
    "if(document.documentElement.classList.contains(" + wgateDq(cfg.openClass) + "))return;" +
    'var f=g.querySelector("form"),i=g.querySelector(".wgate-input"),e=g.querySelector(".wgate-err");' +
    'if(f){f.addEventListener("submit",function(ev){ev.preventDefault();' +
    "if(norm(i&&i.value)===norm(PASS)){try{localStorage.setItem(" + wgateDq(cfg.storageKey) + ',"1");}catch(_){}' +
    "document.documentElement.classList.add(" + wgateDq(cfg.openClass) + ");}" +
    "else{if(e)e.hidden=false;if(i){i.value=\"\";i.focus();}}});}if(i)i.focus();})();</script>";
}

function wgateBodySpan(cfg) {
  return "  <!-- wgate:body:start slug=" + cfg.slug + " -->\n" +
    wgateOverlay(cfg) + "\n" +
    wgateLogic(cfg) + "\n" +
    "  <!-- wgate:body:end -->";
}

/* ---- page transforms (H-injected; throw H.Err on drift/refusal) ---- */

function wgateHasGate(page) {
  return page.indexOf("<!-- wgate:head:start") >= 0 || page.indexOf("<!-- wgate:body:start") >= 0;
}

function wgateApply(page, cfg, H) {
  if (wgateHasGate(page)) {
    throw new H.Err("wgate:apply refused — page already carries a canonical curtain.");
  }
  var bodies = page.match(/<body\b[^>]*>/g) || [];
  if (bodies.length !== 1) {
    throw new H.Err("wgate:apply refused — expected exactly one <body> tag, found " + bodies.length + ".");
  }
  var withHead = H.count(page, "</head>", wgateHeadSpan(cfg) + "</head>", 1, "wgate:apply </head> anchor");
  var bodyTag = bodies[0];
  var withBody = H.count(withHead, bodyTag, bodyTag + "\n" + wgateBodySpan(cfg), 1, "wgate:apply <body> anchor");
  return withBody;
}

function wgateRemove(page, H) {
  if (!wgateHasGate(page)) {
    throw new H.Err("wgate:remove refused — no canonical curtain found on this page.");
  }
  if ((page.split("<!-- wgate:head:start").length - 1) !== 1) throw new H.Err("wgate:remove — head marker count != 1.");
  if ((page.split("<!-- wgate:body:start").length - 1) !== 1) throw new H.Err("wgate:remove — body marker count != 1.");
  var headRe = /  <!-- wgate:head:start[^\n]*-->\n[\s\S]*?  <!-- wgate:head:end -->\n/;
  var bodyRe = /\n  <!-- wgate:body:start[^\n]*-->\n[\s\S]*?  <!-- wgate:body:end -->/;
  if (!headRe.test(page)) throw new H.Err("wgate:remove — head span malformed.");
  if (!bodyRe.test(page)) throw new H.Err("wgate:remove — body span malformed.");
  return page.replace(headRe, "").replace(bodyRe, "");
}

function wgateRotate(page, newPass, H) {
  var re = /(\/\*wgate-logic\*\/\(function\(\)\{var PASS=")([^"]*)(")/;
  var g = new RegExp(re.source, "g");
  var cnt = 0;
  while (g.exec(page)) cnt++;
  if (cnt !== 1) throw new H.Err("wgate:rotate refused — expected exactly 1 canonical curtain, found " + cnt + ".");
  var np = wgateValidatePass(newPass, H);
  return page.replace(re, "$1" + np + "$3");
}

function wgateSlugFromPage(page) {
  var m = page.match(/<!-- wgate:head:start slug=([a-z0-9][a-z0-9-]*)/);
  return m ? m[1] : "";
}

/* ---- search-exclude meta (idempotent) ---- */

function wgateHasSearchMeta(page) {
  return /<meta[^>]+name=["']wuld-search["'][^>]+content=["']exclude["']/i.test(page);
}
function wgateAddSearchMeta(page, H) {
  if (wgateHasSearchMeta(page)) return page;
  return H.count(page, "</head>", WGATE_SEARCH_META + "\n</head>", 1, "wgate:search-meta </head> anchor");
}
function wgateRemoveSearchMeta(page, H) {
  var re = /  <meta[^>]+name=["']wuld-search["'][^>]+content=["']exclude["']>\n/;
  if (!re.test(page)) return page;
  var n = (page.match(new RegExp(re.source, "g")) || []).length;
  if (n !== 1) throw new H.Err("wgate:search-meta — expected 1 exclude meta, found " + n + ".");
  return page.replace(re, "");
}

/* ---- nav.css grey-tab rule (append on apply; regex-strip on remove) ---- */

function wgateNavBlock(slug) {
  return "\n/* K246 — " + slug + " tab greyed dormant until the surface is released (soft curtain).\n" +
    "   Reversible: delete this block to re-activate the tab. */\n" +
    '.site-nav a[href="/' + slug + '/"] { opacity: 0.4; }\n' +
    '.site-nav a[href="/' + slug + '/"]:hover,\n' +
    '.site-nav a[href="/' + slug + '/"]:focus-visible { opacity: 0.72; }\n';
}
function wgateNavHasRule(css, slug) {
  return css.indexOf('.site-nav a[href="/' + slug + '/"]') >= 0;
}
function wgateNavApply(css, slug, H) {
  if (wgateNavHasRule(css, slug)) throw new H.Err("nav: grey rule for /" + slug + "/ already present.");
  return css + wgateNavBlock(slug);
}
function wgateNavRemove(css, slug, H) {
  var esc = slug.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  // single-comment only: (?:[^*]|\*(?!/))* cannot cross a "*/", so an earlier nav
  // comment cannot float the match forward to an appended rule (K246 round-trip fix).
  var src = '\\n(?:/\\*(?:[^*]|\\*(?!/))*\\*/\\n)?' +
    '\\.site-nav a\\[href="/' + esc + '/"\\] \\{ opacity: 0\\.4; \\}\\n' +
    '\\.site-nav a\\[href="/' + esc + '/"\\]:hover,\\n' +
    '\\.site-nav a\\[href="/' + esc + '/"\\]:focus-visible \\{ opacity: 0\\.72; \\}\\n';
  var re = new RegExp(src);
  var n = (css.match(new RegExp(src, "g")) || []).length;
  if (n !== 1) throw new H.Err("nav: expected exactly 1 grey block for /" + slug + "/, found " + n + ".");
  return css.replace(re, "");
}

/* ============================= wgate:portable:end ============================= */

const CORE_H = { count: _count, Err: WGateError };

/* --- migration-only: strip the bespoke sgate/cgate curtains to a clean page --- */
/* pfx = "sgate"|"cgate"; bespokeId = "successor-gate"|"console-gate". Removes the
 * head (style+prepaint) and body (overlay+logic) blocks, collapsing to the natural
 * non-gated shape: <body ...>\n  <a href="#main" ...>. One-way (not invertible). */
function wgateStripBespoke(page, pfx, bespokeId, H) {
  H = H || CORE_H;
  var headSrc = "  <style id=\"" + pfx + "-style\">[\\s\\S]*?</style>\\n  <script>/\\*" + pfx + "-prepaint\\*/[\\s\\S]*?</script>\\n";
  var bodySrc = "\\n\\n  <div id=\"" + bespokeId + "\"[\\s\\S]*?/\\*" + pfx + "-logic\\*/[\\s\\S]*?</script>\\n";
  var headRe = new RegExp(headSrc);
  var bodyRe = new RegExp(bodySrc);
  if ((page.match(new RegExp(headSrc, "g")) || []).length !== 1) throw new H.Err("strip: " + pfx + " head block count != 1.");
  if ((page.match(new RegExp(bodySrc, "g")) || []).length !== 1) throw new H.Err("strip: " + pfx + " body block count != 1.");
  return page.replace(headRe, "").replace(bodyRe, "");
}

module.exports = {
  WGateError: WGateError,
  wgateConfig: function (i) { return wgateConfig(i, CORE_H); },
  wgateHeadSpan: wgateHeadSpan,
  wgateBodySpan: wgateBodySpan,
  wgateApply: function (p, c) { return wgateApply(p, c, CORE_H); },
  wgateRemove: function (p) { return wgateRemove(p, CORE_H); },
  wgateRotate: function (p, np) { return wgateRotate(p, np, CORE_H); },
  wgateSlugFromPage: wgateSlugFromPage,
  wgateAddSearchMeta: function (p) { return wgateAddSearchMeta(p, CORE_H); },
  wgateRemoveSearchMeta: function (p) { return wgateRemoveSearchMeta(p, CORE_H); },
  wgateHasSearchMeta: wgateHasSearchMeta,
  wgateNavBlock: wgateNavBlock,
  wgateNavApply: function (c, s) { return wgateNavApply(c, s, CORE_H); },
  wgateNavRemove: function (c, s) { return wgateNavRemove(c, s, CORE_H); },
  wgateNavHasRule: wgateNavHasRule,
  wgateStripBespoke: function (p, pfx, id) { return wgateStripBespoke(p, pfx, id, CORE_H); },
  WGATE_NAV_PATH: WGATE_NAV_PATH,
  WGATE_SEARCH_META: WGATE_SEARCH_META,
};

/* --- selftest: node wgate-core.cjs --selftest --- */
if (require.main === module && process.argv.indexOf("--selftest") >= 0) {
  var assert = require("assert");
  var M = module.exports;
  var page = [
    "<!doctype html>", "<html lang=\"en\">", "<head>",
    "  <meta charset=\"utf-8\">", "  <title>Test</title>", "</head>",
    "<body data-mode=\"dark\">", "", "  <a href=\"#main\" class=\"skip-link\">Skip</a>",
    "  <main id=\"main\">", "    <p>hello</p>", "  </main>", "</body>", "</html>", "",
  ].join("\n");
  var cfg = M.wgateConfig({ slug: "demo", pass: "Open Sesame" });
  var applied = M.wgateApply(page, cfg);
  assert(applied.indexOf("<!-- wgate:head:start slug=demo") >= 0, "head marker present");
  assert(applied.indexOf('id="wgate-demo"') >= 0, "overlay id present");
  assert(applied.indexOf('id="wgate-demo"') < applied.indexOf("<main"), "overlay before <main>");
  assert(applied.indexOf("wuld:gate:demo:unlocked") >= 0, "storage key present");
  var removed = M.wgateRemove(applied);
  assert.strictEqual(removed, page, "apply->remove round-trip byte-exact");
  var twice = M.wgateApply(page, cfg);
  assert.strictEqual(twice, applied, "apply deterministic");
  var rotated = M.wgateRotate(applied, "new-word");
  assert(rotated.indexOf('var PASS="new-word"') >= 0, "rotate set new pass");
  assert(rotated.indexOf('var PASS="Open Sesame"') < 0, "rotate cleared old pass");
  assert.strictEqual(M.wgateRemove(rotated).indexOf("wgate:"), -1, "rotated page still removable clean-ish");
  var reapplied;
  try { M.wgateApply(applied, cfg); reapplied = false; } catch (e) { reapplied = true; }
  assert(reapplied, "apply refuses double-gate");
  // nav round-trip
  var css = ".site-nav a { color: red; }\n";
  var navd = M.wgateNavApply(css, "demo");
  assert.strictEqual(M.wgateNavRemove(navd, "demo"), css, "nav apply->remove byte-exact");
  // search meta idempotent
  var withMeta = M.wgateAddSearchMeta(applied);
  assert(M.wgateHasSearchMeta(withMeta), "meta added");
  assert.strictEqual(M.wgateAddSearchMeta(withMeta), withMeta, "meta add idempotent");
  console.log("wgate-core selftest: ALL PASS");
}
