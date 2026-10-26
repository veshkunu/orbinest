import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "../../lib/cn";
import { useTaskStatus } from "./useTaskStatus";

/** Round checkbox that marks a task done (or back to to-do) in one click. */
export function DoneToggle({ task, disabled = false }) {
  const changeStatus = useTaskStatus();
  const [busy, setBusy] = useState(false);
  const done = task.status === "done";

  const toggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setBusy(true);
    await changeStatus(task, done ? "todo" : "done");
    setBusy(false);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? `Mark “${task.title}” as not done` : `Mark “${task.title}” as done`}
      title={done ? "Mark as not done" : "Mark as done"}
      disabled={disabled || busy}
      onClick={toggle}
      className="group grid size-11 shrink-0 place-items-center rounded-full disabled:opacity-50"
    >
      <span
        className={cn(
          "grid size-6 place-items-center rounded-full border-2 transition-colors duration-150",
          done
            ? "border-success-solid text-success-solid"
            : "border-control text-success-solid group-hover:border-success-solid",
        )}
      >
        <Check className={cn("size-3.5", !done && "opacity-0 group-hover:opacity-100")} strokeWidth={3} aria-hidden="true" />
      </span>
    </button>
  );
}
