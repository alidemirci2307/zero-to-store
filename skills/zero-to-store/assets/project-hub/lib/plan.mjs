// Reads the PLAN.md index + docs/plan/phase-XX files and turns them into a structured
// plan. The markdown files are the single source; no copy is kept here.
// Expected format: assets/templates/PLAN.template.md and PHASE.template.md.
import fs from "node:fs";
import path from "node:path";

// English and Turkish PLAN.md/phase files are both accepted (templates exist in both languages)
const STATUS = [[/^\[x\]/i, "done"], [/^\[~\]/, "active"], [/^\[(iptal|cancell?ed)\]/i, "cancelled"], [/^\[ \]/, "todo"]];
const UNITS = {
  hours: 60, hour: 60, hrs: 60, hr: 60, h: 60, min: 1, m: 1, days: 1440, day: 1440, // English: 2h, 1h30m, 45m
  saat: 60, sa: 60, s: 60, dakika: 1, dk: 1, d: 1, "gün": 1440, g: 1440, // Turkish: 2s, 1s30d, 45d
};
const HEADINGS = {
  criteria: "(?:Done Criteria|Bitti Kriterleri)",
  stats: "(?:Statistics|İstatistik)",
  log: "(?:Phase Completion Log|Faz Tamamlanma Günlüğü)",
};

// "2s", "1.5s", "2s10d", "45dk" -> minutes; null if unparseable
export function parseDuration(text) {
  let total = 0;
  let found = false;
  for (const [, num, unit] of String(text ?? "").matchAll(/(\d+(?:[.,]\d+)?)\s*(hours|hour|hrs|hr|min|days|day|saat|sa|dakika|dk|gün|s|h|d|m|g)/gi)) {
    total += parseFloat(num.replace(",", ".")) * UNITS[unit.toLowerCase()];
    found = true;
  }
  return found ? Math.round(total) : null;
}

const splitRow = (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((s) => s.trim());

// Text under a "## Heading" (up to the next ## heading)
function sectionText(md, heading) {
  const m = md.match(new RegExp(`^##\\s+${heading}[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))`, "m"));
  return m ? m[1] : null;
}

export function createPlan({ root }) {
  const planDir = path.join(root, "docs", "plan") + path.sep;

  function readPhase(rel) {
    if (!rel) return { markdown: null, missing: true };
    const abs = path.resolve(root, rel);
    if (!abs.startsWith(planDir) || !fs.existsSync(abs)) return { markdown: null, missing: true };
    const md = fs.readFileSync(abs, "utf8");
    const crit = sectionText(md, HEADINGS.criteria) ?? md;
    return {
      markdown: md,
      criteria: {
        done: (crit.match(/^\s*[-*]\s+\[x\]/gim) ?? []).length,
        total: (crit.match(/^\s*[-*]\s+\[[ x]\]/gim) ?? []).length,
      },
      goal: md.match(/^\s*-\s*(?:In scope|Yapılacak):\s*(.+)$/m)?.[1]?.trim() ?? "",
    };
  }

  function parsePhases(lines) {
    const hi = lines.findIndex((l) => /^\|\s*#\s*\|\s*(?:Phase|Faz)\s*\|/i.test(l));
    if (hi < 0) return [];
    const header = splitRow(lines[hi]).map((h) => h.toLocaleLowerCase("tr"));
    const col = (...names) => header.findIndex((h) => names.some((n) => h.startsWith(n)));
    const C = {
      name: col("phase", "faz"), status: col("status", "durum"), deps: col("depends", "bağlı"),
      group: col("group", "grup"), est: col("estimate", "tahmin"), start: col("start", "başlangıç"),
      end: col("end", "bitiş"), dur: col("duration", "süre"), file: col("file", "dosya"),
    };
    const phases = [];
    for (let i = hi + 2; i < lines.length && lines[i].trim().startsWith("|"); i++) {
      const cells = splitRow(lines[i]);
      const get = (k) => (C[k] >= 0 ? cells[C[k]] ?? "" : "");
      const statusCell = get("status");
      const file = get("file").match(/\]\(([^)]+)\)/)?.[1] ?? get("file");
      phases.push({
        no: cells[0],
        name: get("name"),
        status: STATUS.find(([re]) => re.test(statusCell))?.[1] ?? "todo",
        statusNote: statusCell.replace(/^\[[^\]]*\]\s*/, "").replace(/^[—–-]\s*/, ""),
        deps: get("deps").split(/[,\s]+/).filter((d) => /^\d+$/.test(d)),
        group: get("group"),
        estimate: get("est"),
        estimateMin: parseDuration(get("est")),
        start: get("start"),
        end: get("end"),
        duration: get("dur"),
        durationMin: parseDuration(get("dur")),
        file,
        ...readPhase(file),
      });
    }
    return phases;
  }

  function load() {
    const file = path.join(root, "PLAN.md");
    if (!fs.existsSync(file)) return { exists: false, phases: [] };
    const text = fs.readFileSync(file, "utf8");
    const list = (heading) => (sectionText(text, heading) ?? "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .split("\n").map((l) => l.trim()).filter((l) => /^[-*]\s/.test(l)).map((l) => l.replace(/^[-*]\s+/, ""));
    return {
      exists: true,
      title: text.match(/^#\s+(.+)$/m)?.[1] ?? "Plan",
      graph: text.match(/```[^\n]*\n([\s\S]*?)```/)?.[1] ?? "",
      phases: parsePhases(text.split("\n")),
      stats: list(HEADINGS.stats),
      log: list(HEADINGS.log),
      updatedAt: fs.statSync(file).mtime.toISOString(),
    };
  }

  return { load };
}
