// Needs Hub view — list, filters, steps, submission.
import { esc, md, icon, timeAgo, toast, copyText, store, phaseKey } from "./format.js";
import { renderForm, wireForm, collect } from "./fields.js";
import { t } from "./i18n.js";

const STATUS_KEYS = ["rejected", "invalid", "pending", "submitted", "processed", "cancelled"];
export const NEED_STATUS = Object.fromEntries(STATUS_KEYS.map((k) => [k, t(`st.${k}`)]));
const ORDER = Object.keys(NEED_STATUS);
export const PRIO = { high: [0, t("prio.high")], medium: [1, t("prio.medium")], low: [2, t("prio.low")] };
export const isOpenNeed = (s) => ["pending", "rejected", "invalid"].includes(s);
const TABS = [
  ["open", t("tab.open"), isOpenNeed],
  ["submitted", t("tab.submitted"), (s) => s === "submitted"],
  ["done", t("tab.done"), (s) => ["processed", "cancelled"].includes(s)],
  ["all", t("tab.all"), () => true],
];
const EMPTY = Object.fromEntries(["open", "submitted", "done", "all"].map((k) => [k, [t(`empty.${k}`), t(`empty.${k}Text`)]]));
const $ = (id) => document.getElementById(id);

export function createNeedsView({ api, refresh }) {
  const state = { items: [], phases: [], tab: "open", open: new Set(), dirty: new Set(), editing: new Set(), cards: new Map() };
  if (TABS.some(([k]) => k === store.get("hub-needs-tab"))) state.tab = store.get("hub-needs-tab");

  const phaseName = (no) => state.phases.find((p) => phaseKey(p.no) === phaseKey(no))?.name;

  function render(items, phases) {
    state.items = items;
    state.phases = phases;
    const counted = items.filter((i) => i.status !== "cancelled");
    const done = counted.filter((i) => i.status === "processed").length;
    const pct = counted.length ? Math.round((done / counted.length) * 100) : 100;
    $("pct").textContent = `${pct}%`;
    $("pct-sub").textContent = t("progress.of", { done, total: counted.length });
    $("ring").style.strokeDashoffset = String(119.4 * (1 - pct / 100));

    $("tabs").innerHTML = TABS.map(([key, label, fn]) => {
      const n = items.filter((i) => fn(i.status)).length;
      return `<button class="tab" role="tab" data-tab="${key}" aria-selected="${state.tab === key}">${label}<span class="count">${n}</span></button>`;
    }).join("");

    const filter = TABS.find(([key]) => key === state.tab)[2];
    const prio = (i) => (PRIO[i.priority] ?? PRIO.medium)[0];
    const visible = items.filter((i) => filter(i.status)).sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status)
      || prio(a) - prio(b) || String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")));
    const list = $("list");
    const keep = new Set();
    visible.forEach((item, i) => {
      keep.add(item.id);
      const sig = JSON.stringify(item) + state.open.has(item.id) + state.editing.has(item.id) + phaseName(item.phases?.[0]);
      let entry = state.cards.get(item.id);
      if (!entry || (entry.sig !== sig && !state.dirty.has(item.id))) {
        const el = buildCard(item);
        el.style.setProperty("--i", String(Math.min(i, 8)));
        if (entry) entry.el.replaceWith(el);
        entry = { el, sig };
        state.cards.set(item.id, entry);
      }
      // Only move if the order changed: re-inserting replays the entrance animation
      if (list.children[i] !== entry.el) list.insertBefore(entry.el, list.children[i] ?? null);
    });
    for (const [id, entry] of state.cards) if (!keep.has(id)) { entry.el.remove(); state.cards.delete(id); }
    $("empty").hidden = visible.length > 0;
    [$("empty-title").textContent, $("empty-text").textContent] = EMPTY[state.tab];
  }

  function statusNotice(item) {
    switch (item.status) {
      case "rejected":
        return `<div class="notice n-err">${icon("alert")}<div><p><strong>${t("n.rejected")}</strong> ${md(item.rejectReason ?? "")}</p><p>${t("n.fixResend")}</p></div></div>`;
      case "invalid":
        return `<div class="notice n-err">${icon("alert")}<p>${t("n.invalid")}</p></div>`;
      case "submitted": {
        const s = item.submittedSummary ?? { fields: 0, files: 0 };
        const edit = state.editing.has(item.id) ? "" : `<p><button type="button" class="btn btn-sm" data-edit>${t("n.edit")}</button></p>`;
        return `<div class="notice n-info">${icon("info")}<div><p><strong>${t("n.submitted")}</strong> · ${timeAgo(item.submittedAt)} · ${t("n.counts", { f: s.fields, d: s.files })}.</p>
          <p>${t("n.willProcess")}</p>${edit}</div></div>`;
      }
      case "processed":
        return `<div class="notice n-ok">${icon("check")}<p><strong>${t("n.processed")}</strong>${item.processedAt ? ` · ${timeAgo(item.processedAt)}` : ""}. ${md(item.processedNote ?? "")}</p></div>`;
      case "cancelled":
        return `<div class="notice n-warn">${icon("block")}<p><strong>${t("n.cancelled")}</strong> ${md(item.cancelReason ?? "")}</p></div>`;
      default:
        return "";
    }
  }

  const section = (title, body) => (body ? `<div class="section"><h4 class="section-title">${title}</h4>${body}</div>` : "");
  const bullets = (arr) => (arr?.length ? `<ul class="bullets">${arr.map((x) => `<li>${md(x)}</li>`).join("")}</ul>` : "");

  function stepsHtml(item) {
    if (!item.steps?.length) return "";
    return `<ol class="steps">${item.steps.map((s, i) => {
      const step = typeof s === "string" ? { title: s } : s;
      const done = store.get(`hub-step:${item.id}:${i}`) === "1";
      const link = step.url ? `<a class="link-btn" href="${esc(step.url)}" target="_blank" rel="noopener noreferrer">${esc(step.urlLabel ?? t("step.open"))} ${icon("ext")}</a>` : "";
      return `<li class="step${done ? " done" : ""}">
        <button type="button" class="step-num" data-step="${i}" aria-label="${t("step.mark", { n: i + 1 })}">${done ? icon("check") : i + 1}</button>
        <div class="step-text"><span class="step-title">${md(step.title)}</span>${step.detail ? `<p>${md(step.detail)}</p>` : ""}${link}</div></li>`;
    }).join("")}</ol>`;
  }

  function buildCard(item) {
    const el = document.createElement("article");
    const prio = PRIO[item.priority] ? item.priority : "medium";
    el.className = `card prio-${prio} st-${item.status}${state.open.has(item.id) ? " open" : ""}`;
    el.id = `need-${item.id}`;
    el.dataset.id = item.id;
    const phaseChips = (item.phases ?? []).map((no) => `<a class="chip chip-phase" href="#/plan/${esc(phaseKey(no))}">${icon("flag")}${t("chip.phase", { no: esc(no) })}${phaseName(no) ? ` · ${esc(phaseName(no))}` : ""}</a>`).join("");
    const chips = [
      item.category && `<span class="chip">${icon("tag")}${esc(item.category)}</span>`,
      item.eta && `<span class="chip">${icon("clock")}${esc(item.eta)}</span>`,
      phaseChips,
      item.blocks?.length && `<span class="chip blocks">${icon("block")}${t("chip.blocks", { n: item.blocks.length })}</span>`,
      `<span class="chip">${PRIO[prio][1]}</span>`,
    ].filter(Boolean).join("");
    const copies = (item.copy ?? []).map((c) => `<div class="copy-row"><span class="copy-label">${esc(c.label)}</span>
      <span class="copy-value">${esc(c.value)}</span><button type="button" class="btn btn-sm" data-copy="${esc(c.value)}">${icon("copy")} ${t("copy.btn")}</button></div>`).join("");
    const canSubmit = ["pending", "rejected"].includes(item.status) || (item.status === "submitted" && state.editing.has(item.id));
    const warnings = item.warnings?.length
      ? `<div class="notice n-warn">${icon("alert")}<div>${item.warnings.map((w) => `<p>${md(w)}</p>`).join("")}</div></div>` : "";

    el.innerHTML = `
      <button type="button" class="card-head" aria-expanded="${state.open.has(item.id)}">
        <div class="head-main"><h3>${esc(item.title)}</h3>${item.summary ? `<p class="summary">${md(item.summary)}</p>` : ""}</div>
        <span class="badge b-${item.status}">${NEED_STATUS[item.status] ?? esc(item.status)}</span>
        <span class="chev">${icon("chevron")}</span>
      </button>
      <div class="chips chips-row">${chips}</div>
      <div class="card-body">
        ${statusNotice(item)}
        ${section(t("sec.why"), (item.why ? `<p class="prose">${md(item.why)}</p>` : "") + (item.blocks?.length ? `<p class="prose"><strong>${t("sec.blocks")}</strong></p>${bullets(item.blocks)}` : ""))}
        ${section(t("sec.before"), bullets(item.prerequisites))}
        ${section(t("sec.copy"), copies)}
        ${section(t("sec.steps"), stepsHtml(item))}
        ${warnings}
        ${canSubmit ? renderForm(item) : ""}
      </div>`;
    const form = el.querySelector("form");
    if (form) wireForm(form);
    return el;
  }

  const rebuild = (id, card) => { state.cards.delete(id); card.remove(); render(state.items, state.phases); };

  $("tabs").addEventListener("click", (e) => {
    const tab = e.target.closest("[data-tab]");
    if (!tab) return;
    state.tab = tab.dataset.tab;
    store.set("hub-needs-tab", state.tab);
    render(state.items, state.phases);
  });

  $("list").addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const id = card.dataset.id;
    if (e.target.closest(".card-head")) {
      state.open.has(id) ? state.open.delete(id) : state.open.add(id);
      card.classList.toggle("open");
      card.querySelector(".card-head").setAttribute("aria-expanded", String(state.open.has(id)));
      state.cards.get(id).sig = null;
      return;
    }
    const copy = e.target.closest("[data-copy]");
    if (copy) return copyText(copy.dataset.copy);
    const step = e.target.closest("[data-step]");
    if (step) {
      const key = `hub-step:${id}:${step.dataset.step}`;
      store.set(key, store.get(key) === "1" ? null : "1");
      return rebuild(id, card);
    }
    if (e.target.closest("[data-edit]")) { state.editing.add(id); rebuild(id, card); }
  });

  const markDirty = (e) => { const f = e.target.closest("form[data-form]"); if (f) state.dirty.add(f.dataset.form); };
  $("list").addEventListener("input", markDirty);
  $("list").addEventListener("change", markDirty);

  $("list").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const id = form.dataset.form;
    const button = form.querySelector("button[type=submit]");
    const payload = await collect(form, state.items.find((i) => i.id === id));
    if (!payload) return;
    button.disabled = true;
    button.textContent = t("field.sending");
    try {
      await api(`/api/needs/${encodeURIComponent(id)}`, { method: "POST", body: JSON.stringify(payload) });
      state.dirty.delete(id);
      state.editing.delete(id);
      toast(t("toast.sent"));
      await refresh();
    } catch (err) {
      if (err.message !== "reload") toast(err.message);
      button.disabled = false;
      button.textContent = t("field.send");
    }
  });

  // #/needs/<id>: switch to the right tab, open the card, scroll to it and highlight it
  function focus(id) {
    const item = state.items.find((i) => i.id === id);
    if (!item) return;
    const tab = TABS.find(([, , fn]) => fn(item.status))[0];
    if (state.tab !== tab && state.tab !== "all") state.tab = tab;
    state.open.add(id);
    state.cards.get(id) && (state.cards.get(id).sig = null);
    render(state.items, state.phases);
    const card = $(`need-${id}`);
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    card.classList.remove("flash");
    void card.offsetWidth;
    card.classList.add("flash");
  }

  return { render, focus };
}
