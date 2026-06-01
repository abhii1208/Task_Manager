import axios from "axios";

import { API_BASE_URL } from "../config/env";
import { TOKEN_STORAGE_KEY } from "../utils/constants";

const TOKEN_STORAGE_KEYS = ["taskflow_token", "token", TOKEN_STORAGE_KEY] as const;

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
    if (error?.response?.status === 401) {
      clearStoredTokens();
    }

    return Promise.reject(error);
  }
);

export const apiClient = api;
