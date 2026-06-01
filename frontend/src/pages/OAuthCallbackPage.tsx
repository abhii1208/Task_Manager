import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { FullPageLoader } from "../components/ui/FullPageLoader";

const OAUTH_TOKEN_CACHE_KEY = "tm_oauth_callback_token";

export const OAuthCallbackPage = () => {
  const { handleOAuthToken } = useAuth();
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
    const tokenFromQuery = params.get("token");

    if (tokenFromQuery) {
      sessionStorage.setItem(OAUTH_TOKEN_CACHE_KEY, tokenFromQuery);
    }

    const token = tokenFromQuery ?? sessionStorage.getItem(OAUTH_TOKEN_CACHE_KEY);

    if (!token) {
      const message = "OAuth session expired. Please login again.";
      setError(message);
      toast.error(message);
      return;
    }

    const processOAuthCallback = async (): Promise<void> => {
      try {
        await handleOAuthToken(token);
        sessionStorage.removeItem(OAUTH_TOKEN_CACHE_KEY);
        navigate("/dashboard", { replace: true });
      } catch {
        sessionStorage.removeItem(OAUTH_TOKEN_CACHE_KEY);
        const message = "Login succeeded, but profile loading failed. Please try again.";
        setError(message);
        toast.error(message);
      }
    };

    void processOAuthCallback();
  }, [handleOAuthToken, location.search, navigate]);

  return (
    error ? (
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
    ) : (
      <FullPageLoader message="Signing you in..." />
    )
  );
};
