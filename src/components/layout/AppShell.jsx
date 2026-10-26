import { useEffect, useRef, useState } from "react";
import { Link, Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { Menu as MenuIcon, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { ROLE_LABELS } from "../../lib/constants";
import { fullName } from "../../lib/format";
import { getWorkspace } from "../../services/employeeService";
import { Logo, LogoMark } from "../brand/Logo";
import { Avatar, Drawer, IconButton } from "../ui";
import { NotificationBell } from "./NotificationBell";
import { SidebarNav } from "./SidebarNav";
import { TopBarSearch } from "./TopBarSearch";
import { UserMenu } from "./UserMenu";

/**
 * Ruled T-frame: sidebar and top bar share the page ground, divided only by 1px rules.
 *  < md   56px top bar + navigation drawer
 *  md–lg  72px icon rail
 *  ≥ lg   230px labelled sidebar
 */
export function AppShell() {
  const { user } = useAuth();
  const unread = useUnreadCount();
  const workspace = getWorkspace();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const firstRender = useRef(true);

  // After navigating, move focus to the new page so screen readers announce it.
  // Skip when the page already focused something itself (e.g. an autofocus field).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const main = mainRef.current;
    if (main && !main.contains(document.activeElement)) main.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="min-h-dvh md:pl-[72px] lg:pl-[230px]">
      <a
        href="#main"
        className="sr-only z-(--z-tooltip) rounded-md bg-surface px-4 py-2 font-medium text-brand-700 shadow-raised focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      {/* Sidebar — tablet rail and desktop labelled column, on the page ground */}
      <aside className="fixed inset-y-0 left-0 hidden w-[72px] flex-col border-r border-line bg-canvas md:flex lg:w-[230px]">
        <div className="flex h-16 shrink-0 items-center border-b border-line px-4 lg:px-5">
          <Link to="/dashboard" aria-label="Orbinest home" className="rounded-md">
            <span className="lg:hidden">
              <LogoMark />
            </span>
            <span className="hidden lg:block">
              <Logo />
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="lg:hidden">
            <SidebarNav role={user.role} compact unreadCount={unread} />
          </div>
          <div className="hidden lg:block">
            <SidebarNav role={user.role} unreadCount={unread} />
          </div>
        </div>
        <p className="hidden px-5 py-4 text-xs text-ink-muted lg:block">Demo mode: data stays in this browser.</p>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-(--z-sticky) flex h-14 items-center gap-2 border-b border-line bg-canvas px-2 sm:px-4 md:h-16 lg:px-8">
        <IconButton icon={MenuIcon} label="Open menu" onClick={() => setDrawerOpen(true)} className="md:hidden" />
        <Link to="/dashboard" aria-label="Orbinest home" className="rounded-md md:hidden">
          <Logo />
        </Link>
        <TopBarSearch className="hidden md:block" />
        <div className="ml-auto flex h-full items-center gap-1 sm:gap-2">
          <NotificationBell />
          <div className="hidden h-full items-center gap-3 border-l border-line pl-4 lg:flex">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-ink">{workspace.name}</p>
              <p className="text-xs text-ink-muted">{workspace.city}</p>
            </div>
          </div>
          <UserMenu />
        </div>
      </header>

      <main ref={mainRef} id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-6 outline-none sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
      <ScrollRestoration />

      {/* Mobile navigation */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} label="Navigation" className="md:hidden">
        <div className="flex h-full flex-col">
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pr-2 pl-4">
            <Logo />
            <IconButton icon={X} label="Close menu" onClick={() => setDrawerOpen(false)} />
          </div>
          <div className="border-b border-line px-4 py-3">
            <TopBarSearch onSearch={() => setDrawerOpen(false)} />
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav role={user.role} unreadCount={unread} onNavigate={() => setDrawerOpen(false)} />
          </div>
          <div className="flex items-center gap-3 border-t border-line px-4 py-4">
            <Avatar person={user} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{fullName(user)}</p>
              <p className="text-xs text-ink-muted">
                {ROLE_LABELS[user.role]} · {workspace.name}
              </p>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
