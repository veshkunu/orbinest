import { cn } from "../../lib/cn";
import { EMPLOYEE_STATUS, OVERDUE, TASK_PRIORITY, TASK_STATUS } from "../../lib/constants";

const tones = {
  neutral: "bg-sunken text-ink-muted border-line",
  brand: "bg-brand-50 text-brand-800 border-brand-100",
  success: "bg-success-soft text-success-ink border-success-line",
  warning: "bg-warning-soft text-warning-ink border-warning-line",
  danger: "bg-danger-soft text-danger-ink border-danger-line",
  // "info" states (in progress) take the brand tint: one accent family on the screen
  info: "bg-brand-50 text-brand-800 border-brand-100",
};

const dots = {
  neutral: "bg-ink-subtle",
  brand: "bg-brand-600",
  success: "bg-success-solid",
  warning: "bg-warning-solid",
  danger: "bg-danger-solid",
  info: "bg-brand-600",
};

export function Badge({ tone = "neutral", dot = false, className, children }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dots[tone])} aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Task status. Pass `overdue` to show the derived overdue state instead. */
export function StatusBadge({ status, overdue = false }) {
  const meta = overdue ? OVERDUE : (TASK_STATUS[status] ?? TASK_STATUS.todo);
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}

/** Compact priority for table cells: only "High" gets a pill; the rest stay plain grey text. */
export function PriorityText({ priority }) {
  const meta = TASK_PRIORITY[priority] ?? TASK_PRIORITY.medium;
  if (priority === "high") return <Badge tone="warning">{meta.label}</Badge>;
  return <span className="text-sm text-ink-muted">{meta.label}</span>;
}

export function PriorityBadge({ priority }) {
  const meta = TASK_PRIORITY[priority] ?? TASK_PRIORITY.medium;
  return <Badge tone={meta.tone}>{meta.label} priority</Badge>;
}

export function EmployeeStatusBadge({ status }) {
  const meta = EMPLOYEE_STATUS[status] ?? EMPLOYEE_STATUS.active;
  return (
    <Badge tone={meta.tone} dot>
      {meta.label}
    </Badge>
  );
}
