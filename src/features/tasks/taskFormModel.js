import { daysUntil, toDateInput } from "../../lib/format";

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const FIELD_ORDER = ["title", "assigneeId", "dueDate"];

/** Default due date for a new task: two working days out. */
function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  if (d.getDay() === 6) d.setDate(d.getDate() + 2);
  if (d.getDay() === 0) d.setDate(d.getDate() + 1);
  return toDateInput(d);
}

export function toFormValues(task, { assigneeId = "" } = {}) {
  if (!task) return { title: "", description: "", assigneeId, priority: "medium", dueDate: defaultDueDate() };
  return {
    title: task.title,
    description: task.description,
    assigneeId: task.assigneeId,
    priority: task.priority,
    dueDate: toDateInput(task.dueDate),
  };
}

/** `isNew` blocks past due dates on new tasks; existing tasks may already be overdue. */
export function validate(v, { isNew }) {
  const errors = {};
  if (!v.title.trim()) errors.title = "Give the task a short title, like “Call supplier about delivery”.";
  else if (v.title.trim().length > 120) errors.title = "Keep the title under 120 characters. Put details in the description.";
  if (!v.assigneeId) errors.assigneeId = "Choose who should do this task.";
  if (!v.dueDate) errors.dueDate = "Choose a due date.";
  else if (isNew && daysUntil(`${v.dueDate}T12:00:00`) < 0) errors.dueDate = "Choose today or a later date.";
  return errors;
}
