import { useId } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * Label, hint and error wrapper for any form control.
 * `children` is a render function receiving the props to spread on the control.
 */
export function Field({ label, hint, error, required, className, children }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required && (
            <span className="text-danger-ink" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
      )}
      {children({
        id,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": cn(hintId, errorId) || undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm font-medium text-danger-ink">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export const controlClasses =
  "w-full rounded-md border border-control bg-surface px-3 text-base text-ink transition-[border-color,box-shadow] duration-150 sm:text-sm " +
  "placeholder:text-ink-subtle hover:border-ink-muted " +
  "focus:border-brand-600 focus:ring-3 focus:ring-brand-100 focus:outline-none " +
  "aria-invalid:border-danger-solid aria-invalid:focus:ring-danger-soft " +
  "disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-muted";
