import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { authService } from "../services/auth.service";
import { clearAuthHeader, setAuthHeader } from "../services/api";
import { LoginPayload, RegisterPayload, User } from "../types/auth";
import { clearToken, getToken, setToken } from "../utils/authToken";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  handleOAuthToken: (token: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setSessionToken] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const saveSession = useCallback((nextToken: string, nextUser: User): void => {
    setToken(nextToken);
    setAuthHeader(nextToken);
    setSessionToken(nextToken);
    setUser(nextUser);
    setIsAuthenticated(true);
  }, []);

  const clearSession = useCallback(() => {
    clearToken();
    clearAuthHeader();
    setSessionToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    const profile = await authService.me();
    setUser(profile);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const data = await authService.login(payload);
      saveSession(data.token, data.user);
    },
    [saveSession]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const data = await authService.register(payload);
      saveSession(data.token, data.user);
    },
    [saveSession]
  );

  const handleOAuthToken = useCallback(
    async (oauthToken: string) => {
      setToken(oauthToken);
      setAuthHeader(oauthToken);

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
    [clearSession, saveSession]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

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
    const hydrateUser = async (): Promise<void> => {
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setIsAuthLoading(false);
        return;
      }

      setAuthHeader(token);

      const hydrationTimeout = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("AUTH_CHECK_TIMEOUT")), 8000);
      });

      try {
        await Promise.race([refreshProfile(), hydrationTimeout]);
      } catch (error) {
        clearSession();
        if (error instanceof Error && error.message === "AUTH_CHECK_TIMEOUT") {
          toast.error("Session check timed out. Please login again.");
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    void hydrateUser();
  }, [token, clearSession, refreshProfile]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isAuthLoading,
      login,
      register,
      handleOAuthToken,
      logout,
      refreshProfile
    }),
    [user, token, isAuthenticated, isAuthLoading, login, register, handleOAuthToken, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
