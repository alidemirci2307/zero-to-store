// Plan view — live roadmap built from PLAN.md + docs/plan/phase-XX files.
import { esc, md, icon, phaseKey, formatMinutes } from "./format.js";
import { markdown } from "./markdown.js";
import { isOpenNeed, NEED_STATUS } from "./needs.js";
import { t } from "./i18n.js";

const PHASE_STATUS = Object.fromEntries(["done", "active", "ready", "todo", "cancelled"].map((k) => [k, t(`ps.${k}`)]));
const $ = (id) => document.getElementById(id);

// Phase progress ratio (0-1): done=1, criteria ratio if active, 0 otherwise
function ratio(p) {
  if (p.status === "done") return 1;
  if (p.status !== "active") return 0;
  return p.criteria?.total ? p.criteria.done / p.criteria.total : 0.1;
}

function analyse(plan, needs) {
  const phases = plan.phases.map((p) => ({ ...p, key: phaseKey(p.no) }));
  const byKey = new Map(phases.map((p) => [p.key, p]));
  for (const p of phases) {
    p.needs = needs.filter((n) => (n.phases ?? []).some((x) => phaseKey(x) === p.key) && n.status !== "cancelled");
    p.openNeeds = p.needs.filter((n) => isOpenNeed(n.status));
    p.blocks = phases.filter((q) => q.deps.some((d) => phaseKey(d) === p.key)).map((q) => q.no);
    p.view = p.status === "todo" && p.deps.every((d) => ["done", "cancelled"].includes(byKey.get(phaseKey(d))?.status))
      ? "ready" : p.status;
    p.remainingMin = p.estimateMin == null ? null : p.estimateMin * (1 - ratio(p));
  }
  const live = phases.filter((p) => p.status !== "cancelled");
  const done = live.filter((p) => p.status === "done");
  const groups = new Map();
  for (const p of phases) {
    const g = p.group || "—";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(p);
  }
  const ordered = [...groups.entries()].sort(([a], [b]) => (parseInt(a.replace(/\D/g, ""), 10) || 999) - (parseInt(b.replace(/\D/g, ""), 10) || 999));
  const remainingParallel = ordered.reduce((sum, [, ps]) => sum + Math.max(0, ...ps.map((p) => p.remainingMin ?? 0)), 0);
  const remainingSerial = live.reduce((sum, p) => sum + (p.remainingMin ?? 0), 0);
  const spent = done.reduce((sum, p) => sum + (p.durationMin ?? 0), 0);
  const estDone = done.filter((p) => p.estimateMin && p.durationMin);
  const accuracy = estDone.length
    ? estDone.reduce((s, p) => s + p.durationMin, 0) / estDone.reduce((s, p) => s + p.estimateMin, 0) : null;
  const progress = live.length ? live.reduce((s, p) => s + ratio(p), 0) / live.length : 0;
  // Open needs for upcoming work: active/ready phases first, then phase order
  const rank = { active: 0, ready: 1, todo: 2 };
  const upcoming = [];
  for (const p of [...phases].sort((a, b) => (rank[a.view] ?? 9) - (rank[b.view] ?? 9) || a.key - b.key)) {
    if (!(p.view in rank)) continue;
    for (const n of p.openNeeds) if (!upcoming.some((u) => u.need.id === n.id)) upcoming.push({ need: n, phase: p });
  }
  return { phases, byKey, groups: ordered, live, done, progress, remainingParallel, remainingSerial, spent, accuracy, upcoming };
}

const bar = (value, cls = "") => `<div class="bar ${cls}"><span data-w="${Math.round(value * 100)}"></span></div>`;

function statCards(a, needs) {
  const active = a.phases.filter((p) => p.status === "active");
  const openNeeds = needs.filter((n) => isOpenNeed(n.status)).length;
  return `<div class="stats">
    <div class="stat stat-main"><span class="stat-label">${icon("spark")} ${t("stat.progress")}</span>
      <strong class="stat-value">${Math.round(a.progress * 100)}%</strong>
      ${bar(a.progress, "bar-lg")}<span class="stat-sub">${t("stat.phasesDone", { done: a.done.length, total: a.live.length })}</span></div>
    <div class="stat"><span class="stat-label"><i class="dot-live"></i> ${t("stat.now")}</span>
      <strong class="stat-value">${active.length}</strong>
      <span class="stat-sub">${active.length ? active.map((p) => esc(p.name)).join(", ") : t("stat.idle")}</span></div>
    <div class="stat"><span class="stat-label">${icon("clock")} ${t("stat.remaining")}</span>
      <strong class="stat-value">${formatMinutes(a.remainingParallel)}</strong>
      <span class="stat-sub">${t("stat.parallel", { serial: formatMinutes(a.remainingSerial) })}</span></div>
    <a class="stat stat-link${openNeeds ? " stat-alert" : ""}" href="#/needs"><span class="stat-label">${icon("users")} ${t("stat.needs")}</span>
      <strong class="stat-value">${openNeeds}</strong>
      <span class="stat-sub">${openNeeds ? t("stat.goNeeds") : t("stat.allGood")}</span></a>
  </div>`;
}

