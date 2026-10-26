import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartPanel, ChartTable, ChartTooltip } from "./ChartPanel";
import { axisProps, chart } from "./chartTheme";

/**
 * Tasks completed per day (or per week for long ranges). The report's main chart: one series in
 * the brand hue, square bar ends on the baseline, no legend (the title names it).
 */
export function CompletedTrendChart({ series, total, days, className }) {
  const { buckets, unit } = series;
  const busiest = buckets.reduce((max, b) => (b.count > max.count ? b : max), buckets[0]);

  return (
    <ChartPanel
      className={className}
      title={`Tasks completed per ${unit}`}
      description={`${total} in the last ${days} days${busiest?.count ? ` · busiest ${unit}: ${busiest.label} (${busiest.count})` : ""}`}
      chart={
        <div className="h-56" role="img" aria-label={`Bar chart of tasks completed per ${unit}. ${total} in the last ${days} days.`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barCategoryGap={unit === "day" && days > 7 ? 2 : "30%"}>
              <CartesianGrid vertical={false} stroke={chart.grid} />
              <XAxis dataKey="short" {...axisProps} interval="preserveStartEnd" minTickGap={28} />
              <YAxis {...axisProps} axisLine={false} allowDecimals={false} width={48} />
              <Tooltip
                cursor={{ fill: chart.cursor }}
                content={<ChartTooltip rows={(p) => [{ label: "Completed", value: p[0].value }]} />}
                labelFormatter={(_, p) => p?.[0]?.payload.label}
              />
              <Bar dataKey="count" fill={chart.brand} radius={[3, 3, 0, 0]} maxBarSize={28} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      }
      table={
        <ChartTable
          caption={`Tasks completed per ${unit}`}
          columns={[
            { key: "label", label: unit === "day" ? "Day" : "Week" },
            { key: "count", label: "Completed" },
          ]}
          rows={[...buckets].reverse()}
        />
      }
    />
  );
}
