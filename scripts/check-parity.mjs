#!/usr/bin/env node
// Checks that the English and Turkish copies of the same document keep the same structure,
// so an update made in only one language fails CI. Compared per "## " section:
// numbered items (in order), bullet count, table rows, code fences.
//   node scripts/check-parity.mjs                      -> all known pairs
//   node scripts/check-parity.mjs a.md a.tr.md         -> one pair
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SKILL = "skills/zero-to-store";
const PAIRS = process.argv.length > 3 ? [[process.argv[2], process.argv[3]]] : [
  [`${SKILL}/references/rules.md`, `${SKILL}/references/rules.tr.md`],
  ...["CLAUDE", "PLAN", "PHASE", "TODO", "DAILY_OPS"].map((n) => [`${SKILL}/assets/templates/${n}.template.md`, `${SKILL}/assets/templates/tr/${n}.template.md`]),
  ["README.md", "README.tr.md"],
];

function shape(file) {
  const sections = [];
  let cur = { title: "(preamble)", numbers: [], bullets: 0, tableRows: 0, fences: 0 };
  sections.push(cur);
  let inFence = false;
  for (const line of fs.readFileSync(path.resolve(ROOT, file), "utf8").split("\n")) {
    if (line.startsWith("```")) { cur.fences++; inFence = !inFence; continue; }
    if (inFence) continue;
    if (/^## /.test(line)) { cur = { title: line.slice(3).trim(), numbers: [], bullets: 0, tableRows: 0, fences: 0 }; sections.push(cur); continue; }
    const num = line.match(/^(\s*)(\d+(?:\.\d+)*)\.\s/);
    if (num) cur.numbers.push(`${num[1].length}:${num[2]}`);
    if (/^\s*[-*]\s/.test(line)) cur.bullets++;
    if (/^\s*\|/.test(line)) cur.tableRows++;
  }
  return sections;
}

let failed = 0;
for (const [a, b] of PAIRS) {
  if (!fs.existsSync(path.resolve(ROOT, a)) || !fs.existsSync(path.resolve(ROOT, b))) { console.log(`- skip ${a} (pair missing)`); continue; }
  const sa = shape(a);
  const sb = shape(b);
  const errors = [];
  if (sa.length !== sb.length) errors.push(`section count ${sa.length} vs ${sb.length}`);
  for (let i = 0; i < Math.min(sa.length, sb.length); i++) {
    const [x, y] = [sa[i], sb[i]];
    const where = `§${i} "${x.title}" / "${y.title}"`;
    const nx = x.numbers.map((n) => n.split(":")[1]).join(",");
    const ny = y.numbers.map((n) => n.split(":")[1]).join(",");
    if (nx !== ny) errors.push(`${where}: numbered items differ\n      ${nx}\n      ${ny}`);
    for (const k of ["bullets", "tableRows", "fences"]) if (x[k] !== y[k]) errors.push(`${where}: ${k} ${x[k]} vs ${y[k]}`);
  }
  if (errors.length) { failed++; console.log(`✗ ${a} <-> ${b}\n  ${errors.join("\n  ")}`); } else console.log(`✓ ${a} <-> ${b}`);
}
if (failed) { console.log(`\n${failed} pair(s) out of sync — update both languages.`); process.exit(1); }
