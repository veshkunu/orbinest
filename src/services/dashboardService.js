import { delay, read } from "./db";
import { daysUntil, fullName, isOverdue, startOfDay } from "../lib/format";

const DAY = 24 * 60 * 60 * 1000;

const byDue = (a, b) => a.dueDate.localeCompare(b.dueDate);

/** Monday 00:00 of the current week. */
function startOfWeek(now = new Date()) {
  const d = startOfDay(now);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function recentActivity(tasks, limit) {
  const events = [];
  for (const t of tasks) {
    events.push({ id: `${t.id}-created`, type: "created", actorId: t.createdById, subjectId: t.assigneeId, taskId: t.id, taskTitle: t.title, at: t.createdAt });
    if (t.completedAt) events.push({ id: `${t.id}-done`, type: "completed", actorId: t.assigneeId, taskId: t.id, taskTitle: t.title, at: t.completedAt });
    for (const c of t.comments) events.push({ id: c.id, type: "comment", actorId: c.authorId, taskId: t.id, taskTitle: t.title, at: c.createdAt });
  }
  const now = new Date().toISOString();
  return events
    .filter((e) => e.at <= now)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

const WEEKDAY = new Intl.DateTimeFormat("en-IN", { weekday: "short" });
const MAX_MATRIX_ROWS = 8;

/**
 * Who is carrying what over the next 7 days: one row per person with open work, one column per
 * day starting today, plus the overdue tasks they are already behind on. A rolling window, so a
 * Saturday view still shows the coming week rather than five days that have passed.
 * Every count comes from the task rows, so the row totals and the KPI strip agree.
 */
function weekByPerson(employees, open) {
  const weekStart = startOfDay();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart.getTime() + i * DAY);
    return {
      key: date.toISOString(),
      weekday: i === 0 ? "Today" : WEEKDAY.format(date),
      date: date.getDate(),
      isToday: i === 0,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    };
  });
  const weekEnd = weekStart.getTime() + 7 * DAY;

  const rows = employees
    .filter((e) => e.status !== "inactive")
    .map((e) => {
      const mine = open.filter((t) => t.assigneeId === e.id);
      const perDay = days.map(() => 0);
      for (const t of mine) {
        const due = startOfDay(t.dueDate).getTime();
        // Overdue work sits in its own column, not on the day it was due
        if (isOverdue(t) || due < weekStart.getTime() || due >= weekEnd) continue;
        perDay[Math.round((due - weekStart.getTime()) / DAY)] += 1;
      }
      const overdue = mine.filter((t) => isOverdue(t)).length;
      const thisWeek = perDay.reduce((a, b) => a + b, 0);
      return { id: e.id, name: fullName(e), person: e, onLeave: e.status === "on_leave", overdue, perDay, thisWeek };
    })
    .filter((r) => r.overdue + r.thisWeek > 0)
    .sort((a, b) => b.overdue - a.overdue || b.thisWeek - a.thisWeek || a.name.localeCompare(b.name));

  // Team totals cover every person, shown or not, so they match the KPI strip
  const totals = {
    overdue: rows.reduce((sum, r) => sum + r.overdue, 0),
    perDay: days.map((_, i) => rows.reduce((sum, r) => sum + r.perDay[i], 0)),
    thisWeek: rows.reduce((sum, r) => sum + r.thisWeek, 0),
  };
  return { days, rows: rows.slice(0, MAX_MATRIX_ROWS), hiddenCount: Math.max(0, rows.length - MAX_MATRIX_ROWS), totals };
}

export async function getAdminSummary() {
  await delay(350);
  const { employees, tasks } = read();
  const current = employees.filter((e) => e.status !== "inactive");
  const open = tasks.filter((t) => t.status !== "done");
  const overdue = open.filter((t) => isOverdue(t));

  const week = weekByPerson(employees, open);
  console.assert(week.totals.overdue === overdue.length, "Grid overdue total must match the KPI");
  console.assert(week.totals.perDay[0] === open.filter((t) => daysUntil(t.dueDate) === 0).length, "Grid today total must match the KPI");
  const behind = [...week.rows].sort((a, b) => b.overdue - a.overdue)[0];

  return {
    teamSize: current.length,
    onLeave: current.filter((e) => e.status === "on_leave"),
    openCount: open.length,
    inProgressCount: open.filter((t) => t.status === "in_progress").length,
    overdueCount: overdue.length,
    dueTodayCount: open.filter((t) => daysUntil(t.dueDate) === 0).length,
    // Overdue first, then anything due in the next two days
    needsAttention: open.filter((t) => daysUntil(t.dueDate) <= 2).sort(byDue).slice(0, 5),
    needsAttentionTotal: open.filter((t) => daysUntil(t.dueDate) <= 2).length,
    recentActivity: recentActivity(tasks, 6),
    week,
    // The finding for the title row: who is furthest behind
    mostOverdue: behind && behind.overdue > 0 ? { name: fullName(behind.person), count: behind.overdue } : null,
  };
}

export async function getStaffSummary(userId) {
  await delay(350);
  const mine = read().tasks.filter((t) => t.assigneeId === userId);
  const open = mine.filter((t) => t.status !== "done").sort(byDue);
  const weekStart = startOfWeek();
  const weekEnd = new Date(weekStart.getTime() + 7 * DAY);
  const dueThisWeek = mine.filter((t) => {
    const due = new Date(t.dueDate);
    return due >= weekStart && due < weekEnd;
  });

  return {
    overdue: open.filter((t) => isOverdue(t)),
    dueToday: open.filter((t) => daysUntil(t.dueDate) === 0),
    upcoming: open.filter((t) => {
      const days = daysUntil(t.dueDate);
      return days > 0 && days <= 7;
    }),
    laterCount: open.filter((t) => daysUntil(t.dueDate) > 7).length,
    openCount: open.length,
    week: { total: dueThisWeek.length, done: dueThisWeek.filter((t) => t.status === "done").length },
  };
}
