import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { Spinner } from "./Spinner";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-colors duration-150 select-none " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-sunken active:bg-line",
  ghost: "text-ink-muted hover:bg-sunken hover:text-ink active:bg-line",
  danger: "bg-danger-ink text-white hover:bg-danger-strong active:bg-danger-strong",
};

const sizes = {
  sm: "h-9 px-3 text-sm pointer-coarse:h-11",
  md: "h-10 px-4 text-sm pointer-coarse:h-11",
  lg: "h-12 px-5 text-base",
};

const iconSizes = { sm: "size-4", md: "size-4", lg: "size-5" };

/**
 * Pass `to` to render a router link styled as a button.
 * `icon` is a Lucide component shown before the label.
 */
export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  fullWidth = false,
  to,
  className,
  children,
  disabled,
  type = "button",
  ...props
}) {
  const classes = cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
  const content = (
    <>
      {loading ? <Spinner className={iconSizes[size]} /> : Icon && <Icon className={iconSizes[size]} aria-hidden="true" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
