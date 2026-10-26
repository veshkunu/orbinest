import { delay, read, write } from "./db";
import { buildNotification } from "./notificationService";
import { isOverdue } from "../lib/format";

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

const SORTS = {
  due_asc: (a, b) => a.dueDate.localeCompare(b.dueDate),
  due_desc: (a, b) => b.dueDate.localeCompare(a.dueDate),
  priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.dueDate.localeCompare(b.dueDate),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
};

/** `status` accepts the stored statuses plus the derived "overdue". */
function matchesStatus(task, status) {
  if (!status) return true;
  if (status === "overdue") return isOverdue(task);
  return task.status === status;
}

/**
 * Filters: assigneeId, status, priority, search (title/description).
 * Done tasks sink below open ones unless a specific status is chosen.
 */
export async function listTasks({ assigneeId, status = "", priority = "", search = "", sort = "due_asc" } = {}) {
  await delay();
  const query = search.trim().toLowerCase();
  const compare = SORTS[sort] ?? SORTS.due_asc;
  return read()
    .tasks.filter(
      (t) =>
        (!assigneeId || t.assigneeId === assigneeId) &&
        matchesStatus(t, status) &&
        (!priority || t.priority === priority) &&
        (!query || t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)),
    )
    .sort((a, b) => (status ? 0 : Number(a.status === "done") - Number(b.status === "done")) || compare(a, b));
}

/** Tab counts for one person's tasks, or everyone's. */
export async function countTasksByStatus({ assigneeId } = {}) {
  const tasks = read().tasks.filter((t) => !assigneeId || t.assigneeId === assigneeId);
  return {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    overdue: tasks.filter((t) => isOverdue(t)).length,
    done: tasks.filter((t) => t.status === "done").length,
  };
}

export async function getTask(id) {
  await delay();
  return read().tasks.find((t) => t.id === id) ?? null;
}

function event(type, actorId, extra = {}) {
  return { id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, actorId, at: new Date().toISOString(), ...extra };
}

function nameOf(state, id) {
  const e = state.employees.find((x) => x.id === id);
  return e ? e.firstName : "Someone";
}

function nextTaskId(tasks) {
  const max = Math.max(0, ...tasks.map((t) => Number(t.id.replace("task-", ""))));
  return `task-${String(max + 1).padStart(3, "0")}`;
}

export async function createTask(data, actorId) {
  await delay(400);
  let created;
  write((s) => {
    const assignee = s.employees.find((e) => e.id === data.assigneeId);
    created = {
      id: nextTaskId(s.tasks),
      title: data.title.trim(),
      description: data.description.trim(),
      assigneeId: data.assigneeId,
      createdById: actorId,
      departmentId: assignee?.departmentId ?? null,
      priority: data.priority,
      status: "todo",
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
      completedAt: null,
      comments: [],
      activity: [],
    };
    const notifications =
      data.assigneeId !== actorId
        ? [
            buildNotification(s, data.assigneeId, "task_assigned", "New task assigned", `${nameOf(s, actorId)} assigned you “${created.title}”.`, `/tasks/${created.id}`),
          ]
        : [];
    return { ...s, tasks: [created, ...s.tasks], notifications: [...notifications, ...s.notifications] };
  });
  return created;
}

export async function updateTask(id, data, actorId) {
  await delay(400);
  write((s) => {
    const before = s.tasks.find((t) => t.id === id);
    const reassigned = before.assigneeId !== data.assigneeId;
    const assignee = s.employees.find((e) => e.id === data.assigneeId);
    const activity = [...(before.activity ?? []), event("edited", actorId)];
    if (reassigned) activity.push(event("reassigned", actorId, { from: before.assigneeId, to: data.assigneeId }));
    const updated = {
      ...before,
      title: data.title.trim(),
      description: data.description.trim(),
      assigneeId: data.assigneeId,
      departmentId: assignee?.departmentId ?? before.departmentId,
      priority: data.priority,
      dueDate: data.dueDate,
      activity,
    };
    const notifications =
      reassigned && data.assigneeId !== actorId
        ? [buildNotification(s, data.assigneeId, "task_assigned", "New task assigned", `${nameOf(s, actorId)} assigned you “${updated.title}”.`, `/tasks/${id}`)]
        : [];
    return { ...s, tasks: s.tasks.map((t) => (t.id === id ? updated : t)), notifications: [...notifications, ...s.notifications] };
  });
}

export async function setTaskStatus(id, status, actorId) {
  await delay(200);
  write((s) => {
    const before = s.tasks.find((t) => t.id === id);
    if (before.status === status) return s;
    const updated = {
      ...before,
      status,
      completedAt: status === "done" ? new Date().toISOString() : null,
      activity: [...(before.activity ?? []), event("status", actorId, { from: before.status, to: status })],
    };
    // Tell whoever created the task when someone else finishes it
    const notifications =
      status === "done" && before.createdById !== actorId
        ? [
            buildNotification(s, before.createdById, "task_completed", "Task completed", `${nameOf(s, actorId)} finished “${before.title}”.`, `/tasks/${id}`),
          ]
        : [];
    return { ...s, tasks: s.tasks.map((t) => (t.id === id ? updated : t)), notifications: [...notifications, ...s.notifications] };
  });
}

export async function addComment(taskId, authorId, body) {
  await delay(250);
  write((s) => {
    const task = s.tasks.find((t) => t.id === taskId);
    const comment = { id: `${taskId}-c${Date.now()}`, authorId, body: body.trim(), createdAt: new Date().toISOString() };
    // Notify the other side of the conversation
    const recipients = [task.assigneeId, task.createdById].filter((id, i, list) => id !== authorId && list.indexOf(id) === i);
    const notifications = recipients.map((userId) =>
      buildNotification(s, userId, "comment_added", "New comment", `${nameOf(s, authorId)} commented on “${task.title}”.`, `/tasks/${taskId}`),
    );
    return {
      ...s,
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, comments: [...t.comments, comment] } : t)),
      notifications: [...notifications, ...s.notifications],
    };
  });
}

export async function deleteTask(id) {
  await delay(300);
  write((s) => ({
    ...s,
    tasks: s.tasks.filter((t) => t.id !== id),
    notifications: s.notifications.filter((n) => n.link !== `/tasks/${id}`),
  }));
}
