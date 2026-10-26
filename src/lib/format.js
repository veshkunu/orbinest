const LOCALE = "en-IN";

const dateFormat = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", year: "numeric" });
const shortDateFormat = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short" });
const longDateFormat = new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long" });
const relativeFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });

/** "24 Oct 2026" */
export function formatDate(value) {
  return value ? dateFormat.format(new Date(value)) : "—";
}

/** "24 Oct" — for dates in the current year */
export function formatShortDate(value) {
  return value ? shortDateFormat.format(new Date(value)) : "—";
}

/** "Saturday, 24 October" */
export function formatLongDate(value = new Date()) {
  return longDateFormat.format(new Date(value));
}

const UNITS = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["week", 60 * 60 * 24 * 7],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "5 minutes ago", "yesterday", "in 3 days" */
export function formatRelative(value, now = Date.now()) {
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return relativeFormat.format(Math.round(seconds / size), unit);
    }
  }
  return "just now";
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function fullName(person) {
  return person ? `${person.firstName} ${person.lastName}` : "";
}

export function initials(person) {
  if (!person) return "?";
  return `${person.firstName[0] ?? ""}${person.lastName[0] ?? ""}`.toUpperCase();
}

/** Start of a calendar day in local time. */
export function startOfDay(value = new Date()) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isOverdue(task, now = new Date()) {
  return task.status !== "done" && new Date(task.dueDate) < startOfDay(now);
}

const DAY = 24 * 60 * 60 * 1000;

/** Whole calendar days from today to the date (negative = past). */
export function daysUntil(value, now = new Date()) {
  return Math.round((startOfDay(value) - startOfDay(now)) / DAY);
}

/** Plain-language due date: "Due today", "2 days overdue", "Due in 5 days". */
export function dueLabel(task, now = new Date()) {
  if (task.status === "done") return `Due ${formatShortDate(task.dueDate)}`;
  const days = daysUntil(task.dueDate, now);
  if (days < -1) return `${-days} days overdue`;
  if (days === -1) return "1 day overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days < 7) return `Due in ${days} days`;
  return `Due ${formatShortDate(task.dueDate)}`;
}

/** True when the date falls within the last `days` days. */
export function isWithinLastDays(value, days, now = Date.now()) {
  return Boolean(value) && now - new Date(value).getTime() < days * 24 * 60 * 60 * 1000;
}

/** yyyy-mm-dd in local time, for <input type="date">. */
export function toDateInput(value) {
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** ISO string for a yyyy-mm-dd date input at a local hour (default end of working day). */
export function fromDateInput(value, hour = 18) {
  return new Date(`${value}T${String(hour).padStart(2, "0")}:00:00`).toISOString();
}

/** Split newest-first items into "Today", "Yesterday", "Earlier this week" and "Older". */
export function groupByDay(items, getDate = (item) => item.createdAt, now = new Date()) {
  const groups = [
    { key: "today", label: "Today", items: [] },
    { key: "yesterday", label: "Yesterday", items: [] },
    { key: "week", label: "Earlier this week", items: [] },
    { key: "older", label: "Older", items: [] },
  ];
  for (const item of items) {
    const days = -daysUntil(getDate(item), now);
    const index = days <= 0 ? 0 : days === 1 ? 1 : days < 7 ? 2 : 3;
    groups[index].items.push(item);
  }
  return groups.filter((g) => g.items.length);
}
