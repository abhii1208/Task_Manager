import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import { FullPageLoader } from "./FullPageLoader";

export const ProtectedRoute = () => {
  const { isAuthenticated, isAuthLoading, authError, token, retryAuthCheck } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <FullPageLoader message="Preparing your workspace..." />;
  }

  if (authError && token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page-bg px-4">
        <div className="w-full max-w-md rounded-2xl border border-violet-border bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-text-main">Session check delayed</h2>
          <p className="mt-2 text-sm text-text-secondary">{authError}</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="secondary" onClick={() => void retryAuthCheck()}>
              Retry
            </Button>
            <Button variant="primary" onClick={() => window.location.assign("/login")}>
              Go to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
