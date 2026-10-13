// Need records (hub/needs/<id>.json) + submission inbox (hub/inbox/).
// Records are committed and contain NO VALUES; values are written only to the inbox.
import fs from "node:fs";
import path from "node:path";

export const ID_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const FIELD_TYPES = ["text", "secret", "textarea", "select", "file", "confirm"];

export const readJson = (file, fallback = null) => {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
};

export function createNeeds({ hub, root }) {
  const itemsDir = path.join(hub, "needs");
  const inbox = path.join(hub, "inbox");

  function ensureInbox() {
    fs.mkdirSync(path.join(inbox, "files"), { recursive: true });
    const gi = path.join(inbox, ".gitignore");
    if (!fs.existsSync(gi)) fs.writeFileSync(gi, "# Submitted values are NEVER committed\n*\n");
  }

  // Record + inbox state -> UI view (values are NEVER returned)
  function load() {
    if (!fs.existsSync(itemsDir)) return [];
    return fs.readdirSync(itemsDir)
      .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
      .map((f) => {
        const id = f.slice(0, -5);
        const item = readJson(path.join(itemsDir, f));
        if (!item || item.id !== id) {
          return { id, title: f, status: "invalid", summary: "Record is unreadable or its id does not match the file name." };
        }
        const sub = readJson(path.join(inbox, `${id}.json`));
        const base = item.status ?? "pending";
        const open = base === "pending" || base === "rejected";
        return {
          ...item,
          phases: (item.phases ?? []).map(String),
          status: sub && open ? "submitted" : base,
          submittedAt: sub && open ? sub.submittedAt : null,
          submittedSummary: sub && open
            ? { fields: Object.keys(sub.values ?? {}).length, files: Object.keys(sub.files ?? {}).length }
            : null,
        };
      });
  }

  function validate(item) {
    const errs = [];
    if (!ID_RE.test(item.id ?? "")) errs.push("invalid id (lowercase letters, digits, hyphens)");
    for (const k of ["title", "summary", "why"]) if (!item[k]) errs.push(`${k} is missing`);
    if (!Array.isArray(item.steps) || item.steps.length === 0) errs.push("steps is empty — write step by step where to find it");
    if (!Array.isArray(item.fields) || item.fields.length === 0) errs.push("fields is empty");
    const keys = new Set();
    for (const f of item.fields ?? []) {
      if (!f.key || keys.has(f.key)) errs.push(`field key missing/duplicated: ${f.key}`);
      keys.add(f.key);
      if (!FIELD_TYPES.includes(f.type)) errs.push(`${f.key}: unknown type ${f.type}`);
      if (!f.label) errs.push(`${f.key}: label is missing`);
      if (f.type === "select" && !f.options?.length) errs.push(`${f.key}: options is missing`);
      if (f.pattern) { try { new RegExp(f.pattern); } catch { errs.push(`${f.key}: invalid pattern`); } }
    }
    return errs;
  }

  // Validate the submission COMPLETELY first, then write (no half-written records)
  function submit(id, body) {
    const item = readJson(path.join(itemsDir, `${id}.json`));
    if (!item) return [404, "Record not found"];
    if (["processed", "cancelled"].includes(item.status)) return [409, "This record is already closed"];
    const values = {};
    const files = [];
    for (const f of item.fields ?? []) {
      const required = f.required !== false;
      if (f.type === "file") {
        const file = body.files?.[f.key];
        if (!file?.data) { if (required) return [400, `${f.label}: file is required`]; continue; }
        const name = path.basename(String(file.name)).replace(/[^\w.\-]/g, "_") || "file";
        files.push({ key: f.key, name, buf: Buffer.from(file.data, "base64") });
        continue;
      }
      const v = body.values?.[f.key];
      if (v === undefined || v === "" || v === false) {
        if (required) return [400, `${f.label}: is required`];
        continue;
      }
      if (f.pattern && !new RegExp(f.pattern).test(String(v))) return [400, `${f.label}: invalid format`];
      if (f.type === "select" && !f.options.some((o) => (o.value ?? o) === v)) return [400, `${f.label}: invalid selection`];
      values[f.key] = v;
    }
    const fileDir = path.join(inbox, "files", id);
    fs.rmSync(fileDir, { recursive: true, force: true });
    const fileMeta = {};
    for (const { key, name, buf } of files) {
      fs.mkdirSync(fileDir, { recursive: true });
      const dest = path.join(fileDir, `${key}__${name}`);
      fs.writeFileSync(dest, buf, { mode: 0o600 });
      fileMeta[key] = { name, size: buf.length, path: path.relative(root, dest) };
    }
    const record = { id, submittedAt: new Date().toISOString(), values, files: fileMeta, note: String(body.note ?? "") };
    fs.writeFileSync(path.join(inbox, `${id}.json`), JSON.stringify(record, null, 2), { mode: 0o600 });
    return [200, "ok"];
  }

  return { ensureInbox, load, validate, submit, inbox };
}
