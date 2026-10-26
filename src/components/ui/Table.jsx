import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "../../lib/cn";

/** Plain data table. Rows stay readable at 14px; wrap in a Panel with padded={false}. */
export function Table({ label, className, children }) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table aria-label={label} className="w-full border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }) {
  return (
    <thead className="border-b border-line text-ink-muted">
      <tr>{children}</tr>
    </thead>
  );
}

/**
 * Column header. Pass `sort` ("asc" | "desc" | null) and `onSort` to make it sortable;
 * leave `sort` undefined for a static column.
 */
export function Th({ children, sort, onSort, align = "left", className }) {
  const sortable = sort !== undefined;
  const ariaSort = sort === "asc" ? "ascending" : sort === "desc" ? "descending" : sortable ? "none" : undefined;
  const Icon = sort === "asc" ? ArrowUp : sort === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={cn("h-10 px-4 text-xs font-normal whitespace-nowrap first:pl-5 last:pr-5", align === "right" && "text-right", className)}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            "-mx-1.5 inline-flex h-8 items-center gap-1 pointer-coarse:h-11 rounded-md px-1.5 transition-colors hover:bg-sunken hover:text-ink",
            sort && "text-ink",
          )}
        >
          {children}
          <Icon className={cn("size-3.5", !sort && "opacity-50")} aria-hidden="true" />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function TBody({ children }) {
  return <tbody className="divide-y divide-rule">{children}</tbody>;
}

/** Row. With `onClick` the whole row is clickable; still put a real link in the first cell for keyboard users. */
export function Tr({ onClick, className, children }) {
  return (
    <tr
      onClick={onClick}
      className={cn("transition-colors duration-150", onClick && "cursor-pointer hover:bg-canvas", className)}
    >
      {children}
    </tr>
  );
}

export function Td({ children, align = "left", className }) {
  return (
    <td className={cn("h-14 px-4 align-middle first:pl-5 last:pr-5", align === "right" && "text-right", className)}>
      {children}
    </td>
  );
}
