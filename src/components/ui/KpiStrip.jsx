import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "../../lib/cn";
import { Skeleton } from "./Skeleton";

const COLUMNS = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5" };

/**
 * Headline numbers in one container split by 1px dividers: label over value, no icons.
 * Each item: { label, value, caption?, to?, alert?, delta? }.
 *  - `alert` sets the value in the negative colour (use it only when something needs action).
 *  - `delta` is { change, label, upIsGood = true }; colour says good or bad, zero is grey.
 *    Pass upIsGood: null for a change that is neither good nor bad (it stays grey).
 * Phones get a 2-column grid; an odd last cell spans the row.
 */
export function KpiStrip({ items, loading = false, className }) {
  const odd = items.length % 2 === 1;
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line",
        COLUMNS[items.length],
        className,
      )}
    >
      {items.map((item, i) => {
        const Tag = item.to ? Link : "div";
        return (
          <Tag
            key={item.label}
            to={item.to}
            className={cn(
              "flex min-w-0 flex-col gap-1 bg-surface px-5 py-4",
              odd && i === items.length - 1 && "col-span-2 lg:col-span-1",
              item.to && "transition-colors duration-150 hover:bg-canvas",
            )}
          >
            <span className="text-sm text-ink-muted">{item.label}</span>
            {loading ? (
              <Skeleton className="my-0.5 h-7 w-14" />
            ) : (
              <span className={cn("text-2xl font-semibold tracking-tight tabular-nums", item.alert ? "text-danger-ink" : "text-ink")}>
                {item.value}
              </span>
            )}
            {item.delta && !loading && <Delta {...item.delta} />}
            {item.caption && <span className="text-xs text-ink-muted">{item.caption}</span>}
          </Tag>
        );
      })}
    </div>
  );
}

function Delta({ change, label, upIsGood = true }) {
  const direction = change > 0 ? "up" : change < 0 ? "down" : "flat";
  const quality = direction === "flat" || upIsGood === null ? "neutral" : (direction === "up") === upIsGood ? "good" : "bad";
  const Icon = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus }[direction];
  const text = direction === "flat" ? "No change" : `${change > 0 ? "+" : "−"}${Math.abs(change)}`;
  const tone = { good: "text-success-solid", bad: "text-danger-ink", neutral: "text-ink-muted" }[quality];
  return (
    <span className="flex items-center gap-1 text-xs">
      <span className={cn("inline-flex items-center gap-0.5 font-medium tabular-nums", tone)}>
        <Icon className="size-3.5" aria-hidden="true" />
        {text}
      </span>
      <span className="text-ink-muted">{label}</span>
    </span>
  );
}
