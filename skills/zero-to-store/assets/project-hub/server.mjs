#!/usr/bin/env node
// hub/server.mjs — Project Hub local server (no dependencies, Node 18+)
// Live plan (PLAN.md + docs/plan/) and Needs Center (hub/needs/) on a single page.
//   node hub/server.mjs           -> http://127.0.0.1:4777 (next port if taken)
//   node hub/server.mjs --open    -> + opens it in the browser
//   node hub/server.mjs --status  -> plan + needs summary, record validation (for Claude)
// Security: binds to 127.0.0.1 only, validates the Host header, generates a random
// token on every start (API calls require it). Submitted values are written only
// under hub/inbox/; the folder stays out of the repo via its own .gitignore.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createNeeds, readJson, ID_RE } from "./lib/needs.mjs";
import { createPlan } from "./lib/plan.mjs";
import { createOps } from "./lib/ops.mjs";

const HUB = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HUB);
const PUBLIC = path.join(HUB, "public");
const MAX_BODY = 25 * 1024 * 1024;
const TOKEN = crypto.randomBytes(24).toString("hex");
const args = new Set(process.argv.slice(2));
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml" };
const CSP = "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";

const needs = createNeeds({ hub: HUB, root: ROOT });
const plan = createPlan({ root: ROOT });
const ops = createOps({ root: ROOT });
const LOCK = path.join(needs.inbox, ".server.json");
const project = () => readJson(path.join(HUB, "config.json"), {}).project ?? path.basename(ROOT);

const send = (res, code, body, type = "text/plain; charset=utf-8", extra = {}) => {
  res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...extra });
  res.end(body);
};
const json = (res, code, obj) => send(res, code, JSON.stringify(obj), "application/json; charset=utf-8");

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error("too-large")); req.destroy(); } else chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function handle(req, res, port) {
  if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(req.headers.host)) return send(res, 403, "Forbidden");
  const { pathname } = new URL(req.url, "http://x");

  if (pathname.startsWith("/api/")) {
    if (req.headers["x-hub-token"] !== TOKEN) return json(res, 401, { error: "Session renewed — reload the page" });
    if (req.method === "GET" && pathname === "/api/state") {
      return json(res, 200, { project: project(), needs: needs.load(), plan: plan.load(), ops: ops.load() });
    }
    const r = pathname.match(/^\/api\/ops\/report\/([^/]+)$/);
    if (req.method === "GET" && r && ops.REPORT_ID_RE.test(r[1])) {
      const markdown = ops.report(r[1]);
      return markdown == null ? json(res, 404, { error: "Report not found" }) : json(res, 200, { id: r[1], markdown });
    }
    const m = pathname.match(/^\/api\/needs\/([^/]+)$/);
    if (req.method === "POST" && m && ID_RE.test(m[1])) {
      let body;
      try { body = JSON.parse(await readBody(req)); } catch (e) {
        const big = e.message === "too-large";
        return json(res, big ? 413 : 400, { error: big ? "File too large (max 25 MB)" : "Invalid request" });
      }
      const [code, msg] = needs.submit(m[1], body);
      return json(res, code, code === 200 ? { ok: true } : { error: msg });
    }
    return json(res, 404, { error: "Not found" });
  }

  const file = pathname === "/" ? "index.html" : pathname.slice(1);
  if (!/^[\w.-]+$/.test(file) || !fs.existsSync(path.join(PUBLIC, file))) return send(res, 404, "Not found");
  let content = fs.readFileSync(path.join(PUBLIC, file));
  if (file === "index.html") content = content.toString("utf8").replace("__HUB_TOKEN__", TOKEN);
  const type = `${MIME[path.extname(file)] ?? "application/octet-stream"}; charset=utf-8`;
  send(res, 200, content, type, { "Content-Security-Policy": CSP });
}

function runningServer() {
  const lock = readJson(LOCK);
  if (!lock) return null;
  try { process.kill(lock.pid, 0); return lock; } catch { return null; }
}

