import { cn } from "../../lib/cn";

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="8" className="fill-brand-600" />
      <ellipse
        cx="16"
        cy="16"
        rx="10.5"
        ry="5.5"
        transform="rotate(-24 16 16)"
        stroke="white"
        strokeOpacity=".55"
        strokeWidth="2"
      />
      <circle cx="16" cy="16" r="4.25" fill="white" />
      <circle cx="24.6" cy="11.2" r="2" fill="white" />
    </svg>
  );
}

export function Logo({ className, hideWordmark = false }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className={cn("text-lg font-semibold tracking-tight text-ink", hideWordmark && "sr-only")}>Orbinest</span>
    </span>
  );
}
