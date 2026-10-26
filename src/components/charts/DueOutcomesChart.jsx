import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartLegend, ChartPanel, ChartTable, ChartTooltip } from "./ChartPanel";
import { OUTCOME_SERIES, axisProps, chart } from "./chartTheme";

/** For tasks due in the period: on time, late or not done — stacked per department. */
export function DueOutcomesChart({ data, days, stretch, className }) {
  const minHeight = Math.max(140, data.length * 44 + 32);
  const totals = data.reduce(
    (acc, d) => ({ due: acc.due + d.total, notDone: acc.notDone + d.not_done }),
    { due: 0, notDone: 0 },
  );

  return (
    <ChartPanel
      className={className}
      stretch={stretch}
      title="Due work by department"
      description={
        totals.due
          ? `${totals.due} tasks were due in the last ${days} days · ${totals.notDone} not done yet`
          : `Nothing was due in the last ${days} days`
      }
      legend={totals.due ? <ChartLegend series={OUTCOME_SERIES} /> : null}
      chart={
        totals.due ? (
          <div className="flex-1" style={{ minHeight }} role="img" aria-label="Stacked bar chart of due tasks per department: done on time, done late, not done.">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
                <CartesianGrid horizontal={false} stroke={chart.grid} />
                <XAxis type="number" {...axisProps} allowDecimals={false} />
                <YAxis type="category" dataKey="name" {...axisProps} axisLine={false} width={124} tick={{ ...axisProps.tick, fill: chart.ink }} />
                <Tooltip
                  cursor={{ fill: chart.cursor }}
                  content={
                    <ChartTooltip
                      rows={(p) => [
                        ...OUTCOME_SERIES.map((s) => ({ label: s.label, value: p[0].payload[s.key], color: s.color })),
                        { label: "Total due", value: p[0].payload.total },
                      ]}
                    />
                  }
                />
                {OUTCOME_SERIES.map((s, i) => (
                  <Bar
                    key={s.key}
                    dataKey={s.key}
                    name={s.label}
                    stackId="due"
                    fill={s.color}
                    stroke={chart.surface}
                    strokeWidth={2}
                    radius={i === OUTCOME_SERIES.length - 1 ? [0, 4, 4, 0] : 0}
                    maxBarSize={24}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-ink-muted">Try a longer date range.</p>
        )
      }
      table={
        <ChartTable
          caption="Due tasks by department and outcome"
          columns={[{ key: "name", label: "Department" }, ...OUTCOME_SERIES.map((s) => ({ key: s.key, label: s.label })), { key: "total", label: "Total" }]}
          rows={data}
        />
      }
    />
  );
}
