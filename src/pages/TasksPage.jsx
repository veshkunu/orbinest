import { useSearchParams } from "react-router-dom";
import { ClipboardCheck, ListChecks, Plus, SearchX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEmployeeLookup } from "../hooks/useEmployeeLookup";
import { useQuery } from "../hooks/useQuery";
import { TASK_PRIORITY } from "../lib/constants";
import { fullName } from "../lib/format";
import { countTasksByStatus, listTasks } from "../services/taskService";
import { PageHeader } from "../components/layout/PageHeader";
import { Button, EmptyState, ErrorState, Panel, SearchInput, Select, SkeletonList, Tabs, tabPanelProps } from "../components/ui";
import { TaskList } from "../features/tasks/TaskList";

const TABS = [
  { value: "", label: "All" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "overdue", label: "Overdue" },
  { value: "done", label: "Done" },
];
const TAB_COUNT_KEY = { "": "all", todo: "todo", in_progress: "in_progress", overdue: "overdue", done: "done" };

const PRIORITY_OPTIONS = Object.entries(TASK_PRIORITY).map(([value, { label }]) => ({ value, label }));
const SORT_OPTIONS = [
  { value: "due_asc", label: "Due soonest" },
  { value: "due_desc", label: "Due latest" },
  { value: "priority", label: "Highest priority" },
  { value: "newest", label: "Newest first" },
];

const EMPTY_TAB_COPY = {
  "": { title: "No tasks yet", description: "Create a task and assign it to someone on your team." },
  todo: { title: "Nothing waiting to start", description: "Tasks that haven't been started will show here." },
  in_progress: { title: "Nothing in progress", description: "Tasks someone is working on will show here." },
  overdue: { title: "Nothing is overdue", description: "Every open task is on schedule. Nice work." },
  done: { title: "No finished tasks yet", description: "Completed tasks will show here." },
};

export function TasksPage() {
  const { user, isAdmin } = useAuth();
  const { employees, byId } = useEmployeeLookup();
  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "";
  const search = params.get("q") ?? "";
  const priority = params.get("priority") ?? "";
  const sort = params.get("sort") ?? "due_asc";
  // Staff only ever see their own tasks
  const assigneeId = isAdmin ? (params.get("assignee") ?? "") : user.id;

  const setFilter = (key, value) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const filterKey = `${assigneeId}|${status}|${priority}|${search}|${sort}`;
  const tasks = useQuery(`tasks:${filterKey}`, () => listTasks({ assigneeId, status, priority, search, sort }));
  const counts = useQuery(`task-counts:${assigneeId}`, () => countTasksByStatus({ assigneeId }));

  const hasFilters = Boolean(search || priority || (isAdmin && assigneeId));
  const clearFilters = () => setParams(status ? { status } : {}, { replace: true });
  const canToggle = (task) => isAdmin || task.assigneeId === user.id;

  const emptyCopy = EMPTY_TAB_COPY[status];

  return (
    <>
      <PageHeader
        title={isAdmin ? "Tasks" : "My tasks"}
        description={isAdmin ? "Everything your team is working on" : "Everything assigned to you"}
        actions={
          isAdmin && (
            <Button to="/tasks/new" icon={Plus}>
              Create task
            </Button>
          )
        }
      />

      <Panel padded={false}>
        <div className="px-4 pt-2">
          <Tabs
            id="task-status"
            label="Filter by status"
            value={status}
            onChange={(v) => setFilter("status", v)}
            tabs={TABS.map((t) => ({ ...t, count: counts.data?.[TAB_COUNT_KEY[t.value]] }))}
          />
        </div>

        <div {...tabPanelProps("task-status", status)}>
          <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
            <SearchInput
              value={search}
              onChange={(v) => setFilter("q", v)}
              label="Search tasks"
              placeholder="Search tasks"
              className="lg:max-w-xs lg:flex-1"
            />
            <div className={isAdmin ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex" : "grid grid-cols-2 gap-3 lg:flex"}>
              {isAdmin && (
                <Select
                  aria-label="Filter by person"
                  value={assigneeId}
                  onChange={(e) => setFilter("assignee", e.target.value)}
                  placeholder="Everyone"
                  options={employees.filter((e) => e.status !== "inactive").map((e) => ({ value: e.id, label: fullName(e) }))}
                  className="col-span-2 sm:col-span-1 lg:w-48"
                />
              )}
              <Select
                aria-label="Filter by priority"
                value={priority}
                onChange={(e) => setFilter("priority", e.target.value)}
                placeholder="Any priority"
                options={PRIORITY_OPTIONS}
                className="lg:w-40"
              />
              <Select
                aria-label="Sort tasks"
                value={sort}
                onChange={(e) => setFilter("sort", e.target.value === "due_asc" ? "" : e.target.value)}
                options={SORT_OPTIONS}
                className="lg:w-44"
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="lg:ml-auto">
                Clear filters
              </Button>
            )}
          </div>

          {tasks.isLoading ? (
            <div className="px-5">
              <SkeletonList rows={6} label="Loading tasks" />
            </div>
          ) : tasks.isError ? (
            <ErrorState onRetry={tasks.refetch} />
          ) : tasks.data.length === 0 ? (
            hasFilters ? (
              <EmptyState
                icon={SearchX}
                title="No tasks match those filters"
                description="Try a different search or clear the filters."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={status === "overdue" ? ClipboardCheck : ListChecks}
                title={isAdmin || status ? emptyCopy.title : "You have no tasks"}
                description={isAdmin || status ? emptyCopy.description : "When someone assigns you a task, it will show up here."}
                action={
                  isAdmin &&
                  !status && (
                    <Button to="/tasks/new" icon={Plus}>
                      Create task
                    </Button>
                  )
                }
              />
            )
          ) : (
            <>
              <TaskList tasks={tasks.data} byId={byId} showAssignee={isAdmin && !assigneeId} canToggle={canToggle} />
              <p className="border-t border-line px-5 py-3 text-sm text-ink-muted" aria-live="polite">
                {tasks.data.length} {tasks.data.length === 1 ? "task" : "tasks"}
              </p>
            </>
          )}
        </div>
      </Panel>
    </>
  );
}
