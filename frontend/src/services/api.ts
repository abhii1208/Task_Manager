import axios from "axios";

import { API_BASE_URL, TOKEN_STORAGE_KEY } from "../utils/constants";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const responseMessage = error.response?.data?.message as string | undefined;

    if (status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
      return Promise.reject(new Error("Session expired. Please login again."));
    }

    if (!error.response) {
      return Promise.reject(new Error("Network error. Please check if backend is running."));
    }

    const message = responseMessage ?? error.message ?? "Something went wrong";
    return Promise.reject(new Error(message));
  }
);
