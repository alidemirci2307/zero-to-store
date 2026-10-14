// Operations view — what the daily routine saw and did (RULES.md Section 18).
// Data: state.ops = { enabled, autonomy, slo, metrics[], reports[], latest, locked, skippedLines }
import { esc, icon } from "./format.js";
import { markdown } from "./markdown.js";
import { t, lang } from "./i18n.js";

const $ = (id) => document.getElementById(id);
const PLATFORMS = [["android", "Android", "s1"], ["ios", "iOS", "s2"]]; // key, label, series color slot
const fmtDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(lang, { day: "numeric", month: "short" });
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const pct = (v) => (v == null ? "—" : `${v.toFixed(2)}%`);

// The metrics row closest to 7 days before the latest one (for "vs 7 days ago")
function weekAgo(metrics) {
  if (metrics.length < 2) return null;
  const target = new Date(`${metrics.at(-1).date}T00:00:00`).getTime() - 7 * 864e5;
  return metrics.slice(0, -1).reduce((best, m) => {
    const d = Math.abs(new Date(`${m.date}T00:00:00`).getTime() - target);
    return !best || d < best.d ? { m, d } : best;
  }, null).m;
}

function sloState(value, slo) {
  if (value == null) return null;
  if (value >= slo) return ["ok", "ops.s.ok", "check"];
  if (value >= slo - 0.3) return ["warn", "ops.s.warn", "alert"];
  return ["bad", "ops.s.bad", "alert"];
}

function tiles(o) {
  const last = o.metrics.at(-1) ?? {};
  const prev = weekAgo(o.metrics) ?? {};
  const crash = PLATFORMS.map(([k]) => num(last.crashFreeUsersPct?.[k])).filter((v) => v != null);
  const worst = crash.length ? Math.min(...crash) : null;
  const state = sloState(worst, o.slo.crashFreeUsersPct);
  const delta = (a, b, digits = 0) => (a == null || b == null ? "" : t("ops.vsWeek", { d: `${a - b >= 0 ? "+" : ""}${(a - b).toFixed(digits)}` }));
  const ratings = PLATFORMS.map(([k, label]) => (num(last.rating?.[k]) == null ? null : `${label} ${last.rating[k].toFixed(1)}`)).filter(Boolean);
  const release = [...o.metrics].reverse().find((m) => m.release);
  const humans = PLATFORMS.reduce((s, [k]) => s + (num(last.humans?.[k]) ?? 0), 0);
  return `<div class="stats ops-stats">
    <div class="stat"><span class="stat-label">${icon("spark")} ${t("ops.t.crash")}</span>
      <strong class="stat-value">${pct(worst)}</strong>
      ${state ? `<span class="slo slo-${state[0]}">${icon(state[2])} ${t(state[1])} · ${t("ops.slo", { v: o.slo.crashFreeUsersPct })}</span>` : ""}
      <span class="stat-sub">${PLATFORMS.map(([k, label]) => `${label} ${pct(num(last.crashFreeUsersPct?.[k]))}`).join(" · ")}</span></div>
    <div class="stat"><span class="stat-label">${icon("users")} ${t("ops.t.rating")}</span>
      <strong class="stat-value">${ratings.length ? ratings.join(" · ") : "—"}</strong>
      <span class="stat-sub">${humans ? t("ops.humans", { n: humans }) : ""}</span></div>
    <div class="stat"><span class="stat-label">${icon("alert")} ${t("ops.t.issues")}</span>
      <strong class="stat-value">${num(last.openIssues) ?? "—"}</strong>
      <span class="stat-sub">${delta(num(last.openIssues), num(prev.openIssues))}</span></div>
    <div class="stat"><span class="stat-label">${icon("flag")} ${t("ops.t.release")}</span>
      <strong class="stat-value ops-release">${release ? esc(release.release) : "—"}</strong>
      <span class="stat-sub">${release ? fmtDate(release.date) : t("ops.noRelease")}</span></div>
  </div>`;
}

