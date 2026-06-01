import { TaskPriority, TaskSortBy, TaskStage } from "../types/task";

export const TOKEN_STORAGE_KEY = "tm_token";

const normalizeApiBaseUrl = (rawBaseUrl: string): string => {
  const withoutTrailingSlash = rawBaseUrl.replace(/\/+$/, "");

  if (!withoutTrailingSlash) {
    return withoutTrailingSlash;
  }

  if (withoutTrailingSlash.endsWith("/api")) {
    return withoutTrailingSlash;
  }

  if (withoutTrailingSlash.startsWith("http://") || withoutTrailingSlash.startsWith("https://") || withoutTrailingSlash.startsWith("/")) {
    return `${withoutTrailingSlash}/api`;
  }

  return withoutTrailingSlash;
};

const resolveApiBaseUrl = (): string => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredBaseUrl) {
    const normalizedApiBaseUrl = normalizeApiBaseUrl(configuredBaseUrl);

    if (import.meta.env.DEV && normalizedApiBaseUrl !== configuredBaseUrl.replace(/\/+$/, "")) {
      // eslint-disable-next-line no-console
      console.info("[API] Normalized VITE_API_BASE_URL to include /api", {
        original: configuredBaseUrl,
        normalized: normalizedApiBaseUrl
      });
    }

    return normalizedApiBaseUrl;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";

    if (isLocalHost) {
      return "http://localhost:5000/api";
    }
  }

  // eslint-disable-next-line no-console
  console.error(
    "VITE_API_BASE_URL is missing. Set it to your deployed backend URL including /api (example: https://your-backend.onrender.com/api)."
  );

  return "";
};

export const API_BASE_URL = resolveApiBaseUrl();
export const GOOGLE_OAUTH_URL = API_BASE_URL ? `${API_BASE_URL}/auth/google` : "";

export const STAGES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export const STAGE_LABELS: Record<TaskStage, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done"
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High"
};

export const SORT_OPTIONS: Array<{ value: `${TaskSortBy}:${"asc" | "desc"}`; label: string }> = [
  { value: "createdAt:desc", label: "Newest" },
  { value: "createdAt:asc", label: "Oldest" },
  { value: "dueDate:asc", label: "Due date" },
  { value: "priority:desc", label: "Priority" }
];

export const PAGE_SIZE_OPTIONS = [10, 20, 30];
