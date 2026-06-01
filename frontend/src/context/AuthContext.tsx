import axios from "axios";
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { authService } from "../services/auth.service";
import { clearApiAuthToken, setApiAuthToken } from "../services/api";
import { LoginPayload, RegisterPayload, User } from "../types/auth";
import { authToken } from "../utils/authToken";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isBooting: boolean;
  authError: string | null;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  applySession: (token: string, user: User) => void;
  refreshUser: () => Promise<User>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_BOOT_TIMEOUT_MS = 5_000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    authToken.clear();
    clearApiAuthToken();
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  }, []);

  const applySession = useCallback((token: string, nextUser: User): void => {
    authToken.set(token);
    setApiAuthToken(token);
    setUser(nextUser);
    setIsAuthenticated(true);
    setAuthError(null);
    setIsBooting(false);
  }, []);

  const refreshUser = useCallback(async (): Promise<User> => {
    try {
      const profile = await authService.me();
      setUser(profile);
      setIsAuthenticated(true);
      setAuthError(null);
      return profile;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearSession();
      } else {
        setAuthError("We could not verify your session.");
      }

      throw error;
    }
  }, [clearSession]);

  const login = useCallback(
    async (payload: LoginPayload): Promise<User> => {
      const { token, user: nextUser } = await authService.login(payload);
      applySession(token, nextUser);
      return nextUser;
    },
    [applySession]
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      const { token, user: nextUser } = await authService.register(payload);
      applySession(token, nextUser);
      return nextUser;
    },
    [applySession]
  );

  const logout = useCallback(() => {
    clearSession();
    setIsBooting(false);
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;

    const timeoutId = window.setTimeout(() => {
      if (!isMounted) {
        return;
      }

      setIsBooting(false);
      setAuthError((prev) => prev ?? "Session check timed out. Retry or login again.");
    }, AUTH_BOOT_TIMEOUT_MS);

    const bootstrapAuth = async (): Promise<void> => {
      const existingToken = authToken.get();

      if (!existingToken) {
        if (!isMounted) {
          return;
        }

        setUser(null);
        setIsAuthenticated(false);
        setAuthError(null);
        setIsBooting(false);
        return;
      }

      setApiAuthToken(existingToken);

      try {
        const profile = await authService.me();

        if (!isMounted) {
          return;
        }

        setUser(profile);
        setIsAuthenticated(true);
        setAuthError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearSession();
        } else {
          setAuthError("We could not verify your session.");
        }
      } finally {
        if (isMounted) {
          setIsBooting(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [clearSession]);

  // eslint-disable-next-line no-console
  console.log("[AuthProvider]", { isBooting, isAuthenticated, hasUser: Boolean(user) });

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isBooting,
      authError,
      login,
      register,
      logout,
      applySession,
      refreshUser
    }),
    [user, isAuthenticated, isBooting, authError, login, register, logout, applySession, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
