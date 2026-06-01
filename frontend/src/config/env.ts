const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
