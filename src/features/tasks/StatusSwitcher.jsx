import { CircleCheck, CircleDashed, CircleDot } from "lucide-react";
import { cn } from "../../lib/cn";
import { TASK_STATUS } from "../../lib/constants";

const OPTIONS = [
  { value: "todo", icon: CircleDashed, selected: "bg-surface text-ink ring-1 ring-line-strong" },
  { value: "in_progress", icon: CircleDot, selected: "bg-brand-50 text-brand-800 ring-1 ring-brand-100" },
  { value: "done", icon: CircleCheck, selected: "bg-success-soft text-success-ink ring-1 ring-success-line" },
];

/** Three-way segmented control for a task's status. Radio semantics for screen readers. */
export function StatusSwitcher({ value, onChange, disabled = false }) {
  return (
    <div role="radiogroup" aria-label="Task status" className="grid grid-cols-3 gap-1 rounded-lg bg-sunken p-1">
      {OPTIONS.map(({ value: option, icon: Icon, selected }) => {
        const checked = value === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !checked && onChange(option)}
            className={cn(
              "flex min-h-10 items-center justify-center gap-1.5 rounded-md px-1.5 text-center text-sm leading-tight font-medium transition-colors duration-150 disabled:opacity-50",
              checked ? selected : "text-ink-muted hover:bg-surface/70 hover:text-ink",
            )}
          >
            <Icon className="size-4 shrink-0 max-xl:hidden" aria-hidden="true" />
            <span>{TASK_STATUS[option].label}</span>
          </button>
        );
      })}
    </div>
  );
}
