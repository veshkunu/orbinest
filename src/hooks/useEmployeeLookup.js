import { useMemo } from "react";
import { listEmployees } from "../services/employeeService";
import { useQuery } from "./useQuery";

/** Everyone on the team plus an id → employee lookup, for showing assignees and authors. */
export function useEmployeeLookup() {
  const { data: employees = [] } = useQuery("employees:all", () => listEmployees());
  const byId = useMemo(() => {
    const map = new Map(employees.map((e) => [e.id, e]));
    return (id) => map.get(id) ?? null;
  }, [employees]);
  return { employees, byId };
}
