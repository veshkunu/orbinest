import { Link } from "react-router-dom";
import { BellOff, CalendarCheck, PartyPopper } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "../../hooks/useQuery";
import { formatLongDate, greeting } from "../../lib/format";
import { getStaffSummary } from "../../services/dashboardService";
import { listNotifications } from "../../services/notificationService";
import { PageHeader } from "../../components/layout/PageHeader";
import { RailSection } from "../../components/layout/RailSection";
import { EmptyState, ErrorState, Panel, Skeleton, SkeletonList } from "../../components/ui";
import { NotificationItem } from "../notifications/NotificationItem";
import { DashboardTaskList } from "./DashboardTaskList";

function summaryLine({ overdue, dueToday }) {
  if (overdue.length && dueToday.length) {
    return `You have ${overdue.length} overdue and ${dueToday.length} due today.`;
  }
  if (overdue.length) return `You have ${overdue.length} overdue ${overdue.length === 1 ? "task" : "tasks"}. Start there.`;
  if (dueToday.length) return `You have ${dueToday.length} ${dueToday.length === 1 ? "task" : "tasks"} due today.`;
  return "Nothing is due today.";
}

function WeekProgress({ week }) {
  const percent = week.total ? Math.round((week.done / week.total) * 100) : 0;
  return (
    <RailSection title="This week" padded>
      {week.total ? (
        <>
          <p className="text-base text-ink">
            <span className="text-3xl font-semibold tracking-tight">{week.done}</span>
            <span className="text-ink-muted"> of {week.total} tasks done</span>
          </p>
          <div
            role="progressbar"
            aria-label="Tasks done this week"
            aria-valuemin={0}
            aria-valuemax={week.total}
            aria-valuenow={week.done}
            className="mt-4 h-2.5 overflow-hidden rounded-full bg-brand-100"
          >
            <div className="h-full rounded-full bg-brand-600 transition-[width] duration-300" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-sm text-ink-muted">
            {week.done === week.total ? "All done for this week. Great work." : `${week.total - week.done} left for this week`}
          </p>
        </>
      ) : (
        <p className="text-sm text-ink-muted">No tasks are due this week.</p>
      )}
    </RailSection>
  );
}

function LatestNotifications({ userId }) {
  const { data = [], isLoading } = useQuery(`dashboard:notifications:${userId}`, () => listNotifications(userId, { limit: 4 }));
  return (
    <RailSection
      title="Latest updates"
      action={
        <Link to="/notifications" className="inline-flex h-8 items-center rounded-md px-2 text-sm font-medium text-brand-700 pointer-coarse:h-11 hover:bg-brand-50">
          View all
        </Link>
      }
    >
      {isLoading ? (
        <div className="px-5">
          <SkeletonList rows={3} />
        </div>
      ) : data.length ? (
        <div className="divide-y divide-line">
          {data.map((n) => (
            <NotificationItem key={n.id} notification={n} dense />
          ))}
        </div>
      ) : (
        <EmptyState compact icon={BellOff} title="You're all caught up" />
      )}
    </RailSection>
  );
}

function TaskSection({ title, description, tasks, tone }) {
  if (!tasks.length) return null;
  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          {tone === "danger" && <span className="size-2 rounded-full bg-danger-solid" aria-hidden="true" />}
          {title}
          <span className="rounded-full bg-sunken px-2 py-0.5 text-xs font-medium text-ink-muted tabular-nums">{tasks.length}</span>
        </span>
      }
      description={description}
      padded={false}
      className={tone === "danger" ? "border-danger-line" : undefined}
    >
      <DashboardTaskList tasks={tasks} toggle />
    </Panel>
  );
}

export function StaffDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery(`dashboard:staff:${user.id}`, () => getStaffSummary(user.id));

  const nothingSoon = data && !data.overdue.length && !data.dueToday.length && !data.upcoming.length;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.firstName}`}
        documentTitle="Dashboard"
        description={data ? `${formatLongDate()} · ${summaryLine(data)}` : formatLongDate()}
      />

      {isLoading ? (
        <div role="status" aria-label="Loading your day" className="grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
          <Skeleton className="h-56 rounded-lg" />
        </div>
      ) : isError ? (
        <Panel>
          <ErrorState onRetry={refetch} />
        </Panel>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <TaskSection title="Overdue" description="These were due already. Tick them off when done." tasks={data.overdue} tone="danger" />
            <TaskSection title="Due today" tasks={data.dueToday} />
            <TaskSection title="Coming up" description="Due in the next 7 days" tasks={data.upcoming} />

            {nothingSoon && (
              <Panel>
                <EmptyState
                  icon={data.openCount ? CalendarCheck : PartyPopper}
                  title={data.openCount ? "Nothing due this week" : "You're all done"}
                  description={
                    data.openCount
                      ? `You have ${data.laterCount} ${data.laterCount === 1 ? "task" : "tasks"} due later.`
                      : "New tasks will show up here when they're assigned to you."
                  }
                />
              </Panel>
            )}

            {data.openCount > 0 && (
              <Link to="/tasks" className="inline-flex h-11 items-center self-start rounded-md px-1 text-sm font-medium text-brand-700 hover:underline">
                See all my tasks ({data.openCount} open)
              </Link>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <WeekProgress week={data.week} />
            <LatestNotifications userId={user.id} />
          </div>
        </div>
      )}
    </>
  );
}
