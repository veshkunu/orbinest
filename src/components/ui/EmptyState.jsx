import { RotateCw } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./Button";

/**
 * Explains why a space is empty and what to do next.
 * Pass `page` when the empty state is the whole page (404, no access): its title becomes the h1.
 */
export function EmptyState({ icon: Icon, title, description, action, compact = false, page = false, className }) {
  const Heading = page ? "h1" : "h3";
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "px-4 py-8" : "px-6 py-14", className)}>
      {Icon && <Icon className="mb-3 size-6 text-ink-subtle" aria-hidden="true" />}
      <Heading className={page ? "text-xl font-bold text-ink" : "text-base font-semibold text-ink"}>{title}</Heading>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Error with a retry button for failed loads. */
export function ErrorState({ title = "Something went wrong", description = "We couldn't load this. Check your connection and try again.", onRetry, className }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center px-6 py-12 text-center", className)}>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
      {onRetry && (
        <Button variant="secondary" icon={RotateCw} onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  );
}
