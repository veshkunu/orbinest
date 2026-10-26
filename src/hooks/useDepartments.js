import { useMemo } from "react";
import { listDepartments } from "../services/employeeService";
import { useQuery } from "./useQuery";

/** Departments list plus an id → name lookup. */
export function useDepartments() {
  const { data: departments = [] } = useQuery("departments", listDepartments);
  const departmentName = useMemo(() => {
    const names = Object.fromEntries(departments.map((d) => [d.id, d.name]));
    return (id) => names[id] ?? "—";
  }, [departments]);
  return { departments, departmentName };
}
