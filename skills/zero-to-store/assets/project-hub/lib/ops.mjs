// Post-launch operations data for the Operations tab (RULES.md Section 18):
//   ops/config.json      autonomy level, SLO thresholds
//   ops/metrics.jsonl    one JSON object per day, written by the daily routine
//   docs/ops/daily/YYYY-MM-DD.md and docs/ops/weekly-YYYY-MM-DD.md   reports
import fs from "node:fs";
import path from "node:path";
import { readJson } from "./needs.mjs";

const DEFAULT_SLO = { crashFreeUsersPct: 99.5, playCrashRatePct: 1.09, playAnrRatePct: 0.47 };
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const REPORT_ID_RE = /^(weekly-)?\d{4}-\d{2}-\d{2}$/;
const MAX_DAYS = 90;
const MAX_REPORTS = 60;

export function createOps({ root }) {
  const opsDir = path.join(root, "ops");
  const dailyDir = path.join(root, "docs", "ops", "daily");
  const weeklyDir = path.join(root, "docs", "ops");

  // Broken lines are skipped (and counted) instead of failing the whole tab
  function readMetrics() {
    const file = path.join(opsDir, "metrics.jsonl");
    if (!fs.existsSync(file)) return { metrics: [], skipped: 0 };
    let skipped = 0;
    const metrics = fs.readFileSync(file, "utf8").split("\n").filter((l) => l.trim()).map((line) => {
      try {
        const row = JSON.parse(line);
        if (DAY_RE.test(row.date ?? "")) return row;
      } catch { /* counted below */ }
      skipped++;
      return null;
    }).filter(Boolean);
    metrics.sort((a, b) => a.date.localeCompare(b.date));
    return { metrics: metrics.slice(-MAX_DAYS), skipped };
  }

  function listReports() {
    const daily = fs.existsSync(dailyDir)
      ? fs.readdirSync(dailyDir).filter((f) => DAY_RE.test(f.replace(/\.md$/, "")) && f.endsWith(".md"))
        .map((f) => ({ id: f.slice(0, -3), date: f.slice(0, 10), kind: "daily" }))
      : [];
    const weekly = fs.existsSync(weeklyDir)
      ? fs.readdirSync(weeklyDir).filter((f) => /^weekly-\d{4}-\d{2}-\d{2}\.md$/.test(f))
        .map((f) => ({ id: f.slice(0, -3), date: f.slice(7, 17), kind: "weekly" }))
      : [];
    return [...daily, ...weekly].sort((a, b) => b.date.localeCompare(a.date) || a.kind.localeCompare(b.kind))
      .slice(0, MAX_REPORTS);
  }

  function report(id) {
    if (!REPORT_ID_RE.test(id ?? "")) return null;
    const file = id.startsWith("weekly-") ? path.join(weeklyDir, `${id}.md`) : path.join(dailyDir, `${id}.md`);
    return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  }

  function load() {
    const config = readJson(path.join(opsDir, "config.json"));
    const { metrics, skipped } = readMetrics();
    const reports = listReports();
    return {
      enabled: Boolean(config),
      autonomy: config?.autonomy ?? null,
      soakHours: config?.soakHours ?? null,
      slo: { ...DEFAULT_SLO, ...(config?.slo ?? {}) },
      metrics,
      skippedLines: skipped,
      reports,
      latest: reports[0] ? { ...reports[0], markdown: report(reports[0].id) } : null,
      locked: fs.existsSync(path.join(opsDir, ".lock")),
    };
  }

  return { load, report, REPORT_ID_RE };
}
