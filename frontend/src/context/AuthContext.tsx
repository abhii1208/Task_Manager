import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { authService } from "../services/auth.service";
import { LoginPayload, RegisterPayload, User } from "../types/auth";
import { TOKEN_STORAGE_KEY } from "../utils/constants";

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
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const saveSession = useCallback((nextToken: string, nextUser: User): void => {
    localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    const profile = await authService.me();
    setUser(profile);
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
      localStorage.setItem(TOKEN_STORAGE_KEY, oauthToken);

      try {
        const profile = await authService.me();
        saveSession(oauthToken, profile);
      } catch (error) {
        clearSession();
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
        setIsAuthLoading(false);
        return;
      }

      try {
        await refreshProfile();
      } catch {
        clearSession();
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
      isAuthenticated: Boolean(user && token),
      isAuthLoading,
      login,
      register,
      handleOAuthToken,
      logout,
      refreshProfile
    }),
    [user, token, isAuthLoading, login, register, handleOAuthToken, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
