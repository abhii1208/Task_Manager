import { PaginationMeta } from "./api";

export type TaskStage = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type TaskSortBy = "createdAt" | "updatedAt" | "dueDate" | "title" | "priority" | "stage";
export type TaskSortOrder = "asc" | "desc";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  stage: TaskStage;
  priority: TaskPriority;
  dueDate?: string | null;
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPayload {
  title: string;
  description?: string;
  stage: TaskStage;
  priority: TaskPriority;
  dueDate?: string | null;
  tags?: string[];
}

export type TaskUpdatePayload = Partial<TaskPayload>;

export interface TaskQueryParams {
  search?: string;
  stage?: TaskStage | "ALL";
  priority?: TaskPriority | "ALL";
  sortBy?: TaskSortBy;
  sortOrder?: TaskSortOrder;
  page?: number;
  limit?: number;
}

export interface TaskSummary {
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  completionRate: number;
  overdueTasks: number;
  upcomingTasks: number;
}

export interface ActivityTaskPreview {
  id: string;
  title: string;
  stage: TaskStage;
  priority: TaskPriority;
}

export interface ActivityLog {
  id: string;
  taskId?: string | null;
  task?: ActivityTaskPreview | null;
  userId: string;
  action: string;
  message: string;
  createdAt: string;
}

export interface TaskListResponse {
  tasks: Task[];
  meta: PaginationMeta;
}