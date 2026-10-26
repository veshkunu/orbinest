import { cn } from "../../lib/cn";

/** Bordered white section. Header is optional; never nest a Panel inside a Panel. */
export function Panel({ title, description, actions, padded = true, className, bodyClassName, children, as: Tag = "section" }) {
  const hasHeader = title || actions;
  return (
    <Tag className={cn("rounded-lg border border-line bg-surface", className)}>
      {hasHeader && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(padded && "p-5", bodyClassName)}>{children}</div>
    </Tag>
  );
}
