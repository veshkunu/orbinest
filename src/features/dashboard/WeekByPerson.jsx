import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { Avatar } from "../../components/ui";

/** One hue, ramping with load: 1 task a pale tint, 2 a stronger tint, 3+ the full brand mark. */
function loadClass(count) {
  if (count >= 3) return "bg-brand-600 font-semibold text-white";
  if (count === 2) return "bg-brand-100 font-semibold text-brand-800";
  if (count === 1) return "bg-brand-50 text-brand-800";
  return "";
}

function Count({ value }) {
  // Empty cells stay plain; screen readers still hear the zero
  return value ? value : <span className="sr-only">0</span>;
}

/**
 * Who is carrying what over the next 7 days: people down the left, today onwards across,
 * tasks due in each cell, and the tasks each person is already behind on.
 */
export function WeekByPerson({ week, hiddenCount }) {
  const { days, rows, totals } = week;

  return (
    <>
      {/* Tablet and up: the grid */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Tasks due per person for each of the next 7 days, and tasks already overdue</caption>
          <thead>
            <tr className="border-b border-line text-xs text-ink-muted">
              <th scope="col" className="h-10 w-48 pl-5 text-left font-normal">
                Person
              </th>
              <th scope="col" className="h-10 w-20 px-1 text-center font-normal">
                Overdue
              </th>
              {days.map((d) => (
                <th
                  key={d.key}
                  scope="col"
                  aria-current={d.isToday ? "date" : undefined}
                  className={cn("h-10 px-1 text-center font-normal", d.isToday && "font-semibold text-ink")}
                >
                  <span className="block leading-tight">{d.weekday}</span>
                  <span className={cn("block tabular-nums", d.isToday && "text-brand-700")}>{d.date}</span>
                </th>
              ))}
              <th scope="col" className="h-10 w-24 pr-5 text-right font-normal">
                Next 7 days
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row" className="h-12 pl-5 text-left font-normal">
                  <Link to={`/tasks?assignee=${r.id}`} className="flex min-w-0 items-center gap-2.5 hover:[&_.name]:text-brand-700">
                    <Avatar person={r.person} size="sm" className="size-7 text-[11px]" />
                    <span className="min-w-0">
                      <span className="name block truncate font-medium text-ink transition-colors">{r.name}</span>
                      {r.onLeave && <span className="block text-xs text-ink-muted">On leave</span>}
                    </span>
                  </Link>
                </th>
                <td className="h-12 px-1 text-center">
                  <span
                    className={cn(
                      "inline-grid h-8 min-w-8 place-items-center rounded-md px-1.5 tabular-nums",
                      r.overdue ? "bg-danger-soft font-semibold text-danger-ink" : "",
                    )}
                  >
                    <Count value={r.overdue} />
                  </span>
                </td>
                {r.perDay.map((count, i) => (
                  <td key={days[i].key} className={cn("h-12 px-1 text-center", days[i].isWeekend && "bg-sunken/60")}>
                    <span className={cn("inline-grid h-8 min-w-8 place-items-center rounded-md px-1.5 tabular-nums", loadClass(count))}>
                      <Count value={count} />
                    </span>
                  </td>
                ))}
                <td className="h-12 pr-5 text-right font-medium text-ink tabular-nums">{r.thisWeek}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line text-ink">
              <th scope="row" className="h-11 pl-5 text-left font-semibold">
                Whole team
              </th>
              <td className={cn("h-11 px-1 text-center font-semibold tabular-nums", totals.overdue && "text-danger-ink")}>{totals.overdue}</td>
              {totals.perDay.map((count, i) => (
                <td key={days[i].key} className={cn("h-11 px-1 text-center font-semibold tabular-nums", days[i].isWeekend && "bg-sunken/60")}>
                  {count}
                </td>
              ))}
              <td className="h-11 pr-5 text-right font-semibold tabular-nums">{totals.thisWeek}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Phone: one line per person */}
      <ul className="divide-y divide-rule md:hidden">
        {rows.map((r) => (
          <li key={r.id}>
            <Link to={`/tasks?assignee=${r.id}`} className="flex items-center gap-3 px-4 py-3">
              <Avatar person={r.person} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink">{r.name}</span>
                <span className="block text-sm text-ink-muted">
                  {r.thisWeek} due in the next 7 days{r.onLeave ? " · On leave" : ""}
                </span>
              </span>
              {r.overdue > 0 && <span className="text-sm font-semibold whitespace-nowrap text-danger-ink tabular-nums">{r.overdue} overdue</span>}
            </Link>
          </li>
        ))}
      </ul>

      {hiddenCount > 0 && (
        <p className="border-t border-line px-5 py-3 text-sm text-ink-muted">
          {hiddenCount} more {hiddenCount === 1 ? "person has" : "people have"} lighter weeks.{" "}
          <Link to="/tasks" className="font-medium text-brand-700 hover:underline">
            See all tasks
          </Link>
        </p>
      )}
    </>
  );
}
