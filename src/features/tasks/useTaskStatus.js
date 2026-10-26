import { useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { TASK_STATUS } from "../../lib/constants";
import { setTaskStatus } from "../../services/taskService";

/** Change a task's status with a confirming toast and a one-click undo. */
export function useTaskStatus() {
  const { user } = useAuth();
  const { toast } = useToast();

  return useCallback(
    async (task, status) => {
      const previous = task.status;
      if (previous === status) return;
      await setTaskStatus(task.id, status, user.id);
      const message =
        status === "done" ? "Task marked as done." : `Task moved to ${TASK_STATUS[status].label.toLowerCase()}.`;
      toast(message, { action: { label: "Undo", onClick: () => setTaskStatus(task.id, previous, user.id) } });
    },
    [user.id, toast],
  );
}
