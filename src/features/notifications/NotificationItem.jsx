import { useNavigate } from "react-router-dom";
import { Mail, MailOpen } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatRelative } from "../../lib/format";
import { markRead } from "../../services/notificationService";
import { NOTIFICATION_TYPES } from "./notificationMeta";

/**
 * One notification row. Clicking marks it read and opens its link.
 * `showReadToggle` adds a separate button to mark read / unread without opening it.
 */
export function NotificationItem({ notification, onOpen, dense = false, showReadToggle = false }) {
  const navigate = useNavigate();
  const { icon: Icon } = NOTIFICATION_TYPES[notification.type] ?? NOTIFICATION_TYPES.announcement;
  const unread = !notification.read;

  const open = () => {
    if (unread) markRead(notification.id);
    onOpen?.();
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className={cn("group flex items-stretch transition-colors duration-150 hover:bg-canvas", unread && "bg-brand-50/50")}>
      <button
        type="button"
        onClick={open}
        className={cn("flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:bg-canvas", dense ? "px-4 py-3" : "py-4 pl-5", !showReadToggle && !dense && "pr-5")}
      >
        <Icon className="mt-0.5 size-[18px] shrink-0 text-ink-muted" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-3">
            <span className={cn("text-sm text-ink", unread ? "font-semibold" : "font-medium")}>{notification.title}</span>
            <time dateTime={notification.createdAt} className="shrink-0 text-xs text-ink-muted">
              {formatRelative(notification.createdAt)}
            </time>
          </span>
          <span className={cn("mt-0.5 block text-sm text-ink-muted", dense && "line-clamp-2")}>{notification.body}</span>
          {!dense && !notification.link && <span className="mt-1 block text-xs text-ink-muted">Announcement</span>}
        </span>
        {unread && !showReadToggle && (
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-600">
            <span className="sr-only">Unread</span>
          </span>
        )}
      </button>
      {showReadToggle && (
        <div className="flex shrink-0 items-start py-2.5 pr-3 pl-1">
          <button
            type="button"
            onClick={() => markRead(notification.id, !notification.read)}
            title={unread ? "Mark as read" : "Mark as unread"}
            className="relative grid size-10 place-items-center rounded-lg pointer-coarse:size-11 text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
          >
            {unread ? <MailOpen className="size-4" aria-hidden="true" /> : <Mail className="size-4" aria-hidden="true" />}
            {unread && <span className="absolute top-2 right-2 size-2 rounded-full bg-brand-600 ring-2 ring-surface" aria-hidden="true" />}
            <span className="sr-only">
              {unread ? "Mark as read" : "Mark as unread"}: {notification.title}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
