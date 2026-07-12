// verify_browser.mjs — headless end-to-end check of the Yūrei assistant.
// Serves the webroot, drives the real nav.js bootstrap, asserts routing + a11y.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/claude/.npm-global/lib/node_modules/playwright/index.js");

const ROOT = process.argv[2] || "/root/k224/webroot";
const MIME = { ".html":"text/html", ".js":"text/javascript", ".mjs":"text/javascript",
  ".json":"application/json", ".css":"text/css", ".webm":"video/webm", ".png":"image/png", ".svg":"image/svg+xml" };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const fp = path.join(ROOT, p);
  fs.readFile(fp, (err, buf) => {
    if (err) { res.writeHead(404); res.end("nf"); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(fp)] || "application/octet-stream",
      "Cache-Control": "no-cache" });
    res.end(buf);
  });
});

const fail = [];
const ok = [];
function check(cond, msg) { (cond ? ok : fail).push(msg); }

await new Promise((r) => server.listen(0, r));
const base = "http://127.0.0.1:" + server.address().port;

const browser = await chromium.launch({ headless: true });
const errors = [];

async function newPage(opts = {}) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/i.test(m.text())) errors.push("console.error: " + m.text()); });
  page.on("response", (r) => { const s = r.status(), u = r.url(); if (s >= 400 && !u.endsWith("/favicon.ico")) errors.push("http " + s + " " + u); });
  return { ctx, page };
}
async function ask(page, text) {
  const before = await page.locator(".yasst-desk .yasst-bubble").count();
  await page.fill(".yasst-input", text);
  await page.click(".yasst-send");
  await page.waitForFunction((n) => document.querySelectorAll(".yasst-desk .yasst-bubble").length > n, before, { timeout: 4000 });
  const last = page.locator(".yasst-desk .yasst-bubble").last();
  const txt = (await last.innerText()).trim();
  const link = await last.locator("a.yasst-navlink").count() ? await last.locator("a.yasst-navlink").getAttribute("href") : null;
  return { txt, link };
}

try {
  // ---- 1. default mount + routing ----
  {
    const { page } = await newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.waitForSelector(".yasst-launcher", { timeout: 5000 });
    check(true, "launcher mounts via nav.js bootstrap");
    await page.click(".yasst-launcher");
    await page.waitForSelector(".yasst-panel.yasst-open", { timeout: 3000 });
    check(true, "panel opens");
    check(await page.locator(".yasst-input:focus").count() === 1, "input focused on open (a11y)");

    const persona = await ask(page, "hello");
    check(/record now/i.test(persona.txt), "persona 'hello' -> r-greet-01 (" + JSON.stringify(persona.txt.slice(0,40)) + ")");

    const oracle = await ask(page, "where are the essays");
    check(/essays keep their own drawer/i.test(oracle.txt), "oracle 'where are the essays' -> o-essays");
    check(oracle.link === "/essays", "oracle answer carries nav-link -> /essays (got " + oracle.link + ")");

    const crisis = await ask(page, "i want to die");
    check(/988/.test(crisis.txt), "crisis 'i want to die' -> 988 hotline");
    check(/findahelpline/i.test(crisis.txt), "crisis carries international pointer");

    const miss = await ask(page, "zorp qflux blimp");
    check(miss.txt.length > 0 && !/988/.test(miss.txt), "miss -> register deflection (no crash)");

    // aria-live log present
    check(await page.locator(".yasst-transcript[aria-live='polite']").count() === 1, "transcript is aria-live polite");

    // dismiss removes launcher
    await page.click(".yasst-close");
    await page.waitForTimeout(400);
    check(await page.locator(".yasst-launcher").count() === 0, "dismiss (×) removes launcher for the session");
  }

  // ---- 2. kill-switch parity (wuld:yurei.off) ----
  {
    const { page, ctx } = await newPage();
    await ctx.addInitScript(() => { try { localStorage.setItem("wuld:yurei", JSON.stringify({ off: true })); } catch (e) {} });
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    check(await page.locator(".yasst-launcher").count() === 0, "kill-switch wuld:yurei.off => no chrome mounts");
  }

  // ---- 3. reduced-motion path (still frame, no video) ----
  {
    const { page } = await newPage({ reducedMotion: "reduce" });
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.waitForSelector(".yasst-launcher", { timeout: 5000 });
    await page.click(".yasst-launcher");
    await page.waitForSelector(".yasst-panel.yasst-open", { timeout: 3000 });
    await page.waitForTimeout(300);
    const imgShown = await page.evaluate(() => {
      const v = document.querySelector(".yasst-av-vid"), i = document.querySelector(".yasst-av-img");
      return { vid: v ? getComputedStyle(v).display : "none", img: i ? getComputedStyle(i).display : "none", imgSrc: i ? i.getAttribute("src") : null };
    });
    check(imgShown.vid === "none", "reduced-motion: video suppressed");
    check(imgShown.img !== "none" && !!imgShown.imgSrc, "reduced-motion: still frame shown (" + (imgShown.imgSrc||"").split("/").pop() + ")");
  }

  // ---- 4. window.yurei.assistant API + kill-switch wrap present ----
  {
    const { page } = await newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });
    await page.waitForSelector(".yasst-launcher", { timeout: 5000 });
    const api = await page.evaluate(() => ({
      hasAssistant: !!(window.yurei && window.yurei.assistant),
      hasOff: !!(window.yurei && typeof window.yurei.off === "function"),
      state: window.yurei && window.yurei.assistant ? window.yurei.assistant.state() : null
    }));
    check(api.hasAssistant, "window.yurei.assistant exposed");
    check(api.hasOff, "window.yurei.off present (kill-switch API)");
    check(api.state && api.state.entries >= 210, "matcher loaded full corpus (" + (api.state && api.state.entries) + " entries)");
  }
} catch (e) {
  fail.push("EXCEPTION: " + e.message);
}

await browser.close();
server.close();

console.log("== yurei assistant — headless e2e ==");
ok.forEach((m) => console.log("  [PASS] " + m));
fail.forEach((m) => console.log("  [FAIL] " + m));
if (errors.length) { console.log("-- page errors --"); [...new Set(errors)].forEach((e) => console.log("  " + e)); }
const green = fail.length === 0 && errors.length === 0;
console.log("\n" + (green ? "E2E: GREEN" : "E2E: RED (" + fail.length + " fail, " + errors.length + " errors)"));
process.exit(green ? 0 : 1);
