import { Link } from "react-router-dom";
import { Bell, BellOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "../../hooks/useQuery";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { listNotifications, markAllRead } from "../../services/notificationService";
import { NotificationItem } from "../../features/notifications/NotificationItem";
import { EmptyState, IconButton, Popover, SkeletonList } from "../ui";

const PREVIEW_COUNT = 5;

function BellPanel({ close }) {
  const { user } = useAuth();
  const unread = useUnreadCount();
  const { data: items = [], isLoading } = useQuery(`bell:${user.id}`, () =>
    listNotifications(user.id, { limit: PREVIEW_COUNT }),
  );

  return (
    <div className="w-[min(24rem,calc(100vw-2rem))]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Notifications</h2>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => markAllRead(user.id)}
            className="h-8 rounded-md px-2 text-sm font-medium text-brand-700 pointer-coarse:h-11 hover:bg-brand-50"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="max-h-[min(26rem,60vh)] divide-y divide-line overflow-y-auto">
        {isLoading ? (
          <div className="px-4">
            <SkeletonList rows={3} label="Loading notifications" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState compact icon={BellOff} title="You're all caught up" description="New tasks, comments and updates will show up here." />
        ) : (
          items.map((n) => <NotificationItem key={n.id} notification={n} dense onOpen={() => close()} />)
        )}
      </div>
      <Link
        to="/notifications"
        onClick={() => close()}
        className="flex h-11 items-center justify-center rounded-b-xl border-t border-line text-sm font-medium text-brand-700 hover:bg-canvas"
      >
        View all notifications
      </Link>
    </div>
  );
}

export function NotificationBell() {
  const unread = useUnreadCount();
  const label = unread > 0 ? `Notifications, ${unread} unread` : "Notifications";

  return (
    <Popover
      label="Notifications"
      className="p-0"
      trigger={({ props }) => (
        <IconButton
          {...props}
          icon={Bell}
          label={label}
          badge={
            unread > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1.5 right-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger-solid px-1 text-[11px] font-semibold text-white tabular-nums ring-2 ring-canvas"
              >
                {unread > 9 ? "9+" : unread}
              </span>
            )
          }
        />
      )}
    >
      {(close) => <BellPanel close={close} />}
    </Popover>
  );
}
