// Form fields: rendering, validation and submission payload.
// Alan tipleri: text · secret · textarea · select · file · confirm
import { esc, md, icon, formatSize } from "./format.js";
import { t } from "./i18n.js";

const MAX_FILE = 20 * 1024 * 1024;

function fieldInput(f, id) {
  const ph = f.placeholder ? ` placeholder="${esc(f.placeholder)}"` : "";
  const common = `id="${id}" name="${esc(f.key)}" class="input" autocomplete="off" spellcheck="false"${ph}`;
  switch (f.type) {
    case "secret":
      return `<div class="secret"><input type="password" ${common}>
        <button type="button" class="btn btn-sm" data-reveal="${id}" aria-label="${t("field.reveal")}">${icon("eye")}</button></div>`;
    case "textarea":
      return `<textarea ${common}></textarea>`;
    case "select":
      return `<select ${common}><option value="">${t("field.select")}</option>${f.options.map((o) => {
        const v = o.value ?? o;
        return `<option value="${esc(v)}">${esc(o.label ?? v)}</option>`;
      }).join("")}</select>`;
    case "file":
      return `<label class="drop" for="${id}">${icon("upload")}
        <span class="drop-text">${t("field.drop")}${f.accept ? ` (${esc(f.accept)})` : ""}</span>
        <input type="file" id="${id}" name="${esc(f.key)}"${f.accept ? ` accept="${esc(f.accept)}"` : ""}></label>`;
    case "confirm":
      return `<label class="check"><input type="checkbox" id="${id}" name="${esc(f.key)}"> <span>${md(f.label)}</span></label>`;
    default:
      return `<input type="text" ${common}>`;
  }
}

export function renderForm(item) {
  const fields = item.fields ?? [];
  const html = fields.map((f) => {
    const id = `f-${item.id}-${f.key}`;
    const optional = f.required === false ? ` <span class="opt">${t("field.optional")}</span>` : "";
    const label = f.type === "confirm" ? "" : `<label for="${id}">${esc(f.label)}${optional}</label>`;
    const help = [f.help && md(f.help), f.example && `${t("field.example")}: <code>${esc(f.example)}</code>`].filter(Boolean).join(" · ");
    return `<div class="field" data-key="${esc(f.key)}">${label}${fieldInput(f, id)}
      ${help ? `<p class="help">${help}</p>` : ""}<p class="err"></p></div>`;
  }).join("");
  return `<form class="form" data-form="${esc(item.id)}" novalidate>
    ${html}
    <div class="field"><label for="note-${esc(item.id)}">${t("field.note")} <span class="opt">${t("field.optional")}</span></label>
      <textarea class="input note" id="note-${esc(item.id)}" name="__note"
        placeholder="${t("field.notePh")}"></textarea></div>
    <div class="actions">
      <span class="hint">${icon("lock")} ${t("field.local")}</span>
      <button type="submit" class="btn btn-primary">${t("field.send")}</button>
    </div>
  </form>`;
}

// Interactions: show/hide, drag-and-drop, file name display
export function wireForm(form) {
  form.querySelectorAll("[data-reveal]").forEach((b) => b.addEventListener("click", () => {
    const input = form.querySelector(`#${CSS.escape(b.dataset.reveal)}`);
    input.type = input.type === "password" ? "text" : "password";
  }));
  form.querySelectorAll(".drop").forEach((drop) => {
    const input = drop.querySelector("input");
    const text = drop.querySelector(".drop-text");
    const show = () => {
      const file = input.files[0];
      drop.classList.toggle("has-file", !!file);
      if (file) text.textContent = `${file.name} · ${formatSize(file.size)}`;
    };
    input.addEventListener("change", show);
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("over"));
    drop.addEventListener("drop", (e) => {
      e.preventDefault();
      drop.classList.remove("over");
      if (e.dataTransfer.files.length) { input.files = e.dataTransfer.files; show(); }
    });
  });
}

const readBase64 = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
  r.onerror = () => reject(r.error);
  r.readAsDataURL(file);
});

// Validates; on errors, writes them to the fields and returns null
export async function collect(form, item) {
  const values = {};
  const files = {};
  let firstBad = null;
  for (const f of item.fields ?? []) {
    const wrap = form.querySelector(`.field[data-key="${CSS.escape(f.key)}"]`);
    const input = wrap.querySelector("input, textarea, select");
    const required = f.required !== false;
    let error = "";
    if (f.type === "file") {
      const file = input.files[0];
      if (!file && required) error = t("err.file");
      else if (file && file.size > MAX_FILE) error = t("err.size");
      else if (file) files[f.key] = { name: file.name, data: await readBase64(file) };
    } else if (f.type === "confirm") {
      if (!input.checked && required) error = t("err.confirm");
      else if (input.checked) values[f.key] = true;
    } else {
      const v = input.value.trim();
      if (!v && required) error = t("err.required");
      else if (v && f.pattern && !new RegExp(f.pattern).test(v)) error = f.patternHint || t("err.pattern");
      else if (v) values[f.key] = v;
    }
    wrap.classList.toggle("invalid", !!error);
    wrap.querySelector(".err").textContent = error;
    if (error && !firstBad) firstBad = input;
  }
  if (firstBad) { firstBad.focus(); return null; }
  const note = form.querySelector('[name="__note"]').value.trim();
  return { values, files, note };
}
