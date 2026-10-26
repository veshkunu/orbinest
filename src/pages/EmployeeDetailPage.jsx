import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ClipboardList, Ellipsis, Palmtree, Pencil, Plus, UserCheck, UserX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDepartments } from "../hooks/useDepartments";
import { useQuery } from "../hooks/useQuery";
import { fullName } from "../lib/format";
import { getEmployee, setEmployeeStatus } from "../services/employeeService";
import { listTasks } from "../services/taskService";
import { BackLink } from "../components/layout/PageHeader";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  IconButton,
  Menu,
  Panel,
  Skeleton,
  SkeletonList,
  Tabs,
  tabPanelProps,
} from "../components/ui";
import { ContactList, DetailsPanel, JobList, ProfileHeader } from "../features/employees/ProfileDetails";
import { TaskRow } from "../features/tasks/TaskRow";
import { TaskSummary } from "../features/employees/TaskSummary";

export function EmployeeDetailPage() {
  const { employeeId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { departmentName } = useDepartments();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "tasks" ? "tasks" : "overview";
  const [confirm, setConfirm] = useState(null); // "deactivate" | null
  const [saving, setSaving] = useState(false);

  const employeeQuery = useQuery(`employee:${employeeId}`, () => getEmployee(employeeId));
  const tasksQuery = useQuery(`tasks:assignee:${employeeId}`, () => listTasks({ assigneeId: employeeId }));

  // Ignore results still showing from a previously viewed employee
  const employee = employeeQuery.data?.id === employeeId ? employeeQuery.data : null;
  const loading = employeeQuery.isFetching && !employee;
  const tasks = tasksQuery.data?.every((t) => t.assigneeId === employeeId) ? tasksQuery.data : [];
  const tasksLoading = tasksQuery.isFetching && tasks.length === 0;

  if (loading) {
    return (
      <div role="status" aria-label="Loading employee">
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!employee) {
    return (
      <EmptyState page
        icon={UserX}
        title="We can't find this employee"
        description="They may have been removed, or the link is wrong."
        action={<Button to="/employees">Back to employees</Button>}
      />
    );
  }

  const name = fullName(employee);
  const isSelf = employee.id === user.id;

  const changeStatus = async (status, message) => {
    setSaving(true);
    await setEmployeeStatus(employee.id, status);
    setSaving(false);
    setConfirm(null);
    toast(message);
  };

  const menuItems = [];
  if (employee.status === "active") {
    menuItems.push({ label: "Mark as on leave", icon: Palmtree, onSelect: () => changeStatus("on_leave", `${employee.firstName} is now on leave.`) });
  }
  if (employee.status === "on_leave") {
    menuItems.push({ label: "Mark as back from leave", icon: UserCheck, onSelect: () => changeStatus("active", `${employee.firstName} is back and active.`) });
  }
  if (employee.status === "inactive") {
    menuItems.push({ label: "Reactivate", icon: UserCheck, onSelect: () => changeStatus("active", `${name} can sign in again.`) });
  } else if (!isSelf) {
    menuItems.push({ divider: true }, { label: "Deactivate", icon: UserX, tone: "danger", onSelect: () => setConfirm("deactivate") });
  }

  const openTasks = tasks.filter((t) => t.status !== "done");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <>
      <BackLink to="/employees" label="Employees" />
      <ProfileHeader
          employee={employee}
          departmentName={departmentName}
          actions={
            <>
              {employee.status !== "inactive" && (
                <Button variant="secondary" icon={Plus} to={`/tasks/new?assignee=${employee.id}`}>
                  Assign task
                </Button>
              )}
              <Button variant="secondary" icon={Pencil} to={`/employees/${employee.id}/edit`}>
                Edit
              </Button>
              {menuItems.length > 0 && (
                <Menu
                  label={`More actions for ${name}`}
                  items={menuItems}
                  trigger={({ props }) => (
                    <IconButton {...props} icon={Ellipsis} label="More actions" disabled={saving} className="border border-line-strong bg-surface" />
                  )}
                />
              )}
            </>
          }
        />

      {employee.status === "inactive" && (
        <p className="mb-6 rounded-lg border border-line bg-sunken px-4 py-3 text-sm text-ink-muted">
          This account is deactivated. {employee.firstName} can't sign in and won't get new tasks.
        </p>
      )}

      <Tabs
        id="employee-section"
        label="Employee sections"
        value={tab}
        onChange={(value) => setParams(value === "tasks" ? { tab: "tasks" } : {}, { replace: true })}
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "tasks", label: "Tasks", count: tasksLoading ? undefined : openTasks.length },
        ]}
        className="mb-6"
      />

      {tab === "overview" ? (
        <div {...tabPanelProps("employee-section", tab)} className="flex flex-col gap-6">
          <TaskSummary tasks={tasks} loading={tasksLoading} />
          <DetailsPanel
            contact={<ContactList employee={employee} />}
            job={<JobList employee={employee} departmentName={departmentName} />}
          />
        </div>
      ) : (
        <div {...tabPanelProps("employee-section", tab)} className="flex flex-col gap-6">
          <Panel title="Open tasks" description="Sorted by due date" padded={false}>
            {tasksLoading ? (
              <div className="px-5">
                <SkeletonList rows={3} label="Loading tasks" />
              </div>
            ) : openTasks.length === 0 ? (
              <EmptyState
                compact
                icon={ClipboardList}
                title={`${employee.firstName} has no open tasks`}
                description={employee.status === "inactive" ? undefined : "Assign a task to get them started."}
                action={
                  employee.status !== "inactive" && (
                    <Button variant="secondary" icon={Plus} to={`/tasks/new?assignee=${employee.id}`}>
                      Assign task
                    </Button>
                  )
                }
              />
            ) : (
              <ul className="divide-y divide-line">
                {openTasks.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </ul>
            )}
          </Panel>
          {doneTasks.length > 0 && (
            <Panel title="Completed" padded={false}>
              <ul className="divide-y divide-line">
                {[...doneTasks].reverse().slice(0, 10).map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirm === "deactivate"}
        onClose={() => setConfirm(null)}
        onConfirm={() => changeStatus("inactive", `${name} was deactivated.`)}
        loading={saving}
        title={`Deactivate ${name}?`}
        description={`${employee.firstName} won't be able to sign in. Their tasks and history stay in Orbinest, and you can reactivate them at any time.`}
        confirmLabel="Deactivate"
      />
    </>
  );
}
