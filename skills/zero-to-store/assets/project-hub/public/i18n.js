// UI strings (EN/TR). Language: ?lang=xx → saved choice → browser language → English.
// Need records themselves are written by Claude in the user's language.
const STRINGS = {
  en: {
    "app.title": "Project Hub", "nav.plan": "Plan", "nav.needs": "Needs", "live": "Live",
    "live.title": "Live — updates as files change", "theme": "Change theme", "lang": "Türkçe",
    "offline": "Can't reach the server. Is <code>node hub/server.mjs</code> running?",
    "plan.eyebrow": "Roadmap", "plan.lede": "Phases update live: see what's done, what's in progress and what's next. Click a phase to see every detail.",
    "needs.eyebrow": "What Claude needs from you", "needs.title": "Needs Center",
    "needs.lede": "Everything Claude needs from you to keep going. Each item explains what is needed, where to find it and how — step by step. Fill it in, send it; Claude does the rest.",
    "needs.foot": "Values you send are written only to <code>hub/inbox/</code> on this computer, never committed, and deleted after Claude processes them.",
    "progress.done": "done", "progress.of": "{done} / {total} done",
    "theme.light": "Light theme", "theme.dark": "Dark theme", "theme.system": "System theme",
    "time.now": "just now", "time.min": "{n} min ago", "time.hour": "{n} h ago",
    "copy.ok": "Copied", "copy.fail": "Couldn't copy — select and copy manually",
    "field.reveal": "Show/hide", "field.select": "Select…", "field.drop": "Drag & drop the file or <u>browse</u>",
    "field.example": "Example", "field.optional": "(optional)", "field.note": "Note for Claude",
    "field.notePh": "e.g. ‘The account belongs to the company’ or ‘skip this for now’",
    "field.local": "Written only to this computer", "field.send": "Send to Claude", "field.sending": "Sending…",
    "err.file": "This file is required.", "err.size": "File can't be larger than 20 MB.",
    "err.confirm": "Complete this step and tick the box to continue.", "err.required": "This field is required.",
    "err.pattern": "Doesn't match the expected format.",
    "st.rejected": "Needs fix", "st.invalid": "Broken record", "st.pending": "Pending", "st.submitted": "Submitted",
    "st.processed": "Done", "st.cancelled": "Cancelled",
    "prio.high": "High priority", "prio.medium": "Medium priority", "prio.low": "Low priority",
    "tab.open": "To do", "tab.submitted": "Submitted", "tab.done": "Done", "tab.all": "All",
    "empty.open": "Nothing is needed from you right now", "empty.openText": "When Claude needs something it will appear here. The page updates itself.",
    "empty.submitted": "No submissions waiting", "empty.submittedText": "Claude has processed everything you sent.",
    "empty.done": "Nothing completed yet", "empty.doneText": "Items appear here as Claude processes your submissions.",
    "empty.all": "No items yet", "empty.allText": "When Claude needs something it will appear here.",
    "n.rejected": "Claude couldn't process this.", "n.fixResend": "Fix it and send again.",
    "n.invalid": "This record can't be read. Ask Claude to check the output of <code>node hub/server.mjs --status</code>.",
    "n.edit": "Fix and resend", "n.submitted": "Submitted", "n.counts": "{f} fields, {d} files",
    "n.willProcess": "Claude will process it at the next phase transition. In a hurry? Tell Claude “I sent the needs”.",
    "n.processed": "Processed", "n.cancelled": "No longer needed.",
    "sec.why": "Why it's needed", "sec.blocks": "What it's blocking:", "sec.before": "Before you start",
    "sec.copy": "Values you'll need to paste", "sec.steps": "Where to find it, step by step",
    "step.open": "Open", "step.mark": "Step {n}: mark as done", "chip.blocks": "blocking {n}", "chip.phase": "Phase {no}",
    "copy.btn": "Copy", "toast.sent": "Sent — Claude will process it at the next step",
    "ps.done": "Done", "ps.active": "In progress", "ps.ready": "Ready to start", "ps.todo": "Up next", "ps.cancelled": "Cancelled",
    "stat.progress": "Overall progress", "stat.phasesDone": "{done} / {total} phases done", "stat.now": "Now",
    "stat.idle": "No phase running", "stat.remaining": "Estimated remaining",
    "stat.parallel": "with parallel groups · {serial} one by one", "stat.needs": "Needed from you",
    "stat.goNeeds": "Go to Needs Center →", "stat.allGood": "All set",
    "co.active": "Phase {no} is waiting for information from you", "co.upcoming": "Things you can prepare for the next phases",
    "co.text": "With these ready, Claude keeps going without waiting. Each one explains step by step where to find it.",
    "co.fill": "Fill in", "co.phase": "Phase {no}", "co.more": "+{n} more →",
    "pc.waiting": "{n} waiting for info", "pc.ready": "Info ready", "pc.open": "Open phase {no} details",
    "pc.deps": "Depends on", "pc.criteria": "{done}/{total} criteria",
    "lane.stage": "Stage {n}", "lane.parallel": "{n} phases run in parallel", "lane.single": "Single phase",
    "log.title": "Phase completion log", "graph.title": "Dependency graph (text)",
    "d.status": "Status", "d.group": "Group", "d.estimate": "Estimate", "d.actual": "Actual", "d.start": "Start",
    "d.end": "End", "d.deps": "Depends on", "d.blocks": "Blocking", "d.needs": "What this phase needs from you",
    "d.missing": "Phase file not found:", "d.noFile": "File column is empty", "d.criteria": "{done}/{total} done criteria",
    "d.close": "Close", "d.phase": "Phase {no}",
    "plan.none": "No plan yet", "plan.noneText": "Once Claude plans the phases and you approve, <code>PLAN.md</code> becomes a live roadmap here.",
    "dur.min": "{m} min", "dur.h": "{h} h", "dur.hm": "{h} h {m} min",
    "nav.ops": "Operations", "ops.eyebrow": "After launch", "ops.title": "Operations",
    "ops.lede": "What the daily routine saw and did: stability, store ratings, ASO ranks and its reports.",
    "ops.off": "Daily operations are not enabled",
    "ops.offText": "Turn them on after the first release: ask Claude to enable post-launch operations (rules, Section 18). It creates <code>ops/config.json</code> and a local scheduled task from <code>DAILY_OPS.template.md</code>.",
    "ops.noData": "The routine is set up, but it hasn't written metrics yet. Each run adds a line to <code>ops/metrics.jsonl</code>.",
    "ops.autonomy": "Autonomy", "ops.a.observe": "Observe only", "ops.a.fix-to-testing": "Fix → testing", "ops.a.full-auto": "Full auto",
    "ops.lastRun": "Last run {date}", "ops.locked": "A run is in progress", "ops.skipped": "{n} unreadable lines in ops/metrics.jsonl were skipped.",
    "ops.t.crash": "Crash-free users", "ops.t.rating": "Store rating", "ops.t.issues": "Open crash issues", "ops.t.release": "Latest release",
    "ops.s.ok": "Within SLO", "ops.s.warn": "Close to SLO", "ops.s.bad": "Below SLO", "ops.slo": "SLO {v}%",
    "ops.vsWeek": "{d} vs 7 days ago", "ops.noRelease": "No release yet", "ops.humans": "{n} human users",
    "ops.c.crash": "Crash-free users (%)", "ops.c.rating": "Store rating", "ops.c.empty": "Needs at least two days of data.",
    "ops.aso": "ASO ranks", "ops.aso.kw": "Keyword", "ops.aso.store": "Store", "ops.aso.country": "Country",
    "ops.aso.now": "Today", "ops.aso.week": "7 days ago", "ops.aso.change": "Change", "ops.aso.empty": "No ASO ranks in the metrics yet.",
    "ops.reports": "Reports", "ops.r.daily": "Daily", "ops.r.weekly": "Weekly", "ops.r.empty": "No reports yet.",
  },
  tr: {
    "app.title": "Proje Merkezi", "nav.plan": "Plan", "nav.needs": "İhtiyaçlar", "live": "Canlı",
    "live.title": "Canlı — dosyalar değiştikçe güncellenir", "theme": "Temayı değiştir", "lang": "English",
    "offline": "Sunucuya ulaşılamıyor. Terminalde <code>node hub/server.mjs</code> çalışıyor mu?",
    "plan.eyebrow": "Yol haritası", "plan.lede": "Fazlar canlı güncellenir: neyin bittiğini, neyin sürdüğünü ve sırada ne olduğunu buradan izle. Bir faza tıkla, tüm detayını gör.",
    "needs.eyebrow": "Senden beklenenler", "needs.title": "İhtiyaç Merkezi",
    "needs.lede": "Claude'un devam edebilmek için senden beklediği her şey burada. Her kaydın içinde neyin, nereden, nasıl alınacağı adım adım yazılı. Doldur, gönder; gerisini Claude halleder.",
    "needs.foot": "Gönderdiğin değerler yalnızca bu bilgisayarda <code>hub/inbox/</code> klasörüne yazılır, repoya girmez ve Claude işledikten sonra silinir.",
    "progress.done": "tamamlandı", "progress.of": "{done} / {total} tamam",
    "theme.light": "Açık tema", "theme.dark": "Koyu tema", "theme.system": "Sistem teması",
    "time.now": "az önce", "time.min": "{n} dk önce", "time.hour": "{n} saat önce",
    "copy.ok": "Kopyalandı", "copy.fail": "Kopyalanamadı — elle seç ve kopyala",
    "field.reveal": "Göster/gizle", "field.select": "Seç…", "field.drop": "Dosyayı sürükle bırak ya da <u>seç</u>",
    "field.example": "Örnek", "field.optional": "(opsiyonel)", "field.note": "Claude'a not",
    "field.notePh": "Örn. ‘Hesap şirket adına açıldı’ ya da ‘bunu şimdilik atla’",
    "field.local": "Sadece bu bilgisayara yazılır", "field.send": "Claude'a gönder", "field.sending": "Gönderiliyor…",
    "err.file": "Bu dosya gerekli.", "err.size": "Dosya 20 MB'tan büyük olamaz.",
    "err.confirm": "Devam etmek için bu adımı tamamlayıp işaretlemelisin.", "err.required": "Bu alan zorunlu.",
    "err.pattern": "Biçim beklenenle uyuşmuyor.",
    "st.rejected": "Tekrar gerekli", "st.invalid": "Hatalı kayıt", "st.pending": "Bekliyor", "st.submitted": "Gönderildi",
    "st.processed": "Tamamlandı", "st.cancelled": "İptal",
    "prio.high": "Yüksek öncelik", "prio.medium": "Orta öncelik", "prio.low": "Düşük öncelik",
    "tab.open": "Yapılacak", "tab.submitted": "Gönderildi", "tab.done": "Tamamlandı", "tab.all": "Tümü",
    "empty.open": "Şu an senden beklenen bir şey yok", "empty.openText": "Claude bir şeye ihtiyaç duyduğunda burada belirecek. Sayfa kendiliğinden güncellenir.",
    "empty.submitted": "İşlenmeyi bekleyen gönderim yok", "empty.submittedText": "Gönderdiğin her şey Claude tarafından işlendi.",
    "empty.done": "Henüz tamamlanan kayıt yok", "empty.doneText": "Claude gönderdiklerini işledikçe burada görünecek.",
    "empty.all": "Henüz hiç kayıt yok", "empty.allText": "Claude bir şeye ihtiyaç duyduğunda burada belirecek.",
    "n.rejected": "Claude bunu işleyemedi.", "n.fixResend": "Düzeltip tekrar gönder.",
    "n.invalid": "Bu kayıt okunamıyor. Claude'a <code>node hub/server.mjs --status</code> çıktısını kontrol etmesini söyle.",
    "n.edit": "Düzelt ve yeniden gönder", "n.submitted": "Gönderildi", "n.counts": "{f} alan, {d} dosya",
    "n.willProcess": "Claude bir sonraki faz geçişinde işleyecek. Acelesi varsa Claude'a “ihtiyaçları gönderdim” yaz.",
    "n.processed": "İşlendi", "n.cancelled": "Artık gerekmiyor.",
    "sec.why": "Neden gerekli", "sec.blocks": "Beklettiği işler:", "sec.before": "Başlamadan önce",
    "sec.copy": "Kopyalaman gerekecek değerler", "sec.steps": "Adım adım nereden bulunur",
    "step.open": "Aç", "step.mark": "Adım {n}: tamamlandı olarak işaretle", "chip.blocks": "{n} işi blokluyor", "chip.phase": "Faz {no}",
    "copy.btn": "Kopyala", "toast.sent": "Gönderildi — Claude bir sonraki adımda işleyecek",
    "ps.done": "Tamamlandı", "ps.active": "Devam ediyor", "ps.ready": "Başlamaya hazır", "ps.todo": "Sırada", "ps.cancelled": "İptal",
    "stat.progress": "Genel ilerleme", "stat.phasesDone": "{done} / {total} faz tamamlandı", "stat.now": "Şu an",
    "stat.idle": "Çalışan faz yok", "stat.remaining": "Tahmini kalan",
    "stat.parallel": "paralel gruplarla · tek tek {serial}", "stat.needs": "Senden beklenen",
    "stat.goNeeds": "İhtiyaç Merkezi'ne git →", "stat.allGood": "Hepsi tamam",
    "co.active": "Faz {no} şu an senden bilgi bekliyor", "co.upcoming": "Sıradaki fazlar için şimdiden hazırlayabileceklerin",
    "co.text": "Bunlar hazır olursa Claude hiç beklemeden devam eder. Her birinde nereden bulacağın adım adım yazıyor.",
    "co.fill": "Doldur", "co.phase": "Faz {no}", "co.more": "+{n} kayıt daha →",
    "pc.waiting": "{n} bilgi bekleniyor", "pc.ready": "Bilgiler hazır", "pc.open": "Faz {no} detayını aç",
    "pc.deps": "Bağlı olduğu fazlar", "pc.criteria": "{done}/{total} kriter",
    "lane.stage": "Aşama {n}", "lane.parallel": "{n} faz paralel yürür", "lane.single": "Tek faz",
    "log.title": "Faz tamamlanma günlüğü", "graph.title": "Bağımlılık grafiği (metin)",
    "d.status": "Durum", "d.group": "Grup", "d.estimate": "Tahmin", "d.actual": "Gerçekleşen", "d.start": "Başlangıç",
    "d.end": "Bitiş", "d.deps": "Bağlı olduğu", "d.blocks": "Beklettiği", "d.needs": "Bu faz için senden gerekenler",
    "d.missing": "Faz dosyası bulunamadı:", "d.noFile": "Dosya sütunu boş", "d.criteria": "{done}/{total} bitti kriteri",
    "d.close": "Kapat", "d.phase": "Faz {no}",
    "plan.none": "Plan henüz yazılmadı", "plan.noneText": "Claude fazları planlayıp onayını aldığında <code>PLAN.md</code> burada canlı bir yol haritasına dönüşecek.",
    "dur.min": "{m} dk", "dur.h": "{h} sa", "dur.hm": "{h} sa {m} dk",
    "nav.ops": "Operasyon", "ops.eyebrow": "Yayından sonra", "ops.title": "Operasyon",
    "ops.lede": "Günlük rutinin gördükleri ve yaptıkları: kararlılık, mağaza puanları, ASO sıraları ve raporlar.",
    "ops.off": "Günlük operasyon açık değil",
    "ops.offText": "İlk yayından sonra aç: Claude'dan yayın sonrası operasyonu etkinleştirmesini iste (kurallar, Bölüm 18). <code>ops/config.json</code> dosyasını ve <code>DAILY_OPS.template.md</code> şablonundan yerel bir zamanlanmış görev oluşturur.",
    "ops.noData": "Rutin kurulu ama henüz metrik yazmadı. Her çalışma <code>ops/metrics.jsonl</code> dosyasına bir satır ekler.",
    "ops.autonomy": "Otonomi", "ops.a.observe": "Yalnızca izle", "ops.a.fix-to-testing": "Düzelt → test", "ops.a.full-auto": "Tam otomatik",
    "ops.lastRun": "Son çalışma {date}", "ops.locked": "Bir çalışma sürüyor", "ops.skipped": "ops/metrics.jsonl içindeki {n} okunamayan satır atlandı.",
    "ops.t.crash": "Çökmesiz kullanıcı", "ops.t.rating": "Mağaza puanı", "ops.t.issues": "Açık çökme sorunu", "ops.t.release": "Son yayın",
    "ops.s.ok": "SLO içinde", "ops.s.warn": "SLO'ya yakın", "ops.s.bad": "SLO'nun altında", "ops.slo": "SLO %{v}",
    "ops.vsWeek": "7 gün öncesine göre {d}", "ops.noRelease": "Henüz yayın yok", "ops.humans": "{n} gerçek kullanıcı",
    "ops.c.crash": "Çökmesiz kullanıcı (%)", "ops.c.rating": "Mağaza puanı", "ops.c.empty": "En az iki günlük veri gerekiyor.",
    "ops.aso": "ASO sıraları", "ops.aso.kw": "Anahtar kelime", "ops.aso.store": "Mağaza", "ops.aso.country": "Ülke",
    "ops.aso.now": "Bugün", "ops.aso.week": "7 gün önce", "ops.aso.change": "Değişim", "ops.aso.empty": "Metriklerde henüz ASO sırası yok.",
    "ops.reports": "Raporlar", "ops.r.daily": "Günlük", "ops.r.weekly": "Haftalık", "ops.r.empty": "Henüz rapor yok.",
  },
};

function pick() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  let saved = null;
  try { saved = localStorage.getItem("hub-lang"); } catch { /* ignore */ }
  const browser = (navigator.languages?.[0] || navigator.language || "en").slice(0, 2);
  return [fromUrl, saved, browser].find((l) => l && STRINGS[l]) || "en";
}

export const lang = pick();
document.documentElement.lang = lang;

// t("time.min", { n: 3 }) -> "3 min ago"
export function t(key, vars = {}) {
  const s = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

export function setLang(next) {
  try { localStorage.setItem("hub-lang", next); } catch { /* ignore */ }
  location.reload();
}

// Static markup: data-i18n (text), data-i18n-html (trusted markup from this file), data-i18n-aria, data-i18n-title
export function applyStatic(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  root.querySelectorAll("[data-i18n-title]").forEach((el) => el.setAttribute("title", t(el.dataset.i18nTitle)));
}
