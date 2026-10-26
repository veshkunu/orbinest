import { useMemo, useRef, useState } from "react";
import { useDepartments } from "../../hooks/useDepartments";
import { useEmployeeLookup } from "../../hooks/useEmployeeLookup";
import { fromDateInput, fullName, toDateInput } from "../../lib/format";
import { Button, Input, Panel, RadioGroup, Select, Textarea } from "../../components/ui";
import { FIELD_ORDER, PRIORITY_OPTIONS, validate } from "./taskFormModel";

/** Create / edit task. Submits { title, description, assigneeId, priority, dueDate (ISO) }. */
export function TaskForm({ initialValues, isNew, submitLabel, onSubmit, onCancel, onDirtyChange }) {
  const { employees, byId } = useEmployeeLookup();
  const { departmentName } = useDepartments();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [today] = useState(() => toDateInput(new Date()));
  const formRef = useRef(null);

  // Active people first, sorted by name; keep the current assignee even if since deactivated
  const assigneeOptions = useMemo(
    () =>
      employees
        .filter((e) => e.status !== "inactive" || e.id === initialValues.assigneeId)
        .sort((a, b) => fullName(a).localeCompare(fullName(b)))
        .map((e) => ({
          value: e.id,
          label: `${fullName(e)} (${departmentName(e.departmentId)}${e.status === "on_leave" ? ", on leave" : ""})`,
        })),
    [employees, departmentName, initialValues.assigneeId],
  );

  const set = (field, value) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: undefined }));
    onDirtyChange?.(true);
  };
  const bind = (field) => ({ name: field, value: values[field], onChange: (e) => set(field, e.target.value), error: errors[field] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values, { isNew });
    setErrors(found);
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) {
      formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ ...values, dueDate: fromDateInput(values.dueDate) });
    } finally {
      setSaving(false);
    }
  };

  const assignee = byId(values.assigneeId);
  const assigneeHint =
    assignee?.status === "on_leave" ? `${assignee.firstName} is on leave right now. They'll see this when they're back.` : "They'll get a notification.";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <Panel title="What needs doing?">
        <div className="flex flex-col gap-5">
          <Input label="Title" required autoFocus={isNew} maxLength={140} {...bind("title")} />
          <Textarea
            label="Details"
            hint="Optional. Add anything that helps, like who to call or where to find files."
            rows={5}
            {...bind("description")}
          />
        </div>
      </Panel>

      <Panel title="Who and when">
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Assign to"
            required
            placeholder="Choose a person"
            options={assigneeOptions}
            hint={values.assigneeId ? assigneeHint : undefined}
            className="sm:col-span-2"
            {...bind("assigneeId")}
          />
          <Input label="Due date" type="date" required min={isNew ? today : undefined} {...bind("dueDate")} />
          <RadioGroup
            label="Priority"
            name="priority"
            columns={3}
            value={values.priority}
            onChange={(p) => set("priority", p)}
            options={PRIORITY_OPTIONS}
            className="sm:col-span-2"
          />
        </div>
      </Panel>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
