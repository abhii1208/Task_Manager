import axios from "axios";

import { API_BASE_URL } from "../config/env";
import { clearToken, getToken } from "../utils/authToken";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

export const setAuthHeader = (token: string): void => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearAuthHeader = (): void => {
  delete api.defaults.headers.common.Authorization;
};

api.interceptors.request.use((config) => {
  if (!API_BASE_URL) {
    return Promise.reject(
      new Error("API URL is not configured. Set VITE_API_BASE_URL to your deployed backend URL.")
    );
  }

  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      clearAuthHeader();
      window.dispatchEvent(new Event("auth:session-expired"));
    }

    return Promise.reject(error);
  }
);

export const apiClient = api;
