import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "../../lib/cn";

/**
 * Click-to-open floating panel anchored to a trigger.
 * Closes on outside click, Escape (returning focus to the trigger) and route links inside.
 *
 * `trigger` is a render function: ({ open, toggle, props }) => element; spread `props` on the button.
 * `children` can be a node or a render function receiving `close`.
 */
export function Popover({ trigger, children, align = "end", className, role = "dialog", label }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e) => {
      if (!rootRef.current?.contains(e.target)) close();
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close(true);
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className="relative">
      {trigger({
        open,
        toggle: () => setOpen((o) => !o),
        props: {
          ref: triggerRef,
          onClick: () => setOpen((o) => !o),
          "aria-expanded": open,
          "aria-haspopup": role === "menu" ? "menu" : "dialog",
          "aria-controls": open ? panelId : undefined,
        },
      })}
      {open && (
        <div
          id={panelId}
          role={role}
          aria-label={label}
          className={cn(
            "absolute top-full z-(--z-dropdown) mt-2 min-w-56 origin-top animate-toast-in rounded-lg border border-line bg-surface shadow-raised",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {/* `close` only reads the trigger ref when called from an event handler */}
          {/* oxlint-disable-next-line react/refs */}
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
}
