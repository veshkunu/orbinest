import { cn } from "../../lib/cn";
import { tabProps } from "./tabPanel";

/**
 * Underlined tab bar for switching views of one list (filters, sections).
 * `tabs` is [{ value, label, count? }]. Arrow keys move between tabs.
 * Pass `id` and spread `tabPanelProps(id, value)` on the region the tabs control.
 */
export function Tabs({ id, tabs, value, onChange, label, bordered = true, className }) {
  const onKeyDown = (e) => {
    const move = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!move) return;
    e.preventDefault();
    const index = tabs.findIndex((t) => t.value === value);
    const next = tabs[(index + move + tabs.length) % tabs.length];
    onChange(next.value);
    e.currentTarget.querySelector(`[data-value="${next.value}"]`)?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]", bordered && "border-b border-line", className)}
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            {...(id ? tabProps(id, tab.value) : {})}
            data-value={tab.value}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cn(
              "flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors duration-150",
              selected ? "border-brand-600 text-ink" : "border-transparent text-ink-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs tabular-nums",
                  selected ? "bg-brand-50 text-brand-700" : "bg-sunken text-ink-muted",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
