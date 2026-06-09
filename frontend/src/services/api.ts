import axios from "axios";

import { API_BASE_URL } from "../config/env";
import { authToken } from "../utils/authToken";

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is missing. Set it to your backend URL ending in /api and redeploy the frontend.");
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json"
  }
});

export const setApiAuthToken = (token: string): void => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearApiAuthToken = (): void => {
  delete api.defaults.headers.common.Authorization;
};

api.interceptors.request.use((config) => {
  const token = authToken.get();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
