import { useState } from "react";
import { ChartColumn, Table2 } from "lucide-react";
import { Button, Panel } from "../ui";

/**
 * Panel for a chart with a "Show as table" toggle, so every number is
 * readable without relying on color or hover.
 */
export function ChartPanel({ title, description, legend, chart, table, stretch = false, className }) {
  const [asTable, setAsTable] = useState(false);
  return (
    <Panel
      title={title}
      description={description}
      className={stretch ? `flex h-full flex-col ${className ?? ""}` : className}
      bodyClassName={stretch ? "flex flex-1 flex-col" : undefined}
      actions={
        <Button variant="ghost" size="sm" icon={asTable ? ChartColumn : Table2} onClick={() => setAsTable((v) => !v)} aria-pressed={asTable}>
          {asTable ? "Show chart" : "Show as table"}
        </Button>
      }
    >
      {asTable ? (
        table
      ) : (
        <>
          {legend}
          {chart}
        </>
      )}
    </Panel>
  );
}

export function ChartLegend({ series }) {
  return (
    <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Legend">
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-2 text-sm text-ink-muted">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden="true" />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

/** Tooltip card for Recharts. `rows` maps the hovered payload to [{ label, value, color? }]. */
export function ChartTooltip({ active, payload, label, rows }) {
  if (!active || !payload?.length) return null;
  const items = rows(payload, label);
  return (
    <div className="min-w-36 rounded-lg border border-line bg-surface px-3 py-2.5 shadow-raised">
      <p className="mb-1.5 text-xs font-medium text-ink-muted">{label}</p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 text-ink-muted">
              {item.color && <span className="size-2.5 rounded-sm" style={{ backgroundColor: item.color }} aria-hidden="true" />}
              {item.label}
            </span>
            <span className="font-semibold text-ink tabular-nums">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Simple accessible table for a chart's data. */
export function ChartTable({ caption, columns, rows }) {
  return (
    <div className="max-h-72 overflow-auto rounded-lg border border-line">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 bg-canvas text-ink-muted">
          <tr>
            {columns.map((c, i) => (
              <th key={c.key} scope="col" className={`h-10 px-4 text-xs font-medium ${i > 0 ? "text-right" : ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, r) => (
            <tr key={r}>
              {columns.map((c, i) =>
                i === 0 ? (
                  <th key={c.key} scope="row" className="h-10 px-4 font-normal text-ink">
                    {row[c.key]}
                  </th>
                ) : (
                  <td key={c.key} className="h-10 px-4 text-right text-ink tabular-nums">
                    {row[c.key]}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
