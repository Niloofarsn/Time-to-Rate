import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Restrict a route subtree to specific roles; others are sent to the studies list. */
export function RequireRole({ roles }: { roles: Array<"RESEARCHER" | "PI" | "ADMIN"> }) {
  const { role } = useAuth();
  // While the role is still loading (null), render nothing to avoid a flash/redirect.
  if (role === null) return null;
  if (!roles.includes(role)) return <Navigate to="/studi" replace />;
  return <Outlet />;
}
