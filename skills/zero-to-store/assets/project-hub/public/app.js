// Project Hub — routing (#/plan, #/plan/<phase>, #/needs, #/needs/<id>),
// live refresh (every 4s), theme and top navigation.
import { toast, store } from "./format.js";
import { t, lang, setLang, applyStatic } from "./i18n.js";
import { createNeedsView, isOpenNeed } from "./needs.js";
import { createPlanView } from "./plan.js";

const TOKEN = document.querySelector('meta[name="hub-token"]').content;
const POLL_MS = 4000;
const $ = (id) => document.getElementById(id);
let data = null;

async function api(url, opts = {}) {
  const res = await fetch(url, { ...opts, headers: { "X-Hub-Token": TOKEN, "Content-Type": "application/json" } });
  if (res.status === 401) { location.reload(); throw new Error("reload"); }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Hata ${res.status}`);
  return body;
}

const navigate = (hash) => { if (location.hash !== hash) location.hash = hash; else route(); };
const needsView = createNeedsView({ api, refresh });
const planView = createPlanView({ navigate });

function parseRoute() {
  const [, view = "plan", id] = location.hash.match(/^#\/(plan|needs)(?:\/([^/]+))?/) ?? [];
  return { view, id: id && decodeURIComponent(id) };
}

function movePill() {
  const active = document.querySelector('#nav a[aria-current="page"]');
  if (!active) return;
  const pill = $("seg-pill");
  pill.style.width = `${active.offsetWidth}px`;
  pill.style.transform = `translateX(${active.offsetLeft}px)`;
}

let currentView = null;
function route() {
  const { view, id } = parseRoute();
  document.querySelectorAll("#nav a").forEach((a) => (a.dataset.view === view
    ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  movePill();
  if (view !== currentView) {
    $("view-plan").hidden = view !== "plan";
    $("view-needs").hidden = view !== "needs";
    currentView = view;
    window.scrollTo({ top: 0 });
  }
  if (!data) return;
  if (view === "plan" && id) planView.showPhase(id);
  else planView.hidePhase();
  if (view === "needs" && id) needsView.focus(id);
}

async function refresh() {
  try {
    const next = await api("/api/state");
    $("offline").hidden = true;
    $("live").classList.remove("off");
    const first = !data;
    data = next;
    $("project").textContent = data.project;
    document.title = `${t("app.title")} · ${data.project}`;
    const open = data.needs.filter((n) => isOpenNeed(n.status)).length;
    $("needs-badge").hidden = !open;
    $("needs-badge").textContent = String(open);
    planView.render(data.plan, data.needs);
    needsView.render(data.needs, data.plan.phases ?? []);
    if (first) route();
    else if (parseRoute().view === "plan" && parseRoute().id) planView.showPhase(parseRoute().id);
    movePill();
  } catch (e) {
    if (e.message === "reload") return;
    $("offline").hidden = false;
    $("live").classList.add("off");
  }
}

// Theme: system → light → dark
const THEMES = [null, "light", "dark"];
const applyTheme = (t) => (t ? document.documentElement.setAttribute("data-theme", t) : document.documentElement.removeAttribute("data-theme"));
applyTheme(store.get("hub-theme"));
$("theme").addEventListener("click", () => {
  const next = THEMES[(THEMES.indexOf(store.get("hub-theme")) + 1) % THEMES.length];
  store.set("hub-theme", next);
  applyTheme(next);
  toast(t(next === "light" ? "theme.light" : next === "dark" ? "theme.dark" : "theme.system"));
});

// Language: static markup + toggle button (EN <-> TR)
applyStatic();
$("lang").textContent = lang === "tr" ? "EN" : "TR";
$("lang").addEventListener("click", () => setLang(lang === "tr" ? "en" : "tr"));

window.addEventListener("hashchange", route);
window.addEventListener("resize", movePill);
if (!location.hash) history.replaceState(null, "", "#/plan");
route();
refresh();
setInterval(refresh, POLL_MS);
