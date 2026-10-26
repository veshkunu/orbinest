import { cn } from "../../lib/cn";

export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn("rounded-md bg-sunken", className)} />;
}

/** Placeholder rows for lists while data loads. */
export function SkeletonList({ rows = 4, label = "Loading" }) {
  return (
    <div role="status" aria-label={label} className="divide-y divide-line">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
