import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { FullPageLoader } from "../ui/FullPageLoader";

export const AuthRedirectRoute = () => {
  const { isAuthenticated, isBooting } = useAuth();

  if (isBooting) {
    return <FullPageLoader message="Checking session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
