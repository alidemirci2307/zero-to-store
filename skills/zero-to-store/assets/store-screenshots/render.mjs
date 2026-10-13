#!/usr/bin/env node
// tool/store_screenshots/render.mjs — generates store screenshots for EVERY LANGUAGE (no dependencies; requires Chrome)
//   node tool/store_screenshots/render.mjs                 -> everything
//   node tool/store_screenshots/render.mjs --lang tr --target ios69
// Input : build/screenshots/raw/<lang>/<raw-device>/<slide.raw>.png  (produced by capture.sh)
// Output: fastlane/screenshots/<ios-locale>/NN_<target>.jpg
//         fastlane/metadata/android/<locale>/images/<playType>/NN.jpg (+ featureGraphic.jpg)
//         build/screenshots/preview.html  (to review everything on a single page)
// Config: tool/store_screenshots/screenshots.config.json
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.STORE_SHOTS_ROOT || path.resolve(DIR, "../..");
const cfg = JSON.parse(fs.readFileSync(path.join(DIR, "screenshots.config.json"), "utf8"));
const args = Object.fromEntries(process.argv.slice(2).join(" ").split("--").filter(Boolean).map((a) => a.trim().split(/\s+/)));
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "store-shots-"));
const PARALLEL = 4;

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// *word* in the title -> accent color
const rich = (s) => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");
const pick = (obj, lang) => (typeof obj === "string" ? obj : obj?.[lang] ?? "");
const fileUrl = (p) => pathToFileURL(p).href;

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);
  const found = candidates.find((c) => fs.existsSync(c));
  if (!found) throw new Error("Chrome not found. Provide the path via the CHROME_PATH environment variable.");
  return found;
}

const STATUS_ICONS = `<span class="icons">
  <svg viewBox="0 0 20 12"><rect x="0" y="8" width="3.2" height="4" rx="1"/><rect x="5.4" y="5.5" width="3.2" height="6.5" rx="1"/><rect x="10.8" y="3" width="3.2" height="9" rx="1"/><rect x="16.2" y="0" width="3.2" height="12" rx="1"/></svg>
  <svg viewBox="0 0 17 12"><path d="M8.5 2.2c2.5 0 4.8 1 6.5 2.6l1.2-1.3A11 11 0 0 0 8.5.4 11 11 0 0 0 .8 3.5L2 4.8a9.3 9.3 0 0 1 6.5-2.6zm0 3.6c1.5 0 2.9.6 4 1.6l1.2-1.3a7.4 7.4 0 0 0-10.4 0l1.2 1.3c1.1-1 2.5-1.6 4-1.6zm0 3.6c.6 0 1.1.2 1.5.6L8.5 11.6 7 10c.4-.4.9-.6 1.5-.6z"/></svg>
  <svg viewBox="0 0 27 12"><rect x=".5" y=".5" width="23" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="24.6" y="4" width="1.6" height="4" rx=".8" opacity=".4"/></svg>
</span>`;

function deviceHtml(device, rawPath, statusBar) {
  const notch = device === "iphone" ? '<div class="island"></div>' : device === "android" ? '<div class="punch"></div>' : "";
  const sb = statusBar === "none" ? "" : `<div class="statusbar"${statusBar === "light" ? ' style="--sb:#fff"' : ""}><span>9:41</span>${STATUS_ICONS}</div>`;
  return `<div class="device ${device}"><div class="screen"><img src="${fileUrl(rawPath)}" alt="">${sb}${notch}</div></div>`;
}

function page({ lang, width, height, theme, body, bodyClass = "" }) {
  const t = { ...cfg.brand, ...theme };
  const vars = `--bg1:${t.background[0]};--bg2:${t.background[1]};--text:${t.text};--accent:${t.accent};--font:${t.font}`;
  return `<!doctype html><html lang="${esc(lang)}"><head><meta charset="utf-8">
<meta name="viewport" content="width=${width},height=${height}">
<link rel="stylesheet" href="${fileUrl(path.join(DIR, "frame.css"))}"><style>:root{${vars}}</style></head>
<body class="${bodyClass}"><div class="glow glow-1"></div><div class="glow glow-2"></div><div class="grid"></div>${body}</body></html>`;
}

const rawFile = (lang, rawDevice, name) => path.join(ROOT, "build/screenshots/raw", lang, rawDevice, `${name}.png`);

function slideJob(lang, target, slide, index) {
  const loc = cfg.locales[lang];
  const nn = String(index + 1).padStart(2, "0");
  const out = target.store === "ios"
    ? path.join(ROOT, "fastlane/screenshots", loc.ios, `${nn}_${target.id}.jpg`)
    : path.join(ROOT, "fastlane/metadata/android", loc.android, "images", target.playType || "phoneScreenshots", `${nn}.jpg`);
  const raw = rawFile(lang, target.raw, slide.raw);
  const eyebrow = pick(slide.eyebrow, lang);
  const sub = pick(slide.subtitle, lang);
  const titleSize = slide.titleSize ? `--title-size:${slide.titleSize}vw;` : "";
  const body = `<header class="caption" style="${titleSize}">${eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""}
    <h1>${rich(pick(slide.title, lang))}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</header>
    <div style="--device-w:${target.deviceWidth ?? 78}vw;display:contents">${deviceHtml(target.device, raw, slide.statusBar ?? "dark")}</div>`;
  return { out, raw, width: target.width, height: target.height, html: page({ lang, width: target.width, height: target.height, theme: slide.theme, body }) };
}

