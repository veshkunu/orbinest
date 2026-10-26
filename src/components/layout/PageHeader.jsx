import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

/** "‹ Employees" link above a detail page title. */
export function BackLink({ to, label }) {
  return (
    <Link
      to={to}
      className="-ml-1 mb-2 inline-flex h-8 items-center pointer-coarse:h-11 gap-1 rounded-md pr-2 pl-1 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
    >
      <ChevronLeft className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
}

/** Title row at the top of every page. `back` is { to, label } for detail pages. */
export function PageHeader({ title, description, actions, back, documentTitle }) {
  useDocumentTitle(documentTitle ?? title);
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && <BackLink {...back} />}
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[2rem] sm:leading-10">{title}</h1>
        {description && <p className="mt-1 text-base text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
