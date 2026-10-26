function escape(value) {
  let text = value === null || value === undefined ? "" : String(value);
  // Stop spreadsheet apps treating typed-in text as a formula
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** `columns` is [{ key, label }]. */
export function toCsv(rows, columns) {
  const header = columns.map((c) => escape(c.label)).join(",");
  const body = rows.map((row) => columns.map((c) => escape(row[c.key])).join(","));
  return [header, ...body].join("\r\n");
}

/** Save a CSV in the browser. The BOM makes Excel read accents (é, ã) correctly. */
export function downloadCsv(filename, csv) {
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
