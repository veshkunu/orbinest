import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { Field, controlClasses } from "./Field";

export function Input({ label, hint, error, required, className, inputClassName, trailing, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(fieldProps) => (
        <div className="relative">
          <input {...fieldProps} {...props} className={cn(controlClasses, "h-10 pointer-coarse:h-11", trailing && "pr-12", inputClassName)} />
          {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-1">{trailing}</div>}
        </div>
      )}
    </Field>
  );
}

export function Textarea({ label, hint, error, required, className, rows = 4, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(fieldProps) => <textarea {...fieldProps} {...props} rows={rows} className={cn(controlClasses, "resize-y py-2.5")} />}
    </Field>
  );
}

/** Native select — familiar and accessible. `options` is [{ value, label }]. */
export function Select({ label, hint, error, required, className, options, placeholder, ...props }) {
  return (
    <Field label={label} hint={hint} error={error} required={required} className={className}>
      {(fieldProps) => (
        <div className="relative">
          <select {...fieldProps} {...props} className={cn(controlClasses, "h-10 appearance-none pr-10 pointer-coarse:h-11")}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          />
        </div>
      )}
    </Field>
  );
}

export function Checkbox({ label, description, className, ...props }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3", className)}>
      <input
        type="checkbox"
        className="mt-0.5 size-5 shrink-0 cursor-pointer rounded border-control accent-brand-600"
        {...props}
      />
      <span className="flex flex-col">
        <span className="text-sm font-medium text-ink">{label}</span>
        {description && <span className="text-sm text-ink-muted">{description}</span>}
      </span>
    </label>
  );
}
