import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useQuery } from "../hooks/useQuery";
import { cn } from "../lib/cn";
import { downloadCsv, toCsv } from "../lib/csv";
import { toDateInput } from "../lib/format";
import { getReport } from "../services/reportService";
import { PageHeader } from "../components/layout/PageHeader";
import { CompletedByPersonChart } from "../components/charts/CompletedByPersonChart";
import { CompletedTrendChart } from "../components/charts/CompletedTrendChart";
import { DueOutcomesChart } from "../components/charts/DueOutcomesChart";
import { Button, ErrorState, KpiStrip, Panel, SegmentedControl, Skeleton, TBody, THead, Table, Td, Th, Tr } from "../components/ui";

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

const CSV_COLUMNS = [
  { key: "name", label: "Employee" },
  { key: "department", label: "Department" },
  { key: "completed", label: "Completed" },
  { key: "onTimeRate", label: "On time (%)" },
  { key: "open", label: "Open now" },
  { key: "overdue", label: "Overdue now" },
];

const SORT_VALUE = {
  name: (p) => p.name.toLowerCase(),
  completed: (p) => p.completed,
  onTimeRate: (p) => p.onTimeRate ?? -1,
  open: (p) => p.open,
  overdue: (p) => p.overdue,
};

function PeopleTable({ people }) {
  const [sort, setSort] = useState({ key: "completed", direction: "desc" });
  const toggle = (key) =>
    setSort((s) => ({ key, direction: s.key === key ? (s.direction === "asc" ? "desc" : "asc") : key === "name" ? "asc" : "desc" }));
  const sortFor = (key) => (sort.key === key ? sort.direction : null);

  const sorted = useMemo(() => {
    const value = SORT_VALUE[sort.key];
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...people].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      return (typeof x === "string" ? x.localeCompare(y) : x - y) * factor;
    });
  }, [people, sort]);

  return (
    <>
      {/* Phones: two-line rows, every field kept */}
      <ul className="divide-y divide-rule md:hidden" aria-label="Team performance">
        {sorted.map((p) => (
          <li key={p.id}>
            <Link to={`/employees/${p.id}`} className="flex items-start justify-between gap-4 px-4 py-3">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">{p.name}</span>
                <span className="block text-sm text-ink-muted">
                  {p.department}
                  {p.status === "on_leave" && " · On leave"}
                </span>
              </span>
              <span className="shrink-0 text-right text-sm tabular-nums">
                <span className="block text-ink">
                  {p.completed} done · {p.onTimeRate === null ? "—" : `${p.onTimeRate}%`} on time
                </span>
                <span className="block text-ink-muted">
                  {p.open} open · <span className={cn(p.overdue > 0 && "font-semibold text-danger-ink")}>{p.overdue} overdue</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Table label="Team performance" className="hidden min-w-0 md:block">
        <THead>
          <Th sort={sortFor("name")} onSort={() => toggle("name")}>
            Employee
          </Th>
          <Th className="hidden md:table-cell">Department</Th>
          <Th align="right" sort={sortFor("completed")} onSort={() => toggle("completed")}>
            Completed
          </Th>
          <Th align="right" sort={sortFor("onTimeRate")} onSort={() => toggle("onTimeRate")}>
            On time
          </Th>
          <Th align="right" sort={sortFor("open")} onSort={() => toggle("open")}>
            Open
          </Th>
          <Th align="right" sort={sortFor("overdue")} onSort={() => toggle("overdue")}>
            Overdue
          </Th>
        </THead>
        <TBody>
          {sorted.map((p) => (
            <Tr key={p.id}>
              <Td className="h-14">
                <Link to={`/employees/${p.id}`} className="font-medium whitespace-nowrap text-ink hover:text-brand-700">
                  {p.name}
                </Link>
                {p.status === "on_leave" && <span className="ml-2 text-xs text-ink-muted">On leave</span>}
              </Td>
              <Td className="hidden h-14 text-ink-muted md:table-cell">{p.department}</Td>
              <Td align="right" className="h-14 text-ink tabular-nums">
                {p.completed}
              </Td>
              <Td align="right" className="h-14 text-ink tabular-nums">
                {p.onTimeRate === null ? <span className="text-ink-subtle">—</span> : `${p.onTimeRate}%`}
              </Td>
              <Td align="right" className="h-14 text-ink tabular-nums">
                {p.open}
              </Td>
              <Td align="right" className={cn("h-14 tabular-nums", p.overdue ? "font-semibold text-danger-ink" : "text-ink-muted")}>
                {p.overdue}
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </>
  );
}

export function ReportsPage() {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const range = RANGES.some((r) => r.value === params.get("range")) ? params.get("range") : "30";
  const days = Number(range);
  const { data, isLoading, isError, refetch } = useQuery(`report:${range}`, () => getReport(days));
  const ready = data && data.days === days;

  const handleDownload = () => {
    const rows = data.people.map((p) => ({ ...p, onTimeRate: p.onTimeRate ?? "" }));
    downloadCsv(`orbinest-team-report-${days}-days-${toDateInput(new Date())}.csv`, toCsv(rows, CSV_COLUMNS));
    toast("Report downloaded.");
  };

  const period = `vs previous ${days} days`;

  return (
    <>
      <PageHeader
        title="Reports"
        description={`How your team did in the last ${days} days`}
        actions={
          <>
            <SegmentedControl
              label="Date range"
              value={range}
              onChange={(v) => setParams(v === "30" ? {} : { range: v }, { replace: true })}
              options={RANGES}
            />
            <Button variant="secondary" icon={Download} onClick={handleDownload} disabled={!ready}>
              Download CSV
            </Button>
          </>
        }
      />

      {isError ? (
        <Panel>
          <ErrorState onRetry={refetch} />
        </Panel>
      ) : isLoading ? (
        <div role="status" aria-label="Loading report" className="flex flex-col gap-6">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-lg" />
            <Skeleton className="h-80 rounded-lg" />
          </div>
        </div>
      ) : (
        <div className={cn("flex flex-col gap-6 transition-opacity duration-150", !ready && "opacity-60")} aria-busy={!ready}>
          <KpiStrip
            items={[
              { label: "Tasks completed", value: data.completed, delta: { change: data.completed - data.completedPrev, label: period } },
              {
                label: "Done on time",
                value: data.onTimeRate === null ? "—" : `${data.onTimeRate}%`,
                caption: data.onTimeRate === null ? "Nothing completed yet" : "Of tasks completed in this period",
              },
              {
                label: "Tasks created",
                value: data.created,
                delta: { change: data.created - data.createdPrev, label: period, upIsGood: null },
              },
              {
                label: "Overdue right now",
                value: data.overdueNow,
                alert: data.overdueNow > 0,
                caption: "Across the whole team, today",
                to: "/tasks?status=overdue",
              },
            ]}
          />

          <CompletedTrendChart series={data.series} total={data.completed} days={data.days} />

          <div className="grid gap-6 lg:grid-cols-2">
            <CompletedByPersonChart people={data.people} days={data.days} stretch />
            <DueOutcomesChart data={data.outcomesByDepartment} days={data.days} stretch />
          </div>

          <Panel
            title="Team performance"
            description={`Completed and on-time figures are for the last ${data.days} days. Open and overdue are as of today.`}
            padded={false}
          >
            <PeopleTable people={data.people} />
          </Panel>
        </div>
      )}
    </>
  );
}
