import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./Button";

/**
 * Native <dialog> — focus trap, Escape and backdrop come from the browser.
 * Reserve for confirmations; prefer inline UI or full pages for forms.
 */
export function Dialog({ open, onClose, title, description, children, footer, className }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby={titleId}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border border-line bg-surface p-0 text-ink shadow-overlay",
        "opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-200 ease-(--ease-out-quart) translate-y-2",
        "open:translate-y-0 open:opacity-100 starting:open:translate-y-2 starting:open:opacity-0",
        className,
      )}
    >
      {open && (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mt-1 -mr-2 grid size-9 shrink-0 pointer-coarse:size-11 place-items-center rounded-lg text-ink-muted hover:bg-sunken hover:text-ink"
            >
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          {children && <div className="mt-4">{children}</div>}
          {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
