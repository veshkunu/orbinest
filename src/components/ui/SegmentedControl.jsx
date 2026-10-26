import { cn } from "../../lib/cn";

/** Small set of mutually exclusive options (e.g. a date range). `options` is [{ value, label }]. */
export function SegmentedControl({ label, value, onChange, options, className }) {
  const onKeyDown = (e) => {
    const move = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!move) return;
    e.preventDefault();
    const index = options.findIndex((o) => o.value === value);
    const next = options[(index + move + options.length) % options.length];
    onChange(next.value);
    e.currentTarget.querySelector(`[data-value="${next.value}"]`)?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className={cn("inline-flex gap-1 rounded-lg bg-sunken p-1", className)}>
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            data-value={o.value}
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              "h-9 rounded-md px-3 text-sm pointer-coarse:h-10 font-medium whitespace-nowrap transition-colors duration-150",
              checked ? "bg-surface text-ink ring-1 ring-line" : "text-ink-muted hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
