// Small, safe markdown converter for phase files.
// HTML is escaped first; only known constructs are turned into tags.
// Supports: headings, paragraphs, (nested) lists, task checkboxes, quotes, code blocks, tables, inline formatting.
import { esc, md as inline } from "./format.js";

const TASK = /^\[([ xX])\]\s+/;

function renderList(lines) {
  // lines: [{indent, ordered, text}]
  let html = "";
  const stack = [];
  for (const { indent, ordered, text } of lines) {
    while (stack.length && indent < stack[stack.length - 1].indent) html += `</li></${stack.pop().tag}>`;
    const top = stack[stack.length - 1];
    if (!top || indent > top.indent) {
      const tag = ordered ? "ol" : "ul";
      stack.push({ indent, tag });
      html += `<${tag}>`;
    } else {
      html += "</li>";
    }
    const task = text.match(TASK);
    html += task
      ? `<li class="task${task[1] !== " " ? " is-done" : ""}"><span class="tick" aria-hidden="true"></span>${inline(text.replace(TASK, ""))}`
      : `<li>${inline(text)}`;
  }
  while (stack.length) html += `</li></${stack.pop().tag}>`;
  return html;
}

function renderTable(rows) {
  const cells = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
  const [head, , ...body] = rows;
  return `<div class="md-table"><table><thead><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>
    <tbody>${body.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

export function markdown(src) {
  const lines = String(src ?? "").replace(/\r/g, "").split("\n");
  let html = "";
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith("```")) {
      const code = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) code.push(lines[i]);
      i++;
      html += `<pre class="md-code"><code>${esc(code.join("\n"))}</code></pre>`;
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = Math.min(h[1].length + 1, 5);
      html += `<h${level}>${inline(h[2])}</h${level}>`;
      i++;
      continue;
    }
    if (line.startsWith(">")) {
      const quote = [];
      for (; i < lines.length && lines[i].startsWith(">"); i++) quote.push(lines[i].replace(/^>\s?/, ""));
      html += `<blockquote>${quote.map(inline).join("<br>")}</blockquote>`;
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(line) && /^\s*\|?[\s:-]+\|/.test(lines[i + 1] ?? "")) {
      const rows = [];
      for (; i < lines.length && /^\s*\|/.test(lines[i]); i++) rows.push(lines[i]);
      html += renderTable(rows);
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const items = [];
      for (; i < lines.length; i++) {
        const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
        if (m) { items.push({ indent: m[1].length, ordered: /\d/.test(m[2]), text: m[3] }); continue; }
        // continuation line (indented plain text) is appended to the previous item
        if (/^\s{2,}\S/.test(lines[i]) && items.length) { items[items.length - 1].text += ` ${lines[i].trim()}`; continue; }
        break;
      }
      html += renderList(items);
      continue;
    }
    const para = [];
    for (; i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|>|\s*([-*]|\d+\.)\s|\s*\|)/.test(lines[i]); i++) para.push(lines[i].trim());
    if (!para.length) { para.push(line.trim()); i++; }
    html += `<p>${inline(para.join(" "))}</p>`;
  }
  return html;
}
