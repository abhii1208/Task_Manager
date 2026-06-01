const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export function getApiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

// Temporary deployment debugging signal for production and preview.
// eslint-disable-next-line no-console
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
