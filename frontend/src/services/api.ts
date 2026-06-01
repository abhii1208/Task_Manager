import axios from "axios";

import { API_BASE_URL } from "../config/env";
import { TOKEN_STORAGE_KEY } from "../utils/constants";

const TOKEN_STORAGE_KEYS = [TOKEN_STORAGE_KEY, "taskflow_token", "token"] as const;

const getStoredToken = (): string | null => {
  for (const key of TOKEN_STORAGE_KEYS) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
};

const clearStoredTokens = (): void => {
  for (const key of TOKEN_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  if (!API_BASE_URL) {
    return Promise.reject(
      new Error("API URL is not configured. Set VITE_API_BASE_URL to your deployed backend URL.")
    );
  }

  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const responseMessage = error.response?.data?.message as string | undefined;
    const requestUrl = (error.config?.url as string | undefined) ?? "";
    const isAuthLoginRequest = requestUrl.includes("/auth/login");
    const hadToken = Boolean(getStoredToken());

    if (status === 401 && !isAuthLoginRequest && hadToken) {
      clearStoredTokens();
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
      return Promise.reject(new Error("Session expired. Please login again."));
    }

    if (error.response) {
      const message = responseMessage ?? error.message ?? "Something went wrong";
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(
        new Error("Unable to reach backend. Please check deployment configuration.")
      );
    }

    return Promise.reject(new Error(error.message ?? "Something went wrong. Please try again."));
  }
);

export const apiClient = api;
