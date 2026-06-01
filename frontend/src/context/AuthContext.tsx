import axios from "axios";
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { authService } from "../services/auth.service";
import { clearApiAuthToken, setApiAuthToken } from "../services/api";
import { LoginPayload, RegisterPayload, User } from "../types/auth";
import { LOGIN_REFRESH_FLAG, OAUTH_REFRESH_FLAG } from "../utils/authRefreshFlags";
import { authToken } from "../utils/authToken";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isBooting: boolean;
  authError: string | null;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  applySession: (token: string, user: User) => void;
  refreshUser: () => Promise<User | undefined>;
  clearSession: () => void;
  logout: () => void;
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
    sessionStorage.removeItem(LOGIN_REFRESH_FLAG);
    sessionStorage.removeItem(OAUTH_REFRESH_FLAG);
    clearApiAuthToken();
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
    setIsBooting(false);
  }, []);

  const applySession = useCallback((token: string, nextUser: User): void => {
    authToken.set(token);
    setApiAuthToken(token);
    setUser(nextUser);
    setIsAuthenticated(true);
    setAuthError(null);
    setIsBooting(false);
  }, []);

  const refreshUser = useCallback(async (): Promise<User | undefined> => {
    const existingToken = authToken.get();

    if (!existingToken) {
      clearSession();
      return undefined;
    }

    setApiAuthToken(existingToken);

    try {
      const profile = await authService.me();
      setUser(profile);
      setIsAuthenticated(true);
      setAuthError(null);
      setIsBooting(false);
      return profile;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        clearSession();
        return undefined;
      }

      setAuthError("Unable to verify session. Please retry.");
      setIsAuthenticated(false);
      setIsBooting(false);
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
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;
    let hasBootSettled = false;

    const timeoutId = window.setTimeout(() => {
      if (!isMounted || hasBootSettled) {
        return;
      }

      hasBootSettled = true;
      setIsBooting(false);
      setAuthError((previous) => previous ?? "Unable to verify session. Please retry.");
    }, AUTH_BOOT_TIMEOUT_MS);

    const finalizeBoot = (): void => {
      if (!isMounted || hasBootSettled) {
        return;
      }

      hasBootSettled = true;
      setIsBooting(false);
      window.clearTimeout(timeoutId);
    };

    const bootstrapAuth = async (): Promise<void> => {
      const existingToken = authToken.get();

      if (!existingToken) {
        if (!isMounted) {
          return;
        }

        clearSession();
        finalizeBoot();
        return;
      }

      setApiAuthToken(existingToken);

      try {
        await refreshUser();
      } catch {
        finalizeBoot();
      } finally {
        finalizeBoot();
      }
    };

    void bootstrapAuth();

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [clearSession, refreshUser]);

  // eslint-disable-next-line no-console
  console.log("[AuthContext]", { isAuthenticated, isBooting, hasUser: Boolean(user), authError });

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isBooting,
      authError,
      login,
      register,
      applySession,
      refreshUser,
      clearSession,
      logout
    }),
    [user, isAuthenticated, isBooting, authError, login, register, applySession, refreshUser, clearSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