function callout(a) {
  if (!a.upcoming.length) return "";
  const first = a.upcoming[0];
  const head = first.phase.view === "active"
    ? t("co.active", { no: esc(first.phase.no) })
    : t("co.upcoming");
  return `<section class="callout">
    <div class="callout-head"><span class="callout-icon">${icon("alert")}</span><div>
      <h2>${head}</h2><p>${t("co.text")}</p></div></div>
    <div class="callout-list">${a.upcoming.slice(0, 5).map(({ need, phase }) => `
      <a class="callout-item" href="#/needs/${esc(need.id)}">
        <span class="ci-phase">${t("co.phase", { no: esc(phase.no) })}</span>
        <span class="ci-main"><strong>${esc(need.title)}</strong><span>${md(need.summary ?? "")}</span></span>
        <span class="ci-meta">${need.eta ? `${icon("clock")} ${esc(need.eta)}` : ""}</span>
        <span class="ci-go">${t("co.fill")} ${icon("arrow")}</span>
      </a>`).join("")}</div>
    ${a.upcoming.length > 5 ? `<a class="callout-more" href="#/needs">${t("co.more", { n: a.upcoming.length - 5 })}</a>` : ""}
  </section>`;
}

function needChip(p) {
  if (!p.needs.length) return "";
  if (p.openNeeds.length) return `<a class="pchip pchip-warn" href="#/needs/${esc(p.openNeeds[0].id)}">${icon("users")} ${t("pc.waiting", { n: p.openNeeds.length })}</a>`;
  return `<span class="pchip pchip-ok">${icon("check")} ${t("pc.ready")}</span>`;
}

function phaseCard(p, i) {
  const crit = p.criteria?.total ? t("pc.criteria", { done: p.criteria.done, total: p.criteria.total }) : "";
  const time = p.status === "done" && p.duration ? `${esc(p.estimate || "—")} → ${esc(p.duration)}` : esc(p.estimate || "—");
  return `<article class="phase ps-${p.view}" data-phase="${esc(p.key)}" tabindex="0" role="button" aria-label="${t("pc.open", { no: esc(p.no) })}" data-i="${i}">
    <div class="phase-top"><span class="phase-no">${p.status === "done" ? icon("check") : esc(p.no)}</span>
      <span class="pstatus">${p.view === "active" ? '<i class="dot-live"></i>' : ""}${PHASE_STATUS[p.view]}</span></div>
    <h3>${esc(p.name)}</h3>
    ${p.goal ? `<p class="phase-goal">${md(p.goal)}</p>` : ""}
    ${p.status === "active" && p.statusNote ? `<p class="phase-note">${md(p.statusNote)}</p>` : ""}
    ${bar(ratio(p), p.status === "active" ? "bar-active" : p.status === "done" ? "bar-done" : "")}
    <div class="phase-meta"><span>${icon("clock")} ${time}</span>${crit ? `<span>${icon("list")} ${crit}</span>` : ""}
      ${p.deps.length ? `<span title="${t("pc.deps")}">← ${p.deps.map(esc).join(", ")}</span>` : ""}</div>
    ${needChip(p)}
  </article>`;
}

function roadmap(a) {
  let n = 0;
  return `<section class="roadmap">${a.groups.map(([g, ps], gi) => {
    const allDone = ps.every((p) => ["done", "cancelled"].includes(p.status));
    const running = ps.some((p) => p.status === "active");
    return `${gi ? `<div class="lane-link" aria-hidden="true">${icon("arrow")}</div>` : ""}
    <div class="lane${allDone ? " lane-done" : ""}${running ? " lane-active" : ""}">
      <div class="lane-head"><span class="lane-step">${allDone ? icon("check") : gi + 1}</span>
        <div><strong>${t("lane.stage", { n: gi + 1 })}${g !== "—" ? ` · ${esc(g)}` : ""}</strong>
        <span>${ps.length > 1 ? t("lane.parallel", { n: ps.length }) : t("lane.single")}</span></div></div>
      <div class="lane-grid">${ps.map((p) => phaseCard(p, n++)).join("")}</div>
    </div>`;
  }).join("")}</section>`;
}

function extras(plan) {
  const log = plan.log?.length
    ? `<details class="fold" open><summary>${t("log.title")} <span>${plan.log.length}</span></summary>
       <ul class="log">${[...plan.log].reverse().map((l) => `<li>${md(l)}</li>`).join("")}</ul></details>` : "";
  const graph = plan.graph ? `<details class="fold"><summary>${t("graph.title")}</summary><pre class="md-code">${esc(plan.graph)}</pre></details>` : "";
  return log || graph ? `<section class="extras">${log}${graph}</section>` : "";
}

