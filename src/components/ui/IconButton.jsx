import { cn } from "../../lib/cn";

/** Square icon-only button. `label` is required — it becomes the accessible name. */
export function IconButton({ icon: Icon, label, className, badge, type = "button", ...props }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "relative grid size-11 shrink-0 place-items-center rounded-md text-ink-muted transition-colors duration-150",
        "hover:bg-sunken hover:text-ink active:bg-line disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <Icon className="size-5" aria-hidden="true" />
      {badge}
    </button>
  );
}
