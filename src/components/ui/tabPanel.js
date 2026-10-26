const tabId = (id, value) => `${id}-tab-${value || "all"}`;

/** Props for a tab's button. */
export function tabProps(id, value) {
  return { id: tabId(id, value), "aria-controls": `${id}-panel` };
}

/** Spread on the region a Tabs bar controls, so screen readers link the two. */
export function tabPanelProps(id, value) {
  return { id: `${id}-panel`, role: "tabpanel", "aria-labelledby": tabId(id, value) };
}
