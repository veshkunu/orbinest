import { useId } from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { controlClasses } from "./Field";

export function SearchInput({ value, onChange, label = "Search", placeholder = "Search", className }) {
  const id = useId();
  return (
    <div className={cn("relative", className)}>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(controlClasses, "h-10 pr-10 pl-9 pointer-coarse:h-11 [&::-webkit-search-cancel-button]:hidden")}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-md text-ink-muted pointer-coarse:size-10 hover:bg-sunken hover:text-ink"
        >
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Clear search</span>
        </button>
      )}
    </div>
  );
}
