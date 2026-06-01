import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { FullPageLoader } from "../ui/FullPageLoader";

export const ProtectedRoute = () => {
  const { isBooting, isAuthenticated } = useAuth();

  if (isBooting) {
    return <FullPageLoader message="Preparing your workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
