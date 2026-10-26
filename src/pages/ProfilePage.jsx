import { useState } from "react";
import { Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useDepartments } from "../hooks/useDepartments";
import { useQuery } from "../hooks/useQuery";
import { updateOwnContact } from "../services/employeeService";
import { listTasks } from "../services/taskService";
import { Button, Input } from "../components/ui";
import { ContactList, DetailsPanel, JobList, ProfileHeader } from "../features/employees/ProfileDetails";
import { TaskSummary } from "../features/employees/TaskSummary";

function ContactForm({ user, onDone }) {
  const { toast } = useToast();
  const [values, setValues] = useState({ phone: user.phone, location: user.location });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (values.phone.trim() && !/^[+\d][\d\s()-]{6,}$/.test(values.phone.trim())) {
      setError("Enter a phone number using digits, spaces or +.");
      return;
    }
    setSaving(true);
    await updateOwnContact(user.id, values);
    setSaving(false);
    toast("Your contact details were updated.");
    onDone();
  };

  return (
    <div>
      <p className="mb-4 text-sm text-ink-muted">Your email is used to sign in. Ask an admin to change it.</p>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input label="Email address" value={user.email} disabled readOnly />
        <Input
          label="Phone number"
          type="tel"
          inputMode="tel"
          name="phone"
          value={values.phone}
          error={error}
          autoFocus
          onChange={(e) => {
            setValues((v) => ({ ...v, phone: e.target.value }));
            setError("");
          }}
        />
        <Input
          label="Location"
          name="location"
          hint="City or “Remote”"
          value={values.location}
          onChange={(e) => setValues((v) => ({ ...v, location: e.target.value }))}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onDone} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const { departmentName } = useDepartments();
  const [editing, setEditing] = useState(false);
  const tasks = useQuery(`tasks:assignee:${user.id}`, () => listTasks({ assigneeId: user.id }));

  return (
    <div className="mx-auto max-w-4xl">
      <ProfileHeader
        documentTitle="My profile"
        employee={user}
        departmentName={departmentName}
        actions={
          isAdmin && (
            <Button variant="secondary" icon={Pencil} to={`/employees/${user.id}/edit`}>
              Edit all details
            </Button>
          )
        }
      />
      <div className="flex flex-col gap-6">
        <TaskSummary tasks={tasks.data ?? []} loading={tasks.isLoading} />
        <DetailsPanel
          contact={editing ? <ContactForm user={user} onDone={() => setEditing(false)} /> : <ContactList employee={user} />}
          contactAction={
            !editing && (
              <Button variant="ghost" size="sm" icon={Pencil} onClick={() => setEditing(true)}>
                Edit
              </Button>
            )
          }
          job={<JobList employee={user} departmentName={departmentName} />}
          footnote={isAdmin ? undefined : "Need a change to your job details? Ask your admin to update them."}
        />
      </div>
    </div>
  );
}
