import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatShortDate, isOverdue } from "../../lib/format";
import { PriorityBadge, StatusBadge } from "../../components/ui";

/** Compact task line used in lists on profile and dashboard pages. */
export function TaskRow({ task, meta }) {
  const overdue = isOverdue(task);
  return (
    <li>
      <Link
        to={`/tasks/${task.id}`}
        className="flex flex-col gap-2 px-5 py-3.5 transition-colors duration-150 hover:bg-canvas sm:flex-row sm:items-center sm:gap-4"
      >
        <div className="min-w-0 flex-1">
          <p className={cn("truncate font-medium", task.status === "done" ? "text-ink-muted" : "text-ink")}>{task.title}</p>
          {meta && <p className="truncate text-sm text-ink-muted">{meta}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {task.priority === "high" && task.status !== "done" && <PriorityBadge priority="high" />}
          <StatusBadge status={task.status} />
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-sm tabular-nums sm:w-24 sm:justify-end",
              overdue ? "font-medium text-danger-ink" : "text-ink-muted",
            )}
          >
            <CalendarDays className="size-4" aria-hidden="true" />
            <span className="sr-only">Due</span>
            {formatShortDate(task.dueDate)}
          </span>
        </div>
      </Link>
    </li>
  );
}
