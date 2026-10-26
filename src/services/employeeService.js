import { delay, read, write } from "./db";

export class ValidationError extends Error {
  constructor(fieldErrors) {
    super("Some details need fixing.");
    this.fieldErrors = fieldErrors;
  }
}

/** The business this Orbinest account belongs to. */
export function getWorkspace() {
  return read().company;
}

export async function listDepartments() {
  return read().departments;
}

/** Filter by free-text search (name, email, job title), department and status. */
export async function listEmployees({ search = "", departmentId = "", status = "" } = {}) {
  await delay();
  const query = search.trim().toLowerCase();
  return read().employees.filter((e) => {
    if (departmentId && e.departmentId !== departmentId) return false;
    if (status && e.status !== status) return false;
    if (!query) return true;
    return [`${e.firstName} ${e.lastName}`, e.email, e.jobTitle].some((v) => v.toLowerCase().includes(query));
  });
}

export async function getEmployee(id) {
  await delay();
  return read().employees.find((e) => e.id === id) ?? null;
}

function assertUniqueEmail(email, ignoreId) {
  const taken = read().employees.some((e) => e.email === email && e.id !== ignoreId);
  if (taken) throw new ValidationError({ email: "Someone on your team already uses this email." });
}

function normalize(data) {
  return {
    ...data,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    jobTitle: data.jobTitle.trim(),
    location: data.location.trim(),
  };
}

export async function createEmployee(data) {
  await delay(400);
  const employee = normalize(data);
  assertUniqueEmail(employee.email);
  const ids = read().employees.map((e) => Number(e.id.replace("emp-", "")));
  const id = `emp-${String(Math.max(0, ...ids) + 1).padStart(2, "0")}`;
  const created = { ...employee, id, status: "active" };
  write((s) => ({ ...s, employees: [...s.employees, created] }));
  return created;
}

export async function updateEmployee(id, data) {
  await delay(400);
  const changes = normalize({ ...read().employees.find((e) => e.id === id), ...data });
  assertUniqueEmail(changes.email, id);
  write((s) => ({ ...s, employees: s.employees.map((e) => (e.id === id ? { ...e, ...changes, id } : e)) }));
  return changes;
}

/** Contact details a staff member may change on their own profile. */
export async function updateOwnContact(id, { phone, location }) {
  await delay(300);
  write((s) => ({
    ...s,
    employees: s.employees.map((e) => (e.id === id ? { ...e, phone: phone.trim(), location: location.trim() } : e)),
  }));
}

export async function setEmployeeStatus(id, status) {
  await delay(300);
  write((s) => ({ ...s, employees: s.employees.map((e) => (e.id === id ? { ...e, status } : e)) }));
}
