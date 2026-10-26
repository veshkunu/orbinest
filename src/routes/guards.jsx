import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Button, EmptyState } from "../components/ui";

/** Signed-in users only. Remembers where they were headed. */
export function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** Signed-out users only (login page). */
export function RedirectIfSignedIn() {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function AccessDenied() {
  useDocumentTitle("No access");
  return (
    <EmptyState page
      icon={ShieldX}
      title="You don't have access to this page"
      description="This area is for admins. If you think you need access, ask your manager."
      action={<Button to="/dashboard">Go to dashboard</Button>}
    />
  );
}

/** Restrict a section to some roles. Others see a plain explanation. */
export function RequireRole({ roles }) {
  const { user } = useAuth();
  if (!roles.includes(user.role)) return <AccessDenied />;
  return <Outlet />;
}