function phaseDrawer(p, a) {
  const meta = [
    [t("d.status"), PHASE_STATUS[p.view]], [t("d.group"), p.group || "—"], [t("d.estimate"), p.estimate || "—"],
    [t("d.actual"), p.duration || "—"], [t("d.start"), p.start || "—"], [t("d.end"), p.end || "—"],
    [t("d.deps"), p.deps.length ? p.deps.join(", ") : "—"], [t("d.blocks"), p.blocks.length ? p.blocks.join(", ") : "—"],
  ].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("");
  const needs = p.needs.length ? `<div class="d-needs"><h3>${icon("users")} ${t("d.needs")}</h3>
    ${p.needs.map((n) => `<a class="d-need ${isOpenNeed(n.status) ? "is-open" : ""}" href="#/needs/${esc(n.id)}">
      <span><strong>${esc(n.title)}</strong><span>${md(n.summary ?? "")}</span></span>
      <span class="badge b-${n.status}">${NEED_STATUS[n.status] ?? esc(n.status)}</span></a>`).join("")}</div>` : "";
  // The "> Durum: · Bağlı: …" quote in the heading repeats the meta boxes above; not shown
  const source = (p.markdown ?? "").replace(/^>\s*(Durum|Status):.*\n(>.*\n)*/m, "");
  const body = p.markdown ? `<div class="md">${markdown(source)}</div>`
    : `<div class="notice n-warn">${icon("alert")}<p>${t("d.missing")} <code>${esc(p.file || t("d.noFile"))}</code></p></div>`;
  return `<div class="d-progress">${bar(ratio(p), p.status === "active" ? "bar-active bar-lg" : "bar-lg")}
      <span>${Math.round(ratio(p) * 100)}%${p.criteria?.total ? ` · ${t("d.criteria", { done: p.criteria.done, total: p.criteria.total })}` : ""}</span></div>
    ${p.status === "active" && p.statusNote ? `<div class="notice n-info">${icon("info")}<p>${md(p.statusNote)}</p></div>` : ""}
    ${needs}<dl class="d-meta">${meta}</dl>${body}`;
}

// Set bar widths on the next frame so they animate up from 0
function animateBars(root) {
  requestAnimationFrame(() => root.querySelectorAll(".bar > span[data-w]").forEach((s) => { s.style.width = `${s.dataset.w}%`; }));
  root.querySelectorAll("[data-i]").forEach((el) => el.style.setProperty("--i", el.dataset.i));
}

export function createPlanView({ navigate }) {
  let sig = "";
  let drawerSig = "";
  let analysis = null;
  let openPhase = null;

  function render(plan, needs) {
    const next = JSON.stringify([plan, needs]);
    if (next === sig) return;
    sig = next;
    const root = $("plan-root");
    if (!plan.exists) {
      root.innerHTML = `<section class="empty"><div class="empty-icon">${icon("flag")}</div><h2>${t("plan.none")}</h2>
        <p>${t("plan.noneText")}</p></section>`;
      return;
    }
    analysis = analyse(plan, needs);
    $("plan-title").textContent = plan.title.replace(/^PLAN\s*[—-]\s*/i, "").replace(/\s*\((İNDEKS|INDEX)\)\s*$/i, "");
    root.innerHTML = statCards(analysis, needs) + callout(analysis) + roadmap(analysis) + extras(plan);
    animateBars(root);
    if (openPhase) showPhase(openPhase);
  }

  function showPhase(key) {
    openPhase = key;
    const p = analysis?.byKey.get(key);
    if (!p) return;
    $("drawer-eyebrow").textContent = `${t("d.phase", { no: p.no })}${p.group ? ` · ${p.group}` : ""}`;
    $("drawer-title").textContent = p.name;
    const next = JSON.stringify(p);
    if (next !== drawerSig) {
      drawerSig = next;
      const body = $("drawer-body");
      const scroll = body.scrollTop;
      body.innerHTML = phaseDrawer(p, analysis);
      body.scrollTop = scroll;
      animateBars(body);
    }
    $("drawer-backdrop").hidden = false;
    requestAnimationFrame(() => document.body.classList.add("drawer-open"));
    $("drawer").setAttribute("aria-hidden", "false");
  }

  function hidePhase() {
    openPhase = null;
    drawerSig = "";
    document.body.classList.remove("drawer-open");
    $("drawer").setAttribute("aria-hidden", "true");
    setTimeout(() => { if (!openPhase) $("drawer-backdrop").hidden = true; }, 300);
  }

  $("plan-root").addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const card = e.target.closest("[data-phase]");
    if (card) navigate(`#/plan/${card.dataset.phase}`);
  });
  $("plan-root").addEventListener("keydown", (e) => {
    const card = e.target.closest("[data-phase]");
    if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); navigate(`#/plan/${card.dataset.phase}`); }
  });
  $("drawer-close").addEventListener("click", () => navigate("#/plan"));
  $("drawer-backdrop").addEventListener("click", () => navigate("#/plan"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && openPhase) navigate("#/plan"); });

  return { render, showPhase, hidePhase };
}
