import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { dueLabel, fullName, isOverdue } from "../../lib/format";
import { Avatar, PriorityBadge } from "../../components/ui";
import { DoneToggle } from "../tasks/DoneToggle";

/**
 * Short task list for dashboards. With `byId` it shows the assignee (admin view);
 * with `toggle` each row gets a one-click done checkbox (staff view).
 */
export function DashboardTaskList({ tasks, byId, toggle = false }) {
  return (
    <ul className="divide-y divide-line">
      {tasks.map((task) => {
        const overdue = isOverdue(task);
        const assignee = byId?.(task.assigneeId);
        return (
          <li key={task.id} className={cn("flex items-center gap-1 pr-5", toggle ? "pl-1" : "pl-5")}>
            {toggle && <DoneToggle task={task} />}
            <Link to={`/tasks/${task.id}`} className="flex min-w-0 flex-1 items-center gap-3 py-3 hover:[&_.title]:text-brand-700">
              {assignee && <Avatar person={assignee} size="sm" />}
              <div className="min-w-0 flex-1">
                <p className="title line-clamp-2 font-medium break-words text-ink transition-colors">{task.title}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-sm">
                  <span className={overdue ? "font-medium text-danger-ink" : "text-ink-muted"}>{dueLabel(task)}</span>
                  {assignee && <span className="text-ink-muted">· {fullName(assignee)}</span>}
                </p>
              </div>
              {task.priority === "high" && (
                <span className="hidden sm:inline-flex">
                  <PriorityBadge priority="high" />
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
