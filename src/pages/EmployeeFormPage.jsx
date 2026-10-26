import { useNavigate, useParams } from "react-router-dom";
import { UserX } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useQuery } from "../hooks/useQuery";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { fullName } from "../lib/format";
import { createEmployee, getEmployee, updateEmployee } from "../services/employeeService";
import { PageHeader } from "../components/layout/PageHeader";
import { Button, EmptyState, Skeleton } from "../components/ui";
import { EmployeeForm } from "../features/employees/EmployeeForm";
import { toFormValues } from "../features/employees/employeeFormModel";

/** Add (/employees/new) and edit (/employees/:employeeId/edit) share this page. */
export function EmployeeFormPage() {
  const { employeeId } = useParams();
  const isEdit = Boolean(employeeId);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setDirty, dialog } = useUnsavedChanges();
  const { data: employee, isLoading } = useQuery(`employee:${employeeId ?? "new"}`, () =>
    isEdit ? getEmployee(employeeId) : null,
  );

  const back = isEdit ? { to: `/employees/${employeeId}`, label: "Back to profile" } : { to: "/employees", label: "Employees" };

  if (isEdit && isLoading) {
    return (
      <div role="status" aria-label="Loading employee" className="flex flex-col gap-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (isEdit && !employee) {
    return (
      <EmptyState page
        icon={UserX}
        title="We can't find this employee"
        description="They may have been removed, or the link is wrong."
        action={<Button to="/employees">Back to employees</Button>}
      />
    );
  }

  const handleSubmit = async (values) => {
    const saved = isEdit ? await updateEmployee(employeeId, values) : await createEmployee(values);
    setDirty(false);
    toast(isEdit ? "Changes saved." : `${fullName(saved)} was added to your team.`);
    navigate(`/employees/${isEdit ? employeeId : saved.id}`, { replace: !isEdit });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        back={back}
        title={isEdit ? `Edit ${fullName(employee)}` : "Add employee"}
        description={isEdit ? "Update their details. Changes apply straight away." : "They can sign in with this email once added."}
      />
      <EmployeeForm
        key={employee?.id ?? "new"}
        initialValues={toFormValues(employee)}
        submitLabel={isEdit ? "Save changes" : "Add employee"}
        onSubmit={handleSubmit}
        onCancel={() => navigate(back.to)}
        onDirtyChange={setDirty}
      />
      {dialog}
    </div>
  );
}
