import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { RedirectIfSignedIn, RequireAuth, RequireRole } from "./guards";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { EmployeesPage } from "../pages/EmployeesPage";
import { EmployeeDetailPage } from "../pages/EmployeeDetailPage";
import { EmployeeFormPage } from "../pages/EmployeeFormPage";
import { ProfilePage } from "../pages/ProfilePage";
import { TasksPage } from "../pages/TasksPage";
import { TaskDetailPage } from "../pages/TaskDetailPage";
import { TaskFormPage } from "../pages/TaskFormPage";
import { NotificationsPage } from "../pages/NotificationsPage";

export const router = createBrowserRouter([
  {
    element: <RedirectIfSignedIn />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          {
            path: "tasks",
            children: [
              { index: true, element: <TasksPage /> },
              { path: ":taskId", element: <TaskDetailPage /> },
            ],
          },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "profile", element: <ProfilePage /> },
          {
            element: <RequireRole roles={["admin"]} />,
            children: [
              {
                path: "employees",
                children: [
                  { index: true, element: <EmployeesPage /> },
                  { path: "new", element: <EmployeeFormPage /> },
                  { path: ":employeeId", element: <EmployeeDetailPage /> },
                  { path: ":employeeId/edit", element: <EmployeeFormPage /> },
                ],
              },
              { path: "tasks/new", element: <TaskFormPage /> },
              { path: "tasks/:taskId/edit", element: <TaskFormPage /> },
              // Reports pull in the chart library, so load the page on demand
              { path: "reports", lazy: () => import("../pages/ReportsPage").then((m) => ({ Component: m.ReportsPage })) },
            ],
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
