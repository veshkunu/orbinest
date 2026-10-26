import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { Popover } from "./Popover";

/** Move focus between menu items with the arrow keys. */
function onMenuKeyDown(e) {
  const items = [...e.currentTarget.querySelectorAll('[role="menuitem"]')];
  const index = items.indexOf(document.activeElement);
  const move = { ArrowDown: 1, ArrowUp: -1 }[e.key];
  if (move) {
    e.preventDefault();
    items[(index + move + items.length) % items.length]?.focus();
  } else if (e.key === "Home" || e.key === "End") {
    e.preventDefault();
    items[e.key === "Home" ? 0 : items.length - 1]?.focus();
  }
}

/** Menu body; moves focus to the first item when it opens (ARIA menu pattern). */
function MenuPanel({ children }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.querySelector('[role="menuitem"]')?.focus();
  }, []);
  return (
    <div ref={ref} onKeyDown={onMenuKeyDown}>
      {children}
    </div>
  );
}

/**
 * Dropdown of actions. `items` is a list of
 * { label, icon, to?, onSelect?, tone?: "danger" } or { divider: true }.
 */
export function Menu({ trigger, items, header, align = "end", label }) {
  return (
    <Popover trigger={trigger} align={align} role="menu" label={label} className="py-1.5">
      {(close) => (
        <MenuPanel>
          {header && <div className="border-b border-line px-4 pt-2 pb-3">{header}</div>}
          <div className={cn(header && "pt-1.5")}>
            {items.map((item, i) => {
              if (item.divider) return <div key={`divider-${i}`} role="separator" className="my-1.5 border-t border-line" />;
              const Icon = item.icon;
              const classes = cn(
                "mx-1.5 flex h-10 w-[calc(100%-0.75rem)] pointer-coarse:h-11 items-center gap-3 rounded-lg px-2.5 text-left text-sm font-medium transition-colors",
                "hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-none",
                item.tone === "danger" ? "text-danger-ink" : "text-ink",
              );
              const content = (
                <>
                  {Icon && <Icon className="size-4 shrink-0 opacity-80" aria-hidden="true" />}
                  {item.label}
                </>
              );
              return item.to ? (
                <Link key={item.label} to={item.to} role="menuitem" className={classes} onClick={() => close()}>
                  {content}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className={classes}
                  onClick={() => {
                    close();
                    item.onSelect?.();
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </MenuPanel>
      )}
    </Popover>
  );
}
