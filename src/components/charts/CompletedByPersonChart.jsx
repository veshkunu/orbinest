import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartPanel, ChartTable, ChartTooltip } from "./ChartPanel";
import { axisProps, chart } from "./chartTheme";

const MAX_PEOPLE = 5;

/** Tasks completed per person, highest first. Single series; values sit at the bar tips. */
export function CompletedByPersonChart({ people, days, stretch, className }) {
  const data = people.filter((p) => p.completed > 0).slice(0, MAX_PEOPLE);
  const hidden = people.filter((p) => p.completed > 0).length - data.length;
  const minHeight = Math.max(140, data.length * 44 + 32);

  return (
    <ChartPanel
      className={className}
      stretch={stretch}
      title="Completed by person"
      description={
        data.length
          ? `Top ${data.length} in the last ${days} days${hidden > 0 ? ` · ${hidden} more in the table below` : ""}`
          : `No tasks were completed in the last ${days} days`
      }
      chart={
        data.length ? (
          <div className="flex-1" style={{ minHeight }} role="img" aria-label={`Bar chart of tasks completed per person in the last ${days} days.`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, bottom: 0, left: 0 }} barCategoryGap="28%">
                <CartesianGrid horizontal={false} stroke={chart.grid} />
                <XAxis type="number" {...axisProps} allowDecimals={false} />
                <YAxis type="category" dataKey="name" {...axisProps} axisLine={false} width={120} tick={{ ...axisProps.tick, fill: chart.ink }} />
                <Tooltip
                  cursor={{ fill: chart.cursor }}
                  content={
                    <ChartTooltip
                      rows={(p) => [
                        { label: "Completed", value: p[0].payload.completed },
                        { label: "On time", value: p[0].payload.onTimeRate === null ? "—" : `${p[0].payload.onTimeRate}%` },
                      ]}
                    />
                  }
                />
                <Bar dataKey="completed" fill={chart.brand} radius={[0, 4, 4, 0]} maxBarSize={24} isAnimationActive={false}>
                  <LabelList dataKey="completed" position="right" offset={8} fill={chart.ink} fontSize={12} fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-ink-muted">Try a longer date range.</p>
        )
      }
      table={
        <ChartTable
          caption="Tasks completed per person"
          columns={[
            { key: "name", label: "Person" },
            { key: "completed", label: "Completed" },
          ]}
          rows={people.filter((p) => p.completed > 0)}
        />
      }
    />
  );
}
