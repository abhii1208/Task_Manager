import { AnimatePresence } from "framer-motion";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AuthRedirectRoute } from "./components/auth/AuthRedirectRoute";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { FullPageLoader } from "./components/ui/FullPageLoader";
import { useAuth } from "./hooks/useAuth";
import { DashboardPage } from "./pages/DashboardPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { KanbanTasksPage } from "./pages/KanbanTasksPage";
import { ListViewPage } from "./pages/ListViewPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OAuthCallbackPage } from "./pages/OAuthCallbackPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SettingsPage } from "./pages/SettingsPage";

const RootRedirect = () => {
  const { isBooting, isAuthenticated } = useAuth();

  if (isBooting) {
    return <FullPageLoader message="Loading TaskFlow Pro..." />;
  }

  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/board" element={<KanbanTasksPage />} />
          <Route path="/list" element={<ListViewPage />} />
          <Route path="/tasks/kanban" element={<Navigate to="/board" replace />} />
          <Route path="/tasks/list" element={<Navigate to="/list" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route element={<AuthRedirectRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return <AnimatedRoutes />;
};

export default App;
