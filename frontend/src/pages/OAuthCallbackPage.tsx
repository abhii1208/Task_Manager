import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { FullPageLoader } from "../components/ui/FullPageLoader";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/auth.service";
import { setApiAuthToken } from "../services/api";
import { OAUTH_REFRESH_FLAG } from "../utils/authRefreshFlags";
import { authToken } from "../utils/authToken";

export const OAuthCallbackPage = () => {
  const { applySession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    hasProcessed.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      const message = "OAuth session expired. Please login again.";
      setError(message);
      toast.error(message);
      return;
    }

    const runOAuthSession = async (): Promise<void> => {
      try {
        authToken.set(token);
        setApiAuthToken(token);
        const profile = await authService.me();
        applySession(token, profile);
        navigate("/dashboard", { replace: true });

        if (!sessionStorage.getItem(OAUTH_REFRESH_FLAG)) {
          sessionStorage.setItem(OAUTH_REFRESH_FLAG, "true");
          toast("Opening your workspace...");
          window.setTimeout(() => {
            window.location.reload();
          }, 250);
        }
      } catch {
        const message = "Login succeeded, but profile loading failed. Please try again.";
        setError(message);
        toast.error(message);
      }
    };

    void runOAuthSession();
  }, [applySession, location.search, navigate]);

  if (!error) {
    return <FullPageLoader message="Signing you in..." />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-violet-border bg-white px-6 py-6 text-center shadow-sm">
        <p className="text-base font-semibold text-danger">{error}</p>
        <Link
          to="/login"
          replace
          className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};
