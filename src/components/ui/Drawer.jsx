import { useEffect, useRef } from "react";
import { cn } from "../../lib/cn";

/** Side sheet built on native <dialog>. Used for mobile navigation. */
export function Drawer({ open, onClose, label, side = "left", className, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const offscreen = side === "left" ? "-translate-x-full" : "translate-x-full";

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className={cn(
        "fixed inset-y-0 m-0 h-dvh max-h-dvh w-[min(20rem,calc(100%-3rem))] max-w-none border-line bg-surface p-0 text-ink shadow-overlay",
        side === "left" ? "left-0 border-r" : "right-0 left-auto border-l",
        "transition-[translate,display,overlay] transition-discrete duration-200 ease-(--ease-out-quart)",
        offscreen,
        "open:translate-x-0",
        side === "left" ? "starting:open:-translate-x-full" : "starting:open:translate-x-full",
        className,
      )}
    >
      {children}
    </dialog>
  );
}
