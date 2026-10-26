import { delay, read } from "./db";
import { formatShortDate, fullName, isOverdue, startOfDay } from "../lib/format";

const DAY = 24 * 60 * 60 * 1000;

/** Finished on or before the due date (compared by calendar day). */
export function isOnTime(task) {
  return Boolean(task.completedAt) && startOfDay(task.completedAt) <= startOfDay(task.dueDate);
}

const inRange = (value, from, to) => {
  if (!value) return false;
  const t = new Date(value).getTime();
  return t >= from && t < to;
};

const percent = (part, whole) => (whole ? Math.round((part / whole) * 100) : null);

/**
 * Tasks completed over the period: one bar per day up to 30 days, one per week beyond that
 * (90 daily bars are too thin to read). Bars always sum to the period's completed total.
 */
function completedSeries(completed, start, days) {
  const size = days > 30 ? 7 : 1;
  const count = Math.ceil(days / size);
  const buckets = Array.from({ length: count }, (_, i) => {
    const from = new Date(start + i * size * DAY);
    const label = size === 1 ? formatShortDate(from) : `Week of ${formatShortDate(from)}`;
    return { label, short: formatShortDate(from), count: 0 };
  });
  for (const t of completed) {
    const index = Math.floor((startOfDay(t.completedAt).getTime() - start) / (size * DAY));
    if (index >= 0 && index < count) buckets[index].count += 1;
  }
  return { buckets, unit: size === 1 ? "day" : "week" };
}

/**
 * Team report for the last `days` days (today included).
 * Counts compare with the same-length period just before it.
 */
export async function getReport(days) {
  await delay(350);
  const { employees, tasks, departments } = read();
  const end = startOfDay().getTime() + DAY; // end of today
  const start = end - days * DAY;
  const prevStart = start - days * DAY;

  const completed = tasks.filter((t) => inRange(t.completedAt, start, end));
  const completedPrev = tasks.filter((t) => inRange(t.completedAt, prevStart, start));
  const created = tasks.filter((t) => inRange(t.createdAt, start, end));
  const createdPrev = tasks.filter((t) => inRange(t.createdAt, prevStart, start));
  const dueInRange = tasks.filter((t) => inRange(t.dueDate, start, end));

  // What happened to the work that was due in this period, per department
  const outcomesByDepartment = departments
    .map((d) => {
      const due = dueInRange.filter((t) => t.departmentId === d.id);
      const onTime = due.filter(isOnTime).length;
      const done = due.filter((t) => t.status === "done").length;
      return { name: d.name, on_time: onTime, late: done - onTime, not_done: due.length - done, total: due.length };
    })
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total);

  const departmentName = Object.fromEntries(departments.map((d) => [d.id, d.name]));
  const people = employees
    .map((e) => {
      const mine = tasks.filter((t) => t.assigneeId === e.id);
      const done = completed.filter((t) => t.assigneeId === e.id);
      const open = mine.filter((t) => t.status !== "done");
      return {
        id: e.id,
        name: fullName(e),
        firstName: e.firstName,
        department: departmentName[e.departmentId] ?? "—",
        status: e.status,
        completed: done.length,
        onTimeRate: percent(done.filter(isOnTime).length, done.length),
        open: open.length,
        overdue: open.filter((t) => isOverdue(t)).length,
      };
    })
    // Skip deactivated people with nothing to report
    .filter((p) => p.status !== "inactive" || p.completed > 0)
    .sort((a, b) => b.completed - a.completed || a.name.localeCompare(b.name));

  const series = completedSeries(completed, start, days);
  console.assert(
    series.buckets.reduce((sum, b) => sum + b.count, 0) === completed.length,
    "Completed chart must add up to the completed total",
  );

  return {
    days,
    series,
    completed: completed.length,
    completedPrev: completedPrev.length,
    created: created.length,
    createdPrev: createdPrev.length,
    onTimeRate: percent(completed.filter(isOnTime).length, completed.length),
    dueCount: dueInRange.length,
    overdueNow: tasks.filter((t) => isOverdue(t)).length,
    outcomesByDepartment,
    people,
  };
}
