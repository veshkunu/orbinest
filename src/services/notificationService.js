import { delay, read, write } from "./db";

/** Pure helper for other services: a new unread notification for `userId`. */
export function buildNotification(_state, userId, type, title, body, link) {
  return {
    id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId,
    type,
    title,
    body,
    link,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

/** Type groups used by the notifications page filter. */
export const NOTIFICATION_GROUPS = {
  tasks: ["task_assigned", "task_due_soon", "task_overdue", "task_completed"],
  comments: ["comment_added"],
  announcements: ["announcement"],
};

/** Newest first. `group` is a key of NOTIFICATION_GROUPS. */
export async function listNotifications(userId, { unreadOnly = false, group = "", limit } = {}) {
  await delay();
  const types = NOTIFICATION_GROUPS[group];
  const items = read()
    .notifications.filter((n) => n.userId === userId && (!unreadOnly || !n.read) && (!types || types.includes(n.type)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return limit ? items.slice(0, limit) : items;
}

export async function countNotifications(userId) {
  const mine = read().notifications.filter((n) => n.userId === userId);
  return { all: mine.length, unread: mine.filter((n) => !n.read).length };
}

export async function countUnread(userId) {
  return read().notifications.filter((n) => n.userId === userId && !n.read).length;
}

/** Pass `isRead = false` to mark a notification unread again. */
export async function markRead(id, isRead = true) {
  write((s) => ({
    ...s,
    notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: isRead } : n)),
  }));
}

export async function markAllRead(userId) {
  write((s) => ({
    ...s,
    notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
  }));
}
