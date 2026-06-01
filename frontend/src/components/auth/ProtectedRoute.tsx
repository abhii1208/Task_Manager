import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import { FullPageLoader } from "../ui/FullPageLoader";

const AuthRecoveryScreen = () => {
  const { clearSession, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async (): Promise<void> => {
    try {
      setIsRetrying(true);
      const refreshedUser = await refreshUser();

      if (refreshedUser) {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        toast.error("Backend is unavailable right now. Please retry in a few seconds.");
        return;
      }

      toast.error("Unable to verify session. Please retry.");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoToLogin = (): void => {
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-page-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-violet-border bg-white p-6 text-center shadow-sm">
        <h2 className="text-lg font-bold text-text-main">We could not verify your session.</h2>
        <p className="mt-2 text-sm text-text-secondary">Please retry now or login again to continue.</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button variant="secondary" isLoading={isRetrying} loadingText="Retrying..." onClick={() => void handleRetry()}>
            Retry
          </Button>
          <Button variant="primary" onClick={handleGoToLogin}>
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProtectedRoute = () => {
  const { isBooting, isAuthenticated, authError } = useAuth();

  if (isBooting) {
    return <FullPageLoader message="Preparing your workspace..." />;
  }

  if (authError && !isAuthenticated) {
    return <AuthRecoveryScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
