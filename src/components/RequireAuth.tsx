import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";

function Gate({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-[200px]">
        <p className="mb-3 text-center font-mono text-[9px] uppercase tracking-[0.3em] text-white/35">
          CHECKING SESSION
        </p>
        <div className="elb-loader-bar" />
      </div>
    </div>
  );
}

/** Customer-area guard: sends signed-out visitors to /auth with a return path. */
export function RequireAuth() {
  const { isAuthenticated, loading, token } = useAuth();
  const location = useLocation();

  if (token && loading) return <Gate>loading</Gate>;
  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  return <Outlet />;
}

/** Admin guard: also requires the admin allow-list role. */
export function RequireAdmin() {
  const { isAuthenticated, isAdmin, loading, token } = useAuth();
  const location = useLocation();

  if (token && loading) return <Gate>loading</Gate>;
  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/account?forbidden=1" replace />;
  }
  return <Outlet />;
}
