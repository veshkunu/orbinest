import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchX, UserPlus, Users } from "lucide-react";
import { useDepartments } from "../hooks/useDepartments";
import { useQuery } from "../hooks/useQuery";
import { EMPLOYEE_STATUS } from "../lib/constants";
import { fullName } from "../lib/format";
import { listEmployees } from "../services/employeeService";
import { PageHeader } from "../components/layout/PageHeader";
import { Button, EmptyState, ErrorState, Panel, SearchInput, Select, SkeletonList } from "../components/ui";
import { EmployeeList } from "../features/employees/EmployeeList";

const STATUS_OPTIONS = Object.entries(EMPLOYEE_STATUS).map(([value, { label }]) => ({ value, label }));

export function EmployeesPage() {
  // Filters live in the URL so they survive refresh and the back button
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const departmentId = params.get("department") ?? "";
  const status = params.get("status") ?? "";
  const [sort, setSort] = useState({ key: "name", direction: "asc" });
  const { departments, departmentName } = useDepartments();

  const setFilter = (key, value) => {
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  };

  const all = useQuery("employees:all", () => listEmployees());
  const filtered = useQuery(`employees:${search}|${departmentId}|${status}`, () => listEmployees({ search, departmentId, status }));

  const toggleSort = (key) =>
    setSort((s) => ({ key, direction: s.key === key && s.direction === "asc" ? "desc" : "asc" }));

  const sorted = useMemo(() => {
    const list = [...(filtered.data ?? [])];
    const value = {
      name: (e) => fullName(e).toLowerCase(),
      department: (e) => departmentName(e.departmentId),
      joinedAt: (e) => e.joinedAt,
    }[sort.key];
    list.sort((a, b) => value(a).localeCompare(value(b)) * (sort.direction === "asc" ? 1 : -1));
    return list;
  }, [filtered.data, sort, departmentName]);

  const hasFilters = Boolean(search || departmentId || status);
  const total = all.data?.length ?? 0;
  const activeCount = all.data?.filter((e) => e.status === "active").length ?? 0;

  return (
    <>
      <PageHeader
        title="Employees"
        description={all.data ? `${total} people · ${activeCount} active` : "Everyone on your team"}
        actions={
          <Button to="/employees/new" icon={UserPlus}>
            Add employee
          </Button>
        }
      />

      <Panel padded={false}>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <SearchInput
            value={search}
            onChange={(v) => setFilter("q", v)}
            label="Search employees"
            placeholder="Search by name, email or job title"
            className="sm:max-w-sm sm:flex-1"
          />
          <div className="grid grid-cols-2 gap-3 sm:flex">
            <Select
              aria-label="Filter by department"
              value={departmentId}
              onChange={(e) => setFilter("department", e.target.value)}
              placeholder="All departments"
              options={departments.map((d) => ({ value: d.id, label: d.name }))}
              className="sm:w-48"
            />
            <Select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => setFilter("status", e.target.value)}
              placeholder="All statuses"
              options={STATUS_OPTIONS}
              className="sm:w-40"
            />
          </div>
          {hasFilters && (
            <Button variant="ghost" onClick={() => setParams({}, { replace: true })} className="sm:ml-auto">
              Clear filters
            </Button>
          )}
        </div>

        {filtered.isLoading ? (
          <div className="px-5">
            <SkeletonList rows={6} label="Loading employees" />
          </div>
        ) : filtered.isError ? (
          <ErrorState onRetry={filtered.refetch} />
        ) : sorted.length === 0 ? (
          hasFilters ? (
            <EmptyState
              icon={SearchX}
              title="No one matches those filters"
              description="Try a different name or clear the filters to see everyone."
              action={
                <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Users}
              title="No employees yet"
              description="Add the people on your team so you can assign them tasks."
              action={
                <Button to="/employees/new" icon={UserPlus}>
                  Add employee
                </Button>
              }
            />
          )
        ) : (
          <>
            <EmployeeList employees={sorted} departmentName={departmentName} sort={sort} onSort={toggleSort} />
            <p className="border-t border-line px-5 py-3 text-sm text-ink-muted" aria-live="polite">
              Showing {sorted.length} of {total} {total === 1 ? "person" : "people"}
            </p>
          </>
        )}
      </Panel>
    </>
  );
}
