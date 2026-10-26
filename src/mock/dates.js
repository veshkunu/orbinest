/** ISO string for a day offset from today, at the given local hour. */
export function daysFromToday(offset, hour = 9) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/** ISO string for a moment some hours before now. */
export function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}