// One-axis line chart: per-platform series, optional dashed reference line, end labels, hover layer
function lineChart(id, title, metrics, pick, { ref, digits }) {
  const rows = metrics.map((m) => ({ date: m.date, v: PLATFORMS.map(([k]) => num(pick(m)?.[k])) }));
  const all = rows.flatMap((r) => r.v).filter((v) => v != null);
  if (rows.length < 2 || !all.length) return `<section class="ops-card"><h3>${title}</h3><p class="ops-muted">${t("ops.c.empty")}</p></section>`;
  const W = 640, H = 210, L = 44, R = 92, T = 14, B = 26;
  let lo = Math.min(...all, ref ?? Infinity), hi = Math.max(...all, ref ?? -Infinity);
  const pad = Math.max((hi - lo) * 0.15, 10 ** -digits);
  lo -= pad; hi += pad;
  const x = (i) => L + (i * (W - L - R)) / (rows.length - 1);
  const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const ticks = [lo + pad, (lo + hi) / 2, hi - pad];
  // End labels: one per series at its last point, nudged apart so they never overlap
  const ends = PLATFORMS.map((_, p) => {
    const i = rows.map((r) => r.v[p]).findLastIndex((v) => v != null);
    return i < 0 ? null : { p, i, ly: y(rows[i].v[p]) };
  }).filter(Boolean).sort((a, b) => a.ly - b.ly);
  ends.forEach((e, k) => { if (k && e.ly - ends[k - 1].ly < 15) e.ly = ends[k - 1].ly + 15; });
  const lines = PLATFORMS.map(([, label, slot], p) => {
    let d = "", pen = false;
    rows.forEach((r, i) => {
      if (r.v[p] == null) { pen = false; return; }
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(r.v[p]).toFixed(1)}`;
      pen = true;
    });
    const e = ends.find((n) => n.p === p);
    const end = !e ? "" : `<circle cx="${x(e.i)}" cy="${y(rows[e.i].v[p])}" r="4" class="mk ${slot}"/>
      <text x="${x(e.i) + 8}" y="${e.ly + 4}" class="lbl">${label} ${rows[e.i].v[p].toFixed(digits)}</text>`;
    return `<path d="${d}" class="ln ${slot}"/>${end}`;
  }).join("");
  const refLine = ref == null ? "" : `<line x1="${L}" x2="${W - R}" y1="${y(ref)}" y2="${y(ref)}" class="ref"/>
    <text x="${L + 4}" y="${y(ref) - 5}" class="lbl muted">${t("ops.slo", { v: ref })}</text>`;
  return `<section class="ops-card" id="${id}"><div class="ops-card-head"><h3>${title}</h3>
      <span class="legend">${PLATFORMS.map(([, label, slot]) => `<span><i class="sw ${slot}"></i>${label}</span>`).join("")}</span></div>
    <div class="chart" data-rows='${esc(JSON.stringify(rows))}' data-digits="${digits}">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
        ${ticks.map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${L - 6}" y="${y(v) + 4}" class="tick" text-anchor="end">${v.toFixed(digits)}</text>`).join("")}
        ${refLine}${lines}
        <text x="${L}" y="${H - 6}" class="tick">${fmtDate(rows[0].date)}</text>
        <text x="${W - R}" y="${H - 6}" class="tick" text-anchor="end">${fmtDate(rows.at(-1).date)}</text>
        <line class="cross" y1="${T}" y2="${H - B}" x1="0" x2="0" visibility="hidden"/>
        <rect class="hit" x="${L}" y="${T}" width="${W - L - R}" height="${H - T - B}" data-l="${L}" data-w="${W - L - R}" data-vw="${W}"/>
      </svg><div class="tip" hidden></div></div></section>`;
}

function hover(root) {
  root.querySelectorAll(".chart").forEach((chart) => {
    const rows = JSON.parse(chart.dataset.rows);
    const digits = Number(chart.dataset.digits);
    const hit = chart.querySelector(".hit");
    const cross = chart.querySelector(".cross");
    const tip = chart.querySelector(".tip");
    const move = (e) => {
      const box = chart.querySelector("svg").getBoundingClientRect();
      const scale = Number(hit.dataset.vw) / box.width;
      const px = (e.clientX - box.left) * scale;
      const i = Math.max(0, Math.min(rows.length - 1, Math.round(((px - Number(hit.dataset.l)) / Number(hit.dataset.w)) * (rows.length - 1))));
      const cx = Number(hit.dataset.l) + (i * Number(hit.dataset.w)) / (rows.length - 1);
      cross.setAttribute("x1", cx); cross.setAttribute("x2", cx); cross.setAttribute("visibility", "visible");
      tip.innerHTML = `<strong>${fmtDate(rows[i].date)}</strong>${PLATFORMS.map(([, label, slot], p) =>
        `<span><i class="sw ${slot}"></i>${label} ${rows[i].v[p] == null ? "—" : rows[i].v[p].toFixed(digits)}</span>`).join("")}`;
      tip.hidden = false;
      tip.style.left = `${Math.min(cx / scale + 12, box.width - 150)}px`;
    };
    hit.addEventListener("mousemove", move);
    hit.addEventListener("mouseleave", () => { tip.hidden = true; cross.setAttribute("visibility", "hidden"); });
  });
}

function asoTable(metrics) {
  const last = metrics.at(-1)?.aso ?? {};
  const prev = weekAgo(metrics)?.aso ?? {};
  const keys = Object.keys(last).sort();
  if (!keys.length) return `<section class="ops-card"><h3>${t("ops.aso")}</h3><p class="ops-muted">${t("ops.aso.empty")}</p></section>`;
  const rows = keys.map((k) => {
    const [store, country, ...kw] = k.split("|");
    const now = num(last[k]), before = num(prev[k]);
    const moved = now != null && before != null ? before - now : null; // lower rank is better
    const change = moved == null || moved === 0 ? "—"
      : `<span class="${moved > 0 ? "up" : "down"}">${moved > 0 ? "▲" : "▼"} ${Math.abs(moved)}</span>`;
    return `<tr><td>${esc(kw.join("|"))}</td><td>${esc(store)}</td><td>${esc(country.toUpperCase())}</td>
      <td class="n">${now ?? "—"}</td><td class="n">${before ?? "—"}</td><td class="n">${change}</td></tr>`;
  }).join("");
  return `<section class="ops-card"><h3>${t("ops.aso")}</h3><div class="ops-table"><table>
    <thead><tr><th>${t("ops.aso.kw")}</th><th>${t("ops.aso.store")}</th><th>${t("ops.aso.country")}</th>
    <th class="n">${t("ops.aso.now")}</th><th class="n">${t("ops.aso.week")}</th><th class="n">${t("ops.aso.change")}</th></tr></thead>
    <tbody>${rows}</tbody></table></div></section>`;
}

function reportsHtml(o, selected) {
  if (!o.reports.length) return `<section class="ops-card"><h3>${t("ops.reports")}</h3><p class="ops-muted">${t("ops.r.empty")}</p></section>`;
  return `<section class="ops-card ops-reports"><h3>${t("ops.reports")}</h3>
    <nav class="report-list">${o.reports.map((r) => `<a href="#/ops/${esc(r.id)}" class="${r.id === selected ? "on" : ""}">
      ${fmtDate(r.date)} <span class="tag-${r.kind}">${t(`ops.r.${r.kind}`)}</span></a>`).join("")}</nav>
    <article class="md" id="ops-report"></article></section>`;
}

export function createOpsView({ api }) {
  let sig = "";
  let data = null;
  let selected = null;

  async function showReport(id) {
    selected = id || data?.latest?.id || null;
    const box = $("ops-report");
    if (!box || !selected) return;
    document.querySelectorAll(".report-list a").forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#/ops/${selected}`));
    let md = data?.latest?.id === selected ? data.latest.markdown : null;
    if (md == null) md = (await api(`/api/ops/report/${encodeURIComponent(selected)}`).catch(() => null))?.markdown ?? "";
    box.innerHTML = markdown(md);
  }

  function render(o) {
    const next = JSON.stringify(o);
    if (next === sig) return;
    sig = next;
    data = o;
    const root = $("ops-root");
    if (!o.enabled && !o.metrics.length && !o.reports.length) {
      root.innerHTML = `<section class="empty"><div class="empty-icon">${icon("spark")}</div><h2>${t("ops.off")}</h2><p>${t("ops.offText")}</p></section>`;
      return;
    }
    const last = o.metrics.at(-1);
    const meta = [o.autonomy && `<span class="pchip">${t("ops.autonomy")}: ${t(`ops.a.${o.autonomy}`)}</span>`,
      last && `<span class="pchip">${t("ops.lastRun", { date: fmtDate(last.date) })}</span>`,
      o.locked && `<span class="pchip pchip-warn">${icon("clock")} ${t("ops.locked")}</span>`].filter(Boolean).join("");
    root.innerHTML = `<div class="ops-meta">${meta}</div>
      ${o.skippedLines ? `<div class="notice n-warn">${icon("alert")}<p>${t("ops.skipped", { n: o.skippedLines })}</p></div>` : ""}
      ${o.metrics.length ? tiles(o) : `<div class="notice n-info">${icon("info")}<p>${t("ops.noData")}</p></div>`}
      <div class="ops-grid">
        ${lineChart("ops-crash", t("ops.c.crash"), o.metrics, (m) => m.crashFreeUsersPct, { ref: o.slo.crashFreeUsersPct, digits: 2 })}
        ${lineChart("ops-rating", t("ops.c.rating"), o.metrics, (m) => m.rating, { digits: 1 })}
      </div>
      ${asoTable(o.metrics)}
      ${reportsHtml(o, selected ?? o.latest?.id)}`;
    hover(root);
    showReport(selected);
  }

  return { render, showReport };
}
