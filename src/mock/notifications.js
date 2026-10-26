import { hoursAgo } from "./dates";
import { daysUntil, isOverdue } from "../lib/format";

/**
 * Notification types:
 *  task_assigned, task_due_soon, task_overdue, task_completed, comment_added, announcement
 */
export function createNotifications(employees, tasks) {
  const notifications = [];
  let n = 0;
  const add = (userId, type, title, body, link, ageHours, read) => {
    n += 1;
    notifications.push({
      id: `ntf-${String(n).padStart(3, "0")}`,
      userId,
      type,
      title,
      body,
      link,
      createdAt: hoursAgo(ageHours),
      read,
    });
  };

  const byId = Object.fromEntries(employees.map((e) => [e.id, e]));
  const name = (id) => (byId[id] ? byId[id].firstName : "Someone");

  for (const employee of employees) {
    if (employee.status === "inactive") continue;

    if (employee.role === "staff") {
      const mine = tasks.filter((t) => t.assigneeId === employee.id);
      const open = mine.filter((t) => t.status !== "done");
      const overdue = open.filter((t) => isOverdue(t));
      const upcoming = open.filter((t) => !isOverdue(t));

      upcoming.slice(0, 2).forEach((t, i) =>
        add(employee.id, "task_assigned", "New task assigned", `${name(t.createdById)} assigned you “${t.title}”.`, `/tasks/${t.id}`, 2 + i * 20, i > 0),
      );
      upcoming
        .filter((t) => daysUntil(t.dueDate) === 1)
        .slice(0, 1)
        .forEach((t) =>
          add(employee.id, "task_due_soon", "Due tomorrow", `“${t.title}” is due tomorrow.`, `/tasks/${t.id}`, 3, false),
        );
      overdue.slice(0, 1).forEach((t) =>
        add(employee.id, "task_overdue", "Task is overdue", `“${t.title}” was due and is not done yet.`, `/tasks/${t.id}`, 5, false),
      );
      mine
        .filter((t) => t.comments.some((c) => c.authorId !== employee.id))
        .slice(0, 1)
        .forEach((t) =>
          add(employee.id, "comment_added", "New comment", `${name(t.createdById)} commented on “${t.title}”.`, `/tasks/${t.id}`, 30, true),
        );
    } else {
      tasks
        .filter((t) => t.status === "done" && t.createdById === employee.id)
        .slice(0, 3)
        .forEach((t, i) =>
          add(employee.id, "task_completed", "Task completed", `${name(t.assigneeId)} finished “${t.title}”.`, `/tasks/${t.id}`, 1 + i * 9, i > 0),
        );
      const overdueCount = tasks.filter((t) => isOverdue(t)).length;
      add(employee.id, "task_overdue", "Overdue tasks need attention", `${overdueCount} tasks are past their due date.`, "/tasks?status=overdue", 4, false);
      employees
        .filter((e) => e.status === "on_leave")
        .forEach((e, i) =>
          add(employee.id, "announcement", "Leave started", `${e.firstName} ${e.lastName} is on leave this week.`, `/employees/${e.id}`, 26 + i * 6, true),
        );
    }

    add(employee.id, "announcement", "Office closed on Monday", "The office will be closed for the public holiday. Deliveries resume Tuesday.", null, 72, true);
  }

  return notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
