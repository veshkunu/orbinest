import { Building2, CalendarDays, IdCard, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { ROLE_LABELS } from "../../lib/constants";
import { formatDate, fullName } from "../../lib/format";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { Avatar, Badge, EmployeeStatusBadge, Panel } from "../../components/ui";

/** Avatar, name and status block at the top of a profile. */
export function ProfileHeader({ employee, departmentName, actions, documentTitle }) {
  useDocumentTitle(documentTitle ?? fullName(employee));
  return (
    <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar person={employee} size="lg" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[2rem] sm:leading-10">{fullName(employee)}</h1>
            <EmployeeStatusBadge status={employee.status} />
          </div>
          <p className="mt-0.5 text-base text-ink-muted">
            {employee.jobTitle} · {departmentName(employee.departmentId)}
          </p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
      <dt className="w-28 shrink-0 text-sm text-ink-muted">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm break-words text-ink">{children}</dd>
    </div>
  );
}

export function ContactList({ employee }) {
  return (
    <dl className="divide-y divide-rule">
      <DetailRow icon={Mail} label="Email">
        <a href={`mailto:${employee.email}`} className="font-medium text-brand-700 hover:underline">
          {employee.email}
        </a>
      </DetailRow>
      <DetailRow icon={Phone} label="Phone">
        {employee.phone ? (
          <a href={`tel:${employee.phone.replace(/\s/g, "")}`} className="font-medium text-brand-700 hover:underline">
            {employee.phone}
          </a>
        ) : (
          <span className="text-ink-muted">Not added</span>
        )}
      </DetailRow>
      <DetailRow icon={MapPin} label="Location">
        {employee.location || <span className="text-ink-muted">Not added</span>}
      </DetailRow>
    </dl>
  );
}

export function JobList({ employee, departmentName }) {
  return (
    <dl className="divide-y divide-rule">
      <DetailRow icon={Building2} label="Department">
        {departmentName(employee.departmentId)}
      </DetailRow>
      <DetailRow icon={ShieldCheck} label="Access">
        {employee.role === "admin" ? <Badge tone="brand">{ROLE_LABELS.admin}</Badge> : ROLE_LABELS.staff}
      </DetailRow>
      <DetailRow icon={CalendarDays} label="Started">
        {formatDate(employee.joinedAt)}
      </DetailRow>
      <DetailRow icon={IdCard} label="Employee ID">
        <span className="tabular-nums">{employee.id.toUpperCase()}</span>
      </DetailRow>
    </dl>
  );
}

/**
 * Contact and job details in one panel, side by side from tablet up, so the two halves
 * share one frame instead of two cards of different heights.
 */
export function DetailsPanel({ contact, job, contactAction, footnote }) {
  return (
    <Panel padded={false}>
      <div className="grid md:grid-cols-2">
        <section className="p-5">
          <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">Contact</h2>
            {contactAction}
          </div>
          {contact}
        </section>
        <section className="border-t border-line p-5 md:border-t-0 md:border-l">
          <div className="mb-3 flex min-h-8 items-center">
            <h2 className="text-base font-semibold text-ink">Job</h2>
          </div>
          {job}
        </section>
      </div>
      {footnote && <p className="border-t border-line px-5 py-3 text-sm text-ink-muted">{footnote}</p>}
    </Panel>
  );
}
