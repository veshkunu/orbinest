import { useEffect } from "react";

/** Sets the browser tab title to "<title> · Orbinest" so each page is identifiable (WCAG 2.4.2). */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (typeof title === "string" && title) document.title = `${title} · Orbinest`;
  }, [title]);
}
