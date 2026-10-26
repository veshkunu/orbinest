import { ShieldCheck, UserRound } from "lucide-react";
import { toDateInput } from "../../lib/format";

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  jobTitle: "",
  departmentId: "",
  joinedAt: "",
  role: "staff",
};

export const ROLE_OPTIONS = [
  { value: "staff", label: "Staff", icon: UserRound, description: "Sees and updates their own tasks." },
  { value: "admin", label: "Admin", icon: ShieldCheck, description: "Manages employees, all tasks and reports." },
];

/** Form values use yyyy-mm-dd for the date input; stored records use ISO strings. */
export function toFormValues(employee) {
  if (!employee) return { ...EMPTY, joinedAt: toDateInput(new Date()) };
  return { ...EMPTY, ...employee, joinedAt: toDateInput(employee.joinedAt) };
}

export function validate(v) {
  const errors = {};
  if (!v.firstName.trim()) errors.firstName = "Enter a first name.";
  if (!v.lastName.trim()) errors.lastName = "Enter a last name.";
  if (!v.email.trim()) errors.email = "Enter an email address. It's used to sign in.";
  else if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) errors.email = "Enter an email like name@company.com.";
  if (v.phone.trim() && !/^[+\d][\d\s()-]{6,}$/.test(v.phone.trim())) errors.phone = "Enter a phone number using digits, spaces or +.";
  if (!v.jobTitle.trim()) errors.jobTitle = "Enter a job title, like “Sales Executive”.";
  if (!v.departmentId) errors.departmentId = "Choose a department.";
  if (!v.joinedAt) errors.joinedAt = "Choose a start date.";
  return errors;
}

export const FIELD_ORDER = ["firstName", "lastName", "email", "phone", "jobTitle", "departmentId", "joinedAt"];