function openBrowser(url) {
  const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open";
  spawn(cmd, [url], { stdio: "ignore", detached: true }).unref();
}

function printStatus() {
  const live = runningServer();
  console.log(`Project Hub — ${project()}`);
  console.log(live ? `Server: http://127.0.0.1:${live.port} (running)` : "Server: stopped (node hub/server.mjs --open)");

  const p = plan.load();
  if (p.exists) {
    const by = (s) => p.phases.filter((f) => f.status === s);
    const total = p.phases.filter((f) => f.status !== "cancelled").length;
    console.log(`\nPLAN: ${by("done").length}/${total} phases done`);
    for (const f of by("active")) console.log(`  ~ ${f.no} ${f.name}${f.statusNote ? ` (${f.statusNote})` : ""}`);
    for (const f of p.phases.filter((x) => x.missing)) console.log(`  ! ${f.no}: phase file not found (${f.file || "File column is empty"})`);
  } else {
    console.log("\nPLAN: PLAN.md not found");
  }

  const items = needs.load();
  const groups = { submitted: "SUBMITTED — process", rejected: "REJECTED — user will fix", pending: "PENDING", invalid: "INVALID RECORD" };
  for (const [status, label] of Object.entries(groups)) {
    const list = items.filter((i) => i.status === status);
    if (!list.length) continue;
    console.log(`\n${label}: ${list.length}`);
    for (const i of list) {
      const where = status === "submitted" ? `  -> hub/inbox/${i.id}.json` : "";
      const ph = i.phases?.length ? ` {phase ${i.phases.join(",")}}` : "";
      console.log(`  - ${i.id} [${i.priority ?? "medium"}] ${i.title}${ph}${where}`);
    }
  }
  console.log(`\nNEEDS: ${items.filter((i) => i.status === "processed").length} / ${items.length} done`);
  const o = ops.load();
  if (o.enabled || o.metrics.length) {
    const last = o.metrics.at(-1);
    console.log(`OPS: autonomy ${o.autonomy ?? "?"} · ${o.metrics.length} days of metrics (last ${last?.date ?? "—"}) · ${o.reports.length} reports${o.locked ? " · LOCKED (ops/.lock)" : ""}${o.skippedLines ? ` · ${o.skippedLines} unreadable metrics lines` : ""}`);
  }
  let bad = 0;
  const phaseNos = new Set(p.phases.map((f) => String(parseInt(f.no, 10))));
  for (const i of items) {
    const errs = i.status === "invalid" ? ["unreadable"] : needs.validate(i);
    for (const ph of i.phases ?? []) if (p.exists && !phaseNos.has(String(parseInt(ph, 10)))) errs.push(`unknown phase: ${ph}`);
    if (errs.length) { bad++; console.log(`! ${i.id}: ${errs.join("; ")}`); }
  }
  process.exitCode = bad ? 1 : 0;
}

function start(port, attempt = 0) {
  const server = http.createServer((req, res) => {
    handle(req, res, port).catch((e) => { console.error(e); json(res, 500, { error: "Server error" }); });
  });
  server.on("error", (e) => {
    if (e.code === "EADDRINUSE" && attempt < 10) return start(port + 1, attempt + 1);
    console.error(e.message);
    process.exit(1);
  });
  server.listen(port, "127.0.0.1", () => {
    fs.writeFileSync(LOCK, JSON.stringify({ port, pid: process.pid }));
    const url = `http://127.0.0.1:${port}`;
    console.log(`Project Hub ready: ${url}  (press Ctrl+C to stop)`);
    if (args.has("--open")) openBrowser(url);
  });
  const cleanup = () => { fs.rmSync(LOCK, { force: true }); process.exit(0); };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

needs.ensureInbox();
if (args.has("--status")) {
  printStatus();
} else {
  const live = runningServer();
  if (live) {
    console.log(`Already running: http://127.0.0.1:${live.port}`);
    if (args.has("--open")) openBrowser(`http://127.0.0.1:${live.port}`);
  } else {
    start(Number(readJson(path.join(HUB, "config.json"), {}).port) || 4777);
  }
}
