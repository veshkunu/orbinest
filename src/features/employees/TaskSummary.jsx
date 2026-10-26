import { isOverdue, isWithinLastDays } from "../../lib/format";
import { KpiStrip } from "../../components/ui";

/** One person's task numbers: open now, overdue now, finished in the last 30 days. */
export function TaskSummary({ tasks, loading }) {
  const open = tasks.filter((t) => t.status !== "done");
  const overdue = open.filter((t) => isOverdue(t));
  const doneRecently = tasks.filter((t) => isWithinLastDays(t.completedAt, 30));
  return (
    <KpiStrip
      loading={loading}
      items={[
        { label: "Open tasks", value: open.length },
        { label: "Overdue", value: overdue.length, alert: overdue.length > 0 },
        { label: "Done in the last 30 days", value: doneRecently.length },
      ]}
    />
  );
}
