import { Link, useNavigate } from "react-router-dom";
import { cn } from "../../lib/cn";
import { dueLabel, fullName, isOverdue } from "../../lib/format";
import { Avatar, PriorityBadge, PriorityText, StatusBadge, TBody, THead, Table, Td, Th, Tr } from "../../components/ui";
import { DoneToggle } from "./DoneToggle";

function DueText({ task }) {
  const overdue = isOverdue(task);
  return (
    <span className={cn("text-sm whitespace-nowrap tabular-nums", overdue ? "font-medium text-danger-ink" : "text-ink-muted")}>
      {dueLabel(task)}
    </span>
  );
}

/**
 * Tasks as a table on tablet and up, stacked rows on phones.
 * `showAssignee` adds the assignee column (admins). `canToggle(task)` decides who may tick a task done.
 */
export function TaskList({ tasks, byId, showAssignee, canToggle }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="hidden md:block">
        <Table label="Tasks">
          <THead>
            <Th className="w-14">
              <span className="sr-only">Done</span>
            </Th>
            <Th className="!pl-0">Task</Th>
            {showAssignee && <Th>Assigned to</Th>}
            <Th>Priority</Th>
            <Th>Status</Th>
            <Th>Due</Th>
          </THead>
          <TBody>
            {tasks.map((task) => {
              const assignee = byId(task.assigneeId);
              return (
                <Tr key={task.id} onClick={() => navigate(`/tasks/${task.id}`)}>
                  <Td className="w-14 !pr-0 !pl-2">
                    <DoneToggle task={task} disabled={!canToggle(task)} />
                  </Td>
                  <Td className="!pl-0">
                    <Link
                      to={`/tasks/${task.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "line-clamp-2 font-medium hover:text-brand-700",
                        task.status === "done" ? "text-ink-muted line-through decoration-ink-subtle" : "text-ink",
                      )}
                    >
                      {task.title}
                    </Link>
                  </Td>
                  {showAssignee && (
                    <Td>
                      {assignee && (
                        <span className="flex items-center gap-2.5 whitespace-nowrap">
                          <Avatar person={assignee} size="sm" />
                          <span className="text-ink">{fullName(assignee)}</span>
                        </span>
                      )}
                    </Td>
                  )}
                  <Td>
                    <PriorityText priority={task.priority} />
                  </Td>
                  <Td>
                    {/* The due column carries "overdue" in red; the status stays the task's own state */}
                    <StatusBadge status={task.status} />
                  </Td>
                  <Td>
                    <DueText task={task} />
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      </div>

      <ul className="divide-y divide-line md:hidden" aria-label="Tasks">
        {tasks.map((task) => {
          const assignee = byId(task.assigneeId);
          return (
            <li key={task.id} className="flex items-start gap-1 py-2 pr-4 pl-1">
              <DoneToggle task={task} disabled={!canToggle(task)} />
              <Link to={`/tasks/${task.id}`} className="min-w-0 flex-1 py-1.5">
                <p className={cn("font-medium", task.status === "done" ? "text-ink-muted line-through decoration-ink-subtle" : "text-ink")}>
                  {task.title}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <StatusBadge status={task.status} />
                  {task.priority === "high" && <PriorityBadge priority="high" />}
                  <DueText task={task} />
                </div>
                {showAssignee && assignee && <p className="mt-1.5 text-sm text-ink-muted">{fullName(assignee)}</p>}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
