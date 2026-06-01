import { Navigate, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { authToken } from "../../utils/authToken";
import { Button } from "../ui/Button";
import { FullPageLoader } from "../ui/FullPageLoader";

const AuthRecoveryScreen = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-page-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-violet-border bg-white p-6 text-center shadow-sm">
        <h2 className="text-lg font-bold text-text-main">We could not verify your session.</h2>
        <p className="mt-2 text-sm text-text-secondary">Please retry now or login again to continue.</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => void refreshUser()}>
            Retry
          </Button>
          <Button variant="primary" onClick={() => navigate("/login", { replace: true })}>
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProtectedRoute = () => {
  const { isBooting, isAuthenticated, authError } = useAuth();

  // eslint-disable-next-line no-console
  console.log("[ProtectedRoute]", { isBooting, isAuthenticated, authError });

  if (isBooting) {
    return <FullPageLoader message="Preparing your workspace..." />;
  }

  if (authError && authToken.get()) {
    return <AuthRecoveryScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
