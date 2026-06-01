import axios from "axios";

import { API_BASE_URL, TOKEN_STORAGE_KEY } from "../utils/constants";

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info("API_BASE_URL:", API_BASE_URL);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  if (!API_BASE_URL) {
    return Promise.reject(
      new Error("API URL is not configured. Set VITE_API_BASE_URL to your deployed backend URL.")
    );
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("API request error:", error);
    }

    const status = error.response?.status as number | undefined;
    const responseMessage = error.response?.data?.message as string | undefined;
    const requestUrl = (error.config?.url as string | undefined) ?? "";
    const isAuthLoginRequest = requestUrl.includes("/auth/login");
    const hadToken = Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));

    if (status === 401 && !isAuthLoginRequest && hadToken) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
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
