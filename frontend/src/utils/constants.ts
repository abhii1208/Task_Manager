import { TaskPriority, TaskSortBy, TaskStage } from "../types/task";

export const TOKEN_STORAGE_KEY = "tm_token";
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api").replace(/\/$/, "");
export const GOOGLE_OAUTH_URL = `${API_BASE_URL}/auth/google`;

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
