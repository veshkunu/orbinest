import { Link } from "react-router-dom";
import { ClipboardCheck, Palmtree, Plus, UserPlus } from "lucide-react";
import { useEmployeeLookup } from "../../hooks/useEmployeeLookup";
import { useQuery } from "../../hooks/useQuery";
import { formatLongDate } from "../../lib/format";
import { getAdminSummary } from "../../services/dashboardService";
import { getWorkspace } from "../../services/employeeService";
import { PageHeader } from "../../components/layout/PageHeader";
import { RailSection } from "../../components/layout/RailSection";
import { Avatar, Button, EmptyState, ErrorState, KpiStrip, Panel, Skeleton, SkeletonList } from "../../components/ui";
import { ActivityFeed } from "./ActivityFeed";
import { DashboardTaskList } from "./DashboardTaskList";
import { WeekByPerson } from "./WeekByPerson";

/** The one line under the title: today's date and the fact that most needs attention. */
function finding(data) {
  if (!data.overdueCount) return "Nothing is overdue. Every open task is on schedule.";
  const who = data.mostOverdue && data.mostOverdue.count > 1 ? `, ${data.mostOverdue.count} of them with ${data.mostOverdue.name}` : "";
  return `${data.overdueCount} ${data.overdueCount === 1 ? "task is" : "tasks are"} overdue${who}.`;
}

function LoadingLayout() {
  return (
    <div role="status" aria-label="Loading dashboard" className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-72 rounded-lg" />
        <Panel>
          <SkeletonList rows={2} />
        </Panel>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { byId } = useEmployeeLookup();
  const workspace = getWorkspace();
  const { data, isLoading, isError, refetch } = useQuery("dashboard:admin", getAdminSummary);

  return (
    <>
      <PageHeader
        title={workspace.name}
        documentTitle="Overview"
        description={data ? `${formatLongDate()} · ${finding(data)}` : formatLongDate()}
        actions={
          <>
            <Button variant="secondary" icon={UserPlus} to="/employees/new">
              Add employee
            </Button>
            <Button icon={Plus} to="/tasks/new">
              Create task
            </Button>
          </>
        }
      />

      {isLoading ? (
        <LoadingLayout />
      ) : isError ? (
        <Panel>
          <ErrorState onRetry={refetch} />
        </Panel>
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-[1fr_340px]">
          <div className="flex min-w-0 flex-col gap-6">
            <KpiStrip
              items={[
                { label: "Team members", value: data.teamSize, caption: `${data.onLeave.length} on leave`, to: "/employees" },
                { label: "Open tasks", value: data.openCount, caption: `${data.inProgressCount} in progress`, to: "/tasks" },
                { label: "Due today", value: data.dueTodayCount, caption: "Not yet done", to: "/tasks?sort=due_asc" },
                {
                  label: "Overdue",
                  value: data.overdueCount,
                  alert: data.overdueCount > 0,
                  caption: data.overdueCount ? "Past their due date" : "All on time",
                  to: "/tasks?status=overdue",
                },
              ]}
            />

            <Panel title="Next 7 days by person" description="Tasks due each day, and what each person is already behind on" padded={false}>
              {data.week.rows.length ? (
                <WeekByPerson week={data.week} hiddenCount={data.week.hiddenCount} />
              ) : (
                <EmptyState compact icon={ClipboardCheck} title="Nothing due in the next 7 days" description="No one has open tasks due soon, and nothing is overdue." />
              )}
            </Panel>

            <Panel
              title="Needs attention"
              description="Overdue, or due in the next two days"
              padded={false}
              actions={
                data.needsAttentionTotal > data.needsAttention.length && (
                  <Button variant="ghost" size="sm" to="/tasks">
                    View all {data.needsAttentionTotal}
                  </Button>
                )
              }
            >
              {data.needsAttention.length ? (
                <DashboardTaskList tasks={data.needsAttention} byId={byId} />
              ) : (
                <EmptyState compact icon={ClipboardCheck} title="Nothing urgent" description="No tasks are overdue or due in the next two days." />
              )}
            </Panel>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <RailSection title="Recent activity" padded>
              {data.recentActivity.length ? (
                <ActivityFeed events={data.recentActivity} byId={byId} />
              ) : (
                <p className="text-sm text-ink-muted">Finished tasks and new comments will show up here.</p>
              )}
            </RailSection>

            <RailSection
              title="On leave"
              action={
                <Link to="/employees?status=on_leave" className="text-sm font-medium text-brand-700 hover:underline">
                  View
                </Link>
              }
            >
              {data.onLeave.length ? (
                <ul className="divide-y divide-rule">
                  {data.onLeave.map((e) => (
                    <li key={e.id}>
                      <Link to={`/employees/${e.id}`} className="flex items-center gap-3 px-5 py-3 hover:[&_.name]:text-brand-700">
                        <Avatar person={e} size="sm" />
                        <span className="min-w-0">
                          <span className="name block truncate text-sm font-medium text-ink transition-colors">
                            {e.firstName} {e.lastName}
                          </span>
                          <span className="block truncate text-xs text-ink-muted">{e.jobTitle}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex items-center gap-2 px-5 py-4 text-sm text-ink-muted">
                  <Palmtree className="size-4" aria-hidden="true" />
                  Everyone is in today.
                </p>
              )}
            </RailSection>
          </div>
        </div>
      )}
    </>
  );
}
