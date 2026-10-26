/*
  Chart colors as hex — Recharts writes them into SVG attributes, where CSS
  variables aren't reliable. Neutrals mirror the tokens in index.css.
  Series colors were checked with the dataviz palette validator (light mode):
  lightness band, chroma floor, CVD and normal-vision separation all pass.
  Status series (on time / late / not done) carry meaning, not identity; amber
  sits under 3:1 against white, so the chart ships a legend, tooltips and a table view.
*/
export const chart = {
  surface: "#ffffff",
  grid: "#e5e7eb", // --color-line
  axis: "#5f6672", // --color-ink-muted
  ink: "#111827", // --color-ink
  cursor: "#f3f4f6", // --color-sunken
  brand: "#b8336a", // --color-brand-600
};

export const axisProps = {
  stroke: chart.grid,
  tickLine: false,
  tick: { fill: chart.axis, fontSize: 12 },
};

/** What happened to work that was due in a report period. Validated together (light mode). */
export const OUTCOME_SERIES = [
  { key: "on_time", label: "Done on time", color: "#1baf7a" },
  { key: "late", label: "Done late", color: "#eda100" },
  { key: "not_done", label: "Not done", color: "#e34948" },
];
