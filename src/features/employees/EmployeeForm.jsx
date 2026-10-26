import { useRef, useState } from "react";
import { useDepartments } from "../../hooks/useDepartments";
import { Button, Input, Panel, RadioGroup, Select } from "../../components/ui";
import { FIELD_ORDER, ROLE_OPTIONS, validate } from "./employeeFormModel";

/**
 * Add / edit employee. `onSubmit(values)` may throw a ValidationError with `fieldErrors`
 * (e.g. duplicate email) which is shown on the matching field.
 */
export function EmployeeForm({ initialValues, submitLabel, onSubmit, onCancel, onDirtyChange }) {
  const { departments } = useDepartments();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  const set = (field, value) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: undefined }));
    onDirtyChange?.(true);
  };
  const bind = (field) => ({ name: field, value: values[field], onChange: (e) => set(field, e.target.value), error: errors[field] });

  const focusFirstError = (found) => {
    const first = FIELD_ORDER.find((f) => found[f]);
    if (first) formRef.current?.querySelector(`[name="${first}"]`)?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return focusFirstError(found);

    setSaving(true);
    try {
      await onSubmit({ ...values, joinedAt: new Date(`${values.joinedAt}T09:00:00`).toISOString() });
    } catch (error) {
      if (error.fieldErrors) {
        setErrors(error.fieldErrors);
        focusFirstError(error.fieldErrors);
      } else {
        throw error;
      }
    } finally {
      setSaving(false);
    }
  };

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {errorCount > 0 && (
        <p role="alert" className="rounded-lg border border-danger-line bg-danger-soft px-4 py-3 text-sm font-medium text-danger-ink">
          {errorCount === 1 ? "One field needs fixing" : `${errorCount} fields need fixing`} before you can save.
        </p>
      )}

      <Panel title="Personal details">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="First name" required autoComplete="off" {...bind("firstName")} />
          <Input label="Last name" required autoComplete="off" {...bind("lastName")} />
        </div>
      </Panel>

      <Panel title="Contact" description="The email address is also used to sign in.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Email address" type="email" required inputMode="email" autoComplete="off" className="sm:col-span-2" {...bind("email")} />
          <Input label="Phone number" type="tel" inputMode="tel" hint="Optional" {...bind("phone")} />
          <Input label="Location" hint="Optional. A city, or “Remote”." {...bind("location")} />
        </div>
      </Panel>

      <Panel title="Job">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Job title" required {...bind("jobTitle")} />
          <Select
            label="Department"
            required
            placeholder="Choose a department"
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            {...bind("departmentId")}
          />
          <Input label="Start date" type="date" required {...bind("joinedAt")} />
          <RadioGroup
            label="Access level"
            name="role"
            value={values.role}
            onChange={(role) => set("role", role)}
            options={ROLE_OPTIONS}
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