function featureJob(lang) {
  const f = cfg.featureGraphic;
  const loc = cfg.locales[lang];
  const raw = rawFile(lang, f.rawDevice || "android", f.raw);
  const icon = f.icon ? path.join(ROOT, f.icon) : null;
  const sub = pick(f.subtitle, lang);
  const body = `<header class="caption">${icon && fs.existsSync(icon) ? `<img class="app-icon" src="${fileUrl(icon)}" alt="">` : ""}
    <h1>${rich(pick(f.title, lang))}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</header>${deviceHtml("android", raw, "none")}`;
  return {
    out: path.join(ROOT, "fastlane/metadata/android", loc.android, "images/featureGraphic.jpg"),
    raw, width: 1024, height: 500, html: page({ lang, width: 1024, height: 500, theme: f.theme, body, bodyClass: "feature" }),
  };
}

function shoot(chrome, job, i) {
  const html = path.join(TMP, `job-${i}.html`);
  fs.writeFileSync(html, job.html);
  fs.mkdirSync(path.dirname(job.out), { recursive: true });
  const flags = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--allow-file-access-from-files", "--default-background-color=ffffffff", `--user-data-dir=${path.join(TMP, `profile-${i % PARALLEL}`)}`,
    `--window-size=${job.width},${job.height}`, "--virtual-time-budget=1500", `--screenshot=${job.out}`, fileUrl(html)];
  return new Promise((resolve, reject) => {
    execFile(chrome, flags, { timeout: 60_000 }, (err) => (err && !fs.existsSync(job.out) ? reject(err) : resolve()));
  });
}

function writePreview(jobs) {
  const rel = (p) => path.relative(path.join(ROOT, "build/screenshots"), p).split(path.sep).join("/");
  const groups = {};
  for (const j of jobs) (groups[j.group] ||= []).push(j);
  const html = `<!doctype html><meta charset="utf-8"><title>Store screenshots</title>
<style>body{font:15px system-ui;margin:32px;background:#0e1018;color:#e9eaf3}h2{margin:32px 0 12px;font-size:16px}
.row{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}img{height:420px;border-radius:12px;box-shadow:0 8px 30px #0008}
.wide img{height:240px}</style><h1>Store screenshots — ${new Date().toLocaleString("en-US")}</h1>
${Object.entries(groups).map(([g, js]) => `<h2>${esc(g)}</h2><div class="row${js[0].width > js[0].height ? " wide" : ""}">${js.map((j) => `<img src="${rel(j.out)}" loading="lazy">`).join("")}</div>`).join("")}`;
  fs.mkdirSync(path.join(ROOT, "build/screenshots"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "build/screenshots/preview.html"), html);
}

async function main() {
  const langs = args.lang ? [args.lang] : Object.keys(cfg.locales);
  const targets = cfg.targets.filter((t) => !args.target || t.id === args.target);
  const jobs = [];
  for (const lang of langs) {
    for (const target of targets) {
      cfg.slides.forEach((s, i) => jobs.push({ ...slideJob(lang, target, s, i), group: `${lang} · ${target.id} (${target.width}×${target.height})` }));
    }
    if (cfg.featureGraphic && !args.target) jobs.push({ ...featureJob(lang), group: `${lang} · Play feature graphic` });
  }
  const missing = [...new Set(jobs.filter((j) => !fs.existsSync(j.raw)).map((j) => path.relative(ROOT, j.raw)))];
  if (missing.length) {
    console.error(`Missing raw screenshots (${missing.length}) — run tool/store_screenshots/capture.sh first:\n  ${missing.join("\n  ")}`);
    process.exit(1);
  }
  // Old outputs of these targets are deleted (so a removed slide does not linger in the store)
  for (const dir of new Set(jobs.map((j) => path.dirname(j.out)))) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const ours = dir.includes(`${path.sep}images${path.sep}`) ? /^\d{2}\.(jpe?g|png)$/ : new RegExp(`^\\d{2}_(${targets.map((t) => t.id).join("|")})\\.jpg$`);
      if (ours.test(f)) fs.rmSync(path.join(dir, f));
    }
  }
  const chrome = findChrome();
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const i = next++;
      await shoot(chrome, jobs[i], i);
      process.stdout.write(`\r${++done}/${jobs.length} images generated`);
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  writePreview(jobs);
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log(`\nDone. Review: ${path.join(ROOT, "build/screenshots/preview.html")}`);
}

main().catch((e) => { console.error(e.message); fs.rmSync(TMP, { recursive: true, force: true }); process.exit(1); });
