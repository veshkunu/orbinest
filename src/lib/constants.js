import { Bell, LayoutDashboard, ListChecks, ChartColumn, Users } from "lucide-react";

export const ROLES = {
  admin: "admin",
  staff: "staff",
};

export const ROLE_LABELS = {
  admin: "Admin",
  staff: "Staff",
};

export const EMPLOYEE_STATUS = {
  active: { label: "Active", tone: "success" },
  on_leave: { label: "On leave", tone: "warning" },
  inactive: { label: "Inactive", tone: "neutral" },
};

export const TASK_STATUS = {
  todo: { label: "To do", tone: "neutral" },
  in_progress: { label: "In progress", tone: "info" },
  done: { label: "Done", tone: "success" },
};

/** Not stored — derived when a task is past its due date and not done. */
export const OVERDUE = { label: "Overdue", tone: "danger" };

export const TASK_PRIORITY = {
  low: { label: "Low", tone: "neutral" },
  medium: { label: "Medium", tone: "warning" },
  high: { label: "High", tone: "danger" },
};

export const NAV_ITEMS = {
  admin: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/employees", label: "Employees", icon: Users },
    { to: "/tasks", label: "Tasks", icon: ListChecks },
    { to: "/reports", label: "Reports", icon: ChartColumn },
    { to: "/notifications", label: "Notifications", icon: Bell },
  ],
  staff: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tasks", label: "My tasks", icon: ListChecks },
    { to: "/notifications", label: "Notifications", icon: Bell },
  ],
};
