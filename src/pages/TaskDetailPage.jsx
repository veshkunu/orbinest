import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2, CalendarDays, Check, Ellipsis, FileX, Flag, Pencil, RotateCcw, ShieldX, Trash2, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDepartments } from "../hooks/useDepartments";
import { useEmployeeLookup } from "../hooks/useEmployeeLookup";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useQuery } from "../hooks/useQuery";
import { cn } from "../lib/cn";
import { TASK_PRIORITY } from "../lib/constants";
import { dueLabel, formatDate, fullName, isOverdue } from "../lib/format";
import { deleteTask, getTask } from "../services/taskService";
import { BackLink } from "../components/layout/PageHeader";
import {
  Avatar,
  Button,
  ConfirmDialog,
  EmptyState,
  IconButton,
  Menu,
  Panel,
  PriorityBadge,
  Skeleton,
  StatusBadge,
} from "../components/ui";
import { StatusSwitcher } from "../features/tasks/StatusSwitcher";
import { TaskActivity } from "../features/tasks/TaskActivity";
import { useTaskStatus } from "../features/tasks/useTaskStatus";

function DetailItem({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
      <dt className="w-24 shrink-0 text-sm text-ink-muted">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm text-ink">{children}</dd>
    </div>
  );
}

function PersonLink({ person, linkable }) {
  if (!person) return <span className="text-ink-muted">Unknown</span>;
  const content = (
    <span className="inline-flex items-center gap-2">
      <Avatar person={person} size="sm" className="size-6 text-[10px]" />
      {fullName(person)}
    </span>
  );
  return linkable ? (
    <Link to={`/employees/${person.id}`} className="font-medium hover:text-brand-700">
      {content}
    </Link>
  ) : (
    content
  );
}

export function TaskDetailPage() {
  const { taskId } = useParams();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { byId } = useEmployeeLookup();
  const { departmentName } = useDepartments();
  const changeStatus = useTaskStatus();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const query = useQuery(`task:${taskId}`, () => getTask(taskId));
  const task = query.data?.id === taskId ? query.data : null;
  useDocumentTitle(task ? task.title : "Task");

  if (query.isFetching && !task) {
    return (
      <div role="status" aria-label="Loading task">
        <Skeleton className="mb-3 h-5 w-20" />
        <Skeleton className="mb-8 h-8 w-2/3" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-lg lg:col-span-2" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <EmptyState page
        icon={FileX}
        title="We can't find this task"
        description="It may have been deleted, or the link is wrong."
        action={<Button to="/tasks">Back to tasks</Button>}
      />
    );
  }

  const isAssignee = task.assigneeId === user.id;
  if (!isAdmin && !isAssignee) {
    return (
      <EmptyState page
        icon={ShieldX}
        title="This task belongs to someone else"
        description="You can only open tasks assigned to you."
        action={<Button to="/tasks">Go to my tasks</Button>}
      />
    );
  }

  const overdue = isOverdue(task);
  const done = task.status === "done";

  const updateStatus = async (status) => {
    setUpdating(true);
    await changeStatus(task, status);
    setUpdating(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteTask(task.id);
    toast("Task deleted.");
    navigate("/tasks", { replace: true });
  };

  return (
    <>
      <BackLink to="/tasks" label={isAdmin ? "Tasks" : "My tasks"} />

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className={cn("text-2xl font-bold tracking-tight sm:text-[2rem] sm:leading-10", done ? "text-ink-muted" : "text-ink")}>{task.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            <span className={cn("text-sm", overdue ? "font-medium text-danger-ink" : "text-ink-muted")}>{dueLabel(task)}</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {done ? (
            <Button variant="secondary" icon={RotateCcw} loading={updating} onClick={() => updateStatus("todo")}>
              Reopen task
            </Button>
          ) : (
            <Button icon={Check} loading={updating} onClick={() => updateStatus("done")}>
              Mark as done
            </Button>
          )}
          {isAdmin && (
            <>
              <Button variant="secondary" icon={Pencil} to={`/tasks/${task.id}/edit`}>
                Edit
              </Button>
              <Menu
                label="More task actions"
                items={[{ label: "Delete task", icon: Trash2, tone: "danger", onSelect: () => setConfirmDelete(true) }]}
                trigger={({ props }) => (
                  <IconButton {...props} icon={Ellipsis} label="More actions" className="border border-line-strong bg-surface" />
                )}
              />
            </>
          )}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <Panel title="Details">
            {task.description ? (
              <p className="max-w-prose text-base whitespace-pre-line text-ink">{task.description}</p>
            ) : (
              <p className="text-sm text-ink-muted">No details were added to this task.</p>
            )}
          </Panel>
          <Panel title="Comments and activity">
            <TaskActivity task={task} byId={byId} />
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-24">
          <Panel title="Status">
            <StatusSwitcher value={task.status} onChange={updateStatus} disabled={updating} />
          </Panel>
          <Panel title="About this task">
            <dl className="divide-y divide-line">
              <DetailItem icon={UserRound} label="Assigned to">
                <PersonLink person={byId(task.assigneeId)} linkable={isAdmin} />
              </DetailItem>
              <DetailItem icon={CalendarDays} label="Due date">
                <span className={cn(overdue && "font-medium text-danger-ink")}>{formatDate(task.dueDate)}</span>
              </DetailItem>
              {task.departmentId && (
                <DetailItem icon={Building2} label="Department">
                  {departmentName(task.departmentId)}
                </DetailItem>
              )}
              <DetailItem icon={Flag} label="Priority">
                {TASK_PRIORITY[task.priority].label}
              </DetailItem>
              <DetailItem icon={UserRound} label="Created by">
                <PersonLink person={byId(task.createdById)} linkable={isAdmin} />
              </DetailItem>
              <DetailItem icon={CalendarDays} label="Created">
                {formatDate(task.createdAt)}
              </DetailItem>
              {task.completedAt && (
                <DetailItem icon={Check} label="Completed">
                  {formatDate(task.completedAt)}
                </DetailItem>
              )}
            </dl>
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this task?"
        description={`“${task.title}” and its comments will be removed for everyone. This can't be undone.`}
        confirmLabel="Delete task"
      />
    </>
  );
}
