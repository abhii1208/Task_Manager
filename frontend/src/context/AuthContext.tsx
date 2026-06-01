import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { authService } from "../services/auth.service";
import { clearAuthHeader, setAuthHeader } from "../services/api";
import { AuthSuccessData, LoginPayload, RegisterPayload, User } from "../types/auth";
import { clearToken, getToken, setToken } from "../utils/authToken";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  login: (payload: LoginPayload) => Promise<AuthSuccessData>;
  register: (payload: RegisterPayload) => Promise<AuthSuccessData>;
  setAuthFromToken: (token: string, user?: User | null) => void;
  handleOAuthToken: (token: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  retryAuthCheck: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setSessionToken] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const saveSession = useCallback((nextToken: string, nextUser: User): void => {
    setToken(nextToken);
    setAuthHeader(nextToken);
    setSessionToken(nextToken);
    setUser(nextUser);
    setIsAuthenticated(true);
    setIsAuthLoading(false);
    setAuthError(null);
    // eslint-disable-next-line no-console
    console.log("[Auth] Context updated", { isAuthenticated: true });
  }, []);

  const setAuthFromToken = useCallback((nextToken: string, nextUser?: User | null): void => {
    setToken(nextToken);
    setAuthHeader(nextToken);
    setSessionToken(nextToken);

    if (nextUser) {
      setUser(nextUser);
      setIsAuthenticated(true);
    }

    setIsAuthLoading(false);
    setAuthError(null);
  }, []);

  const clearSession = useCallback(() => {
    clearToken();
    clearAuthHeader();
    setSessionToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    const profile = await authService.me();
    setUser(profile);
    setIsAuthenticated(true);
    setAuthError(null);
  }, []);

  const runSessionHydration = useCallback(
    async (sessionToken: string, showTimeoutToast = false): Promise<void> => {
      setAuthHeader(sessionToken);

      const hydrationTimeout = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("AUTH_CHECK_TIMEOUT")), 5000);
      });

      try {
        await Promise.race([refreshProfile(), hydrationTimeout]);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearSession();
          return;
        }

        if (error instanceof Error && error.message === "AUTH_CHECK_TIMEOUT") {
          setAuthError("Starting workspace services... Please retry in a few seconds.");
          if (showTimeoutToast) {
            toast.error("Starting workspace services... Please retry in a few seconds.");
          }
        } else {
          setAuthError("Unable to verify your session right now. Please retry.");
        }
      }
    },
    [clearSession, refreshProfile]
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const data = await authService.login(payload);
      // eslint-disable-next-line no-console
      console.log("[Auth] Login success", { hasToken: Boolean(data.token), hasUser: Boolean(data.user) });
      saveSession(data.token, data.user);
      return data;
    },
    [saveSession]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const data = await authService.register(payload);
      saveSession(data.token, data.user);
      return data;
    },
    [saveSession]
  );

  const handleOAuthToken = useCallback(
    async (oauthToken: string) => {
      setAuthFromToken(oauthToken);

      try {
        const profile = await authService.me();
        saveSession(oauthToken, profile);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearSession();
        }
        throw error;
      }
    },
    [clearSession, saveSession, setAuthFromToken]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const retryAuthCheck = useCallback(async (): Promise<void> => {
    if (!token) {
      setIsAuthLoading(false);
      setIsAuthenticated(false);
      setAuthError(null);
      return;
    }

    setIsAuthLoading(true);
    setAuthError(null);
    await runSessionHydration(token, true);
    setIsAuthLoading(false);
  }, [runSessionHydration, token]);

  useEffect(() => {
    const handleSessionExpired = (): void => {
      clearSession();
      toast.error("Session expired. Please login again.");
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    const hydrateUser = async (): Promise<void> => {
      const existingToken = getToken();

      if (!existingToken) {
        if (!isMounted) {
          return;
        }
        setSessionToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
        setIsAuthLoading(false);
        return;
      }

      if (!isMounted) {
        return;
      }

      setSessionToken(existingToken);
      await runSessionHydration(existingToken);

      if (isMounted) {
        setIsAuthLoading(false);
      }
    };

    const timeout = window.setTimeout(() => {
      if (isMounted) {
        setIsAuthLoading(false);
      }
    }, 5000);

    void hydrateUser();

    return () => {
      isMounted = false;
      window.clearTimeout(timeout);
    };
  }, [runSessionHydration]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isAuthLoading,
      authError,
      login,
      register,
      setAuthFromToken,
      handleOAuthToken,
      logout,
      refreshProfile,
      retryAuthCheck
    }),
    [user, token, isAuthenticated, isAuthLoading, authError, login, register, setAuthFromToken, handleOAuthToken, logout, refreshProfile, retryAuthCheck]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
