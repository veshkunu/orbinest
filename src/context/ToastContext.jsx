import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "../lib/cn";

const ToastContext = createContext(null);

const TONES = {
  success: { icon: CircleCheck, className: "text-success-ink" },
  error: { icon: CircleAlert, className: "text-danger-ink" },
  info: { icon: Info, className: "text-brand-700" },
};

let nextId = 0;

/** One toast. Its timer pauses while hovered or focused so actions like Undo stay reachable (WCAG 2.2.1). */
function Toast({ toast, onDismiss }) {
  const { message, tone, action, duration } = toast;
  const { icon: Icon, className } = TONES[tone] ?? TONES.info;
  const remaining = useRef(duration);
  const startedAt = useRef(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    startedAt.current = Date.now();
    const timer = setTimeout(onDismiss, remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, onDismiss]);

  const pause = () => setPaused(true);
  const resume = (e) => {
    // Stay paused while focus moves between the toast's own buttons
    if (e?.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
    setPaused(false);
  };

  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-lg border border-line bg-surface py-3 pr-2 pl-4 shadow-overlay"
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", className)} aria-hidden="true" />
      <p className="flex-1 py-0.5 text-sm font-medium text-ink">{message}</p>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick();
            onDismiss();
          }}
          className="h-8 shrink-0 rounded-lg px-2.5 text-sm font-semibold text-brand-700 transition-colors pointer-coarse:h-11 hover:bg-brand-50"
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        onClick={onDismiss}
        className="grid size-8 shrink-0 place-items-center rounded-lg text-ink-muted transition-colors pointer-coarse:size-11 hover:bg-sunken hover:text-ink"
      >
        <X className="size-4" aria-hidden="true" />
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    /** `action` is an optional { label, onClick } button, e.g. Undo. */
    (message, { tone = "success", duration, action } = {}) => {
      nextId += 1;
      const id = nextId;
      const item = { id, message, tone, action, duration: duration ?? (action ? 6000 : 4000) };
      setToasts((list) => [...list.slice(-2), item]);
    },
    [],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-(--z-toast) flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((t) => (
          <ToastSlot key={t.id} toast={t} dismiss={dismiss} />
        ))}
      </div>
    </ToastContext>
  );
}

/** Keeps a stable onDismiss per toast so its timer effect doesn't restart on every render. */
function ToastSlot({ toast, dismiss }) {
  const onDismiss = useCallback(() => dismiss(toast.id), [dismiss, toast.id]);
  return <Toast toast={toast} onDismiss={onDismiss} />;
}

// eslint-disable-next-line react/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
