import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FileX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useQuery } from "../hooks/useQuery";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { createTask, getTask, updateTask } from "../services/taskService";
import { PageHeader } from "../components/layout/PageHeader";
import { Button, EmptyState, Skeleton } from "../components/ui";
import { TaskForm } from "../features/tasks/TaskForm";
import { toFormValues } from "../features/tasks/taskFormModel";

/** Create (/tasks/new?assignee=…) and edit (/tasks/:taskId/edit). Admin only. */
export function TaskFormPage() {
  const { taskId } = useParams();
  const isEdit = Boolean(taskId);
  const [params] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setDirty, dialog } = useUnsavedChanges();
  const { data: task, isLoading } = useQuery(`task:${taskId ?? "new"}`, () => (isEdit ? getTask(taskId) : null));

  const prefillAssignee = params.get("assignee") ?? "";
  const back = isEdit
    ? { to: `/tasks/${taskId}`, label: "Back to task" }
    : prefillAssignee
      ? { to: `/employees/${prefillAssignee}?tab=tasks`, label: "Back to employee" }
      : { to: "/tasks", label: "Tasks" };

  if (isEdit && isLoading) {
    return (
      <div role="status" aria-label="Loading task" className="mx-auto flex max-w-3xl flex-col gap-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-56 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (isEdit && !task) {
    return (
      <EmptyState page
        icon={FileX}
        title="We can't find this task"
        description="It may have been deleted, or the link is wrong."
        action={<Button to="/tasks">Back to tasks</Button>}
      />
    );
  }

  const handleSubmit = async (values) => {
    if (isEdit) {
      await updateTask(taskId, values, user.id);
      setDirty(false);
      toast("Task updated.");
      navigate(`/tasks/${taskId}`);
    } else {
      const created = await createTask(values, user.id);
      setDirty(false);
      toast("Task created and assigned.");
      navigate(`/tasks/${created.id}`, { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        back={back}
        title={isEdit ? "Edit task" : "Create task"}
        description={isEdit ? task.title : "Describe the work, pick a person and set a due date."}
      />
      <TaskForm
        key={task?.id ?? `new-${prefillAssignee}`}
        initialValues={toFormValues(task, { assigneeId: prefillAssignee })}
        isNew={!isEdit}
        submitLabel={isEdit ? "Save changes" : "Create task"}
        onSubmit={handleSubmit}
        onCancel={() => navigate(back.to)}
        onDirtyChange={setDirty}
      />
      {dialog}
    </div>
  );
}
