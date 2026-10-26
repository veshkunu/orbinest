import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";
import { NAV_ITEMS } from "../../lib/constants";

/**
 * Main navigation list.
 * `compact` renders the icon rail (tablet) with labels shown as tooltips.
 */
export function SidebarNav({ role, compact = false, unreadCount = 0, onNavigate }) {
  const items = NAV_ITEMS[role] ?? [];

  return (
    <nav aria-label="Main">
      <ul className="flex flex-col gap-0.5">
        {items.map(({ to, label, icon: Icon }) => {
          const showCount = to === "/notifications" && unreadCount > 0;
          return (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "group relative flex h-10 items-center gap-3 rounded-md text-sm font-medium transition-colors duration-150 pointer-coarse:h-11",
                    compact ? "justify-center px-0" : "px-3",
                    isActive ? "bg-brand-50 text-brand-800" : "text-ink-muted hover:bg-sunken hover:text-ink",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn("size-5 shrink-0", isActive ? "text-brand-600" : "")} aria-hidden="true" />
                    <span className={cn(compact && "sr-only")}>{label}</span>
                    {showCount && !compact && (
                      <span className="ml-auto min-w-6 rounded-full bg-brand-600 px-1.5 py-0.5 text-center text-xs font-semibold text-white tabular-nums">
                        {unreadCount > 99 ? "99+" : unreadCount}
                        <span className="sr-only"> unread</span>
                      </span>
                    )}
                    {showCount && compact && (
                      <span className="absolute top-2 right-3 size-2 rounded-full bg-brand-600 ring-2 ring-canvas" aria-hidden="true" />
                    )}
                    {compact && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-full z-(--z-tooltip) ml-3 rounded-md bg-ink px-2 py-1 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-raised transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                      >
                        {label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
