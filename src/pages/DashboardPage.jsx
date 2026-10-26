import { useAuth } from "../context/AuthContext";
import { AdminDashboard } from "../features/dashboard/AdminDashboard";
import { StaffDashboard } from "../features/dashboard/StaffDashboard";

/** Shared /dashboard route — the view depends on the signed-in role. */
export function DashboardPage() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <StaffDashboard />;
}
