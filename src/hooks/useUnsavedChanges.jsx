import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";
import { ConfirmDialog } from "../components/ui";

/**
 * Ask before leaving a form with unsaved edits (in-app navigation and tab close).
 * Call `setDirty(false)` before navigating away after a successful save.
 */
export function useUnsavedChanges() {
  const dirtyRef = useRef(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirtyRef.current && currentLocation.pathname !== nextLocation.pathname);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (dirtyRef.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const setDirty = useCallback((dirty) => {
    dirtyRef.current = dirty;
  }, []);

  const dialog = (
    <ConfirmDialog
      open={blocker.state === "blocked"}
      onClose={() => blocker.reset?.()}
      onConfirm={() => blocker.proceed?.()}
      title="Leave without saving?"
      description="Your changes on this page haven't been saved and will be lost."
      confirmLabel="Leave page"
      cancelLabel="Keep editing"
    />
  );

  return { setDirty, dialog };
}
