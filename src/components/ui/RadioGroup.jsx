import { useId } from "react";
import { cn } from "../../lib/cn";

/**
 * Choice cards for a small set of options with descriptions.
 * `options` is [{ value, label, description?, icon? }].
 */
export function RadioGroup({ label, hint, name, value, onChange, options, columns = 2, className }) {
  const id = useId();
  return (
    <fieldset className={cn("flex flex-col gap-1.5", className)} aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend className="mb-1.5 text-sm font-medium text-ink">{label}</legend>
      <div className={cn("grid gap-3", columns === 3 ? "grid-cols-3" : "sm:grid-cols-2")}>
        {options.map((option) => {
          const Icon = option.icon;
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors duration-150",
                "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-600",
                checked ? "border-brand-600 bg-brand-50/60" : "border-control bg-surface hover:border-ink-muted",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="mt-0.5 size-4 shrink-0 accent-brand-600 focus-visible:outline-none"
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  {Icon && <Icon className="size-4 text-ink-muted" aria-hidden="true" />}
                  {option.label}
                </span>
                {option.description && <span className="text-sm text-ink-muted">{option.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      )}
    </fieldset>
  );
}
