import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/cn";
import { controlClasses } from "../ui/Field";

/** Search box in the top bar: Enter opens the task list filtered by the words typed. */
export function TopBarSearch({ className, onSearch }) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const id = useId();
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/tasks?q=${encodeURIComponent(q)}` : "/tasks");
    setQuery("");
    onSearch?.();
  };

  const label = isAdmin ? "Search all tasks" : "Search my tasks";

  return (
    <form role="search" onSubmit={handleSubmit} className={cn("relative w-full md:w-80", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`${label}…`}
        className={cn(controlClasses, "h-9 pl-9 pointer-coarse:h-11 [&::-webkit-search-cancel-button]:hidden")}
      />
    </form>
  );
}
