import axios from "axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { FullPageLoader } from "../components/ui/FullPageLoader";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/auth.service";
import { clearApiAuthToken, setApiAuthToken } from "../services/api";
import { OAUTH_REFRESH_FLAG } from "../utils/authRefreshFlags";
import { authToken } from "../utils/authToken";

export const OAuthCallbackPage = () => {
  const { applySession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    hasProcessed.current = true;

    const runOAuthSession = async (): Promise<void> => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          const message = "OAuth token is missing. Please login again.";
          setError(message);
          toast.error(message);
          return;
        }

        authToken.set(token);
        setApiAuthToken(token);
        const user = await authService.me();
        applySession(token, user);
        toast.success("Google login successful");
        navigate("/dashboard", { replace: true });

        if (!sessionStorage.getItem(OAUTH_REFRESH_FLAG)) {
          sessionStorage.setItem(OAUTH_REFRESH_FLAG, "true");
          toast("Opening your workspace...");
          window.setTimeout(() => {
            window.location.reload();
          }, 250);
        }
      } catch (caughtError) {
        if (axios.isAxiosError(caughtError) && caughtError.response?.status === 401) {
          authToken.clear();
          clearApiAuthToken();
          const message = "OAuth session expired. Please login again.";
          setError(message);
          toast.error(message);
          return;
        }

        const message = "Could not complete Google login. Please retry.";
        setError(message);
        toast.error(message);
      }
    };

    void runOAuthSession();
  }, [applySession, navigate, searchParams]);

  if (!error) {
    return <FullPageLoader message="Signing you in with Google..." />;
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
