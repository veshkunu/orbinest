import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatDate, fullName } from "../../lib/format";
import { Avatar, Badge, EmployeeStatusBadge, TBody, THead, Table, Td, Th, Tr } from "../../components/ui";

function AdminTag({ employee }) {
  return employee.role === "admin" ? <Badge tone="brand">Admin</Badge> : null;
}

/**
 * Employees as a sortable table on tablet and up, stacked rows on phones.
 * `sort` is { key, direction }; `onSort(key)` toggles it.
 */
export function EmployeeList({ employees, departmentName, sort, onSort }) {
  const navigate = useNavigate();
  const sortFor = (key) => (sort.key === key ? sort.direction : null);

  return (
    <>
      <div className="hidden md:block">
        <Table label="Employees">
          <THead>
            <Th sort={sortFor("name")} onSort={() => onSort("name")}>
              Name
            </Th>
            <Th className="hidden lg:table-cell">Job title</Th>
            <Th sort={sortFor("department")} onSort={() => onSort("department")}>
              Department
            </Th>
            <Th>Status</Th>
            <Th sort={sortFor("joinedAt")} onSort={() => onSort("joinedAt")}>
              Joined
            </Th>
            <Th>
              <span className="sr-only">Open</span>
            </Th>
          </THead>
          <TBody>
            {employees.map((e) => (
              <Tr key={e.id} onClick={() => navigate(`/employees/${e.id}`)}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar person={e} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/employees/${e.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="truncate font-medium text-ink hover:text-brand-700"
                        >
                          {fullName(e)}
                        </Link>
                        <AdminTag employee={e} />
                      </div>
                      <p className="truncate text-ink-muted">{e.email}</p>
                    </div>
                  </div>
                </Td>
                <Td className="hidden text-ink lg:table-cell">{e.jobTitle}</Td>
                <Td className="text-ink">{departmentName(e.departmentId)}</Td>
                <Td>
                  <EmployeeStatusBadge status={e.status} />
                </Td>
                <Td className="whitespace-nowrap text-ink-muted tabular-nums">{formatDate(e.joinedAt)}</Td>
                <Td align="right" className="w-12">
                  <ChevronRight className="ml-auto size-4 text-ink-subtle" aria-hidden="true" />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>

      <ul className="divide-y divide-line md:hidden" aria-label="Employees">
        {employees.map((e) => (
          <li key={e.id}>
            <Link to={`/employees/${e.id}`} className="flex items-center gap-3 px-4 py-3.5 active:bg-canvas">
              <Avatar person={e} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <span className="truncate font-medium text-ink">{fullName(e)}</span>
                  <AdminTag employee={e} />
                </p>
                <p className="truncate text-sm text-ink-muted">
                  {e.jobTitle} · {departmentName(e.departmentId)}
                </p>
                <div className="mt-1.5">
                  <EmployeeStatusBadge status={e.status} />
                </div>
              </div>
              <ChevronRight className="size-5 shrink-0 text-ink-subtle" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
