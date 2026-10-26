import { useSearchParams } from "react-router-dom";
import { BellOff, CheckCheck, SearchX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useQuery } from "../hooks/useQuery";
import { groupByDay } from "../lib/format";
import { countNotifications, listNotifications, markAllRead } from "../services/notificationService";
import { PageHeader } from "../components/layout/PageHeader";
import { Button, EmptyState, ErrorState, Panel, Select, SkeletonList, Tabs, tabPanelProps } from "../components/ui";
import { NotificationItem } from "../features/notifications/NotificationItem";

const GROUP_OPTIONS = [
  { value: "tasks", label: "Tasks" },
  { value: "comments", label: "Comments" },
  { value: "announcements", label: "Announcements" },
];

export function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const unreadOnly = params.get("show") === "unread";
  const group = params.get("type") ?? "";

  const setParam = (key, value) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const list = useQuery(`notifications:${user.id}|${unreadOnly}|${group}`, () => listNotifications(user.id, { unreadOnly, group }));
  const counts = useQuery(`notification-counts:${user.id}`, () => countNotifications(user.id));
  const unreadCount = counts.data?.unread ?? 0;

  const handleMarkAll = async () => {
    await markAllRead(user.id);
    toast("All notifications marked as read.");
  };

  const groups = list.data ? groupByDay(list.data) : [];

  let empty = null;
  if (list.data?.length === 0) {
    if (group) {
      empty = (
        <EmptyState
          icon={SearchX}
          title={unreadOnly ? "No unread notifications of this type" : "No notifications of this type"}
          action={
            <Button variant="secondary" onClick={() => setParam("type", "")}>
              Show all types
            </Button>
          }
        />
      );
    } else if (unreadOnly) {
      empty = <EmptyState icon={CheckCheck} title="You're all caught up" description="You've read every notification. New ones will show up here." />;
    } else {
      empty = (
        <EmptyState
          icon={BellOff}
          title="No notifications yet"
          description="You'll be notified here when tasks are assigned, finished or commented on."
        />
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description={unreadCount ? `${unreadCount} unread` : "Updates about your tasks and team"}
        actions={
          <Button variant="secondary" icon={CheckCheck} onClick={handleMarkAll} disabled={!unreadCount}>
            Mark all as read
          </Button>
        }
      />

      <Panel padded={false}>
        <div className="flex flex-col gap-3 border-b border-line px-4 pt-2 sm:flex-row sm:items-end sm:justify-between">
          <Tabs
            id="notification-filter"
            label="Show"
            value={unreadOnly ? "unread" : "all"}
            onChange={(v) => setParam("show", v === "unread" ? "unread" : "")}
            tabs={[
              { value: "all", label: "All", count: counts.data?.all },
              { value: "unread", label: "Unread", count: counts.data?.unread },
            ]}
            bordered={false}
          />
          <Select
            aria-label="Filter by type"
            value={group}
            onChange={(e) => setParam("type", e.target.value)}
            placeholder="All types"
            options={GROUP_OPTIONS}
            className="pb-3 sm:w-44"
          />
        </div>

        <div {...tabPanelProps("notification-filter", unreadOnly ? "unread" : "all")}>
          {list.isLoading ? (
            <div className="px-5">
              <SkeletonList rows={5} label="Loading notifications" />
            </div>
          ) : list.isError ? (
            <ErrorState onRetry={list.refetch} />
          ) : (
            empty ??
            groups.map((g) => (
              <section key={g.key} aria-labelledby={`group-${g.key}`}>
                <h2 id={`group-${g.key}`} className="border-b border-line bg-canvas px-5 py-2 text-xs font-medium text-ink-muted">
                  {g.label}
                </h2>
                <div className="divide-y divide-line border-b border-line last:border-b-0">
                  {g.items.map((n) => (
                    <NotificationItem key={n.id} notification={n} showReadToggle />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
